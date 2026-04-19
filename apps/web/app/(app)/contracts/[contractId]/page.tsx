import Link from "next/link";
import { notFound } from "next/navigation";
import {
  computeContractSignatureWorkflowSummary,
  computeContractWorkflowGate
} from "@floorconnector/domain";

import { ContractStatusActions } from "@/components/contract-status-actions";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getContractById, getContractSignatureActionOptions } from "@/lib/contracts/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

type ContractDetailPageProps = {
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
  if (!value) {
    return "Not yet";
  }

  return new Date(value).toLocaleString();
}

function formatLockReason(reason: string | null) {
  switch (reason) {
    case "signature_activity_started":
      return "Signature activity has started";
    case "voided":
      return "Contract was voided";
    default:
      return reason ? reason.replaceAll("_", " ") : "Editable draft";
  }
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "sent":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "viewed":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "signed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "void":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatSignerRole(role: string) {
  return role === "contractor" ? "Contractor countersigner" : "Customer signer";
}

function formatEventType(eventType: string) {
  switch (eventType) {
    case "signature_requested":
      return "Signature requested";
    case "signer_viewed":
      return "Signer viewed";
    case "signer_signed":
      return "Customer signed";
    case "signer_declined":
      return "Customer declined";
    case "contractor_countersigned":
      return "Contractor countersigned";
    case "signature_completed":
      return "Signature completed";
    case "signature_voided":
      return "Signature voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(eventType);
  }
}

function getSignatureStateMessage(input: {
  status: string;
  summary: ReturnType<typeof computeContractSignatureWorkflowSummary>;
}) {
  if (input.status === "draft") {
    return "Draft review is still active. Send the contract when signer routing is ready.";
  }

  if (input.summary.isVoided) {
    return "This signature flow was voided. The contract remains locked for historical continuity.";
  }

  if (input.summary.isDeclined) {
    return "A signer declined the contract. Review the signer timeline and decide whether the draft needs revision.";
  }

  if (input.summary.allRequiredSignersSigned) {
    return input.summary.requiresCountersign
      ? "Customer signature and contractor countersign are complete on the canonical contract."
      : "Customer signature is complete on the canonical contract.";
  }

  if (input.summary.requiresCountersign && input.summary.allCustomerSignersSigned) {
    return "Customer signature is complete. Contractor countersign is the remaining step.";
  }

  if (input.summary.anyCustomerInteraction) {
    return "Signature collection is in progress and the customer has already interacted with the contract.";
  }

  return "This contract is out for signature and waiting on the assigned customer signer.";
}

function getContractNextAction(input: {
  contractId: string;
  projectId: string;
  estimateId: string | null;
  status: string;
  canSend: boolean;
  internalApprovalStatus: string;
  isLocked: boolean;
  depositRequired: boolean;
  depositSatisfied: boolean;
}) {
  if (input.status === "signed") {
    if (input.depositRequired && !input.depositSatisfied) {
      return {
        title: "Collect the deposit",
        description:
          "The contract is signed, and the deposit is the active financial handoff before the project can move fully downstream.",
        href: `/invoices?projectId=${input.projectId}&estimateId=${input.estimateId ?? ""}&workflowRole=deposit`,
        label: "Create deposit invoice"
      };
    }

    return {
      title: "Use the project readiness hub",
      description:
        "Signature is complete. Use the project hub to clear the remaining financial and readiness gates in order.",
      href: `/projects/${input.projectId}`,
      label: "Open project readiness hub"
    };
  }

  if (input.isLocked) {
    return {
      title: "Review signature lock state",
      description:
        "This contract is already locked by signature activity or another edit lock, so the focus should stay on current workflow state rather than draft edits.",
      href: `/projects/${input.projectId}`,
      label: "Open project readiness hub"
    };
  }

  if (input.canSend) {
    return {
      title: "Send the contract",
      description:
        "Draft review is complete and the contract is ready to move into signature collection.",
      href: `/contracts/${input.contractId}`,
      label: "Review workflow actions"
    };
  }

  if (input.internalApprovalStatus === "rejected") {
    return {
      title: "Revise and re-approve the draft",
      description:
        "Internal review marked this draft for revision, so the next step is updating the contract and bringing it back through approval.",
      href: `/contracts/${input.contractId}`,
      label: "Review workflow actions"
    };
  }

  return {
    title: "Complete internal approval",
    description:
      "Internal approval is still the active gate before this contract can move into send and signature workflow.",
    href: `/contracts/${input.contractId}`,
    label: "Review workflow actions"
  };
}

export default async function ContractDetailPage({
  params,
  searchParams
}: ContractDetailPageProps) {
  const { contractId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/contracts/${contractId}`);
  const [contract, organizationContext, jobs, invoices, signatureActionOptions] = await Promise.all([
    getContractById(contractId, `/contracts/${contractId}`),
    getActiveOrganizationContext(user.id),
    listJobs(),
    listInvoices(),
    getContractSignatureActionOptions(contractId, `/contracts/${contractId}`)
  ]);

  if (!contract) {
    notFound();
  }

  const workflowSettings = await getOrganizationWorkflowSettings(contract.organizationId);
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: contract.organizationId,
    projectId: contract.projectId
  });
  const contractGate = computeContractWorkflowGate({
    status: contract.status,
    internalApprovalStatus: contract.internalApprovalStatus,
    requireContractInternalApproval: workflowSettings.requireContractInternalApproval,
    signatureStartedAt: contract.signatureStartedAt,
    lockedAt: contract.lockedAt
  });
  const signatureSummary = computeContractSignatureWorkflowSummary({
    status: contract.status,
    signatureReadinessStatus: contract.signatureReadinessStatus,
    signatureStartedAt: contract.signatureStartedAt,
    customerSignedAt: contract.customerSignedAt,
    contractorCountersignedAt: contract.contractorCountersignedAt,
    signatureDeclinedAt: contract.signatureDeclinedAt,
    signatureVoidedAt: contract.signatureVoidedAt,
    signers: contract.signers.map((signer) => ({
      signerRole: signer.signerRole,
      signerStatus: signer.signerStatus
    }))
  });

  const relatedJobs = jobs.filter((job) => job.projectId === contract.projectId);
  const relatedInvoices = invoices.filter((invoice) => invoice.projectId === contract.projectId);
  const sendReadinessMessage = contractGate.canSend
    ? "This contract is ready to send."
    : contractGate.sendBlockers.includes("internal_approval_pending")
      ? "Internal approval is still pending, so send is blocked."
      : contractGate.sendBlockers.includes("internal_approval_rejected")
        ? "This contract is marked as needing revision. Update the draft and re-approve it before send."
        : contractGate.sendBlockers.includes("contract_locked")
          ? "Signature activity or an existing lock prevents this contract from returning to send-ready draft state."
          : "This contract is not ready to send.";
  const financialReadinessLabel = formatStatusLabel(readinessSnapshot?.status ?? "not_started");
  const financialBlockersLabel =
    readinessSnapshot && readinessSnapshot.blockers.length > 0
      ? readinessSnapshot.blockers.map((blocker) => blocker.replaceAll("_", " ")).join(", ")
      : "Financial readiness is currently satisfied.";
  const nextAction = getContractNextAction({
    contractId: contract.id,
    projectId: contract.projectId,
    estimateId: contract.estimateId,
    status: contract.status,
    canSend: contractGate.canSend,
    internalApprovalStatus: contract.internalApprovalStatus,
    isLocked: contractGate.isLocked,
    depositRequired: readinessSnapshot?.depositRequired ?? false,
    depositSatisfied: readinessSnapshot?.depositSatisfied ?? false
  });
  const currentContractorSigner = contract.signers.find(
    (signer) => signer.signerRole === "contractor" && signer.organizationUserId === user.id
  );
  const canCountersign =
    signatureSummary.canContractorCountersign &&
    !!currentContractorSigner &&
    (currentContractorSigner.signerStatus === "pending" ||
      currentContractorSigner.signerStatus === "viewed");
  const countersignMessage = canCountersign
    ? "Customer signature is complete and you are the assigned contractor countersigner for this contract."
    : currentContractorSigner
      ? currentContractorSigner.signerStatus === "signed"
        ? "Your contractor countersignature is already complete."
        : signatureSummary.requiresCountersign
          ? "This contract includes contractor countersign, but customer signature must complete before your step opens."
          : ""
      : signatureSummary.requiresCountersign
        ? "This contract requires contractor countersign from the assigned signer once customer signature is complete."
        : "";
  const signatureStateMessage = getSignatureStateMessage({
    status: contract.status,
    summary: signatureSummary
  });
  const sortedSigners = [...contract.signers].sort((left, right) => {
    if (left.signerOrder !== right.signerOrder) {
      return left.signerOrder - right.signerOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
  const recentSignatureEvents = [...contract.signatureEvents]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10 print:hidden">
        <DetailPageHeader
          eyebrow="Contract Review"
          title={contract.title}
          description="Review the generated contract in project context, with the connected estimate, jobs, and invoices visible alongside the document itself."
          backHref="/contracts"
          backLabel="Back to contracts"
          actions={
            <>
              {contract.isEditable ? (
                <Link
                  href={`/contracts/${contract.id}/edit`}
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Edit draft
                </Link>
              ) : null}
              {contract.estimate ? (
                <Link
                  href={`/estimates/${contract.estimate.id}`}
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  View source estimate
                </Link>
              ) : null}
              <Link
                href={`/projects/${contract.projectId}`}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Open project readiness hub
              </Link>
              {contract.status === "signed" ? (
                <Link
                  href={
                    readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied
                      ? `/invoices?projectId=${contract.projectId}&estimateId=${contract.estimateId ?? ""}&workflowRole=deposit`
                      : `/projects/${contract.projectId}`
                  }
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  {readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied
                    ? "Create deposit invoice"
                    : "Open project readiness hub"}
                </Link>
              ) : null}
            </>
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

        <div className="mt-8 print:hidden">
          <WorkspaceSummaryBand
            className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1fr)]"
            items={[
              {
                key: "review-purpose",
                label: "Review purpose",
                content: (
                  <div className="space-y-2 text-sm leading-6 text-slate-600">
                    <p className="text-base font-semibold text-slate-950 capitalize">
                      {formatStatusLabel(contract.status)} contract
                    </p>
                    <p>
                      Use this page to review the contract body and drive approval, send, and
                      signature progress without losing sight of the connected project handoff.
                    </p>
                  </div>
                )
              },
              {
                key: "next-action",
                label: "Preferred next action",
                content: (
                  <NextActionCard
                    eyebrow="Workflow guidance"
                    title={nextAction.title}
                    description={nextAction.description}
                    primaryAction={
                      <Link
                        href={nextAction.href}
                        className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                      >
                        {nextAction.label}
                      </Link>
                    }
                  />
                )
              },
              {
                key: "approval-send",
                label: "Approval and signature flow",
                content: (
                  <ContextFactsList
                    items={[
                      {
                        label: "Internal approval",
                        value: <span className="capitalize">{formatStatusLabel(contract.internalApprovalStatus)}</span>
                      },
                      {
                        label: "Signature readiness",
                        value: <span className="capitalize">{formatStatusLabel(contract.signatureReadinessStatus)}</span>
                      },
                      {
                        label: "Customer signers",
                        value:
                          signatureSummary.customerSignerCount > 0
                            ? `${signatureSummary.signedCustomerSignerCount}/${signatureSummary.customerSignerCount} signed`
                            : "Not routed yet"
                      },
                      {
                        label: "Contractor countersign",
                        value: signatureSummary.requiresCountersign
                          ? signatureSummary.signedContractorSignerCount > 0
                            ? "Complete"
                            : "Required"
                          : "Not required"
                      },
                      {
                        label: "Current flow",
                        value:
                          contract.status === "draft"
                            ? sendReadinessMessage
                            : signatureStateMessage
                      }
                    ]}
                  />
                )
              },
              {
                key: "financial-context",
                label: "Financial readiness context",
                content: (
                  <ContextFactsList
                    items={[
                      {
                        label: "Project readiness",
                        value: <span className="capitalize">{financialReadinessLabel}</span>
                      },
                      {
                        label: "Deposit",
                        value: readinessSnapshot?.depositRequired
                          ? readinessSnapshot.depositSatisfied
                            ? "Satisfied"
                            : "Required"
                          : "Not required"
                      },
                      {
                        label: "Financing",
                        value: (
                          <span className="capitalize">
                            {formatStatusLabel(readinessSnapshot?.financingStatus ?? "not_applicable")}
                          </span>
                        )
                      },
                      {
                        label: "Commercial blockers",
                        value: financialBlockersLabel
                      }
                    ]}
                  />
                )
              }
            ]}
          />
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10 print:rounded-none print:border-none print:px-0 print:py-0 print:shadow-none">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Prepared by
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              {organizationContext?.organization.displayName ?? "FloorConnector"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {organizationContext?.organization.legalName ??
                "Contract prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Contract Status
            </p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${getStatusBadgeClassName(
                contract.status
              )}`}
            >
              {formatStatusLabel(contract.status)}
            </div>
            {contract.renderedSubject ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">{contract.renderedSubject}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-3">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Customer</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.customer?.name ?? "Unknown customer"}</p>
              {contract.customer?.companyName ? <p>{contract.customer.companyName}</p> : null}
              {contract.customer?.email ? <p>{contract.customer.email}</p> : null}
              {contract.customer?.phone ? <p>{contract.customer.phone}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Project</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.project?.name ?? "Unknown project"}</p>
              {contract.project ? <p className="capitalize">Current status: {formatStatusLabel(contract.project.status)}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Estimate Source</p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">{contract.generatedFromEstimateReference ?? contract.estimate?.referenceNumber ?? "No linked estimate"}</p>
              {contract.estimate ? <p className="capitalize">Estimate status: {formatStatusLabel(contract.estimate.status)}</p> : null}
              {contract.template?.name ? <p>Template: {contract.template.name}</p> : null}
            </div>
          </section>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="print:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Contract body
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Review the generated agreement itself here. Approval, signature, and financial
                context stay above and to the side so the document remains the main workspace.
              </p>
            </div>

            <article className="rounded-3xl border border-slate-200 bg-slate-50/50 px-6 py-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {contract.renderedContent}
            </article>
          </div>

          <aside className="space-y-6 print:hidden">
            <DetailPanel
              title="Workflow Actions"
              description="Move the contract through the review and signature lifecycle while keeping the connected project context visible."
            >
              <ContractStatusActions
                contractId={contract.id}
                currentStatus={contract.status}
                currentInternalApprovalStatus={contract.internalApprovalStatus}
                requireContractInternalApproval={
                  workflowSettings.requireContractInternalApproval
                }
                canSend={contractGate.canSend}
                sendReadinessMessage={sendReadinessMessage}
                isLocked={contractGate.isLocked}
                customerPortalSignerOptions={
                  signatureActionOptions?.customerPortalSignerOptions ?? []
                }
                contractorSignerOptions={
                  signatureActionOptions?.contractorSignerOptions ?? []
                }
                canCountersign={canCountersign}
                countersignMessage={countersignMessage}
              />
            </DetailPanel>

            <DetailPanel
              title="Signature State"
              description="Review the canonical signature lifecycle, assigned signers, and the latest immutable signature events without leaving the contract workspace."
            >
              <div className="space-y-5 text-sm leading-6 text-slate-600">
                <ContextFactsList
                  items={[
                    {
                      label: "Signature flow",
                      value: signatureStateMessage
                    },
                    {
                      label: "Sent",
                      value: formatDateTime(contract.sentAt)
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
                      label: "Declined",
                      value: formatDateTime(contract.signatureDeclinedAt)
                    },
                    {
                      label: "Voided",
                      value: formatDateTime(contract.signatureVoidedAt)
                    }
                  ]}
                />

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Signer routing
                  </p>
                  {sortedSigners.length > 0 ? (
                    sortedSigners.map((signer) => (
                      <div
                        key={signer.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-950">{signer.displayName}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {formatSignerRole(signer.signerRole)}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                            {formatStatusLabel(signer.signerStatus)}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1 text-xs leading-5 text-slate-500">
                          <p>Order {signer.signerOrder}</p>
                          <p>{signer.email}</p>
                          {signer.viewedAt ? <p>Viewed {formatDateTime(signer.viewedAt)}</p> : null}
                          {signer.signedAt ? <p>Signed {formatDateTime(signer.signedAt)}</p> : null}
                          {signer.declinedAt ? (
                            <p>Declined {formatDateTime(signer.declinedAt)}</p>
                          ) : null}
                          {signer.declineReason ? <p>Reason: {signer.declineReason}</p> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                      No signer routing has been created yet. Send the contract when the customer
                      portal signer is ready.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Recent signature events
                  </p>
                  {recentSignatureEvents.length > 0 ? (
                    recentSignatureEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <p className="font-medium text-slate-950">
                          {formatEventType(event.eventType)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {formatStatusLabel(event.actorType)}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {formatDateTime(event.occurredAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                      No signature events have been recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </DetailPanel>

            <DetailPanel title="Connected Records">
              <p className="mb-4 text-sm leading-6 text-slate-500">
                Review connected records here, then return to the project hub for the authoritative
                readiness state and next gate.
              </p>
              <div className="grid gap-4">
                {contract.project ? (
                  <LinkedRecordCard
                    href={`/projects/${contract.project.id}`}
                    title={contract.project.name}
                    subtitle="Project"
                    meta={contract.customer?.name ?? "Unknown customer"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(contract.project.status)}
                      </span>
                    }
                  />
                ) : null}
                {contract.estimate ? (
                  <LinkedRecordCard
                    href={`/estimates/${contract.estimate.id}`}
                    title={contract.estimate.referenceNumber}
                    subtitle="Estimate"
                    meta={contract.template?.name ?? "Shared template"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(contract.estimate.status)}
                      </span>
                    }
                  />
                ) : null}
                {relatedJobs.map((job) => (
                  <LinkedRecordCard
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    title={job.project?.name ?? "Job"}
                    subtitle="Job"
                    meta={job.scheduledDate ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}` : "Unscheduled"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(job.status)}
                      </span>
                    }
                  />
                ))}
                {relatedInvoices.map((invoice) => (
                  <LinkedRecordCard
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    title={invoice.referenceNumber}
                    subtitle="Invoice"
                    meta={`Balance due ${formatMoney(invoice.balanceDueAmount)}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(invoice.status)}
                      </span>
                    }
                  />
                ))}
                {relatedJobs.length === 0 && relatedInvoices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No jobs or invoices are connected to this contract's project yet.
                  </p>
                ) : null}
              </div>
            </DetailPanel>

            <DetailPanel title="Editability">
              <div className="space-y-5 text-sm leading-6 text-slate-600">
                <ContextFactsList
                  items={[
                    {
                      label: "Editable",
                      value: contract.isEditable ? "Yes" : "No"
                    },
                    {
                      label: "Signature provider",
                      value: contract.signatureProvider ?? "Not connected"
                    },
                    {
                      label: "Signature started",
                      value: formatDateTime(contract.signatureStartedAt)
                    },
                    {
                      label: "Locked",
                      value: formatDateTime(contract.lockedAt)
                    },
                    {
                      label: "Lock reason",
                      value: formatLockReason(contract.editLockReason)
                    },
                    {
                      label: "Internal approved at",
                      value: contract.internalApprovedAt
                        ? formatDateTime(contract.internalApprovedAt)
                        : "Not yet"
                    }
                  ]}
                />
                {contract.isEditable ? (
                  <>
                    <p>This contract is still editable because it remains in draft and no signature activity has started.</p>
                    <p>Use the draft edit flow for practical pre-sign customizations. If internal approval is required, saving draft changes resets send readiness back to pending review.</p>
                  </>
                ) : (
                  <>
                    <p>This contract is locked from further unrestricted edits.</p>
                    <p>{formatLockReason(contract.editLockReason)}.</p>
                  </>
                )}
              </div>
            </DetailPanel>

            <DetailPanel title="Revision History">
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {contract.revisions.length > 0 ? (
                  contract.revisions.map((revision) => (
                    <div key={revision.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="font-medium text-slate-950">Revision {revision.revisionNumber}</p>
                      <p>{formatDateTime(revision.createdAt)}</p>
                      {revision.editSummary ? <p>{revision.editSummary}</p> : <p>Draft snapshot before edit</p>}
                    </div>
                  ))
                ) : (
                  <p>No draft revisions have been saved yet.</p>
                )}
              </div>
            </DetailPanel>
          </aside>
        </div>
      </section>
    </div>
  );
}
