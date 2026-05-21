import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import {
  getGateKeeperExecutionPolicy,
  type GateKeeperActionRiskTier,
  type GateKeeperExecutionOwner
} from "./action-bridge";

export type GateKeeperExecutionAttemptStatus =
  | "draft"
  | "confirmation_started"
  | "validation_failed"
  | "execution_requested"
  | "executed"
  | "failed"
  | "canceled"
  | "superseded";

export type GateKeeperExecutionAttemptDraft = {
  suggestionId: string;
  sourceArtifactId: string | null;
  sourceThreadId: string | null;
  sourceMessageId: string | null;
  actionType: GateKeeperActionSuggestion["suggestionType"];
  executionOwner: GateKeeperExecutionOwner;
  riskTier: GateKeeperActionRiskTier;
  status: "draft";
  idempotencyKey: string;
  proposedPayloadSnapshot: GateKeeperActionSuggestion["proposedPayload"];
  metadata: {
    executionAllowed: false;
    reviewStatus: GateKeeperActionSuggestion["status"];
    resultSubjectValid: boolean;
  };
};

export type GateKeeperExecutionResultSubjectInput = {
  resultSubjectType?: string | null;
  resultSubjectId?: string | null;
};

export function buildGateKeeperExecutionIdempotencyKey(input: {
  actionType: string;
  purpose?: string;
  suggestionId: string;
  version?: number;
}) {
  const version = input.version ?? 1;
  const purpose = input.purpose?.trim().toLowerCase();

  const parts = [
    "gatekeeper_execution",
    input.actionType.trim().toLowerCase(),
    input.suggestionId.trim()
  ];

  if (purpose) {
    parts.push(purpose);
  }

  parts.push(`v${version}`);

  return parts.join(":");
}

export function hasValidGateKeeperExecutionResultSubjectPair(
  input: GateKeeperExecutionResultSubjectInput
) {
  const hasType = Boolean(input.resultSubjectType?.trim());
  const hasId = Boolean(input.resultSubjectId?.trim());

  return hasType === hasId;
}

export function buildGateKeeperExecutionAttemptDraft(
  suggestion: Pick<
    GateKeeperActionSuggestion,
    | "communicationMessageId"
    | "communicationThreadId"
    | "id"
    | "proposedPayload"
    | "sourceArtifactId"
    | "status"
    | "suggestionType"
  >
): GateKeeperExecutionAttemptDraft {
  const policy = getGateKeeperExecutionPolicy(suggestion.suggestionType);

  return {
    suggestionId: suggestion.id,
    sourceArtifactId: suggestion.sourceArtifactId,
    sourceThreadId: suggestion.communicationThreadId,
    sourceMessageId: suggestion.communicationMessageId,
    actionType: suggestion.suggestionType,
    executionOwner: policy.owner,
    riskTier: policy.riskTier,
    status: "draft",
    idempotencyKey: buildGateKeeperExecutionIdempotencyKey({
      actionType: suggestion.suggestionType,
      suggestionId: suggestion.id
    }),
    proposedPayloadSnapshot: suggestion.proposedPayload,
    metadata: {
      executionAllowed: false,
      reviewStatus: suggestion.status,
      resultSubjectValid: true
    }
  };
}
