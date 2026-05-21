import type { TimePunchEventType } from "@floorconnector/types";

export type ClockingSessionState = "not_clocked_in" | "clocked_in" | "on_break";

export function deriveClockingSessionState(input: {
  hasOpenSession: boolean;
  latestEventType: TimePunchEventType | null;
}): ClockingSessionState {
  if (!input.hasOpenSession) {
    return "not_clocked_in";
  }

  return input.latestEventType === "break_start" ? "on_break" : "clocked_in";
}

export function getAllowedTimePunchEventTypes(
  state: ClockingSessionState
): TimePunchEventType[] {
  switch (state) {
    case "not_clocked_in":
      return ["punch_in"];
    case "clocked_in":
      return ["break_start", "punch_out"];
    case "on_break":
      return ["break_end"];
    default:
      return [];
  }
}

export function validateTimePunchTransition(input: {
  eventType: TimePunchEventType;
  hasOpenSession: boolean;
  latestEventType: TimePunchEventType | null;
}) {
  const state = deriveClockingSessionState({
    hasOpenSession: input.hasOpenSession,
    latestEventType: input.latestEventType
  });
  const allowedEventTypes = getAllowedTimePunchEventTypes(state);

  if (allowedEventTypes.includes(input.eventType)) {
    return null;
  }

  switch (input.eventType) {
    case "punch_in":
      return "This person already has an open time session.";
    case "break_start":
      return input.hasOpenSession
        ? "Break start requires an active punch-in or a completed prior break."
        : "Breaks can only start during an open time session.";
    case "break_end":
      return input.hasOpenSession
        ? "Break end requires an active break."
        : "Breaks can only end during an open time session.";
    case "punch_out":
      return input.latestEventType === "break_start"
        ? "End the active break before punching out."
        : "Punch out requires an open time session.";
    default:
      return "Unable to record this time event from the current session state.";
  }
}
