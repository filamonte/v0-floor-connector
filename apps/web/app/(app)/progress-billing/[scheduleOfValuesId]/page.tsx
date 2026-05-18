import Link from "next/link";
import { notFound } from "next/navigation";

import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPanel } from "@/components/detail-panel";
import { LinkedRecordCard } from "@/components/linked-record-card";
import { ProgressBillingForm } from "@/components/progress-billing-form";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { buildProgressBillingInvoiceAction } from "@/lib/progress-billing/actions";
import { getProgressBillingWorkspaceById } from "@/lib/progress-billing/data";

type ProgressBillingDetailPageProps = {
  params: Promise<{
    scheduleOfValuesId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getDefaultIssueDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().slice(0, 10);
}

export default async function ProgressBillingDetailPage({
  params,
  searchParams
}: ProgressBillingDetailPageProps) {
  const { scheduleOfValuesId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const workspace = await getProgressBillingWorkspaceById(
    scheduleOfValuesId,
    `/progress-billing/${scheduleOfValuesId}`
  );

  if (!workspace) {
    notFound();
  }

  return (
    <ContractorWorkspacePage
      eyebrow="Progress billing workspace"
      title={workspace.project?.name ?? "Schedule of values"}
      description="Review approved-scope billing continuity, update percent-complete state, and build the canonical draft invoice from this one workspace."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Scheduled value
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(workspace.scheduledValueTotal)}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Previously billed
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(workspace.previouslyBilledTotal)}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Current billing
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(workspace.currentBillableTotal)}
            </p>
          </div>
          <div className="border border-[#e4d7c9] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#7b6959]">
              Balance to finish
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#2b2118]">
              {formatMoney(workspace.balanceToFinishTotal)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This workspace stays on the same approved estimate, project, and
            invoice chain. Progress billing is real here now, but the resulting
            bill still lives on the canonical invoice record.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href={`/projects/${workspace.projectId}`}
              className="inline-flex items-center rounded-[4px] border border-[#e2d4c5] bg-white px-4 py-2.5 text-sm font-medium text-[#6b5442] transition hover:bg-[#fdf7ef]"
            >
              Open project
            </Link>
            {workspace.draftProgressInvoice ? (
              <Link
                href={`/invoices/${workspace.draftProgressInvoice.id}`}
                className="inline-flex items-center rounded-[4px] border border-[#2b2118] bg-[#2b2118] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1f1812]"
              >
                Open draft invoice
              </Link>
            ) : null}
          </>
        )
      }}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
        <section className="space-y-6">
          {resolvedSearchParams.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
              {resolvedSearchParams.error}
            </div>
          ) : null}

          {resolvedSearchParams.message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
              {resolvedSearchParams.message}
            </div>
          ) : null}

          <DetailPanel
            title="Build Progress Invoice"
            description="Percent complete is the contractor-side input here. Previously billed, current billing, retainage, and balance are derived from the canonical schedule-of-values and invoice chain."
          >
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              {[
                {
                  label: "1. Source",
                  value: "Approved snapshot",
                  detail:
                    "SOV rows stay sourced from approved estimate or change-order snapshot items."
                },
                {
                  label: "2. Review",
                  value: "Percent complete",
                  detail:
                    "Only completion inputs are entered here; billed totals and retainage are derived."
                },
                {
                  label: "3. Handoff",
                  value: "Draft invoice",
                  detail:
                    "The draw becomes or updates a canonical invoice before collection."
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[#e4d7c9] bg-[#fdfaf6] px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6a4f]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#2b2118]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#665446]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <ProgressBillingForm
              action={buildProgressBillingInvoiceAction}
              scheduleOfValuesId={workspace.id}
              issueDateDefault={
                workspace.draftProgressInvoice?.issueDate ??
                getDefaultIssueDate()
              }
              dueDateDefault={
                workspace.draftProgressInvoice?.dueDate ?? getDefaultDueDate()
              }
              notesDefault={workspace.draftProgressInvoice?.notes ?? null}
              draftInvoice={
                workspace.draftProgressInvoice
                  ? {
                      id: workspace.draftProgressInvoice.id,
                      referenceNumber:
                        workspace.draftProgressInvoice.referenceNumber
                    }
                  : null
              }
              items={workspace.items.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                scheduledValueAmount: item.scheduledValueAmount,
                percentComplete: item.percentComplete,
                minimumAllowedPercentComplete:
                  item.minimumAllowedPercentComplete,
                previousBilledAmount: item.previousBilledAmount,
                retainagePercentage: item.retainagePercentage
              }))}
            />
          </DetailPanel>

          <DetailPanel
            title="Progress invoices"
            description="These invoices were built from the same schedule-of-values workspace and stay on the canonical financial chain."
          >
            <div className="grid gap-4">
              {workspace.progressInvoices.length > 0 ? (
                workspace.progressInvoices.map((invoice) => (
                  <LinkedRecordCard
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    title={invoice.referenceNumber}
                    subtitle={`Issue ${new Date(`${invoice.issueDate}T00:00:00`).toLocaleDateString()}`}
                    meta={`Status ${formatStatusLabel(invoice.status)} | Total ${formatMoney(invoice.totalAmount)} | Balance ${formatMoney(invoice.balanceDueAmount)}`}
                    badge={
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {formatStatusLabel(invoice.status)}
                      </span>
                    }
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  No progress invoices have been created from this schedule of
                  values yet.
                </div>
              )}
            </div>
          </DetailPanel>
        </section>

        <aside className="space-y-6">
          <DetailPanel
            title="Connected records"
            description="Keep progress billing grounded in the same approved scope, project continuity, and billing chain."
          >
            <div className="grid gap-4">
              {workspace.project ? (
                <LinkedRecordCard
                  href={`/projects/${workspace.project.id}`}
                  title={workspace.project.name}
                  subtitle="Project"
                  meta={workspace.customer?.name ?? "Unknown customer"}
                  badge={
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {formatStatusLabel(workspace.project.status)}
                    </span>
                  }
                />
              ) : null}
              {workspace.estimate ? (
                <LinkedRecordCard
                  href={`/estimates/${workspace.estimate.id}`}
                  title={workspace.estimate.referenceNumber}
                  subtitle="Approved estimate"
                  meta="Approved estimate scope remains the source of truth for this schedule of values."
                  badge={
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {formatStatusLabel(workspace.estimate.status)}
                    </span>
                  }
                />
              ) : null}
              {workspace.draftProgressInvoice ? (
                <LinkedRecordCard
                  href={`/invoices/${workspace.draftProgressInvoice.id}`}
                  title={workspace.draftProgressInvoice.referenceNumber}
                  subtitle="Draft progress invoice"
                  meta="This draft is updated in place from the same SOV workspace instead of duplicating draft billing state."
                />
              ) : null}
            </div>
          </DetailPanel>

          <DetailPanel
            title="Billing context"
            description="Compact facts for the current contractor-side progress billing state."
          >
            <ContextFactsList
              items={[
                {
                  label: "Customer",
                  value: workspace.customer?.name ?? "Unknown customer"
                },
                {
                  label: "Estimate",
                  value:
                    workspace.estimate?.referenceNumber ?? "Approved estimate"
                },
                {
                  label: "Workspace status",
                  value: (
                    <span className="capitalize">
                      {formatStatusLabel(workspace.status)}
                    </span>
                  )
                },
                {
                  label: "Weighted completion",
                  value: `${workspace.weightedPercentComplete}%`
                },
                {
                  label: "Retainage default",
                  value: `${workspace.retainagePercentageDefault}%`
                },
                {
                  label: "Progress invoices",
                  value: String(workspace.progressInvoices.length)
                },
                {
                  label: "Billing model",
                  value: workspace.billingModel
                },
                {
                  label: "Source estimate status",
                  value: (
                    <span className="capitalize">
                      {formatStatusLabel(workspace.sourceEstimateStatus)}
                    </span>
                  )
                }
              ]}
            />
          </DetailPanel>
        </aside>
      </div>
    </ContractorWorkspacePage>
  );
}
