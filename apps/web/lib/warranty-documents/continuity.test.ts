import assert from "node:assert/strict";
import test from "node:test";

import { summarizeWarrantyDocumentSignatures } from "./continuity";

void test("summarizeWarrantyDocumentSignatures counts signer request and signed states", () => {
  const summaries = summarizeWarrantyDocumentSignatures(
    ["warranty-a", "warranty-b"],
    [
      { subject_id: "warranty-a", status: "pending" },
      { subject_id: "warranty-a", status: "requested" },
      { subject_id: "warranty-a", status: "signed" },
      { subject_id: "warranty-b", status: "voided" },
      { subject_id: "unrelated", status: "requested" }
    ],
    [
      {
        subject_id: "warranty-a",
        event_type: "signature_requested",
        created_at: "2026-05-18T12:00:00.000Z"
      },
      {
        subject_id: "warranty-a",
        event_type: "viewed",
        created_at: "2026-05-18T13:00:00.000Z"
      },
      {
        subject_id: "warranty-b",
        event_type: "voided",
        created_at: "2026-05-18T11:00:00.000Z"
      }
    ]
  );

  assert.deepEqual(summaries.get("warranty-a"), {
    signerCount: 3,
    requestedSignerCount: 1,
    signedSignerCount: 1,
    latestEventType: "viewed",
    latestEventCreatedAt: "2026-05-18T13:00:00.000Z"
  });
  assert.deepEqual(summaries.get("warranty-b"), {
    signerCount: 1,
    requestedSignerCount: 0,
    signedSignerCount: 0,
    latestEventType: "voided",
    latestEventCreatedAt: "2026-05-18T11:00:00.000Z"
  });
  assert.equal(summaries.has("unrelated"), false);
});

void test("summarizeWarrantyDocumentSignatures returns zero summaries for documents without signer state", () => {
  const summaries = summarizeWarrantyDocumentSignatures(
    ["warranty-empty"],
    [],
    []
  );

  assert.deepEqual(summaries.get("warranty-empty"), {
    signerCount: 0,
    requestedSignerCount: 0,
    signedSignerCount: 0,
    latestEventType: null,
    latestEventCreatedAt: null
  });
});
