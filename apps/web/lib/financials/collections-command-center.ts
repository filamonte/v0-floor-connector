import type {
  FinancialControlInvoiceInput,
  FinancialControlPaymentEventInput,
  FinancialControlPaymentInput
} from "./collections-summary";

export type CollectionsCommandCenterTone = "neutral" | "attention" | "warning";

export type CollectionsPrioritySignal =
  | "failed_payment"
  | "voided_payment"
  | "pending_checkout"
  | "pending_payment"
  | "overdue"
  | "unpaid_deposit"
  | "partially_paid"
  | "retainage_held"
  | "progress_billing"
  | "customer_exposure"
  | "stale_activity";

export type CollectionsPriorityItem = {
  id: string;
  invoiceId: string;
  invoiceReference: string;
  invoiceHref: string;
  customerId: string | null;
  customerName: string;
  customerHref: string | null;
  projectId: string | null;
  projectName: string;
  projectHref: string | null;
  balanceDueAmount: string;
  priorityScore: number;
  tone: CollectionsCommandCenterTone;
  reason: string;
  nextAction: string;
  dueSignal: string;
  lastActivityAt: string;
  latestPaymentEventType: string | null;
  signals: CollectionsPrioritySignal[];
};

export type CollectionsCustomerContinuity = {
  id: string;
  customerId: string | null;
  customerName: string;
  customerHref: string | null;
  outstandingAmount: string;
  overdueAmount: string;
  overdueInvoiceCount: number;
  openInvoiceCount: number;
  oldestUnpaidDueDate: string | null;
  activePaymentIssueCount: number;
  pendingDepositCount: number;
  linkedProjectCount: number;
  partiallyPaidCount: number;
  latestActivityAt: string;
  nextAction: string;
  tone: CollectionsCommandCenterTone;
};

export type CollectionsPaymentTrailAttentionKind =
  | "failed"
  | "voided"
  | "checkout_pending"
  | "payment_requested"
  | "stale_pending_payment"
  | "recent_success";

export type CollectionsPaymentTrailAttention = {
  id: string;
  kind: CollectionsPaymentTrailAttentionKind;
  invoiceId: string;
  invoiceReference: string;
  invoiceHref: string;
  customerName: string;
  projectName: string;
  amount: string | null;
  occurredAt: string;
  providerLabel: string;
  reason: string;
  nextAction: string;
  tone: CollectionsCommandCenterTone;
};

export type CollectionsCommandCenterSummaryCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: CollectionsCommandCenterTone;
};

export type CollectionsCommandCenter = {
  summaryCards: CollectionsCommandCenterSummaryCard[];
  priorityItems: CollectionsPriorityItem[];
  customerContinuity: CollectionsCustomerContinuity[];
  paymentTrailAttention: CollectionsPaymentTrailAttention[];
};

const criticalEventTypes = ["payment_failed", "payment_voided"] as const;
const pendingEventTypes = ["payment_requested", "checkout_started"] as const;

function money(value: string | number) {
  return Number(value).toFixed(2);
}

function parseDateTime(value: string) {
  if (value.includes("T")) {
    return new Date(value);
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function daysBetween(left: string, right: string) {
  return Math.floor(
    (parseDateTime(left).getTime() - parseDateTime(right).getTime()) /
      86_400_000
  );
}

function isOpenReceivable(invoice: FinancialControlInvoiceInput) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function getDaysPastDue(
  invoice: FinancialControlInvoiceInput,
  todayIso: string
) {
  if (!invoice.dueDate) {
    return null;
  }

  return daysBetween(todayIso, invoice.dueDate);
}

function getDueSignal(invoice: FinancialControlInvoiceInput, todayIso: string) {
  const daysPastDue = getDaysPastDue(invoice, todayIso);

  if (daysPastDue === null) {
    return "No due date";
  }

  if (daysPastDue > 0) {
    return `${daysPastDue} day${daysPastDue === 1 ? "" : "s"} past due`;
  }

  if (daysPastDue === 0) {
    return "Due today";
  }

  return `Due in ${Math.abs(daysPastDue)} day${daysPastDue === -1 ? "" : "s"}`;
}

function latestForInvoice<T extends { invoiceId?: string | null }>(
  invoiceId: string,
  records: T[],
  getDate: (record: T) => string | null | undefined
) {
  return records
    .filter((record) => record.invoiceId === invoiceId)
    .sort((left, right) => {
      const leftDate = getDate(left) ?? "";
      const rightDate = getDate(right) ?? "";

      return rightDate.localeCompare(leftDate);
    })[0];
}

function getLatestActivity(input: {
  invoice: FinancialControlInvoiceInput;
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
}) {
  const dates = [
    input.invoice.updatedAt,
    ...input.payments
      .filter((payment) => payment.invoiceId === input.invoice.id)
      .map((payment) => payment.createdAt ?? payment.paymentDate)
      .filter((value): value is string => Boolean(value)),
    ...input.paymentEvents
      .filter((event) => event.invoiceId === input.invoice.id)
      .map((event) => event.occurredAt)
  ];

  return dates.sort((left, right) => right.localeCompare(left))[0] ?? "";
}

function buildCustomerTotals(input: {
  invoices: FinancialControlInvoiceInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  todayIso: string;
}) {
  const totals = new Map<
    string,
    {
      customerId: string | null;
      customerName: string;
      customerHref: string | null;
      outstandingAmount: number;
      overdueAmount: number;
      overdueInvoiceCount: number;
      openInvoiceCount: number;
      oldestUnpaidDueDate: string | null;
      activePaymentIssueCount: number;
      pendingDepositCount: number;
      projectIds: Set<string>;
      partiallyPaidCount: number;
      latestActivityAt: string;
    }
  >();

  for (const invoice of input.invoices.filter(isOpenReceivable)) {
    const customerId = invoice.customerId ?? invoice.customer?.id ?? null;
    const customerName = invoice.customer?.name ?? "Unknown customer";
    const key = customerId ?? `unknown:${customerName}`;
    const previous = totals.get(key) ?? {
      customerId,
      customerName,
      customerHref: customerId ? `/customers/${customerId}` : null,
      outstandingAmount: 0,
      overdueAmount: 0,
      overdueInvoiceCount: 0,
      openInvoiceCount: 0,
      oldestUnpaidDueDate: null,
      activePaymentIssueCount: 0,
      pendingDepositCount: 0,
      projectIds: new Set<string>(),
      partiallyPaidCount: 0,
      latestActivityAt: ""
    };
    const daysPastDue = getDaysPastDue(invoice, input.todayIso);
    const latestEvent = latestForInvoice(
      invoice.id,
      input.paymentEvents,
      (event) => event.occurredAt
    );

    previous.outstandingAmount += Number(invoice.balanceDueAmount);
    previous.openInvoiceCount += 1;
    previous.latestActivityAt = [previous.latestActivityAt, invoice.updatedAt]
      .filter(Boolean)
      .sort((left, right) => right.localeCompare(left))[0];

    if (daysPastDue !== null && daysPastDue > 0) {
      previous.overdueAmount += Number(invoice.balanceDueAmount);
      previous.overdueInvoiceCount += 1;
    }

    if (
      invoice.dueDate &&
      (!previous.oldestUnpaidDueDate ||
        invoice.dueDate < previous.oldestUnpaidDueDate)
    ) {
      previous.oldestUnpaidDueDate = invoice.dueDate;
    }

    if (
      latestEvent &&
      criticalEventTypes.some(
        (eventType) => eventType === latestEvent.eventType
      )
    ) {
      previous.activePaymentIssueCount += 1;
    }

    if (invoice.workflowRole === "deposit") {
      previous.pendingDepositCount += 1;
    }

    if (invoice.projectId) {
      previous.projectIds.add(invoice.projectId);
    }

    if (invoice.status === "partially_paid") {
      previous.partiallyPaidCount += 1;
    }

    totals.set(key, previous);
  }

  return totals;
}

function rankCustomerExposure(outstandingAmount: number) {
  if (outstandingAmount >= 10_000) {
    return 20;
  }

  if (outstandingAmount >= 5_000) {
    return 12;
  }

  if (outstandingAmount >= 2_500) {
    return 6;
  }

  return 0;
}

function getPriorityReason(signals: CollectionsPrioritySignal[]) {
  if (signals.includes("failed_payment")) {
    return "Failed payment evidence is attached to an invoice that still has a balance.";
  }

  if (signals.includes("voided_payment")) {
    return "Voided payment evidence is attached to an invoice that still has a balance.";
  }

  if (signals.includes("overdue") && signals.includes("unpaid_deposit")) {
    return "Overdue deposit balance is holding up project financial readiness.";
  }

  if (signals.includes("pending_checkout")) {
    return "Checkout or payment request activity is open without a final payment outcome.";
  }

  if (signals.includes("unpaid_deposit")) {
    return "Deposit balance is tied to readiness-sensitive project movement.";
  }

  if (signals.includes("partially_paid")) {
    return "Partial payment left a remaining balance to collect.";
  }

  if (signals.includes("overdue")) {
    return "Invoice is past due and still has an open balance.";
  }

  if (signals.includes("stale_activity")) {
    return "Open balance has not had recent financial activity.";
  }

  return "Open invoice balance needs routine collections review.";
}

function getNextAction(signals: CollectionsPrioritySignal[]) {
  if (
    signals.includes("failed_payment") ||
    signals.includes("voided_payment")
  ) {
    return "Review Payment Trail";
  }

  if (
    signals.includes("pending_checkout") ||
    signals.includes("pending_payment")
  ) {
    return "Confirm payment outcome";
  }

  if (signals.includes("unpaid_deposit")) {
    return "Follow up on deposit";
  }

  if (signals.includes("partially_paid")) {
    return "Collect remaining balance";
  }

  if (signals.includes("overdue")) {
    return "Follow up on overdue invoice";
  }

  return "Review invoice";
}

function buildPriorityItems(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  customerTotals: ReturnType<typeof buildCustomerTotals>;
  todayIso: string;
}) {
  return input.invoices
    .filter(isOpenReceivable)
    .map((invoice) => {
      const latestEvent = latestForInvoice(
        invoice.id,
        input.paymentEvents,
        (event) => event.occurredAt
      );
      const latestPayment = latestForInvoice(
        invoice.id,
        input.payments,
        (payment) => payment.createdAt ?? payment.paymentDate
      );
      const daysPastDue = getDaysPastDue(invoice, input.todayIso);
      const lastActivityAt = getLatestActivity({
        invoice,
        payments: input.payments,
        paymentEvents: input.paymentEvents
      });
      const daysSinceActivity = lastActivityAt
        ? daysBetween(input.todayIso, lastActivityAt.slice(0, 10))
        : 0;
      const customerId = invoice.customerId ?? invoice.customer?.id ?? null;
      const customerName = invoice.customer?.name ?? "Unknown customer";
      const customerKey = customerId ?? `unknown:${customerName}`;
      const customerOutstanding =
        input.customerTotals.get(customerKey)?.outstandingAmount ?? 0;
      const signals: CollectionsPrioritySignal[] = [];
      let priorityScore = 0;

      if (latestEvent?.eventType === "payment_failed") {
        signals.push("failed_payment");
        priorityScore += 90;
      }

      if (latestEvent?.eventType === "payment_voided") {
        signals.push("voided_payment");
        priorityScore += 85;
      }

      if (
        latestEvent &&
        pendingEventTypes.some(
          (eventType) => eventType === latestEvent.eventType
        )
      ) {
        signals.push("pending_checkout");
        priorityScore += 50;
      }

      if (latestPayment?.status === "pending") {
        signals.push("pending_payment");
        priorityScore += 45;
      }

      if (daysPastDue !== null && daysPastDue > 0) {
        signals.push("overdue");
        priorityScore += daysPastDue > 60 ? 75 : daysPastDue > 30 ? 60 : 45;
      }

      if (invoice.workflowRole === "deposit") {
        signals.push("unpaid_deposit");
        priorityScore += 35;
      }

      if (invoice.status === "partially_paid") {
        signals.push("partially_paid");
        priorityScore += 30;
      }

      if (Number(invoice.retainageHeldAmount ?? 0) > 0) {
        signals.push("retainage_held");
        priorityScore += 10;
      }

      if (invoice.billingModel === "aia_progress") {
        signals.push("progress_billing");
        priorityScore += 18;
      }

      const exposureRank = rankCustomerExposure(customerOutstanding);
      if (exposureRank > 0) {
        signals.push("customer_exposure");
        priorityScore += exposureRank;
      }

      if (daysSinceActivity >= 14) {
        signals.push("stale_activity");
        priorityScore += 12;
      }

      return {
        id: `collections-priority-${invoice.id}`,
        invoiceId: invoice.id,
        invoiceReference: invoice.referenceNumber,
        invoiceHref: `/invoices/${invoice.id}`,
        customerId,
        customerName,
        customerHref: customerId ? `/customers/${customerId}` : null,
        projectId: invoice.projectId ?? invoice.project?.id ?? null,
        projectName: invoice.project?.name ?? "No project",
        projectHref:
          (invoice.projectId ?? invoice.project?.id)
            ? `/projects/${invoice.projectId ?? invoice.project?.id}`
            : null,
        balanceDueAmount: money(invoice.balanceDueAmount),
        priorityScore,
        tone:
          priorityScore >= 85
            ? "warning"
            : priorityScore >= 45
              ? "attention"
              : "neutral",
        reason: getPriorityReason(signals),
        nextAction: getNextAction(signals),
        dueSignal: getDueSignal(invoice, input.todayIso),
        lastActivityAt: lastActivityAt || invoice.updatedAt,
        latestPaymentEventType: latestEvent?.eventType ?? null,
        signals
      } satisfies CollectionsPriorityItem;
    })
    .sort((left, right) => {
      const scoreComparison = right.priorityScore - left.priorityScore;

      if (scoreComparison !== 0) {
        return scoreComparison;
      }

      const dueComparison = left.dueSignal.localeCompare(right.dueSignal);

      if (dueComparison !== 0) {
        return dueComparison;
      }

      return Number(right.balanceDueAmount) - Number(left.balanceDueAmount);
    });
}

function buildCustomerContinuity(input: {
  customerTotals: ReturnType<typeof buildCustomerTotals>;
}) {
  return Array.from(input.customerTotals.entries())
    .map(([id, customer]) => {
      const tone =
        customer.activePaymentIssueCount > 0 || customer.overdueInvoiceCount > 0
          ? "warning"
          : customer.pendingDepositCount > 0 || customer.partiallyPaidCount > 0
            ? "attention"
            : "neutral";

      return {
        id,
        customerId: customer.customerId,
        customerName: customer.customerName,
        customerHref: customer.customerHref,
        outstandingAmount: money(customer.outstandingAmount),
        overdueAmount: money(customer.overdueAmount),
        overdueInvoiceCount: customer.overdueInvoiceCount,
        openInvoiceCount: customer.openInvoiceCount,
        oldestUnpaidDueDate: customer.oldestUnpaidDueDate,
        activePaymentIssueCount: customer.activePaymentIssueCount,
        pendingDepositCount: customer.pendingDepositCount,
        linkedProjectCount: customer.projectIds.size,
        partiallyPaidCount: customer.partiallyPaidCount,
        latestActivityAt: customer.latestActivityAt,
        nextAction:
          customer.activePaymentIssueCount > 0
            ? "Review payment issue"
            : customer.overdueInvoiceCount > 0
              ? "Chase oldest overdue balance"
              : customer.pendingDepositCount > 0
                ? "Confirm deposit readiness"
                : "Review open balances",
        tone
      } satisfies CollectionsCustomerContinuity;
    })
    .sort((left, right) => {
      const issueComparison =
        right.activePaymentIssueCount - left.activePaymentIssueCount;

      if (issueComparison !== 0) {
        return issueComparison;
      }

      const overdueComparison =
        Number(right.overdueAmount) - Number(left.overdueAmount);

      if (overdueComparison !== 0) {
        return overdueComparison;
      }

      return Number(right.outstandingAmount) - Number(left.outstandingAmount);
    });
}

function eventKind(
  eventType: FinancialControlPaymentEventInput["eventType"]
): CollectionsPaymentTrailAttentionKind | null {
  switch (eventType) {
    case "payment_failed":
      return "failed";
    case "payment_voided":
      return "voided";
    case "checkout_started":
      return "checkout_pending";
    case "payment_requested":
      return "payment_requested";
    case "provider_sync":
      return null;
  }
}

function paymentEventReason(
  kind: CollectionsPaymentTrailAttentionKind,
  invoiceReference: string
) {
  switch (kind) {
    case "failed":
      return `${invoiceReference} has a failed payment event and still needs collection review.`;
    case "voided":
      return `${invoiceReference} has a voided payment event and may need follow-through.`;
    case "checkout_pending":
      return `${invoiceReference} has checkout activity without a final recorded outcome.`;
    case "payment_requested":
      return `${invoiceReference} has a payment request waiting for customer outcome.`;
    case "stale_pending_payment":
      return `${invoiceReference} has a pending payment older than the review window.`;
    case "recent_success":
      return `${invoiceReference} has a recent recorded payment for continuity review.`;
  }
}

function paymentEventNextAction(kind: CollectionsPaymentTrailAttentionKind) {
  switch (kind) {
    case "failed":
    case "voided":
      return "Review Payment Trail";
    case "checkout_pending":
    case "payment_requested":
      return "Confirm outcome";
    case "stale_pending_payment":
      return "Resolve pending state";
    case "recent_success":
      return "Confirm balance";
  }
}

function buildPaymentTrailAttention(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  todayIso: string;
}): CollectionsPaymentTrailAttention[] {
  const invoicesById = new Map(
    input.invoices.map((invoice) => [invoice.id, invoice])
  );
  const eventAttention = input.paymentEvents.flatMap(
    (event): CollectionsPaymentTrailAttention[] => {
      const kind = eventKind(event.eventType);

      if (!kind) {
        return [];
      }

      const invoice = invoicesById.get(event.invoiceId);
      const invoiceReference =
        event.invoice?.referenceNumber ??
        invoice?.referenceNumber ??
        "Payment event";

      return [
        {
          id: `payment-event-${event.id}`,
          kind,
          invoiceId: event.invoiceId,
          invoiceReference,
          invoiceHref: `/invoices/${event.invoiceId}`,
          customerName:
            event.customer?.name ??
            invoice?.customer?.name ??
            "Unknown customer",
          projectName:
            event.project?.name ?? invoice?.project?.name ?? "No project",
          amount: null,
          occurredAt: event.occurredAt,
          providerLabel: event.gatewayProvider ?? "Payment Trail",
          reason: paymentEventReason(kind, invoiceReference),
          nextAction: paymentEventNextAction(kind),
          tone: kind === "failed" || kind === "voided" ? "warning" : "attention"
        }
      ];
    }
  );
  const pendingPaymentAttention = input.payments
    .filter((payment) => payment.status === "pending")
    .filter((payment) => {
      const createdAt = payment.createdAt ?? payment.paymentDate;

      return createdAt
        ? daysBetween(input.todayIso, createdAt.slice(0, 10)) >= 3
        : false;
    })
    .map((payment) => {
      const invoice = payment.invoiceId
        ? invoicesById.get(payment.invoiceId)
        : null;
      const invoiceReference =
        payment.invoice?.referenceNumber ??
        invoice?.referenceNumber ??
        "Pending payment";

      return {
        id: `pending-payment-${payment.id}`,
        kind: "stale_pending_payment",
        invoiceId: payment.invoiceId ?? "",
        invoiceReference,
        invoiceHref: payment.invoiceId
          ? `/invoices/${payment.invoiceId}`
          : "/payments",
        customerName:
          payment.customer?.name ??
          invoice?.customer?.name ??
          "Unknown customer",
        projectName:
          payment.project?.name ?? invoice?.project?.name ?? "No project",
        amount: money(payment.amount),
        occurredAt: payment.createdAt ?? payment.paymentDate ?? "",
        providerLabel: payment.gatewayProvider ?? "Pending payment",
        reason: paymentEventReason("stale_pending_payment", invoiceReference),
        nextAction: paymentEventNextAction("stale_pending_payment"),
        tone: "attention"
      } satisfies CollectionsPaymentTrailAttention;
    });
  const recentSuccessAttention = input.payments
    .filter((payment) => payment.status === "recorded")
    .slice(0, 4)
    .map((payment) => {
      const invoice = payment.invoiceId
        ? invoicesById.get(payment.invoiceId)
        : null;
      const invoiceReference =
        payment.invoice?.referenceNumber ??
        invoice?.referenceNumber ??
        "Recorded payment";

      return {
        id: `recorded-payment-${payment.id}`,
        kind: "recent_success",
        invoiceId: payment.invoiceId ?? "",
        invoiceReference,
        invoiceHref: payment.invoiceId
          ? `/invoices/${payment.invoiceId}`
          : "/payments",
        customerName:
          payment.customer?.name ??
          invoice?.customer?.name ??
          "Unknown customer",
        projectName:
          payment.project?.name ?? invoice?.project?.name ?? "No project",
        amount: money(payment.amount),
        occurredAt: payment.createdAt ?? payment.paymentDate ?? "",
        providerLabel:
          payment.gatewayProvider ??
          payment.paymentMethod ??
          "Recorded payment",
        reason: paymentEventReason("recent_success", invoiceReference),
        nextAction: paymentEventNextAction("recent_success"),
        tone: "neutral"
      } satisfies CollectionsPaymentTrailAttention;
    });

  return [
    ...eventAttention,
    ...pendingPaymentAttention,
    ...recentSuccessAttention
  ].sort((left, right) => {
    const toneRank = { warning: 0, attention: 1, neutral: 2 };
    const toneComparison = toneRank[left.tone] - toneRank[right.tone];

    if (toneComparison !== 0) {
      return toneComparison;
    }

    return right.occurredAt.localeCompare(left.occurredAt);
  });
}

function buildSummaryCards(input: {
  priorityItems: CollectionsPriorityItem[];
  customerContinuity: CollectionsCustomerContinuity[];
  paymentTrailAttention: CollectionsPaymentTrailAttention[];
}) {
  const urgentItems = input.priorityItems.filter(
    (item) => item.tone === "warning"
  );
  const customerAtRisk = input.customerContinuity.filter(
    (customer) => customer.tone === "warning"
  );
  const depositBlockers = input.priorityItems.filter((item) =>
    item.signals.includes("unpaid_deposit")
  );
  const trailWarnings = input.paymentTrailAttention.filter(
    (item) => item.tone === "warning"
  );

  return [
    {
      id: "needs-attention-first",
      label: "Needs attention first",
      value: String(urgentItems.length),
      detail:
        urgentItems.length > 0
          ? `${urgentItems.length} invoice${urgentItems.length === 1 ? "" : "s"} have critical collection signals.`
          : "No critical collections signals are active.",
      tone: urgentItems.length > 0 ? "warning" : "neutral"
    },
    {
      id: "customer-exposure",
      label: "Customer exposure",
      value: String(customerAtRisk.length),
      detail:
        customerAtRisk.length > 0
          ? `${customerAtRisk.length} customer${customerAtRisk.length === 1 ? "" : "s"} have overdue or failed-payment exposure.`
          : "No customer-level overdue exposure is active.",
      tone: customerAtRisk.length > 0 ? "warning" : "neutral"
    },
    {
      id: "deposit-readiness",
      label: "Deposit blockers",
      value: String(depositBlockers.length),
      detail:
        depositBlockers.length > 0
          ? `${depositBlockers.length} deposit invoice${depositBlockers.length === 1 ? "" : "s"} still need financial follow-through.`
          : "No open deposit invoices are blocking readiness.",
      tone: depositBlockers.length > 0 ? "attention" : "neutral"
    },
    {
      id: "payment-trail-review",
      label: "Payment Trail review",
      value: String(trailWarnings.length),
      detail:
        trailWarnings.length > 0
          ? `${trailWarnings.length} failed or voided payment event${trailWarnings.length === 1 ? "" : "s"} need review.`
          : "No failed or voided payment events need collections review.",
      tone: trailWarnings.length > 0 ? "warning" : "neutral"
    }
  ] satisfies CollectionsCommandCenterSummaryCard[];
}

export function buildCollectionsCommandCenter(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  todayIso: string;
}): CollectionsCommandCenter {
  const customerTotals = buildCustomerTotals({
    invoices: input.invoices,
    paymentEvents: input.paymentEvents,
    todayIso: input.todayIso
  });
  const priorityItems = buildPriorityItems({
    invoices: input.invoices,
    payments: input.payments,
    paymentEvents: input.paymentEvents,
    customerTotals,
    todayIso: input.todayIso
  });
  const customerContinuity = buildCustomerContinuity({ customerTotals });
  const paymentTrailAttention = buildPaymentTrailAttention({
    invoices: input.invoices,
    payments: input.payments,
    paymentEvents: input.paymentEvents,
    todayIso: input.todayIso
  });

  return {
    summaryCards: buildSummaryCards({
      priorityItems,
      customerContinuity,
      paymentTrailAttention
    }),
    priorityItems: priorityItems.slice(0, 12),
    customerContinuity: customerContinuity.slice(0, 8),
    paymentTrailAttention: paymentTrailAttention.slice(0, 12)
  };
}
