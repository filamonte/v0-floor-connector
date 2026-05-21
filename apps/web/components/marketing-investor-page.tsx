import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Building2,
  Check,
  CircleDollarSign,
  ClipboardList,
  FileSignature,
  Flag,
  Lightbulb,
  MessageSquarePlus,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench
} from "lucide-react";

import { EarlyAccessRequestForm } from "@/components/early-access-request-form";

const signupHref = "/signup?next=%2Fsetup%2Fcompany";
const loginHref = "/login";

const workflow = [
  "Opportunity",
  "Customer",
  "Project",
  "Estimate",
  "Contract",
  "Change Order",
  "Job",
  "Invoice",
  "Payment"
] as const;

const contractorPain = [
  "Leads live in one place while estimates live in another.",
  "Contracts become PDFs that do not carry operational state forward.",
  "Schedules move on a board while invoices drift away from approved scope.",
  "Field notes, photos, and customer updates get buried in text threads.",
  "Owners end up carrying the whole business handoff in their head."
] as const;

const builtToday = [
  {
    title: "Sales and project intake",
    Icon: ClipboardList,
    items: [
      "Opportunities, customers, and projects on the same tenant-scoped foundation",
      "Project-centered workspaces with workflow context and readiness signals",
      "Shared contractor app and customer portal surfaces"
    ]
  },
  {
    title: "Commercial workflow",
    Icon: FileSignature,
    items: [
      "Estimates, approvals, contracts, and signature workflow foundation",
      "Change orders extend the same approved-scope chain",
      "Customer review happens through shared portal records"
    ]
  },
  {
    title: "Execution and field foundations",
    Icon: Wrench,
    items: [
      "Jobs, scheduling foundation, daily logs, field notes, and time tracking",
      "People, vendors, compliance, equipment, and service/warranty foundations",
      "Execution readiness stays tied back to project context"
    ]
  },
  {
    title: "Billing and control",
    Icon: CircleDollarSign,
    items: [
      "Invoices and payments extend canonical project and customer records",
      "Portal payment foundations update the same billing chain",
      "Settings and super-admin foundations support controlled rollout"
    ]
  }
] as const;

const roadmapLayers = [
  {
    label: "Built foundation",
    title: "Connected operating backbone",
    items: [
      "Multi-tenant contractor app",
      "Customer portal foundation",
      "Core sales-to-payment chain",
      "Field and workforce foundations"
    ]
  },
  {
    label: "Next layer",
    title: "Operational depth",
    items: [
      "Deeper scheduling and dispatch",
      "Communications and notifications",
      "Operational reporting",
      "Richer customer portal workflows"
    ]
  },
  {
    label: "Future direction",
    title: "Platform intelligence",
    items: [
      "Workflow automation",
      "Mobile and field app direction",
      "Integrations",
      "Business documents and source libraries"
    ]
  }
] as const;

const packagePlans = [
  {
    name: "Starter",
    audience: "For smaller contractors who need the connected backbone.",
    items: [
      "Leads, customers, projects, estimates, contracts, and invoices",
      "Basic portal access and core workflow continuity",
      "Lean setup without forcing advanced operating layers too early"
    ]
  },
  {
    name: "Professional",
    audience: "For active teams that need stronger day-to-day operations.",
    items: [
      "Scheduling foundation, jobs, work orders, and field logs",
      "People, vendors, time tracking, and change order continuity",
      "Stronger project readiness and operational handoffs"
    ]
  },
  {
    name: "Growth",
    audience: "For contractors scaling office, sales, field, and finance.",
    items: [
      "Deeper reporting, communications, and workflow automation direction",
      "Advanced portal experience and richer document/template tooling",
      "Integrations as the platform matures"
    ]
  },
  {
    name: "Platform / Enterprise",
    audience: "For larger organizations and advanced operators.",
    items: [
      "Advanced permissions, multi-role teams, and custom configuration",
      "Deeper analytics, priority rollout support, and advanced integrations",
      "Future AI and automation packages or add-ons"
    ]
  }
] as const;

const aiDirection = [
  "Suggested next actions and workflow intelligence",
  "Guided intake assistance and operational summaries",
  "Document generation assistance and reporting insights",
  "Future call review, call intelligence, and automation recommendations"
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
  children: React.ReactNode;
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
  children?: React.ReactNode;
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
            Early access
          </span>
          The backbone is live. The next focus is operational depth.
          <Link
            href={signupHref}
            className="inline-flex items-center gap-1 font-semibold text-[var(--copper-light)] hover:text-white"
          >
            Request a spot
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
            <a href="#built" className="hover:text-[var(--text-primary)]">
              Built today
            </a>
            <a href="#packages" className="hover:text-[var(--text-primary)]">
              Packages
            </a>
            <a
              href="#roadmap-input"
              className="hover:text-[var(--text-primary)]"
            >
              Roadmap input
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
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-warm)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-normal text-[var(--copper)] shadow-sm">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Specialty contractor operating system
            </p>
            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[1.04] tracking-normal text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              The operating system for specialty flooring contractors.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              FloorConnector connects the path from opportunity to estimate,
              contract, job, invoice, and payment so epoxy, polishing, and
              resinous flooring teams can run from one shared source of truth.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <MarketingButton href={signupHref} size="large">
                Start early access
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </MarketingButton>
              <MarketingButton
                href="#platform"
                variant="secondary"
                size="large"
              >
                Explore the platform
              </MarketingButton>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-[0_28px_80px_-48px_rgba(31,41,55,0.45)]">
            <div className="rounded-lg bg-[var(--graphite)] p-5 text-white sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
                    Shared record chain
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    One job, carried forward
                  </p>
                </div>
                <ShieldCheck className="h-6 w-6 text-[var(--copper-light)]" />
              </div>
              <div className="mt-5 grid gap-2">
                {workflow.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-[var(--copper-light)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{step}</span>
                    {index < workflow.length - 1 ? (
                      <span className="ml-auto text-xs text-white/35">
                        flows forward
                      </span>
                    ) : (
                      <span className="ml-auto text-xs text-white/35">
                        collected
                      </span>
                    )}
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
              "What it is today",
              "A real multi-tenant contractor app and portal foundation."
            ],
            [
              "Where it is going",
              "A project-centered command center with deeper operations."
            ],
            [
              "Why it matters",
              "No portal-only copies, disconnected billing, or duplicate job truth."
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

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="The contractor pain"
            title="Specialty flooring work breaks when the handoff breaks."
          >
            <p>
              Prep-heavy surface contractors need clean continuity between
              sales, scope, customer approval, scheduling, field work, billing,
              and collection. The usual software stack splits that work apart.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {contractorPain.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-sm"
              >
                <Flag
                  className="mb-4 h-5 w-5 text-[var(--copper)]"
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

      <section
        id="platform"
        className="bg-[var(--graphite)] px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <SectionIntro
              eyebrow="The FloorConnector answer"
              title="One shared operational chain from first opportunity to collected payment."
              inverted
            >
              <p>
                The contractor creates the record once. The customer acts on the
                same record through the portal. Signatures, payments, jobs, and
                field context update the same chain.
              </p>
            </SectionIntro>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [
                  "No retyping",
                  "Scope moves forward instead of being recreated."
                ],
                [
                  "No portal copies",
                  "Customer review extends canonical records."
                ],
                [
                  "No side billing",
                  "Invoices and payments stay linked to approved work."
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

      <section id="built" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Built today"
            title="A credible current product foundation, not a slide-only concept."
          >
            <p>
              These are current foundations from the implemented product. They
              are intentionally described as foundations where deeper workflow
              maturity is still ahead.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {builtToday.map((group) => (
              <article
                key={group.title}
                className="rounded-lg border border-[var(--border-warm)] bg-white p-6 shadow-sm"
              >
                <group.Icon
                  className="h-7 w-7 text-[var(--copper)]"
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-lg font-semibold">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--copper)]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Where we are going"
            title="More operational depth, clearly labeled by maturity."
          >
            <p>
              FloorConnector is moving toward a stronger project command center,
              scheduling and dispatch depth, communications, reporting,
              automation, integrations, and mobile field direction over the same
              canonical records.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {roadmapLayers.map((layer) => (
              <article
                key={layer.label}
                className="rounded-lg border border-[var(--border-warm)] bg-[var(--cream)] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
                  {layer.label}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{layer.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
                  {layer.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--copper)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro
              eyebrow="Planned package direction"
              title="Packages by contractor need, not one bloated plan."
            >
              <p>
                Packages are being shaped around company size, workflow depth,
                and automation needs. Exact pricing is not finalized here.
              </p>
            </SectionIntro>
            <p className="max-w-sm rounded-lg border border-[var(--border-warm)] bg-white p-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              Package structure may evolve during early access as contractor
              feedback clarifies what belongs in core plans, higher tiers, and
              add-ons.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {packagePlans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-lg border border-[var(--border-warm)] bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
                  Planned package
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {plan.audience}
                </p>
                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--copper)]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--graphite)] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionIntro
            eyebrow="AI and automation direction"
            title="AI should assist contractor judgment, not replace it."
            inverted
          >
            <p>
              Advanced AI and automation capabilities are planned for
              higher-tier packages and add-ons so smaller contractors can keep
              the system lean while growing teams can unlock deeper assistance.
            </p>
          </SectionIntro>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-7 w-7 text-[var(--copper-light)]" />
              <div>
                <p className="font-semibold">Future premium capability</p>
                <p className="text-sm text-white/55">
                  Planned direction, not autonomous business operation.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {aiDirection.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70"
                >
                  <Sparkles
                    className="mb-3 h-4 w-4 text-[var(--copper-light)]"
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionIntro
            eyebrow="Specialty contractor focus"
            title="Built for the way surface contractors actually sell, prep, install, bill, and follow up."
          >
            <p>
              FloorConnector is aimed at epoxy, polishing, resinous flooring,
              decorative systems, and prep-heavy specialty surface work where
              scope clarity and operational handoffs matter.
            </p>
          </SectionIntro>

          <div className="grid gap-3 sm:grid-cols-2">
            {specialtyTrades.map((trade) => (
              <div
                key={trade}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm font-semibold shadow-sm"
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

      <section className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Why connected records matter"
            title="The customer, office, field, and finance team keep moving from updated truth."
          >
            <p>
              The anti-silo advantage is simple: no portal-only copies, no
              disconnected billing records, and no retyping the same job five
              times as it moves through the business.
            </p>
          </SectionIntro>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {[
              ["Create once", "The contractor starts from a canonical record."],
              [
                "Customer acts",
                "Portal review, signature, and payment extend that record."
              ],
              [
                "System updates",
                "Status, balance, and readiness stay on the shared chain."
              ],
              [
                "Team continues",
                "Office and field work from the current project truth."
              ]
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg bg-[var(--cream)] p-6">
                <Route
                  className="mb-4 h-5 w-5 text-[var(--copper)]"
                  aria-hidden="true"
                />
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap-input" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
              Roadmap input
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
              Help shape the contractor operating system.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--text-secondary)]">
              Early users can suggest features, request workflows they need, and
              help prioritize what gets built next. FloorConnector is being
              shaped by real contractor operations, not generic software
              assumptions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MarketingButton href={signupHref}>
                Suggest a feature
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
              </MarketingButton>
              <MarketingButton href={signupHref} variant="secondary">
                Tell us what your workflow needs
              </MarketingButton>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white p-6 shadow-sm">
            <Lightbulb className="h-7 w-7 text-[var(--copper)]" />
            <p className="mt-5 text-xl font-semibold">
              Founder-led, contractor-led buildout
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              The current backbone is live. The next focus is operational depth:
              scheduling, communications, reporting, automation, portal
              maturity, integrations, and field workflows that reinforce the
              same record chain.
            </p>
          </div>
        </div>
      </section>

      <section id="early-access" className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-[var(--graphite)] text-white shadow-[0_32px_90px_-52px_rgba(31,41,55,0.65)]">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
                Early access
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-normal sm:text-5xl">
                Help shape the contractor operating system built for specialty
                flooring.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                FloorConnector is in active buildout. The backbone is live, and
                early access helps sharpen the operational layers contractors
                need most.
              </p>
              <div className="mt-8">
                <MarketingButton
                  href={signupHref}
                  variant="secondary"
                  size="large"
                >
                  Request early access
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </MarketingButton>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <UsersRound className="h-6 w-6 text-[var(--copper-light)]" />
                <div>
                  <p className="text-lg font-semibold">Request Early Access</p>
                  <p className="text-sm text-white/55">
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
            Specialty contractor operating system. Early-access package
            direction, no published pricing yet.
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
