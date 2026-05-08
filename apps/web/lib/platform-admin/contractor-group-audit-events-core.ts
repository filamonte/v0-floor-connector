import type {
  ContractorGroup,
  ContractorGroupAuditEvent,
  ContractorGroupAuditEventType,
  ContractorGroupAssignmentSource,
  ContractorGroupStatus,
  ContractorGroupType
} from "@floorconnector/types";

export type ContractorGroupAuditTimelineEvent = ContractorGroupAuditEvent & {
  label: string;
  detail: string;
  metadataSummary: string[];
};

export type ContractorGroupAuditTimeline = {
  events: ContractorGroupAuditTimelineEvent[];
  summary: {
    totalEvents: number;
    assignmentEvents: number;
    groupLifecycleEvents: number;
    runtimeEffect: "none";
  };
  caveats: string[];
  note: string;
};

export type ContractorGroupAuditContextIssue = {
  id: string;
  eventId: string;
  eventType: ContractorGroupAuditEventType;
  severity: "warning";
  message: string;
};

export type ContractorGroupAuditActivitySummary = {
  id: string;
  label: string;
  count: number;
  lastEventAt: string | null;
};

export type ContractorGroupAuditGroupSummary = {
  groupId: string;
  groupKey: string | null;
  groupName: string;
  totalEvents: number;
  recentEventCount: number;
  assignmentEventCount: number;
  removalEventCount: number;
  lastEventAt: string | null;
  currentMembershipCount: number;
  timeline: ContractorGroupAuditTimelineEvent[];
  caveats: string[];
};

export type ContractorGroupAuditOrganizationSummary = {
  organizationId: string;
  organizationName: string;
  currentMemberships: Array<{
    groupId: string;
    groupKey: string;
    groupName: string;
    groupStatus: ContractorGroupStatus;
    membershipId: string;
  }>;
  totalEvents: number;
  assignmentEventCount: number;
  removalEventCount: number;
  lastEventAt: string | null;
  timeline: ContractorGroupAuditTimelineEvent[];
  note: string;
};

export type ContractorGroupAuditObservability = {
  summary: {
    totalEvents: number;
    eventsByType: Record<ContractorGroupAuditEventType, number>;
    eventsByGroup: ContractorGroupAuditActivitySummary[];
    eventsByOrganization: ContractorGroupAuditActivitySummary[];
    eventsByAssignmentSource: Record<ContractorGroupAssignmentSource, number>;
    eventsByActor: ContractorGroupAuditActivitySummary[];
    recentEvents: ContractorGroupAuditTimelineEvent[];
    groupsWithRecentActivity: ContractorGroupAuditActivitySummary[];
    organizationsWithRecentAssignmentActivity: ContractorGroupAuditActivitySummary[];
    missingContextIssues: ContractorGroupAuditContextIssue[];
    metadataPresentCount: number;
    metadataAbsentCount: number;
    runtimeEffect: "none";
  };
  groupSummaries: ContractorGroupAuditGroupSummary[];
  organizationSummaries: ContractorGroupAuditOrganizationSummary[];
  note: string;
  caveats: string[];
};

const assignmentEventTypes: ContractorGroupAuditEventType[] = [
  "organization_assigned",
  "organization_removed",
  "assignment_source_changed"
];

const contractorGroupAuditEventTypes: ContractorGroupAuditEventType[] = [
  "group_created",
  "group_updated",
  "group_archived",
  "group_activated",
  "group_deactivated",
  "organization_assigned",
  "organization_removed",
  "assignment_source_changed"
];

const assignmentSources: ContractorGroupAssignmentSource[] = [
  "manual",
  "targeting_preview",
  "future_auto_assignment"
];

export function contractorGroupAuditEventTypeForStatusTransition(input: {
  oldStatus: ContractorGroupStatus | null;
  newStatus: ContractorGroupStatus;
}): ContractorGroupAuditEventType {
  if (!input.oldStatus) {
    return "group_created";
  }

  if (input.oldStatus !== input.newStatus) {
    switch (input.newStatus) {
      case "active":
        return "group_activated";
      case "inactive":
        return "group_deactivated";
      case "archived":
        return "group_archived";
    }
  }

  return "group_updated";
}

export function buildContractorGroupAuditMetadata(input: {
  oldName?: string | null;
  newName?: string | null;
  oldKey?: string | null;
  newKey?: string | null;
  oldStatus?: ContractorGroupStatus | null;
  newStatus?: ContractorGroupStatus | null;
  oldGroupType?: ContractorGroupType | null;
  newGroupType?: ContractorGroupType | null;
  organizationLabel?: string | null;
  organizationTenantStatus?: string | null;
  oldAssignmentSource?: ContractorGroupAssignmentSource | null;
  newAssignmentSource?: ContractorGroupAssignmentSource | null;
  removedMembershipId?: string | null;
  notesPresent?: boolean | null;
}): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => typeof value === "string" || typeof value === "boolean"
    )
  ) as Record<string, string | boolean>;
}

function groupLabel(event: ContractorGroupAuditEvent) {
  return event.contractorGroupName ?? event.contractorGroupKey ?? "Contractor group";
}

function organizationLabel(event: ContractorGroupAuditEvent) {
  return (
    event.organizationName ??
    event.organizationSlug ??
    event.organizationId ??
    "contractor organization"
  );
}

function eventGroupLabel(event: ContractorGroupAuditEvent) {
  return (
    event.contractorGroupName ??
    event.contractorGroupKey ??
    event.contractorGroupId ??
    "Unknown group"
  );
}

function eventOrganizationLabel(event: ContractorGroupAuditEvent) {
  return (
    event.organizationName ??
    event.organizationSlug ??
    event.organizationId ??
    "Unknown organization"
  );
}

function groupDisplayName(group: ContractorGroup) {
  return group.name || group.key || group.id;
}

function membershipOrganizationLabel(
  membership: ContractorGroup["memberships"][number]
) {
  return (
    membership.organizationName ??
    membership.organizationSlug ??
    membership.organizationId
  );
}

export function contractorGroupAuditEventLabel(
  eventType: ContractorGroupAuditEventType
) {
  switch (eventType) {
    case "group_created":
      return "Group created";
    case "group_updated":
      return "Group updated";
    case "group_archived":
      return "Group archived";
    case "group_activated":
      return "Group activated";
    case "group_deactivated":
      return "Group deactivated";
    case "organization_assigned":
      return "Organization assigned";
    case "organization_removed":
      return "Organization removed";
    case "assignment_source_changed":
      return "Assignment source changed";
  }
}

export function contractorGroupAuditEventDetail(event: ContractorGroupAuditEvent) {
  switch (event.eventType) {
    case "group_created":
      return `${groupLabel(event)} was created as platform segmentation metadata.`;
    case "group_updated":
      return `${groupLabel(event)} metadata was updated.`;
    case "group_archived":
      return `${groupLabel(event)} was archived.`;
    case "group_activated":
      return `${groupLabel(event)} was activated.`;
    case "group_deactivated":
      return `${groupLabel(event)} was deactivated.`;
    case "organization_assigned":
      return `${organizationLabel(event)} was assigned to ${groupLabel(event)}.`;
    case "organization_removed":
      return `${organizationLabel(event)} was removed from ${groupLabel(event)}.`;
    case "assignment_source_changed":
      return `${organizationLabel(event)} assignment source changed for ${groupLabel(event)}.`;
  }
}

export function summarizeSafeMetadata(metadata: Record<string, unknown>) {
  return Object.entries(metadata)
    .filter(([, value]) => {
      const valueType = typeof value;
      return (
        value === null ||
        valueType === "string" ||
        valueType === "number" ||
        valueType === "boolean"
      );
    })
    .slice(0, 6)
    .map(([key, value]) => `${key}: ${String(value)}`);
}

function buildTimelineEvent(
  event: ContractorGroupAuditEvent
): ContractorGroupAuditTimelineEvent {
  return {
    ...event,
    label: contractorGroupAuditEventLabel(event.eventType),
    detail: contractorGroupAuditEventDetail(event),
    metadataSummary: summarizeSafeMetadata(event.metadata)
  };
}

function sortEventsByNewest(left: ContractorGroupAuditEvent, right: ContractorGroupAuditEvent) {
  return Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
}

function sortTimelineByNewest(
  left: ContractorGroupAuditTimelineEvent,
  right: ContractorGroupAuditTimelineEvent
) {
  return Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
}

function latestTimestamp(values: string[]) {
  return values
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function incrementRecord<T extends string>(record: Record<T, number>, key: T) {
  record[key] = (record[key] ?? 0) + 1;
}

function buildActivitySummaries(input: Map<string, { label: string; dates: string[] }>) {
  return [...input.entries()]
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.dates.length,
      lastEventAt: latestTimestamp(value.dates)
    }))
    .sort((left, right) => {
      const dateDifference =
        Date.parse(right.lastEventAt ?? "") - Date.parse(left.lastEventAt ?? "");

      return dateDifference || right.count - left.count || left.label.localeCompare(right.label);
    });
}

function contextIssuesForEvent(
  event: ContractorGroupAuditEvent
): ContractorGroupAuditContextIssue[] {
  const issues: ContractorGroupAuditContextIssue[] = [];

  if (!event.contractorGroupId) {
    issues.push({
      id: `${event.id}:missing-group`,
      eventId: event.id,
      eventType: event.eventType,
      severity: "warning",
      message: `${contractorGroupAuditEventLabel(event.eventType)} is missing contractor group context.`
    });
  }

  if (assignmentEventTypes.includes(event.eventType) && !event.organizationId) {
    issues.push({
      id: `${event.id}:missing-organization`,
      eventId: event.id,
      eventType: event.eventType,
      severity: "warning",
      message: `${contractorGroupAuditEventLabel(event.eventType)} is missing organization context.`
    });
  }

  return issues;
}

export function buildContractorGroupAuditTimeline(input: {
  events: ContractorGroupAuditEvent[];
  limit?: number;
}): ContractorGroupAuditTimeline {
  const sortedEvents = [...input.events]
    .sort(sortEventsByNewest)
    .slice(0, input.limit ?? input.events.length)
    .map(buildTimelineEvent);

  return {
    events: sortedEvents,
    summary: {
      totalEvents: input.events.length,
      assignmentEvents: input.events.filter((event) =>
        assignmentEventTypes.includes(event.eventType)
      ).length,
      groupLifecycleEvents: input.events.filter(
        (event) => !assignmentEventTypes.includes(event.eventType)
      ).length,
      runtimeEffect: "none"
    },
    caveats: [
      "Audit history is platform-admin-only evidence and does not enforce entitlements, pricing, permissions, provisioning, or runtime behavior.",
      "This read model shows durable audit rows when present. Existing pre-audit group changes may still only appear in the inferred readiness panel."
    ],
    note:
      "Contractor group audit history is read-only operator evidence. It does not automate assignments or mutate tenant-owned records."
  };
}

export function buildContractorGroupAuditObservability(input: {
  events: ContractorGroupAuditEvent[];
  groups: ContractorGroup[];
  recentLimit?: number;
  timelineLimit?: number;
}): ContractorGroupAuditObservability {
  const eventsByType = Object.fromEntries(
    contractorGroupAuditEventTypes.map((eventType) => [eventType, 0])
  ) as Record<ContractorGroupAuditEventType, number>;
  const eventsByAssignmentSource = Object.fromEntries(
    assignmentSources.map((assignmentSource) => [assignmentSource, 0])
  ) as Record<ContractorGroupAssignmentSource, number>;
  const eventsByGroup = new Map<string, { label: string; dates: string[] }>();
  const eventsByOrganization = new Map<string, { label: string; dates: string[] }>();
  const eventsByActor = new Map<string, { label: string; dates: string[] }>();
  const organizationAssignmentActivity = new Map<
    string,
    { label: string; dates: string[] }
  >();
  const missingContextIssues: ContractorGroupAuditContextIssue[] = [];
  let metadataPresentCount = 0;
  let metadataAbsentCount = 0;

  for (const event of input.events) {
    incrementRecord(eventsByType, event.eventType);

    if (event.assignmentSource) {
      incrementRecord(eventsByAssignmentSource, event.assignmentSource);
    }

    if (event.contractorGroupId) {
      const current = eventsByGroup.get(event.contractorGroupId) ?? {
        label: eventGroupLabel(event),
        dates: []
      };
      current.label = eventGroupLabel(event);
      current.dates.push(event.occurredAt);
      eventsByGroup.set(event.contractorGroupId, current);
    }

    if (event.organizationId) {
      const current = eventsByOrganization.get(event.organizationId) ?? {
        label: eventOrganizationLabel(event),
        dates: []
      };
      current.label = eventOrganizationLabel(event);
      current.dates.push(event.occurredAt);
      eventsByOrganization.set(event.organizationId, current);

      if (assignmentEventTypes.includes(event.eventType)) {
        const assignmentCurrent =
          organizationAssignmentActivity.get(event.organizationId) ?? {
            label: eventOrganizationLabel(event),
            dates: []
          };
        assignmentCurrent.label = eventOrganizationLabel(event);
        assignmentCurrent.dates.push(event.occurredAt);
        organizationAssignmentActivity.set(event.organizationId, assignmentCurrent);
      }
    }

    if (event.actorUserId) {
      const current = eventsByActor.get(event.actorUserId) ?? {
        label: event.actorUserId,
        dates: []
      };
      current.dates.push(event.occurredAt);
      eventsByActor.set(event.actorUserId, current);
    }

    if (Object.keys(event.metadata).length > 0) {
      metadataPresentCount += 1;
    } else {
      metadataAbsentCount += 1;
    }

    missingContextIssues.push(...contextIssuesForEvent(event));
  }

  const timelineEvents = [...input.events].sort(sortEventsByNewest).map(buildTimelineEvent);
  const timelineLimit = input.timelineLimit ?? 8;
  const recentLimit = input.recentLimit ?? 8;
  const groupSummaries = input.groups.map((group) => {
    const groupEvents = timelineEvents.filter(
      (event) => event.contractorGroupId === group.id
    );
    const removalEventCount = groupEvents.filter(
      (event) => event.eventType === "organization_removed"
    ).length;
    const assignmentEventCount = groupEvents.filter((event) =>
      assignmentEventTypes.includes(event.eventType)
    ).length;
    const caveats: string[] = [];

    if (removalEventCount > 0) {
      caveats.push(
        "Removed memberships are durable audit evidence, but removed rows are no longer present in current membership lists."
      );
    }

    if (groupEvents.length === 0) {
      caveats.push(
        "No durable audit events are loaded for this group; older changes may only be visible through current row state."
      );
    }

    return {
      groupId: group.id,
      groupKey: group.key,
      groupName: groupDisplayName(group),
      totalEvents: groupEvents.length,
      recentEventCount: groupEvents.slice(0, recentLimit).length,
      assignmentEventCount,
      removalEventCount,
      lastEventAt: groupEvents[0]?.occurredAt ?? null,
      currentMembershipCount: group.memberships.length,
      timeline: groupEvents.slice(0, timelineLimit),
      caveats
    };
  });
  const organizationsById = new Map<
    string,
    ContractorGroupAuditOrganizationSummary
  >();

  for (const group of input.groups) {
    for (const membership of group.memberships) {
      const current = organizationsById.get(membership.organizationId) ?? {
        organizationId: membership.organizationId,
        organizationName: membershipOrganizationLabel(membership),
        currentMemberships: [],
        totalEvents: 0,
        assignmentEventCount: 0,
        removalEventCount: 0,
        lastEventAt: null,
        timeline: [],
        note:
          "Organization audit history is read-only and does not affect contractor permissions or entitlements."
      };

      current.currentMemberships.push({
        groupId: group.id,
        groupKey: group.key,
        groupName: groupDisplayName(group),
        groupStatus: group.status,
        membershipId: membership.id
      });
      organizationsById.set(membership.organizationId, current);
    }
  }

  for (const event of timelineEvents) {
    if (!event.organizationId) {
      continue;
    }

    const current = organizationsById.get(event.organizationId) ?? {
      organizationId: event.organizationId,
      organizationName: eventOrganizationLabel(event),
      currentMemberships: [],
      totalEvents: 0,
      assignmentEventCount: 0,
      removalEventCount: 0,
      lastEventAt: null,
      timeline: [],
      note:
        "Organization audit history is read-only and does not affect contractor permissions or entitlements."
    };

    current.totalEvents += 1;
    current.timeline.push(event);
    current.lastEventAt = current.lastEventAt ?? event.occurredAt;

    if (assignmentEventTypes.includes(event.eventType)) {
      current.assignmentEventCount += 1;
    }

    if (event.eventType === "organization_removed") {
      current.removalEventCount += 1;
    }

    organizationsById.set(event.organizationId, current);
  }

  return {
    summary: {
      totalEvents: input.events.length,
      eventsByType,
      eventsByGroup: buildActivitySummaries(eventsByGroup),
      eventsByOrganization: buildActivitySummaries(eventsByOrganization),
      eventsByAssignmentSource,
      eventsByActor: buildActivitySummaries(eventsByActor),
      recentEvents: timelineEvents.slice(0, recentLimit),
      groupsWithRecentActivity: buildActivitySummaries(eventsByGroup).slice(
        0,
        recentLimit
      ),
      organizationsWithRecentAssignmentActivity: buildActivitySummaries(
        organizationAssignmentActivity
      ).slice(0, recentLimit),
      missingContextIssues,
      metadataPresentCount,
      metadataAbsentCount,
      runtimeEffect: "none"
    },
    groupSummaries,
    organizationSummaries: [...organizationsById.values()]
      .map((summary) => ({
        ...summary,
        timeline: [...summary.timeline]
          .sort(sortTimelineByNewest)
          .slice(0, timelineLimit),
        lastEventAt: latestTimestamp(summary.timeline.map((event) => event.occurredAt))
      }))
      .sort((left, right) =>
        left.organizationName.localeCompare(right.organizationName)
      ),
    note:
      "Contractor group audit observability is read-only platform evidence. It does not enforce entitlements, permissions, pricing, starter-pack provisioning, or runtime behavior.",
    caveats: [
      "Actor labels are limited to actor ids unless a safe platform-user label is loaded by the server read model.",
      "Removed membership rows are intentionally absent from current membership lists; use organization_removed audit events for historical removal evidence.",
      "Older group changes from before audit write wiring may be missing durable event context."
    ]
  };
}
