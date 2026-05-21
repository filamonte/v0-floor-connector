import type {
  WorkflowGuidanceMode,
  WorkflowGuidancePreferences
} from "@floorconnector/types";

export const workflowGuidanceModes: readonly WorkflowGuidanceMode[] = [
  "guided",
  "flexible",
  "manual"
] as const;

export const defaultWorkflowGuidancePreferences: WorkflowGuidancePreferences = {
  workflowMode: "guided",
  showNextBestActions: true,
  showReadinessGuidance: true,
  strictReadinessEnforcement: true,
  allowOneOffInvoiceShortcuts: false,
  showShortcutCleanupPrompts: true,
  showWorkflowExplanationCopy: true,
  enableAiSuggestions: false,
  enableAiSummaries: false,
  enableAiDrafting: false,
  enableAiFormPrefillSuggestions: false,
  enableAiWorkItemRecommendations: false,
  requireConfirmationBeforeAiActions: true
};

function coerceBoolean(
  candidate: unknown,
  fallback: boolean,
  mode: WorkflowGuidanceMode
) {
  if (typeof candidate === "boolean") {
    return candidate;
  }

  if (mode === "manual" && fallback === true) {
    return false;
  }

  return fallback;
}

function normalizeWorkflowMode(candidate: unknown): WorkflowGuidanceMode {
  return typeof candidate === "string" &&
    workflowGuidanceModes.includes(candidate as WorkflowGuidanceMode)
    ? (candidate as WorkflowGuidanceMode)
    : defaultWorkflowGuidancePreferences.workflowMode;
}

export function normalizeWorkflowGuidancePreferences(
  value: unknown
): WorkflowGuidancePreferences {
  if (!value || typeof value !== "object") {
    return defaultWorkflowGuidancePreferences;
  }

  const candidate = value as Partial<Record<keyof WorkflowGuidancePreferences, unknown>>;
  const workflowMode = normalizeWorkflowMode(candidate.workflowMode);

  return {
    workflowMode,
    showNextBestActions: coerceBoolean(
      candidate.showNextBestActions,
      workflowMode === "manual" ? false : defaultWorkflowGuidancePreferences.showNextBestActions,
      workflowMode
    ),
    showReadinessGuidance: coerceBoolean(
      candidate.showReadinessGuidance,
      workflowMode === "manual"
        ? false
        : defaultWorkflowGuidancePreferences.showReadinessGuidance,
      workflowMode
    ),
    strictReadinessEnforcement: coerceBoolean(
      candidate.strictReadinessEnforcement,
      workflowMode === "guided",
      workflowMode
    ),
    allowOneOffInvoiceShortcuts: coerceBoolean(
      candidate.allowOneOffInvoiceShortcuts,
      defaultWorkflowGuidancePreferences.allowOneOffInvoiceShortcuts,
      workflowMode
    ),
    showShortcutCleanupPrompts: coerceBoolean(
      candidate.showShortcutCleanupPrompts,
      workflowMode !== "manual",
      workflowMode
    ),
    showWorkflowExplanationCopy: coerceBoolean(
      candidate.showWorkflowExplanationCopy,
      workflowMode !== "manual",
      workflowMode
    ),
    enableAiSuggestions: coerceBoolean(
      candidate.enableAiSuggestions,
      defaultWorkflowGuidancePreferences.enableAiSuggestions,
      workflowMode
    ),
    enableAiSummaries: coerceBoolean(
      candidate.enableAiSummaries,
      defaultWorkflowGuidancePreferences.enableAiSummaries,
      workflowMode
    ),
    enableAiDrafting: coerceBoolean(
      candidate.enableAiDrafting,
      defaultWorkflowGuidancePreferences.enableAiDrafting,
      workflowMode
    ),
    enableAiFormPrefillSuggestions: coerceBoolean(
      candidate.enableAiFormPrefillSuggestions,
      defaultWorkflowGuidancePreferences.enableAiFormPrefillSuggestions,
      workflowMode
    ),
    enableAiWorkItemRecommendations: coerceBoolean(
      candidate.enableAiWorkItemRecommendations,
      defaultWorkflowGuidancePreferences.enableAiWorkItemRecommendations,
      workflowMode
    ),
    requireConfirmationBeforeAiActions: true
  };
}

export function shouldShowNextBestActions(
  preferences: WorkflowGuidancePreferences
) {
  return preferences.workflowMode !== "manual" && preferences.showNextBestActions;
}

export function shouldShowReadinessGuidance(
  preferences: WorkflowGuidancePreferences
) {
  return preferences.showReadinessGuidance;
}

export function shouldUseStrictReadinessPresentation(
  preferences: WorkflowGuidancePreferences
) {
  return preferences.workflowMode === "guided" && preferences.strictReadinessEnforcement;
}

export function isAiAssistanceEnabled(
  preferences: WorkflowGuidancePreferences
) {
  return (
    preferences.enableAiSuggestions ||
    preferences.enableAiSummaries ||
    preferences.enableAiDrafting ||
    preferences.enableAiFormPrefillSuggestions ||
    preferences.enableAiWorkItemRecommendations
  );
}

export function areSafeInvoiceShortcutsAllowed(
  preferences: WorkflowGuidancePreferences
) {
  return preferences.allowOneOffInvoiceShortcuts;
}
