import type { ContractorGroupAssignmentSource } from "@floorconnector/types";

import type { ContractorGroupAssignmentAuditMetadataInput } from "./contractor-group-audit-events-core";
import type {
  ContractorGroupProposalManualApplyServerReadiness,
  ContractorGroupProposalSubmittedAssignmentFingerprint
} from "./contractor-group-assignment-proposals-core";

export const CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION =
  "ASSIGN GROUP MANUALLY";

export type ContractorGroupProposalManualAssignmentInput = {
  organizationId: string;
  contractorGroupId: string;
  submittedProposal?: ContractorGroupProposalSubmittedAssignmentFingerprint | null;
  operatorReason: string;
  confirmationPhrase: string;
  userId: string;
};

export type ContractorGroupProposalManualAssignmentResult = {
  organizationId: string;
  contractorGroupId: string;
  assignmentSource: ContractorGroupAssignmentSource;
  assignmentApplied: boolean;
  status: ContractorGroupProposalManualApplyServerReadiness["status"];
  auditMetadata: ContractorGroupAssignmentAuditMetadataInput | null;
  readiness: ContractorGroupProposalManualApplyServerReadiness;
};

export type ContractorGroupProposalManualAssignmentDependencies = {
  getReadiness(input: {
    organizationId: string;
    contractorGroupId: string;
    submittedProposal?: ContractorGroupProposalSubmittedAssignmentFingerprint | null;
  }): Promise<ContractorGroupProposalManualApplyServerReadiness>;
  assign(input: {
    contractorGroupId: string;
    organizationId: string;
    assignmentSource: ContractorGroupAssignmentSource;
    notes: string | null;
    userId: string;
    auditMetadata?: ContractorGroupAssignmentAuditMetadataInput | null;
  }): Promise<void>;
};

export class ContractorGroupProposalManualAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractorGroupProposalManualAssignmentError";
  }
}

export function getContractorGroupProposalManualAssignmentErrorMessage(
  error: unknown
) {
  return error instanceof ContractorGroupProposalManualAssignmentError
    ? error.message
    : "Unable to apply contractor group proposal. Recompute the proposal and try again.";
}

function rejectManualAssignment(message: string): never {
  throw new ContractorGroupProposalManualAssignmentError(message);
}

function validateConfirmation(input: ContractorGroupProposalManualAssignmentInput) {
  if (!input.submittedProposal) {
    rejectManualAssignment(
      "Submitted proposal context is required for server-side recomputation."
    );
  }

  const submittedProposal = input.submittedProposal;
  const requiredSubmittedFields: Array<
    keyof ContractorGroupProposalSubmittedAssignmentFingerprint
  > = [
    "proposalId",
    "organizationId",
    "contractorGroupId",
    "contractorGroupKey",
    "contractorGroupType",
    "contractorGroupStatus",
    "status",
    "confidence",
    "source",
    "reasonCode",
    "manualReviewReadiness"
  ];
  const hasCompleteSubmittedContext = requiredSubmittedFields.every(
    (field) =>
      submittedProposal[field] !== undefined && submittedProposal[field] !== null
  );

  if (!hasCompleteSubmittedContext) {
    rejectManualAssignment(
      "Complete submitted proposal context is required for stale proposal detection."
    );
  }

  if (
    input.confirmationPhrase !==
    CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION
  ) {
    rejectManualAssignment(
      `Type ${CONTRACTOR_GROUP_PROPOSAL_MANUAL_ASSIGNMENT_CONFIRMATION} to assign this proposal.`
    );
  }

  if (input.operatorReason.trim().length === 0) {
    rejectManualAssignment("Enter an operator reason before assigning this proposal.");
  }
}

function validateReadiness(readiness: ContractorGroupProposalManualApplyServerReadiness) {
  const proposal = readiness.proposal;

  if (!proposal) {
    rejectManualAssignment("This proposal could not be recomputed from current data.");
  }

  if (
    (!readiness.eligible || readiness.status !== "eligible_for_manual_review") &&
    readiness.blockingIssues.length > 0
  ) {
    rejectManualAssignment(
      readiness.blockingIssues[0]?.message ?? readiness.readinessExplanation
    );
  }

  if (!readiness.eligible || readiness.status !== "eligible_for_manual_review") {
    rejectManualAssignment(readiness.readinessExplanation);
  }

  if (proposal.status !== "proposed") {
    rejectManualAssignment("Only proposed assignment rows can be applied.");
  }

  if (proposal.manualReviewReadiness !== "ready_for_review") {
    rejectManualAssignment("This proposal is not ready for manual review.");
  }

  if (proposal.confidence !== "high" && proposal.confidence !== "medium") {
    rejectManualAssignment("Only high or medium confidence proposals can be applied.");
  }

  if (proposal.contractorGroupStatus !== "active") {
    rejectManualAssignment("Only active contractor groups can receive proposal assignments.");
  }

  if (
    proposal.contractorGroupType === "future_plan" ||
    proposal.contractorGroupType === "future_entitlement"
  ) {
    rejectManualAssignment("Future plan and entitlement groups cannot be applied.");
  }

  if (
    readiness.futureWritePreview.wouldCreateMembership !== true ||
    readiness.futureWritePreview.wouldWriteAuditEvent !== true
  ) {
    rejectManualAssignment("This proposal has no eligible membership and audit write preview.");
  }

  if (readiness.runtimeEffect !== "none" || readiness.provisioningEffect !== "none") {
    rejectManualAssignment(
      "Proposal assignment must not have runtime or provisioning effects."
    );
  }

  if (readiness.blockingIssues.length > 0) {
    rejectManualAssignment(readiness.blockingIssues[0]?.message ?? readiness.readinessExplanation);
  }
}

function proposalFingerprint(proposal: ContractorGroupProposalSubmittedAssignmentFingerprint) {
  return JSON.stringify({
    proposalId: proposal.proposalId ?? null,
    organizationId: proposal.organizationId ?? null,
    contractorGroupId: proposal.contractorGroupId ?? null,
    contractorGroupKey: proposal.contractorGroupKey ?? null,
    contractorGroupType: proposal.contractorGroupType ?? null,
    contractorGroupStatus: proposal.contractorGroupStatus ?? null,
    status: proposal.status ?? null,
    confidence: proposal.confidence ?? null,
    source: proposal.source ?? null,
    reasonCode: proposal.reasonCode ?? null,
    manualReviewReadiness: proposal.manualReviewReadiness ?? null
  });
}

export function buildContractorGroupProposalAssignmentAuditMetadata(
  readiness: ContractorGroupProposalManualApplyServerReadiness
): ContractorGroupAssignmentAuditMetadataInput {
  const proposal = readiness.proposal;

  if (!proposal) {
    return {
      assignmentContext: "proposal_manual_review",
      recomputationStatus: readiness.status,
      operatorReasonPresent: true,
      blockedStateChecked: true
    };
  }

  return {
    assignmentContext: "proposal_manual_review",
    proposalSource: proposal.source,
    proposalConfidence: proposal.confidence,
    proposalStatus: proposal.status,
    proposalReasonCode: proposal.reasonCode,
    proposalFingerprint: proposalFingerprint({
      proposalId: proposal.id,
      organizationId: proposal.organizationId,
      contractorGroupId: proposal.contractorGroupId,
      contractorGroupKey: proposal.contractorGroupKey,
      contractorGroupType: proposal.contractorGroupType,
      contractorGroupStatus: proposal.contractorGroupStatus,
      status: proposal.status,
      confidence: proposal.confidence,
      source: proposal.source,
      reasonCode: proposal.reasonCode,
      manualReviewReadiness: proposal.manualReviewReadiness
    }),
    recomputationStatus: readiness.status,
    operatorReasonPresent: true,
    organizationLabel: proposal.organizationName || proposal.organizationSlug,
    groupKey: proposal.contractorGroupKey,
    groupType: proposal.contractorGroupType,
    groupStatus: proposal.contractorGroupStatus,
    blockedStateChecked: true
  };
}

export async function applyContractorGroupProposalManualAssignment(
  input: ContractorGroupProposalManualAssignmentInput,
  dependencies: ContractorGroupProposalManualAssignmentDependencies
): Promise<ContractorGroupProposalManualAssignmentResult> {
  validateConfirmation(input);

  const readiness = await dependencies.getReadiness({
    organizationId: input.organizationId,
    contractorGroupId: input.contractorGroupId,
    submittedProposal: input.submittedProposal ?? null
  });

  if (readiness.status === "already_assigned") {
    return {
      organizationId: input.organizationId,
      contractorGroupId: input.contractorGroupId,
      assignmentSource: "targeting_preview",
      assignmentApplied: false,
      status: readiness.status,
      auditMetadata: null,
      readiness
    };
  }

  validateReadiness(readiness);

  const operatorReason = input.operatorReason.trim();
  const auditMetadata = buildContractorGroupProposalAssignmentAuditMetadata(readiness);
  const assignmentSource: ContractorGroupAssignmentSource = "targeting_preview";

  await dependencies.assign({
    contractorGroupId: input.contractorGroupId,
    organizationId: input.organizationId,
    assignmentSource,
    notes: operatorReason,
    userId: input.userId,
    auditMetadata
  });

  return {
    organizationId: input.organizationId,
    contractorGroupId: input.contractorGroupId,
    assignmentSource,
    assignmentApplied: true,
    status: readiness.status,
    auditMetadata,
    readiness
  };
}
