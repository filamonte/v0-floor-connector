import type {
  EquipmentAssignmentStatus,
  EquipmentOperationalStatus,
  EquipmentOwnershipStatus,
  EquipmentType
} from "@floorconnector/types";

export type EquipmentReadinessRequirementInput = {
  id: string;
  equipmentType: EquipmentType;
  quantity: number;
  required: boolean;
};

export type EquipmentReadinessAssetInput = {
  id: string;
  name: string;
  equipmentType: EquipmentType;
  ownershipStatus: EquipmentOwnershipStatus;
  operationalStatus: EquipmentOperationalStatus;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
  isActive: boolean;
};

export type EquipmentReadinessAssignmentInput = {
  id: string;
  equipmentAssetId: string;
  assignedDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  assignmentStatus: EquipmentAssignmentStatus;
  asset: EquipmentReadinessAssetInput | null;
};

export type EquipmentReadinessJobInput = {
  id: string;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
};

export type EquipmentReadinessConflictInput = {
  id: string;
  equipmentAssetId: string;
  assignedDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  assignmentStatus: EquipmentAssignmentStatus;
  jobScheduledDate: string | null;
  jobScheduledStartAt: string | null;
  jobScheduledEndAt: string | null;
};

export type EquipmentReadinessWarning = {
  id: string;
  severity: "warning" | "critical";
  title: string;
  description: string;
};

export type JobEquipmentReadinessSummary = {
  jobId: string;
  requirementCount: number;
  assignmentCount: number;
  missingRequiredCount: number;
  missingOptionalCount: number;
  unavailableAssignedCount: number;
  rentalWindowMismatchCount: number;
  conflictCount: number;
  assignedCountByType: Record<string, number>;
  warnings: EquipmentReadinessWarning[];
};

export const activeEquipmentAssignmentStatuses: EquipmentAssignmentStatus[] = [
  "planned",
  "assigned",
  "in_use"
];

type EffectiveDateWindow = {
  date: string | null;
  startAt: string | null;
  endAt: string | null;
};

export function getEffectiveEquipmentDateWindow(input: {
  assignedDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  jobScheduledDate?: string | null;
  jobScheduledStartAt?: string | null;
  jobScheduledEndAt?: string | null;
}): EffectiveDateWindow {
  return {
    date:
      input.assignedDate ??
      input.scheduledStartAt?.slice(0, 10) ??
      input.jobScheduledDate ??
      input.jobScheduledStartAt?.slice(0, 10) ??
      null,
    startAt: input.scheduledStartAt ?? input.jobScheduledStartAt ?? null,
    endAt: input.scheduledEndAt ?? input.jobScheduledEndAt ?? null
  };
}

export function equipmentDateWindowsOverlap(
  left: EffectiveDateWindow,
  right: EffectiveDateWindow
) {
  if (left.startAt && right.startAt) {
    const leftEnd = left.endAt ?? left.startAt;
    const rightEnd = right.endAt ?? right.startAt;

    return left.startAt <= rightEnd && right.startAt <= leftEnd;
  }

  return Boolean(left.date && right.date && left.date === right.date);
}

function isOutsideRentalWindow(
  assignment: EquipmentReadinessAssignmentInput,
  job: EquipmentReadinessJobInput
) {
  const asset = assignment.asset;

  if (!asset || !["rented", "leased"].includes(asset.ownershipStatus)) {
    return false;
  }

  const window = getEffectiveEquipmentDateWindow({
    assignedDate: assignment.assignedDate,
    scheduledStartAt: assignment.scheduledStartAt,
    scheduledEndAt: assignment.scheduledEndAt,
    jobScheduledDate: job.scheduledDate,
    jobScheduledStartAt: job.scheduledStartAt,
    jobScheduledEndAt: job.scheduledEndAt
  });

  if (!window.date) {
    return false;
  }

  return (
    (asset.rentalStartDate !== null && window.date < asset.rentalStartDate) ||
    (asset.rentalEndDate !== null && window.date > asset.rentalEndDate)
  );
}

export function deriveJobEquipmentReadinessSummary(input: {
  job: EquipmentReadinessJobInput;
  requirements: EquipmentReadinessRequirementInput[];
  assignments: EquipmentReadinessAssignmentInput[];
  possibleConflicts?: EquipmentReadinessConflictInput[];
}): JobEquipmentReadinessSummary {
  const activeAssignments = input.assignments.filter((assignment) =>
    activeEquipmentAssignmentStatuses.includes(assignment.assignmentStatus)
  );
  const assignedCountByType: Record<string, number> = {};

  for (const assignment of activeAssignments) {
    const type = assignment.asset?.equipmentType ?? "other";
    assignedCountByType[type] = (assignedCountByType[type] ?? 0) + 1;
  }

  const missing = input.requirements
    .map((requirement) => ({
      requirement,
      missing: Math.max(
        0,
        requirement.quantity -
          (assignedCountByType[requirement.equipmentType] ?? 0)
      )
    }))
    .filter((entry) => entry.missing > 0);
  const unavailableAssignments = activeAssignments.filter(
    (assignment) =>
      !assignment.asset?.isActive ||
      assignment.asset.operationalStatus === "maintenance" ||
      assignment.asset.operationalStatus === "out_of_service" ||
      assignment.asset.operationalStatus === "retired"
  );
  const rentalMismatches = activeAssignments.filter((assignment) =>
    isOutsideRentalWindow(assignment, input.job)
  );
  const possibleConflicts = input.possibleConflicts ?? [];
  const conflictAssignments = activeAssignments.filter((assignment) => {
    const assignmentWindow = getEffectiveEquipmentDateWindow({
      assignedDate: assignment.assignedDate,
      scheduledStartAt: assignment.scheduledStartAt,
      scheduledEndAt: assignment.scheduledEndAt,
      jobScheduledDate: input.job.scheduledDate,
      jobScheduledStartAt: input.job.scheduledStartAt,
      jobScheduledEndAt: input.job.scheduledEndAt
    });

    return possibleConflicts.some((candidate) => {
      if (
        candidate.id === assignment.id ||
        candidate.equipmentAssetId !== assignment.equipmentAssetId ||
        !activeEquipmentAssignmentStatuses.includes(candidate.assignmentStatus)
      ) {
        return false;
      }

      const candidateWindow = getEffectiveEquipmentDateWindow({
        assignedDate: candidate.assignedDate,
        scheduledStartAt: candidate.scheduledStartAt,
        scheduledEndAt: candidate.scheduledEndAt,
        jobScheduledDate: candidate.jobScheduledDate,
        jobScheduledStartAt: candidate.jobScheduledStartAt,
        jobScheduledEndAt: candidate.jobScheduledEndAt
      });

      return equipmentDateWindowsOverlap(assignmentWindow, candidateWindow);
    });
  });
  const missingWarnings: EquipmentReadinessWarning[] = missing.map((entry) => ({
    id: `missing-${entry.requirement.id}`,
    severity: entry.requirement.required ? "critical" : "warning",
    title: `${entry.missing} ${entry.requirement.equipmentType.replaceAll("_", " ")} missing`,
    description: entry.requirement.required
      ? "Required equipment is not fully assigned to this job yet."
      : "Optional equipment is not fully assigned to this job yet."
  }));
  const warnings: EquipmentReadinessWarning[] = [
    ...missingWarnings,
    ...unavailableAssignments.map((assignment) => ({
      id: `unavailable-${assignment.id}`,
      severity: "critical" as const,
      title: `${assignment.asset?.name ?? "Assigned equipment"} is unavailable`,
      description:
        "Assigned equipment is inactive, retired, in maintenance, or out of service."
    })),
    ...rentalMismatches.map((assignment) => ({
      id: `rental-${assignment.id}`,
      severity: "warning" as const,
      title: `${assignment.asset?.name ?? "Rented equipment"} rental window warning`,
      description:
        "The assigned date or job schedule appears outside the tracked rental window."
    })),
    ...conflictAssignments.map((assignment) => ({
      id: `conflict-${assignment.id}`,
      severity: "warning" as const,
      title: `${assignment.asset?.name ?? "Assigned equipment"} may be double-booked`,
      description:
        "This asset has another active assignment on the same date or overlapping schedule window."
    }))
  ];

  return {
    jobId: input.job.id,
    requirementCount: input.requirements.length,
    assignmentCount: activeAssignments.length,
    missingRequiredCount: missing
      .filter((entry) => entry.requirement.required)
      .reduce((total, entry) => total + entry.missing, 0),
    missingOptionalCount: missing
      .filter((entry) => !entry.requirement.required)
      .reduce((total, entry) => total + entry.missing, 0),
    unavailableAssignedCount: unavailableAssignments.length,
    rentalWindowMismatchCount: rentalMismatches.length,
    conflictCount: conflictAssignments.length,
    assignedCountByType,
    warnings
  };
}
