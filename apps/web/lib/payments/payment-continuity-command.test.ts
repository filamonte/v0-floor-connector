import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPaymentContinuityCommand,
  type PaymentContinuityEventInput,
  type PaymentContinuityPaymentInput
} from "./payment-continuity-command";

function payment(
  overrides: Partial<PaymentContinuityPaymentInput> = {}
): PaymentContinuityPaymentInput {
  return {
    id: overrides.id ?? "payment-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    amount: overrides.amount ?? "100.00",
    status: overrides.status ?? "recorded",
    invoice: overrides.invoice ?? {
      id: "invoice-1",
      referenceNumber: "INV-001",
      status: "partially_paid",
      balanceDueAmount: "50.00",
      totalAmount: "150.00"
    },
    customer: overrides.customer ?? {
      name: "Avery Home"
    },
    project: overrides.project ?? {
      name: "Garage coating"
    }
  };
}

function event(
  overrides: Partial<PaymentContinuityEventInput> = {}
): PaymentContinuityEventInput {
  return {
    id: overrides.id ?? "event-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    eventType: overrides.eventType ?? "payment_failed",
    occurredAt: overrides.occurredAt ?? "2026-06-01T12:00:00.000Z",
    invoice: overrides.invoice ?? {
      referenceNumber: "INV-001",
      status: "sent",
      balanceDueAmount: "150.00"
    },
    customer: overrides.customer ?? {
      name: "Avery Home"
    },
    project: overrides.project ?? {
      name: "Garage coating"
    }
  };
}

void test("prioritizes failed payment evidence before pending outcomes", () => {
  const command = buildPaymentContinuityCommand({
    payments: [],
    events: [
      event({ id: "pending", eventType: "checkout_started" }),
      event({ id: "failed", eventType: "payment_failed" })
    ]
  });

  assert.equal(command.failedOrVoided.length, 1);
  assert.equal(command.pendingOutcomes.length, 1);
  assert.equal(command.nextMove.label, "Review exception");
  assert.equal(command.nextMove.href, "/invoices/invoice-1");
});

void test("separates partial balances from settled payment outcomes", () => {
  const command = buildPaymentContinuityCommand({
    payments: [
      payment({
        id: "partial-payment",
        invoice: {
          id: "invoice-1",
          referenceNumber: "INV-PARTIAL",
          status: "partially_paid",
          balanceDueAmount: "75.00",
          totalAmount: "175.00"
        }
      }),
      payment({
        id: "settled-payment",
        invoiceId: "invoice-2",
        invoice: {
          id: "invoice-2",
          referenceNumber: "INV-SETTLED",
          status: "paid",
          balanceDueAmount: "0.00",
          totalAmount: "200.00"
        }
      })
    ],
    events: []
  });

  assert.equal(command.partialBalances[0]?.title, "INV-PARTIAL");
  assert.equal(command.settledOutcomes[0]?.title, "INV-SETTLED");
  assert.equal(command.nextMove.label, "Review outcome");
});
