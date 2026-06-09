import assert from "node:assert/strict";
import test from "node:test";

import { derivePortalAssessmentCaptureSummary } from "./assessment-capture";

void test("derivePortalAssessmentCaptureSummary shows customer-safe requested assessment prompts", () => {
  const summary = derivePortalAssessmentCaptureSummary({
    project: {
      id: "project-1",
      name: "Garage floor"
    },
    portalHasProjectAccess: true,
    requestedItems: [
      {
        id: "photos",
        label: "Garage photos",
        status: "requested",
        customerPrompt:
          "Upload clear photos of the garage floor, cracks, and door edges.",
        internalReviewRequired: true
      },
      {
        id: "finish",
        label: "Finish preference",
        status: "under_review",
        customerPrompt: "Confirm preferred flake blend.",
        submittedSummary: "Customer prefers light gray flake.",
        internalReviewRequired: true
      }
    ]
  });

  assert.equal(summary.statusLabel, "Info requested");
  assert.equal(summary.requestedCount, 1);
  assert.equal(summary.underReviewCount, 1);
  assert.equal(summary.nextCustomerPrompts.length, 1);
  assert.match(
    summary.customerMessage,
    /need a little more project information/
  );
  assert.match(summary.reviewBoundary.detail, /do not approve scope/);
  assert.match(
    summary.safeVisibilityNotes.join("\n"),
    /contractor-only proof remain hidden/
  );
});

void test("derivePortalAssessmentCaptureSummary hides prompts without portal project access", () => {
  const summary = derivePortalAssessmentCaptureSummary({
    project: {
      id: "project-2",
      name: "Warehouse polish"
    },
    portalHasProjectAccess: false,
    requestedItems: [
      {
        id: "internal-risk",
        label: "Internal risk",
        status: "requested",
        customerPrompt: "Hidden when access is missing.",
        submittedSummary: "Contractor-only context",
        internalReviewRequired: true
      }
    ]
  });

  assert.equal(summary.statusLabel, "No assessment requests");
  assert.equal(summary.requestedCount, 0);
  assert.equal(summary.nextCustomerPrompts.length, 0);
  assert.match(summary.customerMessage, /not available/);
  assert.match(
    summary.safeVisibilityNotes.join("\n"),
    /Portal access is required/
  );
  assert.doesNotMatch(JSON.stringify(summary), /Contractor-only context/);
});
