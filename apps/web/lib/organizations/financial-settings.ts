import "server-only";

import type { OrganizationFinancialSettings, TaxBehavior } from "@floorconnector/types";

import { getPlatformFinancialDefaults } from "@/lib/platform-admin/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OrganizationFinancialSettingsRow = {
  company_id: string;
  default_tax_rate: string | number;
  default_tax_behavior: TaxBehavior;
  default_retainage_percentage: string | number;
  external_tax_provider: string | null;
  external_tax_provider_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function isOrganizationFinancialSettingsRow(
  value: unknown
): value is OrganizationFinancialSettingsRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OrganizationFinancialSettingsRow>;

  return (
    typeof row.company_id === "string" &&
    (typeof row.default_tax_rate === "string" ||
      typeof row.default_tax_rate === "number") &&
    typeof row.default_tax_behavior === "string" &&
    (typeof row.default_retainage_percentage === "string" ||
      typeof row.default_retainage_percentage === "number") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function mapOrganizationFinancialSettings(
  row: OrganizationFinancialSettingsRow
): OrganizationFinancialSettings {
  return {
    organizationId: row.company_id,
    defaultTaxRate: Number(row.default_tax_rate).toFixed(6),
    defaultTaxBehavior: row.default_tax_behavior,
    defaultRetainagePercentage: Number(row.default_retainage_percentage).toFixed(2),
    externalTaxProvider: row.external_tax_provider,
    externalTaxProviderConfig: row.external_tax_provider_config,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getOrganizationFinancialSettings(
  organizationId: string
): Promise<OrganizationFinancialSettings> {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_financial_settings")
    .select(
      `
        company_id,
        default_tax_rate,
        default_tax_behavior,
        default_retainage_percentage,
        external_tax_provider,
        external_tax_provider_config,
        created_at,
        updated_at
      `
    )
    .eq("company_id", organizationId)
    .maybeSingle();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to load organization financial settings: ${response.error.message}`
    );
  }

  if (!isOrganizationFinancialSettingsRow(data)) {
    const platformDefaults = await getPlatformFinancialDefaults();

    return {
      organizationId,
      defaultTaxRate: platformDefaults.defaultTaxRate,
      defaultTaxBehavior: platformDefaults.defaultTaxBehavior,
      defaultRetainagePercentage: platformDefaults.defaultRetainagePercentage,
      externalTaxProvider: null,
      externalTaxProviderConfig: null,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString()
    };
  }

  return mapOrganizationFinancialSettings(data);
}

export async function upsertOrganizationFinancialSettings(input: {
  organizationId: string;
  userId: string;
  defaultTaxRate: string;
  defaultTaxBehavior: TaxBehavior;
  defaultRetainagePercentage: string;
}) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_financial_settings")
    .upsert(
      {
        company_id: input.organizationId,
        default_tax_rate: input.defaultTaxRate,
        default_tax_behavior: input.defaultTaxBehavior,
        default_retainage_percentage: input.defaultRetainagePercentage,
        updated_by: input.userId,
        created_by: input.userId
      },
      {
        onConflict: "company_id"
      }
    )
    .select(
      `
        company_id,
        default_tax_rate,
        default_tax_behavior,
        default_retainage_percentage,
        external_tax_provider,
        external_tax_provider_config,
        created_at,
        updated_at
      `
    )
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to save organization financial settings: ${response.error.message}`
    );
  }

  if (!isOrganizationFinancialSettingsRow(data)) {
    throw new Error("Unexpected response after saving organization financial settings.");
  }

  return mapOrganizationFinancialSettings(data);
}
