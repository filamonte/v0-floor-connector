import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = join(__dirname, "..", "..", "..", "..");
const operationsSummaryPath = join(
  repoRoot,
  "apps",
  "web",
  "lib",
  "reports",
  "operations-summary.ts"
);
const reportsPagePath = join(
  repoRoot,
  "apps",
  "web",
  "app",
  "(app)",
  "reports",
  "page.tsx"
);
const reportsDataPath = join(
  repoRoot,
  "apps",
  "web",
  "lib",
  "reports",
  "data.ts"
);
const migrationsDir = join(repoRoot, "supabase", "migrations");

function read(path: string) {
  return readFileSync(path, "utf8");
}

void test("owner reports derive from canonical source records", () => {
  const operationsSummary = read(operationsSummaryPath);
  const reportsData = read(reportsDataPath);

  for (const requiredInput of [
    "ReportsProjectInput",
    "ReportsJobInput",
    "ReportsJobAssignmentInput",
    "ReportsContractInput",
    "ReportsInvoiceInput",
    "ReportsPaymentInput",
    "ReportsDailyLogInput",
    "ReportsFieldNoteInput",
    "ReportsAttachmentInput",
    "ReportsCollectionsInput"
  ]) {
    assert.match(operationsSummary, new RegExp(`type ${requiredInput}`));
  }

  for (const canonicalLoader of [
    "listProjects",
    "listScheduleJobs",
    "listScheduleJobAssignmentsByJobIds",
    "listContracts",
    "listInvoices",
    "listPayments",
    "listDailyLogs",
    "listFieldNotes",
    "getFinancialCollectionsReadModel"
  ]) {
    assert.match(reportsData, new RegExp(canonicalLoader));
  }
});

void test("owner reports summarize and route instead of owning actions", () => {
  const reportsPage = read(reportsPagePath);

  assert.match(reportsPage, /Reports route back to the workspaces/);
  assert.match(reportsPage, /Source records only/);
  assert.match(reportsPage, /read-only/i);
  assert.doesNotMatch(reportsPage, /create owner task/i);
  assert.doesNotMatch(reportsPage, /automate/i);
  assert.doesNotMatch(reportsPage, /post to accounting/i);
});

void test("owner reporting does not add report-owned persistence or mutations", () => {
  const operationsSummary = read(operationsSummaryPath);
  const reportsData = read(reportsDataPath);
  const mutationPattern =
    /\.(insert|update|upsert|delete|rpc)\s*\(|\bcreateOwner|\bcreateReport|\bowner_report/i;

  assert.doesNotMatch(operationsSummary, mutationPattern);
  assert.doesNotMatch(reportsData, mutationPattern);
  assert.doesNotMatch(operationsSummary, /from\(["']owner_reports["']\)/i);
  assert.doesNotMatch(reportsData, /from\(["']owner_reports["']\)/i);
});

void test("owner reporting verification sees no schema or migration drift", () => {
  if (!existsSync(migrationsDir)) {
    return;
  }

  const migrationNames = readdirSync(migrationsDir);
  const ownerReportingMigrations = migrationNames.filter((name) =>
    /owner[_-]?report|operations[_-]?report|portfolio[_-]?risk/i.test(name)
  );

  assert.deepEqual(ownerReportingMigrations, []);
});
