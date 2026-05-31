"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock,
  Cloud,
  CloudRain,
  CloudSun,
  DollarSign,
  FileSignature,
  FileText,
  FolderOpen,
  GraduationCap,
  HardHat,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Plus,
  Receipt,
  Search,
  Settings,
  Star,
  Sun,
  TrendingUp,
  UserCircle,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

// ─── Placeholder Data ──────────────────────────────────────────────────────────

const TODAY = "Saturday, May 31, 2025";
const CURRENT_MONTH = "May 2025";

const HEALTH_SUMMARY = [
  { key: "active_projects", label: "Active Projects", value: "14" },
  { key: "open_ar", label: "Open AR", value: "$128,400" },
  { key: "jobs_today", label: "Jobs Today", value: "3" },
  { key: "open_blockers", label: "Open Blockers", value: "2" },
];

// Weather data
const WEATHER = {
  current: {
    temp: "72°F",
    condition: "Partly Cloudy",
    humidity: "45%",
    wind: "8 mph NW",
  },
  hourly: "Clear skies expected. Chance of rain Saturday evening.",
  forecast: [
    { day: "Sun", temp: "68°F", icon: "sun" },
    { day: "Mon", temp: "71°F", icon: "cloud-sun" },
    { day: "Tue", temp: "74°F", icon: "sun" },
    { day: "Wed", temp: "69°F", icon: "cloud" },
    { day: "Thu", temp: "65°F", icon: "rain" },
    { day: "Fri", temp: "67°F", icon: "cloud-sun" },
    { day: "Sat", temp: "70°F", icon: "sun" },
  ],
};

// Calendar data - days with jobs highlighted
const CALENDAR_DAYS = [
  { day: 1, hasJob: false },
  { day: 2, hasJob: false },
  { day: 3, hasJob: true },
  { day: 4, hasJob: false },
  { day: 5, hasJob: true },
  { day: 6, hasJob: true },
  { day: 7, hasJob: false },
  { day: 8, hasJob: true },
  { day: 9, hasJob: false },
  { day: 10, hasJob: false },
  { day: 11, hasJob: true },
  { day: 12, hasJob: false },
  { day: 13, hasJob: true },
  { day: 14, hasJob: false },
  { day: 15, hasJob: true },
  { day: 16, hasJob: false },
  { day: 17, hasJob: false },
  { day: 18, hasJob: true },
  { day: 19, hasJob: false },
  { day: 20, hasJob: true },
  { day: 21, hasJob: false },
  { day: 22, hasJob: false },
  { day: 23, hasJob: true },
  { day: 24, hasJob: false },
  { day: 25, hasJob: false },
  { day: 26, hasJob: true },
  { day: 27, hasJob: false },
  { day: 28, hasJob: true },
  { day: 29, hasJob: false },
  { day: 30, hasJob: true },
  { day: 31, hasJob: true }, // Today
];

// Appointments
const APPOINTMENTS = [
  { id: "apt1", date: "May 31", subject: "Site walkthrough - Metro Distribution", time: "10:00 AM" },
  { id: "apt2", date: "Jun 2", subject: "Estimate presentation - Apex Corp", time: "2:00 PM" },
  { id: "apt3", date: "Jun 4", subject: "Weekly crew meeting", time: "7:00 AM" },
];

// Time tracking
const TIME_TRACKING = {
  hoursThisWeek: 38.5,
  regularHours: 38.5,
  overtimeHours: 0,
  clockedIn: false,
  lastPunch: "Yesterday, 5:32 PM",
};

// Open punchlists
const OPEN_PUNCHLISTS = [
  { id: "pl1", date: "05/28/2025", project: "Metro Distribution Center", title: "Touch-up required in Zone C", href: "/punchlists/pl-001" },
  { id: "pl2", date: "05/26/2025", project: "Summit Retail Group", title: "Edge sealing incomplete", href: "/punchlists/pl-002" },
  { id: "pl3", date: "05/24/2025", project: "Valley Cold Storage", title: "Floor marking not to spec", href: "/punchlists/pl-003" },
];

// Opportunities stats for chart
const OPPORTUNITY_STATS = [
  { stage: "New Leads", count: 6, value: 85000 },
  { stage: "Qualified", count: 4, value: 124000 },
  { stage: "Estimate Sent", count: 9, value: 284000 },
  { stage: "Negotiating", count: 3, value: 96500 },
  { stage: "Won", count: 4, value: 152000 },
];

const PRIORITIES = [
  {
    id: "p1",
    type: "signature",
    urgency: "critical",
    title: "Contract awaiting signature",
    detail: "Greenfield Industrial — $42,500 epoxy coat contract sent 4 days ago",
    href: "/contracts",
    action: "Review contract",
  },
  {
    id: "p2",
    type: "overdue_invoice",
    urgency: "critical",
    title: "Invoice 12 days overdue",
    detail: "Anderson Commercial Properties — INV-2025-0118 · $18,750",
    href: "/invoices",
    action: "Send reminder",
  },
  {
    id: "p3",
    type: "schedule",
    urgency: "high",
    title: "Project ready to schedule",
    detail: "Riverfront Warehouse — contract signed, no jobs created yet",
    href: "/projects",
    action: "Schedule job",
  },
  {
    id: "p4",
    type: "blocker",
    urgency: "high",
    title: "Open field blocker",
    detail: "Metro Distribution Center — moisture reading exceeds spec, day 2",
    href: "/field/work-items",
    action: "View blocker",
  },
  {
    id: "p5",
    type: "estimate_followup",
    urgency: "normal",
    title: "Estimate follow-up due",
    detail: "Sunrise Logistics — EST-2025-0211 sent 7 days ago, no response",
    href: "/estimates",
    action: "Follow up",
  },
];

const REVENUE_PIPELINE = [
  { key: "new_leads", label: "New Leads", value: "6", detail: "This week", href: "/leads", tone: "quiet" },
  { key: "estimates_pending", label: "Estimates Pending", value: "9", detail: "$284,000 in scope", href: "/estimates", tone: "active" },
  { key: "contracts_awaiting", label: "Awaiting Signature", value: "3", detail: "$96,500 at risk", href: "/contracts", tone: "attention" },
  { key: "won_unscheduled", label: "Won — Not Scheduled", value: "4", detail: "$152,000 won work", href: "/projects", tone: "ready" },
];

const PRODUCTION = [
  { key: "ready_to_schedule", label: "Ready to Schedule", value: "4", detail: "Projects cleared for job creation", href: "/projects", tone: "ready" },
  { key: "blocked", label: "Blocked Projects", value: "2", detail: "Waiting on spec, material, or access", href: "/field/work-items", tone: "attention" },
  { key: "jobs_today", label: "Jobs Today", value: "3", detail: "1 in-progress, 2 starting 7 AM", href: "/jobs", tone: "active" },
  { key: "crew_gaps", label: "Crew Assignment Gaps", value: "1", detail: "Scheduled job missing crew", href: "/crew-schedule", tone: "attention" },
];

const OVERDUE_INVOICES = [
  { id: "inv1", customer: "Anderson Commercial", number: "INV-2025-0118", amount: "$18,750", daysOverdue: 12, href: "/invoices/inv-118" },
  { id: "inv2", customer: "Valley Cold Storage", number: "INV-2025-0102", amount: "$7,200", daysOverdue: 5, href: "/invoices/inv-102" },
  { id: "inv3", customer: "Summit Retail Group", number: "INV-2025-0094", amount: "$31,000", daysOverdue: 19, href: "/invoices/inv-094" },
];

const PENDING_PAYMENTS = [
  { id: "pay1", customer: "Greenfield Industrial", description: "Deposit due", amount: "$12,750", href: "/invoices/inv-201" },
  { id: "pay2", customer: "Riverfront Warehouse", description: "Progress billing #2", amount: "$24,000", href: "/invoices/inv-197" },
];

const RECENT_PAYMENTS = [
  { id: "rp1", customer: "Metro Distribution", description: "Final payment received", amount: "$48,000", date: "May 28" },
  { id: "rp2", customer: "East Side Auto Group", description: "Deposit collected", amount: "$6,500", date: "May 27" },
];

const TOTAL_OPEN_AR = "$128,400";

const TODAYS_JOBS = [
  {
    id: "j1",
    title: "Metro Distribution Center — Phase 2 Epoxy",
    status: "in_progress",
    crew: "Crew A (4 members)",
    start: "7:00 AM",
    href: "/jobs/j-001",
  },
  {
    id: "j2",
    title: "Sunrise Logistics — Surface Prep",
    status: "scheduled",
    crew: "Crew B (3 members)",
    start: "7:00 AM",
    href: "/jobs/j-002",
  },
  {
    id: "j3",
    title: "Valley Cold Storage — Top Coat",
    status: "scheduled",
    crew: "Unassigned",
    start: "9:00 AM",
    href: "/jobs/j-003",
  },
];

const OPEN_DAILY_LOGS = [
  { id: "dl1", title: "Metro Distribution Center", date: "May 30 — not submitted", href: "/daily-logs/dl-001" },
  { id: "dl2", title: "Summit Retail Group", date: "May 29 — not submitted", href: "/daily-logs/dl-002" },
];

const FIELD_BLOCKERS = [
  {
    id: "fb1",
    title: "Moisture reading exceeds spec",
    project: "Metro Distribution Center",
    day: "Day 2",
    href: "/field/work-items/fb-001",
  },
];

const NEXT_MOVE = {
  reason:
    "The Greenfield Industrial contract has been open for 4 days without a signature. At $42,500, it is your largest pending close this week. A follow-up message increases close probability.",
  primaryCta: { label: "Draft signature reminder", href: "/contracts" },
  secondaryCta: { label: "View contract", href: "/contracts" },
};

const RECENT_ACTIVITY = [
  {
    id: "ra1",
    type: "contract_signed",
    title: "Contract signed",
    detail: "Riverfront Warehouse — $62,000 accepted",
    time: "1 hour ago",
    href: "/contracts",
  },
  {
    id: "ra2",
    type: "payment",
    title: "Payment recorded",
    detail: "Metro Distribution Center — $48,000 final",
    time: "3 hours ago",
    href: "/payments",
  },
  {
    id: "ra3",
    type: "job_scheduled",
    title: "Job scheduled",
    detail: "Valley Cold Storage — Top Coat, Jun 2",
    time: "Yesterday",
    href: "/jobs",
  },
  {
    id: "ra4",
    type: "field_note",
    title: "Field note added",
    detail: "Metro Distribution Center — moisture blocker flagged",
    time: "Yesterday",
    href: "/field/work-items",
  },
  {
    id: "ra5",
    type: "invoice_sent",
    title: "Invoice sent",
    detail: "East Side Auto Group — INV-2025-0221 · $14,200",
    time: "2 days ago",
    href: "/invoices",
  },
];

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "Leads", href: "/leads", active: false },
  { label: "Estimates", href: "/estimates", active: false },
  { label: "Contracts", href: "/contracts", active: false },
  { label: "Projects", href: "/projects", active: false },
  { label: "Jobs", href: "/jobs", active: false },
  { label: "Invoices", href: "/invoices", active: false },
  { label: "Field", href: "/field/work-items", active: false },
];

// Starred/favorite quick links
const STARRED_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "Time Cards", href: "/time-cards" },
  { label: "Directory", href: "/directory" },
];

// Mega menu structure (like CF)
const MEGA_MENU = {
  "Project Management": [
    { label: "Projects", href: "/projects", starred: true },
    { label: "Daily Logs", href: "/daily-logs" },
    { label: "Schedule", href: "/schedule" },
    { label: "To-Do's", href: "/todos" },
    { label: "Work Orders", href: "/work-orders" },
    { label: "Inspections", href: "/inspections" },
    { label: "Punchlists", href: "/punchlists" },
    { label: "Service Tickets", href: "/service-tickets" },
    { label: "Permits", href: "/permits" },
  ],
  "Financials": [
    { label: "Estimates", href: "/estimates" },
    { label: "Bid Manager", href: "/bids" },
    { label: "Change Orders", href: "/change-orders" },
    { label: "Invoices", href: "/invoices" },
    { label: "Payments", href: "/payments" },
    { label: "Expenses", href: "/expenses" },
    { label: "Purchase Orders", href: "/purchase-orders" },
    { label: "Sub-Contracts", href: "/sub-contracts" },
    { label: "Bills", href: "/bills" },
    { label: "Transaction Log", href: "/transaction-log" },
  ],
  "People": [
    { label: "Directory", href: "/directory", starred: true },
    { label: "Opportunities", href: "/opportunities" },
    { label: "Time Cards", href: "/time-cards", starred: true },
    { label: "Leads", href: "/leads" },
    { label: "Calendar", href: "/calendar" },
    { label: "Crew Schedule", href: "/crew-schedule" },
    { label: "Incidents", href: "/incidents" },
    { label: "Safety Meetings", href: "/safety-meetings" },
  ],
  "Documents": [
    { label: "Files & Photos", href: "/files" },
    { label: "Reports", href: "/reports" },
    { label: "Forms & Checklists", href: "/forms" },
    { label: "RFI & Notices", href: "/rfi" },
    { label: "Submittals", href: "/submittals" },
    { label: "Vehicle Logs", href: "/vehicle-logs" },
    { label: "Equipment Logs", href: "/equipment-logs" },
    { label: "Notes", href: "/notes" },
  ],
  "Settings & Support": [
    { label: "Enable/Disable Features", href: "/settings/features" },
    { label: "Settings", href: "/settings" },
    { label: "Cost Items Database", href: "/cost-items" },
    { label: "Trainings", href: "/trainings" },
    { label: "Support", href: "/support" },
  ],
};

// User profile data
const USER_PROFILE = {
  name: "John Doe",
  userId: "5606120",
  initials: "JD",
  lastLogin: "05/31 09:03 AM",
};

// Company info
const COMPANY_INFO = {
  name: "FloorConnector Inc",
};

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function urgencyBadgeClass(urgency: string) {
  if (urgency === "critical")
    return "bg-red-50 text-red-700 border border-red-200";
  if (urgency === "high")
    return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-[var(--border-warm)] text-[var(--text-secondary)] border border-[var(--border-medium)]";
}

function tonePipelineClass(tone: string) {
  if (tone === "attention") return "bg-amber-50 border-amber-200 text-amber-950";
  if (tone === "ready") return "bg-emerald-50 border-emerald-200 text-emerald-950";
  if (tone === "active") return "bg-[var(--highlight)] border-[var(--border-warm)] text-[var(--text-primary)]";
  return "bg-white border-[var(--border-warm)] text-[var(--text-secondary)]";
}

function activityIconClass(type: string) {
  switch (type) {
    case "contract_signed": return { bg: "bg-emerald-100", color: "text-emerald-700" };
    case "payment": return { bg: "bg-blue-50", color: "text-blue-700" };
    case "job_scheduled": return { bg: "bg-[var(--highlight)]", color: "text-[var(--graphite)]" };
    case "field_note": return { bg: "bg-amber-50", color: "text-amber-700" };
    case "invoice_sent": return { bg: "bg-slate-100", color: "text-slate-600" };
    default: return { bg: "bg-[var(--highlight)]", color: "text-[var(--text-secondary)]" };
  }
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "contract_signed": return <FileSignature className="w-3.5 h-3.5" />;
    case "payment": return <DollarSign className="w-3.5 h-3.5" />;
    case "job_scheduled": return <Calendar className="w-3.5 h-3.5" />;
    case "field_note": return <MessageSquare className="w-3.5 h-3.5" />;
    case "invoice_sent": return <FileText className="w-3.5 h-3.5" />;
    default: return <Bell className="w-3.5 h-3.5" />;
  }
}

function PriorityIcon({ type }: { type: string }) {
  switch (type) {
    case "signature": return <FileSignature className="w-4 h-4" />;
    case "overdue_invoice": return <DollarSign className="w-4 h-4" />;
    case "schedule": return <Calendar className="w-4 h-4" />;
    case "blocker": return <AlertTriangle className="w-4 h-4" />;
    case "estimate_followup": return <TrendingUp className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

function WeatherIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "sun": return <Sun className={className} />;
    case "cloud-sun": return <CloudSun className={className} />;
    case "cloud": return <Cloud className={className} />;
    case "rain": return <CloudRain className={className} />;
    default: return <Sun className={className} />;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  eyebrow,
  title,
  action,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[4px] border border-[var(--border-warm)] bg-white",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            {eyebrow}
          </p>
          <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CompactCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[4px] border border-[var(--border-warm)] bg-white",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
        <h3 className="text-xs font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function PipelineCell({
  label,
  value,
  detail,
  href,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex flex-col gap-1 rounded-[4px] border px-4 py-4 transition hover:shadow-sm",
        tonePipelineClass(tone),
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
          {label}
        </p>
        <ChevronRight className="h-3.5 w-3.5 opacity-30 transition group-hover:opacity-70" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs leading-4 opacity-60">{detail}</p>
    </Link>
  );
}

function JobStatusPip({ status }: { status: string }) {
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-800">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        In progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--graphite-light)]" />
      Scheduled
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardDesignPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  // Find the max value for the opportunity chart scaling
  const maxOpportunityValue = Math.max(...OPPORTUNITY_STATS.map(s => s.value));

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)]">

      {/* ══════════════════════════════════════════
          ROW 1 — Brand + User (darkest graphite)
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-[#1a1f26] shadow-md print:hidden" style={{background: "linear-gradient(180deg,#1e242c 0%,#191e25 100%)"}}>

        {/* ── Row 1: Brand / Identity / User ── */}
        <div className="border-b border-white/10 mx-auto flex h-16 max-w-[1680px] items-center justify-between gap-6 px-5">

          {/* Brand */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--copper)] text-sm font-extrabold text-white shadow">
              FC
            </div>
            <div>
              <p className="text-[15px] font-bold leading-tight text-white tracking-tight">FloorConnector</p>
              <p className="text-[10px] text-white/50 leading-tight">Specialty Flooring Systems</p>
            </div>
          </div>

          {/* Centre: Company title */}
          <p className="hidden md:block absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-white/70 tracking-wide">
            {COMPANY_INFO.name}
          </p>

          {/* Right: Training + Chat + User */}
          <div className="flex items-center gap-4">
            {/* Training links */}
            <div className="hidden xl:flex flex-col items-end leading-tight">
              <Link href="/trainings" className="text-[11px] font-medium text-[var(--copper-light)] hover:underline">Free Online Training</Link>
              <div className="flex gap-3 mt-0.5">
                <Link href="/webinars" className="text-[10px] text-white/50 hover:text-[var(--copper-light)] transition">Daily Webinars</Link>
                <Link href="/university" className="text-[10px] text-white/50 hover:text-[var(--copper-light)] transition">Contractor University</Link>
              </div>
            </div>

            <div className="hidden xl:block h-8 w-px bg-white/10" />

            {/* Live Chat */}
            <button className="hidden md:flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-sm text-white/80 transition hover:bg-white/15 hover:text-white">
              <MessageCircle className="h-4 w-4 text-white/60" />
              <span>Live Chat</span>
            </button>

            <div className="h-8 w-px bg-white/10" />

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-sm font-semibold text-white">{USER_PROFILE.name}</p>
                <p className="text-[10px] text-white/50">User {USER_PROFILE.userId} &nbsp;·&nbsp; {USER_PROFILE.lastLogin}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--copper)] text-sm font-bold text-white shadow">
                {USER_PROFILE.initials}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Page context + project selector + menu ── */}
        <div className="border-b border-white/8 mx-auto flex h-11 max-w-[1680px] items-center gap-4 px-5">

          {/* Breadcrumb / page label */}
          <div className="flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-white/40" />
            <span className="text-white/30 text-xs">/</span>
            <span className="text-sm font-semibold text-white">Dashboard</span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Project Selector */}
          <button
            onClick={() => setProjectSelectorOpen(!projectSelectorOpen)}
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/15"
          >
            <Briefcase className="h-3.5 w-3.5 text-white/50" />
            <span>Select a Project</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/40" />
          </button>

          {/* Menu trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-1.5 text-xs transition hover:bg-white/15"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Menu</span>
            <ChevronDown className={`h-3.5 w-3.5 text-white/40 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Right: utility icons */}
          <div className="ml-auto flex items-center gap-3">
            <button className="text-white/40 hover:text-white/70 transition" aria-label="Tools"><Wrench className="h-4 w-4" /></button>
            <button className="text-white/40 hover:text-white/70 transition" aria-label="Notes"><MessageSquare className="h-4 w-4" /></button>
            <button className="text-white/40 hover:text-white/70 transition" aria-label="Suggestions"><Lightbulb className="h-4 w-4" /></button>
            <button className="text-white/40 hover:text-white/70 transition" aria-label="Settings"><Settings className="h-4 w-4" /></button>
          </div>
        </div>

        {/* ── Row 3: Customisable pinned page links ── */}
        <div className="mx-auto flex h-9 max-w-[1680px] items-center gap-1 px-5" style={{background: "linear-gradient(180deg,#282f38 0%,#23282f 100%)"}}>
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-widest text-white/40 select-none">
            Pinned
          </span>
          {STARRED_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Star className="h-2.5 w-2.5 text-[var(--copper-light)] fill-[var(--copper-light)]" />
              {link.label}
            </Link>
          ))}
          <button className="ml-2 flex items-center gap-1 rounded px-2 py-1 text-[10px] text-white/40 transition hover:text-white/70">
            <Plus className="h-3 w-3" />
            Add page
          </button>
        </div>

      </header>

      {/* ── MEGA MENU OVERLAY ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div 
            className="absolute left-0 right-0 top-[136px] border-b border-[var(--border-warm)] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-[1680px] px-4 py-6">
              {/* Menu Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {Object.entries(MEGA_MENU).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">{category}</h3>
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
                          >
                            {item.starred && <Star className="h-3 w-3 text-[var(--copper)] fill-[var(--copper)]" />}
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer Links */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-8 border-t border-[var(--border-warm)] pt-4">
                <Link href="/referral" className="flex items-center gap-2 text-sm text-[var(--copper)] hover:underline">
                  <DollarSign className="h-4 w-4" />
                  Refer Us (Earn $$$)
                </Link>
                <Link href="/support/issue" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <AlertTriangle className="h-4 w-4" />
                  Submit an Issue
                </Link>
                <Link href="/whats-new" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <HelpCircle className="h-4 w-4" />
                  {"What's New"}
                </Link>
                <Link href="/suggestions" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <Lightbulb className="h-4 w-4" />
                  Make a Suggestion
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE DROPDOWN OVERLAY ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={() => setCreateOpen(false)}>
          <div
            className="mt-14 mr-4 w-56 rounded-[4px] border border-[var(--border-warm)] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[var(--border-warm)] px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Quick create</p>
            </div>
            {[
              { label: "New lead", href: "/leads" },
              { label: "New estimate", href: "/estimates" },
              { label: "New project", href: "/projects" },
              { label: "New job", href: "/jobs" },
              { label: "New invoice", href: "/invoices" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setCreateOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
              >
                {item.label}
                <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── PAGE BODY ── */}
      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6">

        {/* Health Summary Bar */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3">
          {/* Date */}
          <div className="flex items-center gap-2 pr-4 border-r border-[var(--border-warm)]">
            <Calendar className="h-4 w-4 text-[var(--copper)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">{TODAY}</span>
          </div>
          {/* Metrics */}
          {HEALTH_SUMMARY.map((m, idx) => (
            <div
              key={m.key}
              className={`flex items-center gap-2 ${idx < HEALTH_SUMMARY.length - 1 ? 'pr-4 border-r border-[var(--border-warm)]' : ''}`}
            >
              <span className="text-xs text-[var(--text-secondary)]">{m.label}</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{m.value}</span>
            </div>
          ))}
          {/* Customize button */}
          <div className="ml-auto">
            <button className="flex items-center gap-1.5 rounded-md border border-[var(--border-warm)] bg-white px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]">
              <Settings className="h-3 w-3" />
              Customize
            </button>
          </div>
        </div>

        {/* Page title row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-[var(--copper)]" />
            <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              Command Center
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <button className="flex h-8 items-center gap-2 rounded-md border border-[var(--border-warm)] bg-white px-3 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden rounded border border-[var(--border-warm)] px-1 text-[10px] text-[var(--text-tertiary)] sm:inline">Cmd+K</kbd>
            </button>
            {/* Create */}
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className="flex h-8 items-center gap-1.5 rounded-md bg-[var(--copper)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--copper-light)]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create</span>
            </button>
            {/* Notifications */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-warm)] bg-white text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </div>

        {/* ══ TOP ROW: Calendar + Weather + Appointments + Time Tracking ══ */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Mini Calendar */}
          <CompactCard 
            title={CURRENT_MONTH}
            action={
              <div className="flex items-center gap-1">
                <button className="rounded p-0.5 hover:bg-[var(--border-warm)] transition" aria-label="Previous month">
                  <ChevronLeft className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                </button>
                <button className="rounded p-0.5 hover:bg-[var(--border-warm)] transition" aria-label="Next month">
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                </button>
              </div>
            }
          >
            <div className="p-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-medium text-[var(--text-tertiary)]">{d}</div>
                ))}
              </div>
              {/* Empty cells for May 2025 (starts on Thursday) */}
              <div className="grid grid-cols-7 gap-0.5">
                {[null, null, null, null].map((_, i) => (
                  <div key={`empty-${i}`} className="h-6" />
                ))}
                {CALENDAR_DAYS.map((d) => (
                  <button
                    key={d.day}
                    className={[
                      "h-6 rounded text-[10px] font-medium transition",
                      d.day === 31 
                        ? "bg-[var(--copper)] text-white" 
                        : d.hasJob 
                          ? "bg-[var(--copper)]/10 text-[var(--copper)] hover:bg-[var(--copper)]/20" 
                          : "text-[var(--text-secondary)] hover:bg-[var(--highlight)]",
                    ].join(" ")}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </div>
          </CompactCard>

          {/* Weather Widget */}
          <CompactCard 
            title="Weather Forecast"
            action={
              <span className="text-[10px] text-[var(--text-tertiary)]">Next hour: Clear</span>
            }
          >
            <div className="p-3">
              {/* Current conditions */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                  <Sun className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{WEATHER.current.temp}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{WEATHER.current.condition}</p>
                </div>
              </div>
              {/* 7-day forecast */}
              <div className="flex items-center justify-between gap-1 border-t border-[var(--border-warm)] pt-2">
                {WEATHER.forecast.map((day) => (
                  <div key={day.day} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-medium text-[var(--text-tertiary)]">{day.day}</span>
                    <WeatherIcon icon={day.icon} className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    <span className="text-[9px] text-[var(--text-secondary)]">{day.temp}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[var(--text-tertiary)] leading-tight">{WEATHER.hourly}</p>
            </div>
          </CompactCard>

          {/* My Appointments */}
          <CompactCard 
            title="My Appointments"
            action={
              <Link href="/calendar" className="text-[10px] text-[var(--copper)] hover:underline">View all</Link>
            }
          >
            <div className="divide-y divide-[var(--border-warm)]">
              {APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="flex items-center gap-2 px-3 py-2">
                  <div className="flex h-8 w-10 flex-col items-center justify-center rounded bg-[var(--copper)]/10">
                    <span className="text-[9px] font-medium text-[var(--copper)]">{apt.date.split(" ")[0]}</span>
                    <span className="text-xs font-bold text-[var(--copper)]">{apt.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--text-primary)]">{apt.subject}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CompactCard>

          {/* Time Tracking */}
          <CompactCard 
            title="My Hours This Week"
            action={
              <span className="text-xs font-bold text-[var(--text-primary)]">{TIME_TRACKING.hoursThisWeek}h</span>
            }
          >
            <div className="p-3">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[var(--text-secondary)]">Regular</span>
                <span className="font-medium text-[var(--text-primary)]">{TIME_TRACKING.regularHours}h</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="text-[var(--text-secondary)]">Overtime</span>
                <span className="font-medium text-[var(--text-primary)]">{TIME_TRACKING.overtimeHours}h</span>
              </div>
              {/* Clock in/out button */}
              <button className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--copper)] bg-[var(--copper)]/5 py-2 text-sm font-semibold text-[var(--copper)] transition hover:bg-[var(--copper)]/10">
                <Clock className="h-4 w-4" />
                Clock In
              </button>
              <p className="mt-2 text-center text-[10px] text-[var(--text-tertiary)]">Last: {TIME_TRACKING.lastPunch}</p>
            </div>
          </CompactCard>
        </div>

        {/* ══ SECTION 1: TODAY'S PRIORITIES ══ */}
        <SectionCard
          eyebrow="Today&apos;s priorities"
          title="What needs attention now"
          className="mb-5"
          action={
            <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700">
              {PRIORITIES.filter((p) => p.urgency === "critical").length} critical
            </span>
          }
        >
          <div className="divide-y divide-[var(--border-warm)]">
            {PRIORITIES.map((p) => (
              <div key={p.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--highlight)] text-[var(--graphite)]">
                  <PriorityIcon type={p.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{p.title}</p>
                    <span className={["rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]", urgencyBadgeClass(p.urgency)].join(" ")}>
                      {p.urgency}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">{p.detail}</p>
                </div>
                <Link
                  href={p.href}
                  className="shrink-0 self-center rounded-md border border-[var(--border-warm)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--highlight)] hidden sm:inline-flex items-center gap-1"
                >
                  {p.action}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══ SECTION 2 + 3: PIPELINE + PRODUCTION — 2-col grid ══ */}
        <div className="mb-5 grid gap-5 lg:grid-cols-2">

          {/* Revenue Pipeline */}
          <SectionCard eyebrow="Revenue pipeline" title="Sales & close stage">
            <div className="grid grid-cols-2 gap-3 p-4">
              {REVENUE_PIPELINE.map((cell) => (
                <PipelineCell key={cell.key} {...cell} />
              ))}
            </div>
          </SectionCard>

          {/* Production Readiness */}
          <SectionCard eyebrow="Production readiness" title="Scheduling & execution status">
            <div className="grid grid-cols-2 gap-3 p-4">
              {PRODUCTION.map((cell) => (
                <PipelineCell key={cell.key} {...cell} />
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ══ OPPORTUNITY STATS + OPEN PUNCHLISTS ══ */}
        <div className="mb-5 grid gap-5 lg:grid-cols-2">
          
          {/* Opportunity Stats Chart */}
          <SectionCard eyebrow="Opportunities" title="Pipeline by Stage">
            <div className="p-4">
              <div className="space-y-3">
                {OPPORTUNITY_STATS.map((stage) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <p className="text-xs font-medium text-[var(--text-primary)]">{stage.stage}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{stage.count} deals</p>
                    </div>
                    <div className="flex-1 h-6 bg-[var(--highlight)] rounded overflow-hidden">
                      <div 
                        className="h-full bg-[var(--copper)] rounded transition-all"
                        style={{ width: `${(stage.value / maxOpportunityValue) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">${(stage.value / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-warm)] flex items-center justify-between">
                <p className="text-xs text-[var(--text-secondary)]">Total Pipeline Value</p>
                <p className="text-lg font-bold text-[var(--copper)]">
                  ${(OPPORTUNITY_STATS.reduce((sum, s) => sum + s.value, 0) / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Open Punchlists */}
          <SectionCard 
            eyebrow="Quality control" 
            title="Open Punchlists"
            action={
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {OPEN_PUNCHLISTS.length} open
              </span>
            }
          >
            <div className="divide-y divide-[var(--border-warm)]">
              {OPEN_PUNCHLISTS.map((pl) => (
                <div key={pl.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <CheckCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={pl.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                      {pl.title}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">{pl.project} · {pl.date}</p>
                  </div>
                  <Link
                    href={pl.href}
                    className="shrink-0 rounded-md border border-[var(--border-warm)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border-warm)] px-4 py-3">
              <Link href="/punchlists" className="text-xs font-semibold text-[var(--copper)] hover:underline">
                View all punchlists
              </Link>
            </div>
          </SectionCard>
        </div>

        {/* ══ SECTION 4 + 5: COLLECTIONS + FIELD — 2-col grid ══ */}
        <div className="mb-5 grid gap-5 lg:grid-cols-2">

          {/* Collections / AR */}
          <SectionCard
            eyebrow="Collections / AR"
            title="Receivables & payment status"
            action={
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Open AR</p>
                <p className="text-lg font-bold tracking-tight text-[var(--text-primary)]">{TOTAL_OPEN_AR}</p>
              </div>
            }
          >
            {/* Overdue */}
            <div className="border-b border-[var(--border-warm)] px-4 py-2 bg-red-50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-700">Overdue invoices</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {OVERDUE_INVOICES.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <Link href={inv.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                      {inv.customer}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">{inv.number} · {inv.daysOverdue}d overdue</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-red-700">{inv.amount}</p>
                </div>
              ))}
            </div>

            {/* Pending */}
            <div className="border-t border-b border-[var(--border-warm)] px-4 py-2 bg-amber-50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">Pending payments</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {PENDING_PAYMENTS.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <Link href={pay.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                      {pay.customer}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">{pay.description}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[var(--text-primary)]">{pay.amount}</p>
                </div>
              ))}
            </div>

            {/* Recent payments */}
            <div className="border-t border-b border-[var(--border-warm)] px-4 py-2 bg-emerald-50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Recent payments</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {RECENT_PAYMENTS.map((rp) => (
                <div key={rp.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{rp.customer}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{rp.description} · {rp.date}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-emerald-700">{rp.amount}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Field Activity */}
          <SectionCard eyebrow="Field activity" title="Today&apos;s jobs, logs & blockers">

            {/* Today's jobs */}
            <div className="border-b border-[var(--border-warm)] px-4 py-2 bg-[var(--highlight)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">Today&apos;s jobs</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {TODAYS_JOBS.map((job) => (
                <div key={job.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--highlight)] text-[var(--graphite)]">
                      <HardHat className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <Link href={job.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                        {job.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <JobStatusPip status={job.status} />
                        <span className="text-xs text-[var(--text-secondary)]">{job.crew}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">{job.start}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Open daily logs */}
            <div className="border-t border-b border-[var(--border-warm)] px-4 py-2 bg-amber-50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">Open daily logs</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {OPEN_DAILY_LOGS.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <Link href={log.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                      {log.title}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">{log.date}</p>
                  </div>
                  <Link href={log.href} className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-800 transition hover:bg-amber-100">
                    Submit
                  </Link>
                </div>
              ))}
            </div>

            {/* Field blockers */}
            <div className="border-t border-b border-[var(--border-warm)] px-4 py-2 bg-red-50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-700">Unresolved blockers</p>
            </div>
            <div className="divide-y divide-[var(--border-warm)]">
              {FIELD_BLOCKERS.map((blocker) => (
                <div key={blocker.id} className="flex items-start gap-3 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <div className="min-w-0">
                    <Link href={blocker.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                      {blocker.title}
                    </Link>
                    <p className="text-xs text-[var(--text-secondary)]">{blocker.project} · {blocker.day}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ══ SECTION 6 + 7: NEXT MOVE + RECENT ACTIVITY — 3/5 + 2/5 grid ══ */}
        <div className="grid gap-5 lg:grid-cols-5">

          {/* Next Move — 3 cols */}
          <section className="lg:col-span-3 rounded-[4px] border border-[var(--copper)] bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-[var(--copper)]/20 bg-[var(--copper)]/5 px-4 py-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--copper)] text-white">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">Next move</p>
                <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Recommended action
                </p>
              </div>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{NEXT_MOVE.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href={NEXT_MOVE.primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--copper)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]"
                >
                  <Zap className="h-3.5 w-3.5" />
                  {NEXT_MOVE.primaryCta.label}
                </Link>
                <Link
                  href={NEXT_MOVE.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--border-medium)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
                >
                  {NEXT_MOVE.secondaryCta.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Activity — 2 cols */}
          <SectionCard
            eyebrow="Recent activity"
            title="Latest events"
            className="lg:col-span-2"
          >
            <div className="divide-y divide-[var(--border-warm)]">
              {RECENT_ACTIVITY.map((evt) => {
                const ic = activityIconClass(evt.type);
                return (
                  <div key={evt.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={["mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", ic.bg, ic.color].join(" ")}>
                      <ActivityIcon type={evt.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={evt.href} className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--copper)] transition">
                          {evt.title}
                        </Link>
                        <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">{evt.time}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{evt.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[var(--border-warm)] px-4 py-3">
              <Link href="/transaction-log" className="text-xs font-semibold text-[var(--copper)] hover:underline">
                View full activity log
              </Link>
            </div>
          </SectionCard>
        </div>

      </main>
    </div>
  );
}
