import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { listTaxCodes } from "@/lib/catalogs/data";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import {
  updateOrganizationFinancialSettingsAction,
  updateTaxCodeAction
} from "@/lib/settings/actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

export default async function SettingsFinancialPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/financial");
  const [financialSettings, taxCodes] = await Promise.all([
    getOrganizationFinancialSettings(scope.organizationId),
    listTaxCodes()
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Financial Defaults"
        description="These organization-scoped defaults feed live invoice behavior, own organization tax behavior, and seed the retainage value used when new customers are created or leads are converted into canonical customer records."
      >
        <form action={updateOrganizationFinancialSettingsAction} className="space-y-5">
          <input type="hidden" name="returnTo" value="/settings/financial" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default tax behavior
              </span>
              <select
                name="defaultTaxBehavior"
                defaultValue={financialSettings.defaultTaxBehavior}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              >
                <option value="exclusive">Exclusive</option>
                <option value="inclusive">Inclusive</option>
                <option value="none">No tax</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default tax rate %
              </span>
              <input
                name="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={formatPercentFromRate(financialSettings.defaultTaxRate)}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Default retainage %
            </span>
            <input
              name="defaultRetainagePercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={financialSettings.defaultRetainagePercentage}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This tenant baseline now feeds new customer defaults, so downstream invoice and retainage-ready billing behavior stays consistent.
            </p>
          </label>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Save financial defaults
          </button>
        </form>
      </DetailPanel>

      <DetailPanel
        title="Tax Codes"
        description="Manage reusable tax codes for item-level exceptions while keeping tax ownership inside Financial Settings."
      >
        <div className="space-y-3">
          <form action={updateTaxCodeAction} className="grid gap-2 md:grid-cols-5">
            <input type="hidden" name="returnTo" value="/settings/financial" />
            <input
              name="name"
              placeholder="New tax code name"
              className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none md:col-span-2"
            />
            <input
              name="rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Rate %"
              className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none"
            />
            <input
              name="jurisdiction"
              placeholder="Jurisdiction"
              className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none"
            />
            <label className="flex items-center gap-2 rounded-[4px] border border-[#d8dfe9] px-3 text-sm text-[#36527a]">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 rounded border-[#b7c2d2]"
              />
              Active
            </label>
            <div className="md:col-span-5">
              <button
                type="submit"
                className="rounded-[4px] border border-[#233a64] bg-[#233a64] px-3 py-2 text-sm font-medium text-white"
              >
                Save tax code
              </button>
            </div>
          </form>

          <div className="overflow-x-auto border border-[#e6ebf2]">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e6ebf2] bg-[#f8fafc] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Rate</th>
                  <th className="px-3 py-2.5">Jurisdiction</th>
                  <th className="px-3 py-2.5">Active</th>
                  <th className="px-3 py-2.5 text-right">Update</th>
                </tr>
              </thead>
              <tbody>
                {taxCodes.map((taxCode) => (
                  <tr key={taxCode.id} className="border-b border-[#eef2f7] text-sm text-[#22344d]">
                    <td className="px-3 py-2.5">{taxCode.name}</td>
                    <td className="px-3 py-2.5">{formatPercentFromRate(taxCode.rate)}%</td>
                    <td className="px-3 py-2.5">{taxCode.jurisdiction ?? "-"}</td>
                    <td className="px-3 py-2.5">{taxCode.active ? "Yes" : "No"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <details className="inline-block text-left">
                        <summary className="cursor-pointer rounded-[4px] border border-[#d6deea] px-3 py-1.5 text-sm text-[#36527a]">
                          Edit
                        </summary>
                        <form
                          action={updateTaxCodeAction}
                          className="mt-2 grid min-w-[320px] gap-2 border border-[#d8dfe9] bg-white p-3 shadow-lg"
                        >
                          <input type="hidden" name="returnTo" value="/settings/financial" />
                          <input type="hidden" name="taxCodeId" value={taxCode.id} />
                          <input
                            name="name"
                            defaultValue={taxCode.name}
                            className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none"
                          />
                          <input
                            name="rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            defaultValue={formatPercentFromRate(taxCode.rate)}
                            className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none"
                          />
                          <input
                            name="jurisdiction"
                            defaultValue={taxCode.jurisdiction ?? ""}
                            className="h-9 rounded-[4px] border border-[#d8dfe9] px-3 text-sm outline-none"
                          />
                          <label className="flex items-center gap-2 text-sm text-[#36527a]">
                            <input
                              type="checkbox"
                              name="active"
                              defaultChecked={taxCode.active}
                              className="h-4 w-4 rounded border-[#b7c2d2]"
                            />
                            Active
                          </label>
                          <button
                            type="submit"
                            className="rounded-[4px] bg-[#264a7a] px-3 py-2 text-sm font-medium text-white"
                          >
                            Save
                          </button>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))}
                {taxCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-[#7d8aa0]">
                      No tax codes yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </DetailPanel>

      <SettingsSectionCard
        eyebrow="Tax Ownership"
        title="Cost item tax handling"
        description="Operational cost item screens stay lightweight while organization tax rules stay centralized here."
      >
        <div className="space-y-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          <p>Cost items expose the taxable checkbox in the operational workflow.</p>
          <p>Organization tax behavior and rates are configured here.</p>
          <p>Advanced tax codes remain available without moving item CRUD into settings.</p>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
