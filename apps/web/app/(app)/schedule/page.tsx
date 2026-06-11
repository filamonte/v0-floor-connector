import Link from "next/link";
import type { ReactNode } from "react";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import {
  CrewBoardDragDropLayer,
  CrewBoardDraggableJob,
  CrewBoardDropTarget
} from "@/components/crewboard-drag-drop-layer";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { ScheduleCrewAssignmentForm } from "@/components/schedule-crew-assignment-form";
import {
  ScheduleDispatchBoardShell,
  ScheduleFieldCommandCenter,
  ScheduleFieldHandoffCommandView,
  ScheduleFieldHandoffPanel,
  ScheduleJobActionLinks,
  ScheduleNotesPreview,
  ScheduleOperationalIndicators,
  ScheduleResourceLoadPanel,
  ScheduleSelectedJobPanelSummary,
  ScheduleWarningBadges,
  ScheduleWarningDetails,
  type ScheduleOperationalIndicator,
  type ScheduleResourceLoadPanelItem
} from "@/components/schedule-crewboard-presentational";
import { ScheduleJobForm } from "@/components/schedule-job-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { buildDailyLogCaptureHref } from "@/lib/daily-logs/links";
import { getJobEquipmentReadinessSummary } from "@/lib/equipment/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  assignCrewAction,
  scheduleJobAction,
  unassignCrewAction,
  unscheduleJobAction
} from "@/lib/jobs/actions";
import {
  listScheduleJobAssignmentsByJobIds,
  listScheduleJobs
} from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listScheduleAssignablePeople } from "@/lib/people/data";
import { listScheduleOpportunityAssessments } from "@/lib/opportunities/data";
import {
  buildScheduleHref,
  type CrewViewKey,
  type ScheduleActionKey,
  type ScheduleItemViewKey,
  type ScheduleLayoutKey,
  type ScheduleViewKey
} from "@/lib/schedule/links";
import { listScheduleFieldHandoffsByJobIds } from "@/lib/schedule/field-handoff-data";
import {
  buildScheduleFieldHandoffCommandView,
  buildScheduleFieldHandoffPacket
} from "@/lib/schedule/field-handoff-read-model";
import {
  buildScheduleBoardReadModel,
  buildScheduleItems,
  buildScheduleRoleSlotIndicators,
  getScheduleWarningDisplayLabel,
  type ScheduleDispatchAttentionTone,
  type ScheduleItem
} from "@/lib/schedule/read-model";
import {
  buildFieldCommandCenterSections,
  buildScheduleDispatchBoardSections
} from "@/lib/schedule/dispatch-board";
import {
  buildCrewBoardDropTargetFromSearch,
  createCrewBoardDateDropTarget,
  createCrewBoardMoveProposal,
  createCrewBoardTimeBucketDropTarget,
  formatDropTargetLabel
} from "@/lib/schedule/proposed-move";
import {
  deriveScheduleResourceLoadSummaries,
  deriveScheduleWarningSummaries,
  type ScheduleWarningSummary
} from "@/lib/schedule/warnings";
import {
  getDashboardProjectFinancialReadinessSummaries,
  type ProjectFinancialReadinessSnapshot
} from "@/lib/projects/readiness";
import { listScheduleAppointments } from "@/lib/appointments/data";
import { listScheduleLaborVendors } from "@/lib/vendors/data";

const SCHEDULE_VIEW_OPTIONS = [
  { value: "all", label: "All CrewBoard work" },
  { value: "unscheduled", label: "Needs Scheduling" },
  { value: "scheduled", label: "Scheduled" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" }
] as const;

const CREW_VIEW_OPTIONS = [
  { value: "all", label: "All crew states" },
  { value: "assigned", label: "Crew assigned" },
  { value: "unassigned", label: "Needs crew" }
] as const;

const SCHEDULE_LAYOUT_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "crew", label: "Crew" },
  { value: "unscheduled", label: "Unscheduled" }
] as const;

const SCHEDULE_ITEM_VIEW_OPTIONS = [
  { value: "all", label: "All" },
  { value: "jobs", label: "Jobs" },
  { value: "appointments", label: "Appointments" }
] as const;

const DAY_TIMELINE_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const MOVE_PREVIEW_TIME_BUCKETS = [
  { startTime: "08:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "12:00" },
  { startTime: "13:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "17:00" }
] as const;

const schedulePrimaryActionToneClassName =
  "border-[var(--graphite)] bg-[var(--graphite)] text-white hover:bg-[var(--graphite-light)]";
const scheduleSecondaryActionToneClassName =
  "border-[var(--border-warm)] bg-white text-[var(--text-primary)] hover:bg-[var(--highlight)]";
const scheduleMutedActionToneClassName =
  "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)] hover:bg-white";
const schedulePanelClassName =
  "rounded-[6px] border border-[var(--border-warm)] bg-white shadow-sm";
const schedulePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 sm:px-6";
const scheduleInsetPanelClassName =
  "rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3";
const scheduleFieldClassName =
  "min-w-0 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]";
const scheduleFilterChipClassName =
  "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition";
const scheduleCompactLinkClassName =
  "inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]";

type RawScheduleSearchParams = {
  q?: string | string[];
  projectId?: string | string[];
  view?: string | string[];
  crew?: string | string[];
  layout?: string | string[];
  item?: string | string[];
  date?: string | string[];
  action?: string | string[];
  jobId?: string | string[];
  moveTarget?: string | string[];
  moveDate?: string | string[];
  moveStart?: string | string[];
  moveEnd?: string | string[];
  error?: string | string[];
  message?: string | string[];
};

type SchedulePageProps = {
  searchParams?: Promise<RawScheduleSearchParams>;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatCommercialReadinessStatus(value: string) {
  switch (value) {
    case "ready_to_schedule":
      return "Ready to schedule";
    case "waiting_on_estimate_approval":
      return "Waiting on estimate approval";
    case "waiting_on_contract":
      return "Waiting on contract";
    case "waiting_on_signature":
      return "Waiting on signature";
    case "waiting_on_deposit":
      return "Waiting on deposit";
    case "waiting_on_financing":
      return "Waiting on financing";
    case "blocked":
      return "Blocked";
    default:
      return formatStatusLabel(value);
  }
}

function formatReadinessBlockerLabel(blocker: string) {
  switch (blocker) {
    case "site_assessment_incomplete":
      return "Site assessment incomplete";
    case "estimate_not_approved":
      return "Estimate approval missing";
    case "contract_missing":
      return "Contract missing";
    case "contract_internal_approval_pending":
      return "Contract approval pending";
    case "contract_signature_pending":
      return "Unsigned contract";
    case "deposit_required":
      return "Unpaid deposit";
    case "payment_requirement_unsatisfied":
      return "Payment requirement open";
    case "financing_pending":
      return "Financing pending";
    case "financing_declined":
      return "Financing declined";
    default:
      return formatStatusLabel(blocker);
  }
}

function getReadinessBlockerHref(
  blocker: string,
  readiness: ProjectFinancialReadinessSnapshot | null | undefined,
  projectId: string
) {
  switch (blocker) {
    case "estimate_not_approved":
      return readiness?.estimateId
        ? `/estimates/${readiness.estimateId}`
        : null;
    case "contract_missing":
    case "contract_internal_approval_pending":
    case "contract_signature_pending":
      return readiness?.contractId
        ? `/contracts/${readiness.contractId}`
        : null;
    case "deposit_required":
      return readiness?.depositInvoiceId
        ? `/invoices/${readiness.depositInvoiceId}`
        : `/invoices?projectId=${projectId}&workflowRole=deposit`;
    case "payment_requirement_unsatisfied":
      return readiness?.activePaymentRequirementInvoiceId
        ? `/invoices/${readiness.activePaymentRequirementInvoiceId}`
        : `/projects/${projectId}#project-readiness-blockers`;
    case "site_assessment_incomplete":
      return readiness?.opportunityId
        ? `/leads/${readiness.opportunityId}`
        : null;
    case "financing_pending":
    case "financing_declined":
      return `/projects/${projectId}#project-details`;
    default:
      return null;
  }
}

function getReadinessBlockerDetail(
  blocker: string,
  readiness: ProjectFinancialReadinessSnapshot | null | undefined
) {
  switch (blocker) {
    case "estimate_not_approved":
      return readiness?.estimateStatus
        ? `Estimate is ${formatStatusLabel(readiness.estimateStatus)}.`
        : "Approve the project estimate before scheduling.";
    case "contract_missing":
      return "Generate the project contract from approved scope.";
    case "contract_internal_approval_pending":
      return "Clear internal contract approval before the schedule handoff.";
    case "contract_signature_pending":
      return readiness?.contractStatus
        ? `Contract is ${formatStatusLabel(readiness.contractStatus)}.`
        : "Complete signature before production scheduling.";
    case "deposit_required":
      return readiness?.depositInvoiceStatus
        ? `Deposit invoice is ${formatStatusLabel(readiness.depositInvoiceStatus)}.`
        : "Create or collect the required deposit invoice.";
    case "payment_requirement_unsatisfied":
      return readiness?.activePaymentRequirementInvoiceStatus
        ? `Payment requirement invoice is ${formatStatusLabel(readiness.activePaymentRequirementInvoiceStatus)}.`
        : "Collect the schedule-blocking contract payment requirement.";
    case "site_assessment_incomplete":
      return "Complete the linked site assessment.";
    case "financing_pending":
      return "Financing must be approved before scheduling.";
    case "financing_declined":
      return "Resolve declined financing before committing work.";
    default:
      return "Resolve this project readiness blocker.";
  }
}

function getScheduleJobTitle(job: {
  project?: { name: string } | null;
  serviceTicket?: { title: string; ticketType: string } | null;
}) {
  return job.serviceTicket?.title ?? job.project?.name ?? "Untitled job";
}

function getScheduleJobSubtitle(job: {
  customer?: { name: string } | null;
  estimate?: { referenceNumber: string } | null;
  serviceTicket?: { ticketType: string } | null;
}) {
  const serviceContext = job.serviceTicket
    ? `${formatStatusLabel(job.serviceTicket.ticketType)} service`
    : null;

  return [
    job.customer?.name ?? "Unknown customer",
    serviceContext ?? job.estimate?.referenceNumber ?? "Project-based work"
  ].join(" · ");
}

function formatDate(value: string | null) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    : "Unscheduled";
}

function formatDateTime(value: string | null) {
  return value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    : "Time not set";
}

function formatShortDateFromDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatLongDateFromDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatMonthDayYear(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatHourLabel(hour: number) {
  const normalizedHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? "PM" : "AM";
  return `${normalizedHour}:00 ${meridiem}`;
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const result = new Date(year, month - 1, day);
  result.setHours(0, 0, 0, 0);

  return Number.isNaN(result.getTime()) ? null : result;
}

function formatAssignmentLabel(count: number) {
  return `${count} assignment${count === 1 ? "" : "s"}`;
}

function formatWarningCount(count: number) {
  return `${count} warning${count === 1 ? "" : "s"}`;
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

function toDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function startOfWeek(value: Date) {
  return addDays(value, -value.getDay());
}

function isDateInRange(value: string | null, rangeStart: Date, rangeEnd: Date) {
  if (!value) {
    return false;
  }

  const date = toDate(value);

  return date !== null && date >= rangeStart && date <= rangeEnd;
}

function getSingleSearchParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeOptionalSearchParam(value?: string | string[]) {
  const normalized = getSingleSearchParamValue(value)?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeScheduleView(value?: string | string[]): ScheduleViewKey {
  switch (normalizeOptionalSearchParam(value)) {
    case "unscheduled":
    case "scheduled":
    case "today":
    case "upcoming":
    case "in_progress":
    case "completed":
      return normalizeOptionalSearchParam(value) as Exclude<
        ScheduleViewKey,
        "all"
      >;
    default:
      return "all";
  }
}

function normalizeCrewView(value?: string | string[]): CrewViewKey {
  switch (normalizeOptionalSearchParam(value)) {
    case "assigned":
    case "unassigned":
      return normalizeOptionalSearchParam(value) as Exclude<CrewViewKey, "all">;
    default:
      return "all";
  }
}

function normalizeScheduleAction(
  value?: string | string[]
): ScheduleActionKey | undefined {
  const normalized = normalizeOptionalSearchParam(value);
  return normalized === "schedule" || normalized === "assign"
    ? normalized
    : undefined;
}

function normalizeScheduleLayout(value?: string | string[]): ScheduleLayoutKey {
  switch (normalizeOptionalSearchParam(value)) {
    case "day":
      return "day";
    case "crew":
      return "crew";
    case "unscheduled":
      return "unscheduled";
    case "board":
      return "crew";
    case "week":
      return "week";
    default:
      return "week";
  }
}

function normalizeScheduleItemView(
  value?: string | string[]
): ScheduleItemViewKey {
  switch (normalizeOptionalSearchParam(value)) {
    case "jobs":
    case "appointments":
      return normalizeOptionalSearchParam(value) as Exclude<
        ScheduleItemViewKey,
        "all"
      >;
    default:
      return "all";
  }
}

function normalizeScheduleDate(
  value: string | string[] | undefined,
  fallbackDateKey: string
) {
  const normalized = normalizeOptionalSearchParam(value);

  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return fallbackDateKey;
  }

  return parseDateKey(normalized) ? normalized : fallbackDateKey;
}

function normalizeScheduleSearchParams(
  searchParams: RawScheduleSearchParams | undefined,
  fallbackDateKey: string
) {
  return {
    q: normalizeOptionalSearchParam(searchParams?.q) ?? "",
    projectId: normalizeOptionalSearchParam(searchParams?.projectId) ?? null,
    view: normalizeScheduleView(searchParams?.view),
    crew: normalizeCrewView(searchParams?.crew),
    layout: normalizeScheduleLayout(searchParams?.layout),
    item: normalizeScheduleItemView(searchParams?.item),
    date: normalizeScheduleDate(searchParams?.date, fallbackDateKey),
    action: normalizeScheduleAction(searchParams?.action),
    jobId: normalizeOptionalSearchParam(searchParams?.jobId) ?? null,
    moveTarget: normalizeOptionalSearchParam(searchParams?.moveTarget),
    moveDate: normalizeOptionalSearchParam(searchParams?.moveDate),
    moveStart: normalizeOptionalSearchParam(searchParams?.moveStart),
    moveEnd: normalizeOptionalSearchParam(searchParams?.moveEnd),
    error: normalizeOptionalSearchParam(searchParams?.error),
    message: normalizeOptionalSearchParam(searchParams?.message)
  };
}

function getScheduleListEmptyState(input: {
  jobCount: number;
  query: string;
  projectName: string | null;
  view: ScheduleViewKey;
  crew: CrewViewKey;
}) {
  if (input.jobCount === 0) {
    return {
      eyebrow: "No jobs yet",
      title: "Jobs will feed this schedule surface",
      description:
        "CrewBoard starts when work reaches the job/schedule stage. Create or clear the upstream project, estimate, contract, deposit, or financing work first, then jobs will appear here."
    };
  }

  if (input.query.length > 0) {
    return {
      eyebrow: "No matching scheduled work",
      title: "No jobs match this search yet",
      description:
        "Try a broader search or clear the search term to return to the full schedule surface."
    };
  }

  if (input.projectName) {
    return {
      eyebrow: "No matching project work",
      title: `No jobs match ${input.projectName} right now`,
      description:
        "This project filter only reads jobs already attached to that project. If work is missing, open the Project Workspace to see whether estimate/contract readiness or job creation is still blocking scheduling."
    };
  }

  if (input.crew === "assigned") {
    return {
      eyebrow: "No assigned crew work",
      title: "No jobs match the assigned-crew filter",
      description:
        "Switch back to all crew states or review jobs that still need people or labor vendors attached. Crew assignment stays on the same job after the schedule handoff is real."
    };
  }

  if (input.crew === "unassigned") {
    return {
      eyebrow: "No unassigned work",
      title: "No jobs currently need crew assignment",
      description:
        "This filter surfaces scheduled job records that still need people or labor-provider vendors attached. Upstream project readiness is not changed from here."
    };
  }

  if (input.view === "unscheduled") {
    return {
      eyebrow: "No jobs need scheduling",
      title: "No jobs are waiting on scheduling",
      description:
        "As Ready Check-approved projects create jobs without committed dates, they will surface here. If expected work is missing, open the Project Workspace to review GateKeeper."
    };
  }

  if (input.view === "today") {
    return {
      eyebrow: "No work today",
      title: "Nothing is scheduled for today",
      description:
        "Once jobs carry a real date commitment for today, they will appear here as the immediate operating queue."
    };
  }

  if (input.view === "scheduled") {
    return {
      eyebrow: "No scheduled work",
      title: "No jobs have a schedule commitment yet",
      description:
        "Jobs appear here only after a real date commitment is saved. Jobs without dates stay in Needs Scheduling."
    };
  }

  if (input.view === "upcoming") {
    return {
      eyebrow: "No upcoming work",
      title: "Nothing is queued beyond today yet",
      description:
        "Future date commitments will show up here once the next scheduled work is captured on the same job records."
    };
  }

  if (input.view === "in_progress") {
    return {
      eyebrow: "No live work",
      title: "No jobs are marked in progress",
      description:
        "Jobs move into this view when field work is actively underway on the shared execution chain."
    };
  }

  if (input.view === "completed") {
    return {
      eyebrow: "No completed work",
      title: "No recently completed jobs match this view",
      description:
        "Jobs that are marked completed will appear here for quick schedule closeout review."
    };
  }

  return {
    eyebrow: "No matching scheduled work",
    title: "Adjust the schedule filters",
    description:
      "Try a broader search or switch schedule and crew views to find the operational record you need."
  };
}

function getActionDescription(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

function getCrewState(job: {
  dispatchStatus: string;
  assignmentCount: number;
  crewSummary: string[];
  crewVendor?: { name: string } | null;
}) {
  if (job.assignmentCount > 0) {
    return {
      label: "Assigned",
      detail:
        job.crewSummary.length > 0
          ? job.crewSummary.join(", ")
          : (job.crewVendor?.name ??
            formatAssignmentLabel(job.assignmentCount)),
      emphasisClass: "text-emerald-700",
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (job.dispatchStatus === "unscheduled") {
    return {
      label: "Needs Scheduling",
      detail:
        "Choose a date and time before assigning people or labor-provider vendors.",
      emphasisClass: "text-amber-700",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: "Crew not assigned",
    detail: "Assign a crew or labor-provider vendor before production starts.",
    emphasisClass: "text-rose-700",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700"
  };
}

function getPrimaryScheduleAction(job: {
  id: string;
  dispatchStatus: string;
  assignmentCount: number;
}) {
  if (job.dispatchStatus === "unscheduled") {
    return {
      label: "Schedule job",
      action: "schedule" as const,
      toneClass: schedulePrimaryActionToneClassName
    };
  }

  if (job.assignmentCount === 0) {
    return {
      label: "Assign crew",
      action: "assign" as const,
      toneClass: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
    };
  }

  return {
    label: "Refine schedule",
    action: "schedule" as const,
    toneClass: scheduleSecondaryActionToneClassName
  };
}

function getBoardDatePresentation(value: string, today: Date) {
  const date = new Date(`${value}T00:00:00`);
  const tomorrow = addDays(today, 1);
  const shortLabel = formatShortDateFromDate(date);

  if (date.getTime() === today.getTime()) {
    return {
      title: "Today",
      subtitle: shortLabel,
      isToday: true,
      isTomorrow: false
    };
  }

  if (date.getTime() === tomorrow.getTime()) {
    return {
      title: "Tomorrow",
      subtitle: shortLabel,
      isToday: false,
      isTomorrow: true
    };
  }

  return {
    title: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }),
    subtitle: shortLabel,
    isToday: false,
    isTomorrow: false
  };
}

function getBoardPrimaryAction(job: {
  id: string;
  dispatchStatus: string;
  assignmentCount: number;
}) {
  const primaryAction = getPrimaryScheduleAction(job);

  if (
    primaryAction.action === "schedule" &&
    job.dispatchStatus !== "unscheduled"
  ) {
    return {
      ...primaryAction,
      label: "Reschedule",
      toneClass: scheduleMutedActionToneClassName
    };
  }

  return primaryAction;
}

function getBoardCardState(job: {
  dispatchStatus: string;
  assignmentCount: number;
  crewSummary: string[];
  crewVendor?: { name: string } | null;
}) {
  const crewState = getCrewState(job);

  if (job.dispatchStatus === "in_progress") {
    return {
      eyebrow: "In progress",
      title: "Field work is already active",
      summary:
        job.assignmentCount > 0
          ? `Crew in place: ${crewState.detail}`
          : "Execution is active, but crew assignment still needs to be confirmed on the shared job."
    };
  }

  if (job.dispatchStatus === "unscheduled") {
    return {
      eyebrow: "Ready to schedule",
      title: "Waiting on first date commitment",
      summary:
        "This job is in the schedule queue. Set the first calendar date to move it onto CrewBoard."
    };
  }

  if (job.assignmentCount === 0) {
    return {
      eyebrow: "Scheduled / no crew",
      title: "Date is committed, but crew is still open",
      summary:
        "This job is already on the calendar. Attach people or a labor vendor through the existing crew action path to make it field-ready."
    };
  }

  return {
    eyebrow: "Scheduled / crewed",
    title: "Calendar and crew are both in place",
    summary: `Crew in place: ${crewState.detail}`
  };
}

function getScheduleReadinessBadge(input: {
  dispatchStatus: string;
  assignmentCount: number;
  warningCount: number;
}) {
  if (input.dispatchStatus === "in_progress") {
    return {
      label: "In progress",
      className:
        "border-[var(--copper)] bg-[var(--highlight)] text-[var(--text-primary)]"
    };
  }

  if (input.dispatchStatus === "unscheduled") {
    return {
      label: "Ready to schedule",
      className: "border-amber-200 bg-amber-50 text-amber-800"
    };
  }

  if (
    input.dispatchStatus !== "completed" &&
    (input.assignmentCount === 0 || input.warningCount > 0)
  ) {
    return {
      label: "Needs readiness review",
      className: "border-rose-200 bg-rose-50 text-rose-700"
    };
  }

  if (input.dispatchStatus === "completed") {
    return {
      label: "Recently done",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  return {
    label: "Scheduled",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  };
}

function getScheduleReadinessReviewMeta(input: {
  dispatchStatus: string;
  assignmentCount: number;
  warningCount: number;
}) {
  if (input.assignmentCount === 0 && input.dispatchStatus !== "completed") {
    return "Date exists, crew assignment is still open";
  }

  if (input.warningCount > 0) {
    return formatWarningCount(input.warningCount);
  }

  return "Open project readiness context";
}

function getBoardCardSurfaceClass(job: {
  dispatchStatus: string;
  assignmentCount: number;
}) {
  if (job.dispatchStatus === "in_progress") {
    return "border-[var(--copper)] bg-[var(--highlight)]";
  }

  if (job.dispatchStatus === "unscheduled") {
    return "border-amber-200 bg-amber-50/45";
  }

  if (job.assignmentCount === 0) {
    return "border-rose-200 bg-rose-50/35";
  }

  return "border-emerald-200 bg-emerald-50/30";
}

function getBoardLaneMeta(group: {
  key: string;
  jobs: Array<{
    dispatchStatus: string;
    assignmentCount: number;
  }>;
}) {
  if (group.jobs.length === 0) {
    return "No jobs";
  }

  if (group.key === "unscheduled-ready") {
    return `${group.jobs.length} waiting on first date`;
  }

  if (group.key === "in-progress") {
    const missingCrewCount = group.jobs.filter(
      (job) => job.assignmentCount === 0
    ).length;
    return missingCrewCount > 0
      ? `${group.jobs.length - missingCrewCount} crewed · ${missingCrewCount} missing crew`
      : `${group.jobs.length} live`;
  }

  const crewedCount = group.jobs.filter(
    (job) => job.assignmentCount > 0
  ).length;
  const missingCrewCount = group.jobs.length - crewedCount;

  if (missingCrewCount === 0) {
    return `${crewedCount} crewed`;
  }

  if (crewedCount === 0) {
    return `${missingCrewCount} missing crew`;
  }

  return `${crewedCount} crewed · ${missingCrewCount} missing crew`;
}

function getScheduleSurfaceClass(job: {
  dispatchStatus: string;
  assignmentCount: number;
}) {
  if (job.dispatchStatus === "in_progress") {
    return "border-[var(--copper)] bg-[var(--highlight)]";
  }

  if (job.dispatchStatus === "unscheduled") {
    return "border-amber-200 bg-amber-50/35";
  }

  if (job.assignmentCount === 0) {
    return "border-rose-200 bg-rose-50/30";
  }

  return "border-emerald-200 bg-emerald-50/25";
}

function ScheduleJobStateBadges(input: {
  crewState: {
    label: string;
    badgeClass: string;
  };
  dispatchStatus?: string;
  includeDispatchStatus?: boolean;
  justifyEnd?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap gap-2 ${input.justifyEnd ? "justify-end" : "items-center"}`}
    >
      {input.includeDispatchStatus && input.dispatchStatus ? (
        <span
          className={[
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
            getDispatchStatusBadgeClass(input.dispatchStatus)
          ].join(" ")}
        >
          {formatStatusLabel(input.dispatchStatus)}
        </span>
      ) : null}
      <span
        className={[
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
          input.crewState.badgeClass
        ].join(" ")}
      >
        {input.crewState.label}
      </span>
    </div>
  );
}

function getDispatchAttentionToneClassName(
  tone: ScheduleDispatchAttentionTone
) {
  switch (tone) {
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function buildScheduleOperationalIndicators(input: {
  job: {
    id: string;
    projectId: string;
    project: {
      onsiteRepPersonId: string | null;
      relationshipOwnerPersonId: string | null;
    } | null;
    dispatchStatus: string;
    scheduledDate: string | null;
    assignmentCount: number;
  };
  roleSlotPeople: Array<{
    id: string;
    displayName: string;
  }>;
  readiness: ProjectFinancialReadinessSnapshot | null | undefined;
  warnings: ScheduleWarningSummary[];
  todayDateKey: string;
}) {
  const indicators: ScheduleOperationalIndicator[] = [];

  if (input.readiness) {
    if (input.readiness.isReadyToSchedule) {
      indicators.push({
        id: "commercial-ready",
        label: "Ready to schedule",
        detail: formatCommercialReadinessStatus(input.readiness.status),
        href: `/projects/${input.job.projectId}`,
        tone: "ready"
      });
    } else {
      for (const blocker of input.readiness.blockers.slice(0, 3)) {
        indicators.push({
          id: `blocker:${blocker}`,
          label: formatReadinessBlockerLabel(blocker),
          detail: getReadinessBlockerDetail(blocker, input.readiness),
          href: getReadinessBlockerHref(
            blocker,
            input.readiness,
            input.job.projectId
          ),
          tone: "blocked"
        });
      }
    }
  }

  if (
    input.job.dispatchStatus !== "unscheduled" &&
    input.job.dispatchStatus !== "completed" &&
    input.job.assignmentCount === 0
  ) {
    indicators.push({
      id: "missing-crew",
      label: "Missing crew",
      detail: "Assign people or a labor-provider vendor.",
      href: buildScheduleHref({
        view: "scheduled",
        crew: "unassigned",
        action: "assign",
        jobId: input.job.id
      }),
      tone: "warning"
    });
  }

  if (
    input.job.dispatchStatus === "in_progress" ||
    input.job.scheduledDate === input.todayDateKey
  ) {
    indicators.push({
      id: "daily-log",
      label:
        input.job.dispatchStatus === "in_progress"
          ? "Daily log check"
          : "Daily log ready",
      detail: "Open or start field execution continuity.",
      href: buildDailyLogCaptureHref({
        projectId: input.job.projectId,
        jobId: input.job.id,
        logDate: input.job.scheduledDate
      }),
      tone: input.job.dispatchStatus === "in_progress" ? "warning" : "neutral"
    });
  }

  indicators.push(
    ...buildScheduleRoleSlotIndicators({
      project: input.job.project,
      people: input.roleSlotPeople,
      projectHref: `/projects/${input.job.projectId}`
    })
  );

  for (const warning of input.warnings.slice(0, 2)) {
    indicators.push({
      id: `warning:${warning.id}`,
      label: getScheduleWarningDisplayLabel(warning.kind),
      detail: warning.detail,
      tone: "warning"
    });
  }

  return indicators;
}

function getScheduledSortTime(job: {
  scheduledDate: string | null;
  scheduledStartAt: string | null;
}) {
  if (job.scheduledStartAt) {
    return new Date(job.scheduledStartAt).getTime();
  }

  if (job.scheduledDate) {
    return new Date(`${job.scheduledDate}T00:00:00`).getTime();
  }

  return 0;
}

function formatScheduleTimeWindow(job: {
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
}) {
  if (job.scheduledStartAt && job.scheduledEndAt) {
    const startLabel = new Date(job.scheduledStartAt).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
    const endLabel = new Date(job.scheduledEndAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });

    return `${startLabel} - ${endLabel}`;
  }

  if (job.scheduledStartAt) {
    return new Date(job.scheduledStartAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  return "Time not set";
}

function formatAppointmentTimeWindow(appointment: {
  startsAt: string;
  endsAt: string | null;
}) {
  const startLabel = new Date(appointment.startsAt).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  );

  if (!appointment.endsAt) {
    return startLabel;
  }

  const endLabel = new Date(appointment.endsAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${startLabel} - ${endLabel}`;
}

function formatScheduleItemTimeWindow(item: ScheduleItem) {
  if (item.type === "job") {
    return item.startsAt
      ? formatScheduleTimeWindow({
          scheduledStartAt: item.startsAt,
          scheduledEndAt: item.endsAt
        })
      : "Time not set";
  }

  return formatAppointmentTimeWindow({
    startsAt: item.startsAt,
    endsAt: item.endsAt
  });
}

function getDispatchStatusBadgeClass(status: string) {
  switch (status) {
    case "in_progress":
      return "border-[var(--copper)] bg-[var(--highlight)] text-[var(--accent-deep)]";
    case "scheduled":
      return "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)]";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getScheduleItemSurfaceClass(item: ScheduleItem) {
  if (item.type === "appointment") {
    return item.status === "scheduled"
      ? "border-[var(--border-warm)] bg-[var(--highlight)]"
      : "border-[var(--border-warm)] bg-[var(--highlight)]";
  }

  return "border-[var(--border-warm)] bg-white";
}

function getPlannerEmptyState(input: {
  layout: ScheduleLayoutKey;
  view: ScheduleViewKey;
  crew: CrewViewKey;
  query: string;
  rangeLabel: string;
}) {
  if (input.view === "unscheduled") {
    return {
      eyebrow: "Planner is date-based",
      title: "Current filters are showing only unscheduled work",
      description:
        "Needs Scheduling work has reached CrewBoard but has no date commitment yet. Open the queue or selected job action panel to set timing after the Ready Check."
    };
  }

  if (input.query.length > 0) {
    return {
      eyebrow: "No matching scheduled work",
      title: "No scheduled jobs match this search in the current planner range",
      description:
        "Broaden the search term or clear it to return to the full scheduling picture."
    };
  }

  if (input.crew === "assigned") {
    return {
      eyebrow: "No assigned-crew work",
      title: "This planner range has no jobs with crew attached",
      description:
        "Switch crew view back to all states or review unassigned work that still needs labor attached."
    };
  }

  if (input.crew === "unassigned") {
    return {
      eyebrow: "No missing-crew work",
      title: "No scheduled jobs in this range are waiting on crew",
      description:
        "The current planner range only includes jobs that already have people or labor-provider vendors attached. Crew state remains job-level schedule context."
    };
  }

  return {
    eyebrow:
      input.layout === "day" ? "No work on this day" : "No work in this range",
    title:
      input.layout === "day"
        ? "The selected day is open"
        : "The selected planner window is open",
    description: `Once jobs carry scheduled dates in ${input.rangeLabel}, they will appear here on top of the same job schedule fields.`
  };
}

function getCrewViewSummaryLabel(value: CrewViewKey) {
  switch (value) {
    case "assigned":
      return "Crew assigned";
    case "unassigned":
      return "Needs crew";
    default:
      return "All crew states";
  }
}

function getItemViewSummaryLabel(value: ScheduleItemViewKey) {
  switch (value) {
    case "jobs":
      return "Jobs";
    case "appointments":
      return "Appointments";
    default:
      return "All items";
  }
}

function getScheduleActionSummaryLabel(value: ScheduleActionKey) {
  return value === "assign" ? "Manage crew assignment" : "Refine schedule";
}

function getProjectFilterSummary(input: {
  project: { id: string; name: string } | null;
  projectId: string | null;
}) {
  if (input.project) {
    return {
      title: input.project.name,
      detail: "Only jobs attached to this project are shown."
    };
  }

  return {
    title: "Project-scoped schedule view",
    detail: input.projectId
      ? "This schedule handoff is scoped to one project."
      : "Project filter is not active."
  };
}

function ScheduleFilterChip(input: {
  label: string;
  value: ReactNode;
  clearHref: string;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-secondary)]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
        {input.label}
      </span>
      <span className="font-medium text-[var(--text-primary)]">
        {input.value}
      </span>
      <Link
        href={input.clearHref}
        className="inline-flex items-center rounded-[4px] border border-transparent px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        Clear
      </Link>
    </div>
  );
}

// Legacy helper retained temporarily while the board polish settles.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatBoardDateLabel(value: string, today: Date) {
  const date = new Date(`${value}T00:00:00`);
  const tomorrow = addDays(today, 1);
  const label = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  if (date.getTime() === today.getTime()) {
    return `Today · ${label}`;
  }

  if (date.getTime() === tomorrow.getTime()) {
    return `Tomorrow · ${label}`;
  }

  return label;
}

export default async function SchedulePage({
  searchParams
}: SchedulePageProps) {
  const today = startOfToday();
  const todayDateKey = toDateKey(today);
  const resolvedSearchParams = normalizeScheduleSearchParams(
    await searchParams,
    todayDateKey
  );
  const user = await requireAuthenticatedUser("/schedule");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Scheduling needs an active organization before jobs can be reviewed.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [
    jobs,
    appointments,
    scheduleOpportunityAssessments,
    assignablePeople,
    laborVendors
  ] = await Promise.all([
    listScheduleJobs(),
    listScheduleAppointments(),
    listScheduleOpportunityAssessments(),
    listScheduleAssignablePeople(),
    listScheduleLaborVendors()
  ]);
  const assignmentsByJobId = await listScheduleJobAssignmentsByJobIds(
    jobs.map((job) => job.id)
  );

  const tomorrow = addDays(today, 1);
  const upcomingHorizon = addDays(today, 8);
  const scheduleLayout = resolvedSearchParams.layout;
  const isGroupedScheduleLayout =
    scheduleLayout === "crew" || scheduleLayout === "unscheduled";
  const plannerDateKey = resolvedSearchParams.date;
  const plannerAnchorDate = parseDateKey(plannerDateKey) ?? today;
  const plannerRangeStart =
    scheduleLayout === "day"
      ? plannerAnchorDate
      : startOfWeek(plannerAnchorDate);
  const plannerRangeEnd =
    scheduleLayout === "day"
      ? plannerAnchorDate
      : addDays(plannerRangeStart, 6);
  const plannerStepDays = scheduleLayout === "day" ? 1 : 7;

  const query = resolvedSearchParams.q;
  const normalizedQuery = query.toLowerCase();
  const projectFilterId = resolvedSearchParams.projectId;
  const view = resolvedSearchParams.view;
  const crewFilter = resolvedSearchParams.crew;
  const itemFilter = resolvedSearchParams.item;
  const selectedAction = resolvedSearchParams.action;
  const explicitSelectedJobId = resolvedSearchParams.jobId;

  const jobsWithAssignments = jobs.map((job) => {
    const assignments = assignmentsByJobId.get(job.id) ?? [];
    const scheduledDate = toDate(job.scheduledDate);
    const isToday = scheduledDate
      ? scheduledDate.getTime() === today.getTime()
      : false;
    const isUpcoming =
      scheduledDate !== null &&
      scheduledDate >= tomorrow &&
      scheduledDate < upcomingHorizon;

    return {
      ...job,
      assignments,
      assignmentCount: assignments.length,
      crewLeads: assignments
        .filter((assignment) => assignment.role === "lead")
        .map(
          (assignment) =>
            assignment.person?.displayName ??
            assignment.vendor?.name ??
            "Lead assignment"
        ),
      crewSummary: assignments
        .slice(0, 2)
        .map(
          (assignment) =>
            assignment.person?.displayName ??
            assignment.vendor?.name ??
            "Crew assignment"
        ),
      isToday,
      isUpcoming
    };
  });
  const fieldHandoffsByJobId = await listScheduleFieldHandoffsByJobIds({
    jobs: jobsWithAssignments.map((job) => ({
      id: job.id,
      projectId: job.projectId,
      scheduledDate: job.scheduledDate,
      dispatchStatus: job.dispatchStatus,
      assignmentCount: job.assignmentCount,
      title: getScheduleJobTitle(job),
      customerName: job.customer?.name ?? null,
      projectName: job.project?.name ?? null
    })),
    todayDateKey
  });
  const fieldHandoffCommandView = buildScheduleFieldHandoffCommandView({
    handoffs: fieldHandoffsByJobId.values()
  });
  const projectReadinessByProjectId =
    await getDashboardProjectFinancialReadinessSummaries({
      organizationId: organizationContext.organization.id,
      projectIds: jobsWithAssignments.map((job) => job.projectId)
    });
  const scheduleWarningJobs = jobsWithAssignments.map((job) => ({
    id: job.id,
    title: getScheduleJobTitle(job),
    dispatchStatus: job.dispatchStatus,
    scheduledDate: job.scheduledDate,
    scheduledStartAt: job.scheduledStartAt,
    scheduledEndAt: job.scheduledEndAt,
    crewVendorId: job.crewVendorId,
    crewVendor: job.crewVendor,
    assignments: job.assignments.map((assignment) => ({
      personId: assignment.personId,
      vendorId: assignment.vendorId,
      person: assignment.person
        ? { displayName: assignment.person.displayName }
        : null,
      vendor: assignment.vendor ? { name: assignment.vendor.name } : null
    }))
  }));
  const scheduleWarningSummaries =
    deriveScheduleWarningSummaries(scheduleWarningJobs);
  const scheduleResourceLoadSummaries =
    deriveScheduleResourceLoadSummaries(scheduleWarningJobs);
  const scheduleWarningsByJobId = new Map(
    scheduleWarningSummaries.map((summary) => [summary.jobId, summary.warnings])
  );
  const activeProjectFilter = projectFilterId
    ? (jobsWithAssignments.find((job) => job.projectId === projectFilterId)
        ?.project ??
      appointments.find(
        (appointment) => appointment.projectId === projectFilterId
      )?.project ??
      null)
    : null;
  const activeProjectSummary = getProjectFilterSummary({
    project: activeProjectFilter
      ? { id: activeProjectFilter.id, name: activeProjectFilter.name }
      : null,
    projectId: projectFilterId
  });

  const scheduleBoard = buildScheduleBoardReadModel({
    jobs: jobsWithAssignments,
    today,
    readinessByProjectId: projectReadinessByProjectId,
    warningSummaries: scheduleWarningSummaries
  });
  const dispatchBoardSections = buildScheduleDispatchBoardSections({
    board: scheduleBoard,
    readinessByProjectId: projectReadinessByProjectId,
    warningSummaries: scheduleWarningSummaries
  });
  const fieldCommandCenterSections = buildFieldCommandCenterSections({
    board: scheduleBoard,
    readinessByProjectId: projectReadinessByProjectId,
    warningSummaries: scheduleWarningSummaries,
    handoffsByJobId: fieldHandoffsByJobId
  });
  const getDispatchBoardSection = (
    key: (typeof dispatchBoardSections)[number]["key"]
  ) => dispatchBoardSections.find((section) => section.key === key);
  const todayDispatchSection = getDispatchBoardSection("today");
  const upcomingDispatchSection = getDispatchBoardSection("upcoming");
  const unscheduledDispatchSection = getDispatchBoardSection("unscheduled");
  const inProgressDispatchSection = getDispatchBoardSection("in_progress");
  const unscheduledJobs = scheduleBoard.unscheduledReadyJobs;
  const blockedUnscheduledJobs = scheduleBoard.unscheduledBlockedJobs;
  const overdueSchedulingJobs = scheduleBoard.overdueSchedulingJobs;
  const totalUnscheduledJobs =
    unscheduledJobs.length + blockedUnscheduledJobs.length;
  const scheduledTodayJobs = scheduleBoard.scheduledTodayJobs;
  const tomorrowJobs = scheduleBoard.tomorrowJobs;
  const thisWeekJobs = scheduleBoard.thisWeekJobs;
  const inProgressJobs = scheduleBoard.inProgressJobs;
  const upcomingJobs = scheduleBoard.upcomingJobs;
  const assignedJobs = scheduleBoard.assignedJobs;
  const missingCrewJobs = scheduleBoard.crewAssignmentGaps;
  const needsReadinessReviewJobs = scheduleBoard.needsReadinessReviewJobs;
  const recentlyCompletedJobs = scheduleBoard.recentlyCompletedJobs;
  const todayWithoutCrewJobs = scheduleBoard.todayWithoutCrewJobs;
  const pastScheduledIncompleteJobs = scheduleBoard.pastScheduledIncompleteJobs;
  const capacityWarningJobs = scheduleBoard.capacityWarningJobs;
  const agingUnscheduledReadyJobs = scheduleBoard.agingUnscheduledReadyJobs;
  const dispatchAttentionItems = scheduleBoard.dispatchAttentionItems;
  const activeTodayJobs = scheduleBoard.activeTodayJobs;
  const scheduledJobs = scheduleBoard.scheduledJobs;
  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const appointmentOpportunityIds = new Set(
    scheduledAppointments
      .filter((appointment) => appointment.appointmentType === "site_visit")
      .map((appointment) => appointment.opportunityId)
      .filter(Boolean)
  );
  const opportunityAssessments = scheduleOpportunityAssessments.filter(
    (opportunity) => !appointmentOpportunityIds.has(opportunity.id)
  );
  const todayAppointments = scheduledAppointments.filter(
    (appointment) =>
      new Date(appointment.startsAt).toISOString().slice(0, 10) === todayDateKey
  );
  const upcomingAppointments = scheduledAppointments.filter((appointment) => {
    const dateKey = new Date(appointment.startsAt).toISOString().slice(0, 10);
    return dateKey > todayDateKey && dateKey < toDateKey(upcomingHorizon);
  });
  const latestScheduledJobs = scheduleBoard.latestScheduledJobs;

  const inferredSelectedJobs =
    selectedAction && !explicitSelectedJobId && projectFilterId
      ? jobsWithAssignments.filter((job) => {
          if (job.projectId !== projectFilterId) {
            return false;
          }

          if (selectedAction === "schedule") {
            return job.dispatchStatus === "unscheduled";
          }

          return (
            job.dispatchStatus !== "unscheduled" && job.assignmentCount === 0
          );
        })
      : [];
  const selectedJob = explicitSelectedJobId
    ? (jobsWithAssignments.find((job) => job.id === explicitSelectedJobId) ??
      null)
    : inferredSelectedJobs.length === 1
      ? inferredSelectedJobs[0]
      : null;
  const selectedJobId = selectedJob?.id ?? explicitSelectedJobId;
  const selectedJobAssignments = selectedJob
    ? (assignmentsByJobId.get(selectedJob.id) ?? [])
    : [];
  const showComposer =
    Boolean(selectedAction && selectedJob) ||
    Boolean(resolvedSearchParams.error);
  const selectedJobCrewState = selectedJob
    ? getCrewState({
        dispatchStatus: selectedJob.dispatchStatus,
        assignmentCount: selectedJobAssignments.length,
        crewSummary: selectedJobAssignments
          .slice(0, 2)
          .map(
            (assignment) =>
              assignment.person?.displayName ??
              assignment.vendor?.name ??
              "Crew assignment"
          ),
        crewVendor: selectedJob.crewVendor
      })
    : null;
  const selectedJobScheduleWarnings = selectedJob
    ? (scheduleWarningsByJobId.get(selectedJob.id) ?? [])
    : [];
  const selectedJobReadiness = selectedJob
    ? projectReadinessByProjectId.get(selectedJob.projectId)
    : null;
  const selectedJobOperationalIndicators = selectedJob
    ? buildScheduleOperationalIndicators({
        job: selectedJob,
        roleSlotPeople: assignablePeople,
        readiness: selectedJobReadiness,
        warnings: selectedJobScheduleWarnings,
        todayDateKey
      })
    : [];
  const selectedJobFieldHandoff = selectedJob
    ? (fieldHandoffsByJobId.get(selectedJob.id) ?? null)
    : null;
  const selectedJobFieldHandoffPacket = selectedJob
    ? buildScheduleFieldHandoffPacket({
        job: {
          id: selectedJob.id,
          projectId: selectedJob.projectId,
          scheduledDate: selectedJob.scheduledDate,
          scheduledStartAt: selectedJob.scheduledStartAt,
          scheduledEndAt: selectedJob.scheduledEndAt,
          scheduleNotes: selectedJob.scheduleNotes,
          dispatchStatus: selectedJob.dispatchStatus,
          assignmentCount: selectedJobAssignments.length,
          crewSummary: selectedJobAssignments
            .slice(0, 4)
            .map(
              (assignment) =>
                assignment.person?.displayName ??
                assignment.vendor?.name ??
                "Crew assignment"
            ),
          crewVendor: selectedJob.crewVendor,
          title: getScheduleJobTitle(selectedJob),
          customerName: selectedJob.customer?.name ?? null,
          projectName: selectedJob.project?.name ?? null,
          project: selectedJob.project,
          estimate: selectedJob.estimate,
          serviceTicket: selectedJob.serviceTicket
        },
        handoff: selectedJobFieldHandoff,
        readiness: selectedJobReadiness,
        warnings: selectedJobScheduleWarnings,
        people: assignablePeople
      })
    : null;
  const selectedJobNeedsScheduleBeforeCrew =
    selectedAction === "assign" &&
    selectedJob?.dispatchStatus === "unscheduled";
  const selectedJobEquipmentReadiness = selectedJob
    ? await getJobEquipmentReadinessSummary(selectedJob.id, "/schedule")
    : null;
  const selectedMoveTarget =
    selectedAction === "schedule"
      ? buildCrewBoardDropTargetFromSearch({
          moveTarget: resolvedSearchParams.moveTarget,
          moveDate: resolvedSearchParams.moveDate,
          moveStart: resolvedSearchParams.moveStart,
          moveEnd: resolvedSearchParams.moveEnd
        })
      : null;
  const selectedMoveProposal =
    selectedJob && selectedMoveTarget
      ? createCrewBoardMoveProposal(
          {
            id: selectedJob.id,
            dispatchStatus: selectedJob.dispatchStatus,
            scheduledDate: selectedJob.scheduledDate,
            scheduledStartAt: selectedJob.scheduledStartAt,
            scheduledEndAt: selectedJob.scheduledEndAt
          },
          selectedMoveTarget
        )
      : null;
  const selectedMoveProposalKey = [
    resolvedSearchParams.moveTarget ?? "",
    resolvedSearchParams.moveDate ?? "",
    resolvedSearchParams.moveStart ?? "",
    resolvedSearchParams.moveEnd ?? ""
  ].join(":");

  const visibleJobs = jobsWithAssignments.filter((job) => {
    const matchesProject = projectFilterId
      ? job.projectId === projectFilterId
      : true;
    const matchesView =
      view === "all"
        ? true
        : view === "unscheduled"
          ? job.dispatchStatus === "unscheduled"
          : view === "scheduled"
            ? job.scheduledDate !== null
            : view === "today"
              ? job.isToday
              : view === "upcoming"
                ? job.isUpcoming
                : view === "in_progress"
                  ? job.dispatchStatus === "in_progress"
                  : job.dispatchStatus === "completed";

    const matchesCrew =
      crewFilter === "all"
        ? true
        : crewFilter === "assigned"
          ? job.assignmentCount > 0
          : job.assignmentCount === 0;

    // When both projectId and q are present, keep the filter intersection strict so
    // project-scoped schedule handoff can still be narrowed further by text search.
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            job.project?.name ?? "",
            job.customer?.name ?? "",
            job.estimate?.referenceNumber ?? "",
            job.serviceTicket?.title ?? "",
            job.serviceTicket?.ticketType ?? "",
            job.crewVendor?.name ?? "",
            job.dispatchStatus,
            job.scheduledDate ?? "",
            ...job.crewSummary
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesProject && matchesView && matchesCrew && matchesQuery;
  });
  const visibleJobsById = new Map(visibleJobs.map((job) => [job.id, job]));
  const visibleScheduleWarningSummaries = scheduleWarningSummaries.filter(
    (summary) => visibleJobsById.has(summary.jobId)
  );
  const visibleScheduleWarningCount = visibleScheduleWarningSummaries.reduce(
    (total, summary) => total + summary.warnings.length,
    0
  );
  const visibleScheduleResourceLoadItems = scheduleResourceLoadSummaries
    .map((load) => {
      const loadJobs = load.jobIds
        .map((jobId) => visibleJobsById.get(jobId))
        .filter((job): job is NonNullable<typeof job> => Boolean(job));

      if (loadJobs.length < 2) {
        return null;
      }

      const tone: ScheduleResourceLoadPanelItem["tone"] =
        load.hasOverlap || load.hasIncompleteTiming ? "warning" : "neutral";

      return {
        id: load.id,
        dateLabel: formatDate(load.dateKey),
        resourceLabel: load.resourceLabel,
        jobCount: load.jobCount,
        detail: load.hasOverlap
          ? "This person or labor-provider vendor has overlapping scheduled windows."
          : load.hasIncompleteTiming
            ? "This person or labor-provider vendor appears on multiple jobs and at least one job needs complete timing."
            : "This person or labor-provider vendor appears on multiple jobs for the same day.",
        tone,
        jobs: loadJobs.map((job) => ({
          id: job.id,
          title: getScheduleJobTitle(job),
          href:
            buildCurrentScheduleHref({
              action: getPrimaryScheduleAction(job).action,
              jobId: job.id
            }) + "#schedule-action"
        }))
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .slice(0, 6);
  const visibleAppointments = appointments.filter((appointment) => {
    const appointmentDateKey = new Date(appointment.startsAt)
      .toISOString()
      .slice(0, 10);
    const matchesProject = projectFilterId
      ? appointment.projectId === projectFilterId
      : true;
    const matchesView =
      view === "all"
        ? true
        : view === "scheduled"
          ? appointment.status === "scheduled"
          : view === "today"
            ? appointmentDateKey === todayDateKey
            : view === "upcoming"
              ? appointmentDateKey > todayDateKey &&
                appointmentDateKey < toDateKey(upcomingHorizon)
              : view === "in_progress"
                ? false
                : view === "completed"
                  ? appointment.status === "completed"
                  : false;
    const matchesCrew =
      crewFilter === "all"
        ? true
        : crewFilter === "assigned"
          ? Boolean(appointment.assignedPersonId)
          : !appointment.assignedPersonId;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            appointment.title,
            appointment.appointmentType,
            appointment.status,
            appointment.customer?.name ?? "",
            appointment.project?.name ?? "",
            appointment.opportunity?.title ?? "",
            appointment.assignedPerson?.displayName ?? "",
            appointment.location ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesProject && matchesView && matchesCrew && matchesQuery;
  });
  const visibleOpportunityAssessments = opportunityAssessments.filter(
    (opportunity) => {
      const assessmentDateKey = opportunity.siteAssessmentScheduledAt
        ? new Date(opportunity.siteAssessmentScheduledAt)
            .toISOString()
            .slice(0, 10)
        : null;
      const matchesProject = projectFilterId
        ? opportunity.projectId === projectFilterId
        : true;
      const matchesView =
        view === "all"
          ? true
          : view === "scheduled"
            ? true
            : view === "today"
              ? assessmentDateKey === todayDateKey
              : view === "upcoming"
                ? Boolean(
                    assessmentDateKey &&
                    assessmentDateKey > todayDateKey &&
                    assessmentDateKey < toDateKey(upcomingHorizon)
                  )
                : false;
      const matchesCrew = crewFilter === "all" || crewFilter === "unassigned";
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : [
              opportunity.title,
              opportunity.status,
              opportunity.siteName ?? "",
              opportunity.customer?.name ?? "",
              opportunity.project?.name ?? "",
              opportunity.primaryContact?.displayName ?? ""
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesProject && matchesView && matchesCrew && matchesQuery;
    }
  );
  const visibleScheduleItems = buildScheduleItems({
    jobs: visibleJobs,
    appointments: visibleAppointments,
    opportunityAssessments: visibleOpportunityAssessments,
    rangeStart: plannerRangeStart,
    rangeEnd: plannerRangeEnd,
    itemFilter
  });
  const visibleListItems = buildScheduleItems({
    jobs: visibleJobs,
    appointments: visibleAppointments,
    opportunityAssessments: visibleOpportunityAssessments,
    rangeStart: addDays(today, -3650),
    rangeEnd: addDays(today, 365),
    itemFilter,
    includeUndatedJobs: true
  });

  const visibleScheduleBoard = buildScheduleBoardReadModel({
    jobs: visibleJobs,
    today,
    readinessByProjectId: projectReadinessByProjectId,
    warningSummaries: visibleScheduleWarningSummaries
  });
  const visibleOperatingModes = visibleScheduleBoard.operatingModeSummaries.map(
    (mode) => {
      const href =
        mode.key === "triage"
          ? buildScheduleHref({
              q: query,
              projectId: projectFilterId ?? undefined,
              view: "scheduled",
              crew: crewFilter,
              layout: "crew",
              date: plannerDateKey
            })
          : mode.key === "plan"
            ? buildScheduleHref({
                q: query,
                projectId: projectFilterId ?? undefined,
                view: "unscheduled",
                crew: crewFilter,
                layout: scheduleLayout,
                date: plannerDateKey
              })
            : buildScheduleHref({
                q: query,
                projectId: projectFilterId ?? undefined,
                view: "today",
                crew: crewFilter,
                layout: scheduleLayout,
                date: plannerDateKey
              });

      return {
        ...mode,
        href
      };
    }
  );
  const boardTimingGroups = [
    {
      key: "unscheduled-ready",
      title: "Needs Scheduling",
      description:
        "GateKeeper has let these jobs reach CrewBoard, but operations still needs to set the first real date commitment.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "unscheduled-ready"
        )?.jobs ?? [],
      emptyTitle: "No jobs need scheduling.",
      emptyDescription:
        "When Ready Check-approved jobs exist without a committed date, they will collect here first.",
      surfaceClass: "border-amber-200 bg-amber-50/45"
    },
    {
      key: "unscheduled-blocked",
      title: "Blocked / not ready",
      description:
        "These jobs exist, but the linked project readiness snapshot says scheduling should not proceed yet.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "unscheduled-blocked"
        )?.jobs ?? [],
      emptyTitle: "No unscheduled jobs are blocked by readiness.",
      emptyDescription:
        "If a job becomes commercially or financially blocked after creation, it stays visible here with links back to the source record.",
      surfaceClass: "border-rose-200 bg-rose-50/35"
    },
    {
      key: "today",
      title: "Today",
      description:
        "Use this lane to keep the immediate field picture visible without leaving the shared scheduling surface.",
      jobs:
        visibleScheduleBoard.timingGroups.find((group) => group.key === "today")
          ?.jobs ?? [],
      emptyTitle: "No jobs are scheduled for today.",
      emptyDescription:
        "Today's committed work will appear here once the job schedule fields are set.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "tomorrow",
      title: "Tomorrow",
      description:
        "Keep tomorrow's crew commitments visible before they become same-day blockers.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "tomorrow"
        )?.jobs ?? [],
      emptyTitle: "Nothing is lined up for tomorrow yet.",
      emptyDescription:
        "As soon as tomorrow's timing is captured on shared jobs, they will appear here.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "this-week",
      title: "This week",
      description:
        "This lane holds the next few scheduled days after tomorrow so the weekly field picture stays scannable.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "this-week"
        )?.jobs ?? [],
      emptyTitle: "No near-term scheduled work is queued after tomorrow.",
      emptyDescription:
        "This week's remaining scheduled jobs will gather here once the board moves beyond tomorrow.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "later-scheduled",
      title: "Later scheduled",
      description:
        "Longer-horizon commitments stay visible here without turning `/schedule` into a second planning system.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "later-scheduled"
        )?.jobs ?? [],
      emptyTitle: "No later scheduled work is on the board.",
      emptyDescription:
        "Farther-out commitments will appear here once the calendar extends past the next seven days.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "in-progress",
      title: "In progress",
      description:
        "Active field work stays separate so live execution remains visible even when schedule timing shifts.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "in-progress"
        )?.jobs ?? [],
      emptyTitle: "No jobs are marked in progress.",
      emptyDescription:
        "Once crews are actively executing work on jobs, those records will surface here.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "missing-crew",
      title: "Missing Crew",
      description:
        "Scheduled or active jobs with no person or labor-provider assignment stay visible here until crew is attached.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "missing-crew"
        )?.jobs ?? [],
      emptyTitle: "No scheduled jobs are missing crew.",
      emptyDescription:
        "CrewBoard will flag scheduled work here when the date exists but the crew assignment is still open.",
      surfaceClass: "border-rose-200 bg-rose-50/35"
    },
    {
      key: "recently-done",
      title: "Completed / Recently Done",
      description:
        "Completed jobs stay visible for schedule closeout and project handoff review.",
      jobs:
        visibleScheduleBoard.timingGroups.find(
          (group) => group.key === "recently-done"
        )?.jobs ?? [],
      emptyTitle: "No completed jobs are showing here yet.",
      emptyDescription:
        "Jobs marked completed will appear here from the same job records; full closeout remains in the Job and Project Workspaces.",
      surfaceClass: "border-emerald-200 bg-emerald-50/30"
    }
  ] as const;
  const plannerBoardGroups =
    scheduleLayout === "unscheduled"
      ? boardTimingGroups.filter((group) =>
          ["unscheduled-ready", "unscheduled-blocked"].includes(group.key)
        )
      : boardTimingGroups;
  let groupedPlannerJobCount = 0;

  for (const group of plannerBoardGroups) {
    groupedPlannerJobCount += group.jobs.length;
  }

  const plannerDays = Array.from(
    { length: scheduleLayout === "day" ? 1 : 7 },
    (_, index) => addDays(plannerRangeStart, index)
  ).map((date) => ({
    date,
    dateKey: toDateKey(date)
  }));

  const visibleScheduledJobs = visibleJobs
    .filter((job) =>
      isDateInRange(job.scheduledDate, plannerRangeStart, plannerRangeEnd)
    )
    .sort(
      (left, right) => getScheduledSortTime(left) - getScheduledSortTime(right)
    );
  const visiblePlannerAppointments = visibleScheduleItems.filter(
    (item) => item.type === "appointment"
  );
  const visibleScheduledJobsByDate = new Map<
    string,
    typeof visibleScheduledJobs
  >();
  const visiblePlannerAppointmentsByDate = new Map<
    string,
    typeof visiblePlannerAppointments
  >();

  for (const job of visibleScheduledJobs) {
    if (!job.scheduledDate) {
      continue;
    }

    const dateJobs = visibleScheduledJobsByDate.get(job.scheduledDate);

    if (dateJobs) {
      dateJobs.push(job);
    } else {
      visibleScheduledJobsByDate.set(job.scheduledDate, [job]);
    }
  }

  for (const appointment of visiblePlannerAppointments) {
    if (!appointment.dateKey) {
      continue;
    }

    const dateAppointments = visiblePlannerAppointmentsByDate.get(
      appointment.dateKey
    );

    if (dateAppointments) {
      dateAppointments.push(appointment);
    } else {
      visiblePlannerAppointmentsByDate.set(appointment.dateKey, [appointment]);
    }
  }

  const scheduledBoardGroups = plannerDays
    .map((day) => ({
      date: day.dateKey,
      jobs: visibleScheduledJobsByDate.get(day.dateKey) ?? [],
      appointments: visiblePlannerAppointmentsByDate.get(day.dateKey) ?? [],
      isToday: day.dateKey === todayDateKey
    }))
    .filter((group) => group.jobs.length > 0 || group.appointments.length > 0);
  const plannerJobCount = visibleScheduledJobs.length;
  const plannerAppointmentCount = visiblePlannerAppointments.length;
  const plannerItemCount = plannerJobCount + plannerAppointmentCount;
  const boardItemCount = isGroupedScheduleLayout
    ? groupedPlannerJobCount
    : plannerItemCount;
  const plannerNeedsCrewCount = visibleScheduledJobs.filter(
    (job) => job.assignmentCount === 0
  ).length;
  const plannerRangeLabel =
    scheduleLayout === "day"
      ? formatMonthDayYear(plannerRangeStart)
      : `${formatMonthDayYear(plannerRangeStart)} - ${formatMonthDayYear(plannerRangeEnd)}`;
  const plannerRangeDescription =
    scheduleLayout === "day"
      ? formatLongDateFromDate(plannerAnchorDate)
      : `${formatLongDateFromDate(plannerRangeStart)} through ${formatLongDateFromDate(plannerRangeEnd)}`;
  const plannerPrevHref = buildScheduleHref({
    q: query,
    projectId: projectFilterId ?? undefined,
    view,
    crew: crewFilter,
    layout: scheduleLayout,
    date: toDateKey(addDays(plannerAnchorDate, -plannerStepDays))
  });
  const plannerTodayHref = buildScheduleHref({
    q: query,
    projectId: projectFilterId ?? undefined,
    view,
    crew: crewFilter,
    layout: scheduleLayout,
    date: todayDateKey
  });
  const plannerNextHref = buildScheduleHref({
    q: query,
    projectId: projectFilterId ?? undefined,
    view,
    crew: crewFilter,
    layout: scheduleLayout,
    date: toDateKey(addDays(plannerAnchorDate, plannerStepDays))
  });
  const plannerEmptyState = getPlannerEmptyState({
    layout: scheduleLayout,
    view,
    crew: crewFilter,
    query,
    rangeLabel: plannerRangeDescription
  });
  const selectedDayGroup =
    scheduledBoardGroups.find((group) => group.date === plannerDateKey) ?? null;
  const selectedDayAppointments = selectedDayGroup?.appointments ?? [];
  const dayTimelineBuckets = DAY_TIMELINE_HOURS.map((hour) => ({
    hour,
    jobs:
      selectedDayGroup?.jobs.filter((job) => {
        if (!job.scheduledStartAt) {
          return false;
        }

        return new Date(job.scheduledStartAt).getHours() === hour;
      }) ?? []
  }));
  const untimedDayJobs =
    selectedDayGroup?.jobs.filter((job) => !job.scheduledStartAt) ?? [];

  const redirectTo = buildScheduleHref({
    q: query,
    projectId: projectFilterId ?? undefined,
    view,
    crew: crewFilter,
    layout: scheduleLayout,
    item: itemFilter,
    date: plannerDateKey,
    action: selectedAction,
    jobId: selectedJobId ?? undefined
  });
  const buildCurrentScheduleHref = (input: {
    q?: string;
    projectId?: string;
    view?: ScheduleViewKey;
    crew?: CrewViewKey;
    layout?: ScheduleLayoutKey;
    item?: ScheduleItemViewKey;
    date?: string;
    action?: ScheduleActionKey;
    jobId?: string;
    moveTarget?: "unscheduled";
    moveDate?: string;
    moveStart?: string;
    moveEnd?: string;
  }) =>
    buildScheduleHref({
      q: query,
      projectId: projectFilterId ?? undefined,
      view,
      crew: crewFilter,
      layout: scheduleLayout,
      item: itemFilter,
      date: plannerDateKey,
      ...input
    });
  const clearProjectFilterHref = buildCurrentScheduleHref({
    projectId: undefined
  });
  const clearSearchHref = buildCurrentScheduleHref({ q: "" });
  const clearCrewFilterHref = buildCurrentScheduleHref({ crew: "all" });
  const clearItemFilterHref = buildCurrentScheduleHref({ item: "all" });
  const clearSelectedContextHref = buildCurrentScheduleHref({
    action: undefined,
    jobId: undefined
  });
  const showActiveFilters =
    Boolean(projectFilterId) ||
    query.length > 0 ||
    crewFilter !== "all" ||
    itemFilter !== "all" ||
    Boolean(selectedAction && selectedJobId) ||
    Boolean(selectedMoveProposal);
  const scheduleViews = SCHEDULE_VIEW_OPTIONS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? jobsWithAssignments.length
        : option.value === "unscheduled"
          ? totalUnscheduledJobs
          : option.value === "scheduled"
            ? scheduledJobs.length
            : option.value === "today"
              ? scheduledTodayJobs.length
              : option.value === "upcoming"
                ? upcomingJobs.length
                : option.value === "in_progress"
                  ? inProgressJobs.length
                  : recentlyCompletedJobs.length
  }));
  const itemViews = SCHEDULE_ITEM_VIEW_OPTIONS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? visibleJobs.length +
          visibleAppointments.length +
          visibleOpportunityAssessments.length
        : option.value === "jobs"
          ? visibleJobs.length
          : visibleAppointments.length + visibleOpportunityAssessments.length
  }));
  const crewViews = CREW_VIEW_OPTIONS;
  const listEmptyState = getScheduleListEmptyState({
    jobCount: jobs.length + appointments.length + opportunityAssessments.length,
    query,
    projectName: activeProjectFilter?.name ?? null,
    view,
    crew: crewFilter
  });
  const summaryItems = [
    {
      key: "unscheduled",
      label: "Needs Scheduling",
      value: unscheduledJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "unscheduled",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: view === "unscheduled",
      borderClass: "border-amber-200",
      bgClass: "bg-amber-50/60",
      labelClass: "text-amber-800",
      valueClass: "text-amber-900"
    },
    {
      key: "blocked",
      label: "Blocked",
      value: blockedUnscheduledJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "unscheduled",
        crew: crewFilter,
        layout: "crew",
        date: plannerDateKey
      }),
      active: false,
      borderClass: "border-rose-200",
      bgClass: "bg-rose-50/45",
      labelClass: "text-rose-700",
      valueClass: "text-rose-800"
    },
    {
      key: "overdue",
      label: "Overdue scheduling",
      value: overdueSchedulingJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "unscheduled",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: false,
      borderClass: "border-amber-200",
      bgClass: "bg-amber-50/45",
      labelClass: "text-amber-800",
      valueClass: "text-amber-900"
    },
    {
      key: "today",
      label: "Today",
      value: scheduledTodayJobs.length + todayAppointments.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "today",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: view === "today",
      borderClass: "border-[var(--border-warm)]",
      bgClass: "bg-[var(--highlight)]",
      labelClass: "text-[var(--text-secondary)]",
      valueClass: "text-[var(--text-primary)]"
    },
    {
      key: "tomorrow",
      label: "Tomorrow",
      value: tomorrowJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "upcoming",
        crew: crewFilter,
        layout: scheduleLayout,
        date: toDateKey(addDays(today, 1))
      }),
      active: false,
      borderClass: "border-[var(--border-warm)]",
      bgClass: "bg-white",
      labelClass: "text-[var(--text-secondary)]",
      valueClass: "text-[var(--text-primary)]"
    },
    {
      key: "in-progress",
      label: "In progress",
      value: inProgressJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "in_progress",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: view === "in_progress",
      borderClass: "border-[var(--border-warm)]",
      bgClass: "bg-white",
      labelClass: "text-[var(--text-secondary)]",
      valueClass: "text-[var(--text-primary)]"
    },
    {
      key: "missing-crew",
      label: "Missing Crew",
      value: missingCrewJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "scheduled",
        crew: "unassigned",
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: crewFilter === "unassigned",
      borderClass: "border-rose-200",
      bgClass: "bg-rose-50/45",
      labelClass: "text-rose-700",
      valueClass: "text-rose-800"
    },
    {
      key: "warnings",
      label: "Readiness review",
      value: needsReadinessReviewJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view,
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: false,
      borderClass: "border-rose-200",
      bgClass: "bg-rose-50/45",
      labelClass: "text-rose-700",
      valueClass: "text-rose-800"
    },
    {
      key: "upcoming",
      label: "This week",
      value: thisWeekJobs.length + upcomingAppointments.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "upcoming",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: view === "upcoming",
      borderClass: "border-[var(--border-warm)]",
      bgClass: "bg-[var(--highlight)]",
      labelClass: "text-[var(--text-secondary)]",
      valueClass: "text-[var(--text-primary)]"
    },
    {
      key: "completed",
      label: "Recently Done",
      value: recentlyCompletedJobs.length,
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "completed",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      active: view === "completed",
      borderClass: "border-emerald-200",
      bgClass: "bg-emerald-50/35",
      labelClass: "text-emerald-700",
      valueClass: "text-emerald-800"
    }
  ] as const;
  const nextActions = [
    {
      key: "needs-scheduling",
      eyebrow: "Needs scheduling",
      title: getActionDescription(
        unscheduledJobs.length,
        "1 job is waiting on a date commitment.",
        `${unscheduledJobs.length} jobs are waiting on a date commitment.`
      ),
      description:
        "These jobs have reached CrewBoard. Set a day and time on the job record, or open the project if the Ready Check looks wrong.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "unscheduled",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "Review queue",
      jobs: unscheduledJobs.slice(0, 2),
      empty: unscheduledJobs.length === 0
    },
    {
      key: "needs-crew",
      eyebrow: "Needs crew assignment",
      title: getActionDescription(
        todayWithoutCrewJobs.length,
        "1 job scheduled today still has no crew.",
        `${todayWithoutCrewJobs.length} jobs scheduled today still have no crew.`
      ),
      description:
        "Attach people or labor-provider vendors on the existing job so field work has crew continuity after the date commitment.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "today",
        crew: "unassigned",
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "View unassigned",
      jobs: todayWithoutCrewJobs.slice(0, 2),
      empty: todayWithoutCrewJobs.length === 0
    },
    {
      key: "past-scheduled",
      eyebrow: "Past scheduled",
      title: getActionDescription(
        pastScheduledIncompleteJobs.length,
        "1 scheduled job is past due and not completed.",
        `${pastScheduledIncompleteJobs.length} scheduled jobs are past due and not completed.`
      ),
      description:
        "Confirm whether the work needs status update, reschedule, crew review, or project follow-through before it disappears into the calendar.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "scheduled",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "Review past work",
      jobs: pastScheduledIncompleteJobs.slice(0, 2),
      empty: pastScheduledIncompleteJobs.length === 0
    },
    {
      key: "capacity-review",
      eyebrow: "Capacity review",
      title: getActionDescription(
        capacityWarningJobs.length,
        "1 job has crew capacity or overlap warnings.",
        `${capacityWarningJobs.length} jobs have crew capacity or overlap warnings.`
      ),
      description:
        "These warnings are advisory only. Confirm same-day crew load, timing, and travel manually before committing the field plan.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "scheduled",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "Review capacity",
      jobs: capacityWarningJobs.slice(0, 2),
      empty: capacityWarningJobs.length === 0
    },
    {
      key: "blocked-unscheduled",
      eyebrow: "Blocked handoffs",
      title: getActionDescription(
        blockedUnscheduledJobs.length,
        "1 unscheduled job is blocked by project readiness.",
        `${blockedUnscheduledJobs.length} unscheduled jobs are blocked by project readiness.`
      ),
      description:
        "Do not bypass Ready Check. Open the linked estimate, contract, deposit invoice, financing, or Project Workspace record before committing the date.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "unscheduled",
        crew: crewFilter,
        layout: "crew",
        date: plannerDateKey
      }),
      ctaLabel: "Review blockers",
      jobs: blockedUnscheduledJobs.slice(0, 2),
      empty: blockedUnscheduledJobs.length === 0
    },
    {
      key: "happening-today",
      eyebrow: "Happening today",
      title: getActionDescription(
        activeTodayJobs.length,
        "1 job is live or scheduled today.",
        `${activeTodayJobs.length} jobs are live or scheduled today.`
      ),
      description:
        "Use the shared schedule surface to monitor today's field picture, then jump into the job or project workspace when needed.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "today",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "Open today view",
      jobs: activeTodayJobs.slice(0, 2),
      empty: activeTodayJobs.length === 0
    },
    {
      key: "latest-scheduled",
      eyebrow: "Latest scheduled work",
      title: getActionDescription(
        latestScheduledJobs.length,
        "1 recent scheduled job is on the board.",
        `${latestScheduledJobs.length} recent scheduled jobs are on the board.`
      ),
      description:
        "Use the latest committed work as a quick continuity check before drilling into job or project detail.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "upcoming",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "View upcoming",
      jobs: latestScheduledJobs,
      empty: latestScheduledJobs.length === 0
    },
    {
      key: "recently-done",
      eyebrow: "Recently done",
      title: getActionDescription(
        recentlyCompletedJobs.length,
        "1 completed job is ready for closeout review.",
        `${recentlyCompletedJobs.length} completed jobs are ready for closeout review.`
      ),
      description:
        "Use completed jobs as a quick handoff back to Job and Project Workspaces for closeout, billing review, and field evidence follow-through.",
      href: buildScheduleHref({
        q: query,
        projectId: projectFilterId ?? undefined,
        view: "completed",
        crew: crewFilter,
        layout: scheduleLayout,
        date: plannerDateKey
      }),
      ctaLabel: "View completed",
      jobs: recentlyCompletedJobs.slice(0, 2),
      empty: recentlyCompletedJobs.length === 0
    }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="CrewBoard"
      title="CrewBoard"
      description={`Run daily scheduling for ${organizationContext.organization.displayName}: see what needs a date, what is happening today, where crew is missing, and which job or project to open next.`}
      ownership={{
        owns: "Field and Schedule own execution planning over canonical jobs, assignments, Daily Logs, field notes, evidence, people, vendors, and time context.",
        acts: "Schedule, assign, and prepare moves here; open Job or Project Workspaces when readiness, scope, billing, or broader execution continuity needs review.",
        configuration: {
          href: "/settings/workflows",
          label: "Workflow defaults",
          detail:
            "Readiness and workflow preferences stay in Settings; CrewBoard does not create separate dispatch configuration."
        }
      }}
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={[
                "border px-4 py-3 transition hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
                item.borderClass,
                item.bgClass,
                item.active ? "ring-1 ring-inset ring-[var(--graphite)]" : ""
              ].join(" ")}
            >
              <p
                className={`text-[11px] uppercase tracking-[0.14em] ${item.labelClass}`}
              >
                {item.label}
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p
                  className={`text-2xl font-semibold tracking-tight ${item.valueClass}`}
                >
                  {item.value}
                </p>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {item.active ? "Current view" : "Open"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review CrewBoard as the shared scheduling workspace, then jump into
            the job or project workspace when field execution, GateKeeper, or
            billing continuity matters.
          </p>
        ),
        searchSlot: (
          <form action="/schedule" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {crewFilter !== "all" ? (
              <input type="hidden" name="crew" value={crewFilter} />
            ) : null}
            {itemFilter !== "all" ? (
              <input type="hidden" name="item" value={itemFilter} />
            ) : null}
            {projectFilterId ? (
              <input type="hidden" name="projectId" value={projectFilterId} />
            ) : null}
            {scheduleLayout !== "week" ? (
              <input type="hidden" name="layout" value={scheduleLayout} />
            ) : null}
            <input type="hidden" name="date" value={plannerDateKey} />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, estimate, crew, vendor, or date"
              className={`${scheduleFieldClassName} flex-1`}
            />
            <button type="submit" className={secondaryActionClassName}>
              Search
            </button>
            {query.length > 0 ||
            projectFilterId ||
            view !== "all" ||
            crewFilter !== "all" ? (
              <Link
                href={buildScheduleHref({
                  projectId: projectFilterId ?? undefined,
                  item: itemFilter,
                  layout: scheduleLayout,
                  date: plannerDateKey
                })}
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: [
          <div
            key="schedule-view-group"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Schedule view
            </span>
            {scheduleViews.map((scheduleView) => {
              const isActive = view === scheduleView.value;

              return (
                <Link
                  key={`schedule-view-${scheduleView.value}`}
                  href={buildScheduleHref({
                    q: query,
                    projectId: projectFilterId ?? undefined,
                    view: scheduleView.value,
                    crew: crewFilter,
                    item: itemFilter,
                    layout: scheduleLayout,
                    date: plannerDateKey
                  })}
                  className={[
                    scheduleFilterChipClassName,
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionToneClassName}`
                  ].join(" ")}
                >
                  <span>{scheduleView.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                    ].join(" ")}
                  >
                    {scheduleView.count}
                  </span>
                </Link>
              );
            })}
          </div>,
          <div
            key="crew-view-group"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Crew view
            </span>
            {crewViews.map((crewView) => {
              const isActive = crewFilter === crewView.value;

              return (
                <Link
                  key={`crew-view-${crewView.value}`}
                  href={buildScheduleHref({
                    q: query,
                    projectId: projectFilterId ?? undefined,
                    view,
                    crew: crewView.value,
                    item: itemFilter,
                    layout: scheduleLayout,
                    date: plannerDateKey
                  })}
                  className={[
                    scheduleFilterChipClassName,
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionToneClassName}`
                  ].join(" ")}
                >
                  {crewView.label}
                </Link>
              );
            })}
          </div>,
          <div
            key="item-view-group"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Items
            </span>
            {itemViews.map((itemView) => {
              const isActive = itemFilter === itemView.value;

              return (
                <Link
                  key={`item-view-${itemView.value}`}
                  href={buildScheduleHref({
                    q: query,
                    projectId: projectFilterId ?? undefined,
                    view,
                    crew: crewFilter,
                    item: itemView.value,
                    layout: scheduleLayout,
                    date: plannerDateKey
                  })}
                  className={[
                    scheduleFilterChipClassName,
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionToneClassName}`
                  ].join(" ")}
                >
                  <span>{itemView.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-[var(--highlight)] text-[var(--text-secondary)]"
                    ].join(" ")}
                  >
                    {itemView.count}
                  </span>
                </Link>
              );
            })}
          </div>
        ],
        actionSlot: (
          <Link
            href="/jobs?view=unscheduled"
            className={primaryActionClassName}
          >
            Open jobs
          </Link>
        )
      }}
    >
      <div
        className={
          showComposer
            ? "grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_420px]"
            : "space-y-4"
        }
      >
        <section className="space-y-6">
          {showActiveFilters ? (
            <section className="rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 shadow-sm sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Active filters
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                    CrewBoard handoff context is active
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    These filters stay intersected, so you can clear any one
                    chip without dropping the unrelated CrewBoard state.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProjectFilter ? (
                    <Link
                      href={`/projects/${activeProjectFilter.id}`}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                    >
                      Open Project Workspace
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {projectFilterId ? (
                  <ScheduleFilterChip
                    label="Project"
                    value={activeProjectSummary.title}
                    clearHref={clearProjectFilterHref}
                  />
                ) : null}
                {query.length > 0 ? (
                  <ScheduleFilterChip
                    label="Search"
                    value={`"${query}"`}
                    clearHref={clearSearchHref}
                  />
                ) : null}
                {crewFilter !== "all" ? (
                  <ScheduleFilterChip
                    label="Crew"
                    value={getCrewViewSummaryLabel(crewFilter)}
                    clearHref={clearCrewFilterHref}
                  />
                ) : null}
                {itemFilter !== "all" ? (
                  <ScheduleFilterChip
                    label="Items"
                    value={getItemViewSummaryLabel(itemFilter)}
                    clearHref={clearItemFilterHref}
                  />
                ) : null}
                {selectedAction && selectedJobId ? (
                  <ScheduleFilterChip
                    label="Selected job"
                    value={
                      selectedJob
                        ? `${getScheduleActionSummaryLabel(selectedAction)} · ${getScheduleJobTitle(
                            selectedJob
                          )}`
                        : getScheduleActionSummaryLabel(selectedAction)
                    }
                    clearHref={clearSelectedContextHref}
                  />
                ) : null}
                {selectedMoveProposal ? (
                  <ScheduleFilterChip
                    label="Prepared move"
                    value={selectedMoveProposal.targetLabel}
                    clearHref={
                      buildCurrentScheduleHref({
                        action: "schedule",
                        jobId: selectedJobId ?? undefined
                      }) + "#schedule-action"
                    }
                  />
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                {projectFilterId ? <p>{activeProjectSummary.detail}</p> : null}
                {query.length > 0 ? (
                  <p>
                    Text search stays intersected with the current project,
                    view, and crew filters.
                  </p>
                ) : null}
                {selectedAction && selectedJobId ? (
                  <p>
                    The selected job context keeps the composer tied to the same
                    job record until you clear it.
                  </p>
                ) : null}
                {selectedMoveProposal ? (
                  <p>
                    Prepared move targets only prefill the existing Move
                    schedule review.
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <ScheduleFieldCommandCenter
            sections={fieldCommandCenterSections}
            getActionHref={(item) => {
              if (item.recommendedAction === "open_daily_log") {
                return (
                  item.handoff?.dailyLogHref ??
                  buildDailyLogCaptureHref({
                    projectId: item.job.projectId,
                    jobId: item.job.id,
                    logDate: item.job.scheduledDate
                  })
                );
              }

              if (item.recommendedAction === "review_project") {
                return item.readinessHandoff.primaryHref;
              }

              if (item.recommendedAction === "open_job") {
                return `/jobs/${item.job.id}`;
              }

              return (
                buildCurrentScheduleHref({
                  action:
                    item.recommendedAction === "assign_crew"
                      ? "assign"
                      : "schedule",
                  jobId: item.job.id
                }) + "#schedule-action"
              );
            }}
          />

          <ScheduleFieldHandoffCommandView
            commandView={fieldHandoffCommandView}
          />

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Operating modes
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    Triage, plan, dispatch
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    CrewBoard groups the same canonical jobs into review modes
                    so dispatchers can clear blockers, build the upcoming plan,
                    and watch today without changing the source of truth.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
                  {visibleOperatingModes.reduce(
                    (total, mode) => total + mode.attentionCount,
                    0
                  )}{" "}
                  attention signals
                </span>
              </div>
            </div>

            <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-3">
              {visibleOperatingModes.map((mode) => (
                <div key={mode.key} className="bg-white px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                        {mode.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {mode.detail}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
                      {mode.jobCount} jobs
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={mode.href}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                    >
                      Open {mode.label}
                    </Link>
                    <span className="text-sm text-[var(--text-tertiary)]">
                      {mode.attentionCount} attention
                    </span>
                  </div>

                  {mode.jobs.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {mode.jobs.map((job) => {
                        const primaryAction = getPrimaryScheduleAction(job);

                        return (
                          <div
                            key={`${mode.key}-${job.id}`}
                            className="rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2.5"
                          >
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                            >
                              {getScheduleJobTitle(job)}
                            </Link>
                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                              {job.customer?.name ?? "Unknown customer"} ·{" "}
                              {formatDate(job.scheduledDate)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Link
                                href={
                                  buildCurrentScheduleHref({
                                    action: primaryAction.action,
                                    jobId: job.id
                                  }) + "#schedule-action"
                                }
                                className={[
                                  "inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                  primaryAction.toneClass
                                ].join(" ")}
                              >
                                {primaryAction.label}
                              </Link>
                              <Link
                                href={`/projects/${job.projectId}`}
                                className={scheduleCompactLinkClassName}
                              >
                                Project
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--text-tertiary)]">
                      No jobs in this mode for the current filters.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Dispatch priority
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    Attention desk
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    A single ordered queue for readiness blockers, past-due
                    scheduled work, missing crew, same-day crew load, aging
                    ready jobs, and active execution.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">
                    {pastScheduledIncompleteJobs.length} past scheduled
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    {capacityWarningJobs.length} capacity
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {agingUnscheduledReadyJobs.length} aging ready
                  </span>
                </div>
              </div>
            </div>

            {dispatchAttentionItems.length > 0 ? (
              <div className="divide-y divide-[var(--border-warm)]">
                {dispatchAttentionItems.slice(0, 8).map((item) => {
                  const primaryAction = getPrimaryScheduleAction(item.job);

                  return (
                    <div key={item.id} className="px-5 py-4 sm:px-6">
                      <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_220px] lg:items-start">
                        <div>
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                              getDispatchAttentionToneClassName(item.tone)
                            ].join(" ")}
                          >
                            {item.label}
                          </span>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                            Priority {item.priority}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/jobs/${item.job.id}`}
                            className="text-base font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                          >
                            {getScheduleJobTitle(item.job)}
                          </Link>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {item.job.customer?.name ?? "Unknown customer"} ·{" "}
                            {item.job.project?.name ?? "Project"} ·{" "}
                            {formatDate(item.job.scheduledDate)}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {item.detail}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Link
                            href={
                              buildCurrentScheduleHref({
                                action: primaryAction.action,
                                jobId: item.job.id
                              }) + "#schedule-action"
                            }
                            className={[
                              "inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                              primaryAction.toneClass
                            ].join(" ")}
                          >
                            {primaryAction.label}
                          </Link>
                          <Link
                            href={`/projects/${item.job.projectId}`}
                            className={scheduleCompactLinkClassName}
                          >
                            Project Workspace
                          </Link>
                          <Link
                            href={`/jobs/${item.job.id}`}
                            className={scheduleCompactLinkClassName}
                          >
                            Job Workspace
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No dispatch attention"
                  title="No priority dispatch items found."
                  description="CrewBoard did not find readiness blockers, past scheduled jobs, missing crew, capacity warnings, aging ready jobs, or active work requiring special attention."
                />
              </div>
            )}
          </section>

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Next Move
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    CrewBoard command center
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Use the loaded job state to see what needs scheduling, what
                    is missing crew, and whether the next move belongs in
                    CrewBoard or the Project Workspace.
                  </p>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {nextActions.filter((action) => !action.empty).length} active
                </p>
              </div>
            </div>

            <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-2">
              {nextActions.map((action) => (
                <div key={action.key} className="bg-white px-5 py-4 sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {action.eyebrow}
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-[var(--text-primary)]">
                    {action.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {action.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={action.href}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                    >
                      {action.ctaLabel}
                    </Link>
                    {action.empty ? (
                      <span className="text-sm text-[var(--text-tertiary)]">
                        Nothing urgent from this lane right now.
                      </span>
                    ) : null}
                  </div>
                  {action.jobs.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {action.jobs.map((job) => {
                        const crewState = getCrewState(job);
                        const primaryAction = getPrimaryScheduleAction(job);

                        return (
                          <div
                            key={`${action.key}-${job.id}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                              >
                                {getScheduleJobTitle(job)}
                              </Link>
                              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                {job.customer?.name ?? "Unknown customer"} ·{" "}
                                {formatDate(job.scheduledDate)}
                              </p>
                              <p
                                className={`mt-1 text-xs font-medium ${crewState.emphasisClass}`}
                              >
                                {crewState.label} · {crewState.detail}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/projects/${job.projectId}`}
                                className={scheduleCompactLinkClassName}
                              >
                                Project
                              </Link>
                              <Link
                                href={
                                  buildScheduleHref({
                                    q: query,
                                    projectId: projectFilterId ?? undefined,
                                    view,
                                    crew: crewFilter,
                                    action: primaryAction.action,
                                    jobId: job.id
                                  }) + "#schedule-action"
                                }
                                className={[
                                  "inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                  primaryAction.toneClass
                                ].join(" ")}
                              >
                                {primaryAction.label}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Dispatch checks
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    Schedule warnings
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    These are read-only CrewBoard signals from existing job
                    timing and crew assignments. They do not block scheduling
                    unless GateKeeper already does.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                  {formatWarningCount(visibleScheduleWarningCount)}
                </span>
              </div>
            </div>

            {visibleScheduleWarningSummaries.length > 0 ? (
              <div className="divide-y divide-[var(--border-warm)]">
                {visibleScheduleWarningSummaries.slice(0, 6).map((summary) => {
                  const job = visibleJobsById.get(summary.jobId);

                  if (!job) {
                    return null;
                  }

                  const primaryAction = getPrimaryScheduleAction(job);

                  return (
                    <div key={summary.jobId} className="px-5 py-4 sm:px-6">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_180px] md:items-start">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                            Next Move
                          </p>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                          >
                            {getScheduleJobTitle(job)}
                          </Link>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {job.customer?.name ?? "Unknown customer"} ·{" "}
                            {formatDate(job.scheduledDate)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {summary.warnings.map((warning) => (
                            <div
                              key={warning.id}
                              className="rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900"
                            >
                              <p className="font-semibold">
                                {getScheduleWarningDisplayLabel(warning.kind)}
                              </p>
                              <p>{warning.detail}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Link
                            href={
                              buildCurrentScheduleHref({
                                action: primaryAction.action,
                                jobId: job.id
                              }) + "#schedule-action"
                            }
                            className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${primaryAction.toneClass}`}
                          >
                            {primaryAction.label}
                          </Link>
                          <Link
                            href={`/projects/${job.projectId}`}
                            className={scheduleCompactLinkClassName}
                          >
                            Project Workspace
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No schedule warnings"
                  title="No schedule warnings found."
                  description="CrewBoard did not find missing crew, missing end times, or overlapping crew windows in the current filtered job set."
                />
              </div>
            )}
          </section>

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Resource load
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    Crew load review
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Review repeated person and labor-provider assignments from
                    the current filtered jobs. These are advisory signals only;
                    crew changes still use the existing job assignment action.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
                  {visibleScheduleResourceLoadItems.length} load signals
                </span>
              </div>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <ScheduleResourceLoadPanel
                items={visibleScheduleResourceLoadItems}
              />
            </div>
          </section>

          <details className="group space-y-4">
            <summary
              className={`${schedulePanelClassName} flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden`}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Supporting queues
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  Schedule action previews
                </h2>
                <p className="mt-1 max-w-[78ch] text-sm leading-6 text-[var(--text-secondary)]">
                  Queue cards for aging, readiness, crew, live work, and
                  closeout stay grouped below CrewBoard attention and resource
                  load.
                </p>
              </div>
              <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                <span className="group-open:hidden">Show</span>
                <span className="hidden group-open:inline">Hide</span>
              </span>
            </summary>

            <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
              <ManagerDashboardCard
                eyebrow="Needs commitment"
                title={unscheduledDispatchSection?.title ?? "Needs Scheduling"}
                description={
                  unscheduledDispatchSection?.description ??
                  "These jobs already cleared the Ready Check. If expected work is absent, open the Project Workspace and review GateKeeper first."
                }
                actionHref={buildCurrentScheduleHref({ view: "unscheduled" })}
                actionLabel="Review queue"
                items={(unscheduledDispatchSection?.items ?? [])
                  .slice(0, 4)
                  .map((item) => {
                    const job = item.job;
                    const crewState = getCrewState(job);
                    const primaryAction = getPrimaryScheduleAction(job);

                    return {
                      href: buildCurrentScheduleHref({
                        action: primaryAction.action,
                        jobId: job.id
                      }),
                      title: getScheduleJobTitle(job),
                      subtitle: getScheduleJobSubtitle(job),
                      meta: item.warnings.length
                        ? `${formatWarningCount(item.warnings.length)} before dispatch commitment`
                        : crewState.label === "Assigned"
                          ? `${item.crewLabel} ready once timing is set`
                          : "Needs scheduling before crew commitment becomes actionable",
                      badge:
                        job.dispatchStatus === "unscheduled"
                          ? "Needs Dispatch"
                          : item.statusLabel,
                      trailing: primaryAction.label
                    };
                  })}
                emptyTitle="No jobs need scheduling right now."
                emptyDescription="Jobs surface here after the Project Workspace clears the Ready Check and a job exists without timing."
              />

              <ManagerDashboardCard
                eyebrow="Queue age"
                title="Aging ready jobs"
                description="Ready-to-schedule jobs that have waited since before today stay visible so dispatch can commit timing or reopen project context."
                actionHref={buildCurrentScheduleHref({ view: "unscheduled" })}
                actionLabel="Review aging"
                items={agingUnscheduledReadyJobs.slice(0, 4).map((job) => {
                  const primaryAction = getPrimaryScheduleAction(job);

                  return {
                    href: buildCurrentScheduleHref({
                      action: primaryAction.action,
                      jobId: job.id
                    }),
                    title: getScheduleJobTitle(job),
                    subtitle: getScheduleJobSubtitle(job),
                    meta: `Waiting since ${formatDate(job.updatedAt.slice(0, 10))}`,
                    badge: "Aging ready",
                    trailing: primaryAction.label
                  };
                })}
                emptyTitle="No aging ready jobs."
                emptyDescription="Ready unscheduled jobs updated today stay out of this queue until they need dispatch follow-up."
              />

              <ManagerDashboardCard
                eyebrow="Readiness"
                title="Needs readiness review"
                description="This queue collects scheduled or active jobs that need human review before the day runs cleanly: missing crew, missing end time, or schedule warnings."
                actionHref={buildCurrentScheduleHref({ view: "all" })}
                actionLabel="Review schedule"
                items={needsReadinessReviewJobs.slice(0, 4).map((job) => {
                  const primaryAction = getPrimaryScheduleAction(job);
                  const jobWarnings = scheduleWarningsByJobId.get(job.id) ?? [];
                  const readinessBadge = getScheduleReadinessBadge({
                    dispatchStatus: job.dispatchStatus,
                    assignmentCount: job.assignmentCount,
                    warningCount: jobWarnings.length
                  });

                  return {
                    href: buildCurrentScheduleHref({
                      action: primaryAction.action,
                      jobId: job.id
                    }),
                    title: getScheduleJobTitle(job),
                    subtitle: getScheduleJobSubtitle(job),
                    meta: getScheduleReadinessReviewMeta({
                      dispatchStatus: job.dispatchStatus,
                      assignmentCount: job.assignmentCount,
                      warningCount: jobWarnings.length
                    }),
                    badge: readinessBadge.label,
                    trailing: primaryAction.label
                  };
                })}
                emptyTitle="No schedule readiness review items."
                emptyDescription="Jobs with timing, crew, and warning context in place will stay out of this review queue."
              />

              <ManagerDashboardCard
                eyebrow="Readiness"
                title="Blocked / not ready"
                description="These jobs stay visible, but CrewBoard should not commit dates until the linked project readiness blocker is resolved."
                actionHref={buildCurrentScheduleHref({
                  view: "unscheduled",
                  layout: "crew"
                })}
                actionLabel="Open blocked lane"
                items={blockedUnscheduledJobs.slice(0, 4).map((job) => {
                  const readiness = projectReadinessByProjectId.get(
                    job.projectId
                  );
                  const blocker = readiness?.blockers[0] ?? null;

                  return {
                    href: blocker
                      ? (getReadinessBlockerHref(
                          blocker,
                          readiness,
                          job.projectId
                        ) ?? `/projects/${job.projectId}`)
                      : `/projects/${job.projectId}`,
                    title: getScheduleJobTitle(job),
                    subtitle: getScheduleJobSubtitle(job),
                    meta: blocker
                      ? getReadinessBlockerDetail(blocker, readiness)
                      : "Open the Project Workspace to review readiness.",
                    badge: blocker
                      ? formatReadinessBlockerLabel(blocker)
                      : "Blocked",
                    trailing: "Resolve blocker"
                  };
                })}
                emptyTitle="No unscheduled jobs are readiness-blocked."
                emptyDescription="If project commercial readiness changes after a job exists, blocked jobs remain visible here instead of disappearing from scheduling."
              />

              <ManagerDashboardCard
                eyebrow="Today"
                title={
                  todayDispatchSection?.title ?? "Scheduled work for today"
                }
                description={
                  todayDispatchSection?.description ??
                  "Keep the immediate field picture visible without turning the page into a full calendar app."
                }
                actionHref={buildCurrentScheduleHref({ view: "today" })}
                actionLabel="View today"
                items={(todayDispatchSection?.items ?? [])
                  .slice(0, 4)
                  .map((item) => {
                    const job = item.job;
                    const crewState = getCrewState(job);
                    const primaryAction = getPrimaryScheduleAction(job);

                    return {
                      href:
                        primaryAction.action === "assign"
                          ? buildCurrentScheduleHref({
                              action: primaryAction.action,
                              jobId: job.id
                            })
                          : `/jobs/${job.id}`,
                      title: getScheduleJobTitle(job),
                      subtitle: `${getScheduleJobSubtitle(job)} · ${formatDateTime(job.scheduledStartAt)}`,
                      meta: item.warnings.length
                        ? `${formatWarningCount(item.warnings.length)} · ${crewState.detail}`
                        : crewState.label === "Assigned"
                          ? `Crew ${item.crewLabel}`
                          : crewState.detail,
                      badge:
                        crewState.label === "Needs crew"
                          ? "Needs crew"
                          : "Today",
                      trailing:
                        primaryAction.action === "assign"
                          ? primaryAction.label
                          : "Open job"
                    };
                  })}
                emptyTitle="No work is scheduled for today."
                emptyDescription="Once jobs get real date commitments for today, they will surface here as the immediate operating queue."
              />

              <ManagerDashboardCard
                eyebrow="Live execution"
                title={inProgressDispatchSection?.title ?? "In Progress"}
                description={
                  inProgressDispatchSection?.description ??
                  "Active field execution stays visible separately from schedule planning."
                }
                actionHref={buildCurrentScheduleHref({ view: "in_progress" })}
                actionLabel="Open live work"
                items={(inProgressDispatchSection?.items ?? [])
                  .slice(0, 4)
                  .map((item) => {
                    const job = item.job;

                    return {
                      href: `/jobs/${job.id}`,
                      title: getScheduleJobTitle(job),
                      subtitle: getScheduleJobSubtitle(job),
                      meta: item.warnings.length
                        ? `${formatWarningCount(item.warnings.length)} · ${item.crewLabel}`
                        : `Crew ${item.crewLabel}`,
                      badge: "In Progress",
                      trailing:
                        item.recommendedAction === "assign_crew"
                          ? "Assign crew"
                          : "Open job"
                    };
                  })}
                emptyTitle="No jobs are in progress."
                emptyDescription="Live job records will appear here once field execution has started."
              />

              <ManagerDashboardCard
                eyebrow="Upcoming"
                title={upcomingDispatchSection?.title ?? "Next scheduled work"}
                description={
                  upcomingDispatchSection?.description ??
                  "This keeps the next few commitments in view so project continuity and crew planning stay connected."
                }
                actionHref={buildCurrentScheduleHref({ view: "upcoming" })}
                actionLabel="View upcoming"
                items={(upcomingDispatchSection?.items ?? [])
                  .slice(0, 4)
                  .map((item) => {
                    const job = item.job;
                    const crewState = getCrewState(job);
                    const primaryAction = getPrimaryScheduleAction(job);

                    return {
                      href: buildCurrentScheduleHref({
                        action: primaryAction.action,
                        jobId: job.id
                      }),
                      title: getScheduleJobTitle(job),
                      subtitle: `${getScheduleJobSubtitle(job)} · ${formatDate(job.scheduledDate)}`,
                      meta: item.warnings.length
                        ? `${formatWarningCount(item.warnings.length)} · ${crewState.detail}`
                        : crewState.label === "Assigned"
                          ? `${item.crewLabel} in place`
                          : crewState.detail,
                      badge:
                        crewState.label === "Needs crew"
                          ? "Needs crew"
                          : "Upcoming",
                      trailing: primaryAction.label
                    };
                  })}
                emptyTitle="No upcoming jobs are on the board yet."
                emptyDescription="Later scheduled work will show up here once the next commitments are captured on the job records."
              />

              <ManagerDashboardCard
                eyebrow="Crew"
                title="Assigned crew visibility"
                description="Use this queue to confirm which jobs already have named people or vendors attached before the day starts."
                actionHref={buildCurrentScheduleHref({ crew: "assigned" })}
                actionLabel="View assigned"
                items={assignedJobs.slice(0, 4).map((job) => {
                  const primaryAction = getPrimaryScheduleAction(job);

                  return {
                    href: buildCurrentScheduleHref({
                      action: "assign",
                      jobId: job.id
                    }),
                    title: getScheduleJobTitle(job),
                    subtitle: `${formatAssignmentLabel(job.assignmentCount)} · ${job.crewSummary.join(", ")}`,
                    meta: job.crewVendor?.name
                      ? `Crew vendor ${job.crewVendor.name}`
                      : job.crewLeads.length > 0
                        ? `Lead ${job.crewLeads.join(", ")}`
                        : "Crew attached on assignment rows",
                    badge:
                      job.dispatchStatus === "in_progress"
                        ? "Live"
                        : "Assigned",
                    trailing:
                      primaryAction.label === "Refine schedule"
                        ? "Manage crew"
                        : primaryAction.label
                  };
                })}
                emptyTitle="No jobs have crew assignments yet."
                emptyDescription="As people or subcontractor vendors get attached to jobs, they will show up here for quick review."
              />

              <ManagerDashboardCard
                eyebrow="Crew"
                title="Missing Crew"
                description="Scheduled and active jobs with no crew assignment stay visible so staffing gaps do not hide inside the calendar."
                actionHref={buildCurrentScheduleHref({
                  view: "scheduled",
                  crew: "unassigned"
                })}
                actionLabel="Assign crew"
                items={missingCrewJobs.slice(0, 4).map((job) => {
                  const primaryAction = getPrimaryScheduleAction(job);

                  return {
                    href: buildCurrentScheduleHref({
                      action: primaryAction.action,
                      jobId: job.id
                    }),
                    title: getScheduleJobTitle(job),
                    subtitle: `${getScheduleJobSubtitle(job)} - ${formatDate(job.scheduledDate)}`,
                    meta: "Date exists, crew assignment is still open",
                    badge: "Missing Crew",
                    trailing: "Assign crew"
                  };
                })}
                emptyTitle="No scheduled jobs are missing crew."
                emptyDescription="CrewBoard will flag jobs here when the date is set but people or labor-provider vendors still need to be attached."
              />

              <ManagerDashboardCard
                eyebrow="Closeout"
                title="Completed / Recently Done"
                description="Use completed jobs as schedule closeout handoffs back to Job and Project Workspaces."
                actionHref={buildCurrentScheduleHref({ view: "completed" })}
                actionLabel="View done"
                items={recentlyCompletedJobs.slice(0, 4).map((job) => ({
                  href: `/jobs/${job.id}`,
                  title: getScheduleJobTitle(job),
                  subtitle: `${getScheduleJobSubtitle(job)} - updated ${formatDate(job.updatedAt.slice(0, 10))}`,
                  meta: "Open the job or project for closeout, billing, or evidence follow-through",
                  badge: "Completed",
                  trailing: "Open job"
                }))}
                emptyTitle="No completed jobs are showing here yet."
                emptyDescription="Completed jobs will appear here from the same job records; no separate closeout board is created."
              />
            </section>
          </details>

          <ScheduleDispatchBoardShell
            eyebrow="CrewBoard planner"
            title="Schedule calendar"
            description="Run CrewBoard as a bounded scheduling command center: Day and Week show dated work, Crew groups operational lanes, and Unscheduled keeps ready and blocked jobs visible until a real date is saved."
            layoutOptions={SCHEDULE_LAYOUT_OPTIONS.map((option) => ({
              key: option.value,
              label: option.label,
              href: buildScheduleHref({
                q: query,
                projectId: projectFilterId ?? undefined,
                view:
                  option.value === "unscheduled"
                    ? "unscheduled"
                    : option.value === "crew" && view === "unscheduled"
                      ? "all"
                      : view,
                crew: crewFilter,
                layout: option.value,
                date: plannerDateKey
              }),
              active: scheduleLayout === option.value
            }))}
            primaryCount={
              isGroupedScheduleLayout
                ? groupedPlannerJobCount
                : plannerItemCount
            }
            primaryLabel={
              isGroupedScheduleLayout ? "visible jobs" : "scheduled items"
            }
            crewAttentionCount={
              isGroupedScheduleLayout
                ? visibleJobs.filter((job) => job.assignmentCount === 0).length
                : plannerNeedsCrewCount
            }
            rangeLabel={
              scheduleLayout === "crew"
                ? "Grouped by crew and operational timing"
                : scheduleLayout === "unscheduled"
                  ? "Ready and blocked unscheduled jobs"
                  : plannerRangeLabel
            }
            previousHref={plannerPrevHref}
            previousLabel={
              scheduleLayout === "day" ? "Previous day" : "Previous week"
            }
            todayHref={plannerTodayHref}
            nextHref={plannerNextHref}
            nextLabel={scheduleLayout === "day" ? "Next day" : "Next week"}
            boardModeDescription={
              scheduleLayout === "crew"
                ? "Crew view groups the filtered jobs by timing, crew gaps, and execution state while preserving the selected date for handoffs."
                : scheduleLayout === "unscheduled"
                  ? "Unscheduled view shows jobs with no date commitment. Scheduling still happens through the existing Move schedule confirmation."
                  : undefined
            }
          >
            <CrewBoardDragDropLayer>
              {boardItemCount > 0 ? (
                scheduleLayout === "day" ? (
                  <div className="px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border-warm)] pb-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {formatLongDateFromDate(plannerAnchorDate)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                          {(selectedDayGroup?.jobs.length ?? 0) +
                            selectedDayAppointments.length}{" "}
                          scheduled item
                          {(selectedDayGroup?.jobs.length ?? 0) +
                            selectedDayAppointments.length ===
                          1
                            ? ""
                            : "s"}{" "}
                          on this day
                        </p>
                      </div>
                      {plannerAnchorDate.getTime() === today.getTime() ? (
                        <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                          Today
                        </span>
                      ) : null}
                    </div>

                    {untimedDayJobs.length > 0 ? (
                      <div className="mt-4 rounded-[4px] border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          Time not set
                        </p>
                        <div className="mt-3 space-y-3">
                          {untimedDayJobs.map((job) => {
                            const crewState = getCrewState(job);
                            const primaryAction = getBoardPrimaryAction(job);
                            const boardCardState = getBoardCardState(job);
                            const jobWarnings =
                              scheduleWarningsByJobId.get(job.id) ?? [];

                            return (
                              <CrewBoardDraggableJob
                                key={`untimed-${job.id}`}
                                className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                                label={getScheduleJobTitle(job)}
                                job={{
                                  id: job.id,
                                  dispatchStatus: job.dispatchStatus,
                                  scheduledDate: job.scheduledDate,
                                  scheduledStartAt: job.scheduledStartAt,
                                  scheduledEndAt: job.scheduledEndAt
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                      {boardCardState.eyebrow}
                                    </p>
                                    <Link
                                      href={`/jobs/${job.id}`}
                                      className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                    >
                                      {getScheduleJobTitle(job)}
                                    </Link>
                                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                      {job.customer?.name ?? "Unknown customer"}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                                      {boardCardState.title}
                                    </p>
                                  </div>
                                  <ScheduleJobStateBadges
                                    crewState={crewState}
                                  />
                                </div>

                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                  {boardCardState.summary}
                                </p>
                                <ScheduleNotesPreview
                                  notes={job.scheduleNotes}
                                />
                                <ScheduleWarningBadges warnings={jobWarnings} />

                                <ScheduleJobActionLinks
                                  actionHref={
                                    buildScheduleHref({
                                      q: query,
                                      projectId: projectFilterId ?? undefined,
                                      view,
                                      crew: crewFilter,
                                      layout: scheduleLayout,
                                      date: plannerDateKey,
                                      action: primaryAction.action,
                                      jobId: job.id
                                    }) + "#schedule-action"
                                  }
                                  actionLabel={primaryAction.label}
                                  actionToneClass={primaryAction.toneClass}
                                  projectHref={`/projects/${job.projectId}`}
                                  projectLabel="Project Workspace"
                                  projectVariant="plain"
                                  size="compact"
                                />
                              </CrewBoardDraggableJob>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {selectedDayAppointments.length > 0 ? (
                      <div className="mt-4 rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          Appointments
                        </p>
                        <div className="mt-3 space-y-3">
                          {selectedDayAppointments.map((appointment) => (
                            <div
                              key={`appointment-${appointment.id}`}
                              className={`rounded-[4px] border px-3 py-3 ${getScheduleItemSurfaceClass(appointment)}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                    Appointment ·{" "}
                                    {formatStatusLabel(
                                      appointment.appointmentType
                                    )}
                                  </p>
                                  <Link
                                    href={appointment.href}
                                    className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                  >
                                    {appointment.title}
                                  </Link>
                                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                    {formatScheduleItemTimeWindow(appointment)}{" "}
                                    · {appointment.assigneeLabel}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                    {appointment.subtitle}
                                    {appointment.location
                                      ? ` · ${appointment.location}`
                                      : ""}
                                  </p>
                                </div>
                                <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                  {appointment.customerVisible
                                    ? "Customer-visible"
                                    : "Internal"}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {appointment.contextHref &&
                                appointment.contextLabel ? (
                                  <Link
                                    href={appointment.contextHref}
                                    className={scheduleCompactLinkClassName}
                                  >
                                    {appointment.contextLabel}
                                  </Link>
                                ) : null}
                                <Link
                                  href={appointment.href}
                                  className={`inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                                >
                                  Open appointment
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-px bg-[var(--border-warm)]">
                      {dayTimelineBuckets.map((bucket) => (
                        <CrewBoardDropTarget
                          key={bucket.hour}
                          className="grid grid-cols-[92px_minmax(0,1fr)] gap-px bg-[var(--border-warm)]"
                          target={createCrewBoardTimeBucketDropTarget({
                            date: plannerDateKey,
                            startTime: `${String(bucket.hour).padStart(2, "0")}:00`,
                            endTime: `${String(bucket.hour + 1).padStart(2, "0")}:00`
                          })}
                        >
                          <div className="bg-[var(--highlight)] px-4 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                            {formatHourLabel(bucket.hour)}
                          </div>
                          <div className="bg-white px-4 py-3">
                            {bucket.jobs.length > 0 ? (
                              <div className="space-y-3">
                                {bucket.jobs.map((job) => {
                                  const crewState = getCrewState(job);
                                  const primaryAction =
                                    getBoardPrimaryAction(job);
                                  const boardCardState = getBoardCardState(job);
                                  const jobWarnings =
                                    scheduleWarningsByJobId.get(job.id) ?? [];
                                  const operationalIndicators =
                                    buildScheduleOperationalIndicators({
                                      job,
                                      roleSlotPeople: assignablePeople,
                                      readiness:
                                        projectReadinessByProjectId.get(
                                          job.projectId
                                        ),
                                      warnings: jobWarnings,
                                      todayDateKey
                                    });

                                  return (
                                    <CrewBoardDraggableJob
                                      key={`${bucket.hour}-${job.id}`}
                                      className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                                      label={getScheduleJobTitle(job)}
                                      job={{
                                        id: job.id,
                                        dispatchStatus: job.dispatchStatus,
                                        scheduledDate: job.scheduledDate,
                                        scheduledStartAt: job.scheduledStartAt,
                                        scheduledEndAt: job.scheduledEndAt
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                            {boardCardState.eyebrow}
                                          </p>
                                          <Link
                                            href={`/jobs/${job.id}`}
                                            className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                          >
                                            {getScheduleJobTitle(job)}
                                          </Link>
                                          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                            {job.customer?.name ??
                                              "Unknown customer"}{" "}
                                            · {formatScheduleTimeWindow(job)}
                                          </p>
                                          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                                            {boardCardState.title}
                                          </p>
                                        </div>
                                        <ScheduleJobStateBadges
                                          crewState={crewState}
                                        />
                                      </div>

                                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {boardCardState.summary}
                                      </p>

                                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                        {crewState.detail}
                                      </p>
                                      <ScheduleOperationalIndicators
                                        indicators={operationalIndicators}
                                        limit={3}
                                      />
                                      <ScheduleNotesPreview
                                        notes={job.scheduleNotes}
                                      />
                                      <ScheduleWarningBadges
                                        warnings={jobWarnings}
                                      />

                                      <ScheduleJobActionLinks
                                        actionHref={
                                          buildScheduleHref({
                                            q: query,
                                            projectId:
                                              projectFilterId ?? undefined,
                                            view,
                                            crew: crewFilter,
                                            layout: scheduleLayout,
                                            date: plannerDateKey,
                                            action: primaryAction.action,
                                            jobId: job.id
                                          }) + "#schedule-action"
                                        }
                                        actionLabel={primaryAction.label}
                                        actionToneClass={
                                          primaryAction.toneClass
                                        }
                                        projectHref={`/projects/${job.projectId}`}
                                        projectLabel="Project Workspace"
                                        projectVariant="plain"
                                        jobHref={`/jobs/${job.id}`}
                                        jobLabel="Open job"
                                        jobVariant="bordered"
                                        size="compact"
                                      />
                                    </CrewBoardDraggableJob>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="min-h-16 rounded-[4px] border border-dashed border-[var(--border-warm)] bg-[var(--highlight)]" />
                            )}
                          </div>
                        </CrewBoardDropTarget>
                      ))}
                    </div>
                  </div>
                ) : scheduleLayout === "week" ? (
                  <div className="grid gap-px bg-[var(--border-warm)] xl:grid-cols-7">
                    {plannerDays.map((day) => {
                      const dayJobs = visibleScheduledJobs.filter(
                        (job) => job.scheduledDate === day.dateKey
                      );
                      const dayAppointments = visiblePlannerAppointments.filter(
                        (appointment) => appointment.dateKey === day.dateKey
                      );
                      const boardDate = getBoardDatePresentation(
                        day.dateKey,
                        today
                      );
                      const dayItemCount =
                        dayJobs.length + dayAppointments.length;

                      return (
                        <CrewBoardDropTarget
                          key={day.dateKey}
                          className={[
                            "bg-white px-4 py-4",
                            day.dateKey === todayDateKey
                              ? "bg-[var(--highlight)]"
                              : ""
                          ].join(" ")}
                          target={createCrewBoardDateDropTarget(
                            day.dateKey,
                            `${boardDate.title} ${boardDate.subtitle}`
                          )}
                        >
                          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-warm)] pb-3">
                            <div>
                              <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {boardDate.title}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                {boardDate.subtitle}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                {dayItemCount} item
                                {dayItemCount === 1 ? "" : "s"}
                              </span>
                              {day.dateKey === todayDateKey ? (
                                <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                  Today
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {dayItemCount > 0 ? (
                              <>
                                {dayJobs.map((job) => {
                                  const crewState = getCrewState(job);
                                  const primaryAction =
                                    getBoardPrimaryAction(job);
                                  const boardCardState = getBoardCardState(job);
                                  const jobWarnings =
                                    scheduleWarningsByJobId.get(job.id) ?? [];

                                  return (
                                    <CrewBoardDraggableJob
                                      key={job.id}
                                      className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                                      label={getScheduleJobTitle(job)}
                                      job={{
                                        id: job.id,
                                        dispatchStatus: job.dispatchStatus,
                                        scheduledDate: job.scheduledDate,
                                        scheduledStartAt: job.scheduledStartAt,
                                        scheduledEndAt: job.scheduledEndAt
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                            {boardCardState.eyebrow}
                                          </p>
                                          <Link
                                            href={`/jobs/${job.id}`}
                                            className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                          >
                                            {getScheduleJobTitle(job)}
                                          </Link>
                                          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                            {job.customer?.name ??
                                              "Unknown customer"}
                                          </p>
                                          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                                            {boardCardState.title}
                                          </p>
                                        </div>
                                        <ScheduleJobStateBadges
                                          crewState={crewState}
                                        />
                                      </div>

                                      <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
                                        {formatScheduleTimeWindow(job)}
                                      </p>
                                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                        {boardCardState.summary}
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                        {crewState.detail}
                                      </p>
                                      <ScheduleNotesPreview
                                        notes={job.scheduleNotes}
                                      />
                                      <ScheduleWarningBadges
                                        warnings={jobWarnings}
                                      />

                                      <ScheduleJobActionLinks
                                        actionHref={
                                          buildScheduleHref({
                                            q: query,
                                            projectId:
                                              projectFilterId ?? undefined,
                                            view,
                                            crew: crewFilter,
                                            layout: scheduleLayout,
                                            date: day.dateKey,
                                            action: primaryAction.action,
                                            jobId: job.id
                                          }) + "#schedule-action"
                                        }
                                        actionLabel={primaryAction.label}
                                        actionToneClass={
                                          primaryAction.toneClass
                                        }
                                        projectHref={`/projects/${job.projectId}`}
                                        projectLabel="Project Workspace"
                                        projectVariant="plain"
                                        size="compact"
                                      />
                                    </CrewBoardDraggableJob>
                                  );
                                })}
                                {dayAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`rounded-[4px] border px-3 py-3 ${getScheduleItemSurfaceClass(appointment)}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                          Appointment ·{" "}
                                          {formatStatusLabel(
                                            appointment.appointmentType
                                          )}
                                        </p>
                                        <Link
                                          href={appointment.href}
                                          className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                        >
                                          {appointment.title}
                                        </Link>
                                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                          {appointment.subtitle}
                                        </p>
                                      </div>
                                      {appointment.customerVisible ? (
                                        <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                          Customer-visible
                                        </span>
                                      ) : null}
                                    </div>
                                    <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
                                      {formatScheduleItemTimeWindow(
                                        appointment
                                      )}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                      {appointment.assigneeLabel}
                                      {appointment.location
                                        ? ` · ${appointment.location}`
                                        : ""}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {appointment.contextHref &&
                                      appointment.contextLabel ? (
                                        <Link
                                          href={appointment.contextHref}
                                          className={
                                            scheduleCompactLinkClassName
                                          }
                                        >
                                          {appointment.contextLabel}
                                        </Link>
                                      ) : null}
                                      <Link
                                        href={appointment.href}
                                        className={`inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                                      >
                                        Open appointment
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="rounded-[4px] border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-8 text-center text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                                Open day
                              </div>
                            )}
                          </div>
                        </CrewBoardDropTarget>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-4 px-5 py-4 sm:px-6 xl:grid-cols-2 2xl:grid-cols-3">
                    {plannerBoardGroups.map((group) => (
                      <section
                        key={group.key}
                        className={`flex flex-col border ${group.surfaceClass}`}
                        data-crewboard-drop-target={
                          group.key === "unscheduled-ready"
                            ? "unscheduled"
                            : undefined
                        }
                        data-crewboard-lane={group.key}
                      >
                        <div className="border-b border-[var(--border-warm)] px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {group.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                {group.description}
                              </p>
                              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                                {getBoardLaneMeta(group)}
                              </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                              {group.jobs.length} job
                              {group.jobs.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 space-y-3 px-4 py-4">
                          {group.jobs.length > 0 ? (
                            group.jobs.map((job) => {
                              const crewState = getCrewState(job);
                              const primaryAction = getBoardPrimaryAction(job);
                              const boardCardState = getBoardCardState(job);
                              const jobWarnings =
                                scheduleWarningsByJobId.get(job.id) ?? [];
                              const operationalIndicators =
                                buildScheduleOperationalIndicators({
                                  job,
                                  roleSlotPeople: assignablePeople,
                                  readiness: projectReadinessByProjectId.get(
                                    job.projectId
                                  ),
                                  warnings: jobWarnings,
                                  todayDateKey
                                });

                              return (
                                <div
                                  key={`${group.key}-${job.id}`}
                                  className={`rounded-[4px] border px-4 py-4 ${getBoardCardSurfaceClass(job)}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                        {boardCardState.eyebrow}
                                      </p>
                                      <Link
                                        href={`/jobs/${job.id}`}
                                        className="mt-1 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                                      >
                                        {getScheduleJobTitle(job)}
                                      </Link>
                                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                        {job.customer?.name ??
                                          "Unknown customer"}
                                      </p>
                                      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                                        {boardCardState.title}
                                      </p>
                                    </div>
                                    <ScheduleJobStateBadges
                                      crewState={crewState}
                                      dispatchStatus={job.dispatchStatus}
                                      includeDispatchStatus
                                      justifyEnd
                                    />
                                  </div>

                                  <div className="mt-3 space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                      Schedule
                                    </p>
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                                      {formatDate(job.scheduledDate)}
                                    </p>
                                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                      {formatScheduleTimeWindow(job)}
                                    </p>
                                  </div>

                                  <div className="mt-3 space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                      Crew state
                                    </p>
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                                      {boardCardState.summary}
                                    </p>
                                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                      {crewState.detail}
                                    </p>
                                  </div>

                                  <ScheduleNotesPreview
                                    notes={job.scheduleNotes}
                                  />
                                  <ScheduleOperationalIndicators
                                    indicators={operationalIndicators}
                                  />
                                  <ScheduleWarningBadges
                                    warnings={jobWarnings}
                                  />

                                  <ScheduleJobActionLinks
                                    actionHref={
                                      buildScheduleHref({
                                        q: query,
                                        projectId: projectFilterId ?? undefined,
                                        view,
                                        crew: crewFilter,
                                        layout: scheduleLayout,
                                        date: plannerDateKey,
                                        action: primaryAction.action,
                                        jobId: job.id
                                      }) + "#schedule-action"
                                    }
                                    actionLabel={primaryAction.label}
                                    actionToneClass={primaryAction.toneClass}
                                    projectHref={`/projects/${job.projectId}`}
                                    projectLabel="Project Workspace"
                                    projectVariant="bordered"
                                    jobHref={`/jobs/${job.id}`}
                                    jobLabel="Open job"
                                    jobVariant="plain"
                                    size="default"
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-[4px] border border-dashed border-[var(--border-warm)] bg-white px-4 py-5">
                              <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {group.emptyTitle}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {group.emptyDescription}
                              </p>
                              {group.key === "unscheduled-ready" ? (
                                <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                  If work is missing here entirely, confirm
                                  upstream project readiness first and then
                                  create the job.
                                </div>
                              ) : null}
                              {group.key === "in-progress" ? (
                                <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                  Active execution still lives on the same job
                                  records. Move status forward from the job
                                  workspace when field work actually starts.
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                )
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={plannerEmptyState.eyebrow}
                    title={plannerEmptyState.title}
                    description={plannerEmptyState.description}
                  />
                </div>
              )}
            </CrewBoardDragDropLayer>
          </ScheduleDispatchBoardShell>

          {resolvedSearchParams.error ? (
            <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-[6px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_150px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] md:grid md:flex-1">
                  <span>Scheduled work</span>
                  <span>Customer / project</span>
                  <span>Crew</span>
                  <span>Date</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                    Schedule list
                  </p>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {visibleListItems.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-warm)]">
              {visibleListItems.length > 0 ? (
                visibleListItems.map((item) => {
                  if (item.type === "appointment") {
                    return (
                      <div
                        key={`appointment-${item.id}`}
                        className="px-5 py-4 sm:px-6"
                      >
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_190px] md:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                                Appointment
                              </p>
                              <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                {formatStatusLabel(item.status)}
                              </span>
                              {item.customerVisible ? (
                                <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                  Customer-visible
                                </span>
                              ) : null}
                            </div>
                            <Link
                              href={item.href}
                              className="mt-2 block text-base font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                            >
                              {item.title}
                            </Link>
                            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                              {formatStatusLabel(item.appointmentType)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                              {item.location ?? "Location pending"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                              Context
                            </p>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                              {item.customerName ??
                                item.opportunityTitle ??
                                "Lead appointment"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                              {item.projectName ?? item.subtitle}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                              Assigned
                            </p>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                              {item.assigneeLabel}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                              Person assignment
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                              Date
                            </p>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                              {formatDate(item.dateKey)}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                              {formatScheduleItemTimeWindow(item)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {item.contextHref && item.contextLabel ? (
                              <Link
                                href={item.contextHref}
                                className="inline-flex items-center rounded-[4px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                              >
                                {item.contextLabel}
                              </Link>
                            ) : null}
                            <Link
                              href={item.href}
                              className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                            >
                              Open appointment
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const job = visibleJobsById.get(item.id);

                  if (!job) {
                    return null;
                  }

                  const crewState = getCrewState(job);
                  const primaryAction = getPrimaryScheduleAction(job);
                  const boardCardState = getBoardCardState(job);
                  const jobWarnings = scheduleWarningsByJobId.get(job.id) ?? [];
                  const readinessBadge = getScheduleReadinessBadge({
                    dispatchStatus: job.dispatchStatus,
                    assignmentCount: job.assignmentCount,
                    warningCount: jobWarnings.length
                  });
                  const operationalIndicators =
                    buildScheduleOperationalIndicators({
                      job,
                      roleSlotPeople: assignablePeople,
                      readiness: projectReadinessByProjectId.get(job.projectId),
                      warnings: jobWarnings,
                      todayDateKey
                    });
                  const fieldHandoff = fieldHandoffsByJobId.get(job.id);

                  return (
                    <div key={job.id} className="px-5 py-4 sm:px-6">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_190px] md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                              {boardCardState.eyebrow}
                            </p>
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                getDispatchStatusBadgeClass(job.dispatchStatus)
                              ].join(" ")}
                            >
                              {formatStatusLabel(job.dispatchStatus)}
                            </span>
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                readinessBadge.className
                              ].join(" ")}
                            >
                              {readinessBadge.label}
                            </span>
                          </div>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="mt-2 block text-base font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
                          >
                            {getScheduleJobTitle(job)}
                          </Link>
                          <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                            {boardCardState.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {job.serviceTicket
                              ? `${formatStatusLabel(job.serviceTicket.ticketType)} service`
                              : (job.estimate?.referenceNumber ??
                                "Project-based work")}{" "}
                            ·{" "}
                            <span className="capitalize">
                              {formatStatusLabel(job.dispatchStatus)}
                            </span>
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {boardCardState.summary}
                          </p>
                          <ScheduleOperationalIndicators
                            indicators={operationalIndicators}
                          />
                          {fieldHandoff ? (
                            <div className="mt-3">
                              <ScheduleFieldHandoffPanel
                                handoff={fieldHandoff}
                                compact
                              />
                            </div>
                          ) : null}
                          <ScheduleNotesPreview notes={job.scheduleNotes} />
                          <ScheduleWarningBadges warnings={jobWarnings} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                            Continuity
                          </p>
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            {job.customer?.name ?? "Unknown customer"}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {job.project?.name ?? "Project"} ·{" "}
                            <Link
                              href={`/projects/${job.projectId}`}
                              className="hover:text-[var(--text-primary)]"
                            >
                              Project Workspace
                            </Link>
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                            Crew
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">
                              {job.assignmentCount > 0
                                ? formatAssignmentLabel(job.assignmentCount)
                                : "No crew assigned"}
                            </p>
                            <ScheduleJobStateBadges crewState={crewState} />
                          </div>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {crewState.detail}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] md:hidden">
                            Date
                          </p>
                          <p className="text-sm font-medium text-[var(--text-secondary)]">
                            {formatDate(job.scheduledDate)}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {job.scheduledStartAt
                              ? formatScheduleTimeWindow(job)
                              : "Time not set"}
                          </p>
                        </div>

                        <ScheduleJobActionLinks
                          actionHref={
                            buildCurrentScheduleHref({
                              action: primaryAction.action,
                              jobId: job.id
                            }) + "#schedule-action"
                          }
                          actionLabel={primaryAction.label}
                          actionToneClass={primaryAction.toneClass}
                          projectHref={`/projects/${job.projectId}`}
                          projectLabel="Project Workspace"
                          projectVariant="plain"
                          jobHref={`/jobs/${job.id}`}
                          jobLabel="Open job"
                          jobVariant="bordered"
                          dailyLogHref={buildDailyLogCaptureHref({
                            projectId: job.projectId,
                            jobId: job.id,
                            logDate: job.scheduledDate
                          })}
                          size="default"
                          justifyEnd
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-8 sm:px-8">
                  <AppEmptyState
                    eyebrow={listEmptyState.eyebrow}
                    title={listEmptyState.title}
                    description={listEmptyState.description}
                  />
                </div>
              )}
            </div>
          </section>
        </section>

        <WorkspaceComposerSheet
          id="schedule-action"
          title={
            selectedAction === "assign"
              ? "Manage crew assignment"
              : "Move schedule"
          }
          description={
            selectedJob
              ? `Working from ${getScheduleJobTitle(selectedJob)} keeps the schedule surface tied to the same project and job chain.`
              : "Pick a job from the schedule surface to adjust date commitment or crew assignment."
          }
          open={showComposer}
          openHref={
            selectedJob && selectedAction
              ? buildCurrentScheduleHref({
                  action: selectedAction,
                  jobId: selectedJob.id
                }) + "#schedule-action"
              : buildCurrentScheduleHref({}) + "#schedule-action"
          }
          closeHref={buildCurrentScheduleHref({})}
          openLabel="Open schedule action panel"
        >
          {selectedJob ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                  Selected job
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  Selected job action panel
                </h2>
              </div>
              <ScheduleSelectedJobPanelSummary
                title={getScheduleJobTitle(selectedJob)}
                customerName={selectedJob.customer?.name ?? "Unknown customer"}
                dispatchStatusLabel={formatStatusLabel(
                  selectedJob.dispatchStatus
                )}
                serviceTicket={selectedJob.serviceTicket}
                assignmentSummary={
                  selectedJobAssignments.length > 0
                    ? `${formatAssignmentLabel(selectedJobAssignments.length)} already attached`
                    : "Crew not assigned yet"
                }
                indicators={selectedJobOperationalIndicators}
                projectHref={`/projects/${selectedJob.projectId}`}
                jobHref={`/jobs/${selectedJob.id}`}
                dailyLogHref={buildDailyLogCaptureHref({
                  projectId: selectedJob.projectId,
                  jobId: selectedJob.id,
                  logDate: selectedJob.scheduledDate
                })}
              />
              {selectedJobFieldHandoff ? (
                <ScheduleFieldHandoffPanel
                  handoff={selectedJobFieldHandoff}
                  packet={selectedJobFieldHandoffPacket}
                />
              ) : null}
              {selectedJobCrewState ? (
                <div className="rounded-[6px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    Crew continuity
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${selectedJobCrewState.emphasisClass}`}
                  >
                    {selectedJobCrewState.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedJobCrewState.detail}
                  </p>
                </div>
              ) : null}

              <ScheduleNotesPreview notes={selectedJob.scheduleNotes} />

              <ScheduleWarningDetails
                warnings={selectedJobScheduleWarnings}
                readinessBlocked={
                  selectedJobReadiness
                    ? !selectedJobReadiness.isReadyToSchedule
                    : false
                }
                readinessDetail={
                  selectedJobReadiness &&
                  !selectedJobReadiness.isReadyToSchedule
                    ? selectedJobReadiness.blockers
                        .slice(0, 2)
                        .map((blocker) =>
                          getReadinessBlockerDetail(
                            blocker,
                            selectedJobReadiness
                          )
                        )
                        .join(" ")
                    : null
                }
              />

              {selectedJobEquipmentReadiness ? (
                <div className="rounded-[6px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    Equipment readiness
                  </p>
                  <p
                    className={[
                      "mt-2 text-sm font-semibold",
                      selectedJobEquipmentReadiness.warnings.length > 0
                        ? "text-amber-700"
                        : "text-emerald-700"
                    ].join(" ")}
                  >
                    {selectedJobEquipmentReadiness.assignmentCount} assigned /{" "}
                    {selectedJobEquipmentReadiness.requirementCount} required
                    rows
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedJobEquipmentReadiness.warnings.length > 0
                      ? `${selectedJobEquipmentReadiness.warnings.length} advisory warning${
                          selectedJobEquipmentReadiness.warnings.length === 1
                            ? ""
                            : "s"
                        } on this job. Scheduling remains human-confirmed.`
                      : "No equipment warnings are currently derived for this job."}
                  </p>
                  {selectedJobEquipmentReadiness.warnings.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {selectedJobEquipmentReadiness.warnings
                        .slice(0, 3)
                        .map((warning) => (
                          <li key={warning.id}>- {warning.title}</li>
                        ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {selectedAction === "assign" ? (
                selectedJobNeedsScheduleBeforeCrew ? (
                  <div className="space-y-4">
                    <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      Unscheduled job. Choose a date and time first; crew
                      assignment stays on this same job after the schedule
                      commitment is real.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={
                          buildCurrentScheduleHref({
                            action: "schedule",
                            jobId: selectedJob.id
                          }) + "#schedule-action"
                        }
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${schedulePrimaryActionToneClassName}`}
                      >
                        Set schedule first
                      </Link>
                    </div>
                  </div>
                ) : assignablePeople.length > 0 || laborVendors.length > 0 ? (
                  <ScheduleCrewAssignmentForm
                    action={assignCrewAction}
                    unassignAction={unassignCrewAction}
                    jobId={selectedJob.id}
                    projectId={selectedJob.projectId}
                    estimateId={selectedJob.estimateId}
                    redirectTo={redirectTo}
                    assignments={selectedJobAssignments.map((assignment) => ({
                      id: assignment.id,
                      role: assignment.role,
                      assignedStartAt: assignment.assignedStartAt,
                      assignedEndAt: assignment.assignedEndAt,
                      person: assignment.person
                        ? {
                            id: assignment.person.id,
                            displayName: assignment.person.displayName
                          }
                        : null,
                      vendor: assignment.vendor
                        ? {
                            id: assignment.vendor.id,
                            name: assignment.vendor.name
                          }
                        : null
                    }))}
                    people={assignablePeople}
                    vendors={laborVendors}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      Crew not assigned. Add active assignable people or
                      labor-provider vendors before production starts.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/people"
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                      >
                        Open people
                      </Link>
                      <Link
                        href="/vendors"
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
                      >
                        Open vendors
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[6px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          Prepare move
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                          Preview a CrewBoard target before saving. The selected
                          target only fills the Move schedule review.
                        </p>
                      </div>
                      {selectedMoveProposal ? (
                        <Link
                          href={
                            buildCurrentScheduleHref({
                              action: "schedule",
                              jobId: selectedJob.id
                            }) + "#schedule-action"
                          }
                          className={scheduleCompactLinkClassName}
                        >
                          Clear prepared move
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        Target date
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {plannerDays.map((day) => {
                          const target = createCrewBoardDateDropTarget(
                            day.dateKey
                          );
                          const label = formatDropTargetLabel(target);
                          const boardDate = getBoardDatePresentation(
                            day.dateKey,
                            today
                          );
                          const isPrepared =
                            selectedMoveTarget?.kind === "date" &&
                            selectedMoveTarget.date === day.dateKey;

                          return (
                            <Link
                              key={day.dateKey}
                              href={
                                buildCurrentScheduleHref({
                                  action: "schedule",
                                  jobId: selectedJob.id,
                                  moveDate: day.dateKey
                                }) + "#schedule-action"
                              }
                              className={[
                                "inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                isPrepared
                                  ? schedulePrimaryActionToneClassName
                                  : scheduleSecondaryActionToneClassName
                              ].join(" ")}
                              aria-label={`Preview move to ${label}`}
                            >
                              {boardDate.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                        Time on selected day
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {MOVE_PREVIEW_TIME_BUCKETS.map((bucket) => {
                          const target = createCrewBoardTimeBucketDropTarget({
                            date: plannerDateKey,
                            startTime: bucket.startTime,
                            endTime: bucket.endTime
                          });
                          const label = formatDropTargetLabel(target);
                          const isPrepared =
                            selectedMoveTarget?.kind === "time_bucket" &&
                            selectedMoveTarget.date === plannerDateKey &&
                            selectedMoveTarget.startTime === bucket.startTime &&
                            selectedMoveTarget.endTime === bucket.endTime;

                          return (
                            <Link
                              key={`${bucket.startTime}-${bucket.endTime}`}
                              href={
                                buildCurrentScheduleHref({
                                  action: "schedule",
                                  jobId: selectedJob.id,
                                  moveDate: plannerDateKey,
                                  moveStart: bucket.startTime,
                                  moveEnd: bucket.endTime
                                }) + "#schedule-action"
                              }
                              className={[
                                "inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                                isPrepared
                                  ? schedulePrimaryActionToneClassName
                                  : scheduleMutedActionToneClassName
                              ].join(" ")}
                              aria-label={`Preview move to ${label}`}
                            >
                              {bucket.startTime}-{bucket.endTime}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <ScheduleJobForm
                    key={`${selectedJob.id}:${selectedMoveProposalKey}`}
                    action={scheduleJobAction}
                    unscheduleAction={unscheduleJobAction}
                    job={{
                      id: selectedJob.id,
                      dispatchStatus: selectedJob.dispatchStatus,
                      scheduledDate: selectedJob.scheduledDate,
                      scheduledStartAt: selectedJob.scheduledStartAt,
                      scheduledEndAt: selectedJob.scheduledEndAt,
                      scheduleNotes: selectedJob.scheduleNotes
                    }}
                    redirectTo={redirectTo}
                    preparedProposal={selectedMoveProposal}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={scheduleInsetPanelClassName}>
              No job selected yet. Pick an existing job from the unscheduled,
              today, upcoming, or crew queues to schedule work or attach crew
              without leaving CrewBoard.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
