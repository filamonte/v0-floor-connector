import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ProjectQuickCreateForm } from "@/components/project-quick-create-form";
import { WorkspaceComposerSheet } from "@/components/workspace-composer-sheet";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { quickCreateProjectAction } from "@/lib/projects/actions";
import { listProjects } from "@/lib/projects/data";

type ProjectsPageProps = {
  searchParams?: Promise<{
    customerId?: string;
    compose?: string;
    error?: string;
    message?: string;
    q?: string;
    status?: "all" | "lead" | "active" | "completed";
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function buildProjectsHref(input: { q?: string; status?: string; compose?: string }) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  if (input.compose === "1") {
    searchParams.set("compose", "1");
  }

  const query = searchParams.toString();

  return query.length > 0 ? `/projects?${query}` : "/projects";
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
  const leadProjects = projects.filter((project) => project.status === "lead").length;
  const activeProjects = projects.filter((project) =>
    ["quoted", "sold", "in_progress"].includes(project.status)
  ).length;
  const completedProjects = projects.filter((project) => project.status === "completed").length;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";
  const showComposer =
    resolvedSearchParams.compose === "1" ||
    Boolean(resolvedSearchParams.error) ||
    Boolean(resolvedSearchParams.customerId);
  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "lead"
          ? project.status === "lead"
          : statusFilter === "active"
            ? ["quoted", "sold", "in_progress"].includes(project.status)
            : project.status === "completed";
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
  const projectViewOptions = [
    { key: "all", label: "All projects", count: projects.length },
    { key: "lead", label: "Lead-stage", count: leadProjects },
    { key: "active", label: "Active", count: activeProjects },
    { key: "completed", label: "Completed", count: completedProjects }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Projects"
      title={`Operational hubs for ${organizationContext.organization.displayName}`}
      description="Projects connect the customer relationship to estimates, contracts, field work, and invoices so the full workflow stays visible in one place."
      summary={
        <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Lead-stage</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{leadProjects}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Active</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{activeProjects}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Completed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{completedProjects}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Search the operational project queue, switch status views, and quick create a new project only when you are ready to open its full workspace.
          </p>
        ),
        searchSlot: (
          <form action="/projects" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            {showComposer ? <input type="hidden" name="compose" value="1" /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search projects, customers, or locations"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" || showComposer ? (
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
              href={buildProjectsHref({ q: query, status: view.key, compose: showComposer ? "1" : undefined })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
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
            href={buildProjectsHref({ q: query, status: statusFilter, compose: "1" }) + "#project-create"}
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            New project
          </Link>
        )
      }}
    >
    <div className={showComposer ? "grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_400px]" : "space-y-4"}>
      <section className="space-y-6">

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
              <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                <span>Project</span>
                <span>Customer</span>
                <span className="text-right">Status</span>
              </div>
              <div className="md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Projects list
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {filteredProjects.length} visible
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_1fr_160px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {project.name}
                      </h3>
                      {(project.city || project.stateRegion || project.postalCode) ? (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {[project.city, project.stateRegion, project.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          No location added yet
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Customer
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {project.customer?.name ?? "Unlinked customer"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {project.customer?.companyName ?? "No company name"}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                        {formatStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow={projects.length > 0 ? "No matching projects" : "No projects yet"}
                  title={projects.length > 0 ? "Adjust the filters or search" : "Create the first project"}
                  description={
                    projects.length > 0
                      ? "Try a broader search or switch views to find the project workflow you need."
                      : "Projects connect the customer record to estimating, contracts, jobs, and invoicing so the workflow can move forward without recreating data."
                  }
                />
              </div>
            )}
          </div>
        </section>
      </section>
      {showComposer ? (
        <WorkspaceComposerSheet
          id="project-create"
          title="Quick create project"
          description="Capture only the minimum project context here, create the canonical project, and then finish setup in the full project workspace."
          open
          openHref={buildProjectsHref({ q: query, status: statusFilter, compose: "1" }) + "#project-create"}
          closeHref={buildProjectsHref({ q: query, status: statusFilter })}
          openLabel="Open project quick create"
        >
          <ProjectQuickCreateForm
            action={quickCreateProjectAction}
            customers={customers}
            initialCustomerId={resolvedSearchParams.customerId}
          />
        </WorkspaceComposerSheet>
      ) : (
        <WorkspaceComposerSheet
          id="project-create"
          title="Quick create project"
          description="Projects anchor the customer, estimate, contract, execution, and invoice chain in one record."
          open={false}
          openHref={buildProjectsHref({ q: query, status: statusFilter, compose: "1" }) + "#project-create"}
          closeHref={buildProjectsHref({ q: query, status: statusFilter })}
          openLabel="Open project quick create"
        >
          <></>
        </WorkspaceComposerSheet>
      )}
    </div>
    </ContractorWorkspacePage>
  );
}
