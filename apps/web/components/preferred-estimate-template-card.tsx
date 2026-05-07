import type { DocumentTemplate } from "@floorconnector/types";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { updatePreferredEstimateTemplateAction } from "@/lib/settings/actions";
import type { UserEstimateTemplatePreference } from "@/lib/user-preferences/estimate-template-preference";

type PreferredEstimateTemplateCardProps = {
  templates: DocumentTemplate[];
  preference: UserEstimateTemplatePreference | null;
};

export function PreferredEstimateTemplateCard({
  templates,
  preference
}: PreferredEstimateTemplateCardProps) {
  const activeEstimateTemplates = templates.filter(
    (template) => template.templateType === "estimate" && template.status === "active"
  );
  const companyDefault = activeEstimateTemplates.find((template) => template.isDefault);
  const selectedTemplate = preference?.template ?? null;

  return (
    <section className="border border-[#d9cdc2] bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
            Personal default
          </p>
          <h3 className="mt-2 text-base font-semibold text-[#221a14]">
            Your estimate template preference
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f6256]">
            Choose the active organization-owned estimate template FloorConnector
            should prefer for new estimates you create. This personal preference
            does not change the company default template and does not rewrite
            existing estimates.
          </p>
        </div>
        <span className="inline-flex w-fit border border-[#eaded3] bg-[#fbf7f2] px-3 py-1 text-xs font-medium text-[#6f6256]">
          Safe personal default only
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="border border-[#eaded3] bg-[#fbf7f2] px-4 py-3 text-sm leading-6 text-[#6f6256]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
            Company default
          </p>
          <p className="mt-1 font-medium text-[#221a14]">
            {companyDefault?.name ?? "No active company estimate default"}
          </p>
        </div>
        <div className="border border-[#eaded3] bg-[#fbf7f2] px-4 py-3 text-sm leading-6 text-[#6f6256]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
            Your current preference
          </p>
          <p className="mt-1 font-medium text-[#221a14]">
            {selectedTemplate?.name ?? "Using company default"}
          </p>
        </div>
      </div>

      <SaveStateForm
        action={updatePreferredEstimateTemplateAction}
        pendingLabel="Saving..."
        className="mt-5 space-y-4"
      >
        <input type="hidden" name="returnTo" value="/settings/profile" />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#221a14]">
            Preferred estimate template
          </span>
          <select
            name="preferredEstimateTemplateId"
            defaultValue={selectedTemplate?.id ?? ""}
            className="w-full border border-[#d9cdc2] bg-white px-4 py-3 text-sm text-[#221a14] outline-none transition focus:border-[#ef7d32] focus:ring-4 focus:ring-[#ef7d32]/15"
          >
            <option value="">Use company default</option>
            {activeEstimateTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
                {template.isDefault ? " - company default" : ""}
              </option>
            ))}
          </select>
        </label>

        {activeEstimateTemplates.length === 0 ? (
          <p className="border border-dashed border-[#d9cdc2] bg-[#fbf7f2] px-4 py-3 text-sm leading-6 text-[#6f6256]">
            No active estimate templates are available yet. Ask an organization
            admin to adopt or activate an estimate template before setting a
            personal preference.
          </p>
        ) : null}

        <SaveStateSubmitButton
          submitLabel="Save preference"
          pendingLabel="Saving..."
          className="rounded-full"
        />
      </SaveStateForm>
    </section>
  );
}
