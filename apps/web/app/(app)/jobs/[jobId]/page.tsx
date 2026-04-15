import Link from "next/link";
import { notFound } from "next/navigation";

import { getEstimateById } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { updateJobAction } from "@/lib/jobs/actions";
import { getJobById } from "@/lib/jobs/data";

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

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getStatusClasses(status: string) {
  switch (status) {
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

function getPrimaryProgressionAction(status: string) {
  switch (status) {
    case "unscheduled":
      return {
        label: "Schedule job",
        nextStatus: "scheduled",
        helper: "Move this work into the scheduled state when it is ready for the calendar."
      };
    case "scheduled":
      return {
        label: "Start work",
        nextStatus: "in_progress",
        helper: "Mark the job as in progress when the crew begins execution."
      };
    case "in_progress":
      return {
        label: "Mark complete",
        nextStatus: "completed",
        helper: "Mark the job complete when field work is finished and ready for billing."
      };
    default:
      return null;
  }
}

function getHeaderPrimaryAction(
  status: string,
  projectId: string,
  jobId: string,
  hasLinkedInvoice: boolean
) {
  const progressionAction = getPrimaryProgressionAction(status);

  if (progressionAction) {
    return {
      type: "progression" as const,
      label: progressionAction.label,
      helper: progressionAction.helper,
      nextStatus: progressionAction.nextStatus
    };
  }

  if (status === "completed" && !hasLinkedInvoice) {
    return {
      type: "link" as const,
      label: "Create invoice",
      helper: "Move completed work into billing using the connected invoice flow.",
      href: `/invoices?projectId=${projectId}&jobId=${jobId}`
    };
  }

  return null;
}

export default async function JobDetailPage({
  params,
  searchParams
}: JobDetailPageProps) {
  const { jobId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const job = await getJobById(jobId, `/jobs/${jobId}`);

  if (!job) {
    notFound();
  }

  const [linkedEstimate, invoices] = await Promise.all([
    job.estimateId ? getEstimateById(job.estimateId, `/jobs/${jobId}`) : Promise.resolve(null),
    listInvoices()
  ]);

  const linkedInvoice = invoices.find((invoice) => invoice.jobId === job.id) ?? null;
  const primaryAction = getHeaderPrimaryAction(
    job.status,
    job.projectId,
    job.id,
    Boolean(linkedInvoice)
  );

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
            {primaryAction?.type === "link" ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
              >
                {primaryAction.label}
              </Link>
            ) : null}
            {primaryAction?.type === "progression" ? (
              <form action={updateJobAction}>
                <input type="hidden" name="jobId" value={job.id} />
                <input type="hidden" name="projectId" value={job.projectId} />
                <input type="hidden" name="estimateId" value={job.estimateId ?? ""} />
                <input type="hidden" name="status" value={primaryAction.nextStatus} />
                <input type="hidden" name="scheduledDate" value={job.scheduledDate ?? ""} />
                <input type="hidden" name="notes" value={job.notes ?? ""} />
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  {primaryAction.label}
                </button>
              </form>
            ) : null}
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

      {primaryAction ? (
        <DetailCard title="Next Action">
          <div className="space-y-2">
            <div>
              <p className="text-base font-medium text-slate-950">
                {primaryAction.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {primaryAction.helper}
              </p>
            </div>
          </div>
        </DetailCard>
      ) : null}

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
                {job.status === "completed" ? (
                  <Link
                    href={`/invoices?projectId=${job.projectId}&jobId=${job.id}`}
                    className="mt-3 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Create invoice
                  </Link>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Complete the job before creating an invoice from this workflow.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </DetailCard>
    </div>
  );
}
