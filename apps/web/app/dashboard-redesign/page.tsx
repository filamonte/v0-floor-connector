"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  DollarSign,
  FileSignature,
  FileText,
  HardHat,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";

// ─── Placeholder Data ──────────────────────────────────────────────────────────

const TODAY = "Saturday, May 31, 2025";

const HEALTH_SUMMARY = [
  { key: "active_projects", label: "Active Projects", value: "14" },
  { key: "open_ar", label: "Open AR", value: "$128,400" },
  { key: "jobs_today", label: "Jobs Today", value: "3" },
  { key: "open_blockers", label: "Open Blockers", value: "2" },
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

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function urgencyDot(urgency: string) {
  if (urgency === "critical") return "bg-red-500";
  if (urgency === "high") return "bg-amber-500";
  return "bg-[var(--copper-light)]";
}

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)]">

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-30 border-b border-[var(--border-warm)] bg-[var(--graphite)] shadow-sm print:hidden">
        <div className="mx-auto flex h-12 max-w-[1680px] items-center justify-between gap-4 px-4">

          {/* Brand */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--copper)] text-xs font-bold text-white">
              FC
            </div>
            <span className="hidden text-sm font-semibold text-white sm:block">
              FloorConnector
            </span>
            <div className="hidden h-4 w-px bg-white/20 lg:block" />
            {/* Nav Links */}
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={[
                    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    link.active
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                  aria-current={link.active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-8 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="hidden rounded border border-white/20 px-1 text-[10px] sm:inline">⌘K</kbd>
            </button>

            {/* Universal create */}
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className="flex h-8 items-center gap-1.5 rounded-md bg-[var(--copper)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--copper-light)]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Notifications */}
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--copper-light)]" />
            </button>

            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--copper-light)] text-xs font-semibold text-white">
              JD
            </div>
          </div>
        </div>

        {/* Health summary bar */}
        <div className="border-t border-white/10 bg-[var(--graphite-dark)]">
          <div className="mx-auto flex max-w-[1680px] items-center gap-0 overflow-x-auto px-4">
            {/* Date */}
            <div className="flex shrink-0 items-center gap-1.5 border-r border-white/10 py-2 pr-4 text-xs text-white/50">
              <Calendar className="h-3 w-3" />
              {TODAY}
            </div>
            {/* Metrics */}
            {HEALTH_SUMMARY.map((m) => (
              <div
                key={m.key}
                className="flex shrink-0 items-center gap-2 border-r border-white/10 px-4 py-2 text-xs"
              >
                <span className="text-white/50">{m.label}</span>
                <span className="font-semibold text-white">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

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

        {/* Page title row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-[var(--copper)]" />
            <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              Command Center
            </h1>
          </div>
          <Link
            href="/settings"
            className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--border-warm)] bg-white px-2.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
          >
            <Settings className="h-3 w-3" />
            Settings
          </Link>
        </div>

        {/* ══ SECTION 1: TODAY'S PRIORITIES ══ */}
        <SectionCard
          eyebrow="Today's priorities"
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
          <SectionCard eyebrow="Field activity" title="Today's jobs, logs & blockers">

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
