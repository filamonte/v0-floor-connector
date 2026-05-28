import Link from "next/link";

import {
  buildDailyLogCaptureHref,
  buildDailyLogSectionHref,
  getDailyLogDateKey
} from "@/lib/daily-logs/links";
import {
  summarizeFieldAssignedWorkJob,
  type FieldAssignedWorkJob
} from "@/lib/field/assigned-work-read-model";

type AssignedJobContextCardProps = {
  job: FieldAssignedWorkJob;
  currentPersonId: string | null;
};

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function formatCount(label: string, count: number) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function buildTimeHref(input: {
  job: FieldAssignedWorkJob;
  currentPersonId: string | null;
}) {
  const searchParams = new URLSearchParams({
    compose: "1",
    eventType: "punch_in",
    jobId: input.job.id
  });

  if (input.currentPersonId) {
    searchParams.set("personId", input.currentPersonId);
  }

  if (input.job.project?.id) {
    searchParams.set("projectId", input.job.project.id);
  }

  return `/time?${searchParams.toString()}#time-punch-create`;
}

function buildDailyLogHref(job: FieldAssignedWorkJob) {
  const todayKey = getDailyLogDateKey();

  if (job.todayDailyLog) {
    return `/daily-logs/${job.todayDailyLog.id}`;
  }

  if (!job.project?.id) {
    return "/daily-logs";
  }

  return buildDailyLogCaptureHref({
    projectId: job.project.id,
    jobId: job.id,
    logDate: todayKey
  });
}

function buildDailyLogSectionOrCaptureHref(
  job: FieldAssignedWorkJob,
  section: "job-notes" | "field-evidence",
  noteType?: "blocker" | "issue"
) {
  if (job.todayDailyLog) {
    return buildDailyLogSectionHref(job.todayDailyLog.id, section, {
      noteType
    });
  }

  return buildDailyLogHref(job);
}

function getNextMove(job: FieldAssignedWorkJob) {
  if (job.openBlockerCount > 0) {
    return {
      label: "Review blockers",
      href: buildDailyLogSectionOrCaptureHref(job, "job-notes", "blocker"),
      tone: "warning" as const,
      detail:
        "Open blocker or issue notes need field follow-through before work feels clear."
    };
  }

  if (!job.todayDailyLog) {
    return {
      label: "Start today log",
      href: buildDailyLogHref(job),
      tone: "primary" as const,
      detail:
        "Create the project-day execution record first, then add notes and evidence there."
    };
  }

  if (job.openTimeCardCount > 0) {
    return {
      label: "Check active time",
      href: buildTimeHref({ job, currentPersonId: null }),
      tone: "secondary" as const,
      detail:
        "At least one open time card is tied to this job; review punch continuity before the day closes."
    };
  }

  return {
    label: "Add Job Note",
    href: buildDailyLogSectionOrCaptureHref(job, "job-notes"),
    tone: "primary" as const,
    detail: "Capture the next field observation under today's Daily Job Log."
  };
}

function getActionClassName(tone: "primary" | "secondary" | "warning") {
  switch (tone) {
    case "primary":
      return "inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]";
    case "warning":
      return "inline-flex min-h-10 items-center justify-center rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100";
    default:
      return "inline-flex min-h-10 items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#d8731f] hover:text-slate-950";
  }
}

function ContextStat({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={[
        "rounded-[6px] border px-3 py-2",
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-white text-slate-700"
      ].join(" ")}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5">{value}</p>
    </div>
  );
}

export function AssignedJobContextCard({
  job,
  currentPersonId
}: AssignedJobContextCardProps) {
  const summary = summarizeFieldAssignedWorkJob(job);
  const nextMove = getNextMove(job);
  const dailyLogHref = buildDailyLogHref(job);
  const jobNoteHref = buildDailyLogSectionOrCaptureHref(job, "job-notes");
  const blockerHref = buildDailyLogSectionOrCaptureHref(
    job,
    "job-notes",
    "blocker"
  );
  const evidenceHref = buildDailyLogSectionOrCaptureHref(job, "field-evidence");
  const timeHref = buildTimeHref({ job, currentPersonId });

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <div className="border-l-4 border-[#d8731f] bg-white px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">
              {summary.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {summary.customerLabel} / {summary.scheduleLabel} /{" "}
              {labelize(job.dispatchStatus)}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {summary.crewLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/jobs/${job.id}`}
              className={getActionClassName("secondary")}
            >
              Job
            </Link>
            {job.project ? (
              <Link
                href={`/projects/${job.project.id}`}
                className={getActionClassName("secondary")}
              >
                Project
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-3 rounded-[6px] border border-[#e5d2bc] bg-[#fff8ef] px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b5b27]">
                Next field move
              </p>
              <p className="mt-1 text-sm leading-6 text-[#4f4034]">
                {nextMove.detail}
              </p>
            </div>
            <Link
              href={nextMove.href}
              className={getActionClassName(nextMove.tone)}
            >
              {nextMove.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-2 px-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <ContextStat label="Daily Log" value={summary.dailyLogLabel} />
        <ContextStat
          label="Blockers"
          value={summary.blockerLabel}
          tone={job.openBlockerCount > 0 ? "warning" : "default"}
        />
        <ContextStat label="Crew" value={summary.crewLabel} />
        <ContextStat
          label="Time"
          value={`${formatCount("Time Card", job.timeCardCount)}${
            job.openTimeCardCount > 0 ? ` / ${job.openTimeCardCount} open` : ""
          }`}
        />
      </div>

      <div className="grid gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link href={dailyLogHref} className={getActionClassName("primary")}>
          {job.todayDailyLog ? "Open today log" : "Create today log"}
        </Link>
        <Link href={jobNoteHref} className={getActionClassName("secondary")}>
          Add note
        </Link>
        <Link href={blockerHref} className={getActionClassName("warning")}>
          Add blocker
        </Link>
        <Link href={evidenceHref} className={getActionClassName("secondary")}>
          Add evidence
        </Link>
        <Link href={timeHref} className={getActionClassName("secondary")}>
          Punch time
        </Link>
      </div>
    </article>
  );
}
