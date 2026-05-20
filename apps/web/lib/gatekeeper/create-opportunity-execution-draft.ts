import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import { getGateKeeperExecutionPolicy } from "./action-bridge";
import {
  buildGateKeeperCreateOpportunityConfirmationModel,
  getGateKeeperCreateOpportunityConfirmationMissingFields,
  type GateKeeperCreateOpportunityConfirmationDraft
} from "./create-opportunity-confirmation";
import { buildGateKeeperExecutionIdempotencyKey } from "./execution-ledger";

export const gateKeeperCreateOpportunityExecutionDraftPurpose =
  "create_opportunity_confirmation_draft";

export type GateKeeperCreateOpportunityExecutionDraftValidationError = {
  field: string;
  message: string;
  severity: "warning";
};

export type GateKeeperCreateOpportunityExecutionDraftPayload = {
  purpose: typeof gateKeeperCreateOpportunityExecutionDraftPurpose;
  draftValidationScope: "gatekeeper_ledger_only";
  canExecuteNow: false;
  executionNotImplemented: true;
  draft: GateKeeperCreateOpportunityConfirmationDraft;
};

export type GateKeeperCreateOpportunityLedgerDraft = {
  suggestionId: string;
  sourceArtifactId: string | null;
  sourceThreadId: string | null;
  sourceMessageId: string | null;
  actionType: "create_opportunity";
  executionOwner: "opportunities";
  riskTier: "medium_internal";
  status: "confirmation_started";
  idempotencyKey: string;
  proposedPayloadSnapshot: GateKeeperActionSuggestion["proposedPayload"];
  validatedPayload: GateKeeperCreateOpportunityExecutionDraftPayload;
  validationErrors: GateKeeperCreateOpportunityExecutionDraftValidationError[];
  metadata: {
    executionAllowed: false;
    reviewStatus: GateKeeperActionSuggestion["status"];
    draftPurpose: typeof gateKeeperCreateOpportunityExecutionDraftPurpose;
    draftIsLedgerOnly: true;
  };
};

export function normalizeGateKeeperCreateOpportunityExecutionDraft(
  draft: Partial<GateKeeperCreateOpportunityConfirmationDraft>
): GateKeeperCreateOpportunityConfirmationDraft {
  return {
    contactName: draft.contactName?.trim() ?? "",
    email: draft.email?.trim() ?? "",
    locationText: draft.locationText?.trim() ?? "",
    notes: draft.notes?.trim() ?? "",
    phone: draft.phone?.trim() ?? "",
    requestedAppointmentText: draft.requestedAppointmentText?.trim() ?? "",
    requestedService: draft.requestedService?.trim() ?? "",
    sourceLabel: draft.sourceLabel?.trim() ?? ""
  };
}

export function buildGateKeeperCreateOpportunityExecutionDraftPayload(
  draft: Partial<GateKeeperCreateOpportunityConfirmationDraft>
): GateKeeperCreateOpportunityExecutionDraftPayload {
  return {
    purpose: gateKeeperCreateOpportunityExecutionDraftPurpose,
    draftValidationScope: "gatekeeper_ledger_only",
    canExecuteNow: false,
    executionNotImplemented: true,
    draft: normalizeGateKeeperCreateOpportunityExecutionDraft(draft)
  };
}

export function buildGateKeeperCreateOpportunityExecutionDraftValidationErrors(
  draft: Partial<GateKeeperCreateOpportunityConfirmationDraft>
): GateKeeperCreateOpportunityExecutionDraftValidationError[] {
  const normalizedDraft =
    normalizeGateKeeperCreateOpportunityExecutionDraft(draft);
  const missingFields =
    getGateKeeperCreateOpportunityConfirmationMissingFields(normalizedDraft);

  return missingFields.map((field) => ({
    field,
    message: `${field} is missing from the confirmation draft. This is a preflight warning only and does not execute anything.`,
    severity: "warning"
  }));
}

export function getGateKeeperCreateOpportunityExecutionDraftFromPayload(
  proposedPayload: GateKeeperActionSuggestion["proposedPayload"]
) {
  return buildGateKeeperCreateOpportunityConfirmationModel(proposedPayload)
    .draft;
}

export function buildGateKeeperCreateOpportunityLedgerDraft(input: {
  draft: Partial<GateKeeperCreateOpportunityConfirmationDraft>;
  suggestion: Pick<
    GateKeeperActionSuggestion,
    | "communicationMessageId"
    | "communicationThreadId"
    | "id"
    | "proposedPayload"
    | "sourceArtifactId"
    | "status"
    | "suggestionType"
  >;
}): GateKeeperCreateOpportunityLedgerDraft {
  if (input.suggestion.suggestionType !== "create_opportunity") {
    throw new Error(
      "Only create_opportunity suggestions can save an opportunity confirmation draft."
    );
  }

  const policy = getGateKeeperExecutionPolicy(input.suggestion.suggestionType);

  if (
    policy.owner !== "opportunities" ||
    policy.riskTier !== "medium_internal"
  ) {
    throw new Error(
      "Create opportunity confirmation draft policy is not configured."
    );
  }

  return {
    suggestionId: input.suggestion.id,
    sourceArtifactId: input.suggestion.sourceArtifactId,
    sourceThreadId: input.suggestion.communicationThreadId,
    sourceMessageId: input.suggestion.communicationMessageId,
    actionType: "create_opportunity",
    executionOwner: policy.owner,
    riskTier: policy.riskTier,
    status: "confirmation_started",
    idempotencyKey: buildGateKeeperExecutionIdempotencyKey({
      actionType: "create_opportunity",
      purpose: gateKeeperCreateOpportunityExecutionDraftPurpose,
      suggestionId: input.suggestion.id
    }),
    proposedPayloadSnapshot: input.suggestion.proposedPayload,
    validatedPayload: buildGateKeeperCreateOpportunityExecutionDraftPayload(
      input.draft
    ),
    validationErrors:
      buildGateKeeperCreateOpportunityExecutionDraftValidationErrors(
        input.draft
      ),
    metadata: {
      executionAllowed: false,
      reviewStatus: input.suggestion.status,
      draftPurpose: gateKeeperCreateOpportunityExecutionDraftPurpose,
      draftIsLedgerOnly: true
    }
  };
}
