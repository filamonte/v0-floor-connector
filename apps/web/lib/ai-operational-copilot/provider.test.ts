import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultWorkflowGuidancePreferences,
  normalizeWorkflowGuidancePreferences
} from "../workflow-guidance/preferences";

import {
  getAiProviderAvailability,
  requestAiProviderEnhancement
} from "./provider";

void test("AI provider availability defaults to disabled with no provider dependency", () => {
  const availability = getAiProviderAvailability({
    preferences: defaultWorkflowGuidancePreferences
  });

  assert.equal(availability.mode, "disabled");
  assert.equal(availability.provider, "none");
  assert.equal(availability.available, false);
  assert.equal(availability.enabledByOrganization, false);
});

void test("provider enhancement setting enters deterministic fallback without live calls", () => {
  const preferences = normalizeWorkflowGuidancePreferences({
    workflowMode: "guided",
    enableAiProviderEnhancements: true,
    enableAiSummaries: true
  });
  const availability = getAiProviderAvailability({ preferences });

  assert.equal(availability.mode, "deterministic_fallback");
  assert.equal(availability.provider, "none");
  assert.equal(availability.available, false);
  assert.match(availability.reason, /No approved AI provider integration/);
});

void test("provider request returns review-first deterministic fallback text", () => {
  const preferences = normalizeWorkflowGuidancePreferences({
    workflowMode: "guided",
    enableAiProviderEnhancements: true,
    enableAiDrafting: true
  });
  const response = requestAiProviderEnhancement({
    preferences,
    request: {
      organizationId: "org-1",
      subjectType: "project",
      subjectId: "project-1",
      capability: "draft_action_enhancement",
      canonicalContextSummary: "Waiting on signed contract.",
      sourceSignals: ["Contract", "Signature Trail"],
      reviewRequired: true
    }
  });

  assert.equal(response.usedProvider, false);
  assert.equal(response.reviewRequired, true);
  assert.equal(response.text, "Waiting on signed contract.");
  assert.deepEqual(response.sourceSignals, ["Contract", "Signature Trail"]);
});
