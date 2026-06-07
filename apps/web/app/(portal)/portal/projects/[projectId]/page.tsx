import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalProjectCustomerActionHub,
  PortalProjectSummaryPanel
} from "@/components/portal-project-summary-panel";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  PortalTrustStrip,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalReviewCardClassName,
  portalStatePanelClassName
} from "@/components/portal-review-ui";
import { replyToPortalProjectCommunicationThreadAction } from "@/lib/communications/actions";
import { listPortalProjectCommunicationSummary } from "@/lib/communications/portal-project-data";
import { buildPortalProjectEvidenceReceiptPrintHref } from "@/lib/document-engine/print";
import { derivePortalCloseoutHandoff } from "@/lib/portal/closeout-handoff";
import { derivePortalProjectStatusWindow } from "@/lib/portal/project-status-window";
import { derivePortalProjectTimeline } from "@/lib/portal/project-timeline";
import { derivePortalSharedDocuments } from "@/lib/portal/shared-documents";
import { acknowledgePortalSharedEvidenceAction } from "@/lib/portal-evidence-grants/actions";
import { getPortalSharedEvidenceSummary } from "@/lib/portal-evidence-grants/data";
import { deriveSharedEvidenceReceiptRollupFromPortalSummary } from "@/lib/portal-evidence-grants/receipt-rollup";
import { derivePortalSafeStatusExplanation } from "@/lib/portal/status-explanation";
import {
  getPortalProjectDetailSummary,
  listPortalProjectAppointments,
  listPortalProjectChangeOrders,
  listPortalProjectContracts,
  listPortalProjectEstimates,
  listPortalProjectInvoices,
  listPortalProjectWarrantyDocuments
} from "@/lib/portal/data";

type PortalProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
    error?: string;
  }>;
};

function formatStatusLabel(status: string | null) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not shared yet";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatTimelineDate(value: string | null | undefined) {
  return value ? formatDateTime(value) : "Current";
}

function formatAppointmentTime(startAt: string, endAt: string | null) {
  const start = new Date(startAt).toLocaleString();

  if (!endAt) {
    return start;
  }

  return `${start} to ${new Date(endAt).toLocaleTimeString()}`;
}

function formatLocation(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ") || "Not provided";
}

function getTimelineAccentClassName(tone: string) {
  switch (tone) {
    case "attention":
      return "border-l-amber-400 bg-amber-50/45";
    case "complete":
      return "border-l-emerald-400 bg-emerald-50/35";
    case "warning":
      return "border-l-rose-400 bg-rose-50/35";
    default:
      return "border-l-slate-300 bg-white";
  }
}

function getSharedDocumentStateLabel(input: {
  customerActionRequired?: boolean;
  completed?: boolean;
  tone: string;
}) {
  if (input.customerActionRequired) {
    return "Needs your attention";
  }

  if (input.completed) {
    return "Completed";
  }

  if (input.tone === "warning") {
    return "Review status";
  }

  return "Shared with you";
}

function getPortalContractSummary(contract: {
  status: string;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signedAt: string | null;
  sentAt: string | null;
}) {
  if (contract.status === "signed") {
    return `Fully signed ${formatDate(contract.signedAt)}`;
  }

  if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
    return `Customer signed ${formatDate(contract.customerSignedAt)} | Contractor countersign pending`;
  }

  if (contract.customerViewedAt) {
    return `Customer reviewed ${formatDate(contract.customerViewedAt)} | Signature still in progress`;
  }

  if (contract.sentAt) {
    return `Sent ${formatDate(contract.sentAt)} | Waiting on signature`;
  }

  return "Contract shared on this project";
}

function getPortalInvoiceSummary(invoice: {
  workflowRole: string;
  status: string;
  balanceDueAmount: string;
  latestPaymentEventType: string | null;
  latestPaymentEventAt: string | null;
}) {
  if (invoice.latestPaymentEventType === "payment_failed") {
    return `Recent payment attempt failed${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""}`;
  }

  if (invoice.latestPaymentEventType === "checkout_started") {
    return `Payment in progress${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""}`;
  }

  if (invoice.latestPaymentEventType === "payment_succeeded") {
    return invoice.status === "partially_paid"
      ? invoice.workflowRole === "deposit"
        ? `Deposit payment completed${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""} | ${formatMoney(invoice.balanceDueAmount)} remaining`
        : `Payment completed${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""} | ${formatMoney(invoice.balanceDueAmount)} remaining`
      : `Payment completed${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""}`;
  }

  if (invoice.latestPaymentEventType === "payment_requested") {
    return `Payment requested${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""}`;
  }

  if (invoice.latestPaymentEventType === "payment_voided") {
    return `Payment voided${invoice.latestPaymentEventAt ? ` | ${formatDateTime(invoice.latestPaymentEventAt)}` : ""}`;
  }

  if (invoice.status === "paid") {
    return invoice.workflowRole === "deposit"
      ? "Deposit paid in full"
      : "Invoice paid in full";
  }

  if (invoice.status === "partially_paid") {
    return invoice.workflowRole === "deposit"
      ? `Deposit partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`
      : `Partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`;
  }

  if (invoice.status === "void") {
    return "Invoice voided";
  }

  return invoice.workflowRole === "deposit"
    ? `Deposit due | ${formatMoney(invoice.balanceDueAmount)} remaining`
    : `Balance due | ${formatMoney(invoice.balanceDueAmount)} remaining`;
}

function getPortalWarrantyDocumentSummary(warrantyDocument: {
  currentUserSignerStatus: string | null;
  currentUserCanAct: boolean;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  latestSignatureEventType: string | null;
  latestSignatureEventAt: string | null;
}) {
  if (warrantyDocument.currentUserCanAct) {
    return "Signature is ready for your review";
  }

  if (warrantyDocument.currentUserSignerStatus === "signed") {
    return "Your signature is recorded";
  }

  if (warrantyDocument.currentUserSignerStatus === "declined") {
    return "Your decline has been recorded";
  }

  if (warrantyDocument.latestSignatureEventType) {
    return `${formatStatusLabel(warrantyDocument.latestSignatureEventType)}${warrantyDocument.latestSignatureEventAt ? ` | ${formatDateTime(warrantyDocument.latestSignatureEventAt)}` : ""}`;
  }

  return `Coverage ${formatDate(warrantyDocument.warrantyStartDate)} to ${formatDate(
    warrantyDocument.warrantyEndDate
  )}`;
}

function getPortalMessageSenderLabel(input: {
  senderType: string;
  direction: string;
}) {
  if (input.senderType === "portal_user" || input.direction === "inbound") {
    return "You";
  }

  return "Contractor";
}

function RecordSummaryCard({
  eyebrow,
  title,
  description,
  meta,
  badge,
  href
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  badge: string;
  href?: string;
}) {
  return (
    <div className={portalReviewCardClassName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-base font-semibold text-slate-950">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <PortalStatusBadge status={badge}>{badge}</PortalStatusBadge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{meta}</p>
      {href ? (
        <div className="mt-4">
          <PortalSecondaryLink href={href}>Review record</PortalSecondaryLink>
        </div>
      ) : null}
    </div>
  );
}

export default async function PortalProjectDetailPage({
  params,
  searchParams
}: PortalProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [
    project,
    appointments,
    estimates,
    contracts,
    invoices,
    changeOrders,
    warrantyDocuments,
    sharedEvidence,
    projectCommunication
  ] = await Promise.all([
    getPortalProjectDetailSummary(projectId, `/portal/projects/${projectId}`),
    listPortalProjectAppointments(projectId, `/portal/projects/${projectId}`),
    listPortalProjectEstimates(projectId, `/portal/projects/${projectId}`),
    listPortalProjectContracts(projectId, `/portal/projects/${projectId}`),
    listPortalProjectInvoices(projectId, `/portal/projects/${projectId}`),
    listPortalProjectChangeOrders(projectId, `/portal/projects/${projectId}`),
    listPortalProjectWarrantyDocuments(
      projectId,
      `/portal/projects/${projectId}`
    ),
    getPortalSharedEvidenceSummary(projectId, `/portal/projects/${projectId}`),
    listPortalProjectCommunicationSummary(
      projectId,
      `/portal/projects/${projectId}`
    )
  ]);

  if (!project) {
    notFound();
  }

  const statusWindow = derivePortalProjectStatusWindow({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    estimates,
    contracts,
    changeOrders,
    invoices,
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
  const statusExplanation = derivePortalSafeStatusExplanation({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    estimates,
    contracts,
    changeOrders,
    invoices,
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
  const timeline = derivePortalProjectTimeline({
    project: {
      id: project.id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    },
    estimates,
    contracts,
    changeOrders,
    invoices,
    appointments,
    warrantyDocuments,
    sharedEvidence: sharedEvidence.items
  });
  const sharedDocuments = derivePortalSharedDocuments({
    estimates,
    contracts,
    invoices,
    changeOrders
  });
  const sharedEvidenceReceipt =
    deriveSharedEvidenceReceiptRollupFromPortalSummary(sharedEvidence);
  const closeoutHandoff = derivePortalCloseoutHandoff({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    estimates,
    contracts,
    invoices,
    changeOrders,
    warrantyDocuments,
    customerNextStep: statusWindow.customerNextStep,
    sharedEvidenceReceipt
  });
  const customerHubCards = [
    {
      key: "next-step",
      eyebrow: "Next customer step",
      title: statusWindow.customerNextStep.label,
      description: statusWindow.customerNextStep.description,
      href: statusWindow.customerNextStep.href,
      actionLabel:
        statusWindow.customerNextStep.source === "none"
          ? "Review project"
          : statusWindow.customerNextStep.label,
      badge: statusWindow.customerNextStep.tone
    },
    ...sharedDocuments.documents.slice(0, 3).map((document) => ({
      key: document.key,
      eyebrow: document.label,
      title: document.reference,
      description: document.helperText,
      href: document.primaryHref,
      actionLabel: document.actionLabel,
      badge: document.tone
    }))
  ];
  const latestPaymentSummary = project.latestInvoiceStatus
    ? getPortalInvoiceSummary({
        workflowRole: project.latestInvoiceWorkflowRole ?? "standard",
        status: project.latestInvoiceStatus,
        balanceDueAmount: project.latestInvoiceBalanceDueAmount ?? "0",
        latestPaymentEventType: project.latestInvoicePaymentEventType,
        latestPaymentEventAt: project.latestInvoicePaymentEventAt
      })
    : null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className={portalHeroPanelClassName}>
          <DetailPageHeader
            eyebrow="Shared Project Workspace"
            title={project.name}
            description="Use this page to see what matters most on this project, then move into the shared record that needs your attention."
            backHref="/portal"
            backLabel="Back to portal home"
            actions={
              <PortalStatusBadge
                status={project.status ?? "neutral"}
                className="px-4 py-2 text-sm"
              >
                {formatStatusLabel(project.status)}
              </PortalStatusBadge>
            }
          />

          <PortalTrustStrip
            eyebrow="Live shared project"
            title="One customer view into this project chain"
            description="You are viewing the project records shared with you. Signing, approving, or paying updates the contractor's project record."
            items={[
              {
                label: "Estimate",
                value: formatStatusLabel(project.latestEstimateStatus)
              },
              {
                label: "Contract",
                value: formatStatusLabel(project.latestContractStatus)
              },
              {
                label: "Invoice",
                value: formatStatusLabel(project.latestInvoiceStatus)
              }
            ]}
          />

          <PortalProjectSummaryPanel
            project={project}
            statusWindow={statusWindow}
            statusExplanation={statusExplanation}
            paymentSummary={latestPaymentSummary}
          />
        </div>

        {resolvedSearchParams.message ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
          >
            {resolvedSearchParams.message}
          </div>
        ) : null}

        {resolvedSearchParams.error ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
          >
            {resolvedSearchParams.error}
          </div>
        ) : null}

        <PortalProjectCustomerActionHub
          statusWindow={statusWindow}
          statusExplanation={statusExplanation}
          customerHubCards={customerHubCards}
        />

        <DetailPanel
          title="Project Status"
          description="A customer-safe summary of the records and actions shared for this project."
        >
          {statusWindow.sharedRecords.length > 0 ? (
            <div className="grid gap-4">
              {statusWindow.sharedRecords.map((record) => (
                <div
                  key={`${record.type}-${record.id}`}
                  className={portalReviewCardClassName}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {record.typeLabel}
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {record.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {record.helperText}
                      </p>
                    </div>
                    <PortalStatusBadge status={record.tone}>
                      {record.statusLabel}
                    </PortalStatusBadge>
                  </div>
                  <div className="mt-4">
                    <PortalSecondaryLink href={record.href}>
                      {record.type === "invoice"
                        ? "Review or pay invoice"
                        : record.type === "contract"
                          ? "Review contract"
                          : record.type === "change_order"
                            ? "Review change order"
                            : "Review estimate"}
                    </PortalSecondaryLink>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="Shared with you"
              title="No documents or payments are shared yet"
              description={statusWindow.emptyStateMessage}
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Closeout Handoff"
          description="Customer-safe records for project wrap-up, payment status, and warranty handoff."
        >
          <div className="grid gap-5">
            <section className={portalStatePanelClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Closeout package
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {closeoutHandoff.statusLabel}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {closeoutHandoff.primaryMessage}
                  </p>
                </div>
                <PortalStatusBadge
                  status={closeoutHandoff.statusTone}
                  className="shrink-0"
                >
                  {closeoutHandoff.statusLabel}
                </PortalStatusBadge>
              </div>

              <div className="mt-5">
                <NextActionCard
                  eyebrow="Next closeout step"
                  title={closeoutHandoff.nextAction.label}
                  description={closeoutHandoff.nextAction.description}
                  primaryAction={
                    <PortalSecondaryLink href={closeoutHandoff.nextAction.href}>
                      {closeoutHandoff.nextAction.label}
                    </PortalSecondaryLink>
                  }
                />
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {closeoutHandoff.progressItems.map((item) => (
                <div key={item.key} className={portalReviewCardClassName}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {item.value}
                      </p>
                    </div>
                    <PortalStatusBadge status={item.tone}>
                      {item.tone === "attention"
                        ? "Review"
                        : item.tone === "complete"
                          ? "Current"
                          : item.tone}
                    </PortalStatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <section className={portalInsetPanelClassName}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Closeout confidence thread
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Customer-safe status, next step, documents, evidence
                    receipt, payment, and warranty signals from records already
                    visible in this portal.
                  </p>
                </div>
                <PortalStatusBadge status={closeoutHandoff.statusTone}>
                  {closeoutHandoff.statusLabel}
                </PortalStatusBadge>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {closeoutHandoff.confidenceThread.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {item.value}
                        </p>
                      </div>
                      <PortalStatusBadge status={item.tone}>
                        {item.tone === "attention"
                          ? "Review"
                          : item.tone === "complete"
                            ? "Current"
                            : item.tone}
                      </PortalStatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.detail}
                    </p>
                    {item.href ? (
                      <div className="mt-3">
                        <PortalSecondaryLink href={item.href}>
                          Open
                        </PortalSecondaryLink>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {closeoutHandoff.documentPackageItems.length > 0 ? (
              <section className="grid gap-4 lg:grid-cols-2">
                {closeoutHandoff.documentPackageItems
                  .slice(0, 6)
                  .map((document) => (
                    <div
                      key={document.key}
                      className={portalReviewCardClassName}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {document.label}
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-slate-950">
                            {document.reference}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {document.helperText}
                          </p>
                        </div>
                        <PortalStatusBadge status={document.tone}>
                          {document.customerActionRequired
                            ? "Needs review"
                            : document.statusLabel}
                        </PortalStatusBadge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <PortalSecondaryLink href={document.href}>
                          Open
                        </PortalSecondaryLink>
                        {document.printHref ? (
                          <PortalSecondaryLink href={document.printHref}>
                            Print / Save PDF
                          </PortalSecondaryLink>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </section>
            ) : (
              <AppEmptyState
                eyebrow="Closeout records"
                title="No closeout records shared yet"
                description={closeoutHandoff.emptyStateMessage}
              />
            )}

            <div className={portalInsetPanelClassName}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Customer-safe boundary
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {closeoutHandoff.customerSafeBoundary}
              </p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Evidence receipt
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {sharedEvidenceReceipt.statusLabel}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {sharedEvidenceReceipt.primaryMessage}
                    </p>
                  </div>
                  <PortalSecondaryLink
                    href={buildPortalProjectEvidenceReceiptPrintHref(projectId)}
                  >
                    Print receipt
                  </PortalSecondaryLink>
                </div>
              </div>
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Project Communication"
          description="Customer-visible project conversation history shared through this portal."
        >
          <div id="project-communication" className="grid gap-5">
            {projectCommunication.conversations.length > 0 ? (
              projectCommunication.conversations.map((conversation) => (
                <section
                  key={conversation.thread.id}
                  className={portalReviewCardClassName}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Project conversation
                      </p>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {conversation.latestMessage
                          ? `Latest reply ${formatDateTime(conversation.latestMessage.occurredAt)}`
                          : "Customer-visible conversation"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Replies are saved to your project communication history.
                        This does not send a separate email or SMS.
                      </p>
                    </div>
                    <PortalStatusBadge status="neutral">
                      {conversation.messages.length} message
                      {conversation.messages.length === 1 ? "" : "s"}
                    </PortalStatusBadge>
                  </div>

                  <div className="mt-5 space-y-3">
                    {conversation.messages.slice(-4).map((message) => (
                      <article
                        key={message.id}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-950">
                            {getPortalMessageSenderLabel(message)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(message.occurredAt)}
                          </p>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {message.body}
                        </p>
                      </article>
                    ))}
                  </div>

                  {conversation.replyAllowed ? (
                    <form
                      action={replyToPortalProjectCommunicationThreadAction}
                      className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <input
                        type="hidden"
                        name="threadId"
                        value={conversation.thread.id}
                      />
                      <label
                        htmlFor={`portal-reply-${conversation.thread.id}`}
                        className="text-sm font-semibold text-slate-950"
                      >
                        Reply to this project conversation
                      </label>
                      <textarea
                        id={`portal-reply-${conversation.thread.id}`}
                        name="body"
                        rows={4}
                        maxLength={5000}
                        required
                        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Write a customer-visible reply..."
                      />
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-slate-500">
                          Saved in FloorConnector only. It does not send email
                          or SMS.
                        </p>
                        <button
                          type="submit"
                          className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                          Post reply
                        </button>
                      </div>
                    </form>
                  ) : null}
                </section>
              ))
            ) : (
              <AppEmptyState
                eyebrow="Project communication"
                title="No shared conversation yet"
                description={projectCommunication.emptyStateMessage}
              />
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Shared Project Evidence"
          description="Selected photos and files the contractor explicitly shared for this project."
        >
          <div id="shared-project-evidence" className="grid gap-5">
            <section className={portalStatePanelClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    Shared evidence
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {sharedEvidence.statusLabel}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {sharedEvidence.primaryMessage}
                  </p>
                </div>
                <PortalStatusBadge
                  status={
                    sharedEvidence.items.length > 0 ? "complete" : "neutral"
                  }
                  className="shrink-0"
                >
                  Explicitly shared
                </PortalStatusBadge>
              </div>
            </section>

            {sharedEvidence.items.length > 0 ? (
              <section className="grid gap-4 lg:grid-cols-2">
                {sharedEvidence.items.map((item) => (
                  <div key={item.key} className={portalReviewCardClassName}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {item.sourceCategory}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.customerNote ??
                            item.caption ??
                            "Shared as customer-safe project evidence."}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Shared {formatDateTime(item.sharedAt)} /{" "}
                          {item.fileName}
                        </p>
                      </div>
                      <PortalStatusBadge
                        status={item.href ? "complete" : "neutral"}
                      >
                        {item.statusLabel}
                      </PortalStatusBadge>
                    </div>
                    {item.href ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <PortalSecondaryLink href={item.href}>
                          Open shared file
                        </PortalSecondaryLink>
                        {item.acknowledgementAllowed ? (
                          <form action={acknowledgePortalSharedEvidenceAction}>
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="grantId"
                              value={item.grantId}
                            />
                            <button
                              type="submit"
                              className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                              Acknowledge receipt
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600 sm:grid-cols-2">
                      <p>
                        Viewed in portal:{" "}
                        {item.deliveryProof.viewCount > 0
                          ? `${item.deliveryProof.viewCount} time${item.deliveryProof.viewCount === 1 ? "" : "s"}`
                          : "Not yet"}
                      </p>
                      <p>
                        Download requested:{" "}
                        {item.deliveryProof.downloadCount > 0
                          ? `${item.deliveryProof.downloadCount} time${item.deliveryProof.downloadCount === 1 ? "" : "s"}`
                          : "Not yet"}
                      </p>
                      <p>
                        Acknowledgement:{" "}
                        {item.deliveryProof.acknowledgedAt
                          ? formatDateTime(item.deliveryProof.acknowledgedAt)
                          : "Not acknowledged"}
                      </p>
                      <p>
                        Receipt note: access acknowledgement is not a scope,
                        price, schedule, or payment approval.
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <AppEmptyState
                eyebrow="Shared proof"
                title="No project evidence has been shared yet"
                description={sharedEvidence.emptyStateMessage}
              />
            )}

            <div className={portalInsetPanelClassName}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Visibility boundary
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {sharedEvidence.storageBoundaryMessage}
              </p>
              <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-3">
                <p className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  Acknowledged: {sharedEvidenceReceipt.acknowledgedCount}
                </p>
                <p className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  Awaiting acknowledgement:{" "}
                  {sharedEvidenceReceipt.unacknowledgedSharedCount}
                </p>
                <p className="rounded-md border border-slate-200 bg-white px-3 py-2">
                  Last activity:{" "}
                  {sharedEvidenceReceipt.lastCustomerInteractionAt
                    ? formatDateTime(
                        sharedEvidenceReceipt.lastCustomerInteractionAt
                      )
                    : "Not yet"}
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {sharedEvidenceReceipt.acknowledgementDisclaimer}
              </p>
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Project trust thread"
          description="Customer-safe status, approvals, invoices, shared documents, and explicitly shared evidence from records available in this portal."
        >
          {timeline.timelineItems.length > 0 ? (
            <div className="space-y-3">
              {timeline.timelineItems.map((item) => (
                <div
                  key={item.key}
                  className={[
                    portalReviewCardClassName,
                    "border-l-4",
                    getTimelineAccentClassName(item.tone)
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {formatTimelineDate(item.occurredAt)}
                        </p>
                        {item.customerActionRequired ? (
                          <PortalStatusBadge status="attention">
                            Waiting on you
                          </PortalStatusBadge>
                        ) : null}
                      </div>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {item.label}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <PortalStatusBadge status={item.tone}>
                      {item.tone === "attention"
                        ? "Ready for review"
                        : item.tone}
                    </PortalStatusBadge>
                  </div>
                  {item.href ? (
                    <div className="mt-4">
                      <PortalSecondaryLink href={item.href}>
                        {item.customerActionRequired
                          ? "Review record"
                          : "Open record"}
                      </PortalSecondaryLink>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="What happened"
              title="No timeline activity yet"
              description={timeline.emptyStateMessage}
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Shared documents"
          description="Open the project records shared with you, or print and save the documents that already support it."
        >
          {sharedDocuments.documents.length > 0 ? (
            <div className="grid gap-4">
              {sharedDocuments.documents.map((document) => (
                <div key={document.key} className={portalReviewCardClassName}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {document.label}
                        </p>
                        {document.customerActionRequired ? (
                          <PortalStatusBadge status="attention">
                            Needs your attention
                          </PortalStatusBadge>
                        ) : null}
                      </div>
                      <h2 className="mt-2 text-base font-semibold text-slate-950">
                        {document.reference}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {document.helperText}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      <PortalStatusBadge status={document.tone}>
                        {getSharedDocumentStateLabel(document)}
                      </PortalStatusBadge>
                      <p className="text-xs capitalize text-slate-500">
                        {document.statusLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <PortalSecondaryLink href={document.primaryHref}>
                      {document.actionLabel}
                    </PortalSecondaryLink>
                    {document.printHref ? (
                      <PortalSecondaryLink href={document.printHref}>
                        Print / Save PDF
                      </PortalSecondaryLink>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="Shared documents"
              title="No documents shared yet"
              description={sharedDocuments.emptyStateMessage}
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Appointments"
          description="Customer-visible appointment times shared by your contractor for this project."
        >
          {appointments.length > 0 ? (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <RecordSummaryCard
                  key={appointment.id}
                  eyebrow="Appointment"
                  title={
                    appointment.title ||
                    formatStatusLabel(appointment.appointmentType)
                  }
                  description={
                    appointment.customerNotes?.trim() ||
                    "Your contractor shared this appointment time for the project."
                  }
                  meta={`${formatStatusLabel(appointment.appointmentType)} | ${formatAppointmentTime(
                    appointment.startsAt,
                    appointment.endsAt
                  )}${appointment.location ? ` | ${appointment.location}` : ""}`}
                  badge={formatStatusLabel(appointment.status)}
                />
              ))}
            </div>
          ) : (
            <AppEmptyState
              eyebrow="No appointments"
              title="No customer-visible appointments yet"
              description="When your contractor shares an appointment for this project, it will appear here."
            />
          )}
        </DetailPanel>

        <DetailPanel
          title="Commercial Records"
          description="Records your contractor has shared for this project."
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Estimates and proposals
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Proposal and pricing details tied to this project.
                </p>
              </div>
              {estimates.length > 0 ? (
                <div className="grid gap-4">
                  {estimates.map((estimate) => (
                    <RecordSummaryCard
                      key={estimate.id}
                      eyebrow="Estimate"
                      title={estimate.referenceNumber}
                      description={
                        estimate.notes?.trim() ||
                        "Proposal details and pricing are shared on this estimate."
                      }
                      meta={`Total ${formatMoney(estimate.totalAmount)} | Updated ${formatDateTime(estimate.updatedAt)}`}
                      badge={formatStatusLabel(estimate.status)}
                      href={`/portal/estimates/${estimate.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No estimates"
                  title="No proposal has been shared yet"
                  description="When your contractor publishes estimate information to this project, it will appear here."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Warranty documents
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Warranty records your contractor has shared for this project.
                </p>
              </div>
              {warrantyDocuments.length > 0 ? (
                <div className="grid gap-4">
                  {warrantyDocuments.map((warrantyDocument) => (
                    <RecordSummaryCard
                      key={warrantyDocument.id}
                      eyebrow="Warranty"
                      title={warrantyDocument.title}
                      description={
                        warrantyDocument.warrantyBasis?.trim() ||
                        "Warranty terms are shared on this project."
                      }
                      meta={getPortalWarrantyDocumentSummary(warrantyDocument)}
                      badge={formatStatusLabel(warrantyDocument.status)}
                      href={`/portal/warranty-documents/${warrantyDocument.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No warranties"
                  title="No warranty document has been shared yet"
                  description="Issued warranty documents connected to this project will appear here when your contractor shares them."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Contracts</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Contracts shared for this project.
                </p>
              </div>
              {contracts.length > 0 ? (
                <div className="grid gap-4">
                  {contracts.map((contract) => (
                    <RecordSummaryCard
                      key={contract.id}
                      eyebrow="Contract"
                      title={contract.title}
                      description={
                        contract.renderedSubject?.trim() ||
                        "Contract content has been shared for this project."
                      }
                      meta={getPortalContractSummary(contract)}
                      badge={formatStatusLabel(contract.status)}
                      href={`/portal/contracts/${contract.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No contracts"
                  title="No contract has been shared yet"
                  description="Contract visibility will appear here once your contractor publishes it for this project."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">
                  Change orders
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Approved or pending scope adjustments for this project.
                </p>
              </div>
              {changeOrders.length > 0 ? (
                <div className="grid gap-4">
                  {changeOrders.map((changeOrder) => (
                    <RecordSummaryCard
                      key={changeOrder.id}
                      eyebrow="Change order"
                      title={changeOrder.title}
                      description={
                        changeOrder.scopeChangeNotes?.trim() ||
                        changeOrder.description?.trim() ||
                        "Scope adjustment shared on this project."
                      }
                      meta={`${Number(
                        changeOrder.priceAdjustment
                      ).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                      })} | Updated ${formatDateTime(changeOrder.updatedAt)}`}
                      badge={formatStatusLabel(changeOrder.status)}
                      href={`/portal/change-orders/${changeOrder.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No change orders"
                  title="No scope changes have been shared yet"
                  description="If scope or price changes are published for this project, they will appear here."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Invoices</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Invoice visibility stays project-centered so billing remains
                  easy to follow.
                </p>
              </div>
              {invoices.length > 0 ? (
                <div className="grid gap-4">
                  {invoices.map((invoice) => (
                    <RecordSummaryCard
                      key={invoice.id}
                      eyebrow={
                        invoice.workflowRole === "deposit"
                          ? "Deposit invoice"
                          : "Invoice"
                      }
                      title={invoice.referenceNumber}
                      description={`Total ${formatMoney(invoice.totalAmount)} with ${formatMoney(invoice.balanceDueAmount)} currently due.`}
                      meta={`${getPortalInvoiceSummary(invoice)} | Issued ${formatDate(invoice.issueDate)} | Due ${formatDate(invoice.dueDate)}`}
                      badge={formatStatusLabel(invoice.status)}
                      href={`/portal/invoices/${invoice.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No invoices"
                  title="No invoice has been shared yet"
                  description="Invoices connected to this project will appear here when they are made visible in the portal."
                />
              )}
            </section>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Project Context"
          description="Compact project facts for review."
        >
          <ContextFactsList
            items={[
              {
                label: "Customer",
                value:
                  project.customer?.companyName ??
                  project.customer?.name ??
                  "Not provided"
              },
              {
                label: "Contact email",
                value: project.customer?.email ?? "Not provided"
              },
              {
                label: "Contact phone",
                value: project.customer?.phone ?? "Not provided"
              },
              {
                label: "Location",
                value: formatLocation([
                  project.location.addressLine1,
                  project.location.addressLine2,
                  project.location.city,
                  project.location.stateRegion,
                  project.location.postalCode,
                  project.location.countryCode
                ])
              },
              {
                label: "Project description",
                value:
                  project.description ??
                  "No additional project description is shared yet."
              },
              {
                label: "Updated",
                value: formatDateTime(project.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Workspace Guidance"
          description="Use this project as the bridge into the record carrying the current step."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Contract signing and invoice payment progress update this project,
              so the next shared step changes here as work moves forward.
            </p>
            <PortalSecondaryLink href="/portal">
              Return to portal home
            </PortalSecondaryLink>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
