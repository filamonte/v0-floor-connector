import type { OperationalCueKey, OperationalCueOwnerStrategy } from "@floorconnector/types";

export type OperationalCueOwnerResolutionStatus =
  | "strategy_only"
  | "fallback_only"
  | "organization_queue";

export type OperationalCueOwnerStrategyDefinition = {
  key: OperationalCueOwnerStrategy;
  label: string;
  description: string;
  appliesToCueKeys: OperationalCueKey[];
  resolutionStatus: OperationalCueOwnerResolutionStatus;
};

export const starterOperationalCueOwnerStrategies = [
  "estimator",
  "project_manager",
  "billing_owner",
  "scheduler"
] as const;

export const operationalCueOwnerStrategies = [
  "record_owner",
  "organization",
  ...starterOperationalCueOwnerStrategies
] as const;

export const operationalCueOwnerStrategyDefinitions: OperationalCueOwnerStrategyDefinition[] = [
  {
    key: "estimator",
    label: "Estimator",
    description:
      "Responsible estimating role for sent-estimate follow-up. Organization defaults can map this role to a responsible person.",
    appliesToCueKeys: ["estimate_sent_followup"],
    resolutionStatus: "strategy_only"
  },
  {
    key: "project_manager",
    label: "Project manager",
    description:
      "Responsible project/commercial role for unsigned contract follow-up. Organization defaults can map this role to a responsible person.",
    appliesToCueKeys: ["contract_sent_unsigned", "contract_viewed_unsigned"],
    resolutionStatus: "strategy_only"
  },
  {
    key: "billing_owner",
    label: "Billing owner",
    description:
      "Responsible billing role for overdue and unpaid deposit invoice follow-up. Organization defaults can map this role to a responsible person.",
    appliesToCueKeys: ["invoice_overdue", "deposit_invoice_unpaid"],
    resolutionStatus: "strategy_only"
  },
  {
    key: "scheduler",
    label: "Scheduler",
    description:
      "Responsible scheduling role for ready unscheduled jobs and missing-crew follow-up. Organization defaults can map this role to a responsible person.",
    appliesToCueKeys: ["job_ready_unscheduled", "job_scheduled_missing_crew"],
    resolutionStatus: "strategy_only"
  },
  {
    key: "record_owner",
    label: "Record owner",
    description:
      "Legacy fallback strategy. Current canonical records do not expose consistent owner fields for cue resolution yet.",
    appliesToCueKeys: [],
    resolutionStatus: "fallback_only"
  },
  {
    key: "organization",
    label: "Organization queue",
    description:
      "Organization-wide visibility fallback for cues that are not resolved to a responsible role or user.",
    appliesToCueKeys: [],
    resolutionStatus: "organization_queue"
  }
];

export const operationalCueOwnerStrategyDefinitionByKey = new Map(
  operationalCueOwnerStrategyDefinitions.map((definition) => [
    definition.key,
    definition
  ])
);

export function getOperationalCueOwnerStrategyLabel(
  ownerStrategy: OperationalCueOwnerStrategy
) {
  return (
    operationalCueOwnerStrategyDefinitionByKey.get(ownerStrategy)?.label ??
    ownerStrategy.replaceAll("_", " ")
  );
}

export function getOperationalCueOwnerResolutionStatus(
  ownerStrategy: OperationalCueOwnerStrategy
) {
  return (
    operationalCueOwnerStrategyDefinitionByKey.get(ownerStrategy)?.resolutionStatus ??
    "fallback_only"
  );
}
