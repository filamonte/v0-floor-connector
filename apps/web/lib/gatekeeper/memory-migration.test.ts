import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519170000_gatekeeper_memory_foundation.sql"
  ),
  "utf8"
);

void test("GateKeeper memory migration extends canonical communication without provider lock-in", () => {
  assert.match(migration, /alter table public\.communication_threads/i);
  assert.match(
    migration,
    /thread_category text not null default 'operational'/i
  );
  assert.match(migration, /channel_kind text not null default 'unknown'/i);
  assert.match(migration, /source_kind text not null default 'human'/i);
  assert.match(migration, /provider_placeholder/);
  assert.doesNotMatch(migration, /twilio|telnyx|retell|vapi|openai/i);
});

void test("GateKeeper memory migration creates reviewable artifacts and suggestions only", () => {
  assert.match(
    migration,
    /create table if not exists public\.gatekeeper_artifacts/i
  );
  assert.match(
    migration,
    /create table if not exists public\.gatekeeper_action_suggestions/i
  );
  assert.match(migration, /review_status text not null default 'proposed'/i);
  assert.match(migration, /status text not null default 'proposed'/i);
  assert.match(migration, /gatekeeper_artifacts_company_id_id_unique_idx/i);
  assert.match(migration, /Approved does not mean executed/i);
  assert.doesNotMatch(migration, /executed_at|worker|automation_runtime/i);
});

void test("GateKeeper memory migration keeps tenant RLS membership-scoped", () => {
  assert.match(
    migration,
    /alter table public\.gatekeeper_artifacts force row level security/i
  );
  assert.match(
    migration,
    /alter table public\.gatekeeper_action_suggestions force row level security/i
  );
  assert.match(migration, /public\.is_active_company_member\(company_id\)/);
  assert.match(migration, /created_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /updated_by = \(select auth\.uid\(\)\)/);
});
