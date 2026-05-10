import test from "node:test";
import assert from "node:assert/strict";

import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent
} from "@floorconnector/types";

import {
  buildContractorPackageAssignmentActivationReadiness,
  type ContractorPackageAssignmentActivationReadinessInput
} from "./contractor-package-assignment-activation-readiness-core";

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
    status: "draft",
    lifecycleState: "draft",
    effectiveAt: "2026-05-09T12:00:00.000Z",
    scheduledFor: "2026-05-10T12:00:00.000Z",
    activatedAt: null,
    supersededAt: null,
    canceledAt: null,
    supersedesAssignmentId: null,
    supersededByAssignmentId: null,
    assignmentSnapshot: { package: "growth", company: "acme" },
    billingImpactSnapshot: { mode: "intent-only" },
    entitlementModuleImpactSnapshot: { runtime: false },
    starterPackImplicationSnapshot: { provision: false },
    cancellationReason: "Customer canceled early access.",
    supersessionReason: "New package version is ready.",
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
    eventType: "package_assignment_reviewed",
    actorUserId: null,
    reason: "Assignment reviewed.",
    confirmationText: "READ ONLY",
    beforeSnapshot: { status: "draft" },
    afterSnapshot: { status: "pending_review" },
    metadata: { source: "platform-admin" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:01.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<ContractorPackageAssignmentActivationReadinessInput> = {}
): ContractorPackageAssignmentActivationReadinessInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    assignmentId: "assignment-1",
    assignment: makeAssignment(),
    auditEvents: [makeAuditEvent()],
    relatedAssignments: [],
    ...overrides
  };
}

function transitionsById(
  input: ContractorPackageAssignmentActivationReadinessInput
) {
  const model = buildContractorPackageAssignmentActivationReadiness(input);

  return new Map(model.transitions.map((row) => [row.id, row]));
}

void test("marks draft to pending review eligible", () => {
  const rows = transitionsById(
    makeInput({ assignment: makeAssignment({ status: "draft" }) })
  );

  assert.equal(rows.get("draft-to-pending-review")?.status, "eligible");
});

void test("marks pending review transitions eligible with audit evidence", () => {
  const rows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "pending_review",
        lifecycleState: "pending_review"
      })
    })
  );

  assert.equal(rows.get("pending-review-to-draft")?.status, "eligible");
  assert.equal(rows.get("pending-review-to-approved")?.status, "eligible");
});

void test("marks approved schedule and activation readiness", () => {
  const rows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "approved",
        lifecycleState: "approved"
      })
    })
  );

  assert.equal(rows.get("approved-to-scheduled")?.status, "eligible");
  assert.equal(rows.get("approved-to-active")?.status, "eligible");
});

void test("marks scheduled to active eligible when timing exists", () => {
  const rows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "scheduled",
        lifecycleState: "scheduled"
      })
    })
  );

  assert.equal(rows.get("scheduled-to-active")?.status, "eligible");
});

void test("marks active cancellation and supersession readiness", () => {
  const rows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "active",
        lifecycleState: "active",
        activatedAt: "2026-05-09T12:00:00.000Z",
        supersededByAssignmentId: "assignment-2"
      })
    })
  );

  assert.equal(rows.get("active-to-superseded")?.status, "eligible");
  assert.equal(rows.get("active-to-canceled")?.status, "eligible");
});

void test("marks canceled and superseded archive readiness", () => {
  const canceledRows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "canceled",
        lifecycleState: "canceled",
        canceledAt: "2026-05-09T13:00:00.000Z",
        archivedAt: "2026-05-09T14:00:00.000Z"
      })
    })
  );
  const supersededRows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "superseded",
        lifecycleState: "superseded",
        supersededAt: "2026-05-09T13:00:00.000Z",
        supersededByAssignmentId: "assignment-2",
        archivedAt: "2026-05-09T14:00:00.000Z"
      })
    })
  );

  assert.equal(canceledRows.get("canceled-to-archived")?.status, "eligible");
  assert.equal(supersededRows.get("superseded-to-archived")?.status, "eligible");
});

void test("blocks active conflict case", () => {
  const rows = transitionsById(
    makeInput({
      assignment: makeAssignment({
        status: "approved",
        lifecycleState: "approved"
      }),
      relatedAssignments: [
        makeAssignment({
          id: "assignment-2",
          status: "active",
          lifecycleState: "active",
          activatedAt: "2026-05-08T12:00:00.000Z"
        })
      ]
    })
  );

  assert.equal(rows.get("approved-to-active")?.status, "blocked");
  assert.match(
    rows.get("approved-to-active")?.reasons.join(" ") ?? "",
    /Existing active assignment conflict/
  );
});

void test("surfaces missing package definition and version caveats", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(
    makeInput({
      assignment: makeAssignment({
        packageDefinitionId: null,
        packageDefinitionVersionId: null,
        packageDefinitionVersionStatus: null
      })
    })
  );

  assert.match(model.caveats.join(" "), /Missing package definition/);
  assert.match(model.caveats.join(" "), /Missing package version/);
});

void test("surfaces missing effective and scheduled date caveats", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(
    makeInput({
      assignment: makeAssignment({
        status: "scheduled",
        lifecycleState: "scheduled",
        effectiveAt: null,
        scheduledFor: null
      })
    })
  );

  assert.match(model.caveats.join(" "), /Effective date missing/);
  assert.match(model.caveats.join(" "), /Scheduled date missing/);
});

void test("surfaces missing audit evidence caveat", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(
    makeInput({ auditEvents: [] })
  );

  assert.match(model.caveats.join(" "), /No audit evidence available/);
});

void test("surfaces intent-only billing and entitlement caveats", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(makeInput());

  assert.match(model.caveats.join(" "), /Billing\/provider mapping is not implemented/);
  assert.match(model.caveats.join(" "), /Entitlement\/module mapping is not implemented/);
  assert.match(model.caveats.join(" "), /Runtime enforcement is not implemented/);
});

void test("sets explicit no-behavior flags on model and transitions", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(makeInput());

  assert.equal(model.actionAvailable, false);
  assert.equal(model.mutationAvailable, false);
  assert.equal(model.runtimeEffect, false);
  assert.equal(model.billingEffect, false);
  assert.equal(model.entitlementEffect, false);
  assert.equal(model.contractorPermissionEffect, false);
  assert.equal(model.packageAssignmentWriteAvailable, false);

  for (const row of model.transitions) {
    assert.equal(row.actionAvailable, false);
    assert.equal(row.mutationAvailable, false);
    assert.equal(row.runtimeEffect, false);
    assert.equal(row.billingEffect, false);
    assert.equal(row.entitlementEffect, false);
    assert.equal(row.contractorPermissionEffect, false);
    assert.equal(row.packageAssignmentWriteAvailable, false);
  }
});

void test("output contains no mutation action or form descriptor keys", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
});

void test("models unavailable assignment state safely", () => {
  const model = buildContractorPackageAssignmentActivationReadiness(
    makeInput({
      assignment: null,
      auditEvents: [],
      unavailableReason: "Assignment source is unavailable."
    })
  );

  assert.equal(model.transitions[0]?.status, "unavailable");
  assert.match(model.caveats.join(" "), /Assignment source is unavailable/);
  assert.match(model.operatorGuidance.join(" "), /known assignment/);
});
