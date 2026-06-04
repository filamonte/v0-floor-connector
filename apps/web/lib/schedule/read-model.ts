import type {
  AppointmentListItem,
  ScheduleAppointmentSummary
} from "@/lib/appointments/data";
import type {
  ScheduleJobAssignmentSummary,
  ScheduleJobSummary
} from "@/lib/jobs/data";
import type {
  ScheduleWarningKind,
  ScheduleWarningSummary
} from "@/lib/schedule/warnings";
import type { PersonId } from "@floorconnector/types";

export type ScheduleJobSource = ScheduleJobSummary & {
  assignments?: ScheduleJobAssignmentSummary[];
  assignmentCount?: number;
  crewSummary?: string[];
};

export type ScheduleItemKind = "job" | "appointment";
export type ScheduleItemFilter = "all" | "jobs" | "appointments";

export type ScheduleOpportunityAssessmentSource = {
  id: string;
  title: string;
  siteName: string | null;
  siteAssessmentScheduledAt: string | null;
  status: string;
  primaryContact?: {
    displayName: string | null;
  } | null;
};

export type ScheduleJobItem = {
  type: "job";
  id: string;
  href: string;
  contextHref: string;
  title: string;
  subtitle: string;
  startsAt: string | null;
  endsAt: string | null;
  dateKey: string | null;
  status: string;
  assigneeLabel: string;
  customerName: string | null;
  projectName: string | null;
};

export type ScheduleAppointmentItem = {
  type: "appointment";
  id: string;
  href: string;
  contextHref: string | null;
  contextLabel: string | null;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string | null;
  dateKey: string;
  status: string;
  appointmentType: string;
  assigneeLabel: string;
  customerName: string | null;
  projectName: string | null;
  opportunityTitle: string | null;
  location: string | null;
  customerVisible: boolean;
};

export type ScheduleItem = ScheduleJobItem | ScheduleAppointmentItem;

export type ScheduleBoardJobSource = ScheduleJobSource & {
  updatedAt: string;
};

export type ScheduleBoardTimingGroupKey =
  | "unscheduled-ready"
  | "unscheduled-blocked"
  | "today"
  | "tomorrow"
  | "this-week"
  | "later-scheduled"
  | "in-progress"
  | "missing-crew"
  | "recently-done";

export type ScheduleBoardTimingGroup<TJob extends ScheduleBoardJobSource> = {
  key: ScheduleBoardTimingGroupKey;
  jobs: TJob[];
};

export type ScheduleDispatchAttentionKind =
  | "blocked_readiness"
  | "past_scheduled"
  | "missing_crew"
  | "capacity_warning"
  | "unscheduled_aging"
  | "in_progress";

export type ScheduleDispatchAttentionTone =
  | "blocked"
  | "warning"
  | "ready"
  | "neutral";

export type ScheduleDispatchAttentionItem<TJob extends ScheduleBoardJobSource> =
  {
    id: string;
    kind: ScheduleDispatchAttentionKind;
    tone: ScheduleDispatchAttentionTone;
    priority: number;
    job: TJob;
    label: string;
    detail: string;
  };

export type ScheduleOperatingModeKey = "triage" | "plan" | "dispatch";

export type ScheduleRoleSlotPerson = {
  id: PersonId;
  displayName: string;
};

export type ScheduleRoleSlotProject = {
  onsiteRepPersonId: PersonId | null;
  relationshipOwnerPersonId: PersonId | null;
};

export type ScheduleRoleSlotIndicator = {
  id: string;
  label: string;
  detail: string;
  href: string;
  tone: "neutral";
};

export type ScheduleWarningDisplayTone = "warning" | "blocked" | "neutral";

export type ScheduleWarningDisplaySummary = {
  hasWarnings: boolean;
  count: number;
  primaryLabel: string;
  compactLabel: string;
  detailLabel: string;
  tone: ScheduleWarningDisplayTone;
};

export type ScheduleWarningDetailItem = {
  id: string;
  label: string;
  detail: string;
  recommendedFix: string;
  tone: ScheduleWarningDisplayTone;
  relatedJobIds: string[];
};

export type ScheduleOperatingModeSummary<TJob extends ScheduleBoardJobSource> =
  {
    key: ScheduleOperatingModeKey;
    label: string;
    detail: string;
    jobCount: number;
    attentionCount: number;
    jobs: TJob[];
  };

export type ScheduleBoardReadModel<TJob extends ScheduleBoardJobSource> = {
  unscheduledReadyJobs: TJob[];
  unscheduledBlockedJobs: TJob[];
  overdueSchedulingJobs: TJob[];
  agingUnscheduledReadyJobs: TJob[];
  pastScheduledIncompleteJobs: TJob[];
  scheduledTodayJobs: TJob[];
  tomorrowJobs: TJob[];
  thisWeekJobs: TJob[];
  laterScheduledJobs: TJob[];
  upcomingJobs: TJob[];
  inProgressJobs: TJob[];
  assignedJobs: TJob[];
  crewAssignmentGaps: TJob[];
  recentlyCompletedJobs: TJob[];
  todayWithoutCrewJobs: TJob[];
  activeTodayJobs: TJob[];
  scheduledJobs: TJob[];
  latestScheduledJobs: TJob[];
  capacityWarningJobs: TJob[];
  dispatchAttentionItems: ScheduleDispatchAttentionItem<TJob>[];
  operatingModeSummaries: ScheduleOperatingModeSummary<TJob>[];
  needsReadinessReviewJobs: TJob[];
  readinessReviewJobs: TJob[];
  timingGroups: ScheduleBoardTimingGroup<TJob>[];
  scheduledJobsByDate: Map<string, TJob[]>;
};

export type ScheduleBoardQueues<TJob extends ScheduleBoardJobSource> = {
  unscheduledReadyJobs: TJob[];
  unscheduledBlockedJobs: TJob[];
  overdueSchedulingJobs: TJob[];
  agingUnscheduledReadyJobs: TJob[];
  pastScheduledIncompleteJobs: TJob[];
  scheduledTodayJobs: TJob[];
  tomorrowJobs: TJob[];
  thisWeekJobs: TJob[];
  laterScheduledJobs: TJob[];
  upcomingJobs: TJob[];
  inProgressJobs: TJob[];
  assignedJobs: TJob[];
  crewAssignmentGaps: TJob[];
  recentlyCompletedJobs: TJob[];
  todayWithoutCrewJobs: TJob[];
  activeTodayJobs: TJob[];
  scheduledJobs: TJob[];
  latestScheduledJobs: TJob[];
  capacityWarningJobs: TJob[];
  dispatchAttentionItems: ScheduleDispatchAttentionItem<TJob>[];
  operatingModeSummaries: ScheduleOperatingModeSummary<TJob>[];
  needsReadinessReviewJobs: TJob[];
};

function formatDateKeyFromIso(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getJobDateKey(job: ScheduleJobSource) {
  if (job.scheduledDate) {
    return job.scheduledDate;
  }

  return job.scheduledStartAt
    ? formatDateKeyFromIso(job.scheduledStartAt)
    : null;
}

function getJobAssigneeLabel(job: ScheduleJobSource) {
  if (job.crewSummary && job.crewSummary.length > 0) {
    return job.crewSummary.join(", ");
  }

  if (job.crewVendor?.name) {
    return job.crewVendor.name;
  }

  const assignmentCount = job.assignmentCount ?? job.assignments?.length ?? 0;

  if (assignmentCount > 0) {
    return `${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`;
  }

  return "No crew assigned";
}

function parseDateKey(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getScheduledSortTime(job: {
  scheduledDate: string | null;
  scheduledStartAt: string | null;
}) {
  if (job.scheduledStartAt) {
    return new Date(job.scheduledStartAt).getTime();
  }

  if (job.scheduledDate) {
    return new Date(`${job.scheduledDate}T00:00:00`).getTime();
  }

  return 0;
}

function getAssignmentCount(job: ScheduleJobSource) {
  return job.assignmentCount ?? job.assignments?.length ?? 0;
}

function findPersonName(
  people: ScheduleRoleSlotPerson[],
  personId: PersonId | null
) {
  if (!personId) {
    return null;
  }

  return people.find((person) => person.id === personId)?.displayName ?? null;
}

const scheduleWarningDisplayLabels: Record<ScheduleWarningKind, string> = {
  missing_crew: "Missing crew",
  missing_end_time: "Missing end time",
  overlap: "Time overlap",
  same_day_capacity: "Capacity warning"
};

const scheduleWarningFixLabels: Record<ScheduleWarningKind, string> = {
  missing_crew: "Assign people or a labor-provider vendor before dispatch.",
  missing_end_time:
    "Set an end time so dispatch can compare the job against other crew commitments.",
  overlap:
    "Review the overlapping job windows and move one job or change the crew before committing the plan.",
  same_day_capacity:
    "Confirm crew load, travel, and timing manually before committing the field plan."
};

export function getScheduleWarningDisplayLabel(kind: ScheduleWarningKind) {
  return scheduleWarningDisplayLabels[kind];
}

export function buildScheduleWarningDisplaySummary(input: {
  warnings: ScheduleWarningSummary[];
  readinessBlocked?: boolean;
}): ScheduleWarningDisplaySummary {
  const count = input.warnings.length + (input.readinessBlocked ? 1 : 0);

  if (count === 0) {
    return {
      hasWarnings: false,
      count: 0,
      primaryLabel: "No warnings",
      compactLabel: "No warnings",
      detailLabel: "No schedule warnings found.",
      tone: "neutral"
    };
  }

  const primaryLabel = input.readinessBlocked
    ? "Readiness blocked"
    : getScheduleWarningDisplayLabel(input.warnings[0].kind);
  const hiddenCount = count - 1;

  return {
    hasWarnings: true,
    count,
    primaryLabel,
    compactLabel:
      hiddenCount > 0 ? `${primaryLabel} +${hiddenCount}` : primaryLabel,
    detailLabel:
      count === 1
        ? primaryLabel
        : `${count} schedule issue${count === 1 ? "" : "s"}`,
    tone: input.readinessBlocked ? "blocked" : "warning"
  };
}

export function buildSelectedScheduleWarningDetails(input: {
  warnings: ScheduleWarningSummary[];
  readinessBlocked?: boolean;
  readinessDetail?: string | null;
}): ScheduleWarningDetailItem[] {
  const details: ScheduleWarningDetailItem[] = [];

  if (input.readinessBlocked) {
    details.push({
      id: "readiness-blocked",
      label: "Readiness blocked",
      detail:
        input.readinessDetail ??
        "Project readiness says this job should not be committed to the schedule yet.",
      recommendedFix:
        "Resolve the upstream project readiness blocker before committing schedule changes.",
      tone: "blocked",
      relatedJobIds: []
    });
  }

  for (const warning of input.warnings) {
    details.push({
      id: warning.id,
      label: getScheduleWarningDisplayLabel(warning.kind),
      detail: warning.detail,
      recommendedFix: scheduleWarningFixLabels[warning.kind],
      tone: "warning",
      relatedJobIds: warning.relatedJobIds
    });
  }

  return details;
}

export function buildScheduleRoleSlotIndicators(input: {
  project: ScheduleRoleSlotProject | null;
  people: ScheduleRoleSlotPerson[];
  projectHref: string;
}): ScheduleRoleSlotIndicator[] {
  if (!input.project) {
    return [];
  }

  const onsiteRepName = findPersonName(
    input.people,
    input.project.onsiteRepPersonId
  );
  const relationshipOwnerName = findPersonName(
    input.people,
    input.project.relationshipOwnerPersonId
  );
  const indicators: ScheduleRoleSlotIndicator[] = [];

  if (onsiteRepName) {
    indicators.push({
      id: "role-slot:onsite-rep",
      label: `Onsite: ${onsiteRepName}`,
      detail: "Project role slot: person who gathered onsite context.",
      href: input.projectHref,
      tone: "neutral"
    });
  }

  if (relationshipOwnerName) {
    indicators.push({
      id: "role-slot:relationship-owner",
      label: `Relationship: ${relationshipOwnerName}`,
      detail:
        "Project role slot: person who owns customer relationship context.",
      href: input.projectHref,
      tone: "neutral"
    });
  }

  return indicators;
}

function getDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isJobBlockedByReadiness(
  job: { projectId: string },
  readinessByProjectId?: Map<string, { isReadyToSchedule: boolean }>
) {
  const readiness = readinessByProjectId?.get(job.projectId);

  return readiness ? !readiness.isReadyToSchedule : false;
}

function sortBySchedule<TJob extends ScheduleBoardJobSource>(jobs: TJob[]) {
  return [...jobs].sort(
    (left, right) => getScheduledSortTime(left) - getScheduledSortTime(right)
  );
}

function sortByUpdatedAtDesc<TJob extends ScheduleBoardJobSource>(
  jobs: TJob[]
) {
  return [...jobs].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

function getWarningsForJob(
  warningSummariesByJobId: Map<string, ScheduleWarningSummary[]>,
  jobId: string
) {
  return warningSummariesByJobId.get(jobId) ?? [];
}

function buildDispatchAttentionItems<
  TJob extends ScheduleBoardJobSource
>(input: {
  todayDateKey: string;
  unscheduledReadyJobs: TJob[];
  unscheduledBlockedJobs: TJob[];
  pastScheduledIncompleteJobs: TJob[];
  crewAssignmentGaps: TJob[];
  capacityWarningJobs: TJob[];
  inProgressJobs: TJob[];
  warningSummariesByJobId: Map<string, ScheduleWarningSummary[]>;
}): ScheduleDispatchAttentionItem<TJob>[] {
  const items: ScheduleDispatchAttentionItem<TJob>[] = [];
  const seen = new Set<string>();

  const addItem = (item: ScheduleDispatchAttentionItem<TJob>) => {
    const key = `${item.kind}:${item.job.id}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    items.push(item);
  };

  for (const job of input.unscheduledBlockedJobs) {
    addItem({
      id: `blocked-readiness:${job.id}`,
      kind: "blocked_readiness",
      tone: "blocked",
      priority: 10,
      job,
      label: "Readiness blocker",
      detail:
        "Job exists, but project readiness says scheduling should wait for upstream resolution."
    });
  }

  for (const job of input.pastScheduledIncompleteJobs) {
    addItem({
      id: `past-scheduled:${job.id}`,
      kind: "past_scheduled",
      tone: "blocked",
      priority: 20,
      job,
      label: "Past scheduled",
      detail: "Scheduled date is in the past and the job is not completed."
    });
  }

  for (const job of input.crewAssignmentGaps) {
    addItem({
      id: `missing-crew:${job.id}`,
      kind: "missing_crew",
      tone: "warning",
      priority: job.scheduledDate === input.todayDateKey ? 30 : 40,
      job,
      label: "Missing crew",
      detail:
        "Scheduled or active job has no person or labor-provider assignment."
    });
  }

  for (const job of input.capacityWarningJobs) {
    const warnings = getWarningsForJob(input.warningSummariesByJobId, job.id);
    const warning = warnings.find(
      (summary) =>
        summary.kind === "overlap" || summary.kind === "same_day_capacity"
    );

    addItem({
      id: `capacity-warning:${job.id}`,
      kind: "capacity_warning",
      tone: "warning",
      priority: warning?.kind === "overlap" ? 35 : 45,
      job,
      label:
        warning?.kind === "overlap" ? "Crew overlap" : "Same-day crew load",
      detail:
        warning?.detail ??
        "Crew appears on more than one scheduled job for the same day."
    });
  }

  for (const job of input.unscheduledReadyJobs) {
    if (job.updatedAt.slice(0, 10) >= input.todayDateKey) {
      continue;
    }

    addItem({
      id: `unscheduled-aging:${job.id}`,
      kind: "unscheduled_aging",
      tone: "ready",
      priority: 50,
      job,
      label: "Ready queue aging",
      detail: "Ready-to-schedule job has been waiting since before today."
    });
  }

  for (const job of input.inProgressJobs) {
    addItem({
      id: `in-progress:${job.id}`,
      kind: "in_progress",
      tone: "neutral",
      priority: 70,
      job,
      label: "In progress",
      detail:
        "Field execution is active; keep schedule and daily-log continuity visible."
    });
  }

  return items.sort((left, right) => {
    const priorityComparison = left.priority - right.priority;

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return getScheduledSortTime(left.job) - getScheduledSortTime(right.job);
  });
}

function uniqueJobsById<TJob extends ScheduleBoardJobSource>(
  jobs: TJob[]
): TJob[] {
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

export function deriveScheduleOperatingModeSummaries<
  TJob extends ScheduleBoardJobSource
>(input: {
  unscheduledReadyJobs: TJob[];
  unscheduledBlockedJobs: TJob[];
  pastScheduledIncompleteJobs: TJob[];
  crewAssignmentGaps: TJob[];
  capacityWarningJobs: TJob[];
  activeTodayJobs: TJob[];
  tomorrowJobs: TJob[];
  thisWeekJobs: TJob[];
  laterScheduledJobs: TJob[];
  dispatchAttentionItems: ScheduleDispatchAttentionItem<TJob>[];
  jobsPerMode?: number;
}): ScheduleOperatingModeSummary<TJob>[] {
  const jobsPerMode = input.jobsPerMode ?? 3;
  const triageJobs = uniqueJobsById([
    ...input.dispatchAttentionItems
      .filter(
        (item) =>
          item.kind !== "in_progress" && item.kind !== "unscheduled_aging"
      )
      .map((item) => item.job),
    ...input.unscheduledBlockedJobs,
    ...input.pastScheduledIncompleteJobs,
    ...input.crewAssignmentGaps,
    ...input.capacityWarningJobs
  ]);
  const planJobs = uniqueJobsById([
    ...input.unscheduledReadyJobs,
    ...input.tomorrowJobs,
    ...input.thisWeekJobs,
    ...input.laterScheduledJobs
  ]);
  const dispatchJobs = uniqueJobsById([
    ...input.activeTodayJobs,
    ...input.dispatchAttentionItems
      .filter((item) => item.kind === "in_progress")
      .map((item) => item.job)
  ]);

  return [
    {
      key: "triage",
      label: "Triage",
      detail:
        "Resolve readiness blockers, stale scheduled work, missing crew, and advisory capacity warnings first.",
      jobCount: triageJobs.length,
      attentionCount: input.dispatchAttentionItems.filter(
        (item) =>
          item.kind !== "in_progress" && item.kind !== "unscheduled_aging"
      ).length,
      jobs: triageJobs.slice(0, jobsPerMode)
    },
    {
      key: "plan",
      label: "Plan",
      detail:
        "Turn ready unscheduled work and upcoming commitments into a reviewed field plan.",
      jobCount: planJobs.length,
      attentionCount: input.unscheduledReadyJobs.length,
      jobs: planJobs.slice(0, jobsPerMode)
    },
    {
      key: "dispatch",
      label: "Dispatch",
      detail:
        "Watch today and live execution while keeping job, project, and Daily Log continuity one click away.",
      jobCount: dispatchJobs.length,
      attentionCount: input.activeTodayJobs.length,
      jobs: dispatchJobs.slice(0, jobsPerMode)
    }
  ];
}

export function deriveScheduleBoardQueues<
  TJob extends ScheduleBoardJobSource
>(input: {
  jobs: TJob[];
  today: Date;
  readinessByProjectId?: Map<string, { isReadyToSchedule: boolean } | null>;
  warningSummaries?: Array<{
    jobId: string;
    warnings: ScheduleWarningSummary[];
  }>;
  upcomingHorizonDays?: number;
  recentCompletedLimit?: number;
  latestScheduledLimit?: number;
}): ScheduleBoardQueues<TJob> {
  const today = new Date(input.today);
  today.setHours(0, 0, 0, 0);

  const tomorrow = addDays(today, 1);
  const upcomingHorizon = addDays(today, input.upcomingHorizonDays ?? 8);
  const nextSevenDaysEnd = addDays(today, 7);
  const todayDateKey = getDateKey(today);
  const tomorrowDateKey = getDateKey(tomorrow);
  const warningJobIds = new Set(
    (input.warningSummaries ?? [])
      .filter((summary) => summary.warnings.length > 0)
      .map((summary) => summary.jobId)
  );
  const warningSummariesByJobId = new Map(
    (input.warningSummaries ?? []).map((summary) => [
      summary.jobId,
      summary.warnings
    ])
  );
  const readinessByProjectId = new Map(
    [...(input.readinessByProjectId?.entries() ?? [])].filter(
      (entry): entry is [string, { isReadyToSchedule: boolean }] =>
        entry[1] !== null
    )
  );

  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const unscheduledReadyJobs = sortByUpdatedAtDesc(
    unscheduledJobs.filter(
      (job) => !isJobBlockedByReadiness(job, readinessByProjectId)
    )
  );
  const unscheduledBlockedJobs = sortByUpdatedAtDesc(
    unscheduledJobs.filter((job) =>
      isJobBlockedByReadiness(job, readinessByProjectId)
    )
  );
  const overdueSchedulingJobs = unscheduledReadyJobs.filter(
    (job) => job.updatedAt.slice(0, 10) < todayDateKey
  );
  const agingUnscheduledReadyJobs = overdueSchedulingJobs;
  const scheduledTodayJobs = sortBySchedule(
    input.jobs.filter((job) => job.scheduledDate === todayDateKey)
  );
  const pastScheduledIncompleteJobs = sortBySchedule(
    input.jobs.filter((job) => {
      const scheduledDate = parseDateKey(job.scheduledDate);

      return (
        scheduledDate !== null &&
        scheduledDate < today &&
        job.dispatchStatus !== "completed"
      );
    })
  );
  const inProgressJobs = sortBySchedule(
    input.jobs.filter((job) => job.dispatchStatus === "in_progress")
  );
  const tomorrowJobs = sortBySchedule(
    input.jobs.filter((job) => job.scheduledDate === tomorrowDateKey)
  );
  const thisWeekJobs = sortBySchedule(input.jobs).filter((job) => {
    const scheduledDate = parseDateKey(job.scheduledDate);

    return (
      scheduledDate !== null &&
      scheduledDate > tomorrow &&
      scheduledDate <= nextSevenDaysEnd
    );
  });
  const laterScheduledJobs = sortBySchedule(input.jobs).filter((job) => {
    const scheduledDate = parseDateKey(job.scheduledDate);

    return scheduledDate !== null && scheduledDate > nextSevenDaysEnd;
  });
  const upcomingJobs = sortBySchedule(input.jobs).filter((job) => {
    const scheduledDate = parseDateKey(job.scheduledDate);

    return (
      scheduledDate !== null &&
      scheduledDate >= tomorrow &&
      scheduledDate < upcomingHorizon
    );
  });
  const assignedJobs = input.jobs.filter((job) => getAssignmentCount(job) > 0);
  const crewAssignmentGaps = sortBySchedule(
    input.jobs.filter(
      (job) =>
        job.dispatchStatus !== "unscheduled" &&
        job.dispatchStatus !== "completed" &&
        getAssignmentCount(job) === 0
    )
  );
  const recentlyCompletedJobs = sortByUpdatedAtDesc(
    input.jobs.filter((job) => job.dispatchStatus === "completed")
  ).slice(0, input.recentCompletedLimit ?? 12);
  const todayWithoutCrewJobs = scheduledTodayJobs.filter(
    (job) => getAssignmentCount(job) === 0
  );
  const activeTodayJobs = [
    ...inProgressJobs,
    ...scheduledTodayJobs.filter((job) => job.dispatchStatus !== "in_progress")
  ];
  const scheduledJobs = input.jobs.filter((job) => job.scheduledDate !== null);
  const latestScheduledJobs = sortBySchedule(scheduledJobs)
    .reverse()
    .slice(0, input.latestScheduledLimit ?? 3);
  const capacityWarningJobs = sortBySchedule(
    input.jobs.filter((job) =>
      getWarningsForJob(warningSummariesByJobId, job.id).some(
        (warning) =>
          warning.kind === "overlap" || warning.kind === "same_day_capacity"
      )
    )
  );
  const dispatchAttentionItems = buildDispatchAttentionItems({
    todayDateKey,
    unscheduledReadyJobs,
    unscheduledBlockedJobs,
    pastScheduledIncompleteJobs,
    crewAssignmentGaps,
    capacityWarningJobs,
    inProgressJobs,
    warningSummariesByJobId
  });
  const operatingModeSummaries = deriveScheduleOperatingModeSummaries({
    unscheduledReadyJobs,
    unscheduledBlockedJobs,
    pastScheduledIncompleteJobs,
    crewAssignmentGaps,
    capacityWarningJobs,
    activeTodayJobs,
    tomorrowJobs,
    thisWeekJobs,
    laterScheduledJobs,
    dispatchAttentionItems
  });
  const needsReadinessReviewJobs = sortBySchedule(
    input.jobs.filter((job) => {
      if (job.dispatchStatus === "completed") {
        return false;
      }

      if (isJobBlockedByReadiness(job, readinessByProjectId)) {
        return true;
      }

      return (
        job.dispatchStatus !== "unscheduled" &&
        (crewAssignmentGaps.some((crewGapJob) => crewGapJob.id === job.id) ||
          warningJobIds.has(job.id))
      );
    })
  );

  return {
    unscheduledReadyJobs,
    unscheduledBlockedJobs,
    overdueSchedulingJobs,
    agingUnscheduledReadyJobs,
    pastScheduledIncompleteJobs,
    scheduledTodayJobs,
    tomorrowJobs,
    thisWeekJobs,
    laterScheduledJobs,
    upcomingJobs,
    inProgressJobs,
    assignedJobs,
    crewAssignmentGaps,
    recentlyCompletedJobs,
    todayWithoutCrewJobs,
    activeTodayJobs,
    scheduledJobs,
    latestScheduledJobs,
    capacityWarningJobs,
    dispatchAttentionItems,
    operatingModeSummaries,
    needsReadinessReviewJobs
  };
}

export function buildScheduleBoardReadModel<
  TJob extends ScheduleBoardJobSource
>(input: {
  jobs: TJob[];
  today: Date;
  readinessByProjectId?: Map<string, { isReadyToSchedule: boolean } | null>;
  warningSummaries?: Array<{
    jobId: string;
    warnings: ScheduleWarningSummary[];
  }>;
  upcomingHorizonDays?: number;
  recentCompletedLimit?: number;
  latestScheduledLimit?: number;
}): ScheduleBoardReadModel<TJob> {
  const today = new Date(input.today);
  today.setHours(0, 0, 0, 0);

  const tomorrow = addDays(today, 1);
  const nextSevenDaysEnd = addDays(today, 7);
  const todayDateKey = getDateKey(today);
  const tomorrowDateKey = getDateKey(tomorrow);
  const queues = deriveScheduleBoardQueues(input);
  const {
    scheduledJobs,
    unscheduledReadyJobs,
    unscheduledBlockedJobs,
    inProgressJobs,
    crewAssignmentGaps,
    recentlyCompletedJobs
  } = queues;

  const scheduledJobsByDate = new Map<string, TJob[]>();

  for (const job of sortBySchedule(scheduledJobs)) {
    if (!job.scheduledDate) {
      continue;
    }

    const existing = scheduledJobsByDate.get(job.scheduledDate);

    if (existing) {
      existing.push(job);
    } else {
      scheduledJobsByDate.set(job.scheduledDate, [job]);
    }
  }

  const boardTimingJobs = input.jobs.filter(
    (job) => job.dispatchStatus !== "in_progress"
  );
  const todayBoardJobs = boardTimingJobs.filter(
    (job) => job.scheduledDate === todayDateKey
  );
  const tomorrowBoardJobs = boardTimingJobs.filter(
    (job) => job.scheduledDate === tomorrowDateKey
  );
  const nextSevenDaysBoardJobs = boardTimingJobs.filter((job) => {
    const scheduledDate = parseDateKey(job.scheduledDate);

    return (
      scheduledDate !== null &&
      scheduledDate > tomorrow &&
      scheduledDate <= nextSevenDaysEnd
    );
  });
  const laterScheduledBoardJobs = boardTimingJobs.filter((job) => {
    const scheduledDate = parseDateKey(job.scheduledDate);

    return scheduledDate !== null && scheduledDate > nextSevenDaysEnd;
  });

  return {
    ...queues,
    readinessReviewJobs: queues.needsReadinessReviewJobs,
    scheduledJobsByDate,
    timingGroups: [
      { key: "unscheduled-ready", jobs: unscheduledReadyJobs },
      { key: "unscheduled-blocked", jobs: unscheduledBlockedJobs },
      { key: "today", jobs: todayBoardJobs },
      { key: "tomorrow", jobs: tomorrowBoardJobs },
      { key: "this-week", jobs: nextSevenDaysBoardJobs },
      { key: "later-scheduled", jobs: laterScheduledBoardJobs },
      { key: "in-progress", jobs: inProgressJobs },
      { key: "missing-crew", jobs: crewAssignmentGaps },
      { key: "recently-done", jobs: recentlyCompletedJobs }
    ]
  };
}

export function buildScheduleItems(input: {
  jobs: ScheduleJobSource[];
  appointments: ScheduleAppointmentSummary[];
  opportunityAssessments?: ScheduleOpportunityAssessmentSource[];
  rangeStart: Date;
  rangeEnd: Date;
  itemFilter?: ScheduleItemFilter;
  includeUndatedJobs?: boolean;
}): ScheduleItem[] {
  const rangeStartKey = input.rangeStart.toISOString().slice(0, 10);
  const rangeEndKey = input.rangeEnd.toISOString().slice(0, 10);
  const itemFilter = input.itemFilter ?? "all";
  const items: ScheduleItem[] = [];

  if (itemFilter === "all" || itemFilter === "jobs") {
    for (const job of input.jobs) {
      const dateKey = getJobDateKey(job);

      if (
        (!dateKey && !input.includeUndatedJobs) ||
        (dateKey && (dateKey < rangeStartKey || dateKey > rangeEndKey))
      ) {
        continue;
      }

      items.push({
        type: "job",
        id: job.id,
        href: `/jobs/${job.id}`,
        contextHref: `/projects/${job.projectId}`,
        title: job.project?.name ?? "Untitled job",
        subtitle: job.customer?.name ?? "Unknown customer",
        startsAt: job.scheduledStartAt,
        endsAt: job.scheduledEndAt,
        dateKey,
        status: job.dispatchStatus,
        assigneeLabel: getJobAssigneeLabel(job),
        customerName: job.customer?.name ?? null,
        projectName: job.project?.name ?? null
      });
    }
  }

  if (itemFilter === "all" || itemFilter === "appointments") {
    for (const opportunity of input.opportunityAssessments ?? []) {
      if (!opportunity.siteAssessmentScheduledAt) {
        continue;
      }

      const dateKey = formatDateKeyFromIso(
        opportunity.siteAssessmentScheduledAt
      );

      if (dateKey < rangeStartKey || dateKey > rangeEndKey) {
        continue;
      }

      items.push({
        type: "appointment",
        id: `opportunity-assessment:${opportunity.id}`,
        href: `/leads/${opportunity.id}`,
        contextHref: `/leads/${opportunity.id}`,
        contextLabel: "Open lead",
        title: `${opportunity.title} site assessment`,
        subtitle:
          opportunity.primaryContact?.displayName ??
          opportunity.siteName ??
          "Lead assessment",
        startsAt: opportunity.siteAssessmentScheduledAt,
        endsAt: null,
        dateKey,
        status: opportunity.status,
        appointmentType: "site_assessment",
        assigneeLabel: "Opportunity workflow",
        customerName: null,
        projectName: null,
        opportunityTitle: opportunity.title,
        location: opportunity.siteName,
        customerVisible: false
      });
    }

    for (const appointment of input.appointments) {
      const dateKey = formatDateKeyFromIso(appointment.startsAt);

      if (dateKey < rangeStartKey || dateKey > rangeEndKey) {
        continue;
      }

      const contextHref = appointment.projectId
        ? `/projects/${appointment.projectId}`
        : appointment.opportunityId
          ? `/leads/${appointment.opportunityId}`
          : appointment.customerId
            ? `/customers/${appointment.customerId}`
            : null;
      const contextLabel = appointment.projectId
        ? "Open project"
        : appointment.opportunityId
          ? "Open lead"
          : appointment.customerId
            ? "Open customer"
            : null;

      items.push({
        type: "appointment",
        id: appointment.id,
        href: `/appointments/${appointment.id}`,
        contextHref,
        contextLabel,
        title: appointment.title,
        subtitle:
          appointment.customer?.name ??
          appointment.opportunity?.title ??
          "Lead appointment",
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        dateKey,
        status: appointment.status,
        appointmentType: appointment.appointmentType,
        assigneeLabel: appointment.assignedPerson?.displayName ?? "Unassigned",
        customerName: appointment.customer?.name ?? null,
        projectName: appointment.project?.name ?? null,
        opportunityTitle: appointment.opportunity?.title ?? null,
        location: appointment.location,
        customerVisible: appointment.customerVisible
      });
    }
  }

  return items.sort((left, right) => {
    const leftTime =
      left.startsAt ?? `${left.dateKey ?? "9999-12-31"}T23:59:59`;
    const rightTime =
      right.startsAt ?? `${right.dateKey ?? "9999-12-31"}T23:59:59`;
    const timeComparison = leftTime.localeCompare(rightTime);

    if (timeComparison !== 0) {
      return timeComparison;
    }

    return left.type.localeCompare(right.type);
  });
}

export function filterUpcomingAssignedAppointments(input: {
  appointments: AppointmentListItem[];
  nowIso: string;
  assignedPersonId?: string | null;
  limit: number;
}) {
  return input.appointments
    .filter((appointment) => appointment.status === "scheduled")
    .filter((appointment) => appointment.startsAt >= input.nowIso)
    .filter((appointment) =>
      input.assignedPersonId
        ? appointment.assignedPersonId === input.assignedPersonId
        : true
    )
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, input.limit);
}
