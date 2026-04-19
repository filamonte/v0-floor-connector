import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ProjectForm } from "@/components/project-form";
import { listCustomers } from "@/lib/customers/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { createProjectAction } from "@/lib/projects/actions";
import { listProjects } from "@/lib/projects/data";

type ProjectsPageProps = {
  searchParams?: Promise<{
    customerId?: string;
    error?: string;
    message?: string;
    q?: string;
    status?: "all" | "lead" | "active" | "completed";
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function buildProjectsHref(input: { q?: string; status?: string }) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
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
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Lead-stage</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{leadProjects}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Active</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{activeProjects}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
            <p className="text-sm font-medium text-slate-950">Completed</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{completedProjects}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Ordered by active workflow status first, then most recently updated. Search and filter here, then open the project record that needs attention.
          </p>
        ),
        searchSlot: (
          <form action="/projects" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search projects, customers, or locations"
              className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" ? (
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
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
              href={buildProjectsHref({ q: query, status: view.key })}
              className={[
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-white text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href="#project-create"
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            New project
          </Link>
        )
      }}
    >
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
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

        <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid md:flex-1">
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
                  className="group block px-6 py-5 transition hover:bg-slate-50/70 sm:px-8"
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
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
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

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div id="project-create" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Project
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add a project for an existing customer in this organization, or create a new canonical customer inline when the work starts here. Estimates, contracts, jobs, and invoices all flow forward from the same project context.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-6 text-slate-600">
          Keep projects short, specific, and customer-linked so estimates, jobs, and invoices all inherit the same operational context.
        </div>
        <div className="mt-6">
          <ProjectForm
            action={createProjectAction}
            submitLabel="Create project"
            pendingLabel="Creating project..."
            customers={customers}
            initialCustomerId={resolvedSearchParams.customerId}
            allowInlineCustomerCreate
          />
        </div>
      </aside>
    </div>
    </ContractorWorkspacePage>
  );
}
