"use client";

import { useState } from "react";

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
  initialEstimateId?: string | null;
  initialContractId?: string | null;
};

export function JobQuickCreateForm({
  action,
  projects,
  initialProjectId,
  initialEstimateId,
  initialContractId
}: JobQuickCreateFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");
  const shouldPreserveEstimate = Boolean(
    initialEstimateId && initialProjectId && selectedProjectId === initialProjectId
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="estimateId" value={shouldPreserveEstimate ? initialEstimateId ?? "" : ""} />
      <input type="hidden" name="contractId" value={shouldPreserveEstimate ? initialContractId ?? "" : ""} />
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create job"
        description="Choose the project, create the canonical job record first, and then finish scheduling, crew assignment, and execution detail in the full job workspace."
        footer="This creates a real unscheduled job on the shared project chain and takes you straight into the full job workspace."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Project</span>
          <select
            name="projectId"
            defaultValue={initialProjectId ?? ""}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
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
        {shouldPreserveEstimate ? (
          <p className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-900">
            This job will preserve the approved estimate context from the signed project handoff.
          </p>
        ) : null}
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating job..." className="w-full">
          <span>Create job</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
