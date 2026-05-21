import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem,
  PlatformStarterPackProvisioningRunItemAction
} from "@floorconnector/types";

import type {
  StarterPackProvisioningDryRunAction,
  StarterPackProvisioningDryRunReport,
  StarterPackProvisioningDryRunRow
} from "./starter-pack-provisioning-dry-run-core";

export type StarterPackProvisioningDraftFreshnessStatus =
  | "fresh"
  | "stale"
  | "invalid"
  | "unavailable";

export type StarterPackProvisioningDraftReviewIssueSeverity =
  | "info"
  | "warning"
  | "blocking";

export type StarterPackProvisioningDraftItemComparisonStatus =
  | "unchanged"
  | "changed"
  | "missing_from_current"
  | "added_in_current"
  | "invalid_now";

export type StarterPackProvisioningDraftReviewIssue = {
  severity: StarterPackProvisioningDraftReviewIssueSeverity;
  message: string;
};

export const STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION =
  "APPROVE DRY RUN ONLY";

export type StarterPackProvisioningDraftItemComparison = {
  comparisonStatus: StarterPackProvisioningDraftItemComparisonStatus;
  starterPackItemId: string | null;
  sourceItemType: string;
  sourceId: string | null;
  sourceName: string;
  draftAction: PlatformStarterPackProvisioningRunItemAction | null;
  currentAction: StarterPackProvisioningDryRunAction | null;
  draftMatchingExistingRecordId: string | null;
  currentMatchingExistingRecordId: string | null;
  sourceStatus: string | null;
  issue: string;
};

export type StarterPackProvisioningDraftReviewSummary = {
  draftItemCount: number;
  currentItemCount: number;
  unchangedCount: number;
  changedCount: number;
  missingFromCurrentCount: number;
  addedInCurrentCount: number;
  invalidNowCount: number;
};

export type StarterPackProvisioningDraftReview = {
  runId: string;
  runStatus: PlatformStarterPackProvisioningRunDetail["status"];
  targetOrganizationLabel: string;
  starterPackLabel: string;
  starterPackStatus: string | null;
  requestedAt: string;
  requestedByUserId: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
  confirmationText: string | null;
  itemSummary: StarterPackProvisioningDraftReviewSummary;
  freshnessStatus: StarterPackProvisioningDraftFreshnessStatus;
  issues: StarterPackProvisioningDraftReviewIssue[];
  itemComparisons: StarterPackProvisioningDraftItemComparison[];
  note: string;
};

export type StarterPackProvisioningApprovalEligibility = {
  eligible: boolean;
  issues: StarterPackProvisioningDraftReviewIssue[];
};

function sourceIdForDraftItem(item: PlatformStarterPackProvisioningRunItem) {
  return item.sourceItemType === "template_seed"
    ? item.sourceTemplateSeedId
    : item.sourceCatalogSeedId;
}

function sourceIdForDryRunRow(row: StarterPackProvisioningDryRunRow) {
  return row.sourceId;
}

function comparisonKey(input: {
  sourceItemType: string;
  sourceId: string | null;
  starterPackItemId: string | null;
}) {
  return [
    input.sourceItemType,
    input.sourceId ?? "missing-source",
    input.starterPackItemId ?? "missing-pack-item"
  ].join(":");
}

function expectedDryRunActionForDraftAction(
  action: PlatformStarterPackProvisioningRunItemAction
): StarterPackProvisioningDryRunAction | null {
  switch (action) {
    case "would_create":
      return "would_create";
    case "skipped_existing":
      return "already_exists";
    case "blocked":
      return "blocked";
    default:
      return null;
  }
}

function stringFromRecord(
  record: Record<string, unknown>,
  key: string
): string | null {
  const value = record[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function draftMatchingExistingRecordId(
  item: PlatformStarterPackProvisioningRunItem
) {
  return stringFromRecord(item.destinationSnapshot, "matchingExistingRecordId");
}

function draftSourceName(item: PlatformStarterPackProvisioningRunItem) {
  return (
    stringFromRecord(item.sourceSnapshot, "sourceName") ??
    sourceIdForDraftItem(item) ??
    "Unknown source seed"
  );
}

function draftSourceStatus(item: PlatformStarterPackProvisioningRunItem) {
  return stringFromRecord(item.sourceSnapshot, "sourceStatus");
}

function rowSourceStatus(row: StarterPackProvisioningDryRunRow | null) {
  return row?.sourceStatus ?? null;
}

function isCurrentDryRunRowApprovalBlocking(
  row: StarterPackProvisioningDryRunRow
) {
  return (
    row.action === "blocked" ||
    row.action === "unavailable" ||
    row.sourceStatus === "inactive" ||
    row.sourceStatus === "missing"
  );
}

function organizationLabel(run: PlatformStarterPackProvisioningRunDetail) {
  return run.organizationName ?? run.organizationSlug ?? run.organizationId;
}

function starterPackLabel(run: PlatformStarterPackProvisioningRunDetail) {
  return run.starterPackName ?? run.starterPackKey ?? run.starterPackId;
}

function summarizeComparisons(
  comparisons: StarterPackProvisioningDraftItemComparison[]
): StarterPackProvisioningDraftReviewSummary {
  return {
    draftItemCount: comparisons.filter(
      (comparison) => comparison.draftAction !== null
    ).length,
    currentItemCount: comparisons.filter(
      (comparison) => comparison.currentAction !== null
    ).length,
    unchangedCount: comparisons.filter(
      (comparison) => comparison.comparisonStatus === "unchanged"
    ).length,
    changedCount: comparisons.filter(
      (comparison) => comparison.comparisonStatus === "changed"
    ).length,
    missingFromCurrentCount: comparisons.filter(
      (comparison) => comparison.comparisonStatus === "missing_from_current"
    ).length,
    addedInCurrentCount: comparisons.filter(
      (comparison) => comparison.comparisonStatus === "added_in_current"
    ).length,
    invalidNowCount: comparisons.filter(
      (comparison) => comparison.comparisonStatus === "invalid_now"
    ).length
  };
}

function statusFromIssues(
  issues: StarterPackProvisioningDraftReviewIssue[],
  comparisons: StarterPackProvisioningDraftItemComparison[]
): StarterPackProvisioningDraftFreshnessStatus {
  if (
    issues.some(
      (issue) =>
        issue.severity === "blocking" &&
        issue.message.toLowerCase().includes("unavailable")
    )
  ) {
    return "unavailable";
  }

  if (
    issues.some((issue) => issue.severity === "blocking") ||
    comparisons.some((row) => row.comparisonStatus === "invalid_now")
  ) {
    return "invalid";
  }

  if (
    issues.some((issue) => issue.severity === "warning") ||
    comparisons.some(
      (row) =>
        row.comparisonStatus === "changed" ||
        row.comparisonStatus === "missing_from_current" ||
        row.comparisonStatus === "added_in_current"
    )
  ) {
    return "stale";
  }

  return "fresh";
}

export function buildStarterPackProvisioningDraftReview(input: {
  run: PlatformStarterPackProvisioningRunDetail;
  currentDryRun: StarterPackProvisioningDryRunReport;
}): StarterPackProvisioningDraftReview {
  const { run, currentDryRun } = input;
  const issues: StarterPackProvisioningDraftReviewIssue[] = [];
  const currentRowsByKey = new Map<string, StarterPackProvisioningDryRunRow>();
  const matchedCurrentKeys = new Set<string>();

  if (!currentDryRun.organization) {
    issues.push({
      severity: "blocking",
      message:
        "The target organization is unavailable in the current read model, so this draft cannot be considered fresh."
    });
  } else if (currentDryRun.organization.id !== run.organizationId) {
    issues.push({
      severity: "blocking",
      message:
        "The current dry run resolved a different organization than the stored draft."
    });
  }

  if (!currentDryRun.starterPack) {
    issues.push({
      severity: "blocking",
      message:
        "The starter pack is unavailable in the current read model, so this draft cannot be considered fresh."
    });
  } else {
    if (currentDryRun.starterPack.id !== run.starterPackId) {
      issues.push({
        severity: "blocking",
        message:
          "The current dry run resolved a different starter pack than the stored draft."
      });
    }

    if (currentDryRun.starterPack.status !== "published") {
      issues.push({
        severity: "blocking",
        message: `The starter pack is now ${currentDryRun.starterPack.status}; future approval must require a published pack.`
      });
    }
  }

  if (run.status !== "draft") {
    issues.push({
      severity: "info",
      message:
        "This review is designed for draft runs. Non-draft audit rows remain inspectable but are not approval-ready."
    });
  }

  if (run.items.length !== currentDryRun.rows.length) {
    issues.push({
      severity: "warning",
      message: `Draft item count is ${run.items.length}, but the current dry run has ${currentDryRun.rows.length} item(s).`
    });
  }

  const approvalBlockingCurrentRows = currentDryRun.rows.filter(
    isCurrentDryRunRowApprovalBlocking
  );

  if (approvalBlockingCurrentRows.length > 0) {
    issues.push({
      severity: "blocking",
      message: `The current dry run has ${approvalBlockingCurrentRows.length} source availability blocker(s); future approval must require a new clean draft after the source state is resolved.`
    });
  }

  for (const row of currentDryRun.rows) {
    currentRowsByKey.set(
      comparisonKey({
        sourceItemType: row.sourceItemType,
        sourceId: sourceIdForDryRunRow(row),
        starterPackItemId: row.starterPackItemId
      }),
      row
    );
  }

  const itemComparisons: StarterPackProvisioningDraftItemComparison[] = [];

  for (const item of run.items) {
    const sourceId = sourceIdForDraftItem(item);
    const key = comparisonKey({
      sourceItemType: item.sourceItemType,
      sourceId,
      starterPackItemId: item.starterPackItemId
    });
    const currentRow = currentRowsByKey.get(key) ?? null;
    const expectedCurrentAction = expectedDryRunActionForDraftAction(item.action);
    const draftMatchId = draftMatchingExistingRecordId(item);

    if (!currentRow) {
      itemComparisons.push({
        comparisonStatus: "missing_from_current",
        starterPackItemId: item.starterPackItemId,
        sourceItemType: item.sourceItemType,
        sourceId,
        sourceName: draftSourceName(item),
        draftAction: item.action,
        currentAction: null,
        draftMatchingExistingRecordId: draftMatchId,
        currentMatchingExistingRecordId: null,
        sourceStatus: draftSourceStatus(item),
        issue:
          "This stored draft item no longer appears in the current starter-pack dry run."
      });
      continue;
    }

    matchedCurrentKeys.add(key);

    const sourceStatus = rowSourceStatus(currentRow);

    if (
      currentRow.action === "blocked" ||
      currentRow.action === "unavailable" ||
      sourceStatus === "inactive" ||
      sourceStatus === "missing"
    ) {
      itemComparisons.push({
        comparisonStatus: "invalid_now",
        starterPackItemId: item.starterPackItemId,
        sourceItemType: item.sourceItemType,
        sourceId,
        sourceName: currentRow.sourceName,
        draftAction: item.action,
        currentAction: currentRow.action,
        draftMatchingExistingRecordId: draftMatchId,
        currentMatchingExistingRecordId: currentRow.matchingExistingRecordId,
        sourceStatus,
        issue:
          "The source seed is now blocked or unavailable in the current dry run."
      });
      continue;
    }

    if (
      expectedCurrentAction !== currentRow.action ||
      (expectedCurrentAction === "already_exists" &&
        draftMatchId !== currentRow.matchingExistingRecordId)
    ) {
      itemComparisons.push({
        comparisonStatus: "changed",
        starterPackItemId: item.starterPackItemId,
        sourceItemType: item.sourceItemType,
        sourceId,
        sourceName: currentRow.sourceName,
        draftAction: item.action,
        currentAction: currentRow.action,
        draftMatchingExistingRecordId: draftMatchId,
        currentMatchingExistingRecordId: currentRow.matchingExistingRecordId,
        sourceStatus,
        issue:
          "The current dry-run action or already-existing destination match differs from the stored draft."
      });
      continue;
    }

    itemComparisons.push({
      comparisonStatus: "unchanged",
      starterPackItemId: item.starterPackItemId,
      sourceItemType: item.sourceItemType,
      sourceId,
      sourceName: currentRow.sourceName,
      draftAction: item.action,
      currentAction: currentRow.action,
      draftMatchingExistingRecordId: draftMatchId,
      currentMatchingExistingRecordId: currentRow.matchingExistingRecordId,
      sourceStatus,
      issue: "This draft item still matches the current dry run."
    });
  }

  for (const row of currentDryRun.rows) {
    const key = comparisonKey({
      sourceItemType: row.sourceItemType,
      sourceId: sourceIdForDryRunRow(row),
      starterPackItemId: row.starterPackItemId
    });

    if (matchedCurrentKeys.has(key)) {
      continue;
    }

    itemComparisons.push({
      comparisonStatus:
        isCurrentDryRunRowApprovalBlocking(row)
          ? "invalid_now"
          : "added_in_current",
      starterPackItemId: row.starterPackItemId,
      sourceItemType: row.sourceItemType,
      sourceId: row.sourceId,
      sourceName: row.sourceName,
      draftAction: null,
      currentAction: row.action,
      draftMatchingExistingRecordId: null,
      currentMatchingExistingRecordId: row.matchingExistingRecordId,
      sourceStatus: row.sourceStatus,
      issue:
        isCurrentDryRunRowApprovalBlocking(row)
          ? "A current dry-run item was added and is blocked or unavailable."
          : "This current dry-run item was not captured in the stored draft."
    });
  }

  const itemSummary = summarizeComparisons(itemComparisons);
  const freshnessStatus = statusFromIssues(issues, itemComparisons);

  return {
    runId: run.id,
    runStatus: run.status,
    targetOrganizationLabel: organizationLabel(run),
    starterPackLabel: starterPackLabel(run),
    starterPackStatus: currentDryRun.starterPack?.status ?? null,
    requestedAt: run.requestedAt,
    requestedByUserId: run.requestedByUserId,
    approvedAt: run.approvedAt,
    approvedByUserId: run.approvedByUserId,
    confirmationText: run.confirmationText,
    itemSummary,
    freshnessStatus,
    issues:
      issues.length > 0
        ? issues
        : [
            {
              severity: "info",
              message:
                "The stored draft currently matches the fresh server-side dry run."
            }
          ],
    itemComparisons,
    note:
      "Review only. This comparison does not approve, execute, provision, copy, void, roll back, or mutate contractor-owned records."
  };
}

export function evaluateStarterPackProvisioningApprovalEligibility(input: {
  review: StarterPackProvisioningDraftReview;
  confirmationText: string;
}): StarterPackProvisioningApprovalEligibility {
  const issues: StarterPackProvisioningDraftReviewIssue[] = [];
  const { review, confirmationText } = input;

  if (review.runStatus !== "draft") {
    issues.push({
      severity: "blocking",
      message: "Only draft provisioning audit runs can be approved."
    });
  }

  if (review.starterPackStatus !== "published") {
    issues.push({
      severity: "blocking",
      message:
        "The starter pack must still be published before an audit draft can be approved."
    });
  }

  if (review.freshnessStatus !== "fresh") {
    issues.push({
      severity: "blocking",
      message:
        "The latest draft review must be fresh before audit-only approval is allowed."
    });
  }

  if (review.issues.some((issue) => issue.severity === "blocking")) {
    issues.push({
      severity: "blocking",
      message:
        "Resolve blocking review issues before approving this audit draft."
    });
  }

  if (review.itemSummary.draftItemCount < 1) {
    issues.push({
      severity: "blocking",
      message: "A provisioning audit draft must include at least one item."
    });
  }

  if (confirmationText !== STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION) {
    issues.push({
      severity: "blocking",
      message: `Type ${STARTER_PACK_PROVISIONING_APPROVAL_CONFIRMATION} to approve this audit draft.`
    });
  }

  return {
    eligible: issues.length === 0,
    issues
  };
}
