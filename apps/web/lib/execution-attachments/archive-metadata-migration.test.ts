import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "..",
    "..",
    "supabase/migrations/20260524190000_execution_attachments_archive_metadata.sql"
  ),
  "utf8"
);

void test("execution attachment archive migration adds metadata-only lifecycle fields", () => {
  assert.match(migration, /add column if not exists archived_at timestamptz/);
  assert.match(
    migration,
    /add column if not exists archived_by uuid references public\.users\(id\) on delete set null/
  );
  assert.match(migration, /add column if not exists archive_reason text/);
  assert.match(migration, /add column if not exists restored_at timestamptz/);
  assert.match(
    migration,
    /add column if not exists restored_by uuid references public\.users\(id\) on delete set null/
  );
  assert.match(migration, /add column if not exists restore_reason text/);
});

void test("execution attachment archive migration keeps active subject reads indexed", () => {
  assert.match(migration, /execution_attachments_company_subject_active_idx/);
  assert.match(migration, /where archived_at is null/);
  assert.match(migration, /execution_attachments_company_archived_at_idx/);
});

void test("execution attachment archive migration does not touch storage or policies", () => {
  assert.doesNotMatch(migration, /storage\.objects/);
  assert.doesNotMatch(migration, /storage\.buckets/);
  assert.doesNotMatch(migration, /create policy/i);
  assert.doesNotMatch(migration, /drop policy/i);
  assert.doesNotMatch(migration, /delete from/i);
});
