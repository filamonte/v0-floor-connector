import type {
  ContractorPackageBillingProviderEnvironment,
  ContractorPackageBillingSupportReview,
  ContractorPackageBillingSupportReviewEvent,
  ContractorPackageBillingSupportReviewEventType
} from "@floorconnector/types";

export type ContractorPackageBillingSupportReviewDetailTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type ContractorPackageBillingSupportReviewDetailSummaryCard = {
  id: string;
  label: string;
  value: string | number;
  tone: ContractorPackageBillingSupportReviewDetailTone;
  description: string;
};

export type ContractorPackageBillingSupportReviewDetailReference = {
  id: string | null;
  label: string;
  secondaryLabel: string;
};

export type ContractorPackageBillingSupportReviewDetailEvidenceSection = {
  key: string;
  label: string;
  state: "present" | "empty";
  summary: string;
};

export type ContractorPackageBillingSupportReviewDetailEventRow = {
  id: string;
  eventType: ContractorPackageBillingSupportReviewEventType;
  eventLabel: string;
  occurredAt: string;
  reasonSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  caveats: string[];
};

export type ContractorPackageBillingSupportReviewDetailLinkedReferences = {
  providerMapping?: ContractorPackageBillingSupportReviewDetailReference;
  assignment?: ContractorPackageBillingSupportReviewDetailReference;
  company?: ContractorPackageBillingSupportReviewDetailReference;
  packageDefinition?: ContractorPackageBillingSupportReviewDetailReference;
  packageDefinitionVersion?: ContractorPackageBillingSupportReviewDetailReference;
};

export type ContractorPackageBillingSupportReviewDetailModel = {
  generatedAt: string;
  found: boolean;
  readOnly: true;
  actionAvailable: false;
  mutationAvailable: false;
  correctiveExecutionAvailable: false;
  stripeCallAvailable: false;
  providerCallAvailable: false;
  subscriptionOperationAvailable: false;
  billingMutationAvailable: false;
  billingExecutionAvailable: false;
  entitlementEffect: false;
  moduleEffect: false;
  runtimeEffect: false;
  packageAssignmentEffect: false;
  contractorPermissionEffect: false;
  supportReviewId: string;
  reviewStatus: string;
  resolutionCategory: string;
  providerEnvironment: string;
  supportSummary: string;
  blockedReasonSummary: string;
  escalationReasonSummary: string;
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  providerMappingReference: ContractorPackageBillingSupportReviewDetailReference;
  assignmentReference: ContractorPackageBillingSupportReviewDetailReference;
  companyReference: ContractorPackageBillingSupportReviewDetailReference;
  packageDefinitionReference: ContractorPackageBillingSupportReviewDetailReference;
  packageDefinitionVersionReference: ContractorPackageBillingSupportReviewDetailReference;
  summaryCards: ContractorPackageBillingSupportReviewDetailSummaryCard[];
  evidenceSections: ContractorPackageBillingSupportReviewDetailEvidenceSection[];
  eventTimelineRows: ContractorPackageBillingSupportReviewDetailEventRow[];
  blockedEscalationCaveats: string[];
  caveats: string[];
  operatorGuidance: string[];
};

export type ContractorPackageBillingSupportReviewDetailInput = {
  generatedAt: string;
  supportReviewId: string;
  supportReview: ContractorPackageBillingSupportReview | null;
  events: ContractorPackageBillingSupportReviewEvent[];
  linkedReferences?: ContractorPackageBillingSupportReviewDetailLinkedReferences;
  unavailableReason?: string;
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  correctiveExecutionAvailable: false,
  stripeCallAvailable: false,
  providerCallAvailable: false,
  subscriptionOperationAvailable: false,
  billingMutationAvailable: false,
  billingExecutionAvailable: false,
  entitlementEffect: false,
  moduleEffect: false,
  runtimeEffect: false,
  packageAssignmentEffect: false,
  contractorPermissionEffect: false
} as const;

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

function environmentLabel(value: ContractorPackageBillingProviderEnvironment) {
  return environmentLabels[value] ?? value;
}

function reference(
  id: string | null | undefined,
  provided: ContractorPackageBillingSupportReviewDetailReference | undefined,
  fallbackLabel: string
): ContractorPackageBillingSupportReviewDetailReference {
  if (provided) {
    return provided;
  }

  return {
    id: id ?? null,
    label: id ? fallbackLabel : `Missing ${fallbackLabel.toLowerCase()} reference`,
    secondaryLabel: id ?? "Not recorded"
  };
}

function evidenceSection(
  label: string,
  value: Record<string, unknown> | null
): ContractorPackageBillingSupportReviewDetailEvidenceSection {
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

function eventRows(
  supportReviewId: string,
  events: ContractorPackageBillingSupportReviewEvent[]
): ContractorPackageBillingSupportReviewDetailEventRow[] {
  return events
    .filter((event) => event.supportReviewId === supportReviewId)
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

      if (!event.contractorPackageBillingMappingId) {
        caveats.push("No provider mapping reference is recorded.");
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
        eventLabel: eventLabels[event.eventType],
        occurredAt: event.occurredAt,
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        beforeSnapshotSummary: evidenceSection("Before snapshot", event.beforeSnapshot)
          .summary,
        afterSnapshotSummary: evidenceSection("After snapshot", event.afterSnapshot)
          .summary,
        metadataSummary: evidenceSection("Metadata", event.metadata).summary,
        caveats
      };
    });
}

export function buildContractorPackageBillingSupportReviewDetail(
  input: ContractorPackageBillingSupportReviewDetailInput
): ContractorPackageBillingSupportReviewDetailModel {
  const supportReview = input.supportReview;
  const rows = eventRows(input.supportReviewId, input.events);
  const caveats = [
    "This support review detail view is read-only and does not expose corrective-action execution, provider, Stripe, subscription, billing, package assignment, lifecycle, entitlement, module, runtime, contractor permission, reporting, automation, AI, or starter-pack controls.",
    "Support review evidence is summarized for operator inspection only and is not raw provider truth, payment method storage, provider payload storage, secrets, or billing execution instruction.",
    "Provider reference, reconciliation, webhook, operator, rollback/recovery, event, and metadata snapshots are summarized by top-level keys only and are not dumped."
  ];

  if (!supportReview) {
    if (input.unavailableReason) {
      caveats.push(input.unavailableReason);
    }

    return {
      generatedAt: input.generatedAt,
      found: false,
      readOnly: true,
      ...noBehaviorFlags,
      supportReviewId: input.supportReviewId,
      reviewStatus: "unavailable",
      resolutionCategory: "unavailable",
      providerEnvironment: "unavailable",
      supportSummary: "Not available.",
      blockedReasonSummary: "Not available.",
      escalationReasonSummary: "Not available.",
      createdAt: null,
      updatedAt: null,
      archivedAt: null,
      providerMappingReference: reference(null, undefined, "Provider mapping"),
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
          id: "support-review-found",
          label: "Support review found",
          value: "No",
          tone: "warning",
          description: "The requested support review could not be loaded."
        }
      ],
      evidenceSections: [
        evidenceSection("Provider reference summary", null),
        evidenceSection("Reconciliation evidence snapshot", null),
        evidenceSection("Webhook evidence snapshot", null),
        evidenceSection("Operator evidence snapshot", null),
        evidenceSection("Rollback / recovery snapshot", null)
      ],
      eventTimelineRows: [],
      blockedEscalationCaveats: [
        "No support review row is available for this identifier.",
        "No support review event evidence is available for this identifier."
      ],
      caveats,
      operatorGuidance: [
        "Return to the support review readiness list and choose a known review row.",
        "Do not seed support review data from the browser to satisfy this state."
      ]
    };
  }

  if (!supportReview.contractorPackageBillingMappingId) {
    caveats.push("This support review is missing a provider mapping reference.");
  }

  if (!supportReview.contractorPackageAssignmentId) {
    caveats.push("This support review is missing a contractor package assignment reference.");
  }

  if (!supportReview.companyId) {
    caveats.push("This support review is missing a company reference.");
  }

  if (!supportReview.packageDefinitionId) {
    caveats.push("This support review is missing a package definition reference.");
  }

  if (!supportReview.packageDefinitionVersionId) {
    caveats.push("This support review is missing a package definition version reference.");
  }

  if (supportReview.reviewStatus === "resolution_blocked") {
    caveats.push("This support review is blocked and requires operator review before any future resolution work.");
  }

  if (
    supportReview.reviewStatus === "awaiting_evidence" ||
    supportReview.reviewStatus === "awaiting_provider_confirmation"
  ) {
    caveats.push("This support review is waiting on evidence or provider confirmation.");
  }

  if (supportReview.reviewStatus === "approved_for_resolution") {
    caveats.push("Approved-for-resolution is evidence posture only in this slice; no corrective action is executable here.");
  }

  if (supportReview.reviewStatus === "resolved") {
    caveats.push("Resolved support review state is shown as historical evidence only.");
  }

  if (supportReview.archivedAt || supportReview.reviewStatus === "archived") {
    caveats.push("This support review is archived and shown for inspection history only.");
  }

  if (rows.length === 0) {
    caveats.push("No support review event evidence is recorded for this review.");
  }

  const providerMappingReference = reference(
    supportReview.contractorPackageBillingMappingId,
    input.linkedReferences?.providerMapping,
    "Provider mapping"
  );
  const assignmentReference = reference(
    supportReview.contractorPackageAssignmentId,
    input.linkedReferences?.assignment,
    "Assignment"
  );
  const companyReference = reference(
    supportReview.companyId,
    input.linkedReferences?.company,
    "Company"
  );
  const packageDefinitionReference = reference(
    supportReview.packageDefinitionId,
    input.linkedReferences?.packageDefinition,
    "Package definition"
  );
  const packageDefinitionVersionReference = reference(
    supportReview.packageDefinitionVersionId,
    input.linkedReferences?.packageDefinitionVersion,
    "Package version"
  );
  const blockedReasonSummary = displayLabel(
    supportReview.blockedReason,
    "No blocked reason recorded."
  );
  const escalationReasonSummary = displayLabel(
    supportReview.escalationReason,
    "No escalation reason recorded."
  );

  return {
    generatedAt: input.generatedAt,
    found: true,
    readOnly: true,
    ...noBehaviorFlags,
    supportReviewId: supportReview.id,
    reviewStatus: supportReview.reviewStatus,
    resolutionCategory: supportReview.resolutionCategory,
    providerEnvironment: environmentLabel(supportReview.providerEnvironment),
    supportSummary: displayLabel(
      supportReview.supportSummary,
      "No support summary recorded."
    ),
    blockedReasonSummary,
    escalationReasonSummary,
    createdAt: supportReview.createdAt,
    updatedAt: supportReview.updatedAt,
    archivedAt: supportReview.archivedAt,
    providerMappingReference,
    assignmentReference,
    companyReference,
    packageDefinitionReference,
    packageDefinitionVersionReference,
    summaryCards: [
      {
        id: "review-status",
        label: "Review status",
        value: supportReview.reviewStatus,
        tone:
          supportReview.reviewStatus === "resolved"
            ? "good"
            : supportReview.reviewStatus === "resolution_blocked"
              ? "critical"
              : supportReview.reviewStatus === "awaiting_evidence" ||
                  supportReview.reviewStatus === "awaiting_provider_confirmation"
                ? "warning"
                : "neutral",
        description: "Stored support-review status for read-only inspection."
      },
      {
        id: "resolution-category",
        label: "Resolution category",
        value: supportReview.resolutionCategory,
        tone:
          supportReview.resolutionCategory === "manual_support_override_required"
            ? "warning"
            : "neutral",
        description: "Classifies the support-review evidence. It does not execute a resolution."
      },
      {
        id: "event-count",
        label: "Review events",
        value: rows.length,
        tone: rows.length > 0 ? "neutral" : "warning",
        description: "Support review event evidence rows available for read-only inspection."
      }
    ],
    evidenceSections: [
      evidenceSection(
        "Provider reference summary",
        supportReview.providerReferenceSummary
      ),
      evidenceSection(
        "Reconciliation evidence snapshot",
        supportReview.reconciliationEvidenceSnapshot
      ),
      evidenceSection("Webhook evidence snapshot", supportReview.webhookEvidenceSnapshot),
      evidenceSection("Operator evidence snapshot", supportReview.operatorEvidenceSnapshot),
      evidenceSection(
        "Rollback / recovery snapshot",
        supportReview.rollbackRecoverySnapshot
      )
    ],
    eventTimelineRows: rows,
    blockedEscalationCaveats: [
      supportReview.blockedReason
        ? `Blocked reason recorded: ${blockedReasonSummary}`
        : "No blocked reason is recorded.",
      supportReview.escalationReason
        ? `Escalation reason recorded: ${escalationReasonSummary}`
        : "No escalation reason is recorded.",
      supportReview.reviewStatus === "resolution_blocked"
        ? "Resolution is blocked for operator review; this view cannot execute corrective action."
        : "No corrective-action execution is available from this review state.",
      rows.length === 0
        ? "No support review event evidence is recorded for this review."
        : `${rows.length} support review event${rows.length === 1 ? "" : "s"} are visible for read-only inspection.`
    ],
    caveats,
    operatorGuidance: [
      "Use this view to inspect one billing/provider support review and its events only.",
      "Provider references and evidence summaries are inspection context only; they are not payment methods, raw provider payloads, provider truth, or billing execution instructions.",
      "Do not infer live Stripe state, subscription operation readiness, billing execution readiness, entitlement access, module visibility, contractor permissions, package assignment activation, or runtime behavior from this detail view.",
      "No corrective-action execution, provider mutation, Stripe call, subscription operation, billing execution, package assignment write, lifecycle control, reporting/export, automation, AI behavior, or starter-pack provisioning exists in this slice."
    ]
  };
}
