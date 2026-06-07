import assert from "node:assert/strict";
import test from "node:test";

import { verifyFinancialCloseoutCollectionsBoundary } from "./financial-closeout-collections";

void test("financial closeout verification passes canonical visibility-only work", () => {
  const summary = verifyFinancialCloseoutCollectionsBoundary({
    canonicalSources: ["invoices", "payments", "payment_events"],
    addedTables: [],
    migrationFiles: [],
    providerChanges: [],
    accountingReplacementModules: []
  });

  assert.equal(summary.status, "verified");
  assert.deepEqual(
    summary.findings.map((finding) => finding.status),
    ["pass", "pass", "pass", "pass", "pass"]
  );
});

void test("financial closeout verification blocks duplicate payment or AR models", () => {
  const summary = verifyFinancialCloseoutCollectionsBoundary({
    canonicalSources: ["invoices", "payments", "payment_events"],
    addedTables: ["payment_states", "accounts_receivable"]
  });

  assert.equal(summary.status, "blocked");
  assert.match(
    summary.findings.find(
      (finding) => finding.id === "no-duplicate-financial-models"
    )?.message ?? "",
    /accounts_receivable, payment_states/
  );
});

void test("financial closeout verification blocks migrations and accounting replacement", () => {
  const summary = verifyFinancialCloseoutCollectionsBoundary({
    canonicalSources: ["invoices", "payments"],
    migrationFiles: ["supabase/migrations/20260607000000_ar_tables.sql"],
    accountingReplacementModules: ["ledger_entries"],
    providerChanges: ["stripe-webhook-handler"]
  });

  assert.equal(summary.status, "blocked");
  assert.equal(
    summary.findings.find(
      (finding) => finding.id === "canonical-financial-sources"
    )?.status,
    "fail"
  );
  assert.equal(
    summary.findings.find(
      (finding) => finding.id === "no-financial-schema-drift"
    )?.status,
    "fail"
  );
  assert.equal(
    summary.findings.find((finding) => finding.id === "no-provider-changes")
      ?.status,
    "fail"
  );
});
