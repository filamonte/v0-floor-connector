import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import {
  defaultAuthenticatedPath,
  sanitizeRedirectPath,
  signInPath
} from "./paths";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function requireAuthenticatedUser(next = defaultAuthenticatedPath) {
  const user = await getCurrentUser();

  if (!user) {
    const destination = new URL(signInPath, "http://floorconnector.local");

    destination.searchParams.set("next", sanitizeRedirectPath(next));

    redirect(`${destination.pathname}${destination.search}`);
  }

  return user;
}

export async function redirectIfAuthenticated(next = defaultAuthenticatedPath) {
  const user = await getCurrentUser();

  if (user) {
    redirect(sanitizeRedirectPath(next));
  }
}
