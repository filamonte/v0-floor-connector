import { notFound } from "next/navigation";

import {
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentAddress,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  buildDocumentEngineBrand,
  getProjectEvidenceReceiptBackHref,
  getSharedEvidenceReceiptFooterNote
} from "@/lib/document-engine/print";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { listExecutionAttachmentsBySubjects } from "@/lib/execution-attachments/data";
import { listFieldNotes } from "@/lib/field-notes/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  listPortalEvidenceDeliveryEventsByProject,
  listPortalEvidenceGrantsByProject
} from "@/lib/portal-evidence-grants/data";
import { deriveSharedEvidenceReceiptRollupFromProjectSharing } from "@/lib/portal-evidence-grants/receipt-rollup";
import { deriveProjectPortalEvidenceSharingSummary } from "@/lib/portal-evidence-grants/summary";
import { getProjectById } from "@/lib/projects/data";

type ProjectEvidenceReceiptPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function ReceiptRows({
  rows
}: {
  rows: ReturnType<
    typeof deriveSharedEvidenceReceiptRollupFromProjectSharing
  >["contractorRows"];
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
        No explicit shared evidence receipt rows exist for this project yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {row.customerVisible ? "Customer-visible" : "Revoked/internal"}
            </p>
          </div>
          {row.customerNote ? (
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
              Customer note: {row.customerNote}
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
            {row.revokedAt ? (
              <p className="sm:col-span-2">
                Revoked: {formatDateTime(row.revokedAt)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProjectEvidenceReceiptPage({
  params
}: ProjectEvidenceReceiptPageProps) {
  const { projectId } = await params;
  const next = `/projects/${projectId}/evidence/receipt`;
  const user = await requireAuthenticatedUser(next);
  const [project, organizationContext, dailyLogs, fieldNotes, grants, events] =
    await Promise.all([
      getProjectById(projectId, next),
      getActiveOrganizationContext(user.id),
      listDailyLogsByProject(projectId, next),
      listFieldNotes(),
      listPortalEvidenceGrantsByProject(projectId, next),
      listPortalEvidenceDeliveryEventsByProject(projectId, next)
    ]);

  if (!project) {
    notFound();
  }

  const projectFieldNotes = fieldNotes.filter(
    (fieldNote) => fieldNote.projectId === project.id
  );
  const attachments = await listExecutionAttachmentsBySubjects(
    [
      ...dailyLogs.map((dailyLog) => ({
        subjectType: "daily_log" as const,
        subjectId: dailyLog.id
      })),
      ...projectFieldNotes.map((fieldNote) => ({
        subjectType: "field_note" as const,
        subjectId: fieldNote.id
      }))
    ],
    next,
    { includeArchived: true }
  );
  const sharingSummary = deriveProjectPortalEvidenceSharingSummary({
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      subjectType: attachment.subjectType,
      subjectId: attachment.subjectId,
      attachmentType: attachment.attachmentType,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      caption: attachment.caption,
      archivedAt: attachment.archivedAt,
      createdAt: attachment.createdAt
    })),
    grants,
    deliveryEvents: events
  });
  const receipt =
    deriveSharedEvidenceReceiptRollupFromProjectSharing(sharingSummary);
  const generatedAt = new Date().toISOString();
  const projectAddress = formatDocumentAddress([
    project.addressLine1,
    project.addressLine2,
    project.city,
    project.stateRegion,
    project.postalCode,
    project.countryCode
  ]);

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentEngineBrand(organizationContext)}
      title={`${project.name} Evidence Receipt`}
      subtitle="Printable receipt history for explicitly shared project evidence"
      statusLabel={receipt.statusLabel}
      backHref={getProjectEvidenceReceiptBackHref(project.id)}
      backLabel="Back to project evidence"
      exportNotice={receipt.exportNotice}
      footerNote={getSharedEvidenceReceiptFooterNote()}
      documentLabel="Evidence receipt"
      facts={[
        {
          label: "Customer",
          value:
            project.customer?.companyName ??
            project.customer?.name ??
            "Unknown customer"
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
      <CustomerDocumentSection title="Receipt rollup">
        <div className="grid gap-3 sm:grid-cols-3 print:break-inside-avoid">
          {[
            ["Viewed", receipt.viewedCount],
            ["Download requested", receipt.downloadedCount],
            ["Outstanding acknowledgement", receipt.unacknowledgedSharedCount],
            ["Revoked", receipt.revokedCount],
            [
              "Last customer activity",
              formatDateTime(receipt.lastCustomerInteractionAt)
            ],
            ["Last acknowledgement", formatDateTime(receipt.lastAcknowledgedAt)]
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

      <CustomerDocumentSection title="Shared evidence receipt rows">
        <ReceiptRows rows={receipt.contractorRows} />
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
