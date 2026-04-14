import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { compareProjectStatuses } from "@floorconnector/domain";
import type { Project as ProjectRecord, ProjectStatus } from "@floorconnector/types";

import type { ProjectInput } from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  company_id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country_code: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
      }
    | null;
};

export type ProjectListItem = ProjectRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
};

type ProjectScope = {
  userId: string;
  organizationId: string;
};

function isProjectRow(value: unknown): value is ProjectRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ProjectRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.name === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isProjectRowArray(value: unknown): value is ProjectRow[] {
  return Array.isArray(value) && value.every((row) => isProjectRow(row));
}

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    name: row.name,
    status: row.status,
    description: row.description,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2,
    city: row.city,
    stateRegion: row.state_region,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getProjectScope(next = "/projects"): Promise<ProjectScope | null> {
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

export async function requireProjectScope(next = "/projects") {
  const scope = await getProjectScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for project records yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

export const listProjects = cache(async (): Promise<ProjectListItem[]> => {
  const scope = await requireProjectScope("/projects");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(
      `
        id,
        company_id,
        customer_id,
        name,
        status,
        description,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        created_at,
        updated_at,
        customers (
          id,
          name,
          company_name
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load projects: ${error.message}`);
  }

  if (!isProjectRowArray(data)) {
    return [];
  }

  return data
    .map((row) => ({
      ...mapProject(row),
      customer: row.customers
        ? {
            id: row.customers.id,
            name: row.customers.name,
            companyName: row.customers.company_name
          }
        : null
    }))
    .sort((left, right) => {
      const statusComparison = compareProjectStatuses(left.status, right.status);

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
});

export async function listProjectsByCustomer(customerId: string, next = "/customers") {
  const scope = await requireProjectScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(
      `
        id,
        company_id,
        customer_id,
        name,
        status,
        description,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        created_at,
        updated_at,
        customers (
          id,
          name,
          company_name
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("updated_at", { ascending: false });
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load customer projects: ${error.message}`);
  }

  if (!isProjectRowArray(data)) {
    return [];
  }

  return data
    .map((row) => ({
      ...mapProject(row),
      customer: row.customers
        ? {
            id: row.customers.id,
            name: row.customers.name,
            companyName: row.customers.company_name
          }
        : null
    }))
    .sort((left, right) => {
      const statusComparison = compareProjectStatuses(left.status, right.status);

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });
}

export async function getProjectById(projectId: string, next = "/projects") {
  const scope = await requireProjectScope(next);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select(
      `
        id,
        company_id,
        customer_id,
        name,
        status,
        description,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        created_at,
        updated_at,
        customers (
          id,
          name,
          company_name
        )
      `
    )
    .eq("company_id", scope.organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to load the project: ${error.message}`);
  }

  if (!isProjectRow(data)) {
    return null;
  }

  return {
    ...mapProject(data),
    customer: data.customers
      ? {
          id: data.customers.id,
          name: data.customers.name,
          companyName: data.customers.company_name
        }
      : null
  };
}

export async function createProject(input: ProjectInput) {
  const scope = await requireProjectScope("/projects");
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .insert({
      company_id: scope.organizationId,
      customer_id: input.customerId,
      name: input.name,
      status: input.status,
      description: input.description,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      created_by: scope.userId,
      updated_by: scope.userId
    })
    .select(
      `
        id,
        company_id,
        customer_id,
        name,
        status,
        description,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        created_at,
        updated_at
      `
    )
    .single();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to create the project: ${error.message}`);
  }

  if (!isProjectRow(data)) {
    throw new Error("Unexpected project response after create.");
  }

  return mapProject(data);
}

export async function updateProject(projectId: string, input: ProjectInput) {
  const scope = await requireProjectScope(`/projects/${projectId}`);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .update({
      customer_id: input.customerId,
      name: input.name,
      status: input.status,
      description: input.description,
      address_line_1: input.addressLine1,
      address_line_2: input.addressLine2,
      city: input.city,
      state_region: input.stateRegion,
      postal_code: input.postalCode,
      country_code: input.countryCode,
      updated_by: scope.userId
    })
    .eq("company_id", scope.organizationId)
    .eq("id", projectId)
    .select(
      `
        id,
        company_id,
        customer_id,
        name,
        status,
        description,
        address_line_1,
        address_line_2,
        city,
        state_region,
        postal_code,
        country_code,
        created_at,
        updated_at
      `
    )
    .maybeSingle();
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to update the project: ${error.message}`);
  }

  if (!isProjectRow(data)) {
    throw new Error("Project not found for this organization.");
  }

  return mapProject(data);
}
