import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { listProjectChangeOrders } from "@/lib/change-orders/data";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { ProjectForm } from "@/components/project-form";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { listContracts } from "@/lib/contracts/data";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import { listCustomers } from "@/lib/customers/data";
import { listEstimates } from "@/lib/estimates/data";
import { getInvoiceById, listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getOpportunityByProjectId } from "@/lib/opportunities/data";
import { updateProjectAction } from "@/lib/projects/actions";
import { getProjectById } from "@/lib/projects/data";
import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
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
};

type ProjectInvoiceListItem = Awaited<ReturnType<typeof listInvoices>>[number];

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
  approvedEstimateId: string | null;
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  projectEstimatesCount: number;
  projectContractsCount: number;
  depositInvoice: ProjectInvoiceListItem | null;
  depositLatestPaymentEventType: string | null;
}): NextAction {
  const {
    projectId,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount,
    projectContractsCount,
    depositInvoice,
    depositLatestPaymentEventType
  } = input;

  if (projectEstimatesCount === 0) {
    return {
      title: "Blocked: create the first estimate",
      description: "Scope and pricing still need to enter the canonical project chain before contracts, scheduling, and downstream work can continue.",
      primaryLabel: "Create estimate",
      primaryHref: `/estimates?projectId=${projectId}`
    };
  }

  if (readinessSnapshot?.status === "waiting_on_estimate_approval") {
    return {
      title: "Requires follow-up: get estimate approval",
      description: "Estimate work exists on the same project chain, but approval is still the active gate before contracts or readiness can move forward.",
      primaryLabel: "Review estimate",
      primaryHref: readinessSnapshot.estimateId
        ? `/estimates/${readinessSnapshot.estimateId}`
        : `/estimates?projectId=${projectId}`
    };
  }

  if (projectContractsCount === 0 && approvedEstimateId) {
    return {
      title: "Ready: generate the contract",
      description: "An approved estimate exists, so the next step is creating the canonical contract from the same commercial context instead of branching into a separate workflow.",
      primaryLabel: "Generate contract",
      primaryHref: `/contracts?estimateId=${approvedEstimateId}`,
      secondaryLabel: "Review approved estimate",
      secondaryHref: `/estimates/${approvedEstimateId}`
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
        : "/contracts"
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
          primaryHref: `/invoices/${readinessSnapshot.depositInvoiceId}`
        }
      : {
          title: "Blocked: create the deposit request",
          description: "The organization requires a deposit before operations can schedule this work on the same project chain.",
          primaryLabel: "Create deposit invoice",
          primaryHref: `/invoices?projectId=${projectId}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`
        };
  }

  if (readinessSnapshot?.status === "waiting_on_financing") {
    return {
      title: "Blocked: resolve financing readiness",
      description: "Financing status is still blocking the operations handoff. Update the project financing state once the commercial outcome is known.",
      secondaryLabel: "Edit project financing below"
    };
  }

  if (readinessSnapshot?.isReadyToSchedule) {
    return {
      title: "Ready: commercial handoff complete",
      description: "This project is ready for operational scheduling. Operations can take over next while staying on the same project, job, time, and billing chain.",
      primaryLabel: "Open jobs workspace",
      primaryHref: "/jobs"
    };
  }

  return {
    title: "Requires follow-up: review the commercial chain",
    description: "Use the blocker list and readiness stages above to clear the next gate in order, rather than jumping ahead into disconnected downstream work."
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, customers, estimates, contracts, jobs, invoices, projectOpportunity, projectChangeOrders] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices(),
    getOpportunityByProjectId(projectId, `/projects/${projectId}`),
    listProjectChangeOrders(projectId, `/projects/${projectId}`)
  ]);

  if (!project) {
    notFound();
  }

  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: project.organizationId,
    projectId: project.id
  });
  const [projectTimeCards, openTimeStates] = await Promise.all([
    listTimeCardsByProject(project.id, `/projects/${projectId}`),
    listOpenTimeCardStates()
  ]);
  const projectDailyLogs = await listDailyLogsByProject(project.id, `/projects/${projectId}`);

  const projectEstimates = estimates.filter((estimate) => estimate.projectId === project.id);
  const approvedEstimate = projectEstimates.find((estimate) => estimate.status === "approved");
  const projectContracts = contracts.filter((contract) => contract.projectId === project.id);
  const latestProjectContract = projectContracts[0] ?? null;
  const projectJobs = jobs.filter((job) => job.projectId === project.id);
  const completedJob = projectJobs.find((job) => job.dispatchStatus === "completed");
  const projectOpenTimeStates = openTimeStates.filter(
    (state) => state.projectId === project.id
  );
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === project.id);
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
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount: projectEstimates.length,
    projectContractsCount: projectContracts.length,
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
  const latestContractSummary = latestProjectContract
    ? getProjectContractSummary({
        contract: latestProjectContract,
        readinessSnapshot
      })
    : null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_320px]">
      <section className="space-y-10">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Project Readiness Hub"
            title={project.name}
            description="Use this page to clear the remaining commercial gates before operations takes over."
            backHref="/projects"
            backLabel="Back to projects"
            actions={
              <>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href={`/estimates?projectId=${project.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Create estimate
                  </Link>
                  {approvedEstimateId && projectContracts.length === 0 ? (
                    <Link
                      href={`/contracts?estimateId=${approvedEstimateId}`}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                    >
                      Generate contract
                    </Link>
                  ) : null}
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
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="rounded-[1.85rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] px-6 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-700">
                  Current readiness
                </p>
                <div className="mt-4 space-y-3">
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
                  <p className="text-lg font-semibold tracking-tight text-slate-950">
                    {commercialHandoff}
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    {salesVsOperationsNote}
                  </p>
                  {readinessSnapshot && readinessSnapshot.blockers.length > 0 ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/85 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
                        Active blockers
                      </p>
                      <ul className="mt-3 space-y-2.5 text-sm leading-6 text-rose-900">
                        {readinessSnapshot.blockers.slice(0, 3).map((blocker) => (
                          <li key={blocker}>{formatBlockerLabel(blocker)}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-4 text-sm leading-6 text-emerald-900">
                      No active commercial blockers remain. The project is clear for downstream scheduling.
                    </div>
                  )}
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
                          nextAction.primaryLabel && nextAction.primaryHref ? (
                            <Link
                              href={nextAction.primaryHref}
                              className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                            >
                              {nextAction.primaryLabel}
                            </Link>
                          ) : undefined
                        }
                        secondaryAction={
                          nextAction.secondaryLabel && nextAction.secondaryHref ? (
                            <Link
                              href={nextAction.secondaryHref}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
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
                    )
                  },
                  {
                    key: "ready-to-schedule",
                    label: "Readiness timing",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatDateTime(readyToScheduleAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {readinessSnapshot?.isReadyToSchedule
                            ? "Commercial handoff is complete."
                            : "Scheduling should wait until the active gate clears."}
                        </p>
                      </>
                    )
                  },
                  {
                    key: "deposit-readiness",
                    label: "Deposit readiness",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {readinessSnapshot?.depositRequired
                            ? readinessSnapshot.depositSatisfied
                              ? "Deposit satisfied"
                              : "Deposit required"
                            : "No deposit requirement"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{paymentFocusSummary}</p>
                      </>
                    )
                  },
                  {
                    key: "record-counts",
                    label: "Record counts",
                    content: (
                      <>
                        <p className="text-sm font-semibold text-slate-950">
                          {projectEstimates.length} estimates | {projectContracts.length} contracts
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {projectJobs.length} jobs | {projectInvoices.length} invoices
                        </p>
                      </>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Upstream Readiness Chain"
          description="Follow the handoff in order: assessment, estimate approval, contract, financial readiness, then operational clearance."
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
          title="Current Continuity"
          description="The nearest connected records and execution signals that matter to the project handoff right now."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {latestProjectContract ? (
              <LinkedRecordCard
                href={`/contracts/${latestProjectContract.id}`}
                title={latestProjectContract.title}
                subtitle="Latest contract"
                meta={latestContractSummary ?? "Contract continuity available on the contract detail page."}
                badge={renderStatusBadge(formatStatusLabel(latestProjectContract.status))}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                No contract continuity exists yet for this project.
              </div>
            )}

            {projectInvoices[0] ? (
              <LinkedRecordCard
                href={`/invoices/${projectInvoices[0].id}`}
                title={projectInvoices[0].referenceNumber}
                subtitle={
                  projectInvoices[0].workflowRole === "deposit"
                    ? "Latest deposit invoice"
                    : "Latest invoice"
                }
                meta={getProjectInvoiceContinuitySummary({
                  invoice: projectInvoices[0],
                  latestPaymentEventType: null
                })}
                badge={renderStatusBadge(formatStatusLabel(projectInvoices[0].status))}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                No invoice continuity is visible yet on this project.
              </div>
            )}

            {projectDailyLogs[0] ? (
              <LinkedRecordCard
                href={`/daily-logs/${projectDailyLogs[0].id}`}
                title={
                  projectDailyLogs[0].summary?.trim() ||
                  new Date(`${projectDailyLogs[0].logDate}T00:00:00`).toLocaleDateString()
                }
                subtitle="Latest execution record"
                meta={
                  projectDailyLogs[0].job
                    ? `Job ${projectDailyLogs[0].job.id.slice(0, 8)} | ${projectDailyLogs[0].weatherSummary ?? "No weather summary"}`
                    : projectDailyLogs[0].weatherSummary ?? "Project-day execution record"
                }
                badge={renderStatusBadge(formatStatusLabel(projectDailyLogs[0].status))}
              />
            ) : projectJobs[0] ? (
              <LinkedRecordCard
                href={`/jobs/${projectJobs[0].id}`}
                title={projectJobs[0].project?.name ?? project.name}
                subtitle="Latest downstream job"
                meta={projectJobs[0].estimate?.referenceNumber ?? "Project-driven job"}
                badge={renderStatusBadge(formatStatusLabel(projectJobs[0].dispatchStatus))}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                No execution continuity exists yet for this project.
              </div>
            )}
          </div>
        </DetailPanel>

        <DetailPanel
          title="Connected Records"
          description="Grouped record lists for the broader chain behind the current handoff."
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Estimates</p>
              </div>
              <div className="grid gap-4">
                {projectEstimates.length > 0 ? (
                  projectEstimates.map((estimate) => (
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
                  projectContracts.map((contract) => (
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
                    title="Generate a contract after approval"
                    description="Once an estimate is approved, use the contract workflow to keep the signed record tied to the same project."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Jobs</p>
              </div>
              <div className="grid gap-4">
                {projectJobs.length > 0 ? (
                  projectJobs.map((job) => (
                    <LinkedRecordCard
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      title={job.project?.name ?? project.name}
                      subtitle={job.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={job.scheduledDate ? `Scheduled ${new Date(`${job.scheduledDate}T00:00:00`).toLocaleDateString()}` : "Unscheduled"}
                      badge={renderStatusBadge(formatStatusLabel(job.dispatchStatus))}
                    />
                  ))
                ) : (
                  <AppEmptyState
                    eyebrow="No jobs"
                    title="Hold operations until the handoff is clear"
                    description="This page now represents the pre-scheduling gate. Jobs should wait until the readiness chain above is complete."
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Change orders</p>
              </div>
              <div className="grid gap-4">
                {projectChangeOrders.length > 0 ? (
                  projectChangeOrders.map((changeOrder) => (
                    <LinkedRecordCard
                      key={changeOrder.id}
                      href={`/change-orders/${changeOrder.id}`}
                      title={changeOrder.title}
                      subtitle={changeOrder.customer?.name ?? project.customer?.name ?? "Unknown customer"}
                      meta={`${formatMoney(changeOrder.priceAdjustment)}${changeOrder.invoice ? ` | Invoice ${changeOrder.invoice.referenceNumber}` : ""}`}
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
                <p className="text-sm font-medium text-slate-950">Invoices</p>
              </div>
              <div className="grid gap-4">
                {projectInvoices.length > 0 ? (
                  projectInvoices.map((invoice) => (
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
                    title="Invoice from the connected workflow"
                    description="Billing should continue from the same project and downstream work context, with deposit readiness staying on canonical invoices instead of a side model."
                  />
                )}
              </div>
            </section>
          </div>
        </DetailPanel>

        <DetailPanel
          title="Labor and Time"
          description="Supporting field context after the commercial handoff above is understood."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-950">Current punch state</p>
              {projectOpenTimeStates.length > 0 ? (
                projectOpenTimeStates.map((state) => (
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
              {projectTimeCards.slice(0, 5).length > 0 ? (
                projectTimeCards.slice(0, 5).map((timeCard) => (
                  <LinkedRecordCard
                    key={timeCard.id}
                    href={`/time-cards/${timeCard.id}`}
                    title={timeCard.person?.displayName ?? "Unknown worker"}
                    subtitle={new Date(`${timeCard.workDate}T00:00:00`).toLocaleDateString()}
                    meta={`${timeCard.workedMinutes} worked minutes${timeCard.job ? ` | Job ${timeCard.job.id.slice(0, 8)}` : ""}`}
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
          title="Daily Execution"
          description="Recent field execution attached to the project, kept in support of the hub."
        >
          <div className="grid gap-4">
            {projectDailyLogs.slice(0, 4).length > 0 ? (
              projectDailyLogs.slice(0, 4).map((dailyLog) => (
                <LinkedRecordCard
                  key={dailyLog.id}
                  href={`/daily-logs/${dailyLog.id}`}
                  title={dailyLog.summary?.trim() || new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString()}
                  subtitle={new Date(`${dailyLog.logDate}T00:00:00`).toLocaleDateString()}
                  meta={
                    dailyLog.job
                      ? `Job ${dailyLog.job.id.slice(0, 8)} | ${dailyLog.weatherSummary ?? "No weather summary"}`
                      : dailyLog.weatherSummary ?? "Project-day execution record"
                  }
                  badge={renderStatusBadge(formatStatusLabel(dailyLog.status))}
                />
              ))
            ) : (
              <AppEmptyState
                eyebrow="No daily logs"
                title="Capture the first project day"
                description="Daily execution records are now part of the connected project workflow, so create the first log when field work starts."
                actionHref={`/daily-logs?projectId=${project.id}`}
                actionLabel="Create daily log"
              />
            )}
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
          title="Latest Connected Records"
          description="Fast jumps when you need a nearby record without leaving the project hub behind."
        >
          <div className="grid gap-4">
            {projectEstimates[0] ? (
              <LinkedRecordCard
                href={`/estimates/${projectEstimates[0].id}`}
                title={projectEstimates[0].referenceNumber}
                subtitle="Latest estimate"
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
                subtitle="Latest contract"
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
                subtitle="Latest job"
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
                    ? "Latest deposit invoice"
                    : "Latest invoice"
                }
                meta={getProjectInvoiceSummary(projectInvoices[0])}
                badge={renderStatusBadge(formatStatusLabel(projectInvoices[0].status))}
              />
            ) : null}
            {projectChangeOrders[0] ? (
              <LinkedRecordCard
                href={`/change-orders/${projectChangeOrders[0].id}`}
                title={projectChangeOrders[0].title}
                subtitle="Latest change order"
                meta={`${formatMoney(projectChangeOrders[0].priceAdjustment)} | ${projectChangeOrders[0].invoice ? `Invoice ${projectChangeOrders[0].invoice.referenceNumber}` : "Project-linked scope change"}`}
                badge={renderStatusBadge(formatStatusLabel(projectChangeOrders[0].status))}
              />
            ) : null}
            {!projectEstimates[0] &&
            !projectContracts[0] &&
            !projectJobs[0] &&
            !projectInvoices[0] &&
            !projectChangeOrders[0] ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No related estimate, contract, change order, job, or invoice has been created yet.
              </div>
            ) : null}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
