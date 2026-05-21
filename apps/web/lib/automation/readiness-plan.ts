import type {
  AutomationNotificationPreference,
  AutomationNotificationPreferenceCategory,
  AutomationNotificationTemplateDefinition,
  AutomationPlanningReadinessStatus,
  AutomationPlanningSummary
} from "@floorconnector/types";

import type { AutomationEventEligibilityResult } from "@/lib/automation/eligibility";

type AutomationReadinessPlanInput = {
  preferences: AutomationNotificationPreference[];
  eligibilityPreviews: Array<{
    category: AutomationNotificationPreferenceCategory;
    sampleLabel: string;
    result: AutomationEventEligibilityResult<AutomationNotificationPreferenceCategory>;
  }>;
  templateDefinitions: readonly AutomationNotificationTemplateDefinition[];
};

const preferenceOnlyBlockers = new Set([
  "No saved future notification preference has been configured for this category yet.",
  "Saved preference keeps future execution intent turned off.",
  "No contractor roles are selected for future notification routing."
]);

function formatRoleSummary(roles: AutomationNotificationPreference["notifyRoles"]) {
  return roles.length > 0 ? roles.join(", ") : "none selected";
}

function getReadinessStatus(
  blockers: string[],
  categoryBlockers: string[]
): AutomationPlanningReadinessStatus {
  if (blockers.length === 0) {
    return "planning_ready";
  }

  if (categoryBlockers.length === 0) {
    return "needs_preferences";
  }

  if (categoryBlockers.length === blockers.length) {
    return "needs_sample_context";
  }

  return "needs_preferences_and_sample_context";
}

function getNextSafeImplementationStep(
  readinessStatus: AutomationPlanningReadinessStatus,
  executionAvailable: boolean
) {
  if (executionAvailable) {
    return readinessStatus === "planning_ready"
      ? "Use the manual notification-only runner from /settings/automation; keep delivery in-app only."
      : "Finish saved preferences and canonical trigger context before using the manual notification-only runner.";
  }

  switch (readinessStatus) {
    case "planning_ready":
      return "Design a notification-only execution contract for this category without adding sending, queues, or state mutation.";
    case "needs_preferences":
      return "Finish organization-level future notification preference setup before designing any execution path.";
    case "needs_sample_context":
      return "Confirm the canonical trigger context and event shape on a real sample before designing an execution contract.";
    default:
      return "Finish saved preference setup and confirm the canonical trigger context before designing an execution contract.";
  }
}

export function buildAutomationPlanningSummaries(
  input: AutomationReadinessPlanInput
): AutomationPlanningSummary[] {
  const preferenceByCategory = new Map(
    input.preferences.map((preference) => [preference.category, preference])
  );
  const previewByCategory = new Map(
    input.eligibilityPreviews.map((preview) => [preview.category, preview])
  );

  return input.templateDefinitions.map((templateDefinition) => {
    const preference = preferenceByCategory.get(templateDefinition.category);
    const preview = previewByCategory.get(templateDefinition.category);
    const blockers = preview?.result.blockers ?? [
      "No read-only eligibility preview is available for this category."
    ];
    const categoryBlockers = blockers.filter(
      (blocker) => !preferenceOnlyBlockers.has(blocker)
    );
    const readinessStatus = getReadinessStatus(blockers, categoryBlockers);
    const executionAvailable = preview?.result.executionAvailable ?? false;

    return {
      category: templateDefinition.category,
      displayName: templateDefinition.displayName,
      preferenceSummary: preference
        ? `Future execution intent is ${
            preference.enabledForFutureExecution ? "on" : "off"
          }. Notify roles: ${formatRoleSummary(preference.notifyRoles)}.`
        : "No saved future preference is available for this category.",
      eligibilitySummary: preview
        ? `Sample context: ${preview.sampleLabel}. ${
            preview.result.wouldBeEligible
              ? executionAvailable
                ? "Saved preferences and current canonical sample line up for manual notification-only execution."
                : "Saved preferences and current canonical sample line up for future planning."
              : preview.result.reason
          }`
        : "No read-only eligibility preview is available for this category yet.",
      templateSummary: `Static preview copy targets ${templateDefinition.intendedRecipients.join(
        ", "
      )} and requires ${
        templateDefinition.requiredCanonicalContextFields.length
      } canonical context fields.`,
      readinessStatus,
      blockers,
      nextSafeImplementationStep: getNextSafeImplementationStep(
        readinessStatus,
        executionAvailable
      ),
      executionAvailable
    };
  });
}
