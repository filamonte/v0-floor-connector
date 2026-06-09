import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "../../supabase/migrations/20260609143000_contract_payment_requirements.sql",
  "utf8"
);

void test("contract payment requirements stay contract-owned and tenant scoped", () => {
  assert.match(
    migration,
    /create table if not exists public\.contract_payment_requirements/i
  );
  assert.match(
    migration,
    /company_id uuid not null references public\.companies/i
  );
  assert.match(migration, /foreign key \(company_id, contract_id\)/i);
  assert.match(migration, /references public\.contracts\(company_id, id\)/i);
  assert.match(
    migration,
    /alter table public\.contract_payment_requirements enable row level security/i
  );
  assert.match(migration, /public\.is_active_company_member\(company_id\)/i);
});

void test("contract payment requirements reuse canonical invoice evidence without payment truth", () => {
  assert.match(migration, /linked_invoice_id uuid/i);
  assert.match(migration, /references public\.invoices\(company_id, id\)/i);
  assert.match(
    migration,
    /Linked invoice must stay on the same customer and project/i
  );
  assert.doesNotMatch(migration, /paid_at/i);
  assert.doesNotMatch(migration, /payment_status/i);
  assert.doesNotMatch(migration, /checkout/i);
});

void test("contract payment requirements preserve future AIA as placeholder only", () => {
  assert.match(migration, /progress_billing_placeholder/i);
  assert.doesNotMatch(migration, /pay_application/i);
  assert.doesNotMatch(migration, /continuation_sheet/i);
  assert.doesNotMatch(migration, /g702|g703/i);
});
