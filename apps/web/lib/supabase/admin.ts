import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@floorconnector/db";

export function getSupabaseAdminClient(): SupabaseClient {
  return createSupabaseAdminClient();
}
