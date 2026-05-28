import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  PortalTrustStrip,
  portalActionBoxClassName,
  portalHeroPanelClassName,
  portalSummaryItemClassName,
  portalSummaryLabelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { buildDocumentPrintHref } from "@/lib/document-engine/print";
import {
  customerAddEstimateCommentAction,
  customerApproveEstimateAction,
  customerRejectEstimateAction
} from "@/lib/estimates/actions";
import { getIncludedEstimateScopeItems } from "@/lib/estimates/workspace";
import { recordPortalViewedEstimate } from "@/lib/estimates/data";
import {
  getPortalEstimateReviewData,
  type PortalEstimateReviewDetail
} from "@/lib/portal/data";

type PortalEstimateReviewPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
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

function getNextAction(status: string, projectId: string) {
  if (status === "approved") {
    return {
      title: "Proposal approval is complete",
      description:
        "Your contractor can now keep moving this project forward through contract and billing steps.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  if (status === "sent") {
    return {
      title: "Review this proposal with your contractor",
      description:
        "This estimate is shared for review. Use the decision actions on this page when you are ready to approve, reject, or comment.",
      label: "Go to decision actions",
      href: "#decision-actions"
    };
  }

  if (status === "rejected") {
    return {
      title: "Revision feedback is complete",
      description:
        "Your contractor can revise this estimate and resend it if the scope needs another pass.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  return {
    title: "Review the shared scope",
    description:
      "This page shows the currently shared proposal details for the project. Available decision actions appear here when this estimate is sent for customer review.",
    label: "Return to project workspace",
    href: `/portal/projects/${projectId}`
  };
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

function groupEstimateLineItems(
  lineItems: PortalEstimateReviewDetail["lineItems"]
) {
  const groups: Array<{
    label: string;
    rows: PortalEstimateReviewDetail["lineItems"];
    subtotal: number;
  }> = [];
  const groupsByLabel = new Map<string, (typeof groups)[number]>();

  for (const lineItem of lineItems) {
    const label = lineItem.groupName?.trim() || "Estimate Items";
    const existing = groupsByLabel.get(label);
    const group = existing ?? {
      label,
      rows: [],
      subtotal: 0
    };

    group.rows.push(lineItem);
    group.subtotal += Number(lineItem.lineTotal);

    if (!existing) {
      groupsByLabel.set(label, group);
      groups.push(group);
    }
  }

  return groups;
}

export default async function PortalEstimateReviewPage({
  params,
  searchParams
}: PortalEstimateReviewPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  let estimate = await getPortalEstimateReviewData(
    estimateId,
    `/portal/estimates/${estimateId}`
  );

  if (!estimate) {
    notFound();
  }

  if (estimate.status === "sent" && !estimate.customerViewedAt) {
    try {
      await recordPortalViewedEstimate(
        estimateId,
        `/portal/estimates/${estimateId}`
      );
      estimate = await getPortalEstimateReviewData(
        estimateId,
        `/portal/estimates/${estimateId}`
      );
    } catch {
      // Keep the page usable even if the first-view event cannot be captured here.
    }
  }

  if (!estimate) {
    notFound();
  }

  const nextAction = getNextAction(estimate.status, estimate.projectId);
  const lineItemGroups = groupEstimateLineItems(estimate.lineItems);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className={portalHeroPanelClassName}>
          <DetailPageHeader
            eyebrow="Estimate Review"
            title={estimate.title ?? estimate.referenceNumber}
            description="Review the scope, pricing, and notes for this proposal."
            backHref={`/portal/projects/${estimate.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={buildDocumentPrintHref({
                    subjectType: "estimate",
                    subjectId: estimate.id,
                    audience: "portal"
                  })}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                >
                  Print / Save PDF
                </Link>
                <PortalStatusBadge
                  status={estimate.status}
                  className="px-4 py-2 text-sm"
                >
                  {formatStatusLabel(estimate.status)}
                </PortalStatusBadge>
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

          <PortalTrustStrip
            eyebrow="Shared proposal record"
            title="Review scope and price on the live project chain"
            description="This estimate remains tied to the same project record your contractor uses for contract, billing, and downstream work."
            items={[
              {
                label: "Project",
                value: estimate.project?.name ?? "Shared project"
              },
              {
                label: "Status",
                value: formatStatusLabel(estimate.status)
              },
              {
                label: "Total",
                value: formatMoney(estimate.totalAmount)
              }
            ]}
          />

          <div className="mt-8">
            <WorkspaceSummaryBand
              itemClassName={portalSummaryItemClassName}
              labelClassName={portalSummaryLabelClassName}
              items={[
                {
                  key: "purpose",
                  label: "What this page is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Review the shared proposal body, line items, and totals
                      for this project.
                    </p>
                  )
                },
                {
                  key: "total",
                  label: "Total",
                  content: (
                    <>
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {formatMoney(estimate.totalAmount)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Subtotal {formatMoney(estimate.subtotalAmount)} with{" "}
                        {formatMoney(estimate.taxAmount)} tax and{" "}
                        {formatMoney(estimate.discountAmount)} discount
                        adjustments.
                      </p>
                    </>
                  )
                },
                {
                  key: "shared-status",
                  label: "Shared status",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p className="font-semibold capitalize text-slate-950">
                        {formatStatusLabel(estimate.status)}
                      </p>
                      <p>Estimate #{estimate.referenceNumber}</p>
                      <p>
                        Project: {estimate.project?.name ?? "Unknown project"}
                      </p>
                      <p>
                        Sent:{" "}
                        {estimate.sentAt
                          ? formatDateTime(estimate.sentAt)
                          : "Not yet"}
                      </p>
                      <p>
                        Viewed:{" "}
                        {estimate.customerViewedAt
                          ? formatDateTime(estimate.customerViewedAt)
                          : "Not yet"}
                      </p>
                    </div>
                  )
                },
                {
                  key: "next-action",
                  label: "Next step",
                  content: (
                    <NextActionCard
                      title={nextAction.title}
                      description={nextAction.description}
                      primaryAction={
                        <PortalSecondaryLink href={nextAction.href}>
                          {nextAction.label}
                        </PortalSecondaryLink>
                      }
                    />
                  )
                }
              ]}
            />
          </div>
        </div>

        <DetailPanel
          title="Proposal Scope"
          description="This is the shared estimate body for the project, including scope line items and pricing."
        >
          <div className="space-y-6">
            {estimate.lineItems.length > 0 ? (
              <div className="space-y-3">
                {lineItemGroups.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                  >
                    <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-950">
                        {group.label}
                      </p>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatMoney(group.subtotal.toFixed(2))}
                      </p>
                    </div>
                    <div className="mt-3 space-y-3">
                      {group.rows.map((lineItem) => (
                        <div
                          key={lineItem.id}
                          className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                        >
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
                              {Number(lineItem.quantity).toLocaleString(
                                "en-US"
                              )}{" "}
                              {formatUnitLabel(lineItem.unit)} at{" "}
                              {formatMoney(lineItem.unitPrice)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatMoney(lineItem.lineTotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                No estimate line items are currently shared on this proposal.
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-950">
                  Scope of work output
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                  {hasHtmlContent(estimate.content.scopeSummaryHtml) ? (
                    <div className="space-y-4">
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
                  ) : getIncludedEstimateScopeItems(estimate.content).length >
                    0 ? (
                    <ul className="space-y-2 pl-5">
                      {getIncludedEstimateScopeItems(estimate.content).map(
                        (item) => (
                          <li key={item.id}>{item.text}</li>
                        )
                      )}
                    </ul>
                  ) : (
                    "No additional scope output is currently shared."
                  )}
                </div>
                {hasHtmlContent(estimate.content.termsHtml) ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <p className="mb-3 text-sm font-medium text-slate-950">
                      Terms
                    </p>
                    {renderHtmlContent(estimate.content.termsHtml)}
                  </div>
                ) : null}
                {hasHtmlContent(estimate.content.inclusionsHtml) ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <p className="mb-3 text-sm font-medium text-slate-950">
                      Inclusions
                    </p>
                    {renderHtmlContent(estimate.content.inclusionsHtml)}
                  </div>
                ) : null}
                {hasHtmlContent(estimate.content.exclusionsHtml) ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <p className="mb-3 text-sm font-medium text-slate-950">
                      Exclusions
                    </p>
                    {renderHtmlContent(estimate.content.exclusionsHtml)}
                  </div>
                ) : null}
                {hasHtmlContent(estimate.content.notesHtml) ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                    <p className="mb-3 text-sm font-medium text-slate-950">
                      Notes
                    </p>
                    {renderHtmlContent(estimate.content.notesHtml)}
                  </div>
                ) : null}
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                  <p className="mb-3 text-sm font-medium text-slate-950">
                    Files and images
                  </p>
                  {estimate.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {estimate.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-950">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {attachment.caption?.trim() ||
                                attachment.mimeType}
                            </p>
                          </div>
                          {attachment.downloadUrl ? (
                            <Link
                              href={attachment.downloadUrl}
                              target="_blank"
                              className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                            >
                              Open
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Unavailable
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    "No files or images are currently shared with this estimate."
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">
                  Pricing summary
                </p>
                <dl className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Subtotal</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(estimate.subtotalAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Tax</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(estimate.taxAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Discount</dt>
                    <dd className="font-medium text-slate-950">
                      {formatMoney(estimate.discountAmount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                    <dt className="font-semibold text-slate-950">Total</dt>
                    <dd className="font-semibold text-slate-950">
                      {formatMoney(estimate.totalAmount)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <div id="decision-actions" className="scroll-mt-24">
          <DetailPanel
            title="Decision Actions"
            description="Approve, reject, or comment on this same shared estimate record."
          >
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              {estimate.status === "sent" ? (
                <div className={portalActionBoxClassName}>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                    Approval creates the approved commercial snapshot used later
                    for contract and invoice lineage. Do not approve here unless
                    this shared estimate is ready to become the downstream
                    baseline.
                  </div>
                  <form
                    action={customerApproveEstimateAction}
                    className="space-y-3"
                  >
                    <input
                      type="hidden"
                      name="estimateId"
                      value={estimate.id}
                    />
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
                      Approve estimate
                    </button>
                  </form>

                  <form
                    action={customerRejectEstimateAction}
                    className="space-y-3"
                  >
                    <input
                      type="hidden"
                      name="estimateId"
                      value={estimate.id}
                    />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-950">
                        Rejection or revision note
                      </span>
                      <textarea
                        name="decisionNote"
                        rows={3}
                        maxLength={1000}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="Let the contractor know what needs to change."
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2.5 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
                    >
                      Reject or request changes
                    </button>
                  </form>

                  <form
                    action={customerAddEstimateCommentAction}
                    className="space-y-3"
                  >
                    <input
                      type="hidden"
                      name="estimateId"
                      value={estimate.id}
                    />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-950">
                        Add a note
                      </span>
                      <textarea
                        name="comment"
                        rows={3}
                        maxLength={1000}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="Send a note without making a final approval decision yet."
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Save comment
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  {estimate.status === "approved"
                    ? "This estimate is already approved on the shared project chain."
                    : estimate.status === "rejected"
                      ? "This estimate is already marked as needing contractor revision."
                      : "This page remains available for review even when no customer decision is currently open."}
                </div>
              )}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Proposal Context"
          description="Project and estimate details for reference."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: estimate.project ? (
                  <Link
                    href={`/portal/projects/${estimate.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {estimate.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value:
                  estimate.customer?.companyName ??
                  estimate.customer?.name ??
                  "Not provided"
              },
              {
                label: "Status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(estimate.status)}
                  </span>
                )
              },
              {
                label: "Sent",
                value: estimate.sentAt
                  ? formatDateTime(estimate.sentAt)
                  : "Not yet"
              },
              {
                label: "Viewed",
                value: estimate.customerViewedAt
                  ? formatDateTime(estimate.customerViewedAt)
                  : "Not yet"
              },
              {
                label: "Prepared",
                value: formatDateTime(estimate.createdAt)
              },
              {
                label: "Updated",
                value: formatDateTime(estimate.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="What Happens Next"
          description="A simple view of what this estimate can lead to."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Your contractor will guide the next step after review. That may be
              an updated estimate, a contract to sign, or an invoice when
              billing is ready.
            </p>
            <p>
              Use the project link to return to the rest of the shared project
              information.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
