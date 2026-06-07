import assert from "node:assert/strict";
import test from "node:test";

import {
  derivePortalFinancialVisibility,
  derivePortalInvoiceFinancialClarity
} from "./financial-visibility";

void test("portal financial visibility summarizes outstanding balances", () => {
  const summary = derivePortalFinancialVisibility({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        referenceNumber: "INV-1001",
        status: "sent",
        totalAmount: "1000.00",
        balanceDueAmount: "750.00",
        latestPaymentEventType: "payment_requested",
        updatedAt: "2026-06-01T10:00:00.000Z"
      },
      {
        id: "invoice-2",
        referenceNumber: "INV-1002",
        status: "paid",
        totalAmount: "250.00",
        balanceDueAmount: "0.00",
        updatedAt: "2026-05-30T10:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.statusLabel, "Balance due");
  assert.equal(summary.outstandingBalanceLabel, "$750.00");
  assert.equal(summary.nextActionHref, "/portal/invoices/invoice-1");
  assert.equal(summary.rows[0]?.paymentStateLabel, "Payment requested");
});

void test("portal financial visibility keeps failed payment copy customer safe", () => {
  const summary = derivePortalFinancialVisibility({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "sent",
        totalAmount: "500.00",
        balanceDueAmount: "500.00",
        latestPaymentEventType: "payment_failed"
      }
    ]
  });

  assert.equal(summary.statusLabel, "Payment needs review");
  assert.equal(summary.statusTone, "warning");
  assert.doesNotMatch(JSON.stringify(summary), /provider|stripe|failure code/i);
});

void test("portal financial visibility explains all-current shared invoices", () => {
  const summary = derivePortalFinancialVisibility({
    projectId: "project-1",
    invoices: [
      {
        id: "invoice-1",
        status: "paid",
        totalAmount: "1200.00",
        balanceDueAmount: "0.00",
        latestPaymentEventType: "payment_succeeded"
      }
    ]
  });

  assert.equal(summary.statusLabel, "Billing is current");
  assert.equal(summary.statusTone, "complete");
  assert.equal(summary.outstandingBalanceLabel, "$0.00");
});

void test("portal invoice financial clarity summarizes payment history and readiness", () => {
  const clarity = derivePortalInvoiceFinancialClarity({
    invoice: {
      id: "invoice-1",
      referenceNumber: "INV-1001",
      status: "partially_paid",
      totalAmount: "1000.00",
      paidAmount: "400.00",
      balanceDueAmount: "600.00"
    },
    payments: [
      {
        id: "payment-1",
        amount: "400.00",
        paymentDate: "2026-06-01",
        paymentMethod: "local_manual",
        status: "recorded"
      }
    ],
    paymentWorkflow: {
      canRequestPayment: true,
      requestBlockers: []
    }
  });

  assert.equal(clarity.statusLabel, "Partially paid");
  assert.match(clarity.paymentHistorySummary, /\$400\.00 paid/);
  assert.match(clarity.billingReadinessSummary, /\$600\.00 balance/);
});

void test("portal invoice financial clarity explains blocked payment without mutating state", () => {
  const clarity = derivePortalInvoiceFinancialClarity({
    invoice: {
      id: "invoice-1",
      status: "draft",
      totalAmount: "800.00",
      paidAmount: "0.00",
      balanceDueAmount: "800.00"
    },
    paymentWorkflow: {
      canRequestPayment: false,
      requestBlockers: ["invoice_not_sent"]
    }
  });

  assert.equal(
    clarity.billingReadinessSummary,
    "The invoice must be sent before customer payment can start."
  );
  assert.doesNotMatch(
    JSON.stringify(clarity),
    /create|update|mutate|provider/i
  );
});
