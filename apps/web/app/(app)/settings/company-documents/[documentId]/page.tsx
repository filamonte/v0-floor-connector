import Link from "next/link";
import { notFound } from "next/navigation";

import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  getCompanyDocumentAccess,
  getCompanyDocumentById
} from "@/lib/company-documents/data";
import {
  companyDocumentAudienceLabels,
  companyDocumentCategoryLabels,
  companyDocumentStatusLabels
} from "@/lib/company-documents/types";
import {
  buildCompanyDocumentPrintHref,
  getCompanyDocumentExportNotice
} from "@/lib/document-engine/print";

type CompanyDocumentDetailPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

const panelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_48px_-40px_rgba(34,26,20,0.28)]";
const labelClassName =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]";
const primaryButtonClassName =
  "inline-flex rounded-md border border-[var(--copper-light)] bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--copper)] hover:bg-[var(--copper-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2";
const secondaryButtonClassName =
  "inline-flex rounded-md border border-[var(--border-warm)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(
    value.includes("T") ? value : `${value}T00:00:00`
  ).toLocaleDateString();
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleString();
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
      <p className={labelClassName}>{label}</p>
      <p className="mt-1 text-sm font-medium leading-6 text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

export default async function CompanyDocumentDetailPage({
  params
}: CompanyDocumentDetailPageProps) {
  const { documentId } = await params;
  const next = `/settings/company-documents/${documentId}`;
  const [document, access] = await Promise.all([
    getCompanyDocumentById(documentId, next),
    getCompanyDocumentAccess(next)
  ]);

  if (!document) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        eyebrow="Company Documents"
        title={document.title}
        description="Review an internal company document from your Document Library."
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={labelClassName}>Internal company document</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Company Documents stores your company's document content. It
                does not provide legal advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings/company-documents"
                className={secondaryButtonClassName}
              >
                Back to Company Documents
              </Link>
              {access.canManage ? (
                <Link
                  href={`/settings/company-documents?documentId=${document.id}`}
                  className={secondaryButtonClassName}
                >
                  Edit
                </Link>
              ) : null}
              <Link
                href={buildCompanyDocumentPrintHref(document.id)}
                className={primaryButtonClassName}
              >
                Print / Save PDF
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetadataItem
              label="Category"
              value={companyDocumentCategoryLabels[document.category]}
            />
            <MetadataItem label="Kind" value={document.documentKind} />
            <MetadataItem
              label="Audience"
              value={companyDocumentAudienceLabels[document.audience]}
            />
            <MetadataItem
              label="Status"
              value={companyDocumentStatusLabels[document.status]}
            />
            <MetadataItem
              label="Effective"
              value={formatDate(document.effectiveDate)}
            />
            <MetadataItem
              label="Expires"
              value={formatDateTime(document.expiresAt)}
            />
            <MetadataItem
              label="Created"
              value={formatDateTime(document.createdAt)}
            />
            <MetadataItem
              label="Updated"
              value={formatDateTime(document.updatedAt)}
            />
          </div>

          {document.archivedAt ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              This document is archived. It remains available for read-only
              review and printing.
            </div>
          ) : null}

          <section className={panelClassName}>
            <p className={labelClassName}>Description</p>
            {document.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                {document.description}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                No description has been added yet.
              </p>
            )}
          </section>

          <section className={panelClassName}>
            <p className={labelClassName}>Document body</p>
            {document.body ? (
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                {document.body}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-5 text-sm leading-6 text-[var(--text-secondary)]">
                No document body has been added yet.
              </p>
            )}
          </section>

          <p className="text-xs leading-5 text-[var(--text-tertiary)]">
            {getCompanyDocumentExportNotice()}
          </p>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
