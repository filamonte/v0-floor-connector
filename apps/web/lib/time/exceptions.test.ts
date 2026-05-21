import assert from "node:assert/strict";
import test from "node:test";

import { deriveTimeReviewExceptions } from "./exceptions";

const baseCard = {
  id: "card-1",
  personId: "person-1",
  workDate: "2026-05-19",
  punchInAt: "2026-05-19T12:00:00.000Z",
  punchOutAt: "2026-05-19T20:00:00.000Z",
  status: "completed" as const,
  reviewStatus: "needs_review" as const
};

void test("flags old open sessions and unended breaks", () => {
  const exceptions = deriveTimeReviewExceptions({
    nowIso: "2026-05-19T22:30:00.000Z",
    timeCards: [
      {
        ...baseCard,
        id: "card-open",
        punchInAt: "2026-05-19T08:00:00.000Z",
        punchOutAt: null,
        status: "open",
        reviewStatus: "draft",
        currentPunchState: "on_break"
      }
    ]
  });

  assert.deepEqual(
    exceptions.map((exception) => exception.type),
    ["open_session_over_expected", "break_not_ended"]
  );
});

void test("flags missing prior-day clock out", () => {
  const exceptions = deriveTimeReviewExceptions({
    nowIso: "2026-05-20T14:00:00.000Z",
    timeCards: [
      {
        ...baseCard,
        id: "card-prior",
        workDate: "2026-05-19",
        punchOutAt: null,
        status: "open",
        reviewStatus: "draft",
        currentPunchState: "punched_in"
      }
    ]
  });

  assert.equal(
    exceptions.some((exception) => exception.type === "missing_clock_out"),
    true
  );
});

void test("flags invalid sequences and rejected review state", () => {
  const exceptions = deriveTimeReviewExceptions({
    nowIso: "2026-05-19T22:00:00.000Z",
    timeCards: [
      {
        ...baseCard,
        id: "card-flagged",
        status: "flagged"
      },
      {
        ...baseCard,
        id: "card-rejected",
        reviewStatus: "rejected"
      }
    ]
  });

  assert.deepEqual(
    exceptions.map((exception) => exception.type),
    ["invalid_event_sequence", "rejected_needs_correction"]
  );
});
