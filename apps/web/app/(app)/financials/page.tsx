import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
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

function formatEventLabel(value: string) {
  switch (value) {
    case "payment_requested":
      return "Payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_failed":
      return "Failed";
    case "payment_voided":
      return "Voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(value);
  }
}

export default async function FinancialsHomePage() {
  const user = await requireAuthenticatedUser("/financials");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Financial workflows need an active organization before balances and payment
        activity can be reviewed.
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
      title={`Financial control panel for ${organizationContext.organization.displayName}`}
      description="Scan cross-project billing pressure, collections opportunities, pending payment activity, and provider event attention without creating a second finance system."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open receivables
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.openReceivableAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue amount
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.overdueReceivableAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Pending payments
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.pendingPaymentAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Posted collections
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.summary.recordedPaymentAmount)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Financials Home is a read-only control panel over canonical invoices,
            payments, and payment events. Record-level work still happens in
            Invoices, Payments, and Progress Billing.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href="/financials/accounts-receivable"
              className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Open AR
            </Link>
            <Link
              href="/payments"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Open payments
            </Link>
          </>
        )
      }}
    >
      <div className="space-y-4">
        <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-3">
          <ManagerDashboardCard
            eyebrow="Collections"
            title="Overdue invoices"
            description="Past-due canonical invoices with balance still owed."
            actionHref="/financials/accounts-receivable"
            actionLabel="Review AR"
            items={readModel.overdueInvoices.slice(0, 5).map((invoice) => ({
              href: `/invoices/${invoice.id}`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "No project"}`,
              meta: invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date",
              badge: formatStatusLabel(invoice.status),
              trailing: formatMoney(invoice.balanceDueAmount)
            }))}
            emptyTitle="No overdue invoices need follow-up right now."
            emptyDescription="Past-due balances will surface here for collections review."
          />

          <ManagerDashboardCard
            eyebrow="Payment activity"
            title="Pending checkout"
            description="Canonical pending payments and checkout activity that still need provider or customer outcome review."
            actionHref="/payments?status=pending"
            actionLabel="Open pending"
            items={readModel.pendingPayments.slice(0, 5).map((payment) => ({
              href: `/invoices/${payment.invoiceId}`,
              title: payment.invoice?.referenceNumber ?? "Pending payment",
              subtitle: `${payment.customer?.name ?? "Unknown customer"} - ${payment.project?.name ?? "No project"}`,
              meta: payment.gatewayProvider ?? payment.paymentMethod,
              badge: payment.gatewayStatus ?? "pending",
              trailing: formatMoney(payment.amount)
            }))}
            emptyTitle="No pending checkout activity."
            emptyDescription="Pending canonical payments will appear here without creating a separate checkout ledger."
          />

          <ManagerDashboardCard
            eyebrow="Reconciliation"
            title="Payment events needing review"
            description="Failed, voided, or in-progress provider events tied back to invoices."
            actionHref="/payments"
            actionLabel="Open payments"
            items={readModel.attentionEvents.slice(0, 5).map((event) => ({
              href: `/invoices/${event.invoiceId}`,
              title: event.invoice?.referenceNumber ?? "Payment event",
              subtitle: `${event.customer?.name ?? "Unknown customer"} - ${event.project?.name ?? "No project"}`,
              meta: event.gatewayProvider ?? event.payment?.gatewayProvider ?? "Payment event",
              badge: formatEventLabel(event.eventType),
              trailing: event.invoice
                ? formatMoney(event.invoice.balanceDueAmount)
                : null
            }))}
            emptyTitle="No failed, voided, or in-progress events need review."
            emptyDescription="Provider-backed exceptions will appear here from immutable payment events."
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <section className="border border-[#d6d6d6] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Receivables
                </p>
                <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
                  Collection opportunities
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Highest-priority open balances with customer, project, estimate, and
                  job context where those canonical links exist.
                </p>
              </div>
              <Link
                href="/financials/accounts-receivable"
                className="inline-flex shrink-0 items-center border border-[#d6d6d6] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:bg-white"
              >
                Open AR
              </Link>
            </div>

            <div className="hidden grid-cols-[minmax(0,1.1fr)_1fr_100px_130px] gap-4 border-b border-[#e5e5e5] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666666] md:grid">
              <span>Invoice</span>
              <span>Customer / project</span>
              <span className="text-right">Due</span>
              <span className="text-right">Balance</span>
            </div>

            <div className="divide-y divide-[#e5e5e5]">
              {readModel.collectionOpportunities.length > 0 ? (
                readModel.collectionOpportunities.slice(0, 8).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="grid gap-2 px-4 py-3 transition hover:bg-[#f8f8f8] md:grid-cols-[minmax(0,1.1fr)_1fr_100px_130px] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#171717]">
                        {invoice.referenceNumber}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#666666]">
                        {formatStatusLabel(invoice.workflowRole)} invoice
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-700">
                        {invoice.customer?.name ?? "Unknown customer"}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {invoice.project?.name ?? "No project"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 md:text-right">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : "No due date"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 md:text-right">
                      {formatMoney(invoice.balanceDueAmount)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-5">
                  <p className="text-sm font-semibold text-[#171717]">
                    No open receivables are waiting right now.
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Outstanding invoice balances will appear here as billing moves
                    through send and payment collection.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Receivable mix
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
                Aging and invoice roles
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Derived at read time from invoices and payments. No separate AR
                ledger, accounting subsystem, or provider sync is introduced.
              </p>
            </div>

            <div className="divide-y divide-[#e5e5e5]">
              {readModel.summary.agingBuckets.map((bucket) => (
                <div
                  key={bucket.key}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3"
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
              <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                <p className="text-sm font-semibold text-[#171717]">
                  Deposit invoices
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(readModel.summary.depositReceivableAmount)}
                </p>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                <p className="text-sm font-semibold text-[#171717]">
                  Standard invoices
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatMoney(readModel.summary.standardReceivableAmount)}
                </p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
