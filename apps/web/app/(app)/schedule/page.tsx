import Link from "next/link";
import type { ReactNode } from "react";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { ScheduleCrewAssignmentForm } from "@/components/schedule-crew-assignment-form";
import { ScheduleJobForm } from "@/components/schedule-job-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  assignCrewAction,
  scheduleJobAction,
  unassignCrewAction,
  unscheduleJobAction
} from "@/lib/jobs/actions";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { listOpportunities } from "@/lib/opportunities/data";
import {
  buildScheduleHref,
  type CrewViewKey,
  type ScheduleActionKey,
  type ScheduleItemViewKey,
  type ScheduleLayoutKey,
  type ScheduleViewKey
} from "@/lib/schedule/links";
import {
  buildScheduleItems,
  type ScheduleItem
} from "@/lib/schedule/read-model";
import { listAppointments } from "@/lib/appointments/data";
import { listVendors } from "@/lib/vendors/data";

const SCHEDULE_VIEW_OPTIONS = [
  { value: "all", label: "All scheduled work" },
  { value: "unscheduled", label: "Unscheduled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" }
] as const;

const CREW_VIEW_OPTIONS = [
  { value: "all", label: "All crew states" },
  { value: "assigned", label: "Crew assigned" },
  { value: "unassigned", label: "Needs crew" }
] as const;

const SCHEDULE_LAYOUT_OPTIONS = [
  { value: "week", label: "Week planner" },
  { value: "day", label: "Day focus" },
  { value: "board", label: "Board" }
] as const;

const SCHEDULE_ITEM_VIEW_OPTIONS = [
  { value: "all", label: "All" },
  { value: "jobs", label: "Jobs" },
  { value: "appointments", label: "Appointments" }
] as const;

const DAY_TIMELINE_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const schedulePrimaryActionClassName =
  "border-[var(--graphite)] bg-[var(--graphite)] text-white hover:bg-[var(--graphite-light)]";
const scheduleSecondaryActionClassName =
  "border-[var(--border-warm)] bg-white text-[var(--text-primary)] hover:bg-[var(--highlight)]";
const scheduleMutedActionClassName =
  "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-primary)] hover:bg-white";
const schedulePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-sm";
const schedulePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[var(--highlight)]/45 px-5 py-4 sm:px-6";
const scheduleInsetPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3";
const scheduleFieldClassName =
  "min-w-0 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)]";

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
  error?: string | string[];
  message?: string | string[];
};

type SchedulePageProps = {
  searchParams?: Promise<RawScheduleSearchParams>;
};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
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
    case "board":
      return normalizeOptionalSearchParam(value) as Exclude<
        ScheduleLayoutKey,
        "week"
      >;
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
        "Schedule starts at the job/schedule stage of the lifecycle. Create or clear the upstream project, estimate, contract, deposit, or financing work first, then canonical jobs will appear here."
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
        "Switch back to all crew states or review jobs that still need people or labor vendors attached. Crew assignment belongs on the canonical job after the schedule handoff is real."
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
      eyebrow: "No unscheduled work",
      title: "No jobs are waiting on scheduling",
      description:
        "As commercially ready projects create canonical jobs without committed dates, they will surface here. If expected work is missing, resolve the Project Workspace readiness chain first."
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
        "Jobs appear here only after a real date commitment is saved on the canonical job record. Unscheduled jobs stay in the ready-work queue."
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
      label: "Unscheduled job",
      detail:
        "Choose a date and time before assigning people or labor-provider vendors.",
      emphasisClass: "text-amber-700",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: "Crew not assigned",
    detail:
      "Assign a crew or labor-provider vendor before production starts.",
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
      toneClass: schedulePrimaryActionClassName
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
    toneClass: scheduleSecondaryActionClassName
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
      toneClass: scheduleMutedActionClassName
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
      eyebrow: "Unscheduled / ready",
      title: "Waiting on first date commitment",
      summary:
        "Commercial handoff is already downstream on the job record. Set the first calendar date to move this work onto the board."
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

function ScheduleJobActionLinks(input: {
  actionHref: string;
  actionLabel: string;
  actionToneClass: string;
  projectHref: string;
  projectLabel: string;
  projectVariant?: "plain" | "bordered";
  jobHref?: string;
  jobLabel?: string;
  jobVariant?: "plain" | "bordered";
  size?: "compact" | "default";
  justifyEnd?: boolean;
}) {
  const actionPadding =
    input.size === "compact" ? "px-2.5 py-1.5" : "px-3 py-2";
  const secondaryPadding =
    input.size === "compact" ? "px-2.5 py-1.5" : "px-3 py-2";
  const secondaryText =
    input.size === "compact"
      ? "text-xs font-semibold uppercase tracking-[0.14em]"
      : "text-xs font-semibold uppercase tracking-[0.14em]";

  const projectClassName =
    input.projectVariant === "bordered"
      ? `inline-flex items-center rounded-[4px] border ${scheduleSecondaryActionClassName} ${secondaryPadding} ${secondaryText} transition`
      : `inline-flex items-center rounded-[4px] ${secondaryPadding} ${secondaryText} text-slate-500 transition hover:text-slate-900`;

  const jobClassName =
    input.jobVariant === "bordered"
      ? `inline-flex items-center rounded-[4px] border ${scheduleSecondaryActionClassName} ${secondaryPadding} ${secondaryText} transition`
      : `inline-flex items-center rounded-[4px] ${secondaryPadding} ${secondaryText} text-slate-500 transition hover:text-slate-900`;

  return (
    <div
      className={`flex flex-wrap gap-2 ${input.justifyEnd ? "md:justify-end" : ""}`}
    >
      <Link
        href={input.actionHref}
        className={[
          `inline-flex items-center rounded-[4px] border ${actionPadding} text-xs font-semibold uppercase tracking-[0.14em] transition`,
          input.actionToneClass
        ].join(" ")}
      >
        {input.actionLabel}
      </Link>
      <Link href={input.projectHref} className={projectClassName}>
        {input.projectLabel}
      </Link>
      {input.jobHref && input.jobLabel ? (
        <Link href={input.jobHref} className={jobClassName}>
          {input.jobLabel}
        </Link>
      ) : null}
    </div>
  );
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
        "Unscheduled work has reached job/schedule but has no date commitment yet. Open the ready-work queue or selected job action panel to set timing without bypassing project readiness."
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
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {input.label}
      </span>
      <span className="font-medium text-slate-950">{input.value}</span>
      <Link
        href={input.clearHref}
        className="inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
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

  const [jobs, appointments, opportunities, people, vendors] =
    await Promise.all([
      listJobs(),
      listAppointments(),
      listOpportunities(),
      listPeople(),
      listVendors()
    ]);
  const assignmentsByJobId = await listJobAssignmentsByJobIds(
    jobs.map((job) => job.id),
    "/schedule"
  );

  const tomorrow = addDays(today, 1);
  const upcomingHorizon = addDays(today, 8);
  const scheduleLayout = resolvedSearchParams.layout;
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

  const unscheduledJobs = jobsWithAssignments.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const scheduledTodayJobs = jobsWithAssignments.filter((job) => job.isToday);
  const inProgressJobs = jobsWithAssignments.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const upcomingJobs = jobsWithAssignments.filter((job) => job.isUpcoming);
  const assignedJobs = jobsWithAssignments.filter(
    (job) => job.assignmentCount > 0
  );
  const todayWithoutCrewJobs = scheduledTodayJobs.filter(
    (job) => job.assignmentCount === 0
  );
  const activeTodayJobs = [
    ...inProgressJobs,
    ...scheduledTodayJobs.filter((job) => job.dispatchStatus !== "in_progress")
  ];
  const scheduledJobs = jobsWithAssignments.filter(
    (job) => job.scheduledDate !== null
  );
  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const appointmentOpportunityIds = new Set(
    scheduledAppointments
      .filter((appointment) => appointment.appointmentType === "site_visit")
      .map((appointment) => appointment.opportunityId)
      .filter(Boolean)
  );
  const opportunityAssessments = opportunities.filter(
    (opportunity) =>
      opportunity.status === "site_assessment_scheduled" &&
      opportunity.siteAssessmentScheduledAt &&
      !appointmentOpportunityIds.has(opportunity.id)
  );
  const todayAppointments = scheduledAppointments.filter(
    (appointment) =>
      new Date(appointment.startsAt).toISOString().slice(0, 10) === todayDateKey
  );
  const upcomingAppointments = scheduledAppointments.filter((appointment) => {
    const dateKey = new Date(appointment.startsAt).toISOString().slice(0, 10);
    return dateKey > todayDateKey && dateKey < toDateKey(upcomingHorizon);
  });
  const latestScheduledJobs = [...scheduledJobs]
    .sort(
      (left, right) => getScheduledSortTime(right) - getScheduledSortTime(left)
    )
    .slice(0, 3);

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
  const selectedJobNeedsScheduleBeforeCrew =
    selectedAction === "assign" &&
    selectedJob?.dispatchStatus === "unscheduled";

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
                : job.dispatchStatus === "in_progress";

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

  const tomorrowDateKey = toDateKey(tomorrow);
  const nextSevenDaysEnd = addDays(today, 7);
  const boardTimingJobs = visibleJobs.filter(
    (job) => job.dispatchStatus !== "in_progress"
  );
  const unscheduledReadyBoardJobs = boardTimingJobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const todayBoardJobs = boardTimingJobs.filter(
    (job) => job.scheduledDate === todayDateKey
  );
  const tomorrowBoardJobs = boardTimingJobs.filter(
    (job) => job.scheduledDate === tomorrowDateKey
  );
  const nextSevenDaysBoardJobs = boardTimingJobs.filter((job) => {
    const scheduledDate = toDate(job.scheduledDate);

    return (
      scheduledDate !== null &&
      scheduledDate > tomorrow &&
      scheduledDate <= nextSevenDaysEnd
    );
  });
  const laterScheduledBoardJobs = boardTimingJobs.filter((job) => {
    const scheduledDate = toDate(job.scheduledDate);

    return scheduledDate !== null && scheduledDate > nextSevenDaysEnd;
  });
  const inProgressBoardJobs = visibleJobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const boardTimingGroups = [
    {
      key: "unscheduled-ready",
      title: "Unscheduled / Ready",
      description:
        "These jobs already exist on the project chain, but operations still needs to set the first real date commitment.",
      jobs: unscheduledReadyBoardJobs,
      emptyTitle: "No ready work is waiting on scheduling.",
      emptyDescription:
        "When commercially ready jobs exist without a committed date, they will collect here first.",
      surfaceClass: "border-amber-200 bg-amber-50/45"
    },
    {
      key: "today",
      title: "Today",
      description:
        "Use this lane to keep the immediate field picture visible without leaving the shared scheduling surface.",
      jobs: todayBoardJobs,
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
      jobs: tomorrowBoardJobs,
      emptyTitle: "Nothing is lined up for tomorrow yet.",
      emptyDescription:
        "As soon as tomorrow's timing is captured on shared jobs, they will appear here.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "next-seven-days",
      title: "Next 7 days",
      description:
        "This lane holds the near-term schedule horizon after tomorrow and before later backlog work.",
      jobs: nextSevenDaysBoardJobs,
      emptyTitle: "No near-term scheduled work is queued after tomorrow.",
      emptyDescription:
        "The next week of scheduled jobs will gather here once the board moves beyond tomorrow.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    },
    {
      key: "later-scheduled",
      title: "Later scheduled",
      description:
        "Longer-horizon commitments stay visible here without turning `/schedule` into a second planning system.",
      jobs: laterScheduledBoardJobs,
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
      jobs: inProgressBoardJobs,
      emptyTitle: "No jobs are marked in progress.",
      emptyDescription:
        "Once crews are actively executing work on jobs, those records will surface here.",
      surfaceClass: "border-[var(--border-warm)] bg-[var(--highlight)]"
    }
  ] as const;

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
  const scheduledBoardGroups = plannerDays
    .map((day) => ({
      date: day.dateKey,
      jobs: visibleScheduledJobs.filter(
        (job) => job.scheduledDate === day.dateKey
      ),
      appointments: visiblePlannerAppointments.filter(
        (item) => item.dateKey === day.dateKey
      ),
      isToday: day.dateKey === todayDateKey
    }))
    .filter((group) => group.jobs.length > 0 || group.appointments.length > 0);
  const plannerJobCount = visibleScheduledJobs.length;
  const plannerAppointmentCount = visiblePlannerAppointments.length;
  const plannerItemCount = plannerJobCount + plannerAppointmentCount;
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
    Boolean(selectedAction && selectedJobId);
  const assignablePeople = people.filter(
    (person) => person.isActive && person.isAssignable
  );
  const laborVendors = vendors.filter(
    (vendor) => vendor.isActive && vendor.isLaborProvider
  );
  const scheduleViews = SCHEDULE_VIEW_OPTIONS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? jobsWithAssignments.length
        : option.value === "unscheduled"
          ? unscheduledJobs.length
          : option.value === "scheduled"
            ? scheduledJobs.length
            : option.value === "today"
              ? scheduledTodayJobs.length
              : option.value === "upcoming"
                ? upcomingJobs.length
                : inProgressJobs.length
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
      label: "Unscheduled jobs",
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
      key: "today",
      label: "Scheduled today",
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
      key: "upcoming",
      label: "Upcoming",
      value: upcomingJobs.length + upcomingAppointments.length,
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
        "These jobs have reached the job/schedule stage. Set a day and time on the canonical job record, or open the project if upstream readiness looks wrong.",
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
    }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Schedule"
      title={`Scheduling board for ${organizationContext.organization.displayName}`}
      description="Run the operational schedule from one shared job surface: review what still needs timing, what is committed today, who is assigned, and where each job points back into the project chain."
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
                item.active ? "ring-1 ring-inset ring-[#171717]" : ""
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
                <span className="text-xs font-medium text-slate-500">
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
            Review the schedule as a shared job-entry surface, then jump into
            the job or project workspace when field execution, readiness, or
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
            <button
              type="submit"
              className={`inline-flex items-center justify-center rounded-[4px] border px-4 py-2.5 text-sm font-medium transition ${scheduleSecondaryActionClassName}`}
            >
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
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                    "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionClassName}`
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                    "inline-flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionClassName}`
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                    "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--graphite)] text-white"
                      : `border ${scheduleSecondaryActionClassName}`
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
            className={`inline-flex items-center rounded-[4px] border px-4 py-2.5 text-sm font-medium transition ${schedulePrimaryActionClassName}`}
          >
            Open jobs manager
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
            <section className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 shadow-sm sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Active filters
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">
                    Schedule handoff context is active
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    These filters stay intersected, so you can clear any one
                    chip without dropping the unrelated schedule state.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProjectFilter ? (
                    <Link
                      href={`/projects/${activeProjectFilter.id}`}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                    >
                      Open project
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
                        ? `${getScheduleActionSummaryLabel(selectedAction)} · ${
                            selectedJob.project?.name ?? "Untitled job"
                          }`
                        : getScheduleActionSummaryLabel(selectedAction)
                    }
                    clearHref={clearSelectedContextHref}
                  />
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6 text-slate-500">
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
              </div>
            </section>
          ) : null}

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Schedule control
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                    Scheduling command center
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use the loaded job/schedule state to see why work is
                    unscheduled, what is missing, and whether to resolve it from
                    Schedule or the Project Workspace.
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {nextActions.filter((action) => !action.empty).length} active
                </p>
              </div>
            </div>

            <div className="grid gap-px bg-[var(--border-warm)] lg:grid-cols-2">
              {nextActions.map((action) => (
                <div key={action.key} className="bg-white px-5 py-4 sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {action.eyebrow}
                  </p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-slate-950">
                    {action.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={action.href}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                    >
                      {action.ctaLabel}
                    </Link>
                    {action.empty ? (
                      <span className="text-sm text-slate-400">
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
                                className="text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                              >
                                {job.project?.name ?? "Untitled job"}
                              </Link>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
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
                                className="inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
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

          <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
            <ManagerDashboardCard
              eyebrow="Needs commitment"
              title="Ready work queue"
              description="These jobs already exist on the project chain. If a job is here, the missing piece is schedule commitment; if expected work is absent, resolve upstream project readiness first."
              actionHref={buildCurrentScheduleHref({ view: "unscheduled" })}
              actionLabel="Review queue"
              items={unscheduledJobs.slice(0, 4).map((job) => {
                const crewState = getCrewState(job);
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href: buildCurrentScheduleHref({
                    action: primaryAction.action,
                    jobId: job.id
                  }),
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${job.customer?.name ?? "Unknown customer"} · ${job.estimate?.referenceNumber ?? "Project-based work"}`,
                  meta:
                    crewState.label === "Assigned"
                      ? `${formatAssignmentLabel(job.assignmentCount)} ready once timing is set`
                      : "Needs scheduling before crew commitment becomes actionable",
                  badge: "Unscheduled",
                  trailing: primaryAction.label
                };
              })}
              emptyTitle="No jobs are waiting on scheduling right now."
              emptyDescription="Ready jobs surface here after the Project Workspace clears upstream readiness and a canonical job exists without timing."
            />

            <ManagerDashboardCard
              eyebrow="Today"
              title="Scheduled work for today"
              description="Keep the immediate field picture visible without turning the page into a full calendar app."
              actionHref={buildCurrentScheduleHref({ view: "today" })}
              actionLabel="View today"
              items={scheduledTodayJobs.slice(0, 4).map((job) => {
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
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${job.customer?.name ?? "Unknown customer"} · ${formatDateTime(job.scheduledStartAt)}`,
                  meta:
                    crewState.label === "Assigned"
                      ? `Crew ${crewState.detail}`
                      : crewState.detail,
                  badge:
                    job.dispatchStatus === "in_progress"
                      ? "In progress"
                      : crewState.label === "Needs crew"
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
              eyebrow="Upcoming"
              title="Next scheduled work"
              description="This keeps the next few commitments in view so project continuity and crew planning stay connected."
              actionHref={buildCurrentScheduleHref({ view: "upcoming" })}
              actionLabel="View upcoming"
              items={upcomingJobs.slice(0, 4).map((job) => {
                const crewState = getCrewState(job);
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href: buildCurrentScheduleHref({
                    action: primaryAction.action,
                    jobId: job.id
                  }),
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${job.customer?.name ?? "Unknown customer"} · ${formatDate(job.scheduledDate)}`,
                  meta:
                    crewState.label === "Assigned"
                      ? `${formatAssignmentLabel(job.assignmentCount)} in place`
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
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${formatAssignmentLabel(job.assignmentCount)} · ${job.crewSummary.join(", ")}`,
                  meta: job.crewVendor?.name
                    ? `Crew vendor ${job.crewVendor.name}`
                    : job.crewLeads.length > 0
                      ? `Lead ${job.crewLeads.join(", ")}`
                      : "Crew attached on assignment rows",
                  badge:
                    job.dispatchStatus === "in_progress" ? "Live" : "Assigned",
                  trailing:
                    primaryAction.label === "Refine schedule"
                      ? "Manage crew"
                      : primaryAction.label
                };
              })}
              emptyTitle="No jobs have crew assignments yet."
              emptyDescription="As people or subcontractor vendors get attached to jobs, they will show up here for quick review."
            />
          </section>

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Calendar planner
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                    Scheduled timeline
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Run the shared schedule as a bounded planner on top of jobs.
                    Keep unscheduled work separate, review dated work by day or
                    week, and reschedule through the same job action path.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {SCHEDULE_LAYOUT_OPTIONS.map((option) => {
                    const isActive = scheduleLayout === option.value;

                    return (
                      <Link
                        key={option.value}
                        href={buildScheduleHref({
                          q: query,
                          projectId: projectFilterId ?? undefined,
                          view,
                          crew: crewFilter,
                          layout: option.value,
                          date: plannerDateKey
                        })}
                        className={[
                          "inline-flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "bg-[var(--graphite)] text-white"
                            : `border ${scheduleSecondaryActionClassName}`
                        ].join(" ")}
                      >
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-warm)] pt-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
                    {scheduleLayout === "board"
                      ? visibleJobs.length
                      : plannerItemCount}{" "}
                    {scheduleLayout === "board"
                      ? "visible jobs"
                      : "scheduled items"}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    {scheduleLayout === "board"
                      ? visibleJobs.filter((job) => job.assignmentCount === 0)
                          .length
                      : plannerNeedsCrewCount}{" "}
                    need crew
                  </span>
                  <p className="text-sm leading-6 text-slate-500">
                    {scheduleLayout === "board"
                      ? "Grouped by operational timing"
                      : plannerRangeLabel}
                  </p>
                </div>

                {scheduleLayout === "board" ? (
                  <p className="max-w-xl text-sm leading-6 text-slate-500">
                    This board groups the current filtered job set into one
                    operational picture without creating a second dispatch or
                    calendar model.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={plannerPrevHref}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                    >
                      Previous
                    </Link>
                    <Link
                      href={plannerTodayHref}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                    >
                      Today
                    </Link>
                    <Link
                      href={plannerNextHref}
                      className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {plannerItemCount > 0 ? (
              scheduleLayout === "day" ? (
                <div className="px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border-warm)] pb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatLongDateFromDate(plannerAnchorDate)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
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
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Time not set
                      </p>
                      <div className="mt-3 space-y-3">
                        {untimedDayJobs.map((job) => {
                          const crewState = getCrewState(job);
                          const primaryAction = getBoardPrimaryAction(job);
                          const boardCardState = getBoardCardState(job);

                          return (
                            <div
                              key={`untimed-${job.id}`}
                              className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    {boardCardState.eyebrow}
                                  </p>
                                  <Link
                                    href={`/jobs/${job.id}`}
                                    className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                  >
                                    {job.project?.name ?? "Untitled job"}
                                  </Link>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {job.customer?.name ?? "Unknown customer"}
                                  </p>
                                  <p className="mt-2 text-sm font-medium text-slate-800">
                                    {boardCardState.title}
                                  </p>
                                </div>
                                <ScheduleJobStateBadges crewState={crewState} />
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {boardCardState.summary}
                              </p>

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
                                projectLabel="Open project"
                                projectVariant="plain"
                                size="compact"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {selectedDayAppointments.length > 0 ? (
                    <div className="mt-4 rounded-[4px] border border-[var(--border-warm)] bg-[var(--highlight)] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Appointment ·{" "}
                                  {formatStatusLabel(
                                    appointment.appointmentType
                                  )}
                                </p>
                                <Link
                                  href={appointment.href}
                                  className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                >
                                  {appointment.title}
                                </Link>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {formatScheduleItemTimeWindow(appointment)} ·{" "}
                                  {appointment.assigneeLabel}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
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
                                  className="inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                                >
                                  {appointment.contextLabel}
                                </Link>
                              ) : null}
                              <Link
                                href={appointment.href}
                                className={`inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
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
                      <div
                        key={bucket.hour}
                        className="grid grid-cols-[92px_minmax(0,1fr)] gap-px bg-[var(--border-warm)]"
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

                                return (
                                  <div
                                    key={`${bucket.hour}-${job.id}`}
                                    className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                          {boardCardState.eyebrow}
                                        </p>
                                        <Link
                                          href={`/jobs/${job.id}`}
                                          className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                        >
                                          {job.project?.name ?? "Untitled job"}
                                        </Link>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                          {job.customer?.name ??
                                            "Unknown customer"}{" "}
                                          · {formatScheduleTimeWindow(job)}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-800">
                                          {boardCardState.title}
                                        </p>
                                      </div>
                                      <ScheduleJobStateBadges
                                        crewState={crewState}
                                      />
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {boardCardState.summary}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      {crewState.detail}
                                    </p>

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
                                      actionToneClass={primaryAction.toneClass}
                                      projectHref={`/projects/${job.projectId}`}
                                      projectLabel="Project"
                                      projectVariant="plain"
                                      jobHref={`/jobs/${job.id}`}
                                      jobLabel="Open job"
                                      jobVariant="bordered"
                                      size="compact"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="min-h-16 rounded-[4px] border border-dashed border-[var(--border-warm)] bg-[var(--highlight)]" />
                          )}
                        </div>
                      </div>
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
                      <section
                        key={day.dateKey}
                        className={[
                          "bg-white px-4 py-4",
                          day.dateKey === todayDateKey
                            ? "bg-[var(--highlight)]"
                            : ""
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-warm)] pb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {boardDate.title}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                              {boardDate.subtitle}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                              {dayItemCount} item{dayItemCount === 1 ? "" : "s"}
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

                                return (
                                  <div
                                    key={job.id}
                                    className={`rounded-[4px] border px-3 py-3 ${getScheduleSurfaceClass(job)}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                          {boardCardState.eyebrow}
                                        </p>
                                        <Link
                                          href={`/jobs/${job.id}`}
                                          className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                        >
                                          {job.project?.name ?? "Untitled job"}
                                        </Link>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                          {job.customer?.name ??
                                            "Unknown customer"}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-800">
                                          {boardCardState.title}
                                        </p>
                                      </div>
                                      <ScheduleJobStateBadges
                                        crewState={crewState}
                                      />
                                    </div>

                                    <p className="mt-3 text-xs font-medium text-slate-700">
                                      {formatScheduleTimeWindow(job)}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      {boardCardState.summary}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      {crewState.detail}
                                    </p>

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
                                      actionToneClass={primaryAction.toneClass}
                                      projectHref={`/projects/${job.projectId}`}
                                      projectLabel="Project"
                                      projectVariant="plain"
                                      size="compact"
                                    />
                                  </div>
                                );
                              })}
                              {dayAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  className={`rounded-[4px] border px-3 py-3 ${getScheduleItemSurfaceClass(appointment)}`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        Appointment ·{" "}
                                        {formatStatusLabel(
                                          appointment.appointmentType
                                        )}
                                      </p>
                                      <Link
                                        href={appointment.href}
                                        className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                      >
                                        {appointment.title}
                                      </Link>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {appointment.subtitle}
                                      </p>
                                    </div>
                                    {appointment.customerVisible ? (
                                      <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                        Customer-visible
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-3 text-xs font-medium text-slate-700">
                                    {formatScheduleItemTimeWindow(appointment)}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
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
                                        className="inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                                      >
                                        {appointment.contextLabel}
                                      </Link>
                                    ) : null}
                                    <Link
                                      href={appointment.href}
                                      className={`inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
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
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="grid gap-4 px-5 py-4 sm:px-6 xl:grid-cols-2 2xl:grid-cols-3">
                  {boardTimingGroups.map((group) => (
                    <section
                      key={group.key}
                      className={`flex flex-col border ${group.surfaceClass}`}
                    >
                      <div className="border-b border-[var(--border-warm)] px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-950">
                              {group.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {group.description}
                            </p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
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

                            return (
                              <div
                                key={`${group.key}-${job.id}`}
                                className={`rounded-[4px] border px-4 py-4 ${getBoardCardSurfaceClass(job)}`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                      {boardCardState.eyebrow}
                                    </p>
                                    <Link
                                      href={`/jobs/${job.id}`}
                                      className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                    >
                                      {job.project?.name ?? "Untitled job"}
                                    </Link>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                      {job.customer?.name ?? "Unknown customer"}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-slate-800">
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
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Schedule
                                  </p>
                                  <p className="text-sm font-medium text-slate-700">
                                    {formatDate(job.scheduledDate)}
                                  </p>
                                  <p className="text-sm leading-6 text-slate-500">
                                    {formatScheduleTimeWindow(job)}
                                  </p>
                                </div>

                                <div className="mt-3 space-y-1">
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Crew state
                                  </p>
                                  <p className="text-sm font-medium text-slate-700">
                                    {boardCardState.summary}
                                  </p>
                                  <p className="text-sm leading-6 text-slate-500">
                                    {crewState.detail}
                                  </p>
                                </div>

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
                                  projectLabel="Open project"
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
                            <p className="text-sm font-semibold text-slate-900">
                              {group.emptyTitle}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {group.emptyDescription}
                            </p>
                            {group.key === "unscheduled-ready" ? (
                              <div className="mt-3 text-sm leading-6 text-slate-500">
                                If work is missing here entirely, confirm
                                upstream project readiness first and then create
                                the job.
                              </div>
                            ) : null}
                            {group.key === "in-progress" ? (
                              <div className="mt-3 text-sm leading-6 text-slate-500">
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
          </section>

          {resolvedSearchParams.error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <section className={schedulePanelClassName}>
            <div className={schedulePanelHeaderClassName}>
              <div className="flex items-end justify-between gap-4">
                <div className="hidden grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_150px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                  <span>Scheduled work</span>
                  <span>Customer / project</span>
                  <span>Crew</span>
                  <span>Date</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="md:hidden">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Schedule list
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {visibleListItems.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
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
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                              className="mt-2 block text-base font-semibold text-slate-950 transition hover:text-brand-700"
                            >
                              {item.title}
                            </Link>
                            <p className="mt-2 text-sm font-medium text-slate-800">
                              {formatStatusLabel(item.appointmentType)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {item.location ?? "Location pending"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                              Context
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {item.customerName ??
                                item.opportunityTitle ??
                                "Lead appointment"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {item.projectName ?? item.subtitle}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                              Assigned
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {item.assigneeLabel}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              Person assignment
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                              Date
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {formatDate(item.dateKey)}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {formatScheduleItemTimeWindow(item)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {item.contextHref && item.contextLabel ? (
                              <Link
                                href={item.contextHref}
                                className="inline-flex items-center rounded-[4px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                              >
                                {item.contextLabel}
                              </Link>
                            ) : null}
                            <Link
                              href={item.href}
                              className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                            >
                              Open appointment
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const job = visibleJobs.find(
                    (visibleJob) => visibleJob.id === item.id
                  );

                  if (!job) {
                    return null;
                  }

                  const crewState = getCrewState(job);
                  const primaryAction = getPrimaryScheduleAction(job);
                  const boardCardState = getBoardCardState(job);

                  return (
                    <div key={job.id} className="px-5 py-4 sm:px-6">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_190px] md:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                          </div>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="mt-2 block text-base font-semibold text-slate-950 transition hover:text-brand-700"
                          >
                            {job.project?.name ?? "Untitled job"}
                          </Link>
                          <p className="mt-2 text-sm font-medium text-slate-800">
                            {boardCardState.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {job.estimate?.referenceNumber ??
                              "Project-based work"}{" "}
                            ·{" "}
                            <span className="capitalize">
                              {formatStatusLabel(job.dispatchStatus)}
                            </span>
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {boardCardState.summary}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                            Continuity
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {job.customer?.name ?? "Unknown customer"}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            <Link
                              href={`/projects/${job.projectId}`}
                              className="hover:text-slate-900"
                            >
                              Open project
                            </Link>
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                            Crew
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-700">
                              {job.assignmentCount > 0
                                ? formatAssignmentLabel(job.assignmentCount)
                                : "No crew assigned"}
                            </p>
                            <ScheduleJobStateBadges crewState={crewState} />
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {crewState.detail}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                            Date
                          </p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatDate(job.scheduledDate)}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
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
                          projectLabel="Open project"
                          projectVariant="plain"
                          jobHref={`/jobs/${job.id}`}
                          jobLabel="Open job"
                          jobVariant="bordered"
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
              : "Refine schedule"
          }
          description={
            selectedJob
              ? `Working from ${selectedJob.project?.name ?? "this job"} keeps the schedule surface tied to the same project and job chain.`
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Selected job
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                  Selected job action panel
                </h2>
              </div>
              <div className={scheduleInsetPanelClassName}>
                <p className="font-semibold text-slate-950">
                  {selectedJob.project?.name ?? "Untitled job"}
                </p>
                <p className="mt-1">
                  {selectedJob.customer?.name ?? "Unknown customer"} ·{" "}
                  <span className="capitalize">
                    {formatStatusLabel(selectedJob.dispatchStatus)}
                  </span>
                </p>
                <p className="mt-1">
                  {selectedJobAssignments.length > 0
                    ? `${formatAssignmentLabel(selectedJobAssignments.length)} already attached`
                    : "Crew not assigned yet"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/projects/${selectedJob.projectId}`}
                  className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                >
                  Open project
                </Link>
                <Link
                  href={`/jobs/${selectedJob.id}`}
                  className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                >
                  Open job
                </Link>
              </div>
              {selectedJobCrewState ? (
                <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Crew continuity
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${selectedJobCrewState.emphasisClass}`}
                  >
                    {selectedJobCrewState.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {selectedJobCrewState.detail}
                  </p>
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
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${schedulePrimaryActionClassName}`}
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
                    people={assignablePeople.map((person) => ({
                      id: person.id,
                      displayName: person.displayName
                    }))}
                    vendors={laborVendors.map((vendor) => ({
                      id: vendor.id,
                      name: vendor.name
                    }))}
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
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                      >
                        Open people
                      </Link>
                      <Link
                        href="/vendors"
                        className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionClassName}`}
                      >
                        Open vendors
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <ScheduleJobForm
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
                />
              )}
            </div>
          ) : (
            <div className={scheduleInsetPanelClassName}>
              No job selected yet. Pick an existing job from the unscheduled,
              today, upcoming, or crew queues to schedule work or attach crew
              without leaving the schedule dashboard.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
