import assert from "node:assert/strict";
import test from "node:test";

import { buildScheduleFieldHandoffSummaries } from "./field-handoff-read-model";

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  projectId: "22222222-2222-4222-8222-222222222222",
  scheduledDate: "2026-05-28",
  dispatchStatus: "scheduled",
  assignmentCount: 1
};

void test("schedule field handoff marks crew and scheduled-day Daily Log continuity", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [baseJob],
    dailyLogs: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        jobId: baseJob.id,
        logDate: "2026-05-28",
        status: "draft",
        updatedAt: "2026-05-28T12:00:00.000Z"
      }
    ],
    fieldNotes: [],
    timeCards: []
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.hasCrewAssigned, true);
  assert.equal(handoff.dailyLog?.id, "33333333-3333-4333-8333-333333333333");
  assert.equal(
    handoff.dailyLogHref,
    "/daily-logs/33333333-3333-4333-8333-333333333333"
  );
  assert.equal(handoff.label, "Field handoff active");
  assert.equal(handoff.tone, "ready");
});

void test("schedule field handoff reports missing crew and missing Daily Log without creating state", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [
      {
        ...baseJob,
        assignmentCount: 0,
        scheduledDate: "2026-05-29"
      }
    ],
    dailyLogs: [],
    fieldNotes: [],
    timeCards: []
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.hasCrewAssigned, false);
  assert.equal(handoff.dailyLog, null);
  assert.equal(
    handoff.dailyLogHref,
    `/daily-logs?compose=1&projectId=${baseJob.projectId}&jobId=${baseJob.id}&logDate=2026-05-29#daily-log-create`
  );
  assert.equal(handoff.label, "Crew missing");
  assert.equal(handoff.tone, "warning");
});

void test("schedule field handoff derives blocker and time-card state from canonical rows", () => {
  const handoffs = buildScheduleFieldHandoffSummaries({
    todayDateKey: "2026-05-28",
    jobs: [baseJob],
    dailyLogs: [
      {
        id: "daily-log-1",
        jobId: baseJob.id,
        logDate: "2026-05-27",
        status: "submitted",
        updatedAt: "2026-05-27T21:00:00.000Z"
      },
      {
        id: "daily-log-2",
        jobId: baseJob.id,
        logDate: "2026-05-28",
        status: "draft",
        updatedAt: "2026-05-28T13:00:00.000Z"
      }
    ],
    fieldNotes: [
      {
        id: "note-1",
        jobId: baseJob.id,
        noteType: "blocker",
        status: "open",
        updatedAt: "2026-05-28T14:00:00.000Z"
      },
      {
        id: "note-2",
        jobId: baseJob.id,
        noteType: "observation",
        status: "open",
        updatedAt: "2026-05-28T15:00:00.000Z"
      },
      {
        id: "note-3",
        jobId: baseJob.id,
        noteType: "issue",
        status: "closed",
        updatedAt: "2026-05-28T16:00:00.000Z"
      }
    ],
    timeCards: [
      {
        id: "time-card-1",
        jobId: baseJob.id,
        workDate: "2026-05-28",
        status: "open",
        updatedAt: "2026-05-28T17:00:00.000Z"
      },
      {
        id: "time-card-2",
        jobId: baseJob.id,
        workDate: "2026-05-27",
        status: "completed",
        updatedAt: "2026-05-27T20:00:00.000Z"
      }
    ]
  });

  const handoff = handoffs.get(baseJob.id);

  assert.ok(handoff);
  assert.equal(handoff.latestDailyLog?.id, "daily-log-2");
  assert.equal(handoff.openBlockerCount, 1);
  assert.equal(handoff.fieldNoteCount, 3);
  assert.equal(handoff.targetDateTimeCardCount, 1);
  assert.equal(handoff.openTimeCardCount, 1);
  assert.equal(handoff.latestFieldActivityAt, "2026-05-28T17:00:00.000Z");
  assert.equal(handoff.label, "Blockers open");
  assert.equal(
    handoff.blockerHref,
    "/daily-logs/daily-log-2?noteType=blocker#job-notes"
  );
});
