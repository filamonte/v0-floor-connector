import type {
  DashboardProjectCueInvoice,
  DashboardProjectCueJob
} from "./project-cue-input-read-model";
import type { ProjectCue } from "@/lib/projects/cues";

export type DashboardActionQueueItem = {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  recommendedActionLabel: string;
  href: string;
  metadata?: string | null;
  badge?: string | null;
  contextHref?: string | null;
  contextLabel?: string | null;
  searchText: string;
};

export type DashboardActionQueue = {
  key:
    | "needs-contract"
    | "ready-to-schedule"
    | "open-ar"
    | "todays-work"
    | "open-blockers";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  items: DashboardActionQueueItem[];
};

type ReadyProjectWithoutJob = {
  id: string;
  name: string;
  status: string;
  customerName: string | null;
  jobCreateHref: string;
};

type BuildDashboardActionQueuesInput = {
  projectCues: ProjectCue[];
  readyProjectsWithoutJobs: ReadyProjectWithoutJob[];
  jobsNeedingScheduling: DashboardProjectCueJob[];
  openInvoices: DashboardProjectCueInvoice[];
  overdueInvoices: DashboardProjectCueInvoice[];
  jobsTodayOrInProgress: DashboardProjectCueJob[];
  today: string;
  limit?: number;
};

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function buildSearchText(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isProjectCueKind(cue: ProjectCue, kind: string) {
  return cue.id.endsWith(`:${kind}`);
}

function mapProjectCueToActionItem(
  cue: ProjectCue,
  input: {
    recommendedActionLabel?: string;
    href?: string;
    badge?: string;
  } = {}
): DashboardActionQueueItem {
  return {
    id: cue.id,
    title: cue.projectName,
    subtitle: cue.reason,
    reason: cue.description,
    recommendedActionLabel: input.recommendedActionLabel ?? cue.actionLabel,
    href: input.href ?? cue.href,
    metadata: cue.title,
    badge: input.badge ?? cue.priority,
    contextHref: `/projects/${cue.projectId}`,
    contextLabel: "Open project",
    searchText: buildSearchText(
      cue.title,
      cue.projectName,
      cue.description,
      cue.reason,
      cue.priority
    )
  };
}

function mapJobContext(job: DashboardProjectCueJob) {
  return `${job.customer?.name ?? "Unknown customer"} / ${
    job.project?.name ?? "Unknown project"
  }`;
}

export function buildDashboardActionQueues(
  input: BuildDashboardActionQueuesInput
): DashboardActionQueue[] {
  const limit = input.limit ?? 5;
  const needsContractCues = input.projectCues
    .filter((cue) =>
      isProjectCueKind(cue, "approved-estimate-missing-contract")
    )
    .slice(0, limit);
  const readyProjectCues = input.projectCues.filter(
    (cue) =>
      isProjectCueKind(cue, "signed-contract-no-job") ||
      isProjectCueKind(cue, "ready-unscheduled-jobs")
  );
  const blockerCues = input.projectCues
    .filter((cue) => isProjectCueKind(cue, "open-blocker-field-notes"))
    .slice(0, limit);
  const arInvoices = (
    input.overdueInvoices.length > 0
      ? input.overdueInvoices
      : input.openInvoices
  ).slice(0, limit);
  const readyItems: DashboardActionQueueItem[] = [
    ...input.readyProjectsWithoutJobs.map((project) => ({
      id: `ready-project-${project.id}`,
      title: project.name,
      subtitle: project.customerName ?? "Unknown customer",
      reason: "Ready Check is clear and no canonical job exists yet.",
      recommendedActionLabel: "Create job",
      href: project.jobCreateHref,
      metadata: labelize(project.status),
      badge: "Ready",
      contextHref: `/projects/${project.id}`,
      contextLabel: "Open project",
      searchText: buildSearchText(
        project.name,
        project.customerName,
        project.status,
        "ready to schedule",
        "create job"
      )
    })),
    ...readyProjectCues.map((cue) =>
      mapProjectCueToActionItem(cue, {
        recommendedActionLabel: cue.actionLabel,
        href: cue.href,
        badge: "Ready"
      })
    ),
    ...input.jobsNeedingScheduling.map((job) => ({
      id: `unscheduled-job-${job.id}`,
      title: job.project?.name ?? "Untitled job",
      subtitle: mapJobContext(job),
      reason:
        "Canonical job exists and remains unscheduled despite being in the scheduling queue.",
      recommendedActionLabel: "Schedule job",
      href: `/schedule?projectId=${job.projectId}&view=unscheduled&action=schedule&jobId=${job.id}#schedule-action`,
      metadata: job.estimate?.referenceNumber ?? "Created from project chain",
      badge: "Needs schedule",
      contextHref: job.project ? `/projects/${job.project.id}` : null,
      contextLabel: job.project ? "Open project" : null,
      searchText: buildSearchText(
        job.project?.name,
        job.customer?.name,
        job.estimate?.referenceNumber,
        job.dispatchStatus,
        "schedule job"
      )
    }))
  ].slice(0, limit);

  return [
    {
      key: "needs-contract",
      title: "Needs Contract",
      description:
        "Approved scope that still needs contractor contract follow-through.",
      href: "/contracts",
      actionLabel: "Open contracts",
      emptyTitle: "No approved estimates are waiting on contracts.",
      emptyDescription:
        "Approved estimates without downstream contract context will appear here.",
      items: needsContractCues.map((cue) =>
        mapProjectCueToActionItem(cue, {
          recommendedActionLabel: "Generate or review contract",
          badge: "Needs contract"
        })
      )
    },
    {
      key: "ready-to-schedule",
      title: "Ready to Schedule",
      description:
        "Commercially ready projects and unscheduled jobs that need schedule handoff.",
      href: "/schedule?view=unscheduled",
      actionLabel: "Open schedule",
      emptyTitle: "No ready projects are waiting to be scheduled.",
      emptyDescription:
        "Ready projects without jobs and ready unscheduled jobs will appear here.",
      items: readyItems
    },
    {
      key: "open-ar",
      title: "Open AR",
      description:
        "Open receivables that need review on the canonical invoice chain.",
      href: "/invoices",
      actionLabel: "Open invoices",
      emptyTitle: "No open AR items need attention right now.",
      emptyDescription:
        "Sent, partially paid, and overdue invoices with open balances will appear here.",
      items: arInvoices.map((invoice) => {
        const isOverdue = Boolean(
          invoice.dueDate && invoice.dueDate < input.today
        );

        return {
          id: `open-ar-${invoice.id}`,
          title: invoice.referenceNumber,
          subtitle: `${invoice.customer?.name ?? "Unknown customer"} / ${
            invoice.project?.name ?? "Unknown project"
          }`,
          reason: isOverdue
            ? "Invoice is past due with an open balance."
            : invoice.status === "partially_paid"
              ? "Invoice is partially paid with remaining balance."
              : "Invoice is open with remaining balance.",
          recommendedActionLabel:
            invoice.status === "partially_paid"
              ? "Record payment"
              : "Review invoice",
          href: `/invoices/${invoice.id}`,
          metadata: `${formatCurrency(invoice.balanceDueAmount)} open / due ${formatShortDate(invoice.dueDate)}`,
          badge: isOverdue ? "Overdue" : labelize(invoice.status),
          contextHref: invoice.project
            ? `/projects/${invoice.project.id}`
            : null,
          contextLabel: invoice.project ? "Open project" : null,
          searchText: buildSearchText(
            invoice.referenceNumber,
            invoice.customer?.name,
            invoice.project?.name,
            invoice.status,
            invoice.dueDate
          )
        };
      })
    },
    {
      key: "todays-work",
      title: "Today's Work",
      description:
        "Jobs scheduled today or already in progress on the canonical job chain.",
      href: "/schedule?view=today",
      actionLabel: "Open today",
      emptyTitle: "No jobs are scheduled for today.",
      emptyDescription:
        "Scheduled and in-progress jobs will appear here for day-of review.",
      items: input.jobsTodayOrInProgress.slice(0, limit).map((job) => {
        const startTime = formatTime(job.scheduledStartAt);

        return {
          id: `todays-work-${job.id}`,
          title: job.project?.name ?? "Untitled job",
          subtitle: mapJobContext(job),
          reason:
            job.dispatchStatus === "in_progress"
              ? "Job is already in progress."
              : "Job is scheduled today.",
          recommendedActionLabel:
            job.dispatchStatus === "in_progress"
              ? "Open job"
              : "Review schedule",
          href: `/jobs/${job.id}`,
          metadata: [
            job.scheduledDate ? formatShortDate(job.scheduledDate) : null,
            startTime,
            "Crew assignment stays in Job and Schedule"
          ]
            .filter(Boolean)
            .join(" / "),
          badge:
            job.dispatchStatus === "in_progress"
              ? "In progress"
              : job.scheduledDate === input.today
                ? "Today"
                : "Scheduled",
          contextHref: job.project ? `/projects/${job.project.id}` : null,
          contextLabel: job.project ? "Open project" : null,
          searchText: buildSearchText(
            job.project?.name,
            job.customer?.name,
            job.estimate?.referenceNumber,
            job.dispatchStatus,
            job.scheduledDate
          )
        };
      })
    },
    {
      key: "open-blockers",
      title: "Open Blockers",
      description:
        "Open field blockers and issue notes surfaced from existing project cues.",
      href: "/projects",
      actionLabel: "Open projects",
      emptyTitle: "No open blockers found.",
      emptyDescription:
        "Open blocker or issue field notes will appear here with a Daily Log handoff.",
      items: blockerCues.map((cue) =>
        mapProjectCueToActionItem(cue, {
          recommendedActionLabel: "Review blocker",
          badge: "Open blocker"
        })
      )
    }
  ];
}
