import type {
  ContractorGroup,
  ContractorGroupMembership,
  ContractorGroupStatus,
  ContractorGroupType,
  PlatformStarterPack,
  PlatformStarterPackAssignment
} from "@floorconnector/types";

export type ContractorGroupObservableOrganization = {
  id: string;
  name: string;
  slug: string;
  tenantStatus: string;
};

export type ContractorGroupStarterPackAssignmentReference = {
  starterPackId: string;
  starterPackName: string;
  starterPackKey: string;
  starterPackStatus: PlatformStarterPack["status"];
  assignmentId: string;
  assignmentStatus: PlatformStarterPackAssignment["status"];
  assignmentKey: string | null;
  assignmentLabel: string | null;
};

export type ContractorGroupObservabilityOrganizationSummary = {
  organization: ContractorGroupObservableOrganization;
  groups: Array<{
    id: string;
    key: string;
    name: string;
    status: ContractorGroupStatus;
    groupType: ContractorGroupType;
    membershipId: string;
    assignmentSource: ContractorGroupMembership["assignmentSource"];
    assignedByUserId: string | null;
    notes: string | null;
    createdAt: string;
  }>;
  activeGroupCount: number;
  inactiveGroupCount: number;
  archivedGroupCount: number;
  starterPackAssignmentReferences: ContractorGroupStarterPackAssignmentReference[];
};

export type ContractorGroupObservabilityGroupDetail = {
  group: ContractorGroup;
  memberOrganizationCount: number;
  memberOrganizations: ContractorGroupMembership[];
  starterPackAssignmentReferences: ContractorGroupStarterPackAssignmentReference[];
};

export type ContractorGroupObservabilitySummary = {
  totalGroups: number;
  activeGroups: number;
  inactiveGroups: number;
  archivedGroups: number;
  totalMemberships: number;
  groupsByType: Record<ContractorGroupType, number>;
  organizationsAssignedToMultipleGroups: ContractorGroupObservabilityOrganizationSummary[];
  organizationsAssignedToNoGroups: ContractorGroupObservableOrganization[];
  recentlyUpdatedGroups: ContractorGroup[];
  recentlyAssignedMemberships: Array<
    ContractorGroupMembership & {
      groupId: string;
      groupKey: string;
      groupName: string;
      groupStatus: ContractorGroupStatus;
    }
  >;
};

export type ContractorGroupObservability = {
  summary: ContractorGroupObservabilitySummary;
  groupDetails: ContractorGroupObservabilityGroupDetail[];
  organizationSummaries: ContractorGroupObservabilityOrganizationSummary[];
  note: string;
};

const groupTypes: ContractorGroupType[] = [
  "trade_segment",
  "onboarding",
  "beta",
  "internal",
  "future_plan",
  "future_entitlement",
  "regional",
  "custom"
];

function normalizeKey(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function byNewestTimestamp<T extends { createdAt?: string; updatedAt?: string }>(
  getTimestamp: (value: T) => string | undefined
) {
  return (left: T, right: T) =>
    Date.parse(getTimestamp(right) ?? "") - Date.parse(getTimestamp(left) ?? "");
}

function buildStarterPackAssignmentReferences(
  starterPacks: PlatformStarterPack[]
) {
  const referencesByGroupKey = new Map<
    string,
    ContractorGroupStarterPackAssignmentReference[]
  >();

  for (const pack of starterPacks) {
    for (const assignment of pack.assignments) {
      if (
        assignment.assignmentType !== "future_contractor_group" ||
        !assignment.assignmentKey
      ) {
        continue;
      }

      const groupKey = normalizeKey(assignment.assignmentKey);
      const reference: ContractorGroupStarterPackAssignmentReference = {
        starterPackId: pack.id,
        starterPackName: pack.name,
        starterPackKey: pack.packKey,
        starterPackStatus: pack.status,
        assignmentId: assignment.id,
        assignmentStatus: assignment.status,
        assignmentKey: assignment.assignmentKey,
        assignmentLabel: assignment.label
      };

      referencesByGroupKey.set(groupKey, [
        ...(referencesByGroupKey.get(groupKey) ?? []),
        reference
      ]);
    }
  }

  return referencesByGroupKey;
}

function organizationName(input: ContractorGroupObservableOrganization) {
  return input.name || input.slug || input.id;
}

export function buildContractorGroupObservability(input: {
  groups: ContractorGroup[];
  organizations: ContractorGroupObservableOrganization[];
  starterPacks?: PlatformStarterPack[];
}): ContractorGroupObservability {
  const starterPackReferencesByGroupKey = buildStarterPackAssignmentReferences(
    input.starterPacks ?? []
  );
  const groupsByType = Object.fromEntries(
    groupTypes.map((type) => [type, 0])
  ) as Record<ContractorGroupType, number>;
  const membershipsByOrganization = new Map<
    string,
    ContractorGroupObservabilityOrganizationSummary["groups"]
  >();
  const recentlyAssignedMemberships: ContractorGroupObservabilitySummary["recentlyAssignedMemberships"] =
    [];

  for (const group of input.groups) {
    groupsByType[group.groupType] += 1;

    for (const membership of group.memberships) {
      const current = membershipsByOrganization.get(membership.organizationId) ?? [];
      current.push({
        id: group.id,
        key: group.key,
        name: group.name,
        status: group.status,
        groupType: group.groupType,
        membershipId: membership.id,
        assignmentSource: membership.assignmentSource,
        assignedByUserId: membership.assignedByUserId,
        notes: membership.notes,
        createdAt: membership.createdAt
      });
      membershipsByOrganization.set(membership.organizationId, current);
      recentlyAssignedMemberships.push({
        ...membership,
        groupId: group.id,
        groupKey: group.key,
        groupName: group.name,
        groupStatus: group.status
      });
    }
  }

  const organizationSummaries = input.organizations.map((organization) => {
    const groups = membershipsByOrganization.get(organization.id) ?? [];
    const starterPackAssignmentReferences = groups.flatMap(
      (group) => starterPackReferencesByGroupKey.get(normalizeKey(group.key)) ?? []
    );

    return {
      organization,
      groups,
      activeGroupCount: groups.filter((group) => group.status === "active").length,
      inactiveGroupCount: groups.filter((group) => group.status === "inactive").length,
      archivedGroupCount: groups.filter((group) => group.status === "archived").length,
      starterPackAssignmentReferences
    };
  });

  const groupDetails = input.groups.map((group) => ({
    group,
    memberOrganizationCount: group.memberships.length,
    memberOrganizations: group.memberships,
    starterPackAssignmentReferences:
      starterPackReferencesByGroupKey.get(normalizeKey(group.key)) ?? []
  }));

  return {
    summary: {
      totalGroups: input.groups.length,
      activeGroups: input.groups.filter((group) => group.status === "active").length,
      inactiveGroups: input.groups.filter((group) => group.status === "inactive").length,
      archivedGroups: input.groups.filter((group) => group.status === "archived").length,
      totalMemberships: input.groups.reduce(
        (count, group) => count + group.memberships.length,
        0
      ),
      groupsByType,
      organizationsAssignedToMultipleGroups: organizationSummaries
        .filter((summary) => summary.groups.length > 1)
        .sort((left, right) =>
          organizationName(left.organization).localeCompare(
            organizationName(right.organization)
          )
        ),
      organizationsAssignedToNoGroups: organizationSummaries
        .filter((summary) => summary.groups.length === 0)
        .map((summary) => summary.organization)
        .sort((left, right) =>
          organizationName(left).localeCompare(organizationName(right))
        ),
      recentlyUpdatedGroups: [...input.groups]
        .sort(byNewestTimestamp((group) => group.updatedAt))
        .slice(0, 5),
      recentlyAssignedMemberships: recentlyAssignedMemberships
        .sort(byNewestTimestamp((membership) => membership.createdAt))
        .slice(0, 5)
    },
    groupDetails,
    organizationSummaries,
    note:
      "Read-only contractor group observability. Groups are platform segmentation metadata only and do not enforce entitlements, permissions, pricing, provisioning, or runtime behavior."
  };
}
