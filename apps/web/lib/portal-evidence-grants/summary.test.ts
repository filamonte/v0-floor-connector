import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  derivePortalEvidenceDeliveryProofSummary,
  derivePortalSharedEvidenceSummary,
  deriveProjectPortalEvidenceSharingSummary
} from "./summary";
import type {
  PortalEvidenceDeliveryEvent,
  PortalEvidenceGrant
} from "@floorconnector/types";

function repoPath(path: string) {
  const fromRoot = join(process.cwd(), path);

  return existsSync(fromRoot) ? fromRoot : join(process.cwd(), "../..", path);
}

const migrationPath = repoPath(
  "supabase/migrations/20260527160000_portal_evidence_grants.sql"
);
const deliveryEventsMigrationPath = repoPath(
  "supabase/migrations/20260527173000_portal_evidence_delivery_events.sql"
);

const baseAttachment = {
  id: "attachment-1",
  subjectType: "daily_log" as const,
  subjectId: "daily-log-1",
  attachmentType: "photo" as const,
  fileName: "after-flake.jpg",
  mimeType: "image/jpeg",
  caption: "Finished broadcast",
  archivedAt: null,
  createdAt: "2026-05-01T12:00:00.000Z"
};

function grant(
  overrides: Partial<PortalEvidenceGrant> = {}
): PortalEvidenceGrant {
  return {
    id: "grant-1",
    organizationId: "org-1",
    projectId: "project-1",
    subjectType: "execution_attachment",
    subjectId: "attachment-1",
    status: "shared",
    titleOverride: null,
    customerNote: null,
    sharedByUserId: "user-1",
    sharedAt: "2026-05-02T12:00:00.000Z",
    revokedByUserId: null,
    revokedAt: null,
    createdAt: "2026-05-02T12:00:00.000Z",
    updatedAt: "2026-05-02T12:00:00.000Z",
    ...overrides
  };
}

function deliveryEvent(
  overrides: Partial<PortalEvidenceDeliveryEvent> = {}
): PortalEvidenceDeliveryEvent {
  return {
    id: `event-${overrides.eventType ?? "shared"}`,
    organizationId: "org-1",
    projectId: "project-1",
    portalEvidenceGrantId: "grant-1",
    portalAccessGrantId: null,
    actorUserId: "user-1",
    actorKind: "contractor",
    eventType: "shared",
    occurredAt: "2026-05-02T12:00:00.000Z",
    metadata: {},
    createdAt: "2026-05-02T12:00:00.000Z",
    ...overrides
  };
}

void test("project sharing summary treats evidence as internal by default", () => {
  const summary = deriveProjectPortalEvidenceSharingSummary({
    attachments: [baseAttachment],
    grants: []
  });

  assert.equal(summary.statusLabel, "Internal by default");
  assert.equal(summary.internalCount, 1);
  assert.equal(summary.sharedCount, 0);
  assert.equal(summary.items[0]?.statusLabel, "Internal only");
  assert.equal(summary.items[0]?.canShare, true);
});

void test("project sharing summary reflects explicit shared and revoked grants", () => {
  const shared = deriveProjectPortalEvidenceSharingSummary({
    attachments: [baseAttachment],
    grants: [grant({ customerNote: "Closeout photo" })]
  });

  assert.equal(shared.sharedCount, 1);
  assert.equal(shared.items[0]?.status, "shared");
  assert.equal(shared.items[0]?.customerNote, "Closeout photo");
  assert.equal(shared.items[0]?.canRevoke, true);

  const revoked = deriveProjectPortalEvidenceSharingSummary({
    attachments: [baseAttachment],
    grants: [
      grant({
        status: "revoked",
        revokedAt: "2026-05-03T12:00:00.000Z",
        revokedByUserId: "user-2"
      })
    ]
  });

  assert.equal(revoked.revokedCount, 1);
  assert.equal(revoked.items[0]?.statusLabel, "Revoked");
  assert.equal(revoked.items[0]?.canShare, true);
});

void test("delivery proof summary derives customer-visible status from events", () => {
  const summary = derivePortalEvidenceDeliveryProofSummary({
    grant: grant(),
    events: [
      deliveryEvent({ eventType: "shared" }),
      deliveryEvent({
        id: "event-viewed",
        actorKind: "portal_customer",
        eventType: "viewed",
        occurredAt: "2026-05-02T13:00:00.000Z"
      }),
      deliveryEvent({
        id: "event-downloaded",
        actorKind: "portal_customer",
        eventType: "downloaded",
        occurredAt: "2026-05-02T14:00:00.000Z"
      }),
      deliveryEvent({
        id: "event-acknowledged",
        actorKind: "portal_customer",
        eventType: "acknowledged",
        occurredAt: "2026-05-02T15:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.statusLabel, "Acknowledged");
  assert.equal(summary.viewCount, 1);
  assert.equal(summary.downloadCount, 1);
  assert.equal(summary.acknowledgedByLabel, "Customer");
  assert.equal(summary.acknowledgedAt, "2026-05-02T15:00:00.000Z");
});

void test("delivery proof summary treats revoked grants as unavailable for new customer action", () => {
  const summary = derivePortalEvidenceDeliveryProofSummary({
    grant: grant({
      status: "revoked",
      revokedAt: "2026-05-03T12:00:00.000Z"
    }),
    events: [
      deliveryEvent({ eventType: "shared" }),
      deliveryEvent({
        id: "event-revoked",
        eventType: "revoked",
        occurredAt: "2026-05-03T12:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.currentStatus, "revoked");
  assert.equal(summary.statusLabel, "Revoked");
  assert.equal(summary.revokedAt, "2026-05-03T12:00:00.000Z");
});

void test("archived evidence is not eligible for new portal sharing", () => {
  const summary = deriveProjectPortalEvidenceSharingSummary({
    attachments: [
      {
        ...baseAttachment,
        archivedAt: "2026-05-03T12:00:00.000Z"
      }
    ],
    grants: [grant()]
  });

  assert.equal(summary.archivedCount, 1);
  assert.equal(summary.sharedCount, 0);
  assert.equal(summary.items[0]?.statusLabel, "Archived internally");
  assert.equal(summary.items[0]?.canShare, false);
});

void test("portal summary returns only active shared evidence without internal labels", () => {
  const summary = derivePortalSharedEvidenceSummary({
    attachments: [
      {
        ...baseAttachment,
        downloadHref: "/portal/projects/project-1/evidence/grant-1/download",
        grant: grant({
          titleOverride: "Completed floor photo",
          customerNote: "Shared for closeout."
        }),
        deliveryEvents: [
          deliveryEvent({
            actorKind: "portal_customer",
            eventType: "acknowledged",
            occurredAt: "2026-05-02T15:00:00.000Z"
          })
        ]
      },
      {
        ...baseAttachment,
        id: "attachment-2",
        archivedAt: "2026-05-04T12:00:00.000Z",
        downloadHref: "/portal/projects/project-1/evidence/grant-2/download",
        grant: grant({ subjectId: "attachment-2" })
      }
    ]
  });

  assert.equal(summary.items.length, 1);
  assert.equal(summary.items[0]?.title, "Completed floor photo");
  assert.equal(
    summary.items[0]?.href,
    "/portal/projects/project-1/evidence/grant-1/download"
  );
  assert.equal(summary.items[0]?.statusLabel, "Acknowledged");
  assert.equal(summary.items[0]?.acknowledgementAllowed, false);
  assert.equal(summary.items[0]?.sourceCategory, "Project photo");
  assert.doesNotMatch(
    `${summary.primaryMessage} ${summary.storageBoundaryMessage}`,
    /FieldTrail|Proof Center|Job Notes/
  );
});

void test("portal evidence delivery migration creates append-only proof events", () => {
  const migration = readFileSync(deliveryEventsMigrationPath, "utf8");

  assert.match(
    migration,
    /create table if not exists public\.portal_evidence_delivery_events/
  );
  assert.match(
    migration,
    /portal_evidence_grant_id uuid not null references public\.portal_evidence_grants/
  );
  assert.match(
    migration,
    /event_type in \('shared', 'viewed', 'downloaded', 'acknowledged', 'revoked'\)/
  );
  assert.match(
    migration,
    /actor_kind in \('contractor', 'portal_customer', 'system'\)/
  );
  assert.match(migration, /portal_evidence_delivery_events_ack_once_idx/);
  assert.match(migration, /jsonb_typeof\(metadata\) = 'object'/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /force row level security/);
  assert.match(migration, /has_active_portal_project_access/);
  assert.match(migration, /prevent_portal_evidence_delivery_event_updates/);
  assert.match(migration, /prevent_portal_evidence_delivery_event_deletes/);
  assert.doesNotMatch(migration, /for update/i);
  assert.doesNotMatch(migration, /for delete/i);
  assert.doesNotMatch(migration, /storage_path\s/);
});

void test("portal evidence grants migration keeps sharing scoped and revocable", () => {
  const migration = readFileSync(migrationPath, "utf8");

  assert.match(
    migration,
    /create table if not exists public\.portal_evidence_grants/
  );
  assert.match(
    migration,
    /company_id uuid not null references public\.companies/
  );
  assert.match(migration, /project_id uuid not null/);
  assert.match(migration, /foreign key \(company_id, project_id\)/);
  assert.match(migration, /references public\.projects\(company_id, id\)/);
  assert.match(migration, /subject_type text not null/);
  assert.match(migration, /subject_id uuid not null/);
  assert.match(migration, /subject_type in \('execution_attachment'\)/);
  assert.match(migration, /status in \('shared', 'revoked'\)/);
  assert.match(migration, /shared_by uuid references public\.users/);
  assert.match(migration, /revoked_by uuid references public\.users/);
  assert.match(
    migration,
    /unique \(company_id, project_id, subject_type, subject_id\)/
  );
  assert.match(migration, /enable row level security/);
  assert.match(migration, /force row level security/);
  assert.match(migration, /has_active_portal_project_access/);
  assert.doesNotMatch(migration, /using \(true\)/i);
  assert.doesNotMatch(migration, /for delete/i);
});
