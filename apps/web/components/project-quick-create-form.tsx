"use client";

import type { Customer } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ProjectQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Customer[];
  initialCustomerId?: string | null;
};

export function ProjectQuickCreateForm({
  action,
  customers,
  initialCustomerId
}: ProjectQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create project"
        description="Create the canonical project first with just a name and customer. Scope, location, and workflow details can be finished inside the full project workspace."
        footer="This creates a real project record and takes you straight into the full project workspace."
      >
        <div className="grid gap-4">
          <AuthField
            label="Project name"
            name="name"
            placeholder="Smith Garage Coating"
            hint="Use a short, descriptive project name."
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Customer</span>
            <select
              name="customerId"
              defaultValue={initialCustomerId ?? ""}
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
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
          </label>
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating project..." className="w-full">
          <span>Create project</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
