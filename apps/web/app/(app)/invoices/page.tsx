import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { InvoiceQuickCreateForm } from "@/components/invoice-quick-create-form";
import { InvoiceRecordsPanel } from "@/components/invoices/invoice-records-panel";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { PerspectiveSwitcher } from "@/components/perspectives/perspective-switcher";
import { RowsPerViewControl } from "@/components/rows-per-view-control";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import {
  getInitialInvoiceContext,
  getInvoiceQuickCreateOptions,
  getInvoicesManagerReadModel,
  isInvoicesManagerView,
  type InvoicesManagerView
} from "@/lib/invoices/manager-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { buildPerspectiveSearchParams } from "@/lib/perspectives/query";
import {
  parsePerspectiveView,
  type PerspectiveView
} from "@/lib/perspectives/types";
import {
  parseInvoiceListSort,
  sortInvoiceRecords
} from "@/lib/records/list-sort";

type InvoicesPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    estimateId?: string;
    jobId?: string;
    changeOrderId?: string;
    workflowRole?: string;
    compose?: string;
    q?: string;
    sort?: string;
    status?: "all" | "draft" | "sent" | "open" | "paid" | "void";
    view?: PerspectiveView;
    error?: string;
    message?: string;
  }>;
};

const INVOICES_ROWS_PER_VIEW_STORAGE_KEY = "fc.grid.rows.invoices";

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatRate(value: string) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getInvoiceQueueCue(invoice: {
  status: string;
  dueDate: string | null;
  balanceDueAmount: string;
}) {
  if (invoice.status === "draft") {
    return "Next: finish billing detail";
  }

  if (invoice.status === "sent" || invoice.status === "partially_paid") {
    const dueLabel = invoice.dueDate
      ? `due ${formatDate(invoice.dueDate)}`
      : "due date TBD";
    return `Collect ${formatMoney(invoice.balanceDueAmount)} - ${dueLabel}`;
  }

  if (invoice.status === "paid") {
    return "Settled";
  }

  if (invoice.status === "void") {
    return "Voided";
  }

  return "Review invoice";
}

function buildInvoicesHref(input: {
  q?: string;
  status?: string;
  compose?: string;
  projectId?: string;
  estimateId?: string;
  jobId?: string;
  changeOrderId?: string;
  workflowRole?: string;
  view?: PerspectiveView;
  sort?: string;
}) {
  const searchParams = buildPerspectiveSearchParams(
    {
      q: input.q,
      status: input.status && input.status !== "all" ? input.status : undefined,
      compose: input.compose === "1" ? "1" : undefined,
      projectId: input.projectId,
      estimateId: input.estimateId,
      jobId: input.jobId,
      changeOrderId: input.changeOrderId,
      workflowRole:
        input.workflowRole && input.workflowRole !== "standard"
          ? input.workflowRole
          : undefined,
      sort: input.sort && input.sort !== "workflow" ? input.sort : undefined
    },
    input.view ?? "company"
  );

  const query = searchParams.toString();
  return query.length > 0 ? `/invoices?${query}` : "/invoices";
}

export default async function InvoicesPage({
  searchParams
}: InvoicesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/invoices");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Invoice records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const statusFilter: InvoicesManagerView = isInvoicesManagerView(
    resolvedSearchParams.status
  )
    ? resolvedSearchParams.status
    : "all";
  const sort = parseInvoiceListSort(resolvedSearchParams.sort);
  const perspective = parsePerspectiveView(resolvedSearchParams.view);
  const initialState = await getInitialInvoiceContext({
    organizationId: organizationContext.organization.id,
    projectId: resolvedSearchParams.projectId,
    estimateId: resolvedSearchParams.estimateId,
    jobId: resolvedSearchParams.jobId,
    changeOrderId: resolvedSearchParams.changeOrderId,
    workflowRole: resolvedSearchParams.workflowRole
  });
  const projectFilterId =
    resolvedSearchParams.projectId?.trim() ?? initialState.projectId ?? "";
  const estimateFilterId =
    resolvedSearchParams.estimateId?.trim() ?? initialState.estimateId ?? "";
  const jobFilterId =
    resolvedSearchParams.jobId?.trim() ?? initialState.jobId ?? "";
  const changeOrderFilterId =
    resolvedSearchParams.changeOrderId?.trim() ??
    initialState.changeOrderId ??
    "";
  const workflowRoleFilter =
    resolvedSearchParams.workflowRole === "deposit" ? "deposit" : undefined;
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId) ||
    Boolean(resolvedSearchParams.estimateId) ||
    Boolean(resolvedSearchParams.jobId) ||
    Boolean(resolvedSearchParams.changeOrderId);
  const [readModel, financialSettings, quickCreateOptions] = await Promise.all([
    getInvoicesManagerReadModel({
      organizationId: organizationContext.organization.id,
      userId: user.id,
      perspective,
      query,
      status: statusFilter,
      projectId: projectFilterId || undefined,
      estimateId: estimateFilterId || undefined,
      jobId: jobFilterId || undefined,
      workflowRole: workflowRoleFilter,
      todayIso
    }),
    getOrganizationFinancialSettings(organizationContext.organization.id),
    showComposer
      ? getInvoiceQuickCreateOptions(organizationContext.organization.id)
      : Promise.resolve(null)
  ]);
  const filteredInvoices = sortInvoiceRecords(readModel.invoices, sort);
  const invoiceViews = [
    { key: "all", label: "All invoices", count: readModel.counts.all },
    { key: "draft", label: "Draft", count: readModel.counts.draft },
    { key: "sent", label: "Sent", count: readModel.counts.sent },
    {
      key: "open",
      label: "Open balance",
      count: readModel.counts.open
    },
    { key: "paid", label: "Paid", count: readModel.counts.paid },
    { key: "void", label: "Void", count: readModel.counts.void }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Invoices"
      title={`Invoice manager for ${organizationContext.organization.displayName}`}
      description="Create the invoice, finish billing details, review it, send it, and then manage collections. This manager keeps the billing workflow clearer instead of jumping straight into payment detail."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Draft
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {readModel.counts.draft}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Sent
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {readModel.counts.sent}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Overdue
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {readModel.counts.overdue}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border-warm)] bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Open balance
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {readModel.counts.open}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use the billing queues to spot what needs review or collection work
            first, then quick create the real invoice record before finishing
            billing details in the invoice workspace.
          </p>
        ),
        searchSlot: (
          <form action="/invoices" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {sort !== "workflow" ? (
              <input type="hidden" name="sort" value={sort} />
            ) : null}
            {perspective !== "company" ? (
              <input type="hidden" name="view" value={perspective} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            {projectFilterId ? (
              <input type="hidden" name="projectId" value={projectFilterId} />
            ) : null}
            {estimateFilterId ? (
              <input type="hidden" name="estimateId" value={estimateFilterId} />
            ) : null}
            {jobFilterId ? (
              <input type="hidden" name="jobId" value={jobFilterId} />
            ) : null}
            {changeOrderFilterId ? (
              <input
                type="hidden"
                name="changeOrderId"
                value={changeOrderFilterId}
              />
            ) : null}
            {workflowRoleFilter ? (
              <input
                type="hidden"
                name="workflowRole"
                value={workflowRoleFilter}
              />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search invoice, project, customer, or role"
              className="min-w-0 flex-1 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
            >
              Search
            </button>
            {query.length > 0 ||
            statusFilter !== "all" ||
            showComposer ||
            perspective !== "company" ? (
              <Link
                href="/invoices"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: (
          <>
            <PerspectiveSwitcher
              value={perspective}
              hrefForView={(view) =>
                buildInvoicesHref({
                  q: query,
                  status: statusFilter,
                  compose: showComposer ? "1" : undefined,
                  projectId: projectFilterId || undefined,
                  estimateId: estimateFilterId || undefined,
                  jobId: jobFilterId || undefined,
                  changeOrderId: changeOrderFilterId || undefined,
                  workflowRole: workflowRoleFilter,
                  view,
                  sort
                })
              }
            />
            {invoiceViews.map((view) => {
              const isActive = statusFilter === view.key;

              return (
                <Link
                  key={view.key}
                  href={buildInvoicesHref({
                    q: query,
                    status: view.key,
                    compose: showComposer ? "1" : undefined,
                    projectId: projectFilterId || undefined,
                    estimateId: estimateFilterId || undefined,
                    jobId: jobFilterId || undefined,
                    changeOrderId: changeOrderFilterId || undefined,
                    workflowRole: workflowRoleFilter,
                    view: perspective,
                    sort
                  })}
                  className={[
                    "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : "border border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:bg-[var(--highlight)]"
                  ].join(" ")}
                >
                  <span>{view.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                    ].join(" ")}
                  >
                    {view.count}
                  </span>
                </Link>
              );
            })}
          </>
        ),
        actionSlot: (
          <>
            <form action="/invoices" className="flex items-center gap-2">
              {query ? <input type="hidden" name="q" value={query} /> : null}
              {statusFilter !== "all" ? (
                <input type="hidden" name="status" value={statusFilter} />
              ) : null}
              {perspective !== "company" ? (
                <input type="hidden" name="view" value={perspective} />
              ) : null}
              {showComposer ? (
                <input type="hidden" name="compose" value="1" />
              ) : null}
              {projectFilterId ? (
                <input type="hidden" name="projectId" value={projectFilterId} />
              ) : null}
              {estimateFilterId ? (
                <input
                  type="hidden"
                  name="estimateId"
                  value={estimateFilterId}
                />
              ) : null}
              {jobFilterId ? (
                <input type="hidden" name="jobId" value={jobFilterId} />
              ) : null}
              {changeOrderFilterId ? (
                <input
                  type="hidden"
                  name="changeOrderId"
                  value={changeOrderFilterId}
                />
              ) : null}
              {workflowRoleFilter ? (
                <input
                  type="hidden"
                  name="workflowRole"
                  value={workflowRoleFilter}
                />
              ) : null}
              <label className="sr-only" htmlFor="invoice-sort">
                Sort invoices
              </label>
              <select
                id="invoice-sort"
                name="sort"
                defaultValue={sort}
                className="rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
              >
                <option value="workflow">Workflow priority</option>
                <option value="recent">Recently updated</option>
                <option value="oldest">Oldest updated</option>
                <option value="due_soon">Due soon</option>
                <option value="balance_desc">Highest balance</option>
                <option value="balance_asc">Lowest balance</option>
                <option value="customer_asc">Customer A-Z</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
              >
                Apply
              </button>
            </form>
            <RowsPerViewControl
              storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY}
            />
            <Link
              href={
                buildInvoicesHref({
                  q: query,
                  status: statusFilter,
                  compose: "1",
                  projectId: projectFilterId || undefined,
                  estimateId: estimateFilterId || undefined,
                  jobId: jobFilterId || undefined,
                  changeOrderId: changeOrderFilterId || undefined,
                  workflowRole: workflowRoleFilter,
                  view: perspective,
                  sort
                }) + "#invoice-create"
              }
              className="inline-flex items-center rounded-[3px] border border-[var(--copper)] bg-[var(--copper)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]"
            >
              New invoice
            </Link>
          </>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]"
            : "space-y-3"
        }
      >
        <section className="flex flex-col gap-3">
          <div className="order-1">
            <InvoiceRecordsPanel
              invoices={filteredInvoices}
              totalInvoiceCount={readModel.counts.all}
              storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY}
              createHref={
                buildInvoicesHref({
                  q: query,
                  status: statusFilter,
                  compose: "1",
                  projectId: projectFilterId || undefined,
                  estimateId: estimateFilterId || undefined,
                  jobId: jobFilterId || undefined,
                  changeOrderId: changeOrderFilterId || undefined,
                  workflowRole: workflowRoleFilter,
                  view: perspective,
                  sort
                }) + "#invoice-create"
              }
            />
          </div>

          <section className="order-3 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)_minmax(0,0.92fr)]">
            <ManagerDashboardCard
              eyebrow="Collections"
              title="Sent invoices awaiting payment"
              description="Open customer billing that has already been sent and now needs collections attention."
              actionHref={buildInvoicesHref({
                q: query,
                status: "open",
                compose: showComposer ? "1" : undefined,
                projectId: projectFilterId || undefined,
                estimateId: estimateFilterId || undefined,
                jobId: jobFilterId || undefined,
                changeOrderId: changeOrderFilterId || undefined,
                workflowRole: workflowRoleFilter
              })}
              actionLabel="View open"
              items={readModel.awaitingPaymentQueue.map((invoice) => ({
                href: `/invoices/${invoice.id}/edit`,
                title: invoice.referenceNumber,
                subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
                meta: getInvoiceQueueCue(invoice),
                badge: invoice.status,
                trailing: formatMoney(invoice.balanceDueAmount)
              }))}
              emptyTitle="No invoices are waiting on payment right now."
              emptyDescription="Open customer balances will surface here when billing needs attention."
            />

            <ManagerDashboardCard
              eyebrow="Urgent"
              title="Overdue invoices needing follow-up"
              description="Past-due billing that should stay visible without burying the broader invoice workflow."
              actionHref={buildInvoicesHref({
                q: query,
                status: "open",
                compose: showComposer ? "1" : undefined,
                projectId: projectFilterId || undefined,
                estimateId: estimateFilterId || undefined,
                jobId: jobFilterId || undefined,
                changeOrderId: changeOrderFilterId || undefined,
                workflowRole: workflowRoleFilter
              })}
              actionLabel="Review overdue"
              items={readModel.overdueQueue.map((invoice) => ({
                href: `/invoices/${invoice.id}/edit`,
                title: invoice.referenceNumber,
                subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
                meta: `Due ${invoice.dueDate ? formatDate(invoice.dueDate) : "TBD"}`,
                badge: "overdue",
                trailing: formatMoney(invoice.balanceDueAmount)
              }))}
              emptyTitle="No overdue invoices need attention."
              emptyDescription="When an invoice slips past due, it will show up here for collections follow-up."
            />

            <ManagerDashboardCard
              eyebrow="Build"
              title="Draft invoices to finish"
              description="Build or review draft invoice detail here before sending it to the customer."
              actionHref={buildInvoicesHref({
                q: query,
                status: "draft",
                compose: showComposer ? "1" : undefined,
                projectId: projectFilterId || undefined,
                estimateId: estimateFilterId || undefined,
                jobId: jobFilterId || undefined,
                changeOrderId: changeOrderFilterId || undefined,
                workflowRole: workflowRoleFilter
              })}
              actionLabel="View drafts"
              items={readModel.draftQueue.map((invoice) => ({
                href: `/invoices/${invoice.id}/edit`,
                title: invoice.referenceNumber,
                subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
                meta: getInvoiceQueueCue(invoice),
                badge: invoice.status,
                trailing: formatMoney(invoice.totalAmount)
              }))}
              emptyTitle="No draft invoices need review."
              emptyDescription="Draft invoices waiting to be finished or sent will appear here."
            />

            <section className="flex h-full flex-col border border-[#e2e5e9] bg-white">
              <div className="border-b border-[#e2e5e9] bg-[#f8fafc] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Billing context
                </p>
                <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-slate-950">
                  Billing posture
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Compact finance context for the invoice register.
                </p>
              </div>

              <div className="flex flex-1 flex-col space-y-3 px-4 py-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-[#e2e5e9] bg-white px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                      Tax default
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {financialSettings.defaultTaxBehavior.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#e2e5e9] bg-white px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                      Tax rate
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatRate(financialSettings.defaultTaxRate)}
                    </p>
                  </div>
                  <div className="rounded-md border border-[#e2e5e9] bg-white px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                      Partially paid
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {readModel.counts.partially_paid} invoices
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Recently settled invoices
                    </p>
                    <Link
                      href={buildInvoicesHref({
                        q: query,
                        status: "paid",
                        compose: showComposer ? "1" : undefined,
                        projectId: projectFilterId || undefined,
                        estimateId: estimateFilterId || undefined,
                        jobId: jobFilterId || undefined,
                        changeOrderId: changeOrderFilterId || undefined,
                        workflowRole: workflowRoleFilter
                      })}
                      className="inline-flex items-center rounded-[3px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      View paid
                    </Link>
                  </div>

                  <div className="divide-y divide-[#e5e7eb] border border-[#e2e5e9] bg-white">
                    {readModel.recentlyPaidQueue.length > 0 ? (
                      readModel.recentlyPaidQueue.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/invoices/${invoice.id}/edit`}
                          className="group flex items-start justify-between gap-4 px-4 py-3 transition hover:bg-[#f8fafc]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                              {invoice.referenceNumber}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {invoice.customer?.name ?? "Unknown customer"} -{" "}
                              {invoice.project?.name ?? "Unknown project"}
                            </p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                              Paid - updated {formatDate(invoice.updatedAt)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-slate-900">
                            {formatMoney(invoice.totalAmount)}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          No recently paid invoices yet.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Settled billing will surface here once invoices
                          complete the payment flow.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
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

          {projectFilterId ||
          estimateFilterId ||
          jobFilterId ||
          changeOrderFilterId ||
          workflowRoleFilter ? (
            <div className="order-2 flex flex-col gap-3 border border-[#e2e5e9] bg-white px-4 py-3 text-sm leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Billing context is scoped to{" "}
                <span className="font-semibold text-slate-900">
                  {initialState.projectName ?? "the selected source"}
                </span>
                . Quick create will keep the same project, estimate, job, change
                order, and workflow role where those were provided.
              </p>
              <Link
                href="/invoices"
                className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Clear context
              </Link>
            </div>
          ) : null}
        </section>
        <WorkspaceComposerSheet
          id="invoice-create"
          title="Quick create invoice"
          description="Create the invoice first, then finish line items, review, send, and payment readiness inside the invoice workspace."
          open={showComposer}
          openHref={
            buildInvoicesHref({
              q: query,
              status: statusFilter,
              compose: "1",
              projectId: projectFilterId || undefined,
              estimateId: estimateFilterId || undefined,
              jobId: jobFilterId || undefined,
              changeOrderId: changeOrderFilterId || undefined,
              workflowRole: workflowRoleFilter,
              sort
            }) + "#invoice-create"
          }
          closeHref={buildInvoicesHref({
            q: query,
            status: statusFilter,
            projectId: projectFilterId || undefined,
            estimateId: estimateFilterId || undefined,
            jobId: jobFilterId || undefined,
            changeOrderId: changeOrderFilterId || undefined,
            workflowRole: workflowRoleFilter,
            sort
          })}
          openLabel="Open invoice quick create"
        >
          {quickCreateOptions && quickCreateOptions.projects.length > 0 ? (
            <InvoiceQuickCreateForm
              action={quickCreateInvoiceAction}
              projects={quickCreateOptions.projects}
              approvedEstimates={quickCreateOptions.approvedEstimates}
              completedJobs={quickCreateOptions.completedJobs}
              approvedChangeOrders={quickCreateOptions.approvedChangeOrders}
              initialProjectId={
                resolvedSearchParams.projectId ?? initialState.projectId
              }
              initialEstimateId={initialState.estimateId}
              initialJobId={initialState.jobId}
              initialChangeOrderId={changeOrderFilterId}
              initialWorkflowRole={initialState.workflowRole}
              errorMessage={resolvedSearchParams.error ?? null}
            />
          ) : (
            <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Add at least one project before creating an invoice.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
