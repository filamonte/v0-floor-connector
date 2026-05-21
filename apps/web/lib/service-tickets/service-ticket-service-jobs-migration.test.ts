import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260520100000_service_ticket_service_jobs.sql"
  ),
  "utf8"
);

void test("service ticket service job migration links canonical jobs to service tickets", () => {
  assert.match(
    migration,
    /add column if not exists service_ticket_id uuid references public\.service_tickets\(id\) on delete set null/
  );
  assert.match(migration, /jobs_company_service_ticket_idx/);
  assert.match(migration, /on public\.jobs \(company_id, service_ticket_id\)/);
});

void test("service ticket service job migration validates tenant and project context", () => {
  assert.match(
    migration,
    /create or replace function public\.validate_job_service_ticket_context/
  );
  assert.match(
    migration,
    /Service ticket must belong to the same company as the job\./
  );
  assert.match(
    migration,
    /Service ticket customer must match the job project customer\./
  );
  assert.match(
    migration,
    /Service ticket project must match the linked service job project\./
  );
  assert.match(
    migration,
    /before insert or update of company_id, project_id, service_ticket_id/
  );
});

void test("service ticket service job migration avoids detached service scheduling systems", () => {
  assert.doesNotMatch(migration, /create table .*service_visits/i);
  assert.doesNotMatch(migration, /create table .*service_schedule/i);
  assert.doesNotMatch(migration, /portal/i);
  assert.doesNotMatch(migration, /invoice_id/i);
  assert.doesNotMatch(migration, /payment_id/i);
  assert.doesNotMatch(migration, /payroll/i);
  assert.doesNotMatch(migration, /gps/i);
  assert.doesNotMatch(migration, /ai_/i);
});
