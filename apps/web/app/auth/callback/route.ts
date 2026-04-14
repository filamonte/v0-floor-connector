import { NextResponse, type NextRequest } from "next/server";

import { ensureAuthenticatedUserBootstrap } from "@/lib/auth/bootstrap";
import { sanitizeRedirectPath } from "@/lib/auth/paths";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const failureUrl = new URL("/login", request.url);

    failureUrl.searchParams.set("error", "Missing authentication code.");
    failureUrl.searchParams.set("next", next);

    return NextResponse.redirect(failureUrl);
  }

  const { supabase, response } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const failureUrl = new URL("/login", request.url);

    failureUrl.searchParams.set("error", error.message);
    failureUrl.searchParams.set("next", next);

    return NextResponse.redirect(failureUrl);
  }

  await ensureAuthenticatedUserBootstrap(supabase);

  const destination = new URL(next, request.url);
  const redirectResponse = NextResponse.redirect(destination);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "content-length") {
      redirectResponse.headers.set(key, value);
    }
  });

  return redirectResponse;
}
