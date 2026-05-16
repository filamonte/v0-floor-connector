import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  archiveSelectedSystemAction,
  changeSelectedSystemStatusAction,
  saveSelectedSystemAction,
  toggleSelectedSystemPrimaryAction,
  voidSelectedSystemAction
} from "@/lib/selected-systems/actions";
import {
  formatSelectedSystemOption,
  selectedSystemAreaTypes,
  selectedSystemSpecCompletenessStatuses,
  selectedSystemStatuses
} from "@/lib/selected-systems/constants";
import {
  getSelectedSystemsAdminData,
  type SelectedSystem,
  type SelectedSystemLookup
} from "@/lib/selected-systems/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const returnPath = "/settings/selected-systems";

const selectedSystemFieldClassName =
  "w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--graphite)] focus:ring-2 focus:ring-[var(--focus-ring)]";
const selectedSystemPrimaryActionClassName =
  "inline-flex items-center rounded-[4px] border border-[var(--graphite)] bg-[var(--graphite)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--graphite-light)]";
const selectedSystemSecondaryActionClassName =
  "inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]";
const selectedSystemInsetClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4";
const selectedSystemPanelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white shadow-sm";

function Field({
  label,
  name,
  defaultValue,
  required = false,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        className={selectedSystemFieldClassName}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className={selectedSystemFieldClassName}
      />
    </label>
  );
}

function SaveButton({ children = "Save" }: { children?: string }) {
  return (
    <button type="submit" className={selectedSystemPrimaryActionClassName}>
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: string }) {
  return (
    <button type="submit" className={selectedSystemSecondaryActionClassName}>
      {children}
    </button>
  );
}

function OptionSelect({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className={selectedSystemFieldClassName}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatSelectedSystemOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function LookupSelect({
  label,
  name,
  defaultValue,
  options,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: SelectedSystemLookup[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className={selectedSystemFieldClassName}
      >
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
            {option.status
              ? ` (${formatSelectedSystemOption(option.status)})`
              : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectedSystemForm({
  selectedSystem,
  data,
  createMode = false
}: {
  selectedSystem?: SelectedSystem;
  data: Awaited<ReturnType<typeof getSelectedSystemsAdminData>>;
  createMode?: boolean;
}) {
  return (
    <form action={saveSelectedSystemAction} className="space-y-4">
      <input type="hidden" name="returnTo" value={returnPath} />
      <input
        type="hidden"
        name="selectedSystemId"
        value={selectedSystem?.id ?? ""}
      />
      <input
        type="hidden"
        name="source"
        value={selectedSystem?.source ?? "manual"}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <LookupSelect
          label="Template"
          name="floorSystemTemplateId"
          defaultValue={selectedSystem?.floorSystemTemplateId}
          options={data.templates}
        />
        <LookupSelect
          label="Finish product"
          name="finishProductId"
          defaultValue={selectedSystem?.finishProductId}
          options={data.finishProducts}
        />
        <OptionSelect
          label="Status"
          name="status"
          defaultValue={selectedSystem?.status ?? "draft"}
          options={selectedSystemStatuses}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LookupSelect
          label="Project"
          name="projectId"
          defaultValue={selectedSystem?.projectId}
          options={data.projects}
          required={createMode}
        />
        <LookupSelect
          label="Customer"
          name="customerId"
          defaultValue={selectedSystem?.customerId}
          options={data.customers}
        />
        <LookupSelect
          label="Opportunity"
          name="opportunityId"
          defaultValue={selectedSystem?.opportunityId}
          options={data.opportunities}
        />
        <LookupSelect
          label="Estimate"
          name="estimateId"
          defaultValue={selectedSystem?.estimateId}
          options={data.estimates}
        />
        <LookupSelect
          label="Contract"
          name="contractId"
          defaultValue={selectedSystem?.contractId}
          options={data.contracts}
        />
        <LookupSelect
          label="Job"
          name="jobId"
          defaultValue={selectedSystem?.jobId}
          options={data.jobs}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field
          label="Area label"
          name="areaLabel"
          defaultValue={selectedSystem?.areaLabel}
        />
        <OptionSelect
          label="Area type"
          name="areaType"
          defaultValue={selectedSystem?.areaType ?? "whole_project"}
          options={selectedSystemAreaTypes}
        />
        <OptionSelect
          label="Spec status"
          name="specCompletenessStatus"
          defaultValue={selectedSystem?.specCompletenessStatus ?? "incomplete"}
          options={selectedSystemSpecCompletenessStatuses}
        />
        <Field
          label="Phase label"
          name="phaseLabel"
          defaultValue={selectedSystem?.phaseLabel}
        />
        <Field
          label="Option label"
          name="optionLabel"
          defaultValue={selectedSystem?.optionLabel}
        />
        <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isPrimary"
            defaultChecked={selectedSystem?.isPrimary ?? false}
            className="h-4 w-4 rounded border-slate-300 text-brand-700"
          />
          Primary for linked project
        </label>
        <Field
          label="Estimated area sqft"
          name="estimatedAreaSqft"
          defaultValue={selectedSystem?.estimatedAreaSqft}
          type="number"
        />
        <Field
          label="Estimated linear ft"
          name="estimatedLinearFt"
          defaultValue={selectedSystem?.estimatedLinearFt}
          type="number"
        />
      </div>

      <TextAreaField
        label="Quantity notes"
        name="quantityNotes"
        defaultValue={selectedSystem?.quantityNotes}
      />
      <TextAreaField
        label="Customer-facing description"
        name="customerFacingDescription"
        defaultValue={selectedSystem?.customerFacingDescription}
      />
      <TextAreaField
        label="Internal notes"
        name="internalNotes"
        defaultValue={selectedSystem?.internalNotes}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Admin validation only. This does not feed estimates, contracts, jobs,
          files, delivery, or activity.
        </p>
        <SaveButton>
          {selectedSystem ? "Save selected system" : "Create selected system"}
        </SaveButton>
      </div>
    </form>
  );
}

function StatusChangeForm({
  selectedSystem
}: {
  selectedSystem: SelectedSystem;
}) {
  return (
    <form
      action={changeSelectedSystemStatusAction}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="returnTo" value={returnPath} />
      <input type="hidden" name="selectedSystemId" value={selectedSystem.id} />
      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Change status
        </span>
        <select
          name="status"
          defaultValue={selectedSystem.status}
          className={selectedSystemFieldClassName}
        >
          {selectedSystemStatuses.map((status) => (
            <option key={status} value={status}>
              {formatSelectedSystemOption(status)}
            </option>
          ))}
        </select>
      </label>
      <SecondaryButton>Update status</SecondaryButton>
    </form>
  );
}

function PrimaryToggleForm({
  selectedSystem
}: {
  selectedSystem: SelectedSystem;
}) {
  return (
    <form
      action={toggleSelectedSystemPrimaryAction}
      className="flex items-center gap-3"
    >
      <input type="hidden" name="returnTo" value={returnPath} />
      <input type="hidden" name="selectedSystemId" value={selectedSystem.id} />
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isPrimary"
          defaultChecked={selectedSystem.isPrimary}
          className="h-4 w-4 rounded border-slate-300 text-brand-700"
        />
        Primary
      </label>
      <SecondaryButton>Save primary</SecondaryButton>
    </form>
  );
}

export default async function SelectedSystemsSettingsPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getSelectedSystemsAdminData(returnPath);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="System Layers"
        title="Selected Systems"
        description="Validate tenant-owned selected floor systems against real workflow anchors. This admin-only surface intentionally stops before estimate, contract, job, snapshot, file, delivery, or activity integration."
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-3">
            {data.selectedSystems.map((selectedSystem) => (
              <details
                key={selectedSystem.id}
                className={selectedSystemPanelClassName}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    <span className="font-semibold text-slate-950">
                      {selectedSystem.template?.name ??
                        selectedSystem.areaLabel ??
                        "Selected system"}
                    </span>
                    <span className="ml-2 text-slate-500">
                      {formatSelectedSystemOption(selectedSystem.status)}
                    </span>
                    {selectedSystem.isPrimary ? (
                      <span className="ml-2 rounded-[4px] bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Primary
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedSystem.project?.name ??
                      selectedSystem.customer?.name ??
                      selectedSystem.opportunity?.title ??
                      "Anchored"}
                  </span>
                </summary>
                <div className="space-y-5 border-t border-[var(--border-warm)] p-4">
                  <div
                    className={`grid gap-3 text-sm leading-6 text-[var(--text-secondary)] md:grid-cols-3 ${selectedSystemInsetClassName}`}
                  >
                    <p>
                      <span className="font-medium text-slate-950">Area:</span>{" "}
                      {selectedSystem.areaLabel ?? "Unlabeled"} /{" "}
                      {formatSelectedSystemOption(selectedSystem.areaType)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">Spec:</span>{" "}
                      {formatSelectedSystemOption(
                        selectedSystem.specCompletenessStatus
                      )}
                    </p>
                    <p>
                      <span className="font-medium text-slate-950">ID:</span>{" "}
                      <code>{selectedSystem.id}</code>
                    </p>
                  </div>

                  <SelectedSystemForm
                    selectedSystem={selectedSystem}
                    data={data}
                  />

                  <div className="flex flex-wrap gap-3 border-t border-[var(--border-warm)] pt-4">
                    <StatusChangeForm selectedSystem={selectedSystem} />
                    <PrimaryToggleForm selectedSystem={selectedSystem} />
                    <form action={archiveSelectedSystemAction}>
                      <input type="hidden" name="returnTo" value={returnPath} />
                      <input
                        type="hidden"
                        name="selectedSystemId"
                        value={selectedSystem.id}
                      />
                      <SecondaryButton>Retract</SecondaryButton>
                    </form>
                    <form action={voidSelectedSystemAction}>
                      <input type="hidden" name="returnTo" value={returnPath} />
                      <input
                        type="hidden"
                        name="selectedSystemId"
                        value={selectedSystem.id}
                      />
                      <SecondaryButton>Void</SecondaryButton>
                    </form>
                  </div>
                </div>
              </details>
            ))}
            {data.selectedSystems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-6 text-sm leading-6 text-[var(--text-secondary)]">
                No selected systems exist yet.
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] p-4">
            <p className="mb-4 text-sm font-semibold text-slate-950">
              Create selected system
            </p>
            <SelectedSystemForm data={data} createMode />
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
