import Link from "next/link";

const workflowSteps = [
  {
    title: "Lead",
    description: "Capture the opportunity before it disappears into calls, texts, and spreadsheets."
  },
  {
    title: "Estimate",
    description: "Build connected pricing tied to the right customer and project."
  },
  {
    title: "Job",
    description: "Move approved work into scheduling and field execution with the same source record."
  },
  {
    title: "Invoice",
    description: "Bill from real project context instead of recreating data in a separate system."
  },
  {
    title: "Payment",
    description: "Track balances, collections, and closeout from the same operational thread."
  }
] as const;

const featureGroups = [
  {
    title: "CRM and customer records",
    description:
      "Track leads, customers, and projects in one tenant-scoped system so the relationship stays connected as work moves forward."
  },
  {
    title: "Estimating and sales workflow",
    description:
      "Create estimates tied to real projects, review approvals clearly, and move approved work into the next stage without duplicate entry."
  },
  {
    title: "Job tracking and execution",
    description:
      "Keep project, estimate, job, and invoice context visible together so operations can see what is sold, scheduled, in progress, and complete."
  },
  {
    title: "Invoicing and payment tracking",
    description:
      "Generate canonical invoices from live project context and follow balance due, payments, tax, and retainage from one place."
  }
] as const;

const problems = [
  "Leads, estimates, jobs, and invoices live in different apps.",
  "Teams re-enter the same information at every handoff.",
  "Revenue slips when sold work, executed work, and billed work stop matching.",
  "Owners end up managing the business through calls, texts, and spreadsheets."
] as const;

const differentiators = [
  "Built for epoxy flooring and concrete polishing contractors",
  "Project-centered workflow instead of disconnected modules",
  "One connected record flow from lead through payment",
  "Operational clarity for sales, field work, and billing in the same system"
] as const;

export function MarketingInvestorPage() {
  return (
    <main id="top" className="fc-shell overflow-x-clip">
      <section className="px-6 pb-16 pt-6 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-6 border-b border-black/5 pb-6">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                FloorConnector
              </p>
              <p className="mt-2 text-sm fc-text-soft">
                Operating system for epoxy flooring and concrete polishing contractors
              </p>
            </div>
            <div className="hidden items-center gap-3 text-sm fc-text-soft md:flex">
              <a href="#problem" className="transition hover:text-stone-950">
                Problem
              </a>
              <a href="#workflow" className="transition hover:text-stone-950">
                Workflow
              </a>
              <a href="#platform" className="transition hover:text-stone-950">
                Platform
              </a>
            </div>
          </div>

          <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="space-y-8">
              <div className="space-y-5">
                <p className="fc-kicker text-xs font-semibold text-stone-500">
                  Run your flooring business from one system
                </p>
                <h1 className="fc-display fc-balance max-w-5xl text-[clamp(3.4rem,8vw,7rem)] leading-[0.94] text-stone-950">
                  The connected platform for selling work, running jobs, and getting paid.
                </h1>
                <p className="fc-pretty max-w-2xl text-lg leading-8 fc-text-muted sm:text-xl">
                  FloorConnector helps epoxy flooring and concrete polishing contractors manage leads, estimates, jobs, invoices, and payments in one connected workflow instead of five disconnected tools.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
                >
                  Start free trial
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-stone-300/80 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-500 hover:text-stone-950"
                >
                  View the product
                </Link>
              </div>
            </div>

            <aside className="fc-panel rounded-[2rem] p-6 sm:p-8">
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                Why it matters
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-black/6 bg-white/70 px-5 py-4">
                  <p className="text-sm font-semibold text-stone-900">What you sell</p>
                  <p className="mt-2 text-sm leading-6 fc-text-muted">
                    Leads and estimates stay tied to the real customer and project.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-black/6 bg-white/70 px-5 py-4">
                  <p className="text-sm font-semibold text-stone-900">What you run</p>
                  <p className="mt-2 text-sm leading-6 fc-text-muted">
                    Jobs move into execution without retyping scope, customer info, or project context.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-black/6 bg-white/70 px-5 py-4">
                  <p className="text-sm font-semibold text-stone-900">What you bill</p>
                  <p className="mt-2 text-sm leading-6 fc-text-muted">
                    Invoices and payments stay connected to the same work that was sold and completed.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="problem" className="px-6 py-12 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="fc-rule" />
          <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">The problem</p>
              <h2 className="fc-display mt-4 max-w-xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                Flooring companies lose time and revenue in the handoff between systems.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {problems.map((problem) => (
                <div
                  key={problem}
                  className="rounded-[1.6rem] border border-black/10 bg-white/80 px-5 py-5 text-sm leading-7 text-stone-700 backdrop-blur"
                >
                  {problem}
                </div>
              ))}
            </div>
          </div>
          <div className="fc-rule" />
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-end">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">The solution</p>
              <h2 className="fc-display mt-4 max-w-2xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                One connected workflow instead of a stack of disconnected tools.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 fc-text-muted">
                FloorConnector keeps the same customer, project, estimate, job, invoice, and payment records moving forward through the business so teams stop recreating the same work at every stage.
              </p>
            </div>

            <div className="rounded-[2rem] border border-stone-300/70 bg-stone-950 px-6 py-8 text-stone-50 shadow-[0_30px_90px_-60px_rgba(22,71,73,0.55)] sm:px-8">
              <p className="fc-kicker text-xs font-semibold text-stone-400">What changes</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-stone-200">
                <p>What is sold matches what is scheduled.</p>
                <p>What is completed matches what is invoiced.</p>
                <p>What is billed matches what gets collected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">Connected workflow</p>
              <h2 className="fc-display mt-4 max-w-xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                Lead to payment in one operational thread.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 fc-text-muted">
              The goal is simple: the same job should not have to be recreated in CRM, estimating, operations, and invoicing just to move through the business.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="fc-panel rounded-[1.7rem] p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-stone-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 fc-text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">Platform capabilities</p>
              <h2 className="fc-display mt-4 max-w-xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                Built for how specialty flooring contractors actually work.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 fc-text-muted">
              FloorConnector is not generic contractor software with disconnected modules. It is designed around the real commercial and operational flow of epoxy flooring and concrete polishing businesses.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featureGroups.map((feature) => (
              <article
                key={feature.title}
                className="fc-panel rounded-[1.8rem] p-6 sm:p-8"
              >
                <h3 className="text-2xl font-semibold leading-tight text-stone-950">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-7 fc-text-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="fc-kicker text-xs font-semibold text-stone-500">Why it is different</p>
            <h2 className="fc-display mt-4 max-w-xl text-4xl leading-tight text-stone-950 sm:text-5xl">
              Generic contractor tools manage modules. FloorConnector manages continuity.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-black/10 bg-white/80 px-5 py-5 text-sm font-medium leading-7 text-stone-800 backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.7rem] border border-stone-300/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(231,237,236,0.84))] px-6 py-10 shadow-[0_30px_90px_-60px_rgba(22,71,73,0.55)] sm:px-10 sm:py-12">
            <p className="fc-kicker text-xs font-semibold text-stone-500">Start here</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <h2 className="fc-display fc-balance max-w-4xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                  Run your flooring business from one system.
                </h2>
                <p className="max-w-3xl text-base leading-8 fc-text-muted">
                  FloorConnector gives epoxy flooring and concrete polishing contractors one connected place to manage leads, projects, estimates, jobs, invoices, and payments.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
                >
                  Start free trial
                </Link>
                <a
                  href="#top"
                  className="rounded-full border border-stone-400/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-800 hover:text-stone-950"
                >
                  Back to top
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
