import test from "node:test";
import assert from "node:assert/strict";

import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

import {
  buildPlatformPackageDefinitionDetail,
  type PlatformPackageDefinitionDetailInput
} from "./package-definition-detail-core";

function makeDefinition(
  overrides: Partial<PlatformPackageDefinition> = {}
): PlatformPackageDefinition {
  return {
    id: "pkg-1",
    packageKey: "growth",
    displayName: "Growth",
    description: "For growing contractors.",
    status: "published",
    intendedAudience: "Established specialty contractors.",
    segmentSummary: "Commercial and residential teams.",
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    archivedAt: null,
    ...overrides
  };
}

function makeVersion(
  overrides: Partial<PlatformPackageDefinitionVersion> = {}
): PlatformPackageDefinitionVersion {
  return {
    id: "pkg-version-1",
    packageDefinitionId: "pkg-1",
    packageKey: "growth",
    packageDisplayName: "Growth",
    versionNumber: 1,
    versionLabel: "v1",
    status: "published",
    commercialSummary: "Commercial terms are summarized only.",
    moduleVisibilityIntent: { modules: ["projects"], mode: "summary" },
    usageLimitIntent: { seats: "future-intent-only" },
    entitlementIntent: { runtime: false },
    billingProviderIntent: { provider: "future" },
    starterPackDefaultIntent: { starterPacks: [] },
    contractorGroupTargetingIntent: { groups: [] },
    publishedSnapshot: { version: 1 },
    createdByUserId: null,
    updatedByUserId: null,
    createdAt: "2026-05-09T12:00:00.000Z",
    updatedAt: "2026-05-09T12:00:00.000Z",
    publishedAt: "2026-05-09T12:00:00.000Z",
    deprecatedAt: null,
    archivedAt: null,
    ...overrides
  };
}

function makeAuditEvent(
  overrides: Partial<PlatformPackageDefinitionAuditEvent> = {}
): PlatformPackageDefinitionAuditEvent {
  return {
    id: "audit-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: "pkg-version-1",
    eventType: "package_version_published",
    actorUserId: null,
    reason: "Package version reviewed for read-only evidence.",
    confirmationText: "READ ONLY",
    beforeSnapshot: { status: "review" },
    afterSnapshot: { status: "published" },
    metadata: { evidence: "summary-only" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:00.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<PlatformPackageDefinitionDetailInput> = {}
): PlatformPackageDefinitionDetailInput {
  return {
    generatedAt: "2026-05-09T12:00:00.000Z",
    packageDefinitionId: "pkg-1",
    definition: makeDefinition(),
    versions: [makeVersion()],
    auditEvents: [],
    ...overrides
  };
}

void test("builds read-only package definition detail summary with versions", () => {
  const model = buildPlatformPackageDefinitionDetail(makeInput());
  const byId = new Map(model.summaryCards.map((card) => [card.id, card]));

  assert.equal(model.found, true);
  assert.equal(model.packageKey, "growth");
  assert.equal(model.displayName, "Growth");
  assert.equal(byId.get("version-count")?.value, 1);
  assert.equal(byId.get("published-version-count")?.value, 1);
  assert.equal(model.versionRows[0]?.versionLabel, "v1");
  assert.equal(model.auditTimeline.eventRows.length, 0);
  assert.equal(model.lifecycleReadiness.readOnly, true);
  assert.equal(model.lifecycleReadiness.actionAvailable, false);
  assert.equal(model.lifecycleReadiness.mutationAvailable, false);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.lifecycleMutationControlsAvailable, false);
  assert.equal(model.assignmentBehaviorAvailable, false);
  assert.equal(model.billingBehaviorAvailable, false);
  assert.equal(model.entitlementRuntimeBehaviorAvailable, false);
});

void test("includes read-only audit timeline in detail model", () => {
  const model = buildPlatformPackageDefinitionDetail(
    makeInput({ auditEvents: [makeAuditEvent()] })
  );
  const auditCards = new Map(
    model.auditTimeline.summaryCards.map((card) => [card.id, card])
  );

  assert.equal(auditCards.get("audit-event-count")?.value, 1);
  assert.equal(model.auditTimeline.eventRows[0]?.eventType, "package_version_published");
  assert.equal(model.auditTimeline.readOnly, true);
  assert.equal(model.auditTimeline.approvalControlsAvailable, false);
});

void test("surfaces no-version and no-published-version caveats", () => {
  const model = buildPlatformPackageDefinitionDetail(
    makeInput({ versions: [] })
  );

  assert.equal(model.versionRows.length, 0);
  assert.match(model.caveats.join(" "), /No package definition versions/);
  assert.match(model.caveats.join(" "), /No published package definition version/);
});

void test("groups version lifecycle statuses for one definition", () => {
  const model = buildPlatformPackageDefinitionDetail(
    makeInput({
      versions: [
        makeVersion({ id: "version-1", status: "published" }),
        makeVersion({ id: "version-2", versionNumber: 2, status: "review" })
      ]
    })
  );
  const buckets = new Map(
    model.versionStatusBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(buckets.get("published"), 1);
  assert.equal(buckets.get("review"), 1);
});

void test("summarizes JSON intent snapshots without raw dumping values", () => {
  const model = buildPlatformPackageDefinitionDetail(makeInput());
  const moduleIntent = model.versionRows[0]?.intentSections.find(
    (section) => section.label === "Module visibility intent"
  );

  assert.equal(moduleIntent?.state, "present");
  assert.match(moduleIntent?.summary ?? "", /top-level fields recorded/);
  assert.match(moduleIntent?.summary ?? "", /Values are intentionally summarized/);
  assert.equal(JSON.stringify(model).includes("\"projects\""), false);
});

void test("output contains no mutation control or form descriptor keys", () => {
  const model = buildPlatformPackageDefinitionDetail(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
});

void test("models unavailable package definition state safely", () => {
  const model = buildPlatformPackageDefinitionDetail(
    makeInput({
      definition: null,
      versions: [],
      unavailableReason: "Package definition source is unavailable."
    })
  );

  assert.equal(model.found, false);
  assert.equal(model.packageDefinitionId, "pkg-1");
  assert.equal(model.status, "unavailable");
  assert.equal(model.lifecycleReadiness.transitions[0]?.status, "unavailable");
  assert.match(model.description, /No platform package definition/);
  assert.match(model.caveats.join(" "), /source is unavailable/);
});
