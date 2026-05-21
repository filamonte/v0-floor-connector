import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { JobQuickCreateForm } from "@/components/job-quick-create-form";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateJobAction } from "@/lib/jobs/actions";
import {
  getJobQuickCreateOptions,
  getJobsManagerReadModel,
  isJobsManagerView,
  type JobsManagerJob,
  type JobsManagerView
} from "@/lib/jobs/manager-read-model";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { buildScheduleHref } from "@/lib/schedule/links";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type JobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    view?: JobsManagerView;
    compose?: string;
    projectId?: string;
    estimateId?: string;
    contractId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString()
    : "Unscheduled";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getJobContinuityCue(job: JobsManagerJob) {
  if (job.dispatchStatus === "unscheduled") {
    return "Next: schedule job";
  }

  if (job.dispatchStatus === "scheduled" && job.crewVendorId === null) {
    return "Next: assign crew vendor";
  }

  if (job.dispatchStatus === "scheduled" && job.assignmentCount === 0) {
    return "Next: add crew assignments";
  }

  if (job.dispatchStatus === "scheduled") {
    return `Ready: ${formatDate(job.scheduledDate)}`;
  }

  if (job.dispatchStatus === "in_progress") {
    return "Field work active";
  }

  if (job.dispatchStatus === "completed") {
    return "Ready for closeout";
  }

  return "Review job workspace";
}

function getJobPrimaryAction(job: JobsManagerJob) {
  switch (job.dispatchStatus) {
    case "unscheduled":
      return {
        label: "Set Schedule",
        href:
          buildScheduleHref({
            projectId: job.projectId,
            view: "unscheduled",
            action: "schedule",
            jobId: job.id
          }) + "#schedule-action"
      };
    default:
      return null;
  }
}

function getJobScheduleActionHref(job: JobsManagerJob) {
  return (
    buildScheduleHref({
      projectId: job.projectId,
      view: job.dispatchStatus === "unscheduled" ? "unscheduled" : "all",
      action:
        job.dispatchStatus === "unscheduled" || job.crewVendorId !== null
          ? "schedule"
          : "assign",
      jobId: job.id
    }) + "#schedule-action"
  );
}

function buildJobsHref(input: {
  q?: string;
  view?: JobsManagerView;
  compose?: string;
  projectId?: string;
  estimateId?: string;
  contractId?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  if (input.contractId) {
    searchParams.set("contractId", input.contractId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/jobs?${query}` : "/jobs";
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/jobs");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Job records need an active organization before they can be created. Sign
        out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const view: JobsManagerView = isJobsManagerView(resolvedSearchParams.view)
    ? resolvedSearchParams.view
    : "all";
  const projectFilterId = resolvedSearchParams.projectId?.trim() ?? "";
  const estimateContextId = resolvedSearchParams.estimateId?.trim() ?? "";
  const contractContextId = resolvedSearchParams.contractId?.trim() ?? "";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const [readModel, readyProjectOptions] = await Promise.all([
    getJobsManagerReadModel({
      organizationId: organizationContext.organization.id,
      query,
      view,
      projectId: projectFilterId || undefined
    }),
    showComposer
      ? getJobQuickCreateOptions(organizationContext.organization.id)
      : Promise.resolve([])
  ]);

  const jobViews = [
    { key: "all", label: "All jobs", count: readModel.counts.all },
    {
      key: "unscheduled",
      label: "Unscheduled",
      count: readModel.counts.unscheduled
    },
    { key: "scheduled", label: "Scheduled", count: readModel.counts.scheduled },
    {
      key: "in_progress",
      label: "In progress",
      count: readModel.counts.in_progress
    },
    { key: "completed", label: "Completed", count: readModel.counts.completed }
  ] as const;
  const recentJobs = readModel.jobs;

  return (
    <ContractorWorkspacePage
      eyebrow="Jobs"
      title="Field work with clear operational status"
      description="Use jobs as the operational link between project readiness, crew scheduling, time, daily logs, and invoice-ready completion."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Unscheduled
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.unscheduled}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Scheduled
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.scheduled}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              In progress
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.in_progress}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Completed
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.counts.completed}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review the live execution queue here, use project-anchored quick
            create when a ready project needs a job, and keep deeper scheduling
            work on the dedicated schedule surface.
          </p>
        ),
        searchSlot: (
          <form action="/jobs" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? (
              <input type="hidden" name="view" value={view} />
            ) : null}
            {showComposer ? (
              <input type="hidden" name="compose" value="1" />
            ) : null}
            {projectFilterId ? (
              <input type="hidden" name="projectId" value={projectFilterId} />
            ) : null}
            {estimateContextId ? (
              <input
                type="hidden"
                name="estimateId"
                value={estimateContextId}
              />
            ) : null}
            {contractContextId ? (
              <input
                type="hidden"
                name="contractId"
                value={contractContextId}
              />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, estimate, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 ||
            view !== "all" ||
            showComposer ||
            projectFilterId ? (
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: jobViews.map((jobView) => {
          const isActive = view === jobView.key;

          return (
            <Link
              key={jobView.key}
              href={buildJobsHref({
                q: query,
                view: jobView.key,
                compose: showComposer ? "1" : undefined,
                projectId: projectFilterId || undefined,
                estimateId: showComposer
                  ? estimateContextId || undefined
                  : undefined,
                contractId: showComposer
                  ? contractContextId || undefined
                  : undefined
              })}
              className={[
                "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{jobView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {jobView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildJobsHref({
              q: query,
              view,
              compose: "1",
              projectId: projectFilterId || undefined,
              estimateId: estimateContextId || undefined,
              contractId: contractContextId || undefined
            })}
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New job
          </Link>
        )
      }}
    >
      <div className="space-y-6">
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

        {projectFilterId ? (
          <div className="flex flex-col gap-3 border border-[#d6d6d6] bg-white px-5 py-4 text-sm leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing jobs for{" "}
              <span className="font-semibold text-slate-900">
                {readModel.projectContext?.name ?? "the selected project"}
              </span>
              . Counts and queues are scoped to this project until the filter is
              cleared.
            </p>
            <Link
              href={buildJobsHref({
                q: query,
                view,
                compose: showComposer ? "1" : undefined,
                estimateId: showComposer
                  ? estimateContextId || undefined
                  : undefined,
                contractId: showComposer
                  ? contractContextId || undefined
                  : undefined
              })}
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Clear project
            </Link>
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Unscheduled"
            description="Jobs that still need scheduling follow-through."
            actionHref={buildJobsHref({
              q: query,
              view: "unscheduled",
              projectId: projectFilterId || undefined
            })}
            actionLabel="Review jobs"
            items={readModel.unscheduledJobs.map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: job.estimate?.referenceNumber
                ? `Estimate ${job.estimate.referenceNumber}`
                : "Project-created job",
              badge: job.dispatchStatus,
              trailing: formatDateTime(job.updatedAt)
            }))}
            emptyTitle="No unscheduled jobs"
            emptyDescription="Jobs waiting on their first scheduling step will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Scheduled without crew vendor"
            description="Scheduled jobs that still do not have a crew vendor attached on the job record."
            actionHref={buildJobsHref({
              q: query,
              view: "scheduled",
              projectId: projectFilterId || undefined
            })}
            actionLabel="Open scheduled"
            items={readModel.scheduledWithoutCrewVendor.map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: `Scheduled ${formatDate(job.scheduledDate)}`,
              badge: job.dispatchStatus,
              trailing: "Crew vendor missing"
            }))}
            emptyTitle="All scheduled jobs have a crew vendor"
            emptyDescription="Scheduled jobs without a crew vendor will surface here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Scheduled without assignments"
            description="Scheduled jobs that do not yet have any crew assignments on the shared job-assignment chain."
            actionHref={buildJobsHref({
              q: query,
              view: "scheduled",
              projectId: projectFilterId || undefined
            })}
            actionLabel="Review staffing"
            items={readModel.scheduledWithoutAssignments.map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: `Scheduled ${formatDate(job.scheduledDate)}`,
              badge: job.dispatchStatus,
              trailing: "No assignments"
            }))}
            emptyTitle="All scheduled jobs have assignments"
            emptyDescription="Once scheduled jobs are missing assignment rows, they will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="In progress"
            description="Jobs already in execution and still connected to time, logs, punchlists, and downstream billing."
            actionHref={buildJobsHref({
              q: query,
              view: "in_progress",
              projectId: projectFilterId || undefined
            })}
            actionLabel="View active"
            items={readModel.inProgressJobs.map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: job.crewVendor?.name ?? "No crew vendor",
              badge: job.dispatchStatus,
              trailing: formatDate(job.scheduledDate)
            }))}
            emptyTitle="No jobs are currently in progress"
            emptyDescription="Active field work will show here once a job moves into execution."
          />
        </section>

        <section className="overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Recent records
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Latest job updates
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {recentJobs.length} visible
            </p>
          </div>

          {recentJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Job</th>
                    <th className="px-5 py-3 sm:px-6">Customer</th>
                    <th className="px-5 py-3 sm:px-6">Status</th>
                    <th className="px-5 py-3 sm:px-6">Schedule / crew</th>
                    <th className="px-5 py-3 text-right sm:px-6">Updated</th>
                    <th className="px-5 py-3 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentJobs.map((job) => {
                    const primaryAction = getJobPrimaryAction(job);

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 sm:px-6">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-semibold text-slate-950 transition hover:text-brand-700"
                          >
                            {job.project?.name ?? "Untitled job"}
                          </Link>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {job.estimate?.referenceNumber
                              ? `Estimate ${job.estimate.referenceNumber}`
                              : "Project-created job"}
                          </p>
                        </td>
                        <td className="px-5 py-4 sm:px-6">
                          <p className="font-medium text-slate-700">
                            {job.customer?.name ?? "Unknown customer"}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {job.crewVendor?.name ?? "No crew vendor"}
                          </p>
                        </td>
                        <td className="px-5 py-4 sm:px-6">
                          <span
                            className={[
                              "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                              getStatusBadgeClassName(job.dispatchStatus)
                            ].join(" ")}
                          >
                            {formatStatusLabel(job.dispatchStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 sm:px-6">
                          <p className="text-sm font-medium text-slate-700">
                            {getJobContinuityCue(job)}
                          </p>
                          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                            {job.crewVendor?.name ?? "No crew vendor"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-500 sm:px-6">
                          {formatDateTime(job.updatedAt)}
                        </td>
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex flex-wrap justify-end gap-2">
                            {primaryAction ? (
                              <Link
                                href={primaryAction.href}
                                className={primaryActionClassName}
                              >
                                {primaryAction.label}
                              </Link>
                            ) : null}
                            <Link
                              href={getJobScheduleActionHref(job)}
                              className={secondaryActionClassName}
                            >
                              Open Schedule
                            </Link>
                            <ActionOverflowMenu>
                              {job.project?.id ? (
                                <Link
                                  href={`/projects/${job.project.id}`}
                                  className={overflowActionClassName}
                                >
                                  View Project
                                </Link>
                              ) : null}
                              <Link
                                href={getJobScheduleActionHref(job)}
                                className={overflowActionClassName}
                              >
                                Schedule Panel
                              </Link>
                              <Link
                                href={`/jobs/${job.id}#schedule-and-crew`}
                                className={overflowActionClassName}
                              >
                                Assign Crew
                              </Link>
                              {job.dispatchStatus === "scheduled" ? (
                                <Link
                                  href={`/jobs/${job.id}#schedule-and-crew`}
                                  className={overflowActionClassName}
                                >
                                  Unschedule
                                </Link>
                              ) : null}
                              {job.estimate?.id ? (
                                <Link
                                  href={`/estimates/${job.estimate.id}`}
                                  className={overflowActionClassName}
                                >
                                  View Estimate
                                </Link>
                              ) : null}
                            </ActionOverflowMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={
                  readModel.counts.all > 0 ? "No matching jobs" : "No jobs yet"
                }
                title={
                  readModel.counts.all > 0
                    ? "Adjust the jobs filters"
                    : "Create the first job"
                }
                description={
                  readModel.counts.all > 0
                    ? "Try a broader search, clear the project filter, or switch to another real job status."
                    : projectFilterId
                      ? "This selected project does not have a job yet. Create one from ready project context, then finish scheduling in the job workspace."
                      : "Jobs move approved project work into execution. Create them from ready project context and then finish scheduling in the full job workspace."
                }
              />
            </div>
          )}
        </section>
      </div>

      <WorkspaceComposerSheet
        id="job-create"
        title="Quick create job"
        description="Choose a ready project, create the job, and then finish schedule, crew, and execution detail in the full job workspace."
        open={showComposer}
        openHref={buildJobsHref({
          q: query,
          view,
          compose: "1",
          projectId: projectFilterId || undefined,
          estimateId: estimateContextId || undefined,
          contractId: contractContextId || undefined
        })}
        closeHref={buildJobsHref({
          q: query,
          view,
          projectId: projectFilterId || undefined,
          estimateId: estimateContextId || undefined,
          contractId: contractContextId || undefined
        })}
        openLabel="Open job quick create"
      >
        {readyProjectOptions.length > 0 ? (
          <JobQuickCreateForm
            action={quickCreateJobAction}
            projects={readyProjectOptions}
            initialProjectId={projectFilterId || null}
            initialEstimateId={estimateContextId || null}
            initialContractId={contractContextId || null}
          />
        ) : (
          <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            A project must be ready to schedule before a job can be created.
          </div>
        )}
      </WorkspaceComposerSheet>
    </ContractorWorkspacePage>
  );
}
