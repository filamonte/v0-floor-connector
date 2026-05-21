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

function getEventLabel(value: string) {
  switch (value) {
    case "payment_requested":
      return "Payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_failed":
      return "Payment failed";
    case "payment_voided":
      return "Payment voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(value);
  }
}

export default async function AccountsReceivablePage() {
  const user = await requireAuthenticatedUser(
    "/financials/accounts-receivable"
  );
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Accounts Receivable needs an active organization before receivables can be
        reviewed.
      </section>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const readModel = await getFinancialCollectionsReadModel({
    organizationId: organizationContext.organization.id,
    todayIso
  });

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounts Receivable"
      description="Review open balances, overdue invoices, pending checkout activity, and payment-event exceptions from the canonical invoice and payment chain."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open balance
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.openReceivableAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.overdueReceivableAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Partially paid
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.partiallyPaidAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Event attention
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {readModel.summary.failedOrVoidedEventCount +
                readModel.summary.pendingEventCount}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This AR workspace is a reporting and collections lens only. It does not
            create invoices, payments, collection notes, accounting entries, or provider
            operations.
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
                Ordered by due date and balance. Each row links back to the canonical
                Invoice Workspace for actual payment or follow-up work.
              </p>
            </div>

            {readModel.collectionOpportunities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Customer / project</th>
                      <th className="px-5 py-3">Context</th>
                      <th className="px-5 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {readModel.collectionOpportunities.map((invoice) => (
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
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {invoice.project?.name ?? "No project"}
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
                    ))}
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
                          {payment.invoice?.referenceNumber ?? "Pending payment"}
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
                  No pending payments are waiting on a provider or customer outcome.
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Reconciliation attention
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Payment events
              </h3>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {readModel.attentionEvents.length > 0 ? (
                readModel.attentionEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/invoices/${event.invoiceId}`}
                    className="block px-5 py-4 transition hover:bg-[#f8f8f8]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#171717]">
                          {event.invoice?.referenceNumber ?? "Payment event"}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {event.customer?.name ?? "Unknown customer"} -{" "}
                          {event.project?.name ?? "No project"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {formatDateTime(event.occurredAt)}
                          {event.gatewayProvider
                            ? ` / ${event.gatewayProvider}`
                            : ""}
                        </p>
                      </div>
                      <span className="rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {getEventLabel(event.eventType)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No failed, voided, or in-progress payment events need review.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
