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
    <section className="rounded-lg border border-[var(--border-warm)] bg-white">
      <header className="flex items-center justify-between border-b border-[var(--border-warm)] px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Estimates by Status</h2>
        <RefreshCcw className="h-4 w-4 text-[var(--text-secondary)]" />
      </header>

      <div className="space-y-4 px-4 py-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-[var(--text-secondary)]">
                {row.label} ({row.count})
              </span>
              <span className="text-[var(--text-tertiary)]">{row.percentage}</span>
            </div>
            <div className="h-1 rounded-full bg-[var(--highlight)]">
              <div className={`h-1 rounded-full ${row.colorClass}`} style={{ width: `${row.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
