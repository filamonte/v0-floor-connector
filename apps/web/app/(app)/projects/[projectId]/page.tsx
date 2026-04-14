import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/project-form";
import { listCustomers } from "@/lib/customers/data";
import { updateProjectAction } from "@/lib/projects/actions";
import { getProjectById } from "@/lib/projects/data";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, customers] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers()
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Project Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {project.name}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Update the project record here. Projects remain linked to a customer
              in the same organization and stay inside the protected app shell.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to projects
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/estimates?projectId=${project.id}`}
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Create estimate for this project
          </Link>
          <Link
            href={`/jobs?projectId=${project.id}`}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Create job from this project
          </Link>
        </div>

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
          <ProjectForm
            action={updateProjectAction}
            submitLabel="Save project"
            pendingLabel="Saving project..."
            customers={customers}
            project={project}
          />
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Project Summary
        </p>
        <dl className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <div>
            <dt className="font-medium text-slate-950">Customer</dt>
            <dd>
              {project.customer ? (
                <Link
                  href={`/customers/${project.customer.id}`}
                  className="font-medium text-brand-700"
                >
                  {project.customer.name}
                </Link>
              ) : (
                "Unknown customer"
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Customer company</dt>
            <dd>{project.customer?.companyName ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Status</dt>
            <dd className="capitalize">{formatStatusLabel(project.status)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Scope notes</dt>
            <dd>{project.description ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Location</dt>
            <dd>
              {[
                project.addressLine1,
                project.addressLine2,
                project.city,
                project.stateRegion,
                project.postalCode,
                project.countryCode
              ]
                .filter(Boolean)
                .join(", ") || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Created</dt>
            <dd>{new Date(project.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Updated</dt>
            <dd>{new Date(project.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
