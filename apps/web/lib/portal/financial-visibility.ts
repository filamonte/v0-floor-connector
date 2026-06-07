export type PortalFinancialVisibilityTone =
  | "neutral"
  | "attention"
  | "complete"
  | "warning";

export type PortalFinancialInvoiceInput = {
  id: string;
  referenceNumber?: string | null;
  workflowRole?: string | null;
  status: string;
  totalAmount?: string | number | null;
  balanceDueAmount?: string | number | null;
  paidAmount?: string | number | null;
  issueDate?: string | null;
  dueDate?: string | null;
  latestPaymentEventType?: string | null;
  latestPaymentEventAt?: string | null;
  updatedAt?: string | null;
};

export type PortalFinancialPaymentInput = {
  id: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
};

export type PortalFinancialPaymentEventInput = {
  id: string;
  eventType: string;
  occurredAt: string;
};

export type PortalFinancialPaymentWorkflowInput = {
  canRequestPayment: boolean;
  requestBlockers: string[];
};

export type PortalFinancialVisibilityInvoiceRow = {
  id: string;
  referenceNumber: string;
  href: string;
  invoiceTypeLabel: string;
  statusLabel: string;
  tone: PortalFinancialVisibilityTone;
  totalLabel: string;
  balanceLabel: string;
  paymentStateLabel: string;
  customerExplanation: string;
  billingReadinessLabel: string;
  dueDateLabel: string;
  latestActivityLabel: string | null;
};

export type PortalFinancialVisibilitySummary = {
  statusLabel: string;
  statusTone: PortalFinancialVisibilityTone;
  primaryMessage: string;
  outstandingBalanceLabel: string;
  invoiceCountLabel: string;
  paymentHistoryLabel: string;
  billingReadinessLabel: string;
  nextActionLabel: string;
  nextActionHref: string | null;
  rows: PortalFinancialVisibilityInvoiceRow[];
  emptyStateMessage: string;
};

export type PortalInvoiceFinancialClarity = {
  statusLabel: string;
  statusTone: PortalFinancialVisibilityTone;
  balanceSummary: string;
  paymentHistorySummary: string;
  latestActivitySummary: string;
  billingReadinessSummary: string;
  nextStepSummary: string;
};

function parseMoney(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value.replace(/[$,]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatDateLabel(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatDateTimeLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : null;
}

function getInvoiceTypeLabel(invoice: PortalFinancialInvoiceInput) {
  return invoice.workflowRole === "deposit" ? "Deposit request" : "Invoice";
}

function getLatestPaymentStateLabel(invoice: PortalFinancialInvoiceInput) {
  switch (invoice.latestPaymentEventType) {
    case "payment_failed":
      return "Payment needs review";
    case "checkout_started":
      return "Payment in progress";
    case "payment_requested":
      return "Payment requested";
    case "payment_succeeded":
      return parseMoney(invoice.balanceDueAmount) > 0
        ? "Payment recorded with balance remaining"
        : "Payment complete";
    case "payment_voided":
      return "Payment voided";
    default:
      if (
        invoice.status === "paid" ||
        parseMoney(invoice.balanceDueAmount) <= 0
      ) {
        return "Billing current";
      }

      if (invoice.status === "partially_paid") {
        return "Partially paid";
      }

      return "Balance due";
  }
}

function getInvoiceTone(
  invoice: PortalFinancialInvoiceInput
): PortalFinancialVisibilityTone {
  if (invoice.latestPaymentEventType === "payment_failed") {
    return "warning";
  }

  if (
    invoice.latestPaymentEventType === "checkout_started" ||
    invoice.latestPaymentEventType === "payment_requested"
  ) {
    return "attention";
  }

  if (invoice.status === "paid" || parseMoney(invoice.balanceDueAmount) <= 0) {
    return "complete";
  }

  if (invoice.status === "void") {
    return "neutral";
  }

  return "attention";
}

function getInvoiceCustomerExplanation(invoice: PortalFinancialInvoiceInput) {
  const balanceLabel = formatMoney(parseMoney(invoice.balanceDueAmount));
  const invoiceType = getInvoiceTypeLabel(invoice).toLowerCase();

  switch (invoice.latestPaymentEventType) {
    case "payment_failed":
      return `A recent payment attempt did not complete, and this ${invoiceType} still shows ${balanceLabel} due.`;
    case "checkout_started":
      return `Checkout has started for this ${invoiceType}. The balance is complete only after payment succeeds.`;
    case "payment_requested":
      return `Payment has been requested for this ${invoiceType}. Review the invoice for the current balance and next step.`;
    case "payment_succeeded":
      return parseMoney(invoice.balanceDueAmount) > 0
        ? `A payment has been recorded, and ${balanceLabel} remains due.`
        : `Payment is recorded and this ${invoiceType} is current.`;
    case "payment_voided":
      return `The latest payment was voided, so this ${invoiceType} has returned to its current balance state.`;
    default:
      if (
        invoice.status === "paid" ||
        parseMoney(invoice.balanceDueAmount) <= 0
      ) {
        return `This ${invoiceType} does not show an outstanding balance.`;
      }

      if (invoice.status === "partially_paid") {
        return `A payment has been recorded, and ${balanceLabel} remains due.`;
      }

      return `This ${invoiceType} currently shows ${balanceLabel} due.`;
  }
}

function getBillingReadinessLabel(invoice: PortalFinancialInvoiceInput) {
  if (invoice.status === "void") {
    return "Voided invoices cannot accept payment.";
  }

  if (invoice.status === "paid" || parseMoney(invoice.balanceDueAmount) <= 0) {
    return "No customer payment is needed right now.";
  }

  if (invoice.latestPaymentEventType === "checkout_started") {
    return "Checkout is already in progress.";
  }

  if (invoice.latestPaymentEventType === "payment_requested") {
    return "Payment has already been requested.";
  }

  if (invoice.status === "sent" || invoice.status === "partially_paid") {
    return "Payment review is available from the shared invoice.";
  }

  return "Payment availability depends on the invoice state.";
}

function getLatestActivityLabel(invoice: PortalFinancialInvoiceInput) {
  if (!invoice.latestPaymentEventType) {
    return null;
  }

  const occurredAt = formatDateTimeLabel(invoice.latestPaymentEventAt);

  return occurredAt
    ? `${getLatestPaymentStateLabel(invoice)} on ${occurredAt}`
    : getLatestPaymentStateLabel(invoice);
}

function mapInvoiceRow(
  invoice: PortalFinancialInvoiceInput
): PortalFinancialVisibilityInvoiceRow {
  const total = parseMoney(invoice.totalAmount);
  const balance = parseMoney(invoice.balanceDueAmount);

  return {
    id: invoice.id,
    referenceNumber: invoice.referenceNumber ?? "Invoice",
    href: `/portal/invoices/${invoice.id}`,
    invoiceTypeLabel: getInvoiceTypeLabel(invoice),
    statusLabel: formatStatusLabel(invoice.status),
    tone: getInvoiceTone(invoice),
    totalLabel: formatMoney(total),
    balanceLabel: formatMoney(balance),
    paymentStateLabel: getLatestPaymentStateLabel(invoice),
    customerExplanation: getInvoiceCustomerExplanation(invoice),
    billingReadinessLabel: getBillingReadinessLabel(invoice),
    dueDateLabel: formatDateLabel(invoice.dueDate),
    latestActivityLabel: getLatestActivityLabel(invoice)
  };
}

function sortInvoices(invoices: PortalFinancialInvoiceInput[]) {
  return [...invoices].sort((left, right) => {
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;

    return rightTime - leftTime;
  });
}

function getSharedInvoiceCountLabel(count: number) {
  return `${count} shared invoice${count === 1 ? "" : "s"}`;
}

function getRecentActivityLabel(count: number) {
  return `${count} invoice${count === 1 ? "" : "s"} with recent payment activity.`;
}

export function derivePortalFinancialVisibility(input: {
  projectId: string;
  invoices?: PortalFinancialInvoiceInput[];
}): PortalFinancialVisibilitySummary {
  const invoices = sortInvoices(input.invoices ?? []);
  const rows = invoices.map(mapInvoiceRow);
  const outstandingBalance = invoices
    .filter((invoice) => invoice.status !== "void")
    .reduce((sum, invoice) => sum + parseMoney(invoice.balanceDueAmount), 0);
  const openRows = rows.filter(
    (row) => row.tone === "attention" || row.tone === "warning"
  );
  const latestOpenRow = openRows[0] ?? null;
  const recordedActivityCount = invoices.filter(
    (invoice) => invoice.latestPaymentEventType
  ).length;
  const failedCount = invoices.filter(
    (invoice) => invoice.latestPaymentEventType === "payment_failed"
  ).length;
  const inProgressCount = invoices.filter(
    (invoice) => invoice.latestPaymentEventType === "checkout_started"
  ).length;

  if (invoices.length === 0) {
    return {
      statusLabel: "No invoices shared yet",
      statusTone: "neutral",
      primaryMessage:
        "No billing records have been shared for this project yet.",
      outstandingBalanceLabel: formatMoney(0),
      invoiceCountLabel: "0 shared invoices",
      paymentHistoryLabel: "No payment activity is visible yet.",
      billingReadinessLabel:
        "Billing readiness will appear here when an invoice is shared.",
      nextActionLabel: "Review project workspace",
      nextActionHref: `/portal/projects/${input.projectId}`,
      rows,
      emptyStateMessage:
        "When your contractor shares an invoice or payment update, the current balance and payment history will appear here."
    };
  }

  if (failedCount > 0) {
    return {
      statusLabel: "Payment needs review",
      statusTone: "warning",
      primaryMessage:
        "At least one shared invoice has a recent payment attempt that did not complete.",
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      invoiceCountLabel: getSharedInvoiceCountLabel(invoices.length),
      paymentHistoryLabel: getRecentActivityLabel(recordedActivityCount),
      billingReadinessLabel:
        "Open the invoice to review the current balance and payment status.",
      nextActionLabel: "Review payment",
      nextActionHref:
        latestOpenRow?.href ?? `/portal/projects/${input.projectId}`,
      rows,
      emptyStateMessage: ""
    };
  }

  if (inProgressCount > 0) {
    return {
      statusLabel: "Payment in progress",
      statusTone: "attention",
      primaryMessage:
        "Checkout has started for a shared invoice and is still reflected on the project billing record.",
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      invoiceCountLabel: getSharedInvoiceCountLabel(invoices.length),
      paymentHistoryLabel: getRecentActivityLabel(recordedActivityCount),
      billingReadinessLabel:
        "Use the invoice page to confirm whether checkout is still in progress or needs another attempt.",
      nextActionLabel: "Review payment",
      nextActionHref:
        latestOpenRow?.href ?? `/portal/projects/${input.projectId}`,
      rows,
      emptyStateMessage: ""
    };
  }

  if (outstandingBalance > 0) {
    return {
      statusLabel: "Balance due",
      statusTone: "attention",
      primaryMessage:
        "One or more shared invoices still show an outstanding balance.",
      outstandingBalanceLabel: formatMoney(outstandingBalance),
      invoiceCountLabel: getSharedInvoiceCountLabel(invoices.length),
      paymentHistoryLabel:
        recordedActivityCount > 0
          ? `${recordedActivityCount} invoice${
              recordedActivityCount === 1 ? "" : "s"
            } with payment activity.`
          : "No payment activity is visible yet.",
      billingReadinessLabel:
        "Open the invoice to review the balance and available payment action.",
      nextActionLabel: "Review balance",
      nextActionHref:
        latestOpenRow?.href ?? `/portal/projects/${input.projectId}`,
      rows,
      emptyStateMessage: ""
    };
  }

  return {
    statusLabel: "Billing is current",
    statusTone: "complete",
    primaryMessage:
      "The invoices shared in this portal do not show an outstanding balance.",
    outstandingBalanceLabel: formatMoney(0),
    invoiceCountLabel: getSharedInvoiceCountLabel(invoices.length),
    paymentHistoryLabel:
      recordedActivityCount > 0
        ? `${recordedActivityCount} invoice${
            recordedActivityCount === 1 ? "" : "s"
          } with payment activity.`
        : "No payment activity is visible yet.",
    billingReadinessLabel:
      "No customer payment is needed from the currently shared invoices.",
    nextActionLabel: "Return to project workspace",
    nextActionHref: `/portal/projects/${input.projectId}`,
    rows,
    emptyStateMessage: ""
  };
}

function formatPaymentMethodLabel(paymentMethod: string) {
  switch (paymentMethod) {
    case "local_manual":
      return "manual payment";
    case "stripe":
      return "online payment";
    default:
      return formatStatusLabel(paymentMethod);
  }
}

function getPaymentBlockerLabel(blocker: string) {
  switch (blocker) {
    case "invoice_not_sent":
      return "The invoice must be sent before customer payment can start.";
    case "invoice_void":
      return "This invoice is void and cannot accept payment.";
    case "no_balance_due":
      return "This invoice does not show an outstanding balance.";
    default:
      return "Payment cannot start from the current invoice state.";
  }
}

export function derivePortalInvoiceFinancialClarity(input: {
  invoice: PortalFinancialInvoiceInput;
  payments?: PortalFinancialPaymentInput[];
  paymentEvents?: PortalFinancialPaymentEventInput[];
  paymentWorkflow?: PortalFinancialPaymentWorkflowInput;
}): PortalInvoiceFinancialClarity {
  const row = mapInvoiceRow(input.invoice);
  const payments = input.payments ?? [];
  const paymentEvents = input.paymentEvents ?? [];
  const latestPaymentEvent = paymentEvents[0] ?? null;
  const paidAmount = parseMoney(input.invoice.paidAmount);
  const totalAmount = parseMoney(input.invoice.totalAmount);
  const balanceAmount = parseMoney(input.invoice.balanceDueAmount);
  const latestPayment = payments[0] ?? null;
  const paymentHistorySummary =
    payments.length > 0
      ? `${payments.length} recorded payment${
          payments.length === 1 ? "" : "s"
        }; ${formatMoney(paidAmount)} paid of ${formatMoney(totalAmount)} total.`
      : "No recorded payments are visible on this invoice yet.";
  const latestActivitySummary = latestPaymentEvent
    ? `${formatStatusLabel(latestPaymentEvent.eventType)} on ${formatDateTimeLabel(
        latestPaymentEvent.occurredAt
      )}.`
    : latestPayment
      ? `Latest recorded payment was ${formatMoney(
          parseMoney(latestPayment.amount)
        )} by ${formatPaymentMethodLabel(latestPayment.paymentMethod)} on ${formatDateLabel(
          latestPayment.paymentDate
        )}.`
      : "No payment activity has been recorded yet.";
  const billingReadinessSummary = input.paymentWorkflow?.canRequestPayment
    ? `Payment can start from this invoice for the current ${formatMoney(
        balanceAmount
      )} balance.`
    : input.paymentWorkflow?.requestBlockers[0]
      ? getPaymentBlockerLabel(input.paymentWorkflow.requestBlockers[0])
      : row.billingReadinessLabel;
  const nextStepSummary =
    row.tone === "complete"
      ? "No customer payment step is needed right now."
      : row.tone === "warning"
        ? "Review the latest payment status before treating this invoice as complete."
        : input.paymentWorkflow?.canRequestPayment
          ? "Continue to checkout when ready, or return to the project workspace for broader context."
          : "Review the invoice status and contact the contractor if the balance or payment availability looks unclear.";

  return {
    statusLabel: row.paymentStateLabel,
    statusTone: row.tone,
    balanceSummary: row.customerExplanation,
    paymentHistorySummary,
    latestActivitySummary,
    billingReadinessSummary,
    nextStepSummary
  };
}
