const { test, expect } = require("@playwright/test");

const detailFixtures = {
  project:
    process.env.FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH ??
    "/projects/797ec5b1-4417-4a36-934e-e82498efef5a",
  estimate:
    process.env.FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH ??
    "/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e",
  invoices: [
    "/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7",
    "/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502",
    "/invoices/894d1e3a-c3f2-4572-869b-545f00aef027"
  ],
  jobs: [
    "/jobs/acd2daf7-0d02-4196-99d2-1a4164095886",
    "/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4",
    "/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80"
  ],
  contracts: [
    "/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8",
    "/contracts/7d7b34bd-872a-4831-846b-6c99f500211f",
    "/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4"
  ]
};

const goldenWorkflowManagerRoutes = [
  "/dashboard",
  "/leads",
  "/customers",
  "/projects",
  "/estimates",
  "/contracts",
  "/invoices",
  "/payments",
  "/jobs",
  "/schedule",
  "/daily-logs"
];

function attachIssueCapture(page) {
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.message}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      issues.push(`bad response ${response.status()}: ${response.url()}`);
    }
  });

  return issues;
}

async function expectAuthenticatedDetail(page, path) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      "Decision-first detail smoke tests require authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }

  expect(response?.status(), `${path} should load successfully`).toBeLessThan(400);
}

test("dashboard PriorityStrip renders inside the authenticated dashboard", async ({ page }) => {
  const issues = attachIssueCapture(page);

  await expectAuthenticatedDetail(page, "/dashboard");

  const priorityStrip = page.getByRole("region", {
    name: "Decide what needs attention first"
  });
  await expect(priorityStrip).toBeVisible();
  await expect(priorityStrip).toContainText("Priority strip");
  await expect(page.getByRole("heading", { name: "Pipeline and execution snapshot" })).toBeVisible();

  expect(issues).toEqual([]);
});

test("golden workflow manager route spine stays authenticated", async ({ page }) => {
  const issues = attachIssueCapture(page);

  for (const route of goldenWorkflowManagerRoutes) {
    await expectAuthenticatedDetail(page, route);
    expect(new URL(page.url()).pathname, `${route} should not redirect`).toBe(route);
    await expect(page.locator("body")).not.toContainText(/Application error|Unhandled Runtime Error/i);
  }

  expect(issues).toEqual([]);
});

test("project and estimate detail render decision-first primitives", async ({ page }) => {
  const issues = attachIssueCapture(page);

  await expectAuthenticatedDetail(page, detailFixtures.project);
  // Project coaching panels are organization-configurable after Phase 0.5.
  // This smoke keeps the non-negotiable state and continuity assertions stable
  // across Guided, Flexible, and Manual modes.
  await expect(page.getByRole("region", { name: "Project state summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What changed recently" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project follow-through" })).toBeVisible();
  await expect(page.locator("body")).toContainText(/Customer|Readiness|Schedule|Project/i);

  await expectAuthenticatedDetail(page, detailFixtures.estimate);
  await expect(page.getByRole("region", { name: "Current state and next action" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Estimate workflow" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Estimate state summary" })).toBeVisible();

  expect(issues).toEqual([]);
});

for (const invoicePath of detailFixtures.invoices) {
  test(`invoice detail smoke: ${invoicePath}`, async ({ page }) => {
    const issues = attachIssueCapture(page);

    await expectAuthenticatedDetail(page, invoicePath);
    await expect(page.getByRole("region", { name: "Current state and next action" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Billing workflow" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Invoice state summary" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Balance due|Payment Activity|Record payment/i);

    expect(issues).toEqual([]);
  });
}

for (const jobPath of detailFixtures.jobs) {
  test(`job detail smoke: ${jobPath}`, async ({ page }) => {
    const issues = attachIssueCapture(page);

    await expectAuthenticatedDetail(page, jobPath);
    await expect(page.getByRole("region", { name: "Current state and next action" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Job execution workflow" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Job execution state" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Schedule|Crew|Status|Project/i);

    expect(issues).toEqual([]);
  });
}

for (const contractPath of detailFixtures.contracts) {
  test(`contract detail smoke: ${contractPath}`, async ({ page }) => {
    const issues = attachIssueCapture(page);

    await expectAuthenticatedDetail(page, contractPath);
    await expect(page.getByRole("region", { name: "Current state and next action" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Contract workflow" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Signature state" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Signature|Signer|Contract/i);

    expect(issues).toEqual([]);
  });
}
