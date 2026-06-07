import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  portalInsetPanelClassName,
  portalReviewCardClassName,
  portalStatePanelClassName,
  portalSummaryItemClassName,
  portalSummaryLabelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import type { PortalProjectDetailSummary } from "@/lib/portal/data";
import type { PortalProjectStatusWindow } from "@/lib/portal/project-status-window";
import type { PortalSafeStatusExplanation } from "@/lib/portal/status-explanation";

type PortalCustomerHubCard = {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  badge: "neutral" | "attention" | "complete" | "warning";
};

type PortalProjectSummaryPanelProps = {
  project: PortalProjectDetailSummary;
  statusWindow: PortalProjectStatusWindow;
  statusExplanation: PortalSafeStatusExplanation;
  customerHubCards: PortalCustomerHubCard[];
  paymentSummary: string | null;
};

function formatStatusLabel(status: string | null) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatScheduleVisibilityLabel(project: PortalProjectDetailSummary) {
  if (!project.latestJobDispatchStatus) {
    return "Not shared yet";
  }

  return `${formatStatusLabel(project.latestJobDispatchStatus)} shared by contractor`;
}

function formatStageStateLabel(state: string) {
  switch (state) {
    case "complete":
      return "Complete";
    case "current":
      return "Current";
    case "waiting":
      return "Waiting";
    default:
      return "Not shared";
  }
}

export function PortalProjectSummaryPanel({
  project,
  statusWindow,
  statusExplanation,
  paymentSummary
}: Omit<PortalProjectSummaryPanelProps, "customerHubCards">) {
  return (
    <div className="mt-10 space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className={portalStatePanelClassName}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            Current project state
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <PortalStatusBadge
                status={project.status ?? "neutral"}
                className="px-3.5 py-1.5 text-sm"
              >
                {formatStatusLabel(project.status)}
              </PortalStatusBadge>
              <PortalStatusBadge
                status={statusWindow.statusTone}
                className="px-3.5 py-1.5 text-sm"
              >
                {statusWindow.statusLabel}
              </PortalStatusBadge>
            </div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              {statusExplanation.headline}
            </p>
            <p className="text-sm leading-6 text-slate-600">
              {statusExplanation.shortExplanation}
            </p>
            <div className={portalInsetPanelClassName}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Shared project records
              </p>
              <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                <p>
                  Estimate: {formatStatusLabel(project.latestEstimateStatus)}
                </p>
                <p>
                  Contract: {formatStatusLabel(project.latestContractStatus)}
                </p>
                <p>Invoice: {formatStatusLabel(project.latestInvoiceStatus)}</p>
                <p>Schedule: {formatScheduleVisibilityLabel(project)}</p>
                {paymentSummary ? <p>Payment: {paymentSummary}</p> : null}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Schedule and progress stay contractor-managed here. This portal
                shows only customer-safe updates already shared for the project.
              </p>
            </div>
            <div className={portalInsetPanelClassName}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current stage
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">
                    {statusWindow.currentStage.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {statusWindow.currentStage.helperText}
                  </p>
                </div>
                <PortalStatusBadge
                  status={statusWindow.currentStage.tone}
                  className="shrink-0"
                >
                  {statusWindow.currentStage.statusLabel}
                </PortalStatusBadge>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                This stage is derived from shared estimate, contract, change
                order, invoice, and schedule records only.
              </p>
            </div>
          </div>
        </section>

        <WorkspaceSummaryBand
          className="grid gap-3 sm:grid-cols-2"
          itemClassName={portalSummaryItemClassName}
          labelClassName={portalSummaryLabelClassName}
          items={[
            {
              key: "next-action",
              label: "What to review next",
              content: (
                <NextActionCard
                  eyebrow="Project guidance"
                  title={statusWindow.customerNextStep.label}
                  description={statusWindow.customerNextStep.description}
                  primaryAction={
                    statusWindow.customerNextStep.href ? (
                      <PortalSecondaryLink
                        href={statusWindow.customerNextStep.href}
                      >
                        {statusWindow.customerNextStep.source === "none"
                          ? "Review project"
                          : statusWindow.customerNextStep.label}
                      </PortalSecondaryLink>
                    ) : null
                  }
                />
              )
            },
            {
              key: "record-visibility",
              label: "Shared records",
              content: (
                <div className="space-y-1 text-sm text-slate-600">
                  <p>{statusWindow.sharedRecords.length} total record(s)</p>
                  <p>{statusWindow.attentionItems.length} needing attention</p>
                  <p>{statusWindow.completedItems.length} complete</p>
                </div>
              )
            }
          ]}
        />
      </div>

      <section className={portalStatePanelClassName}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
              Project stage map
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              Where this shared project stands
            </h2>
          </div>
          <PortalStatusBadge status={statusWindow.statusTone}>
            {statusWindow.statusLabel}
          </PortalStatusBadge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {statusWindow.stageSummary.map((stage) => (
            <div key={stage.key} className={portalReviewCardClassName}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {formatStageStateLabel(stage.state)}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-950">
                    {stage.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {stage.helperText}
                  </p>
                </div>
                <PortalStatusBadge status={stage.tone} className="shrink-0">
                  {stage.statusLabel}
                </PortalStatusBadge>
              </div>
              {stage.href ? (
                <div className="mt-4">
                  <PortalSecondaryLink href={stage.href}>
                    {stage.customerActionRequired
                      ? "Review this stage"
                      : "Open record"}
                  </PortalSecondaryLink>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PortalProjectCustomerActionHub({
  statusWindow,
  statusExplanation,
  customerHubCards
}: Pick<
  PortalProjectSummaryPanelProps,
  "statusWindow" | "statusExplanation" | "customerHubCards"
>) {
  return (
    <DetailPanel
      title="Customer Action Hub"
      description="The clearest customer-safe path through the project records currently shared with you."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${portalStatePanelClassName} lg:col-span-2`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Project summary
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {statusWindow.primaryMessage}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {statusExplanation.safeNextStep}
              </p>
            </div>
            <PortalStatusBadge
              status={statusWindow.statusTone}
              className="shrink-0"
            >
              {statusWindow.statusLabel}
            </PortalStatusBadge>
          </div>
        </section>

        {customerHubCards.map((card) => (
          <article key={card.key} className={portalReviewCardClassName}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {card.eyebrow}
                </p>
                <h3 className="mt-2 text-base font-semibold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
              <PortalStatusBadge status={card.badge}>
                {card.badge === "attention" ? "Needs review" : card.badge}
              </PortalStatusBadge>
            </div>
            <div className="mt-4">
              <PortalSecondaryLink href={card.href}>
                {card.actionLabel}
              </PortalSecondaryLink>
            </div>
          </article>
        ))}
      </div>
    </DetailPanel>
  );
}
