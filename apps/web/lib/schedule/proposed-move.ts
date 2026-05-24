import {
  buildScheduleMoveSummary,
  formatScheduleMoveEndpoint,
  type ScheduleMoveEndpoint,
  type ScheduleMovePayload
} from "./move";

export type CrewBoardDropTarget =
  | {
      kind: "date";
      date: string;
      label?: string;
    }
  | {
      kind: "time_bucket";
      date: string;
      startTime: string;
      endTime?: string | null;
      label?: string;
    }
  | {
      kind: "unscheduled";
      label?: string;
    };

export type CrewBoardMoveProposalJob = {
  id: string;
  dispatchStatus?: string;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
};

export type CrewBoardMoveProposal = {
  jobId: string;
  currentSchedule: ScheduleMoveEndpoint;
  target: CrewBoardDropTarget;
  payload: ScheduleMovePayload;
  targetLabel: string;
  summary: string;
  detail: string;
  isNoop: boolean;
  isValid: boolean;
  warnings: string[];
};

export type CrewBoardMoveTargetSearchInput = {
  moveTarget?: string | null;
  moveDate?: string | null;
  moveStart?: string | null;
  moveEnd?: string | null;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

function isValidDateKey(value: string | null | undefined) {
  const normalized = normalizeText(value);

  if (!normalized || !datePattern.test(normalized)) {
    return false;
  }

  const date = new Date(`${normalized}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === normalized
  );
}

function isValidTime(value: string | null | undefined) {
  const normalized = normalizeText(value);

  if (!normalized || !timePattern.test(normalized)) {
    return false;
  }

  const [hour, minute] = normalized.split(":").map(Number);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function toDateTime(date: string, time: string | null | undefined) {
  const normalizedTime = normalizeText(time);

  return normalizedTime ? `${date}T${normalizedTime}` : null;
}

function getCurrentSchedule(
  job: CrewBoardMoveProposalJob
): ScheduleMoveEndpoint {
  return {
    scheduledDate: job.scheduledDate,
    scheduledStartAt: job.scheduledStartAt,
    scheduledEndAt: job.scheduledEndAt
  };
}

function getPayloadForTarget(target: CrewBoardDropTarget): ScheduleMovePayload {
  if (target.kind === "unscheduled") {
    return {
      scheduledDate: null,
      scheduledStartAt: null,
      scheduledEndAt: null
    };
  }

  if (target.kind === "date") {
    return {
      scheduledDate: target.date,
      scheduledStartAt: null,
      scheduledEndAt: null
    };
  }

  return {
    scheduledDate: target.date,
    scheduledStartAt: toDateTime(target.date, target.startTime),
    scheduledEndAt: toDateTime(target.date, target.endTime)
  };
}

export function createCrewBoardDateDropTarget(
  date: string,
  label?: string
): CrewBoardDropTarget {
  return {
    kind: "date",
    date,
    label
  };
}

export function createCrewBoardTimeBucketDropTarget(input: {
  date: string;
  startTime: string;
  endTime?: string | null;
  label?: string;
}): CrewBoardDropTarget {
  return {
    kind: "time_bucket",
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime ?? null,
    label: input.label
  };
}

export function createCrewBoardUnscheduledDropTarget(
  label?: string
): CrewBoardDropTarget {
  return {
    kind: "unscheduled",
    label
  };
}

export function isValidDropTarget(target: CrewBoardDropTarget) {
  if (target.kind === "unscheduled") {
    return true;
  }

  if (!isValidDateKey(target.date)) {
    return false;
  }

  if (target.kind === "date") {
    return true;
  }

  return (
    isValidTime(target.startTime) &&
    (!target.endTime || isValidTime(target.endTime))
  );
}

export function formatDropTargetLabel(target: CrewBoardDropTarget) {
  if (target.label) {
    return target.label;
  }

  return formatScheduleMoveEndpoint(getPayloadForTarget(target));
}

export function createCrewBoardMoveProposal(
  job: CrewBoardMoveProposalJob,
  target: CrewBoardDropTarget
): CrewBoardMoveProposal {
  const currentSchedule = getCurrentSchedule(job);
  const payload = getPayloadForTarget(target);
  const moveSummary = buildScheduleMoveSummary({
    current: currentSchedule,
    proposed: payload
  });
  const warnings: string[] = [];
  const isValid = isValidDropTarget(target);

  if (!isValid) {
    warnings.push("Choose a valid CrewBoard move target.");
  }

  if (moveSummary.isNoOp) {
    warnings.push("This target matches the current schedule.");
  }

  if (
    target.kind === "unscheduled" &&
    (job.dispatchStatus === "in_progress" || job.dispatchStatus === "completed")
  ) {
    warnings.push(
      "In-progress or completed jobs cannot be prepared for unscheduling here."
    );
  }

  return {
    jobId: job.id,
    currentSchedule: moveSummary.current,
    target,
    payload: moveSummary.payload,
    targetLabel: formatDropTargetLabel(target),
    summary: moveSummary.summary,
    detail: moveSummary.detail,
    isNoop: moveSummary.isNoOp,
    isValid,
    warnings
  };
}

export function isNoopMoveProposal(proposal: CrewBoardMoveProposal) {
  return proposal.isNoop;
}

export function buildCrewBoardDropTargetFromSearch(
  input: CrewBoardMoveTargetSearchInput
): CrewBoardDropTarget | null {
  if (input.moveTarget === "unscheduled") {
    return createCrewBoardUnscheduledDropTarget("Unscheduled");
  }

  const moveDate = normalizeText(input.moveDate);

  if (!moveDate) {
    return null;
  }

  const moveStart = normalizeText(input.moveStart);

  if (!moveStart) {
    return createCrewBoardDateDropTarget(moveDate);
  }

  return createCrewBoardTimeBucketDropTarget({
    date: moveDate,
    startTime: moveStart,
    endTime: normalizeText(input.moveEnd)
  });
}
