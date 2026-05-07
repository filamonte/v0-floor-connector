import assert from "node:assert/strict";
import test from "node:test";

import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

import {
  evaluateStarterPackProvisioningVoidEligibility,
  STARTER_PACK_PROVISIONING_VOID_CONFIRMATION
} from "./starter-pack-provisioning-void-eligibility-core";
import {
  buildStarterPackProvisioningVoidReadiness,
  type StarterPackProvisioningDestinationUsageFacts
} from "./starter-pack-provisioning-void-readiness-core";

const templateDestinationId = "11111111-1111-4111-8111-111111111111";

function baseItem(
  overrides: Partial<PlatformStarterPackProvisioningRunItem> = {}
): PlatformStarterPackProvisioningRunItem {
  return {
    id: "item-template",
    runId: "run-1",
    starterPackItemId: "pack-item-template",
    sourceItemType: "template_seed",
    sourceTemplateSeedId: "template-seed-1",
    sourceCatalogSeedId: null,
    destinationRecordType: "document_template",
    destinationRecordId: templateDestinationId,
    action: "created",
    status: "completed",
    sourceSnapshot: {},
    destinationSnapshot: {},
    reason: null,
    errorMessage: null,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

function baseRun(
  overrides: Partial<PlatformStarterPackProvisioningRunDetail> = {}
): PlatformStarterPackProvisioningRunDetail {
  const items = overrides.items ?? [baseItem()];

  return {
    id: "run-1",
    starterPackId: "pack-1",
    starterPackName: "QA Starter Pack",
    starterPackKey: "qa-starter-pack",
    organizationId: "org-1",
    organizationName: "QA Org",
    organizationSlug: "qa-org",
    requestedByUserId: null,
    approvedByUserId: null,
    status: "completed",
    dryRunSnapshot: {},
    confirmationText: null,
    idempotencyKey: null,
    requestedAt: "2026-05-07T00:00:00.000Z",
    approvedAt: null,
    startedAt: null,
    completedAt: "2026-05-07T00:00:00.000Z",
    voidedAt: null,
    voidedByUserId: null,
    voidReason: null,
    voidStrategy: null,
    voidReadinessSnapshot: {},
    errorMessage: null,
    itemCount: items.length,
    destinationRecordCount: items.filter((item) => item.destinationRecordId)
      .length,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    items,
    ...overrides
  };
}

function readinessFor(
  run: PlatformStarterPackProvisioningRunDetail,
  usageFacts: StarterPackProvisioningDestinationUsageFacts = {
    documentTemplates: {
      [templateDestinationId]: {
        destinationExists: true,
        usageCounts: {}
      }
    }
  }
) {
  return buildStarterPackProvisioningVoidReadiness({
    run,
    usageFacts
  });
}

void test("completed run with usage readiness is eligible for future audit-only void", () => {
  const run = baseRun();
  const result = evaluateStarterPackProvisioningVoidEligibility({
    run,
    usageReadiness: readinessFor(run)
  });

  assert.equal(result.eligible, true);
  assert.equal(result.status, "eligible");
  assert.equal(result.recommendedStrategy, "audit_only");
  assert.equal(result.confirmationPhrase, STARTER_PACK_PROVISIONING_VOID_CONFIRMATION);
  assert.equal(result.requiredMetadata.voidReasonRequired, true);
  assert.equal(result.requiredMetadata.voidReadinessSnapshotRequired, true);
});

void test("completed_with_warnings run is eligible when usage readiness is available", () => {
  const run = baseRun({ status: "completed_with_warnings" });
  const result = evaluateStarterPackProvisioningVoidEligibility({
    run,
    usageReadiness: readinessFor(run)
  });

  assert.equal(result.eligible, true);
  assert.equal(result.status, "eligible");
});

void test("draft approved running and failed runs are blocked", () => {
  for (const status of ["draft", "approved", "running", "failed"] as const) {
    const run = baseRun({ status });
    const result = evaluateStarterPackProvisioningVoidEligibility({
      run,
      usageReadiness: readinessFor(run)
    });

    assert.equal(result.eligible, false);
    assert.equal(result.status, "blocked");
    assert.equal(
      result.issues.some((issue) => issue.severity === "blocking"),
      true
    );
  }
});

void test("voided run returns already_voided without eligibility", () => {
  const run = baseRun({
    status: "voided",
    voidedAt: "2026-05-07T01:00:00.000Z",
    voidStrategy: "audit_only"
  });
  const result = evaluateStarterPackProvisioningVoidEligibility({
    run,
    usageReadiness: readinessFor(run)
  });

  assert.equal(result.eligible, false);
  assert.equal(result.status, "already_voided");
});

void test("run with no items or destinations is blocked", () => {
  const run = baseRun({
    items: [],
    itemCount: 0,
    destinationRecordCount: 0
  });
  const result = evaluateStarterPackProvisioningVoidEligibility({
    run,
    usageReadiness: readinessFor(run)
  });

  assert.equal(result.eligible, false);
  assert.equal(result.status, "blocked");
});

void test("missing and unknown usage are warnings but still eligible for audit-only void", () => {
  const missingRun = baseRun({
    items: [baseItem({ destinationRecordId: null })]
  });
  const missingResult = evaluateStarterPackProvisioningVoidEligibility({
    run: missingRun,
    usageReadiness: readinessFor(missingRun, {})
  });

  assert.equal(missingResult.eligible, true);
  assert.equal(
    missingResult.issues.some((issue) => issue.severity === "warning"),
    true
  );

  const unknownRun = baseRun();
  const unknownResult = evaluateStarterPackProvisioningVoidEligibility({
    run: unknownRun,
    usageReadiness: readinessFor(unknownRun, {
      documentTemplates: {
        [templateDestinationId]: {
          destinationExists: null,
          usageCounts: {}
        }
      }
    })
  });

  assert.equal(unknownResult.eligible, true);
  assert.equal(
    unknownResult.issues.some((issue) => issue.severity === "warning"),
    true
  );
});

void test("archive and detach strategies are unavailable future-only paths", () => {
  const run = baseRun();
  const result = evaluateStarterPackProvisioningVoidEligibility({
    run,
    usageReadiness: readinessFor(run)
  });

  assert.deepEqual(result.unavailableStrategies, [
    "archive_unused_future",
    "detach_lineage_future"
  ]);
  assert.equal(
    result.issues.some((issue) =>
      issue.message.includes("Archive, delete, and detach-lineage")
    ),
    true
  );
});
