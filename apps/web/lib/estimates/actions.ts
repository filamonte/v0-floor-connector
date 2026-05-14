"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canTransitionEstimateStatus } from "@floorconnector/domain";
import type { CatalogItem, EstimateLineItem, EstimateStatus } from "@floorconnector/types";

import { listCatalogItems, upsertOrganizationCatalogItem } from "@/lib/catalogs/data";
import {
  buildExpandedSystemPreview,
  type ExpandedSystemPreview
} from "@/lib/catalogs/system-expansion";
import {
  addEstimatePortalComment,
  approveEstimateFromPortal,
  EstimateVersionConflictError,
  createEstimate,
  deleteEstimateAttachmentFiles,
  importEstimateLineItemsFromEstimate,
  importEstimateReusableContentFromEstimate,
  insertCatalogItemToEstimate,
  insertSystemToEstimate,
  quickCreateEstimateFromContext,
  rejectEstimateFromPortal,
  rebuildApprovedEstimateCommercialSnapshot,
  sendEstimateToCustomer,
  syncEstimateAttachments,
  updateCatalogItemFromEstimateLine,
  updateEstimate,
  updateEstimateStatus,
  uploadEstimateAttachmentFiles
} from "./data";
import type { EstimateApprovalOrchestrationState } from "./approval-orchestration";
import { resolveEstimateApprovalOrchestration } from "./approval-orchestration";
import {
  estimateCatalogInsertInputSchema,
  estimateInputSchema,
  estimateLineItemImportInputSchema,
  estimateReusableContentImportInputSchema,
  estimatePortalCommentInputSchema,
  estimatePortalDecisionInputSchema,
  estimateQuickCreateInputSchema,
  estimateSendToCustomerInputSchema,
  estimateSystemInsertInputSchema
} from "./schemas";
import {
  buildManualEstimateApprovalEvidence,
  manualEstimateApprovalEvidenceSchema
} from "./manual-approval";
import { createCustomer } from "@/lib/customers/data";
import { customerInputSchema } from "@/lib/customers/schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { assertActiveOrganizationCanPerformProductionAction } from "@/lib/organizations/activation-guard";
import { recordWorkflowErrorForCurrentUser } from "@/lib/workflow-errors/data";

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

const forbiddenEstimatePricingFields = [
  "lineItemItemType",
  "lineItemName",
  "lineItemDescription",
  "lineItemUnit",
  "lineItemBaseUnitCost",
  "lineItemBaseUnitPrice",
  "lineItemMarkupPercent",
  "lineItemHiddenMarkupPercent",
  "lineItemUnitPriceBeforeHiddenMarkup",
  "lineItemVisibleMarkupAmount",
  "lineItemHiddenMarkupAmount",
  "lineItemCostCode",
  "lineItemTaxCode"
] as const;

function hasForbiddenEstimatePricingFields(formData: FormData) {
  return forbiddenEstimatePricingFields.some((key) => formData.has(key));
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

function toUuidOrNull(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function parseEstimateInput(formData: FormData) {
  if (hasForbiddenEstimatePricingFields(formData)) {
    return {
      success: false as const,
      error: {
        issues: [
          {
            message:
              "Estimate pricing must be derived on the server. Client pricing fields are not accepted."
          }
        ]
      }
    };
  }

  const lineItemRowKeys = getFieldValues(formData, "lineItemRowKey");
  const lineItemCatalogItemIds = getFieldValues(formData, "lineItemCatalogItemId");
  const lineItemSourceTypes = getFieldValues(formData, "lineItemSourceType");
  const lineItemSourceSystemIds = getFieldValues(formData, "lineItemSourceSystemId");
  const lineItemSourceComponentIds = getFieldValues(
    formData,
    "lineItemSourceComponentId"
  );
  const lineItemQuantities = getFieldValues(formData, "lineItemQuantity");
  const lineItemUnitPriceOverrides = getFieldValues(formData, "lineItemUnitPriceOverride");
  const lineItemTaxableOverrides = getFieldValues(formData, "lineItemTaxableOverride");
  const lineItemAssignedToValues = getFieldValues(formData, "lineItemAssignedTo");
  const lineItemGroupNames = getFieldValues(formData, "lineItemGroupName");
  const itemGroupIds = getFieldValues(formData, "itemGroupId");
  const itemGroupLabels = getFieldValues(formData, "itemGroupLabel");
  const scopeItemIds = getFieldValues(formData, "scopeItemId");
  const scopeItemTexts = getFieldValues(formData, "scopeItemText");
  const scopeItemInclusionFlags = getFieldValues(formData, "scopeItemIncludeInOutput");

  const lineItems = lineItemRowKeys
    .map((rowKey, index) => ({
      rowKey: lineItemRowKeys[index] ?? `row-${index + 1}`,
      catalogItemId: lineItemCatalogItemIds[index] ?? "",
      sourceType:
        lineItemSourceTypes[index] === "catalog_item" ||
        lineItemSourceTypes[index] === "system_component"
          ? lineItemSourceTypes[index]
          : "catalog_item",
      sourceSystemId: lineItemSourceSystemIds[index] ?? "",
      sourceComponentId: lineItemSourceComponentIds[index] ?? "",
      quantity: lineItemQuantities[index] ?? "",
      unitPriceOverride: lineItemUnitPriceOverrides[index] ?? null,
      taxableOverride:
        lineItemTaxableOverrides[index] === "true"
          ? true
          : lineItemTaxableOverrides[index] === "false"
            ? false
            : undefined,
      assignedTo: lineItemAssignedToValues[index] ?? "",
      groupName: lineItemGroupNames[index] ?? ""
    }))
    .filter((lineItem) => lineItem.rowKey.trim().length > 0);

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
    projectName: getFieldValue(formData, "projectName"),
    title: getFieldValue(formData, "title")
  });
}

const estimateInlineCustomerQuickCreateInputSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required.").max(80),
    lastName: z.string().trim().min(1, "Last name is required.").max(80),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    phone: z.string().trim().min(1, "Phone is required.").max(40),
    companyName: z
      .string()
      .trim()
      .max(120, "Company name must be 120 characters or fewer.")
      .transform((value) => (value.length > 0 ? value : null)),
    retainagePercentageDefault: customerInputSchema.shape.retainagePercentageDefault
  })
  .transform((value) => ({
    ...value,
    name: [value.firstName, value.lastName].join(" ")
  }));

function parseEstimateInlineCustomerQuickCreateInput(formData: FormData) {
  return estimateInlineCustomerQuickCreateInputSchema.safeParse({
    firstName: getFieldValue(formData, "inlineCustomerFirstName"),
    lastName: getFieldValue(formData, "inlineCustomerLastName"),
    email: getFieldValue(formData, "inlineCustomerEmail"),
    phone: getFieldValue(formData, "inlineCustomerPhone"),
    companyName: getFieldValue(formData, "inlineCustomerCompanyName"),
    retainagePercentageDefault:
      getFieldValue(formData, "inlineCustomerRetainagePercentageDefault") || "0.00"
  });
}

function getQuickCreateEstimateFailureMessage(message: string) {
  if (/duplicate key|violates|foreign key|null value|invalid input/i.test(message)) {
    return "Estimate could not be created from that selection. Choose a customer, then select one of that customer's projects or enter a new project name before trying again.";
  }

  return message;
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
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null)),
  itemType: z.enum(
    ["material", "labor", "service", "equipment", "subcontractor", "other"] as const
  ),
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  category: z
    .string()
    .trim()
    .max(120, "Category must be 120 characters or fewer.")
    .transform((value) => (value.length > 0 ? value : null)),
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

const estimateCatalogItemEditInputSchema = z.object({
  estimateId: z.string().uuid("Estimate id is required."),
  estimateLineItemId: z.string().uuid("Estimate line item id is required."),
  catalogItemId: z.string().uuid("Catalog item id is required."),
  name: z.string().trim().min(1, "Item name is required.").max(120),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .nullable()
    .transform((value) => {
      const normalized = value?.trim() ?? "";
      return normalized.length > 0 ? normalized : null;
    }),
  unit: z.string().trim().min(1, "Unit is required.").max(40),
  defaultUnitPrice: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .transform((value) => value.replace(/[$,\s]/g, ""))
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Price must be zero or greater."
    })
    .transform((value) => Number(value).toFixed(2)),
  taxable: z.boolean()
});

const expandedSystemPreviewInputSchema = z.object({
  systemCatalogItemId: z.string().uuid("Select a valid system."),
  inputMode: z.enum(["dimensions", "direct"] as const),
  length: z
    .string()
    .trim()
    .optional(),
  width: z
    .string()
    .trim()
    .optional(),
  squareFootage: z
    .string()
    .trim()
    .min(1, "Area is required.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: "Area must be greater than zero."
    }),
  linearFootage: z
    .string()
    .trim()
    .min(1, "Linear footage is required.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Linear footage cannot be negative."
    }),
  count: z
    .string()
    .trim()
    .min(1, "Count is required.")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: "Count must be greater than zero."
    })
});

export type EstimateSaveResult =
  | { ok: true; estimateId: string; updatedAt: string; referenceNumber: string }
  | { ok: false; type: "validation"; message: string }
  | { ok: false; type: "conflict"; message: string }
  | { ok: false; type: "error"; message: string };

export type ExpandedSystemPreviewResult =
  | {
      ok: true;
      preview: ExpandedSystemPreview;
      systemCatalogItemId: string;
      squareFootage: string;
      linearFootage: string;
      count: string;
      systemName: string;
    }
  | { ok: false; message: string };

export type EstimateInsertResult =
  | {
      ok: true;
      estimateId: string;
      updatedAt: string;
      lineItems: EstimateLineItem[];
    }
  | { ok: false; message: string };

export type EstimateLineItemImportResult =
  | {
      ok: true;
      estimateId: string;
      updatedAt: string;
      lineItems: EstimateLineItem[];
      importedCount: number;
      sourceEstimateReferenceNumber: string;
    }
  | { ok: false; message: string };

export type EstimateReusableContentImportResult =
  | {
      ok: true;
      sourceEstimateReferenceNumber: string;
      section: "scope" | "terms" | "inclusions" | "exclusions";
      content: {
        scopeSummaryHtml: string | null;
        scopeItems: Array<{
          id: string;
          text: string;
          includeInOutput: boolean;
          sortOrder: number;
        }>;
        termsHtml: string | null;
        inclusionsHtml: string | null;
        exclusionsHtml: string | null;
      };
    }
  | { ok: false; message: string };

export async function saveEstimateAction(
  formData: FormData
): Promise<EstimateSaveResult> {
  const estimateId = getFieldValue(formData, "estimateId");
  const expectedUpdatedAt = getFieldValue(formData, "expectedUpdatedAt");
  const result = parseEstimateInput(formData);
  const retainedAttachmentIds = getFieldValues(formData, "retainedAttachmentId");
  const uploadFiles = formData
    .getAll("newAttachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (!estimateId) {
    return { ok: false, type: "error", message: "Estimate id is required to save." };
  }

  if (!result.success) {
    return {
      ok: false,
      type: "validation",
      message: result.error.issues[0]?.message ?? "Unable to save estimate."
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
      message: error instanceof Error ? error.message : "Unable to save estimate."
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

export async function updateEstimateStatusSaveAction(formData: FormData) {
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

  if (nextStatus === "approved") {
    return {
      ok: false,
      type: "error",
      message:
        "Record manual approval from Estimate Review so approver, method, date/time, and evidence are captured."
    } as const;
  }

  try {
    const estimate = await updateEstimateStatus(estimateId, nextStatus as EstimateStatus, {
      expectedUpdatedAt: expectedUpdatedAt || null
    });
    const orchestration =
      estimate.status === "approved"
        ? await resolveEstimateApprovalOrchestration(
            estimate.id,
            `/estimates/${estimate.id}/edit`
          )
        : null;

    revalidatePath("/estimates");
    revalidatePath(`/estimates/${estimate.id}`);
    revalidatePath(`/estimates/${estimate.id}/edit`);
    revalidatePath(`/projects/${estimate.projectId}`);

    return {
      ok: true,
      estimateId: estimate.id,
      updatedAt: estimate.updatedAt,
      referenceNumber: estimate.referenceNumber,
      status: estimate.status,
      orchestration
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

function revalidateEstimatePaths(estimate: {
  id: string;
  projectId: string;
}) {
  revalidatePath("/estimates");
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath(`/estimates/${estimate.id}/edit`);
  revalidatePath(`/projects/${estimate.projectId}`);
  revalidatePath(`/portal/projects/${estimate.projectId}`);
  revalidatePath(`/portal/estimates/${estimate.id}`);
}

export async function quickCreateEstimateCatalogItemAction(
  formData: FormData
): Promise<
  | { ok: true; item: CatalogItem }
  | { ok: false; message: string }
> {
  const result = quickEstimateCatalogItemInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    itemType: getFieldValue(formData, "itemType"),
    unit: getFieldValue(formData, "unit"),
    category: getFieldValue(formData, "category"),
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
      itemId: null,
      inventoryItemId: null,
      itemType: result.data.itemType,
      name: result.data.name,
      description: result.data.description,
      internalNotes: null,
      unit: result.data.unit,
      defaultUnitCost: result.data.defaultUnitCost,
      defaultUnitPrice: result.data.defaultUnitPrice,
      markupPercent: "0.00",
      hiddenMarkupPercent: "0.00",
      taxable: result.data.taxable,
      taxCodeId: null,
      vendorId: null,
      category: result.data.category,
      costCode: null,
      sku: null,
      photoStoragePath: null,
      status: "active",
      isDefault: false,
      trackInventory: false,
      inventoryLocation: "default",
      inventoryReorderPoint: "0",
      inventoryAdjustmentQuantity: null,
      inventoryAdjustmentNote: null,
      submitMode: "save"
    });

    revalidatePath("/settings/catalogs");
    revalidatePath("/cost-items-database");
    revalidatePath("/cost-items-database/items");
    revalidatePath("/materials");

    return { ok: true, item };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to create inventory item."
    };
  }
}

export async function updateCatalogItemFromEstimateAction(
  input: unknown
): Promise<EstimateInsertResult> {
  const result = estimateCatalogItemEditInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message ?? "Unable to update catalog item."
    };
  }

  try {
    const estimate = await updateCatalogItemFromEstimateLine(result.data);
    revalidateEstimatePaths(estimate);
    revalidatePath("/settings/catalogs");
    revalidatePath("/cost-items-database");
    revalidatePath("/cost-items-database/items");
    revalidatePath("/materials");

    return {
      ok: true,
      estimateId: estimate.id,
      updatedAt: estimate.updatedAt,
      lineItems: estimate.lineItems
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to update catalog item."
    };
  }
}

export async function previewExpandedSystemAction(input: {
  systemCatalogItemId: string;
  inputMode: "dimensions" | "direct";
  length: string;
  width: string;
  squareFootage: string;
  linearFootage: string;
  count: string;
}): Promise<ExpandedSystemPreviewResult> {
  const result = expandedSystemPreviewInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error.issues[0]?.message ?? "Unable to build the system preview."
    };
  }

  try {
    const catalogItems = await listCatalogItems();
    const systemCatalogItem = catalogItems.find(
      (item) =>
        item.id === result.data.systemCatalogItemId && item.itemType === "system"
    );

    if (!systemCatalogItem) {
      return {
        ok: false,
        message: "The selected system could not be found in active inventory."
      };
    }

    const preview = buildExpandedSystemPreview({
      systemCatalogItem,
      catalogItems,
      squareFootage: Number(result.data.squareFootage),
      perimeter: Number(result.data.linearFootage),
      count: Number(result.data.count)
    });

    if (preview.rows.length === 0) {
      return {
        ok: false,
        message: "This system has no active components available to preview."
      };
    }

    return {
      ok: true,
      preview,
      systemCatalogItemId: systemCatalogItem.id,
      squareFootage: Number(result.data.squareFootage).toFixed(2),
      linearFootage: Number(result.data.linearFootage).toFixed(2),
      count: Number(result.data.count).toFixed(2),
      systemName: systemCatalogItem.name
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to build the system preview."
    };
  }
}

export async function insertCatalogItemToEstimateAction(
  input: unknown
): Promise<EstimateInsertResult> {
  const result = estimateCatalogInsertInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error.issues[0]?.message ??
        "Unable to insert the catalog item into this estimate."
    };
  }

  try {
    const estimate = await insertCatalogItemToEstimate(result.data);
    revalidatePath("/estimates");
    revalidatePath(`/estimates/${estimate.id}`);
    revalidatePath(`/estimates/${estimate.id}/edit`);

    return {
      ok: true,
      estimateId: estimate.id,
      updatedAt: estimate.updatedAt,
      lineItems: estimate.lineItems
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to insert the catalog item into this estimate."
    };
  }
}

export async function insertSystemToEstimateAction(
  input: unknown
): Promise<EstimateInsertResult> {
  const result = estimateSystemInsertInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error.issues[0]?.message ??
        "Unable to insert the expanded system into this estimate."
    };
  }

  try {
    const estimate = await insertSystemToEstimate(result.data);
    revalidatePath("/estimates");
    revalidatePath(`/estimates/${estimate.id}`);
    revalidatePath(`/estimates/${estimate.id}/edit`);

    return {
      ok: true,
      estimateId: estimate.id,
      updatedAt: estimate.updatedAt,
      lineItems: estimate.lineItems
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to insert the expanded system into this estimate."
    };
  }
}

export async function importEstimateLineItemsAction(
  input: unknown
): Promise<EstimateLineItemImportResult> {
  const result = estimateLineItemImportInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error.issues[0]?.message ??
        "Unable to import line items from the selected estimate."
    };
  }

  try {
    const importResult = await importEstimateLineItemsFromEstimate(result.data);
    revalidatePath("/estimates");
    revalidatePath(`/estimates/${importResult.estimate.id}`);
    revalidatePath(`/estimates/${importResult.estimate.id}/edit`);

    return {
      ok: true,
      estimateId: importResult.estimate.id,
      updatedAt: importResult.estimate.updatedAt,
      lineItems: importResult.estimate.lineItems,
      importedCount: importResult.importedCount,
      sourceEstimateReferenceNumber: importResult.sourceEstimateReferenceNumber
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to import line items from the selected estimate."
    };
  }
}

export async function importEstimateReusableContentAction(
  input: unknown
): Promise<EstimateReusableContentImportResult> {
  const result = estimateReusableContentImportInputSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      message:
        result.error.issues[0]?.message ??
        "Unable to import reusable content from the selected estimate."
    };
  }

  try {
    const importResult = await importEstimateReusableContentFromEstimate(result.data);

    return {
      ok: true,
      sourceEstimateReferenceNumber: importResult.sourceEstimateReferenceNumber,
      section: importResult.section,
      content: importResult.content
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to import reusable content from the selected estimate."
    };
  }
}

export async function quickCreateEstimateAction(formData: FormData) {
  const creationMode = getFieldValue(formData, "creationMode");
  const opportunityId = getFieldValue(formData, "opportunityId");
  const customerId = getFieldValue(formData, "customerId");
  const projectId = getFieldValue(formData, "projectId");
  const projectName = getFieldValue(formData, "projectName");
  const title = getFieldValue(formData, "title");
  const result = parseEstimateQuickCreateInput(formData);

  if (!result.success) {
    const issue = result.error.issues[0];

    redirect(
      buildRedirect("/estimates", {
        compose: "1",
        creationMode,
        opportunityId,
        customerId,
        projectId,
        projectName,
        title,
        errorField: issue?.path[0]?.toString(),
        error: issue?.message ?? "Unable to create estimate."
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
        projectName,
        title,
        error:
          error instanceof Error
            ? getQuickCreateEstimateFailureMessage(error.message)
            : "Unable to create estimate."
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

export async function quickCreateEstimateCustomerAction(formData: FormData) {
  const creationMode = getFieldValue(formData, "creationMode");
  const opportunityId = getFieldValue(formData, "opportunityId");
  const currentCustomerId = getFieldValue(formData, "customerId");
  const projectId = getFieldValue(formData, "projectId");
  const projectName = getFieldValue(formData, "projectName");
  const title = getFieldValue(formData, "title");
  const firstName = getFieldValue(formData, "inlineCustomerFirstName");
  const lastName = getFieldValue(formData, "inlineCustomerLastName");
  const email = getFieldValue(formData, "inlineCustomerEmail");
  const phone = getFieldValue(formData, "inlineCustomerPhone");
  const companyName = getFieldValue(formData, "inlineCustomerCompanyName");
  const result = parseEstimateInlineCustomerQuickCreateInput(formData);

  const baseParams = {
    compose: "1",
    creationMode,
    opportunityId,
    customerId: currentCustomerId,
    projectId,
    projectName,
    title,
    inlineCustomerFirstName: firstName,
    inlineCustomerLastName: lastName,
    inlineCustomerEmail: email,
    inlineCustomerPhone: phone,
    inlineCustomerCompanyName: companyName
  };

  if (!result.success) {
    const issue = result.error.issues[0];

    redirect(
      buildRedirect("/estimates", {
        ...baseParams,
        errorScope: "inlineCustomer",
        errorField: issue?.path[0]
          ? `inlineCustomer${String(issue.path[0]).slice(0, 1).toUpperCase()}${String(issue.path[0]).slice(1)}`
          : "inlineCustomer",
        error: issue?.message ?? "Unable to create customer."
      })
    );
  }

  let customer;

  try {
    customer = await createCustomer({
      name: result.data.name,
      companyName: result.data.companyName,
      phone: result.data.phone,
      email: result.data.email,
      addressLine1: null,
      addressLine2: null,
      city: null,
      stateRegion: null,
      postalCode: null,
      countryCode: null,
      isTaxExempt: false,
      taxExemptionReason: null,
      taxExemptionReference: null,
      taxExemptionExpiresOn: null,
      retainagePercentageDefault: result.data.retainagePercentageDefault,
      notes: null
    });
  } catch (error) {
    redirect(
      buildRedirect("/estimates", {
        ...baseParams,
        errorScope: "inlineCustomer",
        error:
          error instanceof Error ? error.message : "Unable to create customer."
      })
    );
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customer.id}`);
  revalidatePath("/estimates");

  redirect(
    buildRedirect("/estimates", {
      compose: "1",
      creationMode,
      opportunityId,
      customerId: customer.id,
      projectName,
      title,
      message: `${customer.name} was created and selected for this estimate.`
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
  let manualDecisionEventNote: string | null = null;

  if (nextStatus === "approved") {
    const approvalEvidence = manualEstimateApprovalEvidenceSchema.safeParse({
      approvedByName: getFieldValue(formData, "approvedByName"),
      approvalMethod: getFieldValue(formData, "approvalMethod"),
      approvalDate: getFieldValue(formData, "approvalDate"),
      approvalTime: getFieldValue(formData, "approvalTime"),
      approvalNotes: getFieldValue(formData, "approvalNotes"),
      approvalEvidence: getFieldValue(formData, "approvalEvidence")
    });

    if (!approvalEvidence.success) {
      redirect(
        buildRedirect(`/estimates/${estimateId}`, {
          error:
            approvalEvidence.error.issues[0]?.message ??
            "Manual approval evidence is required."
        })
      );
    }

    manualDecisionEventNote = buildManualEstimateApprovalEvidence(approvalEvidence.data);
  }

  try {
    estimate = await updateEstimateStatus(estimateId, nextStatus as EstimateStatus, {
      manualDecisionEventNote
    });
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

  revalidateEstimatePaths(estimate);

  redirect(
    buildRedirect(`/estimates/${estimate.id}`, {
      showNextSteps: estimate.status === "approved" ? "1" : undefined,
      message: `${estimate.referenceNumber} was ${getStatusActionLabel(
        estimate.status
      )}.`
    })
  );
}

export async function rebuildApprovedEstimateSnapshotAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");

  if (!estimateId) {
    redirect(
      buildRedirect("/estimates", {
        error: "Estimate id is required to rebuild the approval snapshot."
      })
    );
  }

  let result;

  try {
    result = await rebuildApprovedEstimateCommercialSnapshot(estimateId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to rebuild the approved estimate snapshot.";

    await recordWorkflowErrorForCurrentUser({
      action: "estimate.rebuild_approval_snapshot",
      subjectType: "estimate",
      subjectId: toUuidOrNull(estimateId),
      message,
      metadata: {
        source: "estimate_detail",
        estimateId
      }
    });

    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error: message
      })
    );
  }

  revalidateEstimatePaths(result.estimate);
  revalidatePath("/contracts");

  redirect(
    buildRedirect(`/estimates/${result.estimate.id}`, {
      showNextSteps: "1",
      message: result.created
        ? `Approval snapshot v${result.snapshotVersion} was rebuilt. You can generate the contract again.`
        : `Approval snapshot v${result.snapshotVersion} already exists. You can generate the contract again.`
    })
  );
}

export async function sendEstimateToCustomerAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = estimateSendToCustomerInputSchema.safeParse({
    estimateId,
    portalUserId: getFieldValue(formData, "portalUserId")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/estimates", {
        error: result.error.issues[0]?.message ?? "Unable to send the estimate."
      })
    );
  }

  const user = await requireAuthenticatedUser(`/estimates/${result.data.estimateId}`);
  let estimate;

  try {
    await assertActiveOrganizationCanPerformProductionAction(user.id);
    estimate = await sendEstimateToCustomer(result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/estimates/${result.data.estimateId}`, {
        error: error instanceof Error ? error.message : "Unable to send the estimate."
      })
    );
  }

  revalidateEstimatePaths(estimate);

  redirect(
    buildRedirect(`/estimates/${estimate.id}`, {
      message: "Estimate sent for customer portal review."
    })
  );
}

export async function customerApproveEstimateAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = estimatePortalDecisionInputSchema.safeParse({
    estimateId,
    decisionNote: getFieldValue(formData, "decisionNote")
  });

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/estimates/${estimateId}`, {
        error: result.error.issues[0]?.message ?? "Unable to approve the estimate."
      })
    );
  }

  let estimate;

  try {
    estimate = await approveEstimateFromPortal(
      result.data,
      `/portal/estimates/${result.data.estimateId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/estimates/${result.data.estimateId}`, {
        error: error instanceof Error ? error.message : "Unable to approve the estimate."
      })
    );
  }

  revalidateEstimatePaths(estimate);

  redirect(
    buildRedirect(`/portal/estimates/${estimate.id}`, {
      message: "Estimate approved. Your contractor has been notified."
    })
  );
}

export async function customerRejectEstimateAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = estimatePortalDecisionInputSchema.safeParse({
    estimateId,
    decisionNote: getFieldValue(formData, "decisionNote")
  });

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/estimates/${estimateId}`, {
        error: result.error.issues[0]?.message ?? "Unable to reject the estimate."
      })
    );
  }

  let estimate;

  try {
    estimate = await rejectEstimateFromPortal(
      result.data,
      `/portal/estimates/${result.data.estimateId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/estimates/${result.data.estimateId}`, {
        error: error instanceof Error ? error.message : "Unable to reject the estimate."
      })
    );
  }

  revalidateEstimatePaths(estimate);

  redirect(
    buildRedirect(`/portal/estimates/${estimate.id}`, {
      message: "Estimate feedback sent to your contractor."
    })
  );
}

export async function customerAddEstimateCommentAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");
  const result = estimatePortalCommentInputSchema.safeParse({
    estimateId,
    comment: getFieldValue(formData, "comment")
  });

  if (!result.success) {
    redirect(
      buildRedirect(`/portal/estimates/${estimateId}`, {
        error: result.error.issues[0]?.message ?? "Unable to save the estimate comment."
      })
    );
  }

  let estimate;

  try {
    estimate = await addEstimatePortalComment(
      result.data,
      `/portal/estimates/${result.data.estimateId}`
    );
  } catch (error) {
    redirect(
      buildRedirect(`/portal/estimates/${result.data.estimateId}`, {
        error:
          error instanceof Error ? error.message : "Unable to save the estimate comment."
      })
    );
  }

  revalidateEstimatePaths(estimate);

  redirect(
    buildRedirect(`/portal/estimates/${estimate.id}`, {
      message: "Comment saved for your contractor."
    })
  );
}

export async function openOrCreateScheduleOfValuesAction(formData: FormData) {
  const estimateId = getFieldValue(formData, "estimateId");

  if (!estimateId) {
    redirect(
      buildRedirect("/estimates", {
        error: "Estimate id is required to open the schedule of values."
      })
    );
  }

  let scheduleOfValuesId: string | null;

  try {
    const estimate = await resolveEstimateApprovalOrchestration(
      estimateId,
      `/estimates/${estimateId}`
    );

    if (!estimate) {
      throw new Error("Estimate not found for this organization.");
    }

    if (estimate.scheduleOfValues.exists && estimate.scheduleOfValues.scheduleOfValuesId) {
      scheduleOfValuesId = estimate.scheduleOfValues.scheduleOfValuesId;
    } else {
      const { ensureScheduleOfValuesForEstimate } = await import("@/lib/financial/sov");
      scheduleOfValuesId = await ensureScheduleOfValuesForEstimate(estimateId);
    }
  } catch (error) {
    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open the schedule of values."
      })
    );
  }

  if (!scheduleOfValuesId) {
    redirect(
      buildRedirect(`/estimates/${estimateId}`, {
        error: "Schedule of values could not be located for this approved estimate."
      })
    );
  }

  revalidatePath("/progress-billing");
  revalidatePath(`/progress-billing/${scheduleOfValuesId}`);
  redirect(`/progress-billing/${scheduleOfValuesId}`);
}

export type EstimateStatusTransitionResult =
  | {
      ok: true;
      estimateId: string;
      updatedAt: string;
      referenceNumber: string;
      status: EstimateStatus;
      orchestration: EstimateApprovalOrchestrationState | null;
    }
  | { ok: false; type: "conflict" | "error"; message: string };
