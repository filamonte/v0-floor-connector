import { FeaturePolicyCard } from "@/components/feature-policy-card";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { listOrganizationFeatureOverrides } from "@/lib/organizations/module-settings";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { listPlatformFeaturePolicies } from "@/lib/platform-admin/data";
import { updateOrganizationFeatureOverrideAction } from "@/lib/settings/actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const modulePolicyBadgeClassName =
  "rounded-full border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]";
const moduleOverrideControlClassName =
  "flex items-start gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4";

export default async function SettingsModulesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/modules");
  const [platformPolicies, overrides] = await Promise.all([
    listPlatformFeaturePolicies(),
    listOrganizationFeatureOverrides(scope.organizationId)
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Company Feature Controls"
        title="Manage company overrides under platform policy"
        description="Super Admin owns platform-wide feature policy. This company can only store tenant-level overrides within that shared feature control system; workflow action still belongs in the owning workspace."
      >
        <div className="space-y-4">
          {platformPolicies.map((policy) => {
            const override = overrides.find((item) => item.key === policy.key);
            const effectiveEnabled = override?.enabled ?? policy.enabled;

            return (
              <FeaturePolicyCard
                key={policy.id}
                title={policy.name}
                description={policy.description}
                badges={
                  <>
                    <span className={modulePolicyBadgeClassName}>
                      Platform policy: {policy.surface ?? "shared surface"}
                    </span>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        effectiveEnabled
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      ].join(" ")}
                    >
                      {effectiveEnabled
                        ? "company effective enabled"
                        : "company effective disabled"}
                    </span>
                  </>
                }
                form={
                  <SaveStateForm
                    action={updateOrganizationFeatureOverrideAction}
                    pendingLabel="Saving..."
                    className="space-y-4"
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

                    <label className={moduleOverrideControlClassName}>
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={effectiveEnabled}
                        className="mt-1 h-4 w-4 rounded border-[var(--border-warm)] text-[var(--copper)] focus:ring-[var(--copper)]/20"
                      />
                      <span className="text-sm leading-6 text-slate-700">
                        Store a company-scoped enabled/disabled override for
                        this feature family when platform policy allows it.
                      </span>
                    </label>
                    <SaveStateSubmitButton
                      submitLabel="Save company override"
                      pendingLabel="Saving..."
                      className="rounded-full"
                      variant="secondary"
                    />
                  </SaveStateForm>
                }
              />
            );
          })}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
