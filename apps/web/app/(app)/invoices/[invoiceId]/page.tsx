import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePaymentForm } from "@/components/invoice-payment-form";
import { LinkedRecordCard } from "@/components/linked-record-card";
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

function formatMoney(amount: string | number) {
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
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description="Review the canonical invoice in project context, with the connected customer, estimate, job, totals, and payments all visible from one billing surface."
            backHref="/invoices"
            backLabel="Back to invoices"
            actions={
              invoice.status !== "void" ? (
                <a
                  href="#payment-recording"
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Record payment
                </a>
              ) : null
            }
          />

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
        <DetailPanel title="Connected Records">
          <div className="grid gap-4">
            {invoice.project ? (
              <LinkedRecordCard
                href={`/projects/${invoice.project.id}`}
                title={invoice.project.name}
                subtitle="Project"
                meta={invoice.customer?.name ?? "Unknown customer"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.project.status)}
                  </span>
                }
              />
            ) : null}
            {invoice.customer ? (
              <LinkedRecordCard
                href={`/customers/${invoice.customer.id}`}
                title={invoice.customer.name}
                subtitle="Customer"
                meta={invoice.customer.companyName ?? "Customer record"}
              />
            ) : null}
            {invoice.estimate ? (
              <LinkedRecordCard
                href={`/estimates/${invoice.estimate.id}`}
                title={invoice.estimate.referenceNumber}
                subtitle="Estimate"
                meta={invoice.project?.name ?? "Source estimate"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.estimate.status)}
                  </span>
                }
              />
            ) : null}
            {invoice.job ? (
              <LinkedRecordCard
                href={`/jobs/${invoice.job.id}`}
                title={invoice.project?.name ?? "Job"}
                subtitle="Job"
                meta="Execution record linked to this invoice"
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.job.status)}
                  </span>
                }
              />
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel title="Invoice Summary">
          <dl className="space-y-4 text-sm leading-6 text-slate-600">
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
        </DetailPanel>

        <DetailPanel
          title="Payment Recording"
          description="Record a payment against this invoice to update balance due and paid status."
        >
          <div id="payment-recording" className="space-y-4">
            {invoice.status === "void" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Void invoices do not accept recorded payments.
              </div>
            ) : (
              <InvoicePaymentForm
                invoiceId={invoice.id}
                action={recordInvoicePaymentAction}
              />
            )}

            <div className="space-y-3">
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
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
