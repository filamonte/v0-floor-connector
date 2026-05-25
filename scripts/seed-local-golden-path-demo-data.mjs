#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

const defaultFixture = {
  slug: "floorconnector-golden-path-demo",
  customerName: "FloorConnector Demo Customer",
  customerCompanyName: "FloorConnector Demo Customer LLC",
  contactName: "FloorConnector Demo Contact",
  projectName: "Golden Path Demo Project",
  opportunityTitle: "Golden Path Demo Opportunity",
  catalogItemName: "Golden Path Demo Surface System",
  estimateTitle: "Golden Path Demo Estimate",
  estimateReference: "GPD-EST-001",
  contractTitle: "Golden Path Demo Contract",
  invoiceNotes:
    "Golden Path Demo Invoice. Local-only demo data for FloorConnector QA.",
  jobNotes: "Golden Path Demo Job. Local-only schedule fixture.",
  communicationSubject: "Golden Path Demo Customer Review",
  dailyLogSummary:
    "Golden Path demo daily log covering prep, schedule readiness, and field context."
};

const liveProviderEnvNames = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "POSTMARK_API_TOKEN",
  "SIGNWELL_API_KEY",
  "QUICKBOOKS_CLIENT_SECRET",
  "COMPANYCAM_API_TOKEN"
];

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

function printHelp() {
  console.log(
    [
      "Usage:",
      "  pnpm.cmd demo:data:seed:local -- --dry-run --organization-id <uuid> --owner-user-id <uuid> --owner-email owner@example.test --portal-customer-email portal@example.test",
      "  pnpm.cmd demo:data:seed:local -- --confirm-local-write --organization-id <uuid> --owner-user-id <uuid> --owner-email owner@example.test --portal-customer-email portal@example.test",
      "",
      "Default mode is dry-run. Write mode requires:",
      "  --confirm-local-write",
      "  FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1",
      "  a local Supabase URL such as http://127.0.0.1:54321",
      "  SUPABASE_SERVICE_ROLE_KEY",
      "",
      "This script refuses staging/production-looking targets and never calls provider APIs, sends email/SMS, creates auth users, or creates notifications."
    ].join("\n")
  );
}

function readArgs(argv = process.argv.slice(2)) {
  const options = {
    dryRun: true,
    confirmLocalWrite: false,
    organizationId: null,
    ownerUserId: null,
    ownerEmail: null,
    portalCustomerEmail: null,
    demoSlug: defaultFixture.slug,
    supabaseUrl: null,
    serviceRoleKeyEnv: "SUPABASE_SERVICE_ROLE_KEY",
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--":
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--confirm-local-write":
        options.confirmLocalWrite = true;
        options.dryRun = false;
        break;
      case "--organization-id":
        options.organizationId = readNext(argv, index, arg);
        index += 1;
        break;
      case "--owner-user-id":
        options.ownerUserId = readNext(argv, index, arg);
        index += 1;
        break;
      case "--owner-email":
        options.ownerEmail = readNext(argv, index, arg);
        index += 1;
        break;
      case "--portal-customer-email":
        options.portalCustomerEmail = readNext(argv, index, arg);
        index += 1;
        break;
      case "--demo-slug":
        options.demoSlug = readNext(argv, index, arg);
        index += 1;
        break;
      case "--supabase-url":
        options.supabaseUrl = readNext(argv, index, arg);
        index += 1;
        break;
      case "--service-role-key-env":
        options.serviceRoleKeyEnv = readNext(argv, index, arg);
        index += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readNext(argv, index, flag) {
  const value = argv[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
}

function requireOptions(options) {
  const missing = [];

  for (const [key, label] of [
    ["organizationId", "--organization-id"],
    ["ownerUserId", "--owner-user-id"],
    ["ownerEmail", "--owner-email"],
    ["portalCustomerEmail", "--portal-customer-email"]
  ]) {
    if (!options[key]) {
      missing.push(label);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(", ")}.`);
  }
}

function assertLocalWriteAllowed(options) {
  if (options.dryRun) {
    return;
  }

  if (!options.confirmLocalWrite) {
    throw new Error("Write mode requires --confirm-local-write.");
  }

  if (process.env.FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE !== "1") {
    throw new Error(
      "Write mode requires FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1."
    );
  }

  const currentCwd = path.resolve(process.cwd()).toLowerCase();
  if (currentCwd !== workspaceRoot.toLowerCase()) {
    throw new Error(
      `Refusing local demo writes outside the workspace root: ${workspaceRoot}.`
    );
  }

  for (const name of ["NODE_ENV", "APP_ENV", "VERCEL_ENV"]) {
    const value = process.env[name]?.trim().toLowerCase();
    if (value === "production" || value === "staging") {
      throw new Error(
        `Refusing local demo writes while ${name} is marked ${value}.`
      );
    }
  }

  const supabaseUrl = getSupabaseUrl(options);
  assertLocalSupabaseUrl(supabaseUrl);

  if (!isSafeDemoEmail(options.portalCustomerEmail)) {
    throw new Error(
      "--portal-customer-email must use a safe non-deliverable demo domain such as example.test."
    );
  }

  const liveProviderKeys = findLiveProviderEnvNames();
  if (liveProviderKeys.length > 0) {
    throw new Error(
      `Refusing local demo writes while live-looking provider env vars are present: ${liveProviderKeys.join(", ")}.`
    );
  }
}

function getSupabaseUrl(options) {
  return (
    options.supabaseUrl?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ""
  );
}

function assertLocalSupabaseUrl(url) {
  if (!url) {
    throw new Error(
      "Local write mode requires --supabase-url or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid Supabase URL: ${url}`);
  }

  const host = parsed.hostname.toLowerCase();
  const fullUrl = url.toLowerCase();
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const looksLocal =
    localHosts.has(host) ||
    host.endsWith(".localhost") ||
    host.startsWith("127.");

  if (!looksLocal) {
    throw new Error(
      `Refusing to write because Supabase URL is not local: ${redactUrl(url)}.`
    );
  }

  if (
    /(supabase\.co|production|prod|staging|stage|preview|vercel)/i.test(fullUrl)
  ) {
    throw new Error(
      `Refusing staging/production-looking Supabase URL: ${redactUrl(url)}.`
    );
  }
}

function isSafeDemoEmail(email) {
  const normalized = email.trim().toLowerCase();
  return /@(example\.(com|net|org|test)|example|test|invalid|localhost)$/.test(
    normalized
  );
}

function findLiveProviderEnvNames() {
  return liveProviderEnvNames.filter((name) => {
    const value = process.env[name]?.trim();
    return value && /(live|prod|production|sk_live_)/i.test(value);
  });
}

function redactUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.username = "";
    parsed.password = "";
    return parsed.toString();
  } catch {
    return "<invalid-url>";
  }
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

function addResult(results, name, status, detail = null) {
  results.push({ name, status, detail });
}

function todayOffset(days) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoOffset(days, hour = 14) {
  const date = new Date();
  date.setUTCHours(hour, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

async function findSingleBy(supabase, table, select, filters) {
  let query = supabase.from(table).select(select).limit(1);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Unable to query ${table}: ${error.message}`);
  }

  return data ?? null;
}

async function insertAndReturnId(supabase, table, payload, label) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create ${label}: ${error.message}`);
  }

  return data.id;
}

async function updateById(supabase, table, companyId, id, payload, label) {
  const { error } = await supabase
    .from(table)
    .update(payload)
    .eq("company_id", companyId)
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to update ${label}: ${error.message}`);
  }
}

async function ensureOwnerContext({
  supabase,
  organizationId,
  ownerUserId,
  ownerEmail
}) {
  const owner = await findSingleBy(supabase, "users", "id, email", [
    { column: "id", value: ownerUserId },
    { column: "email", value: ownerEmail }
  ]);

  if (!owner) {
    throw new Error(
      "Owner user was not found in canonical users. Create or select a local owner/member first."
    );
  }

  const membership = await findSingleBy(
    supabase,
    "company_memberships",
    "id, membership_role, membership_status",
    [
      { column: "company_id", value: organizationId },
      { column: "user_id", value: ownerUserId }
    ]
  );

  if (!membership || membership.membership_status !== "active") {
    throw new Error(
      "Owner user is not an active member of the target organization."
    );
  }

  if (!["owner", "admin"].includes(membership.membership_role)) {
    throw new Error(
      `Owner user must have owner/admin membership; found ${membership.membership_role}.`
    );
  }
}

async function ensureCustomer({
  supabase,
  organizationId,
  userId,
  fixture,
  portalEmail,
  results
}) {
  const existing = await findSingleBy(
    supabase,
    "customers",
    "id, name, email",
    [
      { column: "company_id", value: organizationId },
      { column: "name", value: fixture.customerName }
    ]
  );

  const payload = {
    company_name: fixture.customerCompanyName,
    email: portalEmail,
    notes: `${fixture.slug}: local-only golden path demo customer.`,
    updated_by: userId
  };

  if (existing) {
    await updateById(
      supabase,
      "customers",
      organizationId,
      existing.id,
      payload,
      "golden path customer"
    );
    addResult(results, "Customer", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "customers",
    {
      company_id: organizationId,
      name: fixture.customerName,
      address_line_1: "100 Demo Surface Way",
      city: "Demo City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      created_by: userId,
      ...payload
    },
    "golden path customer"
  );

  addResult(results, "Customer", "created", id);
  return id;
}

async function ensureContact({
  supabase,
  organizationId,
  userId,
  customerId,
  fixture,
  portalEmail,
  results
}) {
  const contact = await findSingleBy(
    supabase,
    "customer_contacts",
    "id, display_name",
    [
      { column: "company_id", value: organizationId },
      { column: "email", value: portalEmail }
    ]
  );

  if (contact) {
    addResult(results, "Customer contact", "present", contact.id);
    return contact.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "customer_contacts",
    {
      company_id: organizationId,
      customer_id: customerId,
      display_name: fixture.contactName,
      company_name: fixture.customerCompanyName,
      email: portalEmail,
      contact_kind: "portal_contact",
      notes: `${fixture.slug}: local-only demo customer contact.`,
      created_by: userId,
      updated_by: userId
    },
    "golden path customer contact"
  );

  addResult(results, "Customer contact", "created", id);
  return id;
}

async function ensureProject({
  supabase,
  organizationId,
  userId,
  customerId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "name", value: fixture.projectName }
  ]);

  const payload = {
    status: "approved",
    description:
      "Local-only golden path project for FloorConnector demos and QA.",
    commercial_readiness_status: "ready_to_schedule",
    financing_status: "not_applicable",
    updated_by: userId
  };

  if (existing) {
    await updateById(
      supabase,
      "projects",
      organizationId,
      existing.id,
      payload,
      "golden path project"
    );
    addResult(results, "Project", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "projects",
    {
      company_id: organizationId,
      customer_id: customerId,
      name: fixture.projectName,
      address_line_1: "100 Demo Surface Way",
      city: "Demo City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      created_by: userId,
      ...payload
    },
    "golden path project"
  );

  addResult(results, "Project", "created", id);
  return id;
}

async function ensureOpportunity({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  fixture,
  portalEmail,
  results
}) {
  const existing = await findSingleBy(supabase, "opportunities", "id", [
    { column: "company_id", value: organizationId },
    { column: "customer_id", value: customerId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.opportunityTitle }
  ]);

  if (existing) {
    addResult(results, "Opportunity", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "opportunities",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      title: fixture.opportunityTitle,
      status: "converted",
      source: "local_demo_seed",
      contact_name: fixture.contactName,
      contact_email: portalEmail,
      service_type: "golden_path_demo",
      project_address_line_1: "100 Demo Surface Way",
      project_city: "Demo City",
      project_state_region: "FL",
      project_postal_code: "00000",
      project_country_code: "US",
      notes: `${fixture.slug}: local-only demo opportunity converted into the golden path project.`,
      qualified_at: isoOffset(-18, 13),
      converted_at: isoOffset(-16, 13),
      created_by: userId,
      updated_by: userId
    },
    "golden path opportunity"
  );

  addResult(results, "Opportunity", "created", id);
  return id;
}

async function ensureCatalogItem({
  supabase,
  organizationId,
  userId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "catalog_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: fixture.catalogItemName }
  ]);

  if (existing) {
    addResult(results, "Catalog item", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "catalog_items",
    {
      company_id: organizationId,
      name: fixture.catalogItemName,
      description: "Local-only demo epoxy floor system.",
      item_type: "service",
      unit: "each",
      base_unit_cost: "900.00",
      base_unit_price: "1500.00",
      markup_percent: "0.00",
      hidden_markup_percent: "0.00",
      taxable: false,
      active: true,
      cost_code: "DEMO-GP",
      created_by: userId,
      updated_by: userId
    },
    "golden path catalog item"
  );

  addResult(results, "Catalog item", "created", id);
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
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "reference_number", value: fixture.estimateReference }
  ]);

  if (existing) {
    addResult(results, "Estimate", "present", existing.id);
    await ensureEstimateLineItem({
      supabase,
      organizationId,
      userId,
      estimateId: existing.id,
      catalogItemId,
      fixture,
      results
    });
    return existing.id;
  }

  const estimateId = await insertAndReturnId(
    supabase,
    "estimates",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      opportunity_id: opportunityId,
      reference_number: fixture.estimateReference,
      title: fixture.estimateTitle,
      status: "sent",
      discount_amount: "0.00",
      notes: `${fixture.slug}: local-only golden path estimate.`,
      content: {
        termsHtml: "<p>Demo terms for local QA only.</p>",
        inclusionsHtml:
          "<p>Surface preparation, primer, and coating system.</p>",
        exclusionsHtml: "<p>No production customer delivery is implied.</p>",
        notesHtml: "<p>Customer-facing demo estimate note.</p>",
        scopeSummaryHtml:
          "<p>Golden path demo scope for estimate readiness.</p>",
        scopeItems: [],
        itemGroups: [],
        itemRows: []
      },
      sent_at: isoOffset(-14, 14),
      created_by: userId,
      updated_by: userId
    },
    "golden path estimate"
  );

  await ensureEstimateLineItem({
    supabase,
    organizationId,
    userId,
    estimateId,
    catalogItemId,
    fixture,
    results
  });

  addResult(results, "Estimate", "created", estimateId);
  return estimateId;
}

async function ensureEstimateLineItem({
  supabase,
  organizationId,
  userId,
  estimateId,
  catalogItemId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "estimate_line_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "estimate_id", value: estimateId },
    { column: "catalog_item_id", value: catalogItemId }
  ]);

  if (existing) {
    addResult(results, "Estimate line item", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "estimate_line_items",
    {
      company_id: organizationId,
      estimate_id: estimateId,
      catalog_item_id: catalogItemId,
      source_type: "catalog_item",
      item_type: "service",
      name: fixture.catalogItemName,
      description: "Golden path demo estimate line.",
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
      cost_code: "DEMO-GP",
      group_name: "Golden path demo",
      sort_order: 1,
      created_by: userId,
      updated_by: userId
    },
    "golden path estimate line item"
  );

  addResult(results, "Estimate line item", "created", id);
  return id;
}

async function ensureContract({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  fixture,
  portalEmail,
  portalUserId,
  results
}) {
  const existing = await findSingleBy(supabase, "contracts", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: fixture.contractTitle }
  ]);

  if (existing) {
    addResult(results, "Contract", "present", existing.id);
    await ensureContractSigner({
      supabase,
      organizationId,
      contractId: existing.id,
      customerId,
      portalEmail,
      portalUserId,
      fixture,
      results
    });
    return existing.id;
  }

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
        "<p>Golden path demo contract review. Local QA only; no external signing provider is called.</p>",
      sent_at: isoOffset(-12, 15),
      internal_approval_status: "approved",
      internal_approved_at: isoOffset(-12, 14),
      signature_readiness_status: "out_for_signature",
      created_by: userId,
      updated_by: userId
    },
    "golden path contract"
  );

  await ensureContractSigner({
    supabase,
    organizationId,
    contractId,
    customerId,
    portalEmail,
    portalUserId,
    fixture,
    results
  });

  addResult(results, "Contract", "created", contractId);
  return contractId;
}

async function ensureContractSigner({
  supabase,
  organizationId,
  contractId,
  customerId,
  portalEmail,
  portalUserId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "contract_signers", "id", [
    { column: "company_id", value: organizationId },
    { column: "contract_id", value: contractId },
    { column: "signer_order", value: 1 }
  ]);

  if (existing) {
    addResult(results, "Contract signer", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "contract_signers",
    {
      company_id: organizationId,
      contract_id: contractId,
      signer_role: "customer",
      signer_status: "pending",
      customer_id: customerId,
      portal_user_id: portalUserId ?? null,
      display_name: fixture.contactName,
      email: portalEmail,
      signer_order: 1
    },
    "golden path contract signer"
  );

  addResult(results, "Contract signer", "created", id);
  return id;
}

async function ensureJob({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "jobs", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "estimate_id", value: estimateId },
    { column: "notes", value: fixture.jobNotes }
  ]);

  const payload = {
    dispatch_status: "scheduled",
    scheduled_date: todayOffset(3),
    scheduled_start_at: isoOffset(3, 13),
    scheduled_end_at: isoOffset(3, 20),
    schedule_notes:
      "Golden path demo job: scheduled locally without provider dispatch.",
    updated_by: userId
  };

  if (existing) {
    await updateById(
      supabase,
      "jobs",
      organizationId,
      existing.id,
      payload,
      "golden path job"
    );
    addResult(results, "Job", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "jobs",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      notes: fixture.jobNotes,
      created_by: userId,
      ...payload
    },
    "golden path job"
  );

  addResult(results, "Job", "created", id);
  return id;
}

async function ensureDailyLog({
  supabase,
  organizationId,
  userId,
  projectId,
  jobId,
  fixture,
  results
}) {
  const logDate = todayOffset(0);
  const existing = await findSingleBy(supabase, "daily_logs", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "log_date", value: logDate }
  ]);

  const payload = {
    job_id: jobId,
    status: "draft",
    summary: fixture.dailyLogSummary,
    work_completed:
      "Demo crew completed floor preparation and confirmed moisture readings.",
    work_planned_next:
      "Demo crew plans primer application after customer-facing document review.",
    delays_or_blockers:
      "Open demo blocker: final customer color approval needs review.",
    safety_notes: "No demo safety incidents recorded.",
    updated_by: userId
  };

  if (existing) {
    await updateById(
      supabase,
      "daily_logs",
      organizationId,
      existing.id,
      payload,
      "golden path daily log"
    );
    addResult(results, "Daily log", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "daily_logs",
    {
      company_id: organizationId,
      project_id: projectId,
      log_date: logDate,
      created_by: userId,
      ...payload
    },
    "golden path daily log"
  );

  addResult(results, "Daily log", "created", id);
  return id;
}

async function ensureFieldNotes({
  supabase,
  organizationId,
  userId,
  projectId,
  jobId,
  dailyLogId,
  fixture,
  results
}) {
  await ensureFieldNote({
    supabase,
    organizationId,
    userId,
    projectId,
    jobId,
    dailyLogId,
    title: "Golden Path Demo Blocker",
    body: "Internal demo blocker: customer color confirmation is needed before final coat.",
    noteType: "blocker",
    status: "open",
    results
  });

  await ensureFieldNote({
    supabase,
    organizationId,
    userId,
    projectId,
    jobId,
    dailyLogId,
    title: "Golden Path Demo Resolved Note",
    body: "Internal demo note: substrate inspection was completed.",
    noteType: "issue",
    status: "resolved",
    results
  });
}

async function ensureFieldNote({
  supabase,
  organizationId,
  userId,
  projectId,
  jobId,
  dailyLogId,
  title,
  body,
  noteType,
  status,
  results
}) {
  const existing = await findSingleBy(supabase, "field_notes", "id", [
    { column: "company_id", value: organizationId },
    { column: "daily_log_id", value: dailyLogId },
    { column: "title", value: title }
  ]);

  if (existing) {
    addResult(results, title, "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "field_notes",
    {
      company_id: organizationId,
      project_id: projectId,
      job_id: jobId,
      daily_log_id: dailyLogId,
      note_type: noteType,
      title,
      body,
      status,
      visibility: "internal",
      created_by: userId,
      updated_by: userId
    },
    title.toLowerCase()
  );

  addResult(results, title, "created", id);
  return id;
}

async function ensureInvoice({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  estimateId,
  jobId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "invoices", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: projectId },
    { column: "notes", value: fixture.invoiceNotes }
  ]);

  if (existing) {
    addResult(results, "Invoice", "present", existing.id);
    await ensureInvoiceLineItem({
      supabase,
      organizationId,
      userId,
      invoiceId: existing.id,
      fixture,
      results
    });
    return existing.id;
  }

  const invoiceId = await insertAndReturnId(
    supabase,
    "invoices",
    {
      company_id: organizationId,
      customer_id: customerId,
      project_id: projectId,
      estimate_id: estimateId,
      job_id: jobId,
      workflow_role: "standard",
      billing_model: "standard",
      status: "sent",
      issue_date: todayOffset(-30),
      due_date: todayOffset(-15),
      notes: fixture.invoiceNotes,
      discount_amount: "0.00",
      retainage_held_amount: "0.00",
      created_by: userId,
      updated_by: userId
    },
    "golden path invoice"
  );

  await ensureInvoiceLineItem({
    supabase,
    organizationId,
    userId,
    invoiceId,
    fixture,
    results
  });

  addResult(results, "Invoice", "created", invoiceId);
  return invoiceId;
}

async function ensureInvoiceLineItem({
  supabase,
  organizationId,
  userId,
  invoiceId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "invoice_line_items", "id", [
    { column: "company_id", value: organizationId },
    { column: "invoice_id", value: invoiceId },
    { column: "name", value: fixture.catalogItemName }
  ]);

  if (existing) {
    addResult(results, "Invoice line item", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "invoice_line_items",
    {
      company_id: organizationId,
      invoice_id: invoiceId,
      name: fixture.catalogItemName,
      description: "Golden path demo invoice line.",
      quantity: "1.00",
      unit: "each",
      unit_price: "1500.00",
      taxable: false,
      tax_rate_snapshot: "0.000000",
      discount_amount: "0.00",
      line_subtotal: "1500.00",
      tax_amount: "0.00",
      line_total: "1500.00",
      sort_order: 1,
      lineage_type: "invoice_only_adjustment",
      invoice_only_adjustment_kind: "explicit_adjustment",
      created_by: userId,
      updated_by: userId
    },
    "golden path invoice line item"
  );

  addResult(results, "Invoice line item", "created", id);
  return id;
}

async function ensurePaymentEvent({
  supabase,
  organizationId,
  userId,
  invoiceId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "payment_events", "id", [
    { column: "company_id", value: organizationId },
    { column: "invoice_id", value: invoiceId },
    { column: "event_type", value: "payment_requested" }
  ]);

  if (existing) {
    addResult(results, "Payment request event", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "payment_events",
    {
      company_id: organizationId,
      invoice_id: invoiceId,
      payment_id: null,
      event_type: "payment_requested",
      actor_type: "organization_user",
      actor_user_id: userId,
      occurred_at: isoOffset(-10, 15),
      payload: {
        demo_slug: fixture.slug,
        amount: "1500.00",
        currency: "USD",
        note: "Local-only demo payment request event. No payment provider was called."
      }
    },
    "golden path payment event"
  );

  addResult(results, "Payment request event", "created", id);
  return id;
}

async function ensureCommunicationThread({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  invoiceId,
  fixture,
  results
}) {
  const existing = await findSingleBy(supabase, "communication_threads", "id", [
    { column: "company_id", value: organizationId },
    { column: "subject_type", value: "invoice" },
    { column: "subject_id", value: invoiceId }
  ]);

  const payload = {
    customer_id: customerId,
    project_id: projectId,
    subject: fixture.communicationSubject,
    last_message_preview:
      "Draft customer review note prepared locally. Nothing was sent.",
    last_message_at: isoOffset(-2, 16),
    thread_category: "operational",
    channel_kind: "internal_note",
    thread_status: "open",
    updated_by: userId
  };

  if (existing) {
    await updateById(
      supabase,
      "communication_threads",
      organizationId,
      existing.id,
      payload,
      "golden path communication thread"
    );
    addResult(results, "Communication thread", "present", existing.id);
    await ensureCommunicationMessage({
      supabase,
      organizationId,
      userId,
      customerId,
      projectId,
      invoiceId,
      threadId: existing.id,
      results
    });
    return existing.id;
  }

  const threadId = await insertAndReturnId(
    supabase,
    "communication_threads",
    {
      company_id: organizationId,
      subject_type: "invoice",
      subject_id: invoiceId,
      created_by: userId,
      ...payload
    },
    "golden path communication thread"
  );

  await ensureCommunicationMessage({
    supabase,
    organizationId,
    userId,
    customerId,
    projectId,
    invoiceId,
    threadId,
    results
  });

  addResult(results, "Communication thread", "created", threadId);
  return threadId;
}

async function ensureCommunicationMessage({
  supabase,
  organizationId,
  userId,
  customerId,
  projectId,
  invoiceId,
  threadId,
  results
}) {
  const body =
    "Golden path demo draft: please review the attached invoice context before any customer-bound send. Local QA only; nothing has been sent.";

  const existing = await findSingleBy(
    supabase,
    "communication_messages",
    "id",
    [
      { column: "company_id", value: organizationId },
      { column: "thread_id", value: threadId },
      { column: "body", value: body }
    ]
  );

  if (existing) {
    addResult(results, "Communication message", "present", existing.id);
    return existing.id;
  }

  const id = await insertAndReturnId(
    supabase,
    "communication_messages",
    {
      company_id: organizationId,
      thread_id: threadId,
      customer_id: customerId,
      project_id: projectId,
      subject_type: "invoice",
      subject_id: invoiceId,
      sender_type: "organization_user",
      sender_user_id: userId,
      body,
      message_kind: "internal_note",
      visibility: "internal",
      delivery_status: "draft",
      direction: "internal",
      source_kind: "human",
      channel_kind: "internal_note",
      occurred_at: isoOffset(-2, 16),
      created_by: userId
    },
    "golden path communication message"
  );

  addResult(results, "Communication message", "created", id);
  return id;
}

async function findPortalUser({ supabase, portalEmail, results }) {
  const user = await findSingleBy(supabase, "users", "id, email", [
    { column: "email", value: portalEmail }
  ]);

  if (!user) {
    addResult(
      results,
      "Existing portal user",
      "skipped",
      "No canonical user exists for portal email; no auth user or invite was created."
    );
    return null;
  }

  addResult(results, "Existing portal user", "present", user.id);
  return user.id;
}

async function ensurePortalAccess({
  supabase,
  organizationId,
  userId,
  customerId,
  customerContactId,
  projectId,
  portalUserId,
  portalEmail,
  results
}) {
  if (!portalUserId) {
    addResult(
      results,
      "Portal access",
      "skipped",
      "Portal access requires an existing local portal user. This script does not create auth users or send invites."
    );
    return null;
  }

  const grant = await findSingleBy(
    supabase,
    "portal_access_grants",
    "id, status",
    [
      { column: "company_id", value: organizationId },
      { column: "customer_id", value: customerId },
      { column: "user_id", value: portalUserId }
    ]
  );

  let grantId = grant?.id ?? null;
  const now = new Date().toISOString();

  if (grantId) {
    await updateById(
      supabase,
      "portal_access_grants",
      organizationId,
      grantId,
      {
        status: "active",
        customer_contact_id: customerContactId,
        invited_email: portalEmail,
        invited_by: userId,
        activated_at: now,
        invite_accepted_at: now,
        revoked_at: null
      },
      "golden path portal grant"
    );
    addResult(results, "Portal access grant", "present", grantId);
  } else {
    grantId = await insertAndReturnId(
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
      "golden path portal grant"
    );
    addResult(results, "Portal access grant", "created", grantId);
  }

  const projectAccess = await findSingleBy(
    supabase,
    "portal_project_access",
    "id, status",
    [
      { column: "company_id", value: organizationId },
      { column: "portal_access_grant_id", value: grantId },
      { column: "project_id", value: projectId }
    ]
  );

  if (projectAccess) {
    await updateById(
      supabase,
      "portal_project_access",
      organizationId,
      projectAccess.id,
      { status: "active", revoked_at: null },
      "golden path portal project access"
    );
    addResult(results, "Portal project access", "present", projectAccess.id);
    return projectAccess.id;
  }

  const projectAccessId = await insertAndReturnId(
    supabase,
    "portal_project_access",
    {
      company_id: organizationId,
      portal_access_grant_id: grantId,
      project_id: projectId,
      status: "active"
    },
    "golden path portal project access"
  );

  addResult(results, "Portal project access", "created", projectAccessId);
  return projectAccessId;
}

function buildDryRunPlan(options) {
  return [
    ["mode", "dry-run only; no Supabase connection and no writes"],
    ["target", options.supabaseUrl ? redactUrl(options.supabaseUrl) : "<env>"],
    ["organization", options.organizationId],
    ["owner user", options.ownerUserId],
    ["owner email", options.ownerEmail],
    ["portal/customer email", options.portalCustomerEmail],
    ["demo slug", options.demoSlug],
    ["customer", defaultFixture.customerName],
    ["project", defaultFixture.projectName],
    ["opportunity", defaultFixture.opportunityTitle],
    [
      "estimate",
      `${defaultFixture.estimateTitle} (${defaultFixture.estimateReference})`
    ],
    ["contract", defaultFixture.contractTitle],
    ["invoice", defaultFixture.invoiceNotes],
    ["job", defaultFixture.jobNotes],
    ["daily log", defaultFixture.dailyLogSummary],
    ["field notes", "open blocker and resolved internal note"],
    ["communications", "internal draft customer review thread/message"],
    [
      "portal access",
      "created only if the portal customer email already belongs to a local canonical user"
    ],
    ["external calls", "none"]
  ];
}

function printPlan(plan) {
  console.log("Golden path local seed plan");
  console.log("---------------------------");
  for (const [label, value] of plan) {
    console.log(`- ${label}: ${value}`);
  }
}

function printResults(results) {
  console.log("");
  console.log("Seed results");
  console.log("------------");
  for (const result of results) {
    const detail = result.detail ? ` (${result.detail})` : "";
    console.log(`- ${result.name}: ${result.status}${detail}`);
  }
}

function printRoutes(ids) {
  console.log("");
  console.log("Local QA routes");
  console.log("---------------");
  for (const [label, href] of [
    ["project workspace", ids.projectId && `/projects/${ids.projectId}`],
    ["estimate", ids.estimateId && `/estimates/${ids.estimateId}`],
    ["contract", ids.contractId && `/contracts/${ids.contractId}`],
    ["invoice", ids.invoiceId && `/invoices/${ids.invoiceId}`],
    ["job", ids.jobId && `/jobs/${ids.jobId}`],
    ["daily log", ids.dailyLogId && `/daily-logs/${ids.dailyLogId}`],
    ["communications", ids.threadId && `/communications`],
    [
      "portal project",
      ids.portalAccessId && `/portal/projects/${ids.projectId}`
    ]
  ]) {
    if (href) {
      console.log(`- ${label}: ${href}`);
    }
  }
}

async function runWrite(options) {
  loadRootEnv();
  assertLocalWriteAllowed(options);

  const supabaseUrl = getSupabaseUrl(options);
  const serviceRoleKey = requireEnv(options.serviceRoleKeyEnv);
  const supabase = createAdminClient({
    url: supabaseUrl,
    serviceRoleKey
  });
  const fixture = { ...defaultFixture, slug: options.demoSlug };
  const results = [];

  console.log("Golden path local seed target");
  console.log("-----------------------------");
  console.log(`- Supabase URL: ${redactUrl(supabaseUrl)}`);
  console.log(`- Organization: ${options.organizationId}`);
  console.log(`- Owner user: ${options.ownerUserId}`);
  console.log(`- Demo slug: ${fixture.slug}`);
  console.log("- Mode: local write, owner-confirmed");

  await ensureOwnerContext({
    supabase,
    organizationId: options.organizationId,
    ownerUserId: options.ownerUserId,
    ownerEmail: options.ownerEmail
  });

  const portalUserId = await findPortalUser({
    supabase,
    portalEmail: options.portalCustomerEmail,
    results
  });

  const customerId = await ensureCustomer({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    fixture,
    portalEmail: options.portalCustomerEmail,
    results
  });

  const customerContactId = await ensureContact({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    fixture,
    portalEmail: options.portalCustomerEmail,
    results
  });

  const projectId = await ensureProject({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    fixture,
    results
  });

  const opportunityId = await ensureOpportunity({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    fixture,
    portalEmail: options.portalCustomerEmail,
    results
  });

  const catalogItemId = await ensureCatalogItem({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    fixture,
    results
  });

  const estimateId = await ensureEstimate({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    opportunityId,
    catalogItemId,
    fixture,
    results
  });

  const contractId = await ensureContract({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    estimateId,
    fixture,
    portalEmail: options.portalCustomerEmail,
    portalUserId,
    results
  });

  const jobId = await ensureJob({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    estimateId,
    fixture,
    results
  });

  const dailyLogId = await ensureDailyLog({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    projectId,
    jobId,
    fixture,
    results
  });

  await ensureFieldNotes({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    projectId,
    jobId,
    dailyLogId,
    fixture,
    results
  });

  const invoiceId = await ensureInvoice({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    estimateId,
    jobId,
    fixture,
    results
  });

  await ensurePaymentEvent({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    invoiceId,
    fixture,
    results
  });

  const threadId = await ensureCommunicationThread({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    projectId,
    invoiceId,
    fixture,
    results
  });

  const portalAccessId = await ensurePortalAccess({
    supabase,
    organizationId: options.organizationId,
    userId: options.ownerUserId,
    customerId,
    customerContactId,
    projectId,
    portalUserId,
    portalEmail: options.portalCustomerEmail,
    results
  });

  addResult(
    results,
    "Execution attachment placeholder",
    "skipped",
    "No storage object is created by local seed mode."
  );

  printResults(results);
  printRoutes({
    projectId,
    estimateId,
    contractId,
    invoiceId,
    jobId,
    dailyLogId,
    threadId,
    portalAccessId
  });

  console.log("");
  console.log(
    "Completed local-only golden path seed. No provider calls were made."
  );
}

async function main() {
  try {
    const options = readArgs();

    if (options.help) {
      printHelp();
      return;
    }

    requireOptions(options);

    if (options.dryRun) {
      if (!isSafeDemoEmail(options.portalCustomerEmail)) {
        console.warn(
          "Warning: --portal-customer-email should use a safe non-deliverable demo domain before write mode."
        );
      }
      printPlan(buildDryRunPlan(options));
      return;
    }

    await runWrite(options);
  } catch (error) {
    console.error(`Local golden path seed failed: ${error.message}`);
    process.exitCode = 1;
  }
}

await main();
