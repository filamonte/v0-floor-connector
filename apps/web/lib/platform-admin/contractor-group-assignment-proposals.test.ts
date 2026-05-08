import test from "node:test";
import assert from "node:assert/strict";
import type { ContractorGroup, PlatformStarterPack } from "@floorconnector/types";

import {
  buildContractorGroupAssignmentProposalManualReviewChecklist,
  buildContractorGroupAssignmentProposals,
  type ContractorGroupProposalOrganization
} from "./contractor-group-assignment-proposals-core";

const organizations: ContractorGroupProposalOrganization[] = [
  {
    id: "org-1",
    name: "Austin Epoxy",
    slug: "austin-epoxy",
    tenantStatus: "active",
    stateRegion: "TX",
    primaryTrade: "Residential Epoxy",
    labels: ["fast-start", "beta-installers"]
  },
  {
    id: "org-2",
    name: "Unknown Floors",
    slug: "unknown-floors",
    tenantStatus: "active",
    stateRegion: null,
    primaryTrade: null,
    labels: []
  }
];

function makeGroup(overrides: Partial<ContractorGroup> = {}): ContractorGroup {
  return {
    id: "group-1",
    key: "regional-tx",
    name: "Regional TX",
    description: null,
    status: "active",
    groupType: "regional",
    membershipCount: 0,
    memberships: [],
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

function makeStarterPack(
  overrides: Partial<PlatformStarterPack> = {}
): PlatformStarterPack {
  return {
    id: "starter-pack-1",
    packKey: "regional-tx-pack",
    name: "Regional TX Starter Pack",
    description: null,
    status: "published",
    segmentKey: null,
    templateSeedCount: 0,
    catalogSeedCount: 0,
    assignmentCount: 1,
    activeAssignmentCount: 1,
    items: [],
    assignments: [
      {
        id: "starter-pack-assignment-1",
        starterPackId: "starter-pack-1",
        assignmentType: "future_contractor_group",
        organizationId: null,
        organizationName: null,
        organizationSlug: null,
        assignmentKey: "regional-tx",
        label: "Regional TX contractor group",
        status: "active",
        notes: null,
        createdAt: "2026-05-07T00:00:00.000Z",
        updatedAt: "2026-05-07T00:00:00.000Z"
      }
    ],
    createdAt: "2026-05-07T00:00:00.000Z",
    updatedAt: "2026-05-07T00:00:00.000Z",
    ...overrides
  };
}

void test("assignment proposals propose exact regional matches", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup()],
    organizations: [organizations[0]]
  });

  assert.equal(model.summary.proposedCount, 1);
  assert.equal(model.proposals[0]?.status, "proposed");
  assert.equal(model.proposals[0]?.confidence, "high");
  assert.equal(model.proposals[0]?.source, "exact_region_match");
  assert.equal(model.proposals[0]?.assignmentApplied, false);
  assert.equal(model.proposals[0]?.manualReviewReadiness, "ready_for_review");
  assert.equal(model.proposals[0]?.reasonCode, "exact_region_match");
  assert.equal(model.proposals[0]?.actionAvailable, false);
  assert.equal(model.proposals[0]?.runtimeEffect, "none");
  assert.equal(model.proposals[0]?.futureApplyPreview.wouldCreateMembership, true);
  assert.equal(model.proposals[0]?.futureApplyPreview.runtimeEffect, "none");
});

void test("assignment proposals propose exact trade segment matches", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        id: "group-2",
        key: "residential-epoxy",
        name: "Residential Epoxy",
        groupType: "trade_segment"
      })
    ],
    organizations: [organizations[0]]
  });

  assert.equal(model.proposals[0]?.status, "proposed");
  assert.equal(model.proposals[0]?.source, "exact_trade_match");
});

void test("assignment proposals show existing memberships as already assigned", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        memberships: [
          {
            id: "membership-1",
            contractorGroupId: "group-1",
            organizationId: "org-1",
            organizationName: "Austin Epoxy",
            organizationSlug: "austin-epoxy",
            organizationTenantStatus: "active",
            assignedByUserId: "user-1",
            assignmentSource: "manual",
            notes: null,
            createdAt: "2026-05-07T00:00:00.000Z"
          }
        ]
      })
    ],
    organizations: [organizations[0]]
  });

  assert.equal(model.summary.alreadyAssignedCount, 1);
  assert.equal(model.proposals[0]?.status, "already_assigned");
  assert.equal(model.proposals[0]?.source, "existing_membership");
  assert.equal(model.proposals[0]?.manualReviewReadiness, "already_assigned");
  assert.equal(model.proposals[0]?.reasonCode, "existing_membership");
  assert.equal(model.proposals[0]?.futureApplyPreview.wouldCreateMembership, false);
});

void test("assignment proposals do not propose archived groups", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup({ status: "archived" })],
    organizations: [organizations[0]]
  });

  assert.equal(model.proposals[0]?.status, "unavailable");
  assert.equal(model.proposals[0]?.source, "future_only");
  assert.equal(model.proposals[0]?.safeForManualReview, false);
  assert.equal(model.proposals[0]?.manualReviewReadiness, "blocked");
  assert.equal(model.proposals[0]?.reasonCode, "archived_group_blocked");
});

void test("assignment proposals keep future entitlement groups unavailable", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_entitlement"
      })
    ],
    organizations: [organizations[0]]
  });

  assert.equal(model.proposals[0]?.status, "unavailable");
  assert.equal(model.proposals[0]?.source, "future_only");
  assert.equal(model.proposals[0]?.manualReviewReadiness, "future_only");
  assert.equal(model.proposals[0]?.reasonCode, "future_entitlement_blocked");
  assert.match(model.proposals[0]?.reason ?? "", /future plan or entitlement/);
});

void test("assignment proposals mark insufficient organization metadata unavailable", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup()],
    organizations: [organizations[1]]
  });

  assert.equal(model.proposals[0]?.status, "unavailable");
  assert.equal(model.proposals[0]?.confidence, "unavailable");
  assert.equal(model.proposals[0]?.source, "insufficient_data");
  assert.equal(model.proposals[0]?.manualReviewReadiness, "needs_metadata");
  assert.equal(model.proposals[0]?.reasonCode, "missing_region_metadata");
});

void test("assignment proposals mark missing trade metadata as needs metadata", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        id: "group-2",
        key: "residential-epoxy",
        name: "Residential Epoxy",
        groupType: "trade_segment"
      })
    ],
    organizations: [organizations[1]]
  });

  assert.equal(model.proposals[0]?.manualReviewReadiness, "needs_metadata");
  assert.equal(model.proposals[0]?.reasonCode, "missing_trade_metadata");
});

void test("assignment proposals support status filtering", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_plan"
      })
    ],
    organizations: [organizations[0]],
    filters: {
      status: "unavailable"
    }
  });

  assert.equal(model.summary.totalProposals, 1);
  assert.equal(model.proposals[0]?.status, "unavailable");
});

void test("assignment proposals support confidence filtering", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_plan"
      })
    ],
    organizations: [organizations[0]],
    filters: {
      confidence: "high"
    }
  });

  assert.equal(model.summary.totalProposals, 1);
  assert.equal(model.proposals[0]?.confidence, "high");
});

void test("assignment proposals support group type filtering", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "residential-epoxy",
        name: "Residential Epoxy",
        groupType: "trade_segment"
      })
    ],
    organizations: [organizations[0]],
    filters: {
      groupType: "trade_segment"
    }
  });

  assert.equal(model.summary.totalProposals, 1);
  assert.equal(model.proposals[0]?.contractorGroupType, "trade_segment");
});

void test("assignment proposals return selected organization summaries", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_entitlement"
      })
    ],
    organizations,
    filters: {
      organizationId: "org-1",
      status: "proposed"
    }
  });

  assert.equal(model.summary.totalProposals, 1);
  assert.equal(model.selectedOrganizationSummary?.organizationId, "org-1");
  assert.equal(model.selectedOrganizationSummary?.totalProposals, 2);
  assert.equal(model.selectedOrganizationSummary?.proposedCount, 1);
});

void test("assignment proposals group unavailable and future-only reasons", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_entitlement"
      }),
      makeGroup({
        id: "group-3",
        key: "archived-tx",
        name: "Archived TX",
        status: "archived"
      })
    ],
    organizations: [organizations[1]],
    filters: {
      organizationId: "org-2"
    }
  });

  assert.equal(model.selectedOrganizationSummary?.unavailableCount, 3);
  assert.ok(
    model.selectedOrganizationSummary?.topReasons.some(
      (reason) => reason.key === "future_only"
    )
  );
  assert.ok((model.selectedOrganizationSummary?.topCaveats.length ?? 0) > 0);
});

void test("assignment proposal outputs always keep assignmentApplied false", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_entitlement"
      })
    ],
    organizations
  });

  assert.ok(model.proposals.every((proposal) => proposal.assignmentApplied === false));
  assert.ok(model.proposals.every((proposal) => proposal.actionAvailable === false));
  assert.ok(model.proposals.every((proposal) => proposal.runtimeEffect === "none"));
  assert.ok(
    model.proposals.every(
      (proposal) => proposal.futureApplyPreview.currentActionAvailable === false
    )
  );
});

void test("assignment proposal model does not mutate memberships", () => {
  const group = makeGroup();
  const beforeMemberships = group.memberships.length;

  const model = buildContractorGroupAssignmentProposals({
    groups: [group],
    organizations: [organizations[0]]
  });

  assert.equal(group.memberships.length, beforeMemberships);
  assert.equal(model.summary.runtimeEffect, "none");
  assert.match(model.note, /No contractor group membership is created/);
});

void test("assignment proposal model does not mutate starter packs or preview provisioning", () => {
  const group = makeGroup();
  const starterPacks = [makeStarterPack()];
  const beforeGroup = JSON.stringify(group);
  const beforeStarterPacks = JSON.stringify(starterPacks);

  const model = buildContractorGroupAssignmentProposals({
    groups: [group],
    organizations: [organizations[0]],
    starterPacks
  });

  assert.equal(JSON.stringify(group), beforeGroup);
  assert.equal(JSON.stringify(starterPacks), beforeStarterPacks);
  assert.equal(model.proposals[0]?.starterPackImpactPreview.length, 1);
  assert.equal(
    model.proposals[0]?.starterPackImpactPreview[0]?.impact,
    "read_only_targeting_context"
  );
  assert.equal(
    model.proposals[0]?.starterPackImpactPreview[0]?.provisioningEffect,
    "none"
  );
  assert.equal(model.proposals[0]?.futureApplyPreview.runtimeEffect, "none");
});

void test("assignment proposal read model exposes promoted manual-review fields", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup()],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);

  assert.equal(proposal.manualReviewChecklist.actionAvailable, false);
  assert.equal(proposal.evidenceItems, proposal.manualReviewChecklist.evidenceItems);
  assert.ok(proposal.caveatItems.length > 0);
  assert.match(proposal.readinessLabel, /Ready for review/);
  assert.match(proposal.readinessExplanation, /human confirmation/);
  assert.deepEqual(proposal.futureApplyPreview.affectedRecordTypes, [
    "contractor_group_memberships",
    "contractor_group_audit_events"
  ]);
});

void test("assignment proposal read model does not expose action wording for bulk or provisioning", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup()],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);
  const actionText = [
    proposal.manualReviewChecklist.manualAssignmentPathLabel,
    proposal.manualReviewChecklist.note,
    proposal.futureApplyPreview.summary
  ].join(" ");

  assert.equal(proposal.actionAvailable, false);
  assert.doesNotMatch(actionText, /apply all/i);
  assert.doesNotMatch(actionText, /auto assign/i);
  assert.doesNotMatch(actionText, /bulk/i);
  assert.doesNotMatch(actionText, /provision/i);
});

void test("assignment proposal manual review checklist explains high-confidence proposals", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup()],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);

  const checklist =
    buildContractorGroupAssignmentProposalManualReviewChecklist(proposal);

  assert.equal(checklist.actionAvailable, false);
  assert.equal(checklist.blockingCaveats.length, 0);
  assert.match(checklist.suggestedFutureReasonText, /Manual review:/);
  assert.ok(
    checklist.evidenceItems.some(
      (item) =>
        item.label === "Proposal evidence" &&
        item.value.includes("high confidence")
    )
  );
  assert.ok(
    checklist.requiredFutureOperatorChecks.some((check) =>
      check.includes("audited manual assignment")
    )
  );
});

void test("assignment proposal manual review checklist blocks unavailable future-only proposals", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_entitlement"
      })
    ],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);

  const checklist =
    buildContractorGroupAssignmentProposalManualReviewChecklist(proposal);

  assert.equal(checklist.actionAvailable, false);
  assert.ok(checklist.blockingCaveats.length > 0);
  assert.match(checklist.suggestedFutureReasonText, /Do not assign/);
  assert.ok(
    checklist.evidenceItems.some(
      (item) => item.label === "Proposal evidence" && item.severity === "blocking"
    )
  );
});

void test("assignment proposal manual review checklist warns for already assigned memberships", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup({
        memberships: [
          {
            id: "membership-1",
            contractorGroupId: "group-1",
            organizationId: "org-1",
            organizationName: "Austin Epoxy",
            organizationSlug: "austin-epoxy",
            organizationTenantStatus: "active",
            assignedByUserId: "user-1",
            assignmentSource: "manual",
            notes: null,
            createdAt: "2026-05-07T00:00:00.000Z"
          }
        ]
      })
    ],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);

  const checklist =
    buildContractorGroupAssignmentProposalManualReviewChecklist(proposal);

  assert.equal(checklist.actionAvailable, false);
  assert.ok(
    checklist.blockingCaveats.some((caveat) =>
      caveat.includes("Membership already exists")
    )
  );
  assert.match(checklist.suggestedFutureReasonText, /No new assignment/);
});

void test("assignment proposal manual review checklist surfaces archived group caveats", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [makeGroup({ status: "archived" })],
    organizations: [organizations[0]]
  });
  const proposal = model.proposals[0];
  assert.ok(proposal);

  const checklist =
    buildContractorGroupAssignmentProposalManualReviewChecklist(proposal);

  assert.equal(checklist.actionAvailable, false);
  assert.ok(
    checklist.blockingCaveats.some((caveat) =>
      caveat.includes("Archived groups")
    )
  );
});

void test("assignment proposal manual review checklist keeps actions unavailable for every proposal", () => {
  const model = buildContractorGroupAssignmentProposals({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "future-pro-plan",
        name: "Future Pro Plan",
        groupType: "future_plan"
      })
    ],
    organizations
  });

  assert.ok(
    model.proposals.every(
      (proposal) =>
        buildContractorGroupAssignmentProposalManualReviewChecklist(proposal)
          .actionAvailable === false
    )
  );
});
