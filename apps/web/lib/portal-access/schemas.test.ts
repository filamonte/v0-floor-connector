import assert from "node:assert/strict";
import test from "node:test";

import { portalInviteInputSchema } from "./schemas";

const customerId = "11111111-1111-4111-8111-111111111111";
const customerContactId = "22222222-2222-4222-8222-222222222222";
const projectId = "33333333-3333-4333-8333-333333333333";

void test("portal invites require a customer contact", () => {
  const result = portalInviteInputSchema.safeParse({
    customerId,
    customerContactId: null,
    projectId,
    invitedEmail: "customer@example.com"
  });

  assert.equal(result.success, false);
  if (result.success) {
    throw new Error("Expected portal invite validation to fail without a contact.");
  }
  assert.match(
    result.error.issues[0]?.message ?? "",
    /Select the customer contact receiving portal access/
  );
});

void test("portal invites keep contact, project, and invited email together", () => {
  const result = portalInviteInputSchema.safeParse({
    customerId,
    customerContactId,
    projectId,
    invitedEmail: "Customer@Example.com"
  });

  assert.equal(result.success, true);
  if (!result.success) {
    throw new Error("Expected contact-level portal invite validation to pass.");
  }
  assert.equal(result.data.customerContactId, customerContactId);
  assert.equal(result.data.invitedEmail, "customer@example.com");
});
