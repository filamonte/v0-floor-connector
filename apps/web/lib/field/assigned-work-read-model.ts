import type { JobStatus } from "@floorconnector/types";

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
  fieldNoteCount: number;
  timeCardCount: number;
  openTimeCardCount: number;
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
