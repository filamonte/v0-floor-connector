const { defineConfig, devices } = require("@playwright/test");
const path = require("node:path");

const authStatePath = path.resolve(
  process.env.PLAYWRIGHT_STORAGE_STATE ?? "playwright/.auth/local-user.json"
);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.js/
    },
    {
      name: "chromium-public",
      testMatch: /(?:save-state-form|ui-primitives)\.spec\.js/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "chromium-protected",
      dependencies: ["setup"],
      testMatch: /(?:estimate-.*|project-detail-ui|dashboard-ui|detail-workspace-ui)\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authStatePath
      }
    }
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000
      }
});
