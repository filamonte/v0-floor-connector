import { InventoryManager } from "@/components/catalog-manager/inventory-manager";
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

  return (
    <div className="h-full">
      {resolvedSearchParams.error ? (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-[13px] text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] text-emerald-800">
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
    </div>
  );
}
