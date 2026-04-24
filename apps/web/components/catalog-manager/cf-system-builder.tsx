"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  GripVertical,
  Layers,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload
} from "lucide-react";
import type { CatalogItem, CatalogSystemComponent } from "@floorconnector/types";

import { buildExpandedSystemPreview } from "@/lib/catalogs/system-expansion";

type CFSystemBuilderProps = {
  returnTo: string;
  systemItem: CatalogItem;
  catalogItems: CatalogItem[];
  saveAction: (formData: FormData) => void | Promise<void>;
};

type ComponentDraft = {
  key: string;
  componentCatalogItemId: string;
  quantityPerUnit: string;
  basisUnit: string;
  sortOrder: number;
};

type ItemGroup = {
  id: string;
  name: string;
  expanded: boolean;
  items: CatalogItem[];
};

function createComponentRows(systemItem: CatalogItem): ComponentDraft[] {
  const components = Array.isArray(systemItem.metadata.systemComponents)
    ? (systemItem.metadata.systemComponents as CatalogSystemComponent[])
    : [];

  if (components.length === 0) {
    return [
      {
        key: "component-1",
        componentCatalogItemId: "",
        quantityPerUnit: "1.0000",
        basisUnit: "sqft",
        sortOrder: 0
      }
    ];
  }

  return components.map((component, index) => ({
    key: component.id || `component-${index + 1}`,
    componentCatalogItemId: component.componentCatalogItemId,
    quantityPerUnit: component.quantityPerUnit,
    basisUnit: component.basisUnit,
    sortOrder: component.sortOrder
  }));
}

export function CFSystemBuilder({
  returnTo,
  systemItem,
  catalogItems,
  saveAction
}: CFSystemBuilderProps) {
  const [rows, setRows] = useState<ComponentDraft[]>(() => createComponentRows(systemItem));
  const [previewSquareFootage, setPreviewSquareFootage] = useState("1000");
  const [groupSearch, setGroupSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["2024"]));

  const componentOptions = useMemo(
    () =>
      catalogItems.filter(
        (item) => item.status === "active" && item.itemType !== "system"
      ),
    [catalogItems]
  );

  // Group items by category/year
  const itemGroups = useMemo((): ItemGroup[] => {
    const groups = new Map<string, CatalogItem[]>();
    
    for (const item of componentOptions) {
      const groupName = item.category || "Uncategorized";
      const existing = groups.get(groupName) || [];
      existing.push(item);
      groups.set(groupName, existing);
    }

    return Array.from(groups.entries()).map(([name, items]) => ({
      id: name,
      name,
      expanded: expandedGroups.has(name),
      items
    }));
  }, [componentOptions, expandedGroups]);

  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return itemGroups;
    const query = groupSearch.toLowerCase();
    return itemGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.name.toLowerCase().includes(query)
        )
      }))
      .filter((group) => group.items.length > 0);
  }, [itemGroups, groupSearch]);

  const hydratedSystemItem = useMemo(
    () => ({
      ...systemItem,
      metadata: {
        ...systemItem.metadata,
        systemComponents: rows
          .filter((row) => row.componentCatalogItemId.trim().length > 0)
          .map((row, index) => {
            const componentItem =
              componentOptions.find((item) => item.id === row.componentCatalogItemId) ?? null;

            return {
              id: row.key,
              organizationId: systemItem.organizationId,
              systemCatalogItemId: systemItem.id,
              componentCatalogItemId: row.componentCatalogItemId,
              componentItemType: componentItem?.itemType ?? null,
              componentName: componentItem?.name ?? "Component",
              componentDescription: componentItem?.description ?? null,
              unit: componentItem?.unit ?? "each",
              quantityPerUnit: row.quantityPerUnit,
              basisUnit: row.basisUnit,
              sortOrder: index,
              createdAt: systemItem.createdAt,
              updatedAt: systemItem.updatedAt
            };
          })
      }
    }),
    [componentOptions, rows, systemItem]
  );

  const preview = useMemo(() => {
    const squareFootage = Number(previewSquareFootage);

    if (!Number.isFinite(squareFootage) || squareFootage <= 0) {
      return null;
    }

    const expanded = buildExpandedSystemPreview({
      systemCatalogItem: hydratedSystemItem,
      catalogItems,
      squareFootage
    });

    return expanded.rows.length > 0 ? expanded : null;
  }, [catalogItems, hydratedSystemItem, previewSquareFootage]);

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  function updateRow(
    key: string,
    field: keyof Omit<ComponentDraft, "key">,
    value: string | number
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.key === key ? { ...row, [field]: value } : row
      )
    );
  }

  function addRow() {
    setRows((currentRows) => [
      ...currentRows,
      {
        key: `component-${currentRows.length + 1}`,
        componentCatalogItemId: "",
        quantityPerUnit: "1.0000",
        basisUnit: "sqft",
        sortOrder: currentRows.length
      }
    ]);
  }

  function removeRow(key: string) {
    setRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows
            .filter((row) => row.key !== key)
            .map((row, index) => ({ ...row, sortOrder: index }))
    );
  }

  function addItemToGroup(item: CatalogItem) {
    setRows((currentRows) => [
      ...currentRows,
      {
        key: `component-${Date.now()}`,
        componentCatalogItemId: item.id,
        quantityPerUnit: "1.0000",
        basisUnit: "sqft",
        sortOrder: currentRows.length
      }
    ]);
  }

  return (
    <div className="flex h-[600px] overflow-hidden rounded border border-[#e2e7ef] bg-white">
      {/* Left panel - Item Groups browser */}
      <div className="flex w-[300px] shrink-0 flex-col border-r border-[#e2e7ef] bg-[#f8f9fb]">
        {/* Tabs */}
        <div className="flex border-b border-[#e2e7ef]">
          <button className="flex flex-1 items-center justify-center gap-2 border-b-2 border-[#28456f] bg-white px-4 py-3 text-[13px] font-medium text-[#28456f]">
            <FileText className="h-4 w-4" />
            Details
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3 text-[13px] text-[#607492] hover:bg-white/50">
            <FileText className="h-4 w-4" />
            Notes
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3 text-[13px] text-[#607492] hover:bg-white/50">
            <FolderOpen className="h-4 w-4" />
            Files
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#e2e7ef] p-3">
          <div className="flex h-9 items-center gap-2 rounded border border-[#d0d7e2] bg-white px-3">
            <Search className="h-4 w-4 text-[#8594a8]" />
            <input
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Search for Item Groups"
              className="h-full flex-1 border-0 bg-transparent text-[12px] text-[#334a70] outline-none placeholder:text-[#a0aec0]"
            />
          </div>
          <div className="mt-2">
            <select className="h-9 w-full rounded border border-[#d0d7e2] bg-[#28456f] px-3 text-[12px] font-medium text-white outline-none">
              <option>Active</option>
              <option>Archived</option>
            </select>
          </div>
        </div>

        {/* Item groups tree */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#607492]">Name</div>
          </div>
          {filteredGroups.map((group) => (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white"
              >
                {group.expanded ? (
                  <ChevronDown className="h-4 w-4 text-[#8594a8]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#8594a8]" />
                )}
                <span className="text-[13px] font-medium text-[#28456f]">{group.name}</span>
              </button>
              {group.expanded && (
                <div className="ml-6 border-l border-[#e2e7ef]">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItemToGroup(item)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-[#e8f4ff]"
                    >
                      <Layers className="h-3.5 w-3.5 text-[#8594a8]" />
                      <span className="text-[12px] text-[#334a70]">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Group details */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e7ef] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#28456f]" />
            <h2 className="text-[15px] font-semibold text-[#28456f]">Add Item Group</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-[#8594a8] hover:text-[#28456f]">
              <MoreVertical className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-[#8594a8] hover:text-[#28456f]">
              <span className="text-[16px]">&times;</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Details section */}
          <div className="mb-4 rounded border border-[#e2e7ef] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-medium text-[#28456f]">Details</h3>
            <div>
              <label className="text-[12px] font-medium text-[#607492]">
                Name*
                <input
                  defaultValue={systemItem.name}
                  className="mt-1 h-10 w-full rounded border border-[#d0d7e2] bg-white px-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                />
              </label>
            </div>
          </div>

          {/* Manage Item section */}
          <div className="rounded border border-[#e2e7ef] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e7ef] px-4 py-3">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#28456f] hover:text-[#1e3a5f]"
              >
                <Plus className="h-4 w-4" />
                Manage Item
              </button>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#f6f8fb]">
                  <tr className="border-b border-[#e2e7ef]">
                    <th className="px-3 py-2 text-left font-medium text-[#607492]">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-[#607492]">Item Name</th>
                    <th className="px-3 py-2 text-right font-medium text-[#607492]">QTY</th>
                    <th className="px-3 py-2 text-right font-medium text-[#607492]">Unit Cost</th>
                    <th className="px-3 py-2 text-left font-medium text-[#607492]">Unit</th>
                    <th className="px-3 py-2 text-right font-medium text-[#607492]">Total</th>
                    <th className="w-10 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center text-[#8594a8]">
                          <div className="mb-2 rounded-full bg-[#f6f8fb] p-4">
                            <FileText className="h-8 w-8" />
                          </div>
                          <span className="text-[13px]">No Records Available</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const item = componentOptions.find((i) => i.id === row.componentCatalogItemId);
                      if (!item && row.componentCatalogItemId) return null;

                      return (
                        <tr key={row.key} className="border-b border-[#e2e7ef] hover:bg-[#f6f8fb]">
                          <td className="px-3 py-2">
                            <select
                              value={row.componentCatalogItemId}
                              onChange={(e) => updateRow(row.key, "componentCatalogItemId", e.target.value)}
                              className="h-8 w-full rounded border border-[#d0d7e2] bg-white px-2 text-[11px] text-[#334a70] outline-none"
                            >
                              <option value="">Select item</option>
                              {componentOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-[#334a70]">{item?.name || "-"}</td>
                          <td className="px-3 py-2">
                            <input
                              value={row.quantityPerUnit}
                              onChange={(e) => updateRow(row.key, "quantityPerUnit", e.target.value)}
                              className="h-8 w-20 rounded border border-[#d0d7e2] bg-white px-2 text-right text-[11px] text-[#334a70] outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-[#334a70]">
                            ${item?.defaultUnitCost || "0.00"}
                          </td>
                          <td className="px-3 py-2 text-[#607492]">{item?.unit || "-"}</td>
                          <td className="px-3 py-2 text-right font-medium text-[#334a70]">
                            ${(parseFloat(item?.defaultUnitCost || "0") * parseFloat(row.quantityPerUnit || "0")).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeRow(row.key)}
                              className="p-1 text-[#ef4444] hover:text-[#dc2626]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes section */}
          <div className="mt-4 rounded border border-[#e2e7ef] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-medium text-[#28456f]">Notes</h3>
            <div>
              <label className="text-[12px] font-medium text-[#607492]">
                Internal Notes
                <p className="mt-0.5 text-[11px] font-normal text-[#8594a8]">
                  Notes added here are transferred to other records (such as an Estimate or PO) and are not visible to the recipient.
                </p>
                <textarea
                  rows={3}
                  className="mt-2 w-full rounded border border-[#d0d7e2] bg-white p-3 text-[13px] text-[#334a70] outline-none focus:border-[#28456f]"
                />
              </label>
            </div>
          </div>

          {/* Files section */}
          <div className="mt-4 rounded border border-[#e2e7ef] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-medium text-[#28456f]">Files</h3>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-[#d0d7e2] bg-[#f8f9fb]">
              <div className="flex flex-col items-center text-[#8594a8]">
                <Plus className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e2e7ef] bg-[#f6f8fb] px-4 py-3">
          <form action={saveAction}>
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="systemCatalogItemId" value={systemItem.id} />
            {rows.map((row, index) => (
              <div key={row.key}>
                <input type="hidden" name="componentSortOrder" value={index} />
                <input type="hidden" name="componentCatalogItemId" value={row.componentCatalogItemId} />
                <input type="hidden" name="componentQuantityPerUnit" value={row.quantityPerUnit} />
                <input type="hidden" name="componentBasisUnit" value={row.basisUnit} />
              </div>
            ))}
            <button
              type="submit"
              className="w-full rounded bg-[#28456f] py-2.5 text-[13px] font-medium text-white hover:bg-[#1e3a5f]"
            >
              Create Item Group
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
