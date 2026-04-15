import Link from "next/link";

import { listMockJobs, type MockJobStatus } from "@/lib/jobs/mock";

function formatStatusLabel(status: MockJobStatus) {
  return status.replaceAll("_", " ");
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function getStatusClasses(status: MockJobStatus) {
  switch (status) {
    case "lead":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function JobsPage() {
  const jobs = listMockJobs();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">
              Jobs
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Field work at a glance
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              A clean jobs queue for contractors to track sold work moving into
              production. This preview uses mock data so we can shape the list
              experience before connecting live records.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Preview dataset</p>
            <p className="mt-1">4 mock jobs · Click any row to open detail</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/92 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
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
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group block px-6 py-5 transition hover:bg-slate-50/80 sm:px-8"
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_1fr_160px_140px_140px] md:items-center">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                    {job.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {job.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Customer
                  </p>
                  <p className="text-sm font-medium text-slate-700">{job.customer}</p>
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
                  <p className="text-sm text-slate-700">{formatDate(job.date)}</p>
                </div>

                <div className="md:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                    Total
                  </p>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatCurrency(job.total)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
