import test from "node:test";
import assert from "node:assert/strict";
import type { ContractorGroup, PlatformStarterPack } from "@floorconnector/types";

import { buildContractorGroupObservability } from "./contractor-group-observability-core";

const organizations = [
  {
    id: "org-1",
    name: "Acme Floors",
    slug: "acme-floors",
    tenantStatus: "active"
  },
  {
    id: "org-2",
    name: "Beta Coatings",
    slug: "beta-coatings",
    tenantStatus: "active"
  },
  {
    id: "org-3",
    name: "No Group Concrete",
    slug: "no-group-concrete",
    tenantStatus: "active"
  }
];

function makeGroup(
  overrides: Partial<ContractorGroup> = {}
): ContractorGroup {
  return {
    id: "group-1",
    key: "priority-installers",
    name: "Priority Installers",
    description: null,
    status: "active",
    groupType: "beta",
    membershipCount: 1,
    memberships: [
      {
        id: "membership-1",
        contractorGroupId: "group-1",
        organizationId: "org-1",
        organizationName: "Acme Floors",
        organizationSlug: "acme-floors",
        organizationTenantStatus: "active",
        assignedByUserId: "user-1",
        assignmentSource: "manual",
        notes: "QA membership",
        createdAt: "2026-05-07T12:00:00.000Z"
      }
    ],
    createdAt: "2026-05-07T11:00:00.000Z",
    updatedAt: "2026-05-07T12:00:00.000Z",
    ...overrides
  };
}

function makeStarterPack(): PlatformStarterPack {
  return {
    id: "pack-1",
    packKey: "qa-pack",
    name: "QA Pack",
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
        id: "assignment-1",
        starterPackId: "pack-1",
        assignmentType: "future_contractor_group",
        organizationId: null,
        organizationName: null,
        organizationSlug: null,
        assignmentKey: "priority-installers",
        label: "Priority Installers",
        status: "active",
        notes: null,
        createdAt: "2026-05-07T12:00:00.000Z",
        updatedAt: "2026-05-07T12:00:00.000Z"
      }
    ],
    createdAt: "2026-05-07T12:00:00.000Z",
    updatedAt: "2026-05-07T12:00:00.000Z"
  };
}

void test("contractor group observability summarizes group and membership counts", () => {
  const observability = buildContractorGroupObservability({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "regional-north",
        name: "Regional North",
        status: "inactive",
        groupType: "regional",
        memberships: []
      }),
      makeGroup({
        id: "group-3",
        key: "archived-test",
        name: "Archived Test",
        status: "archived",
        groupType: "internal",
        memberships: []
      })
    ],
    organizations
  });

  assert.equal(observability.summary.totalGroups, 3);
  assert.equal(observability.summary.activeGroups, 1);
  assert.equal(observability.summary.inactiveGroups, 1);
  assert.equal(observability.summary.archivedGroups, 1);
  assert.equal(observability.summary.totalMemberships, 1);
  assert.equal(observability.summary.groupsByType.beta, 1);
  assert.equal(observability.summary.groupsByType.regional, 1);
});

void test("contractor group observability detects organizations in multiple groups", () => {
  const observability = buildContractorGroupObservability({
    groups: [
      makeGroup(),
      makeGroup({
        id: "group-2",
        key: "epoxy-beta",
        name: "Epoxy Beta",
        groupType: "trade_segment",
        memberships: [
          {
            ...makeGroup().memberships[0],
            id: "membership-2",
            contractorGroupId: "group-2"
          }
        ]
      })
    ],
    organizations
  });

  assert.equal(
    observability.summary.organizationsAssignedToMultipleGroups.length,
    1
  );
  assert.equal(
    observability.summary.organizationsAssignedToMultipleGroups[0]?.organization.id,
    "org-1"
  );
});

void test("contractor group observability detects organizations assigned to no groups", () => {
  const observability = buildContractorGroupObservability({
    groups: [makeGroup()],
    organizations
  });

  assert.deepEqual(
    observability.summary.organizationsAssignedToNoGroups.map(
      (organization) => organization.id
    ),
    ["org-2", "org-3"]
  );
});

void test("contractor group observability builds organization-centric summaries", () => {
  const observability = buildContractorGroupObservability({
    groups: [makeGroup()],
    organizations
  });

  const organizationSummary = observability.organizationSummaries.find(
    (summary) => summary.organization.id === "org-1"
  );

  assert.equal(organizationSummary?.activeGroupCount, 1);
  assert.equal(organizationSummary?.groups[0]?.assignmentSource, "manual");
  assert.equal(organizationSummary?.groups[0]?.assignedByUserId, "user-1");
});

void test("contractor group observability surfaces future starter-pack assignment references", () => {
  const observability = buildContractorGroupObservability({
    groups: [makeGroup()],
    organizations,
    starterPacks: [makeStarterPack()]
  });

  const groupDetail = observability.groupDetails[0];
  const organizationSummary = observability.organizationSummaries.find(
    (summary) => summary.organization.id === "org-1"
  );

  assert.equal(groupDetail?.starterPackAssignmentReferences.length, 1);
  assert.equal(
    groupDetail?.starterPackAssignmentReferences[0]?.starterPackName,
    "QA Pack"
  );
  assert.equal(organizationSummary?.starterPackAssignmentReferences.length, 1);
  assert.match(observability.note, /Read-only contractor group observability/);
});
