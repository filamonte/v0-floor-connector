import type {
  ScheduleBoardJobSource,
  ScheduleBoardReadModel
} from "./read-model";
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
