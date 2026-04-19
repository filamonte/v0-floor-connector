import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  PortalAccessGrant as PortalAccessGrantRecord,
  PortalProjectAccess as PortalProjectAccessRecord
} from "@floorconnector/types";

import type {
  PortalAccessGrantInput,
  PortalProjectAccessInput
} from "./schemas";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PortalAdminScope = {
  userId: string;
  organizationId: string;
};

type PortalAccessGrantRow = {
  id: string;
  company_id: string;
  customer_id: string;
  user_id: string;
  status: PortalAccessGrantRecord["status"];
  invited_email: string | null;
  invited_by: string | null;
  activated_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  customers?:
    | {
        id: string;
        name: string;
        company_name: string | null;
        email: string | null;
      }
    | null;
  portal_user?:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
  invited_by_user?:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
};

type PortalProjectAccessRow = {
  id: string;
  company_id: string;
  portal_access_grant_id: string;
  project_id: string;
  status: PortalProjectAccessRecord["status"];
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  projects?:
    | {
        id: string;
        customer_id: string;
        name: string;
        status: string;
      }
    | null;
};

export type PortalAccessGrantListItem = PortalAccessGrantRecord & {
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    email: string | null;
  } | null;
  portalUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
  invitedByUser: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

export type PortalProjectAccessListItem = PortalProjectAccessRecord & {
  project: {
    id: string;
    customerId: string;
    name: string;
    status: string;
  } | null;
};

const portalAccessGrantSelect = `
  id,
  company_id,
  customer_id,
  user_id,
  status,
  invited_email,
  invited_by,
  activated_at,
  revoked_at,
  created_at,
  updated_at,
  customers (
    id,
    name,
    company_name,
    email
  ),
  -- Explicit relationship aliases are required here because portal_access_grants
  -- points to users through both user_id and invited_by.
  portal_user:users!portal_access_grants_user_id_fkey (
    id,
    email,
    full_name
  ),
  invited_by_user:users!portal_access_grants_invited_by_fkey (
    id,
    email,
    full_name
  )
`;

const portalProjectAccessSelect = `
  id,
  company_id,
  portal_access_grant_id,
  project_id,
  status,
  revoked_at,
  created_at,
  updated_at,
  projects (
    id,
    customer_id,
    name,
    status
  )
`;

function isPortalAccessGrantRow(value: unknown): value is PortalAccessGrantRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PortalAccessGrantRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.customer_id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPortalAccessGrantRowArray(value: unknown): value is PortalAccessGrantRow[] {
  return Array.isArray(value) && value.every((row) => isPortalAccessGrantRow(row));
}

function isPortalProjectAccessRow(value: unknown): value is PortalProjectAccessRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PortalProjectAccessRow>;

  return (
    typeof row.id === "string" &&
    typeof row.company_id === "string" &&
    typeof row.portal_access_grant_id === "string" &&
    typeof row.project_id === "string" &&
    typeof row.status === "string" &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isPortalProjectAccessRowArray(value: unknown): value is PortalProjectAccessRow[] {
  return Array.isArray(value) && value.every((row) => isPortalProjectAccessRow(row));
}

function mapPortalAccessGrant(row: PortalAccessGrantRow): PortalAccessGrantRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    customerId: row.customer_id,
    userId: row.user_id,
    status: row.status,
    invitedEmail: row.invited_email,
    invitedByUserId: row.invited_by,
    activatedAt: row.activated_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPortalAccessGrantListItem(
  row: PortalAccessGrantRow
): PortalAccessGrantListItem {
  return {
    ...mapPortalAccessGrant(row),
    customer: row.customers
      ? {
          id: row.customers.id,
          name: row.customers.name,
          companyName: row.customers.company_name,
          email: row.customers.email
        }
      : null,
    portalUser: row.portal_user
      ? {
          id: row.portal_user.id,
          email: row.portal_user.email,
          fullName: row.portal_user.full_name
        }
      : null,
    invitedByUser: row.invited_by_user
      ? {
          id: row.invited_by_user.id,
          email: row.invited_by_user.email,
          fullName: row.invited_by_user.full_name
        }
      : null
  };
}

function mapPortalProjectAccess(
  row: PortalProjectAccessRow
): PortalProjectAccessRecord {
  return {
    id: row.id,
    organizationId: row.company_id,
    portalAccessGrantId: row.portal_access_grant_id,
    projectId: row.project_id,
    status: row.status,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPortalProjectAccessListItem(
  row: PortalProjectAccessRow
): PortalProjectAccessListItem {
  return {
    ...mapPortalProjectAccess(row),
    project: row.projects
      ? {
          id: row.projects.id,
          customerId: row.projects.customer_id,
          name: row.projects.name,
          status: row.projects.status
        }
      : null
  };
}

async function getPortalAdminScope(next = "/settings"): Promise<PortalAdminScope | null> {
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

export async function requirePortalAdminScope(next = "/settings") {
  const scope = await getPortalAdminScope(next);

  if (!scope) {
    const destination = new URL("/dashboard", "http://floorconnector.local");

    destination.searchParams.set(
      "error",
      "No active organization is available for portal access management yet."
    );

    redirect(`${destination.pathname}${destination.search}`);
  }

  return scope;
}

async function ensureScopedCustomer(organizationId: string, customerId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("customers")
    .select("id")
    .eq("company_id", organizationId)
    .eq("id", customerId)
    .maybeSingle();
  const data = response.data as { id?: string } | null;

  if (response.error) {
    throw new Error(`Unable to validate the portal customer: ${response.error.message}`);
  }

  if (!data?.id) {
    throw new Error("Customer not found for this organization.");
  }

  return data;
}

async function ensureScopedProject(organizationId: string, projectId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("projects")
    .select("id, customer_id, name, status")
    .eq("company_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  const data = response.data as
    | {
        id?: string;
        customer_id?: string;
        name?: string;
        status?: string;
      }
    | null;

  if (response.error) {
    throw new Error(`Unable to validate the portal project: ${response.error.message}`);
  }

  if (!data?.id || !data.customer_id || !data.name || !data.status) {
    throw new Error("Project not found for this organization.");
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    name: data.name,
    status: data.status
  };
}

async function ensureScopedPortalAccessGrant(
  organizationId: string,
  portalAccessGrantId: string
) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(portalAccessGrantSelect)
    .eq("company_id", organizationId)
    .eq("id", portalAccessGrantId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load the portal access grant: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Portal access grant not found for this organization.");
  }

  return mapPortalAccessGrantListItem(data);
}

async function validatePortalAccessGrantInput(
  organizationId: string,
  input: PortalAccessGrantInput
) {
  await ensureScopedCustomer(organizationId, input.customerId);
}

async function validatePortalProjectAccessInput(
  organizationId: string,
  input: PortalProjectAccessInput
) {
  const [portalAccessGrant, project] = await Promise.all([
    ensureScopedPortalAccessGrant(organizationId, input.portalAccessGrantId),
    ensureScopedProject(organizationId, input.projectId)
  ]);

  if (project.customerId !== portalAccessGrant.customerId) {
    throw new Error(
      "Portal project visibility must stay inside the same canonical customer."
    );
  }

  return {
    portalAccessGrant,
    project
  };
}

function mapPortalAccessGrantMutation(input: PortalAccessGrantInput) {
  const now = new Date().toISOString();

  return {
    status: input.status,
    invited_email: input.invitedEmail,
    activated_at: input.status === "active" ? now : null,
    revoked_at: input.status === "revoked" ? now : null
  };
}

function mapPortalProjectAccessMutation(input: PortalProjectAccessInput) {
  return {
    status: input.status,
    revoked_at: input.status === "revoked" ? new Date().toISOString() : null
  };
}

function isUniquePortalAccessGrantViolation(message: string) {
  return message.includes("portal_access_grants_company_customer_user_unique");
}

function isUniquePortalProjectAccessViolation(message: string) {
  return message.includes("portal_project_access_grant_project_unique");
}

export async function findPortalUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("lookup_portal_user_by_email", {
    target_email: normalizedEmail
  });
  const rows = (response.data as
    | Array<{
        user_id?: string;
        email?: string;
        full_name?: string | null;
      }>
    | null) ?? [];

  if (response.error) {
    throw new Error(`Unable to resolve the portal user email: ${response.error.message}`);
  }

  const row = rows[0];

  if (!row?.user_id || !row.email) {
    return null;
  }

  return {
    id: row.user_id,
    email: row.email,
    fullName: row.full_name ?? null
  };
}

export const listPortalAccessGrants = cache(
  async (): Promise<PortalAccessGrantListItem[]> => {
    const scope = await requirePortalAdminScope("/settings");
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_access_grants")
      .select(portalAccessGrantSelect)
      .eq("company_id", scope.organizationId)
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(`Unable to load portal access grants: ${response.error.message}`);
    }

    if (!isPortalAccessGrantRowArray(data)) {
      return [];
    }

    return data.map(mapPortalAccessGrantListItem);
  }
);

export async function listPortalAccessGrantsByCustomer(
  customerId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);
  await ensureScopedCustomer(scope.organizationId, customerId);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_access_grants")
    .select(portalAccessGrantSelect)
    .eq("company_id", scope.organizationId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load portal access grants for the customer: ${response.error.message}`
    );
  }

  if (!isPortalAccessGrantRowArray(data)) {
    return [];
  }

  return data.map(mapPortalAccessGrantListItem);
}

export async function getPortalAccessGrantById(
  portalAccessGrantId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);

  return ensureScopedPortalAccessGrant(scope.organizationId, portalAccessGrantId);
}

export async function createPortalAccessGrant(input: PortalAccessGrantInput) {
  const scope = await requirePortalAdminScope("/settings");
  await validatePortalAccessGrantInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalAccessGrantMutation(input);
  const response = await supabase
    .from("portal_access_grants")
    .insert({
      company_id: scope.organizationId,
      customer_id: input.customerId,
      user_id: input.userId,
      invited_by: scope.userId,
      ...mutation
    })
    .select(portalAccessGrantSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalAccessGrantViolation(response.error.message)) {
      throw new Error(
        "Portal access already exists for this customer and authenticated user."
      );
    }

    throw new Error(`Unable to create portal access: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Unexpected portal access grant response after create.");
  }

  return mapPortalAccessGrantListItem(data);
}

export async function updatePortalAccessGrant(
  portalAccessGrantId: string,
  input: PortalAccessGrantInput
) {
  const scope = await requirePortalAdminScope(`/settings?portalAccessGrantId=${portalAccessGrantId}`);
  await validatePortalAccessGrantInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalAccessGrantMutation(input);
  const response = await supabase
    .from("portal_access_grants")
    .update({
      customer_id: input.customerId,
      user_id: input.userId,
      invited_by: scope.userId,
      ...mutation
    })
    .eq("company_id", scope.organizationId)
    .eq("id", portalAccessGrantId)
    .select(portalAccessGrantSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalAccessGrantViolation(response.error.message)) {
      throw new Error(
        "Portal access already exists for this customer and authenticated user."
      );
    }

    throw new Error(`Unable to update portal access: ${response.error.message}`);
  }

  if (!isPortalAccessGrantRow(data)) {
    throw new Error("Portal access grant not found for this organization.");
  }

  return mapPortalAccessGrantListItem(data);
}

export async function listPortalProjectAccessByGrantId(
  portalAccessGrantId: string,
  next = "/settings"
) {
  const scope = await requirePortalAdminScope(next);
  await ensureScopedPortalAccessGrant(scope.organizationId, portalAccessGrantId);
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("portal_project_access")
    .select(portalProjectAccessSelect)
    .eq("company_id", scope.organizationId)
    .eq("portal_access_grant_id", portalAccessGrantId)
    .order("created_at", { ascending: false });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load portal project visibility: ${response.error.message}`
    );
  }

  if (!isPortalProjectAccessRowArray(data)) {
    return [];
  }

  return data.map(mapPortalProjectAccessListItem);
}

export async function createPortalProjectAccess(input: PortalProjectAccessInput) {
  const scope = await requirePortalAdminScope("/settings");
  await validatePortalProjectAccessInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalProjectAccessMutation(input);
  const response = await supabase
    .from("portal_project_access")
    .insert({
      company_id: scope.organizationId,
      portal_access_grant_id: input.portalAccessGrantId,
      project_id: input.projectId,
      ...mutation
    })
    .select(portalProjectAccessSelect)
    .single();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalProjectAccessViolation(response.error.message)) {
      throw new Error("Portal project visibility already exists for this grant.");
    }

    throw new Error(`Unable to create portal project visibility: ${response.error.message}`);
  }

  if (!isPortalProjectAccessRow(data)) {
    throw new Error("Unexpected portal project visibility response after create.");
  }

  return mapPortalProjectAccessListItem(data);
}

export async function updatePortalProjectAccess(
  portalProjectAccessId: string,
  input: PortalProjectAccessInput
) {
  const scope = await requirePortalAdminScope(
    `/settings?portalProjectAccessId=${portalProjectAccessId}`
  );
  await validatePortalProjectAccessInput(scope.organizationId, input);
  const supabase = await getSupabaseServerClient();
  const mutation = mapPortalProjectAccessMutation(input);
  const response = await supabase
    .from("portal_project_access")
    .update({
      portal_access_grant_id: input.portalAccessGrantId,
      project_id: input.projectId,
      ...mutation
    })
    .eq("company_id", scope.organizationId)
    .eq("id", portalProjectAccessId)
    .select(portalProjectAccessSelect)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    if (isUniquePortalProjectAccessViolation(response.error.message)) {
      throw new Error("Portal project visibility already exists for this grant.");
    }

    throw new Error(`Unable to update portal project visibility: ${response.error.message}`);
  }

  if (!isPortalProjectAccessRow(data)) {
    throw new Error("Portal project visibility not found for this organization.");
  }

  return mapPortalProjectAccessListItem(data);
}

export const listPortalAccessGrantsForCurrentUser = cache(
  async (next = "/portal"): Promise<PortalAccessGrantRecord[]> => {
    const user = await requireAuthenticatedUser(next);
    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_access_grants")
      .select(
        `
          id,
          company_id,
          customer_id,
          user_id,
          status,
          invited_email,
          invited_by,
          activated_at,
          revoked_at,
          created_at,
          updated_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load portal access grants for the authenticated user: ${response.error.message}`
      );
    }

    if (!isPortalAccessGrantRowArray(data)) {
      return [];
    }

    return data.map(mapPortalAccessGrant);
  }
);

export const listPortalAccessibleProjectIdsForCurrentUser = cache(
  async (next = "/portal"): Promise<string[]> => {
    const activeGrants = (await listPortalAccessGrantsForCurrentUser(next)).filter(
      (grant) => grant.status === "active"
    );

    if (activeGrants.length === 0) {
      return [];
    }

    const supabase = await getSupabaseServerClient();
    const response = await supabase
      .from("portal_project_access")
      .select(
        `
          id,
          company_id,
          portal_access_grant_id,
          project_id,
          status,
          revoked_at,
          created_at,
          updated_at
        `
      )
      .in(
        "portal_access_grant_id",
        activeGrants.map((grant) => grant.id)
      )
      .eq("status", "active");
    const data: unknown = response.data;

    if (response.error) {
      throw new Error(
        `Unable to load accessible portal projects for the authenticated user: ${response.error.message}`
      );
    }

    if (!isPortalProjectAccessRowArray(data)) {
      return [];
    }

    return [...new Set(data.map((row) => row.project_id))];
  }
);
