const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const fixturePrefix = "[E2E] Golden Browser Workflow";

test.setTimeout(120_000);

function getPortalAuthStatePath() {
  return path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
      "playwright/.auth/portal-user.json"
  );
}

function getRequiredEnv(names) {
  loadRootEnv();
  const missing = names.filter((name) => !process.env[name]?.trim());

  return {
    missing,
    values:
      missing.length === 0
        ? Object.fromEntries(
            names.map((name) => [name, process.env[name].trim()])
          )
        : null
  };
}

function createAdminClient(env) {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}

async function getFixtureContext(supabase, env) {
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", env.FLOORCONNECTOR_E2E_EMAIL)
    .maybeSingle();

  if (userResponse.error || !userResponse.data) {
    throw new Error(
      `Unable to load contractor E2E user: ${
        userResponse.error?.message ?? "No canonical public.users row found."
      }`
    );
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error || !membershipResponse.data) {
    throw new Error(
      `Unable to load contractor E2E organization: ${
        membershipResponse.error?.message ?? "No active membership found."
      }`
    );
  }

  return {
    organizationId: membershipResponse.data.company_id,
    userId: userResponse.data.id
  };
}

async function insertOne(supabase, table, payload, label, select = "id") {
  const response = await supabase
    .from(table)
    .insert(payload)
    .select(select)
    .single();

  if (response.error) {
    throw new Error(`Unable to create ${label}: ${response.error.message}`);
  }

  return response.data;
}

async function updateOne(
  supabase,
  table,
  payload,
  filters,
  label,
  select = "id"
) {
  let query = supabase.from(table).update(payload);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const response = await query.select(select).single();

  if (response.error) {
    throw new Error(`Unable to update ${label}: ${response.error.message}`);
  }

  return response.data;
}

async function findSingleBy(supabase, table, select, filters) {
  let query = supabase.from(table).select(select);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const response = await query
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load ${table}: ${response.error.message}`);
  }

  return response.data;
}

async function countRows(supabase, table, filters) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count ${table}: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function createBlockedWorkflowFixture(supabase, context, env) {
  const now = new Date();
  const stamp = `${now.getTime()}`;
  const today = now.toISOString().slice(0, 10);
  const customerName = `${fixturePrefix} Customer ${stamp}`;
  const projectName = `${fixturePrefix} Project ${stamp}`;
  const customerEmail = `e2e-golden-browser-${stamp}@floorconnector.local`;

  const customer = await insertOne(
    supabase,
    "customers",
    {
      company_id: context.organizationId,
      name: customerName,
      company_name: "FloorConnector E2E",
      email: customerEmail,
      phone: "555-0100",
      notes:
        "Disposable canonical fixture for browser-level golden workflow verification.",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden customer"
  );
  const project = await insertOne(
    supabase,
    "projects",
    {
      company_id: context.organizationId,
      customer_id: customer.id,
      name: projectName,
      status: "approved",
      description:
        "Disposable canonical fixture proving opportunity through payment continuity.",
      address_line_1: "100 Golden Workflow Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: "waiting_on_signature",
      financing_status: "not_applicable",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden project"
  );
  const opportunity = await insertOne(
    supabase,
    "opportunities",
    {
      company_id: context.organizationId,
      customer_id: customer.id,
      project_id: project.id,
      status: "converted",
      title: `${projectName} opportunity`,
      source: "e2e",
      source_detail: "golden-browser-workflow",
      prospect_name: customerName,
      prospect_company_name: "FloorConnector E2E",
      email: customerEmail,
      phone: "555-0100",
      site_name: projectName,
      service_type: "Epoxy flooring",
      site_assessment_status: "completed",
      requirements_summary:
        "Disposable browser-level verification opportunity converted into the canonical project chain.",
      qualified_at: now.toISOString(),
      converted_at: now.toISOString(),
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden opportunity"
  );
  const estimate = await insertOne(
    supabase,
    "estimates",
    {
      company_id: context.organizationId,
      customer_id: customer.id,
      project_id: project.id,
      opportunity_id: opportunity.id,
      title: `${fixturePrefix} Estimate ${stamp}`,
      status: "approved",
      discount_amount: "0.00",
      notes: "Approved estimate fixture for canonical contract handoff.",
      content: {
        termsHtml: "<p>E2E golden workflow terms.</p>",
        inclusionsHtml: "<p>E2E golden workflow inclusions.</p>",
        exclusionsHtml: "<p>E2E golden workflow exclusions.</p>",
        notesHtml: "<p>E2E golden workflow notes.</p>",
        scopeSummaryHtml: "<p>Golden browser workflow scope.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden estimate",
    "id, reference_number, title"
  );
  const contract = await insertOne(
    supabase,
    "contracts",
    {
      company_id: context.organizationId,
      customer_id: customer.id,
      project_id: project.id,
      estimate_id: estimate.id,
      status: "sent",
      title: `${fixturePrefix} Contract ${stamp}`,
      rendered_subject: `${fixturePrefix} Contract ${stamp}`,
      rendered_content:
        "<p>Sent contract fixture used to prove blocked readiness before signature.</p>",
      generated_from_estimate_reference: estimate.reference_number,
      sent_at: now.toISOString(),
      signature_started_at: now.toISOString(),
      internal_approval_status: "approved",
      internal_approved_at: now.toISOString(),
      signature_readiness_status: "out_for_signature",
      locked_at: now.toISOString(),
      edit_lock_reason: "signature_activity_started",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden contract",
    "id, title"
  );
  const signer = await insertOne(
    supabase,
    "contract_signers",
    {
      company_id: context.organizationId,
      contract_id: contract.id,
      signer_role: "customer",
      signer_status: "pending",
      customer_id: customer.id,
      portal_user_id: null,
      organization_user_id: null,
      display_name: customerName,
      email: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? customerEmail,
      signer_order: 1
    },
    "golden contract signer"
  );

  return {
    customerId: customer.id,
    customerName,
    customerEmail,
    projectId: project.id,
    projectName,
    opportunityId: opportunity.id,
    estimateId: estimate.id,
    estimateTitle: estimate.title,
    contractId: contract.id,
    contractTitle: contract.title,
    signerId: signer.id,
    today
  };
}

async function signContractAndCreateDownstreamRecords(
  supabase,
  context,
  fixture
) {
  const signedAt = new Date().toISOString();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await updateOne(
    supabase,
    "contract_signers",
    {
      signer_status: "signed",
      viewed_at: signedAt,
      signed_at: signedAt
    },
    [
      { column: "company_id", value: context.organizationId },
      { column: "id", value: fixture.signerId }
    ],
    "golden contract signer"
  );
  await updateOne(
    supabase,
    "contracts",
    {
      status: "signed",
      viewed_at: signedAt,
      customer_viewed_at: signedAt,
      customer_signed_at: signedAt,
      signed_at: signedAt,
      signature_readiness_status: "signed",
      updated_by: context.userId
    },
    [
      { column: "company_id", value: context.organizationId },
      { column: "id", value: fixture.contractId }
    ],
    "golden contract"
  );
  await insertOne(
    supabase,
    "contract_signature_events",
    {
      company_id: context.organizationId,
      contract_id: fixture.contractId,
      contract_signer_id: fixture.signerId,
      event_type: "signer_signed",
      actor_type: "portal_user",
      payload: { source: "golden-workflow-verification" },
      occurred_at: signedAt
    },
    "golden signer signed event"
  );
  await insertOne(
    supabase,
    "contract_signature_events",
    {
      company_id: context.organizationId,
      contract_id: fixture.contractId,
      contract_signer_id: fixture.signerId,
      event_type: "signature_completed",
      actor_type: "system",
      payload: { source: "golden-workflow-verification" },
      occurred_at: signedAt
    },
    "golden signature completed event"
  );
  await updateOne(
    supabase,
    "projects",
    {
      commercial_readiness_status: "ready_to_schedule",
      ready_to_schedule_at: signedAt,
      updated_by: context.userId
    },
    [
      { column: "company_id", value: context.organizationId },
      { column: "id", value: fixture.projectId }
    ],
    "golden project"
  );

  const job = await insertOne(
    supabase,
    "jobs",
    {
      company_id: context.organizationId,
      customer_id: fixture.customerId,
      project_id: fixture.projectId,
      estimate_id: fixture.estimateId,
      dispatch_status: "unscheduled",
      notes: "Golden browser workflow unscheduled job created after readiness.",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden job"
  );
  const invoice = await insertOne(
    supabase,
    "invoices",
    {
      company_id: context.organizationId,
      customer_id: fixture.customerId,
      project_id: fixture.projectId,
      estimate_id: fixture.estimateId,
      job_id: null,
      reference_number: `E2E-GOLDEN-${Date.now()}`,
      workflow_role: "standard",
      billing_model: "standard",
      status: "sent",
      issue_date: fixture.today,
      due_date: dueDate.toISOString().slice(0, 10),
      subtotal_amount: "0.00",
      tax_amount: "0.00",
      discount_amount: "0.00",
      retainage_held_amount: "0.00",
      total_amount: "0.00",
      balance_due_amount: "0.00",
      notes:
        "Golden browser workflow standard invoice created after commercial readiness.",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden invoice",
    "id, reference_number"
  );
  await insertOne(
    supabase,
    "invoice_line_items",
    {
      company_id: context.organizationId,
      invoice_id: invoice.id,
      name: "Golden workflow verification line",
      description: "Canonical invoice line for paid-state continuity.",
      quantity: "1.00",
      unit: "each",
      unit_price: "1800.00",
      sort_order: 1,
      lineage_type: "invoice_only_adjustment",
      invoice_only_adjustment_kind: "explicit_adjustment",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden invoice line item"
  );

  return {
    jobId: job.id,
    invoiceId: invoice.id,
    invoiceReference: invoice.reference_number
  };
}

async function recordPayment(supabase, context, fixture) {
  const payment = await insertOne(
    supabase,
    "payments",
    {
      company_id: context.organizationId,
      invoice_id: fixture.invoiceId,
      amount: "1800.00",
      payment_date: fixture.today,
      payment_method: "other",
      reference: `golden-browser-${Date.now()}`,
      notes: "Golden browser workflow canonical payment.",
      status: "recorded",
      payment_source: "manual",
      recorded_via: "contractor_app",
      gateway_provider: "local_manual",
      gateway_status: "paid",
      payment_method_summary: "Local manual E2E payment",
      created_by: context.userId,
      updated_by: context.userId
    },
    "golden payment"
  );

  await insertOne(
    supabase,
    "payment_events",
    {
      company_id: context.organizationId,
      invoice_id: fixture.invoiceId,
      payment_id: payment.id,
      event_type: "payment_succeeded",
      actor_type: "organization_user",
      actor_user_id: context.userId,
      gateway_provider: "local_manual",
      provider_event_id: `golden-browser-${payment.id}`,
      payload: { source: "golden-workflow-verification" }
    },
    "golden payment succeeded event"
  );

  return payment;
}

async function loadWorkflowSnapshot(supabase, context, fixture) {
  const [opportunity, project, estimate, contract, job, invoice, payment] =
    await Promise.all([
      findSingleBy(
        supabase,
        "opportunities",
        "id, customer_id, project_id, status",
        [
          { column: "company_id", value: context.organizationId },
          { column: "id", value: fixture.opportunityId }
        ]
      ),
      findSingleBy(
        supabase,
        "projects",
        "id, customer_id, commercial_readiness_status, ready_to_schedule_at",
        [
          { column: "company_id", value: context.organizationId },
          { column: "id", value: fixture.projectId }
        ]
      ),
      findSingleBy(
        supabase,
        "estimates",
        "id, customer_id, project_id, opportunity_id, status",
        [
          { column: "company_id", value: context.organizationId },
          { column: "id", value: fixture.estimateId }
        ]
      ),
      findSingleBy(
        supabase,
        "contracts",
        "id, customer_id, project_id, estimate_id, status, signature_readiness_status",
        [
          { column: "company_id", value: context.organizationId },
          { column: "id", value: fixture.contractId }
        ]
      ),
      fixture.jobId
        ? findSingleBy(
            supabase,
            "jobs",
            "id, customer_id, project_id, estimate_id, dispatch_status, scheduled_date, scheduled_start_at",
            [
              { column: "company_id", value: context.organizationId },
              { column: "id", value: fixture.jobId }
            ]
          )
        : null,
      fixture.invoiceId
        ? findSingleBy(
            supabase,
            "invoices",
            "id, customer_id, project_id, estimate_id, job_id, status, balance_due_amount",
            [
              { column: "company_id", value: context.organizationId },
              { column: "id", value: fixture.invoiceId }
            ]
          )
        : null,
      fixture.paymentId
        ? findSingleBy(supabase, "payments", "id, invoice_id, status, amount", [
            { column: "company_id", value: context.organizationId },
            { column: "id", value: fixture.paymentId }
          ])
        : null
    ]);

  return { opportunity, project, estimate, contract, job, invoice, payment };
}

async function ensurePortalContinuity(supabase, context, fixture, env) {
  if (!env.FLOORCONNECTOR_PORTAL_E2E_EMAIL) {
    return {
      status: "blocked",
      reason: "FLOORCONNECTOR_PORTAL_E2E_EMAIL is not configured."
    };
  }

  const portalUser = await findSingleBy(
    supabase,
    "users",
    "id, full_name, email",
    [{ column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }]
  );

  if (!portalUser?.id) {
    return {
      status: "blocked",
      reason:
        "No canonical public.users row exists for FLOORCONNECTOR_PORTAL_E2E_EMAIL."
    };
  }

  let contact = await findSingleBy(
    supabase,
    "contacts",
    "id, display_name, email",
    [
      { column: "company_id", value: context.organizationId },
      { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
    ]
  );

  if (!contact) {
    contact = await insertOne(
      supabase,
      "contacts",
      {
        company_id: context.organizationId,
        display_name: portalUser.full_name ?? "Golden Workflow Portal Contact",
        email: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
        created_by: context.userId,
        updated_by: context.userId
      },
      "golden portal contact"
    );
  }

  let customerContact = await findSingleBy(
    supabase,
    "customer_contacts",
    "id",
    [
      { column: "company_id", value: context.organizationId },
      { column: "customer_id", value: fixture.customerId },
      { column: "contact_id", value: contact.id }
    ]
  );

  if (!customerContact) {
    customerContact = await insertOne(
      supabase,
      "customer_contacts",
      {
        company_id: context.organizationId,
        customer_id: fixture.customerId,
        contact_id: contact.id,
        relationship_label: "Primary",
        is_primary: true,
        created_by: context.userId,
        updated_by: context.userId
      },
      "golden customer contact"
    );
  }

  let grant = await findSingleBy(
    supabase,
    "portal_access_grants",
    "id, status",
    [
      { column: "company_id", value: context.organizationId },
      { column: "customer_id", value: fixture.customerId },
      { column: "user_id", value: portalUser.id }
    ]
  );
  const now = new Date().toISOString();

  if (grant) {
    grant = await updateOne(
      supabase,
      "portal_access_grants",
      {
        status: "active",
        customer_contact_id: customerContact.id,
        invited_email: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
        invited_by: context.userId,
        activated_at: now,
        invite_accepted_at: now,
        revoked_at: null
      },
      [
        { column: "company_id", value: context.organizationId },
        { column: "id", value: grant.id }
      ],
      "golden portal access grant"
    );
  } else {
    grant = await insertOne(
      supabase,
      "portal_access_grants",
      {
        company_id: context.organizationId,
        customer_id: fixture.customerId,
        customer_contact_id: customerContact.id,
        user_id: portalUser.id,
        invited_by: context.userId,
        invited_email: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
        status: "active",
        activated_at: now,
        invite_accepted_at: now
      },
      "golden portal access grant"
    );
  }

  let projectAccess = await findSingleBy(
    supabase,
    "portal_project_access",
    "id, status",
    [
      { column: "company_id", value: context.organizationId },
      { column: "portal_access_grant_id", value: grant.id },
      { column: "project_id", value: fixture.projectId }
    ]
  );

  if (projectAccess) {
    projectAccess = await updateOne(
      supabase,
      "portal_project_access",
      { status: "active", revoked_at: null },
      [
        { column: "company_id", value: context.organizationId },
        { column: "id", value: projectAccess.id }
      ],
      "golden portal project access"
    );
  } else {
    projectAccess = await insertOne(
      supabase,
      "portal_project_access",
      {
        company_id: context.organizationId,
        portal_access_grant_id: grant.id,
        project_id: fixture.projectId,
        status: "active"
      },
      "golden portal project access"
    );
  }

  const existingPermissions = await findSingleBy(
    supabase,
    "customer_contact_portal_permissions",
    "id",
    [
      { column: "company_id", value: context.organizationId },
      { column: "customer_contact_id", value: customerContact.id }
    ]
  );
  const permissionsPayload = {
    portal_access_grant_id: grant.id,
    can_view_estimates: true,
    can_approve_estimates: true,
    can_sign_contracts: true,
    can_approve_change_orders: true,
    can_view_pay_invoices: true,
    can_request_quotes: true,
    management_source: "contractor_admin",
    last_managed_by_user_id: context.userId,
    last_override_by_user_id: context.userId
  };

  if (existingPermissions?.id) {
    await updateOne(
      supabase,
      "customer_contact_portal_permissions",
      permissionsPayload,
      [
        { column: "company_id", value: context.organizationId },
        { column: "id", value: existingPermissions.id }
      ],
      "golden portal permissions"
    );
  } else {
    await insertOne(
      supabase,
      "customer_contact_portal_permissions",
      {
        company_id: context.organizationId,
        customer_contact_id: customerContact.id,
        ...permissionsPayload
      },
      "golden portal permissions"
    );
  }

  return {
    status: "ready",
    portalUserId: portalUser.id,
    grantId: grant.id,
    projectAccessId: projectAccess.id
  };
}

async function newPortalPage(browser, baseURL) {
  loadRootEnv();
  const storageStatePath = getPortalAuthStatePath();
  const hasStorageState = fs.existsSync(storageStatePath);
  const hasCredentials = Boolean(
    process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL &&
    process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD
  );

  if (!hasStorageState && !hasCredentials) {
    return {
      blockedReason:
        "Portal auth state and FLOORCONNECTOR_PORTAL_E2E_EMAIL/PASSWORD are not available."
    };
  }

  const context = await browser.newContext({
    baseURL,
    storageState: hasStorageState ? storageStatePath : undefined
  });
  const page = await context.newPage();

  if (!hasStorageState) {
    await loginWithEmail(
      page,
      process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
      process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD,
      {
        next: "/portal",
        expectedPath: "/portal",
        verifyContent: false
      }
    );
  }

  return { page, context };
}

async function closeContext(context) {
  if (!context) {
    return;
  }

  try {
    await context.close();
  } catch {
    // Browser artifact cleanup must not mask the workflow assertion result.
  }
}

async function expectProtectedPage(page, label) {
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      `${label} requires authenticated protected storage state. Refresh with pnpm e2e:auth.`
    );
  }
}

test("golden workflow carries one canonical chain from converted opportunity to paid invoice", async ({
  page,
  browser,
  baseURL
}) => {
  const required = getRequiredEnv([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FLOORCONNECTOR_E2E_EMAIL"
  ]);

  test.skip(
    required.missing.length > 0,
    `Golden workflow browser verification requires env vars: ${required.missing.join(", ")}.`
  );

  const env = {
    ...required.values,
    FLOORCONNECTOR_PORTAL_E2E_EMAIL:
      process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL?.trim() ?? ""
  };
  const supabase = createAdminClient(env);
  const context = await getFixtureContext(supabase, env);
  const fixture = await createBlockedWorkflowFixture(supabase, context, env);

  await test.step("converted opportunity preserves canonical customer and project linkage", async () => {
    const snapshot = await loadWorkflowSnapshot(supabase, context, fixture);

    expect(snapshot.opportunity.customer_id).toBe(fixture.customerId);
    expect(snapshot.opportunity.project_id).toBe(fixture.projectId);
    expect(snapshot.estimate.opportunity_id).toBe(fixture.opportunityId);
    expect(snapshot.estimate.project_id).toBe(fixture.projectId);
    expect(snapshot.contract.estimate_id).toBe(fixture.estimateId);
    expect(
      await countRows(supabase, "jobs", [
        { column: "company_id", value: context.organizationId },
        { column: "project_id", value: fixture.projectId }
      ])
    ).toBe(0);
    expect(
      await countRows(supabase, "invoices", [
        { column: "company_id", value: context.organizationId },
        { column: "project_id", value: fixture.projectId },
        { column: "workflow_role", value: "standard" }
      ])
    ).toBe(0);
  });

  await test.step("contractor sees approved estimate and sent contract before readiness", async () => {
    await page.goto(`/projects/${fixture.projectId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Project workspace");
    await expect(page.locator("body")).toContainText(fixture.projectName);
    await expect(page.locator("body")).toContainText(fixture.customerName);

    await page.goto(`/estimates/${fixture.estimateId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Estimate workspace");
    await expect(page.locator("body")).toContainText(fixture.estimateTitle);
    await expect(page.locator("body")).toContainText(/approved/i);

    await page.goto(`/contracts/${fixture.contractId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Contract workspace");
    await expect(page.locator("body")).toContainText(fixture.contractTitle);
    await expect(page.locator("body")).toContainText(/signature/i);
  });

  const downstream = await signContractAndCreateDownstreamRecords(
    supabase,
    context,
    fixture
  );
  Object.assign(fixture, downstream);

  await test.step("signed contract enables job, schedule, and standard invoice path", async () => {
    const snapshot = await loadWorkflowSnapshot(supabase, context, fixture);

    expect(snapshot.project.commercial_readiness_status).toBe(
      "ready_to_schedule"
    );
    expect(snapshot.project.ready_to_schedule_at).toBeTruthy();
    expect(snapshot.contract.status).toBe("signed");
    expect(snapshot.contract.signature_readiness_status).toBe("signed");
    expect(snapshot.job.project_id).toBe(fixture.projectId);
    expect(snapshot.job.estimate_id).toBe(fixture.estimateId);
    expect(snapshot.job.dispatch_status).toBe("unscheduled");
    expect(snapshot.invoice.project_id).toBe(fixture.projectId);
    expect(snapshot.invoice.estimate_id).toBe(fixture.estimateId);
    expect(snapshot.invoice.job_id).toBeNull();
    expect(Number(snapshot.invoice.balance_due_amount)).toBe(1800);

    await page.goto(
      `/schedule?projectId=${fixture.projectId}&jobId=${fixture.jobId}&view=unscheduled&action=schedule#schedule-action`,
      { waitUntil: "domcontentloaded" }
    );
    await expectProtectedPage(page, "Schedule workspace");
    await expect(page.locator("#schedule-action")).toBeVisible();
    await expect(page.locator("#schedule-action")).toContainText(
      fixture.projectName
    );
    await expect(
      page
        .locator("#schedule-action form")
        .filter({ hasText: "Review schedule" })
        .locator("input[name='jobId']")
    ).toHaveValue(fixture.jobId);

    await page.goto(`/invoices/${fixture.invoiceId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Invoice workspace");
    await expect(page.locator("body")).toContainText(fixture.invoiceReference);
    await expect(page.locator("body")).toContainText(/\$1,800\.00/);
  });

  const payment = await recordPayment(supabase, context, fixture);
  fixture.paymentId = payment.id;

  await test.step("payment updates invoice state and project continuity", async () => {
    const snapshot = await loadWorkflowSnapshot(supabase, context, fixture);

    expect(snapshot.payment.invoice_id).toBe(fixture.invoiceId);
    expect(snapshot.payment.status).toBe("recorded");
    expect(snapshot.invoice.status).toBe("paid");
    expect(Number(snapshot.invoice.balance_due_amount)).toBe(0);

    await page.goto(`/invoices/${fixture.invoiceId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Paid invoice workspace");
    await expect(page.locator("body")).toContainText(fixture.invoiceReference);
    await expect(page.locator("body")).toContainText(/paid/i);

    await page.goto(`/projects/${fixture.projectId}`, {
      waitUntil: "domcontentloaded"
    });
    await expectProtectedPage(page, "Project workspace after payment");
    await expect(page.locator("body")).toContainText(fixture.projectName);
    await expect(page.locator("body")).toContainText(/payment|paid/i);
  });

  await test.step("portal reads the same canonical records when portal auth is available", async () => {
    const portalContinuity = await ensurePortalContinuity(
      supabase,
      context,
      fixture,
      env
    );

    if (portalContinuity.status !== "ready") {
      test.info().annotations.push({
        type: "portal-fixture-limited",
        description: portalContinuity.reason
      });
      return;
    }

    const portalSession = await newPortalPage(browser, baseURL);

    if (portalSession.blockedReason) {
      test.info().annotations.push({
        type: "portal-fixture-limited",
        description: portalSession.blockedReason
      });
      return;
    }

    try {
      await portalSession.page.goto(`/portal/projects/${fixture.projectId}`, {
        waitUntil: "domcontentloaded"
      });
      await expect(portalSession.page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(portalSession.page.locator("body")).toContainText(
        fixture.projectName
      );

      await portalSession.page.goto(`/portal/contracts/${fixture.contractId}`, {
        waitUntil: "domcontentloaded"
      });
      await expect(portalSession.page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(portalSession.page.locator("body")).toContainText(
        fixture.contractTitle
      );
      await expect(portalSession.page.locator("body")).toContainText(/signed/i);

      await portalSession.page.goto(`/portal/invoices/${fixture.invoiceId}`, {
        waitUntil: "domcontentloaded"
      });
      await expect(portalSession.page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(portalSession.page.locator("body")).toContainText(
        fixture.invoiceReference
      );
      await expect(portalSession.page.locator("body")).toContainText(/paid/i);
    } finally {
      await closeContext(portalSession.context);
    }
  });
});
