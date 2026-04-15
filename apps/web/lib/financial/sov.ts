import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function ensureScheduleOfValuesForEstimate(
  estimateId: string
): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("ensure_schedule_of_values_for_estimate", {
    target_estimate_id: estimateId
  });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to ensure the schedule of values foundation: ${response.error.message}`
    );
  }

  return typeof data === "string" ? data : null;
}
