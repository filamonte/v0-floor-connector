const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const disposableTitles = {
  approve: "E2E Disposable Change Order Approval",
  reject: "E2E Disposable Change Order Rejection",
  approved: "E2E Disposable Change Order Already Approved",
  unauthorized: "E2E Disposable Change Order Unauthorized Project"
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
    "Portal change-order action smoke requires portal storage state or real portal E2E credentials."
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

  if (
    !customer?.id ||
    !portalUser?.id ||
    !contact?.id ||
    !grantedProject?.id ||
    !unauthorizedProject?.id
  ) {
    throw new Error(
      "Portal action fixtures require the canonical portal user, customer, contact, granted project, and unauthorized boundary project."
    );
  }

  const customerContact = await findSingleBy(supabase, "customer_contacts", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customer.id },
    { column: "contact_id", value: contact.id }
  ]);

  if (!customerContact?.id) {
    throw new Error("Portal action fixtures require a linked customer-contact row.");
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
    throw new Error("Portal action fixtures require an active portal access grant.");
  }

  await ensureChangeOrderDecisionPermission(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerContactId: customerContact.id,
    grantIds
  });

  return {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    grantedProjectId: grantedProject.id,
    unauthorizedProjectId: unauthorizedProject.id
  };
}

async function ensureChangeOrderDecisionPermission(supabase, input) {
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

async function ensureDisposableChangeOrder(supabase, context, input) {
  const projectId =
    input.projectScope === "unauthorized"
      ? context.unauthorizedProjectId
      : context.grantedProjectId;
  const existing = await findSingleBy(supabase, "change_orders", "id", [
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
    rejected_at: input.status === "rejected" ? now : null,
    decision_note: input.status === "sent" ? null : "Disposable E2E setup state.",
    updated_by: context.userId
  };

  if (existing?.id) {
    const updateResponse = await supabase
      .from("change_orders")
      .update(payload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (updateResponse.error) {
      throw new Error(
        `Unable to reset disposable change order: ${updateResponse.error.message}`
      );
    }

    return updateResponse.data.id;
  }

  const insertResponse = await supabase
    .from("change_orders")
    .insert({
      company_id: context.organizationId,
      customer_id: context.customerId,
      project_id: projectId,
      contract_id: null,
      invoice_id: null,
      title: input.title,
      description: "Disposable portal change-order action E2E fixture.",
      scope_change_notes:
        "Disposable scope update used only to verify portal decision actions.",
      price_adjustment: "125.00",
      created_by: context.userId,
      ...payload
    })
    .select("id")
    .single();

  if (insertResponse.error) {
    throw new Error(
      `Unable to create disposable change order: ${insertResponse.error.message}`
    );
  }

  return insertResponse.data.id;
}

async function resetDisposableToSent(supabase, organizationId, changeOrderId) {
  const response = await supabase
    .from("change_orders")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      customer_viewed_at: null,
      approved_at: null,
      rejected_at: null,
      decision_note: null
    })
    .eq("company_id", organizationId)
    .eq("id", changeOrderId);

  if (response.error) {
    throw new Error(`Unable to reset disposable change order: ${response.error.message}`);
  }
}

async function loadChangeOrder(supabase, organizationId, changeOrderId) {
  const response = await supabase
    .from("change_orders")
    .select("id, status, decision_note, approved_at, rejected_at, customer_viewed_at")
    .eq("company_id", organizationId)
    .eq("id", changeOrderId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load disposable change order: ${response.error.message}`);
  }

  return response.data;
}

async function submitDecision(page, action, note) {
  const buttonName =
    action === "approve" ? /approve change order/i : /reject change order/i;
  const noteLabel =
    action === "approve" ? /optional approval note/i : /optional rejection note/i;

  await page.getByLabel(noteLabel).fill(note);
  await page.getByRole("button", { name: buttonName }).click();
}

test.describe("portal change-order decision actions", () => {
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
      `Portal change-order action tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
  });

  test("portal customer can approve a disposable sent change order", async ({
    browser,
    baseURL
  }) => {
    const changeOrderId = await ensureDisposableChangeOrder(supabase, fixtureContext, {
      title: disposableTitles.approve,
      status: "sent",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/change-orders/${changeOrderId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.approve })).toBeVisible();

      await submitDecision(
        page,
        "approve",
        "Approved by reset-safe portal action E2E."
      );

      await expect(page.getByText(/Change order approved successfully/i)).toBeVisible();
      await expect(page.getByText(/already approved/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /approve change order/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject change order/i })).toHaveCount(0);

      const row = await loadChangeOrder(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      expect(row.status).toBe("approved");
      expect(row.approved_at).toBeTruthy();
      expect(row.customer_viewed_at).toBeTruthy();
      expect(row.decision_note).toBe("Approved by reset-safe portal action E2E.");
    } finally {
      await resetDisposableToSent(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      await context.close();
    }
  });

  test("portal customer can reject a disposable sent change order", async ({
    browser,
    baseURL
  }) => {
    const changeOrderId = await ensureDisposableChangeOrder(supabase, fixtureContext, {
      title: disposableTitles.reject,
      status: "sent",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/change-orders/${changeOrderId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.reject })).toBeVisible();

      await submitDecision(
        page,
        "reject",
        "Rejected by reset-safe portal action E2E."
      );

      await expect(page.getByText(/Change order rejected/i)).toBeVisible();
      await expect(page.getByText(/already rejected/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /approve change order/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject change order/i })).toHaveCount(0);

      const row = await loadChangeOrder(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      expect(row.status).toBe("rejected");
      expect(row.rejected_at).toBeTruthy();
      expect(row.customer_viewed_at).toBeTruthy();
      expect(row.decision_note).toBe("Rejected by reset-safe portal action E2E.");
    } finally {
      await resetDisposableToSent(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      await context.close();
    }
  });

  test("already-approved disposable change order does not expose decision actions", async ({
    browser,
    baseURL
  }) => {
    const changeOrderId = await ensureDisposableChangeOrder(supabase, fixtureContext, {
      title: disposableTitles.approved,
      status: "approved",
      projectScope: "granted"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/change-orders/${changeOrderId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.approved })).toBeVisible();
      await expect(
        page.getByText(/This change order is already approved on the shared project chain/i)
      ).toBeVisible();
      await expect(page.getByRole("button", { name: /approve change order/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /reject change order/i })).toHaveCount(0);

      const row = await loadChangeOrder(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      expect(row.status).toBe("approved");
      expect(row.rejected_at).toBeNull();
    } finally {
      await resetDisposableToSent(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      await context.close();
    }
  });

  test("portal customer cannot open a change order outside granted project access", async ({
    browser,
    baseURL
  }) => {
    const changeOrderId = await ensureDisposableChangeOrder(supabase, fixtureContext, {
      title: disposableTitles.unauthorized,
      status: "sent",
      projectScope: "unauthorized"
    });
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const response = await page.goto(`/portal/change-orders/${changeOrderId}`);

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      expect([200, 404]).toContain(response?.status());
      await expect(page.locator("body")).toContainText(
        /404|not found|could not be found/i
      );
    } finally {
      await resetDisposableToSent(
        supabase,
        fixtureContext.organizationId,
        changeOrderId
      );
      await context.close();
    }
  });
});
