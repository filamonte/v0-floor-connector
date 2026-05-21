import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyPaymentEventEvidence,
  deriveInvoicePaymentLifecycleSummary,
  getPaymentProviderReferenceRows,
  type PaymentReconciliationEventInput
} from "./payment-reconciliation-core";

function event(
  overrides: Partial<PaymentReconciliationEventInput> = {}
): PaymentReconciliationEventInput {
  return {
    id: overrides.id ?? "event-1",
    eventType: overrides.eventType ?? "checkout_started",
    paymentId: Object.hasOwn(overrides, "paymentId")
      ? (overrides.paymentId ?? null)
      : "payment-1",
    occurredAt: overrides.occurredAt ?? "2026-05-20T12:00:00.000Z",
    gatewayProvider: Object.hasOwn(overrides, "gatewayProvider")
      ? (overrides.gatewayProvider ?? null)
      : "stripe",
    providerEventId: Object.hasOwn(overrides, "providerEventId")
      ? (overrides.providerEventId ?? null)
      : "evt_test"
  };
}

void test("payment event evidence classification keeps execution semantics read-only", () => {
  assert.deepEqual(classifyPaymentEventEvidence(event()).category, "pending");
  assert.equal(classifyPaymentEventEvidence(event()).needsReview, true);

  const succeeded = classifyPaymentEventEvidence(
    event({ eventType: "payment_succeeded" })
  );
  assert.equal(succeeded.category, "settled");
  assert.equal(succeeded.needsReview, false);

  const sync = classifyPaymentEventEvidence(event({ eventType: "provider_sync" }));
  assert.equal(sync.category, "informational");
  assert.match(sync.plainMeaning, /does not move money/);
});

void test("invoice payment lifecycle prioritizes latest failed and voided evidence while balance is open", () => {
  const failed = deriveInvoicePaymentLifecycleSummary({
    invoice: {
      status: "sent",
      balanceDueAmount: "250.00",
      totalAmount: "250.00"
    },
    payments: [{ id: "payment-1", amount: "250.00", status: "pending" }],
    events: [
      event({
        id: "older-success",
        eventType: "payment_succeeded",
        occurredAt: "2026-05-19T12:00:00.000Z"
      }),
      event({
        id: "latest-failure",
        eventType: "payment_failed",
        occurredAt: "2026-05-20T12:00:00.000Z"
      })
    ]
  });

  assert.equal(failed.status, "failed");
  assert.equal(failed.needsReview, true);
  assert.equal(failed.latestEvent?.id, "latest-failure");

  const voided = deriveInvoicePaymentLifecycleSummary({
    invoice: {
      status: "sent",
      balanceDueAmount: "250.00",
      totalAmount: "250.00"
    },
    payments: [],
    events: [event({ eventType: "payment_voided" })]
  });

  assert.equal(voided.status, "voided");
  assert.equal(voided.needsReview, true);
});

void test("invoice payment lifecycle treats zero balance as settled from canonical invoice state", () => {
  const summary = deriveInvoicePaymentLifecycleSummary({
    invoice: {
      status: "paid",
      balanceDueAmount: "0.00",
      totalAmount: "500.00"
    },
    payments: [
      { id: "payment-1", amount: "500.00", status: "recorded" }
    ],
    events: []
  });

  assert.equal(summary.status, "settled");
  assert.equal(summary.needsReview, false);
  assert.equal(summary.recordedPaymentCount, 1);
});

void test("provider reference rows expose compact references without raw payloads", () => {
  const rows = getPaymentProviderReferenceRows({
    payment: {
      id: "payment-1",
      amount: "100.00",
      status: "pending",
      gatewayProvider: "stripe",
      gatewayStatus: "requires_payment_method",
      gatewayPaymentIntentReference: "pi_test",
      gatewayCheckoutSessionReference: "cs_test",
      paymentMethodSummary: "Card ending 4242",
      reference: "manual-ref"
    },
    event: event({ providerEventId: "evt_test" })
  });

  assert.deepEqual(
    rows.map((row) => row.label),
    [
      "Provider",
      "Gateway status",
      "Method",
      "Provider event",
      "Payment intent",
      "Checkout session",
      "Reference"
    ]
  );
  assert.equal(rows.some((row) => /payload/i.test(row.label)), false);
});
