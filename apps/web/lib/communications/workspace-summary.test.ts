import assert from "node:assert/strict";
import test from "node:test";

import { deriveCommunicationWorkspaceSummary } from "./workspace-summary";
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
    eventType: overrides.eventType ?? "acknowledged",
    title: overrides.title ?? "Shared evidence acknowledged",
    description:
      overrides.description ??
      "Customer portal acknowledged activity was recorded.",
    href: overrides.href ?? "/projects/project-1#project-evidence",
    occurredAt: overrides.occurredAt ?? "2026-05-26T15:00:00.000Z",
    tone: overrides.tone ?? "positive",
    audience: overrides.audience ?? "customer"
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
});

void test("communication workspace derives follow-up attention without creating tasks", () => {
  const threads = [
    buildThread({
      id: "needs-response",
      needsResponse: true,
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
        tone: "critical"
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
});
