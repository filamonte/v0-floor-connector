import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  customerDeclineContractAction,
  customerSignContractAction
} from "@/lib/contracts/actions";
import { recordCustomerViewedContract } from "@/lib/contracts/data";
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
        "The shared contract record is signed. Return to the project workspace for the broader customer-facing commercial context.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  if (status === "sent" || status === "viewed") {
    return {
      title: "Review the contract and complete signature",
      description:
        "This contract is already out for signature. Review the agreement, then use the shared signature action if it is assigned to you.",
      label: "Return to project workspace",
      href: `/portal/projects/${projectId}`
    };
  }

  return {
    title: "Review the shared agreement",
    description:
      "This page exposes the contract body and current shared state without contractor-side editing or internal approval controls.",
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

  if (contract.currentUserCanSign && contract.currentUserSignerStatus === "pending") {
    try {
      await recordCustomerViewedContract(contractId, `/portal/contracts/${contractId}`);
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
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Contract Review"
            title={contract.title}
            description="Review the shared agreement body, project context, and signature state for this project. This page stays customer-safe and intentionally avoids contractor-only controls."
            backHref={`/portal/projects/${contract.projectId}`}
            backLabel="Back to project workspace"
            actions={
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700">
                {formatStatusLabel(contract.status)}
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

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "purpose",
                  label: "What this page is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Review the customer-facing agreement itself and understand where it sits in
                      the shared commercial chain.
                    </p>
                  )
                },
                {
                  key: "signature-state",
                  label: "Signature state",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p className="font-semibold capitalize text-slate-950">
                        {formatStatusLabel(contract.status)}
                      </p>
                      <p>{signatureGuidance}</p>
                      <p>
                        Customer signers {contract.signatureSummary.signedCustomerSignerCount}/
                        {contract.signatureSummary.customerSignerCount || 0} complete
                      </p>
                      <p>
                        Contractor countersign{" "}
                        {contract.signatureSummary.requiresCountersign
                          ? contract.signatureSummary.signedContractorSignerCount > 0
                            ? "complete"
                            : "still required"
                          : "not required"}
                      </p>
                    </div>
                  )
                },
                {
                  key: "project-context",
                  label: "Project context",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p>{contract.project?.name ?? "Unknown project"}</p>
                      <p>
                        Customer:{" "}
                        {contract.customer?.companyName ??
                          contract.customer?.name ??
                          "Not provided"}
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
                      description={
                        contract.currentUserCanSign
                          ? "You can sign or decline this contract here. The action updates the same shared contract record the contractor sees."
                          : nextAction.description
                      }
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
          title="Agreement Body"
          description="This is the shared contract content currently visible to the customer."
        >
          <div className="space-y-5">
            {contract.renderedSubject ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                <p className="text-sm font-medium text-slate-950">Subject</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{contract.renderedSubject}</p>
              </div>
            ) : null}

            <article className="rounded-3xl border border-slate-200 bg-slate-50/50 px-6 py-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {contract.renderedContent}
            </article>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Contract Context"
          description="Compact shared record context without internal contractor workflow detail."
        >
          <ContextFactsList
            items={[
              {
                label: "Project",
                value: contract.project ? (
                  <Link href={`/portal/projects/${contract.project.id}`} className="font-medium text-brand-700">
                    {contract.project.name}
                  </Link>
                ) : (
                  "Unknown project"
                )
              },
              {
                label: "Customer",
                value: contract.customer?.companyName ?? contract.customer?.name ?? "Not provided"
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
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(contract.status)}</span>
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
              },
              {
                label: "Created",
                value: formatDateTime(contract.createdAt)
              },
              {
                label: "Updated",
                value: formatDateTime(contract.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Signature Actions"
          description="Review-first customer actions on this same shared contract record."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <p>{signatureGuidance}</p>

            {contract.currentUserCanSign ? (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                <form action={customerSignContractAction} className="space-y-3">
                  <input type="hidden" name="contractId" value={contract.id} />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Sign contract
                  </button>
                </form>

                <form action={customerDeclineContractAction} className="space-y-3">
                  <input type="hidden" name="contractId" value={contract.id} />
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
                      ? "Customer signing is complete. The contractor countersigner is the remaining shared workflow step."
                      : "This page remains available for review even when no customer signature action is currently open to you."}
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Signer Visibility"
          description="Minimal shared signer routing so the contract status is understandable without exposing contractor-only operations."
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
                      <p className="font-medium text-slate-950">{signer.displayName}</p>
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
                    {signer.viewedAt ? <p>Viewed {formatDateTime(signer.viewedAt)}</p> : null}
                    {signer.signedAt ? <p>Signed {formatDateTime(signer.signedAt)}</p> : null}
                    {signer.declinedAt ? <p>Declined {formatDateTime(signer.declinedAt)}</p> : null}
                    {signer.declineReason ? <p>Note: {signer.declineReason}</p> : null}
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
