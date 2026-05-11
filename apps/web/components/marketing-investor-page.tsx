import Link from "next/link";

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
  { value: "40%", label: "faster estimates", description: "with catalog-based pricing" },
  { value: "Zero", label: "re-entry", description: "from estimate to invoice" },
  { value: "1", label: "record truth", description: "across your workflow" }
] as const;

const featureGroups = [
  {
    title: "Sales & Estimating",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    items: [
      "Opportunities, customers, and projects stay connected",
      "Estimate Builder uses canonical project and catalog foundations",
      "Reusable catalog and system-based estimating foundations"
    ]
  },
  {
    title: "Contracts",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    items: [
      "Contracts generate from approved estimates",
      "Portal and onsite signing on the same canonical record",
      "Signer routing and signature events are shared"
    ]
  },
  {
    title: "Operations",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    items: [
      "Jobs and work orders stay tied to projects",
      "Scheduling, daily logs, field notes, and time tracking",
      "Readiness gates protect execution timing"
    ]
  },
  {
    title: "Financials",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
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
    description: "Use the real project-to-payment workflow while activation guardrails stay in place.",
    items: [
      "No charge during onboarding",
      "Pricing confirmed before activation",
      "External sends stay locked until active"
    ],
    featured: true
  },
  {
    name: "Pro",
    status: "Coming Soon",
    price: "Packaging in progress",
    description: "Expanded operating depth for teams ready to standardize sales, operations, and financial handoffs.",
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
    description: "For larger specialty contractors that need implementation planning and activation review.",
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

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

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
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2";
  
  const sizeStyles = size === "large" 
    ? "min-h-14 rounded-full px-8 text-base gap-2" 
    : "min-h-11 rounded-full px-6 text-sm gap-1.5";
  
  const variantStyles = {
    primary: "bg-[var(--graphite)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_16px_40px_-16px_rgba(55,65,81,0.4)] hover:bg-[var(--graphite-light)] hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_20px_50px_-16px_rgba(55,65,81,0.5)]",
    secondary: "border border-[var(--border-warm)] bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]",
    ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--highlight)]"
  };

  return (
    <Link href={href} className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]}`}>
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
          <Link href={signupHref} className="ml-1 inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-white/80">
            Join the cohort
            <ChevronRight />
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
            <span className="text-lg font-semibold tracking-tight">FloorConnector</span>
          </Link>
          
          <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--text-secondary)] md:flex">
            <a href="#workflow" className="transition hover:text-[var(--text-primary)]">Workflow</a>
            <a href="#features" className="transition hover:text-[var(--text-primary)]">Platform</a>
            <a href="#pricing" className="transition hover:text-[var(--text-primary)]">Pricing</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href={loginHref} className="hidden text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] sm:block">
              Log in
            </Link>
            <MarketingButton href={signupHref}>
              Get Started
            </MarketingButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 lg:pb-32 lg:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-warm)] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--copper)] shadow-sm">
              For Specialty Flooring Contractors
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              Run your business from lead to payment
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
              One connected workflow for specialty flooring contractors. Project, estimate, contract, job, invoice, and payment — all in one place.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MarketingButton href={signupHref} size="large">
                Start Free Trial
                <ChevronRight />
              </MarketingButton>
              <MarketingButton href="#features" variant="secondary" size="large">
                See How It Works
              </MarketingButton>
            </div>
          </div>
          
          {/* Hero Visual - Workflow Preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-3xl border border-[var(--border-warm)] bg-white p-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_40px_80px_-20px_rgba(55,65,81,0.15)]">
              <div className="rounded-2xl bg-[var(--graphite)] p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper-light)]">
                    Connected Workflow
                  </p>
                  <p className="text-xs text-white/50">One record, carried forward</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-7">
                  {workflow.map((item, index) => (
                    <div key={item.step} className="group relative">
                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-center transition hover:bg-white/10">
                        <p className="text-sm font-semibold text-white">{item.step}</p>
                        <p className="mt-1 text-[10px] text-white/50">{item.description}</p>
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
              <p className="text-4xl font-semibold tracking-tight text-[var(--copper)] sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{stat.label}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Section */}
      <section id="workflow" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
              The Problem
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
              Most teams lose context right when the work becomes billable
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Leads, estimates, contracts, and invoices drift across separate tools. Teams re-enter scope instead of carrying one job forward.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2">
            {[
              "Leads, estimates, contracts, and invoices drift across separate tools",
              "Teams re-enter scope instead of carrying one job forward",
              "Approvals, signatures, schedules, and payments lose project context",
              "Owners spend too much time chasing the next handoff"
            ].map((item) => (
              <div key={item} className="flex items-start gap-4 rounded-2xl border border-[var(--border-warm)] bg-white p-6 shadow-sm">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-[var(--graphite)] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper-light)]">
              The Solution
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
              One system. One record. One workflow.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Create the record once, let the customer act on it, then keep moving from the same updated truth.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Create once", description: "One record carries forward" },
              { title: "Hold the truth", description: "Canonical data, always current" },
              { title: "Customer acts", description: "Portal shares the same record" },
              { title: "Continue from state", description: "Pick up where you left off" }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--copper)]/20">
                  <svg className="h-5 w-5 text-[var(--copper-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
              Platform
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
              Built around the real contractor handoff
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Current foundations are live where stated. Planned layers are labeled separately.
            </p>
          </div>
          
          <div className="mt-16 grid gap-6 lg:grid-cols-4">
            {featureGroups.map((group) => (
              <article key={group.title} className="group rounded-2xl border border-[var(--border-warm)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--graphite-light)]/30 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--highlight)] text-[var(--copper)] transition group-hover:bg-[var(--copper)] group-hover:text-white">
                  {group.icon}
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      <svg className="mt-1 h-4 w-4 shrink-0 text-[var(--copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
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
      <section id="pricing" className="border-y border-[var(--border-warm)] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
              Pricing
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
              Start with onboarding, confirm pricing before activation
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              Early access is limited and operator-reviewed. No charge during onboarding.
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
                  <p className={["text-xs font-semibold uppercase tracking-[0.15em]", plan.featured ? "text-[var(--copper-light)]" : "text-[var(--copper)]"].join(" ")}>
                    {plan.status}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</h3>
                  <p className={["mt-4 text-lg font-semibold", plan.featured ? "text-white" : "text-[var(--text-primary)]"].join(" ")}>
                    {plan.price}
                  </p>
                  <p className={["mt-3 text-sm leading-relaxed", plan.featured ? "text-white/70" : "text-[var(--text-secondary)]"].join(" ")}>
                    {plan.description}
                  </p>
                </div>
                <ul className={["mt-8 space-y-3 text-sm", plan.featured ? "text-white/80" : "text-[var(--text-secondary)]"].join(" ")}>
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg className={["mt-0.5 h-4 w-4 shrink-0", plan.featured ? "text-[var(--copper-light)]" : "text-[var(--copper)]"].join(" ")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
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
            Pricing is subject to confirmation before activation. Early-access flow may collect a payment method for readiness, but does not create charges automatically.
          </p>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">
              Roadmap
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
              More depth, same connected workflow
            </h2>
          </div>
          
          <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {planned.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-[var(--border-warm)] bg-white px-4 py-3 text-sm font-medium text-[var(--text-secondary)] shadow-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--highlight)] text-[10px] text-[var(--text-tertiary)]">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper-light)]">
                  Get Started Today
                </p>
                <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
                  Early Access for Contractors
                </h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
                  Join early access, set up your company, and start using the real workflow with activation guardrails.
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--copper-light)]">
                  No charge during early access onboarding.
                </p>
                <div className="mt-8">
                  <MarketingButton href={signupHref} variant="secondary" size="large">
                    Start Early Access
                    <ChevronRight />
                  </MarketingButton>
                </div>
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
                <p className="text-lg font-semibold">Request Early Access</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Prefer an operator review before signup? Send a short request and we will route it into the same lead intake foundation.
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
            <span className="text-sm font-semibold tracking-tight">FloorConnector</span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            Project-centered workflow for specialty flooring contractors.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <Link href={loginHref} className="transition hover:text-[var(--text-primary)]">Log in</Link>
            <Link href={signupHref} className="transition hover:text-[var(--text-primary)]">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
