import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCollectionsFollowUpIntelligence,
  type CollectionsFollowUpItem
} from "./collections-follow-up-intelligence";
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
    dueDate: Object.hasOwn(overrides, "dueDate")
      ? (overrides.dueDate ?? null)
      : "2026-05-01",
    balanceDueAmount: overrides.balanceDueAmount ?? "100.00",
    totalAmount: overrides.totalAmount ?? "100.00",
    updatedAt: overrides.updatedAt ?? "2026-05-20T12:00:00.000Z",
    customer: Object.hasOwn(overrides, "customer")
      ? (overrides.customer ?? null)
      : {
          id: overrides.customerId ?? "customer-1",
          name: "Acme Flooring"
        },
    project: Object.hasOwn(overrides, "project")
      ? (overrides.project ?? null)
      : {
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
    createdAt: overrides.createdAt ?? "2026-05-20T12:00:00.000Z"
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
    occurredAt: overrides.occurredAt ?? "2026-05-20T12:00:00.000Z"
  };
}

function build(input: {
  invoices?: FinancialControlInvoiceInput[];
  payments?: FinancialControlPaymentInput[];
  paymentEvents?: FinancialControlPaymentEventInput[];
}) {
  return buildCollectionsFollowUpIntelligence({
    invoices: input.invoices ?? [],
    payments: input.payments ?? [],
    paymentEvents: input.paymentEvents ?? [],
    todayIso: "2026-05-20"
  });
}

function onlyItem(input: {
  invoices?: FinancialControlInvoiceInput[];
  payments?: FinancialControlPaymentInput[];
  paymentEvents?: FinancialControlPaymentEventInput[];
}): CollectionsFollowUpItem {
  const intelligence = build(input);

  assert.equal(intelligence.items.length, 1);
  const item = intelligence.items[0];
  assert.ok(item);
  return item;
}

void test("returns a safe empty collections follow-up state", () => {
  const intelligence = build({
    invoices: [
      invoice({
        id: "paid",
        status: "paid",
        balanceDueAmount: "0.00"
      })
    ]
  });

  assert.equal(intelligence.items.length, 0);
  assert.match(intelligence.headline, /No collections follow-up/);
});

void test("surfaces overdue unpaid invoices with payment reminder drafts", () => {
  const item = onlyItem({
    invoices: [
      invoice({
        id: "overdue",
        referenceNumber: "INV-OVERDUE",
        dueDate: "2026-05-01",
        balanceDueAmount: "725.00"
      })
    ]
  });

  assert.equal(item.category, "overdue_invoice");
  assert.equal(item.priority, "high");
  assert.equal(item.paymentState, "unpaid");
  assert.equal(item.amountDue, "725.00");
  assert.equal(item.draftAction?.actionType, "payment_reminder");
  assert.match(item.communicationHandoffHref ?? "", /copilotDraft=1/);
  assert.match(item.communicationHandoffHref ?? "", /payment_reminder/);
});

void test("surfaces unpaid deposits with deposit reminder drafts", () => {
  const item = onlyItem({
    invoices: [
      invoice({
        workflowRole: "deposit",
        dueDate: null,
        balanceDueAmount: "500.00"
      })
    ]
  });

  assert.equal(item.category, "unpaid_deposit");
  assert.equal(item.priority, "high");
  assert.equal(item.draftAction?.actionType, "deposit_payment_reminder");
  assert.match(item.reason, /Deposit invoice/);
});

void test("surfaces partially paid invoices with balance follow-up drafts", () => {
  const item = onlyItem({
    invoices: [
      invoice({
        status: "partially_paid",
        dueDate: "2026-05-30",
        balanceDueAmount: "225.00"
      })
    ],
    payments: [payment({ status: "recorded", amount: "100.00" })]
  });

  assert.equal(item.category, "partially_paid");
  assert.equal(item.paymentState, "partially_paid");
  assert.equal(item.draftAction?.actionType, "partial_balance_follow_up");
});

void test("prioritizes failed and voided payment events", () => {
  const intelligence = build({
    invoices: [
      invoice({
        id: "overdue",
        referenceNumber: "INV-OVERDUE",
        dueDate: "2026-05-01"
      }),
      invoice({
        id: "failed",
        referenceNumber: "INV-FAILED",
        dueDate: "2026-05-30"
      })
    ],
    paymentEvents: [
      event({
        invoiceId: "failed",
        eventType: "payment_failed"
      })
    ]
  });

  assert.equal(intelligence.items[0]?.invoiceId, "failed");
  assert.deepEqual(
    intelligence.items.map((item) => item.invoiceId),
    ["failed", "overdue"]
  );
  assert.equal(intelligence.items[0]?.category, "failed_or_voided_payment");
  assert.equal(intelligence.items[0]?.priority, "critical");
  assert.equal(
    intelligence.items[0]?.draftAction?.actionType,
    "payment_failed_follow_up"
  );
  assert.match(
    intelligence.items[0]?.lastActivityLabel ?? "",
    /Payment Trail payment failed/
  );
});

void test("surfaces checkout and payment in-progress before a duplicate nudge", () => {
  const item = onlyItem({
    invoices: [invoice({ dueDate: "2026-05-30" })],
    payments: [payment({ status: "pending" })],
    paymentEvents: [
      event({
        eventType: "checkout_started"
      })
    ]
  });

  assert.equal(item.category, "payment_in_progress");
  assert.equal(item.paymentState, "payment_in_progress");
  assert.equal(item.recommendedNextStep, "Review payment progress");
});

void test("uses internal review drafts when customer or project context is incomplete", () => {
  const item = onlyItem({
    invoices: [
      invoice({
        customerId: null,
        projectId: null,
        customer: null,
        project: null
      })
    ]
  });

  assert.equal(item.category, "overdue_invoice");
  assert.equal(item.customerName, "Missing customer context");
  assert.equal(item.projectName, "Missing project context");
  assert.equal(item.customerHref, null);
  assert.equal(item.projectHref, null);
  assert.match(
    item.sourceSignals.join(" "),
    /Customer: Missing customer context/
  );
  assert.match(
    item.sourceSignals.join(" "),
    /Project: Missing project context/
  );
  assert.equal(
    item.draftAction?.actionType,
    "internal_collections_review_summary"
  );
  assert.equal(item.communicationHandoffHref, null);
});
