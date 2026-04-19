import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
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
import { listInvoices } from "@/lib/invoices/data";
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
}): NextAction {
  const {
    projectId,
    approvedEstimateId,
    readinessSnapshot,
    projectEstimatesCount,
    projectContractsCount,
    depositInvoice
  } = input;

  if (projectEstimatesCount === 0) {
    return {
      title: "Create the first estimate",
      description: "Scope and pricing still need to enter the canonical project chain before the commercial handoff can continue.",
      primaryLabel: "Create estimate",
      primaryHref: `/estimates?projectId=${projectId}`
    };
  }

  if (readinessSnapshot?.status === "waiting_on_estimate_approval") {
    return {
      title: "Get estimate approval",
      description: "Estimate work exists, but approval is still the active gate before contracts or readiness can move forward.",
      primaryLabel: "Review estimate",
      primaryHref: readinessSnapshot.estimateId
        ? `/estimates/${readinessSnapshot.estimateId}`
        : `/estimates?projectId=${projectId}`
    };
  }

  if (projectContractsCount === 0 && approvedEstimateId) {
    return {
      title: "Generate the contract",
      description: "An approved estimate exists, so the next step is creating the canonical contract from the same commercial context.",
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
      title: "Complete contract readiness",
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
            depositInvoice?.status === "partially_paid"
              ? "Close the remaining deposit balance"
              : "Collect the deposit",
          description:
            depositInvoice?.status === "partially_paid"
              ? `A deposit payment has already been recorded, but ${formatMoney(
                  depositInvoice.balanceDueAmount
                )} still needs to clear before the commercial handoff is complete.`
              : "A deposit invoice exists, but the commercial handoff will stay blocked until that invoice is paid.",
          primaryLabel: "Review deposit invoice",
          primaryHref: `/invoices/${readinessSnapshot.depositInvoiceId}`
        }
      : {
          title: "Create the deposit request",
          description: "The organization requires a deposit before operations can schedule this work.",
          primaryLabel: "Create deposit invoice",
          primaryHref: `/invoices?projectId=${projectId}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`
        };
  }

  if (readinessSnapshot?.status === "waiting_on_financing") {
    return {
      title: "Resolve financing readiness",
      description: "Financing status is still blocking the operations handoff. Update the project financing state once the commercial outcome is known.",
      secondaryLabel: "Edit project financing below"
    };
  }

  if (readinessSnapshot?.isReadyToSchedule) {
    return {
      title: "Commercial handoff complete",
      description: "This project is ready to schedule. That means operations can take over next, even though actual scheduling UI is intentionally out of scope for this slice.",
      primaryLabel: "Open jobs workspace",
      primaryHref: "/jobs"
    };
  }

  return {
    title: "Review the commercial chain",
    description: "Use the blocker list and readiness stages above to clear the next gate in order, rather than jumping ahead into disconnected downstream work."
  };
}

export default async function ProjectDetailPage({
  params,
  searchParams
}: ProjectDetailPageProps) {
  const { projectId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, customers, estimates, contracts, jobs, invoices, projectOpportunity] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    listCustomers(),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices(),
    getOpportunityByProjectId(projectId, `/projects/${projectId}`)
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
  const completedJob = projectJobs.find((job) => job.status === "completed");
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
    depositInvoice
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
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Project Readiness Hub"
            title={project.name}
            description="Use this page as the authoritative pre-scheduling workspace for sold work. It shows what is blocking progress, what should happen next, and which connected records already exist."
            backHref="/projects"
            backLabel="Back to projects"
            actions={
              <>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/estimates?projectId=${project.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Create estimate
                  </Link>
                  {approvedEstimateId && projectContracts.length === 0 ? (
                    <Link
                      href={`/contracts?estimateId=${approvedEstimateId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Generate contract
                    </Link>
                  ) : null}
                  {readinessSnapshot?.depositRequired && !readinessSnapshot.depositSatisfied ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&estimateId=${approvedEstimateId ?? ""}&workflowRole=deposit`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Create deposit invoice
                    </Link>
                  ) : null}
                  {canCreateInvoice && completedJobId ? (
                    <Link
                      href={`/invoices?projectId=${project.id}&jobId=${completedJobId}`}
                      className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                    >
                      Create invoice
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
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

          <div className="mt-8 rounded-[2rem] border border-brand-200 bg-brand-50/60 px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-700">
                  What this page is for
                </p>
                <p className="text-lg font-semibold text-slate-950">
                  Clear the remaining commercial blockers before operations takes over.
                </p>
                <p className="text-sm leading-6 text-slate-700">{commercialHandoff}</p>
                <p className="text-sm leading-6 text-slate-600">{salesVsOperationsNote}</p>
              </div>

              <WorkspaceSummaryBand
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                itemClassName="rounded-2xl border border-white/70 bg-white/80 px-4 py-4"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "active-blockers",
                    label: "Active blockers",
                    content: (
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {readinessSnapshot?.blockers.length ?? 0}
                      </p>
                    )
                  },
                  {
                    key: "ready-to-schedule",
                    label: "Ready to schedule",
                    content: (
                      <p className="text-sm font-semibold text-slate-950">
                        {formatDateTime(readyToScheduleAt)}
                      </p>
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
                        <p className="mt-1 text-sm text-slate-600">{paymentContinuitySummary}</p>
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

            <div className="mt-6 border-t border-brand-200/70 pt-6">
              <WorkspaceSummaryBand
                className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
                itemClassName="rounded-2xl border border-white/70 bg-white/80 px-5 py-5"
                labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                items={[
                  {
                    key: "current-blockers",
                    label: "Current blockers",
                    content:
                      readinessSnapshot && readinessSnapshot.blockers.length > 0 ? (
                        <ul className="space-y-3 text-sm leading-6 text-slate-600">
                          {readinessSnapshot.blockers.map((blocker) => (
                            <li
                              key={blocker}
                              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
                            >
                              {formatBlockerLabel(blocker)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
                          No active commercial blockers remain. This project is ready for the downstream scheduling slice.
                        </div>
                      )
                  },
                  {
                    key: "next-best-action",
                    label: "Next best action",
                    content: (
                      <NextActionCard
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
                              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                            >
                              {nextAction.secondaryLabel}
                            </Link>
                          ) : nextAction.secondaryLabel ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                              {nextAction.secondaryLabel}
                            </span>
                          ) : undefined
                        }
                        className="space-y-3 text-sm leading-6 text-slate-600"
                      />
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>

        <DetailPanel
          title="Upstream Readiness Chain"
          description="This is the main workspace for the commercial handoff: sales assessment, estimate approval, contract gate, financial readiness, then operational readiness."
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
          title="Connected Records"
          description="These records support the readiness hub, but they stay grouped together so the main workflow decision above keeps visual priority."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Estimates</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Connected estimates support the project workflow but stay secondary to the readiness decision above.
                </p>
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
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Canonical contracts generated from approved estimates in the same project chain.
                </p>
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
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Downstream operational records that should only appear after the project reaches ready-to-schedule handoff.
                </p>
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
                      badge={renderStatusBadge(formatStatusLabel(job.status))}
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
                <p className="text-sm font-medium text-slate-950">Invoices</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Financial records created from connected project and execution context.
                </p>
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
          description="Labor history stays attached to the same project and downstream job context, but it is supporting context rather than the main readiness decision."
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
          description="Project-day field visibility stays connected to the project hub so execution context supports the same canonical workflow chain."
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
          description="Editing remains available here, but it is intentionally lower priority than the readiness workspace above."
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
        <DetailPanel title="Project Context">
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

        {latestProjectContract ? (
          <DetailPanel
            title="Contract Handoff"
            description="The latest contract milestone stays visible here so project readiness reflects the same canonical signature workflow."
          >
            <ContextFactsList
              items={[
                {
                  label: "Latest contract",
                  value: (
                    <Link
                      href={`/contracts/${latestProjectContract.id}`}
                      className="font-medium text-brand-700"
                    >
                      {latestProjectContract.title}
                    </Link>
                  )
                },
                {
                  label: "Current contract state",
                  value: <span className="capitalize">{formatStatusLabel(latestProjectContract.status)}</span>
                },
                {
                  label: "Summary",
                  value: latestContractSummary ?? "Contract continuity available on the contract detail page."
                },
                {
                  label: "Customer signed",
                  value: formatDateTime(latestProjectContract.customerSignedAt)
                },
                {
                  label: "Contractor countersigned",
                  value: formatDateTime(latestProjectContract.contractorCountersignedAt)
                },
                {
                  label: "Final signed",
                  value: formatDateTime(latestProjectContract.signedAt)
                }
              ]}
            />
          </DetailPanel>
        ) : null}

        <DetailPanel
          title="Latest Connected Records"
          description="Use these shortcuts when you need the nearest connected record without leaving the project hub as the primary workspace."
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
                badge={renderStatusBadge(formatStatusLabel(projectJobs[0].status))}
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
            {!projectEstimates[0] &&
            !projectContracts[0] &&
            !projectJobs[0] &&
            !projectInvoices[0] ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                No related estimate, contract, job, or invoice has been created yet.
              </div>
            ) : null}
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
