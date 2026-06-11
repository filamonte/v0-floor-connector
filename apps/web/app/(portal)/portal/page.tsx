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
import { derivePortalHomeOrganization } from "@/lib/portal/organization";
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
  const organization = derivePortalHomeOrganization(projects);
  const primaryAttentionItem = organization.attentionItems[0] ?? null;
  const nextAction = primaryAttentionItem
    ? {
        title: `${primaryAttentionItem.title} for ${primaryAttentionItem.projectName}`,
        description: primaryAttentionItem.description,
        href: primaryAttentionItem.href,
        label: primaryAttentionItem.label
      }
    : getPortalHomeNextAction(projects);
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
            Your Portal
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Start with what needs your attention
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Review shared estimates, signatures, payments, and project updates
            from the project they belong to.
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
                value: organization.attentionItems.length
              },
              {
                label: "Scope",
                value: "Project records"
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
                    Your portal is organized by action first, then project.
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Items that need review, signature, or payment stay at the
                    top. Completed or history-only projects stay lower on the
                    page.
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
                    label: "Needs Your Attention",
                    content: nextAction ? (
                      <NextActionCard
                        eyebrow="Customer action"
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
                        No estimate, contract, or invoice is shared yet. When
                        one is ready, the right project to review will appear
                        here first.
                      </p>
                    )
                  },
                  {
                    key: "projects",
                    label: "Active Projects",
                    content: (
                      <>
                        <p className="text-2xl font-semibold tracking-tight text-slate-950">
                          {organization.activeProjects.length}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Projects with current shared status or customer review
                          steps.
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
          title="Needs Your Attention"
          description="Shared estimates, signatures, payments, and project items waiting for customer review."
        >
          {organization.attentionItems.length > 0 ? (
            <div className="grid gap-4">
              {organization.attentionItems.map((item) => (
                <article key={item.key} className={portalReviewCardClassName}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.projectName}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <PortalStatusBadge status={item.tone}>
                      {item.label}
                    </PortalStatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <PortalSecondaryLink href={item.href}>
                      {item.label}
                    </PortalSecondaryLink>
                    <PortalSecondaryLink
                      href={`/portal/projects/${item.projectId}`}
                    >
                      Open Project
                    </PortalSecondaryLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No action needed"
              title="Nothing needs your attention right now"
              description="When an estimate, contract, invoice, or change order is ready for customer action, it will appear here first."
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Active Projects"
          description="Project cards grouped for quick scanning by status and next customer step."
        >
          {organization.activeProjects.length > 0 ? (
            <div className="grid gap-4">
              {organization.activeProjects.map((item) =>
                (() => {
                  const project = item.project;
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
                        <PortalStatusBadge status={item.explanation.statusTone}>
                          {item.statusLabel}
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
                              {item.explanation.safeNextStep}
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
                          <PortalSecondaryLink href={item.nextActionHref}>
                            {item.nextActionLabel}
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
              eyebrow="No active project action"
              title="No active projects need review right now"
              description="Current or completed project records will remain available below when your contractor has shared them."
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Documents / Approvals"
          description="Estimates and contracts grouped by project and review state."
        >
          {organization.documentItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {organization.documentItems.map((item) => (
                <article key={item.key} className={portalReviewCardClassName}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.projectName}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {item.label}
                      </h2>
                    </div>
                    <PortalStatusBadge status={item.tone}>
                      {item.statusLabel}
                    </PortalStatusBadge>
                  </div>
                  <div className="mt-4">
                    <PortalSecondaryLink href={item.href}>
                      {item.tone === "attention" ? item.statusLabel : "Open"}
                    </PortalSecondaryLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No documents"
              title="No estimates or contracts are shared yet"
              description="Shared documents will appear here when your contractor publishes them to a project."
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Invoices / Payments"
          description="Open balances, payment status, and invoice links across your shared projects."
        >
          {organization.invoiceItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {organization.invoiceItems.map((item) => (
                <article key={item.key} className={portalReviewCardClassName}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.projectName}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {item.referenceNumber}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Balance: {item.balanceLabel}
                      </p>
                    </div>
                    <PortalStatusBadge status={item.tone}>
                      {item.paymentStateLabel}
                    </PortalStatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <PortalSecondaryLink href={item.href}>
                      Review Invoice
                    </PortalSecondaryLink>
                    <PortalSecondaryLink
                      href={`/portal/projects/${item.projectId}`}
                    >
                      Open Project
                    </PortalSecondaryLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No invoices"
              title="No invoices are shared yet"
              description="Invoices and payment status will appear here when they are shared for a project."
            />
          )}
        </DetailPanel>

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

        {organization.historyProjects.length > 0 ? (
          <DetailPanel
            title="History / Completed"
            description="Completed projects and current records that do not need customer action."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {organization.historyProjects.map((item) => (
                <article
                  key={item.project.id}
                  className={portalReviewCardClassName}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-950">
                        {item.project.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.explanation.shortExplanation}
                      </p>
                    </div>
                    <PortalStatusBadge status={item.explanation.statusTone}>
                      {item.statusLabel}
                    </PortalStatusBadge>
                  </div>
                  <div className="mt-4">
                    <PortalSecondaryLink
                      href={`/portal/projects/${item.project.id}`}
                    >
                      Open Project
                    </PortalSecondaryLink>
                  </div>
                </article>
              ))}
            </div>
          </DetailPanel>
        ) : null}
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="What you can see"
          description="Projects and documents your contractor has shared with you."
        >
          <ContextFactsList
            items={[
              {
                label: "Project access",
                value:
                  "You can only see projects your contractor has shared with your portal account."
              },
              {
                label: "Shared items",
                value:
                  "Estimates, contracts, and invoices stay connected to the project they belong to."
              },
              {
                label: "Private details",
                value:
                  "Some contractor notes and internal work details stay private unless your contractor shares them."
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
