import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Customer as CustomerRecord } from "@floorconnector/types";

import type { CustomerInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CustomerRow = {
  id: string;
  company_id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerScope = {
  userId: string;
  organizationId: string;
};

function isCustomerRow(value: unknown): value is CustomerRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CustomerRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.name === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isCustomerRowArray(value: unknown): value is CustomerRow[] {
  return Array.isArray(value) && value.every((row) => isCustomerRow(row));
}

function mapCustomer(row: CustomerRow): CustomerRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    name: row.name,
    companyName: row.company_name,
    phone: row.phone,
    email: row.email,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getCustomerScope(next = "/customers"): Promise<CustomerScope | null> {
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

export async function requireCustomerScope(next = "/customers") {
  const scope = await getCustomerScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for customer records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

export const listCustomers = cache(async () => {
  const scope = await requireCustomerScope("/customers");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select(
      `
        id,
        company_id,
        name,
        company_name,
        phone,
        email,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        notes,
        created_at,
        updated_at
      `
    )
    .eq("company_id", scope.organizationId)
    .order("name", { ascending: true });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load customers: ${error.message}`);
  }

  if (!isCustomerRowArray(data)) {
    return [];
  }

  return data.map(mapCustomer);
});

export async function getCustomerById(customerId: string, next = "/customers") {
  const scope = await requireCustomerScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select(
      `
        id,
        company_id,
        name,
        company_name,
        phone,
        email,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        notes,
        created_at,
        updated_at
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("id", customerId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the customer: ${error.message}`);
  }

  if (!isCustomerRow(data)) {
    return null;
  }

  return mapCustomer(data);
}

export async function createCustomer(input: CustomerInput) {
  const scope = await requireCustomerScope("/customers");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .insert({
      company_id: scope.organizationId,
      name: input.name,
      company_name: input.companyName,
      phone: input.phone,
      email: input.email,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(
      `
        id,
        company_id,
        name,
        company_name,
        phone,
        email,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        notes,
        created_at,
        updated_at
      `
    )
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to create the customer: ${error.message}`);
  }

  if (!isCustomerRow(data)) {
    throw new Error("Unexpected customer response after create.");
  }

  return mapCustomer(data);
}

export async function updateCustomer(customerId: string, input: CustomerInput) {
  const scope = await requireCustomerScope(`/customers/${customerId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .update({
      name: input.name,
      company_name: input.companyName,
      phone: input.phone,
      email: input.email,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", customerId)
    .select(
      `
        id,
        company_id,
        name,
        company_name,
        phone,
        email,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        notes,
        created_at,
        updated_at
      `
    )
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the customer: ${error.message}`);
  }

  if (!isCustomerRow(data)) {
    throw new Error("Customer not found for this organization.");
  }

  return mapCustomer(data);
}
