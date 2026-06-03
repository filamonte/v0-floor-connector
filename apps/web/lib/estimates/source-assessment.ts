type SourceMeasurement = {
  id: string;
  areaLabel: string | null;
  measurementType: string;
  valueNumeric: string;
  unit: string;
  quantity?: number | null;
  notes?: string | null;
};

type SourceOpportunity = {
  id: string;
  title: string;
  status?: string | null;
  serviceType?: string | null;
  requirementsSummary?: string | null;
  notes?: string | null;
  siteAssessmentStatus?: string | null;
  siteAssessmentScheduledAt?: string | null;
  siteAssessmentCompletedAt?: string | null;
  measurements?: SourceMeasurement[];
  observations?: SourceObservation[];
  attachments?: SourceAttachment[];
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  createdByUserId?: string | null;
  project?: {
    id: string;
    name: string;
    status?: string | null;
  } | null;
};

type SourceObservation = {
  id: string;
  observationType?: string | null;
  title: string;
  body?: string | null;
  severity?: string | null;
};

type SourceAttachment = {
  id: string;
  attachmentType: string;
  fileName: string;
  mimeType: string;
  caption?: string | null;
  tag?: string | null;
};

export type EstimateSourceMeasurementGroup = {
  key: string;
  areaLabel: string;
  squareFootage: string | null;
  linearFootage: string | null;
  count: string | null;
  notes: string[];
  measurements: SourceMeasurement[];
};

export type EstimateSourceAssessmentContext = {
  opportunityId: string;
  opportunityTitle: string;
  serviceType: string | null;
  requirementsSummary: string | null;
  measurementGroups: EstimateSourceMeasurementGroup[];
};

export type EstimateSourceSystemPrefill = {
  inputMode: "direct";
  squareFootage: string;
  linearFootage: string;
  count: string;
  groupLabel: string;
  sourceLabel: string;
};

export type EstimateHandoffPacket = {
  opportunity: {
    id: string;
    title: string;
    status: string | null;
    href: string;
  } | null;
  estimate: {
    id: string;
    referenceNumber: string;
    href: string;
  } | null;
  project: {
    id: string;
    name: string;
    status: string | null;
    href: string;
  } | null;
  customer: {
    id: string;
    name: string;
  } | null;
  sourceOwner: {
    name: string | null;
    isCaptured: boolean;
  };
  siteAssessment: {
    status: string | null;
    scheduledAt: string | null;
    completedAt: string | null;
    isCaptured: boolean;
  };
  scopeNotes: {
    requirementsSummary: string | null;
    internalNotes: string | null;
  };
  measurements: {
    count: number;
    groups: EstimateSourceMeasurementGroup[];
  };
  observations: {
    count: number;
    items: Array<{
      id: string;
      title: string;
      body: string | null;
      severity: string | null;
      observationType: string | null;
    }>;
  };
  attachments: {
    count: number;
    photoCount: number;
    fileCount: number;
    items: Array<{
      id: string;
      fileName: string;
      attachmentType: string;
      caption: string | null;
      tag: string | null;
    }>;
  };
  missingInfo: string[];
};

function normalizeMeasurementType(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  if (
    ["area", "sqft", "sf", "squarefootage", "squarefeet"].includes(normalized)
  ) {
    return "area";
  }

  if (
    ["linear", "lf", "linearfootage", "linearfeet", "perimeter"].includes(
      normalized
    )
  ) {
    return "linear";
  }

  if (["count", "ea", "each"].includes(normalized)) {
    return "count";
  }

  return normalized;
}

function formatMeasurementValue(value: string | number | null | undefined) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function getAreaLabel(measurement: SourceMeasurement) {
  return measurement.areaLabel?.trim() || "Unlabeled area";
}

function trimToNull(value: string | null | undefined) {
  return value?.trim() || null;
}

function isCompletedSiteAssessment(value: string | null | undefined) {
  return value === "completed" || value === "site_assessment_complete";
}

function isPhotoLikeAttachment(attachment: SourceAttachment) {
  return (
    attachment.mimeType.startsWith("image/") ||
    attachment.attachmentType.toLowerCase().includes("photo") ||
    attachment.tag?.toLowerCase().includes("photo") === true
  );
}

export function buildEstimateSourceAssessmentContext(
  opportunity: SourceOpportunity | null | undefined
): EstimateSourceAssessmentContext | null {
  if (!opportunity) {
    return null;
  }

  const groupsByLabel = new Map<string, EstimateSourceMeasurementGroup>();

  for (const measurement of opportunity.measurements ?? []) {
    const areaLabel = getAreaLabel(measurement);
    const key = areaLabel.toLowerCase();
    const currentGroup = groupsByLabel.get(key) ?? {
      key,
      areaLabel,
      squareFootage: null,
      linearFootage: null,
      count: null,
      notes: [],
      measurements: []
    };
    const formattedValue = formatMeasurementValue(measurement.valueNumeric);
    const measurementType = normalizeMeasurementType(
      measurement.measurementType
    );

    if (formattedValue) {
      if (measurementType === "area") {
        currentGroup.squareFootage = formattedValue;
      } else if (measurementType === "linear") {
        currentGroup.linearFootage = formattedValue;
      } else if (measurementType === "count") {
        currentGroup.count = formattedValue;
      }
    }

    if (measurement.notes?.trim()) {
      currentGroup.notes.push(measurement.notes.trim());
    }

    currentGroup.measurements.push(measurement);
    groupsByLabel.set(key, currentGroup);
  }

  return {
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    serviceType: opportunity.serviceType ?? null,
    requirementsSummary: opportunity.requirementsSummary ?? null,
    measurementGroups: Array.from(groupsByLabel.values()).filter(
      (group) => group.squareFootage || group.linearFootage || group.count
    )
  };
}

export function getSystemMeasurementPrefillFromAssessment(
  context: EstimateSourceAssessmentContext | null | undefined,
  groupKeyOrLabel?: string | null
): EstimateSourceSystemPrefill | null {
  if (!context || context.measurementGroups.length === 0) {
    return null;
  }

  const normalizedTarget = groupKeyOrLabel?.trim().toLowerCase() ?? "";
  const group =
    context.measurementGroups.find(
      (candidate) =>
        candidate.key === normalizedTarget ||
        candidate.areaLabel.trim().toLowerCase() === normalizedTarget
    ) ??
    context.measurementGroups.find((candidate) => candidate.squareFootage) ??
    context.measurementGroups[0];

  if (!group?.squareFootage) {
    return null;
  }

  return {
    inputMode: "direct",
    squareFootage: group.squareFootage,
    linearFootage: group.linearFootage ?? "0",
    count: group.count ?? "1",
    groupLabel: group.areaLabel,
    sourceLabel: `Source assessment: ${group.areaLabel}`
  };
}

export function buildEstimateHandoffPacket(input: {
  opportunity: SourceOpportunity | null | undefined;
  estimate?: {
    id: string;
    referenceNumber: string;
  } | null;
  project?: {
    id: string;
    name: string;
    status?: string | null;
  } | null;
  sourceOwner?: {
    displayName: string;
  } | null;
}): EstimateHandoffPacket {
  const opportunity = input.opportunity ?? null;
  const assessmentContext = buildEstimateSourceAssessmentContext(opportunity);
  const observations = (opportunity?.observations ?? []).map((observation) => ({
    id: observation.id,
    title: observation.title,
    body: trimToNull(observation.body),
    severity: trimToNull(observation.severity),
    observationType: trimToNull(observation.observationType)
  }));
  const attachments = opportunity?.attachments ?? [];
  const photoCount = attachments.filter(isPhotoLikeAttachment).length;
  const project = input.project ?? opportunity?.project ?? null;
  const customer = opportunity?.customer ?? null;
  const missingInfo: string[] = [];
  const siteAssessmentCaptured = Boolean(
    isCompletedSiteAssessment(opportunity?.siteAssessmentStatus) ||
    opportunity?.siteAssessmentCompletedAt
  );

  if (!opportunity) {
    missingInfo.push("No linked opportunity source packet is available.");
  }

  if (!siteAssessmentCaptured) {
    missingInfo.push("Site assessment is not marked complete.");
  }

  if (!trimToNull(opportunity?.requirementsSummary)) {
    missingInfo.push("Scope notes or requirements summary are missing.");
  }

  if ((assessmentContext?.measurementGroups.length ?? 0) === 0) {
    missingInfo.push("No reviewed measurements are linked.");
  }

  if (observations.length === 0) {
    missingInfo.push("No surface-condition observations are linked.");
  }

  if (attachments.length === 0) {
    missingInfo.push("No photos/files are linked yet.");
  }

  return {
    opportunity: opportunity
      ? {
          id: opportunity.id,
          title: opportunity.title,
          status: opportunity.status ?? null,
          href: `/leads/${opportunity.id}`
        }
      : null,
    estimate: input.estimate
      ? {
          id: input.estimate.id,
          referenceNumber: input.estimate.referenceNumber,
          href: `/estimates/${input.estimate.id}`
        }
      : null,
    project: project
      ? {
          id: project.id,
          name: project.name,
          status: project.status ?? null,
          href: `/projects/${project.id}`
        }
      : null,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name
        }
      : null,
    sourceOwner: {
      name: trimToNull(input.sourceOwner?.displayName),
      isCaptured: Boolean(trimToNull(input.sourceOwner?.displayName))
    },
    siteAssessment: {
      status: opportunity?.siteAssessmentStatus ?? null,
      scheduledAt: opportunity?.siteAssessmentScheduledAt ?? null,
      completedAt: opportunity?.siteAssessmentCompletedAt ?? null,
      isCaptured: siteAssessmentCaptured
    },
    scopeNotes: {
      requirementsSummary: trimToNull(opportunity?.requirementsSummary),
      internalNotes: trimToNull(opportunity?.notes)
    },
    measurements: {
      count: opportunity?.measurements?.length ?? 0,
      groups: assessmentContext?.measurementGroups ?? []
    },
    observations: {
      count: observations.length,
      items: observations.slice(0, 5)
    },
    attachments: {
      count: attachments.length,
      photoCount,
      fileCount: attachments.length - photoCount,
      items: attachments.slice(0, 5).map((attachment) => ({
        id: attachment.id,
        fileName: attachment.fileName,
        attachmentType: attachment.attachmentType,
        caption: trimToNull(attachment.caption),
        tag: trimToNull(attachment.tag)
      }))
    },
    missingInfo
  };
}
