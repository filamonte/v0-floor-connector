import Link from "next/link";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Flag,
  Users,
  FileText,
  DollarSign,
  CloudSun,
  BookOpen,
  ArrowUpRight,
  BarChart3,
  Grid3X3,
  List
} from "lucide-react";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

function WidgetHeader({
  title,
  onRefresh
}: {
  title: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-2.5">
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      <button
        type="button"
        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CalendarWidget() {
  const today = new Date();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  const currentDay = today.getDate();
  const currentDayOfWeek = today.getDay();

  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, today.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
        <button className="rounded p-1 hover:bg-neutral-100">
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        </button>
        <span className="text-sm font-semibold text-neutral-800">
          {month} {year}
        </span>
        <button className="rounded p-1 hover:bg-neutral-100">
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        </button>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-neutral-500">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="mt-1 grid grid-cols-7 gap-0.5 text-center text-xs">
          {days.map((day, i) => (
            <div
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                day === currentDay
                  ? "bg-blue-600 font-semibold text-white"
                  : day
                    ? "text-neutral-700 hover:bg-neutral-100"
                    : ""
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const temps = [54, 48, 52, 55, 63, 62, 55];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-neutral-800">
            Next Hour: Overcast
          </span>
        </div>
        <Clock className="h-3.5 w-3.5 text-neutral-400" />
      </div>
      <div className="px-4 py-3">
        <div className="flex justify-between">
          {days.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-neutral-500">{day}</span>
              <CloudSun className="h-5 w-5 text-amber-400" />
              <span className="text-[10px] font-medium text-neutral-700">
                {temps[i]}°F
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          Warming up with a chance of rain Saturday.
        </p>
      </div>
    </div>
  );
}

function TrainingSupportWidget() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-800">
        Training &amp; Support
      </h3>
      <div className="mt-3 space-y-2">
        <Link
          href="#"
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          Schedule a Training
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <FileText className="h-4 w-4" />
          Knowledge Base
        </Link>
      </div>
      <div className="mt-4 rounded-lg bg-amber-50 p-3">
        <h4 className="text-xs font-semibold text-neutral-700">
          Upgrade: Add More Users/Features
        </h4>
        <div className="mt-2 space-y-1 text-[11px] text-neutral-600">
          <div>Available: 9971</div>
          <div>Purchased: 9999</div>
        </div>
      </div>
    </div>
  );
}

function AppointmentsWidget({
  appointments
}: {
  appointments: Array<{ date: string; subject: string; time: string }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <WidgetHeader title="My Appointments" />
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-3 gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>Date</div>
          <div>Subject</div>
          <div className="text-right">Time</div>
        </div>
        {appointments.length > 0 ? (
          appointments.map((apt, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 flex-col items-center justify-center rounded bg-blue-600 text-white">
                  <span className="text-[10px] font-bold">29</span>
                  <span className="text-[8px]">Wed</span>
                </div>
              </div>
              <div className="flex items-center text-neutral-700">
                {apt.subject}
              </div>
              <div className="flex items-center justify-end gap-1 text-neutral-500">
                <Clock className="h-3 w-3" />
                {apt.time}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-xs text-neutral-500">
            No appointments scheduled
          </div>
        )}
      </div>
    </div>
  );
}

function TodosWidget({
  todos
}: {
  todos: Array<{
    task: string;
    assigned: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
  }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <WidgetHeader title="To-Do's" />
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-[1fr_80px_100px] gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>Task</div>
          <div>Assigned</div>
          <div>Due Date</div>
        </div>
        {todos.map((todo, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_80px_100px] gap-2 px-4 py-2.5 text-xs"
          >
            <div className="truncate text-neutral-700">{todo.task}</div>
            <div className="flex items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                +1
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-neutral-500">
                <Calendar className="h-3 w-3" />
                {todo.dueDate}
              </div>
              <div className="flex items-center gap-1">
                <Clock
                  className={`h-3 w-3 ${todo.priority === "high" ? "text-red-500" : "text-amber-500"}`}
                />
                <Flag
                  className={`h-3 w-3 ${todo.priority === "high" ? "text-red-500" : "text-amber-500"}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsWidget({
  recentProjects,
  upcomingProjects
}: {
  recentProjects: Array<{
    completionDate: string;
    project: string;
    customer: string;
    type: string;
  }>;
  upcomingProjects: Array<{
    completionDate: string;
    project: string;
    customer: string;
    type: string;
  }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
        <div className="flex gap-4">
          <button className="border-b-2 border-blue-600 pb-1 text-sm font-semibold text-blue-600">
            Recent Projects
          </button>
          <button className="pb-1 text-sm font-medium text-neutral-500 hover:text-neutral-700">
            Upcoming Projects
          </button>
        </div>
        <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-4 gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>Completion date</div>
          <div>Project</div>
          <div>Customer</div>
          <div>Type</div>
        </div>
        {recentProjects.map((project, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-1 text-neutral-500">
              <Calendar className="h-3 w-3" />
              {project.completionDate}
            </div>
            <div className="truncate font-medium text-neutral-700">
              {project.project}
            </div>
            <div className="truncate text-neutral-600">{project.customer}</div>
            <div>
              {project.type && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  {project.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesStatsWidget({
  opportunities
}: {
  opportunities: Array<{ name: string; value: number }>;
}) {
  const maxValue = 1000000;
  const yLabels = ["$1M", "$800K", "$600K", "$400K", "$200K", "$0"];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-neutral-800">
          Opportunities Stats
        </h3>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex h-40">
          <div className="flex flex-col justify-between pr-2 text-[10px] text-neutral-400">
            {yLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="relative flex-1 border-l border-neutral-200">
            {yLabels.map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-dashed border-neutral-100"
                style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
              />
            ))}
            <div className="absolute bottom-0 left-4 right-4 flex items-end justify-around gap-2">
              {opportunities.slice(0, 12).map((opp, i) => (
                <div
                  key={i}
                  className="w-2 rounded-t bg-blue-400"
                  style={{
                    height: `${Math.max((opp.value / maxValue) * 100, 2)}%`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PunchlistsWidget({
  punchlists
}: {
  punchlists: Array<{ date: string; project: string; title: string }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <WidgetHeader title="Open Punchlists" />
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-3 gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>Date</div>
          <div>Project</div>
          <div>Title</div>
        </div>
        {punchlists.length > 0 ? (
          punchlists.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-1 text-neutral-500">
                <Calendar className="h-3 w-3" />
                {item.date}
              </div>
              <div className="truncate text-neutral-700">{item.project}</div>
              <div className="truncate text-neutral-600">{item.title}</div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-xs text-neutral-500">
            No open punchlists
          </div>
        )}
      </div>
    </div>
  );
}

function EstimatesWidget({
  estimates
}: {
  estimates: Array<{ id: string; number: string; customer: string; date: string }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <WidgetHeader title="Open Estimates" />
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-3 gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>#</div>
          <div>Customer</div>
          <div>Date</div>
        </div>
        {estimates.map((est, i) => (
          <Link
            key={est.id}
            href={`/estimates/${est.id}`}
            className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs hover:bg-neutral-50"
          >
            <div className="font-medium text-neutral-700">{est.number}</div>
            <div className="truncate text-neutral-600">{est.customer}</div>
            <div className="flex items-center gap-1 text-neutral-500">
              <Calendar className="h-3 w-3" />
              {est.date}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function InvoicesWidget({
  invoices
}: {
  invoices: Array<{
    id: string;
    customer: string;
    dueDate: string;
    total: number;
  }>;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <WidgetHeader title="Unpaid Invoices" />
      <div className="divide-y divide-neutral-100">
        <div className="grid grid-cols-3 gap-2 border-b border-neutral-100 bg-neutral-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          <div>Customer</div>
          <div>Due Date</div>
          <div className="text-right">Total</div>
        </div>
        {invoices.map((inv, i) => (
          <Link
            key={inv.id}
            href={`/invoices/${inv.id}`}
            className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs hover:bg-neutral-50"
          >
            <div className="truncate font-medium text-neutral-700">
              {inv.customer}
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <Calendar className="h-3 w-3" />
              {inv.dueDate}
            </div>
            <div className="text-right font-semibold text-neutral-900">
              ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HoursWidget() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            My Hours This Week: 0:00 (0:00 Regular, 0:00 OT)
          </h3>
        </div>
        <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-4 flex items-center gap-6">
        <Link
          href="/time"
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-neutral-50"
        >
          <Clock className="h-4 w-4" />
          Clock In
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        <button className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
          Request Time Off
        </button>
        <div className="ml-auto">
          <Clock className="h-16 w-16 text-blue-200" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [
    organizationContext,
    opportunities,
    projects,
    estimates,
    contracts,
    jobs,
    invoices
  ] = await Promise.all([
    getActiveOrganizationContext(user.id),
    listOpportunities(),
    listProjects(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  const openEstimates = estimates.filter(
    (e) => e.status === "draft" || e.status === "sent"
  );
  const unpaidInvoices = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "void"
  );

  const recentProjects = projects.slice(0, 7).map((p) => ({
    completionDate: p.createdAt
      ? new Date(p.createdAt).toLocaleDateString()
      : "—",
    project: p.name,
    customer: p.customer?.name ?? "—",
    type: p.projectType ?? ""
  }));

  const opportunitiesData = opportunities.map((o) => ({
    name: o.name,
    value: o.estimatedValue ?? 0
  }));

  const estimatesData = openEstimates.slice(0, 9).map((e) => ({
    id: e.id,
    number: e.referenceNumber ?? "—",
    customer: e.customer?.name ?? "—",
    date: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"
  }));

  const invoicesData = unpaidInvoices.slice(0, 9).map((i) => ({
    id: i.id,
    customer: i.customer?.name ?? "Unknown",
    dueDate: i.dueDate
      ? new Date(i.dueDate).toLocaleDateString()
      : "—",
    total: i.totalAmount ?? 0
  }));

  const todosData = [
    { task: "Estimate", assigned: "JF", dueDate: "03/27/2026", priority: "high" as const },
    { task: "Bids", assigned: "JF", dueDate: "03/27/2026", priority: "medium" as const },
    { task: "order stain, con...", assigned: "+1", dueDate: "12/08/2025", priority: "medium" as const },
    { task: "call thomas to s...", assigned: "+1", dueDate: "11/24/2025", priority: "high" as const },
    { task: "review follow up", assigned: "", dueDate: "09/10/2025", priority: "medium" as const },
    { task: "Training - Cost ...", assigned: "", dueDate: "03/31/2025", priority: "high" as const },
    { task: "Review AP doc (...", assigned: "+1", dueDate: "03/07/2025", priority: "high" as const }
  ];

  const appointmentsData = [
    { date: "Apr 29", subject: "Eric/Steve", time: "01:00 PM" }
  ];

  const punchlistsData = [
    { date: "09/24/2024", project: "Frito lay 1-95 Corri...", title: "Material Check List" }
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Top Row: Calendar, Training, Weather, Appointments */}
      <div className="grid gap-4 lg:grid-cols-4">
        <CalendarWidget />
        <TrainingSupportWidget />
        <WeatherWidget />
        <AppointmentsWidget appointments={appointmentsData} />
      </div>

      {/* Second Row: Projects & Todos */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ProjectsWidget
            recentProjects={recentProjects}
            upcomingProjects={[]}
          />
        </div>
        <div className="lg:col-span-2">
          <TodosWidget todos={todosData} />
        </div>
        <div className="lg:col-span-1">
          <OpportunitiesStatsWidget opportunities={opportunitiesData} />
        </div>
      </div>

      {/* Third Row: Punchlists */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PunchlistsWidget punchlists={punchlistsData} />
      </div>

      {/* Fourth Row: Estimates & Invoices */}
      <div className="grid gap-4 lg:grid-cols-2">
        <EstimatesWidget estimates={estimatesData} />
        <InvoicesWidget invoices={invoicesData} />
      </div>

      {/* Bottom Row: Hours Tracking */}
      <HoursWidget />
    </div>
  );
}
