import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveJobEquipmentReadinessSummary,
  type EquipmentReadinessAssignmentInput,
  type EquipmentReadinessConflictInput,
  type EquipmentReadinessRequirementInput
} from "./readiness";

const job = {
  id: "job-1",
  scheduledDate: "2026-05-21",
  scheduledStartAt: "2026-05-21T13:00",
  scheduledEndAt: "2026-05-21T17:00"
};

function requirement(
  overrides: Partial<EquipmentReadinessRequirementInput>
): EquipmentReadinessRequirementInput {
  return {
    id: "requirement-1",
    equipmentType: "grinder",
    quantity: 1,
    required: true,
    ...overrides
  };
}

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

function warningIds(
  input: ReturnType<typeof deriveJobEquipmentReadinessSummary>
) {
  return input.warnings.map((warning) => warning.id);
}

void test("no equipment requirements produces no missing-equipment warning", () => {
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [],
    assignments: []
  });

  assert.equal(summary.requirementCount, 0);
  assert.equal(summary.missingRequiredCount, 0);
  assert.equal(summary.missingOptionalCount, 0);
  assert.deepEqual(summary.warnings, []);
});

void test("missing required and optional equipment are counted separately", () => {
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [
      requirement({ id: "required-grinder", equipmentType: "grinder" }),
      requirement({
        id: "optional-vacuum",
        equipmentType: "vacuum",
        required: false
      })
    ],
    assignments: []
  });

  assert.equal(summary.missingRequiredCount, 1);
  assert.equal(summary.missingOptionalCount, 1);
  assert.deepEqual(warningIds(summary), [
    "missing-required-grinder",
    "missing-optional-vacuum"
  ]);
  assert.equal(summary.warnings[0]?.severity, "critical");
  assert.equal(summary.warnings[1]?.severity, "warning");
});

void test("active assigned equipment satisfies requirements by type and quantity", () => {
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [
      requirement({
        id: "two-grinders",
        equipmentType: "grinder",
        quantity: 2
      }),
      requirement({ id: "one-vacuum", equipmentType: "vacuum" })
    ],
    assignments: [
      assignment({ id: "grinder-1", equipmentAssetId: "asset-1" }),
      assignment({ id: "grinder-2", equipmentAssetId: "asset-2" }),
      assignment({
        id: "vacuum-1",
        equipmentAssetId: "asset-3",
        asset: {
          ...assignment().asset!,
          id: "asset-3",
          name: "Vac 01",
          equipmentType: "vacuum"
        }
      })
    ]
  });

  assert.equal(summary.assignmentCount, 3);
  assert.equal(summary.missingRequiredCount, 0);
  assert.deepEqual(summary.assignedCountByType, { grinder: 2, vacuum: 1 });
  assert.deepEqual(summary.warnings, []);
});

void test("unavailable assigned assets create warnings without changing assignment count", () => {
  const unavailableStatuses = [
    "maintenance",
    "out_of_service",
    "retired"
  ] as const;
  const assignments = [
    ...unavailableStatuses.map((status, index) =>
      assignment({
        id: `assignment-${status}`,
        equipmentAssetId: `asset-${index}`,
        asset: {
          ...assignment().asset!,
          id: `asset-${index}`,
          name: `Asset ${index}`,
          operationalStatus: status
        }
      })
    ),
    assignment({
      id: "assignment-inactive",
      equipmentAssetId: "asset-inactive",
      asset: {
        ...assignment().asset!,
        id: "asset-inactive",
        name: "Inactive asset",
        isActive: false
      }
    })
  ];
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [],
    assignments
  });

  assert.equal(summary.assignmentCount, 4);
  assert.equal(summary.unavailableAssignedCount, 4);
  assert.deepEqual(warningIds(summary), [
    "unavailable-assignment-maintenance",
    "unavailable-assignment-out_of_service",
    "unavailable-assignment-retired",
    "unavailable-assignment-inactive"
  ]);
});

void test("rental window warnings cover assignment or job dates before and after rental dates", () => {
  const rentedAsset = {
    ...assignment().asset!,
    ownershipStatus: "rented" as const,
    rentalStartDate: "2026-05-20",
    rentalEndDate: "2026-05-22"
  };
  const beforeRental = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [],
    assignments: [
      assignment({
        id: "before-rental",
        assignedDate: "2026-05-19",
        asset: rentedAsset
      })
    ]
  });
  const afterRental = deriveJobEquipmentReadinessSummary({
    job: {
      ...job,
      scheduledDate: "2026-05-23",
      scheduledStartAt: null,
      scheduledEndAt: null
    },
    requirements: [],
    assignments: [
      assignment({
        id: "after-rental",
        assignedDate: null,
        scheduledStartAt: null,
        scheduledEndAt: null,
        asset: rentedAsset
      })
    ]
  });

  assert.equal(beforeRental.rentalWindowMismatchCount, 1);
  assert.equal(afterRental.rentalWindowMismatchCount, 1);
  assert.deepEqual(warningIds(beforeRental), ["rental-before-rental"]);
  assert.deepEqual(warningIds(afterRental), ["rental-after-rental"]);
});

void test("overlapping active assignments warn for the same asset", () => {
  const possibleConflicts: EquipmentReadinessConflictInput[] = [
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
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [],
    assignments: [
      assignment({
        scheduledStartAt: "2026-05-21T13:00",
        scheduledEndAt: "2026-05-21T17:00"
      })
    ],
    possibleConflicts
  });

  assert.equal(summary.conflictCount, 1);
  assert.deepEqual(warningIds(summary), ["conflict-assignment-1"]);
});

void test("returned and canceled assignments do not satisfy requirements or create conflicts", () => {
  const inactiveAssignments = [
    assignment({
      id: "returned-assignment",
      assignmentStatus: "returned"
    }),
    assignment({
      id: "canceled-assignment",
      assignmentStatus: "canceled"
    })
  ];
  const summary = deriveJobEquipmentReadinessSummary({
    job,
    requirements: [requirement({ id: "required-grinder" })],
    assignments: inactiveAssignments,
    possibleConflicts: inactiveAssignments.map((item) => ({
      id: item.id,
      equipmentAssetId: item.equipmentAssetId,
      assignedDate: item.assignedDate,
      scheduledStartAt: item.scheduledStartAt,
      scheduledEndAt: item.scheduledEndAt,
      assignmentStatus: item.assignmentStatus,
      jobScheduledDate: job.scheduledDate,
      jobScheduledStartAt: job.scheduledStartAt,
      jobScheduledEndAt: job.scheduledEndAt
    }))
  });

  assert.equal(summary.assignmentCount, 0);
  assert.equal(summary.missingRequiredCount, 1);
  assert.equal(summary.conflictCount, 0);
  assert.deepEqual(warningIds(summary), ["missing-required-grinder"]);
});
