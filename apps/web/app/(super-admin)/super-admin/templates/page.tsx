import { PlatformTemplateSeedCard } from "@/components/platform-template-seed-card";
import { PlatformStarterPackManager } from "@/components/platform-starter-pack-manager";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { StarterPackProvisioningDryRunPanel } from "@/components/starter-pack-provisioning-dry-run";
import { StarterPackTargetingPreviewPanel } from "@/components/starter-pack-targeting-preview";
import {
  FutureCapabilityPanel,
  SuperAdminTopTabs
} from "@/components/super-admin-console";
import {
  listPlatformCatalogItemSeeds,
  listPlatformStarterPacks,
  listPlatformTemplateSeedsAdmin,
  getStarterPackProvisioningDraftReview,
  getStarterPackProvisioningRunDetail,
  getStarterPackProvisioningRunUsage,
  listRecentStarterPackProvisioningAttempts,
  listRecentStarterPackProvisioningRuns,
  listOrganizationCatalogItemsForPlatformAdmin,
  listOrganizationDocumentTemplatesForPlatformAdmin,
  listContractorGroups,
  listTenantsForPlatformAdmin
} from "@/lib/platform-admin/data";
import {
  buildStarterPackProvisioningDryRun,
  type StarterPackProvisioningDryRunOrganization
} from "@/lib/platform-admin/starter-pack-provisioning-dry-run-core";
import { normalizeStarterPackProvisioningAuditFilter } from "@/lib/platform-admin/starter-pack-provisioning-observability-core";
import {
  buildStarterPackTargetingPreview,
  type StarterPackTargetingOrganization
} from "@/lib/platform-admin/starter-pack-targeting-core";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    dryRunOrganizationId?: string;
    dryRunStarterPackId?: string;
    draftRunId?: string;
    reviewRunId?: string;
    auditFilter?: string;
    targetOrganizationId?: string;
  }>;
};

function tenantDisplayName(tenant: {
  display_name: string;
  legal_name: string;
}) {
  return tenant.display_name || tenant.legal_name;
}

function getTenantPlan(tenant: Awaited<ReturnType<typeof listTenantsForPlatformAdmin>>[number]) {
  const currentSubscription = tenant.company_subscriptions?.[0] ?? null;

  return currentSubscription?.subscription_plans ?? null;
}

function getTenantStateRegion(
  tenant: Awaited<ReturnType<typeof listTenantsForPlatformAdmin>>[number]
) {
  const activeLocation = Array.isArray(tenant.active_location)
    ? (tenant.active_location[0] ?? null)
    : tenant.active_location;

  return activeLocation?.state_region ?? null;
}

function mapTenantToTargetingOrganization(
  tenant: Awaited<ReturnType<typeof listTenantsForPlatformAdmin>>[number] | null,
  contractorGroups: Awaited<ReturnType<typeof listContractorGroups>>
): StarterPackTargetingOrganization | null {
  if (!tenant) {
    return null;
  }

  const plan = getTenantPlan(tenant);

  return {
    id: tenant.id,
    name: tenantDisplayName(tenant),
    slug: tenant.slug,
    tenantStatus: tenant.tenant_status,
    lifecycleState: tenant.lifecycle_state,
    stateRegion: getTenantStateRegion(tenant),
    primaryTrade: tenant.primary_trade,
    planKey: plan?.key ?? null,
    planName: plan?.name ?? null,
    contractorGroups: contractorGroups
      .filter((group) =>
        group.memberships.some(
          (membership) => membership.organizationId === tenant.id
        )
      )
      .map((group) => ({
        id: group.id,
        key: group.key,
        name: group.name,
        status: group.status,
        groupType: group.groupType
      }))
  };
}

function mapTenantToDryRunOrganization(
  tenant: Awaited<ReturnType<typeof listTenantsForPlatformAdmin>>[number] | null
): StarterPackProvisioningDryRunOrganization | null {
  if (!tenant) {
    return null;
  }

  return {
    id: tenant.id,
    name: tenantDisplayName(tenant),
    slug: tenant.slug
  };
}

export default async function PlatformTemplatesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedAuditFilter = normalizeStarterPackProvisioningAuditFilter(
    resolvedSearchParams.auditFilter
  );
  const [
    seeds,
    catalogSeeds,
    starterPacks,
    contractorGroups,
    tenants,
    recentProvisioningRuns,
    recentProvisioningAttempts
  ] = await Promise.all([
      listPlatformTemplateSeedsAdmin(),
      listPlatformCatalogItemSeeds(),
      listPlatformStarterPacks(),
      listContractorGroups(),
      listTenantsForPlatformAdmin(),
      listRecentStarterPackProvisioningRuns(),
      listRecentStarterPackProvisioningAttempts()
    ]);
  const selectedTenant =
    tenants.find(
      (tenant) => tenant.id === resolvedSearchParams.targetOrganizationId
    ) ?? null;
  const selectedDryRunTenant =
    tenants.find(
      (tenant) => tenant.id === resolvedSearchParams.dryRunOrganizationId
    ) ?? null;
  const selectedDryRunPack =
    starterPacks.find(
      (pack) => pack.id === resolvedSearchParams.dryRunStarterPackId
    ) ?? null;
  const [dryRunTemplates, dryRunCatalogItems] =
    selectedDryRunTenant && selectedDryRunPack
      ? await Promise.all([
          listOrganizationDocumentTemplatesForPlatformAdmin(selectedDryRunTenant.id),
          listOrganizationCatalogItemsForPlatformAdmin(selectedDryRunTenant.id)
        ])
      : [[], []];
  const selectedDraftReview = resolvedSearchParams.reviewRunId
    ? await getStarterPackProvisioningDraftReview(resolvedSearchParams.reviewRunId)
    : null;
  const selectedProvisioningRun = resolvedSearchParams.reviewRunId
    ? await getStarterPackProvisioningRunDetail(resolvedSearchParams.reviewRunId)
    : null;
  const selectedProvisioningUsage =
    selectedProvisioningRun?.status === "completed" ||
    selectedProvisioningRun?.status === "completed_with_warnings"
      ? await getStarterPackProvisioningRunUsage(selectedProvisioningRun.id)
      : null;
  const targetingPreview = buildStarterPackTargetingPreview({
    organization: mapTenantToTargetingOrganization(selectedTenant, contractorGroups),
    starterPacks
  });
  const provisioningDryRun = buildStarterPackProvisioningDryRun({
    organization: mapTenantToDryRunOrganization(selectedDryRunTenant),
    starterPack: selectedDryRunPack,
    organizationTemplates: dryRunTemplates,
    organizationCatalogItems: dryRunCatalogItems
  });

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SuperAdminTopTabs
        tabs={[
          {
            href: "#estimate-templates",
            label: "Estimates",
            description: "Proposal and estimate starter copy"
          },
          {
            href: "#invoice-templates",
            label: "Invoices",
            description: "Billing document starter copy"
          },
          {
            href: "#contract-templates",
            label: "Contracts",
            description: "Agreement starter copy"
          },
          {
            href: "#starter-packs",
            label: "Starter Packs",
            description: "Governed seed bundles"
          },
          {
            href: "#starter-pack-targeting-preview",
            label: "Targeting",
            description: "Read-only assignment explainer"
          },
          {
            href: "#starter-pack-provisioning-dry-run",
            label: "Dry Run",
            description: "Copy impact preview"
          },
          {
            href: "#template-assignments",
            label: "Assignments",
            description: "Starter-pack planning intent"
          }
        ]}
      />

      <SettingsSectionCard
        eyebrow="Starter Templates"
        title="Manage platform-owned document seeds"
        description="Platform starter templates are not shared mutable records inside tenant workflows. Organizations adopt editable copies, but the starter definitions here remain the source of truth for future adoptions."
        tone="neutral"
      >
        <div className="space-y-6">
          <PlatformTemplateSeedCard
            id="estimate-templates"
            templateType="estimate"
            seeds={seeds.filter((seed) => seed.templateType === "estimate")}
          />
          <PlatformTemplateSeedCard
            id="invoice-templates"
            templateType="invoice"
            seeds={seeds.filter((seed) => seed.templateType === "invoice")}
          />
          <PlatformTemplateSeedCard
            id="contract-templates"
            templateType="contract"
            seeds={seeds.filter((seed) => seed.templateType === "contract")}
          />
        </div>
      </SettingsSectionCard>

      <PlatformStarterPackManager
        packs={starterPacks}
        templateSeeds={seeds}
        catalogSeeds={catalogSeeds}
        tenants={tenants}
      />

      <StarterPackTargetingPreviewPanel
        preview={targetingPreview}
        tenants={tenants}
        selectedOrganizationId={selectedTenant?.id ?? null}
      />

      <StarterPackProvisioningDryRunPanel
        report={provisioningDryRun}
        tenants={tenants}
        starterPacks={starterPacks}
        recentProvisioningRuns={recentProvisioningRuns}
        recentProvisioningAttempts={recentProvisioningAttempts}
        selectedOrganizationId={selectedDryRunTenant?.id ?? null}
        selectedStarterPackId={selectedDryRunPack?.id ?? null}
        createdDraftRunId={resolvedSearchParams.draftRunId ?? null}
        selectedDraftReview={selectedDraftReview}
        selectedProvisioningRun={selectedProvisioningRun}
        selectedProvisioningUsage={selectedProvisioningUsage}
        selectedAuditFilter={selectedAuditFilter}
      />

      <FutureCapabilityPanel title="Template assignments" id="template-assignments">
        Starter-pack assignment intent can now be captured in the Starter Packs
        manager above for all organizations, specific organizations, onboarding
        profiles, regions, trade segments, plan tiers, and future contractor
        groups. It remains planning-only; contractors still adopt editable
        tenant-owned copies from the existing template seed system.
      </FutureCapabilityPanel>
    </div>
  );
}
