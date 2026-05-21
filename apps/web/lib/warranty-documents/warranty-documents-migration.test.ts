import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const templateTypeMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519184400_warranty_template_type.sql"
  ),
  "utf8"
);
const warrantyDocumentMigration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519184500_warranty_document_foundation.sql"
  ),
  "utf8"
);

void test("warranty document migrations extend canonical templates and create warranty documents", () => {
  assert.match(
    templateTypeMigration,
    /alter type public\.template_type add value if not exists 'warranty'/
  );
  assert.match(
    warrantyDocumentMigration,
    /create table if not exists public\.warranty_documents/
  );
  assert.match(warrantyDocumentMigration, /document_template_id uuid/);
  assert.match(
    warrantyDocumentMigration,
    /foreign key \(company_id, document_template_id\)/
  );
  assert.match(warrantyDocumentMigration, /'warranty'/);
  assert.match(
    warrantyDocumentMigration,
    /default-specialty-flooring-warranty-v1/
  );
});

void test("warranty document migration preserves canonical relationship and RLS guardrails", () => {
  assert.match(
    warrantyDocumentMigration,
    /create or replace function public\.validate_warranty_document_relationships/
  );
  assert.match(
    warrantyDocumentMigration,
    /Warranty document customer must belong to the same company\./
  );
  assert.match(
    warrantyDocumentMigration,
    /Warranty document service ticket must belong to the same company\./
  );
  assert.match(
    warrantyDocumentMigration,
    /Warranty document template must be a warranty template\./
  );
  assert.match(
    warrantyDocumentMigration,
    /alter table public\.warranty_documents enable row level security/
  );
  assert.match(
    warrantyDocumentMigration,
    /membership_role in \('owner', 'admin', 'manager'\)/
  );
});

void test("warranty document migration does not create deferred send, billing, portal, or signature systems", () => {
  assert.doesNotMatch(warrantyDocumentMigration, /portal_warranty/i);
  assert.doesNotMatch(warrantyDocumentMigration, /invoice_id/i);
  assert.doesNotMatch(warrantyDocumentMigration, /payment_id/i);
  assert.doesNotMatch(warrantyDocumentMigration, /job_cost/i);
  assert.doesNotMatch(warrantyDocumentMigration, /warranty_signers/i);
  assert.doesNotMatch(warrantyDocumentMigration, /signature_events/i);
  assert.doesNotMatch(warrantyDocumentMigration, /manufacturer_claim/i);
});
