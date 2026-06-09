export type GuidedCaptureChecklistStatus =
  | "complete"
  | "needs_review"
  | "missing";

export type GuidedCaptureChecklistItem = {
  id: string;
  label: string;
  status: GuidedCaptureChecklistStatus;
  detail: string;
  owner: "Project" | "Estimator" | "Customer";
  sourceHref: string;
};

export type GuidedCaptureWorkspaceInput = {
  project: {
    id: string;
    name: string;
  };
  opportunity?: {
    id: string;
    requirementsSummary?: string | null;
    siteAssessmentStatus?: string | null;
    siteAssessmentCompletedAt?: string | null;
    measurements?: Array<{
      id: string;
      areaLabel?: string | null;
      valueNumeric?: string | number | null;
    }>;
    observations?: Array<{
      id: string;
      title: string;
      severity?: string | null;
    }>;
    attachments?: Array<{
      id: string;
      attachmentType: string;
      mimeType: string;
      tag?: string | null;
    }>;
  } | null;
  estimates?: Array<{
    id: string;
    status: string;
  }>;
};

export type GuidedCaptureWorkspaceSummary = {
  projectId: string;
  projectName: string;
  statusLabel: string;
  handoffLabel: string;
  readyForEstimator: boolean;
  checklist: GuidedCaptureChecklistItem[];
  missingInfoGuidance: string[];
  riskPrompts: string[];
  boundaryNote: string;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasPositiveMeasurement(
  measurement: NonNullable<
    NonNullable<GuidedCaptureWorkspaceInput["opportunity"]>["measurements"]
  >[number]
) {
  const value = Number(measurement.valueNumeric ?? 0);

  return Number.isFinite(value) && value > 0;
}

function isPhotoLike(
  attachment: NonNullable<
    NonNullable<GuidedCaptureWorkspaceInput["opportunity"]>["attachments"]
  >[number]
) {
  return (
    attachment.mimeType.toLowerCase().startsWith("image/") ||
    attachment.attachmentType.toLowerCase().includes("photo") ||
    attachment.tag?.toLowerCase().includes("photo") === true
  );
}

function isSiteAssessmentComplete(
  opportunity: GuidedCaptureWorkspaceInput["opportunity"]
) {
  return Boolean(
    opportunity?.siteAssessmentCompletedAt ||
    opportunity?.siteAssessmentStatus === "completed" ||
    opportunity?.siteAssessmentStatus === "site_assessment_complete"
  );
}

function makeItem(input: GuidedCaptureChecklistItem) {
  return input;
}

export function deriveGuidedCaptureWorkspaceSummary(
  input: GuidedCaptureWorkspaceInput
): GuidedCaptureWorkspaceSummary {
  const opportunity = input.opportunity ?? null;
  const projectHref = `/projects/${input.project.id}`;
  const opportunityHref = opportunity
    ? `/leads/${opportunity.id}`
    : projectHref;
  const measurements = opportunity?.measurements ?? [];
  const observations = opportunity?.observations ?? [];
  const attachments = opportunity?.attachments ?? [];
  const hasMeasurements = measurements.some(hasPositiveMeasurement);
  const hasPhotos = attachments.some(isPhotoLike);
  const checklist: GuidedCaptureChecklistItem[] = [
    makeItem({
      id: "scope-summary",
      label: "Scope summary",
      status: hasText(opportunity?.requirementsSummary)
        ? "complete"
        : "missing",
      detail: hasText(opportunity?.requirementsSummary)
        ? "Scope notes are available for project review."
        : "Add customer goals, requested surfaces, prep assumptions, and finish expectations before estimating.",
      owner: "Project",
      sourceHref: opportunityHref
    }),
    makeItem({
      id: "site-assessment",
      label: "Site assessment",
      status: isSiteAssessmentComplete(opportunity)
        ? "complete"
        : "needs_review",
      detail: isSiteAssessmentComplete(opportunity)
        ? "Site assessment is marked complete."
        : "Confirm whether site assessment is complete before estimator handoff.",
      owner: "Project",
      sourceHref: opportunityHref
    }),
    makeItem({
      id: "measurements",
      label: "Measurements",
      status: hasMeasurements ? "complete" : "missing",
      detail: hasMeasurements
        ? "At least one reviewed measurement is available."
        : "Capture reviewed area, linear, or count measurements from the source record.",
      owner: "Estimator",
      sourceHref: opportunityHref
    }),
    makeItem({
      id: "surface-observations",
      label: "Surface observations",
      status: observations.length > 0 ? "complete" : "missing",
      detail:
        observations.length > 0
          ? "Surface-condition observations are available for review."
          : "Add substrate, coating, moisture, crack, contamination, or access observations.",
      owner: "Project",
      sourceHref: opportunityHref
    }),
    makeItem({
      id: "photos",
      label: "Photos / files",
      status: hasPhotos ? "complete" : "missing",
      detail: hasPhotos
        ? "Project assessment photos are available."
        : "Request or attach site photos before relying on the package.",
      owner: "Customer",
      sourceHref: projectHref
    })
  ];
  const missingItems = checklist.filter((item) => item.status === "missing");
  const reviewItems = checklist.filter(
    (item) => item.status === "needs_review"
  );
  const readyForEstimator =
    missingItems.length === 0 && reviewItems.length === 0;
  const highRiskObservations = observations.filter(
    (observation) => observation.severity === "high"
  );

  return {
    projectId: input.project.id,
    projectName: input.project.name,
    statusLabel: readyForEstimator
      ? "Ready for estimator review"
      : missingItems.length > 0
        ? "Capture missing context"
        : "Review assessment status",
    handoffLabel: readyForEstimator
      ? "Estimator can review the package"
      : "Estimator handoff should wait for checklist review",
    readyForEstimator,
    checklist,
    missingInfoGuidance: [...missingItems, ...reviewItems].map(
      (item) => item.detail
    ),
    riskPrompts: highRiskObservations.map(
      (observation) => `${observation.title} should be reviewed before pricing.`
    ),
    boundaryNote:
      "Guided capture prepares project-owned assessment context; it does not approve estimates, create tasks, or run autonomous AI."
  };
}
