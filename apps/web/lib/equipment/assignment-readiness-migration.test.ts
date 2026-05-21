import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519120000_equipment_assignment_readiness.sql"
  ),
  "utf8"
);

void test("equipment assignment readiness migration enforces same-company job requirements", () => {
  assert.match(
    migration,
    /create or replace function public\.enforce_job_equipment_requirement_scope\(\)/
  );
  assert.match(migration, /select jobs\.company_id\s+into job_company_id/);
  assert.match(
    migration,
    /job_company_id <> new\.company_id[\s\S]+Equipment requirement job must belong to the same company/
  );
  assert.match(
    migration,
    /before insert or update of company_id, job_id on public\.job_equipment_requirements/
  );
});

void test("equipment assignment readiness migration enforces same-company asset and job assignment scope", () => {
  assert.match(
    migration,
    /create or replace function public\.enforce_equipment_assignment_scope\(\)/
  );
  assert.match(
    migration,
    /asset_company_id <> new\.company_id[\s\S]+Equipment assignment asset must belong to the same company/
  );
  assert.match(
    migration,
    /job_company_id <> new\.company_id[\s\S]+Equipment assignment job must belong to the same company/
  );
  assert.match(
    migration,
    /new\.project_id is not null and new\.project_id <> job_project_id[\s\S]+Equipment assignment project must match the job project/
  );
  assert.match(
    migration,
    /if new\.project_id is null then\s+new\.project_id := job_project_id;/
  );
});

void test("equipment assignment readiness migration keeps RLS membership-scoped", () => {
  assert.match(
    migration,
    /alter table public\.job_equipment_requirements force row level security;/
  );
  assert.match(
    migration,
    /alter table public\.equipment_assignments force row level security;/
  );
  assert.match(migration, /public\.is_active_company_member\(company_id\)/);
  assert.match(
    migration,
    /membership\.membership_role in \('owner', 'admin', 'manager'\)/
  );
});
