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

export default async function CostItemsSystemsPage() {
  const data = await getCostItemsManagerData("/cost-items-database/systems");
  const systemItems = data.items.filter(
    (item) => item.status === "active" && item.itemType === "system"
  );

  return (
    <ContractorWorkspacePage
      eyebrow="Financials module"
      title="Systems and Packages"
      description="Manage reusable systems and package assemblies from the same Cost Items workspace and drawer flow."
      summary={
        <div className="rounded-2xl border border-[#e3d6c7] bg-[#fff8ef] px-4 py-3 text-sm leading-6 text-[#665446]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a4581a]">
            System status
          </p>
          <p className="mt-2">{systemItems.length} active systems are available for reusable assembly work.</p>
        </div>
      }
      commandBar={{
        supportSlot:
          "Systems stay operational here. Configuration defaults and starter adoption remain under Cost Items & Inventory Settings."
      }}
    >
      <WorkspaceSummaryBand
        items={[
          {
            key: "purpose",
            label: "Purpose",
            content:
              "Use this route to maintain reusable systems and package rows that feed the shared catalog and estimate workflows without creating a separate subsystem."
          }
        ]}
      />
      <InventoryManager
        returnTo="/cost-items-database/systems"
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
        initialSidebarView="systems"
        lockedSidebarView="systems"
      />
    </ContractorWorkspacePage>
  );
}
