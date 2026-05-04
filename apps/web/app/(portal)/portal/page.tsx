import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalReviewCardClassName,
  portalStatePanelClassName
} from "@/components/portal-review-ui";
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

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getPortalInvoiceProgressSummary(project: Awaited<ReturnType<typeof listPortalAccessibleProjects>>[number]) {
  if (!project.latestInvoiceStatus) {
    return "No shared billing record yet";
  }

  if (project.latestInvoicePaymentEventType === "payment_failed") {
    return "Recent payment attempt failed";
  }

  if (project.latestInvoicePaymentEventType === "checkout_started") {
    return "Payment is currently in progress";
  }

  if (project.latestInvoicePaymentEventType === "payment_succeeded") {
    return project.latestInvoiceStatus === "partially_paid"
      ? project.latestInvoiceWorkflowRole === "deposit"
        ? `A deposit payment completed | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} still remains`
        : `A payment completed | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} still remains`
      : project.latestInvoiceWorkflowRole === "deposit"
        ? "Deposit payment completed"
        : "Invoice payment completed";
  }

  if (project.latestInvoicePaymentEventType === "payment_requested") {
    return "Payment has been requested";
  }

  if (project.latestInvoicePaymentEventType === "payment_voided") {
    return "A recent payment was voided";
  }

  if (project.latestInvoiceStatus === "paid") {
    return project.latestInvoiceWorkflowRole === "deposit"
      ? "Deposit is fully paid"
      : "Invoice is fully paid";
  }

  if (project.latestInvoiceStatus === "partially_paid") {
    return project.latestInvoiceWorkflowRole === "deposit"
      ? `Deposit partially paid | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} remaining`
      : `Partially paid | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} remaining`;
  }

  if (project.latestInvoiceStatus === "void") {
    return "Invoice has been voided";
  }

  return project.latestInvoiceWorkflowRole === "deposit"
    ? `Deposit due | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} remaining`
    : `Balance due | ${formatMoney(project.latestInvoiceBalanceDueAmount ?? "0")} remaining`;
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
    if (invoiceProject.latestInvoicePaymentEventType === "checkout_started") {
      return {
        title: `Continue payment for ${invoiceProject.name}`,
        description:
          "A checkout session has already started on the shared invoice, so this project is the clearest place to confirm payment progress.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoicePaymentEventType === "payment_requested") {
      return {
        title: `Payment has been requested for ${invoiceProject.name}`,
        description:
          "Customer payment activity has started on this invoice, so review that project workspace for the current shared billing state.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoicePaymentEventType === "payment_succeeded") {
      return {
        title: `Review the remaining balance for ${invoiceProject.name}`,
        description:
          "A real provider-backed payment has already landed on the shared invoice, but the project still carries an open balance to review.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoicePaymentEventType === "payment_voided") {
      return {
        title: `Review reopened billing for ${invoiceProject.name}`,
        description:
          "The latest provider-backed payment was voided, so the invoice has returned to an open billing state on this project.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoiceStatus === "partially_paid") {
      return {
        title: `Review the remaining balance for ${invoiceProject.name}`,
        description:
          "A payment has already been recorded on the shared invoice, but there is still an outstanding balance to review.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open project billing"
      };
    }

    return {
      title: `Review billing for ${invoiceProject.name}`,
      description:
        "This project has an active invoice in view, so it is the clearest next record to review from the portal.",
      href: `/portal/projects/${invoiceProject.id}`,
      label: "Open project billing"
    };
  }

  const paidInvoiceProject = projects.find((project) => project.latestInvoiceStatus === "paid");

  if (paidInvoiceProject) {
    return {
      title: `Billing is current for ${paidInvoiceProject.name}`,
      description:
        "The latest shared invoice is fully paid on this project, so the project workspace is the best place to confirm the broader shared context.",
      href: `/portal/projects/${paidInvoiceProject.id}`,
      label: "Open paid billing context"
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
  const primaryProject =
    (nextAction
      ? projects.find((project) => nextAction.href === `/portal/projects/${project.id}`)
      : null) ?? projects[0] ?? null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className={portalHeroPanelClassName}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            Customer Workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Review the work your contractor has shared
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Start with the project that needs attention most, then move into its shared estimate, contract, or invoice record from there.
          </p>

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <section className={portalStatePanelClassName}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Where you are
                </p>
                <div className="mt-4 space-y-3">
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    This portal is organized around shared projects.
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Each project holds the customer-facing estimate, contract, and invoice records your contractor has shared with you.
                  </p>
                  {primaryProject ? (
                    <div className={portalInsetPanelClassName}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Project needing attention
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {primaryProject.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {getPortalInvoiceProgressSummary(primaryProject)}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4 text-sm leading-6 text-slate-600">
                      Shared projects will appear here once your contractor grants access.
                    </div>
                  )}
                </div>
              </section>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2"
                itemClassName="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-4"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "next-action",
                    label: "What to do next",
                    content: nextAction ? (
                      <NextActionCard
                        eyebrow="Portal guidance"
                        title={nextAction.title}
                        description={nextAction.description}
                        primaryAction={
                          <PortalSecondaryLink href={nextAction.href}>
                            {nextAction.label}
                          </PortalSecondaryLink>
                        }
                      />
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        No commercial records are shared yet. When they are published, the right project to review will appear here first.
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
                        <p className="mt-1 text-sm text-slate-600">
                          Shared through customer- and project-scoped access.
                        </p>
                      </>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Projects"
          description="Start with the project that needs attention most, then move into the shared estimate, contract, or invoice from there."
        >
          {projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/portal/projects/${project.id}`}
                  className={`block ${portalReviewCardClassName}`}
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
                    <PortalStatusBadge status={project.status ?? "neutral"}>
                      {formatStatusLabel(project.status)}
                    </PortalStatusBadge>
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

                  {project.latestInvoiceStatus ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm leading-6 text-slate-600">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        What matters now
                      </p>
                      <p className="mt-2 font-medium text-slate-950">
                        {getPortalInvoiceProgressSummary(project)}
                      </p>
                      {project.latestInvoicePaymentEventAt ? (
                        <p className="mt-1 text-slate-500">
                          Latest activity {formatDateTime(project.latestInvoicePaymentEventAt)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
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
          title="Access Scope"
          description="Shared access and record visibility for this workspace."
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
                  "Messaging and broad project self-service are still outside this customer workspace."
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Recently updated"
          description="Quick project references when you want a fast return path."
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
