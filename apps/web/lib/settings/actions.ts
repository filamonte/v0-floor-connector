"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  adoptPlatformCatalogItemSeedForOrganization,
  recordCatalogItemInventoryAdjustment,
  syncCatalogItemInventoryTracking,
  deleteInventoryItem,
  deleteInventoryTransaction,
  deleteCatalogItemFile,
  upsertInventoryItem,
  upsertInventoryTransaction,
  upsertTaxCode,
  replaceCatalogItemFiles,
  replaceOrganizationCatalogSystemComponents,
  uploadCatalogItemFiles,
  upsertOrganizationCatalogItem
} from "@/lib/catalogs/data";
import { automationNotificationPreferenceCategories } from "@/lib/automation/preferences";
import { executeManualNotificationAutomation } from "@/lib/automation/execution";
import {
  upsertOrganizationFeatureOverride
} from "@/lib/organizations/module-settings";
import {
  listOrganizationMembers,
  requireOrganizationAdminScope,
  updateOrganizationMembershipRole,
  updateOrganizationProfile
} from "@/lib/organizations/admin";
import {
  upsertOrganizationFinancialSettings
} from "@/lib/organizations/financial-settings";
import {
  upsertOrganizationAutomationNotificationPreferences,
  upsertOrganizationWorkflowSettings
} from "@/lib/organizations/workflow-settings";
import {
  adoptPlatformTemplateSeedForOrganization,
  getDocumentTemplateById,
  updateDocumentTemplateForOrganization
} from "@/lib/templates/data";

import {
  catalogItemSettingsInputSchema,
  documentTemplateSettingsInputSchema,
  inventoryItemSettingsInputSchema,
  inventoryTransactionSettingsInputSchema,
  organizationFeatureOverrideInputSchema,
  organizationFinancialSettingsInputSchema,
  organizationMembershipRoleInputSchema,
  organizationProfileInputSchema,
  taxCodeSettingsInputSchema,
  automationNotificationPreferencesInputSchema,
  organizationWorkflowSettingsInputSchema
} from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getFieldValues(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => (typeof value === "string" ? value : ""));
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

async function requireSettingsScope() {
  return requireOrganizationAdminScope("/settings");
}

function revalidateSettingsSlice() {
  revalidatePath("/settings");
  revalidatePath("/settings/organization");
  revalidatePath("/settings/templates");
  revalidatePath("/settings/catalogs");
  revalidatePath("/cost-items-database");
  revalidatePath("/cost-items-database/items");
  revalidatePath("/cost-items-database/systems");
  revalidatePath("/cost-items-database/inventory");
  revalidatePath("/cost-items-database/settings");
  revalidatePath("/materials");
  revalidatePath("/settings/financial");
  revalidatePath("/settings/workflows");
  revalidatePath("/settings/automation");
  revalidatePath("/settings/admin");
  revalidatePath("/settings/modules");
  revalidatePath("/contracts");
  revalidatePath("/estimates");
  revalidatePath("/invoices");
  revalidatePath("/customers");
  revalidatePath("/leads");
}

export async function updateDocumentTemplateSettingsAction(formData: FormData) {
  const result = documentTemplateSettingsInputSchema.safeParse({
    templateId: getFieldValue(formData, "templateId"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    subjectTemplate: getFieldValue(formData, "subjectTemplate"),
    bodyTemplate: getFieldValue(formData, "bodyTemplate"),
    status: getFieldValue(formData, "status"),
    isDefault: getCheckboxValue(formData, "isDefault")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/templates", {
        error: result.error.issues[0]?.message ?? "Unable to update document template."
      })
    );
  }

  let template;

  try {
    template = await updateDocumentTemplateForOrganization({
      ...result.data,
      next: "/settings/templates"
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/templates", {
        error:
          error instanceof Error ? error.message : "Unable to update document template."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/templates", {
      message: `${template.name} was updated successfully.`
    })
  );
}

export async function adoptPlatformTemplateSeedAction(formData: FormData) {
  const seedId = getFieldValue(formData, "seedId");

  if (!seedId) {
    redirect(
      buildRedirect("/settings/templates", {
        error: "Platform template seed id is required."
      })
    );
  }

  let template;

  try {
    template = await adoptPlatformTemplateSeedForOrganization(
      seedId,
      "/settings/templates"
    );
  } catch (error) {
    redirect(
      buildRedirect("/settings/templates", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to adopt platform template seed."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/templates", {
      message: `${template.name} was adopted for this organization.`
    })
  );
}

export async function updateOrganizationProfileAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationProfileInputSchema.safeParse({
    legalName: getFieldValue(formData, "legalName"),
    displayName: getFieldValue(formData, "displayName"),
    logoUrl: getFieldValue(formData, "logoUrl"),
    slug: getFieldValue(formData, "slug")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/organization", {
        error:
          result.error.issues[0]?.message ?? "Unable to update organization profile."
      })
    );
  }

  try {
    await updateOrganizationProfile({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/organization", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization profile."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/organization", {
      message: "Organization profile was updated."
    })
  );
}

export async function updateOrganizationFinancialSettingsAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/settings/financial";
  const result = organizationFinancialSettingsInputSchema.safeParse({
    defaultTaxBehavior: getFieldValue(formData, "defaultTaxBehavior"),
    defaultTaxRate: getFieldValue(formData, "defaultTaxRate"),
    defaultRetainagePercentage: getFieldValue(formData, "defaultRetainagePercentage")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update organization financial settings."
      })
    );
  }

  try {
    await upsertOrganizationFinancialSettings({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization financial settings."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: `Financial defaults for this organization were updated.`
    })
  );
}

export async function updateOrganizationWorkflowSettingsAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationWorkflowSettingsInputSchema.safeParse({
    approvedEstimateContractTemplateId: getFieldValue(
      formData,
      "approvedEstimateContractTemplateId"
    ),
    requireContractInternalApproval: getCheckboxValue(
      formData,
      "requireContractInternalApproval"
    ),
    requireContractSignatureBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireContractSignatureBeforeJobScheduling"
    ),
    requireDepositBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireDepositBeforeJobScheduling"
    ),
    requireFinancingApprovalBeforeJobScheduling: getCheckboxValue(
      formData,
      "requireFinancingApprovalBeforeJobScheduling"
    ),
    defaultDepositPercentage: getFieldValue(formData, "defaultDepositPercentage"),
    defaultEstimateTermsHtml: getFieldValue(formData, "defaultEstimateTermsHtml"),
    defaultEstimateInclusionsHtml: getFieldValue(
      formData,
      "defaultEstimateInclusionsHtml"
    ),
    defaultEstimateExclusionsHtml: getFieldValue(
      formData,
      "defaultEstimateExclusionsHtml"
    ),
    defaultEstimateScopeSummaryHtml: getFieldValue(
      formData,
      "defaultEstimateScopeSummaryHtml"
    ),
    nextEstimateNumber: getFieldValue(formData, "nextEstimateNumber"),
    nextInvoiceNumber: getFieldValue(formData, "nextInvoiceNumber"),
    nextChangeOrderNumber: getFieldValue(formData, "nextChangeOrderNumber"),
    nextContractNumber: getFieldValue(formData, "nextContractNumber")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/workflows", {
        error:
          result.error.issues[0]?.message ??
          "Unable to update organization workflow settings."
      })
    );
  }

  if (result.data.approvedEstimateContractTemplateId) {
    const template = await getDocumentTemplateById(
      result.data.approvedEstimateContractTemplateId,
      "/settings/workflows"
    );

    if (!template || template.templateType !== "contract" || template.status !== "active") {
      redirect(
        buildRedirect("/settings/workflows", {
          error: "Approved-estimate contract workflow must use an active contract template."
        })
      );
    }
  }

  try {
    await upsertOrganizationWorkflowSettings({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/workflows", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organization workflow settings."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/workflows", {
      message: "Contract workflow defaults were updated."
    })
  );
}

export async function updateAutomationNotificationPreferencesAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/settings/automation";
  const result = automationNotificationPreferencesInputSchema.safeParse({
    preferences: automationNotificationPreferenceCategories.map((category) => ({
      category,
      enabledForFutureExecution: getCheckboxValue(
        formData,
        `automation.${category}.enabledForFutureExecution`
      ),
      notifyRoles: getFieldValues(formData, `automation.${category}.notifyRoles`)
    }))
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ??
          "Unable to update future automation notification preferences."
      })
    );
  }

  try {
    await upsertOrganizationAutomationNotificationPreferences({
      organizationId: scope.organizationId,
      userId: scope.userId,
      automationNotificationPreferences: result.data.preferences
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update future automation notification preferences."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message:
        "Future notification preferences were updated. Automation execution remains off."
    })
  );
}

export async function runManualAutomationNotificationsAction() {
  const scope = await requireOrganizationAdminScope("/settings/automation");

  let result;

  try {
    result = await executeManualNotificationAutomation({
      organizationId: scope.organizationId,
      userId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/automation", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run notification-only automation checks."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/automation", {
      message: `Automation check complete: ${result.executedCount} notification${
        result.executedCount === 1 ? "" : "s"
      } created, ${result.blockedCount} blocked, ${result.skippedCount} skipped, ${result.failedCount} failed.`
    })
  );
}

export async function updateOrganizationCatalogItemAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/settings/catalogs";
  const attachmentFiles = formData
    .getAll("catalogItemFiles")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const photoFile = formData.get("catalogItemPhoto");
  const uploadFiles = [
    ...(photoFile instanceof File && photoFile.size > 0 ? [photoFile] : []),
    ...attachmentFiles
  ];
  const result = catalogItemSettingsInputSchema.safeParse({
    itemId: getFieldValue(formData, "itemId"),
    inventoryItemId: getFieldValue(formData, "inventoryItemId"),
    itemType: getFieldValue(formData, "itemType"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    internalNotes: getFieldValue(formData, "internalNotes"),
    unit: getFieldValue(formData, "unit"),
    defaultUnitCost: getFieldValue(formData, "defaultUnitCost"),
    defaultUnitPrice: getFieldValue(formData, "defaultUnitPrice"),
    markupPercent: getFieldValue(formData, "markupPercent"),
    hiddenMarkupPercent: getFieldValue(formData, "hiddenMarkupPercent"),
    taxable: getCheckboxValue(formData, "taxable"),
    taxCodeId: getFieldValue(formData, "taxCodeId"),
    vendorId: getFieldValue(formData, "vendorId"),
    category: getFieldValue(formData, "category"),
    costCode: getFieldValue(formData, "costCode"),
    sku: getFieldValue(formData, "sku"),
    photoStoragePath: getFieldValue(formData, "photoStoragePath"),
    status: getFieldValue(formData, "status"),
    isDefault: getCheckboxValue(formData, "isDefault"),
    trackInventory: getCheckboxValue(formData, "trackInventory"),
    inventoryLocation: getFieldValue(formData, "inventoryLocation"),
    inventoryReorderPoint: getFieldValue(formData, "inventoryReorderPoint"),
    inventoryAdjustmentQuantity: getFieldValue(formData, "inventoryAdjustmentQuantity"),
    inventoryAdjustmentNote: getFieldValue(formData, "inventoryAdjustmentNote"),
    submitMode: getFieldValue(formData, "submitMode") || "save"
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to update reusable catalog item."
      })
    );
  }

  let item;
  let linkedInventoryItem = null;

  try {
    item = await upsertOrganizationCatalogItem(result.data);

    if (uploadFiles.length > 0) {
      const uploaded =
        photoFile instanceof File && photoFile.size > 0
          ? await replaceCatalogItemFiles({
              catalogItemId: item.id,
              files: uploadFiles,
              replacedPaths: item.photoStoragePath ? [item.photoStoragePath] : [],
              photoFileName: photoFile.name,
              next: returnTo
            })
          : await uploadCatalogItemFiles({
              catalogItemId: item.id,
              files: uploadFiles,
              photoFileName: null,
              next: returnTo
            });

      if (uploaded.photoStoragePath && uploaded.photoStoragePath !== item.photoStoragePath) {
        item = await upsertOrganizationCatalogItem({
          ...result.data,
          itemId: item.id,
          photoStoragePath: uploaded.photoStoragePath
        });
      }
    }

    linkedInventoryItem = await syncCatalogItemInventoryTracking({
      catalogItemId: item.id,
      inventoryItemId: result.data.inventoryItemId,
      name: item.name,
      sku: item.sku,
      description: item.description,
      category: item.category,
      unitOfMeasure: item.unit,
      defaultUnitCost: item.defaultUnitCost,
      taxable: item.taxable,
      trackInventory: result.data.trackInventory,
      reorderPoint: result.data.inventoryReorderPoint,
      location: result.data.inventoryLocation,
      itemStatus: item.status
    });

    if (result.data.inventoryAdjustmentQuantity) {
      if (!result.data.trackInventory || !linkedInventoryItem) {
        throw new Error("Enable inventory tracking before recording a manual inventory adjustment.");
      }

      await recordCatalogItemInventoryAdjustment({
        inventoryItemId: linkedInventoryItem.id,
        quantityChange: result.data.inventoryAdjustmentQuantity,
        note: result.data.inventoryAdjustmentNote
      });
    }
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
          error:
            error instanceof Error
            ? error.message
            : "Unable to update reusable catalog item."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message:
        result.data.inventoryAdjustmentQuantity && linkedInventoryItem
          ? `${item.name} was saved and the inventory adjustment was recorded.`
          : `${item.name} was saved successfully.`
    })
  );
}

export async function updateTaxCodeAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const result = taxCodeSettingsInputSchema.safeParse({
    taxCodeId: getFieldValue(formData, "taxCodeId"),
    name: getFieldValue(formData, "name"),
    rate: getFieldValue(formData, "rate"),
    jurisdiction: getFieldValue(formData, "jurisdiction"),
    active: getCheckboxValue(formData, "active")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to save tax code."
      })
    );
  }

  try {
    await upsertTaxCode(result.data);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to save tax code."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Tax code was saved successfully."
    })
  );
}

export async function updateInventoryItemAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const result = inventoryItemSettingsInputSchema.safeParse({
    inventoryItemId: getFieldValue(formData, "inventoryItemId"),
    name: getFieldValue(formData, "name"),
    sku: getFieldValue(formData, "sku"),
    description: getFieldValue(formData, "description"),
    category: getFieldValue(formData, "category"),
    unitOfMeasure: getFieldValue(formData, "unitOfMeasure"),
    reorderPoint: getFieldValue(formData, "reorderPoint"),
    defaultUnitCost: getFieldValue(formData, "defaultUnitCost"),
    taxable: getCheckboxValue(formData, "taxable"),
    status: getFieldValue(formData, "status")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to save inventory item."
      })
    );
  }

  try {
    await upsertInventoryItem(result.data);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to save inventory item."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Inventory item was saved successfully."
    })
  );
}

export async function deleteInventoryItemAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const inventoryItemId = getFieldValue(formData, "inventoryItemId");

  if (!inventoryItemId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Inventory item id is required."
      })
    );
  }

  try {
    await deleteInventoryItem(inventoryItemId);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to delete inventory item."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Inventory item was deleted."
    })
  );
}

export async function updateInventoryTransactionAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const result = inventoryTransactionSettingsInputSchema.safeParse({
    transactionId: getFieldValue(formData, "transactionId"),
    inventoryItemId: getFieldValue(formData, "inventoryItemId"),
    transactionType: getFieldValue(formData, "transactionType"),
    quantityChange: getFieldValue(formData, "quantityChange"),
    unitCost: getFieldValue(formData, "unitCost"),
    referenceType: getFieldValue(formData, "referenceType"),
    referenceId: getFieldValue(formData, "referenceId"),
    notes: getFieldValue(formData, "notes")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to save inventory transaction."
      })
    );
  }

  try {
    await upsertInventoryTransaction(result.data);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save inventory transaction."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Inventory transaction was saved successfully."
    })
  );
}

export async function deleteInventoryTransactionAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const transactionId = getFieldValue(formData, "transactionId");

  if (!transactionId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Inventory transaction id is required."
      })
    );
  }

  try {
    await deleteInventoryTransaction(transactionId);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete inventory transaction."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Inventory transaction was deleted."
    })
  );
}

export async function deleteOrganizationCatalogItemFileAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/cost-items-database";
  const catalogItemId = getFieldValue(formData, "catalogItemId");
  const filePath = getFieldValue(formData, "filePath");

  if (!catalogItemId || !filePath) {
    redirect(
      buildRedirect(returnTo, {
        error: "Catalog item file details are required."
      })
    );
  }

  try {
    await deleteCatalogItemFile({
      catalogItemId,
      filePath,
      next: returnTo
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to delete catalog item file."
      })
    );
  }

  revalidateSettingsSlice();
  revalidatePath("/cost-items-database");

  redirect(
    buildRedirect(returnTo, {
      message: "Catalog item file was removed."
    })
  );
}

export async function adoptPlatformCatalogItemSeedAction(formData: FormData) {
  await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/settings/catalogs";
  const seedId = getFieldValue(formData, "seedId");

  if (!seedId) {
    redirect(
      buildRedirect(returnTo, {
        error: "Platform catalog seed id is required."
      })
    );
  }

  let item;

  try {
    item = await adoptPlatformCatalogItemSeedForOrganization(seedId);
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to adopt platform catalog seed."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: `${item.name} was adopted for this organization.`
    })
  );
}

export async function updateOrganizationCatalogSystemComponentsAction(
  formData: FormData
) {
  await requireSettingsScope();
  const returnTo =
    getFieldValue(formData, "returnTo") || "/cost-items-database/systems";
  const systemCatalogItemId = getFieldValue(formData, "systemCatalogItemId");
  const componentCatalogItemIds = getFieldValues(formData, "componentCatalogItemId");
  const quantitiesPerUnit = getFieldValues(formData, "componentQuantityPerUnit");
  const basisUnits = getFieldValues(formData, "componentBasisUnit");
  const sortOrders = getFieldValues(formData, "componentSortOrder");

  if (!systemCatalogItemId) {
    redirect(
      buildRedirect(returnTo, {
        error: "A system item is required before components can be saved."
      })
    );
  }

  const components = componentCatalogItemIds
    .map((componentCatalogItemId, index) => ({
      componentCatalogItemId,
      quantityPerUnit: quantitiesPerUnit[index] ?? "0",
      basisUnit: basisUnits[index] ?? "sqft",
      sortOrder: Number(sortOrders[index] ?? index)
    }))
    .filter((component) => component.componentCatalogItemId.trim().length > 0);

  const invalidComponent = components.find(
    (component) =>
      Number.isNaN(Number(component.quantityPerUnit)) ||
      Number(component.quantityPerUnit) <= 0 ||
      component.basisUnit.trim().length === 0
  );

  if (invalidComponent) {
    redirect(
      buildRedirect(returnTo, {
        error:
          "System components need a real component item, a positive quantity per unit, and a basis unit."
      })
    );
  }

  try {
    await replaceOrganizationCatalogSystemComponents({
      systemCatalogItemId,
      components: components.map((component) => ({
        componentCatalogItemId: component.componentCatalogItemId,
        quantityPerUnit: Number(component.quantityPerUnit).toFixed(4),
        basisUnit: component.basisUnit.trim(),
        sortOrder: component.sortOrder
      }))
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save system components."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "System components were saved successfully."
    })
  );
}

export async function updateOrganizationFeatureOverrideAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const returnTo = getFieldValue(formData, "returnTo") || "/settings/modules";
  const result = organizationFeatureOverrideInputSchema.safeParse({
    key: getFieldValue(formData, "key"),
    name: getFieldValue(formData, "name"),
    description: getFieldValue(formData, "description"),
    moduleKey: getFieldValue(formData, "moduleKey"),
    surface: getFieldValue(formData, "surface"),
    enabled: getCheckboxValue(formData, "enabled")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to update module override."
      })
    );
  }

  try {
    await upsertOrganizationFeatureOverride({
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...result.data
    });
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error ? error.message : "Unable to update module override."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect(returnTo, {
      message: "Organization module override was updated."
    })
  );
}

export async function updateOrganizationMembershipRoleAction(formData: FormData) {
  const scope = await requireSettingsScope();
  const result = organizationMembershipRoleInputSchema.safeParse({
    membershipId: getFieldValue(formData, "membershipId"),
    nextRole: getFieldValue(formData, "nextRole")
  });

  if (!result.success) {
    redirect(
      buildRedirect("/settings/admin", {
        error:
          result.error.issues[0]?.message ?? "Unable to update member role."
      })
    );
  }

  const members = await listOrganizationMembers(scope.organizationId);
  const membership = members.find((member) => member.id === result.data.membershipId);

  if (!membership) {
    redirect(
      buildRedirect("/settings/admin", {
        error: "Organization member was not found."
      })
    );
  }

  if (membership.user_id === scope.userId && result.data.nextRole !== membership.membership_role) {
    redirect(
      buildRedirect("/settings/admin", {
        error: "Change your own organization role from another admin account."
      })
    );
  }

  if (
    membership.membership_role === "owner" &&
    result.data.nextRole !== "owner"
  ) {
    const ownerCount = members.filter(
      (member) => member.membership_role === "owner"
    ).length;

    if (ownerCount <= 1) {
      redirect(
        buildRedirect("/settings/admin", {
          error: "This organization must keep at least one owner."
        })
      );
    }
  }

  try {
    await updateOrganizationMembershipRole({
      organizationId: scope.organizationId,
      membershipId: result.data.membershipId,
      nextRole: result.data.nextRole,
      actingUserId: scope.userId
    });
  } catch (error) {
    redirect(
      buildRedirect("/settings/admin", {
        error: error instanceof Error ? error.message : "Unable to update member role."
      })
    );
  }

  revalidateSettingsSlice();

  redirect(
    buildRedirect("/settings/admin", {
      message: "Organization member role was updated."
    })
  );
}
