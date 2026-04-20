"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type TodoQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function TodoQuickCreateForm({ action }: TodoQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create to-do"
        description="Create a task with a description and due date. Assignment and project linking can be completed in the full task workspace."
        footer="This creates a real to-do record that will appear in your dashboard and project views."
      >
        <div className="space-y-4">
          <AuthField
            label="Task description"
            name="task"
            placeholder="Review estimate for Project X"
            hint="Brief description of what needs to be done."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Due date"
              name="dueDate"
              type="date"
              hint="When should this be completed?"
              required
            />

            <AuthField
              label="Priority"
              name="priority"
              as="select"
              hint="How urgent is this task?"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </AuthField>
          </div>

          <AuthField
            label="Notes"
            name="notes"
            as="textarea"
            placeholder="Additional context or instructions..."
            hint="Optional details to help complete the task."
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating to-do..." className="w-full">
          <span>Create to-do</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
