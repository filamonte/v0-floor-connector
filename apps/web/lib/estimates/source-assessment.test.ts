import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEstimateHandoffPacket,
  buildEstimateSourceAssessmentContext,
  getSystemMeasurementPrefillFromAssessment
} from "./source-assessment";

const baseOpportunity = {
  id: "opp-1",
  title: "Garage coating",
  serviceType: "Epoxy Flooring",
  requirementsSummary:
    "Crack repair at entry and moisture check before coating.",
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

void test("buildEstimateHandoffPacket derives site assessment scope story and links", () => {
  const packet = buildEstimateHandoffPacket({
    opportunity: {
      ...baseOpportunity,
      status: "estimating",
      notes: "Exclude stem wall unless customer approves add-on.",
      siteAssessmentStatus: "completed",
      siteAssessmentScheduledAt: "2026-05-04T15:00:00.000Z",
      siteAssessmentCompletedAt: "2026-05-04T17:00:00.000Z",
      observations: [
        {
          id: "obs-1",
          observationType: "surface_condition",
          title: "Existing coating",
          body: "Peeling near overhead door.",
          severity: "medium"
        }
      ],
      attachments: [
        {
          id: "att-1",
          attachmentType: "site_photo",
          fileName: "garage-door.jpg",
          mimeType: "image/jpeg",
          caption: "Door edge coating failure.",
          tag: "photo"
        },
        {
          id: "att-2",
          attachmentType: "document",
          fileName: "customer-notes.pdf",
          mimeType: "application/pdf",
          caption: null,
          tag: null
        }
      ],
      customer: {
        id: "customer-1",
        name: "Taylor Customer"
      },
      project: {
        id: "project-1",
        name: "Garage floor",
        status: "active"
      }
    },
    estimate: {
      id: "estimate-1",
      referenceNumber: "EST-100"
    },
    sourceOwner: {
      displayName: "Sam Site Assessor"
    }
  });

  assert.equal(packet.opportunity?.href, "/leads/opp-1");
  assert.equal(packet.estimate?.href, "/estimates/estimate-1");
  assert.equal(packet.project?.href, "/projects/project-1");
  assert.equal(packet.customer?.name, "Taylor Customer");
  assert.equal(packet.sourceOwner.name, "Sam Site Assessor");
  assert.equal(packet.sourceOwner.isCaptured, true);
  assert.equal(packet.siteAssessment.isCaptured, true);
  assert.equal(
    packet.scopeNotes.requirementsSummary,
    baseOpportunity.requirementsSummary
  );
  assert.equal(
    packet.scopeNotes.internalNotes,
    "Exclude stem wall unless customer approves add-on."
  );
  assert.equal(packet.measurements.count, 3);
  assert.equal(packet.measurements.groups[0]?.areaLabel, "Garage");
  assert.equal(packet.observations.count, 1);
  assert.equal(packet.observations.items[0]?.title, "Existing coating");
  assert.equal(packet.attachments.count, 2);
  assert.equal(packet.attachments.photoCount, 1);
  assert.equal(packet.attachments.fileCount, 1);
  assert.deepEqual(packet.missingInfo, []);
});

void test("buildEstimateHandoffPacket reports truthful missing optional context", () => {
  const packet = buildEstimateHandoffPacket({
    opportunity: {
      id: "opp-empty",
      title: "No packet yet",
      status: "qualified",
      siteAssessmentStatus: "scheduled",
      siteAssessmentScheduledAt: "2026-05-04T15:00:00.000Z",
      siteAssessmentCompletedAt: null,
      measurements: [],
      observations: [],
      attachments: []
    },
    estimate: {
      id: "estimate-empty",
      referenceNumber: "EST-101"
    },
    project: {
      id: "project-empty",
      name: "Fallback project"
    }
  });

  assert.equal(packet.siteAssessment.isCaptured, false);
  assert.equal(packet.project?.name, "Fallback project");
  assert.equal(packet.sourceOwner.name, null);
  assert.equal(packet.sourceOwner.isCaptured, false);
  assert.equal(packet.scopeNotes.requirementsSummary, null);
  assert.equal(packet.measurements.groups.length, 0);
  assert.equal(packet.attachments.count, 0);
  assert.match(
    packet.missingInfo.join("\n"),
    /Site assessment is not marked complete/
  );
  assert.match(
    packet.missingInfo.join("\n"),
    /Scope notes or requirements summary are missing/
  );
  assert.match(
    packet.missingInfo.join("\n"),
    /No reviewed measurements are linked/
  );
  assert.match(
    packet.missingInfo.join("\n"),
    /No surface-condition observations are linked/
  );
  assert.match(
    packet.missingInfo.join("\n"),
    /No photos\/files are linked yet/
  );
});

void test("buildEstimateHandoffPacket only includes the provided opportunity context", () => {
  const packet = buildEstimateHandoffPacket({
    opportunity: {
      ...baseOpportunity,
      id: "opp-selected",
      title: "Selected opportunity",
      measurements: [
        {
          id: "selected-measurement",
          areaLabel: "Selected garage",
          measurementType: "area",
          valueNumeric: "480",
          unit: "sqft",
          quantity: null,
          notes: null
        }
      ],
      observations: [],
      attachments: []
    }
  });

  assert.equal(packet.opportunity?.id, "opp-selected");
  assert.equal(packet.measurements.groups.length, 1);
  assert.equal(packet.measurements.groups[0]?.areaLabel, "Selected garage");
  assert.doesNotMatch(JSON.stringify(packet), /unrelated/i);
});
