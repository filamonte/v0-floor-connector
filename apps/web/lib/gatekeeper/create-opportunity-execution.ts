import type { GateKeeperActionSuggestionStatus } from "@floorconnector/types";

import type { OpportunityInput } from "@/lib/opportunities/schemas";

import type { GateKeeperExecutionBlocker } from "./action-bridge";
import type { GateKeeperCreateOpportunityPreflight } from "./create-opportunity-preflight";

export type GateKeeperCreateOpportunityExecutionEligibility = {
  canExecute: boolean;
  blockers: GateKeeperExecutionBlocker[];
  safetyCopy: string[];
};

export type GateKeeperCreateOpportunityExecutedLedgerUpdate = {
  status: "executed";
  executed_by: string;
  executed_at: string;
  result_subject_type: "opportunity";
  result_subject_id: string;
  execution_error: null;
  updated_by: string;
};

export type GateKeeperCreateOpportunityFailedLedgerUpdate = {
  status: "failed";
  execution_error: string;
  updated_by: string;
};

function compactText(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}...`
    : normalized;
}

function optionalText(value: string, maxLength: number) {
  const normalized = compactText(value, maxLength);

  return normalized.length > 0 ? normalized : null;
}

function buildRequirementsSummary(input: {
  locationText: string;
  requestedAppointmentText: string;
  requestedService: string;
  sourceLabel: string;
}) {
  const lines = [
    input.requestedService
      ? `Requested work: ${input.requestedService.trim()}`
      : null,
    input.locationText ? `Location: ${input.locationText.trim()}` : null,
    input.requestedAppointmentText
      ? `Requested appointment text: ${input.requestedAppointmentText.trim()}`
      : null,
    input.sourceLabel ? `GateKeeper source: ${input.sourceLabel.trim()}` : null
  ].filter((line): line is string => Boolean(line));

  return optionalText(lines.join("\n"), 4000);
}

function buildNotes(input: {
  notes: string;
  requestedAppointmentText: string;
  sourceLabel: string;
}) {
  const lines = [
    input.notes.trim() || null,
    input.requestedAppointmentText
      ? `GateKeeper requested appointment text: ${input.requestedAppointmentText.trim()}`
      : null,
    input.sourceLabel
      ? `GateKeeper source label: ${input.sourceLabel.trim()}`
      : null
  ].filter((line): line is string => Boolean(line));

  return optionalText(lines.join("\n\n"), 4000);
}

export function mapGateKeeperCreateOpportunityDraftToCanonicalInput(
  preflight: GateKeeperCreateOpportunityPreflight
): OpportunityInput {
  const draft = preflight.savedDraft.draft;
  const requestedService = compactText(draft.requestedService, 120);
  const locationText = compactText(draft.locationText, 160);

  return {
    title: null,
    status: "new",
    source: "GateKeeper",
    sourceDetail: optionalText(draft.sourceLabel, 160),
    serviceType: optionalText(requestedService, 120),
    jobType: requestedService,
    siteName: locationText,
    contactName: compactText(draft.contactName, 120),
    contactCompanyName: null,
    email: optionalText(draft.email, 255),
    contactPhone: optionalText(draft.phone, 40),
    addressLine1: null,
    addressLine2: null,
    city: null,
    stateRegion: null,
    postalCode: null,
    countryCode: null,
    siteAssessmentScheduledOn: null,
    siteAssessmentScheduledTime: null,
    siteAssessmentCompletedOn: null,
    requirementsSummary: buildRequirementsSummary({
      locationText: draft.locationText,
      requestedAppointmentText: draft.requestedAppointmentText,
      requestedService: draft.requestedService,
      sourceLabel: draft.sourceLabel
    }),
    notes: buildNotes({
      notes: draft.notes,
      requestedAppointmentText: draft.requestedAppointmentText,
      sourceLabel: draft.sourceLabel
    }),
    measurements: [],
    observations: [],
    attachments: []
  };
}

export function getGateKeeperCreateOpportunityExecutionEligibility(input: {
  preflight: GateKeeperCreateOpportunityPreflight | null;
  suggestionStatus: GateKeeperActionSuggestionStatus;
}): GateKeeperCreateOpportunityExecutionEligibility {
  const blockers: GateKeeperExecutionBlocker[] = [];

  if (!input.preflight) {
    blockers.push({
      code: "saved_draft_required",
      message:
        "Save and request a GateKeeper execution draft before creating an opportunity.",
      severity: "blocking"
    });
  }

  if (input.suggestionStatus !== "approved") {
    blockers.push({
      code: "suggestion_review_required",
      message:
        "Approve the GateKeeper suggestion review before controlled execution.",
      severity: "blocking"
    });
  }

  if (input.preflight?.savedDraft.status !== "execution_requested") {
    blockers.push({
      code:
        input.preflight?.savedDraft.status === "failed"
          ? "previous_execution_failed"
          : input.preflight?.savedDraft.status === "executed"
            ? "already_executed"
            : "execution_request_required",
      message:
        input.preflight?.savedDraft.status === "failed"
          ? "This GateKeeper execution attempt failed. Retry requires a future explicit reset/retry policy."
          : input.preflight?.savedDraft.status === "executed"
            ? "This GateKeeper execution attempt is already complete."
            : "The GateKeeper ledger row must be marked execution_requested before controlled execution.",
      severity: "blocking"
    });
  }

  if (
    input.preflight?.savedDraft.resultSubjectId ||
    input.preflight?.savedDraft.resultSubjectType
  ) {
    blockers.push({
      code: "already_executed",
      message:
        "This GateKeeper execution ledger row already links to a created opportunity.",
      severity: "blocking"
    });
  }

  if (input.preflight?.missingRecommendedFields.length) {
    blockers.push({
      code: "missing_required_confirmation_fields",
      message:
        "The saved confirmation draft is missing required opportunity fields.",
      severity: "blocking"
    });
  }

  if (
    input.preflight?.duplicatePreview.recommendation ===
    "high_confidence_duplicate_review_required"
  ) {
    blockers.push({
      code: "high_confidence_duplicate_review_required",
      message:
        "High-confidence duplicate warnings must be resolved before creating a new opportunity.",
      severity: "blocking"
    });
  }

  return {
    canExecute: blockers.length === 0,
    blockers,
    safetyCopy: [
      "This creates one canonical opportunity through the Opportunities workflow.",
      "The Opportunities workflow may create or link the primary contact it already owns for opportunity intake.",
      "It will not create a customer, project, estimate, job, schedule, invoice, contract, payment, message, task, or portal record."
    ]
  };
}

export function buildGateKeeperCreateOpportunityExecutedLedgerUpdate(input: {
  executedAt: string;
  opportunityId: string;
  userId: string;
}): GateKeeperCreateOpportunityExecutedLedgerUpdate {
  return {
    status: "executed",
    executed_by: input.userId,
    executed_at: input.executedAt,
    result_subject_type: "opportunity",
    result_subject_id: input.opportunityId,
    execution_error: null,
    updated_by: input.userId
  };
}

export function buildGateKeeperCreateOpportunityFailedLedgerUpdate(input: {
  error: unknown;
  userId: string;
}): GateKeeperCreateOpportunityFailedLedgerUpdate {
  return {
    status: "failed",
    execution_error: getSafeGateKeeperCreateOpportunityExecutionError(
      input.error
    ),
    updated_by: input.userId
  };
}

export function getSafeGateKeeperCreateOpportunityExecutionError(
  error: unknown
) {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to create the opportunity through the canonical Opportunities workflow.";

  return compactText(message.replace(/[\r\n\t]+/g, " "), 500);
}
