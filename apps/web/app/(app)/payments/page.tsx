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

function getPaymentEventLabel(eventType: string) {
  switch (eventType) {
    case "payment_requested":
      return "Payment requested";
    case "checkout_started":
      return "Checkout started";
    case "payment_succeeded":
      return "Payment succeeded";
    case "payment_failed":
      return "Payment failed";
    case "payment_voided":
      return "Payment voided";
    case "provider_sync":
      return "Provider sync";
    default:
      return formatStatusLabel(eventType);
  }
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
  const failedEvents = paymentEvents.filter((event) => event.eventType === "payment_failed");
  const checkoutEvents = paymentEvents.filter(
    (event) => event.eventType === "checkout_started"
  );
  const requestEvents = paymentEvents.filter(
    (event) => event.eventType === "payment_requested"
  );
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );

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
            payment.gatewayProvider ?? "",
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

  return (
    <ContractorWorkspacePage
      eyebrow="Payments"
      title={`Payment manager for ${organizationContext.organization.displayName}`}
      description="Review cash movement, pending checkout signals, and collection exceptions on the same canonical invoice and project chain instead of splitting payments into a separate billing world."
      summary={
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Recorded</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {formatMoney(recordedTotal)}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Pending</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {formatMoney(pendingTotal)}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Failures</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {failedEvents.length}
            </p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Open receivables</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">
              {formatMoney(openReceivables)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Use this page to watch payment completion, failures, and open receivables, then jump back into the invoice workspace when collections or billing edits need to happen on the canonical record.
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
              placeholder="Search invoice, customer, project, provider, method, or reference"
              className="min-w-0 flex-1 rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#91a5c6]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#d9dee8] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                  ? "bg-[#233a64] text-white"
                  : "border border-[#dde3eb] bg-white text-slate-700 hover:bg-slate-50"
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
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            Open invoices with balance
          </Link>
        )
      }}
    >
      <div className="space-y-6">
        <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-2">
          <ManagerDashboardCard
            eyebrow="Cash posted"
            title="Recently recorded payments"
            description="Use this queue to confirm money that has already landed on the canonical invoice chain."
            actionHref={buildPaymentsHref({ q: query, status: "recorded" })}
            actionLabel="View recorded"
            items={recordedPayments.slice(0, 3).map((payment) => ({
              href: `/invoices/${payment.invoiceId}`,
              title: payment.invoice?.referenceNumber ?? "Invoice payment",
              subtitle: `${payment.customer?.name ?? "Unknown customer"} · ${payment.project?.name ?? "Unknown project"}`,
              meta: `${formatDate(payment.paymentDate)} · ${formatStatusLabel(payment.recordedVia)}`,
              badge: payment.paymentSource === "customer_portal" ? "Portal" : "Manual",
              trailing: formatMoney(payment.amount)
            }))}
            emptyTitle="No recorded payments yet."
            emptyDescription="Confirmed payment activity will surface here as the billing chain starts settling."
          />

          <ManagerDashboardCard
            eyebrow="In motion"
            title="Pending checkout payments"
            description="These payment rows exist on the canonical chain already, but still need provider completion or resolution."
            actionHref={buildPaymentsHref({ q: query, status: "pending" })}
            actionLabel="View pending"
            items={pendingPayments.slice(0, 3).map((payment) => ({
              href: `/invoices/${payment.invoiceId}`,
              title: payment.invoice?.referenceNumber ?? "Pending payment",
              subtitle: `${payment.customer?.name ?? "Unknown customer"} · ${payment.project?.name ?? "Unknown project"}`,
              meta: `${payment.gatewayProvider ?? "Gateway"} checkout · ${payment.gatewayStatus ?? "pending"}`,
              badge: "Pending",
              trailing: formatMoney(payment.amount)
            }))}
            emptyTitle="No pending checkout payments."
            emptyDescription="Once customer-facing checkout begins, unfinished payments will show up here for follow-through."
          />

          <ManagerDashboardCard
            eyebrow="Exceptions"
            title="Failed payment attempts"
            description="Keep failed provider-backed attempts visible so collection follow-through stays attached to the right invoice and customer."
            actionHref="/invoices?status=open"
            actionLabel="Open balances"
            items={failedEvents.slice(0, 3).map((event) => ({
              href: `/invoices/${event.invoiceId}`,
              title: event.invoice?.referenceNumber ?? "Failed payment event",
              subtitle: `${event.customer?.name ?? "Unknown customer"} · ${event.project?.name ?? "Unknown project"}`,
              meta: `${getPaymentEventLabel(event.eventType)} · ${formatDateTime(event.occurredAt)}`,
              badge: "Failure",
              trailing: event.invoice ? formatMoney(event.invoice.balanceDueAmount) : null
            }))}
            emptyTitle="No failed payment attempts are waiting right now."
            emptyDescription="When customer checkout fails, the event will surface here so collections attention stays focused."
          />

          <ManagerDashboardCard
            eyebrow="Collections"
            title="Invoices still waiting on payment"
            description="Payments stay review-first here, but the underlying collection work still belongs to the canonical invoice workspace."
            actionHref="/invoices?status=open"
            actionLabel="Open invoices"
            items={openInvoices.slice(0, 3).map((invoice) => ({
              href: `/invoices/${invoice.id}`,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} · ${invoice.project?.name ?? "Unknown project"}`,
              meta: `${formatStatusLabel(invoice.status)} · ${invoice.workflowRole === "deposit" ? "Deposit" : "Standard"} invoice`,
              badge:
                requestEvents.some((event) => event.invoiceId === invoice.id)
                  ? "Requested"
                  : checkoutEvents.some((event) => event.invoiceId === invoice.id)
                    ? "Checkout"
                    : "Open",
              trailing: formatMoney(invoice.balanceDueAmount)
            }))}
            emptyTitle="No invoices are waiting on payment."
            emptyDescription="As balances clear, the collections queue will quiet down here."
          />
        </section>

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

        <section className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div className="hidden grid-cols-[minmax(0,1.25fr)_1fr_150px_140px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:flex-1">
                <span>Payment</span>
                <span>Project / invoice</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Payments list
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {filteredPayments.length} visible
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/invoices/${payment.invoiceId}`}
                  className="group block px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_1fr_150px_140px] md:items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950 transition group-hover:text-brand-700">
                        {payment.customer?.name ?? payment.invoice?.referenceNumber ?? "Payment"}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {payment.paymentMethod}
                        {payment.reference ? ` · Ref ${payment.reference}` : ""}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {formatDate(payment.paymentDate)} · {formatStatusLabel(payment.paymentSource)} via{" "}
                        {formatStatusLabel(payment.recordedVia)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Continuity
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {payment.project?.name ?? "Unknown project"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {payment.invoice?.referenceNumber ?? "No invoice"} · balance{" "}
                        {payment.invoice ? formatMoney(payment.invoice.balanceDueAmount) : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                        {formatStatusLabel(payment.status)}
                      </span>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {payment.gatewayProvider ?? "Manual"}
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                        Amount
                      </p>
                      <p className="text-sm font-semibold text-slate-950">
                        {formatMoney(payment.amount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow={payments.length > 0 ? "No matching payments" : "No payments yet"}
                  title={payments.length > 0 ? "Adjust the payment filters" : "Payment history will surface here"}
                  description={
                    payments.length > 0
                      ? "Try a broader search or switch status views to find the payment activity you need."
                      : "Payments remain canonical records tied to invoices, customers, projects, and the wider readiness chain."
                  }
                />
              </div>
            )}
          </div>
        </section>

        <section className="border border-[#dde3eb] bg-white">
          <div className="border-b border-[#e5ebf2] px-5 py-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
                  Payment signals
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Recent immutable payment events keep portal-side checkout, failure, and request signals visible without replacing the invoice as billing truth.
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                {paymentEvents.slice(0, 8).length} recent
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {paymentEvents.slice(0, 8).length > 0 ? (
              paymentEvents.slice(0, 8).map((event) => (
                <Link
                  key={event.id}
                  href={`/invoices/${event.invoiceId}`}
                  className="group flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950 transition group-hover:text-brand-700">
                      {event.invoice?.referenceNumber ?? "Payment event"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {getPaymentEventLabel(event.eventType)} · {event.customer?.name ?? "Unknown customer"}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7a889d]">
                      {formatDateTime(event.occurredAt)} · {formatStatusLabel(event.actorType)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-slate-700">
                    {event.project?.name ?? "No project"}
                  </p>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <AppEmptyState
                  eyebrow="No payment signals yet"
                  title="Portal and provider payment events will appear here"
                  description="As customer-facing payment activity starts, immutable request, checkout, success, failure, and void signals will show up here."
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
