import type { JobStatus } from "@floorconnector/types";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

export type FieldAssignedWorkAssignee = {
  id: string;
  label: string;
  kind: "person" | "vendor";
  role: string;
};

export type FieldAssignedWorkJob = {
  id: string;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  scheduleNotes: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  assignments: FieldAssignedWorkAssignee[];
  dailyLogCount: number;
  latestDailyLog: {
    id: string;
    logDate: string;
    status: string;
  } | null;
  fieldNoteCount: number;
  openFieldBlockerCount: number;
  latestOpenFieldBlocker: {
    id: string;
    dailyLogId: string;
    title: string;
    noteType: string;
  } | null;
  timeCardCount: number;
  openTimeCardCount: number;
  readiness: ProjectFinancialReadinessSnapshot | null;
};

export type FieldExecutionReadinessBriefStatus =
  | "ready"
  | "blocked"
  | "needs_context";

export type FieldExecutionReadinessBrief = {
  status: FieldExecutionReadinessBriefStatus;
  label: string;
  detail: string;
  sources: Array<{
    label: string;
    href: string | null;
  }>;
};

export type FieldDailyExecutionCommandStatus =
  | "blocked"
  | "start_daily_log"
  | "record_observation"
  | "continue_execution"
  | "closeout_review";

export type FieldDailyExecutionCommand = {
  status: FieldDailyExecutionCommandStatus;
  label: string;
  detail: string;
  nextActionLabel: string;
  nextActionHref: string;
  observationLabel: string;
  evidenceLabel: string;
};

export type FieldAssignedWorkGroupKey =
  | "today"
  | "upcoming"
  | "unscheduled"
  | "recentlyCompleted";

export type FieldAssignedWorkQueue = Record<
  FieldAssignedWorkGroupKey,
  FieldAssignedWorkJob[]
>;

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function getScheduledSortValue(job: FieldAssignedWorkJob) {
  return (
    job.scheduledStartAt ??
    job.scheduledDate ??
    (job.dispatchStatus === "completed" ? job.updatedAt : "9999-12-31")
  );
}

function sortAssignedWorkJobs(jobs: FieldAssignedWorkJob[]) {
  return [...jobs].sort((left, right) => {
    const scheduledComparison = getScheduledSortValue(left).localeCompare(
      getScheduledSortValue(right)
    );

    if (scheduledComparison !== 0) {
      return scheduledComparison;
    }

    return left.id.localeCompare(right.id);
  });
}

function sortRecentlyCompleted(jobs: FieldAssignedWorkJob[]) {
  return [...jobs].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

export function buildFieldAssignedWorkQueue(input: {
  jobs: FieldAssignedWorkJob[];
  today: Date;
  upcomingHorizonDays?: number;
  completedLimit?: number;
}): FieldAssignedWorkQueue {
  const today = new Date(input.today);
  today.setHours(0, 0, 0, 0);
  const todayKey = getDateKey(today);
  const upcomingEnd = addDays(today, input.upcomingHorizonDays ?? 14);

  const groups: FieldAssignedWorkQueue = {
    today: [],
    upcoming: [],
    unscheduled: [],
    recentlyCompleted: []
  };

  for (const job of input.jobs) {
    if (job.dispatchStatus === "completed") {
      groups.recentlyCompleted.push(job);
      continue;
    }

    if (
      job.dispatchStatus === "in_progress" ||
      job.scheduledDate === todayKey
    ) {
      groups.today.push(job);
      continue;
    }

    const scheduledDate = parseDateKey(job.scheduledDate);

    if (
      scheduledDate &&
      scheduledDate > today &&
      scheduledDate <= upcomingEnd
    ) {
      groups.upcoming.push(job);
      continue;
    }

    if (!scheduledDate) {
      groups.unscheduled.push(job);
    }
  }

  return {
    today: sortAssignedWorkJobs(groups.today),
    upcoming: sortAssignedWorkJobs(groups.upcoming),
    unscheduled: sortAssignedWorkJobs(groups.unscheduled),
    recentlyCompleted: sortRecentlyCompleted(groups.recentlyCompleted).slice(
      0,
      input.completedLimit ?? 6
    )
  };
}

export function summarizeFieldAssignedWorkJob(job: FieldAssignedWorkJob) {
  const crewLabels = job.assignments.map((assignment) => assignment.label);

  return {
    title: job.project?.name ?? `Job ${job.id.slice(0, 8)}`,
    customerLabel:
      job.customer?.companyName ?? job.customer?.name ?? "Unknown customer",
    scheduleLabel: job.scheduledStartAt
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        }).format(new Date(job.scheduledStartAt))
      : job.scheduledDate
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric"
          }).format(new Date(`${job.scheduledDate}T00:00:00`))
        : "Unscheduled",
    crewLabel: crewLabels.length > 0 ? crewLabels.join(", ") : "No crew listed"
  };
}

function requiresSameDayDailyLog(job: FieldAssignedWorkJob) {
  return job.dispatchStatus === "in_progress" || job.scheduledDate !== null;
}

function getReadinessBlockerLabel(blocker: string) {
  return blocker.replaceAll("_", " ");
}

export function buildFieldExecutionReadinessBrief(
  job: FieldAssignedWorkJob
): FieldExecutionReadinessBrief {
  const sources: FieldExecutionReadinessBrief["sources"] = [
    {
      label: "Job",
      href: `/jobs/${job.id}`
    }
  ];

  if (job.project) {
    sources.push({
      label: "Project",
      href: `/projects/${job.project.id}`
    });
  } else {
    sources.push({
      label: "Project missing",
      href: null
    });
  }

  if (job.customer) {
    sources.push({
      label: "Customer",
      href: `/customers/${job.customer.id}`
    });
  } else {
    sources.push({
      label: "Customer missing",
      href: null
    });
  }

  if (job.latestDailyLog) {
    sources.push({
      label: `Daily Log ${job.latestDailyLog.logDate}`,
      href: `/daily-logs/${job.latestDailyLog.id}`
    });
  } else {
    sources.push({
      label: "Daily Log missing",
      href: null
    });
  }

  if (!job.project || !job.customer || !job.readiness) {
    return {
      status: "needs_context",
      label: "Readiness context missing",
      detail:
        "Project, customer, or project readiness context is not complete enough to verify field handoff.",
      sources
    };
  }

  if (!job.readiness.isReadyToSchedule) {
    const blocker =
      job.readiness.blockers[0] ?? job.readiness.status ?? "not_ready";

    return {
      status: "blocked",
      label: "Project readiness blocked",
      detail: getReadinessBlockerLabel(blocker),
      sources
    };
  }

  if (job.openFieldBlockerCount > 0) {
    return {
      status: "blocked",
      label: "Field blocker open",
      detail:
        job.latestOpenFieldBlocker?.title ??
        `${job.openFieldBlockerCount} open blocker or issue note`,
      sources: job.latestOpenFieldBlocker
        ? [
            ...sources,
            {
              label: "Open blocker",
              href: `/daily-logs/${job.latestOpenFieldBlocker.dailyLogId}#job-notes`
            }
          ]
        : sources
    };
  }

  if (requiresSameDayDailyLog(job) && !job.latestDailyLog) {
    return {
      status: "needs_context",
      label: "Daily Log not started",
      detail:
        "Field work is scheduled or in progress, but no Daily Log is linked to this job yet.",
      sources
    };
  }

  return {
    status: "ready",
    label: "Ready for field execution",
    detail:
      "Project readiness is clear, crew context exists, and no open field blockers are linked to this job.",
    sources
  };
}

export function buildFieldDailyExecutionCommand(
  job: FieldAssignedWorkJob
): FieldDailyExecutionCommand {
  const latestDailyLogHref = job.latestDailyLog
    ? `/daily-logs/${job.latestDailyLog.id}`
    : `/daily-logs?compose=1&projectId=${job.project?.id ?? ""}&jobId=${
        job.id
      }#daily-log-create`;
  const observationLabel = `${job.fieldNoteCount} field note${
    job.fieldNoteCount === 1 ? "" : "s"
  }`;
  const evidenceLabel = [
    observationLabel,
    `${job.timeCardCount} time card${job.timeCardCount === 1 ? "" : "s"}`,
    job.openTimeCardCount > 0
      ? `${job.openTimeCardCount} open time card${
          job.openTimeCardCount === 1 ? "" : "s"
        }`
      : null
  ]
    .filter(Boolean)
    .join(" · ");

  if (job.openFieldBlockerCount > 0) {
    return {
      status: "blocked",
      label: "Resolve field blocker",
      detail:
        job.latestOpenFieldBlocker?.title ??
        `${job.openFieldBlockerCount} open blocker or issue note needs office review.`,
      nextActionLabel: "Open blocker",
      nextActionHref: job.latestOpenFieldBlocker
        ? `/daily-logs/${job.latestOpenFieldBlocker.dailyLogId}#job-notes`
        : latestDailyLogHref,
      observationLabel,
      evidenceLabel
    };
  }

  if (
    (job.dispatchStatus === "scheduled" ||
      job.dispatchStatus === "in_progress") &&
    !job.latestDailyLog
  ) {
    return {
      status: "start_daily_log",
      label: "Start Daily Log",
      detail:
        "Capture today's execution notes on the canonical Daily Log before field context splits across messages or memory.",
      nextActionLabel: "Start Daily Log",
      nextActionHref: latestDailyLogHref,
      observationLabel,
      evidenceLabel
    };
  }

  if (job.dispatchStatus === "in_progress") {
    return {
      status: "continue_execution",
      label: "Continue execution",
      detail:
        "Daily Log continuity is active. Keep observations, blockers, time, and evidence tied back to this job.",
      nextActionLabel: "Open Daily Log",
      nextActionHref: latestDailyLogHref,
      observationLabel,
      evidenceLabel
    };
  }

  if (job.dispatchStatus === "completed") {
    return {
      status: "closeout_review",
      label: "Review closeout context",
      detail:
        "Execution is complete. Review Daily Logs, field notes, time, and evidence before closeout handoff.",
      nextActionLabel: job.latestDailyLog ? "Open Daily Log" : "Open job",
      nextActionHref: job.latestDailyLog
        ? latestDailyLogHref
        : `/jobs/${job.id}`,
      observationLabel,
      evidenceLabel
    };
  }

  return {
    status: "record_observation",
    label: "Capture execution observations",
    detail:
      "Use the job, Daily Log, and Field Work Items surfaces for notes, blockers, photos, and next actions.",
    nextActionLabel: job.latestDailyLog ? "Open Daily Log" : "Open job",
    nextActionHref: job.latestDailyLog ? latestDailyLogHref : `/jobs/${job.id}`,
    observationLabel,
    evidenceLabel
  };
}
