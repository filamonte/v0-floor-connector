import type {
  WorkItemKind,
  WorkItemPriority,
  WorkItemSourceType,
  WorkItemStatus,
  WorkItemVisibility
} from "@floorconnector/types";

export const workItemStatuses = ["open", "completed", "dismissed"] as const satisfies readonly WorkItemStatus[];

export const workItemPriorities = ["low", "normal", "high", "urgent"] as const satisfies readonly WorkItemPriority[];

export const workItemKinds = [
  "manual",
  "lead_follow_up",
  "appointment_confirmation_prep",
  "appointment_follow_up",
  "estimate_follow_up",
  "invoice_follow_up",
  "human_handoff"
] as const satisfies readonly WorkItemKind[];

export const workItemSourceTypes = [
  "opportunity",
  "appointment",
  "customer",
  "project",
  "estimate",
  "contract",
  "change_order",
  "job",
  "invoice",
  "payment",
  "communication_thread",
  "notification_event",
  "workflow_error_event"
] as const satisfies readonly WorkItemSourceType[];

export const workItemVisibilities = ["internal"] as const satisfies readonly WorkItemVisibility[];
