import assert from "node:assert/strict";
import test from "node:test";

import { deriveCommunicationWriteFields } from "./write-policy";

void test("contractor internal messages stay internal notes", () => {
  const fields = deriveCommunicationWriteFields({
    actorKind: "organization_user",
    audience: "internal"
  });

  assert.equal(fields.visibility, "internal");
  assert.equal(fields.messageKind, "internal_note");
  assert.equal(fields.direction, "internal");
  assert.equal(fields.channelKind, "internal_note");
  assert.equal(fields.deliveryStatus, "logged");
  assert.equal(fields.nextThreadStatus, "open");
});

void test("contractor customer-visible messages are portal history without provider send state", () => {
  const fields = deriveCommunicationWriteFields({
    actorKind: "organization_user",
    audience: "customer_visible"
  });

  assert.equal(fields.visibility, "customer_visible");
  assert.equal(fields.messageKind, "customer_message");
  assert.equal(fields.direction, "outbound");
  assert.equal(fields.channelKind, "portal");
  assert.equal(fields.deliveryStatus, "logged");
  assert.equal(fields.nextThreadStatus, "waiting_on_customer");
});

void test("portal replies cannot create internal notes", () => {
  assert.throws(
    () =>
      deriveCommunicationWriteFields({
        actorKind: "portal_user",
        audience: "internal"
      }),
    /Portal replies cannot create internal notes/
  );
});

void test("portal replies are always customer-visible inbound messages", () => {
  const fields = deriveCommunicationWriteFields({
    actorKind: "portal_user",
    audience: "customer_visible"
  });

  assert.equal(fields.visibility, "customer_visible");
  assert.equal(fields.messageKind, "customer_message");
  assert.equal(fields.direction, "inbound");
  assert.equal(fields.channelKind, "portal");
  assert.equal(fields.deliveryStatus, "logged");
  assert.equal(fields.nextThreadStatus, "waiting_on_contractor");
});
