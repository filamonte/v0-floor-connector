import type { ContractorGroup } from "@floorconnector/types";

export type ContractorGroupAssignmentAuditEventType =
  | "group_created"
  | "organization_assigned"
  | "group_archived_inferred";

export type ContractorGroupAssignmentAuditReadinessEvent = {
  id: string;
  eventType: ContractorGroupAssignmentAuditEventType;
  groupId: string;
  groupKey: string;
  groupName: string;
  organizationId: string | null;
  organizationName: string | null;
  performedByUserId: string | null;
  assignmentSource: string | null;
  notes: string | null;
  occurredAt: string;
  summary: string;
  caveat: string | null;
};

export type ContractorGroupAssignmentAuditReadinessCaveat = {
  key: string;
  severity: "info" | "warning";
  title: string;
  description: string;
};

export type ContractorGroupAssignmentAuditReadiness = {
  events: ContractorGroupAssignmentAuditReadinessEvent[];
  caveats: ContractorGroupAssignmentAuditReadinessCaveat[];
  summary: {
    inferredGroupCreatedEvents: number;
    inferredOrganizationAssignedEvents: number;
    inferredArchivedGroupEvents: number;
    removedAssignmentHistoryAvailable: boolean;
    durableAuditTableAvailable: boolean;
    runtimeEffect: "none";
  };
  note: string;
};

function organizationLabel(input: {
  organizationName: string | null;
  organizationSlug: string | null;
  organizationId: string;
}) {
  return input.organizationName ?? input.organizationSlug ?? input.organizationId;
}

function sortByNewestEvent(
  left: ContractorGroupAssignmentAuditReadinessEvent,
  right: ContractorGroupAssignmentAuditReadinessEvent
) {
  return Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
}

export function buildContractorGroupAssignmentAuditReadiness(input: {
  groups: ContractorGroup[];
  limit?: number;
}): ContractorGroupAssignmentAuditReadiness {
  const events: ContractorGroupAssignmentAuditReadinessEvent[] = [];

  for (const group of input.groups) {
    events.push({
      id: `group-created:${group.id}`,
      eventType: "group_created",
      groupId: group.id,
      groupKey: group.key,
      groupName: group.name,
      organizationId: null,
      organizationName: null,
      performedByUserId: null,
      assignmentSource: null,
      notes: group.description,
      occurredAt: group.createdAt,
      summary: `Group ${group.name} was created as platform segmentation metadata.`,
      caveat:
        "Created-by actor is not exposed in the current group read type; future audit events should store performed_by explicitly."
    });

    if (group.status === "archived") {
      events.push({
        id: `group-archived:${group.id}`,
        eventType: "group_archived_inferred",
        groupId: group.id,
        groupKey: group.key,
        groupName: group.name,
        organizationId: null,
        organizationName: null,
        performedByUserId: null,
        assignmentSource: null,
        notes: null,
        occurredAt: group.updatedAt,
        summary: `Group ${group.name} is archived.`,
        caveat:
          "Archive is inferred from current status and updated_at; exact archive actor, reason, and event timestamp are not durable yet."
      });
    }

    for (const membership of group.memberships) {
      const assignedOrganizationName = organizationLabel(membership);

      events.push({
        id: `organization-assigned:${membership.id}`,
        eventType: "organization_assigned",
        groupId: group.id,
        groupKey: group.key,
        groupName: group.name,
        organizationId: membership.organizationId,
        organizationName: assignedOrganizationName,
        performedByUserId: membership.assignedByUserId,
        assignmentSource: membership.assignmentSource,
        notes: membership.notes,
        occurredAt: membership.createdAt,
        summary: `${assignedOrganizationName} was assigned to ${group.name}.`,
        caveat:
          "Assignment is inferred from the current membership row. If removed, this row disappears and the removal is not durable history yet."
      });
    }
  }

  const limitedEvents = [...events]
    .sort(sortByNewestEvent)
    .slice(0, input.limit ?? 8);

  return {
    events: limitedEvents,
    caveats: [
      {
        key: "membership-removal-history-unavailable",
        severity: "warning",
        title: "Removed memberships are not durable history yet",
        description:
          "Current removal deletes the membership row, so inferred readiness can see current assignments but cannot reconstruct past removals that were not written to durable audit events."
      },
      {
        key: "archive-history-inferred",
        severity: "warning",
        title: "Archive history is inferred",
        description:
          "Archived group state is visible from current group rows. Durable audit events should be used for exact archive actor, reason, and event timestamps after write wiring is enabled."
      },
      {
        key: "no-runtime-effect",
        severity: "info",
        title: "No runtime effect",
        description:
          "This readiness model is read-only and does not enforce entitlements, permissions, pricing, starter-pack provisioning, or contractor behavior."
      }
    ],
    summary: {
      inferredGroupCreatedEvents: input.groups.length,
      inferredOrganizationAssignedEvents: input.groups.reduce(
        (count, group) => count + group.memberships.length,
        0
      ),
      inferredArchivedGroupEvents: input.groups.filter(
        (group) => group.status === "archived"
      ).length,
      removedAssignmentHistoryAvailable: false,
      durableAuditTableAvailable: true,
      runtimeEffect: "none"
    },
    note:
      "Assignment audit readiness is inferred from existing contractor group and membership rows only. Durable audit storage and transaction-aware write wiring are available for new actions, but operator QA is still required before groups power enforcement or automation."
  };
}
