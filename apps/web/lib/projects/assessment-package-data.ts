import "server-only";

import { cache } from "react";
import type {
  AssessmentPackage,
  AssessmentPackageStatus
} from "@floorconnector/types";

import {
  assertAssessmentPackageProjectScope,
  buildAssessmentPackageCreateRecord,
  canTransitionAssessmentPackageStatus,
  deriveAssessmentPackageProjectSummary,
  type AssessmentPackageProjectSummary
} from "./assessment-package";
import type {
  AssessmentPackageCreateInput,
  AssessmentPackageInput,
  AssessmentPackageStatusInput
} from "./assessment-package-schemas";
import { requireProjectScope } from "./data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AssessmentPackageRow = {
  id: string;
  company_id: string;
  project_id: string;
  status: AssessmentPackageStatus;
  title: string;
  assessment_date: string | null;
  site_contact_name: string | null;
  site_contact_phone: string | null;
  access_notes: string | null;
  parking_notes: string | null;
  site_notes: string | null;
  customer_goals: string | null;
  current_conditions_summary: string | null;
  recommended_system_summary: string | null;
  risk_summary: string | null;
  estimate_handoff_summary: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  projects?: {
    id: string;
    name: string;
    customer_id: string;
    customers?: {
      id: string;
      name: string;
      company_name: string | null;
    } | null;
  } | null;
};

export type AssessmentPackageListItem = AssessmentPackage & {
  project?: { id: string; name: string; customerId: string } | null;
  customer?: { id: string; name: string; companyName: string | null } | null;
};

export type AssessmentPackageProjectReadModel =
  AssessmentPackageProjectSummary & {
    packages: AssessmentPackageListItem[];
  };

const assessmentPackageSelect = `
  id,
  company_id,
  project_id,
  status,
  title,
  assessment_date,
  site_contact_name,
  site_contact_phone,
  access_notes,
  parking_notes,
  site_notes,
  customer_goals,
  current_conditions_summary,
  recommended_system_summary,
  risk_summary,
  estimate_handoff_summary,
  created_by,
  updated_by,
  created_at,
  updated_at,
  projects (
    id,
    name,
    customer_id,
    customers (
      id,
      name,
      company_name
    )
  )
`;

function isAssessmentPackageRow(value: unknown): value is AssessmentPackageRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<AssessmentPackageRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.status === "string" &&
    typeof row.title === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isAssessmentPackageRowArray(
  value: unknown
): value is AssessmentPackageRow[] {
  return Array.isArray(value) && value.every(isAssessmentPackageRow);
}

function mapAssessmentPackage(row: AssessmentPackageRow): AssessmentPackage {
  return {
    id: row.id,
    organizationId: row.company_id,
    projectId: row.project_id,
    status: row.status,
    title: row.title,
    assessmentDate: row.assessment_date,
    siteContactName: row.site_contact_name,
    siteContactPhone: row.site_contact_phone,
    accessNotes: row.access_notes,
    parkingNotes: row.parking_notes,
    siteNotes: row.site_notes,
    customerGoals: row.customer_goals,
    currentConditionsSummary: row.current_conditions_summary,
    recommendedSystemSummary: row.recommended_system_summary,
    riskSummary: row.risk_summary,
    estimateHandoffSummary: row.estimate_handoff_summary,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAssessmentPackageListItem(
  row: AssessmentPackageRow
): AssessmentPackageListItem {
  return {
    ...mapAssessmentPackage(row),
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          customerId: row.projects.customer_id
        }
      : null,
    customer: row.projects?.customers
      ? {
          id: row.projects.customers.id,
          name: row.projects.customers.name,
          companyName: row.projects.customers.company_name
        }
      : null
  };
}

async function assertProjectBelongsToScope(input: {
  organizationId: string;
  projectId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("id", input.projectId)
    .maybeSingle();
  const project = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate project: ${response.error.message}`);
  }

  if (!project?.id) {
    throw new Error("Project not found for this organization.");
  }
}

export const listAssessmentPackagesByProject = cache(
  async (projectId: string): Promise<AssessmentPackageListItem[]> => {
    const scope = await requireProjectScope(`/projects/${projectId}`);

    await assertProjectBelongsToScope({
      organizationId: scope.organizationId,
      projectId
    });

    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("assessment_packages")
      .select(assessmentPackageSelect)
      .eq("company_id", scope.organizationId)
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load assessment packages: ${response.error.message}`
      );
    }

    return isAssessmentPackageRowArray(data)
      ? data.map(mapAssessmentPackageListItem)
      : [];
  }
);

export async function getAssessmentPackageProjectReadModel(
  projectId: string
): Promise<AssessmentPackageProjectReadModel> {
  const packages = await listAssessmentPackagesByProject(projectId);

  return {
    ...deriveAssessmentPackageProjectSummary({ projectId, packages }),
    packages
  };
}

export async function getAssessmentPackageById(input: {
  projectId: string;
  assessmentPackageId: string;
}) {
  const scope = await requireProjectScope(`/projects/${input.projectId}`);

  await assertProjectBelongsToScope({
    organizationId: scope.organizationId,
    projectId: input.projectId
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_packages")
    .select(assessmentPackageSelect)
    .eq("company_id", scope.organizationId)
    .eq("project_id", input.projectId)
    .eq("id", input.assessmentPackageId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load assessment package: ${response.error.message}`
    );
  }

  if (!isAssessmentPackageRow(data)) {
    return null;
  }

  const assessmentPackage = mapAssessmentPackageListItem(data);

  assertAssessmentPackageProjectScope({
    assessmentPackage,
    organizationId: scope.organizationId,
    projectId: input.projectId
  });

  return assessmentPackage;
}

export async function createAssessmentPackageForProject(
  projectId: string,
  input: AssessmentPackageCreateInput
) {
  const scope = await requireProjectScope(`/projects/${projectId}`);

  await assertProjectBelongsToScope({
    organizationId: scope.organizationId,
    projectId
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_packages")
    .insert(
      buildAssessmentPackageCreateRecord({
        organizationId: scope.organizationId,
        projectId,
        userId: scope.userId,
        title: input.title,
        assessmentDate: input.assessmentDate
      })
    )
    .select(assessmentPackageSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create assessment package: ${response.error.message}`
    );
  }

  if (!isAssessmentPackageRow(data)) {
    throw new Error("Unexpected assessment package response after create.");
  }

  return mapAssessmentPackageListItem(data);
}

export async function updateAssessmentPackage(
  projectId: string,
  assessmentPackageId: string,
  input: AssessmentPackageInput
) {
  const scope = await requireProjectScope(`/projects/${projectId}`);

  await assertProjectBelongsToScope({
    organizationId: scope.organizationId,
    projectId
  });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_packages")
    .update({
      title: input.title,
      assessment_date: input.assessmentDate,
      site_contact_name: input.siteContactName,
      site_contact_phone: input.siteContactPhone,
      access_notes: input.accessNotes,
      parking_notes: input.parkingNotes,
      site_notes: input.siteNotes,
      customer_goals: input.customerGoals,
      current_conditions_summary: input.currentConditionsSummary,
      recommended_system_summary: input.recommendedSystemSummary,
      risk_summary: input.riskSummary,
      estimate_handoff_summary: input.estimateHandoffSummary,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .eq("id", assessmentPackageId)
    .select(assessmentPackageSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update assessment package: ${response.error.message}`
    );
  }

  if (!isAssessmentPackageRow(data)) {
    throw new Error("Assessment package not found for this project.");
  }

  return mapAssessmentPackageListItem(data);
}

export async function updateAssessmentPackageStatus(
  projectId: string,
  assessmentPackageId: string,
  input: AssessmentPackageStatusInput
) {
  const currentPackage = await getAssessmentPackageById({
    projectId,
    assessmentPackageId
  });

  if (!currentPackage) {
    throw new Error("Assessment package not found for this project.");
  }

  if (
    !canTransitionAssessmentPackageStatus(currentPackage.status, input.status)
  ) {
    throw new Error(
      `Assessment package cannot move from ${currentPackage.status} to ${input.status}.`
    );
  }

  const scope = await requireProjectScope(`/projects/${projectId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("assessment_packages")
    .update({
      status: input.status,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId)
    .eq("id", assessmentPackageId)
    .select(assessmentPackageSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update assessment package status: ${response.error.message}`
    );
  }

  if (!isAssessmentPackageRow(data)) {
    throw new Error("Assessment package not found for this project.");
  }

  return mapAssessmentPackageListItem(data);
}
