import Link from "next/link";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Invoices
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Invoice records for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Invoices are canonical financial records connected to projects, customers,
          and optionally the approved estimate or job they came from.
        </p>
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600 sm:grid-cols-3">
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
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Ordered by invoice status first, then due date where available.
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
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {invoice.referenceNumber}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {invoice.project?.name ?? "Unknown project"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p className="capitalize">{formatStatusLabel(invoice.status)}</p>
                    <p>{formatMoney(invoice.balanceDueAmount)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm leading-6 text-slate-500">
                  <span>{invoice.customer?.name ?? "Unknown customer"}</span>
                  <span>
                    Taxable: {formatMoney(invoice.taxableSalesAmount)}
                  </span>
                  <span>
                    Tax collected: {formatMoney(invoice.taxCollectedAmount)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No invoices have been created yet. Start from a project, approved
              estimate, or job to create the first financial record.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Invoice
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Create a connected invoice from an existing project. Approved estimates
          and jobs can prefill line items and source relationships without duplicating
          customer or project data.
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
