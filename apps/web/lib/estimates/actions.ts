"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canTransitionEstimateStatus } from "@floorconnector/domain";
import type { CatalogItem, EstimateStatus } from "@floorconnector/types";

import { upsertOrganizationCatalogItem } from "@/lib/catalogs/data";
import {
  EstimateVersionConflictError,
  createEstimate,
  deleteEstimateAttachmentFiles,
  quickCreateEstimateFromContext,
  syncEstimateAttachments,
  updateEstimate,
  updateEstimateStatus,
  uploadEstimateAttachmentFiles
} from "./data";
import {
  estimateInputSchema,
  estimateQuickCreateInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
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
  const lineItemRowKeys = getFieldValues(formData, "lineItemRowKey");
  const lineItemCatalogItemIds = getFieldValues(formData, "lineItemCatalogItemId");
  const lineItemSourceTypes = getFieldValues(formData, "lineItemSourceType");
  const lineItemSourceSystemIds = getFieldValues(formData, "lineItemSourceSystemId");
  const lineItemSourceComponentIds = getFieldValues(
    formData,
    "lineItemSourceComponentId"
  );
  const lineItemItemTypes = getFieldValues(formData, "lineItemItemType");
  const lineItemNames = getFieldValues(formData, "lineItemName");
  const lineItemDescriptions = getFieldValues(formData, "lineItemDescription");
  const lineItemQuantities = getFieldValues(formData, "lineItemQuantity");
  const lineItemUnits = getFieldValues(formData, "lineItemUnit");
  const lineItemUnitPrices = getFieldValues(formData, "lineItemUnitPrice");
  const lineItemBaseUnitCosts = getFieldValues(formData, "lineItemBaseUnitCost");
  const lineItemBaseUnitPrices = getFieldValues(formData, "lineItemBaseUnitPrice");
  const lineItemMarkupPercents = getFieldValues(formData, "lineItemMarkupPercent");
  const lineItemHiddenMarkupPercents = getFieldValues(
    formData,
    "lineItemHiddenMarkupPercent"
  );
  const lineItemUnitPricesBeforeHiddenMarkup = getFieldValues(
    formData,
    "lineItemUnitPriceBeforeHiddenMarkup"
  );
  const lineItemVisibleMarkupAmounts = getFieldValues(
    formData,
    "lineItemVisibleMarkupAmount"
  );
  const lineItemHiddenMarkupAmounts = getFieldValues(
    formData,
    "lineItemHiddenMarkupAmount"
  );
  const lineItemTaxCodes = getFieldValues(formData, "lineItemTaxCode");
  const lineItemAssignedToValues = getFieldValues(formData, "lineItemAssignedTo");
  const lineItemGroupNames = getFieldValues(formData, "lineItemGroupName");
  const itemGroupIds = getFieldValues(formData, "itemGroupId");
  const itemGroupLabels = getFieldValues(formData, "itemGroupLabel");
  const scopeItemIds = getFieldValues(formData, "scopeItemId");
  const scopeItemTexts = getFieldValues(formData, "scopeItemText");
  const scopeItemInclusionFlags = getFieldValues(formData, "scopeItemIncludeInOutput");

  const lineItems = lineItemNames
    .map((name, index) => ({
      rowKey: lineItemRowKeys[index] ?? `row-${index + 1}`,
      catalogItemId: lineItemCatalogItemIds[index] ?? "",
      sourceType:
        lineItemSourceTypes[index] === "catalog_item" ||
        lineItemSourceTypes[index] === "system_component"
          ? lineItemSourceTypes[index]
          : "catalog_item",
      sourceSystemId: lineItemSourceSystemIds[index] ?? "",
      sourceComponentId: lineItemSourceComponentIds[index] ?? "",
      itemType: lineItemItemTypes[index] ?? "service",
      name,
      description: lineItemDescriptions[index] ?? "",
      quantity: lineItemQuantities[index] ?? "",
      unit: lineItemUnits[index] ?? "",
      unitPrice: lineItemUnitPrices[index] ?? "",
      baseUnitCost: lineItemBaseUnitCosts[index] ?? "0.00",
      baseUnitPrice: lineItemBaseUnitPrices[index] ?? "",
      markupPercent: lineItemMarkupPercents[index] ?? "0",
      hiddenMarkupPercent: lineItemHiddenMarkupPercents[index] ?? "0",
      unitPriceBeforeHiddenMarkup:
        lineItemUnitPricesBeforeHiddenMarkup[index] ?? lineItemUnitPrices[index] ?? "",
      visibleMarkupAmount: lineItemVisibleMarkupAmounts[index] ?? "0.00",
      hiddenMarkupAmount: lineItemHiddenMarkupAmounts[index] ?? "0.00",
      taxCode: lineItemTaxCodes[index] === "non-taxable" ? "non-taxable" : "taxable",
      assignedTo: lineItemAssignedToValues[index] ?? "",
      groupName: lineItemGroupNames[index] ?? ""
    }))
    .filter((lineItem) => lineItem.name.trim().length > 0);

  const itemGroups = itemGroupIds
    .map((id, index) => ({
      id,
      label: itemGroupLabels[index] ?? "",
      sortOrder: index
    }))
    .filter((group) => group.id.trim().length > 0 && group.label.trim().length > 0);

  const scopeItems = scopeItemTexts
    .map((text, index) => ({
      id: scopeItemIds[index] ?? `scope-${index + 1}`,
      text,
      includeInOutput: scopeItemInclusionFlags[index] !== "false",
      sortOrder: index
    }))
    .filter((item) => item.text.trim().length > 0);

  return estimateInputSchema.safeParse({
    opportunityId: getFieldValue(formData, "opportunityId"),
    projectId: getFieldValue(formData, "projectId"),
    title: getFieldValue(formData, "title"),
    status: getFieldValue(formData, "status"),
    estimateDate: getFieldValue(formData, "estimateDate"),
    expirationDate: getFieldValue(formData, "expirationDate"),
    projectType: getFieldValue(formData, "projectType"),
    sector: getFieldValue(formData, "sector"),
    discountAmount: getFieldValue(formData, "discountAmount"),
    lineItems,
    notes: getFieldValue(formData, "notes"),
    content: {
      termsHtml: getFieldValue(formData, "termsHtml"),
      inclusionsHtml: getFieldValue(formData, "inclusionsHtml"),
      exclusionsHtml: getFieldValue(formData, "exclusionsHtml"),
      notesHtml: getFieldValue(formData, "notesHtml"),
      scopeSummaryHtml: getFieldValue(formData, "scopeSummaryHtml"),
      scopeItems,
      itemGroups,
      itemRows: []
    }
  });
}

function parseEstimateQuickCreateInput(formData: FormData) {
  return estimateQuickCreateInputSchema.safeParse({
    creationMode: getFieldValue(formData, "creationMode"),
    opportunityId: getFieldValue(formData, "opportunityId"),
    customerId: getFieldValue(formData, "customerId"),
    projectId: getFieldValue(formData, "projectId"),
    title: getFieldValue(formData, "title")
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

const quickEstimateCatalogItemInputSchema = z.object({
  name: z.string().trim().min(1, "Item name is required.").max(120),
  itemType: z.enum(
    ["material", "labor", "service", "equipment", "subcontractor", "other"] as const
  ),
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  defaultUnitCost: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : "0"))
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Cost must be zero or greater."
    })
    .transform((value) => Number(value).toFixed(2)),
  defaultUnitPrice: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .refine((value) => value == null || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
      message: "Price must be zero or greater."
    })
    .transform((value) => (value == null ? null : Number(value).toFixed(2))),
  taxable: z.boolean()
});

export type EstimateAutosaveResult =
  | { ok: true; estimateId: string; updatedAt: string; referenceNumber: string }
  | { ok: false; type: "validation"; message: string }
  | { ok: false; type: "conflict"; message: string }
  | { ok: false; type: "error"; message: string };

export async function autosaveEstimateAction(
  formData: FormData
): Promise<EstimateAutosaveResult> {
  const estimateId = getFieldValue(formData, "estimateId");
  const expectedUpdatedAt = getFieldValue(formData, "expectedUpdatedAt");
  const result = parseEstimateInput(formData);
  const retainedAttachmentIds = getFieldValues(formData, "retainedAttachmentId");
  const uploadFiles = formData
    .getAll("newAttachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!estimateId) {
    return { ok: false, type: "error", message: "Estimate id is required for autosave." };
  }

  if (!result.success) {
    return {
      ok: false,
      type: "validation",
      message: result.error.issues[0]?.message ?? "Unable to autosave estimate."
    };
  }

  let estimate;
  let removedStoragePaths: string[] = [];

  try {
    estimate = await updateEstimate(estimateId, result.data, {
      expectedUpdatedAt: expectedUpdatedAt || null
    });
    const uploadedAttachments = await uploadEstimateAttachmentFiles({
      estimateId,
      files: uploadFiles
    });
    const removedAttachments = await syncEstimateAttachments({
      estimateId,
      retainedAttachmentIds,
      newAttachments: uploadedAttachments
    });
    removedStoragePaths = removedAttachments.map((attachment) => attachment.storagePath);
  } catch (error) {
    if (error instanceof EstimateVersionConflictError) {
      return { ok: false, type: "conflict", message: error.message };
    }

    return {
      ok: false,
      type: "error",
      message: error instanceof Error ? error.message : "Unable to autosave estimate."
    };
  }

  try {
    await deleteEstimateAttachmentFiles(removedStoragePaths);
  } catch {
    // Metadata is already authoritative; storage cleanup is best-effort.
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);
  revalidatePath(`/projects/${estimate.projectId}`);

  return {
    ok: true,
    estimateId: estimate.id,
    updatedAt: estimate.updatedAt,
    referenceNumber: estimate.referenceNumber
  };
}

export async function updateEstimateStatusAutosaveAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const currentStatus = getFieldValue(formData, "currentStatus");
  const nextStatus = getFieldValue(formData, "nextStatus");
  const expectedUpdatedAt = getFieldValue(formData, "expectedUpdatedAt");

  if (!estimateId) {
    return { ok: false, type: "error", message: "Estimate id is required for status updates." } as const;
  }

  if (
    !["draft", "sent", "approved", "rejected"].includes(currentStatus) ||
    !["draft", "sent", "approved", "rejected"].includes(nextStatus)
  ) {
    return { ok: false, type: "error", message: "Invalid estimate status transition." } as const;
  }

  if (
    !canTransitionEstimateStatus(
      currentStatus as EstimateStatus,
      nextStatus as EstimateStatus
    )
  ) {
    return {
      ok: false,
      type: "error",
      message: `Estimate cannot move from ${currentStatus} to ${nextStatus}.`
    } as const;
  }

  try {
    const estimate = await updateEstimateStatus(estimateId, nextStatus as EstimateStatus, {
      expectedUpdatedAt: expectedUpdatedAt || null
    });

    revalidatePath("/estimates");
    revalidatePath(`/estimates/${estimate.id}`);
    revalidatePath(`/estimates/${estimate.id}/edit`);
    revalidatePath(`/projects/${estimate.projectId}`);

    return {
      ok: true,
      estimateId: estimate.id,
      updatedAt: estimate.updatedAt,
      referenceNumber: estimate.referenceNumber,
      status: estimate.status
    } as const;
  } catch (error) {
    if (error instanceof EstimateVersionConflictError) {
      return { ok: false, type: "conflict", message: error.message } as const;
    }

    return {
      ok: false,
      type: "error",
      message: error instanceof Error ? error.message : "Unable to update estimate status."
    } as const;
  }
}

export async function quickCreateEstimateCatalogItemAction(
  formData: FormData
): Promise<
  | { ok: true; item: CatalogItem }
  | { ok: false; message: string }
> {
  const result = quickEstimateCatalogItemInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    itemType: getFieldValue(formData, "itemType"),
    unit: getFieldValue(formData, "unit"),
    defaultUnitCost: getFieldValue(formData, "defaultUnitCost"),
    defaultUnitPrice: getFieldValue(formData, "defaultUnitPrice"),
    taxable: getCheckboxValue(formData, "taxable")
  });

  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message ?? "Unable to create inventory item."
    };
  }

  try {
    const item = await upsertOrganizationCatalogItem({
      itemType: result.data.itemType,
      name: result.data.name,
      description: null,
      internalNotes: null,
      unit: result.data.unit,
      defaultUnitCost: result.data.defaultUnitCost,
      defaultUnitPrice: result.data.defaultUnitPrice,
      markupPercent: "0.00",
      hiddenMarkupPercent: "0.00",
      taxable: result.data.taxable,
      vendorId: null,
      category: null,
      sku: null,
      photoStoragePath: null,
      status: "active",
      isDefault: false
    });

    revalidatePath("/settings/catalogs");
    revalidatePath("/materials");

    return { ok: true, item };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to create inventory item."
    };
  }
}

export async function quickCreateEstimateAction(formData: FormData) {
  const creationMode = getFieldValue(formData, "creationMode");
  const opportunityId = getFieldValue(formData, "opportunityId");
  const customerId = getFieldValue(formData, "customerId");
  const projectId = getFieldValue(formData, "projectId");
  const result = parseEstimateQuickCreateInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/estimates", {
        compose: "1",
        creationMode,
        opportunityId,
        customerId,
        projectId,
        error:
          result.error.issues[0]?.message ?? "Unable to create estimate."
      })
    );
  }

  let estimate;

  try {
    estimate = await quickCreateEstimateFromContext(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/estimates", {
        compose: "1",
        creationMode,
        opportunityId,
        customerId,
        projectId,
        error:
          error instanceof Error ? error.message : "Unable to create estimate."
      })
    );
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);

  redirect(
    buildRedirect(`/estimates/${estimate.id}/edit`, {
      message: `${estimate.referenceNumber} was created. Finish the full scope in this workspace.`
    })
  );
}

export async function updateEstimateAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = parseEstimateInput(formData);
  const retainedAttachmentIds = getFieldValues(formData, "retainedAttachmentId");
  const uploadFiles = formData
    .getAll("newAttachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

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
  let removedStoragePaths: string[] = [];

  try {
    estimate = await updateEstimate(estimateId, result.data);
    const uploadedAttachments = await uploadEstimateAttachmentFiles({
      estimateId,
      files: uploadFiles
    });
    const removedAttachments = await syncEstimateAttachments({
      estimateId,
      retainedAttachmentIds,
      newAttachments: uploadedAttachments
    });
    removedStoragePaths = removedAttachments.map((attachment) => attachment.storagePath);
  } catch (error) {
    redirect(
      buildRedirect(`/estimates/${estimateId}/edit`, {
        error:
          error instanceof Error ? error.message : "Unable to update estimate."
      })
    );
  }

  try {
    await deleteEstimateAttachmentFiles(removedStoragePaths);
  } catch {
    // Metadata is already authoritative; storage cleanup is best-effort.
  }

  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);

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
