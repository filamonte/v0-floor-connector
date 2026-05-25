import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import {
  CommercialDocumentCommandBand,
  commercialDocumentHeaderShellClassName
} from "@/components/commercial-document-command-band";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { DocumentDeliveryHistoryPanel } from "@/components/document-delivery-history-panel";
import { DocumentReadinessCard } from "@/components/document-readiness-card";
import { EstimateStatusActions } from "@/components/estimate-status-actions";
import { EstimateApprovalNextStepsPanel } from "@/components/estimates/approval-next-steps-panel";
import { EstimateCustomerTimeline } from "@/components/estimates/estimate-customer-timeline";
import { EarlyAccessLockNotice } from "@/components/early-access-lock-notice";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NeedsAttentionPanel } from "@/components/operational-cues/needs-attention-panel";
import { CueStateControls } from "@/components/cue-states/cue-state-controls";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import { RevisionTimeline } from "@/components/revisions/revision-timeline";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { SendToContactSelect } from "@/components/send-to-contact-select";
import { WorkItemCreateForm } from "@/components/work-items/work-item-create-form";
import { WorkItemList } from "@/components/work-items/work-item-list";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import { listContracts } from "@/lib/contracts/data";
import { getDocumentDeliveryState } from "@/lib/document-delivery/data";
import { buildDocumentPrintHref } from "@/lib/document-engine/print";
import { deriveEstimateDocumentReadiness } from "@/lib/document-readiness/readiness";
import {
  openOrCreateScheduleOfValuesAction,
  rebuildApprovedEstimateSnapshotAction,
  sendEstimateToCustomerAction
} from "@/lib/estimates/actions";
import { resolveEstimateApprovalOrchestration } from "@/lib/estimates/approval-orchestration";
import {
  getEstimateById,
  listEstimateCustomerEvents,
  listEstimatePortalRecipients
} from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getOperationalCuesForSubject } from "@/lib/operational-cues/data";
import { getCueStateActionSupport } from "@/lib/cue-states/apply";
import { buildOperationalCueIdentity } from "@/lib/cue-states/identity";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { isOrganizationActivatedForProductionAction } from "@/lib/organizations/activation-guard";
import { listPeople } from "@/lib/people/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import {
  ensureInitialRecordRevision,
  listRecordRevisions
} from "@/lib/revisions/data";
import { buildEstimateRevisionSnapshot } from "@/lib/revisions/snapshots";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import { getIncludedEstimateScopeItems } from "@/lib/estimates/workspace";
import {
  completeWorkItemAction,
  createWorkItemAction,
  dismissWorkItemAction
} from "@/lib/work-items/actions";
import { listWorkItemsForSource } from "@/lib/work-items/data";
import {
  buildOperationalCueWorkItemPrefill,
  getOperationalCueWorkItemBridgeAction
} from "@/lib/work-items/prefill";
import {
  ActionBar,
  ProjectStateSummary,
  WorkflowBar,
  getStatusBadgeClassName
} from "@floorconnector/ui";
import type {
  ProjectStateSummaryProps,
  WorkflowStep
} from "@floorconnector/ui";

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts.filter((value) => value && value.trim().length > 0);

  return filtered.length > 0 ? filtered.join(", ") : null;
}

function formatUnitLabel(unit: string) {
  const normalized = unit.trim();
  const lower = normalized.toLowerCase();

  if (
    lower === "sqft" ||
    lower === "sf" ||
    lower === "square foot" ||
    lower === "square feet"
  ) {
    return "sqft";
  }

  if (lower === "lf" || lower === "linear foot" || lower === "linear feet") {
    return "lf";
  }

  if (lower === "each" || lower === "ea" || lower === "count") {
    return "ea";
  }

  return normalized || "ea";
}

function formatReadinessLabel(status: string | null) {
  if (!status) {
    return "not started";
  }

  return status.replaceAll("_", " ");
}

function getEstimateNextAction(input: {
  estimateStatus: string;
  projectId: string;
  estimateId: string;
  contractId: string | null;
  readinessStatus: string | null;
  depositInvoiceId: string | null;
}) {
  if (input.estimateStatus === "draft") {
    return {
      title: "Review and send estimate",
      description:
        "Finish the proposal review, then use the existing send or manual decision actions when the customer is ready to respond.",
      href: `/estimates/${input.estimateId}/edit`,
      label: "Back to edit"
    };
  }

  if (input.estimateStatus === "sent") {
    return {
      title: "Record customer decision",
      description:
        "Use the manual decision actions only when the customer approved or rejected outside the portal, such as paper signature, verbal approval, fake email during testing, or a non-portal customer.",
      href: `/estimates/${input.estimateId}#estimate-decision-actions`,
      label: "Review decision actions"
    };
  }

  if (input.estimateStatus === "rejected") {
    return {
      title: "Revise or resend estimate",
      description:
        "Review the rejected proposal, update the scope or pricing if needed, then resend through the existing estimate workflow.",
      href: `/estimates/${input.estimateId}/edit`,
      label: "Revise estimate"
    };
  }

  if (!input.contractId) {
    return {
      title: "Generate the contract",
      description:
        "Approved scope is ready to move into the canonical contract workflow.",
      href: `/contracts?estimateId=${input.estimateId}`,
      label: "Generate contract"
    };
  }

  if (
    input.readinessStatus === "waiting_on_deposit" &&
    input.depositInvoiceId
  ) {
    return {
      title: "Collect the deposit",
      description:
        "A deposit request exists and the project hub is tracking it as the active blocker.",
      href: `/invoices/${input.depositInvoiceId}`,
      label: "Review deposit invoice"
    };
  }

  return {
    title: "Use the project readiness hub",
    description:
      "The project page is now the authoritative place to clear contract, signature, and financial blockers in order.",
    href: `/projects/${input.projectId}`,
    label: "Open project workspace"
  };
}

function getEstimateMeaning(status: string) {
  if (status === "approved") {
    return "This proposal has been approved and now anchors the downstream contract, readiness, and billing chain.";
  }

  if (status === "sent") {
    return "This proposal is out for customer review. Keep the estimate body primary here while watching for the approval handoff into contract and project readiness.";
  }

  if (status === "rejected") {
    return "This proposal was rejected. Review the scope and terms here, then decide whether a revised estimate should re-enter the same project chain.";
  }

  return "This proposal is still being prepared. Review the scope and pricing here before moving it into customer-facing approval.";
}

function hasHtmlContent(value: string | null | undefined) {
  return Boolean(
    value &&
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim().length > 0
  );
}

function renderHtmlContent(value: string | null | undefined) {
  if (!hasHtmlContent(value)) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: value ?? "" }} />;
}

function buildGroupedLineItems(
  estimate: NonNullable<Awaited<ReturnType<typeof getEstimateById>>>
) {
  const groups = estimate.content.itemGroups.map((group) => ({
    id: group.id,
    label: group.label,
    items: [] as typeof estimate.lineItems
  }));
  const groupMap = new Map(
    groups.map((group) => [group.label.trim().toLowerCase(), group] as const)
  );
  const ungrouped = {
    id: null,
    label: "Manual Items",
    items: [] as typeof estimate.lineItems
  };

  estimate.lineItems.forEach((lineItem) => {
    if (lineItem.groupName) {
      const normalizedGroupName = lineItem.groupName.trim().toLowerCase();

      if (
        normalizedGroupName.length > 0 &&
        !groupMap.has(normalizedGroupName)
      ) {
        const nextGroup = {
          id: `group-${groups.length + 1}`,
          label: lineItem.groupName,
          items: [] as typeof estimate.lineItems
        };

        groups.push(nextGroup);
        groupMap.set(normalizedGroupName, nextGroup);
      }
    }

    const targetGroup =
      (lineItem.groupName
        ? groupMap.get(lineItem.groupName.trim().toLowerCase())
        : null) ?? ungrouped;

    targetGroup.items.push(lineItem);
  });

  return [ungrouped, ...groups].filter((group) => group.items.length > 0);
}

function buildProjectScheduleHref(projectId: string) {
  return buildScheduleHref({ projectId });
}

type EstimateDetailPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    showNextSteps?: string;
    workItemCue?: string;
  }>;
};

export default async function EstimateDetailPage({
  params,
  searchParams
}: EstimateDetailPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/estimates/${estimateId}`);
  const [
    estimate,
    organizationContext,
    contracts,
    jobs,
    invoices,
    customerEvents,
    communicationThreads
  ] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}`),
    getActiveOrganizationContext(user.id),
    listContracts(),
    listJobs(),
    listInvoices(),
    listEstimateCustomerEvents(estimateId, `/estimates/${estimateId}`),
    listCommunicationThreadsForSubject("estimate", estimateId)
  ]);

  if (!estimate) {
    notFound();
  }

  const deliveryState = await getDocumentDeliveryState({
    subjectType: "estimate",
    subjectId: estimate.id
  });

  await ensureInitialRecordRevision({
    organizationId: estimate.organizationId,
    subjectType: "estimate",
    subjectId: estimate.id,
    revisionKind: "system_snapshot",
    revisionReason:
      "Initial revision captured from the existing canonical estimate.",
    snapshot: buildEstimateRevisionSnapshot(estimate),
    createdByUserId: user.id
  });
  const recordRevisions = await listRecordRevisions({
    organizationId: estimate.organizationId,
    subjectType: "estimate",
    subjectId: estimate.id
  });

  const sendContactOptions =
    estimate.status === "draft" || estimate.status === "rejected"
      ? await listEstimatePortalRecipients({
          organizationId: estimate.organizationId,
          customerId: estimate.customerId,
          projectId: estimate.projectId
        })
      : [];
  const documentReadiness = deriveEstimateDocumentReadiness({
    id: estimate.id,
    referenceNumber: estimate.referenceNumber,
    status: estimate.status,
    customerId: estimate.customerId,
    customerName: estimate.customer?.name,
    customerEmail: estimate.customer?.email,
    projectId: estimate.projectId,
    projectName: estimate.project?.name,
    templateId: estimate.templateId,
    lineItemCount: estimate.lineItems.length,
    totalAmount: estimate.totalAmount,
    portalRecipientCount: sendContactOptions.length
  });
  const isProductionActionLocked = organizationContext
    ? !isOrganizationActivatedForProductionAction({
        id: organizationContext.organization.id,
        tenantStatus: organizationContext.organization.tenantStatus,
        lifecycleState: organizationContext.organization.lifecycleState
      })
    : false;
  const estimateContracts = contracts.filter(
    (contract) => contract.estimateId === estimate.id
  );
  const estimateJobs = jobs.filter((job) => job.estimateId === estimate.id);
  const estimateInvoices = invoices.filter(
    (invoice) => invoice.estimateId === estimate.id
  );
  const projectJobs = jobs.filter(
    (job) => job.projectId === estimate.projectId
  );
  const projectJobAssignments = await listJobAssignmentsByJobIds(
    projectJobs.map((job) => job.id),
    `/estimates/${estimate.id}`
  );
  const scheduledProjectJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "scheduled"
  );
  const unscheduledProjectJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const inProgressProjectJobs = projectJobs.filter(
    (job) => job.dispatchStatus === "in_progress"
  );
  const nextScheduledProjectJob =
    [...scheduledProjectJobs]
      .filter((job) => job.scheduledDate)
      .sort(
        (left, right) =>
          getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ?? null;
  const nextScheduledProjectAssignments = nextScheduledProjectJob
    ? (projectJobAssignments.get(nextScheduledProjectJob.id) ?? [])
    : [];
  const nextScheduledProjectAssignmentNames = nextScheduledProjectAssignments
    .map(
      (assignment) =>
        assignment.person?.displayName ?? assignment.vendor?.name ?? null
    )
    .filter((value): value is string => Boolean(value));
  const nextScheduledProjectCrewSummary = nextScheduledProjectJob
    ? getScheduleAssignmentSummary({
        assignmentNames: nextScheduledProjectAssignmentNames,
        crewVendorName: nextScheduledProjectJob.crewVendor?.name ?? null,
        assignmentCount: nextScheduledProjectAssignments.length
      })
    : null;
  const projectJobsWithoutAssignments = projectJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (projectJobAssignments.get(job.id)?.length ?? 0) === 0
  );
  const approvalOrchestration =
    estimate.status === "approved"
      ? await resolveEstimateApprovalOrchestration(
          estimate.id,
          `/estimates/${estimate.id}`
        )
      : null;
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: estimate.organizationId,
    projectId: estimate.projectId
  });
  const [estimateAttentionCues, linkedWorkItems, people] = await Promise.all([
    getOperationalCuesForSubject({
      organizationId: estimate.organizationId,
      subjectType: "estimate",
      subjectId: estimate.id,
      currentUserId: user.id
    }),
    listWorkItemsForSource({
      sourceType: "estimate",
      sourceId: estimate.id
    }),
    listPeople()
  ]);
  const selectedWorkItemCue =
    estimateAttentionCues.find(
      (cue) => cue.cueKey === resolvedSearchParams.workItemCue
    ) ?? null;
  const estimateWorkItemPrefill = selectedWorkItemCue
    ? buildOperationalCueWorkItemPrefill({ cue: selectedWorkItemCue })
    : null;
  const defaultEstimateWorkItemSource = estimateWorkItemPrefill ?? {
    sourceType: "estimate" as const,
    sourceId: estimate.id,
    linkPath: `/estimates/${estimate.id}`
  };
  const assignablePeople = people
    .filter((person) => person.isActive && person.isAssignable)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName
    }));
  const nextAction = getEstimateNextAction({
    estimateStatus: estimate.status,
    projectId: estimate.projectId,
    estimateId: estimate.id,
    contractId:
      readinessSnapshot?.contractId ?? estimateContracts[0]?.id ?? null,
    readinessStatus: readinessSnapshot?.status ?? null,
    depositInvoiceId: readinessSnapshot?.depositInvoiceId ?? null
  });

  const customerAddress = estimate.customer
    ? formatAddress([
        estimate.customer.addressLine1,
        estimate.customer.addressLine2,
        estimate.customer.city,
        estimate.customer.stateRegion,
        estimate.customer.postalCode,
        estimate.customer.countryCode
      ])
    : null;

  const projectAddress = estimate.project
    ? formatAddress([
        estimate.project.addressLine1,
        estimate.project.addressLine2,
        estimate.project.city,
        estimate.project.stateRegion,
        estimate.project.postalCode,
        estimate.project.countryCode
      ])
    : null;
  const readinessStatusLabel = formatReadinessLabel(
    readinessSnapshot?.status ?? null
  );
  const readinessBlockersLabel =
    readinessSnapshot && readinessSnapshot.blockers.length > 0
      ? readinessSnapshot.blockers
          .map((blocker) => blocker.replaceAll("_", " "))
          .join(", ")
      : "No active project-level commercial blockers recorded.";
  const estimateMeaning = getEstimateMeaning(estimate.status);
  const lineItemCount = estimate.lineItems.length;
  const primaryContract = estimateContracts[0] ?? null;
  const primaryInvoice = estimateInvoices[0] ?? null;
  const estimatePrimaryAction =
    estimate.status === "approved" && !primaryContract
      ? {
          label: "Create Contract",
          href: `/contracts?estimateId=${estimate.id}`
        }
      : estimate.status === "draft" || estimate.status === "rejected"
        ? {
            label: "Send Estimate",
            href: "#estimate-workflow-actions"
          }
        : null;
  const hasSignedContract = primaryContract?.status === "signed";
  const completedEstimateJobs = estimateJobs.filter(
    (job) => job.dispatchStatus === "completed"
  );
  const actionBarStatusTone =
    estimate.status === "approved"
      ? "success"
      : estimate.status === "rejected"
        ? "danger"
        : estimate.status === "sent"
          ? "warning"
          : "neutral";
  const contractStepState = primaryContract
    ? hasSignedContract
      ? "complete"
      : "current"
    : estimate.status === "approved"
      ? "current"
      : "upcoming";
  const jobStepState =
    estimateJobs.length > 0
      ? completedEstimateJobs.length > 0
        ? "complete"
        : "current"
      : hasSignedContract
        ? "current"
        : "upcoming";
  const invoiceStepState =
    estimateInvoices.length > 0
      ? estimateInvoices.every((invoice) => invoice.status === "paid")
        ? "complete"
        : "current"
      : completedEstimateJobs.length > 0
        ? "current"
        : "upcoming";
  const workflowSteps: WorkflowStep[] = [
    {
      id: "estimate",
      label: "Estimate",
      state:
        estimate.status === "approved"
          ? "complete"
          : estimate.status === "rejected"
            ? "blocked"
            : "current",
      description: formatStatusLabel(estimate.status)
    },
    {
      id: "contract",
      label: "Contract",
      state: contractStepState,
      description: primaryContract
        ? formatStatusLabel(primaryContract.status)
        : "After approval"
    },
    {
      id: "job",
      label: "Job",
      state: jobStepState,
      description:
        estimateJobs.length > 0
          ? `${estimateJobs.length} linked job${estimateJobs.length === 1 ? "" : "s"}`
          : hasSignedContract
            ? "Ready for project scheduling checks"
            : "After signed contract/readiness"
    },
    {
      id: "invoice",
      label: "Invoice",
      state: invoiceStepState,
      description: primaryInvoice
        ? `${estimateInvoices.length} linked invoice${estimateInvoices.length === 1 ? "" : "s"}`
        : completedEstimateJobs.length > 0
          ? "Completed work is ready to review"
          : "After production or billing trigger"
    }
  ];
  const estimateStateItems: ProjectStateSummaryProps["items"] = [
    {
      id: "total",
      label: "Total",
      value: formatMoney(estimate.totalAmount),
      tone: estimate.status === "approved" ? "complete" : "pending",
      detail: `${formatMoney(estimate.subtotalAmount)} subtotal`
    },
    {
      id: "tax-discount",
      label: "Tax / Discount",
      value: `${formatMoney(estimate.taxAmount)} tax`,
      tone: "pending",
      detail: `${formatMoney(estimate.discountAmount)} discount`
    },
    {
      id: "line-items",
      label: "Line Items",
      value: `${lineItemCount} item${lineItemCount === 1 ? "" : "s"}`,
      tone: lineItemCount > 0 ? "active" : "needsAction",
      detail:
        lineItemCount > 0
          ? "Readonly proposal review below"
          : "Add items from the editor"
    },
    {
      id: "readiness",
      label: "Project Readiness",
      value: <span className="capitalize">{readinessStatusLabel}</span>,
      tone:
        readinessSnapshot && readinessSnapshot.blockers.length > 0
          ? "needsAction"
          : readinessSnapshot
            ? "complete"
            : "pending",
      detail: readinessBlockersLabel
    }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <div
        className={[
          commercialDocumentHeaderShellClassName,
          "print:hidden"
        ].join(" ")}
      >
        <DetailPageHeader
          eyebrow="Estimate Review"
          title={estimate.title ?? estimate.referenceNumber}
          description={estimateMeaning}
          backHref="/estimates"
          backLabel="Back to estimates"
        />

        <CommercialDocumentCommandBand
          eyebrow="Commercial document"
          title="Estimate workflow summary"
          description="Review scope, approval state, and project continuity before moving this proposal toward contract or billing handoff."
          statusLabel={`${formatStatusLabel(estimate.status)} estimate`}
          projectHref={`/projects/${estimate.projectId}`}
          items={[
            {
              label: "Customer",
              value: estimate.customer?.name ?? "Unknown customer",
              detail: estimate.customer?.companyName ?? estimate.customer?.email
            },
            {
              label: "Project",
              value: estimate.project?.name ?? "Unknown project",
              detail: estimate.project
                ? formatStatusLabel(estimate.project.status)
                : "Project context unavailable"
            },
            {
              label: "Estimate total",
              value: formatMoney(estimate.totalAmount),
              detail: `${lineItemCount} line item${lineItemCount === 1 ? "" : "s"} / ${formatMoney(estimate.subtotalAmount)} subtotal`
            }
          ]}
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

        <div className="mt-6 space-y-3 print:hidden">
          <ActionBar
            title={nextAction.title}
            description={nextAction.description}
            statusLabel={`${formatStatusLabel(estimate.status)} estimate`}
            statusTone={actionBarStatusTone}
            nextActionLabel="Next best action"
            primaryAction={
              estimatePrimaryAction ? (
                estimatePrimaryAction.href.startsWith("#") ? (
                  <a
                    href={estimatePrimaryAction.href}
                    className={primaryActionClassName}
                  >
                    {estimatePrimaryAction.label}
                  </a>
                ) : (
                  <Link
                    href={estimatePrimaryAction.href}
                    className={primaryActionClassName}
                  >
                    {estimatePrimaryAction.label}
                  </Link>
                )
              ) : null
            }
            secondaryActions={
              <>
                <Link
                  href={buildDocumentPrintHref({
                    subjectType: "estimate",
                    subjectId: estimate.id
                  })}
                  className={secondaryActionClassName}
                >
                  {documentReadiness.safePreviewLabel}
                </Link>
                <Link
                  href={`/estimates/${estimate.id}/edit`}
                  className={secondaryActionClassName}
                >
                  Edit
                </Link>
                <ActionOverflowMenu>
                  <Link
                    href={`/projects/${estimate.projectId}`}
                    className={overflowActionClassName}
                  >
                    View Project
                  </Link>
                  {estimate.customer ? (
                    <Link
                      href={`/customers/${estimate.customer.id}`}
                      className={overflowActionClassName}
                    >
                      View Customer
                    </Link>
                  ) : null}
                </ActionOverflowMenu>
              </>
            }
            meta={
              <span>
                Estimate #{estimate.referenceNumber} |{" "}
                {estimate.customer?.name ?? "Unknown customer"}
              </span>
            }
          />

          <WorkflowBar title="Estimate workflow" steps={workflowSteps} />

          <ProjectStateSummary
            title="Estimate state summary"
            items={estimateStateItems}
          />
        </div>

        {estimate.status === "approved" && approvalOrchestration ? (
          <div className="mt-8 print:hidden">
            <EstimateApprovalNextStepsPanel
              orchestration={approvalOrchestration}
              contractAction={quickCreateContractFromEstimateAction}
              scheduleOfValuesAction={openOrCreateScheduleOfValuesAction}
              rebuildSnapshotAction={rebuildApprovedEstimateSnapshotAction}
              initialOpen={
                resolvedSearchParams.showNextSteps === "1" ||
                approvalOrchestration.contract.snapshotMissing
              }
            />
          </div>
        ) : null}
      </div>

      <section className="rounded-[2rem] border border-[var(--border-warm)] bg-white px-6 py-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10 print:rounded-none print:border-none print:px-0 print:py-0 print:shadow-none">
        <div className="grid gap-6 border-b border-[var(--border-warm)] pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--copper)]">
                Customer-facing estimate
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {estimate.title ?? estimate.referenceNumber}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                Review the proposal scope, pricing, customer context, and
                downstream handoff from one canonical estimate record.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  Customer
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {estimate.customer?.name ?? "Unknown customer"}
                </p>
              </div>
              <div className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  Project
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {estimate.project?.name ?? "Unknown project"}
                </p>
              </div>
              <div className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold capitalize text-[var(--text-primary)]">
                  {formatStatusLabel(estimate.status)}
                </p>
              </div>
            </div>

            {projectAddress ? (
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Service location:{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {projectAddress}
                </span>
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.25rem] border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
              Current proposal total
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {formatMoney(estimate.totalAmount)}
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border-warm)] pt-3">
                <dt>Estimate reference</dt>
                <dd className="font-medium text-[var(--text-primary)]">
                  #{estimate.referenceNumber}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border-warm)] pt-3">
                <dt>Subtotal</dt>
                <dd className="font-medium text-[var(--text-primary)]">
                  {formatMoney(estimate.subtotalAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border-warm)] pt-3">
                <dt>Tax / discount</dt>
                <dd className="font-medium text-[var(--text-primary)]">
                  {formatMoney(estimate.taxAmount)} /{" "}
                  {formatMoney(estimate.discountAmount)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="grid gap-6 border-b border-[var(--border-warm)] py-8 md:grid-cols-2">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Prepared by
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
              {organizationContext?.organization.displayName ??
                "FloorConnector"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {organizationContext?.organization.legalName ??
                "Estimate prepared inside the active organization workspace."}
            </p>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Proposal status
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="text-lg font-semibold capitalize text-[var(--text-primary)]">
                {formatStatusLabel(estimate.status)}
              </p>
              <p>Estimate #{estimate.referenceNumber}</p>
              <p>
                {lineItemCount} line item{lineItemCount === 1 ? "" : "s"} in the
                current proposal.
              </p>
            </div>
          </section>
        </div>

        <div className="border-b border-[var(--border-warm)] py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            Scope
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Review the proposal pricing, grouped scope, quantities, and totals
            here first. Workflow guidance stays above while lower sections carry
            customer, project, notes, and activity context.
          </p>
          <div className="mt-6 space-y-6">
            {buildGroupedLineItems(estimate).map((group) => (
              <div
                key={group.id ?? "ungrouped"}
                className="rounded-3xl border border-[var(--border-warm)] bg-[var(--highlight)] p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                    {group.label}
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {group.items.length} item
                    {group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                        <th className="pb-2 pr-4">Description</th>
                        <th className="pb-2 pr-4">Qty</th>
                        <th className="pb-2 pr-4">Unit</th>
                        <th className="pb-2 pr-4 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((lineItem) => (
                        <tr
                          key={lineItem.id}
                          className="align-top text-sm leading-6 text-[var(--text-primary)]"
                        >
                          <td className="rounded-l-2xl border-y border-l border-[var(--border-warm)] bg-white px-4 py-4">
                            <p className="font-medium text-[var(--text-primary)]">
                              {lineItem.name}
                            </p>
                            {lineItem.description ? (
                              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                {lineItem.description}
                              </p>
                            ) : null}
                          </td>
                          <td className="border-y border-[var(--border-warm)] bg-white px-4 py-4">
                            {lineItem.quantity}
                          </td>
                          <td className="border-y border-[var(--border-warm)] bg-white px-4 py-4">
                            {formatUnitLabel(lineItem.unit)}
                          </td>
                          <td className="border-y border-[var(--border-warm)] bg-white px-4 py-4 text-right">
                            {formatMoney(lineItem.unitPrice)}
                          </td>
                          <td className="rounded-r-2xl border-y border-r border-[var(--border-warm)] bg-white px-4 py-4 text-right font-medium text-[var(--text-primary)]">
                            {formatMoney(lineItem.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 border-b border-[var(--border-warm)] py-8 md:grid-cols-2">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Customer Contact / Billing Context
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {estimate.customer?.name ?? "Unknown customer"}
              </p>
              {estimate.customer?.companyName ? (
                <p>{estimate.customer.companyName}</p>
              ) : null}
              {estimate.customer?.email ? (
                <p>{estimate.customer.email}</p>
              ) : null}
              {estimate.customer?.phone ? (
                <p>{estimate.customer.phone}</p>
              ) : null}
              {customerAddress ? <p>{customerAddress}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Project Service Address
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {estimate.project?.name ?? "Unknown project"}
              </p>
              {estimate.project ? (
                <p className="capitalize">
                  Current status: {formatStatusLabel(estimate.project.status)}
                </p>
              ) : null}
              {estimate.project?.description ? (
                <p>{estimate.project.description}</p>
              ) : null}
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Service location
                </p>
                {projectAddress ? (
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-[var(--text-secondary)]">
                        Address line 1
                      </dt>
                      <dd className="font-medium text-[var(--text-primary)]">
                        {estimate.project?.addressLine1 ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-secondary)]">
                        Address line 2
                      </dt>
                      <dd className="font-medium text-[var(--text-primary)]">
                        {estimate.project?.addressLine2 ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-secondary)]">City</dt>
                      <dd className="font-medium text-[var(--text-primary)]">
                        {estimate.project?.city ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--text-secondary)]">
                        State / Postal
                      </dt>
                      <dd className="font-medium text-[var(--text-primary)]">
                        {[
                          estimate.project?.stateRegion,
                          estimate.project?.postalCode
                        ]
                          .filter(Boolean)
                          .join(" ") || "Not provided"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    No structured project service address is saved yet.
                  </p>
                )}
                <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                  This jobsite address is separate from the customer contact or
                  billing address.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {hasHtmlContent(estimate.content.scopeSummaryHtml) ||
            getIncludedEstimateScopeItems(estimate.content).length > 0 ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Scope / SOW
                </p>
                <div className="mt-3 space-y-4 rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
                  {renderHtmlContent(estimate.content.scopeSummaryHtml)}
                  {getIncludedEstimateScopeItems(estimate.content).length >
                  0 ? (
                    <ul className="space-y-2 pl-5">
                      {getIncludedEstimateScopeItems(estimate.content).map(
                        (item) => (
                          <li key={item.id}>{item.text}</li>
                        )
                      )}
                    </ul>
                  ) : null}
                </div>
              </section>
            ) : (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Scope / SOW
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                  No scope / SOW output has been prepared for this estimate yet.
                </div>
              </section>
            )}

            {hasHtmlContent(estimate.content.termsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Terms / conditions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
                  {renderHtmlContent(estimate.content.termsHtml)}
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.inclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Reusable inclusions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
                  {renderHtmlContent(estimate.content.inclusionsHtml)}
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.exclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Reusable exclusions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
                  {renderHtmlContent(estimate.content.exclusionsHtml)}
                </div>
              </section>
            ) : null}

            {!hasHtmlContent(estimate.content.termsHtml) &&
            !hasHtmlContent(estimate.content.inclusionsHtml) &&
            !hasHtmlContent(estimate.content.exclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Reusable estimate content
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                  No reusable terms, inclusions, or exclusions are filled on
                  this estimate yet.
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.notesHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Notes
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)]/70 px-5 py-4 text-sm leading-7 text-[var(--text-primary)]">
                  {renderHtmlContent(estimate.content.notesHtml)}
                </div>
              </section>
            ) : null}

            <DetailPanel
              title="Workflow Actions"
              description="Use the existing send and approval handoff in the right order before moving into contract or billing work."
            >
              <div className="mb-4">
                <DocumentReadinessCard readiness={documentReadiness} />
              </div>
              {estimate.status === "draft" || estimate.status === "rejected" ? (
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    {estimate.status === "draft"
                      ? "Send this estimate through the customer portal so FloorConnector can record delivery, email tracking, and the customer approval audit trail."
                      : "This estimate was rejected or returned for revision. After you finish updates, resend it through the customer portal from here."}
                  </div>
                  {estimate.customer?.email ? (
                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-[var(--border-warm)] bg-white px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                        <p className="font-medium text-[var(--text-primary)]">
                          Send prerequisites
                        </p>
                        <p className="mt-2">
                          This estimate can be sent only after the customer
                          email/contact has authenticated portal access with
                          active visibility to this project. Manage contact
                          identity, invite state, and project visibility from
                          People; this estimate action only triggers the send.
                        </p>
                        {estimate.customer ? (
                          <Link
                            href="/people#customer-access"
                            className="mt-3 inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
                          >
                            Manage access in People
                          </Link>
                        ) : null}
                      </div>
                      <form
                        id="estimate-workflow-actions"
                        action={sendEstimateToCustomerAction}
                        className="space-y-4"
                      >
                        <input
                          type="hidden"
                          name="estimateId"
                          value={estimate.id}
                        />
                        {sendContactOptions.length > 0 ? (
                          <SendToContactSelect
                            name="portalUserId"
                            defaultValue={
                              sendContactOptions.length === 1
                                ? sendContactOptions[0]?.portalUserId
                                : sendContactOptions.find(
                                    (option) => option.isPrimaryContact
                                  )?.portalUserId
                            }
                            options={sendContactOptions.map((option) => ({
                              value: option.portalUserId,
                              label:
                                option.contactDisplayName ??
                                option.fullName ??
                                option.email,
                              email: option.contactEmail ?? option.email,
                              isPrimary: option.isPrimaryContact
                            }))}
                            hint="People owns contact identity and portal access. Leaving this blank uses the primary customer contact when available, then the existing customer email fallback."
                          />
                        ) : (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                            No portal-ready contact is available for this
                            project. Manage the contact and project access from
                            People before sending.
                          </div>
                        )}
                        {isProductionActionLocked ? (
                          <EarlyAccessLockNotice />
                        ) : null}
                        {isProductionActionLocked ? (
                          <p className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                            Submitting while locked records failed delivery
                            evidence only. It will not email the customer or
                            mark the estimate sent.
                          </p>
                        ) : null}
                        <button
                          type="submit"
                          disabled={sendContactOptions.length === 0}
                          className="inline-flex items-center rounded-full bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)] disabled:cursor-not-allowed disabled:bg-[var(--highlight)] disabled:text-[var(--text-secondary)]"
                        >
                          Send review link
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                      <p className="font-medium text-amber-950">
                        Customer email is missing on the canonical customer
                        record.
                      </p>
                      <p className="mt-2">
                        Estimate send uses the shared estimate -&gt; customer
                        chain and an active portal contact. People is the
                        management surface for contact identity, portal invite
                        state, and project visibility.
                      </p>
                      <p className="mt-2">
                        Add the direct email on the customer first, or review
                        the linked lead if the contact handoff into the customer
                        record looks incomplete.
                      </p>
                      <p className="mt-2">
                        After the email is saved, confirm the same customer also
                        has an active portal access grant with visibility to
                        this project before retrying send.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {estimate.customer ? (
                          <Link
                            href={`/customers/${estimate.customer.id}`}
                            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                          >
                            Open customer
                          </Link>
                        ) : null}
                        {estimate.opportunity ? (
                          <Link
                            href={`/leads/${estimate.opportunity.id}`}
                            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                          >
                            Review linked lead
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              <EstimateStatusActions
                estimateId={estimate.id}
                currentStatus={estimate.status}
              />
              {estimate.status !== "approved" ? (
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {estimate.status === "sent"
                    ? "Customer approval now happens in the portal. This workspace stays read-only on the decision itself while tracking delivery and response history."
                    : "Jobs and contracts should be created after this estimate reaches the approved state."}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                  Approved estimates should now move through the project
                  readiness hub for contract, signature, and financial handoff
                  before downstream jobs or standard invoices.
                </p>
              )}
            </DetailPanel>

            <DetailPanel
              title="Customer Timeline"
              description="Track when the estimate was sent, opened, reviewed, commented on, and approved or rejected."
            >
              <EstimateCustomerTimeline events={customerEvents} />
            </DetailPanel>

            <DocumentDeliveryHistoryPanel
              subjectType="estimate"
              subjectId={estimate.id}
              events={deliveryState.events}
              sourceLabel={`Estimate ${estimate.referenceNumber}`}
              sourceHref={`/estimates/${estimate.id}`}
              boundaryCopy="Manual entries record evidence only. The Send review link action writes send_requested plus sent or failed provider evidence; provider email delivery never approves the estimate, creates contracts or invoices, or mutates payment state."
            />

            <section
              id="work-items"
              className="rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Internal follow-through
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">
                    Team work tied to this estimate
                  </h3>
                  <p className="mt-1 max-w-[68ch] text-sm leading-6 text-slate-600">
                    Create a work item when this estimate needs team follow-up.
                    Cue prefill is only a draft; nothing is created until you
                    submit.
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
                <details className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Create internal work item
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Internal follow-through is available when needed, but
                        proposal review stays primary on this estimate.
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Expand
                    </span>
                  </summary>
                  <div className="mt-4">
                    <p className="mb-4 text-sm leading-6 text-slate-600">
                      {estimateWorkItemPrefill
                        ? "Prefilled from a deterministic estimate cue. Review the owner, due date, and context; nothing is created until you submit."
                        : "Use this form when estimate follow-through needs an owner, due date, and explicit completion state."}
                    </p>
                    <WorkItemCreateForm
                      action={createWorkItemAction}
                      returnTo={`/estimates/${estimate.id}`}
                      sourceType={defaultEstimateWorkItemSource.sourceType}
                      sourceId={defaultEstimateWorkItemSource.sourceId}
                      linkPath={defaultEstimateWorkItemSource.linkPath}
                      customerId={estimate.customerId}
                      projectId={estimate.projectId}
                      defaultKind={
                        estimateWorkItemPrefill?.kind ?? "estimate_follow_up"
                      }
                      defaultTitle={estimateWorkItemPrefill?.title}
                      defaultDescription={estimateWorkItemPrefill?.description}
                      defaultDueAt={estimateWorkItemPrefill?.dueAt}
                      defaultPriority={
                        estimateWorkItemPrefill?.priority ?? "normal"
                      }
                      dedupeKey={estimateWorkItemPrefill?.dedupeKey}
                      metadata={estimateWorkItemPrefill?.metadata}
                      kindOptions={[
                        {
                          value: "estimate_follow_up",
                          label: "Estimate follow-up"
                        },
                        { value: "human_handoff", label: "Human handoff" },
                        { value: "manual", label: "Manual" }
                      ]}
                      assignablePeople={assignablePeople}
                      boundaryCopy="Work items are internal-only and human-submitted. Creating, completing, or dismissing one does not change estimate status, customer-visible messages, contract generation, invoice state, project readiness, or financial calculations."
                    />
                  </div>
                </details>

                <section className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Linked work items
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Internal actions tied directly to this canonical estimate.
                  </p>
                  <div className="mt-4">
                    <WorkItemList
                      workItems={linkedWorkItems}
                      returnTo={`/estimates/${estimate.id}`}
                      completeAction={completeWorkItemAction}
                      dismissAction={dismissWorkItemAction}
                      emptyTitle="No work items are linked to this estimate yet."
                      emptyDescription="Create an internal work item when estimate follow-up needs an owner, due date, and completion state."
                    />
                  </div>
                </section>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <details className="rounded-lg border border-[var(--border-warm)] bg-white px-5 py-4 shadow-sm">
              <summary className="cursor-pointer list-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Revision History
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Latest proposal snapshots are available when needed; they stay
                  secondary to the active proposal.
                </p>
              </summary>
              <div className="mt-5">
                <RevisionTimeline revisions={recordRevisions} />
              </div>
            </details>

            <NeedsAttentionPanel
              cues={estimateAttentionCues}
              description="Estimate-specific cues stay secondary to the customer-facing proposal. Dismiss and snooze only adjust your visibility."
              getWorkItemAction={getOperationalCueWorkItemBridgeAction}
              getCueStateControls={(cue) => (
                <CueStateControls
                  identity={buildOperationalCueIdentity(cue)}
                  support={getCueStateActionSupport(cue)}
                  returnTo={`/estimates/${estimate.id}`}
                />
              )}
            />

            <DetailPanel
              title="Connected Workflow"
              description="Primary handoff links stay visible; downstream activity expands only when needed."
            >
              <div className="grid gap-4">
                {estimate.project ? (
                  <LinkedRecordCard
                    href={`/projects/${estimate.project.id}`}
                    title={estimate.project.name}
                    subtitle="Project"
                    meta={estimate.customer?.name ?? "Unknown customer"}
                    badge={
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                          estimate.project.status
                        )}`}
                      >
                        {formatStatusLabel(estimate.project.status)}
                      </span>
                    }
                  />
                ) : null}
                {estimateContracts[0] ? (
                  <LinkedRecordCard
                    href={`/contracts/${estimateContracts[0].id}`}
                    title={estimateContracts[0].title}
                    subtitle="Current contract"
                    meta={
                      estimateContracts[0].template?.name
                        ? `${estimateContracts[0].template.name} | project hub handles readiness`
                        : "Project hub handles readiness"
                    }
                    badge={
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                          estimateContracts[0].status
                        )}`}
                      >
                        {formatStatusLabel(estimateContracts[0].status)}
                      </span>
                    }
                  />
                ) : null}
                {estimateInvoices[0] ? (
                  <LinkedRecordCard
                    href={`/invoices/${estimateInvoices[0].id}`}
                    title={estimateInvoices[0].referenceNumber}
                    subtitle="Current invoice"
                    meta={`Balance due ${formatMoney(estimateInvoices[0].balanceDueAmount)}`}
                    badge={
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                          estimateInvoices[0].status
                        )}`}
                      >
                        {formatStatusLabel(estimateInvoices[0].status)}
                      </span>
                    }
                  />
                ) : null}
                {estimateJobs[0] ? (
                  <LinkedRecordCard
                    href={`/jobs/${estimateJobs[0].id}`}
                    title={estimateJobs[0].project?.name ?? "Job"}
                    subtitle="Current job"
                    meta={
                      estimateJobs[0].scheduledDate
                        ? `Scheduled ${new Date(`${estimateJobs[0].scheduledDate}T00:00:00`).toLocaleDateString()}`
                        : "Unscheduled"
                    }
                    badge={
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                          estimateJobs[0].dispatchStatus
                        )}`}
                      >
                        {formatStatusLabel(estimateJobs[0].dispatchStatus)}
                      </span>
                    }
                  />
                ) : null}
                {estimateContracts.length > 1 ||
                estimateJobs.length > 1 ||
                estimateInvoices.length > 1 ? (
                  <details className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    <summary className="cursor-pointer list-none font-semibold text-[var(--text-primary)]">
                      View all linked records
                    </summary>
                    <div className="mt-4 grid gap-4">
                      {estimateContracts.slice(1).map((contract) => (
                        <LinkedRecordCard
                          key={contract.id}
                          href={`/contracts/${contract.id}`}
                          title={contract.title}
                          subtitle="Contract"
                          meta={contract.template?.name ?? "Contract"}
                          badge={
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                                contract.status
                              )}`}
                            >
                              {formatStatusLabel(contract.status)}
                            </span>
                          }
                        />
                      ))}
                      {estimateInvoices.slice(1).map((invoice) => (
                        <LinkedRecordCard
                          key={invoice.id}
                          href={`/invoices/${invoice.id}`}
                          title={invoice.referenceNumber}
                          subtitle="Invoice"
                          meta={`Balance due ${formatMoney(invoice.balanceDueAmount)}`}
                          badge={
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                                invoice.status
                              )}`}
                            >
                              {formatStatusLabel(invoice.status)}
                            </span>
                          }
                        />
                      ))}
                      {estimateJobs.slice(1).map((job) => (
                        <LinkedRecordCard
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          title={job.project?.name ?? "Job"}
                          subtitle="Job"
                          meta={
                            job.scheduledDate
                              ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
                              : "Unscheduled"
                          }
                          badge={
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadgeClassName(
                                job.dispatchStatus
                              )}`}
                            >
                              {formatStatusLabel(job.dispatchStatus)}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
                {estimateContracts.length === 0 &&
                estimateJobs.length === 0 &&
                estimateInvoices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    No downstream contract, job, or invoice records are linked
                    to this estimate yet. Use the project readiness hub once
                    this estimate is approved.
                  </p>
                ) : null}
              </div>
            </DetailPanel>

            <DetailPanel
              title={
                estimate.status === "approved"
                  ? "Production Schedule"
                  : "Schedule Handoff"
              }
              description={
                estimate.status === "approved"
                  ? "Compact production context from canonical project jobs and job assignments, with scheduling work still handed off to the shared schedule workspace."
                  : "Scheduling does not start from draft or sent estimates. Approval and project readiness handoff come first, so this page stays explicit about that blocker."
              }
            >
              <div className="space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
                {estimate.status === "approved" ? (
                  <>
                    <ScheduleContextMetrics
                      items={[
                        {
                          label: "Scheduled",
                          value: scheduledProjectJobs.length
                        },
                        {
                          label: "Unscheduled",
                          value: unscheduledProjectJobs.length
                        },
                        {
                          label: "In progress",
                          value: inProgressProjectJobs.length
                        }
                      ]}
                    />

                    {nextScheduledProjectJob ? (
                      <ScheduleContextFocusCard
                        eyebrow={
                          nextScheduledProjectJob.dispatchStatus ===
                          "in_progress"
                            ? "Work in progress"
                            : "Next scheduled job"
                        }
                        title={
                          nextScheduledProjectJob.project?.name ??
                          estimate.project?.name ??
                          "Project job"
                        }
                        titleHref={`/jobs/${nextScheduledProjectJob.id}`}
                        statusLabel={formatStatusLabel(
                          nextScheduledProjectJob.dispatchStatus
                        )}
                        summary={formatScheduleSummaryWindow({
                          scheduledDate: nextScheduledProjectJob.scheduledDate,
                          scheduledStartAt:
                            nextScheduledProjectJob.scheduledStartAt,
                          scheduledEndAt: nextScheduledProjectJob.scheduledEndAt
                        })}
                        detailRows={[
                          {
                            label: "Crew",
                            value:
                              nextScheduledProjectAssignments.length > 0
                                ? nextScheduledProjectCrewSummary
                                : nextScheduledProjectJob.dispatchStatus ===
                                    "scheduled"
                                  ? "Scheduled, but crew assignment still needs to be confirmed"
                                  : nextScheduledProjectCrewSummary
                          }
                        ]}
                      />
                    ) : (
                      <ScheduleContextNotice
                        eyebrow={
                          projectJobs.length > 0
                            ? "Ready for scheduling"
                            : "No jobs yet"
                        }
                        title={
                          projectJobs.length > 0
                            ? "Approved work exists, but no schedule commitment is set yet"
                            : "No production jobs are linked to this estimate's project yet"
                        }
                      >
                        {projectJobs.length > 0
                          ? "This estimate is approved and project jobs already exist, but they are still unscheduled. The next production commitment will show here once a real date is attached."
                          : "Approval is complete, but downstream production jobs have not been created yet on the canonical project chain."}
                      </ScheduleContextNotice>
                    )}

                    <ContextFactsList
                      items={[
                        {
                          label: "Project link",
                          value: estimate.project ? (
                            <Link
                              href={`/projects/${estimate.project.id}`}
                              className="font-medium text-[var(--copper)] hover:text-[var(--copper-light)]"
                            >
                              {estimate.project.name}
                            </Link>
                          ) : (
                            "Project context unavailable"
                          )
                        },
                        {
                          label: "Crew assignment state",
                          value:
                            nextScheduledProjectJob &&
                            nextScheduledProjectCrewSummary
                              ? nextScheduledProjectCrewSummary
                              : projectJobsWithoutAssignments.length > 0
                                ? `${projectJobsWithoutAssignments.length} job${
                                    projectJobsWithoutAssignments.length === 1
                                      ? ""
                                      : "s"
                                  } still need crew assignment rows`
                                : projectJobs.length > 0
                                  ? "Crew coverage is already attached where needed"
                                  : "No project jobs yet"
                        }
                      ]}
                    />

                    <ScheduleContextActions
                      actions={[
                        ...(nextScheduledProjectJob
                          ? [
                              {
                                href: `/jobs/${nextScheduledProjectJob.id}`,
                                label: "Open next scheduled job" as const
                              }
                            ]
                          : []),
                        {
                          href: buildProjectScheduleHref(estimate.projectId),
                          label: "Open schedule",
                          variant: "subtle"
                        }
                      ]}
                    />
                  </>
                ) : (
                  <ScheduleContextNotice
                    eyebrow="Approval blocker"
                    title={
                      estimate.status === "sent"
                        ? "Production scheduling starts after customer approval"
                        : estimate.status === "rejected"
                          ? "Rejected estimates do not enter production scheduling"
                          : "Draft estimates do not enter production scheduling"
                    }
                    tone="warning"
                  >
                    {estimate.status === "sent"
                      ? "This estimate is still waiting on customer approval. Keep scheduling blocked until approval lands and the downstream project readiness handoff is clear."
                      : estimate.status === "rejected"
                        ? "Revise and re-approve this estimate before any production scheduling context should apply."
                        : "Finish scope, send for customer review, and wait for approval before production scheduling context should appear here."}
                  </ScheduleContextNotice>
                )}
              </div>
            </DetailPanel>

            <RelatedConversationsCard
              source="estimate"
              description="Estimate communication stays on canonical threads and routes back into the shared communications workspace when proposal follow-through is needed."
              countLabel="Estimate threads"
              emptyMessage="No estimate-scoped communication threads are attached to this canonical estimate yet."
              actionClassName="inline-flex items-center rounded-full border border-[var(--border-warm)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-dark)] hover:bg-[var(--highlight)]"
              threads={communicationThreads}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
