import Link from "next/link";
import { notFound } from "next/navigation";

import { getEstimateById } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { getJobById } from "@/lib/jobs/data";
import { getMockJobById } from "@/lib/jobs/mock";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatScheduledDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Unscheduled";
}

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getStatusClasses(status: string) {
  switch (status) {
    case "lead":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "scheduled":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "in_progress":
      return "border-violet-200 bg-violet-50 text-violet-900";
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "unscheduled":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "canceled":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

type DetailCardProps = {
  title: string;
  children: React.ReactNode;
};

function DetailCard({ title, children }: DetailCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/92 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
        {title}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const mockJob = getMockJobById(jobId);

  if (mockJob) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
                Job Detail
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                {mockJob.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Mock job workspace for the prototype flow. This page is designed
                to feel like a clean read-first operational view rather than a raw record form.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to jobs
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailCard title="Customer Info">
            <dl className="space-y-3 text-sm leading-6 text-slate-600">
              <div>
                <dt className="font-medium text-slate-950">Customer</dt>
                <dd>{mockJob.customer}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Location</dt>
                <dd>{mockJob.location}</dd>
              </div>
            </dl>
          </DetailCard>

          <DetailCard title="Job Status">
            <div className="space-y-4">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                  mockJob.status
                )}`}
              >
                {formatStatusLabel(mockJob.status)}
              </span>
              <div className="text-sm leading-6 text-slate-600">
                <p>
                  <span className="font-medium text-slate-950">Scheduled date:</span>{" "}
                  {formatScheduledDate(mockJob.date)}
                </p>
                <p className="mt-2">
                  <span className="font-medium text-slate-950">Total:</span>{" "}
                  {formatCurrency(mockJob.total)}
                </p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Notes">
            <p className="text-sm leading-7 text-slate-600">{mockJob.description}</p>
          </DetailCard>

          <DetailCard title="Photos">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
                >
                  Photo placeholder
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        <DetailCard title="Estimate / Invoice Summary">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-950">Estimate</p>
              <p className="mt-2">No linked estimate in this preview state.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-950">Invoice</p>
              <p className="mt-2">No invoice created yet for this preview job.</p>
            </div>
          </div>
        </DetailCard>
      </div>
    );
  }

  const job = await getJobById(jobId, `/jobs/${jobId}`);

  if (!job) {
    notFound();
  }

  const [linkedEstimate, invoices] = await Promise.all([
    job.estimateId ? getEstimateById(job.estimateId, `/jobs/${jobId}`) : Promise.resolve(null),
    listInvoices()
  ]);

  const linkedInvoice = invoices.find((invoice) => invoice.jobId === job.id) ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white/92 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              Job Detail
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {job.project?.name ?? "Job record"}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              A read-first job workspace showing the customer, current status,
              field notes, media placeholders, and connected commercial records.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Back to jobs
            </Link>
            <Link
              href={`/projects/${job.projectId}`}
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              View project
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title="Customer Info">
          <dl className="space-y-3 text-sm leading-6 text-slate-600">
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
              <dt className="font-medium text-slate-950">Customer company</dt>
              <dd>{job.customer?.companyName ?? "Not provided"}</dd>
            </div>
          </dl>
        </DetailCard>

        <DetailCard title="Job Status">
          <div className="space-y-4">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClasses(
                job.status
              )}`}
            >
              {formatStatusLabel(job.status)}
            </span>
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-medium text-slate-950">Scheduled date:</span>{" "}
                {formatScheduledDate(job.scheduledDate)}
              </p>
              <p>
                <span className="font-medium text-slate-950">Created:</span>{" "}
                {new Date(job.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-medium text-slate-950">Updated:</span>{" "}
                {new Date(job.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </DetailCard>

        <DetailCard title="Notes">
          <p className="text-sm leading-7 text-slate-600">
            {job.notes ?? "No job notes have been added yet."}
          </p>
        </DetailCard>

        <DetailCard title="Photos">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500"
              >
                Photo placeholder
              </div>
            ))}
          </div>
        </DetailCard>
      </div>

      <DetailCard title="Estimate / Invoice Summary">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Estimate</p>
            {linkedEstimate ? (
              <>
                <p className="mt-2">
                  <Link
                    href={`/estimates/${linkedEstimate.id}`}
                    className="font-medium text-brand-700"
                  >
                    {linkedEstimate.referenceNumber}
                  </Link>
                </p>
                <p className="capitalize">Status: {formatStatusLabel(linkedEstimate.status)}</p>
                <p>Total: {formatCurrency(linkedEstimate.totalAmount)}</p>
              </>
            ) : (
              <p className="mt-2">No linked estimate for this job.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Invoice</p>
            {linkedInvoice ? (
              <>
                <p className="mt-2">
                  <Link
                    href={`/invoices/${linkedInvoice.id}`}
                    className="font-medium text-brand-700"
                  >
                    {linkedInvoice.referenceNumber}
                  </Link>
                </p>
                <p className="capitalize">Status: {formatStatusLabel(linkedInvoice.status)}</p>
                <p>Balance due: {formatCurrency(linkedInvoice.balanceDueAmount)}</p>
              </>
            ) : (
              <>
                <p className="mt-2">No invoice has been created from this job yet.</p>
                <Link
                  href={`/invoices?projectId=${job.projectId}&jobId=${job.id}`}
                  className="mt-3 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Create invoice
                </Link>
              </>
            )}
          </div>
        </div>
      </DetailCard>
    </div>
  );
}
