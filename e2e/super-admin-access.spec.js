const { test, expect } = require("@playwright/test");
const fsSync = require("node:fs");

function requireStorageState(testInfo, key, label) {
  const storageStatePath = testInfo.project.use[key];

  if (!storageStatePath || !fsSync.existsSync(storageStatePath)) {
    throw new Error(
      `${label} storage state is missing. Run the matching setup project with real local credentials before this spec.`
    );
  }

  return storageStatePath;
}

async function gotoAppPath(page, path) {
  try {
    return await page.goto(path, { waitUntil: "domcontentloaded" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("net::ERR_ABORTED")) {
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      return null;
    }

    throw error;
  }
}

async function expectSuccessfulPageLoad(response, path) {
  if (!response) {
    return;
  }

  expect(response.status(), `${path} should not fail server-side`).toBeLessThan(
    400
  );
}

test("platform-admin user can access super-admin", async ({
  browser
}, testInfo) => {
  const storageState = requireStorageState(
    testInfo,
    "platformAdminStorageState",
    "Platform admin"
  );
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  const response = await gotoAppPath(page, "/super-admin");

  await expectSuccessfulPageLoad(response, "/super-admin");
  expect(new URL(page.url()).pathname).toBe("/super-admin");
  await expect(
    page.getByRole("heading", { name: "Platform configuration" })
  ).toBeVisible();
  await expect(page.getByText("Global scope")).toBeVisible();

  await context.close();
});

test("platform-admin user can review billing operations", async ({
  browser
}, testInfo) => {
  const storageState = requireStorageState(
    testInfo,
    "platformAdminStorageState",
    "Platform admin"
  );
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  const response = await gotoAppPath(page, "/super-admin/billing");

  await expectSuccessfulPageLoad(response, "/super-admin/billing");
  expect(new URL(page.url()).pathname).toBe("/super-admin/billing");
  await expect(page.getByText("Billing Operations").first()).toBeVisible();
  await expect(
    page.getByText("Stripe Configuration Health", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("Webhook Health", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Tenant Billing Status", { exact: true })
  ).toBeVisible();
  await expect(
    page.locator("p", { hasText: /^STRIPE_FOUNDER_PLAN_PRICE_ID$/ })
  ).toBeVisible();
  await expect(
    page.locator("p", { hasText: /^Platform billing price reference$/ })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create or discover test plan" })
  ).toBeVisible();

  await context.close();
});

test("early-access links durable billing operations", async ({
  browser
}, testInfo) => {
  const storageState = requireStorageState(
    testInfo,
    "platformAdminStorageState",
    "Platform admin"
  );
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  const response = await gotoAppPath(page, "/super-admin/early-access");

  await expectSuccessfulPageLoad(response, "/super-admin/early-access");
  await expect(
    page.getByRole("link", { name: "Billing Operations" })
  ).toHaveAttribute("href", "/super-admin/billing");

  await context.close();
});

test("contractor-only owner is denied super-admin", async ({
  browser
}, testInfo) => {
  const storageState = requireStorageState(
    testInfo,
    "contractorStorageState",
    "Contractor"
  );
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  const response = await gotoAppPath(page, "/super-admin");

  await expectSuccessfulPageLoad(response, "/super-admin denial redirect");
  await page.waitForURL((url) => url.pathname === "/dashboard");
  const url = new URL(page.url());
  expect(url.pathname).toBe("/dashboard");
  expect(url.searchParams.get("error")).toBe(
    "Platform admin access is required."
  );

  await context.close();
});

test("contractor-only owner can still access contractor app routes", async ({
  browser
}, testInfo) => {
  const storageState = requireStorageState(
    testInfo,
    "contractorStorageState",
    "Contractor"
  );
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  for (const path of ["/dashboard", "/projects", "/settings"]) {
    const response = await gotoAppPath(page, path);

    await expectSuccessfulPageLoad(response, path);
    await page.waitForURL((url) => url.pathname === path);
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page.locator("body")).not.toContainText("Log in with email");
  }

  await context.close();
});
