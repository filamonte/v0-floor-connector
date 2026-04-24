"use client";

import { useMemo, useState } from "react";
import type { CatalogItem, CatalogSystemComponent } from "@floorconnector/types";

import { buildExpandedSystemPreview } from "@/lib/catalogs/system-expansion";

type SystemBuilderProps = {
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

export function SystemBuilder({
  returnTo,
  systemItem,
  catalogItems,
  saveAction
}: SystemBuilderProps) {
  const [rows, setRows] = useState<ComponentDraft[]>(() => createComponentRows(systemItem));
  const [previewSquareFootage, setPreviewSquareFootage] = useState("1000");
  const componentOptions = useMemo(
    () =>
      catalogItems.filter(
        (item) => item.status === "active" && item.itemType !== "system"
      ),
    [catalogItems]
  );
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

  return (
    <div className="space-y-4 rounded-[20px] border border-[#d8e0eb] bg-[#fbfcfe] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607492]">
            System Builder
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5f7190]">
            Component quantities, cost, price, and taxable mix are previewed from the same expansion logic used by estimates.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
        >
          Add Component
        </button>
      </div>

      <form action={saveAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="systemCatalogItemId" value={systemItem.id} />

        <div className="overflow-hidden rounded-[16px] border border-[#d8e0eb] bg-white">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f6f8fc] text-left text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">
                <th className="px-3 py-3">Component</th>
                <th className="px-3 py-3">Qty / Unit</th>
                <th className="px-3 py-3">Basis</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.key} className="border-t border-[#edf1f6] text-sm text-[#334a70]">
                  <td className="px-3 py-3">
                    <input type="hidden" name="componentSortOrder" value={index} />
                    <select
                      name="componentCatalogItemId"
                      value={row.componentCatalogItemId}
                      onChange={(event) =>
                        updateRow(row.key, "componentCatalogItemId", event.target.value)
                      }
                      className="w-full rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
                    >
                      <option value="">Select component item</option>
                      {componentOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.itemType})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      name="componentQuantityPerUnit"
                      value={row.quantityPerUnit}
                      onChange={(event) =>
                        updateRow(row.key, "quantityPerUnit", event.target.value)
                      }
                      className="w-full rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      name="componentBasisUnit"
                      value={row.basisUnit}
                      onChange={(event) =>
                        updateRow(row.key, "basisUnit", event.target.value)
                      }
                      className="w-full rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="rounded-full border border-[#ebd3d3] px-3 py-2 text-xs font-medium text-[#8f4b4b]"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[#334a70]">
              Preview sqft
              <input
                value={previewSquareFootage}
                onChange={(event) => setPreviewSquareFootage(event.target.value)}
                className="ml-3 w-[120px] rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-full bg-[#1f5fd6] px-4 py-2 text-sm font-medium text-white"
          >
            Save Components
          </button>
        </div>
      </form>

      {preview ? (
        <div className="overflow-hidden rounded-[16px] border border-[#d8e0eb] bg-white">
          <div className="grid gap-3 border-b border-[#edf1f6] px-4 py-3 sm:grid-cols-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">Rows</p>
              <p className="mt-1 text-lg font-semibold text-[#23395d]">{preview.rows.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">Cost</p>
              <p className="mt-1 text-lg font-semibold text-[#23395d]">${preview.totalCost}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">Price</p>
              <p className="mt-1 text-lg font-semibold text-[#23395d]">${preview.totalPrice}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">Tax Mix</p>
              <p className="mt-1 text-sm font-semibold text-[#23395d]">
                T ${preview.taxablePrice} / E ${preview.exemptPrice}
              </p>
            </div>
          </div>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f6f8fc] text-left text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-center">Tax</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row) => (
                <tr key={row.componentId} className="border-t border-[#edf1f6] text-sm text-[#334a70]">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 text-right">
                    {row.quantity} {row.unit}
                  </td>
                  <td className="px-3 py-2 text-right">${row.lineCost}</td>
                  <td className="px-3 py-2 text-right">${row.linePrice}</td>
                  <td className="px-3 py-2 text-center">{row.taxable ? "T" : "E"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
