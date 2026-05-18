"use client";

import Link from "next/link";
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
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
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
import type { EstimateSourceAssessmentContext } from "@/lib/estimates/source-assessment";

export type EstimateItemsDraft = {
  id: string | null;
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
  selectedSystemId: string;
  systemInputMode: "dimensions" | "direct";
  systemLength: string;
  systemWidth: string;
  systemSquareFootage: string;
  systemLinearFootage: string;
  systemCount: string;
  systemPreview: ExpandedSystemPreview | null;
  systemPreviewMessage?: string | null;
  systemSourceLabel?: string | null;
  isPreviewPending?: boolean;
  sourceAssessment?: EstimateSourceAssessmentContext | null;
  onSelectedSystemIdChange: (value: string) => void;
  onSystemMeasurementChange: (field: string, value: string) => void;
  onUseSourceMeasurement: (groupKey: string) => void;
  onQuickAddCatalogItem: (
    catalogItemId: string,
    targetGroupId?: string | null
  ) => void;
  onAddPreviewCatalogItem: (
    catalogItemId: string,
    targetGroupId?: string | null
  ) => void;
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
    description: string | null;
    itemType: Exclude<CatalogItemType, "system">;
    unit: string;
    category: string | null;
    defaultUnitCost: string;
    defaultUnitPrice: string;
    taxable: boolean;
  }) => Promise<boolean>;
  onEditCatalogItemFromEstimate: (input: {
    estimateLineItemId: string;
    catalogItemId: string;
    name: string;
    description: string | null;
    unit: string;
    defaultUnitPrice: string;
    taxable: boolean;
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

function resolveSourceLabel(lineItem: EstimateItemsDraft) {
  return lineItem.sourceType === "system_component"
    ? "System-generated"
    : "Catalog-backed";
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

  if (
    lower === "sqft" ||
    lower === "sf" ||
    lower === "square foot" ||
    lower === "square feet"
  ) {
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
  const unitPriceBeforeHiddenMarkup = getNumericValue(
    lineItem.unitPriceBeforeHiddenMarkup
  );
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

const catalogDiscoveryFilters = [
  {
    id: "all",
    label: "All",
    tokens: []
  },
  {
    id: "epoxy",
    label: "Epoxy",
    tokens: ["epoxy", "resinous", "basecoat", "topcoat", "urethane"]
  },
  {
    id: "flake",
    label: "Flake",
    tokens: ["flake", "chip", "decorative flake"]
  },
  {
    id: "metallic",
    label: "Metallic",
    tokens: ["metallic"]
  },
  {
    id: "quartz",
    label: "Quartz",
    tokens: ["quartz"]
  },
  {
    id: "polish",
    label: "Polish",
    tokens: ["polish", "polishing", "concrete polishing"]
  },
  {
    id: "grind-seal",
    label: "Grind & seal",
    tokens: ["grind", "seal", "grind and seal", "grind-and-seal"]
  },
  {
    id: "prep",
    label: "Prep",
    tokens: ["prep", "grind", "crack", "moisture", "mitigation", "repair"]
  },
  {
    id: "addons",
    label: "Add-ons",
    tokens: ["addon", "add-on", "cove", "joint", "mobilization", "setup"]
  }
] as const;

function getCatalogDiscoveryText(item: CatalogItem) {
  return [
    item.name,
    item.description,
    item.category,
    item.sku,
    item.costCode,
    item.itemType
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
}

function matchesCatalogDiscoveryFilter(item: CatalogItem, filterId: string) {
  const filter = catalogDiscoveryFilters.find((option) => option.id === filterId);

  if (!filter || filter.tokens.length === 0) {
    return true;
  }

  const discoveryText = getCatalogDiscoveryText(item);

  return filter.tokens.some((token) => discoveryText.includes(token));
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
  selectedSystemId,
  systemInputMode,
  systemLength,
  systemWidth,
  systemSquareFootage,
  systemLinearFootage,
  systemCount,
  systemPreview,
  systemPreviewMessage,
  systemSourceLabel,
  isPreviewPending = false,
  sourceAssessment = null,
  onSelectedSystemIdChange,
  onSystemMeasurementChange,
  onUseSourceMeasurement,
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
  onEditCatalogItemFromEstimate,
  inventoryCreateError,
  catalogPreviewAddMessage,
  isCatalogPreviewAddPending = false
}: ItemsSectionProps) {
  const catalogSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [showAddItemTools, setShowAddItemTools] = useState(false);
  const [selectedAddItemGroupId, setSelectedAddItemGroupId] = useState<
    string | null
  >(null);
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [showImportTools, setShowImportTools] = useState(false);
  const [quickItemName, setQuickItemName] = useState("");
  const [quickItemDescription, setQuickItemDescription] = useState("");
  const [quickItemType, setQuickItemType] =
    useState<Exclude<CatalogItemType, "system">>("material");
  const [quickItemUnit, setQuickItemUnit] = useState("each");
  const [quickItemCategory, setQuickItemCategory] = useState("");
  const [quickItemCost, setQuickItemCost] = useState("0.00");
  const [quickItemPrice, setQuickItemPrice] = useState("");
  const [quickItemTaxable, setQuickItemTaxable] = useState(true);
  const [editingLineItem, setEditingLineItem] =
    useState<EstimateItemsDraft | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editItemUnit, setEditItemUnit] = useState("each");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemTaxable, setEditItemTaxable] = useState(true);
  const [catalogPreviewSearch, setCatalogPreviewSearch] = useState("");
  const [catalogPreviewFlooringFilter, setCatalogPreviewFlooringFilter] =
    useState("all");
  const [catalogPreviewType, setCatalogPreviewType] = useState("all");
  const [catalogPreviewCategory, setCatalogPreviewCategory] = useState("all");
  const [selectedCatalogPreviewId, setSelectedCatalogPreviewId] = useState("");
  const visibleGroups = getVisibleRowGroups(
    lineItems,
    itemGroups,
    showOnlyZeroItems
  );
  const lineItemCountByGroupId = useMemo(() => {
    const counts = new Map<string | null, number>();

    for (const lineItem of lineItems) {
      const key = lineItem.groupId ?? null;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts;
  }, [lineItems]);
  const visibleItemCount = visibleGroups.reduce(
    (sum, group) => sum + group.rows.length,
    0
  );
  const normalizedItemSearch = itemSearch.trim().toLowerCase();
  const hasItemSearch = normalizedItemSearch.length > 0;
  const filteredPickerItems = visibleCatalogItems.filter((item) =>
    item.name.toLowerCase().includes(normalizedItemSearch)
  );
  const directCatalogItems = filteredPickerItems.filter(
    (item) => item.itemType !== "system"
  );
  const systemCatalogItems = filteredPickerItems.filter(
    (item) => item.itemType === "system"
  );
  const quickAddItems = directCatalogItems.slice(0, 6);
  const firstQuickAddItem = quickAddItems[0] ?? directCatalogItems[0] ?? null;
  const readOnlyCatalogItems =
    catalogItemsForReview.length > 0
      ? catalogItemsForReview
      : visibleCatalogItems;
  const catalogPreviewTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(readOnlyCatalogItems.map((item) => item.itemType))
      ).sort(),
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
        (item.costCode ?? "").toLowerCase().includes(normalizedSearch) ||
        (item.description ?? "").toLowerCase().includes(normalizedSearch);
      const matchesFlooringFilter = matchesCatalogDiscoveryFilter(
        item,
        catalogPreviewFlooringFilter
      );
      const matchesType =
        catalogPreviewType === "all" || item.itemType === catalogPreviewType;
      const matchesCategory =
        catalogPreviewCategory === "all" ||
        item.category?.trim().toLowerCase() ===
          catalogPreviewCategory.toLowerCase();

      return (
        matchesSearch &&
        matchesFlooringFilter &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    catalogPreviewCategory,
    catalogPreviewFlooringFilter,
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
    quickItemPrice.trim().length > 0;
  const normalizedQuickItemName = quickItemName.trim().toLowerCase();
  const quickCreateDuplicateItem =
    normalizedQuickItemName.length > 0
      ? (catalogItemsForReview.find(
          (item) => item.name.trim().toLowerCase() === normalizedQuickItemName
        ) ?? null)
      : null;
  const canSubmitCatalogEdit =
    Boolean(editingLineItem?.id && editingLineItem.catalogItemId) &&
    editItemName.trim().length > 0 &&
    editItemUnit.trim().length > 0 &&
    editItemPrice.trim().length > 0 &&
    estimateStatus !== "approved";
  const normalizedEditItemName = editItemName.trim().toLowerCase();
  const editDuplicateItem =
    normalizedEditItemName.length > 0
      ? (catalogItemsForReview.find(
          (item) =>
            item.id !== editingLineItem?.catalogItemId &&
            item.name.trim().toLowerCase() === normalizedEditItemName
        ) ?? null)
      : null;
  const selectedAddItemGroup =
    selectedAddItemGroupId == null
      ? null
      : (itemGroups.find((group) => group.id === selectedAddItemGroupId) ??
        null);

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

      <details
        open={showAddItemTools}
        onToggle={(event) => setShowAddItemTools(event.currentTarget.open)}
        className="border-b border-[#e6e9ef] bg-[#f8f8f8]"
        data-testid="estimate-add-item-tools"
      >
        <summary
          onClick={() => setSelectedAddItemGroupId(null)}
          className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] font-semibold text-[#2a2a2a] marker:hidden"
          data-testid="estimate-add-item-tools-summary"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Package className="h-4 w-4 text-[#d8731f]" />
            <span>Build proposal section</span>
            <span className="hidden text-[12px] font-medium text-[#666666] sm:inline">
              {selectedAddItemGroup
                ? `Adding items into ${selectedAddItemGroup.label}`
                : "Catalog, system, custom, or previous estimate import"}
            </span>
          </span>
          <span className="rounded-full border border-[#d6d6d6] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
            {showAddItemTools ? "Hide tools" : "Show tools"}
          </span>
        </summary>

        <div className="grid gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <div className="order-3 rounded-[12px] border border-[#dfe5ef] bg-white p-4 xl:col-span-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
                  Catalog-backed items
                </div>
                <p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#6b7c96]">
                  Start from reusable catalog items, then add active non-system
                  items to this estimate as proposal snapshots. Internal cost
                  details stay here for contractor review.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-[#f0c7a5] bg-[#fff7ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a4581a]">
                Active direct items can be added
              </span>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {catalogDiscoveryFilters.map((filter) => {
                    const isActive = catalogPreviewFlooringFilter === filter.id;

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setCatalogPreviewFlooringFilter(filter.id)}
                        className={[
                          "inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-semibold transition",
                          isActive
                            ? "border-[#d8731f] bg-[#fff7ef] text-[#a4581a]"
                            : "border-[#d6d6d6] bg-white text-[#5f5f5f] hover:border-[#d8731f] hover:text-[#a4581a]"
                        ].join(" ")}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px]">
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Search catalog
                    <div className="mt-1.5 flex h-10 items-center rounded-[8px] border border-[#d6d6d6] bg-white px-3">
                      <Search className="h-4 w-4 text-[#7b8aa3]" />
                      <input
                        value={catalogPreviewSearch}
                        onChange={(event) =>
                          setCatalogPreviewSearch(event.target.value)
                        }
                        placeholder="Name, system, SKU, code, or description"
                        className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#2a2a2a] outline-none"
                        data-testid="estimate-catalog-preview-search"
                      />
                    </div>
                  </label>
                  <label className="text-[12px] font-medium text-[#5d6f8a]">
                    Type
                    <select
                      value={catalogPreviewType}
                      onChange={(event) =>
                        setCatalogPreviewType(event.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
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
                      onChange={(event) =>
                        setCatalogPreviewCategory(event.target.value)
                      }
                      className="mt-1.5 h-10 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
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
                      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(120px,0.55fr)_88px_120px_82px_92px] bg-[#f8f8f8] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
                        <span>Name</span>
                        <span>Type / Category</span>
                        <span>Unit</span>
                        <span className="text-right">Default Price</span>
                        <span className="text-center">Taxable</span>
                        <span className="text-right">Status</span>
                      </div>
                      <div className="max-h-[300px] overflow-auto">
                        {filteredCatalogPreviewItems.map((item) => {
                          const isSelected =
                            selectedCatalogPreviewItem?.id === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setSelectedCatalogPreviewId(item.id)
                              }
                              className={[
                                "grid w-full grid-cols-[minmax(0,1.35fr)_minmax(120px,0.55fr)_88px_120px_82px_92px] items-center gap-0 border-t border-[#e5e5e5] px-3 py-3 text-left text-[13px] transition",
                                isSelected
                                  ? "bg-[#fff7ef]"
                                  : "bg-white hover:bg-[#f8f8f8]"
                              ].join(" ")}
                              data-testid="estimate-catalog-preview-row"
                              data-catalog-item-name={item.name}
                              data-catalog-item-status={item.status}
                              data-catalog-item-type={item.itemType}
                            >
                              <span className="min-w-0">
                                <span className="block truncate font-semibold text-[#171717]">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block truncate text-[11px] text-[#8a98ad]">
                                  {item.sku ||
                                    item.costCode ||
                                    item.description ||
                                    "Reusable cost item"}
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
                              <span className="text-[#2a2a2a]">
                                {formatUnitLabel(item.unit)}
                              </span>
                              <span className="text-right font-semibold text-[#171717]">
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
                                  {item.status === "active"
                                    ? "Active"
                                    : "Archived"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                        {filteredCatalogPreviewItems.length === 0 ? (
                          <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] px-4 py-8 text-center text-[14px] leading-6 text-[#666666]">
                            No catalog items match this search yet. Catalog
                            items are reusable cost items for estimates,
                            invoices, and materials planning.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="rounded-[10px] border border-[#dfe5ef] bg-[#f8f8f8] p-4">
                {selectedCatalogPreviewItem ? (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666666]">
                          Preview
                        </p>
                        <h3 className="mt-1 break-words text-[17px] font-semibold leading-6 text-[#171717]">
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
                        {selectedCatalogPreviewItem.status === "active"
                          ? "Active"
                          : "Archived"}
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
                        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
                          {formatCatalogTypeLabel(
                            selectedCatalogPreviewItem.itemType
                          )}
                        </dd>
                      </div>
                      <div className="rounded-[8px] bg-white p-3">
                        <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                          Category
                        </dt>
                        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
                          {getCatalogCategoryLabel(selectedCatalogPreviewItem)}
                        </dd>
                      </div>
                      <div className="rounded-[8px] bg-white p-3">
                        <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                          Unit
                        </dt>
                        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
                          {formatUnitLabel(selectedCatalogPreviewItem.unit)}
                        </dd>
                      </div>
                      <div className="rounded-[8px] bg-white p-3">
                        <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                          Default Price
                        </dt>
                        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
                          {formatCatalogCurrency(
                            selectedCatalogPreviewItem.defaultUnitPrice
                          )}
                        </dd>
                      </div>
                      <div className="rounded-[8px] bg-white p-3">
                        <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                          Taxable
                        </dt>
                        <dd className="mt-1 text-[14px] font-semibold text-[#171717]">
                          {selectedCatalogPreviewItem.taxable ? "Yes" : "No"}
                        </dd>
                      </div>
                      <div className="rounded-[8px] bg-white p-3">
                        <dt className="font-semibold uppercase tracking-[0.08em] text-[#8a98ad]">
                          Code
                        </dt>
                        <dd className="mt-1 truncate text-[14px] font-semibold text-[#171717]">
                          {selectedCatalogPreviewItem.sku ||
                            selectedCatalogPreviewItem.costCode ||
                            "Not set"}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      disabled={
                        !canAddSelectedCatalogPreviewItem ||
                        isCatalogPreviewAddPending
                      }
                      onClick={() => {
                        if (
                          !selectedCatalogPreviewItem ||
                          !canAddSelectedCatalogPreviewItem
                        ) {
                          return;
                        }

                        onAddPreviewCatalogItem(
                          selectedCatalogPreviewItem.id,
                          selectedAddItemGroupId
                        );
                      }}
                      className={[
                        "mt-4 inline-flex h-10 w-full items-center justify-center rounded-[8px] border px-4 text-[13px] font-semibold transition",
                        canAddSelectedCatalogPreviewItem &&
                        !isCatalogPreviewAddPending
                          ? "border-[#d8731f] bg-[#d8731f] text-white hover:bg-[#bf6519]"
                          : "border-[#d6d6d6] bg-white text-[#8a98ad]"
                      ].join(" ")}
                      title={selectedCatalogPreviewAddTitle}
                      data-testid="estimate-catalog-preview-add"
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
                  <div className="flex min-h-[260px] items-center justify-center rounded-[8px] border border-dashed border-[#d6d6d6] bg-white px-4 text-center text-[13px] leading-6 text-[#666666]">
                    Select a catalog item to preview reusable cost, unit,
                    taxability, and status details before adding an active
                    direct item to this estimate.
                  </div>
                )}
              </aside>
            </div>
          </div>

          <div className="order-2 rounded-[12px] border border-[#dfe5ef] bg-white p-4 xl:order-2">
            <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
              Other item paths
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowCreateItemForm((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d6d6d6] bg-white px-4 text-[14px] font-medium text-[#5f5f5f]"
              >
                <Plus className="h-4 w-4" />
                <span>Create new item</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateItemForm(false);
                  catalogSearchInputRef.current?.focus();
                }}
                className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d6d6d6] bg-white px-4 text-[14px] font-medium text-[#2a2a2a]"
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
                className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#d6d6d6] bg-white px-4 text-[14px] font-medium text-[#5f5f5f]"
              >
                <FileDown className="h-4 w-4" />
                <span>Import</span>
              </button>
            </div>
            <details
              open={showImportTools}
              onToggle={(event) => setShowImportTools(event.currentTarget.open)}
              className="mb-4 rounded-[10px] border border-[#d6d6d6] bg-[#f8f8f8] px-3 py-3"
            >
              <summary className="cursor-pointer text-[13px] font-medium text-[#48617f]">
                Import from another estimate
              </summary>
              <div className="mt-3">
                <EstimateImportChooser
                  estimateStatus={estimateStatus}
                  importSourceEstimates={importSourceEstimates}
                  onImportLineItemsFromEstimate={onImportLineItemsFromEstimate}
                  onImportReusableContentFromEstimate={
                    onImportReusableContentFromEstimate
                  }
                />
              </div>
            </details>
            <div className="mb-3">
              <label className="text-[12px] font-medium text-[#5d6f8a]">
                Add from catalog / cost database
                <div className="mt-1.5 flex h-11 items-center rounded-[8px] border border-[#d6d6d6] bg-white px-3">
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
                      onQuickAddCatalogItem(
                        firstQuickAddItem.id,
                        selectedAddItemGroupId
                      );
                    }}
                    placeholder="Search reusable items and systems"
                    className="h-full w-full border-0 bg-transparent px-3 text-[14px] text-[#2a2a2a] outline-none"
                    data-testid="estimate-catalog-search"
                  />
                </div>
              </label>
            </div>
            {firstQuickAddItem ? (
              <div className="mb-3 text-[12px] text-[#6b7c96]">
                Press Enter to add{" "}
                <span className="font-medium text-[#2a2a2a]">
                  {firstQuickAddItem.name}
                </span>{" "}
                as an estimate item.
              </div>
            ) : null}
            {quickAddItems.length > 0 ? (
              <div className="mt-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666666]">
                  {hasItemSearch
                    ? "Catalog quick matches"
                    : "Suggested catalog items"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickAddItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onQuickAddCatalogItem(item.id, selectedAddItemGroupId)
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#d6d6d6] bg-white px-3 py-1.5 text-[13px] font-medium text-[#2a2a2a]"
                      data-testid="estimate-catalog-quick-add"
                      data-catalog-item-name={item.name}
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[8px] border border-dashed border-[#d6d6d6] bg-[#f8f8f8] px-3 py-3 text-[13px] leading-5 text-[#666666]">
                {hasItemSearch
                  ? "No active direct catalog items match this search. Try a different item name or create a new catalog item."
                  : "Start typing to search catalog items. Suggested active items will appear here from the current catalog order."}
              </div>
            )}
            {showCreateItemForm ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
                <div className="w-full max-w-xl rounded-[10px] border border-[#d6d6d6] bg-white shadow-[0_24px_80px_-38px_rgba(15,23,42,0.65)]">
                  <div className="flex items-start justify-between gap-4 border-b border-[#e6e9ef] px-5 py-4">
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#171717]">
                        Create Catalog Item
                      </h2>
                      <p className="mt-1 text-[13px] leading-5 text-[#6b7c96]">
                        Create the reusable catalog item first, then add it to
                        this estimate immediately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateItemForm(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d6d6d6] text-[#5d6f8a]"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Name
                      <input
                        value={quickItemName}
                        onChange={(event) =>
                          setQuickItemName(event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Type
                      <select
                        value={quickItemType}
                        onChange={(event) =>
                          setQuickItemType(
                            event.target.value as Exclude<
                              CatalogItemType,
                              "system"
                            >
                          )
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
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
                        onChange={(event) =>
                          setQuickItemUnit(event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Category
                      <input
                        value={quickItemCategory}
                        onChange={(event) =>
                          setQuickItemCategory(event.target.value)
                        }
                        placeholder="Epoxy, flake, prep, polish..."
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Cost
                      <input
                        value={quickItemCost}
                        onChange={(event) =>
                          setQuickItemCost(event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Price
                      <input
                        value={quickItemPrice}
                        onChange={(event) =>
                          setQuickItemPrice(event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="md:col-span-2 text-[12px] font-medium text-[#5d6f8a]">
                      Description
                      <textarea
                        value={quickItemDescription}
                        onChange={(event) =>
                          setQuickItemDescription(event.target.value)
                        }
                        className="mt-1.5 min-h-20 w-full rounded-[8px] border border-[#d6d6d6] px-3 py-2 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="inline-flex items-center gap-2 text-[13px] font-medium text-[#2a2a2a]">
                      <input
                        type="checkbox"
                        checked={quickItemTaxable}
                        onChange={(event) =>
                          setQuickItemTaxable(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-[#cbd4e1] text-[#d8731f] focus:ring-[#d8731f]"
                      />
                      Taxable
                    </label>
                  </div>
                  {quickCreateDuplicateItem ? (
                    <p className="mt-3 text-[13px] text-amber-800">
                      A catalog item named "{quickCreateDuplicateItem.name}"
                      already exists. You can still save with a different name
                      or add the existing item from catalog.
                    </p>
                  ) : null}
                  {inventoryCreateError ? (
                    <p className="px-5 text-[13px] text-rose-700">
                      {inventoryCreateError}
                    </p>
                  ) : null}
                  <div className="flex justify-end gap-2 border-t border-[#e6e9ef] px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateItemForm(false)}
                      className="rounded-[8px] border border-[#d6d6d6] px-4 py-2 text-[14px] font-medium text-[#2a2a2a]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          const didCreate = await onQuickCreateCatalogItem({
                            name: quickItemName,
                            description:
                              quickItemDescription.trim().length > 0
                                ? quickItemDescription
                                : null,
                            itemType: quickItemType,
                            unit: quickItemUnit,
                            category:
                              quickItemCategory.trim().length > 0
                                ? quickItemCategory
                                : null,
                            defaultUnitCost: quickItemCost,
                            defaultUnitPrice: quickItemPrice,
                            taxable: quickItemTaxable
                          });
                          if (didCreate) {
                            setQuickItemName("");
                            setQuickItemDescription("");
                            setQuickItemType("material");
                            setQuickItemUnit("each");
                            setQuickItemCategory("");
                            setQuickItemCost("0.00");
                            setQuickItemPrice("");
                            setQuickItemTaxable(true);
                            setShowCreateItemForm(false);
                          }
                        })();
                      }}
                      disabled={!canSubmitQuickCreate}
                      className="rounded-[8px] bg-[#ef7d32] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9fb7ea]"
                    >
                      Create item and add to estimate
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div
            id="system-estimate-builder"
            className="order-1 rounded-[12px] border border-[#dfe5ef] bg-white p-4 xl:order-1"
          >
            <div className="mb-2 inline-flex rounded-full border border-[#f0c7a5] bg-[#fff7ef] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a4581a]">
              System-generated items
            </div>
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold tracking-tight text-[#171717]">
                Generate items from system
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[#6b7c96]">
                Pick a reusable system, confirm measured quantities, then
                generate grouped proposal items for review.
              </p>
            </div>
            {sourceAssessment &&
            (sourceAssessment.measurementGroups.length > 0 ||
              sourceAssessment.requirementsSummary ||
              sourceAssessment.serviceType) ? (
              <div className="mb-4 rounded-[10px] border border-[#dfe5ef] bg-[#f8fbff] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#48617f]">
                        <FolderTree className="h-4 w-4" />
                        Source assessment
                      </span>
                      <Link
                        href={`/leads/${sourceAssessment.opportunityId}`}
                        className="text-[12px] font-semibold text-[#a4581a] underline-offset-2 hover:underline"
                      >
                        Open lead
                      </Link>
                    </div>
                    <p className="mt-1 text-[13px] leading-5 text-[#48617f]">
                      {sourceAssessment.serviceType
                        ? `${sourceAssessment.serviceType} context from ${sourceAssessment.opportunityTitle}.`
                        : `Assessment context from ${sourceAssessment.opportunityTitle}.`}
                    </p>
                    {sourceAssessment.requirementsSummary ? (
                      <p className="mt-2 max-h-10 overflow-hidden text-[12px] leading-5 text-[#6b7c96]">
                        {sourceAssessment.requirementsSummary}
                      </p>
                    ) : null}
                  </div>
                  {systemSourceLabel ? (
                    <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                      {systemSourceLabel}
                    </span>
                  ) : null}
                </div>
                {sourceAssessment.measurementGroups.length > 0 ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {sourceAssessment.measurementGroups.map((group) => (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => onUseSourceMeasurement(group.key)}
                        disabled={!group.squareFootage}
                        className={[
                          "rounded-[8px] border bg-white p-3 text-left transition",
                          group.squareFootage
                            ? "border-[#d6dfe8] hover:border-[#d8731f]"
                            : "border-[#e5e7eb] text-[#9aa5b5]"
                        ].join(" ")}
                        title={
                          group.squareFootage
                            ? "Use these source assessment values as editable system inputs."
                            : "This assessment group needs area before system generation can use it."
                        }
                      >
                        <span className="block truncate text-[13px] font-semibold text-[#171717]">
                          {group.areaLabel}
                        </span>
                        <span className="mt-2 grid grid-cols-3 gap-2 text-[12px] text-[#5d6f8a]">
                          <span>
                            <span className="block font-semibold text-[#2a2a2a]">
                              {group.squareFootage ?? "-"}
                            </span>
                            sqft
                          </span>
                          <span>
                            <span className="block font-semibold text-[#2a2a2a]">
                              {group.linearFootage ?? "0"}
                            </span>
                            lf
                          </span>
                          <span>
                            <span className="block font-semibold text-[#2a2a2a]">
                              {group.count ?? "1"}
                            </span>
                            ea
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-[220px] flex-1 text-[12px] font-medium text-[#5d6f8a]">
                Catalog system
                <select
                  value={selectedSystemId}
                  onChange={(event) =>
                    onSelectedSystemIdChange(event.target.value)
                  }
                  className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
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
                <div className="mb-2 inline-flex overflow-hidden rounded-[8px] border border-[#d6d6d6] bg-white text-[13px] font-medium">
                  <button
                    type="button"
                    onClick={() =>
                      onSystemMeasurementChange("inputMode", "dimensions")
                    }
                    className={
                      systemInputMode === "dimensions"
                        ? "bg-[#171717] px-3 py-2 text-white"
                        : "px-3 py-2 text-[#5d6f8a]"
                    }
                  >
                    Length x Width
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onSystemMeasurementChange("inputMode", "direct")
                    }
                    className={
                      systemInputMode === "direct"
                        ? "bg-[#171717] px-3 py-2 text-white"
                        : "px-3 py-2 text-[#5d6f8a]"
                    }
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
                        onChange={(event) =>
                          onSystemMeasurementChange(
                            "length",
                            event.target.value
                          )
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Width
                      <input
                        value={systemWidth}
                        onChange={(event) =>
                          onSystemMeasurementChange("width", event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Area (sqft)
                      <input
                        value={systemSquareFootage}
                        readOnly
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-[#f5f7fb] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Perimeter (lf)
                      <input
                        value={systemLinearFootage}
                        readOnly
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-[#f5f7fb] px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Direct Area (sqft)
                      <input
                        value={systemSquareFootage}
                        onChange={(event) =>
                          onSystemMeasurementChange("area", event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Direct Linear Footage (lf)
                      <input
                        value={systemLinearFootage}
                        onChange={(event) =>
                          onSystemMeasurementChange(
                            "linearFootage",
                            event.target.value
                          )
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                    <label className="text-[12px] font-medium text-[#5d6f8a]">
                      Count (ea)
                      <input
                        value={systemCount}
                        onChange={(event) =>
                          onSystemMeasurementChange("count", event.target.value)
                        }
                        className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] bg-white px-3 text-[14px] text-[#2a2a2a] outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onPreviewSystem}
                disabled={
                  estimateStatus === "approved" ||
                  !selectedSystemId ||
                  getNumericValue(systemSquareFootage) <= 0
                }
                className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-[#d8be9f] bg-white px-4 text-[14px] font-medium text-[#5f3b20] disabled:cursor-not-allowed disabled:text-[#b7a594]"
              >
                <Search className="h-4 w-4" />
                  <span>
                    {isPreviewPending ? "Previewing..." : "Preview system"}
                  </span>
                </button>
              <button
                type="button"
                onClick={onExpandSystem}
                disabled={estimateStatus === "approved" || !systemPreview || isPreviewPending}
                className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#ef7d32] px-5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#e6b894]"
              >
                <Plus className="h-4 w-4" />
                  <span>Generate items</span>
                </button>
            </div>
            {systemPreviewMessage ? (
              <div className="mt-3 rounded-[8px] border border-[#d6d6d6] bg-white px-3 py-2 text-[13px] text-[#48617f]">
                {systemPreviewMessage}
              </div>
            ) : null}
            {systemPreview ? (
              <div className="mt-4 rounded-[10px] border border-[#d6d6d6] bg-white">
                <div className="grid gap-3 border-b border-[#e6e9ef] px-3 py-3 text-[12px] text-[#5f5f5f] sm:grid-cols-4">
                  <div>
                    <span className="block font-semibold uppercase tracking-[0.08em]">
                    Generated items
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-[#171717]">
                      {systemPreview.rows.length}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase tracking-[0.08em]">
                      Cost
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-[#171717]">
                      ${systemPreview.totalCost}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase tracking-[0.08em]">
                      Price
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-[#171717]">
                      ${systemPreview.totalPrice}
                    </span>
                  </div>
                  <div>
                    <span className="block font-semibold uppercase tracking-[0.08em]">
                      Tax Mix
                    </span>
                    <span className="mt-1 block text-[13px] font-semibold text-[#171717]">
                      T ${systemPreview.taxablePrice} / E $
                      {systemPreview.exemptPrice}
                    </span>
                  </div>
                </div>
                <div className="max-h-[220px] overflow-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#e6e9ef] bg-[#f8f8f8] text-[11px] uppercase tracking-[0.08em] text-[#666666]">
                        <th className="px-3 py-2 text-left">Catalog Item</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Cost</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-center">Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemPreview.rows.map((row) => (
                        <tr
                          key={row.componentId}
                          className="border-b border-[#e5e5e5] text-[13px] text-[#2a2a2a]"
                        >
                          <td className="px-3 py-2">
                            <div className="font-medium">{row.name}</div>
                            <div className="text-[11px] text-[#8694ab]">
                              {row.unit}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.quantity}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ${row.lineCost}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ${row.linePrice}
                          </td>
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
      </details>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e9ef] px-4 py-3">
        <div className="space-y-1 text-[13px] text-[#666666]">
          <div className="font-semibold uppercase tracking-[0.08em] text-[#171717]">
            Proposal sections
          </div>
          <div>
            Tax:{" "}
            <span className="font-medium text-[#171717]">
              {taxBehaviorLabel}
            </span>{" "}
            | Rate:{" "}
            <span className="font-medium text-[#171717]">{taxRateLabel}</span>
            {customerTaxExempt ? (
              <span className="ml-2 rounded-full bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
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
                : "border-[#d6d6d6] text-[#697995]"
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
                : "border-[#d6d6d6] text-[#697995]"
            ].join(" ")}
          >
            <EyeOff className="h-4 w-4" />
            <span>Hide Markup</span>
          </button>
          <div className="inline-flex overflow-hidden rounded-[6px] bg-[#e5e5e5] font-medium">
            <button
              type="button"
              onClick={() => onToggleShowOnlyZeroItems(true)}
              className={
                showOnlyZeroItems
                  ? "bg-[#ef7d32] px-3 py-1.5 text-white"
                  : "px-3 py-1.5 text-[#777777]"
              }
            >
              $0 Only
            </button>
            <button
              type="button"
              onClick={() => onToggleShowOnlyZeroItems(false)}
              className={
                !showOnlyZeroItems
                  ? "bg-[#ef7d32] px-3 py-1.5 text-white"
                  : "px-3 py-1.5 text-[#777777]"
              }
            >
              All
            </button>
          </div>
          <button
            type="button"
            onClick={onAddGroup}
            className="inline-flex items-center gap-2 rounded-[6px] bg-[#ef7d32] px-4 py-2.5 text-[15px] font-semibold text-white"
            data-testid="estimate-add-group"
          >
            <FolderTree className="h-4 w-4" />
            <span>Add Group</span>
          </button>
        </div>
      </div>

      <div className="border-b border-[#e6e9ef] bg-white px-4 py-2.5 text-[12px] leading-5 text-[#666666]">
        Build customer-facing proposal sections first. Internal cost, markup,
        and snapshot controls stay available here for contractor review only.
      </div>

      <div className="min-h-[360px] bg-[#f8f9fc] p-3">
        <div className="space-y-3">
          {visibleGroups.map((group) => (
            <section
              key={group.id ?? "ungrouped"}
              className="overflow-hidden rounded-[10px] border border-[#d6d6d6] bg-white shadow-[0_10px_28px_-26px_rgba(15,15,15,0.65)]"
              data-testid="estimate-item-group"
              data-group-id={group.id ?? "ungrouped"}
              data-group-label={group.label}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e9ef] bg-[#f8f8f8] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <GripVertical className="h-4 w-4 text-[#8e9cb2]" />
                  {group.id ? (
                    <input
                      value={group.label}
                      onChange={(event) =>
                        onGroupLabelChange(
                          group.id as string,
                          event.target.value
                        )
                      }
                      className="h-8 min-w-[220px] rounded-[6px] border border-[#d6d6d6] bg-white px-3 text-[15px] font-semibold text-[#171717] outline-none focus:border-[#d8731f]"
                      data-testid="estimate-group-name-input"
                    />
                  ) : (
                    <span
                      className="text-[15px] font-semibold text-[#171717]"
                      data-testid="estimate-group-name"
                    >
                      {group.label}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
                    {group.rows.length} item{group.rows.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777777]">
                      Section total
                    </div>
                    <div className="text-[15px] font-semibold text-[#171717]">
                      {renderGroupSubtotal(group.rows)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddItemGroupId(group.id);
                      setShowAddItemTools(true);
                      window.setTimeout(
                        () => catalogSearchInputRef.current?.focus(),
                        0
                      );
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#d8731f] bg-white px-3 text-[13px] font-semibold text-[#a4581a]"
                    data-testid="estimate-group-add-item"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                  {group.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (estimateStatus === "approved") {
                          return;
                        }

                        const affectedItemCount =
                          lineItemCountByGroupId.get(group.id) ?? group.rows.length;
                        const warning =
                          affectedItemCount > 0
                            ? `Delete "${group.label}"? Its ${affectedItemCount} item${affectedItemCount === 1 ? "" : "s"} will move to Ungrouped Items.`
                            : `Delete "${group.label}"?`;

                        if (window.confirm(warning)) {
                          onDeleteGroup(group.id as string);
                        }
                      }}
                      disabled={estimateStatus === "approved"}
                      title={
                        estimateStatus === "approved"
                          ? "Approved estimates cannot have sections deleted."
                          : "Delete section"
                      }
                      className={[
                        "inline-flex h-9 items-center gap-2 rounded-[6px] border px-3 text-[13px]",
                        estimateStatus === "approved"
                          ? "cursor-not-allowed border-[#e5e7eb] text-[#a7b2c4]"
                          : "border-[#ebd3d3] text-[#8f4b4b]"
                      ].join(" ")}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete section</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#e6e9ef] bg-white text-[11px] uppercase tracking-[0.08em] text-[#666666]">
                      <th className="w-8 px-2 py-2 text-left"></th>
                      <th className="w-[64px] px-2 py-2 text-left">Type</th>
                      <th className="min-w-[280px] px-2 py-2 text-left">
                        Customer-facing item
                      </th>
                      <th className="w-[140px] px-2 py-2 text-left">Section</th>
                      <th className="w-[84px] px-2 py-2 text-right">Qty</th>
                      <th className="w-[88px] px-2 py-2 text-left">Unit</th>
                      <th className="w-[120px] px-2 py-2 text-right">
                        Internal cost
                      </th>
                      {showMarkup ? (
                        <th className="w-[96px] px-2 py-2 text-right">
                          Markup
                        </th>
                      ) : null}
                      <th className="w-[96px] px-2 py-2 text-right">
                        Hidden markup
                      </th>
                      <th className="w-[136px] px-2 py-2 text-right">
                        Unit price
                      </th>
                      <th className="w-[120px] px-2 py-2 text-right">
                        Line total
                      </th>
                      <th className="w-[72px] px-2 py-2 text-center">Tax</th>
                      <th className="w-[118px] px-2 py-2 text-left">
                        Follow-up
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((lineItem, index) => (
                      <tr
                        key={lineItem.rowKey}
                        className={[
                          "border-b border-[#e5e5e5] align-top text-[14px] text-[#2a2a2a]",
                          index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"
                        ].join(" ")}
                        data-testid="estimate-line-item-row"
                        data-line-item-name={lineItem.name}
                        data-group-id={group.id ?? "ungrouped"}
                        data-group-label={group.label}
                      >
                        <td className="px-2 py-2 text-[#a5b1c4]">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onMoveLineItem(lineItem.rowKey, -1)
                              }
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
                        <td className="px-2 py-2">
                          <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f7fb] text-[#5d6f8a]">
                            <Package className="h-4 w-4" />
                          </div>
                          <div className="mt-1 text-[11px] text-[#8694ab]">
                            {resolveTypeLabel(lineItem)}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!lineItem.id || !lineItem.catalogItemId) {
                                  return;
                                }

                                setEditingLineItem(lineItem);
                                setEditItemName(lineItem.name);
                                setEditItemDescription(lineItem.description);
                                setEditItemUnit(lineItem.unit);
                                setEditItemPrice(lineItem.unitPrice);
                                setEditItemTaxable(
                                  lineItem.taxCode === "taxable"
                                );
                              }}
                              disabled={!lineItem.id || !lineItem.catalogItemId}
                              className="inline-flex min-h-7 w-fit max-w-full items-center gap-1 px-0 text-left text-[14px] font-medium text-[#2a2a2a] underline-offset-4 enabled:hover:underline disabled:cursor-default"
                              title={
                                lineItem.id && lineItem.catalogItemId
                                  ? "Edit catalog item and this estimate snapshot"
                                  : "Catalog-backed estimate item required"
                              }
                            >
                              <span className="truncate">{lineItem.name}</span>
                              {lineItem.id && lineItem.catalogItemId ? (
                                <Pencil className="h-3.5 w-3.5 text-[#8a98ad]" />
                              ) : null}
                            </button>
                            <div className="min-h-7 px-0 text-[12px] text-[#8694ab]">
                              {lineItem.description ||
                                "Estimate item snapshot from catalog"}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <div className="inline-flex w-fit items-center gap-1 rounded-full bg-[#eef3fb] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
                                <Lock className="h-3 w-3" />
                                <span>Estimate snapshot</span>
                              </div>
                              <span className="inline-flex w-fit rounded-full bg-[#f8f8f8] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7b8aa3]">
                                {resolveSourceLabel(lineItem)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={lineItem.groupId ?? ""}
                            onChange={(event) =>
                              onLineItemChange(
                                lineItem.rowKey,
                                "groupId",
                                event.target.value
                              )
                            }
                            className="h-9 w-full rounded-[6px] border border-[#d6d6d6] bg-white px-2 text-[14px] text-[#2a2a2a] outline-none"
                          >
                            <option value="">Ungrouped Items</option>
                            {itemGroups.map((itemGroup) => (
                              <option key={itemGroup.id} value={itemGroup.id}>
                                {itemGroup.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            value={lineItem.quantity}
                            onChange={(event) =>
                              onLineItemChange(
                                lineItem.rowKey,
                                "quantity",
                                event.target.value
                              )
                            }
                            className="h-9 w-full rounded-[6px] border border-[#d6d6d6] bg-white px-2 text-right text-[15px] text-[#2a2a2a] outline-none"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2 text-[15px] font-semibold text-[#2a2a2a]">
                            {formatUnitLabel(lineItem.unit)}
                            <div className="mt-1 text-[11px] font-normal uppercase tracking-[0.08em] text-[#8c99ad]">
                              Unit
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="rounded-[8px] bg-[#f8f9fc] px-2 py-2 text-right text-[13px] text-[#6b7c96]">
                            {lineItem.baseUnitCost}
                          </div>
                        </td>
                        {showMarkup ? (
                          <td className="px-2 py-2">
                            <div className="rounded-[8px] bg-[#f8f9fc] px-2 py-2 text-right text-[13px] text-[#6b7c96]">
                              {lineItem.markupPercent}%
                            </div>
                          </td>
                        ) : null}
                        <td className="px-2 py-2 text-right">
                          <div className="rounded-[8px] bg-[#f8f9fc] px-2 py-2 text-[13px] text-[#8a98ad]">
                            {lineItem.hiddenMarkupPercent}%
                            <div className="mt-1 text-[11px] text-[#a2aec0]">
                              +$
                              {getNumericValue(
                                lineItem.hiddenMarkupAmount
                              ).toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="rounded-[8px] bg-[#f5f7fb] px-2 py-2">
                            <div className="text-[15px] text-[#2a2a2a]">
                              <input
                                value={lineItem.unitPrice}
                                onChange={(event) =>
                                  onLineItemChange(
                                    lineItem.rowKey,
                                    "unitPrice",
                                    event.target.value
                                  )
                                }
                                className="h-8 w-full rounded-[6px] border border-[#d6d6d6] bg-white px-2 text-right text-[15px] text-[#2a2a2a] outline-none"
                              />
                            </div>
                            <div className="mt-1 text-[12px] text-[#8694ab]">
                              Catalog basis $
                              {getCatalogPriceBasis(lineItem).toFixed(2)}
                            </div>
                            {isUnitPriceOverridden(lineItem) ? (
                              <div className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-900">
                                Price override
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right text-[14px] font-semibold text-[#2a2a2a]">
                          {lineItem.lineTotal}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <label className="inline-flex cursor-pointer flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f5f5f]">
                            <input
                              type="checkbox"
                              checked={lineItem.taxCode === "taxable"}
                              onChange={(event) =>
                                onLineItemChange(
                                  lineItem.rowKey,
                                  "taxCode",
                                  event.target.checked
                                    ? "taxable"
                                    : "non-taxable"
                                )
                              }
                              className="h-4 w-4 rounded border-[#cbd4e1] text-[#d8731f] focus:ring-[#d8731f]"
                            />
                            <span>
                              {lineItem.taxCode === "taxable"
                                ? "Taxable"
                                : "Exempt"}
                            </span>
                          </label>
                          {customerTaxExempt ? (
                            <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-[#8c99ad]">
                              Customer exempt
                            </div>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 text-[#8694ab]">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8f8f8] text-[#7485a0]">
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
                              className="h-9 w-full rounded-[6px] border border-[#d6d6d6] bg-white px-2 text-[14px] text-[#666666] outline-none placeholder:text-[#a9b5c8]"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {group.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={showMarkup ? 13 : 12}
                          className="px-4 py-7 text-center text-[14px] text-[#777777]"
                        >
                          Add catalog items or generate a system to build this
                          proposal section.
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
      {editingLineItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-xl rounded-[10px] border border-[#d6d6d6] bg-white shadow-[0_24px_80px_-38px_rgba(15,23,42,0.65)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e6e9ef] px-5 py-4">
              <div>
                <h2 className="text-[18px] font-semibold text-[#171717]">
                  Edit Catalog Item
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-[#6b7c96]">
                  Updates the reusable catalog item and this estimate line
                  snapshot only.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLineItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d6d6d6] text-[#5d6f8a]"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
              <label className="text-[12px] font-medium text-[#5d6f8a]">
                Name
                <input
                  value={editItemName}
                  onChange={(event) => setEditItemName(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                />
              </label>
              <label className="text-[12px] font-medium text-[#5d6f8a]">
                Unit
                <input
                  value={editItemUnit}
                  onChange={(event) => setEditItemUnit(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                />
              </label>
              <label className="text-[12px] font-medium text-[#5d6f8a]">
                Price
                <input
                  value={editItemPrice}
                  onChange={(event) => setEditItemPrice(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-[8px] border border-[#d6d6d6] px-3 text-[14px] text-[#2a2a2a] outline-none"
                />
              </label>
              <label className="mt-7 inline-flex items-center gap-2 text-[13px] font-medium text-[#2a2a2a]">
                <input
                  type="checkbox"
                  checked={editItemTaxable}
                  onChange={(event) => setEditItemTaxable(event.target.checked)}
                  className="h-4 w-4 rounded border-[#cbd4e1] text-[#d8731f] focus:ring-[#d8731f]"
                />
                Taxable
              </label>
              <label className="md:col-span-2 text-[12px] font-medium text-[#5d6f8a]">
                Description
                <textarea
                  value={editItemDescription}
                  onChange={(event) =>
                    setEditItemDescription(event.target.value)
                  }
                  className="mt-1.5 min-h-24 w-full rounded-[8px] border border-[#d6d6d6] px-3 py-2 text-[14px] text-[#2a2a2a] outline-none"
                />
              </label>
              {editDuplicateItem ? (
                <p className="md:col-span-2 text-[13px] text-amber-800">
                  A catalog item named "{editDuplicateItem.name}" already
                  exists. Rename this item before saving to avoid duplicate
                  catalog names.
                </p>
              ) : null}
              {estimateStatus === "approved" ? (
                <p className="md:col-span-2 text-[13px] text-rose-700">
                  Approved estimates cannot edit catalog snapshots.
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e6e9ef] px-5 py-4">
              <button
                type="button"
                onClick={() => setEditingLineItem(null)}
                className="rounded-[8px] border border-[#d6d6d6] px-4 py-2 text-[14px] font-medium text-[#2a2a2a]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmitCatalogEdit}
                onClick={() => {
                  void (async () => {
                    if (!editingLineItem.id || !editingLineItem.catalogItemId) {
                      return;
                    }

                    const didEdit = await onEditCatalogItemFromEstimate({
                      estimateLineItemId: editingLineItem.id,
                      catalogItemId: editingLineItem.catalogItemId,
                      name: editItemName,
                      description:
                        editItemDescription.trim().length > 0
                          ? editItemDescription
                          : null,
                      unit: editItemUnit,
                      defaultUnitPrice: editItemPrice,
                      taxable: editItemTaxable
                    });

                    if (didEdit) {
                      setEditingLineItem(null);
                    }
                  })();
                }}
                className="rounded-[8px] bg-[#ef7d32] px-4 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9fb7ea]"
              >
                Save catalog item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
