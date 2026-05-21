"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addFloorSystemTemplateComponent,
  archiveFinishProduct,
  archiveFloorSystemTemplate,
  replaceFloorSystemTemplateComponents,
  upsertFinishProduct,
  upsertFloorSystemTemplate
} from "./data";
import {
  finishProductInputSchema,
  floorSystemComponentInputSchema,
  floorSystemComponentsReplaceSchema,
  floorSystemTemplateInputSchema
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
  return getFieldValue(formData, "returnTo") || "/settings/system-layers";
}

function revalidateSystemLayers() {
  revalidatePath("/settings");
  revalidatePath("/settings/system-layers");
}

export async function saveFinishProductAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = finishProductInputSchema.safeParse({
    finishProductId: getFieldValue(formData, "finishProductId"),
    manufacturerName: getFieldValue(formData, "manufacturerName"),
    productLine: getFieldValue(formData, "productLine"),
    productCode: getFieldValue(formData, "productCode"),
    sku: getFieldValue(formData, "sku"),
    productName: getFieldValue(formData, "productName"),
    serviceFamily: getFieldValue(formData, "serviceFamily"),
    finishFamily: getFieldValue(formData, "finishFamily"),
    displayColorName: getFieldValue(formData, "displayColorName"),
    customerFacingDescription: getFieldValue(formData, "customerFacingDescription"),
    technicalNotes: getFieldValue(formData, "technicalNotes"),
    status: getFieldValue(formData, "status") || "draft"
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to save finish product."
      })
    );
  }

  try {
    const finishProduct = await upsertFinishProduct(result.data);
    revalidateSystemLayers();
    redirect(
      buildRedirect(returnTo, {
        message: `${finishProduct.productName} was saved.`
      })
    );
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error: error instanceof Error ? error.message : "Unable to save finish product."
      })
    );
  }
}

export async function archiveFinishProductAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const finishProductId = getFieldValue(formData, "finishProductId");

  if (!finishProductId) {
    redirect(buildRedirect(returnTo, { error: "Finish product id is required." }));
  }

  try {
    await archiveFinishProduct(finishProductId);
    revalidateSystemLayers();
    redirect(buildRedirect(returnTo, { message: "Finish product was archived." }));
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error ? error.message : "Unable to archive finish product."
      })
    );
  }
}

export async function saveFloorSystemTemplateAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = floorSystemTemplateInputSchema.safeParse({
    templateId: getFieldValue(formData, "templateId"),
    name: getFieldValue(formData, "name"),
    serviceFamily: getFieldValue(formData, "serviceFamily"),
    finishFamily: getFieldValue(formData, "finishFamily"),
    customerFacingDescription: getFieldValue(formData, "customerFacingDescription"),
    internalNotes: getFieldValue(formData, "internalNotes"),
    prepRequirements: getFieldValue(formData, "prepRequirements"),
    technicalNotes: getFieldValue(formData, "technicalNotes"),
    status: getFieldValue(formData, "status") || "draft"
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to save floor system template."
      })
    );
  }

  try {
    const template = await upsertFloorSystemTemplate(result.data);
    revalidateSystemLayers();
    redirect(
      buildRedirect(returnTo, {
        message: `${template.name} was saved.`
      })
    );
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save floor system template."
      })
    );
  }
}

export async function archiveFloorSystemTemplateAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const templateId = getFieldValue(formData, "templateId");

  if (!templateId) {
    redirect(buildRedirect(returnTo, { error: "Floor system template id is required." }));
  }

  try {
    await archiveFloorSystemTemplate(templateId);
    revalidateSystemLayers();
    redirect(buildRedirect(returnTo, { message: "Floor system template was archived." }));
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to archive floor system template."
      })
    );
  }
}

export async function addFloorSystemTemplateComponentAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const result = floorSystemComponentInputSchema.safeParse({
    templateId: getFieldValue(formData, "templateId"),
    catalogItemId: getFieldValue(formData, "catalogItemId"),
    finishProductId: getFieldValue(formData, "finishProductId"),
    componentRole: getFieldValue(formData, "componentRole") || "standard",
    quantityBasis: getFieldValue(formData, "quantityBasis"),
    defaultQuantity: getFieldValue(formData, "defaultQuantity"),
    formulaMetadata: getFieldValue(formData, "formulaMetadata"),
    customerFacingLabel: getFieldValue(formData, "customerFacingLabel"),
    internalNotes: getFieldValue(formData, "internalNotes"),
    isOptional: getCheckboxValue(formData, "isOptional")
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error: result.error.issues[0]?.message ?? "Unable to add template component."
      })
    );
  }

  try {
    await addFloorSystemTemplateComponent(result.data);
    revalidateSystemLayers();
    redirect(buildRedirect(returnTo, { message: "Template component was added." }));
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error ? error.message : "Unable to add template component."
      })
    );
  }
}

export async function saveFloorSystemTemplateComponentsAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const componentIds = getFieldValues(formData, "componentId");
  const catalogItemIds = getFieldValues(formData, "componentCatalogItemId");
  const finishProductIds = getFieldValues(formData, "componentFinishProductId");
  const componentRoles = getFieldValues(formData, "componentRole");
  const quantityBases = getFieldValues(formData, "quantityBasis");
  const defaultQuantities = getFieldValues(formData, "defaultQuantity");
  const formulaMetadata = getFieldValues(formData, "formulaMetadata");
  const customerFacingLabels = getFieldValues(formData, "customerFacingLabel");
  const internalNotes = getFieldValues(formData, "internalNotes");
  const sortOrders = getFieldValues(formData, "sortOrder");
  const removedIds = new Set(getFieldValues(formData, "removeComponentId"));
  const result = floorSystemComponentsReplaceSchema.safeParse({
    templateId: getFieldValue(formData, "templateId"),
    components: componentIds.map((componentId, index) => ({
      componentId,
      catalogItemId: catalogItemIds[index] ?? "",
      finishProductId: finishProductIds[index] ?? "",
      componentRole: componentRoles[index] ?? "standard",
      quantityBasis: quantityBases[index] ?? "",
      defaultQuantity: defaultQuantities[index] ?? "",
      formulaMetadata: formulaMetadata[index] ?? "{}",
      customerFacingLabel: customerFacingLabels[index] ?? "",
      internalNotes: internalNotes[index] ?? "",
      isOptional: getCheckboxValue(formData, `isOptional.${componentId}`),
      sortOrder: sortOrders[index] ?? String(index),
      remove: removedIds.has(componentId)
    }))
  });

  if (!result.success) {
    redirect(
      buildRedirect(returnTo, {
        error:
          result.error.issues[0]?.message ?? "Unable to save template components."
      })
    );
  }

  try {
    await replaceFloorSystemTemplateComponents(result.data);
    revalidateSystemLayers();
    redirect(buildRedirect(returnTo, { message: "Template components were saved." }));
  } catch (error) {
    redirect(
      buildRedirect(returnTo, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save template components."
      })
    );
  }
}
