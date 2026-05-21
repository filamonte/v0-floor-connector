import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEstimateSourceAssessmentContext,
  getSystemMeasurementPrefillFromAssessment
} from "./source-assessment";

const baseOpportunity = {
  id: "opp-1",
  title: "Garage coating",
  serviceType: "Epoxy Flooring",
  requirementsSummary: "Crack repair at entry and moisture check before coating.",
  measurements: [
    {
      id: "m-area",
      areaLabel: "Garage",
      measurementType: "area",
      valueNumeric: "528",
      unit: "sqft",
      quantity: null,
      notes: "Measured onsite"
    },
    {
      id: "m-linear",
      areaLabel: "Garage",
      measurementType: "linear",
      valueNumeric: "92",
      unit: "lf",
      quantity: null,
      notes: null
    },
    {
      id: "m-count",
      areaLabel: "Garage",
      measurementType: "count",
      valueNumeric: "2",
      unit: "ea",
      quantity: null,
      notes: "Two drain covers"
    }
  ]
};

void test("buildEstimateSourceAssessmentContext groups upstream measurements by area label", () => {
  const context = buildEstimateSourceAssessmentContext(baseOpportunity);

  assert.equal(context?.opportunityId, "opp-1");
  assert.equal(context?.serviceType, "Epoxy Flooring");
  assert.equal(context?.measurementGroups.length, 1);
  assert.equal(context?.measurementGroups[0]?.areaLabel, "Garage");
  assert.equal(context?.measurementGroups[0]?.squareFootage, "528");
  assert.equal(context?.measurementGroups[0]?.linearFootage, "92");
  assert.equal(context?.measurementGroups[0]?.count, "2");
});

void test("getSystemMeasurementPrefillFromAssessment returns reviewable direct system inputs", () => {
  const context = buildEstimateSourceAssessmentContext(baseOpportunity);
  const prefill = getSystemMeasurementPrefillFromAssessment(context, "Garage");

  assert.equal(prefill?.inputMode, "direct");
  assert.equal(prefill?.squareFootage, "528");
  assert.equal(prefill?.linearFootage, "92");
  assert.equal(prefill?.count, "2");
  assert.equal(prefill?.groupLabel, "Garage");
  assert.match(prefill?.sourceLabel ?? "", /source assessment/i);
});
