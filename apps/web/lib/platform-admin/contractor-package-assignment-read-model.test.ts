import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent
} from "@floorconnector/types";

import {
  buildContractorPackageAssignmentReadModel,
  type ContractorPackageAssignmentReadModelInput
} from "./contractor-package-assignment-read-model-core";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260509150945_contractor_package_assignments.sql"
);

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
  overrides: Partial<ContractorPackageAssignmentReadModelInput> = {}
): ContractorPackageAssignmentReadModelInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    assignments: [makeAssignment()],
    auditEvents: [makeAuditEvent()],
    ...overrides
  };
}

void test("builds contractor package assignment summary counts", () => {
  const model = buildContractorPackageAssignmentReadModel(makeInput());
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(byId.get("assignment-count")?.value, 1);
  assert.equal(byId.get("active-assignment-count")?.value, 1);
  assert.equal(byId.get("scheduled-assignment-count")?.value, 0);
  assert.equal(byId.get("missing-package-reference-count")?.value, 0);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.approvalControlsAvailable, false);
  assert.equal(model.activationControlsAvailable, false);
  assert.equal(model.assignmentActivationBehaviorAvailable, false);
  assert.equal(model.billingBehaviorAvailable, false);
  assert.equal(model.entitlementRuntimeBehaviorAvailable, false);
  assert.equal(model.contractorPermissionBehaviorAvailable, false);
});

void test("groups assignment lifecycle statuses", () => {
  const model = buildContractorPackageAssignmentReadModel(
    makeInput({
      assignments: [
        makeAssignment({ id: "assignment-1", status: "active", lifecycleState: "active" }),
        makeAssignment({
          id: "assignment-2",
          status: "scheduled",
          lifecycleState: "scheduled",
          scheduledFor: "2026-05-10T12:00:00.000Z",
          activatedAt: null
        }),
        makeAssignment({
          id: "assignment-3",
          status: "draft",
          lifecycleState: "draft",
          effectiveAt: null,
          activatedAt: null
        })
      ]
    })
  );
  const buckets = new Map(
    model.assignmentStatusBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(buckets.get("active"), 1);
  assert.equal(buckets.get("scheduled"), 1);
  assert.equal(buckets.get("draft"), 1);
});

void test("groups assignment audit event types", () => {
  const model = buildContractorPackageAssignmentReadModel(
    makeInput({
      auditEvents: [
        makeAuditEvent({
          id: "audit-approved",
          eventType: "package_assignment_approved"
        }),
        makeAuditEvent({
          id: "audit-activated",
          eventType: "package_assignment_activated"
        }),
        makeAuditEvent({
          id: "audit-activated-2",
          eventType: "package_assignment_activated",
          occurredAt: "2026-05-09T12:01:00.000Z"
        })
      ]
    })
  );
  const buckets = new Map(
    model.auditEventTypeBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(buckets.get("package_assignment_approved"), 1);
  assert.equal(buckets.get("package_assignment_activated"), 2);
});

void test("surfaces no active assignment and empty states", () => {
  const emptyModel = buildContractorPackageAssignmentReadModel(
    makeInput({ assignments: [], auditEvents: [] })
  );
  const draftOnlyModel = buildContractorPackageAssignmentReadModel(
    makeInput({
      assignments: [
        makeAssignment({
          status: "draft",
          lifecycleState: "draft",
          effectiveAt: null,
          activatedAt: null
        })
      ],
      auditEvents: []
    })
  );

  assert.match(emptyModel.assignmentReadiness.join(" "), /No contractor package assignments/);
  assert.match(draftOnlyModel.assignmentReadiness.join(" "), /No active contractor package assignments/);
});

void test("surfaces missing package and version caveats", () => {
  const model = buildContractorPackageAssignmentReadModel(
    makeInput({
      assignments: [
        makeAssignment({
          packageDefinitionId: null,
          packageDefinitionKey: null,
          packageDefinitionName: null,
          packageDefinitionVersionId: null,
          packageDefinitionVersionLabel: null,
          packageDefinitionVersionNumber: null,
          packageDefinitionVersionStatus: null
        })
      ],
      auditEvents: []
    })
  );

  assert.match(model.assignmentRows[0]?.caveats.join(" ") ?? "", /Missing package definition/);
  assert.match(model.assignmentRows[0]?.caveats.join(" ") ?? "", /Missing package definition version/);
  assert.match(model.assignmentReadiness.join(" "), /missing package definition or version/);
});

void test("summarizes snapshots without dumping raw values", () => {
  const model = buildContractorPackageAssignmentReadModel(makeInput());
  const row = model.assignmentRows[0];
  const serialized = JSON.stringify(model);

  assert.ok(row);
  assert.match(row?.assignmentSnapshotSummary ?? "", /top-level fields/);
  assert.match(row?.billingImpactSummary ?? "", /Values are summarized/);
  assert.match(row?.entitlementModuleImpactSummary ?? "", /top-level field/);
  assert.equal(serialized.includes("\"growth\""), false);
  assert.equal(serialized.includes("\"platform-admin\""), false);
});

void test("orders assignment audit timeline by occurrence then creation", () => {
  const model = buildContractorPackageAssignmentReadModel(
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

void test("output contains no mutation action or form descriptors", () => {
  const model = buildContractorPackageAssignmentReadModel(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"actionAvailable\""), false);
});

void test("migration constrains assignment schema and keeps tables server-only", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(migration, /create table if not exists public\.contractor_package_assignments/);
  assert.match(migration, /create table if not exists public\.contractor_package_assignment_audit_events/);
  assert.match(migration, /contractor_package_assignments_one_active_company_idx/);
  assert.match(migration, /status in \(\s*'draft'/);
  assert.match(migration, /'package_assignment_activated'/);
  assert.match(migration, /jsonb_typeof\(billing_impact_snapshot\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(entitlement_module_impact_snapshot\) = 'object'/);
  assert.match(migration, /alter table public\.contractor_package_assignments force row level security/);
  assert.match(migration, /alter table public\.contractor_package_assignment_audit_events force row level security/);
  assert.match(migration, /revoke all on table public\.contractor_package_assignments from authenticated/);
  assert.match(migration, /revoke all on table public\.contractor_package_assignment_audit_events from authenticated/);
  assert.doesNotMatch(migration, /create or replace function/i);
});
