import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveCommunicationWorkspaceSummary,
  deriveDeliveryProofRecordGroups,
  deriveDeliveryProofReviewSummary
} from "./workspace-summary";
import type {
  ContractorCommunicationContextEvent,
  ContractorCommunicationThreadListItem,
  ContractorCommunicationThreadSummary
} from "./contractor-data";

function buildThread(
  overrides: Partial<ContractorCommunicationThreadListItem> = {}
): ContractorCommunicationThreadListItem {
  const subjectType = overrides.subject?.type ?? "project";

  return {
    id: overrides.id ?? "thread-1",
    threadCategory: overrides.threadCategory ?? "operational",
    channelKind: overrides.channelKind ?? "portal",
    threadStatus: overrides.threadStatus ?? "open",
    customer: overrides.customer ?? {
      id: "customer-1",
      label: "Avery Customer",
      href: "/customers/customer-1"
    },
    project: overrides.project ?? {
      id: "project-1",
      label: "Main floor",
      href: "/projects/project-1"
    },
    subject: overrides.subject ?? {
      type: subjectType,
      id: "project-1",
      label: "Project - Main floor",
      href: "/projects/project-1"
    },
    subjectSecondaryLink: overrides.subjectSecondaryLink ?? null,
    lastMessageAt: overrides.lastMessageAt ?? "2026-05-25T15:00:00.000Z",
    lastMessagePreview:
      overrides.lastMessagePreview ?? "Can we confirm closeout?",
    lastMessageVisibility:
      overrides.lastMessageVisibility ?? "customer_visible",
    unreadCount: overrides.unreadCount ?? 0,
    needsResponse: overrides.needsResponse ?? false,
    lastUnreadAt: overrides.lastUnreadAt ?? null,
    customerReplyNeedsResponse: overrides.customerReplyNeedsResponse ?? false,
    latestCustomerReplyAt: overrides.latestCustomerReplyAt ?? null,
    latestCustomerReplyPreview: overrides.latestCustomerReplyPreview ?? null,
    lastActivityAt: overrides.lastActivityAt ?? "2026-05-25T15:00:00.000Z",
    createdAt: overrides.createdAt ?? "2026-05-25T14:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-05-25T15:00:00.000Z"
  };
}

const baseSummary: ContractorCommunicationThreadSummary = {
  totalCount: 0,
  needsResponseCount: 0,
  unreadCount: 0,
  recentCount: 0,
  linkedProjectCount: 0,
  sourceCounts: {
    opportunity: 0,
    appointment: 0,
    customer: 0,
    project: 0,
    estimate: 0,
    contract: 0,
    invoice: 0,
    change_order: 0,
    payment: 0
  }
};

function buildEvent(
  overrides: Partial<ContractorCommunicationContextEvent> = {}
): ContractorCommunicationContextEvent {
  return {
    id: overrides.id ?? "event-1",
    kind: overrides.kind ?? "shared_evidence",
    sourceType: overrides.sourceType ?? "shared_evidence",
    sourceId: overrides.sourceId ?? "grant-1",
    sourceRecord: overrides.sourceRecord ?? {
      type: "project",
      id: "project-1",
      label: "Project - Main floor",
      href: "/projects/project-1#project-evidence"
    },
    eventType: overrides.eventType ?? "acknowledged",
    title: overrides.title ?? "Shared evidence acknowledged",
    description:
      overrides.description ??
      "Customer portal acknowledged activity was recorded.",
    href: overrides.href ?? "/projects/project-1#project-evidence",
    occurredAt: overrides.occurredAt ?? "2026-05-26T15:00:00.000Z",
    tone: overrides.tone ?? "positive",
    audience: overrides.audience ?? "customer",
    proofStateLabel: overrides.proofStateLabel ?? "Customer activity",
    proofBoundaryLabel:
      overrides.proofBoundaryLabel ?? "Read-only evidence proof",
    proofSourceLabel: overrides.proofSourceLabel ?? "Customer-facing",
    needsReview: overrides.needsReview ?? false
  };
}

void test("communication workspace groups canonical threads into operating lanes", () => {
  const threads = [
    buildThread({
      id: "customer-thread",
      subject: {
        type: "customer",
        id: "customer-1",
        label: "Customer - Avery",
        href: "/customers/customer-1"
      }
    }),
    buildThread({
      id: "invoice-thread",
      subject: {
        type: "invoice",
        id: "invoice-1",
        label: "Invoice I-1001",
        href: "/invoices/invoice-1"
      }
    }),
    buildThread({
      id: "internal-thread",
      lastMessageVisibility: "internal"
    })
  ];
  const summary = deriveCommunicationWorkspaceSummary({
    threads,
    threadSummary: { ...baseSummary, totalCount: threads.length },
    contextEvents: [],
    notificationCount: 0,
    now: new Date("2026-05-27T00:00:00.000Z")
  });

  assert.equal(summary.lanes.find((lane) => lane.key === "customer")?.count, 1);
  assert.equal(summary.lanes.find((lane) => lane.key === "finance")?.count, 1);
  assert.equal(summary.internalThreadCount, 1);
  assert.equal(summary.workflowCoverageCount, 3);
  assert.equal(summary.workflowCoverageLabel, "3/8 workflow stages linked");
  assert.equal(
    summary.lanes.find((lane) => lane.key === "finance")?.actionLabel,
    "Review payment pressure"
  );
  assert.equal(
    summary.lanes.find((lane) => lane.key === "internal")?.boundaryLabel,
    "Internal-only"
  );
});

void test("communication workspace derives follow-up attention without creating tasks", () => {
  const threads = [
    buildThread({
      id: "needs-response",
      needsResponse: true,
      customerReplyNeedsResponse: true,
      latestCustomerReplyAt: "2026-05-26T18:00:00.000Z",
      latestCustomerReplyPreview: "Can you confirm the closeout package?",
      unreadCount: 1,
      lastUnreadAt: "2026-05-26T18:00:00.000Z"
    })
  ];
  const summary = deriveCommunicationWorkspaceSummary({
    threads,
    threadSummary: {
      ...baseSummary,
      totalCount: 1,
      unreadCount: 1,
      needsResponseCount: 1
    },
    contextEvents: [
      buildEvent({
        id: "failed-send",
        kind: "document_delivery",
        sourceType: "invoice",
        eventType: "failed",
        title: "Invoice failed",
        tone: "critical",
        proofStateLabel: "Needs review",
        proofBoundaryLabel: "Read-only delivery proof",
        proofSourceLabel: "Provider-derived",
        needsReview: true
      })
    ],
    notificationCount: 1,
    now: new Date("2026-05-27T00:00:00.000Z")
  });

  assert.equal(summary.primaryStatus, "Follow-up needed");
  assert.equal(summary.followUpCount, 2);
  assert.ok(summary.attentionItems.some((item) => item.tone === "critical"));
  assert.match(
    summary.attentionItems.map((item) => item.label).join(" "),
    /Customer response waiting/
  );
  assert.match(summary.primaryDetail, /portal customer reply/);
  assert.equal(summary.notificationReviewLabel, "1 unread review signal");
  assert.equal(summary.deliveryProofLabel, "1 proof event");
  assert.match(summary.deliveryProofDetail, /1 delivery proof item/);
  assert.equal(summary.deliveryProofReviewCount, 1);
  assert.equal(summary.latestDeliveryProof?.id, "failed-send");
  assert.equal(summary.deliveryProofRecordGroups.length, 1);
  assert.equal(summary.deliveryProofRecordGroups[0]?.needsReview, true);
  assert.equal(
    summary.deliveryProofReviewSummary.label,
    "1 record needs proof review"
  );
  assert.match(
    summary.deliveryProofReviewSummary.detail,
    /1 failed, bounced, revoked, or review-needed proof item/
  );
});

void test("communication workspace treats shared evidence as closeout context", () => {
  const summary = deriveCommunicationWorkspaceSummary({
    threads: [],
    threadSummary: baseSummary,
    contextEvents: [
      buildEvent({
        kind: "shared_evidence",
        sourceType: "shared_evidence",
        eventType: "acknowledged",
        tone: "positive"
      }),
      buildEvent({
        id: "warranty-send",
        kind: "document_delivery",
        sourceType: "warranty_document",
        sourceRecord: {
          type: "warranty_document",
          id: "warranty-1",
          label: "Warranty document",
          href: "/warranty-documents/warranty-1"
        },
        eventType: "sent",
        tone: "neutral"
      })
    ],
    notificationCount: 0,
    now: new Date("2026-05-27T00:00:00.000Z")
  });

  assert.equal(summary.closeoutEvidenceContextCount, 2);
  assert.equal(summary.lanes.find((lane) => lane.key === "closeout")?.count, 2);
  assert.equal(summary.recentContextEvents.length, 2);
  assert.equal(summary.customerBoundaryLabel, "No boundary signals yet");
  assert.match(summary.customerBoundaryDetail, /portal-owned copies/);
  assert.equal(summary.deliveryProofReviewCount, 0);
  assert.match(summary.deliveryProofDetail, /Customer activity/);
  assert.equal(summary.deliveryProofRecordGroups.length, 2);
  assert.equal(
    summary.deliveryProofReviewSummary.label,
    "No proof review needed"
  );
});

void test("communication workspace keeps missing delivery proof read-only", () => {
  const summary = deriveCommunicationWorkspaceSummary({
    threads: [],
    threadSummary: baseSummary,
    contextEvents: [],
    notificationCount: 0,
    now: new Date("2026-05-27T00:00:00.000Z")
  });

  assert.equal(summary.deliveryProofLabel, "No proof events yet");
  assert.equal(summary.deliveryProofReviewCount, 0);
  assert.equal(summary.latestDeliveryProof, null);
  assert.equal(summary.deliveryProofRecordGroups.length, 0);
  assert.equal(
    summary.deliveryProofReviewSummary.label,
    "No proof review items"
  );
  assert.match(summary.deliveryProofDetail, /No delivery proof yet/);
});

void test("communication workspace preserves provider-derived delivery proof labels", () => {
  const summary = deriveCommunicationWorkspaceSummary({
    threads: [],
    threadSummary: baseSummary,
    contextEvents: [
      buildEvent({
        id: "provider-send",
        kind: "document_delivery",
        sourceType: "invoice",
        eventType: "sent",
        title: "Invoice sent",
        description: "Sent by email for Avery Customer through postmark.",
        proofStateLabel: "Delivery proof available",
        proofBoundaryLabel: "Read-only delivery proof",
        proofSourceLabel: "Provider-derived",
        occurredAt: "2026-05-27T16:00:00.000Z",
        tone: "neutral"
      })
    ],
    notificationCount: 0,
    now: new Date("2026-05-27T00:00:00.000Z")
  });

  assert.equal(
    summary.latestDeliveryProof?.proofSourceLabel,
    "Provider-derived"
  );
  assert.equal(
    summary.latestDeliveryProof?.proofBoundaryLabel,
    "Read-only delivery proof"
  );
  assert.match(summary.deliveryProofDetail, /Delivery proof available/);
});

void test("delivery proof grouping keeps events under the canonical source record", () => {
  const groups = deriveDeliveryProofRecordGroups([
    buildEvent({
      id: "invoice-sent",
      kind: "document_delivery",
      sourceType: "invoice",
      sourceId: "invoice-1",
      sourceRecord: {
        type: "invoice",
        id: "invoice-1",
        label: "Invoice I-1001",
        href: "/invoices/invoice-1"
      },
      eventType: "sent",
      title: "Invoice I-1001 sent",
      proofStateLabel: "Delivery proof available",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Provider-derived",
      occurredAt: "2026-05-27T15:00:00.000Z",
      tone: "neutral"
    }),
    buildEvent({
      id: "invoice-opened",
      kind: "document_delivery",
      sourceType: "invoice",
      sourceId: "invoice-1",
      sourceRecord: {
        type: "invoice",
        id: "invoice-1",
        label: "Invoice I-1001",
        href: "/invoices/invoice-1"
      },
      eventType: "opened",
      title: "Invoice I-1001 opened",
      proofStateLabel: "Customer activity",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Provider-derived",
      occurredAt: "2026-05-27T16:00:00.000Z",
      tone: "positive"
    })
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.sourceType, "invoice");
  assert.equal(groups[0]?.sourceId, "invoice-1");
  assert.equal(groups[0]?.sourceHref, "/invoices/invoice-1");
  assert.equal(groups[0]?.communicationsHref, "/communications?source=invoice");
  assert.equal(groups[0]?.proofCount, 2);
  assert.equal(groups[0]?.latestProofStateLabel, "Customer activity");
  assert.deepEqual(groups[0]?.proofSourceLabels, ["Provider-derived"]);
});

void test("delivery proof grouping sorts review-needed records first", () => {
  const groups = deriveDeliveryProofRecordGroups([
    buildEvent({
      id: "contract-viewed",
      kind: "document_delivery",
      sourceType: "contract",
      sourceId: "contract-1",
      sourceRecord: {
        type: "contract",
        id: "contract-1",
        label: "Contract C-1001",
        href: "/contracts/contract-1"
      },
      eventType: "viewed",
      proofStateLabel: "Customer activity",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Customer-facing",
      occurredAt: "2026-05-27T18:00:00.000Z",
      tone: "positive"
    }),
    buildEvent({
      id: "estimate-bounced",
      kind: "document_delivery",
      sourceType: "estimate",
      sourceId: "estimate-1",
      sourceRecord: {
        type: "estimate",
        id: "estimate-1",
        label: "Estimate E-1001",
        href: "/estimates/estimate-1"
      },
      eventType: "bounced",
      proofStateLabel: "Needs review",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Provider-derived",
      needsReview: true,
      occurredAt: "2026-05-27T17:00:00.000Z",
      tone: "critical"
    })
  ]);

  assert.equal(groups[0]?.sourceLabel, "Estimate E-1001");
  assert.equal(groups[0]?.needsReview, true);
  assert.equal(groups[0]?.reviewCount, 1);
  assert.match(groups[0]?.latestDescription ?? "", /need review/);
});

void test("delivery proof grouping keeps warranty documents out of unsupported source filters", () => {
  const groups = deriveDeliveryProofRecordGroups([
    buildEvent({
      id: "warranty-recorded",
      kind: "document_delivery",
      sourceType: "warranty_document",
      sourceId: "warranty-1",
      sourceRecord: {
        type: "warranty_document",
        id: "warranty-1",
        label: "Warranty document",
        href: "/warranty-documents/warranty-1"
      },
      eventType: "delivery_recorded",
      proofStateLabel: "Delivery proof available",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Internal evidence",
      occurredAt: "2026-05-27T17:00:00.000Z",
      tone: "neutral"
    })
  ]);

  assert.equal(groups[0]?.sourceHref, "/warranty-documents/warranty-1");
  assert.equal(groups[0]?.communicationsHref, "/communications");
});

void test("delivery proof review summary keeps review scope read-only and record-linked", () => {
  const groups = deriveDeliveryProofRecordGroups([
    buildEvent({
      id: "invoice-failed",
      kind: "document_delivery",
      sourceType: "invoice",
      sourceId: "invoice-1",
      sourceRecord: {
        type: "invoice",
        id: "invoice-1",
        label: "Invoice I-1001",
        href: "/invoices/invoice-1"
      },
      eventType: "failed",
      proofStateLabel: "Needs review",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Provider-derived",
      needsReview: true,
      occurredAt: "2026-05-27T17:00:00.000Z",
      tone: "critical"
    }),
    buildEvent({
      id: "estimate-bounced",
      kind: "document_delivery",
      sourceType: "estimate",
      sourceId: "estimate-1",
      sourceRecord: {
        type: "estimate",
        id: "estimate-1",
        label: "Estimate E-1001",
        href: "/estimates/estimate-1"
      },
      eventType: "bounced",
      proofStateLabel: "Needs review",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Provider-derived",
      needsReview: true,
      occurredAt: "2026-05-27T16:00:00.000Z",
      tone: "critical"
    }),
    buildEvent({
      id: "contract-viewed",
      kind: "document_delivery",
      sourceType: "contract",
      sourceId: "contract-1",
      sourceRecord: {
        type: "contract",
        id: "contract-1",
        label: "Contract C-1001",
        href: "/contracts/contract-1"
      },
      eventType: "viewed",
      proofStateLabel: "Customer activity",
      proofBoundaryLabel: "Read-only delivery proof",
      proofSourceLabel: "Customer-facing",
      occurredAt: "2026-05-27T18:00:00.000Z",
      tone: "positive"
    })
  ]);
  const summary = deriveDeliveryProofReviewSummary(groups);

  assert.equal(summary.recordCount, 2);
  assert.equal(summary.proofItemCount, 2);
  assert.equal(summary.href, "/communications?source=invoice");
  assert.deepEqual(summary.sourceLabels, ["Invoice I-1001", "Estimate E-1001"]);
  assert.match(summary.label, /2 records need proof review/);
  assert.match(summary.detail, /Review the source record/);
});
