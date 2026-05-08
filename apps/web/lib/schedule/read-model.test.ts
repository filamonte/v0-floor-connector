import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduleItems,
  filterUpcomingAssignedAppointments
} from "./read-model";

const baseJob = {
  id: "11111111-1111-4111-8111-111111111111",
  organizationId: "22222222-2222-4222-8222-222222222222",
  customerId: "33333333-3333-4333-8333-333333333333",
  projectId: "44444444-4444-4444-8444-444444444444",
  estimateId: null,
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
  assert.equal(items[0].href, "/appointments/55555555-5555-4555-8555-555555555555");
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
