import { CatalogItemSettingsCard } from "@/components/catalog-item-settings-card";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  listCatalogItems,
  listPlatformCatalogItemSeedsForOrganization
} from "@/lib/catalogs/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsCatalogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [items, platformSeeds] = await Promise.all([
    listCatalogItems(),
    listPlatformCatalogItemSeedsForOrganization()
  ]);

  const materialItems = items.filter((item) => item.itemType === "material");
  const serviceItems = items.filter((item) => item.itemType === "service");
  const systemItems = items.filter((item) => item.itemType === "system");

  const materialSeeds = platformSeeds.filter(
    (seed) =>
      seed.itemType === "material" &&
      !materialItems.some((item) => item.sourceSeedId === seed.id)
  );
  const serviceSeeds = platformSeeds.filter(
    (seed) =>
      seed.itemType === "service" &&
      !serviceItems.some((item) => item.sourceSeedId === seed.id)
  );
  const systemSeeds = platformSeeds.filter(
    (seed) =>
      seed.itemType === "system" &&
      !systemItems.some((item) => item.sourceSeedId === seed.id)
  );

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
        <div className="space-y-6">
          <CatalogItemSettingsCard
            itemType="material"
            items={materialItems}
            availableSeeds={materialSeeds}
          />
          <CatalogItemSettingsCard
            itemType="service"
            items={serviceItems}
            availableSeeds={serviceSeeds}
          />
          <CatalogItemSettingsCard
            itemType="system"
            items={systemItems}
            availableSeeds={systemSeeds}
          />
        </div>
      </SettingsSectionCard>
    </div>
  );
}
