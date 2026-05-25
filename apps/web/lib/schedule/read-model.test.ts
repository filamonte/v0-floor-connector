import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduleBoardReadModel,
  buildScheduleItems,
  filterUpcomingAssignedAppointments
} from "./read-model";

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
  notes: null,
  createdAt: "2026-05-01T12:00:00.000Z",
  updatedAt: "2026-05-01T12:00:00.000Z",
  customer: {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Acme Floors",
    companyName: null
  },
  project: {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Warehouse floor"
  },
  estimate: null,
  serviceTicket: null,
  crewVendor: null,
  assignments: [],
  assignmentCount: 0,
  crewSummary: []
};

const baseAppointment = {
  id: "55555555-5555-4555-8555-555555555555",
  organizationId: "22222222-2222-4222-8222-222222222222",
  opportunityId: "66666666-6666-4666-8666-666666666666",
  customerId: null,
  projectId: null,
  assignedPersonId: "77777777-7777-4777-8777-777777777777",
  title: "Lead site visit",
  appointmentType: "site_visit" as const,
  startsAt: "2026-05-08T10:00:00.000Z",
  endsAt: "2026-05-08T11:00:00.000Z",
  location: "Customer site",
  notes: null,
  customerVisible: true,
  customerNotes: "Meet at the front entry.",
  internalNotes: "Bring moisture meter.",
  status: "scheduled" as const,
  createdByUserId: null,
  updatedByUserId: null,
  createdAt: "2026-05-01T12:00:00.000Z",
  updatedAt: "2026-05-01T12:00:00.000Z",
  opportunity: {
    id: "66666666-6666-4666-8666-666666666666",
    title: "Garage refinish lead",
    status: "site_assessment_scheduled"
  },
  customer: null,
  project: null,
  assignedPerson: {
    id: "77777777-7777-4777-8777-777777777777",
    displayName: "Jordan Scheduler",
    isActive: true,
    membershipUserId: "88888888-8888-4888-8888-888888888888"
  }
};

void test("schedule read model returns discriminated jobs and appointments in range", () => {
  const items = buildScheduleItems({
    jobs: [baseJob],
    appointments: [baseAppointment],
    rangeStart: new Date("2026-05-08T00:00:00.000Z"),
    rangeEnd: new Date("2026-05-08T00:00:00.000Z")
  });

  assert.equal(items.length, 2);
  assert.deepEqual(
    items.map((item) => item.type),
    ["appointment", "job"]
  );
  assert.equal(
    items[0].href,
    "/appointments/55555555-5555-4555-8555-555555555555"
  );
  assert.equal(items[1].href, "/jobs/11111111-1111-4111-8111-111111111111");
});

void test("schedule read model can filter appointments without dropping canonical jobs globally", () => {
  const items = buildScheduleItems({
    jobs: [baseJob],
    appointments: [baseAppointment],
    rangeStart: new Date("2026-05-08T00:00:00.000Z"),
    rangeEnd: new Date("2026-05-08T00:00:00.000Z"),
    itemFilter: "appointments"
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].type, "appointment");
});

void test("schedule read model surfaces opportunity-level scheduled assessments", () => {
  const items = buildScheduleItems({
    jobs: [],
    appointments: [],
    opportunityAssessments: [
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        title: "Garage refinish lead",
        siteName: "Main garage",
        siteAssessmentScheduledAt: "2026-05-08T14:30:00.000Z",
        status: "site_assessment_scheduled",
        primaryContact: {
          displayName: "Jordan Customer"
        }
      }
    ],
    rangeStart: new Date("2026-05-08T00:00:00.000Z"),
    rangeEnd: new Date("2026-05-08T00:00:00.000Z"),
    itemFilter: "appointments"
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].type, "appointment");
  assert.equal(items[0].href, "/leads/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  assert.equal(items[0].title, "Garage refinish lead site assessment");
  assert.equal(items[0].appointmentType, "site_assessment");
});

void test("upcoming appointment helper respects assigned person when mapping exists", () => {
  const appointments = filterUpcomingAssignedAppointments({
    appointments: [
      baseAppointment,
      {
        ...baseAppointment,
        id: "99999999-9999-4999-8999-999999999999",
        assignedPersonId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        startsAt: "2026-05-09T10:00:00.000Z"
      }
    ],
    nowIso: "2026-05-07T12:00:00.000Z",
    assignedPersonId: "77777777-7777-4777-8777-777777777777",
    limit: 5
  });

  assert.equal(appointments.length, 1);
  assert.equal(appointments[0].id, baseAppointment.id);
});

void test("schedule board read model derives canonical job operating queues", () => {
  const scheduledToday = {
    ...baseJob,
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T13:00:00.000Z",
    updatedAt: "2026-05-07T12:00:00.000Z",
    assignmentCount: 0,
    assignments: [],
    crewSummary: []
  };
  const unscheduled = {
    ...baseJob,
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-06T12:00:00.000Z"
  };
  const upcoming = {
    ...baseJob,
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    scheduledDate: "2026-05-12",
    scheduledStartAt: "2026-05-12T14:00:00.000Z",
    updatedAt: "2026-05-05T12:00:00.000Z",
    assignmentCount: 1,
    assignments: [
      {
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        jobId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        personId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        vendorId: null,
        role: "lead" as const,
        assignedStartAt: null,
        assignedEndAt: null,
        person: {
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          displayName: "Jordan Crew"
        },
        vendor: null
      }
    ],
    crewSummary: ["Jordan Crew"]
  };
  const inProgress = {
    ...baseJob,
    id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    dispatchStatus: "in_progress" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T08:00:00.000Z",
    updatedAt: "2026-05-08T12:00:00.000Z"
  };
  const completed = {
    ...baseJob,
    id: "99999999-9999-4999-8999-999999999999",
    dispatchStatus: "completed" as const,
    scheduledDate: "2026-05-01",
    scheduledStartAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z"
  };

  const board = buildScheduleBoardReadModel({
    jobs: [scheduledToday, unscheduled, upcoming, inProgress, completed],
    today: new Date(2026, 4, 8),
    warningSummaries: [
      {
        jobId: scheduledToday.id,
        warnings: [
          {
            id: `${scheduledToday.id}:missing-crew`,
            jobId: scheduledToday.id,
            kind: "missing_crew",
            label: "Missing crew",
            detail: "This scheduled job has no crew.",
            relatedJobIds: []
          }
        ]
      }
    ]
  });

  assert.deepEqual(
    board.unscheduledReadyJobs.map((job) => job.id),
    [unscheduled.id]
  );
  assert.deepEqual(
    board.crewAssignmentGaps.map((job) => job.id),
    [scheduledToday.id, inProgress.id]
  );
  assert.deepEqual(
    board.upcomingJobs.map((job) => job.id),
    [upcoming.id]
  );
  assert.deepEqual(
    board.recentlyCompletedJobs.map((job) => job.id),
    [completed.id]
  );
  assert.deepEqual(
    board.scheduledJobsByDate.get("2026-05-08")?.map((job) => job.id),
    [inProgress.id, scheduledToday.id]
  );
  assert.deepEqual(
    board.readinessReviewJobs.map((job) => job.id),
    [scheduledToday.id, unscheduled.id, inProgress.id]
  );
});
