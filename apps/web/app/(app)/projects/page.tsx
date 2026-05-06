import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { ProjectQuickCreateForm } from "@/components/project-quick-create-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { quickCreateProjectAction } from "@/lib/projects/actions";
import type { ProjectListItem } from "@/lib/projects/data";
import { listProjects } from "@/lib/projects/data";
import { getStatusBadgeClassName } from "@floorconnector/ui";

type ProjectView =
  | "all"
  | "lead"
  | "estimating"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "completed";

type ProjectsPageProps = {
  searchParams?: Promise<{
    customerId?: string;
    compose?: string;
    error?: string;
    message?: string;
    projectName?: string;
    q?: string;
    status?: ProjectView;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString();
}

function buildProjectsHref(input: {
  q?: string;
  status?: ProjectView;
  compose?: string;
  customerId?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.customerId) {
    searchParams.set("customerId", input.customerId);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();

  return query.length > 0 ? `/projects?${query}` : "/projects";
}

function getProjectContinuityCue(project: ProjectListItem) {
  if (project.readyToScheduleAt) {
    return "Ready to schedule";
  }

  if (project.commercialReadinessStatus !== "not_ready") {
    return formatStatusLabel(project.commercialReadinessStatus);
  }

  switch (project.status) {
    case "lead":
      return "Start estimate path";
    case "estimating":
      return "Finish estimate";
    case "approved":
      return "Review contract handoff";
    case "scheduled":
      return "Track scheduled work";
    case "in_progress":
      return "Monitor execution";
    case "completed":
      return "Closeout review";
    default:
      return "Open project workspace";
  }
}

export default async function ProjectsPage({
  searchParams
}: ProjectsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/projects");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Project records need an active organization before they can be created.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const [projects, customers] = await Promise.all([listProjects(), listCustomers()]);
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.customerId);

  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "all" ? true : project.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            project.name,
            project.customer?.name ?? "",
            project.customer?.companyName ?? "",
            project.city ?? "",
            project.stateRegion ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const leadProjects = projects.filter((project) => project.status === "lead");
  const estimatingProjects = projects.filter(
    (project) => project.status === "estimating"
  );
  const approvedProjects = projects.filter((project) => project.status === "approved");
  const scheduledProjects = projects.filter((project) => project.status === "scheduled");
  const inProgressProjects = projects.filter(
    (project) => project.status === "in_progress"
  );
  const readyToScheduleProjects = projects.filter(
    (project) => project.readyToScheduleAt !== null
  );
  const recentProjects = [...filteredProjects]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 20);

  const projectViewOptions = [
    { key: "all", label: "All projects", count: projects.length },
    { key: "lead", label: "Lead", count: leadProjects.length },
    { key: "estimating", label: "Estimating", count: estimatingProjects.length },
    { key: "approved", label: "Approved", count: approvedProjects.length },
    { key: "scheduled", label: "Scheduled", count: scheduledProjects.length },
    {
      key: "in_progress",
      label: "In progress",
      count: inProgressProjects.length
    },
    {
      key: "completed",
      label: "Completed",
      count: projects.filter((project) => project.status === "completed").length
    }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Projects"
      title={`Operational hubs for ${organizationContext.organization.displayName}`}
      description="Projects are the operational root connecting customer context to estimating, contracts, execution, billing, and closeout."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">Lead</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {leadProjects.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Estimating
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {estimatingProjects.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Scheduled
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {scheduledProjects.length}
            </p>
          </div>
          <div className="rounded-md border border-[#e2e5e9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              In progress
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {inProgressProjects.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search the operational project manager, switch between real project
            statuses, and quick create only when you are ready to open the full
            project workspace.
          </p>
        ),
        searchSlot: (
          <form action="/projects" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            {resolvedSearchParams.customerId ? (
              <input
                type="hidden"
                name="customerId"
                value={resolvedSearchParams.customerId}
              />
            ) : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search projects, customers, or locations"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 ||
            statusFilter !== "all" ||
            showComposer ||
            resolvedSearchParams.customerId ? (
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: projectViewOptions.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildProjectsHref({
                q: query,
                status: view.key,
                compose: showComposer ? "1" : undefined,
                customerId: resolvedSearchParams.customerId
              })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href={buildProjectsHref({
              q: query,
              status: statusFilter,
              compose: "1",
              customerId: resolvedSearchParams.customerId
            })}
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            New project
          </Link>
        )
      }}
    >
      <div className="flex flex-col gap-3">
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

        <section className="order-2 grid gap-3 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Lead"
            description="Projects that exist canonically but are still sitting in the earliest commercial stage."
            actionHref={buildProjectsHref({ q: query, status: "lead" })}
            actionLabel="View lead"
            items={leadProjects.slice(0, 4).map((project) => ({
              href: `/projects/${project.id}`,
              title: project.name,
              subtitle: project.customer?.name ?? "Unlinked customer",
              meta: getProjectContinuityCue(project),
              badge: project.status,
              trailing: formatDateLabel(project.updatedAt)
            }))}
            emptyTitle="No lead-stage projects"
            emptyDescription="Lead-stage projects will appear here when they are first created."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Estimating"
            description="Projects currently tied to estimate follow-through."
            actionHref={buildProjectsHref({ q: query, status: "estimating" })}
            actionLabel="View estimating"
            items={estimatingProjects.slice(0, 4).map((project) => ({
              href: `/projects/${project.id}`,
              title: project.name,
              subtitle: project.customer?.name ?? "Unlinked customer",
              meta: getProjectContinuityCue(project),
              badge: project.status,
              trailing: formatDateLabel(project.updatedAt)
            }))}
            emptyTitle="No estimating projects"
            emptyDescription="Estimating projects will show here when a project is actively in estimate follow-through."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Approved"
            description="Projects that have moved into approved status and are nearing execution handoff."
            actionHref={buildProjectsHref({ q: query, status: "approved" })}
            actionLabel="Review approved"
            items={approvedProjects.slice(0, 4).map((project) => ({
              href: `/projects/${project.id}`,
              title: project.name,
              subtitle: project.customer?.name ?? "Unlinked customer",
              meta: getProjectContinuityCue(project),
              badge: project.financingStatus,
              trailing: formatDateLabel(project.updatedAt)
            }))}
            emptyTitle="No approved projects"
            emptyDescription="Approved projects will appear here when the shared workflow reaches that status."
          />
          <ManagerDashboardCard
            eyebrow="Workflow queue"
            title="Ready to schedule"
            description="Projects carrying a canonical ready-to-schedule timestamp."
            actionHref={buildProjectsHref({ q: query })}
            actionLabel="Open projects"
            items={readyToScheduleProjects.slice(0, 4).map((project) => ({
              href: `/projects/${project.id}`,
              title: project.name,
              subtitle: project.customer?.name ?? "Unlinked customer",
              meta: `Ready: ${formatDateLabel(project.readyToScheduleAt ?? project.updatedAt)}`,
              badge: "ready",
              trailing: formatStatusLabel(project.status)
            }))}
            emptyTitle="Nothing ready to schedule"
            emptyDescription="Projects will appear here once they have a ready-to-schedule timestamp."
          />
        </section>

        <section className="order-1 overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-[#e5e5e5] px-4 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Recent records
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-slate-950">
                Latest project updates
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {recentProjects.length} visible
            </p>
          </div>

          {recentProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-4 py-2.5">Customer</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Continuity</th>
                    <th className="px-4 py-2.5 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-slate-950 transition hover:text-brand-700"
                        >
                          {project.name}
                        </Link>
                        <p className="mt-0.5 text-sm leading-5 text-slate-500">
                          {[project.city, project.stateRegion, project.postalCode]
                            .filter(Boolean)
                            .join(", ") || "No location saved"}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-700">
                          {project.customer?.name ?? "Unlinked customer"}
                        </p>
                        <p className="mt-0.5 text-sm leading-5 text-slate-500">
                          {project.customer?.companyName ?? "No company name"}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={[
                            "inline-flex rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                            getStatusBadgeClassName(project.status)
                          ].join(" ")}
                        >
                          {formatStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-medium text-slate-700">
                          {getProjectContinuityCue(project)}
                        </p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-slate-400">
                          {formatStatusLabel(project.commercialReadinessStatus)}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">
                        {formatDateLabel(project.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={projects.length > 0 ? "No matching projects" : "No projects yet"}
                title={
                  projects.length > 0
                    ? "Adjust the filters or search"
                    : "Create your first project"
                }
                description={
                  projects.length > 0
                    ? "Try a broader search or switch to another real project status."
                    : "Create your first project. Everything starts from the project."
                }
                actionHref={buildProjectsHref({
                  q: query,
                  status: statusFilter,
                  compose: "1",
                  customerId: resolvedSearchParams.customerId
                })}
                actionLabel="Create your first project"
              />
            </div>
          )}
        </section>
      </div>

      <WorkspaceComposerSheet
        id="project-create"
        title="Quick create project"
        description="Capture only the minimum project context here, create the canonical project, and then finish setup in the full project workspace."
        open={showComposer}
        openHref={buildProjectsHref({
          q: query,
          status: statusFilter,
          compose: "1",
          customerId: resolvedSearchParams.customerId
        })}
        closeHref={buildProjectsHref({
          q: query,
          status: statusFilter,
          customerId: resolvedSearchParams.customerId
        })}
        openLabel="Open project quick create"
      >
        <ProjectQuickCreateForm
          action={quickCreateProjectAction}
          customers={customers}
          initialCustomerId={resolvedSearchParams.customerId}
          initialProjectName={resolvedSearchParams.projectName}
        />
      </WorkspaceComposerSheet>
    </ContractorWorkspacePage>
  );
}
