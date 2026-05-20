import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260520125000_document_delivery_events_estimates_invoices.sql"
  ),
  "utf8"
);

void test("document delivery expansion allows warranty documents, estimates, and invoices only", () => {
  assert.match(
    migration,
    /check \(subject_type in \('warranty_document', 'estimate', 'invoice'\)\)/
  );
  assert.match(migration, /new\.subject_type = 'warranty_document'/);
  assert.match(migration, /new\.subject_type = 'estimate'/);
  assert.match(migration, /new\.subject_type = 'invoice'/);
  assert.doesNotMatch(migration, /new\.subject_type = 'contract'/);
  assert.doesNotMatch(migration, /'contract'/);
});

void test("document delivery expansion validates same-company estimate and invoice subjects", () => {
  assert.match(migration, /from public\.estimates estimate/);
  assert.match(migration, /from public\.invoices invoice/);
  assert.match(
    migration,
    /Document delivery subject must belong to the same company\./
  );
  assert.match(migration, /Unsupported document delivery subject type: %/);
});

void test("document delivery expansion preserves evidence-only boundaries", () => {
  assert.doesNotMatch(migration, /alter table public\.contracts/i);
  assert.doesNotMatch(migration, /contract_signers/i);
  assert.doesNotMatch(migration, /contract_signature_events/i);
  assert.doesNotMatch(migration, /payment_events/i);
  assert.doesNotMatch(migration, /webhook/i);
  assert.doesNotMatch(migration, /sendgrid|postmark|signwell|stripe/i);
});
