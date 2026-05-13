const { expect, test } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

function getPortalAuthStatePath() {
  return path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
      "playwright/.auth/portal-user.json"
  );
}

function getPortalFixtureState() {
  loadRootEnv();

  const storageStatePath = getPortalAuthStatePath();
  const hasStorageState = fs.existsSync(storageStatePath);
  const hasCredentials = Boolean(
    process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL &&
    process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD
  );

  return {
    storageStatePath,
    hasStorageState,
    hasCredentials
  };
}

async function newPortalPage(browser, baseURL) {
  const fixture = getPortalFixtureState();

  test.skip(
    !fixture.hasStorageState && !fixture.hasCredentials,
    "Portal smoke requires PLAYWRIGHT_PORTAL_STORAGE_STATE or FLOORCONNECTOR_PORTAL_E2E_EMAIL/FLOORCONNECTOR_PORTAL_E2E_PASSWORD for a real portal customer user. Run pnpm e2e:portal-fixture to validate canonical portal fixture state."
  );

  const context = await browser.newContext({
    baseURL,
    storageState: fixture.hasStorageState ? fixture.storageStatePath : undefined
  });
  const page = await context.newPage();

  if (!fixture.hasStorageState) {
    await loginWithEmail(
      page,
      process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
      process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD,
      {
        next: "/portal",
        expectedPath: "/portal"
      }
    );
  }

  return {
    page,
    context
  };
}

async function expectAuthenticatedPortalPage(page, headingPattern) {
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
  await expect(
    page
      .getByRole("heading", { name: headingPattern })
      .or(page.getByText(headingPattern).first())
      .first()
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(
    /access denied|not authorized/i
  );
}

async function getGrantedProjectPath(page) {
  const configuredProjectPath =
    process.env.FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH;

  if (configuredProjectPath) {
    return configuredProjectPath;
  }

  await page.goto("/portal");
  await expectAuthenticatedPortalPage(
    page,
    /Review the work your contractor has shared/i
  );

  const projectLink = page.locator('a[href^="/portal/projects/"]').first();
  const projectLinkCount = await projectLink.count();

  test.skip(
    projectLinkCount === 0,
    "Portal project smoke requires a real active portal_project_access grant with at least one visible project. Run pnpm e2e:portal-fixture to validate or create the canonical fixture."
  );

  return await projectLink.getAttribute("href");
}

async function getProjectRecordPath(
  page,
  recordType,
  configuredPath,
  configuredEnvName,
  selector
) {
  if (configuredPath) {
    return configuredPath;
  }

  const projectPath = await getGrantedProjectPath(page);
  await page.goto(projectPath);
  await expectAuthenticatedPortalPage(page, /Shared Project Workspace/i);

  const recordLink = page.locator(selector).first();
  const recordLinkCount = await recordLink.count();

  test.skip(
    recordLinkCount === 0,
    `Portal ${recordType} smoke requires a granted project with a shared ${recordType} link, or a configured ${configuredEnvName} route override. Run pnpm e2e:portal-fixture to validate or create the canonical fixture.`
  );

  return await recordLink.getAttribute("href");
}

test.describe("portal golden workflow smoke", () => {
  test("portal home loads for a real authenticated customer session", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto("/portal");
      await expectAuthenticatedPortalPage(
        page,
        /Review the work your contractor has shared/i
      );
      await expect(
        page.getByText(/You can only see projects explicitly shared/i)
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal customer is not bootstrapped into contractor workspace", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/portal(?:\?|$)/);
      await expectAuthenticatedPortalPage(
        page,
        /Review the work your contractor has shared/i
      );
    } finally {
      await context.close();
    }
  });

  test("granted portal project workspace loads from portal home", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const projectPath = await getGrantedProjectPath(page);
      await page.goto(projectPath);
      await expectAuthenticatedPortalPage(page, /Shared Project Workspace/i);
      await expect(
        page.getByText("Commercial Records", { exact: true })
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal estimate review loads when a shared estimate fixture exists", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const estimatePath = await getProjectRecordPath(
        page,
        "estimate",
        process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH",
        'a[href^="/portal/estimates/"]'
      );

      await page.goto(estimatePath);
      await expectAuthenticatedPortalPage(page, /Estimate Review/i);
      await expect(
        page.getByText("Proposal Scope", { exact: true })
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal contract review loads when a shared contract fixture exists", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const contractPath = await getProjectRecordPath(
        page,
        "contract",
        process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH",
        'a[href^="/portal/contracts/"]'
      );

      await page.goto(contractPath);
      await expectAuthenticatedPortalPage(page, /Contract Review/i);
      await expect(
        page.getByText("Signature Actions", { exact: true })
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal invoice review loads without starting checkout when a shared invoice fixture exists", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const invoicePath = await getProjectRecordPath(
        page,
        "invoice",
        process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH",
        'a[href^="/portal/invoices/"]'
      );

      await page.goto(invoicePath);
      await expectAuthenticatedPortalPage(page, /Invoice Review/i);
      await expect(page.getByText(/Payment Actions/i)).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("unauthorized portal project path is denied only when a negative fixture is configured", async ({
    browser,
    baseURL
  }) => {
    loadRootEnv();
    const unauthorizedPath =
      process.env.FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH;

    test.skip(
      !unauthorizedPath,
      "Unauthorized portal smoke requires FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH pointing to a project outside the portal user's grants."
    );

    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const response = await page.goto(unauthorizedPath);

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      expect([200, 404]).toContain(response?.status());
      await expect(page.locator("body")).toContainText(
        /404|not found|could not be found/i
      );
    } finally {
      await context.close();
    }
  });
});
