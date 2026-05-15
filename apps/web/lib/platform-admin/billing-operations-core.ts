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
  | "missing"
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
  statusLabel: string;
  recoveryHint: string | null;
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
  productPriceSetupReady: boolean;
  productPriceSetupBlockedReason: string | null;
  webhookReplayReady: boolean;
  webhookReplayBlockedReason: string | null;
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

export function classifyStripeSecretKeyMode(value: string | null | undefined) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "missing" satisfies StripeReferenceMode;
  }

  const normalized = value.trim();

  if (normalized.startsWith("sk_test_")) {
    return "test" satisfies StripeReferenceMode;
  }

  if (normalized.startsWith("sk_live_")) {
    return "live" satisfies StripeReferenceMode;
  }

  return "unknown" satisfies StripeReferenceMode;
}

export function classifyStripePublishableKeyMode(
  value: string | null | undefined
) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "missing" satisfies StripeReferenceMode;
  }

  const normalized = value.trim();

  if (normalized.startsWith("pk_test_")) {
    return "test" satisfies StripeReferenceMode;
  }

  if (normalized.startsWith("pk_live_")) {
    return "live" satisfies StripeReferenceMode;
  }

  return "unknown" satisfies StripeReferenceMode;
}

export function inferStripeKeyMode(value: string | null | undefined) {
  return classifyStripeSecretKeyMode(value);
}

function item(
  name: string,
  value: string | null | undefined,
  description: string,
  mode: StripeReferenceMode = "not_applicable",
  recoveryHint: string | null = null,
  statusLabel?: string
): StripeBillingConfigItem {
  const configured = hasValue(value);

  return {
    name,
    configured,
    mode,
    description,
    statusLabel: statusLabel ?? (configured ? "Configured" : "Missing"),
    recoveryHint
  };
}

export function buildStripeBillingConfigurationHealth(
  input: StripeBillingEnvironmentInput
): StripeBillingConfigurationHealth {
  const secretMode = classifyStripeSecretKeyMode(input.stripeSecretKey);
  const publishableMode = classifyStripePublishableKeyMode(
    input.stripePublishableKey
  );
  const secretKeyRecoveryHint =
    secretMode === "missing"
      ? "Add STRIPE_SECRET_KEY with a Stripe test secret key that starts with sk_test_, then restart the app."
      : secretMode === "unknown"
        ? "STRIPE_SECRET_KEY is configured, but its mode could not be verified. Use a Stripe test secret key that starts with sk_test_ for this setup path, then restart the app."
        : secretMode === "live"
          ? "Live-mode secret keys are refused for this test setup path. Replace with a sk_test_ key before creating test resources."
          : null;
  const publishableKeyRecoveryHint =
    publishableMode === "missing"
      ? "Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY with a Stripe test publishable key that starts with pk_test_, then restart the app."
      : publishableMode === "unknown"
        ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured, but its mode could not be verified. Use a pk_test_ key for local test Checkout."
        : publishableMode === "live"
          ? "Live-mode publishable keys are not part of the test-mode replay path. Replace with pk_test_ before test Checkout."
          : null;
  const items = [
    item(
      "STRIPE_SECRET_KEY",
      input.stripeSecretKey,
      "Server-side Stripe API key for SaaS billing setup and Checkout.",
      secretMode,
      secretKeyRecoveryHint,
      secretMode === "unknown"
        ? "Configured, mode not verified"
        : undefined
    ),
    item(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      input.stripePublishableKey,
      "Browser-safe publishable key used by tenant billing setup.",
      publishableMode,
      publishableKeyRecoveryHint,
      publishableMode === "unknown"
        ? "Configured, mode not verified"
        : undefined
    ),
    item(
      "STRIPE_FOUNDER_PLAN_PRICE_ID",
      input.stripeFounderPlanPriceId,
      "Env fallback SaaS subscription price reference used when platform settings do not have a price.",
      "not_applicable",
      hasValue(input.stripeFounderPlanPriceId)
        ? null
        : "Optional fallback is missing. Billing Operations can replace this dependency by storing a platform price reference."
    ),
    item(
      "Platform billing price reference",
      input.platformStripePriceId,
      "App-managed non-secret SaaS price reference stored in platform billing settings.",
      "not_applicable",
      hasValue(input.platformStripePriceId)
        ? null
        : "Create or discover the test founder plan from Billing Operations after STRIPE_SECRET_KEY is confirmed as sk_test_."
    ),
    item(
      "STRIPE_WEBHOOK_SECRET",
      input.stripeWebhookSecret,
      "Signed webhook endpoint secret for SaaS subscription reconciliation.",
      "not_applicable",
      hasValue(input.stripeWebhookSecret)
        ? null
        : "Webhook replay is blocked until Stripe CLI or Dashboard endpoint setup provides STRIPE_WEBHOOK_SECRET; restart the app after changing env."
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
  const productPriceSetupReady = secretMode === "test";
  const productPriceSetupBlockedReason = productPriceSetupReady
    ? null
    : secretMode === "missing"
      ? "STRIPE_SECRET_KEY is missing; add a test secret key that starts with sk_test_ before creating test Product/Price resources."
      : secretMode === "live"
        ? "STRIPE_SECRET_KEY appears to be live-mode; Billing Operations refuses live Product/Price setup in this phase."
        : "STRIPE_SECRET_KEY is configured, but its mode could not be verified. Use sk_test_ for test Product/Price setup.";
  const webhookReplayReady = webhookReady;
  const webhookReplayBlockedReason = webhookReplayReady
    ? null
    : "Replay is blocked until STRIPE_WEBHOOK_SECRET is configured from Stripe CLI or a Stripe Dashboard webhook endpoint, then the app is restarted.";
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
  } else if (secretMode === "unknown" || publishableMode === "unknown") {
    warnings.push(
      "A Stripe key is configured, but its mode could not be verified from the expected test/live prefix."
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
    productPriceSetupReady,
    productPriceSetupBlockedReason,
    webhookReplayReady,
    webhookReplayBlockedReason,
    warnings
  };
}

export function getStripeTestSecretKeyReadiness(
  value: string | null | undefined
) {
  const mode = classifyStripeSecretKeyMode(value);

  if (!value || value.trim().length === 0) {
    return {
      canManageTestResources: false,
      mode,
      reason:
        "STRIPE_SECRET_KEY is missing. Add a Stripe test secret key that starts with sk_test_ before creating test Product/Price resources."
    };
  }

  if (mode !== "test") {
    return {
      canManageTestResources: false,
      mode,
      reason:
        mode === "live"
          ? "Live-mode Stripe keys cannot create Billing Operations test plans."
          : "Stripe secret key mode is unknown; expected a test secret key that starts with sk_test_."
    };
  }

  return {
    canManageTestResources: true,
    mode,
    reason: null
  };
}

export function getSafeStripeTestPlanSetupErrorMessage(error: unknown) {
  const fallback =
    "Unable to create or discover the Stripe test plan. Review Stripe test-mode credentials and try again.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  const safeMessages = [
    "STRIPE_SECRET_KEY is missing. Add a Stripe test secret key that starts with sk_test_ before creating test Product/Price resources.",
    "Live-mode Stripe keys cannot create Billing Operations test plans.",
    "Stripe secret key mode is unknown; expected a test secret key that starts with sk_test_.",
    "Plan label must be 120 characters or less.",
    "Currency must be a three-letter lowercase currency code.",
    "Monthly amount must be greater than zero and no more than 1,000,000.",
    "Billing interval must be day, week, month, or year."
  ];

  return safeMessages.includes(error.message) ? error.message : fallback;
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
