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
import { getIncludedEstimateScopeItems } from "@/lib/estimates/workspace";
import { getPortalEstimateReviewData } from "@/lib/portal/data";

type PortalEstimatePdfPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
};

export default async function PortalEstimatePdfPage({
  params
}: PortalEstimatePdfPageProps) {
  const { estimateId } = await params;
  const estimate = await getPortalEstimateReviewData(
    estimateId,
    `/portal/estimates/${estimateId}/pdf`
  );

  if (!estimate) {
    notFound();
  }

  const includedScopeItems = getIncludedEstimateScopeItems(estimate.content);

  return (
    <CustomerDocumentPrintView
      brand={estimate.contractorBrand}
      title={estimate.title ?? `Estimate ${estimate.referenceNumber}`}
      subtitle={`Estimate #${estimate.referenceNumber}`}
      statusLabel={formatDocumentStatus(estimate.status)}
      backHref={`/portal/estimates/${estimate.id}`}
      backLabel="Back to estimate"
      facts={[
        {
          label: "Customer",
          value: estimate.customer?.name ?? "Unknown customer"
        },
        {
          label: "Project",
          value: estimate.project?.name ?? "Unknown project"
        },
        { label: "Shared", value: formatDocumentDate(estimate.sentAt) },
        { label: "Approved", value: formatDocumentDate(estimate.approvedAt) },
        {
          label: "Subtotal",
          value: formatDocumentMoney(estimate.subtotalAmount)
        },
        { label: "Total", value: formatDocumentMoney(estimate.totalAmount) }
      ]}
    >
      <CustomerDocumentSection title="Scope summary">
        <CustomerDocumentHtml html={estimate.content.scopeSummaryHtml} />
        {includedScopeItems.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
            {includedScopeItems.map((item) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        ) : null}
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Line items">
        <CustomerDocumentLineItemsTable lineItems={estimate.lineItems} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Totals">
        <CustomerDocumentTotals
          rows={[
            { label: "Subtotal", value: estimate.subtotalAmount },
            { label: "Tax", value: estimate.taxAmount },
            { label: "Discount", value: estimate.discountAmount },
            { label: "Total", value: estimate.totalAmount, isTotal: true }
          ]}
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Terms">
        <CustomerDocumentHtml html={estimate.content.termsHtml} />
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
