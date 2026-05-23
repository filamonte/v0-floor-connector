export type AccountingReadinessTone =
  | "neutral"
  | "attention"
  | "warning"
  | "complete";

export type AccountingReadinessInvoiceInput = {
  id: string;
  customerId?: string | null;
  projectId?: string | null;
  referenceNumber: string;
  status: string;
  issueDate: string | null;
  dueDate: string | null;
  subtotalAmount: string;
  taxAmount: string;
  taxCollectedAmount?: string | null;
  retainageHeldAmount?: string | null;
  totalAmount: string;
  balanceDueAmount: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
};

export type AccountingReadinessPaymentInput = {
  id: string;
  invoiceId?: string | null;
  amount: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  paymentSource?: string | null;
  status: string;
  reference?: string | null;
  createdAt: string;
  invoice?: {
    id: string;
    referenceNumber: string;
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

export type AccountingReadinessPaymentEventInput = {
  id: string;
  invoiceId?: string | null;
  paymentId?: string | null;
  eventType: string;
  occurredAt: string;
  invoice?: {
    id: string;
    referenceNumber: string;
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

export type AccountingReadinessTaxSnapshotInput = {
  invoiceId: string;
  taxCollectedAmount: string;
  taxableSalesAmount?: string | null;
  exemptSalesAmount?: string | null;
};

export type AccountingReadinessInvoiceRow = {
  id: string;
  referenceNumber: string;
  statusLabel: string;
  customerName: string;
  customerHref: string | null;
  projectName: string;
  projectHref: string | null;
  href: string;
  issueDate: string | null;
  dueDate: string | null;
  subtotalAmount: string;
  taxAmount: string;
  taxCollectedAmount: string | null;
  retainageHeldAmount: string | null;
  totalAmount: string;
  paidAmount: string;
  balanceDueAmount: string;
  paymentStatusLabel: string;
  attentionLabel: string | null;
  attentionReason: string | null;
  tone: AccountingReadinessTone;
  exportValues: string[];
};

export type AccountingReadinessPaymentRow = {
  id: string;
  invoiceId: string | null;
  invoiceReference: string;
  invoiceHref: string | null;
  customerName: string;
  projectName: string;
  amount: string;
  paymentDate: string | null;
  paymentMethod: string;
  paymentSource: string;
  statusLabel: string;
  reference: string | null;
  attentionLabel: string | null;
  tone: AccountingReadinessTone;
};

export type AccountingReadinessAttentionItem = {
  id: string;
  label: string;
  reason: string;
  href: string;
  tone: AccountingReadinessTone;
};

export type AccountingReadinessNextMove = {
  label: string;
  href: string;
  reason: string;
};

export type AccountingReadinessSummary = {
  invoiceCount: number;
  paidInvoiceCount: number;
  openInvoiceCount: number;
  totalInvoiced: string;
  totalPaid: string;
  totalOpen: string;
  taxCollected: string | null;
  retainageHeld: string | null;
  paymentsNeedingReview: number;
};

export type AccountingReadinessResult = {
  invoiceRows: AccountingReadinessInvoiceRow[];
  paymentRows: AccountingReadinessPaymentRow[];
  attentionItems: AccountingReadinessAttentionItem[];
  summary: AccountingReadinessSummary;
  exportColumns: string[];
  nextMove: AccountingReadinessNextMove;
};

const exportColumns = [
  "Invoice reference",
  "Invoice status",
  "Customer",
  "Project",
  "Invoice date",
  "Due date",
  "Subtotal",
  "Tax",
  "Retainage",
  "Total",
  "Paid",
  "Balance due",
  "Payment status",
  "Payment Trail attention"
];

function money(value: string | number | null | undefined) {
  return Number(value ?? 0).toFixed(2);
}

function nullableMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return money(value);
}

function labelize(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not set";
}

function isOpenInvoice(invoice: AccountingReadinessInvoiceInput) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

function isPaidInvoice(invoice: AccountingReadinessInvoiceInput) {
  return invoice.status === "paid" || Number(invoice.balanceDueAmount) <= 0;
}

function getInvoicePaymentStatus(invoice: AccountingReadinessInvoiceInput) {
  if (invoice.status === "paid" || Number(invoice.balanceDueAmount) <= 0) {
    return "Paid";
  }

  if (invoice.status === "partially_paid") {
    return "Partially paid";
  }

  if (Number(invoice.balanceDueAmount) >= Number(invoice.totalAmount)) {
    return "Unpaid";
  }

  return "Open balance";
}

function getInvoiceAttention(input: {
  invoice: AccountingReadinessInvoiceInput;
  todayIso: string;
  events: AccountingReadinessPaymentEventInput[];
}) {
  const failedEvent = input.events.find((event) =>
    ["payment_failed", "payment_voided"].includes(event.eventType)
  );

  if (failedEvent) {
    return {
      label: "Review Payment Trail",
      reason:
        failedEvent.eventType === "payment_failed"
          ? "A payment attempt failed and should be reviewed before accounting closeout."
          : "A payment was voided and should be reviewed before accounting closeout.",
      tone: "warning" as const
    };
  }

  const pendingEvent = input.events.find((event) =>
    ["payment_requested", "checkout_started"].includes(event.eventType)
  );

  if (pendingEvent) {
    return {
      label: "Payment attention",
      reason:
        pendingEvent.eventType === "checkout_started"
          ? "Checkout started and still needs a completed payment outcome."
          : "A customer payment request is pending.",
      tone: "attention" as const
    };
  }

  if (!input.invoice.customerId || !input.invoice.customer) {
    return {
      label: "Review customer context",
      reason: "Customer context is missing from this accounting review row.",
      tone: "warning" as const
    };
  }

  if (!input.invoice.projectId || !input.invoice.project) {
    return {
      label: "Review project context",
      reason: "Project context is missing from this accounting review row.",
      tone: "attention" as const
    };
  }

  if (
    input.invoice.dueDate &&
    input.invoice.dueDate < input.todayIso &&
    isOpenInvoice(input.invoice)
  ) {
    return {
      label: "Open balance",
      reason: `Past due since ${input.invoice.dueDate}.`,
      tone: "attention" as const
    };
  }

  if (input.invoice.status === "partially_paid") {
    return {
      label: "Open balance",
      reason: "Partially paid with balance still due.",
      tone: "attention" as const
    };
  }

  if (isOpenInvoice(input.invoice)) {
    return {
      label: "Review open balance",
      reason: "Open balance remains for accounting review.",
      tone: "neutral" as const
    };
  }

  return null;
}

function sortInvoices(
  left: AccountingReadinessInvoiceRow,
  right: AccountingReadinessInvoiceRow
) {
  const toneRank = { warning: 0, attention: 1, neutral: 2, complete: 3 };
  const toneComparison = toneRank[left.tone] - toneRank[right.tone];

  if (toneComparison !== 0) {
    return toneComparison;
  }

  return right.totalAmount.localeCompare(left.totalAmount);
}

function sortPayments(
  left: AccountingReadinessPaymentRow,
  right: AccountingReadinessPaymentRow
) {
  const toneRank = { warning: 0, attention: 1, neutral: 2, complete: 3 };
  const toneComparison = toneRank[left.tone] - toneRank[right.tone];

  if (toneComparison !== 0) {
    return toneComparison;
  }

  return (right.paymentDate ?? "").localeCompare(left.paymentDate ?? "");
}

function getPaidAmountForInvoice(input: {
  invoiceId: string;
  payments: AccountingReadinessPaymentInput[];
}) {
  return input.payments
    .filter(
      (payment) =>
        payment.invoiceId === input.invoiceId && payment.status === "recorded"
    )
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
}

export function buildAccountingReadiness(input: {
  invoices: AccountingReadinessInvoiceInput[];
  payments: AccountingReadinessPaymentInput[];
  paymentEvents: AccountingReadinessPaymentEventInput[];
  taxSnapshots?: AccountingReadinessTaxSnapshotInput[];
  todayIso: string;
}): AccountingReadinessResult {
  const eventsByInvoiceId = new Map<
    string,
    AccountingReadinessPaymentEventInput[]
  >();

  input.paymentEvents.forEach((event) => {
    if (!event.invoiceId) {
      return;
    }

    const existing = eventsByInvoiceId.get(event.invoiceId) ?? [];
    eventsByInvoiceId.set(event.invoiceId, [...existing, event]);
  });

  const taxByInvoiceId = new Map(
    (input.taxSnapshots ?? []).map((snapshot) => [snapshot.invoiceId, snapshot])
  );

  const invoiceRows = input.invoices
    .map((invoice) => {
      const events = eventsByInvoiceId.get(invoice.id) ?? [];
      const attention = getInvoiceAttention({
        invoice,
        todayIso: input.todayIso,
        events
      });
      const taxSnapshot = taxByInvoiceId.get(invoice.id);
      const taxCollectedAmount =
        nullableMoney(taxSnapshot?.taxCollectedAmount) ??
        nullableMoney(invoice.taxCollectedAmount) ??
        nullableMoney(invoice.taxAmount);
      const retainageHeldAmount = nullableMoney(invoice.retainageHeldAmount);
      const paidAmount = money(
        getPaidAmountForInvoice({
          invoiceId: invoice.id,
          payments: input.payments
        })
      );
      const paymentStatusLabel = getInvoicePaymentStatus(invoice);

      return {
        id: invoice.id,
        referenceNumber: invoice.referenceNumber,
        statusLabel: labelize(invoice.status),
        customerName: invoice.customer?.name ?? "Unknown customer",
        customerHref: invoice.customer?.id
          ? `/customers/${invoice.customer.id}`
          : null,
        projectName: invoice.project?.name ?? "No project",
        projectHref: invoice.project?.id
          ? `/projects/${invoice.project.id}`
          : null,
        href: `/invoices/${invoice.id}`,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotalAmount: money(invoice.subtotalAmount),
        taxAmount: money(invoice.taxAmount),
        taxCollectedAmount,
        retainageHeldAmount,
        totalAmount: money(invoice.totalAmount),
        paidAmount,
        balanceDueAmount: money(invoice.balanceDueAmount),
        paymentStatusLabel,
        attentionLabel: attention?.label ?? null,
        attentionReason: attention?.reason ?? null,
        tone:
          attention?.tone ??
          (isPaidInvoice(invoice)
            ? ("complete" as const)
            : ("neutral" as const)),
        exportValues: [
          invoice.referenceNumber,
          labelize(invoice.status),
          invoice.customer?.name ?? "",
          invoice.project?.name ?? "",
          invoice.issueDate ?? "",
          invoice.dueDate ?? "",
          money(invoice.subtotalAmount),
          taxCollectedAmount ?? money(invoice.taxAmount),
          retainageHeldAmount ?? "",
          money(invoice.totalAmount),
          paidAmount,
          money(invoice.balanceDueAmount),
          paymentStatusLabel,
          attention?.label ?? ""
        ]
      };
    })
    .sort(sortInvoices);

  const paymentRows = input.payments
    .map((payment) => {
      const isFailedOrVoid = payment.status === "void";
      const isPending = payment.status === "pending";

      return {
        id: payment.id,
        invoiceId: payment.invoiceId ?? null,
        invoiceReference: payment.invoice?.referenceNumber ?? "No invoice",
        invoiceHref: payment.invoiceId
          ? `/invoices/${payment.invoiceId}`
          : null,
        customerName: payment.customer?.name ?? "Unknown customer",
        projectName: payment.project?.name ?? "No project",
        amount: money(payment.amount),
        paymentDate: payment.paymentDate ?? null,
        paymentMethod: payment.paymentMethod ?? "Not recorded",
        paymentSource: labelize(payment.paymentSource ?? "not recorded"),
        statusLabel: labelize(payment.status),
        reference: payment.reference ?? null,
        attentionLabel: isFailedOrVoid
          ? "Void payment"
          : isPending
            ? "Pending payment"
            : null,
        tone: isFailedOrVoid
          ? ("warning" as const)
          : isPending
            ? ("attention" as const)
            : ("complete" as const)
      };
    })
    .sort(sortPayments);

  const paymentEventAttention = input.paymentEvents
    .filter((event) =>
      [
        "payment_failed",
        "payment_voided",
        "payment_requested",
        "checkout_started"
      ].includes(event.eventType)
    )
    .map((event) => ({
      id: event.id,
      label: ["payment_failed", "payment_voided"].includes(event.eventType)
        ? "Review Payment Trail"
        : "Payment attention",
      reason:
        event.eventType === "payment_failed"
          ? "A payment attempt failed and needs reconciliation attention."
          : event.eventType === "payment_voided"
            ? "A payment was voided and needs reconciliation attention."
            : event.eventType === "checkout_started"
              ? "Checkout started and is waiting for a completed outcome."
              : "A customer payment request is pending.",
      href: event.invoiceId ? `/invoices/${event.invoiceId}` : "/payments",
      tone: ["payment_failed", "payment_voided"].includes(event.eventType)
        ? ("warning" as const)
        : ("attention" as const)
    }));

  const invoiceAttention = invoiceRows
    .filter((row) => row.attentionLabel)
    .map((row) => ({
      id: `invoice-${row.id}`,
      label: row.attentionLabel ?? "Review invoice",
      reason: row.attentionReason ?? "Review this invoice for accounting.",
      href: row.href,
      tone: row.tone
    }));

  const attentionItems = [...paymentEventAttention, ...invoiceAttention].sort(
    (left, right) => {
      const toneRank = { warning: 0, attention: 1, neutral: 2, complete: 3 };
      const toneComparison = toneRank[left.tone] - toneRank[right.tone];

      if (toneComparison !== 0) {
        return toneComparison;
      }

      return left.label.localeCompare(right.label);
    }
  );

  const invoiceCount = input.invoices.length;
  const paidInvoiceCount = input.invoices.filter(isPaidInvoice).length;
  const openInvoiceCount = input.invoices.filter(isOpenInvoice).length;
  const totalInvoiced = input.invoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount),
    0
  );
  const totalPaid = input.payments
    .filter((payment) => payment.status === "recorded")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalOpen = input.invoices.reduce(
    (sum, invoice) =>
      isOpenInvoice(invoice) ? sum + Number(invoice.balanceDueAmount) : sum,
    0
  );
  const taxValues =
    input.taxSnapshots && input.taxSnapshots.length > 0
      ? input.taxSnapshots.map((snapshot) => snapshot.taxCollectedAmount)
      : input.invoices.map(
          (invoice) => invoice.taxCollectedAmount ?? invoice.taxAmount
        );
  const retainageValues = input.invoices
    .map((invoice) => invoice.retainageHeldAmount)
    .filter((value): value is string => value !== null && value !== undefined);

  const nextMove =
    attentionItems[0] ??
    (invoiceRows.length > 0
      ? {
          label: "Review export-ready columns",
          reason:
            "Invoice and payment records are ready for accounting review without changing source records.",
          href: "/financials/accounting-readiness",
          tone: "neutral" as const
        }
      : {
          label: "Review accounting readiness",
          reason:
            "No invoice or payment records are available for accounting review yet.",
          href: "/financials",
          tone: "neutral" as const
        });

  return {
    invoiceRows,
    paymentRows,
    attentionItems,
    summary: {
      invoiceCount,
      paidInvoiceCount,
      openInvoiceCount,
      totalInvoiced: money(totalInvoiced),
      totalPaid: money(totalPaid),
      totalOpen: money(totalOpen),
      taxCollected:
        taxValues.length > 0
          ? money(taxValues.reduce((sum, value) => sum + Number(value), 0))
          : null,
      retainageHeld:
        retainageValues.length > 0
          ? money(
              retainageValues.reduce((sum, value) => sum + Number(value), 0)
            )
          : null,
      paymentsNeedingReview: paymentEventAttention.length
    },
    exportColumns,
    nextMove: {
      label: nextMove.label,
      href: nextMove.href,
      reason: nextMove.reason
    }
  };
}
