import type {
  GateKeeperActionSuggestionType,
  GateKeeperSubjectType,
  OrganizationId
} from "@floorconnector/types";

import {
  buildGateKeeperAdapterResult,
  type GateKeeperAdapterResult,
  type GateKeeperNormalizedSourceEvent,
  type GateKeeperSuggestedActionInput,
  type GateKeeperSuggestedArtifactInput
} from "./source-adapters";

export type GateKeeperInternalNoteType =
  | "general"
  | "workflow_observation"
  | "follow_up_needed"
  | "estimate_concern"
  | "invoice_concern"
  | "contract_concern"
  | "scheduling_concern";

export type GateKeeperInternalNoteInput = {
  organizationId: OrganizationId;
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  noteText: string;
  noteType?: GateKeeperInternalNoteType | null;
  occurredAt?: string;
  idempotencyKey?: string;
};

export type GateKeeperInternalNoteAdapterResult = GateKeeperAdapterResult & {
  event: GateKeeperNormalizedSourceEvent;
  internalNote: {
    noteText: string;
    noteType: GateKeeperInternalNoteType;
    subjectType: GateKeeperSubjectType;
    subjectId: string;
  };
};

export const gateKeeperInternalNoteTypeOptions = [
  { value: "general", label: "General" },
  { value: "workflow_observation", label: "Workflow observation" },
  { value: "follow_up_needed", label: "Follow-up needed" },
  { value: "estimate_concern", label: "Estimate concern" },
  { value: "invoice_concern", label: "Invoice concern" },
  { value: "contract_concern", label: "Contract concern" },
  { value: "scheduling_concern", label: "Scheduling concern" }
] as const satisfies ReadonlyArray<{
  value: GateKeeperInternalNoteType;
  label: string;
}>;

const supportedNoteTypes = gateKeeperInternalNoteTypeOptions.map(
  (option) => option.value
) as ReadonlyArray<GateKeeperInternalNoteType>;

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeNoteType(
  value: GateKeeperInternalNoteType | null | undefined
): GateKeeperInternalNoteType {
  return supportedNoteTypes.includes(value as GateKeeperInternalNoteType)
    ? (value as GateKeeperInternalNoteType)
    : "general";
}

function buildInternalNoteIdempotencyKey(input: {
  subjectType: GateKeeperSubjectType;
  subjectId: string;
  noteType: GateKeeperInternalNoteType;
  noteText: string;
}) {
  const seed = [
    input.subjectType,
    input.subjectId,
    input.noteType,
    input.noteText
  ]
    .join(":")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return `internal_note:${seed}`;
}

function getSuggestionForNoteType(input: {
  noteType: GateKeeperInternalNoteType;
  noteText: string;
  subjectType: GateKeeperSubjectType;
  subjectId: string;
}): GateKeeperSuggestedActionInput | null {
  const basePayload = {
    noteType: input.noteType,
    noteText: input.noteText,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    sourceFamily: "internal_note",
    reviewOnly: true
  };
  const suggestion = (
    suggestionType: GateKeeperActionSuggestionType,
    title: string,
    rationale: string
  ): GateKeeperSuggestedActionInput => ({
    suggestionType,
    title,
    rationale,
    proposedPayload: basePayload
  });

  switch (input.noteType) {
    case "follow_up_needed":
      return suggestion(
        "create_task_later",
        "Review internal follow-up note",
        "An internal GateKeeper note explicitly marked follow-up as needed. Review before creating any canonical task or communication."
      );
    case "estimate_concern":
      return suggestion(
        "flag_estimate_review",
        "Review estimate concern",
        "An internal GateKeeper note flagged an estimate concern. Review before changing any estimate."
      );
    case "invoice_concern":
      return suggestion(
        "flag_invoice_review",
        "Review invoice concern",
        "An internal GateKeeper note flagged an invoice concern. Review before changing any invoice."
      );
    case "contract_concern":
      return suggestion(
        "flag_contract_review",
        "Review contract concern",
        "An internal GateKeeper note flagged a contract concern. Review before changing any contract."
      );
    case "scheduling_concern":
      return suggestion(
        "create_task_later",
        "Review scheduling concern",
        "An internal GateKeeper note flagged a scheduling concern. Review before creating tasks, appointments, jobs, or schedule changes."
      );
    default:
      return null;
  }
}

export function buildGateKeeperInternalNoteAdapterResult(
  input: GateKeeperInternalNoteInput
): GateKeeperInternalNoteAdapterResult {
  const noteText = normalizeText(input.noteText);
  const subjectType = normalizeText(input.subjectType);
  const subjectId = normalizeText(input.subjectId);
  const noteType = normalizeNoteType(input.noteType);

  if (!subjectType || !subjectId) {
    throw new Error("GateKeeper internal notes require a linked subject.");
  }

  const normalizedSubjectType = subjectType as GateKeeperSubjectType;

  if (!noteText) {
    throw new Error("GateKeeper internal notes require note text.");
  }

  const artifact: GateKeeperSuggestedArtifactInput = {
    artifactType: "workflow_observation",
    contentText: noteText,
    content: {
      noteType,
      subjectType: normalizedSubjectType,
      subjectId,
      generatedBy: "internal_note_adapter"
    }
  };
  const suggestion = getSuggestionForNoteType({
    noteType,
    noteText,
    subjectType: normalizedSubjectType,
    subjectId
  });
  const event: GateKeeperNormalizedSourceEvent = {
    organizationId: input.organizationId,
    sourceFamily: "internal_note",
    sourceChannel: "internal_note",
    direction: "internal",
    subjectType: normalizedSubjectType,
    subjectId,
    rawText: noteText,
    summaryText: noteText,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    providerMetadata: {
      provider: "internal",
      noteType
    },
    idempotencyKey:
      input.idempotencyKey ??
      buildInternalNoteIdempotencyKey({
        subjectType: normalizedSubjectType,
        subjectId,
        noteType,
        noteText
      }),
    suggestedArtifacts: [artifact],
    suggestedActions: suggestion ? [suggestion] : []
  };
  const result = buildGateKeeperAdapterResult(event);

  return {
    ...result,
    internalNote: {
      noteText,
      noteType,
      subjectType: normalizedSubjectType,
      subjectId
    }
  };
}
