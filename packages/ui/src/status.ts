export type StatusTone = "neutral" | "info" | "warning" | "danger" | "success";

export type ReadinessTone =
  | "ready"
  | "attention"
  | "blocked"
  | "neutral"
  | "informational"
  | "financial"
  | "production";

const neutralStatuses = new Set([
  "draft",
  "neutral",
  "not_started",
  "not started",
  "pending",
  "upcoming",
  "estimate_file",
  "estimate file",
  "sent_pdf",
  "sent pdf",
  "not_applicable",
  "not applicable",
  "none"
]);

const infoStatuses = new Set([
  "active",
  "in_progress",
  "in progress",
  "current",
  "scheduled",
  "viewed",
  "plan",
  "planning",
  "assigned",
  "dispatched",
  "requested"
]);

const warningStatuses = new Set([
  "needs_action",
  "needs action",
  "needs_attention",
  "needs attention",
  "needs_review",
  "needs review",
  "waiting",
  "readiness_warning",
  "readiness warning",
  "sent",
  "awaiting",
  "awaiting_signature",
  "awaiting signature",
  "awaiting_payment",
  "awaiting payment",
  "partially_paid",
  "partially paid",
  "unpaid",
  "open",
  "unscheduled",
  "ready_but_not_scheduled",
  "ready but not scheduled"
]);

const dangerStatuses = new Set([
  "blocked",
  "error",
  "failed",
  "rejected",
  "declined",
  "overdue",
  "void",
  "voided",
  "cancelled",
  "canceled"
]);

const successStatuses = new Set([
  "complete",
  "completed",
  "approved",
  "paid",
  "signed",
  "succeeded",
  "closed",
  "ready",
  "ready_to_schedule",
  "ready to schedule",
  "settled",
  "recorded",
  "accepted",
  "finalized",
  "finished"
]);

export const statusToneClasses: Record<StatusTone, string> = {
  neutral: "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]",
  info: "border-[var(--border-medium)] bg-[var(--highlight)] text-[var(--graphite)]",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

export const statusConnectorClasses: Record<StatusTone, string> = {
  neutral: "bg-[var(--border-warm)]",
  info: "bg-[var(--border-dark)]",
  warning: "bg-amber-300",
  danger: "bg-red-300",
  success: "bg-emerald-300"
};

export const readinessToneClasses: Record<ReadinessTone, string> = {
  ready: statusToneClasses.success,
  attention: statusToneClasses.warning,
  blocked: statusToneClasses.danger,
  neutral: statusToneClasses.neutral,
  informational: statusToneClasses.info,
  financial: "border-[var(--border-medium)] bg-white text-[var(--graphite)]",
  production:
    "border-[var(--border-medium)] bg-[var(--highlight)] text-[var(--graphite)]"
};

export function normalizeStatusLabel(status: string) {
  return status.trim().toLowerCase().replaceAll("-", "_");
}

export function getStatusTone(status: string): StatusTone {
  const normalized = normalizeStatusLabel(status);

  if (
    normalized.startsWith("waiting_on") ||
    normalized.startsWith("waiting on")
  ) {
    return "warning";
  }

  if (normalized.includes("failed") || normalized.includes("blocked")) {
    return "danger";
  }

  if (successStatuses.has(normalized)) {
    return "success";
  }

  if (dangerStatuses.has(normalized)) {
    return "danger";
  }

  if (warningStatuses.has(normalized)) {
    return "warning";
  }

  if (infoStatuses.has(normalized)) {
    return "info";
  }

  if (neutralStatuses.has(normalized)) {
    return "neutral";
  }

  return "neutral";
}

export function getReadinessTone(status: string): ReadinessTone {
  const normalized = normalizeStatusLabel(status);

  if (
    normalized.includes("financial") ||
    normalized.includes("payment") ||
    normalized.includes("invoice") ||
    normalized.includes("billing") ||
    normalized.includes("collections")
  ) {
    return normalized.includes("blocked") ||
      normalized.includes("overdue") ||
      normalized.includes("failed")
      ? "blocked"
      : "financial";
  }

  if (
    normalized.includes("production") ||
    normalized.includes("field") ||
    normalized.includes("schedule") ||
    normalized.includes("scheduled") ||
    normalized.includes("crew") ||
    normalized.includes("dispatch")
  ) {
    return normalized.includes("blocked") || normalized.includes("failed")
      ? "blocked"
      : "production";
  }

  const statusTone = getStatusTone(status);

  switch (statusTone) {
    case "success":
      return "ready";
    case "warning":
      return "attention";
    case "danger":
      return "blocked";
    case "info":
      return "informational";
    case "neutral":
    default:
      return "neutral";
  }
}

export function getStatusToneClassName(tone: StatusTone) {
  return statusToneClasses[tone];
}

export function getStatusConnectorClassName(tone: StatusTone) {
  return statusConnectorClasses[tone];
}

export function getStatusBadgeClassName(status: string) {
  return statusToneClasses[getStatusTone(status)];
}

export function getReadinessToneClassName(tone: ReadinessTone) {
  return readinessToneClasses[tone];
}

export function getReadinessBadgeClassName(status: string) {
  return readinessToneClasses[getReadinessTone(status)];
}
