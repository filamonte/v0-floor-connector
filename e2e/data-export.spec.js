const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

test("contractor owner/admin can open Data Export and download CSV", async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-protected",
    "Contractor export smoke runs only in the protected contractor project."
  );

  const response = await page.goto("/settings/export", {
    waitUntil: "domcontentloaded"
  });

  expect(response?.status(), "settings export should render").toBeLessThan(400);
  await expect(page.getByRole("heading", { name: "Data Export" })).toBeVisible();
  await expect(page.getByText("Your data stays portable.")).toBeVisible();
  await expect(page.getByText("Customer PII")).toBeVisible();
  await expect(page.getByText("Payment safety")).toBeVisible();
  await expect(page.getByRole("link", { name: "Export CSV" }).first()).toBeVisible();

  const exportModules = ["customers", "projects", "invoices", "payments"];
  const exportResponses = [];

  for (const exportModule of exportModules) {
    const exportResponse = await page.request.get(
      `/settings/export/${exportModule}?format=csv`
    );

    expect(exportResponse.status(), `${exportModule} export status`).toBe(200);
    expect(exportResponse.headers()["content-type"]).toContain("text/csv");
    expect(exportResponse.headers()["content-disposition"]).toContain(
      exportModule
    );

    exportResponses.push({ exportModule, exportResponse });
  }

  const customersExport = exportResponses.find(
    ({ exportModule }) => exportModule === "customers"
  );
  const body = await customersExport.exportResponse.text();
  expect(body).toContain("Customer ID,Customer name,Company name");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("Recent export history")).toBeVisible();

  if ((await page.getByText("Export history pending migration").count()) === 0) {
    await expect(page.getByText("Payments summary").first()).toBeVisible();
    await expect(page.getByText("CSV").first()).toBeVisible();
    await expect(page.getByText(/rows|No row count/).first()).toBeVisible();
  } else {
    await expect(page.getByText("Export history pending migration")).toBeVisible();
  }
});

test("unauthenticated users cannot open Data Export", async ({
  page
}, testInfo) => {
  test.skip(
    true,
    "Local dev QA currently auto-resolves a contractor session even in a new public context; keep unauthenticated export redirect for a future non-dev auth harness."
  );

  await page.goto("/settings/export", { waitUntil: "domcontentloaded" });

  expect(new URL(page.url()).pathname).toBe("/login");
});

function getPortalAuthStatePath() {
  return path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
      "playwright/.auth/portal-user.json"
  );
}

test("portal customers cannot open contractor Data Export", async ({
  browser
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium-portal",
    "Portal boundary runs only with the portal customer project."
  );

  const portalStorageState = getPortalAuthStatePath();

  test.skip(
    !fs.existsSync(portalStorageState),
    "Portal export boundary requires a saved portal customer storage state from pnpm e2e:portal-auth."
  );

  const context = await browser.newContext({
    storageState: portalStorageState
  });
  const page = await context.newPage();

  await page.goto("/settings/export", {
    waitUntil: "domcontentloaded"
  });

  await expect(page.getByRole("heading", { name: "Customer Portal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data Export" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Export CSV" })).toHaveCount(0);
  await expect(page.getByText("Recent export history")).toHaveCount(0);

  await context.close();
});
