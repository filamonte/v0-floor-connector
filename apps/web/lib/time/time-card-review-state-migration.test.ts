import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migrationSql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519143000_time_card_review_state.sql"
  ),
  "utf8"
);

void test("time card review migration adds review state without payroll tables", () => {
  assert.match(migrationSql, /create type public\.time_card_review_status/i);
  assert.match(migrationSql, /review_status public\.time_card_review_status/i);
  assert.match(migrationSql, /reviewed_by uuid references public\.users/i);
  assert.match(migrationSql, /review_notes text/i);
  assert.doesNotMatch(migrationSql, /payroll/i);
  assert.doesNotMatch(migrationSql, /job_cost/i);
});
