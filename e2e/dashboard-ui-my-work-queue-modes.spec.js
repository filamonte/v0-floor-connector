const { test, expect } = require("@playwright/test");
const { loadRootEnv } = require("./auth-utils");

const cueRules = [
  ["estimate_sent_followup", "estimate", 1, "estimator"],
  ["invoice_overdue", "invoice", 1, "billing_owner"],
  ["job_ready_unscheduled", "job", 1, "record_owner"]
];

const roleKeys = ["estimator", "billing_owner"];

const fixtureNames = {
  customerEmail: "e2e-my-work-queues@floorconnector.local",
  customerName: "E2E My Work Queue Customer",
  projectName: "[E2E] My Work Queue Modes",
  opportunitySourceDetail: "my-work-queue-modes",
  estimateReference: "E2E-MWQ-USER",
  invoiceReference: "E2E-MWQ-PERSON",
  jobNotes: "E2E my work queue unresolved job fixture.",
  linkedPersonDisplayName: "E2E My Work Linked Person",
  unlinkedPersonDisplayName: "E2E My Work Person Only"
};

let fixture;

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
        "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FLOORCONNECTOR_E2E_EMAIL to seed My Work queue fixtures."
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

async function deleteExistingFixtureData({ supabase, organizationId }) {
  const jobsResponse = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", organizationId)
    .eq("notes", fixtureNames.jobNotes);

  if (jobsResponse.error) {
    throw new Error(`Unable to load existing queue fixture jobs: ${jobsResponse.error.message}`);
  }

  const jobIds = (jobsResponse.data ?? []).map((job) => job.id);

  if (jobIds.length > 0) {
    const assignmentDeleteResponse = await supabase
      .from("job_assignments")
      .delete()
      .eq("company_id", organizationId)
      .in("job_id", jobIds);

    if (assignmentDeleteResponse.error) {
      throw new Error(
        `Unable to delete existing queue fixture job assignments: ${assignmentDeleteResponse.error.message}`
      );
    }

    const jobDeleteResponse = await supabase
      .from("jobs")
      .delete()
      .eq("company_id", organizationId)
      .in("id", jobIds);

    if (jobDeleteResponse.error) {
      throw new Error(`Unable to delete existing queue fixture jobs: ${jobDeleteResponse.error.message}`);
    }
  }

  const invoiceResponse = await supabase
    .from("invoices")
    .select("id")
    .eq("company_id", organizationId)
    .eq("reference_number", fixtureNames.invoiceReference);

  if (invoiceResponse.error) {
    throw new Error(
      `Unable to load existing queue fixture invoices: ${invoiceResponse.error.message}`
    );
  }

  const invoiceIds = (invoiceResponse.data ?? []).map((invoice) => invoice.id);

  if (invoiceIds.length > 0) {
    const lineDeleteResponse = await supabase
      .from("invoice_line_items")
      .delete()
      .eq("company_id", organizationId)
      .in("invoice_id", invoiceIds);

    if (lineDeleteResponse.error) {
      throw new Error(
        `Unable to delete existing queue fixture invoice lines: ${lineDeleteResponse.error.message}`
      );
    }

    const invoiceDeleteResponse = await supabase
      .from("invoices")
      .delete()
      .eq("company_id", organizationId)
      .in("id", invoiceIds);

    if (invoiceDeleteResponse.error) {
      throw new Error(
        `Unable to delete existing queue fixture invoices: ${invoiceDeleteResponse.error.message}`
      );
    }
  }

  await deleteByMatch(supabase, "estimates", {
    company_id: organizationId,
    reference_number: fixtureNames.estimateReference
  });
  await deleteByMatch(supabase, "opportunities", {
    company_id: organizationId,
    source_detail: fixtureNames.opportunitySourceDetail
  });
  await deleteByMatch(supabase, "projects", {
    company_id: organizationId,
    name: fixtureNames.projectName
  });
  await deleteByMatch(supabase, "customers", {
    company_id: organizationId,
    email: fixtureNames.customerEmail
  });
}

async function deleteByMatch(supabase, table, match) {
  let query = supabase.from(table).delete();
  for (const [column, value] of Object.entries(match)) {
    query = query.eq(column, value);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to delete ${table} fixture: ${response.error.message}`);
  }
}

async function preserveCueRules({ supabase, organizationId }) {
  const response = await supabase
    .from("organization_operational_cue_rules")
    .select("*")
    .eq("organization_id", organizationId)
    .in(
      "cue_key",
      cueRules.map(([cueKey]) => cueKey)
    );

  if (response.error) {
    throw new Error(`Unable to load My Work cue rules: ${response.error.message}`);
  }

  return new Map((response.data ?? []).map((rule) => [rule.cue_key, rule]));
}

async function forceCueRules({ supabase, organizationId }) {
  const now = new Date().toISOString();
  const response = await supabase.from("organization_operational_cue_rules").upsert(
    cueRules.map(([cueKey, subjectType, thresholdDays, ownerStrategy]) => ({
      organization_id: organizationId,
      cue_key: cueKey,
      subject_type: subjectType,
      enabled: true,
      threshold_days: thresholdDays,
      urgency: "critical",
      owner_strategy: ownerStrategy,
      escalation_days: null,
      updated_at: now
    })),
    { onConflict: "organization_id,cue_key" }
  );

  if (response.error) {
    throw new Error(`Unable to force My Work cue rules: ${response.error.message}`);
  }
}

async function preserveResponsibilityDefaults({ supabase, organizationId }) {
  const response = await supabase
    .from("organization_responsibility_role_defaults")
    .select("*")
    .eq("organization_id", organizationId)
    .in("role_key", roleKeys);

  if (response.error) {
    throw new Error(
      `Unable to load My Work responsibility defaults: ${response.error.message}`
    );
  }

  return new Map((response.data ?? []).map((defaultRole) => [defaultRole.role_key, defaultRole]));
}

async function ensureLinkedPerson({ supabase, organizationId, userId }) {
  const existingResponse = await supabase
    .from("people")
    .select("id, display_name")
    .eq("company_id", organizationId)
    .eq("membership_user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(`Unable to load linked E2E person: ${existingResponse.error.message}`);
  }

  if (existingResponse.data) {
    return { id: existingResponse.data.id, created: false };
  }

  const insertResponse = await supabase
    .from("people")
    .insert({
      company_id: organizationId,
      membership_user_id: userId,
      person_type: "employee",
      display_name: fixtureNames.linkedPersonDisplayName,
      first_name: "E2E",
      last_name: "Linked",
      email: "e2e-my-work-linked@floorconnector.local",
      job_title: "E2E Linked Person",
      is_assignable: true,
      is_active: true,
      notes: "Temporary linked Person for My Work queue mode browser QA.",
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create linked E2E person: ${insertResponse.error.message}`);
  }

  return { id: insertResponse.data.id, created: true };
}

async function createUnlinkedPerson({ supabase, organizationId, userId }) {
  const existingResponse = await supabase
    .from("people")
    .select("id")
    .eq("company_id", organizationId)
    .eq("display_name", fixtureNames.unlinkedPersonDisplayName)
    .limit(1)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load unlinked E2E person: ${existingResponse.error.message}`
    );
  }

  if (existingResponse.data) {
    const updateResponse = await supabase
      .from("people")
      .update({
        membership_user_id: null,
        is_assignable: true,
        is_active: true,
        updated_by: userId
      })
      .eq("company_id", organizationId)
      .eq("id", existingResponse.data.id)
      .select("id")
      .single();

    if (updateResponse.error) {
      throw new Error(
        `Unable to refresh unlinked E2E person: ${updateResponse.error.message}`
      );
    }

    return { id: updateResponse.data.id, created: false };
  }

  const response = await supabase
    .from("people")
    .insert({
      company_id: organizationId,
      membership_user_id: null,
      person_type: "employee",
      display_name: fixtureNames.unlinkedPersonDisplayName,
      first_name: "E2E",
      last_name: "Person Only",
      email: "e2e-my-work-person-only@floorconnector.local",
      job_title: "E2E Person Resolved",
      is_assignable: true,
      is_active: true,
      notes: "Temporary unlinked Person for My Work queue mode browser QA.",
      created_by: userId,
      updated_by: userId
    })
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create unlinked E2E person: ${response.error.message}`);
  }

  return { id: response.data.id, created: true };
}

async function forceResponsibilityDefaults({
  supabase,
  organizationId,
  userId,
  linkedPersonId,
  unlinkedPersonId
}) {
  const response = await supabase
    .from("organization_responsibility_role_defaults")
    .upsert(
      [
        {
          organization_id: organizationId,
          role_key: "estimator",
          person_id: linkedPersonId,
          updated_by: userId
        },
        {
          organization_id: organizationId,
          role_key: "billing_owner",
          person_id: unlinkedPersonId,
          updated_by: userId
        }
      ],
      { onConflict: "organization_id,role_key" }
    );

  if (response.error) {
    throw new Error(
      `Unable to force My Work responsibility defaults: ${response.error.message}`
    );
  }
}

async function insertFixtureRecords({ supabase, organizationId, userId }) {
  const customer = await insertRow(supabase, "customers", {
    company_id: organizationId,
    email: fixtureNames.customerEmail,
    name: fixtureNames.customerName,
    company_name: "FloorConnector E2E",
    phone: "555-0199",
    notes: "Temporary customer for My Work queue mode browser QA.",
    created_by: userId,
    updated_by: userId
  });

  const project = await insertRow(supabase, "projects", {
    company_id: organizationId,
    customer_id: customer.id,
    name: fixtureNames.projectName,
    status: "approved",
    description: "Temporary project for My Work queue mode browser QA.",
    address_line_1: "210 E2E Queue Way",
    city: "Fixture City",
    state_region: "FL",
    postal_code: "00000",
    country_code: "US",
    commercial_readiness_status: "ready_to_schedule",
    ready_to_schedule_at: isoDaysFromNow(-120),
    financing_status: "not_applicable",
    created_by: userId,
    updated_by: userId
  });

  const opportunity = await insertRow(supabase, "opportunities", {
    company_id: organizationId,
    customer_id: customer.id,
    project_id: project.id,
    status: "converted",
    title: fixtureNames.projectName,
    source: "e2e",
    source_detail: fixtureNames.opportunitySourceDetail,
    prospect_name: fixtureNames.customerName,
    prospect_company_name: "FloorConnector E2E",
    email: fixtureNames.customerEmail,
    phone: "555-0199",
    site_name: fixtureNames.projectName,
    service_type: "Epoxy flooring",
    site_assessment_status: "completed",
    requirements_summary: "Temporary opportunity for My Work queue mode browser QA.",
    qualified_at: isoDaysFromNow(-120),
    converted_at: isoDaysFromNow(-120),
    created_by: userId,
    updated_by: userId
  });

  const estimate = await insertRow(supabase, "estimates", {
    company_id: organizationId,
    customer_id: customer.id,
    project_id: project.id,
    opportunity_id: opportunity.id,
    status: "sent",
    sent_at: isoDaysFromNow(-120),
    subtotal_amount: "1000.00",
    tax_amount: "0.00",
    discount_amount: "0.00",
    total_amount: "1000.00",
    reference_number: fixtureNames.estimateReference,
    title: "E2E My Work User Resolved Estimate",
    notes: "Temporary sent estimate for My Work queue mode browser QA.",
    content: {
      termsHtml: "<p>E2E fixture terms.</p>",
      inclusionsHtml: "<p>E2E fixture inclusions.</p>",
      exclusionsHtml: "<p>E2E fixture exclusions.</p>",
      notesHtml: "<p>E2E fixture notes.</p>",
      scopeSummaryHtml: "<p>E2E My Work queue fixture scope.</p>",
      scopeItems: [],
      itemGroups: [],
      itemRows: []
    },
    created_by: userId,
    updated_by: userId
  });

  const invoice = await insertRow(supabase, "invoices", {
    company_id: organizationId,
    customer_id: customer.id,
    project_id: project.id,
    estimate_id: estimate.id,
    status: "sent",
    billing_model: "standard",
    workflow_role: "standard",
    issue_date: dateDaysFromNow(-120),
    due_date: dateDaysFromNow(-90),
    subtotal_amount: "600.00",
    tax_amount: "0.00",
    discount_amount: "0.00",
    total_amount: "600.00",
    balance_due_amount: "600.00",
    reference_number: fixtureNames.invoiceReference,
    notes: "Temporary overdue invoice for My Work queue mode browser QA.",
    created_by: userId,
    updated_by: userId
  });

  const job = await insertRow(supabase, "jobs", {
    company_id: organizationId,
    customer_id: customer.id,
    project_id: project.id,
    estimate_id: estimate.id,
    dispatch_status: "unscheduled",
    scheduled_date: null,
    scheduled_start_at: null,
    scheduled_end_at: null,
    crew_vendor_id: null,
    notes: fixtureNames.jobNotes,
    created_by: userId,
    updated_by: userId
  });

  return {
    estimatePath: `/estimates/${estimate.id}`,
    invoicePath: `/invoices/${invoice.id}`,
    jobPath: `/jobs/${job.id}`,
    titles: {
      userResolved: `Follow up on ${fixtureNames.estimateReference}`,
      personResolvedLabel: `Responsible: ${fixtureNames.unlinkedPersonDisplayName}`,
      unresolved: "Ready job is still unscheduled"
    }
  };
}

async function insertRow(supabase, table, values) {
  const response = await supabase.from(table).insert(values).select("id").single();

  if (response.error) {
    throw new Error(`Unable to create ${table} fixture: ${response.error.message}`);
  }

  return response.data;
}

async function restoreCueRules() {
  if (!fixture?.supabase || !fixture?.organizationId) {
    return;
  }

  const insertedCueKeys = cueRules
    .map(([cueKey]) => cueKey)
    .filter((cueKey) => !fixture.originalRulesByKey.has(cueKey));

  if (insertedCueKeys.length > 0) {
    const response = await fixture.supabase
      .from("organization_operational_cue_rules")
      .delete()
      .eq("organization_id", fixture.organizationId)
      .in("cue_key", insertedCueKeys);

    if (response.error) {
      throw new Error(`Unable to delete inserted My Work cue rules: ${response.error.message}`);
    }
  }

  for (const rule of fixture.originalRulesByKey.values()) {
    const response = await fixture.supabase
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

    if (response.error) {
      throw new Error(`Unable to restore My Work cue rule ${rule.cue_key}: ${response.error.message}`);
    }
  }
}

async function restoreResponsibilityDefaults() {
  if (!fixture?.supabase || !fixture?.organizationId) {
    return;
  }

  const insertedRoleKeys = roleKeys.filter(
    (roleKey) => !fixture.originalDefaultsByRoleKey.has(roleKey)
  );

  if (insertedRoleKeys.length > 0) {
    const response = await fixture.supabase
      .from("organization_responsibility_role_defaults")
      .delete()
      .eq("organization_id", fixture.organizationId)
      .in("role_key", insertedRoleKeys);

    if (response.error) {
      throw new Error(
        `Unable to delete inserted My Work responsibility defaults: ${response.error.message}`
      );
    }
  }

  for (const defaultRole of fixture.originalDefaultsByRoleKey.values()) {
    const response = await fixture.supabase
      .from("organization_responsibility_role_defaults")
      .update({
        person_id: defaultRole.person_id,
        updated_by: defaultRole.updated_by,
        updated_at: defaultRole.updated_at
      })
      .eq("id", defaultRole.id);

    if (response.error) {
      throw new Error(
        `Unable to restore My Work responsibility default ${defaultRole.role_key}: ${response.error.message}`
      );
    }
  }
}

async function cleanupFixtureData() {
  if (!fixture?.supabase || !fixture?.organizationId) {
    return;
  }

  await deleteExistingFixtureData(fixture);

  for (const personId of fixture.tempPersonIds ?? []) {
    const response = await fixture.supabase
      .from("people")
      .delete()
      .eq("company_id", fixture.organizationId)
      .eq("id", personId);

    if (response.error) {
      throw new Error(`Unable to delete temporary My Work person: ${response.error.message}`);
    }
  }
}

async function ensureFixture() {
  const context = await getSupabaseFixtureContext();

  if (context.skipReason) {
    return context;
  }

  const { supabase, organizationId, userId } = context;
  await deleteExistingFixtureData({ supabase, organizationId });

  const originalRulesByKey = await preserveCueRules({ supabase, organizationId });
  const originalDefaultsByRoleKey = await preserveResponsibilityDefaults({
    supabase,
    organizationId
  });
  const linkedPerson = await ensureLinkedPerson({ supabase, organizationId, userId });
  const unlinkedPerson = await createUnlinkedPerson({
    supabase,
    organizationId,
    userId
  });

  await forceCueRules({ supabase, organizationId });
  await forceResponsibilityDefaults({
    supabase,
    organizationId,
    userId,
    linkedPersonId: linkedPerson.id,
    unlinkedPersonId: unlinkedPerson.id
  });

  const records = await insertFixtureRecords({ supabase, organizationId, userId });

  return {
    supabase,
    organizationId,
    originalRulesByKey,
    originalDefaultsByRoleKey,
    tempPersonIds: [
      ...(linkedPerson.created ? [linkedPerson.id] : []),
      ...(unlinkedPerson.created ? [unlinkedPerson.id] : [])
    ],
    ...records
  };
}

async function expectAuthenticatedPage(page) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "My Work queue mode QA requires authenticated storage state. Run the setup project with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD."
    );
  }
}

function myWorkSection(page) {
  return page.locator('section[aria-labelledby="dashboard-my-work-title"]');
}

test.describe.serial("dashboard My Work queue modes", () => {
  test.beforeAll(async () => {
    fixture = await ensureFixture();
  });

  test.afterAll(async () => {
    await restoreCueRules();
    await restoreResponsibilityDefaults();
    await cleanupFixtureData();
  });

  test("filters Company, Mine, and Unresolved without hiding safety-net cues", async ({
    page
  }) => {
    test.skip(Boolean(fixture.skipReason), fixture.skipReason);
    const issues = attachIssueCapture(page);

    await page.goto("/dashboard?myWork=company", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);

    const company = myWorkSection(page);
    await expect(company.getByRole("tab", { name: /Company\s+\d+/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(company).toContainText(fixture.titles.userResolved);
    await expect(company).toContainText(fixture.titles.personResolvedLabel);
    await expect(company).toContainText(fixture.titles.unresolved);

    await page.goto("/dashboard?myWork=mine", { waitUntil: "domcontentloaded" });
    await expectAuthenticatedPage(page);

    const mine = myWorkSection(page);
    await expect(mine.getByRole("tab", { name: /Mine\s+\d+/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(mine).toContainText("Items resolved to you");
    await expect(mine).toContainText(fixture.titles.userResolved);
    await expect(mine).not.toContainText(fixture.titles.personResolvedLabel);
    await expect(mine).not.toContainText(fixture.titles.unresolved);

    const mineEstimateLink = mine.getByRole("link", {
      name: `Open estimate: ${fixture.titles.userResolved}`,
      exact: true
    });
    await expect(mineEstimateLink).toBeVisible();
    await mineEstimateLink.click();
    await page.waitForURL(`**${fixture.estimatePath}`, { timeout: 15_000 });
    await expectAuthenticatedPage(page);
    await expect(page.locator('section[aria-labelledby="needs-attention-title"]')).toBeVisible();

    await page.goto("/dashboard?myWork=unresolved", {
      waitUntil: "domcontentloaded"
    });
    await expectAuthenticatedPage(page);

    const unresolved = myWorkSection(page);
    await expect(
      unresolved.getByRole("tab", { name: /Unresolved\s+\d+/ })
    ).toHaveAttribute("aria-selected", "true");
    await expect(unresolved).toContainText("These attention items need a responsible person/default");
    await expect(unresolved).toContainText(fixture.titles.unresolved);
    await expect(unresolved).not.toContainText(fixture.titles.userResolved);
    await expect(unresolved).not.toContainText(fixture.titles.personResolvedLabel);

    expect(issues).toEqual([]);
  });
});
