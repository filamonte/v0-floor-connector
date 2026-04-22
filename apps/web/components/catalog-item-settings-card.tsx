import type { CatalogItem, PlatformCatalogItemSeed } from "@floorconnector/types";

import {
  adoptPlatformCatalogItemSeedAction,
  updateOrganizationCatalogItemAction
} from "@/lib/settings/actions";

type CatalogItemSettingsCardProps = {
  itemType: CatalogItem["itemType"];
  items: CatalogItem[];
  availableSeeds: PlatformCatalogItemSeed[];
};

function getLabel(itemType: CatalogItem["itemType"]) {
  switch (itemType) {
    case "material":
      return "Materials";
    case "service":
      return "Services";
    case "system":
      return "Systems";
    default:
      return "Catalog";
  }
}

function getDescription(itemType: CatalogItem["itemType"]) {
  switch (itemType) {
    case "material":
      return "Reusable consumables and stock-based defaults for estimating and invoicing.";
    case "service":
      return "Labor, prep, mobilization, and other repeatable service line defaults.";
    case "system":
      return "Whole flooring systems or bundled scope defaults that organizations reuse.";
    default:
      return "Reusable starter records for contractor document workflows.";
  }
}

export function CatalogItemSettingsCard({
  itemType,
  items,
  availableSeeds
}: CatalogItemSettingsCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div>
        <p className="text-base font-semibold text-slate-950">{getLabel(itemType)}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getDescription(itemType)}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <form
            key={item.id}
            action={updateOrganizationCatalogItemAction}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
          >
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="itemType" value={item.itemType} />

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {item.sourceSeedKey ? "Adopted seed" : "Organization item"}
              </span>
              {item.isDefault ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Default
                </span>
              ) : null}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {item.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Item name
                </span>
                <input
                  name="name"
                  defaultValue={item.name}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={item.status}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Unit
                </span>
                <input
                  name="unit"
                  defaultValue={item.unit}
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
                  defaultValue={item.defaultUnitPrice}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Description
              </span>
              <textarea
                name="description"
                defaultValue={item.description ?? ""}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={item.isDefault}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Use as the default {itemType} item
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Default reusable items can be surfaced in future estimate and invoice composition flows.
                </span>
              </span>
            </label>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-slate-500">
                Stored as an organization-owned reusable item.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
              >
                Save item
              </button>
            </div>
          </form>
        ))}

        <form
          action={updateOrganizationCatalogItemAction}
          className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-5"
        >
          <input type="hidden" name="itemType" value={itemType} />
          <p className="text-sm font-semibold text-slate-950">Add organization item</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder={`${getLabel(itemType).slice(0, -1)} name`}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <input
              name="unit"
              placeholder="Unit"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <input
              name="defaultUnitPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <select
              name="status"
              defaultValue="active"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <textarea
            name="description"
            rows={3}
            placeholder="Description"
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="isDefault"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm text-slate-700">
              Set as this organization&apos;s default {itemType} starter item
            </span>
          </label>
          <button
            type="submit"
            className="mt-5 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            Create item
          </button>
        </form>

        {availableSeeds.length > 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-950">Available platform starter items</p>
            <div className="mt-4 grid gap-3">
              {availableSeeds.map((seed) => (
                <form
                  key={seed.id}
                  action={adoptPlatformCatalogItemSeedAction}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <input type="hidden" name="seedId" value={seed.id} />
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      {seed.name} <span className="text-slate-500">- {seed.unit}</span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {seed.description ?? "Platform starter item"} - ${seed.defaultUnitPrice}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    Adopt seed
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
