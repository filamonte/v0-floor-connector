import type {
  AccountingReadinessInvoiceRow,
  AccountingReadinessPaymentRow
} from "./accounting-readiness";

export const accountingExportColumns = [
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
  "Latest payment date",
  "Payment method/source",
  "Payment attention",
  "Invoice link",
  "Project link"
];

export type AccountingExportRow = {
  values: string[];
};

function csvEscape(value: string | number | null | undefined) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function getLatestPaymentForInvoice(input: {
  invoiceId: string;
  payments: AccountingReadinessPaymentRow[];
}) {
  return input.payments
    .filter((payment) => payment.invoiceId === input.invoiceId)
    .sort((left, right) => {
      const dateComparison = (right.paymentDate ?? "").localeCompare(
        left.paymentDate ?? ""
      );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return right.id.localeCompare(left.id);
    })[0];
}

export function buildAccountingExportRows(input: {
  invoices: AccountingReadinessInvoiceRow[];
  payments: AccountingReadinessPaymentRow[];
}): AccountingExportRow[] {
  return input.invoices.map((invoice) => {
    const latestPayment = getLatestPaymentForInvoice({
      invoiceId: invoice.id,
      payments: input.payments
    });

    return {
      values: [
        invoice.referenceNumber,
        invoice.statusLabel,
        invoice.customerName,
        invoice.projectName,
        invoice.issueDate ?? "",
        invoice.dueDate ?? "",
        invoice.subtotalAmount,
        invoice.taxCollectedAmount ?? invoice.taxAmount,
        invoice.retainageHeldAmount ?? "",
        invoice.totalAmount,
        invoice.paidAmount,
        invoice.balanceDueAmount,
        invoice.paymentStatusLabel,
        latestPayment?.paymentDate ?? "",
        latestPayment
          ? `${latestPayment.paymentMethod} / ${latestPayment.paymentSource}`
          : "",
        invoice.attentionLabel ?? "",
        invoice.href,
        invoice.projectHref ?? ""
      ]
    };
  });
}

export function buildAccountingExportCsv(input: {
  invoices: AccountingReadinessInvoiceRow[];
  payments: AccountingReadinessPaymentRow[];
}) {
  const rows = buildAccountingExportRows(input);
  const lines = [
    accountingExportColumns.map(csvEscape).join(","),
    ...rows.map((row) => row.values.map(csvEscape).join(","))
  ];

  return lines.join("\r\n");
}
