import type {
  ContractorGroupAuditEventType,
  PlatformStarterPackProvisioningAttemptOutcome,
  PlatformStarterPackProvisioningRunStatus
} from "@floorconnector/types";

export type PlatformOperationsSourceKey =
  | "workflow_errors"
  | "starter_pack_runs"
  | "starter_pack_attempts"
  | "contractor_group_audit_events"
  | "contractor_group_memberships"
  | "starter_pack_assignment_intents"
  | "tenant_status";

export type PlatformOperationsTone = "neutral" | "good" | "warning" | "critical";

export type PlatformOperationsSourceState = {
  key: PlatformOperationsSourceKey;
  label: string;
  available: boolean;
  count: number | null;
  latestAt: string | null;
  caveat: string | null;
};

export type PlatformOperationsWorkflowError = {
  id: string;
  organizationId: string | null;
  organizationLabel: string | null;
  workflowName: string;
  subjectType: string | null;
  safeMessage: string;
  createdAt: string;
};

export type PlatformOperationsStarterPackRun = {
  id: string;
  starterPackLabel: string | null;
  organizationLabel: string | null;
  status: PlatformStarterPackProvisioningRunStatus;
  errorMessage: string | null;
  itemCount: number;
  destinationRecordCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PlatformOperationsStarterPackAttempt = {
  id: string;
  starterPackLabel: string | null;
  organizationLabel: string | null;
  outcome: PlatformStarterPackProvisioningAttemptOutcome;
  reasonCode: string;
  safeMessage: string;
  attemptedAt: string;
};

export type PlatformOperationsContractorGroupAuditEvent = {
  id: string;
  eventType: ContractorGroupAuditEventType;
  contractorGroupLabel: string | null;
  organizationLabel: string | null;
  occurredAt: string;
};

export type PlatformOperationsTenantStatusCount = {
  status: string;
  count: number;
};

export type PlatformOperationsObservabilityInput = {
  generatedAt: string;
  counts: {
    tenantCount: number;
    contractorGroupMembershipCount: number | null;
    starterPackAssignmentIntentCount: number | null;
  };
  tenantStatusCounts: PlatformOperationsTenantStatusCount[];
  workflowErrors?: PlatformOperationsWorkflowError[] | null;
  starterPackRuns?: PlatformOperationsStarterPackRun[] | null;
  starterPackAttempts?: PlatformOperationsStarterPackAttempt[] | null;
  contractorGroupAuditEvents?: PlatformOperationsContractorGroupAuditEvent[] | null;
  unavailableSources?: Partial<Record<PlatformOperationsSourceKey, string>>;
};

export type PlatformOperationsSummaryCard = {
  id: string;
  label: string;
  value: number;
  tone: PlatformOperationsTone;
  description: string;
  sourceKey: PlatformOperationsSourceKey;
};

export type PlatformOperationsActivityRow = {
  id: string;
  sourceKey: PlatformOperationsSourceKey;
  sourceLabel: string;
  kind: string;
  label: string;
  detail: string;
  occurredAt: string;
  tone: PlatformOperationsTone;
};

export type PlatformOperationsAttentionRow = {
  id: string;
  sourceKey: PlatformOperationsSourceKey;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  occurredAt: string | null;
};

export type PlatformOperationsObservabilityModel = {
  generatedAt: string;
  readOnly: true;
  mutationControlsAvailable: false;
  summaryCards: PlatformOperationsSummaryCard[];
  recentActivity: PlatformOperationsActivityRow[];
  attentionNeeded: PlatformOperationsAttentionRow[];
  auditSources: PlatformOperationsSourceState[];
  notYetMonitored: string[];
  operatorGuidance: string[];
};

const sourceLabels: Record<PlatformOperationsSourceKey, string> = {
  workflow_errors: "Workflow errors",
  starter_pack_runs: "Starter-pack runs",
  starter_pack_attempts: "Provisioning attempts",
  contractor_group_audit_events: "Contractor group audit",
  contractor_group_memberships: "Group memberships",
  starter_pack_assignment_intents: "Starter-pack assignment intent",
  tenant_status: "Tenant status"
};

const defaultHiddenOperationalDetail =
  "Operational detail is hidden in this read-only view; review the source audit record from its dedicated admin surface.";

const unsafeOperationalDetailPatterns = [
  /service[_-]?role/i,
  /supabase_service_role/i,
  /postgres(?:ql)?:\/\//i,
  /sqlstate/i,
  /pgrst\d*/i,
  /stack trace/i,
  /\n\s*at\s+\S+/i,
  /\bat\s+\S+\s+\(/i,
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /jwt/i,
  /duplicate key value violates/i,
  /violates row-level security/i,
  /permission denied for (table|schema|function)/i,
  /relation ".+" does not exist/i
];

function latestTimestamp(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function sourceState(input: {
  key: PlatformOperationsSourceKey;
  available: boolean;
  count: number | null;
  latestAt?: string | null;
  caveat?: string | null;
}): PlatformOperationsSourceState {
  return {
    key: input.key,
    label: sourceLabels[input.key],
    available: input.available,
    count: input.available ? input.count : null,
    latestAt: input.latestAt ?? null,
    caveat: input.available
      ? safeOperationalText(input.caveat, "This source is read-only.", 220) ?? null
      : safeOperationalText(
          input.caveat,
          "This source is not available in the current read model.",
          220
        )
  };
}

function safeCount(value: number | null | undefined) {
  return typeof value === "number" ? value : 0;
}

function statusTone(status: PlatformStarterPackProvisioningRunStatus): PlatformOperationsTone {
  if (status === "failed") {
    return "critical";
  }

  if (status === "running" || status === "approved") {
    return "warning";
  }

  if (status === "completed" || status === "completed_with_warnings") {
    return "good";
  }

  return "neutral";
}

function attemptTone(
  outcome: PlatformStarterPackProvisioningAttemptOutcome
): PlatformOperationsTone {
  if (outcome === "failed_before_execution") {
    return "critical";
  }

  return outcome === "already_completed" ? "neutral" : "warning";
}

function safeOperationalText(
  value: string | null | undefined,
  fallback: string,
  maxLength = 240
) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  if (unsafeOperationalDetailPatterns.some((pattern) => pattern.test(normalized))) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function labelWithFallback(value: string | null | undefined, fallback: string) {
  return safeOperationalText(value, fallback, 120);
}

function buildRecentActivity(
  input: PlatformOperationsObservabilityInput
): PlatformOperationsActivityRow[] {
  const rows: PlatformOperationsActivityRow[] = [];

  for (const event of input.workflowErrors ?? []) {
    rows.push({
      id: `workflow-error:${event.id}`,
      sourceKey: "workflow_errors",
      sourceLabel: sourceLabels.workflow_errors,
      kind: "workflow_error",
      label: safeOperationalText(event.workflowName, "Workflow error", 120),
      detail: `${labelWithFallback(event.organizationLabel, "Unknown organization")} - ${safeOperationalText(event.safeMessage, defaultHiddenOperationalDetail)}`,
      occurredAt: event.createdAt,
      tone: "critical"
    });
  }

  for (const run of input.starterPackRuns ?? []) {
    rows.push({
      id: `starter-pack-run:${run.id}`,
      sourceKey: "starter_pack_runs",
      sourceLabel: sourceLabels.starter_pack_runs,
      kind: "starter_pack_run",
      label: `${labelWithFallback(run.starterPackLabel, "Starter pack")} ${run.status.replace(/_/g, " ")}`,
      detail: `${labelWithFallback(run.organizationLabel, "Unknown organization")} - ${run.itemCount} item rows, ${run.destinationRecordCount} destination links`,
      occurredAt: run.updatedAt || run.createdAt,
      tone: statusTone(run.status)
    });
  }

  for (const attempt of input.starterPackAttempts ?? []) {
    rows.push({
      id: `starter-pack-attempt:${attempt.id}`,
      sourceKey: "starter_pack_attempts",
      sourceLabel: sourceLabels.starter_pack_attempts,
      kind: "starter_pack_attempt",
      label: `${labelWithFallback(attempt.starterPackLabel, "Starter pack")} ${attempt.outcome.replace(/_/g, " ")}`,
      detail: `${labelWithFallback(attempt.organizationLabel, "Unknown organization")} - ${safeOperationalText(attempt.safeMessage, defaultHiddenOperationalDetail)}`,
      occurredAt: attempt.attemptedAt,
      tone: attemptTone(attempt.outcome)
    });
  }

  for (const event of input.contractorGroupAuditEvents ?? []) {
    rows.push({
      id: `contractor-group-audit:${event.id}`,
      sourceKey: "contractor_group_audit_events",
      sourceLabel: sourceLabels.contractor_group_audit_events,
      kind: "contractor_group_audit_event",
      label: event.eventType.replace(/_/g, " "),
      detail: `${labelWithFallback(event.contractorGroupLabel, "Unknown group")} - ${labelWithFallback(event.organizationLabel, "No organization context")}`,
      occurredAt: event.occurredAt,
      tone: "neutral"
    });
  }

  return rows
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
    .slice(0, 12);
}

function buildAttentionNeeded(
  input: PlatformOperationsObservabilityInput
): PlatformOperationsAttentionRow[] {
  const rows: PlatformOperationsAttentionRow[] = [];

  for (const event of (input.workflowErrors ?? []).slice(0, 5)) {
    rows.push({
      id: `workflow-error:${event.id}`,
      sourceKey: "workflow_errors",
      severity: "critical",
      title: event.workflowName,
      detail: `${labelWithFallback(event.organizationLabel, "Unknown organization")} recorded a workflow error. Review the source workflow; no remediation control is available here.`,
      occurredAt: event.createdAt
    });
  }

  for (const run of input.starterPackRuns ?? []) {
    if (run.status !== "failed" && run.status !== "running") {
      continue;
    }

    rows.push({
      id: `starter-pack-run:${run.id}`,
      sourceKey: "starter_pack_runs",
      severity: run.status === "failed" ? "critical" : "warning",
      title: `${labelWithFallback(run.starterPackLabel, "Starter pack")} ${run.status.replace(/_/g, " ")}`,
      detail: safeOperationalText(
        run.errorMessage,
        "This provisioning audit run needs operator review from the existing starter-pack audit surface."
      ),
      occurredAt: run.updatedAt || run.createdAt
    });
  }

  for (const attempt of input.starterPackAttempts ?? []) {
    if (attempt.outcome === "already_completed") {
      continue;
    }

    rows.push({
      id: `starter-pack-attempt:${attempt.id}`,
      sourceKey: "starter_pack_attempts",
      severity: attempt.outcome === "failed_before_execution" ? "critical" : "warning",
      title: attempt.reasonCode.replace(/_/g, " "),
      detail: safeOperationalText(attempt.safeMessage, defaultHiddenOperationalDetail),
      occurredAt: attempt.attemptedAt
    });
  }

  for (const event of input.contractorGroupAuditEvents ?? []) {
    if (event.contractorGroupLabel && event.organizationLabel) {
      continue;
    }

    rows.push({
      id: `contractor-group-audit:${event.id}`,
      sourceKey: "contractor_group_audit_events",
      severity: "warning",
      title: "Contractor group audit context",
      detail: "A recent contractor group audit event is missing group or organization display context.",
      occurredAt: event.occurredAt
    });
  }

  for (const [key, caveat] of Object.entries(input.unavailableSources ?? {})) {
    rows.push({
      id: `source-unavailable:${key}`,
      sourceKey: key as PlatformOperationsSourceKey,
      severity: "info",
      title: `${sourceLabels[key as PlatformOperationsSourceKey]} unavailable`,
      detail: safeOperationalText(
        caveat,
        "This source is not available in the current read model."
      ),
      occurredAt: null
    });
  }

  return rows
    .sort((left, right) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const severityDifference =
        severityOrder[left.severity] - severityOrder[right.severity];

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return Date.parse(right.occurredAt ?? "") - Date.parse(left.occurredAt ?? "");
    })
    .slice(0, 12);
}

export function buildPlatformOperationsObservability(
  input: PlatformOperationsObservabilityInput
): PlatformOperationsObservabilityModel {
  const workflowErrors = input.workflowErrors ?? [];
  const starterPackRuns = input.starterPackRuns ?? [];
  const starterPackAttempts = input.starterPackAttempts ?? [];
  const contractorGroupAuditEvents = input.contractorGroupAuditEvents ?? [];
  const attentionNeeded = buildAttentionNeeded(input);
  const recentActivity = buildRecentActivity(input);

  const auditSources: PlatformOperationsSourceState[] = [
    sourceState({
      key: "tenant_status",
      available: true,
      count: input.counts.tenantCount,
      caveat: "Tenant lifecycle counts are read-only and do not change activation state here."
    }),
    sourceState({
      key: "workflow_errors",
      available: !input.unavailableSources?.workflow_errors,
      count: workflowErrors.length,
      latestAt: latestTimestamp(workflowErrors.map((event) => event.createdAt)),
      caveat: input.unavailableSources?.workflow_errors ?? null
    }),
    sourceState({
      key: "starter_pack_runs",
      available: !input.unavailableSources?.starter_pack_runs,
      count: starterPackRuns.length,
      latestAt: latestTimestamp(starterPackRuns.map((run) => run.updatedAt || run.createdAt)),
      caveat: input.unavailableSources?.starter_pack_runs ?? null
    }),
    sourceState({
      key: "starter_pack_attempts",
      available: !input.unavailableSources?.starter_pack_attempts,
      count: starterPackAttempts.length,
      latestAt: latestTimestamp(starterPackAttempts.map((attempt) => attempt.attemptedAt)),
      caveat: input.unavailableSources?.starter_pack_attempts ?? null
    }),
    sourceState({
      key: "contractor_group_audit_events",
      available: !input.unavailableSources?.contractor_group_audit_events,
      count: contractorGroupAuditEvents.length,
      latestAt: latestTimestamp(contractorGroupAuditEvents.map((event) => event.occurredAt)),
      caveat: input.unavailableSources?.contractor_group_audit_events ?? null
    }),
    sourceState({
      key: "contractor_group_memberships",
      available: input.counts.contractorGroupMembershipCount !== null,
      count: input.counts.contractorGroupMembershipCount,
      caveat:
        input.unavailableSources?.contractor_group_memberships ??
        "Membership totals are read-only segmentation counts, not contractor permissions."
    }),
    sourceState({
      key: "starter_pack_assignment_intents",
      available: input.counts.starterPackAssignmentIntentCount !== null,
      count: input.counts.starterPackAssignmentIntentCount,
      caveat:
        input.unavailableSources?.starter_pack_assignment_intents ??
        "Assignment intent is planning metadata only and does not provision records."
    })
  ];

  return {
    generatedAt: input.generatedAt,
    readOnly: true,
    mutationControlsAvailable: false,
    summaryCards: [
      {
        id: "tenants",
        label: "Tenant organizations",
        value: input.counts.tenantCount,
        tone: "neutral",
        description: `${input.tenantStatusCounts.length} tenant status bucket${input.tenantStatusCounts.length === 1 ? "" : "s"} loaded.`,
        sourceKey: "tenant_status"
      },
      {
        id: "attention-needed",
        label: "Attention signals",
        value: attentionNeeded.length,
        tone: attentionNeeded.some((item) => item.severity === "critical")
          ? "critical"
          : attentionNeeded.length > 0
            ? "warning"
            : "good",
        description: "Read-only review cues from existing audit/error records.",
        sourceKey: "workflow_errors"
      },
      {
        id: "workflow-errors",
        label: "Recent workflow errors",
        value: workflowErrors.length,
        tone: workflowErrors.length > 0 ? "critical" : "good",
        description: "Tenant workflow failures already captured by workflow_error_events.",
        sourceKey: "workflow_errors"
      },
      {
        id: "provisioning-attempts",
        label: "Provisioning attempts",
        value: starterPackAttempts.length,
        tone: starterPackAttempts.some((attempt) => attempt.outcome !== "already_completed")
          ? "warning"
          : "neutral",
        description: "Rejected, blocked, failed-before-execution, and no-op audit attempts.",
        sourceKey: "starter_pack_attempts"
      },
      {
        id: "group-audit-events",
        label: "Group audit events",
        value: contractorGroupAuditEvents.length,
        tone: "neutral",
        description: "Recent contractor group governance audit rows.",
        sourceKey: "contractor_group_audit_events"
      },
      {
        id: "group-memberships",
        label: "Group memberships",
        value: safeCount(input.counts.contractorGroupMembershipCount),
        tone: "neutral",
        description: "Current segmentation memberships only; no permission effect.",
        sourceKey: "contractor_group_memberships"
      },
      {
        id: "starter-pack-runs",
        label: "Provisioning runs",
        value: starterPackRuns.length,
        tone: starterPackRuns.some((run) => run.status === "failed") ? "critical" : "neutral",
        description: "Recent starter-pack audit runs from existing run records.",
        sourceKey: "starter_pack_runs"
      },
      {
        id: "assignment-intents",
        label: "Assignment intents",
        value: safeCount(input.counts.starterPackAssignmentIntentCount),
        tone: "neutral",
        description: "Planning-only starter-pack targeting intent count.",
        sourceKey: "starter_pack_assignment_intents"
      }
    ],
    recentActivity,
    attentionNeeded,
    auditSources,
    notYetMonitored: [
      "Notification delivery health is not yet surfaced in this super-admin operations page.",
      "Provider-specific delivery logs, escalation queues, alerting, retention policy, and remediation workflows remain future operations work.",
      "Starter-pack void, rollback, archive/delete, assignment auto-provisioning, entitlement enforcement, pricing/package behavior, and runtime controls are not present here."
    ],
    operatorGuidance: [
      "This page is read-only and uses existing audit/error tables only.",
      "No retry, remediation, archive, delete, assign, provision, entitlement, pricing, or runtime controls are available.",
      "Use the existing dedicated super-admin pages for reviewed operator workflows; this surface only centralizes support readiness signals."
    ]
  };
}
