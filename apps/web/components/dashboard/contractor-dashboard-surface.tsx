"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { Customer, MembershipRole } from "@floorconnector/types";
import { getStatusBadgeClassName } from "@floorconnector/ui";

import type { DashboardPriorityItem } from "@/components/dashboard/priority-strip";
import { PriorityStrip } from "@/components/dashboard/priority-strip";
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
  href: string;
  actionLabel: string;
  badge?: string | null;
  trailing?: string | null;
  contextHref?: string | null;
  contextLabel?: string | null;
  searchText: string;
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
  priorityItems: DashboardPriorityItem[];
  metrics: DashboardMetric[];
  attentionWidget?: DashboardWidget | null;
  commercialWidgets: DashboardWidget[];
  operationsWidgets: DashboardWidget[];
  financeWidgets: DashboardWidget[];
  onboardingSteps?: DashboardOnboardingStep[];
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
      className="h-4 w-4 text-[#777777]"
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
      className="inline-flex h-8 items-center gap-2 rounded-md border border-[#d6d6d6] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:bg-[#f8f8f8]"
    >
      <span>{label}</span>
      {metric ? <span className="text-[#666666]">{metric}</span> : null}
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
    <section className="rounded-lg border border-[#d6d6d6] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#d6d6d6] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
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
      className="rounded-lg border border-[#d6d6d6] bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#d6d6d6] px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Key metrics
          </p>
          <h2
            id="dashboard-key-metrics-title"
            className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]"
          >
            Pipeline and execution snapshot
          </h2>
        </div>
      </div>
      <div className="grid gap-px bg-[#d6d6d6] md:grid-cols-5">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="bg-white px-3 py-2.5 transition hover:bg-[#f8f8f8]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {metric.value}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
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
          className="inline-flex items-center border border-[#d6d6d6] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:bg-white"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      <div className="divide-y divide-[#e5e5e5]">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#171717] transition hover:text-brand-700"
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
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.subtitle}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                    {item.meta}
                  </p>
                </div>
                {item.trailing ? (
                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    {item.trailing}
                  </p>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-[#171717]">{widget.emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">{widget.emptyDescription}</p>
          </div>
        )}
      </div>
    </BoardPanel>
  );
}

function OnboardingGuide({ steps }: { steps: DashboardOnboardingStep[] }) {
  const incompleteSteps = steps.filter((step) => !step.complete);
  const nextStep = incompleteSteps[0] ?? null;

  if (!nextStep) {
    return null;
  }

  return (
    <section className="rounded-lg border border-[#d6d6d6] bg-white">
      <div className="flex flex-col gap-4 border-b border-[#d6d6d6] bg-[#f8fafc] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
            Start here
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
            Finish the first setup path
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#4b5563]">
            Create the first customer, project, and estimate from the existing quick-create paths.
            Those records become the canonical chain for contracts, jobs, invoices, and payments.
          </p>
        </div>
        <Link
          href={nextStep.href}
          className="inline-flex items-center justify-center border border-[#d8731f] bg-[#d8731f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#bf6519]"
        >
          {nextStep.actionLabel}
        </Link>
      </div>
      <div className="grid gap-px bg-[#e2e5e9] md:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className="bg-white px-4 py-3 transition hover:bg-[#f8fafc]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#171717]">{step.label}</p>
              <span
                className={[
                  "shrink-0 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  getStatusBadgeClassName(step.complete ? "complete" : "needs_action")
                ].join(" ")}
              >
                {step.complete ? "Done" : "Next step"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">{step.description}</p>
          </Link>
        ))}
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
        <Link
          href={widget.href}
          className="inline-flex items-center border border-[#d6d6d6] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:bg-white"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-[#d6d6d6] bg-[#f7f8fa] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
            <span>Record</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-[#e5e5e5]">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#171717] transition hover:text-brand-700"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      {item.badge ?? item.meta}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                  </div>
                  <div className="text-right">
                    {item.trailing ? (
                      <p className="text-sm font-semibold text-slate-900">{item.trailing}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-5">
          <p className="text-sm font-semibold text-[#171717]">{widget.emptyTitle}</p>
          <p className="mt-2 text-sm leading-5 text-slate-500">{widget.emptyDescription}</p>
        </div>
      )}
    </BoardPanel>
  );
}

export function ContractorDashboardSurface({
  header,
  priorityItems,
  metrics,
  attentionWidget,
  commercialWidgets,
  operationsWidgets,
  financeWidgets,
  onboardingSteps,
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

  const topLinks = [
    shortcuts.find((item) => item.key === "projects"),
    shortcuts.find((item) => item.key === "schedule"),
    shortcuts.find((item) => item.key === "payments"),
    shortcuts.find((item) => item.key === "cost-items-database")
  ].filter(Boolean) as DashboardShortcut[];

  return (
    <div className="-mx-5 bg-[#f4f5f7] sm:-mx-8">
      <section className="border-b border-[#d6d6d6] bg-white px-4 py-3 sm:px-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                Contractor dashboard
              </p>
              <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[#171717]">
                {header.organizationName}
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[#4b5563]">
                Priority decisions, core metrics, and work queues in one contractor surface.
              </p>
            </div>

            <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-3">
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold text-[#171717]">
                  {header.roleLabel}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                  Active projects
                </p>
                <p className="mt-1 text-sm font-semibold text-[#171717]">
                  {header.activeProjectCount}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                  Open receivables
                </p>
                <p className="mt-1 text-sm font-semibold text-[#171717]">
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
                className="h-10 w-full border border-[#d6d6d6] bg-white pl-9 pr-3 text-sm text-[#2a2a2a] outline-none placeholder:text-[#777777] focus:border-[#d8731f]"
              />
            </label>

            <div className="flex flex-wrap gap-1.5">
              <UniversalCreateMenu
                idBase="dashboard-universal-create-menu"
                buttonLabel="Universal create"
                buttonClassName="inline-flex h-10 items-center border border-[#d8731f] bg-[#d8731f] px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf6519]"
                panelClassName="border-[#d6d6d6]"
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
        <PriorityStrip items={priorityItems} />

        <PriorityGrid metrics={metrics} />

        {onboardingSteps && onboardingSteps.some((step) => !step.complete) ? (
          <OnboardingGuide steps={onboardingSteps} />
        ) : null}

        <section aria-labelledby="dashboard-work-queues-title" className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
              Work queues
            </p>
            <h2
              id="dashboard-work-queues-title"
              className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]"
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
