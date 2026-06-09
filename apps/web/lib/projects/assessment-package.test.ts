import assert from "node:assert/strict";
import test from "node:test";

import { deriveProjectAssessmentPackageSummary } from "./assessment-package";

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
