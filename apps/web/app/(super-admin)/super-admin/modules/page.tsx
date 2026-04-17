import { FeaturePolicyCard } from "@/components/feature-policy-card";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
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

      <SettingsSectionCard
        eyebrow="Module Controls"
        title="Manage shared platform feature policy"
        description="Platform feature policy is the source of truth for module availability and capability family defaults across the whole system."
      >
        <div className="space-y-4">
          {policies.map((policy) => (
            <FeaturePolicyCard
              key={policy.id}
              title={policy.name}
              description={policy.description}
              badges={
                <>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {policy.surface ?? "shared surface"}
                  </span>
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
                </>
              }
              form={
                <form action={updatePlatformFeaturePolicyAction} className="space-y-4">
                  <input type="hidden" name="key" value={policy.key} />
                  <input type="hidden" name="name" value={policy.name} />
                  <input
                    type="hidden"
                    name="description"
                    value={policy.description ?? ""}
                  />
                  <input type="hidden" name="moduleKey" value={policy.module_key ?? ""} />
                  <input type="hidden" name="surface" value={policy.surface ?? ""} />
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <input
                      type="checkbox"
                      name="enabled"
                      defaultChecked={policy.enabled}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                    />
                    <span className="text-sm text-slate-700">
                      Enable this capability family at the platform policy layer
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    Save platform policy
                  </button>
                </form>
              }
            />
          ))}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
