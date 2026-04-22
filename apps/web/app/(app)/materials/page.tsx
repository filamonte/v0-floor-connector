import { CatalogItemSettingsCard } from "@/components/catalog-item-settings-card";
import { ContractorWorkspacePage } from "@/components/contractor-workspace-page";
import {
  listCatalogItems,
  listPlatformCatalogItemSeedsForOrganization
} from "@/lib/catalogs/data";

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
  const [items, platformSeeds] = await Promise.all([
    listCatalogItems(),
    listPlatformCatalogItemSeedsForOrganization()
  ]);

  const materialItems = items.filter((item) => item.itemType === "material");
  const serviceItems = items.filter((item) => item.itemType === "service");
  const systemItems = items.filter((item) => item.itemType === "system");
  const activeItems = items.filter((item) => item.status === "active");

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
    </ContractorWorkspacePage>
  );
}
