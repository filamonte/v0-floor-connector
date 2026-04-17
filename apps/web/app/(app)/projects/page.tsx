import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
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
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
      <section className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Projects
          </p>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Operational hubs for {organizationContext.organization.displayName}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Projects connect the customer relationship to estimates, contracts, field work, and invoices so the full workflow stays visible in one place.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm leading-6 text-slate-600">
              Ordered by active workflow status first, then most recently updated.
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
        </section>

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
            <div className="hidden grid-cols-[minmax(0,1.5fr)_1fr_160px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Project</span>
              <span>Customer</span>
              <span className="text-right">Status</span>
            </div>
            <div className="md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Projects list
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {projects.length > 0 ? (
              projects.map((project) => (
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
                  eyebrow="No projects yet"
                  title="Create the first project"
                  description="Projects connect the customer record to estimating, contracts, jobs, and invoicing so the workflow can move forward without recreating data."
                />
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white/88 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
          New Project
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add a project for an existing customer in this organization. Estimates, contracts, jobs, and invoices all flow forward from the same project context.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-6 text-slate-600">
          Keep projects short, specific, and customer-linked so estimates, jobs, and invoices all inherit the same operational context.
        </div>
        {customers.length > 0 ? (
          <div className="mt-6">
            <ProjectForm
              action={createProjectAction}
              submitLabel="Create project"
              pendingLabel="Creating project..."
              customers={customers}
              initialCustomerId={resolvedSearchParams.customerId}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Add at least one customer before creating a project.
          </div>
        )}
      </aside>
    </div>
  );
}
