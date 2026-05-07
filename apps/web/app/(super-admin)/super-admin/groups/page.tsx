import { ContractorGroupManager } from "@/components/contractor-group-manager";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { FutureCapabilityPanel, SuperAdminTopTabs } from "@/components/super-admin-console";
import {
  listContractorGroups,
  listTenantsForPlatformAdmin
} from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SuperAdminGroupsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [groups, tenants] = await Promise.all([
    listContractorGroups(),
    listTenantsForPlatformAdmin()
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SuperAdminTopTabs
        tabs={[
          {
            href: "#contractor-groups",
            label: "Groups",
            description: "Platform segmentation metadata"
          },
          {
            href: "#future-entitlements",
            label: "Future Entitlements",
            description: "Not enforced by groups"
          },
          {
            href: "#starter-pack-targeting",
            label: "Starter Packs",
            description: "Read-model context only"
          }
        ]}
      />

      <SettingsSectionCard
        eyebrow="Contractor Groups"
        title="Platform-managed segmentation"
        description="Create and maintain contractor organization cohorts for onboarding targeting, starter-pack targeting previews, rollout planning, beta programs, regional segmentation, and future platform packaging. These groups are not tenant roles and do not affect contractor permissions."
        tone="neutral"
      >
        <ContractorGroupManager groups={groups} tenants={tenants} />
      </SettingsSectionCard>

      <FutureCapabilityPanel title="Future entitlements" id="future-entitlements">
        Contractor groups are not entitlement enforcement. Future entitlement,
        pricing, plan-package, and module-gating behavior must be implemented
        through explicit server-side policy and audit paths before any runtime
        behavior can depend on group membership.
      </FutureCapabilityPanel>

      <FutureCapabilityPanel title="Starter-pack targeting" id="starter-pack-targeting">
        Starter-pack assignment preview can now inspect explicit contractor
        group membership when assignment intent uses a contractor group key.
        This remains read-only planning context; it does not auto-provision,
        copy templates, copy catalog items, or change defaults.
      </FutureCapabilityPanel>
    </div>
  );
}
