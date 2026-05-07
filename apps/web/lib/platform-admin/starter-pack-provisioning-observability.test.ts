import test from "node:test";
import assert from "node:assert/strict";

import type { PlatformStarterPackProvisioningRun } from "@floorconnector/types";

import type { StarterPackProvisioningDraftReview } from "./starter-pack-provisioning-draft-review-core";
import {
  buildStarterPackProvisioningObservability,
  describeStarterPackProvisioningRunHealth,
  filterStarterPackProvisioningRuns
} from "./starter-pack-provisioning-observability-core";

function makeRun(
  overrides: Partial<PlatformStarterPackProvisioningRun> = {}
): PlatformStarterPackProvisioningRun {
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
    itemCount: 1,
    destinationRecordCount: 0,
    pendingItemCount: 1,
    completedItemCount: 0,
    skippedItemCount: 0,
    blockedItemCount: 0,
    failedItemCount: 0,
    wouldCreateItemCount: 1,
    skippedExistingItemCount: 0,
    createdItemCount: 0,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

function makeReview(
  overrides: Partial<StarterPackProvisioningDraftReview> = {}
): StarterPackProvisioningDraftReview {
  return {
    runId: "run-1",
    runStatus: "draft",
    targetOrganizationLabel: "Acme Floors",
    starterPackLabel: "Residential Pack",
    starterPackStatus: "published",
    requestedAt: "2026-05-07T00:00:00.000Z",
    requestedByUserId: "user-1",
    approvedAt: null,
    approvedByUserId: null,
    confirmationText: null,
    itemSummary: {
      draftItemCount: 1,
      currentItemCount: 1,
      unchangedCount: 1,
      changedCount: 0,
      missingFromCurrentCount: 0,
      addedInCurrentCount: 0,
      invalidNowCount: 0
    },
    freshnessStatus: "fresh",
    issues: [
      {
        severity: "info",
        message: "The stored draft currently matches the fresh server-side dry run."
      }
    ],
    itemComparisons: [],
    note: "Review only.",
    ...overrides
  };
}

void test("summarizes completed runs and destination-linked audit records", () => {
  const completedRun = makeRun({
    id: "completed-run",
    status: "completed",
    completedAt: "2026-05-07T00:30:00.000Z",
    destinationRecordCount: 2,
    completedItemCount: 2,
    pendingItemCount: 0,
    createdItemCount: 2
  });
  const model = buildStarterPackProvisioningObservability({
    runs: [completedRun]
  });

  assert.equal(model.summary.totalRuns, 1);
  assert.equal(model.summary.completedCount, 1);
  assert.equal(model.summary.runsWithDestinationRecordsCount, 1);
  assert.equal(model.summary.lastCompletedRunTimestamp, completedRun.completedAt);
  assert.equal(model.runs[0]?.health.health, "completed");
});

void test("counts draft and approved audit runs without marking them written", () => {
  const model = buildStarterPackProvisioningObservability({
    runs: [
      makeRun({ id: "draft-run", status: "draft" }),
      makeRun({
        id: "approved-run",
        status: "approved",
        approvedAt: "2026-05-07T00:15:00.000Z"
      })
    ]
  });

  assert.equal(model.summary.draftCount, 1);
  assert.equal(model.summary.approvedCount, 1);
  assert.equal(model.summary.completedCount, 0);
});

void test("maps stale review to attention-needed state and filter", () => {
  const run = makeRun({ id: "stale-run", status: "approved" });
  const model = buildStarterPackProvisioningObservability({
    runs: [run],
    reviewsByRunId: {
      "stale-run": makeReview({
        runId: "stale-run",
        runStatus: "approved",
        freshnessStatus: "stale",
        issues: [{ severity: "warning", message: "The stored draft is stale." }]
      })
    }
  });
  const attentionRuns = filterStarterPackProvisioningRuns({
    model,
    filter: "attention"
  });

  assert.equal(model.summary.staleOrBlockedReviewCount, 1);
  assert.equal(model.runs[0]?.health.health, "stale");
  assert.equal(attentionRuns.length, 1);
});

void test("failed run health exposes safe failed status and message", () => {
  const health = describeStarterPackProvisioningRunHealth({
    run: makeRun({
      status: "failed",
      errorMessage: "Execution failed before tenant writes completed."
    })
  });

  assert.equal(health.health, "failed");
  assert.equal(health.label, "Failed");
  assert.match(health.note, /Execution failed/);
});

void test("blocking review maps to execution unavailable", () => {
  const run = makeRun({ id: "blocked-run", status: "approved" });
  const model = buildStarterPackProvisioningObservability({
    runs: [run],
    reviewsByRunId: {
      "blocked-run": makeReview({
        runId: "blocked-run",
        runStatus: "approved",
        freshnessStatus: "invalid",
        issues: [{ severity: "blocking", message: "The pack is archived." }]
      })
    }
  });

  assert.equal(model.runs[0]?.health.health, "execution_unavailable");
  assert.equal(model.summary.staleOrBlockedReviewCount, 1);
});
