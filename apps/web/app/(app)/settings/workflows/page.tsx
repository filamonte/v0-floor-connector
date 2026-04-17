import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { updateOrganizationWorkflowSettingsAction } from "@/lib/settings/actions";
import { listDocumentTemplates } from "@/lib/templates/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsWorkflowsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/workflows");
  const [workflowSettings, templates] = await Promise.all([
    getOrganizationWorkflowSettings(scope.organizationId),
    listDocumentTemplates("contract")
  ]);

  const activeContractTemplates = templates.filter(
    (template) => template.status === "active"
  );

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Workflow Defaults"
        description="Set the preferred contract template for approved-estimate generation and store contractor approval and deposit-readiness defaults without breaking the canonical estimate → contract → invoice chain."
      >
        <form action={updateOrganizationWorkflowSettingsAction} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Approved-estimate contract template
            </span>
            <select
              name="approvedEstimateContractTemplateId"
              defaultValue={workflowSettings.approvedEstimateContractTemplateId ?? ""}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            >
              <option value="">Use the organization default contract template</option>
              {activeContractTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.isDefault ? " - default" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireContractInternalApproval"
              defaultChecked={workflowSettings.requireContractInternalApproval}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Require internal approval before contract send
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                This stays as an organization-owned workflow preference rather than a hardcoded product rule.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              type="checkbox"
              name="requireDepositBeforeJobScheduling"
              defaultChecked={workflowSettings.requireDepositBeforeJobScheduling}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Require deposit before scheduling
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Stores the organization&apos;s readiness preference while deeper billing enforcement remains modular future work.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Default deposit %
            </span>
            <input
              name="defaultDepositPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={workflowSettings.defaultDepositPercentage}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Contracts still generate from approved estimates using canonical project, customer, and estimate context. Draft contracts can be customized before signature activity locks the record.
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Save workflow defaults
          </button>
        </form>
      </DetailPanel>
    </div>
  );
}
