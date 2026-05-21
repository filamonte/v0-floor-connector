import type {
  ContractorPackageAssignment,
  ContractorPackageAssignmentAuditEvent
} from "@floorconnector/types";

export type ContractorPackageAssignmentActivationReadinessStatus =
  | "eligible"
  | "blocked"
  | "unavailable"
  | "already_in_state"
  | "advisory";

export type ContractorPackageAssignmentActivationReadinessTone =
  | "neutral"
  | "good"
  | "warning"
  | "critical";

export type ContractorPackageAssignmentActivationReadinessTransition = {
  id: string;
  label: string;
  assignmentId: string | null;
  fromState: string;
  toState: string;
  status: ContractorPackageAssignmentActivationReadinessStatus;
  reasons: string[];
  advisoryReasons: string[];
  actionAvailable: false;
  mutationAvailable: false;
  runtimeEffect: false;
  billingEffect: false;
  entitlementEffect: false;
  contractorPermissionEffect: false;
  packageAssignmentWriteAvailable: false;
};

export type ContractorPackageAssignmentActivationReadinessSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: ContractorPackageAssignmentActivationReadinessTone;
  description: string;
};

export type ContractorPackageAssignmentActivationReadinessModel = {
  generatedAt: string;
  readOnly: true;
  assignmentId: string;
  actionAvailable: false;
  mutationAvailable: false;
  runtimeEffect: false;
  billingEffect: false;
  entitlementEffect: false;
  contractorPermissionEffect: false;
  packageAssignmentWriteAvailable: false;
  summaryCards: ContractorPackageAssignmentActivationReadinessSummaryCard[];
  transitions: ContractorPackageAssignmentActivationReadinessTransition[];
  caveats: string[];
  operatorGuidance: string[];
};

export type ContractorPackageAssignmentActivationReadinessInput = {
  generatedAt: string;
  assignmentId: string;
  assignment: ContractorPackageAssignment | null;
  auditEvents?: ContractorPackageAssignmentAuditEvent[];
  relatedAssignments?: ContractorPackageAssignment[];
  unavailableReason?: string;
};

const noBehaviorFlags = {
  actionAvailable: false,
  mutationAvailable: false,
  runtimeEffect: false,
  billingEffect: false,
  entitlementEffect: false,
  contractorPermissionEffect: false,
  packageAssignmentWriteAvailable: false
} as const;

const transitionDefinitions = [
  ["draft-to-pending-review", "Draft to pending review", "draft", "pending_review"],
  ["pending-review-to-draft", "Pending review to draft", "pending_review", "draft"],
  ["pending-review-to-approved", "Pending review to approved", "pending_review", "approved"],
  ["approved-to-scheduled", "Approved to scheduled", "approved", "scheduled"],
  ["approved-to-active", "Approved to active", "approved", "active"],
  ["scheduled-to-active", "Scheduled to active", "scheduled", "active"],
  ["active-to-superseded", "Active to superseded", "active", "superseded"],
  ["active-to-canceled", "Active to canceled", "active", "canceled"],
  ["canceled-to-archived", "Canceled to archived", "canceled", "archived"],
  ["superseded-to-archived", "Superseded to archived", "superseded", "archived"]
] as const;

function transition(input: {
  id: string;
  label: string;
  assignmentId: string | null;
  fromState: string;
  toState: string;
  status: ContractorPackageAssignmentActivationReadinessStatus;
  reasons?: string[];
  advisoryReasons?: string[];
}): ContractorPackageAssignmentActivationReadinessTransition {
  return {
    id: input.id,
    label: input.label,
    assignmentId: input.assignmentId,
    fromState: input.fromState,
    toState: input.toState,
    status: input.status,
    reasons: input.reasons ?? [],
    advisoryReasons: input.advisoryReasons ?? [],
    ...noBehaviorFlags
  };
}

function hasPublishedPackageVersion(assignment: ContractorPackageAssignment) {
  return assignment.packageDefinitionVersionStatus === "published";
}

function hasAuditEvidence(
  assignment: ContractorPackageAssignment,
  events: ContractorPackageAssignmentAuditEvent[]
) {
  return events.some(
    (event) => event.contractorPackageAssignmentId === assignment.id
  );
}

function activeConflictReasons(
  assignment: ContractorPackageAssignment,
  relatedAssignments: ContractorPackageAssignment[]
) {
  const conflicts = relatedAssignments.filter(
    (candidate) =>
      candidate.id !== assignment.id &&
      candidate.companyId === assignment.companyId &&
      candidate.status === "active" &&
      !candidate.archivedAt
  );

  return conflicts.length > 0
    ? [
        `Existing active assignment conflict: ${conflicts.length} other active assignment${
          conflicts.length === 1 ? "" : "s"
        } for this company.`
      ]
    : [];
}

function coreReferenceReasons(assignment: ContractorPackageAssignment) {
  const reasons: string[] = [];

  if (!assignment.companyId) {
    reasons.push("Missing company.");
  }

  if (!assignment.packageDefinitionId) {
    reasons.push("Missing package definition.");
  }

  if (!assignment.packageDefinitionVersionId) {
    reasons.push("Missing package version.");
  }

  if (
    assignment.packageDefinitionVersionId &&
    !hasPublishedPackageVersion(assignment)
  ) {
    reasons.push(
      "Selected package version is not active/published enough for future activation."
    );
  }

  return reasons;
}

function effectiveDateReasons(assignment: ContractorPackageAssignment) {
  return assignment.effectiveAt ? [] : ["Effective date missing."];
}

function scheduledDateReasons(assignment: ContractorPackageAssignment) {
  return assignment.scheduledFor ? [] : ["Scheduled date missing."];
}

function auditEvidenceReasons(
  assignment: ContractorPackageAssignment,
  events: ContractorPackageAssignmentAuditEvent[]
) {
  return hasAuditEvidence(assignment, events)
    ? []
    : ["No audit evidence available."];
}

function terminalStateReasons(assignment: ContractorPackageAssignment) {
  if (assignment.status === "canceled") {
    return ["Canceled assignments cannot become active."];
  }

  if (assignment.status === "archived") {
    return ["Archived assignments cannot become active."];
  }

  return [];
}

function transitionReasons(input: {
  assignment: ContractorPackageAssignment;
  fromState: string;
  toState: string;
  auditEvents: ContractorPackageAssignmentAuditEvent[];
  relatedAssignments: ContractorPackageAssignment[];
}) {
  const { assignment, toState, auditEvents, relatedAssignments } = input;
  const reasons: string[] = [];

  if (toState === "pending_review" || toState === "approved") {
    reasons.push(...coreReferenceReasons(assignment));
  }

  if (toState === "approved") {
    reasons.push(...auditEvidenceReasons(assignment, auditEvents));
  }

  if (toState === "scheduled") {
    reasons.push(
      ...coreReferenceReasons(assignment),
      ...effectiveDateReasons(assignment),
      ...scheduledDateReasons(assignment),
      ...auditEvidenceReasons(assignment, auditEvents)
    );
  }

  if (toState === "active") {
    reasons.push(
      ...coreReferenceReasons(assignment),
      ...effectiveDateReasons(assignment),
      ...auditEvidenceReasons(assignment, auditEvents),
      ...activeConflictReasons(assignment, relatedAssignments),
      ...terminalStateReasons(assignment)
    );
  }

  if (toState === "superseded") {
    if (!assignment.supersededByAssignmentId) {
      reasons.push("Superseding assignment reference is not recorded.");
    }

    if (!assignment.supersessionReason) {
      reasons.push("Supersession reason is not recorded.");
    }
  }

  if (toState === "canceled" && !assignment.cancellationReason) {
    reasons.push("Cancellation reason is not recorded.");
  }

  if (toState === "archived" && !assignment.archivedAt) {
    reasons.push("Archive timestamp is not recorded.");
  }

  return [...new Set(reasons)];
}

function advisoryReasons(assignment: ContractorPackageAssignment) {
  const reasons = [
    "Billing/provider mapping is not implemented.",
    "Entitlement/module mapping is not implemented.",
    "Runtime enforcement is not implemented.",
    "Assignment activation does not mutate billing, entitlements, modules, permissions, or runtime."
  ];

  if (assignment.billingImpactSnapshot) {
    reasons.push("Billing impact snapshot is intent-only.");
  }

  if (assignment.entitlementModuleImpactSnapshot) {
    reasons.push("Entitlement/module impact snapshot is intent-only.");
  }

  if (assignment.starterPackImplicationSnapshot) {
    reasons.push("Starter-pack implication snapshot is context only.");
  }

  return reasons;
}

function unavailableModel(
  input: ContractorPackageAssignmentActivationReadinessInput,
  reason: string
): ContractorPackageAssignmentActivationReadinessModel {
  const transitions = transitionDefinitions.map(([id, label, fromState, toState]) =>
    transition({
      id,
      label,
      assignmentId: null,
      fromState,
      toState,
      status: "unavailable",
      reasons: [reason],
      advisoryReasons: [
        "Assignment activation does not mutate billing, entitlements, modules, permissions, or runtime."
      ]
    })
  );

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    assignmentId: input.assignmentId,
    ...noBehaviorFlags,
    summaryCards: [
      {
        id: "eligible-count",
        label: "Eligible transitions",
        value: 0,
        tone: "warning",
        description: "No transition can be inspected without an assignment."
      },
      {
        id: "blocked-count",
        label: "Blocked transitions",
        value: 0,
        tone: "neutral",
        description: "The assignment is unavailable."
      },
      {
        id: "unavailable-count",
        label: "Unavailable transitions",
        value: transitions.length,
        tone: "warning",
        description: "Future assignment checks cannot resolve against this id."
      }
    ],
    transitions,
    caveats: [
      "Assignment activation readiness is read-only inspection for future controls only.",
      reason,
      "Assignment activation does not mutate billing, entitlements, modules, permissions, or runtime."
    ],
    operatorGuidance: [
      "Return to the package assignment catalog and inspect a known assignment.",
      "Do not create seed data from the browser to satisfy this state."
    ]
  };
}

export function buildContractorPackageAssignmentActivationReadiness(
  input: ContractorPackageAssignmentActivationReadinessInput
): ContractorPackageAssignmentActivationReadinessModel {
  const assignment = input.assignment;

  if (!assignment) {
    return unavailableModel(
      input,
      input.unavailableReason ?? "Missing assignment."
    );
  }

  const auditEvents = input.auditEvents ?? [];
  const relatedAssignments = input.relatedAssignments ?? [];
  const caveats = [
    "Assignment activation readiness is read-only inspection for future controls only.",
    "No assignment create, approve, schedule, activate, cancel, supersede, archive, or mutation controls are available.",
    "Billing/provider mapping is not implemented.",
    "Entitlement/module mapping is not implemented.",
    "Runtime enforcement is not implemented.",
    "Assignment activation does not mutate billing, entitlements, modules, permissions, or runtime."
  ];

  const referenceReasons = coreReferenceReasons(assignment);
  const conflictReasons = activeConflictReasons(assignment, relatedAssignments);

  if (referenceReasons.some((reason) => reason.includes("company"))) {
    caveats.push("Missing company.");
  }

  if (referenceReasons.some((reason) => reason.includes("package definition"))) {
    caveats.push("Missing package definition.");
  }

  if (referenceReasons.some((reason) => reason.includes("package version"))) {
    caveats.push("Missing package version.");
  }

  if (!hasAuditEvidence(assignment, auditEvents)) {
    caveats.push("No audit evidence available.");
  }

  if (!assignment.effectiveAt) {
    caveats.push("Effective date missing.");
  }

  if (assignment.status === "scheduled" && !assignment.scheduledFor) {
    caveats.push("Scheduled date missing.");
  }

  if (conflictReasons.length > 0) {
    caveats.push(...conflictReasons);
  }

  if (assignment.status === "canceled") {
    caveats.push("Canceled assignments cannot become active.");
  }

  if (assignment.status === "archived") {
    caveats.push("Archived assignments cannot become active.");
  }

  const rows = transitionDefinitions.map(([id, label, fromState, toState]) => {
    const currentState = assignment.status;
    const reasons = transitionReasons({
      assignment,
      fromState,
      toState,
      auditEvents,
      relatedAssignments
    });

    if (currentState === toState) {
      return transition({
        id,
        label,
        assignmentId: assignment.id,
        fromState,
        toState,
        status: "already_in_state",
        reasons: [`Assignment is already in ${toState} state.`],
        advisoryReasons: advisoryReasons(assignment)
      });
    }

    if (currentState !== fromState) {
      return transition({
        id,
        label,
        assignmentId: assignment.id,
        fromState,
        toState,
        status:
          currentState === "canceled" || currentState === "archived"
            ? "blocked"
            : "unavailable",
        reasons: [
          `Current assignment state is ${currentState}.`,
          ...terminalStateReasons(assignment)
        ],
        advisoryReasons: advisoryReasons(assignment)
      });
    }

    return transition({
      id,
      label,
      assignmentId: assignment.id,
      fromState,
      toState,
      status: reasons.length > 0 ? "blocked" : "eligible",
      reasons,
      advisoryReasons: advisoryReasons(assignment)
    });
  });

  rows.push(
    transition({
      id: "assignment-impact-advisory",
      label: "Assignment impact advisory",
      assignmentId: assignment.id,
      fromState: assignment.status,
      toState: assignment.status,
      status: "advisory",
      reasons: [],
      advisoryReasons: advisoryReasons(assignment)
    })
  );

  const eligibleCount = rows.filter((row) => row.status === "eligible").length;
  const blockedCount = rows.filter((row) => row.status === "blocked").length;
  const unavailableCount = rows.filter(
    (row) => row.status === "unavailable"
  ).length;

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    assignmentId: assignment.id,
    ...noBehaviorFlags,
    summaryCards: [
      {
        id: "eligible-count",
        label: "Eligible transitions",
        value: eligibleCount,
        tone: eligibleCount > 0 ? "good" : "neutral",
        description: "Future assignment transitions that appear eligible for inspection only."
      },
      {
        id: "blocked-count",
        label: "Blocked transitions",
        value: blockedCount,
        tone: blockedCount > 0 ? "warning" : "good",
        description: "Future assignment transitions with readiness blockers."
      },
      {
        id: "unavailable-count",
        label: "Unavailable transitions",
        value: unavailableCount,
        tone: unavailableCount > 0 ? "neutral" : "good",
        description: "Future transitions that do not apply to the current assignment state."
      }
    ],
    transitions: rows,
    caveats: [...new Set(caveats)],
    operatorGuidance: [
      "Use this panel to inspect future assignment transition readiness only.",
      "Do not infer billing state, Stripe subscription state, entitlement access, module visibility, contractor permissions, starter-pack provisioning, or runtime behavior from readiness rows.",
      "No assignment approval, scheduling, activation, cancellation, supersession, archive, or mutation workflow exists in this slice."
    ]
  };
}
