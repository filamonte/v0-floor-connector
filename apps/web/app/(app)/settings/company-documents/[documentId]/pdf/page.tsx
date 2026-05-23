import { notFound } from "next/navigation";

import {
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentDate
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCompanyDocumentById } from "@/lib/company-documents/data";
import {
  companyDocumentAudienceLabels,
  companyDocumentCategoryLabels,
  companyDocumentStatusLabels
} from "@/lib/company-documents/types";
import {
  buildCompanyDocumentBackHref,
  buildDocumentEngineBrand,
  getCompanyDocumentExportNotice,
  getCompanyDocumentFooterNote
} from "@/lib/document-engine/print";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

type CompanyDocumentPdfPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString();
}

function PrintTextBlock({
  children,
  empty
}: {
  children: string | null;
  empty: string;
}) {
  if (!children?.trim()) {
    return (
      <p className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)] print:break-inside-avoid">
        {empty}
      </p>
    );
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
      {children}
    </div>
  );
}

export default async function CompanyDocumentPdfPage({
  params
}: CompanyDocumentPdfPageProps) {
  const { documentId } = await params;
  const next = `/settings/company-documents/${documentId}/pdf`;
  const user = await requireAuthenticatedUser(next);
  const [document, organizationContext] = await Promise.all([
    getCompanyDocumentById(documentId, next),
    getActiveOrganizationContext(user.id)
  ]);

  if (!document) {
    notFound();
  }

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentEngineBrand(organizationContext)}
      title={document.title}
      subtitle={`${companyDocumentCategoryLabels[document.category]} company document`}
      statusLabel={companyDocumentStatusLabels[document.status]}
      backHref={buildCompanyDocumentBackHref(document.id)}
      backLabel="Back to company document"
      documentLabel="Internal company document"
      ariaLabel="Company document print view"
      exportNotice={getCompanyDocumentExportNotice()}
      footerNote={getCompanyDocumentFooterNote()}
      facts={[
        {
          label: "Category",
          value: companyDocumentCategoryLabels[document.category]
        },
        { label: "Kind", value: document.documentKind },
        {
          label: "Audience",
          value: companyDocumentAudienceLabels[document.audience]
        },
        {
          label: "Status",
          value: companyDocumentStatusLabels[document.status]
        },
        {
          label: "Effective",
          value: formatDocumentDate(document.effectiveDate)
        },
        { label: "Expires", value: formatDateTime(document.expiresAt) }
      ]}
    >
      <CustomerDocumentSection title="Description">
        <PrintTextBlock
          empty="No description has been added yet."
          children={document.description}
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Document body">
        <PrintTextBlock
          empty="No document body has been added yet."
          children={document.body}
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Record details">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 print:break-inside-avoid">
          <div className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Created
            </dt>
            <dd className="mt-1 text-[var(--text-secondary)]">
              {formatDateTime(document.createdAt)}
            </dd>
          </div>
          <div className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Updated
            </dt>
            <dd className="mt-1 text-[var(--text-secondary)]">
              {formatDateTime(document.updatedAt)}
            </dd>
          </div>
          {document.archivedAt ? (
            <div className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Archived
              </dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                {formatDateTime(document.archivedAt)}
              </dd>
            </div>
          ) : null}
        </dl>
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
