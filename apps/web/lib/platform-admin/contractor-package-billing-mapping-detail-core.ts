import type {
  ContractorPackageBillingMapping,
  ContractorPackageBillingMappingAuditEvent,
  ContractorPackageBillingMappingAuditEventType
} from "@floorconnector/types";

export type ContractorPackageBillingMappingDetailTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type ContractorPackageBillingMappingDetailSummaryCard = {
  id: string;
  label: string;
  value: string | number;
  tone: ContractorPackageBillingMappingDetailTone;
  description: string;
};

export type ContractorPackageBillingMappingDetailReference = {
  id: string | null;
  label: string;
  secondaryLabel: string;
};

export type ContractorPackageBillingMappingDetailSnapshotSection = {
  key: string;
  label: string;
  state: "present" | "empty";
  summary: string;
};

export type ContractorPackageBillingMappingDetailAuditRow = {
  id: string;
  eventType: ContractorPackageBillingMappingAuditEventType;
  eventLabel: string;
  occurredAt: string;
  reasonSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  caveats: string[];
};

export type ContractorPackageBillingMappingDetailLinkedReferences = {
  assignment?: ContractorPackageBillingMappingDetailReference;
  company?: ContractorPackageBillingMappingDetailReference;
  packageDefinition?: ContractorPackageBillingMappingDetailReference;
  packageDefinitionVersion?: ContractorPackageBillingMappingDetailReference;
};

export type ContractorPackageBillingMappingDetailModel = {
  generatedAt: string;
  found: boolean;
  readOnly: true;
  actionAvailable: false;
  mutationAvailable: false;
  billingMutationAvailable: false;
  stripeCallAvailable: false;
  providerCallAvailable: false;
  subscriptionOperationAvailable: false;
  billingExecutionAvailable: false;
  entitlementEffect: false;
  moduleEffect: false;
  runtimeEffect: false;
  packageAssignmentEffect: false;
  contractorPermissionEffect: false;
  mappingId: string;
  billingProvider: string;
  providerEnvironment: string;
  billingState: string;
  reconciliationState: string;
  providerCustomerReferenceLabel: string;
  providerProductReferenceLabel: string;
  providerPriceReferenceLabel: string;
  providerSubscriptionReferenceLabel: string;
  providerSubscriptionItemReferenceLabel: string;
  trialOrEarlyAccessState: string;
  customOrGrandfatheredTermsMarker: string;
  mismatchSummary: string;
  lastVerifiedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  assignmentReference: ContractorPackageBillingMappingDetailReference;
  companyReference: ContractorPackageBillingMappingDetailReference;
  packageDefinitionReference: ContractorPackageBillingMappingDetailReference;
  packageDefinitionVersionReference: ContractorPackageBillingMappingDetailReference;
  summaryCards: ContractorPackageBillingMappingDetailSummaryCard[];
  snapshotSections: ContractorPackageBillingMappingDetailSnapshotSection[];
  auditTimelineRows: ContractorPackageBillingMappingDetailAuditRow[];
  mismatchCaveats: string[];
  caveats: string[];
  operatorGuidance: string[];
};

export type ContractorPackageBillingMappingDetailInput = {
  generatedAt: string;
  mappingId: string;
  mapping: ContractorPackageBillingMapping | null;
  auditEvents: ContractorPackageBillingMappingAuditEvent[];
  linkedReferences?: ContractorPackageBillingMappingDetailLinkedReferences;
  unavailableReason?: string;
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  billingMutationAvailable: false,
  stripeCallAvailable: false,
  providerCallAvailable: false,
  subscriptionOperationAvailable: false,
  billingExecutionAvailable: false,
  entitlementEffect: false,
  moduleEffect: false,
  runtimeEffect: false,
  packageAssignmentEffect: false,
  contractorPermissionEffect: false
} as const;

const providerLabels = {
  stripe: "Stripe",
  manual_review: "Manual review",
  unknown: "Unknown provider"
} as const;

const environmentLabels = {
  sandbox: "Sandbox",
  test: "Test",
  production: "Production",
  unknown: "Unknown environment"
} as const;

const auditEventLabels: Record<
  ContractorPackageBillingMappingAuditEventType,
  string
> = {
  billing_mapping_created: "Mapping created",
  billing_mapping_updated: "Mapping updated",
  billing_mapping_reviewed: "Mapping reviewed",
  billing_mapping_verified: "Mapping verified",
  billing_mapping_mismatch_detected: "Mismatch detected",
  billing_mapping_support_review_requested: "Support review requested",
  billing_mapping_suspended: "Mapping suspended",
  billing_mapping_deprecated: "Mapping deprecated",
  billing_mapping_archived: "Mapping archived",
  provider_reference_observed: "Provider reference observed",
  provider_reference_reconciled: "Provider reference reconciled"
};

function displayLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 160 ? `${normalized.slice(0, 157).trimEnd()}...` : normalized;
}

function providerLabel(value: ContractorPackageBillingMapping["billingProvider"]) {
  return providerLabels[value] ?? value;
}

function environmentLabel(
  value: ContractorPackageBillingMapping["providerEnvironment"]
) {
  return environmentLabels[value] ?? value;
}

function reference(
  id: string | null | undefined,
  provided: ContractorPackageBillingMappingDetailReference | undefined,
  fallbackLabel: string
): ContractorPackageBillingMappingDetailReference {
  if (provided) {
    return provided;
  }

  return {
    id: id ?? null,
    label: id ? fallbackLabel : `Missing ${fallbackLabel.toLowerCase()} reference`,
    secondaryLabel: id ?? "Not recorded"
  };
}

function snapshotSection(
  label: string,
  value: Record<string, unknown> | null
): ContractorPackageBillingMappingDetailSnapshotSection {
  const key = label.toLowerCase().replaceAll("/", "-").replaceAll(" ", "-");

  if (!value || Object.keys(value).length === 0) {
    return {
      key,
      label,
      state: "empty",
      summary: `${label} is not recorded.`
    };
  }

  const keys = Object.keys(value).sort();

  return {
    key,
    label,
    state: "present",
    summary: `${label} has ${keys.length} top-level field${
      keys.length === 1 ? "" : "s"
    } recorded: ${keys.slice(0, 5).join(", ")}${
      keys.length > 5 ? ", ..." : ""
    }. Values are summarized, not dumped.`
  };
}

function auditRows(
  mappingId: string,
  events: ContractorPackageBillingMappingAuditEvent[]
): ContractorPackageBillingMappingDetailAuditRow[] {
  return events
    .filter((event) => event.contractorPackageBillingMappingId === mappingId)
    .slice()
    .sort((left, right) => {
      const occurredCompare =
        Date.parse(right.occurredAt) - Date.parse(left.occurredAt);

      return (
        occurredCompare ||
        Date.parse(right.createdAt) - Date.parse(left.createdAt) ||
        right.id.localeCompare(left.id)
      );
    })
    .map((event) => {
      const caveats: string[] = [];

      if (!event.reason) {
        caveats.push("No operator reason is recorded.");
      }

      if (!event.contractorPackageAssignmentId) {
        caveats.push("No contractor package assignment reference is recorded.");
      }

      if (!event.companyId) {
        caveats.push("No company reference is recorded.");
      }

      return {
        id: event.id,
        eventType: event.eventType,
        eventLabel: auditEventLabels[event.eventType],
        occurredAt: event.occurredAt,
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        beforeSnapshotSummary: snapshotSection(
          "Before snapshot",
          event.beforeSnapshot
        ).summary,
        afterSnapshotSummary: snapshotSection(
          "After snapshot",
          event.afterSnapshot
        ).summary,
        metadataSummary: snapshotSection("Metadata", event.metadata).summary,
        caveats
      };
    });
}

export function buildContractorPackageBillingMappingDetail(
  input: ContractorPackageBillingMappingDetailInput
): ContractorPackageBillingMappingDetailModel {
  const mapping = input.mapping;
  const rows = auditRows(input.mappingId, input.auditEvents);
  const caveats = [
    "This provider mapping detail view is read-only and does not expose provider, Stripe, subscription, billing, package assignment, lifecycle, entitlement, module, runtime, contractor permission, reporting, automation, AI, or starter-pack controls.",
    "Provider references are internal reconciliation references only; they are not business truth, payment method storage, raw provider payloads, secrets, or billing execution instructions.",
    "Expected, observed, mapping, audit, and metadata snapshots are summarized for operator inspection only and are not dumped."
  ];

  if (!mapping) {
    if (input.unavailableReason) {
      caveats.push(input.unavailableReason);
    }

    return {
      generatedAt: input.generatedAt,
      found: false,
      readOnly: true,
      ...noBehaviorFlags,
      mappingId: input.mappingId,
      billingProvider: "unavailable",
      providerEnvironment: "unavailable",
      billingState: "unavailable",
      reconciliationState: "unavailable",
      providerCustomerReferenceLabel: "Not available.",
      providerProductReferenceLabel: "Not available.",
      providerPriceReferenceLabel: "Not available.",
      providerSubscriptionReferenceLabel: "Not available.",
      providerSubscriptionItemReferenceLabel: "Not available.",
      trialOrEarlyAccessState: "Not available.",
      customOrGrandfatheredTermsMarker: "Not available.",
      mismatchSummary: "Not available.",
      lastVerifiedAt: null,
      createdAt: null,
      updatedAt: null,
      archivedAt: null,
      assignmentReference: reference(null, undefined, "Assignment"),
      companyReference: reference(null, undefined, "Company"),
      packageDefinitionReference: reference(null, undefined, "Package definition"),
      packageDefinitionVersionReference: reference(
        null,
        undefined,
        "Package version"
      ),
      summaryCards: [
        {
          id: "mapping-found",
          label: "Mapping found",
          value: "No",
          tone: "warning",
          description: "The requested provider mapping could not be loaded."
        }
      ],
      snapshotSections: [
        snapshotSection("Expected provider state snapshot", null),
        snapshotSection("Observed provider state snapshot", null),
        snapshotSection("Mapping snapshot", null)
      ],
      auditTimelineRows: [],
      mismatchCaveats: [
        "No provider mapping row is available for this identifier.",
        "No provider mapping audit evidence is available for this identifier."
      ],
      caveats,
      operatorGuidance: [
        "Return to the provider mapping catalog and choose a known mapping row.",
        "Do not seed provider mapping data from the browser to satisfy this state."
      ]
    };
  }

  if (!mapping.contractorPackageAssignmentId) {
    caveats.push("This mapping is missing a contractor package assignment reference.");
  }

  if (!mapping.companyId) {
    caveats.push("This mapping is missing a company reference.");
  }

  if (!mapping.packageDefinitionId) {
    caveats.push("This mapping is missing a package definition reference.");
  }

  if (!mapping.packageDefinitionVersionId) {
    caveats.push("This mapping is missing a package definition version reference.");
  }

  if (
    mapping.billingState === "mismatch_detected" ||
    mapping.reconciliationState === "mismatch_detected"
  ) {
    caveats.push("A provider mapping mismatch is recorded for operator review.");
  }

  if (mapping.reconciliationState === "support_review_required") {
    caveats.push("Support review is required before future execution work.");
  }

  if (rows.length === 0) {
    caveats.push("No provider mapping audit evidence is recorded for this mapping.");
  }

  if (mapping.archivedAt) {
    caveats.push("This mapping is archived and shown for inspection history only.");
  }

  const assignmentReference = reference(
    mapping.contractorPackageAssignmentId,
    input.linkedReferences?.assignment,
    "Assignment"
  );
  const companyReference = reference(
    mapping.companyId,
    input.linkedReferences?.company,
    "Company"
  );
  const packageDefinitionReference = reference(
    mapping.packageDefinitionId,
    input.linkedReferences?.packageDefinition,
    "Package definition"
  );
  const packageDefinitionVersionReference = reference(
    mapping.packageDefinitionVersionId,
    input.linkedReferences?.packageDefinitionVersion,
    "Package version"
  );

  return {
    generatedAt: input.generatedAt,
    found: true,
    readOnly: true,
    ...noBehaviorFlags,
    mappingId: mapping.id,
    billingProvider: providerLabel(mapping.billingProvider),
    providerEnvironment: environmentLabel(mapping.providerEnvironment),
    billingState: mapping.billingState,
    reconciliationState: mapping.reconciliationState,
    providerCustomerReferenceLabel: displayLabel(
      mapping.providerCustomerReference,
      "No provider customer reference"
    ),
    providerProductReferenceLabel: displayLabel(
      mapping.providerProductReference,
      "No provider product reference"
    ),
    providerPriceReferenceLabel: displayLabel(
      mapping.providerPriceReference,
      "No provider price reference"
    ),
    providerSubscriptionReferenceLabel: displayLabel(
      mapping.providerSubscriptionReference,
      "No provider subscription reference"
    ),
    providerSubscriptionItemReferenceLabel: displayLabel(
      mapping.providerSubscriptionItemReference,
      "No provider subscription item reference"
    ),
    trialOrEarlyAccessState: displayLabel(
      mapping.trialOrEarlyAccessState,
      "No trial or early-access marker recorded."
    ),
    customOrGrandfatheredTermsMarker: displayLabel(
      mapping.customOrGrandfatheredTermsMarker,
      "No custom or grandfathered marker recorded."
    ),
    mismatchSummary: displayLabel(
      mapping.mismatchSummary,
      "No mismatch summary recorded."
    ),
    lastVerifiedAt: mapping.lastVerifiedAt,
    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
    archivedAt: mapping.archivedAt,
    assignmentReference,
    companyReference,
    packageDefinitionReference,
    packageDefinitionVersionReference,
    summaryCards: [
      {
        id: "mapping-state",
        label: "Mapping state",
        value: mapping.reconciliationState,
        tone:
          mapping.reconciliationState === "verified"
            ? "good"
            : mapping.reconciliationState === "mismatch_detected" ||
                mapping.reconciliationState === "support_review_required" ||
                mapping.billingState === "mismatch_detected"
              ? "critical"
              : "neutral",
        description: "Current reconciliation state from the provider mapping row."
      },
      {
        id: "billing-state",
        label: "Billing state",
        value: mapping.billingState,
        tone:
          mapping.billingState === "active" || mapping.billingState === "verified"
            ? "good"
            : mapping.billingState === "mismatch_detected" ||
                mapping.billingState === "suspended"
              ? "critical"
              : "neutral",
        description: "Stored billing-state label. This does not verify provider state live."
      },
      {
        id: "audit-event-count",
        label: "Audit events",
        value: rows.length,
        tone: rows.length > 0 ? "neutral" : "warning",
        description: "Provider mapping audit evidence rows available for read-only inspection."
      }
    ],
    snapshotSections: [
      snapshotSection(
        "Expected provider state snapshot",
        mapping.expectedProviderStateSnapshot
      ),
      snapshotSection(
        "Observed provider state snapshot",
        mapping.observedProviderStateSnapshot
      ),
      snapshotSection("Mapping snapshot", mapping.mappingSnapshot)
    ],
    auditTimelineRows: rows,
    mismatchCaveats: [
      mapping.mismatchSummary
        ? `Mismatch summary recorded: ${displayLabel(mapping.mismatchSummary, "")}`
        : "No mismatch summary is recorded.",
      mapping.reconciliationState === "mismatch_detected" ||
      mapping.billingState === "mismatch_detected"
        ? "The mapping is marked mismatch_detected for read-only operator review."
        : "The mapping is not marked mismatch_detected.",
      rows.length === 0
        ? "No provider mapping audit evidence is recorded for this mapping."
        : `${rows.length} provider mapping audit event${
            rows.length === 1 ? "" : "s"
          } are visible for read-only inspection.`
    ],
    caveats,
    operatorGuidance: [
      "Use this view to inspect one provider mapping row and its audit evidence only.",
      "Provider customer, product, price, subscription, and subscription-item values are references only and are not payment methods, provider truth, or billing execution instructions.",
      "Do not infer live Stripe state, subscription operation readiness, billing execution readiness, entitlement access, module visibility, contractor permissions, package assignment activation, or runtime behavior from this detail view.",
      "No provider mutation, Stripe call, subscription operation, billing execution, package assignment write, lifecycle control, reporting/export, automation, AI behavior, or starter-pack provisioning exists in this slice."
    ]
  };
}
