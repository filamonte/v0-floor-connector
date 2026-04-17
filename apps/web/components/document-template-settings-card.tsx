import type { DocumentTemplate, PlatformTemplateSeed, TemplateType } from "@floorconnector/types";

import {
  adoptPlatformTemplateSeedAction,
  updateDocumentTemplateSettingsAction
} from "@/lib/settings/actions";

type DocumentTemplateSettingsCardProps = {
  templateType: TemplateType;
  templates: DocumentTemplate[];
  availableSeeds: PlatformTemplateSeed[];
};

function getTemplateTypeLabel(templateType: TemplateType) {
  switch (templateType) {
    case "estimate":
      return "Estimate templates";
    case "invoice":
      return "Invoice templates";
    case "contract":
      return "Contract templates";
    default:
      return "Templates";
  }
}

function getTemplateTypeDescription(templateType: TemplateType) {
  switch (templateType) {
    case "estimate":
      return "Manage the organization-owned estimate outputs that should be used when estimate documents are rendered.";
    case "invoice":
      return "Manage the invoice templates that keep billing output consistent across this organization.";
    case "contract":
      return "Manage the contract templates used during approved-estimate contract generation and downstream review.";
    default:
      return "Manage the organization-owned document templates for this workflow.";
  }
}

export function DocumentTemplateSettingsCard({
  templateType,
  templates,
  availableSeeds
}: DocumentTemplateSettingsCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-slate-950">
          {getTemplateTypeLabel(templateType)}
        </p>
        <p className="text-sm leading-6 text-slate-600">
          {getTemplateTypeDescription(templateType)}
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <form
              key={template.id}
              action={updateDocumentTemplateSettingsAction}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            >
              <input type="hidden" name="templateId" value={template.id} />

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {template.sourceSeedKey ? "Seeded copy" : "Organization template"}
                </span>
                {template.isDefault ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Default
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {template.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Template name
                  </span>
                  <input
                    name="name"
                    defaultValue={template.name}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue={template.status}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Description
                </span>
                <input
                  name="description"
                  defaultValue={template.description ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Subject template
                </span>
                <input
                  name="subjectTemplate"
                  defaultValue={template.subjectTemplate ?? ""}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Body template
                </span>
                <textarea
                  name="bodyTemplate"
                  defaultValue={template.bodyTemplate}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                Merge fields:{" "}
                {template.mergeFieldManifest.length > 0
                  ? template.mergeFieldManifest.join(", ")
                  : "No merge fields documented yet."}
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={template.isDefault}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Use as the organization default {templateType} template
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Default templates are used when downstream workflow screens do not pick a more specific template explicitly.
                  </span>
                </span>
              </label>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Schema version {template.schemaVersion}
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
                >
                  Save template
                </button>
              </div>
            </form>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
            This organization does not have any {templateType} template copies yet. Adopt a platform seed below to start with a real editable baseline.
          </div>
        )}

        {availableSeeds.length > 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-950">Available platform seeds</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Adopt a platform default as an organization-owned editable copy.
            </p>
            <div className="mt-4 grid gap-3">
              {availableSeeds.map((seed) => (
                <form
                  key={seed.id}
                  action={adoptPlatformTemplateSeedAction}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <input type="hidden" name="seedId" value={seed.id} />
                  <div>
                    <p className="text-sm font-medium text-slate-950">{seed.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {seed.description ?? "Platform template seed"}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    Adopt seed
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
