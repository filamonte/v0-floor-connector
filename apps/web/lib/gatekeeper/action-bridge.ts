import type { GateKeeperActionSuggestionType } from "@floorconnector/types";

export type GateKeeperActionRiskTier =
  | "low_internal"
  | "medium_internal"
  | "high_customer_facing"
  | "high_schedule"
  | "high_financial_legal"
  | "forbidden";

export type GateKeeperControlledActionStatus =
  | "proposed"
  | "reviewed"
  | "ready_for_execution_review"
  | "execution_requested"
  | "execution_validated"
  | "executed"
  | "failed"
  | "canceled"
  | "superseded";

export type GateKeeperControlledActionCategory =
  | "opportunity"
  | "project"
  | "schedule"
  | "work_item"
  | "communication"
  | "estimate"
  | "invoice"
  | "contract"
  | "blocked";

export type GateKeeperExecutionOwner =
  | "opportunities"
  | "projects"
  | "schedule_jobs"
  | "work_items"
  | "communications"
  | "estimates"
  | "invoices"
  | "contracts"
  | "none";

export type GateKeeperExecutionBlocker = {
  code: string;
  message: string;
  severity: "info" | "warning" | "blocking";
};

export type GateKeeperControlledActionPreview = {
  suggestionType: GateKeeperActionSuggestionType | "unknown";
  category: GateKeeperControlledActionCategory;
  owner: GateKeeperExecutionOwner;
  riskTier: GateKeeperActionRiskTier;
  canPreview: boolean;
  canExecuteNow: false;
  blockers: GateKeeperExecutionBlocker[];
};

export type GateKeeperExecutionPolicy = {
  suggestionType: GateKeeperActionSuggestionType | "unknown";
  owner: GateKeeperExecutionOwner;
  category: GateKeeperControlledActionCategory;
  riskTier: GateKeeperActionRiskTier;
  previewAllowed: boolean;
  executionAllowedInCurrentSlice: boolean;
  requiresExplicitHumanExecutionRequest: true;
};

const policyBySuggestionType = {
  create_opportunity: {
    owner: "opportunities",
    category: "opportunity",
    riskTier: "medium_internal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: true
  },
  update_opportunity: {
    owner: "opportunities",
    category: "opportunity",
    riskTier: "medium_internal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  schedule_site_assessment: {
    owner: "schedule_jobs",
    category: "schedule",
    riskTier: "high_schedule",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  create_task_later: {
    owner: "work_items",
    category: "work_item",
    riskTier: "medium_internal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  send_followup_later: {
    owner: "communications",
    category: "communication",
    riskTier: "high_customer_facing",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  update_project_notes: {
    owner: "projects",
    category: "project",
    riskTier: "medium_internal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  flag_estimate_review: {
    owner: "estimates",
    category: "estimate",
    riskTier: "medium_internal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  flag_invoice_review: {
    owner: "invoices",
    category: "invoice",
    riskTier: "high_financial_legal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  },
  flag_contract_review: {
    owner: "contracts",
    category: "contract",
    riskTier: "high_financial_legal",
    previewAllowed: true,
    executionAllowedInCurrentSlice: false
  }
} as const satisfies Record<
  GateKeeperActionSuggestionType,
  {
    owner: GateKeeperExecutionOwner;
    category: GateKeeperControlledActionCategory;
    riskTier: GateKeeperActionRiskTier;
    previewAllowed: boolean;
    executionAllowedInCurrentSlice: boolean;
  }
>;

const blockedUnknownPolicy = {
  owner: "none",
  category: "blocked",
  riskTier: "forbidden",
  previewAllowed: false,
  executionAllowedInCurrentSlice: false
} as const;

function isKnownSuggestionType(
  suggestionType: string
): suggestionType is GateKeeperActionSuggestionType {
  return suggestionType in policyBySuggestionType;
}

function getPolicyForSuggestion(suggestionType: string) {
  return (
    policyBySuggestionType[suggestionType as GateKeeperActionSuggestionType] ??
    blockedUnknownPolicy
  );
}

export function classifySuggestionRisk(
  suggestionType: string
): GateKeeperActionRiskTier {
  return getPolicyForSuggestion(suggestionType).riskTier;
}

export function getExecutionOwnerForSuggestion(
  suggestionType: string
): GateKeeperExecutionOwner {
  return getPolicyForSuggestion(suggestionType).owner;
}

export function canSuggestionHaveExecutionPreview(suggestionType: string) {
  return getPolicyForSuggestion(suggestionType).previewAllowed;
}

export function getGateKeeperExecutionPolicy(
  suggestionType: string
): GateKeeperExecutionPolicy {
  const policy = getPolicyForSuggestion(suggestionType);

  return {
    suggestionType: isKnownSuggestionType(suggestionType)
      ? suggestionType
      : "unknown",
    owner: policy.owner,
    category: policy.category,
    riskTier: policy.riskTier,
    previewAllowed: policy.previewAllowed,
    executionAllowedInCurrentSlice: policy.executionAllowedInCurrentSlice,
    requiresExplicitHumanExecutionRequest: true
  };
}

export function buildGateKeeperControlledActionPreview(
  suggestionType: string
): GateKeeperControlledActionPreview {
  const policy = getGateKeeperExecutionPolicy(suggestionType);
  const blockers: GateKeeperExecutionBlocker[] =
    policy.executionAllowedInCurrentSlice &&
    policy.suggestionType === "create_opportunity"
      ? [
          {
            code: "execution_requires_ledger_request",
            message:
              "Create-opportunity execution requires an approved suggestion and an execution_requested GateKeeper ledger row.",
            severity: "info"
          }
        ]
      : [
          {
            code: "execution_not_implemented",
            message:
              "GateKeeper controlled execution is not implemented for this suggestion type. Review approval remains separate from execution.",
            severity: "blocking"
          }
        ];

  if (!policy.previewAllowed) {
    blockers.push({
      code: "unknown_suggestion_type",
      message:
        "This suggestion type has no controlled action owner or preview policy.",
      severity: "blocking"
    });
  }

  return {
    suggestionType: policy.suggestionType,
    category: policy.category,
    owner: policy.owner,
    riskTier: policy.riskTier,
    canPreview: policy.previewAllowed,
    canExecuteNow: false,
    blockers
  };
}
