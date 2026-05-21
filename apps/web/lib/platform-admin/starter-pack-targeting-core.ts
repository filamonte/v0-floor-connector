import type {
  ContractorGroupStatus,
  ContractorGroupType,
  PlatformStarterPack,
  PlatformStarterPackAssignment
} from "@floorconnector/types";

export type StarterPackTargetingStatus =
  | "matched"
  | "possible_match"
  | "not_matched"
  | "unavailable";

export type StarterPackTargetingOrganization = {
  id: string;
  name: string;
  slug: string;
  tenantStatus: string;
  lifecycleState: string;
  stateRegion: string | null;
  primaryTrade: string | null;
  planKey: string | null;
  planName: string | null;
  contractorGroups?: StarterPackTargetingContractorGroup[];
};

export type StarterPackTargetingContractorGroup = {
  id: string;
  key: string;
  name: string;
  status: ContractorGroupStatus;
  groupType: ContractorGroupType;
};

export type StarterPackAssignmentTargetingResult = {
  assignment: PlatformStarterPackAssignment;
  status: StarterPackTargetingStatus;
  reason: string;
};

export type StarterPackTargetingPackResult = {
  pack: PlatformStarterPack;
  status: StarterPackTargetingStatus;
  matchedAssignments: StarterPackAssignmentTargetingResult[];
  unmatchedAssignments: StarterPackAssignmentTargetingResult[];
  unavailableAssignments: StarterPackAssignmentTargetingResult[];
  reason: string;
};

export type StarterPackTargetingPreview = {
  organization: StarterPackTargetingOrganization | null;
  matchedStarterPacks: StarterPackTargetingPackResult[];
  unmatchedStarterPacks: StarterPackTargetingPackResult[];
  unavailableStarterPacks: StarterPackTargetingPackResult[];
  packResults: StarterPackTargetingPackResult[];
  note: string;
};

function normalizeTarget(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, "-") ?? "";
}

function assignmentTargetLabel(assignment: PlatformStarterPackAssignment) {
  if (assignment.assignmentType === "all_organizations") {
    return "all contractor organizations";
  }

  if (assignment.assignmentType === "organization") {
    return (
      assignment.organizationName ??
      assignment.organizationSlug ??
      assignment.organizationId ??
      "the selected organization"
    );
  }

  return assignment.label ?? assignment.assignmentKey ?? "the target key";
}

function inactiveAssignmentResult(
  assignment: PlatformStarterPackAssignment
): StarterPackAssignmentTargetingResult | null {
  if (assignment.status === "active") {
    return null;
  }

  return {
    assignment,
    status: "possible_match",
    reason: `This ${assignment.status} assignment is recorded as planning intent, but only active assignment intent is considered a match in this preview.`
  };
}

export function explainStarterPackAssignmentTargeting(input: {
  organization: StarterPackTargetingOrganization | null;
  assignment: PlatformStarterPackAssignment;
}): StarterPackAssignmentTargetingResult {
  const { assignment, organization } = input;
  const inactiveResult = inactiveAssignmentResult(assignment);

  if (inactiveResult) {
    return inactiveResult;
  }

  if (!organization) {
    return {
      assignment,
      status: "unavailable",
      reason:
        "Select an organization to inspect whether this active assignment intent would match."
    };
  }

  switch (assignment.assignmentType) {
    case "all_organizations":
      return organization.tenantStatus === "active"
        ? {
            assignment,
            status: "matched",
            reason:
              "This active all-organizations intent matches because the selected organization is active."
          }
        : {
            assignment,
            status: "not_matched",
            reason: `All-organizations intent applies to active organizations; this organization is currently ${organization.tenantStatus}.`
          };

    case "organization":
      return assignment.organizationId === organization.id
        ? {
            assignment,
            status: "matched",
            reason: `This active organization intent directly targets ${organization.name}.`
          }
        : {
            assignment,
            status: "not_matched",
            reason: `This organization intent targets ${assignmentTargetLabel(
              assignment
            )}, not ${organization.name}.`
          };

    case "region": {
      if (!organization.stateRegion) {
        return {
          assignment,
          status: "unavailable",
          reason:
            "Region targeting is planning-only for this organization because no organization state/region value is available."
        };
      }

      const matches =
        normalizeTarget(assignment.assignmentKey) ===
        normalizeTarget(organization.stateRegion);

      return matches
        ? {
            assignment,
            status: "matched",
            reason: `Region intent matches organization state/region ${organization.stateRegion}.`
          }
        : {
            assignment,
            status: "not_matched",
            reason: `Region intent targets ${assignment.assignmentKey}; organization state/region is ${organization.stateRegion}.`
          };
    }

    case "trade_segment": {
      if (!organization.primaryTrade) {
        return {
          assignment,
          status: "unavailable",
          reason:
            "Trade-segment targeting is planning-only for this organization because no primary trade is available."
        };
      }

      const matches =
        normalizeTarget(assignment.assignmentKey) ===
        normalizeTarget(organization.primaryTrade);

      return matches
        ? {
            assignment,
            status: "matched",
            reason: `Trade-segment intent matches organization primary trade ${organization.primaryTrade}.`
          }
        : {
            assignment,
            status: "not_matched",
            reason: `Trade-segment intent targets ${assignment.assignmentKey}; organization primary trade is ${organization.primaryTrade}.`
          };
    }

    case "plan_tier": {
      const planTarget = organization.planKey ?? organization.planName;

      if (!planTarget) {
        return {
          assignment,
          status: "unavailable",
          reason:
            "Plan-tier targeting is planning-only for this organization because no current plan data is available."
        };
      }

      const matches =
        normalizeTarget(assignment.assignmentKey) === normalizeTarget(planTarget);

      return matches
        ? {
            assignment,
            status: "matched",
            reason: `Plan-tier intent matches current plan ${organization.planName ?? organization.planKey}.`
          }
        : {
            assignment,
            status: "not_matched",
            reason: `Plan-tier intent targets ${assignment.assignmentKey}; current plan is ${organization.planName ?? organization.planKey}.`
          };
    }

    case "onboarding_profile":
      return {
        assignment,
        status: "unavailable",
        reason:
          "Onboarding-profile targeting is planning-only because no durable onboarding profile field exists yet."
      };

    case "future_contractor_group":
      if (!assignment.assignmentKey) {
        return {
          assignment,
          status: "unavailable",
          reason:
            "Contractor-group targeting needs a contractor group key before this preview can inspect explicit membership."
        };
      }

      if (!organization.contractorGroups) {
        return {
          assignment,
          status: "unavailable",
          reason:
            "Contractor-group targeting is unavailable because contractor group membership data was not loaded for this organization."
        };
      }

      {
        const normalizedAssignmentKey = normalizeTarget(assignment.assignmentKey);
        const matchingGroup = organization.contractorGroups.find(
          (group) =>
            normalizeTarget(group.key) === normalizedAssignmentKey ||
            normalizeTarget(group.id) === normalizedAssignmentKey
        );

        if (!matchingGroup) {
          return {
            assignment,
            status: "not_matched",
            reason: `Contractor-group intent targets ${assignment.assignmentKey}; ${organization.name} is not explicitly assigned to that group.`
          };
        }

        if (matchingGroup.status !== "active") {
          return {
            assignment,
            status: "possible_match",
            reason: `${organization.name} is explicitly assigned to ${matchingGroup.name}, but the contractor group is ${matchingGroup.status}. Only active groups are treated as a current match.`
          };
        }

        return {
          assignment,
          status: "matched",
          reason: `${organization.name} is explicitly assigned to active contractor group ${matchingGroup.name}. This is still planning-only and does not provision or enforce behavior.`
        };
      }

    default:
      return {
        assignment,
        status: "unavailable",
        reason: "This assignment type is not available to the targeting preview."
      };
  }
}

function combinePackStatus(
  results: StarterPackAssignmentTargetingResult[]
): StarterPackTargetingStatus {
  if (results.some((result) => result.status === "matched")) {
    return "matched";
  }

  if (results.some((result) => result.status === "possible_match")) {
    return "possible_match";
  }

  if (results.length > 0 && results.every((result) => result.status === "unavailable")) {
    return "unavailable";
  }

  return "not_matched";
}

function summarizePackResult(
  pack: PlatformStarterPack,
  status: StarterPackTargetingStatus,
  results: StarterPackAssignmentTargetingResult[]
) {
  if (results.length === 0) {
    return "This starter pack has no assignment intent rows yet.";
  }

  if (status === "matched") {
    const count = results.filter((result) => result.status === "matched").length;

    return `${count} assignment intent row${count === 1 ? "" : "s"} matched the selected organization.`;
  }

  if (status === "possible_match") {
    return "This starter pack has draft or inactive assignment intent that is visible but not currently considered a match.";
  }

  if (status === "unavailable") {
    return "This starter pack only has assignment intent that depends on future or unavailable targeting data.";
  }

  return `No active assignment intent rows matched the selected organization for ${pack.name}.`;
}

export function buildStarterPackTargetingPreview(input: {
  organization: StarterPackTargetingOrganization | null;
  starterPacks: PlatformStarterPack[];
}): StarterPackTargetingPreview {
  const packResults = input.starterPacks.map((pack) => {
    const assignmentResults = pack.assignments.map((assignment) =>
      explainStarterPackAssignmentTargeting({
        organization: input.organization,
        assignment
      })
    );
    const status = combinePackStatus(assignmentResults);

    return {
      pack,
      status,
      matchedAssignments: assignmentResults.filter(
        (result) => result.status === "matched"
      ),
      unmatchedAssignments: assignmentResults.filter((result) =>
        ["possible_match", "not_matched"].includes(result.status)
      ),
      unavailableAssignments: assignmentResults.filter(
        (result) => result.status === "unavailable"
      ),
      reason: summarizePackResult(pack, status, assignmentResults)
    };
  });

  return {
    organization: input.organization,
    matchedStarterPacks: packResults.filter((result) => result.status === "matched"),
    unmatchedStarterPacks: packResults.filter((result) =>
      ["possible_match", "not_matched"].includes(result.status)
    ),
    unavailableStarterPacks: packResults.filter(
      (result) => result.status === "unavailable"
    ),
    packResults,
    note:
      "Planning only. This targeting preview reads starter-pack assignment intent and existing organization metadata without provisioning, copying, enforcing, or changing runtime defaults."
  };
}
