const { test, expect } = require("@playwright/test");

async function expectAuthenticatedApp(page) {
  await page.waitForLoadState("domcontentloaded");

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Manual approval e2e requires the shared authenticated Playwright storage state. Run `pnpm e2e:auth` with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD, or let the chromium-protected project run its setup dependency."
    );
  }
}

async function resolveManualApprovalEstimatePath(page) {
  const configuredPath = process.env.FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH;

  if (configuredPath) {
    return configuredPath;
  }

  for (const status of ["sent", "draft"]) {
    await page.goto(`/estimates?status=${status}`);
    await expectAuthenticatedApp(page);
    const estimateLinks = page.locator('a[href^="/estimates/"]:not([href$="/edit"])');
    const estimateCount = await estimateLinks.count();
    const estimatePaths = [];

    for (let index = 0; index < estimateCount; index += 1) {
      const href = await estimateLinks.nth(index).getAttribute("href");

      if (href) {
        estimatePaths.push(href);
      }
    }

    for (const href of estimatePaths) {
      await page.goto(href);
      await expectAuthenticatedApp(page);

      if (await page.locator("#estimate-decision-actions").isVisible()) {
        return href;
      }
    }
  }

  throw new Error(
    "No real draft or sent estimate was available for manual-approval testing. Set FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH to a real draft or sent estimate path."
  );
}

test("contractor can record real manual customer approval from estimate review", async ({
  page
}) => {
  const estimatePath = await resolveManualApprovalEstimatePath(page);

  await page.goto(estimatePath);
  await expectAuthenticatedApp(page);

  const decisionActions = page.locator("#estimate-decision-actions");
  await expect(decisionActions).toContainText("Manual customer decision");
  await expect(decisionActions).toContainText(
    "paper signature, verbal approval, fake email during testing, or a non-portal customer"
  );
  await expect(decisionActions).toContainText(
    "canonical estimate so downstream contract, job, and invoice workflows can continue without waiting for send-mail or portal delivery"
  );

  const approveButton = decisionActions.getByRole("button", {
    name: "Record customer approval"
  });
  await expect(approveButton).toBeVisible();
  await approveButton.click();

  await expect(page).toHaveURL(/\/estimates\/[0-9a-f-]+.*message=/i);
  await expect(page.locator("body")).toContainText("marked as approved");
  await expect(page.locator("body")).toContainText("approved");
});
