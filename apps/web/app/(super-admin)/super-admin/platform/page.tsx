import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
          tone="neutral"
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
          tone="neutral"
        >
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p>Tax behavior: {financialDefaults.defaultTaxBehavior}</p>
            <p>Tax rate: {formatPercentFromRate(financialDefaults.defaultTaxRate)}%</p>
            <p>Retainage baseline: {financialDefaults.defaultRetainagePercentage}%</p>
            <p>Inventory default state is managed in Module Controls through the shared `inventory_enabled` policy.</p>
          </div>
        </SettingsSectionCard>
      </div>

      <DetailPanel
        title="Platform Workflow Defaults"
        description="Define the shared contract-generation baseline, starter estimate defaults, and financial-readiness defaults that seed organizations before they adopt tenant-owned workflow settings."
        tone="neutral"
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

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireContractSignatureBeforeJobScheduling"
              defaultChecked={
                workflowDefaults.requireContractSignatureBeforeJobScheduling
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm leading-6 text-slate-700">
              Require signed contract before scheduling by default
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireFinancingApprovalBeforeJobScheduling"
              defaultChecked={
                workflowDefaults.requireFinancingApprovalBeforeJobScheduling
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="text-sm leading-6 text-slate-700">
              Require financing approval before scheduling by default
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-900">Platform starter estimate defaults</p>
            <p className="mt-2">
              These four fields seed contractor estimate starting content for Scope / SOW,
              Terms, Inclusions, and Exclusions.
            </p>
            <p className="mt-2">
              They are platform starter values only. After a contractor organization adopts or
              updates its own workflow defaults, that organization owns its runtime defaults on
              its own settings row.
            </p>
            <p className="mt-2">
              Updating platform starter defaults does not rewrite existing contractor estimates,
              and it does not mutate contractor-owned defaults that were already adopted or
              customized.
            </p>
          </div>

          <RichTextEditor
            label="Platform starter default terms (seed content)"
            name="defaultEstimateTermsHtml"
            value={workflowDefaults.defaultEstimateTermsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Platform starter default inclusions (seed content)"
            name="defaultEstimateInclusionsHtml"
            value={workflowDefaults.defaultEstimateInclusionsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Platform starter default exclusions (seed content)"
            name="defaultEstimateExclusionsHtml"
            value={workflowDefaults.defaultEstimateExclusionsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Platform starter default scope / SOW (seed content)"
            name="defaultEstimateScopeSummaryHtml"
            value={workflowDefaults.defaultEstimateScopeSummaryHtml}
            mode="standard"
          />
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-xs leading-5 text-slate-500">
            <p>Empty estimates only: these starter defaults prefill only when estimate content is still empty.</p>
            <p className="mt-2">
              Contractor-owned runtime defaults: once an organization adopts or saves its own
              workflow defaults, those tenant-owned values become the working defaults for that
              organization.
            </p>
            <p className="mt-2">
              Separate from reusable blocks: contractors still own insertable reusable content
              blocks independently, and those blocks append on demand inside estimate edit.
            </p>
            <p className="mt-2">
              No live estimate mutation: changing this platform copy does not backfill or rewrite
              existing contractor estimates.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default estimate start number
              </span>
              <input
                name="defaultEstimateStartNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowDefaults.defaultEstimateStartNumber}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default invoice start number
              </span>
              <input
                name="defaultInvoiceStartNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowDefaults.defaultInvoiceStartNumber}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default change order start number
              </span>
              <input
                name="defaultChangeOrderStartNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowDefaults.defaultChangeOrderStartNumber}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default contract start number
              </span>
              <input
                name="defaultContractStartNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowDefaults.defaultContractStartNumber}
                required
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            These numbers stay plain and human-facing. Contractors can override them before first use, and after records exist they can only move the next number upward.
          </div>

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
