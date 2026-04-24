"use client";

import { RefreshCcw } from "lucide-react";

type EstimateManagerStats = {
  recentResponses: Array<{ reference: string; title: string; customer: string; status: string }>;
  pendingApproval: Array<{ reference: string; submitted: string; expires: string; customer: string }>;
  wonLost: {
    label: string;
    count: string;
    amount: string;
  }[];
};

function statusPillClass(status: string) {
  if (status.toLowerCase().includes("approve")) return "bg-green-100 text-green-700";
  if (status.toLowerCase().includes("reject")) return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
}

export function EstimateKpiTiles({ stats }: { stats: EstimateManagerStats }) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      <section className="rounded-lg border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Recent Client Responses</h2>
          <RefreshCcw className="h-4 w-4 text-slate-400" />
        </header>
        <div className="px-3 py-2">
          <div className="grid h-7 grid-cols-[70px_minmax(0,1fr)_70px_90px] items-center px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>EST. #</span>
            <span>Title</span>
            <span>Customer</span>
            <span>Status</span>
          </div>
          {stats.recentResponses.slice(0, 5).map((row) => (
            <div
              key={row.reference}
              className="grid h-7 grid-cols-[70px_minmax(0,1fr)_70px_90px] items-center rounded-md px-2 text-sm text-slate-700 odd:bg-white even:bg-slate-50"
            >
              <span>{row.reference}</span>
              <span className="truncate">{row.title}</span>
              <span>{row.customer}</span>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusPillClass(row.status)}`}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Estimates Pending Approval</h2>
          <RefreshCcw className="h-4 w-4 text-slate-400" />
        </header>
        <div className="px-3 py-2">
          <div className="grid h-7 grid-cols-[70px_110px_110px_60px] items-center px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <span>EST. #</span>
            <span>Submitted</span>
            <span>Expires</span>
            <span>Customer</span>
          </div>
          {stats.pendingApproval.slice(0, 6).map((row) => (
            <div
              key={`${row.reference}-${row.customer}`}
              className="grid h-7 grid-cols-[70px_110px_110px_60px] items-center rounded-md px-2 text-sm text-slate-700 odd:bg-white even:bg-slate-50"
            >
              <span>{row.reference}</span>
              <span>{row.submitted}</span>
              <span>{row.expires}</span>
              <span>{row.customer}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Won &amp; Lost Estimates</h2>
          <div className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600">Last Month / This Month</div>
        </header>
        <div className="grid gap-4 px-4 py-5 sm:grid-cols-2">
          {stats.wonLost.map((item) => (
            <div key={item.label} className="flex flex-col items-center justify-center gap-3">
              <div className="relative h-40 w-40 rounded-full border-[16px] border-[#2f7f7b]/80 border-r-[#24396b] border-t-[#24396b]">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-sm font-semibold text-slate-900">Count ({item.count})</div>
                  <div className="text-sm text-slate-600">{item.amount}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-600">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
