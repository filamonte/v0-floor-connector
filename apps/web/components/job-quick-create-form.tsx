"use client";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type JobQuickCreateProjectOption = {
  id: string;
  name: string;
  customerName?: string | null;
};

type JobQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: JobQuickCreateProjectOption[];
  initialProjectId?: string | null;
};

export function JobQuickCreateForm({
  action,
  projects,
  initialProjectId
}: JobQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create job"
        description="Choose the project, create the canonical job record first, and then finish scheduling, crew assignment, and execution detail in the full job workspace."
        footer="This creates a real unscheduled job on the shared project chain and takes you straight into the full job workspace."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
          <select
            name="projectId"
            defaultValue={initialProjectId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            required
          >
            <option value="" disabled>
              Select a project
            </option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.customerName ? ` - ${project.customerName}` : ""}
              </option>
            ))}
          </select>
        </label>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating job..." className="w-full">
          <span>Create job</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
