import type {
  ContractorPackageBillingProviderEnvironment,
  ContractorPackageBillingSupportReview,
  ContractorPackageBillingSupportReviewEvent,
  ContractorPackageBillingSupportReviewEventType,
  ContractorPackageBillingSupportReviewResolutionCategory,
  ContractorPackageBillingSupportReviewStatus
} from "@floorconnector/types";

export type ContractorPackageBillingSupportReviewReadModelTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

type ContractorPackageBillingSupportReviewBucketKey =
  | ContractorPackageBillingSupportReviewStatus
  | ContractorPackageBillingSupportReviewResolutionCategory
  | ContractorPackageBillingProviderEnvironment
  | ContractorPackageBillingSupportReviewEventType;

export type ContractorPackageBillingSupportReviewBucket = {
  key: ContractorPackageBillingSupportReviewBucketKey;
  label: string;
  count: number;
  description: string;
};

export type ContractorPackageBillingSupportReviewSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: ContractorPackageBillingSupportReviewReadModelTone;
  description: string;
};

export type ContractorPackageBillingSupportReviewRow = {
  id: string;
  mappingId: string | null;
  assignmentId: string | null;
  companyId: string | null;
  packageDefinitionId: string | null;
  packageDefinitionVersionId: string | null;
  reviewStatus: ContractorPackageBillingSupportReviewStatus;
  resolutionCategory: ContractorPackageBillingSupportReviewResolutionCategory;
  providerEnvironmentLabel: string;
  supportSummary: string;
  blockedReasonSummary: string;
  escalationReasonSummary: string;
  providerReferenceSummary: string;
  reconciliationEvidenceSummary: string;
  webhookEvidenceSummary: string;
  operatorEvidenceSummary: string;
  rollbackRecoverySummary: string;
  archivedAt: string | null;
  caveats: string[];
};

export type ContractorPackageBillingSupportReviewEventRow = {
  id: string;
  supportReviewId: string;
  mappingId: string | null;
  assignmentId: string | null;
  companyId: string | null;
  eventType: ContractorPackageBillingSupportReviewEventType;
  eventLabel: string;
  reasonSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  occurredAt: string;
  caveats: string[];
};

export type ContractorPackageBillingSupportReviewReadModelInput = {
  generatedAt: string;
  supportReviews: ContractorPackageBillingSupportReview[];
  supportReviewEvents: ContractorPackageBillingSupportReviewEvent[];
  unavailableSources?: {
    supportReviews?: string;
    supportReviewEvents?: string;
  };
};

export type ContractorPackageBillingSupportReviewReadModel = {
  generatedAt: string;
  readOnly: true;
  actionAvailable: false;
  mutationAvailable: false;
  correctiveExecutionAvailable: false;
  stripeCallAvailable: false;
  providerCallAvailable: false;
  subscriptionOperationAvailable: false;
  billingMutationAvailable: false;
  entitlementEffect: false;
  moduleEffect: false;
  runtimeEffect: false;
  packageAssignmentEffect: false;
  summaryCards: ContractorPackageBillingSupportReviewSummaryCard[];
  reviewStatusBuckets: ContractorPackageBillingSupportReviewBucket[];
  resolutionCategoryBuckets: ContractorPackageBillingSupportReviewBucket[];
  providerEnvironmentBuckets: ContractorPackageBillingSupportReviewBucket[];
  supportReviewEventTypeBuckets: ContractorPackageBillingSupportReviewBucket[];
  supportReviewRows: ContractorPackageBillingSupportReviewRow[];
  supportReviewEventRows: ContractorPackageBillingSupportReviewEventRow[];
  attentionCaveats: string[];
  operatorGuidance: string[];
  caveats: string[];
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  correctiveExecutionAvailable: false,
  stripeCallAvailable: false,
  providerCallAvailable: false,
  subscriptionOperationAvailable: false,
  billingMutationAvailable: false,
  entitlementEffect: false,
  moduleEffect: false,
  runtimeEffect: false,
  packageAssignmentEffect: false
} as const;

const reviewStatusLabels: Record<
  ContractorPackageBillingSupportReviewStatus,
  string
> = {
  pending_review: "Pending review",
  awaiting_evidence: "Awaiting evidence",
  awaiting_provider_confirmation: "Awaiting provider confirmation",
  approved_for_resolution: "Approved for resolution",
  resolution_blocked: "Resolution blocked",
  resolved: "Resolved",
  archived: "Archived"
};

const resolutionCategoryLabels: Record<
  ContractorPackageBillingSupportReviewResolutionCategory,
  string
> = {
  provider_state_mismatch: "Provider state mismatch",
  duplicate_provider_subscription: "Duplicate provider subscription",
  orphaned_provider_subscription: "Orphaned provider subscription",
  stale_provider_mapping: "Stale provider mapping",
  invalid_environment_mix: "Invalid environment mix",
  unsupported_custom_contract: "Unsupported custom contract",
  webhook_replay_issue: "Webhook replay issue",
  missing_provider_customer: "Missing provider customer",
  missing_provider_subscription: "Missing provider subscription",
  manual_support_override_required: "Manual support override required"
};

const environmentLabels: Record<ContractorPackageBillingProviderEnvironment, string> = {
  sandbox: "Sandbox",
  test: "Test",
  production: "Production",
  unknown: "Unknown environment"
};

const eventLabels: Record<ContractorPackageBillingSupportReviewEventType, string> = {
  support_review_created: "Support review created",
  support_review_updated: "Support review updated",
  support_review_evidence_added: "Evidence added",
  support_review_provider_confirmation_requested: "Provider confirmation requested",
  support_review_provider_confirmation_received: "Provider confirmation received",
  support_review_approved_for_resolution: "Approved for resolution",
  support_review_resolution_blocked: "Resolution blocked",
  support_review_resolved: "Support review resolved",
  support_review_archived: "Support review archived"
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

function countBuckets<T extends ContractorPackageBillingSupportReviewBucketKey>(input: {
  keys: readonly T[];
  labels: Record<T, string>;
  values: T[];
  emptyDescription: string;
  populatedDescription: (label: string, count: number) => string;
}): ContractorPackageBillingSupportReviewBucket[] {
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

function buildSupportReviewRows(
  supportReviews: ContractorPackageBillingSupportReview[],
  events: ContractorPackageBillingSupportReviewEvent[]
): ContractorPackageBillingSupportReviewRow[] {
  const eventCounts = events.reduce((map, event) => {
    map.set(event.supportReviewId, (map.get(event.supportReviewId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return supportReviews
    .slice()
    .sort((left, right) => {
      const attentionCompare =
        Number(right.reviewStatus === "resolution_blocked") -
        Number(left.reviewStatus === "resolution_blocked");
      const updatedCompare =
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt);

      return (
        attentionCompare ||
        updatedCompare ||
        left.reviewStatus.localeCompare(right.reviewStatus) ||
        left.id.localeCompare(right.id)
      );
    })
    .map((review) => {
      const caveats: string[] = [];

      if (!review.contractorPackageBillingMappingId) {
        caveats.push("Missing provider mapping reference.");
      }

      if (!review.contractorPackageAssignmentId) {
        caveats.push("Missing contractor package assignment reference.");
      }

      if (!review.companyId) {
        caveats.push("Missing company reference.");
      }

      if (!review.packageDefinitionId) {
        caveats.push("Missing package definition reference.");
      }

      if (!review.packageDefinitionVersionId) {
        caveats.push("Missing package definition version reference.");
      }

      if (review.providerEnvironment === "unknown") {
        caveats.push("Provider environment is unknown.");
      }

      if (review.reviewStatus === "resolution_blocked") {
        caveats.push("Support review is blocked and needs operator review.");
      }

      if (
        review.reviewStatus === "awaiting_evidence" ||
        review.reviewStatus === "awaiting_provider_confirmation"
      ) {
        caveats.push("Support review is waiting on evidence or provider confirmation.");
      }

      if (review.reviewStatus === "approved_for_resolution") {
        caveats.push("Approved-for-resolution is evidence only and does not execute corrective action.");
      }

      if ((eventCounts.get(review.id) ?? 0) === 0) {
        caveats.push("No support review event evidence is recorded.");
      }

      if (review.archivedAt) {
        caveats.push("Support review is archived and shown for evidence history only.");
      }

      return {
        id: review.id,
        mappingId: review.contractorPackageBillingMappingId,
        assignmentId: review.contractorPackageAssignmentId,
        companyId: review.companyId,
        packageDefinitionId: review.packageDefinitionId,
        packageDefinitionVersionId: review.packageDefinitionVersionId,
        reviewStatus: review.reviewStatus,
        resolutionCategory: review.resolutionCategory,
        providerEnvironmentLabel: environmentLabels[review.providerEnvironment],
        supportSummary: displayLabel(
          review.supportSummary,
          "No support summary recorded."
        ),
        blockedReasonSummary: displayLabel(
          review.blockedReason,
          "No blocked reason recorded."
        ),
        escalationReasonSummary: displayLabel(
          review.escalationReason,
          "No escalation reason recorded."
        ),
        providerReferenceSummary: summarizeJsonObject(
          "Provider reference summary",
          review.providerReferenceSummary
        ),
        reconciliationEvidenceSummary: summarizeJsonObject(
          "Reconciliation evidence snapshot",
          review.reconciliationEvidenceSnapshot
        ),
        webhookEvidenceSummary: summarizeJsonObject(
          "Webhook evidence snapshot",
          review.webhookEvidenceSnapshot
        ),
        operatorEvidenceSummary: summarizeJsonObject(
          "Operator evidence snapshot",
          review.operatorEvidenceSnapshot
        ),
        rollbackRecoverySummary: summarizeJsonObject(
          "Rollback/recovery snapshot",
          review.rollbackRecoverySnapshot
        ),
        archivedAt: review.archivedAt,
        caveats
      };
    });
}

function buildEventRows(
  events: ContractorPackageBillingSupportReviewEvent[]
): ContractorPackageBillingSupportReviewEventRow[] {
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
        supportReviewId: event.supportReviewId,
        mappingId: event.contractorPackageBillingMappingId,
        assignmentId: event.contractorPackageAssignmentId,
        companyId: event.companyId,
        eventType: event.eventType,
        eventLabel: eventLabels[event.eventType],
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

export function buildContractorPackageBillingSupportReviewReadModel(
  input: ContractorPackageBillingSupportReviewReadModelInput
): ContractorPackageBillingSupportReviewReadModel {
  const supportReviews = input.supportReviews;
  const supportReviewEvents = input.supportReviewEvents;
  const blockedReviews = supportReviews.filter(
    (review) => review.reviewStatus === "resolution_blocked"
  );
  const awaitingEvidenceReviews = supportReviews.filter(
    (review) =>
      review.reviewStatus === "awaiting_evidence" ||
      review.reviewStatus === "awaiting_provider_confirmation"
  );
  const approvedForResolutionReviews = supportReviews.filter(
    (review) => review.reviewStatus === "approved_for_resolution"
  );
  const missingReferences = supportReviews.filter(
    (review) =>
      !review.contractorPackageBillingMappingId ||
      !review.contractorPackageAssignmentId ||
      !review.companyId ||
      !review.packageDefinitionId ||
      !review.packageDefinitionVersionId
  );
  const supportReviewRows = buildSupportReviewRows(
    supportReviews,
    supportReviewEvents
  );
  const supportReviewEventRows = buildEventRows(supportReviewEvents);
  const caveats = [
    "Support review readiness is read-only evidence inspection only.",
    "Support review rows do not execute corrective actions, call Stripe or providers, create/update/cancel subscriptions, execute billing, collect payment, or mutate provider state.",
    "Support review rows do not mutate package assignments, enforce entitlements, gate modules, change contractor permissions, provision starter packs, report/export, run automation/AI, or alter runtime behavior.",
    "Provider, reconciliation, webhook, operator, rollback/recovery, before/after, and metadata snapshots are summarized for operator inspection only; they are not raw provider payloads, payment method records, secrets, or execution instructions."
  ];

  if (input.unavailableSources?.supportReviews) {
    caveats.push(input.unavailableSources.supportReviews);
  }

  if (input.unavailableSources?.supportReviewEvents) {
    caveats.push(input.unavailableSources.supportReviewEvents);
  }

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    ...noBehaviorFlags,
    summaryCards: [
      {
        id: "support-review-count",
        label: "Support reviews",
        value: supportReviews.length,
        tone: supportReviews.length > 0 ? "neutral" : "warning",
        description: "Billing/provider support review evidence rows available for read-only inspection."
      },
      {
        id: "support-review-blocked-count",
        label: "Blocked reviews",
        value: blockedReviews.length,
        tone: blockedReviews.length > 0 ? "critical" : "good",
        description: "Rows marked resolution_blocked for support review attention."
      },
      {
        id: "support-review-awaiting-count",
        label: "Awaiting evidence",
        value: awaitingEvidenceReviews.length,
        tone: awaitingEvidenceReviews.length > 0 ? "warning" : "good",
        description: "Rows waiting on evidence or provider confirmation."
      },
      {
        id: "support-review-approved-count",
        label: "Approved labels",
        value: approvedForResolutionReviews.length,
        tone: approvedForResolutionReviews.length > 0 ? "warning" : "neutral",
        description: "Rows labeled approved_for_resolution; this is not corrective-action execution."
      }
    ],
    reviewStatusBuckets: countBuckets({
      keys: Object.keys(reviewStatusLabels) as ContractorPackageBillingSupportReviewStatus[],
      labels: reviewStatusLabels,
      values: supportReviews.map((review) => review.reviewStatus),
      emptyDescription: "No support review rows are recorded for this status.",
      populatedDescription: (label, count) =>
        `${count} support review row${count === 1 ? "" : "s"} are in ${label.toLowerCase()} status.`
    }),
    resolutionCategoryBuckets: countBuckets({
      keys: Object.keys(
        resolutionCategoryLabels
      ) as ContractorPackageBillingSupportReviewResolutionCategory[],
      labels: resolutionCategoryLabels,
      values: supportReviews.map((review) => review.resolutionCategory),
      emptyDescription: "No support review rows are recorded for this category.",
      populatedDescription: (label, count) =>
        `${count} support review row${count === 1 ? "" : "s"} reference ${label.toLowerCase()}.`
    }),
    providerEnvironmentBuckets: countBuckets({
      keys: Object.keys(environmentLabels) as ContractorPackageBillingProviderEnvironment[],
      labels: environmentLabels,
      values: supportReviews.map((review) => review.providerEnvironment),
      emptyDescription: "No support review rows are recorded for this environment.",
      populatedDescription: (label, count) =>
        `${count} support review row${count === 1 ? "" : "s"} are marked ${label.toLowerCase()}.`
    }),
    supportReviewEventTypeBuckets: countBuckets({
      keys: Object.keys(eventLabels) as ContractorPackageBillingSupportReviewEventType[],
      labels: eventLabels,
      values: supportReviewEvents.map((event) => event.eventType),
      emptyDescription: "No support review events are recorded for this event type.",
      populatedDescription: (label, count) =>
        `${count} ${label.toLowerCase()} event${count === 1 ? "" : "s"} are recorded.`
    }),
    supportReviewRows,
    supportReviewEventRows,
    attentionCaveats: [
      supportReviews.length === 0
        ? "No billing/provider support review records exist yet; the read-only empty state should render safely."
        : `${supportReviews.length} billing/provider support review row${supportReviews.length === 1 ? "" : "s"} loaded for read-only evidence inspection.`,
      blockedReviews.length === 0
        ? "No support reviews are currently marked resolution_blocked."
        : `${blockedReviews.length} support review row${blockedReviews.length === 1 ? "" : "s"} ${
            blockedReviews.length === 1 ? "is" : "are"
          } blocked and need${blockedReviews.length === 1 ? "s" : ""} operator review.`,
      awaitingEvidenceReviews.length === 0
        ? "No support reviews are currently waiting on evidence or provider confirmation."
        : `${awaitingEvidenceReviews.length} support review row${awaitingEvidenceReviews.length === 1 ? "" : "s"} are waiting on evidence or provider confirmation.`,
      missingReferences.length === 0
        ? "Every loaded support review has mapping, assignment, company, package definition, and package version references."
        : `${missingReferences.length} support review row${missingReferences.length === 1 ? "" : "s"} ${
            missingReferences.length === 1 ? "is" : "are"
          } missing mapping, assignment, company, package definition, or package version references.`,
      supportReviewEvents.length === 0
        ? "No support review event evidence is recorded yet."
        : `${supportReviewEvents.length} support review event${supportReviewEvents.length === 1 ? "" : "s"} are visible for read-only review.`
    ],
    operatorGuidance: [
      "Use this section to inspect support-review evidence, status buckets, category buckets, provider environments, and caveats only.",
      "Treat approved_for_resolution as an evidence label only; no corrective-action execution path exists in this slice.",
      "Do not infer live Stripe/provider state, subscription operation readiness, billing execution readiness, entitlement access, module visibility, contractor permissions, package assignment activation, reporting/export authority, automation, AI behavior, or runtime behavior from support review rows.",
      "No provider mutation, subscription operation, billing execution, package assignment write, lifecycle control, corrective action, reporting/export, automation, AI behavior, or starter-pack provisioning exists in this slice."
    ],
    caveats
  };
}
