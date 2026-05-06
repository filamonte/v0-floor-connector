"use client";

import Link from "next/link";

import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { AppEmptyState } from "@/components/app-empty-state";
import {
  applyRowsPerView,
  formatRowsPerViewVisibleCount,
  useRowsPerViewPreference
} from "@/components/rows-per-view-control";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type EstimateRecord = {
  id: string;
  referenceNumber: string;
  title?: string | null;
  totalAmount: string;
  status: string;
  estimateDate?: string | null;
  updatedAt?: string | null;
  customerViewedAt?: string | null;
  customer?: {
    id?: string | null;
    name?: string | null;
  } | null;
  project?: {
    id?: string | null;
    name?: string | null;
  } | null;
  opportunity?: {
    title?: string | null;
  } | null;
};

type EstimateRecordsPanelProps = {
  estimates: EstimateRecord[];
  totalEstimateCount: number;
  storageKey: string;
  createHref?: string;
};

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function getEstimateContinuityCue(estimate: EstimateRecord) {
  switch (estimate.status) {
    case "draft":
      return "Next: finish build";
    case "sent":
      return estimate.customerViewedAt ? "Next: follow up after view" : "Next: await customer";
    case "approved":
      return "Next: contract handoff";
    case "rejected":
      return "Next: revise scope";
    default:
      return "Next: review estimate";
  }
}

function getEstimatePrimaryAction(estimate: EstimateRecord) {
  if (estimate.status === "approved") {
    return {
      label: "Create Contract",
      href: `/contracts?estimateId=${estimate.id}`
    };
  }

  if (estimate.status === "draft" || estimate.status === "rejected") {
    return {
      label: "Send Estimate",
      href: `/estimates/${estimate.id}#estimate-workflow-actions`
    };
  }

  return null;
}

export function EstimateRecordsPanel({
  estimates,
  totalEstimateCount,
  storageKey,
  createHref
}: EstimateRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleEstimates = applyRowsPerView(estimates, rowsPerView);

  return (
    <section className="border border-[#e2e5e9] bg-white">
      <div className="border-b border-[#e2e5e9] bg-[#f8fafc] px-4 py-2.5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Estimate records
            </p>
          </div>
          <div className="hidden grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px_170px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
            <span>EST. #</span>
            <span>Title / customer</span>
            <span>Project</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Estimates list
            </p>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            {formatRowsPerViewVisibleCount(
              estimates.length,
              visibleEstimates.length,
              rowsPerView
            )}
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#e5e7eb]">
        {estimates.length > 0 ? (
          visibleEstimates.map((estimate) => {
            const primaryAction = getEstimatePrimaryAction(estimate);

            return (
            <div
              key={estimate.id}
              className="group block px-4 py-2.5 transition hover:bg-[#f8fafc]"
            >
              <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px_170px] md:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    EST. #
                  </p>
                  <h3 className="text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                    <Link href={`/estimates/${estimate.id}`}>{estimate.referenceNumber}</Link>
                  </h3>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">
                    {estimate.title ?? estimate.opportunity?.title ?? "Untitled estimate"}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-slate-500">
                    {estimate.customer?.name ?? "Unknown customer"}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {getEstimateContinuityCue(estimate)}
                  </p>
                  {estimate.opportunity?.title ? (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {estimate.opportunity.title}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Project
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {estimate.project?.name ?? "Unknown project"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Date
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatShortDate(estimate.estimateDate ?? estimate.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Status
                  </p>
                  <span
                    className={[
                      "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                      getStatusBadgeClassName(estimate.status)
                    ].join(" ")}
                  >
                    {formatStatusLabel(estimate.status)}
                  </span>
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Total
                  </p>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatMoney(estimate.totalAmount)}
                  </p>
                </div>
                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                  {primaryAction ? (
                    <Link href={primaryAction.href} className={primaryActionClassName}>
                      {primaryAction.label}
                    </Link>
                  ) : null}
                  <Link href={`/estimates/${estimate.id}/edit`} className={secondaryActionClassName}>
                    Edit
                  </Link>
                  <ActionOverflowMenu>
                    {estimate.project?.id ? (
                      <Link href={`/projects/${estimate.project.id}`} className={overflowActionClassName}>
                        View Project
                      </Link>
                    ) : null}
                    {estimate.customer?.id ? (
                      <Link href={`/customers/${estimate.customer.id}`} className={overflowActionClassName}>
                        View Customer
                      </Link>
                    ) : null}
                  </ActionOverflowMenu>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <div className="px-6 py-8 sm:px-8">
            <AppEmptyState
              eyebrow={totalEstimateCount > 0 ? "No matching estimates" : "No estimates yet"}
              title={
                totalEstimateCount > 0 ? "Adjust the estimate filters" : "Create your first estimate"
              }
              description={
                totalEstimateCount > 0
                  ? "Try a broader search or switch estimate views to find the commercial record you need."
                  : "Create your first estimate from a project, then move approved scope into a contract."
              }
              actionHref={createHref}
              actionLabel={totalEstimateCount > 0 ? undefined : "Create your first estimate"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
