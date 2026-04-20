import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { EstimateQuickCreateForm } from "@/components/estimate-quick-create-form";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateEstimateAction } from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type EstimatesPageProps = {
  searchParams?: Promise<{
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "approved" | "rejected";
    projectId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function buildEstimatesHref(input: {
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
  return query.length > 0 ? `/estimates?${query}` : "/estimates";
}

export default async function EstimatesPage({
  searchParams
}: EstimatesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/estimates");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Estimate records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [estimates, projects] = await Promise.all([listEstimates(), listProjects()]);
  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId);
  const draftCount = estimates.filter((estimate) => estimate.status === "draft").length;
  const sentCount = estimates.filter((estimate) => estimate.status === "sent").length;
  const approvedCount = estimates.filter((estimate) => estimate.status === "approved").length;
  const totalPipelineValue = estimates
    .reduce((sum, estimate) => sum + Number(estimate.totalAmount), 0)
    .toFixed(2);
  const filteredEstimates = estimates.filter((estimate) => {
    const matchesStatus =
      statusFilter === "all" ? true : estimate.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            estimate.referenceNumber,
            estimate.customer?.name ?? "",
            estimate.project?.name ?? "",
            estimate.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const estimateViews = [
    { key: "all", label: "All estimates", count: estimates.length },
    { key: "draft", label: "Draft", count: draftCount },
    { key: "sent", label: "Sent", count: sentCount },
    { key: "approved", label: "Approved", count: approvedCount },
    {
      key: "rejected",
      label: "Rejected",
      count: estimates.filter((estimate) => estimate.status === "rejected").length
    }
  ] as const;
  const draftQueue = estimates
    .filter((estimate) => estimate.status === "draft")
    .slice(0, 3);
  const followUpQueue = estimates
    .filter((estimate) => estimate.status === "sent")
    .slice(0, 3);
  const approvedQueue = estimates
    .filter((estimate) => estimate.status === "approved")
    .slice(0, 3);
  const revisionQueue = estimates
    .filter((estimate) => estimate.status === "rejected")
    .slice(0, 3);

  return (
    <ContractorWorkspacePage
      eyebrow="Estimates"
      title={`Estimate manager for ${organizationContext.organization.displayName}`}
      description="Track draft scope, customer follow-up, and contract-ready approvals from one commercial workspace instead of dropping straight into a long estimates list."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Draft</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{draftCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Sent</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{sentCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Approved</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{approvedCount}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Pipeline value</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {formatMoney(totalPipelineValue)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review the commercial queue first, then use quick create to open a real estimate record before finishing the full scope inside the estimate workspace.
          </p>
        ),
        searchSlot: (
          <form action="/estimates" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search estimate, project, customer, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/estimates"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: estimateViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildEstimatesHref({ q: query, status: view.key, compose: showComposer ? "1" : undefined })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildEstimatesHref({ q: query, status: statusFilter, compose: "1" }) + "#estimate-create"}
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New estimate
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_420px]" : "space-y-4"}>
        <section className="space-y-6">
          <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
            <ManagerDashboardCard
              eyebrow="Action now"
              title="Drafts needing scope review"
              description="The estimate work still in progress before anything should be sent to the customer."
              actionHref={buildEstimatesHref({ q: query, status: "draft", compose: showComposer ? "1" : undefined })}
              actionLabel="View drafts"
              items={draftQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} · ${estimate.project?.name ?? "Unknown project"}`,
                meta: `Updated ${formatDate(estimate.updatedAt)}`,
                badge: "Draft",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No draft estimates need attention."
              emptyDescription="New drafts will show up here when the commercial team is actively shaping scope."
            />

            <ManagerDashboardCard
              eyebrow="Follow-up"
              title="Sent estimates waiting on customer response"
              description="Use this queue to chase customer decisions before the commercial chain stalls."
              actionHref={buildEstimatesHref({ q: query, status: "sent", compose: showComposer ? "1" : undefined })}
              actionLabel="View sent"
              items={followUpQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} · ${estimate.project?.name ?? "Unknown project"}`,
                meta: `Sent estimate · updated ${formatDate(estimate.updatedAt)}`,
                badge: "Sent",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No sent estimates are waiting on follow-up."
              emptyDescription="When a customer-facing estimate needs a response, it will surface here."
            />

            <ManagerDashboardCard
              eyebrow="Ready next"
              title="Approved estimates ready for contract work"
              description="These approved estimates are the cleanest candidates to move into contract generation and the next readiness step."
              actionHref={buildEstimatesHref({ q: query, status: "approved", compose: showComposer ? "1" : undefined })}
              actionLabel="View approved"
              items={approvedQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} · ${estimate.project?.name ?? "Unknown project"}`,
                meta: `Approved estimate · updated ${formatDate(estimate.updatedAt)}`,
                badge: "Approved",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No approved estimates are waiting right now."
              emptyDescription="Approved estimates that are ready to move deeper into the workflow will appear here."
            />

            <ManagerDashboardCard
              eyebrow="Revision"
              title="Rejected estimates needing rework"
              description="Keep the revise-and-resend queue visible without letting it drown the broader estimate manager."
              actionHref={buildEstimatesHref({ q: query, status: "rejected", compose: showComposer ? "1" : undefined })}
              actionLabel="View rejected"
              items={revisionQueue.map((estimate) => ({
                href: `/estimates/${estimate.id}`,
                title: estimate.referenceNumber,
                subtitle: `${estimate.customer?.name ?? "Unknown customer"} · ${estimate.project?.name ?? "Unknown project"}`,
                meta: `Needs revision · updated ${formatDate(estimate.updatedAt)}`,
                badge: "Rejected",
                trailing: formatMoney(estimate.totalAmount)
              }))}
              emptyTitle="No rejected estimates need revision."
              emptyDescription="Rejected estimates will surface here when the team needs to rework pricing or scope."
            />
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

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
                    Estimate records
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    The full commercial record list stays available below the action queues so deeper review never leaves the module manager.
                  </p>
                </div>
                <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Estimate</span>
                  <span>Project</span>
                  <span>Status</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Estimates list
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {filteredEstimates.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredEstimates.length > 0 ? (
                filteredEstimates.map((estimate) => (
                  <Link
                    key={estimate.id}
                    href={`/estimates/${estimate.id}`}
                    className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                  >
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] md:items-center">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                          {estimate.referenceNumber}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {estimate.customer?.name ?? "Unknown customer"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Project
                        </p>
                        <p className="text-sm font-medium text-slate-700">
                          {estimate.project?.name ?? "Unknown project"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Status
                        </p>
                        <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatStatusLabel(estimate.status)}
                        </span>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                          Total
                        </p>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatMoney(estimate.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                  eyebrow={estimates.length > 0 ? "No matching estimates" : "No estimates yet"}
                  title={estimates.length > 0 ? "Adjust the estimate filters" : "Create the first estimate"}
                  description={
                    estimates.length > 0
                      ? "Try a broader search or switch estimate views to find the commercial record you need."
                      : "Estimates define the proposed scope and commercial value that later flows into contracts, jobs, and invoicing."
                  }
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="estimate-create"
          title="Quick create estimate"
          description="Capture only the minimum project context here, create the canonical estimate, and then finish the full scope in the estimate workspace."
          open={showComposer}
          openHref={buildEstimatesHref({ q: query, status: statusFilter, compose: "1" }) + "#estimate-create"}
          closeHref={buildEstimatesHref({ q: query, status: statusFilter })}
          openLabel="Open estimate quick create"
        >
          {projectOptions.length > 0 ? (
            <EstimateQuickCreateForm
              action={quickCreateEstimateAction}
              projects={projectOptions}
              initialProjectId={resolvedSearchParams.projectId}
            />
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Add at least one project before creating an estimate.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
