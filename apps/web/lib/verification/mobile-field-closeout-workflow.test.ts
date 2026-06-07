import assert from "node:assert/strict";
import test from "node:test";

import {
  buildApprovedMobileFieldCloseoutVerificationInput,
  verifyMobileFieldCloseoutWorkflow
} from "./mobile-field-closeout-workflow";

void test("mobile field closeout verification passes approved canonical boundaries", () => {
  const summary = verifyMobileFieldCloseoutWorkflow(
    buildApprovedMobileFieldCloseoutVerificationInput()
  );

  assert.equal(summary.status, "verified");
  assert.equal(summary.confidence, "high");
  assert.equal(summary.findings.length, 0);
  assert.ok(summary.verifiedChecks.includes("field-capture:daily-logs"));
  assert.ok(
    summary.verifiedChecks.includes("field-capture:execution-attachments")
  );
  assert.ok(
    summary.verifiedChecks.includes("communications:review-first-handoff")
  );
  assert.ok(summary.verifiedChecks.includes("schema:no-migrations"));
});

void test("mobile field closeout verification blocks duplicate models", () => {
  const summary = verifyMobileFieldCloseoutWorkflow({
    ...buildApprovedMobileFieldCloseoutVerificationInput(),
    noDuplicateCloseoutModel: false,
    noDuplicateIssueModel: false,
    noDuplicatePunchListModel: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:closeout")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:issue")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:punch-list")
  );
});

void test("mobile field closeout verification blocks communications and portal drift", () => {
  const summary = verifyMobileFieldCloseoutWorkflow({
    ...buildApprovedMobileFieldCloseoutVerificationInput(),
    communicationsHandoffUsesReviewFirstDrafts: false,
    communicationsOwnsConversationAction: false,
    noAutonomousCustomerSends: false,
    portalBehaviorUnchanged: false,
    noPortalOnlyFieldCopies: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "communications:review-first-handoff"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "communications:owns-action"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "communications:no-autonomous-sends"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "portal:unchanged")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "portal:no-field-copies")
  );
});

void test("mobile field closeout verification blocks ownership and schema drift", () => {
  const summary = verifyMobileFieldCloseoutWorkflow({
    ...buildApprovedMobileFieldCloseoutVerificationInput(),
    quickCaptureUsesCanonicalDailyLogs: false,
    quickCaptureUsesCanonicalFieldNotes: false,
    blockerCaptureUsesFieldNotes: false,
    fieldEvidenceUsesExecutionAttachments: false,
    closeoutReadinessDerivedFromFieldRecords: false,
    fieldOwnsExecutionCapture: false,
    projectRemainsDiagnostic: false,
    financialsOwnsBillingAction: false,
    noSchemaOrMigrationChanges: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "field-capture:daily-logs"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "field-capture:field-notes"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "field-capture:blockers")
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "field-capture:execution-attachments"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "closeout:derived-field-records"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "ownership:field-capture")
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "ownership:project-diagnostic"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "ownership:financials-billing-action"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "schema:no-migrations")
  );
});
