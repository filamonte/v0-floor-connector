"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

// =============================================================================
// ICONS
// =============================================================================

function RefreshIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 0 0-14.7-4M4 13a8 8 0 0 0 14.7 4" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// =============================================================================
// WIDGET CARD WRAPPER
// =============================================================================

function WidgetCard({
  title,
  children,
  onRefresh,
  headerExtra,
  className = ""
}: {
  title: string;
  children: ReactNode;
  onRefresh?: () => void;
  headerExtra?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded border border-neutral-200 bg-white ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <div className="flex items-center gap-2">
          {headerExtra}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              aria-label={`Refresh ${title}`}
            >
              <RefreshIcon />
            </button>
          )}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// =============================================================================
// PLACEHOLDER COMPONENT - For missing features
// =============================================================================

function MissingFeaturePlaceholder({
  name,
  description
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded border-2 border-dashed border-orange-200 bg-orange-50/50 px-4 py-6 text-center">
      <span className="mb-2 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
        Missing Feature
      </span>
      <p className="text-sm font-medium text-neutral-700">{name}</p>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
    </div>
  );
}

// =============================================================================
// CALENDAR WIDGET
// =============================================================================

function CalendarWidget() {
  const [currentDate] = useState(new Date(2026, 3, 15)); // April 2026
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu"];
  const today = 15;
  const highlightedDays = [5, 6, 19];

  // Generate calendar days (simplified)
  const calendarDays = [
    [null, null, null, 1, 2],
    [5, 6, 7, 8, 9],
    [12, 13, 14, 15, 16],
    [19, 20, 21, 22, 23],
    [26, 27, 28, 29, 30],
    [null, null, null, null, null]
  ];

  return (
    <WidgetCard title="" className="p-0">
      <div className="-mt-3 -mx-3">
        <div className="flex items-center justify-between px-3 py-2">
          <button type="button" className="rounded p-1 text-neutral-500 hover:bg-neutral-100">
            <ChevronLeftIcon />
          </button>
          <span className="text-sm font-semibold text-neutral-900">{monthName}</span>
          <button type="button" className="rounded p-1 text-neutral-500 hover:bg-neutral-100">
            <ChevronRightIcon />
          </button>
        </div>
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="text-neutral-500">
              {daysOfWeek.map((day) => (
                <th key={day} className="py-1 font-medium">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarDays.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <td key={dayIndex} className="py-1">
                    {day && (
                      <button
                        type="button"
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs transition ${
                          day === today
                            ? "bg-orange-500 font-semibold text-white"
                            : highlightedDays.includes(day)
                              ? "bg-orange-100 font-medium text-orange-700"
                              : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// TRAINING & SUPPORT WIDGET
// =============================================================================

function TrainingSupportWidget() {
  return (
    <WidgetCard title="Training & Support">
      <div className="space-y-3">
        <Link
          href="/training"
          className="flex items-center gap-3 rounded border border-neutral-100 bg-neutral-50 px-3 py-2 transition hover:border-neutral-200 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-100">
            <CalendarIcon />
          </div>
          <span className="text-sm font-medium text-neutral-900">Schedule a Training</span>
        </Link>
        <Link
          href="/knowledge-base"
          className="flex items-center gap-3 rounded border border-neutral-100 bg-neutral-50 px-3 py-2 transition hover:border-neutral-200 hover:bg-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-100">
            <SearchIcon />
          </div>
          <span className="text-sm font-medium text-neutral-900">Knowledge Base</span>
        </Link>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// UPGRADE WIDGET
// =============================================================================

function UpgradeWidget() {
  return (
    <WidgetCard title="Upgrade: Add More Users/Features">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
          <span className="text-2xl">+</span>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Available: <span className="font-semibold text-neutral-900">9971</span></p>
          <p className="text-sm text-neutral-600">Purchased: <span className="font-semibold text-neutral-900">9999</span></p>
        </div>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// PROJECTS TABLE WIDGET
// =============================================================================

function ProjectsTableWidget() {
  const [activeTab, setActiveTab] = useState<"recent" | "upcoming">("recent");

  const recentProjects = [
    { date: "12/09/2025", project: "Kristian kasa Bolva...", customer: "Kristian Kasa", type: "Commercial E..." },
    { date: "11/26/2025", project: "Grandmothers Gar...", customer: "Chris Mott", type: "-" },
    { date: "11/26/2025", project: "UConn George J. S...", customer: "Marshall Felix (Mar...", type: "Prevailing Wa..." },
    { date: "11/04/2025", project: "Jason Mistretta Ev...", customer: "Jason Mistretta (Su...", type: "Commercial P..." },
    { date: "11/04/2025", project: "Comcast Epoxy sys...", customer: "Brad Miller (One D...", type: "Commercial E..." },
    { date: "11/04/2025", project: "Columbia Office Fl...", customer: "Derek Helie (One ...", type: "-" },
    { date: "10/31/2025", project: "Polish Jeanne Dun...", customer: "Jeanne Dunning (Je...", type: "-" }
  ];

  return (
    <WidgetCard
      title=""
      headerExtra={
        <button type="button" className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
          <RefreshIcon />
        </button>
      }
      className="col-span-full"
    >
      <div className="-mt-3 -mx-3">
        <div className="flex items-center gap-1 border-b border-neutral-100 px-3">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`px-3 py-2 text-sm font-medium transition ${
              activeTab === "recent"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Recent Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-2 text-sm font-medium transition ${
              activeTab === "upcoming"
                ? "border-b-2 border-orange-500 text-orange-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Upcoming Projects
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-neutral-600">
                <th className="px-3 py-2 font-semibold">Completion date</th>
                <th className="px-3 py-2 font-semibold">Project</th>
                <th className="px-3 py-2 font-semibold">Customer</th>
                <th className="px-3 py-2 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project, index) => (
                <tr key={index} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <CalendarIcon />
                      <span>{project.date}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-900">{project.project}</td>
                  <td className="px-3 py-2 text-neutral-600">{project.customer}</td>
                  <td className="px-3 py-2">
                    {project.type !== "-" ? (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700">
                        {project.type}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// OPEN PUNCHLISTS WIDGET
// =============================================================================

function OpenPunchlistsWidget() {
  return (
    <WidgetCard title="Open Punchlists" onRefresh={() => {}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-600">
              <th className="pb-2 pr-3 font-semibold">Date</th>
              <th className="pb-2 pr-3 font-semibold">Project</th>
              <th className="pb-2 font-semibold">Title</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder rows */}
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-neutral-50">
                <td className="py-2 pr-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
                </td>
                <td className="py-2 pr-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
                </td>
                <td className="py-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MissingFeaturePlaceholder
        name="Punchlist System"
        description="Track and manage project punchlists with completion status"
      />
    </WidgetCard>
  );
}

// =============================================================================
// OPEN ESTIMATES WIDGET
// =============================================================================

function OpenEstimatesWidget() {
  const estimates = [
    { id: "6125", name: "Estimating (Desco Professional Builders)", date: "04/08/2026" },
    { id: "6096", name: "Frank E Payeur (Fontaine Bros. Inc.)", date: "03/28/2026" },
    { id: "6091", name: "Aaron Anderson (Orlando Annulli & Sons, Inc.)", date: "04/07/2026" },
    { id: "6090", name: "Nathan Kari (Franklin Transit Management, Inc.)", date: "03/27/2026" }
  ];

  return (
    <WidgetCard title="Open Estimates" onRefresh={() => {}}>
      <div className="space-y-2">
        {estimates.map((estimate) => (
          <Link
            key={estimate.id}
            href={`/estimates/${estimate.id}`}
            className="flex items-center justify-between gap-3 rounded border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs transition hover:border-neutral-200 hover:bg-white"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">{estimate.id}</span>
              <span className="truncate text-neutral-600">{estimate.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-neutral-500">
              <CalendarIcon />
              <span>{estimate.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// WEATHER WIDGET
// =============================================================================

function WeatherWidget() {
  const days = [
    { day: "Sun", temp: "54/38 °F", icon: "sunny" },
    { day: "Mon", temp: "48/32 °F", icon: "cloudy" },
    { day: "Tue", temp: "52/29 °F", icon: "cloudy" },
    { day: "Wed", temp: "55/38 °F", icon: "sunny" },
    { day: "Thu", temp: "63/41 °F", icon: "sunny" },
    { day: "Fri", temp: "62/43 °F", icon: "sunny" },
    { day: "Sat", temp: "???", icon: "unknown" }
  ];

  return (
    <WidgetCard
      title="Next Hour: Clear"
      headerExtra={<ClockIcon />}
    >
      <div className="flex justify-between gap-2">
        {days.map((day) => (
          <div key={day.day} className="flex flex-col items-center text-center">
            <span className="text-[10px] font-medium text-neutral-600">{day.day}</span>
            <div className="my-1 flex h-8 w-8 items-center justify-center text-lg">
              {day.icon === "sunny" && "☀️"}
              {day.icon === "cloudy" && "⛅"}
              {day.icon === "unknown" && "❓"}
            </div>
            <span className="text-[9px] text-neutral-500">{day.temp}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Warming up with a chance of rain Saturday.</p>
    </WidgetCard>
  );
}

// =============================================================================
// TO-DO'S WIDGET
// =============================================================================

function TodosWidget() {
  const todos = [
    { task: "Estimate", assigned: "+1", dueDate: "04/01/2026", priority: "high" },
    { task: "Bids", assigned: "JF", dueDate: "03/27/2026", priority: "medium" },
    { task: "order stain, con...", assigned: "+1", dueDate: "12/08/2025", priority: "high" },
    { task: "call thomas to s...", assigned: "+1", dueDate: "11/24/2025", priority: "high" },
    { task: "review follow up", assigned: null, dueDate: "09/10/2025", priority: "medium" },
    { task: "Training - Cost ...", assigned: null, dueDate: "03/31/2025", priority: "medium" },
    { task: "Review AP doc (...", assigned: "+1", dueDate: "03/07/2025", priority: "high" }
  ];

  return (
    <WidgetCard title="To-Do's" onRefresh={() => {}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-600">
              <th className="pb-2 pr-3 font-semibold">Task</th>
              <th className="pb-2 pr-3 font-semibold">Assigned</th>
              <th className="pb-2 pr-3 font-semibold">Due Date</th>
              <th className="pb-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo, index) => (
              <tr key={index} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="py-2 pr-3 text-neutral-900">{todo.task}</td>
                <td className="py-2 pr-3">
                  {todo.assigned ? (
                    <span className="inline-flex h-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-[10px] font-medium text-orange-700">
                      {todo.assigned}
                    </span>
                  ) : (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100" />
                  )}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <CalendarIcon />
                    <span>{todo.dueDate}</span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500"><AlertIcon /></span>
                    <span className={todo.priority === "high" ? "text-red-500" : "text-orange-400"}>
                      <FlagIcon />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// OPPORTUNITIES STATS WIDGET
// =============================================================================

function OpportunitiesStatsWidget() {
  return (
    <WidgetCard
      title="Opportunities Stats"
      headerExtra={
        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
            <ListViewIcon />
          </button>
          <button type="button" className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
            <GridViewIcon />
          </button>
        </div>
      }
      onRefresh={() => {}}
    >
      <MissingFeaturePlaceholder
        name="Opportunities Statistics"
        description="Bar chart showing lead/opportunity conversion rates and pipeline metrics"
      />
      <div className="mt-3 flex h-32 items-end justify-around gap-2">
        {[40, 60, 80, 50, 90, 70, 45].map((height, i) => (
          <div
            key={i}
            className="w-8 rounded-t bg-neutral-200"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// MY APPOINTMENTS WIDGET
// =============================================================================

function MyAppointmentsWidget() {
  const appointments = [
    { date: "29", day: "Wed", subject: "Eric/Steve", time: "01:00 PM" }
  ];

  return (
    <WidgetCard title="My Appointments" onRefresh={() => {}}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-100 text-neutral-600">
            <th className="pb-2 pr-3 font-semibold">Date</th>
            <th className="pb-2 pr-3 font-semibold">Subject</th>
            <th className="pb-2 font-semibold text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt, index) => (
            <tr key={index} className="border-b border-neutral-50">
              <td className="py-2 pr-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded bg-orange-100 text-orange-700">
                  <span className="text-sm font-bold leading-none">{apt.date}</span>
                  <span className="text-[9px] uppercase">{apt.day}</span>
                </div>
              </td>
              <td className="py-2 pr-3 text-neutral-900">{apt.subject}</td>
              <td className="py-2 text-right">
                <div className="flex items-center justify-end gap-1.5 text-neutral-600">
                  <ClockIcon />
                  <span>{apt.time}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetCard>
  );
}

// =============================================================================
// UNPAID INVOICES WIDGET
// =============================================================================

function UnpaidInvoicesWidget() {
  const invoices = [
    { customer: "Frank E Payeur (Fontaine Bros. Inc.)", dueDate: "04/17/2026", total: "$2,001.72" },
    { customer: "Brian Frank (B.E Frank Construction)", dueDate: "04/17/2026", total: "$41,037.25" },
    { customer: "Kris Larange", dueDate: "04/14/2026", total: "$25,079.87" },
    { customer: "Amanda Clarke (Designer Fur Bengal Catte...", dueDate: "04/14/2026", total: "$8,991.40" },
    { customer: "Jamie Piscopio (J Scope Remodeling)", dueDate: "04/10/2026", total: "$10,567.14" },
    { customer: "Alex Ansaldi (The Andrew Ansaldi Company)", dueDate: "04/17/2026", total: "$12,179.60" },
    { customer: "Michele DeGray (Michele DeGray)", dueDate: "04/03/2026", total: "$6,376.69" },
    { customer: "Derek Helie (One Development & Construc...", dueDate: "03/31/2026", total: "$118,585.84" },
    { customer: "Mary Konefal", dueDate: "03/27/2026", total: "$8,599.22" }
  ];

  return (
    <WidgetCard title="Unpaid Invoices" onRefresh={() => {}}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-600">
              <th className="pb-2 pr-3 font-semibold">Customer</th>
              <th className="pb-2 pr-3 font-semibold">Due Date</th>
              <th className="pb-2 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="max-w-[180px] truncate py-2 pr-3 text-neutral-900">{invoice.customer}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1.5 text-neutral-600">
                    <CalendarIcon />
                    <span>{invoice.dueDate}</span>
                  </div>
                </td>
                <td className="py-2 text-right font-semibold text-neutral-900">{invoice.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetCard>
  );
}

// =============================================================================
// MY HOURS THIS WEEK WIDGET
// =============================================================================

function MyHoursWidget() {
  return (
    <WidgetCard title="My Hours This Week: 0.00 (0.00 Regular, 0.00 OT)" onRefresh={() => {}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <ClockIcon />
            Clock In
            <ExternalLinkIcon />
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100"
            aria-label="Info"
          >
            <AlertIcon />
          </button>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-200 text-neutral-300">
          <ClockIcon />
        </div>
      </div>
      <button
        type="button"
        className="mt-3 rounded border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
      >
        Request Time Off
      </button>
    </WidgetCard>
  );
}

// =============================================================================
// BOTTOM NAVIGATION BAR
// =============================================================================

function BottomNavigationBar() {
  const navItems = [
    { icon: "chat", label: "Messages" },
    { icon: "user", label: "Profile" },
    { icon: "users", label: "Team" },
    { icon: "folder", label: "Files" },
    { icon: "home", label: "Home" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white px-4 py-2">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between">
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={item.label}
            >
              {item.icon === "chat" && <span className="text-lg">💬</span>}
              {item.icon === "user" && <span className="text-lg">👤</span>}
              {item.icon === "users" && <span className="text-lg">👥</span>}
              {item.icon === "folder" && <span className="text-lg">📁</span>}
              {item.icon === "home" && <span className="text-lg">🏠</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search here..."
              className="h-9 w-full rounded border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
          >
            Ask Clark
            <span className="text-neutral-400">💬</span>
          </button>
          <MissingFeaturePlaceholder name="AI Assistant" description="Clark AI chat helper" />
        </div>

        <div className="flex items-center gap-1">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100">
            📅
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100">
            📅
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100">
            🔔
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100">
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOP TOOLBAR
// =============================================================================

function TopToolbar() {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50"
      >
        <CalendarIcon />
      </button>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100">
          <ExternalLinkIcon />
        </button>
        <button type="button" className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100">
          <FlagIcon />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          <PencilIcon />
          Customize
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD SURFACE
// =============================================================================

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

export function ContractorDashboardSurface(_props: ContractorDashboardSurfaceProps) {
  return (
    <div className="pb-20">
      <TopToolbar />

      {/* Main 3-Column Layout */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <div className="space-y-4 lg:col-span-4">
          <CalendarWidget />
          <TrainingSupportWidget />
          <UpgradeWidget />
          <ProjectsTableWidget />
          <OpenPunchlistsWidget />
          <OpenEstimatesWidget />
        </div>

        {/* CENTER COLUMN */}
        <div className="space-y-4 lg:col-span-4">
          <WeatherWidget />
          <TodosWidget />
          <OpportunitiesStatsWidget />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 lg:col-span-4">
          <MyAppointmentsWidget />
          <UnpaidInvoicesWidget />
          <MyHoursWidget />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigationBar />
    </div>
  );
}
