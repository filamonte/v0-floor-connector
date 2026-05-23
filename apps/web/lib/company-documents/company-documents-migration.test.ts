import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const companyDocumentsMigration = readFileSync(
  join(
    process.cwd(),
    "..",
    "..",
    "supabase/migrations/20260523140000_company_documents_foundation.sql"
  ),
  "utf8"
);

void test("company documents migration creates the tenant-owned library table", () => {
  assert.match(
    companyDocumentsMigration,
    /create table if not exists public\.company_documents/
  );
  assert.match(
    companyDocumentsMigration,
    /company_id uuid not null references public\.companies\(id\)/
  );
  assert.match(companyDocumentsMigration, /title text not null/);
  assert.match(companyDocumentsMigration, /document_kind text not null/);
  assert.match(companyDocumentsMigration, /body text/);
  assert.match(companyDocumentsMigration, /company_documents_title_check/);
});

void test("company documents migration preserves RLS and manager-scope mutations", () => {
  assert.match(
    companyDocumentsMigration,
    /alter table public\.company_documents enable row level security/
  );
  assert.match(
    companyDocumentsMigration,
    /alter table public\.company_documents force row level security/
  );
  assert.match(
    companyDocumentsMigration,
    /company_documents_select_by_membership/
  );
  assert.match(
    companyDocumentsMigration,
    /membership_role in \('owner', 'admin', 'manager'\)/
  );
});

void test("company documents migration does not create distribution, provider, or template side effects", () => {
  assert.doesNotMatch(companyDocumentsMigration, /document_templates/);
  assert.doesNotMatch(companyDocumentsMigration, /portal_/);
  assert.doesNotMatch(companyDocumentsMigration, /storage\.buckets/);
  assert.doesNotMatch(companyDocumentsMigration, /document_signers/);
  assert.doesNotMatch(companyDocumentsMigration, /document_signature/);
  assert.doesNotMatch(companyDocumentsMigration, /signature_events/);
  assert.doesNotMatch(companyDocumentsMigration, /stripe/i);
  assert.doesNotMatch(companyDocumentsMigration, /postmark/i);
});
