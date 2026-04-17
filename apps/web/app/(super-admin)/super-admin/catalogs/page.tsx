import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { upsertPlatformCatalogSeedAction } from "@/lib/platform-admin/actions";
import { listPlatformCatalogItemSeeds } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function PlatformCatalogsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const seeds = await listPlatformCatalogItemSeeds();

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Starter Catalogs"
        title="Manage platform reusable item seeds"
        description="Platform catalog seeds define reusable materials, services, and systems tenants can adopt into organization-owned master data."
      >
        <div className="space-y-4">
          {seeds.map((seed) => (
            <form
              key={seed.id}
              action={upsertPlatformCatalogSeedAction}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
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
                    Default unit price
                  </span>
                  <input
                    name="defaultUnitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={seed.defaultUnitPrice}
                    required
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

              <button
                type="submit"
                className="mt-5 inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Save starter item
              </button>
            </form>
          ))}

          <form
            action={upsertPlatformCatalogSeedAction}
            className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-5"
          >
            <p className="text-sm font-semibold text-slate-950">Add platform starter item</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <select
                name="itemType"
                defaultValue="material"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="material">Material</option>
                <option value="service">Service</option>
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
            <div className="mt-4 grid gap-3 md:grid-cols-2">
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
            <button
              type="submit"
              className="mt-5 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Create starter item
            </button>
          </form>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
