import { ContractorGroupManager } from "@/components/contractor-group-manager";
import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import { FutureCapabilityPanel, SuperAdminTopTabs } from "@/components/super-admin-console";
import {
  listPlatformStarterPacks,
  listContractorGroupAuditEvents,
  listContractorGroups,
  listTenantsForPlatformAdmin
} from "@/lib/platform-admin/data";
import {
  buildContractorGroupAuditObservability,
  buildContractorGroupAuditTimeline
} from "@/lib/platform-admin/contractor-group-audit-events-core";
import { buildContractorGroupAssignmentAuditReadiness } from "@/lib/platform-admin/contractor-group-assignment-audit-readiness-core";
import { buildContractorGroupAssignmentProposals } from "@/lib/platform-admin/contractor-group-assignment-proposals-core";
import { buildContractorGroupObservability } from "@/lib/platform-admin/contractor-group-observability-core";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    groupStatus?: string;
    groupType?: string;
    organizationId?: string;
    auditEventType?: string;
    proposalStatus?: string;
    proposalConfidence?: string;
    proposalGroupType?: string;
  }>;
};

function firstLocation(
  location:
    | Array<{ state_region: string | null }>
    | { state_region: string | null }
    | null
    | undefined
) {
  return Array.isArray(location) ? (location[0] ?? null) : (location ?? null);
}

export default async function SuperAdminGroupsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [groups, tenants, starterPacks, auditEvents] = await Promise.all([
    listContractorGroups(),
    listTenantsForPlatformAdmin(),
    listPlatformStarterPacks(),
    listContractorGroupAuditEvents({ limit: 100 })
  ]);
  const selectedAuditEventType = resolvedSearchParams.auditEventType ?? "all";
  const filteredAuditEvents =
    selectedAuditEventType === "all"
      ? auditEvents
      : auditEvents.filter((event) => event.eventType === selectedAuditEventType);
  const observability = buildContractorGroupObservability({
    groups,
    organizations: tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.display_name || tenant.legal_name,
      slug: tenant.slug,
      tenantStatus: tenant.tenant_status
    })),
    starterPacks
  });
  const assignmentAuditReadiness = buildContractorGroupAssignmentAuditReadiness({
    groups
  });
  const assignmentProposals = buildContractorGroupAssignmentProposals({
    groups,
    starterPacks,
    organizations: tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.display_name || tenant.legal_name,
      slug: tenant.slug,
      tenantStatus: tenant.tenant_status,
      stateRegion: firstLocation(tenant.active_location)?.state_region ?? null,
      primaryTrade: tenant.primary_trade,
      labels: []
    })),
    filters: {
      organizationId: resolvedSearchParams.organizationId ?? null,
      status:
        resolvedSearchParams.proposalStatus === "proposed" ||
        resolvedSearchParams.proposalStatus === "already_assigned" ||
        resolvedSearchParams.proposalStatus === "not_applicable" ||
        resolvedSearchParams.proposalStatus === "unavailable"
          ? resolvedSearchParams.proposalStatus
          : "all",
      confidence:
        resolvedSearchParams.proposalConfidence === "high" ||
        resolvedSearchParams.proposalConfidence === "medium" ||
        resolvedSearchParams.proposalConfidence === "low" ||
        resolvedSearchParams.proposalConfidence === "unavailable"
          ? resolvedSearchParams.proposalConfidence
          : "all",
      groupType:
        resolvedSearchParams.proposalGroupType === "trade_segment" ||
        resolvedSearchParams.proposalGroupType === "onboarding" ||
        resolvedSearchParams.proposalGroupType === "beta" ||
        resolvedSearchParams.proposalGroupType === "internal" ||
        resolvedSearchParams.proposalGroupType === "future_plan" ||
        resolvedSearchParams.proposalGroupType === "future_entitlement" ||
        resolvedSearchParams.proposalGroupType === "regional" ||
        resolvedSearchParams.proposalGroupType === "custom"
          ? resolvedSearchParams.proposalGroupType
          : "all"
    }
  });
  const auditObservability = buildContractorGroupAuditObservability({
    events: auditEvents,
    groups
  });
  const auditTimeline = buildContractorGroupAuditTimeline({
    events: filteredAuditEvents,
    limit: 12
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
        <ContractorGroupManager
          groups={groups}
          tenants={tenants}
          observability={observability}
          assignmentAuditReadiness={assignmentAuditReadiness}
          assignmentProposals={assignmentProposals}
          auditObservability={auditObservability}
          auditTimeline={auditTimeline}
          selectedStatus={resolvedSearchParams.groupStatus ?? "all"}
          selectedType={resolvedSearchParams.groupType ?? "all"}
          selectedOrganizationId={resolvedSearchParams.organizationId ?? null}
          selectedAuditEventType={selectedAuditEventType}
          selectedProposalStatus={resolvedSearchParams.proposalStatus ?? "all"}
          selectedProposalConfidence={
            resolvedSearchParams.proposalConfidence ?? "all"
          }
          selectedProposalGroupType={resolvedSearchParams.proposalGroupType ?? "all"}
        />
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
