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
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">Unpaid Invoices</h2>
        <button
          type="button"
          aria-label="Refresh unpaid invoices"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#94a3b8] transition hover:text-[#64748b]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="px-4 pb-4">
        {invoices.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#94a3b8]">
            No unpaid invoices
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {invoices.slice(0, 6).map((invoice) => (
              <Link
                key={invoice.id}
                href="/invoices"
                className="flex items-center gap-3 py-2 transition first:pt-0 last:pb-0 hover:bg-[#fafafa]"
              >
                <span className="min-w-0 flex-1 truncate text-[12px] text-[#17243b]">{invoice.customer}</span>
                <span className="text-[11px] text-[#94a3b8]">{invoice.dueDate}</span>
                <span className="text-[12px] font-semibold text-[#17243b]">
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
