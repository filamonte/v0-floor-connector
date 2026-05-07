import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

import {
  STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION,
  evaluateStarterPackProvisioningExecutionEligibility
} from "./starter-pack-provisioning-execution-core";
import type { StarterPackProvisioningDraftReview } from "./starter-pack-provisioning-draft-review-core";

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
    sourceSnapshot: {},
    destinationSnapshot: {},
    reason: null,
    errorMessage: null,
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

function makeRun(
  overrides: Partial<PlatformStarterPackProvisioningRunDetail> = {}
): PlatformStarterPackProvisioningRunDetail {
  const items = overrides.items ?? [makeRunItem()];

  return {
    id: "run-1",
    starterPackId: "pack-1",
    starterPackName: "Residential Pack",
    starterPackKey: "residential-pack",
    organizationId: "org-1",
    organizationName: "Acme Floors",
    organizationSlug: "acme",
    requestedByUserId: "user-1",
    approvedByUserId: "admin-1",
    status: "approved",
    dryRunSnapshot: {},
    confirmationText: "APPROVE DRY RUN ONLY",
    idempotencyKey: "starter-pack-draft:abc",
    requestedAt: "2026-05-07T00:00:00.000Z",
    approvedAt: "2026-05-07T00:05:00.000Z",
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
    updatedAt: "2026-05-07T00:05:00.000Z",
    items,
    ...overrides
  };
}

function makeReview(
  overrides: Partial<StarterPackProvisioningDraftReview> = {}
): StarterPackProvisioningDraftReview {
  return {
    runId: "run-1",
    runStatus: "approved",
    targetOrganizationLabel: "Acme Floors",
    starterPackLabel: "Residential Pack",
    starterPackStatus: "published",
    requestedAt: "2026-05-07T00:00:00.000Z",
    requestedByUserId: "user-1",
    approvedAt: "2026-05-07T00:05:00.000Z",
    approvedByUserId: "admin-1",
    confirmationText: "APPROVE DRY RUN ONLY",
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

function evaluate(input: {
  run?: PlatformStarterPackProvisioningRunDetail;
  review?: StarterPackProvisioningDraftReview;
  confirmationText?: string;
}) {
  return evaluateStarterPackProvisioningExecutionEligibility({
    run: input.run ?? makeRun(),
    review: input.review ?? makeReview(),
    confirmationText:
      input.confirmationText ?? STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION
  });
}

function executionMigrationSql() {
  return readFileSync(
    resolve(
      process.cwd(),
      "supabase/migrations/20260507025730_starter_pack_provisioning_execution.sql"
    ),
    "utf8"
  );
}

void test("allows execution for a fresh approved run with exact confirmation", () => {
  const eligibility = evaluate({});

  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.issues.length, 0);
});

void test("blocks stale execution review", () => {
  const eligibility = evaluate({
    review: makeReview({ freshnessStatus: "stale" })
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("fresh")),
    true
  );
});

void test("blocks unavailable execution review", () => {
  const eligibility = evaluate({
    review: makeReview({ freshnessStatus: "unavailable" })
  });

  assert.equal(eligibility.eligible, false);
});

void test("blocks invalid execution review", () => {
  const eligibility = evaluate({
    review: makeReview({ freshnessStatus: "invalid" })
  });

  assert.equal(eligibility.eligible, false);
});

void test("blocks draft runs", () => {
  const eligibility = evaluate({
    run: makeRun({ status: "draft" }),
    review: makeReview({ runStatus: "draft" })
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("approved")),
    true
  );
});

void test("blocks completed runs from eligibility even though the RPC is idempotent", () => {
  const eligibility = evaluate({
    run: makeRun({
      status: "completed",
      completedAt: "2026-05-07T00:10:00.000Z",
      items: [
        makeRunItem({
          action: "created",
          status: "completed",
          destinationRecordId: "document-template-1"
        })
      ]
    }),
    review: makeReview({ runStatus: "completed" })
  });

  assert.equal(eligibility.eligible, false);
});

void test("blocks blocking review issues", () => {
  const eligibility = evaluate({
    review: makeReview({
      issues: [{ severity: "blocking", message: "Pack is unavailable." }]
    })
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("blocking")),
    true
  );
});

void test("blocks missing or wrong confirmation", () => {
  const missingEligibility = evaluate({ confirmationText: "" });
  const wrongEligibility = evaluate({ confirmationText: "EXECUTE" });

  assert.equal(missingEligibility.eligible, false);
  assert.equal(wrongEligibility.eligible, false);
  assert.equal(
    wrongEligibility.issues.some((issue) =>
      issue.message.includes(STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION)
    ),
    true
  );
});

void test("blocks create items that already have destination ids", () => {
  const eligibility = evaluate({
    run: makeRun({
      items: [makeRunItem({ destinationRecordId: "document-template-1" })]
    })
  });

  assert.equal(eligibility.eligible, false);
  assert.equal(
    eligibility.issues.some((issue) => issue.message.includes("destination ids")),
    true
  );
});

void test("allows skipped existing items before execution", () => {
  const eligibility = evaluate({
    run: makeRun({
      items: [
        makeRunItem({
          action: "skipped_existing",
          status: "skipped",
          destinationSnapshot: {
            matchingExistingRecordId: "document-template-1"
          }
        })
      ]
    })
  });

  assert.equal(eligibility.eligible, true);
});

void test("execution migration returns completed runs idempotently before insert work", () => {
  const sql = executionMigrationSql();
  const completedBranchIndex = sql.indexOf(
    "if v_run.status in ('completed', 'completed_with_warnings') then"
  );
  const firstInsertIndex = sql.indexOf("insert into public.document_templates");

  assert.ok(completedBranchIndex > -1);
  assert.ok(firstInsertIndex > -1);
  assert.ok(completedBranchIndex < firstInsertIndex);
  assert.match(sql, /'alreadyCompleted', true/);
});

void test("execution migration stores destination ids for created and skipped items", () => {
  const sql = executionMigrationSql();

  assert.match(sql, /destination_record_id = v_destination_id/);
  assert.match(sql, /destination_record_id = v_existing_destination_id/);
});

void test("execution migration keeps provisioned records active but not defaults", () => {
  const sql = executionMigrationSql();

  assert.match(sql, /'status', 'active'/);
  assert.match(sql, /'isDefault', false/);
  assert.match(sql, /status,\s+is_default,/);
  assert.match(sql, /'active',\s+false,/);
});

void test("execution migration does not copy catalog vendor or tax profile ids", () => {
  const sql = executionMigrationSql();

  assert.match(sql, /v_catalog_seed\.taxable,\s+null,\s+v_catalog_seed\.category/s);
  assert.match(sql, /'vendorId', null/);
  assert.match(sql, /'taxCodeId', null/);
  assert.match(sql, /p_actor_id,\s+p_actor_id,\s+null/s);
});
