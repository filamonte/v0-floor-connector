import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ContractorGroup,
  ContractorGroupAuditEvent
} from "@floorconnector/types";

import {
  buildContractorGroupAuditObservability,
  buildContractorGroupAuditMetadata,
  buildContractorGroupAuditTimeline,
  contractorGroupAuditEventLabel,
  contractorGroupAuditEventTypeForStatusTransition,
  summarizeSafeMetadata
} from "./contractor-group-audit-events-core";

const migrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260507191344_contractor_group_audit_events.sql"
);

function makeEvent(
  overrides: Partial<ContractorGroupAuditEvent> = {}
): ContractorGroupAuditEvent {
  return {
    id: "event-1",
    contractorGroupId: "group-1",
    contractorGroupKey: "priority-installers",
    contractorGroupName: "Priority Installers",
    organizationId: "org-1",
    organizationName: "Acme Floors",
    organizationSlug: "acme-floors",
    membershipId: "membership-1",
    actorUserId: "user-1",
    eventType: "organization_assigned",
    assignmentSource: "manual",
    reason: "QA assignment",
    metadata: {
      previousStatus: "none",
      newStatus: "assigned",
      nested: { ignored: true }
    },
    occurredAt: "2026-05-07T12:00:00.000Z",
    ...overrides
  };
}

function makeGroup(overrides: Partial<ContractorGroup> = {}): ContractorGroup {
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

void test("contractor group audit event labels are operator-readable", () => {
  assert.equal(
    contractorGroupAuditEventLabel("organization_assigned"),
    "Organization assigned"
  );
  assert.equal(contractorGroupAuditEventLabel("group_archived"), "Group archived");
});

void test("contractor group audit event type follows status transition", () => {
  assert.equal(
    contractorGroupAuditEventTypeForStatusTransition({
      oldStatus: null,
      newStatus: "active"
    }),
    "group_created"
  );
  assert.equal(
    contractorGroupAuditEventTypeForStatusTransition({
      oldStatus: "inactive",
      newStatus: "active"
    }),
    "group_activated"
  );
  assert.equal(
    contractorGroupAuditEventTypeForStatusTransition({
      oldStatus: "active",
      newStatus: "inactive"
    }),
    "group_deactivated"
  );
  assert.equal(
    contractorGroupAuditEventTypeForStatusTransition({
      oldStatus: "active",
      newStatus: "archived"
    }),
    "group_archived"
  );
  assert.equal(
    contractorGroupAuditEventTypeForStatusTransition({
      oldStatus: "active",
      newStatus: "active"
    }),
    "group_updated"
  );
});

void test("contractor group audit metadata shaping keeps safe scalar values", () => {
  assert.deepEqual(
    buildContractorGroupAuditMetadata({
      oldName: "Old group",
      newName: "New group",
      oldStatus: "active",
      newStatus: "inactive",
      oldGroupType: null,
      organizationLabel: "Acme Floors",
      notesPresent: false
    }),
    {
      oldName: "Old group",
      newName: "New group",
      oldStatus: "active",
      newStatus: "inactive",
      organizationLabel: "Acme Floors",
      notesPresent: false
    }
  );
});

void test("contractor group assignment and removal metadata captures safe context", () => {
  assert.deepEqual(
    buildContractorGroupAuditMetadata({
      organizationLabel: "Acme Floors",
      organizationTenantStatus: "active",
      oldAssignmentSource: "manual",
      newAssignmentSource: "targeting_preview",
      removedMembershipId: "membership-1",
      notesPresent: true
    }),
    {
      organizationLabel: "Acme Floors",
      organizationTenantStatus: "active",
      oldAssignmentSource: "manual",
      newAssignmentSource: "targeting_preview",
      removedMembershipId: "membership-1",
      notesPresent: true
    }
  );
});

void test("contractor group audit timeline orders newest first and counts event classes", () => {
  const timeline = buildContractorGroupAuditTimeline({
    events: [
      makeEvent({ id: "older", occurredAt: "2026-05-07T10:00:00.000Z" }),
      makeEvent({
        id: "newer",
        eventType: "group_updated",
        organizationId: null,
        organizationName: null,
        organizationSlug: null,
        membershipId: null,
        assignmentSource: null,
        occurredAt: "2026-05-07T13:00:00.000Z"
      })
    ]
  });

  assert.equal(timeline.events[0]?.id, "newer");
  assert.equal(timeline.summary.totalEvents, 2);
  assert.equal(timeline.summary.assignmentEvents, 1);
  assert.equal(timeline.summary.groupLifecycleEvents, 1);
  assert.equal(timeline.summary.runtimeEffect, "none");
});

void test("contractor group audit observability summarizes event counts and metadata coverage", () => {
  const observability = buildContractorGroupAuditObservability({
    groups: [makeGroup()],
    events: [
      makeEvent(),
      makeEvent({
        id: "event-2",
        eventType: "organization_removed",
        assignmentSource: "manual",
        membershipId: "membership-1",
        metadata: {},
        occurredAt: "2026-05-07T13:00:00.000Z"
      }),
      makeEvent({
        id: "event-3",
        eventType: "group_updated",
        organizationId: null,
        organizationName: null,
        organizationSlug: null,
        membershipId: null,
        assignmentSource: null,
        occurredAt: "2026-05-07T14:00:00.000Z"
      })
    ]
  });

  assert.equal(observability.summary.totalEvents, 3);
  assert.equal(observability.summary.eventsByType.organization_assigned, 1);
  assert.equal(observability.summary.eventsByType.organization_removed, 1);
  assert.equal(observability.summary.eventsByAssignmentSource.manual, 2);
  assert.equal(observability.summary.metadataPresentCount, 2);
  assert.equal(observability.summary.metadataAbsentCount, 1);
  assert.equal(observability.summary.runtimeEffect, "none");
  assert.equal(observability.summary.recentEvents[0]?.id, "event-3");
});

void test("contractor group audit observability detects missing expected context", () => {
  const observability = buildContractorGroupAuditObservability({
    groups: [],
    events: [
      makeEvent({
        id: "missing-group",
        contractorGroupId: null,
        contractorGroupKey: null,
        contractorGroupName: null
      }),
      makeEvent({
        id: "missing-organization",
        organizationId: null,
        organizationName: null,
        organizationSlug: null
      })
    ]
  });

  assert.deepEqual(
    observability.summary.missingContextIssues.map((issue) => issue.id),
    [
      "missing-group:missing-group",
      "missing-organization:missing-organization"
    ]
  );
});

void test("contractor group audit observability builds group-centric timeline summary", () => {
  const observability = buildContractorGroupAuditObservability({
    groups: [makeGroup()],
    events: [
      makeEvent({ id: "assigned", eventType: "organization_assigned" }),
      makeEvent({
        id: "removed",
        eventType: "organization_removed",
        occurredAt: "2026-05-07T13:00:00.000Z"
      })
    ]
  });

  const groupSummary = observability.groupSummaries[0];

  assert.equal(groupSummary?.totalEvents, 2);
  assert.equal(groupSummary?.assignmentEventCount, 2);
  assert.equal(groupSummary?.removalEventCount, 1);
  assert.equal(groupSummary?.currentMembershipCount, 1);
  assert.match(groupSummary?.caveats[0] ?? "", /Removed memberships/);
  assert.equal(groupSummary?.timeline[0]?.id, "removed");
});

void test("contractor group audit observability builds organization-centric history", () => {
  const observability = buildContractorGroupAuditObservability({
    groups: [makeGroup()],
    events: [
      makeEvent({ id: "assigned", eventType: "organization_assigned" }),
      makeEvent({
        id: "removed",
        eventType: "organization_removed",
        occurredAt: "2026-05-07T13:00:00.000Z"
      })
    ]
  });

  const organizationSummary = observability.organizationSummaries.find(
    (summary) => summary.organizationId === "org-1"
  );

  assert.equal(organizationSummary?.currentMemberships.length, 1);
  assert.equal(organizationSummary?.assignmentEventCount, 2);
  assert.equal(organizationSummary?.removalEventCount, 1);
  assert.equal(organizationSummary?.timeline[0]?.id, "removed");
  assert.match(organizationSummary?.note ?? "", /does not affect contractor permissions/);
});

void test("contractor group audit metadata summary renders only safe scalar values", () => {
  assert.deepEqual(
    summarizeSafeMetadata({
      stringValue: "kept",
      numberValue: 7,
      booleanValue: true,
      objectValue: { hidden: true },
      arrayValue: ["hidden"]
    }),
    ["stringValue: kept", "numberValue: 7", "booleanValue: true"]
  );
});

void test("contractor group audit migration creates hardened audit storage", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(
    migration,
    /create table if not exists public\.contractor_group_audit_events/
  );
  assert.match(migration, /event_type in \([\s\S]+organization_removed/);
  assert.match(migration, /jsonb_typeof\(metadata\) = 'object'/);
  assert.match(
    migration,
    /references public\.contractor_group_memberships\(id\) on delete set null/
  );
  assert.match(
    migration,
    /alter table public\.contractor_group_audit_events force row level security/
  );
  assert.match(
    migration,
    /revoke all on table public\.contractor_group_audit_events from anon, authenticated/
  );
});

void test("contractor group audit write migration uses private RPCs and locked-down wrappers", () => {
  const migration = readFileSync(
    join(
      process.cwd(),
      "supabase",
      "migrations",
      "20260507192746_contractor_group_audit_write_rpcs.sql"
    ),
    "utf8"
  );

  assert.match(
    migration,
    /create or replace function private\.upsert_contractor_group_with_audit/
  );
  assert.match(
    migration,
    /create or replace function public\.upsert_contractor_group_with_audit/
  );
  assert.match(migration, /for update/);
  assert.match(migration, /insert into public\.contractor_group_audit_events/);
  assert.match(
    migration,
    /revoke all on function public\.upsert_contractor_group_with_audit[\s\S]+from authenticated/
  );
  assert.match(
    migration,
    /grant execute on function public\.remove_contractor_group_membership_with_audit[\s\S]+to service_role/
  );
  assert.doesNotMatch(migration, /grant execute[\s\S]+to authenticated/);
});
