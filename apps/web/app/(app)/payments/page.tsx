import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  getPaymentsManagerReadModel,
  isPaymentsManagerView,
  type PaymentsManagerView
} from "@/lib/payments/manager-read-model";

type PaymentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: PaymentsManagerView;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatPaymentEventActor(value: string | null) {
  return value ? formatStatusLabel(value) : "Payment evidence";
}

function buildPaymentsHref(input: {
  q?: string;
  status?: PaymentsManagerView;
}) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.status && input.status !== "all") {
    searchParams.set("status", input.status);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/payments?${query}` : "/payments";
}

export default async function PaymentsPage({
  searchParams
}: PaymentsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const user = await requireAuthenticatedUser("/payments");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Payment records need an active organization before they can be reviewed.
        Sign out and back in if this account was just initialized.
      </section>
    );
  }

  const query = resolvedSearchParams.q?.trim() ?? "";
  const statusFilter = isPaymentsManagerView(resolvedSearchParams.status)
    ? resolvedSearchParams.status
    : "all";
  const readModel = await getPaymentsManagerReadModel({
    organizationId: organizationContext.organization.id,
    view: statusFilter,
    query
  });

  const paymentViews = [
    { key: "all", label: "All payments", count: readModel.counts.all },
    { key: "recorded", label: "Recorded", count: readModel.counts.recorded },
    { key: "pending", label: "Pending", count: readModel.counts.pending },
    { key: "void", label: "Void", count: readModel.counts.void }
  ] as const;

  const recentPayments = readModel.payments;

  return (
    <ContractorWorkspacePage
      eyebrow="Payments"
      title={`Payment manager for ${organizationContext.organization.displayName}`}
      description="Review collections pressure, recent payments, reconciliation evidence, and invoice continuity here without turning payments into a separate finance subsystem."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Recorded
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.totals.recorded)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.totals.pending)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open receivables
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(readModel.totals.openReceivables)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue invoices
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {readModel.totals.overdueInvoices}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use this page to review collections pressure, recent payment
            activity, and provider evidence, then route into the invoice
            workspace when payment or collections follow-through needs action.
          </p>
        ),
        searchSlot: (
          <form action="/payments" className="flex flex-col gap-2 sm:flex-row">
            {statusFilter !== "all" ? (
              <input type="hidden" name="status" value={statusFilter} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search invoice, customer, project, method, or reference"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Search
            </button>
            {query.length > 0 || statusFilter !== "all" ? (
              <Link
                href="/payments"
                className="inline-flex items-center justify-center rounded-[4px] border border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>
        ),
        filterSlot: paymentViews.map((view) => {
          const isActive = statusFilter === view.key;

          return (
            <Link
              key={view.key}
              href={buildPaymentsHref({ q: query, status: view.key })}
              className={[
                "inline-flex h-8 items-center gap-2 rounded-[4px] px-3 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                ].join(" ")}
              >
                {view.count}
              </span>
            </Link>
          );
        }),
        actionSlot: (
          <Link
            href="/invoices?status=open"
            className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
          >
            Open invoices with balance
          </Link>
        )
      }}
    >
      <div className="space-y-6">
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

        <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          <ManagerDashboardCard
            eyebrow="Collections queue"
            title="Open receivables"
            description="Invoices that still carry balance due and need follow-through on the billing chain."
            actionHref="/invoices?status=open"
            actionLabel="Open invoices"
            items={readModel.openInvoices.map((invoice) => ({
              href: `/invoices/${invoice.id}`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: formatStatusLabel(invoice.status),
              trailing: formatMoney(invoice.balanceDueAmount)
            }))}
            emptyTitle="No open receivables"
            emptyDescription="Invoices with an open balance will appear here."
          />
          <ManagerDashboardCard
            eyebrow="Collections queue"
            title="Overdue pressure"
            description="Open invoices that are already past due and need immediate collections attention."
            actionHref="/invoices?status=open"
            actionLabel="Review overdue"
            items={readModel.overdueInvoices.map((invoice) => ({
              href: `/invoices/${invoice.id}`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: invoice.dueDate
                ? `Due ${formatDate(invoice.dueDate)}`
                : "No due date",
              trailing: formatMoney(invoice.balanceDueAmount)
            }))}
            emptyTitle="No overdue invoices"
            emptyDescription="Past-due invoices will show here once collections pressure builds."
          />
          <ManagerDashboardCard
            eyebrow="Payment activity"
            title="Recent payments"
            description="Recently recorded payments tied to the same invoice and project continuity chain."
            actionHref={buildPaymentsHref({ q: query, status: "recorded" })}
            actionLabel="View recorded"
            items={readModel.recentRecordedPayments.map((payment) => ({
              href: `/invoices/${payment.invoiceId}`,
              title: payment.invoice?.referenceNumber ?? "Recorded payment",
              subtitle: `${payment.customer?.name ?? "Unknown customer"} - ${payment.project?.name ?? "Unknown project"}`,
              meta: `${formatDate(payment.paymentDate)} - ${payment.paymentMethod}`,
              trailing: formatMoney(payment.amount)
            }))}
            emptyTitle="No recent recorded payments"
            emptyDescription="Recorded payments will appear here as money lands on invoices."
          />
          <ManagerDashboardCard
            eyebrow="Exception queue"
            title="Reconciliation attention"
            description="Recent failed, voided, requested, or checkout-started evidence that still needs invoice-level review."
            actionHref="/invoices?status=open"
            actionLabel="Review invoices"
            items={readModel.reconciliationAttentionEvents.map((event) => ({
              href: `/invoices/${event.invoiceId}`,
              title: event.invoice?.referenceNumber ?? "Payment evidence",
              subtitle: `${event.customer?.name ?? "Unknown customer"} - ${event.project?.name ?? "Unknown project"}`,
              meta: `${event.classification.label} - ${formatDateTime(event.occurredAt)}`,
              trailing: event.invoice
                ? formatMoney(event.invoice.balanceDueAmount)
                : null
            }))}
            emptyTitle="No payment events need review"
            emptyDescription="Failed, voided, or pending checkout evidence will surface here when reconciliation attention is needed."
          />
        </section>

        <section className="overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Reconciliation visibility
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Payment evidence review
            </h3>
            <p className="text-sm leading-6 text-slate-500">
              Immutable payment events tied back to canonical invoices. Provider
              references are shown only as compact identifiers; raw payloads stay
              out of this review surface.
            </p>
          </div>

          {readModel.reconciliationEvents.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {readModel.reconciliationEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/invoices/${event.invoiceId}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)_minmax(180px,0.45fr)]"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">
                      {event.invoice?.referenceNumber ?? "Payment event"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {event.customer?.name ?? "Unknown customer"} -{" "}
                      {event.project?.name ?? "Unknown project"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {event.classification.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {event.classification.plainMeaning}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">
                      {formatDateTime(event.occurredAt)}
                      {event.gatewayProvider
                        ? ` - ${event.gatewayProvider}`
                        : event.payment?.gatewayProvider
                          ? ` - ${event.payment.gatewayProvider}`
                          : ""}
                      {event.providerEventId
                        ? ` - Event ${event.providerEventId}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-start justify-start lg:justify-end">
                    <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {event.classification.needsReview
                        ? "Needs review"
                        : formatPaymentEventActor(event.payment?.status ?? null)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow="No payment evidence yet"
                title="Payment event history will appear here"
                description="Checkout, success, failure, void, and provider-sync evidence will show here once immutable payment events exist."
              />
            </div>
          )}
        </section>

        <section className="overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Recent records
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Latest payment updates
              </h3>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              {recentPayments.length} visible
            </p>
          </div>

          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Payment</th>
                    <th className="px-5 py-3 sm:px-6">Invoice / project</th>
                    <th className="px-5 py-3 sm:px-6">Status</th>
                    <th className="px-5 py-3 sm:px-6">Method</th>
                    <th className="px-5 py-3 text-right sm:px-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 sm:px-6">
                        <Link
                          href={`/invoices/${payment.invoiceId}`}
                          className="font-semibold text-slate-950 transition hover:text-brand-700"
                        >
                          {payment.customer?.name ??
                            payment.invoice?.referenceNumber ??
                            "Payment"}
                        </Link>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {formatDate(payment.paymentDate)}
                          {payment.reference
                            ? ` - Ref ${payment.reference}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-medium text-slate-700">
                          {payment.invoice?.referenceNumber ?? "No invoice"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {payment.project?.name ?? "Unknown project"}
                        </p>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <span className="inline-flex rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                          {formatStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 sm:px-6">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-950 sm:px-6">
                        {formatMoney(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 sm:px-8">
              <AppEmptyState
                eyebrow={
                  readModel.counts.all > 0
                    ? "No matching payments"
                    : "No payments yet"
                }
                title={
                  readModel.counts.all > 0
                    ? "Adjust the payment filters"
                    : "Payment history will surface here"
                }
                description={
                  readModel.counts.all > 0
                    ? "Try a broader search or switch to another payment status."
                    : "Payments stay tied to invoices, customers, projects, and the wider collections chain."
                }
              />
            </div>
          )}
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
