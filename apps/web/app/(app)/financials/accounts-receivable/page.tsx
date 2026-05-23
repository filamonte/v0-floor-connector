import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getFinancialCollectionsReadModel } from "@/lib/financials/collections-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

function formatMoney(amount: string | number) {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default async function AccountsReceivablePage() {
  const user = await requireAuthenticatedUser(
    "/financials/accounts-receivable"
  );
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Accounts Receivable needs an active organization before receivables can
        be reviewed.
      </section>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const readModel = await getFinancialCollectionsReadModel({
    organizationId: organizationContext.organization.id,
    todayIso
  });
  const financialControl = readModel.financialControl;
  const invoiceAttentionById = new Map(
    financialControl.invoicesNeedingAttention.map((invoice) => [
      invoice.id,
      invoice
    ])
  );

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounts Receivable"
      description="Review open balances, overdue invoices, pending checkout activity, and payment attention."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open balance
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.openReceivablesAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.overdueAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Partially paid
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {financialControl.partiallyPaidCount}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Payment attention
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {financialControl.failedPaymentCount +
                financialControl.paymentRequestedCount}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This AR workspace is a reporting and collections lens only. It does
            not create invoices, payments, collection notes, accounting entries,
            or external payment operations.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href="/financials"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Back to Financials Home
            </Link>
            <Link
              href="/invoices?status=open"
              className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Open invoices
            </Link>
          </>
        )
      }}
    >
      <div className="space-y-4">
        <section className="border border-[#d6d6d6] bg-white px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Next Move
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {financialControl.nextMove.label}
              </h2>
              <p className="mt-1 max-w-[72ch] text-sm leading-6 text-slate-500">
                {financialControl.nextMove.reason}
              </p>
            </div>
            <Link
              href={financialControl.nextMove.href}
              className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Open next move
            </Link>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Collections queue
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Invoices needing attention
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ordered by payment urgency, due date, and balance. Each row
                links back to the Invoice Workspace for payment follow-through.
              </p>
            </div>

            {readModel.collectionOpportunities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Customer / project</th>
                      <th className="px-5 py-3">Next Move</th>
                      <th className="px-5 py-3">Context</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {readModel.collectionOpportunities.map((invoice) => {
                      const attention = invoiceAttentionById.get(invoice.id);

                      return (
                        <tr key={invoice.id} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-semibold text-slate-950 transition hover:text-brand-700"
                            >
                              {invoice.referenceNumber}
                            </Link>
                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                              {formatStatusLabel(invoice.status)} /{" "}
                              {formatStatusLabel(invoice.workflowRole)}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-700">
                              {invoice.customer?.name ?? "Unknown customer"}
                            </p>
                            {invoice.project ? (
                              <Link
                                href={`/projects/${invoice.project.id}`}
                                className="mt-1 block text-sm leading-6 text-brand-700 transition hover:text-brand-800"
                              >
                                {invoice.project.name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                No project
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-medium text-brand-700 transition hover:text-brand-800"
                            >
                              {attention?.nextMoveLabel ?? "Review invoice"}
                            </Link>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {attention?.reason ??
                                "Open balance still needs follow-through."}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            <p>
                              {invoice.dueDate
                                ? `Due ${formatDate(invoice.dueDate)}`
                                : "No due date"}
                            </p>
                            <p className="mt-1">
                              {invoice.estimate
                                ? `Estimate ${invoice.estimate.referenceNumber}`
                                : "No estimate link"}
                              {invoice.job ? " / job linked" : ""}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-950">
                            {formatMoney(invoice.balanceDueAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8">
                <AppEmptyState
                  eyebrow="No open receivables"
                  title="Nothing is collectible right now"
                  description="Open invoice balances will appear here with customer, project, and payment context when collection work is needed."
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Aging
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Receivable buckets
                </h3>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {readModel.summary.agingBuckets.map((bucket) => (
                  <div
                    key={bucket.key}
                    className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">
                        {bucket.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {bucket.invoiceCount} invoice
                        {bucket.invoiceCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatMoney(bucket.balanceAmount)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Project collections
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Project attention
                </h3>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {financialControl.projectCollectionAttention.length > 0 ? (
                  financialControl.projectCollectionAttention.map((project) => (
                    <Link
                      key={project.id}
                      href={project.href}
                      className="block px-5 py-4 transition hover:bg-[#f8f8f8]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#171717]">
                            {project.projectName}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {project.customerName}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                            {project.nextMoveLabel} / {project.reason}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatMoney(project.openBalanceAmount)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                    No projects need collection attention right now.
                  </div>
                )}
              </div>
            </section>
          </section>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Pending activity
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Checkout and pending payments
              </h3>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {readModel.pendingPayments.length > 0 ? (
                readModel.pendingPayments.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/invoices/${payment.invoiceId}`}
                    className="block px-5 py-4 transition hover:bg-[#f8f8f8]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#171717]">
                          {payment.invoice?.referenceNumber ??
                            "Pending payment"}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {payment.customer?.name ?? "Unknown customer"} -{" "}
                          {payment.project?.name ?? "No project"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {payment.gatewayProvider ?? payment.paymentMethod}
                          {payment.gatewayStatus
                            ? ` / ${payment.gatewayStatus}`
                            : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatMoney(payment.amount)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No pending payments are waiting on a customer or payment
                  outcome.
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Payment attention
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Payment Trail items
              </h3>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {financialControl.paymentEventsNeedingReview.length > 0 ? (
                financialControl.paymentEventsNeedingReview.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="block px-5 py-4 transition hover:bg-[#f8f8f8]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#171717]">
                          {event.invoiceReference}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {event.customerName} - {event.projectName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {formatDateTime(event.occurredAt)}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-500">
                          {event.reason}
                        </p>
                      </div>
                      <span className="rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {event.nextMoveLabel}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No failed, voided, or in-progress Payment Trail items need
                  review.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
