import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";

import {
  mapSaasBillingWebhookEvent,
  verifyStripeWebhookSignature
} from "./saas-billing-webhook-core";

const created = 1_778_688_000;

function signPayload(rawBody: string, secret = "whsec_test", timestamp = "1778688000") {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}

void test("maps checkout completion only when SaaS billing metadata is present", () => {
  const result = mapSaasBillingWebhookEvent({
    id: "evt_checkout",
    type: "checkout.session.completed",
    created,
    data: {
      object: {
        id: "cs_test_123",
        object: "checkout.session",
        mode: "subscription",
        customer: "cus_123",
        subscription: "sub_123",
        metadata: {
          billing_domain: "floorconnector_saas",
          company_id: "company-123",
          environment: "test"
        }
      }
    }
  });

  assert.equal(result.outcome, "process");
  assert.equal(result.companyId, "company-123");
  assert.equal(result.stripeCustomerId, "cus_123");
  assert.equal(result.stripeSubscriptionId, "sub_123");
  assert.equal(result.stripeCheckoutSessionId, "cs_test_123");
  assert.equal(result.stripeLastEventId, "evt_checkout");
});

void test("ignores events from another billing domain", () => {
  const result = mapSaasBillingWebhookEvent({
    id: "evt_payment",
    type: "invoice.paid",
    created,
    data: {
      object: {
        id: "in_123",
        object: "invoice",
        customer: "cus_123",
        subscription: "sub_123",
        metadata: {
          billing_domain: "contractor_customer_invoice",
          company_id: "company-123"
        }
      }
    }
  });

  assert.deepEqual(result, {
    outcome: "ignore",
    eventId: "evt_payment",
    eventType: "invoice.paid",
    reason: "not_saas_billing_domain"
  });
});

void test("ignores SaaS events missing company id", () => {
  const result = mapSaasBillingWebhookEvent({
    id: "evt_missing_company",
    type: "customer.subscription.updated",
    created,
    data: {
      object: {
        id: "sub_123",
        object: "subscription",
        status: "active",
        customer: "cus_123",
        metadata: {
          billing_domain: "floorconnector_saas"
        }
      }
    }
  });

  assert.equal(result.outcome, "ignore");
  assert.equal(result.reason, "missing_company_id");
});

void test("can ignore a repeated provider event id before database writes", () => {
  const result = mapSaasBillingWebhookEvent(
    {
      id: "evt_duplicate",
      type: "customer.subscription.updated",
      created,
      data: {
        object: {
          id: "sub_123",
          object: "subscription",
          status: "active",
          customer: "cus_123",
          metadata: {
            billing_domain: "floorconnector_saas",
            company_id: "company-123"
          }
        }
      }
    },
    { lastProcessedEventId: "evt_duplicate" }
  );

  assert.deepEqual(result, {
    outcome: "ignore",
    eventId: "evt_duplicate",
    eventType: "customer.subscription.updated",
    reason: "duplicate_provider_event"
  });
});

void test("normalizes subscription lifecycle events and price/current period fields", () => {
  const result = mapSaasBillingWebhookEvent({
    id: "evt_subscription",
    type: "customer.subscription.updated",
    created,
    data: {
      object: {
        id: "sub_123",
        object: "subscription",
        status: "past_due",
        customer: "cus_123",
        current_period_end: 1_779_552_000,
        metadata: {
          billing_domain: "floorconnector_saas",
          company_id: "company-123"
        },
        items: {
          data: [
            {
              price: {
                id: "price_123"
              }
            }
          ]
        }
      }
    }
  });

  assert.equal(result.outcome, "process");
  assert.equal(result.stripeSubscriptionStatus, "past_due");
  assert.equal(result.stripeCurrentPeriodEnd, "2026-05-23T16:00:00.000Z");
  assert.equal(result.stripePriceId, "price_123");
});

void test("maps invoice payment failure to SaaS subscription review state without invoice ids", () => {
  const result = mapSaasBillingWebhookEvent({
    id: "evt_invoice_failed",
    type: "invoice.payment_failed",
    created,
    data: {
      object: {
        id: "in_123",
        object: "invoice",
        customer: "cus_123",
        subscription: "sub_123",
        subscription_details: {
          metadata: {
            billing_domain: "floorconnector_saas",
            company_id: "company-123"
          }
        },
        lines: {
          data: [
            {
              price: {
                id: "price_123"
              },
              period: {
                end: 1_779_552_000
              }
            }
          ]
        }
      }
    }
  });

  assert.equal(result.outcome, "process");
  assert.equal(result.stripeSubscriptionStatus, "past_due");
  assert.equal(result.stripeSubscriptionId, "sub_123");
  assert.equal(result.stripePriceId, "price_123");
  assert.equal(result.stripeCurrentPeriodEnd, "2026-05-23T16:00:00.000Z");
});

void test("verifies Stripe webhook signatures with the raw body", () => {
  const rawBody = JSON.stringify({ id: "evt_123" });
  const signature = signPayload(rawBody);

  assert.doesNotThrow(() =>
    verifyStripeWebhookSignature({
      rawBody,
      signatureHeader: signature,
      secret: "whsec_test",
      nowMs: created * 1000
    })
  );

  assert.throws(
    () =>
      verifyStripeWebhookSignature({
        rawBody: JSON.stringify({ id: "evt_changed" }),
        signatureHeader: signature,
        secret: "whsec_test",
        nowMs: created * 1000
      }),
    /verification failed/i
  );
});
