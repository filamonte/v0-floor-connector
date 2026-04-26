import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const INVENTORY_ENABLED_FEATURE_KEY = "inventory_enabled";

export const INVENTORY_ENABLED_FEATURE_POLICY = {
  key: INVENTORY_ENABLED_FEATURE_KEY,
  name: "Inventory tracking",
  description:
    "Controls whether inventory tracking is enabled as an operational extension of the Cost Items Database module.",
  moduleKey: "cost_items_database",
  surface: "contractor_app"
} as const;

export type OrganizationFeatureOverride = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  surface: string | null;
  enabled: boolean;
  updatedAt: string;
};

type FeatureFlagRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module_key: string | null;
  surface: string | null;
  enabled: boolean;
  updated_at: string;
};

function mapFeatureFlag(row: FeatureFlagRow): OrganizationFeatureOverride {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    moduleKey: row.module_key,
    surface: row.surface,
    enabled: row.enabled,
    updatedAt: row.updated_at
  };
}

async function getFeatureFlagEnabled(companyId: string | null, key: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", key);

  query = companyId === null ? query.is("company_id", null) : query.eq("company_id", companyId);

  const response = await query.maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load feature flag ${key}: ${response.error.message}`);
  }

  return typeof response.data?.enabled === "boolean" ? response.data.enabled : null;
}

export async function listOrganizationFeatureOverrides(organizationId: string) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("feature_flags")
    .select("id, key, name, description, module_key, surface, enabled, updated_at")
    .eq("company_id", organizationId)
    .order("surface", { ascending: true })
    .order("key", { ascending: true });

  if (response.error) {
    throw new Error(
      `Unable to load organization feature overrides: ${response.error.message}`
    );
  }

  return (Array.isArray(response.data) ? response.data : []).map((row) =>
    mapFeatureFlag(row as FeatureFlagRow)
  );
}

export async function upsertOrganizationFeatureOverride(input: {
  organizationId: string;
  userId: string;
  key: string;
  name: string;
  description: string | null;
  moduleKey: string | null;
  surface: string | null;
  enabled: boolean;
}) {
  const supabase = getSupabaseAdminClient();
  const existingResponse = await supabase
    .from("feature_flags")
    .select("id")
    .eq("company_id", input.organizationId)
    .eq("key", input.key)
    .maybeSingle();

  if (existingResponse.error) {
    throw new Error(
      `Unable to load organization feature override: ${existingResponse.error.message}`
    );
  }

  const payload = {
    key: input.key,
    name: input.name,
    description: input.description,
    module_key: input.moduleKey,
    surface: input.surface,
    enabled: input.enabled,
    updated_by: input.userId
  };

  const response = existingResponse.data
    ? await supabase
        .from("feature_flags")
        .update(payload)
        .eq("id", existingResponse.data.id)
        .select("id, key, name, description, module_key, surface, enabled, updated_at")
        .single()
    : await supabase
        .from("feature_flags")
        .insert({
          company_id: input.organizationId,
          ...payload,
          created_by: input.userId
        })
        .select("id, key, name, description, module_key, surface, enabled, updated_at")
        .single();

  if (response.error) {
    throw new Error(
      `Unable to save organization feature override: ${response.error.message}`
    );
  }

  return mapFeatureFlag(response.data as FeatureFlagRow);
}

export async function isInventoryEnabled(companyId: string) {
  const [platformEnabled, organizationEnabled] = await Promise.all([
    getFeatureFlagEnabled(null, INVENTORY_ENABLED_FEATURE_KEY),
    getFeatureFlagEnabled(companyId, INVENTORY_ENABLED_FEATURE_KEY)
  ]);

  return organizationEnabled ?? platformEnabled ?? false;
}

export async function getInventoryFeatureState(companyId: string) {
  const [platformEnabled, organizationEnabled] = await Promise.all([
    getFeatureFlagEnabled(null, INVENTORY_ENABLED_FEATURE_KEY),
    getFeatureFlagEnabled(companyId, INVENTORY_ENABLED_FEATURE_KEY)
  ]);

  return {
    key: INVENTORY_ENABLED_FEATURE_KEY,
    platformEnabled: platformEnabled ?? false,
    organizationEnabled,
    effectiveEnabled: organizationEnabled ?? platformEnabled ?? false
  };
}
