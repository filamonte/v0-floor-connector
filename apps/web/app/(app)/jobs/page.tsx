import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { listEstimates } from "@/lib/estimates/data";
import { listJobs } from "@/lib/jobs/data";

type JobsPageProps = {
  searchParams?: Promise<{
    q?: string;
    view?: "all" | "unscheduled" | "scheduled" | "in_progress" | "completed";
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

function buildJobsHref(input: {
  q?: string;
  view?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/jobs?${query}` : "/jobs";
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [jobs, estimates] = await Promise.all([listJobs(), listEstimates()]);
  const estimateTotals = new Map(estimates.map((estimate) => [estimate.id, estimate.totalAmount]));
  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const view = resolvedSearchParams.view ?? "all";
  const unscheduledCount = jobs.filter((job) => job.status === "unscheduled").length;
  const scheduledCount = jobs.filter((job) => job.status === "scheduled").length;
  const inProgressCount = jobs.filter((job) => job.status === "in_progress").length;
  const completedCount = jobs.filter((job) => job.status === "completed").length;
  const filteredJobs = jobs.filter((job) => {
    const matchesView = view === "all" ? true : job.status === view;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            job.project?.name ?? "",
            job.customer?.name ?? "",
            job.estimate?.referenceNumber ?? "",
            job.status
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesView && matchesQuery;
  });
  const jobViews = [
    { key: "all", label: "All jobs", count: jobs.length },
    { key: "unscheduled", label: "Unscheduled", count: unscheduledCount },
    { key: "scheduled", label: "Scheduled", count: scheduledCount },
    { key: "in_progress", label: "In progress", count: inProgressCount },
    { key: "completed", label: "Completed", count: completedCount }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Jobs"
      title="Field work with clear operational status"
      description="Track live tenant-scoped jobs as approved scope turns into scheduled work, in-progress execution, and invoice-ready completion."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#f2d2b3] bg-[#fff7ef] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#9a6a2c]">Unscheduled</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#7a4d12]">
              {unscheduledCount}
            </p>
          </div>
          <div className="border border-[#cfe4f6] bg-[#f3f9ff] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#557ca0]">Scheduled</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1d4f7a]">
              {scheduledCount}
            </p>
          </div>
          <div className="border border-[#ddd3f8] bg-[#f7f4ff] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7764a8]">In progress</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#5a3ea0]">
              {inProgressCount}
            </p>
          </div>
          <div className="border border-[#cfe9d5] bg-[#f2fbf4] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#5a8a66]">Completed</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#23613a]">
              {completedCount}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Review the live execution queue, switch between job states, and jump back to the project hub when broader readiness or setup work matters.
          </p>
        ),
        searchSlot: (
          <form action="/jobs" className="flex flex-col gap-2 sm:flex-row">
            {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search project, customer, estimate, or status"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || view !== "all" ? (
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: jobViews.map((jobView) => {
          const isActive = view === jobView.key;

          return (
            <Link
              key={jobView.key}
              href={buildJobsHref({ q: query, view: jobView.key })}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{jobView.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {jobView.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href="/projects"
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            Open project hub
          </Link>
        )
      }}
    >
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
            <div className="hidden grid-cols-[minmax(0,1.35fr)_1fr_160px_140px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
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
            <p className="text-sm leading-6 text-slate-500">{filteredJobs.length} visible</p>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const estimateTotal = job.estimateId ? estimateTotals.get(job.estimateId) ?? null : null;

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group block px-5 py-4 transition hover:bg-slate-50/80 sm:px-6"
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
                        className={`inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
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
                        {estimateTotal ? formatCurrency(estimateTotal) : "-"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={jobs.length > 0 ? "No matching jobs" : "No jobs yet"}
                title={jobs.length > 0 ? "Adjust the jobs filters" : "Create the first job"}
                description={
                  jobs.length > 0
                    ? "Try a broader search or switch views to find the execution record you need."
                    : "Jobs move approved work into execution. Once a project or estimate is ready for production, create a job and track it through completion."
                }
              />
            </div>
          )}
        </div>
      </section>
    </ContractorWorkspacePage>
  );
}
