import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import type { ServiceTicketListItem } from "@/lib/service-tickets/data";
import type { WarrantyDocumentContinuityItem } from "@/lib/warranty-documents/data";

type ServiceWarrantyContinuityPanelProps = {
  title?: string;
  description?: string;
  tickets: ServiceTicketListItem[];
  warrantyDocuments: WarrantyDocumentContinuityItem[];
  serviceTicketHref?: string;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : null;
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : null;
}

function renderStatusBadge(label: string) {
  return (
    <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
      {formatStatusLabel(label)}
    </span>
  );
}

function formatWarrantyRange(document: WarrantyDocumentContinuityItem) {
  const start = formatDate(document.warrantyStartDate);
  const end = formatDate(document.warrantyEndDate);

  if (start && end) {
    return `${start} to ${end}`;
  }

  if (start) {
    return `Starts ${start}`;
  }

  if (end) {
    return `Ends ${end}`;
  }

  return "Warranty dates not set";
}

function formatSignatureSummary(document: WarrantyDocumentContinuityItem) {
  const { signatureSummary } = document;
  const parts = [
    `${signatureSummary.signerCount} signer${
      signatureSummary.signerCount === 1 ? "" : "s"
    }`,
    `${signatureSummary.requestedSignerCount} requested`,
    `${signatureSummary.signedSignerCount} signed`
  ];
  const latestEvent = signatureSummary.latestEventType
    ? `Latest event: ${formatStatusLabel(signatureSummary.latestEventType)}${
        signatureSummary.latestEventCreatedAt
          ? ` (${formatDateTime(signatureSummary.latestEventCreatedAt)})`
          : ""
      }`
    : "No signature events yet";

  return `${parts.join(" / ")}. ${latestEvent}.`;
}

export function ServiceWarrantyContinuityPanel({
  title = "Service & Warranty",
  description = "Post-install service tickets and warranty documents stay connected to this canonical record without becoming a detached helpdesk.",
  tickets,
  warrantyDocuments,
  serviceTicketHref = "/service-tickets"
}: ServiceWarrantyContinuityPanelProps) {
  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "resolved" &&
      ticket.status !== "closed" &&
      ticket.status !== "canceled"
  );
  const recentClosedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "resolved" ||
      ticket.status === "closed" ||
      ticket.status === "canceled"
  );
  const hasRecords = tickets.length > 0 || warrantyDocuments.length > 0;

  return (
    <DetailPanel title={title} description={description}>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Open tickets
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {openTickets.length}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Warranty docs
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {warrantyDocuments.length}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Requested
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {warrantyDocuments.reduce(
                (total, document) =>
                  total + document.signatureSummary.requestedSignerCount,
                0
              )}
            </p>
          </div>
        </div>

        {!hasRecords ? (
          <AppEmptyState
            eyebrow="No linked records"
            title="No service or warranty records linked yet."
            description="Create service tickets from Service Tickets when post-install work is needed."
            actionHref={serviceTicketHref}
            actionLabel="Open service tickets"
          />
        ) : null}

        {openTickets.length > 0 ? (
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Open service/warranty tickets
            </p>
            <div className="grid gap-3">
              {openTickets.slice(0, 4).map((ticket) => (
                <LinkedRecordCard
                  key={ticket.id}
                  href={`/service-tickets/${ticket.id}`}
                  title={ticket.title}
                  subtitle={`${formatStatusLabel(ticket.ticketType)} / ${formatStatusLabel(
                    ticket.priority
                  )}`}
                  meta={[
                    ticket.project?.name,
                    ticket.job ? `Job ${ticket.job.dispatchStatus}` : null,
                    `Reported ${formatDate(ticket.reportedOn) ?? "date not set"}`
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                  badge={renderStatusBadge(ticket.status)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {recentClosedTickets.length > 0 ? (
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Recent resolved history
            </p>
            <div className="grid gap-3">
              {recentClosedTickets.slice(0, 2).map((ticket) => (
                <LinkedRecordCard
                  key={ticket.id}
                  href={`/service-tickets/${ticket.id}`}
                  title={ticket.title}
                  subtitle={`${formatStatusLabel(ticket.ticketType)} / ${formatStatusLabel(
                    ticket.priority
                  )}`}
                  meta={`Reported ${formatDate(ticket.reportedOn) ?? "date not set"}`}
                  badge={renderStatusBadge(ticket.status)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {warrantyDocuments.length > 0 ? (
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Warranty documents
            </p>
            <div className="grid gap-3">
              {warrantyDocuments.slice(0, 4).map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 sm:px-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/warranty-documents/${document.id}`}
                        className="whitespace-normal break-words text-base font-medium text-[var(--text-primary)] transition hover:text-[var(--copper)] [overflow-wrap:anywhere]"
                      >
                        {document.title}
                      </Link>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {formatWarrantyRange(document)}
                      </p>
                    </div>
                    {renderStatusBadge(document.status)}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {formatSignatureSummary(document)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/warranty-documents/${document.id}`}
                      className="text-sm font-medium text-[var(--copper)] transition hover:text-[var(--copper-light)]"
                    >
                      Open warranty document
                    </Link>
                    <Link
                      href={`/warranty-documents/${document.id}/print`}
                      className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      Print/save
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </DetailPanel>
  );
}
