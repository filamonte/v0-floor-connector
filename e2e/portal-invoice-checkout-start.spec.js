const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const disposableInvoice = {
  referenceNumber: "E2E-PORTAL-INV-CHECKOUT",
  notes: "E2E Disposable Invoice Checkout Start"
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
    "Portal invoice checkout-start requires portal storage state or real portal E2E credentials."
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

async function closePortalContext(context) {
  try {
    await context.close();
  } catch {
    // Keep artifact cleanup noise from masking the app assertion result.
  }
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
  const customerContact = customer?.id && contact?.id
    ? await findSingleBy(supabase, "customer_contacts", "id", [
        { column: "company_id", value: organizationId },
        { column: "customer_id", value: customer.id },
        { column: "contact_id", value: contact.id }
      ])
    : null;
  const grantedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Golden Path" }
  ]);
  const estimate = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: grantedProject?.id },
    { column: "title", value: "E2E Portal Estimate Review" }
  ]);

  if (!customer?.id || !portalUser?.id || !contact?.id || !customerContact?.id || !grantedProject?.id) {
    throw new Error(
      "Portal invoice checkout-start fixtures require the canonical portal user, customer, contact, customer-contact, and granted project."
    );
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
    throw new Error("Portal invoice checkout-start fixtures require an active portal access grant.");
  }

  await ensurePortalInvoicePermission(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerContactId: customerContact.id,
    grantIds
  });

  return {
    organizationId,
    organizationActivationState: await loadOrganizationActivationState(
      supabase,
      organizationId
    ),
    userId: userResponse.data.id,
    customerId: customer.id,
    portalUserId: portalUser.id,
    grantedProjectId: grantedProject.id,
    estimateId: estimate?.id ?? null
  };
}

async function loadOrganizationActivationState(supabase, organizationId) {
  const response = await supabase
    .from("companies")
    .select("tenant_status, lifecycle_state")
    .eq("id", organizationId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load organization activation state: ${response.error.message}`);
  }

  return {
    tenantStatus: response.data.tenant_status,
    lifecycleState: response.data.lifecycle_state
  };
}

async function setOrganizationActivationState(supabase, organizationId, state) {
  const response = await supabase
    .from("companies")
    .update({
      tenant_status: state.tenantStatus,
      lifecycle_state: state.lifecycleState
    })
    .eq("id", organizationId);

  if (response.error) {
    throw new Error(`Unable to update organization activation state: ${response.error.message}`);
  }
}

async function ensurePortalInvoicePermission(supabase, input) {
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

async function ensureDisposableInvoice(supabase, context) {
  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "reference_number", value: disposableInvoice.referenceNumber }
  ]);
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);
  const payload = {
    company_id: context.organizationId,
    customer_id: context.customerId,
    project_id: context.grantedProjectId,
    estimate_id: context.estimateId,
    job_id: null,
    reference_number: disposableInvoice.referenceNumber,
    workflow_role: "standard",
    billing_model: "standard",
    status: "sent",
    issue_date: today.toISOString().slice(0, 10),
    due_date: dueDate.toISOString().slice(0, 10),
    subtotal_amount: "0.00",
    tax_amount: "0.00",
    discount_amount: "0.00",
    retainage_held_amount: "0.00",
    total_amount: "0.00",
    balance_due_amount: "0.00",
    notes: disposableInvoice.notes,
    updated_by: context.userId
  };

  let invoiceId;

  if (existing?.id) {
    await deleteDisposablePaymentState(supabase, context.organizationId, existing.id);
    const response = await supabase
      .from("invoices")
      .update(payload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(`Unable to reset disposable checkout-start invoice: ${response.error.message}`);
    }

    invoiceId = response.data.id;
  } else {
    const response = await supabase
      .from("invoices")
      .insert({
        ...payload,
        created_by: context.userId
      })
      .select("id")
      .single();

    if (response.error) {
      throw new Error(`Unable to create disposable checkout-start invoice: ${response.error.message}`);
    }

    invoiceId = response.data.id;
  }

  await ensureDisposableInvoiceLineItem(supabase, context, invoiceId);

  return invoiceId;
}

async function deleteDisposablePaymentState(supabase, organizationId, invoiceId) {
  const eventsResponse = await supabase
    .from("payment_events")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (eventsResponse.error) {
    throw new Error(`Unable to delete disposable payment events: ${eventsResponse.error.message}`);
  }

  const paymentsResponse = await supabase
    .from("payments")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (paymentsResponse.error) {
    throw new Error(`Unable to delete disposable payments: ${paymentsResponse.error.message}`);
  }
}

async function ensureDisposableInvoiceLineItem(supabase, context, invoiceId) {
  const existingRows = await supabase
    .from("invoice_line_items")
    .select("id")
    .eq("company_id", context.organizationId)
    .eq("invoice_id", invoiceId);

  if (existingRows.error) {
    throw new Error(`Unable to load disposable invoice line items: ${existingRows.error.message}`);
  }

  const existing = existingRows.data?.[0];
  const payload = {
    company_id: context.organizationId,
    invoice_id: invoiceId,
    name: "E2E disposable portal checkout-start line",
    description: "Disposable invoice line for provider-isolated checkout-start coverage.",
    quantity: "1.00",
    unit: "each",
    unit_price: "1500.00",
    sort_order: 1,
    lineage_type: "invoice_only_adjustment",
    invoice_only_adjustment_kind: "explicit_adjustment",
    created_by: context.userId,
    updated_by: context.userId
  };

  if (existing?.id) {
    const response = await supabase
      .from("invoice_line_items")
      .update(payload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id);

    if (response.error) {
      throw new Error(`Unable to reset disposable invoice line item: ${response.error.message}`);
    }
  } else {
    const response = await supabase.from("invoice_line_items").insert(payload);

    if (response.error) {
      throw new Error(`Unable to create disposable invoice line item: ${response.error.message}`);
    }
  }

  const extraIds = (existingRows.data ?? []).slice(1).map((row) => row.id);

  if (extraIds.length > 0) {
    const deleteResponse = await supabase
      .from("invoice_line_items")
      .delete()
      .eq("company_id", context.organizationId)
      .in("id", extraIds);

    if (deleteResponse.error) {
      throw new Error(`Unable to clean extra disposable invoice line items: ${deleteResponse.error.message}`);
    }
  }
}

async function loadInvoice(supabase, organizationId, invoiceId) {
  const response = await supabase
    .from("invoices")
    .select(
      "id, status, subtotal_amount, tax_amount, discount_amount, retainage_held_amount, total_amount, balance_due_amount"
    )
    .eq("company_id", organizationId)
    .eq("id", invoiceId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load disposable invoice: ${response.error.message}`);
  }

  return response.data;
}

async function loadPayments(supabase, organizationId, invoiceId) {
  const response = await supabase
    .from("payments")
    .select(
      "id, amount, status, gateway_provider, gateway_status, gateway_checkout_session_reference, gateway_payment_intent_reference"
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load checkout-start payments: ${response.error.message}`);
  }

  return response.data ?? [];
}

async function loadPaymentEvents(supabase, organizationId, invoiceId) {
  const response = await supabase
    .from("payment_events")
    .select("id, payment_id, event_type, actor_type, gateway_provider, payload")
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load checkout-start payment events: ${response.error.message}`);
  }

  return response.data ?? [];
}

async function countRows(supabase, table, organizationId, invoiceId) {
  const response = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (response.error) {
    throw new Error(`Unable to count ${table}: ${response.error.message}`);
  }

  return response.count ?? 0;
}

function expectInvoiceMath(invoice) {
  expect(Number(invoice.subtotal_amount)).toBe(1500);
  expect(Number(invoice.tax_amount)).toBe(0);
  expect(Number(invoice.discount_amount)).toBe(0);
  expect(Number(invoice.retainage_held_amount)).toBe(0);
  expect(Number(invoice.total_amount)).toBe(1500);
  expect(Number(invoice.balance_due_amount)).toBe(1500);
}

test.describe("portal invoice checkout-start boundary", () => {
  let env;
  let supabase;
  let fixtureContext;

  test.beforeAll(async () => {
    // Playwright sets local_manual by default so this exercises app-side checkout-start
    // persistence without creating a Stripe session, charge, or webhook callback.
    test.skip(
      process.env.FLOORCONNECTOR_E2E_PAYMENT_GATEWAY !== "local_manual",
      "Portal invoice checkout-start E2E requires FLOORCONNECTOR_E2E_PAYMENT_GATEWAY=local_manual."
    );

    const required = getRequiredEnv([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "FLOORCONNECTOR_E2E_EMAIL",
      "FLOORCONNECTOR_PORTAL_E2E_EMAIL"
    ]);

    test.skip(
      required.missing.length > 0,
      `Portal invoice checkout-start tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
    await setOrganizationActivationState(supabase, fixtureContext.organizationId, {
      tenantStatus: "active",
      lifecycleState: "active"
    });
  });

  test.afterAll(async () => {
    if (!supabase || !fixtureContext?.organizationActivationState) {
      return;
    }

    await setOrganizationActivationState(
      supabase,
      fixtureContext.organizationId,
      fixtureContext.organizationActivationState
    );
  });

  test("portal customer starts local checkout without provider payment completion", async ({
    browser,
    baseURL
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentCountBefore = await countRows(
      supabase,
      "payments",
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentEventCountBefore = await countRows(
      supabase,
      "payment_events",
      fixtureContext.organizationId,
      invoiceId
    );
    const { page, context } = await newPortalPage(browser, baseURL);

    expectInvoiceMath(invoiceBefore);
    expect(paymentCountBefore).toBe(0);
    expect(paymentEventCountBefore).toBe(0);

    try {
      await page.goto(`/portal/invoices/${invoiceId}`);
      await expect(page.getByRole("heading", { name: disposableInvoice.referenceNumber })).toBeVisible();
      await expect(page.getByText(/\$0\.00 paid of \$1,500\.00 total/i)).toBeVisible();

      await page
        .getByRole("button", { name: /continue to checkout for \$1,500\.00/i })
        .click();

      await expect(page).toHaveURL(new RegExp(`/portal/invoices/${invoiceId}`));
      await expect(page.getByText(/local payment checkout session was created/i)).toBeVisible();

      const invoiceAfter = await loadInvoice(
        supabase,
        fixtureContext.organizationId,
        invoiceId
      );
      const payments = await loadPayments(supabase, fixtureContext.organizationId, invoiceId);
      const paymentEvents = await loadPaymentEvents(
        supabase,
        fixtureContext.organizationId,
        invoiceId
      );

      expectInvoiceMath(invoiceAfter);
      expect(invoiceAfter.status).toBe(invoiceBefore.status);
      expect(payments).toHaveLength(1);
      expect(Number(payments[0].amount)).toBe(1500);
      expect(payments[0].status).toBe("pending");
      expect(payments[0].gateway_provider).toBe("local_manual");
      expect(payments[0].gateway_status).toBe("open");
      expect(payments[0].gateway_checkout_session_reference).toMatch(/^local_checkout_/);
      expect(payments[0].gateway_payment_intent_reference).toBeNull();
      expect(paymentEvents.map((event) => event.event_type)).toEqual([
        "payment_requested",
        "checkout_started"
      ]);
      expect(paymentEvents[0].payment_id).toBeNull();
      expect(paymentEvents[0].actor_type).toBe("portal_user");
      expect(paymentEvents[1].payment_id).toBe(payments[0].id);
      expect(paymentEvents[1].actor_type).toBe("portal_user");
      expect(paymentEvents[1].gateway_provider).toBe("local_manual");
      expect(paymentEvents[1].payload?.gatewayProvider).toBe("local_manual");
      expect(paymentEvents[1].payload?.localCheckoutSessionReference).toMatch(/^local_checkout_/);
      expect(paymentEvents.some((event) => event.event_type === "payment_succeeded")).toBe(false);
    } finally {
      await closePortalContext(context);
    }
  });
});
