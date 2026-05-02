import Link from "next/link";
import type { InvoiceWorkflowRole } from "@floorconnector/types";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { InvoiceQuickCreateForm } from "@/components/invoice-quick-create-form";
import { InvoiceRecordsPanel } from "@/components/invoices/invoice-records-panel";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { RowsPerViewControl } from "@/components/rows-per-view-control";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getChangeOrderById, listChangeOrders } from "@/lib/change-orders/data";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { listInvoices } from "@/lib/invoices/data";
import { getEstimateById, listEstimates } from "@/lib/estimates/data";
import { getJobById, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";

type InvoicesPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    estimateId?: string;
    jobId?: string;
    changeOrderId?: string;
    workflowRole?: string;
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "open" | "paid" | "void";
    error?: string;
    message?: string;
  }>;
};

const INVOICES_ROWS_PER_VIEW_STORAGE_KEY = "fc.grid.rows.invoices";

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

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

function buildInvoicesHref(input: {
  q?: string;
  status?: string;
  compose?: string;
  projectId?: string;
  estimateId?: string;
  jobId?: string;
  changeOrderId?: string;
  workflowRole?: string;
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

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  if (input.jobId) {
    searchParams.set("jobId", input.jobId);
  }

  if (input.changeOrderId) {
    searchParams.set("changeOrderId", input.changeOrderId);
  }

  if (input.workflowRole && input.workflowRole !== "standard") {
    searchParams.set("workflowRole", input.workflowRole);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/invoices?${query}` : "/invoices";
}

async function getInitialInvoiceState(
  estimateId?: string,
  jobId?: string,
  changeOrderId?: string,
  workflowRole?: string
): Promise<{
  projectId: string | null;
  estimateId: string | null;
  jobId: string | null;
  changeOrderId: string | null;
  workflowRole: InvoiceWorkflowRole;
}> {
  const resolvedWorkflowRole: InvoiceWorkflowRole =
    workflowRole === "deposit" ? "deposit" : "standard";
  const [estimate, job, changeOrder] = await Promise.all([
    estimateId ? getEstimateById(estimateId, "/invoices") : Promise.resolve(null),
    jobId ? getJobById(jobId, "/invoices") : Promise.resolve(null),
    changeOrderId ? getChangeOrderById(changeOrderId, "/invoices") : Promise.resolve(null)
  ]);

  const sourceEstimate =
    estimate ??
    (job?.estimateId ? await getEstimateById(job.estimateId, "/invoices") : null);

  return {
    projectId: sourceEstimate?.projectId ?? job?.projectId ?? changeOrder?.projectId ?? null,
    estimateId: sourceEstimate?.id ?? null,
    jobId: job?.id ?? null,
    changeOrderId: changeOrder?.id ?? null,
    workflowRole: resolvedWorkflowRole
  };
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
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

  const [
    invoices,
    projects,
    estimates,
    jobs,
    changeOrders,
    initialState,
    financialSettings
  ] = await Promise.all([
    listInvoices(),
    listProjects(),
    listEstimates(),
    listJobs(),
    listChangeOrders(),
    getInitialInvoiceState(
      resolvedSearchParams.estimateId,
      resolvedSearchParams.jobId,
      resolvedSearchParams.changeOrderId,
      resolvedSearchParams.workflowRole
    ),
    getOrganizationFinancialSettings(organizationContext.organization.id)
  ]);

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null,
    customerTaxExempt: project.customer?.isTaxExempt ?? false,
    customerRetainagePercentageDefault:
      project.customer?.retainagePercentageDefault ?? "0.00"
  }));
  const approvedEstimateOptions = estimates
    .filter((estimate) => estimate.status === "approved")
    .map((estimate) => ({
      id: estimate.id,
      projectId: estimate.projectId,
      referenceNumber: estimate.referenceNumber,
      totalAmount: estimate.totalAmount
    }));
  const completedJobOptions = jobs
    .filter((job) => job.dispatchStatus === "completed")
    .map((job) => ({
      id: job.id,
      projectId: job.projectId,
      estimateReferenceNumber: job.estimate?.referenceNumber ?? null,
      scheduledDate: job.scheduledDate
    }));
  const approvedChangeOrderOptions = changeOrders
    .filter(
      (changeOrder) =>
        changeOrder.status === "approved" &&
        !changeOrder.invoiceId &&
        changeOrder.latestCommercialSnapshotItemIds.length > 0
    )
    .map((changeOrder) => ({
      id: changeOrder.id,
      projectId: changeOrder.projectId,
      referenceNumber: changeOrder.referenceNumber,
      title: changeOrder.title
    }));

  const draftCount = invoices.filter((invoice) => invoice.status === "draft").length;
  const sentCount = invoices.filter((invoice) => invoice.status === "sent").length;
  const openCount = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  ).length;
  const partialCount = invoices.filter(
    (invoice) => invoice.status === "partially_paid"
  ).length;
  const todayIso = new Date().toISOString().slice(0, 10);
  const overdueCount = invoices.filter(
    (invoice) =>
      invoice.dueDate !== null &&
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      invoice.dueDate < todayIso
  ).length;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const projectFilterId = resolvedSearchParams.projectId?.trim() ?? initialState.projectId ?? "";
  const estimateFilterId = resolvedSearchParams.estimateId?.trim() ?? initialState.estimateId ?? "";
  const jobFilterId = resolvedSearchParams.jobId?.trim() ?? initialState.jobId ?? "";
  const changeOrderFilterId =
    resolvedSearchParams.changeOrderId?.trim() ?? initialState.changeOrderId ?? "";
  const projectFilter = projectFilterId
    ? projects.find((project) => project.id === projectFilterId) ?? null
    : null;
  const workflowRoleFilter =
    resolvedSearchParams.workflowRole === "deposit" ? "deposit" : undefined;
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId) ||
    Boolean(resolvedSearchParams.estimateId) ||
    Boolean(resolvedSearchParams.jobId) ||
    Boolean(resolvedSearchParams.changeOrderId);
  const scopedInvoices = invoices.filter((invoice) => {
    const matchesProject = projectFilterId ? invoice.projectId === projectFilterId : true;
    const matchesEstimate = estimateFilterId ? invoice.estimateId === estimateFilterId : true;
    const matchesJob = jobFilterId ? invoice.jobId === jobFilterId : true;
    const matchesWorkflowRole = workflowRoleFilter
      ? invoice.workflowRole === workflowRoleFilter
      : true;

    return matchesProject && matchesEstimate && matchesJob && matchesWorkflowRole;
  });
  const filteredInvoices = scopedInvoices.filter((invoice) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "open"
          ? invoice.status !== "paid" && invoice.status !== "void"
          : invoice.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            invoice.referenceNumber,
            invoice.customer?.name ?? "",
            invoice.project?.name ?? "",
            invoice.workflowRole
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
  const invoiceViews = [
    { key: "all", label: "All invoices", count: scopedInvoices.length },
    { key: "draft", label: "Draft", count: scopedInvoices.filter((invoice) => invoice.status === "draft").length },
    { key: "sent", label: "Sent", count: scopedInvoices.filter((invoice) => invoice.status === "sent").length },
    {
      key: "open",
      label: "Open balance",
      count: scopedInvoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "void").length
    },
    { key: "paid", label: "Paid", count: scopedInvoices.filter((invoice) => invoice.status === "paid").length },
    { key: "void", label: "Void", count: scopedInvoices.filter((invoice) => invoice.status === "void").length }
  ] as const;
  const awaitingPaymentQueue = scopedInvoices
    .filter(
      (invoice) => invoice.status === "sent" || invoice.status === "partially_paid"
    )
    .slice(0, 3);
  const overdueQueue = scopedInvoices
    .filter(
      (invoice) =>
        invoice.dueDate !== null &&
        invoice.status !== "paid" &&
        invoice.status !== "void" &&
        invoice.dueDate < todayIso
    )
    .slice(0, 3);
  const draftQueue = scopedInvoices
    .filter((invoice) => invoice.status === "draft")
    .slice(0, 3);
  const recentlyPaidQueue = scopedInvoices
    .filter((invoice) => invoice.status === "paid")
    .slice(0, 3);

  return (
    <ContractorWorkspacePage
      eyebrow="Invoices"
      title={`Invoice manager for ${organizationContext.organization.displayName}`}
      description="Create the invoice, finish billing details, review it, send it, and then manage collections. This manager keeps the billing workflow clearer instead of jumping straight into payment detail."
      summary={
        <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Draft</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#221a14]">{draftCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Sent</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#221a14]">{sentCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Overdue</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#221a14]">{overdueCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Open balance</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#221a14]">{openCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use the billing queues to spot what needs review or collection work first, then quick create the real invoice record before finishing billing details in the invoice workspace.
          </p>
        ),
        searchSlot: (
          <form action="/invoices" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            {projectFilterId ? <input type="hidden" name="projectId" value={projectFilterId} /> : null}
            {estimateFilterId ? <input type="hidden" name="estimateId" value={estimateFilterId} /> : null}
            {jobFilterId ? <input type="hidden" name="jobId" value={jobFilterId} /> : null}
            {changeOrderFilterId ? <input type="hidden" name="changeOrderId" value={changeOrderFilterId} /> : null}
            {workflowRoleFilter ? <input type="hidden" name="workflowRole" value={workflowRoleFilter} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search invoice, project, customer, or role"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9cdc2] bg-white px-4 py-2.5 text-sm text-[#221a14] outline-none transition placeholder:text-[#9a8b80] focus:border-[#c59a6b]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9cdc2] bg-white px-4 py-2.5 text-sm font-medium text-[#594839] transition hover:border-[#ef7d32] hover:bg-[#fbf7f2]"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
              <Link
                href="/invoices"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: invoiceViews.map((view) => {
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
                workflowRole: workflowRoleFilter
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d9cdc2] bg-white text-[#594839] hover:bg-[#fbf7f2]"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-[#f2e7dc] text-[#8f5b32]"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <>
            <RowsPerViewControl storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY} />
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
                  workflowRole: workflowRoleFilter
                }) + "#invoice-create"
              }
              className="inline-flex items-center rounded-[3px] border border-[#ef7d32] bg-[#ef7d32] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#de6c22]"
            >
              New invoice
            </Link>
          </>
        )
      }}
    >
    <div className={showComposer ? "grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]" : "space-y-3"}>
      <section className="flex flex-col gap-3">
        <div className="order-1">
          <InvoiceRecordsPanel
            invoices={filteredInvoices}
            totalInvoiceCount={scopedInvoices.length}
            storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY}
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
            items={awaitingPaymentQueue.map((invoice) => ({
              href: `/invoices/${invoice.id}/edit`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: `${formatStatusLabel(invoice.status)} - due ${invoice.dueDate ? formatDate(invoice.dueDate) : "TBD"}`,
              badge: invoice.workflowRole === "deposit" ? "Deposit" : "Standard",
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
            items={overdueQueue.map((invoice) => ({
              href: `/invoices/${invoice.id}/edit`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: `Due ${invoice.dueDate ? formatDate(invoice.dueDate) : "TBD"}`,
              badge: "Overdue",
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
            items={draftQueue.map((invoice) => ({
              href: `/invoices/${invoice.id}/edit`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: `Workflow role ${invoice.workflowRole.replaceAll("_", " ")} - updated ${formatDate(invoice.updatedAt)}`,
              badge: "Draft",
              trailing: formatMoney(invoice.totalAmount)
            }))}
            emptyTitle="No draft invoices need review."
            emptyDescription="Draft invoices waiting to be finished or sent will appear here."
          />

          <section className="flex h-full flex-col border border-[#d9cdc2] bg-white">
            <div className="border-b border-[#e8ded5] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                Billing context
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#221a14]">
                Billing posture
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Compact finance context for the invoice register.
              </p>
            </div>

            <div className="flex flex-1 flex-col space-y-3 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border border-[#e8ded5] bg-[#fbf7f2] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Tax default</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {financialSettings.defaultTaxBehavior.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="border border-[#e8ded5] bg-[#fbf7f2] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Tax rate</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatRate(financialSettings.defaultTaxRate)}
                  </p>
                </div>
                <div className="border border-[#e8ded5] bg-[#fbf7f2] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8f7f72]">Partially paid</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{partialCount} invoices</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">Recently settled invoices</p>
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
                    className="inline-flex items-center rounded-[3px] border border-[#d9cdc2] bg-[#fbf7f2] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#594839] transition hover:border-[#ef7d32] hover:bg-white"
                  >
                    View paid
                  </Link>
                </div>

                <div className="divide-y divide-[#eee4dc] border border-[#e8ded5] bg-white">
                  {recentlyPaidQueue.length > 0 ? (
                    recentlyPaidQueue.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}/edit`}
                        className="group flex items-start justify-between gap-4 px-4 py-3 transition hover:bg-[#fbf7f2]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#221a14] transition group-hover:text-[#a4581a]">
                            {invoice.referenceNumber}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {invoice.customer?.name ?? "Unknown customer"} - {invoice.project?.name ?? "Unknown project"}
                          </p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#8f7f72]">
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
                      <p className="text-sm font-semibold text-slate-900">No recently paid invoices yet.</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Settled billing will surface here once invoices complete the payment flow.
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

        {projectFilterId || estimateFilterId || jobFilterId || changeOrderFilterId || workflowRoleFilter ? (
          <div className="order-2 flex flex-col gap-3 border border-[#d9cdc2] bg-white px-4 py-3 text-sm leading-6 text-[#6f6256] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Billing context is scoped to{" "}
              <span className="font-semibold text-slate-900">
                {projectFilter?.name ?? "the selected canonical source"}
              </span>
              . Quick create will keep the same project, estimate, job, change order, and workflow
              role where those were provided.
            </p>
            <Link
              href="/invoices"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9cdc2] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#594839] transition hover:border-[#ef7d32] hover:bg-[#fbf7f2] hover:text-[#221a14]"
            >
              Clear context
            </Link>
          </div>
        ) : null}

      </section>
        <WorkspaceComposerSheet
          id="invoice-create"
          title="Quick create invoice"
          description="Create the canonical invoice first, then finish line items, review, send, and payment readiness inside the invoice workspace."
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
            workflowRole: workflowRoleFilter
          }) + "#invoice-create"
        }
        closeHref={buildInvoicesHref({
          q: query,
          status: statusFilter,
          projectId: projectFilterId || undefined,
          estimateId: estimateFilterId || undefined,
          jobId: jobFilterId || undefined,
          changeOrderId: changeOrderFilterId || undefined,
          workflowRole: workflowRoleFilter
        })}
        openLabel="Open invoice quick create"
      >
        {projectOptions.length > 0 ? (
          <InvoiceQuickCreateForm
            action={quickCreateInvoiceAction}
            projects={projectOptions}
            approvedEstimates={approvedEstimateOptions}
            completedJobs={completedJobOptions}
            approvedChangeOrders={approvedChangeOrderOptions}
            initialProjectId={resolvedSearchParams.projectId ?? initialState.projectId}
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
