"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import Link from "next/link";

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
      className="h-5 w-5 text-[#51627f]"
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
      className="h-[18px] w-[18px] text-[#32476e]"
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
      className="h-[18px] w-[18px] text-[#32476e]"
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
      className="h-4 w-4 text-[#4d5d78]"
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#d9dee8] bg-[#fbfcfe] transition hover:bg-white"
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
      className={`overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd] ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#e7ebf1] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#17243b]">{title}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Refresh ${title}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
          >
            <RefreshIcon />
          </button>
          <Link
            href={href}
            className="text-xs font-medium text-[#415473] transition hover:text-[#22365d]"
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
      <div className="rounded-[4px] border border-dashed border-[#dde3eb] bg-[#f7f9fb] px-4 py-6 text-sm text-[#64748b]">
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
          className="block rounded-[4px] border border-[#edf0f4] bg-[#f8fafc] px-3.5 py-3 transition hover:border-[#d6dde8] hover:bg-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-[#17243b]">{item.title}</p>
              <p className="mt-1 truncate text-[13px] text-[#64748b]">{item.subtitle}</p>
            </div>
            {showValues && item.valueLabel ? (
              <span className="shrink-0 text-[14px] font-semibold text-[#1e3358]">
                {item.valueLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#75859f]">
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
            className="rounded-[4px] border border-[#edf0f4] bg-[#f8fafc] px-3.5 py-3 transition hover:border-[#d6dde8] hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-medium text-[#18243c]">{card.label}</p>
              <span className="text-[20px] font-semibold text-[#22365d]">{card.value}</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-5 text-[#69798f]">{card.detail}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#e7ebf1] pt-4 sm:grid-cols-2">
        <div className="rounded-[4px] border border-[#edf0f4] bg-[#f8fafc] px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#75859f]">
            Open receivables
          </p>
          <p className="mt-2 text-[22px] font-semibold text-[#1d3157]">
            {summary.receivablesLabel}
          </p>
        </div>
        <div className="rounded-[4px] border border-[#edf0f4] bg-[#f8fafc] px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#75859f]">
            Active jobs
          </p>
          <p className="mt-2 text-[22px] font-semibold text-[#1d3157]">
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
        <div className="rounded-[4px] border border-[#edf0f4] bg-[#f8fafc] px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#75859f]">
            Worked today
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-[36px] font-semibold leading-none text-[#1f335a]">
              {summary.workedTodayLabel}
            </p>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-[#d5e0f5] border-r-[#29426d] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#29426d]">
              Live
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[4px] border border-[#e6ebf2] bg-white px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a8aa3]">
                Open sessions
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#20345a]">
                {summary.openSessionsLabel}
              </p>
            </div>
            <div className="rounded-[4px] border border-[#e6ebf2] bg-white px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7a8aa3]">
                Active jobs
              </p>
              <p className="mt-1 text-[18px] font-semibold text-[#20345a]">
                {summary.activeJobsLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[4px] border border-[#edf0f4] bg-[#fbfcfe] px-3.5 py-3.5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.12em] text-[#75859f]">
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
      <div className="overflow-hidden border-y border-[#d6dbe4] bg-[#eef1f5]">
        <div className="border-b border-[#d9dee8] bg-[#fbfcfe] px-4 py-3 sm:px-6">
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
                className="h-11 w-full rounded-[4px] border border-[#d9dee8] bg-white pl-12 pr-4 text-[15px] text-[#17243b] outline-none placeholder:text-[#8a97ad] focus:border-[#9fb0cb]"
              />
            </label>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 pr-2 text-[11px] text-[#6f7d92] lg:flex">
                <span className="rounded-[4px] border border-[#dde3eb] bg-white px-2 py-1">
                  Live dashboard
                </span>
              </div>
              <SmallIconButton label="Grid view">
                <GridIcon />
              </SmallIconButton>
              <SmallIconButton label="Filter dashboard">
                <FilterIcon />
              </SmallIconButton>
              <Link
                href="/projects"
                className="inline-flex h-11 items-center rounded-[4px] border border-[#d7ddea] bg-[#f4f7fb] px-4 text-[15px] font-medium text-[#233a64] transition hover:bg-white"
              >
                + Create
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
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
