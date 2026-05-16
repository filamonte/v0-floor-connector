import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NeedsAttentionPanel } from "@/components/operational-cues/needs-attention-panel";
import { CueStateControls } from "@/components/cue-states/cue-state-controls";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { getEstimateById } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import {
  assignCrewAction,
  scheduleJobAction,
  unassignCrewAction,
  unscheduleJobAction,
  updateJobAction
} from "@/lib/jobs/actions";
import { getJobById, listJobAssignments } from "@/lib/jobs/data";
import { listPeople } from "@/lib/people/data";
import { listPunchlistItemsByJob } from "@/lib/punchlists/data";
import { listOpenTimeCardStates, listTimeCardsByJob } from "@/lib/time/data";
import { getOperationalCuesForSubject } from "@/lib/operational-cues/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getCueStateActionSupport } from "@/lib/cue-states/apply";
import { buildOperationalCueIdentity } from "@/lib/cue-states/identity";
import { listVendors } from "@/lib/vendors/data";
import {
  ActionBar,
  PrimarySection,
  ProjectStateSummary,
  WorkflowBar
} from "@floorconnector/ui";
import type {
  ProjectStateSummaryProps,
  WorkflowStep
} from "@floorconnector/ui";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatScheduledDate(value: string | null) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString()
    : "Unscheduled";
}

function formatScheduleDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getActionBarStatusTone(
  status: string
): "neutral" | "warning" | "success" {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "neutral";
    case "unscheduled":
      return "warning";
    default:
      return "neutral";
  }
}

function getExecutionWorkflowSteps(
  job: {
    dispatchStatus: string;
    scheduledDate: string | null;
    project: { name: string } | null;
  },
  assignmentCount: number,
  input: {
    estimateStatus: string | null;
    linkedInvoiceStatus: string | null;
    linkedInvoiceBalanceDue: string | null;
    fieldEvidenceCount: number;
  }
): WorkflowStep[] {
  const isScheduled = job.dispatchStatus !== "unscheduled";
  const hasCrew = assignmentCount > 0;
  const isStarted =
    job.dispatchStatus === "in_progress" || job.dispatchStatus === "completed";
  const isCompleted = job.dispatchStatus === "completed";
  const hasEstimateContractContext = Boolean(input.estimateStatus);
  const hasInvoice = Boolean(input.linkedInvoiceStatus);
  const invoicePaid = input.linkedInvoiceStatus === "paid";
  const hasOpenInvoiceBalance =
    input.linkedInvoiceBalanceDue !== null &&
    Number(input.linkedInvoiceBalanceDue) > 0;

  return [
    {
      id: "customer-project",
      label: "Customer / project",
      state: "complete",
      description: job.project?.name ?? "Project link is present"
    },
    {
      id: "estimate-contract",
      label: "Estimate / contract",
      state: hasEstimateContractContext ? "complete" : "upcoming",
      description: input.estimateStatus
        ? formatStatusLabel(input.estimateStatus)
        : "Project owns upstream readiness"
    },
    {
      id: "job-schedule",
      label: "Job / schedule",
      state: isCompleted ? "complete" : isScheduled ? "current" : "current",
      description: isScheduled
        ? `${formatScheduledDate(job.scheduledDate)} | ${
            hasCrew
              ? `${assignmentCount} crew assignment${assignmentCount === 1 ? "" : "s"}`
              : "crew missing"
          }`
        : "Commit date, time, and crew"
    },
    {
      id: "field-evidence",
      label: "Field evidence",
      state: isCompleted ? "complete" : isStarted ? "current" : "upcoming",
      description: isCompleted
        ? "Field work complete"
        : isStarted
          ? `${input.fieldEvidenceCount} log/time/closeout signal${
              input.fieldEvidenceCount === 1 ? "" : "s"
            }`
          : "Daily logs and time follow here"
    },
    {
      id: "invoice-payment",
      label: "Invoice / payment",
      state: invoicePaid
        ? "complete"
        : hasInvoice && isCompleted
          ? "current"
          : "upcoming",
      description: hasInvoice
        ? invoicePaid
          ? "Linked invoice paid"
          : hasOpenInvoiceBalance
            ? "Linked invoice has open balance"
            : formatStatusLabel(input.linkedInvoiceStatus ?? "linked")
        : isCompleted
          ? "Billing handoff not started"
          : "After billable completion"
    }
  ];
}

function renderStatusBadge(label: string) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
      {label}
    </span>
  );
}

function getPrimaryProgressionAction(status: string) {
  switch (status) {
    case "unscheduled":
      return {
        label: "Set Schedule",
        nextStatus: "scheduled",
        helper:
          "Move this job into the job/schedule stage once real timing is committed.",
        summary:
          "This job extends a ready project into execution and is waiting on the first real schedule commitment."
      };
    case "scheduled":
      return {
        label: "Start Work",
        nextStatus: "in_progress",
        helper:
          "Move the job into active execution when the crew begins field work.",
        summary:
          "Scheduling is in place. The next real step is starting field execution and capturing daily log or time evidence on the same project chain."
      };
    case "in_progress":
      return {
        label: "Mark Complete",
        nextStatus: "completed",
        helper:
          "Close the job when field work is finished and invoice/payment follow-through can start.",
        summary:
          "Execution is underway. Close the job once field work is truly complete and field evidence is current."
      };
    default:
      return null;
  }
}

function getHeaderPrimaryAction(
  status: string,
  projectId: string,
  jobId: string,
  hasLinkedInvoice: boolean
) {
  const progressionAction = getPrimaryProgressionAction(status);

  if (status === "unscheduled" && progressionAction) {
    return {
      type: "link" as const,
      label: progressionAction.label,
      helper: progressionAction.helper,
      summary: progressionAction.summary,
      href: "#schedule-and-crew"
    };
  }

  if (progressionAction) {
    return {
      type: "progression" as const,
      label: progressionAction.label,
      helper: progressionAction.helper,
      summary: progressionAction.summary,
      nextStatus: progressionAction.nextStatus
    };
  }

  if (status === "completed" && !hasLinkedInvoice) {
    return {
      type: "link" as const,
      label: "Create invoice",
      helper:
        "Move completed work into billing using the connected invoice flow.",
      summary:
        "Field execution is complete. The next handoff is billing on the same project and job chain.",
      href: `/invoices?projectId=${projectId}&jobId=${jobId}`
    };
  }

  return null;
}

function renderPrimaryAction(
  action: ReturnType<typeof getHeaderPrimaryAction>,
  job: {
    id: string;
    projectId: string;
    estimateId: string | null;
    dispatchStatus: string;
    scheduledDate: string | null;
    scheduledStartAt: string | null;
    scheduledEndAt: string | null;
    scheduleNotes: string | null;
    crewVendorId: string | null;
    notes: string | null;
  },
  className: string
) {
  if (!action) {
    return null;
  }

  if (action.type === "link") {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <form action={updateJobAction}>
      <input type="hidden" name="jobId" value={job.id} />
      <input type="hidden" name="projectId" value={job.projectId} />
      <input type="hidden" name="estimateId" value={job.estimateId ?? ""} />
      <input type="hidden" name="dispatchStatus" value={action.nextStatus} />
      <input
        type="hidden"
        name="scheduledDate"
        value={job.scheduledDate ?? ""}
      />
      <input
        type="hidden"
        name="scheduledStartAt"
        value={job.scheduledStartAt ? job.scheduledStartAt.slice(0, 16) : ""}
      />
      <input
        type="hidden"
        name="scheduledEndAt"
        value={job.scheduledEndAt ? job.scheduledEndAt.slice(0, 16) : ""}
      />
      <input
        type="hidden"
        name="scheduleNotes"
        value={job.scheduleNotes ?? ""}
      />
      <input type="hidden" name="crewVendorId" value={job.crewVendorId ?? ""} />
      <input type="hidden" name="notes" value={job.notes ?? ""} />
      <button type="submit" className={className}>
        {action.label}
      </button>
    </form>
  );
}

export default async function JobDetailPage({
  params,
  searchParams
}: JobDetailPageProps) {
  const { jobId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/jobs/${jobId}`);
  const job = await getJobById(jobId, `/jobs/${jobId}`);

  if (!job) {
    notFound();
  }

  const [
    linkedEstimate,
    invoices,
    jobAssignments,
    people,
    vendors,
    jobPunchlistItems
  ] = await Promise.all([
    job.estimateId
      ? getEstimateById(job.estimateId, `/jobs/${jobId}`)
      : Promise.resolve(null),
    listInvoices(),
    listJobAssignments(job.id, `/jobs/${jobId}`),
    listPeople(),
    listVendors(),
    listPunchlistItemsByJob(job.id, `/jobs/${jobId}`)
  ]);
  const jobAttentionCues = await getOperationalCuesForSubject({
    organizationId: job.organizationId,
    subjectType: "job",
    subjectId: job.id,
    currentUserId: user.id
  });
  const [jobTimeCards, openTimeStates] = await Promise.all([
    listTimeCardsByJob(job.id, `/jobs/${jobId}`),
    listOpenTimeCardStates()
  ]);
  const projectDailyLogs = await listDailyLogsByProject(
    job.projectId,
    `/jobs/${jobId}`
  );

  const linkedInvoice =
    invoices.find((invoice) => invoice.jobId === job.id) ?? null;
  const jobOpenTimeStates = openTimeStates.filter(
    (state) => state.jobId === job.id
  );
  const jobDailyLogs = projectDailyLogs.filter(
    (dailyLog) => dailyLog.jobId === job.id
  );
  const assignablePeople = people.filter(
    (person) => person.isActive && person.isAssignable
  );
  const laborVendors = vendors.filter(
    (vendor) => vendor.isActive && vendor.isLaborProvider
  );
  const hasAssignableCrewOptions =
    assignablePeople.length > 0 || laborVendors.length > 0;
  const operationalBlockers = [
    job.dispatchStatus === "unscheduled"
      ? "schedule commitment still missing"
      : null,
    jobAssignments.length === 0 ? "crew assignments still missing" : null,
    job.dispatchStatus === "completed" && !linkedInvoice
      ? "billing handoff has not started"
      : null
  ].filter((value): value is string => Boolean(value));
  const primaryAction = getHeaderPrimaryAction(
    job.dispatchStatus,
    job.projectId,
    job.id,
    Boolean(linkedInvoice)
  );
  const nextActionTitle =
    primaryAction?.label ?? "Operational record is current";
  const nextActionDescription =
    primaryAction?.summary ??
    "This job already reflects its current operational handoff. Use Project Workspace for broader readiness context and Invoice Workspace for billing review.";
  const workflowSteps = getExecutionWorkflowSteps(job, jobAssignments.length, {
    estimateStatus: linkedEstimate?.status ?? null,
    linkedInvoiceStatus: linkedInvoice?.status ?? null,
    linkedInvoiceBalanceDue: linkedInvoice?.balanceDueAmount ?? null,
    fieldEvidenceCount:
      jobDailyLogs.length + jobTimeCards.length + jobPunchlistItems.length
  });
  const jobStateItems: ProjectStateSummaryProps["items"] = [
    {
      id: "schedule",
      label: "Schedule",
      value: formatScheduledDate(job.scheduledDate),
      tone: job.dispatchStatus === "unscheduled" ? "needsAction" : "complete",
      detail: job.scheduledStartAt
        ? `${formatScheduleDateTime(job.scheduledStartAt)}${job.scheduledEndAt ? ` to ${formatScheduleDateTime(job.scheduledEndAt)}` : ""}`
        : "No start or end time captured"
    },
    {
      id: "crew",
      label: "Crew",
      value: `${jobAssignments.length} assignment${jobAssignments.length === 1 ? "" : "s"}`,
      tone: jobAssignments.length > 0 ? "complete" : "needsAction",
      detail: job.crewVendor?.name ?? "No crew vendor assigned"
    },
    {
      id: "status",
      label: "Status",
      value: (
        <span className="capitalize">
          {formatStatusLabel(job.dispatchStatus)}
        </span>
      ),
      tone:
        job.dispatchStatus === "completed"
          ? "complete"
          : job.dispatchStatus === "unscheduled"
            ? "needsAction"
            : "active",
      detail:
        job.dispatchStatus === "in_progress"
          ? "Field work is active"
          : job.dispatchStatus === "completed"
            ? "Ready for billing follow-through"
            : "Execution state on the job"
    },
    {
      id: "project",
      label: "Project",
      value: job.project ? (
        <Link href={`/projects/${job.project.id}`}>{job.project.name}</Link>
      ) : (
        "Unknown project"
      ),
      tone: "pending",
      detail: job.customer?.name ?? "Unknown customer"
    }
  ];
  const canUpdateSchedule = job.dispatchStatus !== "completed";
  const canUnschedule = job.dispatchStatus === "scheduled";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-sm sm:p-6">
          <DetailPageHeader
            eyebrow="Job Workspace"
            title={job.project?.name ?? "Job record"}
            description="Use this page to run the job/schedule stage day-to-day: confirm dispatch state, schedule timing, crew readiness, field evidence, and invoice/payment handoff on the same canonical project chain."
            backHref="/jobs"
            backLabel="Back to jobs"
            actions={
              <Link
                href={`/projects/${job.projectId}`}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Open project hub
              </Link>
            }
          />

          {resolvedSearchParams.error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <div className="mt-8 space-y-4">
            <ActionBar
              title={nextActionTitle}
              description={nextActionDescription}
              statusLabel={formatStatusLabel(job.dispatchStatus)}
              statusTone={getActionBarStatusTone(job.dispatchStatus)}
              nextActionLabel={
                operationalBlockers.length > 0
                  ? `${operationalBlockers.length} operational follow-up${operationalBlockers.length === 1 ? "" : "s"}`
                  : "Operational record current"
              }
              primaryAction={
                primaryAction
                  ? renderPrimaryAction(
                      primaryAction,
                      job,
                      primaryActionClassName
                    )
                  : null
              }
              secondaryActions={
                <>
                  <a
                    href="#schedule-and-crew"
                    className={secondaryActionClassName}
                  >
                    Update Schedule
                  </a>
                  <Link
                    href={`/projects/${job.projectId}`}
                    className={secondaryActionClassName}
                  >
                    View Project
                  </Link>
                  <ActionOverflowMenu>
                    <a
                      href="#schedule-and-crew"
                      className={overflowActionClassName}
                    >
                      Assign Crew
                    </a>
                    {canUnschedule ? (
                      <a
                        href="#schedule-and-crew"
                        className={overflowActionClassName}
                      >
                        Unschedule
                      </a>
                    ) : null}
                    {job.estimateId ? (
                      <Link
                        href={`/estimates/${job.estimateId}`}
                        className={overflowActionClassName}
                      >
                        View Estimate
                      </Link>
                    ) : null}
                    {linkedInvoice ? (
                      <Link
                        href={`/invoices/${linkedInvoice.id}`}
                        className={overflowActionClassName}
                      >
                        View Invoice
                      </Link>
                    ) : null}
                  </ActionOverflowMenu>
                </>
              }
              meta={
                <>
                  {job.customer?.name ?? "Unknown customer"} ·{" "}
                  {job.project?.name ?? "Unknown project"}
                </>
              }
            />

            <WorkflowBar title="Job execution workflow" steps={workflowSteps} />

            <ProjectStateSummary
              title="Job execution state"
              items={jobStateItems}
            />

            <NeedsAttentionPanel
              cues={jobAttentionCues}
              description="Job-specific scheduling and crew cues derived from this canonical job and enabled organization rules. Upstream contract, deposit, financing, or project-readiness blockers stay anchored in Project Workspace."
              getCueStateControls={(cue) => (
                <CueStateControls
                  identity={buildOperationalCueIdentity(cue)}
                  support={getCueStateActionSupport(cue)}
                  returnTo={`/jobs/${job.id}`}
                />
              )}
            />
          </div>
        </div>

        <PrimarySection
          title="Schedule and crew"
          description="Set the work timing, keep the dispatch state current, and attach the people or labor-provider vendors who will execute the job/schedule stage."
          className="scroll-mt-24"
        >
          <div id="schedule-and-crew" className="space-y-6">
            <div className="space-y-6">
              {operationalBlockers.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Operational follow-through needed
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    These are job-level execution gaps. If the job should not be
                    here yet, resolve upstream signature, deposit, financing, or
                    readiness blockers in Project Workspace.
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-900">
                    {operationalBlockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Current schedule
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="font-medium text-slate-950">
                      Scheduled date
                    </dt>
                    <dd>{formatScheduledDate(job.scheduledDate)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Crew vendor</dt>
                    <dd>{job.crewVendor?.name ?? "No vendor assigned"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">
                      Scheduled start
                    </dt>
                    <dd>{formatScheduleDateTime(job.scheduledStartAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">
                      Scheduled end
                    </dt>
                    <dd>{formatScheduleDateTime(job.scheduledEndAt)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-950">
                      Schedule notes
                    </dt>
                    <dd>{job.scheduleNotes ?? "No schedule notes yet."}</dd>
                  </div>
                </dl>
              </div>

              {canUpdateSchedule ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">
                    {job.dispatchStatus === "unscheduled"
                      ? "Set schedule"
                      : "Update schedule"}
                  </p>
                  <SaveStateForm
                    action={scheduleJobAction}
                    enabled={job.dispatchStatus !== "unscheduled"}
                    pendingLabel="Saving..."
                    className="mt-4 space-y-4"
                  >
                    <input type="hidden" name="jobId" value={job.id} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Scheduled date
                        </span>
                        <input
                          type="date"
                          name="scheduledDate"
                          defaultValue={job.scheduledDate ?? ""}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Scheduled start
                        </span>
                        <input
                          type="datetime-local"
                          name="scheduledStartAt"
                          defaultValue={
                            job.scheduledStartAt
                              ? job.scheduledStartAt.slice(0, 16)
                              : ""
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        />
                      </label>

                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Scheduled end
                        </span>
                        <input
                          type="datetime-local"
                          name="scheduledEndAt"
                          defaultValue={
                            job.scheduledEndAt
                              ? job.scheduledEndAt.slice(0, 16)
                              : ""
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-800">
                        Schedule notes
                      </span>
                      <textarea
                        name="scheduleNotes"
                        defaultValue={job.scheduleNotes ?? ""}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        placeholder="Access notes, sequencing reminders, or day-of-job details"
                      />
                    </label>

                    <div className="flex flex-wrap gap-3">
                      <SaveStateSubmitButton
                        submitLabel="Save schedule"
                        pendingLabel="Saving..."
                        className="rounded-full"
                      />
                    </div>
                  </SaveStateForm>

                  {canUnschedule ? (
                    <form action={unscheduleJobAction} className="mt-3">
                      <input type="hidden" name="jobId" value={job.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        Unschedule job
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Assign crew
                </p>
                {hasAssignableCrewOptions ? (
                  <form action={assignCrewAction} className="mt-4 space-y-4">
                    <input type="hidden" name="jobId" value={job.id} />
                    <input
                      type="hidden"
                      name="projectId"
                      value={job.projectId}
                    />
                    <input
                      type="hidden"
                      name="estimateId"
                      value={job.estimateId ?? ""}
                    />

                    <div className="grid gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Crew member
                        </span>
                        <select
                          name="personId"
                          defaultValue=""
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        >
                          <option value="">No person selected</option>
                          {assignablePeople.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.displayName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Subcontractor vendor
                        </span>
                        <select
                          name="vendorId"
                          defaultValue=""
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        >
                          <option value="">No vendor selected</option>
                          {laborVendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-800">
                          Role
                        </span>
                        <select
                          name="role"
                          defaultValue="crew"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        >
                          <option value="lead">Lead</option>
                          <option value="crew">Crew</option>
                          <option value="subcontractor">Subcontractor</option>
                        </select>
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">
                            Assigned start
                          </span>
                          <input
                            type="datetime-local"
                            name="assignedStartAt"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">
                            Assigned end
                          </span>
                          <input
                            type="datetime-local"
                            name="assignedEndAt"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                    >
                      Add assignment
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No assignable crew members or labor-provider vendors are
                    available yet. Add workforce or labor-provider records in
                    People or Vendors before assigning this canonical job.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Assigned crew
                </p>
                <div className="mt-4 grid gap-3">
                  {jobAssignments.length > 0 ? (
                    jobAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {assignment.person?.displayName ??
                                assignment.vendor?.name ??
                                "Unknown assignment"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {formatStatusLabel(assignment.role)}
                              {assignment.assignedStartAt
                                ? ` | ${formatScheduleDateTime(assignment.assignedStartAt)}`
                                : ""}
                              {assignment.assignedEndAt
                                ? ` to ${formatScheduleDateTime(assignment.assignedEndAt)}`
                                : ""}
                            </p>
                          </div>
                          <form action={unassignCrewAction}>
                            <input type="hidden" name="jobId" value={job.id} />
                            <input
                              type="hidden"
                              name="assignmentId"
                              value={assignment.id}
                            />
                            <input
                              type="hidden"
                              name="projectId"
                              value={job.projectId}
                            />
                            <input
                              type="hidden"
                              name="estimateId"
                              value={job.estimateId ?? ""}
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                              Unassign
                            </button>
                          </form>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                      No crew assignments have been added yet. Scheduled jobs
                      stay in the job/schedule stage until people or
                      labor-provider vendors are attached.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PrimarySection>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <DetailPanel
            title="Connected Records"
            description="Project, customer, estimate/contract, and invoice/payment context stays available without competing with schedule and crew execution."
          >
            <div className="grid gap-4">
              {job.project ? (
                <LinkedRecordCard
                  href={`/projects/${job.project.id}`}
                  title={job.project.name}
                  subtitle="Project"
                  meta={job.customer?.name ?? "Unknown customer"}
                  badge={renderStatusBadge("Project hub")}
                />
              ) : null}
              {linkedEstimate ? (
                <LinkedRecordCard
                  href={`/estimates/${linkedEstimate.id}`}
                  title={linkedEstimate.referenceNumber}
                  subtitle="Estimate"
                  meta={`Status ${formatStatusLabel(linkedEstimate.status)}`}
                  badge={renderStatusBadge(
                    formatStatusLabel(linkedEstimate.status)
                  )}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No linked estimate is attached to this job. Use Project
                  Workspace if the upstream estimate/contract context needs
                  review before execution continues.
                </div>
              )}
              {linkedInvoice ? (
                <LinkedRecordCard
                  href={`/invoices/${linkedInvoice.id}`}
                  title={linkedInvoice.referenceNumber}
                  subtitle="Invoice"
                  meta={`Balance due ${formatCurrency(linkedInvoice.balanceDueAmount)}`}
                  badge={renderStatusBadge(
                    formatStatusLabel(linkedInvoice.status)
                  )}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No invoice has been created from this job yet.
                  {job.dispatchStatus === "completed" ? (
                    <div className="mt-4">
                      <Link
                        href={`/invoices?projectId=${job.projectId}&jobId=${job.id}`}
                        className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                      >
                        Create invoice
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Complete the job before creating an invoice from this
                      workflow; upstream readiness issues belong in Project
                      Workspace.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Labor and Time"
            description="Labor context supports the job/schedule stage through canonical time cards and punch state instead of a separate field-labor model."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-medium text-slate-950">
                  Current punch state
                </p>
                {jobOpenTimeStates.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {jobOpenTimeStates.map((state) => (
                      <div key={state.id}>
                        <p className="font-medium text-slate-950">
                          {state.person?.displayName ?? "Unknown worker"}
                        </p>
                        <p>
                          {state.currentPunchState === "on_break"
                            ? "On break"
                            : "Punched in"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">
                    No open time sessions are currently attributed to this job.
                    Active labor evidence will appear here when crew time is
                    punched against the same project/job chain.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-medium text-slate-950">Recent time cards</p>
                {jobTimeCards.slice(0, 3).length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {jobTimeCards.slice(0, 3).map((timeCard) => (
                      <p key={timeCard.id}>
                        <Link
                          href={`/time-cards/${timeCard.id}`}
                          className="font-medium text-brand-700"
                        >
                          {timeCard.person?.displayName ?? "Unknown worker"}
                        </Link>{" "}
                        | {formatDuration(timeCard.workedMinutes)} logged
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">
                    No time cards are attributed to this job yet. Time-card
                    continuity will appear once labor is recorded against this
                    execution record.
                  </p>
                )}
              </div>
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Punchlist Continuity"
          description="Closeout items stay connected to the same project/job execution chain instead of drifting into a separate field-quality subsystem."
        >
          <div className="grid gap-4">
            {jobPunchlistItems.slice(0, 4).length > 0 ? (
              jobPunchlistItems
                .slice(0, 4)
                .map((item) => (
                  <LinkedRecordCard
                    key={item.id}
                    href={`/punchlists/${item.id}`}
                    title={item.title}
                    subtitle={item.assignee?.displayName ?? "Unassigned"}
                    meta={
                      item.dueDate
                        ? `Due ${formatDate(item.dueDate)}`
                        : "No due date"
                    }
                    badge={renderStatusBadge(formatStatusLabel(item.status))}
                  />
                ))
            ) : (
              <AppEmptyState
                eyebrow="No punchlist items"
                title="No linked closeout items yet"
                description="Create punchlist work when this job needs durable corrective or closeout follow-through beyond one project-day note."
                actionHref={`/punchlists?projectId=${job.projectId}&jobId=${job.id}&compose=1`}
                actionLabel="Create punchlist item"
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Daily Execution Context"
          description="Daily logs stay connected to the same project/job chain so field context does not drift into a separate execution subsystem."
        >
          <div className="grid gap-4">
            {jobDailyLogs.slice(0, 4).length > 0 ? (
              jobDailyLogs
                .slice(0, 4)
                .map((dailyLog) => (
                  <LinkedRecordCard
                    key={dailyLog.id}
                    href={`/daily-logs/${dailyLog.id}`}
                    title={
                      dailyLog.summary?.trim() || formatDate(dailyLog.logDate)
                    }
                    subtitle={formatDate(dailyLog.logDate)}
                    meta={dailyLog.weatherSummary ?? "No weather summary"}
                    badge={renderStatusBadge(
                      formatStatusLabel(dailyLog.status)
                    )}
                  />
                ))
            ) : (
              <AppEmptyState
                eyebrow="No daily logs"
                title="No linked job-day execution records yet"
                description="Create a daily log from the connected project when this job becomes the dominant field context for a project day. The log will capture field evidence without changing schedule, time-card, invoice, or readiness behavior."
                actionHref={`/daily-logs?projectId=${job.projectId}&jobId=${job.id}`}
                actionLabel="Create daily log"
              />
            )}
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Record Links"
          description="Compact linked-record context stays in the rail so the main column can stay focused on job/schedule execution."
        >
          <ContextFactsList
            items={[
              {
                label: "Customer",
                value: job.customer ? (
                  <Link
                    href={`/customers/${job.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {job.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )
              },
              {
                label: "Project",
                value: job.project ? (
                  <Link
                    href={`/projects/${job.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {job.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Estimate linkage",
                value: linkedEstimate
                  ? linkedEstimate.referenceNumber
                  : "No linked estimate"
              },
              {
                label: "Invoice linkage",
                value: linkedInvoice
                  ? linkedInvoice.referenceNumber
                  : "No linked invoice"
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Job Notes"
          description="Operational notes stay visible, but schedule, crew, field evidence, and billing handoff remain the primary working surfaces."
        >
          <p className="text-sm leading-7 text-slate-600">
            {job.notes ?? "No job notes have been added yet."}
          </p>
        </DetailPanel>

        <DetailPanel
          title="Workflow Guidance"
          description="Jobs are downstream execution records in the shared lifecycle. Use Project Workspace for upstream readiness and Invoice Workspace for billing review."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              This page should answer the operational question first: what state
              the work is in, when it is scheduled, who is attached, what field
              evidence exists, and what should happen next.
            </p>
            <p>
              When broader commercial context matters, return to Project
              Workspace instead of treating the job page like a separate
              workflow island.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
