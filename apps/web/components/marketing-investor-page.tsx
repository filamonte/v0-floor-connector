import Link from "next/link";
import {
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileSignature,
  Wrench,
  X
} from "lucide-react";

import { EarlyAccessRequestForm } from "@/components/early-access-request-form";

const signupHref = "/signup?next=%2Fsetup%2Fcompany";
const loginHref = "/login";

const workflow = [
  { step: "Lead", description: "Capture opportunity" },
  { step: "Project", description: "Define scope" },
  { step: "Estimate", description: "Build pricing" },
  { step: "Contract", description: "Get signed" },
  { step: "Job", description: "Execute work" },
  { step: "Invoice", description: "Bill customer" },
  { step: "Payment", description: "Collect funds" }
] as const;

const stats = [
  {
    value: "One",
    label: "connected chain",
    description: "from opportunity to payment"
  },
  {
    value: "No",
    label: "portal copies",
    description: "customers review shared records"
  },
  {
    value: "Real",
    label: "tenant boundaries",
    description: "auth and access stay scoped"
  }
] as const;

const featureGroups = [
  {
    title: "Sales & Estimating",
    Icon: ClipboardList,
    items: [
      "Opportunities, customers, and projects stay connected",
      "Estimate Builder uses canonical project and catalog foundations",
      "Reusable catalog and system-based estimating foundations"
    ]
  },
  {
    title: "Contracts",
    Icon: FileSignature,
    items: [
      "Contracts generate from approved estimates",
      "Portal and onsite signing on the same canonical record",
      "Signer routing and signature events are shared"
    ]
  },
  {
    title: "Operations",
    Icon: Wrench,
    items: [
      "Jobs and work orders stay tied to projects",
      "Scheduling, daily logs, field notes, and time tracking",
      "Readiness gates protect execution timing"
    ]
  },
  {
    title: "Financials",
    Icon: CircleDollarSign,
    items: [
      "Invoices tied to project, job, and change-order context",
      "Payments update the canonical invoice and project chain",
      "Portal payment extends the same billing records"
    ]
  }
] as const;

const pricingPlans = [
  {
    name: "Starter",
    status: "Early Access",
    price: "Free during onboarding",
    description:
      "Use the real project-to-payment workflow while activation guardrails stay in place.",
    items: [
      "No charge during onboarding",
      "Pricing confirmed before activation",
      "External sends stay locked until active"
    ],
    featured: true
  },
  {
    name: "Pro",
    status: "Planned",
    price: "Packaging in progress",
    description:
      "Expanded operating depth for teams ready to standardize sales, operations, and financial handoffs.",
    items: [
      "Advanced workflow depth planned",
      "Subscription billing not automatic yet",
      "Final pricing subject to confirmation"
    ],
    featured: false
  },
  {
    name: "Enterprise",
    status: "Contact Us",
    price: "Operator-reviewed",
    description:
      "For larger specialty contractors that need implementation planning and activation review.",
    items: [
      "Activation reviewed with an operator",
      "Billing terms confirmed separately",
      "No automatic subscription creation"
    ],
    featured: false
  }
] as const;

const planned = [
  "Scheduling board / dispatch UI",
  "Advanced reporting",
  "AI-assisted estimating / takeoff",
  "Mobile field app",
  "Communications layer",
  "Materials / inventory depth",
  "External integrations"
] as const;

function MarketingButton({
  href,
  children,
  variant = "primary",
  size = "default"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "large";
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2";

  const sizeStyles =
    size === "large"
      ? "min-h-14 rounded-full px-8 text-base gap-2"
      : "min-h-11 rounded-full px-6 text-sm gap-1.5";

  const variantStyles = {
    primary:
      "bg-[var(--graphite)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(55,65,81,0.4)] hover:bg-[var(--graphite-light)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_20px_50px_-16px_rgba(55,65,81,0.5)]",
    secondary:
      "border border-[var(--border-warm)] bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]",
    ghost:
      "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--highlight)]"
  };

  return (
    <Link
      href={href}
      className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]}`}
    >
      {children}
    </Link>
  );
}

export function MarketingInvestorPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--text-primary)]">
      {/* Announcement Banner */}
      <div className="border-b border-[var(--border-warm)] bg-[var(--graphite)] px-4 py-2.5 text-center text-sm text-white">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Early Access Now Open
          <Link
            href={signupHref}
            className="ml-1 inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-white/80"
          >
            Join the cohort
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-warm)] bg-[var(--cream)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--graphite)]">
              <span className="text-sm font-bold text-white">FC</span>
            </div>
            <span className="text-lg font-semibold tracking-normal">
              FloorConnector
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a
              href="#workflow"
              className="transition hover:text-[var(--text-primary)]"
            >
              Workflow
            </a>
            <a
              href="#features"
              className="transition hover:text-[var(--text-primary)]"
            >
              Platform
            </a>
            <a
              href="#pricing"
              className="transition hover:text-[var(--text-primary)]"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={loginHref}
              className="hidden text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:block"
            >
              Log in
            </Link>
            <MarketingButton href={signupHref}>Get Started</MarketingButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:pb-32 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-warm)] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-normal text-[var(--copper)] shadow-sm">
              For Specialty Flooring Contractors
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-normal text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              FloorConnector
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              One connected operating system for specialty flooring contractors,
              carrying opportunity, project, estimate, contract, job, invoice,
              and payment through the same record chain.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MarketingButton href={signupHref} size="large">
                Start Early Access
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </MarketingButton>
              <MarketingButton
                href="#features"
                variant="secondary"
                size="large"
              >
                See How It Works
              </MarketingButton>
            </div>
          </div>

          {/* Hero Visual - Workflow Preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-3xl border border-[var(--border-warm)] bg-white p-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_40px_80px_-20px_rgba(55,65,81,0.15)]">
              <div className="rounded-2xl bg-[var(--graphite)] p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
                    Connected Workflow
                  </p>
                  <p className="text-xs text-white/50">
                    One record, carried forward
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-7">
                  {workflow.map((item, index) => (
                    <div key={item.step} className="group relative">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition hover:bg-white/10">
                        <p className="text-sm font-semibold text-white">
                          {item.step}
                        </p>
                        <p className="mt-1 text-[10px] text-white/50">
                          {item.description}
                        </p>
                      </div>
                      {index < workflow.length - 1 && (
                        <div className="absolute -right-1.5 top-1/2 hidden h-[2px] w-3 -translate-y-1/2 bg-[var(--copper)] sm:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--border-warm)] bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-[var(--border-warm)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-8 py-10 text-center">
              <p className="text-4xl font-semibold tracking-normal text-[var(--copper)] sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section id="workflow" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
              The Problem
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[var(--text-primary)] sm:text-5xl">
              Most teams lose context right when the work becomes billable
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Leads, estimates, contracts, and invoices drift across separate
              tools. Teams re-enter scope instead of carrying one job forward.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2">
            {[
              "Leads, estimates, contracts, and invoices drift across separate tools",
              "Teams re-enter scope instead of carrying one job forward",
              "Approvals, signatures, schedules, and payments lose project context",
              "Owners spend too much time chasing the next handoff"
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-4 rounded-2xl border border-[var(--border-warm)] bg-white p-6 shadow-sm"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-[var(--graphite)] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
              The Solution
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
              One system. One record. One workflow.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Create the record once, let the customer act on it, then keep
              moving from the same updated truth.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Create once",
                description: "One record carries forward"
              },
              {
                title: "Hold the truth",
                description: "Canonical data, always current"
              },
              {
                title: "Customer acts",
                description: "Portal shares the same record"
              },
              {
                title: "Continue from state",
                description: "Pick up where you left off"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--copper)]/20">
                  <Check
                    className="h-5 w-5 text-[var(--copper-light)]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
              Platform
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[var(--text-primary)] sm:text-5xl">
              Built around the real contractor handoff
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Current foundations are live where stated. Planned layers are
              labeled separately.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-4">
            {featureGroups.map((group) => (
              <article
                key={group.title}
                className="group rounded-2xl border border-[var(--border-warm)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--graphite-light)]/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--highlight)] text-[var(--copper)] transition group-hover:bg-[var(--copper)] group-hover:text-white">
                  <group.Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold tracking-normal text-[var(--text-primary)]">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-secondary)]"
                    >
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--copper)]"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
              Pricing
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[var(--text-primary)] sm:text-5xl">
              Start with onboarding, confirm pricing before activation
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Early access is limited and operator-reviewed. No charge during
              onboarding.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={[
                  "relative rounded-2xl border p-8 transition-all duration-300",
                  plan.featured
                    ? "border-[var(--graphite)] bg-[var(--graphite)] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_30px_60px_-15px_rgba(55,65,81,0.3)]"
                    : "border-[var(--border-warm)] bg-[var(--cream)] text-[var(--text-primary)] hover:border-[var(--graphite-light)]/30 hover:shadow-lg"
                ].join(" ")}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--copper)] px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </div>
                )}
                <div>
                  <p
                    className={[
                      "text-xs font-semibold uppercase tracking-normal",
                      plan.featured
                        ? "text-[var(--copper-light)]"
                        : "text-[var(--copper)]"
                    ].join(" ")}
                  >
                    {plan.status}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                    {plan.name}
                  </h3>
                  <p
                    className={[
                      "mt-4 text-lg font-semibold",
                      plan.featured
                        ? "text-white"
                        : "text-[var(--text-primary)]"
                    ].join(" ")}
                  >
                    {plan.price}
                  </p>
                  <p
                    className={[
                      "mt-3 text-sm leading-relaxed",
                      plan.featured
                        ? "text-white/70"
                        : "text-[var(--text-secondary)]"
                    ].join(" ")}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul
                  className={[
                    "mt-8 space-y-3 text-sm",
                    plan.featured
                      ? "text-white/80"
                      : "text-[var(--text-secondary)]"
                  ].join(" ")}
                >
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={[
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.featured
                            ? "text-[var(--copper-light)]"
                            : "text-[var(--copper)]"
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <MarketingButton
                    href={signupHref}
                    variant={plan.featured ? "secondary" : "primary"}
                  >
                    Get Started
                  </MarketingButton>
                </div>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-[var(--text-tertiary)]">
            Pricing is subject to confirmation before activation. Early-access
            flow may collect a payment method for readiness, but does not create
            charges automatically.
          </p>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper)]">
              Roadmap
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal text-[var(--text-primary)] sm:text-5xl">
              More depth, same connected workflow
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {planned.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm font-medium text-[var(--text-secondary)] shadow-sm"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--highlight)] text-[10px] text-[var(--text-tertiary)]">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="early-access" className="px-5 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-[var(--graphite)] p-8 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_40px_80px_-20px_rgba(55,65,81,0.4)] sm:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-[var(--copper-light)]">
                  Get Started Today
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
                  Early Access for Contractors
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
                  Join early access, set up your company, and start using the
                  real workflow with activation guardrails.
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--copper-light)]">
                  No charge during early access onboarding.
                </p>
                <div className="mt-8">
                  <MarketingButton
                    href={signupHref}
                    variant="secondary"
                    size="large"
                  >
                    Start Early Access
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </MarketingButton>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
                <p className="text-lg font-semibold">Request Early Access</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Prefer an operator review before signup? Send a short request
                  and we will route it into the same lead intake foundation.
                </p>
                <div className="mt-6">
                  <EarlyAccessRequestForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
          <p className="text-sm text-[var(--text-tertiary)]">
            Project-centered workflow for specialty flooring contractors.
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
