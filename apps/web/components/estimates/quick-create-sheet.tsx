"use client";

import { Link2, X } from "lucide-react";

import { CustomerSelectorModal } from "@/components/estimates/customer-selector-modal";

type QuickCreateSheetProps = {
  open?: boolean;
  customerOptions: Array<{ id: string; label: string }>;
  leadOptions?: Array<{ id: string; label: string }>;
  projectOpportunityLabel?: string;
  title?: string;
  estimateNumber?: string;
  estimatorLabel: string;
  showCustomerSelector?: boolean;
  showAssociateProjectDialog?: boolean;
};

export function QuickCreateSheet({
  open = true,
  customerOptions,
  leadOptions = [],
  projectOpportunityLabel = "",
  title = "",
  estimateNumber = "",
  estimatorLabel,
  showCustomerSelector = false,
  showAssociateProjectDialog = false,
}: QuickCreateSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/35" />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="text-[20px] font-semibold text-slate-900">Add Estimate</div>
          <button type="button" className="text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4 rounded-l-2xl border-l-2 border-[#1e3a5f] pl-5">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-700">Project/Opportunity</span>
              <div className="h-10 border-b border-slate-200 text-sm text-slate-700">{projectOpportunityLabel}</div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-700">Title*</span>
              <div className="h-10 border-b border-slate-200 text-sm text-slate-700">{title}</div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-700">Customer*</span>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between border-b border-slate-200 text-left text-sm text-slate-500"
              >
                <span>Select customer</span>
                <span className="text-slate-400">Open</span>
              </button>
            </label>

            <div className="grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-[1fr_1fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">EST. #*</span>
                <div className="h-10 border-b border-slate-200 text-sm text-slate-700">{estimateNumber}</div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-700">Estimator</span>
                <div className="flex h-10 items-center gap-3 border-b border-slate-200 text-sm text-slate-700">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                    {estimatorLabel.slice(0, 2).toUpperCase()}
                  </span>
                  <span>{estimatorLabel}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-5 py-4">
          <button type="button" className="h-11 w-full rounded-lg bg-[#ef7d32] text-sm font-semibold text-white">
            Create Estimate
          </button>
        </div>
      </aside>

      <CustomerSelectorModal open={showCustomerSelector} customers={customerOptions} leads={leadOptions} />

      {showAssociateProjectDialog ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-6">
          <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#ef7d32]">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="mb-3 text-[22px] font-semibold text-slate-900">Associate a Project</h3>
            <p className="mb-5 text-sm leading-6 text-slate-600">
              There is a Project associated with this customer. Do you want to assign it to this estimate now?
            </p>
            <div className="mb-4 flex items-center justify-center gap-3">
              <button type="button" className="rounded-lg bg-[#244a84] px-6 py-2 text-sm font-semibold text-white">
                Yes
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-600"
              >
                No
              </button>
            </div>
            <label className="mb-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <input type="checkbox" readOnly />
              Do not ask me this again
            </label>
            <p className="text-sm text-slate-500">
              You can update it anytime in your <span className="text-[#244a84] underline">Estimates Settings</span>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
