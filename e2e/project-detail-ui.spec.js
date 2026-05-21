const { test, expect } = require("@playwright/test");
const { resolveProjectDetailPath } = require("./protected-route-utils");

test("project detail renders decision-first UI", async ({ page }) => {
  const projectDetailPath = await resolveProjectDetailPath(page);

  await page.goto(projectDetailPath);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project detail smoke test requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials and matching PLAYWRIGHT_BASE_URL."
    );
  }

  // Next-action and readiness coaching can be reduced by organization workflow
  // guidance settings. The project smoke asserts stable project facts that must
  // stay visible in Guided, Flexible, and Manual modes.
  await expect(
    page.getByRole("region", { name: "Project state summary" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Operational command center" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Connected record lanes" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sales / Estimate" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Contract / Signature" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Change Orders" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Billing / Payments" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Job / Schedule" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Field / Daily Logs" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Customer Access" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What changed recently" })
  ).toBeVisible();
  await expect(
    page.getByText(/not a separate project activity feed/i)
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Project follow-through" })
  ).toBeVisible();
  await expect(page.getByText(/Create internal work item/i)).toBeVisible();
  await expect(page.getByText("Customer Contact Access")).toBeVisible();
  await expect(
    page.getByText(/Full contact and account administration stays in People/i)
  ).toBeVisible();
  await expect(page.locator("body")).toContainText(
    /Customer|Readiness|Schedule|Project/i
  );
});
