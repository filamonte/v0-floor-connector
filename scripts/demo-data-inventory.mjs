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
    readiness: "partial",
    currentSignal:
      "The read model is implemented and tested, but current fixture paths do not guarantee one project with estimate, contract, invoice, payment, schedule, field, document, portal, and communication coverage together."
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
    readiness: "partial",
    currentSignal:
      "Document readiness is implemented; recent smoke found invoice coverage while active local estimate/contract detail paths were not always present."
  },
  {
    surface: "Communications handoff and send readiness",
    readiness: "partial",
    currentSignal:
      "Send readiness is implemented; browser smoke did not find a durable document-specific customer-bound handoff in active sample data."
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
  "No confirmed single local/staging project currently carries every golden-path layer together.",
  "Document-specific customer-bound send-readiness handoff data is not guaranteed.",
  "Active local contractor fixture discovery can miss estimate and contract detail paths.",
  "Timeline QA can land on a valid project that does not contain enough linked records to show the full command-center story.",
  "Payment event depth exists in payment QA lanes, but those lanes should not be treated as reusable staging demo data.",
  "Portal fixture write mode is explicitly gated and local/test-oriented; staging write mode still needs owner confirmation and target validation."
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
    recommendation: "best next implementation candidate",
    detail:
      "Appropriate only after owner confirmation; should reuse existing write-gated local/test fixture patterns and remain provider-dark."
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
    "Use docs/demo/staging-demo-data-plan.md before creating staging data. Remote data creation must be owner-approved, tenant-scoped, idempotent or cleanup-safe, and must not call providers, send email, create real payments, mutate signatures, or expose portal invite tokens."
  );
}

main();
