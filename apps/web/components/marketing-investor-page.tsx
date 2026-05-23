import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  Check,
  CircleDollarSign,
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquareText,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench
} from "lucide-react";

import { EarlyAccessRequestForm } from "@/components/early-access-request-form";

const signupHref = "/signup?next=%2Fsetup%2Fcompany";
const loginHref = "/login";

const lifecycleSteps = [
  "Lead / opportunity",
  "Customer",
  "Project",
  "Estimate",
  "Contract",
  "Change order",
  "Job",
  "Invoice",
  "Payment",
  "Closeout"
] as const;

const operatingCore = [
  {
    title: "Project Workspace",
    label: "Operating hub",
    Icon: LayoutDashboard,
    description:
      "A project-centered view of health, Next Move, commercial records, scheduling, field history, proof, closeout, and customer access."
  },
  {
    title: "CrewBoard",
    label: "Scheduling visibility",
    Icon: Route,
    description:
      "A schedule workspace for ready work, scheduled jobs, date context, crew visibility, and advisory warnings without promising automated dispatch."
  },
  {
    title: "FieldTrail",
    label: "Execution history",
    Icon: Wrench,
    description:
      "Daily logs, field notes, attachments, labor context, and job history stay connected to the project that produced the work."
  },
  {
    title: "MessageCenter",
    label: "Communication timeline",
    Icon: MessageSquareText,
    description:
      "Project communication context sits beside Send Trail, Signature Trail, Payment Trail, and customer access evidence."
  },
  {
    title: "Proof Center",
    label: "Evidence index",
    Icon: ShieldCheck,
    description:
      "Estimates, contracts, invoices, field evidence, delivery history, warranty/service context, and closeout proof are easier to find from the project."
  },
  {
    title: "Customer Portal",
    label: "Customer window",
    Icon: UsersRound,
    description:
      "Customers see their next step, project status, timeline, shared documents, and safe review actions through the same shared workflow."
  },
  {
    title: "Financial Control",
    label: "Collections visibility",
    Icon: CircleDollarSign,
    description:
      "Open receivables, overdue invoices, payment attention, and accounting review prep are visible without claiming accounting sync."
  },
  {
    title: "Document Engine",
    label: "Print / export",
    Icon: FileText,
    description:
      "Estimate, contract, invoice, warranty, and closeout package print views render current records for browser print/save."
  }
] as const;

const contractorOutcomes = [
  "See what needs attention before it turns into a missed handoff.",
  "Know what is ready to schedule and what is still blocked.",
  "Follow what happened in the field without digging through scattered notes.",
  "Review what was sent, signed, paid, and still collectible.",
  "Close out work with proof, documents, service context, and customer visibility."
] as const;

const availableNow = [
  "Command Center / dashboard",
  "Project Workspace operating hub",
  "Project health and Next Move",
  "CrewBoard scheduling workspace",
  "FieldTrail execution history",
  "MessageCenter communication timeline",
  "CloseoutTrail and Proof Center",
  "Send Trail delivery proof visibility",
  "Document Engine print/export and closeout package",
  "Portal Customer Window",
  "Service Center visibility",
  "Reports and Financial Control",
  "Accounting Readiness and CSV export prep",
  "Mobile Daily Job Log capture",
  "Shell-level global search"
] as const;

const laterDirection = [
  "Drag/drop dispatch and deeper crew calendar controls",
  "QuickBooks/Xero or other accounting sync",
  "Stored document library and persisted generated PDFs",
  "Customer-submitted service requests",
  "Customer-facing field evidence sharing",
  "AI-assisted summaries, drafting, and automation",
  "External provider and calendar integrations",
  "Offline/native mobile app depth"
] as const;

const specialtyTrades = [
  "Epoxy flooring",
  "Concrete polishing",
  "Resinous flooring",
  "Decorative flake, quartz, and metallic systems",
  "Prep-heavy specialty surface teams",
  "Small and mid-sized contractor companies"
] as const;

function MarketingButton({
  href,
  children,
  variant = "primary",
  size = "default"
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
  size?: "default" | "large";
}) {
  const sizeStyles =
    size === "large"
      ? "min-h-14 rounded-lg px-7 py-4 text-base"
      : "min-h-11 rounded-lg px-5 py-3 text-sm";

  const variantStyles = {
    primary:
      "bg-[var(--copper)] text-white shadow-[0_18px_42px_-22px_rgba(180,83,9,0.7)] hover:bg-[var(--copper-light)]",
    secondary:
      "border border-[var(--border-warm)] bg-white text-[var(--text-primary)] shadow-sm hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]",
    dark: "bg-[var(--graphite)] text-white shadow-[0_18px_42px_-24px_rgba(31,41,55,0.7)] hover:bg-[var(--graphite-dark)]"
  };

  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
        sizeStyles,
        variantStyles[variant]
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
  inverted = false
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  inverted?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={[
          "text-xs font-semibold uppercase tracking-normal",
          inverted ? "text-[var(--copper-light)]" : "text-[var(--copper)]"
        ].join(" ")}
      >
        {eyebrow}
      </p>
      <h2
        className={[
          "mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl",
          inverted ? "text-white" : "text-[var(--text-primary)]"
        ].join(" ")}
      >
        {title}
      </h2>
      {children ? (
        <div
          className={[
            "mt-5 text-lg leading-relaxed",
            inverted ? "text-white/70" : "text-[var(--text-secondary)]"
          ].join(" ")}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function MarketingInvestorPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)]">
      <div className="border-b border-white/10 bg-[var(--graphite)] px-4 py-2.5 text-center text-sm text-white">
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-[var(--copper)] px-2.5 py-1 text-xs font-semibold">
            Demo ready
          </span>
          The operating core now has a route-based walkthrough.
          <Link
            href={signupHref}
            className="inline-flex items-center gap-1 font-semibold text-[var(--copper-light)] hover:text-white"
          >
            Request early access
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </span>
      </div>

      <header className="sticky top-0 z-50 border-b border-[var(--border-warm)] bg-[var(--cream)]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--graphite)]">
              <span className="text-sm font-bold text-white">FC</span>
            </div>
            <span className="text-lg font-semibold tracking-normal">
              FloorConnector
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--text-secondary)] lg:flex">
            <a href="#platform" className="hover:text-[var(--text-primary)]">
              Platform
            </a>
            <a href="#core" className="hover:text-[var(--text-primary)]">
              Operating core
            </a>
            <a href="#demo" className="hover:text-[var(--text-primary)]">
              Demo
            </a>
            <a href="#later" className="hover:text-[var(--text-primary)]">
              Later
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={loginHref}
              className="hidden text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:block"
            >
              Log in
            </Link>
            <MarketingButton href={signupHref}>Request access</MarketingButton>
          </div>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-warm)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-normal text-[var(--copper)] shadow-sm">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Specialty surface contractor software
            </p>
            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.04] tracking-normal text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              One connected operating system for specialty flooring contractors.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              FloorConnector connects leads, projects, estimates, contracts,
              jobs, invoices, payments, field evidence, closeout, and the
              customer portal so the whole job keeps moving from the same shared
              workflow.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MarketingButton href={signupHref} size="large">
                Request early access
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </MarketingButton>
              <MarketingButton href="#demo" variant="secondary" size="large">
                See what demos today
              </MarketingButton>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-[0_28px_80px_-48px_rgba(31,41,55,0.45)]">
            <div className="rounded-lg bg-[var(--graphite)] p-5 text-white sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
                    Connected job flow
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    One project, carried forward
                  </p>
                </div>
                <ShieldCheck className="h-6 w-6 text-[var(--copper-light)]" />
              </div>
              <div className="mt-5 grid gap-2">
                {lifecycleSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-[var(--copper-light)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{step}</span>
                    <span className="ml-auto text-xs text-white/35">
                      {index < lifecycleSteps.length - 1
                        ? "flows forward"
                        : "handoff ready"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-warm)] bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            [
              "What it replaces",
              "A patchwork of CRM, spreadsheets, PDFs, scheduling notes, field reports, and payment follow-up."
            ],
            [
              "What it centers",
              "The Project Workspace as the operating hub for sales, field, finance, customer review, and closeout."
            ],
            [
              "What stays honest",
              "Current demo-ready features are separated from future dispatch, AI, accounting, and document depth."
            ]
          ].map(([title, description]) => (
            <div key={title} className="flex gap-4">
              <BadgeCheck
                className="mt-1 h-5 w-5 shrink-0 text-[var(--copper)]"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="platform"
        className="bg-[var(--graphite)] px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <SectionIntro
              eyebrow="The FloorConnector story"
              title="The contractor creates the work once. Every handoff moves that same job forward."
              inverted
            >
              <p>
                The office, field, finance team, and customer portal all work
                from connected records. Customer actions update the shared
                workflow, and the contractor continues from the latest project
                state instead of reconciling copies.
              </p>
            </SectionIntro>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [
                  "No duplicate re-entry",
                  "Scope, signatures, billing, and field context stay connected."
                ],
                [
                  "No portal-only copies",
                  "Customer review extends the same project workflow."
                ],
                [
                  "No disconnected closeout",
                  "Proof, documents, service context, and collections stay visible."
                ]
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-white"
                >
                  <Check
                    className="mb-4 h-5 w-5 text-[var(--copper-light)]"
                    aria-hidden="true"
                  />
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="core" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Operating core"
            title="The demo now has real connected surfaces to show."
          >
            <p>
              The operating core is no longer just a generic project list. It
              can show how a specialty contractor moves from commercial work to
              scheduling, field execution, proof, customer visibility,
              collections, and accounting review prep.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {operatingCore.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-[var(--border-warm)] bg-white p-6 shadow-sm"
              >
                <feature.Icon
                  className="h-7 w-7 text-[var(--copper)]"
                  aria-hidden="true"
                />
                <p className="mt-5 text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
                  {feature.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionIntro
            eyebrow="What contractors see"
            title="The day-to-day view is about attention, readiness, field history, and money."
          >
            <p>
              FloorConnector should make the next operating move easier to see:
              what is waiting, what is ready, what happened, what was shared,
              and what still needs to be collected.
            </p>
          </SectionIntro>

          <div className="grid gap-4">
            {contractorOutcomes.map((item) => (
              <div
                key={item}
                className="flex gap-4 rounded-lg border border-[var(--border-warm)] bg-[var(--cream)] p-5"
              >
                <Flag
                  className="mt-1 h-5 w-5 shrink-0 text-[var(--copper)]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="Available to demo today"
              title="A route-based walkthrough of the operating core."
            >
              <p>
                Demo the current product as a connected contractor operating
                system. Use real records, start from index routes, and keep
                future depth labeled as future depth.
              </p>
            </SectionIntro>

            <div className="grid gap-3 sm:grid-cols-2">
              {availableNow.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                >
                  <Check
                    className="h-4 w-4 shrink-0 text-[var(--copper)]"
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {[
              [
                "Start with the Command Center",
                "Show priorities, ready work, field follow-up, waiting customer/payment/signature items, and source-record links."
              ],
              [
                "Open the Project Workspace",
                "Show ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, Proof Center, Send Trail, and customer access context."
              ],
              [
                "Walk the customer side",
                "Show the portal Customer Window: next step, project status, timeline, shared documents, and print/save links."
              ],
              [
                "Close on money and proof",
                "Show Financial Control, Accounting Readiness, CSV export prep, and closeout package print/save."
              ]
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-lg bg-[var(--graphite)] p-6 text-white"
              >
                <Route
                  className="mb-4 h-5 w-5 text-[var(--copper-light)]"
                  aria-hidden="true"
                />
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionIntro
            eyebrow="Specialty contractor focus"
            title="Built for epoxy, polishing, resinous flooring, and prep-heavy surface work."
          >
            <p>
              These teams need handoffs that respect scope, site conditions,
              field proof, customer approvals, billing, service history, and
              closeout evidence. A generic CRM does not carry enough of that
              work.
            </p>
          </SectionIntro>

          <div className="grid gap-3 sm:grid-cols-2">
            {specialtyTrades.map((trade) => (
              <div
                key={trade}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--cream)] px-4 py-3 text-sm font-semibold"
              >
                <Boxes
                  className="h-4 w-4 shrink-0 text-[var(--copper)]"
                  aria-hidden="true"
                />
                {trade}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="later" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <SectionIntro
              eyebrow="Coming later"
              title="The roadmap is clear, but the homepage should not overpromise it."
            >
              <p>
                The current demo is about the operating core. These deeper
                capabilities remain planned direction or later product depth
                until dedicated implementation work lands.
              </p>
            </SectionIntro>

            <div className="grid gap-3 sm:grid-cols-2">
              {laterDirection.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[var(--border-warm)] bg-white p-4 text-sm leading-relaxed text-[var(--text-secondary)] shadow-sm"
                >
                  <Sparkles
                    className="mb-3 h-4 w-4 text-[var(--copper)]"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-[var(--text-primary)]">
                    Later:
                  </span>{" "}
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="roadmap-input"
        className="bg-[var(--graphite)] px-5 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
              Contractor-led buildout
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              Help shape the next operating layer.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/70">
              Early users can point us toward the workflows that matter most:
              scheduling depth, company documents, service and warranty depth,
              reporting, integrations, field workflows, and the demo data needed
              to prove the story.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MarketingButton href={signupHref} variant="secondary">
                Suggest a workflow
              </MarketingButton>
              <MarketingButton href={signupHref} variant="dark">
                Request access
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </MarketingButton>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <Search className="h-7 w-7 text-[var(--copper-light)]" />
            <p className="mt-5 text-xl font-semibold">
              Global search now belongs in the demo.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Search can safely find current company records across the
              operating core, including status-like terms such as scheduled,
              sent, paid, and in progress.
            </p>
          </div>
        </div>
      </section>

      <section id="early-access" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-white shadow-[0_32px_90px_-52px_rgba(31,41,55,0.42)]">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
                Early access
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
                Bring your operating workflow into the product conversation.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
                FloorConnector is in active buildout. The operating core is
                ready to demo, and early access helps decide which contractor
                workflows deserve the next serious layer.
              </p>
              <div className="mt-8">
                <MarketingButton href={signupHref} size="large">
                  Request early access
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </MarketingButton>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--cream)] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <UsersRound className="h-6 w-6 text-[var(--copper)]" />
                <div>
                  <p className="text-lg font-semibold">Request Early Access</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Prefer an operator review first? Send a short request.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <EarlyAccessRequestForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-warm)] bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--graphite)]">
              <span className="text-xs font-bold text-white">FC</span>
            </div>
            <span className="text-sm font-semibold tracking-normal">
              FloorConnector
            </span>
          </div>
          <p className="text-center text-sm text-[var(--text-tertiary)]">
            Connected operating software for specialty surface contractors.
            Early-access package direction, no published pricing yet.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link
              href={loginHref}
              className="transition hover:text-[var(--text-primary)]"
            >
              Log in
            </Link>
            <Link
              href={signupHref}
              className="transition hover:text-[var(--text-primary)]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
