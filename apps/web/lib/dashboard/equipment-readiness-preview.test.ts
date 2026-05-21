import assert from "node:assert/strict";
import test from "node:test";

import {
  mapDashboardEquipmentWarningPreviews,
  type DashboardEquipmentWarningJobInput
} from "./equipment-readiness-preview";
import type {
  EquipmentReadinessAssignmentInput,
  EquipmentReadinessConflictInput,
  EquipmentReadinessRequirementInput
} from "../equipment/readiness";

const job: DashboardEquipmentWarningJobInput = {
  id: "job-1",
  projectId: "project-1",
  dispatchStatus: "scheduled",
  scheduledDate: "2026-05-21",
  scheduledStartAt: "2026-05-21T13:00",
  scheduledEndAt: "2026-05-21T17:00",
  updatedAt: "2026-05-20T12:00:00.000Z",
  customer: {
    id: "customer-1",
    name: "Acme Foods",
    companyName: null
  },
  project: {
    id: "project-1",
    name: "Kitchen coating"
  }
};

const requiredGrinder: EquipmentReadinessRequirementInput = {
  id: "requirement-1",
  equipmentType: "grinder",
  quantity: 1,
  required: true
};

function assignment(
  overrides: Partial<EquipmentReadinessAssignmentInput> = {}
): EquipmentReadinessAssignmentInput {
  return {
    id: "assignment-1",
    equipmentAssetId: "asset-1",
    assignedDate: "2026-05-21",
    scheduledStartAt: null,
    scheduledEndAt: null,
    assignmentStatus: "assigned",
    asset: {
      id: "asset-1",
      name: "Grinder 01",
      equipmentType: "grinder",
      ownershipStatus: "owned",
      operationalStatus: "available",
      rentalStartDate: null,
      rentalEndDate: null,
      isActive: true
    },
    ...overrides
  };
}

void test("maps missing required equipment into a dashboard schedule-panel warning", () => {
  const items = mapDashboardEquipmentWarningPreviews({
    jobs: [job],
    requirementsByJobId: new Map([[job.id, [requiredGrinder]]]),
    assignmentsByJobId: new Map(),
    conflictsByAssetId: new Map(),
    limit: 3
  });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.id, "equipment-warning-job-1");
  assert.equal(items[0]?.title, "Kitchen coating");
  assert.equal(items[0]?.badge, "Equipment blocker");
  assert.equal(items[0]?.severity, "critical");
  assert.equal(items[0]?.warningCount, 1);
  assert.equal(
    items[0]?.href,
    "/schedule?projectId=project-1&view=scheduled&action=schedule&jobId=job-1#schedule-action"
  );
  assert.equal(items[0]?.secondaryHref, "/jobs/job-1");
});

void test("omits jobs whose equipment requirements are satisfied", () => {
  const items = mapDashboardEquipmentWarningPreviews({
    jobs: [job],
    requirementsByJobId: new Map([[job.id, [requiredGrinder]]]),
    assignmentsByJobId: new Map([[job.id, [assignment()]]]),
    conflictsByAssetId: new Map(),
    limit: 3
  });

  assert.deepEqual(items, []);
});

void test("keeps overlapping equipment assignments as advisory warnings", () => {
  const conflicts: EquipmentReadinessConflictInput[] = [
    {
      id: "other-assignment",
      equipmentAssetId: "asset-1",
      assignedDate: null,
      scheduledStartAt: "2026-05-21T16:00",
      scheduledEndAt: "2026-05-21T18:00",
      assignmentStatus: "planned",
      jobScheduledDate: null,
      jobScheduledStartAt: null,
      jobScheduledEndAt: null
    }
  ];
  const items = mapDashboardEquipmentWarningPreviews({
    jobs: [job],
    requirementsByJobId: new Map(),
    assignmentsByJobId: new Map([
      [
        job.id,
        [
          assignment({
            scheduledStartAt: "2026-05-21T13:00",
            scheduledEndAt: "2026-05-21T17:00"
          })
        ]
      ]
    ]),
    conflictsByAssetId: new Map([["asset-1", conflicts]]),
    limit: 3
  });

  assert.equal(items.length, 1);
  assert.equal(items[0]?.badge, "Equipment warning");
  assert.equal(items[0]?.severity, "warning");
  assert.equal(items[0]?.warningCount, 1);
});
