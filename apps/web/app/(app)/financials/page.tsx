import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listInvoices } from "@/lib/invoices/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPayments } from "@/lib/payments/data";

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

  const [invoices, payments] = await Promise.all([listInvoices(), listPayments()]);
  const todayIso = new Date().toISOString().slice(0, 10);

  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = openInvoices
    .filter((invoice) => invoice.dueDate !== null && invoice.dueDate < todayIso)
    .sort((left, right) => {
      const dueComparison = (left.dueDate ?? "").localeCompare(right.dueDate ?? "");

      if (dueComparison !== 0) {
        return dueComparison;
      }

      return right.balanceDueAmount.localeCompare(left.balanceDueAmount);
    });
  const recordedPayments = payments
    .filter((payment) => payment.status === "recorded")
    .sort((left, right) => {
      const paymentDateComparison = right.paymentDate.localeCompare(left.paymentDate);

      if (paymentDateComparison !== 0) {
        return paymentDateComparison;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });
  const openReceivables = openInvoices
    .slice()
    .sort((left, right) => Number(right.balanceDueAmount) - Number(left.balanceDueAmount));

  const overdueInvoiceAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );
  const recentPaymentsAmount = recordedPayments
    .slice(0, 5)
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const openReceivableAmount = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title={`Financial control panel for ${organizationContext.organization.displayName}`}
      description="Use Financials Home to scan cross-project billing pressure, confirm recent cash movement, and route into the existing invoice and payment managers without creating a second finance dashboard."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue invoices
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {overdueInvoices.length}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue amount
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(overdueInvoiceAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open receivables
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(openReceivableAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Recent cash in
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(recentPaymentsAmount)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Financials Home is the section entry point for billing and cash visibility.
            Use it to decide whether the next action belongs in Invoices, Payments,
            Progress Billing, AR, or AP.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href="/invoices"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Open invoices
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
        <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
          <ManagerDashboardCard
            eyebrow="Collections"
            title="Overdue invoices"
            description="Invoices already past due that still need payment follow-up inside the canonical billing workflow."
            actionHref="/invoices?status=open"
            actionLabel="Open invoices"
            items={overdueInvoices.slice(0, 5).map((invoice) => ({
              href: `/invoices/${invoice.id}/edit`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} · ${invoice.project?.name ?? "No project"}`,
              meta: invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date",
              badge: formatStatusLabel(invoice.status),
              trailing: formatMoney(invoice.balanceDueAmount)
            }))}
            emptyTitle="No overdue invoices need follow-up right now."
            emptyDescription="Open balances that move past due will surface here so teams can jump into the invoice workspace quickly."
          />

          <ManagerDashboardCard
            eyebrow="Cash activity"
            title="Recent payments"
            description="Latest recorded payments on canonical invoices so recent cash movement stays visible at the section level."
            actionHref="/payments"
            actionLabel="Open payments"
            items={recordedPayments.slice(0, 5).map((payment) => ({
              href: payment.invoice?.id ? `/invoices/${payment.invoice.id}` : "/payments",
              title: payment.invoice?.referenceNumber ?? "Recorded payment",
              subtitle: `${payment.customer?.name ?? "Unknown customer"} · ${payment.project?.name ?? "No project"}`,
              meta: `${formatDate(payment.paymentDate)} · ${payment.paymentMethod}`,
              badge: "Recorded",
              trailing: formatMoney(payment.amount)
            }))}
            emptyTitle="No recorded payments yet."
            emptyDescription="Once payments are recorded against invoices, the latest activity will appear here."
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
                  Open receivables
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Highest open invoice balances still owed to the business. This is a
                  visibility layer on top of existing invoice records, not a separate AR
                  ledger.
                </p>
              </div>
              <Link
                href="/financials/accounts-receivable"
                className="inline-flex shrink-0 items-center border border-[#d6d6d6] bg-[#f7f8fa] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:bg-white"
              >
                AR definition
              </Link>
            </div>

            <div className="hidden grid-cols-[minmax(0,1.2fr)_1fr_120px_130px] gap-4 border-b border-[#e5e5e5] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666666] md:grid">
              <span>Invoice</span>
              <span>Customer / project</span>
              <span className="text-right">Due</span>
              <span className="text-right">Balance</span>
            </div>

            <div className="divide-y divide-[#e5e5e5]">
              {openReceivables.length > 0 ? (
                openReceivables.slice(0, 8).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}/edit`}
                    className="grid gap-2 px-4 py-3 transition hover:bg-[#f8f8f8] md:grid-cols-[minmax(0,1.2fr)_1fr_120px_130px] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#171717]">
                        {invoice.referenceNumber}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#666666] md:hidden">
                        {formatStatusLabel(invoice.status)}
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
                    Outstanding invoice balances will appear here as the billing chain
                    moves through send and payment collection.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Section map
              </p>
              <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
                Quick links
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Financials Home orients the section. These links open the workspaces where
                the actual record-level work happens.
              </p>
            </div>

            <div className="divide-y divide-[#e5e5e5]">
              {[
                {
                  href: "/invoices",
                  title: "Invoices",
                  description: "Create, edit, send, and review billing records."
                },
                {
                  href: "/payments",
                  title: "Payments",
                  description: "Review posted collections, pending cash activity, and invoice balance movement."
                },
                {
                  href: "/progress-billing",
                  title: "Progress Billing",
                  description: "Manage schedule-of-values billing continuity that feeds canonical invoices."
                },
                {
                  href: "/financials/accounts-receivable",
                  title: "Accounts Receivable",
                  description: "Placeholder route defining future receivable tracking and collections workflow."
                },
                {
                  href: "/financials/accounts-payable",
                  title: "Accounts Payable",
                  description: "Placeholder route defining future vendor-obligation and payable workflow."
                }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 transition hover:bg-[#f8f8f8]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#666666]">
                      Open
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
