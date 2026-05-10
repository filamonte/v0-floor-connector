import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent,
  ContractorPackageAssignmentAuditEventType,
  ContractorPackageAssignmentStatus
} from "@floorconnector/types";

import {
  buildContractorPackageAssignmentActivationReadiness,
  type ContractorPackageAssignmentActivationReadinessModel
} from "./contractor-package-assignment-activation-readiness-core";

export type ContractorPackageAssignmentDetailTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type ContractorPackageAssignmentDetailSummaryCard = {
  id: string;
  label: string;
  value: string | number;
  tone: ContractorPackageAssignmentDetailTone;
  description: string;
};

export type ContractorPackageAssignmentDetailSnapshotSection = {
  key: string;
  label: string;
  state: "present" | "empty";
  summary: string;
};

export type ContractorPackageAssignmentDetailAuditRow = {
  id: string;
  eventType: ContractorPackageAssignmentAuditEventType;
  eventLabel: string;
  occurredAt: string;
  reasonSummary: string;
  confirmationSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  caveats: string[];
};

export type ContractorPackageAssignmentDetailModel = {
  generatedAt: string;
  found: boolean;
  readOnly: true;
  mutationControlsAvailable: false;
  approvalControlsAvailable: false;
  scheduleControlsAvailable: false;
  activationControlsAvailable: false;
  cancellationControlsAvailable: false;
  assignmentActivationBehaviorAvailable: false;
  billingBehaviorAvailable: false;
  entitlementRuntimeBehaviorAvailable: false;
  contractorPermissionBehaviorAvailable: false;
  assignmentId: string;
  companyId: string | null;
  companyLabel: string;
  packageDefinitionId: string | null;
  packageDefinitionLabel: string;
  packageDefinitionKey: string;
  packageDefinitionVersionId: string | null;
  packageDefinitionVersionLabel: string;
  packageDefinitionVersionStatus: string;
  status: ContractorPackageAssignmentStatus | "unavailable";
  lifecycleState: ContractorPackageAssignmentStatus | "unavailable";
  effectiveAt: string | null;
  scheduledFor: string | null;
  activatedAt: string | null;
  supersededAt: string | null;
  canceledAt: string | null;
  archivedAt: string | null;
  supersedesAssignmentId: string | null;
  supersededByAssignmentId: string | null;
  cancellationReasonSummary: string;
  supersessionReasonSummary: string;
  grandfatheredContract: boolean;
  customContractLabel: string;
  createdAt: string | null;
  updatedAt: string | null;
  summaryCards: ContractorPackageAssignmentDetailSummaryCard[];
  snapshotSections: ContractorPackageAssignmentDetailSnapshotSection[];
  auditTimelineRows: ContractorPackageAssignmentDetailAuditRow[];
  activationReadiness: ContractorPackageAssignmentActivationReadinessModel;
  caveats: string[];
  operatorGuidance: string[];
};

export type ContractorPackageAssignmentDetailInput = {
  generatedAt: string;
  assignmentId: string;
  assignment: ContractorPackageAssignment | null;
  auditEvents: ContractorPackageAssignmentAuditEvent[];
  relatedAssignments?: ContractorPackageAssignment[];
  unavailableReason?: string;
};

const assignmentStatusLabels: Record<ContractorPackageAssignmentStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  scheduled: "Scheduled",
  active: "Active",
  superseded: "Superseded",
  canceled: "Canceled",
  archived: "Archived"
};

const auditEventLabels: Record<
  ContractorPackageAssignmentAuditEventType,
  string
> = {
  package_assignment_drafted: "Assignment drafted",
  package_assignment_updated: "Assignment updated",
  package_assignment_reviewed: "Assignment reviewed",
  package_assignment_approved: "Assignment approved",
  package_assignment_scheduled: "Assignment scheduled",
  package_assignment_activated: "Assignment activated",
  package_assignment_superseded: "Assignment superseded",
  package_assignment_canceled: "Assignment canceled",
  package_assignment_archived: "Assignment archived"
};

function displayLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 160 ? `${normalized.slice(0, 157).trimEnd()}...` : normalized;
}

function versionLabel(assignment: ContractorPackageAssignment) {
  if (!assignment.packageDefinitionVersionId) {
    return "No package version reference";
  }

  if (assignment.packageDefinitionVersionLabel) {
    return assignment.packageDefinitionVersionLabel;
  }

  return assignment.packageDefinitionVersionNumber
    ? `Version ${assignment.packageDefinitionVersionNumber}`
    : "Unknown package version";
}

function snapshotSection(
  label: string,
  value: Record<string, unknown> | null
): ContractorPackageAssignmentDetailSnapshotSection {
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
  assignmentId: string,
  events: ContractorPackageAssignmentAuditEvent[]
): ContractorPackageAssignmentDetailAuditRow[] {
  return events
    .filter((event) => event.contractorPackageAssignmentId === assignmentId)
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

      if (!event.confirmationText) {
        caveats.push("No confirmation text is recorded.");
      }

      if (!event.packageDefinitionId) {
        caveats.push("No package definition reference is recorded.");
      }

      if (!event.packageDefinitionVersionId) {
        caveats.push("No package definition version reference is recorded.");
      }

      return {
        id: event.id,
        eventType: event.eventType,
        eventLabel: auditEventLabels[event.eventType],
        occurredAt: event.occurredAt,
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        confirmationSummary: displayLabel(
          event.confirmationText,
          "No confirmation text recorded."
        ),
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

export function buildContractorPackageAssignmentDetail(
  input: ContractorPackageAssignmentDetailInput
): ContractorPackageAssignmentDetailModel {
  const assignment = input.assignment;
  const rows = auditRows(input.assignmentId, input.auditEvents);
  const activationReadiness =
    buildContractorPackageAssignmentActivationReadiness({
      generatedAt: input.generatedAt,
      assignmentId: input.assignmentId,
      assignment,
      auditEvents: input.auditEvents,
      relatedAssignments: input.relatedAssignments ?? [],
      unavailableReason: input.unavailableReason
    });
  const caveats = [
    "This assignment detail view is read-only and does not expose assignment create, approve, schedule, activate, cancel, supersede, archive, or mutation controls.",
    "This assignment detail view does not call Stripe, create subscriptions, collect payments, enforce entitlements, gate modules, change contractor permissions, provision starter packs, or alter runtime behavior.",
    "Assignment, billing, entitlement/module, starter-pack, audit, and metadata snapshots are summarized for operator inspection only; they are not raw provider payloads, runtime resolvers, entitlement truth, or provisioning instructions."
  ];

  if (!assignment) {
    if (input.unavailableReason) {
      caveats.push(input.unavailableReason);
    }

    return {
      generatedAt: input.generatedAt,
      found: false,
      readOnly: true,
      mutationControlsAvailable: false,
      approvalControlsAvailable: false,
      scheduleControlsAvailable: false,
      activationControlsAvailable: false,
      cancellationControlsAvailable: false,
      assignmentActivationBehaviorAvailable: false,
      billingBehaviorAvailable: false,
      entitlementRuntimeBehaviorAvailable: false,
      contractorPermissionBehaviorAvailable: false,
      assignmentId: input.assignmentId,
      companyId: null,
      companyLabel: "Assignment unavailable",
      packageDefinitionId: null,
      packageDefinitionLabel: "Assignment unavailable",
      packageDefinitionKey: "unavailable",
      packageDefinitionVersionId: null,
      packageDefinitionVersionLabel: "Assignment unavailable",
      packageDefinitionVersionStatus: "unavailable",
      status: "unavailable",
      lifecycleState: "unavailable",
      effectiveAt: null,
      scheduledFor: null,
      activatedAt: null,
      supersededAt: null,
      canceledAt: null,
      archivedAt: null,
      supersedesAssignmentId: null,
      supersededByAssignmentId: null,
      cancellationReasonSummary: "Not available.",
      supersessionReasonSummary: "Not available.",
      grandfatheredContract: false,
      customContractLabel: "Not recorded.",
      createdAt: null,
      updatedAt: null,
      summaryCards: [
        {
          id: "assignment-found",
          label: "Assignment found",
          value: "No",
          tone: "warning",
          description: "The requested contractor package assignment could not be loaded."
        }
      ],
      snapshotSections: [
        snapshotSection("Assignment snapshot", null),
        snapshotSection("Billing impact snapshot", null),
        snapshotSection("Entitlement/module impact snapshot", null),
        snapshotSection("Starter-pack implication snapshot", null)
      ],
      auditTimelineRows: [],
      activationReadiness,
      caveats,
      operatorGuidance: [
        "Return to the package assignment catalog and choose a known assignment.",
        "Do not create seed data from the browser to satisfy this state."
      ]
    };
  }

  if (!assignment.packageDefinitionId) {
    caveats.push("This assignment is missing a package definition reference.");
  }

  if (!assignment.packageDefinitionVersionId) {
    caveats.push("This assignment is missing a package definition version reference.");
  }

  if (
    assignment.packageDefinitionVersionStatus &&
    assignment.packageDefinitionVersionStatus !== "published"
  ) {
    caveats.push("The referenced package definition version is not published.");
  }

  if (rows.length === 0) {
    caveats.push("No assignment audit evidence is recorded for this assignment.");
  }

  if (assignment.status === "canceled") {
    caveats.push("This assignment is canceled and shown for inspection history.");
  }

  if (assignment.status === "superseded") {
    caveats.push("This assignment is superseded and shown for inspection history.");
  }

  if (assignment.status === "archived") {
    caveats.push("This assignment is archived and shown for inspection only.");
  }

  if (assignment.billingImpactSnapshot) {
    caveats.push("Billing impact snapshot is intent-only and does not mutate provider state.");
  }

  if (assignment.entitlementModuleImpactSnapshot) {
    caveats.push("Entitlement/module impact snapshot is intent-only and does not enforce runtime access.");
  }

  if (assignment.starterPackImplicationSnapshot) {
    caveats.push("Starter-pack implication snapshot is context only and does not provision records.");
  }

  return {
    generatedAt: input.generatedAt,
    found: true,
    readOnly: true,
    mutationControlsAvailable: false,
    approvalControlsAvailable: false,
    scheduleControlsAvailable: false,
    activationControlsAvailable: false,
    cancellationControlsAvailable: false,
    assignmentActivationBehaviorAvailable: false,
    billingBehaviorAvailable: false,
    entitlementRuntimeBehaviorAvailable: false,
    contractorPermissionBehaviorAvailable: false,
    assignmentId: assignment.id,
    companyId: assignment.companyId,
    companyLabel: displayLabel(
      assignment.companyName ?? assignment.companySlug,
      "Unknown contractor"
    ),
    packageDefinitionId: assignment.packageDefinitionId,
    packageDefinitionLabel: assignment.packageDefinitionId
      ? displayLabel(
          assignment.packageDefinitionName ?? assignment.packageDefinitionKey,
          "Unknown package definition"
        )
      : "No package definition reference",
    packageDefinitionKey: displayLabel(
      assignment.packageDefinitionKey,
      "No package key recorded"
    ),
    packageDefinitionVersionId: assignment.packageDefinitionVersionId,
    packageDefinitionVersionLabel: versionLabel(assignment),
    packageDefinitionVersionStatus: displayLabel(
      assignment.packageDefinitionVersionStatus,
      "No version status recorded"
    ),
    status: assignment.status,
    lifecycleState: assignment.lifecycleState,
    effectiveAt: assignment.effectiveAt,
    scheduledFor: assignment.scheduledFor,
    activatedAt: assignment.activatedAt,
    supersededAt: assignment.supersededAt,
    canceledAt: assignment.canceledAt,
    archivedAt: assignment.archivedAt,
    supersedesAssignmentId: assignment.supersedesAssignmentId,
    supersededByAssignmentId: assignment.supersededByAssignmentId,
    cancellationReasonSummary: displayLabel(
      assignment.cancellationReason,
      "No cancellation reason recorded."
    ),
    supersessionReasonSummary: displayLabel(
      assignment.supersessionReason,
      "No supersession reason recorded."
    ),
    grandfatheredContract: assignment.grandfatheredContract,
    customContractLabel: displayLabel(
      assignment.customContractLabel,
      "No custom contract label recorded."
    ),
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    summaryCards: [
      {
        id: "assignment-status",
        label: "Assignment status",
        value: assignmentStatusLabels[assignment.status],
        tone:
          assignment.status === "active"
            ? "good"
            : assignment.status === "canceled" ||
                assignment.status === "superseded" ||
                assignment.status === "archived"
              ? "warning"
              : "neutral",
        description: "Current assignment state from the persisted assignment row."
      },
      {
        id: "audit-event-count",
        label: "Audit events",
        value: rows.length,
        tone: rows.length > 0 ? "neutral" : "warning",
        description: "Assignment audit evidence rows available for read-only inspection."
      },
      {
        id: "package-reference",
        label: "Package reference",
        value:
          assignment.packageDefinitionId && assignment.packageDefinitionVersionId
            ? "Present"
            : "Missing",
        tone:
          assignment.packageDefinitionId && assignment.packageDefinitionVersionId
            ? "good"
            : "warning",
        description: "Presence of package definition and package version references."
      }
    ],
    snapshotSections: [
      snapshotSection("Assignment snapshot", assignment.assignmentSnapshot),
      snapshotSection("Billing impact snapshot", assignment.billingImpactSnapshot),
      snapshotSection(
        "Entitlement/module impact snapshot",
        assignment.entitlementModuleImpactSnapshot
      ),
      snapshotSection(
        "Starter-pack implication snapshot",
        assignment.starterPackImplicationSnapshot
      )
    ],
    auditTimelineRows: rows,
    activationReadiness,
    caveats,
    operatorGuidance: [
      "Use this view to inspect one contractor package assignment and its assignment audit evidence only.",
      "Do not infer billing state, Stripe subscription state, entitlement access, module visibility, contractor permissions, starter-pack provisioning, or runtime behavior from this assignment detail.",
      "No assignment approval, scheduling, activation, cancellation, supersession, archive, or mutation workflow exists in this slice."
    ]
  };
}
