import { notFound } from "next/navigation";

import {
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentAddress,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import {
  getPortalProjectEvidenceReceiptBackHref,
  getSharedEvidenceReceiptFooterNote
} from "@/lib/document-engine/print";
import {
  getPortalDocumentBrand,
  getPortalProjectDetailSummary
} from "@/lib/portal/data";
import { getPortalSharedEvidenceSummary } from "@/lib/portal-evidence-grants/data";
import { deriveSharedEvidenceReceiptRollupFromPortalSummary } from "@/lib/portal-evidence-grants/receipt-rollup";

type PortalProjectEvidenceReceiptPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

export default async function PortalProjectEvidenceReceiptPage({
  params
}: PortalProjectEvidenceReceiptPageProps) {
  const { projectId } = await params;
  const next = `/portal/projects/${projectId}/evidence/receipt`;
  const [project, sharedEvidence] = await Promise.all([
    getPortalProjectDetailSummary(projectId, next),
    getPortalSharedEvidenceSummary(projectId, next)
  ]);

  if (!project) {
    notFound();
  }

  const [brand, receipt] = await Promise.all([
    getPortalDocumentBrand(project.organizationId),
    Promise.resolve(
      deriveSharedEvidenceReceiptRollupFromPortalSummary(sharedEvidence)
    )
  ]);
  const generatedAt = new Date().toISOString();
  const projectAddress = formatDocumentAddress([
    project.location.addressLine1,
    project.location.addressLine2,
    project.location.city,
    project.location.stateRegion,
    project.location.postalCode,
    project.location.countryCode
  ]);

  return (
    <CustomerDocumentPrintView
      brand={brand}
      title={`${project.name} Shared Evidence Receipt`}
      subtitle="Printable customer record of evidence shared through this portal project"
      statusLabel={receipt.statusLabel}
      backHref={getPortalProjectEvidenceReceiptBackHref(project.id)}
      backLabel="Back to shared project evidence"
      exportNotice={receipt.exportNotice}
      footerNote={getSharedEvidenceReceiptFooterNote()}
      documentLabel="Customer evidence receipt"
      facts={[
        {
          label: "Customer",
          value:
            project.customer?.companyName ??
            project.customer?.name ??
            "Customer"
        },
        {
          label: "Project status",
          value: formatDocumentStatus(project.status)
        },
        { label: "Location", value: projectAddress },
        { label: "Generated", value: formatDateTime(generatedAt) },
        { label: "Shared evidence", value: receipt.activeSharedCount },
        { label: "Acknowledged", value: receipt.acknowledgedCount }
      ]}
    >
      <CustomerDocumentSection title="Receipt status">
        <div className="grid gap-3 sm:grid-cols-3 print:break-inside-avoid">
          {[
            ["Viewed", receipt.viewedCount],
            ["Download requested", receipt.downloadedCount],
            ["Awaiting acknowledgement", receipt.unacknowledgedSharedCount],
            [
              "Last customer activity",
              formatDateTime(receipt.lastCustomerInteractionAt)
            ],
            [
              "Last acknowledgement",
              formatDateTime(receipt.lastAcknowledgedAt)
            ],
            ["Receipt rows", receipt.customerRows.length]
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          {receipt.primaryMessage}
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          {receipt.acknowledgementDisclaimer}
        </p>
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Shared evidence rows">
        {receipt.customerRows.length > 0 ? (
          <div className="grid gap-3">
            {receipt.customerRows.map((row) => (
              <div
                key={row.key}
                className="rounded-md border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 print:break-inside-avoid"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {row.sourceCategory} / {row.statusLabel}
                    </p>
                    <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
                      {row.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {row.fileName}
                    </p>
                  </div>
                </div>
                {row.customerNote ? (
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    Note: {row.customerNote}
                  </p>
                ) : null}
                <div className="mt-3 grid gap-2 rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-3 py-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-2">
                  <p>Shared: {formatDateTime(row.sharedAt)}</p>
                  <p>
                    Viewed:{" "}
                    {row.viewCount > 0
                      ? `${row.viewCount} time${row.viewCount === 1 ? "" : "s"}`
                      : "Not recorded"}
                  </p>
                  <p>
                    Download requested:{" "}
                    {row.downloadCount > 0
                      ? `${row.downloadCount} time${row.downloadCount === 1 ? "" : "s"}`
                      : "Not recorded"}
                  </p>
                  <p>Acknowledged: {formatDateTime(row.acknowledgedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            No customer-visible shared evidence receipt rows are available for
            this project yet.
          </p>
        )}
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
