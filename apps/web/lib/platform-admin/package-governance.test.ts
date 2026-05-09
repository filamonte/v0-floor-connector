import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPlatformPackageGovernance,
  type PlatformPackageGovernanceInput
} from "./package-governance-core";

function makeInput(
  overrides: Partial<PlatformPackageGovernanceInput> = {}
): PlatformPackageGovernanceInput {
  return {
    generatedAt: "2026-05-08T12:00:00.000Z",
    stripeReadiness: {
      publishableKeyConfigured: true,
      secretKeyConfigured: false,
      stripeMode: "not_configured"
    },
    tenants: [
      {
        id: "org-1",
        slug: "acme-floors",
        name: "Acme Floors",
        tenantStatus: "active",
        lifecycleState: "active",
        planKey: "pro",
        planName: "Pro",
        subscriptionStatus: "active",
        subscriptionLifecycleState: "active",
        hasStripeCustomerRef: true,
        hasStripePaymentMethod: true,
        createdAt: "2026-05-01T00:00:00.000Z"
      },
      {
        id: "org-2",
        slug: "trial-floors",
        name: "Trial Floors",
        tenantStatus: "trialing",
        lifecycleState: "trial",
        planKey: null,
        planName: null,
        subscriptionStatus: null,
        subscriptionLifecycleState: null,
        hasStripeCustomerRef: false,
        hasStripePaymentMethod: false,
        createdAt: "2026-05-02T00:00:00.000Z"
      }
    ],
    ...overrides
  };
}

void test("builds package and billing summary counts from existing records", () => {
  const model = buildPlatformPackageGovernance(makeInput());
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(byId.get("tenant-count")?.value, 2);
  assert.equal(byId.get("known-plan-count")?.value, 1);
  assert.equal(byId.get("missing-plan-count")?.value, 1);
  assert.equal(byId.get("payment-method-count")?.value, 1);
  assert.equal(byId.get("billing-pending-count")?.value, 1);
  assert.equal(byId.get("early-access-count")?.value, 1);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
});

void test("surfaces missing package caveats per tenant and overall", () => {
  const model = buildPlatformPackageGovernance(makeInput());
  const missingPlanTenant = model.tenantRows.find((row) => row.id === "org-2");

  assert.ok(missingPlanTenant);
  assert.equal(missingPlanTenant?.planLabel, "No known package / plan");
  assert.match(missingPlanTenant?.caveats.join(" ") ?? "", /No current package/);
  assert.match(model.caveats.join(" "), /company_subscriptions/);
});

void test("records billing setup readiness caveats without provider calls", () => {
  const model = buildPlatformPackageGovernance(makeInput());
  const billingBuckets = new Map(
    model.billingReadinessBuckets.map((bucket) => [bucket.key, bucket])
  );

  assert.equal(billingBuckets.get("payment_method_saved")?.count, 1);
  assert.equal(billingBuckets.get("billing_setup_pending")?.count, 1);
  assert.match(model.stripeReadinessNotes.join(" "), /not configured/);
  assert.match(model.caveats.join(" "), /does not call Stripe/);
});

void test("groups early-access and activation state from company lifecycle fields", () => {
  const model = buildPlatformPackageGovernance(makeInput());
  const earlyAccessBuckets = new Map(
    model.earlyAccessBuckets.map((bucket) => [bucket.key, bucket])
  );

  assert.equal(earlyAccessBuckets.get("active")?.count, 1);
  assert.equal(earlyAccessBuckets.get("early_access_or_activation_pending")?.count, 1);
  assert.equal(
    model.tenantRows.find((row) => row.id === "org-2")?.earlyAccessLabel,
    "Early access / activation pending"
  );
});

void test("output contains no mutation or action fields", () => {
  const model = buildPlatformPackageGovernance(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"actionAvailable\""), false);
});

void test("uses safe bounded display labels", () => {
  const model = buildPlatformPackageGovernance(
    makeInput({
      tenants: [
        {
          id: "org-long",
          slug: "long",
          name: "A".repeat(200),
          tenantStatus: "active",
          lifecycleState: "active",
          planKey: null,
          planName: null,
          subscriptionStatus: null,
          subscriptionLifecycleState: null,
          hasStripeCustomerRef: false,
          hasStripePaymentMethod: false,
          createdAt: "2026-05-01T00:00:00.000Z"
        }
      ]
    })
  );

  assert.equal(model.tenantRows[0]?.organizationLabel.endsWith("..."), true);
  assert.ok((model.tenantRows[0]?.organizationLabel.length ?? 0) <= 120);
});
