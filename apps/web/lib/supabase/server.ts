import "server-only";

import { cookies } from "next/headers";
import { getPublicEnv } from "@floorconnector/config";
import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr/dist/main/types";

export async function getSupabaseServerClient() {
  const env = getPublicEnv();

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase public configuration is missing.");
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server components cannot always write cookies directly.
          }
        }
      }
    }
  );
}
