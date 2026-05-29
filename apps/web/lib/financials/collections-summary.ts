import type { InvoiceStatus, InvoiceWorkflowRole } from "@floorconnector/types";

import {
  buildFinancialCollectionsSummary,
  isOpenReceivableInvoice,
  type FinancialCollectionsEventType
} from "./collections-core";

export type FinancialControlTone = "neutral" | "attention" | "warning";

export type FinancialControlInvoiceInput = {
  id: string;
  customerId?: string | null;
  projectId?: string | null;
  referenceNumber: string;
  workflowRole: InvoiceWorkflowRole;
  status: InvoiceStatus;
  billingModel?: string | null;
  dueDate: string | null;
  balanceDueAmount: string;
  paidAmount?: string | null;
  retainageHeldAmount?: string | null;
  totalAmount: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    status?: string | null;
  } | null;
};

export type FinancialControlPaymentInput = {
  id: string;
  invoiceId?: string | null;
  amount: string;
  status: "pending" | "recorded" | "void";
  paymentDate?: string | null;
  createdAt?: string | null;
  gatewayProvider?: string | null;
  paymentMethod?: string | null;
  invoice?: {
    id: string;
    referenceNumber: string;
    status?: string | null;
    balanceDueAmount?: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
};

export type FinancialControlPaymentEventInput = {
  id: string;
  invoiceId: string;
  paymentId?: string | null;
  eventType: FinancialCollectionsEventType;
  occurredAt: string;
  gatewayProvider?: string | null;
  invoice?: {
    id: string;
    referenceNumber: string;
    status?: string | null;
    balanceDueAmount?: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
};

export type FinancialControlInvoiceAttention = {
  id: string;
  referenceNumber: string;
  customerName: string;
  projectName: string;
  projectHref: string | null;
  href: string;
  statusLabel: string;
  balanceDueAmount: string;
  dueDate: string | null;
  reason: string;
  nextMoveLabel: string;
  tone: FinancialControlTone;
};

export type FinancialControlPaymentEventAttention = {
  id: string;
  invoiceId: string;
  invoiceReference: string;
  customerName: string;
  projectName: string;
  href: string;
  occurredAt: string;
  label: string;
  reason: string;
  nextMoveLabel: string;
  tone: FinancialControlTone;
};

export type FinancialControlProjectAttention = {
  id: string;
  projectName: string;
  customerName: string;
  href: string;
  openBalanceAmount: string;
  invoiceCount: number;
  overdueInvoiceCount: number;
  paymentAttentionCount: number;
  nextMoveLabel: string;
  reason: string;
};

export type FinancialControlNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type FinancialControlSignal = {
  id: string;
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: FinancialControlTone;
};

export type FinancialControlSummary = {
  openReceivablesAmount: string;
  overdueAmount: string;
  depositReceivablesAmount: string;
  standardReceivablesAmount: string;
  progressBillingReceivablesAmount: string;
  retainageHeldAmount: string;
  recordedPaymentAmount: string;
  pendingPaymentAmount: string;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  depositInvoiceCount: number;
  sentUnpaidInvoiceCount: number;
  progressBillingInvoiceCount: number;
  pendingPaymentCount: number;
  failedPaymentCount: number;
  paymentRequestedCount: number;
  partiallyPaidCount: number;
  paidRecentlyCount: number;
  invoicesNeedingAttention: FinancialControlInvoiceAttention[];
  paymentEventsNeedingReview: FinancialControlPaymentEventAttention[];
  projectCollectionAttention: FinancialControlProjectAttention[];
  commandSignals: FinancialControlSignal[];
  nextMove: FinancialControlNextMove;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function money(value: number) {
  return value.toFixed(2);
}

function isOverdue(
  invoice: Pick<FinancialControlInvoiceInput, "dueDate">,
  todayIso: string
) {
  return invoice.dueDate ? invoice.dueDate < todayIso : false;
}

function getInvoiceAttentionReason(
  invoice: FinancialControlInvoiceInput,
  todayIso: string
) {
  if (isOverdue(invoice, todayIso)) {
    return invoice.dueDate ? `Past due since ${invoice.dueDate}.` : "Past due.";
  }

  if (invoice.status === "partially_paid") {
    return "Partially paid with a remaining balance.";
  }

  return "Open balance still needs follow-through.";
}

function getInvoiceNextMove(
  invoice: FinancialControlInvoiceInput,
  todayIso: string
) {
  if (isOverdue(invoice, todayIso)) {
    return "Follow up on payment";
  }

  return "Review invoice";
}

function getEventLabel(eventType: FinancialCollectionsEventType) {
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
      return "Payment update";
  }
}

function getEventReason(eventType: FinancialCollectionsEventType) {
  switch (eventType) {
    case "payment_failed":
      return "A payment attempt failed and the invoice still needs review.";
    case "payment_voided":
      return "A payment was voided and the invoice may need follow-through.";
    case "payment_requested":
      return "A customer payment request is pending.";
    case "checkout_started":
      return "Checkout started and is waiting for a completed outcome.";
    case "payment_succeeded":
      return "Payment succeeded and was recorded as payment evidence.";
    case "provider_sync":
      return "Payment activity was updated for review.";
  }
}

function getEventNextMove(eventType: FinancialCollectionsEventType) {
  if (eventType === "payment_failed" || eventType === "payment_voided") {
    return "Review Payment Trail";
  }

  if (eventType === "payment_succeeded") {
    return "Confirm balance";
  }

  return "Follow up on payment";
}

function getEventTone(
  eventType: FinancialCollectionsEventType
): FinancialControlTone {
  if (eventType === "payment_failed" || eventType === "payment_voided") {
    return "warning";
  }

  if (eventType === "payment_succeeded") {
    return "neutral";
  }

  return "attention";
}

function sortInvoiceAttention(
  left: FinancialControlInvoiceAttention,
  right: FinancialControlInvoiceAttention
) {
  const toneRank = { warning: 0, attention: 1, neutral: 2 };
  const toneComparison = toneRank[left.tone] - toneRank[right.tone];

  if (toneComparison !== 0) {
    return toneComparison;
  }

  const leftDue = left.dueDate ?? "9999-12-31";
  const rightDue = right.dueDate ?? "9999-12-31";
  const dueComparison = leftDue.localeCompare(rightDue);

  if (dueComparison !== 0) {
    return dueComparison;
  }

  return Number(right.balanceDueAmount) - Number(left.balanceDueAmount);
}

function sortEventAttention(
  left: FinancialControlPaymentEventAttention,
  right: FinancialControlPaymentEventAttention
) {
  const toneRank = { warning: 0, attention: 1, neutral: 2 };
  const toneComparison = toneRank[left.tone] - toneRank[right.tone];

  if (toneComparison !== 0) {
    return toneComparison;
  }

  return right.occurredAt.localeCompare(left.occurredAt);
}

function buildInvoiceAttention(input: {
  invoice: FinancialControlInvoiceInput;
  todayIso: string;
}): FinancialControlInvoiceAttention {
  const overdue = isOverdue(input.invoice, input.todayIso);

  return {
    id: input.invoice.id,
    referenceNumber: input.invoice.referenceNumber,
    customerName: input.invoice.customer?.name ?? "Unknown customer",
    projectName: input.invoice.project?.name ?? "No project",
    projectHref: input.invoice.project?.id
      ? `/projects/${input.invoice.project.id}`
      : input.invoice.projectId
        ? `/projects/${input.invoice.projectId}`
        : null,
    href: `/invoices/${input.invoice.id}`,
    statusLabel: formatStatusLabel(input.invoice.status),
    balanceDueAmount: input.invoice.balanceDueAmount,
    dueDate: input.invoice.dueDate,
    reason: getInvoiceAttentionReason(input.invoice, input.todayIso),
    nextMoveLabel: getInvoiceNextMove(input.invoice, input.todayIso),
    tone: overdue ? "warning" : "attention"
  };
}

function buildEventAttention(
  event: FinancialControlPaymentEventInput
): FinancialControlPaymentEventAttention {
  return {
    id: event.id,
    invoiceId: event.invoiceId,
    invoiceReference: event.invoice?.referenceNumber ?? "Payment event",
    customerName: event.customer?.name ?? "Unknown customer",
    projectName: event.project?.name ?? "No project",
    href: `/invoices/${event.invoiceId}`,
    occurredAt: event.occurredAt,
    label: getEventLabel(event.eventType),
    reason: getEventReason(event.eventType),
    nextMoveLabel: getEventNextMove(event.eventType),
    tone: getEventTone(event.eventType)
  };
}

function buildProjectAttention(input: {
  invoices: FinancialControlInvoiceAttention[];
  events: FinancialControlPaymentEventAttention[];
}) {
  const rows = new Map<string, FinancialControlProjectAttention>();

  for (const invoice of input.invoices) {
    if (!invoice.projectHref) {
      continue;
    }

    const projectId = invoice.projectHref.replace("/projects/", "");
    const previous = rows.get(projectId);

    rows.set(projectId, {
      id: projectId,
      projectName: invoice.projectName,
      customerName: invoice.customerName,
      href: invoice.projectHref,
      openBalanceAmount: money(
        Number(previous?.openBalanceAmount ?? 0) +
          Number(invoice.balanceDueAmount)
      ),
      invoiceCount: (previous?.invoiceCount ?? 0) + 1,
      overdueInvoiceCount:
        (previous?.overdueInvoiceCount ?? 0) +
        (invoice.tone === "warning" ? 1 : 0),
      paymentAttentionCount: previous?.paymentAttentionCount ?? 0,
      nextMoveLabel: "Open project",
      reason:
        invoice.tone === "warning"
          ? "Project has overdue invoice attention."
          : "Project has open receivables attention."
    });
  }

  for (const event of input.events) {
    const related = input.invoices.find(
      (invoice) => invoice.id === event.invoiceId
    );

    if (!related?.projectHref) {
      continue;
    }

    const projectId = related.projectHref.replace("/projects/", "");
    const previous = rows.get(projectId);

    if (!previous) {
      continue;
    }

    rows.set(projectId, {
      ...previous,
      paymentAttentionCount: previous.paymentAttentionCount + 1,
      reason:
        event.tone === "warning"
          ? "Project has Payment Trail attention."
          : previous.reason
    });
  }

  return Array.from(rows.values()).sort((left, right) => {
    const overdueComparison =
      right.overdueInvoiceCount - left.overdueInvoiceCount;

    if (overdueComparison !== 0) {
      return overdueComparison;
    }

    const paymentComparison =
      right.paymentAttentionCount - left.paymentAttentionCount;

    if (paymentComparison !== 0) {
      return paymentComparison;
    }

    return Number(right.openBalanceAmount) - Number(left.openBalanceAmount);
  });
}

function buildCommandSignals(input: {
  collectionsSummary: ReturnType<typeof buildFinancialCollectionsSummary>;
  progressBillingInvoiceCount: number;
  progressBillingReceivablesAmount: string;
  retainageHeldAmount: string;
  failedPaymentCount: number;
  overdueInvoiceCount: number;
  depositInvoiceCount: number;
  pendingPaymentCount: number;
}): FinancialControlSignal[] {
  return [
    {
      id: "overdue-ar",
      label: "Overdue AR",
      value: input.collectionsSummary.overdueReceivableAmount,
      detail:
        input.overdueInvoiceCount > 0
          ? `${input.overdueInvoiceCount} overdue invoice${input.overdueInvoiceCount === 1 ? "" : "s"} need collection review.`
          : "No overdue receivables from current invoice balances.",
      href: "/financials/accounts-receivable",
      tone: input.overdueInvoiceCount > 0 ? "warning" : "neutral"
    },
    {
      id: "deposit-ar",
      label: "Deposits",
      value: input.collectionsSummary.depositReceivableAmount,
      detail:
        input.depositInvoiceCount > 0
          ? `${input.depositInvoiceCount} deposit invoice${input.depositInvoiceCount === 1 ? "" : "s"} still carry readiness-sensitive balance.`
          : "No open deposit invoices are blocking financial readiness.",
      href: "/financials/accounts-receivable",
      tone: input.depositInvoiceCount > 0 ? "attention" : "neutral"
    },
    {
      id: "payment-trail",
      label: "Payment Trail",
      value: String(input.failedPaymentCount + input.pendingPaymentCount),
      detail:
        input.failedPaymentCount > 0
          ? `${input.failedPaymentCount} failed or voided payment event${input.failedPaymentCount === 1 ? "" : "s"} need review.`
          : input.pendingPaymentCount > 0
            ? `${input.pendingPaymentCount} pending payment${input.pendingPaymentCount === 1 ? "" : "s"} still need a clear outcome.`
            : "No pending or failed payment activity needs review.",
      href: "/payments",
      tone:
        input.failedPaymentCount > 0
          ? "warning"
          : input.pendingPaymentCount > 0
            ? "attention"
            : "neutral"
    },
    {
      id: "retainage",
      label: "Retainage",
      value: input.retainageHeldAmount,
      detail:
        Number(input.retainageHeldAmount) > 0
          ? "Retainage is held on existing invoice snapshots for review."
          : "No retained amount is currently held on invoice snapshots.",
      href: "/financials/accounting-readiness",
      tone: Number(input.retainageHeldAmount) > 0 ? "attention" : "neutral"
    },
    {
      id: "progress-billing",
      label: "Progress billing",
      value: input.progressBillingReceivablesAmount,
      detail:
        input.progressBillingInvoiceCount > 0
          ? `${input.progressBillingInvoiceCount} progress invoice${input.progressBillingInvoiceCount === 1 ? "" : "s"} have open SOV-linked balance.`
          : "No open progress-billing invoices are waiting in AR.",
      href: "/progress-billing",
      tone: input.progressBillingInvoiceCount > 0 ? "attention" : "neutral"
    }
  ];
}

export function buildFinancialControlSummary(input: {
  invoices: FinancialControlInvoiceInput[];
  payments: FinancialControlPaymentInput[];
  paymentEvents: FinancialControlPaymentEventInput[];
  todayIso: string;
}): FinancialControlSummary {
  const collectionsSummary = buildFinancialCollectionsSummary({
    invoices: input.invoices,
    payments: input.payments,
    events: input.paymentEvents,
    todayIso: input.todayIso
  });
  const openInvoices = input.invoices.filter(isOpenReceivableInvoice);
  const depositInvoices = openInvoices.filter(
    (invoice) => invoice.workflowRole === "deposit"
  );
  const sentUnpaidInvoices = openInvoices.filter(
    (invoice) => invoice.status === "sent"
  );
  const progressBillingInvoices = openInvoices.filter(
    (invoice) => invoice.billingModel === "aia_progress"
  );
  const retainageHeldAmount = money(
    input.invoices
      .filter((invoice) => invoice.status !== "void")
      .reduce(
        (sum, invoice) => sum + Number(invoice.retainageHeldAmount ?? 0),
        0
      )
  );
  const recordedPaymentAmount = collectionsSummary.recordedPaymentAmount;
  const pendingPaymentAmount = collectionsSummary.pendingPaymentAmount;
  const invoicesNeedingAttention = openInvoices
    .map((invoice) =>
      buildInvoiceAttention({
        invoice,
        todayIso: input.todayIso
      })
    )
    .sort(sortInvoiceAttention);
  const paymentEventsNeedingReview = input.paymentEvents
    .filter((event) =>
      [
        "payment_failed",
        "payment_voided",
        "payment_requested",
        "checkout_started"
      ].includes(event.eventType)
    )
    .map(buildEventAttention)
    .sort(sortEventAttention);
  const projectCollectionAttention = buildProjectAttention({
    invoices: invoicesNeedingAttention,
    events: paymentEventsNeedingReview
  });
  const failedOrVoidedEvent = paymentEventsNeedingReview.find(
    (event) => event.tone === "warning"
  );
  const overdueInvoice = invoicesNeedingAttention.find(
    (invoice) => invoice.tone === "warning"
  );
  const pendingEvent = paymentEventsNeedingReview.find(
    (event) => event.tone === "attention"
  );
  const firstOpenInvoice = invoicesNeedingAttention[0];
  const nextMoveSource =
    failedOrVoidedEvent ?? overdueInvoice ?? pendingEvent ?? firstOpenInvoice;
  const nextMove = nextMoveSource
    ? {
        label: nextMoveSource.nextMoveLabel,
        href: nextMoveSource.href,
        reason: nextMoveSource.reason
      }
    : {
        label: "Review accounts receivable",
        href: "/financials/accounts-receivable",
        reason: "No payment attention needs action right now."
      };

  return {
    openReceivablesAmount: collectionsSummary.openReceivableAmount,
    overdueAmount: collectionsSummary.overdueReceivableAmount,
    depositReceivablesAmount: collectionsSummary.depositReceivableAmount,
    standardReceivablesAmount: collectionsSummary.standardReceivableAmount,
    progressBillingReceivablesAmount: money(
      progressBillingInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.balanceDueAmount),
        0
      )
    ),
    retainageHeldAmount,
    recordedPaymentAmount,
    pendingPaymentAmount,
    openInvoiceCount: collectionsSummary.openInvoiceCount,
    overdueInvoiceCount: collectionsSummary.overdueInvoiceCount,
    depositInvoiceCount: depositInvoices.length,
    sentUnpaidInvoiceCount: sentUnpaidInvoices.length,
    progressBillingInvoiceCount: progressBillingInvoices.length,
    pendingPaymentCount: input.payments.filter(
      (payment) => payment.status === "pending"
    ).length,
    failedPaymentCount: input.paymentEvents.filter((event) =>
      ["payment_failed", "payment_voided"].includes(event.eventType)
    ).length,
    paymentRequestedCount: input.paymentEvents.filter((event) =>
      ["payment_requested", "checkout_started"].includes(event.eventType)
    ).length,
    partiallyPaidCount: collectionsSummary.partiallyPaidInvoiceCount,
    paidRecentlyCount: input.payments.filter(
      (payment) => payment.status === "recorded"
    ).length,
    invoicesNeedingAttention,
    paymentEventsNeedingReview,
    projectCollectionAttention,
    commandSignals: buildCommandSignals({
      collectionsSummary,
      progressBillingInvoiceCount: progressBillingInvoices.length,
      progressBillingReceivablesAmount: money(
        progressBillingInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.balanceDueAmount),
          0
        )
      ),
      retainageHeldAmount,
      failedPaymentCount: input.paymentEvents.filter((event) =>
        ["payment_failed", "payment_voided"].includes(event.eventType)
      ).length,
      overdueInvoiceCount: collectionsSummary.overdueInvoiceCount,
      depositInvoiceCount: depositInvoices.length,
      pendingPaymentCount: input.payments.filter(
        (payment) => payment.status === "pending"
      ).length
    }),
    nextMove
  };
}
