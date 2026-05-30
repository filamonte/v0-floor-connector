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
  assert.equal(commandCenter.priorityItems[0]?.priorityBand, "urgent");
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

void test("summarizes invoice status counts and operational continuity queues", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "draft",
        referenceNumber: "INV-DRAFT",
        status: "draft",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "sent",
        referenceNumber: "INV-SENT",
        status: "sent",
        balanceDueAmount: "200.00"
      }),
      invoice({
        id: "partial",
        referenceNumber: "INV-PARTIAL",
        status: "partially_paid",
        balanceDueAmount: "150.00"
      }),
      invoice({
        id: "paid",
        referenceNumber: "INV-PAID",
        status: "paid",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "void",
        referenceNumber: "INV-VOID",
        status: "void",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "deposit",
        referenceNumber: "INV-DEPOSIT",
        workflowRole: "deposit",
        status: "sent",
        balanceDueAmount: "500.00"
      })
    ],
    payments: [
      payment({
        id: "pending",
        invoiceId: "sent",
        status: "pending"
      }),
      payment({
        id: "recorded",
        invoiceId: "paid",
        status: "recorded"
      })
    ],
    paymentEvents: [
      event({
        id: "checkout",
        invoiceId: "sent",
        eventType: "checkout_started"
      }),
      event({
        id: "failed",
        invoiceId: "partial",
        eventType: "payment_failed"
      })
    ]
  });

  assert.deepEqual(commandCenter.continuitySnapshot.invoiceStatusCounts, {
    draft: 1,
    sent: 2,
    partiallyPaid: 1,
    paid: 1,
    void: 1
  });

  const openBalances = commandCenter.continuitySnapshot.operationalQueues.find(
    (queue) => queue.id === "open-balances"
  );
  const depositReadiness =
    commandCenter.continuitySnapshot.operationalQueues.find(
      (queue) => queue.id === "deposit-readiness"
    );
  const paymentEventReview =
    commandCenter.continuitySnapshot.operationalQueues.find(
      (queue) => queue.id === "payment-event-review"
    );
  const paymentInProgress =
    commandCenter.continuitySnapshot.operationalQueues.find(
      (queue) => queue.id === "payment-in-progress"
    );

  assert.equal(openBalances?.count, 3);
  assert.equal(openBalances?.amount, "850.00");
  assert.equal(depositReadiness?.count, 1);
  assert.equal(depositReadiness?.amount, "500.00");
  assert.equal(paymentEventReview?.count, 1);
  assert.equal(paymentEventReview?.tone, "warning");
  assert.equal(paymentInProgress?.count, 2);
});

void test("derives collection priority bands and compact latest payment signal", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "monitoring",
        referenceNumber: "INV-MONITORING",
        dueDate: "2026-06-10",
        balanceDueAmount: "125.00",
        updatedAt: "2026-05-20T12:00:00.000Z"
      }),
      invoice({
        id: "failed",
        referenceNumber: "INV-FAILED-SIGNAL",
        dueDate: "2026-05-30",
        balanceDueAmount: "300.00"
      })
    ],
    paymentEvents: [
      event({
        id: "failed-requested",
        invoiceId: "failed",
        eventType: "payment_requested",
        occurredAt: "2026-05-18T12:00:00.000Z"
      }),
      event({
        id: "failed-signal",
        invoiceId: "failed",
        eventType: "payment_failed",
        occurredAt: "2026-05-19T12:00:00.000Z"
      })
    ]
  });

  const failed = commandCenter.priorityItems.find(
    (item) => item.invoiceId === "failed"
  );
  const monitoring = commandCenter.priorityItems.find(
    (item) => item.invoiceId === "monitoring"
  );

  assert.equal(failed?.priorityBand, "urgent");
  assert.equal(failed?.latestPaymentSignal?.eventType, "payment_failed");
  assert.equal(failed?.latestPaymentSignal?.label, "Payment failed");
  assert.equal(failed?.latestPaymentSignal?.historyCount, 2);
  assert.equal(monitoring?.priorityBand, "monitoring");
  assert.equal(monitoring?.latestPaymentSignal, null);
});

void test("keeps paid and void invoices out of priority collections rows", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "open",
        referenceNumber: "INV-OPEN",
        status: "sent",
        balanceDueAmount: "100.00"
      }),
      invoice({
        id: "paid",
        referenceNumber: "INV-PAID",
        status: "paid",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "void",
        referenceNumber: "INV-VOID",
        status: "void",
        balanceDueAmount: "500.00"
      })
    ]
  });

  assert.deepEqual(
    commandCenter.priorityItems.map((item) => item.invoiceId),
    ["open"]
  );
});

void test("classifies deposit invoices without creating a separate deposit model", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "deposit-open",
        referenceNumber: "INV-DEPOSIT-OPEN",
        workflowRole: "deposit",
        status: "sent",
        balanceDueAmount: "500.00"
      }),
      invoice({
        id: "deposit-progress",
        referenceNumber: "INV-DEPOSIT-PROGRESS",
        workflowRole: "deposit",
        status: "sent",
        balanceDueAmount: "250.00"
      }),
      invoice({
        id: "deposit-settled",
        referenceNumber: "INV-DEPOSIT-SETTLED",
        workflowRole: "deposit",
        status: "paid",
        balanceDueAmount: "0.00"
      }),
      invoice({
        id: "standard",
        referenceNumber: "INV-STANDARD",
        workflowRole: "standard",
        status: "sent",
        balanceDueAmount: "100.00"
      })
    ],
    payments: [
      payment({
        id: "pending-deposit-payment",
        invoiceId: "deposit-progress",
        status: "pending"
      }),
      payment({
        id: "recorded-deposit-payment",
        invoiceId: "deposit-settled",
        status: "recorded"
      })
    ]
  });

  assert.deepEqual(
    commandCenter.depositContinuity.map((deposit) => [
      deposit.invoiceId,
      deposit.status
    ]),
    [
      ["deposit-open", "open"],
      ["deposit-progress", "in_progress"],
      ["deposit-settled", "settled"]
    ]
  );
});

void test("selects payment succeeded as the latest payment trail signal", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "succeeded",
        referenceNumber: "INV-SUCCEEDED",
        status: "paid",
        balanceDueAmount: "0.00"
      })
    ],
    paymentEvents: [
      event({
        id: "checkout",
        invoiceId: "succeeded",
        eventType: "checkout_started",
        occurredAt: "2026-05-18T12:00:00.000Z"
      }),
      event({
        id: "success",
        invoiceId: "succeeded",
        eventType: "payment_succeeded",
        occurredAt: "2026-05-19T12:00:00.000Z"
      })
    ]
  });
  const success = commandCenter.paymentTrailAttention.find(
    (item) => item.kind === "recent_success"
  );

  assert.equal(success?.invoiceId, "succeeded");
  assert.equal(success?.tone, "neutral");
  assert.equal(success?.historyCount, 2);
});

void test("summarizes control room open ar, trail issues, deposits, and recent success", () => {
  const commandCenter = build({
    invoices: [
      invoice({
        id: "failed",
        referenceNumber: "INV-FAILED",
        balanceDueAmount: "300.00"
      }),
      invoice({
        id: "deposit",
        referenceNumber: "INV-DEPOSIT",
        workflowRole: "deposit",
        balanceDueAmount: "200.00"
      }),
      invoice({
        id: "paid",
        referenceNumber: "INV-PAID",
        status: "paid",
        balanceDueAmount: "0.00"
      })
    ],
    payments: [
      payment({
        id: "recorded",
        invoiceId: "paid",
        status: "recorded",
        amount: "100.00"
      })
    ],
    paymentEvents: [
      event({
        id: "failed-event",
        invoiceId: "failed",
        eventType: "payment_failed"
      })
    ]
  });
  const cardsById = new Map(
    commandCenter.summaryCards.map((card) => [card.id, card])
  );

  assert.equal(cardsById.get("open-ar-balance")?.value, "500.00");
  assert.equal(cardsById.get("attention-count")?.value, "1 / 1");
  assert.equal(cardsById.get("deposit-readiness")?.value, "1");
  assert.equal(cardsById.get("payment-trail-review")?.value, "1");
  assert.equal(cardsById.get("recent-success")?.value, "1");
});
