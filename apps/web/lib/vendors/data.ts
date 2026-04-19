import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Vendor as VendorRecord } from "@floorconnector/types";

import type { VendorInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type VendorRow = {
  id: string;
  company_id: string;
  name: string;
  vendor_type: VendorRecord["vendorType"];
  is_labor_provider: boolean;
  primary_contact_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  tax_identifier_last4: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type VendorScope = {
  userId: string;
  organizationId: string;
};

const vendorSelect = `
  id,
  company_id,
  name,
  vendor_type,
  is_labor_provider,
  primary_contact_name,
  email,
  phone,
  address_line_1,
  address_line_2,
  city,
  state_region,
  postal_code,
  country_code,
  tax_identifier_last4,
  notes,
  is_active,
  created_at,
  updated_at
`;

function isVendorRow(value: unknown): value is VendorRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<VendorRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.name === "string" &&
    typeof row.vendor_type === "string" &&
    typeof row.is_labor_provider === "boolean" &&
    typeof row.is_active === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isVendorRowArray(value: unknown): value is VendorRow[] {
  return Array.isArray(value) && value.every((row) => isVendorRow(row));
}

function mapVendor(row: VendorRow): VendorRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    name: row.name,
    vendorType: row.vendor_type,
    isLaborProvider: row.is_labor_provider,
    primaryContactName: row.primary_contact_name,
    email: row.email,
    phone: row.phone,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    taxIdentifierLast4: row.tax_identifier_last4,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getVendorScope(next = "/vendors"): Promise<VendorScope | null> {
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

export async function requireVendorScope(next = "/vendors") {
  const scope = await getVendorScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for vendor records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

export const listVendors = cache(async () => {
  const scope = await requireVendorScope("/vendors");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select(vendorSelect)
    .eq("company_id", scope.organizationId)
    .order("name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load vendors: ${response.error.message}`);
  }

  if (!isVendorRowArray(data)) {
    return [];
  }

  return data.map(mapVendor);
});

export async function getVendorById(vendorId: string, next = "/vendors") {
  const scope = await requireVendorScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select(vendorSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", vendorId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the vendor: ${response.error.message}`);
  }

  if (!isVendorRow(data)) {
    return null;
  }

  return mapVendor(data);
}

export async function createVendor(input: VendorInput) {
  const scope = await requireVendorScope("/vendors");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .insert({
      company_id: scope.organizationId,
      name: input.name,
      vendor_type: input.vendorType,
      is_labor_provider: input.isLaborProvider,
      primary_contact_name: input.primaryContactName,
      email: input.email,
      phone: input.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      tax_identifier_last4: input.taxIdentifierLast4,
      notes: input.notes,
      is_active: input.isActive,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(vendorSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the vendor: ${response.error.message}`);
  }

  if (!isVendorRow(data)) {
    throw new Error("Unexpected vendor response after create.");
  }

  return mapVendor(data);
}

export async function updateVendor(vendorId: string, input: VendorInput) {
  const scope = await requireVendorScope(`/vendors/${vendorId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .update({
      name: input.name,
      vendor_type: input.vendorType,
      is_labor_provider: input.isLaborProvider,
      primary_contact_name: input.primaryContactName,
      email: input.email,
      phone: input.phone,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      tax_identifier_last4: input.taxIdentifierLast4,
      notes: input.notes,
      is_active: input.isActive,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", vendorId)
    .select(vendorSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the vendor: ${response.error.message}`);
  }

  if (!isVendorRow(data)) {
    throw new Error("Vendor not found for this organization.");
  }

  return mapVendor(data);
}
