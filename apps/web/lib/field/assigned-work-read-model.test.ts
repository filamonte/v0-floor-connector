import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFieldExecutionReadinessBrief,
  buildFieldAssignedWorkQueue,
  summarizeFieldAssignedWorkJob,
  type FieldAssignedWorkJob
} from "./assigned-work-read-model";

const readyReadiness = {
  status: "ready_to_schedule",
  blockers: [],
  isReadyToSchedule: true,
  isOperationallyActive: true,
  depositRequired: false,
  depositSatisfied: true,
  financingStatus: "not_applicable",
  opportunityId: "55555555-5555-4555-8555-555555555555",
  siteAssessmentStatus: "completed",
  estimateId: "66666666-6666-4666-8666-666666666666",
  estimateStatus: "approved",
  contractId: "77777777-7777-4777-8777-777777777777",
  contractStatus: "signed",
  contractInternalApprovalStatus: "approved",
  contractSignedAt: "2026-05-27T15:00:00.000Z",
  depositInvoiceId: null,
  depositInvoiceStatus: null
} satisfies NonNullable<FieldAssignedWorkJob["readiness"]>;

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  dispatchStatus: "scheduled",
  scheduledDate: null,
  scheduledStartAt: null,
  scheduledEndAt: null,
  scheduleNotes: null,
  updatedAt: "2026-05-28T10:00:00.000Z",
  customer: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Avery Home",
    companyName: null
  },
  project: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Garage coating"
  },
  assignments: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      label: "Jordan Crew",
      kind: "person",
      role: "lead"
    }
  ],
  dailyLogCount: 0,
  latestDailyLog: null,
  fieldNoteCount: 0,
  openFieldBlockerCount: 0,
  latestOpenFieldBlocker: null,
  timeCardCount: 0,
  openTimeCardCount: 0,
  readiness: readyReadiness
} satisfies FieldAssignedWorkJob;

void test("field assigned work queue groups today upcoming unscheduled and completed jobs", () => {
  const queue = buildFieldAssignedWorkQueue({
    today: new Date("2026-05-28T12:00:00.000Z"),
    jobs: [
      {
        ...baseJob,
        id: "today-scheduled",
        scheduledDate: "2026-05-28",
        scheduledStartAt: "2026-05-28T14:00:00.000Z"
      },
      {
        ...baseJob,
        id: "today-in-progress",
        dispatchStatus: "in_progress",
        scheduledDate: "2026-05-27"
      },
      {
        ...baseJob,
        id: "upcoming",
        scheduledDate: "2026-05-30",
        scheduledStartAt: "2026-05-30T09:00:00.000Z"
      },
      {
        ...baseJob,
        id: "unscheduled",
        dispatchStatus: "unscheduled"
      },
      {
        ...baseJob,
        id: "completed",
        dispatchStatus: "completed",
        scheduledDate: "2026-05-26",
        updatedAt: "2026-05-28T09:00:00.000Z"
      }
    ]
  });

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(queue).map(([key, jobs]) => [
        key,
        jobs.map((job) => job.id)
      ])
    ),
    {
      today: ["today-in-progress", "today-scheduled"],
      upcoming: ["upcoming"],
      unscheduled: ["unscheduled"],
      recentlyCompleted: ["completed"]
    }
  );
});

void test("field assigned work queue limits upcoming horizon and completed count", () => {
  const queue = buildFieldAssignedWorkQueue({
    today: new Date("2026-05-28T12:00:00.000Z"),
    upcomingHorizonDays: 2,
    completedLimit: 1,
    jobs: [
      {
        ...baseJob,
        id: "near-upcoming",
        scheduledDate: "2026-05-29"
      },
      {
        ...baseJob,
        id: "far-upcoming",
        scheduledDate: "2026-06-08"
      },
      {
        ...baseJob,
        id: "older-completed",
        dispatchStatus: "completed",
        updatedAt: "2026-05-27T09:00:00.000Z"
      },
      {
        ...baseJob,
        id: "newer-completed",
        dispatchStatus: "completed",
        updatedAt: "2026-05-28T09:00:00.000Z"
      }
    ]
  });

  assert.deepEqual(
    queue.upcoming.map((job) => job.id),
    ["near-upcoming"]
  );
  assert.deepEqual(
    queue.recentlyCompleted.map((job) => job.id),
    ["newer-completed"]
  );
});

void test("field assigned work summary keeps canonical job context labels", () => {
  const summary = summarizeFieldAssignedWorkJob({
    ...baseJob,
    scheduledStartAt: "2026-05-28T14:30:00.000",
    dailyLogCount: 1,
    fieldNoteCount: 2,
    timeCardCount: 3,
    openTimeCardCount: 1
  });

  assert.equal(summary.title, "Garage coating");
  assert.equal(summary.customerLabel, "Avery Home");
  assert.equal(summary.scheduleLabel, "May 28, 2:30 PM");
  assert.equal(summary.crewLabel, "Jordan Crew");
});

void test("field execution readiness brief marks assigned job ready with source context", () => {
  const brief = buildFieldExecutionReadinessBrief({
    ...baseJob,
    scheduledDate: "2026-05-28",
    latestDailyLog: {
      id: "88888888-8888-4888-8888-888888888888",
      logDate: "2026-05-28",
      status: "draft"
    },
    dailyLogCount: 1
  });

  assert.equal(brief.status, "ready");
  assert.equal(brief.label, "Ready for field execution");
  assert.deepEqual(
    brief.sources.map((source) => source.label),
    ["Job", "Project", "Customer", "Daily Log 2026-05-28"]
  );
});

void test("field execution readiness brief prioritizes project and field blockers", () => {
  const projectBlockedBrief = buildFieldExecutionReadinessBrief({
    ...baseJob,
    readiness: {
      ...readyReadiness,
      isReadyToSchedule: false,
      blockers: ["contract_signature_pending"]
    }
  });

  assert.equal(projectBlockedBrief.status, "blocked");
  assert.equal(projectBlockedBrief.label, "Project readiness blocked");
  assert.match(projectBlockedBrief.detail, /contract signature pending/);

  const fieldBlockedBrief = buildFieldExecutionReadinessBrief({
    ...baseJob,
    latestDailyLog: {
      id: "88888888-8888-4888-8888-888888888888",
      logDate: "2026-05-28",
      status: "draft"
    },
    openFieldBlockerCount: 1,
    latestOpenFieldBlocker: {
      id: "99999999-9999-4999-8999-999999999999",
      dailyLogId: "88888888-8888-4888-8888-888888888888",
      title: "Moisture reading failed",
      noteType: "blocker"
    }
  });

  assert.equal(fieldBlockedBrief.status, "blocked");
  assert.equal(fieldBlockedBrief.label, "Field blocker open");
  assert.equal(fieldBlockedBrief.detail, "Moisture reading failed");
  assert.ok(
    fieldBlockedBrief.sources.some((source) => source.label === "Open blocker")
  );
});

void test("field execution readiness brief flags missing daily log and readiness context", () => {
  const missingDailyLogBrief = buildFieldExecutionReadinessBrief({
    ...baseJob,
    scheduledDate: "2026-05-28"
  });

  assert.equal(missingDailyLogBrief.status, "needs_context");
  assert.equal(missingDailyLogBrief.label, "Daily Log not started");

  const missingReadinessBrief = buildFieldExecutionReadinessBrief({
    ...baseJob,
    readiness: null
  });

  assert.equal(missingReadinessBrief.status, "needs_context");
  assert.equal(missingReadinessBrief.label, "Readiness context missing");
});
