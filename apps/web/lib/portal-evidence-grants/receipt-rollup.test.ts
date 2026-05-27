import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveSharedEvidenceReceiptRollupFromPortalSummary,
  deriveSharedEvidenceReceiptRollupFromProjectSharing
} from "./receipt-rollup";
import type {
  PortalEvidenceDeliveryProofSummary,
  PortalEvidenceSharingItem,
  PortalSharedEvidenceSummary,
  ProjectPortalEvidenceSharingSummary
} from "./summary";

function proof(
  overrides: Partial<PortalEvidenceDeliveryProofSummary> = {}
): PortalEvidenceDeliveryProofSummary {
  return {
    firstSharedAt: "2026-05-01T12:00:00.000Z",
    lastViewedAt: null,
    viewCount: 0,
    lastDownloadedAt: null,
    downloadCount: 0,
    acknowledgedAt: null,
    acknowledgedByLabel: null,
    revokedAt: null,
    currentStatus: "available",
    statusLabel: "Available",
    ...overrides
  };
}

function projectItem(
  overrides: Partial<PortalEvidenceSharingItem> = {}
): PortalEvidenceSharingItem {
  return {
    id: "attachment-1",
    subjectType: "execution_attachment",
    attachmentType: "photo",
    title: "After photo",
    caption: "Finished floor",
    mimeType: "image/jpeg",
    status: "shared",
    statusLabel: "Shared with customer",
    customerNote: "Closeout reference",
    sharedAt: "2026-05-01T12:00:00.000Z",
    revokedAt: null,
    deliveryProof: proof(),
    canShare: false,
    canRevoke: true,
    reason: "Visible to customer",
    createdAt: "2026-05-01T11:00:00.000Z",
    ...overrides
  };
}

function projectSummary(
  items: PortalEvidenceSharingItem[]
): ProjectPortalEvidenceSharingSummary {
  return {
    statusLabel: "Shared",
    primaryMessage: "Shared",
    sharedCount: items.filter((item) => item.status === "shared").length,
    internalCount: items.filter((item) => item.status === "internal").length,
    revokedCount: items.filter((item) => item.status === "revoked").length,
    archivedCount: 0,
    items
  };
}

function portalSummary(
  overrides: Partial<PortalSharedEvidenceSummary> = {}
): PortalSharedEvidenceSummary {
  return {
    statusLabel: "1 shared evidence item",
    primaryMessage: "These files were deliberately shared.",
    emptyStateMessage: "No field evidence shared.",
    storageBoundaryMessage: "Only explicitly shared evidence appears here.",
    items: [
      {
        key: "execution-attachment:attachment-1",
        id: "attachment-1",
        grantId: "grant-1",
        title: "After photo",
        fileName: "after.jpg",
        caption: "Finished floor",
        customerNote: "Closeout reference",
        sourceCategory: "Project photo",
        mimeType: "image/jpeg",
        sharedAt: "2026-05-01T12:00:00.000Z",
        href: "/portal/projects/project-1/evidence/grant-1/download",
        statusLabel: "Available",
        acknowledgementAllowed: true,
        deliveryProof: proof()
      }
    ],
    ...overrides
  };
}

void test("receipt rollup returns no-shared-evidence empty state", () => {
  const rollup = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([])
  );

  assert.equal(rollup.status, "no_shared_evidence");
  assert.equal(rollup.activeSharedCount, 0);
  assert.equal(rollup.customerRows.length, 0);
  assert.match(rollup.exportNotice, /does not send files/);
});

void test("receipt rollup tracks shared-not-viewed state", () => {
  const rollup = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([projectItem()])
  );

  assert.equal(rollup.status, "shared_not_viewed");
  assert.equal(rollup.activeSharedCount, 1);
  assert.equal(rollup.viewedCount, 0);
  assert.equal(rollup.unacknowledgedSharedCount, 1);
});

void test("receipt rollup derives viewed/downloaded activity", () => {
  const rollup = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([
      projectItem({
        deliveryProof: proof({
          lastViewedAt: "2026-05-02T12:00:00.000Z",
          viewCount: 2,
          lastDownloadedAt: "2026-05-02T13:00:00.000Z",
          downloadCount: 1,
          currentStatus: "downloaded",
          statusLabel: "Download requested"
        })
      })
    ])
  );

  assert.equal(rollup.status, "viewed_or_downloaded");
  assert.equal(rollup.viewedCount, 1);
  assert.equal(rollup.downloadedCount, 1);
  assert.equal(rollup.lastCustomerInteractionAt, "2026-05-02T13:00:00.000Z");
});

void test("receipt rollup distinguishes partial and full acknowledgement", () => {
  const partial = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([
      projectItem({
        id: "attachment-1",
        deliveryProof: proof({
          acknowledgedAt: "2026-05-03T12:00:00.000Z",
          acknowledgedByLabel: "Customer",
          currentStatus: "acknowledged",
          statusLabel: "Acknowledged"
        })
      }),
      projectItem({ id: "attachment-2", title: "Installer photo" })
    ])
  );

  assert.equal(partial.status, "partially_acknowledged");
  assert.equal(partial.acknowledgedCount, 1);
  assert.equal(partial.unacknowledgedSharedCount, 1);

  const full = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([
      projectItem({
        deliveryProof: proof({
          acknowledgedAt: "2026-05-03T12:00:00.000Z",
          acknowledgedByLabel: "Customer",
          currentStatus: "acknowledged",
          statusLabel: "Acknowledged"
        })
      })
    ])
  );

  assert.equal(full.status, "fully_acknowledged");
  assert.equal(full.unacknowledgedSharedCount, 0);
});

void test("receipt rollup keeps revoked rows contractor-visible and portal-hidden", () => {
  const rollup = deriveSharedEvidenceReceiptRollupFromProjectSharing(
    projectSummary([
      projectItem({
        status: "revoked",
        statusLabel: "Revoked",
        revokedAt: "2026-05-04T12:00:00.000Z",
        deliveryProof: proof({
          revokedAt: "2026-05-04T12:00:00.000Z",
          currentStatus: "revoked",
          statusLabel: "Revoked"
        })
      })
    ])
  );

  assert.equal(rollup.status, "revoked_or_changed");
  assert.equal(rollup.revokedCount, 1);
  assert.equal(rollup.contractorRows.length, 1);
  assert.equal(rollup.customerRows.length, 0);
});

void test("portal receipt rollup exposes only customer-safe active rows", () => {
  const rollup =
    deriveSharedEvidenceReceiptRollupFromPortalSummary(portalSummary());

  assert.equal(rollup.activeSharedCount, 1);
  assert.equal(rollup.contractorRows.length, 1);
  assert.equal(rollup.customerRows.length, 1);
  assert.equal(rollup.customerRows[0]?.fileName, "after.jpg");
  assert.doesNotMatch(
    `${rollup.primaryMessage} ${rollup.exportNotice} ${rollup.acknowledgementDisclaimer}`,
    /storage_path|FieldTrail|Proof Center|Daily Log body|Job Note body/i
  );
});
