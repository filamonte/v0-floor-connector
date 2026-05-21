import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260520130000_document_delivery_events_contracts.sql"
  ),
  "utf8"
);

void test("document delivery contract expansion allows contract subjects without dropping existing subjects", () => {
  assert.match(
    migration,
    /check \(subject_type in \('warranty_document', 'estimate', 'invoice', 'contract'\)\)/
  );
  assert.match(migration, /new\.subject_type = 'warranty_document'/);
  assert.match(migration, /new\.subject_type = 'estimate'/);
  assert.match(migration, /new\.subject_type = 'invoice'/);
  assert.match(migration, /new\.subject_type = 'contract'/);
  assert.match(migration, /from public\.contracts contract/);
});

void test("document delivery contract expansion preserves same-company validation and immutability posture", () => {
  assert.match(
    migration,
    /Document delivery subject must belong to the same company\./
  );
  assert.match(migration, /Unsupported document delivery subject type: %/);
  assert.doesNotMatch(migration, /drop policy/i);
  assert.doesNotMatch(migration, /drop trigger.*prevent_document_delivery/i);
});

void test("document delivery contract expansion does not mirror contract signature behavior", () => {
  assert.doesNotMatch(
    migration,
    /insert into public\.contract_signature_events/i
  );
  assert.doesNotMatch(migration, /update public\.contracts/i);
  assert.doesNotMatch(migration, /update public\.contract_signers/i);
  assert.doesNotMatch(migration, /signature_requested/i);
  assert.doesNotMatch(migration, /contractor_countersigned/i);
  assert.doesNotMatch(migration, /sendgrid|postmark|signwell|stripe|webhook/i);
});
