import type { PlatformTemplateSeed, TemplateType } from "@floorconnector/types";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { updatePlatformTemplateSeedAction } from "@/lib/platform-admin/actions";

type PlatformTemplateSeedCardProps = {
  id?: string;
  templateType: TemplateType;
  seeds: PlatformTemplateSeed[];
};

function getLabel(templateType: TemplateType) {
  switch (templateType) {
    case "estimate":
      return "Estimate starter templates";
    case "invoice":
      return "Invoice starter templates";
    case "contract":
      return "Contract starter templates";
    default:
      return "Starter templates";
  }
}

export function PlatformTemplateSeedCard({
  id,
  templateType,
  seeds
}: PlatformTemplateSeedCardProps) {
  return (
    <section
      id={id}
      className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
    >
      <p className="text-base font-semibold text-slate-950">{getLabel(templateType)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Platform starter templates are the global defaults contractor organizations can adopt as editable tenant-owned copies.
      </p>

      <div className="mt-6 space-y-4">
        {seeds.map((seed) => (
          <SaveStateForm
            key={seed.id}
            action={updatePlatformTemplateSeedAction}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            pendingLabel="Saving..."
          >
            <input type="hidden" name="seedId" value={seed.id} />
            <div className="flex flex-wrap items-center gap-2">
              {seed.isDefault ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Default
                </span>
              ) : null}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {seed.isActive ? "active" : "inactive"}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {seed.seedKey}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Name
                </span>
                <input
                  name="name"
                  defaultValue={seed.name}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={seed.isDefault}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                />
                <span className="text-sm text-slate-700">
                  Use as the platform default {templateType} starter template
                </span>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Description
              </span>
              <input
                name="description"
                defaultValue={seed.description ?? ""}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Subject template
              </span>
              <input
                name="subjectTemplate"
                defaultValue={seed.subjectTemplate ?? ""}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Body template
              </span>
              <textarea
                name="bodyTemplate"
                defaultValue={seed.bodyTemplate}
                rows={8}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
              Merge fields:{" "}
              {seed.mergeFieldManifest.length > 0
                ? seed.mergeFieldManifest.join(", ")
                : "No merge fields documented yet."}
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={seed.isActive}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
              />
              <span className="text-sm text-slate-700">
                Allow contractor organizations to adopt this starter template
              </span>
            </label>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-slate-500">
                Schema version {seed.schemaVersion}
              </p>
              <SaveStateSubmitButton
                submitLabel="Save starter template"
                pendingLabel="Saving..."
                className="rounded-full"
              />
            </div>
          </SaveStateForm>
        ))}
      </div>
    </section>
  );
}
