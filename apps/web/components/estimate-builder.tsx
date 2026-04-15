"use client";

import { useMemo, useRef, useState } from "react";

type EstimateBuilderLineItem = {
  id: string;
  name: string;
  quantity: string;
  price: string;
};

function createLineItem(id: string): EstimateBuilderLineItem {
  return {
    id,
    name: "",
    quantity: "1",
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

export function EstimateBuilder() {
  const [lineItems, setLineItems] = useState<EstimateBuilderLineItem[]>([
    createLineItem("line-0")
  ]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
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

  function updateLineItem(
    id: string,
    field: keyof Omit<EstimateBuilderLineItem, "id">,
    value: string
  ) {
    setSaveMessage(null);
    setLineItems((current) =>
      current.map((lineItem) =>
        lineItem.id === id ? { ...lineItem, [field]: value } : lineItem
      )
    );
  }

  function addLineItem() {
    setSaveMessage(null);
    setLineItems((current) => [
      ...current,
      createLineItem(`line-${nextId.current++}`)
    ]);
  }

  function removeLineItem(id: string) {
    setSaveMessage(null);
    setLineItems((current) =>
      current.length > 1 ? current.filter((lineItem) => lineItem.id !== id) : current
    );
  }

  function handleSave() {
    setSaveMessage("Estimate draft saved locally for preview only.");
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            Estimate Builder
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Build an estimate quickly
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Add line items, adjust quantity and price, and review the running total
            before wiring this into real save flows.
          </p>
        </div>

        <div className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-medium text-slate-600">Estimate total</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatMoney(subtotal)}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Frontend-only preview. No backend persistence yet.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {lineItems.map((lineItem, index) => {
          const lineTotal =
            parseAmount(lineItem.quantity) * parseAmount(lineItem.price);

          return (
            <div
              key={lineItem.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
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
                    type="text"
                    value={lineItem.name}
                    onChange={(event) =>
                      updateLineItem(lineItem.id, "name", event.target.value)
                    }
                    placeholder="Epoxy top coat"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Qty
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineItem.quantity}
                    onChange={(event) =>
                      updateLineItem(lineItem.id, "quantity", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Price
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lineItem.price}
                    onChange={(event) =>
                      updateLineItem(lineItem.id, "price", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="block text-sm font-medium text-slate-800">
                    Total
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addLineItem}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Add line item
        </button>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          {saveMessage ? (
            <p className="text-sm leading-6 text-emerald-700">{saveMessage}</p>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              Save is local-only for now.
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save estimate
          </button>
        </div>
      </div>
    </section>
  );
}
