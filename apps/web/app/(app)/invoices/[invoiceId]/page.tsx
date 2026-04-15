import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePaymentForm } from "@/components/invoice-payment-form";
import {
  recordInvoicePaymentAction,
  updateInvoiceAction
} from "@/lib/invoices/actions";
import { getInvoiceById } from "@/lib/invoices/data";
import { listEstimates } from "@/lib/estimates/data";
import { listJobs } from "@/lib/jobs/data";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { listProjects } from "@/lib/projects/data";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams?: Promise<{
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

export default async function InvoiceDetailPage({
  params,
  searchParams
}: InvoiceDetailPageProps) {
  const { invoiceId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [invoice, projects, estimates, jobs] = await Promise.all([
    getInvoiceById(invoiceId, `/invoices/${invoiceId}`),
    listProjects(),
    listEstimates(),
    listJobs()
  ]);

  if (!invoice) {
    notFound();
  }

  const financialSettings = await getOrganizationFinancialSettings(invoice.organizationId);

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
    .filter((estimate) => estimate.status === "approved" || estimate.id === invoice.estimateId)
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Invoice Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {invoice.referenceNumber}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Update the canonical invoice record here. Invoices stay connected to
              the same project, customer, optional estimate/job, line items, tax
              snapshots, retainage, and recorded payments.
            </p>
          </div>
          <Link
            href="/invoices"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to invoices
          </Link>
        </div>

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

        <div className="mt-8">
          <InvoiceForm
            action={updateInvoiceAction}
            submitLabel="Save invoice"
            pendingLabel="Saving invoice..."
            projects={projectOptions}
            estimates={approvedEstimateOptions}
            jobs={jobOptions}
            organizationFinancialSettings={financialSettings}
            invoice={{
              ...invoice,
              lineItems: invoice.lineItems,
              paidAmount: invoice.paidAmount
            }}
            paidAmount={invoice.paidAmount}
          />
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Invoice Summary
          </p>
          <dl className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
            <div>
              <dt className="font-medium text-slate-950">Customer</dt>
              <dd>
                {invoice.customer ? (
                  <Link
                    href={`/customers/${invoice.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {invoice.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Project</dt>
              <dd>
                {invoice.project ? (
                  <Link
                    href={`/projects/${invoice.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {invoice.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Estimate</dt>
              <dd>
                {invoice.estimate ? (
                  <Link
                    href={`/estimates/${invoice.estimate.id}`}
                    className="font-medium text-brand-700"
                  >
                    {invoice.estimate.referenceNumber}
                  </Link>
                ) : (
                  "No linked estimate"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Job</dt>
              <dd>
                {invoice.job ? (
                  <Link
                    href={`/jobs/${invoice.job.id}`}
                    className="font-medium text-brand-700"
                  >
                    {formatStatusLabel(invoice.job.status)}
                  </Link>
                ) : (
                  "No linked job"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Billing model</dt>
              <dd>{invoice.billingModel}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Status</dt>
              <dd className="capitalize">{formatStatusLabel(invoice.status)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Issue date</dt>
              <dd>{new Date(`${invoice.issueDate}T00:00:00`).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Due date</dt>
              <dd>
                {invoice.dueDate
                  ? new Date(`${invoice.dueDate}T00:00:00`).toLocaleDateString()
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Tax behavior</dt>
              <dd>{invoice.taxBehaviorApplied.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Applied tax rate</dt>
              <dd>{formatRate(invoice.taxRateApplied)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Customer tax snapshot</dt>
              <dd>{invoice.customerTaxExemptSnapshot ? "Exempt" : "Taxable"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Org default tax</dt>
              <dd>
                {financialSettings.defaultTaxBehavior.replaceAll("_", " ")} at {formatRate(financialSettings.defaultTaxRate)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Subtotal</dt>
              <dd>{formatMoney(invoice.subtotalAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Taxable sales</dt>
              <dd>{formatMoney(invoice.taxableSalesAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Exempt sales</dt>
              <dd>{formatMoney(invoice.exemptSalesAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Tax collected</dt>
              <dd>{formatMoney(invoice.taxCollectedAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Tax</dt>
              <dd>{formatMoney(invoice.taxAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Discount</dt>
              <dd>{formatMoney(invoice.discountAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Retainage %</dt>
              <dd>{Number(invoice.retainagePercentage).toFixed(2)}%</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Retainage held</dt>
              <dd>{formatMoney(invoice.retainageHeldAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Total</dt>
              <dd>{formatMoney(invoice.totalAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Paid</dt>
              <dd>{formatMoney(invoice.paidAmount)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Balance due</dt>
              <dd>{formatMoney(invoice.balanceDueAmount)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Payment Recording
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Record a payment against this invoice to update balance due and paid status.
          </p>
          {invoice.status === "void" ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Void invoices do not accept recorded payments.
            </div>
          ) : (
            <div className="mt-6">
              <InvoicePaymentForm
                invoiceId={invoice.id}
                action={recordInvoicePaymentAction}
              />
            </div>
          )}

          <div className="mt-6 space-y-3">
            {invoice.payments.length > 0 ? (
              invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-950">
                      {formatMoney(payment.amount)}
                    </p>
                    <p className="capitalize">{formatStatusLabel(payment.status)}</p>
                  </div>
                  <p className="mt-1">
                    {new Date(`${payment.paymentDate}T00:00:00`).toLocaleDateString()}
                  </p>
                  <p>{payment.paymentMethod}</p>
                  {payment.reference ? <p>Ref: {payment.reference}</p> : null}
                  {payment.notes ? <p>{payment.notes}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No payments have been recorded for this invoice yet.
              </div>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
