import assert from "node:assert/strict";
import test from "node:test";

import {
  buildApprovedFieldExecutionDepthVerificationInput,
  verifyFieldExecutionWorkflow
} from "./field-execution-workflow";

void test("field execution workflow verification passes the approved canonical ownership matrix", () => {
  const summary = verifyFieldExecutionWorkflow(
    buildApprovedFieldExecutionDepthVerificationInput()
  );

  assert.equal(summary.status, "verified");
  assert.equal(summary.confidence, "high");
  assert.equal(summary.findings.length, 0);
  assert.ok(
    summary.verifiedChecks.includes(
      "field-handoff:canonical-schedule-job-project"
    )
  );
  assert.ok(summary.verifiedChecks.includes("daily-execution:daily-logs"));
  assert.ok(summary.verifiedChecks.includes("daily-execution:field-notes"));
  assert.ok(
    summary.verifiedChecks.includes("crew-visibility:office-attention")
  );
  assert.ok(summary.verifiedChecks.includes("portal:unchanged"));
  assert.ok(summary.verifiedChecks.includes("schema:no-migrations"));
});

void test("field execution workflow verification blocks duplicate execution models", () => {
  const summary = verifyFieldExecutionWorkflow({
    ...buildApprovedFieldExecutionDepthVerificationInput(),
    noDuplicateIssueTrackerModel: false,
    noDuplicatePunchListModel: false,
    noDuplicateDispatchModel: false,
    noDuplicateScheduleModel: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "duplicates:issue-tracker"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:punch-list")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:dispatch")
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "duplicates:schedule")
  );
});

void test("field execution workflow verification blocks ownership drift across project dashboard settings and portal", () => {
  const summary = verifyFieldExecutionWorkflow({
    ...buildApprovedFieldExecutionDepthVerificationInput(),
    projectRemainsDiagnostic: false,
    fieldOwnsExecutionAction: false,
    dashboardDoesNotOwnExecutionWorkspace: false,
    settingsOwnsConfiguration: false,
    portalBehaviorUnchanged: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "ownership:project-diagnostic"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "ownership:field-action")
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "ownership:dashboard-boundary"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "ownership:settings-configuration"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "portal:unchanged")
  );
});

void test("field execution workflow verification blocks schema and canonical source drift", () => {
  const summary = verifyFieldExecutionWorkflow({
    ...buildApprovedFieldExecutionDepthVerificationInput(),
    fieldHandoffUsesCanonicalScheduleJobProject: false,
    dailyExecutionUsesCanonicalDailyLogs: false,
    dailyExecutionUsesCanonicalFieldNotes: false,
    blockersUseFieldNotes: false,
    photosUseExecutionAttachments: false,
    officeAttentionDerivedFromCanonicalRecords: false,
    closeoutReadinessDerivedFromCanonicalRecords: false,
    noSchemaOrMigrationChanges: false
  });

  assert.equal(summary.status, "hold");
  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "field-handoff:canonical-schedule-job-project"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "daily-execution:daily-logs"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "daily-execution:field-notes"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "daily-execution:blockers"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "daily-execution:photos")
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "crew-visibility:office-attention"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "crew-visibility:closeout-readiness"
    )
  );
  assert.ok(
    summary.findings.some((finding) => finding.id === "schema:no-migrations")
  );
});
