import type {
  AssessmentPackage,
  AssessmentPackageStatus
} from "@floorconnector/types";

export const assessmentPackageStatuses = [
  "draft",
  "in_progress",
  "ready_for_estimate",
  "archived"
] as const satisfies AssessmentPackageStatus[];

type AssessmentPackageOpportunity = {
  id: string;
  title: string;
  status?: string | null;
  serviceType?: string | null;
  requirementsSummary?: string | null;
  notes?: string | null;
  siteAssessmentStatus?: string | null;
  siteAssessmentCompletedAt?: string | null;
  measurements?: Array<{
    id: string;
    areaLabel?: string | null;
    measurementType: string;
    valueNumeric: string | number | null;
    unit?: string | null;
    notes?: string | null;
  }>;
  observations?: Array<{
    id: string;
    title: string;
    body?: string | null;
    severity?: string | null;
    observationType?: string | null;
  }>;
  attachments?: Array<{
    id: string;
    attachmentType: string;
    fileName: string;
    mimeType: string;
    caption?: string | null;
    tag?: string | null;
  }>;
};

type AssessmentPackageEstimate = {
  id: string;
  referenceNumber: string;
  status: string;
};

export type AssessmentPackageReadinessState =
  | "ready_for_estimate"
  | "needs_review"
  | "missing_context";

export type AssessmentPackageSignalTone =
  | "ready"
  | "attention"
  | "blocked"
  | "neutral";

export type AssessmentPackageSourceLink = {
  label: string;
  href: string;
  detail: string;
};

export type ProjectAssessmentPackageInput = {
  project: {
    id: string;
    name: string;
    status?: string | null;
  };
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  opportunity?: AssessmentPackageOpportunity | null;
  estimates?: AssessmentPackageEstimate[];
};

export type ProjectAssessmentPackageSummary = {
  project: {
    id: string;
    name: string;
    status: string | null;
    href: string;
  };
  customer: {
    id: string;
    label: string;
    href: string;
  } | null;
  sourceOpportunity: {
    id: string;
    title: string;
    status: string | null;
    href: string;
  } | null;
  readiness: {
    state: AssessmentPackageReadinessState;
    label: string;
    detail: string;
  };
  counts: {
    measurementAreas: number;
    measurementRecords: number;
    observations: number;
    photos: number;
    files: number;
    estimateRecords: number;
  };
  context: {
    serviceType: string | null;
    requirementsSummary: string | null;
    internalNotes: string | null;
    siteAssessmentCompleted: boolean;
  };
  missingInfo: string[];
  riskSignals: Array<{
    id: string;
    tone: AssessmentPackageSignalTone;
    title: string;
    detail: string;
  }>;
  sourceLinks: AssessmentPackageSourceLink[];
  estimateHandoff: {
    label: string;
    href: string;
    ready: boolean;
    blockers: string[];
  };
};

export type AssessmentPackageProjectSummary = {
  total: number;
  activeCount: number;
  readyForEstimateCount: number;
  latestPackage: AssessmentPackage | null;
  statusLabel: string;
  statusDetail: string;
  primaryHref: string;
  primaryActionLabel: string;
};

export type AssessmentPackageCreateRecordInput = {
  organizationId: string;
  projectId: string;
  userId: string;
  title: string;
  assessmentDate: string | null;
};

function trimToNull(value: string | null | undefined) {
  return value?.trim() || null;
}

function formatCustomerLabel(
  customer: ProjectAssessmentPackageInput["customer"]
) {
  if (!customer) {
    return null;
  }

  return trimToNull(customer.companyName) ?? customer.name;
}

function normalizeMeasurementArea(
  measurement: NonNullable<AssessmentPackageOpportunity["measurements"]>[number]
) {
  return trimToNull(measurement.areaLabel) ?? "Unlabeled area";
}

function measurementHasValue(
  measurement: NonNullable<AssessmentPackageOpportunity["measurements"]>[number]
) {
  const value = Number(measurement.valueNumeric ?? 0);

  return Number.isFinite(value) && value > 0;
}

function isPhotoLikeAttachment(
  attachment: NonNullable<AssessmentPackageOpportunity["attachments"]>[number]
) {
  return (
    attachment.mimeType.toLowerCase().startsWith("image/") ||
    attachment.attachmentType.toLowerCase().includes("photo") ||
    attachment.tag?.toLowerCase().includes("photo") === true
  );
}

function isSiteAssessmentComplete(
  opportunity: AssessmentPackageOpportunity | null
) {
  return Boolean(
    opportunity?.siteAssessmentCompletedAt ||
    opportunity?.siteAssessmentStatus === "completed" ||
    opportunity?.siteAssessmentStatus === "site_assessment_complete"
  );
}

function buildReadiness(input: {
  missingInfo: string[];
  hasEstimate: boolean;
  siteAssessmentCompleted: boolean;
}) {
  if (input.missingInfo.length === 0) {
    return {
      state: "ready_for_estimate" as const,
      label: "Ready for estimator review",
      detail:
        "Assessment context has scope notes, measurements, observations, and supporting photos/files."
    };
  }

  if (input.hasEstimate || input.siteAssessmentCompleted) {
    return {
      state: "needs_review" as const,
      label: "Needs assessment review",
      detail:
        "Some assessment context exists, but the estimator should review missing information before relying on it."
    };
  }

  return {
    state: "missing_context" as const,
    label: "Missing assessment context",
    detail:
      "Project-owned assessment context is not complete enough for confident estimate handoff."
  };
}

export function canTransitionAssessmentPackageStatus(
  currentStatus: AssessmentPackageStatus,
  nextStatus: AssessmentPackageStatus
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowedTransitions: Record<
    AssessmentPackageStatus,
    AssessmentPackageStatus[]
  > = {
    draft: ["in_progress", "archived"],
    in_progress: ["draft", "ready_for_estimate", "archived"],
    ready_for_estimate: ["in_progress", "archived"],
    archived: ["draft"]
  };

  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function formatAssessmentPackageStatusLabel(
  status: AssessmentPackageStatus
) {
  return status.replaceAll("_", " ");
}

export function buildAssessmentPackageCreateRecord(
  input: AssessmentPackageCreateRecordInput
) {
  return {
    company_id: input.organizationId,
    project_id: input.projectId,
    status: "draft" as const,
    title: input.title,
    assessment_date: input.assessmentDate,
    created_by: input.userId,
    updated_by: input.userId
  };
}

export function assertAssessmentPackageProjectScope(input: {
  assessmentPackage: Pick<AssessmentPackage, "organizationId" | "projectId">;
  organizationId: string;
  projectId: string;
}) {
  if (input.assessmentPackage.organizationId !== input.organizationId) {
    throw new Error("Assessment package not found for this organization.");
  }

  if (input.assessmentPackage.projectId !== input.projectId) {
    throw new Error("Assessment package not found for this project.");
  }
}

export function deriveAssessmentPackageProjectSummary(input: {
  projectId: string;
  packages: AssessmentPackage[];
}): AssessmentPackageProjectSummary {
  const activePackages = input.packages.filter(
    (assessmentPackage) => assessmentPackage.status !== "archived"
  );
  const latestPackage =
    activePackages[0] ??
    input.packages.find(
      (assessmentPackage) => assessmentPackage.status === "archived"
    ) ??
    null;
  const readyForEstimateCount = input.packages.filter(
    (assessmentPackage) => assessmentPackage.status === "ready_for_estimate"
  ).length;

  if (!latestPackage) {
    return {
      total: 0,
      activeCount: 0,
      readyForEstimateCount: 0,
      latestPackage: null,
      statusLabel: "No assessment package",
      statusDetail:
        "Create a project-owned assessment package before estimator handoff needs site context.",
      primaryHref: `/projects/${input.projectId}`,
      primaryActionLabel: "Create assessment package"
    };
  }

  return {
    total: input.packages.length,
    activeCount: activePackages.length,
    readyForEstimateCount,
    latestPackage,
    statusLabel: formatAssessmentPackageStatusLabel(latestPackage.status),
    statusDetail:
      latestPackage.estimateHandoffSummary ??
      latestPackage.currentConditionsSummary ??
      latestPackage.siteNotes ??
      "Assessment package is attached to this canonical project.",
    primaryHref: `/projects/${input.projectId}/assessment-packages/${latestPackage.id}`,
    primaryActionLabel: "Open assessment package"
  };
}

export function deriveProjectAssessmentPackageSummary(
  input: ProjectAssessmentPackageInput
): ProjectAssessmentPackageSummary {
  const opportunity = input.opportunity ?? null;
  const estimates = input.estimates ?? [];
  const measurements = opportunity?.measurements ?? [];
  const observations = opportunity?.observations ?? [];
  const attachments = opportunity?.attachments ?? [];
  const measurementAreas = new Set(
    measurements.filter(measurementHasValue).map(normalizeMeasurementArea)
  );
  const photos = attachments.filter(isPhotoLikeAttachment);
  const siteAssessmentCompleted = isSiteAssessmentComplete(opportunity);
  const missingInfo: string[] = [];

  if (!opportunity) {
    missingInfo.push("No linked opportunity or lead context is available.");
  }

  if (!siteAssessmentCompleted) {
    missingInfo.push("Site assessment has not been marked complete.");
  }

  if (!trimToNull(opportunity?.requirementsSummary)) {
    missingInfo.push("Scope notes or requirements summary are missing.");
  }

  if (measurementAreas.size === 0) {
    missingInfo.push("No reviewed measurements are linked to the project.");
  }

  if (observations.length === 0) {
    missingInfo.push("No surface-condition observations are linked.");
  }

  if (photos.length === 0) {
    missingInfo.push("No project assessment photos are linked.");
  }

  const readiness = buildReadiness({
    missingInfo,
    hasEstimate: estimates.length > 0,
    siteAssessmentCompleted
  });
  const riskSignals = [
    ...missingInfo.map((detail, index) => ({
      id: `missing-${index + 1}`,
      tone:
        readiness.state === "missing_context"
          ? ("blocked" as const)
          : ("attention" as const),
      title: "Missing assessment input",
      detail
    })),
    ...(observations
      .filter((observation) => observation.severity === "high")
      .map((observation) => ({
        id: `observation-${observation.id}`,
        tone: "attention" as const,
        title: observation.title,
        detail:
          trimToNull(observation.body) ??
          "High-severity assessment observation needs estimator review."
      })) ?? [])
  ];
  const sourceLinks: AssessmentPackageSourceLink[] = [
    {
      label: "Project Workspace",
      href: `/projects/${input.project.id}`,
      detail: "Project owns the assessment package context."
    },
    ...(opportunity
      ? [
          {
            label: "Lead / opportunity",
            href: `/leads/${opportunity.id}`,
            detail: "Source customer request, scope notes, and site context."
          }
        ]
      : []),
    ...(estimates[0]
      ? [
          {
            label: "Latest estimate",
            href: `/estimates/${estimates[0].id}`,
            detail:
              "Estimate consumes approved context; it does not own the assessment package."
          }
        ]
      : [])
  ];

  return {
    project: {
      id: input.project.id,
      name: input.project.name,
      status: input.project.status ?? null,
      href: `/projects/${input.project.id}`
    },
    customer: input.customer
      ? {
          id: input.customer.id,
          label: formatCustomerLabel(input.customer) ?? input.customer.name,
          href: `/customers/${input.customer.id}`
        }
      : null,
    sourceOpportunity: opportunity
      ? {
          id: opportunity.id,
          title: opportunity.title,
          status: opportunity.status ?? null,
          href: `/leads/${opportunity.id}`
        }
      : null,
    readiness,
    counts: {
      measurementAreas: measurementAreas.size,
      measurementRecords: measurements.length,
      observations: observations.length,
      photos: photos.length,
      files: attachments.length - photos.length,
      estimateRecords: estimates.length
    },
    context: {
      serviceType: trimToNull(opportunity?.serviceType),
      requirementsSummary: trimToNull(opportunity?.requirementsSummary),
      internalNotes: trimToNull(opportunity?.notes),
      siteAssessmentCompleted
    },
    missingInfo,
    riskSignals,
    sourceLinks,
    estimateHandoff: {
      label:
        readiness.state === "ready_for_estimate"
          ? "Ready for estimate handoff"
          : "Review assessment before estimate handoff",
      href: estimates[0]?.id
        ? `/estimates/${estimates[0].id}`
        : `/projects/${input.project.id}`,
      ready: readiness.state === "ready_for_estimate",
      blockers: missingInfo
    }
  };
}
