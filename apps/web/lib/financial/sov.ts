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

export async function appendChangeOrderSnapshotItemsToScheduleOfValues(input: {
  changeOrderId: string;
  scheduleOfValuesId?: string | null;
  actingUserId?: string | null;
}): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase.rpc("append_change_order_snapshot_items_to_sov", {
    target_change_order_id: input.changeOrderId,
    target_schedule_of_values_id: input.scheduleOfValuesId ?? null,
    acting_user_id: input.actingUserId ?? null
  });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to append change-order snapshot items to the schedule of values: ${response.error.message}`
    );
  }

  return typeof data === "string" ? data : null;
}
