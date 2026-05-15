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

const guidedWorkflowPreferences = {
  workflowMode: "guided",
  showNextBestActions: true,
  showReadinessGuidance: true,
  strictReadinessEnforcement: true,
  allowOneOffInvoiceShortcuts: false,
  showShortcutCleanupPrompts: true,
  showWorkflowExplanationCopy: true,
  enableAiSuggestions: false,
  enableAiSummaries: false,
  enableAiDrafting: false,
  enableAiFormPrefillSuggestions: false,
  enableAiWorkItemRecommendations: false,
  requireConfirmationBeforeAiActions: true
};
let fixture;
let originalRulesByKey = new Map();
let originalWorkflowGuidancePreferences;

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

async function preserveAndForceGuidedWorkflow({ supabase, organizationId, userId }) {
  const existingResponse = await supabase
    .from("organization_workflow_settings")
    .select("workflow_guidance_preferences")
    .eq("company_id", organizationId)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load workflow guidance preferences: ${existingResponse.error.message}`
    );
  }

  if (!existingResponse.data) {
    return;
  }

  originalWorkflowGuidancePreferences =
    existingResponse.data.workflow_guidance_preferences;

  const updateResponse = await supabase
    .from("organization_workflow_settings")
    .update({
      workflow_guidance_preferences: guidedWorkflowPreferences,
      updated_by: userId
    })
    .eq("company_id", organizationId);

  if (updateResponse.error) {
    throw new Error(
      `Unable to force guided workflow preferences: ${updateResponse.error.message}`
    );
  }
}

async function restoreWorkflowGuidance() {
  if (
    !fixture?.supabase ||
    !fixture?.organizationId ||
    typeof originalWorkflowGuidancePreferences === "undefined"
  ) {
    return;
  }

  const restoreResponse = await fixture.supabase
    .from("organization_workflow_settings")
    .update({
      workflow_guidance_preferences: originalWorkflowGuidancePreferences,
      updated_by: fixture.userId
    })
    .eq("company_id", fixture.organizationId);

  if (restoreResponse.error) {
    throw new Error(
      `Unable to restore workflow guidance preferences: ${restoreResponse.error.message}`
    );
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
  await preserveAndForceGuidedWorkflow({ supabase, organizationId, userId });

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
    userId,
    organizationId,
    estimateId: estimate.id,
    overdueInvoiceId: overdueInvoice.id,
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

async function clearFixtureCueStates() {
  if (!fixture || fixture.skipReason) {
    return;
  }

  const response = await fixture.supabase
    .from("workflow_cue_states")
    .delete()
    .eq("company_id", fixture.organizationId)
    .eq("user_id", fixture.userId)
    .eq("cue_family", "operational")
    .in("subject_id", [fixture.estimateId, fixture.overdueInvoiceId]);

  if (response.error) {
    throw new Error(`Unable to reset fixture cue state: ${response.error.message}`);
  }
}

async function countCueFixtureWorkItems() {
  const estimateResponse = await fixture.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("company_id", fixture.organizationId)
    .eq("source_type", "estimate")
    .eq("source_id", fixture.estimateId);

  if (estimateResponse.error) {
    throw new Error(
      `Unable to count estimate work items before cue state QA: ${estimateResponse.error.message}`
    );
  }

  const invoiceResponse = await fixture.supabase
    .from("work_items")
    .select("id", { count: "exact", head: true })
    .eq("company_id", fixture.organizationId)
    .eq("source_type", "invoice")
    .eq("source_id", fixture.overdueInvoiceId);

  if (invoiceResponse.error) {
    throw new Error(
      `Unable to count invoice work items before cue state QA: ${invoiceResponse.error.message}`
    );
  }

  return (estimateResponse.count ?? 0) + (invoiceResponse.count ?? 0);
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
    await clearFixtureCueStates();
  });

  test.afterAll(async () => {
    await clearFixtureCueStates();
    await restoreWorkflowGuidance();
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
      [fixture.estimatePath, fixture.titles.estimate, "Open estimate"],
      [fixture.sentContractPath, fixture.titles.contractSent, "Open contract"],
      [fixture.viewedContractPath, fixture.titles.contractViewed, "Open contract"],
      [fixture.overdueInvoicePath, fixture.titles.invoiceOverdue, "Open invoice"],
      [fixture.depositInvoicePath, fixture.titles.depositInvoice, "Open deposit invoice"],
      [fixture.unscheduledJobPath, fixture.titles.jobReady, "Open schedule"],
      [fixture.scheduledJobPath, fixture.titles.jobMissingCrew, "Open job"]
    ];

    for (const [path, title, actionLabel] of checks) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expectAuthenticatedPage(page);

      const panel = needsAttentionPanel(page);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(title);
      await expect(panel).toContainText("Threshold:");
      await expect(
        panel.getByRole("link", {
          name: `${actionLabel}: ${title}`,
          exact: true
        })
      ).toHaveCount(1);
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

  test("record cue-state controls are user-scoped and do not mutate canonical records", async ({
    page
  }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    await clearFixtureCueStates();
    const issues = attachIssueCapture(page);

    const estimateBefore = await fixture.supabase
      .from("estimates")
      .select("status")
      .eq("id", fixture.estimateId)
      .single();

    if (estimateBefore.error) {
      throw new Error(`Unable to inspect estimate before cue state QA: ${estimateBefore.error.message}`);
    }

    const workItemCountBefore = await countCueFixtureWorkItems();

    await page.goto(fixture.estimatePath, { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    let panel = needsAttentionPanel(page);
    await expect(panel).toContainText(fixture.titles.estimate);
    await expect(panel.getByRole("button", { name: "Dismiss" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Snooze" })).toBeVisible();
    await expect(panel).toContainText("Only for you");

    await panel.getByRole("button", { name: "Dismiss" }).click();
    await page.waitForURL(/message=Cue\+dismissed\./, { timeout: 15_000 });
    await expect(page.getByText(fixture.titles.estimate)).toHaveCount(0);

    const dismissedState = await fixture.supabase
      .from("workflow_cue_states")
      .select("scope,user_id,state,dismissed_at,snoozed_until")
      .eq("company_id", fixture.organizationId)
      .eq("cue_family", "operational")
      .eq("cue_key", "estimate_sent_followup")
      .eq("subject_id", fixture.estimateId)
      .eq("user_id", fixture.userId)
      .single();

    if (dismissedState.error) {
      throw new Error(`Unable to inspect dismissed cue state: ${dismissedState.error.message}`);
    }

    expect(dismissedState.data).toMatchObject({
      scope: "user",
      user_id: fixture.userId,
      state: "dismissed",
      snoozed_until: null
    });
    expect(dismissedState.data.dismissed_at).toBeTruthy();

    const estimateAfter = await fixture.supabase
      .from("estimates")
      .select("status")
      .eq("id", fixture.estimateId)
      .single();

    if (estimateAfter.error) {
      throw new Error(`Unable to inspect estimate after cue state QA: ${estimateAfter.error.message}`);
    }

    expect(estimateAfter.data.status).toBe(estimateBefore.data.status);

    const invoiceBefore = await fixture.supabase
      .from("invoices")
      .select("status")
      .eq("id", fixture.overdueInvoiceId)
      .single();

    if (invoiceBefore.error) {
      throw new Error(`Unable to inspect invoice before cue state QA: ${invoiceBefore.error.message}`);
    }

    await page.goto(fixture.overdueInvoicePath, { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    panel = needsAttentionPanel(page);
    await expect(panel).toContainText(fixture.titles.invoiceOverdue);
    await expect(panel.getByRole("button", { name: "Dismiss" })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: "Snooze" })).toBeVisible();
    await panel.getByRole("combobox", { name: "Snooze duration" }).selectOption("next_week");
    await panel.getByRole("button", { name: "Snooze" }).click();
    await page.waitForURL(/message=Cue\+snoozed\./, { timeout: 15_000 });
    await expect(page.getByText(fixture.titles.invoiceOverdue)).toHaveCount(0);

    const snoozedState = await fixture.supabase
      .from("workflow_cue_states")
      .select("scope,user_id,state,dismissed_at,snoozed_until")
      .eq("company_id", fixture.organizationId)
      .eq("cue_family", "operational")
      .eq("cue_key", "invoice_overdue")
      .eq("subject_id", fixture.overdueInvoiceId)
      .eq("user_id", fixture.userId)
      .single();

    if (snoozedState.error) {
      throw new Error(`Unable to inspect snoozed cue state: ${snoozedState.error.message}`);
    }

    expect(snoozedState.data.scope).toBe("user");
    expect(snoozedState.data.user_id).toBe(fixture.userId);
    expect(snoozedState.data.state).toBe("snoozed");
    expect(snoozedState.data.snoozed_until).toBeTruthy();

    const expireResponse = await fixture.supabase
      .from("workflow_cue_states")
      .update({ snoozed_until: "2020-01-01T00:00:00.000Z", updated_by: fixture.userId })
      .eq("company_id", fixture.organizationId)
      .eq("cue_family", "operational")
      .eq("cue_key", "invoice_overdue")
      .eq("subject_id", fixture.overdueInvoiceId)
      .eq("user_id", fixture.userId);

    if (expireResponse.error) {
      throw new Error(`Unable to expire snoozed cue state: ${expireResponse.error.message}`);
    }

    await page.goto(fixture.overdueInvoicePath, { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);
    await expect(needsAttentionPanel(page)).toContainText(fixture.titles.invoiceOverdue);

    const invoiceAfter = await fixture.supabase
      .from("invoices")
      .select("status")
      .eq("id", fixture.overdueInvoiceId)
      .single();

    if (invoiceAfter.error) {
      throw new Error(`Unable to inspect invoice after cue state QA: ${invoiceAfter.error.message}`);
    }

    expect(invoiceAfter.data.status).toBe(invoiceBefore.data.status);
    await expect.poll(() => countCueFixtureWorkItems()).toBe(workItemCountBefore);
    expect(issues).toEqual([]);
  });
});
