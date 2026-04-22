import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
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
import { listVendors } from "@/lib/vendors/data";

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
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Unscheduled";
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

function getStatusClasses(status: string) {
  switch (status) {
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "unscheduled":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
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
        label: "Mark scheduled",
        nextStatus: "scheduled",
        helper: "Move this job into the scheduled state once timing is committed.",
        summary: "This job is commercially ready and waiting on the first real schedule commitment."
      };
    case "scheduled":
      return {
        label: "Start work",
        nextStatus: "in_progress",
        helper: "Move the job into active execution when the crew begins field work.",
        summary: "Scheduling is in place. The next real step is starting field execution."
      };
    case "in_progress":
      return {
        label: "Mark complete",
        nextStatus: "completed",
        helper: "Close the job when field work is finished and billing follow-through can start.",
        summary: "Execution is underway. Close the job once field work is truly complete."
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
      helper: "Move completed work into billing using the connected invoice flow.",
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
      <input type="hidden" name="scheduledDate" value={job.scheduledDate ?? ""} />
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
      <input type="hidden" name="scheduleNotes" value={job.scheduleNotes ?? ""} />
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
  const job = await getJobById(jobId, `/jobs/${jobId}`);

  if (!job) {
    notFound();
  }

  const [linkedEstimate, invoices, jobAssignments, people, vendors, jobPunchlistItems] =
    await Promise.all([
    job.estimateId ? getEstimateById(job.estimateId, `/jobs/${jobId}`) : Promise.resolve(null),
    listInvoices(),
    listJobAssignments(job.id, `/jobs/${jobId}`),
    listPeople(),
    listVendors(),
    listPunchlistItemsByJob(job.id, `/jobs/${jobId}`)
  ]);
  const [jobTimeCards, openTimeStates] = await Promise.all([
    listTimeCardsByJob(job.id, `/jobs/${jobId}`),
    listOpenTimeCardStates()
  ]);
  const projectDailyLogs = await listDailyLogsByProject(job.projectId, `/jobs/${jobId}`);

  const linkedInvoice = invoices.find((invoice) => invoice.jobId === job.id) ?? null;
  const jobOpenTimeStates = openTimeStates.filter((state) => state.jobId === job.id);
  const jobDailyLogs = projectDailyLogs.filter((dailyLog) => dailyLog.jobId === job.id);
  const assignablePeople = people.filter((person) => person.isActive && person.isAssignable);
  const laborVendors = vendors.filter((vendor) => vendor.isActive && vendor.isLaborProvider);
  const operationalBlockers = [
    job.dispatchStatus === "unscheduled" ? "schedule commitment still missing" : null,
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
  const nextActionTitle = primaryAction?.label ?? "Operational record is current";
  const nextActionDescription =
    primaryAction?.summary ??
    "This job already reflects its current operational handoff. Use the linked project, estimate, and invoice records for broader workflow context.";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Job Workspace"
            title={job.project?.name ?? "Job record"}
            description="Use this page to run the job day-to-day: confirm dispatch state, schedule timing, crew readiness, and downstream billing handoff on the same canonical project chain."
            backHref="/jobs"
            backLabel="Back to jobs"
            actions={
              <>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${job.projectId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open project hub
                  </Link>
                  {renderPrimaryAction(
                    primaryAction,
                    job,
                    "inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                      job.dispatchStatus
                    )}`}
                  >
                    {formatStatusLabel(job.dispatchStatus)}
                  </span>
                  {renderStatusBadge(linkedInvoice ? "Billing linked" : "No invoice yet")}
                </div>
              </>
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

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "review-purpose",
                  label: "Workspace role",
                  content: (
                    <p>
                      Jobs are the operational execution workspace. Keep schedule, crew, labor support, and billing handoff clear here, then return to the project hub when broader readiness context matters.
                    </p>
                  )
                },
                {
                  key: "current-state",
                  label: "Dispatch state",
                  content: (
                    <>
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {formatStatusLabel(job.dispatchStatus)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {job.dispatchStatus === "unscheduled"
                          ? "Operational work is ready but not yet committed to the schedule."
                          : job.dispatchStatus === "scheduled"
                            ? `Scheduled for ${formatScheduledDate(job.scheduledDate)}.`
                            : job.dispatchStatus === "in_progress"
                              ? "Field execution is actively underway."
                              : "Field execution is complete and ready for billing follow-through."}
                      </p>
                    </>
                  )
                },
                {
                  key: "schedule",
                  label: "Schedule",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatScheduledDate(job.scheduledDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {job.scheduledStartAt
                          ? `${formatScheduleDateTime(job.scheduledStartAt)}${job.scheduledEndAt ? ` to ${formatScheduleDateTime(job.scheduledEndAt)}` : ""}`
                          : "No start or end time has been captured yet."}
                      </p>
                    </>
                  )
                },
                {
                  key: "blockers",
                  label: "Operational blockers",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {operationalBlockers.length > 0 ? "Needs follow-through" : "No active blockers"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {operationalBlockers.length > 0
                          ? operationalBlockers.join(" | ")
                          : "Schedule, crew, and downstream billing handoff are aligned with the current dispatch state."}
                      </p>
                    </>
                  )
                },
                {
                  key: "next-action",
                  label: "Next best action",
                  content: (
                    <NextActionCard
                      title={nextActionTitle}
                      description={nextActionDescription}
                      className="space-y-3 text-sm leading-6 text-slate-600"
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <DetailPanel
            title="Operational State"
            description="This is the main workspace for the job itself: dispatch state, customer context, and the connected field notes that travel with the job."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Dispatch summary</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <p>
                      <span className="font-medium text-slate-950">Dispatch status:</span>{" "}
                      <span className="capitalize">{formatStatusLabel(job.dispatchStatus)}</span>
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Scheduled date:</span>{" "}
                      {formatScheduledDate(job.scheduledDate)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Created:</span>{" "}
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Updated:</span>{" "}
                      {new Date(job.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Customer and project</p>
                  <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <div>
                      <dt className="font-medium text-slate-950">Customer</dt>
                      <dd>
                        {job.customer ? (
                          <Link
                            href={`/customers/${job.customer.id}`}
                            className="font-medium text-brand-700"
                          >
                            {job.customer.name}
                          </Link>
                        ) : (
                          "Unknown customer"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">Project</dt>
                      <dd>
                        {job.project ? (
                          <Link
                            href={`/projects/${job.project.id}`}
                            className="font-medium text-brand-700"
                          >
                            {job.project.name}
                          </Link>
                        ) : (
                          "Unknown project"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-950">Customer company</dt>
                      <dd>{job.customer?.companyName ?? "Not provided"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">Job notes</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {job.notes ?? "No job notes have been added yet."}
                  </p>
                </div>

                {primaryAction ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                    <p className="text-sm font-medium text-slate-950">Action guidance</p>
                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      {primaryAction.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {primaryAction.helper}
                    </p>
                    <div className="mt-4">
                      {renderPrimaryAction(
                        primaryAction,
                        job,
                        "inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Scheduling and Crew"
            description="This first pass keeps scheduling and crew assignment directly on the canonical job record and its assignment rows."
          >
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Current schedule</p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="font-medium text-slate-950">Scheduled date</dt>
                    <dd>{formatScheduledDate(job.scheduledDate)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Crew vendor</dt>
                    <dd>{job.crewVendor?.name ?? "No vendor assigned"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Scheduled start</dt>
                    <dd>{formatScheduleDateTime(job.scheduledStartAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-950">Scheduled end</dt>
                    <dd>{formatScheduleDateTime(job.scheduledEndAt)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-950">Schedule notes</dt>
                    <dd>{job.scheduleNotes ?? "No schedule notes yet."}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Update schedule</p>
                <form action={scheduleJobAction} className="mt-4 space-y-4">
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
                        defaultValue={job.scheduledStartAt ? job.scheduledStartAt.slice(0, 16) : ""}
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
                        defaultValue={job.scheduledEndAt ? job.scheduledEndAt.slice(0, 16) : ""}
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
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                    >
                      Save schedule
                    </button>
                  </div>
                </form>

                <form action={unscheduleJobAction} className="mt-3">
                  <input type="hidden" name="jobId" value={job.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Unschedule job
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Assign crew</p>
                <form action={assignCrewAction} className="mt-4 space-y-4">
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="projectId" value={job.projectId} />
                  <input type="hidden" name="estimateId" value={job.estimateId ?? ""} />

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
                      <span className="mb-2 block text-sm font-medium text-slate-800">Role</span>
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
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Assigned crew</p>
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
                            <input type="hidden" name="assignmentId" value={assignment.id} />
                            <input type="hidden" name="projectId" value={job.projectId} />
                            <input type="hidden" name="estimateId" value={job.estimateId ?? ""} />
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
                      No crew assignments have been added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DetailPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <DetailPanel
            title="Linked Workflow Context"
            description="Jobs remain downstream operational records, but they should still point back to the same connected project, estimate, and invoice chain."
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
                  meta={`Total ${formatCurrency(linkedEstimate.totalAmount)}`}
                  badge={renderStatusBadge(formatStatusLabel(linkedEstimate.status))}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No linked estimate is attached to this job.
                </div>
              )}
              {linkedInvoice ? (
                <LinkedRecordCard
                  href={`/invoices/${linkedInvoice.id}`}
                  title={linkedInvoice.referenceNumber}
                  subtitle="Invoice"
                  meta={`Balance due ${formatCurrency(linkedInvoice.balanceDueAmount)}`}
                  badge={renderStatusBadge(formatStatusLabel(linkedInvoice.status))}
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
                      Complete the job before creating an invoice from this workflow.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Labor and Time"
            description="Labor context supports the operational record, but it stays secondary to the main job workspace above."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
                <p className="font-medium text-slate-950">Current punch state</p>
                {jobOpenTimeStates.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {jobOpenTimeStates.map((state) => (
                      <div key={state.id}>
                        <p className="font-medium text-slate-950">
                          {state.person?.displayName ?? "Unknown worker"}
                        </p>
                        <p>
                          {state.currentPunchState === "on_break" ? "On break" : "Punched in"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2">No open time sessions are currently attributed to this job.</p>
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
                  <p className="mt-2">No time cards are attributed to this job yet.</p>
                )}
              </div>
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Punchlist Continuity"
          description="Closeout items stay connected to the same job record instead of drifting into a separate punchlist subsystem."
        >
          <div className="grid gap-4">
            {jobPunchlistItems.slice(0, 4).length > 0 ? (
              jobPunchlistItems.slice(0, 4).map((item) => (
                <LinkedRecordCard
                  key={item.id}
                  href={`/punchlists/${item.id}`}
                  title={item.title}
                  subtitle={item.assignee?.displayName ?? "Unassigned"}
                  meta={item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"}
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
          description="Daily execution records stay connected to the same project and job chain so field context does not drift into a separate execution subsystem."
        >
          <div className="grid gap-4">
            {jobDailyLogs.slice(0, 4).length > 0 ? (
              jobDailyLogs.slice(0, 4).map((dailyLog) => (
                <LinkedRecordCard
                  key={dailyLog.id}
                  href={`/daily-logs/${dailyLog.id}`}
                  title={dailyLog.summary?.trim() || formatDate(dailyLog.logDate)}
                  subtitle={formatDate(dailyLog.logDate)}
                  meta={dailyLog.weatherSummary ?? "No weather summary"}
                  badge={renderStatusBadge(formatStatusLabel(dailyLog.status))}
                />
              ))
            ) : (
              <AppEmptyState
                eyebrow="No daily logs"
                title="No linked job-day execution records yet"
                description="Create a daily log from the connected project when this job becomes the dominant field context for a project day."
                actionHref={`/daily-logs?projectId=${job.projectId}&jobId=${job.id}`}
                actionLabel="Create daily log"
              />
            )}
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Job Context"
          description="Compact context stays in the rail so the main column can stay focused on dispatch, schedule, and workflow continuity."
        >
          <ContextFactsList
            items={[
              {
                label: "Dispatch status",
                value: <span className="capitalize">{formatStatusLabel(job.dispatchStatus)}</span>
              },
              {
                label: "Scheduled date",
                value: formatScheduledDate(job.scheduledDate)
              },
              {
                label: "Scheduled start",
                value: formatScheduleDateTime(job.scheduledStartAt)
              },
              {
                label: "Scheduled end",
                value: formatScheduleDateTime(job.scheduledEndAt)
              },
              {
                label: "Crew vendor",
                value: job.crewVendor?.name ?? "No vendor assigned"
              },
              {
                label: "Crew assignments",
                value: `${jobAssignments.length} assignment${jobAssignments.length === 1 ? "" : "s"}`
              },
              {
                label: "Customer",
                value: job.customer ? (
                  <Link href={`/customers/${job.customer.id}`} className="font-medium text-brand-700">
                    {job.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )
              },
              {
                label: "Project",
                value: job.project ? (
                  <Link href={`/projects/${job.project.id}`} className="font-medium text-brand-700">
                    {job.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Estimate linkage",
                value: linkedEstimate ? linkedEstimate.referenceNumber : "No linked estimate"
              },
              {
                label: "Invoice linkage",
                value: linkedInvoice ? linkedInvoice.referenceNumber : "No linked invoice"
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Workflow Guidance"
          description="Jobs are downstream execution records. Use the project page for upstream readiness and the invoice page for billing review."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              This page should answer the operational question first: what state the work is in,
              when it is scheduled, who is attached, and what should happen next.
            </p>
            <p>
              When broader commercial context matters, return to the project hub instead of treating the job page like a separate workflow island.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
