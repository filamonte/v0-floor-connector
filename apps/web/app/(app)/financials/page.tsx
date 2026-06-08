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

export default async function FinancialsHomePage() {
  const user = await requireAuthenticatedUser("/financials");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Financial workflows need an active organization before balances and
        payment activity can be reviewed.
      </section>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const readModel = await getFinancialCollectionsReadModel({
    organizationId: organizationContext.organization.id,
    todayIso
  });
  const financialControl = readModel.financialControl;
  const collectionsDesk = readModel.collectionsCommandCenter;
  const billingReadiness = readModel.billingReadinessCommand;
  const urgentPriorityCount = collectionsDesk.priorityItems.filter(
    (item) => item.priorityBand === "urgent"
  ).length;
  const attentionPriorityCount = collectionsDesk.priorityItems.filter(
    (item) => item.priorityBand === "attention"
  ).length;
  const paymentTrailAttentionCount =
    collectionsDesk.paymentTrailAttention.filter(
      (item) => item.tone !== "neutral"
    ).length;
  const topProjectAttention =
    financialControl.projectCollectionAttention[0] ?? null;
  const topCustomerExposure = collectionsDesk.customerContinuity[0] ?? null;
  const financialContinuityLinks = [
    {
      id: "accounts-receivable",
      eyebrow: "Receivables",
      title: "Accounts Receivable cockpit",
      href: "/financials/accounts-receivable",
      value: formatMoney(financialControl.openReceivablesAmount),
      detail: `${urgentPriorityCount} urgent / ${attentionPriorityCount} attention from the collections priority queue.`,
      tone:
        urgentPriorityCount > 0
          ? "warning"
          : attentionPriorityCount > 0
            ? "attention"
            : "neutral"
    },
    {
      id: "payments",
      eyebrow: "Payments",
      title: "Payment manager and trail",
      href: "/payments",
      value: String(paymentTrailAttentionCount),
      detail:
        paymentTrailAttentionCount > 0
          ? "Payment Trail items need review across failed, voided, requested, or pending evidence."
          : "Payment Trail has no failed or voided attention items in the current read model.",
      tone: paymentTrailAttentionCount > 0 ? "attention" : "neutral"
    },
    {
      id: "invoices",
      eyebrow: "Invoices",
      title: "Canonical invoice register",
      href: "/invoices?status=open",
      value: String(financialControl.openInvoiceCount),
      detail: `${financialControl.overdueInvoiceCount} overdue / ${financialControl.partiallyPaidCount} partially paid invoice${financialControl.partiallyPaidCount === 1 ? "" : "s"}.`,
      tone:
        financialControl.overdueInvoiceCount > 0
          ? "warning"
          : financialControl.openInvoiceCount > 0
            ? "attention"
            : "neutral"
    },
    {
      id: "project-handoff",
      eyebrow: "Projects",
      title: "Project financial handoff",
      href: topProjectAttention?.href ?? "/projects",
      value: String(financialControl.projectCollectionAttention.length),
      detail: topProjectAttention
        ? `${topProjectAttention.projectName}: ${topProjectAttention.reason}`
        : "Project-level financial pressure will route back to the Project Workspace when present.",
      tone:
        financialControl.projectCollectionAttention.length > 0
          ? "attention"
          : "neutral"
    },
    {
      id: "customer-exposure",
      eyebrow: "Customers",
      title: "Customer balance exposure",
      href: topCustomerExposure?.customerHref ?? "/customers",
      value: topCustomerExposure
        ? formatMoney(topCustomerExposure.outstandingAmount)
        : formatMoney(0),
      detail: topCustomerExposure
        ? `${topCustomerExposure.customerName}: ${topCustomerExposure.openInvoiceCount} open / ${topCustomerExposure.overdueInvoiceCount} overdue.`
        : "Customer exposure will appear once open receivables are attached to customer records.",
      tone: topCustomerExposure?.tone ?? "neutral"
    },
    {
      id: "progress-billing",
      eyebrow: "Progress billing",
      title: "SOV and retained amount review",
      href: "/progress-billing",
      value: formatMoney(financialControl.progressBillingReceivablesAmount),
      detail: `${formatMoney(financialControl.retainageHeldAmount)} retained across existing invoice snapshots.`,
      tone:
        Number(financialControl.progressBillingReceivablesAmount) > 0 ||
        Number(financialControl.retainageHeldAmount) > 0
          ? "attention"
          : "neutral"
    }
  ];
  const commandCenterActionLanes = [
    {
      id: "collect-now",
      label: "Collect now",
      title: "Open AR and overdue pressure",
      href: "/financials/accounts-receivable",
      value: formatMoney(financialControl.openReceivablesAmount),
      detail:
        financialControl.openInvoiceCount > 0
          ? `${financialControl.openInvoiceCount} open invoice${financialControl.openInvoiceCount === 1 ? "" : "s"} with ${financialControl.overdueInvoiceCount} overdue.`
          : "No open invoice balance is currently collectible.",
      tone:
        financialControl.overdueInvoiceCount > 0
          ? "warning"
          : financialControl.openInvoiceCount > 0
            ? "attention"
            : "neutral"
    },
    {
      id: "deposits-readiness",
      label: "Unlock readiness",
      title: "Deposit and readiness invoices",
      href: "/financials/accounts-receivable",
      value: formatMoney(financialControl.depositReceivablesAmount),
      detail:
        Number(financialControl.depositReceivablesAmount) > 0
          ? "Deposit-role invoices still carry balance due before financial readiness can move cleanly."
          : "No open deposit receivable is currently blocking readiness signals.",
      tone:
        Number(financialControl.depositReceivablesAmount) > 0
          ? "attention"
          : "neutral"
    },
    {
      id: "payment-exceptions",
      label: "Resolve evidence",
      title: "Payment failures and pending events",
      href: "/payments",
      value: String(paymentTrailAttentionCount),
      detail:
        paymentTrailAttentionCount > 0
          ? "Failed, voided, requested, checkout, or stale pending payment evidence needs review."
          : "Payment Trail has no open exception signal in the current read model.",
      tone: paymentTrailAttentionCount > 0 ? "warning" : "neutral"
    },
    {
      id: "partial-balances",
      label: "Finish balances",
      title: "Partially paid invoices",
      href: "/invoices?status=open",
      value: String(financialControl.partiallyPaidCount),
      detail:
        financialControl.partiallyPaidCount > 0
          ? "Partial payments left remaining balances for collections follow-through."
          : "No partially paid invoices have a remaining balance right now.",
      tone: financialControl.partiallyPaidCount > 0 ? "attention" : "neutral"
    }
  ];
  const financialSettingsLinks = [
    {
      href: "/settings/financial",
      title: "Tax and retainage defaults",
      detail:
        "Organization-owned financial defaults belong in Settings, then invoice records snapshot the applied values."
    },
    {
      href: "/settings/workflows",
      title: "Deposit, numbering, and workflow defaults",
      detail:
        "Ready Check behavior, deposit requirements, and next invoice numbers stay in workflow settings."
    },
    {
      href: "/settings/templates",
      title: "Invoice templates",
      detail:
        "Document templates are managed as organization-owned configuration, not edited inside collections queues."
    }
  ];

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title={`Financial Control for ${organizationContext.organization.displayName}`}
      description="Scan open money, overdue invoices, pending payment activity, and collection next moves across active work."
      ownership={{
        owns: "Financials owns billing readiness, AR, collections pressure, payment evidence, and invoice-to-payment continuity over canonical financial records.",
        acts: "Work open money through AR, Invoices, Payments, and Progress Billing; Dashboard and Reports only route attention here.",
        configuration: {
          href: "/settings/financial",
          label: "Financial settings",
          detail:
            "Tax, retainage, and financial defaults stay in Settings before records snapshot applied values."
        }
      }}
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open receivables
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.openReceivablesAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Overdue amount
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.overdueAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Deposits due
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.depositReceivablesAmount)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Retainage held
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(financialControl.retainageHeldAmount)}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Financial Control is a read-only owner view. Record-level work still
            happens in Invoices, Payments, and Progress Billing.
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
              href="/financials/accounting-readiness"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Accounting readiness
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
        <section className="border border-[#d6d6d6] bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Next Move
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
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

        <section className="border border-[#d6d6d6] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-4 py-3 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                Billing readiness
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                Completed work moving toward invoice
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Completed jobs, billing prerequisites, and draft invoices are
                surfaced from canonical jobs and invoices before collection
                pressure begins.
              </p>
            </div>
            <Link
              href={billingReadiness.nextMove.href}
              className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              {billingReadiness.nextMove.label}
            </Link>
          </div>
          <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-4">
            {billingReadiness.summaryCards.map((card) => (
              <div key={card.id} className="min-w-0 bg-white px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    {card.label}
                  </p>
                  <span
                    className={
                      card.tone === "warning"
                        ? "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                        : card.tone === "attention"
                          ? "rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                          : "rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                    }
                  >
                    {card.tone}
                  </span>
                </div>
                <p className="mt-3 text-xl font-semibold tracking-tight text-[#171717]">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {card.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-px bg-[#e5e5e5] lg:grid-cols-3">
            {[
              {
                id: "ready",
                title: "Ready for invoice review",
                items: billingReadiness.readyToInvoice,
                empty: "No completed work is waiting for invoice creation."
              },
              {
                id: "missing",
                title: "Missing prerequisites",
                items: billingReadiness.missingPrerequisites,
                empty: "No billing prerequisites are blocking completed work."
              },
              {
                id: "drafts",
                title: "Draft invoice review",
                items: billingReadiness.draftReview,
                empty: "No draft invoices need review right now."
              }
            ].map((lane) => (
              <div key={lane.id} className="min-w-0 bg-white">
                <div className="border-b border-[#e5e5e5] px-4 py-3">
                  <h3 className="text-sm font-semibold text-[#171717]">
                    {lane.title}
                  </h3>
                </div>
                <div className="divide-y divide-[#e5e5e5]">
                  {lane.items.length > 0 ? (
                    lane.items.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        href={item.actionHref}
                        className="block px-4 py-3 transition hover:bg-[#f8f8f8]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#171717]">
                              {item.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {item.customerName} - {item.projectName}
                            </p>
                          </div>
                          <span
                            className={
                              item.tone === "warning"
                                ? "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                                : item.tone === "attention"
                                  ? "rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                                  : "rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                            }
                          >
                            {item.invoiceReference ?? item.sourceLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {item.detail}
                        </p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666]">
                          {item.actionLabel}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-5 text-sm leading-5 text-slate-500">
                      {lane.empty}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {billingReadiness.alreadyInBilling.length > 0 ? (
            <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4 text-sm leading-6 text-slate-500 sm:px-5">
              {billingReadiness.alreadyInBilling.length} completed job
              {billingReadiness.alreadyInBilling.length === 1 ? "" : "s"}{" "}
              already have linked canonical invoice records, so this command
              does not propose duplicate billing.
            </div>
          ) : null}
        </section>

        <section className="border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-4 py-3 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
              Financial Command Center
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
              Cross-project finance action lanes
            </h2>
            <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
              Dashboard can prioritize and Project Workspace can explain
              context, but AR, collections, billing follow-through, and cash
              pressure are worked here against canonical invoices, payments,
              payment events, projects, and customers.
            </p>
          </div>
          <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-4">
            {commandCenterActionLanes.map((lane) => (
              <Link
                key={lane.id}
                href={lane.href}
                className="min-w-0 bg-white px-4 py-4 transition hover:bg-[#f8f8f8]"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                    {lane.label}
                  </p>
                  <span
                    className={
                      lane.tone === "warning"
                        ? "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                        : lane.tone === "attention"
                          ? "rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                          : "rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                    }
                  >
                    {lane.tone}
                  </span>
                </div>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-[#171717]">
                  {lane.title}
                </h3>
                <p className="mt-2 text-xl font-semibold tracking-tight text-[#171717]">
                  {lane.value}
                </p>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {lane.detail}
                </p>
              </Link>
            ))}
          </div>
          {financialControl.openInvoiceCount === 0 &&
          paymentTrailAttentionCount === 0 &&
          Number(financialControl.depositReceivablesAmount) === 0 ? (
            <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4 text-sm leading-6 text-slate-500 sm:px-5">
              No cross-project finance action is active right now. New open
              balances, deposit invoices, partial payments, overdue invoices,
              and Payment Trail exceptions will appear here when canonical
              records carry that pressure.
            </div>
          ) : null}
        </section>

        <details className="group space-y-4">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 border border-[#d6d6d6] bg-white px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Supporting finance detail
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                Links, signals, and receivables previews
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Secondary command links, configuration routing, review cards,
                and AR previews stay available below the finance action lanes.
              </p>
            </div>
            <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </summary>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Continuity map
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                Financial command center links
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Start here, then continue into the canonical workspace that owns
                the invoice, payment, project, customer, or SOV context. These
                are routing signals only.
              </p>
            </div>
            <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-3">
              {financialContinuityLinks.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="min-w-0 bg-white px-4 py-4 transition hover:bg-[#f8f8f8]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
                        {item.title}
                      </h3>
                    </div>
                    <span
                      className={
                        item.tone === "warning"
                          ? "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                          : item.tone === "attention"
                            ? "rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                            : "rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                      }
                    >
                      {item.tone}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-semibold tracking-tight text-[#171717]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {item.detail}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Command Center
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                Financial control signals
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                Read-only finance signals across AR, deposits, Payment Trail,
                retainage, and SOV-linked invoices. Each item routes back to the
                canonical workspace that owns the source record.
              </p>
            </div>
            <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-2 xl:grid-cols-5">
              {financialControl.commandSignals.map((signal) => (
                <Link
                  key={signal.id}
                  href={signal.href}
                  className="min-w-0 bg-white px-4 py-4 transition hover:bg-[#f8f8f8]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                      {signal.label}
                    </p>
                    <span
                      className={
                        signal.tone === "warning"
                          ? "rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700"
                          : signal.tone === "attention"
                            ? "rounded-full border border-[#e4d7ca] bg-[#fffcf7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f5b32]"
                            : "rounded-full border border-[#d6d6d6] bg-[#f8f8f8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                      }
                    >
                      {signal.tone}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-[#171717]">
                    {signal.id === "payment-trail"
                      ? signal.value
                      : formatMoney(signal.value)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {signal.detail}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Settings boundary
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                Configuration lives in Settings
              </h2>
              <p className="mt-1 max-w-[78ch] text-sm leading-6 text-slate-500">
                This workspace acts on existing financial records. Tax,
                retainage, template, numbering, deposit, and workflow defaults
                remain administrative configuration.
              </p>
            </div>
            <div className="grid gap-px bg-[#e5e5e5] md:grid-cols-3">
              {financialSettingsLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-w-0 bg-white px-4 py-4 transition hover:bg-[#f8f8f8]"
                >
                  <h3 className="text-sm font-semibold text-[#171717]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {item.detail}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:auto-rows-fr xl:grid-cols-3">
            <ManagerDashboardCard
              eyebrow="Collections"
              title="Overdue invoices"
              description="Past-due invoices with balance still owed."
              actionHref="/financials/accounts-receivable"
              actionLabel="Review AR"
              items={readModel.overdueInvoices.slice(0, 5).map((invoice) => ({
                href: `/invoices/${invoice.id}`,
                title: invoice.referenceNumber,
                subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "No project"}`,
                meta: invoice.dueDate
                  ? `Due ${formatDate(invoice.dueDate)}`
                  : "No due date",
                badge: formatStatusLabel(invoice.status),
                trailing: formatMoney(invoice.balanceDueAmount)
              }))}
              emptyTitle="No overdue invoices need follow-up right now."
              emptyDescription="Past-due balances will surface here for collections review."
            />

            <ManagerDashboardCard
              eyebrow="Payment activity"
              title="Pending checkout"
              description="Pending payments and checkout activity that still need a customer or payment outcome."
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
              emptyDescription="Pending payments will appear here when follow-through is needed."
            />

            <ManagerDashboardCard
              eyebrow="Payment attention"
              title="Payment events needing review"
              description="Failed, voided, or in-progress payment activity tied back to invoices."
              actionHref="/payments"
              actionLabel="Open payments"
              items={financialControl.paymentEventsNeedingReview
                .slice(0, 5)
                .map((event) => ({
                  href: event.href,
                  title: event.invoiceReference,
                  subtitle: `${event.customerName} - ${event.projectName}`,
                  meta: event.nextMoveLabel,
                  badge: event.label,
                  trailing: event.reason
                }))}
              emptyTitle="No payment events need review."
              emptyDescription="Payment Trail attention will appear here when follow-through is needed."
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ManagerDashboardCard
              eyebrow="Project collections"
              title="Project collection attention"
              description="Projects carrying open invoice or payment follow-through."
              actionHref="/financials/accounts-receivable"
              actionLabel="Review AR"
              items={financialControl.projectCollectionAttention
                .slice(0, 5)
                .map((project) => ({
                  href: project.href,
                  title: project.projectName,
                  subtitle: project.customerName,
                  meta: project.reason,
                  badge: project.nextMoveLabel,
                  trailing: formatMoney(project.openBalanceAmount)
                }))}
              emptyTitle="No project collection attention."
              emptyDescription="Projects with open invoice pressure will appear here."
            />
            <ManagerDashboardCard
              eyebrow="Receivables"
              title="Invoices needing attention"
              description="Open invoices ordered by payment urgency, due date, and balance."
              actionHref="/financials/accounts-receivable"
              actionLabel="Open AR"
              items={financialControl.invoicesNeedingAttention
                .slice(0, 5)
                .map((invoice) => ({
                  href: invoice.href,
                  title: invoice.referenceNumber,
                  subtitle: `${invoice.customerName} - ${invoice.projectName}`,
                  meta: invoice.reason,
                  badge: invoice.nextMoveLabel,
                  trailing: formatMoney(invoice.balanceDueAmount)
                }))}
              emptyTitle="No invoices need attention."
              emptyDescription="Open balances and follow-up items will appear here."
            />
            <ManagerDashboardCard
              eyebrow="Accounting Readiness"
              title="Export and reconciliation prep"
              description="Invoice, payment, tax, retainage, customer, and project context for accounting review."
              actionHref="/financials/accounting-readiness"
              actionLabel="Review prep"
              items={[
                {
                  href: "/financials/accounting-readiness",
                  title: "Accounting review workspace",
                  subtitle:
                    "Read-only invoice and payment rows with export-ready columns.",
                  meta: "Review for accounting",
                  badge: "Export prep",
                  trailing: "Open"
                },
                {
                  href: "/financials/accounting-readiness",
                  title: "Tax and retainage snapshots",
                  subtitle:
                    "Existing invoice snapshots surfaced without recalculating financial truth.",
                  meta: "Source records",
                  badge: "Read-only",
                  trailing: "Open"
                }
              ]}
              emptyTitle="Accounting readiness is available."
              emptyDescription="Open the workspace to review invoice and payment export prep."
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
                    Highest-priority open balances with customer, project,
                    estimate, and job context where those links exist.
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
                  readModel.collectionOpportunities
                    .slice(0, 8)
                    .map((invoice) => (
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
                          {invoice.dueDate
                            ? formatDate(invoice.dueDate)
                            : "No due date"}
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
                      Outstanding invoice balances will appear here as billing
                      moves through send and payment collection.
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
                  Derived from existing invoices and payments. This view does
                  not create accounting entries, payment records, or external
                  sync.
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
        </details>
      </div>
    </ContractorWorkspacePage>
  );
}
