import type { WorkflowGuidancePreferences } from "@floorconnector/types";

import { areAiProviderEnhancementsAllowed } from "../workflow-guidance/preferences";

export type AiProviderMode =
  | "disabled"
  | "deterministic_fallback"
  | "provider_ready";

export type AiProviderCapability =
  | "project_summary_enhancement"
  | "draft_action_enhancement"
  | "dashboard_digest_enhancement"
  | "field_summary_enhancement";

export type AiProviderAvailability = {
  mode: AiProviderMode;
  provider: "none";
  enabledByOrganization: boolean;
  available: boolean;
  reason: string;
  capabilities: AiProviderCapability[];
};

export type SafeAiProviderRequest = {
  organizationId: string;
  subjectType: "project" | "dashboard" | "field_summary" | "draft_action";
  subjectId?: string | null;
  capability: AiProviderCapability;
  canonicalContextSummary: string;
  sourceSignals: string[];
  reviewRequired: true;
};

export type SafeAiProviderResponse = {
  mode: AiProviderMode;
  provider: "none";
  usedProvider: false;
  text: string;
  sourceSignals: string[];
  reviewRequired: true;
  fallbackReason: string;
};

const NO_PROVIDER_REASON =
  "No approved AI provider integration is configured. Deterministic Copilot output remains the production path.";

export function getAiProviderAvailability(input: {
  preferences: WorkflowGuidancePreferences;
}): AiProviderAvailability {
  const enabledByOrganization = areAiProviderEnhancementsAllowed(
    input.preferences
  );

  if (!enabledByOrganization) {
    return {
      mode: "disabled",
      provider: "none",
      enabledByOrganization: false,
      available: false,
      reason:
        "Provider-backed AI enhancement is disabled by organization workflow settings.",
      capabilities: []
    };
  }

  return {
    mode: "deterministic_fallback",
    provider: "none",
    enabledByOrganization,
    available: false,
    reason: NO_PROVIDER_REASON,
    capabilities: []
  };
}

export function buildDeterministicAiProviderFallback(
  request: SafeAiProviderRequest,
  availability: AiProviderAvailability
): SafeAiProviderResponse {
  return {
    mode:
      availability.mode === "disabled" ? "disabled" : "deterministic_fallback",
    provider: "none",
    usedProvider: false,
    text: request.canonicalContextSummary,
    sourceSignals: request.sourceSignals,
    reviewRequired: true,
    fallbackReason: availability.reason
  };
}

export function requestAiProviderEnhancement(input: {
  preferences: WorkflowGuidancePreferences;
  request: SafeAiProviderRequest;
}): SafeAiProviderResponse {
  const availability = getAiProviderAvailability({
    preferences: input.preferences
  });

  return buildDeterministicAiProviderFallback(input.request, availability);
}
