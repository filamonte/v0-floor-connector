"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelEquipmentAssignment,
  createEquipmentAsset,
  createEquipmentAssignment,
  createJobEquipmentRequirement,
  removeJobEquipmentRequirement,
  updateEquipmentAsset,
  updateEquipmentAssignment,
  updateJobEquipmentRequirement
} from "./data";
import {
  equipmentAssetInputSchema,
  equipmentAssignmentInputSchema,
  jobEquipmentRequirementInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getNullableYearValue(formData: FormData, key: string) {
  const value = getFieldValue(formData, key).trim();

  return value.length > 0 ? Number(value) : null;
}

function getNullableNumberValue(formData: FormData, key: string) {
  const value = getFieldValue(formData, key).trim();

  return value.length > 0 ? Number(value) : null;
}

function getRedirectTarget(formData: FormData, fallback: string) {
  const redirectTo = getFieldValue(formData, "redirectTo");

  return redirectTo || fallback;
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function parseEquipmentAssetInput(formData: FormData) {
  return equipmentAssetInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    vendorId: getFieldValue(formData, "vendorId"),
    assetTag: getFieldValue(formData, "assetTag"),
    serialNumber: getFieldValue(formData, "serialNumber"),
    equipmentType: getFieldValue(formData, "equipmentType"),
    ownershipStatus: getFieldValue(formData, "ownershipStatus"),
    operationalStatus: getFieldValue(formData, "operationalStatus"),
    manufacturer: getFieldValue(formData, "manufacturer"),
    model: getFieldValue(formData, "model"),
    year: getNullableYearValue(formData, "year"),
    purchaseDate: getFieldValue(formData, "purchaseDate"),
    purchaseCost: getFieldValue(formData, "purchaseCost"),
    rentalStartDate: getFieldValue(formData, "rentalStartDate"),
    rentalEndDate: getFieldValue(formData, "rentalEndDate"),
    notes: getFieldValue(formData, "notes"),
    isActive: getCheckboxValue(formData, "isActive")
  });
}

function parseJobEquipmentRequirementInput(formData: FormData) {
  return jobEquipmentRequirementInputSchema.safeParse({
    jobId: getFieldValue(formData, "jobId"),
    equipmentType: getFieldValue(formData, "equipmentType"),
    quantity: getNullableNumberValue(formData, "quantity"),
    required: getCheckboxValue(formData, "required"),
    notes: getFieldValue(formData, "notes")
  });
}

function parseEquipmentAssignmentInput(formData: FormData) {
  return equipmentAssignmentInputSchema.safeParse({
    jobId: getFieldValue(formData, "jobId"),
    equipmentAssetId: getFieldValue(formData, "equipmentAssetId"),
    assignedDate: getFieldValue(formData, "assignedDate"),
    scheduledStartAt: getFieldValue(formData, "scheduledStartAt"),
    scheduledEndAt: getFieldValue(formData, "scheduledEndAt"),
    assignmentStatus: getFieldValue(formData, "assignmentStatus") || "planned",
    notes: getFieldValue(formData, "notes")
  });
}

function revalidateEquipmentJobRoutes(input: {
  jobId: string;
  projectId?: string | null;
  equipmentAssetId?: string | null;
}) {
  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath(`/jobs/${input.jobId}`);
  revalidatePath("/dashboard");

  if (input.projectId) {
    revalidatePath(`/projects/${input.projectId}`);
  }

  if (input.equipmentAssetId) {
    revalidatePath(`/equipment/${input.equipmentAssetId}`);
  }
}

export async function createEquipmentAssetAction(formData: FormData) {
  const result = parseEquipmentAssetInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/equipment", {
        compose: "1",
        error:
          result.error.issues[0]?.message ?? "Unable to create equipment asset."
      })
    );
  }

  let asset;

  try {
    asset = await createEquipmentAsset(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/equipment", {
        compose: "1",
        error:
          error instanceof Error
            ? error.message
            : "Unable to create equipment asset."
      })
    );
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${asset.id}`);

  redirect(
    buildRedirect(`/equipment/${asset.id}`, {
      message: `${asset.name} was created successfully.`
    })
  );
}

export async function updateEquipmentAssetAction(formData: FormData) {
  const equipmentAssetId = getFieldValue(formData, "equipmentAssetId");
  const result = parseEquipmentAssetInput(formData);

  if (!equipmentAssetId) {
    redirect(
      buildRedirect("/equipment", {
        error: "Equipment asset id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/equipment/${equipmentAssetId}`, {
        error:
          result.error.issues[0]?.message ?? "Unable to update equipment asset."
      })
    );
  }

  let asset;

  try {
    asset = await updateEquipmentAsset(equipmentAssetId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/equipment/${equipmentAssetId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update equipment asset."
      })
    );
  }

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${asset.id}`);

  redirect(
    buildRedirect(`/equipment/${asset.id}`, {
      message: `${asset.name} was updated successfully.`
    })
  );
}

export async function addJobEquipmentRequirementAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );
  const result = parseJobEquipmentRequirementInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          result.error.issues[0]?.message ??
          "Unable to add equipment requirement."
      })
    );
  }

  try {
    await createJobEquipmentRequirement(result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add equipment requirement."
      })
    );
  }

  revalidateEquipmentJobRoutes({ jobId, projectId });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment requirement was added successfully."
    })
  );
}

export async function updateJobEquipmentRequirementAction(formData: FormData) {
  const requirementId = getFieldValue(formData, "requirementId");
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );
  const result = parseJobEquipmentRequirementInput(formData);

  if (!requirementId) {
    redirect(
      buildRedirect(redirectTarget, {
        error: "Equipment requirement id is required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update equipment requirement."
      })
    );
  }

  try {
    await updateJobEquipmentRequirement(requirementId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update equipment requirement."
      })
    );
  }

  revalidateEquipmentJobRoutes({ jobId, projectId });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment requirement was updated successfully."
    })
  );
}

export async function removeJobEquipmentRequirementAction(formData: FormData) {
  const requirementId = getFieldValue(formData, "requirementId");
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );

  if (!jobId || !requirementId) {
    redirect(
      buildRedirect(redirectTarget, {
        error: "Job id and equipment requirement id are required."
      })
    );
  }

  try {
    await removeJobEquipmentRequirement(jobId, requirementId);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove equipment requirement."
      })
    );
  }

  revalidateEquipmentJobRoutes({ jobId, projectId });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment requirement was removed successfully."
    })
  );
}

export async function assignEquipmentToJobAction(formData: FormData) {
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );
  const result = parseEquipmentAssignmentInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          result.error.issues[0]?.message ??
          "Unable to assign equipment to this job."
      })
    );
  }

  let assignment;

  try {
    assignment = await createEquipmentAssignment(result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to assign equipment to this job."
      })
    );
  }

  revalidateEquipmentJobRoutes({
    jobId,
    projectId,
    equipmentAssetId: assignment.equipmentAssetId
  });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment assignment was added successfully."
    })
  );
}

export async function updateEquipmentAssignmentAction(formData: FormData) {
  const assignmentId = getFieldValue(formData, "assignmentId");
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );
  const result = parseEquipmentAssignmentInput(formData);

  if (!assignmentId) {
    redirect(
      buildRedirect(redirectTarget, {
        error: "Equipment assignment id is required."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update equipment assignment."
      })
    );
  }

  let assignment;

  try {
    assignment = await updateEquipmentAssignment(assignmentId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update equipment assignment."
      })
    );
  }

  revalidateEquipmentJobRoutes({
    jobId,
    projectId,
    equipmentAssetId: assignment.equipmentAssetId
  });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment assignment was updated successfully."
    })
  );
}

export async function cancelEquipmentAssignmentAction(formData: FormData) {
  const assignmentId = getFieldValue(formData, "assignmentId");
  const jobId = getFieldValue(formData, "jobId");
  const projectId = getFieldValue(formData, "projectId");
  const equipmentAssetId = getFieldValue(formData, "equipmentAssetId");
  const redirectTarget = getRedirectTarget(
    formData,
    jobId ? `/jobs/${jobId}` : "/jobs"
  );

  if (!jobId || !assignmentId) {
    redirect(
      buildRedirect(redirectTarget, {
        error: "Job id and equipment assignment id are required."
      })
    );
  }

  try {
    await cancelEquipmentAssignment(jobId, assignmentId);
  } catch (error) {
    redirect(
      buildRedirect(redirectTarget, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to cancel equipment assignment."
      })
    );
  }

  revalidateEquipmentJobRoutes({ jobId, projectId, equipmentAssetId });

  redirect(
    buildRedirect(redirectTarget, {
      message: "Equipment assignment was canceled successfully."
    })
  );
}
