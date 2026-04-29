import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { ChangeOrderApprovalNextStepsPanel } from "@/components/change-orders/approval-next-steps-panel";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import {
  addApprovedChangeOrderToSovAction,
  invoiceApprovedChangeOrderDirectlyAction,
  resetRejectedChangeOrderAction,
  sendChangeOrderAction,
  updateChangeOrderAction
} from "@/lib/change-orders/actions";
import { getChangeOrderById } from "@/lib/change-orders/data";
import { listContracts } from "@/lib/contracts/data";
import { listInvoices } from "@/lib/invoices/data";
import { listProgressBillingByProject } from "@/lib/progress-billing/data";
import { listProjects } from "@/lib/projects/data";

type ChangeOrderDetailPageProps = {
  params: Promise<{
    changeOrderId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    showNextSteps?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not yet";
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "sent":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function getNextAction(input: {
  status: string;
  id: string;
  projectId: string;
  invoiceId: string | null;
  appliedInvoiceLineItemId: string | null;
  priceAdjustment: string;
}) {
  if (input.status === "draft") {
    return {
      title: "Finish the draft and send it",
      description:
        "Review the linked records, tighten the scope notes, and then send this same change order out for customer decision.",
      primaryLabel: "Send for review",
      primaryKind: "send" as const
    };
  }

  if (input.status === "sent") {
    return {
      title: "Wait for portal decision",
      description:
        "The customer-facing portal now owns the next step. Keep this workspace focused on continuity and downstream impact planning while approval is pending.",
      primaryLabel: "Open portal project",
      primaryHref: `/portal/projects/${input.projectId}`
    };
  }

  if (input.status === "approved") {
    return {
      title:
        input.invoiceId && Number(input.priceAdjustment) > 0
          ? input.appliedInvoiceLineItemId
            ? "Invoice continuity has been applied"
            : "Choose the billing next step"
          : "Scope approval is complete",
      description:
        input.invoiceId && Number(input.priceAdjustment) > 0
          ? input.appliedInvoiceLineItemId
            ? "This approved change order has already written a real line into the linked invoice record."
            : "The approved change order is ready for explicit downstream billing from the new next-step panel below."
          : "The scope decision is complete. Use the project hub and connected records to continue downstream execution or billing follow-through.",
      primaryLabel: input.invoiceId ? "Open linked invoice" : "Open project hub",
      primaryHref: input.invoiceId ? `/invoices/${input.invoiceId}` : `/projects/${input.projectId}`
    };
  }

  return {
    title: "Revise and resend if needed",
    description:
      "The customer rejected this scope change. Review the decision note, return the change order to draft if you need to revise it, and then send again.",
    primaryLabel: "Return to draft",
    primaryKind: "reset" as const
  };
}

export default async function ChangeOrderDetailPage({
  params,
  searchParams
}: ChangeOrderDetailPageProps) {
  const { changeOrderId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [changeOrder, projects, contracts, invoices, communicationThreads] = await Promise.all([
    getChangeOrderById(changeOrderId, `/change-orders/${changeOrderId}`),
    listProjects(),
    listContracts(),
    listInvoices(),
    listCommunicationThreadsForSubject("change_order", changeOrderId)
  ]);

  if (!changeOrder) {
    notFound();
  }

  const editable = changeOrder.status === "draft";
  const nextAction = getNextAction({
    status: changeOrder.status,
    id: changeOrder.id,
    projectId: changeOrder.projectId,
    invoiceId: changeOrder.invoiceId,
    appliedInvoiceLineItemId: changeOrder.appliedInvoiceLineItemId,
    priceAdjustment: changeOrder.priceAdjustment
  });
  const visibleContracts = contracts.filter(
    (contract) =>
      contract.projectId === changeOrder.projectId || contract.id === changeOrder.contractId
  );
  const visibleInvoices = invoices.filter(
    (invoice) =>
      invoice.projectId === changeOrder.projectId || invoice.id === changeOrder.invoiceId
  );
  const scheduleOfValuesOptions = await listProgressBillingByProject(
    changeOrder.projectId,
    `/change-orders/${changeOrderId}`
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Change Order Workspace"
            title={changeOrder.title}
            description="Keep the scope adjustment, customer decision, and any downstream billing effect on the same canonical project chain."
            backHref="/change-orders"
            backLabel="Back to change orders"
            actions={
              <div className="flex flex-wrap gap-2.5">
                <span
                  className={[
                    "inline-flex rounded-full border px-4 py-2 text-sm font-medium capitalize",
                    getStatusBadgeClassName(changeOrder.status)
                  ].join(" ")}
                >
                  {formatStatusLabel(changeOrder.status)}
                </span>
                <Link
                  href={`/projects/${changeOrder.projectId}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                >
                  Open project hub
                </Link>
                {changeOrder.invoiceId ? (
                  <Link
                    href={`/invoices/${changeOrder.invoiceId}`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    Open linked invoice
                  </Link>
                ) : null}
              </div>
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

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] px-6 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                  Change impact
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={[
                        "inline-flex rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize",
                        getStatusBadgeClassName(changeOrder.status)
                      ].join(" ")}
                    >
                      {formatStatusLabel(changeOrder.status)}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700">
                      {formatMoney(changeOrder.priceAdjustment)}
                    </span>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {changeOrder.scopeChangeNotes?.trim() ||
                      changeOrder.description?.trim() ||
                      "Scope adjustment details are still being prepared in this workspace."}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {changeOrder.status === "approved"
                      ? changeOrder.appliedInvoiceLineItemId
                        ? "The approved commercial adjustment has already been applied to the linked invoice."
                        : changeOrder.invoiceId && Number(changeOrder.priceAdjustment) > 0
                          ? "This approved adjustment is linked to billing and should now be reflected on the invoice continuity chain."
                          : "This approved scope change now belongs to the canonical project history."
                      : changeOrder.status === "sent"
                        ? "Customer decision is pending in the portal review flow."
                        : changeOrder.status === "rejected"
                          ? "Customer feedback is available below. Return to draft if you need to revise and resend."
                          : "Draft mode is still active, so this change order can be refined before customer review starts."}
                  </p>
                </div>
              </section>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2"
                itemClassName="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-4"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "next-action",
                    label: "Next best action",
                    content: (
                      <NextActionCard
                        eyebrow="Workflow guidance"
                        title={nextAction.title}
                        description={nextAction.description}
                        primaryAction={
                          nextAction.primaryKind === "send" ? (
                            <form action={sendChangeOrderAction}>
                              <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                              <input type="hidden" name="currentStatus" value={changeOrder.status} />
                              <button
                                type="submit"
                                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                              >
                                {nextAction.primaryLabel}
                              </button>
                            </form>
                          ) : nextAction.primaryKind === "reset" ? (
                            <form action={resetRejectedChangeOrderAction}>
                              <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                              <input type="hidden" name="currentStatus" value={changeOrder.status} />
                              <button
                                type="submit"
                                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                              >
                                {nextAction.primaryLabel}
                              </button>
                            </form>
                          ) : nextAction.primaryHref ? (
                            <Link
                              href={nextAction.primaryHref}
                              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                            >
                              {nextAction.primaryLabel}
                            </Link>
                          ) : null
                        }
                      />
                    )
                  },
                  {
                    key: "portal-state",
                    label: "Portal state",
                    content: (
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>Sent: {formatDateTime(changeOrder.sentAt)}</p>
                        <p>Viewed: {formatDateTime(changeOrder.customerViewedAt)}</p>
                        <p>Approved: {formatDateTime(changeOrder.approvedAt)}</p>
                        <p>Rejected: {formatDateTime(changeOrder.rejectedAt)}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>

          {changeOrder.status === "approved" ? (
            <div className="mt-8">
              <ChangeOrderApprovalNextStepsPanel
                changeOrder={changeOrder}
                addToSovAction={addApprovedChangeOrderToSovAction}
                invoiceDirectlyAction={invoiceApprovedChangeOrderDirectlyAction}
                scheduleOfValuesOptions={scheduleOfValuesOptions.map((workspace) => ({
                  id: workspace.id,
                  estimateReferenceNumber: workspace.estimate?.referenceNumber ?? "Unnumbered estimate",
                  estimateStatus: workspace.estimate?.status ?? "approved",
                  scheduledValueTotal: workspace.scheduledValueTotal
                }))}
                initialOpen={
                  resolvedSearchParams.showNextSteps === "1" ||
                  (!changeOrder.appliedInvoiceLineItemId &&
                    changeOrder.latestCommercialSnapshotItemIds.length > 0)
                }
              />
            </div>
          ) : null}
        </div>

        <DetailPanel
          title="Change Order Details"
          description="Draft editing stays here on the same record. Once sent, the workspace shifts into review and continuity mode."
        >
          <form action={updateChangeOrderAction} className="space-y-6">
            <input type="hidden" name="changeOrderId" value={changeOrder.id} />

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
                <select
                  name="projectId"
                  defaultValue={changeOrder.projectId}
                  disabled={!editable}
                  className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Price adjustment
                </span>
                <input
                  name="priceAdjustment"
                  type="number"
                  step="0.01"
                  defaultValue={changeOrder.priceAdjustment}
                  disabled={!editable}
                  required
                  className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Title</span>
              <input
                name="title"
                defaultValue={changeOrder.title}
                disabled={!editable}
                required
                className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
              />
            </label>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Linked contract
                </span>
                <select
                  name="contractId"
                  defaultValue={changeOrder.contractId ?? ""}
                  disabled={!editable}
                  className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                >
                  <option value="">No linked contract</option>
                  {visibleContracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.title} | {formatStatusLabel(contract.status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Linked invoice
                </span>
                <select
                  name="invoiceId"
                  defaultValue={changeOrder.invoiceId ?? ""}
                  disabled={!editable}
                  className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                >
                  <option value="">No linked invoice</option>
                  {visibleInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.referenceNumber} | {formatStatusLabel(invoice.status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">Description</span>
              <textarea
                name="description"
                defaultValue={changeOrder.description ?? ""}
                disabled={!editable}
                rows={4}
                className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                placeholder="Summarize the commercial intent of the change order."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Scope change notes
              </span>
              <textarea
                name="scopeChangeNotes"
                defaultValue={changeOrder.scopeChangeNotes ?? ""}
                disabled={!editable}
                rows={7}
                className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#91a5c6]"
                placeholder="Capture the added work, removed work, or field condition shift that changed scope."
              />
            </label>

            {editable ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  formAction={sendChangeOrderAction}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Send for review
                </button>
              </div>
            ) : changeOrder.status === "rejected" ? (
              <div className="flex flex-wrap gap-3">
                <form action={resetRejectedChangeOrderAction}>
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <input type="hidden" name="currentStatus" value={changeOrder.status} />
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Return to draft
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                Sent and decided change orders stay review-first here. Return a rejected record
                to draft before editing it again.
              </div>
            )}
          </form>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Connected Records"
          description="The surrounding commercial chain this change order belongs to."
        >
          <div className="grid gap-4">
            {changeOrder.project ? (
              <LinkedRecordCard
                href={`/projects/${changeOrder.project.id}`}
                title={changeOrder.project.name}
                subtitle="Project"
                meta={changeOrder.customer?.name ?? "Unknown customer"}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(changeOrder.project.status)}
                  </span>
                }
              />
            ) : null}
            {changeOrder.contract ? (
              <LinkedRecordCard
                href={`/contracts/${changeOrder.contract.id}`}
                title={changeOrder.contract.title}
                subtitle="Contract"
                meta="Linked commercial agreement"
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(changeOrder.contract.status)}
                  </span>
                }
              />
            ) : null}
            {changeOrder.invoice ? (
              <LinkedRecordCard
                href={`/invoices/${changeOrder.invoice.id}`}
                title={changeOrder.invoice.referenceNumber}
                subtitle="Invoice"
                meta={`Balance due ${formatMoney(changeOrder.invoice.balanceDueAmount)}`}
                badge={
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {formatStatusLabel(changeOrder.invoice.status)}
                  </span>
                }
              />
            ) : null}
            {!changeOrder.contract && !changeOrder.invoice ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                This scope change is connected only to the project so far.
              </div>
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Change Order Context"
          description="Compact status and decision timing without leaving the workspace."
        >
          <ContextFactsList
            items={[
              {
                label: "Customer",
                value:
                  changeOrder.customer?.companyName ??
                  changeOrder.customer?.name ??
                  "Not provided"
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(changeOrder.status)}</span>
              },
              {
                label: "Sent",
                value: formatDateTime(changeOrder.sentAt)
              },
              {
                label: "Viewed in portal",
                value: formatDateTime(changeOrder.customerViewedAt)
              },
              {
                label: "Approved",
                value: formatDateTime(changeOrder.approvedAt)
              },
              {
                label: "Rejected",
                value: formatDateTime(changeOrder.rejectedAt)
              },
              {
                label: "Invoice application",
                value: changeOrder.appliedInvoiceLineItemId
                  ? "Applied to linked invoice"
                  : changeOrder.invoiceId && Number(changeOrder.priceAdjustment) > 0
                    ? "Linked invoice ready for approved adjustment"
                    : "No automatic invoice application"
              },
              {
                label: "Decision note",
                value: changeOrder.decisionNote ?? "No customer decision note yet"
              }
            ]}
          />
        </DetailPanel>

        <RelatedConversationsCard
          source="change_order"
          description="Change-order communication stays on canonical threads and routes back into the shared communications workspace when scope-review follow-through is needed."
          countLabel="Change-order threads"
          emptyMessage="No change-order-scoped communication threads are attached to this canonical change order yet."
          actionClassName="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          threads={communicationThreads}
        />
      </aside>
    </div>
  );
}
