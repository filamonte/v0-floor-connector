import Link from "next/link";
import { RecordWorkspaceSection, StatusBadge } from "@floorconnector/ui";

import { secondaryActionClassName } from "@/components/action-hierarchy";
import { AppEmptyState } from "@/components/app-empty-state";
import { LinkedRecordCard } from "@/components/linked-record-card";

export type ProjectFinancialRecordItem = {
  id: string;
  href: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  statusLabel: string;
};

export type ProjectFinancialSignalItem = {
  label: string;
  value: string;
  detail?: string;
};

export type ProjectFinancialEmptyState = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export type ProjectFinancialOverview = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  stat: string;
};

export type ProjectFinancialRecordList = {
  title: string;
  items: ProjectFinancialRecordItem[];
  emptyState: ProjectFinancialEmptyState;
};

export type ProjectFinancialContinuitySectionProps = {
  overview: ProjectFinancialOverview;
  signals?: ProjectFinancialSignalItem[];
  changeOrders: ProjectFinancialRecordList;
  progressBilling: ProjectFinancialRecordList;
  invoices: ProjectFinancialRecordList;
  payments: ProjectFinancialRecordList;
};

export function ProjectFinancialContinuitySection({
  overview,
  signals = [],
  changeOrders,
  progressBilling,
  invoices,
  payments
}: ProjectFinancialContinuitySectionProps) {
  return (
    <div className="space-y-6">
      <ProjectFinancialOverviewCard overview={overview} />

      {signals.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                {signal.label}
              </p>
              <p className="mt-1 font-semibold text-[var(--text-primary)]">
                {signal.value}
              </p>
              {signal.detail ? (
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {signal.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-4">
        <ProjectFinancialRecordColumn list={changeOrders} />
        <ProjectFinancialRecordColumn list={progressBilling} />
        <ProjectFinancialRecordColumn list={invoices} />
        <ProjectFinancialRecordColumn list={payments} />
      </div>
    </div>
  );
}

function ProjectFinancialOverviewCard({
  overview
}: {
  overview: ProjectFinancialOverview;
}) {
  return (
    <RecordWorkspaceSection
      eyebrow={overview.eyebrow}
      title={overview.title}
      description={overview.description}
      className="rounded-none border-0 shadow-none"
      meta={
        <>
          <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {overview.stat}
          </span>
          <Link href={overview.href} className={secondaryActionClassName}>
            {overview.linkLabel}
          </Link>
        </>
      }
    />
  );
}

function ProjectFinancialRecordColumn({
  list
}: {
  list: ProjectFinancialRecordList;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-950">{list.title}</p>
      </div>
      <div className="grid gap-4">
        {list.items.length > 0 ? (
          list.items.map((item) => (
            <LinkedRecordCard
              key={item.id}
              href={item.href}
              title={item.title}
              subtitle={item.subtitle}
              meta={item.meta}
              badge={renderStatusBadge(item.statusLabel)}
            />
          ))
        ) : (
          <AppEmptyState
            eyebrow={list.emptyState.eyebrow}
            title={list.emptyState.title}
            description={list.emptyState.description}
            actionHref={list.emptyState.actionHref}
            actionLabel={list.emptyState.actionLabel}
          />
        )}
      </div>
    </section>
  );
}

function renderStatusBadge(label: string) {
  return <StatusBadge status={label}>{label}</StatusBadge>;
}
