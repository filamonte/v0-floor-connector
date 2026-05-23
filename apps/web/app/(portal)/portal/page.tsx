import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  PortalTrustStrip,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalMetricPanelClassName,
  portalReviewCardClassName,
  portalStatePanelClassName,
  portalSummaryItemClassName,
  portalSummaryLabelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  listPortalAccessibleProjects,
  listPortalUpcomingAppointments
} from "@/lib/portal/data";

function formatStatusLabel(status: string | null) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatAppointmentTime(startAt: string, endAt: string | null) {
  const start = new Date(startAt).toLocaleString();

  if (!endAt) {
    return start;
  }

  return `${start} to ${new Date(endAt).toLocaleTimeString()}`;
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getPortalInvoiceProgressSummary(
  project: Awaited<ReturnType<typeof listPortalAccessibleProjects>>[number]
) {
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
          "Checkout has already started, so this project is the clearest place to confirm payment progress.",
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
          "A payment has already landed, but the project still carries an open balance to review.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoicePaymentEventType === "payment_voided") {
      return {
        title: `Review reopened billing for ${invoiceProject.name}`,
        description:
          "The latest payment was voided, so the invoice has returned to an open balance on this project.",
        href: `/portal/projects/${invoiceProject.id}`,
        label: "Open payment context"
      };
    }

    if (invoiceProject.latestInvoiceStatus === "partially_paid") {
      return {
        title: `Review the remaining balance for ${invoiceProject.name}`,
        description:
          "A payment has already been recorded, but there is still an outstanding balance to review.",
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

  const paidInvoiceProject = projects.find(
    (project) => project.latestInvoiceStatus === "paid"
  );

  if (paidInvoiceProject) {
    return {
      title: `Billing is current for ${paidInvoiceProject.name}`,
      description:
        "The latest invoice is fully paid on this project, so the project page is the best place to review what comes next.",
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

  const estimateProject = projects.find(
    (project) => project.latestEstimateStatus
  );

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

function getPortalProjectHomeAttention(
  project: Awaited<ReturnType<typeof listPortalAccessibleProjects>>[number]
) {
  if (
    project.latestInvoiceStatus &&
    !["paid", "void"].includes(project.latestInvoiceStatus)
  ) {
    return getPortalInvoiceProgressSummary(project);
  }

  if (
    project.latestContractStatus &&
    !["signed", "void"].includes(project.latestContractStatus)
  ) {
    return "Contract review or signature may still be in progress";
  }

  if (project.latestEstimateStatus === "sent") {
    return "Estimate is ready for review";
  }

  if (
    project.latestInvoiceStatus === "paid" ||
    project.latestContractStatus === "signed" ||
    project.latestEstimateStatus === "approved"
  ) {
    return "No action needed right now";
  }

  return "Open the project to see what has been shared";
}

export default async function PortalHomePage() {
  const [projects, upcomingAppointments] = await Promise.all([
    listPortalAccessibleProjects("/portal"),
    listPortalUpcomingAppointments("/portal", 5)
  ]);
  const nextAction = getPortalHomeNextAction(projects);
  const primaryProject =
    (nextAction
      ? projects.find(
          (project) => nextAction.href === `/portal/projects/${project.id}`
        )
      : null) ??
    projects[0] ??
    null;

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
            Start with the project that needs attention most, then move into its
            shared estimate, contract, or invoice record from there.
          </p>

          <PortalTrustStrip
            eyebrow="Customer-safe access"
            title="Your portal shows only records your contractor shared"
            description="Every review, signature, or payment path returns to a project-scoped record instead of a separate portal-only copy."
            items={[
              {
                label: "Projects",
                value: projects.length
              },
              {
                label: "Next step",
                value: nextAction ? "Available" : "Waiting"
              },
              {
                label: "Scope",
                value: "Project access"
              }
            ]}
          />

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
                    Each project holds the estimates, contracts, and invoices
                    your contractor has shared with you.
                  </p>
                  {primaryProject ? (
                    <div className={portalInsetPanelClassName}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Project to review
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {primaryProject.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {getPortalInvoiceProgressSummary(primaryProject)}
                      </p>
                    </div>
                  ) : (
                    <div className={portalInsetPanelClassName}>
                      Shared projects will appear here once your contractor
                      grants access.
                    </div>
                  )}
                </div>
              </section>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2"
                itemClassName={portalSummaryItemClassName}
                labelClassName={portalSummaryLabelClassName}
                items={[
                  {
                    key: "next-action",
                    label: "Your next step",
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
                        No commercial records are shared yet. When they are
                        published, the right project to review will appear here
                        first.
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
          title="Upcoming Appointments"
          description="Customer-visible appointments shared across your accessible projects."
        >
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/portal/projects/${appointment.projectId}`}
                  className={`block ${portalReviewCardClassName}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {appointment.projectName ?? "Shared project"}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {appointment.title ||
                          formatStatusLabel(appointment.appointmentType)}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {appointment.customerNotes?.trim() ||
                          "Your contractor shared this appointment time."}
                      </p>
                    </div>
                    <PortalStatusBadge status={appointment.status ?? "neutral"}>
                      {formatStatusLabel(appointment.status)}
                    </PortalStatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {formatStatusLabel(appointment.appointmentType)} |{" "}
                    {formatAppointmentTime(
                      appointment.startsAt,
                      appointment.endsAt
                    )}
                    {appointment.location ? ` | ${appointment.location}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No appointments"
              title="No customer-visible appointments yet"
              description="Appointments shared by your contractor will appear here when they are marked customer-visible."
            />
          )}
        </DetailPanel>

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
                        {project.locationSummary
                          ? `| ${project.locationSummary}`
                          : ""}
                      </p>
                    </div>
                    <PortalStatusBadge status={project.status ?? "neutral"}>
                      {formatStatusLabel(project.status)}
                    </PortalStatusBadge>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className={portalMetricPanelClassName}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Estimate
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestEstimateStatus)}
                      </p>
                    </div>
                    <div className={portalMetricPanelClassName}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Contract
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestContractStatus)}
                      </p>
                    </div>
                    <div className={portalMetricPanelClassName}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Invoice
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                        {formatStatusLabel(project.latestInvoiceStatus)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`${portalMetricPanelClassName} mt-4 text-sm leading-6 text-slate-600`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Your next step
                    </p>
                    <p className="mt-2 font-medium text-slate-950">
                      {getPortalProjectHomeAttention(project)}
                    </p>
                    {project.latestInvoicePaymentEventAt ? (
                      <p className="mt-1 text-slate-500">
                        Latest activity{" "}
                        {formatDateTime(project.latestInvoicePaymentEventAt)}
                      </p>
                    ) : null}
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
          title="Access Scope"
          description="Shared access and record visibility for this workspace."
        >
          <ContextFactsList
            items={[
              {
                label: "Access model",
                value:
                  "You can only see projects explicitly shared with your customer access."
              },
              {
                label: "Commercial records",
                value:
                  "Estimates, contracts, and invoices stay connected to this same project."
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
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  <p className="font-medium text-[var(--text-primary)]">
                    {project.name}
                  </p>
                  <p className="mt-1">{formatDateTime(project.updatedAt)}</p>
                  <p className="mt-1 capitalize">
                    Project status: {formatStatusLabel(project.status)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
              Shared projects will appear here once access is granted.
            </div>
          )}
        </DetailPanel>
      </aside>
    </div>
  );
}
