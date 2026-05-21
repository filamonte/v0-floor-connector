import type { PlatformStarterPackProvisioningRun } from "@floorconnector/types";

import type {
  StarterPackProvisioningDraftFreshnessStatus,
  StarterPackProvisioningDraftReview
} from "./starter-pack-provisioning-draft-review-core";

export type StarterPackProvisioningAuditFilter =
  | "all"
  | "draft"
  | "approved"
  | "completed"
  | "failed"
  | "attention";

export type StarterPackProvisioningRunHealth =
  | "draft"
  | "approved"
  | "completed"
  | "failed"
  | "needs_review"
  | "stale"
  | "execution_unavailable";

export type StarterPackProvisioningRunHealthSummary = {
  health: StarterPackProvisioningRunHealth;
  label: string;
  note: string;
};

export type StarterPackProvisioningObservabilitySummary = {
  totalRuns: number;
  draftCount: number;
  approvedCount: number;
  completedCount: number;
  failedCount: number;
  staleOrBlockedReviewCount: number;
  runsWithDestinationRecordsCount: number;
  lastRunTimestamp: string | null;
  lastCompletedRunTimestamp: string | null;
};

export type StarterPackProvisioningObservabilityModel = {
  summary: StarterPackProvisioningObservabilitySummary;
  runs: Array<{
    run: PlatformStarterPackProvisioningRun;
    health: StarterPackProvisioningRunHealthSummary;
  }>;
};

function reviewHasBlockingIssue(review: StarterPackProvisioningDraftReview) {
  return review.issues.some((issue) => issue.severity === "blocking");
}

function isCompletedStatus(status: PlatformStarterPackProvisioningRun["status"]) {
  return status === "completed" || status === "completed_with_warnings";
}

function lastTimestamp(
  runs: PlatformStarterPackProvisioningRun[],
  getTimestamp: (run: PlatformStarterPackProvisioningRun) => string | null
) {
  return runs
    .map(getTimestamp)
    .filter((timestamp): timestamp is string => Boolean(timestamp))
    .sort((a, b) => b.localeCompare(a))[0] ?? null;
}

function attentionNeededForReview(
  review: StarterPackProvisioningDraftReview | null
) {
  return (
    review?.freshnessStatus === "stale" ||
    review?.freshnessStatus === "invalid" ||
    review?.freshnessStatus === "unavailable" ||
    Boolean(review && reviewHasBlockingIssue(review))
  );
}

export function describeStarterPackProvisioningRunHealth(input: {
  run: PlatformStarterPackProvisioningRun;
  review?: StarterPackProvisioningDraftReview | null;
}): StarterPackProvisioningRunHealthSummary {
  const { run, review = null } = input;

  if (run.status === "failed") {
    return {
      health: "failed",
      label: "Failed",
      note:
        run.errorMessage ??
        "This audit run is failed. Review the safe error message before retrying in a future workflow."
    };
  }

  if (isCompletedStatus(run.status)) {
    return {
      health: "completed",
      label:
        run.status === "completed_with_warnings"
          ? "Completed with warnings"
          : "Completed",
      note:
        "Completed provisioning created contractor-owned copies but did not change defaults."
    };
  }

  if (run.status === "voided" || run.status === "running") {
    return {
      health: "execution_unavailable",
      label:
        run.status === "voided" ? "Execution unavailable" : "Needs review",
      note: `This run is ${run.status}; no rollback, void, or manual execution control is available here.`
    };
  }

  if (!review) {
    return {
      health: "needs_review",
      label: "Needs review",
      note:
        "Open the run review to recompute freshness and inspect execution blockers."
    };
  }

  if (attentionNeededForReview(review)) {
    const freshnessLabel = review.freshnessStatus.replace(/_/g, " ");

    return {
      health: review.freshnessStatus === "stale" ? "stale" : "execution_unavailable",
      label: review.freshnessStatus === "stale" ? "Stale" : "Execution unavailable",
      note: `Latest review is ${freshnessLabel}; rejected attempts should not change tenant-owned records.`
    };
  }

  if (run.status === "approved") {
    return {
      health: "approved",
      label: "Approved",
      note:
        "Approved for the guarded future/current execution path only when review remains fresh."
    };
  }

  return {
    health: "draft",
    label: "Draft",
    note:
      "Draft audit run. Review and approval are required before any execution can be considered."
  };
}

export function buildStarterPackProvisioningObservability(input: {
  runs: PlatformStarterPackProvisioningRun[];
  reviewsByRunId?: Record<string, StarterPackProvisioningDraftReview | null>;
}): StarterPackProvisioningObservabilityModel {
  const reviewsByRunId = input.reviewsByRunId ?? {};
  const runs = input.runs.map((run) => ({
    run,
    health: describeStarterPackProvisioningRunHealth({
      run,
      review: reviewsByRunId[run.id] ?? null
    })
  }));

  return {
    summary: {
      totalRuns: input.runs.length,
      draftCount: input.runs.filter((run) => run.status === "draft").length,
      approvedCount: input.runs.filter((run) => run.status === "approved")
        .length,
      completedCount: input.runs.filter((run) => isCompletedStatus(run.status))
        .length,
      failedCount: input.runs.filter((run) => run.status === "failed").length,
      staleOrBlockedReviewCount: runs.filter((entry) =>
        entry.health.health === "stale" ||
        entry.health.health === "execution_unavailable"
      ).length,
      runsWithDestinationRecordsCount: input.runs.filter(
        (run) => (run.destinationRecordCount ?? 0) > 0
      ).length,
      lastRunTimestamp: lastTimestamp(input.runs, (run) => run.createdAt),
      lastCompletedRunTimestamp: lastTimestamp(input.runs, (run) => run.completedAt)
    },
    runs
  };
}

export function filterStarterPackProvisioningRuns(input: {
  model: StarterPackProvisioningObservabilityModel;
  filter: StarterPackProvisioningAuditFilter;
}) {
  const { model, filter } = input;

  if (filter === "all") {
    return model.runs;
  }

  if (filter === "completed") {
    return model.runs.filter((entry) => isCompletedStatus(entry.run.status));
  }

  if (filter === "attention") {
    return model.runs.filter(
      (entry) =>
        entry.health.health === "stale" ||
        entry.health.health === "execution_unavailable"
    );
  }

  return model.runs.filter((entry) => entry.run.status === filter);
}

export function normalizeStarterPackProvisioningAuditFilter(
  value: string | null | undefined
): StarterPackProvisioningAuditFilter {
  switch (value) {
    case "draft":
    case "approved":
    case "completed":
    case "failed":
    case "attention":
      return value;
    default:
      return "all";
  }
}

export function freshnessStatusNeedsAttention(
  status: StarterPackProvisioningDraftFreshnessStatus | null | undefined
) {
  return status === "stale" || status === "invalid" || status === "unavailable";
}
