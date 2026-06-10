import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationPath = path.join(
  process.cwd(),
  "..",
  "..",
  "supabase",
  "migrations",
  "20260609231500_opportunity_assessment_package_alignment.sql"
);

const migrationSql = readFileSync(migrationPath, "utf8");

void test("migration makes assessment packages opportunity-owned before project creation", () => {
  assert.match(
    migrationSql,
    /alter table public\.assessment_packages\s+add column if not exists opportunity_id uuid references public\.opportunities\(id\)/i
  );
  assert.match(
    migrationSql,
    /alter table public\.assessment_packages\s+alter column project_id drop not null/i
  );
  assert.match(
    migrationSql,
    /constraint assessment_packages_owner_check\s+check \(opportunity_id is not null or project_id is not null\)/i
  );
  assert.match(
    migrationSql,
    /create index if not exists assessment_packages_company_opportunity_idx/i
  );
});

void test("migration validates assessment package opportunity tenant scope", () => {
  assert.match(migrationSql, /validate_assessment_package_relationships/i);
  assert.match(
    migrationSql,
    /select opportunity\.company_id, opportunity\.project_id/i
  );
  assert.match(migrationSql, /from public\.opportunities/i);
  assert.match(
    migrationSql,
    /assessment package opportunity must belong to the same company/i
  );
  assert.match(
    migrationSql,
    /assessment package project must match the linked opportunity project when present/i
  );
});

void test("migration carries opportunity ownership into assessment spaces", () => {
  assert.match(
    migrationSql,
    /alter table public\.assessment_spaces\s+add column if not exists opportunity_id uuid references public\.opportunities\(id\)/i
  );
  assert.match(
    migrationSql,
    /alter table public\.assessment_spaces\s+alter column project_id drop not null/i
  );
  assert.match(migrationSql, /new\.opportunity_id := package_opportunity_id/i);
  assert.match(
    migrationSql,
    /create index if not exists assessment_spaces_company_opportunity_idx/i
  );
});
