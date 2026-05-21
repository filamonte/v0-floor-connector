import assert from "node:assert/strict";
import { test } from "node:test";

import {
  warrantyDocumentSignerActionSchema,
  warrantyDocumentSignerInputSchema
} from "./schemas";

const warrantyDocumentId = "11111111-1111-4111-8111-111111111111";
const signerId = "22222222-2222-4222-8222-222222222222";

void test("warranty signer input trims signer fields and requires valid email", () => {
  const result = warrantyDocumentSignerInputSchema.safeParse({
    warrantyDocumentId,
    signerRole: "customer",
    signerName: "  Jane Customer  ",
    signerEmail: "  jane@example.com  "
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.signerName, "Jane Customer");
    assert.equal(result.data.signerEmail, "jane@example.com");
    assert.equal(result.data.signerId, null);
  }

  assert.equal(
    warrantyDocumentSignerInputSchema.safeParse({
      warrantyDocumentId,
      signerRole: "customer",
      signerName: "Jane Customer",
      signerEmail: "not-email"
    }).success,
    false
  );
});

void test("warranty signer action input requires signer and warranty document ids", () => {
  assert.equal(
    warrantyDocumentSignerActionSchema.safeParse({
      warrantyDocumentId,
      signerId
    }).success,
    true
  );
  assert.equal(
    warrantyDocumentSignerActionSchema.safeParse({
      warrantyDocumentId,
      signerId: "missing"
    }).success,
    false
  );
});
