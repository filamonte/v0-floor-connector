export type PlatformPackageGovernanceTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type PlatformPackageGovernanceStripeMode =
  | "not_configured"
  | "test"
  | "live"
  | "mixed";

export type PlatformPackageGovernanceTenant = {
  id: string;
  slug: string;
  name: string;
  tenantStatus: string;
  lifecycleState: string;
  planKey: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  subscriptionLifecycleState: string | null;
  hasStripeCustomerRef: boolean;
  hasStripePaymentMethod: boolean;
  createdAt: string;
};

export type PlatformPackageGovernanceStripeReadiness = {
  publishableKeyConfigured: boolean;
  secretKeyConfigured: boolean;
  stripeMode: PlatformPackageGovernanceStripeMode;
};

export type PlatformPackageGovernanceInput = {
  generatedAt: string;
  tenants: PlatformPackageGovernanceTenant[];
  stripeReadiness: PlatformPackageGovernanceStripeReadiness;
};

export type PlatformPackageGovernanceSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: PlatformPackageGovernanceTone;
  description: string;
};

export type PlatformPackageGovernanceBucket = {
  key: string;
  label: string;
  count: number;
  description: string;
};

export type PlatformPackageGovernanceTenantRow = {
  id: string;
  organizationLabel: string;
  tenantStatus: string;
  lifecycleState: string;
  planLabel: string;
  subscriptionStatusLabel: string;
  billingSetupLabel: string;
  earlyAccessLabel: string;
  caveats: string[];
};

export type PlatformPackageGovernanceModel = {
  generatedAt: string;
  readOnly: true;
  mutationControlsAvailable: false;
  summaryCards: PlatformPackageGovernanceSummaryCard[];
  planBuckets: PlatformPackageGovernanceBucket[];
  tenantStatusBuckets: PlatformPackageGovernanceBucket[];
  lifecycleBuckets: PlatformPackageGovernanceBucket[];
  billingReadinessBuckets: PlatformPackageGovernanceBucket[];
  earlyAccessBuckets: PlatformPackageGovernanceBucket[];
  tenantRows: PlatformPackageGovernanceTenantRow[];
  stripeReadinessNotes: string[];
  caveats: string[];
  operatorGuidance: string[];
  futureControls: string[];
};

function countBy<T>(
  values: T[],
  keyForValue: (value: T) => string,
  labelForKey: (key: string) => string,
  descriptionForKey: (key: string, count: number) => string
): PlatformPackageGovernanceBucket[] {
  const counts = values.reduce((map, value) => {
    const key = keyForValue(value);
    map.set(key, (map.get(key) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      label: labelForKey(key),
      count,
      description: descriptionForKey(key, count)
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function displayLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 120 ? `${normalized.slice(0, 117).trimEnd()}...` : normalized;
}

function planKey(tenant: PlatformPackageGovernanceTenant) {
  return tenant.planKey ?? tenant.planName ?? "missing_plan";
}

function planLabel(tenant: PlatformPackageGovernanceTenant) {
  return tenant.planName ?? tenant.planKey ?? "No known package / plan";
}

function billingReadinessKey(tenant: PlatformPackageGovernanceTenant) {
  if (tenant.hasStripePaymentMethod) {
    return "payment_method_saved";
  }

  if (tenant.hasStripeCustomerRef) {
    return "stripe_customer_only";
  }

  return "billing_setup_pending";
}

function billingReadinessLabel(key: string) {
  switch (key) {
    case "payment_method_saved":
      return "Payment method saved";
    case "stripe_customer_only":
      return "Stripe customer only";
    default:
      return "Billing setup pending";
  }
}

function earlyAccessKey(tenant: PlatformPackageGovernanceTenant) {
  return tenant.tenantStatus === "active" && tenant.lifecycleState === "active"
    ? "active"
    : "early_access_or_activation_pending";
}

function earlyAccessLabel(key: string) {
  return key === "active" ? "Active" : "Early access / activation pending";
}

function subscriptionStatusLabel(tenant: PlatformPackageGovernanceTenant) {
  if (!tenant.subscriptionStatus && !tenant.subscriptionLifecycleState) {
    return "No subscription record";
  }

  if (!tenant.subscriptionLifecycleState) {
    return tenant.subscriptionStatus ?? "No subscription record";
  }

  if (!tenant.subscriptionStatus) {
    return tenant.subscriptionLifecycleState;
  }

  return `${tenant.subscriptionStatus} / ${tenant.subscriptionLifecycleState}`;
}

function buildTenantRow(
  tenant: PlatformPackageGovernanceTenant
): PlatformPackageGovernanceTenantRow {
  const caveats: string[] = [];

  if (!tenant.planKey && !tenant.planName) {
    caveats.push("No current package or subscription plan is recorded.");
  }

  if (!tenant.hasStripePaymentMethod) {
    caveats.push("No saved billing payment-method reference is recorded.");
  }

  if (earlyAccessKey(tenant) !== "active") {
    caveats.push("Activation is not fully active, so external production actions stay guarded elsewhere.");
  }

  return {
    id: tenant.id,
    organizationLabel: displayLabel(tenant.name || tenant.slug, "Unnamed organization"),
    tenantStatus: displayLabel(tenant.tenantStatus, "Unknown"),
    lifecycleState: displayLabel(tenant.lifecycleState, "Unknown"),
    planLabel: displayLabel(planLabel(tenant), "No known package / plan"),
    subscriptionStatusLabel: displayLabel(
      subscriptionStatusLabel(tenant),
      "No subscription record"
    ),
    billingSetupLabel: billingReadinessLabel(billingReadinessKey(tenant)),
    earlyAccessLabel: earlyAccessLabel(earlyAccessKey(tenant)),
    caveats
  };
}

function stripeReadinessNotes(
  readiness: PlatformPackageGovernanceStripeReadiness
) {
  const notes = [
    readiness.publishableKeyConfigured
      ? "Stripe publishable-key presence is configured."
      : "Stripe publishable-key presence is not configured.",
    readiness.secretKeyConfigured
      ? "Stripe secret-key presence is configured server-side."
      : "Stripe secret-key presence is not configured server-side."
  ];

  if (readiness.stripeMode === "mixed") {
    notes.push("Stripe key mode appears mixed; card collection readiness should be verified in setup before activation.");
  } else if (readiness.stripeMode === "not_configured") {
    notes.push("Stripe card collection is not fully configured, so billing setup may remain deferred.");
  } else {
    notes.push(`Stripe key mode is ${readiness.stripeMode}; this page does not call Stripe or verify provider state.`);
  }

  return notes;
}

export function buildPlatformPackageGovernance(
  input: PlatformPackageGovernanceInput
): PlatformPackageGovernanceModel {
  const tenants = input.tenants;
  const tenantsWithKnownPlan = tenants.filter(
    (tenant) => Boolean(tenant.planKey) || Boolean(tenant.planName)
  );
  const tenantsWithPaymentMethod = tenants.filter(
    (tenant) => tenant.hasStripePaymentMethod
  );
  const earlyAccessTenants = tenants.filter(
    (tenant) => earlyAccessKey(tenant) !== "active"
  );
  const tenantRows = tenants.map(buildTenantRow);

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    mutationControlsAvailable: false,
    summaryCards: [
      {
        id: "tenant-count",
        label: "Tenant organizations",
        value: tenants.length,
        tone: "neutral",
        description: "Existing companies loaded for package and billing governance review."
      },
      {
        id: "known-plan-count",
        label: "Known plans",
        value: tenantsWithKnownPlan.length,
        tone: tenantsWithKnownPlan.length === tenants.length ? "good" : "warning",
        description: "Organizations with an existing subscription plan reference."
      },
      {
        id: "missing-plan-count",
        label: "No known plan",
        value: tenants.length - tenantsWithKnownPlan.length,
        tone: tenants.length === tenantsWithKnownPlan.length ? "good" : "warning",
        description: "Organizations missing current package or plan data in existing records."
      },
      {
        id: "payment-method-count",
        label: "Billing setup complete",
        value: tenantsWithPaymentMethod.length,
        tone: tenantsWithPaymentMethod.length > 0 ? "good" : "neutral",
        description: "Organizations with a saved Stripe payment-method reference on the company record."
      },
      {
        id: "billing-pending-count",
        label: "Billing setup pending",
        value: tenants.length - tenantsWithPaymentMethod.length,
        tone: tenants.length === tenantsWithPaymentMethod.length ? "good" : "warning",
        description: "Organizations without a saved payment-method reference."
      },
      {
        id: "early-access-count",
        label: "Activation pending",
        value: earlyAccessTenants.length,
        tone: earlyAccessTenants.length > 0 ? "warning" : "good",
        description: "Tenant status or lifecycle state is not fully active."
      }
    ],
    planBuckets: countBy(
      tenants,
      planKey,
      (key) => (key === "missing_plan" ? "No known package / plan" : key),
      (key) =>
        key === "missing_plan"
          ? "No existing subscription plan data is available for these organizations."
          : "Existing subscription plan reference from company_subscriptions."
    ),
    tenantStatusBuckets: countBy(
      tenants,
      (tenant) => tenant.tenantStatus || "unknown",
      (key) => key,
      () => "Current tenant status from companies."
    ),
    lifecycleBuckets: countBy(
      tenants,
      (tenant) => tenant.lifecycleState || "unknown",
      (key) => key,
      () => "Current lifecycle state from companies."
    ),
    billingReadinessBuckets: countBy(
      tenants,
      billingReadinessKey,
      billingReadinessLabel,
      (key) =>
        key === "payment_method_saved"
          ? "A safe payment-method reference exists; no provider verification is performed here."
          : "Billing setup is incomplete or only partially represented in existing company records."
    ),
    earlyAccessBuckets: countBy(
      tenants,
      earlyAccessKey,
      earlyAccessLabel,
      (key) =>
        key === "active"
          ? "Tenant status and lifecycle state are both active."
          : "Tenant status or lifecycle state still reflects early access, trial, or pending activation."
    ),
    tenantRows,
    stripeReadinessNotes: stripeReadinessNotes(input.stripeReadiness),
    caveats: [
      "Package and billing plan state is inferred only from existing companies, company_subscriptions, and subscription_plans records.",
      "A missing package or plan may mean no current subscription row has been modeled for that organization yet.",
      "Billing setup readiness uses safe stored references only; this page does not call Stripe or validate remote customers, payment methods, subscriptions, invoices, or charges.",
      "Plan-tier targeting remains planning-only and does not enforce starter packs, contractor groups, entitlements, module access, pricing, or runtime behavior."
    ],
    operatorGuidance: [
      "Use this page to inspect current package, subscription-plan, tenant activation, and billing setup readiness signals.",
      "Treat missing plan rows as governance follow-up, not as a runtime blocker created by this surface.",
      "Use the existing billing setup and activation workflows for any real operator action; this page does not change records."
    ],
    futureControls: [
      "Future package management needs explicit plan/package semantics before any control is added.",
      "Future entitlement or module gating must be modeled and enforced separately at server boundaries.",
      "Future Stripe subscription creation, update, cancel, invoice, or charge workflows are not part of this read-only foundation.",
      "Future contractor-facing package visibility must be designed separately from this platform-admin observability page."
    ]
  };
}
