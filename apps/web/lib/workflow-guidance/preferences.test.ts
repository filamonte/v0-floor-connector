import assert from "node:assert/strict";
import test from "node:test";

import {
  areSafeInvoiceShortcutsAllowed,
  areAiProviderEnhancementsAllowed,
  defaultWorkflowGuidancePreferences,
  isAiAssistanceEnabled,
  normalizeWorkflowGuidancePreferences,
  shouldShowAiCopilotSummaries,
  shouldShowAiDashboardDigest,
  shouldShowAiDraftActions,
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
  assert.equal(shouldShowAiCopilotSummaries(preferences), false);
  assert.equal(shouldShowAiDraftActions(preferences), false);
  assert.equal(shouldShowAiDashboardDigest(preferences), false);
  assert.equal(areAiProviderEnhancementsAllowed(preferences), false);
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
    enableAiDrafting: true,
    enableAiDashboardDigest: true,
    requireConfirmationBeforeAiActions: false
  });

  assert.equal(preferences.workflowMode, "flexible");
  assert.equal(areSafeInvoiceShortcutsAllowed(preferences), true);
  assert.equal(isAiAssistanceEnabled(preferences), true);
  assert.equal(preferences.requireConfirmationBeforeAiActions, true);
  assert.equal(shouldShowAiCopilotSummaries(preferences), true);
  assert.equal(shouldShowAiDraftActions(preferences), true);
  assert.equal(shouldShowAiDashboardDigest(preferences), true);
});

void test("manual mode suppresses Copilot surfaces even when AI preferences are stored", () => {
  const preferences = normalizeWorkflowGuidancePreferences({
    workflowMode: "manual",
    enableAiSummaries: true,
    enableAiDrafting: true,
    enableAiDashboardDigest: true,
    enableAiProviderEnhancements: true
  });

  assert.equal(isAiAssistanceEnabled(preferences), true);
  assert.equal(shouldShowAiCopilotSummaries(preferences), false);
  assert.equal(shouldShowAiDraftActions(preferences), false);
  assert.equal(shouldShowAiDashboardDigest(preferences), false);
  assert.equal(areAiProviderEnhancementsAllowed(preferences), false);
});
