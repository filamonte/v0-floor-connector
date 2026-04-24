import { InventoryManager } from "@/components/catalog-manager/inventory-manager";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import {
  listCatalogItems,
  listPlatformCatalogItemSeedsForOrganization
} from "@/lib/catalogs/data";
import { upsertEstimateContentBlockAction } from "@/lib/estimate-content-blocks/actions";
import { listEstimateContentBlocks } from "@/lib/estimate-content-blocks/data";
import {
  adoptPlatformCatalogItemSeedAction,
  updateOrganizationCatalogItemAction,
  updateOrganizationCatalogSystemComponentsAction
} from "@/lib/settings/actions";
import { listVendors } from "@/lib/vendors/data";

type MaterialsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function MaterialsPage({
  searchParams
}: MaterialsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [items, platformSeeds, vendors, contentBlocks] = await Promise.all([
    listCatalogItems(),
    listPlatformCatalogItemSeedsForOrganization(),
    listVendors(),
    listEstimateContentBlocks()
  ]);

  const materialItems = items.filter((item) => item.itemType === "material");
  const laborItems = items.filter((item) => item.itemType === "labor");
  const equipmentItems = items.filter((item) => item.itemType === "equipment");
  const systemItems = items.filter((item) => item.itemType === "system");
  const activeItems = items.filter((item) => item.status === "active");

  return (
    <ContractorWorkspacePage
      eyebrow="Cost Items Database"
      title="Shared inventory, item systems, and reusable pricing"
      description="This is the shared canonical inventory manager for materials, labor-like services, and reusable systems. Estimates and invoices source from this same catalog so record workspaces do not create detached item silos."
      summary={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">All items</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{items.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Active</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{activeItems.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Materials</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{materialItems.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Labor</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{laborItems.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Equipment</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{equipmentItems.length}</p>
          </div>
          <div className="border border-[#e2e7ef] bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#75859f]">Systems</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#17243b]">{systemItems.length}</p>
          </div>
        </div>
      }
      commandBar={{
        supportSlot: (
          <p>
            Inventory is now an active shared system. Estimate and invoice workspaces source live reusable items from this same catalog instead of building detached line-item databases.
          </p>
        )
      }}
    >
      {resolvedSearchParams.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <InventoryManager
        returnTo="/materials"
        items={items}
        platformSeeds={platformSeeds}
        vendors={vendors}
        contentBlocks={contentBlocks}
        saveItemAction={updateOrganizationCatalogItemAction}
        adoptSeedAction={adoptPlatformCatalogItemSeedAction}
        saveSystemComponentsAction={updateOrganizationCatalogSystemComponentsAction}
        saveContentBlockAction={upsertEstimateContentBlockAction}
      />
    </ContractorWorkspacePage>
  );
}
