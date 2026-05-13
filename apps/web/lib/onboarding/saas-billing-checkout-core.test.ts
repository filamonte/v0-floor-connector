import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSaasBillingCheckoutSessionFormData,
  getSaasBillingCheckoutAvailability,
  normalizeStripeSubscriptionStatus
} from "./saas-billing-checkout-core";

void test("requires Stripe test mode and a founder price before checkout is available", () => {
  assert.deepEqual(
    getSaasBillingCheckoutAvailability({
      stripeMode: "test",
      priceIdConfigured: true,
      userCanManageBilling: true
    }),
    {
      canStartCheckout: true,
      reason: null
    }
  );

  assert.match(
    getSaasBillingCheckoutAvailability({
      stripeMode: "live",
      priceIdConfigured: true,
      userCanManageBilling: true
    }).reason ?? "",
    /test mode/i
  );
  assert.match(
    getSaasBillingCheckoutAvailability({
      stripeMode: "test",
      priceIdConfigured: false,
      userCanManageBilling: true
    }).reason ?? "",
    /price/i
  );
  assert.match(
    getSaasBillingCheckoutAvailability({
      stripeMode: "test",
      priceIdConfigured: true,
      userCanManageBilling: false
    }).reason ?? "",
    /owner or admin/i
  );
});

void test("builds subscription checkout form data with SaaS-only metadata", () => {
  const formData = buildSaasBillingCheckoutSessionFormData({
    companyId: "company-123",
    stripeCustomerId: "cus_123",
    priceId: "price_123",
    appUrl: "https://app.floorconnector.test/",
    environment: "test"
  });

  assert.equal(formData.get("mode"), "subscription");
  assert.equal(formData.get("customer"), "cus_123");
  assert.equal(formData.get("client_reference_id"), "company-123");
  assert.equal(formData.get("line_items[0][price]"), "price_123");
  assert.equal(formData.get("line_items[0][quantity]"), "1");
  assert.equal(formData.get("metadata[company_id]"), "company-123");
  assert.equal(formData.get("metadata[billing_domain]"), "floorconnector_saas");
  assert.equal(formData.get("metadata[environment]"), "test");
  assert.equal(formData.get("subscription_data[metadata][company_id]"), "company-123");
  assert.equal(
    formData.get("subscription_data[metadata][billing_domain]"),
    "floorconnector_saas"
  );
  assert.equal(formData.get("subscription_data[metadata][environment]"), "test");
  assert.equal(
    formData.get("success_url"),
    "https://app.floorconnector.test/setup/billing?billing_checkout=returned"
  );
  assert.equal(
    formData.get("cancel_url"),
    "https://app.floorconnector.test/setup/billing?billing_checkout=cancelled"
  );
});

void test("normalizes Stripe subscription statuses for future webhook handling", () => {
  assert.equal(normalizeStripeSubscriptionStatus("active"), "active");
  assert.equal(normalizeStripeSubscriptionStatus("trialing"), "trialing");
  assert.equal(normalizeStripeSubscriptionStatus("past_due"), "past_due");
  assert.equal(normalizeStripeSubscriptionStatus("canceled"), "canceled");
  assert.equal(normalizeStripeSubscriptionStatus("unpaid"), "unpaid");
  assert.equal(normalizeStripeSubscriptionStatus("incomplete"), "incomplete");
  assert.equal(
    normalizeStripeSubscriptionStatus("incomplete_expired"),
    "incomplete_expired"
  );
  assert.equal(normalizeStripeSubscriptionStatus("paused"), "paused");
  assert.equal(normalizeStripeSubscriptionStatus("unknown"), null);
});
