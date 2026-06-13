"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { MembershipRole } from "@floorconnector/types";
import {
  getEmptyStateCopy,
  secondaryActionClassName,
  StatusBadge,
  type EmptyStateKind
} from "@floorconnector/ui";

import type { AiOperationalDashboardDigest } from "@/lib/ai-operational-copilot/dashboard-digest";
import type { DashboardActionQueue } from "@/lib/dashboard/action-queues";
import type { DashboardPriorityItem } from "@/components/dashboard/priority-strip";
import { StartHereCard } from "@/components/onboarding/start-here-card";
import {
  OperationalGuidanceSection,
  type OperationalGuidanceBucket
} from "@/components/operational-guidance-section";
import {
  dashboardGridDividerClassName,
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
type DashboardCommandLens =
  | "today"
  | "attention"
  | "sales"
  | "projects"
  | "field"
  | "money"
  | "follow-ups";

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

type DashboardLensConfig = {
  key: DashboardCommandLens;
  label: string;
  title: string;
  description: string;
  count: number;
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
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#005eb8] opacity-75 transition group-hover:opacity-100" />
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
              "min-w-0 px-3 py-3 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-inset",
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
                      className="truncate text-sm font-semibold text-[var(--text-primary)] transition hover:text-[#005eb8]"
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

function DashboardLensRail({
  lenses,
  selectedLens,
  onSelectLens
}: {
  lenses: DashboardLensConfig[];
  selectedLens: DashboardCommandLens;
  onSelectLens: (lens: DashboardCommandLens) => void;
}) {
  const selectedConfig =
    lenses.find((lens) => lens.key === selectedLens) ?? lenses[0];

  return (
    <aside
      aria-label="Dashboard command lenses"
      className={[
        dashboardPanelClassName,
        "sticky top-3 self-start overflow-hidden"
      ].join(" ")}
    >
      <div className={["px-4 py-3", dashboardPanelHeaderClassName].join(" ")}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
          Command lenses
        </p>
        <h2 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
          {selectedConfig.title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          {selectedConfig.description}
        </p>
      </div>
      <div
        className="flex gap-px overflow-x-auto bg-[var(--border-warm)] p-px lg:block lg:overflow-visible lg:p-0"
        role="tablist"
      >
        {lenses.map((lens) => {
          const selected = lens.key === selectedLens;

          return (
            <button
              key={lens.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="dashboard-command-lens-panel"
              onClick={() => onSelectLens(lens.key)}
              className={[
                "flex min-w-[150px] items-center justify-between gap-3 px-3 py-3 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-inset lg:min-w-0 lg:w-full",
                selected
                  ? "bg-[#09090b] text-white"
                  : "bg-white text-[var(--text-secondary)] hover:bg-[#f7fbff] hover:text-[var(--text-primary)]"
              ].join(" ")}
            >
              <span className="truncate">{lens.label}</span>
              <span
                className={[
                  "shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold",
                  selected
                    ? "bg-white/15 text-white"
                    : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                ].join(" ")}
              >
                {lens.count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function DashboardReferenceCommandCenter({
  header,
  metrics,
  priorityItems,
  actionQueues,
  onboardingSteps,
  startHereForceVisible,
  earlyAccess
}: {
  header?: ContractorDashboardSurfaceProps["header"];
  metrics: DashboardMetric[];
  priorityItems: DashboardPriorityItem[];
  actionQueues: DashboardActionQueue[];
  onboardingSteps?: DashboardOnboardingStep[];
  startHereForceVisible?: boolean;
  earlyAccess?: ContractorDashboardSurfaceProps["earlyAccess"];
}) {
  const jobsTodayMetric = metrics.find((metric) => metric.key === "jobs-today");
  const openBlockersCount = priorityItems.filter(
    (item) => !["complete", "paid"].includes(String(item.status))
  ).length;
  const commandMetrics = [
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
      detail: "Schedule and field execution",
      href: jobsTodayMetric?.href ?? "/schedule"
    },
    {
      key: "needs-attention",
      label: "Needs Attention",
      value: String(openBlockersCount),
      detail: "Highest signal queues",
      href: "#dashboard-attention-rail"
    }
  ];
  const visibleQueues = actionQueues.slice(0, 2);
  const attentionItems = priorityItems.slice(0, 2);
  const showStartHere =
    onboardingSteps &&
    (startHereForceVisible || onboardingSteps.some((step) => !step.complete));

  return (
    <section
      aria-labelledby="dashboard-reference-command-center-title"
      className="border border-[#18181b] bg-[#09090b] text-white shadow-none"
    >
      <div className="px-4 py-4 sm:px-5 lg:px-7 lg:py-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.7fr)_minmax(300px,0.3fr)]">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8fc7ff]">
              Industrial OS V2
            </p>
            <h1
              id="dashboard-reference-command-center-title"
              className="mt-2 max-w-4xl break-words text-[30px] font-semibold leading-[1.05] tracking-tight text-white [overflow-wrap:anywhere] sm:text-[44px]"
            >
              Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
              {header?.organizationName
                ? `${header.organizationName} operating view across sales, production, field, and cash.`
                : "Operating view across sales, production, field, and cash."}{" "}
              Dashboard prioritizes the work; source workspaces remain the place
              where actions execute.
            </p>
            {earlyAccess ? (
              <Link
                href={earlyAccess.href}
                className="mt-3 inline-flex min-h-8 items-center border border-white/15 bg-white/[0.06] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10 sm:hidden"
              >
                {earlyAccess.statusLabel}
              </Link>
            ) : null}
          </div>

          <div className="hidden border border-white/10 bg-white/[0.06] p-4 sm:block xl:min-h-[150px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8fc7ff]">
              Operating posture
            </p>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Role:{" "}
              <span className="font-semibold text-white">
                {header?.roleLabel ?? "Contractor"}
              </span>
            </p>
            {earlyAccess ? (
              <div className="mt-4 border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/70">
                <p className="font-semibold uppercase tracking-[0.16em] text-white">
                  {earlyAccess.statusLabel}
                </p>
                <p className="mt-1">
                  Billing/setup controls stay in the existing early-access
                  routes.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.7fr)_minmax(300px,0.3fr)]">
          <div className="order-2 min-w-0 xl:order-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8fc7ff]">
                  Action lanes
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  Work that needs movement
                </h2>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Source queues only
              </p>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {visibleQueues.length > 0 ? (
                visibleQueues.map((queue) => {
                  const firstItem = queue.items[0] ?? null;

                  return (
                    <article
                      key={queue.key}
                      className="min-w-0 border border-white/10 bg-white/[0.06] p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fc7ff]">
                            {queue.title}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/72">
                            {queue.description}
                          </p>
                        </div>
                        <span className="shrink-0 border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-white">
                          {queue.items.length}
                        </span>
                      </div>
                      {firstItem ? (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <Link
                            href={firstItem.href}
                            className="text-sm font-semibold text-white transition hover:text-[#8fc7ff]"
                          >
                            {firstItem.title}
                          </Link>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/60">
                            {firstItem.subtitle}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/55">
                          {queue.emptyTitle}
                        </p>
                      )}
                      <Link
                        href={queue.href}
                        className="mt-3 inline-flex min-h-8 items-center border border-white/15 bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#0f172a] transition hover:bg-[#eef6ff]"
                      >
                        {queue.actionLabel}
                      </Link>
                    </article>
                  );
                })
              ) : (
                <div className="border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/65">
                  No action lanes were returned by the current dashboard read
                  model.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
              {commandMetrics.map((metric) => (
                <Link
                  key={metric.key}
                  href={metric.href}
                  className="group min-w-0 bg-white px-3 py-3 text-[#0f172a] transition hover:bg-[#eef6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7ff] focus-visible:ring-inset"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#475569]">
                      {metric.label}
                    </p>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#005eb8] opacity-80 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-[#0f172a]">
                    {metric.value}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#64748b]">
                    {metric.detail}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside
            id="dashboard-attention-rail"
            className="order-1 min-w-0 border border-white/10 bg-white p-4 text-[#0f172a] shadow-[inset_4px_0_0_#005eb8] xl:order-2 xl:min-h-[360px]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005eb8]">
              Needs attention
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#0f172a]">
              Highest signal records
            </h2>
            <div className="mt-4 divide-y divide-[#e5e7eb]">
              {attentionItems.length > 0 ? (
                attentionItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="block py-3 transition first:pt-0 last:pb-0 hover:text-[#005eb8]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[#0f172a]">
                        {item.title}
                      </p>
                      <StatusBadge status={item.status} size="sm">
                        {item.countLabel}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#64748b]">
                      {item.detail}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="py-3 text-sm leading-6 text-[#64748b]">
                  No priority records were returned by the current dashboard
                  read model.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {showStartHere ? (
        <div className="border-t border-white/10 bg-[#f4f4f5] p-4 text-[#0f172a] sm:p-6">
          <StartHereCard
            steps={onboardingSteps}
            forceVisible={startHereForceVisible}
          />
        </div>
      ) : null}
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
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
                      className="truncate text-sm font-semibold text-[var(--text-primary)] transition hover:text-[#005eb8]"
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
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
        <div className="shrink-0 rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-right">
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
              <span className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                {section.items.length}
              </span>
            </div>
            {section.items.length > 0 ? (
              <div className="mt-3 space-y-3">
                {section.items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-3 text-sm leading-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={item.href}
                        className="font-semibold text-[var(--text-primary)] transition hover:text-[#005eb8]"
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
                      <p className="mt-2 rounded-[4px] border border-[var(--border-warm)] bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                        Draft available in Project Workspace
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-[4px] border border-dashed border-[var(--border-warm)] bg-[var(--highlight)]">
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
  const [selectedLens, setSelectedLens] =
    useState<DashboardCommandLens>("today");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
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
  const lensConfigs = useMemo<DashboardLensConfig[]>(() => {
    const countItems = (widgets: DashboardWidget[]) =>
      widgets.reduce((total, widget) => total + widget.items.length, 0);
    const jobsTodayWidget = filteredOperationsWidgets.find(
      (widget) => widget.key === "jobs-today"
    );
    const projectsWidget = filteredOperationsWidgets.find(
      (widget) => widget.key === "projects"
    );

    return [
      {
        key: "today",
        label: "Today",
        title: "Today / Needs Attention",
        description:
          "The smallest operating view: current work, active blockers, and near-term movement.",
        count:
          priorityItems.length +
          (jobsTodayWidget?.items.length ?? 0) +
          (filteredProjectCueWidget?.items.length ?? 0)
      },
      {
        key: "attention",
        label: "Needs Attention",
        title: "Exceptions and blockers",
        description:
          "Blocked, overdue, waiting, failed, and review-first items from existing source records.",
        count:
          (attentionWidget?.items.length ?? 0) +
          (filteredProjectCueWidget?.items.length ?? 0) +
          priorityItems.length
      },
      {
        key: "sales",
        label: "Sales",
        title: "Sales command lane",
        description:
          "Opportunity, estimate, contract, and commercial follow-up queues.",
        count: countItems(filteredCommercialWidgets)
      },
      {
        key: "projects",
        label: "Projects",
        title: "Project command lane",
        description:
          "Project readiness, project continuity, and lifecycle movement.",
        count:
          (projectsWidget?.items.length ?? 0) +
          (filteredProjectCueWidget?.items.length ?? 0)
      },
      {
        key: "field",
        label: "Field",
        title: "Field and schedule lane",
        description:
          "Schedule, crew, appointments, and day-of execution handoff.",
        count: countItems(filteredOperationsWidgets)
      },
      {
        key: "money",
        label: "Money",
        title: "Money lane",
        description:
          "Invoices, AR, payments, and collection visibility from the billing chain.",
        count: countItems(filteredFinanceWidgets)
      },
      {
        key: "follow-ups",
        label: "Follow-ups",
        title: "Follow-up lane",
        description:
          "Work Items, My Work, reminders, and assigned follow-through tasks.",
        count:
          (filteredWorkItemsWidget?.items.length ?? 0) +
          countItems(filteredMyWorkWidgets)
      }
    ];
  }, [
    attentionWidget,
    filteredCommercialWidgets,
    filteredFinanceWidgets,
    filteredMyWorkWidgets,
    filteredOperationsWidgets,
    filteredProjectCueWidget,
    filteredWorkItemsWidget,
    priorityItems
  ]);

  return (
    <div className="overflow-x-hidden bg-[#f4f4f5]">
      <div className="space-y-5 px-4 py-4 sm:px-6">
        <h1 className="sr-only">Dashboard</h1>

        <DashboardReferenceCommandCenter
          header={header}
          metrics={metrics}
          priorityItems={priorityItems}
          actionQueues={actionQueues}
          onboardingSteps={onboardingSteps}
          startHereForceVisible={startHereForceVisible}
          earlyAccess={earlyAccess}
        />

        {universalCapture ? universalCapture : null}

        <section className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <DashboardLensRail
            lenses={lensConfigs}
            selectedLens={selectedLens}
            onSelectLens={setSelectedLens}
          />

          <div
            id="dashboard-command-lens-panel"
            role="tabpanel"
            className="min-w-0 space-y-4"
          >
            {selectedLens === "today" ? (
              <section
                aria-labelledby="dashboard-today-lens-title"
                className="space-y-3"
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Today lens
                  </p>
                  <h2
                    id="dashboard-today-lens-title"
                    className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
                  >
                    What needs attention now
                  </h2>
                </div>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  {attentionWidget ? (
                    <QueueRows
                      widget={attentionWidget}
                      items={attentionWidget.items}
                    />
                  ) : null}
                  {filteredOperationsWidgets.find(
                    (widget) => widget.key === "jobs-today"
                  ) ? (
                    <QueueRows
                      widget={
                        filteredOperationsWidgets.find(
                          (widget) => widget.key === "jobs-today"
                        )!
                      }
                      items={
                        filteredOperationsWidgets.find(
                          (widget) => widget.key === "jobs-today"
                        )!.items
                      }
                    />
                  ) : null}
                </div>
                {filteredProjectCueWidget ? (
                  <QueueRows
                    widget={{
                      ...filteredProjectCueWidget,
                      eyebrow: "Next Move",
                      title: "Recommended action",
                      description:
                        "Recommended action is deterministic and review-first. Drafting or workflow execution still happens only in existing workspaces."
                    }}
                    items={filteredProjectCueWidget.items.slice(0, 5)}
                  />
                ) : null}
              </section>
            ) : null}

            {selectedLens === "field" ? (
              <UtilityCardGrid
                metrics={metrics}
                operationsWidgets={filteredOperationsWidgets}
              />
            ) : null}

            {selectedLens === "projects" || selectedLens === "money" ? (
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
                {selectedLens === "projects" ? (
                  <LifecycleRail steps={lifecycleSteps} />
                ) : null}
                {selectedLens === "money" ? (
                  <PriorityGrid metrics={metrics} />
                ) : null}
              </div>
            ) : null}

            {selectedLens === "attention" && aiOperationalDigest ? (
              <AiOperationalDigestPanel digest={aiOperationalDigest} />
            ) : null}

            {selectedLens === "attention" &&
            operationalCockpitBuckets.length > 0 ? (
              <OperationalGuidanceSection
                title="Needs Attention"
                description="Exception-style operating signals from existing dashboard read models, grouped by what needs review before work moves."
                buckets={operationalCockpitBuckets}
              />
            ) : null}

            {(selectedLens === "attention" || selectedLens === "projects") &&
            filteredProjectCueWidget ? (
              <QueueRows
                widget={filteredProjectCueWidget}
                items={filteredProjectCueWidget.items}
              />
            ) : null}

            {selectedLens === "follow-ups" && filteredWorkItemsWidget ? (
              <QueueRows
                widget={filteredWorkItemsWidget}
                items={filteredWorkItemsWidget.items}
                workItemActions={workItemActions}
              />
            ) : null}

            {selectedLens === "follow-ups" &&
            filteredMyWorkWidgets.length > 0 ? (
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
                    No active People record is linked to your app user yet. Mine
                    can still include Next Move suggestions resolved directly to
                    your app user, but linking a Person improves responsibility
                    matching.
                  </div>
                ) : null}
                {myWorkQueueModes?.caveats.unresolvedItemsPresent &&
                selectedMyWorkQueueMode?.mode === "unresolved" ? (
                  <div className="border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-5 text-[var(--text-secondary)]">
                    These attention items need a responsible person/default.
                    They also remain visible in Company.
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

            {["attention", "sales", "projects", "field", "money"].includes(
              selectedLens
            ) ? (
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
                      className="h-9 w-full rounded-[4px] border border-[#cbd5e1] bg-white pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[#005eb8]"
                    />
                  </label>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.95fr)]">
                  {selectedLens === "attention" && attentionWidget ? (
                    <QueueRows
                      widget={attentionWidget}
                      items={attentionWidget.items}
                    />
                  ) : null}
                  {selectedLens === "sales" && filteredCommercialWidgets[1] ? (
                    <QueueRows
                      widget={filteredCommercialWidgets[1]}
                      items={filteredCommercialWidgets[1].items}
                    />
                  ) : null}
                  {selectedLens === "money" && filteredFinanceWidgets[0] ? (
                    <FinanceTable
                      widget={filteredFinanceWidgets[0]}
                      items={filteredFinanceWidgets[0].items}
                    />
                  ) : null}
                </div>

                <div className="grid gap-3 xl:grid-cols-4">
                  {selectedLens === "field" && filteredOperationsWidgets[3] ? (
                    <QueueRows
                      widget={filteredOperationsWidgets[3]}
                      items={filteredOperationsWidgets[3].items}
                    />
                  ) : null}
                  {selectedLens === "sales" && filteredCommercialWidgets[0] ? (
                    <QueueRows
                      widget={filteredCommercialWidgets[0]}
                      items={filteredCommercialWidgets[0].items}
                    />
                  ) : null}
                  {(selectedLens === "field" || selectedLens === "projects") &&
                  filteredOperationsWidgets[0] ? (
                    <QueueRows
                      widget={filteredOperationsWidgets[0]}
                      items={filteredOperationsWidgets[0].items}
                    />
                  ) : null}
                  {selectedLens === "field" && filteredOperationsWidgets[2] ? (
                    <QueueRows
                      widget={filteredOperationsWidgets[2]}
                      items={filteredOperationsWidgets[2].items}
                    />
                  ) : null}
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div className="space-y-3">
                    {selectedLens === "sales" &&
                    filteredCommercialWidgets[2] ? (
                      <QueueRows
                        widget={filteredCommercialWidgets[2]}
                        items={filteredCommercialWidgets[2].items}
                      />
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {selectedLens === "money" && filteredFinanceWidgets[1] ? (
                      <FinanceTable
                        widget={filteredFinanceWidgets[1]}
                        items={filteredFinanceWidgets[1].items}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]">
                  {selectedLens === "projects" &&
                  filteredOperationsWidgets[1] ? (
                    <QueueRows
                      widget={filteredOperationsWidgets[1]}
                      items={filteredOperationsWidgets[1].items}
                    />
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>
        </section>

        <DashboardOwnershipBanner />
      </div>
    </div>
  );
}
