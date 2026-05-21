import { createClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  getSupabasePublicConfig,
  getSupabaseServiceRoleKey
} from "@floorconnector/config";

export type DatabaseHealth = "unconfigured" | "connected" | "error";

function formatEnvValidationError(error: ZodError) {
  const invalidKeys = Array.from(
    new Set(
      error.issues.flatMap((issue) =>
        issue.path.map((segment) => String(segment))
      )
    )
  );

  if (invalidKeys.length === 0) {
    return "Invalid environment configuration.";
  }

  return `Invalid environment configuration for: ${invalidKeys.join(", ")}.`;
}

type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function getRequiredSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();

  if (!config.url || !config.anonKey) {
    throw new Error("Supabase public configuration is missing.");
  }

  return {
    url: config.url,
    anonKey: config.anonKey
  };
}

export function createSupabaseBrowserClient() {
  const config = getRequiredSupabasePublicConfig();

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

export function createSupabaseServerClient() {
  const config = getRequiredSupabasePublicConfig();

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export function createSupabaseAdminClient() {
  const config = getRequiredSupabasePublicConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing.");
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export async function getSupabaseHealth(): Promise<{
  status: DatabaseHealth;
  detail: string;
}> {
  let config: ReturnType<typeof getSupabasePublicConfig>;

  try {
    config = getSupabasePublicConfig();
  } catch (error) {
    return {
      status: "error",
      detail:
        error instanceof ZodError
          ? formatEnvValidationError(error)
          : error instanceof Error
            ? `Invalid environment configuration: ${error.message}`
          : "Invalid environment configuration."
    };
  }

  if (!config.url || !config.anonKey) {
    return {
      status: "unconfigured",
      detail: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    };
  }

  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      method: "GET",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`
      },
      cache: "no-store"
    });

    if (response.ok) {
      return {
        status: "connected",
        detail: "Supabase auth settings endpoint responded successfully."
      };
    }

    return {
      status: "error",
      detail: `Supabase responded with HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      status: "error",
      detail:
        error instanceof Error ? error.message : "Unknown connection error."
    };
  }
}
