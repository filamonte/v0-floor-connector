import type { GateKeeperExecutionBlocker } from "./action-bridge";
import {
  getGateKeeperCreateOpportunityConfirmationMissingFields,
  type GateKeeperCreateOpportunityConfirmationDraft
} from "./create-opportunity-confirmation";
import type { GateKeeperCreateOpportunityDuplicatePreview } from "./create-opportunity-duplicates";
import type { GateKeeperCreateOpportunityExecutionDraftPayload } from "./create-opportunity-execution-draft";
import type { GateKeeperExecutionAttemptStatus } from "./execution-ledger";

export type GateKeeperCreateOpportunityPreflightReadiness =
  | "not_ready_missing_required"
  | "review_duplicate_warning"
  | "eligible_for_future_execution";

export type GateKeeperCreateOpportunityPreflightCurrentEligibility =
  | "draft_not_requested"
  | "eligible_for_controlled_execution"
  | "executed"
  | "failed";

export type GateKeeperCreateOpportunityExecutionResultDisplay = {
  status: "executed" | "failed";
  label: string;
  href: string | null;
  occurredAt: string | null;
  message: string;
};

export type GateKeeperCreateOpportunitySavedDraftAttempt = {
  id: string;
  suggestionId: string;
  status: Extract<
    GateKeeperExecutionAttemptStatus,
    | "draft"
    | "confirmation_started"
    | "execution_requested"
    | "executed"
    | "failed"
  >;
  idempotencyKey: string;
  draft: GateKeeperCreateOpportunityConfirmationDraft;
  createdAt: string;
  executedAt: string | null;
  executedBy: string | null;
  executionError: string | null;
  requestedAt: string | null;
  requestedBy: string | null;
  resultSubjectId: string | null;
  resultSubjectType: string | null;
  updatedAt: string;
  validationErrors: Array<{
    field?: string;
    message?: string;
    severity?: string;
  }>;
};

export type GateKeeperCreateOpportunityPreflight = {
  savedDraft: GateKeeperCreateOpportunitySavedDraftAttempt;
  duplicatePreview: GateKeeperCreateOpportunityDuplicatePreview;
  futureOwner: "Leads/Opportunities";
  futureValidationRequirements: string[];
  missingRecommendedFields: string[];
  readiness: GateKeeperCreateOpportunityPreflightReadiness;
  currentEligibility: GateKeeperCreateOpportunityPreflightCurrentEligibility;
  canExecuteNow: boolean;
  blockers: GateKeeperExecutionBlocker[];
  executionResult: GateKeeperCreateOpportunityExecutionResultDisplay | null;
  safetyCopy: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toDraftValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeValidationErrors(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      return {
        field: typeof item.field === "string" ? item.field : undefined,
        message: typeof item.message === "string" ? item.message : undefined,
        severity: typeof item.severity === "string" ? item.severity : undefined
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function getGateKeeperCreateOpportunitySavedDraftFromPayload(
  payload: unknown
): GateKeeperCreateOpportunityConfirmationDraft | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    payload.purpose !== "create_opportunity_confirmation_draft" ||
    payload.draftValidationScope !== "gatekeeper_ledger_only" ||
    payload.canExecuteNow !== false ||
    !isRecord(payload.draft)
  ) {
    return null;
  }

  const draft = payload.draft;

  return {
    contactName: toDraftValue(draft.contactName).trim(),
    email: toDraftValue(draft.email).trim(),
    locationText: toDraftValue(draft.locationText).trim(),
    notes: toDraftValue(draft.notes).trim(),
    phone: toDraftValue(draft.phone).trim(),
    requestedAppointmentText: toDraftValue(
      draft.requestedAppointmentText
    ).trim(),
    requestedService: toDraftValue(draft.requestedService).trim(),
    sourceLabel: toDraftValue(draft.sourceLabel).trim()
  };
}

export function buildGateKeeperCreateOpportunitySavedDraftAttempt(input: {
  createdAt: string;
  id: string;
  idempotencyKey: string;
  requestedAt?: unknown;
  requestedBy?: unknown;
  executedAt?: unknown;
  executedBy?: unknown;
  executionError?: unknown;
  resultSubjectId?: unknown;
  resultSubjectType?: unknown;
  status: string;
  suggestionId: string;
  updatedAt: string;
  validatedPayload: unknown;
  validationErrors: unknown;
}): GateKeeperCreateOpportunitySavedDraftAttempt | null {
  if (
    input.status !== "draft" &&
    input.status !== "confirmation_started" &&
    input.status !== "execution_requested" &&
    input.status !== "executed" &&
    input.status !== "failed"
  ) {
    return null;
  }

  const draft = getGateKeeperCreateOpportunitySavedDraftFromPayload(
    input.validatedPayload
  );

  if (!draft) {
    return null;
  }

  return {
    id: input.id,
    suggestionId: input.suggestionId,
    status: input.status,
    idempotencyKey: input.idempotencyKey,
    draft,
    createdAt: input.createdAt,
    executedAt: typeof input.executedAt === "string" ? input.executedAt : null,
    executedBy: typeof input.executedBy === "string" ? input.executedBy : null,
    executionError:
      typeof input.executionError === "string" ? input.executionError : null,
    requestedAt:
      typeof input.requestedAt === "string" ? input.requestedAt : null,
    requestedBy:
      typeof input.requestedBy === "string" ? input.requestedBy : null,
    resultSubjectId:
      typeof input.resultSubjectId === "string" ? input.resultSubjectId : null,
    resultSubjectType:
      typeof input.resultSubjectType === "string"
        ? input.resultSubjectType
        : null,
    updatedAt: input.updatedAt,
    validationErrors: normalizeValidationErrors(input.validationErrors)
  };
}

export function selectLatestGateKeeperCreateOpportunityDraftAttempts(
  attempts: GateKeeperCreateOpportunitySavedDraftAttempt[]
) {
  const latestBySuggestion = new Map<
    string,
    GateKeeperCreateOpportunitySavedDraftAttempt
  >();

  for (const attempt of attempts) {
    const current = latestBySuggestion.get(attempt.suggestionId);

    if (
      !current ||
      new Date(attempt.updatedAt).getTime() >
        new Date(current.updatedAt).getTime()
    ) {
      latestBySuggestion.set(attempt.suggestionId, attempt);
    }
  }

  return latestBySuggestion;
}

function getReadiness(input: {
  duplicatePreview: GateKeeperCreateOpportunityDuplicatePreview;
  missingRecommendedFields: string[];
}): GateKeeperCreateOpportunityPreflightReadiness {
  if (input.missingRecommendedFields.length > 0) {
    return "not_ready_missing_required";
  }

  if (
    input.duplicatePreview.recommendation ===
      "high_confidence_duplicate_review_required" ||
    input.duplicatePreview.recommendation === "review_possible_duplicate"
  ) {
    return "review_duplicate_warning";
  }

  return "eligible_for_future_execution";
}

export function buildGateKeeperCreateOpportunityExecutionResultDisplay(
  savedDraft: GateKeeperCreateOpportunitySavedDraftAttempt
): GateKeeperCreateOpportunityExecutionResultDisplay | null {
  if (
    savedDraft.status === "executed" &&
    savedDraft.resultSubjectType === "opportunity" &&
    savedDraft.resultSubjectId
  ) {
    return {
      status: "executed",
      label: `Opportunity ${savedDraft.resultSubjectId.slice(0, 8)}`,
      href: `/leads/${savedDraft.resultSubjectId}`,
      occurredAt: savedDraft.executedAt,
      message: "Created by GateKeeper controlled execution."
    };
  }

  if (savedDraft.status === "failed") {
    return {
      status: "failed",
      label: "Execution failed",
      href: null,
      occurredAt: savedDraft.updatedAt,
      message:
        savedDraft.executionError ??
        "GateKeeper controlled execution failed before a result was linked."
    };
  }

  return null;
}

export function buildGateKeeperCreateOpportunityPreflight(input: {
  duplicatePreview: GateKeeperCreateOpportunityDuplicatePreview;
  savedDraft: GateKeeperCreateOpportunitySavedDraftAttempt;
}): GateKeeperCreateOpportunityPreflight {
  const missingRecommendedFields =
    getGateKeeperCreateOpportunityConfirmationMissingFields(
      input.savedDraft.draft
    );
  const readiness = getReadiness({
    duplicatePreview: input.duplicatePreview,
    missingRecommendedFields
  });
  const blockers: GateKeeperExecutionBlocker[] = [];

  if (missingRecommendedFields.length > 0) {
    blockers.push({
      code: "missing_required_confirmation_fields",
      message:
        "The saved confirmation draft is missing fields that future Opportunities validation will require.",
      severity: "blocking"
    });
  }

  if (
    input.duplicatePreview.recommendation ===
      "high_confidence_duplicate_review_required" ||
    input.duplicatePreview.recommendation === "review_possible_duplicate"
  ) {
    blockers.push({
      code: "duplicate_review_required",
      message:
        "The saved draft has possible existing record matches that future execution must review.",
      severity:
        input.duplicatePreview.recommendation ===
        "high_confidence_duplicate_review_required"
          ? "blocking"
          : "warning"
    });
  }

  if (input.savedDraft.status === "draft") {
    blockers.push({
      code: "execution_request_required",
      message:
        "Save and request execution in the GateKeeper ledger before creating an opportunity.",
      severity: "blocking"
    });
  }

  if (input.savedDraft.status === "confirmation_started") {
    blockers.push({
      code: "execution_request_required",
      message:
        "Mark this confirmation draft as execution_requested before controlled execution.",
      severity: "blocking"
    });
  }

  if (input.savedDraft.status === "executed") {
    blockers.push({
      code: "already_executed",
      message:
        "This GateKeeper execution attempt already created a canonical opportunity.",
      severity: "info"
    });
  }

  if (input.savedDraft.status === "failed") {
    blockers.push({
      code: "previous_execution_failed",
      message:
        input.savedDraft.executionError ??
        "The previous controlled execution attempt failed.",
      severity: "blocking"
    });
  }

  const canExecuteNow =
    input.savedDraft.status === "execution_requested" &&
    missingRecommendedFields.length === 0 &&
    input.duplicatePreview.recommendation !==
      "high_confidence_duplicate_review_required" &&
    !input.savedDraft.resultSubjectId;
  const currentEligibility =
    input.savedDraft.status === "executed"
      ? "executed"
      : input.savedDraft.status === "failed"
        ? "failed"
        : canExecuteNow
          ? "eligible_for_controlled_execution"
          : "draft_not_requested";

  return {
    savedDraft: input.savedDraft,
    duplicatePreview: input.duplicatePreview,
    futureOwner: "Leads/Opportunities",
    futureValidationRequirements: [
      "Validate the saved draft through the canonical Opportunities schema.",
      "Confirm tenant membership and opportunity creation permission.",
      "Review duplicate warnings before creating a new opportunity.",
      "Keep the source suggestion, artifact, thread, and message linkage for audit.",
      "Use the Opportunities-owned mutation path only in a future execution step."
    ],
    missingRecommendedFields,
    readiness,
    currentEligibility,
    canExecuteNow,
    blockers,
    executionResult: buildGateKeeperCreateOpportunityExecutionResultDisplay(
      input.savedDraft
    ),
    safetyCopy: [
      input.savedDraft.status === "executed"
        ? "This preflight is linked to a completed GateKeeper controlled execution result."
        : "This preflight does not create a lead.",
      canExecuteNow
        ? "A final explicit user action can create one opportunity through the Leads/Opportunities workflow."
        : input.savedDraft.status === "executed"
          ? "The created opportunity is linked from the execution ledger; do not create it again."
          : "A saved draft or request state alone does not create an opportunity.",
      "Controlled execution must validate through the Leads/Opportunities workflow."
    ]
  };
}

export function isGateKeeperCreateOpportunityExecutionDraftPayload(
  payload: unknown
): payload is GateKeeperCreateOpportunityExecutionDraftPayload {
  return getGateKeeperCreateOpportunitySavedDraftFromPayload(payload) !== null;
}
