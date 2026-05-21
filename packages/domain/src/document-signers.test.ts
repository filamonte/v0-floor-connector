import assert from "node:assert/strict";
import { test } from "node:test";

import {
  canTransitionDocumentSignerStatus,
  documentSignatureEventTypes,
  documentSignatureSubjectTypes,
  documentSignerStatusTransitions
} from "./index";

void test("document signer statuses support internal request and terminal-state guardrails", () => {
  assert.deepEqual(documentSignatureSubjectTypes, ["warranty_document"]);
  assert.deepEqual(documentSignatureEventTypes, [
    "signature_requested",
    "viewed",
    "signed",
    "declined",
    "voided"
  ]);
  assert.deepEqual(documentSignerStatusTransitions.pending, [
    "requested",
    "voided"
  ]);
  assert.equal(canTransitionDocumentSignerStatus("pending", "requested"), true);
  assert.equal(canTransitionDocumentSignerStatus("requested", "signed"), true);
  assert.equal(canTransitionDocumentSignerStatus("signed", "requested"), false);
  assert.equal(canTransitionDocumentSignerStatus("voided", "requested"), false);
});
