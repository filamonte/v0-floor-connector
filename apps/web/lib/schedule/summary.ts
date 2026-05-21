export type ScheduleSummaryJobLike = {
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
};

export function formatScheduleSummaryShortDate(value: string | null) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    : "Unscheduled";
}

export function formatScheduleSummaryWindow(input: ScheduleSummaryJobLike) {
  if (input.scheduledStartAt && input.scheduledEndAt) {
    const startLabel = new Date(input.scheduledStartAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
    const endLabel = new Date(input.scheduledEndAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });

    return `${formatScheduleSummaryShortDate(input.scheduledDate)} / ${startLabel} - ${endLabel}`;
  }

  if (input.scheduledStartAt) {
    return `${formatScheduleSummaryShortDate(input.scheduledDate)} / ${new Date(
      input.scheduledStartAt
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    })}`;
  }

  return formatScheduleSummaryShortDate(input.scheduledDate);
}

export function getScheduleSummarySortValue(job: ScheduleSummaryJobLike) {
  if (job.scheduledStartAt) {
    return new Date(job.scheduledStartAt).getTime();
  }

  if (job.scheduledDate) {
    return new Date(`${job.scheduledDate}T00:00:00`).getTime();
  }

  return Number.POSITIVE_INFINITY;
}

export function getScheduleAssignmentSummary(input: {
  assignmentNames: string[];
  crewVendorName: string | null;
  assignmentCount: number;
}) {
  if (input.assignmentNames.length > 0) {
    return input.assignmentNames.join(", ");
  }

  if (input.crewVendorName) {
    return input.crewVendorName;
  }

  if (input.assignmentCount > 0) {
    return `${input.assignmentCount} assignment${input.assignmentCount === 1 ? "" : "s"}`;
  }

  return "Needs crew assignment";
}
