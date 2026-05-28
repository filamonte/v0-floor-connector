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
import { derivePortalSafeStatusExplanation } from "@/lib/portal/status-explanation";

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

function getPortalHomeNextAction(
  projects: Awaited<ReturnType<typeof listPortalAccessibleProjects>>
) {
  const explanations = projects.map((project) => ({
    project,
    explanation: getPortalHomeStatusExplanation(project)
  }));
  const actionableExplanation =
    explanations.find(
      ({ explanation }) =>
        explanation.statusTone === "attention" && explanation.customerActionHref
    ) ??
    explanations.find(({ explanation }) => explanation.customerActionHref) ??
    null;

  if (actionableExplanation) {
    return {
      title: `${actionableExplanation.explanation.headline} for ${actionableExplanation.project.name}`,
      description: actionableExplanation.explanation.shortExplanation,
      href: `/portal/projects/${actionableExplanation.project.id}`,
      label:
        actionableExplanation.explanation.customerActionLabel ??
        "Open project workspace"
    };
  }

  const currentExplanation =
    explanations.find(
      ({ explanation }) => explanation.statusTone === "complete"
    ) ??
    explanations[0] ??
    null;

  if (currentExplanation) {
    return {
      title: `${currentExplanation.explanation.headline} for ${currentExplanation.project.name}`,
      description: currentExplanation.explanation.shortExplanation,
      href: `/portal/projects/${currentExplanation.project.id}`,
      label: "Open project workspace"
    };
  }

  return null;
}

function getPortalHomeStatusExplanation(
  project: Awaited<ReturnType<typeof listPortalAccessibleProjects>>[number]
) {
  return derivePortalSafeStatusExplanation({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    estimates:
      project.latestEstimateId && project.latestEstimateStatus
        ? [
            {
              id: project.latestEstimateId,
              status: project.latestEstimateStatus,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    contracts:
      project.latestContractId && project.latestContractStatus
        ? [
            {
              id: project.latestContractId,
              status: project.latestContractStatus,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    invoices:
      project.latestInvoiceId && project.latestInvoiceStatus
        ? [
            {
              id: project.latestInvoiceId,
              status: project.latestInvoiceStatus,
              referenceNumber: project.latestInvoiceReferenceNumber,
              workflowRole: project.latestInvoiceWorkflowRole,
              balanceDueAmount: project.latestInvoiceBalanceDueAmount,
              latestPaymentEventType: project.latestInvoicePaymentEventType,
              latestPaymentEventAt: project.latestInvoicePaymentEventAt,
              updatedAt: project.updatedAt
            }
          ]
        : [],
    jobs:
      project.latestJobId && project.latestJobDispatchStatus
        ? [
            {
              id: project.latestJobId,
              dispatchStatus: project.latestJobDispatchStatus,
              scheduledDate: project.latestJobScheduledDate,
              scheduledStartAt: project.latestJobScheduledStartAt,
              scheduledEndAt: project.latestJobScheduledEndAt,
              updatedAt: project.updatedAt
            }
          ]
        : []
  });
}

function getPortalHomeRecordCues(
  project: Awaited<ReturnType<typeof listPortalAccessibleProjects>>[number]
) {
  return [
    {
      key: "estimate",
      label: "Estimate",
      value: formatStatusLabel(project.latestEstimateStatus),
      href: project.latestEstimateId
        ? `/portal/estimates/${project.latestEstimateId}`
        : null,
      actionLabel: "Review estimate"
    },
    {
      key: "contract",
      label: "Contract",
      value: formatStatusLabel(project.latestContractStatus),
      href: project.latestContractId
        ? `/portal/contracts/${project.latestContractId}`
        : null,
      actionLabel: "Review contract"
    },
    {
      key: "invoice",
      label: "Invoice",
      value: formatStatusLabel(project.latestInvoiceStatus),
      href: project.latestInvoiceId
        ? `/portal/invoices/${project.latestInvoiceId}`
        : null,
      actionLabel: "Review invoice"
    }
  ];
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
  const primaryProjectExplanation = primaryProject
    ? getPortalHomeStatusExplanation(primaryProject)
    : null;

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
            description="Every review, signature, or payment path returns to a project-scoped record instead of a separate copy."
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
                        {primaryProjectExplanation?.shortExplanation}
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
              {projects.map((project) =>
                (() => {
                  const explanation = getPortalHomeStatusExplanation(project);
                  const recordCues = getPortalHomeRecordCues(project);

                  return (
                    <article
                      key={project.id}
                      className={`${portalReviewCardClassName} space-y-5`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                            {project.name}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {project.description?.trim() ||
                              "Open this project workspace to review the connected estimate, contract, invoice, and schedule context."}
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
                        <PortalStatusBadge status={explanation.statusTone}>
                          {explanation.headline}
                        </PortalStatusBadge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        {recordCues.map((cue) => (
                          <div
                            key={cue.key}
                            className={portalMetricPanelClassName}
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {cue.label}
                            </p>
                            <p className="mt-2 text-sm font-medium capitalize text-slate-950">
                              {cue.value}
                            </p>
                            {cue.href ? (
                              <div className="mt-3">
                                <PortalSecondaryLink href={cue.href}>
                                  {cue.actionLabel}
                                </PortalSecondaryLink>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div
                        className={`${portalMetricPanelClassName} text-sm leading-6 text-slate-600`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Your next step
                            </p>
                            <p className="mt-2 font-medium text-slate-950">
                              {explanation.safeNextStep}
                            </p>
                            {project.latestInvoicePaymentEventAt ? (
                              <p className="mt-1 text-slate-500">
                                Latest billing activity{" "}
                                {formatDateTime(
                                  project.latestInvoicePaymentEventAt
                                )}
                              </p>
                            ) : null}
                          </div>
                          <PortalSecondaryLink
                            href={`/portal/projects/${project.id}`}
                          >
                            Open project hub
                          </PortalSecondaryLink>
                        </div>
                      </div>
                    </article>
                  );
                })()
              )}
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
                  "Broad project self-service stays outside this workspace. Customer-visible replies appear only inside project conversations your contractor has shared."
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
