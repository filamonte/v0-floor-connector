"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { Customer, MembershipRole } from "@floorconnector/types";
import { getStatusBadgeClassName } from "@floorconnector/ui";

import type { DashboardPriorityItem } from "@/components/dashboard/priority-strip";
import { PriorityStrip } from "@/components/dashboard/priority-strip";
import { StartHereCard } from "@/components/onboarding/start-here-card";
import { UniversalCreateMenu } from "@/components/universal-create-menu";

type QuickCreateAction = (formData: FormData) => void | Promise<void>;

type DashboardMetric = {
  key: string;
  label: string;
  value: string;
  detail: string;
  href: string;
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

type ProjectOption = {
  id: string;
  name: string;
  customerId?: string | null;
  customerName?: string | null;
  status?: string | null;
};

type OpportunityOption = {
  id: string;
  title: string;
  contactName: string;
  customerName?: string | null;
  jobType?: string | null;
  siteName?: string | null;
  status: string;
};

type ApprovedEstimateOption = {
  id: string;
  referenceNumber: string;
  projectName?: string | null;
};

type ContractOption = {
  id: string;
  projectId: string;
  title: string;
  status: string;
};

type InvoiceOption = {
  id: string;
  projectId: string;
  referenceNumber: string;
  status: string;
};

export type ContractorDashboardSurfaceProps = {
  header: {
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
  metrics: DashboardMetric[];
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
  quickCreate: {
    defaultRetainagePercentage: string;
    customerOptions: Customer[];
    opportunityOptions: OpportunityOption[];
    projectOptions: ProjectOption[];
    approvedEstimateOptions: ApprovedEstimateOption[];
    contractOptions: ContractOption[];
    invoiceOptions: InvoiceOption[];
    preferredContractTemplateId?: string | null;
    requireContractInternalApproval?: boolean;
    actions: {
      lead: QuickCreateAction;
      customer: QuickCreateAction;
      project: QuickCreateAction;
      estimate: QuickCreateAction;
      contract: QuickCreateAction;
      job: QuickCreateAction;
      invoice: QuickCreateAction;
      changeOrder: QuickCreateAction;
    };
  };
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

function TopLink({
  href,
  label,
  metric
}: {
  href: string;
  label: string;
  metric?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-2 rounded-md border border-[var(--border-warm)] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
    >
      <span>{label}</span>
      {metric ? <span className="text-[var(--text-secondary)]">{metric}</span> : null}
    </Link>
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
    <section className="rounded-lg border border-[var(--border-warm)] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-warm)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PriorityGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section
      aria-labelledby="dashboard-key-metrics-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-warm)] px-4 py-3">
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
      <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-5">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="bg-white px-3 py-2.5 transition hover:bg-[var(--highlight)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
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
        <Link
          href={widget.href}
          className="inline-flex items-center border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-white"
        >
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
                      <span
                        className={[
                          "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          getStatusBadgeClassName(item.badge)
                        ].join(" ")}
                      >
                        <span className="sr-only">Status or priority: </span>
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{item.subtitle}</p>
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
                      className="inline-flex h-8 items-center border border-[var(--border-warm)] bg-white px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
                    >
                      {item.contextLabel}
                    </Link>
                  ) : null}
                  {item.bridgeHref ? (
                    <Link
                      href={item.bridgeHref}
                      title={`${item.bridgeLabel ?? "Create work item"}: ${item.title}`}
                      className="inline-flex h-8 items-center border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-white"
                    >
                      {item.bridgeLabel ?? "Create work item"}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {item.workItemId && workItemActions ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={workItemActions.complete}>
                    <input type="hidden" name="workItemId" value={item.workItemId} />
                    <input type="hidden" name="returnTo" value="/dashboard" />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-white"
                    >
                      Complete
                    </button>
                  </form>
                  <form action={workItemActions.dismiss}>
                    <input type="hidden" name="workItemId" value={item.workItemId} />
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
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{widget.emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{widget.emptyDescription}</p>
          </div>
        )}
      </div>
    </BoardPanel>
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
        <Link
          href={widget.href}
          className="inline-flex items-center border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] transition hover:bg-white"
        >
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
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{item.subtitle}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {item.badge ?? item.meta}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.meta}</p>
                  </div>
                  <div className="text-right">
                    {item.trailing ? (
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.trailing}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{widget.emptyTitle}</p>
          <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{widget.emptyDescription}</p>
        </div>
      )}
    </BoardPanel>
  );
}

export function ContractorDashboardSurface({
  header,
  earlyAccess,
  priorityItems,
  metrics,
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
  startHereForceVisible,
  shortcuts
}: ContractorDashboardSurfaceProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

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

  const topLinks = [
    shortcuts.find((item) => item.key === "projects"),
    shortcuts.find((item) => item.key === "schedule"),
    shortcuts.find((item) => item.key === "payments"),
    shortcuts.find((item) => item.key === "cost-items-database")
  ].filter(Boolean) as DashboardShortcut[];

  return (
    <div className="-mx-5 bg-[var(--cream)] sm:-mx-8">
      <section className="border-b border-[var(--border-warm)] bg-white px-4 py-3 sm:px-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Contractor dashboard
              </p>
              <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
                {header.organizationName}
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
                Priority decisions, core metrics, and work queues in one contractor surface.
              </p>
            </div>

            <div className="grid gap-px border border-[var(--border-warm)] bg-[var(--border-warm)] sm:grid-cols-3">
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {header.roleLabel}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Active projects
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {header.activeProjectCount}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Open receivables
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {header.openReceivablesLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  startTransition(() => {
                    setQuery(nextValue);
                  });
                }}
                placeholder="Search dashboard queues by project, customer, estimate, contract, invoice, status, or priority"
                className="h-10 w-full border border-[var(--border-warm)] bg-white pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]"
              />
            </label>

            <div className="flex flex-wrap gap-1.5">
              <UniversalCreateMenu
                idBase="dashboard-universal-create-menu"
                buttonLabel="Universal create"
                buttonClassName="inline-flex h-10 items-center border border-[var(--copper)] bg-[var(--copper)] px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--copper-light)]"
                panelClassName="border-[var(--border-warm)]"
              />
              {topLinks.map((link) => (
                <TopLink
                  key={link.key}
                  href={link.href}
                  label={link.label}
                  metric={link.metric}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4 px-4 py-4 sm:px-6">
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
                      earlyAccess.isLocked ? "text-amber-800" : "text-emerald-800"
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

        <PriorityStrip items={priorityItems} />

        <PriorityGrid metrics={metrics} />

        {filteredProjectCueWidget ? (
          <QueueRows widget={filteredProjectCueWidget} items={filteredProjectCueWidget.items} />
        ) : null}

        {filteredWorkItemsWidget ? (
          <QueueRows
            widget={filteredWorkItemsWidget}
            items={filteredWorkItemsWidget.items}
            workItemActions={workItemActions}
          />
        ) : null}

        {filteredMyWorkWidgets.length > 0 ? (
          <section aria-labelledby="dashboard-my-work-title" className="space-y-3">
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
                    "Derived attention items from canonical records."}
                </p>
              </div>
              {myWorkQueueModes ? (
                <div
                  aria-label="My Work queue mode"
                  className="inline-flex w-full flex-col gap-1 border border-[var(--border-warm)] bg-white p-1 sm:w-auto sm:flex-row"
                  role="tablist"
                >
                  {myWorkQueueModes.modes.map((mode) => {
                    const selected = mode.mode === selectedMyWorkQueueMode?.mode;

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
                            selected ? "bg-white/15 text-white" : "bg-[var(--highlight)] text-[var(--text-secondary)]"
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
                still include cues resolved directly to your app user, but linking a
                Person improves responsibility matching.
              </div>
            ) : null}
            {myWorkQueueModes?.caveats.unresolvedItemsPresent &&
            selectedMyWorkQueueMode?.mode === "unresolved" ? (
              <div className="border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-5 text-[var(--text-secondary)]">
                These attention items need a responsible person/default. They also
                remain visible in Company.
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
              <div id="dashboard-my-work-queues" className="grid gap-3 xl:grid-cols-4">
                {filteredMyWorkWidgets.map((widget) => (
                  <QueueRows key={widget.key} widget={widget} items={widget.items} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {onboardingSteps &&
        (startHereForceVisible || onboardingSteps.some((step) => !step.complete)) ? (
          <StartHereCard steps={onboardingSteps} forceVisible={startHereForceVisible} />
        ) : null}

        <section aria-labelledby="dashboard-work-queues-title" className="space-y-3">
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

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.95fr)]">
          {attentionWidget ? (
            <QueueRows widget={attentionWidget} items={attentionWidget.items} />
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
