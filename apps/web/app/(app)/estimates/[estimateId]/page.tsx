import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { EstimateStatusActions } from "@/components/estimate-status-actions";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { getEstimateById } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts.filter((value) => value && value.trim().length > 0);

  return filtered.length > 0 ? filtered.join(", ") : null;
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "sent":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

type EstimateDetailPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function EstimateDetailPage({
  params,
  searchParams
}: EstimateDetailPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/estimates/${estimateId}`);
  const [estimate, organizationContext, contracts, jobs, invoices] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}`),
    getActiveOrganizationContext(user.id),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  if (!estimate) {
    notFound();
  }

  const estimateContracts = contracts.filter((contract) => contract.estimateId === estimate.id);
  const estimateJobs = jobs.filter((job) => job.estimateId === estimate.id);
  const estimateInvoices = invoices.filter((invoice) => invoice.estimateId === estimate.id);

  const customerAddress = estimate.customer
    ? formatAddress([
        estimate.customer.addressLine1,
        estimate.customer.addressLine2,
        estimate.customer.city,
        estimate.customer.stateRegion,
        estimate.customer.postalCode,
        estimate.customer.countryCode
      ])
    : null;

  const projectAddress = estimate.project
    ? formatAddress([
        estimate.project.addressLine1,
        estimate.project.addressLine2,
        estimate.project.city,
        estimate.project.stateRegion,
        estimate.project.postalCode,
        estimate.project.countryCode
      ])
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10 print:hidden">
        <DetailPageHeader
          eyebrow="Estimate Review"
          title={estimate.referenceNumber}
          description="Review the estimate as a customer-facing proposal while keeping the project, contract, job, and invoice context visible in the same workflow chain."
          backHref="/estimates"
          backLabel="Back to estimates"
          actions={
            <>
              {estimate.status === "approved" ? (
                <>
                  <Link
                    href={`/contracts?estimateId=${estimate.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Generate contract
                  </Link>
                  <Link
                    href={`/jobs?projectId=${estimate.projectId}&estimateId=${estimate.id}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Create job
                  </Link>
                  <Link
                    href={`/invoices?projectId=${estimate.projectId}&estimateId=${estimate.id}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Create invoice
                  </Link>
                </>
              ) : null}
              <Link
                href={`/estimates/${estimate.id}/edit`}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                  estimate.status === "approved"
                    ? "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white"
                    : "bg-brand-700 text-white hover:bg-brand-900"
                }`}
              >
                Edit estimate
              </Link>
            </>
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
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10 print:rounded-none print:border-none print:px-0 print:py-0 print:shadow-none">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Prepared by
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {organizationContext?.organization.displayName ?? "FloorConnector"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {organizationContext?.organization.legalName ??
                "Estimate prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Estimate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {estimate.referenceNumber}
            </p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${getStatusBadgeClassName(
                estimate.status
              )}`}
            >
              {formatStatusLabel(estimate.status)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-2">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Customer
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">
                {estimate.customer?.name ?? "Unknown customer"}
              </p>
              {estimate.customer?.companyName ? <p>{estimate.customer.companyName}</p> : null}
              {estimate.customer?.email ? <p>{estimate.customer.email}</p> : null}
              {estimate.customer?.phone ? <p>{estimate.customer.phone}</p> : null}
              {customerAddress ? <p>{customerAddress}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Project
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">
                {estimate.project?.name ?? "Unknown project"}
              </p>
              {estimate.project ? (
                <p className="capitalize">
                  Current status: {formatStatusLabel(estimate.project.status)}
                </p>
              ) : null}
              {estimate.project?.description ? <p>{estimate.project.description}</p> : null}
              {projectAddress ? <p>{projectAddress}</p> : null}
            </div>
          </section>
        </div>

        <div className="border-b border-slate-200 py-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Qty</th>
                  <th className="pb-2 pr-4">Unit</th>
                  <th className="pb-2 pr-4 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {estimate.lineItems.map((lineItem) => (
                  <tr key={lineItem.id} className="align-top text-sm leading-6 text-slate-700">
                    <td className="rounded-l-2xl border-y border-l border-slate-200 bg-slate-50/60 px-4 py-4">
                      <p className="font-medium text-slate-950">{lineItem.name}</p>
                      {lineItem.description ? (
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {lineItem.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4">
                      {lineItem.quantity}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4">
                      {lineItem.unit}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4 text-right">
                      {formatMoney(lineItem.unitPrice)}
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-slate-200 bg-slate-50/60 px-4 py-4 text-right font-medium text-slate-950">
                      {formatMoney(lineItem.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {estimate.notes ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Notes and Terms
                </p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {estimate.notes}
                </div>
              </section>
            ) : (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Notes and Terms
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No additional notes or terms have been added to this estimate yet.
                </div>
              </section>
            )}

            <DetailPanel
              title="Workflow Actions"
              description="Move the estimate through the commercial workflow while keeping downstream actions in the right order."
            >
              <EstimateStatusActions estimateId={estimate.id} currentStatus={estimate.status} />
              {estimate.status !== "approved" ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Jobs and contracts should be created after this estimate reaches the approved state.
                </p>
              ) : null}
            </DetailPanel>
          </div>

          <aside className="space-y-6">
            <DetailPanel title="Connected Records">
              <div className="grid gap-4">
                {estimate.project ? (
                  <LinkedRecordCard
                    href={`/projects/${estimate.project.id}`}
                    title={estimate.project.name}
                    subtitle="Project"
                    meta={estimate.customer?.name ?? "Unknown customer"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(estimate.project.status)}
                      </span>
                    }
                  />
                ) : null}
                {estimateContracts.map((contract) => (
                  <LinkedRecordCard
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    title={contract.title}
                    subtitle="Contract"
                    meta={contract.template?.name ?? "Shared template"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(contract.status)}
                      </span>
                    }
                  />
                ))}
                {estimateJobs.map((job) => (
                  <LinkedRecordCard
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    title={job.project?.name ?? "Job"}
                    subtitle="Job"
                    meta={job.scheduledDate ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}` : "Unscheduled"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(job.status)}
                      </span>
                    }
                  />
                ))}
                {estimateInvoices.map((invoice) => (
                  <LinkedRecordCard
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    title={invoice.referenceNumber}
                    subtitle="Invoice"
                    meta={`Balance due ${formatMoney(invoice.balanceDueAmount)}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(invoice.status)}
                      </span>
                    }
                  />
                ))}
                {estimateContracts.length === 0 && estimateJobs.length === 0 && estimateInvoices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No downstream contract, job, or invoice records are linked to this estimate yet.
                  </p>
                ) : null}
              </div>
            </DetailPanel>

            <DetailPanel title="Totals">
              <dl className="space-y-3 text-sm leading-6 text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(estimate.subtotalAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Discount</dt>
                  <dd>-{formatMoney(estimate.discountAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax</dt>
                  <dd>{formatMoney(estimate.taxAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                  <dt>Total</dt>
                  <dd>{formatMoney(estimate.totalAmount)}</dd>
                </div>
              </dl>
            </DetailPanel>
          </aside>
        </div>
      </section>
    </div>
  );
}
