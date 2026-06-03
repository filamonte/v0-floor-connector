const { test, expect } = require("@playwright/test");

test("dashboard renders decision-center UI", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/dashboard");
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Dashboard smoke test requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  await expect(
    page.getByRole("heading", { name: "Decide what needs attention first" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Action Queues" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Needs Contract" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ready to Schedule" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Open AR" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Today's Work" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Open Blockers" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Pipeline and execution snapshot" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  await expect(page.locator('a[href="/projects"]').first()).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
