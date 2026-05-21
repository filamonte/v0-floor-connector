import { notFound } from "next/navigation";

import {
  CustomerDocumentHtml,
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentDate,
  formatDocumentStatus,
  type DocumentBrand
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getWarrantyDocumentById } from "@/lib/warranty-documents/data";

type WarrantyDocumentPrintPageProps = {
  params: Promise<{
    warrantyDocumentId: string;
  }>;
};

function buildDocumentBrand(
  organizationContext: Awaited<ReturnType<typeof getActiveOrganizationContext>>
): DocumentBrand {
  return {
    name: organizationContext?.organization.displayName ?? "FloorConnector",
    logoUrl: organizationContext?.organization.logoUrl,
    phone: organizationContext?.organization.phone,
    email: organizationContext?.organization.email,
    websiteUrl: organizationContext?.organization.websiteUrl,
    accentColor: organizationContext?.organization.brandAccentColor
  };
}

export default async function WarrantyDocumentPrintPage({
  params
}: WarrantyDocumentPrintPageProps) {
  const { warrantyDocumentId } = await params;
  const user = await requireAuthenticatedUser(
    `/warranty-documents/${warrantyDocumentId}/print`
  );
  const [document, organizationContext] = await Promise.all([
    getWarrantyDocumentById(
      warrantyDocumentId,
      `/warranty-documents/${warrantyDocumentId}/print`
    ),
    getActiveOrganizationContext(user.id)
  ]);

  if (!document) {
    notFound();
  }

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentBrand(organizationContext)}
      title={document.title}
      subtitle="Warranty document"
      statusLabel={formatDocumentStatus(document.status)}
      backHref={`/warranty-documents/${document.id}`}
      backLabel="Back to warranty document"
      facts={[
        {
          label: "Customer",
          value: document.customer?.name ?? "Unknown customer"
        },
        {
          label: "Project",
          value: document.project?.name ?? "No project context"
        },
        {
          label: "Original job",
          value: document.job ? `Job ${document.job.id.slice(0, 8)}` : "No job"
        },
        {
          label: "Service ticket",
          value: document.serviceTicket?.title ?? "No service ticket"
        },
        {
          label: "Warranty start",
          value: formatDocumentDate(document.warrantyStartDate)
        },
        {
          label: "Warranty end",
          value: formatDocumentDate(document.warrantyEndDate)
        }
      ]}
      footerNote="This PDF/print view is a customer-facing rendering of the canonical FloorConnector warranty document. Send, signature, delivery proof, billing, and portal visibility are not implemented in this slice."
    >
      <CustomerDocumentSection title="Warranty">
        <CustomerDocumentHtml html={document.renderedContent} />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Signature Status">
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Warranty signature routing is planned for a future slice after the
          contract-specific signature model is generalized safely. This document
          can be printed or saved now, but it has not been sent or signed
          through FloorConnector.
        </p>
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
