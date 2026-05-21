import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isOperationalCueUrgency,
  isSupportedOperationalCueKey,
  parseOperationalCueThresholdDays
} from "./rule-definitions";

void test("operational cue rule validators reject unsupported keys and unsafe values", () => {
  assert.equal(isSupportedOperationalCueKey("invoice_overdue"), true);
  assert.equal(isSupportedOperationalCueKey("custom_if_then_rule"), false);
  assert.equal(isOperationalCueUrgency("high"), true);
  assert.equal(isOperationalCueUrgency("urgent"), false);
  assert.equal(parseOperationalCueThresholdDays("2"), 2);
  assert.throws(() => parseOperationalCueThresholdDays("31"), /Threshold days/);
});

void test("operational cue RLS hardening migration restricts writes to owner or admin", () => {
  const migration = readFileSync(
    "supabase/migrations/20260509151036_harden_operational_cue_rule_admin_policies.sql",
    "utf8"
  );

  assert.match(
    migration,
    /drop policy if exists organization_operational_cue_rules_insert_by_membership/
  );
  assert.match(
    migration,
    /drop policy if exists organization_operational_cue_rules_update_by_membership/
  );
  assert.match(
    migration,
    /create policy organization_operational_cue_rules_insert_by_admin_scope/
  );
  assert.match(
    migration,
    /create policy organization_operational_cue_rules_update_by_admin_scope/
  );
  assert.match(migration, /membership\.membership_role in \('owner', 'admin'\)/);
});

void test("operational cue owner strategy migration allows starter role strategies only", () => {
  const migration = readFileSync(
    "supabase/migrations/20260509202341_operational_cue_owner_strategy_foundation.sql",
    "utf8"
  );

  assert.match(migration, /'estimator'/);
  assert.match(migration, /'project_manager'/);
  assert.match(migration, /'billing_owner'/);
  assert.match(migration, /'scheduler'/);
  assert.doesNotMatch(migration, /'sales_owner'/);
  assert.doesNotMatch(migration, /'field_lead'/);
  assert.match(migration, /where owner_strategy = 'record_owner'/);
});

void test("responsibility defaults migration is people-first and admin-write scoped", () => {
  const migration = readFileSync(
    "supabase/migrations/20260510031444_organization_responsibility_role_defaults.sql",
    "utf8"
  );

  assert.match(migration, /create table if not exists public\.organization_responsibility_role_defaults/);
  assert.match(migration, /references public\.people\(company_id, id\)/);
  assert.match(migration, /role_key in \('estimator', 'project_manager', 'billing_owner', 'scheduler'\)/);
  assert.doesNotMatch(migration, /sales_owner/);
  assert.doesNotMatch(migration, /field_lead/);
  assert.match(migration, /force row level security/);
  assert.match(migration, /for select\s+to authenticated\s+using \(\(select public\.is_active_company_member\(organization_id\)\)\)/);
  assert.match(migration, /create policy organization_responsibility_role_defaults_insert_by_admin_scope/);
  assert.match(migration, /create policy organization_responsibility_role_defaults_update_by_admin_scope/);
  assert.match(migration, /create policy organization_responsibility_role_defaults_delete_by_admin_scope/);
  assert.match(migration, /membership\.membership_role in \('owner', 'admin'\)/);
});
