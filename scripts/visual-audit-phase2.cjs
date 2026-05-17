const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const outDir = path.resolve("tmp-visual-audit-phase2");
fs.mkdirSync(outDir, { recursive: true });

function loadRootEnv() {
  const envPath = path.resolve(".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envText = fs.readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadRootEnv();

const states = {
  public: undefined,
  contractor: path.resolve("playwright/.auth/local-user.json"),
  platform: path.resolve("playwright/.auth/platform-admin.json"),
  portal: path.resolve("playwright/.auth/portal-user.json")
};

const publicRoutes = ["/", "/login", "/signup"];
const setupRoutes = ["/setup/company", "/setup/billing", "/setup/pending-activation"];
const contractorRoutes = [
  "/dashboard",
  "/leads",
  "/customers",
  "/projects",
  "/estimates",
  "/change-orders",
  "/contracts",
  "/invoices",
  "/payments",
  "/schedule",
  "/jobs",
  "/daily-logs",
  "/people",
  "/vendors",
  "/time",
  "/materials",
  "/settings"
];
const knownDetails = [
  "/projects/797ec5b1-4417-4a36-934e-e82498efef5a",
  "/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e",
  "/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e/edit",
  "/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8",
  "/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7",
  "/jobs/acd2daf7-0d02-4196-99d2-1a4164095886"
];
const portalRoutes = [
  "/portal",
  process.env.FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH,
  process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
  process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
  process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
  process.env.FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH
].filter(Boolean);
const superAdminRoutes = [
  "/super-admin",
  "/super-admin/platform",
  "/super-admin/templates",
  "/super-admin/catalogs",
  "/super-admin/modules",
  "/super-admin/early-access",
  "/super-admin/billing",
  "/super-admin/packages",
  "/super-admin/groups"
];

const redirectAliases = new Map([
  ["/materials", "/cost-items-database/items"]
]);

const changedRoutes = new Set([
  "/setup/pending-activation",
  "/leads",
  "/customers",
  "/projects",
  "/estimates",
  "/change-orders",
  "/contracts",
  "/invoices",
  "/payments",
  "/schedule",
  "/jobs",
  "/daily-logs",
  "/people",
  "/vendors",
  "/time",
  "/projects/797ec5b1-4417-4a36-934e-e82498efef5a",
  "/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e",
  "/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8",
  "/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7",
  "/jobs/acd2daf7-0d02-4196-99d2-1a4164095886",
  "/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308",
  "/customers/7a5dae8f-e2da-45c2-bff3-1b1a33a8d0a8",
  "/change-orders/e62d20f5-e741-42f6-a2cb-d84950cb9734",
  "/daily-logs/a175b37f-2734-434b-b64f-c10671dff90d",
  "/materials",
  "/super-admin/billing"
]);

function slug(route) {
  return route.replace(/^\/$/, "home").replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/-$/, "") || "home";
}

async function makeContext(browser, storageState) {
  if (!storageState) {
    return browser.newContext({ baseURL, viewport: { width: 1440, height: 1200 } });
  }
  if (!fs.existsSync(storageState)) {
    return null;
  }
  return browser.newContext({
    baseURL,
    storageState,
    viewport: { width: 1440, height: 1200 }
  });
}

function getAuthStateLabel(storageState) {
  if (!storageState) {
    return "none";
  }

  return path.relative(process.cwd(), storageState);
}

async function auditRoute(browser, group, route, storageState, screenshot = false) {
  const context = await makeContext(browser, storageState);
  if (!context) {
    return {
      requestedRoute: route,
      finalPath: null,
      group,
      checked: false,
      authState: getAuthStateLabel(storageState),
      method: "blocked",
      keyFinding: `Missing storage state: ${path.relative(process.cwd(), storageState)}`,
      changed: false
    };
  }

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const result = {
    requestedRoute: route,
    group,
    checked: true,
    authState: getAuthStateLabel(storageState),
    method: "DOM smoke",
    changed: changedRoutes.has(route)
  };
  try {
    const navigationRoute = redirectAliases.get(route) ?? route;
    const response = await page.goto(navigationRoute, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
    const body = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    const title = await page.locator("h1").first().innerText({ timeout: 1000 }).catch(() => "");
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      interactiveCount: document.querySelectorAll("button,a,input,select,textarea").length
    }));
    const url = new URL(page.url());
    const requestedPath = new URL(route, baseURL).pathname;
    const redirectedToLogin = url.pathname.startsWith("/login") && !requestedPath.startsWith("/login");
    const redirectedElsewhere =
      url.pathname !== requestedPath && !redirectedToLogin;
    const status = response ? response.status() : null;

    result.status = status;
    result.finalPath = url.pathname;
    result.finalUrl = page.url();
    result.firstH1 = title;
    result.consoleErrors = consoleErrors;
    result.hasHorizontalOverflow = metrics.scrollWidth > metrics.clientWidth + 2;
    result.interactiveCount = metrics.interactiveCount;
    result.redirected = redirectedElsewhere || redirectedToLogin;
    result.notableRedirect = redirectedElsewhere ? `${requestedPath} -> ${url.pathname}` : null;
    result.redirectAliasUsed = redirectAliases.has(route);

    if (redirectedToLogin) {
      result.checked = false;
      result.method = "blocked";
      result.keyFinding = "Redirected to login; authenticated route state did not authorize this route.";
    } else if (status && status >= 400) {
      result.checked = false;
      result.method = "blocked";
      result.keyFinding = `HTTP ${status}; route did not render normally.`;
    } else if (/Application error|Unhandled Runtime Error/i.test(body)) {
      result.keyFinding = "Rendered application error text.";
    } else if (consoleErrors.length) {
      result.keyFinding = `Rendered with ${consoleErrors.length} console/page error(s).`;
    } else if (result.hasHorizontalOverflow) {
      result.keyFinding = "Rendered, but page-level horizontal overflow detected.";
    } else if (redirectedElsewhere) {
      result.keyFinding = title
        ? `Redirected to ${url.pathname} and rendered: ${title}`
        : `Redirected to ${url.pathname} and rendered without a first h1.`;
    } else {
      result.keyFinding = title ? `Rendered: ${title}` : "Rendered without a first h1.";
    }

    if (screenshot && result.checked) {
      const screenshotPath = path.join(outDir, `${group}-${slug(route)}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false, caret: "initial" });
      result.method = "browser screenshot + DOM smoke";
      result.screenshot = path.relative(process.cwd(), screenshotPath);
    }
  } catch (error) {
    result.checked = false;
    result.method = "blocked";
    result.keyFinding = error.message;
  } finally {
    await context.close();
  }
  return result;
}

async function discoverFirstLinks(browser, routes) {
  const context = await makeContext(browser, states.contractor);
  if (!context) return [];
  const page = await context.newPage();
  const discovered = [];
  for (const route of routes) {
    try {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45000 });
      const href = await page
        .locator(`a[href^="${route}/"]`)
        .evaluateAll((links, prefix) => {
          const found = links
            .map((link) => link.getAttribute("href"))
            .filter(Boolean)
            .filter((value) => value.startsWith(prefix + "/") && !value.includes("?") && !value.includes("#"));
          return [...new Set(found)][0] ?? null;
        }, route);
      if (href) discovered.push(href);
    } catch {}
  }
  await context.close();
  return discovered;
}

async function discoverPortalRoutes(browser) {
  const context = await makeContext(browser, states.portal);
  if (!context) return ["/portal"];

  const page = await context.newPage();
  const routes = ["/portal"];

  try {
    await page.goto("/portal", { waitUntil: "domcontentloaded", timeout: 45000 });
    const projectHref = await page
      .locator('a[href^="/portal/projects/"]')
      .first()
      .getAttribute("href")
      .catch(() => null);

    if (projectHref) {
      routes.push(projectHref);
      await page.goto(projectHref, { waitUntil: "domcontentloaded", timeout: 45000 });

      const recordSelectors = [
        'a[href^="/portal/estimates/"]',
        'a[href^="/portal/contracts/"]',
        'a[href^="/portal/invoices/"]',
        'a[href^="/portal/change-orders/"]'
      ];

      for (const selector of recordSelectors) {
        const href = await page
          .locator(selector)
          .first()
          .getAttribute("href")
          .catch(() => null);

        if (href) {
          routes.push(href);
        }
      }
    }
  } catch {}

  await context.close();
  return [...new Set(routes)];
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const screenshotRoutes = new Set([
    "/",
    "/login",
    "/dashboard",
    "/projects",
    "/schedule",
    "/settings",
    "/super-admin",
    "/super-admin/billing",
    "/portal",
    process.env.FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH
  ]);

  const discoveredDetails = await discoverFirstLinks(browser, [
    "/leads",
    "/customers",
    "/change-orders",
    "/daily-logs",
    "/people",
    "/vendors",
    "/time"
  ]);
  const discoveredPortalRoutes = await discoverPortalRoutes(browser);

  const matrix = [];
  for (const route of publicRoutes) {
    matrix.push(await auditRoute(browser, "public", route, states.public, screenshotRoutes.has(route)));
  }
  for (const route of setupRoutes) {
    matrix.push(await auditRoute(browser, "setup", route, states.contractor, screenshotRoutes.has(route)));
  }
  for (const route of contractorRoutes) {
    matrix.push(await auditRoute(browser, "contractor", route, states.contractor, screenshotRoutes.has(route)));
  }
  for (const route of [...new Set([...knownDetails, ...discoveredDetails])]) {
    matrix.push(await auditRoute(browser, "detail", route, states.contractor, false));
  }
  for (const route of [...new Set([...portalRoutes, ...discoveredPortalRoutes])]) {
    matrix.push(await auditRoute(browser, "portal", route, states.portal, screenshotRoutes.has(route)));
  }
  for (const route of superAdminRoutes) {
    matrix.push(await auditRoute(browser, "super-admin", route, states.platform, screenshotRoutes.has(route)));
  }

  await browser.close();
  const report = {
    generatedAt: new Date().toISOString(),
    baseURL,
    counts: {
      total: matrix.length,
      checked: matrix.filter((item) => item.checked).length,
      blocked: matrix.filter((item) => !item.checked).length,
      withScreenshots: matrix.filter((item) => item.screenshot).length
    },
    matrix
  };
  const reportPath = path.join(outDir, "route-audit.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        generatedAt: report.generatedAt,
        baseURL: report.baseURL,
        counts: report.counts,
        reportPath: path.relative(process.cwd(), reportPath)
      },
      null,
      2
    )
  );
})();
