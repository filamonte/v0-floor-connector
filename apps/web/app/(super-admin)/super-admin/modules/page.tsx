import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  FutureCapabilityPanel,
  SuperAdminTopTabs
} from "@/components/super-admin-console";
import { updatePlatformFeaturePolicyAction } from "@/lib/platform-admin/actions";
import { listPlatformFeaturePolicies } from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function PlatformModulesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const policies = await listPlatformFeaturePolicies();

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SuperAdminTopTabs
        tabs={[
          {
            href: "#policy-matrix",
            label: "Policy matrix",
            description: "Platform capability availability"
          },
          {
            href: "#contractor-overrides",
            label: "Overrides",
            description: "Future organization layer"
          },
          {
            href: "#entitlements",
            label: "Entitlements",
            description: "Future non-functional placeholder"
          }
        ]}
      />

      <SettingsSectionCard
        id="policy-matrix"
        eyebrow="Module Controls"
        title="Platform module policy matrix"
        description="Platform feature policy is the source of truth for capability-family availability across the whole system. Contractor Settings may store company overrides where allowed, but this matrix stays platform-owned and does not run contractor workflows."
        tone="neutral"
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-4 py-3">Capability</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Surface</th>
                <th className="px-4 py-3">Platform state</th>
                <th className="px-4 py-3">Tenant layer</th>
                <th className="px-4 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="border-b border-slate-100 align-top"
                >
                  <td className="max-w-[280px] px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {policy.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {policy.description ??
                        "No additional description has been added yet."}
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-slate-400">
                      {policy.key}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {policy.module_key ?? "shared"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {policy.surface ?? "shared surface"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        policy.enabled
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      ].join(" ")}
                    >
                      {policy.enabled ? "enabled" : "disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs leading-5 text-slate-500">
                    Contractor-level overrides use the existing organization
                    feature policy layer in Company Feature Controls where
                    available. This matrix does not enforce plan entitlements or
                    replace company settings.
                  </td>
                  <td className="px-4 py-4">
                    <SaveStateForm
                      action={updatePlatformFeaturePolicyAction}
                      className="ml-auto flex min-w-[220px] flex-col items-end gap-3"
                      pendingLabel="Saving..."
                    >
                      <input type="hidden" name="key" value={policy.key} />
                      <input type="hidden" name="name" value={policy.name} />
                      <input
                        type="hidden"
                        name="description"
                        value={policy.description ?? ""}
                      />
                      <input
                        type="hidden"
                        name="moduleKey"
                        value={policy.module_key ?? ""}
                      />
                      <input
                        type="hidden"
                        name="surface"
                        value={policy.surface ?? ""}
                      />
                      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <input
                          type="checkbox"
                          name="enabled"
                          defaultChecked={policy.enabled}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                        />
                        <span className="text-sm text-slate-700">
                          Platform enabled
                        </span>
                      </label>
                      <SaveStateSubmitButton
                        submitLabel="Save policy"
                        pendingLabel="Saving..."
                        variant="secondary"
                        className="rounded-full"
                      />
                    </SaveStateForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <FutureCapabilityPanel title="Contractor overrides">
          Future organization override review can summarize tenant-scoped
          choices beside the platform baseline. This placeholder does not create
          override records or change contractor module controls.
        </FutureCapabilityPanel>
        <FutureCapabilityPanel title="Entitlements">
          Entitlement enforcement, plans, limits, and billing-linked gates
          remain future work. Current toggles are platform feature policy only
          and do not enforce subscription access.
        </FutureCapabilityPanel>
      </div>
    </div>
  );
}
