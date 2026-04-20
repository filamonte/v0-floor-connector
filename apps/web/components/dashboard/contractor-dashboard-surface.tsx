"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import Link from "next/link";

import { UniversalCreateMenu } from "@/components/universal-create-menu";

export type ContractorDashboardSurfaceItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  searchText: string;
  valueLabel?: string;
};

export type ContractorDashboardSurfaceProps = {
  header: {
    organizationName: string;
    roleLabel: string;
    customerCount: number;
    projectCount: number;
  };
  overviewCards: Array<{
    label: string;
    value: number;
    detail: string;
    href: string;
  }>;
  projectItems: ContractorDashboardSurfaceItem[];
  leadItems: ContractorDashboardSurfaceItem[];
  contractItems: ContractorDashboardSurfaceItem[];
  invoiceItems: ContractorDashboardSurfaceItem[];
  timeItems: ContractorDashboardSurfaceItem[];
  executionItems: ContractorDashboardSurfaceItem[];
  summary: {
    receivablesLabel: string;
    activeJobsLabel: string;
    workedTodayLabel: string;
    openSessionsLabel: string;
  };
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-neutral-500"
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

function GridIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] text-neutral-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="18" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] text-neutral-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16l-6 7v6l-4-2v-4z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-neutral-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 0 0-14.7-4M4 13a8 8 0 0 0 14.7 4" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}

function SmallIconButton({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded border border-neutral-200 bg-neutral-50 transition hover:bg-white"
    >
      {children}
    </button>
  );
}

function DashboardCard({
  title,
  href,
  children,
  className = ""
}: {
  title: string;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded border border-neutral-200 bg-white ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
        <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Refresh ${title}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-neutral-500 transition hover:bg-neutral-100"
          >
            <RefreshIcon />
          </button>
          <Link
            href={href}
            className="text-xs font-medium text-orange-600 transition hover:text-orange-700"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function DashboardList({
  items,
  emptyMessage,
  showValues = false
}: {
  items: ContractorDashboardSurfaceItem[];
  emptyMessage: string;
  showValues?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block rounded border border-neutral-100 bg-neutral-50 px-3.5 py-3 transition hover:border-neutral-200 hover:bg-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-neutral-900">{item.title}</p>
              <p className="mt-1 truncate text-[13px] text-neutral-500">{item.subtitle}</p>
            </div>
            {showValues && item.valueLabel ? (
              <span className="shrink-0 text-[14px] font-semibold text-neutral-900">
                {item.valueLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-orange-600">
            {item.meta}
          </p>
        </Link>
      ))}
    </div>
  );
}

function WorkflowPulse({
  overviewCards,
  summary
}: Pick<ContractorDashboardSurfaceProps, "overviewCards" | "summary">) {
  return (
    <DashboardCard title="Workflow Pulse" href="/projects" className="xl:col-span-4">
      <div className="grid gap-3">
        {overviewCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded border border-neutral-100 bg-neutral-50 px-3.5 py-3 transition hover:border-neutral-200 hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium text-neutral-900">{card.label}</p>
              <span className="text-[20px] font-semibold text-neutral-900">{card.value}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-neutral-500">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
        <div className="rounded border border-neutral-100 bg-neutral-50 px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-orange-600">
            Open receivables
          </p>
          <p className="mt-2 text-[22px] font-semibold text-neutral-900">
            {summary.receivablesLabel}
          </p>
        </div>
        <div className="rounded border border-neutral-100 bg-neutral-50 px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-orange-600">
            Active jobs
          </p>
          <p className="mt-2 text-[22px] font-semibold text-neutral-900">
            {summary.activeJobsLabel}
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}

function MyTimeThisWeek({
  items,
  summary
}: {
  items: ContractorDashboardSurfaceItem[];
  summary: ContractorDashboardSurfaceProps["summary"];
}) {
  return (
    <DashboardCard title="My Time This Week" href="/time" className="xl:col-span-4">
      <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded border border-neutral-100 bg-neutral-50 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-orange-600">
            Worked today
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-[36px] font-semibold leading-none text-neutral-900">
              {summary.workedTodayLabel}
            </p>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-neutral-200 border-r-orange-500 text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-600">
              Live
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded border border-neutral-200 bg-white px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Open sessions
              </p>
              <p className="mt-1 text-[18px] font-semibold text-neutral-900">
                {summary.openSessionsLabel}
              </p>
            </div>
            <div className="rounded border border-neutral-200 bg-white px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                Active jobs
              </p>
              <p className="mt-1 text-[18px] font-semibold text-neutral-900">
                {summary.activeJobsLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded border border-neutral-100 bg-neutral-50 px-3.5 py-3.5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-orange-600">
            Who is clocked in
          </p>
          <DashboardList
            items={items}
            emptyMessage="Nobody is clocked in right now."
          />
        </div>
      </div>
    </DashboardCard>
  );
}

function filterItems(items: ContractorDashboardSurfaceItem[], query: string) {
  if (!query) {
    return items;
  }

  return items.filter((item) => item.searchText.toLowerCase().includes(query));
}

export function ContractorDashboardSurface({
  header,
  overviewCards,
  projectItems,
  leadItems,
  contractItems,
  invoiceItems,
  timeItems,
  executionItems,
  summary
}: ContractorDashboardSurfaceProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredProjects = filterItems(projectItems, deferredQuery);
  const filteredLeads = filterItems(leadItems, deferredQuery);
  const filteredContracts = filterItems(contractItems, deferredQuery);
  const filteredInvoices = filterItems(invoiceItems, deferredQuery);
  const filteredTime = filterItems(timeItems, deferredQuery);
  const filteredExecution = filterItems(executionItems, deferredQuery);

  return (
    <div className="-mx-5 space-y-0 sm:-mx-8">
      <div className="border-y border-neutral-200 bg-neutral-100 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-600">
              Shared job lifecycle
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              {header.organizationName}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              Commercial work, operations, billing, and field execution stay on the same record chain instead of splitting across separate modules.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-neutral-200 bg-white px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Role</p>
              <p className="mt-1 text-[15px] font-semibold text-neutral-900">{header.roleLabel}</p>
            </div>
            <div className="rounded border border-neutral-200 bg-white px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Customers</p>
              <p className="mt-1 text-[15px] font-semibold text-neutral-900">{header.customerCount}</p>
            </div>
            <div className="rounded border border-neutral-200 bg-white px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Projects</p>
              <p className="mt-1 text-[15px] font-semibold text-neutral-900">{header.projectCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y border-neutral-200 bg-neutral-100">
        <div className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
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
                placeholder="Search dashboard activity"
                className="h-11 w-full rounded border border-neutral-200 bg-white pl-12 pr-4 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
              />
            </label>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 pr-2 text-[11px] text-neutral-500 lg:flex">
                <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-orange-600">
                  Live dashboard
                </span>
              </div>
              <SmallIconButton label="Grid view">
                <GridIcon />
              </SmallIconButton>
              <SmallIconButton label="Filter dashboard">
                <FilterIcon />
              </SmallIconButton>
              <UniversalCreateMenu
                buttonLabel="Create"
                buttonClassName="inline-flex h-11 items-center rounded border border-neutral-200 bg-neutral-50 px-4 text-[15px] font-medium text-neutral-900 transition hover:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-5 xl:grid-cols-12">
            <DashboardCard
              title="Projects Needing Attention"
              href="/projects"
              className="min-h-[320px] xl:col-span-3"
            >
              <DashboardList
                items={filteredProjects}
                emptyMessage="No active projects need attention right now."
              />
            </DashboardCard>

            <DashboardCard
              title="Leads / Opportunities To Follow Up"
              href="/leads"
              className="min-h-[320px] xl:col-span-3"
            >
              <DashboardList
                items={filteredLeads}
                emptyMessage="No follow-up is waiting in the pipeline."
              />
            </DashboardCard>

            <DashboardCard
              title="Contracts Awaiting Signature"
              href="/contracts"
              className="min-h-[320px] xl:col-span-3"
            >
              <DashboardList
                items={filteredContracts}
                emptyMessage="No contracts are waiting on signature or countersign."
              />
            </DashboardCard>

            <DashboardCard
              title="Invoices Awaiting Payment"
              href="/invoices"
              className="min-h-[320px] xl:col-span-3"
            >
              <DashboardList
                items={filteredInvoices}
                emptyMessage="No invoices need payment follow-up right now."
                showValues
              />
            </DashboardCard>

            <MyTimeThisWeek items={filteredTime} summary={summary} />

            <DashboardCard
              title="Daily Execution Snapshot"
              href="/daily-logs"
              className="xl:col-span-4"
            >
              <DashboardList
                items={filteredExecution}
                emptyMessage="No recent field activity has been logged yet."
              />
            </DashboardCard>

            <WorkflowPulse overviewCards={overviewCards} summary={summary} />
          </div>
        </div>
      </div>
    </div>
  );
}
