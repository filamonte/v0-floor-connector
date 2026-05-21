import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const migrationSql = readFileSync(
  join(repoRoot, "supabase/migrations/20260515220057_data_import_batches.sql"),
  "utf8"
);
const grantHardeningSql = readFileSync(
  join(
    repoRoot,
    "supabase/migrations/20260515221606_data_import_batch_grant_hardening.sql"
  ),
  "utf8"
);
const importBatchSource = readFileSync(
  join(repoRoot, "apps/web/lib/data-export/import-batches.ts"),
  "utf8"
);

void test("import batch migration creates tenant-scoped review tables with forced RLS", () => {
  assert.match(migrationSql, /create table if not exists public\.data_import_batches/i);
  assert.match(migrationSql, /create table if not exists public\.data_import_rows/i);
  assert.match(migrationSql, /alter table public\.data_import_batches force row level security/i);
  assert.match(migrationSql, /alter table public\.data_import_rows force row level security/i);
  assert.match(migrationSql, /membership_role in \('owner', 'admin'\)/i);
  assert.match(grantHardeningSql, /revoke all\s+on public\.data_import_batches\s+from anon, authenticated/i);
  assert.match(grantHardeningSql, /revoke all\s+on public\.data_import_rows\s+from anon, authenticated/i);
  assert.match(grantHardeningSql, /grant select, insert, update\s+on public\.data_import_batches\s+to authenticated/i);
  assert.match(grantHardeningSql, /grant select, insert, update\s+on public\.data_import_rows\s+to authenticated/i);
  assert.doesNotMatch(grantHardeningSql, /to anon/i);
});

void test("import batch migration constrains review rows to no canonical write refs", () => {
  assert.match(
    migrationSql,
    /constraint data_import_rows_created_record_refs_null_check\s+check \(created_record_refs is null\)/i
  );
  assert.match(migrationSql, /normalized customer\/contact preview fields/i);
  assert.doesNotMatch(migrationSql, /raw_uploaded_file|raw_csv|file_contents|payment_method/i);
});

void test("import batch helper records safe metadata and avoids canonical mutation imports", () => {
  assert.match(importBatchSource, /noCanonicalWrites:\s*true/);
  assert.match(importBatchSource, /rawFileStored:\s*false/);
  assert.doesNotMatch(importBatchSource, /from\(["']customers["']\)\.insert/);
  assert.doesNotMatch(importBatchSource, /from\(["']contacts["']\)\.insert/);
  assert.doesNotMatch(importBatchSource, /from\(["']customer_contacts["']\)\.insert/);
});
