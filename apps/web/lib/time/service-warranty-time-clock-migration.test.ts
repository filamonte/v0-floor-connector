import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migrationSql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519210000_service_warranty_time_clocking.sql"
  ),
  "utf8"
);

void test("service warranty time migration adds ticket attribution without separate time tables", () => {
  assert.match(migrationSql, /alter table public\.time_punch_events/i);
  assert.match(
    migrationSql,
    /service_ticket_id uuid references public\.service_tickets/i
  );
  assert.match(migrationSql, /alter table public\.time_cards/i);
  assert.match(migrationSql, /time_punch_events_company_service_ticket_idx/i);
  assert.match(
    migrationSql,
    /time_cards_company_service_ticket_work_date_idx/i
  );
  assert.match(
    migrationSql,
    /create or replace function public\.validate_time_service_ticket_context/i
  );
  assert.doesNotMatch(migrationSql, /warranty_time_entries/i);
  assert.doesNotMatch(migrationSql, /service_time_entries/i);
  assert.doesNotMatch(migrationSql, /payroll/i);
  assert.doesNotMatch(migrationSql, /job_cost/i);
});
