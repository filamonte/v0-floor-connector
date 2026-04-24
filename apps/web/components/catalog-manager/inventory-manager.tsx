"use client";

import { useMemo, useState } from "react";
import type { CatalogItem, EstimateContentBlock, PlatformCatalogItemSeed, Vendor } from "@floorconnector/types";

import { ContentBlockManager } from "@/components/catalog-manager/content-block-manager";
import { InventoryItemDrawer } from "@/components/catalog-manager/inventory-item-drawer";
import { calculateSharedUnitPricing, formatMoneyValue } from "@/lib/catalogs/pricing";

type InventoryManagerProps = {
  returnTo: string;
  items: CatalogItem[];
  platformSeeds: PlatformCatalogItemSeed[];
  vendors: Vendor[];
  contentBlocks: EstimateContentBlock[];
  saveItemAction: (formData: FormData) => void | Promise<void>;
  adoptSeedAction: (formData: FormData) => void | Promise<void>;
  saveSystemComponentsAction: (formData: FormData) => void | Promise<void>;
  saveContentBlockAction: (formData: FormData) => void | Promise<void>;
};

type DrawerState = {
  item: CatalogItem | null;
  itemType: CatalogItem["itemType"];
};

export function InventoryManager({
  returnTo,
  items,
  platformSeeds,
  vendors,
  contentBlocks,
  saveItemAction,
  adoptSeedAction,
  saveSystemComponentsAction,
  saveContentBlockAction
}: InventoryManagerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItem["itemType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
  const categories = useMemo(
    () =>
      [...new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value)))].sort(),
    [items]
  );
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (typeFilter !== "all" && item.itemType !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      if (vendorFilter !== "all" && item.vendorId !== vendorFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [item.name, item.description ?? "", item.itemType, item.unit, item.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [categoryFilter, items, search, statusFilter, typeFilter, vendorFilter]);
  const availableSeeds = useMemo(() => {
    return platformSeeds.filter(
      (seed) => !items.some((item) => item.sourceSeedId === seed.id)
    );
  }, [items, platformSeeds]);

  function openDrawer(item: CatalogItem | null, itemType: CatalogItem["itemType"]) {
    setDrawerState({ item, itemType });
  }

  function closeDrawer() {
    setDrawerState(null);
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[22px] border border-[#d8e0eb] bg-white p-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607492]">
              Inventory Grid
            </p>
            <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-[#17243b]">
              Materials, labor, services, equipment, subcontractors, other items, and systems
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f7190]">
              This is the working contractor item master. Estimates pull from active rows only, systems expand from the same shared data, and archive/reactivate stays inline.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              "material",
              "labor",
              "service",
              "equipment",
              "subcontractor",
              "other",
              "system"
            ] as const).map((itemType) => (
              <button
                key={itemType}
                type="button"
                onClick={() => openDrawer(null, itemType)}
                className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
              >
                New {itemType}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_160px_160px_180px_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search item master"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          />
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "all" | CatalogItem["itemType"])
            }
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All types</option>
            <option value="material">Material</option>
            <option value="labor">Labor</option>
            <option value="service">Service</option>
            <option value="equipment">Equipment</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="other">Other</option>
            <option value="system">System</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "active" | "archived")
            }
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={vendorFilter}
            onChange={(event) => setVendorFilter(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#d8e0eb]">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f6f8fc] text-left text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">
                <th className="px-3 py-3">Item</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Vendor / Category</th>
                <th className="px-3 py-3 text-right">Cost</th>
                <th className="px-3 py-3 text-right">MU%</th>
                <th className="px-3 py-3 text-right">Hidden%</th>
                <th className="px-3 py-3 text-right">Final Price</th>
                <th className="px-3 py-3 text-center">Tax</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-[#edf1f6] text-sm text-[#334a70]">
                  <td className="px-3 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-[#6f8098]">
                      {item.unit}
                      {item.description ? ` • ${item.description}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-3 capitalize">{item.itemType}</td>
                  <td className="px-3 py-3 text-[#6f8098]">
                    <div>{vendors.find((vendor) => vendor.id === item.vendorId)?.name ?? "No vendor"}</div>
                    <div className="text-xs">{item.category ?? "No category"}</div>
                  </td>
                  <td className="px-3 py-3 text-right">${item.defaultUnitCost}</td>
                  <td className="px-3 py-3 text-right">{item.markupPercent}%</td>
                  <td className="px-3 py-3 text-right">{item.hiddenMarkupPercent}%</td>
                  <td className="px-3 py-3 text-right">
                    ${formatMoneyValue(
                      calculateSharedUnitPricing({
                        baseUnitCost: item.defaultUnitCost,
                        baseUnitPrice: item.defaultUnitPrice,
                        markupPercent: item.markupPercent,
                        hiddenMarkupPercent: item.hiddenMarkupPercent
                      }).finalUnitPrice
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">{item.taxable ? "T" : "E"}</td>
                  <td className="px-3 py-3 capitalize">{item.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openDrawer(item, item.itemType)}
                        className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-medium text-[#28456f]"
                      >
                        Edit
                      </button>
                      <form action={saveItemAction}>
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="itemType" value={item.itemType} />
                        <input type="hidden" name="name" value={item.name} />
                        <input type="hidden" name="description" value={item.description ?? ""} />
                        <input type="hidden" name="internalNotes" value={item.internalNotes ?? ""} />
                        <input type="hidden" name="unit" value={item.unit} />
                        <input type="hidden" name="defaultUnitCost" value={item.defaultUnitCost} />
                        <input type="hidden" name="defaultUnitPrice" value={item.defaultUnitPrice ?? ""} />
                        <input type="hidden" name="markupPercent" value={item.markupPercent} />
                        <input type="hidden" name="hiddenMarkupPercent" value={item.hiddenMarkupPercent} />
                        <input type="hidden" name="vendorId" value={item.vendorId ?? ""} />
                        <input type="hidden" name="category" value={item.category ?? ""} />
                        <input type="hidden" name="sku" value={item.sku ?? ""} />
                        <input type="hidden" name="photoStoragePath" value={item.photoStoragePath ?? ""} />
                        <input
                          type="hidden"
                          name="status"
                          value={item.status === "active" ? "archived" : "active"}
                        />
                        <input type="hidden" name="isDefault" value={item.isDefault ? "on" : ""} />
                        {item.taxable ? <input type="hidden" name="taxable" value="on" /> : null}
                        <button
                          type="submit"
                          className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-medium text-[#28456f]"
                        >
                          {item.status === "active" ? "Archive" : "Reactivate"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {availableSeeds.length > 0 ? (
          <div className="rounded-[18px] border border-[#d8e0eb] bg-[#fbfcfe] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607492]">
              Platform starter items ready to adopt
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSeeds.slice(0, 12).map((seed) => (
                <form key={seed.id} action={adoptSeedAction}>
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="seedId" value={seed.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-medium text-[#28456f]"
                  >
                    Adopt {seed.name}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <ContentBlockManager
        returnTo={returnTo}
        blocks={contentBlocks}
        saveAction={saveContentBlockAction}
      />

      <InventoryItemDrawer
        open={Boolean(drawerState)}
        item={drawerState?.item ?? null}
        initialItemType={drawerState?.itemType ?? "material"}
        returnTo={returnTo}
        vendors={vendors}
        catalogItems={items}
        onClose={closeDrawer}
        saveItemAction={saveItemAction}
        saveSystemComponentsAction={saveSystemComponentsAction}
      />
    </div>
  );
}
