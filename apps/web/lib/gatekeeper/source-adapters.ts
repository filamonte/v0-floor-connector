import type {
  CommunicationChannelKind,
  CommunicationMessageDirection,
  GateKeeperActionSuggestionType,
  GateKeeperArtifactType,
  GateKeeperSubjectType,
  OrganizationId
} from "@floorconnector/types";

export type GateKeeperSourceFamily =
  | "manual_simulation"
  | "inbound_phone_call"
  | "outbound_phone_call"
  | "voicemail"
  | "call_recording"
  | "transcription"
  | "web_chat"
  | "sms"
  | "email"
  | "portal_message"
  | "internal_note"
  | "ai_voice_agent_session"
  | "support_assistant_session";

export type GateKeeperSourceChannel =
  | CommunicationChannelKind
  | "voice_agent"
  | "recording"
  | "transcript"
  | "support_assistant";

export type GateKeeperSourceDirection =
  | CommunicationMessageDirection
  | "bidirectional";

export type GateKeeperParticipantHints = {
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  externalParticipantId?: string | null;
};

export type GateKeeperSourceSubjectLink = {
  subjectType?: GateKeeperSubjectType | null;
  subjectId?: string | null;
};

export type GateKeeperSuggestedArtifactInput = {
  artifactType: GateKeeperArtifactType;
  contentText?: string | null;
  content?: Record<string, unknown>;
  confidence?: number | null;
};

export type GateKeeperSuggestedActionInput = {
  suggestionType: GateKeeperActionSuggestionType;
  title: string;
  rationale?: string | null;
  proposedPayload?: Record<string, unknown>;
};

export type GateKeeperNormalizedSourceEvent = GateKeeperSourceSubjectLink & {
  organizationId: OrganizationId;
  sourceFamily: GateKeeperSourceFamily;
  sourceChannel: GateKeeperSourceChannel;
  direction: GateKeeperSourceDirection;
  participantHints?: GateKeeperParticipantHints;
  rawText?: string | null;
  summaryText?: string | null;
  transcriptText?: string | null;
  recordingReference?: string | null;
  occurredAt: string;
  providerMetadata?: Record<string, unknown>;
  idempotencyKey: string;
  confidence?: number | null;
  suggestedArtifacts?: GateKeeperSuggestedArtifactInput[];
  suggestedActions?: GateKeeperSuggestedActionInput[];
};

export type GateKeeperAdapterResult = {
  event: GateKeeperNormalizedSourceEvent;
  communicationThreadHint:
    | {
        shouldCreateOrReuse: true;
        reason: string;
      }
    | {
        shouldCreateOrReuse: false;
        reason: string;
      };
  artifacts: GateKeeperSuggestedArtifactInput[];
  suggestions: GateKeeperSuggestedActionInput[];
  execution: {
    allowed: false;
    reason: string;
  };
};

export const gateKeeperSourceFamilies = [
  "manual_simulation",
  "inbound_phone_call",
  "outbound_phone_call",
  "voicemail",
  "call_recording",
  "transcription",
  "web_chat",
  "sms",
  "email",
  "portal_message",
  "internal_note",
  "ai_voice_agent_session",
  "support_assistant_session"
] as const satisfies readonly GateKeeperSourceFamily[];

export const gateKeeperSourceChannels = [
  "phone",
  "sms",
  "email",
  "web_chat",
  "portal",
  "internal_note",
  "assistant_note",
  "unknown",
  "voice_agent",
  "recording",
  "transcript",
  "support_assistant"
] as const satisfies readonly GateKeeperSourceChannel[];

export const gateKeeperSourceDirections = [
  "inbound",
  "outbound",
  "internal",
  "system",
  "bidirectional"
] as const satisfies readonly GateKeeperSourceDirection[];

export function buildGateKeeperAdapterResult(
  event: GateKeeperNormalizedSourceEvent
): GateKeeperAdapterResult {
  const hasSubjectLink = Boolean(event.subjectType && event.subjectId);

  return {
    event,
    communicationThreadHint: hasSubjectLink
      ? {
          shouldCreateOrReuse: true,
          reason:
            "Adapter input includes a canonical subject link; ingestion may attach provider-neutral communication records."
        }
      : {
          shouldCreateOrReuse: false,
          reason:
            "Adapter input has no canonical subject link; ingestion must not invent a duplicate lead, customer, project, or thread."
        },
    artifacts: event.suggestedArtifacts ?? [],
    suggestions: event.suggestedActions ?? [],
    execution: {
      allowed: false,
      reason:
        "GateKeeper source adapters normalize communication and memory inputs only. Execution requires a separate future reviewed server action."
    }
  };
}
