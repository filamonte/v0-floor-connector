import "server-only";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  getPlatformRoleForUser,
  PLATFORM_ADMIN_ROLE_KEY
} from "@/lib/platform-admin/roles";

type PlatformAdminScope = {
  userId: string;
  email: string | null;
  role: string;
};

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
