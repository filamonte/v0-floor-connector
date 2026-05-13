const { test } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const authStatePath = path.resolve(
  process.env.PLAYWRIGHT_STORAGE_STATE ?? "playwright/.auth/local-user.json"
);

test("save local authenticated contractor state", async ({ page }) => {
  test.setTimeout(240_000);

  loadRootEnv();

  const email = process.env.FLOORCONNECTOR_E2E_EMAIL;
  const password = process.env.FLOORCONNECTOR_E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Playwright auth setup requires FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD for a real local contractor account."
    );
  }

  await loginWithEmail(page, email, password, {
    expectedPath: "/dashboard",
    verifyContent: false
  });
  await fs.mkdir(path.dirname(authStatePath), { recursive: true });
  await page.context().storageState({ path: authStatePath });
});
