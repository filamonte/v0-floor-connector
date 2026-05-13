const { test } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const portalAuthStatePath = path.resolve(
  process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
    "playwright/.auth/portal-user.json"
);

test("save local authenticated portal customer state", async ({ page }) => {
  test.setTimeout(240_000);

  loadRootEnv();

  const email = process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL;
  const password = process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD;

  test.skip(
    !email || !password,
    "Portal auth setup requires FLOORCONNECTOR_PORTAL_E2E_EMAIL and FLOORCONNECTOR_PORTAL_E2E_PASSWORD for a real customer portal user. Run pnpm e2e:portal-fixture first to validate canonical portal grant state."
  );

  await loginWithEmail(page, email, password, {
    next: "/portal",
    expectedPath: "/portal",
    verifyContent: false
  });
  await fs.mkdir(path.dirname(portalAuthStatePath), { recursive: true });
  await page.context().storageState({ path: portalAuthStatePath });
});
