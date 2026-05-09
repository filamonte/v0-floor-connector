import type {
  AppointmentStatus,
  AppointmentType,
  OpportunityStatus,
  WorkItemKind,
  WorkItemPriority,
  WorkItemSourceType
} from "@floorconnector/types";

import { classifyLeadFollowUp } from "../opportunities/follow-up-read-model";
import type { ProjectCueWorkItemBridge } from "../projects/cues";

export type ProjectGuidanceWorkItemCue =
  | "approved_estimate_missing_contract"
  | "deposit_invoice_unpaid"
  | "open_blocker_field_notes"
  | "signed_contract_no_job"
  | "ready_unscheduled_jobs";

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
      input.nextFollowUpNote ? `Follow-up note: ${input.nextFollowUpNote}` : null,
      input.contactName ? `Contact: ${input.contactName}` : null,
      input.customerName ?? input.companyName
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
  const contextLabel = input.customerName ?? input.opportunityTitle ?? "appointment";
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
      input.startsAt ? `Scheduled time: ${new Date(input.startsAt).toLocaleString()}` : null,
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
    case "approved_estimate_missing_contract":
      return "estimate_follow_up";
    case "deposit_invoice_unpaid":
      return "invoice_follow_up";
    case "open_blocker_field_notes":
      return "human_handoff";
    case "signed_contract_no_job":
    case "ready_unscheduled_jobs":
      return "manual";
  }
}

function getProjectGuidanceTitle(input: {
  cue: ProjectGuidanceWorkItemCue;
  projectName: string;
}) {
  switch (input.cue) {
    case "approved_estimate_missing_contract":
      return `Create contract follow-through for ${input.projectName}`;
    case "deposit_invoice_unpaid":
      return `Follow up on deposit invoice for ${input.projectName}`;
    case "open_blocker_field_notes":
      return `Resolve project blocker for ${input.projectName}`;
    case "signed_contract_no_job":
      return `Create job follow-through for ${input.projectName}`;
    case "ready_unscheduled_jobs":
      return `Schedule ready project work for ${input.projectName}`;
  }
}

function getProjectGuidancePriority(
  cue: ProjectGuidanceWorkItemCue
): WorkItemPriority {
  switch (cue) {
    case "approved_estimate_missing_contract":
    case "deposit_invoice_unpaid":
      return "high";
    case "open_blocker_field_notes":
      return "high";
    case "signed_contract_no_job":
    case "ready_unscheduled_jobs":
      return "normal";
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
