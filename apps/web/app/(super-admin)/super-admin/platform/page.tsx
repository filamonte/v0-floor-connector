import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { updatePlatformFinancialDefaultsAction, updatePlatformWorkflowDefaultsAction } from "@/lib/platform-admin/actions";
import { getPlatformFinancialDefaults, getPlatformWorkflowDefaults, listPlatformTemplateSeedsAdmin } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

export default async function PlatformDefaultsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [financialDefaults, workflowDefaults, templateSeeds] = await Promise.all([
    getPlatformFinancialDefaults(),
    getPlatformWorkflowDefaults(),
    listPlatformTemplateSeedsAdmin()
  ]);

  const contractSeeds = templateSeeds.filter(
    (seed) => seed.templateType === "contract" && seed.isActive
  );

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <DetailPanel
          title="Platform Financial Defaults"
          description="These global defaults seed organizations before they create tenant-owned financial settings of their own."
        >
          <form action={updatePlatformFinancialDefaultsAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Default tax behavior
                </span>
                <select
                  name="defaultTaxBehavior"
                  defaultValue={financialDefaults.defaultTaxBehavior}
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
                  defaultValue={formatPercentFromRate(financialDefaults.defaultTaxRate)}
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
                defaultValue={financialDefaults.defaultRetainagePercentage}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Save platform financial defaults
            </button>
          </form>
        </DetailPanel>

        <SettingsSectionCard
          eyebrow="Platform Inheritance"
          title="What tenants receive before overrides"
          description="Organizations start from these global defaults, then own their copies or organization-scoped settings after adoption."
        >
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p>Tax behavior: {financialDefaults.defaultTaxBehavior}</p>
            <p>Tax rate: {formatPercentFromRate(financialDefaults.defaultTaxRate)}%</p>
            <p>Retainage baseline: {financialDefaults.defaultRetainagePercentage}%</p>
          </div>
        </SettingsSectionCard>
      </div>

      <DetailPanel
        title="Platform Workflow Defaults"
        description="Define the shared contract-generation and financial-readiness baseline that organizations inherit until they set tenant-owned workflow defaults."
      >
        <form action={updatePlatformWorkflowDefaultsAction} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Approved-estimate contract starter template
            </span>
            <select
              name="approvedEstimateContractSeedId"
              defaultValue={workflowDefaults.approvedEstimateContractSeedId ?? ""}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            >
              <option value="">Use each organization&apos;s contract default</option>
              {contractSeeds.map((seed) => (
                <option key={seed.id} value={seed.id}>
                  {seed.name}
                  {seed.isDefault ? " - platform default" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireContractInternalApproval"
              defaultChecked={workflowDefaults.requireContractInternalApproval}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm leading-6 text-slate-700">
              Require internal contract approval before send by default
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireDepositBeforeJobScheduling"
              defaultChecked={workflowDefaults.requireDepositBeforeJobScheduling}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm leading-6 text-slate-700">
              Require deposit before scheduling by default
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Default deposit %
            </span>
            <input
              name="defaultDepositPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={workflowDefaults.defaultDepositPercentage}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save platform workflow defaults
          </button>
        </form>
      </DetailPanel>
    </div>
  );
}
