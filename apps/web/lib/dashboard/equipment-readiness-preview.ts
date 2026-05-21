import type { JobStatus } from "@floorconnector/types";

import {
  deriveJobEquipmentReadinessSummary,
  type EquipmentReadinessAssignmentInput,
  type EquipmentReadinessConflictInput,
  type EquipmentReadinessRequirementInput
} from "../equipment/readiness";
import { buildScheduleHref } from "../schedule/links";

export type DashboardEquipmentWarningJobInput = {
  id: string;
  projectId: string;
  dispatchStatus: JobStatus;
  scheduledDate: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
};

export type DashboardEquipmentWarningPreview = {
  id: string;
  jobId: string;
  projectId: string;
  title: string;
  description: string;
  why: string;
  href: string;
  actionLabel: string;
  secondaryHref: string | null;
  secondaryLabel: string | null;
  badge: string;
  warningCount: number;
  severity: "critical" | "warning";
  updatedAt: string;
  scheduledDate: string | null;
};

function getPrimaryWarning(
  warnings: ReturnType<typeof deriveJobEquipmentReadinessSummary>["warnings"]
) {
  return (
    warnings.find((warning) => warning.severity === "critical") ??
    warnings[0] ??
    null
  );
}

export function mapDashboardEquipmentWarningPreviews(input: {
  jobs: DashboardEquipmentWarningJobInput[];
  requirementsByJobId: Map<string, EquipmentReadinessRequirementInput[]>;
  assignmentsByJobId: Map<string, EquipmentReadinessAssignmentInput[]>;
  conflictsByAssetId: Map<string, EquipmentReadinessConflictInput[]>;
  limit: number;
}): DashboardEquipmentWarningPreview[] {
  return input.jobs
    .map((job) => {
      const assignments = input.assignmentsByJobId.get(job.id) ?? [];
      const possibleConflicts = assignments.flatMap(
        (assignment) =>
          input.conflictsByAssetId.get(assignment.equipmentAssetId) ?? []
      );
      const summary = deriveJobEquipmentReadinessSummary({
        job: {
          id: job.id,
          scheduledDate: job.scheduledDate,
          scheduledStartAt: job.scheduledStartAt,
          scheduledEndAt: job.scheduledEndAt
        },
        requirements: input.requirementsByJobId.get(job.id) ?? [],
        assignments,
        possibleConflicts
      });
      const primaryWarning = getPrimaryWarning(summary.warnings);

      if (!primaryWarning) {
        return null;
      }

      const isCritical = summary.warnings.some(
        (warning) => warning.severity === "critical"
      );
      const scheduleView =
        job.dispatchStatus === "unscheduled" ? "unscheduled" : "scheduled";
      const item: DashboardEquipmentWarningPreview = {
        id: `equipment-warning-${job.id}`,
        jobId: job.id,
        projectId: job.projectId,
        title: job.project?.name ?? "Job equipment readiness",
        description: `${job.customer?.name ?? "Unknown customer"} / ${primaryWarning.title}`,
        why:
          summary.warnings.length === 1
            ? primaryWarning.description
            : `${summary.warnings.length} equipment readiness warnings are active for this job.`,
        href:
          buildScheduleHref({
            projectId: job.projectId,
            view: scheduleView,
            action: "schedule",
            jobId: job.id
          }) + "#schedule-action",
        actionLabel: "Open schedule panel",
        secondaryHref: `/jobs/${job.id}`,
        secondaryLabel: "Open job",
        badge: isCritical ? "Equipment blocker" : "Equipment warning",
        warningCount: summary.warnings.length,
        severity: isCritical ? "critical" : "warning",
        updatedAt: job.updatedAt,
        scheduledDate: job.scheduledDate
      };

      return item;
    })
    .filter((item): item is DashboardEquipmentWarningPreview => Boolean(item))
    .sort((left, right) => {
      if (left.severity !== right.severity) {
        return left.severity === "critical" ? -1 : 1;
      }

      if (left.warningCount !== right.warningCount) {
        return right.warningCount - left.warningCount;
      }

      const leftSchedule = left.scheduledDate ?? "9999-12-31";
      const rightSchedule = right.scheduledDate ?? "9999-12-31";
      const scheduleComparison = leftSchedule.localeCompare(rightSchedule);

      if (scheduleComparison !== 0) {
        return scheduleComparison;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    })
    .slice(0, input.limit);
}
