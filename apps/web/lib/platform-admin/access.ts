import "server-only";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type PlatformAdminScope = {
  userId: string;
  email: string | null;
};

async function ensureBootstrapPlatformAdmin(userId: string) {
  const supabase = getSupabaseAdminClient();
  const roleResponse = await supabase
    .from("roles")
    .select("id")
    .is("company_id", null)
    .eq("scope", "platform")
    .eq("key", "platform_admin")
    .maybeSingle();

  const roleData = roleResponse.data as { id?: string } | null;

  if (roleResponse.error || !roleData?.id) {
    throw new Error(
      `Unable to resolve platform admin role: ${roleResponse.error?.message ?? "Missing role."}`
    );
  }

  const countResponse = await supabase
    .from("platform_user_roles")
    .select("id", { count: "exact", head: true });

  if (countResponse.error) {
    throw new Error(
      `Unable to check platform admin assignments: ${countResponse.error.message}`
    );
  }

  if ((countResponse.count ?? 0) > 0) {
    return;
  }

  const insertResponse = await supabase.from("platform_user_roles").insert({
    user_id: userId,
    role_id: roleData.id,
    created_by: userId,
    updated_by: userId
  });

  if (insertResponse.error) {
    throw new Error(
      `Unable to bootstrap the first platform admin assignment: ${insertResponse.error.message}`
    );
  }
}

export async function requirePlatformAdminUser(next = "/super-admin") {
  const user = await requireAuthenticatedUser(next);
  const supabase = getSupabaseAdminClient();

  await ensureBootstrapPlatformAdmin(user.id);

  const response = await supabase
    .from("platform_user_roles")
    .select(
      `
        id,
        roles (
          id,
          key,
          scope
        )
      `
    )
    .eq("user_id", user.id);

  if (response.error) {
    throw new Error(
      `Unable to verify platform admin access: ${response.error.message}`
    );
  }

  const roles = Array.isArray(response.data) ? response.data : [];
  const hasPlatformAdminAccess = roles.some((assignment) => {
    const role = Array.isArray(assignment.roles)
      ? assignment.roles[0]
      : (assignment.roles as
      | {
          id: string;
          key: string;
          scope: string;
        }
      | null);

    return role?.scope === "platform" && role.key === "platform_admin";
  });

  if (!hasPlatformAdminAccess) {
    redirect("/dashboard?error=Platform+admin+access+is+required.");
  }

  return {
    userId: user.id,
    email: user.email ?? null
  } satisfies PlatformAdminScope;
}
