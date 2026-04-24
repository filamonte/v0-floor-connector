"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronDown,
  Download,
  Edit2,
  FileSpreadsheet,
  Grid3X3,
  ImageIcon,
  MoreVertical,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Upload,
  Users,
  Wrench
} from "lucide-react";
import type { CatalogItem, Vendor } from "@floorconnector/types";

import { calculateSharedUnitPricing, formatMoneyValue } from "@/lib/catalogs/pricing";

type CFCostItemsGridProps = {
  items: CatalogItem[];
  vendors: Vendor[];
  onEditItem: (item: CatalogItem) => void;
  onArchiveItem: (item: CatalogItem) => void;
  onAddItem: (itemType: CatalogItem["itemType"]) => void;
};

const ITEM_TYPE_ICONS: Record<CatalogItem["itemType"], typeof Package> = {
  material: Package,
  labor: Users,
  service: Settings,
  equipment: Wrench,
  subcontractor: Users,
  other: Grid3X3,
  system: FileSpreadsheet
};

function ItemTypeIcon({ itemType }: { itemType: CatalogItem["itemType"] }) {
  const Icon = ITEM_TYPE_ICONS[itemType] ?? Package;
  return <Icon className="h-4 w-4" />;
}

function formatItemType(type: CatalogItem["itemType"]) {
  const labels: Record<CatalogItem["itemType"], string> = {
    material: "Material",
    labor: "Labor",
    service: "Service",
    equipment: "Equipment",
    subcontractor: "Subcontractor",
    other: "Other",
    system: "System"
  };
  return labels[type] ?? type;
}

export function CFCostItemsGrid({
  items,
  vendors,
  onEditItem,
  onArchiveItem,
  onAddItem
}: CFCostItemsGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CatalogItem["itemType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [costCodeFilter, setCostCodeFilter] = useState("all");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (typeFilter !== "all" && item.itemType !== typeFilter) {
        return false;
      }

      if (item.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [item.name, item.sku ?? "", item.unit, item.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, statusFilter, typeFilter]);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category).filter(Boolean))] as string[];
  }, [items]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Page header */}
      <div className="border-b border-[#e2e7ef] bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#28456f]">Cost Items Database</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-[#e2e7ef] bg-white px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Search */}
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded border border-[#d0d7e2] bg-white px-3">
              <Search className="h-4 w-4 text-[#8594a8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for All Items"
                className="h-full flex-1 border-0 bg-transparent text-[13px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "active" | "archived")}
                className="h-9 appearance-none rounded border border-[#d0d7e2] bg-[#28456f] pl-3 pr-8 text-[13px] font-medium text-white outline-none"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="flex h-9 items-center gap-1.5 rounded border border-[#d0d7e2] bg-white px-3 text-[13px] font-medium text-[#28456f]"
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </button>
              {showActionsMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-[240px] rounded border border-[#e2e7ef] bg-white py-1 shadow-lg">
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]">
                    <FileSpreadsheet className="h-4 w-4" />
                    Video: Cost Codes vs Cost Items
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]">
                    <Download className="h-4 w-4" />
                    Import from 1build.com Items Database
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]">
                    <Upload className="h-4 w-4" />
                    Import/Export to CSV
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]">
                    <Settings className="h-4 w-4" />
                    Apply/Bulk Markup
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex h-9 items-center gap-1.5 rounded bg-[#28456f] px-3 text-[13px] font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Item
                <ChevronDown className="h-4 w-4" />
              </button>
              {showAddMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-[180px] rounded border border-[#e2e7ef] bg-white py-1 shadow-lg">
                  <button
                    onClick={() => { onAddItem("material"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Material Item
                  </button>
                  <button
                    onClick={() => { onAddItem("labor"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Labor Item
                  </button>
                  <button
                    onClick={() => { onAddItem("equipment"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Equipment Item
                  </button>
                  <button
                    onClick={() => { onAddItem("subcontractor"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Subcontractor Item
                  </button>
                  <button
                    onClick={() => { onAddItem("other"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Other Item
                  </button>
                  <button
                    onClick={() => { onAddItem("system"); setShowAddMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] text-[#334a70] hover:bg-[#f6f8fb]"
                  >
                    <Plus className="h-4 w-4" />
                    Item Group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data grid */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 z-10 bg-[#f6f8fb]">
            <tr className="border-b border-[#e2e7ef]">
              <th className="w-10 border-r border-[#e2e7ef] px-2 py-2">
                <input type="checkbox" className="h-4 w-4 rounded border-[#c5cdd8]" />
              </th>
              <th className="w-14 border-r border-[#e2e7ef] px-2 py-2 text-left font-medium text-[#607492]">
                Type
              </th>
              <th className="w-[100px] border-r border-[#e2e7ef] px-2 py-2 text-left font-medium text-[#607492]">
                <div className="flex items-center gap-1">
                  SKU
                </div>
              </th>
              <th className="min-w-[200px] border-r border-[#e2e7ef] px-2 py-2 text-left font-medium text-[#607492]">
                <div className="flex items-center gap-1">
                  Name
                  <ChevronDown className="h-3 w-3" />
                </div>
              </th>
              <th className="w-[90px] border-r border-[#e2e7ef] px-2 py-2 text-right font-medium text-[#607492]">
                Unit Cost
              </th>
              <th className="w-[90px] border-r border-[#e2e7ef] px-2 py-2 text-left font-medium text-[#607492]">
                Unit
              </th>
              <th className="w-[70px] border-r border-[#e2e7ef] px-2 py-2 text-right font-medium text-[#607492]">
                MU %
              </th>
              <th className="w-[90px] border-r border-[#e2e7ef] px-2 py-2 text-right font-medium text-[#607492]">
                Total
              </th>
              <th className="min-w-[140px] border-r border-[#e2e7ef] px-2 py-2 text-left font-medium text-[#607492]">
                Cost Code
              </th>
              <th className="w-10 px-2 py-2 text-center font-medium text-[#607492]"></th>
            </tr>
            {/* Search row */}
            <tr className="border-b border-[#e2e7ef] bg-white">
              <td className="border-r border-[#e2e7ef] px-2 py-1"></td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as "all" | CatalogItem["itemType"])}
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-1 text-[11px] text-[#334a70] outline-none"
                >
                  <option value="all">All</option>
                  <option value="material">Material</option>
                  <option value="labor">Labor</option>
                  <option value="equipment">Equipment</option>
                  <option value="subcontractor">Sub</option>
                  <option value="other">Other</option>
                  <option value="system">System</option>
                </select>
              </td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <input
                  placeholder="Search SKU"
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-2 text-[11px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
                />
              </td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <input
                  placeholder="Search Name"
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-2 text-[11px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
                />
              </td>
              <td className="border-r border-[#e2e7ef] px-2 py-1"></td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <input
                  placeholder="Search Unit"
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-2 text-[11px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
                />
              </td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <input
                  placeholder="Search MU %"
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-2 text-[11px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
                />
              </td>
              <td className="border-r border-[#e2e7ef] px-2 py-1"></td>
              <td className="border-r border-[#e2e7ef] px-2 py-1">
                <select
                  value={costCodeFilter}
                  onChange={(e) => setCostCodeFilter(e.target.value)}
                  className="h-7 w-full rounded border border-[#d0d7e2] bg-white px-1 text-[11px] text-[#334a70] outline-none"
                >
                  <option value="all">Select Cost Code</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-1"></td>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const pricing = calculateSharedUnitPricing({
                baseUnitCost: item.defaultUnitCost,
                baseUnitPrice: item.defaultUnitPrice,
                markupPercent: item.markupPercent,
                hiddenMarkupPercent: item.hiddenMarkupPercent
              });
              const hasImage = Boolean(item.photoStoragePath);
              const vendor = vendors.find((v) => v.id === item.vendorId);

              return (
                <tr
                  key={item.id}
                  className={`border-b border-[#e2e7ef] hover:bg-[#f6f8fb] ${
                    index % 2 === 1 ? "bg-[#fafbfc]" : "bg-white"
                  }`}
                >
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#c5cdd8]" />
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <div className="flex items-center justify-center text-[#607492]">
                      <ItemTypeIcon itemType={item.itemType} />
                    </div>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      {vendor && (
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#f97316] text-[9px] font-bold text-white">
                          {vendor.name.charAt(0)}
                        </span>
                      )}
                      {hasImage && <ImageIcon className="h-4 w-4 text-[#8594a8]" />}
                      <span className="text-[#334a70]">{item.sku || "-"}</span>
                    </div>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <span className="text-[#334a70]">{item.name}</span>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5 text-right">
                    <span className="text-[#334a70]">${formatMoneyValue(item.defaultUnitCost)}</span>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <span className="text-[#334a70]">{item.unit}</span>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5 text-right">
                    <span className="text-[#334a70]">{item.markupPercent}</span>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5 text-right">
                    <span className="text-[#334a70]">${formatMoneyValue(pricing.finalUnitPrice)}</span>
                  </td>
                  <td className="border-r border-[#e2e7ef] px-2 py-1.5">
                    <span className="text-[#8594a8]">{item.category || "-"}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="flex h-6 w-6 items-center justify-center rounded text-[#8594a8] hover:bg-[#e8ecf2] hover:text-[#28456f]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Click outside to close menus */}
      {(showActionsMenu || showAddMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowActionsMenu(false);
            setShowAddMenu(false);
          }}
        />
      )}
    </div>
  );
}
