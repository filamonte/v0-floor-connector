const { defineConfig, devices } = require("@playwright/test");
const path = require("node:path");
const {
  canUseOrCreateContractorStorageState,
  loadRootEnv,
  resolveContractorStorageStatePath
} = require("./e2e/auth-state");

loadRootEnv();

const authStatePath = resolveContractorStorageStatePath();
const platformAdminAuthStatePath = path.resolve(
  process.env.PLAYWRIGHT_PLATFORM_ADMIN_STORAGE_STATE ??
    "playwright/.auth/platform-admin.json"
);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const parsedBaseURL = new URL(baseURL);
const devServerPort =
  parsedBaseURL.port || (parsedBaseURL.protocol === "https:" ? "443" : "80");
process.env.FLOORCONNECTOR_E2E_PAYMENT_GATEWAY =
  process.env.FLOORCONNECTOR_E2E_PAYMENT_GATEWAY ?? "local_manual";
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET ??
  "whsec_floorconnector_e2e_payment_webhook";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  workers: 1,
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
      testMatch: /(^|[\\/])auth\.setup\.js$/
    },
    {
      name: "setup-platform-admin",
      testMatch: /(^|[\\/])platform-admin-auth\.setup\.js$/
    },
    {
      name: "setup-portal",
      testMatch: /(^|[\\/])portal-auth\.setup\.js$/
    },
    {
      name: "chromium-public",
      testMatch:
        /(?:marketing-login|save-state-form|ui-primitives|data-export)\.spec\.js/,
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "chromium-protected",
      dependencies: ["setup"],
      testMatch:
        /(?:estimate-.*|project-detail-ui|customer-detail-ui|people-directory-access|project-ai-cue-work-item-bridge|operational-cues-record-panels|schedule-ready-handoff|golden-workflow-verification|dashboard-ui|dashboard-ui-my-work-queue-modes|detail-workspace-ui|data-export|authenticated-route-smoke)\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: canUseOrCreateContractorStorageState()
          ? authStatePath
          : undefined
      }
    },
    {
      name: "chromium-super-admin-access",
      dependencies: ["setup", "setup-platform-admin"],
      testMatch: /super-admin-access\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        contractorStorageState: authStatePath,
        platformAdminStorageState: platformAdminAuthStatePath
      }
    },
    {
      name: "chromium-portal",
      testMatch:
        /(?:portal-(?:golden-path|invite-acceptance|change-order-actions|estimate-actions|contract-actions|invoice-boundary|invoice-checkout-start)|stripe-webhook-reconciliation|data-export)\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
    ? undefined
    : {
        command: "pnpm --filter @floorconnector/web dev",
        url: baseURL,
        env: {
          ...process.env,
          PORT: devServerPort,
          FLOORCONNECTOR_E2E_PAYMENT_GATEWAY:
            process.env.FLOORCONNECTOR_E2E_PAYMENT_GATEWAY,
          STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
        },
        reuseExistingServer: true,
        timeout: 180_000
      }
});
