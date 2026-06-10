import "server-only";

import { cache } from "react";
import type {
  AssessmentSpace,
  AssessmentSpaceType
} from "@floorconnector/types";

import {
  assertAssessmentSpacePackageScope,
  buildAssessmentSpaceCreateRecord,
  calculateAssessmentSpaceMeasurements
} from "./assessment-space";
import type { AssessmentSpaceInput } from "./assessment-space-schemas";
import { getAssessmentPackageById } from "./assessment-package-data";
import { requireProjectScope } from "./data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AssessmentSpaceRow = {
  id: string;
  company_id: string;
  assessment_package_id: string;
  opportunity_id: string | null;
  project_id: string | null;
  name: string;
  space_type: AssessmentSpaceType;
  floor_level: string | null;
  length_feet: string | number | null;
  width_feet: string | number | null;
  square_feet: string | number | null;
  perimeter_feet: string | number | null;
  substrate: string | null;
  current_flooring: string | null;
  condition_summary: string | null;
  prep_notes: string | null;
  moisture_notes: string | null;
  access_notes: string | null;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

const assessmentSpaceSelect = `
  id,
  company_id,
  assessment_package_id,
  opportunity_id,
  project_id,
  name,
  space_type,
  floor_level,
  length_feet,
  width_feet,
  square_feet,
  perimeter_feet,
  substrate,
  current_flooring,
  condition_summary,
  prep_notes,
  moisture_notes,
  access_notes,
  sort_order,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

function decimalToString(value: string | number | null) {
  return value === null ? null : Number(value).toFixed(2);
}

function isAssessmentSpaceRow(value: unknown): value is AssessmentSpaceRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<AssessmentSpaceRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.assessment_package_id === "string" &&
    (row.opportunity_id === null || typeof row.opportunity_id === "string") &&
    (row.project_id === null || typeof row.project_id === "string") &&
    typeof row.name === "string" &&
    typeof row.space_type === "string" &&
    typeof row.sort_order === "number" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isAssessmentSpaceRowArray(
  value: unknown
): value is AssessmentSpaceRow[] {
  return Array.isArray(value) && value.every(isAssessmentSpaceRow);
}

function mapAssessmentSpace(row: AssessmentSpaceRow): AssessmentSpace {
  return {
    id: row.id,
    organizationId: row.company_id,
    assessmentPackageId: row.assessment_package_id,
    opportunityId: row.opportunity_id,
    projectId: row.project_id,
    name: row.name,
    spaceType: row.space_type,
    floorLevel: row.floor_level,
    lengthFeet: decimalToString(row.length_feet),
    widthFeet: decimalToString(row.width_feet),
    squareFeet: decimalToString(row.square_feet),
    perimeterFeet: decimalToString(row.perimeter_feet),
    substrate: row.substrate,
    currentFlooring: row.current_flooring,
    conditionSummary: row.condition_summary,
    prepNotes: row.prep_notes,
    moistureNotes: row.moisture_notes,
    accessNotes: row.access_notes,
    sortOrder: row.sort_order,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function requireAssessmentPackageScope(input: {
  projectId: string;
  assessmentPackageId: string;
}) {
  const scope = await requireProjectScope(`/projects/${input.projectId}`);
  const assessmentPackage = await getAssessmentPackageById(input);

  if (!assessmentPackage) {
    throw new Error("Assessment package not found for this project.");
  }

  return { scope, assessmentPackage };
}

export const listAssessmentSpacesByPackage = cache(
  async (input: {
    projectId: string;
    assessmentPackageId: string;
  }): Promise<AssessmentSpace[]> => {
    const { scope } = await requireAssessmentPackageScope(input);
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("assessment_spaces")
      .select(assessmentSpaceSelect)
      .eq("company_id", scope.organizationId)
      .eq("project_id", input.projectId)
      .eq("assessment_package_id", input.assessmentPackageId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load assessment areas/spaces: ${response.error.message}`
      );
    }

    return isAssessmentSpaceRowArray(data) ? data.map(mapAssessmentSpace) : [];
  }
);

export async function getAssessmentSpaceById(input: {
  projectId: string;
  assessmentPackageId: string;
  assessmentSpaceId: string;
}) {
  const { scope } = await requireAssessmentPackageScope(input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_spaces")
    .select(assessmentSpaceSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", input.projectId)
    .eq("assessment_package_id", input.assessmentPackageId)
    .eq("id", input.assessmentSpaceId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load assessment area/space: ${response.error.message}`
    );
  }

  if (!isAssessmentSpaceRow(data)) {
    return null;
  }

  const assessmentSpace = mapAssessmentSpace(data);

  assertAssessmentSpacePackageScope({
    assessmentSpace,
    organizationId: scope.organizationId,
    projectId: input.projectId,
    assessmentPackageId: input.assessmentPackageId
  });

  return assessmentSpace;
}

export async function createAssessmentSpace(
  projectId: string,
  assessmentPackageId: string,
  input: AssessmentSpaceInput
) {
  const { scope, assessmentPackage } = await requireAssessmentPackageScope({
    projectId,
    assessmentPackageId
  });
  const measurements = calculateAssessmentSpaceMeasurements(input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_spaces")
    .insert(
      buildAssessmentSpaceCreateRecord({
        organizationId: scope.organizationId,
        opportunityId: assessmentPackage.opportunityId,
        projectId,
        assessmentPackageId,
        userId: scope.userId,
        name: input.name,
        spaceType: input.spaceType,
        floorLevel: input.floorLevel,
        lengthFeet: measurements.lengthFeet,
        widthFeet: measurements.widthFeet,
        squareFeet: measurements.squareFeet,
        perimeterFeet: measurements.perimeterFeet,
        substrate: input.substrate,
        currentFlooring: input.currentFlooring,
        conditionSummary: input.conditionSummary,
        prepNotes: input.prepNotes,
        moistureNotes: input.moistureNotes,
        accessNotes: input.accessNotes,
        sortOrder: input.sortOrder
      })
    )
    .select(assessmentSpaceSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create assessment area/space: ${response.error.message}`
    );
  }

  if (!isAssessmentSpaceRow(data)) {
    throw new Error("Unexpected assessment area/space response after create.");
  }

  return mapAssessmentSpace(data);
}

export async function updateAssessmentSpace(
  projectId: string,
  assessmentPackageId: string,
  assessmentSpaceId: string,
  input: AssessmentSpaceInput
) {
  const { scope } = await requireAssessmentPackageScope({
    projectId,
    assessmentPackageId
  });
  const measurements = calculateAssessmentSpaceMeasurements(input);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_spaces")
    .update({
      name: input.name,
      space_type: input.spaceType,
      floor_level: input.floorLevel,
      length_feet: measurements.lengthFeet,
      width_feet: measurements.widthFeet,
      square_feet: measurements.squareFeet,
      perimeter_feet: measurements.perimeterFeet,
      substrate: input.substrate,
      current_flooring: input.currentFlooring,
      condition_summary: input.conditionSummary,
      prep_notes: input.prepNotes,
      moisture_notes: input.moistureNotes,
      access_notes: input.accessNotes,
      sort_order: input.sortOrder,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .eq("assessment_package_id", assessmentPackageId)
    .eq("id", assessmentSpaceId)
    .select(assessmentSpaceSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update assessment area/space: ${response.error.message}`
    );
  }

  if (!isAssessmentSpaceRow(data)) {
    throw new Error("Assessment area/space not found for this package.");
  }

  return mapAssessmentSpace(data);
}
