import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  defaultAuthenticatedPath,
  isPortalAuthPath,
  sanitizeRedirectPath,
  signInPath
} from "./paths";
import { ensureAuthenticatedUserBootstrap } from "./bootstrap";
import { resolvePostLoginRedirect } from "./post-login";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function isPortalOnlyUser(userId: string) {
  const supabase = getSupabaseAdminClient();
  const [membershipResponse, grantResponse] = await Promise.all([
    supabase
      .from("company_memberships")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("membership_status", "active"),
    supabase
      .from("portal_access_grants")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active")
  ]);

  if (membershipResponse.error) {
    throw new Error(
      `Unable to inspect contractor membership state: ${membershipResponse.error.message}`
    );
  }

  if (grantResponse.error) {
    throw new Error(
      `Unable to inspect portal access state: ${grantResponse.error.message}`
    );
  }

  return (membershipResponse.count ?? 0) === 0 && (grantResponse.count ?? 0) > 0;
}

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function requireAuthenticatedUser(next = defaultAuthenticatedPath) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const destination = new URL(signInPath, "http://floorconnector.local");

    destination.searchParams.set("next", sanitizeRedirectPath(next));

    redirect(`${destination.pathname}${destination.search}`);
  }

  if (!isPortalAuthPath(next)) {
    if (await isPortalOnlyUser(user.id)) {
      redirect("/portal");
    }

    await ensureAuthenticatedUserBootstrap(supabase);
  }

  return user;
}

export async function redirectIfAuthenticated(next?: string | null) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    if (next && isPortalAuthPath(next)) {
      redirect(next);
    }

    if (await isPortalOnlyUser(user.id)) {
      redirect("/portal");
    }

    const bootstrap = await ensureAuthenticatedUserBootstrap(supabase);
    const destination = await resolvePostLoginRedirect({
      userId: bootstrap.user_id,
      requestedNext: next
    });

    redirect(destination);
  }
}
