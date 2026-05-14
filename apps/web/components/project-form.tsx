import type {
  Customer,
  Project,
  ProjectStatus
} from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { CountryComboboxField } from "@/components/country-combobox-field";
import { CustomerPickerField } from "@/components/customer-picker-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { projectStatusesList } from "@/lib/projects/schemas";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  customers: Customer[];
  project?: Project | null;
  initialCustomerId?: string | null;
  allowInlineCustomerCreate?: boolean;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function formatStatusLabel(status: ProjectStatus) {
  return status.replaceAll("_", " ");
}

export function ProjectForm({
  action,
  submitLabel,
  pendingLabel,
  customers,
  project,
  initialCustomerId,
  allowInlineCustomerCreate = !project
}: ProjectFormProps) {
  const availableStatuses = projectStatusesList.filter((status) =>
    project?.operationalActivatedAt
      ? true
      : status === "lead" || status === "estimating" || status === "approved"
  );

  return (
    <SaveStateForm
      action={action}
      enabled={Boolean(project)}
      pendingLabel={pendingLabel}
      className="space-y-5"
    >
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}
      <input
        type="hidden"
        name="financingStatus"
        value={project?.financingStatus ?? "not_applicable"}
      />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <AuthField
          label="Project name"
          name="name"
          defaultValue={project?.name ?? ""}
          placeholder="Smith Garage Coating"
          hint="Use a short, descriptive project name."
          required
        />

        <CustomerPickerField
          customers={customers}
          initialCustomerId={project?.customerId ?? initialCustomerId ?? ""}
          allowCreate={allowInlineCustomerCreate}
          required={!allowInlineCustomerCreate}
        />

        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={project?.status ?? "lead"}
            className="w-full min-w-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          {!project?.operationalActivatedAt ? (
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              Pre-contract projects stay in commercial stages. Scheduling and execution
              statuses unlock only after the contract is signed.
            </span>
          ) : null}
        </label>

        <AuthField
          label="Address line 1"
          name="addressLine1"
          defaultValue={getValue(project?.addressLine1)}
          placeholder="123 Main Street"
        />
        <AuthField
          label="Address line 2"
          name="addressLine2"
          defaultValue={getValue(project?.addressLine2)}
          placeholder="Suite 200"
        />
        <AuthField
          label="City"
          name="city"
          defaultValue={getValue(project?.city)}
          placeholder="Charlotte"
        />
        <AuthField
          label="State / region"
          name="stateRegion"
          defaultValue={getValue(project?.stateRegion)}
          placeholder="NC"
        />
        <AuthField
          label="ZIP / postal code"
          name="postalCode"
          defaultValue={getValue(project?.postalCode)}
          placeholder="28202"
        />
        <CountryComboboxField
          name="countryCode"
          defaultValue={getValue(project?.countryCode)}
        />
      </div>

      <label className="block min-w-0">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Scope notes
        </span>
        <textarea
          name="description"
          defaultValue={getValue(project?.description)}
          rows={5}
          className="w-full min-w-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional project description or scope notes"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="sm:min-w-[200px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Project records stay scoped to the active organization automatically.
        </p>
      </div>
    </SaveStateForm>
  );
}
