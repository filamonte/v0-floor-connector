"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  Settings2,
  UserRound,
  Wrench
} from "lucide-react";

type FinancialSummaryBarProps = {
  totalLabel: string;
  subtotalAmount: string;
  markupAmount: string;
  taxableSubtotal: string;
  exemptSubtotal: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  showMarkup: boolean;
  visibleItemCount: number;
};

const ICON_WRAPPER_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-white";

function renderAdjustment(value: string) {
  return value.startsWith("-") ? value : `-${value}`;
}

export function FinancialSummaryBar({
  totalLabel,
  subtotalAmount,
  markupAmount,
  taxableSubtotal,
  exemptSubtotal,
  taxAmount,
  discountAmount,
  totalAmount,
  showMarkup,
  visibleItemCount
}: FinancialSummaryBarProps) {
  return (
    <section className="border-b border-[#e6e9ef] bg-white">
      <div className="flex flex-col gap-4 px-4 py-3">
        <div className="flex min-h-[62px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#27b270]">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <span className="block text-[15px] font-semibold text-[#23395d]">
                Financial Summary
              </span>
              <span className="text-[12px] text-[#7c8ba3]">
                {visibleItemCount} visible estimate item{visibleItemCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`${ICON_WRAPPER_CLASS} bg-[#dbe7ff] text-[#3465d9]`}>
              <ClipboardList className="h-4 w-4" />
            </span>
            <span className={`${ICON_WRAPPER_CLASS} bg-[#dff6e8] text-[#17a05a]`}>
              <UserRound className="h-4 w-4" />
            </span>
            <span className={`${ICON_WRAPPER_CLASS} bg-[#fff0c9] text-[#f0a900]`}>
              <Wrench className="h-4 w-4" />
            </span>
            <span className={`${ICON_WRAPPER_CLASS} bg-[#ebe4ff] text-[#7a57db]`}>
              <BriefcaseBusiness className="h-4 w-4" />
            </span>
            <span className={`${ICON_WRAPPER_CLASS} bg-[#ffe5dc] text-[#ef7d32]`}>
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className={`${ICON_WRAPPER_CLASS} bg-[#f1f4f8] text-[#607492]`}>
              <Settings2 className="h-4 w-4" />
            </span>
          </div>

          <div className="text-right text-[16px] font-semibold text-[#23395d]">
            {totalLabel}
          </div>
        </div>

        <div className="grid gap-3 text-[12px] text-[#6d7d95] md:grid-cols-3 xl:grid-cols-7">
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Subtotal</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">{subtotalAmount}</div>
          </div>
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Markup</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">
              {showMarkup ? markupAmount : "Hidden"}
            </div>
          </div>
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Taxable</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">
              {taxableSubtotal}
            </div>
          </div>
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Exempt</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">
              {exemptSubtotal}
            </div>
          </div>
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Tax</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">{taxAmount}</div>
          </div>
          <div className="rounded-[8px] bg-[#f7f8fb] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#8a98ad]">Discount</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">
              {renderAdjustment(discountAmount)}
            </div>
          </div>
          <div className="rounded-[8px] bg-[#fff1e4] px-3 py-2">
            <div className="uppercase tracking-[0.12em] text-[#b26a32]">Total</div>
            <div className="mt-1 text-[16px] font-semibold text-[#23395d]">{totalAmount}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
