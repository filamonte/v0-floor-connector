import Link from "next/link";
import { notFound } from "next/navigation";
import {
  computeContractSignatureWorkflowSummary,
  computeContractWorkflowGate
} from "@floorconnector/domain";
import { sanitizeHtml } from "@/lib/html/sanitize";

import { ContractStatusActions } from "@/components/contract-status-actions";
import {
  ActionOverflowMenu,
  overflowActionClassName,
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { OnsiteSignatureModal } from "@/components/contracts/onsite-signature-modal";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NeedsAttentionPanel } from "@/components/operational-cues/needs-attention-panel";
import { CueStateControls } from "@/components/cue-states/cue-state-controls";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import { ReadyToScheduleActionPanel } from "@/components/ready-to-schedule-action-panel";
import { RevisionTimeline } from "@/components/revisions/revision-timeline";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { getContractById, getContractSignatureActionOptions } from "@/lib/contracts/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { isOrganizationActivatedForProductionAction } from "@/lib/organizations/activation-guard";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { getOperationalCuesForSubject } from "@/lib/operational-cues/data";
import { getCueStateActionSupport } from "@/lib/cue-states/apply";
import { buildOperationalCueIdentity } from "@/lib/cue-states/identity";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { ensureInitialRecordRevision, listRecordRevisions } from "@/lib/revisions/data";
import { buildContractRevisionSnapshot } from "@/lib/revisions/snapshots";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import {
  ActionBar,
  PrimarySection,
  ProjectStateSummary,
  WorkflowBar
} from "@floorconnector/ui";
import type { ProjectStateSummaryProps, WorkflowStep } from "@floorconnector/ui";

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

function getActionBarStatusTone(input: {
  status: string;
  signatureSummary: ReturnType<typeof computeContractSignatureWorkflowSummary>;
}): "neutral" | "warning" | "success" | "danger" {
  if (input.signatureSummary.isVoided || input.signatureSummary.isDeclined || input.status === "void") {
    return "danger";
  }

  if (input.status === "signed" && input.signatureSummary.isCompleted) {
    return "success";
  }

  if (input.status === "draft" || input.status === "sent" || input.status === "viewed") {
    return "warning";
  }

  return "neutral";
}

function getContractDisplayState(input: {
  status: string;
  signatureSummary: ReturnType<typeof computeContractSignatureWorkflowSummary>;
}) {
  if (input.signatureSummary.isVoided || input.status === "void") {
    return "Void";
  }

  if (input.signatureSummary.isDeclined) {
    return "Declined";
  }

  if (input.status === "signed" && input.signatureSummary.isCompleted) {
    return "Signed";
  }

  if (input.signatureSummary.requiresCountersign && input.signatureSummary.allCustomerSignersSigned) {
    return "Awaiting countersign";
  }

  if (
    input.signatureSummary.anyCustomerInteraction ||
    input.signatureSummary.signedCustomerSignerCount > 0
  ) {
    return "Partially signed";
  }

  if (input.status === "sent" || input.status === "viewed") {
    return "Awaiting customer";
  }

  return "Draft";
}

function getSignatureProgressLabel(
  summary: ReturnType<typeof computeContractSignatureWorkflowSummary>
) {
  const totalRequiredSigners = summary.customerSignerCount + summary.contractorSignerCount;
  const signedRequiredSigners = summary.signedCustomerSignerCount + summary.signedContractorSignerCount;

  if (totalRequiredSigners === 0) {
    return "No signer routing";
  }

  return `${signedRequiredSigners}/${totalRequiredSigners} signed`;
}

function getContractAction(input: {
  contractId: string;
  projectId: string;
  estimateId: string | null;
  status: string;
  canSend: boolean;
  internalApprovalStatus: string;
  isLocked: boolean;
  canCountersign: boolean;
  signatureSummary: ReturnType<typeof computeContractSignatureWorkflowSummary>;
  depositRequired: boolean;
  depositSatisfied: boolean;
}) {
  if (input.signatureSummary.isVoided || input.status === "void") {
    return {
      title: "Contract is void",
      description:
        "This contract is preserved for history. Use the project hub for any active replacement workflow.",
      label: "Open project hub",
      href: `/projects/${input.projectId}`
    };
  }

  if (input.signatureSummary.isDeclined) {
    return {
      title: "Customer declined",
      description:
        "A signer declined this contract. Review signer routing and signature history before revising or replacing the agreement.",
      label: "Review signer history",
      href: "#signer-routing"
    };
  }

  if (input.canCountersign) {
    return {
      title: "Contractor countersign needed",
      description:
        "Customer signature is complete. The only signing action shown here is the contractor countersign step.",
      label: "Countersign",
      href: "#contract-workflow-actions"
    };
  }

  if (input.status === "signed" && input.signatureSummary.isCompleted) {
    if (input.depositRequired && !input.depositSatisfied) {
      return {
        title: "Contract signed; deposit next",
        description:
          "Signature is complete. Deposit collection is the active financial handoff before downstream readiness can proceed.",
        label: "Create deposit invoice",
        href: `/invoices?projectId=${input.projectId}&estimateId=${input.estimateId ?? ""}&workflowRole=deposit`
      };
    }

    return {
      title: "Signature complete",
      description:
        "The contract is fully signed. Use the project readiness hub for deposit, scheduling, job, and invoice follow-through.",
      label: "Open project hub",
      href: `/projects/${input.projectId}`
    };
  }

  if (input.status === "sent" || input.status === "viewed") {
    return {
      title: "Await customer signature",
      description:
        "The contract is out for signature. Keep signer routing visible and avoid draft edits while signature activity is active.",
      label: "Review signer routing",
      href: "#signer-routing"
    };
  }

  if (input.status === "draft" && input.canSend) {
    return {
      title: "Send for signature",
      description:
        "Draft review and internal approval are ready. Select the customer signer in workflow actions to send this contract.",
      label: "Send for signature",
      href: "#contract-workflow-actions"
    };
  }

  if (input.status === "draft" && input.internalApprovalStatus === "rejected") {
    return {
      title: "Edit draft before send",
      description:
        "Internal review marked this contract for revision. Edit the draft before attempting signature routing again.",
      label: "Edit draft",
      href: `/contracts/${input.contractId}/edit`
    };
  }

  if (input.status === "draft" && !input.isLocked) {
    return {
      title: "Complete send readiness",
      description:
        "Internal approval or signer setup is still blocking send. Use the workflow actions to clear the draft gate.",
      label: "Review workflow actions",
      href: "#contract-workflow-actions"
    };
  }

  return {
    title: "Review signature lock state",
    description:
      "Signature activity or lock state prevents draft send/edit actions. Review signer routing and project readiness from here.",
    label: "Review signer routing",
    href: "#signer-routing"
  };
}

function getContractWorkflowSteps(input: {
  contractStatus: string;
  estimateStatus: string | null;
  relatedJobs: Array<{ dispatchStatus: string }>;
  relatedInvoices: Array<{ status: string; balanceDueAmount: string }>;
  signatureSummary: ReturnType<typeof computeContractSignatureWorkflowSummary>;
}): WorkflowStep[] {
  const hasApprovedEstimate = input.estimateStatus === "approved";
  const hasJobs = input.relatedJobs.length > 0;
  const hasCompletedJob = input.relatedJobs.some((job) => job.dispatchStatus === "completed");
  const hasInvoices = input.relatedInvoices.length > 0;
  const hasPaidInvoice = input.relatedInvoices.some((invoice) => invoice.status === "paid");
  const hasOpenInvoiceBalance = input.relatedInvoices.some(
    (invoice) => Number(invoice.balanceDueAmount) > 0
  );
  const contractBlocked =
    input.signatureSummary.isDeclined || input.signatureSummary.isVoided || input.contractStatus === "void";
  const contractComplete = input.contractStatus === "signed" && input.signatureSummary.isCompleted;

  return [
    {
      id: "estimate",
      label: "Estimate",
      state: hasApprovedEstimate && contractComplete ? "complete" : input.estimateStatus ? "current" : "upcoming",
      description: input.estimateStatus ? formatStatusLabel(input.estimateStatus) : "No linked estimate"
    },
    {
      id: "contract",
      label: "Contract",
      state: contractBlocked ? "blocked" : contractComplete ? "complete" : "current",
      description: contractBlocked
        ? getContractDisplayState({
            status: input.contractStatus,
            signatureSummary: input.signatureSummary
          })
        : contractComplete
          ? "Signed"
          : getSignatureProgressLabel(input.signatureSummary)
    },
    {
      id: "job",
      label: "Job",
      state: hasCompletedJob ? "complete" : hasJobs && contractComplete ? "current" : "upcoming",
      description: hasJobs
        ? `${input.relatedJobs.length} job${input.relatedJobs.length === 1 ? "" : "s"} linked`
        : "Not created from this project yet"
    },
    {
      id: "invoice",
      label: "Invoice",
      state: hasPaidInvoice ? "complete" : hasInvoices && contractComplete ? "current" : "upcoming",
      description: hasInvoices
        ? `${input.relatedInvoices.length} invoice${input.relatedInvoices.length === 1 ? "" : "s"} linked`
        : "No linked project invoice"
    },
    {
      id: "payment",
      label: "Payment",
      state: hasPaidInvoice ? "complete" : hasOpenInvoiceBalance ? "current" : "upcoming",
      description: hasPaidInvoice
        ? "Paid invoice present"
        : hasOpenInvoiceBalance
          ? "Open invoice balance"
          : "No collected payment signal"
    }
  ];
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

  await ensureInitialRecordRevision({
    organizationId: contract.organizationId,
    subjectType: "contract",
    subjectId: contract.id,
    revisionKind: "system_snapshot",
    revisionReason: "Initial revision captured from the existing canonical contract.",
    snapshot: buildContractRevisionSnapshot(contract),
    createdByUserId: user.id
  });
  const recordRevisions = await listRecordRevisions({
    organizationId: contract.organizationId,
    subjectType: "contract",
    subjectId: contract.id
  });

  const workflowSettings = await getOrganizationWorkflowSettings(contract.organizationId);
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: contract.organizationId,
    projectId: contract.projectId
  });
  const contractAttentionCues = await getOperationalCuesForSubject({
    organizationId: contract.organizationId,
    subjectType: "contract",
    subjectId: contract.id,
    currentUserId: user.id
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
  const isProductionActionLocked = organizationContext
    ? !isOrganizationActivatedForProductionAction({
        id: organizationContext.organization.id,
        tenantStatus: organizationContext.organization.tenantStatus,
        lifecycleState: organizationContext.organization.lifecycleState
      })
    : false;
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
  const showReadyToSchedulePanel =
    contract.status === "signed" &&
    signatureSummary.isCompleted &&
    Boolean(readinessSnapshot?.isReadyToSchedule);
  const contractAction = getContractAction({
    contractId: contract.id,
    projectId: contract.projectId,
    estimateId: contract.estimateId,
    status: contract.status,
    canSend: contractGate.canSend,
    internalApprovalStatus: contract.internalApprovalStatus,
    isLocked: contractGate.isLocked,
    canCountersign,
    signatureSummary,
    depositRequired: readinessSnapshot?.depositRequired ?? false,
    depositSatisfied: readinessSnapshot?.depositSatisfied ?? false
  });
  const contractPrimaryAction =
    contractAction.label === "Send for signature" || contractAction.label === "Countersign"
      ? contractAction
      : null;
  const contractDisplayState = getContractDisplayState({
    status: contract.status,
    signatureSummary
  });
  const signatureProgressLabel = getSignatureProgressLabel(signatureSummary);
  const contractWorkflowSteps = getContractWorkflowSteps({
    contractStatus: contract.status,
    estimateStatus: contract.estimate?.status ?? null,
    relatedJobs,
    relatedInvoices,
    signatureSummary
  });
  const contractStateItems: ProjectStateSummaryProps["items"] = [
    {
      id: "status",
      label: "Status",
      value: contractDisplayState,
      tone:
        contract.status === "signed" && signatureSummary.isCompleted
          ? "complete"
          : signatureSummary.isDeclined || signatureSummary.isVoided || contract.status === "void"
            ? "blocked"
            : contract.status === "draft"
              ? "pending"
              : "active",
      detail: formatStatusLabel(contract.status)
    },
    {
      id: "signers",
      label: "Signers",
      value: signatureProgressLabel,
      tone:
        contract.status === "signed" && signatureSummary.isCompleted
          ? "complete"
          : signatureSummary.isDeclined || signatureSummary.isVoided
            ? "blocked"
            : sortedSigners.length > 0
              ? "active"
              : "needsAction",
      detail:
        sortedSigners.length > 0
          ? `${signatureSummary.customerSignerCount} customer, ${signatureSummary.contractorSignerCount} contractor`
          : "No signer routing yet"
    },
    {
      id: "signature",
      label: "Signature",
      value: signatureSummary.requiresCountersign ? "Countersign tracked" : "Customer signature",
      tone:
        contract.status === "signed" && signatureSummary.isCompleted
          ? "complete"
          : canCountersign
            ? "needsAction"
            : signatureSummary.isDeclined || signatureSummary.isVoided
              ? "blocked"
              : contract.status === "draft"
                ? "pending"
                : "active",
      detail: signatureStateMessage
    },
    {
      id: "lock",
      label: "Edit lock",
      value: contract.isEditable ? "Editable" : "Locked",
      tone: contract.isEditable ? "pending" : "active",
      detail: formatLockReason(contract.editLockReason)
    }
  ];
  const recentSignatureEvents = [...contract.signatureEvents]
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 6);
  const contractMeaning = getContractMeaning(contract.status);

  return (
    <div className="mx-auto max-w-6xl space-y-8 print:max-w-none">
      <div className="rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-sm sm:p-6 print:hidden">
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

        <div className="mt-8 space-y-4 print:hidden">
          <ActionBar
            title={contractAction.title}
            description={contractAction.description}
            statusLabel={contractDisplayState}
            statusTone={getActionBarStatusTone({ status: contract.status, signatureSummary })}
            nextActionLabel={
              signatureSummary.isCompleted
                ? "Signature complete"
                : canCountersign
                  ? "Contractor step"
                  : contract.status === "draft"
                    ? "Draft readiness"
                    : "Signature workflow"
            }
            primaryAction={
              contractPrimaryAction ? (
                <a href={contractPrimaryAction.href} className={primaryActionClassName}>
                  {contractPrimaryAction.label}
                </a>
              ) : null
            }
            secondaryActions={
              <>
                <Link
                  href={`/contracts/${contract.id}/pdf`}
                  className={secondaryActionClassName}
                >
                  Print / save PDF
                </Link>
                {contract.isEditable ? (
                  <Link
                    href={`/contracts/${contract.id}/edit`}
                    className={secondaryActionClassName}
                  >
                    Edit
                  </Link>
                ) : null}
                <Link href={`/projects/${contract.projectId}`} className={secondaryActionClassName}>
                  View Project
                </Link>
                <ActionOverflowMenu>
                  {contract.status === "draft" || contract.status === "sent" || contract.status === "viewed" ? (
                    <a href="#contract-workflow-actions" className={overflowActionClassName}>
                      Void
                    </a>
                  ) : null}
                  {contract.estimateId ? (
                    <Link href={`/estimates/${contract.estimateId}`} className={overflowActionClassName}>
                      View Estimate
                    </Link>
                  ) : null}
                  <a href="#signer-routing" className={overflowActionClassName}>
                    Signer Routing
                  </a>
                </ActionOverflowMenu>
              </>
            }
            meta={
              <>
                {contract.customer?.name ?? "Unknown customer"} ·{" "}
                {contract.project?.name ?? "Unknown project"} ·{" "}
                Internal approval {formatStatusLabel(contract.internalApprovalStatus)}
              </>
            }
          />

          <WorkflowBar title="Contract workflow" steps={contractWorkflowSteps} />

          <ProjectStateSummary title="Signature state" items={contractStateItems} />

          <NeedsAttentionPanel
            cues={contractAttentionCues}
            description="Contract-specific signature cues derived from this canonical contract and enabled organization rules."
            getCueStateControls={(cue) => (
              <CueStateControls
                identity={buildOperationalCueIdentity(cue)}
                support={getCueStateActionSupport(cue)}
                returnTo={`/contracts/${contract.id}`}
              />
            )}
          />

          {showReadyToSchedulePanel ? (
            <ReadyToScheduleActionPanel
              projectId={contract.projectId}
              projectName={contract.project?.name ?? "Linked project"}
              estimateId={contract.estimate?.status === "approved" ? contract.estimateId : null}
              contractId={contract.id}
              readyToScheduleAt={readinessSnapshot?.contractSignedAt}
              jobCount={relatedJobs.length}
              unscheduledJobCount={unscheduledJobs.length}
              unscheduledJobId={
                unscheduledJobs.length === 1 ? unscheduledJobs[0].id : null
              }
              source="contract"
            />
          ) : null}
        </div>
      </div>

      <PrimarySection
        title="Contract content"
        description="Review the generated agreement as the primary surface. Signature actions, signer routing, and project handoff stay nearby without competing with the document."
        className="rounded-[2rem] border-slate-200 px-6 py-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:px-8 sm:py-10 print:rounded-none print:border-none print:px-0 print:py-0 print:shadow-none"
      >
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
              <div id="contract-workflow-actions" className="space-y-4">
                <ContractStatusActions
                  contractId={contract.id}
                  currentStatus={contract.status}
                  currentInternalApprovalStatus={contract.internalApprovalStatus}
                  requireContractInternalApproval={
                    workflowSettings.requireContractInternalApproval
                  }
                  canSend={contractGate.canSend}
                  isProductionActionLocked={isProductionActionLocked}
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
              description="Primary agreement context stays visible; downstream activity expands only when needed."
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
                {relatedJobs[0] ? (
                  <LinkedRecordCard
                    href={`/jobs/${relatedJobs[0].id}`}
                    title={relatedJobs[0].project?.name ?? "Job"}
                    subtitle="Current job"
                    meta={relatedJobs[0].scheduledDate ? `Scheduled ${new Date(`${relatedJobs[0].scheduledDate}T00:00:00`).toLocaleDateString()}` : "Unscheduled"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(relatedJobs[0].dispatchStatus)}
                      </span>
                    }
                  />
                ) : null}
                {relatedInvoices[0] ? (
                  <LinkedRecordCard
                    href={`/invoices/${relatedInvoices[0].id}`}
                    title={relatedInvoices[0].referenceNumber}
                    subtitle="Current invoice"
                    meta={`Balance due ${formatMoney(relatedInvoices[0].balanceDueAmount)}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(relatedInvoices[0].status)}
                      </span>
                    }
                  />
                ) : null}
                {relatedJobs.length > 1 || relatedInvoices.length > 1 ? (
                  <details className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    <summary className="cursor-pointer list-none font-semibold text-slate-950">
                      View all downstream records
                    </summary>
                    <div className="mt-4 grid gap-4">
                      {relatedJobs.slice(1).map((job) => (
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
                      {relatedInvoices.slice(1).map((invoice) => (
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
                    </div>
                  </details>
                ) : null}
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

            <details className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <summary className="cursor-pointer list-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Revision History
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Draft snapshots and revision notes are available when needed.
                </p>
              </summary>
              <div className="mt-5 space-y-5">
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
                <RevisionTimeline revisions={recordRevisions} />
              </div>
            </details>
          </aside>
        </div>
      </PrimarySection>
    </div>
  );
}
