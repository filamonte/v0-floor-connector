import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { updateOrganizationFinancialSettingsAction } from "@/lib/settings/actions";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";

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
  const financialSettings = await getOrganizationFinancialSettings(scope.organizationId);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Financial Defaults"
        description="These organization-scoped defaults feed live invoice behavior and seed the retainage value used when new customers are created or leads are converted into canonical customer records."
      >
        <form action={updateOrganizationFinancialSettingsAction} className="space-y-5">
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
    </div>
  );
}
