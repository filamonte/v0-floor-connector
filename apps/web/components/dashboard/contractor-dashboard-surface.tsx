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
      className="inline-flex h-8 items-center gap-2 border border-[#cfd6e0] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79] transition hover:bg-[#f8fafc]"
    >
      <span>{label}</span>
      {metric ? <span className="text-[#7a889d]">{metric}</span> : null}
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
    <section className="border border-[#d7dce4] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#dfe4ec] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#17243b]">
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
    <section className="border border-[#d7dce4] bg-white">
      <div className="grid gap-px bg-[#dfe4ec] md:grid-cols-5">
        {metrics.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="bg-white px-3 py-2.5 transition hover:bg-[#f8fafc]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7a889d]">
              {metric.label}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">
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
          className="inline-flex items-center border border-[#cfd6e0] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79] transition hover:bg-white"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      <div className="divide-y divide-[#e7ebf1]">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={item.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#17243b] transition hover:text-brand-700"
                    >
                      {item.title}
                    </Link>
                    {item.badge ? (
                      <span className="border border-[#dde3eb] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.subtitle}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#7a889d]">
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
            <p className="text-sm font-semibold text-[#17243b]">{widget.emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">{widget.emptyDescription}</p>
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
          className="inline-flex items-center border border-[#cfd6e0] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79] transition hover:bg-white"
        >
          {widget.actionLabel}
        </Link>
      }
    >
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-[#dfe4ec] bg-[#f7f8fa] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a889d]">
            <span>Record</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-[#e7ebf1]">
            {items.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="truncate text-sm font-semibold text-[#17243b] transition hover:text-brand-700"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a889d]">
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
          <p className="text-sm font-semibold text-[#17243b]">{widget.emptyTitle}</p>
          <p className="mt-2 text-sm leading-5 text-slate-500">{widget.emptyDescription}</p>
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
    <div className="-mx-5 bg-[#f3eee8] sm:-mx-8">
      <section className="border-b border-[#d7c7b4] bg-[#fbf7f1] px-4 py-3 sm:px-6">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
                Contractor dashboard
              </p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-[#2b2118]">
                {header.organizationName}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#665446]">
                Operational queues and recent records in one working surface.
              </p>
            </div>

            <div className="grid gap-px border border-[#d7dce4] bg-[#d7dce4] sm:grid-cols-3">
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a889d]">
                  Role
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17243b]">
                  {header.roleLabel}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a889d]">
                  Active projects
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17243b]">
                  {header.activeProjectCount}
                </p>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a889d]">
                  Open receivables
                </p>
                <p className="mt-1 text-sm font-semibold text-[#17243b]">
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
                placeholder="Search dashboard queues by project, customer, record, status, or priority"
                className="h-10 w-full border border-[#cfd6e0] bg-white pl-9 pr-3 text-sm text-[#22344d] outline-none placeholder:text-[#8b96a8] focus:border-[#d8731f]"
              />
            </label>

            <div className="flex flex-wrap gap-1.5">
              <UniversalCreateMenu
                buttonLabel="Universal create"
                buttonClassName="inline-flex h-10 items-center border border-[#d8731f] bg-[#d8731f] px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf6519]"
                panelClassName="border-[#cfd6e0]"
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

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.85fr)]">
          {attentionWidget ? (
            <QueueRows widget={attentionWidget} items={attentionWidget.items} />
          ) : null}
          {filteredCommercialWidgets[0] ? (
            <QueueRows
              widget={filteredCommercialWidgets[0]}
              items={filteredCommercialWidgets[0].items}
            />
          ) : null}
          {filteredOperationsWidgets[2] ? (
            <QueueRows
              widget={filteredOperationsWidgets[2]}
              items={filteredOperationsWidgets[2].items}
            />
          ) : null}
          {filteredOperationsWidgets[0] ? (
            <QueueRows
              widget={filteredOperationsWidgets[0]}
              items={filteredOperationsWidgets[0].items}
            />
          ) : null}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-3">
            {filteredCommercialWidgets[1] ? (
              <QueueRows
                widget={filteredCommercialWidgets[1]}
                items={filteredCommercialWidgets[1].items}
              />
            ) : null}
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
          {filteredFinanceWidgets[0] ? (
            <FinanceTable
              widget={filteredFinanceWidgets[0]}
              items={filteredFinanceWidgets[0].items}
            />
          ) : null}
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
