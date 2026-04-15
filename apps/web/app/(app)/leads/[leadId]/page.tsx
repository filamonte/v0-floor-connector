import Link from "next/link";
import { notFound } from "next/navigation";

import { OpportunityForm } from "@/components/opportunity-form";
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
  const opportunity = await getOpportunityById(leadId, `/leads/${leadId}`);

  if (!opportunity) {
    notFound();
  }

  const primaryEstimateHref = opportunity.projectId
    ? `/estimates?projectId=${opportunity.projectId}`
    : null;
  const canStartEstimate = opportunity.status !== "lost";

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
              current, and move the opportunity into the live estimate workflow
              when it is ready.
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
              Prospect
            </p>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="font-medium text-slate-950">Name</dt>
                <dd>{opportunity.prospectName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Company</dt>
                <dd>{opportunity.prospectCompanyName ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Email</dt>
                <dd>{opportunity.email ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Phone</dt>
                <dd>{opportunity.phone ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Address</dt>
                <dd>
                  {formatAddress([
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
                  <dd>{opportunity.source ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Service type</dt>
                  <dd>{opportunity.serviceType ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-950">Linked customer</dt>
                  <dd>
                    {opportunity.customer ? (
                      <Link
                        href={`/customers/${opportunity.customer.id}`}
                        className="font-medium text-brand-700"
                      >
                        {opportunity.customer.name}
                      </Link>
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
          <OpportunityForm
            action={updateOpportunityAction}
            submitLabel="Save lead"
            pendingLabel="Saving lead..."
            opportunity={opportunity}
          />
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Next Step
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          The primary operational handoff from a lead is into the estimate flow.
          Starting that flow will create or link the canonical customer and
          project if they do not already exist.
        </p>
        {canStartEstimate ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
            Use the primary action in the header to move this lead into the live estimate flow.
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
            Lost leads do not move into the estimate workflow unless the status is reopened.
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
          Notes:
          <div className="mt-2 text-slate-500">
            {opportunity.notes ?? "No internal notes have been added yet."}
          </div>
        </div>
      </aside>
    </div>
  );
}
