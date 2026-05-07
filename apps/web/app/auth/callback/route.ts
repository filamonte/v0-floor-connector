import { NextResponse, type NextRequest } from "next/server";

import { ensureAuthenticatedUserBootstrap } from "@/lib/auth/bootstrap";
import { getSafeInternalRedirectPath } from "@/lib/auth/paths";
import { resolvePostLoginRedirect } from "@/lib/auth/post-login";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = getSafeInternalRedirectPath(
    requestUrl.searchParams.get("next")
  );

  if (!code) {
    const failureUrl = new URL("/login", request.url);

    failureUrl.searchParams.set("error", "Missing authentication code.");
    if (requestedNext) {
      failureUrl.searchParams.set("next", requestedNext);
    }

    return NextResponse.redirect(failureUrl);
  }

  const { supabase, response } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const failureUrl = new URL("/login", request.url);

    failureUrl.searchParams.set("error", error.message);
    if (requestedNext) {
      failureUrl.searchParams.set("next", requestedNext);
    }

    return NextResponse.redirect(failureUrl);
  }

  const bootstrap = await ensureAuthenticatedUserBootstrap(supabase);
  const destinationPath = await resolvePostLoginRedirect({
    userId: bootstrap.user_id,
    requestedNext
  });

  const destination = new URL(destinationPath, request.url);
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
