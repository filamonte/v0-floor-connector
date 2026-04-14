"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canTransitionEstimateStatus } from "@floorconnector/domain";
import type { EstimateStatus } from "@floorconnector/types";

import { createEstimate, updateEstimate, updateEstimateStatus } from "./data";
import { estimateInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
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

function parseEstimateInput(formData: FormData) {
  const lineItemNames = getFieldValues(formData, "lineItemName");
  const lineItemDescriptions = getFieldValues(formData, "lineItemDescription");
  const lineItemQuantities = getFieldValues(formData, "lineItemQuantity");
  const lineItemUnits = getFieldValues(formData, "lineItemUnit");
  const lineItemUnitPrices = getFieldValues(formData, "lineItemUnitPrice");

  const lineItems = lineItemNames
    .map((name, index) => ({
      name,
      description: lineItemDescriptions[index] ?? "",
      quantity: lineItemQuantities[index] ?? "",
      unit: lineItemUnits[index] ?? "",
      unitPrice: lineItemUnitPrices[index] ?? ""
    }))
    .filter((lineItem) =>
      Object.values(lineItem).some((value) => value.trim().length > 0)
    );

  return estimateInputSchema.safeParse({
    projectId: getFieldValue(formData, "projectId"),
    status: getFieldValue(formData, "status"),
    taxAmount: getFieldValue(formData, "taxAmount"),
    discountAmount: getFieldValue(formData, "discountAmount"),
    lineItems,
    notes: getFieldValue(formData, "notes")
  });
}

function getStatusActionLabel(status: EstimateStatus) {
  switch (status) {
    case "sent":
      return "marked as sent";
    case "approved":
      return "marked as approved";
    case "rejected":
      return "marked as rejected";
    case "draft":
      return "saved as draft";
    default:
      return "updated";
  }
}

export async function createEstimateAction(formData: FormData) {
  const result = parseEstimateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/estimates", {
        error: result.error.issues[0]?.message ?? "Unable to create estimate."
      })
    );
  }

  let estimate;

  try {
    estimate = await createEstimate(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/estimates", {
        error:
          error instanceof Error ? error.message : "Unable to create estimate."
      })
    );
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);

  redirect(
    buildRedirect("/estimates", {
      message: `${estimate.referenceNumber} was created successfully.`
    })
  );
}

export async function updateEstimateAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = parseEstimateInput(formData);

  if (!estimateId) {
    redirect(
      buildRedirect("/estimates", {
        error: "Estimate id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/estimates/${estimateId}/edit`, {
        error: result.error.issues[0]?.message ?? "Unable to update estimate."
      })
    );
  }

  let estimate;

  try {
    estimate = await updateEstimate(estimateId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/estimates/${estimateId}/edit`, {
        error:
          error instanceof Error ? error.message : "Unable to update estimate."
      })
    );
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);

  redirect(
    buildRedirect(`/estimates/${estimate.id}/edit`, {
      message: `${estimate.referenceNumber} was updated successfully.`
    })
  );
}

export async function updateEstimateStatusAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const currentStatus = getFieldValue(formData, "currentStatus");
  const nextStatus = getFieldValue(formData, "nextStatus");

  if (!estimateId) {
    redirect(
      buildRedirect("/estimates", {
        error: "Estimate id is required for status updates."
      })
    );
  }

  if (
    !["draft", "sent", "approved", "rejected"].includes(currentStatus) ||
    !["draft", "sent", "approved", "rejected"].includes(nextStatus)
  ) {
    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error: "Invalid estimate status transition."
      })
    );
  }

  if (
    !canTransitionEstimateStatus(
      currentStatus as EstimateStatus,
      nextStatus as EstimateStatus
    )
  ) {
    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error: `Estimate cannot move from ${currentStatus} to ${nextStatus}.`
      })
    );
  }

  let estimate;

  try {
    estimate = await updateEstimateStatus(estimateId, nextStatus as EstimateStatus);
  } catch (error) {
    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update estimate status."
      })
    );
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);

  redirect(
    buildRedirect(`/estimates/${estimate.id}`, {
      message: `${estimate.referenceNumber} was ${getStatusActionLabel(
        estimate.status
      )}.`
    })
  );
}
