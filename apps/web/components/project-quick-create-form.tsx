"use client";

import type { Customer } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { CustomerPickerField } from "@/components/customer-picker-field";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ProjectQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  customers: Customer[];
  initialCustomerId?: string | null;
  initialProjectName?: string | null;
};

export function ProjectQuickCreateForm({
  action,
  customers,
  initialCustomerId,
  initialProjectName
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
            defaultValue={initialProjectName ?? ""}
            required
          />

          <CustomerPickerField
            customers={customers}
            initialCustomerId={initialCustomerId ?? ""}
            allowCreate={false}
            required
          />
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
