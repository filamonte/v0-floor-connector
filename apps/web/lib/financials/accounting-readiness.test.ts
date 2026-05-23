import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAccountingReadiness,
  type AccountingReadinessInvoiceInput,
  type AccountingReadinessPaymentEventInput,
  type AccountingReadinessPaymentInput
} from "./accounting-readiness";

function invoice(
  overrides: Partial<AccountingReadinessInvoiceInput> = {}
): AccountingReadinessInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    customerId: overrides.customerId ?? "customer-1",
    projectId: overrides.projectId ?? "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    status: overrides.status ?? "sent",
    issueDate: overrides.issueDate ?? "2026-05-01",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-20",
    subtotalAmount: overrides.subtotalAmount ?? "900.00",
    taxAmount: overrides.taxAmount ?? "80.00",
    taxCollectedAmount: overrides.taxCollectedAmount ?? "80.00",
    retainageHeldAmount: overrides.retainageHeldAmount ?? "20.00",
    totalAmount: overrides.totalAmount ?? "980.00",
    balanceDueAmount: overrides.balanceDueAmount ?? "980.00",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    customer:
      overrides.customer === undefined
        ? {
            id: "customer-1",
            name: "Acme Flooring"
          }
        : overrides.customer,
    project:
      overrides.project === undefined
        ? {
            id: "project-1",
            name: "Lobby resurfacing"
          }
        : overrides.project
  };
}

function payment(
  overrides: Partial<AccountingReadinessPaymentInput> = {}
): AccountingReadinessPaymentInput {
  return {
    id: overrides.id ?? "payment-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    amount: overrides.amount ?? "100.00",
    paymentDate: overrides.paymentDate ?? "2026-05-21",
    paymentMethod: overrides.paymentMethod ?? "card",
    paymentSource: overrides.paymentSource ?? "customer_portal",
    status: overrides.status ?? "recorded",
    reference: overrides.reference ?? "PAY-001",
    createdAt: overrides.createdAt ?? "2026-05-21T12:00:00.000Z",
    invoice: overrides.invoice ?? {
      id: overrides.invoiceId ?? "invoice-1",
      referenceNumber: "INV-001"
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

function event(
  overrides: Partial<AccountingReadinessPaymentEventInput> = {}
): AccountingReadinessPaymentEventInput {
  return {
    id: overrides.id ?? "event-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    paymentId: overrides.paymentId ?? "payment-1",
    eventType: overrides.eventType ?? "payment_failed",
    occurredAt: overrides.occurredAt ?? "2026-05-21T12:00:00.000Z",
    invoice: overrides.invoice ?? {
      id: overrides.invoiceId ?? "invoice-1",
      referenceNumber: "INV-001",
      balanceDueAmount: "980.00"
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

void test("summary totals use existing invoice and payment fields", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [
      invoice({
        id: "open",
        totalAmount: "1000.00",
        balanceDueAmount: "750.00"
      }),
      invoice({
        id: "paid",
        status: "paid",
        totalAmount: "400.00",
        balanceDueAmount: "0.00"
      })
    ],
    payments: [
      payment({ id: "p1", invoiceId: "open", amount: "250.00" }),
      payment({ id: "p2", invoiceId: "paid", amount: "400.00" })
    ],
    paymentEvents: []
  });

  assert.equal(readiness.summary.invoiceCount, 2);
  assert.equal(readiness.summary.totalInvoiced, "1400.00");
  assert.equal(readiness.summary.totalPaid, "650.00");
  assert.equal(readiness.summary.totalOpen, "750.00");
});

void test("counts paid and open invoices", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [
      invoice({ id: "open", status: "sent", balanceDueAmount: "100.00" }),
      invoice({
        id: "partial",
        status: "partially_paid",
        balanceDueAmount: "50.00"
      }),
      invoice({ id: "paid", status: "paid", balanceDueAmount: "0.00" })
    ],
    payments: [],
    paymentEvents: []
  });

  assert.equal(readiness.summary.openInvoiceCount, 2);
  assert.equal(readiness.summary.paidInvoiceCount, 1);
});

void test("detects payment attention from payment events", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [invoice()],
    payments: [],
    paymentEvents: [event({ eventType: "payment_failed" })]
  });

  assert.equal(readiness.summary.paymentsNeedingReview, 1);
  assert.equal(readiness.attentionItems[0]?.label, "Review Payment Trail");
  assert.equal(readiness.nextMove.label, "Review Payment Trail");
});

void test("aggregates tax and retainage snapshots when present", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [
      invoice({ id: "one", taxAmount: "20.00", retainageHeldAmount: "10.00" }),
      invoice({ id: "two", taxAmount: "30.00", retainageHeldAmount: "15.00" })
    ],
    payments: [],
    paymentEvents: [],
    taxSnapshots: [
      { invoiceId: "one", taxCollectedAmount: "22.00" },
      { invoiceId: "two", taxCollectedAmount: "33.00" }
    ]
  });

  assert.equal(readiness.summary.taxCollected, "55.00");
  assert.equal(readiness.summary.retainageHeld, "25.00");
  assert.equal(readiness.invoiceRows[0]?.taxCollectedAmount, "22.00");
});

void test("returns a safe empty state", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [],
    payments: [],
    paymentEvents: []
  });

  assert.equal(readiness.invoiceRows.length, 0);
  assert.equal(readiness.paymentRows.length, 0);
  assert.equal(readiness.nextMove.label, "Review accounting readiness");
});

void test("maps export-ready columns and rows", () => {
  const readiness = buildAccountingReadiness({
    todayIso: "2026-05-23",
    invoices: [invoice()],
    payments: [payment({ amount: "100.00" })],
    paymentEvents: []
  });

  assert.deepEqual(readiness.exportColumns.slice(0, 4), [
    "Invoice reference",
    "Invoice status",
    "Customer",
    "Project"
  ]);
  assert.equal(readiness.invoiceRows[0]?.exportValues[0], "INV-001");
  assert.equal(readiness.invoiceRows[0]?.paidAmount, "100.00");
});
