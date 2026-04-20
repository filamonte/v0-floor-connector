"use client";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type PunchlistQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects?: Array<{ id: string; name: string }>;
};

export function PunchlistQuickCreateForm({
  action,
  projects = []
}: PunchlistQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create punchlist item"
        description="Document a punch item that needs to be addressed. Photos, assignments, and completion tracking can be managed in the full punchlist workspace."
        footer="This creates a real punchlist record tied to your project that will appear in your dashboard and project views."
      >
        <div className="space-y-4">
          <AuthField
            label="Title"
            name="title"
            placeholder="Touch-up paint near window trim"
            hint="Brief description of the punch item."
            required
          />

          {projects.length > 0 ? (
            <AuthField
              label="Project"
              name="projectId"
              as="select"
              hint="Which project is this for?"
              required
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </AuthField>
          ) : (
            <AuthField
              label="Project name"
              name="projectName"
              placeholder="Smith Residence - Kitchen Remodel"
              hint="Enter the project this item is for."
              required
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="Location"
              name="location"
              placeholder="Kitchen, near sink"
              hint="Where in the project is this item?"
            />

            <AuthField
              label="Priority"
              name="priority"
              as="select"
              hint="How urgent is this item?"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </AuthField>
          </div>

          <AuthField
            label="Description"
            name="description"
            as="textarea"
            placeholder="Detailed description of what needs to be fixed or completed..."
            hint="Provide clear details for the person addressing this item."
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating punchlist item..." className="w-full">
          <span>Create punchlist item</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
