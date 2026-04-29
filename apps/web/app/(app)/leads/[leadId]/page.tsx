import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { DirectoryContextCard } from "@/components/directory-context-card";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { OpportunityForm } from "@/components/opportunity-form";
import { listAppointmentsByOpportunity } from "@/lib/appointments/data";
import {
  startEstimateFromOpportunityAction,
  updateOpportunityAction
} from "@/lib/opportunities/actions";
import { getOpportunityById } from "@/lib/opportunities/data";

type LeadDetailPageProps = {
  params: Promise<{
    leadId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts.filter((value) => value && value.trim().length > 0);

  return filtered.length > 0 ? filtered.join(", ") : "Not provided";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not scheduled";
}

function formatMeasurementValue(value: string, unit: string, quantity: number | null) {
  const quantityLabel = quantity ? ` x ${quantity}` : "";
  return `${value} ${unit}${quantityLabel}`.trim();
}

function getStatusClasses(status: string) {
  switch (status) {
    case "qualified":
    case "site_assessment_complete":
    case "estimating":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "contacted":
    case "site_assessment_scheduled":
    case "proposal_sent":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "won":
    case "converted":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "lost":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

export default async function LeadDetailPage({
  params,
  searchParams
}: LeadDetailPageProps) {
  const { leadId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [opportunity, leadAppointments] = await Promise.all([
    getOpportunityById(leadId, `/leads/${leadId}`),
    listAppointmentsByOpportunity(leadId, `/leads/${leadId}`)
  ]);

  if (!opportunity) {
    notFound();
  }

  const primaryEstimateHref = opportunity.projectId
    ? `/estimates?projectId=${opportunity.projectId}&opportunityId=${opportunity.id}`
    : null;
  const canStartEstimate = opportunity.status !== "lost";
  const estimatingReadiness = opportunity.projectId
    ? "This opportunity is already linked into the live project and estimating chain."
    : opportunity.siteAssessmentStatus === "completed" ||
        (opportunity.requirementsSummary &&
          opportunity.requirementsSummary.trim().length > 0)
      ? "Commercial context is ready to feed estimating. Start the estimate flow when you are ready."
      : opportunity.siteAssessmentStatus === "scheduled"
        ? "A site assessment is scheduled. Complete it and capture requirements before handing off to estimating."
        : "Capture assessment timing and requirements here so the estimating handoff does not rely on re-entry later.";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Lead Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {opportunity.title}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Review the intake record, keep the pre-project commercial context
              current, and use this page to decide when to start estimate on
              the shared customer and project chain. Once a customer is linked,
              estimate send uses the linked customer email rather than this lead
              page alone.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/leads"
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to leads
            </Link>
            {canStartEstimate ? (
              primaryEstimateHref ? (
                <Link
                  href={primaryEstimateHref}
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Start estimate
                </Link>
              ) : (
                <form action={startEstimateFromOpportunityAction}>
                  <input type="hidden" name="opportunityId" value={opportunity.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Start estimate
                  </button>
                </form>
              )
            ) : null}
          </div>
        </div>

        {resolvedSearchParams.error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Primary Contact
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This is the upstream lead contact. When a canonical customer is linked, safe email
              updates can sync forward into that customer record, but downstream estimate send uses
              the linked customer email.
            </p>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="font-medium text-slate-950">Name</dt>
                <dd>
                  {opportunity.primaryContact?.displayName ?? opportunity.prospectName}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Company</dt>
                <dd>
                  {opportunity.primaryContact?.companyName ??
                    opportunity.prospectCompanyName ??
                    "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Email</dt>
                <dd>
                  {opportunity.primaryContact?.email ?? opportunity.email ?? "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Phone</dt>
                <dd>
                  {opportunity.primaryContact?.phone ?? opportunity.phone ?? "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Primary site</dt>
                <dd>
                  {formatAddress([
                    opportunity.siteName,
                    opportunity.addressLine1,
                    opportunity.addressLine2,
                    opportunity.city,
                    opportunity.stateRegion,
                    opportunity.postalCode,
                    opportunity.countryCode
                  ])}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Workflow
            </p>
            <div className="mt-4 space-y-4">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                  opportunity.status
                )}`}
              >
                {formatStatusLabel(opportunity.status)}
              </span>
              <dl className="space-y-3 text-sm leading-6 text-slate-600">
                <div>
                  <dt className="font-medium text-slate-950">Lead source</dt>
                  <dd>
                    {opportunity.source
                      ? [opportunity.source, opportunity.sourceDetail]
                          .filter(Boolean)
                          .join(" / ")
                      : "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Site assessment</dt>
                  <dd>{formatStatusLabel(opportunity.siteAssessmentStatus)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Assessment scheduled</dt>
                  <dd>{formatDate(opportunity.siteAssessmentScheduledAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Assessment completed</dt>
                  <dd>
                    {opportunity.siteAssessmentCompletedAt
                      ? new Date(opportunity.siteAssessmentCompletedAt).toLocaleDateString()
                      : "Not completed yet"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Service type</dt>
                  <dd>{opportunity.serviceType ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Job type</dt>
                  <dd>{opportunity.jobType ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Linked customer</dt>
                  <dd>
                    {opportunity.customer ? (
                      <div className="space-y-1">
                        <Link
                          href={`/customers/${opportunity.customer.id}`}
                          className="font-medium text-brand-700"
                        >
                          {opportunity.customer.name}
                        </Link>
                        <p className="text-xs leading-5 text-slate-500">
                          This linked customer becomes the canonical external recipient record for
                          projects, estimates, invoices, and portal access.
                        </p>
                      </div>
                    ) : (
                      "No customer created yet"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Linked project</dt>
                  <dd>
                    {opportunity.project ? (
                      <Link
                        href={`/projects/${opportunity.project.id}`}
                        className="font-medium text-brand-700"
                      >
                        {opportunity.project.name}
                      </Link>
                    ) : (
                      "No project created yet"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Qualified</dt>
                  <dd>
                    {opportunity.qualifiedAt
                      ? new Date(opportunity.qualifiedAt).toLocaleString()
                      : "Not marked yet"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Converted</dt>
                  <dd>
                    {opportunity.convertedAt
                      ? new Date(opportunity.convertedAt).toLocaleString()
                      : "Not converted yet"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        <div className="mt-8">
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 text-sm leading-6 text-slate-700">
            <p className="font-medium text-slate-950">Estimating readiness</p>
            <p className="mt-2">{estimatingReadiness}</p>
          </div>
          <OpportunityForm
            action={updateOpportunityAction}
            submitLabel="Save lead"
            pendingLabel="Saving lead..."
            opportunity={opportunity}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Measurements
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              {opportunity.measurements.length > 0 ? (
                opportunity.measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <p className="font-medium text-slate-950">
                      {measurement.areaLabel ?? measurement.measurementType}
                    </p>
                    <p className="text-slate-600">
                      {formatMeasurementValue(
                        measurement.valueNumeric,
                        measurement.unit,
                        measurement.quantity
                      )}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {measurement.measurementType.replaceAll("_", " ")}
                      {measurement.captureMethod
                        ? ` • ${measurement.captureMethod.replaceAll("_", " ")}`
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p>No structured measurements captured yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Observations
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              {opportunity.observations.length > 0 ? (
                opportunity.observations.map((observation) => (
                  <div
                    key={observation.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <p className="font-medium text-slate-950">{observation.title}</p>
                    <p>{observation.body ?? "No detail provided."}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {observation.observationType.replaceAll("_", " ")}
                      {observation.severity
                        ? ` • ${observation.severity.replaceAll("_", " ")}`
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p>No structured observations captured yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Photos & Files
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              {opportunity.attachments.length > 0 ? (
                opportunity.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <p className="font-medium text-slate-950">{attachment.fileName}</p>
                    <p>{attachment.caption ?? attachment.storagePath}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {attachment.attachmentType.replaceAll("_", " ")}
                      {attachment.tag ? ` • ${attachment.tag.replaceAll("_", " ")}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p>No linked intake files captured yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>

      <aside className="space-y-6">
        <DirectoryContextCard
          href={`/directory?view=leads&q=${encodeURIComponent(opportunity.title)}`}
          recordLabel="Lead opportunity"
          description="Directory is the read-only scan-and-jump index. This lead page remains the canonical home for pre-customer commercial context and estimate handoff decisions."
        />

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Next Step
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The next workflow handoff from a lead is to start estimate. Starting
            estimate here creates or links the canonical customer and project if
            they do not already exist, so the commercial chain stays connected. If this lead is
            already linked, keep the customer email current there because estimate send uses
            <span className="font-semibold"> customer.email</span>.
          </p>
          {canStartEstimate ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
              Use the primary action in the header to start estimate from this lead.
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
              Lost leads do not move into the estimate workflow unless the status is reopened.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            Requirements summary:
            <div className="mt-2 text-slate-500">
              {opportunity.requirementsSummary ??
                "No assessment-based requirements have been captured yet."}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
            Internal summary notes:
            <div className="mt-2 text-slate-500">
              {opportunity.notes ?? "No internal notes have been added yet."}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                Appointments
              </p>
              <Link
                href={`/appointments?compose=1&opportunityId=${opportunity.id}${opportunity.customerId ? `&customerId=${opportunity.customerId}` : ""}${opportunity.projectId ? `&projectId=${opportunity.projectId}` : ""}#appointment-create`}
                className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
              >
                New appointment
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {leadAppointments.slice(0, 2).length > 0 ? (
                leadAppointments.slice(0, 2).map((appointment) => (
                  <LinkedRecordCard
                    key={appointment.id}
                    href={`/appointments/${appointment.id}`}
                    title={appointment.title}
                    subtitle={appointment.project?.name ?? appointment.customer?.name ?? "Lead-linked appointment"}
                    meta={`${appointment.appointmentType.replaceAll("_", " ")} | ${new Date(appointment.startsAt).toLocaleString()}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {appointment.status.replaceAll("_", " ")}
                      </span>
                    }
                  />
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No appointments"
                  title="Schedule the next lead visit here"
                  description="Use appointments for assessments, estimate meetings, and follow-up visits while keeping the real workflow on the same lead and downstream project chain."
                  actionHref={`/appointments?compose=1&opportunityId=${opportunity.id}${opportunity.customerId ? `&customerId=${opportunity.customerId}` : ""}${opportunity.projectId ? `&projectId=${opportunity.projectId}` : ""}#appointment-create`}
                  actionLabel="Create appointment"
                />
              )}
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
