import assert from "node:assert/strict";
import test from "node:test";

import { deriveGuidedCaptureWorkspaceSummary } from "./guided-capture-workspace";

void test("deriveGuidedCaptureWorkspaceSummary marks complete project-owned capture ready for estimator review", () => {
  const summary = deriveGuidedCaptureWorkspaceSummary({
    project: {
      id: "project-1",
      name: "Garage floor"
    },
    opportunity: {
      id: "opp-1",
      requirementsSummary: "Prep cracks and coat two-car garage.",
      siteAssessmentStatus: "completed",
      measurements: [
        {
          id: "measurement-1",
          areaLabel: "Garage",
          valueNumeric: "528"
        }
      ],
      observations: [
        {
          id: "observation-1",
          title: "Door edge coating failure",
          severity: "high"
        }
      ],
      attachments: [
        {
          id: "attachment-1",
          attachmentType: "site_photo",
          mimeType: "image/jpeg",
          tag: "photo"
        }
      ]
    }
  });

  assert.equal(summary.readyForEstimator, true);
  assert.equal(summary.statusLabel, "Ready for estimator review");
  assert.equal(summary.checklist.length, 5);
  assert.equal(
    summary.checklist.every((item) => item.status === "complete"),
    true
  );
  assert.match(summary.riskPrompts.join("\n"), /Door edge coating failure/);
  assert.match(summary.boundaryNote, /does not approve estimates/);
});

void test("deriveGuidedCaptureWorkspaceSummary gives missing-info guidance without creating task state", () => {
  const summary = deriveGuidedCaptureWorkspaceSummary({
    project: {
      id: "project-2",
      name: "Warehouse polish"
    },
    opportunity: {
      id: "opp-2",
      siteAssessmentStatus: "scheduled",
      measurements: [],
      observations: [],
      attachments: []
    },
    estimates: []
  });

  assert.equal(summary.readyForEstimator, false);
  assert.equal(summary.statusLabel, "Capture missing context");
  assert.equal(
    summary.checklist.filter((item) => item.status === "missing").length,
    4
  );
  assert.equal(
    summary.checklist.find((item) => item.id === "site-assessment")?.status,
    "needs_review"
  );
  assert.match(summary.missingInfoGuidance.join("\n"), /Add customer goals/);
  assert.match(summary.missingInfoGuidance.join("\n"), /Capture reviewed area/);
  assert.doesNotMatch(JSON.stringify(summary), /task_id|workflow_engine/i);
});
