import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBillingOperationsSummary,
  buildStripeBillingConfigurationHealth,
  getStripeTestSecretKeyReadiness,
  getTenantBillingNextAction,
  normalizeBillingPlanSetupInput,
  type BillingOperationsTenantInput
} from "./billing-operations-core";

function tenant(
  overrides: Partial<BillingOperationsTenantInput> = {}
): BillingOperationsTenantInput {
  return {
    tenantStatus: "trialing",
    lifecycleState: "trial",
    hasCompanyProfile: true,
    hasPaymentMethod: false,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeSubscriptionStatus: null,
    stripeLastWebhookReceivedAt: null,
    founderBilling: {
      status: "pending",
      evidenceReceivedAt: null
    },
    ...overrides
  };
}

void test("reports Stripe SaaS billing env status without exposing values", () => {
  const health = buildStripeBillingConfigurationHealth({
    stripeSecretKey: "sk_test_redacted",
    stripePublishableKey: "pk_test_redacted",
    stripeFounderPlanPriceId: "price_redacted",
    platformStripePriceId: null,
    stripeWebhookSecret: "whsec_redacted"
  });

  assert.equal(health.checkoutReady, true);
  assert.equal(health.webhookReady, true);
  assert.equal(health.testCheckoutReady, true);
  assert.equal(health.warnings.length, 0);
  assert.deepEqual(
    health.items.map((item) => ({
      name: item.name,
      configured: item.configured,
      mode: item.mode
    })),
    [
      { name: "STRIPE_SECRET_KEY", configured: true, mode: "test" },
      {
        name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        configured: true,
        mode: "test"
      },
      {
        name: "STRIPE_FOUNDER_PLAN_PRICE_ID",
        configured: true,
        mode: "not_applicable"
      },
      {
        name: "Platform billing price reference",
        configured: false,
        mode: "not_applicable"
      },
      {
        name: "STRIPE_WEBHOOK_SECRET",
        configured: true,
        mode: "not_applicable"
      }
    ]
  );
});

void test("blocks test checkout when config is missing or live mode appears", () => {
  const missing = buildStripeBillingConfigurationHealth({
    stripeSecretKey: "sk_test_redacted",
    stripePublishableKey: "pk_test_redacted",
    stripeFounderPlanPriceId: "",
    platformStripePriceId: null,
    stripeWebhookSecret: null
  });
  const live = buildStripeBillingConfigurationHealth({
    stripeSecretKey: "sk_live_redacted",
    stripePublishableKey: "pk_live_redacted",
    stripeFounderPlanPriceId: "price_redacted",
    platformStripePriceId: null,
    stripeWebhookSecret: "whsec_redacted"
  });

  assert.equal(missing.checkoutReady, false);
  assert.equal(missing.webhookReady, false);
  assert.equal(missing.testCheckoutReady, false);
  assert.match(missing.warnings.join(" "), /SaaS Checkout is unavailable/);
  assert.equal(live.checkoutReady, true);
  assert.equal(live.testCheckoutReady, false);
  assert.match(live.warnings.join(" "), /live-mode Stripe key/);
});

void test("prefers platform price reference over env fallback for checkout readiness", () => {
  const platform = buildStripeBillingConfigurationHealth({
    stripeSecretKey: "sk_test_redacted",
    stripePublishableKey: "pk_test_redacted",
    stripeFounderPlanPriceId: "",
    platformStripePriceId: "price_platform",
    stripeWebhookSecret: ""
  });
  const env = buildStripeBillingConfigurationHealth({
    stripeSecretKey: "sk_test_redacted",
    stripePublishableKey: "pk_test_redacted",
    stripeFounderPlanPriceId: "price_env",
    platformStripePriceId: null,
    stripeWebhookSecret: ""
  });

  assert.equal(platform.checkoutReady, true);
  assert.equal(platform.testCheckoutReady, true);
  assert.equal(platform.priceReferenceSource, "platform_settings");
  assert.equal(env.priceReferenceSource, "env");
});

void test("guards Stripe product and price setup to test-mode secret keys", () => {
  assert.equal(
    getStripeTestSecretKeyReadiness("sk_test_redacted").canManageTestResources,
    true
  );
  assert.equal(
    getStripeTestSecretKeyReadiness("sk_live_redacted").canManageTestResources,
    false
  );
  assert.equal(
    getStripeTestSecretKeyReadiness("not-a-key").canManageTestResources,
    false
  );
});

void test("normalizes test billing plan setup without exposing Stripe values", () => {
  const setup = normalizeBillingPlanSetupInput({
    stripeSecretKey: "sk_test_redacted",
    planLabel: " Founder plan ",
    amountDollars: "499.00",
    currency: "USD",
    interval: "month"
  });

  assert.deepEqual(setup, {
    planLabel: "Founder plan",
    unitAmountCents: 49900,
    currency: "usd",
    interval: "month"
  });
  assert.throws(
    () =>
      normalizeBillingPlanSetupInput({
        stripeSecretKey: "sk_live_redacted",
        planLabel: "Founder plan",
        amountDollars: "499",
        currency: "usd",
        interval: "month"
      }),
    /Live-mode Stripe keys/
  );
});

void test("summarizes tenant billing without treating subscription as activation", () => {
  const summary = buildBillingOperationsSummary([
    tenant({
      tenantStatus: "active",
      lifecycleState: "active",
      stripeCustomerId: "cus_redacted",
      stripeSubscriptionId: "sub_redacted",
      stripeSubscriptionStatus: "active",
      stripeLastWebhookReceivedAt: "2026-05-13T12:00:00.000Z",
      founderBilling: {
        status: "evidence_received",
        evidenceReceivedAt: "2026-05-13T10:00:00.000Z"
      }
    }),
    tenant({
      tenantStatus: "trialing",
      lifecycleState: "trial",
      stripeSubscriptionId: "sub_pending",
      stripeSubscriptionStatus: "trialing",
      stripeLastWebhookReceivedAt: "2026-05-14T12:00:00.000Z"
    }),
    tenant()
  ]);

  assert.equal(summary.totalTenants, 3);
  assert.equal(summary.activeTenants, 1);
  assert.equal(summary.manualEvidenceReceived, 1);
  assert.equal(summary.stripeCustomerReferences, 1);
  assert.equal(summary.stripeSubscriptionReferences, 2);
  assert.equal(summary.activeOrTrialingSubscriptions, 2);
  assert.equal(summary.tenantsAwaitingManualActivation, 1);
  assert.equal(summary.lastWebhookReceivedAt, "2026-05-14T12:00:00.000Z");
});

void test("chooses operator next actions for billing readiness", () => {
  const blockedConfig = { testCheckoutReady: false, webhookReady: false };
  const readyConfig = { testCheckoutReady: true, webhookReady: true };

  assert.equal(
    getTenantBillingNextAction(
      tenant({ hasCompanyProfile: false }),
      readyConfig
    ),
    "Complete company setup before billing review"
  );
  assert.equal(
    getTenantBillingNextAction(tenant(), blockedConfig),
    "Finish test-mode Stripe configuration"
  );
  assert.equal(
    getTenantBillingNextAction(tenant(), readyConfig),
    "Start tenant checkout from setup billing"
  );
  assert.equal(
    getTenantBillingNextAction(
      tenant({
        tenantStatus: "trialing",
        lifecycleState: "trial",
        stripeSubscriptionId: "sub_redacted",
        stripeSubscriptionStatus: "active"
      }),
      readyConfig
    ),
    "Review activation manually"
  );
});
