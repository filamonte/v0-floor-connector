import type {
  ScheduleBoardJobSource,
  ScheduleBoardReadModel,
  ScheduleReadinessHandoffSnapshot,
  ScheduleReadinessHandoffSummary
} from "./read-model";
import { buildScheduleReadinessHandoffSummary } from "./read-model";
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
  readinessHandoff: ScheduleReadinessHandoffSummary;
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

export type FieldExecutionVisibilityStatus =
  | "active"
  | "blocked"
  | "incomplete"
  | "office_attention"
  | "warning"
  | "clear";

export type FieldExecutionVisibility = {
  status: FieldExecutionVisibilityStatus;
  label: string;
  detail: string;
};

export type FieldCommandCenterItem<TJob extends ScheduleBoardJobSource> = {
  id: string;
  job: TJob;
  warnings: ScheduleWarningSummary[];
  handoff: ScheduleFieldHandoffSummary | null;
  readinessHandoff: ScheduleReadinessHandoffSummary;
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
  executionVisibility: FieldExecutionVisibility;
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
  input: {
    warningsByJobId: Map<string, ScheduleWarningSummary[]>;
    readinessByProjectId: Map<string, ScheduleReadinessHandoffSnapshot | null>;
  }
): ScheduleDispatchBoardItem<TJob> {
  const readinessHandoff = buildScheduleReadinessHandoffSummary({
    projectId: job.projectId,
    readiness: input.readinessByProjectId.get(job.projectId)
  });
  const isKnownReadinessBlocked =
    input.readinessByProjectId.has(job.projectId) &&
    !readinessHandoff.isReadyToSchedule;

  return {
    id: job.id,
    job,
    warnings: input.warningsByJobId.get(job.id) ?? [],
    readinessHandoff,
    hasCrewAssigned: getAssignmentCount(job) > 0,
    crewLabel: getCrewLabel(job),
    recommendedAction: isKnownReadinessBlocked
      ? "open_job"
      : getRecommendedAction(job),
    statusLabel: formatStatusLabel(job.dispatchStatus)
  };
}

function buildFieldCommandItem<TJob extends ScheduleBoardJobSource>(
  job: TJob,
  input: {
    warningsByJobId: Map<string, ScheduleWarningSummary[]>;
    handoffsByJobId: Map<string, ScheduleFieldHandoffSummary>;
    readinessByProjectId: Map<string, ScheduleReadinessHandoffSnapshot | null>;
  }
): FieldCommandCenterItem<TJob> {
  const handoff = input.handoffsByJobId.get(job.id) ?? null;
  const warnings = input.warningsByJobId.get(job.id) ?? [];
  const readinessHandoff = buildScheduleReadinessHandoffSummary({
    projectId: job.projectId,
    readiness: input.readinessByProjectId.get(job.projectId)
  });
  const isKnownReadinessBlocked =
    input.readinessByProjectId.has(job.projectId) &&
    !readinessHandoff.isReadyToSchedule;
  const hasCrewAssigned = getAssignmentCount(job) > 0;
  const recommendedAction = isKnownReadinessBlocked
    ? "review_project"
    : job.dispatchStatus === "unscheduled"
      ? "schedule_job"
      : !hasCrewAssigned && job.dispatchStatus !== "completed"
        ? "assign_crew"
        : handoff && !handoff.dailyLog
          ? "open_daily_log"
          : warnings.length > 0
            ? "review_project"
            : "open_job";
  const executionVisibility = buildFieldExecutionVisibility({
    job,
    handoff,
    readinessBlocked: isKnownReadinessBlocked,
    warnings
  });

  return {
    id: job.id,
    job,
    warnings,
    handoff,
    readinessHandoff,
    hasCrewAssigned,
    crewLabel: getCrewLabel(job),
    recommendedAction,
    statusLabel: formatStatusLabel(job.dispatchStatus),
    detail: isKnownReadinessBlocked
      ? readinessHandoff.detail
      : (handoff?.detail ??
        (warnings.length > 0
          ? warnings[0].detail
          : "No execution warnings are currently derived for this job.")),
    executionVisibility
  };
}

function buildFieldExecutionVisibility<
  TJob extends ScheduleBoardJobSource
>(input: {
  job: TJob;
  handoff: ScheduleFieldHandoffSummary | null;
  readinessBlocked: boolean;
  warnings: ScheduleWarningSummary[];
}): FieldExecutionVisibility {
  if (input.readinessBlocked) {
    return {
      status: "office_attention",
      label: "Office attention required",
      detail:
        "Project readiness is blocking field execution; route back to Project Workspace before dispatching."
    };
  }

  if (input.handoff && input.handoff.openBlockerCount > 0) {
    return {
      status: "blocked",
      label: "Blocked work",
      detail: `${input.handoff.openBlockerCount} open blocker or issue note is tied to this job.`
    };
  }

  if (input.job.dispatchStatus === "in_progress") {
    return {
      status: "active",
      label: "Active work",
      detail: input.handoff?.latestFieldActivityAt
        ? "Field execution is active with recent Daily Log, field-note, or time-card activity."
        : "Field execution is active; monitor Daily Log and field-note continuity."
    };
  }

  if (
    input.job.dispatchStatus !== "completed" &&
    (!input.handoff || !input.handoff.dailyLog)
  ) {
    return {
      status: "incomplete",
      label: "Incomplete handoff",
      detail:
        "Daily Log context is missing for scheduled or active work; start from the canonical Daily Log flow."
    };
  }

  if (input.warnings.length > 0) {
    return {
      status: "warning",
      label: "Execution warning",
      detail: input.warnings[0].detail
    };
  }

  return {
    status: "clear",
    label: "Clear execution context",
    detail:
      "No blockers, missing Daily Log context, or schedule warnings are currently derived for this job."
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
  readinessByProjectId?: Map<string, ScheduleReadinessHandoffSnapshot | null>;
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
  const readinessByProjectId =
    input.readinessByProjectId ??
    new Map<string, ScheduleReadinessHandoffSnapshot | null>();
  const toItems = (jobs: TJob[]) =>
    uniqueById(jobs).map((job) =>
      buildItem(job, { warningsByJobId, readinessByProjectId })
    );

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
  readinessByProjectId?: Map<string, ScheduleReadinessHandoffSnapshot | null>;
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
  const readinessByProjectId =
    input.readinessByProjectId ??
    new Map<string, ScheduleReadinessHandoffSnapshot | null>();
  const toItems = (jobs: TJob[]) =>
    uniqueById(jobs).map((job) =>
      buildFieldCommandItem(job, {
        warningsByJobId,
        handoffsByJobId,
        readinessByProjectId
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
      items: toItems(
        uniqueById([
          ...input.board.unscheduledBlockedJobs,
          ...input.board.scheduledJobs.filter(hasExecutionWarning)
        ])
      )
    }
  ];
}
