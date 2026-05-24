import assert from "node:assert/strict";
import test from "node:test";

import { buildScheduleMoveSummary, formatScheduleMoveEndpoint } from "./move";

void test("schedule move summarizes unscheduled to scheduled time", () => {
  const move = buildScheduleMoveSummary({
    current: {
      scheduledDate: null,
      scheduledStartAt: null,
      scheduledEndAt: null
    },
    proposed: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T13:00",
      scheduledEndAt: "2026-05-25T15:00"
    }
  });

  assert.equal(move.isNoOp, false);
  assert.equal(move.payload.scheduledDate, "2026-05-25");
  assert.match(move.summary, /Move from unscheduled to May 25, 2026/);
  assert.match(move.summary, /1:00 PM to 3:00 PM/);
});

void test("schedule move summarizes scheduled date to new date", () => {
  const move = buildScheduleMoveSummary({
    current: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: null,
      scheduledEndAt: null
    },
    proposed: {
      scheduledDate: "2026-05-26",
      scheduledStartAt: null,
      scheduledEndAt: null
    }
  });

  assert.equal(move.isNoOp, false);
  assert.match(move.summary, /May 25, 2026, time not set/);
  assert.match(move.summary, /May 26, 2026, time not set/);
});

void test("schedule move summarizes scheduled time to new time", () => {
  const move = buildScheduleMoveSummary({
    current: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T13:00",
      scheduledEndAt: "2026-05-25T15:00"
    },
    proposed: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T16:00",
      scheduledEndAt: "2026-05-25T18:00"
    }
  });

  assert.equal(move.isNoOp, false);
  assert.match(move.summary, /1:00 PM to 3:00 PM/);
  assert.match(move.summary, /4:00 PM to 6:00 PM/);
});

void test("schedule move detects no-op movement", () => {
  const move = buildScheduleMoveSummary({
    current: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T13:00:00.000Z",
      scheduledEndAt: "2026-05-25T15:00:00.000Z"
    },
    proposed: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T13:00",
      scheduledEndAt: "2026-05-25T15:00"
    }
  });

  assert.equal(move.isNoOp, true);
  assert.equal(move.summary, "No schedule move selected yet.");
});

void test("schedule move preserves missing end time in payload and detail", () => {
  const move = buildScheduleMoveSummary({
    current: {
      scheduledDate: "2026-05-25",
      scheduledStartAt: "2026-05-25T13:00",
      scheduledEndAt: null
    },
    proposed: {
      scheduledDate: "2026-05-26",
      scheduledStartAt: "2026-05-26T14:00",
      scheduledEndAt: null
    }
  });

  assert.equal(move.payload.scheduledEndAt, null);
  assert.match(move.summary, /starts 2:00 PM with no end time/);
  assert.match(move.detail, /end time is not set/);
});

void test("schedule move endpoint formats all-day scheduled work", () => {
  assert.equal(
    formatScheduleMoveEndpoint({
      scheduledDate: "2026-05-25",
      scheduledStartAt: null,
      scheduledEndAt: null
    }),
    "May 25, 2026, time not set"
  );
});
