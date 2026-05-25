#!/usr/bin/env node

import process from "node:process";

import { createClient } from "@supabase/supabase-js";

const DRY_RUN_BANNER =
  "DRY RUN ONLY - no database writes, provider calls, emails, payments, signatures, or portal invite tokens will be created.";

const VALIDATE_TARGET_BANNER =
  "READ-ONLY TARGET VALIDATION - no database writes, provider calls, emails, payments, signatures, or portal invite tokens will be created.";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedFlags = new Set([
  "--dry-run",
  "--validate-target",
  "--organization-id",
  "--owner-user-id",
  "--owner-email",
  "--portal-customer-email",
  "--platform-admin-email",
  "--environment",
  "--supabase-url",
  "--service-role-key-env",
  "--confirm",
  "--help",
  "-h"
]);

const valueFlags = new Set([
  "--organization-id",
  "--owner-user-id",
  "--owner-email",
  "--portal-customer-email",
  "--platform-admin-email",
  "--environment",
  "--supabase-url",
  "--service-role-key-env",
  "--confirm"
]);

const unsafeFlagPatterns = [
  /--execute\b/i,
  /--write\b/i,
  /--seed\b/i,
  /--apply-migrations?\b/i,
  /--supabase-write\b/i,
  /--stripe\b/i,
  /--postmark\b/i,
  /--signwell\b/i,
  /--provider\b/i,
  /--call-provider\b/i,
  /--send-email\b/i,
  /--create-payment\b/i,
  /--payment-provider\b/i,
  /--signature-provider\b/i,
  /--invite-token\b/i,
  /--create-invite-token\b/i,
  /--webhook\b/i
];

const approvedServiceRoleEnvNames = new Set([
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY_DEV",
  "SUPABASE_SERVICE_ROLE_KEY_STAGING"
]);

const requiredTargetTables = [
  "companies",
  "users",
  "company_memberships",
  "customers",
  "contacts",
  "customer_contacts",
  "projects",
  "opportunities",
  "estimates",
  "estimate_line_items",
  "contracts",
  "contract_signers",
  "change_orders",
  "jobs",
  "job_assignments",
  "daily_logs",
  "field_notes",
  "invoices",
  "invoice_line_items",
  "payments",
  "payment_events",
  "communication_threads",
  "communication_messages",
  "document_delivery_events",
  "service_tickets",
  "warranty_documents",
  "portal_access_grants",
  "portal_project_access"
];

const datasetGroups = [
  {
    heading: "organization/company baseline",
    purpose:
      "Confirm the owner-controlled contractor organization, owner membership, and optional platform-admin demo posture.",
    records:
      "0 planned writes; future execution would verify companies, users, company_memberships, and optional platform_user_roles.",
    safety:
      "Organization setup, billing, activation, settings, and platform-admin behavior remain owner-controlled.",
    providerExcluded:
      "Yes. No provider action belongs to the company baseline.",
    routes: "/dashboard, /settings, /super-admin when platform demo is approved"
  },
  {
    heading: "people/vendors/crew",
    purpose:
      "Plan crew, manager, and subcontractor records that make CrewBoard and job assignments readable.",
    records:
      "Estimator/project manager, crew lead, crew member, vendor/subcontractor, and optional compliance/time references.",
    safety:
      "No auth users are created for crew; membership-linked people remain a future explicit-owner decision.",
    providerExcluded: "Yes. No provider calls or external worker systems.",
    routes: "/schedule, /jobs/[jobId], /settings"
  },
  {
    heading: "customer/contact",
    purpose:
      "Plan one canonical customer story with a primary contact for the demo project.",
    records:
      "One customer, one contact, and one customer-contact relationship using deterministic demo names.",
    safety:
      "Customer records stay tenant-scoped and do not become portal identity by themselves.",
    providerExcluded: "Yes. No email send or invite is created.",
    routes: "/projects, /projects/[projectId], global search"
  },
  {
    heading: "portal access/customer linkage assumptions",
    purpose:
      "Document the owner-approved portal customer email and future customer/user linkage assumptions.",
    records:
      "No planned writes; future mode may verify existing portal auth user and customer linkage.",
    safety:
      "Portal auth setup is owner-controlled; no raw invite token is generated or printed.",
    providerExcluded: "Yes. No invite delivery or email provider action.",
    routes: "/portal, /portal/projects/[projectId]"
  },
  {
    heading: "projects",
    purpose:
      "Plan the single canonical project hub that ties commercial, field, portal, closeout, and financial records together.",
    records:
      "One active operating-core project, with an optional closeout-ready project only if needed later.",
    safety:
      "No schedule-only, service-only, proof-only, or portal-only project copies.",
    providerExcluded: "Yes. Project planning does not call providers.",
    routes: "/projects, /projects/[projectId], global search"
  },
  {
    heading: "opportunity/requirements",
    purpose:
      "Plan the upstream commercial opportunity and supported requirement notes for the same project story.",
    records: "One opportunity tied to the customer/project chain.",
    safety:
      "Opportunity remains the canonical pre-project commercial record; no duplicate lead model.",
    providerExcluded: "Yes. No external lead/provider action.",
    routes: "/opportunities, /projects/[projectId], global search"
  },
  {
    heading: "estimates",
    purpose: "Plan customer-facing and downstream-readiness estimate examples.",
    records:
      "One approved estimate, one sent estimate, and estimate line items in the current estimate snapshot model.",
    safety:
      "No estimate math shortcuts, catalog mutation, or invoice creation from live estimate rows.",
    providerExcluded:
      "Yes. No send provider or delivery event is created by dry run.",
    routes: "/estimates/[estimateId], /portal/estimates/[estimateId]"
  },
  {
    heading: "contracts",
    purpose:
      "Plan contract states for customer review and signature-readiness storytelling.",
    records:
      "One sent contract and one signed-contract scenario only if future safe internal/manual state is approved.",
    safety: "Unsafe signature mutation is omitted rather than faked.",
    providerExcluded: "Yes. No signature provider calls.",
    routes: "/contracts/[contractId], /portal/contracts/[contractId]"
  },
  {
    heading: "change orders",
    purpose:
      "Plan change-order examples connected to the same project/contract/invoice chain.",
    records:
      "One sent change order and one approved change order where current workflow supports it.",
    safety: "No detached change-order model or project copy.",
    providerExcluded: "Yes. No external delivery or approval provider.",
    routes:
      "/change-orders/[changeOrderId], /portal/change-orders/[changeOrderId]"
  },
  {
    heading: "jobs/schedule/job assignments",
    purpose:
      "Plan CrewBoard coverage for unscheduled, active, upcoming, assignment, and completed work.",
    records:
      "Unscheduled job, scheduled-today job, upcoming job, in-progress job, missing-crew job, completed job, and job assignments.",
    safety:
      "No drag/drop dispatch, external calendar, or schedule-only record model.",
    providerExcluded: "Yes. No calendar/provider action.",
    routes: "/schedule, /jobs/[jobId], /projects/[projectId]"
  },
  {
    heading: "daily logs/field notes/execution attachment placeholders",
    purpose:
      "Plan FieldTrail and Daily Job Log proof without creating fake uploads.",
    records:
      "One daily log, open blocker field note, resolved field note, and safe attachment placeholders only if supported.",
    safety:
      "No fake file uploads, broken storage references, or customer-facing internal field evidence.",
    providerExcluded: "Yes. No storage or provider upload is performed.",
    routes: "/daily-logs, /daily-logs/[dailyLogId], /projects/[projectId]"
  },
  {
    heading: "invoices/payments/payment events",
    purpose:
      "Plan Financial Control and Accounting Readiness examples without real payment processing.",
    records:
      "Open, partially paid, paid, and overdue invoices plus only safe manual/internal payment event notes in a future approved write mode.",
    safety:
      "If payment rows would imply real provider success, future execution must omit them and document the gap.",
    providerExcluded:
      "Yes. No Stripe PaymentIntent, Checkout Session, charge, webhook replay, or payment finalization.",
    routes:
      "/financials, /financials/accounting-readiness, /invoices/[invoiceId], /portal/invoices/[invoiceId]"
  },
  {
    heading: "communication threads/messages",
    purpose:
      "Plan project/customer communications that make MessageCenter useful.",
    records:
      "One communication thread and one or more safe messages tied to project/customer/source context.",
    safety:
      "No free-floating chat, provider messages, or duplicate portal-only thread.",
    providerExcluded: "Yes. No email, SMS, or provider send.",
    routes: "/communications, /projects/[projectId], global search"
  },
  {
    heading: "document delivery/send event placeholders",
    purpose:
      "Plan Send Trail visibility only where the current event model can represent internal/manual evidence safely.",
    records:
      "Manual/internal/print document_delivery_events for supported subjects only in a future approved write mode.",
    safety:
      "Provider-like sent/opened/clicked/bounced events are omitted unless created by a real approved provider test lane.",
    providerExcluded:
      "Yes. No Postmark sends, provider delivery proof, or Send Trail delivery proof from this dry run.",
    routes:
      "/estimates/[estimateId], /contracts/[contractId], /invoices/[invoiceId]"
  },
  {
    heading: "project command timeline readiness",
    purpose:
      "Plan one coherent project story that lights up the Project Command Timeline needs-attention, ready-to-move, and recent-movement groups.",
    records:
      "No separate timeline records; coverage comes from estimate, contract/signature, invoice/payment, job/schedule, Daily Log, field note, proof readiness, communication, and portal visibility records above.",
    safety:
      "No activity table, duplicate project history, provider events, fake production behavior, or portal-only timeline copy.",
    providerExcluded:
      "Yes. Timeline readiness is derived presentation and never calls providers.",
    routes: "/projects/[projectId], /schedule, /daily-logs, /communications"
  },
  {
    heading: "service tickets/warranty documents",
    purpose:
      "Plan service and warranty continuity tied to the same customer/project/job history.",
    records:
      "One open service ticket, one closed service ticket where supported, and one warranty document.",
    safety:
      "No detached helpdesk, portal service request intake, automated claims, or legal warranty determination.",
    providerExcluded: "Yes. No provider warranty send or signature action.",
    routes: "/service-tickets, /projects/[projectId], document print routes"
  },
  {
    heading: "portal access/project access",
    purpose:
      "Plan customer-safe portal visibility for only the owner-approved demo project.",
    records:
      "One portal access grant and one portal_project_access row in a future approved execution mode.",
    safety:
      "Project access is scoped to the demo project only; no invite token is generated or printed.",
    providerExcluded: "Yes. No invite email or provider delivery.",
    routes:
      "/portal, /portal/projects/[projectId], portal shared document routes"
  }
];

const validationRoutes = [
  "/dashboard",
  "/projects",
  "discovered /projects/[projectId]",
  "/schedule",
  "/daily-logs",
  "/reports",
  "/financials",
  "/financials/accounting-readiness",
  "/portal",
  "discovered /portal/projects/[projectId]",
  "document print routes",
  "global search terms"
];

function printUsage(stream = process.stdout) {
  stream.write(
    [
      "Usage:",
      "  node scripts/seed-staging-demo-data.mjs --dry-run --organization-id <uuid> --owner-user-id <uuid> --owner-email <email> --portal-customer-email <email> [--platform-admin-email <email>] [--environment local|staging] [--confirm <text>]",
      "  node scripts/seed-staging-demo-data.mjs --validate-target --supabase-url <url> --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid> --owner-user-id <uuid> --owner-email <email> --portal-customer-email <email> --environment staging",
      "",
      "Phase 1 is dry-run only. The script validates inputs and prints the planned demo dataset. It does not connect to Supabase, read .env.local, write data, call providers, create invite tokens, send email, create payments, or mutate signatures.",
      "",
      "Phase 2A validate-target is read-only. It connects only with explicit Supabase target inputs and an approved service-role env var name, runs select-only readiness checks, and never writes data or calls providers.",
      "",
      "Required dry-run inputs:",
      "  --organization-id",
      "  --owner-user-id",
      "  --owner-email",
      "  --portal-customer-email",
      "",
      "Additional validate-target inputs:",
      "  --validate-target",
      "  --supabase-url",
      "  --service-role-key-env SUPABASE_SERVICE_ROLE_KEY",
      "  --environment local|staging"
    ].join("\n") + "\n"
  );
}

function parseArgs(argv) {
  const options = {
    dryRun: true
  };
  const errors = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = stripWrappingQuotes(argv[index]);

    if (arg === "--") {
      continue;
    }

    if (unsafeFlagPatterns.some((pattern) => pattern.test(arg))) {
      errors.push(
        `${arg} is not allowed. Phase 1 is dry-run only and has no execution or provider mode.`
      );
      continue;
    }

    const [flag, inlineValue] = arg.includes("=")
      ? arg.split(/=(.*)/s, 2)
      : [arg, null];

    if (!allowedFlags.has(flag)) {
      errors.push(`Unknown or unsafe flag: ${flag}`);
      continue;
    }

    if (flag === "--help" || flag === "-h") {
      options.help = true;
      continue;
    }

    if (flag === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (flag === "--validate-target") {
      options.validateTarget = true;
      options.dryRun = false;
      continue;
    }

    if (valueFlags.has(flag)) {
      const value = stripWrappingQuotes(inlineValue ?? argv[index + 1]);

      if (!value || value.startsWith("--")) {
        errors.push(`${flag} requires a value.`);
        continue;
      }

      if (inlineValue === null) {
        index += 1;
      }

      options[toOptionName(flag)] = value.trim();
    }
  }

  return { options, errors };
}

function stripWrappingQuotes(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function toOptionName(flag) {
  return flag
    .replace(/^--/, "")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateOptions(options) {
  const errors = [];

  for (const [key, label] of [
    ["organizationId", "--organization-id"],
    ["ownerUserId", "--owner-user-id"],
    ["ownerEmail", "--owner-email"],
    ["portalCustomerEmail", "--portal-customer-email"]
  ]) {
    if (!options[key]) {
      errors.push(`${label} is required for dry-run planning.`);
    }
  }

  if (options.organizationId && !uuidPattern.test(options.organizationId)) {
    errors.push("--organization-id must look like a UUID.");
  }

  if (options.ownerUserId && !uuidPattern.test(options.ownerUserId)) {
    errors.push("--owner-user-id must look like a UUID.");
  }

  if (options.ownerEmail && !isEmailLike(options.ownerEmail)) {
    errors.push("--owner-email must look like an email address.");
  }

  if (
    options.portalCustomerEmail &&
    !isEmailLike(options.portalCustomerEmail)
  ) {
    errors.push("--portal-customer-email must look like an email address.");
  }

  if (options.platformAdminEmail && !isEmailLike(options.platformAdminEmail)) {
    errors.push("--platform-admin-email must look like an email address.");
  }

  if (
    options.environment &&
    !["local", "staging"].includes(options.environment)
  ) {
    errors.push("--environment must be local or staging.");
  }

  if (options.validateTarget && !options.environment) {
    errors.push("--environment is required for read-only target validation.");
  }

  if (options.validateTarget && !options.supabaseUrl) {
    errors.push("--supabase-url is required for read-only target validation.");
  }

  if (
    options.validateTarget &&
    options.supabaseUrl &&
    !isHttpsSupabaseUrl(options.supabaseUrl)
  ) {
    errors.push(
      "--supabase-url must be an http(s) Supabase URL for read-only target validation."
    );
  }

  if (options.validateTarget && isProductionLikeText(options.supabaseUrl)) {
    errors.push(
      "--supabase-url appears production-like. Target validation refuses production-like Supabase targets."
    );
  }

  if (options.validateTarget && !options.serviceRoleKeyEnv) {
    errors.push(
      "--service-role-key-env is required for read-only target validation."
    );
  }

  if (
    options.validateTarget &&
    options.serviceRoleKeyEnv &&
    !approvedServiceRoleEnvNames.has(options.serviceRoleKeyEnv)
  ) {
    errors.push(
      "--service-role-key-env must name an approved Supabase service-role env var, such as SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (
    options.validateTarget &&
    options.serviceRoleKeyEnv &&
    !process.env[options.serviceRoleKeyEnv]?.trim()
  ) {
    errors.push(
      `${options.serviceRoleKeyEnv} is required in the environment for read-only target validation. The value will not be printed.`
    );
  }

  if (
    options.confirm &&
    /\b(prod|production|live|real customers?)\b/i.test(options.confirm)
  ) {
    errors.push(
      "--confirm contains production-like wording. This dry-run tool refuses production or live-data intent."
    );
  }

  return errors;
}

function isHttpsSupabaseUrl(value) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) && url.hostname.length > 0
    );
  } catch {
    return false;
  }
}

function isProductionLikeText(value) {
  return /\b(prod|production|live)\b/i.test(value ?? "");
}

function printTargetSummary(options) {
  console.log("Target summary");
  console.log("--------------");
  console.log(`Mode: dry-run (default true)`);
  console.log(
    `Environment: ${options.environment ?? "not supplied; dry-run plan only"}`
  );
  console.log(`Organization id: ${options.organizationId}`);
  console.log(`Owner user id: ${options.ownerUserId}`);
  console.log(`Owner email: ${options.ownerEmail}`);
  console.log(`Portal customer email: ${options.portalCustomerEmail}`);
  console.log(
    `Platform admin email: ${options.platformAdminEmail ?? "not supplied"}`
  );
}

function printDatasetPlan() {
  console.log("");
  console.log("Planned dataset groups");
  console.log("----------------------");

  datasetGroups.forEach((group, index) => {
    console.log("");
    console.log(`${index + 1}. ${group.heading}`);
    console.log(`   Purpose: ${group.purpose}`);
    console.log(`   Approximate planned records: ${group.records}`);
    console.log(`   Safety notes: ${group.safety}`);
    console.log(`   Provider action excluded: ${group.providerExcluded}`);
    console.log(`   Future validation routes: ${group.routes}`);
  });
}

function printIdempotencyNotes() {
  console.log("");
  console.log("Idempotency approach");
  console.log("--------------------");
  console.log(
    "- Use deterministic names/slugs such as FloorConnector Staging Demo labels."
  );
  console.log(
    "- Lookup future records by organization + deterministic labels or existing unique fields."
  );
  console.log(
    "- Do not use hardcoded stale IDs or generated UUIDs as reusable demo truth."
  );
  console.log(
    "- Avoid duplicate creation on future reruns with create-or-find behavior."
  );
}

function printProviderSafety() {
  console.log("");
  console.log("Provider safety");
  console.log("---------------");
  console.log("- no Stripe PaymentIntent creation");
  console.log("- no Postmark/email sends");
  console.log("- no signature provider calls");
  console.log("- no real payment finalization");
  console.log("- no Send Trail delivery proof from dry-run");
}

function printPortalSafety(options) {
  console.log("");
  console.log("Portal safety");
  console.log("-------------");
  console.log(
    `- portal customer email supplied for planning only: ${options.portalCustomerEmail}`
  );
  console.log("- no invite token generated or printed");
  console.log(
    "- portal project access would be scoped to the demo project only in future execution"
  );
  console.log("- portal exposure remains future owner-approved behavior");
}

function printValidationChecklist() {
  console.log("");
  console.log("Post-seed validation checklist for future execution");
  console.log("---------------------------------------------------");
  validationRoutes.forEach((route) => console.log(`- ${route}`));
}

function printPlan(options) {
  console.log("FloorConnector staging demo seed dry run");
  console.log("");
  console.log(DRY_RUN_BANNER);
  console.log("");
  console.log(
    "This Phase 1 dry-run path does not create a Supabase client, read .env.local, read secrets, connect to databases, write data, call providers, create auth users, generate portal invite tokens, create payment/signature/email events, or mutate app behavior."
  );
  console.log("");
  printTargetSummary(options);
  printDatasetPlan();
  printIdempotencyNotes();
  printProviderSafety();
  printPortalSafety(options);
  printValidationChecklist();
}

function createReadOnlyClient(options) {
  if (process.env.FLOORCONNECTOR_DEMO_SEED_VALIDATE_TARGET_MOCK === "ready") {
    return createMockReadyClient(options);
  }

  return createClient(
    options.supabaseUrl,
    process.env[options.serviceRoleKeyEnv].trim(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}

function createMockReadyClient(options) {
  const rows = new Map(
    requiredTargetTables.map((table) => [table, [{ id: `${table}-mock-id` }]])
  );

  rows.set("companies", [{ id: options.organizationId, name: "Mock staging" }]);
  rows.set("users", [
    { id: options.ownerUserId, email: options.ownerEmail },
    { id: "portal-user-mock-id", email: options.portalCustomerEmail }
  ]);
  rows.set("company_memberships", [
    {
      company_id: options.organizationId,
      user_id: options.ownerUserId,
      membership_status: "active",
      membership_role: "owner"
    }
  ]);
  rows.set("portal_access_grants", [
    {
      id: "portal-grant-mock-id",
      company_id: options.organizationId,
      invited_email: options.portalCustomerEmail,
      status: "active"
    }
  ]);
  rows.set("platform_user_roles", [
    { id: "platform-role-mock-id", user_id: options.ownerUserId }
  ]);
  rows.set("roles", [{ id: "role-mock-id", key: "platform_admin" }]);

  return {
    from(table) {
      return new MockReadOnlyQuery(rows.get(table) ?? []);
    }
  };
}

class MockReadOnlyQuery {
  constructor(rows) {
    this.rows = rows;
  }

  select() {
    return this;
  }

  eq(column, value) {
    this.rows = this.rows.filter((row) => row[column] === value);
    return this;
  }

  ilike(column, value) {
    const normalized = String(value).replace(/%/g, "").toLowerCase();
    this.rows = this.rows.filter((row) =>
      String(row[column] ?? "")
        .toLowerCase()
        .includes(normalized)
    );
    return this;
  }

  limit() {
    return Promise.resolve({
      data: this.rows.slice(0, 1),
      error: null
    });
  }

  maybeSingle() {
    return Promise.resolve({
      data: this.rows[0] ?? null,
      error: null
    });
  }
}

function addCheck(checks, name, status, detail) {
  checks.push({ name, status, detail });
}

async function assertTableQueryable(supabase, table) {
  const response = await supabase.from(table).select("id").limit(1);

  if (response.error) {
    throw new Error(response.error.message);
  }
}

async function maybeSingle(supabase, table, select, filters) {
  let query = supabase.from(table).select(select);

  for (const filter of filters) {
    if (filter.op === "ilike") {
      query = query.ilike(filter.column, filter.value);
    } else {
      query = query.eq(filter.column, filter.value);
    }
  }

  const response = await query.maybeSingle();

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
}

async function runReadOnlyTargetValidation(options) {
  const checks = [];
  const supabase = createReadOnlyClient(options);

  for (const table of requiredTargetTables) {
    try {
      await assertTableQueryable(supabase, table);
      addCheck(
        checks,
        `table:${table}`,
        "passed",
        "queryable with select-only check"
      );
    } catch (error) {
      addCheck(checks, `table:${table}`, "failed", error.message);
    }
  }

  try {
    const organization = await maybeSingle(supabase, "companies", "id, name", [
      { column: "id", value: options.organizationId }
    ]);

    if (organization) {
      addCheck(
        checks,
        "target organization",
        "passed",
        "organization id exists"
      );
    } else {
      addCheck(
        checks,
        "target organization",
        "failed",
        "organization id was not found"
      );
    }
  } catch (error) {
    addCheck(checks, "target organization", "failed", error.message);
  }

  try {
    const owner = await maybeSingle(supabase, "users", "id, email", [
      { column: "id", value: options.ownerUserId },
      { column: "email", op: "ilike", value: options.ownerEmail }
    ]);

    if (owner) {
      addCheck(checks, "owner user", "passed", "owner id/email exists");
    } else {
      addCheck(
        checks,
        "owner user",
        "failed",
        "owner id/email pair was not found"
      );
    }
  } catch (error) {
    addCheck(checks, "owner user", "failed", error.message);
  }

  try {
    const membership = await maybeSingle(
      supabase,
      "company_memberships",
      "company_id, user_id, membership_status, membership_role",
      [
        { column: "company_id", value: options.organizationId },
        { column: "user_id", value: options.ownerUserId }
      ]
    );

    if (!membership) {
      addCheck(
        checks,
        "owner membership",
        "failed",
        "no owner membership row exists for target organization"
      );
    } else if (membership.membership_status !== "active") {
      addCheck(
        checks,
        "owner membership",
        "failed",
        `membership exists but status is ${membership.membership_status}`
      );
    } else if (!["owner", "admin"].includes(membership.membership_role)) {
      addCheck(
        checks,
        "owner membership",
        "warned",
        `membership is active but role is ${membership.membership_role}; owner/admin is recommended for staging demo validation`
      );
    } else {
      addCheck(
        checks,
        "owner membership",
        "passed",
        `active ${membership.membership_role} membership exists`
      );
    }
  } catch (error) {
    addCheck(checks, "owner membership", "failed", error.message);
  }

  try {
    const portalUser = await maybeSingle(supabase, "users", "id, email", [
      { column: "email", op: "ilike", value: options.portalCustomerEmail }
    ]);

    addCheck(
      checks,
      "portal customer canonical user",
      portalUser ? "passed" : "warned",
      portalUser
        ? "portal customer email has a canonical user profile"
        : "portal customer email does not have a canonical user profile yet; owner may need to create/sign in the portal user"
    );
  } catch (error) {
    addCheck(checks, "portal customer canonical user", "warned", error.message);
  }

  try {
    const portalGrant = await maybeSingle(
      supabase,
      "portal_access_grants",
      "id, status, invited_email",
      [
        { column: "company_id", value: options.organizationId },
        {
          column: "invited_email",
          op: "ilike",
          value: options.portalCustomerEmail
        }
      ]
    );

    addCheck(
      checks,
      "portal access grant",
      portalGrant ? "passed" : "warned",
      portalGrant
        ? `portal grant exists with status ${portalGrant.status}`
        : "no portal grant found for the portal customer email; future demo may need owner-approved portal setup"
    );
  } catch (error) {
    addCheck(checks, "portal access grant", "warned", error.message);
  }

  if (options.platformAdminEmail) {
    try {
      const platformAdmin = await maybeSingle(supabase, "users", "id, email", [
        { column: "email", op: "ilike", value: options.platformAdminEmail }
      ]);

      if (!platformAdmin) {
        addCheck(
          checks,
          "platform admin user",
          "warned",
          "platform admin email was supplied but no canonical user profile was found"
        );
      } else {
        const platformRole = await maybeSingle(
          supabase,
          "platform_user_roles",
          "id, user_id",
          [{ column: "user_id", value: platformAdmin.id }]
        );
        addCheck(
          checks,
          "platform admin role",
          platformRole ? "passed" : "warned",
          platformRole
            ? "platform-admin role assignment exists"
            : "platform admin user exists but no platform role assignment was found"
        );
      }
    } catch (error) {
      addCheck(checks, "platform admin posture", "warned", error.message);
    }
  }

  addCheck(
    checks,
    "migration alignment",
    "warned",
    "not verified through PostgREST; owner should verify remote migrations with approved Supabase tooling"
  );

  return checks;
}

function printReadOnlyValidationReport(options, checks) {
  const counts = checks.reduce(
    (accumulator, check) => {
      accumulator[check.status] += 1;
      return accumulator;
    },
    { passed: 0, warned: 0, failed: 0 }
  );

  console.log("FloorConnector staging demo target validation");
  console.log("");
  console.log(VALIDATE_TARGET_BANNER);
  console.log("");
  console.log("Target summary");
  console.log("--------------");
  console.log("Mode: validate-target (read-only)");
  console.log(`Environment: ${options.environment}`);
  console.log(`Supabase URL: ${options.supabaseUrl}`);
  console.log(
    `Service role env var: ${options.serviceRoleKeyEnv} (value hidden)`
  );
  console.log(`Organization id: ${options.organizationId}`);
  console.log(`Owner user id: ${options.ownerUserId}`);
  console.log(`Owner email: ${options.ownerEmail}`);
  console.log(`Portal customer email: ${options.portalCustomerEmail}`);
  console.log(
    `Platform admin email: ${options.platformAdminEmail ?? "not supplied"}`
  );
  console.log("");
  console.log("Read-only checks");
  console.log("----------------");

  for (const check of checks) {
    console.log(`[${check.status.toUpperCase()}] ${check.name}`);
    console.log(`  ${check.detail}`);
  }

  console.log("");
  console.log("Summary");
  console.log("-------");
  console.log(`Passed: ${counts.passed}`);
  console.log(`Warned: ${counts.warned}`);
  console.log(`Failed: ${counts.failed}`);
  console.log("");
  console.log("Owner actions");
  console.log("-------------");
  console.log(
    "- Review failed checks before any future demo seed write-mode work."
  );
  console.log(
    "- Verify remote migration alignment with approved Supabase tooling."
  );
  console.log(
    "- Keep provider sends, portal invites, payment/signature events, and writes disabled until a separate owner-approved write mode exists."
  );

  return counts;
}

async function main() {
  const { options, errors: parseErrors } = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const errors = [...parseErrors, ...validateOptions(options)];

  if (errors.length > 0) {
    printUsage(process.stderr);
    process.stderr.write("\nDry-run preflight failed:\n");
    errors.forEach((error) => process.stderr.write(`- ${error}\n`));
    process.exit(1);
  }

  if (options.validateTarget) {
    const checks = await runReadOnlyTargetValidation(options);
    const counts = printReadOnlyValidationReport(options, checks);

    if (counts.failed > 0) {
      process.exit(1);
    }

    return;
  }

  printPlan(options);
}

await main();
