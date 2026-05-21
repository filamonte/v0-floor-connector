"use client";

import { useMemo, useRef, useState } from "react";
import type { Project } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type EstimateProjectOption = Pick<Project, "id" | "name" | "customerId"> & {
  customerName?: string | null;
};

type EstimateBuilderLineItem = {
  id: string;
  name: string;
  quantity: string;
  price: string;
};

type EstimateBuilderProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: EstimateProjectOption[];
  initialProjectId?: string | null;
  embedded?: boolean;
};

function createLineItem(id: string): EstimateBuilderLineItem {
  return {
    id,
    name: "",
    quantity: "1.00",
    price: "0.00"
  };
}

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

export function EstimateBuilder({
  action,
  projects,
  initialProjectId,
  embedded = false
}: EstimateBuilderProps) {
  const [lineItems, setLineItems] = useState<EstimateBuilderLineItem[]>([
    createLineItem("line-0")
  ]);
  const [taxAmount, setTaxAmount] = useState("0.00");
  const [discountAmount, setDiscountAmount] = useState("0.00");
  const nextId = useRef(1);

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (sum, lineItem) =>
          sum + parseAmount(lineItem.quantity) * parseAmount(lineItem.price),
        0
      ),
    [lineItems]
  );
  const total = Math.max(0, subtotal + parseAmount(taxAmount) - parseAmount(discountAmount));

  function updateLineItem(
    id: string,
    field: keyof Omit<EstimateBuilderLineItem, "id">,
    value: string
  ) {
    setLineItems((current) =>
      current.map((lineItem) =>
        lineItem.id === id ? { ...lineItem, [field]: value } : lineItem
      )
    );
  }

  function addLineItem() {
    setLineItems((current) => [
      ...current,
      createLineItem(`line-${nextId.current++}`)
    ]);
  }

  function removeLineItem(id: string) {
    setLineItems((current) =>
      current.length > 1 ? current.filter((lineItem) => lineItem.id !== id) : current
    );
  }

  return (
    <section
      className={
        embedded
          ? "space-y-6"
          : "rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10"
      }
    >
      <form action={action} className="space-y-6">
        <input type="hidden" name="status" value="draft" />

        <div
          className={[
            "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
            embedded ? "border-b border-[#e5e5e5] pb-5" : "border-b border-slate-200 pb-6"
          ].join(" ")}
        >
          <div>
            <p
              className={[
                "font-semibold uppercase",
                embedded
                  ? "text-[10px] tracking-[0.18em] text-[#666666]"
                  : "text-sm tracking-[0.24em] text-brand-700"
              ].join(" ")}
            >
              Estimate Builder
            </p>
            <h2
              className={[
                "font-semibold tracking-tight text-slate-950",
                embedded ? "mt-2 text-xl" : "mt-3 text-3xl sm:text-4xl"
              ].join(" ")}
            >
              Build an estimate
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Add real line items, keep the running total visible, and create a
              canonical estimate record tied to an existing project.
            </p>
          </div>

          <div
            className={[
              "min-w-[220px] px-5 py-4",
              embedded
                ? "rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8]"
                : "rounded-2xl border border-slate-200 bg-slate-50"
            ].join(" ")}
          >
            <p className="text-sm font-medium text-slate-600">Estimate total</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {formatMoney(total)}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Submitted through the live estimate create flow.
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            defaultValue={initialProjectId ?? ""}
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
        </label>

        <div className="space-y-4">
          {lineItems.map((lineItem, index) => {
            const lineTotal =
              parseAmount(lineItem.quantity) * parseAmount(lineItem.price);

            return (
              <div
                key={lineItem.id}
                className={[
                  "border p-5",
                  embedded
                    ? "rounded-[4px] border-[#e5e5e5] bg-[#f8f8f8]"
                    : "rounded-2xl border-slate-200 bg-slate-50/70"
                ].join(" ")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Line item {index + 1}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enter the work item, quantity, and unit price.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatMoney(lineTotal)}
                    </span>
                    {lineItems.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeLineItem(lineItem.id)}
                        className="text-sm font-medium text-rose-700 transition hover:text-rose-800"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.8fr)_120px_140px_140px]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Name
                    </span>
                    <input
                      name="lineItemName"
                      type="text"
                      value={lineItem.name}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, "name", event.target.value)
                      }
                      placeholder="Epoxy top coat"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Qty
                    </span>
                    <input
                      name="lineItemQuantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={lineItem.quantity}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, "quantity", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">
                      Price
                    </span>
                    <input
                      name="lineItemUnitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={lineItem.price}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, "price", event.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      required
                    />
                  </label>

                  <div
                    className={[
                      "border bg-white px-4 py-3",
                      embedded
                        ? "rounded-[4px] border-[#e5e5e5]"
                        : "rounded-2xl border-slate-200"
                    ].join(" ")}
                  >
                    <span className="block text-sm font-medium text-slate-800">
                      Total
                    </span>
                    <span className="mt-2 block text-lg font-semibold text-slate-950">
                      {formatMoney(lineTotal)}
                    </span>
                  </div>
                </div>

                <input type="hidden" name="lineItemDescription" value="" />
                <input type="hidden" name="lineItemUnit" value="each" />
              </div>
            );
          })}
        </div>

        <div className="flex justify-start">
          <button
            type="button"
            onClick={addLineItem}
            className={[
              "inline-flex items-center justify-center border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50",
              embedded
                ? "rounded-[4px] border-[#d6d6d6] bg-white hover:border-[#cfd8e4]"
                : "rounded-full border-slate-300 hover:border-slate-400"
            ].join(" ")}
          >
            Add line item
          </button>
        </div>

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
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Optional estimate notes or assumptions"
          />
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            This creates a real tenant-scoped estimate in Supabase.
          </p>
          <AuthSubmitButton
            pendingLabel="Creating estimate..."
            className="sm:min-w-[200px]"
          >
            <span>Save estimate</span>
          </AuthSubmitButton>
        </div>
      </form>
    </section>
  );
}
