import Link from "next/link";

import { AccountingExportActions } from "@/components/accounting-export-actions";
import { AppEmptyState } from "@/components/app-empty-state";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import {
  accountingExportColumns,
  buildAccountingExportCsv
} from "@/lib/financials/accounting-export";
import { getAccountingReadinessReadModel } from "@/lib/financials/accounting-readiness-read-model";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";

function formatMoney(amount: string | number | null) {
  if (amount === null) {
    return "Not available";
  }

  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function toneClassName(tone: string) {
  switch (tone) {
    case "warning":
      return "border-red-200 bg-red-50 text-red-800";
    case "attention":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    default:
      return "border-[#e5e5e5] bg-[#f8f8f8] text-[#4f4f4f]";
  }
}

export default async function AccountingReadinessPage() {
  const user = await requireAuthenticatedUser(
    "/financials/accounting-readiness"
  );
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 text-sm leading-6 text-amber-900">
        Accounting Readiness needs an active organization before invoice and
        payment records can be reviewed.
      </section>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const readiness = await getAccountingReadinessReadModel({
    organizationId: organizationContext.organization.id,
    todayIso
  });
  const accountingExportCsv = buildAccountingExportCsv({
    invoices: readiness.invoiceRows,
    payments: readiness.paymentRows
  });
  const exportFilename = `floorconnector-accounting-readiness-${todayIso}.csv`;

  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounting Readiness"
      description="Review invoice, payment, tax, retainage, customer, and project context before accounting export or reconciliation work."
      summary={
        <div className="grid gap-px border border-[#d6d6d6] bg-[#d6d6d6] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Total invoiced
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readiness.summary.totalInvoiced)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Total paid
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readiness.summary.totalPaid)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Open balance
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {formatMoney(readiness.summary.totalOpen)}
            </p>
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
              Payments needing review
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
              {readiness.summary.paymentsNeedingReview}
            </p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Accounting Readiness is read-only export prep. It does not create a
            ledger, sync with accounting software, post journal entries, or
            change invoice and payment behavior.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href="/financials"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Back to Financials
            </Link>
            <Link
              href="/financials/accounts-receivable"
              className="inline-flex items-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Open AR
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
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                {readiness.nextMove.label}
              </h2>
              <p className="mt-1 max-w-[72ch] text-sm leading-6 text-slate-500">
                {readiness.nextMove.reason}
              </p>
            </div>
            <Link
              href={readiness.nextMove.href}
              className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Open next move
            </Link>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <section className="border border-[#d6d6d6] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Invoice review
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              {readiness.summary.invoiceCount}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {readiness.summary.openInvoiceCount} open /{" "}
              {readiness.summary.paidInvoiceCount} paid
            </p>
          </section>
          <section className="border border-[#d6d6d6] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Tax snapshot
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(readiness.summary.taxCollected)}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Uses existing invoice tax reporting entries when available.
            </p>
          </section>
          <section className="border border-[#d6d6d6] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Retainage snapshot
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              {formatMoney(readiness.summary.retainageHeld)}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Uses existing invoice retainage-held snapshots.
            </p>
          </section>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.75fr)]">
          <section className="overflow-hidden border border-[#d6d6d6] bg-white">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Export prep
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
                Invoice accounting review
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Export-ready columns over existing invoice and payment
                snapshots. Open a source invoice to inspect or correct the
                canonical record.
              </p>
            </div>

            {readiness.invoiceRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] divide-y divide-slate-200 text-sm">
                  <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Customer / project</th>
                      <th className="px-5 py-3">Dates</th>
                      <th className="px-5 py-3 text-right">Tax / retainage</th>
                      <th className="px-5 py-3 text-right">Paid / balance</th>
                      <th className="px-5 py-3">Attention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {readiness.invoiceRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <Link
                            href={row.href}
                            className="font-semibold text-slate-950 transition hover:text-brand-700"
                          >
                            {row.referenceNumber}
                          </Link>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                            {row.statusLabel}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {row.customerHref ? (
                            <Link
                              href={row.customerHref}
                              className="font-medium text-slate-700 transition hover:text-brand-700"
                            >
                              {row.customerName}
                            </Link>
                          ) : (
                            <p className="font-medium text-slate-700">
                              {row.customerName}
                            </p>
                          )}
                          {row.projectHref ? (
                            <Link
                              href={row.projectHref}
                              className="mt-1 block text-sm leading-6 text-brand-700 transition hover:text-brand-800"
                            >
                              {row.projectName}
                            </Link>
                          ) : (
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {row.projectName}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          <p>Issued {formatDate(row.issueDate)}</p>
                          <p className="mt-1">Due {formatDate(row.dueDate)}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-700">
                          <p>Tax {formatMoney(row.taxCollectedAmount)}</p>
                          <p className="mt-1">
                            Retainage {formatMoney(row.retainageHeldAmount)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-700">
                          <p>Paid {formatMoney(row.paidAmount)}</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            Balance {formatMoney(row.balanceDueAmount)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClassName(
                              row.tone
                            )}`}
                          >
                            {row.attentionLabel ?? row.paymentStatusLabel}
                          </span>
                          <p className="mt-2 max-w-[24ch] text-xs leading-5 text-slate-500">
                            {row.attentionReason ??
                              "Ready for accounting review."}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8">
                <AppEmptyState
                  eyebrow="No accounting rows"
                  title="No invoice records are ready for accounting review yet"
                  description="Invoices and payments will appear here once they exist in the canonical financial workflow."
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Reconciliation attention
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#171717]">
                  Items to review
                </h3>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {readiness.attentionItems.length > 0 ? (
                  readiness.attentionItems.slice(0, 8).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block px-5 py-3 transition hover:bg-[#f8f8f8]"
                    >
                      <span
                        className={`inline-flex rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClassName(
                          item.tone
                        )}`}
                      >
                        {item.label}
                      </span>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.reason}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-5">
                    <p className="text-sm font-semibold text-[#171717]">
                      No reconciliation attention is visible.
                    </p>
                    <p className="mt-2 text-sm leading-5 text-slate-500">
                      Failed, voided, pending, and checkout-started payment
                      signals will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="border border-[#d6d6d6] bg-white">
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Export-ready columns
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#171717]">
                  Copy or download CSV
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Export prep uses the rows already loaded on this page. It does
                  not sync accounting software, store a file, or change invoice
                  and payment status.
                </p>
              </div>
              <div className="border-b border-[#e5e5e5] px-5 py-4">
                <AccountingExportActions
                  csvContent={accountingExportCsv}
                  filename={exportFilename}
                  disabled={readiness.invoiceRows.length === 0}
                />
              </div>
              <div className="grid grid-cols-1 gap-px bg-[#e5e5e5] sm:grid-cols-2">
                {accountingExportColumns.map((column) => (
                  <div key={column} className="bg-white px-4 py-2 text-sm">
                    {column}
                  </div>
                ))}
              </div>
            </section>
          </section>
        </section>

        <section className="overflow-hidden border border-[#d6d6d6] bg-white">
          <div className="border-b border-[#e5e5e5] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Payment review
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#171717]">
              Payment Trail prep
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Existing payments with invoice, customer, project, method, and
              source context for reconciliation review.
            </p>
          </div>

          {readiness.paymentRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Customer / project</th>
                    <th className="px-5 py-3">Method / source</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {readiness.paymentRows.slice(0, 20).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {formatDate(row.paymentDate)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {row.statusLabel}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {row.invoiceHref ? (
                          <Link
                            href={row.invoiceHref}
                            className="font-medium text-brand-700 transition hover:text-brand-800"
                          >
                            {row.invoiceReference}
                          </Link>
                        ) : (
                          <span>{row.invoiceReference}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <p>{row.customerName}</p>
                        <p className="mt-1">{row.projectName}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <p>{row.paymentMethod}</p>
                        <p className="mt-1">{row.paymentSource}</p>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-950">
                        {formatMoney(row.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8">
              <AppEmptyState
                eyebrow="No payments"
                title="No payment records are available yet"
                description="Recorded and pending payments will appear here when payment activity exists."
              />
            </div>
          )}
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
