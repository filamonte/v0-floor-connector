import Link from "next/link";
import { notFound } from "next/navigation";

import { JobForm } from "@/components/job-form";
import { updateJobAction } from "@/lib/jobs/actions";
import { getJobById } from "@/lib/jobs/data";
import { listEstimates } from "@/lib/estimates/data";
import { listProjects } from "@/lib/projects/data";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
  searchParams?: Promise<{
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

export default async function JobDetailPage({
  params,
  searchParams
}: JobDetailPageProps) {
  const { jobId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [job, projects, estimates] = await Promise.all([
    getJobById(jobId, `/jobs/${jobId}`),
    listProjects(),
    listEstimates()
  ]);

  if (!job) {
    notFound();
  }

  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null
  }));

  const approvedEstimateOptions = estimates
    .filter((estimate) => estimate.status === "approved" || estimate.id === job.estimateId)
    .map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      projectName: estimate.project?.name ?? null,
      status: estimate.status
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Job Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {job.project?.name ?? "Job record"}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Update the work order here. Jobs stay scoped to the active organization
              and remain connected to the same customer, project, and optional
              approved estimate foundation.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Back to jobs
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
          <JobForm
            action={updateJobAction}
            submitLabel="Save job"
            pendingLabel="Saving job..."
            projects={projectOptions}
            estimates={approvedEstimateOptions}
            job={job}
          />
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
          Job Summary
        </p>
        <dl className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
          <div>
            <dt className="font-medium text-slate-950">Customer</dt>
            <dd>
              {job.customer ? (
                <Link
                  href={`/customers/${job.customer.id}`}
                  className="font-medium text-brand-700"
                >
                  {job.customer.name}
                </Link>
              ) : (
                "Unknown customer"
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Project</dt>
            <dd>
              {job.project ? (
                <Link
                  href={`/projects/${job.project.id}`}
                  className="font-medium text-brand-700"
                >
                  {job.project.name}
                </Link>
              ) : (
                "Unknown project"
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Linked estimate</dt>
            <dd>
              {job.estimate ? (
                <Link
                  href={`/estimates/${job.estimate.id}`}
                  className="font-medium text-brand-700"
                >
                  {job.estimate.referenceNumber}
                </Link>
              ) : (
                "No linked estimate"
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Status</dt>
            <dd className="capitalize">{formatStatusLabel(job.status)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Scheduled date</dt>
            <dd>{formatScheduledDate(job.scheduledDate)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Notes</dt>
            <dd>{job.notes ?? "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Created</dt>
            <dd>{new Date(job.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-950">Updated</dt>
            <dd>{new Date(job.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
