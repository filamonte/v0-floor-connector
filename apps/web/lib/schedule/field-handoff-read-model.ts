import {
  buildDailyLogCaptureHref,
  buildDailyLogSectionHref
} from "../daily-logs/links";

export type ScheduleFieldHandoffJob = {
  id: string;
  projectId: string;
  scheduledDate: string | null;
  dispatchStatus: string;
  assignmentCount: number;
  title?: string | null;
  customerName?: string | null;
  projectName?: string | null;
};

export type ScheduleFieldHandoffDailyLog = {
  id: string;
  jobId: string | null;
  logDate: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffFieldNote = {
  id: string;
  jobId: string | null;
  noteType: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffTimeCard = {
  id: string;
  jobId: string | null;
  workDate: string;
  status: string;
  updatedAt: string;
};

export type ScheduleFieldHandoffSummary = {
  jobId: string;
  title: string;
  contextLabel: string;
  targetDate: string;
  hasCrewAssigned: boolean;
  dailyLog: {
    id: string;
    logDate: string;
    status: string;
  } | null;
  latestDailyLog: {
    id: string;
    logDate: string;
    status: string;
  } | null;
  openBlockerCount: number;
  fieldNoteCount: number;
  targetDateTimeCardCount: number;
  openTimeCardCount: number;
  latestFieldActivityAt: string | null;
  jobHref: string;
  projectHref: string;
  dailyLogHref: string;
  fieldWorkHref: string;
  blockerHref: string;
  tone: "ready" | "warning" | "blocked" | "neutral";
  label: string;
  detail: string;
};

export type ScheduleFieldHandoffCommandItem = {
  id: string;
  jobId: string;
  title: string;
  contextLabel: string;
  targetDate: string;
  label: string;
  detail: string;
  tone: ScheduleFieldHandoffSummary["tone"];
  jobHref: string;
  projectHref: string;
  dailyLogHref: string;
  fieldWorkHref: string;
  blockerHref: string;
  latestFieldActivityAt: string | null;
};

export type ScheduleFieldHandoffCommandLane = {
  key: "readyToWork" | "needsAttention" | "recentFieldActivity";
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: ScheduleFieldHandoffCommandItem[];
};

export type ScheduleFieldHandoffCommandView = {
  readyToWork: ScheduleFieldHandoffCommandLane;
  needsAttention: ScheduleFieldHandoffCommandLane;
  recentFieldActivity: ScheduleFieldHandoffCommandLane;
};

function sortLatestByDate<T extends { logDate: string; updatedAt: string }>(
  rows: T[]
) {
  return [...rows].sort((left, right) => {
    const dateComparison = right.logDate.localeCompare(left.logDate);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function getLatestActivityAt(input: {
  dailyLogs: ScheduleFieldHandoffDailyLog[];
  fieldNotes: ScheduleFieldHandoffFieldNote[];
  timeCards: ScheduleFieldHandoffTimeCard[];
}) {
  const latest = [
    ...input.dailyLogs.map((row) => row.updatedAt),
    ...input.fieldNotes.map((row) => row.updatedAt),
    ...input.timeCards.map((row) => row.updatedAt)
  ]
    .filter(Boolean)
    .sort()
    .at(-1);

  return latest ?? null;
}

function getTargetDate(job: ScheduleFieldHandoffJob, todayDateKey: string) {
  return job.scheduledDate ?? todayDateKey;
}

function getJobTitle(job: ScheduleFieldHandoffJob) {
  return job.title?.trim() || `Job ${job.id.slice(0, 8)}`;
}

function getContextLabel(job: ScheduleFieldHandoffJob) {
  const projectName = job.projectName?.trim();
  const customerName = job.customerName?.trim();

  if (projectName && customerName) {
    return `${customerName} - ${projectName}`;
  }

  return projectName ?? customerName ?? "Project context";
}

function getHandoffState(input: {
  hasCrewAssigned: boolean;
  dailyLog: ScheduleFieldHandoffSummary["dailyLog"];
  openBlockerCount: number;
  latestFieldActivityAt: string | null;
}) {
  if (input.openBlockerCount > 0) {
    return {
      tone: "blocked" as const,
      label: "Blockers open",
      detail: `${input.openBlockerCount} open field blocker or issue ${
        input.openBlockerCount === 1 ? "note" : "notes"
      } need review before the handoff is clear.`
    };
  }

  if (!input.hasCrewAssigned) {
    return {
      tone: "warning" as const,
      label: "Crew missing",
      detail:
        "No person or labor-provider assignment is attached to this scheduled job yet."
    };
  }

  if (!input.dailyLog) {
    return {
      tone: "warning" as const,
      label: "Daily Log not started",
      detail:
        "No Daily Log exists for the scheduled field date yet; use the canonical Daily Log flow."
    };
  }

  if (input.latestFieldActivityAt) {
    return {
      tone: "ready" as const,
      label: "Field handoff active",
      detail:
        "Crew, Daily Log, and field activity are connected to this job record."
    };
  }

  return {
    tone: "neutral" as const,
    label: "Field handoff ready",
    detail:
      "Crew and Daily Log context are present; field activity will appear here once notes or time are recorded."
  };
}

export function buildScheduleFieldHandoffSummaries(input: {
  jobs: ScheduleFieldHandoffJob[];
  todayDateKey: string;
  dailyLogs: ScheduleFieldHandoffDailyLog[];
  fieldNotes: ScheduleFieldHandoffFieldNote[];
  timeCards: ScheduleFieldHandoffTimeCard[];
}): Map<string, ScheduleFieldHandoffSummary> {
  const dailyLogsByJobId = new Map<string, ScheduleFieldHandoffDailyLog[]>();
  const fieldNotesByJobId = new Map<string, ScheduleFieldHandoffFieldNote[]>();
  const timeCardsByJobId = new Map<string, ScheduleFieldHandoffTimeCard[]>();

  for (const row of input.dailyLogs) {
    if (!row.jobId) {
      continue;
    }

    dailyLogsByJobId.set(row.jobId, [
      ...(dailyLogsByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  for (const row of input.fieldNotes) {
    if (!row.jobId) {
      continue;
    }

    fieldNotesByJobId.set(row.jobId, [
      ...(fieldNotesByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  for (const row of input.timeCards) {
    if (!row.jobId) {
      continue;
    }

    timeCardsByJobId.set(row.jobId, [
      ...(timeCardsByJobId.get(row.jobId) ?? []),
      row
    ]);
  }

  const summaries = new Map<string, ScheduleFieldHandoffSummary>();

  for (const job of input.jobs) {
    const targetDate = getTargetDate(job, input.todayDateKey);
    const dailyLogs = dailyLogsByJobId.get(job.id) ?? [];
    const fieldNotes = fieldNotesByJobId.get(job.id) ?? [];
    const timeCards = timeCardsByJobId.get(job.id) ?? [];
    const targetDailyLog =
      dailyLogs.find((row) => row.logDate === targetDate) ?? null;
    const latestDailyLog = sortLatestByDate(dailyLogs)[0] ?? null;
    const openBlockerCount = fieldNotes.filter(
      (row) =>
        row.status === "open" &&
        (row.noteType === "blocker" || row.noteType === "issue")
    ).length;
    const targetDateTimeCardCount = timeCards.filter(
      (row) => row.workDate === targetDate
    ).length;
    const openTimeCardCount = timeCards.filter(
      (row) => row.status === "open"
    ).length;
    const latestFieldActivityAt = getLatestActivityAt({
      dailyLogs,
      fieldNotes,
      timeCards
    });
    const dailyLogHref = targetDailyLog
      ? `/daily-logs/${targetDailyLog.id}`
      : buildDailyLogCaptureHref({
          projectId: job.projectId,
          jobId: job.id,
          logDate: targetDate
        });
    const blockerHref = targetDailyLog
      ? buildDailyLogSectionHref(targetDailyLog.id, "job-notes", {
          noteType: "blocker"
        })
      : dailyLogHref;
    const state = getHandoffState({
      hasCrewAssigned: job.assignmentCount > 0,
      dailyLog: targetDailyLog
        ? {
            id: targetDailyLog.id,
            logDate: targetDailyLog.logDate,
            status: targetDailyLog.status
          }
        : null,
      openBlockerCount,
      latestFieldActivityAt
    });

    summaries.set(job.id, {
      jobId: job.id,
      title: getJobTitle(job),
      contextLabel: getContextLabel(job),
      targetDate,
      hasCrewAssigned: job.assignmentCount > 0,
      dailyLog: targetDailyLog
        ? {
            id: targetDailyLog.id,
            logDate: targetDailyLog.logDate,
            status: targetDailyLog.status
          }
        : null,
      latestDailyLog: latestDailyLog
        ? {
            id: latestDailyLog.id,
            logDate: latestDailyLog.logDate,
            status: latestDailyLog.status
          }
        : null,
      openBlockerCount,
      fieldNoteCount: fieldNotes.length,
      targetDateTimeCardCount,
      openTimeCardCount,
      latestFieldActivityAt,
      jobHref: `/jobs/${job.id}`,
      projectHref: `/projects/${job.projectId}`,
      dailyLogHref,
      fieldWorkHref: "/field/work-items",
      blockerHref,
      ...state
    });
  }

  return summaries;
}

function toCommandItem(
  summary: ScheduleFieldHandoffSummary
): ScheduleFieldHandoffCommandItem {
  return {
    id: summary.jobId,
    jobId: summary.jobId,
    title: summary.title,
    contextLabel: summary.contextLabel,
    targetDate: summary.targetDate,
    label: summary.label,
    detail: summary.detail,
    tone: summary.tone,
    jobHref: summary.jobHref,
    projectHref: summary.projectHref,
    dailyLogHref: summary.dailyLogHref,
    fieldWorkHref: summary.fieldWorkHref,
    blockerHref: summary.blockerHref,
    latestFieldActivityAt: summary.latestFieldActivityAt
  };
}

function sortByTargetDateThenTitle(
  left: ScheduleFieldHandoffCommandItem,
  right: ScheduleFieldHandoffCommandItem
) {
  const dateComparison = left.targetDate.localeCompare(right.targetDate);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return left.title.localeCompare(right.title);
}

function sortByLatestActivity(
  left: ScheduleFieldHandoffCommandItem,
  right: ScheduleFieldHandoffCommandItem
) {
  return (
    (right.latestFieldActivityAt ?? "").localeCompare(
      left.latestFieldActivityAt ?? ""
    ) || sortByTargetDateThenTitle(left, right)
  );
}

export function buildScheduleFieldHandoffCommandView(input: {
  handoffs: Iterable<ScheduleFieldHandoffSummary>;
  limitPerLane?: number;
}): ScheduleFieldHandoffCommandView {
  const limit = input.limitPerLane ?? 4;
  const items = [...input.handoffs].map(toCommandItem);
  const readyToWork = items
    .filter((item) => item.tone === "ready" || item.tone === "neutral")
    .sort(sortByTargetDateThenTitle)
    .slice(0, limit);
  const needsAttention = items
    .filter((item) => item.tone === "blocked" || item.tone === "warning")
    .sort((left, right) => {
      const toneComparison =
        Number(right.tone === "blocked") - Number(left.tone === "blocked");

      return toneComparison || sortByTargetDateThenTitle(left, right);
    })
    .slice(0, limit);
  const recentFieldActivity = items
    .filter((item) => item.latestFieldActivityAt)
    .sort(sortByLatestActivity)
    .slice(0, limit);

  return {
    readyToWork: {
      key: "readyToWork",
      title: "Ready to work",
      description:
        "Scheduled jobs with crew, Daily Log continuity, and no open field blockers.",
      emptyTitle: "No ready field handoffs right now.",
      emptyDescription:
        "Ready field handoffs will appear here when scheduled jobs have crew, Daily Log context, and no open field blockers.",
      items: readyToWork
    },
    needsAttention: {
      key: "needsAttention",
      title: "Needs attention",
      description:
        "Crew gaps, missing Daily Logs, or open blocker notes that need review before field handoff is clear.",
      emptyTitle: "No field handoff attention items.",
      emptyDescription:
        "Crew gaps, missing Daily Logs, and open field blockers will appear here when existing job records need review.",
      items: needsAttention
    },
    recentFieldActivity: {
      key: "recentFieldActivity",
      title: "Recent field activity",
      description:
        "Latest Daily Log, field note, and time-card movement tied back to scheduled jobs.",
      emptyTitle: "No recent field activity in this view.",
      emptyDescription:
        "Recent Daily Log, field note, and time-card activity will appear here after crews record work on existing jobs.",
      items: recentFieldActivity
    }
  };
}
