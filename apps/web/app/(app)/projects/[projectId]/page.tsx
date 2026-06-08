import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ProjectStateSummary,
  WorkflowBar,
  getStatusBadgeClassName,
  type ProjectStateItem,
  type WorkflowStep
} from "@floorconnector/ui";

import { AppEmptyState } from "@/components/app-empty-state";
import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { listAppointmentsByProject } from "@/lib/appointments/data";
import { listProjectChangeOrders } from "@/lib/change-orders/data";
import { CoreWorkflowSection } from "@/components/layout/core-workflow-section";
import { ExecutionSection } from "@/components/layout/execution-section";
import { SupportSection } from "@/components/layout/support-section";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { GateKeeperSubjectMemoryPanel } from "@/components/gatekeeper-subject-memory-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NeedsAttentionPanel } from "@/components/operational-cues/needs-attention-panel";
import {
  ProjectConnectedRecordLanes,
  type ProjectConnectedRecordLane
} from "@/components/project-connected-record-lanes";
import { ProjectNextActionsPanel } from "@/components/project-next-actions-panel";
import {
  ProjectReadinessNextActionPanel,
  type ProjectReadinessBlockerItem,
  type ProjectReadinessNextAction
} from "@/components/project-readiness-next-action-panel";
import {
  OperationalGuidanceSection,
  type OperationalGuidanceBucket
} from "@/components/operational-guidance-section";
import { CueStateControls } from "@/components/cue-states/cue-state-controls";
import { ProjectForm } from "@/components/project-form";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import {
  ProjectFieldTrailSection,
  ProjectMessageCenterSection
} from "@/components/project-field-communication-sections";
import {
  ProjectEvidenceContinuitySection,
  ProjectProofCenterSection
} from "@/components/project-proof-evidence-sections";
import {
  ProjectAiOperationalCopilotSection,
  ProjectCommandCenterMapSection,
  type ProjectCommandCenterMapItem
} from "@/components/project-ai-copilot-command-sections";
import { ProjectFinancialContinuitySection } from "@/components/project-financial-continuity-section";
import {
  ProjectProductionHubSection,
  ProjectProductionScheduleContinuityPanel
} from "@/components/project-production-hub-section";
import { ReadyToScheduleActionPanel } from "@/components/ready-to-schedule-action-panel";
import { RecordLinkedCommunicationComposer } from "@/components/record-linked-communication-composer";
import { RoleSlotControls } from "@/components/role-slots/role-slot-controls";
import { ServiceWarrantyContinuityPanel } from "@/components/service-warranty-continuity-panel";
import { WorkItemCreateForm } from "@/components/work-items/work-item-create-form";
import { WorkItemList } from "@/components/work-items/work-item-list";
import { listContracts } from "@/lib/contracts/data";
import {
  deriveCloseoutTrailSummary,
  type CloseoutTrailChecklistState,
  type CloseoutTrailSummary,
  type CloseoutTrailTone
} from "@/lib/closeouttrail/summary";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { buildDailyLogCaptureHref } from "@/lib/daily-logs/links";
import { listCustomers } from "@/lib/customers/data";
import { getProjectEquipmentReadinessSummary } from "@/lib/equipment/data";
import {
  listEstimates,
  listProjectEstimateAttachments
} from "@/lib/estimates/data";
import {
  listExecutionAttachmentsBySubjects,
  resolveExecutionAttachmentPreviews
} from "@/lib/execution-attachments/data";
import {
  revokeExecutionAttachmentPortalShareAction,
  shareExecutionAttachmentToPortalAction
} from "@/lib/portal-evidence-grants/actions";
import {
  listPortalEvidenceDeliveryEventsByProject,
  listPortalEvidenceGrantsByProject
} from "@/lib/portal-evidence-grants/data";
import { deriveProjectPortalEvidenceSharingSummary } from "@/lib/portal-evidence-grants/summary";
import { deriveSharedEvidenceReceiptRollupFromProjectSharing } from "@/lib/portal-evidence-grants/receipt-rollup";
import { deriveFieldTrailSummary } from "@/lib/fieldtrail/summary";
import { listFieldNotes } from "@/lib/field-notes/data";
import { getGateKeeperSubjectMemory } from "@/lib/gatekeeper/memory";
import { getInvoiceById, listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getProjectMessageCenterTrail } from "@/lib/messagecenter/data";
import { deriveMessageCenterSummary } from "@/lib/messagecenter/summary";
import {
  buildProjectCloseoutPackagePrintHref,
  buildProjectEvidenceReceiptPrintHref
} from "@/lib/document-engine/print";
import {
  deriveProjectPulseSummary,
  type ProjectPulseSummary,
  type ProjectPulseTone
} from "@/lib/projectpulse/summary";
import { deriveProofCenterSummary } from "@/lib/proofcenter/summary";
import {
  deriveAiCopilotDraftActions,
  deriveAiCommunicationAssistance,
  deriveAiFieldSummary,
  deriveAiProjectOperationalSummary
} from "@/lib/ai-operational-copilot/summary";
import { buildAiCopilotCommunicationHandoffHref } from "@/lib/ai-operational-copilot/communication-handoff";
import { getAiProviderAvailability } from "@/lib/ai-operational-copilot/provider";
import { getOperationalCuesForProject } from "@/lib/operational-cues/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  applyCueStates,
  getCueStateActionSupport
} from "@/lib/cue-states/apply";
import {
  buildOperationalCueIdentity,
  buildProjectCueIdentity
} from "@/lib/cue-states/identity";
import { listWorkflowCueStatesForIdentities } from "@/lib/cue-states/data";
import { getOpportunityByProjectId } from "@/lib/opportunities/data";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listPeople } from "@/lib/people/data";
import { listPunchlistItemsByProject } from "@/lib/punchlists/data";
import {
  listPortalAccessGrantsByCustomer,
  listPortalProjectAccessByGrantId
} from "@/lib/portal-access/data";
import { listProgressBillingByProject } from "@/lib/progress-billing/data";
import { updateProjectAction } from "@/lib/projects/actions";
import { buildProjectCues, type ProjectCue } from "@/lib/projects/cues";
import { buildProjectNextActions } from "@/lib/projects/project-next-actions";
import { getProjectById } from "@/lib/projects/data";
import { updateProjectRoleSlotsAction } from "@/lib/role-slots/actions";
import {
  deriveProjectOperationalWorkspaceSummary,
  type ProjectOperationalSeverity,
  type ProjectOperationalWorkspaceSummary
} from "@/lib/projects/operational-workspace";
import { deriveProjectEvidenceContinuitySummary } from "@/lib/projects/evidence-continuity";
import {
  deriveProjectCommandTimeline,
  type ProjectCommandTimeline,
  type ProjectCommandTimelineItem,
  type ProjectCommandTimelineTone
} from "@/lib/projects/timeline";
import { filterActiveExecutionAttachments } from "@/lib/execution-attachments/lifecycle";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { financingStatusesList } from "@/lib/projects/schemas";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import {
  listOpenTimeCardStates,
  listTimeCardsByProject
} from "@/lib/time/data";
import { listServiceTicketsByProject } from "@/lib/service-tickets/data";
import { listWarrantyDocumentsByProject } from "@/lib/warranty-documents/data";
import {
  completeWorkItemAction,
  createWorkItemEvidenceAttachmentAction,
  createWorkItemAction,
  dismissWorkItemAction
} from "@/lib/work-items/actions";
import {
  listWorkItemsForProject,
  listWorkItemsForSource,
  type WorkItemListItem
} from "@/lib/work-items/data";
import { buildProjectGuidanceWorkItemPrefill } from "@/lib/work-items/prefill";
import {
  buildWorkItemOwnershipDisplay,
  buildProjectEstimateHandoffSummary,
  getEstimateWorkItemType,
  getWorkItemBlockerReason,
  getWorkItemDueStateLabel,
  getWorkItemFieldState,
  selectProjectEstimateHandoffWorkItems,
  type ProjectEstimateHandoffSummary
} from "@/lib/work-items/read-model";
import {
  normalizeWorkflowGuidancePreferences,
  shouldShowAiCopilotSummaries,
  shouldShowAiDraftActions,
  shouldShowNextBestActions,
  shouldShowReadinessGuidance
} from "@/lib/workflow-guidance/preferences";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    workItemCue?: string;
  }>;
};

type ReadinessStageView = {
  title: string;
  detail: string;
  state: "complete" | "current" | "blocked" | "upcoming";
};

type ProjectEstimateListItem = Awaited<
  ReturnType<typeof listEstimates>
>[number];
type ProjectContractListItem = Awaited<
  ReturnType<typeof listContracts>
>[number];
type ProjectInvoiceListItem = Awaited<ReturnType<typeof listInvoices>>[number];
type ProjectChangeOrderListItem = Awaited<
  ReturnType<typeof listProjectChangeOrders>
>[number];
type ProjectJobListItem = Awaited<ReturnType<typeof listJobs>>[number];
type ProjectDailyLogListItem = Awaited<
  ReturnType<typeof listDailyLogsByProject>
>[number];
type ProjectFieldNoteListItem = Awaited<
  ReturnType<typeof listFieldNotes>
>[number];
type ProjectPaymentListItem = NonNullable<
  Awaited<ReturnType<typeof getInvoiceById>>
>["payments"][number];
type WorkspaceStateTone = "positive" | "warning" | "critical" | "neutral";
type WorkspaceActionItem = {
  title: string;
  description: string;
  label?: string;
  href?: string;
  tone?: "primary" | "secondary" | "warning";
};
type CommandSummaryItem = {
  label: string;
  value: string;
  detail: string;
  tone?: WorkspaceStateTone;
};
type LifecycleStepId =
  | "opportunity"
  | "customer-project"
  | "estimate-contract"
  | "job-schedule"
  | "invoice-payment";

const projectWorkspacePanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.42)]";

const projectWorkspacePanelHeaderClassName =
  "border-b border-[var(--border-warm)] bg-[linear-gradient(135deg,white_0%,var(--highlight)_100%)]";

const projectCommandSurfaceClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] shadow-[0_14px_36px_-34px_rgba(31,41,55,0.42)]";

const projectCommandInsetClassName =
  "border border-[var(--border-warm)] bg-white";

type SectionOverviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  stat: string;
};
type LinkedRecordRecencyItem = {
  id: string;
  recordKey: string;
  typeLabel: string;
  title: string;
  href: string;
  statusLabel: string;
  activityLabel: string;
  timestamp: string;
  timestampLabel: string;
  isDrivingRecord: boolean;
};

function getProjectCuePriorityClassName(priority: ProjectCue["priority"]) {
  switch (priority) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "medium":
      return "border-slate-200 bg-slate-50 text-slate-800";
  }
}

function mapReadinessStageToWorkflowState(
  state: ReadinessStageView["state"]
): WorkflowStep["state"] {
  switch (state) {
    case "complete":
      return "complete";
    case "current":
      return "current";
    case "blocked":
      return "blocked";
    case "upcoming":
      return "upcoming";
  }
}

function mapWorkspaceToneToProjectStateTone(
  tone: WorkspaceStateTone
): ProjectStateItem["tone"] {
  switch (tone) {
    case "positive":
      return "complete";
    case "warning":
      return "needsAction";
    case "critical":
      return "blocked";
    case "neutral":
      return "pending";
  }
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatWorkflowModeLabel(mode: string) {
  switch (mode) {
    case "guided":
      return "Guided";
    case "flexible":
      return "Flexible";
    case "manual":
      return "Manual";
    default:
      return formatStatusLabel(mode);
  }
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not marked yet";
}

function joinMetaParts(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" | ");
}

function formatUpdatedActivity(value: string | null | undefined) {
  return value ? `Updated ${formatDateTime(value)}` : null;
}

function getMetadataString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function getProjectEstimateWorkLabel(workItem: WorkItemListItem) {
  switch (getEstimateWorkItemType(workItem)) {
    case "generate_estimate":
      return "Estimate Work";
    case "review_estimate":
    case "approve_send":
      return "Ready for Review";
    case "request_missing_info":
      return "Missing Info";
    case "follow_up_customer":
      return "Follow-up";
    default:
      return "Estimate Work";
  }
}

function getProjectEstimateWorkDueLabel(
  workItem: WorkItemListItem,
  nowIso: string
) {
  return getWorkItemDueStateLabel(workItem, nowIso);
}

function getProjectEstimateWorkNextAction(workItem: WorkItemListItem) {
  return (
    getMetadataString(workItem.metadata.nextAction) ??
    getMetadataString(workItem.metadata.nextActionText) ??
    getMetadataString(workItem.metadata.safeNextAction)
  );
}

function getProjectEstimateWorkEstimateId(workItem: WorkItemListItem) {
  if (workItem.sourceType === "estimate" && workItem.sourceId) {
    return workItem.sourceId;
  }

  return getMetadataString(workItem.metadata.estimateId);
}

function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "No labor time";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
}

function formatLocation(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ") || "Not provided";
}

function getStageCardClassName(state: ReadinessStageView["state"]) {
  switch (state) {
    case "complete":
      return getStatusBadgeClassName("complete");
    case "current":
      return getStatusBadgeClassName("current");
    case "blocked":
      return getStatusBadgeClassName("blocked");
    default:
      return getStatusBadgeClassName("not_started");
  }
}

function renderStatusBadge(label: string) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        getStatusBadgeClassName(label)
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function formatBlockerLabel(
  blocker: NonNullable<ProjectFinancialReadinessSnapshot>["blockers"][number]
) {
  switch (blocker) {
    case "site_assessment_incomplete":
      return "Site assessment is still incomplete on the linked sales record.";
    case "estimate_not_approved":
      return "An estimate still needs approval before the commercial handoff can continue.";
    case "contract_missing":
      return "No contract has been generated from approved scope yet.";
    case "contract_internal_approval_pending":
      return "Internal contract approval is still blocking send readiness.";
    case "contract_signature_pending":
      return "Contract signature is still required before operations handoff.";
    case "deposit_required":
      return "A deposit is required and has not been satisfied yet.";
    case "financing_pending":
      return "Financing is still pending, so the project is not financially ready.";
    case "financing_declined":
      return "Financing was declined, so the project remains commercially blocked.";
    default:
      return formatStatusLabel(blocker);
  }
}

function getWorkspaceActionLinkClassName(
  tone: NonNullable<WorkspaceActionItem["tone"]> = "secondary"
) {
  switch (tone) {
    case "primary":
      return primaryActionClassName;
    case "warning":
      return secondaryActionClassName;
    default:
      return secondaryActionClassName;
  }
}

function SectionOverview({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  stat
}: SectionOverviewProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-warm)] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:flex-shrink-0">
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          {stat}
        </span>
        <Link
          href={href}
          className={getWorkspaceActionLinkClassName("secondary")}
        >
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}

function ProjectEstimateHandoffContinuityPanel({
  workItems,
  summary,
  estimates
}: {
  workItems: WorkItemListItem[];
  summary: ProjectEstimateHandoffSummary<WorkItemListItem>;
  estimates: ProjectEstimateListItem[];
}) {
  const nowIso = new Date().toISOString();
  const estimateById = new Map(
    estimates.map((estimate) => [estimate.id, estimate])
  );

  return (
    <section
      aria-labelledby="project-estimate-handoff-title"
      className="rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Estimate Work
          </p>
          <h3
            id="project-estimate-handoff-title"
            className="mt-1 text-base font-semibold text-slate-950"
          >
            Estimate handoff continuity
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-slate-600">
            Open estimate-production Work Items linked to this project, project
            estimates, or the linked opportunity. This is project continuity
            only; the focused estimate and Work Item surfaces own edits.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm md:w-[22rem]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Open
            </p>
            <p className="text-xl font-semibold text-slate-950">
              {summary.totalOpen}
            </p>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700">
              Blocked
            </p>
            <p className="text-xl font-semibold text-rose-950">
              {summary.blockedCount}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              Ready
            </p>
            <p className="text-xl font-semibold text-amber-950">
              {summary.readyForReviewCount}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Follow-up
            </p>
            <p className="text-xl font-semibold text-slate-950">
              {summary.followUpsDueCount}
            </p>
          </div>
        </div>
      </div>

      {summary.nextItem ? (
        <div className="mt-4 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Next most urgent estimate item
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {summary.nextItem.title}
          </p>
          <p className="mt-1">
            {getProjectEstimateWorkDueLabel(summary.nextItem, nowIso)} ·{" "}
            {
              buildWorkItemOwnershipDisplay({
                workItem: summary.nextItem,
                assignedPerson: summary.nextItem.assignedPerson,
                createdByPerson: summary.nextItem.createdByPerson
              }).assignedOwnerLabel
            }
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {workItems.length > 0 ? (
          workItems.slice(0, 5).map((workItem) => {
            const fieldState = getWorkItemFieldState(workItem);
            const blockerReason = getWorkItemBlockerReason(workItem);
            const nextAction = getProjectEstimateWorkNextAction(workItem);
            const estimateId = getProjectEstimateWorkEstimateId(workItem);
            const estimate = estimateId ? estimateById.get(estimateId) : null;
            const ownership = buildWorkItemOwnershipDisplay({
              workItem,
              assignedPerson: workItem.assignedPerson,
              createdByPerson: workItem.createdByPerson
            });

            return (
              <article
                key={workItem.id}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/field/work-items/${workItem.id}`}
                        className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                      >
                        {workItem.title}
                      </Link>
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                        {getProjectEstimateWorkLabel(workItem)}
                      </span>
                      {fieldState === "blocked" ? (
                        <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-900">
                          Blocked
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {formatStatusLabel(workItem.status)} ·{" "}
                      {getProjectEstimateWorkDueLabel(workItem, nowIso)} ·{" "}
                      {ownership.stateLabel}
                    </p>
                    <div className="mt-2 grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:grid-cols-2">
                      <span>{ownership.assignedOwnerLabel}</span>
                      <span>{ownership.requesterLabel}</span>
                    </div>
                    {blockerReason ? (
                      <p className="mt-2 text-sm leading-6 text-rose-800">
                        Blocker: {blockerReason}
                      </p>
                    ) : null}
                    {nextAction ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        Next action: {nextAction}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {estimate ? (
                      <Link
                        href={`/estimates/${estimate.id}`}
                        className="inline-flex h-8 items-center border border-slate-300 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-[#d8731f] hover:text-slate-950"
                      >
                        {estimate.referenceNumber}
                      </Link>
                    ) : null}
                    {workItem.linkPath ? (
                      <Link
                        href={workItem.linkPath}
                        className="inline-flex h-8 items-center border border-slate-300 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-[#d8731f] hover:text-slate-950"
                      >
                        Open source
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-950">
              No open estimate handoff work is linked to this project.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Estimate work appears here only after an internal Work Item is
              connected to this project, one of its estimates, or the linked
              opportunity.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function LinkedRecordRecencyPanel({
  items
}: {
  items: LinkedRecordRecencyItem[];
}) {
  const mostRecent = items[0] ?? null;

  return (
    <section
      aria-labelledby="linked-record-recency-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 sm:px-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Linked record recency
          </p>
          <h3
            id="linked-record-recency-title"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            What changed recently
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-[var(--text-secondary)]">
            Existing linked records sorted by their own timestamps. This is a
            breadcrumb summary, not a separate project activity feed.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          {items.length} linked {items.length === 1 ? "record" : "records"}
        </span>
      </div>

      {mostRecent ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
              Most recent linked record
            </p>
            <p className="mt-1 font-semibold text-[var(--text-primary)]">
              {mostRecent.typeLabel}: {mostRecent.title}
            </p>
            <p className="mt-1">{mostRecent.activityLabel}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {items.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={[
                  "rounded-lg border bg-[var(--highlight)] px-4 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-white",
                  item.isDrivingRecord
                    ? "border-[var(--copper)] ring-1 ring-[var(--copper)]/20"
                    : "border-[var(--border-warm)]"
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {item.typeLabel}
                    </p>
                    <p className="mt-1 truncate font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {item.isDrivingRecord ? (
                      <span className="rounded-full border border-[var(--copper)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--copper)]">
                        Driving next step
                      </span>
                    ) : null}
                    {renderStatusBadge(item.statusLabel)}
                  </div>
                </div>
                <p className="mt-3 text-[var(--text-secondary)]">
                  {item.activityLabel}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                  {item.timestampLabel}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          No timestamped linked records are available for this project yet.
        </div>
      )}
    </section>
  );
}

function getTimelineToneClassName(tone: ProjectCommandTimelineTone) {
  switch (tone) {
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "ready":
      return "border-teal-200 bg-teal-50 text-teal-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function ProjectCommandTimelineRow({
  item
}: {
  item: ProjectCommandTimelineItem;
}) {
  return (
    <div className="grid gap-3 border-t border-[var(--border-warm)] py-3 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
              getTimelineToneClassName(item.tone)
            ].join(" ")}
          >
            {item.status}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            {item.sourceLabel}
          </span>
          {item.customerSafe ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              Customer-safe
            </span>
          ) : null}
        </div>
        <Link
          href={item.href}
          className="mt-2 block text-sm font-semibold text-[var(--text-primary)] transition hover:text-[var(--copper)]"
        >
          {item.title}
        </Link>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          {item.summary}
        </p>
      </div>
      {item.nextActionLabel && item.nextActionHref ? (
        <div className="flex items-start md:justify-end">
          <Link
            href={item.nextActionHref}
            className={getWorkspaceActionLinkClassName(
              item.needsAttention ? "warning" : "secondary"
            )}
          >
            {item.nextActionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ProjectCommandTimelineSection({
  timeline
}: {
  timeline: ProjectCommandTimeline;
}) {
  const headlineItems =
    timeline.needsAttention.length > 0
      ? timeline.needsAttention.slice(0, 3)
      : timeline.readyToMove.slice(0, 3);
  const supportingItems = timeline.recentMovement
    .filter(
      (item) => !headlineItems.some((headline) => headline.id === item.id)
    )
    .slice(0, 5);

  return (
    <section
      id="project-command-timeline"
      className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 shadow-[0_14px_36px_-34px_rgba(31,41,55,0.42)] sm:px-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Project command timeline
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            Recent movement and next handoffs
          </h3>
          <p className="mt-1 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
            Timeline answers what happened and where the source record lives. It
            is derived from linked canonical records, proof, field, payment,
            signature, and communication evidence; it does not create activity
            truth or change source records.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center md:w-72">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-lg font-semibold text-amber-950">
              {timeline.needsAttention.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
              Needs attention
            </p>
          </div>
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2">
            <p className="text-lg font-semibold text-teal-950">
              {timeline.readyToMove.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-900">
              Ready
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {timeline.items.length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Signals
            </p>
          </div>
        </div>
      </div>

      {timeline.items.length > 0 ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {timeline.needsAttention.length > 0
                ? "Needs attention"
                : "Ready to move"}
            </p>
            <div className="mt-3">
              {headlineItems.map((item) => (
                <ProjectCommandTimelineRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Recent movement
            </p>
            <div className="mt-3">
              {supportingItems.length > 0 ? (
                supportingItems.map((item) => (
                  <ProjectCommandTimelineRow key={item.id} item={item} />
                ))
              ) : (
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  New linked record movement will appear here after real
                  estimate, contract, invoice, schedule, field, proof, and
                  communication records are created through the app.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          {timeline.emptyStateMessage}
        </div>
      )}
    </section>
  );
}

function getCommandSummaryToneClassName(tone: WorkspaceStateTone = "neutral") {
  switch (tone) {
    case "positive":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function getProjectPulseToneClassName(tone: ProjectPulseTone) {
  switch (tone) {
    case "good":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function ProjectPulseSection({ summary }: { summary: ProjectPulseSummary }) {
  const leadItems =
    summary.blockers.length > 0
      ? summary.blockers
      : summary.warnings.length > 0
        ? summary.warnings
        : summary.highlights;

  return (
    <section id="projectpulse" className={projectWorkspacePanelClassName}>
      <div
        className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              ProjectPulse
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Project health summary
            </h3>
            <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[var(--text-secondary)]">
              {summary.primaryMessage}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                getProjectPulseToneClassName(summary.healthTone)
              ].join(" ")}
            >
              {summary.stageLabel}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Next Move
            </span>
            <Link
              href={summary.nextMove.href}
              className={primaryActionClassName}
            >
              {summary.nextMove.label}
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            {summary.nextMove.reason}
          </p>
          {leadItems.length > 0 ? (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {leadItems.slice(0, 2).map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-5">
        {summary.signals.map((signal) => (
          <Link
            key={signal.id}
            href={signal.href}
            className={[
              "rounded-lg border px-4 py-3 text-sm leading-6 transition hover:border-[var(--copper)] hover:bg-white",
              getProjectPulseToneClassName(signal.tone)
            ].join(" ")}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">
              {signal.label}
            </p>
            <p className="mt-2 font-semibold">{signal.status}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{signal.detail}</p>
          </Link>
        ))}
      </div>

      <div className="border-t border-[var(--border-warm)] px-4 py-3 sm:px-5">
        <div className="grid gap-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-6">
          {[
            { label: "Jobs", value: summary.linkedCounts.jobs },
            {
              label: "Open blockers",
              value: summary.linkedCounts.openBlockers
            },
            { label: "Daily Job Logs", value: summary.linkedCounts.dailyLogs },
            {
              label: "Communication",
              value: summary.linkedCounts.communicationItems
            },
            {
              label: "Unpaid invoices",
              value: summary.linkedCounts.unpaidInvoices
            },
            {
              label: "Signature/Payment",
              value:
                summary.linkedCounts.pendingSignatureItems +
                summary.linkedCounts.paymentAttentionItems
            }
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
            >
              <p className="font-semibold uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getCloseoutTrailToneClassName(tone: CloseoutTrailTone) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "neutral":
      return "border-[var(--border-warm)] bg-white text-[var(--text-primary)]";
  }
}

function getCloseoutChecklistStateClassName(
  state: CloseoutTrailChecklistState
) {
  switch (state) {
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "not_applicable":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "unknown":
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function CloseoutTrailSection({ summary }: { summary: CloseoutTrailSummary }) {
  const leadItems =
    summary.blockers.length > 0 ? summary.blockers : summary.highlights;
  const proofCounts = [
    { label: "Completed jobs", value: summary.linkedCounts.completedJobs },
    { label: "Open jobs", value: summary.linkedCounts.openJobs },
    {
      label: "Field proof",
      value: `${summary.linkedCounts.dailyLogs} logs / ${summary.linkedCounts.evidenceItems} files`
    },
    { label: "Open invoices", value: summary.linkedCounts.openInvoices },
    {
      label: "Open balance",
      value: formatMoney(summary.linkedCounts.unpaidBalance)
    },
    {
      label: "Change orders",
      value: summary.linkedCounts.unresolvedChangeOrders
    },
    {
      label: "Warranty/service",
      value: summary.linkedCounts.warrantyOrServiceItems
    }
  ];

  return (
    <section id="closeouttrail" className={projectWorkspacePanelClassName}>
      <div
        className={`${projectWorkspacePanelHeaderClassName} px-4 py-4 sm:px-5`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              CloseoutTrail
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Closeout readiness and proof
            </h3>
            <p className="mt-2 max-w-[70ch] text-sm leading-6 text-[var(--text-secondary)]">
              {summary.primaryMessage}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <span
              className={[
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                getCloseoutTrailToneClassName(summary.closeoutTone)
              ].join(" ")}
            >
              {summary.closeoutStatusLabel}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
              Closeout Next Move
            </span>
            <Link
              href={summary.nextMove.href}
              className={primaryActionClassName}
            >
              {summary.nextMove.label}
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="font-semibold text-[var(--text-primary)]">
            {summary.nextMove.reason}
          </p>
          {leadItems.length > 0 ? (
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {leadItems.slice(0, 2).map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-3">
        {summary.checklistItems.map((item) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{item.label}</p>
                <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                  {formatStatusLabel(item.state)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 opacity-80">{item.detail}</p>
            </>
          );
          const className = [
            "rounded-lg border px-4 py-3 text-sm leading-6 transition",
            item.href ? "hover:border-[var(--copper)] hover:bg-white" : "",
            getCloseoutChecklistStateClassName(item.state)
          ].join(" ");

          return item.href ? (
            <Link key={item.id} href={item.href} className={className}>
              {body}
            </Link>
          ) : (
            <div key={item.id} className={className}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--border-warm)] px-4 py-3 sm:px-5">
        <div className="grid gap-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
          {proofCounts.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2"
            >
              <p className="font-semibold uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperationalCommandCenter({
  customerName,
  projectLocation,
  nextAction,
  blockerCount,
  readinessLabel,
  readinessDetail,
  summaryItems
}: {
  customerName: string;
  projectLocation: string;
  nextAction: ProjectReadinessNextAction;
  blockerCount: number;
  readinessLabel: string;
  readinessDetail: string;
  summaryItems: CommandSummaryItem[];
}) {
  return (
    <section
      aria-labelledby="project-command-center-title"
      className={projectCommandSurfaceClassName}
    >
      <div className="flex flex-col gap-4 px-4 py-3 lg:flex-row lg:items-start lg:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
            Project summary
          </p>
          <h2
            id="project-command-center-title"
            className="mt-1 text-base font-semibold tracking-tight text-[var(--text-primary)]"
          >
            Operational continuity
          </h2>
          <p className="mt-2 max-w-[76ch] text-sm leading-6 text-[var(--text-secondary)]">
            {customerName} / {projectLocation}. This project hub reads the
            opportunity, customer/project, estimate/contract, job/schedule, and
            invoice/payment chain in one place.
          </p>
        </div>
        <div
          className={[
            "px-4 py-3 text-sm leading-6 text-[var(--text-secondary)] lg:w-72",
            projectCommandInsetClassName
          ].join(" ")}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Readiness
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {readinessLabel}
          </p>
          <p className="mt-1">{readinessDetail}</p>
        </div>
      </div>

      <div className="grid gap-px border-y border-[var(--border-warm)] bg-[var(--border-warm)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="bg-white px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Workflow step
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
            {nextAction.title}
          </p>
          <p className="mt-1">{nextAction.description}</p>
          {nextAction.blockerCopy ? (
            <p className="mt-2 font-medium text-amber-900">
              {nextAction.blockerCopy}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {nextAction.primaryHref && nextAction.primaryLabel ? (
              <Link
                href={nextAction.primaryHref}
                className={getWorkspaceActionLinkClassName("primary")}
              >
                {nextAction.primaryLabel}
              </Link>
            ) : null}
            {nextAction.secondaryHref && nextAction.secondaryLabel ? (
              <Link
                href={nextAction.secondaryHref}
                className={getWorkspaceActionLinkClassName("secondary")}
              >
                {nextAction.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div
          className={[
            "border-l border-[var(--border-warm)] px-4 py-4 text-sm leading-6",
            blockerCount > 0
              ? "bg-amber-50 text-amber-950"
              : "bg-emerald-50 text-emerald-950"
          ].join(" ")}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
            Attention
          </p>
          <p className="mt-1 text-base font-semibold">
            {blockerCount > 0
              ? `${blockerCount} ${blockerCount === 1 ? "blocker" : "blockers"} to clear`
              : "No active blockers"}
          </p>
          <p className="mt-1">
            {blockerCount > 0
              ? "Use the lanes below to open the canonical record that owns the next fix."
              : "Commercial, scheduling, and billing signals are currently clear."}
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2 xl:grid-cols-5">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className={[
              "border-0 px-4 py-3 text-sm leading-6",
              getCommandSummaryToneClassName(item.tone)
            ].join(" ")}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
              {item.label}
            </p>
            <p className="mt-1 font-semibold">{item.value}</p>
            <p className="mt-1 opacity-80">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function getOperationalSeverityClassName(severity: ProjectOperationalSeverity) {
  switch (severity) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

function ProjectOperationalIntelligenceSection({
  summary
}: {
  summary: ProjectOperationalWorkspaceSummary;
}) {
  const hasAttention = summary.attentionSignals.length > 0;
  const financeFacts = [
    {
      label: "Contract value",
      value: formatMoney(summary.financial.contractValue),
      detail: "Approved estimate value"
    },
    {
      label: "Approved CO impact",
      value: formatMoney(summary.financial.approvedChangeOrderImpact),
      detail: `${summary.changeOrders.openReviewCount} open review`
    },
    {
      label: "Invoiced",
      value: formatMoney(summary.financial.invoicedAmount),
      detail: `${formatMoney(summary.financial.outstandingBalance)} outstanding`
    },
    {
      label: "Paid",
      value: formatMoney(summary.financial.paidAmount),
      detail: summary.financial.paymentRiskLabel
    },
    {
      label: "Overdue",
      value: formatMoney(summary.financial.overdueExposure),
      detail: `${formatMoney(summary.financial.unpaidDepositAmount)} unpaid deposit`
    },
    {
      label: "Retainage / SOV",
      value: formatMoney(summary.financial.retainageHeldAmount),
      detail: `${formatMoney(summary.financial.progressBillingExposure)} billable progress`
    }
  ];
  const operatingFacts = [
    {
      label: "Schedule",
      value: `${summary.schedule.scheduledJobCount} scheduled / ${summary.schedule.unscheduledJobCount} unscheduled`,
      detail: `${summary.schedule.missingCrewJobCount} missing crew`
    },
    {
      label: "Execution",
      value: `${summary.execution.dailyLogCount} Daily Logs`,
      detail: `${summary.execution.openBlockerCount} open field blockers`
    },
    {
      label: "Labor",
      value: formatDuration(summary.execution.totalWorkedMinutes),
      detail: `${summary.execution.unresolvedFieldNoteCount} open field notes`
    },
    {
      label: "Change orders",
      value: `${summary.changeOrders.openReviewCount} open`,
      detail: `${formatMoney(summary.changeOrders.pendingImpact)} pending impact`
    }
  ];

  return (
    <section
      id="project-operational-intelligence"
      aria-labelledby="project-operational-intelligence-title"
      className={projectWorkspacePanelClassName}
    >
      <div
        className={[
          "flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between sm:px-5",
          projectWorkspacePanelHeaderClassName
        ].join(" ")}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Operational intelligence
          </p>
          <h2
            id="project-operational-intelligence-title"
            className="mt-1 text-lg font-semibold text-[var(--text-primary)]"
          >
            What needs action, what is at risk, and what is moving
          </h2>
          <p className="mt-1 max-w-[76ch] text-sm leading-6 text-[var(--text-secondary)]">
            Derived from the same project readiness, invoice/payment, job, Daily
            Log, field note, change-order, and timeline records already powering
            the focused workspaces.
          </p>
        </div>
        <Link
          href={summary.schedule.nextActionHref}
          className={getWorkspaceActionLinkClassName(
            hasAttention ? "warning" : "secondary"
          )}
        >
          {summary.schedule.nextActionLabel}
        </Link>
      </div>

      <div className="grid gap-px bg-[var(--border-warm)] xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Attention system
              </p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {hasAttention
                  ? `${summary.attentionSignals.length} signal${
                      summary.attentionSignals.length === 1 ? "" : "s"
                    } to resolve`
                  : "No active operational attention signals"}
              </h3>
            </div>
            <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Project-owned view
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {hasAttention ? (
              summary.attentionSignals.map((signal) => (
                <article
                  key={signal.id}
                  className={[
                    "rounded-lg border px-4 py-3 text-sm leading-6",
                    getOperationalSeverityClassName(signal.severity)
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">
                        {signal.source}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold">
                        {signal.title}
                      </h4>
                      <p className="mt-1 opacity-85">{signal.detail}</p>
                    </div>
                    <Link
                      href={signal.href}
                      className={getWorkspaceActionLinkClassName(
                        signal.severity === "critical" ||
                          signal.severity === "warning"
                          ? "warning"
                          : "secondary"
                      )}
                    >
                      {signal.actionLabel}
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
                Readiness, billing, schedule, field, and change-order attention
                are clear in the current project read.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-px bg-[var(--border-warm)] md:grid-cols-2">
          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Financial continuity
            </p>
            <div className="mt-4 grid gap-3">
              {financeFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {fact.value}
                  </p>
                  <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Dispatch + execution continuity
            </p>
            <div className="mt-4 grid gap-3">
              {operatingFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm leading-6"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {fact.label}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text-primary)]">
                    {fact.value}
                  </p>
                  <p className="text-xs leading-5 text-[var(--text-secondary)]">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
            {summary.execution.latestDailyLogHref ? (
              <Link
                href={summary.execution.latestDailyLogHref}
                className={`${getWorkspaceActionLinkClassName("secondary")} mt-4`}
              >
                Open latest Daily Log
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCuePanel({
  cues,
  getCueStateControls
}: {
  cues: ProjectCue[];
  getCueStateControls?: (cue: ProjectCue) => ReactNode;
}) {
  const visibleCues = cues.slice(0, 4);
  const canonicalWorkflowCues = visibleCues.filter(
    (cue) => !cue.workItemBridge
  );
  const humanFollowUpCues = visibleCues.filter((cue) => cue.workItemBridge);
  const renderCueCards = (groupCues: ProjectCue[]) =>
    groupCues.map((cue) => {
      const cueDomId = cue.id.replace(/[^a-zA-Z0-9_-]/g, "-");
      const cueTitleId = `${cueDomId}-title`;
      const cueDescriptionId = `${cueDomId}-description`;
      const cueReasonId = `${cueDomId}-reason`;
      const cueStateControls = getCueStateControls?.(cue) ?? null;

      return (
        <article
          key={cue.id}
          aria-labelledby={cueTitleId}
          aria-describedby={`${cueDescriptionId} ${cueReasonId}`}
          className={[
            "rounded-lg border px-4 py-3 text-sm leading-6",
            getProjectCuePriorityClassName(cue.priority)
          ].join(" ")}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h4
                id={cueTitleId}
                className="text-sm font-semibold text-slate-950"
              >
                {cue.title}
              </h4>
              <p id={cueDescriptionId} className="mt-1 text-sm text-slate-700">
                {cue.description}
              </p>
              <p
                id={cueReasonId}
                className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                {cue.reason}
              </p>
            </div>
            <span className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Priority: {cue.priority}
            </span>
          </div>
          <div
            role="group"
            aria-label={`Actions for ${cue.title}`}
            className="mt-3 flex flex-wrap gap-2"
          >
            <Link
              href={cue.href}
              aria-label={`${cue.actionLabel} for suggested project action: ${cue.title}`}
              title={`${cue.actionLabel}: ${cue.title}`}
              aria-describedby={`${cueDescriptionId} ${cueReasonId}`}
              className={secondaryActionClassName}
            >
              {cue.actionLabel}
            </Link>
            {cue.workItemBridge ? (
              <a
                href={cue.workItemBridge.href}
                aria-label={`${cue.workItemBridge.label} from suggested project action: ${cue.title}`}
                title={`${cue.workItemBridge.label}: ${cue.title}`}
                aria-describedby={`${cueDescriptionId} ${cueReasonId}`}
                className={secondaryActionClassName}
              >
                {cue.workItemBridge.label}
              </a>
            ) : null}
            {cueStateControls}
          </div>
        </article>
      );
    });

  return (
    <section
      id="project-guidance-cues"
      aria-labelledby="project-guidance-cues-title"
      aria-describedby="project-guidance-cues-description"
      className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 sm:px-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Project guidance
          </p>
          <h3
            id="project-guidance-cues-title"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            Suggested project actions
          </h3>
          <p
            id="project-guidance-cues-description"
            className="mt-1 max-w-[68ch] text-sm leading-6 text-[var(--text-secondary)]"
          >
            Suggestions from current project records only. Canonical actions
            open the existing workflow; human follow-up can open a prefilled
            work item draft. Nothing is created or changed until you submit.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Guidance only
        </span>
      </div>

      {visibleCues.length > 0 ? (
        <div className="mt-4 space-y-4">
          {canonicalWorkflowCues.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Canonical workflow actions
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  These open existing estimate, contract, invoice, job, or
                  schedule workflows without creating side records.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {renderCueCards(canonicalWorkflowCues)}
              </div>
            </div>
          ) : null}

          {humanFollowUpCues.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Human follow-up actions
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  These can prefill internal work item drafts for coordination.
                  The work item is still user-confirmed.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {renderCueCards(humanFollowUpCues)}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          role="status"
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
        >
          No suggested project actions need review right now.
        </div>
      )}
    </section>
  );
}

function WorkflowForwardLink({
  href,
  children
}: {
  href?: string | null;
  children: string;
}) {
  if (!href) {
    return null;
  }

  return (
    <div className="pt-1">
      <Link
        href={href}
        className={getWorkspaceActionLinkClassName("secondary")}
      >
        {children}
      </Link>
    </div>
  );
}

function buildProjectScheduleHref(input: {
  projectId: string;
  projectName?: string;
  view?: "all" | "unscheduled" | "today" | "upcoming" | "in_progress";
  crew?: "all" | "assigned" | "unassigned";
  action?: "schedule" | "assign";
  jobId?: string;
}) {
  return buildScheduleHref({
    projectId: input.projectId,
    q: input.projectName?.trim().length ? input.projectName.trim() : undefined,
    view: input.view,
    crew: input.crew,
    action: input.action,
    jobId: input.jobId
  });
}

function buildProjectEstimateCreateHref(
  projectId: string,
  customerId: string,
  opportunityId?: string | null
) {
  const params = new URLSearchParams({ projectId, customerId });

  if (opportunityId) {
    params.set("opportunityId", opportunityId);
  }

  return `/estimates?${params.toString()}`;
}

function getPaymentRecordSummary(payment: ProjectPaymentListItem) {
  return `${new Date(payment.paymentDate).toLocaleDateString()} | ${formatStatusLabel(payment.status)} | ${payment.paymentMethod.replaceAll("_", " ")}`;
}

function getProjectInvoiceSummary(invoice: ProjectInvoiceListItem) {
  if (invoice.workflowRole === "deposit") {
    if (invoice.status === "paid") {
      return `Deposit satisfied | ${formatMoney(invoice.totalAmount)} collected`;
    }

    if (invoice.status === "partially_paid") {
      return `Deposit partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`;
    }

    if (invoice.status === "void") {
      return "Deposit request voided";
    }

    return `Deposit request | ${formatMoney(invoice.balanceDueAmount)} due`;
  }

  if (invoice.status === "paid") {
    return `Paid in full | ${formatMoney(invoice.totalAmount)} collected`;
  }

  if (invoice.status === "partially_paid") {
    return `Partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`;
  }

  if (invoice.status === "void") {
    return "Invoice voided";
  }

  return `Balance due ${formatMoney(invoice.balanceDueAmount)}`;
}

function getDrivingRecordKey(input: {
  nextAction: ProjectReadinessNextAction;
  approvedEstimate: ProjectEstimateListItem | null;
  latestEstimate: ProjectEstimateListItem | null;
  latestContract: ProjectContractListItem | null;
  pendingChangeOrder: ProjectChangeOrderListItem | null;
  depositInvoice: ProjectInvoiceListItem | null;
  latestOpenInvoice: ProjectInvoiceListItem | null;
  projectJobs: ProjectJobListItem[];
  unscheduledJobs: ProjectJobListItem[];
}) {
  const href =
    input.nextAction.primaryHref ?? input.nextAction.secondaryHref ?? "";

  if (href.startsWith("/estimates/") && input.latestEstimate) {
    return `estimate:${input.latestEstimate.id}`;
  }

  if (href.startsWith("/contracts?") && input.approvedEstimate) {
    return `estimate:${input.approvedEstimate.id}`;
  }

  if (href.startsWith("/contracts/") && input.latestContract) {
    return `contract:${input.latestContract.id}`;
  }

  if (href.startsWith("/change-orders/") && input.pendingChangeOrder) {
    return `change_order:${input.pendingChangeOrder.id}`;
  }

  if (href.startsWith("/invoices/")) {
    const invoice = input.depositInvoice ?? input.latestOpenInvoice;

    return invoice ? `invoice:${invoice.id}` : null;
  }

  if (href.startsWith("/jobs")) {
    const job = input.projectJobs[0] ?? null;

    return job ? `job:${job.id}` : null;
  }

  if (href.startsWith("/schedule")) {
    const job = input.unscheduledJobs[0] ?? input.projectJobs[0] ?? null;

    return job ? `job:${job.id}` : null;
  }

  return null;
}

function getProjectWorkflowDriverLabel(input: {
  nextAction: ProjectReadinessNextAction;
  approvedEstimate: ProjectEstimateListItem | null;
  latestEstimate: ProjectEstimateListItem | null;
  latestContract: ProjectContractListItem | null;
  pendingChangeOrder: ProjectChangeOrderListItem | null;
  depositInvoice: ProjectInvoiceListItem | null;
  latestOpenInvoice: ProjectInvoiceListItem | null;
  projectJobsCount: number;
  unscheduledJobsCount: number;
}) {
  const href =
    input.nextAction.primaryHref ?? input.nextAction.secondaryHref ?? "";

  if (href.startsWith("/estimates/") && input.latestEstimate) {
    return `Estimate ${input.latestEstimate.referenceNumber}`;
  }

  if (href.startsWith("/contracts?") && input.approvedEstimate) {
    return `Approved estimate ${input.approvedEstimate.referenceNumber}`;
  }

  if (href.startsWith("/contracts/") && input.latestContract) {
    return `Contract ${input.latestContract.title}`;
  }

  if (href.startsWith("/change-orders/") && input.pendingChangeOrder) {
    return `Change order ${formatStatusLabel(input.pendingChangeOrder.status)}`;
  }

  if (href.startsWith("/invoices/")) {
    const invoice = input.depositInvoice ?? input.latestOpenInvoice;

    return invoice ? `Invoice ${invoice.referenceNumber}` : "Invoice workspace";
  }

  if (href.startsWith("/jobs")) {
    return input.projectJobsCount > 0 ? "Existing job chain" : "GateKeeper";
  }

  if (href.startsWith("/schedule")) {
    return input.unscheduledJobsCount > 0
      ? `${input.unscheduledJobsCount} unscheduled ${
          input.unscheduledJobsCount === 1 ? "job" : "jobs"
        }`
      : "Schedule workspace";
  }

  return "GateKeeper";
}

function buildLinkedRecordRecencyItems(input: {
  estimates: ProjectEstimateListItem[];
  contracts: ProjectContractListItem[];
  jobs: ProjectJobListItem[];
  invoices: ProjectInvoiceListItem[];
  changeOrders: ProjectChangeOrderListItem[];
  dailyLogs: ProjectDailyLogListItem[];
  fieldNotes: ProjectFieldNoteListItem[];
  drivingRecordKey: string | null;
}) {
  const items: LinkedRecordRecencyItem[] = [];
  const pushItem = (item: Omit<LinkedRecordRecencyItem, "isDrivingRecord">) => {
    items.push({
      ...item,
      isDrivingRecord: item.recordKey === input.drivingRecordKey
    });
  };

  input.estimates.forEach((estimate) => {
    pushItem({
      id: `estimate-${estimate.id}`,
      recordKey: `estimate:${estimate.id}`,
      typeLabel: "Estimate",
      title: estimate.referenceNumber,
      href: `/estimates/${estimate.id}`,
      statusLabel: formatStatusLabel(estimate.status),
      activityLabel: joinMetaParts([
        `Total ${formatMoney(estimate.totalAmount)}`,
        formatUpdatedActivity(estimate.updatedAt)
      ]),
      timestamp: estimate.updatedAt,
      timestampLabel:
        formatUpdatedActivity(estimate.updatedAt) ?? "Updated date unavailable"
    });
  });

  input.contracts.forEach((contract) => {
    pushItem({
      id: `contract-${contract.id}`,
      recordKey: `contract:${contract.id}`,
      typeLabel: "Contract",
      title: contract.title,
      href: `/contracts/${contract.id}`,
      statusLabel: formatStatusLabel(contract.status),
      activityLabel: joinMetaParts([
        contract.sentAt
          ? `Sent ${formatDateTime(contract.sentAt)}`
          : contract.signedAt
            ? `Signed ${formatDateTime(contract.signedAt)}`
            : "Contract record",
        formatUpdatedActivity(contract.updatedAt)
      ]),
      timestamp: contract.updatedAt,
      timestampLabel:
        formatUpdatedActivity(contract.updatedAt) ?? "Updated date unavailable"
    });
  });

  input.jobs.forEach((job) => {
    pushItem({
      id: `job-${job.id}`,
      recordKey: `job:${job.id}`,
      typeLabel: "Job",
      title: job.project?.name ?? "Project job",
      href: `/jobs/${job.id}`,
      statusLabel: formatStatusLabel(job.dispatchStatus),
      activityLabel: joinMetaParts([
        job.scheduledDate
          ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
          : "Unscheduled",
        job.crewVendor?.name ?? "Crew not assigned",
        formatUpdatedActivity(job.updatedAt)
      ]),
      timestamp: job.updatedAt,
      timestampLabel:
        formatUpdatedActivity(job.updatedAt) ?? "Updated date unavailable"
    });
  });

  input.invoices.forEach((invoice) => {
    pushItem({
      id: `invoice-${invoice.id}`,
      recordKey: `invoice:${invoice.id}`,
      typeLabel:
        invoice.workflowRole === "deposit" ? "Deposit invoice" : "Invoice",
      title: invoice.referenceNumber,
      href: `/invoices/${invoice.id}`,
      statusLabel: formatStatusLabel(invoice.status),
      activityLabel: joinMetaParts([
        getProjectInvoiceSummary(invoice),
        formatUpdatedActivity(invoice.updatedAt)
      ]),
      timestamp: invoice.updatedAt,
      timestampLabel:
        formatUpdatedActivity(invoice.updatedAt) ?? "Updated date unavailable"
    });
  });

  input.changeOrders.forEach((changeOrder) => {
    pushItem({
      id: `change-order-${changeOrder.id}`,
      recordKey: `change_order:${changeOrder.id}`,
      typeLabel: "Change order",
      title: changeOrder.title,
      href: `/change-orders/${changeOrder.id}`,
      statusLabel: formatStatusLabel(changeOrder.status),
      activityLabel: joinMetaParts([
        formatMoney(changeOrder.priceAdjustment),
        changeOrder.invoice
          ? `Invoice ${changeOrder.invoice.referenceNumber}`
          : "Project scope change",
        formatUpdatedActivity(changeOrder.updatedAt)
      ]),
      timestamp: changeOrder.updatedAt,
      timestampLabel:
        formatUpdatedActivity(changeOrder.updatedAt) ??
        "Updated date unavailable"
    });
  });

  input.dailyLogs.forEach((dailyLog) => {
    pushItem({
      id: `daily-log-${dailyLog.id}`,
      recordKey: `daily_log:${dailyLog.id}`,
      typeLabel: "Daily log",
      title:
        dailyLog.summary?.trim() ||
        new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString(),
      href: `/daily-logs/${dailyLog.id}`,
      statusLabel: formatStatusLabel(dailyLog.status),
      activityLabel: joinMetaParts([
        dailyLog.job
          ? `Job ${dailyLog.job.id.slice(0, 8)}`
          : "Project-day execution",
        dailyLog.weatherSummary ?? null,
        formatUpdatedActivity(dailyLog.updatedAt)
      ]),
      timestamp: dailyLog.updatedAt,
      timestampLabel:
        formatUpdatedActivity(dailyLog.updatedAt) ?? "Updated date unavailable"
    });
  });

  input.fieldNotes.forEach((fieldNote) => {
    pushItem({
      id: `field-note-${fieldNote.id}`,
      recordKey: `field_note:${fieldNote.id}`,
      typeLabel: "Field note",
      title: fieldNote.title,
      href: fieldNote.dailyLog
        ? `/daily-logs/${fieldNote.dailyLog.id}`
        : "/daily-logs",
      statusLabel: formatStatusLabel(fieldNote.status),
      activityLabel: joinMetaParts([
        formatStatusLabel(fieldNote.noteType),
        fieldNote.job
          ? `Job ${fieldNote.job.id.slice(0, 8)}`
          : "Project field note",
        formatUpdatedActivity(fieldNote.updatedAt)
      ]),
      timestamp: fieldNote.updatedAt,
      timestampLabel:
        formatUpdatedActivity(fieldNote.updatedAt) ?? "Updated date unavailable"
    });
  });

  return items.sort((left, right) =>
    right.timestamp.localeCompare(left.timestamp)
  );
}

function getProjectInvoiceContinuitySummary(input: {
  invoice: {
    workflowRole: string;
    status: string;
    totalAmount: string;
    balanceDueAmount: string;
  };
  latestPaymentEventType: string | null;
}) {
  if (input.latestPaymentEventType === "payment_failed") {
    return "Recent customer payment attempt failed | Follow-through is still needed on the remaining balance";
  }

  if (input.latestPaymentEventType === "checkout_started") {
    return "Customer checkout is in progress | Wait for canonical payment completion before treating billing as clear";
  }

  if (input.latestPaymentEventType === "payment_succeeded") {
    return input.invoice.status === "partially_paid"
      ? input.invoice.workflowRole === "deposit"
        ? `Provider-backed deposit payment completed | ${formatMoney(input.invoice.balanceDueAmount)} still remains before the project is commercially clear`
        : `Provider-backed payment completed | ${formatMoney(input.invoice.balanceDueAmount)} still remains due`
      : input.invoice.workflowRole === "deposit"
        ? "Provider-backed deposit payment completed | Deposit readiness is now satisfied"
        : "Provider-backed payment completed | Billing is now financially settled";
  }

  if (input.latestPaymentEventType === "payment_requested") {
    return "Customer payment requested | Collections attention stays active until payment actually lands";
  }

  if (input.latestPaymentEventType === "payment_voided") {
    return "Provider-backed payment voided | The invoice has returned to an open collection state";
  }

  return getProjectInvoiceSummary(input.invoice as ProjectInvoiceListItem);
}

function getProjectContractSummary(input: {
  contract: Awaited<ReturnType<typeof listContracts>>[number];
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
}) {
  const { contract, readinessSnapshot } = input;

  if (contract.status === "signed") {
    if (readinessSnapshot?.status === "waiting_on_deposit") {
      return `Signed ${formatDateTime(contract.signedAt)} | Deposit is the next commercial gate`;
    }

    if (readinessSnapshot?.isReadyToSchedule) {
      return `Signed ${formatDateTime(contract.signedAt)} | Commercial handoff complete`;
    }

    return `Signed ${formatDateTime(contract.signedAt)} | Financial readiness continues from the project hub`;
  }

  if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
    return `Customer signed ${formatDateTime(contract.customerSignedAt)} | Waiting on contractor countersign`;
  }

  if (contract.customerViewedAt) {
    return `Customer viewed ${formatDateTime(contract.customerViewedAt)} | Signature still in progress`;
  }

  if (contract.sentAt) {
    return `Sent ${formatDateTime(contract.sentAt)} | Waiting on customer signature`;
  }

  return contract.estimate?.referenceNumber ?? "No source estimate";
}

function getMostRecentByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return (
    [...items].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    )[0] ?? null
  );
}

function buildReadinessStages(input: {
  hasOpportunity: boolean;
  projectOpportunityStatus: string | null;
  estimateCount: number;
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
}): ReadinessStageView[] {
  const {
    hasOpportunity,
    projectOpportunityStatus,
    estimateCount,
    approvedEstimateId,
    readinessSnapshot
  } = input;
  const hasApprovedEstimate = Boolean(approvedEstimateId);
  const hasContract = Boolean(readinessSnapshot?.contractId);
  const contractSigned = readinessSnapshot?.contractStatus === "signed";
  const financialReady =
    readinessSnapshot != null &&
    !readinessSnapshot.blockers.includes("deposit_required") &&
    !readinessSnapshot.blockers.includes("financing_pending") &&
    !readinessSnapshot.blockers.includes("financing_declined");

  return [
    hasOpportunity
      ? projectOpportunityStatus === "completed"
        ? {
            title: "Sales assessment",
            detail:
              "Assessment and requirements are captured on the linked opportunity record.",
            state: "complete"
          }
        : projectOpportunityStatus === "scheduled"
          ? {
              title: "Sales assessment",
              detail:
                "A site assessment is scheduled. This is sales-side scheduling, not operational crew scheduling.",
              state: "current"
            }
          : {
              title: "Sales assessment",
              detail:
                "Lead assessment context still needs completion before the handoff is fully documented.",
              state: "blocked"
            }
      : {
          title: "Sales assessment",
          detail:
            "This project is moving on a manual path with no linked opportunity record.",
          state: "complete"
        },
    hasApprovedEstimate
      ? {
          title: "Estimate approval",
          detail:
            "An approved estimate exists and commercial scope is ready to move forward.",
          state: "complete"
        }
      : estimateCount > 0
        ? {
            title: "Estimate approval",
            detail:
              "Estimate work exists, but approval is still the active blocker.",
            state:
              readinessSnapshot?.status === "waiting_on_estimate_approval"
                ? "current"
                : "blocked"
          }
        : {
            title: "Estimate approval",
            detail:
              "Create the first estimate so scope and pricing enter the canonical workflow.",
            state: "blocked"
          },
    !hasApprovedEstimate
      ? {
          title: "Contract gate",
          detail: "Contract work starts after estimate approval.",
          state: "upcoming"
        }
      : !hasContract
        ? {
            title: "Contract gate",
            detail:
              "Generate a contract from the approved estimate to continue the commercial handoff.",
            state:
              readinessSnapshot?.status === "waiting_on_contract"
                ? "current"
                : "blocked"
          }
        : contractSigned
          ? {
              title: "Contract gate",
              detail: "Contract is signed and locked on the canonical record.",
              state: "complete"
            }
          : readinessSnapshot?.status === "waiting_on_internal_approval"
            ? {
                title: "Contract gate",
                detail:
                  "Internal approval is the active gate before the contract can move out for signature.",
                state: "current"
              }
            : {
                title: "Contract gate",
                detail:
                  "Signature is still required before this work can move into operations readiness.",
                state: "current"
              },
    !hasContract
      ? {
          title: "Ready Check",
          detail:
            "Deposit and financing rules apply after the contract workflow reaches the right stage.",
          state: "upcoming"
        }
      : financialReady
        ? {
            title: "Ready Check",
            detail:
              "Deposit and financing checks are currently satisfied on the project chain.",
            state: "complete"
          }
        : readinessSnapshot?.status === "waiting_on_deposit"
          ? {
              title: "Ready Check",
              detail:
                "Deposit is the active GateKeeper check before operations can take over.",
              state: "current"
            }
          : {
              title: "Ready Check",
              detail:
                "Financing state is still preventing the project from becoming operationally ready.",
              state: "current"
            },
    readinessSnapshot?.isReadyToSchedule
      ? {
          title: "Ready to schedule",
          detail:
            "Commercial handoff is complete. This marks operational eligibility, not a calendar booking.",
          state: "complete"
        }
      : {
          title: "Ready to schedule",
          detail:
            "Operations should not schedule or create downstream work until the current blockers are cleared.",
          state: "blocked"
        }
  ];
}

function buildProjectLifecycleSteps(input: {
  hasOpportunity: boolean;
  hasEstimate: boolean;
  hasApprovedEstimate: boolean;
  hasContract: boolean;
  hasSignedContract: boolean;
  hasJob: boolean;
  hasInvoice: boolean;
  hasPayment: boolean;
}): WorkflowStep[] {
  const orderedSteps: Array<{
    id: LifecycleStepId;
    label: string;
    complete: boolean;
    started: boolean;
    description: string;
  }> = [
    {
      id: "opportunity",
      label: "Opportunity",
      complete: true,
      started: input.hasOpportunity,
      description: input.hasOpportunity
        ? "Linked opportunity context started this commercial path."
        : "Manual project path; no linked opportunity is required to continue."
    },
    {
      id: "customer-project",
      label: "Customer / project",
      complete: input.hasEstimate,
      started: true,
      description: input.hasEstimate
        ? "The project is carrying downstream commercial and operations records."
        : "The project is the current hub before estimating starts."
    },
    {
      id: "estimate-contract",
      label: "Estimate / contract",
      complete: input.hasSignedContract,
      started: input.hasEstimate || input.hasContract,
      description: input.hasSignedContract
        ? "Approved scope has moved through the signed contract gate."
        : input.hasContract
          ? "Contract exists; signature or internal approval is still the active handoff."
          : input.hasApprovedEstimate
            ? "Approved estimate is ready for contract generation."
            : input.hasEstimate
              ? "Estimate exists and still needs approval before contract work."
              : "Create an estimate to start the commercial handoff."
    },
    {
      id: "job-schedule",
      label: "Job / schedule",
      complete: input.hasInvoice,
      started: input.hasJob,
      description: input.hasInvoice
        ? "Execution has produced billable invoice context."
        : input.hasJob
          ? "Job exists; schedule and crew continuity are the operations focus."
          : "Create the job after readiness clears, then schedule it."
    },
    {
      id: "invoice-payment",
      label: "Invoice / payment",
      complete: input.hasPayment,
      started: input.hasInvoice,
      description: input.hasPayment
        ? "Payment activity is recorded on the invoice/payment chain."
        : input.hasInvoice
          ? "Invoice exists; collection is the next financial follow-through."
          : "Invoices follow deposit rules, billable work, or completed execution."
    }
  ];
  const firstIncompleteIndex = orderedSteps.findIndex((step) => !step.complete);
  const currentIndex =
    firstIncompleteIndex === -1
      ? orderedSteps.length - 1
      : orderedSteps[firstIncompleteIndex].started
        ? firstIncompleteIndex
        : Math.max(firstIncompleteIndex - 1, 0);
  const nextIndex =
    firstIncompleteIndex === -1
      ? -1
      : orderedSteps[firstIncompleteIndex].started
        ? firstIncompleteIndex + 1
        : firstIncompleteIndex;

  return orderedSteps.map((step, index) => ({
    id: step.id,
    label: step.label,
    description:
      index === currentIndex
        ? `Current: ${step.description}`
        : index === nextIndex
          ? `Next: ${step.description}`
          : step.description,
    state: step.complete
      ? "complete"
      : index === currentIndex
        ? "current"
        : index === nextIndex
          ? "next"
          : "upcoming"
  }));
}

function getNextAction(input: {
  projectId: string;
  customerId: string;
  opportunityId: string | null;
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  projectEstimatesCount: number;
  projectContractsCount: number;
  latestEstimate: ProjectEstimateListItem | null;
  latestContract: ProjectContractListItem | null;
  latestOpenInvoice: ProjectInvoiceListItem | null;
  pendingChangeOrder: ProjectChangeOrderListItem | null;
  projectJobsCount: number;
  projectInvoicesCount: number;
  firstJobId: string | null;
  unscheduledJobsCount: number;
  activeJobsCount: number;
  hasCompletedJobWithoutInvoice: boolean;
  completedJobWithoutInvoiceId: string | null;
  depositInvoice: ProjectInvoiceListItem | null;
  depositLatestPaymentEventType: string | null;
}): ProjectReadinessNextAction {
  const {
    projectId,
    customerId,
    opportunityId,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount,
    projectContractsCount,
    latestEstimate,
    latestContract,
    latestOpenInvoice,
    pendingChangeOrder,
    projectJobsCount,
    projectInvoicesCount,
    firstJobId,
    unscheduledJobsCount,
    activeJobsCount,
    hasCompletedJobWithoutInvoice,
    completedJobWithoutInvoiceId,
    depositInvoice,
    depositLatestPaymentEventType
  } = input;

  if (projectEstimatesCount === 0) {
    return {
      title: "Create your estimate",
      description:
        "Start the project estimate so scope, pricing, and downstream records stay connected to this project.",
      primaryLabel: "Create estimate",
      primaryHref: buildProjectEstimateCreateHref(
        projectId,
        customerId,
        opportunityId
      ),
      blockerCopy:
        "No estimate exists yet, so contract, job, invoice, and payment work should wait."
    };
  }

  if (latestEstimate?.status === "draft" && !approvedEstimateId) {
    return {
      title: "Review and send estimate",
      description:
        "A draft estimate exists. Review the existing estimate workspace, then send or approve through the current estimate flow.",
      primaryLabel: "Review and send estimate",
      primaryHref: `/estimates/${latestEstimate.id}/edit`,
      secondaryLabel: "Review estimate",
      secondaryHref: `/estimates/${latestEstimate.id}`,
      blockerCopy:
        "Approval, contract generation, and downstream work stay blocked until the estimate is sent and approved."
    };
  }

  if (latestEstimate?.status === "sent" && !approvedEstimateId) {
    return {
      title: "Review and send estimate",
      description:
        "The estimate has been sent for customer review. Keep follow-up anchored to the existing estimate record until approval is recorded.",
      primaryLabel: "Review estimate",
      primaryHref: `/estimates/${latestEstimate.id}`,
      blockerCopy:
        "Contract generation and scheduling should wait until the estimate is approved."
    };
  }

  if (latestEstimate?.status === "rejected" && !approvedEstimateId) {
    return {
      title: "Review and send estimate",
      description:
        "The latest estimate was rejected. Revise the existing estimate or start a new project estimate before moving into contract or operations work.",
      primaryLabel: "Review and send estimate",
      primaryHref: `/estimates/${latestEstimate.id}/edit`,
      secondaryLabel: "Start new estimate",
      secondaryHref: buildProjectEstimateCreateHref(
        projectId,
        customerId,
        opportunityId
      ),
      blockerCopy:
        "A rejected estimate cannot generate the canonical contract or billing chain."
    };
  }

  if (
    readinessSnapshot?.status === "waiting_on_estimate_approval" &&
    !approvedEstimateId
  ) {
    return {
      title: "Review and send estimate",
      description:
        "Estimate work exists on the same project chain, but approval is still the active gate before contracts or readiness can move forward.",
      primaryLabel: "Review and send estimate",
      primaryHref: readinessSnapshot.estimateId
        ? `/estimates/${readinessSnapshot.estimateId}`
        : buildProjectEstimateCreateHref(projectId, customerId, opportunityId),
      blockerCopy:
        "The project cannot move to contract or scheduling until estimate approval is recorded."
    };
  }

  if (projectContractsCount === 0 && approvedEstimateId) {
    return {
      title: "Generate contract",
      description:
        "An approved estimate exists, so the next step is creating the canonical contract from the same commercial context instead of branching into a separate workflow.",
      primaryLabel: "Generate contract",
      primaryHref: `/contracts?estimateId=${approvedEstimateId}`,
      secondaryLabel: "Review approved estimate",
      secondaryHref: `/estimates/${approvedEstimateId}`,
      blockerCopy:
        "No contract exists yet, so signature readiness and downstream operations remain blocked."
    };
  }

  if (latestContract?.status === "draft") {
    return {
      title: "Send for signature",
      description:
        latestContract.internalApprovalStatus === "pending"
          ? "The contract exists, but internal approval is still pending before it can be sent for signature."
          : "The contract exists as a draft. Review the contract workspace and use the existing send/signature readiness controls there.",
      primaryLabel: "Send for signature",
      primaryHref: `/contracts/${latestContract.id}`,
      blockerCopy:
        latestContract.internalApprovalStatus === "pending"
          ? "Send-for-signature is blocked until internal approval is complete."
          : "Customer signature work starts from the contract workspace; this project hub does not bypass that flow."
    };
  }

  if (
    readinessSnapshot?.status === "waiting_on_internal_approval" ||
    readinessSnapshot?.status === "waiting_on_signature"
  ) {
    return {
      title: "Send for signature",
      description:
        readinessSnapshot.status === "waiting_on_internal_approval"
          ? "Internal approval still blocks send readiness on the canonical contract record."
          : "Signature still blocks the downstream operations handoff.",
      primaryLabel: "Send for signature",
      primaryHref: readinessSnapshot.contractId
        ? `/contracts/${readinessSnapshot.contractId}`
        : "/contracts",
      blockerCopy:
        readinessSnapshot.status === "waiting_on_internal_approval"
          ? "The contract cannot be sent until internal approval is complete."
          : "Operations should wait until the required signature gate is complete."
    };
  }

  if (
    latestContract &&
    (latestContract.status === "sent" || latestContract.status === "viewed")
  ) {
    return {
      title: "Send for signature",
      description:
        latestContract.status === "viewed"
          ? "The customer has viewed the contract, but signature is still pending on the canonical contract record."
          : "The contract has been sent for signature. Keep signature follow-up on the existing contract record.",
      primaryLabel: "Send for signature",
      primaryHref: `/contracts/${latestContract.id}`,
      blockerCopy:
        "Jobs, invoices, and payment collection should wait until the configured contract signature gate is clear."
    };
  }

  if (readinessSnapshot?.status === "waiting_on_deposit") {
    return readinessSnapshot.depositInvoiceId
      ? {
          title:
            depositLatestPaymentEventType === "payment_failed"
              ? "Requires follow-up: resolve the failed deposit payment"
              : depositLatestPaymentEventType === "checkout_started"
                ? "Requires follow-up: wait for deposit payment completion"
                : depositLatestPaymentEventType === "payment_succeeded" &&
                    depositInvoice?.status === "partially_paid"
                  ? "Requires follow-up: close the remaining deposit balance"
                  : depositLatestPaymentEventType === "payment_requested"
                    ? "Requires follow-up: monitor the requested deposit payment"
                    : depositLatestPaymentEventType === "payment_voided"
                      ? "Blocked: restart deposit collection after the void"
                      : depositInvoice?.status === "partially_paid"
                        ? "Requires follow-up: close the remaining deposit balance"
                        : "Blocked: collect the deposit",
          description:
            depositLatestPaymentEventType === "payment_failed"
              ? `A customer payment attempt failed on the deposit invoice, so ${formatMoney(
                  depositInvoice?.balanceDueAmount ?? "0"
                )} still needs follow-through before the commercial handoff is complete.`
              : depositLatestPaymentEventType === "checkout_started"
                ? "A customer has already entered checkout for the deposit invoice. Keep attention on the payment outcome before taking the project forward."
                : depositLatestPaymentEventType === "payment_succeeded" &&
                    depositInvoice?.status === "partially_paid"
                  ? `A provider-backed deposit payment has landed, but ${formatMoney(
                      depositInvoice.balanceDueAmount
                    )} still needs to clear before the commercial handoff is complete.`
                  : depositLatestPaymentEventType === "payment_requested"
                    ? "Customer-facing payment has already been requested on the deposit invoice, so the active work is following that request through."
                    : depositLatestPaymentEventType === "payment_voided"
                      ? `The latest provider-backed payment on the deposit invoice was voided, so ${formatMoney(
                          depositInvoice?.balanceDueAmount ?? "0"
                        )} is open again before the commercial handoff can complete.`
                      : depositInvoice?.status === "partially_paid"
                        ? `A deposit payment has already been recorded, but ${formatMoney(
                            depositInvoice.balanceDueAmount
                          )} still needs to clear before the commercial handoff is complete.`
                        : "A deposit invoice exists, but the commercial handoff will stay blocked until that invoice is paid.",
          primaryLabel: "Review deposit invoice",
          primaryHref: `/invoices/${readinessSnapshot.depositInvoiceId}`,
          blockerCopy:
            "Scheduling stays blocked until the required deposit is satisfied."
        }
      : {
          title: "Blocked: create the deposit request",
          description:
            "The organization requires a deposit before operations can schedule this work on the same project chain.",
          primaryLabel: "Create deposit invoice",
          primaryHref: `/invoices?projectId=${projectId}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`,
          blockerCopy:
            "Deposit collection cannot start until a deposit invoice is created from the existing project and approved-estimate context."
        };
  }

  if (readinessSnapshot?.status === "waiting_on_financing") {
    return {
      title: "Blocked: resolve financing readiness",
      description:
        "Financing status is still blocking the operations handoff. Update the project financing state once the commercial outcome is known.",
      secondaryLabel: "Edit project financing below",
      blockerCopy:
        "Operations should wait until financing is approved or no longer required."
    };
  }

  if (pendingChangeOrder) {
    return {
      title:
        pendingChangeOrder.status === "draft"
          ? "Next: finish the draft change order"
          : "Next: follow up on the sent change order",
      description:
        pendingChangeOrder.status === "draft"
          ? "A draft change order is open on this project. Finish or resolve that scope change before treating the current commercial chain as settled."
          : "A sent change order is waiting on customer decision. Keep the scope adjustment on the same canonical change-order record.",
      primaryLabel: "Review change order",
      primaryHref: `/change-orders/${pendingChangeOrder.id}`,
      blockerCopy:
        pendingChangeOrder.status === "draft"
          ? "Draft scope changes can confuse billing and field handoff if they are left unresolved."
          : "Approved change-order scope should be resolved before billing or closeout decisions depend on it."
    };
  }

  if (readinessSnapshot?.isReadyToSchedule) {
    if (projectJobsCount === 0) {
      return {
        title: "Create job",
        description:
          "Commercial handoff is complete, but no job exists yet. Create the operational job from the existing project context.",
        primaryLabel: "Create job",
        primaryHref: `/jobs?projectId=${projectId}`,
        secondaryLabel: "Open schedule",
        secondaryHref: `/schedule?projectId=${projectId}`,
        blockerCopy:
          "Scheduling cannot assign real work until a canonical job exists."
      };
    }

    if (unscheduledJobsCount > 0) {
      return {
        title: "Schedule job",
        description:
          unscheduledJobsCount === 1
            ? "One job exists but is still unscheduled. Use the schedule workspace to place it on the calendar and coordinate crew."
            : `${unscheduledJobsCount} jobs exist but are still unscheduled. Use the schedule workspace to place them on the calendar and coordinate crew.`,
        primaryLabel: "Open schedule",
        primaryHref: `/schedule?projectId=${projectId}`,
        blockerCopy:
          "Field execution is not fully planned until the project jobs have schedule commitments."
      };
    }

    if (hasCompletedJobWithoutInvoice) {
      return {
        title: "Create invoice",
        description:
          "A completed job exists without a connected invoice. Create billing from the same project and job context so payment stays tied to completed work.",
        primaryLabel: "Create invoice",
        primaryHref: completedJobWithoutInvoiceId
          ? `/invoices?projectId=${projectId}&jobId=${completedJobWithoutInvoiceId}`
          : `/invoices?projectId=${projectId}`,
        blockerCopy:
          "Payment follow-up cannot start until completed work is represented by a canonical invoice."
      };
    }

    if (projectJobsCount > 0 && projectInvoicesCount === 0) {
      return {
        title: "Create invoice",
        description:
          "A job exists and no invoice is connected yet. Use the existing invoice flow to confirm the valid billing trigger and keep billing tied to this project.",
        primaryLabel: "Create invoice",
        primaryHref: firstJobId
          ? `/invoices?projectId=${projectId}&jobId=${firstJobId}`
          : `/invoices?projectId=${projectId}`,
        blockerCopy:
          "Invoices follow completed or otherwise billable work; the invoice workflow still enforces that guardrail."
      };
    }

    if (activeJobsCount > 0) {
      return {
        title: "Monitor active field work",
        description:
          "Execution is underway. Keep job updates, daily logs, punchlist work, and billing handoff tied to this project chain.",
        primaryLabel: "Open jobs",
        primaryHref: `/jobs?projectId=${projectId}`
      };
    }

    if (latestOpenInvoice) {
      return {
        title:
          latestOpenInvoice.status === "draft"
            ? "Next: finish the draft invoice"
            : "Next: follow open payment",
        description:
          latestOpenInvoice.status === "draft"
            ? "A draft invoice exists on this project. Finish and send it before payment follow-up starts."
            : `${formatMoney(latestOpenInvoice.balanceDueAmount)} remains open on the latest project invoice.`,
        primaryLabel: "Review invoice",
        primaryHref: `/invoices/${latestOpenInvoice.id}`,
        secondaryLabel: "Open payments",
        secondaryHref: "/payments",
        blockerCopy:
          latestOpenInvoice.status === "draft"
            ? "Payment collection should wait until the invoice is sent or otherwise finalized."
            : "Payment is not complete while the invoice still has an open balance."
      };
    }

    return {
      title: "Schedule project work",
      description:
        "This project is ready for operational scheduling. Operations can take over next while staying on the same project, job, time, and billing chain.",
      primaryLabel: "Open schedule",
      primaryHref: `/schedule?projectId=${projectId}`,
      secondaryLabel: "Create job",
      secondaryHref: `/jobs?projectId=${projectId}`
    };
  }

  return {
    title: "Requires follow-up: review the commercial chain",
    description:
      "Use the blocker list and readiness stages above to clear the next gate in order, rather than jumping ahead into disconnected downstream work.",
    blockerCopy:
      "No supported downstream action is available until the current commercial blocker is resolved."
  };
}

function buildWorkspaceActions(input: {
  primaryAction: ProjectReadinessNextAction;
  projectId: string;
  approvedEstimateId: string | null;
  projectJobsCount: number;
  unscheduledJobsCount: number;
  jobsWithoutCrewCount: number;
  hasCompletedJobWithoutInvoice: boolean;
  completedJobWithoutInvoiceId: string | null;
  unresolvedPunchlistCount: number;
  openInvoiceCount: number;
  activeAppointmentCount: number;
  isReadyToSchedule: boolean;
  hasProgressBillingInvoiceGap: boolean;
}): WorkspaceActionItem[] {
  const actions: WorkspaceActionItem[] = [];
  const pushUniqueAction = (action: WorkspaceActionItem) => {
    if (
      actions.some(
        (existing) =>
          existing.title === action.title &&
          (existing.href ?? null) === (action.href ?? null)
      )
    ) {
      return;
    }

    actions.push(action);
  };

  pushUniqueAction({
    title: input.primaryAction.title,
    description: input.primaryAction.description,
    label: input.primaryAction.primaryLabel,
    href: input.primaryAction.primaryHref,
    tone: "primary"
  });

  if (input.isReadyToSchedule && input.projectJobsCount === 0) {
    pushUniqueAction({
      title: "Create the first job",
      description:
        "Commercial readiness is clear, but execution has not started on the canonical job chain yet.",
      label: "Create job",
      href: `/jobs?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.unscheduledJobsCount > 0) {
    pushUniqueAction({
      title: "Assign crew and schedule work",
      description:
        input.unscheduledJobsCount === 1
          ? "One canonical job is still unscheduled."
          : `${input.unscheduledJobsCount} canonical jobs are still unscheduled.`,
      label: "Open schedule",
      href: `/schedule?projectId=${input.projectId}`,
      tone: "warning"
    });
  }

  if (input.jobsWithoutCrewCount > 0) {
    pushUniqueAction({
      title: "Tighten crew assignments",
      description:
        input.jobsWithoutCrewCount === 1
          ? "One active project job still has no crew vendor assigned."
          : `${input.jobsWithoutCrewCount} active project jobs still have no crew vendor assigned.`,
      label: "Review jobs",
      href: `/jobs?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.activeAppointmentCount === 0) {
    pushUniqueAction({
      title: "Add the next appointment",
      description:
        "Site visits, follow-up meetings, and estimate appointments should stay visible on the project chain.",
      label: "Create appointment",
      href: `/appointments?projectId=${input.projectId}&compose=1#appointment-create`,
      tone: "secondary"
    });
  }

  if (input.hasCompletedJobWithoutInvoice) {
    pushUniqueAction({
      title: "Invoice completed work",
      description:
        "A completed job exists on this project, but billing has not been tied back to it yet.",
      label: "Create invoice",
      href: input.completedJobWithoutInvoiceId
        ? `/invoices?projectId=${input.projectId}&jobId=${input.completedJobWithoutInvoiceId}`
        : `/invoices?projectId=${input.projectId}`,
      tone: "warning"
    });
  }

  if (input.openInvoiceCount > 0) {
    pushUniqueAction({
      title: "Follow open billing",
      description:
        input.openInvoiceCount === 1
          ? "One invoice on this project still has an open balance."
          : `${input.openInvoiceCount} invoices on this project still have open balances.`,
      label: "Open payments",
      href: "/payments",
      tone: "secondary"
    });
  }

  if (input.unresolvedPunchlistCount > 0) {
    pushUniqueAction({
      title: "Close remaining punchlist work",
      description:
        input.unresolvedPunchlistCount === 1
          ? "One punchlist item is still open on this project."
          : `${input.unresolvedPunchlistCount} punchlist items are still open on this project.`,
      label: "Review punchlists",
      href: `/punchlists?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.hasProgressBillingInvoiceGap && input.approvedEstimateId) {
    pushUniqueAction({
      title: "Turn current billable progress into an invoice",
      description:
        "Progress billing exists on the SOV chain, but no connected invoice has been created from the current billable value yet.",
      label: "Open progress billing",
      href: "/progress-billing",
      tone: "secondary"
    });
  }

  return actions.slice(0, 5);
}

function buildReadinessBlockerItems(input: {
  projectId: string;
  customerId: string;
  opportunityId: string | null;
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  activeBlockers: NonNullable<ProjectFinancialReadinessSnapshot>["blockers"];
  latestEstimate: ProjectEstimateListItem | null;
  latestContract: ProjectContractListItem | null;
  depositInvoice: ProjectInvoiceListItem | null;
  latestOpenInvoice: ProjectInvoiceListItem | null;
  pendingChangeOrder: ProjectChangeOrderListItem | null;
  unscheduledJobs: ProjectJobListItem[];
  hasCompletedJobWithoutInvoice: boolean;
  completedJobWithoutInvoiceId: string | null;
  hasProgressBillingInvoiceGap: boolean;
  openFieldBlocker: ProjectFieldNoteListItem | null;
}) {
  const items: ProjectReadinessBlockerItem[] = [];
  const pushUnique = (item: ProjectReadinessBlockerItem) => {
    if (items.some((existing) => existing.id === item.id)) {
      return;
    }

    items.push(item);
  };

  for (const blocker of input.activeBlockers) {
    switch (blocker) {
      case "site_assessment_incomplete":
        pushUnique({
          id: blocker,
          title: "Complete the sales assessment",
          detail: formatBlockerLabel(blocker),
          href: input.opportunityId
            ? `/leads/${input.opportunityId}`
            : undefined,
          actionLabel: input.opportunityId ? "Open opportunity" : undefined,
          tone: "blocked"
        });
        break;
      case "estimate_not_approved":
        pushUnique({
          id: blocker,
          title: "Approve the project estimate",
          detail: formatBlockerLabel(blocker),
          href: input.readinessSnapshot?.estimateId
            ? `/estimates/${input.readinessSnapshot.estimateId}`
            : input.latestEstimate
              ? `/estimates/${input.latestEstimate.id}`
              : buildProjectEstimateCreateHref(
                  input.projectId,
                  input.customerId,
                  input.opportunityId
                ),
          actionLabel:
            input.readinessSnapshot?.estimateId || input.latestEstimate
              ? "Open estimate"
              : "Create estimate",
          tone: "blocked"
        });
        break;
      case "contract_missing":
        pushUnique({
          id: blocker,
          title: "Generate the contract",
          detail: formatBlockerLabel(blocker),
          href: input.approvedEstimateId
            ? `/contracts?estimateId=${input.approvedEstimateId}`
            : undefined,
          actionLabel: input.approvedEstimateId
            ? "Generate contract"
            : undefined,
          tone: "blocked"
        });
        break;
      case "contract_internal_approval_pending":
      case "contract_signature_pending":
        pushUnique({
          id: blocker,
          title:
            blocker === "contract_internal_approval_pending"
              ? "Clear contract approval"
              : "Complete contract signature",
          detail: formatBlockerLabel(blocker),
          href: input.readinessSnapshot?.contractId
            ? `/contracts/${input.readinessSnapshot.contractId}`
            : input.latestContract
              ? `/contracts/${input.latestContract.id}`
              : undefined,
          actionLabel: "Open contract",
          tone: "blocked"
        });
        break;
      case "deposit_required":
        pushUnique({
          id: blocker,
          title: input.depositInvoice
            ? "Collect the required deposit"
            : "Create the deposit invoice",
          detail: formatBlockerLabel(blocker),
          href: input.depositInvoice
            ? `/invoices/${input.depositInvoice.id}`
            : `/invoices?projectId=${input.projectId}&estimateId=${input.approvedEstimateId ?? ""}&workflowRole=deposit`,
          actionLabel: input.depositInvoice
            ? "Open deposit invoice"
            : "Create deposit invoice",
          tone: "blocked"
        });
        break;
      case "financing_pending":
      case "financing_declined":
        pushUnique({
          id: blocker,
          title:
            blocker === "financing_declined"
              ? "Resolve declined financing"
              : "Resolve financing readiness",
          detail: formatBlockerLabel(blocker),
          href: "#project-details",
          actionLabel: "Edit project financing",
          tone: "blocked"
        });
        break;
      default:
        pushUnique({
          id: blocker,
          title: formatStatusLabel(blocker),
          detail: formatBlockerLabel(blocker),
          tone: "blocked"
        });
    }
  }

  if (input.pendingChangeOrder) {
    pushUnique({
      id: `change-order:${input.pendingChangeOrder.id}`,
      title: "Resolve pending change order",
      detail:
        input.pendingChangeOrder.status === "draft"
          ? "A draft change order is still open on this project."
          : "A sent change order is waiting on customer decision.",
      href: `/change-orders/${input.pendingChangeOrder.id}`,
      actionLabel: "Open change order",
      tone: "warning"
    });
  }

  if (input.unscheduledJobs.length > 0) {
    pushUnique({
      id: "unscheduled-jobs",
      title:
        input.unscheduledJobs.length === 1
          ? "Schedule the project job"
          : "Schedule project jobs",
      detail:
        input.unscheduledJobs.length === 1
          ? "One canonical job exists but has no schedule commitment yet."
          : `${input.unscheduledJobs.length} canonical jobs still need schedule placement.`,
      href: buildProjectScheduleHref({
        projectId: input.projectId,
        view: "unscheduled",
        action: "schedule",
        jobId:
          input.unscheduledJobs.length === 1
            ? input.unscheduledJobs[0].id
            : undefined
      }),
      actionLabel: "Open schedule",
      tone: "warning"
    });
  }

  if (input.latestOpenInvoice) {
    pushUnique({
      id: `open-invoice:${input.latestOpenInvoice.id}`,
      title: "Follow open invoice balance",
      detail: getProjectInvoiceSummary(input.latestOpenInvoice),
      href: `/invoices/${input.latestOpenInvoice.id}`,
      actionLabel: "Open invoice",
      tone: "warning"
    });
  }

  if (input.hasCompletedJobWithoutInvoice) {
    pushUnique({
      id: "completed-job-without-invoice",
      title: "Create invoice for completed work",
      detail:
        "A completed job exists without a connected canonical invoice yet.",
      href: input.completedJobWithoutInvoiceId
        ? `/invoices?projectId=${input.projectId}&jobId=${input.completedJobWithoutInvoiceId}`
        : `/invoices?projectId=${input.projectId}`,
      actionLabel: "Create invoice",
      tone: "warning"
    });
  }

  if (input.hasProgressBillingInvoiceGap) {
    pushUnique({
      id: "progress-billing-invoice-gap",
      title: "Review progress billing invoice gap",
      detail:
        "Progress billing has current billable value, but no connected progress invoice exists yet.",
      href: "/progress-billing",
      actionLabel: "Open progress billing",
      tone: "warning"
    });
  }

  if (input.openFieldBlocker) {
    pushUnique({
      id: `field-blocker:${input.openFieldBlocker.id}`,
      title: "Review open field blocker",
      detail: input.openFieldBlocker.title,
      href: input.openFieldBlocker.dailyLog
        ? `/daily-logs/${input.openFieldBlocker.dailyLog.id}#job-notes`
        : "/daily-logs",
      actionLabel: "Open daily log",
      tone: "warning"
    });
  }

  return items;
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/projects/${projectId}`);
  const [
    project,
    customers,
    estimates,
    contracts,
    jobs,
    invoices,
    projectOpportunity,
    projectChangeOrders,
    projectAppointments,
    projectPunchlistItems,
    projectProgressBilling,
    gateKeeperMemory
  ] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices(),
    getOpportunityByProjectId(projectId, `/projects/${projectId}`),
    listProjectChangeOrders(projectId, `/projects/${projectId}`),
    listAppointmentsByProject(projectId, `/projects/${projectId}`),
    listPunchlistItemsByProject(projectId, `/projects/${projectId}`),
    listProgressBillingByProject(projectId, `/projects/${projectId}`),
    getGateKeeperSubjectMemory({
      subjectType: "project",
      subjectId: projectId,
      limit: 6
    })
  ]);

  if (!project) {
    notFound();
  }

  const customerPortalAccessGrants = project.customerId
    ? await listPortalAccessGrantsByCustomer(
        project.customerId,
        `/projects/${projectId}`
      )
    : [];
  const projectPortalAccessEntries = await Promise.all(
    customerPortalAccessGrants.map(
      async (grant) =>
        [
          grant.id,
          await listPortalProjectAccessByGrantId(
            grant.id,
            `/projects/${projectId}`
          )
        ] as const
    )
  );
  const projectVisiblePortalGrants = customerPortalAccessGrants
    .map((grant) => ({
      grant,
      access:
        projectPortalAccessEntries
          .find(([grantId]) => grantId === grant.id)?.[1]
          .find((access) => access.projectId === project.id) ?? null
    }))
    .filter(({ access }) => access?.status === "active");

  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: project.organizationId,
    projectId: project.id
  });
  const workflowSettings = await getOrganizationWorkflowSettings(
    project.organizationId
  );
  const guidancePreferences = normalizeWorkflowGuidancePreferences(
    workflowSettings.workflowGuidancePreferences
  );
  const showNextBestActionGuidance =
    shouldShowNextBestActions(guidancePreferences);
  const showReadinessGuidancePanel =
    shouldShowReadinessGuidance(guidancePreferences);
  const [
    projectTimeCards,
    openTimeStates,
    projectEstimateAttachments,
    fieldNotes,
    linkedWorkItems,
    opportunityWorkItems,
    projectAttentionCues,
    people,
    projectServiceTickets,
    projectWarrantyDocuments
  ] = await Promise.all([
    listTimeCardsByProject(project.id, `/projects/${projectId}`),
    listOpenTimeCardStates(),
    listProjectEstimateAttachments(project.id, `/projects/${projectId}`),
    listFieldNotes(),
    listWorkItemsForProject(project.id, `/projects/${projectId}`),
    projectOpportunity
      ? listWorkItemsForSource({
          sourceType: "opportunity",
          sourceId: projectOpportunity.id
        })
      : Promise.resolve([]),
    getOperationalCuesForProject({
      organizationId: project.organizationId,
      projectId: project.id,
      currentUserId: user.id
    }),
    listPeople(),
    listServiceTicketsByProject(project.id),
    listWarrantyDocumentsByProject(project.id)
  ]);
  const projectDailyLogs = await listDailyLogsByProject(
    project.id,
    `/projects/${projectId}`
  );
  const projectFieldNotes = fieldNotes.filter(
    (fieldNote) => fieldNote.projectId === project.id
  );

  const projectEstimates = estimates.filter(
    (estimate) => estimate.projectId === project.id
  );
  const estimateHandoffWorkItems = selectProjectEstimateHandoffWorkItems({
    workItems: [...linkedWorkItems, ...opportunityWorkItems],
    projectId: project.id,
    estimateIds: projectEstimates.map((estimate) => estimate.id),
    opportunityId: projectOpportunity?.id ?? null
  });
  const estimateHandoffSummary = buildProjectEstimateHandoffSummary({
    workItems: estimateHandoffWorkItems,
    nowIso: new Date().toISOString()
  });
  const approvedEstimate = projectEstimates.find(
    (estimate) => estimate.status === "approved"
  );
  const latestEstimate = getMostRecentByUpdatedAt(projectEstimates);
  const projectContracts = contracts.filter(
    (contract) => contract.projectId === project.id
  );
  const latestContract = getMostRecentByUpdatedAt(projectContracts);
  const projectContractDocuments = projectContracts.filter(
    (contract) => contract.sentPdfDownloadUrl && contract.sentPdfFileName
  );
  const projectJobs = jobs.filter((job) => job.projectId === project.id);
  const [projectJobAssignments, projectEquipmentReadiness] = await Promise.all([
    listJobAssignmentsByJobIds(
      projectJobs.map((job) => job.id),
      `/projects/${projectId}`
    ),
    getProjectEquipmentReadinessSummary(project.id, `/projects/${projectId}`)
  ]);
  const projectWorkItemAttachments = await listExecutionAttachmentsBySubjects(
    linkedWorkItems.map((workItem) => ({
      subjectType: "work_item" as const,
      subjectId: workItem.id
    })),
    `/projects/${projectId}`
  );
  const projectWorkItemAttachmentPreviews =
    await resolveExecutionAttachmentPreviews(
      projectWorkItemAttachments,
      `/projects/${projectId}`
    );
  const projectWorkItemEvidenceById = projectWorkItemAttachmentPreviews.reduce<
    Record<string, typeof projectWorkItemAttachmentPreviews>
  >((groups, attachment) => {
    const existing = groups[attachment.subjectId] ?? [];
    groups[attachment.subjectId] = [...existing, attachment];
    return groups;
  }, {});
  const projectExecutionAttachments = await listExecutionAttachmentsBySubjects(
    [
      ...projectDailyLogs.map((dailyLog) => ({
        subjectType: "daily_log" as const,
        subjectId: dailyLog.id
      })),
      ...projectFieldNotes.map((fieldNote) => ({
        subjectType: "field_note" as const,
        subjectId: fieldNote.id
      }))
    ],
    `/projects/${projectId}`,
    { includeArchived: true }
  );
  const projectPortalEvidenceGrants = await listPortalEvidenceGrantsByProject(
    project.id,
    `/projects/${projectId}`
  );
  const projectPortalEvidenceDeliveryEvents =
    await listPortalEvidenceDeliveryEventsByProject(
      project.id,
      `/projects/${projectId}`
    );
  const activeProjectExecutionAttachments = filterActiveExecutionAttachments(
    projectExecutionAttachments
  );
  const fieldTrail = deriveFieldTrailSummary({
    projectId: project.id,
    dailyLogs: projectDailyLogs,
    fieldNotes: projectFieldNotes,
    attachments: activeProjectExecutionAttachments,
    timeCards: projectTimeCards,
    jobs: projectJobs
  });
  const completedJob = projectJobs.find(
    (job) => job.dispatchStatus === "completed"
  );
  const projectOpenTimeStates = openTimeStates.filter(
    (state) => state.projectId === project.id
  );
  const projectInvoices = invoices.filter(
    (invoice) => invoice.projectId === project.id
  );
  const messageCenterTrail = await getProjectMessageCenterTrail({
    projectId: project.id,
    organizationId: project.organizationId,
    estimateIds: projectEstimates.map((estimate) => estimate.id),
    contractIds: projectContracts.map((contract) => contract.id),
    invoiceIds: projectInvoices.map((invoice) => invoice.id)
  });
  const messageCenter = deriveMessageCenterSummary({
    projectId: project.id,
    threads: messageCenterTrail.threads,
    messages: messageCenterTrail.messages,
    deliveryEvents: messageCenterTrail.deliveryEvents,
    signatureEvents: messageCenterTrail.signatureEvents,
    paymentEvents: messageCenterTrail.paymentEvents,
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      label: `Estimate ${estimate.referenceNumber}`,
      href: `/estimates/${estimate.id}`
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      label: `Contract ${contract.referenceNumber}`,
      href: `/contracts/${contract.id}`
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      label: `Invoice ${invoice.referenceNumber}`,
      href: `/invoices/${invoice.id}`
    })),
    customerAccessCount: projectVisiblePortalGrants.length
  });
  const copilotCommunicationThreadId =
    messageCenterTrail.threads.find(
      (thread) =>
        thread.subjectType === "project" && thread.subjectId === project.id
    )?.id ??
    messageCenterTrail.threads.find((thread) => thread.projectId === project.id)
      ?.id ??
    null;
  const pendingChangeOrder =
    projectChangeOrders.find(
      (changeOrder) =>
        changeOrder.status === "sent" || changeOrder.status === "draft"
    ) ?? null;
  const depositInvoice =
    (readinessSnapshot?.depositInvoiceId
      ? projectInvoices.find(
          (invoice) => invoice.id === readinessSnapshot.depositInvoiceId
        )
      : null) ??
    projectInvoices.find((invoice) => invoice.workflowRole === "deposit") ??
    null;
  const latestPaidInvoice =
    projectInvoices.find((invoice) => invoice.status === "paid") ?? null;
  const latestOpenInvoice =
    projectInvoices.find(
      (invoice) =>
        invoice.status !== "paid" &&
        invoice.status !== "void" &&
        Number(invoice.balanceDueAmount) > 0
    ) ?? null;
  const paymentContinuitySummary = depositInvoice
    ? getProjectInvoiceSummary(depositInvoice)
    : latestOpenInvoice
      ? getProjectInvoiceSummary(latestOpenInvoice)
      : latestPaidInvoice
        ? getProjectInvoiceSummary(latestPaidInvoice)
        : "No invoice payment activity yet";
  const paymentFocusInvoiceId =
    depositInvoice?.id ??
    latestOpenInvoice?.id ??
    latestPaidInvoice?.id ??
    null;
  const paymentFocusInvoice = paymentFocusInvoiceId
    ? await getInvoiceById(paymentFocusInvoiceId, `/projects/${projectId}`)
    : null;
  const paymentFocusLatestEventType =
    paymentFocusInvoice?.paymentEvents[0]?.eventType ?? null;
  const paymentFocusSummary =
    paymentFocusInvoice &&
    (depositInvoice || latestOpenInvoice || latestPaidInvoice)
      ? getProjectInvoiceContinuitySummary({
          invoice: depositInvoice ?? latestOpenInvoice ?? latestPaidInvoice!,
          latestPaymentEventType: paymentFocusLatestEventType
        })
      : paymentContinuitySummary;
  const hasInvoiceForCompletedJob = completedJob
    ? projectInvoices.some((invoice) => invoice.jobId === completedJob.id)
    : false;
  const canCreateInvoice = Boolean(completedJob) && !hasInvoiceForCompletedJob;
  const firstProjectJobId = projectJobs[0]?.id ?? null;
  const unscheduledJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const scheduledJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "scheduled"
  );
  const activeJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const jobsWithoutCrew = projectJobs.filter(
    (job) => job.dispatchStatus !== "completed" && !job.crewVendorId
  );
  const approvedEstimateId = approvedEstimate?.id ?? null;
  const completedJobId = completedJob?.id ?? null;
  const readinessStatus =
    readinessSnapshot?.status ?? project.commercialReadinessStatus;
  const readyToScheduleAt = readinessSnapshot?.isReadyToSchedule
    ? (project.readyToScheduleAt ?? new Date().toISOString())
    : project.readyToScheduleAt;
  const readinessStages = buildReadinessStages({
    hasOpportunity: Boolean(projectOpportunity),
    projectOpportunityStatus: projectOpportunity?.siteAssessmentStatus ?? null,
    estimateCount: projectEstimates.length,
    approvedEstimateId,
    readinessSnapshot
  });
  const nextAction = getNextAction({
    projectId: project.id,
    customerId: project.customerId,
    opportunityId: projectOpportunity?.id ?? null,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount: projectEstimates.length,
    projectContractsCount: projectContracts.length,
    latestEstimate,
    latestContract,
    latestOpenInvoice,
    pendingChangeOrder,
    projectJobsCount: projectJobs.length,
    projectInvoicesCount: projectInvoices.length,
    firstJobId: firstProjectJobId,
    unscheduledJobsCount: unscheduledJobs.length,
    activeJobsCount: activeJobs.length,
    hasCompletedJobWithoutInvoice: canCreateInvoice,
    completedJobWithoutInvoiceId: canCreateInvoice ? completedJobId : null,
    depositInvoice,
    depositLatestPaymentEventType:
      paymentFocusInvoice?.id === depositInvoice?.id
        ? paymentFocusLatestEventType
        : null
  });
  const activeBlockers = readinessSnapshot?.blockers ?? [];
  const unresolvedPunchlistItems = projectPunchlistItems.filter(
    (item) => item.status !== "closed"
  );
  const scheduledAppointments = projectAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const jobsWithoutAssignments = projectJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (projectJobAssignments.get(job.id)?.length ?? 0) === 0
  );
  const scheduledOrActiveJobs = [...projectJobs]
    .filter(
      (job) =>
        (job.dispatchStatus === "scheduled" ||
          job.dispatchStatus === "in_progress") &&
        job.scheduledDate
    )
    .sort(
      (left, right) =>
        getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
    );
  const latestScheduledJob =
    [...projectJobs]
      .filter((job) => job.scheduledDate)
      .sort(
        (left, right) =>
          getScheduleSummarySortValue(right) - getScheduleSummarySortValue(left)
      )[0] ?? null;
  const nextScheduledJob =
    activeJobs
      .filter((job) => job.scheduledDate)
      .sort(
        (left, right) =>
          getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ??
    scheduledOrActiveJobs[0] ??
    latestScheduledJob;
  const scheduleFocusJob = nextScheduledJob ?? latestScheduledJob ?? null;
  const scheduleFocusAssignments = scheduleFocusJob
    ? (projectJobAssignments.get(scheduleFocusJob.id) ?? [])
    : [];
  const scheduleFocusAssignmentNames = scheduleFocusAssignments
    .map(
      (assignment) =>
        assignment.person?.displayName ?? assignment.vendor?.name ?? null
    )
    .filter((value): value is string => Boolean(value));
  const scheduleFocusLabel =
    activeJobs.length > 0 ? "In progress now" : "Next scheduled job";
  const scheduleFocusSummary = scheduleFocusJob
    ? getScheduleAssignmentSummary({
        assignmentNames: scheduleFocusAssignmentNames,
        crewVendorName: scheduleFocusJob.crewVendor?.name ?? null,
        assignmentCount: scheduleFocusAssignments.length
      })
    : null;
  const openInvoices = projectInvoices.filter(
    (invoice) =>
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount) > 0
  );
  const projectScheduleHref = buildProjectScheduleHref({
    projectId: project.id,
    view:
      unscheduledJobs.length > 0
        ? "unscheduled"
        : activeJobs.length > 0
          ? "in_progress"
          : "all",
    action: unscheduledJobs.length > 0 ? "schedule" : undefined,
    jobId: unscheduledJobs.length === 1 ? unscheduledJobs[0].id : undefined
  });
  const projectProductionHub = {
    overview: {
      eyebrow: "Jobs / Scheduling / Punchlists",
      title: "Execution pressure is summarized here first",
      description:
        "Use this section to see whether the project is ready for the field, what is unscheduled, what still needs crew attention, and what closeout work is still open.",
      href: unscheduledJobs.length > 0 ? "/schedule?view=unscheduled" : "/jobs",
      linkLabel: unscheduledJobs.length > 0 ? "Open schedule" : "Open jobs",
      stat: `${projectJobs.length} jobs / ${jobsWithoutCrew.length} missing crew / ${unresolvedPunchlistItems.length} unresolved punchlists`
    },
    jobs: {
      title: "Jobs",
      items: projectJobs.slice(0, 3).map((job) => ({
        id: job.id,
        href: `/jobs/${job.id}`,
        title: job.project?.name ?? project.name,
        subtitle:
          job.customer?.name ?? project.customer?.name ?? "Unknown customer",
        meta: joinMetaParts([
          job.scheduledDate
            ? `${job.crewVendor?.name ?? "Crew not assigned"} / Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
            : `${job.crewVendor?.name ?? "Crew not assigned"} / Unscheduled`,
          formatUpdatedActivity(job.updatedAt)
        ]),
        statusLabel: formatStatusLabel(job.dispatchStatus)
      })),
      emptyState: {
        eyebrow: "No jobs",
        title: "Hold operations until the handoff is clear",
        description:
          "Jobs should stay downstream of the commercial readiness chain instead of becoming a parallel scheduling system."
      }
    },
    punchlists: {
      title: "Punchlists",
      items: projectPunchlistItems.slice(0, 3).map((item) => ({
        id: item.id,
        href: `/punchlists/${item.id}`,
        title: item.title,
        subtitle: item.assignee?.displayName ?? "Unassigned",
        meta: item.job
          ? `Job ${item.job.id.slice(0, 8)} / ${item.dueDate ? `Due ${new Date(`${item.dueDate}T00:00:00`).toLocaleDateString()}` : "No due date"}`
          : item.dueDate
            ? `Due ${new Date(`${item.dueDate}T00:00:00`).toLocaleDateString()}`
            : "Project-level closeout item",
        statusLabel: formatStatusLabel(item.status)
      })),
      emptyState: {
        eyebrow: "No punchlists",
        title: "Track closeout work here",
        description:
          "When corrective or closeout work needs to survive beyond one project day, keep it on the canonical punchlist chain.",
        actionHref: `/punchlists?projectId=${project.id}&compose=1`,
        actionLabel: "Create punchlist item"
      }
    },
    dailyExecution: {
      title: "Daily execution",
      items: projectDailyLogs.slice(0, 2).map((dailyLog) => ({
        id: dailyLog.id,
        href: `/daily-logs/${dailyLog.id}`,
        title:
          dailyLog.summary?.trim() ||
          new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString(),
        subtitle: new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString(),
        meta: joinMetaParts([
          dailyLog.job
            ? `Job ${dailyLog.job.id.slice(0, 8)} / ${dailyLog.weatherSummary ?? "No weather summary"}`
            : (dailyLog.weatherSummary ?? "Project-day execution record"),
          formatUpdatedActivity(dailyLog.updatedAt)
        ]),
        statusLabel: formatStatusLabel(dailyLog.status)
      })),
      emptyState: {
        eyebrow: "No daily logs",
        title: "Capture the first project day",
        description:
          "Daily execution records stay connected to the same project and job chain once field work begins.",
        actionHref: buildDailyLogCaptureHref({
          projectId: project.id
        }),
        actionLabel: "Start Daily Job Log"
      }
    }
  };
  const projectProductionScheduleContinuity = {
    metrics: [
      { label: "Scheduled", value: scheduledJobs.length },
      { label: "Unscheduled", value: unscheduledJobs.length },
      { label: "In progress", value: activeJobs.length },
      {
        label: "Equipment warnings",
        value: projectEquipmentReadiness.jobsWithEquipmentWarnings
      }
    ],
    focus: scheduleFocusJob
      ? {
          eyebrow:
            scheduleFocusJob.dispatchStatus === "in_progress"
              ? "Work in progress"
              : scheduleFocusLabel,
          title: project.name,
          titleHref: `/jobs/${scheduleFocusJob.id}`,
          statusLabel: formatStatusLabel(scheduleFocusJob.dispatchStatus),
          summary: formatScheduleSummaryWindow({
            scheduledDate: scheduleFocusJob.scheduledDate,
            scheduledStartAt: scheduleFocusJob.scheduledStartAt,
            scheduledEndAt: scheduleFocusJob.scheduledEndAt
          }),
          crewSummary:
            scheduleFocusAssignments.length > 0
              ? scheduleFocusSummary
              : scheduleFocusJob.dispatchStatus === "scheduled"
                ? "Scheduled, but crew assignment still needs to be confirmed"
                : scheduleFocusSummary
        }
      : null,
    notice: scheduleFocusJob
      ? null
      : {
          eyebrow:
            projectJobs.length > 0 ? "Ready for scheduling" : "No jobs yet",
          title:
            projectJobs.length > 0
              ? "Project jobs exist, but no calendar commitment is set yet"
              : "Production work has not been created yet",
          detail:
            projectJobs.length > 0
              ? "The project has canonical jobs, but they are still unscheduled. Once a real date is attached, the next production commitment will show here."
              : "Create downstream project jobs first. Schedule continuity will appear here once production work exists on the canonical job chain."
        },
    facts: [
      {
        label: "Crew assignment state",
        value:
          jobsWithoutAssignments.length > 0
            ? `${jobsWithoutAssignments.length} job${
                jobsWithoutAssignments.length === 1 ? "" : "s"
              } still need crew assignment rows`
            : projectJobs.length > 0
              ? "Crew coverage is already attached where needed"
              : "No project jobs yet"
      },
      {
        label: "Equipment readiness",
        value:
          projectEquipmentReadiness.warningCount > 0
            ? `${projectEquipmentReadiness.warningCount} advisory warning${
                projectEquipmentReadiness.warningCount === 1 ? "" : "s"
              }`
            : projectJobs.length > 0
              ? "No equipment warnings"
              : "No project jobs yet",
        detail:
          projectEquipmentReadiness.warningCount > 0
            ? projectEquipmentReadiness.jobsWithMissingRequiredEquipment > 0
              ? `${projectEquipmentReadiness.jobsWithMissingRequiredEquipment} job${
                  projectEquipmentReadiness.jobsWithMissingRequiredEquipment ===
                  1
                    ? ""
                    : "s"
                } missing required equipment`
              : "Warning-only; GateKeeper checks are unchanged"
            : undefined
      },
      {
        label: "Current handoff",
        value:
          scheduleFocusJob?.dispatchStatus === "in_progress"
            ? "Field work is already active on this project"
            : readinessSnapshot?.isReadyToSchedule
              ? unscheduledJobs.length > 0
                ? "Commercial handoff is clear and production can now be placed on the calendar"
                : "Commercial handoff is clear for schedule follow-through"
              : "Project is still upstream of operational scheduling"
      }
    ],
    actions: [
      {
        href: buildProjectScheduleHref({
          projectId: project.id,
          view:
            unscheduledJobs.length > 0
              ? "unscheduled"
              : activeJobs.length > 0
                ? "in_progress"
                : "all",
          crew: jobsWithoutAssignments.length > 0 ? "unassigned" : "all"
        }),
        label: "Open schedule"
      },
      ...(scheduleFocusJob
        ? [
            {
              href: buildProjectScheduleHref({
                projectId: project.id,
                jobId: scheduleFocusJob.id,
                action:
                  scheduleFocusAssignments.length > 0 ||
                  scheduleFocusJob.dispatchStatus === "unscheduled"
                    ? "schedule"
                    : "assign"
              }),
              label: "Open focused job in schedule"
            }
          ]
        : [])
    ]
  };
  const projectPulse = deriveProjectPulseSummary({
    projectId: project.id,
    readinessSnapshot,
    readyCheckBlockers: activeBlockers.map((blocker) =>
      formatBlockerLabel(blocker)
    ),
    approvedEstimateId,
    latestContractId: latestContract?.id ?? null,
    latestContractStatus: latestContract?.status ?? null,
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      balanceDueAmount: invoice.balanceDueAmount
    })),
    fieldTrail,
    messageCenter,
    scheduleHref: projectScheduleHref,
    todayIsoDate: new Date().toISOString().slice(0, 10)
  });
  const closeoutTrail = deriveCloseoutTrailSummary({
    projectId: project.id,
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      status: contract.status
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      balanceDueAmount: invoice.balanceDueAmount
    })),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status
    })),
    fieldTrail,
    messageCenter,
    customerAccessCount: projectVisiblePortalGrants.length,
    warrantyOrServiceItemCount:
      projectWarrantyDocuments.length + projectServiceTickets.length,
    scheduleHref: projectScheduleHref,
    dailyLogsHref: `/daily-logs?projectId=${project.id}`,
    fieldTrailHref: "#fieldtrail",
    messageCenterHref: "#messagecenter",
    serviceWarrantyHref:
      projectWarrantyDocuments.length > 0
        ? `/warranty-documents/${projectWarrantyDocuments[0].id}`
        : `/service-tickets?projectId=${project.id}`
  });
  const showAiCopilotSummary =
    shouldShowAiCopilotSummaries(guidancePreferences);
  const showAiDraftActionComposer =
    shouldShowAiDraftActions(guidancePreferences);
  const aiProviderAvailability = getAiProviderAvailability({
    preferences: guidancePreferences
  });
  const aiOperationalSummary = showAiCopilotSummary
    ? deriveAiProjectOperationalSummary({
        project: {
          id: project.id,
          name: project.name,
          customerName: project.customer?.name ?? null
        },
        readinessSnapshot,
        projectPulse,
        fieldTrail,
        messageCenter,
        closeoutTrail
      })
    : null;
  const aiCommunicationAssistance = aiOperationalSummary
    ? deriveAiCommunicationAssistance(aiOperationalSummary)
    : null;
  const aiFieldSummary = aiOperationalSummary
    ? deriveAiFieldSummary({
        projectId: project.id,
        projectName: project.name,
        fieldTrail
      })
    : null;
  const aiDraftActions =
    aiOperationalSummary && aiCommunicationAssistance && aiFieldSummary
      ? deriveAiCopilotDraftActions({
          summary: aiOperationalSummary,
          communicationAssistance: aiCommunicationAssistance,
          fieldSummary: aiFieldSummary
        })
      : [];
  const aiCopilotSummaryView = aiOperationalSummary
    ? {
        stage: aiOperationalSummary.stage,
        tone: aiOperationalSummary.tone,
        executiveSummary: aiOperationalSummary.executiveSummary,
        reviewBoundary: aiOperationalSummary.reviewBoundary,
        statusItems: [
          { label: "Readiness", value: aiOperationalSummary.readinessState },
          { label: "Financials", value: aiOperationalSummary.financialState },
          { label: "Schedule", value: aiOperationalSummary.scheduleState },
          { label: "Execution", value: aiOperationalSummary.executionState }
        ],
        recommendedNextActions: aiOperationalSummary.recommendedNextActions.map(
          (action) => ({
            id: action.id,
            title: action.title,
            detail: action.detail,
            reason: action.reason,
            href: action.href,
            label: action.label,
            priority: action.priority
          })
        )
      }
    : null;
  const aiFieldSummaryView = aiFieldSummary
    ? {
        pmSummary: aiFieldSummary.pmSummary,
        riskIndicators: aiFieldSummary.riskIndicators
      }
    : null;
  const aiDraftActionItems = aiDraftActions.map((action) => ({
    id: action.id,
    title: action.title,
    audience: action.audience,
    subject: action.subject,
    draftBody: action.draftBody,
    operationalReason: action.operationalReason,
    reviewSafetyNote: action.reviewSafetyNote,
    reviewHref: buildAiCopilotCommunicationHandoffHref({
      action,
      projectId: project.id,
      projectName: project.name,
      customerId: project.customerId,
      customerName: project.customer?.name ?? null,
      threadId: copilotCommunicationThreadId
    })
  }));
  const proofCenter = deriveProofCenterSummary({
    projectId: project.id,
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      status: estimate.status
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      status: contract.status
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status
    })),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status
    })),
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus
    })),
    fieldTrail,
    messageCenter,
    customerAccessCount: projectVisiblePortalGrants.length,
    warrantyDocumentCount: projectWarrantyDocuments.length,
    serviceTicketCount: projectServiceTickets.length,
    closeoutReady: closeoutTrail.closeoutTone === "ready",
    latestEstimateHref: projectEstimates[0]
      ? `/estimates/${projectEstimates[0].id}`
      : buildProjectEstimateCreateHref(
          project.id,
          project.customerId,
          projectOpportunity?.id
        ),
    latestContractHref: projectContracts[0]
      ? `/contracts/${projectContracts[0].id}`
      : approvedEstimateId
        ? `/contracts?estimateId=${approvedEstimateId}`
        : "/contracts",
    latestInvoiceHref: projectInvoices[0]
      ? `/invoices/${projectInvoices[0].id}`
      : `/invoices?projectId=${project.id}`,
    latestChangeOrderHref: projectChangeOrders[0]
      ? `/change-orders/${projectChangeOrders[0].id}`
      : "/change-orders",
    dailyLogsHref: `/daily-logs?projectId=${project.id}`,
    fieldTrailHref: "#fieldtrail",
    messageCenterHref: "#messagecenter",
    customerAccessHref: `/people?accessCustomerId=${project.customerId}#customer-access`,
    warrantyServiceHref:
      projectWarrantyDocuments.length > 0
        ? `/warranty-documents/${projectWarrantyDocuments[0].id}`
        : `/service-tickets?projectId=${project.id}`
  });
  const projectEvidenceContinuity = deriveProjectEvidenceContinuitySummary({
    projectId: project.id,
    dailyLogs: projectDailyLogs.map((dailyLog) => ({
      id: dailyLog.id,
      jobId: dailyLog.jobId,
      logDate: dailyLog.logDate,
      status: dailyLog.status,
      summary: dailyLog.summary,
      updatedAt: dailyLog.updatedAt
    })),
    fieldNotes: projectFieldNotes.map((fieldNote) => ({
      id: fieldNote.id,
      dailyLogId: fieldNote.dailyLogId,
      jobId: fieldNote.jobId,
      noteType: fieldNote.noteType,
      title: fieldNote.title,
      status: fieldNote.status,
      updatedAt: fieldNote.updatedAt
    })),
    attachments: projectExecutionAttachments
      .filter(
        (
          attachment
        ): attachment is typeof attachment & {
          subjectType: "daily_log" | "field_note";
        } =>
          attachment.subjectType === "daily_log" ||
          attachment.subjectType === "field_note"
      )
      .map((attachment) => ({
        id: attachment.id,
        subjectType: attachment.subjectType,
        subjectId: attachment.subjectId,
        attachmentType: attachment.attachmentType,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        caption: attachment.caption,
        createdAt: attachment.createdAt,
        archivedAt: attachment.archivedAt,
        restoredAt: attachment.restoredAt
      })),
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      status: estimate.status,
      referenceNumber: estimate.referenceNumber,
      updatedAt: estimate.updatedAt
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      status: contract.status,
      referenceNumber: contract.referenceNumber,
      label: contract.title,
      updatedAt: contract.updatedAt
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      referenceNumber: invoice.referenceNumber,
      balanceDueAmount: invoice.balanceDueAmount,
      updatedAt: invoice.updatedAt
    })),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status,
      label: changeOrder.title,
      updatedAt: changeOrder.updatedAt
    })),
    warrantyDocuments: projectWarrantyDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      updatedAt: document.updatedAt
    })),
    serviceTicketCount: projectServiceTickets.length,
    customerAccessCount: projectVisiblePortalGrants.length,
    closeoutTone: closeoutTrail.closeoutTone,
    closeoutBlockers: closeoutTrail.blockers,
    closeoutNextMove: closeoutTrail.nextMove,
    proofTone: proofCenter.proofTone,
    proofMissingItems: proofCenter.missingProofItems,
    proofNextMove: proofCenter.nextMove,
    fieldTrailNextMove: {
      label: fieldTrail.nextMove.label,
      href: fieldTrail.nextMove.href,
      reason: fieldTrail.nextMove.detail
    },
    dailyLogsHref: `/daily-logs?projectId=${project.id}`,
    fieldTrailHref: "#fieldtrail",
    proofCenterHref: "#proofcenter",
    closeoutHref: "#closeouttrail",
    closeoutPackageHref: buildProjectCloseoutPackagePrintHref(project.id),
    customerAccessHref: `/people?accessCustomerId=${project.customerId}#customer-access`,
    warrantyServiceHref:
      projectWarrantyDocuments.length > 0
        ? `/warranty-documents/${projectWarrantyDocuments[0].id}`
        : `/service-tickets?projectId=${project.id}`
  });
  const projectPortalEvidenceSharing =
    deriveProjectPortalEvidenceSharingSummary({
      attachments: projectExecutionAttachments.map((attachment) => ({
        id: attachment.id,
        subjectType: attachment.subjectType,
        subjectId: attachment.subjectId,
        attachmentType: attachment.attachmentType,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        caption: attachment.caption,
        archivedAt: attachment.archivedAt,
        createdAt: attachment.createdAt
      })),
      grants: projectPortalEvidenceGrants,
      deliveryEvents: projectPortalEvidenceDeliveryEvents
    });
  const projectEvidenceReceiptRollup =
    deriveSharedEvidenceReceiptRollupFromProjectSharing(
      projectPortalEvidenceSharing
    );
  const projectCommandTimeline = deriveProjectCommandTimeline({
    project: {
      id: project.id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    },
    opportunity: projectOpportunity
      ? {
          id: projectOpportunity.id,
          status: projectOpportunity.status,
          siteAssessmentStatus: projectOpportunity.siteAssessmentStatus,
          updatedAt: projectOpportunity.updatedAt,
          createdAt: projectOpportunity.createdAt
        }
      : null,
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      status: estimate.status,
      totalAmount: estimate.totalAmount,
      updatedAt: estimate.updatedAt,
      createdAt: estimate.createdAt
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      title: contract.title,
      referenceNumber: contract.referenceNumber,
      status: contract.status,
      internalApprovalStatus: contract.internalApprovalStatus,
      signedAt: contract.signedAt,
      sentAt: contract.sentAt,
      updatedAt: contract.updatedAt,
      createdAt: contract.createdAt
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      referenceNumber: invoice.referenceNumber,
      status: invoice.status,
      workflowRole: invoice.workflowRole,
      balanceDueAmount: invoice.balanceDueAmount,
      updatedAt: invoice.updatedAt,
      createdAt: invoice.createdAt
    })),
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt
    })),
    dailyLogs: projectDailyLogs.map((dailyLog) => ({
      id: dailyLog.id,
      logDate: dailyLog.logDate,
      status: dailyLog.status,
      summary: dailyLog.summary,
      updatedAt: dailyLog.updatedAt,
      createdAt: dailyLog.createdAt
    })),
    fieldNotes: projectFieldNotes.map((fieldNote) => ({
      id: fieldNote.id,
      dailyLogId: fieldNote.dailyLogId,
      noteType: fieldNote.noteType,
      status: fieldNote.status,
      title: fieldNote.title,
      updatedAt: fieldNote.updatedAt,
      createdAt: fieldNote.createdAt
    })),
    messageItems: messageCenter.timeline,
    documentReadiness: {
      label:
        proofCenter.missingProofItems.length > 0
          ? "Document and proof readiness needs review"
          : "Document and proof readiness connected",
      detail: proofCenter.primaryMessage,
      href: "#proofcenter",
      tone: proofCenter.proofTone,
      missingCount: proofCenter.missingProofItems.length
    },
    customerAccessCount: projectVisiblePortalGrants.length,
    readyToSchedule: readinessSnapshot?.isReadyToSchedule ?? false,
    scheduleHref: projectScheduleHref
  });
  const recentPayments = (paymentFocusInvoice?.payments ?? []).slice(0, 4);
  const currentBillableValue = projectProgressBilling.reduce(
    (sum, workspace) => sum + Number(workspace.currentBillableTotal),
    0
  );
  const hasProgressBillingInvoiceGap =
    projectProgressBilling.length > 0 &&
    currentBillableValue > 0 &&
    projectInvoices.filter((invoice) => invoice.billingModel === "aia_progress")
      .length === 0;
  const projectFinancialContinuity = {
    overview: {
      eyebrow: "Invoices / Payments / Progress Billing",
      title: "Financial state is visible without leaving the project hub",
      description:
        "Use this section to see what is billable, what has been invoiced, and what still needs collection before you move into the deeper billing workspaces.",
      href: openInvoices.length > 0 ? "/payments" : "/invoices",
      linkLabel: openInvoices.length > 0 ? "Open payments" : "Open invoices",
      stat: `${projectInvoices.length} invoices / ${formatMoney(
        openInvoices.reduce(
          (sum, invoice) => sum + Number(invoice.balanceDueAmount),
          0
        )
      )} open`
    },
    changeOrders: {
      title: "Change orders",
      items: projectChangeOrders.slice(0, 2).map((changeOrder) => ({
        id: changeOrder.id,
        href: `/change-orders/${changeOrder.id}`,
        title: changeOrder.title,
        subtitle:
          changeOrder.customer?.name ??
          project.customer?.name ??
          "Unknown customer",
        meta: joinMetaParts([
          formatMoney(changeOrder.priceAdjustment),
          changeOrder.invoice
            ? `Invoice ${changeOrder.invoice.referenceNumber}`
            : "Project scope change",
          formatUpdatedActivity(changeOrder.updatedAt)
        ]),
        statusLabel: formatStatusLabel(changeOrder.status)
      })),
      emptyState: {
        eyebrow: "No change orders",
        title: "Track scope changes here",
        description:
          "When scope or price shifts after contract approval, keep the adjustment on the same project chain with a connected change order.",
        actionHref: `/change-orders?projectId=${project.id}&compose=1`,
        actionLabel: "Create change order"
      }
    },
    progressBilling: {
      title: "Progress billing / SOV",
      items: projectProgressBilling.slice(0, 2).map((workspace) => ({
        id: workspace.id,
        href: `/progress-billing/${workspace.id}`,
        title: workspace.estimate?.referenceNumber ?? "Schedule of values",
        subtitle:
          workspace.customer?.name ??
          project.customer?.name ??
          "Unknown customer",
        meta: `Current ${formatMoney(workspace.currentBillableTotal)} / Balance ${formatMoney(workspace.balanceToFinishTotal)} / ${workspace.weightedPercentComplete}% complete`,
        statusLabel: formatStatusLabel(workspace.status)
      })),
      emptyState: {
        eyebrow: "No progress billing",
        title: "Open progress billing after approved scope seeds here",
        description:
          "Once approved estimate items seed a schedule of values on this project, progress billing stays tied to the same estimate, project, and invoice chain."
      }
    },
    invoices: {
      title: "Invoices",
      items: projectInvoices.slice(0, 3).map((invoice) => ({
        id: invoice.id,
        href: `/invoices/${invoice.id}`,
        title: invoice.referenceNumber,
        subtitle:
          invoice.customer?.name ??
          project.customer?.name ??
          "Unknown customer",
        meta: joinMetaParts([
          getProjectInvoiceSummary(invoice),
          formatUpdatedActivity(invoice.updatedAt)
        ]),
        statusLabel: formatStatusLabel(invoice.status)
      })),
      emptyState: {
        eyebrow: "No invoices",
        title: "Create invoice from the connected workflow",
        description:
          "Billing should continue from the same project and downstream work context, with deposit readiness staying on canonical invoices instead of a side model."
      }
    },
    payments: {
      title: "Payments",
      items: recentPayments.slice(0, 3).map((payment) => ({
        id: payment.id,
        href: paymentFocusInvoice
          ? `/invoices/${paymentFocusInvoice.id}`
          : "/payments",
        title: formatMoney(payment.amount),
        subtitle: paymentFocusInvoice
          ? `On ${paymentFocusInvoice.referenceNumber}`
          : "Recent payment",
        meta: getPaymentRecordSummary(payment),
        statusLabel: formatStatusLabel(payment.status)
      })),
      emptyState: {
        eyebrow: "No payments",
        title: "Payment activity will show up here",
        description:
          "Recorded payments remain attached to canonical invoices, so this workspace surfaces them through the same billing chain."
      }
    }
  };
  const projectOperationalSummary = deriveProjectOperationalWorkspaceSummary({
    projectId: project.id,
    todayIsoDate: new Date().toISOString().slice(0, 10),
    readiness: readinessSnapshot
      ? {
          isReadyToSchedule: readinessSnapshot.isReadyToSchedule,
          blockers: readinessSnapshot.blockers,
          depositRequired: readinessSnapshot.depositRequired,
          depositSatisfied: readinessSnapshot.depositSatisfied,
          contractStatus: readinessSnapshot.contractStatus
        }
      : null,
    approvedEstimateTotalAmount: approvedEstimate?.totalAmount ?? null,
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      workflowRole: invoice.workflowRole,
      totalAmount: invoice.totalAmount,
      balanceDueAmount: invoice.balanceDueAmount,
      retainageHeldAmount: invoice.retainageHeldAmount,
      dueDate: invoice.dueDate
    })),
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate
    })),
    jobAssignmentCountsByJobId: new Map(
      projectJobs.map((job) => [
        job.id,
        projectJobAssignments.get(job.id)?.length ?? 0
      ])
    ),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status,
      priceAdjustment: changeOrder.priceAdjustment
    })),
    dailyLogs: projectDailyLogs.map((dailyLog) => ({
      id: dailyLog.id,
      status: dailyLog.status,
      logDate: dailyLog.logDate,
      summary: dailyLog.summary
    })),
    fieldNotes: projectFieldNotes.map((fieldNote) => ({
      id: fieldNote.id,
      dailyLogId: fieldNote.dailyLogId,
      noteType: fieldNote.noteType,
      status: fieldNote.status,
      title: fieldNote.title
    })),
    totalWorkedMinutes: fieldTrail.totalWorkedMinutes,
    progressBillingExposureAmount: currentBillableValue,
    latestPaymentEventType: paymentFocusLatestEventType,
    timelineAttentionItems: projectCommandTimeline.needsAttention.map(
      (item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        href: item.href,
        needsAttention: item.needsAttention
      })
    )
  });
  const projectNextActions = buildProjectNextActions({
    project,
    todayIsoDate: new Date().toISOString().slice(0, 10),
    readinessSnapshot,
    estimates: projectEstimates,
    contracts: projectContracts,
    invoices: projectInvoices,
    jobs: projectJobs,
    fieldNotes: projectFieldNotes
  });
  const workspaceBlockers = [
    ...activeBlockers.map((blocker) => formatBlockerLabel(blocker)),
    ...(unscheduledJobs.length > 0
      ? [
          unscheduledJobs.length === 1
            ? "One job is still unscheduled."
            : `${unscheduledJobs.length} jobs are still unscheduled.`
        ]
      : []),
    ...(unresolvedPunchlistItems.length > 0
      ? [
          unresolvedPunchlistItems.length === 1
            ? "One punchlist item is still open."
            : `${unresolvedPunchlistItems.length} punchlist items are still open.`
        ]
      : []),
    ...(hasProgressBillingInvoiceGap
      ? [
          "Progress billing exists, but no connected progress invoice has been created yet."
        ]
      : []),
    ...(canCreateInvoice
      ? ["Completed work exists without a connected invoice."]
      : [])
  ];
  const schedulingState = readinessSnapshot?.isReadyToSchedule
    ? activeJobs.length > 0
      ? {
          value: `${activeJobs.length} active ${activeJobs.length === 1 ? "job" : "jobs"}`,
          detail: "Execution is already underway on the canonical job chain.",
          tone: "positive" as WorkspaceStateTone
        }
      : scheduledJobs.length > 0
        ? {
            value: `${scheduledJobs.length} scheduled ${scheduledJobs.length === 1 ? "job" : "jobs"}`,
            detail: "Scheduling is in motion on canonical jobs.",
            tone: "positive" as WorkspaceStateTone
          }
        : unscheduledJobs.length > 0
          ? {
              value: `${unscheduledJobs.length} unscheduled ${unscheduledJobs.length === 1 ? "job" : "jobs"}`,
              detail:
                "Operational handoff is clear, but crew assignment still needs attention.",
              tone: "warning" as WorkspaceStateTone
            }
          : {
              value: "Ready for first job",
              detail:
                "Commercial handoff is clear and operations can create the first job.",
              tone: "warning" as WorkspaceStateTone
            }
    : {
        value: "Not schedule-ready",
        detail:
          "Commercial blockers still need to clear before operations should schedule work.",
        tone: "critical" as WorkspaceStateTone
      };
  const financialState =
    openInvoices.length > 0
      ? {
          value: `${formatMoney(
            openInvoices.reduce(
              (sum, invoice) => sum + Number(invoice.balanceDueAmount),
              0
            )
          )} open`,
          detail: `Across ${openInvoices.length} invoice${openInvoices.length === 1 ? "" : "s"}, billing still needs collection.`,
          tone: "warning" as WorkspaceStateTone
        }
      : recentPayments.length > 0
        ? {
            value: `${formatMoney(
              recentPayments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0
              )
            )} recent payments`,
            detail:
              "Connected invoice payments are already recorded on this project chain.",
            tone: "positive" as WorkspaceStateTone
          }
        : readinessSnapshot?.depositRequired &&
            !readinessSnapshot.depositSatisfied
          ? {
              value: "Deposit required",
              detail:
                "Commercial readiness is still waiting on deposit collection.",
              tone: "critical" as WorkspaceStateTone
            }
          : hasProgressBillingInvoiceGap
            ? {
                value: `${formatMoney(currentBillableValue)} ready to bill`,
                detail:
                  "Current SOV progress exists, but billing has not been pushed into invoices yet.",
                tone: "warning" as WorkspaceStateTone
              }
            : {
                value: "Financial chain connected",
                detail: paymentFocusSummary,
                tone: "neutral" as WorkspaceStateTone
              };
  const nextActionQueue = buildWorkspaceActions({
    primaryAction: nextAction,
    projectId: project.id,
    approvedEstimateId,
    projectJobsCount: projectJobs.length,
    unscheduledJobsCount: unscheduledJobs.length,
    jobsWithoutCrewCount: jobsWithoutCrew.length,
    hasCompletedJobWithoutInvoice: canCreateInvoice,
    completedJobWithoutInvoiceId: canCreateInvoice ? completedJobId : null,
    unresolvedPunchlistCount: unresolvedPunchlistItems.length,
    openInvoiceCount: openInvoices.length,
    activeAppointmentCount: scheduledAppointments.length,
    isReadyToSchedule: Boolean(readinessSnapshot?.isReadyToSchedule),
    hasProgressBillingInvoiceGap
  });
  const derivedProjectCues = buildProjectCues({
    project,
    readinessSnapshot,
    estimates: projectEstimates,
    contracts: projectContracts,
    invoices: projectInvoices,
    jobs: projectJobs,
    fieldNotes: projectFieldNotes
  });
  const projectCueStates = await listWorkflowCueStatesForIdentities({
    companyId: project.organizationId,
    currentUserId: user.id,
    identities: derivedProjectCues.map((cue) =>
      buildProjectCueIdentity(project.organizationId, cue)
    )
  });
  const projectCues = applyCueStates({
    cues: derivedProjectCues,
    states: projectCueStates,
    currentUserId: user.id,
    now: new Date(),
    companyId: project.organizationId
  }).visibleCues;
  const selectedWorkItemCue =
    projectCues.find(
      (cue) => cue.workItemBridge?.cue === resolvedSearchParams.workItemCue
    ) ?? null;
  const projectGuidanceWorkItemPrefill = selectedWorkItemCue?.workItemBridge
    ? buildProjectGuidanceWorkItemPrefill({
        projectId: project.id,
        projectName: project.name,
        customerName: project.customer?.name ?? null,
        cueTitle: selectedWorkItemCue.title,
        cueDescription: selectedWorkItemCue.description,
        cueReason: selectedWorkItemCue.reason,
        workflowHref: selectedWorkItemCue.href,
        bridge: selectedWorkItemCue.workItemBridge
      })
    : null;
  const defaultProjectWorkItemSource = projectGuidanceWorkItemPrefill ?? {
    sourceType: "project" as const,
    sourceId: project.id,
    linkPath: `/projects/${project.id}`
  };
  const assignablePeople = people
    .filter((person) => person.isActive && person.isAssignable)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName
    }));
  const hasSignedContract = projectContracts.some(
    (contract) => contract.status === "signed"
  );
  const hasPaymentActivity = Boolean(
    latestPaidInvoice || paymentFocusInvoice?.payments.length
  );
  const workflowSteps = buildProjectLifecycleSteps({
    hasOpportunity: Boolean(projectOpportunity),
    hasEstimate: projectEstimates.length > 0,
    hasApprovedEstimate: Boolean(approvedEstimateId),
    hasContract: projectContracts.length > 0,
    hasSignedContract,
    hasJob: projectJobs.length > 0,
    hasInvoice: projectInvoices.length > 0,
    hasPayment: hasPaymentActivity
  });
  const readinessWorkflowSteps: WorkflowStep[] = readinessStages.map(
    (stage) => ({
      id: stage.title.toLowerCase().replaceAll(" ", "-"),
      label: stage.title,
      description: stage.detail,
      state: mapReadinessStageToWorkflowState(stage.state)
    })
  );
  const projectStateItems: ProjectStateItem[] = [
    {
      id: "project-status",
      label: "Project",
      value: formatStatusLabel(project.status),
      detail:
        project.description?.trim() ||
        "Project remains the operational root for connected work.",
      tone: "pending"
    },
    {
      id: "readiness-state",
      label: "Readiness",
      value: readinessSnapshot?.isReadyToSchedule
        ? "Ready to schedule"
        : formatStatusLabel(readinessStatus),
      detail: readinessSnapshot?.isReadyToSchedule
        ? "Commercial handoff is complete."
        : "Clear the current gate before operations moves forward.",
      tone: readinessSnapshot?.isReadyToSchedule ? "complete" : "needsAction"
    },
    {
      id: "financial-state",
      label: "Financial",
      value: financialState.value,
      detail: financialState.detail,
      tone: mapWorkspaceToneToProjectStateTone(financialState.tone)
    },
    {
      id: "scheduling-state",
      label: "Schedule",
      value: schedulingState.value,
      detail: schedulingState.detail,
      tone: mapWorkspaceToneToProjectStateTone(schedulingState.tone)
    }
  ];
  const workflowDriverLabel = getProjectWorkflowDriverLabel({
    nextAction,
    approvedEstimate: approvedEstimate ?? null,
    latestEstimate,
    latestContract,
    pendingChangeOrder,
    depositInvoice,
    latestOpenInvoice,
    projectJobsCount: projectJobs.length,
    unscheduledJobsCount: unscheduledJobs.length
  });
  const drivingRecordKey = getDrivingRecordKey({
    nextAction,
    approvedEstimate: approvedEstimate ?? null,
    latestEstimate,
    latestContract,
    pendingChangeOrder,
    depositInvoice,
    latestOpenInvoice,
    projectJobs,
    unscheduledJobs
  });
  const currentReadinessStage =
    readinessStages.find((stage) => stage.state === "blocked") ??
    readinessStages.find((stage) => stage.state === "current") ??
    readinessStages[readinessStages.length - 1] ??
    null;
  const openFieldBlocker =
    projectFieldNotes.find(
      (note) =>
        note.status === "open" &&
        (note.noteType === "blocker" || note.noteType === "issue")
    ) ?? null;
  const readinessBlockerItems = buildReadinessBlockerItems({
    projectId: project.id,
    customerId: project.customerId,
    opportunityId: projectOpportunity?.id ?? null,
    approvedEstimateId,
    readinessSnapshot,
    activeBlockers,
    latestEstimate,
    latestContract,
    depositInvoice,
    latestOpenInvoice,
    pendingChangeOrder,
    unscheduledJobs,
    hasCompletedJobWithoutInvoice: canCreateInvoice,
    completedJobWithoutInvoiceId: canCreateInvoice ? completedJobId : null,
    hasProgressBillingInvoiceGap,
    openFieldBlocker
  });
  const linkedRecordRecencyItems = buildLinkedRecordRecencyItems({
    estimates: projectEstimates,
    contracts: projectContracts,
    jobs: projectJobs,
    invoices: projectInvoices,
    changeOrders: projectChangeOrders,
    dailyLogs: projectDailyLogs,
    fieldNotes: projectFieldNotes,
    drivingRecordKey
  });
  const commandSummaryItems: CommandSummaryItem[] = [
    {
      label: "Customer",
      value: project.customer?.name ?? "Unknown customer",
      detail:
        projectVisiblePortalGrants.length > 0
          ? `${projectVisiblePortalGrants.length} contact${
              projectVisiblePortalGrants.length === 1 ? "" : "s"
            } can see this project`
          : "No active portal visibility on this project",
      tone: projectVisiblePortalGrants.length > 0 ? "positive" : "neutral"
    },
    {
      label: "Lifecycle",
      value: currentReadinessStage?.title ?? workflowDriverLabel,
      detail: currentReadinessStage?.detail ?? "Project is the continuity hub.",
      tone:
        currentReadinessStage?.state === "blocked"
          ? "warning"
          : currentReadinessStage?.state === "complete"
            ? "positive"
            : "neutral"
    },
    {
      label: "Commercial",
      value: readinessSnapshot?.isReadyToSchedule
        ? "Ready to schedule"
        : formatStatusLabel(readinessStatus),
      detail:
        workspaceBlockers.length > 0
          ? "Commercial handoff still has blockers."
          : "Commercial signals are currently clear.",
      tone: readinessSnapshot?.isReadyToSchedule
        ? "positive"
        : workspaceBlockers.length > 0
          ? "warning"
          : "neutral"
    },
    {
      label: "Records",
      value: `${projectEstimates.length + projectContracts.length + projectInvoices.length + projectJobs.length} linked`,
      detail: `${projectEstimates.length} estimates / ${projectContracts.length} contracts / ${projectJobs.length} jobs / ${projectInvoices.length} invoices`,
      tone:
        projectEstimates.length +
          projectContracts.length +
          projectInvoices.length +
          projectJobs.length >
        0
          ? "positive"
          : "neutral"
    },
    {
      label: "Field",
      value:
        activeJobs.length > 0
          ? `${activeJobs.length} active`
          : projectDailyLogs.length > 0
            ? `${projectDailyLogs.length} daily logs`
            : "No field activity",
      detail:
        projectDailyLogs[0]?.summary?.trim() ??
        (projectJobs.length > 0
          ? `${projectJobs.length} job${projectJobs.length === 1 ? "" : "s"} on the chain`
          : "Field execution has not started yet."),
      tone:
        activeJobs.length > 0 || projectDailyLogs.length > 0
          ? "positive"
          : "neutral"
    }
  ];
  const connectedRecordLanes: ProjectConnectedRecordLane[] = [
    {
      title: "Sales / Estimate",
      status: latestEstimate
        ? formatStatusLabel(latestEstimate.status)
        : "not started",
      keyFact: latestEstimate
        ? `${latestEstimate.referenceNumber} / ${formatMoney(latestEstimate.totalAmount)}`
        : "No estimate is connected yet.",
      href: latestEstimate
        ? `/estimates/${latestEstimate.id}`
        : buildProjectEstimateCreateHref(
            project.id,
            project.customerId,
            projectOpportunity?.id
          ),
      actionLabel: latestEstimate ? "Open estimate" : "Create estimate",
      note: approvedEstimate
        ? "Approved scope can feed the canonical contract."
        : "Estimate approval is the first commercial gate.",
      blocker:
        projectEstimates.length === 0
          ? "Contract, job, and billing work should wait."
          : undefined
    },
    {
      title: "Contract / Signature",
      status: latestContract
        ? formatStatusLabel(latestContract.status)
        : "not started",
      keyFact: latestContract
        ? getProjectContractSummary({
            contract: latestContract,
            readinessSnapshot
          })
        : "No contract has been generated yet.",
      href: latestContract
        ? `/contracts/${latestContract.id}`
        : approvedEstimateId
          ? `/contracts?estimateId=${approvedEstimateId}`
          : undefined,
      actionLabel: latestContract
        ? "Open contract"
        : approvedEstimateId
          ? "Generate contract"
          : undefined,
      note: "Signature workflow stays on the contract workspace.",
      blocker:
        !latestContract && approvedEstimateId
          ? "Approved scope is waiting for contract generation."
          : readinessSnapshot?.contractStatus &&
              readinessSnapshot.contractStatus !== "signed"
            ? "Signature readiness is still open."
            : undefined
    },
    {
      title: "Change Orders",
      status: pendingChangeOrder
        ? formatStatusLabel(pendingChangeOrder.status)
        : "clear",
      keyFact:
        projectChangeOrders.length > 0
          ? `${projectChangeOrders.length} change order${
              projectChangeOrders.length === 1 ? "" : "s"
            } on this project`
          : "No project change orders yet.",
      href: pendingChangeOrder
        ? `/change-orders/${pendingChangeOrder.id}`
        : `/change-orders?projectId=${project.id}`,
      actionLabel: pendingChangeOrder
        ? "Open change order"
        : "Open change orders",
      note: "Scope changes stay in the canonical change-order lane.",
      blocker: pendingChangeOrder
        ? "Resolve pending scope before relying on billing or closeout."
        : undefined
    },
    {
      title: "Billing / Payments",
      status:
        openInvoices.length > 0
          ? "open"
          : projectInvoices.length > 0
            ? "current"
            : "not started",
      keyFact: paymentFocusSummary,
      href: paymentFocusInvoiceId
        ? `/invoices/${paymentFocusInvoiceId}`
        : "/invoices",
      actionLabel: paymentFocusInvoiceId ? "Open invoice" : "Open invoices",
      note: "Payment records remain attached to canonical invoices.",
      blocker:
        openInvoices.length > 0
          ? `${formatMoney(
              openInvoices.reduce(
                (sum, invoice) => sum + Number(invoice.balanceDueAmount),
                0
              )
            )} still open.`
          : undefined
    },
    {
      title: "Payments",
      status:
        recentPayments.length > 0
          ? formatStatusLabel(recentPayments[0].status)
          : paymentFocusLatestEventType
            ? formatStatusLabel(paymentFocusLatestEventType)
            : "not started",
      keyFact:
        recentPayments.length > 0
          ? getPaymentRecordSummary(recentPayments[0])
          : paymentFocusLatestEventType
            ? `Latest payment event: ${formatStatusLabel(paymentFocusLatestEventType)}`
            : "No recorded payments are attached to this project yet.",
      href: paymentFocusInvoiceId
        ? `/invoices/${paymentFocusInvoiceId}`
        : "/payments",
      actionLabel: paymentFocusInvoiceId
        ? "Open payment invoice"
        : "Open payments",
      note: "Payments are shown through the canonical invoice/payment chain, not a separate project ledger.",
      blocker:
        paymentFocusLatestEventType === "payment_failed" ||
        paymentFocusLatestEventType === "payment_voided"
          ? "Latest payment evidence needs billing review."
          : undefined
    },
    {
      title: "Job / Schedule",
      status: formatStatusLabel(schedulingState.value),
      keyFact: schedulingState.detail,
      href: buildProjectScheduleHref({
        projectId: project.id,
        view:
          unscheduledJobs.length > 0
            ? "unscheduled"
            : activeJobs.length > 0
              ? "in_progress"
              : "all",
        crew: jobsWithoutAssignments.length > 0 ? "unassigned" : "all"
      }),
      actionLabel: projectJobs.length > 0 ? "Open schedule" : "Open scheduling",
      note:
        projectJobs.length > 0
          ? `${projectJobs.length} job${projectJobs.length === 1 ? "" : "s"} connected.`
          : "Create jobs only after readiness clears.",
      blocker:
        readinessSnapshot?.isReadyToSchedule && projectJobs.length === 0
          ? "Commercial handoff is ready, but no job exists yet."
          : unscheduledJobs.length > 0
            ? "One or more jobs still need schedule placement."
            : undefined
    },
    {
      title: "Field / Daily Logs",
      status:
        projectDailyLogs.length > 0
          ? formatStatusLabel(projectDailyLogs[0].status)
          : "not started",
      keyFact:
        projectDailyLogs[0]?.summary?.trim() ??
        (projectFieldNotes.length > 0
          ? `${projectFieldNotes.length} field note${
              projectFieldNotes.length === 1 ? "" : "s"
            } connected`
          : "No daily logs or field notes yet."),
      href: projectDailyLogs[0]
        ? `/daily-logs/${projectDailyLogs[0].id}`
        : "/daily-logs",
      actionLabel: projectDailyLogs[0] ? "Open daily log" : "Open daily logs",
      note: "Field detail remains in daily logs, jobs, punchlists, and time.",
      blocker: projectFieldNotes.some(
        (note) => note.status === "open" && note.noteType === "blocker"
      )
        ? "Open blocker field notes need review."
        : undefined
    },
    {
      title: "Time / Labor",
      status:
        projectOpenTimeStates.length > 0
          ? "active"
          : projectTimeCards.length > 0
            ? "recorded"
            : "not started",
      keyFact:
        projectTimeCards.length > 0
          ? `${formatDuration(
              projectTimeCards.reduce(
                (sum, timeCard) => sum + timeCard.workedMinutes,
                0
              )
            )} across ${projectTimeCards.length} time card${
              projectTimeCards.length === 1 ? "" : "s"
            }`
          : "No labor time is attributed to this project yet.",
      href: projectTimeCards[0]
        ? `/time-cards/${projectTimeCards[0].id}`
        : "/time",
      actionLabel: projectTimeCards[0] ? "Open time card" : "Open time",
      note: "Labor summary is derived from existing time cards and open punch state.",
      blocker:
        projectOpenTimeStates.length > 0
          ? `${projectOpenTimeStates.length} open time session${
              projectOpenTimeStates.length === 1 ? "" : "s"
            } need review.`
          : undefined
    },
    {
      title: "Customer Access",
      status: projectVisiblePortalGrants.length > 0 ? "visible" : "not shared",
      keyFact:
        projectVisiblePortalGrants.length > 0
          ? `${projectVisiblePortalGrants.length} contact${
              projectVisiblePortalGrants.length === 1 ? "" : "s"
            } can access this project`
          : "No customer contacts currently have this project shared.",
      href: `/people?accessCustomerId=${project.customerId}#customer-access`,
      actionLabel: "Manage in People",
      note: "Project shows visibility context; People owns account and credential management.",
      blocker:
        projectVisiblePortalGrants.length === 0
          ? "Share the project from People when the customer should have portal visibility."
          : undefined
    }
  ];
  const blockedConnectedRecordLaneCount = connectedRecordLanes.filter(
    (lane) => lane.blocker
  ).length;
  const projectCommandCenterMapItems: ProjectCommandCenterMapItem[] = [
    {
      eyebrow: "Current status",
      title: readinessSnapshot?.isReadyToSchedule
        ? "Ready to schedule"
        : formatStatusLabel(readinessStatus),
      description:
        workspaceBlockers.length > 0
          ? `${workspaceBlockers.length} ${
              workspaceBlockers.length === 1 ? "item needs" : "items need"
            } attention before the project moves cleanly.`
          : readinessSnapshot?.isReadyToSchedule
            ? "Commercial handoff is complete."
            : "Clear the current gate before operations moves forward.",
      href: nextAction.primaryHref ?? "#project-command-center-title",
      label: nextAction.primaryLabel ?? "Review status",
      tone: workspaceBlockers.length > 0 ? "warning" : "positive"
    },
    {
      eyebrow: "What happened",
      title:
        projectCommandTimeline.needsAttention.length > 0
          ? `${projectCommandTimeline.needsAttention.length} attention signal${
              projectCommandTimeline.needsAttention.length === 1 ? "" : "s"
            }`
          : `${projectCommandTimeline.readyToMove.length} ready handoff${
              projectCommandTimeline.readyToMove.length === 1 ? "" : "s"
            }`,
      description:
        "Project Command Timeline keeps recent lifecycle movement tied back to canonical records.",
      href: "#project-command-timeline",
      label: "Review timeline",
      tone:
        projectCommandTimeline.needsAttention.length > 0 ? "warning" : "neutral"
    },
    {
      eyebrow: "What it means",
      title: aiOperationalSummary
        ? aiOperationalSummary.stage
        : "Copilot quiet",
      description: aiOperationalSummary
        ? `${aiOperationalSummary.recommendedNextActions.length} recommendation${
            aiOperationalSummary.recommendedNextActions.length === 1 ? "" : "s"
          } and ${
            showAiDraftActionComposer ? aiDraftActions.length : 0
          } review-first draft${
            (showAiDraftActionComposer ? aiDraftActions.length : 0) === 1
              ? ""
              : "s"
          } available when controls allow.`
        : "Copilot summaries are disabled; ProjectPulse and canonical records still show the project state.",
      href: "#ai-operational-copilot",
      label: "Review Copilot",
      tone:
        aiOperationalSummary?.tone === "blocked"
          ? "critical"
          : aiOperationalSummary?.tone === "attention"
            ? "warning"
            : "neutral"
    },
    {
      eyebrow: "Where to act",
      title:
        blockedConnectedRecordLaneCount > 0
          ? `${blockedConnectedRecordLaneCount} lane${
              blockedConnectedRecordLaneCount === 1 ? "" : "s"
            } flagged`
          : `${connectedRecordLanes.length} linked lanes`,
      description:
        "Connected records route editing back to estimate, contract, invoice, job, field, portal, and schedule workspaces.",
      href: "#connected-record-lanes",
      label: "Open lanes",
      tone: blockedConnectedRecordLaneCount > 0 ? "warning" : "neutral"
    }
  ];
  const drivingRecord =
    linkedRecordRecencyItems.find((item) => item.isDrivingRecord) ??
    linkedRecordRecencyItems[0] ??
    null;
  const projectOperationalGuidanceBuckets: OperationalGuidanceBucket[] = [
    {
      key: "current-stage",
      eyebrow: "Current stage",
      title: "Where this project stands",
      description:
        "A compact read of the current workflow posture from GateKeeper and linked-record state.",
      emptyTitle: "No stage signal is available yet.",
      emptyDescription:
        "Create estimate, contract, job, or invoice records to make the project stage more specific.",
      tone:
        currentReadinessStage?.state === "blocked" ? "attention" : "neutral",
      items: currentReadinessStage
        ? [
            {
              id: "project-current-stage",
              title: currentReadinessStage.title,
              description: currentReadinessStage.detail,
              why: `${formatWorkflowModeLabel(guidancePreferences.workflowMode)} mode is reading GateKeeper checks without changing gates.`,
              href: `/projects/${project.id}`,
              actionLabel: "Stay in project",
              badge: currentReadinessStage.state
            }
          ]
        : []
    },
    {
      key: "blocker",
      eyebrow: "Blocker",
      title: "What is holding it back",
      description:
        "The first visible blocker or clear-state message, without recalculating GateKeeper.",
      emptyTitle: "No blocker is active.",
      emptyDescription:
        "Readiness, signature, deposit, schedule, billing, and field blockers are currently clear.",
      tone: workspaceBlockers.length > 0 ? "attention" : "ready",
      items:
        workspaceBlockers.length > 0
          ? [
              {
                id: "project-primary-blocker",
                title: "Primary blocker",
                description: workspaceBlockers[0],
                why: "This comes from the existing GateKeeper, billing, schedule, progress-billing, punchlist, or field-note context.",
                href: nextAction.primaryHref ?? `/projects/${project.id}`,
                actionLabel: nextAction.primaryLabel ?? "Review next step",
                badge: "Blocker"
              }
            ]
          : [
              {
                id: "project-clear-blockers",
                title: "No active blockers",
                description:
                  "Commercial, scheduling, billing, and closeout blockers are clear in the current project view.",
                why: "The cockpit is showing clear state only; it does not mark anything resolved.",
                href: `/projects/${project.id}`,
                actionLabel: "Review project",
                badge: "Clear"
              }
            ]
    },
    {
      key: "next-action",
      eyebrow: "Next action",
      title: "What to do next",
      description:
        "The same next-best action already used by Project Workspace, presented as an operator summary.",
      emptyTitle: "No next action is available.",
      emptyDescription:
        "The project still shows linked records and readiness facts even when coaching is reduced.",
      tone: nextAction.blockerCopy ? "attention" : "ready",
      items: [
        {
          id: "project-next-action",
          title: nextAction.title,
          description: nextAction.description,
          why:
            nextAction.blockerCopy ??
            "This action keeps the project moving through the canonical workflow.",
          href: nextAction.primaryHref ?? nextAction.secondaryHref ?? null,
          actionLabel:
            nextAction.primaryLabel ?? nextAction.secondaryLabel ?? null,
          secondaryHref:
            nextAction.primaryHref && nextAction.secondaryHref
              ? nextAction.secondaryHref
              : null,
          secondaryLabel:
            nextAction.primaryHref && nextAction.secondaryHref
              ? nextAction.secondaryLabel
              : null,
          badge: readinessSnapshot?.isReadyToSchedule
            ? "Ready"
            : formatStatusLabel(readinessStatus)
        }
      ]
    },
    {
      key: "related-record",
      eyebrow: "Related record",
      title: "Where to inspect the proof",
      description:
        "Open the linked record currently driving the handoff, or stay in Project if no child record exists yet.",
      emptyTitle: "No linked record is driving the next step yet.",
      emptyDescription:
        "The project itself remains the source of context until estimate, contract, invoice, job, or field records exist.",
      tone: drivingRecord ? "neutral" : "waiting",
      items: [
        {
          id: "project-related-record",
          title: workflowDriverLabel,
          description: drivingRecord
            ? `${drivingRecord.typeLabel}: ${drivingRecord.title}`
            : "No child record is currently driving the next step.",
          why: "Operators should inspect the record that owns the state instead of creating a duplicate workflow.",
          href:
            drivingRecord?.href ??
            nextAction.primaryHref ??
            `/projects/${project.id}`,
          actionLabel: drivingRecord ? "Open record" : "Review project",
          badge: drivingRecord?.statusLabel ?? "Project"
        }
      ]
    }
  ];

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.12fr)_320px]">
      <section className="min-w-0 space-y-10">
        <div
          className={["p-5 sm:p-6", projectWorkspacePanelClassName].join(" ")}
        >
          <DetailPageHeader
            eyebrow="Project Workspace"
            title={project.name}
            description="Use this workspace to see the connected records behind the project and move the next estimate, contract, progress billing, or invoice step forward without hopping across modules."
            backHref="/projects"
            backLabel="Back to projects"
            actions={
              <>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href={buildProjectEstimateCreateHref(
                      project.id,
                      project.customerId,
                      projectOpportunity?.id
                    )}
                    className={secondaryActionClassName}
                  >
                    Create Estimate
                  </Link>
                  {approvedEstimateId && projectContracts.length === 0 ? (
                    <Link
                      href={`/contracts?estimateId=${approvedEstimateId}`}
                      className={secondaryActionClassName}
                    >
                      Generate contract
                    </Link>
                  ) : null}
                  <Link
                    href={`/appointments?projectId=${project.id}&customerId=${project.customerId}&compose=1#appointment-create`}
                    className={secondaryActionClassName}
                  >
                    Create appointment
                  </Link>
                  {readinessSnapshot?.depositRequired &&
                  !readinessSnapshot.depositSatisfied ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`}
                      className={secondaryActionClassName}
                    >
                      Create deposit invoice
                    </Link>
                  ) : null}
                  {canCreateInvoice && completedJobId ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&jobId=${completedJobId}`}
                      className={secondaryActionClassName}
                    >
                      Create invoice
                    </Link>
                  ) : null}
                </div>
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

          <div className="mt-6 space-y-4">
            <ProjectReadinessNextActionPanel
              showNextBestActionGuidance={showNextBestActionGuidance}
              nextAction={nextAction}
              readinessLabel={
                readinessSnapshot?.isReadyToSchedule
                  ? "Ready to schedule"
                  : formatStatusLabel(readinessStatus)
              }
              readinessDetail={
                readinessSnapshot?.isReadyToSchedule
                  ? "Commercial handoff is complete. The next move should stay on the canonical job and schedule chain."
                  : "Readiness blockers are linked to the canonical record that can resolve them where the current data makes that link available."
              }
              isReadyToSchedule={Boolean(readinessSnapshot?.isReadyToSchedule)}
              readyToScheduleAt={readyToScheduleAt}
              blockers={readinessBlockerItems}
              hasActiveBlockers={workspaceBlockers.length > 0}
              meta={`${project.customer?.name ?? "Unknown customer"} / ${formatLocation(
                [
                  project.addressLine1,
                  project.city,
                  project.stateRegion,
                  project.postalCode
                ]
              )}`}
            />

            <ProjectNextActionsPanel summary={projectNextActions} />

            {showReadinessGuidancePanel ? (
              <WorkflowBar title="Project workflow" steps={workflowSteps} />
            ) : null}

            <ProjectStateSummary
              title="Project state summary"
              items={projectStateItems}
            />

            <RoleSlotControls
              title="Ownership Roles"
              description="Internal role metadata for customer ownership, onsite context, follow-up, and later sales-credit attribution. This does not calculate commissions or change Work Item assignment."
              recordIdName="projectId"
              recordId={project.id}
              returnTo={`/projects/${project.id}`}
              action={updateProjectRoleSlotsAction}
              people={assignablePeople}
              controls={[
                {
                  role: "onsite_rep",
                  fieldName: "onsiteRepPersonId",
                  personId: project.onsiteRepPersonId
                },
                {
                  role: "relationship_owner",
                  fieldName: "relationshipOwnerPersonId",
                  personId: project.relationshipOwnerPersonId
                },
                {
                  role: "follow_up_owner",
                  fieldName: "followUpOwnerPersonId",
                  personId: project.followUpOwnerPersonId
                },
                {
                  role: "sales_credit_owner",
                  fieldName: "salesCreditOwnerPersonId",
                  personId: project.salesCreditOwnerPersonId
                }
              ]}
            />

            <OperationalCommandCenter
              customerName={project.customer?.name ?? "Unknown customer"}
              projectLocation={formatLocation([
                project.addressLine1,
                project.city,
                project.stateRegion,
                project.postalCode
              ])}
              nextAction={nextAction}
              blockerCount={workspaceBlockers.length}
              readinessLabel={
                readinessSnapshot?.isReadyToSchedule
                  ? "Ready to schedule"
                  : formatStatusLabel(readinessStatus)
              }
              readinessDetail={
                readinessSnapshot?.isReadyToSchedule
                  ? "Commercial handoff is complete."
                  : "Clear the current gate before operations moves forward."
              }
              summaryItems={commandSummaryItems}
            />

            <ProjectOperationalIntelligenceSection
              summary={projectOperationalSummary}
            />

            <ProjectCommandCenterMapSection
              items={projectCommandCenterMapItems}
            />

            <ProjectPulseSection summary={projectPulse} />

            <ProjectCommandTimelineSection timeline={projectCommandTimeline} />

            <ProjectAiOperationalCopilotSection
              summary={aiCopilotSummaryView}
              fieldSummary={aiFieldSummaryView}
              draftActions={showAiDraftActionComposer ? aiDraftActionItems : []}
              providerEnhancementNote={aiProviderAvailability.reason}
            />

            <OperationalGuidanceSection
              title="Workflow snapshot"
              description="Current stage, blocker, next step, and the driving record stay visible without competing with the ProjectPulse Next Move."
              buckets={projectOperationalGuidanceBuckets}
            />

            <ProjectConnectedRecordLanes lanes={connectedRecordLanes} />

            <LinkedRecordRecencyPanel items={linkedRecordRecencyItems} />

            <ServiceWarrantyContinuityPanel
              title="Service & Warranty Continuity"
              description="Post-install service tickets, warranty documents, and internal signature-request state linked to this project. This is read-only project continuity, not a service-ticket editor."
              tickets={projectServiceTickets}
              warrantyDocuments={projectWarrantyDocuments}
              serviceJobs={projectJobs.filter((job) => job.serviceTicketId)}
              serviceTicketHref={`/service-tickets?projectId=${project.id}`}
              closeoutPackageHref={`/projects/${project.id}/closeout-package/pdf`}
              proofContextCount={
                proofCenter.counts.evidenceItems +
                proofCenter.counts.dailyJobLogs +
                proofCenter.counts.jobNotes +
                proofCenter.counts.warrantyDocuments +
                proofCenter.counts.serviceTickets
              }
              closeoutReady={closeoutTrail.closeoutTone === "ready"}
            />

            {showReadinessGuidancePanel ? (
              <NeedsAttentionPanel
                cues={projectAttentionCues}
                description="Linked estimate, contract, invoice, and job follow-up for this project. Review the suggestions, then open the focused workspace that owns the fix."
                getCueStateControls={(cue) => (
                  <CueStateControls
                    identity={buildOperationalCueIdentity(cue)}
                    support={getCueStateActionSupport(cue)}
                    returnTo={`/projects/${project.id}`}
                  />
                )}
              />
            ) : null}

            {showNextBestActionGuidance ? (
              <ProjectCuePanel
                cues={projectCues}
                getCueStateControls={(cue) => (
                  <CueStateControls
                    identity={buildProjectCueIdentity(
                      project.organizationId,
                      cue
                    )}
                    support={getCueStateActionSupport(cue)}
                    returnTo={`/projects/${project.id}`}
                  />
                )}
              />
            ) : null}

            <ProjectEstimateHandoffContinuityPanel
              workItems={estimateHandoffWorkItems}
              summary={estimateHandoffSummary}
              estimates={projectEstimates}
            />

            <section
              id="work-items"
              className="rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Internal work items
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">
                    Project follow-through
                  </h3>
                  <p className="mt-1 max-w-[68ch] text-sm leading-6 text-slate-600">
                    Create internal contractor work with instructions,
                    measurement notes, assignee, due date, and priority tied to
                    this project or a selected guidance source. Nothing is
                    created until you submit, and submission stays separate from
                    readiness, scheduling, invoices, contracts, jobs, Daily Job
                    Logs, and Job Notes.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 md:w-56">
                  <p className="font-semibold text-slate-950">
                    Open linked items
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {
                      linkedWorkItems.filter(
                        (workItem) => workItem.status === "open"
                      ).length
                    }
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Create internal work item
                    </p>
                    {projectGuidanceWorkItemPrefill ? (
                      <p className="text-sm leading-6 text-slate-600">
                        Prefilled from project guidance. Review the owner, due
                        date, and context; nothing is created until you submit.
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        Use this form for explicit contractor-owned
                        follow-through on the project, including field
                        instructions and measurement context for the assigned
                        person.
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <WorkItemCreateForm
                      action={createWorkItemAction}
                      returnTo={`/projects/${project.id}`}
                      sourceType={defaultProjectWorkItemSource.sourceType}
                      sourceId={defaultProjectWorkItemSource.sourceId}
                      linkPath={defaultProjectWorkItemSource.linkPath}
                      customerId={project.customerId}
                      projectId={project.id}
                      defaultKind={
                        projectGuidanceWorkItemPrefill?.kind ?? "manual"
                      }
                      defaultTitle={projectGuidanceWorkItemPrefill?.title}
                      defaultDescription={
                        projectGuidanceWorkItemPrefill?.description
                      }
                      defaultDueAt={projectGuidanceWorkItemPrefill?.dueAt}
                      defaultPriority={projectGuidanceWorkItemPrefill?.priority}
                      dedupeKey={projectGuidanceWorkItemPrefill?.dedupeKey}
                      metadata={projectGuidanceWorkItemPrefill?.metadata}
                      kindOptions={[
                        {
                          value: "estimate_follow_up",
                          label: "Estimate follow-up"
                        },
                        {
                          value: "invoice_follow_up",
                          label: "Invoice follow-up"
                        },
                        { value: "human_handoff", label: "Human handoff" },
                        { value: "manual", label: "Manual" }
                      ]}
                      assignablePeople={assignablePeople}
                      boundaryCopy="Work items are internal-only and human-submitted. Creating, completing, or dismissing one does not change project readiness, schedule commitments, invoice/payment state, contract signature state, job state, or field-note status."
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Linked work items
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Internal project actions tied through the canonical project
                    relationship. Work-item photos and files stay internal and
                    are not visible to the customer portal.
                  </p>
                  <div className="mt-4">
                    <WorkItemList
                      workItems={linkedWorkItems}
                      returnTo={`/projects/${project.id}`}
                      completeAction={completeWorkItemAction}
                      dismissAction={dismissWorkItemAction}
                      evidenceUploadAction={
                        createWorkItemEvidenceAttachmentAction
                      }
                      evidenceByWorkItemId={projectWorkItemEvidenceById}
                      emptyTitle="No work items are linked to this project yet."
                      emptyDescription="Create a manual internal work item when project follow-through needs instructions, measurement notes, an owner, due date, and completion state."
                    />
                  </div>
                </section>
              </div>
            </section>

            {readinessSnapshot?.isReadyToSchedule ? (
              <ReadyToScheduleActionPanel
                projectId={project.id}
                projectName={project.name}
                estimateId={approvedEstimateId}
                contractId={latestContract?.id ?? null}
                readyToScheduleAt={readyToScheduleAt}
                jobCount={projectJobs.length}
                unscheduledJobCount={unscheduledJobs.length}
                unscheduledJobId={
                  unscheduledJobs.length === 1 ? unscheduledJobs[0].id : null
                }
                source="project"
              />
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Key blockers
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-950">
                    {workspaceBlockers.length > 0
                      ? `${workspaceBlockers.length} items need attention`
                      : "No active blockers"}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  Ready to schedule: {formatDateTime(readyToScheduleAt)}
                </p>
              </div>
              {workspaceBlockers.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {workspaceBlockers.slice(0, 4).map((blocker) => (
                    <div
                      key={blocker}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
                    >
                      {blocker}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  Commercial, scheduling, and closeout blockers are currently
                  clear on this project.
                </div>
              )}
            </section>
          </div>
        </div>

        <CoreWorkflowSection
          title="Workflow sections"
          description="Overview, estimate, contract, jobs, and invoices stay in the same order as the canonical lifecycle: opportunity, customer/project, estimate/contract, job/schedule, and invoice/payment. The overview names the linked record or workspace currently driving the next step."
        >
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 lg:col-span-2 xl:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">Overview</p>
              <span className="text-xs font-semibold text-slate-500">Hub</span>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Project is the operational hub for this customer, commercial
                chain, field work, billing, and payment follow-through.
              </p>
              <ContextFactsList
                items={[
                  {
                    label: "Customer",
                    value: project.customer?.name ?? "Unknown customer"
                  },
                  {
                    label: "Project status",
                    value: formatStatusLabel(project.status)
                  },
                  {
                    label: "Next step",
                    value: nextAction.primaryLabel ?? nextAction.title
                  },
                  {
                    label: "Driving record",
                    value: workflowDriverLabel
                  }
                ]}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">Estimate</p>
              <span className="text-xs font-semibold text-slate-500">
                {projectEstimates.length}
              </span>
            </div>
            <div className="grid gap-3">
              {projectEstimates.length > 0 ? (
                <>
                  {projectEstimates.slice(0, 2).map((estimate) => (
                    <LinkedRecordCard
                      key={estimate.id}
                      href={`/estimates/${estimate.id}`}
                      title={estimate.referenceNumber}
                      subtitle={
                        estimate.customer?.name ??
                        project.customer?.name ??
                        "Unknown customer"
                      }
                      meta={joinMetaParts([
                        `Total ${formatMoney(estimate.totalAmount)}`,
                        formatUpdatedActivity(estimate.updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(estimate.status)
                      )}
                    />
                  ))}
                  <WorkflowForwardLink
                    href={
                      approvedEstimateId && projectContracts.length === 0
                        ? `/contracts?estimateId=${approvedEstimateId}`
                        : null
                    }
                  >
                    Generate contract
                  </WorkflowForwardLink>
                </>
              ) : (
                <AppEmptyState
                  eyebrow="No estimates"
                  title="Create your first estimate for this project"
                  description="Create an estimate from this project so scope, pricing, and downstream workflow records stay connected."
                  actionHref={buildProjectEstimateCreateHref(
                    project.id,
                    project.customerId,
                    projectOpportunity?.id
                  )}
                  actionLabel="Create estimate"
                />
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">Contract</p>
              <span className="text-xs font-semibold text-slate-500">
                {projectContracts.length}
              </span>
            </div>
            <div className="grid gap-3">
              {projectContracts.length > 0 ? (
                <>
                  {projectContracts.slice(0, 2).map((contract) => (
                    <LinkedRecordCard
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      title={contract.title}
                      subtitle={
                        contract.customer?.name ??
                        project.customer?.name ??
                        "Unknown customer"
                      }
                      meta={joinMetaParts([
                        getProjectContractSummary({
                          contract,
                          readinessSnapshot
                        }),
                        formatUpdatedActivity(contract.updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(contract.status)
                      )}
                    />
                  ))}
                  <WorkflowForwardLink
                    href={
                      hasSignedContract && projectJobs.length === 0
                        ? `/jobs?projectId=${project.id}`
                        : null
                    }
                  >
                    Create job
                  </WorkflowForwardLink>
                </>
              ) : (
                <AppEmptyState
                  eyebrow="No contracts"
                  title="Generate contract after approval"
                  description="Contracts are generated from approved estimates."
                  actionHref={
                    approvedEstimateId
                      ? `/contracts?estimateId=${approvedEstimateId}`
                      : undefined
                  }
                  actionLabel={
                    approvedEstimateId ? "Generate contract" : undefined
                  }
                />
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">Jobs</p>
              <span className="text-xs font-semibold text-slate-500">
                {projectJobs.length}
              </span>
            </div>
            <div className="grid gap-3">
              {projectJobs.length > 0 ? (
                <>
                  {projectJobs.slice(0, 2).map((job) => (
                    <LinkedRecordCard
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      title={job.project?.name ?? project.name}
                      subtitle={
                        job.customer?.name ??
                        project.customer?.name ??
                        "Unknown customer"
                      }
                      meta={joinMetaParts([
                        job.scheduledDate
                          ? `${job.crewVendor?.name ?? "Crew not assigned"} / Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
                          : `${job.crewVendor?.name ?? "Crew not assigned"} / Unscheduled`,
                        formatUpdatedActivity(job.updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(job.dispatchStatus)
                      )}
                    />
                  ))}
                  <WorkflowForwardLink
                    href={
                      projectInvoices.length === 0
                        ? `/invoices?projectId=${project.id}${
                            completedJobId ? `&jobId=${completedJobId}` : ""
                          }`
                        : null
                    }
                  >
                    Create invoice
                  </WorkflowForwardLink>
                </>
              ) : (
                <AppEmptyState
                  eyebrow="No jobs"
                  title="Create a job once work is ready"
                  description="Job and schedule work starts only after GateKeeper clears. Until then, resolve the upstream estimate, contract, deposit, or financing gate named above."
                  actionHref={
                    readinessSnapshot?.isReadyToSchedule
                      ? `/jobs?projectId=${project.id}`
                      : undefined
                  }
                  actionLabel={
                    readinessSnapshot?.isReadyToSchedule
                      ? "Create job"
                      : undefined
                  }
                />
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">Invoices</p>
              <span className="text-xs font-semibold text-slate-500">
                {projectInvoices.length}
              </span>
            </div>
            <div className="grid gap-3">
              {projectInvoices.length > 0 ? (
                projectInvoices
                  .slice(0, 2)
                  .map((invoice) => (
                    <LinkedRecordCard
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      title={invoice.referenceNumber}
                      subtitle={
                        invoice.customer?.name ??
                        project.customer?.name ??
                        "Unknown customer"
                      }
                      meta={joinMetaParts([
                        getProjectInvoiceSummary(invoice),
                        formatUpdatedActivity(invoice.updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(invoice.status)
                      )}
                    />
                  ))
              ) : (
                <AppEmptyState
                  eyebrow="No invoices"
                  title="Invoices follow completed work"
                  description="Invoices and payments stay downstream of approved scope, deposit rules, and billable job context. Use the project and job records above to confirm what is actually ready to bill."
                  actionHref={
                    canCreateInvoice && completedJobId
                      ? `/invoices?projectId=${project.id}&jobId=${completedJobId}`
                      : undefined
                  }
                  actionLabel={
                    canCreateInvoice && completedJobId
                      ? "Create invoice"
                      : undefined
                  }
                />
              )}
            </div>
          </section>
        </CoreWorkflowSection>

        {showNextBestActionGuidance && nextActionQueue.length > 1 ? (
          <DetailPanel
            title="Follow-Up Actions"
            description="Secondary project actions stay available after the primary next step, without competing with the core workflow above."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {nextActionQueue.slice(1).map((action) => (
                <section
                  key={`${action.title}-${action.href ?? "no-link"}`}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-4"
                >
                  <p className="text-base font-semibold text-slate-950">
                    {action.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {action.description}
                  </p>
                  {action.href && action.label ? (
                    <div className="mt-4">
                      <Link
                        href={action.href}
                        className={getWorkspaceActionLinkClassName(action.tone)}
                      >
                        {action.label}
                      </Link>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </DetailPanel>
        ) : null}

        {showReadinessGuidancePanel ? (
          <DetailPanel
            title="Upstream Readiness Chain"
            description="The project hub reflects the lifecycle in order: opportunity, customer/project, estimate/contract, job/schedule, and invoice/payment. Use this chain to see what is blocking downstream work before opening Schedule."
          >
            <div className="space-y-4">
              <WorkflowBar
                title="Readiness gates"
                steps={readinessWorkflowSteps}
              />
              <div className="grid gap-4 xl:grid-cols-5">
                {readinessStages.map((stage) => (
                  <section
                    key={stage.title}
                    className={`rounded-2xl border px-5 py-4 ${getStageCardClassName(stage.state)}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {stage.title}
                    </p>
                    <p className="mt-3 text-sm font-medium capitalize text-slate-950">
                      {stage.state}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {stage.detail}
                    </p>
                  </section>
                ))}
              </div>
            </div>
          </DetailPanel>
        ) : null}

        <DetailPanel
          title="Coordination"
          description="Customer-facing appointments stay visible below the core estimate, contract, job, and invoice path."
          collapsed
        >
          <div className="space-y-6">
            <SectionOverview
              eyebrow="Appointments"
              title="Customer coordination stays connected to the project"
              description="Use appointments for customer meetings, site visits, and follow-up blocks while keeping execution scheduling on canonical jobs."
              href={`/appointments?projectId=${project.id}`}
              linkLabel="Open appointments"
              stat={`${projectAppointments.length} appointments`}
            />
            <div className="grid gap-8">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    Appointments
                  </p>
                </div>
                <div className="grid gap-4">
                  {projectAppointments.length > 0 ? (
                    projectAppointments
                      .slice(0, 2)
                      .map((appointment) => (
                        <LinkedRecordCard
                          key={appointment.id}
                          href={`/appointments/${appointment.id}`}
                          title={appointment.title}
                          subtitle={
                            appointment.customer?.name ??
                            project.customer?.name ??
                            "Unknown customer"
                          }
                          meta={`${appointment.appointmentType.replaceAll("_", " ")} / ${new Date(appointment.startsAt).toLocaleString()}`}
                          badge={renderStatusBadge(
                            formatStatusLabel(appointment.status)
                          )}
                        />
                      ))
                  ) : (
                    <AppEmptyState
                      eyebrow="No appointments"
                      title="Schedule project-facing coordination here"
                      description="Use appointments for customer meetings, site visits, and follow-up blocks while keeping execution scheduling on canonical jobs."
                      actionHref={`/appointments?projectId=${project.id}&customerId=${project.customerId}&compose=1#appointment-create`}
                      actionLabel="Create appointment"
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        </DetailPanel>

        <SupportSection
          title="Documents"
          description="Estimate attachments and sent contract PDFs stay linked to the same project chain here without duplicating file records."
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Estimate attachments
                </p>
              </div>
              <div className="grid gap-4">
                {projectEstimateAttachments.length > 0 ? (
                  projectEstimateAttachments
                    .slice(0, 4)
                    .map((attachment) => (
                      <LinkedRecordCard
                        key={attachment.id}
                        href={
                          attachment.downloadUrl ??
                          `/estimates/${attachment.estimateId}`
                        }
                        title={attachment.fileName}
                        subtitle={attachment.estimateReferenceNumber}
                        meta={new Date(attachment.createdAt).toLocaleString()}
                        badge={renderStatusBadge("Estimate file")}
                      />
                    ))
                ) : (
                  <AppEmptyState
                    eyebrow="No estimate files"
                    title="Estimate documents will show up here"
                    description="Files attached in the estimate workspace remain linked to the same project so sales and operations can reference one shared document chain."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Contract PDFs
                </p>
              </div>
              <div className="grid gap-4">
                {projectContractDocuments.length > 0 ? (
                  projectContractDocuments
                    .slice(0, 4)
                    .map((contract) => (
                      <LinkedRecordCard
                        key={contract.id}
                        href={
                          contract.sentPdfDownloadUrl ??
                          `/contracts/${contract.id}`
                        }
                        title={
                          contract.sentPdfFileName ?? `${contract.title}.pdf`
                        }
                        subtitle={contract.title}
                        meta={
                          contract.sentPdfGeneratedAt
                            ? `Generated ${new Date(contract.sentPdfGeneratedAt).toLocaleString()}`
                            : "Sent contract PDF"
                        }
                        badge={renderStatusBadge("Sent PDF")}
                      />
                    ))
                ) : (
                  <AppEmptyState
                    eyebrow="No sent PDFs"
                    title="Sent contract files will show up here"
                    description="Once a contract is sent for signature, its official PDF snapshot stays linked to the same contract and project context."
                  />
                )}
              </div>
            </section>
          </div>
        </SupportSection>

        <ExecutionSection
          title="Operations Hub"
          description="Project stays the operating summary for jobs, scheduling pressure, and closeout work while real execution still happens on canonical job and punchlist records."
        >
          <div className="space-y-6">
            <ProjectProductionHubSection {...projectProductionHub} />

            <ProjectFieldTrailSection
              summary={fieldTrail}
              emptyDailyLogActionHref={
                projectJobs[0]
                  ? buildDailyLogCaptureHref({
                      projectId: project.id,
                      jobId: projectJobs[0].id,
                      logDate: projectJobs[0].scheduledDate
                    })
                  : buildDailyLogCaptureHref({ projectId: project.id })
              }
            />

            <ProjectMessageCenterSection
              summary={messageCenter}
              communicationComposer={
                <RecordLinkedCommunicationComposer
                  subjectType="project"
                  subjectId={project.id}
                  returnTo={`/projects/${project.id}#messagecenter`}
                  title="Add project communication"
                  description="Create or reuse this project's canonical communication thread, then save an internal note or customer-visible portal-history message without sending email or SMS."
                />
              }
              emptyCommunicationHref="/communications?source=project"
            />
          </div>
        </ExecutionSection>

        <CloseoutTrailSection summary={closeoutTrail} />

        <div className="flex justify-end">
          <Link
            href={buildProjectCloseoutPackagePrintHref(project.id)}
            className={secondaryActionClassName}
          >
            Print Closeout Package
          </Link>
        </div>

        <ProjectProofCenterSection summary={proofCenter} />

        <ProjectEvidenceContinuitySection
          summary={projectEvidenceContinuity}
          portalSharing={projectPortalEvidenceSharing}
          receiptRollup={projectEvidenceReceiptRollup}
          receiptPrintHref={buildProjectEvidenceReceiptPrintHref(project.id)}
          renderPortalEvidenceAction={(item) =>
            item.canShare ? (
              <form
                action={shareExecutionAttachmentToPortalAction}
                className="grid gap-2"
              >
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="attachmentId" value={item.id} />
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                  Customer title
                  <input
                    name="titleOverride"
                    defaultValue={item.title}
                    className="rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm normal-case tracking-normal text-[var(--text-primary)]"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                  Customer note
                  <input
                    name="customerNote"
                    placeholder="Optional customer-safe context"
                    className="rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm normal-case tracking-normal text-[var(--text-primary)]"
                  />
                </label>
                <button type="submit" className={secondaryActionClassName}>
                  Share with customer
                </button>
              </form>
            ) : item.canRevoke ? (
              <form action={revokeExecutionAttachmentPortalShareAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <input type="hidden" name="attachmentId" value={item.id} />
                <button type="submit" className={secondaryActionClassName}>
                  Revoke customer sharing
                </button>
              </form>
            ) : (
              <p className="text-xs leading-5 text-[var(--text-secondary)]">
                No portal action is available for this item.
              </p>
            )
          }
        />

        <DetailPanel
          title="Financial Hub"
          description="Billing continuity stays visible here from scope change through progress billing, invoicing, and payment, while the project hub remains a summary-first surface."
        >
          <ProjectFinancialContinuitySection
            overview={projectFinancialContinuity.overview}
            changeOrders={projectFinancialContinuity.changeOrders}
            progressBilling={projectFinancialContinuity.progressBilling}
            invoices={projectFinancialContinuity.invoices}
            payments={projectFinancialContinuity.payments}
          />
        </DetailPanel>

        <DetailPanel
          title="Readiness / Financial"
          description="Financing lives with commercial readiness, deposit state, and scheduling blockers. Basic project identity stays separate below."
          collapsed
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Financing status",
                  value: formatStatusLabel(
                    readinessSnapshot?.financingStatus ??
                      project.financingStatus
                  ),
                  detail:
                    "Stored on the canonical project and used only as readiness context."
                },
                {
                  label: "Deposit Ready Check",
                  value: readinessSnapshot?.depositRequired
                    ? readinessSnapshot.depositSatisfied
                      ? "Deposit satisfied"
                      : "Deposit required"
                    : "No deposit requirement",
                  detail:
                    "Deposit behavior continues to use the existing financial chain."
                },
                {
                  label: "Ready Check",
                  value: formatStatusLabel(readinessStatus),
                  detail: readinessSnapshot?.isReadyToSchedule
                    ? "GateKeeper checks are clear."
                    : "Resolve blockers before operational handoff."
                },
                {
                  label: "Ready to schedule",
                  value: formatDateTime(readyToScheduleAt),
                  detail:
                    "Readiness is derived from existing project, contract, deposit, and financing state."
                }
              ].map((item) => (
                <section
                  key={item.label}
                  className="rounded-[1.45rem] border border-slate-200 bg-slate-50/85 px-4 py-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base font-semibold capitalize text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.detail}
                  </p>
                </section>
              ))}
            </div>

            <form
              action={updateProjectAction}
              className="rounded-lg border border-[var(--border-warm)] bg-white px-5 py-5"
            >
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="name" value={project.name} />
              <input
                type="hidden"
                name="customerId"
                value={project.customerId}
              />
              <input type="hidden" name="status" value={project.status} />
              <input
                type="hidden"
                name="description"
                value={project.description ?? ""}
              />
              <input
                type="hidden"
                name="addressLine1"
                value={project.addressLine1 ?? ""}
              />
              <input
                type="hidden"
                name="addressLine2"
                value={project.addressLine2 ?? ""}
              />
              <input type="hidden" name="city" value={project.city ?? ""} />
              <input
                type="hidden"
                name="stateRegion"
                value={project.stateRegion ?? ""}
              />
              <input
                type="hidden"
                name="postalCode"
                value={project.postalCode ?? ""}
              />
              <input
                type="hidden"
                name="countryCode"
                value={project.countryCode ?? ""}
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Edit financing status
                </span>
                <select
                  name="financingStatus"
                  defaultValue={project.financingStatus}
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  required
                >
                  {financingStatusesList.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                This updates the existing project readiness field only. It does
                not change estimate, invoice, catalog, or contract behavior.
              </p>
              <button
                type="submit"
                className={`${primaryActionClassName} mt-4`}
              >
                Save financing status
              </button>
            </form>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Field Signal"
          description="Supporting labor and time context stays visible here after the commercial and operations picture is understood."
          collapsed
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-950">
                Current punch state
              </p>
              {projectOpenTimeStates.length > 0 ? (
                projectOpenTimeStates.slice(0, 3).map((state) => (
                  <div
                    key={state.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    <p className="font-medium text-slate-950">
                      {state.person?.displayName ?? "Unknown worker"}
                    </p>
                    <p className="mt-1">
                      {state.currentPunchState === "on_break"
                        ? "On break"
                        : "Punched in"}
                    </p>
                    <p className="mt-1">
                      {state.job
                        ? `Job ${state.job.id.slice(0, 8)}`
                        : "Project-level time"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No open time sessions are currently attributed to this
                  project.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-950">
                Recent time cards
              </p>
              {projectTimeCards.slice(0, 3).length > 0 ? (
                projectTimeCards
                  .slice(0, 3)
                  .map((timeCard) => (
                    <LinkedRecordCard
                      key={timeCard.id}
                      href={`/time-cards/${timeCard.id}`}
                      title={timeCard.person?.displayName ?? "Unknown worker"}
                      subtitle={new Date(
                        `${timeCard.workDate}T00:00:00`
                      ).toLocaleDateString()}
                      meta={`${timeCard.workedMinutes} worked minutes${timeCard.job ? ` / Job ${timeCard.job.id.slice(0, 8)}` : ""}`}
                      badge={renderStatusBadge(
                        formatStatusLabel(timeCard.status)
                      )}
                    />
                  ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No time cards are attributed to this project yet.
                </div>
              )}
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          id="project-details"
          title="Edit Project"
          description="Editing stays on the same record, but it is intentionally lower priority than the readiness workspace above."
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

      <aside className="min-w-0 space-y-6">
        <DetailPanel
          title="Project Context"
          description="The few facts that help interpret the readiness workspace without recreating the project form."
        >
          <ContextFactsList
            items={[
              {
                label: "Ready Check",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(readinessStatus)}
                  </span>
                )
              },
              {
                label: "Ready to schedule",
                value: formatDateTime(readyToScheduleAt)
              },
              {
                label: "Financing status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(
                      readinessSnapshot?.financingStatus ??
                        project.financingStatus
                    )}
                  </span>
                )
              },
              {
                label: "Deposit Ready Check",
                value: readinessSnapshot?.depositRequired
                  ? readinessSnapshot.depositSatisfied
                    ? "Deposit satisfied"
                    : "Deposit required"
                  : "No deposit requirement"
              },
              {
                label: "Linked lead",
                value: projectOpportunity ? (
                  <Link
                    href={`/leads/${projectOpportunity.id}`}
                    className="font-medium text-brand-700"
                  >
                    {projectOpportunity.title}
                  </Link>
                ) : (
                  "No linked lead"
                )
              },
              ...(projectOpportunity
                ? [
                    {
                      label: "Assessment status",
                      value: (
                        <span className="capitalize">
                          {formatStatusLabel(
                            projectOpportunity.siteAssessmentStatus
                          )}
                        </span>
                      )
                    },
                    {
                      label: "Requirements summary",
                      value:
                        projectOpportunity.requirementsSummary ??
                        "No requirements summary captured yet"
                    }
                  ]
                : []),
              {
                label: "Customer",
                value: project.customer ? (
                  <Link
                    href={`/customers/${project.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {project.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )
              },
              {
                label: "Status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(project.status)}
                  </span>
                )
              },
              {
                label: "Scope notes",
                value: project.description ?? "Not provided"
              },
              {
                label: "Location",
                value: formatLocation([
                  project.addressLine1,
                  project.addressLine2,
                  project.city,
                  project.stateRegion,
                  project.postalCode,
                  project.countryCode
                ])
              }
            ]}
          />
          <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
            <summary className="cursor-pointer list-none font-semibold text-slate-950">
              More project facts
            </summary>
            <div className="mt-4">
              <ContextFactsList
                items={[
                  {
                    label: "Customer company",
                    value: project.customer?.companyName ?? "Not provided"
                  },
                  {
                    label: "Service address line 1",
                    value: project.addressLine1 ?? "Not provided"
                  },
                  {
                    label: "Service address line 2",
                    value: project.addressLine2 ?? "Not provided"
                  },
                  {
                    label: "Service city",
                    value: project.city ?? "Not provided"
                  },
                  {
                    label: "Service state / postal",
                    value:
                      [project.stateRegion, project.postalCode]
                        .filter(Boolean)
                        .join(" ") || "Not provided"
                  },
                  {
                    label: "Created",
                    value: new Date(project.createdAt).toLocaleString()
                  },
                  {
                    label: "Updated",
                    value: new Date(project.updatedAt).toLocaleString()
                  }
                ]}
              />
            </div>
          </details>
        </DetailPanel>

        <DetailPanel
          title="Customer Contact Access"
          description="Customer Access visibility for this project. Full contact and account administration stays in People."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            {projectVisiblePortalGrants.length > 0 ? (
              <div className="space-y-3">
                {projectVisiblePortalGrants.map(({ grant }) => (
                  <div
                    key={grant.id}
                    className="rounded-[6px] border border-slate-200 bg-slate-50/80 px-4 py-3"
                  >
                    <p className="font-semibold text-slate-950">
                      {grant.customerContact?.contact?.displayName ??
                        grant.portalUser?.fullName ??
                        grant.portalUser?.email ??
                        grant.invitedEmail ??
                        "Portal contact"}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {grant.customerContact?.isPrimary
                        ? "Primary contact"
                        : (grant.customerContact?.relationshipLabel?.replaceAll(
                            "_",
                            " "
                          ) ?? "Customer contact")}
                    </p>
                    <p className="mt-2">
                      {grant.portalUser?.email ??
                        grant.invitedEmail ??
                        "Email not captured"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[6px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                No customer contacts currently have active portal visibility for
                this project.
              </div>
            )}
            <Link
              href={`/people?accessCustomerId=${project.customerId}#customer-access`}
              className={getWorkspaceActionLinkClassName("secondary")}
            >
              Manage in People
            </Link>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Project Continuity"
          description="Primary linked records stay visible; lower-frequency activity is tucked away."
        >
          <div className="grid gap-4">
            {projectEstimates[0] ? (
              <LinkedRecordCard
                href={`/estimates/${projectEstimates[0].id}`}
                title={projectEstimates[0].referenceNumber}
                subtitle="Primary estimate"
                meta={joinMetaParts([
                  projectEstimates[0].customer?.name ??
                    project.customer?.name ??
                    "Unknown customer",
                  formatUpdatedActivity(projectEstimates[0].updatedAt)
                ])}
                badge={renderStatusBadge(
                  formatStatusLabel(projectEstimates[0].status)
                )}
              />
            ) : null}
            {projectContracts[0] ? (
              <LinkedRecordCard
                href={`/contracts/${projectContracts[0].id}`}
                title={projectContracts[0].title}
                subtitle="Primary contract"
                meta={joinMetaParts([
                  getProjectContractSummary({
                    contract: projectContracts[0],
                    readinessSnapshot
                  }),
                  formatUpdatedActivity(projectContracts[0].updatedAt)
                ])}
                badge={renderStatusBadge(
                  formatStatusLabel(projectContracts[0].status)
                )}
              />
            ) : null}
            {projectJobs[0] ? (
              <LinkedRecordCard
                href={`/jobs/${projectJobs[0].id}`}
                title={projectJobs[0].project?.name ?? project.name}
                subtitle="Current job"
                meta={joinMetaParts([
                  projectJobs[0].estimate?.referenceNumber ??
                    "Project-driven job",
                  formatUpdatedActivity(projectJobs[0].updatedAt)
                ])}
                badge={renderStatusBadge(
                  formatStatusLabel(projectJobs[0].dispatchStatus)
                )}
              />
            ) : null}
            {projectInvoices[0] ? (
              <LinkedRecordCard
                href={`/invoices/${projectInvoices[0].id}`}
                title={projectInvoices[0].referenceNumber}
                subtitle={
                  projectInvoices[0].workflowRole === "deposit"
                    ? "Deposit invoice"
                    : "Current invoice"
                }
                meta={joinMetaParts([
                  getProjectInvoiceSummary(projectInvoices[0]),
                  formatUpdatedActivity(projectInvoices[0].updatedAt)
                ])}
                badge={renderStatusBadge(
                  formatStatusLabel(projectInvoices[0].status)
                )}
              />
            ) : null}
            {projectChangeOrders[0] ||
            projectAppointments[0] ||
            projectPunchlistItems[0] ||
            projectDailyLogs[0] ? (
              <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
                <summary className="cursor-pointer list-none font-semibold text-slate-950">
                  More linked activity
                </summary>
                <div className="mt-4 grid gap-4">
                  {projectChangeOrders[0] ? (
                    <LinkedRecordCard
                      href={`/change-orders/${projectChangeOrders[0].id}`}
                      title={projectChangeOrders[0].title}
                      subtitle="Current change order"
                      meta={joinMetaParts([
                        formatMoney(projectChangeOrders[0].priceAdjustment),
                        projectChangeOrders[0].invoice
                          ? `Invoice ${projectChangeOrders[0].invoice.referenceNumber}`
                          : "Project-linked scope change",
                        formatUpdatedActivity(projectChangeOrders[0].updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(projectChangeOrders[0].status)
                      )}
                    />
                  ) : null}
                  {projectAppointments[0] ? (
                    <LinkedRecordCard
                      href={`/appointments/${projectAppointments[0].id}`}
                      title={projectAppointments[0].title}
                      subtitle="Current appointment"
                      meta={`${projectAppointments[0].appointmentType.replaceAll("_", " ")} / ${new Date(projectAppointments[0].startsAt).toLocaleString()}`}
                      badge={renderStatusBadge(
                        formatStatusLabel(projectAppointments[0].status)
                      )}
                    />
                  ) : null}
                  {projectPunchlistItems[0] ? (
                    <LinkedRecordCard
                      href={`/punchlists/${projectPunchlistItems[0].id}`}
                      title={projectPunchlistItems[0].title}
                      subtitle="Current punchlist item"
                      meta={
                        projectPunchlistItems[0].assignee?.displayName ??
                        "Unassigned closeout item"
                      }
                      badge={renderStatusBadge(
                        formatStatusLabel(projectPunchlistItems[0].status)
                      )}
                    />
                  ) : null}
                  {projectDailyLogs[0] ? (
                    <LinkedRecordCard
                      href={`/daily-logs/${projectDailyLogs[0].id}`}
                      title={
                        projectDailyLogs[0].summary?.trim() ||
                        new Date(
                          `${projectDailyLogs[0].logDate}T00:00:00`
                        ).toLocaleDateString()
                      }
                      subtitle="Current daily log"
                      meta={joinMetaParts([
                        projectDailyLogs[0].weatherSummary ??
                          "Recent field execution record",
                        formatUpdatedActivity(projectDailyLogs[0].updatedAt)
                      ])}
                      badge={renderStatusBadge(
                        formatStatusLabel(projectDailyLogs[0].status)
                      )}
                    />
                  ) : null}
                </div>
              </details>
            ) : null}
            {!projectEstimates[0] &&
            !projectContracts[0] &&
            !projectJobs[0] &&
            !projectInvoices[0] &&
            !projectAppointments[0] &&
            !projectChangeOrders[0] &&
            !projectPunchlistItems[0] &&
            !projectDailyLogs[0] ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No related estimate, contract, appointment, change order,
                punchlist item, daily log, job, or invoice has been created yet.
              </div>
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Production Schedule"
          description="Compact schedule continuity from canonical jobs and job assignments, with calendar work still handed off to the shared schedule workspace."
        >
          <ProjectProductionScheduleContinuityPanel
            schedule={projectProductionScheduleContinuity}
          />
        </DetailPanel>

        <RelatedConversationsCard
          source="project"
          organizationId={project.organizationId}
          projectId={project.id}
          description="Project-scoped communication stays on canonical threads and routes back into the shared communications review workspace when follow-through is needed."
          countLabel="Project and record threads"
          emptyMessage="No project-scoped communication threads are attached to this canonical project yet."
          actionClassName={getWorkspaceActionLinkClassName("secondary")}
          threads={messageCenterTrail.threads}
        />

        <GateKeeperSubjectMemoryPanel
          memory={gateKeeperMemory}
          actionClassName={getWorkspaceActionLinkClassName("secondary")}
        />
      </aside>
    </div>
  );
}
