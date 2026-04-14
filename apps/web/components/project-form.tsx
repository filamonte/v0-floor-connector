import type { Customer, Project, ProjectStatus } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { projectStatusesList } from "@/lib/projects/schemas";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  customers: Customer[];
  project?: Project | null;
  initialCustomerId?: string | null;
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
  initialCustomerId
}: ProjectFormProps) {
  return (
    <form action={action} className="space-y-5">
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Project name"
          name="name"
          defaultValue={project?.name ?? ""}
          placeholder="Smith Garage Coating"
          hint="Use a short, descriptive project name."
          required
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Customer
          </span>
          <select
            name="customerId"
            defaultValue={project?.customerId ?? initialCustomerId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.companyName ? ` - ${customer.companyName}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Projects must belong to an existing customer in the same organization.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={project?.status ?? "lead"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            {projectStatusesList.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
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
          label="Postal code"
          name="postalCode"
          defaultValue={getValue(project?.postalCode)}
          placeholder="28202"
        />
        <AuthField
          label="Country code"
          name="countryCode"
          defaultValue={getValue(project?.countryCode)}
          placeholder="US"
          hint="Use a two-letter country code when available."
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Scope notes
        </span>
        <textarea
          name="description"
          defaultValue={getValue(project?.description)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional project description or scope notes"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[200px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Project records stay scoped to the active organization automatically.
        </p>
      </div>
    </form>
  );
}
