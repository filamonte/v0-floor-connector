import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduleWarningDisplaySummary,
  buildScheduleBoardReadModel,
  buildScheduleItems,
  buildScheduleRoleSlotIndicators,
  buildSelectedScheduleWarningDetails,
  deriveScheduleOperatingModeSummaries,
  deriveScheduleBoardQueues,
  filterUpcomingAssignedAppointments,
  getScheduleWarningDisplayLabel
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

const baseScheduleWarning = {
  id: "11111111-1111-4111-8111-111111111111:missing-crew",
  jobId: "11111111-1111-4111-8111-111111111111",
  kind: "missing_crew" as const,
  label: "Missing crew",
  detail: "This scheduled job has no crew.",
  relatedJobIds: []
};

void test("schedule warning display labels map derived warnings to contractor-friendly copy", () => {
  assert.equal(getScheduleWarningDisplayLabel("missing_crew"), "Missing crew");
  assert.equal(
    getScheduleWarningDisplayLabel("missing_end_time"),
    "Missing end time"
  );
  assert.equal(getScheduleWarningDisplayLabel("overlap"), "Time overlap");
  assert.equal(
    getScheduleWarningDisplayLabel("same_day_capacity"),
    "Capacity warning"
  );
});

void test("schedule warning display summary keeps board cards compact", () => {
  const summary = buildScheduleWarningDisplaySummary({
    warnings: [
      baseScheduleWarning,
      {
        ...baseScheduleWarning,
        id: "11111111-1111-4111-8111-111111111111:overlap",
        kind: "overlap" as const,
        label: "Schedule overlap"
      }
    ]
  });

  assert.equal(summary.hasWarnings, true);
  assert.equal(summary.count, 2);
  assert.equal(summary.primaryLabel, "Missing crew");
  assert.equal(summary.compactLabel, "Missing crew +1");
  assert.equal(summary.detailLabel, "2 schedule issues");
  assert.equal(summary.tone, "warning");
});

void test("schedule warning display summary exposes readiness-blocked state without fake warnings", () => {
  const summary = buildScheduleWarningDisplaySummary({
    warnings: [],
    readinessBlocked: true
  });

  assert.equal(summary.hasWarnings, true);
  assert.equal(summary.count, 1);
  assert.equal(summary.primaryLabel, "Readiness blocked");
  assert.equal(summary.compactLabel, "Readiness blocked");
  assert.equal(summary.tone, "blocked");
});

void test("selected schedule warning details include plain-language fixes", () => {
  const details = buildSelectedScheduleWarningDetails({
    warnings: [
      {
        ...baseScheduleWarning,
        id: "11111111-1111-4111-8111-111111111111:same-day-capacity",
        kind: "same_day_capacity" as const,
        label: "Same-day capacity",
        detail: "Jordan Crew is also assigned to another job.",
        relatedJobIds: ["33333333-3333-4333-8333-333333333333"]
      }
    ],
    readinessBlocked: true,
    readinessDetail: "Contract still needs signature."
  });

  assert.deepEqual(
    details.map((detail) => detail.label),
    ["Readiness blocked", "Capacity warning"]
  );
  assert.equal(details[0].tone, "blocked");
  assert.match(details[0].recommendedFix, /readiness blocker/);
  assert.match(details[1].recommendedFix, /Confirm crew load/);
  assert.deepEqual(details[1].relatedJobIds, [
    "33333333-3333-4333-8333-333333333333"
  ]);
});

void test("schedule warning display helpers do not infer fake no-warning issues", () => {
  const summary = buildScheduleWarningDisplaySummary({ warnings: [] });
  const details = buildSelectedScheduleWarningDetails({ warnings: [] });

  assert.equal(summary.hasWarnings, false);
  assert.equal(summary.count, 0);
  assert.equal(summary.compactLabel, "No warnings");
  assert.deepEqual(details, []);
});

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

void test("schedule role slot indicators show explicit project ownership context", () => {
  const indicators = buildScheduleRoleSlotIndicators({
    project: {
      onsiteRepPersonId: "11111111-1111-4111-8111-111111111111",
      relationshipOwnerPersonId: "22222222-2222-4222-8222-222222222222"
    },
    people: [
      {
        id: "11111111-1111-4111-8111-111111111111",
        displayName: "Onsite Rep"
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        displayName: "Relationship Owner"
      }
    ],
    projectHref: "/projects/44444444-4444-4444-8444-444444444444"
  });

  assert.deepEqual(
    indicators.map((indicator) => indicator.label),
    ["Onsite: Onsite Rep", "Relationship: Relationship Owner"]
  );
  assert.equal(
    indicators[0].href,
    "/projects/44444444-4444-4444-8444-444444444444"
  );
});

void test("schedule role slot indicators do not invent missing owners", () => {
  const indicators = buildScheduleRoleSlotIndicators({
    project: {
      onsiteRepPersonId: "11111111-1111-4111-8111-111111111111",
      relationshipOwnerPersonId: null
    },
    people: [],
    projectHref: "/projects/44444444-4444-4444-8444-444444444444"
  });

  assert.deepEqual(indicators, []);
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
    [inProgress.id, scheduledToday.id]
  );
  assert.deepEqual(
    board.upcomingJobs.map((job) => job.id),
    [upcoming.id]
  );
  assert.deepEqual(
    board.thisWeekJobs.map((job) => job.id),
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
    [inProgress.id, scheduledToday.id]
  );
  assert.deepEqual(
    board.timingGroups
      .find((group) => group.key === "this-week")
      ?.jobs.map((job) => job.id),
    [upcoming.id]
  );
});

void test("schedule board read model separates daily, weekly, ready, and review lanes", () => {
  const today = {
    ...baseJob,
    id: "11111111-aaaa-4aaa-8aaa-111111111111",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T13:00:00.000Z",
    assignmentCount: 1,
    assignments: [
      {
        id: "22222222-aaaa-4aaa-8aaa-222222222222",
        jobId: "11111111-aaaa-4aaa-8aaa-111111111111",
        personId: "33333333-aaaa-4aaa-8aaa-333333333333",
        vendorId: null,
        role: "lead" as const,
        assignedStartAt: null,
        assignedEndAt: null,
        person: {
          id: "33333333-aaaa-4aaa-8aaa-333333333333",
          displayName: "Taylor Installer"
        },
        vendor: null
      }
    ],
    crewSummary: ["Taylor Installer"]
  };
  const tomorrow = {
    ...baseJob,
    id: "44444444-aaaa-4aaa-8aaa-444444444444",
    scheduledDate: "2026-05-09",
    scheduledStartAt: "2026-05-09T09:00:00.000Z"
  };
  const thisWeek = {
    ...baseJob,
    id: "55555555-aaaa-4aaa-8aaa-555555555555",
    scheduledDate: "2026-05-12",
    scheduledStartAt: "2026-05-12T08:00:00.000Z",
    assignmentCount: 1,
    assignments: [],
    crewSummary: ["Vendor crew"]
  };
  const unscheduledReady = {
    ...baseJob,
    id: "66666666-aaaa-4aaa-8aaa-666666666666",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null
  };
  const missingCrew = {
    ...baseJob,
    id: "77777777-aaaa-4aaa-8aaa-777777777777",
    scheduledDate: "2026-05-10",
    scheduledStartAt: "2026-05-10T08:00:00.000Z",
    assignmentCount: 0,
    assignments: [],
    crewSummary: []
  };
  const inProgress = {
    ...baseJob,
    id: "88888888-aaaa-4aaa-8aaa-888888888888",
    dispatchStatus: "in_progress" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T07:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Field crew"]
  };

  const board = buildScheduleBoardReadModel({
    jobs: [
      thisWeek,
      unscheduledReady,
      missingCrew,
      today,
      tomorrow,
      inProgress
    ],
    today: new Date(2026, 4, 8)
  });

  assert.deepEqual(
    board.scheduledTodayJobs.map((job) => job.id),
    [inProgress.id, today.id]
  );
  assert.deepEqual(
    board.tomorrowJobs.map((job) => job.id),
    [tomorrow.id]
  );
  assert.deepEqual(
    board.thisWeekJobs.map((job) => job.id),
    [missingCrew.id, thisWeek.id]
  );
  assert.deepEqual(
    board.unscheduledReadyJobs.map((job) => job.id),
    [unscheduledReady.id]
  );
  assert.deepEqual(
    board.needsReadinessReviewJobs.map((job) => job.id),
    [tomorrow.id, missingCrew.id]
  );
  assert.deepEqual(
    board.crewAssignmentGaps.map((job) => job.id),
    [tomorrow.id, missingCrew.id]
  );
  assert.deepEqual(
    board.inProgressJobs.map((job) => job.id),
    [inProgress.id]
  );
});

void test("schedule board read model separates blocked unscheduled jobs from ready scheduling queue", () => {
  const readyUnscheduled = {
    ...baseJob,
    id: "99999999-aaaa-4aaa-8aaa-999999999999",
    dispatchStatus: "unscheduled" as const,
    projectId: "project-ready",
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T12:00:00.000Z"
  };
  const blockedUnscheduled = {
    ...baseJob,
    id: "aaaaaaaa-bbbb-4bbb-8bbb-aaaaaaaaaaaa",
    dispatchStatus: "unscheduled" as const,
    projectId: "project-blocked",
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T13:00:00.000Z"
  };

  const board = buildScheduleBoardReadModel({
    jobs: [blockedUnscheduled, readyUnscheduled],
    today: new Date(2026, 4, 8),
    readinessByProjectId: new Map([
      ["project-ready", { isReadyToSchedule: true }],
      ["project-blocked", { isReadyToSchedule: false }]
    ])
  });

  assert.deepEqual(
    board.unscheduledReadyJobs.map((job) => job.id),
    [readyUnscheduled.id]
  );
  assert.deepEqual(
    board.unscheduledBlockedJobs.map((job) => job.id),
    [blockedUnscheduled.id]
  );
  assert.deepEqual(
    board.overdueSchedulingJobs.map((job) => job.id),
    [readyUnscheduled.id]
  );
  assert.deepEqual(
    board.readinessReviewJobs.map((job) => job.id),
    [blockedUnscheduled.id]
  );
  assert.deepEqual(
    board.timingGroups
      .find((group) => group.key === "unscheduled-blocked")
      ?.jobs.map((job) => job.id),
    [blockedUnscheduled.id]
  );
});

void test("schedule board read model orders dispatch attention signals", () => {
  const blockedUnscheduled = {
    ...baseJob,
    id: "11111111-bbbb-4bbb-8bbb-111111111111",
    dispatchStatus: "unscheduled" as const,
    projectId: "project-blocked",
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T12:00:00.000Z"
  };
  const pastScheduled = {
    ...baseJob,
    id: "22222222-bbbb-4bbb-8bbb-222222222222",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-06",
    scheduledStartAt: "2026-05-06T08:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Jordan Crew"]
  };
  const todayMissingCrew = {
    ...baseJob,
    id: "33333333-bbbb-4bbb-8bbb-333333333333",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T09:00:00.000Z",
    assignmentCount: 0,
    assignments: [],
    crewSummary: []
  };
  const capacityWarning = {
    ...baseJob,
    id: "44444444-bbbb-4bbb-8bbb-444444444444",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-09",
    scheduledStartAt: "2026-05-09T09:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Jordan Crew"]
  };
  const agingReady = {
    ...baseJob,
    id: "55555555-bbbb-4bbb-8bbb-555555555555",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-06T12:00:00.000Z"
  };

  const board = buildScheduleBoardReadModel({
    jobs: [
      agingReady,
      capacityWarning,
      todayMissingCrew,
      pastScheduled,
      blockedUnscheduled
    ],
    today: new Date(2026, 4, 8),
    readinessByProjectId: new Map([
      ["project-blocked", { isReadyToSchedule: false }]
    ]),
    warningSummaries: [
      {
        jobId: capacityWarning.id,
        warnings: [
          {
            id: `${capacityWarning.id}:same-day-capacity`,
            jobId: capacityWarning.id,
            kind: "same_day_capacity",
            label: "Same-day capacity",
            detail: "Jordan Crew is also assigned to another job.",
            relatedJobIds: []
          }
        ]
      }
    ]
  });

  assert.deepEqual(
    board.dispatchAttentionItems.map((item) => item.kind),
    [
      "blocked_readiness",
      "past_scheduled",
      "missing_crew",
      "capacity_warning",
      "unscheduled_aging"
    ]
  );
  assert.deepEqual(
    board.pastScheduledIncompleteJobs.map((job) => job.id),
    [pastScheduled.id]
  );
  assert.deepEqual(
    board.capacityWarningJobs.map((job) => job.id),
    [capacityWarning.id]
  );
  assert.deepEqual(
    board.agingUnscheduledReadyJobs.map((job) => job.id),
    [agingReady.id]
  );
});

void test("schedule board queue helper exposes the derived queues without board presentation groups", () => {
  const blockedUnscheduled = {
    ...baseJob,
    id: "66666666-bbbb-4bbb-8bbb-666666666666",
    dispatchStatus: "unscheduled" as const,
    projectId: "project-blocked",
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T12:00:00.000Z"
  };
  const todayMissingCrew = {
    ...baseJob,
    id: "77777777-bbbb-4bbb-8bbb-777777777777",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T09:00:00.000Z",
    assignmentCount: 0,
    assignments: [],
    crewSummary: []
  };
  const queues = deriveScheduleBoardQueues({
    jobs: [todayMissingCrew, blockedUnscheduled],
    today: new Date(2026, 4, 8),
    readinessByProjectId: new Map([
      ["project-blocked", { isReadyToSchedule: false }]
    ])
  });

  assert.deepEqual(
    queues.unscheduledBlockedJobs.map((job) => job.id),
    [blockedUnscheduled.id]
  );
  assert.deepEqual(
    queues.crewAssignmentGaps.map((job) => job.id),
    [todayMissingCrew.id]
  );
  assert.deepEqual(
    queues.dispatchAttentionItems.map((item) => item.kind),
    ["blocked_readiness", "missing_crew"]
  );
  assert.deepEqual(
    queues.needsReadinessReviewJobs.map((job) => job.id),
    [blockedUnscheduled.id, todayMissingCrew.id]
  );
});

void test("schedule operating modes group triage, plan, and dispatch jobs without duplicate records", () => {
  const blockedUnscheduled = {
    ...baseJob,
    id: "88888888-bbbb-4bbb-8bbb-888888888888",
    dispatchStatus: "unscheduled" as const,
    projectId: "project-blocked",
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T12:00:00.000Z"
  };
  const readyUnscheduled = {
    ...baseJob,
    id: "99999999-bbbb-4bbb-8bbb-999999999999",
    dispatchStatus: "unscheduled" as const,
    scheduledDate: null,
    scheduledStartAt: null,
    scheduledEndAt: null,
    updatedAt: "2026-05-07T13:00:00.000Z"
  };
  const todayMissingCrew = {
    ...baseJob,
    id: "aaaaaaaa-cccc-4ccc-8ccc-aaaaaaaaaaaa",
    dispatchStatus: "scheduled" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T09:00:00.000Z",
    assignmentCount: 0,
    assignments: [],
    crewSummary: []
  };
  const inProgress = {
    ...baseJob,
    id: "bbbbbbbb-cccc-4ccc-8ccc-bbbbbbbbbbbb",
    dispatchStatus: "in_progress" as const,
    scheduledDate: "2026-05-08",
    scheduledStartAt: "2026-05-08T07:00:00.000Z",
    assignmentCount: 1,
    crewSummary: ["Field crew"]
  };

  const queues = deriveScheduleBoardQueues({
    jobs: [blockedUnscheduled, readyUnscheduled, todayMissingCrew, inProgress],
    today: new Date(2026, 4, 8),
    readinessByProjectId: new Map([
      ["project-blocked", { isReadyToSchedule: false }]
    ])
  });
  const modes = deriveScheduleOperatingModeSummaries({
    ...queues,
    jobsPerMode: 5
  });

  assert.deepEqual(
    modes.map((mode) => mode.key),
    ["triage", "plan", "dispatch"]
  );
  assert.deepEqual(
    modes.find((mode) => mode.key === "triage")?.jobs.map((job) => job.id),
    [blockedUnscheduled.id, todayMissingCrew.id]
  );
  assert.deepEqual(
    modes.find((mode) => mode.key === "plan")?.jobs.map((job) => job.id),
    [readyUnscheduled.id]
  );
  assert.deepEqual(
    modes.find((mode) => mode.key === "dispatch")?.jobs.map((job) => job.id),
    [inProgress.id, todayMissingCrew.id]
  );
});
