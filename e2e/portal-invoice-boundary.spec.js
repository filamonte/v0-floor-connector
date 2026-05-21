const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const disposableInvoices = {
  open: {
    referenceNumber: "E2E-PORTAL-INV-OPEN",
    notes: "E2E Disposable Invoice Review Open"
  },
  paid: {
    referenceNumber: "E2E-PORTAL-INV-PAID",
    notes: "E2E Disposable Invoice Review Paid"
  },
  unauthorized: {
    referenceNumber: "E2E-PORTAL-INV-DENIED",
    notes: "E2E Disposable Invoice Unauthorized Project"
  }
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
    "Portal invoice boundary smoke requires portal storage state or real portal E2E credentials."
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
  const unauthorizedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Unauthorized Boundary" }
  ]);
  const estimate = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: grantedProject?.id },
    { column: "title", value: "E2E Portal Estimate Review" }
  ]);

  if (
    !customer?.id ||
    !portalUser?.id ||
    !contact?.id ||
    !customerContact?.id ||
    !grantedProject?.id ||
    !unauthorizedProject?.id
  ) {
    throw new Error(
      "Portal invoice boundary fixtures require the canonical portal user, customer, contact, customer-contact, and projects."
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
    throw new Error("Portal invoice boundary fixtures require an active portal access grant.");
  }

  await ensurePortalInvoicePermission(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerContactId: customerContact.id,
    grantIds
  });

  return {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    portalUserId: portalUser.id,
    grantedProjectId: grantedProject.id,
    unauthorizedProjectId: unauthorizedProject.id,
    estimateId: estimate?.id ?? null
  };
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

async function ensureDisposableInvoice(supabase, context, input) {
  const projectId =
    input.projectScope === "unauthorized"
      ? context.unauthorizedProjectId
      : context.grantedProjectId;
  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "reference_number", value: input.referenceNumber }
  ]);
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);
  const payload = {
    company_id: context.organizationId,
    customer_id: context.customerId,
    project_id: projectId,
    estimate_id: input.projectScope === "unauthorized" ? null : context.estimateId,
    job_id: null,
    reference_number: input.referenceNumber,
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
    notes: input.notes,
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
      throw new Error(`Unable to reset disposable invoice: ${response.error.message}`);
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
      throw new Error(`Unable to create disposable invoice: ${response.error.message}`);
    }

    invoiceId = response.data.id;
  }

  await ensureDisposableInvoiceLineItem(supabase, context, invoiceId);

  if (input.paymentState === "paid") {
    await ensureRecordedPayment(supabase, context, invoiceId);
  }

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
    name: "E2E disposable portal invoice line",
    description: "Disposable invoice line for portal payment-boundary coverage.",
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

async function ensureRecordedPayment(supabase, context, invoiceId) {
  const paymentResponse = await supabase
    .from("payments")
    .insert({
      company_id: context.organizationId,
      invoice_id: invoiceId,
      amount: "1500.00",
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: "Manual test receipt",
      payment_source: "manual",
      recorded_via: "contractor_app",
      reference: "E2E-PORTAL-BOUNDARY-PAID",
      notes: "Disposable recorded payment for portal invoice boundary coverage.",
      status: "recorded",
      created_by: context.userId,
      updated_by: context.userId
    })
    .select("id")
    .single();

  if (paymentResponse.error) {
    throw new Error(`Unable to create disposable recorded payment: ${paymentResponse.error.message}`);
  }

  const eventResponse = await supabase.from("payment_events").insert({
    company_id: context.organizationId,
    invoice_id: invoiceId,
    payment_id: paymentResponse.data.id,
    event_type: "payment_succeeded",
    actor_type: "organization_user",
    actor_user_id: context.userId,
    payload: {
      amount: "1500.00",
      source: "e2e_portal_invoice_boundary"
    }
  });

  if (eventResponse.error) {
    throw new Error(`Unable to create disposable payment event: ${eventResponse.error.message}`);
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

async function expectInvoiceMath(supabase, context, invoiceId, expected) {
  const invoice = await loadInvoice(supabase, context.organizationId, invoiceId);

  expect(Number(invoice.subtotal_amount)).toBe(expected.subtotal);
  expect(Number(invoice.tax_amount)).toBe(0);
  expect(Number(invoice.discount_amount)).toBe(0);
  expect(Number(invoice.retainage_held_amount)).toBe(0);
  expect(Number(invoice.total_amount)).toBe(expected.total);
  expect(Number(invoice.balance_due_amount)).toBe(expected.balanceDue);

  return invoice;
}

test.describe("portal invoice payment boundary", () => {
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
      `Portal invoice boundary tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
  });

  test("portal customer can review an open invoice without payment mutation", async ({
    browser,
    baseURL
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext, {
      ...disposableInvoices.open,
      projectScope: "granted",
      paymentState: "open"
    });
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

    try {
      await page.goto(`/portal/invoices/${invoiceId}`);
      await expect(page.getByRole("heading", { name: disposableInvoices.open.referenceNumber })).toBeVisible();
      await expect(page.getByText(/\$1,500\.00 paid of \$1,500\.00 total/i)).toHaveCount(0);
      await expect(page.getByText(/\$0\.00 paid of \$1,500\.00 total/i)).toBeVisible();
      await expect(page.getByText(/E2E disposable portal invoice line/i)).toBeVisible();

      const checkoutButton = page.getByRole("button", { name: /continue to checkout/i });
      const lockNotice = page.getByText(/Checkout is locked during early access/i);
      const blockedCopy = page.getByText(/Payment is currently blocked/i);
      const visibleBoundaryControlCount =
        (await checkoutButton.count()) +
        (await lockNotice.count()) +
        (await blockedCopy.count());

      expect(visibleBoundaryControlCount).toBeGreaterThan(0);
      await expectInvoiceMath(supabase, fixtureContext, invoiceId, {
        subtotal: 1500,
        total: 1500,
        balanceDue: 1500
      });
      expect(await countRows(supabase, "payments", fixtureContext.organizationId, invoiceId))
        .toBe(paymentCountBefore);
      expect(await countRows(supabase, "payment_events", fixtureContext.organizationId, invoiceId))
        .toBe(paymentEventCountBefore);
    } finally {
      await closePortalContext(context);
    }
  });

  test("paid invoice renders payment state without checkout mutation", async ({
    browser,
    baseURL
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext, {
      ...disposableInvoices.paid,
      projectScope: "granted",
      paymentState: "paid"
    });
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

    try {
      await page.goto(`/portal/invoices/${invoiceId}`);
      await expect(page.getByRole("heading", { name: disposableInvoices.paid.referenceNumber })).toBeVisible();
      await expect(page.getByText(/\$0\.00/i).first()).toBeVisible();
      await expect(page.getByText(/A payment completed and this invoice is fully paid/i).first()).toBeVisible();
      await expect(page.getByText(/Payment succeeded/i).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /continue to checkout/i })).toHaveCount(0);

      await expectInvoiceMath(supabase, fixtureContext, invoiceId, {
        subtotal: 1500,
        total: 1500,
        balanceDue: 0
      });
      expect(await countRows(supabase, "payments", fixtureContext.organizationId, invoiceId))
        .toBe(paymentCountBefore);
      expect(await countRows(supabase, "payment_events", fixtureContext.organizationId, invoiceId))
        .toBe(paymentEventCountBefore);
    } finally {
      await closePortalContext(context);
    }
  });

  test("portal customer cannot open an invoice outside granted project access", async ({
    browser,
    baseURL
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext, {
      ...disposableInvoices.unauthorized,
      projectScope: "unauthorized",
      paymentState: "open"
    });
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

    try {
      const response = await page.goto(`/portal/invoices/${invoiceId}`);

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      expect([200, 404]).toContain(response?.status());
      await expect(page.locator("body")).toContainText(
        /404|not found|could not be found/i
      );
      await expect(page.locator("body")).not.toContainText(disposableInvoices.unauthorized.referenceNumber);
      expect(await countRows(supabase, "payments", fixtureContext.organizationId, invoiceId))
        .toBe(paymentCountBefore);
      expect(await countRows(supabase, "payment_events", fixtureContext.organizationId, invoiceId))
        .toBe(paymentEventCountBefore);
    } finally {
      await closePortalContext(context);
    }
  });
});
