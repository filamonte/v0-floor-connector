const { test, expect } = require("@playwright/test");

function attachIssueCapture(page) {
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.message}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      issues.push(`bad response ${response.status()}: ${response.url()}`);
    }
  });

  return issues;
}

async function resolveCustomerDetailPath(page) {
  const configuredPath = process.env.FLOORCONNECTOR_E2E_CUSTOMER_DETAIL_PATH;

  if (configuredPath) {
    return configuredPath;
  }

  await page.goto("/customers", { waitUntil: "domcontentloaded" });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Customer detail smoke requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials."
    );
  }

  const customerLinks = page.locator('a[href^="/customers/"]');
  const customerLinkCount = await customerLinks.count();

  test.skip(customerLinkCount === 0, "No customer detail links were available for customer-detail QA.");

  const href = await customerLinks.first().getAttribute("href");

  if (!href) {
    throw new Error("Unable to resolve a customer detail href from /customers.");
  }

  return href;
}

async function expectNoHorizontalPageOverflow(page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
  }));

  expect(metrics.scrollWidth, "Customer detail should fit the mobile viewport").toBeLessThanOrEqual(
    metrics.clientWidth + 2
  );
}

test("customer detail renders contact-centered portal access without loading shell hang", async ({
  page
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const issues = attachIssueCapture(page);
  const customerDetailPath = await resolveCustomerDetailPath(page);

  const response = await page.goto(customerDetailPath, {
    waitUntil: "domcontentloaded",
    timeout: 90_000
  });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Customer detail smoke requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials."
    );
  }

  expect(response?.status(), `${customerDetailPath} should load successfully`).toBeLessThan(400);
  await expect(page.getByText("Customer Workspace").first()).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText("Contacts").first()).toBeVisible();
  await expect(page.getByText("Portal Access").first()).toBeVisible();
  await expect(page.getByText("Manage contacts/access").first()).toBeVisible();
  await expect(page.getByText("Open People access management").first()).toBeVisible();
  await expect(page.locator("body")).toContainText(/Contact-level portal access|Portal access/i);
  await expect(page.locator("body")).not.toContainText(/Preparing your workspace|Application error/i);
  await expectNoHorizontalPageOverflow(page);

  const inviteStatusVisible = await page
    .getByText("Invite email delivery")
    .first()
    .isVisible()
    .catch(() => false);

  if (inviteStatusVisible) {
    await expect(page.locator("body")).toContainText(/Email sent|Email failed|Email not sent/i);
  } else {
    test.info().annotations.push({
      type: "fixture",
      description:
        "Selected customer had no pending/active portal invite status block to inspect; route-level contact portal access still rendered."
    });
  }

  expect(issues).toEqual([]);
});
