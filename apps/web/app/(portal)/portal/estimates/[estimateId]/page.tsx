import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { getPortalEstimateReviewData } from "@/lib/portal/data";

type PortalEstimateReviewPageProps = {
  params: Promise<{
    estimateId: string;
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

function getNextAction(status: string, projectId: string) {
  if (status === "approved") {
    return {
      title: "Proposal approval is complete",
      description:
        "Your contractor can now keep moving the shared workflow forward through contract and billing steps from the same project.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  if (status === "sent") {
    return {
      title: "Review this proposal with your contractor",
      description:
        "This estimate is shared for review. Contract and signature steps can build on this same approved scope later.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  return {
    title: "Review the shared scope",
    description:
      "This page shows the currently shared proposal details for the project, while later approval or signature tooling stays outside this first portal pass.",
    label: "Return to project workspace",
    href: `/portal/projects/${projectId}`
  };
}

export default async function PortalEstimateReviewPage({
  params
}: PortalEstimateReviewPageProps) {
  const { estimateId } = await params;
  const estimate = await getPortalEstimateReviewData(
    estimateId,
    `/portal/estimates/${estimateId}`
  );

  if (!estimate) {
    notFound();
  }

  const nextAction = getNextAction(estimate.status, estimate.projectId);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Estimate Review"
            title={estimate.referenceNumber}
            description="Review the scope, pricing, and shared notes for this proposal. This page stays focused on the customer-facing estimate itself, not contractor-side workflow controls."
            backHref={`/portal/projects/${estimate.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700">
                {formatStatusLabel(estimate.status)}
              </span>
            }
          />

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "purpose",
                  label: "What this page is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Review the shared proposal body, line items, and totals for this project.
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
                        {formatMoney(estimate.discountAmount)} discount adjustments.
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
                      <p>Project: {estimate.project?.name ?? "Unknown project"}</p>
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
                        <Link
                          href={nextAction.href}
                          className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                        >
                          {nextAction.label}
                        </Link>
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
                {estimate.lineItems.map((lineItem) => (
                  <div
                    key={lineItem.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-950">{lineItem.name}</p>
                        {lineItem.description ? (
                          <p className="text-sm leading-6 text-slate-600">
                            {lineItem.description}
                          </p>
                        ) : null}
                        <p className="text-sm text-slate-500">
                          {Number(lineItem.quantity).toLocaleString("en-US")} {lineItem.unit} at{" "}
                          {formatMoney(lineItem.unitPrice)}
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
                No estimate line items are currently shared on this proposal.
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-950">Proposal notes</p>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                  {estimate.notes ?? "No additional proposal notes are currently shared."}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-5">
                <p className="text-sm font-medium text-slate-950">Pricing summary</p>
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
        <DetailPanel
          title="Proposal Context"
          description="Compact record context that keeps the estimate tied to its project without exposing contractor-only controls."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: estimate.project ? (
                  <Link href={`/portal/projects/${estimate.project.id}`} className="font-medium text-brand-700">
                    {estimate.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value: estimate.customer?.companyName ?? estimate.customer?.name ?? "Not provided"
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(estimate.status)}</span>
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
          title="Later workflow hooks"
          description="This page prepares for later portal actions without implementing them yet."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Customer-facing acceptance, signature, and payment actions are intentionally outside
              this first portal foundation.
            </p>
            <p>
              When those actions are added later, they will extend this same canonical estimate to
              project workflow rather than introducing a parallel portal record.
            </p>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
