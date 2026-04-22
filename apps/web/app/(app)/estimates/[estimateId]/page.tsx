import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { EstimateStatusActions } from "@/components/estimate-status-actions";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { getEstimateById } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";

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
      title: "Get estimate approval",
      description: "Approval is still the main commercial gate before contract and readiness work should continue.",
      href: `/estimates/${input.estimateId}`,
      label: "Stay on estimate review"
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
    label: "Open project readiness hub"
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

type EstimateDetailPageProps = {
  params: Promise<{
    estimateId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function EstimateDetailPage({
  params,
  searchParams
}: EstimateDetailPageProps) {
  const { estimateId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser(`/estimates/${estimateId}`);
  const [estimate, organizationContext, contracts, jobs, invoices] = await Promise.all([
    getEstimateById(estimateId, `/estimates/${estimateId}`),
    getActiveOrganizationContext(user.id),
    listContracts(),
    listJobs(),
    listInvoices()
  ]);

  if (!estimate) {
    notFound();
  }

  const estimateContracts = contracts.filter((contract) => contract.estimateId === estimate.id);
  const estimateJobs = jobs.filter((job) => job.estimateId === estimate.id);
  const estimateInvoices = invoices.filter((invoice) => invoice.estimateId === estimate.id);
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
          title={estimate.referenceNumber}
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
                    Open project readiness hub
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
                Edit estimate
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
                      Use this page to review scope and pricing, then hand off to the project and contract workspaces instead of recreating downstream records.
                    </p>
                  </>
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
                "Estimate prepared inside the active organization workspace."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Estimate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {estimate.referenceNumber}
            </p>
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
              Customer
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
              Project
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
              {projectAddress ? <p>{projectAddress}</p> : null}
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
                {estimate.lineItems.map((lineItem) => (
                  <tr key={lineItem.id} className="align-top text-sm leading-6 text-slate-700">
                    <td className="rounded-l-2xl border-y border-l border-slate-200 bg-slate-50/60 px-4 py-4">
                      <p className="font-medium text-slate-950">{lineItem.name}</p>
                      {lineItem.description ? (
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {lineItem.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4">
                      {lineItem.quantity}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4">
                      {lineItem.unit}
                    </td>
                    <td className="border-y border-slate-200 bg-slate-50/60 px-4 py-4 text-right">
                      {formatMoney(lineItem.unitPrice)}
                    </td>
                    <td className="rounded-r-2xl border-y border-r border-slate-200 bg-slate-50/60 px-4 py-4 text-right font-medium text-slate-950">
                      {formatMoney(lineItem.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {estimate.notes ? (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Notes and Terms
                </p>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-sm leading-7 text-slate-700">
                  {estimate.notes}
                </div>
              </section>
            ) : (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Notes and Terms
                </p>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                  No additional notes or terms have been added to this estimate yet.
                </div>
              </section>
            )}

            <DetailPanel
              title="Workflow Actions"
              description="Move the estimate through the commercial workflow while keeping downstream actions in the right order."
            >
              <EstimateStatusActions estimateId={estimate.id} currentStatus={estimate.status} />
              {estimate.status !== "approved" ? (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Jobs and contracts should be created after this estimate reaches the approved state.
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Approved estimates should now move through the project readiness hub for contract,
                  signature, and financial handoff before downstream jobs or standard invoices.
                </p>
              )}
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
          </aside>
        </div>
      </section>
    </div>
  );
}
