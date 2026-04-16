"use client";

import { useRef, useState, useTransition } from "react";
import type { Estimate, EstimateLineItem, Project } from "@floorconnector/types";

type EstimateProjectOption = Pick<Project, "id" | "name" | "customerId"> & {
  customerName?: string | null;
};

type EditableEstimate = Estimate & {
  lineItems?: EstimateLineItem[];
};

type EstimateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  projects: EstimateProjectOption[];
  estimate?: EditableEstimate | null;
  initialProjectId?: string | null;
};

type LineItemDraft = {
  key: string;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function parseAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function createBlankLineItem(key: string): LineItemDraft {
  return {
    key,
    name: "",
    description: "",
    quantity: "1.00",
    unit: "each",
    unitPrice: "0.00"
  };
}

function createInitialLineItems(estimate?: EditableEstimate | null): LineItemDraft[] {
  if (estimate?.lineItems && estimate.lineItems.length > 0) {
    return estimate.lineItems.map((lineItem, index) => ({
      key: lineItem.id || `existing-${index}`,
      name: lineItem.name,
      description: getValue(lineItem.description),
      quantity: lineItem.quantity,
      unit: lineItem.unit,
      unitPrice: lineItem.unitPrice
    }));
  }

  return [createBlankLineItem("new-0")];
}

export function EstimateForm({
  action,
  submitLabel,
  pendingLabel,
  projects,
  estimate,
  initialProjectId
}: EstimateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() =>
    createInitialLineItems(estimate)
  );
  const nextLineItemId = useRef(lineItems.length);

  const [taxAmount, setTaxAmount] = useState(getValue(estimate?.taxAmount) || "0.00");
  const [discountAmount, setDiscountAmount] = useState(
    getValue(estimate?.discountAmount) || "0.00"
  );

  const subtotal = lineItems.reduce(
    (sum, lineItem) => sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice),
    0
  );
  const total = Math.max(0, subtotal + parseAmount(taxAmount) - parseAmount(discountAmount));

  function updateLineItem(
    key: string,
    field: keyof Omit<LineItemDraft, "key">,
    value: string
  ) {
    setLineItems((current) =>
      current.map((lineItem) =>
        lineItem.key === key ? { ...lineItem, [field]: value } : lineItem
      )
    );
  }

  function addLineItem() {
    const nextKey = `new-${nextLineItemId.current}`;
    nextLineItemId.current += 1;
    setLineItems((current) => [...current, createBlankLineItem(nextKey)]);
  }

  function removeLineItem(key: string) {
    setLineItems((current) =>
      current.length > 1 ? current.filter((lineItem) => lineItem.key !== key) : current
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {estimate && <input type="hidden" name="estimateId" value={estimate.id} />}
      <input type="hidden" name="status" value={estimate?.status ?? "draft"} />

      {/* Project & Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[--muted]">Project</label>
          <select
            name="projectId"
            defaultValue={estimate?.projectId ?? initialProjectId ?? ""}
            className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
            required
          >
            <option value="" disabled>Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.customerName ? ` - ${project.customerName}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[--muted]">
            The customer stays aligned with the selected project.
          </p>
        </div>

        <div className="rounded-lg border border-[--line] bg-[--background] p-4">
          <p className="text-sm font-medium text-[--muted]">Current status</p>
          <p className="mt-1 text-lg font-semibold capitalize text-white">
            {formatStatusLabel(estimate?.status ?? "draft")}
          </p>
        </div>

        <div className="rounded-lg border border-[--line] bg-[--background] p-4">
          <p className="text-sm font-medium text-[--muted]">Calculated total</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-white">
            {formatMoney(total)}
          </p>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-[--line] bg-[--background] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Line Items</h3>
            <p className="mt-1 text-sm text-[--muted]">
              Add work items for this estimate
            </p>
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center gap-2 rounded-lg border border-[--line] bg-[--surface] px-3 py-2 text-sm font-medium text-white transition hover:bg-[--surface-strong]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {lineItems.map((lineItem, index) => {
            const lineTotal = parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice);

            return (
              <div
                key={lineItem.key}
                className="rounded-lg border border-[--line] bg-[--surface] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[--muted]">
                    Item {index + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-white">
                      {formatMoney(lineTotal)}
                    </span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(lineItem.key)}
                        className="text-sm font-medium text-red-400 transition hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[--muted]">Name</label>
                    <input
                      name="lineItemName"
                      type="text"
                      value={lineItem.name}
                      onChange={(e) => updateLineItem(lineItem.key, "name", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                      placeholder="Epoxy base coat"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[--muted]">Description</label>
                    <textarea
                      name="lineItemDescription"
                      value={lineItem.description}
                      onChange={(e) => updateLineItem(lineItem.key, "description", e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                      placeholder="Optional scope notes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[--muted]">Quantity</label>
                    <input
                      name="lineItemQuantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={lineItem.quantity}
                      onChange={(e) => updateLineItem(lineItem.key, "quantity", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[--muted]">Unit</label>
                    <input
                      name="lineItemUnit"
                      type="text"
                      value={lineItem.unit}
                      onChange={(e) => updateLineItem(lineItem.key, "unit", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                      placeholder="each"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[--muted]">Unit Price</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">$</span>
                      <input
                        name="lineItemUnitPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={lineItem.unitPrice}
                        onChange={(e) => updateLineItem(lineItem.key, "unitPrice", e.target.value)}
                        className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[--line] bg-[--background] p-3">
                    <p className="text-sm font-medium text-[--muted]">Line Total</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                      {formatMoney(lineTotal)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tax & Discount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[--muted]">Tax</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">$</span>
            <input
              name="taxAmount"
              type="number"
              step="0.01"
              min="0"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[--muted]">Discount</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted]">$</span>
            <input
              name="discountAmount"
              type="number"
              step="0.01"
              min="0"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="w-full rounded-lg border border-[--line] bg-[--background] py-2 pl-7 pr-3 text-sm text-white outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
              required
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[--muted]">Notes</label>
        <textarea
          name="notes"
          defaultValue={getValue(estimate?.notes)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-[--line] bg-[--background] px-3 py-2 text-sm text-white placeholder:text-[--muted] outline-none transition focus:border-[--line-strong] focus:ring-1 focus:ring-[--line-strong]"
          placeholder="Optional notes for the estimate"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between border-t border-[--line] pt-6">
        <p className="text-sm text-[--muted]">
          Totals are recalculated from line items in the database.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
