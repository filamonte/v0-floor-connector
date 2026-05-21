"use client";

import { useMemo, useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ProjectOption = {
  id: string;
  name: string;
};

type JobOption = {
  id: string;
  projectId: string;
  label: string;
  dispatchStatus: string;
};

type PunchlistQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  jobs: JobOption[];
  defaultProjectId?: string;
  defaultJobId?: string;
};

export function PunchlistQuickCreateForm({
  action,
  projects,
  jobs,
  defaultProjectId,
  defaultJobId
}: PunchlistQuickCreateFormProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");

  const filteredJobs = useMemo(
    () => (projectId ? jobs.filter((job) => job.projectId === projectId) : jobs),
    [jobs, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create punchlist item"
        description="Capture the minimum closeout item here, create the canonical punchlist record first, and then finish the full project/job continuity details in the workspace."
        footer="This creates a real punchlist item on the shared execution chain and takes you straight into the full workspace."
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
            <select
              name="projectId"
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Related job
            </span>
            <select
              name="jobId"
              defaultValue={defaultJobId ?? ""}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">Project-level punchlist</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.label} | {job.dispatchStatus.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <AuthField
            label="Title"
            name="title"
            placeholder="Example: Touch up edge detail at storefront threshold"
            required
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
