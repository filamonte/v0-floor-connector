import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION
} from "./starter-pack-provisioning-execution-core";
import {
  describeProvisioningExecutionAttemptForAlreadyCompleted,
  describeProvisioningExecutionAttemptForDatabaseGuard,
  describeProvisioningExecutionAttemptForSchemaFailure,
  describeProvisioningExecutionAttemptFromIssue
} from "./starter-pack-provisioning-attempts-core";

function attemptsMigrationSql() {
  return readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260507035025_platform_starter_pack_provisioning_attempts.sql"
    ),
    "utf8"
  );
}

void test("maps missing confirmation to a rejected safe attempt", () => {
  const attempt = describeProvisioningExecutionAttemptForSchemaFailure({
    runId: "3fdc4f35-2331-4c8c-a9b8-1882d7f7d3b4",
    confirmationText: ""
  });

  assert.equal(attempt.outcome, "rejected");
  assert.equal(attempt.reasonCode, "missing_or_invalid_confirmation");
  assert.match(attempt.safeMessage, /EXECUTE STARTER PACK/);
});

void test("maps invalid run id to a rejected safe attempt", () => {
  const attempt = describeProvisioningExecutionAttemptForSchemaFailure({
    runId: "",
    confirmationText: STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION
  });

  assert.equal(attempt.outcome, "rejected");
  assert.equal(attempt.reasonCode, "missing_or_invalid_run_id");
});

void test("maps stale review eligibility issue to blocked attempt", () => {
  const attempt = describeProvisioningExecutionAttemptFromIssue(
    "The latest provisioning review must be fresh before execution is allowed."
  );

  assert.equal(attempt.outcome, "blocked");
  assert.equal(attempt.reasonCode, "review_not_fresh");
  assert.match(attempt.safeMessage, /fresh/);
});

void test("maps blocking review issue to blocked attempt", () => {
  const attempt = describeProvisioningExecutionAttemptFromIssue(
    "Resolve blocking review issues before execution."
  );

  assert.equal(attempt.outcome, "blocked");
  assert.equal(attempt.reasonCode, "blocking_review_issue");
});

void test("maps already-completed no-op attempt", () => {
  const attempt = describeProvisioningExecutionAttemptForAlreadyCompleted();

  assert.equal(attempt.outcome, "already_completed");
  assert.equal(attempt.reasonCode, "already_completed");
  assert.match(attempt.safeMessage, /No duplicate/);
});

void test("maps database guard rejection without raw database error text", () => {
  const attempt = describeProvisioningExecutionAttemptForDatabaseGuard();

  assert.equal(attempt.outcome, "failed_before_execution");
  assert.equal(attempt.reasonCode, "database_guard_rejected");
  assert.doesNotMatch(attempt.safeMessage, /SQLSTATE|duplicate key|permission/i);
});

void test("attempt audit migration enables forced RLS and revokes broad grants", () => {
  const sql = attemptsMigrationSql();

  assert.match(
    sql,
    /alter table public\.platform_starter_pack_provisioning_attempts enable row level security/
  );
  assert.match(
    sql,
    /alter table public\.platform_starter_pack_provisioning_attempts force row level security/
  );
  assert.match(
    sql,
    /revoke all on table public\.platform_starter_pack_provisioning_attempts from anon/
  );
  assert.match(
    sql,
    /revoke all on table public\.platform_starter_pack_provisioning_attempts from authenticated/
  );
});
