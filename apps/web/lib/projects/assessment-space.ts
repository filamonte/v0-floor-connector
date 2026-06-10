import type {
  AssessmentSpace,
  AssessmentSpaceType
} from "@floorconnector/types";

export const assessmentSpaceTypes = [
  "room",
  "area",
  "zone",
  "stair",
  "hallway",
  "garage",
  "exterior",
  "other"
] as const satisfies AssessmentSpaceType[];

export type AssessmentSpaceMeasurementInput = {
  lengthFeet: string | number | null;
  widthFeet: string | number | null;
  squareFeet?: string | number | null;
  perimeterFeet?: string | number | null;
};

export type AssessmentSpaceCreateRecordInput = {
  organizationId: string;
  opportunityId?: string | null;
  projectId?: string | null;
  assessmentPackageId: string;
  userId: string;
  name: string;
  spaceType: AssessmentSpaceType;
  floorLevel: string | null;
  lengthFeet: string | null;
  widthFeet: string | null;
  squareFeet: string | null;
  perimeterFeet: string | null;
  substrate: string | null;
  currentFlooring: string | null;
  conditionSummary: string | null;
  prepNotes: string | null;
  moistureNotes: string | null;
  accessNotes: string | null;
  sortOrder: number;
};

export type AssessmentSpacePackageSummary = {
  total: number;
  measuredCount: number;
  totalSquareFeet: number;
  totalPerimeterFeet: number;
  substrateLabels: string[];
};

function parseMeasurement(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function formatMeasurement(value: number | null) {
  return value === null ? null : value.toFixed(2);
}

export function calculateAssessmentSpaceMeasurements(
  input: AssessmentSpaceMeasurementInput
) {
  const lengthFeet = parseMeasurement(input.lengthFeet);
  const widthFeet = parseMeasurement(input.widthFeet);
  const explicitSquareFeet = parseMeasurement(input.squareFeet);
  const explicitPerimeterFeet = parseMeasurement(input.perimeterFeet);
  const calculatedSquareFeet =
    lengthFeet !== null && widthFeet !== null ? lengthFeet * widthFeet : null;
  const calculatedPerimeterFeet =
    lengthFeet !== null && widthFeet !== null
      ? 2 * (lengthFeet + widthFeet)
      : null;

  return {
    lengthFeet: formatMeasurement(lengthFeet),
    widthFeet: formatMeasurement(widthFeet),
    squareFeet: formatMeasurement(explicitSquareFeet ?? calculatedSquareFeet),
    perimeterFeet: formatMeasurement(
      explicitPerimeterFeet ?? calculatedPerimeterFeet
    )
  };
}

export function formatAssessmentSpaceTypeLabel(type: AssessmentSpaceType) {
  return type.replaceAll("_", " ");
}

export function assertAssessmentSpacePackageScope(input: {
  assessmentSpace: Pick<
    AssessmentSpace,
    "organizationId" | "opportunityId" | "projectId" | "assessmentPackageId"
  >;
  organizationId: string;
  opportunityId?: string | null;
  projectId?: string | null;
  assessmentPackageId: string;
}) {
  if (input.assessmentSpace.organizationId !== input.organizationId) {
    throw new Error("Assessment space not found for this organization.");
  }

  if (
    input.projectId !== undefined &&
    input.assessmentSpace.projectId !== input.projectId
  ) {
    throw new Error("Assessment space not found for this project.");
  }

  if (
    input.opportunityId !== undefined &&
    input.assessmentSpace.opportunityId !== input.opportunityId
  ) {
    throw new Error("Assessment space not found for this opportunity.");
  }

  if (input.assessmentSpace.assessmentPackageId !== input.assessmentPackageId) {
    throw new Error("Assessment space not found for this assessment package.");
  }
}

export function buildAssessmentSpaceCreateRecord(
  input: AssessmentSpaceCreateRecordInput
) {
  return {
    company_id: input.organizationId,
    opportunity_id: input.opportunityId ?? null,
    project_id: input.projectId ?? null,
    assessment_package_id: input.assessmentPackageId,
    name: input.name,
    space_type: input.spaceType,
    floor_level: input.floorLevel,
    length_feet: input.lengthFeet,
    width_feet: input.widthFeet,
    square_feet: input.squareFeet,
    perimeter_feet: input.perimeterFeet,
    substrate: input.substrate,
    current_flooring: input.currentFlooring,
    condition_summary: input.conditionSummary,
    prep_notes: input.prepNotes,
    moisture_notes: input.moistureNotes,
    access_notes: input.accessNotes,
    sort_order: input.sortOrder,
    created_by: input.userId,
    updated_by: input.userId
  };
}

export function deriveAssessmentSpacePackageSummary(
  spaces: AssessmentSpace[]
): AssessmentSpacePackageSummary {
  const substrateLabels = Array.from(
    new Set(
      spaces
        .map((space) => space.substrate?.trim())
        .filter((substrate): substrate is string => Boolean(substrate))
    )
  ).sort((left, right) => left.localeCompare(right));
  const totalSquareFeet = spaces.reduce(
    (total, space) => total + (Number(space.squareFeet ?? 0) || 0),
    0
  );
  const totalPerimeterFeet = spaces.reduce(
    (total, space) => total + (Number(space.perimeterFeet ?? 0) || 0),
    0
  );

  return {
    total: spaces.length,
    measuredCount: spaces.filter((space) => Number(space.squareFeet ?? 0) > 0)
      .length,
    totalSquareFeet,
    totalPerimeterFeet,
    substrateLabels
  };
}
