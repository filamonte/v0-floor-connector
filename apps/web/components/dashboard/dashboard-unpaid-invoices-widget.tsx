"use client";

import Link from "next/link";

type UnpaidInvoice = {
  id: string;
  customer: string;
  dueDate: string;
  total: number;
};

type DashboardUnpaidInvoicesWidgetProps = {
  invoices?: UnpaidInvoice[];
};

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[#4d5d78]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 0 0-14.7-4M4 13a8 8 0 0 0 14.7 4" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-[#64748b]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path d="M7 2v4M13 2v4M3 9h14" />
    </svg>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

const DEFAULT_INVOICES: UnpaidInvoice[] = [
  { id: "1", customer: "Frank E Payeur (Fontaine Bros. Inc.)", dueDate: "04/17/2026", total: 2001.72 },
  { id: "2", customer: "Brian Frank (B.E Frank Construction)", dueDate: "04/17/2026", total: 41037.25 },
  { id: "3", customer: "Kris Larange", dueDate: "04/14/2026", total: 25079.87 },
  { id: "4", customer: "Amanda Clarke (Designer Fur Bengal Catte...", dueDate: "04/14/2026", total: 8991.40 },
  { id: "5", customer: "Jamie Piscopio (J Scope Remodeling)", dueDate: "04/10/2026", total: 10567.14 },
  { id: "6", customer: "Alex Ansaldi (The Andrew Ansaldi Company)", dueDate: "04/17/2026", total: 12179.60 },
  { id: "7", customer: "Michele DeGray (Michele DeGray)", dueDate: "04/03/2026", total: 6376.69 },
  { id: "8", customer: "Derek Helie (One Development & Construc...", dueDate: "03/31/2026", total: 118585.84 },
  { id: "9", customer: "Mary Konefal", dueDate: "03/27/2026", total: 8599.22 }
];

export function DashboardUnpaidInvoicesWidget({
  invoices = DEFAULT_INVOICES
}: DashboardUnpaidInvoicesWidgetProps) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7ebf1] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#17243b]">Unpaid Invoices</h2>
        <button
          type="button"
          aria-label="Refresh unpaid invoices"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="p-2">
        {invoices.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-[#dde3eb] bg-[#f7f9fb] px-4 py-6 text-center text-sm text-[#64748b]">
            No unpaid invoices
          </div>
        ) : (
          <div className="divide-y divide-[#edf0f4]">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
              <span>Customer</span>
              <span className="w-24 text-center">Due Date</span>
              <span className="w-24 text-right">Total</span>
            </div>
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href="/invoices"
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[4px] px-2 py-2 transition hover:bg-[#f8fafc]"
              >
                <span className="truncate text-[12px] text-[#17243b]">{invoice.customer}</span>
                <div className="flex w-24 items-center justify-center gap-1 text-[11px] text-[#64748b]">
                  <CalendarIcon />
                  <span>{invoice.dueDate}</span>
                </div>
                <span className="w-24 text-right text-[12px] font-semibold text-[#17243b]">
                  {formatCurrency(invoice.total)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
