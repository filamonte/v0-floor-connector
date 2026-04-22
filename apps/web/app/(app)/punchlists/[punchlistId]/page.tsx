import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { PunchlistForm } from "@/components/punchlist-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { getJobById, listJobAssignments, listJobs } from "@/lib/jobs/data";
import { listPeople } from "@/lib/people/data";
import { updatePunchlistItemAction } from "@/lib/punchlists/actions";
import { getPunchlistItemById } from "@/lib/punchlists/data";
import { getProjectById, listProjects } from "@/lib/projects/data";

type PunchlistDetailPageProps = {
  params: Promise<{
    punchlistId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "No due date";
}

function getStatusClasses(status: string) {
  switch (status) {
    case "open":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "in_progress":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-700";
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

function getNextActionSummary(status: string, hasAssignee: boolean) {
  if (status === "open" && !hasAssignee) {
    return {
      title: "Assign responsibility",
      description:
        "This closeout item is still open with no clear owner. The next useful step is assigning an active person on the same project/job chain."
    };
  }

  if (status === "open") {
    return {
      title: "Move work into progress",
      description:
        "Responsibility is in place. The next useful step is moving this corrective work into active follow-through on the same project or job."
    };
  }

  if (status === "in_progress") {
    return {
      title: "Resolve the work item",
      description:
        "Corrective work is underway. Move the item into resolved once field follow-through is complete and the closeout state is ready for review."
    };
  }

  if (status === "resolved") {
    return {
      title: "Close after verification",
      description:
        "The field work appears complete. Close the item once final review confirms the project or job no longer needs follow-up."
    };
  }

  return {
    title: "Record is current",
    description:
      "This punchlist item is already closed. Keep it connected to the project and job chain as closeout history instead of reopening duplicate records elsewhere."
  };
}

export default async function PunchlistDetailPage({
  params,
  searchParams
}: PunchlistDetailPageProps) {
  const { punchlistId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const punchlistItem = await getPunchlistItemById(punchlistId, `/punchlists/${punchlistId}`);

  if (!punchlistItem) {
    notFound();
  }

  const [projects, jobs, people, project, job, projectDailyLogs, jobAssignments] =
    await Promise.all([
      listProjects(),
      listJobs(),
      listPeople(),
      getProjectById(punchlistItem.projectId, `/punchlists/${punchlistId}`),
      punchlistItem.jobId
        ? getJobById(punchlistItem.jobId, `/punchlists/${punchlistId}`)
        : Promise.resolve(null),
      listDailyLogsByProject(punchlistItem.projectId, `/punchlists/${punchlistId}`),
      punchlistItem.jobId
        ? listJobAssignments(punchlistItem.jobId, `/punchlists/${punchlistId}`)
        : Promise.resolve([])
    ]);

  const recentProjectDailyLogs = projectDailyLogs
    .filter((dailyLog) =>
      punchlistItem.jobId ? dailyLog.jobId === punchlistItem.jobId : true
    )
    .slice(0, 3);
  const nextAction = getNextActionSummary(
    punchlistItem.status,
    Boolean(punchlistItem.assignee)
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Punchlist Workspace"
            title={punchlistItem.title}
            description="Use this page as the real closeout workspace for one canonical punchlist item, with responsibility, status, and linked project/job continuity kept on the same execution chain."
            backHref="/punchlists"
            backLabel="Back to punchlists"
            actions={
              <>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/projects/${punchlistItem.projectId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open project
                  </Link>
                  {punchlistItem.jobId ? (
                    <Link
                      href={`/jobs/${punchlistItem.jobId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Open job
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                      punchlistItem.status
                    )}`}
                  >
                    {formatStatusLabel(punchlistItem.status)}
                  </span>
                  {renderStatusBadge(
                    punchlistItem.jobId ? "Job-linked closeout" : "Project-level closeout"
                  )}
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
                  key: "status",
                  label: "Closeout state",
                  content: (
                    <>
                      <p className="text-sm font-semibold capitalize text-slate-950">
                        {formatStatusLabel(punchlistItem.status)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {punchlistItem.status === "open"
                          ? "The item is still waiting on corrective action or assignment."
                          : punchlistItem.status === "in_progress"
                            ? "Corrective work is actively underway."
                            : punchlistItem.status === "resolved"
                              ? "Work appears complete but still needs final closeout confirmation."
                              : "The closeout item is fully closed on the shared execution chain."}
                      </p>
                    </>
                  )
                },
                {
                  key: "due-date",
                  label: "Due date",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatDate(punchlistItem.dueDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Use due dates for closeout follow-through only; the actual work still lives on the project and optional job context.
                      </p>
                    </>
                  )
                },
                {
                  key: "assignee",
                  label: "Responsibility",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {punchlistItem.assignee?.displayName ?? "Unassigned"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {punchlistItem.assignee
                          ? "Assigned to an active person on the shared workforce model."
                          : "No responsible person has been attached yet."}
                      </p>
                    </>
                  )
                },
                {
                  key: "next-action",
                  label: "Next best action",
                  content: (
                    <NextActionCard
                      title={nextAction.title}
                      description={nextAction.description}
                      className="space-y-3 text-sm leading-6 text-slate-600"
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <DetailPanel
            title="Punchlist Details"
            description="Edit the canonical closeout item directly here. Project and optional job linkage stay on the same execution chain instead of branching into a separate punchlist subsystem."
          >
            <PunchlistForm
              action={updatePunchlistItemAction}
              punchlistItem={{
                id: punchlistItem.id,
                projectId: punchlistItem.projectId,
                jobId: punchlistItem.jobId,
                assigneePersonId: punchlistItem.assigneePersonId,
                title: punchlistItem.title,
                details: punchlistItem.details,
                dueDate: punchlistItem.dueDate,
                status: punchlistItem.status
              }}
              projects={projects.map((projectOption) => ({
                id: projectOption.id,
                name: projectOption.name
              }))}
              jobs={jobs.map((jobOption) => ({
                id: jobOption.id,
                projectId: jobOption.projectId,
                label: jobOption.project?.name ?? "Job",
                dispatchStatus: jobOption.dispatchStatus
              }))}
              assignees={people.map((person) => ({
                id: person.id,
                displayName: person.displayName,
                isActive: person.isActive
              }))}
              redirectTo={`/punchlists/${punchlistItem.id}`}
            />
          </DetailPanel>

          <DetailPanel
            title="Linked Workflow Context"
            description="Punchlist items should point back into the real project and job workspaces so closeout work stays part of the same execution system."
          >
            <div className="grid gap-4">
              {project ? (
                <LinkedRecordCard
                  href={`/projects/${project.id}`}
                  title={project.name}
                  subtitle="Project"
                  meta={project.customer?.name ?? "Unknown customer"}
                  badge={renderStatusBadge("Project hub")}
                />
              ) : null}
              {job ? (
                <LinkedRecordCard
                  href={`/jobs/${job.id}`}
                  title={job.project?.name ?? project?.name ?? "Job"}
                  subtitle="Job"
                  meta={`${formatStatusLabel(job.dispatchStatus)} | ${job.scheduledDate ? `Scheduled ${formatDate(job.scheduledDate)}` : "No schedule set"}`}
                  badge={renderStatusBadge("Execution record")}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  This punchlist item is attached to the broader project only, not to one specific job.
                </div>
              )}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Recent Execution Context"
          description="Daily logs and current crew visibility provide supporting execution context, but they stay secondary to the project and job chain behind this closeout item."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-950">Recent daily logs</p>
              {recentProjectDailyLogs.length > 0 ? (
                recentProjectDailyLogs.map((dailyLog) => (
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
                  title="No linked daily execution records yet"
                  description="Daily logs remain project-day narrative records. Use them for day history, while this punchlist item carries durable closeout work."
                  actionHref={`/daily-logs?projectId=${punchlistItem.projectId}${punchlistItem.jobId ? `&jobId=${punchlistItem.jobId}` : ""}`}
                  actionLabel="Create daily log"
                />
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-950">Current crew context</p>
              {jobAssignments.length > 0 ? (
                jobAssignments.slice(0, 4).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    <p className="font-medium text-slate-950">
                      {assignment.person?.displayName ??
                        assignment.vendor?.name ??
                        "Unknown assignment"}
                    </p>
                    <p className="mt-1 capitalize">{formatStatusLabel(assignment.role)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  {job
                    ? "No crew assignments are attached to the linked job yet."
                    : "This item is project-level, so there is no single job crew context attached."}
                </div>
              )}
            </div>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Punchlist Context"
          description="Compact closeout facts stay in the rail so the main column can stay focused on responsibility, detail, and continuity."
        >
          <ContextFactsList
            items={[
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(punchlistItem.status)}</span>
              },
              {
                label: "Due date",
                value: formatDate(punchlistItem.dueDate)
              },
              {
                label: "Assignee",
                value: punchlistItem.assignee?.displayName ?? "Unassigned"
              },
              {
                label: "Project",
                value: project ? (
                  <Link href={`/projects/${project.id}`} className="font-medium text-brand-700">
                    {project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value: project?.customer ? (
                  <Link
                    href={`/customers/${project.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {project.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )
              },
              {
                label: "Job linkage",
                value: job ? (
                  <Link href={`/jobs/${job.id}`} className="font-medium text-brand-700">
                    {job.project?.name ?? `Job ${job.id.slice(0, 8)}`}
                  </Link>
                ) : (
                  "Project-level only"
                )
              },
              {
                label: "Created",
                value: new Date(punchlistItem.createdAt).toLocaleString()
              },
              {
                label: "Updated",
                value: new Date(punchlistItem.updatedAt).toLocaleString()
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Workflow Guidance"
          description="Punchlists are durable closeout items, not a duplicate daily-note stream and not a separate dispatch system."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>
              Use punchlists for corrective work and closeout follow-through that needs to survive beyond a single project day.
            </p>
            <p>
              Keep day narrative, weather, and field observations in daily logs and field notes. Keep durable corrective items here on the same project and optional job chain.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
