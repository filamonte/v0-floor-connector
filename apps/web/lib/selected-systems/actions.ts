"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  changeSelectedSystemStatus,
  toggleSelectedSystemPrimary,
  upsertSelectedSystem
} from "./data";
import { selectedSystemInputSchema } from "./schemas";
import { selectedSystemStatuses } from "./constants";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function buildRedirect(pathname: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function getReturnTo(formData: FormData) {
  return getFieldValue(formData, "returnTo") || "/settings/selected-systems";
}

function revalidateSelectedSystems() {
  revalidatePath("/settings");
  revalidatePath("/settings/selected-systems");
}

export async function saveSelectedSystemAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = selectedSystemInputSchema.safeParse({
    selectedSystemId: getFieldValue(formData, "selectedSystemId"),
    floorSystemTemplateId: getFieldValue(formData, "floorSystemTemplateId"),
    finishProductId: getFieldValue(formData, "finishProductId"),
    opportunityId: getFieldValue(formData, "opportunityId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    estimateId: getFieldValue(formData, "estimateId"),
    contractId: getFieldValue(formData, "contractId"),
    jobId: getFieldValue(formData, "jobId"),
    source: getFieldValue(formData, "source") || "manual",
    status: getFieldValue(formData, "status") || "draft",
    isPrimary: getCheckboxValue(formData, "isPrimary"),
    areaLabel: getFieldValue(formData, "areaLabel"),
    areaType: getFieldValue(formData, "areaType") || "whole_project",
    phaseLabel: getFieldValue(formData, "phaseLabel"),
    optionLabel: getFieldValue(formData, "optionLabel"),
    estimatedAreaSqft: getFieldValue(formData, "estimatedAreaSqft"),
    estimatedLinearFt: getFieldValue(formData, "estimatedLinearFt"),
    quantityNotes: getFieldValue(formData, "quantityNotes"),
    customerFacingDescription: getFieldValue(formData, "customerFacingDescription"),
    internalNotes: getFieldValue(formData, "internalNotes"),
    specCompletenessStatus:
      getFieldValue(formData, "specCompletenessStatus") || "incomplete"
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to save selected system."
      })
    );
  }

  let redirectTo: string;

  try {
    const selectedSystem = await upsertSelectedSystem(result.data);
    revalidateSelectedSystems();
    redirectTo = buildRedirect(returnTo, {
      message: `Selected system ${selectedSystem.id} was saved.`
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to save selected system."
      })
    );
  }

  redirect(redirectTo);
}

export async function changeSelectedSystemStatusAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const selectedSystemId = getFieldValue(formData, "selectedSystemId");
  const status = getFieldValue(formData, "status");

  if (!selectedSystemId) {
    redirect(buildRedirect(returnTo, { error: "Selected system id is required." }));
  }

  if (!selectedSystemStatuses.includes(status as never)) {
    redirect(buildRedirect(returnTo, { error: "Select a valid selected-system status." }));
  }

  let redirectTo: string;

  try {
    await changeSelectedSystemStatus(selectedSystemId, status as never);
    revalidateSelectedSystems();
    redirectTo = buildRedirect(returnTo, {
      message: "Selected system status was updated."
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update selected system status."
      })
    );
  }

  redirect(redirectTo);
}

export async function voidSelectedSystemAction(formData: FormData) {
  formData.set("status", "void");
  return changeSelectedSystemStatusAction(formData);
}

export async function archiveSelectedSystemAction(formData: FormData) {
  formData.set("status", "retracted");
  return changeSelectedSystemStatusAction(formData);
}

export async function toggleSelectedSystemPrimaryAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const selectedSystemId = getFieldValue(formData, "selectedSystemId");

  if (!selectedSystemId) {
    redirect(buildRedirect(returnTo, { error: "Selected system id is required." }));
  }

  let redirectTo: string;

  try {
    await toggleSelectedSystemPrimary(
      selectedSystemId,
      getCheckboxValue(formData, "isPrimary")
    );
    revalidateSelectedSystems();
    redirectTo = buildRedirect(returnTo, { message: "Primary selection was updated." });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update primary selection."
      })
    );
  }

  redirect(redirectTo);
}
