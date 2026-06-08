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

async function expectNoHorizontalPageOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    )
  }));

  expect(
    metrics.scrollWidth,
    `${label} should not create page-level horizontal overflow`
  ).toBeLessThanOrEqual(metrics.clientWidth + 2);
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
  await expectAuthenticatedPortalPage(page, /Shared Project/i);

  const recordLinks = page.locator(selector);
  const recordLinkCount = await recordLinks.count();

  test.skip(
    recordLinkCount === 0,
    `Portal ${recordType} smoke requires a granted project with a shared ${recordType} link, or a configured ${configuredEnvName} route override. Run pnpm e2e:portal-fixture to validate or create the canonical fixture.`
  );

  return await recordLinks.last().getAttribute("href");
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
        page.getByText(/You can only see projects your contractor has shared/i)
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
      await expectAuthenticatedPortalPage(page, /Shared Project/i);
      await expect(
        page.getByText("Shared project items", { exact: true })
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
      await expect(page.getByText(/Pay this invoice/i)).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal change order review loads when a shared change-order fixture exists", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const changeOrderPath = await getProjectRecordPath(
        page,
        "change order",
        process.env.FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH",
        'a[href^="/portal/change-orders/"]'
      );

      await page.goto(changeOrderPath);
      await expectAuthenticatedPortalPage(page, /Change Order Review/i);
      await expect(
        page.getByText("Decision Actions", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /approve change order/i })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /reject change order/i })
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("portal shared records expose customer-safe print views", async ({
    browser,
    baseURL
  }) => {
    test.setTimeout(180_000);

    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const records = [
        {
          label: "estimate",
          path: await getProjectRecordPath(
            page,
            "estimate",
            process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
            "FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH",
            'a[href^="/portal/estimates/"]'
          )
        },
        {
          label: "contract",
          path: await getProjectRecordPath(
            page,
            "contract",
            process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
            "FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH",
            'a[href^="/portal/contracts/"]'
          )
        },
        {
          label: "invoice",
          path: await getProjectRecordPath(
            page,
            "invoice",
            process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
            "FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH",
            'a[href^="/portal/invoices/"]'
          )
        }
      ];

      for (const record of records) {
        await page.goto(record.path);
        await expect(
          page.getByRole("link", { name: /print|save pdf/i }),
          `Portal ${record.label} review should expose the print action`
        ).toBeVisible();

        const response = await page.goto(`${record.path}/pdf`, {
          waitUntil: "domcontentloaded"
        });
        expect(
          response?.status(),
          `${record.path}/pdf should load`
        ).toBeLessThan(400);
        await expect(
          page.getByRole("main", { name: /customer document/i })
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: /print|save pdf/i })
        ).toBeVisible();
        const printView = page.getByTestId("customer-document-print-view");
        await expect(printView).toContainText(/Customer document/i);
        await expect(
          page.getByTestId("customer-document-brand-name")
        ).not.toHaveText("Your contractor");
      }
    } finally {
      await context.close();
    }
  });

  test("portal review routes stay readable at mobile width", async ({
    browser,
    baseURL
  }) => {
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.setViewportSize({ width: 390, height: 844 });

      await page.goto("/portal");
      await expectAuthenticatedPortalPage(
        page,
        /Review the work your contractor has shared/i
      );
      await expectNoHorizontalPageOverflow(page, "Portal home mobile layout");

      const projectPath = await getGrantedProjectPath(page);
      await page.goto(projectPath);
      await expectAuthenticatedPortalPage(page, /Shared Project/i);
      await expectNoHorizontalPageOverflow(
        page,
        "Portal project mobile layout"
      );

      const estimatePath = await getProjectRecordPath(
        page,
        "estimate",
        process.env.FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH",
        'a[href^="/portal/estimates/"]'
      );
      await page.goto(estimatePath);
      await expectAuthenticatedPortalPage(page, /Estimate Review/i);
      await expectNoHorizontalPageOverflow(
        page,
        "Portal estimate mobile layout"
      );

      const contractPath = await getProjectRecordPath(
        page,
        "contract",
        process.env.FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH",
        'a[href^="/portal/contracts/"]'
      );
      await page.goto(contractPath);
      await expectAuthenticatedPortalPage(page, /Contract Review/i);
      await expectNoHorizontalPageOverflow(
        page,
        "Portal contract mobile layout"
      );

      const invoicePath = await getProjectRecordPath(
        page,
        "invoice",
        process.env.FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH",
        'a[href^="/portal/invoices/"]'
      );
      await page.goto(invoicePath);
      await expectAuthenticatedPortalPage(page, /Invoice Review/i);
      await expectNoHorizontalPageOverflow(
        page,
        "Portal invoice mobile layout"
      );

      const changeOrderPath = await getProjectRecordPath(
        page,
        "change order",
        process.env.FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH,
        "FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH",
        'a[href^="/portal/change-orders/"]'
      );
      await page.goto(changeOrderPath);
      await expectAuthenticatedPortalPage(page, /Change Order Review/i);
      await expectNoHorizontalPageOverflow(
        page,
        "Portal change order mobile layout"
      );
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
