import assert from "node:assert/strict";
import test from "node:test";

import {
  areSafeInvoiceShortcutsAllowed,
  defaultWorkflowGuidancePreferences,
  isAiAssistanceEnabled,
  normalizeWorkflowGuidancePreferences,
  shouldShowNextBestActions,
  shouldShowReadinessGuidance,
  shouldUseStrictReadinessPresentation
} from "./preferences";

void test("workflow guidance defaults to guided without enabling AI", () => {
  const preferences = normalizeWorkflowGuidancePreferences(null);

  assert.deepEqual(preferences, defaultWorkflowGuidancePreferences);
  assert.equal(shouldShowNextBestActions(preferences), true);
  assert.equal(shouldShowReadinessGuidance(preferences), true);
  assert.equal(shouldUseStrictReadinessPresentation(preferences), true);
  assert.equal(isAiAssistanceEnabled(preferences), false);
});

void test("manual mode reduces next-action guidance while preserving explicit readiness choice", () => {
  const preferences = normalizeWorkflowGuidancePreferences({
    workflowMode: "manual",
    showNextBestActions: true,
    showReadinessGuidance: true
  });

  assert.equal(preferences.workflowMode, "manual");
  assert.equal(shouldShowNextBestActions(preferences), false);
  assert.equal(shouldShowReadinessGuidance(preferences), true);
  assert.equal(shouldUseStrictReadinessPresentation(preferences), false);
});

void test("AI assistance and invoice shortcuts remain separate switches", () => {
  const preferences = normalizeWorkflowGuidancePreferences({
    workflowMode: "flexible",
    allowOneOffInvoiceShortcuts: true,
    enableAiSummaries: true,
    requireConfirmationBeforeAiActions: false
  });

  assert.equal(preferences.workflowMode, "flexible");
  assert.equal(areSafeInvoiceShortcutsAllowed(preferences), true);
  assert.equal(isAiAssistanceEnabled(preferences), true);
  assert.equal(preferences.requireConfirmationBeforeAiActions, true);
});
