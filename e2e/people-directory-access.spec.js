const { test, expect } = require("@playwright/test");

test("people directory renders customer contact access administration", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/people#customer-access");
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "People directory smoke test requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials."
    );
  }

  await expect(page.getByText("Portal access console")).toBeVisible();
  await expect(page.getByText("Customer contact access")).toBeVisible();
  await expect(page.getByTestId("portal-access-console-filters")).toBeVisible();
  await expect(page.getByText(/Management opens one contact at a time/i)).toBeVisible();
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
  }));
  expect(metrics.scrollWidth, "People access should fit the mobile viewport").toBeLessThanOrEqual(
    metrics.clientWidth + 2
  );

  const managePanels = await page.getByTestId("portal-access-manage-panel").count();
  expect(
    managePanels,
    "People default view should not render repeated full management panels"
  ).toBeLessThanOrEqual(1);

  const manageAction = page.getByRole("link", { name: /Manage access/i });
  const manageActionCount = await manageAction.count();
  if (manageActionCount > 0) {
    await expect(manageAction.first()).toBeVisible();
    await manageAction.first().click();
    await expect(page.getByTestId("portal-access-manage-panel")).toBeVisible();
    await expect(page.getByText("Account help")).toBeVisible();
    await expect(page.getByText("Project access")).toBeVisible();
  } else {
    test.info().annotations.push({
      type: "fixture",
      description:
        "No customer-contact portal access rows were available for manage-panel assertions."
    });
  }
});
