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
  portalDocumentPanelClassName,
  portalHeroPanelClassName,
  portalInsetPanelClassName,
  portalStatePanelClassName,
  portalSummaryItemClassName,
  portalSummaryLabelClassName
} from "@/components/portal-review-ui";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { buildDocumentPrintHref } from "@/lib/document-engine/print";
import {
  customerDeclineContractAction,
  customerSignContractAction
} from "@/lib/contracts/actions";
import { recordCustomerViewedContract } from "@/lib/contracts/data";
import { sanitizeHtml } from "@/lib/html/sanitize";
import { getPortalContractReviewData } from "@/lib/portal/data";

type PortalContractReviewPageProps = {
  params: Promise<{
    contractId: string;
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

function formatSignerRole(role: string) {
  return role === "contractor" ? "Contractor countersigner" : "Customer signer";
}

function getNextAction(status: string, projectId: string) {
  if (status === "signed") {
    return {
      title: "Contract signing is complete",
      description:
        "The contract is signed. Return to the project page for the broader project context.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  if (status === "sent" || status === "viewed") {
    return {
      title: "Review the contract and complete signature",
      description:
        "This contract is already out for signature. Review the agreement, then use the shared signature action if it is assigned to you.",
      label: "Go to signature actions",
      href: "#signature-actions"
    };
  }

  return {
    title: "Review the shared agreement",
    description: "This page shows the contract and current signature state.",
    label: "Return to project workspace",
    href: `/portal/projects/${projectId}`
  };
}

function getSignatureGuidance(input: {
  currentUserCanSign: boolean;
  currentUserSignerStatus: string | null;
  isCompleted: boolean;
  isDeclined: boolean;
  isVoided: boolean;
  requiresCountersign: boolean;
  allCustomerSignersSigned: boolean;
}) {
  if (input.isCompleted) {
    return "This shared contract is fully signed.";
  }

  if (input.isVoided) {
    return "This signature flow was voided by the contractor.";
  }

  if (input.isDeclined) {
    return "A customer decline has been recorded on this shared contract.";
  }

  if (input.currentUserCanSign) {
    return "Review the agreement, then sign or decline this same shared contract record.";
  }

  if (input.currentUserSignerStatus === "signed") {
    return input.requiresCountersign
      ? "Your signature is complete. The contractor countersigner is the remaining step."
      : "Your signature is complete on this shared contract.";
  }

  if (input.allCustomerSignersSigned && input.requiresCountersign) {
    return "Customer signing is complete. The contractor countersigner is up next.";
  }

  return "This page stays review-first and reflects the current shared contract signature state.";
}

export default async function PortalContractReviewPage({
  params,
  searchParams
}: PortalContractReviewPageProps) {
  const { contractId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  let contract = await getPortalContractReviewData(
    contractId,
    `/portal/contracts/${contractId}`
  );

  if (!contract) {
    notFound();
  }

  if (
    contract.currentUserCanSign &&
    contract.currentUserSignerStatus === "pending"
  ) {
    try {
      await recordCustomerViewedContract(
        contractId,
        `/portal/contracts/${contractId}`
      );
      contract = await getPortalContractReviewData(
        contractId,
        `/portal/contracts/${contractId}`
      );
    } catch {
      // Leave the review page usable even if the viewed transition cannot be recorded here.
    }
  }

  if (!contract) {
    notFound();
  }

  const nextAction = getNextAction(contract.status, contract.projectId);
  const signatureGuidance = getSignatureGuidance({
    currentUserCanSign: contract.currentUserCanSign,
    currentUserSignerStatus: contract.currentUserSignerStatus,
    isCompleted: contract.signatureSummary.isCompleted,
    isDeclined: contract.signatureSummary.isDeclined,
    isVoided: contract.signatureSummary.isVoided,
    requiresCountersign: contract.signatureSummary.requiresCountersign,
    allCustomerSignersSigned: contract.signatureSummary.allCustomerSignersSigned
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-10">
        <div className={portalHeroPanelClassName}>
          <DetailPageHeader
            eyebrow="Contract Review"
            title={contract.title}
            description="Review the agreement, confirm the current signature state, and complete the next customer step on this same shared contract."
            backHref={`/portal/projects/${contract.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <PortalSecondaryLink
                  href={buildDocumentPrintHref({
                    subjectType: "contract",
                    subjectId: contract.id,
                    audience: "portal"
                  })}
                >
                  Print / Save PDF
                </PortalSecondaryLink>
                <PortalStatusBadge
                  status={contract.status}
                  className="px-4 py-2 text-sm"
                >
                  {formatStatusLabel(contract.status)}
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
            eyebrow="Shared signature record"
            title="Review and sign the live project contract"
            description="Customer signature activity stays attached to this contract, its source estimate, and the shared project workspace."
            items={[
              {
                label: "Project",
                value: contract.project?.name ?? "Shared project"
              },
              {
                label: "Status",
                value: formatStatusLabel(contract.status)
              },
              {
                label: "Signers",
                value: `${contract.signatureSummary.signedCustomerSignerCount}/${contract.signatureSummary.customerSignerCount || 0} customers`
              }
            ]}
          />

          <div className="mt-10 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <section className={portalStatePanelClassName}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                  Signature state
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <PortalStatusBadge
                      status={contract.status}
                      className="px-3.5 py-1.5 text-sm"
                    >
                      {formatStatusLabel(contract.status)}
                    </PortalStatusBadge>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600">
                      {contract.project?.name ?? "Shared project"}
                    </span>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {signatureGuidance}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Customer signers{" "}
                    {contract.signatureSummary.signedCustomerSignerCount}/
                    {contract.signatureSummary.customerSignerCount || 0}{" "}
                    complete
                    {" | "}
                    Contractor countersign{" "}
                    {contract.signatureSummary.requiresCountersign
                      ? contract.signatureSummary.signedContractorSignerCount >
                        0
                        ? "complete"
                        : "still required"
                      : "not required"}
                  </p>
                  <div
                    className={`${portalInsetPanelClassName} text-sm leading-6 text-slate-600`}
                  >
                    This contract stays attached to the same project your
                    contractor sees.
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
                    label: "Next step",
                    content: (
                      <NextActionCard
                        eyebrow="Customer guidance"
                        title={nextAction.title}
                        description={
                          contract.currentUserCanSign
                            ? "Review the agreement, then sign or decline this same shared contract record."
                            : nextAction.description
                        }
                        primaryAction={
                          <PortalSecondaryLink href={nextAction.href}>
                            {nextAction.label}
                          </PortalSecondaryLink>
                        }
                      />
                    )
                  },
                  {
                    key: "project-context",
                    label: "Project context",
                    content: (
                      <p className="text-sm text-slate-600">
                        {contract.customer?.companyName ??
                          contract.customer?.name ??
                          "Customer"}{" "}
                        on {contract.project?.name ?? "the shared project"}.
                      </p>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Agreement Body"
          description="Review the agreement first. Signature actions remain available to the side when you are ready."
        >
          <div className="space-y-5">
            {contract.renderedSubject ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                <p className="text-sm font-medium text-slate-950">Subject</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {contract.renderedSubject}
                </p>
              </div>
            ) : null}

            <article
              className={`${portalDocumentPanelClassName} text-sm leading-7 text-slate-700 [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_ul]:list-disc`}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(contract.renderedContent)
              }}
            />
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <div id="signature-actions" className="scroll-mt-24">
          <DetailPanel
            title="Signature Actions"
            description="Customer actions on this shared contract record."
          >
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              <p className="max-w-[34ch]">{signatureGuidance}</p>

              {contract.currentUserCanSign ? (
                <div className={portalActionBoxClassName}>
                  <form
                    action={customerSignContractAction}
                    className="space-y-3"
                  >
                    <input
                      type="hidden"
                      name="contractId"
                      value={contract.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
                    >
                      Sign contract
                    </button>
                  </form>

                  <form
                    action={customerDeclineContractAction}
                    className="space-y-3"
                  >
                    <input
                      type="hidden"
                      name="contractId"
                      value={contract.id}
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
                        placeholder="Share a short note if you need the contractor to revisit the agreement."
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full border border-rose-300 bg-white px-4 py-2.5 text-sm font-medium text-rose-900 transition hover:border-rose-400 hover:bg-rose-50"
                    >
                      Decline contract
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  {contract.currentUserSignerStatus === "signed"
                    ? "Your customer signature has already been recorded on this contract."
                    : contract.currentUserSignerStatus === "declined"
                      ? "A decline was already recorded from your signer assignment on this contract."
                      : contract.signatureSummary.requiresCountersign &&
                          contract.signatureSummary.allCustomerSignersSigned
                        ? "Customer signing is complete. The contractor countersigner is the remaining step."
                        : "This page remains available for review even when no customer signature action is currently open to you."}
                </div>
              )}
            </div>
          </DetailPanel>
        </div>

        <DetailPanel
          title="Contract Context"
          description="Project and contract details for reference."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: contract.project ? (
                  <Link
                    href={`/portal/projects/${contract.project.id}`}
                    className="font-medium text-brand-700"
                  >
                    {contract.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value:
                  contract.customer?.companyName ??
                  contract.customer?.name ??
                  "Not provided"
              },
              {
                label: "Source estimate",
                value: contract.estimate ? (
                  <Link
                    href={`/portal/estimates/${contract.estimate.id}`}
                    className="font-medium text-brand-700"
                  >
                    {contract.estimate.referenceNumber}
                  </Link>
                ) : (
                  "No linked estimate"
                )
              },
              {
                label: "Customer viewed",
                value: formatDateTime(contract.customerViewedAt)
              },
              {
                label: "Customer signed",
                value: formatDateTime(contract.customerSignedAt)
              },
              {
                label: "Contractor countersigned",
                value: formatDateTime(contract.contractorCountersignedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Signer Visibility"
          description="Minimal shared signer routing for understanding the current signature state."
        >
          <div className="space-y-3">
            {contract.signers.length > 0 ? (
              contract.signers.map((signer) => (
                <div
                  key={signer.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">
                        {signer.displayName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {formatSignerRole(signer.signerRole)}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {formatStatusLabel(signer.signerStatus)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
                    <p>{signer.email}</p>
                    {signer.viewedAt ? (
                      <p>Viewed {formatDateTime(signer.viewedAt)}</p>
                    ) : null}
                    {signer.signedAt ? (
                      <p>Signed {formatDateTime(signer.signedAt)}</p>
                    ) : null}
                    {signer.declinedAt ? (
                      <p>Declined {formatDateTime(signer.declinedAt)}</p>
                    ) : null}
                    {signer.declineReason ? (
                      <p>Note: {signer.declineReason}</p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                Signer routing has not been created yet.
              </div>
            )}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
