import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type PlatformBillingSettings = {
  configKey: "default";
  planLabel: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  currency: string;
  unitAmountCents: number;
  recurringInterval: "day" | "week" | "month" | "year";
  stripeMode: "test" | "live" | "unknown";
  stripeProductSyncedAt: string | null;
  stripePriceSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PlatformBillingSettingsRow = {
  config_key: "default";
  plan_label: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  currency: string;
  unit_amount_cents: number;
  recurring_interval: "day" | "week" | "month" | "year";
  stripe_mode: "test" | "live" | "unknown";
  stripe_product_synced_at: string | null;
  stripe_price_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

const fallbackBillingSettings: PlatformBillingSettings = {
  configKey: "default",
  planLabel: "Founder plan",
  stripeProductId: null,
  stripePriceId: null,
  currency: "usd",
  unitAmountCents: 49900,
  recurringInterval: "month",
  stripeMode: "test",
  stripeProductSyncedAt: null,
  stripePriceSyncedAt: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString()
};

function mapPlatformBillingSettings(
  row: PlatformBillingSettingsRow
): PlatformBillingSettings {
  return {
    configKey: row.config_key,
    planLabel: row.plan_label,
    stripeProductId: row.stripe_product_id,
    stripePriceId: row.stripe_price_id,
    currency: row.currency,
    unitAmountCents: row.unit_amount_cents,
    recurringInterval: row.recurring_interval,
    stripeMode: row.stripe_mode,
    stripeProductSyncedAt: row.stripe_product_synced_at,
    stripePriceSyncedAt: row.stripe_price_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function isMissingPlatformBillingSettingsTable(message: string) {
  return (
    message.includes("platform_billing_settings") &&
    (message.includes("Could not find the table") ||
      message.includes("does not exist"))
  );
}

export async function getPlatformBillingSettings(): Promise<PlatformBillingSettings> {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_billing_settings")
    .select("*")
    .eq("config_key", "default")
    .maybeSingle();

  if (
    response.error &&
    isMissingPlatformBillingSettingsTable(response.error.message)
  ) {
    return fallbackBillingSettings;
  }

  if (response.error) {
    throw new Error(
      `Unable to load platform billing settings: ${response.error.message}`
    );
  }

  return response.data
    ? mapPlatformBillingSettings(response.data as PlatformBillingSettingsRow)
    : fallbackBillingSettings;
}

export async function upsertPlatformBillingSettings(input: {
  userId: string;
  planLabel: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  currency: string;
  unitAmountCents: number;
  recurringInterval: "day" | "week" | "month" | "year";
  stripeMode: "test" | "live" | "unknown";
  stripeProductSyncedAt: string | null;
  stripePriceSyncedAt: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("platform_billing_settings")
    .upsert(
      {
        config_key: "default",
        plan_label: input.planLabel,
        stripe_product_id: input.stripeProductId,
        stripe_price_id: input.stripePriceId,
        currency: input.currency,
        unit_amount_cents: input.unitAmountCents,
        recurring_interval: input.recurringInterval,
        stripe_mode: input.stripeMode,
        stripe_product_synced_at: input.stripeProductSyncedAt,
        stripe_price_synced_at: input.stripePriceSyncedAt,
        created_by: input.userId,
        updated_by: input.userId
      },
      { onConflict: "config_key" }
    )
    .select("*")
    .single();

  if (response.error) {
    throw new Error(
      `Unable to save platform billing settings: ${response.error.message}`
    );
  }

  return mapPlatformBillingSettings(
    response.data as PlatformBillingSettingsRow
  );
}

export async function getEffectiveSaasPriceReference(input: {
  envPriceId?: string | null;
}) {
  const settings = await getPlatformBillingSettings();

  if (settings.stripePriceId) {
    return {
      priceId: settings.stripePriceId,
      source: "platform_settings" as const,
      settings
    };
  }

  if (input.envPriceId) {
    return {
      priceId: input.envPriceId,
      source: "env" as const,
      settings
    };
  }

  return {
    priceId: null,
    source: "missing" as const,
    settings
  };
}
