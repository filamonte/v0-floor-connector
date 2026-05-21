import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { MembershipRole, MembershipStatus } from "@floorconnector/types";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type BootstrapClient = Pick<SupabaseClient, "rpc">;

export type AuthBootstrapResult = {
  user_id: string;
  company_id: string;
  membership_id: string;
  membership_role: MembershipRole;
  membership_status: MembershipStatus;
  was_initialized: boolean;
  created_company: boolean;
};

function isBootstrapResult(value: unknown): value is AuthBootstrapResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<AuthBootstrapResult>;

  return (
    typeof result.user_id === "string" &&
    typeof result.company_id === "string" &&
    typeof result.membership_id === "string" &&
    typeof result.membership_role === "string" &&
    typeof result.membership_status === "string" &&
    typeof result.was_initialized === "boolean" &&
    typeof result.created_company === "boolean"
  );
}

export async function ensureAuthenticatedUserBootstrap(
  client?: BootstrapClient
) {
  const supabase = client ?? (await getSupabaseServerClient());
  const response = await supabase.rpc("bootstrap_authenticated_user");
  const data: unknown = response.data;
  const error = response.error;

  if (error) {
    throw new Error(`Unable to bootstrap the authenticated user: ${error.message}`);
  }

  if (!isBootstrapResult(data)) {
    throw new Error("Unexpected bootstrap response from Supabase.");
  }

  return data;
}
