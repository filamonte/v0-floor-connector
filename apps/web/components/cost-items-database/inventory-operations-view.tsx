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

type InventoryOperationsViewProps = {
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

export function InventoryOperationsView({
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
}: InventoryOperationsViewProps) {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const trackedRows = useMemo(() => {
    return inventoryItems
      .filter((inventoryItem) => inventoryItem.status === "active" && inventoryItem.catalogItemId)
      .map((inventoryItem) => {
        const catalogItem = items.find((item) => item.id === inventoryItem.catalogItemId) ?? null;
        const transactions = inventoryTransactions.filter(
          (transaction) => transaction.inventoryItemId === inventoryItem.id
        );

        return {
          inventoryItem,
          catalogItem,
          recentTransactions: transactions.slice(0, 3),
          isLowStock:
            Number(inventoryItem.currentQuantity) <= Number(inventoryItem.reorderPoint)
        };
      })
      .sort((left, right) => {
        const leftName = left.catalogItem?.name ?? left.inventoryItem.name;
        const rightName = right.catalogItem?.name ?? right.inventoryItem.name;
        return leftName.localeCompare(rightName);
      });
  }, [inventoryItems, inventoryTransactions, items]);

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

  if (!inventoryEnabled) {
    return (
      <section className="border border-dashed border-[#d8caba] bg-white px-5 py-6 text-sm leading-6 text-slate-600">
        Inventory tracking is currently disabled for this organization. Existing linked
        inventory data is preserved, and the inventory route will become operational
        again as soon as the module setting is re-enabled.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <SummaryStrip label="Tracked items" value={trackedRows.length} />
        <SummaryStrip
          label="Low stock"
          value={trackedRows.filter((row) => row.isLowStock).length}
        />
        <SummaryStrip label="Recent adjustments" value={inventoryTransactions.length} />
      </section>

      <section className="border border-[#d6d6d6] bg-white">
        <div className="border-b border-[#e5e5e5] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Inventory operations
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Inventory stays attached to cost items, uses inventory transactions for
            quantity changes, and never affects estimate or invoice pricing.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f8f8f8] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">On hand</th>
                <th className="px-4 py-3">Reorder point</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Low stock</th>
                <th className="px-4 py-3">Recent adjustments</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {trackedRows.map((row) => (
                <tr key={row.inventoryItem.id} className="border-b border-slate-200 text-sm text-slate-700">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {row.catalogItem?.name ?? row.inventoryItem.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {row.catalogItem?.sku ?? row.inventoryItem.sku ?? "No SKU"} -{" "}
                      {row.catalogItem?.category ?? row.inventoryItem.category ?? "Uncategorized"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {Number(row.inventoryItem.currentQuantity).toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    {Number(row.inventoryItem.reorderPoint).toFixed(4)}
                  </td>
                  <td className="px-4 py-3">{row.inventoryItem.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-[4px] px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                        row.isLowStock
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-800"
                      ].join(" ")}
                    >
                      {row.isLowStock ? "Low" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 text-xs text-slate-500">
                      {row.recentTransactions.length > 0 ? (
                        row.recentTransactions.map((transaction) => (
                          <div key={transaction.id}>
                            {transaction.transactionType} - {transaction.quantityChange}
                          </div>
                        ))
                      ) : (
                        <div>No recent adjustments</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={!row.catalogItem}
                      onClick={() => {
                        setSelectedItem(row.catalogItem);
                        setDrawerOpen(true);
                      }}
                      className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {row.catalogItem ? "Adjust" : "Missing item"}
                    </button>
                  </td>
                </tr>
              ))}
              {trackedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No linked inventory items exist yet. Turn on tracking for a material
                    cost item to start recording stock.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <InventoryItemDrawer
        open={drawerOpen}
        item={selectedItem}
        initialItemType={selectedItem?.itemType ?? "material"}
        defaultTab="inventory"
        inventoryEnabled={inventoryEnabled}
        returnTo={returnTo}
        vendors={vendors}
        catalogItems={items}
        taxCodes={taxCodes}
        inventoryItem={selectedItem ? linkedInventoryByCatalogItemId.get(selectedItem.id) ?? null : null}
        inventoryTransactions={
          selectedItem
            ? transactionsByInventoryItemId.get(
                linkedInventoryByCatalogItemId.get(selectedItem.id)?.id ?? ""
              ) ?? []
            : []
        }
        existingFiles={selectedItem ? catalogItemFilesById[selectedItem.id] ?? [] : []}
        onClose={() => setDrawerOpen(false)}
        saveItemAction={saveItemAction}
        saveSystemComponentsAction={saveSystemComponentsAction}
        deleteCatalogItemFileAction={deleteCatalogItemFileAction}
      />
    </div>
  );
}

function SummaryStrip({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#d6d6d6] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#171717]">{value}</p>
    </div>
  );
}
