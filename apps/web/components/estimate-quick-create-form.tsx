"use client";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type EstimateQuickCreateProjectOption = {
  id: string;
  name: string;
  customerName?: string | null;
};

type EstimateQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: EstimateQuickCreateProjectOption[];
  initialProjectId?: string | null;
};

export function EstimateQuickCreateForm({
  action,
  projects,
  initialProjectId
}: EstimateQuickCreateFormProps) {
  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create estimate"
        description="Choose the project and create the canonical estimate first. Full scope, pricing, and line-item editing happen in the estimate workspace right after save."
        footer="This creates a real draft estimate and takes you straight into the full estimate editing workspace."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
          <select
            name="projectId"
            defaultValue={initialProjectId ?? ""}
            className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
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
        <AuthSubmitButton pendingLabel="Creating estimate..." className="w-full">
          <span>Create estimate</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
