import assert from "node:assert/strict";
import test from "node:test";

import { deriveAssessmentEstimateHandoffSummary } from "./assessment-handoff";

void test("deriveAssessmentEstimateHandoffSummary marks complete assessment as estimator-ready without pricing", () => {
  const summary = deriveAssessmentEstimateHandoffSummary({
    project: {
      id: "project-1",
      name: "Garage floor"
    },
    assessment: {
      readinessState: "ready_for_estimate",
      requirementsSummary: "Crack repair and full broadcast flake.",
      measurementAreaCount: 1,
      measurementRecordCount: 3,
      observationCount: 2,
      photoCount: 4,
      fileCount: 1,
      missingInfo: [],
      riskSignals: [
        {
          title: "Moisture risk",
          detail: "Review vapor barrier before pricing."
        }
      ],
      sourceLinks: [
        {
          label: "Lead / opportunity",
          href: "/leads/opp-1"
        }
      ]
    },
    estimate: {
      id: "estimate-1",
      referenceNumber: "EST-100",
      status: "draft"
    }
  });

  assert.equal(summary.estimatorReady, true);
  assert.equal(summary.estimate?.href, "/estimates/estimate-1");
  assert.equal(summary.missingSignals.length, 0);
  assert.match(summary.evidenceSummary.measurements, /1 area/);
  assert.match(summary.estimatorReviewPrompts.join("\n"), /Moisture risk/);
  assert.match(summary.boundaryNote, /does not generate estimate lines/);
  assert.doesNotMatch(JSON.stringify(summary), /unit_price|line_items/i);
});

void test("deriveAssessmentEstimateHandoffSummary requires human review when scope or measurements are missing", () => {
  const summary = deriveAssessmentEstimateHandoffSummary({
    project: {
      id: "project-2",
      name: "Warehouse polish"
    },
    assessment: {
      readinessState: "needs_review",
      requirementsSummary: null,
      measurementAreaCount: 0,
      measurementRecordCount: 0,
      observationCount: 1,
      photoCount: 0,
      fileCount: 0,
      missingInfo: ["Site assessment has not been marked complete."],
      sourceLinks: []
    }
  });

  assert.equal(summary.estimatorReady, false);
  assert.equal(summary.estimate, null);
  assert.match(summary.readinessLabel, /needs estimator review/);
  assert.match(summary.missingSignals.join("\n"), /Scope summary/);
  assert.match(summary.missingSignals.join("\n"), /No measured areas/);
  assert.match(summary.missingSignals.join("\n"), /No assessment photos/);
  assert.match(
    summary.estimatorReviewPrompts.join("\n"),
    /Resolve missing assessment context/
  );
});
