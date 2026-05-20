import type { GateKeeperExecutionBlocker } from "./action-bridge";

type OpportunityPreviewPayload = Record<string, unknown>;

export type GateKeeperOpportunityDraftPreviewField = {
  key: string;
  label: string;
  value: string;
};

export type GateKeeperCreateOpportunityPreview = {
  canCreateNow: false;
  futureOwningWorkflow: "Leads/Opportunities";
  proposedContactName: string | null;
  proposedPhone: string | null;
  proposedEmail: string | null;
  proposedService: string | null;
  proposedLocationText: string | null;
  proposedNotes: string | null;
  requestedAppointmentText: string | null;
  sourceLabel: string | null;
  missingRecommendedFields: string[];
  futureValidationRequirements: string[];
  additionalUntrustedData: GateKeeperOpportunityDraftPreviewField[];
  blockers: GateKeeperExecutionBlocker[];
  safetyCopy: string;
};

const fieldAliases = {
  contactName: [
    "customerName",
    "contactName",
    "name",
    "prospectName",
    "displayName"
  ],
  phone: ["customerPhone", "contactPhone", "phone", "phoneNumber", "cellPhone"],
  email: ["customerEmail", "email", "contactEmail"],
  service: ["requestedService", "serviceType", "jobType", "service"],
  location: [
    "address",
    "addressText",
    "location",
    "siteName",
    "addressLine1",
    "projectAddress"
  ],
  notes: ["notes", "body", "summary", "summaryText"],
  requestedAppointment: [
    "requestedAppointment",
    "requestedAppointmentText",
    "requestedDate",
    "requestedDateText",
    "siteAssessmentRequest"
  ],
  source: ["source", "sourceType", "sourceLabel", "sourceFamily"]
} as const;

const knownFieldKeys = new Set<string>(Object.values(fieldAliases).flat());
const MAX_ADDITIONAL_FIELDS = 5;
const MAX_DISPLAY_LENGTH = 180;

function asDisplayString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function truncate(value: string, maxLength = MAX_DISPLAY_LENGTH) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function getFirstString(
  payload: OpportunityPreviewPayload,
  keys: readonly string[]
) {
  for (const key of keys) {
    const value = asDisplayString(payload[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function buildLocationText(payload: OpportunityPreviewPayload) {
  const directLocation = getFirstString(payload, fieldAliases.location);

  if (directLocation) {
    return directLocation;
  }

  const addressParts = [
    asDisplayString(payload.addressLine1),
    asDisplayString(payload.addressLine2),
    asDisplayString(payload.city),
    asDisplayString(payload.stateRegion),
    asDisplayString(payload.postalCode)
  ].filter((value): value is string => Boolean(value));

  return addressParts.length > 0 ? addressParts.join(", ") : null;
}

function formatAdditionalValue(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return truncate(String(value));
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

function formatLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replaceAll(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
}

function buildAdditionalUntrustedData(payload: OpportunityPreviewPayload) {
  return Object.entries(payload)
    .filter(([key]) => !knownFieldKeys.has(key))
    .slice(0, MAX_ADDITIONAL_FIELDS)
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: formatAdditionalValue(value)
    }));
}

function buildMissingRecommendedFields(input: {
  contactName: string | null;
  email: string | null;
  location: string | null;
  phone: string | null;
  service: string | null;
}) {
  const missing: string[] = [];

  if (!input.contactName) {
    missing.push("Contact/customer name");
  }

  if (!input.phone && !input.email) {
    missing.push("At least one contact method");
  }

  if (!input.service) {
    missing.push("Requested service or job type");
  }

  if (!input.location) {
    missing.push("Site address or location text");
  }

  return missing;
}

export function buildGateKeeperCreateOpportunityPreview(
  proposedPayload: OpportunityPreviewPayload
): GateKeeperCreateOpportunityPreview {
  const proposedContactName = getFirstString(
    proposedPayload,
    fieldAliases.contactName
  );
  const proposedPhone = getFirstString(proposedPayload, fieldAliases.phone);
  const proposedEmail = getFirstString(proposedPayload, fieldAliases.email);
  const proposedService = getFirstString(proposedPayload, fieldAliases.service);
  const proposedLocationText = buildLocationText(proposedPayload);
  const proposedNotes = getFirstString(proposedPayload, fieldAliases.notes);
  const requestedAppointmentText = getFirstString(
    proposedPayload,
    fieldAliases.requestedAppointment
  );
  const sourceLabel = getFirstString(proposedPayload, fieldAliases.source);

  return {
    canCreateNow: false,
    futureOwningWorkflow: "Leads/Opportunities",
    proposedContactName,
    proposedPhone,
    proposedEmail,
    proposedService,
    proposedLocationText,
    proposedNotes,
    requestedAppointmentText,
    sourceLabel,
    missingRecommendedFields: buildMissingRecommendedFields({
      contactName: proposedContactName,
      email: proposedEmail,
      location: proposedLocationText,
      phone: proposedPhone,
      service: proposedService
    }),
    futureValidationRequirements: [
      "Validate tenant membership and role permission inside the Leads/Opportunities workflow.",
      "Validate contact name, email, phone, service, and address fields against opportunity schemas.",
      "Check for existing customer, contact, or opportunity matches before creating anything.",
      "Keep site assessment timing as raw review text until the scheduling workflow validates it."
    ],
    additionalUntrustedData: buildAdditionalUntrustedData(proposedPayload),
    blockers: [
      {
        code: "confirmation_and_request_required",
        message:
          "Create-opportunity execution requires the separate confirmation draft, duplicate/preflight check, approved review, and execution_requested ledger path.",
        severity: "blocking"
      }
    ],
    safetyCopy:
      "No opportunity has been created from this preview. The controlled execution path must validate through the Leads/Opportunities workflow."
  };
}
