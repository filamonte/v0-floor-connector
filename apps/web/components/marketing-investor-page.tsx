import Link from "next/link";

import { EarlyAccessRequestForm } from "@/components/early-access-request-form";

const signupHref = "/signup?next=%2Fsetup%2Fcompany";
const loginHref = "/login";

const workflow = [
  "Lead",
  "Project",
  "Estimate",
  "Contract",
  "Job",
  "Invoice",
  "Payment"
] as const;

const problemItems = [
  "Leads, estimates, contracts, and invoices drift across separate tools.",
  "Teams re-enter scope instead of carrying one job forward.",
  "Approvals, signatures, schedules, and payments lose project context.",
  "Owners spend too much time chasing the next handoff."
] as const;

const featureGroups = [
  {
    title: "Sales & Estimating",
    items: [
      "Opportunities, customers, and projects stay connected.",
      "Estimate Builder uses canonical project and catalog foundations.",
      "Reusable catalog and system-based estimating foundations are in place."
    ]
  },
  {
    title: "Contracts",
    items: [
      "Contracts generate from approved estimates.",
      "Portal and onsite signing act on the same canonical contract record.",
      "Signer routing and signature events are foundational and shared."
    ]
  },
  {
    title: "Operations",
    items: [
      "Jobs and work orders stay tied to projects.",
      "Scheduling, daily logs, field notes, and time tracking have real foundations.",
      "Readiness gates protect execution from moving before the commercial chain is ready."
    ]
  },
  {
    title: "Financials",
    items: [
      "Invoices stay tied to real project, job, estimate, and change-order context.",
      "Payments update the canonical invoice and project chain.",
      "Portal payment foundations extend the same billing records instead of creating a copy."
    ]
  }
] as const;

const comparisonRows = [
  {
    label: "Best fit",
    floorconnector: "Specialty surface contractors moving from spreadsheets to connected operations.",
    contractorForeman: "Broad contractor teams that want many all-in-one modules at accessible entry pricing.",
    serviceTitan: "Larger field-service organizations ready for sales-led enterprise rollout."
  },
  {
    label: "Workflow model",
    floorconnector: "Connected lifecycle with canonical record continuity.",
    contractorForeman: "Broad module coverage across contractor management workflows.",
    serviceTitan: "Enterprise field-service workflows with package and technician-based configuration."
  },
  {
    label: "Setup style",
    floorconnector: "Workflow-first early access onboarding.",
    contractorForeman: "Self-serve plans publicly marketed from around $49/month.",
    serviceTitan: "Request-pricing and implementation-led buying motion."
  },
  {
    label: "Customer portal relationship",
    floorconnector: "Customer acts on the same contract, invoice, and payment truth.",
    contractorForeman: "Portal capability inside a broader construction management suite.",
    serviceTitan: "Customer experience layer suited to scaled service operations."
  },
  {
    label: "Data continuity",
    floorconnector: "One record moves forward from sales to payment.",
    contractorForeman: "Broad connected feature set, with fit depending on configuration.",
    serviceTitan: "Powerful operational data model for larger implementations."
  },
  {
    label: "Complexity",
    floorconnector: "Simpler, specialty workflow-first model.",
    contractorForeman: "Many modules and features to configure.",
    serviceTitan: "Heavier implementation and administration profile."
  },
  {
    label: "Ideal contractor stage",
    floorconnector: "Growing specialty contractors preparing for operational scale.",
    contractorForeman: "Contractors wanting a wide feature catalog early.",
    serviceTitan: "Established field-service businesses with larger teams and budgets."
  }
] as const;

const planned = [
  "Scheduling board / dispatch UI",
  "Advanced reporting",
  "AI-assisted estimating / takeoff",
  "Mobile field app",
  "Communications layer",
  "Materials / inventory depth",
  "External e-sign, payment, and accounting integrations"
] as const;

const pricingPlans = [
  {
    name: "Starter",
    status: "Early Access",
    price: "Limited onboarding cohort",
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
    status: "Coming Soon",
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

function MarketingLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-[-0.01em] transition focus:outline-none focus:ring-4",
        variant === "primary"
          ? "bg-[#09090b] text-white shadow-[0_18px_48px_-28px_rgba(9,9,11,0.9)] hover:bg-[#24242a] focus:ring-[#2563eb]/20"
          : "border border-[#d6d9e1] bg-white text-[#09090b] shadow-[0_1px_0_rgba(9,9,11,0.04)] hover:border-[#9ca3af] hover:bg-[#f8fafc] focus:ring-[#2563eb]/15"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function MarketingInvestorPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f7f8fb] text-[#111217]">
      <header className="sticky top-0 z-20 border-b border-[#e3e6ee]/80 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link href="/" className="text-sm font-semibold tracking-[-0.02em]">
            FloorConnector
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#626b7a] md:flex">
            <a href="#workflow" className="transition hover:text-[#111217]">
              Workflow
            </a>
            <a href="#features" className="transition hover:text-[#111217]">
              Platform
            </a>
            <a href="#comparison" className="transition hover:text-[#111217]">
              Compare
            </a>
            <a href="#pricing" className="transition hover:text-[#111217]">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={loginHref}
              className="text-sm font-semibold text-[#111217] transition hover:text-[#f97316]"
            >
              Log in
            </Link>
            <MarketingLink href={signupHref}>Start early access</MarketingLink>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:min-h-[760px] lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:pb-28 lg:pt-24">
        <div className="absolute inset-x-5 bottom-0 top-0 -z-10 rounded-[2.5rem] border border-white bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] shadow-[0_40px_120px_-90px_rgba(15,23,42,0.55)] sm:inset-x-8" />
        <div className="max-w-5xl px-1">
          <h1 className="text-balance text-[clamp(4rem,8vw,7.7rem)] font-semibold leading-[0.86] tracking-[-0.065em] text-[#07080d]">
            Run specialty contracting from lead to payment
          </h1>
          <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 tracking-[-0.012em] text-[#596274] sm:text-xl">
            One connected workflow for specialty flooring contractors: project,
            estimate, contract, job, invoice, and payment.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <MarketingLink href={signupHref}>Start early access</MarketingLink>
            <MarketingLink href={loginHref} variant="secondary">
              Log in
            </MarketingLink>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e1e5ee] bg-white p-3 shadow-[0_34px_110px_-66px_rgba(15,23,42,0.75)]">
          <div className="rounded-[1.45rem] bg-[#0b0f19] p-5 text-white shadow-inner shadow-white/5">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">
                Connected record
              </p>
              <p className="text-xs text-white/56">Live workflow truth</p>
            </div>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <span className="text-sm font-semibold tracking-[-0.01em]">{step}</span>
                  <span className="text-xs text-white/48">
                    {index === 0
                      ? "created once"
                      : index === workflow.length - 1
                        ? "closed out"
                        : "carried forward"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-[#e4e7ef] bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#07080d] sm:text-5xl">
                Work moves forward.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5c6678]">
                Each step continues from the same customer, project, and commercial record.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-7">
              {workflow.map((step, index) => (
                <div key={step} className="relative rounded-2xl border border-[#e1e5ee] bg-[#f8fafc] px-3 py-6 text-center shadow-[0_16px_44px_-38px_rgba(15,23,42,0.7)]">
                  <p className="text-sm font-semibold tracking-[-0.01em]">{step}</p>
                  {index < workflow.length - 1 ? (
                    <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-[#2563eb] md:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#07080d] sm:text-6xl">
              Most teams lose context right when the work becomes billable.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {problemItems.map((item) => (
              <div key={item} className="rounded-2xl border border-[#e1e5ee] bg-white p-6 text-sm leading-7 text-[#596274] shadow-[0_18px_54px_-46px_rgba(15,23,42,0.7)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07080d] px-5 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2 className="text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              One system. One record. One workflow.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/64">
              Create the record once, let the customer act on it, then keep moving from the same updated truth.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Create once", "Hold the truth", "Customer acts", "Continue from state"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-lg font-semibold tracking-[-0.02em]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-12 max-w-3xl">
          <h2 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#07080d] sm:text-6xl">
            Built around the real contractor handoff
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5c6678]">
            Current foundations are live where stated. Planned layers are labeled separately.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {featureGroups.map((group) => (
            <article key={group.title} className="rounded-[1.35rem] border border-[#e1e5ee] bg-white p-7 shadow-[0_22px_70px_-56px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-[#c9d1df] hover:shadow-[0_28px_80px_-54px_rgba(15,23,42,0.9)]">
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#111217]">{group.title}</h3>
              <ul className="mt-7 space-y-4 text-sm leading-6 text-[#596274]">
                {group.items.map((item) => (
                  <li key={item} className="border-l-2 border-[#2563eb] pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="comparison" className="border-y border-[#e4e7ef] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-5xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#07080d] sm:text-6xl">
            Purpose-built for contractors who need continuity, not more disconnected modules.
          </h2>
          <div className="mt-12 overflow-x-auto rounded-[1.35rem] border border-[#e1e5ee] shadow-[0_26px_80px_-62px_rgba(15,23,42,0.8)]">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead className="bg-[#0b0f19] text-white">
                <tr>
                  <th className="p-5 font-semibold">Dimension</th>
                  <th className="p-5 font-semibold">FloorConnector</th>
                  <th className="p-5 font-semibold">Contractor Foreman</th>
                  <th className="p-5 font-semibold">ServiceTitan</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-t border-[#e1e5ee] align-top">
                    <th className="bg-[#f8fafc] p-5 font-semibold text-[#111217]">{row.label}</th>
                    <td className="p-5 leading-6 text-[#454d5d]">{row.floorconnector}</td>
                    <td className="p-5 leading-6 text-[#454d5d]">{row.contractorForeman}</td>
                    <td className="p-5 leading-6 text-[#454d5d]">{row.serviceTitan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#717b8c]">
            Comparison is positioning-focused and should be rechecked before publication. Public pricing and packaging language can change.
          </p>
        </div>
      </section>

      <section id="pricing" className="border-y border-[#e4e7ef] bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
              Early-access pricing
            </p>
            <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#07080d] sm:text-6xl">
              Start with onboarding, confirm pricing before activation
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5c6678]">
              Early access is limited and operator-reviewed. FloorConnector does not charge during onboarding, and billing or subscription setup is confirmed separately before production activation.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={[
                  "rounded-[1.35rem] border p-7 shadow-[0_22px_70px_-56px_rgba(15,23,42,0.8)]",
                  plan.featured
                    ? "border-[#111217] bg-[#111217] text-white"
                    : "border-[#e1e5ee] bg-[#f8fafc] text-[#111217]"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.045em]">
                      {plan.name}
                    </h3>
                    <p
                      className={[
                        "mt-2 text-xs font-semibold uppercase tracking-[0.18em]",
                        plan.featured ? "text-[#93c5fd]" : "text-[#2563eb]"
                      ].join(" ")}
                    >
                      {plan.status}
                    </p>
                  </div>
                </div>
                <p className="mt-8 text-xl font-semibold tracking-[-0.03em]">
                  {plan.price}
                </p>
                <p
                  className={[
                    "mt-4 text-sm leading-6",
                    plan.featured ? "text-white/68" : "text-[#596274]"
                  ].join(" ")}
                >
                  {plan.description}
                </p>
                <ul
                  className={[
                    "mt-8 space-y-3 text-sm leading-6",
                    plan.featured ? "text-white/78" : "text-[#454d5d]"
                  ].join(" ")}
                >
                  {plan.items.map((item) => (
                    <li key={item} className="border-l-2 border-current pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-xs leading-5 text-[#717b8c]">
            Pricing is subject to confirmation before activation. The current early-access flow may collect a payment method for readiness, but it does not create charges or subscriptions automatically.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
              Coming Soon / Planned
            </p>
            <h2 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#07080d]">
              More depth, same connected workflow
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {planned.map((item) => (
              <div key={item} className="rounded-2xl border border-[#e1e5ee] bg-white p-6 text-sm font-semibold tracking-[-0.01em] text-[#454d5d] shadow-[0_18px_54px_-48px_rgba(15,23,42,0.75)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="early-access" className="px-5 pb-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[2rem] bg-[#07080d] p-8 text-white shadow-[0_34px_110px_-70px_rgba(15,23,42,0.9)] sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-5xl font-semibold leading-[0.98] tracking-[-0.055em]">
              Early Access for Contractors
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">
              Join early access, set up your company, and start using the real workflow with activation guardrails.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#93c5fd]">
              No charge during early access onboarding.
            </p>
            <div className="mt-8">
              <MarketingLink href={signupHref}>Start early access</MarketingLink>
            </div>
          </div>
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <p className="text-sm font-semibold text-white">
              Request Early Access
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Prefer an operator review before signup? Send a short request and we will route it into the same lead intake foundation.
            </p>
            <div className="mt-5">
              <EarlyAccessRequestForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
