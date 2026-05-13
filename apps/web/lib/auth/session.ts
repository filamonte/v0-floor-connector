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
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

    const bootstrap = await ensureAuthenticatedUserBootstrap(supabase);
    const destination = await resolvePostLoginRedirect({
      userId: bootstrap.user_id,
      requestedNext: next
    });

    redirect(destination);
  }
}
