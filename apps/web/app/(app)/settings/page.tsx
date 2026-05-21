import Link from "next/link";

import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsOverviewCard } from "@/components/settings-overview-card";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import {
  requireOrganizationAdminScope,
  listOrganizationMembers
} from "@/lib/organizations/admin";
import { listOrganizationFeatureOverrides } from "@/lib/organizations/module-settings";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listCatalogItems } from "@/lib/catalogs/data";
import { getSelectedSystemsAdminData } from "@/lib/selected-systems/data";
import { getSystemLayersAdminData } from "@/lib/system-layers/data";
import { listDocumentTemplates } from "@/lib/templates/data";

type SettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatPercentFromRate(rate: string) {
  return (Number(rate) * 100).toFixed(2);
}

const settingsMetricCardClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white px-5 py-4 shadow-[0_14px_34px_-32px_rgba(34,26,20,0.22)]";
const settingsInsetPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]";
const settingsMiniStatClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm text-[var(--text-secondary)]";
const settingsInlineActionClassName =
  "inline-flex rounded-md border border-[var(--border-warm)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

export default async function SettingsPage({
  searchParams
}: SettingsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings");

  const [
    allTemplates,
    catalogItems,
    financialSettings,
    workflowSettings,
    members,
    featureOverrides,
    systemLayersData,
    selectedSystemsData
  ] = await Promise.all([
    listDocumentTemplates(),
    listCatalogItems(),
    getOrganizationFinancialSettings(scope.organizationId),
    getOrganizationWorkflowSettings(scope.organizationId),
    listOrganizationMembers(scope.organizationId),
    listOrganizationFeatureOverrides(scope.organizationId),
    getSystemLayersAdminData("/settings"),
    getSelectedSystemsAdminData("/settings")
  ]);
  const systemCount = catalogItems.filter(
    (item) => item.itemType === "system"
  ).length;
  const addOnOptionCount = catalogItems.filter(
    (item) => (item.category ?? "").trim().toLowerCase() === "add-ons / options"
  ).length;

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={settingsMetricCardClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Document templates
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {allTemplates.length} organization-owned template
            {allTemplates.length === 1 ? "" : "s"} across estimate, invoice, and
            contract workflows.
          </p>
        </div>
        <div className={settingsMetricCardClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Financial baseline
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {financialSettings.defaultTaxBehavior} tax at{" "}
            {formatPercentFromRate(financialSettings.defaultTaxRate)}% with{" "}
            {financialSettings.defaultRetainagePercentage}% retainage baseline.
          </p>
        </div>
        <div className={settingsMetricCardClassName}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
            Workflow readiness
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {workflowSettings.approvedEstimateContractTemplateId
              ? "Approved-estimate contract template assigned."
              : "Using default contract template resolution."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsOverviewCard
          title="Organization profile"
          description="Keep tenant identity, contractor branding, and core organization metadata aligned."
          href="/settings/organization"
          ctaLabel="Manage organization"
        >
          <div className={settingsInsetPanelClassName}>
            <p className="font-medium text-[var(--text-primary)]">
              {scope.organization.legalName}
            </p>
            <p>
              {scope.organization.displayName} · `{scope.organization.slug}`
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Document templates"
          description="Adopt platform defaults into org-owned estimate, invoice, and contract templates."
          href="/settings/templates"
          ctaLabel="Manage templates"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["estimate", "invoice", "contract"] as const).map(
              (templateType) => {
                const count = allTemplates.filter(
                  (template) => template.templateType === templateType
                ).length;

                return (
                  <div key={templateType} className={settingsMiniStatClassName}>
                    <p className="font-medium capitalize text-[var(--text-primary)]">
                      {templateType}
                    </p>
                    <p className="mt-1">
                      {count} template{count === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Catalog configuration"
          description="Adjust the settings that support Catalog Items, Systems, Add-ons / Options, and inventory behavior without moving the module out of Financials."
          href="/settings/catalogs"
          ctaLabel="Open catalog configuration"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {(
              ["material", "labor", "service", "equipment", "system"] as const
            ).map((itemType) => {
              const count = catalogItems.filter(
                (item) => item.itemType === itemType
              ).length;

              return (
                <div key={itemType} className={settingsMiniStatClassName}>
                  <p className="font-medium capitalize text-[var(--text-primary)]">
                    {itemType}s
                  </p>
                  <p className="mt-1">
                    {count} item{count === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Templates & Systems"
          description="Current reusable setup lives across Document Templates, Cost Items Database Systems, and the first System Layers admin surface."
          href="/settings/system-layers"
          ctaLabel="Manage system layers"
        >
          <div className={`space-y-3 ${settingsInsetPanelClassName}`}>
            <p>
              <span className="font-medium text-[var(--text-primary)]">
                {allTemplates.length}
              </span>{" "}
              Document Templates support estimate, invoice, and contract output.
            </p>
            <p>
              <span className="font-medium text-[var(--text-primary)]">
                {systemCount}
              </span>{" "}
              Systems and{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {addOnOptionCount}
              </span>{" "}
              Add-ons / Options are managed as Catalog Items today.
            </p>
            <p>
              <span className="font-medium text-[var(--text-primary)]">
                {systemLayersData.finishProducts.length}
              </span>{" "}
              Finish Products and{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {systemLayersData.templates.length}
              </span>{" "}
              Floor System Templates are available for admin maintenance.
            </p>
            <p>
              Estimate generation, sharing, promotion, selected systems,
              snapshots, and downstream workflow hooks remain deferred.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/settings/system-layers"
                className={settingsInlineActionClassName}
              >
                System layers
              </Link>
              <Link
                href="/settings/selected-systems"
                className={settingsInlineActionClassName}
              >
                Selected systems
              </Link>
              <Link
                href="/settings/catalogs"
                className={settingsInlineActionClassName}
              >
                Catalog settings
              </Link>
              <Link
                href="/cost-items-database/systems"
                className={settingsInlineActionClassName}
              >
                Systems workspace
              </Link>
            </div>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Selected Systems"
          description="Validate selected floor system records against tenant-owned templates, finish products, and real workflow anchors without activating downstream integrations."
          href="/settings/selected-systems"
          ctaLabel="Manage selected systems"
        >
          <div className={`space-y-3 ${settingsInsetPanelClassName}`}>
            <p>
              <span className="font-medium text-[var(--text-primary)]">
                {selectedSystemsData.selectedSystems.length}
              </span>{" "}
              selected system
              {selectedSystemsData.selectedSystems.length === 1 ? "" : "s"} are
              stored on tenant-owned `selected_floor_systems` rows.
            </p>
            <p>
              This admin route verifies CRUD, status changes, project primary
              selection, and same-company link validation only.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Financial defaults"
          description="Set the baseline tax and retainage values used to seed downstream billing records."
          href="/settings/financial"
          ctaLabel="Manage financial defaults"
        >
          <div className={settingsInsetPanelClassName}>
            <p className="font-medium text-[var(--text-primary)]">
              Default tax behavior
            </p>
            <p>
              {financialSettings.defaultTaxBehavior} at{" "}
              {formatPercentFromRate(financialSettings.defaultTaxRate)}%
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Workflow defaults"
          description="Shape contract generation and deposit-readiness behavior for approved work."
          href="/settings/workflows"
          ctaLabel="Manage workflow defaults"
        >
          <div className={`space-y-2 ${settingsInsetPanelClassName}`}>
            <p>
              Internal approval:{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {workflowSettings.requireContractInternalApproval
                  ? "required"
                  : "not required"}
              </span>
            </p>
            <p>
              Deposit before scheduling:{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {workflowSettings.requireDepositBeforeJobScheduling
                  ? "required"
                  : "optional"}
              </span>
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Data export"
          description="Export tenant-scoped CSV and JSON manifests for canonical customers, projects, estimates, invoices, payments, jobs, and related detail rows."
          href="/settings/export"
          ctaLabel="Open data export"
        >
          <div className={`space-y-2 ${settingsInsetPanelClassName}`}>
            <p>
              Export is read-only and owner/admin scoped. Import remains
              validation planning only with no upload or write path enabled.
            </p>
            <p>
              Portal invite tokens, payment secrets, webhook payloads, and raw
              provider data are excluded.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Operational Intelligence"
          description="Configure deterministic cues, responsibility defaults, and user-scoped dismiss/snooze behavior without creating task records or custom automation logic."
          href="/settings/operational-intelligence"
          ctaLabel="Configure My Work cues"
        >
          <div className={`space-y-2 ${settingsInsetPanelClassName}`}>
            <p>
              Seven organization-owned rule templates control derived cues for
              estimates, contracts, invoices, and jobs.
            </p>
            <p>
              Editable fields are enablement, threshold days, and urgency. Cue
              results still derive from canonical records; dismiss and snooze
              only affect user visibility.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Automation readiness"
          description="Review canonical automation foundations and store future notification-only preferences without enabling execution."
          href="/settings/automation"
          ctaLabel="Open automation planning"
        >
          <div className={`space-y-2 ${settingsInsetPanelClassName}`}>
            <p>
              Communications and payment failures already expose live visibility
              on canonical records.
            </p>
            <p>
              Future notification preferences can be saved here, but scheduling,
              contract follow-up, and overdue collections still do not execute
              automatically.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Admin and module controls"
          description="Review members, roles, and feature overrides allowed under the platform policy."
          href="/settings/admin"
          ctaLabel="Open admin controls"
        >
          <div className="space-y-3">
            <div className={settingsMiniStatClassName}>
              <p className="font-medium text-[var(--text-primary)]">
                {members.length} members
              </p>
              <p className="mt-1">
                {featureOverrides.length} organization-specific feature override
                {featureOverrides.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </SettingsOverviewCard>
      </div>
    </div>
  );
}
