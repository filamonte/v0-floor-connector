import type {
  CommunicationChannelKind,
  CommunicationMessageDirection,
  CommunicationMessageKind,
  GateKeeperActionSuggestionType,
  GateKeeperArtifactType,
  GateKeeperSubjectType
} from "@floorconnector/types";

import {
  buildGateKeeperManualSourceAdapterResult,
  gateKeeperManualSeedSourceOptions,
  gateKeeperManualSeedSubjectOptions,
  type GateKeeperManualSeedInput,
  type GateKeeperManualSeedSourceType,
  type GateKeeperManualSourceAdapterInput,
  type GateKeeperManualSourceAdapterResult
} from "./manual-source-adapter";

export {
  buildGateKeeperManualSourceAdapterResult,
  gateKeeperManualSeedSourceOptions,
  gateKeeperManualSeedSubjectOptions
};
export type {
  GateKeeperManualSeedInput,
  GateKeeperManualSeedSourceType,
  GateKeeperManualSourceAdapterInput,
  GateKeeperManualSourceAdapterResult
};

export type GateKeeperManualSeedArtifactDraft = {
  artifactType: GateKeeperArtifactType;
  contentText: string;
  content: Record<string, unknown>;
};

export type GateKeeperManualSeedSuggestionDraft = {
  suggestionType: GateKeeperActionSuggestionType;
  title: string;
  rationale: string;
  proposedPayload: Record<string, unknown>;
};

export type GateKeeperManualSeedPlan = {
  sourceType: GateKeeperManualSeedSourceType;
  sourceFamily: "manual_simulation";
  adapterResult: GateKeeperManualSourceAdapterResult;
  body: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  requestedService: string;
  requestedAppointment: string;
  notes: string;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
  communication: {
    channelKind: CommunicationChannelKind;
    direction: CommunicationMessageDirection;
    messageKind: CommunicationMessageKind;
  };
  artifacts: GateKeeperManualSeedArtifactDraft[];
  suggestions: GateKeeperManualSeedSuggestionDraft[];
};

export function buildGateKeeperManualSeedPlanFromAdapterResult(
  adapterResult: GateKeeperManualSourceAdapterResult
): GateKeeperManualSeedPlan {
  return {
    sourceType: adapterResult.manual.sourceType,
    sourceFamily: "manual_simulation",
    adapterResult,
    body: adapterResult.manual.body,
    customerName: adapterResult.manual.customerName,
    customerPhone: adapterResult.manual.customerPhone,
    customerEmail: adapterResult.manual.customerEmail,
    requestedService: adapterResult.manual.requestedService,
    requestedAppointment: adapterResult.manual.requestedAppointment,
    notes: adapterResult.manual.notes,
    subjectType: adapterResult.manual.subjectType,
    subjectId: adapterResult.manual.subjectId,
    communication: adapterResult.manual.communication,
    artifacts: adapterResult.artifacts.map((artifact) => ({
      artifactType: artifact.artifactType,
      contentText: artifact.contentText ?? "",
      content: artifact.content ?? {}
    })),
    suggestions: adapterResult.suggestions.map((suggestion) => ({
      suggestionType: suggestion.suggestionType,
      title: suggestion.title,
      rationale: suggestion.rationale ?? "",
      proposedPayload: suggestion.proposedPayload ?? {}
    }))
  };
}

export function buildGateKeeperManualSeedPlan(
  input: GateKeeperManualSeedInput
): GateKeeperManualSeedPlan {
  return buildGateKeeperManualSeedPlanForOrganization(
    input,
    "manual-seed-preview",
    { occurredAt: "1970-01-01T00:00:00.000Z" }
  );
}

export function buildGateKeeperManualSeedPlanForOrganization(
  input: GateKeeperManualSeedInput,
  organizationId: string,
  options: { occurredAt?: string; idempotencyKey?: string } = {}
): GateKeeperManualSeedPlan {
  const adapterResult = buildGateKeeperManualSourceAdapterResult({
    ...input,
    organizationId,
    occurredAt: options.occurredAt,
    idempotencyKey: options.idempotencyKey
  });

  return buildGateKeeperManualSeedPlanFromAdapterResult(adapterResult);
}
