import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFieldCommandCenterSections,
  buildScheduleDispatchBoardSections
} from "./dispatch-board";
import { buildScheduleBoardReadModel } from "./read-model";

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  organizationId: "22222222-2222-4222-8222-222222222222",
  customerId: "33333333-3333-4333-8333-333333333333",
  projectId: "44444444-4444-4444-8444-444444444444",
  estimateId: null,
  serviceTicketId: null,
  dispatchStatus: "scheduled" as const,
  scheduledDate: "2026-05-08",
  scheduledStartAt: "2026-05-08T13:00:00.000Z",
  scheduledEndAt: "2026-05-08T15:00:00.000Z",
  scheduleNotes: null,
  crewVendorId: null,
  createdAt: "2026-05-01T12:00:00.000Z",
  updatedAt: "2026-05-01T12:00:00.000Z",
  customer: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Acme Floors",
    companyName: null
  },
  project: {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Warehouse floor",
    onsiteRepPersonId: null,
    relationshipOwnerPersonId: null,
    followUpOwnerPersonId: null,
    salesCreditOwnerPersonId: null
  },
  estimate: null,
  serviceTicket: null,
  crewVendor: null,
  assignments: [],
  assignmentCount: 0,
  crewSummary: []
};

void test("schedule dispatch board sections group daily dispatch lanes", () => {
  const todayJob = {
    ...baseJob,
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T08:00:00.000Z"
  };
  const upcomingJob = {
    ...baseJob,
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    scheduledDate: "2026-05-10",
    scheduledStartAt: "2026-05-10T09:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Install crew"]
  };
  const unscheduledJob = {
    ...baseJob,
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null
  };
  const inProgressJob = {
    ...baseJob,
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    dispatchStatus: "in_progress" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T10:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Live crew"]
  };

  const board = buildScheduleBoardReadModel({
    jobs: [todayJob, upcomingJob, unscheduledJob, inProgressJob],
    today: new Date(2026, 4, 8)
  });
  const sections = buildScheduleDispatchBoardSections({ board });
  const sectionIds = (key: (typeof sections)[number]["key"]) =>
    sections
      .find((section) => section.key === key)
      ?.items.map((item) => item.job.id) ?? [];

  assert.deepEqual(sectionIds("today"), [todayJob.id]);
  assert.deepEqual(sectionIds("upcoming"), [upcomingJob.id]);
  assert.deepEqual(sectionIds("unscheduled"), [unscheduledJob.id]);
  assert.deepEqual(sectionIds("in_progress"), [inProgressJob.id]);
});

void test("schedule dispatch board sections preserve crew state and warnings", () => {
  const warningJob = {
    ...baseJob,
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T08:00:00.000Z",
    assignmentCount: 0,
    crewSummary: []
  };
  const warningSummaries = [
    {
      jobId: warningJob.id,
      warnings: [
        {
          id: `${warningJob.id}:missing-crew`,
          jobId: warningJob.id,
          kind: "missing_crew" as const,
          label: "Missing crew",
          detail: "This scheduled job has no crew.",
          relatedJobIds: []
        }
      ]
    }
  ];

  const board = buildScheduleBoardReadModel({
    jobs: [warningJob],
    today: new Date(2026, 4, 8),
    warningSummaries
  });
  const sections = buildScheduleDispatchBoardSections({
    board,
    warningSummaries
  });
  const todayItem = sections.find((section) => section.key === "today")
    ?.items[0];

  assert.equal(todayItem?.hasCrewAssigned, false);
  assert.equal(todayItem?.crewLabel, "No crew assigned");
  assert.equal(todayItem?.recommendedAction, "assign_crew");
  assert.equal(todayItem?.warnings[0]?.kind, "missing_crew");
});

void test("field command center sections group execution lanes from canonical schedule state", () => {
  const readyJob = {
    ...baseJob,
    id: "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null
  };
  const todayJob = {
    ...baseJob,
    id: "22222222-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T08:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Install crew"]
  };
  const needsCrewJob = {
    ...baseJob,
    id: "33333333-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T10:00:00.000Z",
    assignmentCount: 0,
    crewSummary: []
  };
  const inProgressJob = {
    ...baseJob,
    id: "44444444-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    dispatchStatus: "in_progress" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T12:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Live crew"]
  };
  const warningJob = {
    ...baseJob,
    id: "55555555-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    scheduledDate: "2026-05-09",
    scheduledStartAt: "2026-05-09T08:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Install crew"]
  };
  const warningSummaries = [
    {
      jobId: warningJob.id,
      warnings: [
        {
          id: `${warningJob.id}:missing-end-time`,
          jobId: warningJob.id,
          kind: "missing_end_time" as const,
          label: "Missing end time",
          detail: "End time is not set.",
          relatedJobIds: []
        }
      ]
    }
  ];
  const board = buildScheduleBoardReadModel({
    jobs: [readyJob, todayJob, needsCrewJob, inProgressJob, warningJob],
    today: new Date(2026, 4, 8),
    warningSummaries
  });
  const sections = buildFieldCommandCenterSections({
    board,
    warningSummaries,
    handoffsByJobId: new Map([
      [
        todayJob.id,
        {
          jobId: todayJob.id,
          title: "Today job",
          contextLabel: "Acme Floors - Warehouse floor",
          targetDate: "2026-05-08",
          hasCrewAssigned: true,
          dailyLog: null,
          latestDailyLog: null,
          openBlockerCount: 0,
          fieldNoteCount: 0,
          targetDateTimeCardCount: 0,
          openTimeCardCount: 0,
          latestFieldActivityAt: null,
          jobHref: `/jobs/${todayJob.id}`,
          projectHref: `/projects/${todayJob.projectId}`,
          dailyLogHref: `/daily-logs?jobId=${todayJob.id}`,
          fieldWorkHref: "/field/work-items",
          blockerHref: `/daily-logs?jobId=${todayJob.id}`,
          tone: "warning",
          label: "Daily Log not started",
          detail: "No Daily Log exists for the scheduled field date yet."
        }
      ]
    ])
  });
  const sectionIds = (key: (typeof sections)[number]["key"]) =>
    sections
      .find((section) => section.key === key)
      ?.items.map((item) => item.job.id) ?? [];

  assert.deepEqual(sectionIds("ready_to_schedule"), [readyJob.id]);
  assert.deepEqual(sectionIds("scheduled_today"), [
    todayJob.id,
    needsCrewJob.id
  ]);
  assert.deepEqual(sectionIds("needs_crew"), [needsCrewJob.id]);
  assert.deepEqual(sectionIds("in_progress"), [inProgressJob.id]);
  assert.deepEqual(sectionIds("field_handoff"), [
    todayJob.id,
    needsCrewJob.id,
    inProgressJob.id,
    warningJob.id
  ]);
  assert.deepEqual(sectionIds("execution_warnings"), [
    needsCrewJob.id,
    warningJob.id
  ]);
  assert.equal(
    sections
      .find((section) => section.key === "field_handoff")
      ?.items.find((item) => item.job.id === todayJob.id)?.recommendedAction,
    "open_daily_log"
  );
});
