import Link from "next/link";

import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import type { CatalogItem, PlatformCatalogItemSeed } from "@floorconnector/types";

import { INVENTORY_ENABLED_FEATURE_POLICY } from "@/lib/organizations/module-settings";
import {
  adoptPlatformCatalogItemSeedAction,
  updateOrganizationFeatureOverrideAction
} from "@/lib/settings/actions";

type CostItemsSettingsContentProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
  inventoryState: {
    platformEnabled: boolean;
    organizationEnabled: boolean | null;
    effectiveEnabled: boolean;
  };
  catalogItems: CatalogItem[];
  platformSeeds: PlatformCatalogItemSeed[];
  returnPath: string;
};

export function CostItemsSettingsContent({
  searchParams,
  inventoryState,
  catalogItems,
  platformSeeds,
  returnPath
}: CostItemsSettingsContentProps) {
  const categoryDefaults = [
    ...new Set(catalogItems.flatMap((item) => (item.category ? [item.category] : [])))
  ].sort((left, right) => left.localeCompare(right));
  const defaultItems = catalogItems.filter((item) => item.isDefault);
  const availableSeeds = platformSeeds.filter(
    (seed) => !catalogItems.some((item) => item.sourceSeedId === seed.id)
  );

  return (
    <div className="space-y-4">
      <SettingsFeedback error={searchParams?.error} message={searchParams?.message} />

      <div className="flex justify-end">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cost-items-database"
            className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open Cost Items Database
          </Link>
          <Link
            href="/settings/financial"
            className="inline-flex items-center rounded-[4px] border border-[#dde3eb] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open Financial Settings
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <DetailPanel
          title="Inventory Tracking"
          description="Inventory remains an optional operational extension of Cost Items Database. Disabling it hides inventory controls without deleting linked stock records or transaction history."
        >
          <form action={updateOrganizationFeatureOverrideAction} className="space-y-4">
            <input type="hidden" name="returnTo" value={returnPath} />
            <input type="hidden" name="key" value={INVENTORY_ENABLED_FEATURE_POLICY.key} />
            <input type="hidden" name="name" value={INVENTORY_ENABLED_FEATURE_POLICY.name} />
            <input
              type="hidden"
              name="description"
              value={INVENTORY_ENABLED_FEATURE_POLICY.description}
            />
            <input
              type="hidden"
              name="moduleKey"
              value={INVENTORY_ENABLED_FEATURE_POLICY.moduleKey}
            />
            <input
              type="hidden"
              name="surface"
              value={INVENTORY_ENABLED_FEATURE_POLICY.surface}
            />

            <label className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={inventoryState.effectiveEnabled}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
              />
              <span className="text-sm leading-6 text-slate-700">
                Enable inventory tracking for this organization.
              </span>
            </label>

            <div className="border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
              <p>Platform default: {inventoryState.platformEnabled ? "enabled" : "disabled"}</p>
              <p>
                Organization override:{" "}
                {inventoryState.organizationEnabled == null
                  ? "inherit platform default"
                  : inventoryState.organizationEnabled
                    ? "enabled"
                    : "disabled"}
              </p>
              <p>Effective state: {inventoryState.effectiveEnabled ? "enabled" : "disabled"}</p>
            </div>

            <button
              type="submit"
              className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
            >
              Save inventory setting
            </button>
          </form>
        </DetailPanel>

        <SettingsSectionCard
          eyebrow="Module Scope"
          title="How Cost Items and Inventory work"
          description="Cost Items Database is always available. Inventory turns the same catalog item master into an operational stock workflow without changing estimate or invoice pricing."
        >
          <div className="space-y-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            <p>`catalog_items` remain the reusable commercial source of truth.</p>
            <p>`inventory_items` and `inventory_transactions` stay operational only.</p>
            <p>Disabling inventory preserves existing quantities and history.</p>
          </div>
        </SettingsSectionCard>
      </div>

      <DetailPanel
        title="Financial Settings Handoff"
        description="Tax behavior, tax rates, and tax-code management now live under Financial Settings. Cost Items settings stay focused on catalog and inventory configuration."
      >
        <div className="space-y-3">
          <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            <p>Item-level operational screens still use the taxable checkbox.</p>
            <p>Organization tax behavior and reusable tax codes are managed in Financial Settings.</p>
          </div>

          <Link
            href="/settings/financial"
            className="inline-flex items-center rounded-[4px] border border-[#233a64] bg-[#233a64] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1b2d4d]"
          >
            Go to Financial Settings
          </Link>
        </div>
      </DetailPanel>

      <div className="grid gap-4 xl:grid-cols-3">
        <SettingsSectionCard
          eyebrow="Category Defaults"
          title="Current reusable categories"
          description="Categories are currently driven by live cost items so the shared master stays canonical. This pass keeps category defaults lightweight and schema-safe."
        >
          <div className="flex flex-wrap gap-2">
            {categoryDefaults.length > 0 ? (
              categoryDefaults.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-[4px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm text-slate-700"
                >
                  {category}
                </span>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-600">
                Categories will appear here as cost items are organized.
              </p>
            )}
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Markup Defaults"
          title="Current default item patterns"
          description="Markup remains item-driven. Default starter items continue to define the baseline without introducing a second contractor settings table."
        >
          <div className="space-y-2 text-sm leading-6 text-slate-600">
            <p>
              {defaultItems.length} default cost item pattern
              {defaultItems.length === 1 ? "" : "s"} are active.
            </p>
            <p>Visible and hidden markup still live on each reusable catalog item.</p>
            <p>No pricing engine changes are introduced in this pass.</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          eyebrow="Import / Export"
          title="Import / Export"
          description="Import, export, and count-sheet workflows stay configured from settings while the working database remains focused on daily item and inventory operations."
        >
          <div className="space-y-2 text-sm leading-6 text-slate-600">
            <p>CSV import planning placeholder</p>
            <p>Catalog export planning placeholder</p>
            <p>Inventory count-sheet export placeholder</p>
            <p>Shared settings route: {returnPath}</p>
          </div>
        </SettingsSectionCard>
      </div>

      <SettingsSectionCard
        eyebrow="Starter Catalogs"
        title="Platform starter items"
        description="Platform-managed starter items can be adopted into this organization from settings instead of the operational workspace."
      >
        {availableSeeds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableSeeds.map((seed) => (
              <form key={seed.id} action={adoptPlatformCatalogItemSeedAction}>
                <input type="hidden" name="returnTo" value={returnPath} />
                <input type="hidden" name="seedId" value={seed.id} />
                <button
                  type="submit"
                  className="rounded-[4px] border border-[#d6deea] bg-white px-3 py-1.5 text-xs font-medium text-[#36527a]"
                >
                  Adopt {seed.name}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-600">
            All currently available starter items have already been adopted.
          </p>
        )}
      </SettingsSectionCard>
    </div>
  );
}
