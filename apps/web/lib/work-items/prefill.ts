import type {
  AppointmentStatus,
  AppointmentType,
  OpportunityMeasurement,
  OpportunityObservation,
  OperationalCueKey,
  OpportunityStatus,
  WorkItemKind,
  WorkItemPriority,
  WorkItemSourceType
} from "@floorconnector/types";

import { classifyLeadFollowUp } from "../opportunities/follow-up-read-model";
import type { OperationalCue } from "../operational-cues/types";
import type { ProjectCueWorkItemBridge } from "../projects/cues";

export type ProjectGuidanceWorkItemCue = "open_blocker_field_notes";
export type EstimateHandoffWorkItemType =
  | "generate_estimate"
  | "review_estimate"
  | "request_missing_info"
  | "approve_send"
  | "follow_up_customer";

export type CueWorkItemPrefill = {
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: WorkItemPriority;
  kind: Extract<
    WorkItemKind,
    | "lead_follow_up"
    | "appointment_confirmation_prep"
    | "appointment_follow_up"
    | "estimate_follow_up"
    | "invoice_follow_up"
    | "human_handoff"
    | "manual"
  >;
  assignedPersonId?: string | null;
  dedupeKey: string | null;
  metadata: Record<string, unknown>;
};

type OperationalCueBridgeConfig = {
  label: string;
  title: string;
  kind: CueWorkItemPrefill["kind"];
  priority: WorkItemPriority;
};

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function compactDescription(parts: Array<string | null | undefined>) {
  const value = parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("\n\n");

  return value.length > 0 ? value : null;
}

function dateKey(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "none";
}

function getOperationalCueBridgeConfig(
  cueKey: OperationalCueKey
): OperationalCueBridgeConfig | null {
  switch (cueKey) {
    case "estimate_sent_followup":
      return {
        label: "Create follow-up",
        title: "Follow up on sent estimate",
        kind: "estimate_follow_up",
        priority: "normal"
      };
    case "invoice_overdue":
      return {
        label: "Create collection follow-up",
        title: "Follow up on past-due invoice",
        kind: "invoice_follow_up",
        priority: "high"
      };
    default:
      return null;
  }
}

function getEstimateHandoffTitle(input: {
  type: EstimateHandoffWorkItemType;
  opportunityTitle: string;
}) {
  switch (input.type) {
    case "generate_estimate":
      return `Generate estimate for ${input.opportunityTitle}`;
    case "review_estimate":
      return `Review estimate handoff for ${input.opportunityTitle}`;
    case "request_missing_info":
      return `Request missing estimate info for ${input.opportunityTitle}`;
    case "approve_send":
      return `Approve estimate send for ${input.opportunityTitle}`;
    case "follow_up_customer":
      return `Follow up on estimate for ${input.opportunityTitle}`;
  }
}

function getEstimateHandoffPriority(type: EstimateHandoffWorkItemType) {
  switch (type) {
    case "request_missing_info":
    case "approve_send":
      return "high" as const;
    case "generate_estimate":
    case "review_estimate":
    case "follow_up_customer":
      return "normal" as const;
  }
}

function summarizeMeasurements(measurements: OpportunityMeasurement[]) {
  if (measurements.length === 0) {
    return null;
  }

  return measurements
    .slice(0, 5)
    .map((measurement) =>
      [
        measurement.areaLabel ?? measurement.measurementType,
        `${measurement.valueNumeric} ${measurement.unit}`,
        measurement.quantity ? `qty ${measurement.quantity}` : null,
        measurement.notes
      ]
        .filter(Boolean)
        .join(" - ")
    )
    .join("\n");
}

function summarizeObservations(observations: OpportunityObservation[]) {
  if (observations.length === 0) {
    return null;
  }

  return observations
    .slice(0, 5)
    .map((observation) =>
      [observation.title, observation.body, observation.severity]
        .filter(Boolean)
        .join(" - ")
    )
    .join("\n");
}

export function getOperationalCueWorkItemBridgeAction(cue: OperationalCue) {
  const config = getOperationalCueBridgeConfig(cue.cueKey);

  if (!config) {
    return null;
  }

  return {
    href: `${cue.actionHref}?workItemCue=${cue.cueKey}#work-items`,
    label: config.label
  };
}

export function buildOperationalCueWorkItemPrefill(input: {
  cue: OperationalCue;
}):
  | (CueWorkItemPrefill & {
      sourceType: WorkItemSourceType;
      sourceId: string;
      linkPath: string;
    })
  | null {
  const { cue } = input;
  const config = getOperationalCueBridgeConfig(cue.cueKey);

  if (!config) {
    return null;
  }

  return {
    title: config.title,
    description: compactDescription([
      "Prefilled from a deterministic operational cue. Review the owner, due date, and context before submitting this internal work item.",
      `Cue: ${cue.title}`,
      cue.explanation,
      `Reason: ${cue.reason}`,
      cue.customerName ? `Customer: ${cue.customerName}` : null,
      cue.projectName ? `Project: ${cue.projectName}` : null,
      cue.sourceValue
        ? `${cue.sourceLabel}: ${cue.sourceValue}`
        : cue.sourceLabel,
      cue.thresholdLabel,
      cue.triggeredAtLabel,
      `Workflow handoff: ${cue.actionHref}`
    ]),
    dueAt: null,
    priority: config.priority,
    kind: config.kind,
    dedupeKey: `operational-cue:${cue.cueKey}:${cue.subjectType}:${cue.subjectId}`,
    sourceType: cue.subjectType,
    sourceId: cue.subjectId,
    linkPath: cue.actionHref,
    metadata: {
      cue: "operational_cue",
      cueKey: cue.cueKey,
      subjectType: cue.subjectType,
      subjectId: cue.subjectId,
      projectId: cue.projectId,
      urgency: cue.urgency,
      sourceLabel: cue.sourceLabel,
      sourceValue: cue.sourceValue,
      thresholdLabel: cue.thresholdLabel,
      triggeredAtLabel: cue.triggeredAtLabel,
      actionHref: cue.actionHref
    }
  };
}

export function buildOpportunityFollowUpWorkItemPrefill(input: {
  opportunityId: string;
  title: string;
  status: OpportunityStatus;
  contactName?: string | null;
  companyName?: string | null;
  customerName?: string | null;
  nextFollowUpAt: string | null;
  nextFollowUpNote?: string | null;
  lastCommunicationAt?: string | null;
  nowIso?: string;
}): CueWorkItemPrefill {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const bucket = classifyLeadFollowUp(input.nextFollowUpAt, nowIso);
  const leadLabel = input.title || input.contactName || "lead";
  const title =
    bucket === "no_follow_up"
      ? `Set follow-up for ${leadLabel}`
      : `Follow up with ${leadLabel}`;

  return {
    title,
    description: compactDescription([
      "Created from a visible lead follow-up cue. Confirm the owner, due date, and context before creating this internal work item.",
      input.nextFollowUpNote
        ? `Follow-up note: ${input.nextFollowUpNote}`
        : null,
      input.contactName ? `Contact: ${input.contactName}` : null,
      (input.customerName ?? input.companyName)
        ? `Account: ${input.customerName ?? input.companyName}`
        : null,
      input.lastCommunicationAt
        ? `Last communication: ${new Date(input.lastCommunicationAt).toLocaleString()}`
        : null,
      `Lead status: ${labelize(input.status)}`
    ]),
    dueAt: input.nextFollowUpAt,
    priority: bucket === "overdue" ? "high" : "normal",
    kind: "lead_follow_up",
    dedupeKey: `opportunity:${input.opportunityId}:lead_follow_up:${dateKey(
      input.nextFollowUpAt
    )}`,
    metadata: {
      cue: "lead_follow_up",
      leadStatus: input.status,
      leadFollowUpBucket: bucket,
      nextFollowUpAt: input.nextFollowUpAt,
      lastCommunicationAt: input.lastCommunicationAt ?? null
    }
  };
}

export function buildEstimateHandoffWorkItemPrefill(input: {
  opportunityId: string;
  opportunityTitle: string;
  customerName?: string | null;
  projectName?: string | null;
  contactName?: string | null;
  requirementsSummary?: string | null;
  notes?: string | null;
  siteAssessmentStatus: string;
  siteAssessmentScheduledAt?: string | null;
  siteAssessmentCompletedAt?: string | null;
  measurements: OpportunityMeasurement[];
  observations: OpportunityObservation[];
  attachmentCount: number;
  type?: EstimateHandoffWorkItemType;
}): CueWorkItemPrefill {
  const type = input.type ?? "generate_estimate";
  const measurementSummary = summarizeMeasurements(input.measurements);
  const observationSummary = summarizeObservations(input.observations);

  return {
    title: getEstimateHandoffTitle({
      type,
      opportunityTitle: input.opportunityTitle
    }),
    description: compactDescription([
      "Created from the Sales Handoff / Estimate Work Queue foundation. Confirm the estimate writer, due date, blocker state, and source context before submitting this internal work item.",
      input.customerName ? `Customer: ${input.customerName}` : null,
      input.projectName ? `Project: ${input.projectName}` : null,
      input.contactName
        ? `Relationship / onsite context: ${input.contactName}`
        : null,
      `Site assessment: ${labelize(input.siteAssessmentStatus)}`,
      input.siteAssessmentScheduledAt
        ? `Site visit scheduled: ${new Date(input.siteAssessmentScheduledAt).toLocaleString()}`
        : null,
      input.siteAssessmentCompletedAt
        ? `Site visit completed: ${new Date(input.siteAssessmentCompletedAt).toLocaleString()}`
        : null,
      input.requirementsSummary
        ? `Requirements summary: ${input.requirementsSummary}`
        : null,
      input.notes ? `Internal notes: ${input.notes}` : null,
      measurementSummary ? `Measurements:\n${measurementSummary}` : null,
      observationSummary ? `Observations:\n${observationSummary}` : null,
      `Photos / files attached to lead: ${input.attachmentCount}`
    ]),
    dueAt: null,
    priority: getEstimateHandoffPriority(type),
    kind: "estimate_follow_up",
    dedupeKey: `opportunity:${input.opportunityId}:estimate_handoff:${type}`,
    metadata: {
      cue: "estimate_handoff",
      estimateWork: true,
      estimateWorkType: type,
      estimateWorkStatus:
        type === "review_estimate" || type === "approve_send"
          ? "ready_for_review"
          : "open",
      sourceRecordType: "opportunity",
      opportunityId: input.opportunityId,
      siteAssessmentStatus: input.siteAssessmentStatus,
      siteAssessmentScheduledAt: input.siteAssessmentScheduledAt ?? null,
      siteAssessmentCompletedAt: input.siteAssessmentCompletedAt ?? null,
      measurementCount: input.measurements.length,
      observationCount: input.observations.length,
      attachmentCount: input.attachmentCount,
      roleSlots: {
        onsiteRepPersonId: null,
        relationshipOwnerPersonId: null,
        estimateWriterPersonId: null,
        followUpOwnerPersonId: null,
        salesCreditOwnerPersonId: null,
        sendAsUserId: null
      }
    }
  };
}

function getEstimateWorkspaceShortcutTitle(input: {
  type: Extract<
    EstimateHandoffWorkItemType,
    "request_missing_info" | "review_estimate"
  >;
  estimateReference: string;
}) {
  switch (input.type) {
    case "request_missing_info":
      return `Request missing info for ${input.estimateReference}`;
    case "review_estimate":
      return `Review ${input.estimateReference} before send`;
  }
}

function getEstimateWorkspaceShortcutNextAction(
  type: Extract<
    EstimateHandoffWorkItemType,
    "request_missing_info" | "review_estimate"
  >
) {
  switch (type) {
    case "request_missing_info":
      return "Collect the missing photos, measurements, coating condition, customer approval, or scope details blocking estimate completion.";
    case "review_estimate":
      return "Review estimate scope, pricing, exclusions, and send readiness before the estimate is sent to the customer.";
  }
}

export function buildEstimateWorkspaceShortcutWorkItemPrefill(input: {
  estimateId: string;
  estimateReference: string;
  estimateStatus: string;
  projectId: string;
  projectName?: string | null;
  customerName?: string | null;
  opportunityId?: string | null;
  type: Extract<
    EstimateHandoffWorkItemType,
    "request_missing_info" | "review_estimate"
  >;
}): CueWorkItemPrefill & {
  sourceType: WorkItemSourceType;
  sourceId: string;
  linkPath: string;
} {
  const nextAction = getEstimateWorkspaceShortcutNextAction(input.type);

  return {
    title: getEstimateWorkspaceShortcutTitle({
      type: input.type,
      estimateReference: input.estimateReference
    }),
    description: compactDescription([
      "Created from the Estimate Workspace handoff shortcuts. Confirm the owner, due date, and context before submitting this internal Work Item.",
      input.customerName ? `Customer: ${input.customerName}` : null,
      input.projectName ? `Project: ${input.projectName}` : null,
      `Estimate: ${input.estimateReference}`,
      `Estimate status: ${labelize(input.estimateStatus)}`,
      `Next action: ${nextAction}`
    ]),
    dueAt: null,
    priority: input.type === "request_missing_info" ? "high" : "normal",
    kind: "estimate_follow_up",
    dedupeKey: `estimate:${input.estimateId}:estimate_handoff:${input.type}`,
    sourceType: "estimate",
    sourceId: input.estimateId,
    linkPath: `/estimates/${input.estimateId}`,
    metadata: {
      cue: "estimate_workspace_shortcut",
      estimateWork: true,
      estimateWorkType: input.type,
      estimateWorkStatus:
        input.type === "review_estimate" ? "ready_for_review" : "open",
      sourceRecordType: "estimate",
      estimateId: input.estimateId,
      projectId: input.projectId,
      opportunityId: input.opportunityId ?? null,
      nextAction,
      roleSlots: {
        onsiteRepPersonId: null,
        relationshipOwnerPersonId: null,
        estimateWriterPersonId: null,
        followUpOwnerPersonId: null,
        salesCreditOwnerPersonId: null,
        sendAsUserId: null
      }
    }
  };
}

export function buildAppointmentCueWorkItemPrefill(input: {
  appointmentId: string;
  title: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startsAt: string | null;
  customerName?: string | null;
  opportunityTitle?: string | null;
  assignedPersonId?: string | null;
  cue?: "confirmation_prep" | "appointment_follow_up";
}): CueWorkItemPrefill {
  const inferredCue =
    input.cue ??
    (input.status === "scheduled"
      ? "confirmation_prep"
      : "appointment_follow_up");
  const isFollowUpCue =
    inferredCue === "appointment_follow_up" ||
    input.status === "canceled" ||
    input.status === "no_show" ||
    input.status === "completed";
  const kind = isFollowUpCue
    ? "appointment_follow_up"
    : "appointment_confirmation_prep";
  const contextLabel =
    input.customerName ?? input.opportunityTitle ?? "appointment";
  const statusLabel = labelize(input.status);
  const typeLabel = labelize(input.appointmentType);

  return {
    title:
      kind === "appointment_follow_up"
        ? `Follow up after ${statusLabel} appointment`
        : `Confirm appointment: ${input.title}`,
    description: compactDescription([
      "Created from a visible appointment cue. Confirm the owner, due date, and context before creating this internal work item.",
      `Appointment: ${input.title}`,
      `Type: ${typeLabel}`,
      `Status: ${statusLabel}`,
      input.startsAt
        ? `Scheduled time: ${new Date(input.startsAt).toLocaleString()}`
        : null,
      contextLabel !== "appointment" ? `Context: ${contextLabel}` : null
    ]),
    dueAt: input.startsAt,
    priority: input.status === "no_show" ? "high" : "normal",
    kind,
    assignedPersonId: input.assignedPersonId ?? null,
    dedupeKey: `appointment:${input.appointmentId}:${kind}:${input.status}:${dateKey(
      input.startsAt
    )}`,
    metadata: {
      cue: kind,
      appointmentType: input.appointmentType,
      appointmentStatus: input.status,
      startsAt: input.startsAt
    }
  };
}

function getProjectGuidanceKind(
  cue: ProjectGuidanceWorkItemCue
): CueWorkItemPrefill["kind"] {
  switch (cue) {
    case "open_blocker_field_notes":
      return "human_handoff";
  }
}

function getProjectGuidanceTitle(input: {
  cue: ProjectGuidanceWorkItemCue;
  projectName: string;
}) {
  switch (input.cue) {
    case "open_blocker_field_notes":
      return `Resolve project blocker for ${input.projectName}`;
  }
}

function getProjectGuidancePriority(
  cue: ProjectGuidanceWorkItemCue
): WorkItemPriority {
  switch (cue) {
    case "open_blocker_field_notes":
      return "high";
  }
}

export function buildProjectGuidanceWorkItemPrefill(input: {
  projectId: string;
  projectName: string;
  customerName?: string | null;
  cueTitle: string;
  cueDescription: string;
  cueReason: string;
  workflowHref: string;
  bridge: ProjectCueWorkItemBridge;
}): CueWorkItemPrefill & {
  sourceType: WorkItemSourceType;
  sourceId: string;
  linkPath: string;
} {
  const { bridge } = input;

  return {
    title: getProjectGuidanceTitle({
      cue: bridge.cue,
      projectName: input.projectName
    }),
    description: compactDescription([
      "Prefilled from project guidance. Review the owner, due date, and context before submitting this internal work item.",
      `Cue: ${input.cueTitle}`,
      input.cueDescription,
      `Reason: ${input.cueReason}`,
      input.customerName ? `Customer: ${input.customerName}` : null,
      `Project: ${input.projectName}`,
      `Source context: ${bridge.sourceLabel}`,
      `Workflow handoff: ${input.workflowHref}`
    ]),
    dueAt: null,
    priority: getProjectGuidancePriority(bridge.cue),
    kind: getProjectGuidanceKind(bridge.cue),
    dedupeKey: `project-guidance:${input.projectId}:${bridge.cue}:${bridge.sourceType}:${bridge.sourceId}`,
    sourceType: bridge.sourceType,
    sourceId: bridge.sourceId,
    linkPath: input.workflowHref,
    metadata: {
      cue: "project_guidance",
      projectCue: bridge.cue,
      projectId: input.projectId,
      projectName: input.projectName,
      sourceLabel: bridge.sourceLabel,
      workflowHref: input.workflowHref,
      ...bridge.context
    }
  };
}
