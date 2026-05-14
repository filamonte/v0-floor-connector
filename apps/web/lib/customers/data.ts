import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Customer as CustomerRecord } from "@floorconnector/types";

import type { CustomerInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ensurePrimaryCustomerContact } from "./primary-contact";

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
  is_tax_exempt: boolean;
  tax_exemption_reason: string | null;
  tax_exemption_reference: string | null;
  tax_exemption_expires_on: string | null;
  retainage_percentage_default: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerScope = {
  userId: string;
  organizationId: string;
};

const customerSelect = `
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
  is_tax_exempt,
  tax_exemption_reason,
  tax_exemption_reference,
  tax_exemption_expires_on,
  retainage_percentage_default,
  notes,
  created_at,
  updated_at
`;

function isCustomerRow(value: unknown): value is CustomerRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<CustomerRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.name === "string" &&
    typeof row.is_tax_exempt === "boolean" &&
    (typeof row.retainage_percentage_default === "string" ||
      typeof row.retainage_percentage_default === "number") &&
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
    isTaxExempt: row.is_tax_exempt,
    taxExemptionReason: row.tax_exemption_reason,
    taxExemptionReference: row.tax_exemption_reference,
    taxExemptionExpiresOn: row.tax_exemption_expires_on,
    retainagePercentageDefault: Number(row.retainage_percentage_default).toFixed(2),
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
    .select(customerSelect)
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
    .select(customerSelect)
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

export async function createCustomer(
  input: CustomerInput,
  options?: { primaryContactSource?: "customer_create" | "project_inline_customer" }
) {
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
      is_tax_exempt: input.isTaxExempt,
      tax_exemption_reason: input.taxExemptionReason,
      tax_exemption_reference: input.taxExemptionReference,
      tax_exemption_expires_on: input.taxExemptionExpiresOn,
      retainage_percentage_default: input.retainagePercentageDefault,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(customerSelect)
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to create the customer: ${error.message}`);
  }

  if (!isCustomerRow(data)) {
    throw new Error("Unexpected customer response after create.");
  }

  const customer = mapCustomer(data);

  await ensurePrimaryCustomerContact({
    organizationId: scope.organizationId,
    userId: scope.userId,
    customerId: customer.id,
    name: customer.name,
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone,
    source: options?.primaryContactSource ?? "customer_create"
  });

  return customer;
}

export async function createCustomerFromPrimaryContact(input: {
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  source?: "project_inline_customer";
}) {
  const scope = await requireCustomerScope("/customers");
  const financialSettings = await getOrganizationFinancialSettings(scope.organizationId);

  return createCustomer(
    {
      name: input.name,
      companyName: input.companyName,
      phone: input.phone,
      email: input.email,
      addressLine1: input.addressLine1 ?? null,
      addressLine2: input.addressLine2 ?? null,
      city: input.city ?? null,
      stateRegion: input.stateRegion ?? null,
      postalCode: input.postalCode ?? null,
      countryCode: input.countryCode ?? null,
      isTaxExempt: false,
      taxExemptionReason: null,
      taxExemptionReference: null,
      taxExemptionExpiresOn: null,
      retainagePercentageDefault: financialSettings.defaultRetainagePercentage,
      notes: null
    },
    {
      primaryContactSource: input.source ?? "project_inline_customer"
    }
  );
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
      is_tax_exempt: input.isTaxExempt,
      tax_exemption_reason: input.taxExemptionReason,
      tax_exemption_reference: input.taxExemptionReference,
      tax_exemption_expires_on: input.taxExemptionExpiresOn,
      retainage_percentage_default: input.retainagePercentageDefault,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", customerId)
    .select(customerSelect)
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
