import assert from "node:assert/strict";
import test from "node:test";

import {
  derivePortalProjectCommunicationSummary,
  type PortalProjectCommunicationMessage,
  type PortalProjectCommunicationThread
} from "./portal-project-summary";

function thread(
  overrides: Partial<PortalProjectCommunicationThread> = {}
): PortalProjectCommunicationThread {
  return {
    id: "thread-1",
    organizationId: "org-1",
    customerId: "customer-1",
    projectId: "project-1",
    subjectType: "project",
    subjectId: "project-1",
    threadStatus: "waiting_on_customer",
    lastMessageAt: "2026-05-27T12:00:00.000Z",
    lastMessagePreview: "Shared project note",
    updatedAt: "2026-05-27T12:00:00.000Z",
    ...overrides
  };
}

function message(
  overrides: Partial<PortalProjectCommunicationMessage> = {}
): PortalProjectCommunicationMessage {
  return {
    id: "message-1",
    threadId: "thread-1",
    senderType: "organization_user",
    direction: "outbound",
    messageKind: "customer_message",
    deliveryStatus: "logged",
    body: "Shared project note",
    occurredAt: "2026-05-27T12:00:00.000Z",
    createdAt: "2026-05-27T12:00:00.000Z",
    ...overrides
  };
}

void test("portal project communication summary keeps customer-visible conversations replyable", () => {
  const summary = derivePortalProjectCommunicationSummary({
    threads: [thread()],
    messages: [message()]
  });

  assert.equal(summary.conversationCount, 1);
  assert.equal(summary.messageCount, 1);
  assert.equal(summary.latestMessageAt, "2026-05-27T12:00:00.000Z");
  assert.equal(summary.conversations[0]?.replyAllowed, true);
});

void test("portal project communication summary drops threads with no visible messages", () => {
  const summary = derivePortalProjectCommunicationSummary({
    threads: [thread({ id: "internal-thread" })],
    messages: []
  });

  assert.equal(summary.conversationCount, 0);
  assert.equal(summary.messageCount, 0);
});

void test("portal project communication summary keeps newest conversations first", () => {
  const summary = derivePortalProjectCommunicationSummary({
    threads: [
      thread({ id: "older", lastMessageAt: "2026-05-27T10:00:00.000Z" }),
      thread({ id: "newer", lastMessageAt: "2026-05-27T13:00:00.000Z" })
    ],
    messages: [
      message({
        id: "older-message",
        threadId: "older",
        occurredAt: "2026-05-27T10:00:00.000Z"
      }),
      message({
        id: "newer-message",
        threadId: "newer",
        occurredAt: "2026-05-27T13:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.conversations[0]?.thread.id, "newer");
});

void test("portal project communication summary does not allow replies to archived threads", () => {
  const summary = derivePortalProjectCommunicationSummary({
    threads: [thread({ threadStatus: "archived" })],
    messages: [message()]
  });

  assert.equal(summary.conversations[0]?.replyAllowed, false);
});
