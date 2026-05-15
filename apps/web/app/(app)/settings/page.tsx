import Link from "next/link";

import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsOverviewCard } from "@/components/settings-overview-card";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { requireOrganizationAdminScope, listOrganizationMembers } from "@/lib/organizations/admin";
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

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
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
  const systemCount = catalogItems.filter((item) => item.itemType === "system").length;
  const addOnOptionCount = catalogItems.filter(
    (item) => (item.category ?? "").trim().toLowerCase() === "add-ons / options"
  ).length;

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-3">
        <div className="bg-white px-5 py-4">
          <p className="text-sm font-semibold text-[#221a14]">Document templates</p>
          <p className="mt-2 text-sm leading-6 text-[#6f6256]">
            {allTemplates.length} organization-owned template
            {allTemplates.length === 1 ? "" : "s"} across estimate, invoice, and contract workflows.
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-sm font-semibold text-[#221a14]">Financial baseline</p>
          <p className="mt-2 text-sm leading-6 text-[#6f6256]">
            {financialSettings.defaultTaxBehavior} tax at{" "}
            {formatPercentFromRate(financialSettings.defaultTaxRate)}% with{" "}
            {financialSettings.defaultRetainagePercentage}% retainage baseline.
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <p className="text-sm font-semibold text-[#221a14]">Workflow readiness</p>
          <p className="mt-2 text-sm leading-6 text-[#6f6256]">
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
          <div className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p className="font-medium text-[#221a14]">{scope.organization.legalName}</p>
            <p>{scope.organization.displayName} · `{scope.organization.slug}`</p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Document templates"
          description="Adopt platform defaults into org-owned estimate, invoice, and contract templates."
          href="/settings/templates"
          ctaLabel="Manage templates"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["estimate", "invoice", "contract"] as const).map((templateType) => {
              const count = allTemplates.filter(
                (template) => template.templateType === templateType
              ).length;

              return (
                <div
                  key={templateType}
                  className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-3 text-sm text-[#6f6256]"
                >
                  <p className="font-medium capitalize text-[#221a14]">{templateType}</p>
                  <p className="mt-1">{count} template{count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Catalog configuration"
          description="Adjust the settings that support Catalog Items, Systems, Add-ons / Options, and inventory behavior without moving the module out of Financials."
          href="/settings/catalogs"
          ctaLabel="Open catalog configuration"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {(["material", "labor", "service", "equipment", "system"] as const).map((itemType) => {
              const count = catalogItems.filter((item) => item.itemType === itemType).length;

              return (
                <div
                  key={itemType}
                  className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-3 text-sm text-[#6f6256]"
                >
                  <p className="font-medium capitalize text-[#221a14]">{itemType}s</p>
                  <p className="mt-1">{count} item{count === 1 ? "" : "s"}</p>
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
          <div className="space-y-3 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p>
              <span className="font-medium text-[#221a14]">{allTemplates.length}</span>{" "}
              Document Templates support estimate, invoice, and contract output.
            </p>
            <p>
              <span className="font-medium text-[#221a14]">{systemCount}</span> Systems
              and <span className="font-medium text-[#221a14]">{addOnOptionCount}</span>{" "}
              Add-ons / Options are managed as Catalog Items today.
            </p>
            <p>
              <span className="font-medium text-[#221a14]">
                {systemLayersData.finishProducts.length}
              </span>{" "}
              Finish Products and{" "}
              <span className="font-medium text-[#221a14]">
                {systemLayersData.templates.length}
              </span>{" "}
              Floor System Templates are available for admin maintenance.
            </p>
            <p>
              Estimate generation, sharing, promotion, selected systems, snapshots, and
              downstream workflow hooks remain deferred.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/settings/system-layers"
                className="inline-flex border border-[#d9cdc2] bg-white px-3 py-1.5 text-xs font-medium text-[#594839] transition hover:border-[#ef7d32]"
              >
                System layers
              </Link>
              <Link
                href="/settings/selected-systems"
                className="inline-flex border border-[#d9cdc2] bg-white px-3 py-1.5 text-xs font-medium text-[#594839] transition hover:border-[#ef7d32]"
              >
                Selected systems
              </Link>
              <Link
                href="/settings/catalogs"
                className="inline-flex border border-[#d9cdc2] bg-white px-3 py-1.5 text-xs font-medium text-[#594839] transition hover:border-[#ef7d32]"
              >
                Catalog settings
              </Link>
              <Link
                href="/cost-items-database/systems"
                className="inline-flex border border-[#d9cdc2] bg-white px-3 py-1.5 text-xs font-medium text-[#594839] transition hover:border-[#ef7d32]"
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
          <div className="space-y-3 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p>
              <span className="font-medium text-[#221a14]">
                {selectedSystemsData.selectedSystems.length}
              </span>{" "}
              selected system
              {selectedSystemsData.selectedSystems.length === 1 ? "" : "s"} are stored
              on tenant-owned `selected_floor_systems` rows.
            </p>
            <p>
              This admin route verifies CRUD, status changes, project primary selection,
              and same-company link validation only.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Financial defaults"
          description="Set the baseline tax and retainage values used to seed downstream billing records."
          href="/settings/financial"
          ctaLabel="Manage financial defaults"
        >
          <div className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p className="font-medium text-[#221a14]">Default tax behavior</p>
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
          <div className="space-y-2 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p>
              Internal approval:{" "}
              <span className="font-medium text-[#221a14]">
                {workflowSettings.requireContractInternalApproval ? "required" : "not required"}
              </span>
            </p>
            <p>
              Deposit before scheduling:{" "}
              <span className="font-medium text-[#221a14]">
                {workflowSettings.requireDepositBeforeJobScheduling ? "required" : "optional"}
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
          <div className="space-y-2 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
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
          <div className="space-y-2 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p>
              Seven organization-owned rule templates control derived cues for estimates,
              contracts, invoices, and jobs.
            </p>
            <p>
              Editable fields are enablement, threshold days, and urgency. Cue results
              still derive from canonical records; dismiss and snooze only affect user
              visibility.
            </p>
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Automation readiness"
          description="Review canonical automation foundations and store future notification-only preferences without enabling execution."
          href="/settings/automation"
          ctaLabel="Open automation planning"
        >
          <div className="space-y-2 border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-4 text-sm leading-6 text-[#6f6256]">
            <p>
              Communications and payment failures already expose live visibility on canonical records.
            </p>
            <p>
              Future notification preferences can be saved here, but scheduling, contract follow-up, and overdue collections still do not execute automatically.
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
            <div className="border border-[#d9cdc2] bg-[#fbf7f2] px-4 py-3 text-sm text-[#6f6256]">
              <p className="font-medium text-[#221a14]">{members.length} members</p>
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
