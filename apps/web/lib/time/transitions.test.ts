import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveClockingSessionState,
  getAllowedTimePunchEventTypes,
  validateTimePunchTransition
} from "./transitions";

void test("not clocked in state only allows punch in", () => {
  const state = deriveClockingSessionState({
    hasOpenSession: false,
    latestEventType: null
  });

  assert.equal(state, "not_clocked_in");
  assert.deepEqual(getAllowedTimePunchEventTypes(state), ["punch_in"]);
  assert.equal(
    validateTimePunchTransition({
      eventType: "punch_in",
      hasOpenSession: false,
      latestEventType: null
    }),
    null
  );
  assert.equal(
    validateTimePunchTransition({
      eventType: "punch_out",
      hasOpenSession: false,
      latestEventType: null
    }),
    "Punch out requires an open time session."
  );
});

void test("clocked in state allows break start or punch out", () => {
  const state = deriveClockingSessionState({
    hasOpenSession: true,
    latestEventType: "punch_in"
  });

  assert.equal(state, "clocked_in");
  assert.deepEqual(getAllowedTimePunchEventTypes(state), [
    "break_start",
    "punch_out"
  ]);
  assert.equal(
    validateTimePunchTransition({
      eventType: "break_start",
      hasOpenSession: true,
      latestEventType: "punch_in"
    }),
    null
  );
  assert.equal(
    validateTimePunchTransition({
      eventType: "punch_in",
      hasOpenSession: true,
      latestEventType: "punch_in"
    }),
    "This person already has an open time session."
  );
});

void test("on break state requires break end before punch out", () => {
  const state = deriveClockingSessionState({
    hasOpenSession: true,
    latestEventType: "break_start"
  });

  assert.equal(state, "on_break");
  assert.deepEqual(getAllowedTimePunchEventTypes(state), ["break_end"]);
  assert.equal(
    validateTimePunchTransition({
      eventType: "break_end",
      hasOpenSession: true,
      latestEventType: "break_start"
    }),
    null
  );
  assert.equal(
    validateTimePunchTransition({
      eventType: "punch_out",
      hasOpenSession: true,
      latestEventType: "break_start"
    }),
    "End the active break before punching out."
  );
});
