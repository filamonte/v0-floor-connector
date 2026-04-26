"use client";

import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  applyRowsPerView,
  formatRowsPerViewVisibleCount,
  useRowsPerViewPreference
} from "@/components/rows-per-view-control";

type InvoiceRecord = {
  id: string;
  referenceNumber: string;
  status: string;
  workflowRole: string;
  balanceDueAmount: string;
  taxCollectedAmount: string;
  customer?: {
    name?: string | null;
  } | null;
  project?: {
    name?: string | null;
  } | null;
};

type InvoiceRecordsPanelProps = {
  invoices: InvoiceRecord[];
  totalInvoiceCount: number;
  storageKey: string;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export function InvoiceRecordsPanel({
  invoices,
  totalInvoiceCount,
  storageKey
}: InvoiceRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleInvoices = applyRowsPerView(invoices, rowsPerView);

  return (
    <section className="border border-[#cfd6e0] bg-white">
      <div className="border-b border-[#dfe4ec] bg-[#f7f8fa] px-4 py-3">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Invoice records
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Primary billing register.
            </p>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
            <span>Invoice</span>
            <span>Project</span>
            <span>Status</span>
            <span className="text-right">Balance due</span>
          </div>
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Invoices list
            </p>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            {formatRowsPerViewVisibleCount(
              invoices.length,
              visibleInvoices.length,
              rowsPerView
            )}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {invoices.length > 0 ? (
          visibleInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}/edit`}
              className="group block px-4 py-3 transition hover:bg-slate-50/70"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] md:items-center">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                    {invoice.referenceNumber}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {invoice.customer?.name ?? "Unknown customer"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Project
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {invoice.project?.name ?? "Unknown project"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {invoice.workflowRole === "deposit"
                      ? "Deposit readiness invoice"
                      : `Tax collected ${formatMoney(invoice.taxCollectedAmount)}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Status
                  </p>
                  <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {formatStatusLabel(invoice.status)}
                  </span>
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Balance due
                  </p>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatMoney(invoice.balanceDueAmount)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-8 sm:px-8">
            <AppEmptyState
              eyebrow={totalInvoiceCount > 0 ? "No matching invoices" : "No invoices yet"}
              title={
                totalInvoiceCount > 0 ? "Adjust the billing filters" : "Create the first invoice"
              }
              description={
                totalInvoiceCount > 0
                  ? "Try a broader search or switch invoice views to find the financial record you need."
                  : "Invoices remain canonical financial records tied to the same project, customer, estimate, and job context instead of becoming a disconnected billing module."
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
