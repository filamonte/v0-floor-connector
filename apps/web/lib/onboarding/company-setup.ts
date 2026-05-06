import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type PrimaryLocation = {
  id: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string | null;
};

type LocationRow = {
  id: string;
  name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
};

function mapLocation(row: LocationRow): PrimaryLocation {
  return {
    id: row.id,
    name: row.name,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code
  };
}

export async function getPrimaryOrganizationLocation(organizationId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("locations")
    .select("id, name, address_line_1, address_line_2, city, state_region, postal_code, country_code")
    .eq("company_id", organizationId)
    .eq("is_primary", true)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load primary company location: ${response.error.message}`);
  }

  return response.data ? mapLocation(response.data as LocationRow) : null;
}

export async function saveCompanySetup(input: {
  organizationId: string;
  userId: string;
  legalName: string;
  displayName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  primaryTrade: string | null;
  brandAccentColor: string | null;
  timeZone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateRegion: string;
  postalCode: string;
}) {
  const supabase = getSupabaseAdminClient();
  const companyResponse = await supabase
    .from("companies")
    .update({
      legal_name: input.legalName,
      display_name: input.displayName,
      logo_url: input.logoUrl,
      phone: input.phone,
      email: input.email,
      website_url: input.websiteUrl,
      primary_trade: input.primaryTrade,
      brand_accent_color: input.brandAccentColor,
      time_zone: input.timeZone,
      updated_by: input.userId
    })
    .eq("id", input.organizationId);

  if (companyResponse.error) {
    throw new Error(`Unable to update company profile: ${companyResponse.error.message}`);
  }

  const existingLocation = await getPrimaryOrganizationLocation(input.organizationId);
  const locationPayload = {
    company_id: input.organizationId,
    name: "Primary location",
    location_type: "headquarters",
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    state_region: input.stateRegion,
    postal_code: input.postalCode,
    country_code: "US",
    is_primary: true,
    is_active: true,
    updated_by: input.userId
  };

  const locationResponse = existingLocation
    ? await supabase
        .from("locations")
        .update(locationPayload)
        .eq("company_id", input.organizationId)
        .eq("id", existingLocation.id)
    : await supabase.from("locations").insert({
        ...locationPayload,
        created_by: input.userId
      });

  if (locationResponse.error) {
    throw new Error(`Unable to save company location: ${locationResponse.error.message}`);
  }
}
