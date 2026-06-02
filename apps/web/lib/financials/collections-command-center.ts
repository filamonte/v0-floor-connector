import type {
  FinancialControlInvoiceInput,
  FinancialControlPaymentEventInput,
  FinancialControlPaymentInput
} from "./collections-summary";

export type CollectionsCommandCenterTone = "neutral" | "attention" | "warning";

export type CollectionsPriorityBand = "urgent" | "attention" | "monitoring";

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

export type CollectionsLatestPaymentSignal = {
  eventType: FinancialControlPaymentEventInput["eventType"];
  label: string;
  occurredAt: string;
  historyCount: number;
};

export type CollectionsDepositStatus =
  | "open"
  | "in_progress"
  | "settled"
  | "void";

export type CollectionsDepositContinuity = {
  id: string;
  invoiceId: string;
  invoiceReference: string;
  invoiceHref: string;
  customerName: string;
  customerHref: string | null;
  projectName: string;
  projectHref: string | null;
  balanceDueAmount: string;
  status: CollectionsDepositStatus;
  invoiceStatus: string;
  latestPaymentSignal: CollectionsLatestPaymentSignal | null;
  reason: string;
  tone: CollectionsCommandCenterTone;
};

export type CollectionsPriorityItem = {
  id: string;
  invoiceId: string;
  invoiceReference: string;
  invoiceHref: string;
  invoiceStatus: string;
  workflowRole: string;
  customerId: string | null;
  customerName: string;
  customerHref: string | null;
  projectId: string | null;
  projectName: string;
  projectHref: string | null;
  balanceDueAmount: string;
  priorityScore: number;
  priorityBand: CollectionsPriorityBand;
  tone: CollectionsCommandCenterTone;
  reason: string;
  nextAction: string;
  dueSignal: string;
  lastActivityAt: string;
  latestPaymentEventType: string | null;
  latestPaymentSignal: CollectionsLatestPaymentSignal | null;
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
  customerHref: string | null;
  projectName: string;
  projectHref: string | null;
  amount: string | null;
  occurredAt: string;
  historyCount: number;
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

export type CollectionsInvoiceStatusCounts = {
  draft: number;
  sent: number;
  partiallyPaid: number;
  paid: number;
  void: number;
};

export type CollectionsOperationalQueue = {
  id: string;
  label: string;
  count: number;
  amount: string | null;
  detail: string;
  href: string;
  tone: CollectionsCommandCenterTone;
};

export type CollectionsContinuitySnapshot = {
  invoiceStatusCounts: CollectionsInvoiceStatusCounts;
  operationalQueues: CollectionsOperationalQueue[];
};

export type CollectionsCommandCenter = {
  summaryCards: CollectionsCommandCenterSummaryCard[];
  continuitySnapshot: CollectionsContinuitySnapshot;
  priorityItems: CollectionsPriorityItem[];
  depositContinuity: CollectionsDepositContinuity[];
  customerContinuity: CollectionsCustomerContinuity[];
  paymentTrailAttention: CollectionsPaymentTrailAttention[];
  paymentExceptions: CollectionsPaymentTrailAttention[];
  recentActivity: CollectionsPaymentTrailAttention[];
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

function paymentEventLabel(
  eventType: FinancialControlPaymentEventInput["eventType"]
) {
  switch (eventType) {
    case "payment_requested":
      return "Payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_succeeded":
      return "Payment succeeded";
    case "payment_failed":
      return "Payment failed";
    case "payment_voided":
      return "Payment voided";
    case "provider_sync":
      return "Provider sync";
  }
}

function listPaymentSignalsForInvoice(input: {
  invoiceId: string;
  paymentEvents: FinancialControlPaymentEventInput[];
}) {
  return input.paymentEvents
    .filter((event) => event.invoiceId === input.invoiceId)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

function buildLatestPaymentSignal(input: {
  invoiceId: string;
  paymentEvents: FinancialControlPaymentEventInput[];
}): CollectionsLatestPaymentSignal | null {
  const events = listPaymentSignalsForInvoice(input);
  const latestEvent = events[0];

  if (!latestEvent) {
    return null;
  }

  return {
    eventType: latestEvent.eventType,
    label: paymentEventLabel(latestEvent.eventType),
    occurredAt: latestEvent.occurredAt,
    historyCount: events.length
  };
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

function getPriorityBand(input: {
  priorityScore: number;
  signals: CollectionsPrioritySignal[];
}): CollectionsPriorityBand {
  if (
    input.signals.includes("failed_payment") ||
    input.signals.includes("voided_payment") ||
    input.priorityScore >= 85
  ) {
    return "urgent";
  }

  if (
    input.signals.includes("overdue") ||
    input.signals.includes("pending_checkout") ||
    input.signals.includes("pending_payment") ||
    input.signals.includes("unpaid_deposit") ||
    input.signals.includes("partially_paid") ||
    input.priorityScore >= 35
  ) {
    return "attention";
  }

  return "monitoring";
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
      const latestPaymentSignal = buildLatestPaymentSignal({
        invoiceId: invoice.id,
        paymentEvents: input.paymentEvents
      });
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

      if (latestPaymentSignal?.eventType === "payment_failed") {
        signals.push("failed_payment");
        priorityScore += 90;
      }

      if (latestPaymentSignal?.eventType === "payment_voided") {
        signals.push("voided_payment");
        priorityScore += 85;
      }

      if (
        latestPaymentSignal &&
        pendingEventTypes.some(
          (eventType) => eventType === latestPaymentSignal.eventType
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

      const priorityBand = getPriorityBand({ priorityScore, signals });

      return {
        id: `collections-priority-${invoice.id}`,
        invoiceId: invoice.id,
        invoiceReference: invoice.referenceNumber,
        invoiceHref: `/invoices/${invoice.id}`,
        invoiceStatus: invoice.status,
        workflowRole: invoice.workflowRole,
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
        priorityBand,
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
        latestPaymentEventType: latestPaymentSignal?.eventType ?? null,
        latestPaymentSignal,
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
    case "payment_succeeded":
      return "recent_success";
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
  const historyCountByInvoiceId = new Map<string, number>();

  for (const event of input.paymentEvents) {
    historyCountByInvoiceId.set(
      event.invoiceId,
      (historyCountByInvoiceId.get(event.invoiceId) ?? 0) + 1
    );
  }

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
          customerHref:
            (invoice?.customerId ?? invoice?.customer?.id)
              ? `/customers/${invoice?.customerId ?? invoice?.customer?.id}`
              : null,
          projectName:
            event.project?.name ?? invoice?.project?.name ?? "No project",
          projectHref:
            (invoice?.projectId ?? invoice?.project?.id)
              ? `/projects/${invoice?.projectId ?? invoice?.project?.id}`
              : null,
          amount: null,
          occurredAt: event.occurredAt,
          historyCount: historyCountByInvoiceId.get(event.invoiceId) ?? 1,
          providerLabel: event.gatewayProvider ?? "Payment Trail",
          reason: paymentEventReason(kind, invoiceReference),
          nextAction: paymentEventNextAction(kind),
          tone:
            kind === "failed" || kind === "voided"
              ? "warning"
              : kind === "recent_success"
                ? "neutral"
                : "attention"
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
        customerHref:
          (invoice?.customerId ?? invoice?.customer?.id)
            ? `/customers/${invoice?.customerId ?? invoice?.customer?.id}`
            : null,
        projectName:
          payment.project?.name ?? invoice?.project?.name ?? "No project",
        projectHref:
          (invoice?.projectId ?? invoice?.project?.id)
            ? `/projects/${invoice?.projectId ?? invoice?.project?.id}`
            : null,
        amount: money(payment.amount),
        occurredAt: payment.createdAt ?? payment.paymentDate ?? "",
        historyCount: payment.invoiceId
          ? (historyCountByInvoiceId.get(payment.invoiceId) ?? 0)
          : 0,
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
        customerHref:
          (invoice?.customerId ?? invoice?.customer?.id)
            ? `/customers/${invoice?.customerId ?? invoice?.customer?.id}`
            : null,
        projectName:
          payment.project?.name ?? invoice?.project?.name ?? "No project",
        projectHref:
          (invoice?.projectId ?? invoice?.project?.id)
            ? `/projects/${invoice?.projectId ?? invoice?.project?.id}`
            : null,
        amount: money(payment.amount),
        occurredAt: payment.createdAt ?? payment.paymentDate ?? "",
        historyCount: payment.invoiceId
          ? (historyCountByInvoiceId.get(payment.invoiceId) ?? 0)
          : 0,
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

function classifyDepositStatus(input: {
  invoice: FinancialControlInvoiceInput;
  payments: FinancialControlPaymentInput[];
  latestPaymentSignal: CollectionsLatestPaymentSignal | null;
}): CollectionsDepositStatus {
  if (input.invoice.status === "void") {
    return "void";
  }

  if (
    input.invoice.status === "paid" ||
    Number(input.invoice.balanceDueAmount) <= 0 ||
    input.latestPaymentSignal?.eventType === "payment_succeeded" ||
    input.payments.some(
      (payment) =>
        payment.invoiceId === input.invoice.id && payment.status === "recorded"
    )
  ) {
    return "settled";
  }

  if (
    input.latestPaymentSignal?.eventType === "payment_requested" ||
    input.latestPaymentSignal?.eventType === "checkout_started" ||
    input.payments.some(
      (payment) =>
        payment.invoiceId === input.invoice.id && payment.status === "pending"
    )
  ) {
    return "in_progress";
  }

  return "open";
}

function depositReason(status: CollectionsDepositStatus) {
  switch (status) {
    case "open":
      return "Deposit invoice has an open balance and no current payment-in-progress signal.";
    case "in_progress":
      return "Deposit invoice has a payment request, checkout, or pending payment signal in progress.";
    case "settled":
      return "Deposit invoice is settled from canonical invoice or payment evidence.";
    case "void":
      return "Deposit invoice is void and preserved for billing history.";
  }
}

function buildDepositContinuity(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
}): CollectionsDepositContinuity[] {
  return input.invoices
    .filter((invoice) => invoice.workflowRole === "deposit")
    .map((invoice) => {
      const latestPaymentSignal = buildLatestPaymentSignal({
        invoiceId: invoice.id,
        paymentEvents: input.paymentEvents
      });
      const status = classifyDepositStatus({
        invoice,
        payments: input.payments,
        latestPaymentSignal
      });

      return {
        id: `deposit-continuity-${invoice.id}`,
        invoiceId: invoice.id,
        invoiceReference: invoice.referenceNumber,
        invoiceHref: `/invoices/${invoice.id}`,
        customerName: invoice.customer?.name ?? "Unknown customer",
        customerHref:
          (invoice.customerId ?? invoice.customer?.id)
            ? `/customers/${invoice.customerId ?? invoice.customer?.id}`
            : null,
        projectName: invoice.project?.name ?? "No project",
        projectHref:
          (invoice.projectId ?? invoice.project?.id)
            ? `/projects/${invoice.projectId ?? invoice.project?.id}`
            : null,
        balanceDueAmount: money(invoice.balanceDueAmount),
        status,
        invoiceStatus: invoice.status,
        latestPaymentSignal,
        reason: depositReason(status),
        tone:
          status === "open"
            ? "attention"
            : status === "in_progress"
              ? "attention"
              : "neutral"
      } satisfies CollectionsDepositContinuity;
    })
    .sort((left, right) => {
      const statusRank: Record<CollectionsDepositStatus, number> = {
        open: 0,
        in_progress: 1,
        settled: 2,
        void: 3
      };
      const statusComparison =
        statusRank[left.status] - statusRank[right.status];

      if (statusComparison !== 0) {
        return statusComparison;
      }

      return Number(right.balanceDueAmount) - Number(left.balanceDueAmount);
    });
}

function buildSummaryCards(input: {
  priorityItems: CollectionsPriorityItem[];
  depositContinuity: CollectionsDepositContinuity[];
  customerContinuity: CollectionsCustomerContinuity[];
  paymentTrailAttention: CollectionsPaymentTrailAttention[];
}) {
  const openBalanceAmount = money(
    input.priorityItems.reduce(
      (sum, item) => sum + Number(item.balanceDueAmount),
      0
    )
  );
  const urgentItems = input.priorityItems.filter(
    (item) => item.priorityBand === "urgent"
  );
  const attentionItems = input.priorityItems.filter(
    (item) => item.priorityBand === "attention"
  );
  const activeDeposits = input.depositContinuity.filter(
    (deposit) => deposit.status === "open" || deposit.status === "in_progress"
  );
  const trailWarnings = input.paymentTrailAttention.filter(
    (item) => item.tone === "warning"
  );
  const trailAttention = input.paymentTrailAttention.filter(
    (item) => item.tone === "attention"
  );
  const recentSuccess = input.paymentTrailAttention.filter(
    (item) => item.kind === "recent_success"
  );

  return [
    {
      id: "open-ar-balance",
      label: "Open AR balance",
      value: openBalanceAmount,
      detail:
        input.priorityItems.length > 0
          ? `${input.priorityItems.length} open invoice${input.priorityItems.length === 1 ? "" : "s"} with balance due.`
          : "No canonical invoices currently carry an open AR balance.",
      tone: input.priorityItems.length > 0 ? "attention" : "neutral"
    },
    {
      id: "attention-count",
      label: "Urgent / attention",
      value: `${urgentItems.length} / ${attentionItems.length}`,
      detail:
        urgentItems.length > 0
          ? `${urgentItems.length} invoice${urgentItems.length === 1 ? "" : "s"} have critical collection signals.`
          : attentionItems.length > 0
            ? `${attentionItems.length} invoice${attentionItems.length === 1 ? "" : "s"} need collection attention.`
            : "No urgent or attention collection bands are active.",
      tone: urgentItems.length > 0 ? "warning" : "neutral"
    },
    {
      id: "deposit-readiness",
      label: "Deposits active",
      value: String(activeDeposits.length),
      detail:
        activeDeposits.length > 0
          ? `${activeDeposits.length} deposit invoice${activeDeposits.length === 1 ? "" : "s"} are open or in progress.`
          : input.depositContinuity.length > 0
            ? "Deposit-role invoices are currently settled or void."
            : "No deposit-role invoices are available in the current canonical data.",
      tone: activeDeposits.length > 0 ? "attention" : "neutral"
    },
    {
      id: "payment-trail-review",
      label: "Trail issues",
      value: String(trailWarnings.length + trailAttention.length),
      detail:
        trailWarnings.length > 0
          ? `${trailWarnings.length} failed or voided payment event${trailWarnings.length === 1 ? "" : "s"} need review.`
          : trailAttention.length > 0
            ? `${trailAttention.length} payment request, checkout, or stale pending signal${trailAttention.length === 1 ? "" : "s"} need outcome review.`
            : "No failed, voided, requested, or checkout Payment Trail issues are active.",
      tone: trailWarnings.length > 0 ? "warning" : "neutral"
    },
    {
      id: "recent-success",
      label: "Recent success",
      value: String(recentSuccess.length),
      detail:
        recentSuccess.length > 0
          ? `${recentSuccess.length} recent successful payment signal${recentSuccess.length === 1 ? "" : "s"} are available for balance confirmation.`
          : "No recent successful payment activity is visible in the current read model.",
      tone: "neutral"
    }
  ] satisfies CollectionsCommandCenterSummaryCard[];
}

function buildContinuitySnapshot(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  priorityItems: CollectionsPriorityItem[];
}): CollectionsContinuitySnapshot {
  const invoiceStatusCounts = input.invoices.reduce(
    (counts, invoice) => {
      if (invoice.status === "draft") {
        counts.draft += 1;
      } else if (invoice.status === "sent") {
        counts.sent += 1;
      } else if (invoice.status === "partially_paid") {
        counts.partiallyPaid += 1;
      } else if (invoice.status === "paid") {
        counts.paid += 1;
      } else if (invoice.status === "void") {
        counts.void += 1;
      }

      return counts;
    },
    {
      draft: 0,
      sent: 0,
      partiallyPaid: 0,
      paid: 0,
      void: 0
    }
  );
  const openInvoices = input.invoices.filter(isOpenReceivable);
  const openBalanceAmount = money(
    openInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceDueAmount),
      0
    )
  );
  const openDepositInvoices = openInvoices.filter(
    (invoice) => invoice.workflowRole === "deposit"
  );
  const openDepositAmount = money(
    openDepositInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.balanceDueAmount),
      0
    )
  );
  const pendingPayments = input.payments.filter(
    (payment) => payment.status === "pending"
  );
  const failedOrVoidedEvents = input.paymentEvents.filter((event) =>
    criticalEventTypes.some((eventType) => eventType === event.eventType)
  );
  const paymentInProgressEvents = input.paymentEvents.filter((event) =>
    pendingEventTypes.some((eventType) => eventType === event.eventType)
  );
  const overduePriorityItems = input.priorityItems.filter((item) =>
    item.signals.includes("overdue")
  );
  const partiallyPaidPriorityItems = input.priorityItems.filter((item) =>
    item.signals.includes("partially_paid")
  );
  const collectionAttentionCount = new Set([
    ...overduePriorityItems.map((item) => item.invoiceId),
    ...partiallyPaidPriorityItems.map((item) => item.invoiceId)
  ]).size;
  const recordedPayments = input.payments.filter(
    (payment) => payment.status === "recorded"
  );

  return {
    invoiceStatusCounts,
    operationalQueues: [
      {
        id: "open-balances",
        label: "Open balances",
        count: openInvoices.length,
        amount: openBalanceAmount,
        detail: "Canonical invoices with balance still due.",
        href: "/invoices?status=open",
        tone: openInvoices.length > 0 ? "attention" : "neutral"
      },
      {
        id: "collection-attention",
        label: "Collection attention",
        count: collectionAttentionCount,
        amount: null,
        detail: "Overdue and partially paid invoices needing follow-up.",
        href: "/financials/accounts-receivable",
        tone:
          overduePriorityItems.length > 0
            ? "warning"
            : partiallyPaidPriorityItems.length > 0
              ? "attention"
              : "neutral"
      },
      {
        id: "deposit-readiness",
        label: "Deposit readiness",
        count: openDepositInvoices.length,
        amount: openDepositAmount,
        detail: "Open deposit invoices tied to financial readiness.",
        href: "/financials/accounts-receivable",
        tone: openDepositInvoices.length > 0 ? "attention" : "neutral"
      },
      {
        id: "payment-in-progress",
        label: "Payment in progress",
        count: pendingPayments.length + paymentInProgressEvents.length,
        amount: null,
        detail: "Pending payments, payment requests, and checkout starts.",
        href: "/payments?status=pending",
        tone:
          pendingPayments.length + paymentInProgressEvents.length > 0
            ? "attention"
            : "neutral"
      },
      {
        id: "payment-event-review",
        label: "Payment-event review",
        count: failedOrVoidedEvents.length,
        amount: null,
        detail: "Failed or voided Payment Trail evidence to inspect.",
        href: "/payments",
        tone: failedOrVoidedEvents.length > 0 ? "warning" : "neutral"
      },
      {
        id: "recently-settled",
        label: "Recently settled",
        count: invoiceStatusCounts.paid + recordedPayments.length,
        amount: null,
        detail: "Paid invoices and recorded payment continuity.",
        href: "/payments?status=recorded",
        tone: "neutral"
      }
    ]
  };
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
  const paymentTrailContinuity = buildPaymentTrailAttention({
    invoices: input.invoices,
    payments: input.payments,
    paymentEvents: input.paymentEvents,
    todayIso: input.todayIso
  });
  const paymentExceptions = paymentTrailContinuity.filter(
    (item) => item.kind !== "recent_success"
  );
  const recentActivity = paymentTrailContinuity
    .filter((item) => item.kind === "recent_success")
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const depositContinuity = buildDepositContinuity({
    invoices: input.invoices,
    payments: input.payments,
    paymentEvents: input.paymentEvents
  });

  return {
    summaryCards: buildSummaryCards({
      priorityItems,
      depositContinuity,
      customerContinuity,
      paymentTrailAttention: paymentTrailContinuity
    }),
    continuitySnapshot: buildContinuitySnapshot({
      invoices: input.invoices,
      payments: input.payments,
      paymentEvents: input.paymentEvents,
      priorityItems
    }),
    priorityItems: priorityItems.slice(0, 12),
    depositContinuity: depositContinuity.slice(0, 8),
    customerContinuity: customerContinuity.slice(0, 8),
    paymentTrailAttention: paymentExceptions.slice(0, 12),
    paymentExceptions: paymentExceptions.slice(0, 12),
    recentActivity: recentActivity.slice(0, 8)
  };
}
