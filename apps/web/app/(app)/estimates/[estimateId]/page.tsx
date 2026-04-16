import Link from "next/link";
import { notFound } from "next/navigation";

import { EstimateStatusActions } from "@/components/estimate-status-actions";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getEstimateById } from "@/lib/estimates/data";
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
      return "border-blue-500/30 bg-blue-500/15 text-blue-400";
    case "approved":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
    case "rejected":
      return "border-red-500/30 bg-red-500/15 text-red-400";
    default:
      return "border-[--muted]/30 bg-[--muted]/15 text-[--muted]";
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
  const [estimate, organizationContext] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}`),
    getActiveOrganizationContext(user.id)
  ]);

  if (!estimate) {
    notFound();
  }

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
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/estimates"
            className="rounded-lg p-2 text-[--muted] transition hover:bg-[--surface] hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {estimate.referenceNumber}
            </h1>
            <p className="mt-1 text-sm text-[--muted]">
              Estimate proposal for {estimate.customer?.name ?? "Unknown customer"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {estimate.status === "approved" && (
            <>
              <Link
                href={`/contracts/new?estimateId=${estimate.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[--accent] px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Convert to Contract
              </Link>
              <Link
                href={`/jobs/new?projectId=${estimate.projectId}&estimateId=${estimate.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--background] px-4 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong]"
              >
                Create Job
              </Link>
            </>
          )}
          <Link
            href={`/estimates/${estimate.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--background] px-4 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {resolvedSearchParams.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 print:hidden">
          {resolvedSearchParams.error}
        </div>
      )}
      {resolvedSearchParams.message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 print:hidden">
          {resolvedSearchParams.message}
        </div>
      )}

      {/* Main Content */}
      <div className="rounded-xl border border-[--line] bg-[--surface] print:rounded-none print:border-none">
        {/* Header Section */}
        <div className="flex flex-col gap-6 border-b border-[--line] p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
              Prepared by
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {organizationContext?.organization.displayName ?? "FloorConnector"}
            </h2>
            <p className="mt-1 text-sm text-[--muted]">
              {organizationContext?.organization.legalName ??
                "Estimate prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
              Estimate
            </p>
            <p className="mt-2 text-xl font-semibold text-white">
              {estimate.referenceNumber}
            </p>
            <span
              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClassName(estimate.status)}`}
            >
              {formatStatusLabel(estimate.status)}
            </span>
          </div>
        </div>

        {/* Customer & Project */}
        <div className="grid gap-6 border-b border-[--line] p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
              Customer
            </p>
            <div className="mt-3 space-y-1 text-sm text-[--muted]">
              <p className="text-base font-medium text-white">
                {estimate.customer?.name ?? "Unknown customer"}
              </p>
              {estimate.customer?.companyName && <p>{estimate.customer.companyName}</p>}
              {estimate.customer?.email && <p>{estimate.customer.email}</p>}
              {estimate.customer?.phone && <p>{estimate.customer.phone}</p>}
              {customerAddress && <p>{customerAddress}</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
              Project
            </p>
            <div className="mt-3 space-y-1 text-sm text-[--muted]">
              <p className="text-base font-medium text-white">
                {estimate.project?.name ?? "Unknown project"}
              </p>
              {estimate.project && (
                <p className="capitalize">Status: {formatStatusLabel(estimate.project.status)}</p>
              )}
              {estimate.project?.description && <p>{estimate.project.description}</p>}
              {projectAddress && <p>{projectAddress}</p>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-b border-[--line] p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-[--muted]">
                  <th className="pb-4">Description</th>
                  <th className="pb-4">Qty</th>
                  <th className="pb-4">Unit</th>
                  <th className="pb-4 text-right">Unit Price</th>
                  <th className="pb-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--line]">
                {estimate.lineItems.map((lineItem) => (
                  <tr key={lineItem.id} className="align-top">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-white">{lineItem.name}</p>
                      {lineItem.description && (
                        <p className="mt-1 text-sm text-[--muted]">{lineItem.description}</p>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-sm text-white tabular-nums">
                      {lineItem.quantity}
                    </td>
                    <td className="py-4 pr-4 text-sm text-[--muted]">{lineItem.unit}</td>
                    <td className="py-4 pr-4 text-right text-sm text-white tabular-nums">
                      {formatMoney(lineItem.unitPrice)}
                    </td>
                    <td className="py-4 text-right font-medium text-white tabular-nums">
                      {formatMoney(lineItem.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Notes */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
                Notes & Terms
              </p>
              {estimate.notes ? (
                <div className="mt-3 rounded-lg border border-[--line] bg-[--background] p-4 text-sm text-[--muted]">
                  {estimate.notes}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-[--line] bg-[--background] p-4 text-sm text-[--muted]">
                  No additional notes or terms have been added.
                </div>
              )}
            </div>

            {/* Status Actions */}
            <div className="print:hidden">
              <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
                Workflow Actions
              </p>
              <p className="mt-2 text-sm text-[--muted]">
                Move the estimate through the workflow using the status actions below.
              </p>
              <div className="mt-4">
                <EstimateStatusActions
                  estimateId={estimate.id}
                  currentStatus={estimate.status}
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-[--line] bg-[--background] p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[--muted]">
              Totals
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[--muted]">Subtotal</dt>
                <dd className="tabular-nums text-white">{formatMoney(estimate.subtotalAmount)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[--muted]">Discount</dt>
                <dd className="tabular-nums text-red-400">-{formatMoney(estimate.discountAmount)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[--muted]">Tax</dt>
                <dd className="tabular-nums text-white">{formatMoney(estimate.taxAmount)}</dd>
              </div>
              <div className="h-px bg-[--line]" />
              <div className="flex items-center justify-between text-base font-semibold">
                <dt className="text-white">Total</dt>
                <dd className="tabular-nums text-white">{formatMoney(estimate.totalAmount)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
