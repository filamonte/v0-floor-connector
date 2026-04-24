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
  if (value.includes("approve")) return "bg-green-100 text-green-700";
  if (value.includes("pending")) return "bg-yellow-100 text-yellow-700";
  return "bg-orange-100 text-orange-700";
}

export function EstimateDenseTable({ rows }: { rows: DenseEstimateRow[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
              <tr key={row.reference} className={index % 2 === 0 ? "bg-white hover:bg-[#f0f4f8]" : "bg-slate-50 hover:bg-[#f0f4f8]"}>
                <td className="h-11 px-3 py-2 text-sm text-slate-700">{row.reference}</td>
                <td className="h-11 px-3 py-2 text-sm text-slate-700">{row.title}</td>
                <td className="h-11 px-3 py-2 text-sm text-slate-700">{row.customer}</td>
                <td className="h-11 px-3 py-2 text-sm text-slate-700">{row.estimator}</td>
                <td className="h-11 px-3 py-2 text-sm text-slate-700">{row.pm}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-slate-700">{row.cost}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-slate-700">{row.total}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-slate-700">{row.profit}</td>
                <td className="h-11 px-3 py-2 text-right text-sm text-slate-700">{row.markup}</td>
                <td className="h-11 px-3 py-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{row.type}</span>
                </td>
                <td className="h-11 px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span>
                </td>
                <td className="h-11 px-3 py-2">
                  <div className="flex items-center justify-end gap-2 text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    <MoreVertical className="h-4 w-4" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">Page 1 of 1</div>
    </section>
  );
}
