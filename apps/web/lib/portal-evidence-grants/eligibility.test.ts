import assert from "node:assert/strict";
import test from "node:test";

import { isPortalEvidenceGrantEligibleAttachment } from "./eligibility";

void test("portal evidence grants reject internal Work Item evidence subjects", () => {
  assert.equal(
    isPortalEvidenceGrantEligibleAttachment({
      subjectType: "work_item",
      archivedAt: null
    }),
    false
  );
});

void test("portal evidence grants allow only active Daily Log or Job Note evidence", () => {
  assert.equal(
    isPortalEvidenceGrantEligibleAttachment({
      subjectType: "daily_log",
      archivedAt: null
    }),
    true
  );
  assert.equal(
    isPortalEvidenceGrantEligibleAttachment({
      subjectType: "field_note",
      archivedAt: null
    }),
    true
  );
  assert.equal(
    isPortalEvidenceGrantEligibleAttachment({
      subjectType: "field_note",
      archivedAt: "2026-05-27T19:00:00.000Z"
    }),
    false
  );
});
