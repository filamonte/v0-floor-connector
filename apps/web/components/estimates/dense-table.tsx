"use client";

import { CalendarDays, MoreVertical } from "lucide-react";

type DenseEstimateRow = {
  reference: string;
  title: string;
  customer: string;
  estimator: string;
  pm: string;
  cost: string;
  total: string;
  profit: string;
  markup: string;
  type: string;
  status: string;
};

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes("approve")) return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  if (value.includes("pending")) return "bg-amber-50 text-amber-800";
  return "bg-[var(--copper)]/10 text-[var(--copper)]";
}

export function EstimateDenseTable({ rows }: { rows: DenseEstimateRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--highlight)] text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            <tr>
              <th className="w-[70px] px-3 py-3 text-left">EST #</th>
              <th className="w-[180px] px-3 py-3 text-left">Title</th>
              <th className="w-[150px] px-3 py-3 text-left">Customer</th>
              <th className="w-[80px] px-3 py-3 text-left">Estimator</th>
              <th className="w-[60px] px-3 py-3 text-left">PM</th>
              <th className="px-3 py-3 text-right">Cost</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-right">Profit</th>
              <th className="px-3 py-3 text-right">MU%</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.reference} className={index % 2 === 0 ? "bg-white hover:bg-[var(--highlight)]" : "bg-[var(--highlight)]/60 hover:bg-[var(--highlight)]"}>
                <td className="h-11 px-3 py-2 text-sm text-[var(--text-primary)]">{row.reference}</td>
                <td className="h-11 px-3 py-2 text-sm text-[var(--text-primary)]">{row.title}</td>
                <td className="h-11 px-3 py-2 text-sm text-[var(--text-primary)]">{row.customer}</td>
                <td className="h-11 px-3 py-2 text-sm text-[var(--text-primary)]">{row.estimator}</td>
                <td className="h-11 px-3 py-2 text-sm text-[var(--text-primary)]">{row.pm}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-[var(--text-primary)]">{row.cost}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-[var(--text-primary)]">{row.total}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-[var(--text-primary)]">{row.profit}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-[var(--text-primary)]">{row.markup}</td>
                <td className="h-11 px-3 py-2">
                  <span className="rounded-md bg-[var(--highlight)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">{row.type}</span>
                </td>
                <td className="h-11 px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span>
                </td>
                <td className="h-11 px-3 py-2">
                  <div className="flex items-center justify-end gap-2 text-[var(--text-tertiary)]">
                    <CalendarDays className="h-4 w-4" />
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[var(--border-warm)] px-4 py-3 text-sm text-[var(--text-secondary)]">Page 1 of 1</div>
    </section>
  );
}
