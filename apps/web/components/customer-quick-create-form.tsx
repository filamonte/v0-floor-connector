"use client";

import { AuthField } from "@/components/auth-field";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type CustomerQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultRetainagePercentage: string;
};

export function CustomerQuickCreateForm({
  action,
  defaultRetainagePercentage
}: CustomerQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input
        type="hidden"
        name="retainagePercentageDefault"
        value={defaultRetainagePercentage}
      />
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create customer"
        description="Create the canonical customer recipient account first with just the primary name. Contact details, financial defaults, and notes can be completed in the full customer workspace."
        footer="This creates a real customer record and takes you straight into the full customer workspace."
      >
        <AuthField
          label="Customer name"
          name="name"
          placeholder="Jane Doe"
          hint="Use the primary billing, project, or estimate-recipient contact name."
          required
        />
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating customer..." className="w-full">
          <span>Create customer</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
