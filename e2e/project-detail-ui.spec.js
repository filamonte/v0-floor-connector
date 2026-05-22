const { test, expect } = require("@playwright/test");
const { resolveProjectDetailPath } = require("./protected-route-utils");

async function expectProjectWorkspaceLandmarks(page) {
  // Next-action and readiness coaching can be reduced by organization workflow
  // guidance settings. The project smoke asserts stable project facts and the
  // operating-core layers that must stay visible in Guided, Flexible, and
  // Manual modes.
  await expect(
    page.getByRole("region", { name: "Project state summary" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Project health summary" })
  ).toBeVisible();
  await expect(page.getByText("ProjectPulse").first()).toBeVisible();
  await expect(page.getByText("Next Move").first()).toBeVisible();
  await expect(page.getByText("Ready Check").first()).toBeVisible();
  await expect(page.getByText("FieldTrail").first()).toBeVisible();
  await expect(page.getByText("MessageCenter").first()).toBeVisible();
  await expect(page.getByText("CloseoutTrail").first()).toBeVisible();
  await expect(page.getByText("Proof Center").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Print Closeout Package" })
  ).toBeVisible();
  await expect(page.locator("body")).toContainText(
    /Customer|Readiness|Schedule|Project/i
  );
}

test("project detail renders decision-first UI", async ({ page }) => {
  const projectDetailPath = await resolveProjectDetailPath(page);

  await page.goto(projectDetailPath);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project detail smoke test requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials and matching PLAYWRIGHT_BASE_URL."
    );
  }

  await expectProjectWorkspaceLandmarks(page);

  const closeoutPackageLink = page.getByRole("link", {
    name: "Print Closeout Package"
  });
  const closeoutPackageHref = await closeoutPackageLink.getAttribute("href");

  expect(closeoutPackageHref).toBe(`${projectDetailPath}/closeout-package/pdf`);

  await page.goto(closeoutPackageHref);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project closeout package print route requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials and matching PLAYWRIGHT_BASE_URL."
    );
  }

  await expect(page.getByTestId("customer-document-print-view")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Closeout Package/i })
  ).toBeVisible();
  await expect(page.getByText(/does not send it/i)).toBeVisible();
});
