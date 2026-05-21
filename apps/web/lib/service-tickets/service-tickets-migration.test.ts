import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { join } from "node:path";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519153000_service_tickets_foundation.sql"
  ),
  "utf8"
);

void test("service ticket migration creates canonical tenant-scoped service/warranty table", () => {
  assert.match(migration, /create table if not exists public\.service_tickets/);
  assert.match(
    migration,
    /company_id uuid not null references public\.companies/
  );
  assert.match(
    migration,
    /customer_id uuid not null references public\.customers/
  );
  assert.match(migration, /project_id uuid references public\.projects/);
  assert.match(migration, /job_id uuid references public\.jobs/);
  assert.match(migration, /source_type text not null default 'internal'/);
  assert.match(migration, /ticket_type text not null default 'warranty'/);
  assert.match(migration, /status text not null default 'open'/);
});

void test("service ticket migration preserves tenant relationship and RLS guardrails", () => {
  assert.match(
    migration,
    /create or replace function public\.validate_service_ticket_relationships/
  );
  assert.match(
    migration,
    /Service ticket customer must belong to the same company\./
  );
  assert.match(
    migration,
    /Service ticket project must belong to the selected customer\./
  );
  assert.match(
    migration,
    /Service ticket job must belong to the selected project\./
  );
  assert.match(
    migration,
    /alter table public\.service_tickets enable row level security/
  );
  assert.match(migration, /membership_role in \('owner', 'admin', 'manager'\)/);
});

void test("service ticket migration stays away from deferred systems", () => {
  assert.doesNotMatch(migration, /portal_service/i);
  assert.doesNotMatch(migration, /invoice_id/i);
  assert.doesNotMatch(migration, /payment_id/i);
  assert.doesNotMatch(migration, /payroll/i);
  assert.doesNotMatch(migration, /gps/i);
  assert.doesNotMatch(migration, /equipment_id/i);
  assert.doesNotMatch(migration, /manufacturer_claim/i);
});
