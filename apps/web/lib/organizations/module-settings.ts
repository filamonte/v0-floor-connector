import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
