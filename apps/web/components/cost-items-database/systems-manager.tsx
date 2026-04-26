"use client";

import { useMemo, useState } from "react";

import { InventoryItemDrawer } from "@/components/catalog-manager/inventory-item-drawer";
import type {
  CatalogItem,
  CatalogItemFile,
  InventoryItem,
  InventoryTransaction,
  TaxCode,
  Vendor
} from "@floorconnector/types";

type SystemsManagerProps = {
  returnTo: string;
  inventoryEnabled: boolean;
  items: CatalogItem[];
  taxCodes: TaxCode[];
  inventoryItems: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  catalogItemFilesById: Record<string, CatalogItemFile[]>;
  vendors: Vendor[];
  saveItemAction: (formData: FormData) => void | Promise<void>;
  saveSystemComponentsAction: (formData: FormData) => void | Promise<void>;
  deleteCatalogItemFileAction: (formData: FormData) => void | Promise<void>;
};

export function SystemsManager({
  returnTo,
  inventoryEnabled,
  items,
  taxCodes,
  inventoryItems,
  inventoryTransactions,
  catalogItemFilesById,
  vendors,
  saveItemAction,
  saveSystemComponentsAction,
  deleteCatalogItemFileAction
}: SystemsManagerProps) {
  const [selectedSystem, setSelectedSystem] = useState<CatalogItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const systems = useMemo(
    () =>
      items
        .filter((item) => item.itemType === "system")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [items]
  );
  const linkedInventoryByCatalogItemId = useMemo(() => {
    const mapped = new Map<string, InventoryItem>();

    for (const inventoryItem of inventoryItems) {
      if (inventoryItem.catalogItemId) {
        mapped.set(inventoryItem.catalogItemId, inventoryItem);
      }
    }

    return mapped;
  }, [inventoryItems]);
  const transactionsByInventoryItemId = useMemo(() => {
    const mapped = new Map<string, InventoryTransaction[]>();

    for (const transaction of inventoryTransactions) {
      const existing = mapped.get(transaction.inventoryItemId) ?? [];
      existing.push(transaction);
      mapped.set(transaction.inventoryItemId, existing);
    }

    return mapped;
  }, [inventoryTransactions]);

  return (
    <div className="space-y-4">
      <section className="border border-[#dde3eb] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a889d]">
              Systems / packages
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reusable estimate templates stay on `catalog_items` and expand through
              `catalog_system_components`.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSystem(null);
              setDrawerOpen(true);
            }}
            className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Add system
          </button>
        </div>
      </section>

      <section className="border border-[#dde3eb] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e6ebf2] bg-[#f8fafc] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4 py-3">System</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Components</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => {
                const componentCount = Array.isArray(system.metadata.systemComponents)
                  ? system.metadata.systemComponents.length
                  : 0;

                return (
                  <tr key={system.id} className="border-b border-slate-200 text-sm text-slate-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{system.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {system.description ??
                          "Reusable system package ready for estimate expansion."}
                      </div>
                    </td>
                    <td className="px-4 py-3">{system.unit}</td>
                    <td className="px-4 py-3">{system.category ?? "Uncategorized"}</td>
                    <td className="px-4 py-3">{componentCount}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-[4px] border border-[#dde3eb] bg-[#f8fafc] px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                        {system.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSystem(system);
                          setDrawerOpen(true);
                        }}
                        className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {systems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No reusable systems or packages exist yet. Add a system here, save it,
                    then use the existing system builder to define sqft-based component rows.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <InventoryItemDrawer
        open={drawerOpen}
        item={selectedSystem}
        initialItemType="system"
        defaultTab="details"
        inventoryEnabled={inventoryEnabled}
        returnTo={returnTo}
        vendors={vendors}
        catalogItems={items}
        taxCodes={taxCodes}
        inventoryItem={selectedSystem ? linkedInventoryByCatalogItemId.get(selectedSystem.id) ?? null : null}
        inventoryTransactions={
          selectedSystem
            ? transactionsByInventoryItemId.get(
                linkedInventoryByCatalogItemId.get(selectedSystem.id)?.id ?? ""
              ) ?? []
            : []
        }
        existingFiles={selectedSystem ? catalogItemFilesById[selectedSystem.id] ?? [] : []}
        onClose={() => setDrawerOpen(false)}
        saveItemAction={saveItemAction}
        saveSystemComponentsAction={saveSystemComponentsAction}
        deleteCatalogItemFileAction={deleteCatalogItemFileAction}
      />
    </div>
  );
}
