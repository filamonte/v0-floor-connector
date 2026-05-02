const { test, expect } = require("@playwright/test");
const path = require("node:path");

const authStatePath = path.resolve(
  process.env.PLAYWRIGHT_STORAGE_STATE ?? "playwright/.auth/local-user.json"
);

test("save local authenticated contractor state", async ({ page }) => {
  const email = process.env.FLOORCONNECTOR_E2E_EMAIL;
  const password = process.env.FLOORCONNECTOR_E2E_PASSWORD;

  test.skip(
    !email || !password,
    "Set FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD to create saved auth state."
  );

  await page.goto("/login");

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.locator('button[type="submit"]').first().click();

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
  await expect(page.locator("body")).toContainText(/Dashboard|FloorConnector/i);
  await page.context().storageState({ path: authStatePath });
});
