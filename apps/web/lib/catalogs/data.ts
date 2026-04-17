import "server-only";

import { cache } from "react";
import type { CatalogItem, PlatformCatalogItemSeed } from "@floorconnector/types";

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
  item_type: "material" | "service" | "system";
  name: string;
  description: string | null;
  unit: string;
  default_unit_price: string | number;
  status: "active" | "archived";
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PlatformCatalogItemSeedRow = {
  id: string;
  item_type: "material" | "service" | "system";
  seed_key: string;
  name: string;
  description: string | null;
  unit: string;
  default_unit_price: string | number;
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function mapCatalogItem(row: CatalogItemRow): CatalogItem {
  return {
    id: row.id,
    organizationId: row.company_id,
    sourceSeedId: row.source_seed_id,
    sourceSeedKey: row.source_seed_key,
    itemType: row.item_type,
    name: row.name,
    description: row.description,
    unit: row.unit,
    defaultUnitPrice: Number(row.default_unit_price).toFixed(2),
    status: row.status,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
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
    unit: row.unit,
    defaultUnitPrice: Number(row.default_unit_price).toFixed(2),
    isActive: row.is_active,
    isDefault: row.is_default,
    metadata: row.metadata ?? {},
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
  const response = await supabase
    .from("catalog_items")
    .select("*")
    .eq("company_id", scope.organizationId)
    .order("item_type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load catalog items: ${response.error.message}`);
  }

  const rows = Array.isArray(response.data) ? (response.data as CatalogItemRow[]) : [];
  return rows.map(mapCatalogItem);
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
  itemType: "material" | "service" | "system";
  name: string;
  description: string | null;
  unit: string;
  defaultUnitPrice: string;
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
    unit: input.unit,
    default_unit_price: input.defaultUnitPrice,
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
