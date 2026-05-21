import type {
  PlatformStarterPackProvisioningAttemptOutcome,
  PlatformStarterPackProvisioningRunDetail
} from "@floorconnector/types";

import { STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION } from "./starter-pack-provisioning-execution-core";
import type {
  StarterPackProvisioningDraftFreshnessStatus,
  StarterPackProvisioningDraftReview
} from "./starter-pack-provisioning-draft-review-core";

export type StarterPackProvisioningExecutionAttemptReasonCode =
  | "missing_or_invalid_confirmation"
  | "missing_or_invalid_run_id"
  | "run_not_found"
  | "run_not_approved"
  | "review_not_fresh"
  | "blocking_review_issue"
  | "starter_pack_not_published"
  | "unsupported_audit_items"
  | "already_completed"
  | "database_guard_rejected"
  | "unknown_rejection";

export type StarterPackProvisioningExecutionAttemptDescriptor = {
  outcome: PlatformStarterPackProvisioningAttemptOutcome;
  reasonCode: StarterPackProvisioningExecutionAttemptReasonCode;
  safeMessage: string;
};

function normalizeIssueMessage(message: string) {
  return message.toLowerCase();
}

function outcomeForReason(
  reasonCode: StarterPackProvisioningExecutionAttemptReasonCode
): PlatformStarterPackProvisioningAttemptOutcome {
  switch (reasonCode) {
    case "already_completed":
      return "already_completed";
    case "database_guard_rejected":
      return "failed_before_execution";
    case "missing_or_invalid_confirmation":
    case "missing_or_invalid_run_id":
    case "run_not_found":
      return "rejected";
    default:
      return "blocked";
  }
}

export function describeProvisioningExecutionAttemptFromIssue(
  issueMessage: string
): StarterPackProvisioningExecutionAttemptDescriptor {
  const normalized = normalizeIssueMessage(issueMessage);
  let reasonCode: StarterPackProvisioningExecutionAttemptReasonCode =
    "unknown_rejection";
  let safeMessage =
    "Provisioning execution was blocked before tenant-owned records were written.";

  if (
    normalized.includes(STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION.toLowerCase()) ||
    normalized.includes("confirmation")
  ) {
    reasonCode = "missing_or_invalid_confirmation";
    safeMessage = `Type ${STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION} exactly before executing an approved starter-pack run.`;
  } else if (normalized.includes("valid approved provisioning run")) {
    reasonCode = "missing_or_invalid_run_id";
    safeMessage = "Select a valid approved provisioning run before execution.";
  } else if (normalized.includes("unable to load")) {
    reasonCode = "run_not_found";
    safeMessage =
      "The provisioning run could not be loaded, so execution was rejected.";
  } else if (normalized.includes("approved")) {
    reasonCode = "run_not_approved";
    safeMessage =
      "Only approved provisioning audit runs can be executed.";
  } else if (normalized.includes("fresh")) {
    reasonCode = "review_not_fresh";
    safeMessage =
      "The latest provisioning review must be fresh before execution is allowed.";
  } else if (normalized.includes("blocking")) {
    reasonCode = "blocking_review_issue";
    safeMessage =
      "Blocking review issues must be resolved before execution is allowed.";
  } else if (normalized.includes("published")) {
    reasonCode = "starter_pack_not_published";
    safeMessage =
      "The starter pack must still be published before execution is allowed.";
  } else if (
    normalized.includes("unsupported") ||
    normalized.includes("destination ids") ||
    normalized.includes("at least one audit item")
  ) {
    reasonCode = "unsupported_audit_items";
    safeMessage =
      "The audit run contains unsupported, empty, or already-processed items.";
  }

  return {
    outcome: outcomeForReason(reasonCode),
    reasonCode,
    safeMessage
  };
}

export function describeProvisioningExecutionAttemptForSchemaFailure(input: {
  runId: string;
  confirmationText: string;
}): StarterPackProvisioningExecutionAttemptDescriptor {
  if (!input.runId.trim()) {
    return {
      outcome: "rejected",
      reasonCode: "missing_or_invalid_run_id",
      safeMessage: "Select a valid approved provisioning run before execution."
    };
  }

  if (
    input.confirmationText.trim() !==
    STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION
  ) {
    return {
      outcome: "rejected",
      reasonCode: "missing_or_invalid_confirmation",
      safeMessage: `Type ${STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION} exactly before executing an approved starter-pack run.`
    };
  }

  return {
    outcome: "rejected",
    reasonCode: "unknown_rejection",
    safeMessage:
      "Provisioning execution was rejected before tenant-owned records were written."
  };
}

export function describeProvisioningExecutionAttemptForDatabaseGuard(): StarterPackProvisioningExecutionAttemptDescriptor {
  return {
    outcome: "failed_before_execution",
    reasonCode: "database_guard_rejected",
    safeMessage:
      "The database execution guard rejected the request before completion. Review the run state and create a fresh approval if needed."
  };
}

export function describeProvisioningExecutionAttemptForAlreadyCompleted(): StarterPackProvisioningExecutionAttemptDescriptor {
  return {
    outcome: "already_completed",
    reasonCode: "already_completed",
    safeMessage:
      "Provisioning run was already completed. No duplicate contractor-owned records were created."
  };
}

export function attemptContextFromReview(input: {
  run: PlatformStarterPackProvisioningRunDetail | null;
  review: StarterPackProvisioningDraftReview | null;
}) {
  const { run, review } = input;

  return {
    runId: run?.id ?? review?.runId ?? null,
    starterPackId: run?.starterPackId ?? null,
    organizationId: run?.organizationId ?? null,
    reviewStatus: review?.freshnessStatus ?? null,
    runStatus: run?.status ?? review?.runStatus ?? null
  };
}

export function freshnessNeedsAttemptAttention(
  status: StarterPackProvisioningDraftFreshnessStatus | null
) {
  return status === "stale" || status === "invalid" || status === "unavailable";
}
