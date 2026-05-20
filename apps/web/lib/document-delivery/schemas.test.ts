import assert from "node:assert/strict";
import { test } from "node:test";

import { documentDeliveryEventInputSchema } from "./schemas";

void test("document delivery input supports warranty, estimate, invoice, and contract manual evidence", () => {
  const warrantyResult = documentDeliveryEventInputSchema.safeParse({
    subjectType: "warranty_document",
    subjectId: "00000000-0000-4000-8000-000000000000",
    eventType: "delivery_recorded",
    recipientName: "Avery Customer",
    recipientEmail: "avery@example.com",
    recipientRole: "customer",
    channel: "internal",
    eventNote: "Customer was notified after warranty closeout."
  });
  const estimateResult = documentDeliveryEventInputSchema.safeParse({
    subjectType: "estimate",
    subjectId: "11111111-1111-4111-8111-111111111111",
    eventType: "delivery_recorded",
    recipientName: "Avery Customer",
    recipientEmail: "avery@example.com",
    recipientRole: "customer",
    channel: "manual",
    eventNote: "Printed and shared after review."
  });
  const invoiceResult = documentDeliveryEventInputSchema.safeParse({
    subjectType: "invoice",
    subjectId: "22222222-2222-4222-8222-222222222222",
    eventType: "send_requested",
    recipientName: "",
    recipientEmail: "",
    recipientRole: "",
    channel: "print",
    eventNote: ""
  });
  const contractResult = documentDeliveryEventInputSchema.safeParse({
    subjectType: "contract",
    subjectId: "33333333-3333-4333-8333-333333333333",
    eventType: "delivery_recorded",
    recipientName: "Avery Customer",
    recipientEmail: "avery@example.com",
    recipientRole: "customer",
    channel: "internal",
    eventNote:
      "Customer was notified by phone that the printed contract is ready."
  });

  assert.equal(warrantyResult.success, true);
  assert.equal(estimateResult.success, true);
  assert.equal(invoiceResult.success, true);
  assert.equal(contractResult.success, true);

  if (invoiceResult.success) {
    assert.equal(invoiceResult.data.recipientName, null);
    assert.equal(invoiceResult.data.recipientEmail, null);
    assert.equal(invoiceResult.data.eventNote, null);
  }
});

void test("document delivery input rejects unsupported subjects, provider events, and email channel actions", () => {
  assert.equal(
    documentDeliveryEventInputSchema.safeParse({
      subjectType: "change_order",
      subjectId: "33333333-3333-4333-8333-333333333333",
      eventType: "delivery_recorded",
      channel: "internal"
    }).success,
    false
  );
  assert.equal(
    documentDeliveryEventInputSchema.safeParse({
      subjectType: "estimate",
      subjectId: "44444444-4444-4444-8444-444444444444",
      eventType: "sent",
      channel: "internal"
    }).success,
    false
  );
  assert.equal(
    documentDeliveryEventInputSchema.safeParse({
      subjectType: "invoice",
      subjectId: "55555555-5555-4555-8555-555555555555",
      eventType: "delivery_recorded",
      channel: "email"
    }).success,
    false
  );
});
