const { test } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const platformAdminAuthStatePath = path.resolve(
  process.env.PLAYWRIGHT_PLATFORM_ADMIN_STORAGE_STATE ??
    "playwright/.auth/platform-admin.json"
);

test("save local authenticated platform-admin state", async ({ page }) => {
  test.setTimeout(240_000);

  loadRootEnv();

  const email =
    process.env.FLOORCONNECTOR_PLATFORM_E2E_EMAIL ??
    process.env.PLATFORM_SUPER_ADMIN_EMAIL;
  const password = process.env.FLOORCONNECTOR_PLATFORM_E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Playwright platform-admin auth setup requires FLOORCONNECTOR_PLATFORM_E2E_EMAIL or PLATFORM_SUPER_ADMIN_EMAIL, plus FLOORCONNECTOR_PLATFORM_E2E_PASSWORD for a real local platform-admin account."
    );
  }

  await loginWithEmail(page, email, password, {
    expectedPath: "/super-admin",
    verifyContent: false
  });
  await fs.mkdir(path.dirname(platformAdminAuthStatePath), { recursive: true });
  await page.context().storageState({ path: platformAdminAuthStatePath });
});
