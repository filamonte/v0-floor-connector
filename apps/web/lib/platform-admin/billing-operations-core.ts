export const STRIPE_SAAS_WEBHOOK_ENDPOINT = "/api/stripe/saas-billing-webhook";
export const STRIPE_SAAS_CHECKOUT_ENDPOINT =
  "/api/stripe/create-saas-subscription-checkout";
export const STRIPE_SAAS_SETUP_ENTRY = "/setup/billing";

export const STRIPE_SAAS_SUPPORTED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed"
] as const;

export type StripeReferenceMode =
  | "test"
  | "live"
  | "unknown"
  | "not_applicable";

export type StripeBillingEnvironmentInput = {
  stripeSecretKey?: string | null;
  stripePublishableKey?: string | null;
  stripeFounderPlanPriceId?: string | null;
  platformStripePriceId?: string | null;
  stripeWebhookSecret?: string | null;
};

export type StripeBillingConfigItem = {
  name: string;
  configured: boolean;
  mode: StripeReferenceMode;
  description: string;
};

export type StripeBillingConfigurationHealth = {
  items: StripeBillingConfigItem[];
  checkoutRoutePath: string;
  webhookEndpointPath: string;
  checkoutReady: boolean;
  webhookReady: boolean;
  testCheckoutReady: boolean;
  effectivePriceConfigured: boolean;
  priceReferenceSource: "platform_settings" | "env" | "missing";
  warnings: string[];
};

export type BillingPlanSetupInput = {
  stripeSecretKey?: string | null;
  planLabel: string;
  amountDollars: string;
  currency: string;
  interval: string;
};

export type NormalizedBillingPlanSetup = {
  planLabel: string;
  unitAmountCents: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
};

export type BillingOperationsTenantInput = {
  tenantStatus: string | null;
  lifecycleState: string | null;
  hasCompanyProfile: boolean;
  hasPaymentMethod: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeLastWebhookReceivedAt: string | null;
  founderBilling: {
    status: string | null;
    evidenceReceivedAt: string | null;
  };
};

export type BillingOperationsSummary = {
  totalTenants: number;
  activeTenants: number;
  manualEvidenceReceived: number;
  stripeCustomerReferences: number;
  stripeSubscriptionReferences: number;
  activeOrTrialingSubscriptions: number;
  tenantsAwaitingManualActivation: number;
  lastWebhookReceivedAt: string | null;
};

function hasValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function inferStripeKeyMode(value: string | null | undefined) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "not_applicable" satisfies StripeReferenceMode;
  }

  const normalized = value.trim();

  if (
    normalized.startsWith("sk_test_") ||
    normalized.startsWith("rk_test_") ||
    normalized.startsWith("pk_test_")
  ) {
    return "test" satisfies StripeReferenceMode;
  }

  if (
    normalized.startsWith("sk_live_") ||
    normalized.startsWith("rk_live_") ||
    normalized.startsWith("pk_live_")
  ) {
    return "live" satisfies StripeReferenceMode;
  }

  return "unknown" satisfies StripeReferenceMode;
}

function item(
  name: string,
  value: string | null | undefined,
  description: string,
  mode: StripeReferenceMode = "not_applicable"
): StripeBillingConfigItem {
  return {
    name,
    configured: hasValue(value),
    mode,
    description
  };
}

export function buildStripeBillingConfigurationHealth(
  input: StripeBillingEnvironmentInput
): StripeBillingConfigurationHealth {
  const secretMode = inferStripeKeyMode(input.stripeSecretKey);
  const publishableMode = inferStripeKeyMode(input.stripePublishableKey);
  const items = [
    item(
      "STRIPE_SECRET_KEY",
      input.stripeSecretKey,
      "Server-side Stripe API key for SaaS billing setup and Checkout.",
      secretMode
    ),
    item(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      input.stripePublishableKey,
      "Browser-safe publishable key used by tenant billing setup.",
      publishableMode
    ),
    item(
      "STRIPE_FOUNDER_PLAN_PRICE_ID",
      input.stripeFounderPlanPriceId,
      "Env fallback SaaS subscription price reference used when platform settings do not have a price."
    ),
    item(
      "Platform billing price reference",
      input.platformStripePriceId,
      "App-managed non-secret SaaS price reference stored in platform billing settings."
    ),
    item(
      "STRIPE_WEBHOOK_SECRET",
      input.stripeWebhookSecret,
      "Signed webhook endpoint secret for SaaS subscription reconciliation."
    )
  ];
  const secretConfigured = items[0]?.configured ?? false;
  const publishableConfigured = items[1]?.configured ?? false;
  const envPriceConfigured = items[2]?.configured ?? false;
  const platformPriceConfigured = items[3]?.configured ?? false;
  const priceConfigured = platformPriceConfigured || envPriceConfigured;
  const webhookConfigured = items[4]?.configured ?? false;
  const priceReferenceSource = platformPriceConfigured
    ? "platform_settings"
    : envPriceConfigured
      ? "env"
      : "missing";
  const checkoutReady =
    secretConfigured && publishableConfigured && priceConfigured;
  const webhookReady = webhookConfigured;
  const warnings: string[] = [];

  if (!checkoutReady) {
    warnings.push(
      "SaaS Checkout is unavailable until the Stripe secret key, publishable key, and default SaaS price reference are configured."
    );
  }

  if (!webhookReady) {
    warnings.push(
      "SaaS webhook replay is unavailable until STRIPE_WEBHOOK_SECRET is configured from Stripe CLI or Dashboard endpoint setup."
    );
  }

  if (secretMode === "live" || publishableMode === "live") {
    warnings.push(
      "A live-mode Stripe key appears to be configured; this phase should use test mode only."
    );
  } else if (
    (secretMode === "test" && publishableMode !== "test") ||
    (publishableMode === "test" && secretMode !== "test")
  ) {
    warnings.push(
      "Stripe key modes do not both appear to be test mode; Checkout remains operator-review only."
    );
  }

  return {
    items,
    checkoutRoutePath: STRIPE_SAAS_CHECKOUT_ENDPOINT,
    webhookEndpointPath: STRIPE_SAAS_WEBHOOK_ENDPOINT,
    checkoutReady,
    webhookReady,
    testCheckoutReady:
      checkoutReady && secretMode === "test" && publishableMode === "test",
    effectivePriceConfigured: priceConfigured,
    priceReferenceSource,
    warnings
  };
}

export function getStripeTestSecretKeyReadiness(
  value: string | null | undefined
) {
  const mode = inferStripeKeyMode(value);

  if (!value || value.trim().length === 0) {
    return {
      canManageTestResources: false,
      mode,
      reason: "STRIPE_SECRET_KEY is missing."
    };
  }

  if (mode !== "test") {
    return {
      canManageTestResources: false,
      mode,
      reason:
        mode === "live"
          ? "Live-mode Stripe keys cannot create Billing Operations test plans."
          : "Stripe secret key mode is unknown; refusing product/price setup."
    };
  }

  return {
    canManageTestResources: true,
    mode,
    reason: null
  };
}

export function normalizeBillingPlanSetupInput(
  input: BillingPlanSetupInput
): NormalizedBillingPlanSetup {
  const readiness = getStripeTestSecretKeyReadiness(input.stripeSecretKey);

  if (!readiness.canManageTestResources) {
    throw new Error(
      readiness.reason ?? "Stripe test-mode setup is unavailable."
    );
  }

  const planLabel = input.planLabel.trim() || "Founder plan";
  const currency = input.currency.trim().toLowerCase();
  const amount = Number(input.amountDollars.trim());
  const intervals = new Set(["day", "week", "month", "year"]);

  if (planLabel.length > 120) {
    throw new Error("Plan label must be 120 characters or less.");
  }

  if (!/^[a-z]{3}$/.test(currency)) {
    throw new Error("Currency must be a three-letter lowercase currency code.");
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    throw new Error(
      "Monthly amount must be greater than zero and no more than 1,000,000."
    );
  }

  if (!intervals.has(input.interval)) {
    throw new Error("Billing interval must be day, week, month, or year.");
  }

  return {
    planLabel,
    currency,
    unitAmountCents: Math.round(amount * 100),
    interval: input.interval as NormalizedBillingPlanSetup["interval"]
  };
}

export function buildBillingOperationsSummary(
  tenants: BillingOperationsTenantInput[]
): BillingOperationsSummary {
  const lastWebhookReceivedAt =
    tenants
      .map((tenant) => tenant.stripeLastWebhookReceivedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

  return {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(
      (tenant) =>
        tenant.tenantStatus === "active" && tenant.lifecycleState === "active"
    ).length,
    manualEvidenceReceived: tenants.filter(
      (tenant) => tenant.founderBilling.evidenceReceivedAt
    ).length,
    stripeCustomerReferences: tenants.filter(
      (tenant) => tenant.stripeCustomerId
    ).length,
    stripeSubscriptionReferences: tenants.filter(
      (tenant) => tenant.stripeSubscriptionId
    ).length,
    activeOrTrialingSubscriptions: tenants.filter((tenant) =>
      ["active", "trialing"].includes(tenant.stripeSubscriptionStatus ?? "")
    ).length,
    tenantsAwaitingManualActivation: tenants.filter(
      (tenant) =>
        ["active", "trialing"].includes(
          tenant.stripeSubscriptionStatus ?? ""
        ) &&
        (tenant.tenantStatus !== "active" || tenant.lifecycleState !== "active")
    ).length,
    lastWebhookReceivedAt
  };
}

export function getTenantBillingNextAction(
  tenant: BillingOperationsTenantInput,
  config: Pick<
    StripeBillingConfigurationHealth,
    "testCheckoutReady" | "webhookReady"
  >
) {
  if (!tenant.hasCompanyProfile) {
    return "Complete company setup before billing review";
  }

  if (!tenant.stripeCustomerId && !config.testCheckoutReady) {
    return "Finish test-mode Stripe configuration";
  }

  if (!tenant.stripeSubscriptionId && config.testCheckoutReady) {
    return "Start tenant checkout from setup billing";
  }

  if (tenant.stripeSubscriptionId && !config.webhookReady) {
    return "Configure signed webhook replay";
  }

  if (
    ["active", "trialing"].includes(tenant.stripeSubscriptionStatus ?? "") &&
    (tenant.tenantStatus !== "active" || tenant.lifecycleState !== "active")
  ) {
    return "Review activation manually";
  }

  if (
    !tenant.founderBilling.evidenceReceivedAt &&
    !tenant.stripeSubscriptionId &&
    tenant.founderBilling.status !== "evidence_received"
  ) {
    return "Collect billing evidence or run test checkout";
  }

  return "Monitor billing status";
}
