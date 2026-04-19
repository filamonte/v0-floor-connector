import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { OpportunityForm } from "@/components/opportunity-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createOpportunityAction } from "@/lib/opportunities/actions";
import { listOpportunities } from "@/lib/opportunities/data";

type LeadsPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    status?: "all" | "open" | "qualified" | "proposal" | "won" | "lost";
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

function buildLeadsHref(input: {
  q?: string;
  status?: string;
  compose?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/leads?${query}` : "/leads";
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
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer = resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const newCount = opportunities.filter((opportunity) => opportunity.status === "new").length;
  const qualifiedCount = opportunities.filter((opportunity) =>
    ["qualified", "site_assessment_complete", "estimating"].includes(opportunity.status)
  ).length;
  const proposalCount = opportunities.filter((opportunity) => opportunity.status === "proposal_sent").length;
  const wonCount = opportunities.filter((opportunity) =>
    ["won", "converted"].includes(opportunity.status)
  ).length;
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "open"
          ? !["won", "lost", "converted"].includes(opportunity.status)
          : statusFilter === "qualified"
            ? ["qualified", "site_assessment_complete", "estimating"].includes(opportunity.status)
            : statusFilter === "proposal"
              ? opportunity.status === "proposal_sent"
              : statusFilter === "won"
                ? ["won", "converted"].includes(opportunity.status)
                : opportunity.status === "lost";
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            opportunity.title,
            opportunity.prospectName,
            opportunity.prospectCompanyName ?? "",
            opportunity.serviceType ?? "",
            opportunity.source ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const leadViews = [
    { key: "all", label: "All opportunities", count: opportunities.length },
    { key: "open", label: "Open", count: opportunities.filter((opportunity) => !["won", "lost", "converted"].includes(opportunity.status)).length },
    { key: "qualified", label: "Qualified", count: qualifiedCount },
    { key: "proposal", label: "Proposal sent", count: proposalCount },
    { key: "won", label: "Won / converted", count: wonCount },
    { key: "lost", label: "Lost", count: opportunities.filter((opportunity) => opportunity.status === "lost").length }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Leads"
      title={`Opportunity intake for ${organizationContext.organization.displayName}`}
      description="Leads are the live protected manager for canonical opportunities. They capture pre-project commercial context before the work moves into the customer, project, and estimate chain."
      summary={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">New</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{newCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Qualified</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{qualifiedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Won / converted</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{wonCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Work this surface like an opportunity manager: search commercial intake, switch between stage views, and only open the full lead composer when you need to capture a new opportunity.
          </p>
        ),
        searchSlot: (
          <form action="/leads" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, prospect, company, source, or service"
              className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/leads"
                className="inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: leadViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildLeadsHref({ q: query, status: view.key, compose: showComposer ? "1" : undefined })}
              className={[
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-white text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildLeadsHref({ q: query, status: statusFilter, compose: "1" }) + "#lead-create"}
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            New lead
          </Link>
        )
      }}
    >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                Commercial intake rhythm
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Stage visibility before work becomes a project
              </h3>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-slate-500">
              Ordered by commercial status first, then most recently updated, so the list reads like a live intake manager instead of a static CRM table.
            </p>
          </div>
        </section>

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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">
                Opportunity queue
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Live leads and opportunities
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {filteredOpportunities.length} visible
            </p>
          </div>

          <div className="mt-6 grid gap-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map((opportunity) => (
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
            <AppEmptyState
              eyebrow={opportunities.length > 0 ? "No matching opportunities" : "No leads yet"}
              title={opportunities.length > 0 ? "Adjust the intake filters" : "Create the first lead"}
              description={
                opportunities.length > 0
                  ? "Try a broader search or switch stage views to find the commercial record you need."
                  : "Leads are the earliest live intake point in the contractor workflow and can move forward into canonical customer, project, and estimate records."
              }
            />
          )}
          </div>
        </section>
      </section>

      <aside id="lead-create" className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          Create opportunity
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Capture new commercial work here, then let qualification, assessment, and estimate conversion continue from the canonical lead record.
        </p>
        {showComposer ? (
          <div className="mt-6">
            <OpportunityForm
              action={createOpportunityAction}
              submitLabel="Create lead"
              pendingLabel="Creating lead..."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/75 px-5 py-4 text-sm leading-6 text-slate-600">
              Keep the manager surface focused on review until you are ready to capture a new opportunity.
            </div>
            <Link
              href={buildLeadsHref({ q: query, status: statusFilter, compose: "1" }) + "#lead-create"}
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open lead composer
            </Link>
          </div>
        )}
      </aside>
    </div>
    </ContractorWorkspacePage>
  );
}
