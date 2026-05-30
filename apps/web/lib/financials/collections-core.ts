import type { InvoiceStatus, InvoiceWorkflowRole } from "@floorconnector/types";

export type FinancialCollectionsEventType =
  | "payment_requested"
  | "checkout_started"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_voided"
  | "provider_sync";

export type FinancialCollectionsInvoiceInput = {
  id: string;
  referenceNumber: string;
  workflowRole: InvoiceWorkflowRole;
  status: InvoiceStatus;
  dueDate: string | null;
  balanceDueAmount: string;
  totalAmount: string;
  updatedAt: string;
};

export type FinancialCollectionsPaymentInput = {
  id: string;
  amount: string;
  status: "pending" | "recorded" | "void";
};

export type FinancialCollectionsEventInput = {
  id: string;
  eventType: FinancialCollectionsEventType;
  occurredAt: string;
};

export type FinancialCollectionsAgingBucket = {
  key: "current" | "1_30" | "31_60" | "61_plus" | "no_due_date";
  label: string;
  invoiceCount: number;
  balanceAmount: string;
};

export type FinancialCollectionsSummary = {
  openReceivableAmount: string;
  overdueReceivableAmount: string;
  partiallyPaidAmount: string;
  depositReceivableAmount: string;
  standardReceivableAmount: string;
  recordedPaymentAmount: string;
  pendingPaymentAmount: string;
  openInvoiceCount: number;
  overdueInvoiceCount: number;
  partiallyPaidInvoiceCount: number;
  failedOrVoidedEventCount: number;
  pendingEventCount: number;
  agingBuckets: FinancialCollectionsAgingBucket[];
};

const agingBucketDefinitions: Array<{
  key: FinancialCollectionsAgingBucket["key"];
  label: string;
}> = [
  { key: "current", label: "Current" },
  { key: "1_30", label: "1-30 days" },
  { key: "31_60", label: "31-60 days" },
  { key: "61_plus", label: "61+ days" },
  { key: "no_due_date", label: "No due date" }
];

function money(value: number) {
  return value.toFixed(2);
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

export function isOpenReceivableInvoice(
  invoice: FinancialCollectionsInvoiceInput
) {
  return (
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number(invoice.balanceDueAmount) > 0
  );
}

export function getInvoiceAgingBucket(
  invoice: FinancialCollectionsInvoiceInput,
  todayIso: string
): FinancialCollectionsAgingBucket["key"] {
  if (!invoice.dueDate) {
    return "no_due_date";
  }

  const dueTime = parseIsoDate(invoice.dueDate).getTime();
  const todayTime = parseIsoDate(todayIso).getTime();
  const daysPastDue = Math.floor((todayTime - dueTime) / 86_400_000);

  if (daysPastDue <= 0) {
    return "current";
  }

  if (daysPastDue <= 30) {
    return "1_30";
  }

  if (daysPastDue <= 60) {
    return "31_60";
  }

  return "61_plus";
}

export function buildFinancialCollectionsSummary(input: {
  invoices: FinancialCollectionsInvoiceInput[];
  payments: FinancialCollectionsPaymentInput[];
  events: FinancialCollectionsEventInput[];
  todayIso: string;
}): FinancialCollectionsSummary {
  const openInvoices = input.invoices.filter(isOpenReceivableInvoice);
  const overdueInvoices = openInvoices.filter((invoice) => {
    return invoice.dueDate ? invoice.dueDate < input.todayIso : false;
  });
  const partiallyPaidInvoices = openInvoices.filter(
    (invoice) => invoice.status === "partially_paid"
  );
  const failedOrVoidedEvents = input.events.filter((event) =>
    ["payment_failed", "payment_voided"].includes(event.eventType)
  );
  const pendingEvents = input.events.filter((event) =>
    ["payment_requested", "checkout_started"].includes(event.eventType)
  );
  const agingTotals = new Map<
    FinancialCollectionsAgingBucket["key"],
    { invoiceCount: number; balanceAmount: number }
  >();

  for (const invoice of openInvoices) {
    const key = getInvoiceAgingBucket(invoice, input.todayIso);
    const previous = agingTotals.get(key) ?? {
      invoiceCount: 0,
      balanceAmount: 0
    };

    agingTotals.set(key, {
      invoiceCount: previous.invoiceCount + 1,
      balanceAmount: previous.balanceAmount + Number(invoice.balanceDueAmount)
    });
  }

  return {
    openReceivableAmount: money(
      openInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.balanceDueAmount),
        0
      )
    ),
    overdueReceivableAmount: money(
      overdueInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.balanceDueAmount),
        0
      )
    ),
    partiallyPaidAmount: money(
      partiallyPaidInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.balanceDueAmount),
        0
      )
    ),
    depositReceivableAmount: money(
      openInvoices
        .filter((invoice) => invoice.workflowRole === "deposit")
        .reduce((sum, invoice) => sum + Number(invoice.balanceDueAmount), 0)
    ),
    standardReceivableAmount: money(
      openInvoices
        .filter((invoice) => invoice.workflowRole === "standard")
        .reduce((sum, invoice) => sum + Number(invoice.balanceDueAmount), 0)
    ),
    recordedPaymentAmount: money(
      input.payments
        .filter((payment) => payment.status === "recorded")
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
    ),
    pendingPaymentAmount: money(
      input.payments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + Number(payment.amount), 0)
    ),
    openInvoiceCount: openInvoices.length,
    overdueInvoiceCount: overdueInvoices.length,
    partiallyPaidInvoiceCount: partiallyPaidInvoices.length,
    failedOrVoidedEventCount: failedOrVoidedEvents.length,
    pendingEventCount: pendingEvents.length,
    agingBuckets: agingBucketDefinitions.map((bucket) => {
      const value = agingTotals.get(bucket.key) ?? {
        invoiceCount: 0,
        balanceAmount: 0
      };

      return {
        key: bucket.key,
        label: bucket.label,
        invoiceCount: value.invoiceCount,
        balanceAmount: money(value.balanceAmount)
      };
    })
  };
}
