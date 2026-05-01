"use client";

import { RefreshCcw } from "lucide-react";

type StatusSidebarRow = {
  label: string;
  count: number;
  percentage: string;
  progress: number;
  colorClass: string;
};

export function EstimateStatusSidebar({ rows }: { rows: StatusSidebarRow[] }) {
  return (
    <section className="border border-[#e2dcd5] bg-white">
      <header className="flex items-center justify-between border-b border-[#e2dcd5] bg-[#f8f6f4] px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-[#221a14]">Estimates by Status</h2>
        <RefreshCcw className="h-4 w-4 text-[#8a7a6c]" />
      </header>

      <div className="space-y-3 px-4 py-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
              <span className="font-medium text-[#221a14]">
                {row.label} ({row.count})
              </span>
              <span className="text-[#8a7a6c]">{row.percentage}</span>
            </div>
            <div className="h-1.5 bg-[#f0ebe6]">
              <div className={`h-1.5 ${row.colorClass}`} style={{ width: `${row.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
