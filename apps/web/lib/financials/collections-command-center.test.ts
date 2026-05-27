import assert from "node:assert/strict";
import test from "node:test";

import { buildCollectionsCommandCenter } from "./collections-command-center";
import type {
  FinancialControlInvoiceInput,
  FinancialControlPaymentEventInput,
  FinancialControlPaymentInput
} from "./collections-summary";

function invoice(
  overrides: Partial<FinancialControlInvoiceInput> = {}
): FinancialControlInvoiceInput {
  return {
    id: overrides.id ?? "invoice-1",
    customerId: Object.hasOwn(overrides, "customerId")
      ? (overrides.customerId ?? null)
      : "customer-1",
    projectId: Object.hasOwn(overrides, "projectId")
      ? (overrides.projectId ?? null)
      : "project-1",
    referenceNumber: overrides.referenceNumber ?? "INV-001",
    workflowRole: overrides.workflowRole ?? "standard",
    status: overrides.status ?? "sent",
    billingModel: overrides.billingModel ?? "standard",
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    retainageHeldAmount: overrides.retainageHeldAmount ?? "0.00",
    totalAmount: overrides.totalAmount ?? "100.00",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    customer: overrides.customer ?? {
      id: overrides.customerId ?? "customer-1",
      name: "Acme Flooring"
    },
    project: overrides.project ?? {
      id: overrides.projectId ?? "project-1",
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
    amount: overrides.amount ?? "100.00",
    status: overrides.status ?? "pending",
    paymentDate: overrides.paymentDate ?? "2026-05-20",
    createdAt: overrides.createdAt ?? "2026-05-20T12:00:00.000Z",
    gatewayProvider: overrides.gatewayProvider ?? "local_manual",
    paymentMethod: overrides.paymentMethod ?? "manual"
  };
}

function event(
  overrides: Partial<FinancialControlPaymentEventInput> = {}
): FinancialControlPaymentEventInput {
  return {
    id: overrides.id ?? "event-1",
    invoiceId: overrides.invoiceId ?? "invoice-1",
    paymentId: overrides.paymentId ?? null,
    eventType: overrides.eventType ?? "payment_requested",
    occurredAt: overrides.occurredAt ?? "2026-05-20T12:00:00.000Z",
    gatewayProvider: overrides.gatewayProvider ?? "local_manual"
  };
}

function build(input: {
  invoices?: FinancialControlInvoiceInput[];
  payments?: FinancialControlPaymentInput[];
  paymentEvents?: FinancialControlPaymentEventInput[];
}) {
  return buildCollectionsCommandCenter({
    invoices: input.invoices ?? [],
    payments: input.payments ?? [],
    paymentEvents: input.paymentEvents ?? [],
    todayIso: "2026-05-20"
  });
}

void test("orders failed payment invoices ahead of regular overdue balances", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "overdue",
        referenceNumber: "INV-OVERDUE",
        dueDate: "2026-04-01",
        balanceDueAmount: "1200.00"
      }),
      invoice({
        id: "failed",
        referenceNumber: "INV-FAILED",
        dueDate: "2026-05-30",
        balanceDueAmount: "300.00"
      })
    ],
    paymentEvents: [
      event({
        invoiceId: "failed",
        eventType: "payment_failed"
      })
    ]
  });

  assert.equal(commandCenter.priorityItems[0]?.invoiceId, "failed");
  assert.equal(commandCenter.priorityItems[0]?.tone, "warning");
  assert.equal(
    commandCenter.priorityItems[0]?.nextAction,
    "Review Payment Trail"
  );
  assert.ok(commandCenter.priorityItems[0]?.signals.includes("failed_payment"));
});

void test("groups customer exposure from open canonical invoices", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "deposit",
        referenceNumber: "INV-DEPOSIT",
        workflowRole: "deposit",
        balanceDueAmount: "500.00",
        dueDate: "2026-05-10"
      }),
      invoice({
        id: "partial",
        referenceNumber: "INV-PARTIAL",
        status: "partially_paid",
        balanceDueAmount: "250.00",
        dueDate: "2026-05-15"
      })
    ]
  });
  const customer = commandCenter.customerContinuity[0];

  assert.equal(customer?.customerName, "Acme Flooring");
  assert.equal(customer?.outstandingAmount, "750.00");
  assert.equal(customer?.overdueInvoiceCount, 2);
  assert.equal(customer?.pendingDepositCount, 1);
  assert.equal(customer?.partiallyPaidCount, 1);
  assert.equal(customer?.nextAction, "Chase oldest overdue balance");
});

void test("surfaces stale pending payments and recent recorded continuity", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "pending",
        referenceNumber: "INV-PENDING"
      }),
      invoice({
        id: "recorded",
        referenceNumber: "INV-RECORDED",
        balanceDueAmount: "0.00",
        status: "paid"
      })
    ],
    payments: [
      payment({
        id: "pending-payment",
        invoiceId: "pending",
        status: "pending",
        createdAt: "2026-05-15T12:00:00.000Z"
      }),
      payment({
        id: "recorded-payment",
        invoiceId: "recorded",
        status: "recorded",
        amount: "100.00",
        createdAt: "2026-05-19T12:00:00.000Z"
      })
    ]
  });

  assert.equal(
    commandCenter.paymentTrailAttention[0]?.kind,
    "stale_pending_payment"
  );
  assert.equal(
    commandCenter.paymentTrailAttention[0]?.nextAction,
    "Resolve pending state"
  );
  assert.equal(commandCenter.paymentTrailAttention[1]?.kind, "recent_success");
  assert.equal(commandCenter.paymentTrailAttention[1]?.tone, "neutral");
});
