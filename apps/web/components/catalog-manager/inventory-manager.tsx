"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  MoreVertical,
  Plus,
  Search,
  Package,
  Users,
  Wrench,
  HardHat,
  FileText,
  Layers,
  Grid3X3,
  Image
} from "lucide-react";
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

const typeIcons: Record<CatalogItem["itemType"], React.ReactNode> = {
  material: <Package className="h-4 w-4 text-[#28456f]" />,
  labor: <Users className="h-4 w-4 text-[#28456f]" />,
  service: <Wrench className="h-4 w-4 text-[#28456f]" />,
  equipment: <Wrench className="h-4 w-4 text-[#f97316]" />,
  subcontractor: <HardHat className="h-4 w-4 text-[#28456f]" />,
  other: <FileText className="h-4 w-4 text-[#28456f]" />,
  system: <Layers className="h-4 w-4 text-[#28456f]" />
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
  const [skuSearch, setSkuSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [muSearch, setMuSearch] = useState("");
  const [costCodeFilter, setCostCodeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItem["itemType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.itemType !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (skuSearch && !(item.sku ?? "").toLowerCase().includes(skuSearch.toLowerCase())) {
        return false;
      }

      if (nameSearch && !item.name.toLowerCase().includes(nameSearch.toLowerCase())) {
        return false;
      }

      if (unitSearch && !item.unit.toLowerCase().includes(unitSearch.toLowerCase())) {
        return false;
      }

      if (muSearch && !item.markupPercent.toString().includes(muSearch)) {
        return false;
      }

      if (search) {
        const query = search.toLowerCase();
        return [item.name, item.description ?? "", item.sku ?? "", item.unit]
          .join(" ")
          .toLowerCase()
          .includes(query);
      }

      return true;
    });
  }, [items, typeFilter, statusFilter, skuSearch, nameSearch, unitSearch, muSearch, search]);

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
    <div className="space-y-0">
      {/* CF-style toolbar */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-white px-4 py-2">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for All Items"
            className="h-9 w-full rounded border border-[#d1d5db] bg-white pl-9 pr-3 text-[13px] text-[#374151] outline-none focus:border-[#28456f] focus:ring-1 focus:ring-[#28456f]"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="h-9 rounded border border-[#d1d5db] bg-[#22c55e] px-3 text-[13px] font-medium text-white"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Actions dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionsOpen(!actionsOpen)}
              className="flex h-9 items-center gap-1 rounded border border-[#28456f] bg-[#28456f] px-4 text-[13px] font-medium text-white"
            >
              Actions
              <ChevronDown className="h-4 w-4" />
            </button>
            {actionsOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded border border-[#e5e7eb] bg-white py-1 shadow-lg">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]">
                  Video: Cost Codes vs Cost Items
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]">
                  Import from 1build.com Items Database
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]">
                  Import/Export to CSV
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]">
                  Apply/Bulk Markup
                </button>
              </div>
            )}
          </div>

          {/* Add Item dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setItemMenuOpen(!itemMenuOpen)}
              className="flex h-9 items-center gap-1 rounded border border-[#22c55e] bg-[#22c55e] px-4 text-[13px] font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Item
              <ChevronDown className="h-4 w-4" />
            </button>
            {itemMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded border border-[#e5e7eb] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "material"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Material Item
                </button>
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "labor"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Labor Item
                </button>
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "equipment"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Equipment Item
                </button>
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "subcontractor"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Subcontractor Item
                </button>
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "other"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Other Item
                </button>
                <button
                  type="button"
                  onClick={() => { openDrawer(null, "system"); setItemMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <Plus className="h-4 w-4 text-[#22c55e]" />
                  Item Group
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CF-style dense data grid */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[1000px] border-collapse text-[13px]">
          <thead>
            {/* Header row */}
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="w-8 border-r border-[#e5e7eb] px-2 py-2">
                <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db]" />
              </th>
              <th className="w-16 border-r border-[#e5e7eb] px-2 py-2 text-left font-medium text-[#374151]">
                Type
              </th>
              <th className="w-24 border-r border-[#e5e7eb] px-2 py-2 text-left font-medium text-[#374151]">
                SKU
              </th>
              <th className="min-w-[200px] border-r border-[#e5e7eb] px-2 py-2 text-left font-medium text-[#374151]">
                <div className="flex items-center gap-1">
                  Name
                  <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="w-24 border-r border-[#e5e7eb] px-2 py-2 text-right font-medium text-[#374151]">
                Unit Cost
              </th>
              <th className="w-24 border-r border-[#e5e7eb] px-2 py-2 text-left font-medium text-[#374151]">
                Unit
              </th>
              <th className="w-20 border-r border-[#e5e7eb] px-2 py-2 text-right font-medium text-[#374151]">
                MU %
              </th>
              <th className="w-24 border-r border-[#e5e7eb] px-2 py-2 text-right font-medium text-[#374151]">
                Total
              </th>
              <th className="min-w-[150px] border-r border-[#e5e7eb] px-2 py-2 text-left font-medium text-[#374151]">
                Cost Code
              </th>
              <th className="w-10 px-2 py-2"></th>
            </tr>
            {/* Filter row */}
            <tr className="border-b border-[#e5e7eb] bg-white">
              <th className="border-r border-[#e5e7eb] px-2 py-1.5"></th>
              <th className="border-r border-[#e5e7eb] px-2 py-1.5"></th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5">
                <input
                  value={skuSearch}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  placeholder="Search SKU"
                  className="h-7 w-full rounded border border-[#d1d5db] px-2 text-[12px] font-normal text-[#374151] outline-none focus:border-[#28456f]"
                />
              </th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5">
                <input
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder="Search Name"
                  className="h-7 w-full rounded border border-[#d1d5db] px-2 text-[12px] font-normal text-[#374151] outline-none focus:border-[#28456f]"
                />
              </th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5"></th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5">
                <input
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  placeholder="Search Unit"
                  className="h-7 w-full rounded border border-[#d1d5db] px-2 text-[12px] font-normal text-[#374151] outline-none focus:border-[#28456f]"
                />
              </th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5">
                <input
                  value={muSearch}
                  onChange={(e) => setMuSearch(e.target.value)}
                  placeholder="Search MU %"
                  className="h-7 w-full rounded border border-[#d1d5db] px-2 text-[12px] font-normal text-[#374151] outline-none focus:border-[#28456f]"
                />
              </th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5"></th>
              <th className="border-r border-[#e5e7eb] px-1 py-1.5">
                <select
                  value={costCodeFilter}
                  onChange={(e) => setCostCodeFilter(e.target.value)}
                  className="h-7 w-full rounded border border-[#d1d5db] px-1 text-[12px] font-normal text-[#9ca3af] outline-none focus:border-[#28456f]"
                >
                  <option value="all">Select Cost Code</option>
                </select>
              </th>
              <th className="px-1 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const pricing = calculateSharedUnitPricing({
                baseUnitCost: item.defaultUnitCost,
                baseUnitPrice: item.defaultUnitPrice,
                markupPercent: item.markupPercent,
                hiddenMarkupPercent: item.hiddenMarkupPercent
              });

              return (
                <tr
                  key={item.id}
                  onClick={() => openDrawer(item, item.itemType)}
                  className="cursor-pointer border-b border-[#e5e7eb] hover:bg-[#f9fafb]"
                >
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#d1d5db]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2">
                    <div className="flex items-center justify-center">
                      {typeIcons[item.itemType]}
                    </div>
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-[#374151]">
                    {item.sku || "-"}
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2">
                    <div className="flex items-center gap-2">
                      {item.photoStoragePath && (
                        <Image className="h-4 w-4 text-[#9ca3af]" />
                      )}
                      <span className="text-[#374151]">{item.name}</span>
                    </div>
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-right text-[#374151]">
                    ${formatMoneyValue(item.defaultUnitCost)}
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-[#374151]">
                    {item.unit}
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-right text-[#374151]">
                    {item.markupPercent}
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-right text-[#374151]">
                    ${formatMoneyValue(pricing.finalUnitPrice)}
                  </td>
                  <td className="border-r border-[#e5e7eb] px-2 py-2 text-[#6b7280]">
                    {item.category || "-"}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openDrawer(item, item.itemType); }}
                      className="rounded p-1 hover:bg-[#f3f4f6]"
                    >
                      <FileText className="h-4 w-4 text-[#6b7280]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Platform seeds section */}
      {availableSeeds.length > 0 ? (
        <div className="border-t border-[#e5e7eb] bg-[#fafafa] px-4 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">
            Platform starter items ready to adopt
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSeeds.slice(0, 12).map((seed) => (
              <form key={seed.id} action={adoptSeedAction}>
                <input type="hidden" name="returnTo" value={returnTo} />
                <input type="hidden" name="seedId" value={seed.id} />
                <button
                  type="submit"
                  className="rounded border border-[#d1d5db] bg-white px-3 py-1.5 text-[12px] font-medium text-[#374151] hover:border-[#28456f] hover:bg-[#f9fafb]"
                >
                  Adopt {seed.name}
                </button>
              </form>
            ))}
          </div>
        </div>
      ) : null}

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
