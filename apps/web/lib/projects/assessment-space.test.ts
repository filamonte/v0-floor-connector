import assert from "node:assert/strict";
import test from "node:test";

import {
  assertAssessmentSpacePackageScope,
  buildAssessmentSpaceCreateRecord,
  calculateAssessmentSpaceMeasurements,
  deriveAssessmentSpacePackageSummary
} from "./assessment-space";

void test("calculateAssessmentSpaceMeasurements derives square feet and perimeter from dimensions", () => {
  const measurements = calculateAssessmentSpaceMeasurements({
    lengthFeet: "22",
    widthFeet: "24"
  });

  assert.deepEqual(measurements, {
    lengthFeet: "22.00",
    widthFeet: "24.00",
    squareFeet: "528.00",
    perimeterFeet: "92.00"
  });
});

void test("calculateAssessmentSpaceMeasurements preserves explicit square feet and perimeter overrides", () => {
  const measurements = calculateAssessmentSpaceMeasurements({
    lengthFeet: "22",
    widthFeet: "24",
    squareFeet: "530",
    perimeterFeet: "94"
  });

  assert.equal(measurements.squareFeet, "530.00");
  assert.equal(measurements.perimeterFeet, "94.00");
});

void test("buildAssessmentSpaceCreateRecord scopes area creation to tenant package and project", () => {
  const record = buildAssessmentSpaceCreateRecord({
    organizationId: "org-1",
    projectId: "project-1",
    assessmentPackageId: "package-1",
    userId: "user-1",
    name: "Garage",
    spaceType: "garage",
    floorLevel: "Level 1",
    lengthFeet: "22.00",
    widthFeet: "24.00",
    squareFeet: "528.00",
    perimeterFeet: "92.00",
    substrate: "Concrete",
    currentFlooring: "Bare slab",
    conditionSummary: "Minor cracks.",
    prepNotes: "Grind and repair cracks.",
    moistureNotes: "Test before coating.",
    accessNotes: "Driveway access.",
    sortOrder: 1
  });

  assert.equal(record.company_id, "org-1");
  assert.equal(record.project_id, "project-1");
  assert.equal(record.assessment_package_id, "package-1");
  assert.equal(record.square_feet, "528.00");
  assert.equal(record.created_by, "user-1");
  assert.doesNotMatch(
    JSON.stringify(record),
    /customer_id|estimate_id|job_id|material_id|catalog_id|workflow_id/
  );
});

void test("assertAssessmentSpacePackageScope rejects cross-tenant project or package records", () => {
  const assessmentSpace = {
    organizationId: "org-1",
    projectId: "project-1",
    assessmentPackageId: "package-1"
  };

  assert.doesNotThrow(() =>
    assertAssessmentSpacePackageScope({
      assessmentSpace,
      organizationId: "org-1",
      projectId: "project-1",
      assessmentPackageId: "package-1"
    })
  );
  assert.throws(
    () =>
      assertAssessmentSpacePackageScope({
        assessmentSpace,
        organizationId: "org-2",
        projectId: "project-1",
        assessmentPackageId: "package-1"
      }),
    /organization/
  );
  assert.throws(
    () =>
      assertAssessmentSpacePackageScope({
        assessmentSpace,
        organizationId: "org-1",
        projectId: "project-2",
        assessmentPackageId: "package-1"
      }),
    /project/
  );
  assert.throws(
    () =>
      assertAssessmentSpacePackageScope({
        assessmentSpace,
        organizationId: "org-1",
        projectId: "project-1",
        assessmentPackageId: "package-2"
      }),
    /assessment package/
  );
});

void test("deriveAssessmentSpacePackageSummary rolls up measurements without duplicate truth", () => {
  const summary = deriveAssessmentSpacePackageSummary([
    {
      id: "space-1",
      organizationId: "org-1",
      projectId: "project-1",
      assessmentPackageId: "package-1",
      name: "Garage",
      spaceType: "garage",
      floorLevel: "Level 1",
      lengthFeet: "22.00",
      widthFeet: "24.00",
      squareFeet: "528.00",
      perimeterFeet: "92.00",
      substrate: "Concrete",
      currentFlooring: "Bare slab",
      conditionSummary: "Minor cracks.",
      prepNotes: "Repair cracks.",
      moistureNotes: "Test before coating.",
      accessNotes: "Driveway access.",
      sortOrder: 1,
      createdByUserId: "user-1",
      updatedByUserId: "user-1",
      createdAt: "2026-06-09T12:00:00.000Z",
      updatedAt: "2026-06-09T12:00:00.000Z"
    },
    {
      id: "space-2",
      organizationId: "org-1",
      projectId: "project-1",
      assessmentPackageId: "package-1",
      name: "Patio",
      spaceType: "exterior",
      floorLevel: null,
      lengthFeet: null,
      widthFeet: null,
      squareFeet: "120.00",
      perimeterFeet: null,
      substrate: "Concrete",
      currentFlooring: null,
      conditionSummary: null,
      prepNotes: null,
      moistureNotes: null,
      accessNotes: null,
      sortOrder: 2,
      createdByUserId: "user-1",
      updatedByUserId: "user-1",
      createdAt: "2026-06-09T12:05:00.000Z",
      updatedAt: "2026-06-09T12:05:00.000Z"
    }
  ]);

  assert.equal(summary.total, 2);
  assert.equal(summary.measuredCount, 2);
  assert.equal(summary.totalSquareFeet, 648);
  assert.equal(summary.totalPerimeterFeet, 92);
  assert.deepEqual(summary.substrateLabels, ["Concrete"]);
  assert.doesNotMatch(
    JSON.stringify(summary),
    /customerId|estimateId|jobId|materialId|catalogId|workflowId/
  );
});
