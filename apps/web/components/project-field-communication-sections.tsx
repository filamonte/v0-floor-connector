import Link from "next/link";
import type { ReactNode } from "react";
import { getStatusBadgeClassName } from "@floorconnector/ui";

import { secondaryActionClassName } from "@/components/action-hierarchy";
import { AppEmptyState } from "@/components/app-empty-state";
import { getFieldNoteTypeLabel } from "@/lib/field-notes/labels";
import type { FieldTrailSummary } from "@/lib/fieldtrail/summary";
import type {
  MessageCenterSummary,
  MessageCenterTimelineItem
} from "@/lib/messagecenter/summary";

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not marked yet";
}

function joinMetaParts(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" | ");
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
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

function getMessageCenterTimelineClassName(
  tone: MessageCenterTimelineItem["tone"]
) {
  switch (tone) {
    case "positive":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-950";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export type ProjectFieldTrailSectionProps = {
  summary: FieldTrailSummary;
  emptyDailyLogActionHref: string;
};

export function ProjectFieldTrailSection({
  summary,
  emptyDailyLogActionHref
}: ProjectFieldTrailSectionProps) {
  const timelineItems = summary.timeline.slice(0, 4);

  return (
    <section
      id="fieldtrail"
      className="rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            FieldTrail
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Project execution timeline
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Daily Job Logs, Job Notes, field evidence, and labor time stay
            readable here while the detailed work remains in the daily-log, job,
            and time workspaces.
          </p>
        </div>
        <Link href={summary.nextMove.href} className={secondaryActionClassName}>
          Field Next Move
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Daily Job Logs",
            value: summary.dailyLogCount,
            detail: summary.latestDailyLog
              ? `Latest ${formatDate(summary.latestDailyLog.logDate)}`
              : "No Daily Job Logs yet"
          },
          {
            label: "Open blockers",
            value: summary.openBlockerCount,
            detail:
              summary.openBlockerCount > 0
                ? "Job Notes need review"
                : "No open blockers"
          },
          {
            label: "Field evidence",
            value: summary.attachmentCount,
            detail: `${summary.photoCount} photo${
              summary.photoCount === 1 ? "" : "s"
            } attached`
          },
          {
            label: "Labor",
            value: formatDuration(summary.totalWorkedMinutes),
            detail: "From project time cards"
          },
          {
            label: "Field Next Move",
            value:
              summary.openBlockerCount > 0
                ? "Review blockers"
                : summary.latestDailyLog
                  ? "Review latest log"
                  : "Start execution",
            detail: summary.nextMove.detail
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {timelineItems.length > 0 ? (
          timelineItems.map((item) => (
            <div
              key={item.dailyLog.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    href={`/daily-logs/${item.dailyLog.id}`}
                    className="text-sm font-semibold text-slate-950 hover:text-brand-700"
                  >
                    {item.dailyLog.summary?.trim() ||
                      formatDate(item.dailyLog.logDate)}
                  </Link>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {joinMetaParts([
                      formatDate(item.dailyLog.logDate),
                      item.dailyLog.jobId
                        ? `Job ${item.dailyLog.jobId.slice(0, 8)}`
                        : "Project day",
                      item.dailyLog.weatherSummary
                    ])}
                  </p>
                </div>
                {renderStatusBadge(formatStatusLabel(item.dailyLog.status))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-950">
                    Job Notes:
                  </span>{" "}
                  {item.notes.length}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-950">
                    Blockers:
                  </span>{" "}
                  {item.openBlockerCount}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-950">
                    Evidence:
                  </span>{" "}
                  {item.attachmentCount}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-950">Labor:</span>{" "}
                  {formatDuration(item.laborMinutes)}
                </p>
              </div>
              {item.notes.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {item.notes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span>
                        <span className="font-semibold text-slate-950">
                          {getFieldNoteTypeLabel(note.noteType)}:
                        </span>{" "}
                        {note.title}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatStatusLabel(note.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <AppEmptyState
            eyebrow="No Daily Job Logs yet"
            title="No field history has been captured"
            description="Use the Daily Job Log to capture work completed, blockers, safety notes, photos, and crew activity once field work begins."
            actionHref={emptyDailyLogActionHref}
            actionLabel="Start Daily Job Log"
          />
        )}
      </div>
    </section>
  );
}

export type ProjectMessageCenterSectionProps = {
  summary: MessageCenterSummary;
  communicationComposer: ReactNode;
  emptyCommunicationHref: string;
};

export function ProjectMessageCenterSection({
  summary,
  communicationComposer,
  emptyCommunicationHref
}: ProjectMessageCenterSectionProps) {
  const timelineItems = summary.timeline.slice(0, 6);

  return (
    <section
      id="messagecenter"
      className="rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
            MessageCenter
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Project communication timeline
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Messages, Send Trail activity, Signature Trail events, and Payment
            Trail events stay connected to this project while replies and deeper
            review remain in the communications and record workspaces.
          </p>
        </div>
        <Link href={summary.nextMove.href} className={secondaryActionClassName}>
          Communication Next Move
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          {
            label: "Threads",
            value: summary.threadCount,
            detail:
              summary.threadCount > 0
                ? "Project-linked conversations"
                : "No communication history yet"
          },
          {
            label: "Messages",
            value: summary.messageCount,
            detail: summary.latestActivityAt
              ? `${summary.customerVisibleMessageCount ?? 0} customer-visible / ${summary.internalMessageCount ?? 0} internal`
              : "No customer replies found yet"
          },
          {
            label: "Send Trail",
            value: summary.sendTrailCount,
            detail:
              summary.latestSendTrail?.description ??
              "No Send Trail activity yet"
          },
          {
            label: "Signature Trail",
            value: summary.signatureTrailCount,
            detail:
              summary.latestSignatureTrail?.description ??
              "No signature activity yet"
          },
          {
            label: "Payment Trail",
            value: summary.paymentTrailCount,
            detail:
              summary.latestPaymentTrail?.description ??
              "No payment activity yet"
          },
          {
            label: "Communication Next Move",
            value:
              (summary.customerReplyNeedsResponseCount ?? 0) > 0
                ? "Customer reply"
                : summary.attentionCount > 0
                  ? "Needs follow-up"
                  : summary.latestActivityAt
                    ? "Review latest"
                    : "Start thread",
            detail: summary.nextMove.detail
          }
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {(summary.customerReplyNeedsResponseCount ?? 0) > 0 &&
        summary.latestCustomerReply ? (
          <Link
            href={summary.latestCustomerReply.href}
            className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 transition hover:bg-amber-100/70"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Customer reply needs follow-up
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {summary.latestCustomerReply.title}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {summary.latestCustomerReply.description}
                </p>
              </div>
              <p className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] opacity-75">
                {formatDateTime(summary.latestCustomerReply.occurredAt)}
              </p>
            </div>
          </Link>
        ) : null}

        {communicationComposer}

        {timelineItems.length > 0 ? (
          timelineItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "rounded-lg border p-4 transition hover:border-[var(--copper)] hover:bg-white",
                getMessageCenterTimelineClassName(item.tone)
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-75">
                    {item.eyebrow}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-80">
                    {item.description}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-medium uppercase tracking-[0.12em] opacity-70">
                  {formatDateTime(item.occurredAt)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <AppEmptyState
            eyebrow="No communication history yet"
            title="No project communication has been captured"
            description="Use MessageCenter to keep project communication connected to the job. When messages, document sends, signatures, or payment events exist, they will appear here from real records."
            actionHref={emptyCommunicationHref}
            actionLabel="Open communications"
          />
        )}
      </div>
    </section>
  );
}
