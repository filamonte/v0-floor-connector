import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAssessmentPackageOpportunityScope,
  assertAssessmentPackageProjectScope,
  buildAssessmentPackageCreateRecord,
  canTransitionAssessmentPackageStatus,
  deriveAssessmentPackageProjectSummary,
  deriveProjectAssessmentPackageSummary,
  getAssessmentPackageOwnershipStage
} from "./assessment-package";

void test("deriveProjectAssessmentPackageSummary keeps assessment package owned by project context", () => {
  const summary = deriveProjectAssessmentPackageSummary({
    project: {
      id: "project-1",
      name: "Garage floor",
      status: "active"
    },
    customer: {
      id: "customer-1",
      name: "Taylor Customer",
      companyName: "Taylor Homes"
    },
    opportunity: {
      id: "opp-1",
      title: "Garage coating",
      status: "estimating",
      serviceType: "Epoxy Flooring",
      requirementsSummary: "Crack repair and moisture check before coating.",
      notes: "Customer wants flake sample review.",
      siteAssessmentStatus: "completed",
      measurements: [
        {
          id: "measurement-1",
          areaLabel: "Garage",
          measurementType: "area",
          valueNumeric: "528",
          unit: "sqft"
        }
      ],
      observations: [
        {
          id: "observation-1",
          title: "Peeling near overhead door",
          body: "Prep risk near vehicle entry.",
          severity: "high",
          observationType: "surface_condition"
        }
      ],
      attachments: [
        {
          id: "attachment-1",
          attachmentType: "site_photo",
          fileName: "garage-door.jpg",
          mimeType: "image/jpeg",
          tag: "photo"
        }
      ]
    },
    estimates: [
      {
        id: "estimate-1",
        referenceNumber: "EST-100",
        status: "draft"
      }
    ]
  });

  assert.equal(summary.project.href, "/projects/project-1");
  assert.equal(summary.customer?.label, "Taylor Homes");
  assert.equal(summary.sourceOpportunity?.href, "/leads/opp-1");
  assert.equal(summary.readiness.state, "ready_for_estimate");
  assert.equal(summary.estimateHandoff.ready, true);
  assert.equal(summary.estimateHandoff.href, "/estimates/estimate-1");
  assert.equal(summary.counts.measurementAreas, 1);
  assert.equal(summary.counts.photos, 1);
  assert.equal(summary.missingInfo.length, 0);
  assert.match(summary.riskSignals[0]?.title ?? "", /Peeling/);
  assert.match(
    summary.sourceLinks.map((link) => link.detail).join("\n"),
    /Project owns the assessment package context/
  );
});

void test("deriveProjectAssessmentPackageSummary reports missing context without creating duplicate truth", () => {
  const summary = deriveProjectAssessmentPackageSummary({
    project: {
      id: "project-empty",
      name: "No context project",
      status: "draft"
    },
    opportunity: {
      id: "opp-empty",
      title: "Incomplete lead",
      status: "qualified",
      measurements: [],
      observations: [],
      attachments: []
    },
    estimates: []
  });

  assert.equal(summary.readiness.state, "missing_context");
  assert.equal(summary.estimateHandoff.ready, false);
  assert.equal(summary.estimateHandoff.href, "/projects/project-empty");
  assert.equal(summary.counts.measurementAreas, 0);
  assert.equal(summary.counts.estimateRecords, 0);
  assert.match(
    summary.missingInfo.join("\n"),
    /Site assessment has not been marked complete/
  );
  assert.match(
    summary.missingInfo.join("\n"),
    /No reviewed measurements are linked/
  );
  assert.match(
    summary.riskSignals.map((signal) => signal.detail).join("\n"),
    /No project assessment photos are linked/
  );
  assert.doesNotMatch(JSON.stringify(summary), /assessment_package_id/i);
});

void test("canTransitionAssessmentPackageStatus allows estimator handoff path and blocks invalid jumps", () => {
  assert.equal(
    canTransitionAssessmentPackageStatus("draft", "in_progress"),
    true
  );
  assert.equal(
    canTransitionAssessmentPackageStatus("in_progress", "ready_for_estimate"),
    true
  );
  assert.equal(
    canTransitionAssessmentPackageStatus("ready_for_estimate", "draft"),
    false
  );
  assert.equal(
    canTransitionAssessmentPackageStatus("archived", "ready_for_estimate"),
    false
  );
});

void test("deriveAssessmentPackageProjectSummary keeps persisted packages project-owned", () => {
  const summary = deriveAssessmentPackageProjectSummary({
    projectId: "project-1",
    packages: [
      {
        id: "assessment-package-1",
        organizationId: "org-1",
        opportunityId: null,
        projectId: "project-1",
        status: "ready_for_estimate",
        title: "Garage assessment package",
        assessmentDate: "2026-06-09",
        siteContactName: "Taylor Customer",
        siteContactPhone: "555-0100",
        accessNotes: "Gate code is available from the customer.",
        parkingNotes: "Park in driveway.",
        siteNotes: "Garage is clear.",
        customerGoals: "Durable flake floor.",
        currentConditionsSummary: "Minor cracks at threshold.",
        recommendedSystemSummary: "Moisture test before flake system.",
        riskSummary: "Threshold prep risk.",
        estimateHandoffSummary: "Estimator should include crack repair.",
        createdByUserId: "user-1",
        updatedByUserId: "user-1",
        createdAt: "2026-06-09T10:00:00.000Z",
        updatedAt: "2026-06-09T11:00:00.000Z"
      }
    ]
  });

  assert.equal(summary.total, 1);
  assert.equal(summary.activeCount, 1);
  assert.equal(summary.readyForEstimateCount, 1);
  assert.equal(
    summary.primaryHref,
    "/projects/project-1/assessment-packages/assessment-package-1"
  );
  assert.match(summary.statusDetail, /Estimator should include crack repair/);
  assert.doesNotMatch(
    JSON.stringify(summary.latestPackage),
    /customerId|estimateId|jobId|materialId|workflowId/
  );
});

void test("buildAssessmentPackageCreateRecord scopes creation to active tenant project and user", () => {
  const record = buildAssessmentPackageCreateRecord({
    organizationId: "org-active",
    projectId: "project-active",
    userId: "user-active",
    title: "Assessment package",
    assessmentDate: null
  });

  assert.deepEqual(record, {
    company_id: "org-active",
    opportunity_id: null,
    project_id: "project-active",
    status: "draft",
    title: "Assessment package",
    assessment_date: null,
    created_by: "user-active",
    updated_by: "user-active"
  });
  assert.doesNotMatch(
    JSON.stringify(record),
    /customer_id|estimate_id|job_id|field_id|material_id|workflow_id/
  );
});

void test("buildAssessmentPackageCreateRecord supports opportunity-owned packages before project creation", () => {
  const record = buildAssessmentPackageCreateRecord({
    organizationId: "org-active",
    opportunityId: "opportunity-active",
    projectId: null,
    userId: "user-active",
    title: "Pre-estimate assessment package",
    assessmentDate: "2026-06-09"
  });

  assert.deepEqual(record, {
    company_id: "org-active",
    opportunity_id: "opportunity-active",
    project_id: null,
    status: "draft",
    title: "Pre-estimate assessment package",
    assessment_date: "2026-06-09",
    created_by: "user-active",
    updated_by: "user-active"
  });
  assert.doesNotMatch(
    JSON.stringify(record),
    /customer_id|estimate_id|job_id|field_id|material_id|workflow_id/
  );
});

void test("buildAssessmentPackageCreateRecord requires opportunity or project ownership", () => {
  assert.throws(
    () =>
      buildAssessmentPackageCreateRecord({
        organizationId: "org-active",
        userId: "user-active",
        title: "Unowned assessment package",
        assessmentDate: null
      }),
    /opportunity or project/
  );
});

void test("assertAssessmentPackageProjectScope rejects cross-project or cross-tenant packages", () => {
  const assessmentPackage = {
    organizationId: "org-1",
    opportunityId: null,
    projectId: "project-1"
  };

  assert.doesNotThrow(() =>
    assertAssessmentPackageProjectScope({
      assessmentPackage,
      organizationId: "org-1",
      projectId: "project-1"
    })
  );
  assert.throws(
    () =>
      assertAssessmentPackageProjectScope({
        assessmentPackage,
        organizationId: "org-2",
        projectId: "project-1"
      }),
    /organization/
  );
  assert.throws(
    () =>
      assertAssessmentPackageProjectScope({
        assessmentPackage,
        organizationId: "org-1",
        projectId: "project-2"
      }),
    /project/
  );
});

void test("assertAssessmentPackageOpportunityScope rejects cross-opportunity or cross-tenant packages", () => {
  const assessmentPackage = {
    organizationId: "org-1",
    opportunityId: "opportunity-1",
    projectId: null
  };

  assert.doesNotThrow(() =>
    assertAssessmentPackageOpportunityScope({
      assessmentPackage,
      organizationId: "org-1",
      opportunityId: "opportunity-1"
    })
  );
  assert.throws(
    () =>
      assertAssessmentPackageOpportunityScope({
        assessmentPackage,
        organizationId: "org-2",
        opportunityId: "opportunity-1"
      }),
    /organization/
  );
  assert.throws(
    () =>
      assertAssessmentPackageOpportunityScope({
        assessmentPackage,
        organizationId: "org-1",
        opportunityId: "opportunity-2"
      }),
    /opportunity/
  );
});

void test("getAssessmentPackageOwnershipStage distinguishes pre-sale from project continuity", () => {
  assert.equal(
    getAssessmentPackageOwnershipStage({
      opportunityId: "opportunity-1",
      projectId: null
    }),
    "pre_sale"
  );
  assert.equal(
    getAssessmentPackageOwnershipStage({
      opportunityId: "opportunity-1",
      projectId: "project-1"
    }),
    "project_continuity"
  );
});
