import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFinancialCollectionsSummary,
  getInvoiceAgingBucket,
  isOpenReceivableInvoice,
  type FinancialCollectionsInvoiceInput
} from "./collections-core";

function invoice(
  overrides: Partial<FinancialCollectionsInvoiceInput>
): FinancialCollectionsInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    workflowRole: overrides.workflowRole ?? "standard",
    status: overrides.status ?? "sent",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    totalAmount: overrides.totalAmount ?? "100.00",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z"
  };
}

void test("financial collections summary derives AR from canonical invoices and payments", () => {
  const summary = buildFinancialCollectionsSummary({
    todayIso: "2026-05-20",
    invoices: [
      invoice({
        id: "sent-overdue",
        dueDate: "2026-05-01",
        balanceDueAmount: "500.00"
      }),
      invoice({
        id: "partial",
        status: "partially_paid",
        dueDate: "2026-04-01",
        balanceDueAmount: "250.00"
      }),
      invoice({
        id: "deposit",
        workflowRole: "deposit",
        dueDate: null,
        balanceDueAmount: "125.00"
      }),
      invoice({
        id: "paid",
        status: "paid",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "void",
        status: "void",
        balanceDueAmount: "900.00"
      })
    ],
    payments: [
      { id: "payment-1", amount: "300.00", status: "recorded" },
      { id: "payment-2", amount: "75.00", status: "pending" },
      { id: "payment-3", amount: "50.00", status: "void" }
    ],
    events: [
      {
        id: "event-1",
        eventType: "payment_failed",
        occurredAt: "2026-05-19T12:00:00.000Z"
      },
      {
        id: "event-2",
        eventType: "checkout_started",
        occurredAt: "2026-05-20T12:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.openReceivableAmount, "875.00");
  assert.equal(summary.overdueReceivableAmount, "750.00");
  assert.equal(summary.partiallyPaidAmount, "250.00");
  assert.equal(summary.depositReceivableAmount, "125.00");
  assert.equal(summary.standardReceivableAmount, "750.00");
  assert.equal(summary.recordedPaymentAmount, "300.00");
  assert.equal(summary.pendingPaymentAmount, "75.00");
  assert.equal(summary.openInvoiceCount, 3);
  assert.equal(summary.overdueInvoiceCount, 2);
  assert.equal(summary.partiallyPaidInvoiceCount, 1);
  assert.equal(summary.failedOrVoidedEventCount, 1);
  assert.equal(summary.pendingEventCount, 1);
});

void test("financial collections aging keeps no-due-date invoices separate", () => {
  assert.equal(
    getInvoiceAgingBucket(invoice({ dueDate: "2026-05-20" }), "2026-05-20"),
    "current"
  );
  assert.equal(
    getInvoiceAgingBucket(invoice({ dueDate: "2026-05-01" }), "2026-05-20"),
    "1_30"
  );
  assert.equal(
    getInvoiceAgingBucket(invoice({ dueDate: "2026-04-01" }), "2026-05-20"),
    "31_60"
  );
  assert.equal(
    getInvoiceAgingBucket(invoice({ dueDate: "2026-03-01" }), "2026-05-20"),
    "61_plus"
  );
  assert.equal(
    getInvoiceAgingBucket(invoice({ dueDate: null }), "2026-05-20"),
    "no_due_date"
  );
});

void test("open receivable detection excludes paid void and zero-balance invoices", () => {
  assert.equal(isOpenReceivableInvoice(invoice({ status: "sent" })), true);
  assert.equal(
    isOpenReceivableInvoice(invoice({ status: "partially_paid" })),
    true
  );
  assert.equal(isOpenReceivableInvoice(invoice({ status: "paid" })), false);
  assert.equal(isOpenReceivableInvoice(invoice({ status: "void" })), false);
  assert.equal(
    isOpenReceivableInvoice(invoice({ balanceDueAmount: "0.00" })),
    false
  );
});
