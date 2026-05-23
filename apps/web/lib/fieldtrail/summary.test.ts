import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveFieldTrailSummary,
  type FieldTrailAttachment,
  type FieldTrailDailyLog,
  type FieldTrailFieldNote,
  type FieldTrailJob,
  type FieldTrailTimeCard
} from "./summary";

const dailyLogs: FieldTrailDailyLog[] = [
  {
    id: "log-old",
    jobId: "job-1",
    logDate: "2026-05-20",
    status: "finalized",
    summary: "Prep complete",
    workCompleted: null,
    workPlannedNext: null,
    delaysOrBlockers: null,
    weatherSummary: null,
    updatedAt: "2026-05-20T20:00:00.000Z"
  },
  {
    id: "log-new",
    jobId: "job-1",
    logDate: "2026-05-21",
    status: "draft",
    summary: "Topcoat started",
    workCompleted: null,
    workPlannedNext: null,
    delaysOrBlockers: null,
    weatherSummary: null,
    updatedAt: "2026-05-21T20:00:00.000Z"
  }
];

const fieldNotes: FieldTrailFieldNote[] = [
  {
    id: "note-1",
    dailyLogId: "log-new",
    jobId: "job-1",
    noteType: "blocker",
    title: "Moisture reading needs review",
    status: "open",
    updatedAt: "2026-05-21T21:00:00.000Z"
  },
  {
    id: "note-2",
    dailyLogId: "log-new",
    jobId: "job-1",
    noteType: "general",
    title: "Broadcast complete",
    status: "noted",
    updatedAt: "2026-05-21T20:30:00.000Z"
  }
];

const attachments: FieldTrailAttachment[] = [
  {
    id: "attachment-1",
    subjectType: "daily_log",
    subjectId: "log-new",
    attachmentType: "photo",
    fileName: "floor.jpg",
    caption: null,
    createdAt: "2026-05-21T21:05:00.000Z"
  },
  {
    id: "attachment-2",
    subjectType: "field_note",
    subjectId: "note-1",
    attachmentType: "file",
    fileName: "reading.pdf",
    caption: null,
    createdAt: "2026-05-21T21:06:00.000Z"
  }
];

const timeCards: FieldTrailTimeCard[] = [
  {
    id: "time-1",
    jobId: "job-1",
    workDate: "2026-05-21",
    workedMinutes: 240,
    status: "completed",
    person: { displayName: "Jordan Crew" }
  },
  {
    id: "time-2",
    jobId: "job-1",
    workDate: "2026-05-21",
    workedMinutes: 120,
    status: "completed",
    person: { displayName: "Casey Crew" }
  }
];

const jobs: FieldTrailJob[] = [
  {
    id: "job-1",
    dispatchStatus: "in_progress",
    scheduledDate: "2026-05-21",
    updatedAt: "2026-05-21T12:00:00.000Z"
  }
];

void test("fieldtrail summary routes open blockers to the Job Notes section", () => {
  const summary = deriveFieldTrailSummary({
    projectId: "project-1",
    dailyLogs,
    fieldNotes,
    attachments,
    timeCards,
    jobs
  });

  assert.equal(summary.latestDailyLog?.id, "log-new");
  assert.equal(summary.openBlockerCount, 1);
  assert.equal(summary.nextMove.label, "Review Job Notes");
  assert.equal(summary.nextMove.href, "/daily-logs/log-new#job-notes");
  assert.match(summary.nextMove.detail, /open blocker/);
});

void test("fieldtrail timeline groups notes, attachments, and labor by daily log", () => {
  const summary = deriveFieldTrailSummary({
    projectId: "project-1",
    dailyLogs,
    fieldNotes,
    attachments,
    timeCards,
    jobs
  });
  const latest = summary.timeline[0];

  assert.equal(latest.dailyLog.id, "log-new");
  assert.equal(latest.notes.length, 2);
  assert.equal(latest.attachmentCount, 2);
  assert.equal(latest.photoCount, 1);
  assert.equal(latest.timeCardCount, 2);
  assert.equal(latest.laborMinutes, 360);
});

void test("fieldtrail summary routes missing field evidence to the evidence section", () => {
  const summary = deriveFieldTrailSummary({
    projectId: "project-1",
    dailyLogs,
    fieldNotes: fieldNotes.map((fieldNote) => ({
      ...fieldNote,
      status: "resolved"
    })),
    attachments: [],
    timeCards,
    jobs
  });

  assert.equal(summary.nextMove.label, "Add field evidence");
  assert.equal(summary.nextMove.href, "/daily-logs/log-new#field-evidence");
});

void test("fieldtrail summary falls back to job then CrewBoard when no logs exist", () => {
  const withJob = deriveFieldTrailSummary({
    projectId: "project-1",
    dailyLogs: [],
    fieldNotes: [],
    attachments: [],
    timeCards: [],
    jobs
  });
  const withoutJob = deriveFieldTrailSummary({
    projectId: "project-1",
    dailyLogs: [],
    fieldNotes: [],
    attachments: [],
    timeCards: [],
    jobs: []
  });

  assert.equal(
    withJob.nextMove.href,
    "/daily-logs?compose=1&projectId=project-1&jobId=job-1&logDate=2026-05-21#daily-log-create"
  );
  assert.equal(withoutJob.nextMove.href, "/schedule");
});
