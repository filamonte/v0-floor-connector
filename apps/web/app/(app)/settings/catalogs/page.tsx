import { InventoryManager } from "@/components/catalog-manager/inventory-manager";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
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

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsCatalogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [items, platformSeeds, vendors, contentBlocks] = await Promise.all([
    listCatalogItems(),
    listPlatformCatalogItemSeedsForOrganization(),
    listVendors(),
    listEstimateContentBlocks()
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Catalogs"
        title="Manage reusable organization-owned master data"
        description="Starter items can be adopted from platform defaults, but organizations own the reusable copies after adoption. These records stay tenant-scoped so future estimate, invoice, and job workflows can reuse them safely."
      >
        <InventoryManager
          returnTo="/settings/catalogs"
          items={items}
          platformSeeds={platformSeeds}
          vendors={vendors}
          contentBlocks={contentBlocks}
          saveItemAction={updateOrganizationCatalogItemAction}
          adoptSeedAction={adoptPlatformCatalogItemSeedAction}
          saveSystemComponentsAction={updateOrganizationCatalogSystemComponentsAction}
          saveContentBlockAction={upsertEstimateContentBlockAction}
        />
      </SettingsSectionCard>
    </div>
  );
}
