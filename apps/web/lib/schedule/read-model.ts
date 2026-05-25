import type {
  AppointmentListItem,
  ScheduleAppointmentSummary
} from "@/lib/appointments/data";
import type {
  ScheduleJobAssignmentSummary,
  ScheduleJobSummary
} from "@/lib/jobs/data";
import type { ScheduleWarningSummary } from "@/lib/schedule/warnings";

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

export type ScheduleBoardReadModel<TJob extends ScheduleBoardJobSource> = {
  unscheduledReadyJobs: TJob[];
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
  needsReadinessReviewJobs: TJob[];
  readinessReviewJobs: TJob[];
  timingGroups: ScheduleBoardTimingGroup<TJob>[];
  scheduledJobsByDate: Map<string, TJob[]>;
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

function getDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export function buildScheduleBoardReadModel<
  TJob extends ScheduleBoardJobSource
>(input: {
  jobs: TJob[];
  today: Date;
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
  const upcomingHorizon = addDays(today, input.upcomingHorizonDays ?? 8);
  const nextSevenDaysEnd = addDays(today, 7);
  const todayDateKey = getDateKey(today);
  const tomorrowDateKey = getDateKey(tomorrow);
  const warningJobIds = new Set(
    (input.warningSummaries ?? [])
      .filter((summary) => summary.warnings.length > 0)
      .map((summary) => summary.jobId)
  );

  const unscheduledReadyJobs = sortByUpdatedAtDesc(
    input.jobs.filter((job) => job.dispatchStatus === "unscheduled")
  );
  const scheduledTodayJobs = sortBySchedule(
    input.jobs.filter((job) => job.scheduledDate === todayDateKey)
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
  const needsReadinessReviewJobs = sortBySchedule(
    input.jobs.filter(
      (job) =>
        job.dispatchStatus !== "completed" &&
        job.dispatchStatus !== "unscheduled" &&
        (crewAssignmentGaps.some((crewGapJob) => crewGapJob.id === job.id) ||
          warningJobIds.has(job.id))
    )
  );

  return {
    unscheduledReadyJobs,
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
    needsReadinessReviewJobs,
    readinessReviewJobs: needsReadinessReviewJobs,
    scheduledJobsByDate,
    timingGroups: [
      { key: "unscheduled-ready", jobs: unscheduledReadyJobs },
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
