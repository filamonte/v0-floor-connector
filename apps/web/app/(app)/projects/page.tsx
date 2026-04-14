import Link from "next/link";

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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Projects
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Project records for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Projects are linked to customers and scoped to the active organization.
          This is the second real business object in the protected app area.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Ordered by active workflow status first, then most recently updated.
        </p>

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

        <div className="mt-8 grid gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {project.customer?.name ?? "Unlinked customer"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p className="capitalize">{formatStatusLabel(project.status)}</p>
                    <p>{project.customer?.companyName ?? "No company name"}</p>
                  </div>
                </div>
                {(project.city || project.stateRegion || project.postalCode) ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {[project.city, project.stateRegion, project.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No projects have been added yet. Create the first one using the
              form in the right column and connect it to an existing customer.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Project
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add a project for an existing customer in this organization. Scheduling
          and estimating stay out of scope for now.
        </p>
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
