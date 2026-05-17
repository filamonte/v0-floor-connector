const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("@playwright/test");

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const outDir = path.resolve("tmp-visual-audit-phase3");
fs.mkdirSync(outDir, { recursive: true });

function loadRootEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;

  const envText = fs.readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;

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
  contractor: path.resolve("playwright/.auth/local-user.json"),
  portal: path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ?? "playwright/.auth/portal-user.json"
  )
};

const redirectAliases = new Map([["/materials", "/cost-items-database/items"]]);

function slug(route, viewportName) {
  return `${viewportName}-${route
    .replace(/^\/$/, "home")
    .replace(/^\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-$/, "") || "home"}`;
}

function authStateLabel(storageState) {
  return path.relative(process.cwd(), storageState);
}

async function contextFor(browser, storageState, viewport) {
  if (!fs.existsSync(storageState)) return null;
  return browser.newContext({
    baseURL,
    storageState,
    viewport
  });
}

async function auditRoute(browser, route, group, storageState, viewportName, viewport, screenshot = true) {
  const context = await contextFor(browser, storageState, viewport);
  if (!context) {
    return {
      requestedRoute: route,
      finalPath: null,
      group,
      viewport: viewportName,
      checked: false,
      authState: authStateLabel(storageState),
      method: "blocked",
      keyFinding: `Missing storage state: ${authStateLabel(storageState)}`,
      changed: false
    };
  }

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const navigationRoute = redirectAliases.get(route) ?? route;
  const result = {
    requestedRoute: route,
    group,
    viewport: viewportName,
    checked: true,
    authState: authStateLabel(storageState),
    method: "DOM smoke",
    changed:
      group === "setup" ||
      route === "/materials" ||
      group === "portal"
  };

  try {
    const response = await page.goto(navigationRoute, {
      waitUntil: "domcontentloaded",
      timeout: 45000
    });
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});

    const url = new URL(page.url());
    const body = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    const firstH1 = await page.locator("h1").first().innerText({ timeout: 1000 }).catch(() => "");
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      interactiveCount: document.querySelectorAll("button,a,input,select,textarea").length
    }));

    const requestedPath = new URL(route, baseURL).pathname;
    const redirectedToLogin = url.pathname.startsWith("/login") && !requestedPath.startsWith("/login");
    const redirectedElsewhere = url.pathname !== requestedPath && !redirectedToLogin;

    result.status = response?.status() ?? null;
    result.finalPath = url.pathname;
    result.finalUrl = page.url();
    result.firstH1 = firstH1;
    result.consoleErrors = consoleErrors;
    result.hasHorizontalOverflow = metrics.scrollWidth > metrics.clientWidth + 2;
    result.interactiveCount = metrics.interactiveCount;
    result.redirected = redirectedElsewhere || redirectedToLogin;
    result.notableRedirect = redirectedElsewhere ? `${requestedPath} -> ${url.pathname}` : null;
    result.redirectAliasUsed = redirectAliases.has(route);

    if (redirectedToLogin) {
      result.checked = false;
      result.method = "blocked";
      result.keyFinding = "Redirected to login; auth state did not authorize this route.";
    } else if (result.status && result.status >= 400) {
      result.checked = false;
      result.method = "blocked";
      result.keyFinding = `HTTP ${result.status}; route did not render normally.`;
    } else if (/Application error|Unhandled Runtime Error/i.test(body)) {
      result.keyFinding = "Rendered application error text.";
    } else if (consoleErrors.length) {
      result.keyFinding = `Rendered with ${consoleErrors.length} console/page error(s).`;
    } else if (result.hasHorizontalOverflow) {
      result.keyFinding = "Rendered, but page-level horizontal overflow detected.";
    } else if (redirectedElsewhere) {
      result.keyFinding = firstH1
        ? `Redirected to ${url.pathname} and rendered: ${firstH1}`
        : `Redirected to ${url.pathname} and rendered without a first h1.`;
    } else {
      result.keyFinding = firstH1 ? `Rendered: ${firstH1}` : "Rendered without a first h1.";
    }

    if (screenshot && result.checked) {
      const screenshotPath = path.join(outDir, `${group}-${slug(route, viewportName)}.png`);
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

async function discoverPortalRoutes(browser) {
  const routes = [
    "/portal",
    process.env.FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
    process.env.FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH
  ].filter(Boolean);

  const context = await contextFor(browser, states.portal, { width: 1440, height: 1200 });
  if (!context) return [...new Set(routes)];

  const page = await context.newPage();
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
      for (const selector of [
        'a[href^="/portal/estimates/"]',
        'a[href^="/portal/contracts/"]',
        'a[href^="/portal/invoices/"]',
        'a[href^="/portal/change-orders/"]'
      ]) {
        const href = await page.locator(selector).first().getAttribute("href").catch(() => null);
        if (href) routes.push(href);
      }
    }
  } catch {}
  await context.close();
  return [...new Set(routes)];
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktop = { width: 1440, height: 1200 };
  const mobile = { width: 390, height: 844 };
  const matrix = [];

  for (const route of ["/setup/company", "/setup/billing", "/setup/pending-activation"]) {
    matrix.push(await auditRoute(browser, route, "setup", states.contractor, "desktop", desktop));
  }

  matrix.push(await auditRoute(browser, "/materials", "contractor", states.contractor, "desktop", desktop));

  const portalRoutes = await discoverPortalRoutes(browser);
  for (const route of portalRoutes) {
    matrix.push(await auditRoute(browser, route, "portal", states.portal, "desktop", desktop));
  }
  for (const route of portalRoutes) {
    matrix.push(await auditRoute(browser, route, "portal", states.portal, "mobile", mobile, false));
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
