import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeContractorGroupAssignmentAuditMetadata } from "./contractor-group-audit-events-core";
import {
  applyContractorGroupProposalManualAssignment,
  CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION,
  getContractorGroupProposalManualAssignmentErrorMessage,
  type ContractorGroupProposalManualAssignmentDependencies
} from "./contractor-group-proposal-apply-core";
import type {
  ContractorGroupAssignmentProposal,
  ContractorGroupProposalManualApplyServerReadiness
} from "./contractor-group-assignment-proposals-core";

const baseProposal: ContractorGroupAssignmentProposal = {
  id: "org-1:group-1",
  organizationId: "11111111-1111-4111-8111-111111111111",
  organizationName: "Austin Epoxy",
  organizationSlug: "austin-epoxy",
  contractorGroupId: "22222222-2222-4222-8222-222222222222",
  contractorGroupName: "Texas Regional",
  contractorGroupKey: "texas-regional",
  contractorGroupType: "regional",
  contractorGroupStatus: "active",
  status: "proposed",
  confidence: "high",
  source: "exact_region_match",
  reason: "Organization region matches group.",
  groupIsActive: true,
  safeForManualReview: true,
  assignmentApplied: false,
  caveats: [],
  manualReviewReadiness: "ready_for_review",
  readinessLabel: "Ready for review",
  readinessExplanation:
    "This high-confidence proposal can be reviewed for a future manual assignment.",
  reasonCode: "exact_region_match",
  evidenceItems: [],
  caveatItems: [],
  futureApplyPreview: {
    currentActionAvailable: false,
    assignmentApplied: false,
    wouldCreateMembership: true,
    wouldWriteAuditEvent: true,
    affectedRecordTypes: [
      "contractor_group_memberships",
      "contractor_group_audit_events"
    ],
    runtimeEffect: "none",
    summary:
      "Future manual apply would create one contractor group membership and one audit event."
  },
  starterPackImpactPreview: [],
  runtimeEffect: "none",
  actionAvailable: false,
  manualReviewChecklist: {
    proposalId: "org-1:group-1",
    organizationId: "11111111-1111-4111-8111-111111111111",
    contractorGroupId: "22222222-2222-4222-8222-222222222222",
    evidenceItems: [],
    requiredFutureOperatorChecks: [],
    blockingCaveats: [],
    suggestedFutureReasonText: "Manual assignment after proposal review.",
    manualAssignmentPathLabel: "Future manual assignment",
    actionAvailable: false,
    note: "Read-only proposal context."
  }
};

function makeReadiness(
  overrides: Partial<ContractorGroupProposalManualApplyServerReadiness> = {},
  proposalOverrides: Partial<ContractorGroupAssignmentProposal> = {}
): ContractorGroupProposalManualApplyServerReadiness {
  const proposal = {
    ...baseProposal,
    ...proposalOverrides,
    futureApplyPreview: {
      ...baseProposal.futureApplyPreview,
      ...proposalOverrides.futureApplyPreview
    }
  };

  return {
    organizationId: proposal.organizationId,
    contractorGroupId: proposal.contractorGroupId,
    proposal,
    eligible: true,
    status: "eligible_for_manual_review",
    reasonCode: proposal.reasonCode,
    readinessLabel: proposal.readinessLabel,
    readinessExplanation: proposal.readinessExplanation,
    requiredConfirmationPhrase:
      CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION,
    futureWritePreview: proposal.futureApplyPreview,
    runtimeEffect: "none",
    provisioningEffect: "none",
    starterPackImpactPreview: proposal.starterPackImpactPreview,
    auditPreviewMetadata: {
      proposalSource: proposal.source,
      confidence: proposal.confidence,
      proposalReason: proposal.reason,
      proposalCaveats: proposal.caveats,
      groupKey: proposal.contractorGroupKey,
      groupType: proposal.contractorGroupType,
      groupStatus: proposal.contractorGroupStatus,
      organizationId: proposal.organizationId,
      organizationName: proposal.organizationName,
      recentAuditEventCount: null,
      reasonCode: proposal.reasonCode,
      manualReviewReadiness: proposal.manualReviewReadiness
    },
    blockingIssues: [],
    warningIssues: [],
    noWriteStatement:
      "Readiness only. No contractor group membership, audit event, starter-pack provisioning, entitlement, or runtime behavior is written.",
    actionAvailable: false,
    ...overrides
  };
}

function makeInput(overrides = {}) {
  return {
    organizationId: baseProposal.organizationId,
    contractorGroupId: baseProposal.contractorGroupId,
    submittedProposal: {
      proposalId: baseProposal.id,
      organizationId: baseProposal.organizationId,
      contractorGroupId: baseProposal.contractorGroupId,
      contractorGroupKey: baseProposal.contractorGroupKey,
      contractorGroupType: baseProposal.contractorGroupType,
      contractorGroupStatus: baseProposal.contractorGroupStatus,
      status: baseProposal.status,
      confidence: baseProposal.confidence,
      source: baseProposal.source,
      reasonCode: baseProposal.reasonCode,
      manualReviewReadiness: baseProposal.manualReviewReadiness
    },
    operatorReason: "Reviewed proposal evidence and assigning manually.",
    confirmationPhrase: CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION,
    userId: "33333333-3333-4333-8333-333333333333",
    ...overrides
  };
}

function makeDependencies(
  readiness: ContractorGroupProposalManualApplyServerReadiness
) {
  const assigned: Parameters<ContractorGroupProposalManualAssignmentDependencies["assign"]>[0][] =
    [];
  const dependencies: ContractorGroupProposalManualAssignmentDependencies = {
    getReadiness() {
      return Promise.resolve(readiness);
    },
    assign(input) {
      assigned.push(input);
      return Promise.resolve();
    }
  };

  return { dependencies, assigned };
}

async function assertRejectsWithoutAssignment(
  readiness: ContractorGroupProposalManualApplyServerReadiness,
  inputOverrides = {}
) {
  const { dependencies, assigned } = makeDependencies(readiness);

  await assert.rejects(
    applyContractorGroupProposalManualAssignment(
      makeInput(inputOverrides),
      dependencies
    )
  );
  assert.equal(assigned.length, 0);
}

void test("proposal manual assignment applies high-confidence proposal through metadata assignment once", async () => {
  const { dependencies, assigned } = makeDependencies(makeReadiness());

  const result = await applyContractorGroupProposalManualAssignment(
    makeInput(),
    dependencies
  );

  assert.equal(assigned.length, 1);
  assert.equal(assigned[0]?.assignmentSource, "targeting_preview");
  assert.equal(assigned[0]?.notes, "Reviewed proposal evidence and assigning manually.");
  assert.equal(result.assignmentSource, "targeting_preview");
  assert.equal(result.assignmentApplied, true);
  assert.equal(result.status, "eligible_for_manual_review");
  assert.deepEqual(result.auditMetadata, {
    assignmentContext: "proposal_manual_review",
    proposalSource: "exact_region_match",
    proposalConfidence: "high",
    proposalStatus: "proposed",
    proposalReasonCode: "exact_region_match",
    proposalFingerprint:
      "{\"proposalId\":\"org-1:group-1\",\"organizationId\":\"11111111-1111-4111-8111-111111111111\",\"contractorGroupId\":\"22222222-2222-4222-8222-222222222222\",\"contractorGroupKey\":\"texas-regional\",\"contractorGroupType\":\"regional\",\"contractorGroupStatus\":\"active\",\"status\":\"proposed\",\"confidence\":\"high\",\"source\":\"exact_region_match\",\"reasonCode\":\"exact_region_match\",\"manualReviewReadiness\":\"ready_for_review\"}",
    recomputationStatus: "eligible_for_manual_review",
    operatorReasonPresent: true,
    organizationLabel: "Austin Epoxy",
    groupKey: "texas-regional",
    groupType: "regional",
    groupStatus: "active",
    blockedStateChecked: true
  });
});

void test("proposal manual assignment applies medium-confidence proposal when readiness allows it", async () => {
  const { dependencies, assigned } = makeDependencies(
    makeReadiness({}, { confidence: "medium", source: "beta_label_match" })
  );

  await applyContractorGroupProposalManualAssignment(makeInput(), dependencies);

  assert.equal(assigned.length, 1);
  assert.equal(assigned[0]?.auditMetadata?.proposalConfidence, "medium");
});

void test("proposal manual assignment rejects stale submitted context without assignment", async () => {
  const { dependencies, assigned } = makeDependencies(
    makeReadiness({
      eligible: false,
      status: "stale_recompute_required",
      blockingIssues: [
        {
          code: "stale_submitted_proposal_context",
          severity: "blocking",
          message: "Submitted proposal context is stale."
        }
      ]
    })
  );

  let rejection: unknown;
  await assert.rejects(
    applyContractorGroupProposalManualAssignment(makeInput(), dependencies),
    (error) => {
      rejection = error;
      return true;
    }
  );

  assert.equal(
    getContractorGroupProposalManualAssignmentErrorMessage(rejection),
    "Submitted proposal context is stale."
  );
  assert.equal(assigned.length, 0);
});

void test("proposal manual assignment returns already assigned readback without duplicate assignment", async () => {
  const { dependencies, assigned } = makeDependencies(
    makeReadiness(
      {
        eligible: false,
        status: "already_assigned",
        futureWritePreview: {
          ...baseProposal.futureApplyPreview,
          wouldCreateMembership: false,
          wouldWriteAuditEvent: false
        }
      },
      { status: "already_assigned", manualReviewReadiness: "already_assigned" }
    )
  );

  const result = await applyContractorGroupProposalManualAssignment(
    makeInput(),
    dependencies
  );

  assert.equal(assigned.length, 0);
  assert.equal(result.assignmentApplied, false);
  assert.equal(result.status, "already_assigned");
  assert.equal(result.auditMetadata, null);
});

void test("proposal manual assignment rejects inactive archived and future groups without assignment", async () => {
  await assertRejectsWithoutAssignment(
    makeReadiness({ eligible: false, status: "blocked" }, { contractorGroupStatus: "inactive" })
  );
  await assertRejectsWithoutAssignment(
    makeReadiness({ eligible: false, status: "blocked" }, { contractorGroupStatus: "archived" })
  );
  await assertRejectsWithoutAssignment(
    makeReadiness({ eligible: false, status: "blocked" }, { contractorGroupType: "future_plan" })
  );
  await assertRejectsWithoutAssignment(
    makeReadiness(
      { eligible: false, status: "blocked" },
      { contractorGroupType: "future_entitlement" }
    )
  );
});

void test("proposal manual assignment rejects low confidence and unavailable rows without assignment", async () => {
  await assertRejectsWithoutAssignment(
    makeReadiness({ eligible: false, status: "blocked" }, { confidence: "low" })
  );
  await assertRejectsWithoutAssignment(
    makeReadiness(
      { eligible: false, status: "unavailable" },
      { status: "unavailable", manualReviewReadiness: "needs_metadata" }
    )
  );
});

void test("proposal manual assignment rejects bad phrase and empty reason before assignment", async () => {
  await assertRejectsWithoutAssignment(makeReadiness(), {
    confirmationPhrase: "ASSIGN"
  });
  await assertRejectsWithoutAssignment(makeReadiness(), {
    operatorReason: "   "
  });
  await assertRejectsWithoutAssignment(makeReadiness(), {
    submittedProposal: null
  });
  await assertRejectsWithoutAssignment(makeReadiness(), {
    submittedProposal: {}
  });
});

void test("proposal manual assignment metadata remains within sanitized audit allowlist", async () => {
  const { dependencies, assigned } = makeDependencies(makeReadiness());

  await applyContractorGroupProposalManualAssignment(makeInput(), dependencies);

  assert.deepEqual(
    sanitizeContractorGroupAssignmentAuditMetadata(assigned[0]?.auditMetadata),
    assigned[0]?.auditMetadata
  );
  assert.equal(
    typeof assigned[0]?.auditMetadata?.proposalFingerprint,
    "string"
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(assigned[0]?.auditMetadata ?? {}, "runtimeEffect"),
    false
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      assigned[0]?.auditMetadata ?? {},
      "provisioningEffect"
    ),
    false
  );
});

void test("proposal manual assignment audit metadata sanitizer drops unsafe metadata fields", () => {
  const sanitized = sanitizeContractorGroupAssignmentAuditMetadata({
    assignmentContext: "proposal_manual_review",
    proposalFingerprint: "safe-fingerprint",
    rawDbError: "duplicate key raw detail",
    serviceRoleKey: "secret",
    nestedPayload: { stack: "nope" }
  });

  assert.deepEqual(sanitized, {
    assignmentContext: "proposal_manual_review",
    proposalFingerprint: "safe-fingerprint"
  });
});

void test("proposal manual assignment masks unexpected lower-level errors for action redirects", async () => {
  const readiness = makeReadiness();
  const dependencies: ContractorGroupProposalManualAssignmentDependencies = {
    getReadiness() {
      return Promise.resolve(readiness);
    },
    assign() {
      return Promise.reject(
        new Error("duplicate key value violates unique constraint raw detail")
      );
    }
  };

  await assert.rejects(
    applyContractorGroupProposalManualAssignment(makeInput(), dependencies),
    (error) => {
      assert.equal(
        getContractorGroupProposalManualAssignmentErrorMessage(error),
        "Unable to apply contractor group proposal. Recompute the proposal and try again."
      );
      return true;
    }
  );
});
