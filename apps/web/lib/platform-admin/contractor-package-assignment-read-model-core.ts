import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent,
  ContractorPackageAssignmentAuditEventType,
  ContractorPackageAssignmentStatus
} from "@floorconnector/types";

export type ContractorPackageAssignmentReadModelTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type ContractorPackageAssignmentReadModelBucket = {
  key: ContractorPackageAssignmentStatus | ContractorPackageAssignmentAuditEventType;
  label: string;
  count: number;
  description: string;
};

export type ContractorPackageAssignmentReadModelSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: ContractorPackageAssignmentReadModelTone;
  description: string;
};

export type ContractorPackageAssignmentReadModelRow = {
  id: string;
  companyLabel: string;
  packageLabel: string;
  versionLabel: string;
  status: ContractorPackageAssignmentStatus;
  lifecycleState: ContractorPackageAssignmentStatus;
  effectiveAt: string | null;
  scheduledFor: string | null;
  activatedAt: string | null;
  assignmentSnapshotSummary: string;
  billingImpactSummary: string;
  entitlementModuleImpactSummary: string;
  starterPackImplicationSummary: string;
  caveats: string[];
};

export type ContractorPackageAssignmentAuditTimelineRow = {
  id: string;
  contractorPackageAssignmentId: string;
  companyId: string;
  eventType: ContractorPackageAssignmentAuditEventType;
  eventLabel: string;
  reasonSummary: string;
  confirmationSummary: string;
  beforeSnapshotSummary: string;
  afterSnapshotSummary: string;
  metadataSummary: string;
  occurredAt: string;
  caveats: string[];
};

export type ContractorPackageAssignmentReadModelInput = {
  generatedAt: string;
  assignments: ContractorPackageAssignment[];
  auditEvents: ContractorPackageAssignmentAuditEvent[];
  unavailableSources?: {
    assignments?: string;
    auditEvents?: string;
  };
};

export type ContractorPackageAssignmentReadModel = {
  generatedAt: string;
  readOnly: true;
  mutationControlsAvailable: false;
  approvalControlsAvailable: false;
  activationControlsAvailable: false;
  assignmentActivationBehaviorAvailable: false;
  billingBehaviorAvailable: false;
  entitlementRuntimeBehaviorAvailable: false;
  contractorPermissionBehaviorAvailable: false;
  summaryCards: ContractorPackageAssignmentReadModelSummaryCard[];
  assignmentStatusBuckets: ContractorPackageAssignmentReadModelBucket[];
  auditEventTypeBuckets: ContractorPackageAssignmentReadModelBucket[];
  assignmentRows: ContractorPackageAssignmentReadModelRow[];
  auditTimelineRows: ContractorPackageAssignmentAuditTimelineRow[];
  assignmentReadiness: string[];
  caveats: string[];
  operatorGuidance: string[];
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

  return normalized.length > 140 ? `${normalized.slice(0, 137).trimEnd()}...` : normalized;
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

function countByStatus(
  assignments: ContractorPackageAssignment[]
): ContractorPackageAssignmentReadModelBucket[] {
  const counts = assignments.reduce((map, assignment) => {
    map.set(assignment.status, (map.get(assignment.status) ?? 0) + 1);
    return map;
  }, new Map<ContractorPackageAssignmentStatus, number>());

  return (Object.keys(assignmentStatusLabels) as ContractorPackageAssignmentStatus[])
    .map((status) => ({
      key: status,
      label: assignmentStatusLabels[status],
      count: counts.get(status) ?? 0,
      description:
        counts.get(status) && counts.get(status)! > 0
          ? `${counts.get(status)} contractor package assignment row${
              counts.get(status) === 1 ? "" : "s"
            } in ${assignmentStatusLabels[status].toLowerCase()} state.`
          : "No contractor package assignments are recorded for this state."
    }))
    .filter((bucket) => bucket.count > 0 || assignments.length === 0);
}

function countByAuditEventType(
  events: ContractorPackageAssignmentAuditEvent[]
): ContractorPackageAssignmentReadModelBucket[] {
  const counts = events.reduce((map, event) => {
    map.set(event.eventType, (map.get(event.eventType) ?? 0) + 1);
    return map;
  }, new Map<ContractorPackageAssignmentAuditEventType, number>());

  return (Object.keys(auditEventLabels) as ContractorPackageAssignmentAuditEventType[])
    .map((eventType) => ({
      key: eventType,
      label: auditEventLabels[eventType],
      count: counts.get(eventType) ?? 0,
      description:
        counts.get(eventType) && counts.get(eventType)! > 0
          ? `${counts.get(eventType)} ${auditEventLabels[eventType].toLowerCase()} event${
              counts.get(eventType) === 1 ? "" : "s"
            } recorded.`
          : "No assignment audit evidence is recorded for this event type."
    }))
    .filter((bucket) => bucket.count > 0 || events.length === 0);
}

function packageLabel(assignment: ContractorPackageAssignment) {
  if (!assignment.packageDefinitionId) {
    return "No package definition reference";
  }

  return displayLabel(
    assignment.packageDefinitionName ?? assignment.packageDefinitionKey,
    "Unknown package definition"
  );
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

function buildAssignmentRows(
  assignments: ContractorPackageAssignment[],
  auditEvents: ContractorPackageAssignmentAuditEvent[]
): ContractorPackageAssignmentReadModelRow[] {
  const auditCounts = auditEvents.reduce((map, event) => {
    map.set(
      event.contractorPackageAssignmentId,
      (map.get(event.contractorPackageAssignmentId) ?? 0) + 1
    );
    return map;
  }, new Map<string, number>());

  return assignments
    .slice()
    .sort((left, right) => {
      const stateCompare = left.status.localeCompare(right.status);
      const dateCompare =
        Date.parse(right.effectiveAt ?? right.createdAt) -
        Date.parse(left.effectiveAt ?? left.createdAt);

      return stateCompare || dateCompare || left.id.localeCompare(right.id);
    })
    .map((assignment) => {
      const caveats: string[] = [];

      if (!assignment.packageDefinitionId) {
        caveats.push("Missing package definition reference.");
      }

      if (!assignment.packageDefinitionVersionId) {
        caveats.push("Missing package definition version reference.");
      }

      if (
        assignment.packageDefinitionVersionStatus &&
        assignment.packageDefinitionVersionStatus !== "published"
      ) {
        caveats.push("Referenced package version is not published.");
      }

      if (assignment.status === "active" && !assignment.activatedAt) {
        caveats.push("Active assignment has no activation timestamp.");
      }

      if (assignment.status === "scheduled" && !assignment.scheduledFor) {
        caveats.push("Scheduled assignment has no scheduled timestamp.");
      }

      if ((auditCounts.get(assignment.id) ?? 0) === 0) {
        caveats.push("No assignment audit evidence is recorded.");
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
        id: assignment.id,
        companyLabel: displayLabel(
          assignment.companyName ?? assignment.companySlug,
          "Unknown contractor"
        ),
        packageLabel: packageLabel(assignment),
        versionLabel: versionLabel(assignment),
        status: assignment.status,
        lifecycleState: assignment.lifecycleState,
        effectiveAt: assignment.effectiveAt,
        scheduledFor: assignment.scheduledFor,
        activatedAt: assignment.activatedAt,
        assignmentSnapshotSummary: summarizeJsonObject(
          "Assignment snapshot",
          assignment.assignmentSnapshot
        ),
        billingImpactSummary: summarizeJsonObject(
          "Billing impact snapshot",
          assignment.billingImpactSnapshot
        ),
        entitlementModuleImpactSummary: summarizeJsonObject(
          "Entitlement/module impact snapshot",
          assignment.entitlementModuleImpactSnapshot
        ),
        starterPackImplicationSummary: summarizeJsonObject(
          "Starter-pack implication snapshot",
          assignment.starterPackImplicationSnapshot
        ),
        caveats
      };
    });
}

function buildAuditTimelineRows(
  events: ContractorPackageAssignmentAuditEvent[]
): ContractorPackageAssignmentAuditTimelineRow[] {
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
        contractorPackageAssignmentId: event.contractorPackageAssignmentId,
        companyId: event.companyId,
        eventType: event.eventType,
        eventLabel: auditEventLabels[event.eventType],
        reasonSummary: displayLabel(event.reason, "No reason recorded."),
        confirmationSummary: displayLabel(
          event.confirmationText,
          "No confirmation text recorded."
        ),
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

export function buildContractorPackageAssignmentReadModel(
  input: ContractorPackageAssignmentReadModelInput
): ContractorPackageAssignmentReadModel {
  const assignments = input.assignments;
  const auditEvents = input.auditEvents;
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "active"
  );
  const scheduledAssignments = assignments.filter(
    (assignment) => assignment.status === "scheduled"
  );
  const assignmentsMissingPackage = assignments.filter(
    (assignment) =>
      !assignment.packageDefinitionId || !assignment.packageDefinitionVersionId
  );
  const assignmentRows = buildAssignmentRows(assignments, auditEvents);
  const auditTimelineRows = buildAuditTimelineRows(auditEvents);
  const activeAssignmentsByCompany = activeAssignments.reduce((map, assignment) => {
    map.set(assignment.companyId, (map.get(assignment.companyId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const companiesWithMultipleActiveAssignments = [...activeAssignmentsByCompany.values()].filter(
    (count) => count > 1
  ).length;
  const caveats = [
    "Contractor package assignments are read-only inspection records in this slice.",
    "No assignment create, approve, schedule, activate, cancel, supersede, archive, or mutation controls are available.",
    "Assignment rows do not call Stripe, create subscriptions, collect payments, enforce entitlements, gate modules, change contractor permissions, provision starter packs, or alter runtime behavior.",
    "Billing, entitlement/module, and starter-pack snapshots are safe operator summaries only; they are not provider payloads, runtime resolvers, entitlement truth, or provisioning instructions."
  ];

  if (input.unavailableSources?.assignments) {
    caveats.push(input.unavailableSources.assignments);
  }

  if (input.unavailableSources?.auditEvents) {
    caveats.push(input.unavailableSources.auditEvents);
  }

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    mutationControlsAvailable: false,
    approvalControlsAvailable: false,
    activationControlsAvailable: false,
    assignmentActivationBehaviorAvailable: false,
    billingBehaviorAvailable: false,
    entitlementRuntimeBehaviorAvailable: false,
    contractorPermissionBehaviorAvailable: false,
    summaryCards: [
      {
        id: "assignment-count",
        label: "Assignments",
        value: assignments.length,
        tone: assignments.length > 0 ? "neutral" : "warning",
        description: "Contractor package assignment rows available for read-only review."
      },
      {
        id: "active-assignment-count",
        label: "Active assignments",
        value: activeAssignments.length,
        tone: activeAssignments.length > 0 ? "good" : "neutral",
        description: "Rows marked active for future package assignment inspection."
      },
      {
        id: "scheduled-assignment-count",
        label: "Scheduled assignments",
        value: scheduledAssignments.length,
        tone: "neutral",
        description: "Rows marked scheduled; no activation behavior is wired here."
      },
      {
        id: "missing-package-reference-count",
        label: "Missing package refs",
        value: assignmentsMissingPackage.length,
        tone: assignmentsMissingPackage.length > 0 ? "warning" : "good",
        description: "Assignments missing package definition or version references."
      }
    ],
    assignmentStatusBuckets: countByStatus(assignments),
    auditEventTypeBuckets: countByAuditEventType(auditEvents),
    assignmentRows,
    auditTimelineRows,
    assignmentReadiness: [
      assignments.length === 0
        ? "No contractor package assignments are recorded yet; the read-only empty state should render safely."
        : `${assignments.length} contractor package assignment row${assignments.length === 1 ? "" : "s"} loaded for read-only inspection.`,
      activeAssignments.length === 0
        ? "No active contractor package assignments are recorded."
        : `${activeAssignments.length} active assignment row${activeAssignments.length === 1 ? "" : "s"} are visible for inspection only.`,
      companiesWithMultipleActiveAssignments > 0
        ? `${companiesWithMultipleActiveAssignments} compan${
            companiesWithMultipleActiveAssignments === 1 ? "y has" : "ies have"
          } multiple active assignment rows and needs operator review.`
        : "No company has multiple active assignment rows in the loaded read model.",
      assignmentsMissingPackage.length > 0
        ? `${assignmentsMissingPackage.length} assignment row${
            assignmentsMissingPackage.length === 1 ? "" : "s"
          } are missing package definition or version references.`
        : "Every loaded assignment has package definition and version references."
    ],
    caveats,
    operatorGuidance: [
      "Use this section to inspect package assignment records and assignment audit evidence only.",
      "Do not infer billing state, Stripe subscription state, entitlement access, module visibility, contractor permissions, starter-pack provisioning, or runtime behavior from assignment rows.",
      "No package assignment approval, scheduling, activation, cancellation, supersession, archive, or mutation workflow exists in this slice."
    ]
  };
}
