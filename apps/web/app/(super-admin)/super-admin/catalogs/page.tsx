import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import {
  FutureCapabilityPanel,
  SuperAdminTopTabs
} from "@/components/super-admin-console";
import { upsertPlatformCatalogSeedAction } from "@/lib/platform-admin/actions";
import { listPlatformCatalogItemSeeds } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getCatalogTypeLabel(itemType: string) {
  switch (itemType) {
    case "labor":
      return "Labor";
    case "equipment":
      return "Equipment";
    default:
      return `${itemType[0]?.toUpperCase() ?? ""}${itemType.slice(1)}s`;
  }
}

export default async function PlatformCatalogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const seeds = await listPlatformCatalogItemSeeds();
  const seedTypes = ["material", "labor", "service", "equipment", "system"] as const;

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SuperAdminTopTabs
        tabs={[
          ...seedTypes.map((itemType) => ({
            href: `#${itemType}-seeds`,
            label: getCatalogTypeLabel(itemType),
            description: "Platform starter catalog seeds"
          })),
          {
            href: "#starter-packs",
            label: "Starter packs",
            description: "Future non-functional placeholder"
          }
        ]}
      />

      <SettingsSectionCard
        eyebrow="Starter Catalog Items"
        title="Manage platform Catalog Item and System seeds"
        description="Platform starter seeds define reusable Catalog Items, Systems, Add-ons / Options, and default categories tenants can adopt into organization-owned catalog records."
        tone="neutral"
      >
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {seedTypes.map((itemType) => {
              const count = seeds.filter((seed) => seed.itemType === itemType).length;

              return (
                <div
                  key={itemType}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold capitalize text-slate-950">
                    {getCatalogTypeLabel(itemType)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {count} platform seed{count === 1 ? "" : "s"} available for adoption.
                  </p>
                </div>
              );
            })}
          </div>

          {seedTypes.map((itemType) => {
            const typeSeeds = seeds.filter((seed) => seed.itemType === itemType);

            return (
              <section
                key={itemType}
                id={`${itemType}-seeds`}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold capitalize text-slate-950">
                      {getCatalogTypeLabel(itemType)} starter seeds
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Platform-owned starting values. Adopted records become contractor-owned catalog items.
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {typeSeeds.length} seed{typeSeeds.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {typeSeeds.map((seed) => (
                    <SaveStateForm
                      key={seed.id}
                      action={upsertPlatformCatalogSeedAction}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
                      pendingLabel="Saving..."
                    >
                      <input type="hidden" name="seedId" value={seed.id} />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {seed.itemType}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {seed.seedKey}
                        </span>
                        {seed.isDefault ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            Default
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input type="hidden" name="itemType" value={seed.itemType} />
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">Name</span>
                          <input
                            name="name"
                            defaultValue={seed.name}
                            required
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">Seed key</span>
                          <input
                            name="seedKey"
                            defaultValue={seed.seedKey}
                            required
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">Unit</span>
                          <input
                            name="unit"
                            defaultValue={seed.unit}
                            required
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">
                            Default unit cost
                          </span>
                          <input
                            name="defaultUnitCost"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={seed.defaultUnitCost}
                            required
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-slate-800">
                            Default unit price
                          </span>
                          <input
                            name="defaultUnitPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={seed.defaultUnitPrice ?? ""}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                          />
                        </label>
                      </div>

                      <textarea
                        name="description"
                        defaultValue={seed.description ?? ""}
                        rows={3}
                        className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                      />

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <input
                          name="category"
                          defaultValue={seed.category ?? ""}
                          placeholder="Category"
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                        />
                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <input
                            type="checkbox"
                            name="taxable"
                            defaultChecked={seed.taxable}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                          />
                          <span className="text-sm text-slate-700">Taxable by default</span>
                        </label>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <input
                            type="checkbox"
                            name="isDefault"
                            defaultChecked={seed.isDefault}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                          />
                          <span className="text-sm text-slate-700">Use as default starter for this item type</span>
                        </label>
                        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={seed.isActive}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                          />
                          <span className="text-sm text-slate-700">Allow organizations to adopt this starter item</span>
                        </label>
                      </div>

                      <SaveStateSubmitButton
                        submitLabel="Save starter item"
                        pendingLabel="Saving..."
                        className="mt-5 rounded-full"
                      />
                    </SaveStateForm>
                  ))}
                </div>
              </section>
            );
          })}

          <SaveStateForm
            action={upsertPlatformCatalogSeedAction}
            className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-5"
            pendingLabel="Saving..."
          >
            <p className="text-sm font-semibold text-slate-950">Add platform starter item</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <select
                name="itemType"
                defaultValue="material"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="material">Material</option>
                <option value="labor">Labor</option>
                <option value="service">Service</option>
                <option value="equipment">Equipment</option>
                <option value="system">System</option>
              </select>
              <input
                name="seedKey"
                placeholder="starter-key"
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
              <input
                name="name"
                placeholder="Starter item name"
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
              <input
                name="unit"
                placeholder="Unit"
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
              <input
                name="defaultUnitCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
              <input
                name="defaultUnitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <textarea
              name="description"
              rows={3}
              placeholder="Description"
              className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <input
              name="category"
              placeholder="Category"
              className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="taxable"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span className="text-sm text-slate-700">Taxable by default</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span className="text-sm text-slate-700">Set as default starter for this type</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span className="text-sm text-slate-700">Allow adoption immediately</span>
              </label>
            </div>
            <SaveStateSubmitButton
              submitLabel="Create starter item"
              pendingLabel="Saving..."
              variant="secondary"
              className="mt-5 rounded-full"
            />
          </SaveStateForm>
        </div>
      </SettingsSectionCard>

      <div id="starter-packs" className="grid gap-4 lg:grid-cols-2">
        <FutureCapabilityPanel title="Starter packs">
          Starter packs now exist as platform-governed bundles over existing
          template and catalog seeds. Manage them from Super Admin Templates;
          they remain inspectable only and do not provision tenant-owned catalog
          items or change catalog adoption behavior.
        </FutureCapabilityPanel>
        <FutureCapabilityPanel title="Contractor groups">
          Contractor-group targeting remains a future capability. Current starter
          items stay platform-owned seeds that contractors may adopt into their
          own catalog records.
        </FutureCapabilityPanel>
      </div>
    </div>
  );
}
