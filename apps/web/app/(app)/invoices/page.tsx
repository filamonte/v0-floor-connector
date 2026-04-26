import Link from "next/link";
import type { InvoiceWorkflowRole } from "@floorconnector/types";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { InvoiceQuickCreateForm } from "@/components/invoice-quick-create-form";
import { InvoiceRecordsPanel } from "@/components/invoices/invoice-records-panel";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { RowsPerViewControl } from "@/components/rows-per-view-control";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { listInvoices } from "@/lib/invoices/data";
import { getEstimateById } from "@/lib/estimates/data";
import { getJobById } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";

type InvoicesPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    estimateId?: string;
    jobId?: string;
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
  return query.length > 0 ? `/invoices?${query}` : "/invoices";
}

async function getInitialInvoiceState(
  estimateId?: string,
  jobId?: string,
  workflowRole?: string
): Promise<{
  projectId: string | null;
  estimateId: string | null;
  jobId: string | null;
  workflowRole: InvoiceWorkflowRole;
}> {
  const resolvedWorkflowRole: InvoiceWorkflowRole =
    workflowRole === "deposit" ? "deposit" : "standard";
  const [estimate, job] = await Promise.all([
    estimateId ? getEstimateById(estimateId, "/invoices") : Promise.resolve(null),
    jobId ? getJobById(jobId, "/invoices") : Promise.resolve(null)
  ]);

  const sourceEstimate =
    estimate ??
    (job?.estimateId ? await getEstimateById(job.estimateId, "/invoices") : null);

  return {
    projectId: sourceEstimate?.projectId ?? job?.projectId ?? null,
    estimateId: sourceEstimate?.id ?? null,
    jobId: job?.id ?? null,
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

  const [invoices, projects, initialState, financialSettings] = await Promise.all([
    listInvoices(),
    listProjects(),
    getInitialInvoiceState(
      resolvedSearchParams.estimateId,
      resolvedSearchParams.jobId,
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

  const draftCount = invoices.filter((invoice) => invoice.status === "draft").length;
  const sentCount = invoices.filter((invoice) => invoice.status === "sent").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "paid").length;
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
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.projectId) ||
    Boolean(resolvedSearchParams.estimateId) ||
    Boolean(resolvedSearchParams.jobId);
  const filteredInvoices = invoices.filter((invoice) => {
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
    { key: "all", label: "All invoices", count: invoices.length },
    { key: "draft", label: "Draft", count: draftCount },
    { key: "sent", label: "Sent", count: sentCount },
    { key: "open", label: "Open balance", count: openCount },
    { key: "paid", label: "Paid", count: paidCount },
    { key: "void", label: "Void", count: invoices.filter((invoice) => invoice.status === "void").length }
  ] as const;
  const awaitingPaymentQueue = invoices
    .filter(
      (invoice) => invoice.status === "sent" || invoice.status === "partially_paid"
    )
    .slice(0, 3);
  const overdueQueue = invoices
    .filter(
      (invoice) =>
        invoice.dueDate !== null &&
        invoice.status !== "paid" &&
        invoice.status !== "void" &&
        invoice.dueDate < todayIso
    )
    .slice(0, 3);
  const draftQueue = invoices
    .filter((invoice) => invoice.status === "draft")
    .slice(0, 3);
  const recentlyPaidQueue = invoices
    .filter((invoice) => invoice.status === "paid")
    .slice(0, 3);

  return (
    <ContractorWorkspacePage
      eyebrow="Invoices"
      title={`Invoice manager for ${organizationContext.organization.displayName}`}
      description="Create the invoice, finish billing details, review it, send it, and then manage collections. This manager keeps the billing workflow clearer instead of jumping straight into payment detail."
      summary={
        <div className="grid gap-px border border-[#d7dce4] bg-[#d7dce4] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Draft</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">{draftCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Sent</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">{sentCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Overdue</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">{overdueCount}</p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Open balance</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">{openCount}</p>
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
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search invoice, project, customer, or role"
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
              href={buildInvoicesHref({ q: query, status: view.key, compose: showComposer ? "1" : undefined })}
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
          <>
            <RowsPerViewControl storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY} />
            <Link
              href={buildInvoicesHref({ q: query, status: statusFilter, compose: "1" }) + "#invoice-create"}
              className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
            >
              New invoice
            </Link>
          </>
        )
      }}
    >
    <div className={showComposer ? "grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]" : "space-y-3"}>
      <section className="space-y-3">
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)_minmax(0,0.92fr)]">
          <ManagerDashboardCard
              eyebrow="Collections"
            title="Sent invoices awaiting payment"
            description="Open customer billing that has already been sent and now needs collections attention."
            actionHref={buildInvoicesHref({ q: query, status: "open", compose: showComposer ? "1" : undefined })}
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
            actionHref={buildInvoicesHref({ q: query, status: "open", compose: showComposer ? "1" : undefined })}
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
            actionHref={buildInvoicesHref({ q: query, status: "draft", compose: showComposer ? "1" : undefined })}
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

          <section className="flex h-full flex-col border border-[#d7dce4] bg-white">
            <div className="border-b border-[#dfe4ec] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
                Billing context
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#17243b]">
                Billing posture
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Compact finance context for the invoice register.
              </p>
            </div>

            <div className="flex flex-1 flex-col space-y-3 px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border border-[#e2e7ef] bg-[#fbfcfe] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Tax default</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {financialSettings.defaultTaxBehavior.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="border border-[#e2e7ef] bg-[#fbfcfe] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Tax rate</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatRate(financialSettings.defaultTaxRate)}
                  </p>
                </div>
                <div className="border border-[#e2e7ef] bg-[#fbfcfe] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Partially paid</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{partialCount} invoices</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-900">Recently settled invoices</p>
                  <Link
                    href={buildInvoicesHref({ q: query, status: "paid", compose: showComposer ? "1" : undefined })}
                    className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#41536f] transition hover:bg-white"
                  >
                    View paid
                  </Link>
                </div>

                <div className="divide-y divide-slate-200 border border-[#e5ebf2] bg-white">
                  {recentlyPaidQueue.length > 0 ? (
                    recentlyPaidQueue.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}/edit`}
                        className="group flex items-start justify-between gap-4 px-4 py-3 transition hover:bg-slate-50/80"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                            {invoice.referenceNumber}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {invoice.customer?.name ?? "Unknown customer"} - {invoice.project?.name ?? "Unknown project"}
                          </p>
                          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7a889d]">
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

        <InvoiceRecordsPanel
          invoices={filteredInvoices}
          totalInvoiceCount={invoices.length}
          storageKey={INVOICES_ROWS_PER_VIEW_STORAGE_KEY}
        />
      </section>
        <WorkspaceComposerSheet
          id="invoice-create"
          title="Quick create invoice"
          description="Create the canonical invoice first, then finish line items, review, send, and payment readiness inside the invoice workspace."
        open={showComposer}
        openHref={buildInvoicesHref({ q: query, status: statusFilter, compose: "1" }) + "#invoice-create"}
        closeHref={buildInvoicesHref({ q: query, status: statusFilter })}
        openLabel="Open invoice quick create"
      >
        {projectOptions.length > 0 ? (
          <InvoiceQuickCreateForm
            action={quickCreateInvoiceAction}
            projects={projectOptions}
            initialProjectId={resolvedSearchParams.projectId ?? initialState.projectId}
            initialEstimateId={initialState.estimateId}
            initialJobId={initialState.jobId}
            initialWorkflowRole={initialState.workflowRole}
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
