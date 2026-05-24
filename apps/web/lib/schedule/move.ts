export type ScheduleMoveEndpoint = {
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
};

export type ScheduleMovePayload = ScheduleMoveEndpoint;

export type ScheduleMoveSummary = {
  current: ScheduleMoveEndpoint;
  proposed: ScheduleMoveEndpoint;
  payload: ScheduleMovePayload;
  isNoOp: boolean;
  summary: string;
  detail: string;
};

export type ScheduleMoveInput = {
  current: ScheduleMoveEndpoint;
  proposed: ScheduleMoveEndpoint;
};

function normalizeDate(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? normalized
    : null;
}

function normalizeDateTime(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized.slice(0, 16) : null;
}

function toEndpoint(input: ScheduleMoveEndpoint): ScheduleMoveEndpoint {
  return {
    scheduledDate: normalizeDate(input.scheduledDate),
    scheduledStartAt: normalizeDateTime(input.scheduledStartAt),
    scheduledEndAt: normalizeDateTime(input.scheduledEndAt)
  };
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "unscheduled";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTimeLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

export function formatScheduleMoveEndpoint(endpoint: ScheduleMoveEndpoint) {
  if (!endpoint.scheduledDate) {
    return "Unscheduled";
  }

  const dateLabel = formatDateLabel(endpoint.scheduledDate);
  const startLabel = formatTimeLabel(endpoint.scheduledStartAt);
  const endLabel = formatTimeLabel(endpoint.scheduledEndAt);

  if (startLabel && endLabel) {
    return `${dateLabel}, ${startLabel} to ${endLabel}`;
  }

  if (startLabel) {
    return `${dateLabel}, starts ${startLabel} with no end time`;
  }

  return `${dateLabel}, time not set`;
}

export function buildScheduleMoveSummary(
  input: ScheduleMoveInput
): ScheduleMoveSummary {
  const current = toEndpoint(input.current);
  const proposed = toEndpoint(input.proposed);
  const isNoOp =
    current.scheduledDate === proposed.scheduledDate &&
    current.scheduledStartAt === proposed.scheduledStartAt &&
    current.scheduledEndAt === proposed.scheduledEndAt;
  const fromLabel = formatScheduleMoveEndpoint(current);
  const toLabel = formatScheduleMoveEndpoint(proposed);
  const isFromUnscheduled = current.scheduledDate === null;
  const isToUnscheduled = proposed.scheduledDate === null;
  const summary = isNoOp
    ? "No schedule move selected yet."
    : isFromUnscheduled && !isToUnscheduled
      ? `Move from unscheduled to ${toLabel}.`
      : !isFromUnscheduled && isToUnscheduled
        ? `Move from ${fromLabel} back to unscheduled.`
        : `Move from ${fromLabel} to ${toLabel}.`;
  const detail = proposed.scheduledStartAt
    ? proposed.scheduledEndAt
      ? "Start and end time are both set for this schedule move."
      : "Start time is set, but end time is not set. Schedule warnings may still flag this job."
    : proposed.scheduledDate
      ? "Date is set without a time. The job will stay on the selected day with time not set."
      : "No schedule date is set.";

  return {
    current,
    proposed,
    payload: proposed,
    isNoOp,
    summary,
    detail
  };
}
