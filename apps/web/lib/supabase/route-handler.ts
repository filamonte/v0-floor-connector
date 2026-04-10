import "server-only";

import { getPublicEnv } from "@floorconnector/config";
import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr/dist/main/types";
import { NextResponse, type NextRequest } from "next/server";

export function createRouteHandlerSupabaseClient(request: NextRequest) {
  const env = getPublicEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase public configuration is missing.");
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          response = NextResponse.next({
            request
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  return { supabase, response };
}
