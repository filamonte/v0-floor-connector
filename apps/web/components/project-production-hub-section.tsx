import Link from "next/link";
import {
  ReadinessBadge,
  RecordWorkspaceSection,
  StatusBadge,
  getReadinessLaneCopy
} from "@floorconnector/ui";

import { AppEmptyState } from "@/components/app-empty-state";
import { secondaryActionClassName } from "@/components/action-hierarchy";
import { ContextFactsList } from "@/components/context-facts-list";
import { LinkedRecordCard } from "@/components/linked-record-card";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";

export type ProjectProductionLinkedItem = {
  id: string;
  href: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  statusLabel: string;
};

export type ProjectProductionEmptyState = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export type ProjectProductionOverview = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  stat: string;
};

export type ProjectProductionList = {
  title: string;
  items: ProjectProductionLinkedItem[];
  emptyState: ProjectProductionEmptyState;
};

export type ProjectProductionScheduleMetric = {
  label: string;
  value: string | number;
};

export type ProjectProductionScheduleFocus = {
  eyebrow: string;
  title: string;
  titleHref: string;
  statusLabel: string;
  summary: string;
  crewSummary: string | null;
};

export type ProjectProductionScheduleNotice = {
  eyebrow: string;
  title: string;
  detail: string;
};

export type ProjectProductionScheduleFact = {
  label: string;
  value: string;
  detail?: string;
};

export type ProjectProductionScheduleAction = {
  href: string;
  label: string;
};

export type ProjectProductionScheduleContinuity = {
  metrics: ProjectProductionScheduleMetric[];
  focus: ProjectProductionScheduleFocus | null;
  notice: ProjectProductionScheduleNotice | null;
  facts: ProjectProductionScheduleFact[];
  actions: ProjectProductionScheduleAction[];
};

export type ProjectProductionHubSectionProps = {
  overview: ProjectProductionOverview;
  jobs: ProjectProductionList;
  punchlists: ProjectProductionList;
  dailyExecution: ProjectProductionList;
};

export type ProjectProductionScheduleContinuityPanelProps = {
  schedule: ProjectProductionScheduleContinuity;
};

export function ProjectProductionHubSection({
  overview,
  jobs,
  punchlists,
  dailyExecution
}: ProjectProductionHubSectionProps) {
  return (
    <div className="space-y-6">
      <ProjectProductionOverviewCard overview={overview} />
      <div className="grid gap-8 xl:grid-cols-3">
        <ProjectProductionListColumn list={jobs} />
        <ProjectProductionListColumn list={punchlists} />
        <ProjectProductionListColumn list={dailyExecution} />
      </div>
    </div>
  );
}

export function ProjectProductionScheduleContinuityPanel({
  schedule
}: ProjectProductionScheduleContinuityPanelProps) {
  return (
    <div className="space-y-4 text-sm leading-6 text-slate-600">
      <ScheduleContextMetrics items={schedule.metrics} />

      {schedule.focus ? (
        <ScheduleContextFocusCard
          eyebrow={schedule.focus.eyebrow}
          title={schedule.focus.title}
          titleHref={schedule.focus.titleHref}
          statusLabel={schedule.focus.statusLabel}
          summary={schedule.focus.summary}
          detailRows={
            schedule.focus.crewSummary
              ? [{ label: "Crew", value: schedule.focus.crewSummary }]
              : undefined
          }
        />
      ) : schedule.notice ? (
        <ScheduleContextNotice
          eyebrow={schedule.notice.eyebrow}
          title={schedule.notice.title}
        >
          {schedule.notice.detail}
        </ScheduleContextNotice>
      ) : null}

      <ContextFactsList
        items={schedule.facts.map((fact) => ({
          label: fact.label,
          value: fact.detail ? (
            <>
              {fact.value}
              <span className="mt-1 block text-xs text-slate-500">
                {fact.detail}
              </span>
            </>
          ) : (
            fact.value
          )
        }))}
      />

      <ScheduleContextActions
        actions={schedule.actions.map((action) => ({
          ...action,
          variant: "subtle"
        }))}
      />
    </div>
  );
}

function ProjectProductionOverviewCard({
  overview
}: {
  overview: ProjectProductionOverview;
}) {
  const productionLane = getReadinessLaneCopy("production-readiness");

  return (
    <RecordWorkspaceSection
      eyebrow={overview.eyebrow}
      title={overview.title}
      description={overview.description}
      className="rounded-none border-0 shadow-none"
      meta={
        <>
          <ReadinessBadge status={productionLane.label}>
            {productionLane.label}
          </ReadinessBadge>
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

function ProjectProductionListColumn({
  list
}: {
  list: ProjectProductionList;
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
