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
  serviceType?: string | null;
  requirementsSummary?: string | null;
  measurements?: SourceMeasurement[];
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

function normalizeMeasurementType(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (["area", "sqft", "sf", "squarefootage", "squarefeet"].includes(normalized)) {
    return "area";
  }

  if (["linear", "lf", "linearfootage", "linearfeet", "perimeter"].includes(normalized)) {
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

  return numeric.toFixed(2).replace(/\.00$/, "").replace(/0+$/, "").replace(/\.$/, "");
}

function getAreaLabel(measurement: SourceMeasurement) {
  return measurement.areaLabel?.trim() || "Unlabeled area";
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
    const currentGroup =
      groupsByLabel.get(key) ??
      {
        key,
        areaLabel,
        squareFootage: null,
        linearFootage: null,
        count: null,
        notes: [],
        measurements: []
      };
    const formattedValue = formatMeasurementValue(measurement.valueNumeric);
    const measurementType = normalizeMeasurementType(measurement.measurementType);

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
