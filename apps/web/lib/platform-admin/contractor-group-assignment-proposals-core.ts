import type {
  ContractorGroup,
  ContractorGroupStatus,
  ContractorGroupType,
  PlatformStarterPack,
  PlatformStarterPackAssignment
} from "@floorconnector/types";

export type ContractorGroupAssignmentProposalStatus =
  | "proposed"
  | "already_assigned"
  | "not_applicable"
  | "unavailable";

export type ContractorGroupAssignmentProposalConfidence =
  | "high"
  | "medium"
  | "low"
  | "unavailable";

export type ContractorGroupAssignmentProposalSource =
  | "exact_region_match"
  | "exact_trade_match"
  | "onboarding_label_match"
  | "beta_label_match"
  | "existing_membership"
  | "insufficient_data"
  | "future_only";

export type ContractorGroupAssignmentProposalManualReviewReadiness =
  | "ready_for_review"
  | "already_assigned"
  | "blocked"
  | "needs_metadata"
  | "future_only"
  | "not_recommended";

export type ContractorGroupAssignmentProposalReasonCode =
  | "exact_region_match"
  | "exact_trade_match"
  | "onboarding_label_match"
  | "beta_label_match"
  | "missing_region_metadata"
  | "missing_trade_metadata"
  | "future_entitlement_blocked"
  | "future_plan_blocked"
  | "archived_group_blocked"
  | "inactive_group_not_recommended"
  | "existing_membership"
  | "not_applicable";

export type ContractorGroupProposalOrganization = {
  id: string;
  name: string;
  slug: string;
  tenantStatus: string;
  stateRegion: string | null;
  primaryTrade: string | null;
  labels?: string[];
};

export type ContractorGroupAssignmentProposalManualReviewSeverity =
  | "info"
  | "warning"
  | "blocking";

export type ContractorGroupAssignmentProposalManualReviewEvidenceItem = {
  label: string;
  value: string;
  severity: ContractorGroupAssignmentProposalManualReviewSeverity;
};

export type ContractorGroupAssignmentProposalManualReviewCaveatItem = {
  label: string;
  severity: ContractorGroupAssignmentProposalManualReviewSeverity;
};

export type ContractorGroupAssignmentProposalFutureApplyPreview = {
  currentActionAvailable: false;
  assignmentApplied: false;
  wouldCreateMembership: boolean;
  wouldWriteAuditEvent: boolean;
  affectedRecordTypes: Array<
    "contractor_group_memberships" | "contractor_group_audit_events"
  >;
  runtimeEffect: "none";
  summary: string;
};

export type ContractorGroupAssignmentProposalStarterPackImpactReference = {
  starterPackId: string;
  starterPackName: string;
  starterPackKey: string;
  starterPackStatus: PlatformStarterPack["status"];
  assignmentId: string;
  assignmentStatus: PlatformStarterPackAssignment["status"];
  assignmentKey: string | null;
  assignmentLabel: string | null;
  impact: "read_only_targeting_context";
  provisioningEffect: "none";
};

type ContractorGroupAssignmentProposalCore = {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  contractorGroupId: string;
  contractorGroupName: string;
  contractorGroupKey: string;
  contractorGroupType: ContractorGroupType;
  contractorGroupStatus: ContractorGroupStatus;
  status: ContractorGroupAssignmentProposalStatus;
  confidence: ContractorGroupAssignmentProposalConfidence;
  source: ContractorGroupAssignmentProposalSource;
  reason: string;
  groupIsActive: boolean;
  safeForManualReview: boolean;
  assignmentApplied: false;
  caveats: string[];
};

export type ContractorGroupAssignmentProposal = ContractorGroupAssignmentProposalCore & {
  manualReviewReadiness: ContractorGroupAssignmentProposalManualReviewReadiness;
  readinessLabel: string;
  readinessExplanation: string;
  reasonCode: ContractorGroupAssignmentProposalReasonCode;
  evidenceItems: ContractorGroupAssignmentProposalManualReviewEvidenceItem[];
  caveatItems: ContractorGroupAssignmentProposalManualReviewCaveatItem[];
  futureApplyPreview: ContractorGroupAssignmentProposalFutureApplyPreview;
  starterPackImpactPreview: ContractorGroupAssignmentProposalStarterPackImpactReference[];
  runtimeEffect: "none";
  actionAvailable: false;
  manualReviewChecklist: ContractorGroupAssignmentProposalManualReviewChecklist;
};

export type ContractorGroupAssignmentProposalSummary = {
  totalProposals: number;
  proposedCount: number;
  alreadyAssignedCount: number;
  unavailableCount: number;
  notApplicableCount: number;
  highConfidenceCount: number;
  runtimeEffect: "none";
};

export type ContractorGroupAssignmentProposalReasonSummary = {
  key: ContractorGroupAssignmentProposalSource | "caveat";
  label: string;
  count: number;
};

export type ContractorGroupAssignmentProposalOrganizationSummary = {
  organizationId: string;
  organizationName: string;
  totalProposals: number;
  proposedCount: number;
  alreadyAssignedCount: number;
  unavailableCount: number;
  notApplicableCount: number;
  topReasons: ContractorGroupAssignmentProposalReasonSummary[];
  topCaveats: ContractorGroupAssignmentProposalReasonSummary[];
};

export type ContractorGroupAssignmentProposalReadModel = {
  proposals: ContractorGroupAssignmentProposal[];
  summary: ContractorGroupAssignmentProposalSummary;
  organizationSummaries: ContractorGroupAssignmentProposalOrganizationSummary[];
  selectedOrganizationSummary: ContractorGroupAssignmentProposalOrganizationSummary | null;
  note: string;
  caveats: string[];
};

export type ContractorGroupAssignmentProposalManualReviewChecklist = {
  proposalId: string;
  organizationId: string;
  contractorGroupId: string;
  evidenceItems: ContractorGroupAssignmentProposalManualReviewEvidenceItem[];
  requiredFutureOperatorChecks: string[];
  blockingCaveats: string[];
  suggestedFutureReasonText: string;
  manualAssignmentPathLabel: string;
  actionAvailable: false;
  note: string;
};

function normalizeToken(value: string | null | undefined) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ?? ""
  );
}

function groupTokens(group: ContractorGroup) {
  const key = normalizeToken(group.key);
  const name = normalizeToken(group.name);

  return [key, name].filter(Boolean);
}

function tokenMatchesGroup(group: ContractorGroup, value: string | null | undefined) {
  const normalizedValue = normalizeToken(value);

  if (!normalizedValue) {
    return false;
  }

  return groupTokens(group).some(
    (token) =>
      token === normalizedValue ||
      token === `${group.groupType}-${normalizedValue}` ||
      token.endsWith(`-${normalizedValue}`) ||
      token.startsWith(`${normalizedValue}-`)
  );
}

function organizationLabelMatchesGroup(
  group: ContractorGroup,
  organization: ContractorGroupProposalOrganization
) {
  return (organization.labels ?? []).some((label) =>
    tokenMatchesGroup(group, label)
  );
}

function hasMembership(group: ContractorGroup, organizationId: string) {
  return group.memberships.some(
    (membership) => membership.organizationId === organizationId
  );
}

function organizationName(organization: ContractorGroupProposalOrganization) {
  return organization.name || organization.slug || organization.id;
}

function starterPackAssignmentReferencesByGroupKey(starterPacks: PlatformStarterPack[]) {
  const referencesByGroupKey = new Map<
    string,
    ContractorGroupAssignmentProposalStarterPackImpactReference[]
  >();

  for (const pack of starterPacks) {
    for (const assignment of pack.assignments) {
      if (
        assignment.assignmentType !== "future_contractor_group" ||
        !assignment.assignmentKey
      ) {
        continue;
      }

      const key = normalizeToken(assignment.assignmentKey);
      const references = referencesByGroupKey.get(key) ?? [];

      references.push({
        starterPackId: pack.id,
        starterPackName: pack.name,
        starterPackKey: pack.packKey,
        starterPackStatus: pack.status,
        assignmentId: assignment.id,
        assignmentStatus: assignment.status,
        assignmentKey: assignment.assignmentKey,
        assignmentLabel: assignment.label,
        impact: "read_only_targeting_context",
        provisioningEffect: "none"
      });
      referencesByGroupKey.set(key, references);
    }
  }

  return referencesByGroupKey;
}

function proposalBase(input: {
  group: ContractorGroup;
  organization: ContractorGroupProposalOrganization;
}) {
  const { group, organization } = input;

  return {
    id: `${organization.id}:${group.id}`,
    organizationId: organization.id,
    organizationName: organizationName(organization),
    organizationSlug: organization.slug,
    contractorGroupId: group.id,
    contractorGroupName: group.name,
    contractorGroupKey: group.key,
    contractorGroupType: group.groupType,
    contractorGroupStatus: group.status,
    groupIsActive: group.status === "active",
    assignmentApplied: false as const
  };
}

function proposalForGroup(input: {
  group: ContractorGroup;
  organization: ContractorGroupProposalOrganization;
}): ContractorGroupAssignmentProposalCore {
  const { group, organization } = input;
  const base = proposalBase(input);

  if (hasMembership(group, organization.id)) {
    return {
      ...base,
      status: "already_assigned",
      confidence: "high",
      source: "existing_membership",
      reason: `${base.organizationName} is already explicitly assigned to ${group.name}.`,
      safeForManualReview: true,
      caveats:
        group.status === "archived"
          ? [
              "The organization is already assigned, but the contractor group is archived and should not receive new assignments."
            ]
          : []
    };
  }

  if (group.status === "archived") {
    return {
      ...base,
      status: "unavailable",
      confidence: "unavailable",
      source: "future_only",
      reason: `${group.name} is archived and is not proposed for new organization assignments.`,
      safeForManualReview: false,
      caveats: ["Archived groups are retained as audit/segmentation history only."]
    };
  }

  if (group.status === "inactive") {
    return {
      ...base,
      status: "not_applicable",
      confidence: "low",
      source: "future_only",
      reason: `${group.name} is inactive, so it is visible for review but not currently recommended for new assignments.`,
      safeForManualReview: true,
      caveats: ["Inactive groups should be reactivated by a platform admin before use."]
    };
  }

  if (group.groupType === "future_entitlement" || group.groupType === "future_plan") {
    return {
      ...base,
      status: "unavailable",
      confidence: "unavailable",
      source: "future_only",
      reason: `${group.name} is reserved for future plan or entitlement design and is not proposed automatically.`,
      safeForManualReview: false,
      caveats: [
        "Plan and entitlement groups are future-only metadata and do not enforce or suggest runtime access."
      ]
    };
  }

  if (group.groupType === "regional") {
    if (!organization.stateRegion) {
      return {
        ...base,
        status: "unavailable",
        confidence: "unavailable",
        source: "insufficient_data",
        reason: `${base.organizationName} does not have state/region metadata available for regional proposal matching.`,
        safeForManualReview: false,
        caveats: ["Add durable organization region data before using this proposal."]
      };
    }

    if (tokenMatchesGroup(group, organization.stateRegion)) {
      return {
        ...base,
        status: "proposed",
        confidence: "high",
        source: "exact_region_match",
        reason: `${base.organizationName} has state/region ${organization.stateRegion}, which matches ${group.name}.`,
        safeForManualReview: true,
        caveats: []
      };
    }

    return {
      ...base,
      status: "not_applicable",
      confidence: "low",
      source: "insufficient_data",
      reason: `${base.organizationName} has state/region ${organization.stateRegion}, which does not match ${group.name}.`,
      safeForManualReview: true,
      caveats: []
    };
  }

  if (group.groupType === "trade_segment") {
    if (!organization.primaryTrade) {
      return {
        ...base,
        status: "unavailable",
        confidence: "unavailable",
        source: "insufficient_data",
        reason: `${base.organizationName} does not have primary trade metadata available for trade proposal matching.`,
        safeForManualReview: false,
        caveats: ["Add durable organization trade data before using this proposal."]
      };
    }

    if (tokenMatchesGroup(group, organization.primaryTrade)) {
      return {
        ...base,
        status: "proposed",
        confidence: "high",
        source: "exact_trade_match",
        reason: `${base.organizationName} has primary trade ${organization.primaryTrade}, which matches ${group.name}.`,
        safeForManualReview: true,
        caveats: []
      };
    }

    return {
      ...base,
      status: "not_applicable",
      confidence: "low",
      source: "insufficient_data",
      reason: `${base.organizationName} has primary trade ${organization.primaryTrade}, which does not match ${group.name}.`,
      safeForManualReview: true,
      caveats: []
    };
  }

  if (
    group.groupType === "onboarding" &&
    organizationLabelMatchesGroup(group, organization)
  ) {
    return {
      ...base,
      status: "proposed",
      confidence: "medium",
      source: "onboarding_label_match",
      reason: `${base.organizationName} has an organization label that clearly matches onboarding group ${group.name}.`,
      safeForManualReview: true,
      caveats: ["Onboarding proposals require human review before assignment."]
    };
  }

  if (group.groupType === "beta" && organizationLabelMatchesGroup(group, organization)) {
    return {
      ...base,
      status: "proposed",
      confidence: "medium",
      source: "beta_label_match",
      reason: `${base.organizationName} has an organization label that clearly matches beta group ${group.name}.`,
      safeForManualReview: true,
      caveats: ["Beta proposals require human review before assignment."]
    };
  }

  return {
    ...base,
    status: group.groupType === "internal" || group.groupType === "custom"
      ? "not_applicable"
      : "unavailable",
    confidence: "unavailable",
    source: "future_only",
    reason: `${group.name} is not inferred aggressively from current organization metadata.`,
    safeForManualReview: true,
    caveats: [
      "This phase only proposes exact region/trade matches or explicit organization-label matches."
    ]
  };
}

function reasonCodeForProposal(
  proposal: ContractorGroupAssignmentProposalCore
): ContractorGroupAssignmentProposalReasonCode {
  if (proposal.status === "already_assigned") {
    return "existing_membership";
  }

  if (proposal.contractorGroupStatus === "archived") {
    return "archived_group_blocked";
  }

  if (proposal.contractorGroupStatus === "inactive") {
    return "inactive_group_not_recommended";
  }

  if (proposal.contractorGroupType === "future_entitlement") {
    return "future_entitlement_blocked";
  }

  if (proposal.contractorGroupType === "future_plan") {
    return "future_plan_blocked";
  }

  if (
    proposal.contractorGroupType === "regional" &&
    proposal.status === "unavailable" &&
    proposal.source === "insufficient_data"
  ) {
    return "missing_region_metadata";
  }

  if (
    proposal.contractorGroupType === "trade_segment" &&
    proposal.status === "unavailable" &&
    proposal.source === "insufficient_data"
  ) {
    return "missing_trade_metadata";
  }

  if (proposal.source === "exact_region_match") {
    return "exact_region_match";
  }

  if (proposal.source === "exact_trade_match") {
    return "exact_trade_match";
  }

  if (proposal.source === "onboarding_label_match") {
    return "onboarding_label_match";
  }

  if (proposal.source === "beta_label_match") {
    return "beta_label_match";
  }

  return "not_applicable";
}

function readinessForProposal(proposal: ContractorGroupAssignmentProposalCore): {
  manualReviewReadiness: ContractorGroupAssignmentProposalManualReviewReadiness;
  readinessLabel: string;
  readinessExplanation: string;
} {
  if (proposal.status === "already_assigned") {
    return {
      manualReviewReadiness: "already_assigned",
      readinessLabel: "Already assigned",
      readinessExplanation:
        "Current membership already exists; do not create another assignment from this proposal."
    };
  }

  if (proposal.contractorGroupStatus === "archived") {
    return {
      manualReviewReadiness: "blocked",
      readinessLabel: "Blocked",
      readinessExplanation:
        "Archived contractor groups are retained for history and should not receive new assignments."
    };
  }

  if (
    proposal.contractorGroupType === "future_entitlement" ||
    proposal.contractorGroupType === "future_plan"
  ) {
    return {
      manualReviewReadiness: "future_only",
      readinessLabel: "Future only",
      readinessExplanation:
        "Future plan and entitlement groups are planning metadata only and must not become runtime access or assignment behavior in this phase."
    };
  }

  if (
    proposal.status === "unavailable" &&
    proposal.source === "insufficient_data"
  ) {
    return {
      manualReviewReadiness: "needs_metadata",
      readinessLabel: "Needs metadata",
      readinessExplanation:
        "The organization is missing durable metadata needed before a platform admin can safely review this proposal."
    };
  }

  if (
    proposal.status === "proposed" &&
    proposal.safeForManualReview &&
    proposal.contractorGroupStatus === "active"
  ) {
    return {
      manualReviewReadiness: "ready_for_review",
      readinessLabel: "Ready for review",
      readinessExplanation:
        "The proposal has reviewable evidence, but a future audited manual assignment flow would still require human confirmation."
    };
  }

  if (proposal.status === "unavailable" || !proposal.safeForManualReview) {
    return {
      manualReviewReadiness: "blocked",
      readinessLabel: "Blocked",
      readinessExplanation:
        "This proposal is unavailable or unsafe for future assignment until its blockers are resolved."
    };
  }

  return {
    manualReviewReadiness: "not_recommended",
    readinessLabel: "Not recommended",
    readinessExplanation:
      "This row is visible for operator context, but the current read model does not recommend assignment."
  };
}

function futureApplyPreviewForProposal(
  proposal: ContractorGroupAssignmentProposalCore,
  manualReviewReadiness: ContractorGroupAssignmentProposalManualReviewReadiness
): ContractorGroupAssignmentProposalFutureApplyPreview {
  const wouldCreateMembership = manualReviewReadiness === "ready_for_review";
  const wouldWriteAuditEvent = wouldCreateMembership;

  return {
    currentActionAvailable: false,
    assignmentApplied: false,
    wouldCreateMembership,
    wouldWriteAuditEvent,
    affectedRecordTypes: wouldCreateMembership
      ? ["contractor_group_memberships", "contractor_group_audit_events"]
      : [],
    runtimeEffect: "none",
    summary: wouldCreateMembership
      ? "Future-only preview: a later audited manual apply action could create one contractor group membership and one audit event after explicit platform-admin confirmation. No such action exists in this read model."
      : "No future membership write is recommended from this proposal state, and no current action is available."
  };
}

function caveatItemsForProposal(
  proposal: ContractorGroupAssignmentProposalCore,
  blockingCaveats: string[]
): ContractorGroupAssignmentProposalManualReviewCaveatItem[] {
  const caveatItems = new Map<
    string,
    ContractorGroupAssignmentProposalManualReviewCaveatItem
  >();

  for (const caveat of proposal.caveats) {
    caveatItems.set(caveat, {
      label: caveat,
      severity: "warning"
    });
  }

  for (const caveat of blockingCaveats) {
    caveatItems.set(caveat, {
      label: caveat,
      severity: "blocking"
    });
  }

  if (caveatItems.size === 0) {
    caveatItems.set("No blocking caveats are present in this read model.", {
      label: "No blocking caveats are present in this read model.",
      severity: "info"
    });
  }

  return Array.from(caveatItems.values());
}

function enrichProposal(input: {
  proposal: ContractorGroupAssignmentProposalCore;
  starterPackReferencesByGroupKey: Map<
    string,
    ContractorGroupAssignmentProposalStarterPackImpactReference[]
  >;
}): ContractorGroupAssignmentProposal {
  const readiness = readinessForProposal(input.proposal);
  const checklist =
    buildContractorGroupAssignmentProposalManualReviewChecklist(input.proposal);

  return {
    ...input.proposal,
    ...readiness,
    reasonCode: reasonCodeForProposal(input.proposal),
    evidenceItems: checklist.evidenceItems,
    caveatItems: caveatItemsForProposal(
      input.proposal,
      checklist.blockingCaveats
    ),
    futureApplyPreview: futureApplyPreviewForProposal(
      input.proposal,
      readiness.manualReviewReadiness
    ),
    starterPackImpactPreview:
      input.starterPackReferencesByGroupKey.get(
        normalizeToken(input.proposal.contractorGroupKey)
      ) ?? [],
    runtimeEffect: "none",
    actionAvailable: false,
    manualReviewChecklist: checklist
  };
}

function proposalSummary(
  proposals: ContractorGroupAssignmentProposal[]
): ContractorGroupAssignmentProposalSummary {
  return {
    totalProposals: proposals.length,
    proposedCount: proposals.filter((proposal) => proposal.status === "proposed")
      .length,
    alreadyAssignedCount: proposals.filter(
      (proposal) => proposal.status === "already_assigned"
    ).length,
    unavailableCount: proposals.filter(
      (proposal) => proposal.status === "unavailable"
    ).length,
    notApplicableCount: proposals.filter(
      (proposal) => proposal.status === "not_applicable"
    ).length,
    highConfidenceCount: proposals.filter(
      (proposal) => proposal.confidence === "high"
    ).length,
    runtimeEffect: "none"
  };
}

function topReasonSummaries(
  values: Array<{ key: ContractorGroupAssignmentProposalSource | "caveat"; label: string }>
): ContractorGroupAssignmentProposalReasonSummary[] {
  const counts = new Map<
    string,
    ContractorGroupAssignmentProposalReasonSummary
  >();

  for (const value of values) {
    const id = `${value.key}:${value.label}`;
    const current = counts.get(id) ?? {
      key: value.key,
      label: value.label,
      count: 0
    };

    current.count += 1;
    counts.set(id, current);
  }

  return Array.from(counts.values())
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label)
    )
    .slice(0, 4);
}

function organizationProposalSummary(input: {
  organization: ContractorGroupProposalOrganization;
  proposals: ContractorGroupAssignmentProposal[];
}): ContractorGroupAssignmentProposalOrganizationSummary {
  return {
    organizationId: input.organization.id,
    organizationName: organizationName(input.organization),
    ...proposalSummary(input.proposals),
    topReasons: topReasonSummaries(
      input.proposals.map((proposal) => ({
        key: proposal.source,
        label: proposal.source.replace(/_/g, " ")
      }))
    ),
    topCaveats: topReasonSummaries(
      input.proposals.flatMap((proposal) =>
        proposal.caveats.map((caveat) => ({
          key: "caveat" as const,
          label: caveat
        }))
      )
    )
  };
}

function sortProposals(
  proposals: ContractorGroupAssignmentProposal[]
): ContractorGroupAssignmentProposal[] {
  const statusOrder = {
    proposed: 0,
    already_assigned: 1,
    unavailable: 2,
    not_applicable: 3
  } as const;

  return [...proposals].sort(
    (left, right) =>
      statusOrder[left.status] - statusOrder[right.status] ||
      left.organizationName.localeCompare(right.organizationName) ||
      left.contractorGroupName.localeCompare(right.contractorGroupName)
  );
}

function evidenceSeverityForProposal(
  proposal: ContractorGroupAssignmentProposalCore
): ContractorGroupAssignmentProposalManualReviewSeverity {
  if (
    proposal.status === "unavailable" ||
    proposal.contractorGroupStatus === "archived" ||
    !proposal.safeForManualReview
  ) {
    return "blocking";
  }

  if (
    proposal.status === "already_assigned" ||
    proposal.status === "not_applicable" ||
    proposal.contractorGroupStatus === "inactive"
  ) {
    return "warning";
  }

  return "info";
}

function manualReviewBlockingCaveats(
  proposal: ContractorGroupAssignmentProposalCore
): string[] {
  const caveats = new Set<string>();

  if (proposal.status === "already_assigned") {
    caveats.add(
      "Membership already exists; do not create another assignment from this proposal."
    );
  }

  if (proposal.contractorGroupStatus === "archived") {
    caveats.add(
      "Archived groups are retained for history and should not receive new assignments."
    );
  }

  if (proposal.status === "unavailable") {
    caveats.add(
      "Unavailable proposals should be investigated, not converted to assignment."
    );
  }

  if (!proposal.safeForManualReview) {
    caveats.add(
      "This proposal is not safe for future manual assignment until its availability or metadata caveats are resolved."
    );
  }

  for (const caveat of proposal.caveats) {
    if (
      proposal.status === "unavailable" ||
      proposal.contractorGroupStatus === "archived"
    ) {
      caveats.add(caveat);
    }
  }

  return Array.from(caveats);
}

function suggestedManualReviewReason(proposal: ContractorGroupAssignmentProposalCore) {
  if (proposal.status === "proposed") {
    return `Manual review: ${proposal.reason}`;
  }

  if (proposal.status === "already_assigned") {
    return `No new assignment: ${proposal.organizationName} is already assigned to ${proposal.contractorGroupName}.`;
  }

  return `Do not assign from this proposal without new operator evidence: ${proposal.reason}`;
}

export function buildContractorGroupAssignmentProposalManualReviewChecklist(
  proposal: ContractorGroupAssignmentProposalCore
): ContractorGroupAssignmentProposalManualReviewChecklist {
  const proposalSeverity = evidenceSeverityForProposal(proposal);
  const blockingCaveats = manualReviewBlockingCaveats(proposal);

  return {
    proposalId: proposal.id,
    organizationId: proposal.organizationId,
    contractorGroupId: proposal.contractorGroupId,
    evidenceItems: [
      {
        label: "Organization",
        value: `${proposal.organizationName} (${proposal.organizationSlug})`,
        severity: "info"
      },
      {
        label: "Contractor group",
        value: `${proposal.contractorGroupName} (${proposal.contractorGroupKey})`,
        severity: proposal.contractorGroupStatus === "archived" ? "blocking" : "info"
      },
      {
        label: "Group type and status",
        value: `${proposal.contractorGroupType.replace(/_/g, " ")} / ${
          proposal.contractorGroupStatus
        }`,
        severity: proposal.contractorGroupStatus === "active" ? "info" : "warning"
      },
      {
        label: "Proposal evidence",
        value: `${proposal.status.replace(/_/g, " ")} / ${
          proposal.confidence
        } confidence / ${proposal.source.replace(/_/g, " ")}`,
        severity: proposalSeverity
      },
      {
        label: "Reason",
        value: proposal.reason,
        severity: proposalSeverity
      },
      {
        label: "Assignment applied",
        value: "No. This read model never creates or changes membership.",
        severity: "info"
      },
      {
        label: "Existing membership",
        value:
          proposal.status === "already_assigned"
            ? "Current explicit membership already exists."
            : "No current membership was inferred from this proposal row.",
        severity: proposal.status === "already_assigned" ? "warning" : "info"
      }
    ],
    requiredFutureOperatorChecks: [
      "Verify the organization metadata source that produced the proposal.",
      "Review the matching contractor group key, type, and status.",
      "Review current memberships and durable audit history for this organization.",
      "Check related starter-pack assignment references before deciding.",
      "Capture explicit platform-admin reason/notes before any future assignment.",
      "Use the existing audited manual assignment RPC/action if assignment is later approved.",
      "Confirm no entitlement, provisioning, pricing, permission, or runtime behavior is triggered."
    ],
    blockingCaveats,
    suggestedFutureReasonText: suggestedManualReviewReason(proposal),
    manualAssignmentPathLabel:
      "Existing audited manual assignment flow; no proposal action is available here.",
    actionAvailable: false,
    note:
      "Manual review readiness is read-only. It explains evidence and future checks, but it does not approve, dismiss, or apply a contractor group assignment."
  };
}

export function buildContractorGroupAssignmentProposals(input: {
  groups: ContractorGroup[];
  organizations: ContractorGroupProposalOrganization[];
  starterPacks?: PlatformStarterPack[];
  filters?: {
    organizationId?: string | null;
    status?: ContractorGroupAssignmentProposalStatus | "all" | null;
    confidence?: ContractorGroupAssignmentProposalConfidence | "all" | null;
    groupType?: ContractorGroupType | "all" | null;
  };
}): ContractorGroupAssignmentProposalReadModel {
  const organizationId = input.filters?.organizationId ?? null;
  const statusFilter = input.filters?.status ?? "all";
  const confidenceFilter = input.filters?.confidence ?? "all";
  const groupTypeFilter = input.filters?.groupType ?? "all";
  const starterPackReferencesByGroupKey = starterPackAssignmentReferencesByGroupKey(
    input.starterPacks ?? []
  );
  const organizations = organizationId
    ? input.organizations.filter((organization) => organization.id === organizationId)
    : input.organizations;
  const allOrganizationProposals = input.organizations.flatMap((organization) =>
    input.groups.map((group) =>
      enrichProposal({
        proposal: proposalForGroup({ group, organization }),
        starterPackReferencesByGroupKey
      })
    )
  );
  const allProposals = organizations.flatMap((organization) =>
    input.groups.map((group) =>
      enrichProposal({
        proposal: proposalForGroup({ group, organization }),
        starterPackReferencesByGroupKey
      })
    )
  );
  const proposals = sortProposals(
    allProposals.filter((proposal) => {
      const statusMatches =
        statusFilter === "all" || proposal.status === statusFilter;
      const confidenceMatches =
        confidenceFilter === "all" || proposal.confidence === confidenceFilter;
      const groupTypeMatches =
        groupTypeFilter === "all" || proposal.contractorGroupType === groupTypeFilter;

      return statusMatches && confidenceMatches && groupTypeMatches;
    })
  );
  const organizationSummaries = input.organizations.map((organization) =>
    organizationProposalSummary({
      organization,
      proposals: allOrganizationProposals.filter(
        (proposal) => proposal.organizationId === organization.id
      )
    })
  );
  const selectedOrganizationSummary = organizationId
    ? organizationSummaries.find((summary) => summary.organizationId === organizationId) ??
      null
    : null;

  return {
    proposals,
    summary: proposalSummary(proposals),
    organizationSummaries,
    selectedOrganizationSummary,
    note:
      "Read-only assignment proposals. No contractor group membership is created, removed, or changed; a platform admin must still use the audited manual assignment flow.",
    caveats: [
      "Regional and trade proposals require exact metadata matches.",
      "Onboarding and beta groups are proposed only from explicit organization labels.",
      "Future plan and future entitlement groups are never proposed automatically in this phase."
    ]
  };
}
