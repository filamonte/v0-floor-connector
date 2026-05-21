import test from "node:test";
import assert from "node:assert/strict";
import type { ContractorGroup } from "@floorconnector/types";

import { buildContractorGroupAssignmentAuditReadiness } from "./contractor-group-assignment-audit-readiness-core";

function makeGroup(overrides: Partial<ContractorGroup> = {}): ContractorGroup {
  return {
    id: "group-1",
    key: "priority-installers",
    name: "Priority Installers",
    description: "Beta rollout cohort",
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
        notes: "Manual QA assignment",
        createdAt: "2026-05-07T12:00:00.000Z"
      }
    ],
    createdAt: "2026-05-07T11:00:00.000Z",
    updatedAt: "2026-05-07T12:30:00.000Z",
    ...overrides
  };
}

void test("contractor group audit readiness infers group created events", () => {
  const readiness = buildContractorGroupAssignmentAuditReadiness({
    groups: [makeGroup({ memberships: [], membershipCount: 0 })]
  });

  assert.equal(readiness.summary.inferredGroupCreatedEvents, 1);
  assert.equal(
    readiness.events.some((event) => event.eventType === "group_created"),
    true
  );
  assert.match(readiness.note, /inferred from existing contractor group/);
});

void test("contractor group audit readiness infers organization assigned events", () => {
  const readiness = buildContractorGroupAssignmentAuditReadiness({
    groups: [makeGroup()]
  });
  const assignmentEvent = readiness.events.find(
    (event) => event.eventType === "organization_assigned"
  );

  assert.equal(readiness.summary.inferredOrganizationAssignedEvents, 1);
  assert.equal(assignmentEvent?.organizationId, "org-1");
  assert.equal(assignmentEvent?.performedByUserId, "user-1");
  assert.equal(assignmentEvent?.assignmentSource, "manual");
  assert.match(assignmentEvent?.caveat ?? "", /removed/);
});

void test("contractor group audit readiness documents removed assignment history gap", () => {
  const readiness = buildContractorGroupAssignmentAuditReadiness({
    groups: [makeGroup()]
  });

  assert.equal(readiness.summary.removedAssignmentHistoryAvailable, false);
  assert.equal(readiness.summary.durableAuditTableAvailable, true);
  assert.equal(
    readiness.caveats.some(
      (caveat) => caveat.key === "membership-removal-history-unavailable"
    ),
    true
  );
});

void test("contractor group audit readiness infers archived group caveat", () => {
  const readiness = buildContractorGroupAssignmentAuditReadiness({
    groups: [
      makeGroup({
        status: "archived",
        memberships: [],
        membershipCount: 0,
        updatedAt: "2026-05-07T13:00:00.000Z"
      })
    ]
  });
  const archiveEvent = readiness.events.find(
    (event) => event.eventType === "group_archived_inferred"
  );

  assert.equal(readiness.summary.inferredArchivedGroupEvents, 1);
  assert.equal(archiveEvent?.occurredAt, "2026-05-07T13:00:00.000Z");
  assert.match(archiveEvent?.caveat ?? "", /inferred/);
});

void test("contractor group audit readiness has no runtime effect", () => {
  const readiness = buildContractorGroupAssignmentAuditReadiness({
    groups: [makeGroup()]
  });

  assert.equal(readiness.summary.runtimeEffect, "none");
  assert.equal(
    readiness.caveats.some((caveat) => caveat.key === "no-runtime-effect"),
    true
  );
});
