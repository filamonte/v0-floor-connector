import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { listAppointmentsByProject } from "@/lib/appointments/data";
import { listProjectChangeOrders } from "@/lib/change-orders/data";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { ProjectForm } from "@/components/project-form";
import { RelatedConversationsCard } from "@/components/related-conversations-card";
import {
  ScheduleContextActions,
  ScheduleContextFocusCard,
  ScheduleContextMetrics,
  ScheduleContextNotice
} from "@/components/schedule-context-card";
import { listContracts } from "@/lib/contracts/data";
import { listCommunicationThreadsForSubject } from "@/lib/communications/data";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { listCustomers } from "@/lib/customers/data";
import { listEstimates, listProjectEstimateAttachments } from "@/lib/estimates/data";
import { getInvoiceById, listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getOpportunityByProjectId } from "@/lib/opportunities/data";
import { listPunchlistItemsByProject } from "@/lib/punchlists/data";
import { listProgressBillingByProject } from "@/lib/progress-billing/data";
import { updateProjectAction } from "@/lib/projects/actions";
import { getProjectById } from "@/lib/projects/data";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import { listOpenTimeCardStates, listTimeCardsByProject } from "@/lib/time/data";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

type ReadinessStageView = {
  title: string;
  detail: string;
  state: "complete" | "current" | "blocked" | "upcoming";
};

type NextAction = {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  blockerCopy?: string;
};

type ProjectEstimateListItem = Awaited<ReturnType<typeof listEstimates>>[number];
type ProjectContractListItem = Awaited<ReturnType<typeof listContracts>>[number];
type ProjectInvoiceListItem = Awaited<ReturnType<typeof listInvoices>>[number];
type ProjectChangeOrderListItem = Awaited<ReturnType<typeof listProjectChangeOrders>>[number];
type ProjectPaymentListItem = NonNullable<Awaited<ReturnType<typeof getInvoiceById>>>["payments"][number];
type WorkspaceStateTone = "positive" | "warning" | "critical" | "neutral";
type WorkspaceActionItem = {
  title: string;
  description: string;
  label?: string;
  href?: string;
  tone?: "primary" | "secondary" | "warning";
};

type SectionOverviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  stat: string;
};

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(value: string | number) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not marked yet";
}

function formatLocation(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ") || "Not provided";
}

function getReadinessBadgeClassName(isReadyToSchedule: boolean) {
  return isReadyToSchedule
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

function getStageCardClassName(state: ReadinessStageView["state"]) {
  switch (state) {
    case "complete":
      return "border-emerald-200 bg-emerald-50/80";
    case "current":
      return "border-brand-200 bg-brand-50/70";
    case "blocked":
      return "border-rose-200 bg-rose-50/80";
    default:
      return "border-slate-200 bg-slate-50/80";
  }
}

function renderStatusBadge(label: string) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
      {label}
    </span>
  );
}

function formatBlockerLabel(
  blocker: NonNullable<ProjectFinancialReadinessSnapshot>["blockers"][number]
) {
  switch (blocker) {
    case "site_assessment_incomplete":
      return "Site assessment is still incomplete on the linked sales record.";
    case "estimate_not_approved":
      return "An estimate still needs approval before the commercial handoff can continue.";
    case "contract_missing":
      return "No contract has been generated from approved scope yet.";
    case "contract_internal_approval_pending":
      return "Internal contract approval is still blocking send readiness.";
    case "contract_signature_pending":
      return "Contract signature is still required before operations handoff.";
    case "deposit_required":
      return "A deposit is required and has not been satisfied yet.";
    case "financing_pending":
      return "Financing is still pending, so the project is not financially ready.";
    case "financing_declined":
      return "Financing was declined, so the project remains commercially blocked.";
    default:
      return formatStatusLabel(blocker);
  }
}

function getWorkspaceStateCardClassName(tone: WorkspaceStateTone) {
  switch (tone) {
    case "positive":
      return "border-emerald-200 bg-emerald-50/85";
    case "warning":
      return "border-amber-200 bg-amber-50/90";
    case "critical":
      return "border-rose-200 bg-rose-50/90";
    default:
      return "border-slate-200 bg-slate-50/85";
  }
}

function getWorkspaceActionLinkClassName(
  tone: NonNullable<WorkspaceActionItem["tone"]> = "secondary"
) {
  switch (tone) {
    case "primary":
      return "inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900";
    case "warning":
      return "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 transition hover:border-amber-300 hover:bg-amber-100";
    default:
      return "inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700";
  }
}

function SectionOverview({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  stat
}: SectionOverviewProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#eadfce] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#2b2118]">
          {title}
        </h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-6 text-[#665446]">{description}</p>
      </div>
      <div className="flex items-center gap-3 sm:flex-shrink-0">
        <span className="rounded-full border border-[#e3d6c7] bg-[#fbf4ea] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6a5645]">
          {stat}
        </span>
        <Link href={href} className={getWorkspaceActionLinkClassName("secondary")}>
          {linkLabel}
        </Link>
      </div>
    </div>
  );
}

function buildProjectScheduleHref(input: {
  projectId: string;
  projectName?: string;
  view?: "all" | "unscheduled" | "today" | "upcoming" | "in_progress";
  crew?: "all" | "assigned" | "unassigned";
  action?: "schedule" | "assign";
  jobId?: string;
}) {
  return buildScheduleHref({
    projectId: input.projectId,
    q: input.projectName?.trim().length ? input.projectName.trim() : undefined,
    view: input.view,
    crew: input.crew,
    action: input.action,
    jobId: input.jobId
  });
}

function buildProjectEstimateCreateHref(
  projectId: string,
  customerId: string,
  opportunityId?: string | null
) {
  const params = new URLSearchParams({ projectId, customerId });

  if (opportunityId) {
    params.set("opportunityId", opportunityId);
  }

  return `/estimates?${params.toString()}`;
}

function getPaymentRecordSummary(payment: ProjectPaymentListItem) {
  return `${new Date(payment.paymentDate).toLocaleDateString()} | ${formatStatusLabel(payment.status)} | ${payment.paymentMethod.replaceAll("_", " ")}`;
}

function getProjectInvoiceSummary(invoice: ProjectInvoiceListItem) {
  if (invoice.workflowRole === "deposit") {
    if (invoice.status === "paid") {
      return `Deposit satisfied | ${formatMoney(invoice.totalAmount)} collected`;
    }

    if (invoice.status === "partially_paid") {
      return `Deposit partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`;
    }

    if (invoice.status === "void") {
      return "Deposit request voided";
    }

    return `Deposit request | ${formatMoney(invoice.balanceDueAmount)} due`;
  }

  if (invoice.status === "paid") {
    return `Paid in full | ${formatMoney(invoice.totalAmount)} collected`;
  }

  if (invoice.status === "partially_paid") {
    return `Partially paid | ${formatMoney(invoice.balanceDueAmount)} remaining`;
  }

  if (invoice.status === "void") {
    return "Invoice voided";
  }

  return `Balance due ${formatMoney(invoice.balanceDueAmount)}`;
}

function getProjectInvoiceContinuitySummary(input: {
  invoice: {
    workflowRole: string;
    status: string;
    totalAmount: string;
    balanceDueAmount: string;
  };
  latestPaymentEventType: string | null;
}) {
  if (input.latestPaymentEventType === "payment_failed") {
    return "Recent customer payment attempt failed | Follow-through is still needed on the remaining balance";
  }

  if (input.latestPaymentEventType === "checkout_started") {
    return "Customer checkout is in progress | Wait for canonical payment completion before treating billing as clear";
  }

  if (input.latestPaymentEventType === "payment_succeeded") {
    return input.invoice.status === "partially_paid"
      ? input.invoice.workflowRole === "deposit"
        ? `Provider-backed deposit payment completed | ${formatMoney(input.invoice.balanceDueAmount)} still remains before the project is commercially clear`
        : `Provider-backed payment completed | ${formatMoney(input.invoice.balanceDueAmount)} still remains due`
      : input.invoice.workflowRole === "deposit"
        ? "Provider-backed deposit payment completed | Deposit readiness is now satisfied"
        : "Provider-backed payment completed | Billing is now financially settled";
  }

  if (input.latestPaymentEventType === "payment_requested") {
    return "Customer payment requested | Collections attention stays active until payment actually lands";
  }

  if (input.latestPaymentEventType === "payment_voided") {
    return "Provider-backed payment voided | The invoice has returned to an open collection state";
  }

  return getProjectInvoiceSummary(input.invoice as ProjectInvoiceListItem);
}

function getProjectContractSummary(input: {
  contract: (Awaited<ReturnType<typeof listContracts>>)[number];
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
}) {
  const { contract, readinessSnapshot } = input;

  if (contract.status === "signed") {
    if (readinessSnapshot?.status === "waiting_on_deposit") {
      return `Signed ${formatDateTime(contract.signedAt)} | Deposit is the next commercial gate`;
    }

    if (readinessSnapshot?.isReadyToSchedule) {
      return `Signed ${formatDateTime(contract.signedAt)} | Commercial handoff complete`;
    }

    return `Signed ${formatDateTime(contract.signedAt)} | Financial readiness continues from the project hub`;
  }

  if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
    return `Customer signed ${formatDateTime(contract.customerSignedAt)} | Waiting on contractor countersign`;
  }

  if (contract.customerViewedAt) {
    return `Customer viewed ${formatDateTime(contract.customerViewedAt)} | Signature still in progress`;
  }

  if (contract.sentAt) {
    return `Sent ${formatDateTime(contract.sentAt)} | Waiting on customer signature`;
  }

  return contract.estimate?.referenceNumber ?? "No source estimate";
}

function getMostRecentByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null;
}

function buildReadinessStages(input: {
  hasOpportunity: boolean;
  projectOpportunityStatus: string | null;
  estimateCount: number;
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
}): ReadinessStageView[] {
  const { hasOpportunity, projectOpportunityStatus, estimateCount, approvedEstimateId, readinessSnapshot } = input;
  const hasApprovedEstimate = Boolean(approvedEstimateId);
  const hasContract = Boolean(readinessSnapshot?.contractId);
  const contractSigned = readinessSnapshot?.contractStatus === "signed";
  const financialReady =
    readinessSnapshot != null &&
    !readinessSnapshot.blockers.includes("deposit_required") &&
    !readinessSnapshot.blockers.includes("financing_pending") &&
    !readinessSnapshot.blockers.includes("financing_declined");

  return [
    hasOpportunity
      ? projectOpportunityStatus === "completed"
        ? {
            title: "Sales assessment",
            detail: "Assessment and requirements are captured on the linked opportunity record.",
            state: "complete"
          }
        : projectOpportunityStatus === "scheduled"
          ? {
              title: "Sales assessment",
              detail: "A site assessment is scheduled. This is sales-side scheduling, not operational crew scheduling.",
              state: "current"
            }
          : {
              title: "Sales assessment",
              detail: "Lead assessment context still needs completion before the handoff is fully documented.",
              state: "blocked"
            }
      : {
          title: "Sales assessment",
          detail: "This project is moving on a manual path with no linked opportunity record.",
          state: "complete"
        },
    hasApprovedEstimate
      ? {
          title: "Estimate approval",
          detail: "An approved estimate exists and commercial scope is ready to move forward.",
          state: "complete"
        }
      : estimateCount > 0
        ? {
            title: "Estimate approval",
            detail: "Estimate work exists, but approval is still the active blocker.",
            state:
              readinessSnapshot?.status === "waiting_on_estimate_approval"
                ? "current"
                : "blocked"
          }
        : {
            title: "Estimate approval",
            detail: "Create the first estimate so scope and pricing enter the canonical workflow.",
            state: "blocked"
          },
    !hasApprovedEstimate
      ? {
          title: "Contract gate",
          detail: "Contract work starts after estimate approval.",
          state: "upcoming"
        }
      : !hasContract
        ? {
            title: "Contract gate",
            detail: "Generate a contract from the approved estimate to continue the commercial handoff.",
            state:
              readinessSnapshot?.status === "waiting_on_contract"
                ? "current"
                : "blocked"
          }
        : contractSigned
          ? {
              title: "Contract gate",
              detail: "Contract is signed and locked on the canonical record.",
              state: "complete"
            }
          : readinessSnapshot?.status === "waiting_on_internal_approval"
            ? {
                title: "Contract gate",
                detail: "Internal approval is the active gate before the contract can move out for signature.",
                state: "current"
              }
            : {
                title: "Contract gate",
                detail: "Signature is still required before this work can move into operations readiness.",
                state: "current"
              },
    !hasContract
      ? {
          title: "Financial readiness",
          detail: "Deposit and financing rules apply after the contract workflow reaches the right stage.",
          state: "upcoming"
        }
      : financialReady
        ? {
            title: "Financial readiness",
            detail: "Deposit and financing readiness are currently satisfied on the canonical project chain.",
            state: "complete"
          }
        : readinessSnapshot?.status === "waiting_on_deposit"
          ? {
              title: "Financial readiness",
              detail: "Deposit readiness is the active gate before operations can take over.",
              state: "current"
            }
          : {
              title: "Financial readiness",
              detail: "Financing state is still preventing the project from becoming operationally ready.",
              state: "current"
            },
    readinessSnapshot?.isReadyToSchedule
      ? {
          title: "Ready to schedule",
          detail: "Commercial handoff is complete. This marks operational eligibility, not a calendar booking.",
          state: "complete"
        }
      : {
          title: "Ready to schedule",
          detail: "Operations should not schedule or create downstream work until the current blockers are cleared.",
          state: "blocked"
        }
  ];
}

function getNextAction(input: {
  projectId: string;
  customerId: string;
  opportunityId: string | null;
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  projectEstimatesCount: number;
  projectContractsCount: number;
  latestEstimate: ProjectEstimateListItem | null;
  latestContract: ProjectContractListItem | null;
  latestOpenInvoice: ProjectInvoiceListItem | null;
  pendingChangeOrder: ProjectChangeOrderListItem | null;
  projectJobsCount: number;
  unscheduledJobsCount: number;
  activeJobsCount: number;
  hasCompletedJobWithoutInvoice: boolean;
  completedJobWithoutInvoiceId: string | null;
  depositInvoice: ProjectInvoiceListItem | null;
  depositLatestPaymentEventType: string | null;
}): NextAction {
  const {
    projectId,
    customerId,
    opportunityId,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount,
    projectContractsCount,
    latestEstimate,
    latestContract,
    latestOpenInvoice,
    pendingChangeOrder,
    projectJobsCount,
    unscheduledJobsCount,
    activeJobsCount,
    hasCompletedJobWithoutInvoice,
    completedJobWithoutInvoiceId,
    depositInvoice,
    depositLatestPaymentEventType
  } = input;

  if (projectEstimatesCount === 0) {
    return {
      title: "Blocked: start the first estimate",
      description: "Scope and pricing still need to enter the canonical project chain before contracts, scheduling, and downstream work can continue.",
      primaryLabel: "Start estimate",
      primaryHref: buildProjectEstimateCreateHref(projectId, customerId, opportunityId),
      blockerCopy: "No estimate exists yet, so contract, job, invoice, and payment work should wait."
    };
  }

  if (latestEstimate?.status === "draft" && !approvedEstimateId) {
    return {
      title: "Next: finish and send the draft estimate",
      description:
        "A draft estimate exists, but the customer-facing approval path has not started yet. Finish the estimate workspace, then send it through the existing estimate flow.",
      primaryLabel: "Finish estimate",
      primaryHref: `/estimates/${latestEstimate.id}/edit`,
      secondaryLabel: "Review estimate",
      secondaryHref: `/estimates/${latestEstimate.id}`,
      blockerCopy: "Approval, contract generation, and downstream work stay blocked until the estimate is sent and approved."
    };
  }

  if (latestEstimate?.status === "sent" && !approvedEstimateId) {
    return {
      title: "Next: await estimate approval",
      description:
        "The estimate has been sent for customer review. Keep follow-up anchored to the existing estimate record instead of creating downstream work early.",
      primaryLabel: "Review sent estimate",
      primaryHref: `/estimates/${latestEstimate.id}`,
      blockerCopy: "Contract generation and scheduling should wait until the estimate is approved."
    };
  }

  if (latestEstimate?.status === "rejected" && !approvedEstimateId) {
    return {
      title: "Next: revise the rejected estimate",
      description:
        "The latest estimate was rejected. Revise the existing estimate or start a new project estimate before moving into contract or operations work.",
      primaryLabel: "Revise estimate",
      primaryHref: `/estimates/${latestEstimate.id}/edit`,
      secondaryLabel: "Start new estimate",
      secondaryHref: buildProjectEstimateCreateHref(projectId, customerId, opportunityId),
      blockerCopy: "A rejected estimate cannot generate the canonical contract or billing chain."
    };
  }

  if (readinessSnapshot?.status === "waiting_on_estimate_approval" && !approvedEstimateId) {
    return {
      title: "Requires follow-up: move estimate approval forward",
      description:
        "Estimate work exists on the same project chain, but approval is still the active gate before contracts or readiness can move forward.",
      primaryLabel: "Review estimate",
      primaryHref: readinessSnapshot.estimateId
        ? `/estimates/${readinessSnapshot.estimateId}`
        : buildProjectEstimateCreateHref(projectId, customerId, opportunityId),
      blockerCopy: "The project cannot move to contract or scheduling until estimate approval is recorded."
    };
  }

  if (projectContractsCount === 0 && approvedEstimateId) {
    return {
      title: "Ready: generate the contract",
      description: "An approved estimate exists, so the next step is creating the canonical contract from the same commercial context instead of branching into a separate workflow.",
      primaryLabel: "Generate contract",
      primaryHref: `/contracts?estimateId=${approvedEstimateId}`,
      secondaryLabel: "Review approved estimate",
      secondaryHref: `/estimates/${approvedEstimateId}`,
      blockerCopy: "No contract exists yet, so signature readiness and downstream operations remain blocked."
    };
  }

  if (latestContract?.status === "draft") {
    return {
      title: "Next: prepare the draft contract for signature",
      description:
        latestContract.internalApprovalStatus === "pending"
          ? "The contract exists, but internal approval is still pending before it can be sent for signature."
          : "The contract exists as a draft. Review the contract workspace and use the existing send/signature readiness controls there.",
      primaryLabel: "Review contract",
      primaryHref: `/contracts/${latestContract.id}`,
      blockerCopy:
        latestContract.internalApprovalStatus === "pending"
          ? "Send-for-signature is blocked until internal approval is complete."
          : "Customer signature work starts from the contract workspace; this project hub does not bypass that flow."
    };
  }

  if (
    readinessSnapshot?.status === "waiting_on_internal_approval" ||
    readinessSnapshot?.status === "waiting_on_signature"
  ) {
    return {
      title: "Blocked: complete contract readiness",
      description:
        readinessSnapshot.status === "waiting_on_internal_approval"
          ? "Internal approval still blocks send readiness on the canonical contract record."
          : "Signature still blocks the downstream operations handoff.",
      primaryLabel: "Review contract",
      primaryHref: readinessSnapshot.contractId
        ? `/contracts/${readinessSnapshot.contractId}`
        : "/contracts",
      blockerCopy:
        readinessSnapshot.status === "waiting_on_internal_approval"
          ? "The contract cannot be sent until internal approval is complete."
          : "Operations should wait until the required signature gate is complete."
    };
  }

  if (latestContract && (latestContract.status === "sent" || latestContract.status === "viewed")) {
    return {
      title:
        latestContract.status === "viewed"
          ? "Next: follow up on viewed contract"
          : "Next: await contract signature",
      description:
        latestContract.status === "viewed"
          ? "The customer has viewed the contract, but signature is still pending on the canonical contract record."
          : "The contract has been sent for signature. Keep signature follow-up on the existing contract record.",
      primaryLabel: "Review contract",
      primaryHref: `/contracts/${latestContract.id}`,
      blockerCopy: "Jobs, invoices, and payment collection should wait until the configured contract signature gate is clear."
    };
  }

  if (readinessSnapshot?.status === "waiting_on_deposit") {
    return readinessSnapshot.depositInvoiceId
      ? {
          title:
            depositLatestPaymentEventType === "payment_failed"
              ? "Requires follow-up: resolve the failed deposit payment"
              : depositLatestPaymentEventType === "checkout_started"
                ? "Requires follow-up: wait for deposit payment completion"
                : depositLatestPaymentEventType === "payment_succeeded" &&
                    depositInvoice?.status === "partially_paid"
                  ? "Requires follow-up: close the remaining deposit balance"
                : depositLatestPaymentEventType === "payment_requested"
                  ? "Requires follow-up: monitor the requested deposit payment"
                  : depositLatestPaymentEventType === "payment_voided"
                    ? "Blocked: restart deposit collection after the void"
                  : depositInvoice?.status === "partially_paid"
                    ? "Requires follow-up: close the remaining deposit balance"
                    : "Blocked: collect the deposit",
          description:
            depositLatestPaymentEventType === "payment_failed"
              ? `A customer payment attempt failed on the deposit invoice, so ${formatMoney(
                  depositInvoice?.balanceDueAmount ?? "0"
                )} still needs follow-through before the commercial handoff is complete.`
              : depositLatestPaymentEventType === "checkout_started"
                ? "A customer has already entered checkout for the deposit invoice. Keep attention on the payment outcome before taking the project forward."
                : depositLatestPaymentEventType === "payment_succeeded" &&
                    depositInvoice?.status === "partially_paid"
                  ? `A provider-backed deposit payment has landed, but ${formatMoney(
                      depositInvoice.balanceDueAmount
                    )} still needs to clear before the commercial handoff is complete.`
                : depositLatestPaymentEventType === "payment_requested"
                  ? "Customer-facing payment has already been requested on the deposit invoice, so the active work is following that request through."
                  : depositLatestPaymentEventType === "payment_voided"
                    ? `The latest provider-backed payment on the deposit invoice was voided, so ${formatMoney(
                        depositInvoice?.balanceDueAmount ?? "0"
                      )} is open again before the commercial handoff can complete.`
                  : depositInvoice?.status === "partially_paid"
                    ? `A deposit payment has already been recorded, but ${formatMoney(
                        depositInvoice.balanceDueAmount
                      )} still needs to clear before the commercial handoff is complete.`
                    : "A deposit invoice exists, but the commercial handoff will stay blocked until that invoice is paid.",
          primaryLabel: "Review deposit invoice",
          primaryHref: `/invoices/${readinessSnapshot.depositInvoiceId}`,
          blockerCopy: "Scheduling stays blocked until the required deposit is satisfied."
        }
      : {
          title: "Blocked: create the deposit request",
          description: "The organization requires a deposit before operations can schedule this work on the same project chain.",
          primaryLabel: "Create deposit invoice",
          primaryHref: `/invoices?projectId=${projectId}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`,
          blockerCopy: "Deposit collection cannot start until a deposit invoice is created from the existing project and approved-estimate context."
        };
  }

  if (readinessSnapshot?.status === "waiting_on_financing") {
    return {
      title: "Blocked: resolve financing readiness",
      description: "Financing status is still blocking the operations handoff. Update the project financing state once the commercial outcome is known.",
      secondaryLabel: "Edit project financing below",
      blockerCopy: "Operations should wait until financing is approved or no longer required."
    };
  }

  if (pendingChangeOrder) {
    return {
      title:
        pendingChangeOrder.status === "draft"
          ? "Next: finish the draft change order"
          : "Next: follow up on the sent change order",
      description:
        pendingChangeOrder.status === "draft"
          ? "A draft change order is open on this project. Finish or resolve that scope change before treating the current commercial chain as settled."
          : "A sent change order is waiting on customer decision. Keep the scope adjustment on the same canonical change-order record.",
      primaryLabel: "Review change order",
      primaryHref: `/change-orders/${pendingChangeOrder.id}`,
      blockerCopy:
        pendingChangeOrder.status === "draft"
          ? "Draft scope changes can confuse billing and field handoff if they are left unresolved."
          : "Approved change-order scope should be resolved before billing or closeout decisions depend on it."
    };
  }

  if (readinessSnapshot?.isReadyToSchedule) {
    if (projectJobsCount === 0) {
      return {
        title: "Next: create the first job",
        description:
          "Commercial handoff is complete, but no job exists yet. Create the operational job from the existing project context.",
        primaryLabel: "Create job",
        primaryHref: `/jobs?projectId=${projectId}`,
        secondaryLabel: "Open schedule",
        secondaryHref: `/schedule?projectId=${projectId}`,
        blockerCopy: "Scheduling cannot assign real work until a canonical job exists."
      };
    }

    if (unscheduledJobsCount > 0) {
      return {
        title: "Next: schedule the project work",
        description:
          unscheduledJobsCount === 1
            ? "One job exists but is still unscheduled. Use the schedule workspace to place it on the calendar and coordinate crew."
            : `${unscheduledJobsCount} jobs exist but are still unscheduled. Use the schedule workspace to place them on the calendar and coordinate crew.`,
        primaryLabel: "Open schedule",
        primaryHref: `/schedule?projectId=${projectId}`,
        blockerCopy: "Field execution is not fully planned until the project jobs have schedule commitments."
      };
    }

    if (hasCompletedJobWithoutInvoice) {
      return {
        title: "Next: invoice completed work",
        description:
          "A completed job exists without a connected invoice. Create billing from the same project and job context so payment stays tied to completed work.",
        primaryLabel: "Create invoice",
        primaryHref: completedJobWithoutInvoiceId
          ? `/invoices?projectId=${projectId}&jobId=${completedJobWithoutInvoiceId}`
          : `/invoices?projectId=${projectId}`,
        blockerCopy: "Payment follow-up cannot start until completed work is represented by a canonical invoice."
      };
    }

    if (activeJobsCount > 0) {
      return {
        title: "Next: monitor active field work",
        description:
          "Execution is underway. Keep job updates, daily logs, punchlist work, and billing handoff tied to this project chain.",
        primaryLabel: "Open jobs",
        primaryHref: `/jobs?projectId=${projectId}`
      };
    }

    if (latestOpenInvoice) {
      return {
        title:
          latestOpenInvoice.status === "draft"
            ? "Next: finish the draft invoice"
            : "Next: follow open payment",
        description:
          latestOpenInvoice.status === "draft"
            ? "A draft invoice exists on this project. Finish and send it before payment follow-up starts."
            : `${formatMoney(latestOpenInvoice.balanceDueAmount)} remains open on the latest project invoice.`,
        primaryLabel: "Review invoice",
        primaryHref: `/invoices/${latestOpenInvoice.id}`,
        secondaryLabel: "Open payments",
        secondaryHref: "/payments",
        blockerCopy:
          latestOpenInvoice.status === "draft"
            ? "Payment collection should wait until the invoice is sent or otherwise finalized."
            : "Payment is not complete while the invoice still has an open balance."
      };
    }

    return {
      title: "Ready: commercial handoff complete",
      description: "This project is ready for operational scheduling. Operations can take over next while staying on the same project, job, time, and billing chain.",
      primaryLabel: "Open schedule",
      primaryHref: `/schedule?projectId=${projectId}`,
      secondaryLabel: "Create job",
      secondaryHref: `/jobs?projectId=${projectId}`
    };
  }

  return {
    title: "Requires follow-up: review the commercial chain",
    description: "Use the blocker list and readiness stages above to clear the next gate in order, rather than jumping ahead into disconnected downstream work.",
    blockerCopy: "No supported downstream action is available until the current commercial blocker is resolved."
  };
}

function buildWorkspaceActions(input: {
  primaryAction: NextAction;
  projectId: string;
  approvedEstimateId: string | null;
  projectJobsCount: number;
  unscheduledJobsCount: number;
  jobsWithoutCrewCount: number;
  hasCompletedJobWithoutInvoice: boolean;
  completedJobWithoutInvoiceId: string | null;
  unresolvedPunchlistCount: number;
  openInvoiceCount: number;
  activeAppointmentCount: number;
  isReadyToSchedule: boolean;
  hasProgressBillingInvoiceGap: boolean;
}): WorkspaceActionItem[] {
  const actions: WorkspaceActionItem[] = [];
  const pushUniqueAction = (action: WorkspaceActionItem) => {
    if (
      actions.some(
        (existing) =>
          existing.title === action.title &&
          (existing.href ?? null) === (action.href ?? null)
      )
    ) {
      return;
    }

    actions.push(action);
  };

  pushUniqueAction({
    title: input.primaryAction.title,
    description: input.primaryAction.description,
    label: input.primaryAction.primaryLabel,
    href: input.primaryAction.primaryHref,
    tone: "primary"
  });

  if (input.isReadyToSchedule && input.projectJobsCount === 0) {
    pushUniqueAction({
      title: "Create the first job",
      description:
        "Commercial readiness is clear, but execution has not started on the canonical job chain yet.",
      label: "Create job",
      href: `/jobs?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.unscheduledJobsCount > 0) {
    pushUniqueAction({
      title: "Assign crew and schedule work",
      description:
        input.unscheduledJobsCount === 1
          ? "One canonical job is still unscheduled."
          : `${input.unscheduledJobsCount} canonical jobs are still unscheduled.`,
      label: "Open schedule",
      href: `/schedule?projectId=${input.projectId}`,
      tone: "warning"
    });
  }

  if (input.jobsWithoutCrewCount > 0) {
    pushUniqueAction({
      title: "Tighten crew assignments",
      description:
        input.jobsWithoutCrewCount === 1
          ? "One active project job still has no crew vendor assigned."
          : `${input.jobsWithoutCrewCount} active project jobs still have no crew vendor assigned.`,
      label: "Review jobs",
      href: `/jobs?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.activeAppointmentCount === 0) {
    pushUniqueAction({
      title: "Add the next appointment",
      description:
        "Site visits, follow-up meetings, and estimate appointments should stay visible on the project chain.",
      label: "Create appointment",
      href: `/appointments?projectId=${input.projectId}&compose=1#appointment-create`,
      tone: "secondary"
    });
  }

  if (input.hasCompletedJobWithoutInvoice) {
    pushUniqueAction({
      title: "Invoice completed work",
      description:
        "A completed job exists on this project, but billing has not been tied back to it yet.",
      label: "Create invoice",
      href: input.completedJobWithoutInvoiceId
        ? `/invoices?projectId=${input.projectId}&jobId=${input.completedJobWithoutInvoiceId}`
        : `/invoices?projectId=${input.projectId}`,
      tone: "warning"
    });
  }

  if (input.openInvoiceCount > 0) {
    pushUniqueAction({
      title: "Follow open billing",
      description:
        input.openInvoiceCount === 1
          ? "One invoice on this project still has an open balance."
          : `${input.openInvoiceCount} invoices on this project still have open balances.`,
      label: "Open payments",
      href: "/payments",
      tone: "secondary"
    });
  }

  if (input.unresolvedPunchlistCount > 0) {
    pushUniqueAction({
      title: "Close remaining punchlist work",
      description:
        input.unresolvedPunchlistCount === 1
          ? "One punchlist item is still open on this project."
          : `${input.unresolvedPunchlistCount} punchlist items are still open on this project.`,
      label: "Review punchlists",
      href: `/punchlists?projectId=${input.projectId}`,
      tone: "secondary"
    });
  }

  if (input.hasProgressBillingInvoiceGap && input.approvedEstimateId) {
    pushUniqueAction({
      title: "Turn current billable progress into an invoice",
      description:
        "Progress billing exists on the SOV chain, but no connected invoice has been created from the current billable value yet.",
      label: "Open progress billing",
      href: "/progress-billing",
      tone: "secondary"
    });
  }

  return actions.slice(0, 5);
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [
    project,
    customers,
    estimates,
    contracts,
    jobs,
    invoices,
    projectOpportunity,
    projectChangeOrders,
    projectAppointments,
    projectPunchlistItems,
    projectProgressBilling,
    communicationThreads
  ] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices(),
    getOpportunityByProjectId(projectId, `/projects/${projectId}`),
    listProjectChangeOrders(projectId, `/projects/${projectId}`),
    listAppointmentsByProject(projectId, `/projects/${projectId}`),
    listPunchlistItemsByProject(projectId, `/projects/${projectId}`),
    listProgressBillingByProject(projectId, `/projects/${projectId}`),
    listCommunicationThreadsForSubject("project", projectId)
  ]);

  if (!project) {
    notFound();
  }

  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: project.organizationId,
    projectId: project.id
  });
  const [projectTimeCards, openTimeStates, projectEstimateAttachments] = await Promise.all([
    listTimeCardsByProject(project.id, `/projects/${projectId}`),
    listOpenTimeCardStates(),
    listProjectEstimateAttachments(project.id, `/projects/${projectId}`)
  ]);
  const projectDailyLogs = await listDailyLogsByProject(project.id, `/projects/${projectId}`);

  const projectEstimates = estimates.filter((estimate) => estimate.projectId === project.id);
  const approvedEstimate = projectEstimates.find((estimate) => estimate.status === "approved");
  const latestEstimate = getMostRecentByUpdatedAt(projectEstimates);
  const projectContracts = contracts.filter((contract) => contract.projectId === project.id);
  const latestContract = getMostRecentByUpdatedAt(projectContracts);
  const projectContractDocuments = projectContracts.filter(
    (contract) => contract.sentPdfDownloadUrl && contract.sentPdfFileName
  );
  const projectJobs = jobs.filter((job) => job.projectId === project.id);
  const projectJobAssignments = await listJobAssignmentsByJobIds(
    projectJobs.map((job) => job.id),
    `/projects/${projectId}`
  );
  const completedJob = projectJobs.find((job) => job.dispatchStatus === "completed");
  const projectOpenTimeStates = openTimeStates.filter(
    (state) => state.projectId === project.id
  );
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === project.id);
  const pendingChangeOrder =
    projectChangeOrders.find(
      (changeOrder) => changeOrder.status === "sent" || changeOrder.status === "draft"
    ) ?? null;
  const depositInvoice =
    (readinessSnapshot?.depositInvoiceId
      ? projectInvoices.find((invoice) => invoice.id === readinessSnapshot.depositInvoiceId)
      : null) ??
    projectInvoices.find((invoice) => invoice.workflowRole === "deposit") ??
    null;
  const latestPaidInvoice =
    projectInvoices.find((invoice) => invoice.status === "paid") ?? null;
  const latestOpenInvoice =
    projectInvoices.find(
      (invoice) =>
        invoice.status !== "paid" &&
        invoice.status !== "void" &&
        Number(invoice.balanceDueAmount) > 0
    ) ?? null;
  const paymentContinuitySummary = depositInvoice
    ? getProjectInvoiceSummary(depositInvoice)
    : latestOpenInvoice
      ? getProjectInvoiceSummary(latestOpenInvoice)
      : latestPaidInvoice
        ? getProjectInvoiceSummary(latestPaidInvoice)
        : "No invoice payment activity yet";
  const paymentFocusInvoiceId =
    depositInvoice?.id ?? latestOpenInvoice?.id ?? latestPaidInvoice?.id ?? null;
  const paymentFocusInvoice = paymentFocusInvoiceId
    ? await getInvoiceById(paymentFocusInvoiceId, `/projects/${projectId}`)
    : null;
  const paymentFocusLatestEventType = paymentFocusInvoice?.paymentEvents[0]?.eventType ?? null;
  const paymentFocusSummary =
    paymentFocusInvoice && (depositInvoice || latestOpenInvoice || latestPaidInvoice)
      ? getProjectInvoiceContinuitySummary({
          invoice: depositInvoice ?? latestOpenInvoice ?? latestPaidInvoice!,
          latestPaymentEventType: paymentFocusLatestEventType
        })
      : paymentContinuitySummary;
  const hasInvoiceForCompletedJob = completedJob
    ? projectInvoices.some((invoice) => invoice.jobId === completedJob.id)
    : false;
  const canCreateInvoice = Boolean(completedJob) && !hasInvoiceForCompletedJob;
  const unscheduledJobs = projectJobs.filter((job) => job.dispatchStatus === "unscheduled");
  const scheduledJobs = projectJobs.filter((job) => job.dispatchStatus === "scheduled");
  const activeJobs = projectJobs.filter((job) => job.dispatchStatus === "in_progress");
  const jobsWithoutCrew = projectJobs.filter(
    (job) => job.dispatchStatus !== "completed" && !job.crewVendorId
  );
  const approvedEstimateId = approvedEstimate?.id ?? null;
  const completedJobId = completedJob?.id ?? null;
  const readinessStatus = readinessSnapshot?.status ?? project.commercialReadinessStatus;
  const readyToScheduleAt =
    readinessSnapshot?.isReadyToSchedule
      ? project.readyToScheduleAt ?? new Date().toISOString()
      : project.readyToScheduleAt;
  const readinessStages = buildReadinessStages({
    hasOpportunity: Boolean(projectOpportunity),
    projectOpportunityStatus: projectOpportunity?.siteAssessmentStatus ?? null,
    estimateCount: projectEstimates.length,
    approvedEstimateId,
    readinessSnapshot
  });
  const nextAction = getNextAction({
    projectId: project.id,
    customerId: project.customerId,
    opportunityId: projectOpportunity?.id ?? null,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount: projectEstimates.length,
    projectContractsCount: projectContracts.length,
    latestEstimate,
    latestContract,
    latestOpenInvoice,
    pendingChangeOrder,
    projectJobsCount: projectJobs.length,
    unscheduledJobsCount: unscheduledJobs.length,
    activeJobsCount: activeJobs.length,
    hasCompletedJobWithoutInvoice: canCreateInvoice,
    completedJobWithoutInvoiceId: canCreateInvoice ? completedJobId : null,
    depositInvoice,
    depositLatestPaymentEventType:
      paymentFocusInvoice?.id === depositInvoice?.id ? paymentFocusLatestEventType : null
  });
  const commercialHandoff = readinessSnapshot?.isReadyToSchedule
    ? "Sales-side assessment, contract, and financial readiness are complete. This project is now cleared for downstream operational scheduling when that slice is ready."
    : "This view is the authoritative pre-scheduling handoff. Clear the current commercial blockers here before operations takes over.";
  const salesVsOperationsNote =
    projectOpportunity?.siteAssessmentStatus === "scheduled"
      ? "The scheduled site assessment is sales scheduling activity. It documents upstream commercial work, not downstream crew scheduling."
      : "Ready to schedule is an operational handoff state, not a calendar slot. Actual scheduling remains intentionally out of scope in this slice.";
  const activeBlockers = readinessSnapshot?.blockers ?? [];
  const unresolvedPunchlistItems = projectPunchlistItems.filter(
    (item) => item.status !== "closed"
  );
  const scheduledAppointments = projectAppointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const jobsWithoutAssignments = projectJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (projectJobAssignments.get(job.id)?.length ?? 0) === 0
  );
  const scheduledOrActiveJobs = [...projectJobs]
    .filter(
      (job) =>
        (job.dispatchStatus === "scheduled" || job.dispatchStatus === "in_progress") &&
        job.scheduledDate
    )
    .sort(
      (left, right) => getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
    );
  const latestScheduledJob = [...projectJobs]
    .filter((job) => job.scheduledDate)
    .sort(
      (left, right) => getScheduleSummarySortValue(right) - getScheduleSummarySortValue(left)
    )[0] ?? null;
  const nextScheduledJob =
    activeJobs
      .filter((job) => job.scheduledDate)
      .sort(
        (left, right) => getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right)
      )[0] ??
    scheduledOrActiveJobs[0] ??
    latestScheduledJob;
  const scheduleFocusJob = nextScheduledJob ?? latestScheduledJob ?? null;
  const scheduleFocusAssignments = scheduleFocusJob
    ? projectJobAssignments.get(scheduleFocusJob.id) ?? []
    : [];
  const scheduleFocusAssignmentNames = scheduleFocusAssignments
    .map((assignment) => assignment.person?.displayName ?? assignment.vendor?.name ?? null)
    .filter((value): value is string => Boolean(value));
  const scheduleFocusLabel = activeJobs.length > 0 ? "In progress now" : "Next scheduled job";
  const scheduleFocusSummary = scheduleFocusJob
    ? getScheduleAssignmentSummary({
        assignmentNames: scheduleFocusAssignmentNames,
        crewVendorName: scheduleFocusJob.crewVendor?.name ?? null,
        assignmentCount: scheduleFocusAssignments.length
      })
    : null;
  const openInvoices = projectInvoices.filter(
    (invoice) =>
      invoice.status !== "paid" &&
      invoice.status !== "void" &&
      Number(invoice.balanceDueAmount) > 0
  );
  const recentPayments = (paymentFocusInvoice?.payments ?? []).slice(0, 4);
  const currentBillableValue = projectProgressBilling.reduce(
    (sum, workspace) => sum + Number(workspace.currentBillableTotal),
    0
  );
  const hasProgressBillingInvoiceGap =
    projectProgressBilling.length > 0 &&
    currentBillableValue > 0 &&
    projectInvoices.filter((invoice) => invoice.billingModel === "aia_progress").length === 0;
  const workspaceBlockers = [
    ...activeBlockers.map((blocker) => formatBlockerLabel(blocker)),
    ...(unscheduledJobs.length > 0
      ? [
          unscheduledJobs.length === 1
            ? "One job is still unscheduled."
            : `${unscheduledJobs.length} jobs are still unscheduled.`
        ]
      : []),
    ...(unresolvedPunchlistItems.length > 0
      ? [
          unresolvedPunchlistItems.length === 1
            ? "One punchlist item is still open."
            : `${unresolvedPunchlistItems.length} punchlist items are still open.`
        ]
      : []),
    ...(hasProgressBillingInvoiceGap
      ? ["Progress billing exists, but no connected progress invoice has been created yet."]
      : []),
    ...(canCreateInvoice
      ? ["Completed work exists without a connected invoice."]
      : [])
  ];
  const schedulingState = readinessSnapshot?.isReadyToSchedule
    ? activeJobs.length > 0
      ? {
          value: `${activeJobs.length} active ${activeJobs.length === 1 ? "job" : "jobs"}`,
          detail: "Execution is already underway on the canonical job chain.",
          tone: "positive" as WorkspaceStateTone
        }
      : scheduledJobs.length > 0
        ? {
            value: `${scheduledJobs.length} scheduled ${scheduledJobs.length === 1 ? "job" : "jobs"}`,
            detail: "Scheduling is in motion on canonical jobs.",
            tone: "positive" as WorkspaceStateTone
          }
        : unscheduledJobs.length > 0
          ? {
              value: `${unscheduledJobs.length} unscheduled ${unscheduledJobs.length === 1 ? "job" : "jobs"}`,
              detail: "Operational handoff is clear, but crew assignment still needs attention.",
              tone: "warning" as WorkspaceStateTone
            }
          : {
              value: "Ready for first job",
              detail: "Commercial handoff is clear and operations can create the first job.",
              tone: "warning" as WorkspaceStateTone
            }
    : {
        value: "Not schedule-ready",
        detail: "Commercial blockers still need to clear before operations should schedule work.",
        tone: "critical" as WorkspaceStateTone
      };
  const financialState =
    openInvoices.length > 0
      ? {
          value: `${formatMoney(
            openInvoices.reduce((sum, invoice) => sum + Number(invoice.balanceDueAmount), 0)
          )} open`,
          detail: `Across ${openInvoices.length} invoice${openInvoices.length === 1 ? "" : "s"}, billing still needs collection.`,
          tone: "warning" as WorkspaceStateTone
        }
      : recentPayments.length > 0
        ? {
            value: `${formatMoney(
              recentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
            )} recent payments`,
            detail: "Connected invoice payments are already recorded on this project chain.",
            tone: "positive" as WorkspaceStateTone
          }
        : readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied
          ? {
              value: "Deposit required",
              detail: "Commercial readiness is still waiting on deposit collection.",
              tone: "critical" as WorkspaceStateTone
            }
          : hasProgressBillingInvoiceGap
            ? {
                value: `${formatMoney(currentBillableValue)} ready to bill`,
                detail: "Current SOV progress exists, but billing has not been pushed into invoices yet.",
                tone: "warning" as WorkspaceStateTone
              }
            : {
                value: "Financial chain connected",
                detail: paymentFocusSummary,
                tone: "neutral" as WorkspaceStateTone
              };
  const nextActionQueue = buildWorkspaceActions({
    primaryAction: nextAction,
    projectId: project.id,
    approvedEstimateId,
    projectJobsCount: projectJobs.length,
    unscheduledJobsCount: unscheduledJobs.length,
    jobsWithoutCrewCount: jobsWithoutCrew.length,
    hasCompletedJobWithoutInvoice: canCreateInvoice,
    completedJobWithoutInvoiceId: canCreateInvoice ? completedJobId : null,
    unresolvedPunchlistCount: unresolvedPunchlistItems.length,
    openInvoiceCount: openInvoices.length,
    activeAppointmentCount: scheduledAppointments.length,
    isReadyToSchedule: Boolean(readinessSnapshot?.isReadyToSchedule),
    hasProgressBillingInvoiceGap
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_320px]">
      <section className="space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Project Workspace"
            title={project.name}
            description="Use this workspace to see the connected records behind the project and move the next estimate, contract, progress billing, or invoice step forward without hopping across modules."
            backHref="/projects"
            backLabel="Back to projects"
            actions={
              <>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href={buildProjectEstimateCreateHref(
                      project.id,
                      project.customerId,
                      projectOpportunity?.id
                    )}
                    className="inline-flex items-center rounded-full bg-[#ef7d32] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(239,125,50,0.9)] transition hover:bg-[#d96d27]"
                  >
                    Create Estimate
                  </Link>
                  {approvedEstimateId && projectContracts.length === 0 ? (
                    <Link
                      href={`/contracts?estimateId=${approvedEstimateId}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      Generate contract
                    </Link>
                  ) : null}
                  <Link
                    href={`/appointments?projectId=${project.id}&customerId=${project.customerId}&compose=1#appointment-create`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    Create appointment
                  </Link>
                  {readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      Create deposit invoice
                    </Link>
                  ) : null}
                  {canCreateInvoice && completedJobId ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&jobId=${completedJobId}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      Create invoice
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm font-medium ${getReadinessBadgeClassName(
                      Boolean(readinessSnapshot?.isReadyToSchedule)
                    )}`}
                  >
                    {readinessSnapshot?.isReadyToSchedule
                      ? "Ready to schedule"
                      : formatStatusLabel(readinessStatus)}
                  </span>
                  {renderStatusBadge(formatStatusLabel(project.status))}
                </div>
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

          <div className="mt-10 space-y-5">
            <section className="rounded-[1.9rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fdf7ef,#ffffff)] px-6 py-6 shadow-[0_24px_70px_-46px_rgba(57,43,30,0.28)]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${getReadinessBadgeClassName(
                        Boolean(readinessSnapshot?.isReadyToSchedule)
                      )}`}
                    >
                      {readinessSnapshot?.isReadyToSchedule
                        ? "Ready to schedule"
                        : formatStatusLabel(readinessStatus)}
                    </span>
                    {renderStatusBadge(formatStatusLabel(project.status))}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a4581a]">
                      Operational overview
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-[#2b2118] sm:text-[1.55rem]">
                      {commercialHandoff}
                    </p>
                    <p className="max-w-[70ch] text-sm leading-6 text-[#665446]">
                      {salesVsOperationsNote}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-slate-200 bg-white/88 px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          Key blockers
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {workspaceBlockers.length > 0
                            ? `${workspaceBlockers.length} items need attention`
                            : "No active blockers"}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        Ready to schedule: {formatDateTime(readyToScheduleAt)}
                      </p>
                    </div>
                    {workspaceBlockers.length > 0 ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {workspaceBlockers.slice(0, 4).map((blocker) => (
                          <div
                            key={blocker}
                            className="rounded-2xl border border-rose-200 bg-rose-50/85 px-4 py-3 text-sm leading-6 text-rose-900"
                          >
                            {blocker}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-4 text-sm leading-6 text-emerald-900">
                        Commercial, scheduling, and closeout blockers are currently clear on this project.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "project-status",
                      label: "Project status",
                      value: formatStatusLabel(project.status),
                      detail:
                        project.description?.trim() ||
                        "Project remains the operational root for all connected work.",
                      tone: "neutral" as WorkspaceStateTone
                    },
                    {
                      key: "readiness-state",
                      label: "Readiness state",
                      value: readinessSnapshot?.isReadyToSchedule
                        ? "Ready to schedule"
                        : formatStatusLabel(readinessStatus),
                      detail:
                        readinessSnapshot?.isReadyToSchedule
                          ? "Commercial handoff is complete."
                          : "Use the next action below to clear the current gate and keep the workflow moving.",
                      tone: readinessSnapshot?.isReadyToSchedule
                        ? ("positive" as WorkspaceStateTone)
                        : ("warning" as WorkspaceStateTone)
                    },
                    {
                      key: "financial-state",
                      label: "Financial state",
                      value: financialState.value,
                      detail: financialState.detail,
                      tone: financialState.tone
                    },
                    {
                      key: "scheduling-state",
                      label: "Scheduling state",
                      value: schedulingState.value,
                      detail: schedulingState.detail,
                      tone: schedulingState.tone
                    },
                    {
                      key: "coordination-state",
                      label: "Appointments",
                      value:
                        scheduledAppointments.length > 0
                          ? `${scheduledAppointments.length} upcoming`
                          : "No upcoming appointments",
                      detail:
                        scheduledAppointments[0]
                          ? `${scheduledAppointments[0].appointmentType.replaceAll("_", " ")} on ${new Date(
                              scheduledAppointments[0].startsAt
                            ).toLocaleString()}`
                          : "Customer meetings, site visits, and follow-ups should stay visible here.",
                      tone:
                        scheduledAppointments.length > 0
                          ? ("positive" as WorkspaceStateTone)
                          : ("neutral" as WorkspaceStateTone)
                    },
                    {
                      key: "connected-counts",
                      label: "Connected workflow",
                      value: `${projectEstimates.length} estimates / ${projectContracts.length} contracts / ${projectInvoices.length} invoices`,
                      detail: `${projectJobs.length} jobs / ${projectPunchlistItems.length} punchlists / ${projectProgressBilling.length} SOV workspaces`,
                      tone: "neutral" as WorkspaceStateTone
                    }
                  ].map((card) => (
                    <section
                      key={card.key}
                      className={`rounded-[1.45rem] border px-4 py-4 ${getWorkspaceStateCardClassName(card.tone)}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-3 text-base font-semibold text-slate-950">
                        {card.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                    </section>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <DetailPanel
          title="Next Actions"
          description="Simple heuristics from the current project state keep the team focused on what should happen next."
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            <section className="rounded-[1.85rem] border border-[#d8be9f] bg-[linear-gradient(180deg,#fff8ef,#ffffff)] px-6 py-6 shadow-[0_24px_70px_-46px_rgba(57,43,30,0.28)]">
              <NextActionCard
                eyebrow="Primary next action"
                title={nextAction.title}
                description={nextAction.description}
                primaryAction={
                  nextAction.primaryLabel && nextAction.primaryHref ? (
                    <Link
                      href={nextAction.primaryHref}
                      className={getWorkspaceActionLinkClassName("primary")}
                    >
                      {nextAction.primaryLabel}
                    </Link>
                  ) : undefined
                }
                secondaryAction={
                  nextAction.secondaryLabel && nextAction.secondaryHref ? (
                    <Link
                      href={nextAction.secondaryHref}
                      className={getWorkspaceActionLinkClassName("secondary")}
                    >
                      {nextAction.secondaryLabel}
                    </Link>
                  ) : nextAction.secondaryLabel ? (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                      {nextAction.secondaryLabel}
                    </span>
                  ) : undefined
                }
              />
              {nextAction.blockerCopy ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-950">
                  {nextAction.blockerCopy}
                </div>
              ) : null}
            </section>

            <div className="grid gap-3">
              {nextActionQueue.slice(1).map((action) => (
                <section
                  key={`${action.title}-${action.href ?? "no-link"}`}
                  className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4"
                >
                  <p className="text-base font-semibold text-slate-950">{action.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                  {action.href && action.label ? (
                    <div className="mt-4">
                      <Link
                        href={action.href}
                        className={getWorkspaceActionLinkClassName(action.tone)}
                      >
                        {action.label}
                      </Link>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Upstream Readiness Chain"
          description="The project hub still reflects the commercial handoff in order, so operations can see what is blocking downstream work at a glance."
        >
          <div className="grid gap-4 xl:grid-cols-5">
            {readinessStages.map((stage) => (
              <section
                key={stage.title}
                className={`rounded-2xl border px-5 py-4 ${getStageCardClassName(stage.state)}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {stage.title}
                </p>
                <p className="mt-3 text-sm font-medium capitalize text-slate-950">
                  {stage.state}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{stage.detail}</p>
              </section>
            ))}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Connected Workflow"
          description="Upstream commercial and customer-facing records stay visible here so the project hub shows continuity without duplicating those workflows."
        >
          <div className="space-y-6">
            <SectionOverview
              eyebrow="Estimates / Contracts / Appointments"
              title="Commercial records stay connected to the project"
              description="Project should make upstream status easy to scan, then hand off into the real estimate, contract, and appointment workspaces for deeper work."
              href={projectContracts.length > 0 ? "/contracts" : "/estimates"}
              linkLabel={projectContracts.length > 0 ? "Open contracts" : "Open estimates"}
              stat={`${projectEstimates.length} estimates / ${projectContracts.length} contracts / ${projectAppointments.length} appointments`}
            />
            <div className="grid gap-8 xl:grid-cols-3">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Estimates</p>
              </div>
              <div className="grid gap-4">
                {projectEstimates.length > 0 ? (
                  projectEstimates.slice(0, 2).map((estimate) => (
                    <LinkedRecordCard
                      key={estimate.id}
                      href={`/estimates/${estimate.id}`}
                      title={estimate.referenceNumber}
                      subtitle={estimate.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={`Total ${formatMoney(estimate.totalAmount)}`}
                      badge={renderStatusBadge(formatStatusLabel(estimate.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No estimates"
                    title="Start the commercial flow"
                    description="Create an estimate from this project so scope, pricing, and downstream workflow records stay connected."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Contracts</p>
              </div>
              <div className="grid gap-4">
                {projectContracts.length > 0 ? (
                  projectContracts.slice(0, 2).map((contract) => (
                    <LinkedRecordCard
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      title={contract.title}
                      subtitle={contract.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={getProjectContractSummary({ contract, readinessSnapshot })}
                      badge={renderStatusBadge(formatStatusLabel(contract.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No contracts"
                    title="Generate contract after approval"
                    description="Once the estimate is approved, generate contract from the same project chain so the signed record stays connected."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Appointments</p>
              </div>
              <div className="grid gap-4">
                {projectAppointments.length > 0 ? (
                  projectAppointments.slice(0, 2).map((appointment) => (
                    <LinkedRecordCard
                      key={appointment.id}
                      href={`/appointments/${appointment.id}`}
                      title={appointment.title}
                      subtitle={
                        appointment.customer?.name ??
                        project.customer?.name ??
                        "Unknown customer"
                      }
                      meta={`${appointment.appointmentType.replaceAll("_", " ")} / ${new Date(appointment.startsAt).toLocaleString()}`}
                      badge={renderStatusBadge(formatStatusLabel(appointment.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No appointments"
                    title="Schedule project-facing coordination here"
                    description="Use appointments for customer meetings, site visits, and follow-up blocks while keeping execution scheduling on canonical jobs."
                    actionHref={`/appointments?projectId=${project.id}&customerId=${project.customerId}&compose=1#appointment-create`}
                    actionLabel="Create appointment"
                  />
                )}
              </div>
            </section>
          </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Documents"
          description="Estimate attachments and sent contract PDFs stay linked to the same project chain here without duplicating file records."
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Estimate attachments</p>
              </div>
              <div className="grid gap-4">
                {projectEstimateAttachments.length > 0 ? (
                  projectEstimateAttachments.slice(0, 4).map((attachment) => (
                    <LinkedRecordCard
                      key={attachment.id}
                      href={attachment.downloadUrl ?? `/estimates/${attachment.estimateId}`}
                      title={attachment.fileName}
                      subtitle={attachment.estimateReferenceNumber}
                      meta={new Date(attachment.createdAt).toLocaleString()}
                      badge={renderStatusBadge("Estimate file")}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No estimate files"
                    title="Estimate documents will show up here"
                    description="Files attached in the estimate workspace remain linked to the same project so sales and operations can reference one shared document chain."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Contract PDFs</p>
              </div>
              <div className="grid gap-4">
                {projectContractDocuments.length > 0 ? (
                  projectContractDocuments.slice(0, 4).map((contract) => (
                    <LinkedRecordCard
                      key={contract.id}
                      href={contract.sentPdfDownloadUrl ?? `/contracts/${contract.id}`}
                      title={contract.sentPdfFileName ?? `${contract.title}.pdf`}
                      subtitle={contract.title}
                      meta={
                        contract.sentPdfGeneratedAt
                          ? `Generated ${new Date(contract.sentPdfGeneratedAt).toLocaleString()}`
                          : "Sent contract PDF"
                      }
                      badge={renderStatusBadge("Sent PDF")}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No sent PDFs"
                    title="Sent contract files will show up here"
                    description="Once a contract is sent for signature, its official PDF snapshot stays linked to the same contract and project context."
                  />
                )}
              </div>
            </section>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Operations Hub"
          description="Project stays the operating summary for jobs, scheduling pressure, and closeout work while real execution still happens on canonical job and punchlist records."
        >
          <div className="space-y-6">
            <SectionOverview
              eyebrow="Jobs / Scheduling / Punchlists"
              title="Execution pressure is summarized here first"
              description="Use this section to see whether the project is ready for the field, what is unscheduled, what still needs crew attention, and what closeout work is still open."
              href={unscheduledJobs.length > 0 ? "/schedule?view=unscheduled" : "/jobs"}
              linkLabel={unscheduledJobs.length > 0 ? "Open schedule" : "Open jobs"}
              stat={`${projectJobs.length} jobs / ${jobsWithoutCrew.length} missing crew / ${unresolvedPunchlistItems.length} unresolved punchlists`}
            />
            <div className="grid gap-8 xl:grid-cols-3">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Jobs</p>
              </div>
              <div className="grid gap-4">
                {projectJobs.length > 0 ? (
                  projectJobs.slice(0, 3).map((job) => (
                    <LinkedRecordCard
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      title={job.project?.name ?? project.name}
                      subtitle={job.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={
                        job.scheduledDate
                          ? `${job.crewVendor?.name ?? "Crew not assigned"} / Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}`
                          : `${job.crewVendor?.name ?? "Crew not assigned"} / Unscheduled`
                      }
                      badge={renderStatusBadge(formatStatusLabel(job.dispatchStatus))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No jobs"
                    title="Hold operations until the handoff is clear"
                    description="Jobs should stay downstream of the commercial readiness chain instead of becoming a parallel scheduling system."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Punchlists</p>
              </div>
              <div className="grid gap-4">
                {projectPunchlistItems.length > 0 ? (
                  projectPunchlistItems.slice(0, 3).map((item) => (
                    <LinkedRecordCard
                      key={item.id}
                      href={`/punchlists/${item.id}`}
                      title={item.title}
                      subtitle={item.assignee?.displayName ?? "Unassigned"}
                      meta={
                        item.job
                          ? `Job ${item.job.id.slice(0, 8)} / ${item.dueDate ? `Due ${new Date(`${item.dueDate}T00:00:00`).toLocaleDateString()}` : "No due date"}`
                          : item.dueDate
                            ? `Due ${new Date(`${item.dueDate}T00:00:00`).toLocaleDateString()}`
                            : "Project-level closeout item"
                      }
                      badge={renderStatusBadge(formatStatusLabel(item.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No punchlists"
                    title="Track closeout work here"
                    description="When corrective or closeout work needs to survive beyond one project day, keep it on the canonical punchlist chain."
                    actionHref={`/punchlists?projectId=${project.id}&compose=1`}
                    actionLabel="Create punchlist item"
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Daily execution</p>
              </div>
              <div className="grid gap-4">
                {projectDailyLogs.slice(0, 2).length > 0 ? (
                  projectDailyLogs.slice(0, 2).map((dailyLog) => (
                    <LinkedRecordCard
                      key={dailyLog.id}
                      href={`/daily-logs/${dailyLog.id}`}
                      title={
                        dailyLog.summary?.trim() ||
                        new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString()
                      }
                      subtitle={new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString()}
                      meta={
                        dailyLog.job
                          ? `Job ${dailyLog.job.id.slice(0, 8)} / ${dailyLog.weatherSummary ?? "No weather summary"}`
                          : dailyLog.weatherSummary ?? "Project-day execution record"
                      }
                      badge={renderStatusBadge(formatStatusLabel(dailyLog.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No daily logs"
                    title="Capture the first project day"
                    description="Daily execution records stay connected to the same project and job chain once field work begins."
                    actionHref={`/daily-logs?projectId=${project.id}`}
                    actionLabel="Create daily log"
                  />
                )}
              </div>
            </section>
          </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Financial Hub"
          description="Billing continuity stays visible here from scope change through progress billing, invoicing, and payment, while the project hub remains a summary-first surface."
        >
          <div className="space-y-6">
            <SectionOverview
              eyebrow="Invoices / Payments / Progress Billing"
              title="Financial state is visible without leaving the project hub"
              description="Use this section to see what is billable, what has been invoiced, and what still needs collection before you move into the deeper billing workspaces."
              href={openInvoices.length > 0 ? "/payments" : "/invoices"}
              linkLabel={openInvoices.length > 0 ? "Open payments" : "Open invoices"}
              stat={`${projectInvoices.length} invoices / ${formatMoney(openInvoices.reduce((sum, invoice) => sum + Number(invoice.balanceDueAmount), 0))} open`}
            />
            <div className="grid gap-8 xl:grid-cols-4">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Change orders</p>
              </div>
              <div className="grid gap-4">
                {projectChangeOrders.length > 0 ? (
                  projectChangeOrders.slice(0, 2).map((changeOrder) => (
                    <LinkedRecordCard
                      key={changeOrder.id}
                      href={`/change-orders/${changeOrder.id}`}
                      title={changeOrder.title}
                      subtitle={changeOrder.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={`${formatMoney(changeOrder.priceAdjustment)}${changeOrder.invoice ? ` / Invoice ${changeOrder.invoice.referenceNumber}` : ""}`}
                      badge={renderStatusBadge(formatStatusLabel(changeOrder.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No change orders"
                    title="Track scope changes here"
                    description="When scope or price shifts after contract approval, keep the adjustment on the same project chain with a canonical change order."
                    actionHref={`/change-orders?projectId=${project.id}&compose=1`}
                    actionLabel="Create change order"
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Progress billing / SOV</p>
              </div>
              <div className="grid gap-4">
                {projectProgressBilling.length > 0 ? (
                  projectProgressBilling.slice(0, 2).map((workspace) => (
                    <LinkedRecordCard
                      key={workspace.id}
                      href={`/progress-billing/${workspace.id}`}
                      title={workspace.estimate?.referenceNumber ?? "Schedule of values"}
                      subtitle={
                        workspace.customer?.name ?? project.customer?.name ?? "Unknown customer"
                      }
                      meta={
                        `Current ${formatMoney(workspace.currentBillableTotal)} / Balance ${formatMoney(workspace.balanceToFinishTotal)} / ${workspace.weightedPercentComplete}% complete`
                      }
                      badge={renderStatusBadge(formatStatusLabel(workspace.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No progress billing"
                    title="Open progress billing after approved scope seeds here"
                    description="Once approved estimate items seed a schedule of values on this project, progress billing stays tied to the same estimate, project, and invoice chain."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Invoices</p>
              </div>
              <div className="grid gap-4">
                {projectInvoices.length > 0 ? (
                  projectInvoices.slice(0, 3).map((invoice) => (
                    <LinkedRecordCard
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      title={invoice.referenceNumber}
                      subtitle={
                        invoice.customer?.name ?? project.customer?.name ?? "Unknown customer"
                      }
                      meta={
                        getProjectInvoiceSummary(invoice)
                      }
                      badge={renderStatusBadge(formatStatusLabel(invoice.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No invoices"
                    title="Create invoice from the connected workflow"
                    description="Billing should continue from the same project and downstream work context, with deposit readiness staying on canonical invoices instead of a side model."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Payments</p>
              </div>
              <div className="grid gap-4">
                {recentPayments.length > 0 ? (
                  recentPayments.slice(0, 3).map((payment) => (
                    <LinkedRecordCard
                      key={payment.id}
                      href={
                        paymentFocusInvoice
                          ? `/invoices/${paymentFocusInvoice.id}`
                          : "/payments"
                      }
                      title={formatMoney(payment.amount)}
                      subtitle={
                        paymentFocusInvoice
                          ? `On ${paymentFocusInvoice.referenceNumber}`
                          : "Recent payment"
                      }
                      meta={getPaymentRecordSummary(payment)}
                      badge={renderStatusBadge(formatStatusLabel(payment.status))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No payments"
                    title="Payment activity will show up here"
                    description="Recorded payments remain attached to canonical invoices, so this workspace surfaces them through the same billing chain."
                  />
                )}
              </div>
            </section>
          </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Field Signal"
          description="Supporting labor and time context stays visible here after the commercial and operations picture is understood."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-950">Current punch state</p>
              {projectOpenTimeStates.length > 0 ? (
                projectOpenTimeStates.slice(0, 3).map((state) => (
                  <div
                    key={state.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600"
                  >
                    <p className="font-medium text-slate-950">
                      {state.person?.displayName ?? "Unknown worker"}
                    </p>
                    <p className="mt-1">
                      {state.currentPunchState === "on_break" ? "On break" : "Punched in"}
                    </p>
                    <p className="mt-1">
                      {state.job ? `Job ${state.job.id.slice(0, 8)}` : "Project-level time"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No open time sessions are currently attributed to this project.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-950">Recent time cards</p>
              {projectTimeCards.slice(0, 3).length > 0 ? (
                projectTimeCards.slice(0, 3).map((timeCard) => (
                  <LinkedRecordCard
                    key={timeCard.id}
                    href={`/time-cards/${timeCard.id}`}
                    title={timeCard.person?.displayName ?? "Unknown worker"}
                    subtitle={new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()}
                    meta={`${timeCard.workedMinutes} worked minutes${timeCard.job ? ` / Job ${timeCard.job.id.slice(0, 8)}` : ""}`}
                    badge={renderStatusBadge(formatStatusLabel(timeCard.status))}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No time cards are attributed to this project yet.
                </div>
              )}
            </div>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Edit Project"
          description="Editing stays on the same record, but it is intentionally lower priority than the readiness workspace above."
        >
          <ProjectForm
            action={updateProjectAction}
            submitLabel="Save project"
            pendingLabel="Saving project..."
            customers={customers}
            project={project}
          />
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Project Context"
          description="Compact project facts and commercial settings supporting the main readiness view."
        >
          <ContextFactsList
            items={[
              {
                label: "Commercial readiness",
                value: <span className="capitalize">{formatStatusLabel(readinessStatus)}</span>
              },
              {
                label: "Ready to schedule",
                value: formatDateTime(readyToScheduleAt)
              },
              {
                label: "Financing status",
                value: (
                  <span className="capitalize">
                    {formatStatusLabel(readinessSnapshot?.financingStatus ?? project.financingStatus)}
                  </span>
                )
              },
              {
                label: "Deposit readiness",
                value: readinessSnapshot?.depositRequired
                  ? readinessSnapshot.depositSatisfied
                    ? "Deposit satisfied"
                    : "Deposit required"
                  : "No deposit requirement"
              },
              {
                label: "Linked lead",
                value: projectOpportunity ? (
                  <Link
                    href={`/leads/${projectOpportunity.id}`}
                    className="font-medium text-brand-700"
                  >
                    {projectOpportunity.title}
                  </Link>
                ) : (
                  "No linked lead"
                )
              },
              ...(projectOpportunity
                ? [
                    {
                      label: "Assessment status",
                      value: (
                        <span className="capitalize">
                          {formatStatusLabel(projectOpportunity.siteAssessmentStatus)}
                        </span>
                      )
                    },
                    {
                      label: "Requirements summary",
                      value:
                        projectOpportunity.requirementsSummary ??
                        "No requirements summary captured yet"
                    }
                  ]
                : []),
              {
                label: "Customer",
                value: project.customer ? (
                  <Link
                    href={`/customers/${project.customer.id}`}
                    className="font-medium text-brand-700"
                  >
                    {project.customer.name}
                  </Link>
                ) : (
                  "Unknown customer"
                )
              },
              {
                label: "Customer company",
                value: project.customer?.companyName ?? "Not provided"
              },
              {
                label: "Status",
                value: <span className="capitalize">{formatStatusLabel(project.status)}</span>
              },
              {
                label: "Scope notes",
                value: project.description ?? "Not provided"
              },
              {
                label: "Location",
                value: formatLocation([
                  project.addressLine1,
                  project.addressLine2,
                  project.city,
                  project.stateRegion,
                  project.postalCode,
                  project.countryCode
                ])
              },
              {
                label: "Service address line 1",
                value: project.addressLine1 ?? "Not provided"
              },
              {
                label: "Service address line 2",
                value: project.addressLine2 ?? "Not provided"
              },
              {
                label: "Service city",
                value: project.city ?? "Not provided"
              },
              {
                label: "Service state / postal",
                value:
                  [project.stateRegion, project.postalCode].filter(Boolean).join(" ") ||
                  "Not provided"
              },
              {
                label: "Created",
                value: new Date(project.createdAt).toLocaleString()
              },
              {
                label: "Updated",
                value: new Date(project.updatedAt).toLocaleString()
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Project Continuity"
          description="Compact record links and shared context supporting the project workspace without turning the sidebar into a second dashboard."
        >
          <div className="grid gap-4">
            {projectEstimates[0] ? (
              <LinkedRecordCard
                href={`/estimates/${projectEstimates[0].id}`}
                title={projectEstimates[0].referenceNumber}
                subtitle="Primary estimate"
                meta={
                  projectEstimates[0].customer?.name ??
                  project.customer?.name ??
                  "Unknown customer"
                }
                badge={renderStatusBadge(formatStatusLabel(projectEstimates[0].status))}
              />
            ) : null}
            {projectContracts[0] ? (
              <LinkedRecordCard
                href={`/contracts/${projectContracts[0].id}`}
                title={projectContracts[0].title}
                subtitle="Primary contract"
                meta={getProjectContractSummary({
                  contract: projectContracts[0],
                  readinessSnapshot
                })}
                badge={renderStatusBadge(formatStatusLabel(projectContracts[0].status))}
              />
            ) : null}
            {projectJobs[0] ? (
              <LinkedRecordCard
                href={`/jobs/${projectJobs[0].id}`}
                title={projectJobs[0].project?.name ?? project.name}
                subtitle="Current job"
                meta={projectJobs[0].estimate?.referenceNumber ?? "Project-driven job"}
                badge={renderStatusBadge(formatStatusLabel(projectJobs[0].dispatchStatus))}
              />
            ) : null}
            {projectInvoices[0] ? (
              <LinkedRecordCard
                href={`/invoices/${projectInvoices[0].id}`}
                title={projectInvoices[0].referenceNumber}
                subtitle={
                  projectInvoices[0].workflowRole === "deposit"
                    ? "Deposit invoice"
                    : "Current invoice"
                }
                meta={getProjectInvoiceSummary(projectInvoices[0])}
                badge={renderStatusBadge(formatStatusLabel(projectInvoices[0].status))}
              />
            ) : null}
            {projectChangeOrders[0] ? (
              <LinkedRecordCard
                href={`/change-orders/${projectChangeOrders[0].id}`}
                title={projectChangeOrders[0].title}
                subtitle="Current change order"
                meta={`${formatMoney(projectChangeOrders[0].priceAdjustment)} / ${projectChangeOrders[0].invoice ? `Invoice ${projectChangeOrders[0].invoice.referenceNumber}` : "Project-linked scope change"}`}
                badge={renderStatusBadge(formatStatusLabel(projectChangeOrders[0].status))}
              />
            ) : null}
            {projectAppointments[0] ? (
              <LinkedRecordCard
                href={`/appointments/${projectAppointments[0].id}`}
                title={projectAppointments[0].title}
                subtitle="Current appointment"
                meta={`${projectAppointments[0].appointmentType.replaceAll("_", " ")} / ${new Date(projectAppointments[0].startsAt).toLocaleString()}`}
                badge={renderStatusBadge(formatStatusLabel(projectAppointments[0].status))}
              />
            ) : null}
            {projectPunchlistItems[0] ? (
              <LinkedRecordCard
                href={`/punchlists/${projectPunchlistItems[0].id}`}
                title={projectPunchlistItems[0].title}
                subtitle="Current punchlist item"
                meta={
                  projectPunchlistItems[0].assignee?.displayName ??
                  "Unassigned closeout item"
                }
                badge={renderStatusBadge(formatStatusLabel(projectPunchlistItems[0].status))}
              />
            ) : null}
            {projectDailyLogs[0] ? (
              <LinkedRecordCard
                href={`/daily-logs/${projectDailyLogs[0].id}`}
                title={
                  projectDailyLogs[0].summary?.trim() ||
                  new Date(`${projectDailyLogs[0].logDate}T00:00:00`).toLocaleDateString()
                }
                subtitle="Current daily log"
                meta={
                  projectDailyLogs[0].weatherSummary ?? "Recent field execution record"
                }
                badge={renderStatusBadge(formatStatusLabel(projectDailyLogs[0].status))}
              />
            ) : null}
            {!projectEstimates[0] &&
            !projectContracts[0] &&
            !projectJobs[0] &&
            !projectInvoices[0] &&
            !projectAppointments[0] &&
            !projectChangeOrders[0] &&
            !projectPunchlistItems[0] &&
            !projectDailyLogs[0] ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No related estimate, contract, appointment, change order, punchlist item, daily log, job, or invoice has been created yet.
              </div>
            ) : null}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Production Schedule"
          description="Compact schedule continuity from canonical jobs and job assignments, with calendar work still handed off to the shared schedule workspace."
        >
          <div className="space-y-4 text-sm leading-6 text-slate-600">
            <ScheduleContextMetrics
              items={[
                { label: "Scheduled", value: scheduledJobs.length },
                { label: "Unscheduled", value: unscheduledJobs.length },
                { label: "In progress", value: activeJobs.length }
              ]}
            />

            {scheduleFocusJob ? (
              <ScheduleContextFocusCard
                eyebrow={
                  scheduleFocusJob.dispatchStatus === "in_progress"
                    ? "Work in progress"
                    : scheduleFocusLabel
                }
                title={project.name}
                titleHref={`/jobs/${scheduleFocusJob.id}`}
                statusLabel={formatStatusLabel(scheduleFocusJob.dispatchStatus)}
                summary={formatScheduleSummaryWindow({
                  scheduledDate: scheduleFocusJob.scheduledDate,
                  scheduledStartAt: scheduleFocusJob.scheduledStartAt,
                  scheduledEndAt: scheduleFocusJob.scheduledEndAt
                })}
                detailRows={[
                  {
                    label: "Crew",
                    value:
                      scheduleFocusAssignments.length > 0
                        ? scheduleFocusSummary
                        : scheduleFocusJob.dispatchStatus === "scheduled"
                          ? "Scheduled, but crew assignment still needs to be confirmed"
                          : scheduleFocusSummary
                  }
                ]}
              />
            ) : (
              <ScheduleContextNotice
                eyebrow={projectJobs.length > 0 ? "Ready for scheduling" : "No jobs yet"}
                title={
                  projectJobs.length > 0
                    ? "Project jobs exist, but no calendar commitment is set yet"
                    : "Production work has not been created yet"
                }
              >
                {projectJobs.length > 0
                  ? "The project has canonical jobs, but they are still unscheduled. Once a real date is attached, the next production commitment will show here."
                  : "Create downstream project jobs first. Schedule continuity will appear here once production work exists on the canonical job chain."}
              </ScheduleContextNotice>
            )}

            <ContextFactsList
              items={[
                {
                  label: "Crew assignment state",
                  value:
                    jobsWithoutAssignments.length > 0
                      ? `${jobsWithoutAssignments.length} job${
                          jobsWithoutAssignments.length === 1 ? "" : "s"
                        } still need crew assignment rows`
                      : projectJobs.length > 0
                        ? "Crew coverage is already attached where needed"
                        : "No project jobs yet"
                },
                {
                  label: "Current handoff",
                  value:
                    scheduleFocusJob?.dispatchStatus === "in_progress"
                      ? "Field work is already active on this project"
                      : readinessSnapshot?.isReadyToSchedule
                        ? unscheduledJobs.length > 0
                          ? "Commercial handoff is clear and production can now be placed on the calendar"
                          : "Commercial handoff is clear for schedule follow-through"
                        : "Project is still upstream of operational scheduling"
                }
              ]}
            />

            <ScheduleContextActions
              actions={[
                {
                  href: buildProjectScheduleHref({
                    projectId: project.id,
                    view:
                      unscheduledJobs.length > 0
                        ? "unscheduled"
                        : activeJobs.length > 0
                          ? "in_progress"
                          : "all",
                    crew: jobsWithoutAssignments.length > 0 ? "unassigned" : "all"
                  }),
                  label: "Open schedule",
                  variant: "subtle"
                },
                ...(scheduleFocusJob
                  ? [
                      {
                        href: buildProjectScheduleHref({
                          projectId: project.id,
                          jobId: scheduleFocusJob.id,
                          action:
                            scheduleFocusAssignments.length > 0 ||
                            scheduleFocusJob.dispatchStatus === "unscheduled"
                              ? "schedule"
                              : "assign"
                        }),
                        label: "Open focused job in schedule",
                        variant: "subtle" as const
                      }
                    ]
                  : [])
              ]}
            />
          </div>
        </DetailPanel>

        <RelatedConversationsCard
          source="project"
          description="Project-scoped communication stays on canonical threads and routes back into the shared communications review workspace when follow-through is needed."
          countLabel="Project threads"
          emptyMessage="No project-scoped communication threads are attached to this canonical project yet."
          actionClassName={getWorkspaceActionLinkClassName("secondary")}
          threads={communicationThreads}
        />
      </aside>
    </div>
  );
}
