import test from "node:test";
import assert from "node:assert/strict";

import type {
  PlatformPackageDefinition,
  PlatformPackageDefinitionAuditEvent,
  PlatformPackageDefinitionVersion
} from "@floorconnector/types";

import {
  buildPlatformPackageDefinitionLifecycleReadiness,
  type PlatformPackageDefinitionLifecycleReadinessInput
} from "./package-definition-lifecycle-readiness-core";

function makeDefinition(
  overrides: Partial<PlatformPackageDefinition> = {}
): PlatformPackageDefinition {
  return {
    id: "pkg-1",
    packageKey: "growth",
    displayName: "Growth",
    description: "For growing contractors.",
    status: "draft",
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
    status: "draft",
    commercialSummary: "Commercial terms are summarized only.",
    moduleVisibilityIntent: { modules: ["projects"] },
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
    publishedAt: null,
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
    eventType: "package_version_approved",
    actorUserId: null,
    reason: "Package version approved for future readiness evidence.",
    confirmationText: "READ ONLY",
    beforeSnapshot: { status: "review" },
    afterSnapshot: { status: "approved" },
    metadata: { summary: "safe evidence" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:00.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<PlatformPackageDefinitionLifecycleReadinessInput> = {}
): PlatformPackageDefinitionLifecycleReadinessInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    packageDefinitionId: "pkg-1",
    definition: makeDefinition(),
    versions: [makeVersion()],
    auditEvents: [makeAuditEvent()],
    ...overrides
  };
}

function transitionsById(input: PlatformPackageDefinitionLifecycleReadinessInput) {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(input);

  return new Map(model.transitions.map((row) => [row.id, row]));
}

void test("marks draft to internal review eligible when dimensions exist", () => {
  const rows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "draft" }),
      versions: [makeVersion({ status: "draft" })]
    })
  );

  assert.equal(rows.get("draft-to-internal-review")?.status, "eligible");
});

void test("marks internal review transitions eligible with approval evidence", () => {
  const rows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "review" }),
      versions: [makeVersion({ status: "review" })],
      auditEvents: [makeAuditEvent()]
    })
  );

  assert.equal(rows.get("internal-review-to-draft")?.status, "eligible");
  assert.equal(rows.get("internal-review-to-approved")?.status, "eligible");
});

void test("marks approved evidence to published eligible without adding approved schema status", () => {
  const rows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "review" }),
      versions: [
        makeVersion({
          status: "review",
          publishedSnapshot: { status: "approved-for-future-publish" }
        })
      ],
      auditEvents: [makeAuditEvent({ eventType: "package_version_approved" })]
    })
  );

  assert.equal(rows.get("approved-to-published")?.status, "eligible");
});

void test("marks published and deprecated cases eligible for next read-only transition", () => {
  const publishedRows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "published" }),
      versions: [
        makeVersion({
          status: "published",
          publishedAt: "2026-05-09T12:00:00.000Z"
        })
      ]
    })
  );
  const deprecatedRows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "deprecated" }),
      versions: [
        makeVersion({
          status: "deprecated",
          publishedAt: "2026-05-09T12:00:00.000Z",
          deprecatedAt: "2026-05-09T13:00:00.000Z"
        })
      ]
    })
  );

  assert.equal(publishedRows.get("published-to-deprecated")?.status, "eligible");
  assert.equal(
    deprecatedRows.get("deprecated-to-archived")?.status,
    "eligible"
  );
  assert.equal(
    publishedRows.get("published-superseded-by-new-version")?.status,
    "advisory"
  );
});

void test("blocks archived and published destructive-edit cases", () => {
  const archivedRows = transitionsById(
    makeInput({
      definition: makeDefinition({
        status: "archived",
        archivedAt: "2026-05-09T13:00:00.000Z"
      }),
      versions: [
        makeVersion({
          status: "archived",
          archivedAt: "2026-05-09T13:00:00.000Z"
        })
      ]
    })
  );
  const publishedRows = transitionsById(
    makeInput({
      definition: makeDefinition({ status: "published" }),
      versions: [
        makeVersion({
          status: "published",
          publishedAt: "2026-05-09T12:00:00.000Z"
        })
      ]
    })
  );

  assert.equal(archivedRows.get("approved-to-published")?.status, "blocked");
  assert.match(
    archivedRows.get("approved-to-published")?.reasons.join(" ") ?? "",
    /not directly publishable/
  );
  assert.equal(publishedRows.get("draft-to-archived")?.status, "blocked");
  assert.match(
    publishedRows.get("draft-to-archived")?.reasons.join(" ") ?? "",
    /cannot be destructively edited/
  );
});

void test("surfaces no-version and missing audit evidence caveats", () => {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(
    makeInput({ versions: [], auditEvents: [] })
  );

  assert.match(model.caveats.join(" "), /No versions exist/);
  assert.match(model.caveats.join(" "), /No active\/current version exists/);
  assert.match(model.caveats.join(" "), /No audit evidence available/);
});

void test("surfaces intent-only billing and entitlement caveats", () => {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(makeInput());

  assert.match(model.caveats.join(" "), /Billing\/provider mapping is intent-only/);
  assert.match(model.caveats.join(" "), /Entitlement\/module mapping is intent-only/);
  assert.match(model.caveats.join(" "), /runtime enforcement is not implemented/);
  assert.match(model.caveats.join(" "), /Package assignment is not implemented/);
});

void test("sets explicit no-behavior flags on model and transitions", () => {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(makeInput());

  assert.equal(model.actionAvailable, false);
  assert.equal(model.mutationAvailable, false);
  assert.equal(model.runtimeEffect, false);
  assert.equal(model.billingEffect, false);
  assert.equal(model.entitlementEffect, false);
  assert.equal(model.packageAssignmentEffect, false);

  for (const row of model.transitions) {
    assert.equal(row.actionAvailable, false);
    assert.equal(row.mutationAvailable, false);
    assert.equal(row.runtimeEffect, false);
    assert.equal(row.billingEffect, false);
    assert.equal(row.entitlementEffect, false);
    assert.equal(row.packageAssignmentEffect, false);
  }
});

void test("output contains no mutation control or form descriptor keys", () => {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"serverAction\""), false);
  assert.equal(serialized.includes("\"mutationControl\""), false);
});

void test("models unavailable package definition state safely", () => {
  const model = buildPlatformPackageDefinitionLifecycleReadiness(
    makeInput({
      definition: null,
      versions: [],
      auditEvents: [],
      unavailableReason: "Package definition source is unavailable."
    })
  );

  assert.equal(model.transitions[0]?.status, "unavailable");
  assert.match(model.caveats.join(" "), /Missing package definition/);
  assert.match(model.caveats.join(" "), /source is unavailable/);
});
