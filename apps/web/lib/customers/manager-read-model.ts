import "server-only";

import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CustomersManagerCustomer = {
  id: string;
  name: string;
  companyName: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  stateRegion: string | null;
  postalCode: string | null;
  isTaxExempt: boolean;
  taxExemptionReason: string | null;
  taxExemptionReference: string | null;
  retainagePercentageDefault: string;
  updatedAt: string;
  linkedProjectCount: number;
};

export type CustomersManagerReadModel = {
  customers: CustomersManagerCustomer[];
  taxExemptCustomers: CustomersManagerCustomer[];
  customersMissingContact: CustomersManagerCustomer[];
  customersMissingAddress: CustomersManagerCustomer[];
  customersWithProjects: CustomersManagerCustomer[];
  counts: {
    total: number;
    taxExempt: number;
    directContactSaved: number;
    savedAddress: number;
  };
};

type CustomerManagerRow = {
  id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address_line_1: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  is_tax_exempt: boolean;
  tax_exemption_reason: string | null;
  tax_exemption_reference: string | null;
  retainage_percentage_default: string | number;
  updated_at: string;
};

type ProjectCustomerIdRow = {
  customer_id: string;
};

const customersManagerSelect = `
  id,
  name,
  company_name,
  phone,
  email,
  address_line_1,
  city,
  state_region,
  postal_code,
  is_tax_exempt,
  tax_exemption_reason,
  tax_exemption_reference,
  retainage_percentage_default,
  updated_at
`;

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapCustomer(
  row: CustomerManagerRow,
  projectCounts: Map<string, number>
): CustomersManagerCustomer {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company_name,
    phone: row.phone,
    email: row.email,
    addressLine1: row.address_line_1,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    isTaxExempt: row.is_tax_exempt,
    taxExemptionReason: row.tax_exemption_reason,
    taxExemptionReference: row.tax_exemption_reference,
    retainagePercentageDefault: Number(
      row.retainage_percentage_default
    ).toFixed(2),
    updatedAt: row.updated_at,
    linkedProjectCount: projectCounts.get(row.id) ?? 0
  };
}

async function countCustomers(input: {
  organizationId: string;
  taxExemptOnly?: boolean;
  directContactOnly?: boolean;
  savedAddressOnly?: boolean;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.organizationId);

  if (input.taxExemptOnly) {
    query = query.eq("is_tax_exempt", true);
  }

  if (input.directContactOnly) {
    query = query.or("email.not.is.null,phone.not.is.null");
  }

  if (input.savedAddressOnly) {
    query = query.or(
      "address_line_1.not.is.null,city.not.is.null,state_region.not.is.null,postal_code.not.is.null"
    );
  }

  const response = await query;

  if (response.error) {
    throw new Error(`Unable to count customers: ${response.error.message}`);
  }

  return response.count ?? 0;
}

async function listProjectCustomerCounts(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("customer_id")
    .eq("company_id", organizationId);

  if (response.error) {
    throw new Error(
      `Unable to load customer project summary counts: ${response.error.message}`
    );
  }

  const counts = new Map<string, number>();
  const rows = Array.isArray(response.data)
    ? (response.data as ProjectCustomerIdRow[])
    : [];

  for (const row of rows) {
    counts.set(row.customer_id, (counts.get(row.customer_id) ?? 0) + 1);
  }

  return counts;
}

async function listCustomersForManager(input: {
  organizationId: string;
  projectCounts: Map<string, number>;
  query?: string;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  const trimmedQuery = input.query?.trim() ?? "";
  const escapedQuery =
    trimmedQuery.length > 0 ? escapeLikePattern(trimmedQuery) : "";
  let query = supabase
    .from("customers")
    .select(customersManagerSelect)
    .eq("company_id", input.organizationId)
    .order("updated_at", { ascending: false })
    .limit(input.limit);

  if (escapedQuery.length > 0) {
    query = query.or(
      [
        `name.ilike.%${escapedQuery}%`,
        `company_name.ilike.%${escapedQuery}%`,
        `email.ilike.%${escapedQuery}%`,
        `phone.ilike.%${escapedQuery}%`,
        `city.ilike.%${escapedQuery}%`,
        `state_region.ilike.%${escapedQuery}%`
      ].join(",")
    );
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load customers manager rows: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as CustomerManagerRow[]).map((row) =>
        mapCustomer(row, input.projectCounts)
      )
    : [];
}

async function listCustomerQueue(input: {
  organizationId: string;
  projectCounts: Map<string, number>;
  taxExemptOnly?: boolean;
  missingContactOnly?: boolean;
  missingAddressOnly?: boolean;
  linkedProjectOnly?: boolean;
  limit: number;
}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("customers")
    .select(customersManagerSelect)
    .eq("company_id", input.organizationId)
    .order("name", { ascending: true })
    .limit(input.limit);

  if (input.taxExemptOnly) {
    query = query.eq("is_tax_exempt", true);
  }

  if (input.missingContactOnly) {
    query = query.is("email", null).is("phone", null);
  }

  if (input.missingAddressOnly) {
    query = query
      .is("address_line_1", null)
      .is("city", null)
      .is("state_region", null)
      .is("postal_code", null);
  }

  if (input.linkedProjectOnly) {
    const linkedCustomerIds = [...input.projectCounts.keys()];

    if (linkedCustomerIds.length === 0) {
      return [];
    }

    query = query.in("id", linkedCustomerIds);
  }

  const response = await query;

  if (response.error) {
    throw new Error(
      `Unable to load customers manager queue: ${response.error.message}`
    );
  }

  return Array.isArray(response.data)
    ? (response.data as CustomerManagerRow[]).map((row) =>
        mapCustomer(row, input.projectCounts)
      )
    : [];
}

export const getCustomersManagerReadModel = cache(
  async (input: {
    organizationId: string;
    query?: string;
  }): Promise<CustomersManagerReadModel> => {
    const projectCounts = await listProjectCustomerCounts(input.organizationId);
    const [
      totalCount,
      taxExemptCount,
      directContactCount,
      savedAddressCount,
      customers,
      taxExemptCustomers,
      customersMissingContact,
      customersMissingAddress,
      customersWithProjects
    ] = await Promise.all([
      countCustomers({ organizationId: input.organizationId }),
      countCustomers({
        organizationId: input.organizationId,
        taxExemptOnly: true
      }),
      countCustomers({
        organizationId: input.organizationId,
        directContactOnly: true
      }),
      countCustomers({
        organizationId: input.organizationId,
        savedAddressOnly: true
      }),
      listCustomersForManager({
        organizationId: input.organizationId,
        projectCounts,
        query: input.query,
        limit: 20
      }),
      listCustomerQueue({
        organizationId: input.organizationId,
        projectCounts,
        taxExemptOnly: true,
        limit: 4
      }),
      listCustomerQueue({
        organizationId: input.organizationId,
        projectCounts,
        missingContactOnly: true,
        limit: 4
      }),
      listCustomerQueue({
        organizationId: input.organizationId,
        projectCounts,
        missingAddressOnly: true,
        limit: 4
      }),
      listCustomerQueue({
        organizationId: input.organizationId,
        projectCounts,
        linkedProjectOnly: true,
        limit: 4
      })
    ]);

    return {
      customers,
      taxExemptCustomers,
      customersMissingContact,
      customersMissingAddress,
      customersWithProjects,
      counts: {
        total: totalCount,
        taxExempt: taxExemptCount,
        directContactSaved: directContactCount,
        savedAddress: savedAddressCount
      }
    };
  }
);
