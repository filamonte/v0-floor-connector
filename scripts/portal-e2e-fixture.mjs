#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

const fixture = {
  customerName: "E2E Portal Customer",
  customerCompanyName: "FloorConnector Portal E2E",
  contactName: "E2E Portal Customer",
  projectName: "[E2E] Portal Golden Path",
  unauthorizedProjectName: "[E2E] Portal Unauthorized Boundary",
  opportunityTitle: "[E2E] Portal Golden Path Opportunity",
  catalogItemName: "[E2E] Portal Surface System",
  estimateTitle: "E2E Portal Estimate Review",
  contractTitle: "E2E Portal Contract Review",
  changeOrderTitle: "E2E Portal Change Order Review",
  invoiceNotes:
    "Portal E2E fixture invoice. Smoke tests may load this page but must not start checkout."
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
        "Usage: pnpm e2e:portal-fixture [-- --write]",
        "",
        "Default mode validates the portal E2E fixture without mutating data.",
        "Validation requires these env var names:",
        "  NEXT_PUBLIC_SUPABASE_URL",
        "  SUPABASE_SERVICE_ROLE_KEY",
        "  FLOORCONNECTOR_E2E_EMAIL",
        "  FLOORCONNECTOR_PORTAL_E2E_EMAIL",
        "Write mode creates or repairs canonical dev/test fixture records and requires:",
        "  FLOORCONNECTOR_PORTAL_E2E_PASSWORD",
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

function getRequiredEnv(names, purpose) {
  const missing = names.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `${purpose} is missing required env vars: ${missing.join(", ")}.`
    );
  }

  return Object.fromEntries(
    names.map((name) => [name, requireEnv(name)])
  );
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
      "Refusing to write the portal E2E fixture in a production-marked environment."
    );
  }
}

function addResult(results, name, status, detail = null) {
  results.push({ name, status, detail });
}

function requireWrite(write, message) {
  if (!write) {
    return false;
  }

  throw new Error(message);
}

async function findAuthUserByEmail(supabase, email) {
  let page = 1;

  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw new Error(`Unable to list Supabase Auth users: ${error.message}`);
    }

    const users = data?.users ?? [];
    const matchedUser = users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchedUser) {
      return matchedUser;
    }

    if (users.length < 200) {
      return null;
    }

    page += 1;
  }

  throw new Error("Unable to finish scanning Supabase Auth users.");
}

async function ensureAuthUser({ supabase, email, password, write, results }) {
  const existingUser = await findAuthUserByEmail(supabase, email);

  if (existingUser) {
    if (write) {
      if (!password) {
        throw new Error(
          "FLOORCONNECTOR_PORTAL_E2E_PASSWORD is required to repair the portal auth user."
        );
      }

      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fixture.contactName
          }
        }
      );

      if (error) {
        throw new Error(`Unable to update portal auth user: ${error.message}`);
      }

      addResult(results, "Supabase Auth portal user", "updated");
      return data.user ?? existingUser;
    }

    addResult(results, "Supabase Auth portal user", "present");
    return existingUser;
  }

  if (!write) {
    addResult(
      results,
      "Supabase Auth portal user",
      "missing",
      "Run write mode after setting portal credentials."
    );
    return null;
  }

  if (!password) {
    throw new Error(
      "FLOORCONNECTOR_PORTAL_E2E_PASSWORD is required to create the portal auth user."
    );
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fixture.contactName
    }
  });

  if (error) {
    throw new Error(`Unable to create portal auth user: ${error.message}`);
  }

  addResult(results, "Supabase Auth portal user", "created");
  return data.user;
}

async function waitForCanonicalUser(supabase, userId) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await supabase
      .from("users")
      .select("id, email")
      .eq("id", userId)
      .maybeSingle();

    if (response.error) {
      throw new Error(
        `Unable to load canonical portal user profile: ${response.error.message}`
      );
    }

    if (response.data) {
      return response.data;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

async function getContractorContext(supabase, contractorEmail) {
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", contractorEmail)
    .maybeSingle();

  if (userResponse.error) {
    throw new Error(
      `Unable to load contractor E2E user profile: ${userResponse.error.message}`
    );
  }

  if (!userResponse.data) {
    throw new Error(
      "No canonical contractor user exists for FLOORCONNECTOR_E2E_EMAIL."
    );
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id, membership_status")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error) {
    throw new Error(
      `Unable to load contractor E2E organization membership: ${membershipResponse.error.message}`
    );
  }

  if (!membershipResponse.data) {
    throw new Error(
      "No active company membership exists for FLOORCONNECTOR_E2E_EMAIL."
    );
  }

  return {
    userId: userResponse.data.id,
    organizationId: membershipResponse.data.company_id
  };
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

async function ensureCustomer({
  supabase,
  organizationId,
  userId,
  email,
  write,
  results
}) {
  const existing = await findSingleBy(supabase, "customers", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: email }
  ]);

  if (existing) {
    addResult(results, "Canonical customer", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Canonical customer", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "customers",
    {
      company_id: organizationId,
      name: fixture.customerName,
      company_name: fixture.customerCompanyName,
      email,
      phone: "555-0130",
      address_line_1: "130 Portal Fixture Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      notes: "Stable local portal E2E customer fixture.",
      created_by: userId,
      updated_by: userId
    },
    "canonical customer"
  );

  addResult(results, "Canonical customer", "created");
  return id;
}

async function ensureContact({
  supabase,
  organizationId,
  userId,
  email,
  write,
  results
}) {
  const existing = await findSingleBy(supabase, "contacts", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: email }
  ]);

  if (existing) {
    addResult(results, "Canonical customer contact", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Canonical customer contact", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "contacts",
    {
      company_id: organizationId,
      display_name: fixture.contactName,
      company_name: fixture.customerCompanyName,
      email,
      phone: "555-0130",
      contact_kind: "portal_contact",
      notes: "Stable local portal E2E contact fixture.",
      created_by: userId,
      updated_by: userId
    },
    "canonical contact"
  );

  addResult(results, "Canonical customer contact", "created");
  return id;
}

async function ensureCustomerContact({
  supabase,
  organizationId,
  userId,
  customerId,
  contactId,
  write,
  results
}) {
  if (!customerId || !contactId) {
    addResult(results, "Customer-contact relationship", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "customer_contacts", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "contact_id", value: contactId }
  ]);

  if (existing) {
    addResult(results, "Customer-contact relationship", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Customer-contact relationship", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "customer_contacts",
    {
      company_id: organizationId,
      customer_id: customerId,
      contact_id: contactId,
      relationship_label: "Portal E2E contact",
      is_primary: true,
      created_by: userId,
      updated_by: userId
    },
    "customer-contact relationship"
  );

  addResult(results, "Customer-contact relationship", "created");
  return id;
}

async function ensureProject({
  supabase,
  organizationId,
  userId,
  customerId,
  projectName,
  write,
  results,
  label
}) {
  if (!customerId) {
    addResult(results, label, "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "name", value: projectName }
  ]);

  if (existing) {
    addResult(results, label, "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, label, "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "projects",
    {
      company_id: organizationId,
      customer_id: customerId,
      name: projectName,
      status: "approved",
      description: "Stable local portal E2E project fixture.",
      address_line_1: "130 Portal Fixture Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: "ready_to_schedule",
      financing_status: "not_applicable",
      created_by: userId,
      updated_by: userId
    },
    label.toLowerCase()
  );

  addResult(results, label, "created");
  return id;
}

async function ensurePortalGrant({
  supabase,
  organizationId,
  userId,
  customerId,
  customerContactId,
  portalUserId,
  portalEmail,
  write,
  results
}) {
  if (!customerId || !portalUserId) {
    addResult(results, "Active portal access grant", "missing");
    return null;
  }

  const existing = await findSingleBy(
    supabase,
    "portal_access_grants",
    "id, status",
    [
      { column: "company_id", value: organizationId },
      { column: "customer_id", value: customerId },
      { column: "user_id", value: portalUserId }
    ]
  );

  if (existing?.status === "active") {
    addResult(results, "Active portal access grant", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Active portal access grant", "missing");
    return existing?.id ?? null;
  }

  const now = new Date().toISOString();

  if (existing) {
    const response = await supabase
      .from("portal_access_grants")
      .update({
        status: "active",
        customer_contact_id: customerContactId,
        invited_email: portalEmail,
        invited_by: userId,
        activated_at: now,
        revoked_at: null,
        invite_accepted_at: now
      })
      .eq("company_id", organizationId)
      .eq("id", existing.id);

    if (response.error) {
      throw new Error(
        `Unable to activate portal access grant: ${response.error.message}`
      );
    }

    addResult(results, "Active portal access grant", "activated");
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "portal_access_grants",
    {
      company_id: organizationId,
      customer_id: customerId,
      customer_contact_id: customerContactId,
      user_id: portalUserId,
      invited_by: userId,
      invited_email: portalEmail,
      status: "active",
      activated_at: now,
      invite_accepted_at: now
    },
    "portal access grant"
  );

  addResult(results, "Active portal access grant", "created");
  return id;
}

async function ensurePortalProjectAccess({
  supabase,
  organizationId,
  grantId,
  projectId,
  write,
  results
}) {
  if (!grantId || !projectId) {
    addResult(results, "Active portal project access", "missing");
    return null;
  }

  const existing = await findSingleBy(
    supabase,
    "portal_project_access",
    "id, status",
    [
      { column: "company_id", value: organizationId },
      { column: "portal_access_grant_id", value: grantId },
      { column: "project_id", value: projectId }
    ]
  );

  if (existing?.status === "active") {
    addResult(results, "Active portal project access", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Active portal project access", "missing");
    return existing?.id ?? null;
  }

  if (existing) {
    const response = await supabase
      .from("portal_project_access")
      .update({
        status: "active",
        revoked_at: null
      })
      .eq("company_id", organizationId)
      .eq("id", existing.id);

    if (response.error) {
      throw new Error(
        `Unable to activate portal project access: ${response.error.message}`
      );
    }

    addResult(results, "Active portal project access", "activated");
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "portal_project_access",
    {
      company_id: organizationId,
      portal_access_grant_id: grantId,
      project_id: projectId,
      status: "active"
    },
    "portal project access"
  );

  addResult(results, "Active portal project access", "created");
  return id;
}

async function ensureOpportunity({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  portalEmail,
  write,
  results
}) {
  if (!customerId || !projectId) {
    addResult(results, "Portal opportunity fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "opportunities", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.opportunityTitle }
  ]);

  if (existing) {
    addResult(results, "Portal opportunity fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal opportunity fixture", "missing");
    return null;
  }

  const now = new Date().toISOString();
  const id = await insertAndReturnId(
    supabase,
    "opportunities",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      status: "converted",
      title: fixture.opportunityTitle,
      source: "e2e_fixture",
      service_type: "portal_e2e",
      prospect_name: fixture.contactName,
      prospect_company_name: fixture.customerCompanyName,
      email: portalEmail,
      phone: "555-0130",
      address_line_1: "130 Portal Fixture Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      notes: "Stable local portal E2E opportunity fixture.",
      qualified_at: now,
      converted_at: now,
      created_by: userId,
      updated_by: userId
    },
    "portal opportunity"
  );

  addResult(results, "Portal opportunity fixture", "created");
  return id;
}

async function ensureCatalogItem({
  supabase,
  organizationId,
  userId,
  write,
  results
}) {
  const existing = await findSingleBy(supabase, "catalog_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: fixture.catalogItemName }
  ]);

  if (existing) {
    addResult(results, "Portal catalog item fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal catalog item fixture", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "catalog_items",
    {
      company_id: organizationId,
      item_type: "service",
      name: fixture.catalogItemName,
      description: "Fixture customer-facing catalog service for portal E2E.",
      unit: "each",
      default_unit_cost: "900.00",
      default_unit_price: "1500.00",
      markup_percent: "0.00",
      hidden_markup_percent: "0.00",
      taxable: false,
      category: "E2E",
      sku: "E2E-PORTAL-SURFACE",
      status: "active",
      is_default: false,
      metadata: {},
      sort_order: 0,
      created_by: userId,
      updated_by: userId
    },
    "portal catalog item"
  );

  addResult(results, "Portal catalog item fixture", "created");
  return id;
}

async function ensurePortalPermissions({
  supabase,
  organizationId,
  userId,
  customerContactId,
  grantId,
  write,
  results
}) {
  if (!customerContactId || !grantId) {
    addResult(results, "Stored portal contact permissions", "missing");
    return null;
  }

  const existing = await findSingleBy(
    supabase,
    "customer_contact_portal_permissions",
    "id",
    [
      { column: "company_id", value: organizationId },
      { column: "customer_contact_id", value: customerContactId }
    ]
  );

  if (existing) {
    addResult(results, "Stored portal contact permissions", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Stored portal contact permissions", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "customer_contact_portal_permissions",
    {
      company_id: organizationId,
      customer_contact_id: customerContactId,
      portal_access_grant_id: grantId,
      can_view_estimates: true,
      can_approve_estimates: true,
      can_sign_contracts: true,
      can_approve_change_orders: true,
      can_view_pay_invoices: true,
      can_request_quotes: true,
      management_source: "contractor_admin",
      last_managed_by_user_id: userId,
      last_override_by_user_id: userId
    },
    "stored portal contact permissions"
  );

  addResult(results, "Stored portal contact permissions", "created");
  return id;
}

async function ensureEstimate({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  opportunityId,
  catalogItemId,
  write,
  results
}) {
  if (!customerId || !projectId || !opportunityId || !catalogItemId) {
    addResult(results, "Portal estimate fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.estimateTitle }
  ]);

  if (existing) {
    addResult(results, "Portal estimate fixture", "present");
    await ensureEstimateLineItem({
      supabase,
      organizationId,
      userId,
      estimateId: existing.id,
      catalogItemId,
      write,
      results
    });
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal estimate fixture", "missing");
    return null;
  }

  const now = new Date().toISOString();
  const estimateId = await insertAndReturnId(
    supabase,
    "estimates",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      opportunity_id: opportunityId,
      title: fixture.estimateTitle,
      status: "sent",
      discount_amount: "0.00",
      notes: "Stable local portal E2E estimate fixture.",
      content: {
        termsHtml: "<p>Fixture terms for portal E2E review.</p>",
        inclusionsHtml: "<p>Surface preparation and coating system.</p>",
        exclusionsHtml: "<p>Fixture exclusions.</p>",
        notesHtml: "<p>Portal E2E customer-facing note.</p>",
        scopeSummaryHtml:
          "<p>Fixture proposal scope for portal smoke coverage.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      sent_at: now,
      created_by: userId,
      updated_by: userId
    },
    "portal estimate"
  );

  await ensureEstimateLineItem({
    supabase,
    organizationId,
    userId,
    estimateId,
    catalogItemId,
    write,
    results
  });

  addResult(results, "Portal estimate fixture", "created");
  return estimateId;
}

async function ensureEstimateLineItem({
  supabase,
  organizationId,
  userId,
  estimateId,
  catalogItemId,
  write,
  results
}) {
  if (!estimateId || !catalogItemId) {
    addResult(results, "Portal estimate line item fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "estimate_line_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "estimate_id", value: estimateId },
    { column: "catalog_item_id", value: catalogItemId }
  ]);

  if (existing) {
    addResult(results, "Portal estimate line item fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal estimate line item fixture", "missing");
    return null;
  }

  const id = await insertAndReturnId(
    supabase,
    "estimate_line_items",
    {
      company_id: organizationId,
      estimate_id: estimateId,
      catalog_item_id: catalogItemId,
      source_type: "catalog_item",
      source_system_id: null,
      source_component_id: null,
      item_type: "service",
      name: fixture.catalogItemName,
      description: "Fixture customer-facing estimate line.",
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
      group_name: "Portal E2E fixture",
      assigned_to: null,
      sort_order: 1,
      created_by: userId,
      updated_by: userId
    },
    "portal estimate line item"
  );

  addResult(results, "Portal estimate line item fixture", "created");
  return id;
}

async function ensureContract({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  portalUserId,
  portalEmail,
  write,
  results
}) {
  if (!customerId || !projectId) {
    addResult(results, "Portal contract fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "contracts", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.contractTitle }
  ]);

  if (existing) {
    addResult(results, "Portal contract fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal contract fixture", "missing");
    return null;
  }

  const now = new Date().toISOString();
  const contractId = await insertAndReturnId(
    supabase,
    "contracts",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      status: "sent",
      title: fixture.contractTitle,
      rendered_subject: fixture.contractTitle,
      rendered_content:
        "<p>Portal E2E contract review fixture. This is for smoke coverage only.</p>",
      sent_at: now,
      internal_approval_status: "approved",
      internal_approved_at: now,
      signature_readiness_status: "out_for_signature",
      created_by: userId,
      updated_by: userId
    },
    "portal contract"
  );

  await insertAndReturnId(
    supabase,
    "contract_signers",
    {
      company_id: organizationId,
      contract_id: contractId,
      signer_role: "customer",
      signer_status: "pending",
      customer_id: customerId,
      portal_user_id: portalUserId,
      display_name: fixture.contactName,
      email: portalEmail,
      signer_order: 1
    },
    "portal contract signer"
  );

  addResult(results, "Portal contract fixture", "created");
  return contractId;
}

async function ensureInvoice({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  write,
  results
}) {
  if (!customerId || !projectId) {
    addResult(results, "Portal invoice fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "notes", value: fixture.invoiceNotes }
  ]);

  if (existing) {
    addResult(results, "Portal invoice fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal invoice fixture", "missing");
    return null;
  }

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14);

  const invoiceId = await insertAndReturnId(
    supabase,
    "invoices",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      workflow_role: "standard",
      billing_model: "standard",
      status: "sent",
      issue_date: today.toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
      notes: fixture.invoiceNotes,
      discount_amount: "0.00",
      retainage_held_amount: "0.00",
      created_by: userId,
      updated_by: userId
    },
    "portal invoice"
  );

  await insertAndReturnId(
    supabase,
    "invoice_line_items",
    {
      company_id: organizationId,
      invoice_id: invoiceId,
      name: "Portal E2E invoice line",
      description: "Fixture invoice line for portal review smoke coverage.",
      quantity: "1.00",
      unit: "each",
      unit_price: "1500.00",
      sort_order: 1,
      lineage_type: "invoice_only_adjustment",
      invoice_only_adjustment_kind: "explicit_adjustment",
      created_by: userId,
      updated_by: userId
    },
    "portal invoice line item"
  );

  addResult(results, "Portal invoice fixture", "created");
  return invoiceId;
}

async function ensureChangeOrder({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  contractId,
  invoiceId,
  write,
  results
}) {
  if (!customerId || !projectId) {
    addResult(results, "Portal change-order fixture", "missing");
    return null;
  }

  const existing = await findSingleBy(supabase, "change_orders", "id, status", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.changeOrderTitle }
  ]);

  if (existing) {
    if (write && existing.status !== "sent") {
      const now = new Date().toISOString();
      const response = await supabase
        .from("change_orders")
        .update({
          status: "sent",
          sent_at: now,
          customer_viewed_at: null,
          approved_at: null,
          rejected_at: null,
          decision_note: null,
          updated_by: userId
        })
        .eq("company_id", organizationId)
        .eq("id", existing.id);

      if (response.error) {
        throw new Error(
          `Unable to reset portal change-order fixture: ${response.error.message}`
        );
      }

      addResult(results, "Portal change-order fixture", "reset");
      return existing.id;
    }

    addResult(results, "Portal change-order fixture", "present");
    return existing.id;
  }

  if (!write) {
    addResult(results, "Portal change-order fixture", "missing");
    return null;
  }

  const now = new Date().toISOString();
  const changeOrderId = await insertAndReturnId(
    supabase,
    "change_orders",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      contract_id: contractId,
      invoice_id: invoiceId,
      status: "sent",
      title: fixture.changeOrderTitle,
      description:
        "Customer-facing fixture change order for portal review coverage.",
      scope_change_notes:
        "Add a labeled safety topcoat at the final walkthrough area. This fixture keeps the portal review path tied to the same canonical project chain.",
      price_adjustment: "425.00",
      sent_at: now,
      created_by: userId,
      updated_by: userId
    },
    "portal change order"
  );

  addResult(results, "Portal change-order fixture", "created");
  return changeOrderId;
}

async function getRouteOutputs({
  projectId,
  estimateId,
  contractId,
  invoiceId,
  changeOrderId,
  unauthorizedProjectId
}) {
  return {
    FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH: projectId
      ? `/portal/projects/${projectId}`
      : null,
    FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH: estimateId
      ? `/portal/estimates/${estimateId}`
      : null,
    FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH: contractId
      ? `/portal/contracts/${contractId}`
      : null,
    FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH: invoiceId
      ? `/portal/invoices/${invoiceId}`
      : null,
    FLOORCONNECTOR_E2E_PORTAL_CHANGE_ORDER_PATH: changeOrderId
      ? `/portal/change-orders/${changeOrderId}`
      : null,
    FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH: unauthorizedProjectId
      ? `/portal/projects/${unauthorizedProjectId}`
      : null
  };
}

function printResults(results, routes) {
  console.log("Portal E2E fixture check");
  console.log("");

  for (const result of results) {
    const suffix = result.detail ? ` - ${result.detail}` : "";
    console.log(`- ${result.name}: ${result.status}${suffix}`);
  }

  console.log("");
  console.log("Non-secret route outputs:");

  for (const [name, value] of Object.entries(routes)) {
    if (value) {
      console.log(`${name}=${value}`);
    } else {
      console.log(`${name}=<missing fixture prerequisite>`);
    }
  }
}

async function main() {
  loadRootEnv();
  const { write } = readArgs();

  if (write) {
    assertWriteAllowed();
  }

  const requiredEnvNames = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FLOORCONNECTOR_E2E_EMAIL",
    "FLOORCONNECTOR_PORTAL_E2E_EMAIL"
  ];

  if (write) {
    requiredEnvNames.push("FLOORCONNECTOR_PORTAL_E2E_PASSWORD");
  }

  const requiredEnv = getRequiredEnv(
    requiredEnvNames,
    write
      ? "Portal E2E fixture write mode"
      : "Portal E2E fixture validation"
  );
  const supabase = createAdminClient({
    url: requiredEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: requiredEnv.SUPABASE_SERVICE_ROLE_KEY
  });
  const contractorEmail = requiredEnv.FLOORCONNECTOR_E2E_EMAIL;
  const portalEmail = requiredEnv.FLOORCONNECTOR_PORTAL_E2E_EMAIL;
  const portalPassword = process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD;
  const results = [];

  const contractor = await getContractorContext(supabase, contractorEmail);
  addResult(results, "Contractor E2E organization", "present");

  const authUser = await ensureAuthUser({
    supabase,
    email: portalEmail,
    password: portalPassword,
    write,
    results
  });
  const portalUser = authUser
    ? await waitForCanonicalUser(supabase, authUser.id)
    : null;

  if (portalUser) {
    addResult(results, "Canonical portal user profile", "present");
  } else if (
    requireWrite(write, "Canonical portal user profile was not created.")
  ) {
    addResult(results, "Canonical portal user profile", "missing");
  }

  const customerId = await ensureCustomer({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    email: portalEmail,
    write,
    results
  });
  const contactId = await ensureContact({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    email: portalEmail,
    write,
    results
  });
  const customerContactId = await ensureCustomerContact({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    contactId,
    write,
    results
  });
  const projectId = await ensureProject({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectName: fixture.projectName,
    write,
    results,
    label: "Granted portal project"
  });
  const unauthorizedProjectId = await ensureProject({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectName: fixture.unauthorizedProjectName,
    write,
    results,
    label: "Unauthorized boundary project"
  });
  const grantId = await ensurePortalGrant({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    customerContactId,
    portalUserId: portalUser?.id,
    portalEmail,
    write,
    results
  });

  await ensurePortalPermissions({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerContactId,
    grantId,
    write,
    results
  });
  await ensurePortalProjectAccess({
    supabase,
    organizationId: contractor.organizationId,
    grantId,
    projectId,
    write,
    results
  });

  const opportunityId = await ensureOpportunity({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectId,
    portalEmail,
    write,
    results
  });
  const catalogItemId = await ensureCatalogItem({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    write,
    results
  });
  const estimateId = await ensureEstimate({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectId,
    opportunityId,
    catalogItemId,
    write,
    results
  });
  const contractId = await ensureContract({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectId,
    estimateId,
    portalUserId: portalUser?.id,
    portalEmail,
    write,
    results
  });
  const invoiceId = await ensureInvoice({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectId,
    estimateId,
    write,
    results
  });
  const changeOrderId = await ensureChangeOrder({
    supabase,
    organizationId: contractor.organizationId,
    userId: contractor.userId,
    customerId,
    projectId,
    contractId,
    invoiceId,
    write,
    results
  });

  const routes = await getRouteOutputs({
    projectId,
    estimateId,
    contractId,
    invoiceId,
    changeOrderId,
    unauthorizedProjectId
  });

  printResults(results, routes);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
