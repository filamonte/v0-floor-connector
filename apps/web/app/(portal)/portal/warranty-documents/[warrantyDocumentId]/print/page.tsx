import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentDate,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { getPortalWarrantyDocumentReviewData } from "@/lib/portal/data";

type PortalWarrantyDocumentPrintPageProps = {
  params: Promise<{
    warrantyDocumentId: string;
  }>;
};

export default async function PortalWarrantyDocumentPrintPage({
  params
}: PortalWarrantyDocumentPrintPageProps) {
  const { warrantyDocumentId } = await params;
  const warrantyDocument = await getPortalWarrantyDocumentReviewData(
    warrantyDocumentId,
    `/portal/warranty-documents/${warrantyDocumentId}/print`
  );

  if (!warrantyDocument) {
    notFound();
  }

  return (
    <CustomerDocumentPrintView
      brand={warrantyDocument.contractorBrand}
      title={warrantyDocument.title}
      subtitle="Shared warranty document"
      statusLabel={formatDocumentStatus(warrantyDocument.status)}
      backHref={`/portal/warranty-documents/${warrantyDocument.id}`}
      backLabel="Back to warranty"
      facts={[
        {
          label: "Customer",
          value: warrantyDocument.customer?.name ?? "Unknown customer"
        },
        {
          label: "Project",
          value: warrantyDocument.project?.name ?? "Unknown project"
        },
        {
          label: "Warranty start",
          value: formatDocumentDate(warrantyDocument.warrantyStartDate)
        },
        {
          label: "Warranty end",
          value: formatDocumentDate(warrantyDocument.warrantyEndDate)
        },
        {
          label: "Signed",
          value:
            warrantyDocument.currentUserSignerStatus === "signed"
              ? "Your signature is recorded"
              : "Not signed by you"
        },
        {
          label: "Status",
          value: formatDocumentStatus(warrantyDocument.status)
        }
      ]}
      footerNote="This PDF/print view is a customer-facing rendering of the shared warranty document. Signing still happens through the portal warranty page."
    >
      {warrantyDocument.warrantyBasis ? (
        <CustomerDocumentSection title="Warranty basis">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {warrantyDocument.warrantyBasis}
          </p>
        </CustomerDocumentSection>
      ) : null}

      <CustomerDocumentSection title="Warranty">
        <CustomerDocumentHtml html={warrantyDocument.renderedContent} />
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
