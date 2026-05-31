import type { JobStatus } from "@floorconnector/types";

export type ScheduleWarningKind =
  | "missing_crew"
  | "missing_end_time"
  | "overlap"
  | "same_day_capacity";

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
  resourceKeys?: string[];
  resourceLabels?: string[];
  sameDayJobCount?: number;
};

export type ScheduleResourceLoadSummary = {
  id: string;
  dateKey: string;
  resourceKey: string;
  resourceLabel: string;
  jobIds: string[];
  jobCount: number;
  hasIncompleteTiming: boolean;
  hasOverlap: boolean;
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

function hasComparableScheduleWindow(job: ScheduledJobWithResources) {
  return job.startTime !== null && job.endTime !== null;
}

function buildScheduledJobsWithResources(jobs: ScheduleWarningJob[]) {
  return jobs
    .filter(isActiveScheduledJob)
    .map<ScheduledJobWithResources>((job) => ({
      ...job,
      resources: getCrewResources(job),
      startTime: parseScheduleTime(job.scheduledStartAt),
      endTime: parseScheduleTime(job.scheduledEndAt)
    }));
}

function getResourceLoadKey(dateKey: string, resourceKey: string) {
  return `${dateKey}:${resourceKey}`;
}

function deriveResourceLoadSummariesFromScheduledJobs(
  scheduledJobs: ScheduledJobWithResources[]
): ScheduleResourceLoadSummary[] {
  const resourceLoads = new Map<
    string,
    {
      dateKey: string;
      resource: CrewResource;
      jobs: ScheduledJobWithResources[];
    }
  >();

  for (const job of scheduledJobs) {
    if (!job.scheduledDate) {
      continue;
    }

    for (const resource of job.resources) {
      const key = getResourceLoadKey(job.scheduledDate, resource.key);
      const existing = resourceLoads.get(key);

      if (existing) {
        existing.jobs.push(job);
      } else {
        resourceLoads.set(key, {
          dateKey: job.scheduledDate,
          resource,
          jobs: [job]
        });
      }
    }
  }

  return [...resourceLoads.values()]
    .filter((load) => load.jobs.length > 1)
    .map((load) => {
      const hasResourceOverlap = load.jobs.some((leftJob, leftIndex) =>
        load.jobs
          .slice(leftIndex + 1)
          .some((rightJob) => hasOverlap(leftJob, rightJob))
      );

      return {
        id: getResourceLoadKey(load.dateKey, load.resource.key),
        dateKey: load.dateKey,
        resourceKey: load.resource.key,
        resourceLabel: load.resource.label,
        jobIds: load.jobs.map((job) => job.id).sort(),
        jobCount: load.jobs.length,
        hasIncompleteTiming: load.jobs.some(
          (job) => !hasComparableScheduleWindow(job)
        ),
        hasOverlap: hasResourceOverlap
      };
    })
    .sort((left, right) => {
      const dateComparison = left.dateKey.localeCompare(right.dateKey);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.resourceLabel.localeCompare(right.resourceLabel);
    });
}

export function deriveScheduleResourceLoadSummaries(
  jobs: ScheduleWarningJob[]
) {
  return deriveResourceLoadSummariesFromScheduledJobs(
    buildScheduledJobsWithResources(jobs)
  );
}

export function deriveScheduleWarningSummaries(jobs: ScheduleWarningJob[]) {
  const warningsByJobId = new Map<string, ScheduleWarningSummary[]>();
  const scheduledJobs = buildScheduledJobsWithResources(jobs);
  const resourceLoadsByKey = new Map(
    deriveResourceLoadSummariesFromScheduledJobs(scheduledJobs).map((load) => [
      load.id,
      load
    ])
  );

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

      if (leftJob.scheduledDate !== rightJob.scheduledDate) {
        continue;
      }

      const scheduledDate = leftJob.scheduledDate;

      if (!scheduledDate) {
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
      const sharedResourceKeys = sharedResources.map(
        (resource) => resource.key
      );
      const sharedResourceLabels = sharedResources.map(
        (resource) => resource.label
      );
      const sameDayJobCount = Math.max(
        ...sharedResources.map(
          (resource) =>
            resourceLoadsByKey.get(
              getResourceLoadKey(scheduledDate, resource.key)
            )?.jobCount ?? 0
        )
      );
      const sharedResourceWarningMetadata = {
        resourceKeys: sharedResourceKeys,
        resourceLabels: sharedResourceLabels,
        sameDayJobCount: sameDayJobCount > 0 ? sameDayJobCount : undefined
      };

      if (hasOverlap(leftJob, rightJob)) {
        addWarning(warningsByJobId, {
          id: `${leftJob.id}:overlap:${rightJob.id}`,
          jobId: leftJob.id,
          kind: "overlap",
          label: "Schedule overlap",
          detail: `${sharedCrewLabel} also appears on ${rightJob.title} during this time window.`,
          relatedJobIds: [rightJob.id],
          ...sharedResourceWarningMetadata
        });
        addWarning(warningsByJobId, {
          id: `${rightJob.id}:overlap:${leftJob.id}`,
          jobId: rightJob.id,
          kind: "overlap",
          label: "Schedule overlap",
          detail: `${sharedCrewLabel} also appears on ${leftJob.title} during this time window.`,
          relatedJobIds: [leftJob.id],
          ...sharedResourceWarningMetadata
        });

        continue;
      }

      if (
        !hasComparableScheduleWindow(leftJob) ||
        !hasComparableScheduleWindow(rightJob)
      ) {
        addWarning(warningsByJobId, {
          id: `${leftJob.id}:same-day-capacity:${rightJob.id}`,
          jobId: leftJob.id,
          kind: "same_day_capacity",
          label: "Same-day capacity",
          detail: `${sharedCrewLabel} is also assigned to ${rightJob.title} on this date. Confirm timing and travel manually.`,
          relatedJobIds: [rightJob.id],
          ...sharedResourceWarningMetadata
        });
        addWarning(warningsByJobId, {
          id: `${rightJob.id}:same-day-capacity:${leftJob.id}`,
          jobId: rightJob.id,
          kind: "same_day_capacity",
          label: "Same-day capacity",
          detail: `${sharedCrewLabel} is also assigned to ${leftJob.title} on this date. Confirm timing and travel manually.`,
          relatedJobIds: [leftJob.id],
          ...sharedResourceWarningMetadata
        });
      }
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
