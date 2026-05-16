import type {
  CatalogItem,
  PlatformCatalogItemSeed
} from "@floorconnector/types";

import {
  adoptPlatformCatalogItemSeedAction,
  updateOrganizationCatalogItemAction
} from "@/lib/settings/actions";

type CatalogItemSettingsCardProps = {
  itemType: CatalogItem["itemType"];
  items: CatalogItem[];
  availableSeeds: PlatformCatalogItemSeed[];
};

const settingsPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-sm";
const settingsInsetClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4";
const settingsFieldClassName =
  "w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--graphite)] focus:ring-2 focus:ring-[var(--focus-ring)]";
const settingsPrimaryActionClassName =
  "inline-flex items-center rounded-[4px] border border-[var(--graphite)] bg-[var(--graphite)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--graphite-light)]";
const settingsSecondaryActionClassName =
  "inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]";

function getLabel(itemType: CatalogItem["itemType"]) {
  switch (itemType) {
    case "material":
      return "Materials";
    case "labor":
      return "Labor";
    case "service":
      return "Services";
    case "equipment":
      return "Equipment";
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
    case "labor":
      return "Reusable labor cost and sell-rate defaults for estimating and job costing.";
    case "service":
      return "Labor, prep, mobilization, and other repeatable service line defaults.";
    case "equipment":
      return "Reusable equipment and machine-rate defaults that can be priced into estimates.";
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
    <section className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] p-5 sm:p-6">
      <div>
        <p className="text-base font-semibold text-slate-950">
          {getLabel(itemType)}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getDescription(itemType)}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <form
            key={item.id}
            action={updateOrganizationCatalogItemAction}
            className={settingsPanelClassName}
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
                  className={settingsFieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={item.status}
                  className={settingsFieldClassName}
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
                  className={settingsFieldClassName}
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
                  defaultValue={item.defaultUnitCost}
                  required
                  className={settingsFieldClassName}
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
                  defaultValue={item.defaultUnitPrice ?? ""}
                  className={settingsFieldClassName}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Category
                </span>
                <input
                  name="category"
                  defaultValue={item.category ?? ""}
                  className={settingsFieldClassName}
                />
              </label>
              <label
                className={`flex items-start gap-3 ${settingsInsetClassName}`}
              >
                <input
                  type="checkbox"
                  name="taxable"
                  defaultChecked={item.taxable}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Taxable by default
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Estimates and invoices derive tax from this flag together
                    with org defaults and customer exemption.
                  </span>
                </span>
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
                className={settingsFieldClassName}
              />
            </label>

            <label
              className={`mt-4 flex items-start gap-3 ${settingsInsetClassName}`}
            >
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
                  Default reusable items can be surfaced in future estimate and
                  invoice composition flows.
                </span>
              </span>
            </label>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-slate-500">
                Stored as an organization-owned reusable item.
              </p>
              <button type="submit" className={settingsPrimaryActionClassName}>
                Save item
              </button>
            </div>
          </form>
        ))}

        <form
          action={updateOrganizationCatalogItemAction}
          className="rounded-lg border border-dashed border-[var(--border-warm)] bg-white px-5 py-5"
        >
          <input type="hidden" name="itemType" value={itemType} />
          <p className="text-sm font-semibold text-slate-950">
            Add organization item
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              placeholder={`${getLabel(itemType).slice(0, -1)} name`}
              required
              className={settingsFieldClassName}
            />
            <input
              name="unit"
              placeholder="Unit"
              required
              className={settingsFieldClassName}
            />
            <input
              name="defaultUnitPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
              className={settingsFieldClassName}
            />
            <input
              name="defaultUnitCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
              className={settingsFieldClassName}
            />
            <select
              name="status"
              defaultValue="active"
              className={settingsFieldClassName}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <textarea
            name="description"
            rows={3}
            placeholder="Description"
            className={`mt-4 ${settingsFieldClassName}`}
          />
          <input
            name="category"
            placeholder="Category"
            className={`mt-4 ${settingsFieldClassName}`}
          />
          <label
            className={`mt-4 flex items-start gap-3 ${settingsInsetClassName}`}
          >
            <input
              type="checkbox"
              name="taxable"
              defaultChecked
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm text-slate-700">Taxable by default</span>
          </label>
          <label
            className={`mt-4 flex items-start gap-3 ${settingsInsetClassName}`}
          >
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
            className={`mt-5 ${settingsSecondaryActionClassName}`}
          >
            Create item
          </button>
        </form>

        {availableSeeds.length > 0 ? (
          <div className={settingsPanelClassName}>
            <p className="text-sm font-semibold text-slate-950">
              Available platform starter items
            </p>
            <div className="mt-4 grid gap-3">
              {availableSeeds.map((seed) => (
                <form
                  key={seed.id}
                  action={adoptPlatformCatalogItemSeedAction}
                  className={`flex flex-col gap-3 ${settingsInsetClassName} sm:flex-row sm:items-center sm:justify-between`}
                >
                  <input type="hidden" name="seedId" value={seed.id} />
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      {seed.name}{" "}
                      <span className="text-slate-500">- {seed.unit}</span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {seed.description ?? "Platform starter item"} - $
                      {seed.defaultUnitPrice}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className={settingsSecondaryActionClassName}
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
