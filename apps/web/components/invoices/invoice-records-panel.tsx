"use client";

import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  applyRowsPerView,
  formatRowsPerViewVisibleCount,
  useRowsPerViewPreference
} from "@/components/rows-per-view-control";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type InvoiceRecord = {
  id: string;
  referenceNumber: string;
  status: string;
  workflowRole: string;
  balanceDueAmount: string;
  taxCollectedAmount: string;
  dueDate?: string | null;
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

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function getInvoiceContinuityCue(invoice: InvoiceRecord) {
  if (invoice.status === "draft") {
    return "Next: finish billing detail";
  }

  if (invoice.status === "sent" || invoice.status === "partially_paid") {
    return invoice.dueDate ? `Next: collect by ${formatShortDate(invoice.dueDate)}` : "Next: collect payment";
  }

  if (invoice.status === "paid") {
    return "Settled";
  }

  if (invoice.status === "void") {
    return "Voided";
  }

  return "Next: review invoice";
}

export function InvoiceRecordsPanel({
  invoices,
  totalInvoiceCount,
  storageKey
}: InvoiceRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleInvoices = applyRowsPerView(invoices, rowsPerView);

  return (
    <section className="border border-[#e2e5e9] bg-white">
      <div className="border-b border-[#e2e5e9] bg-[#f8fafc] px-4 py-2.5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Invoice records
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

      <div className="divide-y divide-[#e5e7eb]">
        {invoices.length > 0 ? (
          visibleInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}/edit`}
              className="group block px-4 py-2.5 transition hover:bg-[#f8fafc]"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_140px] md:items-center">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                    {invoice.referenceNumber}
                  </h3>
                  <p className="mt-0.5 text-sm leading-5 text-slate-500">
                    {invoice.customer?.name ?? "Unknown customer"}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {getInvoiceContinuityCue(invoice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Project
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {invoice.project?.name ?? "Unknown project"}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-slate-500">
                    {invoice.workflowRole === "deposit"
                      ? "Deposit readiness invoice"
                      : `Tax collected ${formatMoney(invoice.taxCollectedAmount)}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Status
                  </p>
                  <span
                    className={[
                      "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                      getStatusBadgeClassName(invoice.status)
                    ].join(" ")}
                  >
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
