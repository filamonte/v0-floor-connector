import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  PortalTrustStrip,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalReviewCardClassName,
  portalStatePanelClassName,
  portalSummaryItemClassName,
  portalSummaryLabelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { derivePortalProjectStatusWindow } from "@/lib/portal/project-status-window";
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
  params
}: PortalProjectDetailPageProps) {
  const { projectId } = await params;
  const [
    project,
    appointments,
    estimates,
    contracts,
    invoices,
    changeOrders,
    warrantyDocuments
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
    invoices
  });

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
                    {statusWindow.customerNextStep.label}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {statusWindow.primaryMessage}
                  </p>
                  <div className={portalInsetPanelClassName}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Documents and payments
                    </p>
                    <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                      <p>
                        Estimate:{" "}
                        {formatStatusLabel(project.latestEstimateStatus)}
                      </p>
                      <p>
                        Contract:{" "}
                        {formatStatusLabel(project.latestContractStatus)}
                      </p>
                      <p>
                        Invoice:{" "}
                        {formatStatusLabel(project.latestInvoiceStatus)}
                      </p>
                      {project.latestInvoiceStatus ? (
                        <p>
                          Payment:{" "}
                          {getPortalInvoiceSummary({
                            workflowRole:
                              project.latestInvoiceWorkflowRole ?? "standard",
                            status: project.latestInvoiceStatus,
                            balanceDueAmount:
                              project.latestInvoiceBalanceDueAmount ?? "0",
                            latestPaymentEventType:
                              project.latestInvoicePaymentEventType,
                            latestPaymentEventAt:
                              project.latestInvoicePaymentEventAt
                          })}
                        </p>
                      ) : null}
                    </div>
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
                          <PortalSecondaryLink
                            href={statusWindow.customerNextStep.href}
                          >
                            {statusWindow.customerNextStep.label}
                          </PortalSecondaryLink>
                        }
                      />
                    )
                  },
                  {
                    key: "record-visibility",
                    label: "Shared records",
                    content: (
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          {statusWindow.sharedRecords.length} total record(s)
                        </p>
                        <p>
                          {statusWindow.attentionItems.length} needing attention
                        </p>
                        <p>{statusWindow.completedItems.length} complete</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

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
