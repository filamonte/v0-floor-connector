import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ContractorPackageBillingMapping,
  ContractorPackageBillingMappingAuditEvent
} from "@floorconnector/types";

import {
  buildContractorPackageBillingMappingReadModel,
  type ContractorPackageBillingMappingReadModelInput
} from "./contractor-package-billing-mapping-read-model-core";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260509183549_contractor_package_billing_mappings.sql"
);

function makeMapping(
  overrides: Partial<ContractorPackageBillingMapping> = {}
): ContractorPackageBillingMapping {
  return {
    id: "mapping-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: "pkg-version-1",
    billingProvider: "stripe",
    providerEnvironment: "test",
    providerCustomerReference: "cus_test_123",
    providerProductReference: "prod_test_123",
    providerPriceReference: "price_test_123",
    providerSubscriptionReference: "sub_test_123",
    providerSubscriptionItemReference: "si_test_123",
    billingState: "mapped",
    reconciliationState: "pending_verification",
    trialOrEarlyAccessState: "trial",
    customOrGrandfatheredTermsMarker: "none",
    expectedProviderStateSnapshot: { status: "active", quantity: 1 },
    observedProviderStateSnapshot: { status: "trialing" },
    mappingSnapshot: { source: "manual" },
    mismatchSummary: null,
    lastVerifiedAt: null,
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    archivedAt: null,
    ...overrides
  };
}

function makeAuditEvent(
  overrides: Partial<ContractorPackageBillingMappingAuditEvent> = {}
): ContractorPackageBillingMappingAuditEvent {
  return {
    id: "mapping-audit-1",
    contractorPackageBillingMappingId: "mapping-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: "pkg-version-1",
    eventType: "billing_mapping_reviewed",
    actorUserId: null,
    reason: "Read-only reconciliation evidence.",
    beforeSnapshot: { reconciliationState: "not_started" },
    afterSnapshot: { reconciliationState: "pending_verification" },
    metadata: { source: "platform-admin" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:01.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<ContractorPackageBillingMappingReadModelInput> = {}
): ContractorPackageBillingMappingReadModelInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    mappings: [makeMapping()],
    auditEvents: [makeAuditEvent()],
    ...overrides
  };
}

void test("builds empty provider mapping state safely", () => {
  const model = buildContractorPackageBillingMappingReadModel(
    makeInput({ mappings: [], auditEvents: [] })
  );
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(model.readOnly, true);
  assert.equal(model.actionAvailable, false);
  assert.equal(model.mutationAvailable, false);
  assert.equal(model.billingMutationAvailable, false);
  assert.equal(model.stripeCallAvailable, false);
  assert.equal(model.subscriptionOperationAvailable, false);
  assert.equal(model.entitlementEffect, false);
  assert.equal(model.moduleEffect, false);
  assert.equal(model.runtimeEffect, false);
  assert.equal(model.packageAssignmentEffect, false);
  assert.equal(byId.get("provider-mapping-count")?.value, 0);
  assert.match(model.mismatchCaveats.join(" "), /No provider mapping records/);
});

void test("groups provider and environment buckets", () => {
  const model = buildContractorPackageBillingMappingReadModel(
    makeInput({
      mappings: [
        makeMapping({ id: "mapping-1", billingProvider: "stripe", providerEnvironment: "test" }),
        makeMapping({
          id: "mapping-2",
          billingProvider: "stripe",
          providerEnvironment: "production"
        }),
        makeMapping({
          id: "mapping-3",
          billingProvider: "manual_review",
          providerEnvironment: "unknown"
        })
      ]
    })
  );
  const providers = new Map(model.providerBuckets.map((bucket) => [bucket.key, bucket.count]));
  const environments = new Map(
    model.environmentBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(providers.get("stripe"), 2);
  assert.equal(providers.get("manual_review"), 1);
  assert.equal(environments.get("test"), 1);
  assert.equal(environments.get("production"), 1);
  assert.equal(environments.get("unknown"), 1);
});

void test("groups billing and reconciliation state buckets", () => {
  const model = buildContractorPackageBillingMappingReadModel(
    makeInput({
      mappings: [
        makeMapping({
          id: "mapping-1",
          billingState: "mapped",
          reconciliationState: "pending_verification"
        }),
        makeMapping({
          id: "mapping-2",
          billingState: "verified",
          reconciliationState: "verified"
        }),
        makeMapping({
          id: "mapping-3",
          billingState: "mismatch_detected",
          reconciliationState: "support_review_required",
          mismatchSummary: "Expected test subscription but observed none."
        })
      ]
    })
  );
  const billingStates = new Map(
    model.billingStateBuckets.map((bucket) => [bucket.key, bucket.count])
  );
  const reconciliationStates = new Map(
    model.reconciliationStateBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(billingStates.get("mapped"), 1);
  assert.equal(billingStates.get("verified"), 1);
  assert.equal(billingStates.get("mismatch_detected"), 1);
  assert.equal(reconciliationStates.get("pending_verification"), 1);
  assert.equal(reconciliationStates.get("verified"), 1);
  assert.equal(reconciliationStates.get("support_review_required"), 1);
});

void test("surfaces mismatch and missing reference caveats", () => {
  const model = buildContractorPackageBillingMappingReadModel(
    makeInput({
      mappings: [
        makeMapping({
          contractorPackageAssignmentId: null,
          companyId: null,
          packageDefinitionId: null,
          packageDefinitionVersionId: null,
          billingState: "mismatch_detected",
          reconciliationState: "mismatch_detected",
          providerEnvironment: "unknown",
          mismatchSummary: "Provider subscription does not match expected package."
        })
      ],
      auditEvents: []
    })
  );
  const row = model.mappingRows[0];

  assert.match(row?.caveats.join(" ") ?? "", /Missing contractor package assignment/);
  assert.match(row?.caveats.join(" ") ?? "", /Missing company/);
  assert.match(row?.caveats.join(" ") ?? "", /Missing package definition/);
  assert.match(row?.caveats.join(" ") ?? "", /mismatch/);
  assert.match(model.mismatchCaveats.join(" "), /need mismatch or support-review attention/);
});

void test("summarizes expected observed and mapping snapshots without dumping raw values", () => {
  const model = buildContractorPackageBillingMappingReadModel(makeInput());
  const row = model.mappingRows[0];
  const serialized = JSON.stringify(model);

  assert.match(row?.expectedProviderStateSummary ?? "", /top-level fields/);
  assert.match(row?.observedProviderStateSummary ?? "", /Values are summarized/);
  assert.match(row?.mappingSnapshotSummary ?? "", /top-level field/);
  assert.equal(serialized.includes("\"trialing\""), false);
  assert.equal(serialized.includes("\"platform-admin\""), false);
});

void test("orders provider mapping audit rows by occurrence then creation", () => {
  const model = buildContractorPackageBillingMappingReadModel(
    makeInput({
      auditEvents: [
        makeAuditEvent({
          id: "audit-old",
          eventType: "billing_mapping_created",
          occurredAt: "2026-05-09T12:00:00.000Z",
          createdAt: "2026-05-09T12:00:01.000Z"
        }),
        makeAuditEvent({
          id: "audit-new",
          eventType: "billing_mapping_verified",
          occurredAt: "2026-05-09T12:10:00.000Z",
          createdAt: "2026-05-09T12:10:01.000Z"
        })
      ]
    })
  );

  assert.equal(model.auditRows[0]?.id, "audit-new");
  assert.equal(model.auditRows[1]?.id, "audit-old");
});

void test("output contains no mutation action or form descriptor keys", () => {
  const model = buildContractorPackageBillingMappingReadModel(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
  assert.equal(model.actionAvailable, false);
  assert.equal(model.billingMutationAvailable, false);
  assert.equal(model.stripeCallAvailable, false);
  assert.equal(model.subscriptionOperationAvailable, false);
});

void test("migration constrains provider mapping schema and keeps tables server-only", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /create table if not exists public\.contractor_package_billing_mappings/);
  assert.match(migration, /create table if not exists public\.contractor_package_billing_mapping_audit_events/);
  assert.match(migration, /billing_provider in \('stripe', 'manual_review', 'unknown'\)/);
  assert.match(migration, /provider_environment in \('sandbox', 'test', 'production', 'unknown'\)/);
  assert.match(migration, /'mismatch_detected'/);
  assert.match(migration, /jsonb_typeof\(expected_provider_state_snapshot\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(observed_provider_state_snapshot\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(mapping_snapshot\) = 'object'/);
  assert.match(migration, /alter table public\.contractor_package_billing_mappings force row level security/);
  assert.match(migration, /alter table public\.contractor_package_billing_mapping_audit_events force row level security/);
  assert.match(migration, /revoke all on table public\.contractor_package_billing_mappings from authenticated/);
  assert.match(migration, /revoke all on table public\.contractor_package_billing_mapping_audit_events from authenticated/);
  assert.doesNotMatch(migration, /create or replace function/i);
  assert.doesNotMatch(migration, /security definer/i);
});
