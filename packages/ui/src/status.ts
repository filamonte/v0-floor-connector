export type StatusTone = "neutral" | "info" | "warning" | "danger" | "success";

const neutralStatuses = new Set([
  "draft",
  "neutral",
  "not_started",
  "not started",
  "pending",
  "upcoming",
  "void",
  "estimate_file",
  "estimate file",
  "sent_pdf",
  "sent pdf"
]);

const infoStatuses = new Set([
  "active",
  "in_progress",
  "in progress",
  "current",
  "scheduled",
  "viewed"
]);

const warningStatuses = new Set([
  "needs_action",
  "needs action",
  "waiting",
  "readiness_warning",
  "readiness warning",
  "sent",
  "partially_paid",
  "partially paid",
  "unpaid",
  "open",
  "unscheduled"
]);

const dangerStatuses = new Set([
  "blocked",
  "error",
  "failed",
  "rejected",
  "declined",
  "overdue",
  "voided"
]);

const successStatuses = new Set([
  "complete",
  "completed",
  "approved",
  "paid",
  "signed",
  "succeeded",
  "closed",
  "ready"
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

export function normalizeStatusLabel(status: string) {
  return status.trim().toLowerCase().replaceAll("-", "_");
}

export function getStatusTone(status: string): StatusTone {
  const normalized = normalizeStatusLabel(status);

  if (normalized.startsWith("waiting_on") || normalized.startsWith("waiting on")) {
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

export function getStatusToneClassName(tone: StatusTone) {
  return statusToneClasses[tone];
}

export function getStatusConnectorClassName(tone: StatusTone) {
  return statusConnectorClasses[tone];
}

export function getStatusBadgeClassName(status: string) {
  return statusToneClasses[getStatusTone(status)];
}
