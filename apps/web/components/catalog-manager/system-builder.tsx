"use client";

import { useMemo, useState, type FormEvent } from "react";
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

function isAddOnOptionCategory(category: string | null | undefined) {
  return (category ?? "").trim().toLowerCase() === "add-ons / options";
}

function getComponentOptionLabel(item: CatalogItem) {
  const classification = isAddOnOptionCategory(item.category)
    ? "Add-on / Option"
    : "Core Catalog Item";

  return `${item.name} (${item.itemType}${item.category ? ` / ${item.category}` : ""}) - ${classification}`;
}

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
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [previewSquareFootage, setPreviewSquareFootage] = useState("1000");
  const [previewLinearFootage, setPreviewLinearFootage] = useState("200");
  const [previewCount, setPreviewCount] = useState("1");
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
    const linearFootage = Number(previewLinearFootage);
    const count = Number(previewCount);

    if (
      !Number.isFinite(squareFootage) ||
      squareFootage <= 0 ||
      !Number.isFinite(linearFootage) ||
      linearFootage < 0 ||
      !Number.isFinite(count) ||
      count <= 0
    ) {
      return null;
    }

    const expanded = buildExpandedSystemPreview({
      systemCatalogItem: hydratedSystemItem,
      catalogItems,
      squareFootage,
      perimeter: linearFootage,
      count
    });

    return expanded.rows.length > 0 ? expanded : null;
  }, [catalogItems, hydratedSystemItem, previewCount, previewLinearFootage, previewSquareFootage]);

  function updateRow(
    key: string,
    field: keyof Omit<ComponentDraft, "key">,
    value: string | number
  ) {
    setValidationMessage(null);
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.key === key ? { ...row, [field]: value } : row
      )
    );
  }

  function addRow() {
    setValidationMessage(null);
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
    setValidationMessage(null);
    setRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows
            .filter((row) => row.key !== key)
            .map((row, index) => ({ ...row, sortOrder: index }))
    );
  }

  function moveRow(key: string, direction: -1 | 1) {
    setValidationMessage(null);
    setRows((currentRows) => {
      const index = currentRows.findIndex((row) => row.key === key);

      if (index < 0) {
        return currentRows;
      }

      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= currentRows.length) {
        return currentRows;
      }

      const reordered = [...currentRows];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(nextIndex, 0, moved);

      return reordered.map((row, rowIndex) => ({ ...row, sortOrder: rowIndex }));
    });
  }

  function findDuplicateComponentName(currentRows: ComponentDraft[]) {
    const seenComponentIds = new Set<string>();

    for (const row of currentRows) {
      const componentCatalogItemId = row.componentCatalogItemId.trim();

      if (!componentCatalogItemId) {
        continue;
      }

      if (seenComponentIds.has(componentCatalogItemId)) {
        return (
          componentOptions.find((item) => item.id === componentCatalogItemId)?.name ??
          "this component"
        );
      }

      seenComponentIds.add(componentCatalogItemId);
    }

    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const duplicateComponentName = findDuplicateComponentName(rows);

    if (!duplicateComponentName) {
      return;
    }

    event.preventDefault();
    setValidationMessage(
      `${duplicateComponentName} is already in this system. Each component item can only be added once.`
    );
  }

  return (
    <div className="space-y-4 rounded-[20px] border border-[#d8e0eb] bg-[#fbfcfe] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607492]">
            Systems Builder
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5f7190]">
            Core Catalog Items and Add-ons / Options both expand through the same estimate generation logic. Optional toggles are not stored on system components yet; classify add-ons with the Catalog Item category when they should read as optional scope.
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

      <form action={saveAction} onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="systemCatalogItemId" value={systemItem.id} />

        {validationMessage ? (
          <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
            {validationMessage}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[16px] border border-[#d8e0eb] bg-white">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#f6f8fc] text-left text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">
                <th className="px-3 py-3">Catalog Item</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Qty / Unit</th>
                <th className="px-3 py-3">Basis</th>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.key} className="border-t border-[#edf1f6] text-sm text-[#334a70]">
                  <td className="px-3 py-3">
                    {(() => {
                      const selectedItem =
                        componentOptions.find(
                          (item) => item.id === row.componentCatalogItemId
                        ) ?? null;

                      return (
                        <>
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
                          {getComponentOptionLabel(item)}
                        </option>
                      ))}
                    </select>
                          {selectedItem?.category ? (
                            <p className="mt-1 text-[11px] text-[#7a8aa3]">
                              Category: {selectedItem.category}
                            </p>
                          ) : null}
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const selectedItem =
                        componentOptions.find(
                          (item) => item.id === row.componentCatalogItemId
                        ) ?? null;
                      const isAddOn = isAddOnOptionCategory(selectedItem?.category);

                      return (
                        <span
                          className={[
                            "inline-flex rounded-[4px] border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
                            isAddOn
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-[#d7deea] bg-[#f6f8fc] text-[#607492]"
                          ].join(" ")}
                        >
                          {isAddOn ? "Add-on / Option" : "Core"}
                        </span>
                      );
                    })()}
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
                    <select
                      name="componentBasisUnit"
                      value={row.basisUnit}
                      onChange={(event) =>
                        updateRow(row.key, "basisUnit", event.target.value)
                      }
                      className="w-full rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
                    >
                      <option value="sqft">Area / sqft</option>
                      <option value="lf">Perimeter / LF</option>
                      <option value="count">Count / ea</option>
                      <option value="fixed">Fixed / project price</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveRow(row.key, -1)}
                        className="rounded-full border border-[#d7deea] px-3 py-2 text-xs font-medium text-[#28456f]"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(row.key, 1)}
                        className="rounded-full border border-[#d7deea] px-3 py-2 text-xs font-medium text-[#28456f]"
                      >
                        Down
                      </button>
                    </div>
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
            <label className="text-sm font-medium text-[#334a70]">
              Preview LF
              <input
                value={previewLinearFootage}
                onChange={(event) => setPreviewLinearFootage(event.target.value)}
                className="ml-3 w-[120px] rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
              />
            </label>
            <label className="text-sm font-medium text-[#334a70]">
              Count
              <input
                value={previewCount}
                onChange={(event) => setPreviewCount(event.target.value)}
                className="ml-3 w-[90px] rounded-[10px] border border-[#d7deea] bg-white px-3 py-2 text-sm text-[#334a70] outline-none"
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
                <th className="px-3 py-2">Catalog Item</th>
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
