import Link from "next/link";
import { notFound } from "next/navigation";
import { computeInvoicePaymentWorkflowGate } from "@floorconnector/domain";
import type { Payment, PaymentEvent } from "@floorconnector/types";

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
import { EarlyAccessLockNotice } from "@/components/early-access-lock-notice";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePaymentForm } from "@/components/invoice-payment-form";
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
import { listCatalogItems } from "@/lib/catalogs/data";
import { listInvoiceChangeOrders } from "@/lib/change-orders/data";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { getDocumentDeliveryState } from "@/lib/document-delivery/data";
import {
  recordInvoicePaymentAction,
  sendInvoiceReviewEmailAction,
  updateInvoiceAction
} from "@/lib/invoices/actions";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  getInvoiceById,
  listInvoicePortalRecipients,
  listInvoiceSourceOptions
} from "@/lib/invoices/data";
import { listEstimates } from "@/lib/estimates/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { isOrganizationActivatedForProductionAction } from "@/lib/organizations/activation-guard";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getOperationalCuesForSubject } from "@/lib/operational-cues/data";
import { getCueStateActionSupport } from "@/lib/cue-states/apply";
import { buildOperationalCueIdentity } from "@/lib/cue-states/identity";
import {
  classifyPaymentEventEvidence,
  deriveInvoicePaymentLifecycleSummary,
  getPaymentProviderReferenceRows
} from "@/lib/financials/payment-reconciliation-core";
import { listPeople } from "@/lib/people/data";
import { getProgressBillingByEstimateId } from "@/lib/progress-billing/data";
import { listProjects } from "@/lib/projects/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import {
  ensureInitialRecordRevision,
  listRecordRevisions
} from "@/lib/revisions/data";
import { buildInvoiceRevisionSnapshot } from "@/lib/revisions/snapshots";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import {
  ActionBar,
  ProjectStateSummary,
  WorkflowBar
} from "@floorconnector/ui";
import type {
  ProjectStateSummaryProps,
  WorkflowStep
} from "@floorconnector/ui";
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

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    workItemCue?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function parseMoney(amount: string | number) {
  return Number(amount);
}

function formatRate(value: string) {
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : "Not set";
}

function formatReadinessLabel(status: string | null) {
  if (!status) {
    return "not started";
  }

  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function getInvoiceLineageBadge(input: {
  lineageType?: string | null;
  invoiceOnlyAdjustmentKind?: string | null;
}) {
  switch (input.lineageType) {
    case "estimate_snapshot_item":
      return "Estimate snapshot";
    case "sov_item":
      return "SOV item";
    case "change_order_snapshot_item":
      return "Change order snapshot";
    case "invoice_only_adjustment":
      return input.invoiceOnlyAdjustmentKind === "manual_catalog_item"
        ? "Manual catalog item"
        : "Invoice-only adjustment";
    default:
      return "Legacy row";
  }
}

function getPaymentEventLabel(eventType: PaymentEvent["eventType"]) {
  switch (eventType) {
    case "payment_requested":
      return "Customer payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_succeeded":
      return "Payment succeeded";
    case "payment_failed":
      return "Payment failed";
    case "payment_voided":
      return "Payment voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(eventType);
  }
}

function getOnlinePaymentReadinessSummary(input: {
  canStartCheckout: boolean;
  invoiceStatus: string;
  balanceDueAmount: string;
}) {
  if (input.invoiceStatus === "void") {
    return "Online payment stays closed because this invoice is void and preserved for billing history.";
  }

  if (input.invoiceStatus === "draft") {
    return "Send the invoice before exposing customer-facing online payment actions in the invoice/payment stage.";
  }

  if (!input.canStartCheckout || Number(input.balanceDueAmount) <= 0) {
    return "Customer-facing payment is effectively complete because no balance remains due.";
  }

  return "This invoice is ready for secure customer checkout on the canonical invoice/payment chain.";
}

function getRecentPaymentSignal(input: {
  latestPayment: Payment | null;
  latestEvent: PaymentEvent | null;
}) {
  if (input.latestEvent?.eventType === "payment_failed") {
    return `Recent payment attempt failed ${formatDateTime(input.latestEvent.occurredAt)}. Keep collections attention on the remaining balance before assuming the customer is clear.`;
  }

  if (input.latestEvent?.eventType === "checkout_started") {
    return `A customer checkout session started ${formatDateTime(input.latestEvent.occurredAt)}. Use this as a signal that payment is in motion, not yet complete.`;
  }

  if (input.latestEvent?.eventType === "payment_succeeded") {
    return `A secure payment completed ${formatDateTime(input.latestEvent.occurredAt)} and was applied to this invoice.`;
  }

  if (input.latestEvent?.eventType === "payment_requested") {
    return `Customer-facing payment was requested ${formatDateTime(input.latestEvent.occurredAt)}. The invoice is now in a collections follow-through phase.`;
  }

  if (input.latestEvent?.eventType === "payment_voided") {
    return `A secure payment was voided ${formatDateTime(input.latestEvent.occurredAt)}. Treat the invoice as open again until a completed payment lands.`;
  }

  if (input.latestPayment) {
    return `Latest recorded payment was ${formatStatusLabel(input.latestPayment.status)} on ${formatDate(input.latestPayment.paymentDate)}.`;
  }

  return "No customer-facing or contractor-recorded payment activity has been captured yet.";
}

function getInvoiceTypeLabel(input: {
  billingModel: string;
  workflowRole: string;
}) {
  if (input.billingModel === "aia_progress") {
    return "Progress invoice";
  }

  if (input.workflowRole === "deposit") {
    return "Deposit invoice";
  }

  return "Standard invoice";
}

function getInvoiceTypeMeaning(input: {
  billingModel: string;
  workflowRole: string;
  projectName: string | null;
}) {
  if (input.billingModel === "aia_progress") {
    return `${
      input.projectName ?? "This project"
    } is in the invoice/payment stage through percent-complete schedule-of-values billing. Structural billing edits belong in the progress billing workspace, while broader readiness belongs in Project Workspace.`;
  }

  if (input.workflowRole === "deposit") {
    return `${
      input.projectName ?? "This project"
    } is using this invoice for deposit readiness on the same canonical project and payment chain before job/schedule handoff can proceed.`;
  }

  return `${
    input.projectName ?? "This project"
  } is using this invoice as a standard billing record on the shared estimate/contract, job/schedule, and payment chain.`;
}

function getInvoiceContinuityTitle(input: {
  billingModel: string;
  workflowRole: string;
}) {
  if (input.billingModel === "aia_progress") {
    return "Progress billing continuity";
  }

  if (input.workflowRole === "deposit") {
    return "Deposit continuity";
  }

  return "Billing continuity";
}

function buildProjectScheduleHref(projectId: string) {
  return buildScheduleHref({ projectId });
}

function getInvoiceActionBarStatusTone(status: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "void") {
    return "neutral" as const;
  }

  if (status === "partially_paid" || status === "sent") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export default async function InvoiceDetailPage({
  params,
  searchParams
}: InvoiceDetailPageProps) {
  const { invoiceId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/invoices/${invoiceId}`);
  const [
    invoice,
    projects,
    estimates,
    jobs,
    changeOrders,
    sourceOptions,
    catalogItems,
    communicationThreads
  ] = await Promise.all([
    getInvoiceById(invoiceId, `/invoices/${invoiceId}`),
    listProjects(),
    listEstimates(),
    listJobs(),
    listInvoiceChangeOrders(invoiceId, `/invoices/${invoiceId}`),
    listInvoiceSourceOptions(),
    listCatalogItems(),
    listCommunicationThreadsForSubject("invoice", invoiceId)
  ]);

  if (!invoice) {
    notFound();
  }

  const organizationContext = await getActiveOrganizationContext(user.id);
  const deliveryState = await getDocumentDeliveryState({
    subjectType: "invoice",
    subjectId: invoice.id
  });
  const canSendInvoiceReviewLink =
    (invoice.status === "sent" || invoice.status === "partially_paid") &&
    Number(invoice.balanceDueAmount) > 0;
  const sendContactOptions = canSendInvoiceReviewLink
    ? await listInvoicePortalRecipients({
        organizationId: invoice.organizationId,
        customerId: invoice.customerId,
        projectId: invoice.projectId
      })
    : [];
  const isProductionActionLocked = organizationContext
    ? !isOrganizationActivatedForProductionAction({
        id: organizationContext.organization.id,
        tenantStatus: organizationContext.organization.tenantStatus,
        lifecycleState: organizationContext.organization.lifecycleState
      })
    : false;

  await ensureInitialRecordRevision({
    organizationId: invoice.organizationId,
    subjectType: "invoice",
    subjectId: invoice.id,
    revisionKind: "system_snapshot",
    revisionReason:
      "Initial revision captured from the existing canonical invoice.",
    snapshot: buildInvoiceRevisionSnapshot(invoice),
    createdByUserId: user.id
  });
  const recordRevisions = await listRecordRevisions({
    organizationId: invoice.organizationId,
    subjectType: "invoice",
    subjectId: invoice.id
  });

  const progressBillingWorkspace = invoice.estimate
    ? await getProgressBillingByEstimateId(
        invoice.estimate.id,
        `/invoices/${invoiceId}`
      )
    : null;

  const financialSettings = await getOrganizationFinancialSettings(
    invoice.organizationId
  );
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: invoice.organizationId,
    projectId: invoice.projectId
  });
  const [invoiceAttentionCues, linkedWorkItems, people] = await Promise.all([
    getOperationalCuesForSubject({
      organizationId: invoice.organizationId,
      subjectType: "invoice",
      subjectId: invoice.id,
      currentUserId: user.id
    }),
    listWorkItemsForSource({
      sourceType: "invoice",
      sourceId: invoice.id
    }),
    listPeople()
  ]);
  const selectedWorkItemCue =
    invoiceAttentionCues.find(
      (cue) => cue.cueKey === resolvedSearchParams.workItemCue
    ) ?? null;
  const invoiceWorkItemPrefill = selectedWorkItemCue
    ? buildOperationalCueWorkItemPrefill({ cue: selectedWorkItemCue })
    : null;
  const defaultInvoiceWorkItemSource = invoiceWorkItemPrefill ?? {
    sourceType: "invoice" as const,
    sourceId: invoice.id,
    linkPath: `/invoices/${invoice.id}`
  };
  const assignablePeople = people
    .filter((person) => person.isActive && person.isAssignable)
    .map((person) => ({
      id: person.id,
      displayName: person.displayName
    }));
  const onlinePaymentGate = computeInvoicePaymentWorkflowGate({
    invoiceStatus: invoice.status,
    balanceDueAmount: invoice.balanceDueAmount
  });
  const latestPaymentEvent = invoice.paymentEvents[0] ?? null;
  const latestPaymentFailure =
    invoice.paymentEvents.find(
      (event) => event.eventType === "payment_failed"
    ) ?? null;
  const latestCheckoutStarted =
    invoice.paymentEvents.find(
      (event) => event.eventType === "checkout_started"
    ) ?? null;
  const latestPaymentSucceeded =
    invoice.paymentEvents.find(
      (event) => event.eventType === "payment_succeeded"
    ) ?? null;
  const latestPaymentRequested =
    invoice.paymentEvents.find(
      (event) => event.eventType === "payment_requested"
    ) ?? null;
  const latestPaymentVoided =
    invoice.paymentEvents.find(
      (event) => event.eventType === "payment_voided"
    ) ?? null;
  const nextAction =
    invoice.status === "void"
      ? {
          title: "Invoice is closed",
          description:
            "This invoice is void, so the invoice/payment stage stays focused on historical review instead of payment collection or editing changes."
        }
      : invoice.status === "paid"
        ? {
            title: "Billing review is current",
            description:
              "This invoice is fully paid. Use the secondary or overflow links for broader project, estimate/contract, or job/schedule context."
          }
        : invoice.status === "draft"
          ? {
              title: "Review and send invoice",
              description:
                "Finish billing details, lineage, tax, retainage, and status in the existing invoice editor before customer-facing collection begins. Resolve upstream project, contract, job, or deposit blockers from Project Workspace.",
              primaryLabel: "Send Invoice",
              primaryHref: "#invoice-editing"
            }
          : Number(invoice.balanceDueAmount) > 0
            ? {
                title: latestPaymentFailure
                  ? "Follow up on the failed payment attempt"
                  : latestCheckoutStarted
                    ? "Wait for payment completion"
                    : latestPaymentSucceeded &&
                        invoice.status === "partially_paid"
                      ? invoice.workflowRole === "deposit"
                        ? "Close the remaining deposit after the recent payment"
                        : "Close the remaining balance after the recent payment"
                      : latestPaymentRequested
                        ? "Monitor the customer payment request"
                        : latestPaymentVoided
                          ? "Restart payment follow-through after the void"
                          : invoice.status === "partially_paid"
                            ? invoice.workflowRole === "deposit"
                              ? "Collect the remaining deposit balance"
                              : "Collect the remaining balance"
                            : "Record the next payment",
                description: latestPaymentFailure
                  ? "A customer payment attempt failed, so the remaining invoice/payment balance still needs active follow-through from this workspace."
                  : latestCheckoutStarted
                    ? "A customer has already entered checkout. Keep attention on the outcome instead of recording a parallel payment unless the provider flow fails."
                    : latestPaymentSucceeded &&
                        invoice.status === "partially_paid"
                      ? invoice.workflowRole === "deposit"
                        ? "A provider-backed deposit payment has landed, but part of the deposit still remains before the downstream job/schedule handoff is complete."
                        : "A provider-backed payment has landed, but the invoice still carries an open balance."
                      : latestPaymentRequested
                        ? "Customer-facing payment intent has already been recorded on this invoice, so the next operational step is following the request through."
                        : latestPaymentVoided
                          ? "The most recent provider-backed payment was voided, so this invoice has returned to an active collection state."
                          : invoice.status === "partially_paid"
                            ? invoice.workflowRole === "deposit"
                              ? "This invoice is carrying deposit readiness. A payment has already been recorded, but the remaining balance still blocks downstream job/schedule readiness."
                              : "A payment has already been recorded on this invoice, but the balance is still outstanding."
                            : invoice.workflowRole === "deposit"
                              ? "This invoice is carrying deposit readiness. Keep payment collection and Project Workspace handoff aligned before moving further downstream."
                              : "Balance is still outstanding on this invoice, so payment recording is the clearest next operational step from this page.",
                primaryLabel: "Record payment",
                primaryHref: "#payment-recording"
              }
            : {
                title: "Billing review is current",
                description:
                  "This invoice is fully paid. Use the secondary or overflow links for broader project, estimate/contract, or job/schedule context."
              };
  const activePayments = invoice.payments.filter(
    (payment) => payment.status !== "void"
  );
  const latestPayment = activePayments[0] ?? invoice.payments[0] ?? null;
  const paymentLifecycleSummary = deriveInvoicePaymentLifecycleSummary({
    invoice,
    payments: invoice.payments,
    events: invoice.paymentEvents
  });
  const paymentById = new Map(
    invoice.payments.map((payment) => [payment.id, payment])
  );
  const invoiceTypeLabel = getInvoiceTypeLabel({
    billingModel: invoice.billingModel,
    workflowRole: invoice.workflowRole
  });
  const invoiceTypeMeaning = getInvoiceTypeMeaning({
    billingModel: invoice.billingModel,
    workflowRole: invoice.workflowRole,
    projectName: invoice.project?.name ?? null
  });
  const invoiceContinuityTitle = getInvoiceContinuityTitle({
    billingModel: invoice.billingModel,
    workflowRole: invoice.workflowRole
  });
  const linkedScheduleOfValueItemIds = new Set(
    invoice.lineItems
      .map((lineItem) => lineItem.scheduleOfValueItemId)
      .filter((value): value is string => Boolean(value))
  );
  const linkedProgressItems =
    progressBillingWorkspace?.items.filter((item) =>
      linkedScheduleOfValueItemIds.has(item.id)
    ) ?? [];
  const linkedProgressSummary = linkedProgressItems.reduce(
    (summary, item) => ({
      previousBilled:
        summary.previousBilled + parseMoney(item.previousBilledAmount),
      currentBilling:
        summary.currentBilling + parseMoney(item.currentToBillAmount),
      retainageHeld:
        summary.retainageHeld + parseMoney(item.retainageHeldCurrentAmount),
      balanceToFinish:
        summary.balanceToFinish + parseMoney(item.balanceToFinishAmount)
    }),
    {
      previousBilled: 0,
      currentBilling: 0,
      retainageHeld: 0,
      balanceToFinish: 0
    }
  );
  const continuityHref =
    invoice.billingModel === "aia_progress" && progressBillingWorkspace
      ? `/progress-billing/${progressBillingWorkspace.id}`
      : `/projects/${invoice.projectId}`;
  const continuityLabel =
    invoice.billingModel === "aia_progress" && progressBillingWorkspace
      ? "Open progress billing workspace"
      : "Open project workspace";
  const projectOptions = projects.map((project) => ({
    id: project.id,
    name: project.name,
    customerId: project.customerId,
    customerName: project.customer?.name ?? null,
    customerTaxExempt: project.customer?.isTaxExempt ?? false,
    customerRetainagePercentageDefault:
      project.customer?.retainagePercentageDefault ?? "0.00"
  }));

  const approvedEstimateOptions = estimates
    .filter(
      (estimate) =>
        estimate.status === "approved" || estimate.id === invoice.estimateId
    )
    .map((estimate) => ({
      id: estimate.id,
      referenceNumber: estimate.referenceNumber,
      projectId: estimate.projectId,
      projectName: estimate.project?.name ?? null,
      status: estimate.status
    }));

  const jobOptions = jobs.map((job) => ({
    id: job.id,
    projectId: job.projectId,
    projectName: job.project?.name ?? null,
    dispatchStatus: job.dispatchStatus,
    estimateId: job.estimate?.id ?? null
  }));
  const projectJobs = jobs.filter((job) => job.projectId === invoice.projectId);
  const linkedJob = invoice.jobId
    ? (projectJobs.find((job) => job.id === invoice.jobId) ??
      jobs.find((job) => job.id === invoice.jobId) ??
      null)
    : null;
  const scheduleSummaryJobs = linkedJob ? [linkedJob] : projectJobs;
  const scheduleAssignmentsByJobId = await listJobAssignmentsByJobIds(
    scheduleSummaryJobs.map((job) => job.id),
    `/invoices/${invoiceId}`
  );
  const scheduleCounts = {
    scheduled: projectJobs.filter((job) => job.dispatchStatus === "scheduled")
      .length,
    unscheduled: projectJobs.filter(
      (job) => job.dispatchStatus === "unscheduled"
    ).length,
    inProgress: projectJobs.filter(
      (job) => job.dispatchStatus === "in_progress"
    ).length
  };
  const projectScheduleFocusJob =
    [...projectJobs]
      .filter(
        (job) =>
          (job.dispatchStatus === "scheduled" ||
            job.dispatchStatus === "in_progress") &&
          job.scheduledDate
      )
      .sort(
        (left, right) =>
          getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ?? null;
  const scheduleFocusJob = linkedJob ?? projectScheduleFocusJob;
  const scheduleFocusAssignments = scheduleFocusJob
    ? (scheduleAssignmentsByJobId.get(scheduleFocusJob.id) ?? [])
    : [];
  const scheduleFocusAssignmentNames = scheduleFocusAssignments
    .map(
      (assignment) =>
        assignment.person?.displayName ?? assignment.vendor?.name ?? null
    )
    .filter((value): value is string => Boolean(value));
  const scheduleFocusSummary = scheduleFocusJob
    ? getScheduleAssignmentSummary({
        assignmentNames: scheduleFocusAssignmentNames,
        crewVendorName: scheduleFocusJob.crewVendor?.name ?? null,
        assignmentCount: scheduleFocusAssignments.length
      })
    : null;
  const projectJobsWithoutAssignments = projectJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (linkedJob
        ? job.id === linkedJob.id
          ? (scheduleAssignmentsByJobId.get(job.id)?.length ?? 0)
          : 0
        : (scheduleAssignmentsByJobId.get(job.id)?.length ?? 0)) === 0
  );
  const invoiceBalanceDue = Number(invoice.balanceDueAmount);
  const invoiceRetainageHeld = Number(invoice.retainageHeldAmount);
  const invoiceIsSettled = invoice.status === "paid" || invoiceBalanceDue <= 0;
  const invoiceWorkflowSteps: WorkflowStep[] = [
    {
      id: "customer-project",
      label: "Customer / project",
      state: "complete",
      description: "Project owns broader readiness"
    },
    {
      id: "estimate-contract",
      label: "Estimate / contract",
      state: invoice.estimate
        ? invoice.estimate.status === "approved"
          ? "complete"
          : "current"
        : "upcoming",
      description: invoice.estimate
        ? `${invoice.estimate.referenceNumber} | ${formatStatusLabel(invoice.estimate.status)}`
        : "No estimate source"
    },
    {
      id: "signature-readiness",
      label: "Signature readiness",
      state: readinessSnapshot?.contractStatus
        ? readinessSnapshot.contractStatus === "signed"
          ? "complete"
          : "current"
        : "upcoming",
      description: readinessSnapshot?.contractStatus
        ? formatStatusLabel(readinessSnapshot.contractStatus)
        : "Project readiness source"
    },
    {
      id: "job-schedule",
      label: "Job / schedule",
      state: linkedJob
        ? linkedJob.dispatchStatus === "completed"
          ? "complete"
          : "current"
        : projectJobs.some((job) => job.dispatchStatus === "completed")
          ? "complete"
          : projectJobs.length > 0
            ? "current"
            : "upcoming",
      description: linkedJob
        ? formatStatusLabel(linkedJob.dispatchStatus)
        : projectJobs.length > 0
          ? `${projectJobs.length} project job${projectJobs.length === 1 ? "" : "s"}`
          : invoice.workflowRole === "deposit"
            ? "After deposit readiness"
            : "After billable work"
    },
    {
      id: "invoice-payment",
      label: "Invoice / payment",
      state:
        invoice.status === "void"
          ? "blocked"
          : invoice.status === "paid"
            ? "complete"
            : "current",
      description: `${formatStatusLabel(invoice.status)} | ${formatMoney(invoice.balanceDueAmount)} due`
    }
  ];
  const invoiceStateItems: ProjectStateSummaryProps["items"] = [
    {
      id: "total",
      label: "Total",
      value: formatMoney(invoice.totalAmount),
      tone: "pending",
      detail: `${formatMoney(invoice.subtotalAmount)} subtotal`
    },
    {
      id: "paid",
      label: "Paid",
      value: formatMoney(invoice.paidAmount),
      tone: activePayments.length > 0 ? "complete" : "pending",
      detail: `${activePayments.length} payment${activePayments.length === 1 ? "" : "s"} recorded`
    },
    {
      id: "balance",
      label: "Balance Due",
      value: formatMoney(invoice.balanceDueAmount),
      tone:
        invoice.status === "void"
          ? "blocked"
          : invoiceBalanceDue > 0
            ? "needsAction"
            : "complete",
      detail:
        invoiceBalanceDue > 0
          ? `Due ${formatDate(invoice.dueDate)}`
          : "No remaining balance"
    },
    ...(invoiceRetainageHeld > 0
      ? [
          {
            id: "retainage",
            label: "Retainage Held",
            value: formatMoney(invoice.retainageHeldAmount),
            tone: "active" as const,
            detail: `${Number(invoice.retainagePercentage).toFixed(2)}% retainage`
          }
        ]
      : [])
  ];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className={commercialDocumentHeaderShellClassName}>
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description={invoiceTypeMeaning}
            backHref="/invoices"
            backLabel="Back to invoices"
          />

          <CommercialDocumentCommandBand
            eyebrow="Commercial document"
            title="Invoice review command"
            description="Review balance, collection state, payment evidence, and project continuity before recording or requesting payment."
            statusLabel={`${formatStatusLabel(invoice.status)} invoice`}
            projectHref={`/projects/${invoice.projectId}`}
            items={[
              {
                label: "Customer",
                value: invoice.customer?.name ?? "Unknown customer",
                detail: invoice.customer?.companyName ?? invoice.customer?.email
              },
              {
                label: "Project",
                value: invoice.project?.name ?? "Unknown project",
                detail: invoice.project
                  ? formatStatusLabel(invoice.project.status)
                  : "Project context unavailable"
              },
              {
                label: "Balance due",
                value: formatMoney(invoice.balanceDueAmount),
                detail: `${formatMoney(invoice.paidAmount)} paid of ${formatMoney(invoice.totalAmount)} total`
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

          <div className="mt-6 space-y-3">
            <ActionBar
              title={nextAction.title}
              description={nextAction.description}
              statusLabel={`${formatStatusLabel(invoice.status)} invoice`}
              statusTone={getInvoiceActionBarStatusTone(invoice.status)}
              nextActionLabel="Preferred next action"
              primaryAction={
                nextAction.primaryLabel && nextAction.primaryHref ? (
                  nextAction.primaryHref.startsWith("#") ? (
                    <a
                      href={nextAction.primaryHref}
                      className={primaryActionClassName}
                    >
                      {nextAction.primaryLabel}
                    </a>
                  ) : (
                    <Link
                      href={nextAction.primaryHref}
                      className={primaryActionClassName}
                    >
                      {nextAction.primaryLabel}
                    </Link>
                  )
                ) : null
              }
              secondaryActions={
                <>
                  <Link
                    href={`/invoices/${invoice.id}/pdf`}
                    className={secondaryActionClassName}
                  >
                    Print / save PDF
                  </Link>
                  <a
                    href="#invoice-editing"
                    className={secondaryActionClassName}
                  >
                    Edit
                  </a>
                  <Link
                    href={`/projects/${invoice.projectId}`}
                    className={secondaryActionClassName}
                  >
                    View Project
                  </Link>
                  <ActionOverflowMenu>
                    {invoice.estimateId ? (
                      <Link
                        href={`/estimates/${invoice.estimateId}`}
                        className={overflowActionClassName}
                      >
                        View Estimate
                      </Link>
                    ) : null}
                    {invoice.jobId ? (
                      <Link
                        href={`/jobs/${invoice.jobId}`}
                        className={overflowActionClassName}
                      >
                        View Job
                      </Link>
                    ) : null}
                    {invoice.billingModel === "aia_progress" &&
                    progressBillingWorkspace ? (
                      <Link
                        href={`/progress-billing/${progressBillingWorkspace.id}`}
                        className={overflowActionClassName}
                      >
                        Progress Billing
                      </Link>
                    ) : null}
                  </ActionOverflowMenu>
                </>
              }
              meta={
                <span>
                  {invoiceTypeLabel} | {formatMoney(invoice.paidAmount)} paid of{" "}
                  {formatMoney(invoice.totalAmount)} total
                </span>
              }
            />

            <WorkflowBar
              title="Billing workflow"
              steps={invoiceWorkflowSteps}
            />

            <ProjectStateSummary
              title="Invoice state summary"
              items={invoiceStateItems}
            />

            <NeedsAttentionPanel
              cues={invoiceAttentionCues}
              description="Invoice-specific collection cues derived from this canonical invoice and enabled organization rules. Use Project Workspace for upstream contract, deposit, job, or readiness blockers."
              getWorkItemAction={getOperationalCueWorkItemBridgeAction}
              getCueStateControls={(cue) => (
                <CueStateControls
                  identity={buildOperationalCueIdentity(cue)}
                  support={getCueStateActionSupport(cue)}
                  returnTo={`/invoices/${invoice.id}`}
                />
              )}
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
                    Invoice follow-through
                  </h3>
                  <p className="mt-1 max-w-[68ch] text-sm leading-6 text-slate-600">
                    Create an internal contractor work item tied to this
                    invoice. Cue prefill is only a draft; nothing is created
                    until you submit.
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
                        billing review stays primary on this invoice.
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Expand
                    </span>
                  </summary>
                  <div className="mt-4">
                    <p className="mb-4 text-sm leading-6 text-slate-600">
                      {invoiceWorkItemPrefill
                        ? "Prefilled from a deterministic invoice cue. Review the owner, due date, and context; nothing is created until you submit."
                        : "Use this form when invoice follow-through needs an owner, due date, and explicit completion state."}
                    </p>
                    <WorkItemCreateForm
                      action={createWorkItemAction}
                      returnTo={`/invoices/${invoice.id}`}
                      sourceType={defaultInvoiceWorkItemSource.sourceType}
                      sourceId={defaultInvoiceWorkItemSource.sourceId}
                      linkPath={defaultInvoiceWorkItemSource.linkPath}
                      customerId={invoice.customerId}
                      projectId={invoice.projectId}
                      defaultKind={
                        invoiceWorkItemPrefill?.kind ?? "invoice_follow_up"
                      }
                      defaultTitle={invoiceWorkItemPrefill?.title}
                      defaultDescription={invoiceWorkItemPrefill?.description}
                      defaultDueAt={invoiceWorkItemPrefill?.dueAt}
                      defaultPriority={
                        invoiceWorkItemPrefill?.priority ?? "normal"
                      }
                      dedupeKey={invoiceWorkItemPrefill?.dedupeKey}
                      metadata={invoiceWorkItemPrefill?.metadata}
                      kindOptions={[
                        {
                          value: "invoice_follow_up",
                          label: "Invoice follow-up"
                        },
                        { value: "human_handoff", label: "Human handoff" },
                        { value: "manual", label: "Manual" }
                      ]}
                      assignablePeople={assignablePeople}
                      boundaryCopy="Work items are internal-only and human-submitted. Creating, completing, or dismissing one does not change invoice status, payment state, customer-visible messages, financial calculations, project readiness, or workflow transitions."
                    />
                  </div>
                </details>

                <section className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Linked work items
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Internal actions tied directly to this canonical invoice.
                  </p>
                  <div className="mt-4">
                    <WorkItemList
                      workItems={linkedWorkItems}
                      returnTo={`/invoices/${invoice.id}`}
                      completeAction={completeWorkItemAction}
                      dismissAction={dismissWorkItemAction}
                      emptyTitle="No work items are linked to this invoice yet."
                      emptyDescription="Create an internal work item when invoice follow-up needs an owner, due date, and completion state."
                    />
                  </div>
                </section>
              </div>
            </section>
          </div>
        </div>

        <DetailPanel
          title={
            invoice.billingModel === "aia_progress"
              ? "Invoice Review And SOV Continuity"
              : invoice.workflowRole === "deposit"
                ? "Invoice Review And Deposit Continuity"
                : "Invoice Review"
          }
          description="Review billing meaning, linked scope, and payment follow-through before dropping into lower-priority metadata."
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Line items
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {invoice.billingModel === "aia_progress"
                      ? "Read-only billing lines generated from the canonical schedule-of-values chain. Review them here, but return to the progress billing workspace for structural scope or percent-complete changes."
                      : "Canonical billing scope for this invoice, preserved in the same customer/project, estimate/contract, job/schedule, and payment chain."}
                  </p>
                </div>

                {invoice.lineItems.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.lineItems.map((lineItem) => (
                      <div
                        key={lineItem.id}
                        className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {lineItem.name}
                            </p>
                            {lineItem.description ? (
                              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                {lineItem.description}
                              </p>
                            ) : null}
                            <p className="text-sm text-[var(--text-secondary)]">
                              {Number(lineItem.quantity).toLocaleString(
                                "en-US"
                              )}{" "}
                              {lineItem.unit} at{" "}
                              {formatMoney(lineItem.unitPrice)}
                            </p>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                              {getInvoiceLineageBadge({
                                lineageType: lineItem.lineageType,
                                invoiceOnlyAdjustmentKind:
                                  lineItem.invoiceOnlyAdjustmentKind
                              })}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatMoney(lineItem.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    No line items are currently attached to this invoice.
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-5">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {invoiceContinuityTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {invoice.billingModel === "aia_progress"
                      ? "This invoice is a read-only billing snapshot of current SOV state. Keep structural percent-complete, retainage, and scope billing changes in the progress billing workspace."
                      : invoice.workflowRole === "deposit"
                        ? "This invoice carries deposit collection on the same canonical project and payment chain. Keep contract, readiness, and downstream execution review in Project Workspace."
                        : "This invoice remains part of the shared estimate/contract, project, job/schedule, and payment chain. Use it for billing review without replacing Project Workspace as the operational root."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      href={continuityHref}
                      className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]"
                    >
                      {continuityLabel}
                    </Link>
                    {invoice.project ? (
                      <Link
                        href={`/projects/${invoice.project.id}`}
                        className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]"
                      >
                        Open project workspace
                      </Link>
                    ) : null}
                  </div>
                </div>

                {invoice.billingModel === "aia_progress" ? (
                  progressBillingWorkspace ? (
                    <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Linked progress billing snapshot
                          </p>
                          <p className="text-sm leading-6 text-[var(--text-secondary)]">
                            This page summarizes the invoice outcome. The
                            canonical SOV workspace remains the place to adjust
                            billed percent, retainage, and scope-item billing.
                          </p>
                        </div>
                        <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          {linkedProgressItems.length ||
                            invoice.lineItems.length}{" "}
                          linked item
                          {linkedProgressItems.length === 1 ||
                          (linkedProgressItems.length === 0 &&
                            invoice.lineItems.length === 1)
                            ? ""
                            : "s"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                            Previously billed
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                            {formatMoney(linkedProgressSummary.previousBilled)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                            Current billed
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                            {formatMoney(linkedProgressSummary.currentBilling)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                            Retainage held
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                            {formatMoney(linkedProgressSummary.retainageHeld)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                            Balance to finish
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                            {formatMoney(linkedProgressSummary.balanceToFinish)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                      This invoice is marked as progress-billed, but the linked
                      progress billing workspace could not be resolved from the
                      current estimate chain.
                    </div>
                  )
                ) : null}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Billing notes
                  </p>
                  <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    {invoice.notes ??
                      "No billing notes have been captured on this invoice yet."}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Latest payment activity
                  </p>
                  <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <div className="space-y-3">
                      {latestPayment ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {formatMoney(latestPayment.amount)}
                          </p>
                          <p>{formatDate(latestPayment.paymentDate)}</p>
                          <p className="capitalize">
                            {formatStatusLabel(latestPayment.status)} via{" "}
                            {latestPayment.paymentMethod}
                          </p>
                          {latestPayment.reference ? (
                            <p>Ref: {latestPayment.reference}</p>
                          ) : null}
                        </div>
                      ) : (
                        <p>
                          No payments have been recorded for this invoice yet.
                        </p>
                      )}
                      <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          Customer-facing signal
                        </p>
                        <p className="mt-2">
                          {getRecentPaymentSignal({
                            latestPayment,
                            latestEvent: latestPaymentEvent
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-5">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {invoice.billingModel === "aia_progress"
                    ? "Detailed SOV billing math"
                    : "Detailed billing math"}
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.subtotalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Taxable sales</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.taxableSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Exempt sales</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.exemptSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax collected</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.taxCollectedAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.taxAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Discount</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.discountAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage held</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.retainageHeldAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[var(--border-warm)] pt-3">
                    <dt className="font-semibold text-[var(--text-primary)]">
                      Total
                    </dt>
                    <dd className="font-semibold text-[var(--text-primary)]">
                      {formatMoney(invoice.totalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Paid</dt>
                    <dd className="font-medium text-[var(--text-primary)]">
                      {formatMoney(invoice.paidAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold text-[var(--text-primary)]">
                      Balance due
                    </dt>
                    <dd className="font-semibold text-[var(--text-primary)]">
                      {formatMoney(invoice.balanceDueAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-5">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Billing configuration
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Billing model</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {invoice.billingModel}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Issue date</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {formatDate(invoice.issueDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Due date</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {formatDate(invoice.dueDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax behavior</dt>
                    <dd className="text-right text-[var(--text-primary)] capitalize">
                      {invoice.taxBehaviorApplied.replaceAll("_", " ")}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Applied tax rate</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {formatRate(invoice.taxRateApplied)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Customer tax snapshot</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {invoice.customerTaxExemptSnapshot ? "Exempt" : "Taxable"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Org default tax</dt>
                    <dd className="max-w-[14rem] text-right text-[var(--text-primary)]">
                      {financialSettings.defaultTaxBehavior.replaceAll(
                        "_",
                        " "
                      )}{" "}
                      at {formatRate(financialSettings.defaultTaxRate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage %</dt>
                    <dd className="text-right text-[var(--text-primary)]">
                      {Number(invoice.retainagePercentage).toFixed(2)}%
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </DetailPanel>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <DetailPanel
            title={invoiceIsSettled ? "Payment Activity" : "Payment Recording"}
            description={
              invoiceIsSettled
                ? "Review canonical payment activity and settled balance without prompting another collection step."
                : "Record canonical payments here while keeping customer-facing checkout signals and upstream project readiness in view."
            }
          >
            <div id="payment-recording" className="space-y-4">
              <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-5">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Customer-facing payment continuity
                </p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Readiness
                    </p>
                    <p className="mt-2 font-semibold text-[var(--text-primary)]">
                      {invoiceIsSettled
                        ? "Payment settled"
                        : onlinePaymentGate.canStartCheckout
                          ? "Ready for online payment"
                          : "Not ready"}
                    </p>
                    <p className="mt-2">
                      {getOnlinePaymentReadinessSummary({
                        canStartCheckout: onlinePaymentGate.canStartCheckout,
                        invoiceStatus: invoice.status,
                        balanceDueAmount: invoice.balanceDueAmount
                      })}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Latest shared signal
                    </p>
                    <p className="mt-2 font-semibold text-[var(--text-primary)]">
                      {latestPaymentEvent
                        ? getPaymentEventLabel(latestPaymentEvent.eventType)
                        : "No portal-side signal yet"}
                    </p>
                    <p className="mt-2">
                      {latestPaymentEvent
                        ? formatDateTime(latestPaymentEvent.occurredAt)
                        : "Customer-facing payment events will appear here once request or checkout activity starts."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Collection attention
                    </p>
                    <p className="mt-2 font-semibold text-[var(--text-primary)]">
                      {paymentLifecycleSummary.label}
                    </p>
                    <p className="mt-2">
                      {paymentLifecycleSummary.plainMeaning}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border-warm)] bg-white px-5 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Payment evidence timeline
                    </p>
                    <p className="mt-1 max-w-[68ch] text-sm leading-6 text-[var(--text-secondary)]">
                      Read-only payment lifecycle evidence from immutable
                      payment events. Provider references are shown only as
                      compact identifiers, never raw provider payloads.
                    </p>
                  </div>
                  <Link
                    href="/financials/accounts-receivable"
                    className="inline-flex shrink-0 items-center rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-white"
                  >
                    Open AR
                  </Link>
                </div>

                {invoice.paymentEvents.length > 0 ? (
                  <div className="mt-4 divide-y divide-[var(--border-warm)] rounded-2xl border border-[var(--border-warm)]">
                    {invoice.paymentEvents.slice(0, 8).map((event) => {
                      const classification =
                        classifyPaymentEventEvidence(event);
                      const linkedPayment = event.paymentId
                        ? (paymentById.get(event.paymentId) ?? null)
                        : null;
                      const providerRows = getPaymentProviderReferenceRows({
                        event,
                        payment: linkedPayment
                      });

                      return (
                        <div key={event.id} className="px-4 py-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                  {classification.label}
                                </p>
                                <span
                                  className={[
                                    "inline-flex rounded-[4px] border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                                    classification.needsReview
                                      ? "border-amber-200 bg-amber-50 text-amber-900"
                                      : "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]"
                                  ].join(" ")}
                                >
                                  {classification.needsReview
                                    ? "Needs review"
                                    : "Evidence"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                {classification.plainMeaning}
                              </p>
                              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                                {formatDateTime(event.occurredAt)}
                                {event.actorType
                                  ? ` | ${formatStatusLabel(event.actorType)}`
                                  : ""}
                              </p>
                            </div>

                            <div className="min-w-0 text-sm leading-6 text-[var(--text-secondary)] lg:w-72">
                              {linkedPayment ? (
                                <p>
                                  {formatMoney(linkedPayment.amount)}{" "}
                                  {formatStatusLabel(linkedPayment.status)}
                                </p>
                              ) : (
                                <p>No canonical payment row linked yet.</p>
                              )}
                              {providerRows.length > 0 ? (
                                <dl className="mt-2 space-y-1">
                                  {providerRows.slice(0, 4).map((row) => (
                                    <div
                                      key={`${event.id}-${row.label}`}
                                      className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2"
                                    >
                                      <dt className="text-[var(--text-secondary)]">
                                        {row.label}
                                      </dt>
                                      <dd className="truncate font-medium text-[var(--text-primary)]">
                                        {row.value}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              ) : (
                                <p className="mt-2">
                                  No provider reference stored for this event.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    No payment events are attached to this invoice yet. Payment
                    request, checkout, success, failure, void, and provider-sync
                    evidence will appear here once the canonical event stream
                    has activity.
                  </div>
                )}
              </div>

              {invoice.status === "void" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                  Void invoices do not accept recorded payments. Resolve any
                  replacement billing path from the project and canonical
                  invoice chain.
                </div>
              ) : invoiceIsSettled ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
                  This invoice is fully paid. No additional payment recording is
                  needed while the invoice/payment balance remains settled.
                </div>
              ) : (
                <details className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4">
                  <summary className="cursor-pointer list-none">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Record a payment
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      Open this when you are entering an offline or manually
                      confirmed payment on the canonical invoice.
                    </p>
                  </summary>
                  <div className="mt-4">
                    <InvoicePaymentForm
                      invoiceId={invoice.id}
                      action={recordInvoicePaymentAction}
                    />
                  </div>
                </details>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Recorded payments
                </p>
                {invoice.payments.length > 0 ? (
                  invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-[var(--text-primary)]">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="capitalize">
                          {formatStatusLabel(payment.status)}
                        </p>
                      </div>
                      <p className="mt-1">{formatDate(payment.paymentDate)}</p>
                      <p>{payment.paymentMethod}</p>
                      {payment.reference ? (
                        <p>Ref: {payment.reference}</p>
                      ) : null}
                      {payment.notes ? <p>{payment.notes}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    No payments have been recorded for this invoice yet. Sent or
                    partially paid invoices remain in the invoice/payment stage
                    until a payment lands or the balance is otherwise resolved.
                  </div>
                )}
              </div>
            </div>
          </DetailPanel>

          <DetailPanel
            title="Provider Email Send"
            description="Send the customer a portal invoice review/payment link without starting checkout."
          >
            {canSendInvoiceReviewLink ? (
              invoice.customer?.email ? (
                <form
                  action={sendInvoiceReviewEmailAction}
                  className="grid gap-4 rounded-[8px] border border-[var(--border-warm)] bg-white px-5 py-5"
                >
                  <input type="hidden" name="invoiceId" value={invoice.id} />
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
                    <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      No portal-ready contact is available for this project.
                      Manage the contact and project access from People before
                      sending.
                    </div>
                  )}
                  {isProductionActionLocked ? <EarlyAccessLockNotice /> : null}
                  {isProductionActionLocked ? (
                    <p className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                      Submitting while locked records failed delivery evidence
                      only. It will not email the customer, start checkout,
                      create payment events, or change invoice status.
                    </p>
                  ) : null}
                  <p className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                    Email send records delivery evidence only. Customer checkout
                    and payment status remain controlled by the portal payment
                    workflow.
                  </p>
                  <button
                    type="submit"
                    disabled={sendContactOptions.length === 0}
                    className="justify-self-start rounded-full bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--copper-light)] disabled:cursor-not-allowed disabled:bg-[var(--highlight)] disabled:text-[var(--text-secondary)]"
                  >
                    Send review/payment link
                  </button>
                </form>
              ) : (
                <div className="rounded-[8px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                  <p className="font-medium text-amber-950">
                    Customer email is missing on the canonical customer record.
                  </p>
                  <p className="mt-2">
                    Invoice email send uses the shared customer/project portal
                    access chain. Add the customer email and confirm project
                    portal access before retrying send.
                  </p>
                  {invoice.customer ? (
                    <Link
                      href={`/customers/${invoice.customer.id}`}
                      className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                    >
                      Open customer
                    </Link>
                  ) : null}
                </div>
              )
            ) : (
              <div className="rounded-[8px] border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                Provider-backed invoice email is available only for sent or
                partially paid invoices with an open balance. Draft invoices
                should be marked sent through the invoice workflow first; paid
                and void invoices do not need a payment-link email.
              </div>
            )}
          </DetailPanel>

          <DocumentDeliveryHistoryPanel
            subjectType="invoice"
            subjectId={invoice.id}
            events={deliveryState.events}
            boundaryCopy="Manual entries record evidence only. The Send review/payment link action writes send_requested plus sent or failed provider evidence; provider email delivery does not start checkout, create payments, change invoice status, or mutate payment events."
          />

          <div id="invoice-editing">
            <DetailPanel
              title={
                invoice.billingModel === "aia_progress"
                  ? "Progress Billing Source"
                  : "Invoice Editing"
              }
              description="Editing remains available, but billing state and collection review stay primary."
            >
              <details
                open={invoice.billingModel === "aia_progress"}
                className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4"
              >
                <summary className="cursor-pointer list-none">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {invoice.billingModel === "aia_progress"
                      ? "Open progress billing source"
                      : "Edit invoice details and line items"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {invoice.billingModel === "aia_progress"
                      ? "Progress billing structure is managed from the SOV workspace."
                      : "Use this only when billing content needs to change; use Project Workspace for upstream readiness blockers."}
                  </p>
                </summary>
                <div className="mt-4">
                  {invoice.billingModel === "aia_progress" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                        Progress-billed invoice lines stay tied to approved
                        scope through the shared schedule-of-values record.
                        Update percent complete and rebuild the draft invoice
                        from the progress billing workspace instead of editing
                        those lines here.
                      </div>
                      {progressBillingWorkspace ? (
                        <Link
                          href={`/progress-billing/${progressBillingWorkspace.id}`}
                          className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]"
                        >
                          Open progress billing workspace
                        </Link>
                      ) : null}
                    </div>
                  ) : (
                    <InvoiceForm
                      action={updateInvoiceAction}
                      submitLabel="Save invoice"
                      pendingLabel="Saving invoice..."
                      projects={projectOptions}
                      estimates={approvedEstimateOptions}
                      jobs={jobOptions}
                      organizationFinancialSettings={financialSettings}
                      invoice={{
                        ...invoice,
                        lineItems: invoice.lineItems,
                        paidAmount: invoice.paidAmount
                      }}
                      paidAmount={invoice.paidAmount}
                      sourceOptions={sourceOptions}
                      catalogItems={catalogItems.map((item) => ({
                        id: item.id,
                        name: item.name,
                        unit: item.unit,
                        defaultUnitPrice: item.defaultUnitPrice,
                        status: item.status
                      }))}
                    />
                  )}
                </div>
              </details>
            </DetailPanel>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title={linkedJob ? "Linked Schedule" : "Production Schedule"}
          description={
            linkedJob
              ? "This invoice is linked to a canonical execution record, so billing can be read alongside that job's current schedule and crew state."
              : "This invoice is not linked to a single job, so schedule context is summarized from canonical project jobs without creating a billing-to-schedule bridge model."
          }
        >
          <div className="space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
            {linkedJob ? (
              scheduleFocusJob ? (
                <ScheduleContextFocusCard
                  eyebrow={
                    scheduleFocusJob.dispatchStatus === "in_progress"
                      ? "Linked work in progress"
                      : "Linked job"
                  }
                  title={
                    invoice.project?.name ??
                    scheduleFocusJob.project?.name ??
                    "Linked job"
                  }
                  titleHref={`/jobs/${scheduleFocusJob.id}`}
                  statusLabel={formatStatusLabel(
                    scheduleFocusJob.dispatchStatus
                  )}
                  summary={formatScheduleSummaryWindow({
                    scheduledDate: scheduleFocusJob.scheduledDate,
                    scheduledStartAt: scheduleFocusJob.scheduledStartAt,
                    scheduledEndAt: scheduleFocusJob.scheduledEndAt
                  })}
                  detailRows={[
                    {
                      label: "Crew",
                      value:
                        scheduleFocusAssignments.length > 0
                          ? scheduleFocusSummary
                          : scheduleFocusJob.dispatchStatus === "scheduled"
                            ? "Scheduled, but crew assignment still needs to be confirmed"
                            : scheduleFocusSummary
                    }
                  ]}
                />
              ) : (
                <ScheduleContextNotice
                  eyebrow="Ready for scheduling"
                  title="The linked job exists, but it is still unscheduled"
                >
                  Billing is already tied to a canonical execution record. Add a
                  real schedule commitment on that job to surface its next
                  production timing here.
                </ScheduleContextNotice>
              )
            ) : (
              <>
                <ScheduleContextMetrics
                  items={[
                    { label: "Scheduled", value: scheduleCounts.scheduled },
                    { label: "Unscheduled", value: scheduleCounts.unscheduled },
                    { label: "In progress", value: scheduleCounts.inProgress }
                  ]}
                />

                {scheduleFocusJob ? (
                  <ScheduleContextFocusCard
                    eyebrow={
                      scheduleFocusJob.dispatchStatus === "in_progress"
                        ? "Work in progress"
                        : "Next scheduled job"
                    }
                    title={
                      scheduleFocusJob.project?.name ??
                      invoice.project?.name ??
                      "Project job"
                    }
                    titleHref={`/jobs/${scheduleFocusJob.id}`}
                    statusLabel={formatStatusLabel(
                      scheduleFocusJob.dispatchStatus
                    )}
                    summary={formatScheduleSummaryWindow({
                      scheduledDate: scheduleFocusJob.scheduledDate,
                      scheduledStartAt: scheduleFocusJob.scheduledStartAt,
                      scheduledEndAt: scheduleFocusJob.scheduledEndAt
                    })}
                    detailRows={[
                      {
                        label: "Crew",
                        value:
                          scheduleFocusAssignments.length > 0
                            ? scheduleFocusSummary
                            : scheduleFocusJob.dispatchStatus === "scheduled"
                              ? "Scheduled, but crew assignment still needs to be confirmed"
                              : scheduleFocusSummary
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
                        ? "Project work exists, but no schedule commitment is set yet"
                        : "No production jobs are linked to this project yet"
                    }
                  >
                    {projectJobs.length > 0
                      ? "Canonical project jobs already exist for this invoice, but they are still unscheduled. The next production commitment will show here once a real date is attached."
                      : "Schedule continuity will appear here after downstream production work is created on the canonical project chain. If work should already be schedulable, inspect Project Workspace for contract, deposit, or readiness blockers."}
                  </ScheduleContextNotice>
                )}
              </>
            )}

            <ContextFactsList
              items={[
                {
                  label: "Project link",
                  value: invoice.project ? (
                    <Link
                      href={`/projects/${invoice.project.id}`}
                      className="font-medium text-brand-700"
                    >
                      {invoice.project.name}
                    </Link>
                  ) : (
                    "Project context unavailable"
                  )
                },
                {
                  label: "Crew assignment state",
                  value:
                    linkedJob && scheduleFocusJob
                      ? (scheduleFocusSummary ?? "No crew state yet")
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
                ...(linkedJob
                  ? [
                      {
                        href: `/jobs/${linkedJob.id}`,
                        label: "Open linked job" as const
                      }
                    ]
                  : []),
                {
                  href: buildProjectScheduleHref(invoice.projectId),
                  label: "Open schedule",
                  variant: "subtle"
                }
              ]}
            />
          </div>
        </DetailPanel>

        <DetailPanel
          title="Connected Records"
          description="Primary billing context stays visible across customer/project, estimate/contract, job/schedule, and invoice/payment continuity."
        >
          <div className="grid gap-4">
            {invoice.project ? (
              <LinkedRecordCard
                href={`/projects/${invoice.project.id}`}
                title={invoice.project.name}
                subtitle="Project"
                meta={invoice.customer?.name ?? "Unknown customer"}
                badge={
                  <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {formatStatusLabel(invoice.project.status)}
                  </span>
                }
              />
            ) : null}
            {invoice.customer ? (
              <LinkedRecordCard
                href={`/customers/${invoice.customer.id}`}
                title={invoice.customer.name}
                subtitle="Customer"
                meta={invoice.customer.companyName ?? "Customer record"}
              />
            ) : null}
            {invoice.estimate ? (
              <LinkedRecordCard
                href={`/estimates/${invoice.estimate.id}`}
                title={invoice.estimate.referenceNumber}
                subtitle="Estimate"
                meta={invoice.project?.name ?? "Source estimate"}
                badge={
                  <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                    {formatStatusLabel(invoice.estimate.status)}
                  </span>
                }
              />
            ) : null}
            {progressBillingWorkspace ||
            invoice.job ||
            changeOrders.length > 0 ? (
              <details className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                <summary className="cursor-pointer list-none font-semibold text-[var(--text-primary)]">
                  More linked records
                </summary>
                <div className="mt-4 grid gap-4">
                  {progressBillingWorkspace ? (
                    <LinkedRecordCard
                      href={`/progress-billing/${progressBillingWorkspace.id}`}
                      title={
                        progressBillingWorkspace.project?.name ??
                        "Schedule of values"
                      }
                      subtitle="Progress billing / SOV"
                      meta={`Current ${formatMoney(progressBillingWorkspace.currentBillableTotal)} | Balance ${formatMoney(progressBillingWorkspace.balanceToFinishTotal)}`}
                      badge={
                        <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          {formatStatusLabel(progressBillingWorkspace.status)}
                        </span>
                      }
                    />
                  ) : null}
                  {invoice.job ? (
                    <LinkedRecordCard
                      href={`/jobs/${invoice.job.id}`}
                      title={invoice.project?.name ?? "Job"}
                      subtitle="Job"
                      meta="Execution record linked to this invoice"
                      badge={
                        <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          {formatStatusLabel(invoice.job.dispatchStatus)}
                        </span>
                      }
                    />
                  ) : null}
                  {changeOrders.map((changeOrder) => (
                    <LinkedRecordCard
                      key={changeOrder.id}
                      href={`/change-orders/${changeOrder.id}`}
                      title={changeOrder.title}
                      subtitle="Change order"
                      meta={`${formatMoney(changeOrder.priceAdjustment)}${changeOrder.appliedInvoiceLineItemId ? " | Applied to this invoice" : ""}`}
                      badge={
                        <span className="inline-flex rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                          {formatStatusLabel(changeOrder.status)}
                        </span>
                      }
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </DetailPanel>

        <details className="rounded-lg border border-[var(--border-warm)] bg-white px-5 py-4 shadow-sm">
          <summary className="cursor-pointer list-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Invoice Metadata
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Lower-priority settings and timestamps.
            </p>
          </summary>
          <div className="mt-5">
            <ContextFactsList
              items={[
                {
                  label: "Project readiness",
                  value: (
                    <span className="capitalize">
                      {formatReadinessLabel(readinessSnapshot?.status ?? null)}
                    </span>
                  )
                },
                {
                  label: "Invoice type",
                  value: invoiceTypeLabel
                },
                {
                  label: "Status",
                  value: (
                    <span className="capitalize">
                      {formatStatusLabel(invoice.status)}
                    </span>
                  )
                },
                {
                  label: "Online payment readiness",
                  value: onlinePaymentGate.canStartCheckout
                    ? "Ready for customer-facing payment flow"
                    : "Not currently ready for customer-facing payment flow"
                },
                {
                  label: "Recent payment signal",
                  value: latestPaymentEvent
                    ? `${getPaymentEventLabel(latestPaymentEvent.eventType)} at ${formatDateTime(latestPaymentEvent.occurredAt)}`
                    : "No customer-facing payment signal yet"
                },
                {
                  label: "Billing role",
                  value:
                    invoice.billingModel === "aia_progress"
                      ? "Progress invoices stay tied to the schedule-of-values chain and should send structural billing work back to the progress billing workspace."
                      : invoice.workflowRole === "deposit"
                        ? "Deposit invoices contribute directly to the contract-to-job/schedule handoff."
                        : "Standard invoices stay connected to the same project and execution chain without replacing Project Workspace."
                },
                {
                  label: "Customer company",
                  value: invoice.customer?.companyName ?? "Not provided"
                },
                {
                  label: "Created",
                  value: new Date(invoice.createdAt).toLocaleString()
                },
                {
                  label: "Updated",
                  value: new Date(invoice.updatedAt).toLocaleString()
                },
                {
                  label: "Hub guidance",
                  value:
                    "Use Project Workspace when you need the current contract, signature, deposit, financing, job/schedule, and ready-to-schedule handoff context."
                }
              ]}
            />
          </div>
        </details>

        <RelatedConversationsCard
          source="invoice"
          description="Invoice-scoped communication stays on canonical threads and routes back into the shared communications workspace when billing follow-through needs context."
          countLabel="Invoice threads"
          emptyMessage="No invoice-scoped communication threads are attached to this canonical invoice yet."
          actionClassName="inline-flex items-center rounded-full border border-[var(--border-warm)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)]"
          threads={communicationThreads}
        />

        <details className="rounded-lg border border-[var(--border-warm)] bg-white px-5 py-4 shadow-sm">
          <summary className="cursor-pointer list-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Revision History
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Prior invoice snapshots are available when needed.
            </p>
          </summary>
          <div className="mt-5">
            <RevisionTimeline revisions={recordRevisions} />
          </div>
        </details>
      </aside>
    </div>
  );
}
