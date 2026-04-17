import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsOverviewCard } from "@/components/settings-overview-card";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { requireOrganizationAdminScope, listOrganizationMembers } from "@/lib/organizations/admin";
import { listOrganizationFeatureOverrides } from "@/lib/organizations/module-settings";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listCatalogItems } from "@/lib/catalogs/data";
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
    featureOverrides
  ] = await Promise.all([
    listDocumentTemplates(),
    listCatalogItems(),
    getOrganizationFinancialSettings(scope.organizationId),
    getOrganizationWorkflowSettings(scope.organizationId),
    listOrganizationMembers(scope.organizationId),
    listOrganizationFeatureOverrides(scope.organizationId)
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-medium text-slate-950">Document templates</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {allTemplates.length} organization-owned template
            {allTemplates.length === 1 ? "" : "s"} across estimate, invoice, and contract workflows.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-medium text-slate-950">Financial baseline</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {financialSettings.defaultTaxBehavior} tax at{" "}
            {formatPercentFromRate(financialSettings.defaultTaxRate)}% with{" "}
            {financialSettings.defaultRetainagePercentage}% retainage baseline.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-medium text-slate-950">Workflow readiness</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">{scope.organization.legalName}</p>
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
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <p className="font-medium capitalize text-slate-950">{templateType}</p>
                  <p className="mt-1">{count} template{count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Catalogs and reusable items"
          description="Own reusable materials, services, and system defaults inside the organization boundary."
          href="/settings/catalogs"
          ctaLabel="Manage catalogs"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["material", "service", "system"] as const).map((itemType) => {
              const count = catalogItems.filter((item) => item.itemType === itemType).length;

              return (
                <div
                  key={itemType}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <p className="font-medium capitalize text-slate-950">{itemType}s</p>
                  <p className="mt-1">{count} item{count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </SettingsOverviewCard>

        <SettingsOverviewCard
          title="Financial defaults"
          description="Set the baseline tax and retainage values used to seed downstream billing records."
          href="/settings/financial"
          ctaLabel="Manage financial defaults"
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-950">Default tax behavior</p>
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
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            <p>
              Internal approval:{" "}
              <span className="font-medium text-slate-950">
                {workflowSettings.requireContractInternalApproval ? "required" : "not required"}
              </span>
            </p>
            <p>
              Deposit before scheduling:{" "}
              <span className="font-medium text-slate-950">
                {workflowSettings.requireDepositBeforeJobScheduling ? "required" : "optional"}
              </span>
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-medium text-slate-950">{members.length} members</p>
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
