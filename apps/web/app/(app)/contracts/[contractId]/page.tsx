import Link from "next/link";
import { notFound } from "next/navigation";
import {
  computeContractSignatureWorkflowSummary,
  computeContractWorkflowGate
} from "@floorconnector/domain";
import { sanitizeHtml } from "@/lib/html/sanitize";

import { ContractStatusActions } from "@/components/contract-status-actions";
import { OnsiteSignatureModal } from "@/components/contracts/onsite-signature-modal";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { getContractById, getContractSignatureActionOptions } from "@/lib/contracts/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";

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
      return "border-[#d6d6d6] bg-[#f8f8f8] text-[#2a2a2a]";
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

function getContractMeaning(status: string) {
  if (status === "draft") {
    return "This agreement is still a draft commercial record. Review the scope and signer routing here, then move it into approval and send in the right order.";
  }

  if (status === "signed") {
    return "This agreement is now part of the signed commercial chain. Use the project readiness hub for deposit, financial, and downstream operational handoff.";
  }

  if (status === "void") {
    return "This agreement is preserved for historical continuity, but active commercial follow-through should happen from the current project and contract chain.";
  }

  return "This agreement is in signature workflow. Review the document here first, then use signer state and workflow actions to move it forward.";
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

function buildProjectScheduleHref(projectId: string) {
  return buildScheduleHref({ projectId });
}

export default async function ContractDetailPage({
  params,
  searchParams
}: ContractDetailPageProps) {
  const { contractId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/contracts/${contractId}`);
  const [contract, organizationContext, jobs, invoices, signatureActionOptions, communicationThreads] =
    await Promise.all([
      getContractById(contractId, `/contracts/${contractId}`),
      getActiveOrganizationContext(user.id),
      listJobs(),
      listInvoices(),
      getContractSignatureActionOptions(contractId, `/contracts/${contractId}`),
      listCommunicationThreadsForSubject("contract", contractId)
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
  const relatedJobAssignments = await listJobAssignmentsByJobIds(
    relatedJobs.map((job) => job.id),
    `/contracts/${contractId}`
  );
  const relatedInvoices = invoices.filter((invoice) => invoice.projectId === contract.projectId);
  const scheduledJobs = relatedJobs.filter((job) => job.dispatchStatus === "scheduled");
  const unscheduledJobs = relatedJobs.filter((job) => job.dispatchStatus === "unscheduled");
  const inProgressJobs = relatedJobs.filter((job) => job.dispatchStatus === "in_progress");
  const nextScheduledJob =
    [...scheduledJobs]
      .filter((job) => job.scheduledDate)
      .sort((left, right) => getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right))[0] ??
    null;
  const nextScheduledAssignments = nextScheduledJob
    ? relatedJobAssignments.get(nextScheduledJob.id) ?? []
    : [];
  const nextScheduledAssignmentNames = nextScheduledAssignments
    .map((assignment) => assignment.person?.displayName ?? assignment.vendor?.name ?? null)
    .filter((value): value is string => Boolean(value));
  const nextScheduledCrewSummary = nextScheduledJob
    ? getScheduleAssignmentSummary({
        assignmentNames: nextScheduledAssignmentNames,
        crewVendorName: nextScheduledJob.crewVendor?.name ?? null,
        assignmentCount: nextScheduledAssignments.length
      })
    : null;
  const jobsWithoutAssignments = relatedJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (relatedJobAssignments.get(job.id)?.length ?? 0) === 0
  );
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
  const onsiteCustomerSigner =
    contract.status === "sent" || contract.status === "viewed"
      ? sortedSigners.find(
          (signer) =>
            signer.signerRole === "customer" &&
            signer.signedAt === null &&
            (signer.signerStatus === "pending" || signer.signerStatus === "viewed")
        )
      : null;
  const depositHref =
    readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied
      ? `/invoices?projectId=${contract.projectId}&estimateId=${contract.estimateId ?? ""}&workflowRole=deposit`
      : null;
  const recentSignatureEvents = [...contract.signatureEvents]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 6);
  const contractMeaning = getContractMeaning(contract.status);
  const contractBlockerSummary =
    contract.status === "draft"
      ? sendReadinessMessage
      : financialBlockersLabel;

  return (
    <div className="mx-auto max-w-6xl space-y-8 print:max-w-none">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10 print:hidden">
        <DetailPageHeader
          eyebrow="Contract Review"
          title={contract.title}
          description={contractMeaning}
          backHref="/contracts"
          backLabel="Back to contracts"
          actions={
            <>
              {contract.isEditable ? (
                <Link
                  href={`/contracts/${contract.id}/edit`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                >
                  Edit draft
                </Link>
              ) : null}
              {contract.estimate ? (
                <Link
                  href={`/estimates/${contract.estimate.id}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                >
                  View source estimate
                </Link>
              ) : null}
              <Link
                href={`/projects/${contract.projectId}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
              >
                Open project readiness hub
              </Link>
              {contract.status === "signed" ? (
                <Link
                  href={depositHref ?? `/projects/${contract.projectId}`}
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  {depositHref
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

        <div className="mt-10 space-y-5 print:hidden">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <section className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                Agreement identity
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize ${getStatusBadgeClassName(
                      contract.status
                    )}`}
                  >
                    {formatStatusLabel(contract.status)}
                  </div>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium capitalize text-slate-600">
                    {formatStatusLabel(contract.signatureReadinessStatus)}
                  </span>
                </div>
                <p className="text-lg font-semibold tracking-tight text-slate-950">
                  {contract.status === "draft"
                    ? "Draft contract ready for review"
                    : signatureStateMessage}
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {contractMeaning}
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Current blockers
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {contract.status === "draft"
                          ? "Send readiness"
                          : "Project and signature follow-through"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {contractBlockerSummary}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Internal approval: {formatStatusLabel(contract.internalApprovalStatus)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Project readiness: {financialReadinessLabel}
                      </p>
                    </div>
                  </div>
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
                  label: "Next best action",
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
                  key: "review-purpose",
                  label: "Review focus",
                  content: (
                    <p className="text-sm text-slate-600">
                      Review the agreement body here first, then use the workflow controls and supporting sections to move the contract through approval, signature, and project readiness in order.
                    </p>
                  )
                },
                {
                  key: "continuity",
                  label: "Connected workflow",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950">
                        {contract.estimate
                          ? "Estimate, contract, and project continuity is active"
                          : "Project continuity is active"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Keep the agreement on the same shared project chain and use the project workspace when deposit, financing, or readiness blockers become the main concern.
                      </p>
                    </>
                  )
                },
                {
                  key: "financial-context",
                  label: "Readiness context",
                  content: (
                    <>
                      <p className="text-sm font-semibold text-slate-950 capitalize">
                        {financialReadinessLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {readinessSnapshot?.depositRequired
                          ? readinessSnapshot.depositSatisfied
                            ? "Deposit requirement is already satisfied."
                            : "Deposit is still part of the active readiness chain."
                          : "Deposit is not the current project readiness gate."}
                      </p>
                    </>
                  )
                }
              ]}
            />
          </div>

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

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-7">
            <div className="print:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Agreement body
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Review the generated agreement here first. Signature workflow and supporting record context stay to the side so the document remains the main workspace.
              </p>
            </div>

            <article
              className="rounded-3xl border border-slate-200 bg-slate-50/50 px-6 py-6 text-sm leading-7 text-slate-700 [&_a]:text-brand-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(contract.renderedContent) }}
            />
          </div>

          <aside className="space-y-6 print:hidden">
            <DetailPanel
              title="Workflow Actions"
              description="Move the contract through approval, send, and countersign from this review surface."
            >
              <div className="space-y-4">
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
                {onsiteCustomerSigner && signatureSummary.canCustomerAct ? (
                  <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 px-4 py-4">
                    <div className="space-y-2 text-sm leading-6 text-[#5f4f43]">
                      <p className="font-medium text-[#17120f]">
                        Onsite customer signature
                      </p>
                      <p>
                        Hand this device to {onsiteCustomerSigner.displayName} to
                        capture the next customer signature on the canonical contract.
                      </p>
                    </div>
                    <div className="mt-4">
                      <OnsiteSignatureModal
                        contractId={contract.id}
                        signerId={onsiteCustomerSigner.id}
                        contractTitle={contract.title}
                        contractReference={contract.referenceNumber}
                        customerName={onsiteCustomerSigner.displayName}
                        depositHref={depositHref}
                      />
                    </div>
                  </div>
                ) : null}
                {contract.sentPdfDownloadUrl ? (
                  <Link
                    href={contract.sentPdfDownloadUrl}
                    className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    Open sent PDF snapshot
                  </Link>
                ) : null}
              </div>
            </DetailPanel>

            <DetailPanel
              title="Schedule Handoff"
              description="Compact production context from the contract's canonical project jobs and job assignments, without creating a contract-to-schedule bridge model."
            >
              <div className="space-y-4 text-sm leading-6 text-slate-600">
                <ScheduleContextMetrics
                  items={[
                    { label: "Scheduled", value: scheduledJobs.length },
                    { label: "Unscheduled", value: unscheduledJobs.length },
                    { label: "In progress", value: inProgressJobs.length }
                  ]}
                />

                {nextScheduledJob ? (
                  <ScheduleContextFocusCard
                    eyebrow={
                      nextScheduledJob.dispatchStatus === "in_progress"
                        ? "Work in progress"
                        : "Next scheduled job"
                    }
                    title={nextScheduledJob.project?.name ?? contract.project?.name ?? "Project job"}
                    titleHref={`/jobs/${nextScheduledJob.id}`}
                    statusLabel={formatStatusLabel(nextScheduledJob.dispatchStatus)}
                    summary={formatScheduleSummaryWindow({
                      scheduledDate: nextScheduledJob.scheduledDate,
                      scheduledStartAt: nextScheduledJob.scheduledStartAt,
                      scheduledEndAt: nextScheduledJob.scheduledEndAt
                    })}
                    detailRows={[
                      {
                        label: "Crew",
                        value:
                          nextScheduledAssignments.length > 0
                            ? nextScheduledCrewSummary
                            : nextScheduledJob.dispatchStatus === "scheduled"
                              ? "Scheduled, but crew assignment still needs to be confirmed"
                              : nextScheduledCrewSummary
                      }
                    ]}
                  />
                ) : (
                  <ScheduleContextNotice
                    eyebrow={relatedJobs.length > 0 ? "Ready for scheduling" : "No jobs yet"}
                    title={
                      relatedJobs.length > 0
                        ? "Contract work has moved into jobs, but not onto the calendar yet"
                        : "No production jobs are linked to this project yet"
                    }
                  >
                    {relatedJobs.length > 0
                      ? "Canonical project jobs already exist for this contract, but they are still unscheduled. The next production commitment will show here once a real date is attached."
                      : "This contract is linked to a project, but downstream production jobs have not been created yet."}
                  </ScheduleContextNotice>
                )}

                <ContextFactsList
                  items={[
                    {
                      label: "Project link",
                      value: contract.project ? (
                        <Link
                          href={`/projects/${contract.project.id}`}
                          className="font-medium text-brand-700"
                        >
                          {contract.project.name}
                        </Link>
                      ) : (
                        "Project context unavailable"
                      )
                    },
                    {
                      label: "Crew assignment state",
                      value:
                        nextScheduledJob && nextScheduledCrewSummary
                          ? nextScheduledCrewSummary
                          : jobsWithoutAssignments.length > 0
                            ? `${jobsWithoutAssignments.length} job${
                                jobsWithoutAssignments.length === 1 ? "" : "s"
                              } still need crew assignment rows`
                            : relatedJobs.length > 0
                              ? "Crew coverage is already attached where needed"
                              : "No project jobs yet"
                    }
                  ]}
                />

                <ScheduleContextActions
                  actions={[
                    ...(nextScheduledJob
                      ? [{ href: `/jobs/${nextScheduledJob.id}`, label: "Open next scheduled job" as const }]
                      : []),
                    {
                      href: buildProjectScheduleHref(contract.projectId),
                      label: "Open schedule",
                      variant: "subtle"
                    }
                  ]}
                />
              </div>
            </DetailPanel>

            <DetailPanel
              title="Signer Routing"
              description="Assigned signers and current signature timing on this contract."
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

              </div>
            </DetailPanel>

            <DetailPanel
              title="Connected Workflow"
              description="Nearby project, estimate, job, and invoice shortcuts that support the contract workflow without replacing the agreement as the main review surface."
            >
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
                        {formatStatusLabel(job.dispatchStatus)}
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

            <RelatedConversationsCard
              source="contract"
              description="Contract-scoped communication stays on canonical threads and routes back into the shared communications workspace when customer follow-through is needed."
              countLabel="Contract threads"
              emptyMessage="No contract-scoped communication threads are attached to this canonical contract yet."
              actionClassName="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              threads={communicationThreads}
            />

            <DetailPanel
              title="Recent Signature Events"
              description="Recent signature milestones for verification, kept secondary to the active workflow."
            >
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                {recentSignatureEvents.length > 0 ? (
                  recentSignatureEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-medium text-slate-950">
                          {formatEventType(event.eventType)}
                        </p>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {formatStatusLabel(event.actorType)}
                        </p>
                      </div>
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
            </DetailPanel>

            <DetailPanel
              title="Editability"
              description="Lower-priority draft administration and lock context."
            >
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

            <DetailPanel
              title="Revision History"
              description="Prior draft snapshots and revision notes."
            >
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
