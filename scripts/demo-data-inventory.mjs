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
