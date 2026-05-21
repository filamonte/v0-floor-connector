import assert from "node:assert/strict";
import test from "node:test";

import {
  buildManualEstimateApprovalEvidence,
  manualEstimateApprovalEvidenceSchema
} from "./manual-approval";

void test("manualEstimateApprovalEvidenceSchema requires audit evidence for manual approval", () => {
  const result = manualEstimateApprovalEvidenceSchema.safeParse({
    approvedByName: "  Jordan Lee  ",
    approvalMethod: "paper_signature",
    approvalDate: "2026-05-14",
    approvalTime: "09:30",
    approvalNotes: "Approved after reviewing the revised garage scope.",
    approvalEvidence: "Signed paper proposal uploaded to the customer file."
  });

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.approvedByName, "Jordan Lee");
    assert.equal(result.data.approvalMethod, "paper_signature");
  }
});

void test("buildManualEstimateApprovalEvidence formats who, how, date, time, notes, and evidence", () => {
  const note = buildManualEstimateApprovalEvidence({
    approvedByName: "Jordan Lee",
    approvalMethod: "verbal",
    approvalDate: "2026-05-14",
    approvalTime: "15:45",
    approvalNotes: "Customer approved by phone.",
    approvalEvidence: "Call logged in office phone notes."
  });

  assert.match(note, /Manual approval recorded by contractor/i);
  assert.match(note, /Approved by: Jordan Lee/);
  assert.match(note, /How approved: Verbal approval/);
  assert.match(note, /Approval date\/time: 2026-05-14 15:45/);
  assert.match(note, /Notes: Customer approved by phone./);
  assert.match(note, /Evidence: Call logged in office phone notes./);
});
