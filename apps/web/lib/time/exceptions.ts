import type { TimeCard, TimeCardReviewStatus } from "@floorconnector/types";

export type TimeReviewExceptionType =
  | "open_session_over_expected"
  | "break_not_ended"
  | "missing_clock_out"
  | "invalid_event_sequence"
  | "rejected_needs_correction";

export type TimeReviewExceptionSeverity = "warning" | "critical";

export type TimeReviewException = {
  id: string;
  timeCardId: string;
  personId: string;
  type: TimeReviewExceptionType;
  severity: TimeReviewExceptionSeverity;
  title: string;
  detail: string;
};

type TimeReviewExceptionInput = Pick<
  TimeCard,
  | "id"
  | "personId"
  | "workDate"
  | "punchInAt"
  | "punchOutAt"
  | "status"
  | "reviewStatus"
> & {
  currentPunchState?: "punched_in" | "on_break" | null;
};

function startOfLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function diffHours(start: string, end: string) {
  return (new Date(end).getTime() - new Date(start).getTime()) / 36e5;
}

function isBeforeToday(workDate: string, nowIso: string) {
  const nowDate = new Date(nowIso);
  const today = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  );

  return startOfLocalDate(workDate).getTime() < today.getTime();
}

function getReviewStatus(
  status: TimeReviewExceptionInput["status"],
  reviewStatus: TimeCardReviewStatus
) {
  if (status === "open") {
    return "draft";
  }

  return reviewStatus;
}

export function deriveTimeReviewExceptions(input: {
  timeCards: readonly TimeReviewExceptionInput[];
  nowIso: string;
  openSessionWarningHours?: number;
}): TimeReviewException[] {
  const openSessionWarningHours = input.openSessionWarningHours ?? 12;
  const exceptions: TimeReviewException[] = [];

  for (const timeCard of input.timeCards) {
    const effectiveReviewStatus = getReviewStatus(
      timeCard.status,
      timeCard.reviewStatus
    );

    if (
      timeCard.status === "open" &&
      diffHours(timeCard.punchInAt, input.nowIso) >= openSessionWarningHours
    ) {
      exceptions.push({
        id: `${timeCard.id}:open-session-over-expected`,
        timeCardId: timeCard.id,
        personId: timeCard.personId,
        type: "open_session_over_expected",
        severity: "warning",
        title: "Open session is older than expected",
        detail:
          "Review whether the worker missed clock-out or is still actively working."
      });
    }

    if (
      timeCard.status === "open" &&
      timeCard.currentPunchState === "on_break"
    ) {
      exceptions.push({
        id: `${timeCard.id}:break-not-ended`,
        timeCardId: timeCard.id,
        personId: timeCard.personId,
        type: "break_not_ended",
        severity: "warning",
        title: "Break has not been ended",
        detail:
          "The next valid punch should end the break before work can continue."
      });
    }

    if (
      timeCard.status === "open" &&
      isBeforeToday(timeCard.workDate, input.nowIso)
    ) {
      exceptions.push({
        id: `${timeCard.id}:missing-clock-out`,
        timeCardId: timeCard.id,
        personId: timeCard.personId,
        type: "missing_clock_out",
        severity: "critical",
        title: "Clock-out is missing from a prior work date",
        detail:
          "This card should be reviewed before payroll/export or job-costing inputs are considered later."
      });
    }

    if (timeCard.status === "flagged") {
      exceptions.push({
        id: `${timeCard.id}:invalid-event-sequence`,
        timeCardId: timeCard.id,
        personId: timeCard.personId,
        type: "invalid_event_sequence",
        severity: "critical",
        title: "Punch sequence needs review",
        detail:
          "The derived card was flagged from overlapping or incomplete punch evidence."
      });
    }

    if (effectiveReviewStatus === "rejected") {
      exceptions.push({
        id: `${timeCard.id}:rejected-needs-correction`,
        timeCardId: timeCard.id,
        personId: timeCard.personId,
        type: "rejected_needs_correction",
        severity: "critical",
        title: "Rejected time card needs correction",
        detail:
          "The manager review outcome is rejected; correction remains a separate audited workflow."
      });
    }
  }

  return exceptions;
}
