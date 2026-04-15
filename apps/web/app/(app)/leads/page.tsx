import Link from "next/link";

import { OpportunityForm } from "@/components/opportunity-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createOpportunityAction } from "@/lib/opportunities/actions";
import { listOpportunities } from "@/lib/opportunities/data";

type LeadsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
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

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/leads");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Lead records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const opportunities = await listOpportunities();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Leads
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Opportunity intake for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Leads are the first real protected intake workflow. They capture pre-project
          commercial context before the work moves into the canonical customer,
          project, and estimate chain.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Ordered by commercial status first, then most recently updated.
        </p>

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

        <div className="mt-8 grid gap-4">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/leads/${opportunity.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {opportunity.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {opportunity.prospectName}
                      {opportunity.prospectCompanyName
                        ? ` - ${opportunity.prospectCompanyName}`
                        : ""}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                        opportunity.status
                      )}`}
                    >
                      {formatStatusLabel(opportunity.status)}
                    </span>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {new Date(opportunity.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-slate-500">
                  <span>{opportunity.serviceType ?? "Service type not set"}</span>
                  <span>{opportunity.source ?? "Source not set"}</span>
                  <span>
                    {opportunity.project
                      ? `Project: ${opportunity.project.name}`
                      : "No project created yet"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No leads have been added yet. Create the first one using the form
              in the right column to start the contractor revenue path.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Lead
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Capture incoming work before it becomes a project. Qualification and
          estimate conversion happen from the canonical lead detail flow.
        </p>
        <div className="mt-6">
          <OpportunityForm
            action={createOpportunityAction}
            submitLabel="Create lead"
            pendingLabel="Creating lead..."
          />
        </div>
      </aside>
    </div>
  );
}
