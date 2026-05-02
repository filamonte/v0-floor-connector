"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  CatalogItem,
  CatalogItemFile,
  InventoryItem,
  InventoryTransaction,
  TaxCode,
  Vendor
} from "@floorconnector/types";

import { SystemBuilder } from "@/components/catalog-manager/system-builder";

type InventoryItemDrawerProps = {
  open: boolean;
  item: CatalogItem | null;
  initialItemType: CatalogItem["itemType"];
  defaultTab?: DrawerTab;
  inventoryEnabled: boolean;
  returnTo: string;
  vendors: Vendor[];
  catalogItems: CatalogItem[];
  taxCodes: TaxCode[];
  inventoryItem: InventoryItem | null;
  inventoryTransactions: InventoryTransaction[];
  existingFiles: CatalogItemFile[];
  onClose: () => void;
  saveItemAction: (formData: FormData) => void | Promise<void>;
  saveSystemComponentsAction: (formData: FormData) => void | Promise<void>;
  deleteCatalogItemFileAction: (formData: FormData) => void | Promise<void>;
};

type DrawerTab = "details" | "notes" | "inventory" | "files";

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
    unit: itemType === "material" ? "sqft" : "each",
    defaultUnitCost: "0.00",
    defaultUnitPrice: null,
    markupPercent: "0.00",
    hiddenMarkupPercent: "0.00",
    taxable: true,
    vendorId: null,
    category: null,
    costCode: null,
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

function formatInventoryQuantity(value: string) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
}

export function InventoryItemDrawer({
  open,
  item,
  initialItemType,
  defaultTab = "details",
  inventoryEnabled,
  returnTo,
  vendors,
  catalogItems,
  taxCodes,
  inventoryItem,
  inventoryTransactions,
  existingFiles,
  onClose,
  saveItemAction,
  saveSystemComponentsAction,
  deleteCatalogItemFileAction
}: InventoryItemDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>(defaultTab);
  const [draftName, setDraftName] = useState(item?.name ?? "");
  const [draftSku, setDraftSku] = useState(item?.sku ?? "");
  const [trackInventory, setTrackInventory] = useState(Boolean(inventoryItem && inventoryItem.status === "active"));

  const editableItem = useMemo(
    () => item ?? createEmptyItem(initialItemType),
    [initialItemType, item]
  );

  useEffect(() => {
    setActiveTab(defaultTab);
    setDraftName(item?.name ?? "");
    setDraftSku(item?.sku ?? "");
    setTrackInventory(
      inventoryEnabled && Boolean(inventoryItem && inventoryItem.status === "active")
    );
  }, [defaultTab, initialItemType, inventoryEnabled, inventoryItem, item?.id, item?.name, item?.sku]);

  const duplicateFeedback = useMemo(() => {
    const normalizedName = draftName.trim().toLowerCase().replace(/\s+/g, " ");
    const normalizedSku = draftSku.trim().toLowerCase().replace(/\s+/g, " ");

    const duplicateByName =
      normalizedName.length > 0
        ? catalogItems.find(
            (catalogItem) =>
              catalogItem.id !== editableItem.id &&
              catalogItem.name.trim().toLowerCase().replace(/\s+/g, " ") === normalizedName
          )
        : null;
    const duplicateBySku =
      normalizedSku.length > 0
        ? catalogItems.find(
            (catalogItem) =>
              catalogItem.id !== editableItem.id &&
              (catalogItem.sku ?? "").trim().toLowerCase().replace(/\s+/g, " ") ===
                normalizedSku
          )
        : null;

    if (duplicateByName) {
      return `Name already used by ${duplicateByName.name}.`;
    }

    if (duplicateBySku) {
      return `SKU already used by ${duplicateBySku.name}.`;
    }

    return null;
  }, [catalogItems, draftName, draftSku, editableItem.id]);

  if (!open) {
    return null;
  }

  return (
      <div className="fixed inset-0 z-50 flex justify-end bg-[#08111f]/45">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close cost item drawer"
      />

        <aside className="relative z-10 flex h-full w-full max-w-[780px] flex-col overflow-hidden border-l border-[#d5dce7] bg-white shadow-[-32px_0_90px_-44px_rgba(7,16,30,0.75)]">
          <div className="border-b border-[#dce3ee] bg-[#f8f8f8] px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6a7f9d]">
                Cost Item
              </div>
                <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-[#171717]">
                {item ? `Edit ${item.name}` : `Add ${initialItemType}`}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-[#666666]">
                This drawer writes to the shared cost item master. Inventory tracking is optional and stays attached to this same item record.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-1.5 text-sm font-medium text-[#3f3f3f]"
            >
              Close
            </button>
          </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
            {(["details", "notes", "inventory", "files"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                    "rounded-[4px] px-2.5 py-1.5 text-sm font-medium capitalize transition",
                  activeTab === tab
                    ? "bg-[#171717] text-white"
                    : "border border-[#d6d6d6] bg-white text-[#3f3f3f]"
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <form action={saveItemAction} className="space-y-3">
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="itemId" value={editableItem.id} />
            <input type="hidden" name="inventoryItemId" value={inventoryItem?.id ?? ""} />
            <input type="hidden" name="photoStoragePath" value={editableItem.photoStoragePath ?? ""} />
            {editableItem.id ? <input type="hidden" name="catalogItemId" value={editableItem.id} /> : null}

            <div
              className={[
                "space-y-3",
                activeTab === "details" ? "block" : "hidden"
              ].join(" ")}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Item name</span>
                  <input
                    name="name"
                    defaultValue={editableItem.name}
                    onChange={(event) => setDraftName(event.target.value)}
                    required
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Type</span>
                  <select
                    name="itemType"
                    defaultValue={editableItem.itemType}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  >
                    {(
                      [
                        "material",
                        "labor",
                        "equipment",
                        "service",
                        "system",
                        "subcontractor",
                        "other"
                      ] as const
                    ).map((itemType) => (
                      <option key={itemType} value={itemType}>
                        {itemType}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">SKU</span>
                  <input
                    name="sku"
                    defaultValue={editableItem.sku ?? ""}
                    onChange={(event) => setDraftSku(event.target.value)}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Unit</span>
                  <input
                    name="unit"
                    defaultValue={editableItem.unit}
                    required
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Unit cost</span>
                  <input
                    name="defaultUnitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editableItem.defaultUnitCost}
                    required
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
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
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Visible markup %</span>
                  <input
                    name="markupPercent"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editableItem.markupPercent}
                    required
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
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
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Vendor</span>
                  <select
                    name="vendorId"
                    defaultValue={editableItem.vendorId ?? ""}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
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
                  <span className="mb-2 block text-sm font-medium text-slate-800">Category / Group</span>
                  <input
                    name="category"
                    defaultValue={editableItem.category ?? ""}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Cost code</span>
                  <input
                    name="costCode"
                    defaultValue={editableItem.costCode ?? ""}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
                  <select
                    name="status"
                    defaultValue={editableItem.status}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Customer-facing description</span>
                  <textarea
                    name="description"
                    defaultValue={editableItem.description ?? ""}
                    rows={4}
                    className="w-full rounded-[4px] border border-slate-300 px-3 py-2.5 text-sm outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="taxable"
                    defaultChecked={editableItem.taxable}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Taxable
                </label>
                <label className="flex items-center gap-3 rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isDefault"
                    defaultChecked={editableItem.isDefault}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Default starter for this type
                </label>
              </div>

              <details className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
                <summary className="cursor-pointer text-sm font-medium text-[#2a2a2a]">
                  Advanced tax override
                </summary>
                <div className="mt-4 space-y-3">
                  <p className="text-sm leading-6 text-[#666666]">
                    Keep item tax simple with the taxable checkbox above. Use an optional tax code only when the organization needs an advanced saved default.
                  </p>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Tax code</span>
                    <select
                      name="taxCodeId"
                      defaultValue={editableItem.taxCodeId ?? ""}
                      className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none"
                    >
                      <option value="">Use organization tax defaults</option>
                      {taxCodes.map((taxCode) => (
                        <option key={taxCode.id} value={taxCode.id}>
                          {taxCode.name} ({(Number(taxCode.rate) * 100).toFixed(2)}%)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </details>

              {duplicateFeedback ? (
                <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                  Duplicate pre-check: {duplicateFeedback} Server-side duplicate protection is also enforced on save.
                </div>
              ) : null}
            </div>

            <div
              className={[
                "space-y-3",
                activeTab === "notes" ? "block" : "hidden"
              ].join(" ")}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">Internal notes</span>
                <textarea
                  name="internalNotes"
                  defaultValue={editableItem.internalNotes ?? ""}
                  rows={10}
                  className="w-full rounded-[4px] border border-slate-300 px-3 py-2.5 text-sm outline-none"
                />
              </label>
            </div>

            <div
              className={[
                "space-y-3",
                activeTab === "inventory" ? "block" : "hidden"
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3 rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
                <div>
                  <div className="text-sm font-medium text-[#2a2a2a]">Inventory tracking</div>
                  <p className="mt-1 text-sm leading-6 text-[#666666]">
                    {inventoryEnabled
                      ? "Inventory is optional for this cost item. Quantity on hand is read-only here and only changes through inventory transactions."
                      : "Inventory tracking is currently disabled for this organization. Existing linked inventory data is preserved, but new inventory controls stay hidden until the module setting is turned back on."}
                  </p>
                </div>
                <label className="flex items-center gap-3 text-sm font-medium text-[#3f3f3f]">
                  <input
                    type="checkbox"
                    name="trackInventory"
                    checked={trackInventory}
                    onChange={(event) => setTrackInventory(event.target.checked)}
                    disabled={!inventoryEnabled}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Track inventory
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Quantity on hand</span>
                  <input
                    value={
                      inventoryItem ? formatInventoryQuantity(inventoryItem.currentQuantity) : "0"
                    }
                    readOnly
                    className="h-10 w-full rounded-[4px] border border-slate-300 bg-slate-50 px-3 text-sm outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Reorder point</span>
                  <input
                    name="inventoryReorderPoint"
                    type="number"
                    min="0"
                    step="0.0001"
                    defaultValue={inventoryItem?.reorderPoint ?? "0"}
                    disabled={!inventoryEnabled || !trackInventory}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Location</span>
                  <input
                    name="inventoryLocation"
                    defaultValue={inventoryItem?.location ?? "default"}
                    disabled={!inventoryEnabled || !trackInventory}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Manual adjustment</span>
                  <input
                    name="inventoryAdjustmentQuantity"
                    type="number"
                    step="0.0001"
                    placeholder="Enter + or - quantity"
                    disabled={!inventoryEnabled || !trackInventory || !editableItem.id}
                    className="h-10 w-full rounded-[4px] border border-slate-300 px-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Adjustment note</span>
                  <textarea
                    name="inventoryAdjustmentNote"
                    rows={3}
                    placeholder="Reason for the stock adjustment"
                    disabled={!inventoryEnabled || !trackInventory || !editableItem.id}
                    className="w-full rounded-[4px] border border-slate-300 px-3 py-2.5 text-sm outline-none disabled:bg-slate-50"
                  />
                </label>
              </div>

              {!inventoryEnabled ? (
                <div className="rounded-[4px] border border-[#d8dfe9] bg-[#f8f8f8] px-3 py-3 text-sm text-[#666666]">
                  Inventory controls are disabled in Cost Items settings. Existing inventory records remain attached to their cost items and can be reactivated later without data loss.
                </div>
              ) : null}

              {!editableItem.id && trackInventory ? (
                <div className="rounded-[4px] border border-[#d8dfe9] bg-[#f8f8f8] px-3 py-3 text-sm text-[#666666]">
                  Save the cost item first. That will create the linked inventory record at the default location, then you can reopen the drawer to record stock adjustments.
                </div>
              ) : null}

              <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
                <div className="font-medium text-[#2a2a2a]">Recent transactions</div>
                <div className="mt-3 space-y-3">
                  {inventoryTransactions.slice(0, 8).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 rounded-[4px] border border-[#f8f8f8] bg-white px-3 py-2.5 text-sm text-[#666666]"
                    >
                      <div>
                        <div className="font-medium text-[#2a2a2a]">{transaction.transactionType}</div>
                        <div className="text-xs text-[#777777]">{transaction.notes ?? "No note"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-[#2a2a2a]">
                          {Number(transaction.quantityChange) > 0 ? "+" : ""}
                          {formatInventoryQuantity(transaction.quantityChange)}
                        </div>
                        <div className="text-xs text-[#777777]">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {inventoryTransactions.length === 0 ? (
                    <div className="rounded-[4px] border border-dashed border-[#d8dfe9] px-3 py-3 text-sm text-[#777777]">
                      No inventory transactions yet for this item.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              className={[
                "space-y-3",
                activeTab === "files" ? "block" : "hidden"
              ].join(" ")}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Photo upload</span>
                  <input
                    type="file"
                    name="catalogItemPhoto"
                    accept="image/*"
                    className="block w-full text-sm text-slate-700"
                  />
                  <p className="mt-2 text-xs leading-5 text-[#6b7d97]">
                    Uses the existing documents bucket and stores files under
                    `{editableItem.id ? ` ${editableItem.organizationId || "{organizationId}"}/catalog-items/${editableItem.id}/...` : " {organizationId}/catalog-items/{catalogItemId}/..."}`.
                  </p>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">Additional files</span>
                  <input
                    type="file"
                    name="catalogItemFiles"
                    multiple
                    className="block w-full text-sm text-slate-700"
                  />
                </label>
              </div>

              <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3 text-sm text-[#666666]">
                <div className="font-medium text-[#2a2a2a]">Current photo path</div>
                <div className="mt-1 break-all">
                  {editableItem.photoStoragePath ?? "No photo uploaded yet."}
                </div>
              </div>

              {existingFiles.length > 0 ? (
                <div className="space-y-3 rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
                  <div className="font-medium text-[#2a2a2a]">Stored files</div>
                  <div className="space-y-3">
                    {existingFiles.map((file) => (
                      <div
                        key={file.path}
                        className="rounded-[4px] border border-[#f8f8f8] bg-white px-3 py-2.5 text-sm text-[#666666]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-medium text-[#2a2a2a]">{file.name}</div>
                            <div className="text-xs text-[#777777]">{file.path}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.downloadUrl ? (
                              <a
                                href={file.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-[4px] border border-[#d6d6d6] px-3 py-1.5 text-sm text-[#3f3f3f]"
                              >
                                Preview
                              </a>
                            ) : null}
                            <button
                              type="submit"
                              formAction={deleteCatalogItemFileAction}
                              name="filePath"
                              value={file.path}
                              className="rounded-[4px] border border-[#d6d6d6] px-3 py-1.5 text-sm text-[#3f3f3f]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {file.downloadUrl && file.mimeType?.startsWith("image/") ? (
                          <Image
                            src={file.downloadUrl}
                            alt={file.name}
                            width={320}
                            height={160}
                            unoptimized
                            className="mt-3 max-h-40 rounded-[4px] border border-[#f8f8f8] object-cover"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {editableItem.id && editableItem.photoStoragePath ? (
                <div className="rounded-[4px] border border-[#f1d7d7] bg-[#fff7f7] p-3">
                  <input type="hidden" name="catalogItemId" value={editableItem.id} />
                  <input type="hidden" name="filePath" value={editableItem.photoStoragePath} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-[#7a4d4d]">
                      Remove the current photo from the documents bucket.
                    </div>
                    <button
                      type="submit"
                      formAction={deleteCatalogItemFileAction}
                      className="rounded-[4px] border border-[#e3b1b1] bg-white px-3 py-1.5 text-sm font-medium text-[#8a4d4d]"
                    >
                      Delete current photo
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm font-medium text-[#3f3f3f]"
              >
                Cancel
              </button>
              {inventoryEnabled && trackInventory && editableItem.id ? (
                <button
                  type="submit"
                  name="submitMode"
                  value="adjust"
                className="rounded-[4px] border border-[#171717] bg-white px-3 py-2 text-sm font-medium text-[#171717]"
                >
                  Record Adjustment
                </button>
              ) : null}
              <button
                type="submit"
                name="submitMode"
                value="save"
                className="rounded-[4px] bg-[#171717] px-3 py-2 text-sm font-medium text-white"
              >
                Save Item
              </button>
            </div>
          </form>

          {editableItem.itemType === "system" && editableItem.id ? (
            <div className="mt-6">
              <SystemBuilder
                returnTo={returnTo}
                systemItem={editableItem}
                catalogItems={catalogItems}
                saveAction={saveSystemComponentsAction}
              />
            </div>
          ) : null}

          {editableItem.itemType === "system" && !editableItem.id ? (
            <div className="mt-4 rounded-[4px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4 text-sm leading-6 text-[#666666]">
              Save the system/package item first, then reopen it to add, reorder, and preview real component rows by square footage.
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
