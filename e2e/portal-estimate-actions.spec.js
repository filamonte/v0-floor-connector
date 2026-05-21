const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const disposableTitles = {
  approve: "E2E Disposable Estimate Approval",
  reject: "E2E Disposable Estimate Rejection",
  approved: "E2E Disposable Estimate Already Approved",
  unauthorized: "E2E Disposable Estimate Unauthorized Project"
};

function getPortalAuthStatePath() {
  return path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
      "playwright/.auth/portal-user.json"
  );
}

function getRequiredEnv(names) {
  loadRootEnv();
  const missing = names.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    return {
      missing,
      values: null
    };
  }

  return {
    missing: [],
    values: Object.fromEntries(names.map((name) => [name, process.env[name].trim()]))
  };
}

function createAdminClient(env) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function newPortalPage(browser, baseURL) {
  loadRootEnv();
  const storageStatePath = getPortalAuthStatePath();
  const hasStorageState = fs.existsSync(storageStatePath);
  const hasCredentials = Boolean(
    process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL &&
      process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD
  );

  test.skip(
    !hasStorageState && !hasCredentials,
    "Portal estimate action smoke requires portal storage state or real portal E2E credentials."
  );

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

async function getFixtureContext(supabase, env) {
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", env.FLOORCONNECTOR_E2E_EMAIL)
    .maybeSingle();

  if (userResponse.error || !userResponse.data) {
    throw new Error(
      `Unable to load contractor E2E user: ${
        userResponse.error?.message ?? "No canonical user found."
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

  const organizationId = membershipResponse.data.company_id;
  const customer = await findSingleBy(supabase, "customers", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const portalUser = await findSingleBy(supabase, "users", "id", [
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const contact = await findSingleBy(supabase, "contacts", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const grantedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Golden Path" }
  ]);
  const unauthorizedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Unauthorized Boundary" }
  ]);
  const catalogItem = await findSingleBy(supabase, "catalog_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Surface System" }
  ]);

  if (
    !customer?.id ||
    !portalUser?.id ||
    !contact?.id ||
    !grantedProject?.id ||
    !unauthorizedProject?.id ||
    !catalogItem?.id
  ) {
    throw new Error(
      "Portal estimate action fixtures require the canonical portal user, customer, contact, projects, and catalog item."
    );
  }

  const customerContact = await findSingleBy(supabase, "customer_contacts", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customer.id },
    { column: "contact_id", value: contact.id }
  ]);

  if (!customerContact?.id) {
    throw new Error("Portal estimate action fixtures require a linked customer-contact row.");
  }

  const grantsResponse = await supabase
    .from("portal_access_grants")
    .select("id")
    .eq("company_id", organizationId)
    .eq("customer_id", customer.id)
    .eq("user_id", portalUser.id);

  if (grantsResponse.error) {
    throw new Error(`Unable to load portal access grants: ${grantsResponse.error.message}`);
  }

  const grantIds = ((grantsResponse.data ?? []).map((grant) => grant.id)).filter(Boolean);

  if (grantIds.length === 0) {
    throw new Error("Portal estimate action fixtures require an active portal access grant.");
  }

  await ensureEstimateDecisionPermission(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerContactId: customerContact.id,
    grantIds
  });

  const grantedOpportunityId = await ensureDisposableOpportunity(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    projectId: grantedProject.id,
    portalEmail: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
    title: "E2E Disposable Estimate Granted Opportunity"
  });
  const unauthorizedOpportunityId = await ensureDisposableOpportunity(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    projectId: unauthorizedProject.id,
    portalEmail: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
    title: "E2E Disposable Estimate Unauthorized Opportunity"
  });

  return {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    grantedProjectId: grantedProject.id,
    unauthorizedProjectId: unauthorizedProject.id,
    grantedOpportunityId,
    unauthorizedOpportunityId,
    catalogItemId: catalogItem.id
  };
}

async function ensureDisposableOpportunity(supabase, input) {
  const existing = await findSingleBy(supabase, "opportunities", "id", [
    { column: "company_id", value: input.organizationId },
    { column: "customer_id", value: input.customerId },
    { column: "project_id", value: input.projectId },
    { column: "title", value: input.title }
  ]);

  if (existing?.id) {
    return existing.id;
  }

  const now = new Date().toISOString();
  const response = await supabase
    .from("opportunities")
    .insert({
      company_id: input.organizationId,
      customer_id: input.customerId,
      project_id: input.projectId,
      status: "converted",
      title: input.title,
      source: "e2e_fixture",
      service_type: "portal_estimate_action_e2e",
      prospect_name: "E2E Portal Customer",
      prospect_company_name: "FloorConnector Portal E2E",
      email: input.portalEmail,
      phone: "555-0130",
      address_line_1: "130 Portal Fixture Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      notes: "Disposable opportunity for portal estimate action E2E coverage.",
      qualified_at: now,
      converted_at: now,
      created_by: input.userId,
      updated_by: input.userId
    })
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create disposable opportunity: ${response.error.message}`);
  }

  return response.data.id;
}

async function ensureEstimateDecisionPermission(supabase, input) {
  const grantResponse = await supabase
    .from("portal_access_grants")
    .update({
      status: "active",
      customer_contact_id: input.customerContactId,
      revoked_at: null
    })
    .eq("company_id", input.organizationId)
    .in("id", input.grantIds);

  if (grantResponse.error) {
    throw new Error(`Unable to repair portal access grant: ${grantResponse.error.message}`);
  }

  const existing = await findSingleBy(
    supabase,
    "customer_contact_portal_permissions",
    "id",
    [
      { column: "company_id", value: input.organizationId },
      { column: "customer_contact_id", value: input.customerContactId }
    ]
  );
  const payload = {
    portal_access_grant_id: input.grantIds[0],
    can_view_estimates: true,
    can_approve_estimates: true,
    can_sign_contracts: true,
    can_approve_change_orders: true,
    can_view_pay_invoices: true,
    can_request_quotes: true,
    management_source: "contractor_admin",
    last_managed_by_user_id: input.userId,
    last_override_by_user_id: input.userId
  };

  if (existing?.id) {
    const response = await supabase
      .from("customer_contact_portal_permissions")
      .update(payload)
      .eq("company_id", input.organizationId)
      .eq("id", existing.id);

    if (response.error) {
      throw new Error(`Unable to repair portal permissions: ${response.error.message}`);
    }

    return;
  }

  const response = await supabase.from("customer_contact_portal_permissions").insert({
    company_id: input.organizationId,
    customer_contact_id: input.customerContactId,
    ...payload
  });

  if (response.error) {
    throw new Error(`Unable to create portal permissions: ${response.error.message}`);
  }
}

async function ensureDisposableEstimate(supabase, context, input) {
  const projectId =
    input.projectScope === "unauthorized"
      ? context.unauthorizedProjectId
      : context.grantedProjectId;
  const opportunityId =
    input.projectScope === "unauthorized"
      ? context.unauthorizedOpportunityId
      : context.grantedOpportunityId;
  const existing = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: input.title }
  ]);
  const now = new Date().toISOString();
  const payload = {
    status: input.status,
    sent_at: now,
    customer_viewed_at: null,
    approved_at: input.status === "approved" ? now : null,
    approved_by_portal_user_id: null,
    rejected_at: input.status === "rejected" ? now : null,
    rejected_by_portal_user_id: null,
    updated_by: context.userId
  };

  if (existing?.id) {
    const updateResponse = await supabase
      .from("estimates")
      .update(payload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (updateResponse.error) {
      throw new Error(`Unable to reset disposable estimate: ${updateResponse.error.message}`);
    }

    await ensureDisposableEstimateLineItem(supabase, context, existing.id);
    return updateResponse.data.id;
  }

  const insertResponse = await supabase
    .from("estimates")
    .insert({
      company_id: context.organizationId,
      customer_id: context.customerId,
      project_id: projectId,
      opportunity_id: opportunityId,
      title: input.title,
      subtotal_amount: "1500.00",
      tax_amount: "0.00",
      discount_amount: "0.00",
      total_amount: "1500.00",
      notes: "Disposable portal estimate action E2E fixture.",
      content: {
        termsHtml: "<p>Disposable fixture terms for portal action coverage.</p>",
        inclusionsHtml: "<p>Disposable included coating scope.</p>",
        exclusionsHtml: "<p>Disposable fixture exclusions.</p>",
        notesHtml: "<p>Disposable customer-facing note.</p>",
        scopeSummaryHtml:
          "<p>Disposable estimate used only to verify portal decision actions.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      created_by: context.userId,
      ...payload
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(`Unable to create disposable estimate: ${insertResponse.error.message}`);
  }

  await ensureDisposableEstimateLineItem(supabase, context, insertResponse.data.id);
  return insertResponse.data.id;
}

async function ensureDisposableEstimateLineItem(supabase, context, estimateId) {
  const existing = await findSingleBy(supabase, "estimate_line_items", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "estimate_id", value: estimateId },
    { column: "catalog_item_id", value: context.catalogItemId }
  ]);

  if (existing?.id) {
    return existing.id;
  }

  const response = await supabase
    .from("estimate_line_items")
    .insert({
      company_id: context.organizationId,
      estimate_id: estimateId,
      catalog_item_id: context.catalogItemId,
      source_type: "catalog_item",
      source_system_id: null,
      source_component_id: null,
      item_type: "service",
      name: "[E2E] Disposable portal estimate line",
      description: "Disposable estimate line for portal decision action coverage.",
      quantity: "1.00",
      unit: "each",
      base_unit_cost: "900.00",
      base_unit_price: "1500.00",
      markup_percent: "0.00",
      hidden_markup_percent: "0.00",
      unit_price_before_hidden_markup: "1500.00",
      visible_markup_amount: "0.00",
      hidden_markup_amount: "0.00",
      unit_price: "1500.00",
      taxable: false,
      tax_rate_snapshot: "0.000000",
      discount_amount: "0.00",
      line_subtotal: "1500.00",
      tax_amount: "0.00",
      cost_code: "E2E-PORTAL",
      group_name: "Portal E2E disposable",
      assigned_to: null,
      sort_order: 1,
      created_by: context.userId,
      updated_by: context.userId
    })
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create disposable estimate line item: ${response.error.message}`);
  }

  return response.data.id;
}

async function resetDisposableToSent(supabase, organizationId, estimateId) {
  const response = await supabase
    .from("estimates")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      customer_viewed_at: null,
      approved_at: null,
      approved_by_portal_user_id: null,
      rejected_at: null,
      rejected_by_portal_user_id: null
    })
    .eq("company_id", organizationId)
    .eq("id", estimateId);

  if (response.error) {
    throw new Error(`Unable to reset disposable estimate: ${response.error.message}`);
  }
}

async function loadEstimate(supabase, organizationId, estimateId) {
  const response = await supabase
    .from("estimates")
    .select(
      "id, status, approved_at, approved_by_portal_user_id, rejected_at, rejected_by_portal_user_id, customer_viewed_at, subtotal_amount, tax_amount, discount_amount, total_amount"
    )
    .eq("company_id", organizationId)
    .eq("id", estimateId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load disposable estimate: ${response.error.message}`);
  }

  return response.data;
}

function expectEstimateMathUnchanged(row) {
  expect(Number(row.subtotal_amount)).toBe(1500);
  expect(Number(row.tax_amount)).toBe(0);
  expect(Number(row.discount_amount)).toBe(0);
  expect(Number(row.total_amount)).toBe(1500);
}

async function submitDecision(page, action, note) {
  if (action === "approve") {
    await page.getByLabel(/optional approval note/i).fill(note);
    await page.getByRole("button", { name: /approve estimate/i }).click();
    return;
  }

  await page.getByLabel(/rejection or revision note/i).fill(note);
  await page.getByRole("button", { name: /reject or request changes/i }).click();
}

test.describe("portal estimate decision actions", () => {
  let env;
  let supabase;
  let fixtureContext;

  test.beforeAll(async () => {
    const required = getRequiredEnv([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "FLOORCONNECTOR_E2E_EMAIL",
      "FLOORCONNECTOR_PORTAL_E2E_EMAIL"
    ]);

    test.skip(
      required.missing.length > 0,
      `Portal estimate action tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
  });

  test("portal customer can approve a disposable sent estimate", async ({
    browser,
    baseURL
  }) => {
    const estimateId = await ensureDisposableEstimate(supabase, fixtureContext, {
      title: disposableTitles.approve,
      status: "sent",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/estimates/${estimateId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.approve })).toBeVisible();

      await submitDecision(
        page,
        "approve",
        "Approved by reset-safe portal estimate E2E."
      );

      await expect(page.getByText(/Estimate approved/i)).toBeVisible();
      await expect(
        page.getByText(/This estimate is already approved on the shared project chain/i)
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /approve estimate/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject or request changes/i })).toHaveCount(0);

      const row = await loadEstimate(supabase, fixtureContext.organizationId, estimateId);
      expect(row.status).toBe("approved");
      expect(row.approved_at).toBeTruthy();
      expect(row.approved_by_portal_user_id).toBeTruthy();
      expect(row.customer_viewed_at).toBeTruthy();
      expectEstimateMathUnchanged(row);
    } finally {
      await resetDisposableToSent(supabase, fixtureContext.organizationId, estimateId);
      await context.close();
    }
  });

  test("portal customer can reject a disposable sent estimate", async ({
    browser,
    baseURL
  }) => {
    const estimateId = await ensureDisposableEstimate(supabase, fixtureContext, {
      title: disposableTitles.reject,
      status: "sent",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/estimates/${estimateId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.reject })).toBeVisible();

      await submitDecision(
        page,
        "reject",
        "Rejected by reset-safe portal estimate E2E."
      );

      await expect(page.getByText(/Estimate feedback sent/i)).toBeVisible();
      await expect(
        page.getByText(/This estimate is already marked as needing contractor revision/i)
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /approve estimate/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject or request changes/i })).toHaveCount(0);

      const row = await loadEstimate(supabase, fixtureContext.organizationId, estimateId);
      expect(row.status).toBe("rejected");
      expect(row.rejected_at).toBeTruthy();
      expect(row.rejected_by_portal_user_id).toBeTruthy();
      expect(row.customer_viewed_at).toBeTruthy();
      expectEstimateMathUnchanged(row);
    } finally {
      await resetDisposableToSent(supabase, fixtureContext.organizationId, estimateId);
      await context.close();
    }
  });

  test("already-approved disposable estimate does not expose decision actions", async ({
    browser,
    baseURL
  }) => {
    const estimateId = await ensureDisposableEstimate(supabase, fixtureContext, {
      title: disposableTitles.approved,
      status: "approved",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/estimates/${estimateId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.approved })).toBeVisible();
      await expect(
        page.getByText(/This estimate is already approved on the shared project chain/i)
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /approve estimate/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject or request changes/i })).toHaveCount(0);

      const row = await loadEstimate(supabase, fixtureContext.organizationId, estimateId);
      expect(row.status).toBe("approved");
      expect(row.rejected_at).toBeNull();
    } finally {
      await resetDisposableToSent(supabase, fixtureContext.organizationId, estimateId);
      await context.close();
    }
  });

  test("portal customer cannot open an estimate outside granted project access", async ({
    browser,
    baseURL
  }) => {
    const estimateId = await ensureDisposableEstimate(supabase, fixtureContext, {
      title: disposableTitles.unauthorized,
      status: "sent",
      projectScope: "unauthorized"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const response = await page.goto(`/portal/estimates/${estimateId}`);

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      expect([200, 404]).toContain(response?.status());
      await expect(page.locator("body")).toContainText(
        /404|not found|could not be found/i
      );
    } finally {
      await resetDisposableToSent(supabase, fixtureContext.organizationId, estimateId);
      await context.close();
    }
  });
});
