import assert from "node:assert/strict";
import test from "node:test";

import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

import {
  buildStarterPackProvisioningVoidReadiness,
  type StarterPackProvisioningDestinationUsageFacts
} from "./starter-pack-provisioning-void-readiness-core";

const templateDestinationId = "11111111-1111-4111-8111-111111111111";
const catalogDestinationId = "22222222-2222-4222-8222-222222222222";

function baseRun(
  overrides: Partial<PlatformStarterPackProvisioningRunDetail> = {}
): PlatformStarterPackProvisioningRunDetail {
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
    itemCount: overrides.items?.length ?? 1,
    destinationRecordCount: overrides.items?.length ?? 1,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    items: [
      {
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
        updatedAt: "2026-05-07T00:00:00.000Z"
      }
    ],
    ...overrides
  };
}

function catalogItem(
  overrides: Partial<PlatformStarterPackProvisioningRunItem> = {}
): PlatformStarterPackProvisioningRunItem {
  return {
    id: "item-catalog",
    runId: "run-1",
    starterPackItemId: "pack-item-catalog",
    sourceItemType: "catalog_seed",
    sourceTemplateSeedId: null,
    sourceCatalogSeedId: "catalog-seed-1",
    destinationRecordType: "catalog_item",
    destinationRecordId: catalogDestinationId,
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

void test("completed run with unused created destinations can be considered for audit-only void and archive-unused review", () => {
  const usageFacts: StarterPackProvisioningDestinationUsageFacts = {
    documentTemplates: {
      [templateDestinationId]: {
        destinationExists: true,
        usageCounts: {
          estimates: 0,
          invoices: 0,
          contracts: 0,
          estimateCommercialSnapshots: 0,
          organizationWorkflowSettings: 0,
          userEstimateTemplatePreferences: 0,
          activeDefaults: 0
        }
      }
    }
  };

  const result = buildStarterPackProvisioningVoidReadiness({
    run: baseRun(),
    usageFacts
  });

  assert.equal(result.canConsiderAuditOnlyVoid, true);
  assert.equal(result.canConsiderArchiveUnused, true);
  assert.equal(result.blockingUsageCount, 0);
  assert.equal(result.warningCount, 0);
  assert.equal(result.rows[0]?.usageStatus, "unused");
});

void test("used document template destination blocks archive-unused consideration", () => {
  const result = buildStarterPackProvisioningVoidReadiness({
    run: baseRun(),
    usageFacts: {
      documentTemplates: {
        [templateDestinationId]: {
          destinationExists: true,
          usageCounts: {
            estimates: 2,
            invoices: 0,
            contracts: 0,
            estimateCommercialSnapshots: 1
          }
        }
      }
    }
  });

  assert.equal(result.canConsiderAuditOnlyVoid, true);
  assert.equal(result.canConsiderArchiveUnused, false);
  assert.equal(result.blockingUsageCount, 1);
  assert.equal(result.rows[0]?.usageStatus, "used");
  assert.equal(result.rows[0]?.severity, "blocking");
});

void test("used catalog item destination blocks archive-unused consideration", () => {
  const run = baseRun({
    items: [catalogItem()]
  });
  const result = buildStarterPackProvisioningVoidReadiness({
    run,
    usageFacts: {
      catalogItems: {
        [catalogDestinationId]: {
          destinationExists: true,
          usageCounts: {
            estimateLineItems: 1,
            invoiceLineItems: 0,
            estimateCommercialSnapshotItems: 0
          }
        }
      }
    }
  });

  assert.equal(result.canConsiderArchiveUnused, false);
  assert.equal(result.blockingUsageCount, 1);
  assert.equal(result.rows[0]?.usageStatus, "used");
});

void test("missing created destination is blocking", () => {
  const run = baseRun({
    items: [
      {
        ...baseRun().items[0],
        destinationRecordId: null
      }
    ]
  });
  const result = buildStarterPackProvisioningVoidReadiness({
    run,
    usageFacts: {}
  });

  assert.equal(result.canConsiderArchiveUnused, false);
  assert.equal(result.blockingUsageCount, 1);
  assert.equal(result.rows[0]?.usageStatus, "missing_destination");
});

void test("unknown usage is blocking for archive-unused decisions", () => {
  const result = buildStarterPackProvisioningVoidReadiness({
    run: baseRun(),
    usageFacts: {
      documentTemplates: {
        [templateDestinationId]: {
          destinationExists: null,
          usageCounts: {}
        }
      }
    }
  });

  assert.equal(result.canConsiderArchiveUnused, false);
  assert.equal(result.blockingUsageCount, 1);
  assert.equal(result.rows[0]?.usageStatus, "unknown");
});

void test("non-completed runs cannot be considered for archive-unused", () => {
  const result = buildStarterPackProvisioningVoidReadiness({
    run: baseRun({ status: "approved" }),
    usageFacts: {
      documentTemplates: {
        [templateDestinationId]: {
          destinationExists: true,
          usageCounts: {}
        }
      }
    }
  });

  assert.equal(result.canConsiderAuditOnlyVoid, false);
  assert.equal(result.canConsiderArchiveUnused, false);
});
