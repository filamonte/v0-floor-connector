export type PortalAssessmentCaptureRequestStatus =
  | "requested"
  | "received"
  | "under_review"
  | "accepted";

export type PortalAssessmentCaptureItem = {
  id: string;
  label: string;
  status: PortalAssessmentCaptureRequestStatus;
  customerPrompt: string;
  submittedSummary?: string | null;
  internalReviewRequired: boolean;
};

export type PortalAssessmentCaptureInput = {
  project: {
    id: string;
    name: string;
    customerVisibleStatus?: string | null;
  };
  requestedItems: PortalAssessmentCaptureItem[];
  portalHasProjectAccess: boolean;
};

export type PortalAssessmentCaptureSummary = {
  projectId: string;
  projectName: string;
  statusLabel: string;
  customerMessage: string;
  requestedCount: number;
  receivedCount: number;
  underReviewCount: number;
  acceptedCount: number;
  nextCustomerPrompts: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
  reviewBoundary: {
    label: string;
    detail: string;
  };
  safeVisibilityNotes: string[];
};

function countByStatus(
  items: PortalAssessmentCaptureItem[],
  status: PortalAssessmentCaptureRequestStatus
) {
  return items.filter((item) => item.status === status).length;
}

function buildCustomerMessage(input: {
  requestedCount: number;
  receivedCount: number;
  underReviewCount: number;
  acceptedCount: number;
}) {
  if (input.requestedCount > 0) {
    return "Your contractor may need a little more project information before estimating.";
  }

  if (input.underReviewCount > 0) {
    return "Your contractor is reviewing the information you shared.";
  }

  if (input.acceptedCount > 0 || input.receivedCount > 0) {
    return "Your shared project details are available for contractor review.";
  }

  return "No customer assessment requests are open for this project.";
}

export function derivePortalAssessmentCaptureSummary(
  input: PortalAssessmentCaptureInput
): PortalAssessmentCaptureSummary {
  const visibleItems = input.portalHasProjectAccess ? input.requestedItems : [];
  const requestedCount = countByStatus(visibleItems, "requested");
  const receivedCount = countByStatus(visibleItems, "received");
  const underReviewCount = countByStatus(visibleItems, "under_review");
  const acceptedCount = countByStatus(visibleItems, "accepted");
  const nextCustomerPrompts = visibleItems
    .filter((item) => item.status === "requested")
    .map((item) => ({
      id: item.id,
      label: item.label,
      prompt: item.customerPrompt
    }));

  return {
    projectId: input.project.id,
    projectName: input.project.name,
    statusLabel:
      requestedCount > 0
        ? "Info requested"
        : underReviewCount > 0
          ? "Under contractor review"
          : acceptedCount + receivedCount > 0
            ? "Info received"
            : "No assessment requests",
    customerMessage: input.portalHasProjectAccess
      ? buildCustomerMessage({
          requestedCount,
          receivedCount,
          underReviewCount,
          acceptedCount
        })
      : "Project assessment details are not available for this portal session.",
    requestedCount,
    receivedCount,
    underReviewCount,
    acceptedCount,
    nextCustomerPrompts,
    reviewBoundary: {
      label: "Contractor review required",
      detail:
        "Customer-provided assessment details help the contractor review the project, but they do not approve scope, pricing, or estimates."
    },
    safeVisibilityNotes: input.portalHasProjectAccess
      ? [
          "Portal shows customer-safe requested information only.",
          "Internal blockers, estimator notes, pricing logic, and contractor-only proof remain hidden.",
          "Customer input contributes to project context but does not become operational source of truth."
        ]
      : [
          "Portal access is required before assessment prompts or submitted context are visible."
        ]
  };
}
