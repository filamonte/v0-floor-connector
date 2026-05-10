import test from "node:test";
import assert from "node:assert/strict";

import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent
} from "@floorconnector/types";

import {
  buildContractorPackageAssignmentDetail,
  type ContractorPackageAssignmentDetailInput
} from "./contractor-package-assignment-detail-core";

function makeAssignment(
  overrides: Partial<ContractorPackageAssignment> = {}
): ContractorPackageAssignment {
  return {
    id: "assignment-1",
    companyId: "company-1",
    companyName: "Acme Floors",
    companySlug: "acme-floors",
    packageDefinitionId: "pkg-1",
    packageDefinitionKey: "growth",
    packageDefinitionName: "Growth",
    packageDefinitionVersionId: "pkg-version-1",
    packageDefinitionVersionLabel: "v1",
    packageDefinitionVersionNumber: 1,
    packageDefinitionVersionStatus: "published",
    status: "active",
    lifecycleState: "active",
    effectiveAt: "2026-05-09T12:00:00.000Z",
    scheduledFor: null,
    activatedAt: "2026-05-09T12:00:00.000Z",
    supersededAt: null,
    canceledAt: null,
    supersedesAssignmentId: null,
    supersededByAssignmentId: null,
    assignmentSnapshot: { package: "growth", company: "acme" },
    billingImpactSnapshot: { mode: "intent-only" },
    entitlementModuleImpactSnapshot: { runtime: false },
    starterPackImplicationSnapshot: { provision: false },
    cancellationReason: null,
    supersessionReason: null,
    grandfatheredContract: false,
    customContractLabel: null,
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    archivedAt: null,
    ...overrides
  };
}

function makeAuditEvent(
  overrides: Partial<ContractorPackageAssignmentAuditEvent> = {}
): ContractorPackageAssignmentAuditEvent {
  return {
    id: "assignment-audit-1",
    contractorPackageAssignmentId: "assignment-1",
    companyId: "company-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: "pkg-version-1",
    eventType: "package_assignment_activated",
    actorUserId: null,
    reason: "Assignment inspected for read-only evidence.",
    confirmationText: "READ ONLY",
    beforeSnapshot: { status: "approved" },
    afterSnapshot: { status: "active" },
    metadata: { source: "platform-admin" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:01.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<ContractorPackageAssignmentDetailInput> = {}
): ContractorPackageAssignmentDetailInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    assignmentId: "assignment-1",
    assignment: makeAssignment(),
    auditEvents: [makeAuditEvent()],
    ...overrides
  };
}

void test("builds assignment detail summary with linked labels", () => {
  const model = buildContractorPackageAssignmentDetail(makeInput());
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(model.found, true);
  assert.equal(model.assignmentId, "assignment-1");
  assert.equal(model.companyLabel, "Acme Floors");
  assert.equal(model.packageDefinitionLabel, "Growth");
  assert.equal(model.packageDefinitionVersionLabel, "v1");
  assert.equal(model.packageDefinitionVersionStatus, "published");
  assert.equal(byId.get("assignment-status")?.value, "Active");
  assert.equal(byId.get("audit-event-count")?.value, 1);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.approvalControlsAvailable, false);
  assert.equal(model.scheduleControlsAvailable, false);
  assert.equal(model.activationControlsAvailable, false);
  assert.equal(model.cancellationControlsAvailable, false);
  assert.equal(model.assignmentActivationBehaviorAvailable, false);
  assert.equal(model.billingBehaviorAvailable, false);
  assert.equal(model.entitlementRuntimeBehaviorAvailable, false);
  assert.equal(model.contractorPermissionBehaviorAvailable, false);
});

void test("surfaces missing package and version links", () => {
  const model = buildContractorPackageAssignmentDetail(
    makeInput({
      assignment: makeAssignment({
        packageDefinitionId: null,
        packageDefinitionKey: null,
        packageDefinitionName: null,
        packageDefinitionVersionId: null,
        packageDefinitionVersionLabel: null,
        packageDefinitionVersionNumber: null,
        packageDefinitionVersionStatus: null
      }),
      auditEvents: []
    })
  );

  assert.equal(model.packageDefinitionLabel, "No package definition reference");
  assert.equal(model.packageDefinitionVersionLabel, "No package version reference");
  assert.match(model.caveats.join(" "), /missing a package definition reference/i);
  assert.match(model.caveats.join(" "), /missing a package definition version/i);
});

void test("surfaces no audit events caveat", () => {
  const model = buildContractorPackageAssignmentDetail(
    makeInput({ auditEvents: [] })
  );

  assert.equal(model.auditTimelineRows.length, 0);
  assert.match(model.caveats.join(" "), /No assignment audit evidence/);
});

void test("orders assignment audit events by occurrence then creation", () => {
  const model = buildContractorPackageAssignmentDetail(
    makeInput({
      auditEvents: [
        makeAuditEvent({
          id: "audit-old",
          eventType: "package_assignment_drafted",
          occurredAt: "2026-05-09T12:00:00.000Z",
          createdAt: "2026-05-09T12:00:01.000Z"
        }),
        makeAuditEvent({
          id: "audit-new",
          eventType: "package_assignment_activated",
          occurredAt: "2026-05-09T12:10:00.000Z",
          createdAt: "2026-05-09T12:10:01.000Z"
        })
      ]
    })
  );

  assert.equal(model.auditTimelineRows[0]?.id, "audit-new");
  assert.equal(model.auditTimelineRows[1]?.id, "audit-old");
});

void test("surfaces lifecycle status caveats", () => {
  const canceled = buildContractorPackageAssignmentDetail(
    makeInput({
      assignment: makeAssignment({
        status: "canceled",
        lifecycleState: "canceled",
        canceledAt: "2026-05-09T12:00:00.000Z",
        cancellationReason: "Contract ended.",
        activatedAt: null
      })
    })
  );
  const superseded = buildContractorPackageAssignmentDetail(
    makeInput({
      assignment: makeAssignment({
        status: "superseded",
        lifecycleState: "superseded",
        supersededAt: "2026-05-09T12:00:00.000Z",
        supersessionReason: "New package version.",
        activatedAt: null
      })
    })
  );

  assert.match(canceled.caveats.join(" "), /canceled/);
  assert.match(superseded.caveats.join(" "), /superseded/);
});

void test("summarizes snapshots without dumping raw values", () => {
  const model = buildContractorPackageAssignmentDetail(makeInput());
  const serialized = JSON.stringify(model);

  assert.match(
    model.snapshotSections.find((section) => section.key === "assignment-snapshot")
      ?.summary ?? "",
    /top-level fields/
  );
  assert.match(serialized, /Values are summarized/);
  assert.equal(serialized.includes("\"acme\""), false);
  assert.equal(serialized.includes("\"platform-admin\""), false);
});

void test("output contains no mutation action or form descriptor keys", () => {
  const model = buildContractorPackageAssignmentDetail(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
  assert.equal(model.activationReadiness.actionAvailable, false);
});

void test("models unavailable assignment state safely", () => {
  const model = buildContractorPackageAssignmentDetail(
    makeInput({
      assignment: null,
      auditEvents: [],
      unavailableReason: "Assignment source is unavailable."
    })
  );

  assert.equal(model.found, false);
  assert.equal(model.status, "unavailable");
  assert.equal(model.companyLabel, "Assignment unavailable");
  assert.match(model.caveats.join(" "), /source is unavailable/);
  assert.match(model.operatorGuidance.join(" "), /known assignment/);
});
