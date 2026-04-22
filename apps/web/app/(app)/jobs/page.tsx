import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { JobQuickCreateForm } from "@/components/job-quick-create-form";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { quickCreateJobAction } from "@/lib/jobs/actions";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { listProjects } from "@/lib/projects/data";

type JobView = "all" | "unscheduled" | "scheduled" | "in_progress" | "completed";

type JobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    view?: JobView;
    compose?: string;
    projectId?: string;
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Unscheduled";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function buildJobsHref(input: {
  q?: string;
  view?: JobView;
  compose?: string;
  projectId?: string;
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

  const query = searchParams.toString();
  return query.length > 0 ? `/jobs?${query}` : "/jobs";
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [jobs, projects] = await Promise.all([listJobs(), listProjects()]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" || Boolean(resolvedSearchParams.error);
  const assignmentsByJobId = await listJobAssignmentsByJobIds(
    jobs.map((job) => job.id),
    "/jobs"
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesView = view === "all" ? true : job.dispatchStatus === view;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            job.project?.name ?? "",
            job.customer?.name ?? "",
            job.estimate?.referenceNumber ?? "",
            job.dispatchStatus
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesView && matchesQuery;
  });

  const unscheduledJobs = jobs.filter((job) => job.dispatchStatus === "unscheduled");
  const scheduledJobs = jobs.filter((job) => job.dispatchStatus === "scheduled");
  const inProgressJobs = jobs.filter((job) => job.dispatchStatus === "in_progress");
  const completedJobs = jobs.filter((job) => job.dispatchStatus === "completed");
  const scheduledWithoutCrewVendor = scheduledJobs.filter((job) => job.crewVendorId === null);
  const scheduledWithoutAssignments = scheduledJobs.filter((job) => {
    const assignments = assignmentsByJobId.get(job.id) ?? [];
    return assignments.length === 0;
  });

  const readyProjectOptions = projects
    .filter((project) => project.readyToScheduleAt !== null)
    .map((project) => ({
      id: project.id,
      name: project.name,
      customerName: project.customer?.name ?? null
    }));

  const jobViews = [
    { key: "all", label: "All jobs", count: jobs.length },
    { key: "unscheduled", label: "Unscheduled", count: unscheduledJobs.length },
    { key: "scheduled", label: "Scheduled", count: scheduledJobs.length },
    { key: "in_progress", label: "In progress", count: inProgressJobs.length },
    { key: "completed", label: "Completed", count: completedJobs.length }
  ] as const;

  const recentJobs = [...filteredJobs]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 20);

  return (
    <ContractorWorkspacePage
      eyebrow="Jobs"
      title="Field work with clear operational status"
      description="Use jobs as the operational link between project readiness, crew scheduling, time, daily logs, and invoice-ready completion."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
              Unscheduled
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {unscheduledJobs.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
              Scheduled
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {scheduledJobs.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
              In progress
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {inProgressJobs.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
              Completed
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {completedJobs.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review the live execution queue here, use project-anchored quick create
            when a ready project needs a job, and keep deeper scheduling work on the
            dedicated schedule surface.
          </p>
        ),
        searchSlot: (
          <form action="/jobs" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, estimate, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" || showComposer ? (
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
                compose: showComposer ? "1" : undefined
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{jobView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {jobView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildJobsHref({ q: query, view, compose: "1" })}
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
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

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Unscheduled"
            description="Jobs that exist canonically but still need scheduling follow-through."
            actionHref={buildJobsHref({ q: query, view: "unscheduled" })}
            actionLabel="Review jobs"
            items={unscheduledJobs.slice(0, 4).map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: job.estimate?.referenceNumber
                ? `Estimate ${job.estimate.referenceNumber}`
                : "Project-created job",
              trailing: formatDateTime(job.updatedAt)
            }))}
            emptyTitle="No unscheduled jobs"
            emptyDescription="Jobs waiting on their first scheduling step will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Scheduled without crew vendor"
            description="Scheduled jobs that still do not have a crew vendor attached on the canonical job record."
            actionHref={buildJobsHref({ q: query, view: "scheduled" })}
            actionLabel="Open scheduled"
            items={scheduledWithoutCrewVendor.slice(0, 4).map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: `Scheduled ${formatDate(job.scheduledDate)}`,
              trailing: "Crew vendor missing"
            }))}
            emptyTitle="All scheduled jobs have a crew vendor"
            emptyDescription="Scheduled jobs without a crew vendor will surface here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Scheduled without assignments"
            description="Scheduled jobs that do not yet have any crew assignments on the shared job-assignment chain."
            actionHref={buildJobsHref({ q: query, view: "scheduled" })}
            actionLabel="Review staffing"
            items={scheduledWithoutAssignments.slice(0, 4).map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: `Scheduled ${formatDate(job.scheduledDate)}`,
              trailing: "No assignments"
            }))}
            emptyTitle="All scheduled jobs have assignments"
            emptyDescription="Once scheduled jobs are missing assignment rows, they will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="In progress"
            description="Jobs already in execution and still connected to time, logs, punchlists, and downstream billing."
            actionHref={buildJobsHref({ q: query, view: "in_progress" })}
            actionLabel="View active"
            items={inProgressJobs.slice(0, 4).map((job) => ({
              href: `/jobs/${job.id}`,
              title: job.project?.name ?? "Untitled job",
              subtitle: job.customer?.name ?? "Unknown customer",
              meta: job.crewVendor?.name ?? "No crew vendor",
              trailing: formatDate(job.scheduledDate)
            }))}
            emptyTitle="No jobs are currently in progress"
            emptyDescription="Active field work will show here once a job moves into execution."
          />
        </section>

        <section className="overflow-hidden border border-[#dde3eb] bg-white">
          <div className="flex items-end justify-between gap-4 border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f7d92]">
                Recent records
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Latest job updates
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">{recentJobs.length} visible</p>
          </div>

          {recentJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8fafc] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Job</th>
                    <th className="px-5 py-3 sm:px-6">Customer</th>
                    <th className="px-5 py-3 sm:px-6">Status</th>
                    <th className="px-5 py-3 sm:px-6">Scheduled</th>
                    <th className="px-5 py-3 text-right sm:px-6">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentJobs.map((job) => (
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
                        <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatStatusLabel(job.dispatchStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 sm:px-6">
                        {formatDate(job.scheduledDate)}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-500 sm:px-6">
                        {formatDateTime(job.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={jobs.length > 0 ? "No matching jobs" : "No jobs yet"}
                title={
                  jobs.length > 0 ? "Adjust the jobs filters" : "Create the first job"
                }
                description={
                  jobs.length > 0
                    ? "Try a broader search or switch to another real job status."
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
        description="Choose a ready project, create the canonical job, and then finish schedule, crew, and execution detail in the full job workspace."
        open={showComposer}
        openHref={buildJobsHref({
          q: query,
          view,
          compose: "1",
          projectId: resolvedSearchParams.projectId
        })}
        closeHref={buildJobsHref({ q: query, view })}
        openLabel="Open job quick create"
      >
        {readyProjectOptions.length > 0 ? (
          <JobQuickCreateForm
            action={quickCreateJobAction}
            projects={readyProjectOptions}
            initialProjectId={resolvedSearchParams.projectId ?? null}
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
