import assert from "node:assert/strict";
import test from "node:test";

import { deriveSendTrailSummary } from "./summary";

const sourceRecords = [
  {
    id: "estimate-1",
    type: "estimate" as const,
    label: "Estimate E-1001",
    href: "/estimates/estimate-1"
  },
  {
    id: "contract-1",
    type: "contract" as const,
    label: "Contract C-1001",
    href: "/contracts/contract-1"
  },
  {
    id: "invoice-1",
    type: "invoice" as const,
    label: "Invoice I-1001",
    href: "/invoices/invoice-1"
  }
];

void test("contract signature-request event becomes Send Trail item", () => {
  const summary = deriveSendTrailSummary({
    sourceRecords,
    signatureEvents: [
      {
        id: "signature-1",
        contractId: "contract-1",
        eventType: "signature_requested",
        actorType: "organization_user",
        occurredAt: "2026-05-21T15:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.items[0]?.type, "contract_signature_requested");
  assert.equal(summary.items[0]?.tone, "pending");
  assert.equal(summary.items[0]?.sourceHref, "/contracts/contract-1");
  assert.equal(summary.nextMove.label, "Review pending send");
});

void test("payment request event becomes Send Trail item", () => {
  const summary = deriveSendTrailSummary({
    sourceRecords,
    paymentEvents: [
      {
        id: "payment-1",
        invoiceId: "invoice-1",
        eventType: "payment_requested",
        actorType: "organization_user",
        gatewayProvider: null,
        occurredAt: "2026-05-21T16:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.items[0]?.type, "invoice_payment_requested");
  assert.equal(summary.items[0]?.tone, "pending");
  assert.equal(summary.items[0]?.sourceLabel, "Invoice I-1001");
});

void test("portal view becomes viewed item", () => {
  const summary = deriveSendTrailSummary({
    sourceRecords,
    portalViews: [
      {
        id: "view-1",
        subjectType: "estimate",
        subjectId: "estimate-1",
        viewedAt: "2026-05-21T17:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.items[0]?.type, "portal_view");
  assert.equal(summary.items[0]?.tone, "viewed");
  assert.equal(summary.nextMove.label, "Open viewed record");
});

void test("failed notification delivery becomes attention item", () => {
  const summary = deriveSendTrailSummary({
    sourceRecords,
    deliveryEvents: [
      {
        id: "delivery-1",
        subjectType: "invoice",
        subjectId: "invoice-1",
        eventType: "failed",
        recipientName: "Avery Customer",
        recipientEmail: "avery@example.com",
        recipientRole: "customer",
        channel: "email",
        provider: "postmark",
        eventNote: "Provider rejected the message.",
        createdAt: "2026-05-21T18:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.counts.failed, 1);
  assert.equal(summary.attentionCount, 1);
  assert.equal(summary.nextMove.label, "Review send issue");
  assert.equal(summary.nextMove.href, "/invoices/invoice-1");
});

void test("empty fallback stays read-only and points to communications", () => {
  const summary = deriveSendTrailSummary({});

  assert.equal(summary.items.length, 0);
  assert.equal(summary.latestItem, null);
  assert.equal(summary.nextMove.href, "/communications");
});
