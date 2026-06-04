"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  updateEstimateRoleSlots,
  updateOpportunityRoleSlots,
  updateProjectRoleSlots
} from "./data";
import {
  estimateRoleSlotsInputSchema,
  opportunityRoleSlotsInputSchema,
  projectRoleSlotsInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function normalizeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
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

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to update role slots.";
}

export async function updateOpportunityRoleSlotsAction(formData: FormData) {
  const returnTo = normalizeReturnTo(getFieldValue(formData, "returnTo"));
  const parsed = opportunityRoleSlotsInputSchema.safeParse({
    opportunityId: getFieldValue(formData, "opportunityId"),
    onsiteRepPersonId: getFieldValue(formData, "onsiteRepPersonId"),
    relationshipOwnerPersonId: getFieldValue(
      formData,
      "relationshipOwnerPersonId"
    ),
    returnTo
  });

  if (!parsed.success) {
    redirect(
      buildRedirect(returnTo, {
        error: "Role slot update was invalid. Choose an active team member."
      })
    );
  }

  try {
    await updateOpportunityRoleSlots(parsed.data);
    revalidatePath(returnTo);
  } catch (error) {
    redirect(buildRedirect(returnTo, { error: getErrorMessage(error) }));
  }

  redirect(buildRedirect(returnTo, { message: "Lead role slots updated." }));
}

export async function updateProjectRoleSlotsAction(formData: FormData) {
  const returnTo = normalizeReturnTo(getFieldValue(formData, "returnTo"));
  const parsed = projectRoleSlotsInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    onsiteRepPersonId: getFieldValue(formData, "onsiteRepPersonId"),
    relationshipOwnerPersonId: getFieldValue(
      formData,
      "relationshipOwnerPersonId"
    ),
    followUpOwnerPersonId: getFieldValue(formData, "followUpOwnerPersonId"),
    salesCreditOwnerPersonId: getFieldValue(
      formData,
      "salesCreditOwnerPersonId"
    ),
    returnTo
  });

  if (!parsed.success) {
    redirect(
      buildRedirect(returnTo, {
        error: "Role slot update was invalid. Choose an active team member."
      })
    );
  }

  try {
    await updateProjectRoleSlots(parsed.data);
    revalidatePath(returnTo);
  } catch (error) {
    redirect(buildRedirect(returnTo, { error: getErrorMessage(error) }));
  }

  redirect(buildRedirect(returnTo, { message: "Project role slots updated." }));
}

export async function updateEstimateRoleSlotsAction(formData: FormData) {
  const returnTo = normalizeReturnTo(getFieldValue(formData, "returnTo"));
  const parsed = estimateRoleSlotsInputSchema.safeParse({
    estimateId: getFieldValue(formData, "estimateId"),
    estimateWriterPersonId: getFieldValue(formData, "estimateWriterPersonId"),
    returnTo
  });

  if (!parsed.success) {
    redirect(
      buildRedirect(returnTo, {
        error: "Role slot update was invalid. Choose an active team member."
      })
    );
  }

  try {
    await updateEstimateRoleSlots(parsed.data);
    revalidatePath(returnTo);
  } catch (error) {
    redirect(buildRedirect(returnTo, { error: getErrorMessage(error) }));
  }

  redirect(
    buildRedirect(returnTo, { message: "Estimate role slots updated." })
  );
}
