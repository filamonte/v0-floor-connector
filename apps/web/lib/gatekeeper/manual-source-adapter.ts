import type {
  CommunicationChannelKind,
  CommunicationMessageDirection,
  CommunicationMessageKind,
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

export type GateKeeperManualSeedSourceType =
  | "phone_call"
  | "voicemail"
  | "web_chat"
  | "internal_note"
  | "customer_conversation";

export type GateKeeperManualSeedInput = {
  sourceType: GateKeeperManualSeedSourceType;
  body: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  requestedService?: string | null;
  requestedAppointment?: string | null;
  notes?: string | null;
  subjectType?: string | null;
  subjectId?: string | null;
};

export type GateKeeperManualSourceAdapterInput = GateKeeperManualSeedInput & {
  organizationId: OrganizationId;
  occurredAt?: string;
  idempotencyKey?: string;
};

export type GateKeeperManualSourceAdapterResult = GateKeeperAdapterResult & {
  event: GateKeeperNormalizedSourceEvent;
  manual: {
    sourceType: GateKeeperManualSeedSourceType;
    sourceLabel: string;
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
  };
};

export const gateKeeperManualSeedSourceOptions = [
  { value: "phone_call", label: "Phone call" },
  { value: "voicemail", label: "Voicemail" },
  { value: "web_chat", label: "Web chat" },
  { value: "internal_note", label: "Internal note" },
  { value: "customer_conversation", label: "Customer conversation" }
] as const satisfies ReadonlyArray<{
  value: GateKeeperManualSeedSourceType;
  label: string;
}>;

export const gateKeeperManualSeedSubjectOptions = [
  { value: "", label: "No linked subject" },
  { value: "opportunity", label: "Opportunity" },
  { value: "appointment", label: "Appointment" },
  { value: "customer", label: "Customer" },
  { value: "project", label: "Project" },
  { value: "estimate", label: "Estimate" },
  { value: "contract", label: "Contract" },
  { value: "invoice", label: "Invoice" },
  { value: "change_order", label: "Change order" },
  { value: "payment", label: "Payment" }
] as const satisfies ReadonlyArray<{
  value: "" | GateKeeperSubjectType;
  label: string;
}>;

const supportedSourceTypes = gateKeeperManualSeedSourceOptions.map(
  (option) => option.value
) as ReadonlyArray<GateKeeperManualSeedSourceType>;
const supportedSubjectTypes = gateKeeperManualSeedSubjectOptions
  .map((option) => option.value)
  .filter((value) => value.length > 0) as ReadonlyArray<string>;

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeSourceType(value: string): GateKeeperManualSeedSourceType {
  return supportedSourceTypes.includes(value as GateKeeperManualSeedSourceType)
    ? (value as GateKeeperManualSeedSourceType)
    : "internal_note";
}

function normalizeSubject(input: {
  subjectType?: string | null;
  subjectId?: string | null;
}) {
  const subjectType = normalizeText(input.subjectType);
  const subjectId = normalizeText(input.subjectId);

  if (!subjectType && !subjectId) {
    return { subjectType: null, subjectId: null };
  }

  if (!subjectType || !subjectId) {
    throw new Error(
      "GateKeeper manual seed subject type and subject id must be provided together."
    );
  }

  if (!supportedSubjectTypes.includes(subjectType)) {
    throw new Error("GateKeeper manual seed subject type is not supported.");
  }

  return {
    subjectType: subjectType as GateKeeperSubjectType,
    subjectId
  };
}

function getManualSourceCommunicationShape(
  sourceType: GateKeeperManualSeedSourceType
) {
  switch (sourceType) {
    case "phone_call":
      return {
        channelKind: "phone",
        direction: "inbound",
        messageKind: "manual_call"
      } as const;
    case "voicemail":
      return {
        channelKind: "phone",
        direction: "inbound",
        messageKind: "voicemail"
      } as const;
    case "web_chat":
      return {
        channelKind: "web_chat",
        direction: "inbound",
        messageKind: "manual_text_note"
      } as const;
    case "customer_conversation":
      return {
        channelKind: "internal_note",
        direction: "inbound",
        messageKind: "internal_note"
      } as const;
    default:
      return {
        channelKind: "internal_note",
        direction: "internal",
        messageKind: "internal_note"
      } as const;
  }
}

function buildRawPayload(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  requestedService: string;
  requestedAppointment: string;
  notes: string;
}) {
  return {
    customerName: input.customerName || null,
    customerPhone: input.customerPhone || null,
    customerEmail: input.customerEmail || null,
    requestedService: input.requestedService || null,
    requestedAppointment: input.requestedAppointment || null,
    notes: input.notes || null
  };
}

function buildManualIdempotencyKey(input: {
  sourceType: GateKeeperManualSeedSourceType;
  body: string;
  subjectType: GateKeeperSubjectType | null;
  subjectId: string | null;
}) {
  const seed = [
    input.sourceType,
    input.subjectType ?? "unlinked",
    input.subjectId ?? "unlinked",
    input.body
  ]
    .join(":")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return `manual_simulation:${seed}`;
}

export function buildGateKeeperManualSourceAdapterResult(
  input: GateKeeperManualSourceAdapterInput
): GateKeeperManualSourceAdapterResult {
  const sourceType = normalizeSourceType(input.sourceType);
  const body = normalizeText(input.body);
  const customerName = normalizeText(input.customerName);
  const customerPhone = normalizeText(input.customerPhone);
  const customerEmail = normalizeText(input.customerEmail);
  const requestedService = normalizeText(input.requestedService);
  const requestedAppointment = normalizeText(input.requestedAppointment);
  const notes = normalizeText(input.notes);
  const subject = normalizeSubject(input);

  if (!body) {
    throw new Error("GateKeeper manual seed requires a summary or body.");
  }

  const sourceLabel =
    gateKeeperManualSeedSourceOptions.find(
      (option) => option.value === sourceType
    )?.label ?? "Manual source";
  const rawFields = buildRawPayload({
    customerName,
    customerPhone,
    customerEmail,
    requestedService,
    requestedAppointment,
    notes
  });
  const artifacts: GateKeeperSuggestedArtifactInput[] = [
    {
      artifactType: "call_summary",
      contentText: body,
      content: {
        sourceType,
        sourceLabel,
        rawFields,
        generatedBy: "manual_source_adapter"
      }
    }
  ];

  if (requestedService) {
    artifacts.push({
      artifactType: "extracted_requirement",
      contentText: requestedService,
      content: {
        sourceType,
        field: "requestedService",
        generatedBy: "manual_source_adapter"
      }
    });
  }

  if (requestedAppointment) {
    artifacts.push({
      artifactType: "extracted_commitment",
      contentText: requestedAppointment,
      content: {
        sourceType,
        field: "requestedAppointment",
        generatedBy: "manual_source_adapter"
      }
    });
  }

  if (notes || (!requestedService && !requestedAppointment)) {
    artifacts.push({
      artifactType: "workflow_observation",
      contentText: notes || "Manual intake summary needs human review.",
      content: {
        sourceType,
        field: notes ? "notes" : "body_only",
        generatedBy: "manual_source_adapter"
      }
    });
  }

  const suggestions: GateKeeperSuggestedActionInput[] = [];
  const hasContactSeed =
    customerName || customerPhone || customerEmail || requestedService;

  if (hasContactSeed) {
    suggestions.push({
      suggestionType: "create_opportunity",
      title: customerName
        ? `Review possible opportunity for ${customerName}`
        : "Review possible new opportunity",
      rationale:
        "Manual GateKeeper seed captured customer/contact or requested service details. Review before creating any canonical record.",
      proposedPayload: {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        requestedService: requestedService || null,
        notes: notes || null,
        sourceType,
        sourceFamily: "manual_simulation",
        reviewOnly: true
      }
    });
  }

  if (requestedAppointment) {
    suggestions.push({
      suggestionType: "schedule_site_assessment",
      title: "Review requested site assessment timing",
      rationale:
        "Manual GateKeeper seed captured requested appointment/date text. Review before scheduling anything.",
      proposedPayload: {
        requestedAppointment,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        sourceType,
        sourceFamily: "manual_simulation",
        reviewOnly: true
      }
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      suggestionType: "create_task_later",
      title: "Review manual GateKeeper intake summary",
      rationale:
        "Only a free-text manual summary was provided. Review the intake before deciding whether any canonical follow-up is needed.",
      proposedPayload: {
        summary: body,
        notes: notes || null,
        sourceType,
        sourceFamily: "manual_simulation",
        reviewOnly: true
      }
    });
  }

  const communication = getManualSourceCommunicationShape(sourceType);
  const event: GateKeeperNormalizedSourceEvent = {
    organizationId: input.organizationId,
    sourceFamily: "manual_simulation",
    sourceChannel: communication.channelKind,
    direction: communication.direction,
    participantHints: {
      displayName: customerName || null,
      phone: customerPhone || null,
      email: customerEmail || null
    },
    subjectType: subject.subjectType,
    subjectId: subject.subjectId,
    rawText: body,
    summaryText: body,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    providerMetadata: {
      sourceType,
      sourceLabel,
      rawFields,
      provider: "manual"
    },
    idempotencyKey:
      input.idempotencyKey ??
      buildManualIdempotencyKey({
        sourceType,
        body,
        subjectType: subject.subjectType,
        subjectId: subject.subjectId
      }),
    suggestedArtifacts: artifacts,
    suggestedActions: suggestions
  };
  const result = buildGateKeeperAdapterResult(event);

  return {
    ...result,
    manual: {
      sourceType,
      sourceLabel,
      body,
      customerName,
      customerPhone,
      customerEmail,
      requestedService,
      requestedAppointment,
      notes,
      subjectType: subject.subjectType,
      subjectId: subject.subjectId,
      communication
    }
  };
}
