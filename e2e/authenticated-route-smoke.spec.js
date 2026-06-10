const { test, expect } = require("@playwright/test");

const routeExpectations = [
  { path: "/dashboard", heading: /Dashboard/i },
  { path: "/daily-logs", heading: /field logs/i },
  { path: "/field/work-items", heading: /My Work Items/i },
  { path: "/schedule", heading: "CrewBoard" },
  { path: "/leads", heading: /Lead manager/i }
];

const viewports = [
  { name: "desktop", size: { width: 1440, height: 1100 } },
  { name: "mobile", size: { width: 390, height: 844 } }
];

function attachRouteDiagnostics(page) {
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    issues.push(
      `request failed: ${request.url()} ${
        request.failure()?.errorText ?? "unknown"
      }`
    );
  });

  return issues;
}

function expectNoAppErrorText(bodyText) {
  expect(bodyText).not.toMatch(/We could not load this page/i);
  expect(bodyText).not.toMatch(/FloorConnector could not render this request/i);
  expect(bodyText).not.toMatch(/Application error/i);
  expect(bodyText).not.toMatch(/Unhandled Runtime Error/i);
}

for (const viewport of viewports) {
  test.describe(`authenticated route smoke - ${viewport.name}`, () => {
    test.use({ viewport: viewport.size });

    for (const route of routeExpectations) {
      test(`${route.path} renders protected app content`, async ({
        page
      }, testInfo) => {
        const issues = attachRouteDiagnostics(page);
        const response = await page.goto(route.path, {
          waitUntil: "domcontentloaded"
        });
        await page
          .waitForLoadState("networkidle", { timeout: 10_000 })
          .catch(() => {});

        const url = new URL(page.url());
        if (url.pathname.startsWith("/login")) {
          throw new Error(
            `${route.path} redirected to /login. Refresh contractor Playwright auth with the setup project and keep PLAYWRIGHT_BASE_URL aligned with the tested origin.`
          );
        }

        expect(response?.status() ?? 0).toBeLessThan(400);

        const bodyText = await page.locator("body").innerText();
        expectNoAppErrorText(bodyText);
        await expect(
          page.getByRole("heading", {
            name: route.heading,
            exact: typeof route.heading === "string"
          })
        ).toBeVisible();

        const overflow = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth
          )
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(
          overflow.clientWidth + 2
        );

        await page.screenshot({
          path: testInfo.outputPath(
            `${viewport.name}-${route.path
              .replace(/^\//, "")
              .replace(/[^a-z0-9]+/gi, "-")}.png`
          ),
          fullPage: false,
          caret: "initial"
        });

        expect(issues).toEqual([]);
      });
    }
  });
}
