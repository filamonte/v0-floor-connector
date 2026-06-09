import assert from "node:assert/strict";
import test from "node:test";

import {
  type GuidedProjectCaptureImplementationEvidence,
  verifyGuidedProjectCaptureBoundaries
} from "./guided-project-capture";

const implementationEvidence: GuidedProjectCaptureImplementationEvidence[] = [
  {
    stream: "assessment-package-model-v1",
    commit: "38093cdf",
    files: [
      "apps/web/lib/projects/assessment-package.ts",
      "apps/web/lib/projects/assessment-package.test.ts"
    ],
    assertions: [
      "project_owns_assessment_context",
      "no_duplicate_project_model",
      "no_duplicate_estimate_model",
      "no_duplicate_attachment_model",
      "no_schema_migration_drift"
    ]
  },
  {
    stream: "guided-capture-workspace-v1",
    commit: "ebfc42fc",
    files: [
      "apps/web/lib/projects/guided-capture-workspace.ts",
      "apps/web/lib/projects/guided-capture-workspace.test.ts"
    ],
    assertions: [
      "project_owns_assessment_context",
      "ai_review_assist_only",
      "no_duplicate_task_workflow_model",
      "no_schema_migration_drift",
      "no_autonomous_approval"
    ]
  },
  {
    stream: "customer-assessment-capture-v1",
    commit: "799b40ca",
    files: [
      "apps/web/lib/portal/assessment-capture.ts",
      "apps/web/lib/portal/assessment-capture.test.ts"
    ],
    assertions: [
      "portal_customer_safe",
      "no_duplicate_attachment_model",
      "no_schema_migration_drift",
      "no_autonomous_approval",
      "no_direct_pricing_or_estimate_line_generation"
    ]
  },
  {
    stream: "assessment-to-estimate-handoff-v1",
    commit: "ebb45fa9",
    files: [
      "apps/web/lib/estimates/assessment-handoff.ts",
      "apps/web/lib/estimates/assessment-handoff.test.ts"
    ],
    assertions: [
      "estimate_consumes_approved_context",
      "no_duplicate_estimate_model",
      "no_schema_migration_drift",
      "no_direct_pricing_or_estimate_line_generation"
    ]
  }
];

void test("verifyGuidedProjectCaptureBoundaries passes for the reviewed implementation commits", () => {
  const summary = verifyGuidedProjectCaptureBoundaries({
    evidence: implementationEvidence
  });

  assert.equal(summary.status, "pass");
  assert.deepEqual(summary.failures, []);
  assert.deepEqual(summary.reviewedCommits, [
    "38093cdf",
    "799b40ca",
    "ebb45fa9",
    "ebfc42fc"
  ]);
  assert.equal(summary.streamStatus["assessment-package-model-v1"], "verified");
  assert.equal(
    summary.streamStatus["assessment-to-estimate-handoff-v1"],
    "verified"
  );
  assert.ok(
    summary.reviewedFiles.includes(
      "apps/web/lib/projects/assessment-package.ts"
    )
  );
  assert.ok(
    summary.reviewedFiles.includes("apps/web/lib/portal/assessment-capture.ts")
  );
});

void test("verifyGuidedProjectCaptureBoundaries fails schema or migration drift", () => {
  const evidence = implementationEvidence.map((item) =>
    item.stream === "assessment-package-model-v1"
      ? {
          ...item,
          files: [...item.files, "supabase/migrations/20260608_capture.sql"]
        }
      : item
  );

  const summary = verifyGuidedProjectCaptureBoundaries({ evidence });

  assert.equal(summary.status, "fail");
  assert.ok(
    summary.failures.some((failure) => failure.includes("forbidden schema"))
  );
});

void test("verifyGuidedProjectCaptureBoundaries fails portal customer-safety gaps", () => {
  const evidence = implementationEvidence.map((item) =>
    item.stream === "customer-assessment-capture-v1"
      ? {
          ...item,
          assertions: item.assertions.filter(
            (assertion) => assertion !== "portal_customer_safe"
          )
        }
      : item
  );

  const summary = verifyGuidedProjectCaptureBoundaries({ evidence });

  assert.equal(summary.status, "fail");
  assert.ok(
    summary.failures.some((failure) =>
      failure.includes("customer-assessment-capture-v1")
    )
  );
});

void test("verifyGuidedProjectCaptureBoundaries fails direct pricing or estimate-line handoff drift", () => {
  const evidence = implementationEvidence.map((item) =>
    item.stream === "assessment-to-estimate-handoff-v1"
      ? {
          ...item,
          assertions: item.assertions.filter(
            (assertion) =>
              assertion !== "no_direct_pricing_or_estimate_line_generation"
          )
        }
      : item
  );

  const summary = verifyGuidedProjectCaptureBoundaries({ evidence });

  assert.equal(summary.status, "fail");
  assert.ok(
    summary.failures.some((failure) =>
      failure.includes("assessment-to-estimate-handoff-v1")
    )
  );
});

void test("verifyGuidedProjectCaptureBoundaries fails duplicate task or workflow model drift", () => {
  const evidence = implementationEvidence.map((item) =>
    item.stream === "guided-capture-workspace-v1"
      ? {
          ...item,
          files: [...item.files, "apps/web/lib/projects/workflow-engine.ts"]
        }
      : item
  );

  const summary = verifyGuidedProjectCaptureBoundaries({ evidence });

  assert.equal(summary.status, "fail");
  assert.ok(
    summary.failures.some((failure) =>
      failure.includes("workflow, pricing, or estimate-line path")
    )
  );
});
