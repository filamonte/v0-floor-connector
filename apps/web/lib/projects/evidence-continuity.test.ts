import assert from "node:assert/strict";
import test from "node:test";

import { deriveProjectEvidenceContinuitySummary } from "./evidence-continuity";

const baseInput = {
  projectId: "project-1",
  dailyLogs: [
    {
      id: "daily-log-1",
      jobId: "job-1",
      logDate: "2026-05-20",
      status: "finalized",
      summary: "Installed flake floor",
      updatedAt: "2026-05-20T20:00:00.000Z"
    }
  ],
  fieldNotes: [
    {
      id: "field-note-1",
      dailyLogId: "daily-log-1",
      jobId: "job-1",
      noteType: "general",
      title: "Garage floor photos",
      status: "resolved",
      updatedAt: "2026-05-20T21:00:00.000Z"
    }
  ],
  attachments: [
    {
      id: "attachment-1",
      subjectType: "daily_log" as const,
      subjectId: "daily-log-1",
      attachmentType: "photo",
      fileName: "after.jpg",
      mimeType: "image/jpeg",
      caption: "After photo",
      createdAt: "2026-05-20T22:00:00.000Z",
      archivedAt: null,
      restoredAt: null
    }
  ],
  estimates: [
    {
      id: "estimate-1",
      status: "approved",
      referenceNumber: "EST-1",
      updatedAt: "2026-05-18T12:00:00.000Z"
    }
  ],
  contracts: [
    {
      id: "contract-1",
      status: "signed",
      referenceNumber: "CON-1",
      updatedAt: "2026-05-19T12:00:00.000Z"
    }
  ],
  invoices: [
    {
      id: "invoice-1",
      status: "paid",
      referenceNumber: "INV-1",
      balanceDueAmount: "0.00",
      updatedAt: "2026-05-21T12:00:00.000Z"
    }
  ],
  changeOrders: [
    {
      id: "change-order-1",
      status: "approved",
      referenceNumber: "CO-1",
      updatedAt: "2026-05-19T13:00:00.000Z"
    }
  ],
  warrantyDocuments: [
    {
      id: "warranty-document-1",
      title: "Garage warranty",
      status: "draft",
      updatedAt: "2026-05-22T12:00:00.000Z"
    }
  ],
  serviceTicketCount: 0,
  customerAccessCount: 1,
  closeoutTone: "ready" as const,
  closeoutBlockers: [],
  closeoutNextMove: {
    label: "Ready for closeout review",
    href: "#closeouttrail",
    reason: "Closeout proof looks ready."
  },
  proofTone: "ready" as const,
  proofMissingItems: [],
  proofNextMove: {
    label: "Review project proof",
    href: "#proofcenter",
    reason: "Project proof is available."
  },
  fieldTrailNextMove: {
    label: "Open latest Daily Job Log",
    href: "/daily-logs/daily-log-1",
    reason: "Review latest field proof."
  },
  dailyLogsHref: "/daily-logs?projectId=project-1",
  fieldTrailHref: "#fieldtrail",
  proofCenterHref: "#proofcenter",
  closeoutHref: "#closeouttrail",
  closeoutPackageHref: "/projects/project-1/closeout-package/pdf",
  customerAccessHref: "/people?accessCustomerId=customer-1#customer-access",
  warrantyServiceHref: "/warranty-documents/warranty-document-1"
};

void test("project evidence continuity separates active and archived proof", () => {
  const summary = deriveProjectEvidenceContinuitySummary({
    ...baseInput,
    attachments: [
      ...baseInput.attachments,
      {
        id: "attachment-2",
        subjectType: "field_note" as const,
        subjectId: "field-note-1",
        attachmentType: "document",
        fileName: "bad-upload.pdf",
        mimeType: "application/pdf",
        caption: null,
        createdAt: "2026-05-20T22:30:00.000Z",
        archivedAt: "2026-05-21T10:00:00.000Z",
        restoredAt: null
      }
    ]
  });

  assert.equal(summary.counts.activeEvidence, 1);
  assert.equal(summary.counts.archivedEvidence, 1);
  assert.match(summary.boundary.archiveLabel, /excluded from active proof/);
  assert.ok(
    summary.timeline.some((item) => item.title === "Field evidence archived")
  );
});

void test("project evidence continuity keeps field evidence internal even when portal access exists", () => {
  const summary = deriveProjectEvidenceContinuitySummary(baseInput);
  const fieldItem = summary.documentGroups
    .flatMap((group) => group.items)
    .find((item) => item.id === "active_field_evidence");

  assert.equal(summary.counts.customerSafeRecords, 4);
  assert.equal(summary.counts.internalOnlyEvidence, 1);
  assert.equal(fieldItem?.customerSafe, false);
  assert.match(summary.boundary.internalEvidenceLabel, /contractor-only/);
});

void test("project evidence continuity routes closeout blockers before proof review", () => {
  const summary = deriveProjectEvidenceContinuitySummary({
    ...baseInput,
    closeoutTone: "blocked",
    closeoutBlockers: ["Contract signature is still open before closeout."],
    closeoutNextMove: {
      label: "Review Signature Trail",
      href: "/contracts/contract-1",
      reason: "The contract needs signature follow-through."
    }
  });

  assert.equal(summary.tone, "blocked");
  assert.equal(summary.nextMove.label, "Review Signature Trail");
  assert.equal(summary.nextMove.href, "/contracts/contract-1");
});

void test("project evidence continuity orders proof trail by newest canonical event", () => {
  const summary = deriveProjectEvidenceContinuitySummary(baseInput);

  assert.equal(summary.timeline[0]?.title, "Warranty document connected");
  assert.equal(summary.timeline[1]?.title, "Invoice paid");
  assert.equal(summary.timeline[2]?.title, "Field evidence added");
});
