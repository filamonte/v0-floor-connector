"use client";

import Link from "next/link";

import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
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
    id?: string | null;
    name?: string | null;
  } | null;
  estimate?: {
    id?: string | null;
  } | null;
  job?: {
    id?: string | null;
  } | null;
};

type InvoiceRecordsPanelProps = {
  invoices: InvoiceRecord[];
  totalInvoiceCount: number;
  storageKey: string;
  createHref?: string;
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

function getInvoicePrimaryAction(invoice: InvoiceRecord) {
  if (invoice.status === "draft") {
    return {
      label: "Send Invoice",
      href: `/invoices/${invoice.id}#invoice-editing`
    };
  }

  if (invoice.status !== "paid" && invoice.status !== "void" && Number(invoice.balanceDueAmount) > 0) {
    return {
      label: "Record Payment",
      href: `/invoices/${invoice.id}#payment-recording`
    };
  }

  return null;
}

export function InvoiceRecordsPanel({
  invoices,
  totalInvoiceCount,
  storageKey,
  createHref
}: InvoiceRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleInvoices = applyRowsPerView(invoices, rowsPerView);

  return (
    <section className="border border-[var(--border-warm)] bg-white">
      <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-2.5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Invoice records
            </p>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_112px_132px_132px_180px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] md:grid md:flex-1">
            <span>Invoice</span>
            <span>Project</span>
            <span>Due</span>
            <span>Status</span>
            <span className="text-right">Balance due</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Invoices list
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {formatRowsPerViewVisibleCount(
              invoices.length,
              visibleInvoices.length,
              rowsPerView
            )}
          </p>
        </div>
      </div>

      <div className="divide-y divide-[var(--border-warm)]">
        {invoices.length > 0 ? (
          visibleInvoices.map((invoice) => {
            const primaryAction = getInvoicePrimaryAction(invoice);

            return (
            <div
              key={invoice.id}
              className="group relative block px-4 py-2.5 transition hover:bg-[var(--highlight)] focus-within:bg-[var(--highlight)]"
            >
              <Link
                href={`/invoices/${invoice.id}`}
                className="absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--copper)]"
                aria-label={`Open invoice ${invoice.referenceNumber}`}
              />
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_112px_132px_132px_180px] md:items-center">
                <div className="pointer-events-none relative z-0 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--copper)]">
                    {invoice.referenceNumber}
                  </h3>
                  <p className="mt-0.5 text-sm leading-5 text-[var(--text-secondary)]">
                    {invoice.customer?.name ?? "Unknown customer"}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                    {getInvoiceContinuityCue(invoice)}
                  </p>
                </div>
                <div className="pointer-events-none relative z-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                    Project
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {invoice.project?.name ?? "Unknown project"}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-[var(--text-secondary)]">
                    {invoice.workflowRole === "deposit"
                      ? "Deposit readiness invoice"
                      : `Tax collected ${formatMoney(invoice.taxCollectedAmount)}`}
                  </p>
                </div>
                <div className="pointer-events-none relative z-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                    Due
                  </p>
                  <p className="text-sm font-medium tabular-nums text-[var(--text-primary)]">
                    {invoice.dueDate ? formatShortDate(invoice.dueDate) : "No date"}
                  </p>
                </div>
                <div className="pointer-events-none relative z-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
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
                <div className="pointer-events-none relative z-0 md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                    Balance due
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                    {formatMoney(invoice.balanceDueAmount)}
                  </p>
                </div>
                <div className="relative z-10 flex flex-wrap justify-start gap-2 md:justify-end">
                  {primaryAction ? (
                    <Link href={primaryAction.href} className={primaryActionClassName}>
                      {primaryAction.label}
                    </Link>
                  ) : null}
                  <Link href={`/invoices/${invoice.id}#invoice-editing`} className={secondaryActionClassName}>
                    Edit
                  </Link>
                  <ActionOverflowMenu>
                    {invoice.project?.id ? (
                      <Link href={`/projects/${invoice.project.id}`} className={overflowActionClassName}>
                        View Project
                      </Link>
                    ) : null}
                    {invoice.estimate?.id ? (
                      <Link href={`/estimates/${invoice.estimate.id}`} className={overflowActionClassName}>
                        View Estimate
                      </Link>
                    ) : null}
                    {invoice.job?.id ? (
                      <Link href={`/jobs/${invoice.job.id}`} className={overflowActionClassName}>
                        View Job
                      </Link>
                    ) : null}
                  </ActionOverflowMenu>
                </div>
              </div>
            </div>
            );
          })
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
                  : "Create the first invoice from a project, approved scope, completed job, or deposit trigger so billing stays connected to the canonical workflow."
              }
              actionHref={createHref}
              actionLabel={totalInvoiceCount > 0 ? undefined : "Create first invoice"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
