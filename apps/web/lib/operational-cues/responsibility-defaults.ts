import "server-only";

import type {
  OrganizationResponsibilityRoleDefault,
  OrganizationResponsibilityRoleKey
} from "@floorconnector/types";

import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { starterOperationalCueOwnerStrategies } from "./owner-strategies";

export type ResponsibilityDefaultPerson = {
  id: string;
  displayName: string;
  membershipUserId: string | null;
  isActive: boolean;
  isAssignable: boolean;
};

export type OrganizationResponsibilityDefault = OrganizationResponsibilityRoleDefault & {
  person: ResponsibilityDefaultPerson;
};

export type OperationalCueResponsibilityDefault = {
  roleKey: OrganizationResponsibilityRoleKey;
  personId: string;
  personDisplayName: string;
  membershipUserId: string | null;
  isActive: boolean;
  isAssignable: boolean;
};

type ResponsibilityDefaultRow = {
  id: string;
  organization_id: string;
  role_key: OrganizationResponsibilityRoleKey;
  person_id: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type AssignablePersonRow = {
  id: string;
  display_name: string;
  membership_user_id: string | null;
  is_active: boolean;
  is_assignable: boolean;
};

export const organizationResponsibilityRoleKeys =
  starterOperationalCueOwnerStrategies;

export function isOrganizationResponsibilityRoleKey(
  value: string
): value is OrganizationResponsibilityRoleKey {
  return organizationResponsibilityRoleKeys.includes(
    value as OrganizationResponsibilityRoleKey
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isAssignablePersonRow(value: unknown): value is AssignablePersonRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.display_name === "string" &&
    (value.membership_user_id === null ||
      typeof value.membership_user_id === "string") &&
    typeof value.is_active === "boolean" &&
    typeof value.is_assignable === "boolean"
  );
}

function isResponsibilityDefaultRow(
  value: unknown
): value is ResponsibilityDefaultRow {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.organization_id === "string" &&
    typeof value.role_key === "string" &&
    isOrganizationResponsibilityRoleKey(value.role_key) &&
    typeof value.person_id === "string" &&
    (value.created_by === null || typeof value.created_by === "string") &&
    (value.updated_by === null || typeof value.updated_by === "string") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function mapDefaultRow(
  row: ResponsibilityDefaultRow,
  person: AssignablePersonRow
): OrganizationResponsibilityDefault {
  return {
    id: row.id,
    organizationId: row.organization_id,
    roleKey: row.role_key,
    personId: row.person_id,
    createdByUserId: row.created_by,
    updatedByUserId: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    person: {
      id: person.id,
      displayName: person.display_name,
      membershipUserId: person.membership_user_id,
      isActive: person.is_active,
      isAssignable: person.is_assignable
    }
  };
}

async function listPeopleById(input: {
  organizationId: string;
  personIds: string[];
}) {
  if (input.personIds.length === 0) {
    return new Map<string, AssignablePersonRow>();
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, display_name, membership_user_id, is_active, is_assignable")
    .eq("company_id", input.organizationId)
    .in("id", input.personIds);
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load responsibility default people: ${response.error.message}`
    );
  }

  const rows = Array.isArray(data) ? data.filter(isAssignablePersonRow) : [];

  return new Map(rows.map((person) => [person.id, person]));
}

export function toOperationalCueResponsibilityDefaults(
  defaults: OrganizationResponsibilityDefault[]
): OperationalCueResponsibilityDefault[] {
  return defaults.map((defaultRole) => ({
    roleKey: defaultRole.roleKey,
    personId: defaultRole.personId,
    personDisplayName: defaultRole.person.displayName,
    membershipUserId: defaultRole.person.membershipUserId,
    isActive: defaultRole.person.isActive,
    isAssignable: defaultRole.person.isAssignable
  }));
}

export async function listOrganizationResponsibilityDefaults(
  organizationId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_responsibility_role_defaults")
    .select(
      "id, organization_id, role_key, person_id, created_by, updated_by, created_at, updated_at"
    )
    .eq("organization_id", organizationId)
    .order("role_key", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load organization responsibility defaults: ${response.error.message}`
    );
  }

  if (!Array.isArray(data)) {
    return [];
  }

  const rows = data.filter(isResponsibilityDefaultRow);
  const peopleById = await listPeopleById({
    organizationId,
    personIds: rows.map((row) => row.person_id)
  });

  return rows
    .map((row) => {
      const person = peopleById.get(row.person_id);
      return person ? mapDefaultRow(row, person) : null;
    })
    .filter((defaultRole): defaultRole is OrganizationResponsibilityDefault =>
      Boolean(defaultRole)
    );
}

export async function listAssignableResponsibilityPeople(
  organizationId: string
): Promise<ResponsibilityDefaultPerson[]> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, display_name, membership_user_id, is_active, is_assignable")
    .eq("company_id", organizationId)
    .eq("is_active", true)
    .eq("is_assignable", true)
    .order("display_name", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load assignable responsibility people: ${response.error.message}`
    );
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isAssignablePersonRow).map((person) => ({
    id: person.id,
    displayName: person.display_name,
    membershipUserId: person.membership_user_id,
    isActive: person.is_active,
    isAssignable: person.is_assignable
  }));
}

async function ensureAssignablePerson(input: {
  organizationId: string;
  personId: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("people")
    .select("id, display_name, membership_user_id, is_active, is_assignable")
    .eq("company_id", input.organizationId)
    .eq("id", input.personId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to validate responsible person: ${response.error.message}`);
  }

  if (!isAssignablePersonRow(data)) {
    throw new Error("Responsible person was not found for this organization.");
  }

  if (!data.is_active || !data.is_assignable) {
    throw new Error("Responsible person must be active and assignable.");
  }

  return data;
}

export async function upsertOrganizationResponsibilityDefault(input: {
  roleKey: string;
  personId: string;
}) {
  const scope = await requireOrganizationAdminScope(
    "/settings/operational-intelligence"
  );

  if (!isOrganizationResponsibilityRoleKey(input.roleKey)) {
    throw new Error("Unsupported responsibility role.");
  }

  await ensureAssignablePerson({
    organizationId: scope.organizationId,
    personId: input.personId
  });

  const supabase = await getSupabaseServerClient();
  const existingResponse = await supabase
    .from("organization_responsibility_role_defaults")
    .select("id")
    .eq("organization_id", scope.organizationId)
    .eq("role_key", input.roleKey)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load existing responsibility default: ${existingResponse.error.message}`
    );
  }

  const selectColumns =
    "id, organization_id, role_key, person_id, created_by, updated_by, created_at, updated_at";
  const response = existingResponse.data
    ? await supabase
        .from("organization_responsibility_role_defaults")
        .update({
          person_id: input.personId,
          updated_by: scope.userId
        })
        .eq("organization_id", scope.organizationId)
        .eq("role_key", input.roleKey)
        .select(selectColumns)
        .single()
    : await supabase
        .from("organization_responsibility_role_defaults")
        .insert({
          organization_id: scope.organizationId,
          role_key: input.roleKey,
          person_id: input.personId,
          created_by: scope.userId,
          updated_by: scope.userId
        })
        .select(selectColumns)
        .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to update responsibility default: ${response.error.message}`
    );
  }

  if (!isResponsibilityDefaultRow(data)) {
    throw new Error("Responsibility default update returned an unexpected response.");
  }

  const peopleById = await listPeopleById({
    organizationId: scope.organizationId,
    personIds: [data.person_id]
  });
  const person = peopleById.get(data.person_id);

  if (!person) {
    throw new Error("Responsibility default update returned an unlinked person.");
  }

  return mapDefaultRow(data, person);
}

export async function clearOrganizationResponsibilityDefault(input: {
  roleKey: string;
}) {
  const scope = await requireOrganizationAdminScope(
    "/settings/operational-intelligence"
  );

  if (!isOrganizationResponsibilityRoleKey(input.roleKey)) {
    throw new Error("Unsupported responsibility role.");
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_responsibility_role_defaults")
    .delete()
    .eq("organization_id", scope.organizationId)
    .eq("role_key", input.roleKey);

  if (response.error) {
    throw new Error(
      `Unable to clear responsibility default: ${response.error.message}`
    );
  }
}
