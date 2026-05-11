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

type EstimateRecord = {
  id: string;
  referenceNumber: string;
  title?: string | null;
  totalAmount: string;
  status: string;
  estimateDate?: string | null;
  updatedAt?: string | null;
  customerViewedAt?: string | null;
  customer?: {
    id?: string | null;
    name?: string | null;
  } | null;
  project?: {
    id?: string | null;
    name?: string | null;
  } | null;
  opportunity?: {
    title?: string | null;
  } | null;
};

type EstimateRecordsPanelProps = {
  estimates: EstimateRecord[];
  totalEstimateCount: number;
  storageKey: string;
  createHref?: string;
};

function formatMoney(amount: string) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function getEstimateContinuityCue(estimate: EstimateRecord) {
  switch (estimate.status) {
    case "draft":
      return "Next: finish build";
    case "sent":
      return estimate.customerViewedAt ? "Next: follow up after view" : "Next: await customer";
    case "approved":
      return "Next: contract handoff";
    case "rejected":
      return "Next: revise scope";
    default:
      return "Next: review estimate";
  }
}

function getEstimatePrimaryAction(estimate: EstimateRecord) {
  if (estimate.status === "approved") {
    return {
      label: "Create Contract",
      href: `/contracts?estimateId=${estimate.id}`
    };
  }

  if (estimate.status === "draft" || estimate.status === "rejected") {
    return {
      label: "Send Estimate",
      href: `/estimates/${estimate.id}#estimate-workflow-actions`
    };
  }

  return null;
}

export function EstimateRecordsPanel({
  estimates,
  totalEstimateCount,
  storageKey,
  createHref
}: EstimateRecordsPanelProps) {
  const { rowsPerView } = useRowsPerViewPreference(storageKey);
  const visibleEstimates = applyRowsPerView(estimates, rowsPerView);

  return (
    <section className="border border-[var(--border-warm)] bg-white">
      <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-2.5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Estimate records
            </p>
          </div>
          <div className="hidden grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px_170px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] lg:grid lg:flex-1">
            <span>EST. #</span>
            <span>Title / customer</span>
            <span>Project</span>
            <span>Date</span>
            <span>Status</span>
            <span className="text-right">Total</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Estimates list
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {formatRowsPerViewVisibleCount(
              estimates.length,
              visibleEstimates.length,
              rowsPerView
            )}
          </p>
        </div>
      </div>

      <div className="divide-y divide-[var(--border-warm)]">
        {estimates.length > 0 ? (
          visibleEstimates.map((estimate) => {
            const primaryAction = getEstimatePrimaryAction(estimate);

            return (
            <div
              key={estimate.id}
              className="group block px-4 py-2.5 transition hover:bg-[var(--highlight)]"
            >
              <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_120px_130px_130px_170px] lg:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:hidden">
                    EST. #
                  </p>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--copper)]">
                    <Link href={`/estimates/${estimate.id}`}>{estimate.referenceNumber}</Link>
                  </h3>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {estimate.title ?? estimate.opportunity?.title ?? "Untitled estimate"}
                  </p>
                  <p className="mt-0.5 text-sm leading-5 text-[var(--text-secondary)]">
                    {estimate.customer?.name ?? "Unknown customer"}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                    {getEstimateContinuityCue(estimate)}
                  </p>
                  {estimate.opportunity?.title ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">
                      {estimate.opportunity.title}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:hidden">
                    Project
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {estimate.project?.name ?? "Unknown project"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:hidden">
                    Date
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatShortDate(estimate.estimateDate ?? estimate.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:hidden">
                    Status
                  </p>
                  <span
                    className={[
                      "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                      getStatusBadgeClassName(estimate.status)
                    ].join(" ")}
                  >
                    {formatStatusLabel(estimate.status)}
                  </span>
                </div>
                <div className="lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] lg:hidden">
                    Total
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {formatMoney(estimate.totalAmount)}
                  </p>
                </div>
                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  {primaryAction ? (
                    <Link href={primaryAction.href} className={primaryActionClassName}>
                      {primaryAction.label}
                    </Link>
                  ) : null}
                  <Link href={`/estimates/${estimate.id}/edit`} className={secondaryActionClassName}>
                    Edit
                  </Link>
                  <ActionOverflowMenu>
                    {estimate.project?.id ? (
                      <Link href={`/projects/${estimate.project.id}`} className={overflowActionClassName}>
                        View Project
                      </Link>
                    ) : null}
                    {estimate.customer?.id ? (
                      <Link href={`/customers/${estimate.customer.id}`} className={overflowActionClassName}>
                        View Customer
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
              eyebrow={totalEstimateCount > 0 ? "No matching estimates" : "No estimates yet"}
              title={
                totalEstimateCount > 0 ? "Adjust the estimate filters" : "Create your first estimate"
              }
              description={
                totalEstimateCount > 0
                  ? "Try a broader search or switch estimate views to find the commercial record you need."
                  : "Create your first estimate from a project, then move approved scope into a contract."
              }
              actionHref={createHref}
              actionLabel={totalEstimateCount > 0 ? undefined : "Create your first estimate"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
