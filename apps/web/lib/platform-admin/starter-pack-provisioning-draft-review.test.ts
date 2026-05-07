import test from "node:test";
import assert from "node:assert/strict";

import {
  STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION,
  buildStarterPackProvisioningDraftReview,
  evaluateStarterPackProvisioningApprovalEligibility,
  type StarterPackProvisioningDraftReview
} from "./starter-pack-provisioning-draft-review-core";
import type {
  StarterPackProvisioningDryRunReport,
  StarterPackProvisioningDryRunRow
} from "./starter-pack-provisioning-dry-run-core";
import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

function makeDryRunRow(
  overrides: Partial<StarterPackProvisioningDryRunRow> = {}
): StarterPackProvisioningDryRunRow {
  return {
    starterPackItemId: "pack-item-1",
    sourceItemType: "template_seed",
    sourceId: "template-seed-1",
    sourceName: "Residential Estimate",
    destinationType: "document_template",
    action: "would_create",
    reason: "No existing template was found.",
    sourceStatus: "active",
    sourceType: "estimate",
    sourceCategory: null,
    matchingExistingRecordId: null,
    matchType: "none",
    isRequired: true,
    ...overrides
  };
}

function makeDryRunReport(
  rows: StarterPackProvisioningDryRunRow[],
  overrides: Partial<StarterPackProvisioningDryRunReport> = {}
): StarterPackProvisioningDryRunReport {
  return {
    organization: {
      id: "org-1",
      name: "Acme Floors",
      slug: "acme"
    },
    starterPack: {
      id: "pack-1",
      packKey: "residential-pack",
      name: "Residential Pack",
      status: "published"
    },
    wouldCreateTemplateCount: rows.filter(
      (row) =>
        row.action === "would_create" &&
        row.destinationType === "document_template"
    ).length,
    wouldCreateCatalogItemCount: rows.filter(
      (row) =>
        row.action === "would_create" && row.destinationType === "catalog_item"
    ).length,
    alreadyExistsCount: rows.filter((row) => row.action === "already_exists")
      .length,
    blockedCount: rows.filter((row) => row.action === "blocked").length,
    unavailableCount: rows.filter((row) => row.action === "unavailable").length,
    rows,
    note: "Dry run only.",
    ...overrides
  };
}

function makeRunItem(
  overrides: Partial<PlatformStarterPackProvisioningRunItem> = {}
): PlatformStarterPackProvisioningRunItem {
  return {
    id: "run-item-1",
    runId: "run-1",
    starterPackItemId: "pack-item-1",
    sourceItemType: "template_seed",
    sourceTemplateSeedId: "template-seed-1",
    sourceCatalogSeedId: null,
    destinationRecordType: "document_template",
    destinationRecordId: null,
    action: "would_create",
    status: "pending",
    sourceSnapshot: {
      sourceName: "Residential Estimate",
      sourceStatus: "active"
    },
    destinationSnapshot: {
      matchingExistingRecordId: null,
      dryRunAction: "would_create"
    },
    reason: "No existing template was found.",
    errorMessage: null,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

function makeRun(
  items: PlatformStarterPackProvisioningRunItem[],
  overrides: Partial<PlatformStarterPackProvisioningRunDetail> = {}
): PlatformStarterPackProvisioningRunDetail {
  return {
    id: "run-1",
    starterPackId: "pack-1",
    starterPackName: "Residential Pack",
    starterPackKey: "residential-pack",
    organizationId: "org-1",
    organizationName: "Acme Floors",
    organizationSlug: "acme",
    requestedByUserId: "user-1",
    approvedByUserId: null,
    status: "draft",
    dryRunSnapshot: {},
    confirmationText: null,
    idempotencyKey: "starter-pack-draft:abc",
    requestedAt: "2026-05-07T00:00:00.000Z",
    approvedAt: null,
    startedAt: null,
    completedAt: null,
    voidedAt: null,
    voidedByUserId: null,
    voidReason: null,
    voidStrategy: null,
    voidReadinessSnapshot: {},
    errorMessage: null,
    itemCount: items.length,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    items,
    ...overrides
  };
}

function reviewWith(
  runItems: PlatformStarterPackProvisioningRunItem[],
  dryRunRows: StarterPackProvisioningDryRunRow[],
  reportOverrides: Partial<StarterPackProvisioningDryRunReport> = {}
): StarterPackProvisioningDraftReview {
  return buildStarterPackProvisioningDraftReview({
    run: makeRun(runItems),
    currentDryRun: makeDryRunReport(dryRunRows, reportOverrides)
  });
}

void test("reports a fresh draft when stored items match the current dry run", () => {
  const review = reviewWith([makeRunItem()], [makeDryRunRow()]);

  assert.equal(review.freshnessStatus, "fresh");
  assert.equal(review.itemSummary.unchangedCount, 1);
  assert.equal(review.itemComparisons[0]?.comparisonStatus, "unchanged");
});

void test("reports invalid when a published pack is now archived", () => {
  const review = reviewWith([makeRunItem()], [makeDryRunRow()], {
    starterPack: {
      id: "pack-1",
      packKey: "residential-pack",
      name: "Residential Pack",
      status: "archived"
    }
  });

  assert.equal(review.freshnessStatus, "invalid");
  assert.equal(
    review.issues.some((issue) => issue.severity === "blocking"),
    true
  );
});

void test("reports stale when a starter-pack item was removed", () => {
  const review = reviewWith([makeRunItem()], []);

  assert.equal(review.freshnessStatus, "stale");
  assert.equal(review.itemSummary.missingFromCurrentCount, 1);
});

void test("reports stale when a starter-pack item was added", () => {
  const review = reviewWith(
    [makeRunItem()],
    [
      makeDryRunRow(),
      makeDryRunRow({
        starterPackItemId: "pack-item-2",
        sourceId: "template-seed-2",
        sourceName: "Commercial Estimate"
      })
    ]
  );

  assert.equal(review.freshnessStatus, "stale");
  assert.equal(review.itemSummary.addedInCurrentCount, 1);
});

void test("reports stale when an action changed from would-create to already-exists", () => {
  const review = reviewWith(
    [makeRunItem()],
    [
      makeDryRunRow({
        action: "already_exists",
        matchingExistingRecordId: "document-template-1",
        matchType: "source_linkage"
      })
    ]
  );

  assert.equal(review.freshnessStatus, "stale");
  assert.equal(review.itemSummary.changedCount, 1);
});

void test("reports invalid when a source seed is no longer available", () => {
  const review = reviewWith(
    [makeRunItem()],
    [
      makeDryRunRow({
        action: "unavailable",
        sourceStatus: "missing",
        sourceName: "Missing platform seed"
      })
    ]
  );

  assert.equal(review.freshnessStatus, "invalid");
  assert.equal(review.itemSummary.invalidNowCount, 1);
});

void test("allows approval eligibility for a fresh draft with exact confirmation", () => {
  const review = reviewWith([makeRunItem()], [makeDryRunRow()]);
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
  });

  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.issues.length, 0);
});

void test("blocks approval eligibility for stale drafts", () => {
  const review = reviewWith([makeRunItem()], []);
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("fresh")),
    true
  );
});

void test("blocks approval eligibility for invalid drafts", () => {
  const review = reviewWith(
    [makeRunItem()],
    [makeDryRunRow({ action: "unavailable", sourceStatus: "missing" })]
  );
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("fresh")),
    true
  );
});

void test("blocks approval eligibility for non-draft runs", () => {
  const review = buildStarterPackProvisioningDraftReview({
    run: makeRun([makeRunItem()], { status: "approved" }),
    currentDryRun: makeDryRunReport([makeDryRunRow()])
  });
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("draft")),
    true
  );
});

void test("blocks approval eligibility when review has blocking issues", () => {
  const review = reviewWith([makeRunItem()], [makeDryRunRow()], {
    starterPack: null
  });
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("blocking")),
    true
  );
});

void test("blocks approval eligibility when confirmation is missing", () => {
  const review = reviewWith([makeRunItem()], [makeDryRunRow()]);
  const eligibility = evaluateStarterPackProvisioningApprovalEligibility({
    review,
    confirmationText: ""
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) =>
      issue.message.includes(STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION)
    ),
    true
  );
});
