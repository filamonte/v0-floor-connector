import type { JobStatus } from "@floorconnector/types";

export type ScheduleWarningKind =
  | "missing_crew"
  | "missing_end_time"
  | "overlap";

export type ScheduleWarningAssignment = {
  personId: string | null;
  vendorId: string | null;
  person?: { displayName: string } | null;
  vendor?: { name: string } | null;
};

export type ScheduleWarningJob = {
  id: string;
  title: string;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  crewVendorId: string | null;
  crewVendor?: { name: string } | null;
  assignments: ScheduleWarningAssignment[];
};

export type ScheduleWarningSummary = {
  id: string;
  jobId: string;
  kind: ScheduleWarningKind;
  label: string;
  detail: string;
  relatedJobIds: string[];
};

type CrewResource = {
  key: string;
  label: string;
};

type ScheduledJobWithResources = ScheduleWarningJob & {
  resources: CrewResource[];
  startTime: number | null;
  endTime: number | null;
};

function isActiveScheduledJob(job: ScheduleWarningJob) {
  return (
    job.scheduledDate !== null &&
    job.dispatchStatus !== "unscheduled" &&
    job.dispatchStatus !== "completed"
  );
}

function getCrewResources(job: ScheduleWarningJob): CrewResource[] {
  const resources = new Map<string, string>();

  if (job.crewVendorId) {
    resources.set(
      `vendor:${job.crewVendorId}`,
      job.crewVendor?.name ?? "Crew vendor"
    );
  }

  for (const assignment of job.assignments) {
    if (assignment.personId) {
      resources.set(
        `person:${assignment.personId}`,
        assignment.person?.displayName ?? "Crew member"
      );
    }

    if (assignment.vendorId) {
      resources.set(
        `vendor:${assignment.vendorId}`,
        assignment.vendor?.name ?? "Labor-provider vendor"
      );
    }
  }

  return [...resources.entries()].map(([key, label]) => ({ key, label }));
}

function parseScheduleTime(value: string | null) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? null : time;
}

function addWarning(
  warningsByJobId: Map<string, ScheduleWarningSummary[]>,
  warning: ScheduleWarningSummary
) {
  const existing = warningsByJobId.get(warning.jobId);

  if (existing) {
    existing.push(warning);
    return;
  }

  warningsByJobId.set(warning.jobId, [warning]);
}

function hasOverlap(
  left: ScheduledJobWithResources,
  right: ScheduledJobWithResources
) {
  return (
    left.startTime !== null &&
    left.endTime !== null &&
    right.startTime !== null &&
    right.endTime !== null &&
    left.startTime < right.endTime &&
    right.startTime < left.endTime
  );
}

export function deriveScheduleWarningSummaries(jobs: ScheduleWarningJob[]) {
  const warningsByJobId = new Map<string, ScheduleWarningSummary[]>();
  const scheduledJobs = jobs
    .filter(isActiveScheduledJob)
    .map<ScheduledJobWithResources>((job) => ({
      ...job,
      resources: getCrewResources(job),
      startTime: parseScheduleTime(job.scheduledStartAt),
      endTime: parseScheduleTime(job.scheduledEndAt)
    }));

  for (const job of scheduledJobs) {
    if (job.resources.length === 0) {
      addWarning(warningsByJobId, {
        id: `${job.id}:missing-crew`,
        jobId: job.id,
        kind: "missing_crew",
        label: "Missing crew",
        detail:
          "This scheduled job has no person or labor-provider assignment yet.",
        relatedJobIds: []
      });
    }

    if (job.startTime !== null && job.endTime === null) {
      addWarning(warningsByJobId, {
        id: `${job.id}:missing-end-time`,
        jobId: job.id,
        kind: "missing_end_time",
        label: "End time missing",
        detail: "Start time is set, but overlap warnings need an end time.",
        relatedJobIds: []
      });
    }
  }

  for (let leftIndex = 0; leftIndex < scheduledJobs.length; leftIndex += 1) {
    const leftJob = scheduledJobs[leftIndex];

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < scheduledJobs.length;
      rightIndex += 1
    ) {
      const rightJob = scheduledJobs[rightIndex];

      if (
        leftJob.scheduledDate !== rightJob.scheduledDate ||
        !hasOverlap(leftJob, rightJob)
      ) {
        continue;
      }

      const rightResourceKeys = new Set(
        rightJob.resources.map((resource) => resource.key)
      );
      const sharedResources = leftJob.resources.filter((resource) =>
        rightResourceKeys.has(resource.key)
      );

      if (sharedResources.length === 0) {
        continue;
      }

      const sharedCrewLabel = sharedResources
        .map((resource) => resource.label)
        .join(", ");

      addWarning(warningsByJobId, {
        id: `${leftJob.id}:overlap:${rightJob.id}`,
        jobId: leftJob.id,
        kind: "overlap",
        label: "Schedule overlap",
        detail: `${sharedCrewLabel} also appears on ${rightJob.title} during this time window.`,
        relatedJobIds: [rightJob.id]
      });
      addWarning(warningsByJobId, {
        id: `${rightJob.id}:overlap:${leftJob.id}`,
        jobId: rightJob.id,
        kind: "overlap",
        label: "Schedule overlap",
        detail: `${sharedCrewLabel} also appears on ${leftJob.title} during this time window.`,
        relatedJobIds: [leftJob.id]
      });
    }
  }

  return [...warningsByJobId.entries()]
    .map(([jobId, warnings]) => ({
      jobId,
      warnings
    }))
    .sort((left, right) => left.jobId.localeCompare(right.jobId));
}

export function buildScheduleWarningsByJobId(jobs: ScheduleWarningJob[]) {
  return new Map(
    deriveScheduleWarningSummaries(jobs).map((summary) => [
      summary.jobId,
      summary.warnings
    ])
  );
}
