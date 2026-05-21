import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProgressBillingWorkspaces } from "@/lib/progress-billing/data";

type ProgressBillingPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?:
      | "all"
      | "ready_to_bill"
      | "in_progress"
      | "fully_billed"
      | "not_started";
  }>;
};

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function buildProgressBillingHref(input: { q?: string; status?: string }) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  const query = searchParams.toString();
  return query ? `/progress-billing?${query}` : "/progress-billing";
}

export default async function ProgressBillingPage({
  searchParams
}: ProgressBillingPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/progress-billing");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Progress billing needs an active organization before approved scope can
        be reviewed.
      </section>
    );
  }

  const workspaces = await listProgressBillingWorkspaces();
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const matchesStatus =
      statusFilter === "all" ? true : workspace.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            workspace.project?.name ?? "",
            workspace.customer?.name ?? "",
            workspace.customer?.companyName ?? "",
            workspace.estimate?.referenceNumber ?? "",
            workspace.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const readyToBill = workspaces.filter(
    (workspace) => workspace.status === "ready_to_bill"
  );
  const inProgress = workspaces.filter(
    (workspace) => workspace.status === "in_progress"
  );
  const fullyBilled = workspaces.filter(
    (workspace) => workspace.status === "fully_billed"
  );
  const scheduledValueTotal = workspaces.reduce(
    (sum, workspace) => sum + Number(workspace.scheduledValueTotal),
    0
  );
  const currentBillingTotal = readyToBill.reduce(
    (sum, workspace) => sum + Number(workspace.currentBillableTotal),
    0
  );
  const statuses = [
    { key: "all", label: "All workspaces", count: workspaces.length },
    { key: "ready_to_bill", label: "Ready to bill", count: readyToBill.length },
    { key: "in_progress", label: "In progress", count: inProgress.length },
    { key: "fully_billed", label: "Fully billed", count: fullyBilled.length }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Progress billing"
      title={`Schedule of values for ${organizationContext.organization.displayName}`}
      description="Review approved-scope billing state, see what is already billed, and move current progress into real draft invoices on the same canonical estimate and invoice chain."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Workspaces
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {workspaces.length}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Ready to bill
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {readyToBill.length}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Current billing
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(currentBillingTotal)}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Scheduled value
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(scheduledValueTotal)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Approved estimate scope seeds these workspaces automatically.
            Progress billing stays review-first here, then turns into a
            canonical invoice instead of a separate pay-app subsystem.
          </p>
        ),
        searchSlot: (
          <form
            action="/progress-billing"
            className="flex flex-col gap-2 sm:flex-row"
          >
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, company, or estimate"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c59a6b]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" ? (
              <Link
                href="/progress-billing"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: statuses.map((status) => {
          const isActive = statusFilter === status.key;

          return (
            <Link
              key={status.key}
              href={buildProgressBillingHref({ q: query, status: status.key })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#2b2118] text-white"
                  : "border border-[#e2d4c5] bg-white text-[#6b5442] hover:bg-[#fdf7ef]"
              ].join(" ")}
            >
              <span>{status.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-[#f3eadf] text-[#755f4d]"
                ].join(" ")}
              >
                {status.count}
              </span>
            </Link>
          );
        })
      }}
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Approved scope",
              title:
                "SOV starts from approved estimate or change-order snapshots",
              detail:
                "Progress billing workspaces appear only after approved scope seeds the canonical schedule-of-values chain.",
              href: "/estimates",
              action: "Review estimates"
            },
            {
              label: "Current draw",
              title: "Percent complete drives the current billable amount",
              detail:
                "The workspace keeps prior billed, retainage, current billing, and balance-to-finish visible before an invoice is built.",
              href: buildProgressBillingHref({
                q: query,
                status: "ready_to_bill"
              }),
              action: "Open ready draws"
            },
            {
              label: "Invoice handoff",
              title: "Billing still lands on canonical invoices",
              detail:
                "Draft progress invoices stay tied to the same customer, project, estimate, SOV, invoice, and payment chain.",
              href: "/invoices",
              action: "Open invoices"
            }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group border border-[#e4d7c9] bg-[#fdfaf6] px-5 py-4 transition hover:border-[#c59a6b] hover:bg-[#fffaf2]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6a4f]">
                {item.label}
              </p>
              <h2 className="mt-2 text-base font-semibold text-[#2b2118]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#665446]">
                {item.detail}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#a4581a] transition group-hover:text-[#7c3f12]">
                {item.action}
              </p>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
          <ManagerDashboardCard
            eyebrow="Ready now"
            title="Scope ready to bill"
            description="These approved-scope workspaces already have billable progress beyond prior billed amounts."
            actionHref={buildProgressBillingHref({
              q: query,
              status: "ready_to_bill"
            })}
            actionLabel="Open ready"
            items={readyToBill.slice(0, 3).map((workspace) => ({
              href: `/progress-billing/${workspace.id}`,
              title: workspace.project?.name ?? "Schedule of values",
              subtitle: `${workspace.customer?.name ?? "Unknown customer"} · ${workspace.estimate?.referenceNumber ?? "Approved estimate"}`,
              meta: `${workspace.weightedPercentComplete}% complete`,
              badge: "Ready",
              trailing: formatMoney(workspace.currentBillableTotal)
            }))}
            emptyTitle="No progress billing is ready right now."
            emptyDescription="When percent-complete state exceeds previously billed work, the related schedule-of-values workspace will surface here."
          />

          <ManagerDashboardCard
            eyebrow="Continuity"
            title="Active progress billing work"
            description="These workspaces already have progress billed, but still carry remaining balance to finish."
            actionHref={buildProgressBillingHref({
              q: query,
              status: "in_progress"
            })}
            actionLabel="Open active"
            items={inProgress.slice(0, 3).map((workspace) => ({
              href: `/progress-billing/${workspace.id}`,
              title: workspace.project?.name ?? "Schedule of values",
              subtitle: `${workspace.customer?.name ?? "Unknown customer"} · ${workspace.estimate?.referenceNumber ?? "Approved estimate"}`,
              meta: `${workspace.weightedPercentComplete}% complete`,
              badge: "In progress",
              trailing: formatMoney(workspace.balanceToFinishTotal)
            }))}
            emptyTitle="No partially billed SOV workspaces yet."
            emptyDescription="As progress invoices land, work that is billed but not yet complete will surface here."
          />
        </section>

        <section className="border border-[#e3d6c7] bg-white">
          <div className="border-b border-[#efe3d6] px-5 py-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div className="hidden grid-cols-[minmax(0,1.2fr)_1fr_140px_140px_140px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b6959] md:grid md:flex-1">
                <span>Schedule of values</span>
                <span>Estimate / customer</span>
                <span className="text-right">Scheduled</span>
                <span className="text-right">Billed</span>
                <span className="text-right">Current</span>
                <span className="text-right">Balance</span>
              </div>
              <div className="md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6959]">
                  Progress billing list
                </p>
              </div>
              <p className="text-sm leading-6 text-[#665446]">
                {filteredWorkspaces.length} visible
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#efe4d7]">
            {filteredWorkspaces.length > 0 ? (
              filteredWorkspaces.map((workspace) => (
                <Link
                  key={workspace.id}
                  href={`/progress-billing/${workspace.id}`}
                  className="group block px-5 py-4 transition hover:bg-[#fdf7ef] sm:px-6"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_1fr_140px_140px_140px_140px] md:items-start">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[#2b2118] transition group-hover:text-[#a4581a]">
                        {workspace.project?.name ?? "Schedule of values"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#665446]">
                        {formatStatusLabel(workspace.status)} ·{" "}
                        {workspace.weightedPercentComplete}% complete
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6959] md:hidden">
                        Continuity
                      </p>
                      <p className="text-sm font-medium text-[#2b2118]">
                        {workspace.estimate?.referenceNumber ??
                          "Approved estimate"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#665446]">
                        {workspace.customer?.name ?? "Unknown customer"}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6959] md:hidden">
                        Scheduled
                      </p>
                      <p className="text-sm font-semibold text-[#2b2118]">
                        {formatMoney(workspace.scheduledValueTotal)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6959] md:hidden">
                        Previously billed
                      </p>
                      <p className="text-sm font-semibold text-[#2b2118]">
                        {formatMoney(workspace.previouslyBilledTotal)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6959] md:hidden">
                        Current billing
                      </p>
                      <p className="text-sm font-semibold text-[#2b2118]">
                        {formatMoney(workspace.currentBillableTotal)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b6959] md:hidden">
                        Balance
                      </p>
                      <p className="text-sm font-semibold text-[#2b2118]">
                        {formatMoney(workspace.balanceToFinishTotal)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow={
                    workspaces.length > 0
                      ? "No matching workspaces"
                      : "No approved SOV work yet"
                  }
                  title={
                    workspaces.length > 0
                      ? "Adjust the progress billing filters"
                      : "Approved estimate scope will seed here"
                  }
                  description={
                    workspaces.length > 0
                      ? "Try a broader search or switch status views to find the billing workspace you need."
                      : "When approved estimate items exist, the shared schedule-of-values workspace will appear here for contractor-side progress billing review."
                  }
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
