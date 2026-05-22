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
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  buildDocumentBackHref,
  buildDocumentEngineBrand,
  getDocumentEngineExportNotice,
  getDocumentEngineFooterNote
} from "@/lib/document-engine/print";
import { getInvoiceById } from "@/lib/invoices/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type InvoicePdfPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export default async function InvoicePdfPage({ params }: InvoicePdfPageProps) {
  const { invoiceId } = await params;
  const user = await requireAuthenticatedUser(`/invoices/${invoiceId}/pdf`);
  const [invoice, organizationContext] = await Promise.all([
    getInvoiceById(invoiceId, `/invoices/${invoiceId}/pdf`),
    getActiveOrganizationContext(user.id)
  ]);

  if (!invoice) {
    notFound();
  }

  const activePayments = invoice.payments.filter(
    (payment) => payment.status !== "void"
  );

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentEngineBrand(organizationContext)}
      title={`Invoice ${invoice.referenceNumber}`}
      subtitle={`${invoice.workflowRole.replaceAll("_", " ")} invoice`}
      statusLabel={formatDocumentStatus(invoice.status)}
      backHref={buildDocumentBackHref({
        subjectType: "invoice",
        subjectId: invoice.id
      })}
      backLabel="Back to invoice"
      exportNotice={getDocumentEngineExportNotice("invoice")}
      footerNote={`${getDocumentEngineFooterNote("invoice")} Payment state remains controlled by the invoice payment workflow.`}
      facts={[
        {
          label: "Customer",
          value: invoice.customer?.name ?? "Unknown customer"
        },
        { label: "Project", value: invoice.project?.name ?? "Unknown project" },
        { label: "Issued", value: formatDocumentDate(invoice.issueDate) },
        { label: "Due", value: formatDocumentDate(invoice.dueDate) },
        { label: "Paid", value: formatDocumentMoney(invoice.paidAmount) },
        {
          label: "Balance due",
          value: formatDocumentMoney(invoice.balanceDueAmount)
        }
      ]}
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
            {
              label: "Balance due",
              value: invoice.balanceDueAmount,
              isTotal: true
            }
          ]}
          totalLabel="Balance due"
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Payment activity">
        {activePayments.length > 0 ? (
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            {activePayments.map((payment) => (
              <p key={payment.id}>
                {formatDocumentMoney(payment.amount)} recorded{" "}
                {formatDocumentDate(payment.paymentDate)} via{" "}
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
