import type { GateKeeperActionSuggestionStatus } from "@floorconnector/types";

import type { GateKeeperCreateOpportunityPreflight } from "./create-opportunity-preflight";

export type GateKeeperCreateOpportunityExecutionRequestBlockerCode =
  | "saved_draft_required"
  | "suggestion_review_required"
  | "saved_draft_status_not_requestable"
  | "missing_required_confirmation_fields"
  | "high_confidence_duplicate_review_required";

export type GateKeeperCreateOpportunityExecutionRequestBlocker = {
  code: GateKeeperCreateOpportunityExecutionRequestBlockerCode;
  message: string;
};

export type GateKeeperCreateOpportunityExecutionRequestEligibility = {
  canRequestExecution: boolean;
  blockers: GateKeeperCreateOpportunityExecutionRequestBlocker[];
  safetyCopy: string[];
  canExecuteNow: false;
};

export type GateKeeperCreateOpportunityExecutionRequestUpdate = {
  status: "execution_requested";
  requested_by: string;
  requested_at: string;
  updated_by: string;
};

export function getGateKeeperCreateOpportunityExecutionRequestEligibility(input: {
  preflight: GateKeeperCreateOpportunityPreflight | null;
  suggestionStatus: GateKeeperActionSuggestionStatus;
}): GateKeeperCreateOpportunityExecutionRequestEligibility {
  const blockers: GateKeeperCreateOpportunityExecutionRequestBlocker[] = [];

  if (!input.preflight) {
    blockers.push({
      code: "saved_draft_required",
      message:
        "Save a GateKeeper confirmation draft before requesting future execution."
    });
  }

  if (input.suggestionStatus !== "approved") {
    blockers.push({
      code: "suggestion_review_required",
      message:
        "Approve the GateKeeper suggestion review before requesting future execution."
    });
  }

  if (
    input.preflight &&
    input.preflight.savedDraft.status !== "draft" &&
    input.preflight.savedDraft.status !== "confirmation_started"
  ) {
    blockers.push({
      code: "saved_draft_status_not_requestable",
      message:
        "This GateKeeper execution ledger row is no longer requestable as a draft."
    });
  }

  if (input.preflight?.missingRecommendedFields.length) {
    blockers.push({
      code: "missing_required_confirmation_fields",
      message:
        "The saved confirmation draft is missing required future opportunity fields."
    });
  }

  if (
    input.preflight?.duplicatePreview.recommendation ===
    "high_confidence_duplicate_review_required"
  ) {
    blockers.push({
      code: "high_confidence_duplicate_review_required",
      message:
        "High-confidence duplicate warnings must be manually reviewed before future execution can be requested."
    });
  }

  return {
    canRequestExecution: blockers.length === 0,
    blockers,
    safetyCopy: [
      "This only marks the GateKeeper ledger as execution requested.",
      "No opportunity will be created yet.",
      "Creation still requires a separate final controlled execution action."
    ],
    canExecuteNow: false
  };
}

export function buildGateKeeperCreateOpportunityExecutionRequestUpdate(input: {
  requestedAt: string;
  userId: string;
}): GateKeeperCreateOpportunityExecutionRequestUpdate {
  return {
    status: "execution_requested",
    requested_by: input.userId,
    requested_at: input.requestedAt,
    updated_by: input.userId
  };
}
