import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationPath = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260512000720_record_revision_atomic_rpc.sql"
);
const migration = readFileSync(migrationPath, "utf8");

void test("record revision RPC migration creates an invoker atomic revision function", () => {
  assert.match(
    migration,
    /create or replace function public\.create_record_revision/i
  );
  assert.match(migration, /security invoker/i);
  assert.doesNotMatch(migration, /security definer/i);
  assert.match(migration, /pg_advisory_xact_lock/i);
});

void test("record revision RPC migration keeps tenant and subject validation in SQL", () => {
  assert.match(migration, /auth\.uid\(\)/i);
  assert.match(migration, /public\.is_active_company_member\(p_company_id\)/i);
  assert.match(migration, /from public\.estimates/i);
  assert.match(migration, /from public\.invoices/i);
  assert.match(migration, /from public\.contracts/i);
  assert.match(migration, /from public\.change_orders/i);
  assert.match(migration, /snapshot subject type does not match/i);
  assert.match(migration, /snapshot subject id does not match/i);
});

void test("record revision RPC migration restricts execute access", () => {
  assert.match(migration, /revoke all on function public\.create_record_revision[\s\S]+from public/i);
  assert.match(migration, /revoke all on function public\.create_record_revision[\s\S]+from anon/i);
  assert.match(migration, /grant execute on function public\.create_record_revision[\s\S]+to authenticated/i);
});
