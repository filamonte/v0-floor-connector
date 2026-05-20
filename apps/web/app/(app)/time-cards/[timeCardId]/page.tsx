import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { updateTimeCardReviewAction } from "@/lib/time/actions";
import {
  getTimeCardById,
  listTimePunchEventsForTimeCard
} from "@/lib/time/data";
import { deriveTimeReviewExceptions } from "@/lib/time/exceptions";

type TimeCardDetailPageProps = {
  params: Promise<{
    timeCardId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Still open";
  }

  return new Date(value).toLocaleString();
}

export default async function TimeCardDetailPage({
  params,
  searchParams
}: TimeCardDetailPageProps) {
  const { timeCardId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [timeCard, punchEvents] = await Promise.all([
    getTimeCardById(timeCardId, `/time-cards/${timeCardId}`),
    listTimePunchEventsForTimeCard(timeCardId, `/time-cards/${timeCardId}`)
  ]);

  if (!timeCard) {
    notFound();
  }

  const timeCardExceptions = deriveTimeReviewExceptions({
    nowIso: new Date().toISOString(),
    timeCards: [
      {
        ...timeCard,
        currentPunchState:
          timeCard.status === "open" &&
          punchEvents.at(-1)?.eventType === "break_start"
            ? "on_break"
            : timeCard.status === "open"
              ? "punched_in"
              : null
      }
    ]
  });
  const canApprove =
    timeCard.status === "completed" && timeCard.reviewStatus !== "approved";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        {resolvedSearchParams.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
            {resolvedSearchParams.error}
          </div>
        ) : null}

        {resolvedSearchParams.message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            {resolvedSearchParams.message}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Time Card Review"
            title={timeCard.person?.displayName ?? "Time card"}
            description="Review the derived time card summary alongside the canonical punch events that created it."
            backHref="/time"
            backLabel="Back to time"
            actions={
              <>
                {timeCard.project ? (
                  <Link
                    href={`/projects/${timeCard.project.id}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open project
                  </Link>
                ) : null}
                {timeCard.job ? (
                  <Link
                    href={`/jobs/${timeCard.job.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Open job
                  </Link>
                ) : null}
                {timeCard.serviceTicket ? (
                  <Link
                    href={`/service-tickets/${timeCard.serviceTicket.id}`}
                    className="inline-flex items-center rounded-full border border-[#ef7d32] px-4 py-2 text-sm font-medium text-[#8a4a16] transition hover:bg-[#fff8ef]"
                  >
                    Open service ticket
                  </Link>
                ) : null}
              </>
            }
          />

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Worked</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {formatDuration(timeCard.workedMinutes)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Breaks</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {formatDuration(timeCard.breakMinutes)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Status</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {timeCard.status.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Entry mode</p>
              <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {timeCard.entryMode.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Review</p>
              <p className="mt-3 text-lg font-semibold capitalize tracking-tight text-slate-950">
                {timeCard.reviewStatus.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <DetailPanel
          title="Manager Review"
          description="Approve clean completed time, or reject time that needs correction without changing the underlying punch events."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <section className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Review state
              </p>
              <p className="mt-3 text-lg font-semibold capitalize text-slate-950">
                {timeCard.reviewStatus.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {timeCard.reviewedAt
                  ? `Last reviewed ${formatDateTime(timeCard.reviewedAt)}`
                  : "Not reviewed yet"}
              </p>
              {timeCard.reviewNotes ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {timeCard.reviewNotes}
                </p>
              ) : null}
            </section>

            <section className="space-y-4">
              <form
                action={updateTimeCardReviewAction}
                className="rounded-[1.25rem] border border-[#e3d6c7] bg-[#fffaf4] px-5 py-4"
              >
                <input type="hidden" name="timeCardId" value={timeCard.id} />
                <input type="hidden" name="reviewStatus" value="approved" />
                <p className="text-sm font-semibold text-[#2b2118]">
                  Approve clean completed time
                </p>
                <p className="mt-2 text-sm leading-6 text-[#665446]">
                  Approval marks the derived summary reviewed. It does not post
                  costs, export payroll, or mutate financial records.
                </p>
                <button
                  type="submit"
                  disabled={!canApprove}
                  className="mt-4 inline-flex items-center rounded-[4px] border border-[#17120f] bg-[#17120f] px-4 py-2.5 text-sm font-medium text-[#ffd7bb] transition hover:bg-[#2a1c13] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  Approve time card
                </button>
              </form>

              <form
                action={updateTimeCardReviewAction}
                className="rounded-[1.25rem] border border-slate-200 bg-white px-5 py-4"
              >
                <input type="hidden" name="timeCardId" value={timeCard.id} />
                <input type="hidden" name="reviewStatus" value="rejected" />
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Reject with correction note
                  </span>
                  <textarea
                    name="reviewNotes"
                    rows={3}
                    required
                    className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                    placeholder="Explain what needs correction"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-4 inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#ef7d32] hover:text-slate-950"
                >
                  Reject for correction
                </button>
              </form>
            </section>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Review Exceptions"
          description="Exceptions are derived from punch evidence and review state. They do not auto-correct time."
        >
          <div className="grid gap-3">
            {timeCardExceptions.length > 0 ? (
              timeCardExceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="rounded-[4px] border border-[#e5d2bc] bg-[#fff8ef] px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#2b2118]">
                      {exception.title}
                    </p>
                    <span className="inline-flex rounded-[4px] border border-[#efcfb2] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9b5b27]">
                      {exception.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#665446]">
                    {exception.detail}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                No derived review exceptions are active for this time card.
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Canonical Punch Events"
          description="This is the event audit trail behind the derived card summary."
        >
          <div className="grid gap-4">
            {punchEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold capitalize text-slate-950">
                      {event.eventType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {formatDateTime(event.occurredAt)}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {event.source}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {event.project?.name ?? "No project"}
                  {event.job ? ` | Job ${event.job.id.slice(0, 8)}` : ""}
                </p>
                {event.notes ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {event.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel title="Time Card Summary">
          <dl className="space-y-4 text-sm leading-6 text-slate-600">
            <div>
              <dt className="font-medium text-slate-950">Work date</dt>
              <dd>
                {new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Punch in</dt>
              <dd>{formatDateTime(timeCard.punchInAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Punch out</dt>
              <dd>{formatDateTime(timeCard.punchOutAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Project</dt>
              <dd>{timeCard.project?.name ?? "Not attributed"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Job</dt>
              <dd>
                {timeCard.job ? timeCard.job.id.slice(0, 8) : "Not attributed"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">
                Service/Warranty
              </dt>
              <dd>
                {timeCard.serviceTicket?.title ?? "Not attributed"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-950">Source punches</dt>
              <dd>
                In {timeCard.sourcePunchInEventId.slice(0, 8)}
                {timeCard.sourcePunchOutEventId
                  ? ` | Out ${timeCard.sourcePunchOutEventId.slice(0, 8)}`
                  : " | Open session"}
              </dd>
            </div>
          </dl>
        </DetailPanel>

        <DetailPanel
          title="Connected Records"
          description="Time stays attributable to the same canonical project and job chain."
        >
          <div className="grid gap-4">
            {timeCard.project ? (
              <LinkedRecordCard
                href={`/projects/${timeCard.project.id}`}
                title={timeCard.project.name}
                subtitle="Project"
                meta="Project-level labor continuity"
              />
            ) : null}
            {timeCard.job ? (
              <LinkedRecordCard
                href={`/jobs/${timeCard.job.id}`}
                title={`Job ${timeCard.job.id.slice(0, 8)}`}
                subtitle="Job"
                meta={timeCard.job.dispatchStatus.replaceAll("_", " ")}
              />
            ) : null}
            {timeCard.serviceTicket ? (
              <LinkedRecordCard
                href={`/service-tickets/${timeCard.serviceTicket.id}`}
                title={timeCard.serviceTicket.title}
                subtitle="Service / Warranty"
                meta={`${timeCard.serviceTicket.ticketType.replaceAll("_", " ")} / ${timeCard.serviceTicket.status.replaceAll("_", " ")}`}
              />
            ) : null}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
