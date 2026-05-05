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
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePaymentForm } from "@/components/invoice-payment-form";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { listCatalogItems } from "@/lib/catalogs/data";
import { listInvoiceChangeOrders } from "@/lib/change-orders/data";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import {
  recordInvoicePaymentAction,
  updateInvoiceAction
} from "@/lib/invoices/actions";
import { getInvoiceById, listInvoiceSourceOptions } from "@/lib/invoices/data";
import { listEstimates } from "@/lib/estimates/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getProgressBillingByEstimateId } from "@/lib/progress-billing/data";
import { listProjects } from "@/lib/projects/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
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
import type { ProjectStateSummaryProps, WorkflowStep } from "@floorconnector/ui";

type InvoiceDetailPageProps = {
  params: Promise<{
    invoiceId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
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
    return "Online payment stays closed because this invoice has been voided.";
  }

  if (input.invoiceStatus === "draft") {
    return "Send the invoice before exposing customer-facing online payment actions.";
  }

  if (!input.canStartCheckout || Number(input.balanceDueAmount) <= 0) {
    return "Customer-facing payment is effectively complete because no balance remains due.";
  }

  return "This invoice is ready for customer-facing secure checkout on the same canonical invoice and payment chain.";
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
    return `A provider-backed payment completed ${formatDateTime(input.latestEvent.occurredAt)} and was applied to the same canonical invoice record.`;
  }

  if (input.latestEvent?.eventType === "payment_requested") {
    return `Customer-facing payment was requested ${formatDateTime(input.latestEvent.occurredAt)}. The invoice is now in a collections follow-through phase.`;
  }

  if (input.latestEvent?.eventType === "payment_voided") {
    return `A provider-backed payment was voided ${formatDateTime(input.latestEvent.occurredAt)}. Treat the invoice as open again until a completed payment lands.`;
  }

  if (input.latestPayment) {
    return `Latest canonical payment was ${formatStatusLabel(input.latestPayment.status)} on ${formatDate(input.latestPayment.paymentDate)}.`;
  }

  return "No customer-facing or contractor-recorded payment activity has been captured yet.";
}

function getInvoiceTypeLabel(input: { billingModel: string; workflowRole: string }) {
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
    } is being billed from percent-complete schedule-of-values state, and structural billing edits belong in the progress billing workspace.`;
  }

  if (input.workflowRole === "deposit") {
    return `${
      input.projectName ?? "This project"
    } is using this invoice for deposit readiness on the same canonical project and payment chain.`;
  }

  return `${
    input.projectName ?? "This project"
  } is using this invoice as a standard billing record on the shared estimate, job, and payment chain.`;
}

function getInvoiceContinuityTitle(input: { billingModel: string; workflowRole: string }) {
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
  const [invoice, projects, estimates, jobs, changeOrders, sourceOptions, catalogItems, communicationThreads] =
    await Promise.all([
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

  const progressBillingWorkspace = invoice.estimate
    ? await getProgressBillingByEstimateId(
        invoice.estimate.id,
        `/invoices/${invoiceId}`
      )
    : null;

  const financialSettings = await getOrganizationFinancialSettings(invoice.organizationId);
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: invoice.organizationId,
    projectId: invoice.projectId
  });
  const onlinePaymentGate = computeInvoicePaymentWorkflowGate({
    invoiceStatus: invoice.status,
    balanceDueAmount: invoice.balanceDueAmount
  });
  const latestPaymentEvent = invoice.paymentEvents[0] ?? null;
  const latestPaymentFailure =
    invoice.paymentEvents.find((event) => event.eventType === "payment_failed") ?? null;
  const latestCheckoutStarted =
    invoice.paymentEvents.find((event) => event.eventType === "checkout_started") ?? null;
  const latestPaymentSucceeded =
    invoice.paymentEvents.find((event) => event.eventType === "payment_succeeded") ?? null;
  const latestPaymentRequested =
    invoice.paymentEvents.find((event) => event.eventType === "payment_requested") ?? null;
  const latestPaymentVoided =
    invoice.paymentEvents.find((event) => event.eventType === "payment_voided") ?? null;
  const nextAction =
    invoice.status === "void"
      ? {
          title: "Invoice is closed",
          description:
            "This invoice is void, so the page stays focused on historical review instead of payment collection or editing changes."
        }
      : invoice.status === "paid"
        ? {
            title: "Billing review is current",
            description:
              "This invoice is fully paid. Use the secondary or overflow links for broader project, estimate, or job context."
          }
      : invoice.status === "draft"
        ? {
            title: "Review and send invoice",
            description:
              "Finish billing details, lineage, tax, retainage, and status in the existing invoice editor before customer-facing collection begins. Customer contact and portal access management stays in People.",
            primaryLabel: "Send Invoice",
            primaryHref: "#invoice-editing"
          }
      : Number(invoice.balanceDueAmount) > 0
        ? {
            title:
              latestPaymentFailure
                ? "Follow up on the failed payment attempt"
                : latestCheckoutStarted
                  ? "Wait for payment completion"
                  : latestPaymentSucceeded && invoice.status === "partially_paid"
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
            description:
              latestPaymentFailure
                ? "A customer payment attempt failed, so the remaining balance still needs active follow-through from this invoice workspace."
                : latestCheckoutStarted
                  ? "A customer has already entered checkout. Keep attention on the outcome instead of recording a parallel payment unless the provider flow fails."
                  : latestPaymentSucceeded && invoice.status === "partially_paid"
                    ? invoice.workflowRole === "deposit"
                      ? "A provider-backed deposit payment has landed, but part of the deposit still remains before the commercial handoff is complete."
                      : "A provider-backed payment has landed, but the invoice still carries an open balance."
                  : latestPaymentRequested
                    ? "Customer-facing payment intent has already been recorded on this invoice, so the next operational step is following the request through."
                    : latestPaymentVoided
                      ? "The most recent provider-backed payment was voided, so this invoice has returned to an active collection state."
                    : invoice.status === "partially_paid"
                      ? invoice.workflowRole === "deposit"
                        ? "This invoice is carrying deposit readiness. A payment has already been recorded, but the remaining balance still blocks the commercial handoff."
                        : "A payment has already been recorded on this invoice, but the balance is still outstanding."
                      : invoice.workflowRole === "deposit"
                        ? "This invoice is carrying deposit readiness. Keep payment collection and project handoff aligned before moving further downstream."
                        : "Balance is still outstanding on this invoice, so payment recording is the clearest next operational step from this page.",
            primaryLabel: "Record payment",
            primaryHref: "#payment-recording"
          }
        : {
            title: "Billing review is current",
            description:
              "This invoice is fully paid. Use the secondary or overflow links for broader project, estimate, or job context."
          };
  const activePayments = invoice.payments.filter((payment) => payment.status !== "void");
  const latestPayment = activePayments[0] ?? invoice.payments[0] ?? null;
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
    progressBillingWorkspace?.items.filter((item) => linkedScheduleOfValueItemIds.has(item.id)) ??
    [];
  const linkedProgressSummary = linkedProgressItems.reduce(
    (summary, item) => ({
      previousBilled: summary.previousBilled + parseMoney(item.previousBilledAmount),
      currentBilling: summary.currentBilling + parseMoney(item.currentToBillAmount),
      retainageHeld: summary.retainageHeld + parseMoney(item.retainageHeldCurrentAmount),
      balanceToFinish: summary.balanceToFinish + parseMoney(item.balanceToFinishAmount)
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
    .filter((estimate) => estimate.status === "approved" || estimate.id === invoice.estimateId)
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
    ? projectJobs.find((job) => job.id === invoice.jobId) ?? jobs.find((job) => job.id === invoice.jobId) ?? null
    : null;
  const scheduleSummaryJobs = linkedJob ? [linkedJob] : projectJobs;
  const scheduleAssignmentsByJobId = await listJobAssignmentsByJobIds(
    scheduleSummaryJobs.map((job) => job.id),
    `/invoices/${invoiceId}`
  );
  const scheduleCounts = {
    scheduled: projectJobs.filter((job) => job.dispatchStatus === "scheduled").length,
    unscheduled: projectJobs.filter((job) => job.dispatchStatus === "unscheduled").length,
    inProgress: projectJobs.filter((job) => job.dispatchStatus === "in_progress").length
  };
  const projectScheduleFocusJob =
    [...projectJobs]
      .filter(
        (job) =>
          (job.dispatchStatus === "scheduled" || job.dispatchStatus === "in_progress") &&
          job.scheduledDate
      )
      .sort(
        (left, right) => getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ?? null;
  const scheduleFocusJob = linkedJob ?? projectScheduleFocusJob;
  const scheduleFocusAssignments = scheduleFocusJob
    ? scheduleAssignmentsByJobId.get(scheduleFocusJob.id) ?? []
    : [];
  const scheduleFocusAssignmentNames = scheduleFocusAssignments
    .map((assignment) => assignment.person?.displayName ?? assignment.vendor?.name ?? null)
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
      ((linkedJob
        ? job.id === linkedJob.id
          ? scheduleAssignmentsByJobId.get(job.id)?.length ?? 0
          : 0
        : scheduleAssignmentsByJobId.get(job.id)?.length ?? 0) === 0)
  );
  const invoiceBalanceDue = Number(invoice.balanceDueAmount);
  const invoiceRetainageHeld = Number(invoice.retainageHeldAmount);
  const invoiceIsSettled = invoice.status === "paid" || invoiceBalanceDue <= 0;
  const invoiceWorkflowSteps: WorkflowStep[] = [
    {
      id: "estimate",
      label: "Estimate",
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
      id: "contract",
      label: "Contract",
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
      id: "job",
      label: "Job",
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
          : "After billable work"
    },
    {
      id: "invoice",
      label: "Invoice",
      state: invoice.status === "void" ? "blocked" : invoice.status === "paid" ? "complete" : "current",
      description: `${formatStatusLabel(invoice.status)} | ${formatMoney(invoice.balanceDueAmount)} due`
    },
    {
      id: "payment",
      label: "Payment",
      state:
        invoice.status === "paid"
          ? "complete"
          : invoice.status === "void"
            ? "blocked"
            : "current",
      description:
        activePayments.length > 0
          ? `${activePayments.length} recorded payment${activePayments.length === 1 ? "" : "s"}`
          : "No payment recorded"
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
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <DetailPageHeader
            eyebrow="Invoice Review"
            title={invoice.referenceNumber}
            description={invoiceTypeMeaning}
            backHref="/invoices"
            backLabel="Back to invoices"
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
                    <a href={nextAction.primaryHref} className={primaryActionClassName}>
                      {nextAction.primaryLabel}
                    </a>
                  ) : (
                    <Link href={nextAction.primaryHref} className={primaryActionClassName}>
                      {nextAction.primaryLabel}
                    </Link>
                  )
                ) : null
              }
              secondaryActions={
                <>
                  <a href="#invoice-editing" className={secondaryActionClassName}>
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
                      <Link href={`/estimates/${invoice.estimateId}`} className={overflowActionClassName}>
                        View Estimate
                      </Link>
                    ) : null}
                    {invoice.jobId ? (
                      <Link href={`/jobs/${invoice.jobId}`} className={overflowActionClassName}>
                        View Job
                      </Link>
                    ) : null}
                    {invoice.billingModel === "aia_progress" && progressBillingWorkspace ? (
                      <Link href={`/progress-billing/${progressBillingWorkspace.id}`} className={overflowActionClassName}>
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

            <WorkflowBar title="Billing workflow" steps={invoiceWorkflowSteps} />

            <ProjectStateSummary title="Invoice state summary" items={invoiceStateItems} />
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
                  <p className="text-sm font-medium text-slate-950">Line items</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {invoice.billingModel === "aia_progress"
                      ? "Read-only billing lines generated from the canonical schedule-of-values chain. Review them here, but return to the progress billing workspace for structural scope or percent-complete changes."
                      : "Canonical billing scope for this invoice, preserved in the same project, estimate, and job chain."}
                  </p>
                </div>

                {invoice.lineItems.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.lineItems.map((lineItem) => (
                      <div
                        key={lineItem.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-950">
                              {lineItem.name}
                            </p>
                            {lineItem.description ? (
                              <p className="text-sm leading-6 text-slate-600">
                                {lineItem.description}
                              </p>
                            ) : null}
                            <p className="text-sm text-slate-500">
                              {Number(lineItem.quantity).toLocaleString("en-US")} {lineItem.unit} at{" "}
                              {formatMoney(lineItem.unitPrice)}
                            </p>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                              {getInvoiceLineageBadge({
                                lineageType: lineItem.lineageType,
                                invoiceOnlyAdjustmentKind: lineItem.invoiceOnlyAdjustmentKind
                              })}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatMoney(lineItem.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                    No line items are currently attached to this invoice.
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <p className="text-sm font-medium text-slate-950">{invoiceContinuityTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {invoice.billingModel === "aia_progress"
                      ? "This invoice is a read-only billing snapshot of current SOV state. Keep structural percent-complete, retainage, and scope billing changes in the progress billing workspace."
                      : invoice.workflowRole === "deposit"
                        ? "This invoice carries deposit collection on the same canonical project and payment chain. Keep contract, readiness, and downstream execution review in the project workspace."
                        : "This invoice remains part of the shared estimate, project, and payment chain. Use it for billing review without replacing the project workspace as the operational root."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Link
                      href={continuityHref}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      {continuityLabel}
                    </Link>
                    {invoice.project ? (
                      <Link
                        href={`/projects/${invoice.project.id}`}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        Open project workspace
                      </Link>
                    ) : null}
                  </div>
                </div>

                {invoice.billingModel === "aia_progress" ? (
                  progressBillingWorkspace ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-950">
                            Linked progress billing snapshot
                          </p>
                          <p className="text-sm leading-6 text-slate-600">
                            This page summarizes the invoice outcome. The canonical SOV workspace remains the place to adjust billed percent, retainage, and scope-item billing.
                          </p>
                        </div>
                        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {linkedProgressItems.length || invoice.lineItems.length} linked item
                          {linkedProgressItems.length === 1 || (linkedProgressItems.length === 0 && invoice.lineItems.length === 1)
                            ? ""
                            : "s"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Previously billed
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {formatMoney(linkedProgressSummary.previousBilled)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Current billed
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {formatMoney(linkedProgressSummary.currentBilling)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Retainage held
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {formatMoney(linkedProgressSummary.retainageHeld)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Balance to finish
                          </p>
                          <p className="mt-2 text-sm font-semibold text-slate-950">
                            {formatMoney(linkedProgressSummary.balanceToFinish)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                      This invoice is marked as progress-billed, but the linked progress billing workspace could not be resolved from the current estimate chain.
                    </div>
                  )
                ) : null}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Billing notes</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    {invoice.notes ?? "No billing notes have been captured on this invoice yet."}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-950">Latest payment activity</p>
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <div className="space-y-3">
                      {latestPayment ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950">
                            {formatMoney(latestPayment.amount)}
                          </p>
                          <p>{formatDate(latestPayment.paymentDate)}</p>
                          <p className="capitalize">
                            {formatStatusLabel(latestPayment.status)} via {latestPayment.paymentMethod}
                          </p>
                          {latestPayment.reference ? <p>Ref: {latestPayment.reference}</p> : null}
                        </div>
                      ) : (
                        <p>No payments have been recorded for this invoice yet.</p>
                      )}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  {invoice.billingModel === "aia_progress"
                    ? "Detailed SOV billing math"
                    : "Detailed billing math"}
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.subtotalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Taxable sales</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxableSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Exempt sales</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.exemptSalesAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax collected</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxCollectedAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.taxAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Discount</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.discountAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage held</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.retainageHeldAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                    <dt className="font-semibold text-slate-950">Total</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.totalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Paid</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(invoice.paidAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-semibold text-slate-950">Balance due</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(invoice.balanceDueAmount)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Billing configuration</p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Billing model</dt>
                    <dd className="text-right text-slate-950">{invoice.billingModel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Issue date</dt>
                    <dd className="text-right text-slate-950">{formatDate(invoice.issueDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Due date</dt>
                    <dd className="text-right text-slate-950">{formatDate(invoice.dueDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax behavior</dt>
                    <dd className="text-right text-slate-950 capitalize">
                      {invoice.taxBehaviorApplied.replaceAll("_", " ")}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Applied tax rate</dt>
                    <dd className="text-right text-slate-950">
                      {formatRate(invoice.taxRateApplied)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Customer tax snapshot</dt>
                    <dd className="text-right text-slate-950">
                      {invoice.customerTaxExemptSnapshot ? "Exempt" : "Taxable"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Org default tax</dt>
                    <dd className="max-w-[14rem] text-right text-slate-950">
                      {financialSettings.defaultTaxBehavior.replaceAll("_", " ")} at{" "}
                      {formatRate(financialSettings.defaultTaxRate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Retainage %</dt>
                    <dd className="text-right text-slate-950">
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
                : "Record canonical payments here while keeping customer-facing checkout signals in view."
            }
          >
            <div id="payment-recording" className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Customer-facing payment continuity
                </p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Readiness
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
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
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Latest shared signal
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
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
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Collection attention
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {latestPaymentFailure
                        ? "Recent failure needs follow-through"
                        : latestCheckoutStarted
                          ? "Checkout is in motion"
                          : latestPaymentRequested
                            ? "Payment requested"
                            : Number(invoice.balanceDueAmount) > 0
                              ? "Balance still open"
                              : "Billing settled"}
                    </p>
                    <p className="mt-2">
                      {latestPaymentFailure
                        ? "A customer payment attempt failed. Keep the conversation focused on remaining balance and retry path."
                        : latestCheckoutStarted
                          ? "A customer has entered the payment flow, but the invoice is not complete until a canonical payment succeeds."
                          : latestPaymentSucceeded
                            ? Number(invoice.balanceDueAmount) > 0
                              ? "A provider-backed payment has been applied, but the invoice still carries an open balance."
                              : "The most recent provider-backed payment completed successfully."
                          : latestPaymentRequested
                            ? "Collections activity has started, even if the invoice still needs the actual payment completion event."
                            : latestPaymentVoided
                              ? "A provider-backed payment was voided, so collection attention has reopened on this invoice."
                            : Number(invoice.balanceDueAmount) > 0
                              ? "No recent customer-facing payment signal is recorded yet."
                              : "No further collection step is currently needed on this invoice."}
                    </p>
                  </div>
                </div>
              </div>

              {invoice.status === "void" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                  Void invoices do not accept recorded payments.
                </div>
              ) : invoiceIsSettled ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
                  This invoice is fully paid. No additional payment recording is needed while the balance remains settled.
                </div>
              ) : (
                <InvoicePaymentForm
                  invoiceId={invoice.id}
                  action={recordInvoicePaymentAction}
                />
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-950">Recorded payments</p>
                {invoice.payments.length > 0 ? (
                  invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-slate-950">
                          {formatMoney(payment.amount)}
                        </p>
                        <p className="capitalize">{formatStatusLabel(payment.status)}</p>
                      </div>
                      <p className="mt-1">{formatDate(payment.paymentDate)}</p>
                      <p>{payment.paymentMethod}</p>
                      {payment.reference ? <p>Ref: {payment.reference}</p> : null}
                      {payment.notes ? <p>{payment.notes}</p> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No payments have been recorded for this invoice yet.
                  </div>
                )}
              </div>
            </div>
          </DetailPanel>

          <div id="invoice-editing">
            <DetailPanel
              title={
                invoice.billingModel === "aia_progress"
                  ? "Progress Billing Source"
                  : "Edit Invoice"
              }
              description={
                invoice.billingModel === "aia_progress"
                  ? "This invoice was built from the canonical schedule-of-values workspace, so scope-line billing should be managed there instead of through ad hoc invoice editing."
                  : "Editing stays available from the same record, but it is intentionally secondary to billing review."
              }
            >
              {invoice.billingModel === "aia_progress" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                    Progress-billed invoice lines stay tied to approved scope through the
                    shared schedule-of-values record. Update percent complete and rebuild the
                    draft invoice from the progress billing workspace instead of editing those
                    lines here.
                  </div>
                  {progressBillingWorkspace ? (
                    <Link
                      href={`/progress-billing/${progressBillingWorkspace.id}`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              {linkedJob ? (
                scheduleFocusJob ? (
                  <ScheduleContextFocusCard
                    eyebrow={
                      scheduleFocusJob.dispatchStatus === "in_progress"
                        ? "Linked work in progress"
                        : "Linked job"
                    }
                    title={invoice.project?.name ?? scheduleFocusJob.project?.name ?? "Linked job"}
                    titleHref={`/jobs/${scheduleFocusJob.id}`}
                    statusLabel={formatStatusLabel(scheduleFocusJob.dispatchStatus)}
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
                    Billing is already tied to a canonical execution record. Add a real schedule
                    commitment on that job to surface its next production timing here.
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
                      title={scheduleFocusJob.project?.name ?? invoice.project?.name ?? "Project job"}
                      titleHref={`/jobs/${scheduleFocusJob.id}`}
                      statusLabel={formatStatusLabel(scheduleFocusJob.dispatchStatus)}
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
                      eyebrow={projectJobs.length > 0 ? "Ready for scheduling" : "No jobs yet"}
                      title={
                        projectJobs.length > 0
                          ? "Project work exists, but no schedule commitment is set yet"
                          : "No production jobs are linked to this project yet"
                      }
                    >
                      {projectJobs.length > 0
                        ? "Canonical project jobs already exist for this invoice, but they are still unscheduled. The next production commitment will show here once a real date is attached."
                        : "Schedule continuity will appear here after downstream production work is created on the canonical project chain."}
                    </ScheduleContextNotice>
                  )}
                </>
              )}

            <ContextFactsList
              items={[
                {
                  label: "Project link",
                  value: invoice.project ? (
                    <Link href={`/projects/${invoice.project.id}`} className="font-medium text-brand-700">
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
                      ? scheduleFocusSummary ?? "No crew state yet"
                      : projectJobsWithoutAssignments.length > 0
                        ? `${projectJobsWithoutAssignments.length} job${
                            projectJobsWithoutAssignments.length === 1 ? "" : "s"
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
                  ? [{ href: `/jobs/${linkedJob.id}`, label: "Open linked job" as const }]
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
          description="Shortcuts to the surrounding commercial chain without displacing the invoice as billing truth."
        >
          <div className="grid gap-4">
            {invoice.project ? (
              <LinkedRecordCard
                href={`/projects/${invoice.project.id}`}
                title={invoice.project.name}
                subtitle="Project"
                meta={invoice.customer?.name ?? "Unknown customer"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
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
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(invoice.estimate.status)}
                  </span>
                }
              />
            ) : null}
            {progressBillingWorkspace ? (
              <LinkedRecordCard
                href={`/progress-billing/${progressBillingWorkspace.id}`}
                title={progressBillingWorkspace.project?.name ?? "Schedule of values"}
                subtitle="Progress billing / SOV"
                meta={`Current ${formatMoney(progressBillingWorkspace.currentBillableTotal)} | Balance ${formatMoney(progressBillingWorkspace.balanceToFinishTotal)}`}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
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
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
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
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(changeOrder.status)}
                  </span>
                }
              />
            ))}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Invoice Metadata"
          description="Lower-priority workflow and configuration facts that support review after billing meaning and continuity are clear."
        >
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
                value: <span className="capitalize">{formatStatusLabel(invoice.status)}</span>
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
                label: "Workflow relevance",
                value:
                  invoice.billingModel === "aia_progress"
                    ? "Progress invoices stay tied to the schedule-of-values chain and should send structural billing work back to the progress billing workspace."
                    : invoice.workflowRole === "deposit"
                      ? "Deposit invoices contribute directly to the commercial handoff."
                      : "Standard invoices stay connected to the same project and execution chain without replacing the project hub."
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
                  "Use the project readiness hub when you need the current contract, signature, deposit, financing, and ready-to-schedule handoff context."
              }
            ]}
          />
        </DetailPanel>

        <RelatedConversationsCard
          source="invoice"
          description="Invoice-scoped communication stays on canonical threads and routes back into the shared communications workspace when billing follow-through needs context."
          countLabel="Invoice threads"
          emptyMessage="No invoice-scoped communication threads are attached to this canonical invoice yet."
          actionClassName="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          threads={communicationThreads}
        />
      </aside>
    </div>
  );
}
