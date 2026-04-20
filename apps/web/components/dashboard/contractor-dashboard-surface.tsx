"use client";

import type { ReactNode } from "react";
import { startTransition, useDeferredValue, useState } from "react";
import Link from "next/link";

import { UniversalCreateMenu } from "@/components/universal-create-menu";
import { DashboardCalendarWidget } from "@/components/dashboard/dashboard-calendar-widget";
import { DashboardWeatherWidget } from "@/components/dashboard/dashboard-weather-widget";
import { DashboardAppointmentsWidget } from "@/components/dashboard/dashboard-appointments-widget";
import { DashboardTodosWidget } from "@/components/dashboard/dashboard-todos-widget";
import { DashboardPunchlistsWidget } from "@/components/dashboard/dashboard-punchlists-widget";
import { DashboardUnpaidInvoicesWidget } from "@/components/dashboard/dashboard-unpaid-invoices-widget";

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
      className={`overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Refresh ${title}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[#94a3b8] transition hover:text-[#64748b]"
          >
            <RefreshIcon />
          </button>
          <Link
            href={href}
            className="text-xs font-medium text-[#ea580c] transition hover:text-[#c2410c]"
          >
            View
          </Link>
        </div>
      </div>
      <div className="px-4 pb-4">{children}</div>
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
      <div className="py-6 text-center text-sm text-[#94a3b8]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f1f5f9]">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="block py-2.5 transition first:pt-0 last:pb-0 hover:bg-[#fafafa]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#17243b]">{item.title}</p>
              <p className="mt-0.5 truncate text-[12px] text-[#64748b]">{item.subtitle}</p>
            </div>
            {showValues && item.valueLabel ? (
              <span className="shrink-0 text-[13px] font-semibold text-[#17243b]">
                {item.valueLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
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
      <div className="space-y-2">
        {overviewCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 transition hover:bg-[#f8fafc]"
          >
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#17243b]">{card.label}</p>
              <p className="mt-0.5 text-[11px] text-[#94a3b8]">{card.detail}</p>
            </div>
            <span className="text-lg font-semibold text-[#17243b]">{card.value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex gap-3 border-t border-[#f1f5f9] pt-3">
        <div className="flex-1 rounded-md bg-[#fafafa] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
            Receivables
          </p>
          <p className="mt-1 text-lg font-semibold text-[#17243b]">
            {summary.receivablesLabel}
          </p>
        </div>
        <div className="flex-1 rounded-md bg-[#fafafa] px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
            Active jobs
          </p>
          <p className="mt-1 text-lg font-semibold text-[#17243b]">
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
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
            Worked today
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <p className="text-3xl font-semibold text-[#17243b]">
              {summary.workedTodayLabel}
            </p>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f1f5f9] border-r-[#ea580c] text-[9px] font-semibold uppercase tracking-[0.1em] text-[#ea580c]">
              Live
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-md bg-[#fafafa] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
                Sessions
              </p>
              <p className="mt-1 text-base font-semibold text-[#17243b]">
                {summary.openSessionsLabel}
              </p>
            </div>
            <div className="flex-1 rounded-md bg-[#fafafa] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
                Jobs
              </p>
              <p className="mt-1 text-base font-semibold text-[#17243b]">
                {summary.activeJobsLabel}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
            Who is clocked in
          </p>
          <DashboardList
            items={items}
            emptyMessage="Nobody clocked in."
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
      <div className="border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <h2 className="text-lg font-semibold text-[#17243b]">
              {header.organizationName}
            </h2>
            <span className="hidden text-sm text-[#64748b] lg:inline">|</span>
            <p className="hidden text-sm text-[#64748b] lg:inline">
              Unified workflow
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Role:</span>
              <span className="font-medium text-[#17243b]">{header.roleLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Customers:</span>
              <span className="font-medium text-[#17243b]">{header.customerCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Projects:</span>
              <span className="font-medium text-[#17243b]">{header.projectCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-[#f8fafc]">
        <div className="border-b border-[#e5e7eb] bg-white px-4 py-2.5 sm:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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
                placeholder="Search dashboard..."
                className="h-9 w-full rounded-md border border-[#e5e7eb] bg-[#fafafa] pl-10 pr-4 text-sm text-[#17243b] outline-none placeholder:text-[#94a3b8] focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c]"
              />
            </label>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[#94a3b8] lg:inline">Live</span>
              <button
                type="button"
                aria-label="Grid view"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f1f5f9]"
              >
                <GridIcon />
              </button>
              <button
                type="button"
                aria-label="Filter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f1f5f9]"
              >
                <FilterIcon />
              </button>
              <UniversalCreateMenu
                buttonLabel="Create"
                buttonClassName="inline-flex h-9 items-center rounded-md bg-[#111111] px-4 text-sm font-medium text-white transition hover:bg-[#292929]"
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {/* Top Row: Calendar, Weather, To-Dos, Appointments */}
          <div className="mb-5 grid gap-5 lg:grid-cols-4">
            <DashboardCalendarWidget />
            <DashboardWeatherWidget />
            <DashboardTodosWidget />
            <DashboardAppointmentsWidget />
          </div>

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

          {/* Bottom Row: Punchlists and Unpaid Invoices */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <DashboardPunchlistsWidget />
            <DashboardUnpaidInvoicesWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
