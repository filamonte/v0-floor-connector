import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { EstimateStatusActions } from "@/components/estimate-status-actions";
import { EstimateApprovalNextStepsPanel } from "@/components/estimates/approval-next-steps-panel";
import { EstimateCustomerTimeline } from "@/components/estimates/estimate-customer-timeline";
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
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import { listContracts } from "@/lib/contracts/data";
import {
  openOrCreateScheduleOfValuesAction,
  sendEstimateToCustomerAction
} from "@/lib/estimates/actions";
import { resolveEstimateApprovalOrchestration } from "@/lib/estimates/approval-orchestration";
import { getEstimateById, listEstimateCustomerEvents } from "@/lib/estimates/data";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { buildScheduleHref } from "@/lib/schedule/links";
import {
  formatScheduleSummaryWindow,
  getScheduleAssignmentSummary,
  getScheduleSummarySortValue
} from "@/lib/schedule/summary";
import { getIncludedEstimateScopeItems } from "@/lib/estimates/workspace";

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatAddress(parts: Array<string | null | undefined>) {
  const filtered = parts.filter((value) => value && value.trim().length > 0);

  return filtered.length > 0 ? filtered.join(", ") : null;
}

function formatUnitLabel(unit: string) {
  const normalized = unit.trim();
  const lower = normalized.toLowerCase();

  if (lower === "sqft" || lower === "sf" || lower === "square foot" || lower === "square feet") {
    return "sqft";
  }

  if (lower === "lf" || lower === "linear foot" || lower === "linear feet") {
    return "lf";
  }

  if (lower === "each" || lower === "ea" || lower === "count") {
    return "ea";
  }

  return normalized || "ea";
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case "sent":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatReadinessLabel(status: string | null) {
  if (!status) {
    return "not started";
  }

  return status.replaceAll("_", " ");
}

function getEstimateNextAction(input: {
  estimateStatus: string;
  projectId: string;
  estimateId: string;
  contractId: string | null;
  readinessStatus: string | null;
  depositInvoiceId: string | null;
}) {
  if (input.estimateStatus !== "approved") {
    return {
      title: "Approve estimate",
      description:
        "Approval is still the active commercial gate before contract and readiness work should continue, and the approval handoff completes through the customer portal.",
      href: `/estimates/${input.estimateId}`,
      label: "Approve estimate"
    };
  }

  if (!input.contractId) {
    return {
      title: "Generate the contract",
      description: "Approved scope is ready to move into the canonical contract workflow.",
      href: `/contracts?estimateId=${input.estimateId}`,
      label: "Generate contract"
    };
  }

  if (input.readinessStatus === "waiting_on_deposit" && input.depositInvoiceId) {
    return {
      title: "Collect the deposit",
      description: "A deposit request exists and the project hub is tracking it as the active blocker.",
      href: `/invoices/${input.depositInvoiceId}`,
      label: "Review deposit invoice"
    };
  }

  return {
    title: "Use the project readiness hub",
    description: "The project page is now the authoritative place to clear contract, signature, and financial blockers in order.",
    href: `/projects/${input.projectId}`,
    label: "Open project workspace"
  };
}

function getEstimateMeaning(status: string) {
  if (status === "approved") {
    return "This proposal has been approved and now anchors the downstream contract, readiness, and billing chain.";
  }

  if (status === "sent") {
    return "This proposal is out for customer review. Keep the estimate body primary here while watching for the approval handoff into contract and project readiness.";
  }

  if (status === "rejected") {
    return "This proposal was rejected. Review the scope and terms here, then decide whether a revised estimate should re-enter the same project chain.";
  }

  return "This proposal is still being prepared. Review the scope and pricing here before moving it into customer-facing approval.";
}

function hasHtmlContent(value: string | null | undefined) {
  return Boolean(value && value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 0);
}

function renderHtmlContent(value: string | null | undefined) {
  if (!hasHtmlContent(value)) {
    return null;
  }

  return <div dangerouslySetInnerHTML={{ __html: value ?? "" }} />;
}

function buildGroupedLineItems(
  estimate: NonNullable<Awaited<ReturnType<typeof getEstimateById>>>
) {
  const groups = estimate.content.itemGroups.map((group) => ({
    id: group.id,
    label: group.label,
    items: [] as typeof estimate.lineItems
  }));
  const groupMap = new Map(
    groups.map((group) => [group.label.trim().toLowerCase(), group] as const)
  );
  const ungrouped = {
    id: null,
    label: "Manual Items",
    items: [] as typeof estimate.lineItems
  };

  estimate.lineItems.forEach((lineItem) => {
    if (lineItem.groupName) {
      const normalizedGroupName = lineItem.groupName.trim().toLowerCase();

      if (normalizedGroupName.length > 0 && !groupMap.has(normalizedGroupName)) {
        const nextGroup = {
          id: `group-${groups.length + 1}`,
          label: lineItem.groupName,
          items: [] as typeof estimate.lineItems
        };

        groups.push(nextGroup);
        groupMap.set(normalizedGroupName, nextGroup);
      }
    }

    const targetGroup =
      (lineItem.groupName
        ? groupMap.get(lineItem.groupName.trim().toLowerCase())
        : null) ?? ungrouped;

    targetGroup.items.push(lineItem);
  });

  return [ungrouped, ...groups].filter((group) => group.items.length > 0);
}

function buildProjectScheduleHref(projectId: string) {
  return buildScheduleHref({ projectId });
}

type EstimateDetailPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
    showNextSteps?: string;
  }>;
};

export default async function EstimateDetailPage({
  params,
  searchParams
}: EstimateDetailPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/estimates/${estimateId}`);
  const [estimate, organizationContext, contracts, jobs, invoices, customerEvents, communicationThreads] =
    await Promise.all([
      getEstimateById(estimateId, `/estimates/${estimateId}`),
      getActiveOrganizationContext(user.id),
      listContracts(),
      listJobs(),
      listInvoices(),
      listEstimateCustomerEvents(estimateId, `/estimates/${estimateId}`),
      listCommunicationThreadsForSubject("estimate", estimateId)
    ]);

  if (!estimate) {
    notFound();
  }

  const estimateContracts = contracts.filter((contract) => contract.estimateId === estimate.id);
  const estimateJobs = jobs.filter((job) => job.estimateId === estimate.id);
  const estimateInvoices = invoices.filter((invoice) => invoice.estimateId === estimate.id);
  const projectJobs = jobs.filter((job) => job.projectId === estimate.projectId);
  const projectJobAssignments = await listJobAssignmentsByJobIds(
    projectJobs.map((job) => job.id),
    `/estimates/${estimate.id}`
  );
  const scheduledProjectJobs = projectJobs.filter((job) => job.dispatchStatus === "scheduled");
  const unscheduledProjectJobs = projectJobs.filter((job) => job.dispatchStatus === "unscheduled");
  const inProgressProjectJobs = projectJobs.filter((job) => job.dispatchStatus === "in_progress");
  const nextScheduledProjectJob =
    [...scheduledProjectJobs]
      .filter((job) => job.scheduledDate)
      .sort((left, right) => getScheduleSummarySortValue(left) - getScheduleSummarySortValue(right))[0] ??
    null;
  const nextScheduledProjectAssignments = nextScheduledProjectJob
    ? projectJobAssignments.get(nextScheduledProjectJob.id) ?? []
    : [];
  const nextScheduledProjectAssignmentNames = nextScheduledProjectAssignments
    .map((assignment) => assignment.person?.displayName ?? assignment.vendor?.name ?? null)
    .filter((value): value is string => Boolean(value));
  const nextScheduledProjectCrewSummary = nextScheduledProjectJob
    ? getScheduleAssignmentSummary({
        assignmentNames: nextScheduledProjectAssignmentNames,
        crewVendorName: nextScheduledProjectJob.crewVendor?.name ?? null,
        assignmentCount: nextScheduledProjectAssignments.length
      })
    : null;
  const projectJobsWithoutAssignments = projectJobs.filter(
    (job) =>
      job.dispatchStatus !== "completed" &&
      (projectJobAssignments.get(job.id)?.length ?? 0) === 0
  );
  const approvalOrchestration =
    estimate.status === "approved"
      ? await resolveEstimateApprovalOrchestration(
          estimate.id,
          `/estimates/${estimate.id}`
        )
      : null;
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: estimate.organizationId,
    projectId: estimate.projectId
  });
  const nextAction = getEstimateNextAction({
    estimateStatus: estimate.status,
    projectId: estimate.projectId,
    estimateId: estimate.id,
    contractId: readinessSnapshot?.contractId ?? estimateContracts[0]?.id ?? null,
    readinessStatus: readinessSnapshot?.status ?? null,
    depositInvoiceId: readinessSnapshot?.depositInvoiceId ?? null
  });

  const customerAddress = estimate.customer
    ? formatAddress([
        estimate.customer.addressLine1,
        estimate.customer.addressLine2,
        estimate.customer.city,
        estimate.customer.stateRegion,
        estimate.customer.postalCode,
        estimate.customer.countryCode
      ])
    : null;

  const projectAddress = estimate.project
    ? formatAddress([
        estimate.project.addressLine1,
        estimate.project.addressLine2,
        estimate.project.city,
        estimate.project.stateRegion,
        estimate.project.postalCode,
        estimate.project.countryCode
      ])
    : null;
  const readinessStatusLabel = formatReadinessLabel(readinessSnapshot?.status ?? null);
  const readinessBlockersLabel =
    readinessSnapshot && readinessSnapshot.blockers.length > 0
      ? readinessSnapshot.blockers.map((blocker) => blocker.replaceAll("_", " ")).join(", ")
      : "No active project-level commercial blockers recorded.";
  const estimateMeaning = getEstimateMeaning(estimate.status);

  return (
    <div className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10 print:hidden">
        <DetailPageHeader
          eyebrow="Estimate Review"
          title={estimate.title ?? estimate.referenceNumber}
          description={estimateMeaning}
          backHref="/estimates"
          backLabel="Back to estimates"
          actions={
            <>
              {estimate.status === "approved" ? (
                <>
                  <Link
                    href={`/contracts?estimateId=${estimate.id}`}
                    className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                  >
                    Generate contract
                  </Link>
                  <Link
                    href={`/projects/${estimate.projectId}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Open project workspace
                  </Link>
                </>
              ) : null}
              <Link
                href={`/estimates/${estimate.id}/edit`}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                  estimate.status === "approved"
                    ? "border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-white"
                    : "bg-brand-700 text-white hover:bg-brand-900"
                  }`}
              >
                Back to edit
              </Link>
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
            className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,1fr)]"
            items={[
              {
                key: "review-purpose",
                label: "Review purpose",
                content: (
                  <div className="space-y-2 text-sm leading-6 text-slate-600">
                    <p className="text-base font-semibold text-slate-950 capitalize">
                      {formatStatusLabel(estimate.status)} estimate
                    </p>
                    <p>{estimateMeaning}</p>
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
                key: "project-readiness",
                label: "Project readiness context",
                content: (
                  <ContextFactsList
                    items={[
                      {
                        label: "Current readiness",
                        value: <span className="capitalize">{readinessStatusLabel}</span>
                      },
                      {
                        label: "Active blockers",
                        value: readinessBlockersLabel
                      },
                      {
                        label: "Authoritative workspace",
                        value: (
                          <Link
                            href={`/projects/${estimate.projectId}`}
                            className="font-medium text-brand-700 transition hover:text-brand-900"
                          >
                            Open the project readiness hub
                          </Link>
                        )
                      }
                    ]}
                  />
                )
              },
              {
                key: "continuity",
                label: "Connected workflow",
                content: (
                  <>
                    <p className="text-sm font-semibold text-slate-950">
                      Proposal continuity stays on the shared project chain
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Use this page to review scope and pricing, send estimate, and hand approved work off to the project and contract workspaces instead of recreating downstream records.
                    </p>
                  </>
                )
              }
            ]}
          />
        </div>

        {estimate.status === "approved" && approvalOrchestration ? (
          <div className="mt-8 print:hidden">
            <EstimateApprovalNextStepsPanel
              orchestration={approvalOrchestration}
              contractAction={quickCreateContractFromEstimateAction}
              invoiceAction={quickCreateInvoiceAction}
              scheduleOfValuesAction={openOrCreateScheduleOfValuesAction}
              initialOpen={resolvedSearchParams.showNextSteps === "1"}
            />
          </div>
        ) : null}
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
                "Estimate prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Estimate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {estimate.title ?? estimate.referenceNumber}
            </p>
            <p className="mt-2 text-sm text-slate-500">Estimate #{estimate.referenceNumber}</p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${getStatusBadgeClassName(
                estimate.status
              )}`}
            >
              {formatStatusLabel(estimate.status)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-slate-200 py-8 md:grid-cols-2">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Customer Contact / Billing Context
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">
                {estimate.customer?.name ?? "Unknown customer"}
              </p>
              {estimate.customer?.companyName ? <p>{estimate.customer.companyName}</p> : null}
              {estimate.customer?.email ? <p>{estimate.customer.email}</p> : null}
              {estimate.customer?.phone ? <p>{estimate.customer.phone}</p> : null}
              {customerAddress ? <p>{customerAddress}</p> : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Project Service Address
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p className="text-lg font-semibold text-slate-950">
                {estimate.project?.name ?? "Unknown project"}
              </p>
              {estimate.project ? (
                <p className="capitalize">
                  Current status: {formatStatusLabel(estimate.project.status)}
                </p>
              ) : null}
              {estimate.project?.description ? <p>{estimate.project.description}</p> : null}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Service location
                </p>
                {projectAddress ? (
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Address line 1</dt>
                      <dd className="font-medium text-slate-800">
                        {estimate.project?.addressLine1 ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Address line 2</dt>
                      <dd className="font-medium text-slate-800">
                        {estimate.project?.addressLine2 ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">City</dt>
                      <dd className="font-medium text-slate-800">
                        {estimate.project?.city ?? "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">State / Postal</dt>
                      <dd className="font-medium text-slate-800">
                        {[estimate.project?.stateRegion, estimate.project?.postalCode]
                          .filter(Boolean)
                          .join(" ") || "Not provided"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No structured project service address is saved yet.
                  </p>
                )}
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  This jobsite address is separate from the customer contact or billing address.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="border-b border-slate-200 py-8">
          <div className="mb-6 print:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Estimate scope
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Review the proposal body, scope, pricing, and terms here. Workflow guidance stays
              above and to the side so this estimate remains the main review surface.
            </p>
          </div>
          <div className="space-y-6">
            {buildGroupedLineItems(estimate).map((group) => (
              <div key={group.id ?? "ungrouped"} className="rounded-3xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {group.label}
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        <th className="pb-2 pr-4">Description</th>
                        <th className="pb-2 pr-4">Qty</th>
                        <th className="pb-2 pr-4">Unit</th>
                        <th className="pb-2 pr-4 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((lineItem) => (
                        <tr key={lineItem.id} className="align-top text-sm leading-6 text-slate-700">
                          <td className="rounded-l-2xl border-y border-l border-slate-200 bg-white px-4 py-4">
                            <p className="font-medium text-slate-950">{lineItem.name}</p>
                            {lineItem.description ? (
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {lineItem.description}
                              </p>
                            ) : null}
                          </td>
                          <td className="border-y border-slate-200 bg-white px-4 py-4">
                            {lineItem.quantity}
                          </td>
                          <td className="border-y border-slate-200 bg-white px-4 py-4">
                            {formatUnitLabel(lineItem.unit)}
                          </td>
                          <td className="border-y border-slate-200 bg-white px-4 py-4 text-right">
                            {formatMoney(lineItem.unitPrice)}
                          </td>
                          <td className="rounded-r-2xl border-y border-r border-slate-200 bg-white px-4 py-4 text-right font-medium text-slate-950">
                            {formatMoney(lineItem.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {hasHtmlContent(estimate.content.scopeSummaryHtml) ||
            getIncludedEstimateScopeItems(estimate.content).length > 0 ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Scope / SOW
                </p>
                <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {renderHtmlContent(estimate.content.scopeSummaryHtml)}
                  {getIncludedEstimateScopeItems(estimate.content).length > 0 ? (
                    <ul className="space-y-2 pl-5">
                      {getIncludedEstimateScopeItems(estimate.content).map((item) => (
                        <li key={item.id}>{item.text}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ) : (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Scope / SOW
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No scope / SOW output has been prepared for this estimate yet.
                </div>
              </section>
            )}

            {hasHtmlContent(estimate.content.termsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Terms / conditions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {renderHtmlContent(estimate.content.termsHtml)}
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.inclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Reusable inclusions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {renderHtmlContent(estimate.content.inclusionsHtml)}
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.exclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Reusable exclusions
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {renderHtmlContent(estimate.content.exclusionsHtml)}
                </div>
              </section>
            ) : null}

            {!hasHtmlContent(estimate.content.termsHtml) &&
            !hasHtmlContent(estimate.content.inclusionsHtml) &&
            !hasHtmlContent(estimate.content.exclusionsHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Reusable estimate content
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No reusable terms, inclusions, or exclusions are filled on this estimate yet.
                </div>
              </section>
            ) : null}

            {hasHtmlContent(estimate.content.notesHtml) ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Notes
                </p>
                <div className="prose prose-slate mt-3 max-w-none rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {renderHtmlContent(estimate.content.notesHtml)}
                </div>
              </section>
            ) : null}

            <DetailPanel
              title="Workflow Actions"
              description="Use the existing send and approval handoff in the right order before moving into contract or billing work."
            >
              {estimate.status === "draft" || estimate.status === "rejected" ? (
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                    {estimate.status === "draft"
                      ? "Send this estimate through the customer portal so FloorConnector can record delivery, email tracking, and the customer approval audit trail."
                      : "This estimate was rejected or returned for revision. After you finish updates, resend it through the customer portal from here."}
                  </div>
                  {estimate.customer?.email ? (
                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                        <p className="font-medium text-slate-950">
                          Send prerequisites
                        </p>
                        <p className="mt-2">
                          This estimate can be sent only after the customer has an
                          authenticated portal user with active access to this project.
                          Manage the portal grant and project visibility on the customer
                          workspace before sending.
                        </p>
                        {estimate.customer ? (
                          <Link
                            href={`/customers/${estimate.customer.id}`}
                            className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Manage customer portal access
                          </Link>
                        ) : null}
                      </div>
                      <form action={sendEstimateToCustomerAction} className="space-y-4">
                        <input type="hidden" name="estimateId" value={estimate.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                        >
                          Send estimate
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                      <p className="font-medium text-amber-950">
                        Customer email is missing on the canonical customer record.
                      </p>
                      <p className="mt-2">
                        Estimate send uses <span className="font-semibold">customer.email</span> on
                        the shared estimate -&gt; customer chain. The People directory is workforce-only
                        and is not used for estimate recipients.
                      </p>
                      <p className="mt-2">
                        Add the direct email on the customer first, or review the linked lead if
                        the contact handoff into the customer record looks incomplete.
                      </p>
                      <p className="mt-2">
                        After the email is saved, confirm the same customer also has an active
                        portal access grant with visibility to this project before retrying send.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {estimate.customer ? (
                          <Link
                            href={`/customers/${estimate.customer.id}`}
                            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                          >
                            Open customer
                          </Link>
                        ) : null}
                        {estimate.opportunity ? (
                          <Link
                            href={`/leads/${estimate.opportunity.id}`}
                            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                          >
                            Review linked lead
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              <EstimateStatusActions estimateId={estimate.id} currentStatus={estimate.status} />
              {estimate.status !== "approved" ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {estimate.status === "sent"
                    ? "Customer approval now happens in the portal. This workspace stays read-only on the decision itself while tracking delivery and response history."
                    : "Jobs and contracts should be created after this estimate reaches the approved state."}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Approved estimates should now move through the project readiness hub for contract,
                  signature, and financial handoff before downstream jobs or standard invoices.
                </p>
              )}
            </DetailPanel>

            <DetailPanel
              title="Customer Timeline"
              description="Track when the estimate was sent, opened, reviewed, commented on, and approved or rejected."
            >
              <EstimateCustomerTimeline events={customerEvents} />
            </DetailPanel>
          </div>

          <aside className="space-y-6">
            <DetailPanel
              title="Connected Workflow"
              description="Project, contract, job, and invoice continuity stays visible here without displacing the proposal as the main review surface."
            >
              <div className="grid gap-4">
                {estimate.project ? (
                  <LinkedRecordCard
                    href={`/projects/${estimate.project.id}`}
                    title={estimate.project.name}
                    subtitle="Project"
                    meta={estimate.customer?.name ?? "Unknown customer"}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(estimate.project.status)}
                      </span>
                    }
                  />
                ) : null}
                {estimateContracts.map((contract) => (
                  <LinkedRecordCard
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    title={contract.title}
                    subtitle="Contract"
                    meta={
                      contract.template?.name
                        ? `${contract.template.name} | return to the project hub for readiness`
                        : "Return to the project hub for readiness"
                    }
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(contract.status)}
                      </span>
                    }
                  />
                ))}
                {estimateJobs.map((job) => (
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
                {estimateInvoices.map((invoice) => (
                  <LinkedRecordCard
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    title={invoice.referenceNumber}
                    subtitle="Invoice"
                    meta={`Balance due ${formatMoney(invoice.balanceDueAmount)} | project hub governs handoff`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(invoice.status)}
                      </span>
                    }
                  />
                ))}
                {estimateContracts.length === 0 && estimateJobs.length === 0 && estimateInvoices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No downstream contract, job, or invoice records are linked to this estimate yet. Use the project readiness hub once this estimate is approved.
                  </p>
                ) : null}
              </div>
            </DetailPanel>

            <DetailPanel
              title={estimate.status === "approved" ? "Production Schedule" : "Schedule Handoff"}
              description={
                estimate.status === "approved"
                  ? "Compact production context from canonical project jobs and job assignments, with scheduling work still handed off to the shared schedule workspace."
                  : "Scheduling does not start from draft or sent estimates. Approval and project readiness handoff come first, so this page stays explicit about that blocker."
              }
            >
              <div className="space-y-4 text-sm leading-6 text-slate-600">
                {estimate.status === "approved" ? (
                  <>
                    <ScheduleContextMetrics
                      items={[
                        { label: "Scheduled", value: scheduledProjectJobs.length },
                        { label: "Unscheduled", value: unscheduledProjectJobs.length },
                        { label: "In progress", value: inProgressProjectJobs.length }
                      ]}
                    />

                    {nextScheduledProjectJob ? (
                      <ScheduleContextFocusCard
                        eyebrow={
                          nextScheduledProjectJob.dispatchStatus === "in_progress"
                            ? "Work in progress"
                            : "Next scheduled job"
                        }
                        title={
                          nextScheduledProjectJob.project?.name ??
                          estimate.project?.name ??
                          "Project job"
                        }
                        titleHref={`/jobs/${nextScheduledProjectJob.id}`}
                        statusLabel={formatStatusLabel(nextScheduledProjectJob.dispatchStatus)}
                        summary={formatScheduleSummaryWindow({
                          scheduledDate: nextScheduledProjectJob.scheduledDate,
                          scheduledStartAt: nextScheduledProjectJob.scheduledStartAt,
                          scheduledEndAt: nextScheduledProjectJob.scheduledEndAt
                        })}
                        detailRows={[
                          {
                            label: "Crew",
                            value:
                              nextScheduledProjectAssignments.length > 0
                                ? nextScheduledProjectCrewSummary
                                : nextScheduledProjectJob.dispatchStatus === "scheduled"
                                  ? "Scheduled, but crew assignment still needs to be confirmed"
                                  : nextScheduledProjectCrewSummary
                          }
                        ]}
                      />
                    ) : (
                      <ScheduleContextNotice
                        eyebrow={projectJobs.length > 0 ? "Ready for scheduling" : "No jobs yet"}
                        title={
                          projectJobs.length > 0
                            ? "Approved work exists, but no schedule commitment is set yet"
                            : "No production jobs are linked to this estimate's project yet"
                        }
                      >
                        {projectJobs.length > 0
                          ? "This estimate is approved and project jobs already exist, but they are still unscheduled. The next production commitment will show here once a real date is attached."
                          : "Approval is complete, but downstream production jobs have not been created yet on the canonical project chain."}
                      </ScheduleContextNotice>
                    )}

                    <ContextFactsList
                      items={[
                        {
                          label: "Project link",
                          value: estimate.project ? (
                            <Link
                              href={`/projects/${estimate.project.id}`}
                              className="font-medium text-brand-700"
                            >
                              {estimate.project.name}
                            </Link>
                          ) : (
                            "Project context unavailable"
                          )
                        },
                        {
                          label: "Crew assignment state",
                          value:
                            nextScheduledProjectJob && nextScheduledProjectCrewSummary
                              ? nextScheduledProjectCrewSummary
                              : projectJobsWithoutAssignments.length > 0
                                ? `${projectJobsWithoutAssignments.length} job${
                                    projectJobsWithoutAssignments.length === 1 ? "" : "s"
                                  } still need crew assignment rows`
                                : projectJobs.length > 0
                                  ? "Crew coverage is already attached where needed"
                                  : "No project jobs yet"
                        }
                      ]}
                    />

                    <ScheduleContextActions
                      actions={[
                        ...(nextScheduledProjectJob
                          ? [
                              {
                                href: `/jobs/${nextScheduledProjectJob.id}`,
                                label: "Open next scheduled job" as const
                              }
                            ]
                          : []),
                        {
                          href: buildProjectScheduleHref(estimate.projectId),
                          label: "Open schedule",
                          variant: "subtle"
                        }
                      ]}
                    />
                  </>
                ) : (
                  <ScheduleContextNotice
                    eyebrow="Approval blocker"
                    title={
                      estimate.status === "sent"
                        ? "Production scheduling starts after customer approval"
                        : estimate.status === "rejected"
                          ? "Rejected estimates do not enter production scheduling"
                          : "Draft estimates do not enter production scheduling"
                    }
                    tone="warning"
                  >
                    {estimate.status === "sent"
                      ? "This estimate is still waiting on customer approval. Keep scheduling blocked until approval lands and the downstream project readiness handoff is clear."
                      : estimate.status === "rejected"
                        ? "Revise and re-approve this estimate before any production scheduling context should apply."
                        : "Finish scope, send for customer review, and wait for approval before production scheduling context should appear here."}
                  </ScheduleContextNotice>
                )}
              </div>
            </DetailPanel>

            <DetailPanel
              title="Pricing Snapshot"
              description="Keep the commercial total easy to scan while the proposal body above remains the primary review surface."
            >
              <dl className="space-y-3 text-sm leading-6 text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(estimate.subtotalAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Discount</dt>
                  <dd>-{formatMoney(estimate.discountAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Tax</dt>
                  <dd>{formatMoney(estimate.taxAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                  <dt>Total</dt>
                  <dd>{formatMoney(estimate.totalAmount)}</dd>
                </div>
              </dl>
            </DetailPanel>

            <RelatedConversationsCard
              source="estimate"
              description="Estimate communication stays on canonical threads and routes back into the shared communications workspace when proposal follow-through is needed."
              countLabel="Estimate threads"
              emptyMessage="No estimate-scoped communication threads are attached to this canonical estimate yet."
              actionClassName="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              threads={communicationThreads}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
