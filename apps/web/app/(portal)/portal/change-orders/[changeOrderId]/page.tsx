import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  customerApproveChangeOrderAction,
  customerRejectChangeOrderAction
} from "@/lib/change-orders/actions";
import { recordPortalViewedChangeOrder } from "@/lib/change-orders/data";
import { getPortalChangeOrderReviewData } from "@/lib/portal/data";

type PortalChangeOrderReviewPageProps = {
  params: Promise<{
    changeOrderId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not yet";
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getNextAction(input: {
  status: string;
  projectId: string;
  invoiceId: string | null;
}) {
  if (input.status === "approved") {
    return {
      title: "Change order approval is complete",
      description:
        "The shared scope decision is now complete. Return to the project workspace or linked invoice to review the downstream effect.",
      label: input.invoiceId ? "Review linked invoice" : "Return to project workspace",
      href: input.invoiceId ? `/portal/invoices/${input.invoiceId}` : `/portal/projects/${input.projectId}`
    };
  }

  if (input.status === "rejected") {
    return {
      title: "Change order was rejected",
      description:
        "The contractor can revise this same shared record and resend it if the scope or pricing needs another pass.",
      label: "Return to project workspace",
      href: `/portal/projects/${input.projectId}`
    };
  }

  return {
    title: "Review and decide on the scope change",
    description:
      "This page keeps the scope update, approval decision, and any linked billing effect tied to the same shared project chain.",
    label: "Return to project workspace",
    href: `/portal/projects/${input.projectId}`
  };
}

export default async function PortalChangeOrderReviewPage({
  params,
  searchParams
}: PortalChangeOrderReviewPageProps) {
  const { changeOrderId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  let changeOrder = await getPortalChangeOrderReviewData(
    changeOrderId,
    `/portal/change-orders/${changeOrderId}`
  );

  if (!changeOrder) {
    notFound();
  }

  if (changeOrder.status === "sent" && !changeOrder.customerViewedAt) {
    try {
      await recordPortalViewedChangeOrder(changeOrderId, `/portal/change-orders/${changeOrderId}`);
      changeOrder = await getPortalChangeOrderReviewData(
        changeOrderId,
        `/portal/change-orders/${changeOrderId}`
      );
    } catch {
      // Keep the page usable even if the viewed transition cannot be captured here.
    }
  }

  if (!changeOrder) {
    notFound();
  }

  const nextAction = getNextAction({
    status: changeOrder.status,
    projectId: changeOrder.projectId,
    invoiceId: changeOrder.invoiceId
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Change Order Review"
            title={changeOrder.title}
            description="Review the shared scope and price adjustment, then approve or reject this same canonical change order."
            backHref={`/portal/projects/${changeOrder.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700">
                {formatStatusLabel(changeOrder.status)}
              </span>
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
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <section className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] px-6 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                  Scope change
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700">
                      {formatMoney(changeOrder.priceAdjustment)}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium capitalize text-slate-700">
                      {formatStatusLabel(changeOrder.status)}
                    </span>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {changeOrder.scopeChangeNotes?.trim() ||
                      changeOrder.description?.trim() ||
                      "The contractor has prepared a scope adjustment for this shared project."}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {changeOrder.invoice
                      ? "If you approve this positive change order, the linked invoice may be updated on the same shared billing chain."
                      : "This scope change stays connected to the shared project and contract history even if it is not linked to billing yet."}
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
                    label: "What happens next",
                    content: (
                      <NextActionCard
                        eyebrow="Customer guidance"
                        title={nextAction.title}
                        description={nextAction.description}
                        primaryAction={
                          <Link
                            href={nextAction.href}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                          >
                            {nextAction.label}
                          </Link>
                        }
                      />
                    )
                  },
                  {
                    key: "shared-state",
                    label: "Shared state",
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
        </div>

        <DetailPanel
          title="Change Details"
          description="Read the shared scope summary first, then decide whether this project should accept the adjustment."
        >
          <div className="space-y-6">
            {changeOrder.description?.trim() ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                <p className="text-sm font-medium text-slate-950">Commercial summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{changeOrder.description}</p>
              </div>
            ) : null}

            <article className="rounded-3xl border border-slate-200 bg-slate-50/50 px-6 py-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {changeOrder.scopeChangeNotes?.trim() ||
                "No additional scope notes were captured on this change order."}
            </article>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Decision Actions"
          description="Approve or reject this same shared change-order record."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            {changeOrder.status === "sent" ? (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <form action={customerApproveChangeOrderAction} className="space-y-3">
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-950">
                      Optional approval note
                    </span>
                    <textarea
                      name="decisionNote"
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Share a short note if you want the contractor to see approval context."
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Approve change order
                  </button>
                </form>

                <form action={customerRejectChangeOrderAction} className="space-y-3">
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-950">
                      Optional rejection note
                    </span>
                    <textarea
                      name="decisionNote"
                      rows={3}
                      maxLength={1000}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Share a short note if the scope or pricing needs revision."
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2.5 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
                  >
                    Reject change order
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                {changeOrder.status === "approved"
                  ? "This change order is already approved on the shared project chain."
                  : changeOrder.status === "rejected"
                    ? "This change order is already rejected. The contractor can revise and resend it if needed."
                    : "This page remains available for review even when no decision is currently open."}
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Connected Records"
          description="Review the shared project and any linked billing context."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: changeOrder.project ? (
                  <Link
                    href={`/portal/projects/${changeOrder.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {changeOrder.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value:
                  changeOrder.customer?.companyName ??
                  changeOrder.customer?.name ??
                  "Not provided"
              },
              {
                label: "Contract",
                value: changeOrder.contract ? (
                  <Link
                    href={`/portal/contracts/${changeOrder.contract.id}`}
                    className="font-medium text-brand-700"
                  >
                    {changeOrder.contract.title}
                  </Link>
                ) : (
                  "No linked contract"
                )
              },
              {
                label: "Invoice",
                value: changeOrder.invoice ? (
                  <Link
                    href={`/portal/invoices/${changeOrder.invoice.id}`}
                    className="font-medium text-brand-700"
                  >
                    {changeOrder.invoice.referenceNumber}
                  </Link>
                ) : (
                  "No linked invoice"
                )
              },
              {
                label: "Invoice impact",
                value: changeOrder.appliedInvoiceLineItemId
                  ? "Applied to the linked invoice"
                  : changeOrder.invoiceId && Number(changeOrder.priceAdjustment) > 0
                    ? "Positive approved changes can update the linked invoice"
                    : "No automatic invoice application"
              },
              {
                label: "Decision note",
                value: changeOrder.decisionNote ?? "No decision note yet"
              }
            ]}
          />
        </DetailPanel>
      </aside>
    </div>
  );
}
