#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

const fixture = {
  companySlug: "e2e-stripe-webhook-tenant-b",
  companyName: "E2E Stripe Webhook Tenant B",
  customerName: "E2E Stripe Webhook Tenant B Customer",
  customerEmail: "e2e-stripe-webhook-tenant-b@example.invalid",
  projectName: "E2E Stripe Webhook Tenant B Project",
  invoiceReference: "E2E-STRIPE-WEBHOOK-TENANT-B-INVOICE",
  invoiceNotes: "E2E disposable tenant B invoice for synthetic webhook integrity tests.",
  paymentNotes: "E2E disposable tenant B pending payment for synthetic webhook integrity tests."
};

function loadRootEnv() {
  const envPath = path.join(workspaceRoot, ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envText = fs.readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function readArgs() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--help") || args.has("-h")) {
    console.log(
      [
        "Usage: pnpm e2e:second-tenant-fixture [-- --write]",
        "",
        "Default mode validates the disposable tenant B E2E fixture without mutating data.",
        "Validation requires these env vars:",
        "  NEXT_PUBLIC_SUPABASE_URL",
        "  SUPABASE_SERVICE_ROLE_KEY",
        "  FLOORCONNECTOR_E2E_EMAIL",
        "Write mode creates or resets tenant B canonical fixture records and requires:",
        "  FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1"
      ].join("\n")
    );
    process.exit(0);
  }

  return {
    write: args.has("--write")
  };
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function createAdminClient({ url, serviceRoleKey }) {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function assertWriteAllowed() {
  if (process.env.FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE !== "1") {
    throw new Error(
      "Write mode requires FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1."
    );
  }

  if (
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    throw new Error(
      "Refusing to write the second-tenant E2E fixture in a production-marked environment."
    );
  }
}

function addResult(results, name, status, detail = null) {
  results.push({ name, status, detail });
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

async function insertAndReturnId(supabase, table, payload, label) {
  const response = await supabase
    .from(table)
    .insert(payload)
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create ${label}: ${response.error.message}`);
  }

  return response.data.id;
}

async function updateAndReturnId(supabase, table, id, payload, label) {
  const response = await supabase
    .from(table)
    .update(payload)
    .eq("id", id)
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to reset ${label}: ${response.error.message}`);
  }

  return response.data.id;
}

async function getContractorUserId(supabase, contractorEmail) {
  const response = await supabase
    .from("users")
    .select("id, email")
    .eq("email", contractorEmail)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to load contractor E2E user: ${
        response.error?.message ?? "No canonical user found."
      }`
    );
  }

  return response.data.id;
}

async function getPrimaryContractorOrganizationId(supabase, userId) {
  const response = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userId)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error || !response.data) {
    throw new Error(
      `Unable to load tenant A E2E organization: ${
        response.error?.message ?? "No active membership found."
      }`
    );
  }

  return response.data.company_id;
}

async function ensureCompany({ supabase, userId, write, results }) {
  const existing = await findSingleBy(supabase, "companies", "id", [
    { column: "slug", value: fixture.companySlug }
  ]);

  const payload = {
    slug: fixture.companySlug,
    legal_name: fixture.companyName,
    display_name: fixture.companyName,
    tenant_status: "trialing",
    lifecycle_state: "trial",
    primary_contact_user_id: null,
    updated_by: userId
  };

  if (existing?.id) {
    if (write) {
      const id = await updateAndReturnId(
        supabase,
        "companies",
        existing.id,
        payload,
        "tenant B company"
      );
      addResult(results, "Tenant B company", "reset");
      return id;
    }

    addResult(results, "Tenant B company", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B company", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "companies",
    {
      ...payload,
      created_by: userId
    },
    "tenant B company"
  );
  addResult(results, "Tenant B company", "created");
  return id;
}

async function ensureCustomer({ supabase, organizationId, userId, write, results }) {
  if (!organizationId) {
    addResult(results, "Tenant B customer", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "customers", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: fixture.customerEmail }
  ]);

  const payload = {
    company_id: organizationId,
    name: fixture.customerName,
    company_name: fixture.customerName,
    email: fixture.customerEmail,
    phone: "555-0198",
    address_line_1: "198 Tenant B Way",
    city: "Fixture City",
    state_region: "FL",
    postal_code: "00000",
    country_code: "US",
    notes: "Disposable tenant B customer for synthetic webhook integrity tests.",
    updated_by: userId
  };

  if (existing?.id) {
    if (write) {
      const id = await updateAndReturnId(
        supabase,
        "customers",
        existing.id,
        payload,
        "tenant B customer"
      );
      addResult(results, "Tenant B customer", "reset");
      return id;
    }

    addResult(results, "Tenant B customer", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B customer", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "customers",
    {
      ...payload,
      created_by: userId
    },
    "tenant B customer"
  );
  addResult(results, "Tenant B customer", "created");
  return id;
}

async function ensureProject({
  supabase,
  organizationId,
  userId,
  customerId,
  write,
  results
}) {
  if (!organizationId || !customerId) {
    addResult(results, "Tenant B project", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "name", value: fixture.projectName }
  ]);

  const payload = {
    company_id: organizationId,
    customer_id: customerId,
    name: fixture.projectName,
    status: "approved",
    description: "Disposable tenant B project for synthetic webhook integrity tests.",
    address_line_1: "198 Tenant B Way",
    city: "Fixture City",
    state_region: "FL",
    postal_code: "00000",
    country_code: "US",
    commercial_readiness_status: "ready_to_schedule",
    financing_status: "not_applicable",
    updated_by: userId
  };

  if (existing?.id) {
    if (write) {
      const id = await updateAndReturnId(
        supabase,
        "projects",
        existing.id,
        payload,
        "tenant B project"
      );
      addResult(results, "Tenant B project", "reset");
      return id;
    }

    addResult(results, "Tenant B project", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B project", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "projects",
    {
      ...payload,
      created_by: userId
    },
    "tenant B project"
  );
  addResult(results, "Tenant B project", "created");
  return id;
}

async function deleteDisposablePaymentState(supabase, organizationId, invoiceId) {
  const eventsResponse = await supabase
    .from("payment_events")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (eventsResponse.error) {
    throw new Error(`Unable to delete tenant B payment events: ${eventsResponse.error.message}`);
  }

  const paymentsResponse = await supabase
    .from("payments")
    .delete()
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId);

  if (paymentsResponse.error) {
    throw new Error(`Unable to delete tenant B payments: ${paymentsResponse.error.message}`);
  }
}

async function ensureInvoice({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  write,
  results
}) {
  if (!organizationId || !customerId || !projectId) {
    addResult(results, "Tenant B invoice", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: organizationId },
    { column: "reference_number", value: fixture.invoiceReference }
  ]);

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);

  const payload = {
    company_id: organizationId,
    customer_id: customerId,
    project_id: projectId,
    estimate_id: null,
    job_id: null,
    reference_number: fixture.invoiceReference,
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
    notes: fixture.invoiceNotes,
    updated_by: userId
  };

  if (existing?.id) {
    if (write) {
      await deleteDisposablePaymentState(supabase, organizationId, existing.id);
      const id = await updateAndReturnId(
        supabase,
        "invoices",
        existing.id,
        payload,
        "tenant B invoice"
      );
      addResult(results, "Tenant B invoice", "reset");
      return id;
    }

    addResult(results, "Tenant B invoice", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B invoice", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "invoices",
    {
      ...payload,
      created_by: userId
    },
    "tenant B invoice"
  );
  addResult(results, "Tenant B invoice", "created");
  return id;
}

async function ensureInvoiceLineItem({
  supabase,
  organizationId,
  userId,
  invoiceId,
  write,
  results
}) {
  if (!organizationId || !invoiceId) {
    addResult(results, "Tenant B invoice line item", "missing");
    return null;
  }

  const existingRows = await supabase
    .from("invoice_line_items")
    .select("id")
    .eq("company_id", organizationId)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (existingRows.error) {
    throw new Error(`Unable to load tenant B invoice line items: ${existingRows.error.message}`);
  }

  const payload = {
    company_id: organizationId,
    invoice_id: invoiceId,
    name: "E2E tenant B webhook line",
    description: "Disposable tenant B invoice line for synthetic webhook integrity tests.",
    quantity: "1.00",
    unit: "each",
    unit_price: "1500.00",
    sort_order: 1,
    lineage_type: "invoice_only_adjustment",
    invoice_only_adjustment_kind: "explicit_adjustment",
    created_by: userId,
    updated_by: userId
  };

  const existing = existingRows.data?.[0];

  if (existing?.id) {
    if (write) {
      await updateAndReturnId(
        supabase,
        "invoice_line_items",
        existing.id,
        payload,
        "tenant B invoice line item"
      );
      const extraIds = (existingRows.data ?? []).slice(1).map((row) => row.id);

      if (extraIds.length > 0) {
        const deleteResponse = await supabase
          .from("invoice_line_items")
          .delete()
          .eq("company_id", organizationId)
          .in("id", extraIds);

        if (deleteResponse.error) {
          throw new Error(
            `Unable to clean extra tenant B invoice line items: ${deleteResponse.error.message}`
          );
        }
      }

      addResult(results, "Tenant B invoice line item", "reset");
    } else {
      addResult(results, "Tenant B invoice line item", "present");
    }

    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B invoice line item", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "invoice_line_items",
    payload,
    "tenant B invoice line item"
  );
  addResult(results, "Tenant B invoice line item", "created");
  return id;
}

async function ensurePendingPayment({
  supabase,
  organizationId,
  userId,
  invoiceId,
  write,
  results
}) {
  if (!organizationId || !invoiceId) {
    addResult(results, "Tenant B pending payment", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "payments", "id", [
    { column: "company_id", value: organizationId },
    { column: "invoice_id", value: invoiceId },
    { column: "notes", value: fixture.paymentNotes }
  ]);

  const payload = {
    company_id: organizationId,
    invoice_id: invoiceId,
    amount: "1500.00",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "Secure checkout",
    payment_source: "customer_portal",
    recorded_via: "customer_portal",
    gateway_provider: "stripe",
    gateway_status: "pending",
    gateway_payment_intent_reference: null,
    gateway_checkout_session_reference: null,
    payer_email: fixture.customerEmail,
    notes: fixture.paymentNotes,
    status: "pending",
    updated_by: userId
  };

  if (existing?.id) {
    if (write) {
      const id = await updateAndReturnId(
        supabase,
        "payments",
        existing.id,
        payload,
        "tenant B pending payment"
      );
      addResult(results, "Tenant B pending payment", "reset");
      return id;
    }

    addResult(results, "Tenant B pending payment", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Tenant B pending payment", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "payments",
    {
      ...payload,
      created_by: userId
    },
    "tenant B pending payment"
  );
  addResult(results, "Tenant B pending payment", "created");
  return id;
}

async function main() {
  loadRootEnv();
  const { write } = readArgs();

  if (write) {
    assertWriteAllowed();
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    FLOORCONNECTOR_E2E_EMAIL: requireEnv("FLOORCONNECTOR_E2E_EMAIL")
  };
  const supabase = createAdminClient({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
  });
  const results = [];
  const userId = await getContractorUserId(supabase, env.FLOORCONNECTOR_E2E_EMAIL);
  const tenantAOrganizationId = await getPrimaryContractorOrganizationId(supabase, userId);
  const organizationId = await ensureCompany({ supabase, userId, write, results });

  if (organizationId && organizationId === tenantAOrganizationId) {
    throw new Error("Tenant B fixture resolved to the tenant A E2E organization.");
  }

  if (organizationId) {
    addResult(results, "Tenant B organization boundary", "distinct_from_tenant_a");
  }

  const customerId = await ensureCustomer({
    supabase,
    organizationId,
    userId,
    write,
    results
  });
  const projectId = await ensureProject({
    supabase,
    organizationId,
    userId,
    customerId,
    write,
    results
  });
  const invoiceId = await ensureInvoice({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId,
    write,
    results
  });
  const invoiceLineItemId = await ensureInvoiceLineItem({
    supabase,
    organizationId,
    userId,
    invoiceId,
    write,
    results
  });
  const paymentId = await ensurePendingPayment({
    supabase,
    organizationId,
    userId,
    invoiceId,
    write,
    results
  });

  const payload = {
    mode: write ? "write" : "validate",
    results,
    fixture: {
      organizationId,
      customerId,
      projectId,
      invoiceId,
      invoiceLineItemId,
      paymentId,
      tenantAOrganizationId,
      companySlug: fixture.companySlug,
      invoiceReference: fixture.invoiceReference,
      customerEmail: fixture.customerEmail
    }
  };

  console.log(JSON.stringify(payload, null, 2));

  const missing = results.filter((result) => result.status === "missing");
  if (missing.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
