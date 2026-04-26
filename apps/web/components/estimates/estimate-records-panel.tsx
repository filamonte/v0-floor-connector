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
  totalAmount: string;
  status: string;
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

export function EstimateRecordsPanel({
  estimates,
  totalEstimateCount,
  storageKey
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
          <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
            <span>Estimate</span>
            <span>Project</span>
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
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_1fr_160px_140px] md:items-center">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                    {estimate.referenceNumber}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
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
                  : "Estimates define the priced commercial scope that later flows into contracts, jobs, and invoicing."
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
