import test from "node:test";
import assert from "node:assert/strict";
import type {
  PlatformStarterPack,
  PlatformStarterPackAssignment
} from "@floorconnector/types";

import {
  buildStarterPackTargetingPreview,
  explainStarterPackAssignmentTargeting,
  type StarterPackTargetingOrganization
} from "./starter-pack-targeting-core";

const organization: StarterPackTargetingOrganization = {
  id: "org-1",
  name: "Acme Floors",
  slug: "acme-floors",
  tenantStatus: "active",
  lifecycleState: "active",
  stateRegion: "TX",
  primaryTrade: "Residential Epoxy",
  planKey: "pro",
  planName: "Pro"
};
const organizationWithContractorGroup: StarterPackTargetingOrganization = {
  ...organization,
  contractorGroups: [
    {
      id: "group-1",
      key: "priority-installers",
      name: "Priority Installers",
      status: "active",
      groupType: "beta"
    }
  ]
};

function makeAssignment(
  overrides: Partial<PlatformStarterPackAssignment> = {}
): PlatformStarterPackAssignment {
  return {
    id: "assignment-1",
    starterPackId: "pack-1",
    assignmentType: "all_organizations",
    organizationId: null,
    organizationName: null,
    organizationSlug: null,
    assignmentKey: null,
    label: null,
    status: "active",
    notes: null,
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

function makePack(
  overrides: Partial<PlatformStarterPack> = {}
): PlatformStarterPack {
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
    assignments: [makeAssignment()],
    createdAt: "2026-05-06T00:00:00.000Z",
    updatedAt: "2026-05-06T00:00:00.000Z",
    ...overrides
  };
}

void test("starter-pack targeting matches active all-organization intent for active organizations", () => {
  const result = explainStarterPackAssignmentTargeting({
    organization,
    assignment: makeAssignment()
  });

  assert.equal(result.status, "matched");
  assert.match(result.reason, /active all-organizations intent/);
});

void test("starter-pack targeting matches exact organization intent only", () => {
  const matching = explainStarterPackAssignmentTargeting({
    organization,
    assignment: makeAssignment({
      assignmentType: "organization",
      organizationId: "org-1",
      organizationName: "Acme Floors"
    })
  });
  const nonMatching = explainStarterPackAssignmentTargeting({
    organization,
    assignment: makeAssignment({
      assignmentType: "organization",
      organizationId: "org-2",
      organizationName: "Other Floors"
    })
  });

  assert.equal(matching.status, "matched");
  assert.equal(nonMatching.status, "not_matched");
});

void test("starter-pack targeting uses existing region, trade, and plan metadata when available", () => {
  assert.equal(
    explainStarterPackAssignmentTargeting({
      organization,
      assignment: makeAssignment({
        assignmentType: "region",
        assignmentKey: "tx"
      })
    }).status,
    "matched"
  );
  assert.equal(
    explainStarterPackAssignmentTargeting({
      organization,
      assignment: makeAssignment({
        assignmentType: "trade_segment",
        assignmentKey: "residential-epoxy"
      })
    }).status,
    "matched"
  );
  assert.equal(
    explainStarterPackAssignmentTargeting({
      organization,
      assignment: makeAssignment({
        assignmentType: "plan_tier",
        assignmentKey: "pro"
      })
    }).status,
    "matched"
  );
});

void test("starter-pack targeting marks missing targeting data unavailable", () => {
  assert.equal(
    explainStarterPackAssignmentTargeting({
      organization: { ...organization, stateRegion: null },
      assignment: makeAssignment({
        assignmentType: "region",
        assignmentKey: "tx"
      })
    }).status,
    "unavailable"
  );
  assert.equal(
    explainStarterPackAssignmentTargeting({
      organization,
      assignment: makeAssignment({
        assignmentType: "onboarding_profile",
        assignmentKey: "fast-start"
      })
    }).status,
    "unavailable"
  );
});

void test("starter-pack targeting resolves explicit contractor group membership without enforcement", () => {
  const matching = explainStarterPackAssignmentTargeting({
    organization: organizationWithContractorGroup,
    assignment: makeAssignment({
      assignmentType: "future_contractor_group",
      assignmentKey: "priority-installers"
    })
  });
  const nonMatching = explainStarterPackAssignmentTargeting({
    organization: organizationWithContractorGroup,
    assignment: makeAssignment({
      assignmentType: "future_contractor_group",
      assignmentKey: "commercial-beta"
    })
  });
  const unavailable = explainStarterPackAssignmentTargeting({
    organization,
    assignment: makeAssignment({
      assignmentType: "future_contractor_group",
      assignmentKey: "priority-installers"
    })
  });

  assert.equal(matching.status, "matched");
  assert.match(matching.reason, /planning-only/);
  assert.equal(nonMatching.status, "not_matched");
  assert.equal(unavailable.status, "unavailable");
});

void test("starter-pack targeting treats inactive or archived contractor groups as possible planning matches", () => {
  for (const status of ["inactive", "archived"] as const) {
    assert.equal(
      explainStarterPackAssignmentTargeting({
        organization: {
          ...organization,
          contractorGroups: [
            {
              id: "group-1",
              key: "priority-installers",
              name: "Priority Installers",
              status,
              groupType: "beta"
            }
          ]
        },
        assignment: makeAssignment({
          assignmentType: "future_contractor_group",
          assignmentKey: "priority-installers"
        })
      }).status,
      "possible_match"
    );
  }
});

void test("starter-pack targeting preview separates matched and unmatched packs without mutation", () => {
  const preview = buildStarterPackTargetingPreview({
    organization,
    starterPacks: [
      makePack(),
      makePack({
        id: "pack-2",
        packKey: "other-pack",
        assignments: [
          makeAssignment({
            id: "assignment-2",
            starterPackId: "pack-2",
            assignmentType: "region",
            assignmentKey: "CA"
          })
        ]
      })
    ]
  });

  assert.equal(preview.matchedStarterPacks.length, 1);
  assert.equal(preview.unmatchedStarterPacks.length, 1);
  assert.match(preview.note, /Planning only/);
});
