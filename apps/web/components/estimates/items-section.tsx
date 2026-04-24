"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FolderTree,
  GripVertical,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound
} from "lucide-react";
import type { CatalogItem, CatalogItemType, EstimateItemGroup } from "@floorconnector/types";

import { FinancialSummaryBar } from "@/components/estimates/financial-summary-bar";
import type { ExpandedSystemPreview } from "@/lib/catalogs/system-expansion";

export type EstimateItemsDraft = {
  rowKey: string;
  catalogItemId: string | null;
  sourceType: "catalog_item" | "system_component";
  sourceSystemId: string | null;
  sourceComponentId: string | null;
  itemType: CatalogItemType;
  groupId: string | null;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  baseUnitCost: string;
  baseUnitPrice: string;
  hiddenMarkupPercent: string;
  unitPriceBeforeHiddenMarkup: string;
  visibleMarkupAmount: string;
  hiddenMarkupAmount: string;
  unitPrice: string;
  markupPercent: string;
  taxCode: "taxable" | "non-taxable";
  assignedTo: string;
  lineTotal: string;
};

type ItemsSectionProps = {
  totalLabel: string;
  subtotalAmount: string;
  markupAmount: string;
  taxableSubtotal: string;
  exemptSubtotal: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  taxBehaviorLabel: string;
  taxRateLabel: string;
  customerTaxExempt: boolean;
  lineItems: EstimateItemsDraft[];
  itemGroups: EstimateItemGroup[];
  showMarkup: boolean;
  showOnlyZeroItems: boolean;
  visibleCatalogItems: CatalogItem[];
  selectedCatalogItemId: string;
  selectedSystemId: string;
  systemSquareFootage: string;
  systemPreview: ExpandedSystemPreview | null;
  onSelectedCatalogItemIdChange: (value: string) => void;
  onSelectedSystemIdChange: (value: string) => void;
  onSystemSquareFootageChange: (value: string) => void;
  onAddCatalogItem: () => void;
  onExpandSystem: () => void;
  onToggleMarkup: (value: boolean) => void;
  onToggleShowOnlyZeroItems: (value: boolean) => void;
  onLineItemChange: (
    rowKey: string,
    field: keyof EstimateItemsDraft,
    value: string
  ) => void;
  onAddGroup: () => void;
  onGroupLabelChange: (groupId: string, value: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onMoveLineItem: (rowKey: string, direction: -1 | 1) => void;
  onRemoveLineItem: (rowKey: string) => void;
  onQuickCreateCatalogItem: (input: {
    name: string;
    itemType: CatalogItem["itemType"];
    unit: string;
    defaultUnitCost: string;
    defaultUnitPrice: string | null;
    taxable: boolean;
  }) => Promise<void>;
  inventoryCreateError?: string | null;
};

type RowGroup = {
  id: string | null;
  label: string;
  rows: EstimateItemsDraft[];
};

function resolveTypeLabel(lineItem: EstimateItemsDraft) {
  if (lineItem.sourceType === "system_component") {
    return "SYS";
  }

  if (lineItem.sourceType === "catalog_item") {
    return "CAT";
  }

  switch (lineItem.itemType) {
    case "labor":
      return "LAB";
    case "equipment":
      return "EQP";
    case "material":
      return "MAT";
    case "service":
      return "SRV";
    default:
      return "ITM";
  }
}

function getNumericValue(value: string) {
  return Number(value.replace(/[$,%\s,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function getVisibleRowGroups(
  lineItems: EstimateItemsDraft[],
  itemGroups: EstimateItemGroup[],
  showOnlyZeroItems: boolean
): RowGroup[] {
  const visibleItems = showOnlyZeroItems
    ? lineItems.filter((lineItem) => getNumericValue(lineItem.lineTotal) === 0)
    : lineItems;
  const rowsByGroupId = new Map<string | null, EstimateItemsDraft[]>();

  for (const lineItem of visibleItems) {
    const key = lineItem.groupId ?? null;
    const existingRows = rowsByGroupId.get(key) ?? [];

    existingRows.push(lineItem);
    rowsByGroupId.set(key, existingRows);
  }

  const groups: RowGroup[] = [];
  const ungroupedRows = rowsByGroupId.get(null) ?? [];

  if (ungroupedRows.length > 0) {
    groups.push({
      id: null,
      label: "Ungrouped Items",
      rows: ungroupedRows
    });
  }

  for (const group of itemGroups) {
    groups.push({
      id: group.id,
      label: group.label,
      rows: rowsByGroupId.get(group.id) ?? []
    });
  }

  return groups;
}

function renderGroupSubtotal(rows: EstimateItemsDraft[]) {
  return formatMoney(
    rows.reduce((sum, row) => sum + getNumericValue(row.lineTotal), 0)
  );
}

export function ItemsSection({
  totalLabel,
  subtotalAmount,
  markupAmount,
  taxableSubtotal,
  exemptSubtotal,
  taxAmount,
  discountAmount,
  totalAmount,
  taxBehaviorLabel,
  taxRateLabel,
  customerTaxExempt,
  lineItems,
  itemGroups,
  showMarkup,
  showOnlyZeroItems,
  visibleCatalogItems,
  selectedCatalogItemId,
  selectedSystemId,
  systemSquareFootage,
  systemPreview,
  onSelectedCatalogItemIdChange,
  onSelectedSystemIdChange,
  onSystemSquareFootageChange,
  onAddCatalogItem,
  onExpandSystem,
  onToggleMarkup,
  onToggleShowOnlyZeroItems,
  onLineItemChange,
  onAddGroup,
  onGroupLabelChange,
  onDeleteGroup,
  onMoveLineItem,
  onRemoveLineItem,
  onQuickCreateCatalogItem,
  inventoryCreateError
}: ItemsSectionProps) {
  const [itemSearch, setItemSearch] = useState("");
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [quickItemName, setQuickItemName] = useState("");
  const [quickItemType, setQuickItemType] = useState<CatalogItemType>("material");
  const [quickItemUnit, setQuickItemUnit] = useState("each");
  const [quickItemCost, setQuickItemCost] = useState("");
  const [quickItemPrice, setQuickItemPrice] = useState("");
  const [quickItemTaxable, setQuickItemTaxable] = useState(true);
  const visibleGroups = getVisibleRowGroups(lineItems, itemGroups, showOnlyZeroItems);
  const visibleItemCount = visibleGroups.reduce((sum, group) => sum + group.rows.length, 0);
  const filteredPickerItems = visibleCatalogItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.trim().toLowerCase())
  );
  const directCatalogItems = filteredPickerItems.filter((item) => item.itemType !== "system");
  const systemCatalogItems = filteredPickerItems.filter((item) => item.itemType === "system");

  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <FinancialSummaryBar
        totalLabel={totalLabel}
        subtotalAmount={subtotalAmount}
        markupAmount={markupAmount}
        taxableSubtotal={taxableSubtotal}
        exemptSubtotal={exemptSubtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
        showMarkup={showMarkup}
        visibleItemCount={visibleItemCount}
      />

      <div className="grid gap-4 border-b border-[#e6e9ef] px-4 py-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-[12px] border border-[#dfe5ef] bg-[#fbfcfe] p-4">
          <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
            Add Item
          </div>
          <div className="mb-3">
            <label className="text-[12px] font-medium text-[#5d6f8a]">
              Search active inventory or systems
              <div className="mt-1.5 flex h-11 items-center rounded-[8px] border border-[#d7deea] bg-white px-3">
                <Search className="h-4 w-4 text-[#7b8aa3]" />
                <input
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search active items and systems"
                  className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#334a70] outline-none"
                />
              </div>
            </label>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[260px] flex-1 text-[12px] font-medium text-[#5d6f8a]">
              Inventory item
              <select
                value={selectedCatalogItemId}
                onChange={(event) => onSelectedCatalogItemIdChange(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
              >
                <option value="">Select inventory item</option>
                {directCatalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.itemType})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={onAddCatalogItem}
              disabled={!selectedCatalogItemId}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#1f5fd6] px-4 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9fb7ea]"
            >
              <Package className="h-4 w-4" />
              <span>Add Item</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreateItemForm((current) => !current)}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#d7deea] bg-white px-4 text-[14px] font-medium text-[#28456f]"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Item</span>
            </button>
          </div>
          {showCreateItemForm ? (
            <div className="mt-4 rounded-[10px] border border-[#d7deea] bg-white p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Name
                  <input
                    value={quickItemName}
                    onChange={(event) => setQuickItemName(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  />
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Type
                  <select
                    value={quickItemType}
                    onChange={(event) => setQuickItemType(event.target.value as CatalogItemType)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  >
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="service">Service</option>
                    <option value="equipment">Equipment</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Unit
                  <input
                    value={quickItemUnit}
                    onChange={(event) => setQuickItemUnit(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  />
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Cost
                  <input
                    value={quickItemCost}
                    onChange={(event) => setQuickItemCost(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  />
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Price
                  <input
                    value={quickItemPrice}
                    onChange={(event) => setQuickItemPrice(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  />
                </label>
                <label className="flex items-center gap-3 pt-7 text-[13px] font-medium text-[#334a70]">
                  <input
                    type="checkbox"
                    checked={quickItemTaxable}
                    onChange={(event) => setQuickItemTaxable(event.target.checked)}
                    className="h-4 w-4 rounded-[3px] border-[#a9b5c8]"
                  />
                  <span>Taxable</span>
                </label>
              </div>
              {inventoryCreateError ? (
                <p className="mt-3 text-[13px] text-rose-700">{inventoryCreateError}</p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateItemForm(false)}
                  className="rounded-[8px] border border-[#d7deea] px-4 py-2 text-[14px] font-medium text-[#28456f]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      await onQuickCreateCatalogItem({
                        name: quickItemName,
                        itemType: quickItemType,
                        unit: quickItemUnit,
                        defaultUnitCost: quickItemCost,
                        defaultUnitPrice: quickItemPrice.trim().length > 0 ? quickItemPrice : null,
                        taxable: quickItemTaxable
                      });
                      if (!inventoryCreateError) {
                        setQuickItemName("");
                        setQuickItemUnit("each");
                        setQuickItemCost("");
                        setQuickItemPrice("");
                        setQuickItemTaxable(true);
                        setShowCreateItemForm(false);
                      }
                    })();
                  }}
                  className="rounded-[8px] bg-[#1f5fd6] px-4 py-2 text-[14px] font-medium text-white"
                >
                  Create and Add
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[12px] border border-[#dfe5ef] bg-[#fbfcfe] p-4">
          <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
            System Expansion
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] flex-1 text-[12px] font-medium text-[#5d6f8a]">
              System
              <select
                value={selectedSystemId}
                onChange={(event) => onSelectedSystemIdChange(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
              >
                <option value="">Select system</option>
                {systemCatalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="w-[140px] text-[12px] font-medium text-[#5d6f8a]">
              Sqft
              <input
                value={systemSquareFootage}
                onChange={(event) => onSystemSquareFootageChange(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={onExpandSystem}
              disabled={!selectedSystemId || getNumericValue(systemSquareFootage) <= 0}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#23395d] px-4 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a9b6c8]"
            >
              <Plus className="h-4 w-4" />
              <span>Add System by Sqft</span>
            </button>
          </div>
          {systemPreview ? (
            <div className="mt-4 rounded-[10px] border border-[#d7deea] bg-white">
              <div className="grid gap-3 border-b border-[#e6e9ef] px-3 py-3 text-[12px] text-[#607492] sm:grid-cols-4">
                <div>
                  <span className="block font-semibold uppercase tracking-[0.08em]">
                    Components
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-[#23395d]">
                    {systemPreview.rows.length}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold uppercase tracking-[0.08em]">
                    Cost
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-[#23395d]">
                    ${systemPreview.totalCost}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold uppercase tracking-[0.08em]">
                    Price
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-[#23395d]">
                    ${systemPreview.totalPrice}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold uppercase tracking-[0.08em]">
                    Tax Mix
                  </span>
                  <span className="mt-1 block text-[13px] font-semibold text-[#23395d]">
                    T ${systemPreview.taxablePrice} / E ${systemPreview.exemptPrice}
                  </span>
                </div>
              </div>
              <div className="max-h-[220px] overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#e6e9ef] bg-[#f6f8fc] text-[11px] uppercase tracking-[0.08em] text-[#7c8ba3]">
                      <th className="px-3 py-2 text-left">Component</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Cost</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-center">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemPreview.rows.map((row) => (
                      <tr key={row.componentId} className="border-b border-[#edf1f6] text-[13px] text-[#334a70]">
                        <td className="px-3 py-2">
                          <div className="font-medium">{row.name}</div>
                          <div className="text-[11px] text-[#8694ab]">{row.unit}</div>
                        </td>
                        <td className="px-3 py-2 text-right">{row.quantity}</td>
                        <td className="px-3 py-2 text-right">${row.lineCost}</td>
                        <td className="px-3 py-2 text-right">${row.linePrice}</td>
                        <td className="px-3 py-2 text-center">
                          {row.taxable ? "T" : "E"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e9ef] px-4 py-3">
        <div className="space-y-1 text-[13px] text-[#6f8098]">
          <div>
            Tax is derived from line-item taxability, org defaults, and customer exemption.
          </div>
          <div>
            Behavior: <span className="font-medium text-[#23395d]">{taxBehaviorLabel}</span> | Rate:{" "}
            <span className="font-medium text-[#23395d]">{taxRateLabel}</span>
            {customerTaxExempt ? (
              <span className="ml-2 rounded-full bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                Customer exempt
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[14px]">
          <button
            type="button"
            onClick={() => onToggleMarkup(true)}
            className={[
              "inline-flex items-center gap-2 rounded-[6px] border px-3 py-2",
              showMarkup
                ? "border-[#2d67e0] bg-[#eef4ff] text-[#2d67e0]"
                : "border-[#d7deea] text-[#697995]"
            ].join(" ")}
          >
            <Eye className="h-4 w-4" />
            <span>Show Markup</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleMarkup(false)}
            className={[
              "inline-flex items-center gap-2 rounded-[6px] border px-3 py-2",
              !showMarkup
                ? "border-[#2d67e0] bg-[#eef4ff] text-[#2d67e0]"
                : "border-[#d7deea] text-[#697995]"
            ].join(" ")}
          >
            <EyeOff className="h-4 w-4" />
            <span>Hide Markup</span>
          </button>
          <div className="inline-flex overflow-hidden rounded-[6px] bg-[#edf1f6] font-medium">
            <button
              type="button"
              onClick={() => onToggleShowOnlyZeroItems(true)}
              className={showOnlyZeroItems ? "bg-[#1f5fd6] px-3 py-1.5 text-white" : "px-3 py-1.5 text-[#8b99b0]"}
            >
              $0 Only
            </button>
            <button
              type="button"
              onClick={() => onToggleShowOnlyZeroItems(false)}
              className={!showOnlyZeroItems ? "bg-[#1f5fd6] px-3 py-1.5 text-white" : "px-3 py-1.5 text-[#8b99b0]"}
            >
              All
            </button>
          </div>
          <button
            type="button"
            onClick={onAddGroup}
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#d7deea] px-4 py-2.5 text-[15px] font-medium text-[#28456f]"
          >
            <FolderTree className="h-4 w-4" />
            <span>Add Group</span>
          </button>
        </div>
      </div>

      <div className="border-b border-[#e6e9ef] bg-[#fbfcfe] px-4 py-3 text-[12px] leading-6 text-[#7c8ba3]">
        `estimate_line_items` stays authoritative for pricing rows, but every saved row now comes from active inventory or system expansion. New estimate-only manual rows are intentionally disabled.
      </div>

      <div className="min-h-[720px] bg-[#f8f9fc] p-4">
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <section
              key={group.id ?? "ungrouped"}
              className="overflow-hidden rounded-[14px] border border-[#dfe5ef] bg-white shadow-[0_16px_38px_-30px_rgba(15,23,42,0.45)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e9ef] bg-[#fbfcfe] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <GripVertical className="h-4 w-4 text-[#8e9cb2]" />
                  {group.id ? (
                    <input
                      value={group.label}
                      onChange={(event) => onGroupLabelChange(group.id as string, event.target.value)}
                      className="h-9 min-w-[220px] border border-[#d7deea] bg-white px-3 text-[16px] font-semibold text-[#23395d] outline-none focus:border-[#9aaecc]"
                    />
                  ) : (
                    <span className="text-[18px] font-semibold text-[#23395d]">{group.label}</span>
                  )}
                  <span className="rounded-full bg-[#eef3fb] px-3 py-1 text-[12px] font-medium text-[#607492]">
                    {group.rows.length} item{group.rows.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[15px] font-semibold text-[#23395d]">
                    {renderGroupSubtotal(group.rows)}
                  </span>
                  {group.id ? (
                    <button
                      type="button"
                      onClick={() => onDeleteGroup(group.id as string)}
                      className="inline-flex items-center gap-2 rounded-[6px] border border-[#ebd3d3] px-3 py-2 text-[14px] text-[#8f4b4b]"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Group</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#e6e9ef] bg-[#f6f8fc] text-[12px] uppercase tracking-[0.08em] text-[#7c8ba3]">
                      <th className="w-8 px-2 py-3 text-left"></th>
                      <th className="w-[64px] px-2 py-3 text-left">Type</th>
                      <th className="min-w-[280px] px-2 py-3 text-left">Item Name</th>
                      <th className="w-[140px] px-2 py-3 text-left">Group</th>
                      <th className="w-[84px] px-2 py-3 text-right">Qty</th>
                      <th className="w-[88px] px-2 py-3 text-left">Unit</th>
                      <th className="w-[120px] px-2 py-3 text-right">Cost</th>
                      {showMarkup ? (
                        <th className="w-[86px] px-2 py-3 text-right">MU%</th>
                      ) : null}
                      <th className="w-[86px] px-2 py-3 text-right">Hidden%</th>
                      <th className="w-[120px] px-2 py-3 text-right">
                        {showMarkup ? "Sell Price" : "Price"}
                      </th>
                      <th className="w-[120px] px-2 py-3 text-right">Total</th>
                      <th className="w-[60px] px-2 py-3 text-center">Tax</th>
                      <th className="w-[118px] px-2 py-3 text-left">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((lineItem, index) => (
                      <tr
                        key={lineItem.rowKey}
                        className={[
                          "border-b border-[#edf1f6] align-top text-[15px] text-[#334a70]",
                          index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"
                        ].join(" ")}
                      >
                        <td className="px-2 py-3 text-[#a5b1c4]">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onMoveLineItem(lineItem.rowKey, -1)}
                              className="text-[#7e8ca3]"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onMoveLineItem(lineItem.rowKey, 1)}
                              className="text-[#7e8ca3]"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f0ff] text-[#2f66d7]">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="mt-1 text-[11px] text-[#8694ab]">
                            {resolveTypeLabel(lineItem)}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-col gap-1">
                            <input
                              value={lineItem.name}
                              onChange={(event) =>
                                onLineItemChange(lineItem.rowKey, "name", event.target.value)
                              }
                              placeholder="Item name"
                              className="h-8 border-0 bg-transparent px-0 text-[15px] font-medium text-[#334a70] outline-none placeholder:text-[#a9b5c8]"
                            />
                            <input
                              value={lineItem.description}
                              onChange={(event) =>
                                onLineItemChange(lineItem.rowKey, "description", event.target.value)
                              }
                              placeholder="Description"
                              className="h-7 border-0 bg-transparent px-0 text-[12px] text-[#8694ab] outline-none placeholder:text-[#b6bfce]"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={lineItem.groupId ?? ""}
                            onChange={(event) =>
                              onLineItemChange(lineItem.rowKey, "groupId", event.target.value)
                            }
                            className="h-9 w-full rounded-[6px] border border-[#d7deea] bg-white px-2 text-[14px] text-[#334a70] outline-none"
                          >
                            <option value="">Ungrouped Items</option>
                            {itemGroups.map((itemGroup) => (
                              <option key={itemGroup.id} value={itemGroup.id}>
                                {itemGroup.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={lineItem.quantity}
                            onChange={(event) =>
                              onLineItemChange(lineItem.rowKey, "quantity", event.target.value)
                            }
                            className="w-full border-0 bg-transparent px-0 text-right text-[15px] text-[#334a70] outline-none"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={lineItem.unit}
                            onChange={(event) =>
                              onLineItemChange(lineItem.rowKey, "unit", event.target.value)
                            }
                            className="w-full border-0 bg-transparent px-0 text-[15px] text-[#6f8098] outline-none"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            value={lineItem.baseUnitCost}
                            onChange={(event) =>
                              onLineItemChange(lineItem.rowKey, "baseUnitCost", event.target.value)
                            }
                            className="w-full border-0 bg-transparent px-0 text-right text-[15px] text-[#334a70] outline-none"
                          />
                        </td>
                        {showMarkup ? (
                          <td className="px-2 py-3">
                            <input
                              value={lineItem.markupPercent}
                              onChange={(event) =>
                                onLineItemChange(
                                  lineItem.rowKey,
                                  "markupPercent",
                                  event.target.value
                                )
                              }
                              className="w-full border-0 bg-transparent px-0 text-right text-[15px] text-[#334a70] outline-none"
                            />
                          </td>
                        ) : null}
                        <td className="px-2 py-3 text-right">
                          <div className="text-[15px] text-[#8694ab]">
                            {lineItem.hiddenMarkupPercent}%
                          </div>
                          <div className="mt-1 text-[11px] text-[#a2aec0]">
                            +${getNumericValue(lineItem.hiddenMarkupAmount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <div className="text-[15px] text-[#334a70]">
                            ${getNumericValue(lineItem.baseUnitPrice).toFixed(2)}
                          </div>
                          <div className="mt-1 text-[12px] text-[#8694ab]">
                            Pre-hidden ${getNumericValue(lineItem.unitPriceBeforeHiddenMarkup).toFixed(2)}
                          </div>
                          <div className="mt-1 text-[12px] font-medium text-[#334a70]">
                            {lineItem.unitPrice}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right text-[15px] font-semibold text-[#334a70]">
                          {lineItem.lineTotal}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={lineItem.taxCode === "taxable"}
                            onChange={(event) =>
                              onLineItemChange(
                                lineItem.rowKey,
                                "taxCode",
                                event.target.checked ? "taxable" : "non-taxable"
                              )
                            }
                            className="h-4 w-4 rounded-[3px] border-[#a9b5c8] text-[#28456f]"
                          />
                        </td>
                        <td className="px-2 py-3 text-[#8694ab]">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-[#7485a0]">
                              <UserRound className="h-4 w-4" />
                            </span>
                            <input
                              value={lineItem.assignedTo}
                              onChange={(event) =>
                                onLineItemChange(
                                  lineItem.rowKey,
                                  "assignedTo",
                                  event.target.value
                                )
                              }
                              placeholder="Assign"
                              className="w-full border-0 bg-transparent px-0 text-[14px] text-[#6f8098] outline-none placeholder:text-[#a9b5c8]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveLineItem(lineItem.rowKey)}
                            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {group.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={showMarkup ? 13 : 12}
                          className="px-4 py-8 text-center text-[14px] text-[#93a0b5]"
                        >
                          No visible items in this group yet. Add an inventory item or expand a system above to keep building the estimate.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
