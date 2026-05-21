"use client";

import { useMemo, useState } from "react";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ProgressBillingFormItem = {
  id: string;
  name: string;
  description: string | null;
  scheduledValueAmount: string;
  percentComplete: string;
  minimumAllowedPercentComplete: string;
  previousBilledAmount: string;
  retainagePercentage: string;
};

type ProgressBillingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  scheduleOfValuesId: string;
  issueDateDefault: string;
  dueDateDefault: string | null;
  notesDefault: string | null;
  draftInvoice: {
    id: string;
    referenceNumber: string;
  } | null;
  items: ProgressBillingFormItem[];
};

function parseAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function ProgressBillingForm({
  action,
  scheduleOfValuesId,
  issueDateDefault,
  dueDateDefault,
  notesDefault,
  draftInvoice,
  items
}: ProgressBillingFormProps) {
  const [percentCompleteById, setPercentCompleteById] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        items.map((item) => [item.id, item.percentComplete])
      )
  );

  const derivedItems = useMemo(
    () =>
      items.map((item) => {
        const scheduledValueAmount = parseAmount(item.scheduledValueAmount);
        const previousBilledAmount = parseAmount(item.previousBilledAmount);
        const minimumAllowedPercentComplete = parseAmount(
          item.minimumAllowedPercentComplete
        );
        const nextPercentComplete = Math.max(
          parseAmount(percentCompleteById[item.id] ?? item.percentComplete),
          minimumAllowedPercentComplete
        );
        const completedToDateAmount = roundMoney(
          scheduledValueAmount * (nextPercentComplete / 100)
        );
        const currentToBillAmount = roundMoney(
          Math.max(0, completedToDateAmount - previousBilledAmount)
        );
        const retainageHeldCurrentAmount = roundMoney(
          currentToBillAmount * (parseAmount(item.retainagePercentage) / 100)
        );
        const balanceToFinishAmount = roundMoney(
          Math.max(0, scheduledValueAmount - completedToDateAmount)
        );

        return {
          ...item,
          nextPercentComplete: nextPercentComplete.toFixed(2),
          completedToDateAmount,
          currentToBillAmount,
          retainageHeldCurrentAmount,
          balanceToFinishAmount
        };
      }),
    [items, percentCompleteById]
  );

  const totals = useMemo(
    () =>
      derivedItems.reduce(
        (sum, item) => ({
          scheduledValueAmount: sum.scheduledValueAmount + parseAmount(item.scheduledValueAmount),
          previousBilledAmount: sum.previousBilledAmount + parseAmount(item.previousBilledAmount),
          currentToBillAmount: sum.currentToBillAmount + item.currentToBillAmount,
          retainageHeldCurrentAmount:
            sum.retainageHeldCurrentAmount + item.retainageHeldCurrentAmount,
          balanceToFinishAmount: sum.balanceToFinishAmount + item.balanceToFinishAmount
        }),
        {
          scheduledValueAmount: 0,
          previousBilledAmount: 0,
          currentToBillAmount: 0,
          retainageHeldCurrentAmount: 0,
          balanceToFinishAmount: 0
        }
      ),
    [derivedItems]
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="scheduleOfValuesId" value={scheduleOfValuesId} />

      <QuickCreateFormShell
        eyebrow="Progress billing"
        title={
          draftInvoice
            ? `Update draft ${draftInvoice.referenceNumber}`
            : "Build draft progress invoice"
        }
        description="Use real schedule-of-values completion state to prepare a canonical invoice from approved scope instead of billing from a disconnected spreadsheet."
        footer={
          draftInvoice
            ? `This workflow updates the existing draft progress invoice ${draftInvoice.referenceNumber} instead of creating a duplicate draft.`
            : "The resulting billing record stays on the canonical invoice chain and links back to these schedule-of-values items."
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Issue date
            </span>
            <input
              type="date"
              name="issueDate"
              defaultValue={issueDateDefault}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Due date
            </span>
            <input
              type="date"
              name="dueDate"
              defaultValue={dueDateDefault ?? ""}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <div className="rounded-2xl border border-[#eadfce] bg-[#fbf5ee] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
              Current billing
            </p>
            <p className="mt-2 text-xl font-semibold text-[#2b2118]">
              {formatMoney(totals.currentToBillAmount)}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#665446]">
              Retainage on this billing run:{" "}
              {formatMoney(totals.retainageHeldCurrentAmount)}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Notes</span>
          <textarea
            name="notes"
            defaultValue={notesDefault ?? ""}
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Optional billing notes carried onto the canonical invoice"
          />
        </label>
      </QuickCreateFormShell>

      <section className="rounded-[1.75rem] border border-[#e3d6c7] bg-white shadow-[0_18px_42px_-36px_rgba(57,43,30,0.24)]">
        <div className="border-b border-[#efe3d6] px-5 py-4 sm:px-6">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_120px_120px_120px_120px_120px_120px] gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b6959] lg:grid">
            <span>Scope item</span>
            <span className="text-right">Scheduled</span>
            <span className="text-right">Previously billed</span>
            <span className="text-right">Percent complete</span>
            <span className="text-right">Current to bill</span>
            <span className="text-right">Retainage</span>
            <span className="text-right">Balance</span>
          </div>
          <p className="text-sm leading-6 text-[#665446] lg:hidden">
            Update completion percentages and review the resulting current billing values before the draft invoice is built.
          </p>
        </div>

        <div className="divide-y divide-[#efe4d7]">
          {derivedItems.map((item) => (
            <div key={item.id} className="px-5 py-4 sm:px-6">
              <input type="hidden" name="itemId" value={item.id} />
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_120px_120px_120px_120px_120px_120px] lg:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2b2118]">{item.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#665446]">
                    {item.description ?? "Approved estimate scope item"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#a4581a]">
                    Retainage {item.retainagePercentage}% | minimum billed progress{" "}
                    {item.minimumAllowedPercentComplete}%
                  </p>
                </div>

                <div className="text-sm lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Scheduled value
                  </p>
                  <p className="font-medium text-[#2b2118]">
                    {formatMoney(parseAmount(item.scheduledValueAmount))}
                  </p>
                </div>

                <div className="text-sm lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Previously billed
                  </p>
                  <p className="font-medium text-[#2b2118]">
                    {formatMoney(parseAmount(item.previousBilledAmount))}
                  </p>
                </div>

                <label className="block lg:text-right">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Percent complete
                  </span>
                  <input
                    type="number"
                    name="percentComplete"
                    min={item.minimumAllowedPercentComplete}
                    max="100"
                    step="0.01"
                    value={percentCompleteById[item.id] ?? item.percentComplete}
                    onChange={(event) =>
                      setPercentCompleteById((current) => ({
                        ...current,
                        [item.id]: event.target.value
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100 lg:mt-0 lg:max-w-[110px] lg:ml-auto"
                  />
                </label>

                <div className="text-sm lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Current to bill
                  </p>
                  <p className="font-semibold text-[#2b2118]">
                    {formatMoney(item.currentToBillAmount)}
                  </p>
                </div>

                <div className="text-sm lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Retainage held
                  </p>
                  <p className="font-medium text-[#2b2118]">
                    {formatMoney(item.retainageHeldCurrentAmount)}
                  </p>
                </div>

                <div className="text-sm lg:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959] lg:hidden">
                    Balance to finish
                  </p>
                  <p className="font-medium text-[#2b2118]">
                    {formatMoney(item.balanceToFinishAmount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#efe3d6] bg-[#fffaf3] px-5 py-4 sm:px-6">
          <div className="grid gap-3 text-sm leading-6 text-[#665446] md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959]">
                Scheduled total
              </p>
              <p className="mt-1 font-semibold text-[#2b2118]">
                {formatMoney(totals.scheduledValueAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959]">
                Previously billed
              </p>
              <p className="mt-1 font-semibold text-[#2b2118]">
                {formatMoney(totals.previousBilledAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959]">
                Current billing
              </p>
              <p className="mt-1 font-semibold text-[#2b2118]">
                {formatMoney(totals.currentToBillAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6959]">
                Balance to finish
              </p>
              <p className="mt-1 font-semibold text-[#2b2118]">
                {formatMoney(totals.balanceToFinishAmount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton
          pendingLabel={
            draftInvoice
              ? "Updating draft progress invoice..."
              : "Building draft progress invoice..."
          }
          className="sm:min-w-[240px]"
        >
          <span>
            {draftInvoice
              ? "Update draft progress invoice"
              : "Build draft progress invoice"}
          </span>
        </AuthSubmitButton>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Billing values are derived from canonical approved scope, already billed invoice
          line items, and the percent-complete state you set here.
        </p>
      </div>
    </form>
  );
}
