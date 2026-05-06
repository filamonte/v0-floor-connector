import "server-only";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PLATFORM_ADMIN_ROLE_KEY = "platform_admin";

type PlatformAdminScope = {
  userId: string;
  email: string | null;
  role: string;
};

type PlatformRoleRow = {
  id: string;
  roles:
    | Array<{
        id: string;
        key: string;
        scope: string;
      }>
    | {
        id: string;
        key: string;
        scope: string;
      }
    | null;
};

function resolvePlatformRole(row: PlatformRoleRow) {
  return Array.isArray(row.roles) ? (row.roles[0] ?? null) : row.roles;
}

export async function getPlatformRoleForUser(
  userId: string
): Promise<string | null> {
  const supabase = getSupabaseAdminClient();

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
    .eq("user_id", userId);

  if (response.error) {
    throw new Error(
      `Unable to verify platform admin access: ${response.error.message}`
    );
  }

  const roles = (Array.isArray(response.data) ? response.data : []) as PlatformRoleRow[];
  const platformAdminRole = roles.find((assignment) => {
    const role = resolvePlatformRole(assignment);

    return role?.scope === "platform" && role.key === PLATFORM_ADMIN_ROLE_KEY;
  });

  if (!platformAdminRole) {
    return null;
  }

  const role = resolvePlatformRole(platformAdminRole);

  return role?.key ?? null;
}

export async function isCurrentUserPlatformAdmin() {
  const user = await requireAuthenticatedUser("/super-admin");
  const role = await getPlatformRoleForUser(user.id);

  return role === PLATFORM_ADMIN_ROLE_KEY;
}

export async function getCurrentPlatformRole(next = "/super-admin") {
  const user = await requireAuthenticatedUser(next);

  return getPlatformRoleForUser(user.id);
}

export async function requirePlatformAdminUser(next = "/super-admin") {
  const user = await requireAuthenticatedUser(next);
  const role = await getPlatformRoleForUser(user.id);

  if (role !== PLATFORM_ADMIN_ROLE_KEY) {
    redirect("/dashboard?error=Platform+admin+access+is+required.");
  }

  const platformRole = role;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: platformRole
  } satisfies PlatformAdminScope;
}

export const requirePlatformAdmin = requirePlatformAdminUser;
