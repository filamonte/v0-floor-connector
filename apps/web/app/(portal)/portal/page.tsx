import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listPortalAccessibleProjects } from "@/lib/portal/data";

function formatStatusLabel(status: string | null) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getPortalHomeNextAction(
  projects: Awaited<ReturnType<typeof listPortalAccessibleProjects>>
) {
  const invoiceProject = projects.find(
    (project) =>
      project.latestInvoiceStatus &&
      !["paid", "void"].includes(project.latestInvoiceStatus)
  );

  if (invoiceProject) {
    return {
      title: `Review billing for ${invoiceProject.name}`,
      description:
        "This project has an active invoice in view, so it is the clearest next record to review from the portal.",
      href: `/portal/projects/${invoiceProject.id}`,
      label: "Open project billing"
    };
  }

  const contractProject = projects.find(
    (project) =>
      project.latestContractStatus &&
      !["signed", "void"].includes(project.latestContractStatus)
  );

  if (contractProject) {
    return {
      title: `Review contract status for ${contractProject.name}`,
      description:
        "A contract is in motion for this project, so that project workspace is the best place to review the latest shared document state.",
      href: `/portal/projects/${contractProject.id}`,
      label: "Open contract context"
    };
  }

  const estimateProject = projects.find((project) => project.latestEstimateStatus);

  if (estimateProject) {
    return {
      title: `Review proposal details for ${estimateProject.name}`,
      description:
        "Estimate and proposal information is already shared for this project, making it the best starting point for review.",
      href: `/portal/projects/${estimateProject.id}`,
      label: "Open project proposal"
    };
  }

  return null;
}

export default async function PortalHomePage() {
  const projects = await listPortalAccessibleProjects("/portal");
  const nextAction = getPortalHomeNextAction(projects);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
            Customer Workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Review the work your contractor has shared
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            This portal is project-centered. Start with the project you want to review, then use
            that workspace to see the estimate, contract, and invoice context connected to it.
          </p>

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "purpose",
                  label: "What this portal is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Review customer-facing project documents and billing updates without wading
                      through contractor-only workflow detail.
                    </p>
                  )
                },
                {
                  key: "projects",
                  label: "Accessible projects",
                  content: (
                    <>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {projects.length}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Shared by your contractor through customer- and project-scoped access.
                      </p>
                    </>
                  )
                },
                {
                  key: "shared-records",
                  label: "Shared record visibility",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p>Estimates, contracts, and invoices appear inside the project workspace.</p>
                      <p>Only explicitly granted projects are visible here.</p>
                    </div>
                  )
                },
                {
                  key: "next-action",
                  label: "Next record to review",
                  content: nextAction ? (
                    <NextActionCard
                      title={nextAction.title}
                      description={nextAction.description}
                      primaryAction={
                        <Link
                          href={nextAction.href}
                          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                        >
                          {nextAction.label}
                        </Link>
                      }
                    />
                  ) : (
                    <p className="text-sm leading-6 text-slate-600">
                      No commercial records are shared yet. When your contractor publishes them to
                      this portal, they will appear under the relevant project.
                    </p>
                  )
                }
              ]}
            />
          </div>
        </div>

        <DetailPanel
          title="Projects"
          description="Each project acts as the customer-facing anchor for the records your contractor has shared."
        >
          {projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/portal/projects/${project.id}`}
                  className="block rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] px-6 py-5 transition hover:border-brand-200 hover:bg-white"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                        {project.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {project.description?.trim() ||
                          "Open this project workspace to review the connected estimate, contract, and invoice context."}
                      </p>
                      <p className="mt-3 text-sm text-slate-500">
                        {project.customer?.companyName ??
                          project.customer?.name ??
                          "Customer record"}{" "}
                        {project.locationSummary ? `| ${project.locationSummary}` : ""}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {formatStatusLabel(project.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Estimate
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestEstimateStatus)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Contract
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestContractStatus)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Invoice
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestInvoiceStatus)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No shared projects"
              title="Your contractor has not shared a project yet"
              description="This portal only shows projects that have been explicitly granted beneath your customer access. If you expected to see something here, contact your contractor admin."
            />
          )}
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Portal Context"
          description="A compact explanation of how access and record visibility work in this first portal foundation."
        >
          <ContextFactsList
            items={[
              {
                label: "Access model",
                value: "You can only see projects explicitly shared with your customer access."
              },
              {
                label: "Commercial records",
                value:
                  "Estimates, contracts, and invoices stay on the same canonical project chain your contractor uses internally."
              },
              {
                label: "What is not here",
                value:
                  "Messaging, project self-service, signing, and online payments are intentionally outside this first portal foundation."
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Recent access"
          description="The newest shared project appears first so the workspace stays easy to scan."
        >
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  <p className="font-medium text-slate-950">{project.name}</p>
                  <p className="mt-1">{formatDateTime(project.updatedAt)}</p>
                  <p className="mt-1 capitalize">
                    Project status: {formatStatusLabel(project.status)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
              Shared projects will appear here once access is granted.
            </div>
          )}
        </DetailPanel>
      </aside>
    </div>
  );
}
