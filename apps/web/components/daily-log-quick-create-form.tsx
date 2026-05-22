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

type DailyLogQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  jobs: JobOption[];
  defaultProjectId?: string;
  defaultJobId?: string;
  defaultLogDate?: string;
};

function getDefaultLogDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLogQuickCreateForm({
  action,
  projects,
  jobs,
  defaultProjectId,
  defaultJobId,
  defaultLogDate
}: DailyLogQuickCreateFormProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");

  const filteredJobs = useMemo(
    () =>
      projectId ? jobs.filter((job) => job.projectId === projectId) : jobs,
    [jobs, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Start Daily Job Log"
        description="Pick the project, job, and day first. The full Daily Job Log opens next for completed work, next work, blockers, safety notes, Job Notes, and evidence."
        footer="This opens a real Daily Job Log on the existing project/job chain. It does not create a separate mobile field record."
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Project
            </span>
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
              Job
            </span>
            <select
              name="jobId"
              defaultValue={defaultJobId ?? ""}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
            >
              <option value="">Project-level log</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.label} | {job.dispatchStatus.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <AuthField
            label="Day"
            name="logDate"
            type="date"
            defaultValue={defaultLogDate ?? getDefaultLogDate()}
            required
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton
          pendingLabel="Creating daily log..."
          className="w-full"
        >
          <span>Start Daily Job Log</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
