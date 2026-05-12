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

  await expect(page.getByRole("region", { name: "Current state and next action" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Project workflow" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Project state summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project workflow" })).toBeVisible();
  await expect(page.getByText("Driving record")).toBeVisible();
  await expect(page.getByText(/currently driving the next step/i)).toBeVisible();
  await expect(page.getByText("Linked record recency")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What changed recently" })).toBeVisible();
  await expect(page.getByText(/not a separate project activity feed/i)).toBeVisible();
});
