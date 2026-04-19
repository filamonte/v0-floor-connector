import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Person as PersonRecord } from "@floorconnector/types";

import type { PersonInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PersonRow = {
  id: string;
  company_id: string;
  membership_user_id: string | null;
  vendor_id: string | null;
  person_type: PersonRecord["personType"];
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  trade: string | null;
  classification: string | null;
  is_assignable: boolean;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vendors?:
    | {
        id: string;
        name: string;
        vendor_type: string;
        is_labor_provider: boolean;
      }
    | null;
  users?:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
};

type PeopleScope = {
  userId: string;
  organizationId: string;
};

export type PersonListItem = PersonRecord & {
  vendor: {
    id: string;
    name: string;
    vendorType: string;
    isLaborProvider: boolean;
  } | null;
  linkedUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

const personSelect = `
  id,
  company_id,
  membership_user_id,
  vendor_id,
  person_type,
  display_name,
  first_name,
  last_name,
  email,
  phone,
  job_title,
  trade,
  classification,
  is_assignable,
  is_active,
  notes,
  created_at,
  updated_at,
  vendors (
    id,
    name,
    vendor_type,
    is_labor_provider
  ),
  users (
    id,
    email,
    full_name
  )
`;

function isPersonRow(value: unknown): value is PersonRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PersonRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.person_type === "string" &&
    typeof row.display_name === "string" &&
    typeof row.is_assignable === "boolean" &&
    typeof row.is_active === "boolean" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPersonRowArray(value: unknown): value is PersonRow[] {
  return Array.isArray(value) && value.every((row) => isPersonRow(row));
}

function mapPerson(row: PersonRow): PersonRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    membershipUserId: row.membership_user_id,
    vendorId: row.vendor_id,
    personType: row.person_type,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    jobTitle: row.job_title,
    trade: row.trade,
    classification: row.classification,
    isAssignable: row.is_assignable,
    isActive: row.is_active,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPersonListItem(row: PersonRow): PersonListItem {
  return {
    ...mapPerson(row),
    vendor: row.vendors
      ? {
          id: row.vendors.id,
          name: row.vendors.name,
          vendorType: row.vendors.vendor_type,
          isLaborProvider: row.vendors.is_labor_provider
        }
      : null,
    linkedUser: row.users
      ? {
          id: row.users.id,
          email: row.users.email,
          fullName: row.users.full_name
        }
      : null
  };
}

async function getPeopleScope(next = "/people"): Promise<PeopleScope | null> {
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

export async function requirePeopleScope(next = "/people") {
  const scope = await getPeopleScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for workforce records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

export const listPeople = cache(async () => {
  const scope = await requirePeopleScope("/people");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select(personSelect)
    .eq("company_id", scope.organizationId)
    .order("display_name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load workforce records: ${response.error.message}`);
  }

  if (!isPersonRowArray(data)) {
    return [];
  }

  return data.map(mapPersonListItem);
});

export async function getPersonById(personId: string, next = "/people") {
  const scope = await requirePeopleScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select(personSelect)
    .eq("company_id", scope.organizationId)
    .eq("id", personId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the workforce record: ${response.error.message}`);
  }

  if (!isPersonRow(data)) {
    return null;
  }

  return mapPersonListItem(data);
}

async function ensureScopedVendor(organizationId: string, vendorId: string | null) {
  if (!vendorId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("vendors")
    .select("id, is_labor_provider")
    .eq("company_id", organizationId)
    .eq("id", vendorId)
    .maybeSingle();
  const data = response.data as { id?: string; is_labor_provider?: boolean } | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked vendor: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Vendor not found for this organization.");
  }

  if (!data.is_labor_provider) {
    throw new Error("Only labor-provider vendors can be linked to subcontractor workers.");
  }

  return data;
}

async function ensureScopedLinkedUser(linkedUserId: string | null) {
  if (!linkedUserId) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("users")
    .select("id")
    .eq("id", linkedUserId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the linked user: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Linked user not found.");
  }

  return data;
}

export async function createPerson(input: PersonInput) {
  const scope = await requirePeopleScope("/people");

  await Promise.all([
    ensureScopedVendor(scope.organizationId, input.vendorId),
    ensureScopedLinkedUser(input.membershipUserId)
  ]);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .insert({
      company_id: scope.organizationId,
      membership_user_id: input.membershipUserId,
      vendor_id: input.vendorId,
      person_type: input.personType,
      display_name: input.displayName,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      job_title: input.jobTitle,
      trade: input.trade,
      classification: input.classification,
      is_assignable: input.isAssignable,
      is_active: input.isActive,
      notes: input.notes,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(personSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to create the workforce record: ${response.error.message}`);
  }

  if (!isPersonRow(data)) {
    throw new Error("Unexpected workforce response after create.");
  }

  return mapPersonListItem(data);
}

export async function updatePerson(personId: string, input: PersonInput) {
  const scope = await requirePeopleScope(`/people/${personId}`);

  await Promise.all([
    ensureScopedVendor(scope.organizationId, input.vendorId),
    ensureScopedLinkedUser(input.membershipUserId)
  ]);

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .update({
      membership_user_id: input.membershipUserId,
      vendor_id: input.vendorId,
      person_type: input.personType,
      display_name: input.displayName,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      job_title: input.jobTitle,
      trade: input.trade,
      classification: input.classification,
      is_assignable: input.isAssignable,
      is_active: input.isActive,
      notes: input.notes,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", personId)
    .select(personSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update the workforce record: ${response.error.message}`);
  }

  if (!isPersonRow(data)) {
    throw new Error("Workforce record not found for this organization.");
  }

  return mapPersonListItem(data);
}
