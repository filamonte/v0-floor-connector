import Link from "next/link";

import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";

export default function AccountsPayablePage() {
  return (
    <ContractorWorkspacePage
      eyebrow="Financials"
      title="Accounts Payable"
      description="Accounts Payable is defined here as the future module-home workspace for money the business owes out, including vendor bills, due dates, and outgoing-payment workflow once payable-side canonical records are introduced."
      summary={
        <div className="rounded-[8px] border border-[#d6d6d6] bg-white px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#666666]">
            Status
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-[#171717]">
            Structure defined
          </p>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            This route exists to establish AP ownership and navigation now. It does not
            create bills, payable balances, or outgoing-payment logic in this phase.
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
              href="/bills"
              className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#334155] transition hover:bg-slate-50"
            >
              Open bills placeholder
            </Link>
          </>
        )
      }}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="border border-[#d6d6d6] bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Intended purpose
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
            What this module home will own
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <p>Track vendor obligations and bills due across the organization.</p>
            <p>Surface due-soon, overdue, and outgoing-payment workflows later.</p>
            <p>
              Keep payable-side work grouped under Financials once canonical payable
              records exist.
            </p>
          </div>
        </section>

        <section className="border border-[#d6d6d6] bg-white px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Not built yet
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight text-[#171717]">
            Out of scope for this pass
          </h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <p>No AP schema or vendor-bill ledger.</p>
            <p>No outgoing-payment workflow or payable reporting engine.</p>
            <p>No changes to invoices, payments, or existing bill placeholders.</p>
          </div>
        </section>
      </div>
    </ContractorWorkspacePage>
  );
}
