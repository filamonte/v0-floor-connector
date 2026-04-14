import Link from "next/link";

import { JobForm } from "@/components/job-form";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { createJobAction } from "@/lib/jobs/actions";
import { listJobs } from "@/lib/jobs/data";
import { listEstimates } from "@/lib/estimates/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";

type JobsPageProps = {
  searchParams?: Promise<{
    projectId?: string;
    estimateId?: string;
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

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/jobs");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Jobs need an active organization before they can be created. Sign out and
        back in if this account was just initialized.
      </section>
    );
  }

  const [jobs, projects, estimates] = await Promise.all([
    listJobs(),
    listProjects(),
    listEstimates()
  ]);

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));

  const approvedEstimateOptions = estimates
    .filter((estimate) => estimate.status === "approved")
    .map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      projectName: estimate.project?.name ?? null,
      status: estimate.status
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Jobs
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Work orders for {organizationContext.organization.displayName}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Jobs bridge sold work into execution. They stay linked to the canonical
          project and customer records, and can optionally reference an approved
          estimate when the work was sold through estimating.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sorted by job status first, then scheduled date where available.
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
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 transition hover:border-brand-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-medium text-slate-950">
                      {job.project?.name ?? "Unknown project"}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {job.customer?.name ?? "Unknown customer"}
                    </p>
                  </div>
                  <div className="text-sm leading-6 text-slate-500 sm:text-right">
                    <p className="capitalize">{formatStatusLabel(job.status)}</p>
                    <p>{formatScheduledDate(job.scheduledDate)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {job.estimate
                    ? `Linked to ${job.estimate.referenceNumber}`
                    : "No linked estimate"}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
              No jobs have been created yet. Start from a project or approved
              estimate to create the first operational work order.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          New Job
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Create a minimal work order from an existing project, optionally linking
          it to an approved estimate. Calendar scheduling, crew assignment, and
          notifications stay out of scope for now.
        </p>
        {projectOptions.length > 0 ? (
          <div className="mt-6">
            <JobForm
              action={createJobAction}
              submitLabel="Create job"
              pendingLabel="Creating job..."
              projects={projectOptions}
              estimates={approvedEstimateOptions}
              initialProjectId={resolvedSearchParams.projectId}
              initialEstimateId={resolvedSearchParams.estimateId}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            Add at least one project before creating a job.
          </div>
        )}
      </aside>
    </div>
  );
}
