const { test, expect } = require("@playwright/test");
const {
  resolveFirstLinkedDetailPath,
  resolveLinkedDetailPaths,
  resolveProjectDetailPath
} = require("./protected-route-utils");

const detailFixtures = {
  estimate: process.env.FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH,
  invoices: process.env.FLOORCONNECTOR_E2E_INVOICE_DETAIL_PATH,
  jobs: process.env.FLOORCONNECTOR_E2E_JOB_DETAIL_PATH,
  contracts: process.env.FLOORCONNECTOR_E2E_CONTRACT_DETAIL_PATH
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

  if (response) {
    expect(response.status(), `${path} should load successfully`).toBeLessThan(
      400
    );
  } else {
    await expect(
      page.locator("body"),
      `${path} should render application content`
    ).not.toContainText(/Application error|Unhandled Runtime Error/i);
  }
}

async function expectNoHorizontalPageOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    )
  }));

  expect(
    metrics.scrollWidth,
    `${label} should not create page-level horizontal overflow`
  ).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function resolveDetailPath(page, resource) {
  if (detailFixtures[resource]) {
    return detailFixtures[resource];
  }

  const config = {
    estimate: {
      listPath: "/estimates",
      hrefPrefix: "/estimates/",
      label: "Estimate detail smoke"
    },
    invoices: {
      listPath: "/invoices",
      hrefPrefix: "/invoices/",
      label: "Invoice detail smoke"
    },
    jobs: {
      listPath: "/jobs",
      hrefPrefix: "/jobs/",
      label: "Job detail smoke"
    },
    contracts: {
      listPath: "/contracts",
      hrefPrefix: "/contracts/",
      label: "Contract detail smoke"
    }
  }[resource];

  return resolveFirstLinkedDetailPath(page, config);
}

async function resolveDetailPaths(page, resource) {
  if (detailFixtures[resource]) {
    return [detailFixtures[resource]];
  }

  const config = {
    invoices: {
      listPath: "/invoices",
      hrefPrefix: "/invoices/",
      label: "Invoice detail smoke"
    },
    jobs: {
      listPath: "/jobs",
      hrefPrefix: "/jobs/",
      label: "Job detail smoke"
    },
    contracts: {
      listPath: "/contracts",
      hrefPrefix: "/contracts/",
      label: "Contract detail smoke"
    }
  }[resource];

  return resolveLinkedDetailPaths(page, config);
}

test("dashboard PriorityStrip renders inside the authenticated dashboard", async ({
  page
}) => {
  const issues = attachIssueCapture(page);

  await expectAuthenticatedDetail(page, "/dashboard");

  const priorityStrip = page.getByRole("region", {
    name: "Decide what needs attention first"
  });
  await expect(priorityStrip).toBeVisible();
  await expect(priorityStrip).toContainText("Priority strip");
  await expect(
    page.getByRole("heading", { name: "Pipeline and execution snapshot" })
  ).toBeVisible();

  expect(issues).toEqual([]);
});

test("golden workflow manager route spine stays authenticated", async ({
  page
}) => {
  test.setTimeout(180_000);

  const issues = attachIssueCapture(page);

  for (const route of goldenWorkflowManagerRoutes) {
    await expectAuthenticatedDetail(page, route);
    expect(new URL(page.url()).pathname, `${route} should not redirect`).toBe(
      route
    );
    await expect(page.locator("body")).not.toContainText(
      /Application error|Unhandled Runtime Error/i
    );
  }

  expect(issues).toEqual([]);
});

test("project and estimate detail render decision-first primitives", async ({
  page
}) => {
  const projectPath = await resolveProjectDetailPath(page);
  const estimatePath = await resolveDetailPath(page, "estimate");
  const issues = attachIssueCapture(page);

  await expectAuthenticatedDetail(page, projectPath);
  // Project coaching panels are organization-configurable after Phase 0.5.
  // This smoke keeps the non-negotiable state and continuity assertions stable
  // across Guided, Flexible, and Manual modes.
  await expect(
    page.getByRole("region", { name: "Project state summary" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What changed recently" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Project follow-through" })
  ).toBeVisible();
  await expect(page.locator("body")).toContainText(
    /Customer|Readiness|Schedule|Project/i
  );

  await expectAuthenticatedDetail(page, estimatePath);
  await expect(
    page.getByRole("region", { name: "Current state and next action" })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Estimate workflow", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Estimate state summary" })
  ).toBeVisible();

  expect(issues).toEqual([]);
});

test("core detail workspaces stay within mobile viewport", async ({ page }) => {
  const projectPath = await resolveProjectDetailPath(page);
  const estimatePath = await resolveDetailPath(page, "estimate");
  const contractPath = await resolveDetailPath(page, "contracts");
  const invoicePath = await resolveDetailPath(page, "invoices");

  await page.setViewportSize({ width: 390, height: 844 });

  await expectAuthenticatedDetail(page, projectPath);
  await expectNoHorizontalPageOverflow(page, "Project detail mobile layout");

  await expectAuthenticatedDetail(page, estimatePath);
  await expectNoHorizontalPageOverflow(page, "Estimate detail mobile layout");

  await expectAuthenticatedDetail(page, contractPath);
  await expectNoHorizontalPageOverflow(page, "Contract detail mobile layout");

  await expectAuthenticatedDetail(page, invoicePath);
  await expectNoHorizontalPageOverflow(page, "Invoice detail mobile layout");
});

test("invoice detail smokes discovered invoice workspaces", async ({
  page
}) => {
  const invoicePaths = await resolveDetailPaths(page, "invoices");
  const issues = attachIssueCapture(page);

  for (const invoicePath of invoicePaths) {
    await expectAuthenticatedDetail(page, invoicePath);
    await expect(
      page.getByRole("region", { name: "Current state and next action" })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Billing workflow" })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Invoice state summary" })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      /Balance due|Payment Activity|Record a payment|Record payment/i
    );
  }

  expect(issues).toEqual([]);
});

test("job detail smokes discovered job workspaces", async ({ page }) => {
  const jobPaths = await resolveDetailPaths(page, "jobs");
  const issues = attachIssueCapture(page);

  for (const jobPath of jobPaths) {
    await expectAuthenticatedDetail(page, jobPath);
    await expect(
      page.getByRole("region", { name: "Current state and next action" })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Job execution workflow" })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Job execution state" })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      /Schedule|Crew|Status|Project/i
    );
  }

  expect(issues).toEqual([]);
});

test("contract detail smokes discovered contract workspaces", async ({
  page
}) => {
  const contractPaths = await resolveDetailPaths(page, "contracts");
  const issues = attachIssueCapture(page);

  for (const contractPath of contractPaths) {
    await expectAuthenticatedDetail(page, contractPath);
    await expect(
      page.getByRole("region", { name: "Current state and next action" })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Contract workflow", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Signature state" })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      /Signature|Signer|Contract/i
    );
  }

  expect(issues).toEqual([]);
});
