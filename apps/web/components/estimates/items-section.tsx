"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FileDown,
  FolderTree,
  GripVertical,
  Lock,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound
} from "lucide-react";
import type {
  CatalogItem,
  CatalogItemType,
  EstimateItemGroup,
  EstimateStatus
} from "@floorconnector/types";

import {
  EstimateImportChooser,
  type EstimateImportSourceOption
} from "@/components/estimates/estimate-import-chooser";
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
  costCode: string;
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
  estimateStatus: EstimateStatus;
  lineItems: EstimateItemsDraft[];
  itemGroups: EstimateItemGroup[];
  importSourceEstimates: EstimateImportSourceOption[];
  showMarkup: boolean;
  showOnlyZeroItems: boolean;
  visibleCatalogItems: CatalogItem[];
  catalogItemsForReview: CatalogItem[];
  selectedCatalogItemId: string;
  selectedSystemId: string;
  systemInputMode: "dimensions" | "direct";
  systemLength: string;
  systemWidth: string;
  systemSquareFootage: string;
  systemLinearFootage: string;
  systemCount: string;
  systemPreview: ExpandedSystemPreview | null;
  systemPreviewMessage?: string | null;
  isPreviewPending?: boolean;
  onSelectedCatalogItemIdChange: (value: string) => void;
  onSelectedSystemIdChange: (value: string) => void;
  onSystemMeasurementChange: (field: string, value: string) => void;
  onAddCatalogItem: () => void;
  onQuickAddCatalogItem: (catalogItemId: string) => void;
  onAddPreviewCatalogItem: (catalogItemId: string) => void;
  onImportLineItemsFromEstimate: (
    sourceEstimateId: string
  ) => Promise<{ ok: boolean; message: string }>;
  onImportReusableContentFromEstimate: (
    sourceEstimateId: string,
    section: "scope" | "terms" | "inclusions" | "exclusions"
  ) => Promise<{ ok: boolean; message: string }>;
  onPreviewSystem: () => void;
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
    category: string | null;
    defaultUnitCost: string;
    defaultUnitPrice: string | null;
  }) => Promise<boolean>;
  inventoryCreateError?: string | null;
  catalogPreviewAddMessage?: string | null;
  isCatalogPreviewAddPending?: boolean;
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

function formatUnitLabel(unit: string) {
  const normalized = unit.trim();
  const lower = normalized.toLowerCase();

  if (lower === "sqft" || lower === "sf" || lower === "square foot" || lower === "square feet") {
    return "sqft";
  }

  if (lower === "lf" || lower === "linear foot" || lower === "linear feet") {
    return "lf";
  }

  if (lower === "each" || lower === "ea" || lower === "count") {
    return "ea";
  }

  return normalized || "ea";
}

function getCatalogPriceBasis(lineItem: EstimateItemsDraft) {
  const unitPriceBeforeHiddenMarkup = getNumericValue(lineItem.unitPriceBeforeHiddenMarkup);
  const hiddenMarkupAmount = getNumericValue(lineItem.hiddenMarkupAmount);

  if (unitPriceBeforeHiddenMarkup > 0) {
    return unitPriceBeforeHiddenMarkup + hiddenMarkupAmount;
  }

  return getNumericValue(lineItem.baseUnitPrice);
}

function isUnitPriceOverridden(lineItem: EstimateItemsDraft) {
  const currentUnitPrice = getNumericValue(lineItem.unitPrice);
  const catalogPrice = getCatalogPriceBasis(lineItem);

  return Math.abs(currentUnitPrice - catalogPrice) >= 0.01;
}

function isAddOnOptionCategory(category: string | null | undefined) {
  return (category ?? "").trim().toLowerCase() === "add-ons / options";
}

function getCatalogItemOptionLabel(item: CatalogItem) {
  const suffix = isAddOnOptionCategory(item.category) ? " - Add-on / Option" : "";

  return `${item.name} (${item.itemType}${item.category ? ` / ${item.category}` : ""})${suffix}`;
}

function formatCatalogCurrency(value: string | null) {
  if (value == null || value.trim().length === 0) {
    return "Not set";
  }

  return formatMoney(getNumericValue(value));
}

function formatCatalogTypeLabel(itemType: CatalogItemType) {
  switch (itemType) {
    case "material":
      return "Material";
    case "labor":
      return "Labor";
    case "service":
      return "Service";
    case "equipment":
      return "Equipment";
    case "subcontractor":
      return "Subcontractor";
    case "system":
      return "System";
    default:
      return "Other";
  }
}

function getCatalogCategoryLabel(item: CatalogItem) {
  return item.category?.trim() || formatCatalogTypeLabel(item.itemType);
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
  estimateStatus,
  lineItems,
  itemGroups,
  importSourceEstimates,
  showMarkup,
  showOnlyZeroItems,
  visibleCatalogItems,
  catalogItemsForReview,
  selectedCatalogItemId,
  selectedSystemId,
  systemInputMode,
  systemLength,
  systemWidth,
  systemSquareFootage,
  systemLinearFootage,
  systemCount,
  systemPreview,
  systemPreviewMessage,
  isPreviewPending = false,
  onSelectedCatalogItemIdChange,
  onSelectedSystemIdChange,
  onSystemMeasurementChange,
  onAddCatalogItem,
  onQuickAddCatalogItem,
  onAddPreviewCatalogItem,
  onImportLineItemsFromEstimate,
  onImportReusableContentFromEstimate,
  onPreviewSystem,
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
  inventoryCreateError,
  catalogPreviewAddMessage,
  isCatalogPreviewAddPending = false
}: ItemsSectionProps) {
  const catalogSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [showImportTools, setShowImportTools] = useState(false);
  const [quickItemName, setQuickItemName] = useState("");
  const [quickItemType, setQuickItemType] = useState<CatalogItemType>("material");
  const [quickItemUnit, setQuickItemUnit] = useState("each");
  const [quickItemCategory, setQuickItemCategory] = useState("");
  const [quickItemCost, setQuickItemCost] = useState("");
  const [quickItemPrice, setQuickItemPrice] = useState("");
  const [catalogPreviewSearch, setCatalogPreviewSearch] = useState("");
  const [catalogPreviewType, setCatalogPreviewType] = useState("all");
  const [catalogPreviewCategory, setCatalogPreviewCategory] = useState("all");
  const [selectedCatalogPreviewId, setSelectedCatalogPreviewId] = useState("");
  const visibleGroups = getVisibleRowGroups(lineItems, itemGroups, showOnlyZeroItems);
  const visibleItemCount = visibleGroups.reduce((sum, group) => sum + group.rows.length, 0);
  const filteredPickerItems = visibleCatalogItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.trim().toLowerCase())
  );
  const directCatalogItems = filteredPickerItems.filter((item) => item.itemType !== "system");
  const systemCatalogItems = filteredPickerItems.filter((item) => item.itemType === "system");
  const quickAddItems = directCatalogItems.slice(0, 6);
  const firstQuickAddItem = quickAddItems[0] ?? directCatalogItems[0] ?? null;
  const readOnlyCatalogItems = catalogItemsForReview.length > 0
    ? catalogItemsForReview
    : visibleCatalogItems;
  const catalogPreviewTypeOptions = useMemo(
    () => Array.from(new Set(readOnlyCatalogItems.map((item) => item.itemType))).sort(),
    [readOnlyCatalogItems]
  );
  const catalogPreviewCategoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          readOnlyCatalogItems
            .map((item) => item.category?.trim())
            .filter((category): category is string => Boolean(category))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [readOnlyCatalogItems]
  );
  const filteredCatalogPreviewItems = useMemo(() => {
    const normalizedSearch = catalogPreviewSearch.trim().toLowerCase();

    return readOnlyCatalogItems.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        (item.category ?? "").toLowerCase().includes(normalizedSearch) ||
        (item.sku ?? "").toLowerCase().includes(normalizedSearch) ||
        (item.costCode ?? "").toLowerCase().includes(normalizedSearch);
      const matchesType = catalogPreviewType === "all" || item.itemType === catalogPreviewType;
      const matchesCategory =
        catalogPreviewCategory === "all" ||
        item.category?.trim().toLowerCase() === catalogPreviewCategory.toLowerCase();

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [
    catalogPreviewCategory,
    catalogPreviewSearch,
    catalogPreviewType,
    readOnlyCatalogItems
  ]);
  const selectedCatalogPreviewItem =
    readOnlyCatalogItems.find((item) => item.id === selectedCatalogPreviewId) ??
    filteredCatalogPreviewItems[0] ??
    null;
  const canAddSelectedCatalogPreviewItem =
    Boolean(selectedCatalogPreviewItem) &&
    selectedCatalogPreviewItem?.status === "active" &&
    selectedCatalogPreviewItem.itemType !== "system";
  const selectedCatalogPreviewAddLabel = isCatalogPreviewAddPending
    ? "Adding..."
    : canAddSelectedCatalogPreviewItem
      ? "Add to estimate"
      : selectedCatalogPreviewItem?.itemType === "system"
        ? "Use system expansion"
        : selectedCatalogPreviewItem?.status !== "active"
          ? "Archived item"
          : "Add to estimate";
  const selectedCatalogPreviewAddTitle = canAddSelectedCatalogPreviewItem
    ? "Add this active catalog item to the estimate as a server-owned snapshot."
    : selectedCatalogPreviewItem?.itemType === "system"
      ? "Systems must be inserted through the system expansion flow."
      : selectedCatalogPreviewItem?.status !== "active"
        ? "Archived catalog items stay visible for review but cannot be added to estimates."
        : "Select an active catalog item to add it to this estimate.";
  const canSubmitQuickCreate =
    quickItemName.trim().length > 0 &&
    quickItemUnit.trim().length > 0 &&
    quickItemCost.trim().length > 0;

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

      <div className="grid gap-4 border-b border-[#e6e9ef] px-4 py-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="order-3 rounded-[12px] border border-[#dfe5ef] bg-white p-4 xl:col-span-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                Catalog Items
              </div>
              <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6b7c96]">
                Catalog items are reusable cost items for future estimates, invoices, and materials
                planning. Selecting a row previews its details; active non-system items can be
                added to this estimate as locked snapshots.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[#f0c7a5] bg-[#fff7ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a4581a]">
              Active direct items can be added
            </span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Search by name
                  <div className="mt-1.5 flex h-10 items-center rounded-[8px] border border-[#d7deea] bg-white px-3">
                    <Search className="h-4 w-4 text-[#7b8aa3]" />
                    <input
                      value={catalogPreviewSearch}
                      onChange={(event) => setCatalogPreviewSearch(event.target.value)}
                      placeholder="Search catalog items"
                      className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </div>
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Type
                  <select
                    value={catalogPreviewType}
                    onChange={(event) => setCatalogPreviewType(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                  >
                    <option value="all">All types</option>
                    {catalogPreviewTypeOptions.map((itemType) => (
                      <option key={itemType} value={itemType}>
                        {formatCatalogTypeLabel(itemType)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-[12px] font-medium text-[#5d6f8a]">
                  Category
                  <select
                    value={catalogPreviewCategory}
                    onChange={(event) => setCatalogPreviewCategory(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                  >
                    <option value="all">All categories</option>
                    {catalogPreviewCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e1e7f0]">
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(120px,0.55fr)_88px_120px_82px_92px] bg-[#f6f8fc] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7c8ba3]">
                      <span>Name</span>
                      <span>Type / Category</span>
                      <span>Unit</span>
                      <span className="text-right">Default Price</span>
                      <span className="text-center">Taxable</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                      {filteredCatalogPreviewItems.map((item) => {
                        const isSelected = selectedCatalogPreviewItem?.id === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedCatalogPreviewId(item.id)}
                            className={[
                              "grid w-full grid-cols-[minmax(0,1.35fr)_minmax(120px,0.55fr)_88px_120px_82px_92px] items-center gap-0 border-t border-[#edf1f6] px-3 py-3 text-left text-[13px] transition",
                              isSelected ? "bg-[#fff7ef]" : "bg-white hover:bg-[#fbfcfe]"
                            ].join(" ")}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-[#23395d]">
                                {item.name}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-[#8a98ad]">
                                {item.sku || item.costCode || item.description || "Reusable cost item"}
                              </span>
                            </span>
                            <span className="min-w-0 text-[#5d6f8a]">
                              <span className="block truncate">
                                {formatCatalogTypeLabel(item.itemType)}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-[#8a98ad]">
                                {getCatalogCategoryLabel(item)}
                              </span>
                            </span>
                            <span className="text-[#334a70]">{formatUnitLabel(item.unit)}</span>
                            <span className="text-right font-semibold text-[#23395d]">
                              {formatCatalogCurrency(item.defaultUnitPrice)}
                            </span>
                            <span className="text-center text-[#5d6f8a]">
                              {item.taxable ? "Yes" : "No"}
                            </span>
                            <span className="text-right">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                  item.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                ].join(" ")}
                              >
                                {item.status === "active" ? "Active" : "Archived"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      {filteredCatalogPreviewItems.length === 0 ? (
                        <div className="border-t border-[#edf1f6] bg-[#fbfcfe] px-4 py-8 text-center text-[14px] leading-6 text-[#7c8ba3]">
                          No catalog items match this search yet. Catalog items are reusable cost
                          items for estimates, invoices, and materials planning.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-[10px] border border-[#dfe5ef] bg-[#fbfcfe] p-4">
              {selectedCatalogPreviewItem ? (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a8aa3]">
                        Preview
                      </p>
                      <h3 className="mt-1 break-words text-[17px] font-semibold leading-6 text-[#23395d]">
                        {selectedCatalogPreviewItem.name}
                      </h3>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                        selectedCatalogPreviewItem.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      ].join(" ")}
                    >
                      {selectedCatalogPreviewItem.status === "active" ? "Active" : "Archived"}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-5 text-[#6b7c96]">
                    {selectedCatalogPreviewItem.description ||
                      "No description saved for this reusable cost item yet."}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Type
                      </dt>
                      <dd className="mt-1 text-[14px] font-semibold text-[#23395d]">
                        {formatCatalogTypeLabel(selectedCatalogPreviewItem.itemType)}
                      </dd>
                    </div>
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Category
                      </dt>
                      <dd className="mt-1 text-[14px] font-semibold text-[#23395d]">
                        {getCatalogCategoryLabel(selectedCatalogPreviewItem)}
                      </dd>
                    </div>
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Unit
                      </dt>
                      <dd className="mt-1 text-[14px] font-semibold text-[#23395d]">
                        {formatUnitLabel(selectedCatalogPreviewItem.unit)}
                      </dd>
                    </div>
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Default Price
                      </dt>
                      <dd className="mt-1 text-[14px] font-semibold text-[#23395d]">
                        {formatCatalogCurrency(selectedCatalogPreviewItem.defaultUnitPrice)}
                      </dd>
                    </div>
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Taxable
                      </dt>
                      <dd className="mt-1 text-[14px] font-semibold text-[#23395d]">
                        {selectedCatalogPreviewItem.taxable ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div className="rounded-[8px] bg-white p-3">
                      <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                        Code
                      </dt>
                      <dd className="mt-1 truncate text-[14px] font-semibold text-[#23395d]">
                        {selectedCatalogPreviewItem.sku ||
                          selectedCatalogPreviewItem.costCode ||
                          "Not set"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    disabled={!canAddSelectedCatalogPreviewItem || isCatalogPreviewAddPending}
                    onClick={() => {
                      if (!selectedCatalogPreviewItem || !canAddSelectedCatalogPreviewItem) {
                        return;
                      }

                      onAddPreviewCatalogItem(selectedCatalogPreviewItem.id);
                    }}
                    className={[
                      "mt-4 inline-flex h-10 w-full items-center justify-center rounded-[8px] border px-4 text-[13px] font-semibold transition",
                      canAddSelectedCatalogPreviewItem && !isCatalogPreviewAddPending
                        ? "border-[#d8731f] bg-[#d8731f] text-white hover:bg-[#bf6519]"
                        : "border-[#d7deea] bg-white text-[#8a98ad]"
                    ].join(" ")}
                    title={selectedCatalogPreviewAddTitle}
                  >
                    {selectedCatalogPreviewAddLabel}
                  </button>
                  {catalogPreviewAddMessage ? (
                    <p className="mt-2 rounded-[8px] border border-[#dfe5ef] bg-white px-3 py-2 text-[12px] leading-5 text-[#6b7c96]">
                      {catalogPreviewAddMessage}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-[8px] border border-dashed border-[#d7deea] bg-white px-4 text-center text-[13px] leading-6 text-[#7c8ba3]">
                  Select a catalog item to preview reusable cost, unit, taxability, and status
                  details before adding an active direct item to this estimate.
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="order-2 rounded-[12px] border border-[#dfe5ef] bg-white p-4 xl:order-2">
          <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
            More ways to add items
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreateItemForm((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d7deea] bg-white px-4 text-[14px] font-medium text-[#607492]"
            >
              <Plus className="h-4 w-4" />
              <span>Add manual item</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateItemForm(false);
                catalogSearchInputRef.current?.focus();
              }}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d7deea] bg-white px-4 text-[14px] font-medium text-[#28456f]"
            >
              <Package className="h-4 w-4" />
              <span>Add from catalog</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateItemForm(false);
                setShowImportTools((current) => !current);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d7deea] bg-white px-4 text-[14px] font-medium text-[#607492]"
            >
              <FileDown className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>
          <details
            open={showImportTools}
            onToggle={(event) => setShowImportTools(event.currentTarget.open)}
            className="mb-4 rounded-[10px] border border-[#d7deea] bg-[#fbfcfe] px-3 py-3"
          >
            <summary className="cursor-pointer text-[13px] font-medium text-[#48617f]">
              Import from another estimate
            </summary>
            <div className="mt-3">
              <EstimateImportChooser
                estimateStatus={estimateStatus}
                importSourceEstimates={importSourceEstimates}
                onImportLineItemsFromEstimate={onImportLineItemsFromEstimate}
                onImportReusableContentFromEstimate={onImportReusableContentFromEstimate}
              />
            </div>
          </details>
          <div className="mb-3">
            <label className="text-[12px] font-medium text-[#5d6f8a]">
              Add from catalog / cost database
              <div className="mt-1.5 flex h-11 items-center rounded-[8px] border border-[#d7deea] bg-white px-3">
                <Search className="h-4 w-4 text-[#7b8aa3]" />
                <input
                  ref={catalogSearchInputRef}
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || !firstQuickAddItem) {
                      return;
                    }

                    event.preventDefault();
                    onQuickAddCatalogItem(firstQuickAddItem.id);
                  }}
                  placeholder="Search reusable items and systems"
                  className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#334a70] outline-none"
                />
              </div>
            </label>
          </div>
          {firstQuickAddItem ? (
            <div className="mb-3 text-[12px] text-[#6b7c96]">
              Press Enter to add <span className="font-medium text-[#334a70]">{firstQuickAddItem.name}</span> as an estimate item.
            </div>
          ) : null}
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[260px] flex-1 text-[12px] font-medium text-[#5d6f8a]">
              Catalog / cost database item
              <select
                value={selectedCatalogItemId}
                onChange={(event) => onSelectedCatalogItemIdChange(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
              >
                <option value="">Select catalog item</option>
                {directCatalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getCatalogItemOptionLabel(item)}
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
              <span>Add from catalog</span>
            </button>
          </div>
          {quickAddItems.length > 0 ? (
            <div className="mt-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a8aa3]">
                Catalog quick matches
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAddItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onQuickAddCatalogItem(item.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d7deea] bg-white px-3 py-1.5 text-[13px] font-medium text-[#28456f]"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showCreateItemForm ? (
            <div className="mt-3 rounded-[10px] border border-[#d7deea] bg-white p-3">
              <div className="mb-2 text-[12px] leading-5 text-[#6b7c96]">
                Add a manual one-off estimate item by creating the reusable catalog item first, then
                adding it to this estimate immediately.
              </div>
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
                  Classification
                  <select
                    value={quickItemCategory}
                    onChange={(event) => setQuickItemCategory(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  >
                    <option value="">Catalog Item</option>
                    <option value="Add-ons / Options">Add-ons / Options</option>
                  </select>
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
                  Price (optional)
                  <input
                    value={quickItemPrice}
                    onChange={(event) => setQuickItemPrice(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] px-3 text-[14px] text-[#334a70] outline-none"
                  />
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
                      const didCreate = await onQuickCreateCatalogItem({
                        name: quickItemName,
                        itemType: quickItemType,
                        unit: quickItemUnit,
                        category: quickItemCategory.trim().length > 0 ? quickItemCategory : null,
                        defaultUnitCost: quickItemCost,
                        defaultUnitPrice: quickItemPrice.trim().length > 0 ? quickItemPrice : null
                      });
                      if (didCreate) {
                        setQuickItemName("");
                        setQuickItemUnit("each");
                        setQuickItemCategory("");
                        setQuickItemCost("");
                        setQuickItemPrice("");
                        setShowCreateItemForm(false);
                      }
                    })();
                  }}
                  disabled={!canSubmitQuickCreate}
                  className="rounded-[8px] bg-[#1f5fd6] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9fb7ea]"
                >
                  Create item and add to estimate
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div
          id="system-estimate-builder"
          className="order-1 rounded-[14px] border border-[#efb583] bg-[linear-gradient(180deg,#fff7ef,#ffffff)] p-5 shadow-[0_22px_55px_-42px_rgba(239,125,50,0.95)] xl:order-1"
        >
          <div className="mb-2 inline-flex rounded-full bg-[#ef7d32] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Generate from System
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-[#2b2118]">
              Generate Estimate from System
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#6b5a4f]">
              Pick a system, confirm the measured sqft and lf, then generate grouped estimate items.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] flex-1 text-[12px] font-medium text-[#5d6f8a]">
              Catalog system
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
            <div className="w-full">
              <div className="mb-2 inline-flex overflow-hidden rounded-[8px] border border-[#d7deea] bg-white text-[13px] font-medium">
                <button
                  type="button"
                  onClick={() => onSystemMeasurementChange("inputMode", "dimensions")}
                  className={systemInputMode === "dimensions" ? "bg-[#23395d] px-3 py-2 text-white" : "px-3 py-2 text-[#5d6f8a]"}
                >
                  Length x Width
                </button>
                <button
                  type="button"
                  onClick={() => onSystemMeasurementChange("inputMode", "direct")}
                  className={systemInputMode === "direct" ? "bg-[#23395d] px-3 py-2 text-white" : "px-3 py-2 text-[#5d6f8a]"}
                >
                  Direct Area + LF
                </button>
              </div>
              {systemInputMode === "dimensions" ? (
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Length
                    <input
                      value={systemLength}
                      onChange={(event) => onSystemMeasurementChange("length", event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Width
                    <input
                      value={systemWidth}
                      onChange={(event) => onSystemMeasurementChange("width", event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Area (sqft)
                    <input
                      value={systemSquareFootage}
                      readOnly
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-[#f5f7fb] px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Perimeter (lf)
                    <input
                      value={systemLinearFootage}
                      readOnly
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-[#f5f7fb] px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Direct Area (sqft)
                    <input
                      value={systemSquareFootage}
                      onChange={(event) => onSystemMeasurementChange("area", event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Direct Linear Footage (lf)
                    <input
                      value={systemLinearFootage}
                      onChange={(event) => onSystemMeasurementChange("linearFootage", event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Count (ea)
                    <input
                      value={systemCount}
                      onChange={(event) => onSystemMeasurementChange("count", event.target.value)}
                      className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d7deea] bg-white px-3 text-[14px] text-[#334a70] outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onPreviewSystem}
              disabled={!selectedSystemId || getNumericValue(systemSquareFootage) <= 0}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#d8be9f] bg-white px-4 text-[14px] font-medium text-[#5f3b20] disabled:cursor-not-allowed disabled:text-[#b7a594]"
            >
              <Search className="h-4 w-4" />
              <span>{isPreviewPending ? "Previewing..." : "Preview system"}</span>
            </button>
            <button
              type="button"
              onClick={onExpandSystem}
              disabled={!systemPreview || isPreviewPending}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef7d32] px-5 text-[14px] font-semibold text-white shadow-[0_14px_30px_-20px_rgba(239,125,50,0.9)] disabled:cursor-not-allowed disabled:bg-[#e6b894]"
            >
              <Plus className="h-4 w-4" />
              <span>Generate items</span>
            </button>
          </div>
          {systemPreviewMessage ? (
            <div className="mt-3 rounded-[8px] border border-[#d7deea] bg-white px-3 py-2 text-[13px] text-[#48617f]">
              {systemPreviewMessage}
            </div>
          ) : null}
          {systemPreview ? (
            <div className="mt-4 rounded-[10px] border border-[#d7deea] bg-white">
              <div className="grid gap-3 border-b border-[#e6e9ef] px-3 py-3 text-[12px] text-[#607492] sm:grid-cols-4">
                <div>
                  <span className="block font-semibold uppercase tracking-[0.08em]">
                    Catalog Items
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
                      <th className="px-3 py-2 text-left">Catalog Item</th>
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
        Estimate items are locked commercial snapshots from catalog entries or server-expanded
        systems. Only quantity, grouping, and assignment remain editable here, and downstream
        billing does not read live estimate editing rows.
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
                      <th className="w-[120px] px-2 py-3 text-right">Snapshot Cost</th>
                      {showMarkup ? (
                        <th className="w-[96px] px-2 py-3 text-right">Snapshot MU%</th>
                      ) : null}
                      <th className="w-[96px] px-2 py-3 text-right">Hidden%</th>
                      <th className="w-[136px] px-2 py-3 text-right">
                        {showMarkup ? "Locked Sell Price" : "Locked Price"}
                      </th>
                      <th className="w-[120px] px-2 py-3 text-right">Total</th>
                      <th className="w-[72px] px-2 py-3 text-center">Tax</th>
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
                <button
                  type="button"
                  onClick={() => onRemoveLineItem(lineItem.rowKey)}
                  className="text-rose-700"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
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
                            <div className="min-h-8 px-0 text-[15px] font-medium text-[#334a70]">
                              {lineItem.name}
                            </div>
                            <div className="min-h-7 px-0 text-[12px] text-[#8694ab]">
                              {lineItem.description || "Estimate item snapshot from catalog"}
                            </div>
                            <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
                              <Lock className="h-3 w-3" />
                              <span>Locked Estimate Snapshot</span>
                            </div>
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
                            className="h-9 w-full rounded-[6px] border border-[#d7deea] bg-white px-2 text-right text-[15px] text-[#334a70] outline-none"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2 text-[15px] font-semibold text-[#334a70]">
                            {formatUnitLabel(lineItem.unit)}
                            <div className="mt-1 text-[11px] font-normal uppercase tracking-[0.08em] text-[#8c99ad]">
                              Unit
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2 text-right text-[15px] text-[#334a70]">
                            {lineItem.baseUnitCost}
                          </div>
                        </td>
                        {showMarkup ? (
                          <td className="px-2 py-3">
                            <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2 text-right text-[15px] text-[#334a70]">
                              {lineItem.markupPercent}%
                            </div>
                          </td>
                        ) : null}
                        <td className="px-2 py-3 text-right">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2 text-[15px] text-[#8694ab]">
                            {lineItem.hiddenMarkupPercent}%
                            <div className="mt-1 text-[11px] text-[#a2aec0]">
                              +${getNumericValue(lineItem.hiddenMarkupAmount).toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2">
                            <div className="text-[15px] text-[#334a70]">
                              <input
                                value={lineItem.unitPrice}
                                onChange={(event) =>
                                  onLineItemChange(lineItem.rowKey, "unitPrice", event.target.value)
                                }
                                className="h-8 w-full rounded-[6px] border border-[#d7deea] bg-white px-2 text-right text-[15px] text-[#334a70] outline-none"
                              />
                            </div>
                            <div className="mt-1 text-[12px] text-[#8694ab]">
                              Catalog price ${getCatalogPriceBasis(lineItem).toFixed(2)}
                            </div>
                            {isUnitPriceOverridden(lineItem) ? (
                              <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-900">
                                Price override
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right text-[15px] font-semibold text-[#334a70]">
                          {lineItem.lineTotal}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <label className="inline-flex cursor-pointer flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
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
                              className="h-4 w-4 rounded border-[#cbd4e1] text-[#d8731f] focus:ring-[#d8731f]"
                            />
                            <span>{lineItem.taxCode === "taxable" ? "Taxable" : "Exempt"}</span>
                          </label>
                          {customerTaxExempt ? (
                            <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-[#8c99ad]">
                              Customer exempt
                            </div>
                          ) : null}
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
                              className="h-9 w-full rounded-[6px] border border-[#d7deea] bg-white px-2 text-[14px] text-[#6f8098] outline-none placeholder:text-[#a9b5c8]"
                            />
                          </div>
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
