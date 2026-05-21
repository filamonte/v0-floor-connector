import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import {
  PortalSecondaryLink,
  PortalStatusBadge,
  portalActionBoxClassName,
  portalDocumentPanelClassName,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalStatePanelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { sanitizeHtml } from "@/lib/html/sanitize";
import {
  getPortalWarrantyDocumentReviewData,
  recordPortalWarrantyDocumentViewed
} from "@/lib/portal/data";
import {
  customerDeclineWarrantyDocumentAction,
  customerSignWarrantyDocumentAction
} from "@/lib/warranty-documents/actions";

type PortalWarrantyDocumentReviewPageProps = {
  params: Promise<{
    warrantyDocumentId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatStatusLabel(status: string | null) {
  return status ? status.replaceAll("_", " ") : "Not shared yet";
}

function formatDate(value: string | null) {
  return value
    ? new Date(
        value.includes("T") ? value : `${value}T00:00:00`
      ).toLocaleDateString()
    : "Not set";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getWarrantyGuidance(input: {
  currentUserCanSign: boolean;
  currentUserSignerStatus: string | null;
  status: string;
}) {
  if (input.status === "signed") {
    return "This warranty document is signed and remains available for review.";
  }

  if (input.currentUserCanSign) {
    return "Review the warranty terms, then sign or decline this same shared warranty document.";
  }

  if (input.currentUserSignerStatus === "signed") {
    return "Your warranty signature has already been recorded.";
  }

  if (input.currentUserSignerStatus === "declined") {
    return "Your decline has been recorded and your contractor can follow up internally.";
  }

  return "This page is available for warranty review through your shared project access.";
}

export default async function PortalWarrantyDocumentReviewPage({
  params,
  searchParams
}: PortalWarrantyDocumentReviewPageProps) {
  const { warrantyDocumentId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  let warrantyDocument = await getPortalWarrantyDocumentReviewData(
    warrantyDocumentId,
    `/portal/warranty-documents/${warrantyDocumentId}`
  );

  if (!warrantyDocument) {
    notFound();
  }

  if (
    warrantyDocument.currentUserCanSign &&
    (warrantyDocument.currentUserSignerStatus === "pending" ||
      warrantyDocument.currentUserSignerStatus === "requested")
  ) {
    try {
      await recordPortalWarrantyDocumentViewed(
        warrantyDocumentId,
        `/portal/warranty-documents/${warrantyDocumentId}`
      );
      warrantyDocument = await getPortalWarrantyDocumentReviewData(
        warrantyDocumentId,
        `/portal/warranty-documents/${warrantyDocumentId}`
      );
    } catch {
      // Keep review usable if the optional viewed audit event cannot be recorded.
    }
  }

  if (!warrantyDocument) {
    notFound();
  }

  const guidance = getWarrantyGuidance({
    currentUserCanSign: warrantyDocument.currentUserCanSign,
    currentUserSignerStatus: warrantyDocument.currentUserSignerStatus,
    status: warrantyDocument.status
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className={portalHeroPanelClassName}>
          <DetailPageHeader
            eyebrow="Warranty Review"
            title={warrantyDocument.title}
            description="Review the warranty document your contractor shared for this project, then complete your customer signature step when it is assigned to you."
            backHref={`/portal/projects/${warrantyDocument.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <PortalSecondaryLink
                  href={`/portal/warranty-documents/${warrantyDocument.id}/print`}
                >
                  Print / save PDF
                </PortalSecondaryLink>
                <PortalStatusBadge
                  status={warrantyDocument.status}
                  className="px-4 py-2 text-sm"
                >
                  {formatStatusLabel(warrantyDocument.status)}
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

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <section className={portalStatePanelClassName}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Warranty signature state
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <PortalStatusBadge
                      status={warrantyDocument.status}
                      className="px-3.5 py-1.5 text-sm"
                    >
                      {formatStatusLabel(warrantyDocument.status)}
                    </PortalStatusBadge>
                    {warrantyDocument.currentUserSignerStatus ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium capitalize text-slate-600">
                        {formatStatusLabel(
                          warrantyDocument.currentUserSignerStatus
                        )}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {guidance}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Customer signers{" "}
                    {warrantyDocument.signerSummary.signedCustomerSignerCount}/
                    {warrantyDocument.signerSummary.customerSignerCount}{" "}
                    complete.
                  </p>
                  <div
                    className={`${portalInsetPanelClassName} text-sm leading-6 text-slate-600`}
                  >
                    This warranty stays attached to the shared project record.
                    It does not expose internal service ticket notes, billing,
                    time, or crew details.
                  </div>
                </div>
              </section>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2"
                itemClassName="rounded-2xl border border-slate-200/80 bg-slate-50/65 px-4 py-4"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "next-action",
                    label: "Next step",
                    content: (
                      <NextActionCard
                        eyebrow="Customer guidance"
                        title={
                          warrantyDocument.currentUserCanSign
                            ? "Review and complete warranty signature"
                            : "Review the shared warranty"
                        }
                        description={guidance}
                        primaryAction={
                          <PortalSecondaryLink
                            href={`/portal/projects/${warrantyDocument.projectId}`}
                          >
                            Return to project workspace
                          </PortalSecondaryLink>
                        }
                      />
                    )
                  },
                  {
                    key: "warranty-dates",
                    label: "Warranty dates",
                    content: (
                      <p className="text-sm text-slate-600">
                        {formatDate(warrantyDocument.warrantyStartDate)} to{" "}
                        {formatDate(warrantyDocument.warrantyEndDate)}
                      </p>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Warranty Document"
          description="Review the warranty terms before taking a signature action."
        >
          {warrantyDocument.warrantyBasis ? (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
              <p className="text-sm font-medium text-slate-950">
                Warranty basis
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {warrantyDocument.warrantyBasis}
              </p>
            </div>
          ) : null}

          <article
            className={`${portalDocumentPanelClassName} text-sm leading-7 text-slate-700 [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_ul]:list-disc`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(warrantyDocument.renderedContent)
            }}
          />
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Signature Actions"
          description="Customer actions on this warranty document."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>{guidance}</p>

            {warrantyDocument.currentUserCanSign ? (
              <div className={portalActionBoxClassName}>
                <form
                  action={customerSignWarrantyDocumentAction}
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="warrantyDocumentId"
                    value={warrantyDocument.id}
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Sign warranty
                  </button>
                </form>

                <form
                  action={customerDeclineWarrantyDocumentAction}
                  className="space-y-3"
                >
                  <input
                    type="hidden"
                    name="warrantyDocumentId"
                    value={warrantyDocument.id}
                  />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-950">
                      Optional decline note
                    </span>
                    <textarea
                      name="declineReason"
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Share a short note if you need your contractor to follow up."
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2.5 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
                  >
                    Decline warranty
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                {warrantyDocument.currentUserSignerStatus === "signed"
                  ? "Your customer signature has already been recorded on this warranty."
                  : warrantyDocument.currentUserSignerStatus === "declined"
                    ? "Your decline has already been recorded on this warranty."
                    : "This warranty is available for review, but no customer signature action is currently assigned to your portal email."}
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Warranty Context"
          description="Customer-safe project details."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: warrantyDocument.project ? (
                  <Link
                    href={`/portal/projects/${warrantyDocument.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {warrantyDocument.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value:
                  warrantyDocument.customer?.companyName ??
                  warrantyDocument.customer?.name ??
                  "Not provided"
              },
              {
                label: "Warranty start",
                value: formatDate(warrantyDocument.warrantyStartDate)
              },
              {
                label: "Warranty end",
                value: formatDate(warrantyDocument.warrantyEndDate)
              },
              {
                label: "Issued",
                value: formatDate(warrantyDocument.issuedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Signature Activity"
          description="Your customer-facing warranty signature events."
        >
          {warrantyDocument.signatureEvents.length > 0 ? (
            <div className="space-y-3">
              {warrantyDocument.signatureEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  <p className="font-medium capitalize text-slate-950">
                    {formatStatusLabel(event.eventType)}
                  </p>
                  <p>{formatDateTime(event.createdAt)}</p>
                  {event.eventNote ? <p>{event.eventNote}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
              No customer-facing warranty signature events are recorded for your
              signer yet.
            </div>
          )}
        </DetailPanel>
      </aside>
    </div>
  );
}
