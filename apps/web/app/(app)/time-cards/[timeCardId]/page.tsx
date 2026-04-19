import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import {
  getTimeCardById,
  listTimePunchEventsForTimeCard
} from "@/lib/time/data";

type TimeCardDetailPageProps = {
  params: Promise<{
    timeCardId: string;
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
  params
}: TimeCardDetailPageProps) {
  const { timeCardId } = await params;
  const [timeCard, punchEvents] = await Promise.all([
    getTimeCardById(timeCardId, `/time-cards/${timeCardId}`),
    listTimePunchEventsForTimeCard(timeCardId, `/time-cards/${timeCardId}`)
  ]);

  if (!timeCard) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
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
              </>
            }
          />

          <div className="mt-8 grid gap-4 md:grid-cols-4">
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
          </div>
        </div>

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
                  <p className="mt-2 text-sm leading-6 text-slate-600">{event.notes}</p>
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
              <dd>{new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()}</dd>
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
              <dd>{timeCard.job ? timeCard.job.id.slice(0, 8) : "Not attributed"}</dd>
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
                meta={timeCard.job.status.replaceAll("_", " ")}
              />
            ) : null}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}

