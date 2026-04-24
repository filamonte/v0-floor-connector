"use client";

import type { CatalogItem, Vendor } from "@floorconnector/types";

import { SystemBuilder } from "@/components/catalog-manager/system-builder";

type InventoryItemDrawerProps = {
  open: boolean;
  item: CatalogItem | null;
  initialItemType: CatalogItem["itemType"];
  returnTo: string;
  vendors: Vendor[];
  catalogItems: CatalogItem[];
  onClose: () => void;
  saveItemAction: (formData: FormData) => void | Promise<void>;
  saveSystemComponentsAction: (formData: FormData) => void | Promise<void>;
};

function createEmptyItem(itemType: CatalogItem["itemType"]): CatalogItem {
  return {
    id: "",
    organizationId: "",
    sourceSeedId: null,
    sourceSeedKey: null,
    itemType,
    name: "",
    description: null,
    internalNotes: null,
    unit: itemType === "service" ? "each" : itemType === "material" ? "sqft" : "each",
    defaultUnitCost: "0.00",
    defaultUnitPrice: null,
    markupPercent: "0.00",
    hiddenMarkupPercent: "0.00",
    taxable: true,
    vendorId: null,
    category: null,
    sku: null,
    photoStoragePath: null,
    status: "active",
    isDefault: false,
    metadata: {},
    sortOrder: 0,
    createdAt: "",
    updatedAt: ""
  };
}

export function InventoryItemDrawer({
  open,
  item,
  initialItemType,
  returnTo,
  vendors,
  catalogItems,
  onClose,
  saveItemAction,
  saveSystemComponentsAction
}: InventoryItemDrawerProps) {
  if (!open) {
    return null;
  }

  const editableItem = item ?? createEmptyItem(initialItemType);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#122033]/55">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close inventory item drawer"
      />
      <aside className="relative z-10 flex h-full w-full max-w-[960px] flex-col overflow-y-auto border-l border-[#d6dce6] bg-[#f8fbff] shadow-[-32px_0_80px_-48px_rgba(15,23,42,0.6)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#dde5ef] bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#486180]">
              Inventory Item
            </p>
            <h3 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.02em] text-[#183153]">
              {item ? `Edit ${item.name}` : `Create ${initialItemType}`}
            </h3>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#5c6d83]">
              Keep commercial inventory dense and operational: cost, price, taxable behavior, vendor continuity, and system assembly all stay on the shared catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7e0ea] bg-white text-[13px] font-medium text-[#4b5d75]"
          >
            X
          </button>
        </div>

        <div className="space-y-5 p-5">
          <form action={saveItemAction} className="rounded-[22px] border border-[#dde5ef] bg-white p-5">
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="itemId" value={editableItem.id} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Type</span>
                <select
                  name="itemType"
                  defaultValue={editableItem.itemType}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  {([
                    "material",
                    "labor",
                    "service",
                    "equipment",
                    "subcontractor",
                    "other",
                    "system"
                  ] as const).map(
                    (itemType) => (
                      <option key={itemType} value={itemType}>
                        {itemType}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
                <select
                  name="status"
                  defaultValue={editableItem.status}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
                <input
                  name="name"
                  defaultValue={editableItem.name}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-800">Description</span>
                <textarea
                  name="description"
                  defaultValue={editableItem.description ?? ""}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">SKU</span>
                <input
                  name="sku"
                  defaultValue={editableItem.sku ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Unit</span>
                <input
                  name="unit"
                  defaultValue={editableItem.unit}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Category</span>
                <input
                  name="category"
                  defaultValue={editableItem.category ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Vendor</span>
                <select
                  name="vendorId"
                  defaultValue={editableItem.vendorId ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="">No vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Default unit cost</span>
                <input
                  name="defaultUnitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editableItem.defaultUnitCost}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Base price override</span>
                <input
                  name="defaultUnitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editableItem.defaultUnitPrice ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Markup %</span>
                <input
                  name="markupPercent"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editableItem.markupPercent}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Hidden markup %</span>
                <input
                  name="hiddenMarkupPercent"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={editableItem.hiddenMarkupPercent}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-800">Internal notes</span>
                <textarea
                  name="internalNotes"
                  defaultValue={editableItem.internalNotes ?? ""}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="taxable"
                  defaultChecked={editableItem.taxable}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Taxable by default</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={editableItem.isDefault}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Set as default starter for this type</span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#1f5fd6] px-4 py-2 text-sm font-medium text-white"
              >
                Save Item
              </button>
            </div>
          </form>

          {item && item.itemType === "system" ? (
            <SystemBuilder
              returnTo={returnTo}
              systemItem={item}
              catalogItems={catalogItems}
              saveAction={saveSystemComponentsAction}
            />
          ) : item == null && initialItemType === "system" ? (
            <div className="rounded-[22px] border border-dashed border-[#d8e0eb] bg-white px-5 py-6 text-sm leading-6 text-[#5f7190]">
              Save the system item once first, then reopen it to manage component rows and preview sqft expansion.
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
