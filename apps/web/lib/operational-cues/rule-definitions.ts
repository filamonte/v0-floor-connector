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
  subjectType: OperationalCueSubjectType;
  ownerStrategy: OperationalCueOwnerStrategy;
};

export const operationalCueRuleDefinitions: OperationalCueRuleDefinition[] = [
  {
    cueKey: "estimate_sent_followup",
    label: "Estimate follow-up",
    description:
      "Shows a cue when a sent estimate has not received a customer decision after the configured number of days.",
    subjectType: "estimate",
    ownerStrategy: "estimator"
  },
  {
    cueKey: "contract_sent_unsigned",
    label: "Contract sent but unsigned",
    description:
      "Shows a cue when a sent contract is still waiting for signature after the configured number of days.",
    subjectType: "contract",
    ownerStrategy: "project_manager"
  },
  {
    cueKey: "contract_viewed_unsigned",
    label: "Contract viewed but unsigned",
    description:
      "Shows a higher-intent cue when customer view activity exists but the contract is still unsigned.",
    subjectType: "contract",
    ownerStrategy: "project_manager"
  },
  {
    cueKey: "invoice_overdue",
    label: "Invoice overdue",
    description:
      "Shows a cue when an invoice has an open balance after its due date plus the configured threshold.",
    subjectType: "invoice",
    ownerStrategy: "billing_owner"
  },
  {
    cueKey: "deposit_invoice_unpaid",
    label: "Deposit invoice unpaid",
    description:
      "Shows a cue when a deposit invoice still has an open balance after the configured number of days.",
    subjectType: "invoice",
    ownerStrategy: "billing_owner"
  },
  {
    cueKey: "job_ready_unscheduled",
    label: "Ready job not scheduled",
    description:
      "Shows a cue when project readiness is clear but the canonical job remains unscheduled.",
    subjectType: "job",
    ownerStrategy: "scheduler"
  },
  {
    cueKey: "job_scheduled_missing_crew",
    label: "Scheduled job missing crew",
    description:
      "Shows a cue when a scheduled job is inside the configured look-ahead window and has no crew assignment.",
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
