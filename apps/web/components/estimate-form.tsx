"use client";

import { useRef, useState } from "react";
import type { Estimate, EstimateLineItem, Project } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

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

  return (
    <form action={action} className="space-y-6">
      {estimate ? <input type="hidden" name="estimateId" value={estimate.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="status" value={estimate?.status ?? "draft"} />

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            defaultValue={estimate?.projectId ?? initialProjectId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.customerName ? ` - ${project.customerName}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            The customer stays aligned automatically with the selected project.
          </span>
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-medium text-slate-900">Current status</p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-950">
            {formatStatusLabel(estimate?.status ?? "draft")}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Proposal workflow changes happen from the proposal page so transitions
            stay explicit and review-friendly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-medium text-slate-900">Calculated totals</p>
          <dl className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-950">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Tax</dt>
              <dd>{formatMoney(parseAmount(taxAmount))}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Discount</dt>
              <dd>{formatMoney(parseAmount(discountAmount))}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-base">
              <dt className="font-medium text-slate-950">Total</dt>
              <dd className="font-semibold text-slate-950">{formatMoney(total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Line items</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add the work items that make up this estimate. Line totals and summary
              totals are calculated automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Add line item
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {lineItems.map((lineItem, index) => {
            const lineTotal = parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice);

            return (
              <div
                key={lineItem.key}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-900">
                    Line item {index + 1}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      {formatMoney(lineTotal)}
                    </span>
                    {lineItems.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeLineItem(lineItem.key)}
                        className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Name
                    </span>
                    <input
                      name="lineItemName"
                      type="text"
                      value={lineItem.name}
                      onChange={(event) =>
                        updateLineItem(lineItem.key, "name", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      placeholder="Epoxy base coat"
                      required
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Description
                    </span>
                    <textarea
                      name="lineItemDescription"
                      value={lineItem.description}
                      onChange={(event) =>
                        updateLineItem(lineItem.key, "description", event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      placeholder="Optional scope notes for this line item"
                    />
                  </label>

                  <AuthField
                    label="Quantity"
                    id={`${lineItem.key}-quantity`}
                    name="lineItemQuantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={lineItem.quantity}
                    onChange={(event) =>
                      updateLineItem(lineItem.key, "quantity", event.target.value)
                    }
                    required
                  />
                  <AuthField
                    label="Unit"
                    id={`${lineItem.key}-unit`}
                    name="lineItemUnit"
                    type="text"
                    value={lineItem.unit}
                    onChange={(event) =>
                      updateLineItem(lineItem.key, "unit", event.target.value)
                    }
                    placeholder="each"
                    required
                  />
                  <AuthField
                    label="Unit price"
                    id={`${lineItem.key}-unit-price`}
                    name="lineItemUnitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineItem.unitPrice}
                    onChange={(event) =>
                      updateLineItem(lineItem.key, "unitPrice", event.target.value)
                    }
                    required
                  />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="block text-sm font-medium text-slate-800">
                      Line total
                    </span>
                    <span className="mt-2 block text-lg font-semibold text-slate-950">
                      {formatMoney(lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Tax"
          name="taxAmount"
          type="number"
          step="0.01"
          min="0"
          value={taxAmount}
          onChange={(event) => setTaxAmount(event.target.value)}
          required
        />
        <AuthField
          label="Discount"
          name="discountAmount"
          type="number"
          step="0.01"
          min="0"
          value={discountAmount}
          onChange={(event) => setDiscountAmount(event.target.value)}
          required
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(estimate?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional notes for the estimate"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[200px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Totals are recalculated from line items in the database for auditability.
        </p>
      </div>
    </form>
  );
}
