import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260519193000_document_signature_foundation.sql"
  ),
  "utf8"
);

void test("document signature migration creates generic signer and event tables for warranty documents", () => {
  assert.match(
    migration,
    /create table if not exists public\.document_signers/
  );
  assert.match(
    migration,
    /create table if not exists public\.document_signature_events/
  );
  assert.match(migration, /subject_type in \('warranty_document'\)/);
  assert.match(migration, /signer_role in \('customer', 'contractor'\)/);
  assert.match(
    migration,
    /event_type in \('signature_requested', 'viewed', 'signed', 'declined', 'voided'\)/
  );
});

void test("document signature migration validates tenant ownership and signer subject consistency", () => {
  assert.match(
    migration,
    /create or replace function public\.validate_document_signature_subject/
  );
  assert.match(migration, /from public\.warranty_documents document/);
  assert.match(
    migration,
    /Document signature subject must belong to the same company\./
  );
  assert.match(
    migration,
    /create or replace function public\.validate_document_signature_event/
  );
  assert.match(
    migration,
    /Document signature event signer must match the event subject\./
  );
});

void test("document signature migration keeps events immutable and role-scoped", () => {
  assert.match(
    migration,
    /create or replace function public\.prevent_document_signature_event_mutation/
  );
  assert.match(
    migration,
    /alter table public\.document_signers enable row level security/
  );
  assert.match(
    migration,
    /alter table public\.document_signature_events enable row level security/
  );
  assert.match(migration, /membership_role in \('owner', 'admin', 'manager'\)/);
  assert.match(migration, /prevent_document_signature_event_updates/);
  assert.match(migration, /prevent_document_signature_event_deletes/);
});

void test("document signature migration does not migrate contract, portal, send, billing, or provider behavior", () => {
  assert.doesNotMatch(migration, /alter table public\.contracts/i);
  assert.doesNotMatch(migration, /contract_signers/i);
  assert.doesNotMatch(migration, /contract_signature_events/i);
  assert.doesNotMatch(migration, /portal_/i);
  assert.doesNotMatch(migration, /invoice_id/i);
  assert.doesNotMatch(migration, /payment_id/i);
  assert.doesNotMatch(migration, /job_cost/i);
  assert.doesNotMatch(migration, /sendgrid|postmark|signwell|stripe/i);
});
