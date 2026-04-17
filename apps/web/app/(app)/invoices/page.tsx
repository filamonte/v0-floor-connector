import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
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

async function getInitialInvoiceState(estimateId?: string, jobId?: string) {
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
        resolvedSearchParams.jobId
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
  const overdueCount = invoices.filter(
    (invoice) =>
      invoice.dueDate !== null &&
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      invoice.dueDate < "2026-04-16"
  ).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(390px,0.9fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Invoices
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Billing records for {organizationContext.organization.displayName}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Invoices stay connected to projects, customers, estimates, and jobs so collections and payment history never drift away from the operational record.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
            <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
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
          </div>

          <div className="divide-y divide-slate-200">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
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
                        Tax collected {formatMoney(invoice.taxCollectedAmount)}
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
                  eyebrow="No invoices yet"
                  title="Create the first invoice"
                  description="Invoices remain canonical financial records tied to the same project, customer, estimate, and job context instead of becoming a disconnected billing module."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Invoice
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Create a connected invoice from an existing project. Approved estimates and jobs can prefill line items and source relationships without duplicating customer or project data.
        </p>
        {projectOptions.length > 0 ? (
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
              initialDiscountAmount={initialState.discountAmount}
              initialLineItems={initialState.lineItems}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Add at least one project before creating an invoice.
          </div>
        )}
      </aside>
    </div>
  );
}
