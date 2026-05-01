"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Boxes,
  Briefcase,
  ChevronDown,
  ClipboardList,
  HardHat,
  FolderKanban,
  Layers3,
  Package,
  Search,
  Wrench
} from "lucide-react";
import type {
  CatalogItem,
  CatalogItemFile,
  EstimateContentBlock,
  InventoryItem,
  InventoryTransaction,
  TaxCode,
  Vendor
} from "@floorconnector/types";

import { InventoryItemDrawer } from "@/components/catalog-manager/inventory-item-drawer";
import {
  applyRowsPerView,
  formatRowsPerViewVisibleCount,
  useRowsPerViewPreference
} from "@/components/rows-per-view-control";
import { calculateSharedUnitPricing, formatMoneyValue } from "@/lib/catalogs/pricing";

type DrawerTab = "details" | "notes" | "inventory" | "files";

type InventoryManagerProps = {
  returnTo: string;
  inventoryEnabled: boolean;
  items: CatalogItem[];
  taxCodes: TaxCode[];
  inventoryItems: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  catalogItemFilesById: Record<string, CatalogItemFile[]>;
  vendors: Vendor[];
  contentBlocks: EstimateContentBlock[];
  saveItemAction: (formData: FormData) => void | Promise<void>;
  saveSystemComponentsAction: (formData: FormData) => void | Promise<void>;
  saveContentBlockAction: (formData: FormData) => void | Promise<void>;
  deleteCatalogItemFileAction: (formData: FormData) => void | Promise<void>;
  initialSidebarView?: SidebarView;
  lockedSidebarView?: SidebarView | null;
  inventoryView?: "all" | "tracked";
  defaultDrawerTab?: DrawerTab;
};

type SidebarView =
  | "all"
  | "materials"
  | "labor"
  | "equipment"
  | "subcontractor"
  | "other"
  | "systems"
  | "groups";
type SortKey = "name" | "updatedAt" | "itemType";

type DrawerState = {
  item: CatalogItem | null;
  itemType: CatalogItem["itemType"];
};

const sidebarViews: Array<{
  id: SidebarView;
  label: string;
  icon: typeof Boxes;
}> = [
  { id: "all", label: "All items", icon: Boxes },
  { id: "materials", label: "Materials", icon: Package },
  { id: "labor", label: "Labor", icon: Briefcase },
  { id: "equipment", label: "Equipment", icon: Wrench },
  { id: "subcontractor", label: "Subcontractor", icon: HardHat },
  { id: "other", label: "Other", icon: ClipboardList },
  { id: "systems", label: "Systems and packages", icon: Layers3 },
  { id: "groups", label: "Item groups", icon: FolderKanban }
];

const COST_ITEMS_ROWS_PER_VIEW_STORAGE_KEY = "fc.grid.rows.cost-items";

function resolveItemTypeIcon(itemType: CatalogItem["itemType"]) {
  switch (itemType) {
    case "material":
      return Package;
    case "labor":
    case "service":
      return Briefcase;
    case "equipment":
    case "subcontractor":
      return Wrench;
    case "system":
      return Layers3;
    default:
      return ClipboardList;
  }
}

function resolveSidebarViewItemTypes(view: SidebarView) {
  switch (view) {
    case "materials":
      return ["material"] as const;
    case "labor":
      return ["labor", "service"] as const;
    case "equipment":
      return ["equipment"] as const;
    case "subcontractor":
      return ["subcontractor"] as const;
    case "other":
      return ["other"] as const;
    case "systems":
      return ["system"] as const;
    default:
      return null;
  }
}

function formatStatusLabel(status: CatalogItem["status"]) {
  return status === "active" ? "Active" : "Archived";
}

function formatTypeLabel(itemType: CatalogItem["itemType"]) {
  if (itemType === "subcontractor") {
    return "Subcontractor";
  }

  return itemType.charAt(0).toUpperCase() + itemType.slice(1);
}

function formatInventoryQuantity(value: string) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
}

function getInventoryLabel(item: InventoryItem | null) {
  if (!item || item.status !== "active") {
    return "Not tracked";
  }

  return formatInventoryQuantity(item.currentQuantity);
}

export function InventoryManager({
  returnTo,
  inventoryEnabled,
  items,
  taxCodes,
  inventoryItems,
  inventoryTransactions,
  catalogItemFilesById,
  vendors,
  contentBlocks: _contentBlocks,
  saveItemAction,
  saveSystemComponentsAction,
  saveContentBlockAction: _saveContentBlockAction,
  deleteCatalogItemFileAction,
  initialSidebarView = "all",
  lockedSidebarView = null,
  inventoryView = "all",
  defaultDrawerTab = "details"
}: InventoryManagerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarView, setSidebarView] = useState<SidebarView>(
    lockedSidebarView ?? initialSidebarView
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
  const [skuFilter, setSkuFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [markupFilter, setMarkupFilter] = useState("");
  const [costCodeFilter, setCostCodeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
  const { rowsPerView } = useRowsPerViewPreference(COST_ITEMS_ROWS_PER_VIEW_STORAGE_KEY);
  void _contentBlocks;
  void _saveContentBlockAction;
  const effectiveSidebarView = lockedSidebarView ?? sidebarView;

  const defaultLocationInventoryItems = useMemo(
    () => inventoryItems.filter((item) => item.location === "default"),
    [inventoryItems]
  );

  const linkedInventoryByCatalogItemId = useMemo(() => {
    const mapped = new Map<string, InventoryItem>();

    for (const inventoryItem of defaultLocationInventoryItems) {
      if (!inventoryItem.catalogItemId) {
        continue;
      }

      mapped.set(inventoryItem.catalogItemId, inventoryItem);
    }

    return mapped;
  }, [defaultLocationInventoryItems]);

  const transactionsByInventoryItemId = useMemo(() => {
    const mapped = new Map<string, InventoryTransaction[]>();

    for (const transaction of inventoryTransactions) {
      const existing = mapped.get(transaction.inventoryItemId) ?? [];
      existing.push(transaction);
      mapped.set(transaction.inventoryItemId, existing);
    }

    return mapped;
  }, [inventoryTransactions]);

  const lowStockItems = useMemo(
    () =>
      defaultLocationInventoryItems.filter(
        (item) =>
          item.status === "active" &&
          Number(item.currentQuantity) <= Number(item.reorderPoint)
      ),
    [defaultLocationInventoryItems]
  );

  const visibleTypeSet = useMemo(() => {
    const itemTypes = resolveSidebarViewItemTypes(effectiveSidebarView);
    return itemTypes ? new Set<string>(itemTypes) : null;
  }, [effectiveSidebarView]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const skuQuery = skuFilter.trim().toLowerCase();
    const nameQuery = nameFilter.trim().toLowerCase();
    const unitQuery = unitFilter.trim().toLowerCase();
    const markupQuery = markupFilter.trim();
    const costCodeQuery = costCodeFilter.trim().toLowerCase();

    return items
      .filter((item) => {
        const inventoryItem = linkedInventoryByCatalogItemId.get(item.id) ?? null;

        if (visibleTypeSet && !visibleTypeSet.has(item.itemType)) {
          return false;
        }

        if (
          inventoryView === "tracked" &&
          (!inventoryItem || inventoryItem.status !== "active")
        ) {
          return false;
        }

        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        if (
          query &&
          ![
            item.name,
            item.description ?? "",
            item.sku ?? "",
            item.category ?? "",
            item.costCode ?? "",
            item.unit
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }

        if (skuQuery && !(item.sku ?? "").toLowerCase().includes(skuQuery)) {
          return false;
        }

        if (nameQuery && !item.name.toLowerCase().includes(nameQuery)) {
          return false;
        }

        if (unitQuery && !item.unit.toLowerCase().includes(unitQuery)) {
          return false;
        }

        if (markupQuery && !item.markupPercent.includes(markupQuery)) {
          return false;
        }

        if (costCodeQuery && !(item.costCode ?? "").toLowerCase().includes(costCodeQuery)) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const modifier = sortDirection === "asc" ? 1 : -1;

        switch (sortKey) {
          case "updatedAt":
            return left.updatedAt.localeCompare(right.updatedAt) * modifier;
          case "itemType":
            return left.itemType.localeCompare(right.itemType) * modifier;
          case "name":
          default:
            return left.name.localeCompare(right.name) * modifier;
        }
      });
  }, [
    costCodeFilter,
    inventoryView,
    items,
    linkedInventoryByCatalogItemId,
    markupFilter,
    nameFilter,
    search,
    skuFilter,
    sortDirection,
    sortKey,
    statusFilter,
    unitFilter,
    visibleTypeSet
  ]);

  const groups = useMemo(() => {
    const bucket = new Map<
      string,
      { name: string; itemCount: number; addedAt: string | null; addedBy: string | null }
    >();

    for (const item of items) {
      const groupName = item.category?.trim();

      if (!groupName) {
        continue;
      }

      const existing = bucket.get(groupName);

      if (existing) {
        existing.itemCount += 1;
        existing.addedAt =
          existing.addedAt == null || item.createdAt < existing.addedAt
            ? item.createdAt
            : existing.addedAt;
        continue;
      }

      bucket.set(groupName, {
        name: groupName,
        itemCount: 1,
        addedAt: item.createdAt,
        addedBy: null
      });
    }

    return [...bucket.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [items]);

  const visibleItems = useMemo(
    () => applyRowsPerView(filteredItems, rowsPerView),
    [filteredItems, rowsPerView]
  );
  const shouldShowSelectAllResultsHint =
    filteredItems.length > visibleItems.length && visibleItems.length > 0;
  const selectAllVisibleLabel = `Select All (${visibleItems.length} visible)`;

  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item.id));

  function openDrawer(item: CatalogItem | null, itemType: CatalogItem["itemType"]) {
    setDrawerState({ item, itemType });
  }

  function stopRowAction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  function closeDrawer() {
    setDrawerState(null);
  }

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function toggleSelect(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((value) => value !== itemId)
        : [...current, itemId]
    );
  }

  function toggleSelectAll() {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleItems.some((item) => item.id === id))
        : visibleItems.map((item) => item.id)
    );
  }

  const activeTrackedCount = defaultLocationInventoryItems.filter(
    (item) => item.status === "active"
  ).length;

  const searchPlaceholder =
    effectiveSidebarView === "groups"
      ? "Search item groups"
      : inventoryView === "tracked"
        ? "Search tracked inventory items"
        : "Search cost items";
  const visibleSidebarViews = lockedSidebarView
    ? sidebarViews.filter((view) => view.id === lockedSidebarView)
    : sidebarViews;

  function setWorkspaceView(nextView: SidebarView) {
    if (lockedSidebarView || nextView === effectiveSidebarView) {
      return;
    }

    setSidebarView(nextView);
    setSelectedIds([]);

    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (nextView === "all") {
      params.delete("view");
    } else {
      params.set("view", nextView);
    }

    const query = params.toString();
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", query ? `${pathname}?${query}` : pathname);
    }
  }

  const quickAddItemTypes =
    lockedSidebarView === "systems"
      ? (["system"] as const)
      : ([
          "material",
          "labor",
          "equipment",
          "service",
          "system",
          "subcontractor",
          "other"
        ] as const);
  const directAddType = visibleTypeSet?.size === 1 ? [...visibleTypeSet][0] as CatalogItem["itemType"] : null;

  return (
    <div className="border border-[#d7dce4] bg-white">
      <div className="border-b border-[#dfe4ec] bg-[#f7f8fa] px-3 py-2.5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <label className="relative min-w-[260px] flex-1 xl:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8391a7]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full border border-[#cfd6e0] bg-white pl-9 pr-3 text-sm text-[#22344d] outline-none transition focus:border-[#d8731f]"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | "active" | "archived")
              }
              className="h-8 border border-[#cfd6e0] bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>

            <div className="inline-flex h-8 items-center border border-[#d7dde7] bg-white px-3 text-xs font-medium text-slate-500">
              {formatRowsPerViewVisibleCount(
                filteredItems.length,
                visibleItems.length,
                rowsPerView
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <details className="relative">
              <summary className="flex h-8 cursor-pointer list-none items-center gap-2 border border-[#cfd6e0] bg-white px-3 text-sm font-medium text-slate-700">
                Actions <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[220px] border border-[#cfd6e0] bg-white p-1">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSelectedIds([]);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-sm text-[#22344d] hover:bg-[#f0f3f7]"
                >
                  Show all items
                </button>
                {!lockedSidebarView ? (
                  <button
                    type="button"
                    onClick={() => setWorkspaceView("groups")}
                    className="block w-full px-3 py-1.5 text-left text-sm text-[#22344d] hover:bg-[#f0f3f7]"
                  >
                    Open item groups
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleSort("updatedAt")}
                  className="block w-full px-3 py-1.5 text-left text-sm text-[#22344d] hover:bg-[#f0f3f7]"
                >
                  Sort by date
                </button>
              </div>
            </details>

            {directAddType ? (
              <button
                type="button"
                onClick={() => openDrawer(null, directAddType)}
                className="flex h-8 items-center gap-2 border border-[#d8731f] bg-[#d8731f] px-3 text-sm font-medium text-white"
              >
                Add {formatTypeLabel(directAddType)}
              </button>
            ) : (
              <details className="relative">
                <summary className="flex h-8 cursor-pointer list-none items-center gap-2 border border-[#d8731f] bg-[#d8731f] px-3 text-sm font-medium text-white">
                  Add item <ChevronDown className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[220px] border border-[#cfd6e0] bg-white p-1">
                  {quickAddItemTypes.map((itemType) => (
                    <button
                      key={itemType}
                      type="button"
                      onClick={() => openDrawer(null, itemType)}
                      className="block w-full px-3 py-1.5 text-left text-sm text-[#22344d] hover:bg-[#f0f3f7]"
                    >
                      Add {formatTypeLabel(itemType)}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-[#dfe4ec] bg-white px-3 py-2 text-xs font-medium text-slate-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>{inventoryView === "tracked" ? "Inventory view" : "Cost item grid"}</span>
          {inventoryEnabled ? <span>{activeTrackedCount} tracked</span> : null}
          {inventoryEnabled ? <span>{lowStockItems.length} low stock</span> : null}
          {lockedSidebarView === "systems" ? <span>Systems only</span> : null}
          <span>
            Reusable catalog items are the cost-item foundation for future estimates, invoices, and
            materials planning.
          </span>
        </div>
      </div>

      <div
        className={[
          "grid min-h-[620px] bg-white",
          lockedSidebarView ? "grid-cols-1" : "grid-cols-[52px_minmax(0,1fr)]"
        ].join(" ")}
      >
        {!lockedSidebarView ? (
          <aside className="border-r border-[#dfe4ec] bg-[#f6f7f9] py-2">
            <div className="flex flex-col items-center gap-1.5">
              {visibleSidebarViews.map((view) => {
                const Icon = view.icon;
                const active = effectiveSidebarView === view.id;

                return (
                  <button
                    key={view.id}
                    type="button"
                    title={view.label}
                    aria-label={view.label}
                    onClick={() => setWorkspaceView(view.id)}
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center border text-[#4d5f79] transition",
                      active
                        ? "border-[#d8731f] bg-[#d8731f] text-white"
                        : "border-[#d4dbe5] bg-white hover:border-[#c6d0dd] hover:bg-[#f0f3f7]"
                    ].join(" ")}
                  >
                    <Icon className="h-[15px] w-[15px]" />
                    <span className="sr-only">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          {effectiveSidebarView === "groups" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#dfe4ec] bg-[#f7f8fa] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2"># Items</th>
                    <th className="px-3 py-2">Added By</th>
                    <th className="px-3 py-2">Date Added</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.name} className="border-b border-[#e7ebf1] text-sm text-[#22344d]">
                      <td className="px-3 py-2 font-medium">{group.name}</td>
                      <td className="px-3 py-2">{group.itemCount}</td>
                      <td className="px-3 py-2">{group.addedBy ?? "-"}</td>
                      <td className="px-3 py-2">
                        {group.addedAt ? new Date(group.addedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-2 text-right text-[#8b96a8]">...</td>
                    </tr>
                  ))}
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-10 text-center text-sm text-[#7d8aa0]">
                        No category-based item groups exist yet. Save categories on catalog items to populate this view.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#dfe4ec] bg-[#f7f8fa] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="min-w-[220px] px-3 py-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                            aria-label={selectAllVisibleLabel}
                            className="h-4 w-4 rounded border-[#b7c2d2]"
                          />
                          <span>{selectAllVisibleLabel}</span>
                        </label>
                        {shouldShowSelectAllResultsHint ? (
                          <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title="Selection still applies to currently visible rows only."
                            className="w-fit text-left text-[10px] font-semibold normal-case tracking-normal text-[#8b96a8] disabled:cursor-not-allowed"
                          >
                            Select all {filteredItems.length} results
                          </button>
                        ) : null}
                      </div>
                    </th>
                    <th className="min-w-[150px] px-3 py-2">Type / Category</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="font-semibold text-[#445978]"
                      >
                        Name
                      </button>
                    </th>
                    <th className="px-3 py-2">Default Cost</th>
                    <th className="px-3 py-2">Unit</th>
                    {inventoryEnabled ? <th className="px-3 py-2">On Hand</th> : null}
                    {inventoryEnabled ? <th className="px-3 py-2">Reorder</th> : null}
                    {inventoryEnabled ? <th className="px-3 py-2">Low Stock</th> : null}
                    <th className="px-3 py-2">MU %</th>
                    <th className="px-3 py-2">Hidden MU %</th>
                    <th className="px-3 py-2">Default Price</th>
                    <th className="px-3 py-2">Cost Code</th>
                    <th className="px-3 py-2">Taxable</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                  <tr className="border-b border-[#dfe4ec] bg-[#fbfcfe]">
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2">
                      <input
                        value={skuFilter}
                        onChange={(event) => setSkuFilter(event.target.value)}
                        placeholder="Search SKU"
                        className="h-7 w-full border border-[#cfd6e0] px-2 text-sm outline-none"
                      />
                    </th>
                    <th className="px-3 py-2">
                      <input
                        value={nameFilter}
                        onChange={(event) => setNameFilter(event.target.value)}
                        placeholder="Search Name"
                        className="h-7 w-full border border-[#cfd6e0] px-2 text-sm outline-none"
                      />
                    </th>
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2">
                      <input
                        value={unitFilter}
                        onChange={(event) => setUnitFilter(event.target.value)}
                        placeholder="Search Unit"
                        className="h-7 w-full border border-[#cfd6e0] px-2 text-sm outline-none"
                      />
                    </th>
                    {inventoryEnabled ? <th className="px-3 py-2" /> : null}
                    {inventoryEnabled ? <th className="px-3 py-2" /> : null}
                    {inventoryEnabled ? <th className="px-3 py-2" /> : null}
                    <th className="px-3 py-2">
                      <input
                        value={markupFilter}
                        onChange={(event) => setMarkupFilter(event.target.value)}
                        placeholder="Search MU %"
                        className="h-7 w-full border border-[#cfd6e0] px-2 text-sm outline-none"
                      />
                    </th>
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2">
                      <input
                        value={costCodeFilter}
                        onChange={(event) => setCostCodeFilter(event.target.value)}
                        placeholder="Cost Code"
                        className="h-7 w-full border border-[#cfd6e0] px-2 text-sm outline-none"
                      />
                    </th>
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2" />
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const TypeIcon = resolveItemTypeIcon(item.itemType);
                    const pricing = calculateSharedUnitPricing({
                      baseUnitCost: item.defaultUnitCost,
                      baseUnitPrice: item.defaultUnitPrice,
                      markupPercent: item.markupPercent,
                      hiddenMarkupPercent: item.hiddenMarkupPercent
                    });
                    const inventoryItem = linkedInventoryByCatalogItemId.get(item.id) ?? null;
                    const isTracked = Boolean(inventoryItem && inventoryItem.status === "active");
                    const reorderPointLabel =
                      isTracked && inventoryItem
                        ? formatInventoryQuantity(inventoryItem.reorderPoint)
                        : "-";
                    const isLowStock =
                      isTracked &&
                      inventoryItem !== null &&
                      Number(inventoryItem.currentQuantity) <= Number(inventoryItem.reorderPoint);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => openDrawer(item, item.itemType)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }

                          event.preventDefault();
                          openDrawer(item, item.itemType);
                        }}
                        tabIndex={0}
                        className="cursor-pointer border-b border-[#e7ebf1] text-sm text-[#22344d] hover:bg-[#fbfcfe] focus:bg-[#fbfcfe] focus:outline-none"
                      >
                        <td className="px-3 py-2" onClick={stopRowAction}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="h-4 w-4 rounded border-[#b7c2d2]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center border border-[#d8dee7] bg-[#f6f7f9] text-[#4d5f79]">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-[#22344d]">
                                {formatTypeLabel(item.itemType)}
                              </div>
                              <div className="mt-0.5 max-w-[140px] truncate text-xs text-[#8b96a8]">
                                {item.category ?? "Uncategorized"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[#667a97]">{item.sku ?? "-"}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            {item.isDefault ? (
                              <span className="border border-[#f0d3b8] bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a4581a]">
                                Default
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0.5 max-w-[340px] truncate text-xs text-[#8b96a8]">
                            {item.description ?? "Reusable cost item for catalog-backed planning."}
                          </div>
                        </td>
                        <td className="px-3 py-2">${item.defaultUnitCost}</td>
                        <td className="px-3 py-2">{item.unit}</td>
                        {inventoryEnabled ? (
                          <td className="px-3 py-2 text-[#667a97]">{getInventoryLabel(inventoryItem)}</td>
                        ) : null}
                        {inventoryEnabled ? (
                          <td className="px-3 py-2 text-[#667a97]">{reorderPointLabel}</td>
                        ) : null}
                        {inventoryEnabled ? (
                          <td className="px-3 py-2">
                            {isTracked ? (
                              <span
                                className={[
                                  "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                                  isLowStock
                                    ? "border-amber-200 bg-amber-50 text-amber-900"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                                ].join(" ")}
                              >
                                {isLowStock ? "Low" : "OK"}
                              </span>
                            ) : (
                              <span className="text-[#8b96a8]">-</span>
                            )}
                          </td>
                        ) : null}
                        <td className="px-3 py-2">{item.markupPercent}</td>
                        <td className="px-3 py-2">{item.hiddenMarkupPercent}</td>
                        <td className="px-3 py-2">
                          {item.defaultUnitPrice == null ? (
                            <span title={`Derived price: $${formatMoneyValue(pricing.finalUnitPrice)}`}>
                              Derived
                            </span>
                          ) : (
                            `$${item.defaultUnitPrice}`
                          )}
                        </td>
                        <td className="px-3 py-2 text-[#667a97]">{item.costCode ?? "-"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={[
                              "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                              item.taxable
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            ].join(" ")}
                          >
                            {item.taxable ? "Taxable" : "Exempt"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={[
                              "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                              item.status === "active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            ].join(" ")}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right" onClick={stopRowAction}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDrawer(item, item.itemType)}
                              className="inline-flex h-7 items-center border border-[#cfd6e0] bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79] hover:bg-[#f0f3f7]"
                            >
                              Edit
                            </button>
                            <form action={saveItemAction} className="inline-flex">
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <input
                                type="hidden"
                                name="inventoryItemId"
                                value={inventoryItem?.id ?? ""}
                              />
                              <input type="hidden" name="itemType" value={item.itemType} />
                              <input type="hidden" name="name" value={item.name} />
                              <input type="hidden" name="description" value={item.description ?? ""} />
                              <input
                                type="hidden"
                                name="internalNotes"
                                value={item.internalNotes ?? ""}
                              />
                              <input type="hidden" name="unit" value={item.unit} />
                              <input
                                type="hidden"
                                name="defaultUnitCost"
                                value={item.defaultUnitCost}
                              />
                              <input
                                type="hidden"
                                name="defaultUnitPrice"
                                value={item.defaultUnitPrice ?? ""}
                              />
                              <input type="hidden" name="markupPercent" value={item.markupPercent} />
                              <input
                                type="hidden"
                                name="hiddenMarkupPercent"
                                value={item.hiddenMarkupPercent}
                              />
                              <input type="hidden" name="taxCodeId" value={item.taxCodeId ?? ""} />
                              <input type="hidden" name="vendorId" value={item.vendorId ?? ""} />
                              <input type="hidden" name="category" value={item.category ?? ""} />
                              <input type="hidden" name="costCode" value={item.costCode ?? ""} />
                              <input type="hidden" name="sku" value={item.sku ?? ""} />
                              <input
                                type="hidden"
                                name="photoStoragePath"
                                value={item.photoStoragePath ?? ""}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value={item.status === "active" ? "archived" : "active"}
                              />
                              <input type="hidden" name="isDefault" value={item.isDefault ? "on" : ""} />
                              <input
                                type="hidden"
                                name="inventoryLocation"
                                value={inventoryItem?.location ?? "default"}
                              />
                              <input
                                type="hidden"
                                name="inventoryReorderPoint"
                                value={inventoryItem?.reorderPoint ?? "0"}
                              />
                              <input type="hidden" name="inventoryAdjustmentQuantity" value="" />
                              <input type="hidden" name="inventoryAdjustmentNote" value="" />
                              <input type="hidden" name="submitMode" value="save" />
                              {inventoryEnabled && inventoryItem?.status === "active" ? (
                                <input type="hidden" name="trackInventory" value="on" />
                              ) : null}
                              {item.taxable ? <input type="hidden" name="taxable" value="on" /> : null}
                              <button
                                type="submit"
                                className="inline-flex h-7 items-center border border-[#cfd6e0] bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79] hover:bg-[#f0f3f7]"
                              >
                                {item.status === "active" ? "Archive" : "Reactivate"}
                              </button>
                            </form>
                            <details className="relative inline-block text-left">
                              <summary className="cursor-pointer list-none border border-[#cfd6e0] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f79]">
                                More
                              </summary>
                              <div className="absolute right-0 z-10 mt-1 min-w-[140px] border border-[#cfd6e0] bg-white p-1">
                                <button
                                  type="button"
                                  onClick={() => openDrawer(item, item.itemType)}
                                  className="block w-full px-3 py-1.5 text-left text-sm text-[#22344d] hover:bg-[#f0f3f7]"
                                >
                                  Edit details
                                </button>
                              </div>
                            </details>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={inventoryEnabled ? 16 : 13}
                        className="px-3 py-12 text-center text-sm text-[#7d8aa0]"
                      >
                        <div className="mx-auto max-w-2xl">
                          <p className="font-medium text-[#22344d]">
                            {items.length === 0
                              ? "No reusable cost items yet."
                              : "No cost items match the current filters."}
                          </p>
                          <p className="mt-2 leading-6">
                            Catalog items are organization-scoped reusable cost records for
                            materials, labor, equipment, subcontractor work, systems, and future
                            materials planning. Add an item here without changing estimate or
                            invoice calculations.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <InventoryItemDrawer
        open={Boolean(drawerState)}
        item={drawerState?.item ?? null}
        initialItemType={drawerState?.itemType ?? "material"}
        defaultTab={defaultDrawerTab}
        inventoryEnabled={inventoryEnabled}
        returnTo={returnTo}
        vendors={vendors}
        catalogItems={items}
        taxCodes={taxCodes}
        inventoryItem={drawerState?.item ? linkedInventoryByCatalogItemId.get(drawerState.item.id) ?? null : null}
        inventoryTransactions={
          drawerState?.item
            ? transactionsByInventoryItemId.get(
                linkedInventoryByCatalogItemId.get(drawerState.item.id)?.id ?? ""
              ) ?? []
            : []
        }
        existingFiles={drawerState?.item ? catalogItemFilesById[drawerState.item.id] ?? [] : []}
        onClose={closeDrawer}
        saveItemAction={saveItemAction}
        saveSystemComponentsAction={saveSystemComponentsAction}
        deleteCatalogItemFileAction={deleteCatalogItemFileAction}
      />
    </div>
  );
}
