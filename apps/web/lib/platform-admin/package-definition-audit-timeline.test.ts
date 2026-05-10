import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { PlatformPackageDefinitionAuditEvent } from "@floorconnector/types";

import {
  buildPlatformPackageDefinitionAuditTimeline,
  type PlatformPackageDefinitionAuditTimelineInput
} from "./package-definition-audit-timeline-core";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260509143550_package_definition_audit_events.sql"
);

function makeEvent(
  overrides: Partial<PlatformPackageDefinitionAuditEvent> = {}
): PlatformPackageDefinitionAuditEvent {
  return {
    id: "audit-1",
    packageDefinitionId: "pkg-1",
    packageDefinitionVersionId: null,
    eventType: "package_definition_created",
    actorUserId: "user-1",
    reason: "Initial package definition evidence.",
    confirmationText: "READ ONLY",
    beforeSnapshot: null,
    afterSnapshot: { packageKey: "growth", displayName: "Growth" },
    metadata: { source: "platform-admin" },
    occurredAt: "2026-05-09T12:00:00.000Z",
    createdAt: "2026-05-09T12:00:01.000Z",
    ...overrides
  };
}

function makeInput(
  overrides: Partial<PlatformPackageDefinitionAuditTimelineInput> = {}
): PlatformPackageDefinitionAuditTimelineInput {
  return {
    generatedAt: "2026-05-09T12:30:00.000Z",
    packageDefinitionId: "pkg-1",
    events: [makeEvent()],
    ...overrides
  };
}

void test("orders audit timeline events by occurrence then creation", () => {
  const model = buildPlatformPackageDefinitionAuditTimeline(
    makeInput({
      events: [
        makeEvent({
          id: "audit-old",
          eventType: "package_definition_created",
          occurredAt: "2026-05-09T12:00:00.000Z",
          createdAt: "2026-05-09T12:00:01.000Z"
        }),
        makeEvent({
          id: "audit-new",
          eventType: "package_version_published",
          packageDefinitionVersionId: "version-1",
          occurredAt: "2026-05-09T12:10:00.000Z",
          createdAt: "2026-05-09T12:10:01.000Z"
        })
      ]
    })
  );

  assert.equal(model.eventRows[0]?.id, "audit-new");
  assert.equal(model.eventRows[1]?.id, "audit-old");
});

void test("counts audit events by event type", () => {
  const model = buildPlatformPackageDefinitionAuditTimeline(
    makeInput({
      events: [
        makeEvent({ eventType: "package_definition_created" }),
        makeEvent({
          id: "audit-2",
          eventType: "package_version_published",
          packageDefinitionVersionId: "version-1"
        }),
        makeEvent({
          id: "audit-3",
          eventType: "package_version_published",
          packageDefinitionVersionId: "version-2"
        })
      ]
    })
  );
  const buckets = new Map(
    model.eventTypeBuckets.map((bucket) => [bucket.key, bucket.count])
  );

  assert.equal(buckets.get("package_definition_created"), 1);
  assert.equal(buckets.get("package_version_published"), 2);
});

void test("surfaces empty audit state and caveats", () => {
  const model = buildPlatformPackageDefinitionAuditTimeline(
    makeInput({ events: [] })
  );

  assert.equal(model.eventRows.length, 0);
  assert.match(model.caveats.join(" "), /No package definition audit events/);
  assert.equal(model.readOnly, true);
  assert.equal(model.mutationControlsAvailable, false);
  assert.equal(model.lifecycleMutationControlsAvailable, false);
  assert.equal(model.approvalControlsAvailable, false);
  assert.equal(model.assignmentBehaviorAvailable, false);
  assert.equal(model.billingBehaviorAvailable, false);
  assert.equal(model.entitlementRuntimeBehaviorAvailable, false);
});

void test("summarizes snapshot and metadata keys without dumping values", () => {
  const model = buildPlatformPackageDefinitionAuditTimeline(makeInput());
  const row = model.eventRows[0];
  const serialized = JSON.stringify(model);

  assert.ok(row);
  assert.match(row?.afterSnapshotSummary ?? "", /top-level fields/);
  assert.match(row?.metadataSummary ?? "", /source/);
  assert.equal(serialized.includes("\"Growth\""), false);
  assert.equal(serialized.includes("\"platform-admin\""), false);
});

void test("output contains no mutation or action fields", () => {
  const model = buildPlatformPackageDefinitionAuditTimeline(makeInput());
  const serialized = JSON.stringify(model);

  assert.equal(serialized.includes("\"href\""), false);
  assert.equal(serialized.includes("\"method\""), false);
  assert.equal(serialized.includes("\"buttonLabel\""), false);
  assert.equal(serialized.includes("\"formAction\""), false);
  assert.equal(serialized.includes("\"actionAvailable\""), false);
});

void test("migration constrains package definition audit evidence table", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(
    migration,
    /create table if not exists public\.platform_package_definition_audit_events/
  );
  assert.match(migration, /platform_package_definition_audit_events_type_check/);
  assert.match(migration, /'package_definition_published'/);
  assert.match(migration, /'package_version_archived'/);
  assert.match(migration, /jsonb_typeof\(before_snapshot\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(after_snapshot\) = 'object'/);
  assert.match(migration, /jsonb_typeof\(metadata\) = 'object'/);
  assert.match(
    migration,
    /alter table public\.platform_package_definition_audit_events force row level security/
  );
  assert.match(
    migration,
    /revoke all on table public\.platform_package_definition_audit_events from authenticated/
  );
  assert.doesNotMatch(migration, /create or replace function/i);
});
