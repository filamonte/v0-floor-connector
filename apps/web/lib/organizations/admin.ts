import "server-only";

import { redirect } from "next/navigation";
import type { MembershipRole } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OrganizationMemberRow = {
  id: string;
  user_id: string;
  membership_role: MembershipRole;
  membership_status: string;
  invitation_email: string | null;
  accepted_at: string | null;
  users:
    | {
        id: string;
        email: string;
        full_name: string | null;
      }
    | null;
};

type OrganizationRoleRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export async function requireOrganizationAdminScope(next = "/settings") {
  const user = await requireAuthenticatedUser(next);
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    redirect("/dashboard?error=No+active+organization+is+available.");
  }

  if (!["owner", "admin"].includes(organizationContext.membership.role)) {
    redirect("/dashboard?error=Organization+admin+access+is+required.");
  }

  return {
    userId: user.id,
    organizationId: organizationContext.organization.id,
    membershipRole: organizationContext.membership.role,
    organization: organizationContext.organization
  };
}

export async function updateOrganizationProfile(input: {
  organizationId: string;
  userId: string;
  legalName: string;
  displayName: string;
  slug: string;
  logoUrl: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("companies")
    .update({
      legal_name: input.legalName,
      display_name: input.displayName,
      slug: input.slug,
      logo_url: input.logoUrl,
      updated_by: input.userId
    })
    .eq("id", input.organizationId)
    .select("id, slug, legal_name, display_name, logo_url, tenant_status, lifecycle_state, created_at, updated_at")
    .single();

  if (response.error) {
    throw new Error(`Unable to update organization profile: ${response.error.message}`);
  }

  return response.data;
}

export async function listOrganizationMembers(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  await supabase.rpc("ensure_company_system_roles", {
    target_company_id: organizationId,
    acting_user_id: null
  });

  // company_memberships also references users through created_by and updated_by,
  // so the membership user embed must target the user_id foreign key explicitly.
  const response = await supabase
    .from("company_memberships")
    .select(
      `
        id,
        user_id,
        membership_role,
        membership_status,
        invitation_email,
        accepted_at,
        member_user:users!company_memberships_user_id_fkey (
          id,
          email,
          full_name
        )
      `
    )
    .eq("company_id", organizationId)
    .order("membership_role", { ascending: true })
    .order("created_at", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load organization members: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) => {
    const record = row as {
      id: string;
      user_id: string;
      membership_role: MembershipRole;
      membership_status: string;
      invitation_email: string | null;
      accepted_at: string | null;
      member_user:
        | Array<{
            id: string;
            email: string;
            full_name: string | null;
          }>
        | null;
    };

    return {
      id: record.id,
      user_id: record.user_id,
      membership_role: record.membership_role,
      membership_status: record.membership_status,
      invitation_email: record.invitation_email,
      accepted_at: record.accepted_at,
      users: Array.isArray(record.member_user) ? (record.member_user[0] ?? null) : null
    } satisfies OrganizationMemberRow;
  });
}

export async function listOrganizationRoles(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  await supabase.rpc("ensure_company_system_roles", {
    target_company_id: organizationId,
    acting_user_id: null
  });

  const response = await supabase
    .from("roles")
    .select("id, key, name, description")
    .eq("company_id", organizationId)
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(`Unable to load organization roles: ${response.error.message}`);
  }

  return (Array.isArray(response.data) ? response.data : []) as OrganizationRoleRow[];
}

export async function updateOrganizationMembershipRole(input: {
  organizationId: string;
  membershipId: string;
  nextRole: MembershipRole;
  actingUserId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const roleResponse = await supabase
    .from("roles")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("key", input.nextRole)
    .maybeSingle();

  const roleData = roleResponse.data as { id?: string } | null;

  if (roleResponse.error || !roleData?.id) {
    throw new Error(
      `Unable to resolve organization role for ${input.nextRole}: ${roleResponse.error?.message ?? "Missing role."}`
    );
  }

  const response = await supabase
    .from("company_memberships")
    .update({
      membership_role: input.nextRole,
      role_id: roleData.id,
      updated_by: input.actingUserId
    })
    .eq("company_id", input.organizationId)
    .eq("id", input.membershipId);

  if (response.error) {
    throw new Error(
      `Unable to update organization membership role: ${response.error.message}`
    );
  }
}
