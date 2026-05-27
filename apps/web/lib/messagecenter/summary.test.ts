import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveMessageCenterSummary,
  type MessageCenterSummary
} from "./summary";
import type {
  MessageCenterCommunicationMessage,
  MessageCenterCommunicationThread,
  MessageCenterDeliveryEvent,
  MessageCenterPaymentEvent,
  MessageCenterSignatureEvent
} from "./data";

const threads: MessageCenterCommunicationThread[] = [
  {
    id: "thread-1",
    organizationId: "org-1",
    opportunityId: null,
    appointmentId: null,
    customerId: "customer-1",
    projectId: "project-1",
    subjectType: "project",
    subjectId: "project-1",
    threadCategory: "operational",
    channelKind: "portal",
    threadStatus: "open",
    lastMessageAt: "2026-05-21T14:00:00.000Z",
    lastMessagePreview: "Can we confirm the arrival window?",
    lastMessageVisibility: "customer_visible",
    createdAt: "2026-05-21T13:00:00.000Z",
    updatedAt: "2026-05-21T14:00:00.000Z"
  }
];

const messages: MessageCenterCommunicationMessage[] = [
  {
    id: "message-1",
    organizationId: "org-1",
    threadId: "thread-1",
    customerId: "customer-1",
    projectId: "project-1",
    senderType: "portal_user",
    direction: "inbound",
    sourceKind: "human",
    channelKind: "portal",
    messageKind: "customer_message",
    visibility: "customer_visible",
    deliveryStatus: "logged",
    body: "Can we confirm the arrival window?",
    occurredAt: "2026-05-21T14:00:00.000Z",
    createdAt: "2026-05-21T14:00:00.000Z"
  }
];

const deliveryEvents: MessageCenterDeliveryEvent[] = [
  {
    id: "delivery-1",
    organizationId: "org-1",
    subjectType: "invoice",
    subjectId: "invoice-1",
    eventType: "failed",
    recipientName: "Avery Customer",
    recipientEmail: "avery@example.com",
    recipientRole: "customer",
    channel: "email",
    provider: "postmark",
    eventNote: null,
    createdAt: "2026-05-21T15:00:00.000Z"
  }
];

const signatureEvents: MessageCenterSignatureEvent[] = [
  {
    id: "signature-1",
    organizationId: "org-1",
    contractId: "contract-1",
    eventType: "signature_requested",
    actorType: "organization_user",
    providerEventId: null,
    occurredAt: "2026-05-21T12:00:00.000Z",
    createdAt: "2026-05-21T12:00:00.000Z"
  }
];

const paymentEvents: MessageCenterPaymentEvent[] = [
  {
    id: "payment-1",
    organizationId: "org-1",
    invoiceId: "invoice-1",
    paymentId: "payment-1",
    eventType: "payment_succeeded",
    actorType: "organization_user",
    gatewayProvider: null,
    providerEventId: null,
    occurredAt: "2026-05-21T16:00:00.000Z",
    createdAt: "2026-05-21T16:00:00.000Z"
  }
];

function buildSummary(): MessageCenterSummary {
  return deriveMessageCenterSummary({
    projectId: "project-1",
    threads,
    messages,
    deliveryEvents,
    signatureEvents,
    paymentEvents,
    estimates: [],
    contracts: [
      {
        id: "contract-1",
        label: "Contract C-1001",
        href: "/contracts/contract-1"
      }
    ],
    invoices: [
      {
        id: "invoice-1",
        label: "Invoice I-1001",
        href: "/invoices/invoice-1"
      }
    ],
    customerAccessCount: 1
  });
}

void test("messagecenter summary counts project communication trails", () => {
  const summary = buildSummary();

  assert.equal(summary.threadCount, 1);
  assert.equal(summary.messageCount, 1);
  assert.equal(summary.customerVisibleMessageCount, 1);
  assert.equal(summary.internalMessageCount, 0);
  assert.equal(summary.sendTrailCount, 1);
  assert.equal(summary.signatureTrailCount, 1);
  assert.equal(summary.paymentTrailCount, 1);
  assert.equal(summary.customerAccessCount, 1);
});

void test("messagecenter timeline orders mixed activity by occurrence", () => {
  const summary = buildSummary();

  assert.equal(summary.timeline[0].id, "payment:payment-1");
  assert.equal(summary.latestSendTrail?.href, "/invoices/invoice-1");
  assert.equal(summary.latestSignatureTrail?.href, "/contracts/contract-1");
  assert.equal(summary.latestPaymentTrail?.href, "/invoices/invoice-1");
});

void test("messagecenter next move points to attention before latest activity", () => {
  const summary = buildSummary();

  assert.equal(summary.attentionCount, 3);
  assert.equal(summary.customerReplyNeedsResponseCount, 1);
  assert.match(summary.nextMove.href, /^\/communications/);
  assert.match(summary.nextMove.detail, /portal customer reply/);
});

void test("messagecenter customer reply attention clears after contractor customer-visible response", () => {
  const summary = deriveMessageCenterSummary({
    projectId: "project-1",
    threads,
    messages: [
      ...messages,
      {
        ...messages[0],
        id: "message-2",
        senderType: "organization_user",
        direction: "outbound",
        body: "We will arrive at 8 AM.",
        occurredAt: "2026-05-21T14:30:00.000Z",
        createdAt: "2026-05-21T14:30:00.000Z"
      }
    ],
    deliveryEvents: [],
    signatureEvents: [],
    paymentEvents: [],
    estimates: [],
    contracts: [],
    invoices: [],
    customerAccessCount: 1
  });

  assert.equal(summary.customerReplyNeedsResponseCount, 0);
  assert.equal(summary.latestCustomerReply, null);
  assert.equal(summary.attentionCount, 0);
});

void test("messagecenter empty state falls back to communications workspace", () => {
  const summary = deriveMessageCenterSummary({
    projectId: "project-1",
    threads: [],
    messages: [],
    deliveryEvents: [],
    signatureEvents: [],
    paymentEvents: [],
    estimates: [],
    contracts: [],
    invoices: [],
    customerAccessCount: 0
  });

  assert.equal(summary.nextMove.href, "/communications?source=project");
  assert.equal(summary.timeline.length, 0);
});
