import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { ManagerDashboardCard } from "@/components/manager-dashboard-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listInvoices } from "@/lib/invoices/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listPaymentEvents, listPayments } from "@/lib/payments/data";

type PaymentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: "all" | "recorded" | "pending" | "void";
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

function buildPaymentsHref(input: {
  q?: string;
  status?: string;
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

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
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

  const [payments, paymentEvents, invoices] = await Promise.all([
    listPayments(),
    listPaymentEvents(),
    listInvoices()
  ]);

  const query = resolvedSearchParams.q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const statusFilter = resolvedSearchParams.status ?? "all";

  const recordedPayments = payments.filter((payment) => payment.status === "recorded");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");
  const voidPayments = payments.filter((payment) => payment.status === "void");
  const failedPaymentEvents = paymentEvents.filter(
    (event) => event.eventType === "payment_failed"
  );
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = openInvoices.filter((invoice) => {
    if (!invoice.dueDate) {
      return false;
    }

    return new Date(invoice.dueDate) < new Date();
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === "all" ? true : payment.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            payment.invoice?.referenceNumber ?? "",
            payment.customer?.name ?? "",
            payment.customer?.companyName ?? "",
            payment.project?.name ?? "",
            payment.paymentMethod,
            payment.paymentSource,
            payment.status,
            payment.reference ?? ""
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });

  const paymentViews = [
    { key: "all", label: "All payments", count: payments.length },
    { key: "recorded", label: "Recorded", count: recordedPayments.length },
    { key: "pending", label: "Pending", count: pendingPayments.length },
    { key: "void", label: "Void", count: voidPayments.length }
  ] as const;

  const recordedTotal = recordedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const pendingTotal = pendingPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const openReceivables = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );
  const recentRecordedPayments = recordedPayments.slice(0, 4);
  const recentOpenInvoices = openInvoices.slice(0, 4);
  const recentOverdueInvoices = overdueInvoices.slice(0, 4);
  const recentFailedPayments = failedPaymentEvents.slice(0, 4);
  const recentPayments = [...filteredPayments]
    .sort((left, right) => {
      const dateComparison = right.paymentDate.localeCompare(left.paymentDate);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, 20);

  return (
    <ContractorWorkspacePage
      eyebrow="Payments"
      title={`Payment manager for ${organizationContext.organization.displayName}`}
      description="Review collections pressure, recent payments, and invoice continuity here without turning payments into a separate finance subsystem."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Recorded
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(recordedTotal)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(pendingTotal)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open receivables
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(openReceivables)}
            </p>
          </div>
          <div className="border border-[#e5e5e5] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue invoices
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">
              {overdueInvoices.length}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use this page to review collections pressure and recent payment activity,
            then route into the canonical invoice workspace when a payment needs to be
            recorded or collections follow-through needs action.
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
                "inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[#171717] text-white"
                  : "border border-[#d6d6d6] bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              <span>{view.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
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
            description="Invoices that still carry balance due and need follow-through on the canonical billing chain."
            actionHref="/invoices?status=open"
            actionLabel="Open invoices"
            items={recentOpenInvoices.map((invoice) => ({
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
            items={recentOverdueInvoices.map((invoice) => ({
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
            items={recentRecordedPayments.map((payment) => ({
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
            title="Failed payments"
            description="Recent failed payment attempts that still need collections follow-through in the invoice workspace."
            actionHref="/invoices?status=open"
            actionLabel="Review invoices"
            items={recentFailedPayments.map((event) => ({
              href: `/invoices/${event.invoiceId}`,
              title: event.invoice?.referenceNumber ?? "Failed payment",
              subtitle: `${event.customer?.name ?? "Unknown customer"} - ${event.project?.name ?? "Unknown project"}`,
              meta: formatDateTime(event.occurredAt),
              trailing: event.invoice
                ? formatMoney(event.invoice.balanceDueAmount)
                : null
            }))}
            emptyTitle="No failed payments"
            emptyDescription="Failed payment attempts will surface here when collections attention is needed."
          />
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
                          {payment.reference ? ` - Ref ${payment.reference}` : ""}
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
                eyebrow={payments.length > 0 ? "No matching payments" : "No payments yet"}
                title={
                  payments.length > 0
                    ? "Adjust the payment filters"
                    : "Payment history will surface here"
                }
                description={
                  payments.length > 0
                    ? "Try a broader search or switch to another payment status."
                    : "Payments remain canonical records tied to invoices, customers, projects, and the wider collections chain."
                }
              />
            </div>
          )}
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
