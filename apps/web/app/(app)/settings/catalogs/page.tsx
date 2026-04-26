import { CostItemsSettingsContent } from "@/components/cost-items-database/settings-content";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { getCostItemsSettingsData } from "@/lib/cost-items-database/module-data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsCatalogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getCostItemsSettingsData("/settings/catalogs");

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        eyebrow="Catalog Settings"
        title="Cost Items & Inventory Settings"
        description="Configure inventory defaults, starter catalog options, and organization-wide catalog settings. Daily item and inventory work stays in Cost Items Database."
      >
        <CostItemsSettingsContent
          searchParams={resolvedSearchParams}
          inventoryState={data.inventoryState}
          catalogItems={data.catalogItems}
          platformSeeds={data.platformSeeds}
          returnPath="/settings/catalogs"
        />
      </SettingsSectionCard>
    </div>
  );
}
