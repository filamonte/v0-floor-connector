import type {
  PlatformStarterPackProvisioningRunDetail,
  PlatformStarterPackProvisioningRunItem
} from "@floorconnector/types";

import type {
  StarterPackProvisioningDraftReview,
  StarterPackProvisioningDraftReviewIssue
} from "./starter-pack-provisioning-draft-review-core";

export const STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION =
  "EXECUTE STARTER PACK";

export type StarterPackProvisioningExecutionEligibility = {
  eligible: boolean;
  issues: StarterPackProvisioningDraftReviewIssue[];
};

function hasBlockingReviewIssues(review: StarterPackProvisioningDraftReview) {
  return review.issues.some((issue) => issue.severity === "blocking");
}

function hasCreateItemWithDestinationId(
  items: PlatformStarterPackProvisioningRunItem[]
) {
  return items.some(
    (item) => item.action === "would_create" && Boolean(item.destinationRecordId)
  );
}

function hasUnsupportedExecutionItem(
  items: PlatformStarterPackProvisioningRunItem[]
) {
  return items.some(
    (item) =>
      !(
        (item.action === "would_create" && item.status === "pending") ||
        (item.action === "skipped_existing" && item.status === "skipped")
      )
  );
}

export function evaluateStarterPackProvisioningExecutionEligibility(input: {
  review: StarterPackProvisioningDraftReview;
  run: PlatformStarterPackProvisioningRunDetail;
  confirmationText: string;
}): StarterPackProvisioningExecutionEligibility {
  const issues: StarterPackProvisioningDraftReviewIssue[] = [];
  const { review, run, confirmationText } = input;

  if (run.status !== "approved" || review.runStatus !== "approved") {
    issues.push({
      severity: "blocking",
      message: "Only approved provisioning audit runs can be executed."
    });
  }

  if (review.starterPackStatus !== "published") {
    issues.push({
      severity: "blocking",
      message:
        "The starter pack must still be published before execution is allowed."
    });
  }

  if (review.freshnessStatus !== "fresh") {
    issues.push({
      severity: "blocking",
      message:
        "The latest provisioning review must be fresh before execution is allowed."
    });
  }

  if (hasBlockingReviewIssues(review)) {
    issues.push({
      severity: "blocking",
      message: "Resolve blocking review issues before execution."
    });
  }

  if (run.items.length < 1) {
    issues.push({
      severity: "blocking",
      message: "A provisioning run must include at least one audit item."
    });
  }

  if (hasCreateItemWithDestinationId(run.items)) {
    issues.push({
      severity: "blocking",
      message:
        "Create items already have destination ids. Re-run review before execution."
    });
  }

  if (hasUnsupportedExecutionItem(run.items)) {
    issues.push({
      severity: "blocking",
      message:
        "Execution supports only pending create items and skipped existing items."
    });
  }

  if (confirmationText !== STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION) {
    issues.push({
      severity: "blocking",
      message: `Type ${STARTER_PACK_PROVISIONING_EXECUTION_CONFIRMATION} exactly to execute this starter pack.`
    });
  }

  return {
    eligible: issues.length === 0,
    issues
  };
}
