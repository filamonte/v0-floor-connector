import type {
  OperationalCueKey,
  OperationalCueOwnerStrategy,
  OperationalCueSubjectType,
  OperationalCueUrgency
} from "@floorconnector/types";

export const operationalCueUrgencies = ["normal", "high", "critical"] as const;
export const operationalCueThresholdDayMaximum = 30;

export type OperationalCueRuleDefinition = {
  cueKey: OperationalCueKey;
  label: string;
  description: string;
  triggerSummary: string;
  whyItMatters: string;
  appearsIn: string;
  safeAction: string;
  visibilityNote: string;
  subjectType: OperationalCueSubjectType;
  ownerStrategy: OperationalCueOwnerStrategy;
};

export const operationalCueRuleDefinitions: OperationalCueRuleDefinition[] = [
  {
    cueKey: "estimate_sent_followup",
    label: "Estimate follow-up",
    description:
      "Shows a cue when a sent estimate has not received a customer decision after the configured number of days.",
    triggerSummary:
      "A customer-facing estimate is still sent, with no approved, rejected, or expired decision after the threshold.",
    whyItMatters:
      "Stale estimates are often the first place revenue leaks out of the workflow.",
    appearsIn:
      "Dashboard My Work, the Estimate Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the estimate, review the customer context, or create a user-confirmed internal work item.",
    visibilityNote:
      "Dismiss and snooze are user-scoped when this cue appears in a supported workspace.",
    subjectType: "estimate",
    ownerStrategy: "estimator"
  },
  {
    cueKey: "contract_sent_unsigned",
    label: "Contract sent but unsigned",
    description:
      "Shows a cue when a sent contract is still waiting for signature after the configured number of days.",
    triggerSummary:
      "A contract has been sent and remains unsigned after the threshold.",
    whyItMatters:
      "Unsigned contracts block the commercial handoff into deposit, scheduling, and field work.",
    appearsIn:
      "Dashboard My Work, the Contract Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the contract and use the existing signature workflow or human follow-up path.",
    visibilityNote:
      "Snooze is user-scoped for supported workspace contexts; dismiss may be unavailable for blocker-style cues.",
    subjectType: "contract",
    ownerStrategy: "project_manager"
  },
  {
    cueKey: "contract_viewed_unsigned",
    label: "Contract viewed but unsigned",
    description:
      "Shows a higher-intent cue when customer view activity exists but the contract is still unsigned.",
    triggerSummary:
      "A customer has viewed the contract, but the contract is still unsigned after the threshold.",
    whyItMatters:
      "Viewed-but-unsigned work is high-intent follow-up and may need a quick human nudge.",
    appearsIn:
      "Dashboard My Work, the Contract Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the contract, review signer state, and follow the existing signature workflow.",
    visibilityNote:
      "Snooze is user-scoped for supported workspace contexts; broad company resolve is not exposed.",
    subjectType: "contract",
    ownerStrategy: "project_manager"
  },
  {
    cueKey: "invoice_overdue",
    label: "Invoice overdue",
    description:
      "Shows a cue when an invoice has an open balance after its due date plus the configured threshold.",
    triggerSummary:
      "An invoice has an open balance and is past its due date plus the threshold.",
    whyItMatters:
      "Past-due invoices affect cash flow and should stay visible without changing payment records.",
    appearsIn:
      "Dashboard My Work, the Invoice Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the invoice, review balance and customer context, or create a user-confirmed internal work item.",
    visibilityNote:
      "This cue can be snoozed by the current user in supported workspaces, but it is not dismissible in V1.",
    subjectType: "invoice",
    ownerStrategy: "billing_owner"
  },
  {
    cueKey: "deposit_invoice_unpaid",
    label: "Deposit invoice unpaid",
    description:
      "Shows a cue when a deposit invoice still has an open balance after the configured number of days.",
    triggerSummary:
      "A deposit invoice remains unpaid after the threshold.",
    whyItMatters:
      "Unpaid deposits can block scheduling readiness and should be reviewed before work proceeds.",
    appearsIn:
      "Dashboard My Work, the Invoice Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the invoice and follow the existing billing or readiness workflow.",
    visibilityNote:
      "Visibility controls do not change payment, readiness, or scheduling state.",
    subjectType: "invoice",
    ownerStrategy: "billing_owner"
  },
  {
    cueKey: "job_ready_unscheduled",
    label: "Ready job not scheduled",
    description:
      "Shows a cue when project readiness is clear but the canonical job remains unscheduled.",
    triggerSummary:
      "A job is ready for scheduling, but no schedule date has been set after the threshold.",
    whyItMatters:
      "Ready work should move into the schedule without bypassing project readiness gates.",
    appearsIn:
      "Dashboard My Work, the Job Workspace, and linked Project Workspace suggested actions.",
    safeAction:
      "Open the schedule handoff or job workspace and use the existing scheduling flow.",
    visibilityNote:
      "Cue visibility controls do not schedule the job or change dispatch status.",
    subjectType: "job",
    ownerStrategy: "scheduler"
  },
  {
    cueKey: "job_scheduled_missing_crew",
    label: "Scheduled job missing crew",
    description:
      "Shows a cue when a scheduled job is inside the configured look-ahead window and has no crew assignment.",
    triggerSummary:
      "A scheduled job falls within the look-ahead threshold and has no crew/vendor assignment.",
    whyItMatters:
      "Jobs near the work date need crew clarity before field execution starts.",
    appearsIn:
      "Dashboard My Work, the Job Workspace, and linked Project Workspace attention panels.",
    safeAction:
      "Open the job and use the existing crew or assignment workflow.",
    visibilityNote:
      "Snooze is user-scoped where supported; it does not assign crew or update the job.",
    subjectType: "job",
    ownerStrategy: "scheduler"
  }
];

export const operationalCueRuleDefinitionByKey = new Map(
  operationalCueRuleDefinitions.map((definition) => [definition.cueKey, definition])
);

export function isSupportedOperationalCueKey(
  value: string
): value is OperationalCueKey {
  return operationalCueRuleDefinitionByKey.has(value as OperationalCueKey);
}

export function isOperationalCueUrgency(
  value: string
): value is OperationalCueUrgency {
  return operationalCueUrgencies.includes(value as OperationalCueUrgency);
}

export function parseOperationalCueThresholdDays(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const thresholdDays = Number(normalized);

  if (
    !Number.isInteger(thresholdDays) ||
    thresholdDays < 0 ||
    thresholdDays > operationalCueThresholdDayMaximum
  ) {
    throw new Error(
      `Threshold days must be blank or a whole number from 0 to ${operationalCueThresholdDayMaximum}.`
    );
  }

  return thresholdDays;
}
