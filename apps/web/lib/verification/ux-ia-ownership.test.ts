import assert from "node:assert/strict";
import test from "node:test";

import {
  getRequiredUxIaImplementationCommits,
  getUxIaForbiddenBoundaries,
  getUxIaOwnershipAreas,
  getUxIaRequiredProtectedBoundaries,
  verifyUxIaOwnership,
  type UxIaImplementationCommitReview,
  type UxIaOwnershipCoverageInput
} from "./ux-ia-ownership";

const implementationChangedPaths: Record<string, string[]> = {
  "golden-workflow-usability-review-v1": [
    "apps/web/app/(app)/reports/page.tsx",
    "apps/web/lib/workflow-usability/golden-workflow-route-map.test.ts",
    "apps/web/lib/workflow-usability/golden-workflow-route-map.ts",
    "docs/current-state.md",
    "docs/review-packets/golden-workflow-usability-review-v1.md"
  ],
  "workspace-density-polish-v1": [
    "apps/web/app/(app)/financials/page.tsx",
    "apps/web/app/(app)/projects/[projectId]/page.tsx",
    "apps/web/app/(app)/reports/page.tsx",
    "apps/web/app/(app)/schedule/page.tsx",
    "apps/web/components/detail-panel.tsx"
  ],
  "manager-page-ownership-polish-v1": [
    "apps/web/app/(app)/communications/page.tsx",
    "apps/web/app/(app)/field/work-items/page.tsx",
    "apps/web/app/(app)/financials/accounts-receivable/page.tsx",
    "apps/web/app/(app)/financials/page.tsx",
    "apps/web/app/(app)/payments/page.tsx",
    "apps/web/app/(app)/projects/page.tsx",
    "apps/web/app/(app)/reports/page.tsx",
    "apps/web/app/(app)/schedule/page.tsx",
    "apps/web/components/contractor-workspace-page.tsx",
    "apps/web/components/dashboard/contractor-dashboard-surface.tsx"
  ],
  "portal-customer-clarity-polish-v1": [
    "apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx",
    "apps/web/app/(portal)/portal/page.tsx",
    "apps/web/app/(portal)/portal/projects/[projectId]/page.tsx",
    "apps/web/components/portal-project-summary-panel.tsx",
    "apps/web/lib/portal/closeout-handoff.ts",
    "apps/web/lib/portal/next-step.test.ts",
    "apps/web/lib/portal/next-step.ts",
    "apps/web/lib/portal/project-status-window.test.ts",
    "apps/web/lib/portal/project-status-window.ts",
    "apps/web/lib/portal/shared-documents.test.ts",
    "apps/web/lib/portal/shared-documents.ts",
    "apps/web/lib/portal/status-explanation.test.ts",
    "apps/web/lib/portal/status-explanation.ts",
    "e2e/portal-golden-path.spec.js",
    "e2e/portal-invite-acceptance.spec.js"
  ]
};

function reviewedImplementationCommits(): UxIaImplementationCommitReview[] {
  return getRequiredUxIaImplementationCommits().map((item) => ({
    ...item,
    status: "verified",
    changedPaths: implementationChangedPaths[item.stream],
    evidence: [`${item.stream} reviewed at ${item.commitHash}`]
  }));
}

function verifiedCoverage(): UxIaOwnershipCoverageInput[] {
  return getUxIaOwnershipAreas().map((area) => ({
    area,
    status: "verified",
    evidence: [`${area} ownership boundary evidence`],
    protectedBoundaries: getUxIaRequiredProtectedBoundaries(area),
    forbiddenBoundariesAbsent: getUxIaForbiddenBoundaries(area)
  }));
}

void test("UX IA ownership verification passes for reviewed implementation commits and bounded surfaces", () => {
  const summary = verifyUxIaOwnership({
    implementationReviews: reviewedImplementationCommits(),
    coverage: verifiedCoverage()
  });

  assert.equal(summary.confidence, "high");
  assert.equal(summary.findings.length, 0);
  assert.deepEqual(summary.schemaDriftPaths, []);
  assert.equal(
    summary.implementationStatus["golden-workflow-usability-review-v1"],
    "verified"
  );
  assert.equal(summary.coverageStatus.dashboard, "verified");
  assert.equal(summary.coverageStatus.project, "verified");
  assert.equal(summary.coverageStatus.field, "verified");
  assert.equal(summary.coverageStatus.financials, "verified");
  assert.equal(summary.coverageStatus.communications, "verified");
  assert.equal(summary.coverageStatus.portal, "verified");
  assert.equal(summary.coverageStatus.reports, "verified");
  assert.equal(summary.coverageStatus.settings, "verified");
  assert.equal(summary.coverageStatus.schema_and_models, "verified");
});

void test("UX IA ownership verification requires every implementation stream commit review", () => {
  const summary = verifyUxIaOwnership({
    implementationReviews: reviewedImplementationCommits().filter(
      (item) => item.stream !== "portal-customer-clarity-polish-v1"
    ),
    coverage: verifiedCoverage()
  });

  assert.equal(summary.confidence, "low");
  assert.equal(
    summary.implementationStatus["portal-customer-clarity-polish-v1"],
    "missing"
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "portal-customer-clarity-polish-v1:missing"
    )
  );
});

void test("UX IA ownership verification catches schema and migration drift", () => {
  const implementationReviews = reviewedImplementationCommits().map((item) =>
    item.stream === "workspace-density-polish-v1"
      ? {
          ...item,
          changedPaths: [
            ...item.changedPaths,
            "supabase/migrations/20260608000000_unapproved_ux_schema.sql"
          ]
        }
      : item
  );
  const summary = verifyUxIaOwnership({
    implementationReviews,
    coverage: verifiedCoverage()
  });

  assert.equal(summary.confidence, "low");
  assert.deepEqual(summary.schemaDriftPaths, [
    "supabase/migrations/20260608000000_unapproved_ux_schema.sql"
  ]);
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "schema-and-models:schema-drift-paths"
    )
  );
});

void test("UX IA ownership verification blocks duplicate action ownership and portal unsafe drift", () => {
  const coverage = verifiedCoverage().map((item) =>
    item.area === "dashboard" || item.area === "portal"
      ? {
          ...item,
          forbiddenBoundariesAbsent: []
        }
      : item
  );
  const summary = verifyUxIaOwnership({
    implementationReviews: reviewedImplementationCommits(),
    coverage
  });

  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "dashboard:forbidden-boundaries"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "portal:forbidden-boundaries"
    )
  );
});

void test("UX IA ownership verification lowers confidence for partial reports or settings proof", () => {
  const coverage = verifiedCoverage().map((item) =>
    item.area === "reports" || item.area === "settings"
      ? {
          ...item,
          status: "partial" as const
        }
      : item
  );
  const summary = verifyUxIaOwnership({
    implementationReviews: reviewedImplementationCommits(),
    coverage
  });

  assert.equal(summary.confidence, "medium");
  assert.ok(
    summary.missingOrBlockedCoverage.some((item) => item.area === "reports")
  );
  assert.ok(
    summary.missingOrBlockedCoverage.some((item) => item.area === "settings")
  );
});
