import assert from "node:assert/strict";
import test from "node:test";

import type {
  ContractorPackageBillingSupportReview,
  ContractorPackageBillingSupportReviewEvent
} from "@floorconnector/types";

import { buildContractorPackageBillingSupportReviewDetail } from "./contractor-package-billing-support-review-detail-core";

const now = "2026-05-10T12:00:00.000Z";

function supportReview(
  overrides: Partial<ContractorPackageBillingSupportReview> = {}
): ContractorPackageBillingSupportReview {
  return {
    id: "support-review-1",
    contractorPackageBillingMappingId: "mapping-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    packageDefinitionId: "package-definition-1",
    packageDefinitionVersionId: "package-version-1",
    reviewStatus: "pending_review",
    resolutionCategory: "provider_state_mismatch",
    providerEnvironment: "test",
    providerReferenceSummary: { customer: "cus_test_123" },
    reconciliationEvidenceSnapshot: { expected: "active" },
    webhookEvidenceSnapshot: { eventType: "customer.subscription.updated" },
    operatorEvidenceSnapshot: { note: "Human reviewed" },
    rollbackRecoverySnapshot: { plan: "Manual rollback" },
    supportSummary: "Operator is reviewing provider evidence.",
    blockedReason: null,
    escalationReason: null,
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-10T11:00:00.000Z",
    updatedAt: "2026-05-10T11:30:00.000Z",
    archivedAt: null,
    ...overrides
  };
}

function supportReviewEvent(
  overrides: Partial<ContractorPackageBillingSupportReviewEvent> = {}
): ContractorPackageBillingSupportReviewEvent {
  return {
    id: "support-review-event-1",
    supportReviewId: "support-review-1",
    contractorPackageBillingMappingId: "mapping-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    eventType: "support_review_evidence_added",
    actorUserId: null,
    reason: "Evidence added for review.",
    beforeSnapshot: { status: "pending_review" },
    afterSnapshot: { evidence: "secret-looking payload" },
    metadata: { token: "sensitive-token-value" },
    occurredAt: "2026-05-10T11:15:00.000Z",
    createdAt: "2026-05-10T11:15:01.000Z",
    ...overrides
  };
}

test("builds support review detail with linked provider mapping assignment company package and version labels", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview(),
    events: [supportReviewEvent()],
    linkedReferences: {
      providerMapping: {
        id: "mapping-1",
        label: "Stripe / test",
        secondaryLabel: "mapped / pending_verification"
      },
      assignment: {
        id: "assignment-1",
        label: "Acme Floors assignment",
        secondaryLabel: "active / current"
      },
      company: {
        id: "company-1",
        label: "Acme Floors",
        secondaryLabel: "acme-floors"
      },
      packageDefinition: {
        id: "package-definition-1",
        label: "Growth Package",
        secondaryLabel: "growth"
      },
      packageDefinitionVersion: {
        id: "package-version-1",
        label: "Version 2",
        secondaryLabel: "published"
      }
    }
  });

  assert.equal(model.found, true);
  assert.equal(model.readOnly, true);
  assert.equal(model.providerEnvironment, "Test");
  assert.equal(model.providerMappingReference.label, "Stripe / test");
  assert.equal(model.assignmentReference.label, "Acme Floors assignment");
  assert.equal(model.companyReference.label, "Acme Floors");
  assert.equal(model.packageDefinitionReference.secondaryLabel, "growth");
  assert.equal(model.packageDefinitionVersionReference.label, "Version 2");
});

test("surfaces missing linked references", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview({
      contractorPackageBillingMappingId: null,
      contractorPackageAssignmentId: null,
      companyId: null,
      packageDefinitionId: null,
      packageDefinitionVersionId: null
    }),
    events: []
  });

  assert.match(model.caveats.join(" "), /missing a provider mapping reference/);
  assert.match(model.caveats.join(" "), /missing a contractor package assignment/);
  assert.match(model.caveats.join(" "), /missing a company reference/);
  assert.match(model.caveats.join(" "), /missing a package definition reference/);
  assert.match(model.caveats.join(" "), /missing a package definition version/);
});

test("summarizes evidence snapshots without dumping values", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview(),
    events: [supportReviewEvent()]
  });
  const serialized = JSON.stringify(model);

  assert.match(model.evidenceSections[0]?.summary ?? "", /top-level field/);
  assert.match(model.evidenceSections[1]?.summary ?? "", /Values are summarized/);
  assert.equal(serialized.includes("cus_test_123"), false);
  assert.equal(serialized.includes("secret-looking payload"), false);
  assert.equal(serialized.includes("sensitive-token-value"), false);
});

test("surfaces blocked escalation caveats and no events caveat", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview({
      reviewStatus: "resolution_blocked",
      blockedReason: "Provider state does not match internal reference.",
      escalationReason: "Manual support review required."
    }),
    events: []
  });

  assert.match(model.caveats.join(" "), /blocked/);
  assert.match(model.blockedEscalationCaveats.join(" "), /Blocked reason recorded/);
  assert.match(model.blockedEscalationCaveats.join(" "), /Escalation reason recorded/);
  assert.match(model.caveats.join(" "), /No support review event evidence/);
});

test("orders support review events by occurrence", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview(),
    events: [
      supportReviewEvent({
        id: "event-old",
        occurredAt: "2026-05-10T11:00:00.000Z",
        createdAt: "2026-05-10T11:00:01.000Z"
      }),
      supportReviewEvent({
        id: "event-new",
        occurredAt: "2026-05-10T11:45:00.000Z",
        createdAt: "2026-05-10T11:45:01.000Z"
      })
    ]
  });

  assert.equal(model.eventTimelineRows[0]?.id, "event-new");
  assert.equal(model.eventTimelineRows[1]?.id, "event-old");
});

test("models review status and resolution category caveats safely", () => {
  const awaiting = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview({
      reviewStatus: "awaiting_provider_confirmation",
      resolutionCategory: "manual_support_override_required"
    }),
    events: [supportReviewEvent()]
  });

  assert.match(awaiting.caveats.join(" "), /waiting on evidence or provider confirmation/);
  assert.equal(awaiting.summaryCards[1]?.tone, "warning");

  const approved = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview({ reviewStatus: "approved_for_resolution" }),
    events: [supportReviewEvent()]
  });

  assert.match(approved.caveats.join(" "), /no corrective action is executable/);
});

test("models unavailable state safely", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "not-a-real-support-review",
    supportReview: null,
    events: [],
    unavailableReason: "Support review unavailable."
  });

  assert.equal(model.found, false);
  assert.equal(model.summaryCards[0]?.value, "No");
  assert.match(model.caveats.join(" "), /Support review unavailable/);
});

test("output exposes no mutation action or form descriptor keys", () => {
  const model = buildContractorPackageBillingSupportReviewDetail({
    generatedAt: now,
    supportReviewId: "support-review-1",
    supportReview: supportReview(),
    events: [supportReviewEvent()]
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
  assert.equal(model.correctiveExecutionAvailable, false);
  assert.equal(model.stripeCallAvailable, false);
  assert.equal(model.providerCallAvailable, false);
  assert.equal(model.subscriptionOperationAvailable, false);
  assert.equal(model.billingMutationAvailable, false);
  assert.equal(model.billingExecutionAvailable, false);
  assert.equal(model.packageAssignmentEffect, false);
  assert.equal(model.contractorPermissionEffect, false);
});
