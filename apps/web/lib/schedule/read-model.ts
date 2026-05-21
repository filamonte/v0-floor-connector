import type {
  AppointmentListItem,
  ScheduleAppointmentSummary
} from "@/lib/appointments/data";
import type {
  ScheduleJobAssignmentSummary,
  ScheduleJobSummary
} from "@/lib/jobs/data";

export type ScheduleJobSource = ScheduleJobSummary & {
  assignments?: ScheduleJobAssignmentSummary[];
  assignmentCount?: number;
  crewSummary?: string[];
};

export type ScheduleItemKind = "job" | "appointment";
export type ScheduleItemFilter = "all" | "jobs" | "appointments";

export type ScheduleOpportunityAssessmentSource = {
  id: string;
  title: string;
  siteName: string | null;
  siteAssessmentScheduledAt: string | null;
  status: string;
  primaryContact?: {
    displayName: string | null;
  } | null;
};

export type ScheduleJobItem = {
  type: "job";
  id: string;
  href: string;
  contextHref: string;
  title: string;
  subtitle: string;
  startsAt: string | null;
  endsAt: string | null;
  dateKey: string | null;
  status: string;
  assigneeLabel: string;
  customerName: string | null;
  projectName: string | null;
};

export type ScheduleAppointmentItem = {
  type: "appointment";
  id: string;
  href: string;
  contextHref: string | null;
  contextLabel: string | null;
  title: string;
  subtitle: string;
  startsAt: string;
  endsAt: string | null;
  dateKey: string;
  status: string;
  appointmentType: string;
  assigneeLabel: string;
  customerName: string | null;
  projectName: string | null;
  opportunityTitle: string | null;
  location: string | null;
  customerVisible: boolean;
};

export type ScheduleItem = ScheduleJobItem | ScheduleAppointmentItem;

function formatDateKeyFromIso(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getJobDateKey(job: ScheduleJobSource) {
  if (job.scheduledDate) {
    return job.scheduledDate;
  }

  return job.scheduledStartAt ? formatDateKeyFromIso(job.scheduledStartAt) : null;
}

function getJobAssigneeLabel(job: ScheduleJobSource) {
  if (job.crewSummary && job.crewSummary.length > 0) {
    return job.crewSummary.join(", ");
  }

  if (job.crewVendor?.name) {
    return job.crewVendor.name;
  }

  const assignmentCount = job.assignmentCount ?? job.assignments?.length ?? 0;

  if (assignmentCount > 0) {
    return `${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`;
  }

  return "No crew assigned";
}

export function buildScheduleItems(input: {
  jobs: ScheduleJobSource[];
  appointments: ScheduleAppointmentSummary[];
  opportunityAssessments?: ScheduleOpportunityAssessmentSource[];
  rangeStart: Date;
  rangeEnd: Date;
  itemFilter?: ScheduleItemFilter;
  includeUndatedJobs?: boolean;
}): ScheduleItem[] {
  const rangeStartKey = input.rangeStart.toISOString().slice(0, 10);
  const rangeEndKey = input.rangeEnd.toISOString().slice(0, 10);
  const itemFilter = input.itemFilter ?? "all";
  const items: ScheduleItem[] = [];

  if (itemFilter === "all" || itemFilter === "jobs") {
    for (const job of input.jobs) {
      const dateKey = getJobDateKey(job);

      if (
        (!dateKey && !input.includeUndatedJobs) ||
        (dateKey && (dateKey < rangeStartKey || dateKey > rangeEndKey))
      ) {
        continue;
      }

      items.push({
        type: "job",
        id: job.id,
        href: `/jobs/${job.id}`,
        contextHref: `/projects/${job.projectId}`,
        title: job.project?.name ?? "Untitled job",
        subtitle: job.customer?.name ?? "Unknown customer",
        startsAt: job.scheduledStartAt,
        endsAt: job.scheduledEndAt,
        dateKey,
        status: job.dispatchStatus,
        assigneeLabel: getJobAssigneeLabel(job),
        customerName: job.customer?.name ?? null,
        projectName: job.project?.name ?? null
      });
    }
  }

  if (itemFilter === "all" || itemFilter === "appointments") {
    for (const opportunity of input.opportunityAssessments ?? []) {
      if (!opportunity.siteAssessmentScheduledAt) {
        continue;
      }

      const dateKey = formatDateKeyFromIso(opportunity.siteAssessmentScheduledAt);

      if (dateKey < rangeStartKey || dateKey > rangeEndKey) {
        continue;
      }

      items.push({
        type: "appointment",
        id: `opportunity-assessment:${opportunity.id}`,
        href: `/leads/${opportunity.id}`,
        contextHref: `/leads/${opportunity.id}`,
        contextLabel: "Open lead",
        title: `${opportunity.title} site assessment`,
        subtitle:
          opportunity.primaryContact?.displayName ??
          opportunity.siteName ??
          "Lead assessment",
        startsAt: opportunity.siteAssessmentScheduledAt,
        endsAt: null,
        dateKey,
        status: opportunity.status,
        appointmentType: "site_assessment",
        assigneeLabel: "Opportunity workflow",
        customerName: null,
        projectName: null,
        opportunityTitle: opportunity.title,
        location: opportunity.siteName,
        customerVisible: false
      });
    }

    for (const appointment of input.appointments) {
      const dateKey = formatDateKeyFromIso(appointment.startsAt);

      if (dateKey < rangeStartKey || dateKey > rangeEndKey) {
        continue;
      }

      const contextHref = appointment.projectId
        ? `/projects/${appointment.projectId}`
        : appointment.opportunityId
          ? `/leads/${appointment.opportunityId}`
          : appointment.customerId
            ? `/customers/${appointment.customerId}`
            : null;
      const contextLabel = appointment.projectId
        ? "Open project"
        : appointment.opportunityId
          ? "Open lead"
          : appointment.customerId
            ? "Open customer"
            : null;

      items.push({
        type: "appointment",
        id: appointment.id,
        href: `/appointments/${appointment.id}`,
        contextHref,
        contextLabel,
        title: appointment.title,
        subtitle:
          appointment.customer?.name ??
          appointment.opportunity?.title ??
          "Lead appointment",
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        dateKey,
        status: appointment.status,
        appointmentType: appointment.appointmentType,
        assigneeLabel: appointment.assignedPerson?.displayName ?? "Unassigned",
        customerName: appointment.customer?.name ?? null,
        projectName: appointment.project?.name ?? null,
        opportunityTitle: appointment.opportunity?.title ?? null,
        location: appointment.location,
        customerVisible: appointment.customerVisible
      });
    }
  }

  return items.sort((left, right) => {
    const leftTime = left.startsAt ?? `${left.dateKey ?? "9999-12-31"}T23:59:59`;
    const rightTime = right.startsAt ?? `${right.dateKey ?? "9999-12-31"}T23:59:59`;
    const timeComparison = leftTime.localeCompare(rightTime);

    if (timeComparison !== 0) {
      return timeComparison;
    }

    return left.type.localeCompare(right.type);
  });
}

export function filterUpcomingAssignedAppointments(input: {
  appointments: AppointmentListItem[];
  nowIso: string;
  assignedPersonId?: string | null;
  limit: number;
}) {
  return input.appointments
    .filter((appointment) => appointment.status === "scheduled")
    .filter((appointment) => appointment.startsAt >= input.nowIso)
    .filter((appointment) =>
      input.assignedPersonId
        ? appointment.assignedPersonId === input.assignedPersonId
        : true
    )
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, input.limit);
}
