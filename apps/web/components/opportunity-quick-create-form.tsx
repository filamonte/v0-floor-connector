"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type OpportunityQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function OpportunityQuickCreateForm({
  action
}: OpportunityQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create lead"
        description="Capture just the lead title and primary prospect to create the canonical opportunity first. Qualification, source, service details, and follow-up notes can be completed in the lead workspace."
        footer="This creates a real opportunity record and takes you straight into the full lead workspace."
      >
        <div className="grid gap-4">
          <AuthField
            label="Lead title"
            name="title"
            placeholder="North warehouse epoxy flooring"
            hint="Use a short job or opportunity title."
            required
          />
          <AuthField
            label="Prospect name"
            name="prospectName"
            placeholder="Jeff Filamonte"
            hint="Primary contact for this opportunity."
            required
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating lead..." className="w-full">
          <span>Create lead</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
