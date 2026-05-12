const { test, expect } = require("@playwright/test");

const projectDetailPath =
  process.env.FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH ??
  "/projects/797ec5b1-4417-4a36-934e-e82498efef5a";

test("project detail renders decision-first UI", async ({ page }) => {
  await page.goto(projectDetailPath);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Project detail smoke test requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  // Next-action and readiness coaching can be reduced by organization workflow
  // guidance settings. The project smoke asserts stable project facts that must
  // stay visible in Guided, Flexible, and Manual modes.
  await expect(page.getByRole("region", { name: "Project state summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What changed recently" })).toBeVisible();
  await expect(page.getByText(/not a separate project activity feed/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project follow-through" })).toBeVisible();
  await expect(page.getByText(/Create internal work item/i)).toBeVisible();
  await expect(page.locator("body")).toContainText(/Customer|Readiness|Schedule|Project/i);
});
