const { test } = require("@playwright/test");
const fs = require("node:fs/promises");
const path = require("node:path");

const {
  hasContractorStorageState,
  loadRootEnv,
  resolveContractorStorageStatePath
} = require("./auth-state");
const { loginWithEmail } = require("./auth-utils");

test("save local authenticated contractor state", async ({ page }) => {
  test.setTimeout(240_000);

  loadRootEnv();

  const authStatePath = resolveContractorStorageStatePath();
  const email = process.env.FLOORCONNECTOR_E2E_EMAIL;
  const password = process.env.FLOORCONNECTOR_E2E_PASSWORD;

  test.skip(
    !email && !password && hasContractorStorageState(),
    `Contractor storage state already exists at ${authStatePath}; skipping login refresh because FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD are not configured.`
  );

  test.skip(
    !email || !password,
    "Contractor auth setup requires FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD to generate storage state. Existing protected smoke can still reuse PLAYWRIGHT_STORAGE_STATE or .playwright/.auth/contractor.json."
  );

  await loginWithEmail(page, email, password, {
    expectedPath: "/dashboard",
    verifyContent: false
  });
  await fs.mkdir(path.dirname(authStatePath), { recursive: true });
  await page.context().storageState({ path: authStatePath });
});
