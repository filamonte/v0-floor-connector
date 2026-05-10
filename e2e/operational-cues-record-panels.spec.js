const { test, expect } = require("@playwright/test");
const { loadRootEnv } = require("./auth-utils");

const supportedCueRules = [
  ["estimate_sent_followup", "estimate", 1],
  ["contract_sent_unsigned", "contract", 1],
  ["contract_viewed_unsigned", "contract", 1],
  ["invoice_overdue", "invoice", 1],
  ["deposit_invoice_unpaid", "invoice", 1],
  ["job_ready_unscheduled", "job", 1],
  ["job_scheduled_missing_crew", "job", 30]
];

const fixtureNames = {
  customerEmail: "e2e-operational-cues@floorconnector.local",
  customerName: "E2E Operational Cue Customer",
  projectName: "[E2E] Operational Cue Record Panels",
  estimateReference: "E2E-OPC-EST",
  sentContractTitle: "E2E Operational Cue Sent Contract",
  viewedContractTitle: "E2E Operational Cue Viewed Contract",
  overdueInvoiceReference: "E2E-OPC-OVERDUE",
  depositInvoiceReference: "E2E-OPC-DEPOSIT"
};

let fixture;
let originalRulesByKey = new Map();

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

function dateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setUTCHours(12, 0, 0, 0);
  return date.toISOString();
}

async function getSupabaseFixtureContext() {
  loadRootEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const e2eEmail = process.env.FLOORCONNECTOR_E2E_EMAIL;

  if (!supabaseUrl || !serviceRoleKey || !e2eEmail) {
    return {
      skipReason:
        "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FLOORCONNECTOR_E2E_EMAIL to seed operational cue record-panel fixtures."
    };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", e2eEmail)
    .maybeSingle();

  if (userResponse.error) {
    throw new Error(`Unable to load E2E user: ${userResponse.error.message}`);
  }

  if (!userResponse.data) {
    return {
      skipReason: `No public.users row exists for FLOORCONNECTOR_E2E_EMAIL (${e2eEmail}).`
    };
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id, membership_status")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error) {
    throw new Error(
      `Unable to load E2E organization membership: ${membershipResponse.error.message}`
    );
  }

  if (!membershipResponse.data) {
    return {
      skipReason: `No active company membership exists for FLOORCONNECTOR_E2E_EMAIL (${e2eEmail}).`
    };
  }

  return {
    supabase,
    userId: userResponse.data.id,
    organizationId: membershipResponse.data.company_id
  };
}

async function preserveAndForceCueRules({ supabase, organizationId }) {
  const existingResponse = await supabase
    .from("organization_operational_cue_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .in(
      "cue_key",
      supportedCueRules.map(([cueKey]) => cueKey)
    );

  if (existingResponse.error) {
    throw new Error(`Unable to load operational cue rules: ${existingResponse.error.message}`);
  }

  originalRulesByKey = new Map(
    (existingResponse.data ?? []).map((rule) => [rule.cue_key, rule])
  );

  const now = new Date().toISOString();
  const upsertResponse = await supabase
    .from("organization_operational_cue_rules")
    .upsert(
      supportedCueRules.map(([cueKey, subjectType, thresholdDays]) => ({
        organization_id: organizationId,
        cue_key: cueKey,
        subject_type: subjectType,
        enabled: true,
        threshold_days: thresholdDays,
        urgency: "critical",
        owner_strategy: "record_owner",
        escalation_days: null,
        updated_at: now
      })),
      { onConflict: "organization_id,cue_key" }
    );

  if (upsertResponse.error) {
    throw new Error(`Unable to force operational cue rules: ${upsertResponse.error.message}`);
  }
}

async function restoreCueRules() {
  if (!fixture?.supabase || !fixture?.organizationId) {
    return;
  }

  const { supabase, organizationId } = fixture;
  const insertedCueKeys = supportedCueRules
    .map(([cueKey]) => cueKey)
    .filter((cueKey) => !originalRulesByKey.has(cueKey));

  if (insertedCueKeys.length > 0) {
    const deleteResponse = await supabase
      .from("organization_operational_cue_rules")
      .delete()
      .eq("organization_id", organizationId)
      .in("cue_key", insertedCueKeys);

    if (deleteResponse.error) {
      throw new Error(`Unable to restore inserted cue rules: ${deleteResponse.error.message}`);
    }
  }

  for (const rule of originalRulesByKey.values()) {
    const restoreResponse = await supabase
      .from("organization_operational_cue_rules")
      .update({
        subject_type: rule.subject_type,
        enabled: rule.enabled,
        threshold_days: rule.threshold_days,
        urgency: rule.urgency,
        owner_strategy: rule.owner_strategy,
        escalation_days: rule.escalation_days,
        updated_at: rule.updated_at
      })
      .eq("id", rule.id);

    if (restoreResponse.error) {
      throw new Error(`Unable to restore cue rule ${rule.cue_key}: ${restoreResponse.error.message}`);
    }
  }
}

async function upsertBySingleKey({
  supabase,
  table,
  select = "id",
  match,
  values
}) {
  let query = supabase.from(table).select(select);
  for (const [column, value] of Object.entries(match)) {
    query = query.eq(column, value);
  }

  const existingResponse = await query.limit(1).maybeSingle();
  if (existingResponse.error) {
    throw new Error(`Unable to load ${table} fixture: ${existingResponse.error.message}`);
  }

  if (existingResponse.data) {
    const updateResponse = await supabase
      .from(table)
      .update(values)
      .eq("id", existingResponse.data.id)
      .select(select)
      .single();

    if (updateResponse.error) {
      throw new Error(`Unable to update ${table} fixture: ${updateResponse.error.message}`);
    }

    return updateResponse.data;
  }

  const insertResponse = await supabase
    .from(table)
    .insert({ ...match, ...values })
    .select(select)
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create ${table} fixture: ${insertResponse.error.message}`);
  }

  return insertResponse.data;
}

async function resetInvoiceFixtureLineItem({
  supabase,
  organizationId,
  userId,
  invoiceId,
  name,
  unitPrice
}) {
  const deleteResponse = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .eq("name", name);

  if (deleteResponse.error) {
    throw new Error(`Unable to reset invoice fixture line item: ${deleteResponse.error.message}`);
  }

  const insertResponse = await supabase
    .from("invoice_line_items")
    .insert({
      company_id: organizationId,
      invoice_id: invoiceId,
      name,
      description: "E2E fixture line item for operational cue record-panel QA.",
      quantity: "1.00",
      unit: "each",
      unit_price: unitPrice,
      sort_order: 1,
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create invoice fixture line item: ${insertResponse.error.message}`);
  }
}

async function ensureFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  await preserveAndForceCueRules({ supabase, organizationId });

  const customer = await upsertBySingleKey({
    supabase,
    table: "customers",
    match: {
      company_id: organizationId,
      email: fixtureNames.customerEmail
    },
    values: {
      name: fixtureNames.customerName,
      company_name: "FloorConnector E2E",
      phone: "555-0100",
      notes: "Stable E2E fixture customer for operational cue record-panel QA.",
      created_by: userId,
      updated_by: userId
    }
  });

  const project = await upsertBySingleKey({
    supabase,
    table: "projects",
    match: {
      company_id: organizationId,
      name: fixtureNames.projectName
    },
    values: {
      customer_id: customer.id,
      status: "approved",
      description: "Stable E2E fixture project for operational cue record-panel QA.",
      address_line_1: "200 E2E Cue Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: "ready_to_schedule",
      ready_to_schedule_at: isoDaysFromNow(-10),
      financing_status: "not_applicable",
      created_by: userId,
      updated_by: userId
    }
  });

  const opportunity = await upsertBySingleKey({
    supabase,
    table: "opportunities",
    match: {
      company_id: organizationId,
      source_detail: "operational-cue-record-panels"
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      status: "converted",
      title: fixtureNames.projectName,
      source: "e2e",
      prospect_name: fixtureNames.customerName,
      prospect_company_name: "FloorConnector E2E",
      email: fixtureNames.customerEmail,
      phone: "555-0100",
      site_name: fixtureNames.projectName,
      service_type: "Epoxy flooring",
      site_assessment_status: "completed",
      requirements_summary:
        "Stable E2E opportunity fixture for operational cue record-panel QA.",
      qualified_at: isoDaysFromNow(-12),
      converted_at: isoDaysFromNow(-12),
      created_by: userId,
      updated_by: userId
    }
  });

  const estimate = await upsertBySingleKey({
    supabase,
    table: "estimates",
    match: {
      company_id: organizationId,
      reference_number: fixtureNames.estimateReference
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      opportunity_id: opportunity.id,
      status: "sent",
      sent_at: isoDaysFromNow(-10),
      subtotal_amount: "1000.00",
      tax_amount: "0.00",
      discount_amount: "0.00",
      total_amount: "1000.00",
      title: "E2E Operational Cue Estimate",
      notes: "Sent estimate fixture for operational cue record-panel QA.",
      content: {
        termsHtml: "<p>E2E fixture terms.</p>",
        inclusionsHtml: "<p>E2E fixture inclusions.</p>",
        exclusionsHtml: "<p>E2E fixture exclusions.</p>",
        notesHtml: "<p>E2E fixture notes.</p>",
        scopeSummaryHtml: "<p>E2E operational cue fixture scope.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      created_by: userId,
      updated_by: userId
    }
  });

  const sentContract = await upsertBySingleKey({
    supabase,
    table: "contracts",
    match: {
      company_id: organizationId,
      title: fixtureNames.sentContractTitle
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      status: "sent",
      rendered_subject: fixtureNames.sentContractTitle,
      rendered_content: "<p>E2E sent contract fixture.</p>",
      generated_from_estimate_reference: fixtureNames.estimateReference,
      sent_at: isoDaysFromNow(-10),
      viewed_at: null,
      customer_viewed_at: null,
      signed_at: null,
      internal_approval_status: "approved",
      signature_readiness_status: "out_for_signature",
      created_by: userId,
      updated_by: userId
    }
  });

  const viewedContract = await upsertBySingleKey({
    supabase,
    table: "contracts",
    match: {
      company_id: organizationId,
      title: fixtureNames.viewedContractTitle
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      status: "viewed",
      rendered_subject: fixtureNames.viewedContractTitle,
      rendered_content: "<p>E2E viewed contract fixture.</p>",
      generated_from_estimate_reference: fixtureNames.estimateReference,
      sent_at: isoDaysFromNow(-10),
      viewed_at: isoDaysFromNow(-5),
      customer_viewed_at: isoDaysFromNow(-5),
      signed_at: null,
      internal_approval_status: "approved",
      signature_readiness_status: "out_for_signature",
      created_by: userId,
      updated_by: userId
    }
  });

  const overdueInvoice = await upsertBySingleKey({
    supabase,
    table: "invoices",
    match: {
      company_id: organizationId,
      reference_number: fixtureNames.overdueInvoiceReference
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      status: "sent",
      billing_model: "standard",
      workflow_role: "standard",
      issue_date: dateDaysFromNow(-10),
      due_date: dateDaysFromNow(-3),
      subtotal_amount: "500.00",
      tax_amount: "0.00",
      discount_amount: "0.00",
      total_amount: "500.00",
      balance_due_amount: "500.00",
      notes: "Overdue invoice fixture for operational cue record-panel QA.",
      created_by: userId,
      updated_by: userId
    }
  });

  const depositInvoice = await upsertBySingleKey({
    supabase,
    table: "invoices",
    match: {
      company_id: organizationId,
      reference_number: fixtureNames.depositInvoiceReference
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      status: "sent",
      billing_model: "standard",
      workflow_role: "deposit",
      issue_date: dateDaysFromNow(-10),
      due_date: null,
      subtotal_amount: "750.00",
      tax_amount: "0.00",
      discount_amount: "0.00",
      total_amount: "750.00",
      balance_due_amount: "750.00",
      notes: "Deposit invoice fixture for operational cue record-panel QA.",
      created_by: userId,
      updated_by: userId
    }
  });

  await resetInvoiceFixtureLineItem({
    supabase,
    organizationId,
    userId,
    invoiceId: overdueInvoice.id,
    name: "E2E Overdue Invoice Cue Line",
    unitPrice: "500.00"
  });
  await resetInvoiceFixtureLineItem({
    supabase,
    organizationId,
    userId,
    invoiceId: depositInvoice.id,
    name: "E2E Deposit Invoice Cue Line",
    unitPrice: "750.00"
  });

  const unscheduledJob = await upsertBySingleKey({
    supabase,
    table: "jobs",
    match: {
      company_id: organizationId,
      notes: "E2E operational cue ready unscheduled job fixture."
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      dispatch_status: "unscheduled",
      scheduled_date: null,
      scheduled_start_at: null,
      scheduled_end_at: null,
      crew_vendor_id: null,
      created_by: userId,
      updated_by: userId
    }
  });

  const scheduledJob = await upsertBySingleKey({
    supabase,
    table: "jobs",
    match: {
      company_id: organizationId,
      notes: "E2E operational cue scheduled missing crew job fixture."
    },
    values: {
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      dispatch_status: "scheduled",
      scheduled_date: dateDaysFromNow(1),
      scheduled_start_at: isoDaysFromNow(1),
      scheduled_end_at: isoDaysFromNow(1),
      crew_vendor_id: null,
      created_by: userId,
      updated_by: userId
    }
  });

  const assignmentCleanupResponse = await supabase
    .from("job_assignments")
    .delete()
    .eq("company_id", organizationId)
    .in("job_id", [unscheduledJob.id, scheduledJob.id]);

  if (assignmentCleanupResponse.error) {
    throw new Error(
      `Unable to reset fixture job assignments: ${assignmentCleanupResponse.error.message}`
    );
  }

  return {
    supabase,
    organizationId,
    projectPath: `/projects/${project.id}`,
    estimatePath: `/estimates/${estimate.id}`,
    sentContractPath: `/contracts/${sentContract.id}`,
    viewedContractPath: `/contracts/${viewedContract.id}`,
    overdueInvoicePath: `/invoices/${overdueInvoice.id}`,
    depositInvoicePath: `/invoices/${depositInvoice.id}`,
    unscheduledJobPath: `/jobs/${unscheduledJob.id}`,
    scheduledJobPath: `/jobs/${scheduledJob.id}`,
    titles: {
      estimate: `Follow up on ${fixtureNames.estimateReference}`,
      contractSent: "Sent contract is still unsigned",
      contractViewed: "Viewed contract is still unsigned",
      invoiceOverdue: `${fixtureNames.overdueInvoiceReference} is overdue`,
      depositInvoice: "Deposit invoice is unpaid",
      jobReady: "Ready job is still unscheduled",
      jobMissingCrew: "Scheduled job is missing crew"
    }
  };
}

async function expectAuthenticatedPage(page) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Operational cue record-panel QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }
}

function needsAttentionPanel(page) {
  return page.locator('section[aria-labelledby="needs-attention-title"]');
}

test.describe.serial("operational cue record-level panels", () => {
  test.beforeAll(async () => {
    fixture = await ensureFixture();
  });

  test.afterAll(async () => {
    await restoreCueRules();
  });

  test("dashboard My Work includes all fixture cue groups", async ({ page }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    const issues = attachIssueCapture(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);

    const myWork = page.locator('section[aria-labelledby="dashboard-my-work-title"]');
    await expect(myWork).toBeVisible();
    await expect(myWork.getByRole("tab", { name: /Company\s+\d+/ })).toBeVisible();
    await expect(myWork.getByRole("tab", { name: /Mine\s+\d+/ })).toBeVisible();
    await expect(myWork.getByRole("tab", { name: /Unresolved\s+\d+/ })).toBeVisible();

    await page.goto("/dashboard?myWork=company", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    await expect(myWork).toContainText("My Estimates");
    await expect(myWork).toContainText("My Contracts");
    await expect(myWork).toContainText("My Invoices");
    await expect(myWork).toContainText("My Jobs");
    await expect(myWork).toContainText(fixture.titles.estimate);
    await expect(myWork).toContainText(fixture.titles.contractSent);
    await expect(myWork).toContainText(fixture.titles.contractViewed);
    await expect(myWork).toContainText(fixture.titles.invoiceOverdue);
    await expect(myWork).toContainText(fixture.titles.depositInvoice);
    await expect(myWork).toContainText(fixture.titles.jobReady);
    await expect(myWork).toContainText(fixture.titles.jobMissingCrew);
    await expect(myWork).toContainText("This rule triggers after");
    await expect(myWork).toContainText("Threshold:");

    await page.goto("/dashboard?myWork=unresolved", {
      waitUntil: "domcontentloaded"
    });
    await expectAuthenticatedPage(page);
    await expect(myWork).toContainText("These attention items need a responsible person/default");
    await expect(myWork).toContainText(fixture.titles.estimate);
    await expect(myWork).toContainText(fixture.titles.jobMissingCrew);

    await page.goto("/dashboard?myWork=mine", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    await expect(myWork).toContainText("Items resolved to you");

    expect(issues).toEqual([]);
  });

  test("canonical detail panels show their matching cue keys", async ({ page }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    const issues = attachIssueCapture(page);
    const checks = [
      [fixture.estimatePath, fixture.titles.estimate, fixture.estimatePath],
      [fixture.sentContractPath, fixture.titles.contractSent, fixture.sentContractPath],
      [fixture.viewedContractPath, fixture.titles.contractViewed, fixture.viewedContractPath],
      [fixture.overdueInvoicePath, fixture.titles.invoiceOverdue, fixture.overdueInvoicePath],
      [fixture.depositInvoicePath, fixture.titles.depositInvoice, fixture.depositInvoicePath],
      [fixture.unscheduledJobPath, fixture.titles.jobReady, "/schedule?"],
      [fixture.scheduledJobPath, fixture.titles.jobMissingCrew, fixture.scheduledJobPath]
    ];

    for (const [path, title, hrefPrefix] of checks) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expectAuthenticatedPage(page);

      const panel = needsAttentionPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(title);
      await expect(panel).toContainText("Threshold:");
      await expect(panel.locator(`a[href^="${hrefPrefix}"]`)).toHaveCount(1);
    }

    expect(issues).toEqual([]);
  });

  test("linked project detail aggregates all child record cues", async ({ page }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    const issues = attachIssueCapture(page);

    await page.goto(fixture.projectPath, { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);

    const panel = needsAttentionPanel(page);
    await expect(panel).toBeVisible();
    for (const title of Object.values(fixture.titles)) {
      await expect(panel).toContainText(title);
    }

    expect(issues).toEqual([]);
  });

  test("operational cue actions and settings controls are keyboard reachable", async ({ page }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    const issues = attachIssueCapture(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);

    const myWork = page.locator('section[aria-labelledby="dashboard-my-work-title"]');
    await page.goto("/dashboard?myWork=company", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    const dashboardCueAction = myWork.getByRole("link", {
      name: `Open estimate: ${fixture.titles.estimate}`,
      exact: true
    });
    await expect(dashboardCueAction).toBeVisible();
    await dashboardCueAction.focus();
    await expect(dashboardCueAction).toBeFocused();

    await page.keyboard.press("Enter");
    await page.waitForURL(`**${fixture.estimatePath}`, { timeout: 15_000 });
    await expectAuthenticatedPage(page);

    const detailPanel = needsAttentionPanel(page);
    const detailCueAction = detailPanel.getByRole("link", {
      name: `Open estimate: ${fixture.titles.estimate}`,
      exact: true
    });
    await expect(detailCueAction).toBeVisible();
    await detailCueAction.focus();
    await expect(detailCueAction).toBeFocused();

    await page.goto("/settings/operational-intelligence", {
      waitUntil: "domcontentloaded"
    });
    await expectAuthenticatedPage(page);

    const estimateRuleCard = page
      .locator("article")
      .filter({ hasText: "Estimate follow-up" });
    await expect(estimateRuleCard).toHaveCount(1);

    const enabledToggle = estimateRuleCard.getByRole("checkbox", {
      name: "Show this cue in My Work"
    });
    const thresholdInput = estimateRuleCard.getByRole("spinbutton", {
      name: "Threshold days"
    });
    const urgencySelect = estimateRuleCard.getByRole("combobox", {
      name: "Urgency"
    });
    const saveButton = estimateRuleCard.getByRole("button", {
      name: "Save Estimate follow-up cue rule"
    });

    await enabledToggle.focus();
    await expect(enabledToggle).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(thresholdInput).toBeFocused();
    await thresholdInput.fill("2");
    await page.keyboard.press("Tab");
    await expect(urgencySelect).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(saveButton).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(saveButton).not.toBeFocused();

    expect(issues).toEqual([]);
  });
});
