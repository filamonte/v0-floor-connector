import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";

export default function AccountsReceivablePage() {
  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounts Receivable"
      description="Accounts Receivable is defined here as the future module-home workspace for money owed to the business, collections follow-up, and receivable-specific visibility built on the same canonical invoice and payment records."
      summary={
        <div className="rounded-[8px] border border-[#d7dce4] bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">
            Status
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-[#17243b]">
            Structure defined
          </p>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This route is intentionally a spec-first shell. It explains what AR will own
            later without introducing a new ledger, aging engine, or duplicate billing
            dashboard today.
          </p>
        ),
        actionSlot: (
          <>
            <Link
              href="/financials"
              className="inline-flex items-center rounded-[4px] border border-[#cfd6e0] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Back to Financials Home
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center rounded-[4px] border border-[#cfd6e0] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Open invoices
            </Link>
          </>
        )
      }}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="border border-[#d7dce4] bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
            Intended purpose
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#17243b]">
            What this module home will own
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <p>Track open balances owed by customers across projects.</p>
            <p>Surface aging, overdue follow-up, and collections-oriented queues later.</p>
            <p>
              Route users into canonical invoice and payment records instead of building a
              second billing system.
            </p>
          </div>
        </section>

        <section className="border border-[#d7dce4] bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
            Not built yet
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#17243b]">
            Out of scope for this pass
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <p>No AR aging engine or bucket logic.</p>
            <p>No collector assignment workflow or collection-note system.</p>
            <p>No new schema, reporting engine, or invoice/payment behavior changes.</p>
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
