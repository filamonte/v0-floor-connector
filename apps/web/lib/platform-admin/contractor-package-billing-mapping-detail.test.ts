import test from "node:test";
import assert from "node:assert/strict";

import type {
  ContractorPackageBillingMapping,
  ContractorPackageBillingMappingAuditEvent
} from "@floorconnector/types";

import { buildContractorPackageBillingMappingDetail } from "./contractor-package-billing-mapping-detail-core";

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
    expectedProviderStateSnapshot: { expectedStatus: "active", quantity: 1 },
    observedProviderStateSnapshot: { observedStatus: "trialing" },
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
    id: "audit-1",
    contractorPackageBillingMappingId: "mapping-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: "pkg-version-1",
    eventType: "billing_mapping_reviewed",
    actorUserId: null,
    reason: "Operator reviewed provider references.",
    beforeSnapshot: { reconciliationState: "not_started" },
    afterSnapshot: { reconciliationState: "pending_verification" },
    metadata: { source: "platform-admin" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:01.000Z",
    ...overrides
  };
}

void test("builds provider mapping detail with linked assignment company package and version labels", () => {
  const model = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping(),
    auditEvents: [makeAuditEvent()],
    linkedReferences: {
      assignment: {
        id: "assignment-1",
        label: "Acme Floors assignment",
        secondaryLabel: "active"
      },
      company: {
        id: "company-1",
        label: "Acme Floors",
        secondaryLabel: "acme-floors"
      },
      packageDefinition: {
        id: "pkg-1",
        label: "Growth Package",
        secondaryLabel: "growth"
      },
      packageDefinitionVersion: {
        id: "pkg-version-1",
        label: "Version 2",
        secondaryLabel: "published"
      }
    }
  });

  assert.equal(model.found, true);
  assert.equal(model.readOnly, true);
  assert.equal(model.billingProvider, "Stripe");
  assert.equal(model.providerEnvironment, "Test");
  assert.equal(model.assignmentReference.label, "Acme Floors assignment");
  assert.equal(model.companyReference.label, "Acme Floors");
  assert.equal(model.packageDefinitionReference.secondaryLabel, "growth");
  assert.equal(model.packageDefinitionVersionReference.label, "Version 2");
});

void test("surfaces missing linked references and mismatch caveats", () => {
  const model = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping({
      contractorPackageAssignmentId: null,
      companyId: null,
      packageDefinitionId: null,
      packageDefinitionVersionId: null,
      billingState: "mismatch_detected",
      reconciliationState: "mismatch_detected",
      mismatchSummary: "Subscription reference does not match expected package."
    }),
    auditEvents: []
  });

  assert.match(model.caveats.join(" "), /missing a contractor package assignment/);
  assert.match(model.caveats.join(" "), /missing a company reference/);
  assert.match(model.caveats.join(" "), /missing a package definition reference/);
  assert.match(model.mismatchCaveats.join(" "), /Mismatch summary recorded/);
  assert.match(model.mismatchCaveats.join(" "), /mismatch_detected/);
});

void test("summarizes expected observed and mapping snapshots without dumping values", () => {
  const model = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping(),
    auditEvents: [makeAuditEvent()]
  });
  const serialized = JSON.stringify(model);

  assert.match(model.snapshotSections[0]?.summary ?? "", /top-level fields/);
  assert.match(model.snapshotSections[1]?.summary ?? "", /Values are summarized/);
  assert.equal(serialized.includes("\"trialing\""), false);
  assert.equal(serialized.includes("\"platform-admin\""), false);
});

void test("surfaces no audit events caveat and orders audit events by occurrence", () => {
  const emptyAuditModel = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping(),
    auditEvents: []
  });

  assert.match(emptyAuditModel.caveats.join(" "), /No provider mapping audit evidence/);

  const orderedModel = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping(),
    auditEvents: [
      makeAuditEvent({
        id: "audit-old",
        occurredAt: "2026-05-09T12:00:00.000Z",
        createdAt: "2026-05-09T12:00:01.000Z"
      }),
      makeAuditEvent({
        id: "audit-new",
        occurredAt: "2026-05-09T12:30:00.000Z",
        createdAt: "2026-05-09T12:30:01.000Z"
      })
    ]
  });

  assert.equal(orderedModel.auditTimelineRows[0]?.id, "audit-new");
  assert.equal(orderedModel.auditTimelineRows[1]?.id, "audit-old");
});

void test("models archived and unavailable states safely", () => {
  const archived = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping({
      billingState: "archived",
      reconciliationState: "archived",
      archivedAt: "2026-05-09T12:30:00.000Z"
    }),
    auditEvents: [makeAuditEvent()]
  });

  assert.match(archived.caveats.join(" "), /archived/);

  const unavailable = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "not-a-real-mapping",
    mapping: null,
    auditEvents: [],
    unavailableReason: "Provider mapping unavailable."
  });

  assert.equal(unavailable.found, false);
  assert.equal(unavailable.summaryCards[0]?.value, "No");
  assert.match(unavailable.caveats.join(" "), /Provider mapping unavailable/);
});

void test("output contains no mutation action or form descriptor keys", () => {
  const model = buildContractorPackageBillingMappingDetail({
    generatedAt: "2026-05-09T13:00:00.000Z",
    mappingId: "mapping-1",
    mapping: makeMapping(),
    auditEvents: [makeAuditEvent()]
  });
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
  assert.equal(model.actionAvailable, false);
  assert.equal(model.mutationAvailable, false);
  assert.equal(model.billingMutationAvailable, false);
  assert.equal(model.stripeCallAvailable, false);
  assert.equal(model.providerCallAvailable, false);
  assert.equal(model.subscriptionOperationAvailable, false);
  assert.equal(model.billingExecutionAvailable, false);
  assert.equal(model.packageAssignmentEffect, false);
});
