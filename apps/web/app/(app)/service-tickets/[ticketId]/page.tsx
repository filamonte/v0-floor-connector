import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { ServiceTicketForm } from "@/components/service-ticket-form";
import {
  updateServiceTicketAction,
  updateServiceTicketStatusAction
} from "@/lib/service-tickets/actions";
import {
  getServiceTicketById,
  listServiceTicketCustomerOptions,
  listServiceTicketJobOptions,
  listServiceTicketProjectOptions
} from "@/lib/service-tickets/data";
import {
  listTimeCardsByServiceTicket,
  listTimePunchEventsByServiceTicket
} from "@/lib/time/data";
import { createWarrantyDocumentFromServiceTicketAction } from "@/lib/warranty-documents/actions";
import {
  listWarrantyDocumentsByServiceTicket,
  listWarrantyDocumentTemplates
} from "@/lib/warranty-documents/data";

type ServiceTicketDetailPageProps = {
  params: Promise<{ ticketId: string }>;
  searchParams?: Promise<{ error?: string; message?: string }>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export default async function ServiceTicketDetailPage({
  params,
  searchParams
}: ServiceTicketDetailPageProps) {
  const { ticketId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [
    ticket,
    customerOptions,
    projectOptions,
    jobOptions,
    warrantyDocuments,
    warrantyTemplates,
    serviceTimeCards,
    servicePunchEvents
  ] = await Promise.all([
    getServiceTicketById(ticketId),
    listServiceTicketCustomerOptions(),
    listServiceTicketProjectOptions(),
    listServiceTicketJobOptions(),
    listWarrantyDocumentsByServiceTicket(ticketId),
    listWarrantyDocumentTemplates(),
    listTimeCardsByServiceTicket(ticketId, `/service-tickets/${ticketId}`),
    listTimePunchEventsByServiceTicket(ticketId, `/service-tickets/${ticketId}`)
  ]);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Service / Warranty Ticket"
            title={ticket.title}
            description="Review the post-installation continuity record without turning service/warranty into a detached helpdesk."
            backHref="/service-tickets"
            backLabel="Back to service tickets"
            actions={
              <>
                {ticket.project ? (
                  <Link
                    href={`/projects/${ticket.project.id}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open project
                  </Link>
                ) : null}
                {ticket.job ? (
                  <Link
                    href={`/jobs/${ticket.job.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Open job
                  </Link>
                ) : null}
              </>
            }
          />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Status</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {formatLabel(ticket.status)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Type</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {formatLabel(ticket.ticketType)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Priority</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {formatLabel(ticket.priority)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Reported</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {formatDate(ticket.reportedOn)}
              </p>
            </div>
          </div>
        </div>

        <DetailPanel
          title="Service / Warranty Details"
          description="This is internal operational continuity only. Portal requests, warranty documents, signatures, billing, claims, and warranty time are separate future slices."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <dl className="space-y-4 text-sm leading-6 text-slate-600">
              <div>
                <dt className="font-medium text-slate-950">Customer</dt>
                <dd>{ticket.customer?.name ?? "Unknown customer"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Project</dt>
                <dd>{ticket.project?.name ?? "Not linked yet"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Original job</dt>
                <dd>
                  {ticket.job
                    ? `${ticket.job.id.slice(0, 8)} / ${formatLabel(ticket.job.dispatchStatus)}`
                    : "Not linked yet"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Warranty dates</dt>
                <dd>
                  {formatDate(ticket.warrantyStartDate)} to{" "}
                  {formatDate(ticket.warrantyEndDate)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Resolved</dt>
                <dd>{formatDateTime(ticket.resolvedAt)}</dd>
              </div>
            </dl>
            <div className="space-y-4">
              <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
                <p className="text-sm font-semibold text-slate-950">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {ticket.description ?? "No description recorded yet."}
                </p>
              </section>
              <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
                <p className="text-sm font-semibold text-slate-950">
                  Warranty basis
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {ticket.warrantyBasis ??
                    "No warranty basis or coverage note recorded yet."}
                </p>
              </section>
              <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
                <p className="text-sm font-semibold text-slate-950">
                  Resolution
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {ticket.resolutionSummary ??
                    "No resolution summary recorded yet."}
                </p>
              </section>
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Status Actions"
          description="Status changes stay internal and do not mutate invoices, payments, job costing, portal state, documents, or customer commitments."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {(
              [
                "scheduled",
                "in_progress",
                "resolved",
                "closed",
                "canceled"
              ] as const
            ).map((status) => (
              <form
                key={status}
                action={updateServiceTicketStatusAction}
                className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4"
              >
                <input type="hidden" name="ticketId" value={ticket.id} />
                <input type="hidden" name="status" value={status} />
                <input
                  type="hidden"
                  name="resolutionSummary"
                  value={ticket.resolutionSummary ?? ""}
                />
                <button
                  type="submit"
                  className="w-full rounded-[4px] border border-[#d6d6d6] px-3 py-2 text-sm font-medium capitalize text-slate-700 transition hover:border-[#ef7d32] hover:text-slate-950"
                >
                  Move to {formatLabel(status)}
                </button>
              </form>
            ))}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Edit Internal Ticket"
          description="Keep the ticket tied to the same customer/project/job chain. Billing, documents, portal requests, and warranty time are not part of this form."
        >
          <ServiceTicketForm
            action={updateServiceTicketAction}
            ticket={ticket}
            customerOptions={customerOptions}
            projectOptions={projectOptions}
            jobOptions={jobOptions}
          />
        </DetailPanel>

        <DetailPanel
          title="Service / Warranty Time"
          description="Time linked here is still recorded through the shared clocking center and canonical punch-event audit trail."
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <section className="rounded-[1.25rem] border border-[#e3d6c7] bg-[#fffaf4] px-5 py-4">
              <p className="text-sm font-semibold text-[#2b2118]">
                Clock time against this ticket
              </p>
              <p className="mt-2 text-sm leading-6 text-[#665446]">
                This opens the normal clocking composer with the ticket context
                prefilled. It does not create separate warranty time entries,
                billing, payroll, or job-costing mutations.
              </p>
              <Link
                href={`/time?compose=1&eventType=punch_in${
                  ticket.projectId ? `&projectId=${ticket.projectId}` : ""
                }${ticket.jobId ? `&jobId=${ticket.jobId}` : ""}&serviceTicketId=${
                  ticket.id
                }#time-punch-create`}
                className="mt-4 inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                Clock warranty/service time
              </Link>
            </section>

            <section className="space-y-3">
              {serviceTimeCards.length > 0 ? (
                serviceTimeCards.slice(0, 5).map((timeCard) => (
                  <LinkedRecordCard
                    key={timeCard.id}
                    href={`/time-cards/${timeCard.id}`}
                    title={timeCard.person?.displayName ?? "Unknown worker"}
                    subtitle={new Date(
                      `${timeCard.workDate}T00:00:00`
                    ).toLocaleDateString()}
                    meta={`${formatDuration(timeCard.workedMinutes)} worked / ${timeCard.status.replaceAll("_", " ")} / ${timeCard.reviewStatus.replaceAll("_", " ")}`}
                  />
                ))
              ) : (
                <p className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No punch-derived time cards are linked to this ticket yet.
                </p>
              )}
            </section>
          </div>

          {servicePunchEvents.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {servicePunchEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  <span className="font-semibold capitalize text-slate-950">
                    {event.eventType.replaceAll("_", " ")}
                  </span>{" "}
                  by {event.person?.displayName ?? "unknown worker"} at{" "}
                  {formatDateTime(event.occurredAt)}
                </div>
              ))}
            </div>
          ) : null}
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel title="Connected Records">
          <div className="grid gap-4">
            {ticket.customer ? (
              <LinkedRecordCard
                href={`/customers/${ticket.customer.id}`}
                title={ticket.customer.name}
                subtitle="Customer"
                meta="Account-level service history"
              />
            ) : null}
            {ticket.project ? (
              <LinkedRecordCard
                href={`/projects/${ticket.project.id}`}
                title={ticket.project.name}
                subtitle="Project"
                meta="Original project continuity"
              />
            ) : null}
            {ticket.job ? (
              <LinkedRecordCard
                href={`/jobs/${ticket.job.id}`}
                title={`Job ${ticket.job.id.slice(0, 8)}`}
                subtitle="Original job"
                meta={formatLabel(ticket.job.dispatchStatus)}
              />
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Warranty Documents"
          description="Generate warranty output from the canonical ticket and warranty template system. Send/sign is still planned later."
        >
          <div className="space-y-4">
            <form
              action={createWarrantyDocumentFromServiceTicketAction}
              className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4"
            >
              <input type="hidden" name="serviceTicketId" value={ticket.id} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Template
                </span>
                <select
                  name="documentTemplateId"
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                >
                  <option value="">Use default warranty template</option>
                  {warrantyTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
              >
                Create warranty document
              </button>
            </form>

            {warrantyDocuments.length > 0 ? (
              <div className="grid gap-3">
                {warrantyDocuments.map((document) => (
                  <Link
                    key={document.id}
                    href={`/warranty-documents/${document.id}`}
                    className="block rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-4 transition hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {document.title}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {formatLabel(document.status)} /{" "}
                      {formatDate(document.warrantyStartDate)} to{" "}
                      {formatDate(document.warrantyEndDate)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-[4px] border border-dashed border-[#d6d6d6] bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No warranty documents have been generated for this ticket yet.
              </p>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Planned Later"
          description="These belong here later, but are intentionally not implemented in this MVP."
        >
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>
              Warranty sends, customer review, signatures, and delivery proof
            </li>
            <li>Portal customer service requests and customer-safe status</li>
            <li>Service visit scheduling</li>
            <li>Billing automation and manufacturer claims</li>
            <li>Equipment/material usage automation</li>
          </ul>
        </DetailPanel>
      </aside>
    </div>
  );
}
