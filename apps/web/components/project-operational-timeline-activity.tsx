import Link from "next/link";
import { getStatusBadgeClassName } from "@floorconnector/ui";

import { secondaryActionClassName } from "@/components/action-hierarchy";
import {
  type ProjectOperationalSeverity,
  type ProjectOperationalWorkspaceSummary
} from "@/lib/projects/operational-workspace";
import {
  type ProjectCommandTimeline,
  type ProjectCommandTimelineItem,
  type ProjectCommandTimelineTone
} from "@/lib/projects/timeline";

export type LinkedRecordRecencyItem = {
  id: string;
  recordKey: string;
  typeLabel: string;
  title: string;
  href: string;
  statusLabel: string;
  activityLabel: string;
  timestamp: string;
  timestampLabel: string;
  isDrivingRecord: boolean;
};

const projectWorkspacePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const projectWorkspacePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "No labor time";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
}

function renderStatusBadge(label: string) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        getStatusBadgeClassName(label)
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function LinkedRecordRecencyPanel({
  items
}: {
  items: LinkedRecordRecencyItem[];
}) {
  const mostRecent = items[0] ?? null;

  return (
    <section
      aria-labelledby="linked-record-recency-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 sm:px-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Linked record recency
          </p>
          <h3
            id="linked-record-recency-title"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            What changed recently
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-[var(--text-secondary)]">
            Existing linked records sorted by their own timestamps. This is a
            breadcrumb summary, not a separate project activity feed.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          {items.length} linked {items.length === 1 ? "record" : "records"}
        </span>
      </div>

      {mostRecent ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
              Most recent linked record
            </p>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">
              {mostRecent.typeLabel}: {mostRecent.title}
            </p>
            <p className="mt-1">{mostRecent.activityLabel}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {items.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={[
                  "rounded-lg border bg-[var(--highlight)] px-4 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-white",
                  item.isDrivingRecord
                    ? "border-[var(--copper)] ring-1 ring-[var(--copper)]/20"
                    : "border-[var(--border-warm)]"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {item.typeLabel}
                    </p>
                    <p className="mt-1 truncate font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {item.isDrivingRecord ? (
                      <span className="rounded-full border border-[var(--copper)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--copper)]">
                        Driving next step
                      </span>
                    ) : null}
                    {renderStatusBadge(item.statusLabel)}
                  </div>
                </div>
                <p className="mt-3 text-[var(--text-secondary)]">
                  {item.activityLabel}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                  {item.timestampLabel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          No timestamped linked records are available for this project yet.
        </div>
      )}
    </section>
  );
}

function getTimelineToneClassName(tone: ProjectCommandTimelineTone) {
  switch (tone) {
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "ready":
      return "border-teal-200 bg-teal-50 text-teal-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function ProjectCommandTimelineRow({
  item
}: {
  item: ProjectCommandTimelineItem;
}) {
  return (
    <div className="grid gap-3 border-t border-[var(--border-warm)] py-3 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              getTimelineToneClassName(item.tone)
            ].join(" ")}
          >
            {item.status}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {item.sourceLabel}
          </span>
          {item.customerSafe ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Customer-safe
            </span>
          ) : null}
        </div>
        <Link
          href={item.href}
          className="mt-2 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
        >
          {item.title}
        </Link>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          {item.summary}
        </p>
      </div>
      {item.nextActionLabel && item.nextActionHref ? (
        <div className="flex items-start md:justify-end">
          <Link href={item.nextActionHref} className={secondaryActionClassName}>
            {item.nextActionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function ProjectCommandTimelineSection({
  timeline
}: {
  timeline: ProjectCommandTimeline;
}) {
  const headlineItems =
    timeline.needsAttention.length > 0
      ? timeline.needsAttention.slice(0, 3)
      : timeline.readyToMove.slice(0, 3);
  const supportingItems = timeline.recentMovement
    .filter(
      (item) => !headlineItems.some((headline) => headline.id === item.id)
    )
    .slice(0, 5);

  return (
    <section
      id="project-command-timeline"
      aria-labelledby="project-command-timeline-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 shadow-[0_14px_36px_-34px_rgba(31,41,55,0.42)] sm:px-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Project command timeline
          </p>
          <h3
            id="project-command-timeline-title"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            Recent movement and next handoffs
          </h3>
          <p className="mt-1 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
            Timeline answers what happened and where the source record lives. It
            is derived from linked canonical records, proof, field, payment,
            signature, and communication evidence; it does not create activity
            truth or change source records.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center md:w-72">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-lg font-semibold text-amber-950">
              {timeline.needsAttention.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
              Needs attention
            </p>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
            <p className="text-lg font-semibold text-teal-950">
              {timeline.readyToMove.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-900">
              Ready
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {timeline.items.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Signals
            </p>
          </div>
        </div>
      </div>

      {timeline.items.length > 0 ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {timeline.needsAttention.length > 0
                ? "Needs attention"
                : "Ready to move"}
            </p>
            <div className="mt-3">
              {headlineItems.map((item) => (
                <ProjectCommandTimelineRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Recent movement
            </p>
            <div className="mt-3">
              {supportingItems.length > 0 ? (
                supportingItems.map((item) => (
                  <ProjectCommandTimelineRow key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  New linked record movement will appear here after real
                  estimate, contract, invoice, schedule, field, proof, and
                  communication records are created through the app.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          {timeline.emptyStateMessage}
        </div>
      )}
    </section>
  );
}

function getOperationalSeverityClassName(severity: ProjectOperationalSeverity) {
  switch (severity) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

export function ProjectOperationalIntelligenceSection({
  summary
}: {
  summary: ProjectOperationalWorkspaceSummary;
}) {
  const hasAttention = summary.attentionSignals.length > 0;
  const financeFacts = [
    {
      label: "Contract value",
      value: formatMoney(summary.financial.contractValue),
      detail: "Approved estimate value"
    },
    {
      label: "Approved CO impact",
      value: formatMoney(summary.financial.approvedChangeOrderImpact),
      detail: `${summary.changeOrders.openReviewCount} open review`
    },
    {
      label: "Invoiced",
      value: formatMoney(summary.financial.invoicedAmount),
      detail: `${formatMoney(summary.financial.outstandingBalance)} outstanding`
    },
    {
      label: "Paid",
      value: formatMoney(summary.financial.paidAmount),
      detail: summary.financial.paymentRiskLabel
    },
    {
      label: "Overdue",
      value: formatMoney(summary.financial.overdueExposure),
      detail: `${formatMoney(summary.financial.unpaidDepositAmount)} unpaid deposit`
    },
    {
      label: "Retainage / SOV",
      value: formatMoney(summary.financial.retainageHeldAmount),
      detail: `${formatMoney(summary.financial.progressBillingExposure)} billable progress`
    }
  ];
  const operatingFacts = [
    {
      label: "Schedule",
      value: `${summary.schedule.scheduledJobCount} scheduled / ${summary.schedule.unscheduledJobCount} unscheduled`,
      detail: `${summary.schedule.missingCrewJobCount} missing crew`
    },
    {
      label: "Execution",
      value: `${summary.execution.dailyLogCount} Daily Logs`,
      detail: `${summary.execution.openBlockerCount} open field blockers`
    },
    {
      label: "Labor",
      value: formatDuration(summary.execution.totalWorkedMinutes),
      detail: `${summary.execution.unresolvedFieldNoteCount} open field notes`
    },
    {
      label: "Change orders",
      value: `${summary.changeOrders.openReviewCount} open`,
      detail: `${formatMoney(summary.changeOrders.pendingImpact)} pending impact`
    }
  ];

  return (
    <section
      id="project-operational-intelligence"
      aria-labelledby="project-operational-intelligence-title"
      className={projectWorkspacePanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between sm:px-5",
          projectWorkspacePanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Operational intelligence
          </p>
          <h2
            id="project-operational-intelligence-title"
            className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
          >
            What needs action, what is at risk, and what is moving
          </h2>
          <p className="mt-1 max-w-[76ch] text-sm leading-6 text-[var(--text-secondary)]">
            Derived from the same project readiness, invoice/payment, job, Daily
            Log, field note, change-order, and timeline records already powering
            the focused workspaces.
          </p>
        </div>
        <Link
          href={summary.schedule.nextActionHref}
          className={secondaryActionClassName}
        >
          {summary.schedule.nextActionLabel}
        </Link>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Attention system
              </p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {hasAttention
                  ? `${summary.attentionSignals.length} signal${
                      summary.attentionSignals.length === 1 ? "" : "s"
                    } to resolve`
                  : "No active operational attention signals"}
              </h3>
            </div>
            <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Project-owned view
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {hasAttention ? (
              summary.attentionSignals.map((signal) => (
                <article
                  key={signal.id}
                  className={[
                    "rounded-lg border px-4 py-3 text-sm leading-6",
                    getOperationalSeverityClassName(signal.severity)
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                        {signal.source}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold">
                        {signal.title}
                      </h4>
                      <p className="mt-1 opacity-85">{signal.detail}</p>
                    </div>
                    <Link
                      href={signal.href}
                      className={secondaryActionClassName}
                    >
                      {signal.actionLabel}
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
                Readiness, billing, schedule, field, and change-order attention
                are clear in the current project read.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2">
          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Financial continuity
            </p>
            <div className="mt-4 grid gap-3">
              {financeFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {fact.value}
                  </p>
                  <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Dispatch + execution continuity
            </p>
            <div className="mt-4 grid gap-3">
              {operatingFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {fact.value}
                  </p>
                  <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
            {summary.execution.latestDailyLogHref ? (
              <Link
                href={summary.execution.latestDailyLogHref}
                className={`${secondaryActionClassName} mt-4`}
              >
                Open latest Daily Log
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
