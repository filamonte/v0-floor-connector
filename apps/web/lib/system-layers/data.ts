import "server-only";

import type { CatalogItem } from "@floorconnector/types";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import {
  isAllowedSystemLayerStatusTransition,
  type ComponentRole,
  type FinishFamily,
  type QuantityBasis,
  type ServiceFamily,
  type SystemLayerStatus
} from "./constants";
import type {
  FinishProductInput,
  FloorSystemComponentInput,
  FloorSystemComponentsReplaceInput,
  FloorSystemTemplateInput
} from "./schemas";

type SystemLayerScope = {
  userId: string;
  organizationId: string;
};

type FinishProductRow = {
  id: string;
  company_id: string;
  manufacturer_name: string;
  product_line: string | null;
  product_code: string | null;
  sku: string | null;
  product_name: string;
  normalized_product_name: string;
  service_family: ServiceFamily | null;
  finish_family: FinishFamily | null;
  display_color_name: string | null;
  customer_facing_description: string | null;
  technical_notes: string | null;
  metadata: Record<string, unknown>;
  status: SystemLayerStatus;
  created_at: string;
  updated_at: string;
};

type FloorSystemTemplateRow = {
  id: string;
  company_id: string;
  name: string;
  normalized_name: string;
  service_family: ServiceFamily;
  finish_family: FinishFamily | null;
  customer_facing_description: string | null;
  internal_notes: string | null;
  prep_requirements: string | null;
  technical_notes: string | null;
  template_version: number;
  status: SystemLayerStatus;
  created_at: string;
  updated_at: string;
};

type CatalogItemLookupRow = {
  id: string;
  company_id: string;
  item_type: CatalogItem["itemType"];
  name: string;
  unit: string;
  status: CatalogItem["status"];
};

type FloorSystemTemplateComponentRow = {
  id: string;
  company_id: string;
  floor_system_template_id: string;
  catalog_item_id: string;
  finish_product_id: string | null;
  component_role: ComponentRole;
  sort_order: number;
  quantity_basis: QuantityBasis;
  default_quantity: string | number | null;
  formula_metadata: Record<string, unknown>;
  customer_facing_label: string | null;
  internal_notes: string | null;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  catalog_item:
    | Array<{
        id: string;
        name: string;
        item_type: CatalogItem["itemType"];
        unit: string;
        status: CatalogItem["status"];
      }>
    | {
        id: string;
        name: string;
        item_type: CatalogItem["itemType"];
        unit: string;
        status: CatalogItem["status"];
      }
    | null;
  finish_product:
    | Array<{
        id: string;
        manufacturer_name: string;
        product_name: string;
        display_color_name: string | null;
        status: SystemLayerStatus;
      }>
    | {
        id: string;
        manufacturer_name: string;
        product_name: string;
        display_color_name: string | null;
        status: SystemLayerStatus;
      }
    | null;
};

export type FinishProduct = {
  id: string;
  organizationId: string;
  manufacturerName: string;
  productLine: string | null;
  productCode: string | null;
  sku: string | null;
  productName: string;
  normalizedProductName: string;
  serviceFamily: ServiceFamily | null;
  finishFamily: FinishFamily | null;
  displayColorName: string | null;
  customerFacingDescription: string | null;
  technicalNotes: string | null;
  status: SystemLayerStatus;
  createdAt: string;
  updatedAt: string;
};

export type FloorSystemTemplate = {
  id: string;
  organizationId: string;
  name: string;
  normalizedName: string;
  serviceFamily: ServiceFamily;
  finishFamily: FinishFamily | null;
  customerFacingDescription: string | null;
  internalNotes: string | null;
  prepRequirements: string | null;
  technicalNotes: string | null;
  templateVersion: number;
  status: SystemLayerStatus;
  createdAt: string;
  updatedAt: string;
};

export type FloorSystemTemplateComponent = {
  id: string;
  organizationId: string;
  templateId: string;
  catalogItemId: string;
  finishProductId: string | null;
  componentRole: ComponentRole;
  sortOrder: number;
  quantityBasis: QuantityBasis;
  defaultQuantity: string | null;
  formulaMetadata: Record<string, unknown>;
  customerFacingLabel: string | null;
  internalNotes: string | null;
  isOptional: boolean;
  catalogItem: {
    id: string;
    name: string;
    itemType: CatalogItem["itemType"];
    unit: string;
    status: CatalogItem["status"];
  } | null;
  finishProduct: {
    id: string;
    manufacturerName: string;
    productName: string;
    displayColorName: string | null;
    status: SystemLayerStatus;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type SystemLayersAdminData = {
  finishProducts: FinishProduct[];
  templates: FloorSystemTemplate[];
  components: FloorSystemTemplateComponent[];
  catalogItems: Array<{
    id: string;
    name: string;
    itemType: CatalogItem["itemType"];
    unit: string;
    status: CatalogItem["status"];
  }>;
};

function mapFinishProduct(row: FinishProductRow): FinishProduct {
  return {
    id: row.id,
    organizationId: row.company_id,
    manufacturerName: row.manufacturer_name,
    productLine: row.product_line,
    productCode: row.product_code,
    sku: row.sku,
    productName: row.product_name,
    normalizedProductName: row.normalized_product_name,
    serviceFamily: row.service_family,
    finishFamily: row.finish_family,
    displayColorName: row.display_color_name,
    customerFacingDescription: row.customer_facing_description,
    technicalNotes: row.technical_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapTemplate(row: FloorSystemTemplateRow): FloorSystemTemplate {
  return {
    id: row.id,
    organizationId: row.company_id,
    name: row.name,
    normalizedName: row.normalized_name,
    serviceFamily: row.service_family,
    finishFamily: row.finish_family,
    customerFacingDescription: row.customer_facing_description,
    internalNotes: row.internal_notes,
    prepRequirements: row.prep_requirements,
    technicalNotes: row.technical_notes,
    templateVersion: row.template_version,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapComponent(row: FloorSystemTemplateComponentRow): FloorSystemTemplateComponent {
  const catalogItem = unwrapOne(row.catalog_item);
  const finishProduct = unwrapOne(row.finish_product);

  return {
    id: row.id,
    organizationId: row.company_id,
    templateId: row.floor_system_template_id,
    catalogItemId: row.catalog_item_id,
    finishProductId: row.finish_product_id,
    componentRole: row.component_role,
    sortOrder: row.sort_order,
    quantityBasis: row.quantity_basis,
    defaultQuantity:
      row.default_quantity == null ? null : Number(row.default_quantity).toFixed(4),
    formulaMetadata: row.formula_metadata ?? {},
    customerFacingLabel: row.customer_facing_label,
    internalNotes: row.internal_notes,
    isOptional: row.is_optional,
    catalogItem: catalogItem
      ? {
          id: catalogItem.id,
          name: catalogItem.name,
          itemType: catalogItem.item_type,
          unit: catalogItem.unit,
          status: catalogItem.status
        }
      : null,
    finishProduct: finishProduct
      ? {
          id: finishProduct.id,
          manufacturerName: finishProduct.manufacturer_name,
          productName: finishProduct.product_name,
          displayColorName: finishProduct.display_color_name,
          status: finishProduct.status
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function requireSystemLayerScope(next = "/settings/system-layers"): Promise<SystemLayerScope> {
  const scope = await requireOrganizationAdminScope(next);

  return {
    userId: scope.userId,
    organizationId: scope.organizationId
  };
}

async function getFinishProductById(finishProductId: string, scope: SystemLayerScope) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("finish_products")
    .select("*")
    .eq("company_id", scope.organizationId)
    .eq("id", finishProductId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load finish product: ${response.error.message}`);
  }

  return response.data ? mapFinishProduct(response.data as FinishProductRow) : null;
}

async function getTemplateById(templateId: string, scope: SystemLayerScope) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("floor_system_templates")
    .select("*")
    .eq("company_id", scope.organizationId)
    .eq("id", templateId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load floor system template: ${response.error.message}`);
  }

  return response.data ? mapTemplate(response.data as FloorSystemTemplateRow) : null;
}

async function assertCatalogItemBelongsToCompany(
  catalogItemId: string,
  scope: SystemLayerScope
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("catalog_items")
    .select("id, company_id")
    .eq("company_id", scope.organizationId)
    .eq("id", catalogItemId)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to validate catalog item: ${response.error.message}`);
  }

  if (!response.data) {
    throw new Error("Component catalog item must belong to the active organization.");
  }
}

async function assertFinishProductBelongsToCompany(
  finishProductId: string | null,
  scope: SystemLayerScope
) {
  if (!finishProductId) {
    return;
  }

  const finishProduct = await getFinishProductById(finishProductId, scope);

  if (!finishProduct) {
    throw new Error("Component finish product must belong to the active organization.");
  }
}

async function incrementTemplateVersion(templateId: string, scope: SystemLayerScope) {
  const template = await getTemplateById(templateId, scope);

  if (!template) {
    throw new Error("Floor system template was not found.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("floor_system_templates")
    .update({
      template_version: template.templateVersion + 1,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", templateId);

  if (response.error) {
    throw new Error(`Unable to update template version: ${response.error.message}`);
  }
}

export async function getSystemLayersAdminData(
  next = "/settings/system-layers"
): Promise<SystemLayersAdminData> {
  const scope = await requireSystemLayerScope(next);
  const supabase = await getSupabaseServerClient();
  const [finishProductsResponse, templatesResponse, componentsResponse, catalogResponse] =
    await Promise.all([
      supabase
        .from("finish_products")
        .select("*")
        .eq("company_id", scope.organizationId)
        .order("status", { ascending: true })
        .order("manufacturer_name", { ascending: true })
        .order("product_name", { ascending: true }),
      supabase
        .from("floor_system_templates")
        .select("*")
        .eq("company_id", scope.organizationId)
        .order("status", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("floor_system_template_components")
        .select(
          `
            *,
            catalog_item:catalog_items!floor_system_template_components_catalog_item_company_fkey (
              id,
              name,
              item_type,
              unit,
              status
            ),
            finish_product:finish_products!floor_system_template_components_finish_product_company_fkey (
              id,
              manufacturer_name,
              product_name,
              display_color_name,
              status
            )
          `
        )
        .eq("company_id", scope.organizationId)
        .order("floor_system_template_id", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("catalog_items")
        .select("id, company_id, item_type, name, unit, status")
        .eq("company_id", scope.organizationId)
        .order("item_type", { ascending: true })
        .order("name", { ascending: true })
    ]);

  if (finishProductsResponse.error) {
    throw new Error(
      `Unable to load finish products: ${finishProductsResponse.error.message}`
    );
  }

  if (templatesResponse.error) {
    throw new Error(
      `Unable to load floor system templates: ${templatesResponse.error.message}`
    );
  }

  if (componentsResponse.error) {
    throw new Error(
      `Unable to load floor system components: ${componentsResponse.error.message}`
    );
  }

  if (catalogResponse.error) {
    throw new Error(`Unable to load catalog items: ${catalogResponse.error.message}`);
  }

  return {
    finishProducts: ((finishProductsResponse.data ?? []) as FinishProductRow[]).map(
      mapFinishProduct
    ),
    templates: ((templatesResponse.data ?? []) as FloorSystemTemplateRow[]).map(
      mapTemplate
    ),
    components: ((componentsResponse.data ?? []) as FloorSystemTemplateComponentRow[]).map(
      mapComponent
    ),
    catalogItems: ((catalogResponse.data ?? []) as CatalogItemLookupRow[]).map(
      (item) => ({
        id: item.id,
        name: item.name,
        itemType: item.item_type,
        unit: item.unit,
        status: item.status
      })
    )
  };
}

export async function upsertFinishProduct(input: FinishProductInput) {
  const scope = await requireSystemLayerScope();
  const existing = input.finishProductId
    ? await getFinishProductById(input.finishProductId, scope)
    : null;

  if (input.finishProductId && !existing) {
    throw new Error("Finish product was not found.");
  }

  if (!isAllowedSystemLayerStatusTransition(existing?.status ?? null, input.status)) {
    throw new Error("Finish product status must progress draft -> active -> retired -> archived.");
  }

  const payload = {
    company_id: scope.organizationId,
    manufacturer_name: input.manufacturerName,
    product_line: input.productLine,
    product_code: input.productCode,
    sku: input.sku,
    product_name: input.productName,
    service_family: input.serviceFamily,
    finish_family: input.finishFamily,
    display_color_name: input.displayColorName,
    customer_facing_description: input.customerFacingDescription,
    technical_notes: input.technicalNotes,
    status: input.status,
    created_by: scope.userId,
    updated_by: scope.userId
  };
  const supabase = await getSupabaseServerClient();
  const response = input.finishProductId
    ? await supabase
        .from("finish_products")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.finishProductId)
        .select("*")
        .single()
    : await supabase.from("finish_products").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(`Unable to save finish product: ${response.error.message}`);
  }

  return mapFinishProduct(response.data as FinishProductRow);
}

export async function archiveFinishProduct(finishProductId: string) {
  return upsertFinishProduct({
    ...(await loadFinishProductInput(finishProductId)),
    status: "archived"
  });
}

async function loadFinishProductInput(finishProductId: string): Promise<FinishProductInput> {
  const scope = await requireSystemLayerScope();
  const finishProduct = await getFinishProductById(finishProductId, scope);

  if (!finishProduct) {
    throw new Error("Finish product was not found.");
  }

  return {
    finishProductId: finishProduct.id,
    manufacturerName: finishProduct.manufacturerName,
    productLine: finishProduct.productLine,
    productCode: finishProduct.productCode,
    sku: finishProduct.sku,
    productName: finishProduct.productName,
    serviceFamily: finishProduct.serviceFamily,
    finishFamily: finishProduct.finishFamily,
    displayColorName: finishProduct.displayColorName,
    customerFacingDescription: finishProduct.customerFacingDescription,
    technicalNotes: finishProduct.technicalNotes,
    status: finishProduct.status
  };
}

export async function upsertFloorSystemTemplate(input: FloorSystemTemplateInput) {
  const scope = await requireSystemLayerScope();
  const existing = input.templateId ? await getTemplateById(input.templateId, scope) : null;

  if (input.templateId && !existing) {
    throw new Error("Floor system template was not found.");
  }

  if (!isAllowedSystemLayerStatusTransition(existing?.status ?? null, input.status)) {
    throw new Error("Template status must progress draft -> active -> retired -> archived.");
  }

  const structuralChange = Boolean(
    existing &&
      (existing.serviceFamily !== input.serviceFamily ||
        existing.finishFamily !== input.finishFamily)
  );
  const payload = {
    company_id: scope.organizationId,
    name: input.name,
    service_family: input.serviceFamily,
    finish_family: input.finishFamily,
    customer_facing_description: input.customerFacingDescription,
    internal_notes: input.internalNotes,
    prep_requirements: input.prepRequirements,
    technical_notes: input.technicalNotes,
    template_version: structuralChange && existing ? existing.templateVersion + 1 : undefined,
    status: input.status,
    created_by: scope.userId,
    updated_by: scope.userId
  };
  const supabase = await getSupabaseServerClient();
  const response = input.templateId
    ? await supabase
        .from("floor_system_templates")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.templateId)
        .select("*")
        .single()
    : await supabase.from("floor_system_templates").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(`Unable to save floor system template: ${response.error.message}`);
  }

  return mapTemplate(response.data as FloorSystemTemplateRow);
}

async function loadTemplateInput(templateId: string): Promise<FloorSystemTemplateInput> {
  const scope = await requireSystemLayerScope();
  const template = await getTemplateById(templateId, scope);

  if (!template) {
    throw new Error("Floor system template was not found.");
  }

  return {
    templateId: template.id,
    name: template.name,
    serviceFamily: template.serviceFamily,
    finishFamily: template.finishFamily,
    customerFacingDescription: template.customerFacingDescription,
    internalNotes: template.internalNotes,
    prepRequirements: template.prepRequirements,
    technicalNotes: template.technicalNotes,
    status: template.status
  };
}

export async function archiveFloorSystemTemplate(templateId: string) {
  return upsertFloorSystemTemplate({
    ...(await loadTemplateInput(templateId)),
    status: "archived"
  });
}

export async function addFloorSystemTemplateComponent(
  input: FloorSystemComponentInput
) {
  const scope = await requireSystemLayerScope();
  const template = await getTemplateById(input.templateId, scope);

  if (!template) {
    throw new Error("Floor system template was not found.");
  }

  await assertCatalogItemBelongsToCompany(input.catalogItemId, scope);
  await assertFinishProductBelongsToCompany(input.finishProductId, scope);

  const supabase = await getSupabaseServerClient();
  const maxSortResponse = await supabase
    .from("floor_system_template_components")
    .select("sort_order")
    .eq("company_id", scope.organizationId)
    .eq("floor_system_template_id", input.templateId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxSortResponse.error) {
    throw new Error(
      `Unable to determine next component order: ${maxSortResponse.error.message}`
    );
  }

  const maxSort =
    maxSortResponse.data &&
    typeof (maxSortResponse.data as { sort_order?: unknown }).sort_order === "number"
      ? (maxSortResponse.data as { sort_order: number }).sort_order
      : -1;
  const response = await supabase
    .from("floor_system_template_components")
    .insert({
      company_id: scope.organizationId,
      floor_system_template_id: input.templateId,
      catalog_item_id: input.catalogItemId,
      finish_product_id: input.finishProductId,
      component_role: input.componentRole,
      sort_order: maxSort + 1,
      quantity_basis: input.quantityBasis,
      default_quantity: input.defaultQuantity,
      formula_metadata: input.formulaMetadata,
      customer_facing_label: input.customerFacingLabel,
      internal_notes: input.internalNotes,
      is_optional: input.isOptional,
      created_by: scope.userId,
      updated_by: scope.userId
    });

  if (response.error) {
    throw new Error(`Unable to add floor system component: ${response.error.message}`);
  }

  await incrementTemplateVersion(input.templateId, scope);
}

export async function replaceFloorSystemTemplateComponents(
  input: FloorSystemComponentsReplaceInput
) {
  const scope = await requireSystemLayerScope();
  const template = await getTemplateById(input.templateId, scope);

  if (!template) {
    throw new Error("Floor system template was not found.");
  }

  const keptComponents = input.components
    .filter((component) => !component.remove)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((component, index) => ({
      ...component,
      sortOrder: index
    }));
  const seenCatalogItems = new Set<string>();

  for (const component of keptComponents) {
    if (seenCatalogItems.has(component.catalogItemId)) {
      throw new Error("Each catalog item can only be added once to a floor system template.");
    }

    seenCatalogItems.add(component.catalogItemId);
    await assertCatalogItemBelongsToCompany(component.catalogItemId, scope);
    await assertFinishProductBelongsToCompany(component.finishProductId, scope);
  }

  const componentIds = input.components.map((component) => component.componentId);
  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("floor_system_template_components")
    .select("id")
    .eq("company_id", scope.organizationId)
    .eq("floor_system_template_id", input.templateId)
    .in("id", componentIds);

  if (existingResponse.error) {
    throw new Error(`Unable to validate components: ${existingResponse.error.message}`);
  }

  const existingIds = new Set(
    ((existingResponse.data ?? []) as Array<{ id: string }>).map((row) => row.id)
  );

  if (componentIds.some((componentId) => !existingIds.has(componentId))) {
    throw new Error("Every edited component must belong to the selected template.");
  }

  const deleteIds = input.components
    .filter((component) => component.remove)
    .map((component) => component.componentId);

  if (deleteIds.length > 0) {
    const deleteResponse = await supabase
      .from("floor_system_template_components")
      .delete()
      .eq("company_id", scope.organizationId)
      .eq("floor_system_template_id", input.templateId)
      .in("id", deleteIds);

    if (deleteResponse.error) {
      throw new Error(`Unable to remove components: ${deleteResponse.error.message}`);
    }
  }

  for (const component of keptComponents) {
    const updateResponse = await supabase
      .from("floor_system_template_components")
      .update({
        catalog_item_id: component.catalogItemId,
        finish_product_id: component.finishProductId,
        component_role: component.componentRole,
        sort_order: component.sortOrder,
        quantity_basis: component.quantityBasis,
        default_quantity: component.defaultQuantity,
        formula_metadata: component.formulaMetadata,
        customer_facing_label: component.customerFacingLabel,
        internal_notes: component.internalNotes,
        is_optional: component.isOptional,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("floor_system_template_id", input.templateId)
      .eq("id", component.componentId);

    if (updateResponse.error) {
      throw new Error(`Unable to update component order: ${updateResponse.error.message}`);
    }
  }

  await incrementTemplateVersion(input.templateId, scope);
}
