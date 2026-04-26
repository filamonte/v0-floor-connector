import "server-only";

import { cache } from "react";
import type {
  CatalogItemFile,
  CatalogItem,
  CatalogSystemComponent,
  InventoryItem,
  InventoryTransaction,
  PlatformCatalogItemSeed
} from "@floorconnector/types";
import { STORAGE_BUCKET_NAMES } from "@floorconnector/config";

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
  tax_code_id: string | null;
  vendor_id: string | null;
  category: string | null;
  cost_code: string | null;
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
  tax_code_id: string | null;
  vendor_id: string | null;
  category: string | null;
  cost_code: string | null;
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

type TaxCodeRow = {
  id: string;
  company_id: string;
  name: string;
  rate: string | number;
  jurisdiction: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type InventoryItemRow = {
  id: string;
  company_id: string;
  catalog_item_id: string | null;
  location: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unit_of_measure: string;
  current_quantity: string | number;
  reorder_point: string | number;
  default_unit_cost: string | number;
  taxable: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

type InventoryTransactionRow = {
  id: string;
  company_id: string;
  inventory_item_id: string;
  transaction_type:
    | "purchase"
    | "adjustment"
    | "job_usage"
    | "return"
    | "waste"
    | "transfer";
  quantity_change: string | number;
  unit_cost: string | number | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaxCode = {
  id: string;
  organizationId: string;
  name: string;
  rate: string;
  jurisdiction: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
    costCode: row.cost_code,
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
    costCode: row.cost_code,
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

function mapTaxCode(row: TaxCodeRow): TaxCode {
  return {
    id: row.id,
    organizationId: row.company_id,
    name: row.name,
    rate: Number(row.rate).toFixed(6),
    jurisdiction: row.jurisdiction,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapInventoryItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    catalogItemId: row.catalog_item_id,
    location: row.location,
    name: row.name,
    sku: row.sku,
    description: row.description,
    category: row.category,
    unitOfMeasure: row.unit_of_measure,
    currentQuantity: Number(row.current_quantity).toFixed(4),
    reorderPoint: Number(row.reorder_point).toFixed(4),
    defaultUnitCost: Number(row.default_unit_cost).toFixed(2),
    taxable: row.taxable,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapInventoryTransaction(
  row: InventoryTransactionRow
): InventoryTransaction {
  return {
    id: row.id,
    organizationId: row.company_id,
    inventoryItemId: row.inventory_item_id,
    transactionType: row.transaction_type,
    quantityChange: Number(row.quantity_change).toFixed(4),
    unitCost: row.unit_cost == null ? null : Number(row.unit_cost).toFixed(2),
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    notes: row.notes,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeLookupText(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : null;
}

function sanitizeCatalogFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function buildCatalogItemStoragePrefix(organizationId: string, catalogItemId: string) {
  return `${organizationId}/catalog-items/${catalogItemId}`;
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

async function findCatalogItemDuplicates(input: {
  organizationId: string;
  itemId?: string | null;
  name: string;
  sku: string | null;
}) {
  const supabase = await getSupabaseServerClient();
  const normalizedName = normalizeLookupText(input.name);
  const normalizedSku = normalizeLookupText(input.sku);

  const [nameResponse, skuResponse] = await Promise.all([
    normalizedName
      ? supabase
          .from("catalog_items")
          .select("id, name")
          .eq("company_id", input.organizationId)
          .eq("normalized_name", normalizedName)
          .neq("id", input.itemId ?? "00000000-0000-0000-0000-000000000000")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    normalizedSku
      ? supabase
          .from("catalog_items")
          .select("id, sku")
          .eq("company_id", input.organizationId)
          .eq("normalized_sku", normalizedSku)
          .neq("id", input.itemId ?? "00000000-0000-0000-0000-000000000000")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (nameResponse.error) {
    throw new Error(`Unable to validate duplicate catalog item names: ${nameResponse.error.message}`);
  }

  if (skuResponse.error) {
    throw new Error(`Unable to validate duplicate catalog item SKUs: ${skuResponse.error.message}`);
  }

  if (nameResponse.data) {
    throw new Error("A cost item with this name already exists for the organization.");
  }

  if (skuResponse.data) {
    throw new Error("A cost item with this SKU already exists for the organization.");
  }
}

async function findTaxCodeDuplicate(input: {
  organizationId: string;
  taxCodeId?: string | null;
  name: string;
}) {
  const normalizedName = normalizeLookupText(input.name);

  if (!normalizedName) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("tax_codes")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("normalized_name", normalizedName)
    .neq("id", input.taxCodeId ?? "00000000-0000-0000-0000-000000000000")
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to validate duplicate tax codes: ${response.error.message}`);
  }

  if (response.data) {
    throw new Error("A tax code with this name already exists for the organization.");
  }
}

async function findInventoryItemDuplicates(input: {
  organizationId: string;
  inventoryItemId?: string | null;
  name: string;
  sku: string | null;
}) {
  const supabase = await getSupabaseServerClient();
  const normalizedName = normalizeLookupText(input.name);
  const normalizedSku = normalizeLookupText(input.sku);

  const [nameResponse, skuResponse] = await Promise.all([
    normalizedName
      ? supabase
          .from("inventory_items")
          .select("id")
          .eq("company_id", input.organizationId)
          .eq("normalized_name", normalizedName)
          .neq("id", input.inventoryItemId ?? "00000000-0000-0000-0000-000000000000")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    normalizedSku
      ? supabase
          .from("inventory_items")
          .select("id")
          .eq("company_id", input.organizationId)
          .eq("normalized_sku", normalizedSku)
          .neq("id", input.inventoryItemId ?? "00000000-0000-0000-0000-000000000000")
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  if (nameResponse.error) {
    throw new Error(
      `Unable to validate duplicate inventory item names: ${nameResponse.error.message}`
    );
  }

  if (skuResponse.error) {
    throw new Error(
      `Unable to validate duplicate inventory item SKUs: ${skuResponse.error.message}`
    );
  }

  if (nameResponse.data) {
    throw new Error("An inventory item with this name already exists for the organization.");
  }

  if (skuResponse.data) {
    throw new Error("An inventory item with this SKU already exists for the organization.");
  }
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
  inventoryItemId?: string | null;
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
  taxCodeId: string | null;
  vendorId: string | null;
  category: string | null;
  costCode: string | null;
  sku: string | null;
  photoStoragePath: string | null;
  status: "active" | "archived";
  isDefault: boolean;
  trackInventory: boolean;
  inventoryLocation: string;
  inventoryReorderPoint: string;
  inventoryAdjustmentQuantity: string | null;
  inventoryAdjustmentNote: string | null;
  submitMode: "save" | "adjust";
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();

  await findCatalogItemDuplicates({
    organizationId: scope.organizationId,
    itemId: input.itemId,
    name: input.name,
    sku: input.sku
  });

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
    tax_code_id: input.taxCodeId,
    vendor_id: input.vendorId,
    category: input.category,
    cost_code: input.costCode,
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

export async function syncCatalogItemInventoryTracking(input: {
  catalogItemId: string;
  inventoryItemId?: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unitOfMeasure: string;
  defaultUnitCost: string;
  taxable: boolean;
  trackInventory: boolean;
  reorderPoint: string;
  location: string;
  itemStatus: "active" | "archived";
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();

  const inventoryLookup = input.inventoryItemId
    ? await supabase
        .from("inventory_items")
        .select("*")
        .eq("company_id", scope.organizationId)
        .eq("id", input.inventoryItemId)
        .maybeSingle()
    : await supabase
        .from("inventory_items")
        .select("*")
        .eq("company_id", scope.organizationId)
        .eq("catalog_item_id", input.catalogItemId)
        .eq("location", input.location)
        .maybeSingle();

  if (inventoryLookup.error) {
    throw new Error(`Unable to load linked inventory tracking: ${inventoryLookup.error.message}`);
  }

  const existingInventory = inventoryLookup.data as InventoryItemRow | null;

  if (!input.trackInventory) {
    if (!existingInventory) {
      return null;
    }

    const archiveResponse = await supabase
      .from("inventory_items")
      .update({
        status: "archived",
        reorder_point: input.reorderPoint,
        location: input.location,
        updated_by: scope.userId
      })
      .eq("company_id", scope.organizationId)
      .eq("id", existingInventory.id)
      .select("*")
      .single();

    if (archiveResponse.error) {
      throw new Error(`Unable to disable linked inventory tracking: ${archiveResponse.error.message}`);
    }

    return mapInventoryItem(archiveResponse.data as InventoryItemRow);
  }

  const payload = {
    company_id: scope.organizationId,
    catalog_item_id: input.catalogItemId,
    location: input.location,
    name: input.name,
    sku: input.sku,
    description: input.description,
    category: input.category,
    unit_of_measure: input.unitOfMeasure,
    reorder_point: input.reorderPoint,
    default_unit_cost: input.defaultUnitCost,
    taxable: input.taxable,
    status: input.itemStatus,
    updated_by: scope.userId,
    created_by: scope.userId
  };

  const response = existingInventory
    ? await supabase
        .from("inventory_items")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", existingInventory.id)
        .select("*")
        .single()
    : await supabase.from("inventory_items").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(`Unable to save linked inventory tracking: ${response.error.message}`);
  }

  return mapInventoryItem(response.data as InventoryItemRow);
}

export async function recordCatalogItemInventoryAdjustment(input: {
  inventoryItemId: string;
  quantityChange: string | null;
  note: string | null;
}) {
  if (!input.quantityChange) {
    return null;
  }

  return upsertInventoryTransaction({
    inventoryItemId: input.inventoryItemId,
    transactionType: "adjustment",
    quantityChange: input.quantityChange,
    unitCost: null,
    referenceType: "catalog_item_manual_adjustment",
    referenceId: null,
    notes: input.note
  });
}

export const listTaxCodes = cache(async (): Promise<TaxCode[]> => {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("tax_codes")
    .select("*")
    .eq("company_id", scope.organizationId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load tax codes: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data) ? (response.data as TaxCodeRow[]) : [];
  return rows.map(mapTaxCode);
});

export async function upsertTaxCode(input: {
  taxCodeId?: string | null;
  name: string;
  rate: string;
  jurisdiction: string | null;
  active: boolean;
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();

  await findTaxCodeDuplicate({
    organizationId: scope.organizationId,
    taxCodeId: input.taxCodeId,
    name: input.name
  });

  const payload = {
    company_id: scope.organizationId,
    name: input.name,
    rate: input.rate,
    jurisdiction: input.jurisdiction,
    active: input.active,
    updated_by: scope.userId,
    created_by: scope.userId
  };

  const response = input.taxCodeId
    ? await supabase
        .from("tax_codes")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.taxCodeId)
        .select("*")
        .single()
    : await supabase.from("tax_codes").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(`Unable to save tax code: ${response.error.message}`);
  }

  return mapTaxCode(response.data as TaxCodeRow);
}

export const listInventoryItems = cache(async (): Promise<InventoryItem[]> => {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("inventory_items")
    .select("*")
    .eq("company_id", scope.organizationId)
    .order("status", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load inventory items: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data) ? (response.data as InventoryItemRow[]) : [];
  return rows.map(mapInventoryItem);
});

export const listInventoryTransactions = cache(async (): Promise<InventoryTransaction[]> => {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("inventory_transactions")
    .select("*")
    .eq("company_id", scope.organizationId)
    .order("created_at", { ascending: false });

  if (response.error) {
    throw new Error(`Unable to load inventory transactions: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data)
    ? (response.data as InventoryTransactionRow[])
    : [];
  return rows.map(mapInventoryTransaction);
});

export async function upsertInventoryItem(input: {
  inventoryItemId?: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unitOfMeasure: string;
  reorderPoint: string;
  defaultUnitCost: string;
  taxable: boolean;
  status: "active" | "archived";
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();

  await findInventoryItemDuplicates({
    organizationId: scope.organizationId,
    inventoryItemId: input.inventoryItemId,
    name: input.name,
    sku: input.sku
  });

  const payload = {
    company_id: scope.organizationId,
    name: input.name,
    sku: input.sku,
    description: input.description,
    category: input.category,
    unit_of_measure: input.unitOfMeasure,
    reorder_point: input.reorderPoint,
    default_unit_cost: input.defaultUnitCost,
    taxable: input.taxable,
    status: input.status,
    updated_by: scope.userId,
    created_by: scope.userId
  };

  const response = input.inventoryItemId
    ? await supabase
        .from("inventory_items")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.inventoryItemId)
        .select("*")
        .single()
    : await supabase.from("inventory_items").insert(payload).select("*").single();

  if (response.error) {
    throw new Error(`Unable to save inventory item: ${response.error.message}`);
  }

  return mapInventoryItem(response.data as InventoryItemRow);
}

export async function deleteInventoryItem(inventoryItemId: string) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("inventory_items")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("id", inventoryItemId);

  if (response.error) {
    throw new Error(`Unable to delete inventory item: ${response.error.message}`);
  }
}

export async function upsertInventoryTransaction(input: {
  transactionId?: string | null;
  inventoryItemId: string;
  transactionType:
    | "purchase"
    | "adjustment"
    | "job_usage"
    | "return"
    | "waste"
    | "transfer";
  quantityChange: string;
  unitCost: string | null;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
}) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const payload = {
    company_id: scope.organizationId,
    inventory_item_id: input.inventoryItemId,
    transaction_type: input.transactionType,
    quantity_change: input.quantityChange,
    unit_cost: input.unitCost,
    reference_type: input.referenceType,
    reference_id: input.referenceId,
    notes: input.notes,
    updated_by: scope.userId,
    created_by: scope.userId
  };

  const response = input.transactionId
    ? await supabase
        .from("inventory_transactions")
        .update(payload)
        .eq("company_id", scope.organizationId)
        .eq("id", input.transactionId)
        .select("*")
        .single()
    : await supabase
        .from("inventory_transactions")
        .insert(payload)
        .select("*")
        .single();

  if (response.error) {
    throw new Error(`Unable to save inventory transaction: ${response.error.message}`);
  }

  return mapInventoryTransaction(response.data as InventoryTransactionRow);
}

export async function deleteInventoryTransaction(transactionId: string) {
  const scope = await requireCatalogScope();
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("inventory_transactions")
    .delete()
    .eq("company_id", scope.organizationId)
    .eq("id", transactionId);

  if (response.error) {
    throw new Error(`Unable to delete inventory transaction: ${response.error.message}`);
  }
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

export async function listCatalogItemFiles(
  catalogItemId: string,
  next = "/cost-items-database"
): Promise<CatalogItemFile[]> {
  const scope = await requireCatalogScope(next);
  const supabase = await getSupabaseServerClient();
  const itemResponse = await supabase
    .from("catalog_items")
    .select("id, photo_storage_path")
    .eq("company_id", scope.organizationId)
    .eq("id", catalogItemId)
    .maybeSingle();

  if (itemResponse.error) {
    throw new Error(
      `Unable to load catalog item files: ${itemResponse.error.message}`
    );
  }

  if (!itemResponse.data) {
    return [];
  }

  const itemRecord = itemResponse.data as { id: string; photo_storage_path: string | null };
  const currentPhotoPath = itemRecord.photo_storage_path;

  const prefix = buildCatalogItemStoragePrefix(scope.organizationId, catalogItemId);
  const listResponse = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .list(prefix, {
      limit: 100,
      sortBy: { column: "name", order: "asc" }
    });

  if (listResponse.error) {
    throw new Error(`Unable to list catalog item files: ${listResponse.error.message}`);
  }

  const files = Array.isArray(listResponse.data) ? listResponse.data : [];

  const signedEntries = await Promise.all(
    files
      .filter((file) => file.name)
      .map(async (file) => {
        const path = `${prefix}/${file.name}`;
        const signedResponse = await supabase.storage
          .from(STORAGE_BUCKET_NAMES.documents)
          .createSignedUrl(path, 60 * 60);

        return [path, signedResponse.data?.signedUrl ?? null] as const;
      })
  );
  const signedUrlMap = new Map<string, string | null>(signedEntries);

  return files
    .filter((file) => file.name)
    .map((file) => {
      const path = `${prefix}/${file.name}`;

      return {
        name: file.name,
        path,
        mimeType: file.metadata?.mimetype ?? null,
        sizeBytes: typeof file.metadata?.size === "number" ? file.metadata.size : null,
        createdAt: file.created_at ?? null,
        updatedAt: file.updated_at ?? null,
        downloadUrl: signedUrlMap.get(path) ?? null,
        isPhoto: currentPhotoPath === path
      } satisfies CatalogItemFile;
    });
}

export async function uploadCatalogItemFiles(input: {
  catalogItemId: string;
  files: File[];
  photoFileName?: string | null;
  next?: string;
}) {
  if (input.files.length === 0) {
    return { uploadedPaths: [], photoStoragePath: null as string | null };
  }

  const scope = await requireCatalogScope(input.next ?? "/cost-items-database");
  const supabase = await getSupabaseServerClient();
  const prefix = buildCatalogItemStoragePrefix(scope.organizationId, input.catalogItemId);
  const uploadedPaths: string[] = [];
  let photoStoragePath: string | null = null;

  for (const file of input.files) {
    const timestamp = Date.now();
    const safeName = sanitizeCatalogFileName(file.name || "catalog-file");
    const storagePath = `${prefix}/${timestamp}-${safeName}`;
    const uploadResponse = await supabase.storage
      .from(STORAGE_BUCKET_NAMES.documents)
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false
      });

    if (uploadResponse.error) {
      throw new Error(`Unable to upload catalog item file: ${uploadResponse.error.message}`);
    }

    uploadedPaths.push(storagePath);

    if (input.photoFileName && file.name === input.photoFileName) {
      photoStoragePath = storagePath;
    }
  }

  return { uploadedPaths, photoStoragePath };
}

export async function replaceCatalogItemFiles(input: {
  catalogItemId: string;
  files: File[];
  replacedPaths?: string[];
  photoFileName?: string | null;
  next?: string;
}) {
  const uploaded = await uploadCatalogItemFiles({
    catalogItemId: input.catalogItemId,
    files: input.files,
    photoFileName: input.photoFileName,
    next: input.next
  });

  const pathsToDelete = (input.replacedPaths ?? []).filter(
    (filePath) => !uploaded.uploadedPaths.includes(filePath)
  );

  for (const filePath of pathsToDelete) {
    await deleteCatalogItemFile({
      catalogItemId: input.catalogItemId,
      filePath,
      next: input.next
    });
  }

  return uploaded;
}

export async function deleteCatalogItemFile(input: {
  catalogItemId: string;
  filePath: string;
  next?: string;
}) {
  const scope = await requireCatalogScope(input.next ?? "/cost-items-database");

  if (!input.filePath.startsWith(buildCatalogItemStoragePrefix(scope.organizationId, input.catalogItemId))) {
    throw new Error("Catalog item file path is outside the allowed storage prefix.");
  }

  const supabase = await getSupabaseServerClient();
  const removeResponse = await supabase.storage
    .from(STORAGE_BUCKET_NAMES.documents)
    .remove([input.filePath]);

  if (removeResponse.error) {
    throw new Error(`Unable to delete catalog item file: ${removeResponse.error.message}`);
  }

  const itemResponse = await supabase
    .from("catalog_items")
    .select("photo_storage_path")
    .eq("company_id", scope.organizationId)
    .eq("id", input.catalogItemId)
    .maybeSingle();

  if (!itemResponse.error && itemResponse.data?.photo_storage_path === input.filePath) {
    const clearResponse = await supabase
      .from("catalog_items")
      .update({ photo_storage_path: null, updated_by: scope.userId })
      .eq("company_id", scope.organizationId)
      .eq("id", input.catalogItemId);

    if (clearResponse.error) {
      throw new Error(`Unable to clear catalog item photo: ${clearResponse.error.message}`);
    }
  }
}
