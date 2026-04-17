import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { listEstimates } from "@/lib/estimates/data";
import { listJobs } from "@/lib/jobs/data";

type JobsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Unscheduled";
}

function getStatusClasses(status: string) {
  switch (status) {
    case "unscheduled":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "canceled":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [jobs, estimates] = await Promise.all([listJobs(), listEstimates()]);
  const estimateTotals = new Map(estimates.map((estimate) => [estimate.id, estimate.totalAmount]));
  const unscheduledCount = jobs.filter((job) => job.status === "unscheduled").length;
  const scheduledCount = jobs.filter((job) => job.status === "scheduled").length;
  const inProgressCount = jobs.filter((job) => job.status === "in_progress").length;
  const completedCount = jobs.filter((job) => job.status === "completed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
              Jobs
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Field work with clear operational status
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Track live tenant-scoped jobs as approved scope turns into scheduled work, in-progress execution, and invoice-ready completion.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {jobs.length} total jobs
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
            >
              Open project hub
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-medium text-amber-950">Unscheduled</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">{unscheduledCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 px-5 py-4">
            <p className="text-sm font-medium text-sky-950">Scheduled</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-sky-950">{scheduledCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-violet-200 bg-violet-50 px-5 py-4">
            <p className="text-sm font-medium text-violet-950">In progress</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-violet-950">{inProgressCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-medium text-emerald-950">Completed</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">{completedCount}</p>
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
          <div className="mb-5 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Live data only
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Tenant scoped
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Click row for workflow detail
            </span>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_140px_140px] gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid">
            <span>Job</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Date</span>
            <span className="text-right">Total</span>
          </div>
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Jobs list
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const estimateTotal = job.estimateId ? estimateTotals.get(job.estimateId) ?? null : null;

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group block px-6 py-5 transition hover:bg-slate-50/80 sm:px-8"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_140px_140px] md:items-center">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {job.project?.name ?? "Untitled job"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {job.estimate?.referenceNumber ?? "Project-driven job"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Customer
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {job.customer?.name ?? "Unknown customer"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                          job.status
                        )}`}
                      >
                        {formatStatusLabel(job.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Date
                      </p>
                      <p className="text-sm text-slate-700">{formatDate(job.scheduledDate)}</p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-slate-950">
                        {estimateTotal ? formatCurrency(estimateTotal) : "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow="No jobs yet"
                title="Create the first job"
                description="Jobs move approved work into execution. Once a project or estimate is ready for production, create a job and track it through completion."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
