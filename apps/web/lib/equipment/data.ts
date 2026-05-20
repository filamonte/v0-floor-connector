import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  EquipmentAsset,
  EquipmentAssignment,
  EquipmentAssignmentStatus,
  EquipmentOperationalStatus,
  EquipmentOwnershipStatus,
  EquipmentType,
  JobEquipmentRequirement,
  MembershipRole
} from "@floorconnector/types";

import type {
  EquipmentAssetInput,
  EquipmentAssignmentInput,
  JobEquipmentRequirementInput
} from "./schemas";
import {
  activeEquipmentAssignmentStatuses,
  deriveJobEquipmentReadinessSummary,
  type EquipmentReadinessConflictInput,
  type EquipmentReadinessWarning,
  type JobEquipmentReadinessSummary
} from "./readiness";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type EquipmentAssetRow = {
  id: string;
  company_id: string;
  vendor_id: string | null;
  name: string;
  asset_tag: string | null;
  serial_number: string | null;
  equipment_type: EquipmentAsset["equipmentType"];
  ownership_status: EquipmentAsset["ownershipStatus"];
  operational_status: EquipmentAsset["operationalStatus"];
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  purchase_date: string | null;
  purchase_cost: string | number | null;
  rental_start_date: string | null;
  rental_end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type EquipmentScope = {
  userId: string;
  organizationId: string;
  role: MembershipRole;
};

type EquipmentVendorOptionRow = {
  id: string;
  name: string;
  is_active: boolean;
};

type JobEquipmentRequirementRow = {
  id: string;
  company_id: string;
  job_id: string;
  equipment_type: EquipmentType;
  quantity: number;
  required: boolean;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type EquipmentAssignmentRow = {
  id: string;
  company_id: string;
  equipment_asset_id: string;
  job_id: string;
  project_id: string | null;
  assigned_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  assignment_status: EquipmentAssignmentStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  equipment_assets?: {
    id: string;
    name: string;
    equipment_type: EquipmentType;
    ownership_status: EquipmentOwnershipStatus;
    operational_status: EquipmentOperationalStatus;
    rental_start_date: string | null;
    rental_end_date: string | null;
    is_active: boolean;
  } | null;
  jobs?: {
    id: string;
    project_id: string;
    scheduled_date: string | null;
    scheduled_start_at: string | null;
    scheduled_end_at: string | null;
  } | null;
};

type JobEquipmentContextRow = {
  id: string;
  company_id: string;
  project_id: string;
  scheduled_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
};

type SelectableEquipmentAssetRow = {
  id: string;
  name: string;
  asset_tag: string | null;
  equipment_type: EquipmentType;
  ownership_status: EquipmentOwnershipStatus;
  operational_status: EquipmentOperationalStatus;
  rental_start_date: string | null;
  rental_end_date: string | null;
};

type EquipmentAssignmentConflictRow = {
  id: string;
  equipment_asset_id: string;
  job_id: string;
  assigned_date: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  assignment_status: EquipmentAssignmentStatus;
  jobs?: {
    id: string;
    project_id: string;
    scheduled_date: string | null;
    scheduled_start_at: string | null;
    scheduled_end_at: string | null;
    projects?: { id: string; name: string } | null;
  } | null;
};

export type EquipmentVendorOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type SelectableEquipmentAsset = {
  id: string;
  name: string;
  assetTag: string | null;
  equipmentType: EquipmentType;
  ownershipStatus: EquipmentOwnershipStatus;
  operationalStatus: EquipmentOperationalStatus;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
};

export type EquipmentAssignmentListItem = EquipmentAssignment & {
  asset: {
    id: string;
    name: string;
    equipmentType: EquipmentType;
    ownershipStatus: EquipmentOwnershipStatus;
    operationalStatus: EquipmentOperationalStatus;
    rentalStartDate: string | null;
    rentalEndDate: string | null;
    isActive: boolean;
  } | null;
};

export type { EquipmentReadinessWarning, JobEquipmentReadinessSummary };

const equipmentAssetSelect = `
  id,
  company_id,
  vendor_id,
  name,
  asset_tag,
  serial_number,
  equipment_type,
  ownership_status,
  operational_status,
  manufacturer,
  model,
  year,
  purchase_date,
  purchase_cost,
  rental_start_date,
  rental_end_date,
  notes,
  is_active,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const equipmentVendorOptionSelect = `
  id,
  name,
  is_active
`;

const jobEquipmentRequirementSelect = `
  id,
  company_id,
  job_id,
  equipment_type,
  quantity,
  required,
  notes,
  created_by,
  updated_by,
  created_at,
  updated_at
`;

const equipmentAssignmentSelect = `
  id,
  company_id,
  equipment_asset_id,
  job_id,
  project_id,
  assigned_date,
  scheduled_start_at,
  scheduled_end_at,
  assignment_status,
  notes,
  created_by,
  updated_by,
  created_at,
  updated_at,
  equipment_assets (
    id,
    name,
    equipment_type,
    ownership_status,
    operational_status,
    rental_start_date,
    rental_end_date,
    is_active
  ),
  jobs (
    id,
    project_id,
    scheduled_date,
    scheduled_start_at,
    scheduled_end_at
  )
`;

const selectableEquipmentAssetSelect = `
  id,
  name,
  asset_tag,
  equipment_type,
  ownership_status,
  operational_status,
  rental_start_date,
  rental_end_date
`;

const equipmentAssignmentConflictSelect = `
  id,
  equipment_asset_id,
  job_id,
  assigned_date,
  scheduled_start_at,
  scheduled_end_at,
  assignment_status,
  jobs (
    id,
    project_id,
    scheduled_date,
    scheduled_start_at,
    scheduled_end_at,
    projects (
      id,
      name
    )
  )
`;

const mutationRoles = new Set<MembershipRole>(["owner", "admin", "manager"]);

function isEquipmentAssetRow(value: unknown): value is EquipmentAssetRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EquipmentAssetRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.name === "string" &&
    typeof row.equipment_type === "string" &&
    typeof row.ownership_status === "string" &&
    typeof row.operational_status === "string" &&
    typeof row.is_active === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isEquipmentAssetRowArray(
  value: unknown
): value is EquipmentAssetRow[] {
  return Array.isArray(value) && value.every((row) => isEquipmentAssetRow(row));
}

function isEquipmentVendorOptionRow(
  value: unknown
): value is EquipmentVendorOptionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<EquipmentVendorOptionRow>;

  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.is_active === "boolean"
  );
}

function isEquipmentVendorOptionRowArray(
  value: unknown
): value is EquipmentVendorOptionRow[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isEquipmentVendorOptionRow(row))
  );
}

function mapEquipmentAsset(row: EquipmentAssetRow): EquipmentAsset {
  return {
    id: row.id,
    organizationId: row.company_id,
    vendorId: row.vendor_id,
    name: row.name,
    assetTag: row.asset_tag,
    serialNumber: row.serial_number,
    equipmentType: row.equipment_type,
    ownershipStatus: row.ownership_status,
    operationalStatus: row.operational_status,
    manufacturer: row.manufacturer,
    model: row.model,
    year: row.year,
    purchaseDate: row.purchase_date,
    purchaseCost:
      row.purchase_cost === null || row.purchase_cost === undefined
        ? null
        : String(row.purchase_cost),
    rentalStartDate: row.rental_start_date,
    rentalEndDate: row.rental_end_date,
    notes: row.notes,
    isActive: row.is_active,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEquipmentVendorOption(
  row: EquipmentVendorOptionRow
): EquipmentVendorOption {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active
  };
}

function mapJobEquipmentRequirement(
  row: JobEquipmentRequirementRow
): JobEquipmentRequirement {
  return {
    id: row.id,
    organizationId: row.company_id,
    jobId: row.job_id,
    equipmentType: row.equipment_type,
    quantity: row.quantity,
    required: row.required,
    notes: row.notes,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEquipmentAssignment(
  row: EquipmentAssignmentRow
): EquipmentAssignment {
  return {
    id: row.id,
    organizationId: row.company_id,
    equipmentAssetId: row.equipment_asset_id,
    jobId: row.job_id,
    projectId: row.project_id,
    assignedDate: row.assigned_date,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    assignmentStatus: row.assignment_status,
    notes: row.notes,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEquipmentAssignmentListItem(
  row: EquipmentAssignmentRow
): EquipmentAssignmentListItem {
  return {
    ...mapEquipmentAssignment(row),
    asset: row.equipment_assets
      ? {
          id: row.equipment_assets.id,
          name: row.equipment_assets.name,
          equipmentType: row.equipment_assets.equipment_type,
          ownershipStatus: row.equipment_assets.ownership_status,
          operationalStatus: row.equipment_assets.operational_status,
          rentalStartDate: row.equipment_assets.rental_start_date,
          rentalEndDate: row.equipment_assets.rental_end_date,
          isActive: row.equipment_assets.is_active
        }
      : null
  };
}

function mapSelectableEquipmentAsset(
  row: SelectableEquipmentAssetRow
): SelectableEquipmentAsset {
  return {
    id: row.id,
    name: row.name,
    assetTag: row.asset_tag,
    equipmentType: row.equipment_type,
    ownershipStatus: row.ownership_status,
    operationalStatus: row.operational_status,
    rentalStartDate: row.rental_start_date,
    rentalEndDate: row.rental_end_date
  };
}

async function getEquipmentScope(
  next = "/equipment"
): Promise<EquipmentScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    role: organizationContext.membership.role
  };
}

export async function requireEquipmentScope(next = "/equipment") {
  const scope = await getEquipmentScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for equipment records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function requireEquipmentMutationScope(next = "/equipment") {
  const scope = await requireEquipmentScope(next);

  if (!mutationRoles.has(scope.role)) {
    throw new Error(
      "Only owners, admins, and managers can change equipment assets."
    );
  }

  return scope;
}

async function assertVendorBelongsToOrganization(
  organizationId: string,
  vendorId: string | null
) {
  if (!vendorId) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", vendorId)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to validate equipment vendor: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Selected vendor is not available for this organization.");
  }
}

export const listEquipmentVendorOptions = cache(async () => {
  const scope = await requireEquipmentScope("/equipment");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select(equipmentVendorOptionSelect)
    .eq("company_id", scope.organizationId)
    .order("name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load equipment vendor options: ${response.error.message}`
    );
  }

  if (!isEquipmentVendorOptionRowArray(data)) {
    return [];
  }

  return data.map(mapEquipmentVendorOption);
});

export const listEquipmentAssets = cache(async () => {
  const scope = await requireEquipmentScope("/equipment");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .select(equipmentAssetSelect)
    .eq("company_id", scope.organizationId)
    .order("name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load equipment assets: ${response.error.message}`
    );
  }

  if (!isEquipmentAssetRowArray(data)) {
    return [];
  }

  return data.map(mapEquipmentAsset);
});

export async function getEquipmentAssetById(
  equipmentAssetId: string,
  next = "/equipment"
) {
  const scope = await requireEquipmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .select(equipmentAssetSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", equipmentAssetId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load the equipment asset: ${response.error.message}`
    );
  }

  if (!isEquipmentAssetRow(data)) {
    return null;
  }

  return mapEquipmentAsset(data);
}

export async function createEquipmentAsset(input: EquipmentAssetInput) {
  const scope = await requireEquipmentMutationScope("/equipment");
  await assertVendorBelongsToOrganization(scope.organizationId, input.vendorId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .insert({
      company_id: scope.organizationId,
      vendor_id: input.vendorId,
      name: input.name,
      asset_tag: input.assetTag,
      serial_number: input.serialNumber,
      equipment_type: input.equipmentType,
      ownership_status: input.ownershipStatus,
      operational_status: input.operationalStatus,
      manufacturer: input.manufacturer,
      model: input.model,
      year: input.year,
      purchase_date: input.purchaseDate,
      purchase_cost: input.purchaseCost,
      rental_start_date: input.rentalStartDate,
      rental_end_date: input.rentalEndDate,
      notes: input.notes,
      is_active: input.isActive,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(equipmentAssetSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to create the equipment asset: ${response.error.message}`
    );
  }

  if (!isEquipmentAssetRow(data)) {
    throw new Error("Unexpected equipment asset response after create.");
  }

  return mapEquipmentAsset(data);
}

export async function updateEquipmentAsset(
  equipmentAssetId: string,
  input: EquipmentAssetInput
) {
  const scope = await requireEquipmentMutationScope(
    `/equipment/${equipmentAssetId}`
  );
  await assertVendorBelongsToOrganization(scope.organizationId, input.vendorId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .update({
      vendor_id: input.vendorId,
      name: input.name,
      asset_tag: input.assetTag,
      serial_number: input.serialNumber,
      equipment_type: input.equipmentType,
      ownership_status: input.ownershipStatus,
      operational_status: input.operationalStatus,
      manufacturer: input.manufacturer,
      model: input.model,
      year: input.year,
      purchase_date: input.purchaseDate,
      purchase_cost: input.purchaseCost,
      rental_start_date: input.rentalStartDate,
      rental_end_date: input.rentalEndDate,
      notes: input.notes,
      is_active: input.isActive,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", equipmentAssetId)
    .select(equipmentAssetSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update the equipment asset: ${response.error.message}`
    );
  }

  if (!isEquipmentAssetRow(data)) {
    throw new Error("Equipment asset not found for this organization.");
  }

  return mapEquipmentAsset(data);
}

async function getScopedJobContext(
  organizationId: string,
  jobId: string
): Promise<JobEquipmentContextRow> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select(
      "id, company_id, project_id, scheduled_date, scheduled_start_at, scheduled_end_at"
    )
    .eq("company_id", organizationId)
    .eq("id", jobId)
    .maybeSingle();
  const row = response.data as JobEquipmentContextRow | null;

  if (response.error) {
    throw new Error(
      `Unable to validate equipment job: ${response.error.message}`
    );
  }

  if (!row?.id) {
    throw new Error("Job not found for this organization.");
  }

  return row;
}

async function getScopedEquipmentAssetForAssignment(
  organizationId: string,
  equipmentAssetId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .select(
      "id, company_id, name, is_active, operational_status, equipment_type, ownership_status"
    )
    .eq("company_id", organizationId)
    .eq("id", equipmentAssetId)
    .maybeSingle();
  const row = response.data as {
    id?: string;
    name?: string;
    is_active?: boolean;
    operational_status?: EquipmentOperationalStatus;
  } | null;

  if (response.error) {
    throw new Error(
      `Unable to validate equipment asset: ${response.error.message}`
    );
  }

  if (!row?.id) {
    throw new Error("Equipment asset not found for this organization.");
  }

  if (!row.is_active || row.operational_status === "retired") {
    throw new Error("Inactive or retired equipment cannot be assigned.");
  }

  if (
    row.operational_status === "maintenance" ||
    row.operational_status === "out_of_service"
  ) {
    throw new Error(
      "Equipment marked maintenance or out of service cannot be newly assigned."
    );
  }

  return row;
}

export async function listJobEquipmentRequirements(
  jobId: string,
  next = "/jobs"
) {
  const scope = await requireEquipmentScope(next);
  await getScopedJobContext(scope.organizationId, jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_equipment_requirements")
    .select(jobEquipmentRequirementSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("required", { ascending: false })
    .order("equipment_type", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load job equipment requirements: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as JobEquipmentRequirementRow[]).map(
        mapJobEquipmentRequirement
      )
    : [];
}

export async function listJobEquipmentAssignments(
  jobId: string,
  next = "/jobs"
) {
  const scope = await requireEquipmentScope(next);
  await getScopedJobContext(scope.organizationId, jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .select(equipmentAssignmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .order("assigned_date", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load job equipment assignments: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EquipmentAssignmentRow[]).map(
        mapEquipmentAssignmentListItem
      )
    : [];
}

export async function listSelectableEquipmentAssets(next = "/jobs") {
  const scope = await requireEquipmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assets")
    .select(selectableEquipmentAssetSelect)
    .eq("company_id", scope.organizationId)
    .eq("is_active", true)
    .neq("operational_status", "maintenance")
    .neq("operational_status", "out_of_service")
    .neq("operational_status", "retired")
    .order("equipment_type", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load selectable equipment assets: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as SelectableEquipmentAssetRow[]).map(
        mapSelectableEquipmentAsset
      )
    : [];
}

export async function createJobEquipmentRequirement(
  input: JobEquipmentRequirementInput
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${input.jobId}`);
  await getScopedJobContext(scope.organizationId, input.jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_equipment_requirements")
    .insert({
      company_id: scope.organizationId,
      job_id: input.jobId,
      equipment_type: input.equipmentType,
      quantity: input.quantity,
      required: input.required,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(jobEquipmentRequirementSelect)
    .single();

  if (response.error) {
    throw new Error(
      `Unable to add equipment requirement: ${response.error.message}`
    );
  }

  return mapJobEquipmentRequirement(
    response.data as unknown as JobEquipmentRequirementRow
  );
}

export async function updateJobEquipmentRequirement(
  requirementId: string,
  input: JobEquipmentRequirementInput
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${input.jobId}`);
  await getScopedJobContext(scope.organizationId, input.jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_equipment_requirements")
    .update({
      equipment_type: input.equipmentType,
      quantity: input.quantity,
      required: input.required,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("job_id", input.jobId)
    .eq("id", requirementId)
    .select(jobEquipmentRequirementSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to update equipment requirement: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Equipment requirement not found for this job.");
  }

  return mapJobEquipmentRequirement(
    response.data as unknown as JobEquipmentRequirementRow
  );
}

export async function removeJobEquipmentRequirement(
  jobId: string,
  requirementId: string
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${jobId}`);
  await getScopedJobContext(scope.organizationId, jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("job_equipment_requirements")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .eq("id", requirementId);

  if (response.error) {
    throw new Error(
      `Unable to remove equipment requirement: ${response.error.message}`
    );
  }
}

export async function createEquipmentAssignment(
  input: EquipmentAssignmentInput
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${input.jobId}`);
  const [job] = await Promise.all([
    getScopedJobContext(scope.organizationId, input.jobId),
    getScopedEquipmentAssetForAssignment(
      scope.organizationId,
      input.equipmentAssetId
    )
  ]);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .insert({
      company_id: scope.organizationId,
      equipment_asset_id: input.equipmentAssetId,
      job_id: input.jobId,
      project_id: job.project_id,
      assigned_date: input.assignedDate,
      scheduled_start_at: input.scheduledStartAt,
      scheduled_end_at: input.scheduledEndAt,
      assignment_status: input.assignmentStatus,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(equipmentAssignmentSelect)
    .single();

  if (response.error) {
    throw new Error(
      `Unable to assign equipment to the job: ${response.error.message}`
    );
  }

  return mapEquipmentAssignmentListItem(
    response.data as unknown as EquipmentAssignmentRow
  );
}

export async function updateEquipmentAssignment(
  assignmentId: string,
  input: EquipmentAssignmentInput
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${input.jobId}`);
  await Promise.all([
    getScopedJobContext(scope.organizationId, input.jobId),
    getScopedEquipmentAssetForAssignment(
      scope.organizationId,
      input.equipmentAssetId
    )
  ]);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .update({
      equipment_asset_id: input.equipmentAssetId,
      assigned_date: input.assignedDate,
      scheduled_start_at: input.scheduledStartAt,
      scheduled_end_at: input.scheduledEndAt,
      assignment_status: input.assignmentStatus,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("job_id", input.jobId)
    .eq("id", assignmentId)
    .select(equipmentAssignmentSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to update equipment assignment: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Equipment assignment not found for this job.");
  }

  return mapEquipmentAssignmentListItem(
    response.data as unknown as EquipmentAssignmentRow
  );
}

export async function cancelEquipmentAssignment(
  jobId: string,
  assignmentId: string
) {
  const scope = await requireEquipmentMutationScope(`/jobs/${jobId}`);
  await getScopedJobContext(scope.organizationId, jobId);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .update({
      assignment_status: "canceled",
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("job_id", jobId)
    .eq("id", assignmentId)
    .select(equipmentAssignmentSelect)
    .maybeSingle();

  if (response.error) {
    throw new Error(
      `Unable to cancel equipment assignment: ${response.error.message}`
    );
  }

  if (!response.data) {
    throw new Error("Equipment assignment not found for this job.");
  }

  return mapEquipmentAssignmentListItem(
    response.data as unknown as EquipmentAssignmentRow
  );
}

async function listPotentialEquipmentAssignmentConflicts(input: {
  organizationId: string;
  assignments: EquipmentAssignmentListItem[];
}) {
  const assetIds = [
    ...new Set(
      input.assignments
        .filter((assignment) =>
          activeEquipmentAssignmentStatuses.includes(
            assignment.assignmentStatus
          )
        )
        .map((assignment) => assignment.equipmentAssetId)
    )
  ];

  if (assetIds.length === 0) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .select(equipmentAssignmentConflictSelect)
    .eq("company_id", input.organizationId)
    .in("equipment_asset_id", assetIds)
    .in("assignment_status", activeEquipmentAssignmentStatuses);

  if (response.error) {
    throw new Error(
      `Unable to load equipment assignment conflicts: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EquipmentAssignmentConflictRow[])
    : [];
}

function mapEquipmentAssignmentConflictInput(
  row: EquipmentAssignmentConflictRow
): EquipmentReadinessConflictInput {
  return {
    id: row.id,
    equipmentAssetId: row.equipment_asset_id,
    assignedDate: row.assigned_date,
    scheduledStartAt: row.scheduled_start_at,
    scheduledEndAt: row.scheduled_end_at,
    assignmentStatus: row.assignment_status,
    jobScheduledDate: row.jobs?.scheduled_date ?? null,
    jobScheduledStartAt: row.jobs?.scheduled_start_at ?? null,
    jobScheduledEndAt: row.jobs?.scheduled_end_at ?? null
  };
}

export async function getJobEquipmentReadinessSummary(
  jobId: string,
  next = "/jobs"
): Promise<JobEquipmentReadinessSummary> {
  const scope = await requireEquipmentScope(next);
  const job = await getScopedJobContext(scope.organizationId, jobId);
  const [requirements, assignments] = await Promise.all([
    listJobEquipmentRequirements(jobId, next),
    listJobEquipmentAssignments(jobId, next)
  ]);
  const activeAssignments = assignments.filter((assignment) =>
    activeEquipmentAssignmentStatuses.includes(assignment.assignmentStatus)
  );
  const possibleConflicts = await listPotentialEquipmentAssignmentConflicts({
    organizationId: scope.organizationId,
    assignments: activeAssignments
  });

  return deriveJobEquipmentReadinessSummary({
    job: {
      id: job.id,
      scheduledDate: job.scheduled_date,
      scheduledStartAt: job.scheduled_start_at,
      scheduledEndAt: job.scheduled_end_at
    },
    requirements,
    assignments,
    possibleConflicts: possibleConflicts.map(
      mapEquipmentAssignmentConflictInput
    )
  });
}

export async function getProjectEquipmentReadinessSummary(
  projectId: string,
  next = "/projects"
) {
  const scope = await requireEquipmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("jobs")
    .select("id")
    .eq("company_id", scope.organizationId)
    .eq("project_id", projectId);

  if (response.error) {
    throw new Error(
      `Unable to load project equipment jobs: ${response.error.message}`
    );
  }

  const jobIds = Array.isArray(response.data)
    ? (response.data as Array<{ id?: string }>)
        .map((row) => row.id)
        .filter((id): id is string => Boolean(id))
    : [];
  const summaries = await Promise.all(
    jobIds.map((jobId) => getJobEquipmentReadinessSummary(jobId, next))
  );

  return {
    jobCount: jobIds.length,
    jobsWithMissingRequiredEquipment: summaries.filter(
      (summary) => summary.missingRequiredCount > 0
    ).length,
    jobsWithEquipmentWarnings: summaries.filter(
      (summary) => summary.warnings.length > 0
    ).length,
    warningCount: summaries.reduce(
      (total, summary) => total + summary.warnings.length,
      0
    )
  };
}

export async function listEquipmentAssignmentsByAsset(
  equipmentAssetId: string,
  next = "/equipment"
) {
  const scope = await requireEquipmentScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("equipment_assignments")
    .select(equipmentAssignmentSelect)
    .eq("company_id", scope.organizationId)
    .eq("equipment_asset_id", equipmentAssetId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (response.error) {
    throw new Error(
      `Unable to load equipment assignments: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EquipmentAssignmentRow[]).map(
        mapEquipmentAssignmentListItem
      )
    : [];
}
