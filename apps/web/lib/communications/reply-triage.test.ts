import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveCommunicationReplyTriage,
  type CommunicationReplyTriageMessage,
  type CommunicationReplyTriageThread
} from "./reply-triage";

const baseThread: CommunicationReplyTriageThread = {
  id: "thread-1",
  threadStatus: "open",
  lastMessageAt: "2026-05-27T14:00:00.000Z",
  lastMessagePreview: "Can you confirm the closeout package?"
};

function buildMessage(
  overrides: Partial<CommunicationReplyTriageMessage>
): CommunicationReplyTriageMessage {
  return {
    id: overrides.id ?? "message-1",
    threadId: overrides.threadId ?? "thread-1",
    senderType: overrides.senderType ?? "portal_user",
    direction: overrides.direction ?? "inbound",
    channelKind: overrides.channelKind ?? "portal",
    messageKind: overrides.messageKind ?? "customer_message",
    visibility: overrides.visibility ?? "customer_visible",
    body: overrides.body ?? "Can you confirm the closeout package?",
    occurredAt: overrides.occurredAt ?? "2026-05-27T14:00:00.000Z",
    createdAt: overrides.createdAt ?? "2026-05-27T14:00:00.000Z"
  };
}

void test("reply triage marks latest portal customer reply as needing response", () => {
  const summary = deriveCommunicationReplyTriage({
    threads: [baseThread],
    messages: [buildMessage({})]
  });

  assert.equal(summary.needsResponseCount, 1);
  assert.equal(summary.items[0]?.needsResponse, true);
  assert.equal(summary.items[0]?.source, "message_history");
  assert.match(summary.items[0]?.latestCustomerReplyPreview ?? "", /closeout/);
});

void test("reply triage clears need after later contractor customer-visible response", () => {
  const summary = deriveCommunicationReplyTriage({
    threads: [baseThread],
    messages: [
      buildMessage({
        id: "customer-reply",
        occurredAt: "2026-05-27T14:00:00.000Z",
        createdAt: "2026-05-27T14:00:00.000Z"
      }),
      buildMessage({
        id: "contractor-response",
        senderType: "organization_user",
        direction: "outbound",
        body: "Yes, we will have that ready today.",
        occurredAt: "2026-05-27T15:00:00.000Z",
        createdAt: "2026-05-27T15:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.needsResponseCount, 0);
  assert.equal(summary.items[0]?.needsResponse, false);
  assert.equal(
    summary.items[0]?.latestContractorResponseAt,
    "2026-05-27T15:00:00.000Z"
  );
});

void test("reply triage ignores internal notes as contractor responses", () => {
  const summary = deriveCommunicationReplyTriage({
    threads: [baseThread],
    messages: [
      buildMessage({
        id: "customer-reply",
        occurredAt: "2026-05-27T14:00:00.000Z",
        createdAt: "2026-05-27T14:00:00.000Z"
      }),
      buildMessage({
        id: "internal-note",
        senderType: "organization_user",
        direction: "internal",
        channelKind: "internal_note",
        visibility: "internal",
        body: "Office should review before replying.",
        occurredAt: "2026-05-27T15:00:00.000Z",
        createdAt: "2026-05-27T15:00:00.000Z"
      })
    ]
  });

  assert.equal(summary.needsResponseCount, 1);
  assert.equal(summary.items[0]?.needsResponse, true);
});

void test("reply triage can fall back to waiting_on_contractor thread status", () => {
  const summary = deriveCommunicationReplyTriage({
    threads: [
      {
        ...baseThread,
        threadStatus: "waiting_on_contractor"
      }
    ],
    messages: []
  });

  assert.equal(summary.needsResponseCount, 1);
  assert.equal(summary.items[0]?.source, "thread_status");
});
