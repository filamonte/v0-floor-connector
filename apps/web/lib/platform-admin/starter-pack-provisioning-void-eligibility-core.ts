import type { PlatformStarterPackProvisioningRunDetail } from "@floorconnector/types";

import type {
  StarterPackProvisioningVoidReadiness,
  StarterPackProvisioningVoidReadinessRow
} from "./starter-pack-provisioning-void-readiness-core";

export const STARTER_PACK_PROVISIONING_VOID_CONFIRMATION = "VOID AUDIT ONLY";

export type StarterPackProvisioningVoidEligibilityStatus =
  | "eligible"
  | "blocked"
  | "already_voided"
  | "unavailable";

export type StarterPackProvisioningVoidEligibilityIssueSeverity =
  | "info"
  | "warning"
  | "blocking";

export type StarterPackProvisioningVoidEligibilityIssue = {
  severity: StarterPackProvisioningVoidEligibilityIssueSeverity;
  message: string;
};

export type StarterPackProvisioningVoidEligibility = {
  runId: string;
  eligible: boolean;
  recommendedStrategy: "audit_only";
  unavailableStrategies: Array<"archive_unused_future" | "detach_lineage_future">;
  confirmationPhrase: typeof STARTER_PACK_PROVISIONING_VOID_CONFIRMATION;
  status: StarterPackProvisioningVoidEligibilityStatus;
  issues: StarterPackProvisioningVoidEligibilityIssue[];
  operatorSummary: string;
  requiredMetadata: {
    voidReasonRequired: true;
    voidReadinessSnapshotRequired: true;
    voidStrategy: "audit_only";
  };
};

function isCompletedStatus(status: PlatformStarterPackProvisioningRunDetail["status"]) {
  return status === "completed" || status === "completed_with_warnings";
}

function hasReviewableRunItem(run: PlatformStarterPackProvisioningRunDetail) {
  return run.items.some(
    (item) =>
      Boolean(item.destinationRecordId) ||
      item.status === "completed" ||
      item.action === "created"
  );
}

function usageWarningForRow(
  row: StarterPackProvisioningVoidReadinessRow
): StarterPackProvisioningVoidEligibilityIssue | null {
  if (row.usageStatus === "used") {
    return {
      severity: "warning",
      message:
        "One or more destination records appear in live workflow data. Audit-only void may still be considered because it does not mutate contractor-owned records."
    };
  }

  if (row.usageStatus === "unknown") {
    return {
      severity: "warning",
      message:
        "One or more destination usage checks are unknown. Audit-only void may still be considered, but archive/delete/detach must remain unavailable."
    };
  }

  if (row.usageStatus === "missing_destination") {
    return {
      severity: "warning",
      message:
        "One or more destination records are missing or lack a destination id. Audit-only void may still be considered as audit metadata only."
    };
  }

  return null;
}

function uniqueIssues(
  issues: StarterPackProvisioningVoidEligibilityIssue[]
): StarterPackProvisioningVoidEligibilityIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.severity}:${issue.message}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildResult(input: {
  run: PlatformStarterPackProvisioningRunDetail;
  eligible: boolean;
  status: StarterPackProvisioningVoidEligibilityStatus;
  issues: StarterPackProvisioningVoidEligibilityIssue[];
  operatorSummary: string;
}): StarterPackProvisioningVoidEligibility {
  return {
    runId: input.run.id,
    eligible: input.eligible,
    recommendedStrategy: "audit_only",
    unavailableStrategies: ["archive_unused_future", "detach_lineage_future"],
    confirmationPhrase: STARTER_PACK_PROVISIONING_VOID_CONFIRMATION,
    status: input.status,
    issues: uniqueIssues([
      ...input.issues,
      {
        severity: "info",
        message:
          "Archive, delete, and detach-lineage strategies are future-only and unavailable in this eligibility model."
      }
    ]),
    operatorSummary: input.operatorSummary,
    requiredMetadata: {
      voidReasonRequired: true,
      voidReadinessSnapshotRequired: true,
      voidStrategy: "audit_only"
    }
  };
}

export function evaluateStarterPackProvisioningVoidEligibility(input: {
  run: PlatformStarterPackProvisioningRunDetail;
  usageReadiness: StarterPackProvisioningVoidReadiness | null;
}): StarterPackProvisioningVoidEligibility {
  const { run, usageReadiness } = input;

  if (run.status === "voided") {
    return buildResult({
      run,
      eligible: false,
      status: "already_voided",
      issues: [
        {
          severity: "info",
          message:
            "This provisioning run is already voided. Future audit-only void should return the existing metadata without overwriting it."
        }
      ],
      operatorSummary:
        "Already voided. No future audit-only void mutation should overwrite the existing void metadata."
    });
  }

  if (!isCompletedStatus(run.status)) {
    return buildResult({
      run,
      eligible: false,
      status: "blocked",
      issues: [
        {
          severity: "blocking",
          message:
            "Only completed or completed-with-warnings provisioning runs can be considered for audit-only void."
        }
      ],
      operatorSummary:
        "Blocked. Audit-only void is limited to completed provisioning runs."
    });
  }

  if (!hasReviewableRunItem(run)) {
    return buildResult({
      run,
      eligible: false,
      status: "blocked",
      issues: [
        {
          severity: "blocking",
          message:
            "This run has no completed or destination-linked items to review for audit-only void."
        }
      ],
      operatorSummary:
        "Blocked. There are no completed or destination-linked run items to review."
    });
  }

  if (!usageReadiness || usageReadiness.runId !== run.id) {
    return buildResult({
      run,
      eligible: false,
      status: "unavailable",
      issues: [
        {
          severity: "blocking",
          message:
            "Void-readiness usage results are unavailable for this run. Future audit-only void must recompute usage before updating audit metadata."
        }
      ],
      operatorSummary:
        "Unavailable. Usage readiness must be recomputed before audit-only void can be considered."
    });
  }

  if (!usageReadiness.canConsiderAuditOnlyVoid) {
    return buildResult({
      run,
      eligible: false,
      status: "blocked",
      issues: [
        {
          severity: "blocking",
          message:
            "The current void-readiness model does not have reviewable destination rows for audit-only void."
        }
      ],
      operatorSummary:
        "Blocked. The current read-only usage model has no reviewable destination rows."
    });
  }

  const usageIssues = usageReadiness.rows
    .map(usageWarningForRow)
    .filter(
      (issue): issue is StarterPackProvisioningVoidEligibilityIssue =>
        Boolean(issue)
    );

  return buildResult({
    run,
    eligible: true,
    status: "eligible",
    issues: usageIssues,
    operatorSummary:
      "Eligible for future audit-only void review. No void action exists yet, and audit-only void would not change contractor-owned records."
  });
}
