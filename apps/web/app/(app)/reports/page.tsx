import Link from "next/link";
import type { ReactNode } from "react";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  loadReportingBasics,
  loadOperationsReportingSummary,
  loadSalesTaxSummary,
  type ReportCount
} from "@/lib/reports/data";
import type {
  OperationsReportingSummary,
  ReportsListItem,
  ReportsMetric,
  ReportsTone
} from "@/lib/reports/operations-summary";

type ReportsPageProps = {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
};

const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "site_assessment_scheduled",
  "site_assessment_complete",
  "estimating",
  "proposal_sent",
  "won",
  "lost",
  "converted"
] as const;

const estimateStatuses = ["draft", "sent", "approved", "rejected"] as const;
const paymentStatuses = ["recorded", "pending", "void"] as const;
const invoiceSummaryStatuses = ["open", "partially_paid", "paid"] as const;

function formatMoney(amount: string | number | undefined) {
  return Number(amount ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function formatPercent(value: string | number) {
  return `${(Number(value) * 100).toFixed(3).replace(/\.?0+$/, "")}%`;
}

function toneClassName(tone: ReportsTone) {
  switch (tone) {
    case "blocked":
      return "border-red-200 bg-red-50 text-red-800";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "good":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-[#e5e5e5] bg-[#f8f8f8] text-[#4f4f4f]";
  }
}

function dateInputValue(value: string | null) {
  return value ?? "";
}

function buildDefaultRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 90);

  return {
    from: toDateInput(from),
    to: toDateInput(today)
  };
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeDateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function getCount<TStatus extends string>(
  counts: Array<ReportCount<TStatus>>,
  status: TStatus
) {
  return (
    counts.find((count) => count.status === status) ?? {
      status,
      count: 0,
      amount: 0
    }
  );
}

function StatusSummaryGrid<TStatus extends string>({
  statuses,
  counts,
  amountLabel
}: {
  statuses: readonly TStatus[];
  counts: Array<ReportCount<TStatus>>;
  amountLabel?: string;
}) {
  return (
    <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
      {statuses.map((status) => {
        const count = getCount(counts, status);

        return (
          <div key={status} className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              {labelize(status)}
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {count.count}
            </p>
            {amountLabel ? (
              <p className="mt-1 text-xs text-slate-500">
                {amountLabel}: {formatMoney(count.amount)}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ReportSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-[#d6d6d6] bg-white">
      <div className="border-b border-[#e5e5e5] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ReportMetricGrid({ metrics }: { metrics: ReportsMetric[] }) {
  return (
    <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Link
          key={metric.id}
          href={metric.href}
          className="border border-[#e5e5e5] bg-white px-4 py-3 transition hover:bg-[#f8f8f8]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              {metric.label}
            </p>
            <span
              className={`rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClassName(
                metric.tone
              )}`}
            >
              {metric.tone === "good" ? "Clear" : metric.tone}
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
            {metric.value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {metric.detail}
          </p>
        </Link>
      ))}
    </section>
  );
}

function AttentionList({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription = "This list appears when source records show work needing review."
}: {
  title: string;
  description: string;
  items: ReportsListItem[];
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <section className="border border-[#d6d6d6] bg-white">
      <div className="border-b border-[#e5e5e5] px-4 py-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-[#171717]">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <div className="divide-y divide-[#e5e5e5]">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block px-4 py-3 transition hover:bg-[#f8f8f8]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#171717]">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                  {item.sourceLabel ? (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666]">
                      {item.sourceLabel}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClassName(
                    item.tone
                  )}`}
                >
                  {item.meta}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-[#171717]">{emptyTitle}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {emptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function OperationsReportingWorkspace({
  summary
}: {
  summary: OperationsReportingSummary;
}) {
  return (
    <div className="space-y-5">
      <ReportSection
        eyebrow="Operations Snapshot"
        title="Company-level attention"
        description="Read-only visibility across projects, CrewBoard, FieldTrail, MessageCenter, billing, and closeout proof."
      >
        <div className="space-y-4 p-4">
          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                  Owner review
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ready, blocked, slipping, and cash pressure signals route back
                  to the owning workspace for action.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 text-xs font-semibold text-[#334155] underline-offset-4 hover:underline"
              >
                Dashboard priorities
              </Link>
            </div>
            <ReportMetricGrid
              metrics={summary.ownerSummary.operatingSnapshot}
            />
          </div>
          <ReportMetricGrid metrics={summary.metrics} />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Today",
                value: summary.counts.jobsScheduledToday,
                detail: "scheduled jobs"
              },
              {
                label: "Upcoming",
                value: summary.counts.upcomingJobs,
                detail: "future scheduled jobs"
              },
              {
                label: "In progress",
                value: summary.counts.inProgressJobs,
                detail: "active jobs"
              },
              {
                label: "Ready",
                value: summary.counts.readyToMove,
                detail: "source-record handoffs"
              },
              {
                label: "Recent",
                value: summary.counts.recentMovement,
                detail: "latest source moves"
              },
              {
                label: "Overdue",
                value: summary.amounts.overdueReceivables,
                detail: `${summary.counts.overdueInvoices} invoice${
                  summary.counts.overdueInvoices === 1 ? "" : "s"
                }`
              }
            ].map((item) => (
              <div
                key={item.label}
                className="border border-[#e5e5e5] bg-white px-3 py-2.5"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </ReportSection>

      <AttentionList
        title="Owner review queue"
        description="The highest-priority source-record items for owner review. Reports summarize; the linked workspace owns the action."
        items={summary.ownerSummary.reviewItems}
        emptyTitle="No owner review items are visible."
        emptyDescription="This queue stays empty until source records create readiness, field, signature, receivable, or scheduling pressure."
      />

      <ReportSection
        eyebrow="Execution to Cash"
        title="Completed work to cash visibility"
        description="Owner-level summary of completed work, billing readiness, collectible invoices, payment event attention, and cash pressure. Field and Financials remain the action owners."
      >
        <div className="space-y-4 p-4">
          <ReportMetricGrid metrics={summary.executionToCashSummary.metrics} />
          <AttentionList
            title="Execution-to-cash handoffs"
            description="Completed work, collectible invoices, and recorded cash linked back to Project, Field, Invoice, or Payment workspaces."
            items={summary.executionToCashSummary.flowItems}
            emptyTitle="No execution-to-cash handoffs are visible."
            emptyDescription="This list appears when canonical jobs, invoices, payments, or payment events create owner-level cash-flow signals."
          />
        </div>
      </ReportSection>

      <ReportSection
        eyebrow="Labor and Field"
        title="Field management snapshot"
        description="Read-only owner visibility into active work, crew coverage, blockers, Daily Log gaps, and field evidence pressure. Field and People remain action owners."
      >
        <div className="space-y-4 p-4">
          <ReportMetricGrid metrics={summary.laborFieldSnapshot.metrics} />
          <AttentionList
            title="Labor and field attention"
            description="Crew, Daily Log, blocker, and evidence signals linked to Field, People, Schedule, Jobs, and Project workspaces."
            items={summary.laborFieldSnapshot.attentionItems}
            emptyTitle="No labor or field pressure is visible."
            emptyDescription="This list appears when canonical jobs, assignments, Daily Logs, field notes, or evidence records need owner review."
          />
        </div>
      </ReportSection>

      <ReportSection
        eyebrow="Portfolio Risk"
        title="Owner exception review"
        description="Cross-portfolio risks from source records only. Reports identify exceptions and route to the workspace that owns the next action."
      >
        <div className="space-y-4 p-4">
          <ReportMetricGrid metrics={summary.portfolioRiskSummary.metrics} />
          <AttentionList
            title="Risk and exception list"
            description="Office-blocked, customer/cash-blocked, overdue, missing, stalled, and closeout exceptions linked to the canonical owner."
            items={summary.portfolioRiskSummary.exceptionItems}
            emptyTitle="No portfolio exceptions are visible."
            emptyDescription="This list stays empty until canonical source records create owner-level exception signals."
          />
        </div>
      </ReportSection>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.continuitySections.map((section) => (
          <AttentionList
            key={section.id}
            title={section.title}
            description={section.description}
            items={section.items}
            emptyTitle={section.emptyTitle}
            emptyDescription="Reports stay empty here until canonical source records create this signal."
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AttentionList
          title="Projects needing Next Move"
          description="Projects where Ready Check attention should be reviewed before handoff."
          items={summary.lists.projectsNeedingNextMove}
          emptyTitle="No project Ready Check attention is visible."
        />
        <AttentionList
          title="Jobs needing scheduling or crew"
          description="CrewBoard work that still needs schedule placement or assignments."
          items={summary.lists.jobsNeedingSchedulingOrCrew}
          emptyTitle="No jobs need scheduling or crew review."
        />
        <AttentionList
          title="Invoices needing collection"
          description="Open receivables linked back to Invoice Workspace."
          items={summary.lists.invoicesNeedingCollection}
          emptyTitle="No open receivables need collection."
        />
        <AttentionList
          title="Contracts waiting signature"
          description="Contracts still in Signature Trail follow-up."
          items={summary.lists.contractsWaitingSignature}
          emptyTitle="No contracts are waiting on signature."
        />
        <AttentionList
          title="Field blockers"
          description="Open blocker or issue Job Notes from FieldTrail."
          items={summary.lists.fieldBlockers}
          emptyTitle="No open FieldTrail blockers are visible."
        />
        <AttentionList
          title="Closeout and proof attention"
          description="Completed work, field proof, and closeout signals that should be reviewed."
          items={summary.lists.closeoutProofAttention}
          emptyTitle="No closeout or proof attention is visible."
        />
      </section>
    </div>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/reports");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Reports need an active organization before canonical records can be
        reviewed.
      </section>
    );
  }

  const defaultRange = buildDefaultRange();
  const from =
    normalizeDateParam(resolvedSearchParams.from) ?? defaultRange.from;
  const to = normalizeDateParam(resolvedSearchParams.to) ?? defaultRange.to;
  const todayIso = toDateInput(new Date());
  const [report, taxReport, operationsReport] = await Promise.all([
    loadReportingBasics({ from, to }),
    loadSalesTaxSummary({ from, to }),
    loadOperationsReportingSummary({
      organizationId: organizationContext.organization.id,
      todayIso
    })
  ]);

  const recordedPayments = getCount(report.payments.counts, "recorded");
  const openInvoices = getCount(report.invoices.counts, "open");
  const partiallyPaidInvoices = getCount(
    report.invoices.counts,
    "partially_paid"
  );
  const estimateValue = report.estimates.counts.reduce(
    (sum, count) => sum + (count.amount ?? 0),
    0
  );

  return (
    <ContractorWorkspacePage
      eyebrow="Reports"
      title={`Reports for ${organizationContext.organization.displayName}`}
      description="Read-only company visibility over source records. Reports route back to the workspaces where teams schedule, collect, sign, and close out work."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Activity window
            </p>
            <p className="mt-1 text-sm font-semibold text-[#171717]">
              {formatDate(from)} to {formatDate(to)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Data model
            </p>
            <p className="mt-1 text-sm font-semibold text-[#171717]">
              Source records only
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Date range applies to lead, estimate, and payment activity. Invoice
            aging and project readiness stay as current-state snapshots because
            they represent open operational pressure.
          </p>
        ),
        searchSlot: (
          <form action="/reports" className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#666666]">
              From
              <input
                type="date"
                name="from"
                defaultValue={dateInputValue(from)}
                className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-[#ef7d32]"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#666666]">
              To
              <input
                type="date"
                name="to"
                defaultValue={dateInputValue(to)}
                className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-[#ef7d32]"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a] sm:self-end"
            >
              Apply
            </button>
            <Link
              href="/reports"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-end"
            >
              Reset
            </Link>
          </form>
        ),
        actionSlot: (
          <Link
            href="/financials/accounting-readiness"
            className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
          >
            Accounting readiness
          </Link>
        )
      }}
    >
      <div className="space-y-5">
        <OperationsReportingWorkspace summary={operationsReport} />

        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {[
            {
              label: "Leads in window",
              value: report.sources.opportunities.length,
              detail: "Updated opportunities",
              href: "/leads"
            },
            {
              label: "Estimate value",
              value: formatMoney(estimateValue),
              detail: "Proposal totals in window",
              href: "/estimates"
            },
            {
              label: "Open receivables",
              value: formatMoney(
                (openInvoices.amount ?? 0) + (partiallyPaidInvoices.amount ?? 0)
              ),
              detail: "Current invoice balances",
              href: "/invoices?status=open"
            },
            {
              label: "Recorded payments",
              value: formatMoney(recordedPayments.amount),
              detail: "Collected in window",
              href: "/payments?status=recorded"
            },
            {
              label: "Project blockers",
              value: report.projectReadiness.blockedCount,
              detail: "Current readiness issues",
              href: "/projects"
            },
            {
              label: "Tax collected",
              value: formatMoney(taxReport.summary.taxCollected),
              detail: "Invoice issue-date basis",
              href: "#sales-tax-summary"
            }
          ].map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="border border-[#e5e5e5] bg-white px-4 py-3 transition hover:bg-[#f8f8f8]"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
            </Link>
          ))}
        </section>

        <ReportSection
          eyebrow="Tax reporting"
          title="Sales Tax Summary"
          description="Filing-prep visibility from canonical invoice tax snapshots using invoice issue date. This does not file returns, remit tax, call a provider, or recalculate historical invoices."
        >
          <div id="sales-tax-summary" className="space-y-4 p-4">
            <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Taxable sales",
                  value: formatMoney(taxReport.summary.taxableSales),
                  detail: "Stored invoice snapshot"
                },
                {
                  label: "Exempt sales",
                  value: formatMoney(taxReport.summary.exemptSales),
                  detail: `${taxReport.summary.exemptInvoiceCount} exempt invoices`
                },
                {
                  label: "Tax collected",
                  value: formatMoney(taxReport.summary.taxCollected),
                  detail: "Stored tax collected snapshot"
                },
                {
                  label: "Filing-prep invoices",
                  value: taxReport.summary.invoiceCount,
                  detail: `${taxReport.summary.paidInvoiceCount} paid / ${taxReport.summary.openInvoiceCount} open`
                }
              ].map((item) => (
                <div key={item.label} className="bg-white px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              <TaxExceptionList
                title="Exemption visibility"
                description="Invoices carrying exempt sales or an exempt customer snapshot."
                rows={taxReport.exceptionRows.exemptInvoices}
              />
              <TaxExceptionList
                title="Open in period"
                description="Issued invoices in this date range that are not fully paid yet."
                rows={taxReport.exceptionRows.openInvoices}
              />
              <TaxExceptionList
                title="Zero-tax taxable sales"
                description="Taxable sales snapshots where collected tax is currently zero."
                rows={taxReport.exceptionRows.zeroTaxWithTaxableSales}
              />
            </div>
          </div>
          <SimpleSalesTaxTable rows={taxReport.rows} />
        </ReportSection>

        <ReportSection
          eyebrow="Pipeline"
          title="Lead pipeline summary"
          description="Opportunity counts by status from canonical lead records, filtered by updated date."
        >
          <div className="p-4">
            <StatusSummaryGrid
              statuses={leadStatuses}
              counts={report.leadPipeline.counts}
            />
          </div>
          <SimpleLeadTable leads={report.leadPipeline.drilldown} />
        </ReportSection>

        <ReportSection
          eyebrow="Commercial"
          title="Estimate summary"
          description="Draft, sent, approved, and rejected estimates by current status. Values are proposal totals, not billing revenue."
        >
          <div className="p-4">
            <StatusSummaryGrid
              statuses={estimateStatuses}
              counts={report.estimates.counts}
              amountLabel="Value"
            />
          </div>
          <SimpleEstimateTable estimates={report.estimates.drilldown} />
        </ReportSection>

        <section className="grid gap-5 xl:grid-cols-2">
          <ReportSection
            eyebrow="Receivables"
            title="Invoice summary"
            description="Current invoice status and balance visibility from canonical invoices only."
          >
            <div className="p-4">
              <StatusSummaryGrid
                statuses={invoiceSummaryStatuses}
                counts={report.invoices.counts}
                amountLabel="Amount"
              />
            </div>
            <SimpleInvoiceTable invoices={report.invoices.openDrilldown} />
          </ReportSection>

          <ReportSection
            eyebrow="Receivables"
            title="Invoice aging"
            description="Open invoice balances grouped by due date, falling back to issue date where due date is missing."
          >
            <div className="divide-y divide-[#e5e5e5]">
              {report.invoices.aging.map((bucket) => (
                <div
                  key={bucket.status}
                  className="grid grid-cols-[1fr_80px_140px] gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-semibold capitalize text-[#171717]">
                    {labelize(bucket.status)}
                  </span>
                  <span className="text-right text-slate-600">
                    {bucket.count}
                  </span>
                  <span className="text-right font-semibold text-slate-950">
                    {formatMoney(bucket.amount)}
                  </span>
                </div>
              ))}
            </div>
          </ReportSection>
        </section>

        <ReportSection
          eyebrow="Cash activity"
          title="Payment activity summary"
          description="Recent canonical payment records by payment date. Only recorded payments are treated as collected cash."
        >
          <div className="p-4">
            <StatusSummaryGrid
              statuses={paymentStatuses}
              counts={report.payments.counts}
              amountLabel="Amount"
            />
          </div>
          <SimplePaymentTable payments={report.payments.recent} />
        </ReportSection>

        <ReportSection
          eyebrow="Readiness"
          title="Project readiness blockers"
          description="Current blocked projects by canonical project readiness status. This view does not read contracts, jobs, or create a separate blocker model."
        >
          <div className="p-4">
            <StatusSummaryGrid
              statuses={report.projectReadiness.counts.map(
                (count) => count.status
              )}
              counts={report.projectReadiness.counts}
            />
          </div>
          <SimpleProjectTable
            projects={report.projectReadiness.blockedProjects}
          />
        </ReportSection>
      </div>
    </ContractorWorkspacePage>
  );
}

function TaxExceptionList({
  title,
  description,
  rows
}: {
  title: string;
  description: string;
  rows: Awaited<ReturnType<typeof loadSalesTaxSummary>>["rows"];
}) {
  return (
    <section className="border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3">
      <p className="text-sm font-semibold text-[#171717]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      <div className="mt-3 space-y-2">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Link
              key={`${title}:${row.invoiceId}`}
              href={`/invoices/${row.invoiceId}`}
              className="block border border-[#e5e5e5] bg-white px-3 py-2 text-sm transition hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-950">
                {row.referenceNumber}
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {row.customerName} / {formatMoney(row.taxCollectedAmount)} tax
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No matching invoices in this range.
          </p>
        )}
      </div>
    </section>
  );
}

function SimpleSalesTaxTable({
  rows
}: {
  rows: Awaited<ReturnType<typeof loadSalesTaxSummary>>["rows"];
}) {
  return (
    <SimpleTable
      emptyTitle="No invoices in this tax reporting window."
      headers={[
        "Invoice",
        "Customer / project",
        "Issue date",
        "Status / payment",
        "Exemption",
        "Rate",
        "Taxable",
        "Exempt",
        "Tax collected"
      ]}
      rows={rows.map((row) => ({
        href: `/invoices/${row.invoiceId}`,
        cells: [
          row.referenceNumber,
          `${row.customerName} / ${row.projectName}`,
          formatDate(row.issueDate),
          `${labelize(row.status)} / ${labelize(row.paymentContext)}`,
          row.customerTaxExemptSnapshot
            ? `Exempt snapshot / ${labelize(row.taxBehaviorApplied)}`
            : `Taxable customer / ${labelize(row.taxBehaviorApplied)}`,
          formatPercent(row.taxRateApplied),
          formatMoney(row.taxableSalesAmount),
          formatMoney(row.exemptSalesAmount),
          formatMoney(row.taxCollectedAmount)
        ]
      }))}
    />
  );
}

function SimpleLeadTable({
  leads
}: {
  leads: Awaited<
    ReturnType<typeof loadReportingBasics>
  >["leadPipeline"]["drilldown"];
}) {
  return (
    <SimpleTable
      emptyTitle="No leads in this window."
      headers={["Lead", "Customer / project", "Status", "Updated"]}
      rows={leads.map((lead) => ({
        href: `/leads/${lead.id}`,
        cells: [
          lead.title,
          `${lead.customer?.name ?? lead.prospectName} / ${lead.project?.name ?? "No project"}`,
          labelize(lead.status),
          formatDate(lead.updatedAt)
        ]
      }))}
    />
  );
}

function SimpleEstimateTable({
  estimates
}: {
  estimates: Awaited<
    ReturnType<typeof loadReportingBasics>
  >["estimates"]["drilldown"];
}) {
  return (
    <SimpleTable
      emptyTitle="No estimates in this window."
      headers={["Estimate", "Customer / project", "Status", "Total"]}
      rows={estimates.map((estimate) => ({
        href: `/estimates/${estimate.id}`,
        cells: [
          estimate.referenceNumber,
          `${estimate.customer?.name ?? "Unknown customer"} / ${estimate.project?.name ?? "No project"}`,
          labelize(estimate.status),
          formatMoney(estimate.totalAmount)
        ]
      }))}
    />
  );
}

function SimpleInvoiceTable({
  invoices
}: {
  invoices: Awaited<
    ReturnType<typeof loadReportingBasics>
  >["invoices"]["openDrilldown"];
}) {
  return (
    <SimpleTable
      emptyTitle="No open invoice balances."
      headers={["Invoice", "Customer / project", "Due", "Balance"]}
      rows={invoices.map((invoice) => ({
        href: `/invoices/${invoice.id}`,
        cells: [
          invoice.referenceNumber,
          `${invoice.customer?.name ?? "Unknown customer"} / ${invoice.project?.name ?? "No project"}`,
          formatDate(invoice.dueDate),
          formatMoney(invoice.balanceDueAmount)
        ]
      }))}
    />
  );
}

function SimplePaymentTable({
  payments
}: {
  payments: Awaited<
    ReturnType<typeof loadReportingBasics>
  >["payments"]["recent"];
}) {
  return (
    <SimpleTable
      emptyTitle="No payments in this window."
      headers={["Payment", "Invoice / project", "Status", "Amount"]}
      rows={payments.map((payment) => ({
        href: payment.invoice?.id
          ? `/invoices/${payment.invoice.id}`
          : "/payments",
        cells: [
          formatDate(payment.paymentDate),
          `${payment.invoice?.referenceNumber ?? "No invoice"} / ${payment.project?.name ?? "No project"}`,
          labelize(payment.status),
          formatMoney(payment.amount)
        ]
      }))}
    />
  );
}

function SimpleProjectTable({
  projects
}: {
  projects: Awaited<
    ReturnType<typeof loadReportingBasics>
  >["projectReadiness"]["blockedProjects"];
}) {
  return (
    <SimpleTable
      emptyTitle="No project readiness blockers."
      headers={["Project", "Customer", "Readiness", "Updated"]}
      rows={projects.map((project) => ({
        href: `/projects/${project.id}`,
        cells: [
          project.name,
          project.customer?.name ?? "Unknown customer",
          labelize(project.commercialReadinessStatus),
          formatDate(project.updatedAt)
        ]
      }))}
    />
  );
}

function SimpleTable({
  headers,
  rows,
  emptyTitle
}: {
  headers: string[];
  rows: Array<{
    href: string;
    cells: string[];
  }>;
  emptyTitle: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border-t border-[#e5e5e5] px-4 py-5">
        <p className="text-sm font-semibold text-[#171717]">{emptyTitle}</p>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Matching canonical records will appear here as teams move work through
          the shared lifecycle.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-t border-[#e5e5e5]">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row) => (
            <tr
              key={`${row.href}:${row.cells.join(":")}`}
              className="hover:bg-slate-50/70"
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.href}:${index}`}
                  className="px-4 py-3 text-slate-600"
                >
                  {index === 0 ? (
                    <Link
                      href={row.href}
                      className="font-semibold text-slate-950 transition hover:text-brand-700"
                    >
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
