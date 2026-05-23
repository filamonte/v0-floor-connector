#!/usr/bin/env node

import process from "node:process";

const DRY_RUN_BANNER =
  "DRY RUN ONLY - no database writes, provider calls, emails, payments, signatures, or portal invite tokens will be created.";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const allowedFlags = new Set([
  "--dry-run",
  "--organization-id",
  "--owner-user-id",
  "--owner-email",
  "--portal-customer-email",
  "--platform-admin-email",
  "--environment",
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
  "--confirm"
]);

const unsafeFlagPatterns = [
  /--execute\b/i,
  /--write\b/i,
  /--seed\b/i,
  /--apply-migrations?\b/i,
  /--supabase\b/i,
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
      "",
      "Phase 1 is dry-run only. The script validates inputs and prints the planned demo dataset. It does not connect to Supabase, read .env.local, write data, call providers, create invite tokens, send email, create payments, or mutate signatures.",
      "",
      "Required dry-run inputs:",
      "  --organization-id",
      "  --owner-user-id",
      "  --owner-email",
      "  --portal-customer-email"
    ].join("\n") + "\n"
  );
}

function parseArgs(argv) {
  const options = {
    dryRun: true
  };
  const errors = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

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

    if (valueFlags.has(flag)) {
      const value = inlineValue ?? argv[index + 1];

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
    "This Phase 1 script does not import Supabase clients, read .env.local, read secrets, connect to databases, write data, call providers, create auth users, generate portal invite tokens, create payment/signature/email events, or mutate app behavior."
  );
  console.log("");
  printTargetSummary(options);
  printDatasetPlan();
  printIdempotencyNotes();
  printProviderSafety();
  printPortalSafety(options);
  printValidationChecklist();
}

function main() {
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

  printPlan(options);
}

main();
