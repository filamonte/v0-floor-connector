import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCrewBoardDropTargetFromSearch,
  createCrewBoardDateDropTarget,
  createCrewBoardMoveProposal,
  createCrewBoardTimeBucketDropTarget,
  createCrewBoardUnscheduledDropTarget,
  formatDropTargetLabel,
  isNoopMoveProposal,
  isValidDropTarget,
  type CrewBoardMoveProposalJob
} from "./proposed-move";

const baseJob: CrewBoardMoveProposalJob = {
  id: "11111111-1111-4111-8111-111111111111",
  dispatchStatus: "scheduled",
  scheduledDate: "2026-05-25",
  scheduledStartAt: "2026-05-25T09:00",
  scheduledEndAt: "2026-05-25T11:00"
};

void test("validates date drop targets", () => {
  assert.equal(
    isValidDropTarget(createCrewBoardDateDropTarget("2026-05-26")),
    true
  );
  assert.equal(
    isValidDropTarget(createCrewBoardDateDropTarget("not-a-date")),
    false
  );
});

void test("validates time bucket drop targets", () => {
  assert.equal(
    isValidDropTarget(
      createCrewBoardTimeBucketDropTarget({
        date: "2026-05-26",
        startTime: "13:00",
        endTime: "15:00"
      })
    ),
    true
  );
  assert.equal(
    isValidDropTarget(
      createCrewBoardTimeBucketDropTarget({
        date: "2026-05-26",
        startTime: "99:00"
      })
    ),
    false
  );
});

void test("supports unscheduled targets for future explicit unschedule proposals", () => {
  const target = createCrewBoardUnscheduledDropTarget();
  const proposal = createCrewBoardMoveProposal(baseJob, target);

  assert.equal(isValidDropTarget(target), true);
  assert.equal(proposal.payload.scheduledDate, null);
  assert.match(proposal.summary, /back to unscheduled/);
});

void test("creates proposal payload from job and date target", () => {
  const proposal = createCrewBoardMoveProposal(
    baseJob,
    createCrewBoardDateDropTarget("2026-05-27")
  );

  assert.equal(proposal.jobId, baseJob.id);
  assert.equal(proposal.payload.scheduledDate, "2026-05-27");
  assert.equal(proposal.payload.scheduledStartAt, null);
  assert.equal(proposal.payload.scheduledEndAt, null);
  assert.match(proposal.summary, /May 27, 2026, time not set/);
});

void test("creates proposal payload from job and time bucket target", () => {
  const proposal = createCrewBoardMoveProposal(
    baseJob,
    createCrewBoardTimeBucketDropTarget({
      date: "2026-05-27",
      startTime: "13:00",
      endTime: "15:00"
    })
  );

  assert.equal(proposal.payload.scheduledDate, "2026-05-27");
  assert.equal(proposal.payload.scheduledStartAt, "2026-05-27T13:00");
  assert.equal(proposal.payload.scheduledEndAt, "2026-05-27T15:00");
  assert.match(proposal.summary, /1:00 PM to 3:00 PM/);
});

void test("detects no-op proposals", () => {
  const proposal = createCrewBoardMoveProposal(
    baseJob,
    createCrewBoardTimeBucketDropTarget({
      date: "2026-05-25",
      startTime: "09:00",
      endTime: "11:00"
    })
  );

  assert.equal(isNoopMoveProposal(proposal), true);
  assert.match(proposal.warnings.join(" "), /matches the current schedule/);
});

void test("formats target labels with existing move endpoint language", () => {
  const target = createCrewBoardTimeBucketDropTarget({
    date: "2026-05-27",
    startTime: "13:00"
  });

  assert.equal(
    formatDropTargetLabel(target),
    "May 27, 2026, starts 1:00 PM with no end time"
  );
});

void test("builds target from URL search state", () => {
  const target = buildCrewBoardDropTargetFromSearch({
    moveDate: "2026-05-27",
    moveStart: "13:00",
    moveEnd: "15:00"
  });

  assert.deepEqual(target, {
    kind: "time_bucket",
    date: "2026-05-27",
    startTime: "13:00",
    endTime: "15:00",
    label: undefined
  });
});
