export type AssessmentEstimateHandoffInput = {
  project: {
    id: string;
    name: string;
  };
  assessment: {
    readinessState: "ready_for_estimate" | "needs_review" | "missing_context";
    requirementsSummary?: string | null;
    measurementAreaCount: number;
    measurementRecordCount: number;
    observationCount: number;
    photoCount: number;
    fileCount: number;
    missingInfo: string[];
    riskSignals?: Array<{
      title: string;
      detail: string;
    }>;
    sourceLinks?: Array<{
      label: string;
      href: string;
    }>;
  };
  estimate?: {
    id: string;
    referenceNumber: string;
    status: string;
  } | null;
};

export type AssessmentEstimateHandoffSummary = {
  projectId: string;
  projectName: string;
  estimate: {
    id: string;
    referenceNumber: string;
    href: string;
  } | null;
  estimatorReady: boolean;
  readinessLabel: string;
  readinessDetail: string;
  missingSignals: string[];
  evidenceSummary: {
    measurements: string;
    observations: string;
    files: string;
  };
  sourceEvidenceLinks: Array<{
    label: string;
    href: string;
  }>;
  estimatorReviewPrompts: string[];
  boundaryNote: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function deriveAssessmentEstimateHandoffSummary(
  input: AssessmentEstimateHandoffInput
): AssessmentEstimateHandoffSummary {
  const missingSignals = [...input.assessment.missingInfo];

  if (!hasText(input.assessment.requirementsSummary)) {
    missingSignals.push("Scope summary is not ready for estimator review.");
  }

  if (input.assessment.measurementAreaCount === 0) {
    missingSignals.push("No measured areas are ready for estimator review.");
  }

  if (input.assessment.photoCount === 0) {
    missingSignals.push("No assessment photos are ready for estimator review.");
  }

  const estimatorReady =
    input.assessment.readinessState === "ready_for_estimate" &&
    missingSignals.length === 0;
  const riskPrompts =
    input.assessment.riskSignals?.map(
      (signal) => `${signal.title}: ${signal.detail}`
    ) ?? [];

  return {
    projectId: input.project.id,
    projectName: input.project.name,
    estimate: input.estimate
      ? {
          id: input.estimate.id,
          referenceNumber: input.estimate.referenceNumber,
          href: `/estimates/${input.estimate.id}`
        }
      : null,
    estimatorReady,
    readinessLabel: estimatorReady
      ? "Assessment ready for estimate review"
      : "Assessment needs estimator review",
    readinessDetail: estimatorReady
      ? "Project assessment context has enough scope, measurement, observation, and file evidence for a human estimator to review."
      : "Estimator should review missing context before relying on this assessment package.",
    missingSignals: Array.from(new Set(missingSignals)),
    evidenceSummary: {
      measurements: `${pluralize(
        input.assessment.measurementAreaCount,
        "area"
      )}, ${pluralize(input.assessment.measurementRecordCount, "measurement")}`,
      observations: pluralize(input.assessment.observationCount, "observation"),
      files: `${pluralize(input.assessment.photoCount, "photo")}, ${pluralize(
        input.assessment.fileCount,
        "file"
      )}`
    },
    sourceEvidenceLinks: [
      {
        label: "Project assessment context",
        href: `/projects/${input.project.id}`
      },
      ...(input.assessment.sourceLinks ?? [])
    ],
    estimatorReviewPrompts: [
      ...riskPrompts,
      ...(missingSignals.length > 0
        ? ["Resolve missing assessment context before pricing."]
        : [
            "Review assessment context before creating customer-facing pricing."
          ])
    ],
    boundaryNote:
      "Assessment handoff prepares estimator review only; it does not generate estimate lines, prices, or customer approval."
  };
}
