"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { DetailPanel } from "@/components/detail-panel";

type ChangeOrderApprovalNextStepsPanelProps = {
  changeOrder: {
    id: string;
    referenceNumber: string;
    priceAdjustment: string;
    invoiceId: string | null;
    appliedInvoiceLineItemId: string | null;
    latestCommercialSnapshotId: string | null;
    latestCommercialSnapshotItemIds: string[];
  };
  addToSovAction: (formData: FormData) => void | Promise<void>;
  invoiceDirectlyAction: (formData: FormData) => void | Promise<void>;
  scheduleOfValuesOptions: Array<{
    id: string;
    estimateReferenceNumber: string;
    estimateStatus: string;
    scheduledValueTotal: string;
  }>;
  initialOpen?: boolean;
};

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

export function ChangeOrderApprovalNextStepsPanel({
  changeOrder,
  addToSovAction,
  invoiceDirectlyAction,
  scheduleOfValuesOptions,
  initialOpen = false
}: ChangeOrderApprovalNextStepsPanelProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen, changeOrder.id, changeOrder.latestCommercialSnapshotId]);

  const snapshotReady =
    Boolean(changeOrder.latestCommercialSnapshotId) &&
    changeOrder.latestCommercialSnapshotItemIds.length > 0;
  const invoiceAlreadyApplied =
    Boolean(changeOrder.invoiceId) && Boolean(changeOrder.appliedInvoiceLineItemId);
  const canDirectInvoice = snapshotReady && !invoiceAlreadyApplied;
  const canAddToSov = snapshotReady && Number(changeOrder.priceAdjustment) > 0;
  const hasSingleSovTarget = scheduleOfValuesOptions.length === 1;
  const hasMultipleSovTargets = scheduleOfValuesOptions.length > 1;

  if (!isOpen) {
    return (
      <div className="rounded-[1.75rem] border border-[#e3d6c7] bg-[#fbf5ee] px-5 py-4 text-sm leading-6 text-[#665446]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a4581a]">
              Change Order Next Steps
            </p>
            <p className="mt-2">
              {changeOrder.referenceNumber} is approved for{" "}
              {formatMoney(changeOrder.priceAdjustment)}. Reopen this panel any time to decide
              whether billing should wait, invoice directly, or stay out of SOV for now.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#d8731f] bg-[#d8731f] px-4 text-sm font-medium text-white transition hover:bg-[#bf6519]"
          >
            Open Next Steps
          </button>
        </div>
      </div>
    );
  }

  return (
    <DetailPanel
      title="Change Order Next Steps"
      description="Approval is complete. Keep downstream billing additive, lineage-backed, and explicit from this same change-order workspace."
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Add To SOV
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Additive rows only</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Approved positive change-order snapshot rows now append into the selected schedule of
              values as additive scope. Existing estimate-seeded rows stay untouched.
            </p>
            <div className="mt-4 space-y-3">
              {canAddToSov && hasSingleSovTarget ? (
                <form action={addToSovAction}>
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <input
                    type="hidden"
                    name="scheduleOfValuesId"
                    value={scheduleOfValuesOptions[0]?.id ?? ""}
                  />
                  <AuthSubmitButton pendingLabel="Appending to SOV...">
                    <span>Add To SOV</span>
                  </AuthSubmitButton>
                </form>
              ) : canAddToSov && hasMultipleSovTargets ? (
                <form action={addToSovAction} className="space-y-3">
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Select SOV
                    </span>
                    <select
                      name="scheduleOfValuesId"
                      defaultValue=""
                      className="h-10 w-full rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
                      required
                    >
                      <option value="" disabled>
                        Choose a schedule of values
                      </option>
                      {scheduleOfValuesOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.estimateReferenceNumber} | {formatMoney(option.scheduledValueTotal)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <AuthSubmitButton pendingLabel="Appending to SOV...">
                    <span>Add To SOV</span>
                  </AuthSubmitButton>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-400"
                >
                  Add To SOV
                </button>
              )}
              {!snapshotReady ? (
                <p className="text-xs leading-5 text-amber-700">
                  Re-approve the change order if the immutable commercial snapshot is missing.
                </p>
              ) : null}
              {snapshotReady && Number(changeOrder.priceAdjustment) <= 0 ? (
                <p className="text-xs leading-5 text-amber-700">
                  Negative and zero-value change orders stay off the SOV chain and must be billed
                  directly on invoices.
                </p>
              ) : null}
              {snapshotReady && canAddToSov && scheduleOfValuesOptions.length === 0 ? (
                <p className="text-xs leading-5 text-amber-700">
                  No schedule of values exists for this project yet. Build or approve the estimate
                  SOV first.
                </p>
              ) : null}
              {hasMultipleSovTargets ? (
                <p className="text-xs leading-5 text-slate-500">
                  Multiple schedules of values exist for this project, so the billing team must
                  choose the exact target.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Invoice Directly
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {invoiceAlreadyApplied ? "Already billed" : "Snapshot-backed invoice rows"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {invoiceAlreadyApplied
                ? "The approved change-order snapshot already created real invoice line items on the canonical billing chain."
                : "This writes invoice rows from the approved change-order snapshot only, including negative credit values when the approved amount is below zero."}
            </p>
            <div className="mt-4">
              {invoiceAlreadyApplied && changeOrder.invoiceId ? (
                <Link
                  href={`/invoices/${changeOrder.invoiceId}`}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open Invoice
                </Link>
              ) : canDirectInvoice ? (
                <form action={invoiceDirectlyAction}>
                  <input type="hidden" name="changeOrderId" value={changeOrder.id} />
                  <AuthSubmitButton pendingLabel="Applying approved billing...">
                    <span>Invoice Directly</span>
                  </AuthSubmitButton>
                </form>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-400"
                >
                  Invoice Directly
                </button>
              )}
            </div>
            {!snapshotReady ? (
              <p className="mt-3 text-xs leading-5 text-amber-700">
                Re-approve the change order if the immutable commercial snapshot is missing.
              </p>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Do Later
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Leave scope approved</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No billing action runs. The approved change order stays ready on this page until the
              team chooses SOV or invoice handling later.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Do Later
            </button>
          </section>
        </div>
      </div>
    </DetailPanel>
  );
}
