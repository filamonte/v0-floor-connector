import Link from "next/link";
import type { InvoiceWorkflowRole } from "@floorconnector/types";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { InvoiceForm } from "@/components/invoice-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createInvoiceAction } from "@/lib/invoices/actions";
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
    workflowRole?: string;
    compose?: string;
    q?: string;
    status?: "all" | "draft" | "sent" | "open" | "paid" | "void";
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

function formatRate(value: string) {
  return `${(Number(value) * 100).toFixed(2)}%`;
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
  discountAmount: string | null;
  lineItems:
    | Array<{
        name: string;
        description: string | null;
        quantity: string;
        unit: string;
        unitPrice: string;
      }>
    | null;
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
    workflowRole: resolvedWorkflowRole,
    discountAmount: sourceEstimate?.discountAmount ?? null,
    lineItems:
      sourceEstimate?.lineItems.map((lineItem) => ({
        name: lineItem.name,
        description: lineItem.description,
        quantity: lineItem.quantity,
        unit: lineItem.unit,
        unitPrice: lineItem.unitPrice
      })) ?? null
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

  const [invoices, projects, estimates, jobs, initialState, financialSettings] =
    await Promise.all([
      listInvoices(),
      listProjects(),
      listEstimates(),
      listJobs(),
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

  const approvedEstimateOptions = estimates
    .filter((estimate) => estimate.status === "approved")
    .map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      projectName: estimate.project?.name ?? null,
      status: estimate.status
    }));

  const jobOptions = jobs.map((job) => ({
    id: job.id,
    projectId: job.projectId,
    projectName: job.project?.name ?? null,
    status: job.status,
    estimateId: job.estimate?.id ?? null
  }));

  const draftCount = invoices.filter((invoice) => invoice.status === "draft").length;
  const sentCount = invoices.filter((invoice) => invoice.status === "sent").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "paid").length;
  const overdueCount = invoices.filter(
    (invoice) =>
      invoice.dueDate !== null &&
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      invoice.dueDate < "2026-04-16"
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
    { key: "open", label: "Open balance", count: invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "void").length },
    { key: "paid", label: "Paid", count: paidCount },
    { key: "void", label: "Void", count: invoices.filter((invoice) => invoice.status === "void").length }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Invoices"
      title={`Billing records for ${organizationContext.organization.displayName}`}
      description="Invoices stay connected to projects, customers, estimates, and jobs so collections and payment history never drift away from the operational record."
      summary={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Draft</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{draftCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Sent</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{sentCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Overdue</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{overdueCount}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search billing records, switch between working invoice states, and only open the create flow when you actually need to compose a new canonical invoice.
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
                href="/invoices"
                className="inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
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
            href={buildInvoicesHref({ q: query, status: statusFilter, compose: "1" }) + "#invoice-create"}
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            New invoice
          </Link>
        )
      }}
    >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-700">
                Billing defaults
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Financial context behind the queue
              </h3>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-slate-500">
              The manager stays review-first while tax behavior, org defaults, and invoice readiness remain visible in support.
            </p>
          </div>
          <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600 sm:grid-cols-3">
            <div>
              <p className="font-medium text-slate-950">Org tax default</p>
              <p>{financialSettings.defaultTaxBehavior.replaceAll("_", " ")}</p>
            </div>
            <div>
              <p className="font-medium text-slate-950">Org tax rate</p>
              <p>{formatRate(financialSettings.defaultTaxRate)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-950">AIA-ready billing</p>
              <p>Approved estimate items can seed future SOV records.</p>
            </div>
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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid md:flex-1">
                <span>Invoice</span>
                <span>Project</span>
                <span>Status</span>
                <span className="text-right">Balance due</span>
              </div>
              <div className="md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Invoices list
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {filteredInvoices.length} visible
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] md:items-center">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {invoice.referenceNumber}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {invoice.customer?.name ?? "Unknown customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Project
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {invoice.project?.name ?? "Unknown project"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {invoice.workflowRole === "deposit"
                          ? "Deposit readiness invoice"
                          : `Tax collected ${formatMoney(invoice.taxCollectedAmount)}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Balance due
                      </p>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatMoney(invoice.balanceDueAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow={invoices.length > 0 ? "No matching invoices" : "No invoices yet"}
                  title={invoices.length > 0 ? "Adjust the billing filters" : "Create the first invoice"}
                  description={
                    invoices.length > 0
                      ? "Try a broader search or switch invoice views to find the financial record you need."
                      : "Invoices remain canonical financial records tied to the same project, customer, estimate, and job context instead of becoming a disconnected billing module."
                  }
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside id="invoice-create" className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          Create invoice
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Start billing from an existing project so the invoice stays attached to the same customer, estimate, job, and payment chain.
        </p>
        {showComposer ? (
          projectOptions.length > 0 ? (
            <div className="mt-6">
              <InvoiceForm
                action={createInvoiceAction}
                submitLabel="Create invoice"
                pendingLabel="Creating invoice..."
                projects={projectOptions}
                estimates={approvedEstimateOptions}
                jobs={jobOptions}
                organizationFinancialSettings={financialSettings}
                initialProjectId={resolvedSearchParams.projectId ?? initialState.projectId}
                initialEstimateId={resolvedSearchParams.estimateId ?? initialState.estimateId}
                initialJobId={resolvedSearchParams.jobId ?? initialState.jobId}
                initialWorkflowRole={initialState.workflowRole}
                initialDiscountAmount={initialState.discountAmount}
                initialLineItems={initialState.lineItems}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Add at least one project before creating an invoice.
            </div>
          )
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/75 px-5 py-4 text-sm leading-6 text-slate-600">
              Open the compose flow when you are ready to build a new invoice. The manager stays focused on review until then.
            </div>
            <Link
              href={buildInvoicesHref({ q: query, status: statusFilter, compose: "1" }) + "#invoice-create"}
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open invoice composer
            </Link>
          </div>
        )}
      </aside>
    </div>
    </ContractorWorkspacePage>
  );
}
