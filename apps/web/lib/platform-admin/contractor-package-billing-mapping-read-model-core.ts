import type {
  ContractorPackageBillingMapping,
  ContractorPackageBillingMappingAuditEvent,
  ContractorPackageBillingMappingAuditEventType,
  ContractorPackageBillingProvider,
  ContractorPackageBillingProviderEnvironment,
  ContractorPackageBillingReconciliationState,
  ContractorPackageBillingState
} from "@floorconnector/types";

export type ContractorPackageBillingMappingReadModelTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

type ContractorPackageBillingMappingBucketKey =
  | ContractorPackageBillingProvider
  | ContractorPackageBillingProviderEnvironment
  | ContractorPackageBillingState
  | ContractorPackageBillingReconciliationState
  | ContractorPackageBillingMappingAuditEventType;

export type ContractorPackageBillingMappingBucket = {
  key: ContractorPackageBillingMappingBucketKey;
  label: string;
  count: number;
  description: string;
};

export type ContractorPackageBillingMappingSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: ContractorPackageBillingMappingReadModelTone;
  description: string;
};

export type ContractorPackageBillingMappingRow = {
  id: string;
  assignmentId: string | null;
  companyId: string | null;
  packageDefinitionId: string | null;
  packageDefinitionVersionId: string | null;
  providerLabel: string;
  providerEnvironmentLabel: string;
  billingState: ContractorPackageBillingState;
  reconciliationState: ContractorPackageBillingReconciliationState;
  subscriptionReferenceLabel: string;
  expectedProviderStateSummary: string;
  observedProviderStateSummary: string;
  mappingSnapshotSummary: string;
  mismatchSummary: string;
  lastVerifiedAt: string | null;
  archivedAt: string | null;
  caveats: string[];
};

export type ContractorPackageBillingMappingAuditRow = {
  id: string;
  mappingId: string | null;
  assignmentId: string | null;
  companyId: string | null;
  eventType: ContractorPackageBillingMappingAuditEventType;
  eventLabel: string;
  reasonSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  occurredAt: string;
  caveats: string[];
};

export type ContractorPackageBillingMappingReadModelInput = {
  generatedAt: string;
  mappings: ContractorPackageBillingMapping[];
  auditEvents: ContractorPackageBillingMappingAuditEvent[];
  unavailableSources?: {
    mappings?: string;
    auditEvents?: string;
  };
};

export type ContractorPackageBillingMappingReadModel = {
  generatedAt: string;
  readOnly: true;
  actionAvailable: false;
  mutationAvailable: false;
  billingMutationAvailable: false;
  stripeCallAvailable: false;
  subscriptionOperationAvailable: false;
  entitlementEffect: false;
  moduleEffect: false;
  runtimeEffect: false;
  packageAssignmentEffect: false;
  summaryCards: ContractorPackageBillingMappingSummaryCard[];
  providerBuckets: ContractorPackageBillingMappingBucket[];
  environmentBuckets: ContractorPackageBillingMappingBucket[];
  billingStateBuckets: ContractorPackageBillingMappingBucket[];
  reconciliationStateBuckets: ContractorPackageBillingMappingBucket[];
  auditEventTypeBuckets: ContractorPackageBillingMappingBucket[];
  mappingRows: ContractorPackageBillingMappingRow[];
  auditRows: ContractorPackageBillingMappingAuditRow[];
  mismatchCaveats: string[];
  operatorGuidance: string[];
  caveats: string[];
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  billingMutationAvailable: false,
  stripeCallAvailable: false,
  subscriptionOperationAvailable: false,
  entitlementEffect: false,
  moduleEffect: false,
  runtimeEffect: false,
  packageAssignmentEffect: false
} as const;

const providerLabels: Record<ContractorPackageBillingProvider, string> = {
  stripe: "Stripe",
  manual_review: "Manual review",
  unknown: "Unknown provider"
};

const environmentLabels: Record<ContractorPackageBillingProviderEnvironment, string> = {
  sandbox: "Sandbox",
  test: "Test",
  production: "Production",
  unknown: "Unknown environment"
};

const billingStateLabels: Record<ContractorPackageBillingState, string> = {
  not_started: "Not started",
  mapped: "Mapped",
  verified: "Verified",
  active: "Active",
  mismatch_detected: "Mismatch detected",
  suspended: "Suspended",
  deprecated: "Deprecated",
  archived: "Archived"
};

const reconciliationStateLabels: Record<
  ContractorPackageBillingReconciliationState,
  string
> = {
  not_started: "Not started",
  pending_provider: "Pending provider",
  pending_verification: "Pending verification",
  verified: "Verified",
  mismatch_detected: "Mismatch detected",
  support_review_required: "Support review required",
  suspended: "Suspended",
  archived: "Archived"
};

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

function summarizeJsonObject(
  label: string,
  value: Record<string, unknown> | null
) {
  if (!value || Object.keys(value).length === 0) {
    return `${label} is not recorded.`;
  }

  const keys = Object.keys(value).sort();

  return `${label} has ${keys.length} top-level field${
    keys.length === 1 ? "" : "s"
  } recorded: ${keys.slice(0, 5).join(", ")}${
    keys.length > 5 ? ", ..." : ""
  }. Values are summarized, not dumped.`;
}

function countBuckets<T extends ContractorPackageBillingMappingBucketKey>(input: {
  keys: readonly T[];
  labels: Record<T, string>;
  values: T[];
  emptyDescription: string;
  populatedDescription: (label: string, count: number) => string;
}): ContractorPackageBillingMappingBucket[] {
  const counts = input.values.reduce((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map<T, number>());

  return input.keys
    .map((key) => {
      const count = counts.get(key) ?? 0;
      const label = input.labels[key];

      return {
        key,
        label,
        count,
        description:
          count > 0
            ? input.populatedDescription(label, count)
            : input.emptyDescription
      };
    })
    .filter((bucket) => bucket.count > 0 || input.values.length === 0);
}

function buildMappingRows(
  mappings: ContractorPackageBillingMapping[],
  auditEvents: ContractorPackageBillingMappingAuditEvent[]
): ContractorPackageBillingMappingRow[] {
  const auditCounts = auditEvents.reduce((map, event) => {
    if (event.contractorPackageBillingMappingId) {
      map.set(
        event.contractorPackageBillingMappingId,
        (map.get(event.contractorPackageBillingMappingId) ?? 0) + 1
      );
    }

    return map;
  }, new Map<string, number>());

  return mappings
    .slice()
    .sort((left, right) => {
      const attentionCompare =
        Number(right.reconciliationState === "mismatch_detected") -
        Number(left.reconciliationState === "mismatch_detected");
      const verifiedCompare =
        Date.parse(right.lastVerifiedAt ?? right.updatedAt) -
        Date.parse(left.lastVerifiedAt ?? left.updatedAt);

      return (
        attentionCompare ||
        verifiedCompare ||
        left.billingProvider.localeCompare(right.billingProvider) ||
        left.id.localeCompare(right.id)
      );
    })
    .map((mapping) => {
      const caveats: string[] = [];

      if (!mapping.contractorPackageAssignmentId) {
        caveats.push("Missing contractor package assignment reference.");
      }

      if (!mapping.companyId) {
        caveats.push("Missing company reference.");
      }

      if (!mapping.packageDefinitionId) {
        caveats.push("Missing package definition reference.");
      }

      if (!mapping.packageDefinitionVersionId) {
        caveats.push("Missing package definition version reference.");
      }

      if (mapping.providerEnvironment === "unknown") {
        caveats.push("Provider environment is unknown.");
      }

      if (
        mapping.reconciliationState === "mismatch_detected" ||
        mapping.billingState === "mismatch_detected"
      ) {
        caveats.push("Provider reconciliation mismatch is recorded for operator review.");
      }

      if (
        mapping.reconciliationState === "support_review_required" ||
        mapping.billingState === "suspended"
      ) {
        caveats.push("Provider mapping needs support review before future execution work.");
      }

      if ((auditCounts.get(mapping.id) ?? 0) === 0) {
        caveats.push("No provider mapping audit evidence is recorded.");
      }

      return {
        id: mapping.id,
        assignmentId: mapping.contractorPackageAssignmentId,
        companyId: mapping.companyId,
        packageDefinitionId: mapping.packageDefinitionId,
        packageDefinitionVersionId: mapping.packageDefinitionVersionId,
        providerLabel: providerLabels[mapping.billingProvider],
        providerEnvironmentLabel: environmentLabels[mapping.providerEnvironment],
        billingState: mapping.billingState,
        reconciliationState: mapping.reconciliationState,
        subscriptionReferenceLabel: displayLabel(
          mapping.providerSubscriptionReference,
          "No provider subscription reference"
        ),
        expectedProviderStateSummary: summarizeJsonObject(
          "Expected provider state snapshot",
          mapping.expectedProviderStateSnapshot
        ),
        observedProviderStateSummary: summarizeJsonObject(
          "Observed provider state snapshot",
          mapping.observedProviderStateSnapshot
        ),
        mappingSnapshotSummary: summarizeJsonObject(
          "Mapping snapshot",
          mapping.mappingSnapshot
        ),
        mismatchSummary: displayLabel(
          mapping.mismatchSummary,
          "No mismatch summary recorded."
        ),
        lastVerifiedAt: mapping.lastVerifiedAt,
        archivedAt: mapping.archivedAt,
        caveats
      };
    });
}

function buildAuditRows(
  events: ContractorPackageBillingMappingAuditEvent[]
): ContractorPackageBillingMappingAuditRow[] {
  return events
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

      if (!event.contractorPackageBillingMappingId) {
        caveats.push("No provider mapping reference is recorded.");
      }

      if (!event.contractorPackageAssignmentId) {
        caveats.push("No contractor package assignment reference is recorded.");
      }

      if (!event.companyId) {
        caveats.push("No company reference is recorded.");
      }

      if (!event.reason) {
        caveats.push("No operator reason is recorded.");
      }

      return {
        id: event.id,
        mappingId: event.contractorPackageBillingMappingId,
        assignmentId: event.contractorPackageAssignmentId,
        companyId: event.companyId,
        eventType: event.eventType,
        eventLabel: auditEventLabels[event.eventType],
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        beforeSnapshotSummary: summarizeJsonObject(
          "Before snapshot",
          event.beforeSnapshot
        ),
        afterSnapshotSummary: summarizeJsonObject(
          "After snapshot",
          event.afterSnapshot
        ),
        metadataSummary: summarizeJsonObject("Metadata", event.metadata),
        occurredAt: event.occurredAt,
        caveats
      };
    });
}

export function buildContractorPackageBillingMappingReadModel(
  input: ContractorPackageBillingMappingReadModelInput
): ContractorPackageBillingMappingReadModel {
  const mappings = input.mappings;
  const auditEvents = input.auditEvents;
  const mismatches = mappings.filter(
    (mapping) =>
      mapping.billingState === "mismatch_detected" ||
      mapping.reconciliationState === "mismatch_detected" ||
      mapping.reconciliationState === "support_review_required"
  );
  const verifiedMappings = mappings.filter(
    (mapping) =>
      mapping.billingState === "verified" ||
      mapping.billingState === "active" ||
      mapping.reconciliationState === "verified"
  );
  const missingReferences = mappings.filter(
    (mapping) =>
      !mapping.contractorPackageAssignmentId ||
      !mapping.companyId ||
      !mapping.packageDefinitionId ||
      !mapping.packageDefinitionVersionId
  );
  const mappingRows = buildMappingRows(mappings, auditEvents);
  const auditRows = buildAuditRows(auditEvents);
  const caveats = [
    "Provider mapping readiness is read-only and stores internal references plus safe summaries only.",
    "This model does not call Stripe or any provider API, create/update/cancel subscriptions, execute billing, collect payment, or verify remote provider state.",
    "Provider mapping rows do not enforce entitlements, gate modules, mutate package assignments, change contractor permissions, provision starter packs, or alter runtime behavior.",
    "Expected and observed provider-state snapshots are summarized for operator inspection only; they are not raw provider payloads, payment method records, secrets, or billing execution instructions."
  ];

  if (input.unavailableSources?.mappings) {
    caveats.push(input.unavailableSources.mappings);
  }

  if (input.unavailableSources?.auditEvents) {
    caveats.push(input.unavailableSources.auditEvents);
  }

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    ...noBehaviorFlags,
    summaryCards: [
      {
        id: "provider-mapping-count",
        label: "Provider mappings",
        value: mappings.length,
        tone: mappings.length > 0 ? "neutral" : "warning",
        description: "Internal package-to-provider mapping reference rows available for read-only inspection."
      },
      {
        id: "verified-provider-mapping-count",
        label: "Verified or active",
        value: verifiedMappings.length,
        tone: verifiedMappings.length > 0 ? "good" : "neutral",
        description: "Rows with verified or active billing/reconciliation states. This does not verify provider state live."
      },
      {
        id: "mismatch-provider-mapping-count",
        label: "Needs attention",
        value: mismatches.length,
        tone: mismatches.length > 0 ? "critical" : "good",
        description: "Rows with mismatch or support-review reconciliation states."
      },
      {
        id: "missing-reference-provider-mapping-count",
        label: "Missing references",
        value: missingReferences.length,
        tone: missingReferences.length > 0 ? "warning" : "good",
        description: "Rows missing assignment, company, package definition, or package version references."
      }
    ],
    providerBuckets: countBuckets({
      keys: Object.keys(providerLabels) as ContractorPackageBillingProvider[],
      labels: providerLabels,
      values: mappings.map((mapping) => mapping.billingProvider),
      emptyDescription: "No provider mapping rows are recorded for this provider.",
      populatedDescription: (label, count) =>
        `${count} mapping row${count === 1 ? "" : "s"} reference ${label}.`
    }),
    environmentBuckets: countBuckets({
      keys: Object.keys(environmentLabels) as ContractorPackageBillingProviderEnvironment[],
      labels: environmentLabels,
      values: mappings.map((mapping) => mapping.providerEnvironment),
      emptyDescription: "No provider mapping rows are recorded for this environment.",
      populatedDescription: (label, count) =>
        `${count} mapping row${count === 1 ? "" : "s"} are marked ${label.toLowerCase()}.`
    }),
    billingStateBuckets: countBuckets({
      keys: Object.keys(billingStateLabels) as ContractorPackageBillingState[],
      labels: billingStateLabels,
      values: mappings.map((mapping) => mapping.billingState),
      emptyDescription: "No provider mapping rows are recorded for this billing state.",
      populatedDescription: (label, count) =>
        `${count} mapping row${count === 1 ? "" : "s"} are in ${label.toLowerCase()} billing state.`
    }),
    reconciliationStateBuckets: countBuckets({
      keys: Object.keys(reconciliationStateLabels) as ContractorPackageBillingReconciliationState[],
      labels: reconciliationStateLabels,
      values: mappings.map((mapping) => mapping.reconciliationState),
      emptyDescription: "No provider mapping rows are recorded for this reconciliation state.",
      populatedDescription: (label, count) =>
        `${count} mapping row${count === 1 ? "" : "s"} are in ${label.toLowerCase()} reconciliation state.`
    }),
    auditEventTypeBuckets: countBuckets({
      keys: Object.keys(auditEventLabels) as ContractorPackageBillingMappingAuditEventType[],
      labels: auditEventLabels,
      values: auditEvents.map((event) => event.eventType),
      emptyDescription: "No provider mapping audit events are recorded for this event type.",
      populatedDescription: (label, count) =>
        `${count} ${label.toLowerCase()} audit event${count === 1 ? "" : "s"} are recorded.`
    }),
    mappingRows,
    auditRows,
    mismatchCaveats: [
      mappings.length === 0
        ? "No provider mapping records exist yet; the read-only empty state should render safely."
        : `${mappings.length} provider mapping row${mappings.length === 1 ? "" : "s"} loaded for read-only reconciliation inspection.`,
      mismatches.length === 0
        ? "No provider mapping mismatches are recorded in the loaded read model."
        : `${mismatches.length} provider mapping row${mismatches.length === 1 ? "" : "s"} need mismatch or support-review attention.`,
      missingReferences.length === 0
        ? "Every loaded provider mapping row has assignment, company, package definition, and package version references."
        : `${missingReferences.length} provider mapping row${missingReferences.length === 1 ? "" : "s"} are missing assignment, company, package definition, or package version references.`,
      auditEvents.length === 0
        ? "No provider mapping audit evidence is recorded yet."
        : `${auditEvents.length} provider mapping audit event${auditEvents.length === 1 ? "" : "s"} are visible for read-only review.`
    ],
    operatorGuidance: [
      "Use this section to inspect internal package-to-provider mapping references and reconciliation caveats only.",
      "Sandbox, test, production, and unknown provider environments remain distinguishable in the read model.",
      "Do not infer live Stripe subscription state, billing execution readiness, entitlement access, module visibility, contractor permissions, package assignment activation, or runtime behavior from provider mapping rows.",
      "No provider mutation, subscription operation, billing execution, package assignment write, or lifecycle control exists in this slice."
    ],
    caveats
  };
}
