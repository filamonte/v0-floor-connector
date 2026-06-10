import { SettingsOverviewCard } from "@/components/settings-overview-card";
import { SettingsBoundaryNotice } from "@/components/settings-boundary-notice";
import { ScopeLegend } from "@/components/super-admin-console";
import {
  getPlatformFinancialDefaults,
  getPlatformWorkflowDefaults,
  listPlatformCatalogItemSeeds,
  listPlatformFeaturePolicies,
  listPlatformTemplateSeedsAdmin,
  listTenantsForPlatformAdmin
} from "@/lib/platform-admin/data";

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

export default async function SuperAdminHomePage() {
  const [
    financialDefaults,
    workflowDefaults,
    templateSeeds,
    catalogSeeds,
    featurePolicies,
    tenants
  ] = await Promise.all([
    getPlatformFinancialDefaults(),
    getPlatformWorkflowDefaults(),
    listPlatformTemplateSeedsAdmin(),
    listPlatformCatalogItemSeeds(),
    listPlatformFeaturePolicies(),
    listTenantsForPlatformAdmin()
  ]);

  return (
    <div className="space-y-6">
      <SettingsBoundaryNotice
        tone="neutral"
        title="Platform Control Room governs the system layer"
        items={[
          {
            label: "Platform-owned controls",
            description:
              "Starter defaults, platform feature policy, tenant lifecycle, SaaS billing operations, packages, and operator oversight live here."
          },
          {
            label: "Contractor-owned settings",
            description:
              "Company profile, templates, catalogs, workflow defaults, financial defaults, team access, and company overrides remain in contractor Settings."
          },
          {
            label: "Not workflow execution",
            description:
              "Super Admin can activate, seed, inspect, and govern tenants, but it should not become the place to run estimates, contracts, invoices, jobs, or collections."
          }
        ]}
      />

      <ScopeLegend
        items={[
          {
            label: "Starter Settings",
            description:
              "Global starter values controlled only from super admin."
          },
          {
            label: "Contractor-owned copies",
            description:
              "Tenant records/settings adopted from starter values and then owned by the contractor."
          },
          {
            label: "Future overrides",
            description:
              "Planned organization-specific configuration resolver layer."
          },
          {
            label: "Future preferences",
            description:
              "Planned user-specific display or workflow preferences."
          }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsOverviewCard
          title="Platform Starter Settings"
          description="Global financial and workflow baselines used before a contractor organization owns settings of its own."
          href="/super-admin/platform"
          ctaLabel="Manage starter settings"
          tone="neutral"
        >
          <div className="space-y-2 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p>
              Tax: {financialDefaults.defaultTaxBehavior} at{" "}
              {formatPercentFromRate(financialDefaults.defaultTaxRate)}%
            </p>
            <p>
              Deposit baseline: {workflowDefaults.defaultDepositPercentage}%
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Starter templates"
          description="Platform-owned document seeds that organizations can copy into editable tenant-owned records."
          href="/super-admin/templates"
          ctaLabel="Manage starter templates"
          tone="neutral"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["estimate", "invoice", "contract"] as const).map(
              (templateType) => {
                const count = templateSeeds.filter(
                  (seed) => seed.templateType === templateType
                ).length;

                return (
                  <div
                    key={templateType}
                    className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                  >
                    <p className="font-medium capitalize text-[var(--text-primary)]">
                      {templateType}
                    </p>
                    <p className="mt-1">
                      {count} seed{count === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Starter cost items"
          description="Reusable starter cost items, systems, and package defaults available for tenant adoption."
          href="/super-admin/catalogs"
          ctaLabel="Manage starter cost items"
          tone="neutral"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              ["material", "labor", "service", "equipment", "system"] as const
            ).map((itemType) => {
              const count = catalogSeeds.filter(
                (seed) => seed.itemType === itemType
              ).length;

              return (
                <div
                  key={itemType}
                  className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                >
                  <p className="font-medium capitalize text-[var(--text-primary)]">
                    {itemType}s
                  </p>
                  <p className="mt-1">
                    {count} seed{count === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Platform Feature Policy"
          description="Shared platform feature policies that shape which capability families are available before company overrides are considered."
          href="/super-admin/modules"
          ctaLabel="Manage platform policy"
          tone="neutral"
        >
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              {featurePolicies.length} platform feature policies
            </p>
            <p className="mt-1">
              {tenants.length} tenant organizations on the shared platform model
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Packages"
          description="Read-only package, subscription-plan, billing setup, and activation readiness from existing records."
          href="/super-admin/packages"
          ctaLabel="Review package readiness"
          tone="neutral"
        >
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              Package governance foundation
            </p>
            <p className="mt-1">
              No Stripe calls, subscriptions, entitlement enforcement, module
              gating, or contractor permission changes.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Platform Billing"
          description="Durable SaaS billing operations for Stripe configuration health, Checkout readiness, webhook status, subscription references, and manual activation separation."
          href="/super-admin/billing"
          ctaLabel="Review billing operations"
          tone="neutral"
        >
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              Billing operations console
            </p>
            <p className="mt-1">
              Readiness and status only: no live charges, no Stripe product
              creation, and no automatic activation.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Operations"
          description="Read-only platform health signals, audit activity, and support-readiness cues from existing records."
          href="/super-admin/operations"
          ctaLabel="Review system health"
          tone="neutral"
        >
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              Read-only operations foundation
            </p>
            <p className="mt-1">
              No retry, provisioning, entitlement, pricing, assignment, or
              runtime controls.
            </p>
          </div>
        </SettingsOverviewCard>
      </div>
    </div>
  );
}
