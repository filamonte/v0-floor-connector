import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  ConfigurationInheritanceTimeline,
  ConfigurationResolutionCard,
  FutureCapabilityPanel,
  ScopeLegend,
  SuperAdminTopTabs
} from "@/components/super-admin-console";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updatePlatformFinancialDefaultsAction, updatePlatformWorkflowDefaultsAction } from "@/lib/platform-admin/actions";
import { getConfigurationResolutionPreview } from "@/lib/platform-admin/configuration-resolution";
import { getPlatformFinancialDefaults, getPlatformWorkflowDefaults, listPlatformTemplateSeedsAdmin, listTenantsForPlatformAdmin } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    tenantId?: string;
    userId?: string;
  }>;
};

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

export default async function PlatformDefaultsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedTenantId = resolvedSearchParams.tenantId?.trim() || null;
  const selectedUserId = resolvedSearchParams.userId?.trim() || null;
  const [
    financialDefaults,
    workflowDefaults,
    templateSeeds,
    tenants,
    resolutionPreview
  ] = await Promise.all([
    getPlatformFinancialDefaults(),
    getPlatformWorkflowDefaults(),
    listPlatformTemplateSeedsAdmin(),
    listTenantsForPlatformAdmin(),
    getConfigurationResolutionPreview(selectedTenantId, {
      userId: selectedUserId
    })
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

      <SuperAdminTopTabs
        tabs={[
          {
            href: "#financial-defaults",
            label: "Financial",
            description: "Platform tax and retainage seeds"
          },
          {
            href: "#workflow-defaults",
            label: "Workflow",
            description: "Contract, readiness, and numbering seeds"
          },
          {
            href: "#resolution-preview",
            label: "Resolution Preview",
            description: "Read-only inheritance inspection"
          },
          {
            href: "#inheritance-model",
            label: "Inheritance",
            description: "Platform versus tenant-owned behavior"
          },
          {
            href: "#future-overrides",
            label: "Future overrides",
            description: "Organization and user layers, not active controls"
          }
        ]}
      />

      <ScopeLegend
        items={[
          {
            label: "Platform default",
            description: "Global starter value used before tenant-owned settings exist."
          },
          {
            label: "Contractor-owned copy",
            description: "Adopted tenant record or setting that the contractor controls."
          },
          {
            label: "Future organization override",
            description: "Planned resolver layer for explicit tenant-level variation."
          },
          {
            label: "User preference",
            description: "Active only for personal estimate-template preference; all other personal layers remain planned."
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <DetailPanel
          id="financial-defaults"
          title="Platform Financial Defaults"
          description="These global defaults seed organizations before they create tenant-owned financial settings of their own."
          tone="neutral"
        >
          <SaveStateForm
            action={updatePlatformFinancialDefaultsAction}
            pendingLabel="Saving..."
            className="space-y-5"
          >
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

            <SaveStateSubmitButton
              submitLabel="Save platform financial defaults"
              pendingLabel="Saving..."
              className="rounded-full"
            />
          </SaveStateForm>
        </DetailPanel>

        <SettingsSectionCard
          id="inheritance-model"
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
        id="workflow-defaults"
        title="Platform Workflow Defaults"
        description="Define the shared contract-generation baseline, starter estimate defaults, and financial-readiness defaults that seed organizations before they adopt tenant-owned workflow settings."
        tone="neutral"
      >
        <SaveStateForm
          action={updatePlatformWorkflowDefaultsAction}
          pendingLabel="Saving..."
          className="space-y-5"
        >
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

          <SaveStateSubmitButton
            submitLabel="Save platform workflow defaults"
            pendingLabel="Saving..."
            className="rounded-full"
          />
        </SaveStateForm>
      </DetailPanel>

      <div id="resolution-preview" className="space-y-5 scroll-mt-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Resolution Preview
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                Inspect effective configuration sources
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This read-only view explains platform defaults, selected
                contractor-owned settings or copies, and future inheritance layers
                without mutating settings, templates, catalogs, snapshots, or runtime
                workflow behavior.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {resolutionPreview.selectedOrganization
                  ? resolutionPreview.selectedUser
                    ? `Showing contractor context for ${resolutionPreview.selectedOrganization.name} and user context for ${resolutionPreview.selectedUser.name}.`
                    : `Showing contractor context for ${resolutionPreview.selectedOrganization.name}. Select a user to inspect the active personal estimate-template preference layer.`
                  : "No contractor selected. Showing platform-level defaults plus the future layers that are not implemented yet."}
              </p>
            </div>
            <form action="/super-admin/platform#resolution-preview" className="space-y-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Contractor context
                </span>
                <select
                  name="tenantId"
                  defaultValue={selectedTenantId ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                >
                  <option value="">Platform-only preview</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.display_name || tenant.legal_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  User context
                </span>
                <select
                  name="userId"
                  defaultValue={resolutionPreview.selectedUser?.id ?? ""}
                  disabled={!resolutionPreview.selectedOrganization}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {resolutionPreview.selectedOrganization
                      ? "No user selected"
                      : "Select a contractor first"}
                  </option>
                  {resolutionPreview.userOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
              >
                Preview resolution
              </button>
            </form>
          </div>
        </div>

        <ConfigurationInheritanceTimeline
          futureLayers={resolutionPreview.futureLayers}
          hasSelectedOrganization={Boolean(resolutionPreview.selectedOrganization)}
        />

        <div className="grid gap-4">
          {resolutionPreview.groups.map((group) => (
            <ConfigurationResolutionCard key={group.key} group={group} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {resolutionPreview.futureLayers.map((layer) => (
            <FutureCapabilityPanel key={layer.sourceLayer} title={layer.label}>
              {layer.notes}
            </FutureCapabilityPanel>
          ))}
        </div>
      </div>

      <div id="future-overrides" className="grid gap-4 lg:grid-cols-2">
        <FutureCapabilityPanel title="Tax profiles">
          Tax profile assignment and external tax-provider mapping remain future work.
          Current controls only seed the existing platform defaults and do not change
          invoice tax calculation behavior.
        </FutureCapabilityPanel>
        <FutureCapabilityPanel title="Organization and user preference resolver">
          The Resolution Preview now exposes a read-only resolver for existing
          platform defaults, contractor-owned settings/copies, and the one active
          personal estimate-template preference. Organization override registries
          and all other user preference layers remain future, non-functional layers
          with no entitlement or enforcement behavior active here.
        </FutureCapabilityPanel>
      </div>
    </div>
  );
}
