import Link from "next/link";

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
  unscheduleJobAction
} from "@/lib/jobs/actions";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPeople } from "@/lib/people/data";
import { listVendors } from "@/lib/vendors/data";

const SCHEDULE_VIEW_OPTIONS = [
  { value: "all", label: "All scheduled work" },
  { value: "unscheduled", label: "Unscheduled" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" }
] as const;

const CREW_VIEW_OPTIONS = [
  { value: "all", label: "All crew states" },
  { value: "assigned", label: "Crew assigned" },
  { value: "unassigned", label: "Needs crew" }
] as const;

type ScheduleViewKey = (typeof SCHEDULE_VIEW_OPTIONS)[number]["value"];
type CrewViewKey = (typeof CREW_VIEW_OPTIONS)[number]["value"];
type ScheduleActionKey = "schedule" | "assign";
type RawScheduleSearchParams = {
  q?: string | string[];
  view?: string | string[];
  crew?: string | string[];
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
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  }) : "Unscheduled";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }) : "Time not set";
}

function formatShortDateFromDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatAssignmentLabel(count: number) {
  return `${count} assignment${count === 1 ? "" : "s"}`;
}

function buildScheduleHref(input: {
  q?: string;
  view?: ScheduleViewKey;
  crew?: CrewViewKey;
  action?: ScheduleActionKey;
  jobId?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.crew && input.crew !== "all") {
    searchParams.set("crew", input.crew);
  }

  if (input.action) {
    searchParams.set("action", input.action);
  }

  if (input.jobId) {
    searchParams.set("jobId", input.jobId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/schedule?${query}` : "/schedule";
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`) : null;
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
    case "today":
    case "upcoming":
    case "in_progress":
      return normalizeOptionalSearchParam(value) as Exclude<ScheduleViewKey, "all">;
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
  return normalized === "schedule" || normalized === "assign" ? normalized : undefined;
}

function normalizeScheduleSearchParams(searchParams?: RawScheduleSearchParams) {
  return {
    q: normalizeOptionalSearchParam(searchParams?.q) ?? "",
    view: normalizeScheduleView(searchParams?.view),
    crew: normalizeCrewView(searchParams?.crew),
    action: normalizeScheduleAction(searchParams?.action),
    jobId: normalizeOptionalSearchParam(searchParams?.jobId) ?? null,
    error: normalizeOptionalSearchParam(searchParams?.error),
    message: normalizeOptionalSearchParam(searchParams?.message)
  };
}

function getScheduleListEmptyState(input: {
  jobCount: number;
  query: string;
  view: ScheduleViewKey;
  crew: CrewViewKey;
}) {
  if (input.jobCount === 0) {
    return {
      eyebrow: "No jobs yet",
      title: "Jobs will feed this schedule surface",
      description:
        "The schedule dashboard reads from canonical jobs and their crew assignments once work starts moving into downstream execution."
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

  if (input.crew === "assigned") {
    return {
      eyebrow: "No assigned crew work",
      title: "No jobs match the assigned-crew filter",
      description:
        "Switch back to all crew states or review jobs that still need people or labor vendors attached."
    };
  }

  if (input.crew === "unassigned") {
    return {
      eyebrow: "No unassigned work",
      title: "No jobs currently need crew assignment",
      description:
        "This filter will surface jobs that still need people or labor-provider vendors attached."
    };
  }

  if (input.view === "unscheduled") {
    return {
      eyebrow: "No unscheduled work",
      title: "No jobs are waiting on scheduling",
      description:
        "As commercially ready jobs enter downstream execution without a committed date, they will surface here."
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

  if (input.view === "upcoming") {
    return {
      eyebrow: "No upcoming work",
      title: "Nothing is queued beyond today yet",
      description:
        "Future date commitments will show up here once the next scheduled work is captured on the same canonical job records."
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
          : job.crewVendor?.name ?? formatAssignmentLabel(job.assignmentCount),
      emphasisClass: "text-emerald-700",
      badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (job.dispatchStatus === "unscheduled") {
    return {
      label: "Crew comes after scheduling",
      detail: "Set a date first, then attach people or labor-provider vendors.",
      emphasisClass: "text-amber-700",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: "Needs crew",
    detail: "Scheduled work still needs people or labor-provider vendors attached.",
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
      toneClass: "border-[#233a64] bg-[#233a64] text-white hover:bg-[#1b2d4d]"
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
    toneClass: "border-[#dde3eb] bg-white text-[#41536f] hover:bg-slate-50"
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

  if (primaryAction.action === "schedule" && job.dispatchStatus !== "unscheduled") {
    return {
      ...primaryAction,
      label: "Reschedule",
      toneClass: "border-[#c9d7ea] bg-[#eef4fb] text-[#23486d] hover:bg-[#e2ecf8]"
    };
  }

  return primaryAction;
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

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const resolvedSearchParams = normalizeScheduleSearchParams(await searchParams);
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

  const [jobs, people, vendors] = await Promise.all([
    listJobs(),
    listPeople(),
    listVendors()
  ]);
  const assignmentsByJobId = await listJobAssignmentsByJobIds(
    jobs.map((job) => job.id),
    "/schedule"
  );

  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const upcomingHorizon = addDays(today, 8);
  const boardRangeEnd = addDays(today, 7);

  const query = resolvedSearchParams.q;
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view;
  const crewFilter = resolvedSearchParams.crew;
  const selectedAction = resolvedSearchParams.action;
  const selectedJobId = resolvedSearchParams.jobId;
  const selectedJob = selectedJobId
    ? jobs.find((job) => job.id === selectedJobId) ?? null
    : null;
  const selectedJobAssignments = selectedJob
    ? assignmentsByJobId.get(selectedJob.id) ?? []
    : [];
  const showComposer =
    Boolean(selectedAction && selectedJob) || Boolean(resolvedSearchParams.error);

  const jobsWithAssignments = jobs.map((job) => {
    const assignments = assignmentsByJobId.get(job.id) ?? [];
    const scheduledDate = toDate(job.scheduledDate);
    const isToday = scheduledDate ? scheduledDate.getTime() === today.getTime() : false;
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
            assignment.person?.displayName ?? assignment.vendor?.name ?? "Lead assignment"
        ),
      crewSummary: assignments
        .slice(0, 2)
        .map(
          (assignment) =>
            assignment.person?.displayName ?? assignment.vendor?.name ?? "Crew assignment"
        ),
      isToday,
      isUpcoming
    };
  });

  const unscheduledJobs = jobsWithAssignments.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const scheduledTodayJobs = jobsWithAssignments.filter((job) => job.isToday);
  const inProgressJobs = jobsWithAssignments.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const upcomingJobs = jobsWithAssignments.filter((job) => job.isUpcoming);
  const assignedJobs = jobsWithAssignments.filter((job) => job.assignmentCount > 0);
  const todayWithoutCrewJobs = scheduledTodayJobs.filter((job) => job.assignmentCount === 0);
  const activeTodayJobs = [
    ...inProgressJobs,
    ...scheduledTodayJobs.filter((job) => job.dispatchStatus !== "in_progress")
  ];
  const scheduledJobs = jobsWithAssignments.filter((job) => job.scheduledDate !== null);
  const latestScheduledJobs = [...scheduledJobs]
    .sort((left, right) => getScheduledSortTime(right) - getScheduledSortTime(left))
    .slice(0, 3);
  const scheduledBoardGroups = [...scheduledTodayJobs, ...upcomingJobs]
    .sort((left, right) => getScheduledSortTime(left) - getScheduledSortTime(right))
    .reduce<
      Array<{
        date: string;
        jobs: typeof jobsWithAssignments;
        isToday: boolean;
      }>
    >((groups, job) => {
      if (!job.scheduledDate) {
        return groups;
      }

      const existingGroup = groups.find((group) => group.date === job.scheduledDate);

      if (existingGroup) {
        existingGroup.jobs.push(job);
        return groups;
      }

      groups.push({
        date: job.scheduledDate,
        jobs: [job],
        isToday: job.isToday
      });

      return groups;
    }, [])
    .slice(0, 5);
  const scheduledBoardJobCount = scheduledBoardGroups.reduce(
    (count, group) => count + group.jobs.length,
    0
  );
  const boardRangeLabel = `Near-term window: ${formatShortDateFromDate(today)} through ${formatShortDateFromDate(boardRangeEnd)}`;

  const visibleJobs = jobsWithAssignments.filter((job) => {
    const matchesView =
      view === "all"
        ? true
        : view === "unscheduled"
          ? job.dispatchStatus === "unscheduled"
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

    return matchesView && matchesCrew && matchesQuery;
  });

  const redirectTo = buildScheduleHref({
    q: query,
    view,
    crew: crewFilter,
    action: selectedAction,
    jobId: selectedJobId ?? undefined
  });
  const assignablePeople = people.filter((person) => person.isActive && person.isAssignable);
  const laborVendors = vendors.filter((vendor) => vendor.isActive && vendor.isLaborProvider);
  const scheduleViews = SCHEDULE_VIEW_OPTIONS.map((option) => ({
    ...option,
    count:
      option.value === "all"
        ? jobsWithAssignments.length
        : option.value === "unscheduled"
          ? unscheduledJobs.length
          : option.value === "today"
            ? scheduledTodayJobs.length
            : option.value === "upcoming"
              ? upcomingJobs.length
              : inProgressJobs.length
  }));
  const crewViews = CREW_VIEW_OPTIONS;
  const listEmptyState = getScheduleListEmptyState({
    jobCount: jobs.length,
    query,
    view,
    crew: crewFilter
  });
  const summaryItems = [
    {
      key: "unscheduled",
      label: "Unscheduled jobs",
      value: unscheduledJobs.length,
      href: buildScheduleHref({ q: query, view: "unscheduled", crew: crewFilter }),
      active: view === "unscheduled",
      borderClass: "border-[#ecd9bf]",
      bgClass: "bg-[#fff8ef]",
      labelClass: "text-[#93652a]",
      valueClass: "text-[#7a4d12]"
    },
    {
      key: "today",
      label: "Scheduled today",
      value: scheduledTodayJobs.length,
      href: buildScheduleHref({ q: query, view: "today", crew: crewFilter }),
      active: view === "today",
      borderClass: "border-[#d7e5f2]",
      bgClass: "bg-[#f4f8fc]",
      labelClass: "text-[#55779a]",
      valueClass: "text-[#20486c]"
    },
    {
      key: "in-progress",
      label: "In progress",
      value: inProgressJobs.length,
      href: buildScheduleHref({ q: query, view: "in_progress", crew: crewFilter }),
      active: view === "in_progress",
      borderClass: "border-[#e3daf3]",
      bgClass: "bg-[#f7f3ff]",
      labelClass: "text-[#71609d]",
      valueClass: "text-[#553f8f]"
    },
    {
      key: "upcoming",
      label: "Upcoming",
      value: upcomingJobs.length,
      href: buildScheduleHref({ q: query, view: "upcoming", crew: crewFilter }),
      active: view === "upcoming",
      borderClass: "border-[#d9e6db]",
      bgClass: "bg-[#f3faf4]",
      labelClass: "text-[#5f7f65]",
      valueClass: "text-[#29523c]"
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
        "Keep ready work moving by setting a day and time on the canonical job record.",
      href: buildScheduleHref({ q: query, view: "unscheduled", crew: crewFilter }),
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
        "Attach people or labor-provider vendors before today's work loses continuity.",
      href: buildScheduleHref({ q: query, view: "today", crew: "unassigned" }),
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
      href: buildScheduleHref({ q: query, view: "today", crew: crewFilter }),
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
      href: buildScheduleHref({ q: query, view: "upcoming", crew: crewFilter }),
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
                item.active ? "ring-1 ring-inset ring-[#233a64]" : ""
              ].join(" ")}
            >
              <p className={`text-[11px] uppercase tracking-[0.14em] ${item.labelClass}`}>
                {item.label}
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className={`text-2xl font-semibold tracking-tight ${item.valueClass}`}>
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
            Review the schedule as a shared job-entry surface, then jump into the job or project workspace when field execution, readiness, or billing continuity matters.
          </p>
        ),
        searchSlot: (
          <form action="/schedule" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            {crewFilter !== "all" ? <input type="hidden" name="crew" value={crewFilter} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, estimate, crew, vendor, or date"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" || crewFilter !== "all" ? (
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: [
          <div key="schedule-view-group" className="flex flex-wrap items-center gap-2">
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
                    view: scheduleView.value,
                    crew: crewFilter
                  })}
                  className={[
                    "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#233a64] text-white"
                      : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                >
                  <span>{scheduleView.label}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                    ].join(" ")}
                  >
                    {scheduleView.count}
                  </span>
                </Link>
              );
            })}
          </div>,
          <div key="crew-view-group" className="flex flex-wrap items-center gap-2">
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
                    view,
                    crew: crewView.value
                  })}
                  className={[
                    "inline-flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#17243b] text-white"
                      : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
                  ].join(" ")}
                >
                  {crewView.label}
                </Link>
              );
            })}
          </div>
        ],
        actionSlot: (
          <Link
            href="/jobs?view=unscheduled"
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            Open jobs manager
          </Link>
        )
      }}
    >
      <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_420px]" : "space-y-4"}>
        <section className="space-y-6">
          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Next actions
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use the current loaded schedule state to move the next obvious jobs forward without leaving the shared project and job chain.
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {nextActions.filter((action) => !action.empty).length} active
                </p>
              </div>
            </div>

            <div className="grid gap-px bg-[#e5ebf2] lg:grid-cols-2">
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
                      className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#41536f] transition hover:bg-slate-50"
                    >
                      {action.ctaLabel}
                    </Link>
                    {action.empty ? (
                      <span className="text-sm text-slate-400">Nothing urgent from this lane right now.</span>
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
                            className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-[#e5ebf2] bg-[#fbfcfe] px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                              >
                                {job.project?.name ?? "Untitled job"}
                              </Link>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {job.customer?.name ?? "Unknown customer"} · {formatDate(job.scheduledDate)}
                              </p>
                              <p className={`mt-1 text-xs font-medium ${crewState.emphasisClass}`}>
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
              title="Unscheduled queue"
              description="These jobs are commercially ready enough to exist, but still need a real day and time commitment before field work can move."
              actionHref={buildScheduleHref({ q: query, view: "unscheduled", crew: crewFilter })}
              actionLabel="Review queue"
              items={unscheduledJobs.slice(0, 4).map((job) => {
                const crewState = getCrewState(job);
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href: buildScheduleHref({
                    q: query,
                    view,
                    crew: crewFilter,
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
              emptyDescription="As the upstream project chain creates ready work, jobs that still need timing will surface here."
            />

            <ManagerDashboardCard
              eyebrow="Today"
              title="Scheduled work for today"
              description="Keep the immediate field picture visible without turning the page into a full calendar app."
              actionHref={buildScheduleHref({ q: query, view: "today", crew: crewFilter })}
              actionLabel="View today"
              items={scheduledTodayJobs.slice(0, 4).map((job) => {
                const crewState = getCrewState(job);
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href:
                    primaryAction.action === "assign"
                      ? buildScheduleHref({
                          q: query,
                          view,
                          crew: crewFilter,
                          action: primaryAction.action,
                          jobId: job.id
                        })
                      : `/jobs/${job.id}`,
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${job.customer?.name ?? "Unknown customer"} · ${formatDateTime(job.scheduledStartAt)}`,
                  meta: crewState.label === "Assigned" ? `Crew ${crewState.detail}` : crewState.detail,
                  badge: job.dispatchStatus === "in_progress" ? "In progress" : crewState.label === "Needs crew" ? "Needs crew" : "Today",
                  trailing: primaryAction.action === "assign" ? primaryAction.label : "Open job"
                };
              })}
              emptyTitle="No work is scheduled for today."
              emptyDescription="Once jobs get real date commitments for today, they will surface here as the immediate operating queue."
            />

            <ManagerDashboardCard
              eyebrow="Upcoming"
              title="Next scheduled work"
              description="This keeps the next few commitments in view so project continuity and crew planning stay connected."
              actionHref={buildScheduleHref({ q: query, view: "upcoming", crew: crewFilter })}
              actionLabel="View upcoming"
              items={upcomingJobs.slice(0, 4).map((job) => {
                const crewState = getCrewState(job);
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href: buildScheduleHref({
                    q: query,
                    view,
                    crew: crewFilter,
                    action: primaryAction.action,
                    jobId: job.id
                  }),
                  title: job.project?.name ?? "Untitled job",
                  subtitle: `${job.customer?.name ?? "Unknown customer"} · ${formatDate(job.scheduledDate)}`,
                  meta: crewState.label === "Assigned" ? `${formatAssignmentLabel(job.assignmentCount)} in place` : crewState.detail,
                  badge: crewState.label === "Needs crew" ? "Needs crew" : "Upcoming",
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
              actionHref={buildScheduleHref({ q: query, view, crew: "assigned" })}
              actionLabel="View assigned"
              items={assignedJobs.slice(0, 4).map((job) => {
                const primaryAction = getPrimaryScheduleAction(job);

                return {
                  href: buildScheduleHref({
                    q: query,
                    view,
                    crew: crewFilter,
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
                  badge: job.dispatchStatus === "in_progress" ? "Live" : "Assigned",
                  trailing: primaryAction.label === "Refine schedule" ? "Manage crew" : primaryAction.label
                };
              })}
              emptyTitle="No jobs have crew assignments yet."
              emptyDescription="As people or subcontractor vendors get attached to jobs, they will show up here for quick review."
            />
          </section>

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Scheduled Board
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Scan the next seven operating days by date while keeping unscheduled jobs distinct and the full list below as the default review surface.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm leading-6 text-slate-500">{scheduledBoardJobCount} scheduled</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{boardRangeLabel}</p>
                </div>
              </div>
            </div>

            {scheduledBoardGroups.length > 0 ? (
              <div className="grid gap-px bg-[#e5ebf2] xl:grid-cols-3">
                {scheduledBoardGroups.map((group) => (
                  <section
                    key={group.date}
                    className={["bg-white px-5 py-4 sm:px-6", group.isToday ? "bg-[#f7fbff]" : ""].join(" ")}
                  >
                    {(() => {
                      const boardDate = getBoardDatePresentation(group.date, today);

                      return (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {boardDate.title}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                          {boardDate.subtitle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#dde3eb] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {group.jobs.length} job{group.jobs.length === 1 ? "" : "s"}
                        </span>
                        {boardDate.isToday ? (
                          <span className="inline-flex items-center rounded-full border border-[#d7e5f2] bg-[#eff6fd] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55779a]">
                            Today
                          </span>
                        ) : null}
                        {boardDate.isTomorrow ? (
                          <span className="inline-flex items-center rounded-full border border-[#d9e6db] bg-[#f3faf4] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#29523c]">
                            Next up
                          </span>
                        ) : null}
                      </div>
                    </div>
                      );
                    })()}

                    <div className="mt-4 space-y-3">
                      {group.jobs.map((job) => {
                        const crewState = getCrewState(job);
                        const primaryAction = getBoardPrimaryAction(job);

                        return (
                          <div
                            key={job.id}
                            className={[
                              "rounded-[4px] border px-3 py-3",
                              group.isToday
                                ? "border-[#d7e5f2] bg-[#fbfdff]"
                                : "border-[#e5ebf2] bg-[#fbfcfe]"
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="text-sm font-semibold text-slate-900 transition hover:text-brand-700"
                                >
                                  {job.project?.name ?? "Untitled job"}
                                </Link>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {job.customer?.name ?? "Unknown customer"}
                                </p>
                              </div>
                              <span
                                className={[
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                  crewState.badgeClass
                                ].join(" ")}
                              >
                                {crewState.label}
                              </span>
                            </div>

                            <p className="mt-3 text-xs font-medium text-slate-700">
                              {job.scheduledStartAt ? formatDateTime(job.scheduledStartAt) : "Time not set"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {crewState.detail}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link
                                href={
                                  buildScheduleHref({
                                    q: query,
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
                              <Link
                                href={`/jobs/${job.id}`}
                                className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#41536f] transition hover:bg-slate-50"
                              >
                                Open job
                              </Link>
                              <Link
                                href={`/projects/${job.projectId}`}
                                className="inline-flex items-center rounded-[4px] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                              >
                                Project
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No near-term scheduled work"
                  title="Today and upcoming dates are still open"
                  description={`Once jobs carry scheduled dates between ${formatShortDateFromDate(today)} and ${formatShortDateFromDate(boardRangeEnd)}, they will appear here as a lightweight board on top of the same canonical job records.`}
                />
              </div>
            )}
          </section>

          {resolvedSearchParams.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <section className="border border-[#dde3eb] bg-white">
            <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
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
                  {visibleJobs.length} visible
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {visibleJobs.length > 0 ? (
                visibleJobs.map((job) => {
                  const crewState = getCrewState(job);
                  const primaryAction = getPrimaryScheduleAction(job);

                  return (
                    <div key={job.id} className="px-5 py-4 sm:px-6">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_1fr_170px_170px_190px] md:items-start">
                      <div className="min-w-0">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-base font-semibold text-slate-950 transition hover:text-brand-700"
                        >
                          {job.project?.name ?? "Untitled job"}
                        </Link>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {job.estimate?.referenceNumber ?? "Project-based work"} ·{" "}
                          <span className="capitalize">{formatStatusLabel(job.dispatchStatus)}</span>
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
                          <Link href={`/projects/${job.projectId}`} className="hover:text-slate-900">
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
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                              crewState.badgeClass
                            ].join(" ")}
                          >
                            {crewState.label}
                          </span>
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
                          {job.scheduledStartAt ? formatDateTime(job.scheduledStartAt) : "Time not set"}
                        </p>
                      </div>

                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Link
                            href={buildScheduleHref({
                              q: query,
                              view,
                              crew: crewFilter,
                              action: primaryAction.action,
                              jobId: job.id
                            }) + "#schedule-action"}
                            className={[
                              "inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                              primaryAction.toneClass
                            ].join(" ")}
                          >
                            {primaryAction.label}
                          </Link>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#41536f] transition hover:bg-slate-50"
                          >
                            Open job
                          </Link>
                          <Link
                            href={`/projects/${job.projectId}`}
                            className="inline-flex items-center rounded-[4px] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:text-slate-900"
                          >
                            Open project
                          </Link>
                        </div>
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
              ? `Working from ${selectedJob.project?.name ?? "this job"} keeps the schedule surface tied to the same canonical project and job chain.`
              : "Pick a job from the schedule surface to adjust date commitment or crew assignment."
          }
          open={showComposer}
          openHref={
            selectedJob && selectedAction
              ? buildScheduleHref({
                  q: query,
                  view,
                  crew: crewFilter,
                  action: selectedAction,
                  jobId: selectedJob.id
                }) + "#schedule-action"
              : buildScheduleHref({ q: query, view, crew: crewFilter }) + "#schedule-action"
          }
          closeHref={buildScheduleHref({ q: query, view, crew: crewFilter })}
          openLabel="Open schedule action panel"
        >
          {selectedJob ? (
            <div className="space-y-4">
              <div className="rounded-[4px] border border-[#e5ebf2] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-slate-600">
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
                    : "No crew attached yet"}
                </p>
              </div>

              {selectedAction === "assign" ? (
                assignablePeople.length > 0 || laborVendors.length > 0 ? (
                  <ScheduleCrewAssignmentForm
                    action={assignCrewAction}
                    jobId={selectedJob.id}
                    projectId={selectedJob.projectId}
                    estimateId={selectedJob.estimateId}
                    redirectTo={redirectTo}
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
                  <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                    Add active assignable people or labor-provider vendors before attaching crew from the schedule surface.
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
            <div className="rounded-[4px] border border-[#e5ebf2] bg-[#fbfcfe] px-4 py-3 text-sm leading-6 text-slate-600">
              Select a job from the unscheduled, today, upcoming, or crew queues to schedule work or attach crew without leaving the schedule dashboard.
            </div>
          )}
        </WorkspaceComposerSheet>
      </div>
    </ContractorWorkspacePage>
  );
}
