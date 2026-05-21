import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import { InventoryManager } from "@/components/catalog-manager/inventory-manager";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import { getCostItemsManagerData } from "@/lib/cost-items-database/module-data";
import {
  deleteOrganizationCatalogItemFileAction,
  updateOrganizationCatalogItemAction,
  updateOrganizationCatalogSystemComponentsAction
} from "@/lib/settings/actions";
import { upsertEstimateContentBlockAction } from "@/lib/estimate-content-blocks/actions";

export default async function CostItemsInventoryPage() {
  const data = await getCostItemsManagerData("/cost-items-database/inventory");
  const trackedInventory = data.inventoryItems.filter(
    (item) => item.status === "active" && item.catalogItemId
  );
  const lowStockItems = trackedInventory.filter(
    (item) => Number(item.currentQuantity) <= Number(item.reorderPoint)
  );

  return (
    <ContractorWorkspacePage
      eyebrow="Financials module"
      title="Inventory"
      description="Review tracked stock tied to catalog items without leaving the shared Cost Items workspace."
      summary={
        <div className="rounded-2xl border border-[#e3d6c7] bg-[#fff8ef] px-4 py-3 text-sm leading-6 text-[#665446]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
            Inventory status
          </p>
          <p className="mt-2">
            {trackedInventory.length} tracked rows and {lowStockItems.length} low-stock records are currently visible.
          </p>
        </div>
      }
      commandBar={{
        supportSlot:
          "Inventory remains an operational extension of Cost Items Database. Enablement and defaults stay under Cost Items & Inventory Settings."
      }}
    >
      <WorkspaceSummaryBand
        items={[
          {
            key: "purpose",
            label: "Purpose",
            content:
              "Use this view to review on-hand quantities, reorder thresholds, and item-level stock conditions through the same item drawer used by the rest of the module."
          }
        ]}
      />
      <InventoryManager
        returnTo="/cost-items-database/inventory"
        inventoryEnabled={data.inventoryEnabled}
        items={data.items}
        taxCodes={data.taxCodes}
        inventoryItems={data.inventoryItems}
        inventoryTransactions={data.inventoryTransactions}
        catalogItemFilesById={data.catalogItemFilesById}
        vendors={data.vendors}
        contentBlocks={data.contentBlocks}
        saveItemAction={updateOrganizationCatalogItemAction}
        saveSystemComponentsAction={updateOrganizationCatalogSystemComponentsAction}
        saveContentBlockAction={upsertEstimateContentBlockAction}
        deleteCatalogItemFileAction={deleteOrganizationCatalogItemFileAction}
        initialSidebarView="materials"
        lockedSidebarView="materials"
        inventoryView="tracked"
        defaultDrawerTab="inventory"
      />
    </ContractorWorkspacePage>
  );
}
