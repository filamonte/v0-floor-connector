import type { OperationalCueOwnerStrategy } from "@floorconnector/types";

import {
  getOperationalCueOwnerStrategyLabel,
  operationalCueOwnerStrategyDefinitionByKey,
  starterOperationalCueOwnerStrategies
} from "./owner-strategies";
import type { OperationalCueResponsibilityDefault } from "./responsibility-defaults";

export type OperationalCueResponsibilityResolutionStatus =
  | "strategy_only"
  | "organization_queue"
  | "record_owner_unavailable"
  | "person_resolved"
  | "user_resolved";

export type OperationalCueResponsibility = {
  strategy: OperationalCueOwnerStrategy;
  strategyLabel: string;
  resolutionStatus: OperationalCueResponsibilityResolutionStatus;
  displayLabel: string;
  personId: string | null;
  userId: string | null;
  source: string;
};

type ResolveOperationalCueResponsibilityInput = {
  ownerStrategy?: string | null;
  responsibilityDefaults?: OperationalCueResponsibilityDefault[];
};

function isOperationalCueOwnerStrategy(
  value: string
): value is OperationalCueOwnerStrategy {
  return operationalCueOwnerStrategyDefinitionByKey.has(
    value as OperationalCueOwnerStrategy
  );
}

export function resolveOperationalCueResponsibility(
  input: ResolveOperationalCueResponsibilityInput
): OperationalCueResponsibility {
  const ownerStrategy = input.ownerStrategy ?? "";
  const strategy: OperationalCueOwnerStrategy = isOperationalCueOwnerStrategy(
    ownerStrategy
  )
    ? ownerStrategy
    : "organization";
  const strategyLabel = getOperationalCueOwnerStrategyLabel(strategy);

  if (strategy === "organization") {
    return {
      strategy,
      strategyLabel,
      resolutionStatus: "organization_queue",
      displayLabel: "Organization queue",
      personId: null,
      userId: null,
      source: "organization_cue_rule"
    };
  }

  if (strategy === "record_owner") {
    return {
      strategy,
      strategyLabel,
      resolutionStatus: "record_owner_unavailable",
      displayLabel: "Record owner unavailable",
      personId: null,
      userId: null,
      source: "record_owner_fallback"
    };
  }

  if ((starterOperationalCueOwnerStrategies as readonly string[]).includes(strategy)) {
    const defaultRole = input.responsibilityDefaults?.find(
      (responsibilityDefault) => responsibilityDefault.roleKey === strategy
    );

    if (
      defaultRole &&
      defaultRole.isActive &&
      defaultRole.isAssignable &&
      defaultRole.personDisplayName.trim().length > 0
    ) {
      return {
        strategy,
        strategyLabel,
        resolutionStatus: defaultRole.membershipUserId
          ? "user_resolved"
          : "person_resolved",
        displayLabel: defaultRole.personDisplayName,
        personId: defaultRole.personId,
        userId: defaultRole.membershipUserId,
        source: "organization_responsibility_default"
      };
    }
  }

  return {
    strategy,
    strategyLabel,
    resolutionStatus: "strategy_only",
    displayLabel: strategyLabel,
    personId: null,
    userId: null,
    source: "cue_owner_strategy"
  };
}
