import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260520110000_document_delivery_events.sql"
  ),
  "utf8"
);

void test("document delivery migration creates warranty-document-only evidence events", () => {
  assert.match(
    migration,
    /create table if not exists public\.document_delivery_events/
  );
  assert.match(migration, /subject_type in \('warranty_document'\)/);
  assert.match(
    migration,
    /event_type in \(\s*'delivery_recorded',\s*'send_requested',\s*'sent',\s*'viewed',\s*'failed',\s*'bounced',\s*'opened',\s*'clicked'\s*\)/
  );
  assert.match(
    migration,
    /channel in \('internal', 'portal', 'email', 'print', 'manual'\)/
  );
  assert.match(migration, /metadata jsonb not null default '\{\}'::jsonb/);
});

void test("document delivery migration validates tenant ownership for warranty documents", () => {
  assert.match(
    migration,
    /create or replace function public\.validate_document_delivery_event_subject/
  );
  assert.match(migration, /from public\.warranty_documents document/);
  assert.match(
    migration,
    /Document delivery subject must belong to the same company\./
  );
  assert.match(migration, /from public\.notification_events notification/);
  assert.match(
    migration,
    /Related notification event must belong to the same company\./
  );
  assert.match(
    migration,
    /create trigger validate_document_delivery_event_subject/
  );
});

void test("document delivery migration keeps events immutable and role-scoped", () => {
  assert.match(
    migration,
    /create or replace function public\.prevent_document_delivery_event_mutation/
  );
  assert.match(
    migration,
    /alter table public\.document_delivery_events enable row level security/
  );
  assert.match(
    migration,
    /alter table public\.document_delivery_events force row level security/
  );
  assert.match(
    migration,
    /from public\.company_memberships membership[\s\S]*membership\.membership_role in \('owner', 'admin', 'manager'\)/
  );
  assert.doesNotMatch(migration, /public\.membership_role\(company_id\)/);
  assert.match(migration, /prevent_document_delivery_event_updates/);
  assert.match(migration, /prevent_document_delivery_event_deletes/);
});

void test("document delivery migration stays evidence-only and avoids workflow mutation", () => {
  assert.doesNotMatch(migration, /alter table public\.contracts/i);
  assert.doesNotMatch(migration, /contract_signers/i);
  assert.doesNotMatch(migration, /contract_signature_events/i);
  assert.doesNotMatch(migration, /payment_id/i);
  assert.doesNotMatch(migration, /invoice_id/i);
  assert.doesNotMatch(migration, /job_cost/i);
  assert.doesNotMatch(migration, /webhook/i);
  assert.doesNotMatch(migration, /sendgrid|postmark|signwell|stripe/i);
});
