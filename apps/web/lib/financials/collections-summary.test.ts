import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFinancialControlSummary,
  type FinancialControlInvoiceInput,
  type FinancialControlPaymentEventInput,
  type FinancialControlPaymentInput
} from "./collections-summary";

function invoice(
  overrides: Partial<FinancialControlInvoiceInput> = {}
): FinancialControlInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    customerId: overrides.customerId ?? "customer-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    workflowRole: overrides.workflowRole ?? "standard",
    status: overrides.status ?? "sent",
    billingModel: overrides.billingModel ?? "standard",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    paidAmount: overrides.paidAmount ?? "0.00",
    retainageHeldAmount: overrides.retainageHeldAmount ?? "0.00",
    totalAmount: overrides.totalAmount ?? "100.00",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    customer: overrides.customer ?? {
      id: "customer-1",
      name: "Acme Flooring"
    },
    project: overrides.project ?? {
      id: "project-1",
      name: "Lobby resurfacing",
      status: "active"
    }
  };
}

function payment(
  overrides: Partial<FinancialControlPaymentInput> = {}
): FinancialControlPaymentInput {
  return {
    id: overrides.id ?? "payment-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    amount: overrides.amount ?? "25.00",
    status: overrides.status ?? "pending",
    paymentDate: overrides.paymentDate ?? "2026-05-20",
    createdAt: overrides.createdAt ?? "2026-05-20T12:00:00.000Z"
  };
}

function event(
  overrides: Partial<FinancialControlPaymentEventInput> = {}
): FinancialControlPaymentEventInput {
  return {
    id: overrides.id ?? "event-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    eventType: overrides.eventType ?? "payment_requested",
    occurredAt: overrides.occurredAt ?? "2026-05-20T12:00:00.000Z",
    invoice: overrides.invoice ?? {
      id: "invoice-1",
      referenceNumber: "INV-001",
      status: "sent",
      balanceDueAmount: "100.00"
    },
    customer: overrides.customer ?? {
      id: "customer-1",
      name: "Acme Flooring"
    },
    project: overrides.project ?? {
      id: "project-1",
      name: "Lobby resurfacing"
    }
  };
}

void test("summarizes open invoice totals without changing invoice math", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({ id: "open-1", balanceDueAmount: "500.00" }),
      invoice({ id: "open-2", balanceDueAmount: "175.25" }),
      invoice({ id: "paid", status: "paid", balanceDueAmount: "0.00" })
    ],
    payments: [],
    paymentEvents: []
  });

  assert.equal(summary.openReceivablesAmount, "675.25");
  assert.equal(summary.openInvoiceCount, 2);
  assert.equal(summary.invoicesNeedingAttention.length, 2);
});

void test("summarizes command-center deposit retainage and progress billing signals", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({
        id: "deposit",
        workflowRole: "deposit",
        balanceDueAmount: "250.00",
        retainageHeldAmount: "0.00"
      }),
      invoice({
        id: "progress",
        billingModel: "aia_progress",
        balanceDueAmount: "400.00",
        retainageHeldAmount: "40.00"
      }),
      invoice({
        id: "paid-retainage",
        status: "paid",
        balanceDueAmount: "0.00",
        retainageHeldAmount: "10.00"
      })
    ],
    payments: [payment({ status: "recorded", amount: "100.00" })],
    paymentEvents: []
  });

  assert.equal(summary.depositReceivablesAmount, "250.00");
  assert.equal(summary.progressBillingReceivablesAmount, "400.00");
  assert.equal(summary.retainageHeldAmount, "50.00");
  assert.equal(summary.recordedPaymentAmount, "100.00");
  assert.equal(
    summary.commandSignals.find((signal) => signal.id === "retainage")?.value,
    "50.00"
  );
});

void test("counts overdue invoice amount when a due date exists", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({
        id: "overdue",
        dueDate: "2026-05-01",
        balanceDueAmount: "100.00"
      }),
      invoice({
        id: "current",
        dueDate: "2026-05-30",
        balanceDueAmount: "200.00"
      }),
      invoice({ id: "no-date", dueDate: null, balanceDueAmount: "300.00" })
    ],
    payments: [],
    paymentEvents: []
  });

  assert.equal(summary.overdueAmount, "100.00");
  assert.equal(summary.overdueInvoiceCount, 1);
  assert.equal(
    summary.invoicesNeedingAttention[0]?.nextMoveLabel,
    "Follow up on payment"
  );
});

void test("handles partially paid invoice attention", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({
        status: "partially_paid",
        dueDate: "2026-05-25",
        balanceDueAmount: "60.00"
      })
    ],
    payments: [payment({ status: "recorded", amount: "40.00" })],
    paymentEvents: []
  });

  assert.equal(summary.partiallyPaidCount, 1);
  assert.equal(summary.paidRecentlyCount, 1);
  assert.equal(
    summary.invoicesNeedingAttention[0]?.reason,
    "Partially paid with a remaining balance."
  );
});

void test("surfaces pending payment events as payment attention", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [invoice({ dueDate: "2026-05-25" })],
    payments: [payment({ status: "pending" })],
    paymentEvents: [event({ eventType: "payment_requested" })]
  });

  assert.equal(summary.pendingPaymentCount, 1);
  assert.equal(summary.paymentRequestedCount, 1);
  assert.equal(
    summary.paymentEventsNeedingReview[0]?.nextMoveLabel,
    "Follow up on payment"
  );
});

void test("surfaces failed payment events for Payment Trail review", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [invoice()],
    payments: [],
    paymentEvents: [event({ eventType: "payment_failed" })]
  });

  assert.equal(summary.failedPaymentCount, 1);
  assert.equal(summary.paymentEventsNeedingReview[0]?.tone, "warning");
  assert.equal(summary.nextMove.label, "Review Payment Trail");
});

void test("returns a safe empty state next move", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [],
    payments: [],
    paymentEvents: []
  });

  assert.equal(summary.openInvoiceCount, 0);
  assert.equal(summary.paymentEventsNeedingReview.length, 0);
  assert.equal(summary.nextMove.label, "Review accounts receivable");
});

void test("selects next moves deterministically by payment and overdue priority", () => {
  const summary = buildFinancialControlSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({
        id: "current",
        referenceNumber: "INV-CURRENT",
        dueDate: "2026-05-25"
      }),
      invoice({
        id: "overdue",
        referenceNumber: "INV-OVERDUE",
        dueDate: "2026-05-01"
      })
    ],
    payments: [],
    paymentEvents: [
      event({
        id: "pending",
        invoiceId: "current",
        eventType: "payment_requested",
        occurredAt: "2026-05-20T12:00:00.000Z"
      }),
      event({
        id: "failed",
        invoiceId: "overdue",
        eventType: "payment_failed",
        occurredAt: "2026-05-19T12:00:00.000Z"
      })
    ]
  });

  assert.deepEqual(
    summary.paymentEventsNeedingReview.map((item) => item.id),
    ["failed", "pending"]
  );
  assert.equal(summary.nextMove.label, "Review Payment Trail");
});
