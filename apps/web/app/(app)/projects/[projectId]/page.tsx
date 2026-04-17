import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { ProjectForm } from "@/components/project-form";
import { listContracts } from "@/lib/contracts/data";
import { listCustomers } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
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

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, customers, estimates, contracts, jobs, invoices] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  if (!project) {
    notFound();
  }

  const projectEstimates = estimates.filter((estimate) => estimate.projectId === project.id);
  const approvedEstimate = projectEstimates.find((estimate) => estimate.status === "approved");
  const projectContracts = contracts.filter((contract) => contract.projectId === project.id);
  const projectJobs = jobs.filter((job) => job.projectId === project.id);
  const completedJob = projectJobs.find((job) => job.status === "completed");
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === project.id);
  const hasInvoiceForCompletedJob = completedJob
    ? projectInvoices.some((invoice) => invoice.jobId === completedJob.id)
    : false;
  const canCreateJob = Boolean(approvedEstimate);
  const canCreateInvoice = Boolean(completedJob) && !hasInvoiceForCompletedJob;
  const approvedEstimateId = approvedEstimate?.id ?? null;
  const completedJobId = completedJob?.id ?? null;

  const workflowReadiness = hasInvoiceForCompletedJob
    ? "Completed work from this project has already moved into invoicing."
    : completedJob
      ? "A completed job exists, so this project is ready to invoice."
      : approvedEstimate
        ? "An approved estimate exists, so this project is ready to create a job."
        : projectEstimates.length > 0
          ? "Estimate work is in progress. Approve an estimate to move the project forward."
          : "Create the first estimate to move this project into the commercial workflow.";

  function renderStatusBadge(label: string) {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
        {label}
      </span>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Project Review"
            title={project.name}
            description="Projects are the operational hub for connected work. Review the linked commercial, contract, job, and invoice records here before opening deeper standalone detail pages."
            backHref="/projects"
            backLabel="Back to projects"
            actions={
              <>
                <Link
                  href={`/estimates?projectId=${project.id}`}
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Create estimate
                </Link>
                {canCreateJob && approvedEstimateId ? (
                  <Link
                    href={`/jobs?projectId=${project.id}&estimateId=${approvedEstimateId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Create job
                  </Link>
                ) : null}
                {canCreateInvoice && completedJobId ? (
                  <Link
                    href={`/invoices?projectId=${project.id}&jobId=${completedJobId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Create invoice
                  </Link>
                ) : null}
              </>
            }
          />

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

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Estimates</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {projectEstimates.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Contracts</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {projectContracts.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Jobs</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {projectJobs.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">Invoices</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {projectInvoices.length}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 text-sm leading-6 text-slate-700">
            <p className="font-medium text-slate-950">Workflow readiness</p>
            <p className="mt-2">{workflowReadiness}</p>
          </div>
        </div>

        <DetailPanel
          title="Connected Workflow"
          description="Review the most important records connected to this project without leaving the operational hub."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {projectEstimates[0] ? (
              <LinkedRecordCard
                href={`/estimates/${projectEstimates[0].id}`}
                title={projectEstimates[0].referenceNumber}
                subtitle="Latest estimate"
                meta={projectEstimates[0].customer?.name ?? project.customer?.name ?? "Unknown customer"}
                badge={renderStatusBadge(formatStatusLabel(projectEstimates[0].status))}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No estimates are linked to this project yet.
              </div>
            )}

            {projectContracts[0] ? (
              <LinkedRecordCard
                href={`/contracts/${projectContracts[0].id}`}
                title={projectContracts[0].title}
                subtitle="Latest contract"
                meta={projectContracts[0].estimate?.referenceNumber ?? "No source estimate label"}
                badge={renderStatusBadge(formatStatusLabel(projectContracts[0].status))}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No contracts have been generated from this project yet.
              </div>
            )}

            {projectJobs[0] ? (
              <LinkedRecordCard
                href={`/jobs/${projectJobs[0].id}`}
                title={projectJobs[0].project?.name ?? project.name}
                subtitle="Latest job"
                meta={projectJobs[0].estimate?.referenceNumber ?? "Project-driven job"}
                badge={renderStatusBadge(formatStatusLabel(projectJobs[0].status))}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No jobs are linked to this project yet.
              </div>
            )}

            {projectInvoices[0] ? (
              <LinkedRecordCard
                href={`/invoices/${projectInvoices[0].id}`}
                title={projectInvoices[0].referenceNumber}
                subtitle="Latest invoice"
                meta={`Balance due ${formatMoney(projectInvoices[0].balanceDueAmount)}`}
                badge={renderStatusBadge(formatStatusLabel(projectInvoices[0].status))}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No invoices are linked to this project yet.
              </div>
            )}
          </div>
        </DetailPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <DetailPanel
            title="Estimates"
            description="Commercial scope records connected to this project."
          >
            <div className="grid gap-4">
              {projectEstimates.length > 0 ? (
                projectEstimates.map((estimate) => (
                  <LinkedRecordCard
                    key={estimate.id}
                    href={`/estimates/${estimate.id}`}
                    title={estimate.referenceNumber}
                    subtitle={estimate.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                    meta={`Total ${formatMoney(estimate.totalAmount)}`}
                    badge={renderStatusBadge(formatStatusLabel(estimate.status))}
                  />
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No estimates"
                  title="Start the commercial flow"
                  description="Create an estimate from this project so scope, pricing, and downstream workflow records stay connected."
                />
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Contracts"
            description="Contracts generated from approved estimates in the same project chain."
          >
            <div className="grid gap-4">
              {projectContracts.length > 0 ? (
                projectContracts.map((contract) => (
                  <LinkedRecordCard
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    title={contract.title}
                    subtitle={contract.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                    meta={contract.estimate?.referenceNumber ?? "No source estimate"}
                    badge={renderStatusBadge(formatStatusLabel(contract.status))}
                  />
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No contracts"
                  title="Generate a contract after approval"
                  description="Once an estimate is approved, use the contract workflow to keep the signed record tied to the same project."
                />
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Jobs"
            description="Execution records showing how work has moved into production."
          >
            <div className="grid gap-4">
              {projectJobs.length > 0 ? (
                projectJobs.map((job) => (
                  <LinkedRecordCard
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    title={job.project?.name ?? project.name}
                    subtitle={job.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                    meta={job.scheduledDate ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}` : "Unscheduled"}
                    badge={renderStatusBadge(formatStatusLabel(job.status))}
                  />
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No jobs"
                  title="Move approved work into execution"
                  description="Create a job after estimate approval so this project can progress into scheduling and field work."
                />
              )}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Invoices"
            description="Financial records created from connected project and execution context."
          >
            <div className="grid gap-4">
              {projectInvoices.length > 0 ? (
                projectInvoices.map((invoice) => (
                  <LinkedRecordCard
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    title={invoice.referenceNumber}
                    subtitle={invoice.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                    meta={`Balance due ${formatMoney(invoice.balanceDueAmount)}`}
                    badge={renderStatusBadge(formatStatusLabel(invoice.status))}
                  />
                ))
              ) : (
                <AppEmptyState
                  eyebrow="No invoices"
                  title="Invoice completed work"
                  description="Invoices should flow from the same project and job context so billing stays connected to the work that was sold and completed."
                />
              )}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Edit Project"
          description="Keep project editing available here, while the review sections above keep the connected workflow visible."
        >
          <ProjectForm
            action={updateProjectAction}
            submitLabel="Save project"
            pendingLabel="Saving project..."
            customers={customers}
            project={project}
          />
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel title="Project Summary">
          <dl className="space-y-4 text-sm leading-6 text-slate-600">
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
        </DetailPanel>

        <DetailPanel
          title="Next Best Action"
          description="The project view should guide the workflow forward rather than forcing you to decide between disconnected modules."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>{workflowReadiness}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/estimates?projectId=${project.id}`}
                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
              >
                Create estimate
              </Link>
              {approvedEstimateId ? (
                <Link
                  href={`/estimates/${approvedEstimateId}`}
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Review approved estimate
                </Link>
              ) : null}
            </div>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
