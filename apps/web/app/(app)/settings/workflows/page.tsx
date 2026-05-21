import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { updateOrganizationWorkflowSettingsAction } from "@/lib/settings/actions";
import { listDocumentTemplates } from "@/lib/templates/data";

const workflowModeOptions = [
  {
    value: "guided",
    label: "Guided workflow",
    description:
      "Show the strongest coaching, next steps, and readiness framing."
  },
  {
    value: "flexible",
    label: "Flexible workflow",
    description:
      "Keep guidance visible while giving teams quieter shortcut context."
  },
  {
    value: "manual",
    label: "Manual workflow",
    description:
      "Reduce prompts and let experienced teams work with fewer coaching cues."
  }
] as const;

const workflowFieldClassName =
  "w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--graphite)] focus:ring-2 focus:ring-[var(--focus-ring)]";
const workflowChoiceClassName =
  "flex items-start gap-3 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4";
const workflowPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4 shadow-sm";
const workflowNoticeClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]";
const workflowDashedNoticeClassName =
  "rounded-lg border border-dashed border-[var(--border-warm)] bg-white px-4 py-4 text-xs leading-5 text-[var(--text-muted)]";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsWorkflowsPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/workflows");
  const [workflowSettings, templates] = await Promise.all([
    getOrganizationWorkflowSettings(scope.organizationId),
    listDocumentTemplates("contract")
  ]);

  const activeContractTemplates = templates.filter(
    (template) => template.status === "active"
  );
  const guidancePreferences = workflowSettings.workflowGuidancePreferences;

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Workflow Defaults"
        description="Set organization-owned contract workflow defaults, estimate starting defaults, and the next human-facing estimate, invoice, change order, and contract numbers without breaking the canonical commercial chain."
      >
        <SaveStateForm
          action={updateOrganizationWorkflowSettingsAction}
          pendingLabel="Saving..."
          className="space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Approved-estimate contract template
            </span>
            <select
              name="approvedEstimateContractTemplateId"
              defaultValue={
                workflowSettings.approvedEstimateContractTemplateId ?? ""
              }
              className={workflowFieldClassName}
            >
              <option value="">
                Use the organization default contract template
              </option>
              {activeContractTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.isDefault ? " - default" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className={workflowChoiceClassName}>
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
                This stays as an organization-owned workflow preference rather
                than a hardcoded product rule.
              </span>
            </span>
          </label>

          <label className={workflowChoiceClassName}>
            <input
              type="checkbox"
              name="requireDepositBeforeJobScheduling"
              defaultChecked={
                workflowSettings.requireDepositBeforeJobScheduling
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Require deposit before scheduling
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Stores the organization&apos;s readiness preference while deeper
                billing enforcement remains modular future work.
              </span>
            </span>
          </label>

          <label className={workflowChoiceClassName}>
            <input
              type="checkbox"
              name="requireContractSignatureBeforeJobScheduling"
              defaultChecked={
                workflowSettings.requireContractSignatureBeforeJobScheduling
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Require signed contract before scheduling
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Keeps commercial readiness aligned with the canonical contract
                record instead of relying on ad hoc job-side exceptions.
              </span>
            </span>
          </label>

          <label className={workflowChoiceClassName}>
            <input
              type="checkbox"
              name="requireFinancingApprovalBeforeJobScheduling"
              defaultChecked={
                workflowSettings.requireFinancingApprovalBeforeJobScheduling
              }
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Require financing approval before scheduling
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Stores whether financed jobs must clear commercial readiness
                before they become eligible for scheduling.
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
              className={workflowFieldClassName}
            />
          </label>

          <section className={workflowPanelClassName}>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Workflow guidance
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Workflow guidance changes how much FloorConnector coaches your
                team through the recommended process. It does not change
                financial, security, signature, or audit rules.
              </p>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {workflowModeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`h-full ${workflowChoiceClassName}`}
                >
                  <input
                    type="radio"
                    name="workflowMode"
                    value={option.value}
                    defaultChecked={
                      guidancePreferences.workflowMode === option.value
                    }
                    className="mt-1 h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-200"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                {
                  name: "showNextBestActions",
                  label: "Show next best actions",
                  description:
                    "Show the primary follow-through cards on project and record workspaces.",
                  checked: guidancePreferences.showNextBestActions
                },
                {
                  name: "showReadinessGuidance",
                  label: "Show readiness guidance",
                  description:
                    "Show readiness summaries and blockers where the workflow already has evidence.",
                  checked: guidancePreferences.showReadinessGuidance
                },
                {
                  name: "strictReadinessEnforcement",
                  label: "Use strict readiness presentation",
                  description:
                    "Keep blockers visually prominent in guided mode. Server-side readiness gates still enforce required workflows either way.",
                  checked: guidancePreferences.strictReadinessEnforcement
                },
                {
                  name: "showShortcutCleanupPrompts",
                  label: "Show shortcut cleanup prompts",
                  description:
                    "Reserve space for future prompts that help teams reconnect safe shortcuts to the canonical workflow.",
                  checked: guidancePreferences.showShortcutCleanupPrompts
                },
                {
                  name: "showWorkflowExplanationCopy",
                  label: "Show workflow explanation copy",
                  description:
                    "Keep short helper copy visible around guidance-heavy workflow sections.",
                  checked: guidancePreferences.showWorkflowExplanationCopy
                }
              ].map((preference) => (
                <label
                  key={preference.name}
                  className={workflowChoiceClassName}
                >
                  <input
                    type="checkbox"
                    name={preference.name}
                    defaultChecked={preference.checked}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {preference.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {preference.description}
                    </span>
                  </span>
                </label>
              ))}

              <div className={workflowDashedNoticeClassName}>
                <p className="text-sm font-medium text-slate-900">
                  Allow one-off invoice shortcuts
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Planned only in this phase. The future shortcut must still
                  create or use canonical customer, project, invoice, and
                  payment records before it can be enabled.
                </p>
              </div>
            </div>
          </section>

          <section className={workflowPanelClassName}>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                AI assistance
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                AI assistance is separate from workflow guidance. Turning
                guidance down does not turn AI on, and turning AI on later will
                still require human confirmation before customer-facing,
                billing, scheduling, permission, signature, or commercial
                actions.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                {
                  name: "enableAiSuggestions",
                  label: "AI suggestions",
                  checked: guidancePreferences.enableAiSuggestions
                },
                {
                  name: "enableAiSummaries",
                  label: "AI summaries",
                  checked: guidancePreferences.enableAiSummaries
                },
                {
                  name: "enableAiDrafting",
                  label: "AI drafting",
                  checked: guidancePreferences.enableAiDrafting
                },
                {
                  name: "enableAiFormPrefillSuggestions",
                  label: "AI form prefill suggestions",
                  checked: guidancePreferences.enableAiFormPrefillSuggestions
                },
                {
                  name: "enableAiWorkItemRecommendations",
                  label: "AI work-item recommendations",
                  checked: guidancePreferences.enableAiWorkItemRecommendations
                }
              ].map((preference) => (
                <label
                  key={preference.name}
                  className={workflowChoiceClassName}
                >
                  <input
                    type="checkbox"
                    name={preference.name}
                    defaultChecked={preference.checked}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {preference.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Stores the preference contract only; no autonomous AI
                      action is enabled here.
                    </span>
                  </span>
                </label>
              ))}

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-950">
                  Human confirmation remains required
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-900">
                  AI-prepared actions cannot auto-send, auto-bill, auto-sign,
                  auto-schedule, or change permissions from these settings.
                </p>
              </div>
            </div>
          </section>

          <div className={workflowNoticeClassName}>
            <p className="font-medium text-slate-900">
              Estimate starting defaults
            </p>
            <p className="mt-2">
              These fields prefill only when a new estimate still has empty
              reusable-content areas. They are organization-owned working
              defaults, even when they originally came from platform starter
              defaults.
            </p>
            <p className="mt-2">
              Reusable content blocks are different: they stay tenant-owned and
              append on demand inside estimate edit. Import from another
              estimate is different too: it copies from a specific prior
              estimate that the user selects.
            </p>
          </div>

          <RichTextEditor
            label="Estimate default terms (starting content)"
            name="defaultEstimateTermsHtml"
            value={workflowSettings.defaultEstimateTermsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Estimate default inclusions (starting content)"
            name="defaultEstimateInclusionsHtml"
            value={workflowSettings.defaultEstimateInclusionsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Estimate default exclusions (starting content)"
            name="defaultEstimateExclusionsHtml"
            value={workflowSettings.defaultEstimateExclusionsHtml}
            mode="standard"
          />
          <RichTextEditor
            label="Estimate default scope / SOW summary (starting content)"
            name="defaultEstimateScopeSummaryHtml"
            value={workflowSettings.defaultEstimateScopeSummaryHtml}
            mode="standard"
          />
          <div className={workflowDashedNoticeClassName}>
            <p>
              Empty estimates only: these defaults do not append into an
              estimate that already has reusable-content text.
            </p>
            <p className="mt-2">
              Separate from reusable blocks: blocks are inserted later, section
              by section, inside estimate edit.
            </p>
            <p className="mt-2">
              Separate from estimate import: import copies line items or
              reusable content from one selected prior estimate and appends it
              into the current estimate.
            </p>
            <p className="mt-2">
              Platform starter defaults explain where these defaults may begin,
              but this page is where your organization owns and edits its
              working estimate defaults.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Next estimate number
              </span>
              <input
                name="nextEstimateNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowSettings.nextEstimateNumber}
                required
                className={workflowFieldClassName}
              />
              <span className="mt-2 block text-xs leading-5 text-slate-500">
                You can set any starting number before estimates exist. After
                that, this value can only move upward.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Next invoice number
              </span>
              <input
                name="nextInvoiceNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowSettings.nextInvoiceNumber}
                required
                className={workflowFieldClassName}
              />
              <span className="mt-2 block text-xs leading-5 text-slate-500">
                This stays plain and human-facing, with no EST or INV prefix.
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Next change order number
              </span>
              <input
                name="nextChangeOrderNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowSettings.nextChangeOrderNumber}
                required
                className={workflowFieldClassName}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Next contract number
              </span>
              <input
                name="nextContractNumber"
                type="number"
                min="1"
                step="1"
                defaultValue={workflowSettings.nextContractNumber}
                required
                className={workflowFieldClassName}
              />
            </label>
          </div>

          <div className={workflowNoticeClassName}>
            Contracts still generate from approved estimates using canonical
            project, customer, estimate, and opportunity continuity. Draft
            contracts can be customized before signature activity locks the
            record, while numbering, deposit, financing, and signature
            expectations remain organization-scoped workflow inputs.
          </div>

          <SaveStateSubmitButton
            submitLabel="Save workflow defaults"
            pendingLabel="Saving..."
          />
        </SaveStateForm>
      </DetailPanel>
    </div>
  );
}
