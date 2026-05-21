import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduleWarningsByJobId,
  deriveScheduleWarningSummaries,
  type ScheduleWarningJob
} from "./warnings";

const baseJob: ScheduleWarningJob = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Warehouse floor",
  dispatchStatus: "scheduled",
  scheduledDate: "2026-05-21",
  scheduledStartAt: "2026-05-21T13:00:00.000Z",
  scheduledEndAt: "2026-05-21T15:00:00.000Z",
  crewVendorId: null,
  crewVendor: null,
  assignments: [
    {
      personId: "22222222-2222-4222-8222-222222222222",
      vendorId: null,
      person: {
        displayName: "Jordan Crew"
      },
      vendor: null
    }
  ]
};

void test("schedule warnings flag scheduled jobs without crew", () => {
  const warningsByJobId = buildScheduleWarningsByJobId([
    {
      ...baseJob,
      assignments: [],
      crewVendorId: null
    }
  ]);

  assert.equal(warningsByJobId.get(baseJob.id)?.[0]?.kind, "missing_crew");
});

void test("schedule warnings flag jobs missing end time when overlap cannot be checked", () => {
  const warningsByJobId = buildScheduleWarningsByJobId([
    {
      ...baseJob,
      scheduledEndAt: null
    }
  ]);

  assert.equal(warningsByJobId.get(baseJob.id)?.[0]?.kind, "missing_end_time");
});

void test("schedule warnings flag overlapping work for the same person", () => {
  const summaries = deriveScheduleWarningSummaries([
    baseJob,
    {
      ...baseJob,
      id: "33333333-3333-4333-8333-333333333333",
      title: "Garage coating",
      scheduledStartAt: "2026-05-21T14:00:00.000Z",
      scheduledEndAt: "2026-05-21T16:00:00.000Z"
    }
  ]);

  assert.equal(summaries.length, 2);
  assert.equal(summaries[0].warnings[0].kind, "overlap");
  assert.match(summaries[0].warnings[0].detail, /Jordan Crew/);
});

void test("schedule warnings do not flag different crews or completed jobs", () => {
  const warningsByJobId = buildScheduleWarningsByJobId([
    baseJob,
    {
      ...baseJob,
      id: "33333333-3333-4333-8333-333333333333",
      title: "Garage coating",
      scheduledStartAt: "2026-05-21T14:00:00.000Z",
      scheduledEndAt: "2026-05-21T16:00:00.000Z",
      assignments: [
        {
          personId: "44444444-4444-4444-8444-444444444444",
          vendorId: null,
          person: {
            displayName: "Casey Crew"
          },
          vendor: null
        }
      ]
    },
    {
      ...baseJob,
      id: "55555555-5555-4555-8555-555555555555",
      title: "Completed floor",
      dispatchStatus: "completed",
      assignments: []
    }
  ]);

  assert.equal(warningsByJobId.size, 0);
});
