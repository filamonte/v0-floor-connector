"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { MembershipRole } from "@floorconnector/types";
import {
  getEmptyStateCopy,
  primaryActionClassName,
  secondaryActionClassName,
  StatusBadge,
  type EmptyStateKind
} from "@floorconnector/ui";

import type { AiOperationalDashboardDigest } from "@/lib/ai-operational-copilot/dashboard-digest";
import type { DashboardActionQueue } from "@/lib/dashboard/action-queues";
import type { DashboardPriorityItem } from "@/components/dashboard/priority-strip";
import { PriorityStrip } from "@/components/dashboard/priority-strip";
import { StartHereCard } from "@/components/onboarding/start-here-card";
import {
  OperationalGuidanceSection,
  type OperationalGuidanceBucket
} from "@/components/operational-guidance-section";
import {
  dashboardGridDividerClassName,
  dashboardCommandStatClassName,
  dashboardCommandSurfaceClassName,
  dashboardMetricCardClassName,
  dashboardPanelActionClassName,
  dashboardPanelClassName,
  dashboardPanelHeaderClassName
} from "@/components/dashboard/dashboard-surface-primitives";

type QuickCreateAction = (formData: FormData) => void | Promise<void>;

type DashboardMetric = {
  key: string;
  label: string;
  value: string;
  detail: string;
  href: string;
};

type DashboardLifecycleStep = {
  key: string;
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: "attention" | "active" | "ready" | "quiet";
};

type DashboardQueueItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  supportingMeta?: string | null;
  href: string;
  actionLabel: string;
  badge?: string | null;
  trailing?: string | null;
  contextHref?: string | null;
  contextLabel?: string | null;
  bridgeHref?: string | null;
  bridgeLabel?: string | null;
  searchText: string;
  workItemId?: string | null;
};

type DashboardWidget = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: DashboardQueueItem[];
};

type MyWorkQueueMode = "company" | "mine" | "unresolved";

type MyWorkQueueModeConfig = {
  mode: MyWorkQueueMode;
  label: string;
  href: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  count: number;
  widgets: DashboardWidget[];
};

type DashboardShortcut = {
  key: string;
  label: string;
  description: string;
  href: string;
  metric?: string;
};

type DashboardOnboardingStep = {
  key: string;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
  complete: boolean;
};

type DashboardPlaceholder = {
  key: string;
  title: string;
  description: string;
  priority: "High";
};

export type ContractorDashboardSurfaceProps = {
  header?: {
    organizationName: string;
    currentRole?: MembershipRole;
    roleLabel: string;
    activeProjectCount: number;
    openReceivablesLabel: string;
  };
  earlyAccess?: {
    isLocked: boolean;
    statusLabel: string;
    href: string;
    setupHref?: string;
    setupMessage?: string;
    setupCtaLabel?: string;
    billingStatusLabel?: string;
  };
  priorityItems: DashboardPriorityItem[];
  universalCapture?: ReactNode;
  metrics: DashboardMetric[];
  actionQueues?: DashboardActionQueue[];
  lifecycleSteps: DashboardLifecycleStep[];
  aiOperationalDigest?: AiOperationalDashboardDigest | null;
  operationalCockpitBuckets?: OperationalGuidanceBucket[];
  attentionWidget?: DashboardWidget | null;
  projectCueWidget?: DashboardWidget | null;
  workItemsWidget?: DashboardWidget | null;
  myWorkWidgets?: DashboardWidget[];
  myWorkQueueModes?: {
    defaultMode: MyWorkQueueMode;
    selectedMode: MyWorkQueueMode;
    caveats: {
      noLinkedPerson: boolean;
      noMineItems: boolean;
      unresolvedItemsPresent: boolean;
    };
    modes: MyWorkQueueModeConfig[];
  };
  commercialWidgets: DashboardWidget[];
  operationsWidgets: DashboardWidget[];
  financeWidgets: DashboardWidget[];
  workItemActions?: {
    complete: QuickCreateAction;
    dismiss: QuickCreateAction;
  };
  onboardingSteps?: DashboardOnboardingStep[];
  startHereForceVisible?: boolean;
  shortcuts: DashboardShortcut[];
  placeholders: DashboardPlaceholder[];
};

const dashboardIconStyle = {
  width: "16px",
  height: "16px",
  flexShrink: 0
} as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="h-4 w-4 text-[var(--text-tertiary)]"
      style={dashboardIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function filterItems(items: DashboardQueueItem[], query: string) {
  if (!query) {
    return items;
  }

  return items.filter((item) => item.searchText.toLowerCase().includes(query));
}

function DashboardOwnershipBanner() {
  const ownershipItems = [
    {
      label: "Owns",
      title: "Prioritization",
      detail:
        "Dashboard surfaces what needs attention now from source records; it does not create separate workflow or action state."
    },
    {
      label: "Act in",
      title: "Owning workspaces",
      detail:
        "Projects diagnose, CrewBoard and Field execute, Financials collects, and Communications handles conversation action."
    },
    {
      label: "Configure in Settings",
      title: "Workflow defaults",
      detail:
        "Tenant preferences, guidance controls, and operational defaults stay out of the dashboard."
    }
  ];

  return (
    <section className={dashboardCommandSurfaceClassName}>
      <div className="grid gap-px overflow-hidden rounded-[7px] bg-white/10 text-xs leading-5 sm:grid-cols-3">
        {ownershipItems.map((item) => {
          const content = (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8fc7ff]">
                {item.label}
              </p>
              <p className="mt-1 font-semibold text-white">{item.title}</p>
              <p className="mt-1 break-words text-slate-300 [overflow-wrap:anywhere]">
                {item.detail}
              </p>
            </>
          );

          return item.label === "Configure in Settings" ? (
            <Link
              key={item.label}
              href="/settings/workflows"
              className="min-w-0 bg-white/[0.055] px-4 py-3 transition hover:bg-white/[0.09]"
            >
              {content}
            </Link>
          ) : (
            <div
              key={item.label}
              className="min-w-0 bg-white/[0.055] px-4 py-3"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BoardPanel({
  eyebrow,
  title,
  description,
  action,
  children
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={dashboardPanelClassName}>
      <div
        className={[
          "flex items-start justify-between gap-3 px-4 py-3",
          dashboardPanelHeaderClassName
        ].join(" ")}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function DashboardEmptyState({
  title,
  description,
  kind = "noRecords"
}: {
  title?: string;
  description?: string;
  kind?: EmptyStateKind;
}) {
  const fallback = getEmptyStateCopy(kind);

  return (
    <div className="px-4 py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {fallback.eyebrow}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
        {title ?? fallback.title}
      </p>
      <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
        {description ?? fallback.description}
      </p>
    </div>
  );
}

function PriorityGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section
      aria-labelledby="dashboard-key-metrics-title"
      className={dashboardPanelClassName}
    >
      <div
        className={[
          "flex items-center justify-between gap-3 px-4 py-3",
          dashboardPanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Key metrics
          </p>
          <h2
            id="dashboard-key-metrics-title"
            className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Pipeline and execution snapshot
          </h2>
        </div>
      </div>
      <div
        className={[dashboardGridDividerClassName, "md:grid-cols-5"].join(" ")}
      >
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className={dashboardMetricCardClassName}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {metric.label}
              </p>
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[var(--copper)] opacity-75 transition group-hover:opacity-100" />
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metric.value}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">
              {metric.detail}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function getLifecycleStepClassName(tone: DashboardLifecycleStep["tone"]) {
  switch (tone) {
    case "attention":
      return "border-[#c7d2e2] bg-[#f8fafc] text-[#0f172a]";
    case "active":
      return "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)]";
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "quiet":
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function LifecycleRail({ steps }: { steps: DashboardLifecycleStep[] }) {
  return (
    <section
      aria-labelledby="dashboard-lifecycle-title"
      className={dashboardPanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-2 px-4 py-3 md:flex-row md:items-end md:justify-between",
          dashboardPanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Canonical lifecycle
          </p>
          <h2
            id="dashboard-lifecycle-title"
            className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Opportunity to payment continuity
          </h2>
        </div>
        <p className="max-w-[54ch] text-xs leading-5 text-[var(--text-secondary)]">
          Every stage links back to the existing manager or workspace queue so
          daily work stays on the shared record chain.
        </p>
      </div>
      <div
        className={[
          dashboardGridDividerClassName,
          "sm:grid-cols-2 lg:grid-cols-5"
        ].join(" ")}
      >
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className={[
              "min-w-0 px-3 py-3 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-inset",
              getLifecycleStepClassName(step.tone)
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                {step.label}
              </p>
              <p className="shrink-0 text-sm font-semibold">{step.value}</p>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5">{step.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QueueRows({
  widget,
  items,
  workItemActions
}: {
  widget: DashboardWidget;
  items: DashboardQueueItem[];
  workItemActions?: ContractorDashboardSurfaceProps["workItemActions"];
}) {
  return (
    <BoardPanel
      eyebrow={widget.eyebrow}
      title={widget.title}
      description={widget.description}
      action={
        <Link href={widget.href} className={dashboardPanelActionClassName}>
          {widget.actionLabel}
        </Link>
      }
    >
      <div className="divide-y divide-[var(--border-warm)]">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.href}
                      aria-label={`${item.actionLabel}: ${item.title}`}
                      className="truncate text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                    >
                      {item.title}
                    </Link>
                    {item.badge ? (
                      <StatusBadge status={item.badge} size="sm">
                        <span className="sr-only">Status or priority: </span>
                        {item.badge}
                      </StatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
                    {item.subtitle}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {item.meta}
                  </p>
                  {item.supportingMeta ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {item.supportingMeta}
                    </p>
                  ) : null}
                </div>
                {item.trailing ? (
                  <p className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">
                    {item.trailing}
                  </p>
                ) : null}
              </div>
              {(item.contextHref && item.contextLabel) || item.bridgeHref ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.contextHref && item.contextLabel ? (
                    <Link
                      href={item.contextHref}
                      title={`${item.contextLabel}: ${item.title}`}
                      className={secondaryActionClassName}
                    >
                      {item.contextLabel}
                    </Link>
                  ) : null}
                  {item.bridgeHref ? (
                    <Link
                      href={item.bridgeHref}
                      title={`${item.bridgeLabel ?? "Create work item"}: ${item.title}`}
                      className={secondaryActionClassName}
                    >
                      {item.bridgeLabel ?? "Create work item"}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {item.workItemId && workItemActions ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={workItemActions.complete}>
                    <input
                      type="hidden"
                      name="workItemId"
                      value={item.workItemId}
                    />
                    <input type="hidden" name="returnTo" value="/dashboard" />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-white"
                    >
                      Complete
                    </button>
                  </form>
                  <form action={workItemActions.dismiss}>
                    <input
                      type="hidden"
                      name="workItemId"
                      value={item.workItemId}
                    />
                    <input type="hidden" name="returnTo" value="/dashboard" />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center border border-[var(--border-warm)] bg-white px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <DashboardEmptyState
            title={widget.emptyTitle}
            description={widget.emptyDescription}
          />
        )}
      </div>
    </BoardPanel>
  );
}

function DashboardOperatingSummary({
  header,
  metrics,
  priorityItems,
  attentionHref
}: {
  header?: ContractorDashboardSurfaceProps["header"];
  metrics: DashboardMetric[];
  priorityItems: DashboardPriorityItem[];
  attentionHref: string;
}) {
  const jobsTodayMetric = metrics.find((metric) => metric.key === "jobs-today");
  const openBlockersCount = priorityItems.filter(
    (item) => !["complete", "paid"].includes(String(item.status))
  ).length;

  const summaryItems = [
    {
      key: "active-projects",
      label: "Active Projects",
      value: String(header?.activeProjectCount ?? "0"),
      detail: "Project chain",
      href: "/projects"
    },
    {
      key: "open-ar",
      label: "Open AR",
      value: header?.openReceivablesLabel ?? "$0.00",
      detail: "Invoice/payment chain",
      href: "/invoices"
    },
    {
      key: "jobs-today",
      label: "Jobs Today",
      value: jobsTodayMetric?.value ?? "0",
      detail: "Schedule and jobs",
      href: jobsTodayMetric?.href ?? "/schedule"
    },
    {
      key: "open-blockers",
      label: "Open Blockers",
      value: String(openBlockersCount),
      detail: "Attention queues",
      href: attentionHref
    }
  ];

  return (
    <section
      aria-labelledby="dashboard-operating-summary-title"
      className={dashboardCommandSurfaceClassName}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fc7ff]">
            Dashboard command metrics
          </p>
          <h2
            id="dashboard-operating-summary-title"
            className="mt-1 text-xl font-semibold tracking-tight text-white"
          >
            Operating health at a glance
          </h2>
        </div>
      </div>
      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={[
              "group min-w-0 transition hover:bg-white/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7ff] focus-visible:ring-inset",
              dashboardCommandStatClassName
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {item.label}
              </p>
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8fc7ff] opacity-80 transition group-hover:opacity-100" />
            </div>
            <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-white">
              {item.value}
            </p>
            <p className="mt-1 text-[11px] leading-4 text-slate-300">
              {item.detail}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DashboardActionQueues({ queues }: { queues: DashboardActionQueue[] }) {
  return (
    <section
      aria-labelledby="dashboard-action-queues-title"
      id="dashboard-action-queues"
      className="space-y-3"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Today's priorities
          </p>
          <h2
            id="dashboard-action-queues-title"
            className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Needs attention now
          </h2>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Dashboard prioritizes; owning workspaces act
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-5">
        {queues.map((queue) => (
          <BoardPanel
            key={queue.key}
            eyebrow="Action queue"
            title={queue.title}
            description={queue.description}
            action={
              <Link href={queue.href} className={dashboardPanelActionClassName}>
                {queue.actionLabel}
              </Link>
            }
          >
            <div className="divide-y divide-[var(--border-warm)]">
              {queue.items.length > 0 ? (
                queue.items.map((item) => (
                  <article key={item.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={item.href}
                        aria-label={`${item.recommendedActionLabel}: ${item.title}`}
                        className="min-w-0 truncate text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                      >
                        {item.title}
                      </Link>
                      {item.badge ? (
                        <StatusBadge status={item.badge} size="sm">
                          {item.badge}
                        </StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {item.subtitle}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      Why: {item.reason}
                    </p>
                    {item.metadata ? (
                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {item.metadata}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={item.href} className={primaryActionClassName}>
                        {item.recommendedActionLabel}
                      </Link>
                      {item.contextHref && item.contextLabel ? (
                        <Link
                          href={item.contextHref}
                          className={secondaryActionClassName}
                        >
                          {item.contextLabel}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <DashboardEmptyState
                  title={queue.emptyTitle}
                  description={queue.emptyDescription}
                />
              )}
            </div>
          </BoardPanel>
        ))}
      </div>
    </section>
  );
}

function UtilityCardGrid({
  metrics,
  operationsWidgets
}: {
  metrics: DashboardMetric[];
  operationsWidgets: DashboardWidget[];
}) {
  const appointmentsMetric = metrics.find(
    (metric) => metric.key === "appointments-today"
  );
  const jobsTodayMetric = metrics.find((metric) => metric.key === "jobs-today");
  const fieldWidget = operationsWidgets[3] ?? operationsWidgets[0] ?? null;

  return (
    <section className="grid gap-3 lg:grid-cols-4">
      <Link href="/schedule" className={dashboardPanelClassName}>
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--copper)]">
            Calendar
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            Today board
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
            Open schedule, jobs, and appointment context from existing routes.
          </p>
        </div>
      </Link>
      <div className={dashboardPanelClassName}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--copper)]">
              Weather
            </p>
            <span className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Preview
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            Not live yet
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
            Weather-aware schedule guidance is display-only in this slice.
          </p>
        </div>
      </div>
      <Link href="/appointments" className={dashboardPanelClassName}>
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--copper)]">
            Appointments
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {appointmentsMetric?.value ?? "0"} today
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
            {appointmentsMetric?.detail ??
              "Existing appointment records surface here when scheduled."}
          </p>
        </div>
      </Link>
      <Link href="/time" className={dashboardPanelClassName}>
        <div className="px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--copper)]">
            Hours
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {jobsTodayMetric?.value ?? "0"} jobs live
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
            Clock-in stays in the existing Time workflow; no dashboard action
            was added.
          </p>
        </div>
      </Link>
      {fieldWidget ? (
        <div className="lg:col-span-4">
          <QueueRows widget={fieldWidget} items={fieldWidget.items} />
        </div>
      ) : null}
    </section>
  );
}

function PipelineCell({
  label,
  value,
  detail,
  href,
  tone
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: "attention" | "active" | "ready" | "quiet";
}) {
  const toneClassName =
    tone === "attention"
      ? "border-[#c7d2e2] bg-[#f8fafc] text-[#0f172a]"
      : tone === "ready"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : tone === "active"
          ? "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)]"
          : "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";

  return (
    <Link
      href={href}
      className={[
        "group flex min-h-[126px] flex-col rounded-[4px] border px-4 py-4 transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]",
        toneClassName
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">
          {label}
        </p>
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--copper)] opacity-50 transition group-hover:opacity-100" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-70">{detail}</p>
    </Link>
  );
}

function StageBars({ cells }: { cells: DashboardLifecycleStep[] }) {
  const maxValue = Math.max(
    1,
    ...cells.map((cell) => {
      const numericValue = Number.parseInt(cell.value.replace(/[^0-9]/g, ""));
      return Number.isFinite(numericValue) ? numericValue : 0;
    })
  );

  return (
    <BoardPanel
      eyebrow="Opportunities"
      title="Pipeline by stage"
      description="Display-only stage bars from the existing lifecycle snapshot, not a separate reporting model."
      action={
        <span className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          Live snapshot
        </span>
      }
    >
      <div className="space-y-3 px-4 py-4">
        {cells.map((cell) => {
          const numericValue = Number.parseInt(
            cell.value.replace(/[^0-9]/g, "")
          );
          const width = `${Math.max(
            8,
            ((Number.isFinite(numericValue) ? numericValue : 0) / maxValue) *
              100
          )}%`;

          return (
            <Link
              key={cell.key}
              href={cell.href}
              className="grid grid-cols-[minmax(96px,0.38fr)_minmax(0,1fr)_auto] items-center gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                  {cell.label}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[var(--text-tertiary)]">
                  {cell.detail}
                </p>
              </div>
              <div className="h-6 overflow-hidden rounded-[4px] bg-[var(--highlight)]">
                <div
                  className="h-full rounded-[4px] bg-[var(--copper)]"
                  style={{ width }}
                />
              </div>
              <p className="w-14 text-right text-sm font-semibold text-[var(--text-primary)]">
                {cell.value}
              </p>
            </Link>
          );
        })}
      </div>
    </BoardPanel>
  );
}

function DashboardV0Sections({
  metrics,
  lifecycleSteps,
  commercialWidgets,
  operationsWidgets,
  financeWidgets,
  projectCueWidget,
  attentionWidget
}: {
  metrics: DashboardMetric[];
  lifecycleSteps: DashboardLifecycleStep[];
  commercialWidgets: DashboardWidget[];
  operationsWidgets: DashboardWidget[];
  financeWidgets: DashboardWidget[];
  projectCueWidget: DashboardWidget | null;
  attentionWidget: DashboardWidget | null;
}) {
  const metricByKey = new Map(metrics.map((metric) => [metric.key, metric]));
  const leadsMetric = metricByKey.get("leads-follow-up");
  const estimatesMetric = metricByKey.get("estimates-awaiting-action");
  const scheduleMetric = metricByKey.get("jobs-needing-schedule");
  const jobsTodayMetric = metricByKey.get("jobs-today");
  const contractsWidget = commercialWidgets.find(
    (widget) => widget.key === "contracts"
  );
  const readyWidget = operationsWidgets.find(
    (widget) => widget.key === "ready-to-schedule-projects"
  );
  const projectsWidget = operationsWidgets.find(
    (widget) => widget.key === "projects"
  );
  const jobsScheduleWidget = operationsWidgets.find(
    (widget) => widget.key === "jobs-needing-schedule"
  );
  const jobsTodayWidget = operationsWidgets.find(
    (widget) => widget.key === "jobs-today"
  );
  const collectionsWidget =
    financeWidgets.find((widget) => widget.key === "unpaid-invoices") ?? null;
  const recentPaymentsWidget =
    financeWidgets.find((widget) => widget.key === "recent-payments") ?? null;

  const revenueCells = [
    {
      label: "Opportunity Follow-ups",
      value: leadsMetric?.value ?? "0",
      detail: leadsMetric?.detail ?? "Existing opportunity follow-up queue",
      href: leadsMetric?.href ?? "/leads",
      tone: "quiet" as const
    },
    {
      label: "Estimates Pending",
      value: estimatesMetric?.value ?? "0",
      detail: estimatesMetric?.detail ?? "Existing estimate queue",
      href: estimatesMetric?.href ?? "/estimates",
      tone: "active" as const
    },
    {
      label: "Awaiting Signature",
      value: String(contractsWidget?.items.length ?? 0),
      detail:
        contractsWidget?.description ??
        "Existing contract send and signature queue",
      href: contractsWidget?.href ?? "/contracts",
      tone:
        (contractsWidget?.items.length ?? 0) > 0
          ? ("attention" as const)
          : ("quiet" as const)
    },
    {
      label: "Won / Not Scheduled",
      value: String(readyWidget?.items.length ?? 0),
      detail:
        readyWidget?.description ??
        "Ready projects that need canonical job creation",
      href: readyWidget?.href ?? "/projects",
      tone:
        (readyWidget?.items.length ?? 0) > 0
          ? ("ready" as const)
          : ("quiet" as const)
    }
  ];

  const productionCells = [
    {
      label: "Ready to Schedule",
      value: String(readyWidget?.items.length ?? 0),
      detail: readyWidget?.description ?? "Ready Check cleared projects",
      href: readyWidget?.href ?? "/schedule",
      tone:
        (readyWidget?.items.length ?? 0) > 0
          ? ("ready" as const)
          : ("quiet" as const)
    },
    {
      label: "Blocked Projects",
      value: String(projectsWidget?.items.length ?? 0),
      detail: projectsWidget?.description ?? "Projects needing attention",
      href: projectsWidget?.href ?? "/projects",
      tone:
        (projectsWidget?.items.length ?? 0) > 0
          ? ("attention" as const)
          : ("quiet" as const)
    },
    {
      label: "Jobs Today",
      value:
        jobsTodayMetric?.value ?? String(jobsTodayWidget?.items.length ?? 0),
      detail: jobsTodayMetric?.detail ?? "Existing jobs today queue",
      href: jobsTodayMetric?.href ?? jobsTodayWidget?.href ?? "/jobs",
      tone:
        (jobsTodayWidget?.items.length ?? 0) > 0
          ? ("active" as const)
          : ("quiet" as const)
    },
    {
      label: "Crew Assignment Gaps",
      value:
        scheduleMetric?.value ?? String(jobsScheduleWidget?.items.length ?? 0),
      detail:
        scheduleMetric?.detail ??
        "Schedule handoffs and crew follow-through from canonical jobs",
      href: scheduleMetric?.href ?? jobsScheduleWidget?.href ?? "/schedule",
      tone:
        (jobsScheduleWidget?.items.length ?? 0) > 0
          ? ("attention" as const)
          : ("quiet" as const)
    }
  ];

  return (
    <section
      aria-labelledby="dashboard-v0-sections-title"
      className="space-y-4"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Operating blocks
        </p>
        <h2
          id="dashboard-v0-sections-title"
          className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Pipeline, production, cash, and field
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BoardPanel
          eyebrow="Revenue pipeline"
          title="Sales and close stage"
          description="Existing commercial records grouped into the v0 pipeline card rhythm."
        >
          <div className="grid grid-cols-2 gap-3 p-4">
            {revenueCells.map((cell) => (
              <PipelineCell key={cell.label} {...cell} />
            ))}
          </div>
        </BoardPanel>

        <BoardPanel
          eyebrow="Production readiness"
          title="Scheduling and execution status"
          description="Readiness and schedule pressure stay derived from canonical projects and jobs."
        >
          <div className="grid grid-cols-2 gap-3 p-4">
            {productionCells.map((cell) => (
              <PipelineCell key={cell.label} {...cell} />
            ))}
          </div>
        </BoardPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StageBars cells={lifecycleSteps} />
        {projectCueWidget ? (
          <QueueRows
            widget={{
              ...projectCueWidget,
              eyebrow: "Quality / Field Notes",
              title: "Open issues and punch items",
              description:
                "Field and quality signals stay on existing project cues, Daily Logs, jobs, and work items. No punchlist-only dashboard model was added.",
              actionLabel: "Open projects"
            }}
            items={projectCueWidget.items}
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {collectionsWidget ? (
          <FinanceTable
            widget={{
              ...collectionsWidget,
              eyebrow: "Collections / AR",
              title: "Receivables and payment status"
            }}
            items={collectionsWidget.items}
          />
        ) : null}
        {jobsTodayWidget ? (
          <QueueRows
            widget={{
              ...jobsTodayWidget,
              eyebrow: "Field activity",
              title: "Today's jobs, logs, and blockers",
              description:
                "Day-of work stays tied to existing jobs, schedule, project, and Daily Log routes."
            }}
            items={jobsTodayWidget.items}
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {projectCueWidget ? (
          <QueueRows
            widget={{
              ...projectCueWidget,
              eyebrow: "Next Move",
              title: "Recommended action",
              description:
                "Recommended action is deterministic and review-first. Drafting or workflow execution still happens only in existing workspaces."
            }}
            items={projectCueWidget.items.slice(0, 3)}
          />
        ) : null}
        {(attentionWidget ?? recentPaymentsWidget) ? (
          <QueueRows
            widget={{
              ...(attentionWidget ?? recentPaymentsWidget!),
              eyebrow: "Recent activity",
              title: "Latest events",
              description:
                attentionWidget?.description ??
                "Recent payment movement from the canonical invoice and payment chain.",
              actionLabel: attentionWidget?.actionLabel ?? "Open payments"
            }}
            items={
              (attentionWidget ?? recentPaymentsWidget)?.items.slice(0, 5) ?? []
            }
          />
        ) : null}
      </div>
    </section>
  );
}

function FinanceTable({
  widget,
  items
}: {
  widget: DashboardWidget;
  items: DashboardQueueItem[];
}) {
  return (
    <BoardPanel
      eyebrow={widget.eyebrow}
      title={widget.title}
      description={widget.description}
      action={
        <Link href={widget.href} className={dashboardPanelActionClassName}>
          {widget.actionLabel}
        </Link>
      }
    >
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            <span>Record</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-[var(--border-warm)]">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {item.badge ?? item.meta}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {item.meta}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.trailing ? (
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {item.trailing}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <DashboardEmptyState
          title={widget.emptyTitle}
          description={widget.emptyDescription}
          kind="waitingOnPayment"
        />
      )}
    </BoardPanel>
  );
}

function AiOperationalDigestPanel({
  digest
}: {
  digest: AiOperationalDashboardDigest;
}) {
  return (
    <section
      aria-labelledby="ai-operational-digest-title"
      className={dashboardPanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start lg:justify-between",
          dashboardPanelHeaderClassName
        ].join(" ")}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            AI Operational Digest
          </p>
          <h2
            id="ai-operational-digest-title"
            className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            What matters now
          </h2>
          <p className="mt-1 max-w-[76ch] text-xs leading-5 text-[var(--text-secondary)]">
            {digest.headlineSummary}
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-[var(--border-warm)] bg-white px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Attention
          </p>
          <p className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {digest.attentionCount}
          </p>
        </div>
      </div>
      <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-5">
        {digest.sections.map((section) => (
          <article key={section.key} className="bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {section.title}
              </h3>
              <span className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {section.items.length}
              </span>
            </div>
            {section.items.length > 0 ? (
              <div className="mt-3 space-y-3">
                {section.items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3 text-sm leading-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={item.href}
                        className="font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                      >
                        {item.title}
                      </Link>
                      <StatusBadge status={item.priority} size="sm">
                        {item.priority}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                      {item.summary}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                      Why: {item.reason}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                      Next: {item.recommendedNextStep}
                    </p>
                    {item.draftActionAvailable ? (
                      <p className="mt-2 rounded-md border border-[var(--border-warm)] bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        Draft available in Project Workspace
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)]">
                <DashboardEmptyState
                  title={section.emptyTitle}
                  description={section.emptyDescription}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContractorDashboardSurface({
  header,
  earlyAccess,
  priorityItems,
  universalCapture,
  metrics,
  actionQueues = [],
  lifecycleSteps,
  aiOperationalDigest,
  operationalCockpitBuckets = [],
  attentionWidget,
  projectCueWidget,
  workItemsWidget,
  myWorkWidgets = [],
  myWorkQueueModes,
  commercialWidgets,
  operationsWidgets,
  financeWidgets,
  workItemActions,
  onboardingSteps,
  startHereForceVisible
}: ContractorDashboardSurfaceProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const hasActionQueues = actionQueues.length > 0;
  const handleQueryChange = (nextValue: string) => {
    startTransition(() => {
      setQuery(nextValue);
    });
  };

  const filteredCommercialWidgets = useMemo(
    () =>
      commercialWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [commercialWidgets, deferredQuery]
  );

  const filteredOperationsWidgets = useMemo(
    () =>
      operationsWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [operationsWidgets, deferredQuery]
  );

  const filteredFinanceWidgets = useMemo(
    () =>
      financeWidgets.map((widget) => ({
        ...widget,
        items: filterItems(widget.items, deferredQuery)
      })),
    [financeWidgets, deferredQuery]
  );
  const selectedMyWorkQueueMode = useMemo(() => {
    if (!myWorkQueueModes) {
      return null;
    }

    return (
      myWorkQueueModes.modes.find(
        (mode) => mode.mode === myWorkQueueModes.selectedMode
      ) ??
      myWorkQueueModes.modes.find(
        (mode) => mode.mode === myWorkQueueModes.defaultMode
      ) ??
      myWorkQueueModes.modes[0] ??
      null
    );
  }, [myWorkQueueModes]);
  const filteredMyWorkWidgets = useMemo(() => {
    const widgets = selectedMyWorkQueueMode?.widgets ?? myWorkWidgets;

    return widgets.map((widget) => ({
      ...widget,
      items: filterItems(widget.items, deferredQuery)
    }));
  }, [myWorkWidgets, selectedMyWorkQueueMode, deferredQuery]);
  const filteredWorkItemsWidget = useMemo(
    () =>
      workItemsWidget
        ? {
            ...workItemsWidget,
            items: filterItems(workItemsWidget.items, deferredQuery)
          }
        : null,
    [workItemsWidget, deferredQuery]
  );
  const filteredProjectCueWidget = useMemo(
    () =>
      projectCueWidget
        ? {
            ...projectCueWidget,
            items: filterItems(projectCueWidget.items, deferredQuery)
          }
        : null,
    [projectCueWidget, deferredQuery]
  );

  return (
    <div className="overflow-x-hidden bg-[var(--cream)]">
      <div className="space-y-4 px-4 py-4 sm:px-6">
        <h1 className="sr-only">Dashboard</h1>

        <DashboardOwnershipBanner />

        <DashboardOperatingSummary
          header={header}
          metrics={metrics}
          priorityItems={priorityItems}
          attentionHref={
            hasActionQueues
              ? "/dashboard#dashboard-action-queues"
              : "/dashboard#dashboard-priority-strip"
          }
        />

        {hasActionQueues ? (
          <DashboardActionQueues queues={actionQueues} />
        ) : null}

        {earlyAccess ? (
          <section
            className={[
              "rounded-lg border px-4 py-4",
              earlyAccess.isLocked
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            ].join(" ")}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p
                  className={[
                    "text-[10px] font-semibold uppercase tracking-[0.18em]",
                    earlyAccess.isLocked ? "text-amber-700" : "text-emerald-700"
                  ].join(" ")}
                >
                  Status: {earlyAccess.statusLabel}
                </p>
                <p
                  className={[
                    "mt-1 text-sm leading-6",
                    earlyAccess.isLocked ? "text-amber-950" : "text-emerald-950"
                  ].join(" ")}
                >
                  {earlyAccess.setupMessage ??
                    (earlyAccess.isLocked
                      ? "You can explore the real system and create records now. External sends and payment processing unlock after activation."
                      : "Account active. Guarded production actions are unlocked for this organization.")}
                </p>
                {earlyAccess.billingStatusLabel ? (
                  <p
                    className={[
                      "mt-1 text-xs font-semibold",
                      earlyAccess.isLocked
                        ? "text-amber-800"
                        : "text-emerald-800"
                    ].join(" ")}
                  >
                    {earlyAccess.billingStatusLabel}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {earlyAccess.setupHref ? (
                  <Link
                    href={earlyAccess.setupHref}
                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[var(--graphite)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--graphite-light)]"
                  >
                    {earlyAccess.setupCtaLabel ?? "Finish setup"}
                  </Link>
                ) : null}
                <Link
                  href={earlyAccess.href}
                  className={[
                    "inline-flex h-9 shrink-0 items-center justify-center rounded-full border bg-white px-4 text-xs font-semibold transition",
                    earlyAccess.isLocked
                      ? "border-amber-300 text-amber-950 hover:bg-amber-100"
                      : "border-emerald-300 text-emerald-950 hover:bg-emerald-100"
                  ].join(" ")}
                >
                  View activation status
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {hasActionQueues ? null : (
          <div id="dashboard-priority-strip">
            <PriorityStrip items={priorityItems} />
          </div>
        )}

        {universalCapture ? universalCapture : null}

        <UtilityCardGrid
          metrics={metrics}
          operationsWidgets={filteredOperationsWidgets}
        />

        <DashboardV0Sections
          metrics={metrics}
          lifecycleSteps={lifecycleSteps}
          commercialWidgets={filteredCommercialWidgets}
          operationsWidgets={filteredOperationsWidgets}
          financeWidgets={filteredFinanceWidgets}
          projectCueWidget={filteredProjectCueWidget}
          attentionWidget={attentionWidget ?? null}
        />

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <LifecycleRail steps={lifecycleSteps} />
          <PriorityGrid metrics={metrics} />
        </div>

        {aiOperationalDigest ? (
          <AiOperationalDigestPanel digest={aiOperationalDigest} />
        ) : null}

        {operationalCockpitBuckets.length > 0 ? (
          <OperationalGuidanceSection
            title="Command Center"
            description="The home board groups current work by decision posture: what needs attention, what is ready to move, what is waiting on a customer or payment, and what needs field follow-through."
            buckets={operationalCockpitBuckets}
          />
        ) : null}

        {filteredProjectCueWidget ? (
          <QueueRows
            widget={filteredProjectCueWidget}
            items={filteredProjectCueWidget.items}
          />
        ) : null}

        {filteredWorkItemsWidget ? (
          <QueueRows
            widget={filteredWorkItemsWidget}
            items={filteredWorkItemsWidget.items}
            workItemActions={workItemActions}
          />
        ) : null}

        {filteredMyWorkWidgets.length > 0 ? (
          <section
            aria-labelledby="dashboard-my-work-title"
            className="space-y-3"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Operational intelligence
                </p>
                <h2
                  id="dashboard-my-work-title"
                  className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
                >
                  My Work
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {selectedMyWorkQueueMode?.description ??
                    "Derived attention items from saved records."}
                </p>
              </div>
              {myWorkQueueModes ? (
                <div
                  aria-label="My Work queue mode"
                  className="inline-flex w-full flex-col gap-1 border border-[var(--border-warm)] bg-white p-1 sm:w-auto sm:flex-row"
                  role="tablist"
                >
                  {myWorkQueueModes.modes.map((mode) => {
                    const selected =
                      mode.mode === selectedMyWorkQueueMode?.mode;

                    return (
                      <a
                        key={mode.mode}
                        href={mode.href}
                        role="tab"
                        aria-selected={selected}
                        aria-controls="dashboard-my-work-queues"
                        className={[
                          "flex h-9 items-center justify-between gap-3 px-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] transition sm:justify-center",
                          selected
                            ? "bg-[var(--graphite)] text-white"
                            : "bg-white text-[var(--text-secondary)] hover:bg-[var(--highlight)]"
                        ].join(" ")}
                      >
                        <span>{mode.label}</span>
                        <span
                          className={[
                            "rounded-sm px-1.5 py-0.5 text-[10px]",
                            selected
                              ? "bg-white/15 text-white"
                              : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                          ].join(" ")}
                        >
                          {mode.count}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
            {myWorkQueueModes?.caveats.noLinkedPerson &&
            selectedMyWorkQueueMode?.mode === "mine" ? (
              <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
                No active People record is linked to your app user yet. Mine can
                still include Next Move suggestions resolved directly to your
                app user, but linking a Person improves responsibility matching.
              </div>
            ) : null}
            {myWorkQueueModes?.caveats.unresolvedItemsPresent &&
            selectedMyWorkQueueMode?.mode === "unresolved" ? (
              <div className="border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-5 text-[var(--text-secondary)]">
                These attention items need a responsible person/default. They
                also remain visible in Company.
              </div>
            ) : null}
            {selectedMyWorkQueueMode?.count === 0 ? (
              <div className="border border-[var(--border-warm)] bg-white px-4 py-5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedMyWorkQueueMode.emptyTitle}
                </p>
                <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">
                  {selectedMyWorkQueueMode.emptyDescription}
                </p>
              </div>
            ) : null}
            {selectedMyWorkQueueMode?.count === 0 ? null : (
              <div
                id="dashboard-my-work-queues"
                className="grid gap-3 xl:grid-cols-4"
              >
                {filteredMyWorkWidgets.map((widget) => (
                  <QueueRows
                    key={widget.key}
                    widget={widget}
                    items={widget.items}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {onboardingSteps &&
        (startHereForceVisible ||
          onboardingSteps.some((step) => !step.complete)) ? (
          <StartHereCard
            steps={onboardingSteps}
            forceVisible={startHereForceVisible}
          />
        ) : null}

        <section
          aria-labelledby="dashboard-work-queues-title"
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Work queues
              </p>
              <h2
                id="dashboard-work-queues-title"
                className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
              >
                Follow up by workflow area
              </h2>
            </div>
            <label className="relative w-full max-w-xl">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) =>
                  handleQueryChange(event.currentTarget.value)
                }
                placeholder="Filter dashboard queues"
                className="h-9 w-full rounded-md border border-[var(--border-warm)] bg-white pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]"
              />
            </label>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.95fr)]">
            {attentionWidget ? (
              <QueueRows
                widget={attentionWidget}
                items={attentionWidget.items}
              />
            ) : null}
            {filteredCommercialWidgets[1] ? (
              <QueueRows
                widget={filteredCommercialWidgets[1]}
                items={filteredCommercialWidgets[1].items}
              />
            ) : null}
            {filteredFinanceWidgets[0] ? (
              <FinanceTable
                widget={filteredFinanceWidgets[0]}
                items={filteredFinanceWidgets[0].items}
              />
            ) : null}
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            {filteredOperationsWidgets[3] ? (
              <QueueRows
                widget={filteredOperationsWidgets[3]}
                items={filteredOperationsWidgets[3].items}
              />
            ) : null}
            {filteredCommercialWidgets[0] ? (
              <QueueRows
                widget={filteredCommercialWidgets[0]}
                items={filteredCommercialWidgets[0].items}
              />
            ) : null}
            {filteredOperationsWidgets[0] ? (
              <QueueRows
                widget={filteredOperationsWidgets[0]}
                items={filteredOperationsWidgets[0].items}
              />
            ) : null}
            {filteredOperationsWidgets[2] ? (
              <QueueRows
                widget={filteredOperationsWidgets[2]}
                items={filteredOperationsWidgets[2].items}
              />
            ) : null}
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-3">
              {filteredCommercialWidgets[2] ? (
                <QueueRows
                  widget={filteredCommercialWidgets[2]}
                  items={filteredCommercialWidgets[2].items}
                />
              ) : null}
            </div>

            <div className="space-y-3">
              {filteredFinanceWidgets[1] ? (
                <FinanceTable
                  widget={filteredFinanceWidgets[1]}
                  items={filteredFinanceWidgets[1].items}
                />
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]">
            {filteredOperationsWidgets[1] ? (
              <QueueRows
                widget={filteredOperationsWidgets[1]}
                items={filteredOperationsWidgets[1].items}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
