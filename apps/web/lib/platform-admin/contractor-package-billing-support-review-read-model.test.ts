import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ContractorPackageBillingSupportReview,
  ContractorPackageBillingSupportReviewEvent
} from "@floorconnector/types";

import { buildContractorPackageBillingSupportReviewReadModel } from "./contractor-package-billing-support-review-read-model-core";

const now = "2026-05-09T12:00:00.000Z";
const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260510031202_contractor_package_billing_support_reviews.sql"
);

function supportReview(
  overrides: Partial<ContractorPackageBillingSupportReview> = {}
): ContractorPackageBillingSupportReview {
  return {
    id: overrides.id ?? "review-1",
    contractorPackageBillingMappingId:
      "contractorPackageBillingMappingId" in overrides
        ? (overrides.contractorPackageBillingMappingId ?? null)
        : "mapping-1",
    contractorPackageAssignmentId:
      "contractorPackageAssignmentId" in overrides
        ? (overrides.contractorPackageAssignmentId ?? null)
        : "assignment-1",
    companyId:
      "companyId" in overrides ? (overrides.companyId ?? null) : "company-1",
    packageDefinitionId:
      "packageDefinitionId" in overrides
        ? (overrides.packageDefinitionId ?? null)
        : "definition-1",
    packageDefinitionVersionId:
      "packageDefinitionVersionId" in overrides
        ? (overrides.packageDefinitionVersionId ?? null)
        : "version-1",
    reviewStatus: overrides.reviewStatus ?? "pending_review",
    resolutionCategory:
      overrides.resolutionCategory ?? "provider_state_mismatch",
    providerEnvironment: overrides.providerEnvironment ?? "test",
    providerReferenceSummary: overrides.providerReferenceSummary ?? null,
    reconciliationEvidenceSnapshot:
      overrides.reconciliationEvidenceSnapshot ?? null,
    webhookEvidenceSnapshot: overrides.webhookEvidenceSnapshot ?? null,
    operatorEvidenceSnapshot: overrides.operatorEvidenceSnapshot ?? null,
    rollbackRecoverySnapshot: overrides.rollbackRecoverySnapshot ?? null,
    supportSummary: overrides.supportSummary ?? null,
    blockedReason: overrides.blockedReason ?? null,
    escalationReason: overrides.escalationReason ?? null,
    createdByUserId: overrides.createdByUserId ?? null,
    updatedByUserId: overrides.updatedByUserId ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    archivedAt: overrides.archivedAt ?? null
  };
}

function supportReviewEvent(
  overrides: Partial<ContractorPackageBillingSupportReviewEvent> = {}
): ContractorPackageBillingSupportReviewEvent {
  return {
    id: overrides.id ?? "event-1",
    supportReviewId: overrides.supportReviewId ?? "review-1",
    contractorPackageBillingMappingId:
      overrides.contractorPackageBillingMappingId ?? "mapping-1",
    contractorPackageAssignmentId:
      overrides.contractorPackageAssignmentId ?? "assignment-1",
    companyId: overrides.companyId ?? "company-1",
    eventType: overrides.eventType ?? "support_review_created",
    actorUserId: overrides.actorUserId ?? null,
    reason: overrides.reason ?? null,
    beforeSnapshot: overrides.beforeSnapshot ?? null,
    afterSnapshot: overrides.afterSnapshot ?? null,
    metadata: overrides.metadata ?? null,
    occurredAt: overrides.occurredAt ?? now,
    createdAt: overrides.createdAt ?? now
  };
}

function descriptorKeys(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(descriptorKeys);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value).flatMap(([key, nested]) => [
    key,
    ...descriptorKeys(nested)
  ]);
}

void test("support review read model renders a safe empty support review state", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [],
    supportReviewEvents: []
  });

  assert.equal(model.readOnly, true);
  assert.equal(
    model.summaryCards.find((card) => card.id === "support-review-count")?.value,
    0
  );
  assert.ok(
    model.attentionCaveats.includes(
      "No billing/provider support review records exist yet; the read-only empty state should render safely."
    )
  );
  assert.deepEqual(model.supportReviewRows, []);
  assert.deepEqual(model.supportReviewEventRows, []);
});

void test("support review read model groups review status resolution category and provider environment", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [
      supportReview({
        id: "review-1",
        reviewStatus: "resolution_blocked",
        resolutionCategory: "duplicate_provider_subscription",
        providerEnvironment: "production",
        blockedReason: "Duplicate provider subscription needs support review."
      }),
      supportReview({
        id: "review-2",
        reviewStatus: "awaiting_evidence",
        resolutionCategory: "webhook_replay_issue",
        providerEnvironment: "test"
      })
    ],
    supportReviewEvents: []
  });

  assert.equal(
    model.reviewStatusBuckets.find((bucket) => bucket.key === "resolution_blocked")?.count,
    1
  );
  assert.equal(
    model.resolutionCategoryBuckets.find(
      (bucket) => bucket.key === "webhook_replay_issue"
    )?.count,
    1
  );
  assert.equal(
    model.providerEnvironmentBuckets.find((bucket) => bucket.key === "production")?.count,
    1
  );
});

void test("support review read model surfaces blocked caveats without implying correction", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [
      supportReview({
        reviewStatus: "resolution_blocked",
        blockedReason: "Provider mismatch needs manual evidence."
      })
    ],
    supportReviewEvents: []
  });

  assert.ok(
    model.attentionCaveats.includes(
      "1 support review row is blocked and needs operator review."
    )
  );
  assert.match(
    model.operatorGuidance.join(" "),
    /no corrective-action execution path exists/
  );
  assert.equal(model.correctiveExecutionAvailable, false);
});

void test("support review read model summarizes evidence snapshots safely without dumping values", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [
      supportReview({
        providerReferenceSummary: {
          customer: "cus_sensitive_reference",
          subscription: "sub_sensitive_reference"
        },
        reconciliationEvidenceSnapshot: { expected: "active" },
        webhookEvidenceSnapshot: { eventType: "customer.subscription.updated" },
        operatorEvidenceSnapshot: { note: "Human reviewed" },
        rollbackRecoverySnapshot: { plan: "Manual rollback" }
      })
    ],
    supportReviewEvents: [
      supportReviewEvent({
        beforeSnapshot: { before: "secret-looking payload" },
        afterSnapshot: { after: "secret-looking payload" },
        metadata: { token: "sensitive-token-value" }
      })
    ]
  });
  const row = model.supportReviewRows[0];
  const event = model.supportReviewEventRows[0];

  assert.match(row.providerReferenceSummary, /top-level fields recorded/);
  assert.doesNotMatch(row.providerReferenceSummary, /cus_sensitive_reference/);
  assert.doesNotMatch(
    row.webhookEvidenceSummary,
    /customer\.subscription\.updated/
  );
  assert.match(event.metadataSummary, /Values are summarized, not dumped\./);
  assert.doesNotMatch(event.metadataSummary, /sensitive-token-value/);
});

void test("support review read model surfaces missing linked mapping assignment and company caveats", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [
      supportReview({
        contractorPackageBillingMappingId: null,
        contractorPackageAssignmentId: null,
        companyId: null,
        packageDefinitionId: null,
        packageDefinitionVersionId: null
      })
    ],
    supportReviewEvents: []
  });

  assert.ok(
    model.supportReviewRows[0].caveats.includes(
      "Missing provider mapping reference."
    )
  );
  assert.ok(
    model.supportReviewRows[0].caveats.includes(
      "Missing contractor package assignment reference."
    )
  );
  assert.ok(model.supportReviewRows[0].caveats.includes("Missing company reference."));
  assert.ok(
    model.attentionCaveats.includes(
      "1 support review row is missing mapping, assignment, company, package definition, or package version references."
    )
  );
});

void test("support review read model orders event evidence by occurred time", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [supportReview()],
    supportReviewEvents: [
      supportReviewEvent({
        id: "older",
        occurredAt: "2026-05-09T10:00:00.000Z"
      }),
      supportReviewEvent({
        id: "newer",
        occurredAt: "2026-05-09T11:00:00.000Z"
      })
    ]
  });

  assert.deepEqual(model.supportReviewEventRows.map((event) => event.id), [
    "newer",
    "older"
  ]);
});

void test("support review read model exposes explicit no-behavior flags and no mutation descriptor keys", () => {
  const model = buildContractorPackageBillingSupportReviewReadModel({
    generatedAt: now,
    supportReviews: [supportReview()],
    supportReviewEvents: [supportReviewEvent()]
  });

  assert.equal(model.actionAvailable, false);
  assert.equal(model.mutationAvailable, false);
  assert.equal(model.correctiveExecutionAvailable, false);
  assert.equal(model.stripeCallAvailable, false);
  assert.equal(model.providerCallAvailable, false);
  assert.equal(model.subscriptionOperationAvailable, false);
  assert.equal(model.billingMutationAvailable, false);
  assert.equal(model.entitlementEffect, false);
  assert.equal(model.moduleEffect, false);
  assert.equal(model.runtimeEffect, false);
  assert.equal(model.packageAssignmentEffect, false);
  const keys = descriptorKeys(model);

  for (const forbidden of ["action", "actions", "form", "forms", "serverAction"]) {
    assert.equal(keys.includes(forbidden), false);
  }
});

void test("support review migration keeps schema read-only and evidence snapshots constrained", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /contractor_package_billing_support_reviews/);
  assert.match(migration, /contractor_package_billing_support_review_events/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /force row level security/);
  assert.match(
    migration,
    /revoke all on table public\.contractor_package_billing_support_reviews from authenticated/
  );
  assert.match(
    migration,
    /grant select on table public\.contractor_package_billing_support_reviews to service_role/
  );
  assert.match(
    migration,
    /jsonb_typeof\(provider_reference_summary\) = 'object'/
  );
  assert.match(migration, /jsonb_typeof\(metadata\) = 'object'/);
  assert.doesNotMatch(migration, /security definer/i);
  assert.doesNotMatch(
    migration,
    /stripe_secret|service_role_key|payment_method_data/i
  );
});
