import type { GateKeeperExecutionBlocker } from "./action-bridge";
import {
  buildGateKeeperCreateOpportunityPreview,
  type GateKeeperCreateOpportunityPreview
} from "./opportunity-preview";

type ConfirmationPayload = Record<string, unknown>;

export type GateKeeperCreateOpportunityConfirmationDraft = {
  contactName: string;
  phone: string;
  email: string;
  requestedService: string;
  locationText: string;
  notes: string;
  requestedAppointmentText: string;
  sourceLabel: string;
};

export type GateKeeperCreateOpportunityDuplicatePlaceholder = {
  label: string;
  status: "not_run";
  message: string;
};

export type GateKeeperCreateOpportunityConfirmationModel = {
  draft: GateKeeperCreateOpportunityConfirmationDraft;
  missingRecommendedFields: string[];
  duplicatePlaceholders: GateKeeperCreateOpportunityDuplicatePlaceholder[];
  futureValidationRequirements: string[];
  executionOwner: "Leads/Opportunities";
  canExecuteNow: false;
  blockers: GateKeeperExecutionBlocker[];
  safetyChecklist: string[];
  sourcePreview: GateKeeperCreateOpportunityPreview;
};

function toDraftValue(value: string | null) {
  return value ?? "";
}

export function buildGateKeeperCreateOpportunityConfirmationModel(
  proposedPayload: ConfirmationPayload
): GateKeeperCreateOpportunityConfirmationModel {
  const preview = buildGateKeeperCreateOpportunityPreview(proposedPayload);

  return {
    draft: {
      contactName: toDraftValue(preview.proposedContactName),
      phone: toDraftValue(preview.proposedPhone),
      email: toDraftValue(preview.proposedEmail),
      requestedService: toDraftValue(preview.proposedService),
      locationText: toDraftValue(preview.proposedLocationText),
      notes: toDraftValue(preview.proposedNotes),
      requestedAppointmentText: toDraftValue(preview.requestedAppointmentText),
      sourceLabel: toDraftValue(preview.sourceLabel)
    },
    missingRecommendedFields: preview.missingRecommendedFields,
    duplicatePlaceholders: [
      {
        label: "Contact method match",
        status: "not_run",
        message:
          "Future execution must check phone and email against tenant contacts, customers, and open opportunities."
      },
      {
        label: "Open opportunity match",
        status: "not_run",
        message:
          "Future execution must check for an existing open opportunity before creating another one."
      },
      {
        label: "GateKeeper source replay",
        status: "not_run",
        message:
          "Future execution must check the execution ledger idempotency key and source suggestion linkage."
      }
    ],
    futureValidationRequirements: preview.futureValidationRequirements,
    executionOwner: "Leads/Opportunities",
    canExecuteNow: false,
    blockers: preview.blockers,
    safetyChecklist: [
      "No opportunity will be created from this confirmation preview.",
      "No contact, customer, project, estimate, task, appointment, or message will be created.",
      "Review approval remains separate from execution.",
      "Controlled execution must be handled by the canonical Leads/Opportunities workflow after a saved draft and ledger request."
    ],
    sourcePreview: preview
  };
}

export function getGateKeeperCreateOpportunityConfirmationMissingFields(
  draft: GateKeeperCreateOpportunityConfirmationDraft
) {
  const missing: string[] = [];

  if (!draft.contactName.trim()) {
    missing.push("Contact/customer name");
  }

  if (!draft.phone.trim() && !draft.email.trim()) {
    missing.push("At least one contact method");
  }

  if (!draft.requestedService.trim()) {
    missing.push("Requested service or job type");
  }

  if (!draft.locationText.trim()) {
    missing.push("Site address or location text");
  }

  return missing;
}
