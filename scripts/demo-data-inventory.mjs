#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

const requiredDemoRecords = [
  "Contractor organization with one owner/admin user",
  "Optional platform-admin user for Platform Control Room smoke",
  "Portal customer auth user backed by canonical portal grants",
  "One customer account and primary customer contact",
  "One active project with location, scope, project health, and Next Move signals",
  "One completed or closeout-ready project, or one active project with closeout proof",
  "Approved estimate, sent estimate, sent contract, signed contract, sent change order, approved change order",
  "Unscheduled job, scheduled-today job, upcoming job, in-progress job, missing-crew example, and completed job",
  "Daily Job Log, open blocker Job Note, resolved note, field evidence placeholder, and labor/time summary where supported",
  "Communication thread/message, document delivery event, signature event, payment request/event, and portal record view",
  "Project Command Timeline coverage over estimate, contract, invoice, payment, schedule, Daily Log, field note, document readiness, portal visibility, and communication handoff signals",
  "Customer-bound send-readiness scenario tied to an estimate, contract, or invoice without sending",
  "Open invoice, partially paid invoice, paid invoice, overdue invoice, pending payment event, and failed payment event",
  "Proof Center and CloseoutTrail source records, closeout package route support, signed contract, paid invoice, and field proof",
  "Open and closed service tickets plus warranty handoff/document where supported",
  "Portal project access to shared estimate, contract, invoice, change order, timeline, and documents"
];

const inspectedPaths = [
  "scripts/portal-e2e-fixture.mjs",
  "scripts/seed-local-golden-path-demo-data.mjs",
  "scripts/e2e-second-tenant-fixture.mjs",
  "e2e/protected-route-utils.js",
  "e2e/auth.setup.js",
  "e2e/portal-auth.setup.js",
  "e2e/platform-admin-auth.setup.js",
  "e2e/project-ai-cue-work-item-bridge.spec.js",
  "e2e/dashboard-ui-my-work-queue-modes.spec.js",
  "docs/demo/operating-core-demo-path.md",
  "docs/staging-owner-runbook.md",
  "supabase/migrations"
];

const fixtureSignals = [
  {
    name: "Local golden-path seed mode",
    path: "scripts/seed-local-golden-path-demo-data.mjs",
    coverage:
      "Owner-confirmed local-only seed script for one deterministic golden path project across customer, project, estimate, contract, invoice, job, daily log, field notes, payment event, communication draft, and optional portal access."
  },
  {
    name: "Portal golden-path fixture",
    path: "scripts/portal-e2e-fixture.mjs",
    coverage:
      "Local validation/write-gated fixture for customer, contact, project, portal access, estimate, contract, invoice, and change order records."
  },
  {
    name: "Second-tenant payment boundary fixture",
    path: "scripts/e2e-second-tenant-fixture.mjs",
    coverage:
      "Local validation/write-gated tenant-B invoice/payment boundary fixture for webhook integrity tests."
  },
  {
    name: "Route discovery helper",
    path: "e2e/protected-route-utils.js",
    coverage:
      "Discovers valid protected detail links from index pages instead of relying on stale hardcoded IDs."
  },
  {
    name: "Project cue bridge fixtures",
    path: "e2e/project-ai-cue-work-item-bridge.spec.js",
    coverage:
      "Spec-local fixture patterns for approved estimate, signed-ready-no-job, unscheduled job, scheduled job, and open blocker field note states."
  },
  {
    name: "Dashboard My Work queue fixtures",
    path: "e2e/dashboard-ui-my-work-queue-modes.spec.js",
    coverage:
      "Spec-local fixture patterns for sent estimate follow-up, overdue invoice, unscheduled job, people, and responsibility defaults."
  }
];

const currentCoverageMatrix = [
  {
    surface: "Dashboard Operational Digest",
    readiness: "partial",
    currentSignal:
      "Dashboard and My Work E2E patterns can create source-record attention, but no single owner-approved demo project is guaranteed to drive the full digest."
  },
  {
    surface: "Project Command Timeline",
    readiness: "seedable locally",
    currentSignal:
      "The read model is implemented and tested. The guarded local seed mode can create/reuse one project with estimate, contract, invoice, payment-event, schedule, field, document, portal, and communication coverage when owner-confirmed local writes are allowed."
  },
  {
    surface: "Project Copilot and draft actions",
    readiness: "partial",
    currentSignal:
      "Project Copilot and Use Draft handoff work when source signals exist; current data may surface internal blocker drafts rather than document-specific customer drafts."
  },
  {
    surface: "Schedule readiness / CrewBoard",
    readiness: "partial",
    currentSignal:
      "Spec-local patterns cover unscheduled and scheduled jobs; one durable demo project with the full job-state matrix is not yet guaranteed."
  },
  {
    surface: "AR collections intelligence",
    readiness: "partial",
    currentSignal:
      "Dashboard and payment tests cover overdue and payment-event states, but those are QA lanes rather than a single stable demo story."
  },
  {
    surface: "Estimate/contract/invoice document readiness",
    readiness: "seedable locally",
    currentSignal:
      "Document readiness is implemented. The guarded local seed mode creates/reuses linked estimate, contract, and invoice records for local QA when write mode is explicitly confirmed."
  },
  {
    surface: "Communications handoff and send readiness",
    readiness: "seedable locally",
    currentSignal:
      "Send readiness is implemented. The guarded local seed mode creates/reuses an invoice-tied internal communication draft suitable for send-readiness review without sending."
  },
  {
    surface: "Daily Log / field blocker / evidence",
    readiness: "partial",
    currentSignal:
      "Spec-local patterns cover open blocker field notes; one fixture-safe project with daily log, blocker, resolved note, and evidence is not guaranteed."
  },
  {
    surface: "Portal-safe status and review pages",
    readiness: "partial",
    currentSignal:
      "Portal fixture can validate/create local/test portal access and shared review routes when write-gated prerequisites are approved."
  }
];

const knownGoldenPathGaps = [
  "No confirmed staging project currently carries every golden-path layer together.",
  "Local golden-path coverage now depends on the owner-confirmed local seed command being run against a local Supabase target.",
  "Portal access is seeded only when the requested portal customer email already belongs to a local canonical user; this script does not create auth users or send invites.",
  "Execution attachment placeholders are intentionally omitted because local seed mode does not create storage objects.",
  "Payment event depth is limited to a safe local payment-request event; no payment record or provider checkout/payment attempt is created.",
  "Staging write mode still needs owner confirmation, target validation, allowlist, idempotency, and cleanup policy before implementation."
];

const recommendedImplementationPaths = [
  {
    option: "docs-only checklist",
    recommendation: "safe but not sufficient",
    detail:
      "Keeps boundaries clear, but does not reduce future QA friction or stale fixture hunting."
  },
  {
    option: "dry-run inventory enhancement",
    recommendation: "recommended now",
    detail:
      "Improves visibility into missing golden-path coverage without env reads, Supabase access, provider calls, or data writes."
  },
  {
    option: "local-only owner-confirmed seed script",
    recommendation: "available for local-only use",
    detail:
      "Use only with --confirm-local-write plus FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1 against a local Supabase URL. It remains provider-dark and does not create auth users or invite emails."
  },
  {
    option: "staging-only seed mode",
    recommendation: "defer",
    detail:
      "Requires clean read-only target validation, explicit staging identifiers, tenant allowlist, idempotency/cleanup policy, and owner approval."
  }
];

function exists(relativePath) {
  return fs.existsSync(path.join(workspaceRoot, relativePath));
}

function countFiles(relativeDir, matcher) {
  const absoluteDir = path.join(workspaceRoot, relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    return 0;
  }

  return fs
    .readdirSync(absoluteDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => matcher(entry.name)).length;
}

function printSection(title) {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));
}

function main() {
  console.log("FloorConnector staging demo data inventory");
  console.log("");
  console.log(
    "Mode: dry-run only. No Supabase connection, no env reads, no writes."
  );

  printSection("Required demo record checklist");
  requiredDemoRecords.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });

  printSection("Local fixture and discovery signals");
  for (const signal of fixtureSignals) {
    const status = exists(signal.path) ? "present" : "missing";
    console.log(`- ${signal.name}: ${status}`);
    console.log(`  Path: ${signal.path}`);
    console.log(`  Coverage: ${signal.coverage}`);
  }

  printSection("Golden-path surface readiness");
  for (const item of currentCoverageMatrix) {
    console.log(`- ${item.surface}: ${item.readiness}`);
    console.log(`  Current signal: ${item.currentSignal}`);
  }

  printSection("Known golden-path data gaps");
  knownGoldenPathGaps.forEach((gap, index) => {
    console.log(`${index + 1}. ${gap}`);
  });

  printSection("Recommended implementation path");
  for (const item of recommendedImplementationPaths) {
    console.log(`- ${item.option}: ${item.recommendation}`);
    console.log(`  ${item.detail}`);
  }

  printSection("Inspected path availability");
  for (const relativePath of inspectedPaths) {
    console.log(
      `- ${relativePath}: ${exists(relativePath) ? "present" : "missing"}`
    );
  }

  printSection("Repository counts");
  console.log(
    `- E2E fixture/spec files with fixture in the name: ${countFiles(
      "e2e",
      (name) => /fixture|spec/i.test(name)
    )}`
  );
  console.log(
    `- Supabase migration files: ${countFiles("supabase/migrations", (name) =>
      name.endsWith(".sql")
    )}`
  );
  console.log(
    `- Local scripts: ${countFiles("scripts", (name) => /\.(mjs|cjs|js|sql)$/i.test(name))}`
  );

  printSection("Owner action reminder");
  console.log(
    "Use docs/demo/local-golden-path-seed-mode-design.md before local writes and docs/demo/staging-demo-data-plan.md before any staging data. Local writes require pnpm.cmd demo:data:seed:local -- --confirm-local-write plus FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1 against a local Supabase URL. Remote data creation must remain separately owner-approved, tenant-scoped, idempotent or cleanup-safe, and must not call providers, send email, create real payments, mutate signatures, or expose portal invite tokens."
  );
}

main();
