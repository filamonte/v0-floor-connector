"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import type { Customer, MembershipRole } from "@floorconnector/types";

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
      className="h-4 w-4 text-[#8391a7]"
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
      className="inline-flex h-10 items-center gap-2 border border-[#3d4e41] bg-[#253029] px-3 text-[11px] font-medium text-[#c5d1c8] transition hover:border-[#ef7d32] hover:text-white"
    >
      <span>{label}</span>
      {metric ? <span className="text-[#8a9c8f]">{metric}</span> : null}
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
    <section className="border border-[#e2dcd5] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#e2dcd5] bg-[#f8f6f4] px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
            {eyebrow}
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold text-[#221a14]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-[12px] leading-4 text-[#5f564d]">{description}</p>
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
    <section className="border border-[#e2dcd5] bg-white">
      <div className="grid gap-px bg-[#e2dcd5] md:grid-cols-5">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="bg-white px-3 py-3 transition hover:bg-[#faf8f6]"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
              {metric.label}
            </p>
            <p className="mt-1 text-[22px] font-semibold text-[#221a14]">
              {metric.value}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#5f564d]">
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
          className="inline-flex items-center border border-[#e2dcd5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:text-[#221a14]"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      <div className="divide-y divide-[#f0ebe6]">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="px-4 py-2.5 transition hover:bg-[#faf8f6]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.href}
                      className="truncate text-[13px] font-semibold text-[#221a14] transition hover:text-[#ef7d32]"
                    >
                      {item.title}
                    </Link>
                    {item.badge ? (
                      <span className="bg-[#ef7d32] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] leading-4 text-[#5f564d]">{item.subtitle}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#8a7a6c]">
                    {item.meta}
                  </p>
                </div>
                {item.trailing ? (
                  <p className="shrink-0 text-[13px] font-semibold text-[#221a14]">
                    {item.trailing}
                  </p>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="px-4 py-4">
            <p className="text-[13px] font-semibold text-[#221a14]">{widget.emptyTitle}</p>
            <p className="mt-1.5 text-[12px] leading-5 text-[#5f564d]">{widget.emptyDescription}</p>
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
    <section className="border border-[#e2dcd5] bg-white">
      <div className="flex flex-col gap-4 border-b border-[#e2dcd5] bg-[#2f3d33] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
            Start here
          </p>
          <h3 className="mt-1 text-[16px] font-semibold text-white">
            Finish the first setup path
          </h3>
          <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#c5d1c8]">
            Create the first customer, project, and estimate from the existing quick-create paths.
            Those records become the canonical chain for contracts, jobs, invoices, and payments.
          </p>
        </div>
        <Link
          href={nextStep.href}
          className="inline-flex items-center justify-center bg-[#ef7d32] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d86b28]"
        >
          {nextStep.actionLabel}
        </Link>
      </div>
      <div className="grid gap-px bg-[#e2dcd5] md:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className="bg-white px-4 py-3 transition hover:bg-[#faf8f6]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-[#221a14]">{step.label}</p>
              <span
                className={[
                  "shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  step.complete
                    ? "bg-[#2f6a3e] text-white"
                    : "bg-[#ef7d32] text-white"
                ].join(" ")}
              >
                {step.complete ? "Done" : "Next step"}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-[#5f564d]">{step.description}</p>
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
          className="inline-flex items-center border border-[#e2dcd5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#5f564d] transition hover:border-[#ef7d32] hover:text-[#221a14]"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-[#e2dcd5] bg-[#f8f6f4] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a7a6c]">
            <span>Record</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-[#f0ebe6]">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-2.5 transition hover:bg-[#faf8f6]">
                <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="truncate text-[13px] font-semibold text-[#221a14] transition hover:text-[#ef7d32]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 truncate text-[11px] text-[#5f564d]">{item.subtitle}</p>
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block bg-[#ef7d32] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                      {item.badge ?? item.meta}
                    </span>
                  </div>
                  <div className="text-right">
                    {item.trailing ? (
                      <p className="text-[13px] font-semibold text-[#221a14]">{item.trailing}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <p className="text-[13px] font-semibold text-[#221a14]">{widget.emptyTitle}</p>
          <p className="mt-1.5 text-[12px] leading-5 text-[#5f564d]">{widget.emptyDescription}</p>
        </div>
      )}
    </BoardPanel>
  );
}

export function ContractorDashboardSurface({
  header,
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
    <div className="-mx-5 bg-[#f0ebe6] sm:-mx-8">
      <section className="border-b border-[#e2dcd5] bg-[#2f3d33] px-4 py-4 sm:px-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#ef7d32]">
                Contractor dashboard
              </p>
              <h2 className="mt-1 text-[20px] font-semibold text-white">
                {header.organizationName}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#c5d1c8]">
                Operational queues and recent records in one working surface.
              </p>
            </div>

            <div className="grid gap-px border border-[#3d4e41] bg-[#3d4e41] sm:grid-cols-3">
              <div className="bg-[#2f3d33] px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
                  Role
                </p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {header.roleLabel}
                </p>
              </div>
              <div className="bg-[#2f3d33] px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
                  Active projects
                </p>
                <p className="mt-1 text-[13px] font-semibold text-white">
                  {header.activeProjectCount}
                </p>
              </div>
              <div className="bg-[#2f3d33] px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8a9c8f]">
                  Open receivables
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[#ef7d32]">
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
                className="h-10 w-full border border-[#3d4e41] bg-[#253029] pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-[#8a9c8f] focus:border-[#ef7d32]"
              />
            </label>

            <div className="flex flex-wrap gap-1.5">
              <UniversalCreateMenu
                idBase="dashboard-universal-create-menu"
                buttonLabel="Universal create"
                buttonClassName="inline-flex h-10 items-center bg-[#ef7d32] px-4 text-[12px] font-semibold text-white transition hover:bg-[#d86b28]"
                panelClassName="border-[#e2dcd5]"
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

      <div className="space-y-3 px-4 py-3 sm:px-6">
        <PriorityGrid metrics={metrics} />

        {onboardingSteps && onboardingSteps.some((step) => !step.complete) ? (
          <OnboardingGuide steps={onboardingSteps} />
        ) : null}

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
      </div>
    </div>
  );
}
