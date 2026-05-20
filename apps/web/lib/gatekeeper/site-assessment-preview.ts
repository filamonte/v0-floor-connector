import type { GateKeeperExecutionBlocker } from "./action-bridge";

type SiteAssessmentPreviewPayload = Record<string, unknown>;

export type GateKeeperSiteAssessmentPreviewField = {
  key: string;
  label: string;
  value: string;
};

export type GateKeeperSiteAssessmentPreview = {
  canScheduleNow: false;
  futureOwningWorkflow: "Leads/Opportunities" | "Projects/Schedule";
  proposedContactName: string | null;
  proposedPhone: string | null;
  proposedEmail: string | null;
  proposedService: string | null;
  proposedLocationText: string | null;
  requestedAppointmentText: string | null;
  schedulingNotes: string | null;
  sourceLabel: string | null;
  linkedSubjectLabel: string | null;
  missingRecommendedFields: string[];
  futureValidationRequirements: string[];
  additionalUntrustedData: GateKeeperSiteAssessmentPreviewField[];
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
  requestedAppointment: [
    "requestedAppointment",
    "requestedAppointmentText",
    "requestedDate",
    "requestedDateText",
    "requestedTime",
    "requestedTimeText",
    "siteAssessmentRequest",
    "siteAssessmentScheduledAt"
  ],
  notes: [
    "schedulingNotes",
    "scheduleNotes",
    "appointmentNotes",
    "notes",
    "body",
    "summary"
  ],
  source: ["source", "sourceType", "sourceLabel", "sourceFamily"],
  subjectType: ["subjectType", "linkedSubjectType"],
  subjectId: ["subjectId", "linkedSubjectId"]
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
  payload: SiteAssessmentPreviewPayload,
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

function buildLocationText(payload: SiteAssessmentPreviewPayload) {
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

function buildAdditionalUntrustedData(payload: SiteAssessmentPreviewPayload) {
  return Object.entries(payload)
    .filter(([key]) => !knownFieldKeys.has(key))
    .slice(0, MAX_ADDITIONAL_FIELDS)
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: formatAdditionalValue(value)
    }));
}

function buildLinkedSubjectLabel(input: {
  subjectId: string | null;
  subjectType: string | null;
}) {
  if (!input.subjectType || !input.subjectId) {
    return null;
  }

  return `${formatLabel(input.subjectType)} ${input.subjectId}`;
}

function buildMissingRecommendedFields(input: {
  contactName: string | null;
  email: string | null;
  linkedSubjectLabel: string | null;
  location: string | null;
  phone: string | null;
  requestedAppointment: string | null;
  service: string | null;
}) {
  const missing: string[] = [];

  if (!input.linkedSubjectLabel && !input.contactName) {
    missing.push("Linked subject or contact/customer name");
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

  if (!input.requestedAppointment) {
    missing.push("Requested appointment/date text");
  }

  return missing;
}

function resolveFutureOwningWorkflow(subjectType: string | null) {
  return subjectType === "project"
    ? "Projects/Schedule"
    : "Leads/Opportunities";
}

export function buildGateKeeperSiteAssessmentPreview(input: {
  proposedPayload: SiteAssessmentPreviewPayload;
  subjectId?: string | null;
  subjectType?: string | null;
}): GateKeeperSiteAssessmentPreview {
  const proposedPayload = input.proposedPayload;
  const proposedContactName = getFirstString(
    proposedPayload,
    fieldAliases.contactName
  );
  const proposedPhone = getFirstString(proposedPayload, fieldAliases.phone);
  const proposedEmail = getFirstString(proposedPayload, fieldAliases.email);
  const proposedService = getFirstString(proposedPayload, fieldAliases.service);
  const proposedLocationText = buildLocationText(proposedPayload);
  const requestedAppointmentText = getFirstString(
    proposedPayload,
    fieldAliases.requestedAppointment
  );
  const schedulingNotes = getFirstString(proposedPayload, fieldAliases.notes);
  const sourceLabel = getFirstString(proposedPayload, fieldAliases.source);
  const subjectType =
    input.subjectType ??
    getFirstString(proposedPayload, fieldAliases.subjectType);
  const subjectId =
    input.subjectId ?? getFirstString(proposedPayload, fieldAliases.subjectId);
  const linkedSubjectLabel = buildLinkedSubjectLabel({
    subjectId,
    subjectType
  });

  return {
    canScheduleNow: false,
    futureOwningWorkflow: resolveFutureOwningWorkflow(subjectType),
    proposedContactName,
    proposedPhone,
    proposedEmail,
    proposedService,
    proposedLocationText,
    requestedAppointmentText,
    schedulingNotes,
    sourceLabel,
    linkedSubjectLabel,
    missingRecommendedFields: buildMissingRecommendedFields({
      contactName: proposedContactName,
      email: proposedEmail,
      linkedSubjectLabel,
      location: proposedLocationText,
      phone: proposedPhone,
      requestedAppointment: requestedAppointmentText,
      service: proposedService
    }),
    futureValidationRequirements: [
      "Validate tenant membership and role permission inside the owning workflow.",
      "Validate the linked opportunity, customer, or project belongs to the tenant.",
      "Validate requested timing, availability, assignee, and location before creating or updating any appointment.",
      "Keep requested date and time as raw review text until the scheduling workflow validates it.",
      "Require explicit human scheduling confirmation before any customer-visible appointment or job schedule change."
    ],
    additionalUntrustedData: buildAdditionalUntrustedData(proposedPayload),
    blockers: [
      {
        code: "execution_not_implemented",
        message:
          "GateKeeper site-assessment scheduling execution is not implemented. This is a preview only.",
        severity: "blocking"
      }
    ],
    safetyCopy:
      "No appointment, schedule entry, job, or opportunity assessment state has been created or updated. This scheduling preview is display-only and must be validated by the owning workflow before any future controlled action."
  };
}
