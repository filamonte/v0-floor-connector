import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
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

const fieldClassName =
  "w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/20";

const compactFieldClassName =
  "h-9 rounded-[4px] border border-[var(--border-warm)] bg-white px-3 text-sm outline-none transition focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/20";

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
        <SaveStateForm
          action={updateOrganizationFinancialSettingsAction}
          pendingLabel="Saving..."
          className="space-y-5"
        >
          <input type="hidden" name="returnTo" value="/settings/financial" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Default tax behavior
              </span>
              <select
                name="defaultTaxBehavior"
                defaultValue={financialSettings.defaultTaxBehavior}
                className={fieldClassName}
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
                className={fieldClassName}
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
              className={fieldClassName}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This tenant baseline now feeds new customer defaults, so downstream invoice and retainage-ready billing behavior stays consistent.
            </p>
          </label>

          <SaveStateSubmitButton
            submitLabel="Save financial defaults"
            pendingLabel="Saving..."
          />
        </SaveStateForm>
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
              className={`${compactFieldClassName} md:col-span-2`}
            />
            <input
              name="rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Rate %"
              className={compactFieldClassName}
            />
            <input
              name="jurisdiction"
              placeholder="Jurisdiction"
              className={compactFieldClassName}
            />
            <label className="flex items-center gap-2 rounded-[4px] border border-[var(--border-warm)] px-3 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--border-warm)] text-[var(--copper)]"
              />
              Active
            </label>
            <div className="md:col-span-5">
              <button
                type="submit"
                className="rounded-[4px] border border-[var(--graphite)] bg-[var(--graphite)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--graphite-light)]"
              >
                Save tax code
              </button>
            </div>
          </form>

          <div className="overflow-x-auto rounded-lg border border-[var(--border-warm)]">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-warm)] bg-[var(--highlight)] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Rate</th>
                  <th className="px-3 py-2.5">Jurisdiction</th>
                  <th className="px-3 py-2.5">Active</th>
                  <th className="px-3 py-2.5 text-right">Update</th>
                </tr>
              </thead>
              <tbody>
                {taxCodes.map((taxCode) => (
                  <tr key={taxCode.id} className="border-b border-[var(--border-warm)] text-sm text-[var(--text-primary)]">
                    <td className="px-3 py-2.5">{taxCode.name}</td>
                    <td className="px-3 py-2.5">{formatPercentFromRate(taxCode.rate)}%</td>
                    <td className="px-3 py-2.5">{taxCode.jurisdiction ?? "-"}</td>
                    <td className="px-3 py-2.5">{taxCode.active ? "Yes" : "No"}</td>
                    <td className="px-3 py-2.5 text-right">
                      <details className="inline-block text-left">
                        <summary className="cursor-pointer rounded-[4px] border border-[var(--border-warm)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--highlight)]">
                          Edit
                        </summary>
                        <SaveStateForm
                          action={updateTaxCodeAction}
                          pendingLabel="Saving..."
                          className="mt-2 grid min-w-[320px] gap-2 rounded-lg border border-[var(--border-warm)] bg-white p-3 shadow-lg"
                        >
                          <input type="hidden" name="returnTo" value="/settings/financial" />
                          <input type="hidden" name="taxCodeId" value={taxCode.id} />
                          <input
                            name="name"
                            defaultValue={taxCode.name}
                            className={compactFieldClassName}
                          />
                          <input
                            name="rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            defaultValue={formatPercentFromRate(taxCode.rate)}
                            className={compactFieldClassName}
                          />
                          <input
                            name="jurisdiction"
                            defaultValue={taxCode.jurisdiction ?? ""}
                            className={compactFieldClassName}
                          />
                          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                            <input
                              type="checkbox"
                              name="active"
                              defaultChecked={taxCode.active}
                              className="h-4 w-4 rounded border-[var(--border-warm)] text-[var(--copper)]"
                            />
                            Active
                          </label>
                          <SaveStateSubmitButton
                            submitLabel="Save"
                            pendingLabel="Saving..."
                            className="rounded-[4px]"
                          />
                        </SaveStateForm>
                      </details>
                    </td>
                  </tr>
                ))}
                {taxCodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">
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
        <div className="space-y-2 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <p>Cost items expose the taxable checkbox in the operational workflow.</p>
          <p>Organization tax behavior and rates are configured here.</p>
          <p>Advanced tax codes remain available without moving item CRUD into settings.</p>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
