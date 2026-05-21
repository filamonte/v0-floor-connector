import type {
  OperationalCueKey,
  OperationalCueOwnerStrategy,
  OperationalCueSubjectType,
  OperationalCueUrgency,
  OrganizationOperationalCueRule
} from "@floorconnector/types";
import type { OperationalCueOwnerResolutionStatus } from "./owner-strategies";
import type { OperationalCueResponsibility } from "./responsibility";

export type OperationalCue = {
  cueKey: OperationalCueKey;
  subjectType: OperationalCueSubjectType;
  subjectId: string;
  projectId: string | null;
  organizationId: string;
  assignedUserId: string | null;
  ownerStrategy: OperationalCueOwnerStrategy;
  ownerStrategyLabel: string;
  ownerResolutionStatus: OperationalCueOwnerResolutionStatus;
  responsibility: OperationalCueResponsibility;
  title: string;
  message: string;
  urgency: OperationalCueUrgency;
  ageDays: number;
  customerName: string | null;
  projectName: string | null;
  actionHref: string;
  actionLabel: string;
  reason: string;
  explanation: string;
  sourceLabel: string;
  sourceValue: string | null;
  thresholdLabel: string | null;
  triggeredAtLabel: string | null;
};

export type OperationalCueGroupKey = "estimates" | "contracts" | "invoices" | "jobs";

export type OperationalCueRule = OrganizationOperationalCueRule;
