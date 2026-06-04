import type {
  ScheduleBoardJobSource,
  ScheduleBoardReadModel
} from "./read-model";
import type { ScheduleFieldHandoffSummary } from "./field-handoff-read-model";
import type { ScheduleWarningSummary } from "./warnings";

export type ScheduleDispatchBoardSectionKey =
  | "today"
  | "upcoming"
  | "unscheduled"
  | "in_progress";

export type ScheduleDispatchBoardItem<TJob extends ScheduleBoardJobSource> = {
  id: string;
  job: TJob;
  warnings: ScheduleWarningSummary[];
  hasCrewAssigned: boolean;
  crewLabel: string;
  recommendedAction: "open_job" | "schedule_job" | "assign_crew";
  statusLabel: string;
};

export type ScheduleDispatchBoardSection<TJob extends ScheduleBoardJobSource> =
  {
    key: ScheduleDispatchBoardSectionKey;
    title: string;
    description: string;
    items: ScheduleDispatchBoardItem<TJob>[];
  };

export type FieldCommandCenterSectionKey =
  | "ready_to_schedule"
  | "scheduled_today"
  | "needs_crew"
  | "in_progress"
  | "field_handoff"
  | "execution_warnings";

export type FieldCommandCenterItem<TJob extends ScheduleBoardJobSource> = {
  id: string;
  job: TJob;
  warnings: ScheduleWarningSummary[];
  handoff: ScheduleFieldHandoffSummary | null;
  hasCrewAssigned: boolean;
  crewLabel: string;
  recommendedAction:
    | "open_job"
    | "schedule_job"
    | "assign_crew"
    | "open_daily_log"
    | "review_project";
  statusLabel: string;
  detail: string;
};

export type FieldCommandCenterSection<TJob extends ScheduleBoardJobSource> = {
  key: FieldCommandCenterSectionKey;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: FieldCommandCenterItem<TJob>[];
};

function getAssignmentCount(job: ScheduleBoardJobSource) {
  return job.assignmentCount ?? job.assignments?.length ?? 0;
}

function getCrewLabel(job: ScheduleBoardJobSource) {
  if (job.crewSummary && job.crewSummary.length > 0) {
    return job.crewSummary.join(", ");
  }

  if (job.crewVendor?.name) {
    return job.crewVendor.name;
  }

  const assignmentCount = getAssignmentCount(job);

  if (assignmentCount > 0) {
    return `${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`;
  }

  return "No crew assigned";
}

function getRecommendedAction(job: ScheduleBoardJobSource) {
  if (job.dispatchStatus === "unscheduled") {
    return "schedule_job" as const;
  }

  if (job.dispatchStatus !== "completed" && getAssignmentCount(job) === 0) {
    return "assign_crew" as const;
  }

  return "open_job" as const;
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function buildItem<TJob extends ScheduleBoardJobSource>(
  job: TJob,
  warningsByJobId: Map<string, ScheduleWarningSummary[]>
): ScheduleDispatchBoardItem<TJob> {
  return {
    id: job.id,
    job,
    warnings: warningsByJobId.get(job.id) ?? [],
    hasCrewAssigned: getAssignmentCount(job) > 0,
    crewLabel: getCrewLabel(job),
    recommendedAction: getRecommendedAction(job),
    statusLabel: formatStatusLabel(job.dispatchStatus)
  };
}

function buildFieldCommandItem<TJob extends ScheduleBoardJobSource>(
  job: TJob,
  input: {
    warningsByJobId: Map<string, ScheduleWarningSummary[]>;
    handoffsByJobId: Map<string, ScheduleFieldHandoffSummary>;
  }
): FieldCommandCenterItem<TJob> {
  const handoff = input.handoffsByJobId.get(job.id) ?? null;
  const warnings = input.warningsByJobId.get(job.id) ?? [];
  const hasCrewAssigned = getAssignmentCount(job) > 0;
  const recommendedAction =
    job.dispatchStatus === "unscheduled"
      ? "schedule_job"
      : !hasCrewAssigned && job.dispatchStatus !== "completed"
        ? "assign_crew"
        : handoff && !handoff.dailyLog
          ? "open_daily_log"
          : warnings.length > 0
            ? "review_project"
            : "open_job";

  return {
    id: job.id,
    job,
    warnings,
    handoff,
    hasCrewAssigned,
    crewLabel: getCrewLabel(job),
    recommendedAction,
    statusLabel: formatStatusLabel(job.dispatchStatus),
    detail:
      handoff?.detail ??
      (warnings.length > 0
        ? warnings[0].detail
        : "No execution warnings are currently derived for this job.")
  };
}

function uniqueById<TJob extends ScheduleBoardJobSource>(jobs: TJob[]) {
  const seen = new Set<string>();
  const uniqueJobs: TJob[] = [];

  for (const job of jobs) {
    if (seen.has(job.id)) {
      continue;
    }

    seen.add(job.id);
    uniqueJobs.push(job);
  }

  return uniqueJobs;
}

export function buildScheduleDispatchBoardSections<
  TJob extends ScheduleBoardJobSource
>(input: {
  board: ScheduleBoardReadModel<TJob>;
  warningSummaries?: Array<{
    jobId: string;
    warnings: ScheduleWarningSummary[];
  }>;
}): ScheduleDispatchBoardSection<TJob>[] {
  const warningsByJobId = new Map(
    (input.warningSummaries ?? []).map((summary) => [
      summary.jobId,
      summary.warnings
    ])
  );
  const toItems = (jobs: TJob[]) =>
    uniqueById(jobs).map((job) => buildItem(job, warningsByJobId));

  return [
    {
      key: "today",
      title: "Today",
      description:
        "Jobs scheduled for today stay visible with crew state, warnings, and job/project handoff.",
      items: toItems(
        input.board.scheduledTodayJobs.filter(
          (job) => job.dispatchStatus !== "in_progress"
        )
      )
    },
    {
      key: "upcoming",
      title: "Upcoming",
      description:
        "Near-term scheduled jobs stay grouped for practical dispatch planning.",
      items: toItems(input.board.upcomingJobs)
    },
    {
      key: "unscheduled",
      title: "Unscheduled / Needs Dispatch",
      description:
        "Ready and readiness-blocked unscheduled jobs stay in one dispatch queue without creating new dispatch state.",
      items: toItems([
        ...input.board.unscheduledReadyJobs,
        ...input.board.unscheduledBlockedJobs
      ])
    },
    {
      key: "in_progress",
      title: "In Progress",
      description:
        "Live execution remains visible separately from scheduled and unscheduled planning.",
      items: toItems(input.board.inProgressJobs)
    }
  ];
}

export function buildFieldCommandCenterSections<
  TJob extends ScheduleBoardJobSource
>(input: {
  board: ScheduleBoardReadModel<TJob>;
  warningSummaries?: Array<{
    jobId: string;
    warnings: ScheduleWarningSummary[];
  }>;
  handoffsByJobId?: Map<string, ScheduleFieldHandoffSummary>;
}): FieldCommandCenterSection<TJob>[] {
  const warningsByJobId = new Map<string, ScheduleWarningSummary[]>(
    (input.warningSummaries ?? []).map((summary) => [
      summary.jobId,
      summary.warnings
    ])
  );
  const handoffsByJobId =
    input.handoffsByJobId ?? new Map<string, ScheduleFieldHandoffSummary>();
  const toItems = (jobs: TJob[]) =>
    uniqueById(jobs).map((job) =>
      buildFieldCommandItem(job, {
        warningsByJobId,
        handoffsByJobId
      })
    );
  const hasExecutionWarning = (job: TJob) =>
    (warningsByJobId.get(job.id)?.length ?? 0) > 0 ||
    input.board.dispatchAttentionItems.some(
      (item) => item.job.id === job.id && item.kind !== "in_progress"
    );
  const needsHandoffContext = (job: TJob) => {
    if (
      job.dispatchStatus === "unscheduled" ||
      job.dispatchStatus === "completed"
    ) {
      return false;
    }

    const handoff = handoffsByJobId.get(job.id);

    return (
      !handoff ||
      handoff.tone === "blocked" ||
      handoff.tone === "warning" ||
      handoff.dailyLog === null
    );
  };

  return [
    {
      key: "ready_to_schedule",
      title: "Ready to Schedule",
      description:
        "Ready unscheduled jobs that can move from planning into a confirmed field date.",
      emptyTitle: "No ready unscheduled work.",
      emptyDescription:
        "Ready jobs will appear here after Project Workspace readiness clears and a job exists without a schedule date.",
      items: toItems(input.board.unscheduledReadyJobs)
    },
    {
      key: "scheduled_today",
      title: "Scheduled Today",
      description:
        "Today's committed work, excluding jobs already marked in progress.",
      emptyTitle: "No jobs are scheduled for today.",
      emptyDescription:
        "Today's committed field work will appear here once canonical job schedule fields are set.",
      items: toItems(
        input.board.scheduledTodayJobs.filter(
          (job) => job.dispatchStatus !== "in_progress"
        )
      )
    },
    {
      key: "needs_crew",
      title: "Needs Crew",
      description:
        "Scheduled or active jobs missing person or labor-provider assignment rows.",
      emptyTitle: "No crew assignment gaps.",
      emptyDescription:
        "Crew gaps will appear here when scheduled or active jobs have no assignments.",
      items: toItems(input.board.crewAssignmentGaps)
    },
    {
      key: "in_progress",
      title: "In Progress",
      description:
        "Active execution work that needs job, Daily Log, and field-note continuity.",
      emptyTitle: "No jobs are in progress.",
      emptyDescription:
        "Live execution jobs will appear here when canonical job status moves to in progress.",
      items: toItems(input.board.inProgressJobs)
    },
    {
      key: "field_handoff",
      title: "Field Handoff / Missing Context",
      description:
        "Scheduled or active jobs where Daily Log, crew, or blocker context still needs field review.",
      emptyTitle: "No field handoff gaps.",
      emptyDescription:
        "Missing Daily Logs, crew gaps, and open field blockers will appear here from existing execution records.",
      items: toItems(input.board.scheduledJobs.filter(needsHandoffContext))
    },
    {
      key: "execution_warnings",
      title: "Execution Warnings",
      description:
        "Readiness, stale schedule, capacity, and warning signals that need human review before execution proceeds.",
      emptyTitle: "No execution warnings.",
      emptyDescription:
        "Readiness blockers, stale scheduled work, crew capacity warnings, and schedule warnings will appear here when derived from source records.",
      items: toItems(input.board.scheduledJobs.filter(hasExecutionWarning))
    }
  ];
}
