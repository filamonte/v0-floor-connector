"use client";

import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  applyRowsPerView,
  formatRowsPerViewVisibleCount,
  useRowsPerViewPreference
} from "@/components/rows-per-view-control";

type EstimateRecord = {
  id: string;
  referenceNumber: string;
  title?: string | null;
  totalAmount: string;
  status: string;
  estimateDate?: string | null;
  updatedAt?: string | null;
  customer?: {
    name?: string | null;
  } | null;
  project?: {
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

export function EstimateRecordsPanel({
  estimates,
  totalEstimateCount,
  storageKey,
  createHref
}: EstimateRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleEstimates = applyRowsPerView(estimates, rowsPerView);

  return (
    <section className="border border-[#cfd6e0] bg-white">
      <div className="border-b border-[#dfe4ec] bg-[#f7f8fa] px-4 py-3">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Estimate records
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Primary estimate register.
            </p>
          </div>
          <div className="hidden grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
            <span>EST. #</span>
            <span>Title / customer</span>
            <span>Project</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Total</span>
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

      <div className="divide-y divide-slate-200">
        {estimates.length > 0 ? (
          visibleEstimates.map((estimate) => (
            <Link
              key={estimate.id}
              href={`/estimates/${estimate.id}`}
              className="group block px-4 py-3 transition hover:bg-slate-50/70"
            >
              <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px] md:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    EST. #
                  </p>
                  <h3 className="text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                    {estimate.referenceNumber}
                  </h3>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">
                    {estimate.title ?? estimate.opportunity?.title ?? "Untitled estimate"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {estimate.customer?.name ?? "Unknown customer"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {estimate.opportunity?.title ?? "Opportunity linked"}
                  </p>
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
                  <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
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
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-8 sm:px-8">
            <AppEmptyState
              eyebrow={totalEstimateCount > 0 ? "No matching estimates" : "No estimates yet"}
              title={
                totalEstimateCount > 0 ? "Adjust the estimate filters" : "Create the first estimate"
              }
              description={
                totalEstimateCount > 0
                  ? "Try a broader search or switch estimate views to find the commercial record you need."
                  : "Next step after the customer and project are ready: create the priced commercial scope that later flows into contracts, jobs, and invoicing."
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
