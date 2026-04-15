const workflowSteps = [
  "Lead / Opportunity",
  "Customer",
  "Project",
  "Estimate",
  "Approval",
  "Contract",
  "Signature / Notarization",
  "Financial Readiness",
  "Job Execution",
  "Invoice",
  "Payment",
  "Closeout"
];

const capabilityColumns = [
  {
    title: "Operations layer",
    items: [
      "Project-centered system of record",
      "Role-based workflows across sales, operations, and finance",
      "Full lifecycle traceability from lead to closeout"
    ]
  },
  {
    title: "Financial layer",
    items: [
      "Invoice generation tied directly to approved scope",
      "ACH and card processing with retainage and tax-aware behavior",
      "Schedule-of-values support and QuickBooks synchronization foundation"
    ]
  },
  {
    title: "Legal and compliance layer",
    items: [
      "Contract generation from estimates",
      "E-signature and remote online notarization workflows",
      "Lien waivers, releases, and mechanics lien processing"
    ]
  },
  {
    title: "Growth and integration layer",
    items: [
      "Website, SEO, and landing page services tied to attribution",
      "Customer communication and project history",
      "Adapter-based integrations for payments, email, accounting, and identity"
    ]
  }
];

const revenueLayers = [
  "Tiered SaaS subscriptions",
  "Payments revenue from ACH and card processing",
  "Legal and remote notarization fees",
  "Marketing services, hosting, and SEO",
  "Lead generation subscriptions and pay-per-lead access",
  "Future materials, equipment, and overstock marketplace revenue"
];

const roadmap = [
  {
    phase: "Phase 1",
    label: "Current",
    summary:
      "Core SaaS foundation, workflow continuity, invoicing, payments, contract generation, and e-signature."
  },
  {
    phase: "Phase 2",
    label: "Expansion",
    summary:
      "Marketing platform, customer communication, and a broader integration layer that links revenue acquisition to execution."
  },
  {
    phase: "Phase 3",
    label: "Compliance",
    summary:
      "Remote online notarization, lien workflows, and deeper financial controls that reduce friction in high-value commercial work."
  },
  {
    phase: "Phase 4",
    label: "Network",
    summary:
      "Materials marketplace, equipment resale, and contractor-to-contractor commerce that turns the platform into a category network."
  }
];

const advantages = [
  "Vertical specialization for specialty surface contractors",
  "Workflow-first design that eliminates duplicate data entry",
  "End-to-end continuity from estimate through payment",
  "Financial and legal infrastructure inside the operating layer",
  "Multiple monetization paths beyond software subscription"
];

export function MarketingInvestorPage() {
  return (
    <main id="top" className="fc-shell overflow-x-clip">
      <section className="px-6 pb-16 pt-6 sm:px-10 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="flex items-center justify-between gap-6 border-b border-black/5 pb-6">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                Investor brief
              </p>
              <p className="mt-2 text-sm fc-text-soft">
                Vertical SaaS for specialty surface contractors
              </p>
            </div>
            <div className="hidden items-center gap-3 text-sm fc-text-soft md:flex">
              <a href="#platform" className="transition hover:text-stone-950">
                Platform
              </a>
              <a href="#economics" className="transition hover:text-stone-950">
                Economics
              </a>
              <a href="#roadmap" className="transition hover:text-stone-950">
                Roadmap
              </a>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-end">
            <div className="space-y-8">
              <div className="space-y-5">
                <p className="fc-kicker text-xs font-semibold text-stone-500">
                  FloorConnector
                </p>
                <h1 className="fc-display fc-balance max-w-5xl text-[clamp(3.7rem,9vw,7.4rem)] leading-[0.92] text-stone-950">
                  The operating system for specialty surface contractors.
                </h1>
                <p className="fc-pretty max-w-2xl text-lg leading-8 fc-text-muted sm:text-xl">
                  FloorConnector replaces disconnected tools with one continuous
                  operating layer that carries a job from{" "}
                  <span className="fc-accent font-semibold">
                    lead to payment to compliance
                  </span>
                  , while opening new revenue across payments, legal services,
                  growth, and marketplace transactions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#platform"
                  className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
                >
                  Review platform thesis
                </a>
                <a
                  href="#economics"
                  className="rounded-full border border-stone-300/80 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-500 hover:text-stone-950"
                >
                  See revenue layers
                </a>
              </div>
            </div>

            <aside className="fc-panel rounded-[2rem] p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <p className="fc-kicker text-xs font-semibold text-stone-500">
                    Strategic framing
                  </p>
                  <p className="mt-3 text-sm leading-7 fc-text-muted">
                    Not a point solution. A vertical transaction platform built
                    to own operational continuity, financial flows, compliance,
                    and category commerce.
                  </p>
                </div>

                <div className="grid gap-4 border-y border-black/5 py-5">
                  <div className="grid grid-cols-[88px_1fr] gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Model
                    </span>
                    <p className="text-sm leading-7 text-stone-700">
                      Vertical SaaS operating system with embedded transaction
                      revenue.
                    </p>
                  </div>
                  <div className="grid grid-cols-[88px_1fr] gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Market
                    </span>
                    <p className="text-sm leading-7 text-stone-700">
                      Epoxy flooring, concrete polishing, resinous systems, and
                      adjacent specialty surface contractors.
                    </p>
                  </div>
                  <div className="grid grid-cols-[88px_1fr] gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Outcome
                    </span>
                    <p className="text-sm leading-7 text-stone-700">
                      What is sold equals what is executed equals what is billed.
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-stone-600">
                  Built for high-value, repeatable work where scope control,
                  readiness, invoicing discipline, and compliance meaningfully
                  change margins.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="fc-rule" />
          <div className="grid gap-8 py-10 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                The problem
              </p>
              <p className="mt-4 max-w-sm text-base leading-7 fc-text-muted">
                Contractors run revenue-critical work across disconnected tools,
                manual handoffs, and PDFs that break continuity between sale,
                execution, and cash collection.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                The product
              </p>
              <p className="mt-4 max-w-sm text-base leading-7 fc-text-muted">
                One connected data model for customer, project, estimate,
                contract, job, invoice, and payment, with room to expand into
                legal, financial, and marketplace workflows.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                The strategic bet
              </p>
              <p className="mt-4 max-w-sm text-base leading-7 fc-text-muted">
                Own the operating layer first, then capture the adjacent spend
                and transaction volume already flowing through the business.
              </p>
            </div>
          </div>
          <div className="fc-rule" />
        </div>
      </section>

      <section
        id="platform"
        className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-6">
            <p className="fc-kicker text-xs font-semibold text-stone-500">
              Problem and solution
            </p>
            <h2 className="fc-display fc-balance max-w-lg text-5xl leading-tight text-stone-950 sm:text-6xl">
              Contractors are not missing software. They are missing continuity.
            </h2>
            <p className="max-w-md text-base leading-8 fc-text-muted">
              The current stack breaks at every transition: CRM to estimating,
              estimating to contract, contract to scheduling, execution to
              invoicing, invoicing to payment. FloorConnector restores a single
              thread of truth across the job lifecycle.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="fc-panel rounded-[1.75rem] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Fragmented state
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 fc-text-muted">
                <li>CRM disconnected from estimating</li>
                <li>Manual contract handling through PDFs</li>
                <li>Job readiness tracked outside the core system</li>
                <li>Invoices created independently of approved scope</li>
                <li>Payments and accounting detached from execution</li>
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-black/10 bg-stone-950 p-6 text-stone-50 shadow-[0_28px_70px_-40px_rgba(28,25,23,0.7)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-300">
                Operational impact
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-stone-200">
                <li>Duplicate data entry and repeated rework</li>
                <li>Scope leakage between teams and phases</li>
                <li>Revenue loss through tax, retainage, and billing gaps</li>
                <li>No end-to-end traceability when work goes sideways</li>
                <li>Slower cash conversion on completed work</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="space-y-7">
              <div>
                <p className="fc-kicker text-xs font-semibold text-stone-500">
                  Core data model
                </p>
                <h2 className="fc-display mt-4 max-w-4xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                  One record set moves forward. No re-entry. No reinterpretation.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  "Customer",
                  "Project",
                  "Estimate",
                  "Contract",
                  "Job (Work Order)",
                  "Invoice",
                  "Payment"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-black/10 bg-white/75 px-5 py-4 text-sm font-semibold text-stone-800 backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="fc-panel rounded-[2rem] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                Workflow engine
              </p>
              <ol className="mt-5 grid gap-3">
                {workflowSteps.map((step, index) => (
                  <li
                    key={step}
                    className="grid grid-cols-[36px_1fr] items-start gap-4 border-b border-black/5 pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="fc-display text-2xl leading-none text-stone-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 text-sm leading-6 text-stone-700">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                Platform capabilities
              </p>
              <h2 className="fc-display mt-4 max-w-xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                A vertical stack with room to deepen margins over time.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 fc-text-muted">
              FloorConnector starts by fixing operational continuity and expands
              into the adjacent systems that already touch revenue: payments,
              contracts, compliance, communications, and demand generation.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {capabilityColumns.map((column) => (
              <article
                key={column.title}
                className="fc-panel rounded-[1.8rem] p-6 sm:p-8"
              >
                <h3 className="fc-display text-3xl leading-tight text-stone-950">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-7 fc-text-muted">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="economics"
        className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[2.4rem] bg-stone-950 px-6 py-8 text-stone-50 shadow-[0_36px_90px_-48px_rgba(28,25,23,0.8)] sm:px-8">
            <p className="fc-kicker text-xs font-semibold text-stone-400">
              Revenue model
            </p>
            <h2 className="fc-display mt-4 max-w-md text-4xl leading-tight sm:text-5xl">
              High-retention software with multiple ways to monetize the same workflow.
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-stone-300">
              The operating system is the wedge. Transactions, compliance,
              growth services, and future commerce expand lifetime value beyond
              subscription revenue alone.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {revenueLayers.map((item, index) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-black/10 bg-white/80 px-5 py-5 text-sm leading-7 text-stone-700 backdrop-blur"
              >
                <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Layer {index + 1}
                </span>
                <span className="block max-w-[28ch] text-base font-semibold text-stone-900">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="roadmap"
        className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                Product roadmap
              </p>
              <h2 className="fc-display mt-4 max-w-2xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                Expand from operational control into category infrastructure.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 fc-text-muted">
              The sequencing matters: own the system of record first, then add
              higher-margin and higher-liquidity layers once workflow gravity is
              established.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            {roadmap.map((item) => (
              <article
                key={item.phase}
                className="fc-panel rounded-[1.8rem] p-6 sm:min-h-[250px]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  {item.label}
                </p>
                <h3 className="fc-display mt-4 text-3xl text-stone-950">
                  {item.phase}
                </h3>
                <p className="mt-4 text-sm leading-7 fc-text-muted">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.8fr)]">
          <div className="space-y-8">
            <div>
              <p className="fc-kicker text-xs font-semibold text-stone-500">
                Market and moat
              </p>
              <h2 className="fc-display mt-4 max-w-3xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                Vertical depth beats generic software in high-friction trades.
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 fc-text-muted">
              Specialty surface contractors operate in a segment with high job
              value, repeatable workflows, fragmented tooling, and a strong need
              for financial and operational control. Horizontal tools address
              pieces of the workflow. FloorConnector is designed to own the
              connected system.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {advantages.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-black/10 bg-stone-100/70 px-5 py-4 text-sm font-medium leading-7 text-stone-800"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-stone-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,244,246,0.86))] p-6 shadow-[0_24px_70px_-50px_rgba(28,25,23,0.55)] sm:p-8">
            <p className="fc-kicker text-xs font-semibold text-stone-500">
              Long-term vision
            </p>
            <div className="mt-6 space-y-5">
              {[
                "System of record",
                "System of execution",
                "System of payment",
                "System of compliance",
                "System of acquisition",
                "System of commerce"
              ].map((line) => (
                <div
                  key={line}
                  className="flex items-center justify-between gap-4 border-b border-black/6 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-base font-semibold text-stone-900">
                    {line}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.7rem] border border-stone-300/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(231,237,236,0.84))] px-6 py-10 shadow-[0_30px_90px_-60px_rgba(22,71,73,0.55)] sm:px-10 sm:py-12">
            <p className="fc-kicker text-xs font-semibold text-stone-500">
              Closing
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-4">
                <h2 className="fc-display fc-balance max-w-4xl text-4xl leading-tight text-stone-950 sm:text-5xl">
                  FloorConnector is positioned to become the operating and transaction infrastructure of an underserved construction segment.
                </h2>
                <p className="max-w-3xl text-base leading-8 fc-text-muted">
                  By unifying operations, payments, legal workflows, growth
                  services, and future marketplace activity into one system,
                  FloorConnector creates a platform with durable retention,
                  expanding revenue density, and long-term network value.
                </p>
              </div>

              <a
                href="#top"
                className="rounded-full border border-stone-400/70 px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-800 hover:text-stone-950"
              >
                Back to top
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
