import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getFinancialCollectionsReadModel } from "@/lib/financials/collections-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import {
  normalizeWorkflowGuidancePreferences,
  shouldShowAiDraftActions
} from "@/lib/workflow-guidance/preferences";

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

function formatOptionalDate(value: string | null) {
  return value ? formatDate(value) : "No due date";
}

function formatOptionalDateTime(value: string) {
  return value ? formatDateTime(value) : "No activity";
}

function toneBadgeClass(tone: "neutral" | "attention" | "warning") {
  if (tone === "warning") {
    return "border-[#f2c7aa] bg-[#fff7ed] text-[#9a3412]";
  }

  if (tone === "attention") {
    return "border-[#e4d7ca] bg-[#fffcf7] text-[#8f5b32]";
  }

  return "border-[#d6d6d6] bg-[#f8f8f8] text-slate-600";
}

function priorityBandClass(band: "urgent" | "attention" | "monitoring") {
  if (band === "urgent") {
    return "border-[#f2c7aa] bg-[#fff7ed] text-[#9a3412]";
  }

  if (band === "attention") {
    return "border-[#e4d7ca] bg-[#fffcf7] text-[#8f5b32]";
  }

  return "border-[#d6d6d6] bg-[#f8f8f8] text-slate-600";
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
  const [readModel, workflowSettings] = await Promise.all([
    getFinancialCollectionsReadModel({
      organizationId: organizationContext.organization.id,
      todayIso
    }),
    getOrganizationWorkflowSettings(organizationContext.organization.id)
  ]);
  const financialControl = readModel.financialControl;
  const guidancePreferences = normalizeWorkflowGuidancePreferences(
    workflowSettings.workflowGuidancePreferences
  );
  const showAiDraftActions = shouldShowAiDraftActions(guidancePreferences);
  const collectionsDesk = readModel.collectionsCommandCenter;
  const paymentExceptions = collectionsDesk.paymentExceptions;
  const recentPaymentActivity = collectionsDesk.recentActivity;
  const continuitySnapshot = collectionsDesk.continuitySnapshot;
  const invoiceStatusCounts = [
    {
      label: "Draft",
      value: continuitySnapshot.invoiceStatusCounts.draft,
      href: "/invoices?status=draft"
    },
    {
      label: "Sent",
      value: continuitySnapshot.invoiceStatusCounts.sent,
      href: "/invoices?status=sent"
    },
    {
      label: "Partial",
      value: continuitySnapshot.invoiceStatusCounts.partiallyPaid,
      href: "/invoices?status=open"
    },
    {
      label: "Paid",
      value: continuitySnapshot.invoiceStatusCounts.paid,
      href: "/invoices?status=paid"
    },
    {
      label: "Void",
      value: continuitySnapshot.invoiceStatusCounts.void,
      href: "/invoices?status=void"
    }
  ];
  const invoiceAttentionById = new Map(
    financialControl.invoicesNeedingAttention.map((invoice) => [
      invoice.id,
      invoice
    ])
  );
  const priorityGroups = [
    {
      key: "urgent",
      label: "Urgent",
      empty: "No urgent invoices are active."
    },
    {
      key: "attention",
      label: "Attention",
      empty: "No attention-band invoices are active."
    },
    {
      key: "monitoring",
      label: "Monitoring",
      empty: "No monitoring-band invoices are active."
    }
  ] as const;

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounts Receivable"
      description="Review open balances, overdue invoices, pending checkout activity, and the next collection move."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-5">
          {collectionsDesk.summaryCards.map((card) => (
            <div key={card.id} className="bg-white px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
                  {card.label}
                </p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(card.tone)}`}
                >
                  {card.tone}
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
                {card.id === "open-ar-balance"
                  ? formatMoney(card.value)
                  : card.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {card.detail}
              </p>
            </div>
          ))}
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
              href="/financials/accounting-readiness"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Accounting readiness
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
        <section className="border border-[#d6d6d6] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#e5e5e5] px-5 py-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Operational continuity
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                AR status and review lanes
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Read-only invoice status, collections, deposit, and Payment
                Trail lanes derived from existing canonical invoices, payments,
                and payment events.
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-5">
              {invoiceStatusCounts.map((status) => (
                <Link
                  key={status.label}
                  href={status.href}
                  className="border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2 text-center transition hover:bg-white"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                    {status.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {status.value}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-3">
            {continuitySnapshot.operationalQueues.map((queue) => (
              <Link
                key={queue.id}
                href={queue.href}
                className="min-w-0 bg-white px-5 py-4 transition hover:bg-[#f8f8f8]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                    {queue.label}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(queue.tone)}`}
                  >
                    {queue.tone}
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#171717]">
                  {queue.amount ? formatMoney(queue.amount) : queue.count}
                </p>
                {queue.amount ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {queue.count} item{queue.count === 1 ? "" : "s"}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {queue.detail}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
          <section className="min-w-0 border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Priority engine
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Needs attention first
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Ranked from canonical invoice balances, due dates, workflow
                role, Payment Trail state, pending payments, retainage,
                progress-billing markers, stale activity, and customer exposure.
                Priority labels are derived from those records only.
              </p>
            </div>

            {collectionsDesk.priorityItems.length > 0 ? (
              <div className="divide-y divide-[#e5e5e5]">
                {priorityGroups.map((group) => {
                  const items = collectionsDesk.priorityItems.filter(
                    (item) => item.priorityBand === group.key
                  );

                  return (
                    <section key={group.key} className="px-5 py-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {group.label}
                        </h3>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${priorityBandClass(group.key)}`}
                        >
                          {items.length}
                        </span>
                      </div>
                      {items.length > 0 ? (
                        <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5]">
                          {items.map((item) => (
                            <article key={item.id} className="px-4 py-3">
                              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)_auto] lg:items-start">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      href={item.invoiceHref}
                                      className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                                    >
                                      {item.invoiceReference}
                                    </Link>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(item.tone)}`}
                                    >
                                      score {item.priorityScore}
                                    </span>
                                    <span className="rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                      {formatStatusLabel(item.workflowRole)}
                                    </span>
                                    <span className="rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                      {formatStatusLabel(item.invoiceStatus)}
                                    </span>
                                    {item.latestPaymentSignal ? (
                                      <span className="rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                        {item.latestPaymentSignal.label}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {item.reason}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.customerHref ? (
                                      <Link
                                        href={item.customerHref}
                                        className="font-medium text-brand-700 transition hover:text-brand-800"
                                      >
                                        {item.customerName}
                                      </Link>
                                    ) : (
                                      item.customerName
                                    )}{" "}
                                    /{" "}
                                    {item.projectHref ? (
                                      <Link
                                        href={item.projectHref}
                                        className="font-medium text-brand-700 transition hover:text-brand-800"
                                      >
                                        {item.projectName}
                                      </Link>
                                    ) : (
                                      item.projectName
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                                    Continuity
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-950">
                                    {formatMoney(item.balanceDueAmount)}
                                  </p>
                                  <p className="mt-1 text-sm leading-5 text-slate-500">
                                    {item.dueSignal}. Last activity{" "}
                                    {formatOptionalDateTime(
                                      item.lastActivityAt
                                    )}
                                    .
                                  </p>
                                  {item.latestPaymentSignal ? (
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      Latest signal{" "}
                                      <span className="font-semibold text-slate-700">
                                        {item.latestPaymentSignal.label}
                                      </span>{" "}
                                      on{" "}
                                      {formatOptionalDateTime(
                                        item.latestPaymentSignal.occurredAt
                                      )}
                                      . {item.latestPaymentSignal.historyCount}{" "}
                                      Payment Trail event
                                      {item.latestPaymentSignal.historyCount ===
                                      1
                                        ? ""
                                        : "s"}
                                      .
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      No Payment Trail events are attached to
                                      this open invoice yet.
                                    </p>
                                  )}
                                </div>
                                <Link
                                  href={item.invoiceHref}
                                  className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
                                >
                                  {item.nextAction}
                                </Link>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-sm leading-6 text-slate-500">
                          {group.empty}
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8">
                <AppEmptyState
                  eyebrow="No priority items"
                  title="No collections priorities are active"
                  description="Open receivables, failed payment events, unpaid deposits, and stale pending payment activity will rank here when they need review."
                />
              </div>
            )}
          </section>

          <section className="min-w-0 border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Customer continuity
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Customer exposure
              </h3>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {collectionsDesk.customerContinuity.length > 0 ? (
                collectionsDesk.customerContinuity
                  .slice(0, 5)
                  .map((customer) => (
                    <div key={customer.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {customer.customerHref ? (
                            <Link
                              href={customer.customerHref}
                              className="text-sm font-semibold text-[#171717] transition hover:text-brand-700"
                            >
                              {customer.customerName}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-[#171717]">
                              {customer.customerName}
                            </p>
                          )}
                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {customer.openInvoiceCount} open /{" "}
                            {customer.overdueInvoiceCount} overdue /{" "}
                            {customer.linkedProjectCount} project
                            {customer.linkedProjectCount === 1 ? "" : "s"}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                            Oldest unpaid{" "}
                            {formatOptionalDate(customer.oldestUnpaidDueDate)} /{" "}
                            {customer.nextAction}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-950">
                            {formatMoney(customer.outstandingAmount)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {customer.activePaymentIssueCount} issue /{" "}
                            {customer.pendingDepositCount} deposit /{" "}
                            {customer.partiallyPaidCount} partial
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No customer-level collections exposure is active.
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="flex flex-col gap-2 border-b border-[#e5e5e5] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Deposit lane
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Deposit invoice continuity
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Deposit visibility stays on canonical invoices with
                <span className="font-semibold"> workflow_role=deposit</span>.
                The lane distinguishes open, in-progress, settled, and void
                deposit invoices without creating a separate deposit model or
                action workflow.
              </p>
            </div>
            <Link
              href="/invoices?workflowRole=deposit"
              className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Open deposit invoices
            </Link>
          </div>
          {collectionsDesk.depositContinuity.length > 0 ? (
            <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-4">
              {collectionsDesk.depositContinuity.map((deposit) => (
                <div key={deposit.id} className="min-w-0 bg-white px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={deposit.invoiceHref}
                      className="text-sm font-semibold text-[#171717] transition hover:text-brand-700"
                    >
                      {deposit.invoiceReference}
                    </Link>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(deposit.tone)}`}
                    >
                      {deposit.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {formatMoney(deposit.balanceDueAmount)}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {deposit.reason}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {deposit.customerHref ? (
                      <Link
                        href={deposit.customerHref}
                        className="font-medium text-brand-700 transition hover:text-brand-800"
                      >
                        {deposit.customerName}
                      </Link>
                    ) : (
                      deposit.customerName
                    )}{" "}
                    /{" "}
                    {deposit.projectHref ? (
                      <Link
                        href={deposit.projectHref}
                        className="font-medium text-brand-700 transition hover:text-brand-800"
                      >
                        {deposit.projectName}
                      </Link>
                    ) : (
                      deposit.projectName
                    )}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                    Invoice {formatStatusLabel(deposit.invoiceStatus)}
                    {deposit.latestPaymentSignal
                      ? ` / ${deposit.latestPaymentSignal.label}`
                      : " / no Payment Trail signal"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8">
              <AppEmptyState
                eyebrow="No deposit invoices"
                title="No deposit-role invoices are visible"
                description="Deposit rows will appear here only when existing canonical invoices carry the deposit workflow role."
              />
            </div>
          )}
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#e5e5e5] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Collections review
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Payment follow-up queue
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                {readModel.collectionsIntelligence.headline} Items are derived
                from canonical invoices, payments, and Payment Trail events.
                Drafts stay review-first and route through the communications
                composer without sending, creating threads, or mutating payment
                state.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {readModel.collectionsIntelligence.categories
                .filter((category) => category.count > 0)
                .map((category) => (
                  <span
                    key={category.key}
                    className="inline-flex rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                  >
                    {category.label}: {category.count}
                  </span>
                ))}
            </div>
          </div>

          {readModel.collectionsIntelligence.items.length > 0 ? (
            <div className="divide-y divide-[#e5e5e5]">
              {readModel.collectionsIntelligence.items
                .slice(0, 6)
                .map((item) => (
                  <article key={item.id} className="px-5 py-4">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)_auto] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={item.invoiceHref}
                            className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                          >
                            {item.invoiceReference}
                          </Link>
                          <span className="rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                            {item.category.replaceAll("_", " ")}
                          </span>
                          <span className="rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]">
                            {item.priority}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.reason}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.customerHref ? (
                            <Link
                              href={item.customerHref}
                              className="font-medium text-brand-700 transition hover:text-brand-800"
                            >
                              {item.customerName}
                            </Link>
                          ) : (
                            item.customerName
                          )}{" "}
                          /{" "}
                          {item.projectHref ? (
                            <Link
                              href={item.projectHref}
                              className="font-medium text-brand-700 transition hover:text-brand-800"
                            >
                              {item.projectName}
                            </Link>
                          ) : (
                            item.projectName
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                          Why now
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {formatMoney(item.amountDue)} due
                        </p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {item.dueOrAgeSignal} Payment state:{" "}
                          {item.paymentState.replaceAll("_", " ")}.
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.lastActivityLabel}{" "}
                          {formatOptionalDateTime(item.lastActivityAt)}.
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                          {formatStatusLabel(item.invoiceStatus)}
                        </p>
                        <div className="mt-3 border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                            Next-contact brief
                          </p>
                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            {item.nextContactBrief.summary}
                          </p>
                          <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-500 sm:grid-cols-2">
                            <p>{item.nextContactBrief.customerContext}</p>
                            <p>{item.nextContactBrief.projectContext}</p>
                            <p>{item.nextContactBrief.invoiceContext}</p>
                            <p>{item.nextContactBrief.paymentContext}</p>
                            <p>{item.nextContactBrief.agingContext}</p>
                            <p>{item.nextContactBrief.lastActivityContext}</p>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Source context:{" "}
                            {item.nextContactBrief.sourceRecordContext.join(
                              " / "
                            )}
                            .
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Link
                          href={item.invoiceHref}
                          className="inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
                        >
                          Open invoice
                        </Link>
                        {showAiDraftActions && item.communicationHandoffHref ? (
                          <Link
                            href={item.communicationHandoffHref}
                            className="inline-flex items-center justify-center rounded-[4px] border border-[#e4d7ca] bg-[#fffcf7] px-3 py-2 text-sm font-medium text-[#8f5b32] transition hover:bg-white"
                          >
                            Review draft
                          </Link>
                        ) : item.draftActionAvailable ? (
                          <span className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-2 text-sm font-medium text-slate-500">
                            Draft gated
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <div className="px-6 py-8">
              <AppEmptyState
                eyebrow="No collections follow-up"
                title="No payment follow-ups need review"
                description="When overdue balances, unpaid deposits, partial balances, pending checkout, or failed payment attempts appear, they will surface here with source-record links."
              />
            </div>
          )}
        </section>

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

        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
          <section className="min-w-0 border border-[#d6d6d6] bg-white">
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
              <div className="w-full max-w-full overflow-x-auto">
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

          <section className="min-w-0 space-y-4">
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
                Payment exceptions
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Failed, voided, in-progress, and stale pending payment signals
                stay in the attention lane until the existing invoice and
                payment records show a clear outcome.
              </p>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {paymentExceptions.length > 0 ? (
                paymentExceptions.map((event) => (
                  <article
                    key={event.id}
                    className="px-5 py-4 transition hover:bg-[#f8f8f8]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={event.invoiceHref}
                          className="text-sm font-semibold text-[#171717] transition hover:text-brand-700"
                        >
                          {event.invoiceReference}
                        </Link>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {event.customerHref ? (
                            <Link
                              href={event.customerHref}
                              className="font-medium text-brand-700 transition hover:text-brand-800"
                            >
                              {event.customerName}
                            </Link>
                          ) : (
                            event.customerName
                          )}{" "}
                          -{" "}
                          {event.projectHref ? (
                            <Link
                              href={event.projectHref}
                              className="font-medium text-brand-700 transition hover:text-brand-800"
                            >
                              {event.projectName}
                            </Link>
                          ) : (
                            event.projectName
                          )}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {formatOptionalDateTime(event.occurredAt)} /{" "}
                          {event.providerLabel}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-slate-500">
                          {event.reason}
                        </p>
                        {event.amount ? (
                          <p className="mt-1 text-sm font-semibold text-slate-950">
                            {formatMoney(event.amount)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {event.historyCount} Payment Trail event
                          {event.historyCount === 1 ? "" : "s"} linked to this
                          invoice.
                        </p>
                      </div>
                      <span
                        className={`rounded-[4px] border px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(event.tone)}`}
                      >
                        {event.nextAction}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                  No failed, voided, in-progress, or stale pending Payment Trail
                  items need review.
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Recent collections activity
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Recently settled payments
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Recorded payments stay separate from open exceptions so the team
              can confirm continuity without mixing settled activity into the
              attention queue.
            </p>
          </div>
          <div className="divide-y divide-[#e5e5e5]">
            {recentPaymentActivity.length > 0 ? (
              recentPaymentActivity.map((event) => (
                <article key={event.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={event.invoiceHref}
                        className="text-sm font-semibold text-[#171717] transition hover:text-brand-700"
                      >
                        {event.invoiceReference}
                      </Link>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {event.customerHref ? (
                          <Link
                            href={event.customerHref}
                            className="font-medium text-brand-700 transition hover:text-brand-800"
                          >
                            {event.customerName}
                          </Link>
                        ) : (
                          event.customerName
                        )}{" "}
                        -{" "}
                        {event.projectHref ? (
                          <Link
                            href={event.projectHref}
                            className="font-medium text-brand-700 transition hover:text-brand-800"
                          >
                            {event.projectName}
                          </Link>
                        ) : (
                          event.projectName
                        )}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                        {formatOptionalDateTime(event.occurredAt)} /{" "}
                        {event.providerLabel}
                      </p>
                      <p className="mt-2 text-sm leading-5 text-slate-500">
                        {event.reason}
                      </p>
                      {event.amount ? (
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {formatMoney(event.amount)}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-[4px] border px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${toneBadgeClass(
                        event.tone
                      )}`}
                    >
                      {event.nextAction}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-5 py-6 text-sm leading-6 text-slate-500">
                No recent recorded payment activity is visible in the current
                read model.
              </div>
            )}
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
