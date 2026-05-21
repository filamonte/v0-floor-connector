import "server-only";

import { cache } from "react";
import type { VendorType } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type VendorsManagerView = "all" | "labor" | "active";

export type VendorsManagerVendor = {
  id: string;
  name: string;
  vendorType: VendorType;
  isLaborProvider: boolean;
  primaryContactName: string | null;
  email: string | null;
  city: string | null;
  stateRegion: string | null;
  isActive: boolean;
};

export type VendorsManagerReadModel = {
  vendors: VendorsManagerVendor[];
  counts: Record<VendorsManagerView, number>;
  matchingCount: number;
  linkedPeopleCountByVendorId: Map<string, number>;
  complianceCountByVendorId: Map<string, number>;
};

type VendorsManagerVendorRow = {
  id: string;
  name: string;
  vendor_type: VendorType;
  is_labor_provider: boolean;
  primary_contact_name: string | null;
  email: string | null;
  city: string | null;
  state_region: string | null;
  is_active: boolean;
};

type VendorLinkedPersonCountRow = {
  vendor_id: string | null;
};

type VendorComplianceCountRow = {
  subject_id: string;
};

const vendorsManagerViews: VendorsManagerView[] = ["all", "labor", "active"];

const vendorsManagerSelect = `
  id,
  name,
  vendor_type,
  is_labor_provider,
  primary_contact_name,
  email,
  city,
  state_region,
  is_active
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function getVendorSearchPredicates(query?: string) {
  const trimmedQuery = query?.trim() ?? "";

  if (trimmedQuery.length === 0) {
    return [];
  }

  const escapedQuery = escapeLikePattern(trimmedQuery);

  return [
    `name.ilike.%${escapedQuery}%`,
    `primary_contact_name.ilike.%${escapedQuery}%`,
    `email.ilike.%${escapedQuery}%`,
    `city.ilike.%${escapedQuery}%`,
    `state_region.ilike.%${escapedQuery}%`,
    `vendor_type.ilike.%${escapedQuery}%`
  ];
}

function mapVendor(row: VendorsManagerVendorRow): VendorsManagerVendor {
  return {
    id: row.id,
    name: row.name,
    vendorType: row.vendor_type,
    isLaborProvider: row.is_labor_provider,
    primaryContactName: row.primary_contact_name,
    email: row.email,
    city: row.city,
    stateRegion: row.state_region,
    isActive: row.is_active
  };
}

function applyVendorViewFilter<
  T extends { eq: (column: string, value: unknown) => T }
>(query: T, view?: VendorsManagerView) {
  if (view === "labor") {
    return query.eq("is_labor_provider", true);
  }

  if (view === "active") {
    return query.eq("is_active", true);
  }

  return query;
}

async function countVendors(input: {
  organizationId: string;
  view?: VendorsManagerView;
  query?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = getVendorSearchPredicates(input.query);
  let query = supabase
    .from("vendors")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  query = applyVendorViewFilter(query, input.view);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count vendors: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function listVendorsForManager(input: {
  organizationId: string;
  view?: VendorsManagerView;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const searchPredicates = getVendorSearchPredicates(input.query);
  let query = supabase
    .from("vendors")
    .select(vendorsManagerSelect)
    .eq("company_id", input.organizationId)
    .order("name", { ascending: true })
    .limit(input.limit);

  query = applyVendorViewFilter(query, input.view);

  if (searchPredicates.length > 0) {
    query = query.or(searchPredicates.join(","));
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load vendors manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as unknown as VendorsManagerVendorRow[]).map(mapVendor)
    : [];
}

async function getLinkedPeopleCountByVendorId(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("vendor_id")
    .eq("company_id", organizationId)
    .not("vendor_id", "is", null);

  if (response.error) {
    throw new Error(
      `Unable to load vendor linked-worker count inputs: ${response.error.message}`
    );
  }

  const countByVendorId = new Map<string, number>();
  const rows = Array.isArray(response.data)
    ? (response.data as unknown as VendorLinkedPersonCountRow[])
    : [];

  for (const row of rows) {
    if (!row.vendor_id) {
      continue;
    }

    countByVendorId.set(
      row.vendor_id,
      (countByVendorId.get(row.vendor_id) ?? 0) + 1
    );
  }

  return countByVendorId;
}

async function getComplianceCountByVendorId(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("compliance_records")
    .select("subject_id")
    .eq("company_id", organizationId)
    .eq("subject_type", "vendor");

  if (response.error) {
    throw new Error(
      `Unable to load vendor compliance count inputs: ${response.error.message}`
    );
  }

  const countByVendorId = new Map<string, number>();
  const rows = Array.isArray(response.data)
    ? (response.data as unknown as VendorComplianceCountRow[])
    : [];

  for (const row of rows) {
    countByVendorId.set(
      row.subject_id,
      (countByVendorId.get(row.subject_id) ?? 0) + 1
    );
  }

  return countByVendorId;
}

export const getVendorsManagerReadModel = cache(
  async (input: {
    organizationId: string;
    view?: VendorsManagerView;
    query?: string;
  }): Promise<VendorsManagerReadModel> => {
    const [
      allCount,
      laborCount,
      activeCount,
      matchingCount,
      vendors,
      linkedPeopleCountByVendorId,
      complianceCountByVendorId
    ] = await Promise.all([
      countVendors({ organizationId: input.organizationId }),
      countVendors({ organizationId: input.organizationId, view: "labor" }),
      countVendors({ organizationId: input.organizationId, view: "active" }),
      countVendors({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query
      }),
      listVendorsForManager({
        organizationId: input.organizationId,
        view: input.view,
        query: input.query,
        limit: 20
      }),
      getLinkedPeopleCountByVendorId(input.organizationId),
      getComplianceCountByVendorId(input.organizationId)
    ]);

    return {
      vendors,
      counts: {
        all: allCount,
        labor: laborCount,
        active: activeCount
      },
      matchingCount,
      linkedPeopleCountByVendorId,
      complianceCountByVendorId
    };
  }
);

export function isVendorsManagerView(
  value: string | null | undefined
): value is VendorsManagerView {
  return vendorsManagerViews.includes(value as VendorsManagerView);
}
