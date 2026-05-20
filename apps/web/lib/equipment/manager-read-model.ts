import "server-only";

import { cache } from "react";
import type {
  EquipmentOperationalStatus,
  EquipmentOwnershipStatus,
  EquipmentType
} from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type EquipmentManagerView =
  | "all"
  | "available"
  | "rented"
  | "maintenance"
  | "inactive";

export type EquipmentManagerAsset = {
  id: string;
  name: string;
  vendorId: string | null;
  assetTag: string | null;
  serialNumber: string | null;
  equipmentType: EquipmentType;
  ownershipStatus: EquipmentOwnershipStatus;
  operationalStatus: EquipmentOperationalStatus;
  manufacturer: string | null;
  model: string | null;
  isActive: boolean;
  updatedAt: string;
};

export type EquipmentManagerReadModel = {
  assets: EquipmentManagerAsset[];
  counts: Record<EquipmentManagerView, number>;
  matchingCount: number;
  vendorNameById: Map<string, string>;
};

type EquipmentManagerAssetRow = {
  id: string;
  vendor_id: string | null;
  name: string;
  asset_tag: string | null;
  serial_number: string | null;
  equipment_type: EquipmentType;
  ownership_status: EquipmentOwnershipStatus;
  operational_status: EquipmentOperationalStatus;
  manufacturer: string | null;
  model: string | null;
  is_active: boolean;
  updated_at: string;
};

type EquipmentVendorNameRow = {
  id: string;
  name: string;
};

const equipmentManagerViews: EquipmentManagerView[] = [
  "all",
  "available",
  "rented",
  "maintenance",
  "inactive"
];

const equipmentManagerSelect = `
  id,
  vendor_id,
  name,
  asset_tag,
  serial_number,
  equipment_type,
  ownership_status,
  operational_status,
  manufacturer,
  model,
  is_active,
  updated_at
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function getEquipmentSearchPredicates(query?: string) {
  const trimmedQuery = query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);

  return [
    `name.ilike.%${escapedQuery}%`,
    `asset_tag.ilike.%${escapedQuery}%`,
    `serial_number.ilike.%${escapedQuery}%`,
    `manufacturer.ilike.%${escapedQuery}%`,
    `model.ilike.%${escapedQuery}%`,
    `equipment_type.ilike.%${escapedQuery}%`,
    `ownership_status.ilike.%${escapedQuery}%`,
    `operational_status.ilike.%${escapedQuery}%`
  ];
}

function mapEquipmentAsset(
  row: EquipmentManagerAssetRow
): EquipmentManagerAsset {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    name: row.name,
    assetTag: row.asset_tag,
    serialNumber: row.serial_number,
    equipmentType: row.equipment_type,
    ownershipStatus: row.ownership_status,
    operationalStatus: row.operational_status,
    manufacturer: row.manufacturer,
    model: row.model,
    isActive: row.is_active,
    updatedAt: row.updated_at
  };
}

function applyEquipmentViewFilter<
  T extends { eq: (column: string, value: unknown) => T }
>(query: T, view?: EquipmentManagerView) {
  if (view === "available") {
    return query.eq("is_active", true).eq("operational_status", "available");
  }

  if (view === "rented") {
    return query.eq("ownership_status", "rented");
  }

  if (view === "maintenance") {
    return query.eq("operational_status", "maintenance");
  }

  if (view === "inactive") {
    return query.eq("is_active", false);
  }

  return query;
}

async function countEquipmentAssets(input: {
  organizationId: string;
  view?: EquipmentManagerView;
  query?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = getEquipmentSearchPredicates(input.query);
  let query = supabase
    .from("equipment_assets")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  query = applyEquipmentViewFilter(query, input.view);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to count equipment assets: ${response.error.message}`
    );
  }

  return response.count ?? 0;
}

async function listEquipmentAssetsForManager(input: {
  organizationId: string;
  view?: EquipmentManagerView;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = getEquipmentSearchPredicates(input.query);
  let query = supabase
    .from("equipment_assets")
    .select(equipmentManagerSelect)
    .eq("company_id", input.organizationId)
    .order("name", { ascending: true })
    .limit(input.limit);

  query = applyEquipmentViewFilter(query, input.view);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load equipment manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as EquipmentManagerAssetRow[]).map(
        mapEquipmentAsset
      )
    : [];
}

async function getVendorNameById(input: {
  organizationId: string;
  vendorIds: string[];
}) {
  const uniqueVendorIds = [...new Set(input.vendorIds)].filter(Boolean);
  const vendorNameById = new Map<string, string>();

  if (uniqueVendorIds.length === 0) {
    return vendorNameById;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select("id, name")
    .eq("company_id", input.organizationId)
    .in("id", uniqueVendorIds);

  if (response.error) {
    throw new Error(
      `Unable to load equipment vendor labels: ${response.error.message}`
    );
  }

  const rows = Array.isArray(response.data)
    ? (response.data as unknown as EquipmentVendorNameRow[])
    : [];

  for (const row of rows) {
    vendorNameById.set(row.id, row.name);
  }

  return vendorNameById;
}

export const getEquipmentManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: EquipmentManagerView;
    query?: string;
  }): Promise<EquipmentManagerReadModel> => {
    const [
      allCount,
      availableCount,
      rentedCount,
      maintenanceCount,
      inactiveCount
    ] = await Promise.all([
      countEquipmentAssets({ organizationId: input.organizationId }),
      countEquipmentAssets({
        organizationId: input.organizationId,
        view: "available"
      }),
      countEquipmentAssets({
        organizationId: input.organizationId,
        view: "rented"
      }),
      countEquipmentAssets({
        organizationId: input.organizationId,
        view: "maintenance"
      }),
      countEquipmentAssets({
        organizationId: input.organizationId,
        view: "inactive"
      })
    ]);

    const [matchingCount, assets] = await Promise.all([
      countEquipmentAssets({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query
      }),
      listEquipmentAssetsForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 30
      })
    ]);
    const vendorNameById = await getVendorNameById({
      organizationId: input.organizationId,
      vendorIds: assets
        .map((asset) => asset.vendorId)
        .filter(Boolean) as string[]
    });

    return {
      assets,
      counts: {
        all: allCount,
        available: availableCount,
        rented: rentedCount,
        maintenance: maintenanceCount,
        inactive: inactiveCount
      },
      matchingCount,
      vendorNameById
    };
  }
);

export function isEquipmentManagerView(
  value: string | null | undefined
): value is EquipmentManagerView {
  return equipmentManagerViews.includes(value as EquipmentManagerView);
}
