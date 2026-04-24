import "server-only";

import { cache } from "react";
import type {
  CatalogItem,
  CatalogSystemComponent,
  PlatformCatalogItemSeed
} from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CatalogScope = {
  userId: string;
  organizationId: string;
};

type CatalogItemRow = {
  id: string;
  company_id: string;
  source_seed_id: string | null;
  source_seed_key: string | null;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  name: string;
  description: string | null;
  internal_notes: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  vendor_id: string | null;
  category: string | null;
  sku: string | null;
  photo_storage_path: string | null;
  status: "active" | "archived";
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PlatformCatalogItemSeedRow = {
  id: string;
  item_type:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  seed_key: string;
  name: string;
  description: string | null;
  internal_notes: string | null;
  unit: string;
  default_unit_cost: string | number;
  default_unit_price: string | number | null;
  markup_percent: string | number;
  hidden_markup_percent: string | number;
  taxable: boolean;
  vendor_id: string | null;
  category: string | null;
  sku: string | null;
  photo_storage_path: string | null;
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type CatalogSystemComponentRow = {
  id: string;
  company_id: string;
  system_catalog_item_id: string;
  component_catalog_item_id: string;
  quantity_per_unit: string | number;
  basis_unit: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  component_items?:
    | Array<{
        id: string;
        item_type: CatalogItem["itemType"];
        name: string;
        description: string | null;
        unit: string;
      }>
    | {
        id: string;
        item_type: CatalogItem["itemType"];
        name: string;
        description: string | null;
        unit: string;
      }
    | null;
};

function mapCatalogItem(
  row: CatalogItemRow,
  systemComponents: CatalogSystemComponent[] = []
): CatalogItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    sourceSeedId: row.source_seed_id,
    sourceSeedKey: row.source_seed_key,
    itemType: row.item_type,
    name: row.name,
    description: row.description,
    internalNotes: row.internal_notes,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null ? null : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    vendorId: row.vendor_id,
    category: row.category,
    sku: row.sku,
    photoStoragePath: row.photo_storage_path,
    status: row.status,
    isDefault: row.is_default,
    metadata: {
      ...(row.metadata ?? {}),
      ...(systemComponents.length > 0 ? { systemComponents } : {})
    },
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlatformCatalogItemSeed(
  row: PlatformCatalogItemSeedRow
): PlatformCatalogItemSeed {
  return {
    id: row.id,
    itemType: row.item_type,
    seedKey: row.seed_key,
    name: row.name,
    description: row.description,
    internalNotes: row.internal_notes,
    unit: row.unit,
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    defaultUnitPrice:
      row.default_unit_price == null ? null : Number(row.default_unit_price).toFixed(2),
    markupPercent: Number(row.markup_percent).toFixed(2),
    hiddenMarkupPercent: Number(row.hidden_markup_percent).toFixed(2),
    taxable: row.taxable,
    vendorId: row.vendor_id,
    category: row.category,
    sku: row.sku,
    photoStoragePath: row.photo_storage_path,
    isActive: row.is_active,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCatalogSystemComponent(
  row: CatalogSystemComponentRow
): CatalogSystemComponent | null {
  const componentItem = Array.isArray(row.component_items)
    ? row.component_items[0]
    : row.component_items;

  if (!componentItem) {
    return null;
  }

  return {
    id: row.id,
    organizationId: row.company_id,
    systemCatalogItemId: row.system_catalog_item_id,
    componentCatalogItemId: row.component_catalog_item_id,
    componentItemType: componentItem.item_type,
    componentName: componentItem.name,
    componentDescription: componentItem.description,
    unit: componentItem.unit,
    quantityPerUnit: Number(row.quantity_per_unit).toFixed(4),
    basisUnit: row.basis_unit,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getCatalogScope(next = "/settings/catalogs"): Promise<CatalogScope | null> {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return null;
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id
  };
}

export async function requireCatalogScope(next = "/settings/catalogs") {
  const scope = await getCatalogScope(next);

  if (!scope) {
    throw new Error("No active organization is available for catalog settings yet.");
  }

  return scope;
}

export const listCatalogItems = cache(async (): Promise<CatalogItem[]> => {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const [itemsResponse, componentsResponse] = await Promise.all([
    supabase
      .from("catalog_items")
      .select("*")
      .eq("company_id", scope.organizationId)
      .order("item_type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("catalog_system_components")
      .select(
        `
          id,
          company_id,
          system_catalog_item_id,
          component_catalog_item_id,
          quantity_per_unit,
          basis_unit,
          sort_order,
          created_at,
          updated_at,
          component_items:catalog_items!catalog_system_components_component_company_fkey (
            id,
            item_type,
            name,
            description,
            unit
          )
        `
      )
      .eq("company_id", scope.organizationId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
  ]);

  if (itemsResponse.error) {
    throw new Error(`Unable to load catalog items: ${itemsResponse.error.message}`);
  }

  if (componentsResponse.error) {
    throw new Error(
      `Unable to load catalog system components: ${componentsResponse.error.message}`
    );
  }

  const rows = Array.isArray(itemsResponse.data)
    ? (itemsResponse.data as CatalogItemRow[])
    : [];
  const componentRows = Array.isArray(componentsResponse.data)
    ? (componentsResponse.data as CatalogSystemComponentRow[])
    : [];
  const componentsBySystemId = new Map<string, CatalogSystemComponent[]>();

  for (const componentRow of componentRows) {
    const component = mapCatalogSystemComponent(componentRow);

    if (!component) {
      continue;
    }

    const existing = componentsBySystemId.get(component.systemCatalogItemId) ?? [];
    existing.push(component);
    componentsBySystemId.set(component.systemCatalogItemId, existing);
  }

  return rows.map((row) =>
    mapCatalogItem(row, componentsBySystemId.get(row.id) ?? [])
  );
});

export const listPlatformCatalogItemSeedsForOrganization = cache(
  async (): Promise<PlatformCatalogItemSeed[]> => {
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("platform_catalog_item_seeds")
      .select("*")
      .eq("is_active", true)
      .order("item_type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (response.error) {
      throw new Error(
        `Unable to load platform catalog seeds: ${response.error.message}`
      );
    }

    const rows = Array.isArray(response.data)
      ? (response.data as PlatformCatalogItemSeedRow[])
      : [];
    return rows.map(mapPlatformCatalogItemSeed);
  }
);

export async function adoptPlatformCatalogItemSeedForOrganization(seedId: string) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("copy_platform_catalog_item_seed_to_company", {
    target_seed_id: seedId,
    target_company_id: scope.organizationId,
    acting_user_id: scope.userId
  });
  const data: unknown = response.data;

  if (response.error || typeof data !== "string") {
    throw new Error(
      `Unable to adopt platform catalog seed: ${response.error?.message ?? "Unknown error."}`
    );
  }

  const itemResponse = await supabase
    .from("catalog_items")
    .select("*")
    .eq("company_id", scope.organizationId)
    .eq("id", data)
    .maybeSingle();

  if (itemResponse.error || !itemResponse.data) {
    throw new Error(
      `Catalog seed copy was created but could not be loaded: ${itemResponse.error?.message ?? "Unknown error."}`
    );
  }

  return mapCatalogItem(itemResponse.data as CatalogItemRow);
}

export async function upsertOrganizationCatalogItem(input: {
  itemId?: string | null;
  itemType:
    | "material"
    | "labor"
    | "service"
    | "equipment"
    | "subcontractor"
    | "other"
    | "system";
  name: string;
  description: string | null;
  internalNotes: string | null;
  unit: string;
  defaultUnitCost: string;
  defaultUnitPrice: string | null;
  markupPercent: string;
  hiddenMarkupPercent: string;
  taxable: boolean;
  vendorId: string | null;
  category: string | null;
  sku: string | null;
  photoStoragePath: string | null;
  status: "active" | "archived";
  isDefault: boolean;
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();

  if (input.isDefault) {
    const clearResponse = await supabase
      .from("catalog_items")
      .update({ is_default: false, updated_by: scope.userId })
      .eq("company_id", scope.organizationId)
      .eq("item_type", input.itemType)
      .eq("is_default", true)
      .neq("id", input.itemId ?? "00000000-0000-0000-0000-000000000000");

    if (clearResponse.error) {
      throw new Error(
        `Unable to clear organization catalog defaults: ${clearResponse.error.message}`
      );
    }
  }

  const payload = {
    company_id: scope.organizationId,
    item_type: input.itemType,
    name: input.name,
    description: input.description,
    internal_notes: input.internalNotes,
    unit: input.unit,
    default_unit_cost: input.defaultUnitCost,
    default_unit_price: input.defaultUnitPrice,
    markup_percent: input.markupPercent,
    hidden_markup_percent: input.hiddenMarkupPercent,
    taxable: input.taxable,
    vendor_id: input.vendorId,
    category: input.category,
    sku: input.sku,
    photo_storage_path: input.photoStoragePath,
    status: input.status,
    is_default: input.isDefault,
    updated_by: scope.userId,
    created_by: scope.userId
  };

  const response = input.itemId
    ? await supabase
        .from("catalog_items")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.itemId)
        .select("*")
        .single()
    : await supabase.from("catalog_items").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(
      `Unable to save organization catalog item: ${response.error.message}`
    );
  }

  return mapCatalogItem(response.data as CatalogItemRow);
}

export async function replaceOrganizationCatalogSystemComponents(input: {
  systemCatalogItemId: string;
  components: Array<{
    id?: string | null;
    componentCatalogItemId: string;
    quantityPerUnit: string;
    basisUnit: string;
    sortOrder: number;
  }>;
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const deleteResponse = await supabase
    .from("catalog_system_components")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("system_catalog_item_id", input.systemCatalogItemId);

  if (deleteResponse.error) {
    throw new Error(
      `Unable to clear system components: ${deleteResponse.error.message}`
    );
  }

  if (input.components.length === 0) {
    return [];
  }

  const insertResponse = await supabase
    .from("catalog_system_components")
    .insert(
      input.components.map((component, index) => ({
        company_id: scope.organizationId,
        system_catalog_item_id: input.systemCatalogItemId,
        component_catalog_item_id: component.componentCatalogItemId,
        quantity_per_unit: component.quantityPerUnit,
        basis_unit: component.basisUnit,
        sort_order: component.sortOrder ?? index,
        created_by: scope.userId,
        updated_by: scope.userId
      }))
    )
    .select(
      `
        id,
        company_id,
        system_catalog_item_id,
        component_catalog_item_id,
        quantity_per_unit,
        basis_unit,
        sort_order,
        created_at,
        updated_at,
        component_items:catalog_items!catalog_system_components_component_company_fkey (
          id,
          item_type,
          name,
          description,
          unit
        )
      `
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (insertResponse.error) {
    throw new Error(
      `Unable to save system components: ${insertResponse.error.message}`
    );
  }

  const rows = Array.isArray(insertResponse.data)
    ? (insertResponse.data as CatalogSystemComponentRow[])
    : [];

  return rows
    .map((row) => mapCatalogSystemComponent(row))
    .filter((component): component is CatalogSystemComponent => Boolean(component));
}
