const { test, expect } = require("@playwright/test");
const { resolveFirstLinkedDetailPath } = require("./protected-route-utils");

const protectedDocuments = [
  {
    label: "estimate",
    configuredPath: process.env.FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH,
    listPath: "/estimates",
    hrefPrefix: "/estimates/"
  },
  {
    label: "contract",
    configuredPath: process.env.FLOORCONNECTOR_E2E_CONTRACT_DETAIL_PATH,
    listPath: "/contracts",
    hrefPrefix: "/contracts/"
  },
  {
    label: "invoice",
    configuredPath: process.env.FLOORCONNECTOR_E2E_INVOICE_DETAIL_PATH,
    listPath: "/invoices",
    hrefPrefix: "/invoices/"
  }
];

async function resolveProtectedDocumentPath(page, document) {
  if (document.configuredPath) {
    return document.configuredPath;
  }

  return resolveFirstLinkedDetailPath(page, {
    listPath: document.listPath,
    hrefPrefix: document.hrefPrefix,
    label: `${document.label} document smoke`
  });
}

async function expectAuthenticatedDocument(page, path) {
  const response = await page.goto(`${path}/pdf`, {
    waitUntil: "domcontentloaded"
  });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Document delivery checks require authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  expect(
    response?.status(),
    `${path}/pdf should load successfully`
  ).toBeLessThan(400);
}

for (const document of protectedDocuments) {
  test(`protected ${document.label} document route renders a printable PDF view`, async ({
    page
  }) => {
    const documentPath = await resolveProtectedDocumentPath(page, document);

    await expectAuthenticatedDocument(page, documentPath);

    await expect(
      page.getByRole("main", { name: /customer document/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /print|save pdf/i })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(/Customer document/i);
    await expect(page.locator("body")).not.toContainText(
      /Workflow Actions|Record a payment|Internal work/i
    );
  });
}

test("record detail pages expose customer-facing document actions", async ({
  page
}) => {
  for (const document of protectedDocuments) {
    const documentPath = await resolveProtectedDocumentPath(page, document);
    const response = await page.goto(documentPath, {
      waitUntil: "domcontentloaded"
    });

    if (new URL(page.url()).pathname.startsWith("/login")) {
      throw new Error(
        "Document action checks require authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
      );
    }

    expect(
      response?.status(),
      `${documentPath} should load successfully`
    ).toBeLessThan(400);
    await expect(
      page.getByRole("link", { name: /print|save pdf/i })
    ).toBeVisible();
  }
});
