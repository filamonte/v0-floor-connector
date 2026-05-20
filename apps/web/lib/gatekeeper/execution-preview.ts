import type {
  GateKeeperActionSuggestion,
  GateKeeperActionSuggestionType
} from "@floorconnector/types";

import {
  buildGateKeeperControlledActionPreview,
  type GateKeeperActionRiskTier,
  type GateKeeperControlledActionCategory,
  type GateKeeperExecutionBlocker,
  type GateKeeperExecutionOwner
} from "./action-bridge";

type GateKeeperExecutionPreviewSuggestion = Pick<
  GateKeeperActionSuggestion,
  | "id"
  | "proposedPayload"
  | "rationale"
  | "status"
  | "subjectId"
  | "subjectType"
  | "suggestionType"
  | "title"
>;

export type GateKeeperExecutionPayloadPreviewField = {
  key: string;
  label: string;
  value: string;
};

export type GateKeeperExecutionPreview = {
  suggestionId: string;
  suggestionType: GateKeeperActionSuggestionType | "unknown";
  title: string;
  owner: GateKeeperExecutionOwner;
  category: GateKeeperControlledActionCategory;
  riskTier: GateKeeperActionRiskTier;
  canPreview: boolean;
  canExecuteNow: false;
  blockers: GateKeeperExecutionBlocker[];
  futureActionSummary: string;
  validationSummary: string[];
  payloadPreview: GateKeeperExecutionPayloadPreviewField[];
  payloadTrustMessage: string;
  reviewSeparationMessage: string;
};

const futureActionSummaries = {
  create_opportunity:
    "Would prepare a new opportunity draft from reviewed intake details. Future execution must be owned by the Leads/Opportunities workflow.",
  update_opportunity:
    "Would prepare an opportunity update for the owning Leads/Opportunities workflow to validate before any record changes.",
  schedule_site_assessment:
    "Would prepare scheduling review for a site assessment. Future execution must validate project or opportunity readiness and schedule ownership.",
  create_task_later:
    "Would prepare an internal follow-up task if a canonical task or work-item model is available.",
  send_followup_later:
    "Would prepare an outbound follow-up message draft. Future execution must require explicit human send confirmation.",
  update_project_notes:
    "Would prepare a project note update for the Project workflow to validate before any canonical project record changes.",
  flag_estimate_review:
    "Would flag an estimate for review. Future execution must be owned by the Estimate workflow.",
  flag_invoice_review:
    "Would flag an invoice for review. Future execution must be owned by the Invoice workflow.",
  flag_contract_review:
    "Would flag a contract for review. Future execution must be owned by the Contract workflow."
} as const satisfies Record<GateKeeperActionSuggestionType, string>;

const validationBySuggestionType = {
  create_opportunity: [
    "Validate tenant membership and role permission for opportunity creation.",
    "Validate intake fields against the opportunity workflow schema.",
    "Confirm no duplicate customer or opportunity should be linked first."
  ],
  update_opportunity: [
    "Validate the linked opportunity belongs to the current tenant.",
    "Validate update fields against the opportunity workflow schema.",
    "Check stale workflow state before any future update."
  ],
  schedule_site_assessment: [
    "Validate the linked customer, opportunity, or project belongs to the current tenant.",
    "Validate schedule readiness, availability, and ownership rules.",
    "Require explicit scheduling confirmation before any future calendar or job change."
  ],
  create_task_later: [
    "Validate a canonical task or work-item model owns the requested follow-up.",
    "Validate assignee, due date, and subject links before any future task creation.",
    "Keep the suggestion internal unless a future workflow explicitly exposes it."
  ],
  send_followup_later: [
    "Validate recipient identity and communication permissions.",
    "Require explicit human confirmation before any future outbound send.",
    "Validate provider readiness and audit requirements before delivery."
  ],
  update_project_notes: [
    "Validate the linked project belongs to the current tenant.",
    "Validate note scope and project workflow ownership.",
    "Check stale project state before any future project update."
  ],
  flag_estimate_review: [
    "Validate the linked estimate belongs to the current tenant.",
    "Validate review flag semantics in the Estimate workflow.",
    "Do not alter estimate pricing, scope, or status from GateKeeper payload alone."
  ],
  flag_invoice_review: [
    "Validate the linked invoice belongs to the current tenant.",
    "Validate invoice review authority and financial guardrails.",
    "Do not alter invoice amounts, balance, payment state, or status from GateKeeper payload alone."
  ],
  flag_contract_review: [
    "Validate the linked contract belongs to the current tenant.",
    "Validate contract review authority and signature/legal guardrails.",
    "Do not alter contract status, signer state, or legal terms from GateKeeper payload alone."
  ]
} as const satisfies Record<GateKeeperActionSuggestionType, string[]>;

const unknownValidationSummary = [
  "Block preview because no controlled action policy owns this suggestion type.",
  "Add an explicit owner, risk tier, and validation policy before any future preview or execution work."
];

const MAX_PAYLOAD_FIELDS = 6;
const MAX_PAYLOAD_VALUE_LENGTH = 120;

function formatPayloadLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
}

function truncatePayloadValue(value: string) {
  if (value.length <= MAX_PAYLOAD_VALUE_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_PAYLOAD_VALUE_LENGTH - 1)}...`;
}

function formatPayloadValue(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return truncatePayloadValue(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
  }

  if (typeof value === "object") {
    return `{${Object.keys(value).length} field${
      Object.keys(value).length === 1 ? "" : "s"
    }}`;
  }

  return "Unsupported preview value";
}

export function buildGateKeeperPayloadPreview(
  proposedPayload: Record<string, unknown>
): GateKeeperExecutionPayloadPreviewField[] {
  return Object.entries(proposedPayload)
    .slice(0, MAX_PAYLOAD_FIELDS)
    .map(([key, value]) => ({
      key,
      label: formatPayloadLabel(key),
      value: formatPayloadValue(value)
    }));
}

export function buildGateKeeperExecutionPreview(
  suggestion: GateKeeperExecutionPreviewSuggestion
): GateKeeperExecutionPreview {
  const bridgePreview = buildGateKeeperControlledActionPreview(
    suggestion.suggestionType
  );
  const suggestionType = bridgePreview.suggestionType;
  const isKnownSuggestion = suggestionType !== "unknown";

  return {
    suggestionId: suggestion.id,
    suggestionType,
    title: suggestion.title,
    owner: bridgePreview.owner,
    category: bridgePreview.category,
    riskTier: bridgePreview.riskTier,
    canPreview: bridgePreview.canPreview,
    canExecuteNow: false,
    blockers: bridgePreview.blockers,
    futureActionSummary: isKnownSuggestion
      ? futureActionSummaries[suggestionType]
      : "This suggestion type is blocked because no controlled action policy exists.",
    validationSummary: isKnownSuggestion
      ? [...validationBySuggestionType[suggestionType]]
      : [...unknownValidationSummary],
    payloadPreview: buildGateKeeperPayloadPreview(suggestion.proposedPayload),
    payloadTrustMessage:
      "Proposed payload is display-only and untrusted. The owning canonical workflow must validate every field before any future execution.",
    reviewSeparationMessage:
      "Review approval only records human review. It does not execute this preview or mutate canonical records."
  };
}
