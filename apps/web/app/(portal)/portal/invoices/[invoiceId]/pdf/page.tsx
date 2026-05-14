import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentLineItemsTable,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  CustomerDocumentTotals,
  formatDocumentDate,
  formatDocumentMoney,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { getPortalInvoiceReviewData } from "@/lib/portal/data";

type PortalInvoicePdfPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function PortalInvoicePdfPage({ params }: PortalInvoicePdfPageProps) {
  const { invoiceId } = await params;
  const invoice = await getPortalInvoiceReviewData(
    invoiceId,
    `/portal/invoices/${invoiceId}/pdf`
  );

  if (!invoice) {
    notFound();
  }

  const activePayments = invoice.payments.filter((payment) => payment.status !== "void");

  return (
    <CustomerDocumentPrintView
      brand={invoice.contractorBrand}
      title={`Invoice ${invoice.referenceNumber}`}
      subtitle={`${invoice.workflowRole.replaceAll("_", " ")} invoice`}
      statusLabel={formatDocumentStatus(invoice.status)}
      backHref={`/portal/invoices/${invoice.id}`}
      backLabel="Back to invoice"
      facts={[
        { label: "Customer", value: invoice.customer?.name ?? "Unknown customer" },
        { label: "Project", value: invoice.project?.name ?? "Unknown project" },
        { label: "Issued", value: formatDocumentDate(invoice.issueDate) },
        { label: "Due", value: formatDocumentDate(invoice.dueDate) },
        { label: "Paid", value: formatDocumentMoney(invoice.paidAmount) },
        { label: "Balance due", value: formatDocumentMoney(invoice.balanceDueAmount) }
      ]}
      footerNote="This PDF/print view is a customer-facing rendering of the shared invoice. Payment still happens through the portal invoice page."
    >
      <CustomerDocumentSection title="Invoice items">
        <CustomerDocumentLineItemsTable lineItems={invoice.lineItems} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Totals">
        <CustomerDocumentTotals
          rows={[
            { label: "Subtotal", value: invoice.subtotalAmount },
            { label: "Tax", value: invoice.taxAmount },
            { label: "Discount", value: invoice.discountAmount },
            { label: "Retainage held", value: invoice.retainageHeldAmount },
            { label: "Total", value: invoice.totalAmount },
            { label: "Paid", value: invoice.paidAmount },
            { label: "Balance due", value: invoice.balanceDueAmount, isTotal: true }
          ]}
          totalLabel="Balance due"
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Payment activity">
        {activePayments.length > 0 ? (
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            {activePayments.map((payment) => (
              <p key={payment.id}>
                {formatDocumentMoney(payment.amount)} recorded {formatDocumentDate(payment.paymentDate)} via{" "}
                {payment.paymentMethod}
                {payment.reference ? ` (${payment.reference})` : ""}.
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No payment has been recorded on this invoice yet.
          </p>
        )}
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Notes">
        <CustomerDocumentHtml html={invoice.notes} />
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
