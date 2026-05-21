const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("node:crypto");

const { loadRootEnv } = require("./auth-utils");

const disposableInvoice = {
  referenceNumber: "E2E-STRIPE-WEBHOOK-INVOICE",
  notes: "E2E Disposable Stripe Webhook Reconciliation"
};

const disposableCrossReferenceInvoice = {
  referenceNumber: "E2E-STRIPE-WEBHOOK-CROSS-REF",
  notes: "E2E Disposable Stripe Webhook Cross-Reference Integrity"
};

const secondTenantFixture = {
  companySlug: "e2e-stripe-webhook-tenant-b",
  invoiceReference: "E2E-STRIPE-WEBHOOK-TENANT-B-INVOICE"
};

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
  const grantedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Golden Path" }
  ]);
  const estimate = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: grantedProject?.id },
    { column: "title", value: "E2E Portal Estimate Review" }
  ]);

  if (!customer?.id || !grantedProject?.id) {
    throw new Error(
      "Stripe webhook reconciliation fixtures require the canonical customer and granted project."
    );
  }

  return {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    grantedProjectId: grantedProject.id,
    estimateId: estimate?.id ?? null
  };
}

async function ensureDisposableInvoice(
  supabase,
  context,
  invoiceConfig = disposableInvoice
) {
  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "reference_number", value: invoiceConfig.referenceNumber }
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
    reference_number: invoiceConfig.referenceNumber,
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
    notes: invoiceConfig.notes,
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
      throw new Error(`Unable to reset disposable webhook invoice: ${response.error.message}`);
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
      throw new Error(`Unable to create disposable webhook invoice: ${response.error.message}`);
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
    name: "E2E disposable Stripe webhook line",
    description: "Disposable invoice line for synthetic Stripe webhook coverage.",
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

async function ensurePendingPayment(supabase, context, invoiceId) {
  const response = await supabase
    .from("payments")
    .insert({
      company_id: context.organizationId,
      invoice_id: invoiceId,
      amount: "1500.00",
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: "Secure checkout",
      payment_source: "customer_portal",
      recorded_via: "customer_portal",
      gateway_provider: "stripe",
      gateway_status: "pending",
      payer_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
      notes: "Disposable pending Stripe payment for synthetic webhook reconciliation.",
      status: "pending",
      created_by: context.userId,
      updated_by: context.userId
    })
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create disposable pending payment: ${response.error.message}`);
  }

  return response.data.id;
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
      "id, amount, status, gateway_provider, gateway_status, gateway_checkout_session_reference, gateway_payment_intent_reference, payment_method_summary"
    )
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load webhook payments: ${response.error.message}`);
  }

  return response.data ?? [];
}

async function loadPaymentEvents(supabase, organizationId, invoiceId) {
  const response = await supabase
    .from("payment_events")
    .select("id, payment_id, event_type, actor_type, gateway_provider, provider_event_id, payload")
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load webhook payment events: ${response.error.message}`);
  }

  return response.data ?? [];
}

function expectInvoiceMath(invoice, expectedBalance) {
  expect(Number(invoice.subtotal_amount)).toBe(1500);
  expect(Number(invoice.tax_amount)).toBe(0);
  expect(Number(invoice.discount_amount)).toBe(0);
  expect(Number(invoice.retainage_held_amount)).toBe(0);
  expect(Number(invoice.total_amount)).toBe(1500);
  expect(Number(invoice.balance_due_amount)).toBe(expectedBalance);
}

function createStripeSignatureHeader(rawBody, secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}

function createInvalidStripeSignatureHeader() {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  return `t=${timestamp},v1=${"0".repeat(64)}`;
}

async function loadWebhookState(supabase, organizationId, invoiceId) {
  const [invoice, payments, events] = await Promise.all([
    loadInvoice(supabase, organizationId, invoiceId),
    loadPayments(supabase, organizationId, invoiceId),
    loadPaymentEvents(supabase, organizationId, invoiceId)
  ]);

  return { invoice, payments, events };
}

async function loadSecondTenantFixture(supabase, tenantAOrganizationId) {
  const company = await findSingleBy(supabase, "companies", "id", [
    { column: "slug", value: secondTenantFixture.companySlug }
  ]);

  if (!company?.id || company.id === tenantAOrganizationId) {
    return null;
  }

  const invoice = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: company.id },
    { column: "reference_number", value: secondTenantFixture.invoiceReference }
  ]);

  if (!invoice?.id) {
    return null;
  }

  const payments = await loadPayments(supabase, company.id, invoice.id);
  const pendingPayment = payments.find((payment) => payment.status === "pending");

  if (!pendingPayment?.id) {
    return null;
  }

  return {
    organizationId: company.id,
    invoiceId: invoice.id,
    paymentId: pendingPayment.id
  };
}

function expectWebhookStateUnchanged(before, after) {
  expect(after.invoice).toEqual(before.invoice);
  expect(after.payments).toEqual(before.payments);
  expect(after.events).toEqual(before.events);
}

function createCheckoutCompletedPayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "checkout.session.completed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: input.checkoutSessionReference,
        object: "checkout.session",
        amount_total: 150000,
        currency: "usd",
        payment_status: "paid",
        status: "complete",
        payment_intent: input.paymentIntentReference,
        customer_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        customer_details: {
          email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null
        },
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          reference_number: disposableInvoice.referenceNumber
        }
      }
    }
  };
}

function createCheckoutCompletedMissingMetadataPayload(input) {
  const payload = createCheckoutCompletedPayload(input);
  payload.data.object.metadata = {};

  return payload;
}

function createUnsupportedStripePayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "customer.created",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cus_test_e2e_${input.invoiceId.replaceAll("-", "")}`,
        object: "customer",
        email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          reference_number: disposableInvoice.referenceNumber
        }
      }
    }
  };
}

function createCheckoutExpiredPayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "checkout.session.expired",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: input.checkoutSessionReference,
        object: "checkout.session",
        amount_total: 150000,
        currency: "usd",
        payment_status: "unpaid",
        status: "expired",
        payment_intent: input.paymentIntentReference,
        customer_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        customer_details: {
          email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null
        },
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          reference_number: disposableInvoice.referenceNumber
        }
      }
    }
  };
}

function createCheckoutAsyncPaymentFailedPayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "checkout.session.async_payment_failed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: input.checkoutSessionReference,
        object: "checkout.session",
        amount_total: 150000,
        currency: "usd",
        payment_status: "unpaid",
        status: "complete",
        payment_intent: input.paymentIntentReference,
        customer_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        customer_details: {
          email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null
        },
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          reference_number: disposableInvoice.referenceNumber
        }
      }
    }
  };
}

function createPaymentIntentFailedPayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "payment_intent.payment_failed",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: input.paymentIntentReference,
        object: "payment_intent",
        amount: 150000,
        amount_received: 0,
        currency: "usd",
        status: "requires_payment_method",
        receipt_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        last_payment_error: {
          message: "Your card was declined."
        },
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          checkout_session_id: input.checkoutSessionReference,
          reference_number: disposableInvoice.referenceNumber
        },
        charges: {
          data: [
            {
              payment_method_details: {
                type: "card",
                card: {
                  brand: "visa",
                  last4: "0341"
                }
              }
            }
          ]
        }
      }
    }
  };
}

function createPaymentIntentCanceledPayload(input) {
  return {
    id: input.eventId,
    object: "event",
    type: "payment_intent.canceled",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: input.paymentIntentReference,
        object: "payment_intent",
        amount: 150000,
        amount_received: 0,
        cancellation_reason: "abandoned",
        currency: "usd",
        status: "canceled",
        receipt_email: process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL ?? null,
        metadata: {
          organization_id: input.organizationId,
          invoice_id: input.invoiceId,
          payment_id: input.paymentId,
          checkout_session_id: input.checkoutSessionReference,
          reference_number: disposableInvoice.referenceNumber
        },
        charges: {
          data: [
            {
              payment_method_details: {
                type: "card",
                card: {
                  brand: "visa",
                  last4: "0341"
                }
              }
            }
          ]
        }
      }
    }
  };
}

async function postSignedStripeWebhook(request, payload, secret) {
  const rawBody = JSON.stringify(payload);

  return request.post("/api/payments/stripe/webhook", {
    headers: {
      "content-type": "application/json",
      "stripe-signature": createStripeSignatureHeader(rawBody, secret)
    },
    data: rawBody
  });
}

async function postInvalidSignatureStripeWebhook(request, payload) {
  const rawBody = JSON.stringify(payload);

  return request.post("/api/payments/stripe/webhook", {
    headers: {
      "content-type": "application/json",
      "stripe-signature": createInvalidStripeSignatureHeader()
    },
    data: rawBody
  });
}

test.describe("stripe payment webhook reconciliation boundary", () => {
  let env;
  let supabase;
  let fixtureContext;

  test.beforeAll(async () => {
    const required = getRequiredEnv([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "FLOORCONNECTOR_E2E_EMAIL",
      "FLOORCONNECTOR_PORTAL_E2E_EMAIL",
      "STRIPE_WEBHOOK_SECRET"
    ]);

    test.skip(
      required.missing.length > 0,
      `Stripe webhook reconciliation tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
  });

  test("synthetic signed checkout completion finalizes a disposable pending payment idempotently", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventId = `evt_e2e_webhook_${invoiceId.replaceAll("-", "")}`;
    const checkoutSessionReference = `cs_test_e2e_${invoiceId.replaceAll("-", "")}`;
    const paymentIntentReference = `pi_test_e2e_${invoiceId.replaceAll("-", "")}`;
    const payload = createCheckoutCompletedPayload({
      eventId,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference,
      paymentIntentReference
    });

    expectInvoiceMath(invoiceBefore, 1500);

    const firstResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.ok()).toBe(true);
    expect(firstBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: false,
      handled: true
    });

    const invoiceAfterSuccess = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterSuccess = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterSuccess = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterSuccess, 0);
    expect(invoiceAfterSuccess.status).toBe("paid");
    expect(paymentsAfterSuccess).toHaveLength(1);
    expect(paymentsAfterSuccess[0].id).toBe(paymentId);
    expect(Number(paymentsAfterSuccess[0].amount)).toBe(1500);
    expect(paymentsAfterSuccess[0].status).toBe("recorded");
    expect(paymentsAfterSuccess[0].gateway_provider).toBe("stripe");
    expect(paymentsAfterSuccess[0].gateway_status).toBe("paid");
    expect(paymentsAfterSuccess[0].gateway_checkout_session_reference).toBe(
      checkoutSessionReference
    );
    expect(paymentsAfterSuccess[0].gateway_payment_intent_reference).toBe(
      paymentIntentReference
    );
    expect(eventsAfterSuccess).toHaveLength(1);
    expect(eventsAfterSuccess[0]).toMatchObject({
      payment_id: paymentId,
      event_type: "payment_succeeded",
      actor_type: "provider",
      gateway_provider: "stripe",
      provider_event_id: eventId
    });

    const duplicateResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.ok()).toBe(true);
    expect(duplicateBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: true,
      handled: true,
      reason: "duplicate_provider_event"
    });

    const invoiceAfterDuplicate = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterDuplicate = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterDuplicate = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterDuplicate, 0);
    expect(invoiceAfterDuplicate.status).toBe("paid");
    expect(paymentsAfterDuplicate).toHaveLength(1);
    expect(eventsAfterDuplicate).toHaveLength(1);
  });

  test("synthetic signed checkout expiration voids a disposable pending payment idempotently without paying the invoice", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventId = `evt_e2e_webhook_expired_${invoiceId.replaceAll("-", "")}`;
    const checkoutSessionReference = `cs_test_e2e_expired_${invoiceId.replaceAll("-", "")}`;
    const paymentIntentReference = `pi_test_e2e_expired_${invoiceId.replaceAll("-", "")}`;
    const payload = createCheckoutExpiredPayload({
      eventId,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference,
      paymentIntentReference
    });

    expectInvoiceMath(invoiceBefore, 1500);
    expect(invoiceBefore.status).toBe("sent");

    const firstResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.ok()).toBe(true);
    expect(firstBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.expired",
      duplicate: false,
      handled: true
    });

    const invoiceAfterExpiration = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterExpiration = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterExpiration = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterExpiration, 1500);
    expect(invoiceAfterExpiration.status).toBe("sent");
    expect(paymentsAfterExpiration).toHaveLength(1);
    expect(paymentsAfterExpiration[0].id).toBe(paymentId);
    expect(Number(paymentsAfterExpiration[0].amount)).toBe(1500);
    expect(paymentsAfterExpiration[0].status).toBe("void");
    expect(paymentsAfterExpiration[0].gateway_provider).toBe("stripe");
    expect(paymentsAfterExpiration[0].gateway_status).toBe("expired");
    expect(paymentsAfterExpiration[0].gateway_checkout_session_reference).toBe(
      checkoutSessionReference
    );
    expect(paymentsAfterExpiration[0].gateway_payment_intent_reference).toBe(
      paymentIntentReference
    );
    expect(eventsAfterExpiration).toHaveLength(1);
    expect(eventsAfterExpiration[0]).toMatchObject({
      payment_id: paymentId,
      event_type: "payment_voided",
      actor_type: "provider",
      gateway_provider: "stripe",
      provider_event_id: eventId
    });
    expect(eventsAfterExpiration.map((event) => event.event_type)).not.toContain(
      "payment_succeeded"
    );

    const duplicateResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.ok()).toBe(true);
    expect(duplicateBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.expired",
      duplicate: true,
      handled: true,
      reason: "duplicate_provider_event"
    });

    const invoiceAfterDuplicate = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterDuplicate = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterDuplicate = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterDuplicate, 1500);
    expect(invoiceAfterDuplicate.status).toBe("sent");
    expect(paymentsAfterDuplicate).toHaveLength(1);
    expect(paymentsAfterDuplicate[0].status).toBe("void");
    expect(eventsAfterDuplicate).toHaveLength(1);
    expect(eventsAfterDuplicate[0].event_type).toBe("payment_voided");
  });

  test("synthetic signed async checkout failure records a disposable failed payment event idempotently without paying the invoice", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventId = `evt_e2e_webhook_async_failed_${invoiceId.replaceAll("-", "")}`;
    const checkoutSessionReference = `cs_test_e2e_async_failed_${invoiceId.replaceAll("-", "")}`;
    const paymentIntentReference = `pi_test_e2e_async_failed_${invoiceId.replaceAll("-", "")}`;
    const payload = createCheckoutAsyncPaymentFailedPayload({
      eventId,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference,
      paymentIntentReference
    });

    expectInvoiceMath(invoiceBefore, 1500);
    expect(invoiceBefore.status).toBe("sent");

    const firstResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.ok()).toBe(true);
    expect(firstBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.async_payment_failed",
      duplicate: false,
      handled: true
    });

    const invoiceAfterFailure = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterFailure = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterFailure = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterFailure, 1500);
    expect(invoiceAfterFailure.status).toBe("sent");
    expect(paymentsAfterFailure).toHaveLength(1);
    expect(paymentsAfterFailure[0].id).toBe(paymentId);
    expect(Number(paymentsAfterFailure[0].amount)).toBe(1500);
    expect(paymentsAfterFailure[0].status).toBe("pending");
    expect(paymentsAfterFailure[0].gateway_provider).toBe("stripe");
    expect(paymentsAfterFailure[0].gateway_status).toBe("unpaid");
    expect(paymentsAfterFailure[0].gateway_checkout_session_reference).toBe(
      checkoutSessionReference
    );
    expect(paymentsAfterFailure[0].gateway_payment_intent_reference).toBe(
      paymentIntentReference
    );
    expect(eventsAfterFailure).toHaveLength(1);
    expect(eventsAfterFailure[0]).toMatchObject({
      payment_id: paymentId,
      event_type: "payment_failed",
      actor_type: "provider",
      gateway_provider: "stripe",
      provider_event_id: eventId
    });
    expect(eventsAfterFailure.map((event) => event.event_type)).not.toContain(
      "payment_succeeded"
    );

    const duplicateResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.ok()).toBe(true);
    expect(duplicateBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.async_payment_failed",
      duplicate: true,
      handled: true,
      reason: "duplicate_provider_event"
    });

    const invoiceAfterDuplicate = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterDuplicate = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterDuplicate = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterDuplicate, 1500);
    expect(invoiceAfterDuplicate.status).toBe("sent");
    expect(paymentsAfterDuplicate).toHaveLength(1);
    expect(paymentsAfterDuplicate[0].status).toBe("pending");
    expect(paymentsAfterDuplicate[0].gateway_status).toBe("unpaid");
    expect(eventsAfterDuplicate).toHaveLength(1);
    expect(eventsAfterDuplicate[0].event_type).toBe("payment_failed");
  });

  test("synthetic signed PaymentIntent failure records a disposable failed payment event idempotently without paying the invoice", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventId = `evt_e2e_webhook_pi_failed_${invoiceId.replaceAll("-", "")}`;
    const checkoutSessionReference = `cs_test_e2e_pi_failed_${invoiceId.replaceAll("-", "")}`;
    const paymentIntentReference = `pi_test_e2e_failed_${invoiceId.replaceAll("-", "")}`;
    const payload = createPaymentIntentFailedPayload({
      eventId,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference,
      paymentIntentReference
    });

    expectInvoiceMath(invoiceBefore, 1500);
    expect(invoiceBefore.status).toBe("sent");

    const firstResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.ok()).toBe(true);
    expect(firstBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "payment_intent.payment_failed",
      duplicate: false,
      handled: true
    });

    const invoiceAfterFailure = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterFailure = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterFailure = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterFailure, 1500);
    expect(invoiceAfterFailure.status).toBe("sent");
    expect(paymentsAfterFailure).toHaveLength(1);
    expect(paymentsAfterFailure[0].id).toBe(paymentId);
    expect(Number(paymentsAfterFailure[0].amount)).toBe(1500);
    expect(paymentsAfterFailure[0].status).toBe("pending");
    expect(paymentsAfterFailure[0].gateway_provider).toBe("stripe");
    expect(paymentsAfterFailure[0].gateway_status).toBe("requires_payment_method");
    expect(paymentsAfterFailure[0].gateway_checkout_session_reference).toBe(
      checkoutSessionReference
    );
    expect(paymentsAfterFailure[0].gateway_payment_intent_reference).toBe(
      paymentIntentReference
    );
    expect(eventsAfterFailure).toHaveLength(1);
    expect(eventsAfterFailure[0]).toMatchObject({
      payment_id: paymentId,
      event_type: "payment_failed",
      actor_type: "provider",
      gateway_provider: "stripe",
      provider_event_id: eventId
    });
    expect(eventsAfterFailure.map((event) => event.event_type)).not.toContain(
      "payment_succeeded"
    );

    const duplicateResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.ok()).toBe(true);
    expect(duplicateBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "payment_intent.payment_failed",
      duplicate: true,
      handled: true,
      reason: "duplicate_provider_event"
    });

    const invoiceAfterDuplicate = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterDuplicate = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterDuplicate = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterDuplicate, 1500);
    expect(invoiceAfterDuplicate.status).toBe("sent");
    expect(paymentsAfterDuplicate).toHaveLength(1);
    expect(paymentsAfterDuplicate[0].status).toBe("pending");
    expect(paymentsAfterDuplicate[0].gateway_status).toBe("requires_payment_method");
    expect(eventsAfterDuplicate).toHaveLength(1);
    expect(eventsAfterDuplicate[0].event_type).toBe("payment_failed");
  });

  test("synthetic signed PaymentIntent cancellation voids a disposable pending payment idempotently without paying the invoice", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const invoiceBefore = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventId = `evt_e2e_webhook_pi_canceled_${invoiceId.replaceAll("-", "")}`;
    const checkoutSessionReference = `cs_test_e2e_pi_canceled_${invoiceId.replaceAll("-", "")}`;
    const paymentIntentReference = `pi_test_e2e_canceled_${invoiceId.replaceAll("-", "")}`;
    const payload = createPaymentIntentCanceledPayload({
      eventId,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference,
      paymentIntentReference
    });

    expectInvoiceMath(invoiceBefore, 1500);
    expect(invoiceBefore.status).toBe("sent");

    const firstResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const firstBody = await firstResponse.json();

    expect(firstResponse.ok()).toBe(true);
    expect(firstBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "payment_intent.canceled",
      duplicate: false,
      handled: true
    });

    const invoiceAfterCancellation = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterCancellation = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterCancellation = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterCancellation, 1500);
    expect(invoiceAfterCancellation.status).toBe("sent");
    expect(paymentsAfterCancellation).toHaveLength(1);
    expect(paymentsAfterCancellation[0].id).toBe(paymentId);
    expect(Number(paymentsAfterCancellation[0].amount)).toBe(1500);
    expect(paymentsAfterCancellation[0].status).toBe("void");
    expect(paymentsAfterCancellation[0].gateway_provider).toBe("stripe");
    expect(paymentsAfterCancellation[0].gateway_status).toBe("canceled");
    expect(paymentsAfterCancellation[0].gateway_checkout_session_reference).toBe(
      checkoutSessionReference
    );
    expect(paymentsAfterCancellation[0].gateway_payment_intent_reference).toBe(
      paymentIntentReference
    );
    expect(eventsAfterCancellation).toHaveLength(1);
    expect(eventsAfterCancellation[0]).toMatchObject({
      payment_id: paymentId,
      event_type: "payment_voided",
      actor_type: "provider",
      gateway_provider: "stripe",
      provider_event_id: eventId
    });
    expect(eventsAfterCancellation.map((event) => event.event_type)).not.toContain(
      "payment_succeeded"
    );

    const duplicateResponse = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const duplicateBody = await duplicateResponse.json();

    expect(duplicateResponse.ok()).toBe(true);
    expect(duplicateBody).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "payment_intent.canceled",
      duplicate: true,
      handled: true,
      reason: "duplicate_provider_event"
    });

    const invoiceAfterDuplicate = await loadInvoice(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const paymentsAfterDuplicate = await loadPayments(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const eventsAfterDuplicate = await loadPaymentEvents(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectInvoiceMath(invoiceAfterDuplicate, 1500);
    expect(invoiceAfterDuplicate.status).toBe("sent");
    expect(paymentsAfterDuplicate).toHaveLength(1);
    expect(paymentsAfterDuplicate[0].status).toBe("void");
    expect(paymentsAfterDuplicate[0].gateway_status).toBe("canceled");
    expect(eventsAfterDuplicate).toHaveLength(1);
    expect(eventsAfterDuplicate[0].event_type).toBe("payment_voided");
  });

  test("rejects an invalid Stripe signature before canonical payment mutation", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const before = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const payload = createCheckoutCompletedPayload({
      eventId: `evt_e2e_webhook_invalid_sig_${invoiceId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference: `cs_test_e2e_invalid_sig_${invoiceId.replaceAll("-", "")}`,
      paymentIntentReference: `pi_test_e2e_invalid_sig_${invoiceId.replaceAll("-", "")}`
    });

    const response = await postInvalidSignatureStripeWebhook(request, payload);
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.received).toBe(false);
    expect(String(body.error).toLowerCase()).toContain("signature");

    const after = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectWebhookStateUnchanged(before, after);
    expect(after.payments).toHaveLength(1);
    expect(after.payments[0].id).toBe(paymentId);
    expect(after.payments[0].status).toBe("pending");
    expect(after.events).toHaveLength(0);
  });

  test("ignores a signed Stripe webhook with missing canonical metadata without mutation", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const before = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const payload = createCheckoutCompletedMissingMetadataPayload({
      eventId: `evt_e2e_webhook_missing_metadata_${invoiceId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId,
      checkoutSessionReference: `cs_test_e2e_missing_metadata_${invoiceId.replaceAll("-", "")}`,
      paymentIntentReference: `pi_test_e2e_missing_metadata_${invoiceId.replaceAll("-", "")}`
    });

    const response = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: false,
      handled: false,
      reason: "missing_canonical_references"
    });

    const after = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectWebhookStateUnchanged(before, after);
    expect(after.payments).toHaveLength(1);
    expect(after.payments[0].id).toBe(paymentId);
    expect(after.events).toHaveLength(0);
  });

  test("ignores a signed Stripe webhook with a wrong canonical payment id without mutation", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const before = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const payload = createCheckoutCompletedPayload({
      eventId: `evt_e2e_webhook_wrong_payment_${invoiceId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId: "00000000-0000-4000-8000-000000000000",
      checkoutSessionReference: `cs_test_e2e_wrong_payment_${invoiceId.replaceAll("-", "")}`,
      paymentIntentReference: `pi_test_e2e_wrong_payment_${invoiceId.replaceAll("-", "")}`
    });

    const response = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: false,
      handled: false,
      reason: "missing_canonical_payment"
    });

    const after = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectWebhookStateUnchanged(before, after);
    expect(after.payments).toHaveLength(1);
    expect(after.payments[0].id).toBe(paymentId);
    expect(after.payments[0].status).toBe("pending");
    expect(after.events).toHaveLength(0);
  });

  test("ignores a signed Stripe webhook when a real payment belongs to a different invoice", async ({
    request
  }) => {
    const invoiceAId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentAId = await ensurePendingPayment(supabase, fixtureContext, invoiceAId);
    const invoiceBId = await ensureDisposableInvoice(
      supabase,
      fixtureContext,
      disposableCrossReferenceInvoice
    );
    const paymentBId = await ensurePendingPayment(supabase, fixtureContext, invoiceBId);
    const beforeA = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceAId
    );
    const beforeB = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceBId
    );
    const payload = createCheckoutCompletedPayload({
      eventId: `evt_e2e_webhook_cross_invoice_${invoiceAId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId: invoiceAId,
      paymentId: paymentBId,
      checkoutSessionReference: `cs_test_e2e_cross_invoice_${invoiceAId.replaceAll("-", "")}`,
      paymentIntentReference: `pi_test_e2e_cross_invoice_${invoiceAId.replaceAll("-", "")}`
    });

    const response = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: false,
      handled: false,
      reason: "missing_canonical_payment"
    });

    const afterA = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceAId
    );
    const afterB = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceBId
    );

    expectWebhookStateUnchanged(beforeA, afterA);
    expectWebhookStateUnchanged(beforeB, afterB);
    expect(afterA.payments).toHaveLength(1);
    expect(afterA.payments[0].id).toBe(paymentAId);
    expect(afterA.payments[0].status).toBe("pending");
    expect(afterA.events).toHaveLength(0);
    expect(afterB.payments).toHaveLength(1);
    expect(afterB.payments[0].id).toBe(paymentBId);
    expect(afterB.payments[0].status).toBe("pending");
    expect(afterB.events).toHaveLength(0);
  });

  test("ignores a signed Stripe webhook when a real payment belongs to a different tenant", async ({
    request
  }) => {
    // Tenant B is prepared by the write-gated fixture seam. This spec only
    // discovers it so tenant creation stays explicit and reusable.
    const tenantB = await loadSecondTenantFixture(
      supabase,
      fixtureContext.organizationId
    );

    test.skip(
      !tenantB,
      "Run FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 pnpm e2e:second-tenant-fixture -- --write before cross-tenant webhook coverage."
    );

    const invoiceAId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentAId = await ensurePendingPayment(supabase, fixtureContext, invoiceAId);
    const beforeA = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceAId
    );
    const beforeB = await loadWebhookState(
      supabase,
      tenantB.organizationId,
      tenantB.invoiceId
    );

    expect(beforeA.events).toHaveLength(0);
    expect(beforeB.events).toHaveLength(0);

    const payload = createCheckoutCompletedPayload({
      eventId: `evt_e2e_webhook_cross_tenant_${invoiceAId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId: invoiceAId,
      paymentId: tenantB.paymentId,
      checkoutSessionReference: `cs_test_e2e_cross_tenant_${invoiceAId.replaceAll("-", "")}`,
      paymentIntentReference: `pi_test_e2e_cross_tenant_${invoiceAId.replaceAll("-", "")}`
    });

    const response = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "checkout.session.completed",
      duplicate: false,
      handled: false,
      reason: "missing_canonical_payment"
    });

    const afterA = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceAId
    );
    const afterB = await loadWebhookState(
      supabase,
      tenantB.organizationId,
      tenantB.invoiceId
    );

    expectWebhookStateUnchanged(beforeA, afterA);
    expectWebhookStateUnchanged(beforeB, afterB);
    expect(afterA.payments).toHaveLength(1);
    expect(afterA.payments[0].id).toBe(paymentAId);
    expect(afterA.payments[0].status).toBe("pending");
    expect(afterA.events).toHaveLength(0);
    expect(afterB.payments).toHaveLength(beforeB.payments.length);
    expect(afterB.payments.some((payment) => payment.id === tenantB.paymentId)).toBe(
      true
    );
    expect(afterB.events).toHaveLength(0);
  });

  test("ignores a signed unsupported Stripe event type without canonical mutation", async ({
    request
  }) => {
    const invoiceId = await ensureDisposableInvoice(supabase, fixtureContext);
    const paymentId = await ensurePendingPayment(supabase, fixtureContext, invoiceId);
    const before = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );
    const payload = createUnsupportedStripePayload({
      eventId: `evt_e2e_webhook_unsupported_${invoiceId.replaceAll("-", "")}`,
      organizationId: fixtureContext.organizationId,
      invoiceId,
      paymentId
    });

    const response = await postSignedStripeWebhook(
      request,
      payload,
      env.STRIPE_WEBHOOK_SECRET
    );
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body).toMatchObject({
      received: true,
      provider: "stripe",
      eventType: "customer.created",
      duplicate: false,
      handled: false,
      reason: "ignored_event_type"
    });

    const after = await loadWebhookState(
      supabase,
      fixtureContext.organizationId,
      invoiceId
    );

    expectWebhookStateUnchanged(before, after);
    expect(after.payments).toHaveLength(1);
    expect(after.payments[0].id).toBe(paymentId);
    expect(after.events).toHaveLength(0);
  });
});
