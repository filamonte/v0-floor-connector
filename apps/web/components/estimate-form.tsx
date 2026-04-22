"use client";

import { useRef, useState } from "react";
import type { CatalogItem, Estimate, EstimateLineItem } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type EditableEstimate = Estimate & {
  lineItems?: EstimateLineItem[];
};

type EstimateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  estimate?: EditableEstimate | null;
  opportunityTitle?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  catalogItems?: CatalogItem[];
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

function WorkspaceSection({
  id,
  title,
  description,
  children
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-[28px] border border-[#d8e0eb] bg-white px-5 py-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)] sm:px-6"
    >
      <div className="border-b border-[#e5ebf2] pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-[#17243b]">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function EstimateForm({
  action,
  submitLabel,
  pendingLabel,
  estimate,
  opportunityTitle,
  customerName,
  projectName,
  catalogItems = []
}: EstimateFormProps) {
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() =>
    createInitialLineItems(estimate)
  );
  const nextLineItemId = useRef(lineItems.length);
  const [itemSearch, setItemSearch] = useState("");
  const [taxAmount, setTaxAmount] = useState(getValue(estimate?.taxAmount) || "0.00");
  const [discountAmount, setDiscountAmount] = useState(
    getValue(estimate?.discountAmount) || "0.00"
  );
  const normalizedItemSearch = itemSearch.trim().toLowerCase();
  const visibleCatalogItems = catalogItems
    .filter((item) => item.status === "active")
    .filter((item) =>
      normalizedItemSearch.length === 0
        ? true
        : [item.name, item.description ?? "", item.itemType, item.unit]
            .join(" ")
            .toLowerCase()
            .includes(normalizedItemSearch)
    )
    .slice(0, 8);

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

  function addCatalogItem(item: CatalogItem) {
    const nextKey = `catalog-${nextLineItemId.current}`;

    nextLineItemId.current += 1;
    setLineItems((current) => [
      ...current,
      {
        key: nextKey,
        name: item.name,
        description: getValue(item.description),
        quantity: "1.00",
        unit: item.unit,
        unitPrice: item.defaultUnitPrice
      }
    ]);
  }

  return (
    <form action={action} className="space-y-5">
      {estimate ? (
        <>
          <input type="hidden" name="estimateId" value={estimate.id} />
          <input type="hidden" name="opportunityId" value={estimate.opportunityId} />
          <input type="hidden" name="projectId" value={estimate.projectId} />
        </>
      ) : null}
      <input type="hidden" name="status" value={estimate?.status ?? "draft"} />

      <WorkspaceSection
        id="details"
        title="Details"
        description="The estimate stays tied to canonical opportunity continuity. Build the commercial record here first, then review and send once the body is ready."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Opportunity
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {opportunityTitle ?? "Opportunity linked"}
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Customer
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {customerName ?? "Customer linked"}
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Project continuity
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {projectName ?? "Project linked"}
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#e7edf5] bg-[#f8fafc] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Current status
            </p>
            <p className="mt-2 text-lg font-semibold capitalize text-[#17243b]">
              {formatStatusLabel(estimate?.status ?? "draft")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Send and approval changes stay downstream so this workspace remains the primary build area.
            </p>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="items"
        title="Items"
        description="Shared inventory is the primary source. Manual line items remain available as a fallback when a reusable catalog record does not exist yet."
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#dfe6f0] bg-[#fbfcfe] px-5 py-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Shared inventory</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Pull materials, labor, and systems from the shared catalog so estimates build from the same canonical inventory used across the contractor app.
                  </p>
                </div>
                <input
                  type="search"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search inventory items"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100 lg:max-w-xs"
                />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {visibleCatalogItems.length > 0 ? (
                  visibleCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addCatalogItem(item)}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-brand-200 hover:bg-[#fffdfb]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.itemType} / {item.unit}
                        </p>
                        {item.description ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-brand-700">
                        {formatMoney(Number(item.defaultUnitPrice))}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500 lg:col-span-2">
                    No shared inventory items match this search yet. Manual lines still work, but this estimate should be built from shared inventory whenever possible.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Estimate items</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  These lines define the commercial scope that later drives contract and invoice continuity.
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

            <div className="space-y-4">
              {lineItems.map((lineItem, index) => {
                const lineTotal =
                  parseAmount(lineItem.quantity) * parseAmount(lineItem.unitPrice);

                return (
                  <div
                    key={lineItem.key}
                    className="rounded-[24px] border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Line item {index + 1}</p>
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
                        <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
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
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#d8e0eb] bg-[#f8fafc] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Financial summary
              </p>
              <dl className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
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

            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-sm leading-6 text-slate-500">
              Totals are recalculated from canonical estimate line items for consistency across review, send, and downstream contract and invoice generation.
            </div>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="terms"
        title="Terms"
        description="Financial adjustments and estimate notes that shape the commercial offer before customer review."
      >
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
      </WorkspaceSection>

      <WorkspaceSection
        id="scope-of-work"
        title="Scope of Work"
        description="Customer-facing scope detail stays here so the commercial body is clear before review and send."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Scope summary</span>
          <textarea
            name="notes"
            defaultValue={getValue(estimate?.notes)}
            rows={7}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Describe the included scope of work for this estimate"
          />
        </label>
      </WorkspaceSection>

      <WorkspaceSection
        id="files"
        title="Files"
        description="File handling remains part of the same canonical estimate record even when richer attachment tooling lands later."
      >
        <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-500">
          Estimate files are not being managed directly in this form yet. This section keeps the workspace structure aligned with the CF editor while preserving the current shared record model.
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="cover-sheet"
        title="Cover Sheet"
        description="Cover-sheet controls stay in the estimate workspace so the document package is assembled from one canonical record."
      >
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-500">
          Cover-sheet composition is still handled by the estimate record itself and will continue to render from this same estimate rather than from a detached document model.
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="notes"
        title="Notes"
        description="Internal estimating notes stay attached to the estimate record for continuity and later review."
      >
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-500">
          Use the scope and term areas above for the main commercial content. This section is reserved for additional internal note depth as the estimate workspace expands.
        </div>
      </WorkspaceSection>

      <WorkspaceSection
        id="review-send"
        title="Review / Send"
        description="Save the estimate build first, then continue into the downstream review and send workflow."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[220px]">
            <span>{submitLabel}</span>
          </AuthSubmitButton>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Saving here updates the primary estimate workspace. Customer-facing review and send remain downstream so post-send controls can stay explicit.
          </p>
        </div>
      </WorkspaceSection>
    </form>
  );
}
