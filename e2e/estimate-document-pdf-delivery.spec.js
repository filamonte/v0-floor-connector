const { test, expect } = require("@playwright/test");

const protectedDocuments = [
  {
    label: "estimate",
    path:
      process.env.FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH ??
      "/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e"
  },
  {
    label: "contract",
    path:
      process.env.FLOORCONNECTOR_E2E_CONTRACT_DETAIL_PATH ??
      "/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8"
  },
  {
    label: "invoice",
    path:
      process.env.FLOORCONNECTOR_E2E_INVOICE_DETAIL_PATH ??
      "/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7"
  }
];

async function expectAuthenticatedDocument(page, path) {
  const response = await page.goto(`${path}/pdf`, { waitUntil: "domcontentloaded" });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Document delivery checks require authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

    expect(response?.status(), `${path}/pdf should load successfully`).toBeLessThan(400);
}

for (const document of protectedDocuments) {
  test(`protected ${document.label} document route renders a printable PDF view`, async ({
    page
  }) => {
    await expectAuthenticatedDocument(page, document.path);

    await expect(page.getByRole("main", { name: /customer document/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /print|save pdf/i })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Customer document/i);
    await expect(page.locator("body")).not.toContainText(/Workflow Actions|Record a payment|Internal work/i);
  });
}

test("record detail pages expose customer-facing document actions", async ({ page }) => {
  for (const document of protectedDocuments) {
    const response = await page.goto(document.path, { waitUntil: "domcontentloaded" });

    if (new URL(page.url()).pathname.startsWith("/login")) {
      throw new Error(
        "Document action checks require authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
      );
    }

    expect(response?.status(), `${document.path} should load successfully`).toBeLessThan(400);
    await expect(page.getByRole("link", { name: /print|save pdf/i })).toBeVisible();
  }
});
