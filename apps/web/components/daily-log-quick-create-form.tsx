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
};

function getDefaultLogDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLogQuickCreateForm({
  action,
  projects,
  jobs,
  defaultProjectId,
  defaultJobId
}: DailyLogQuickCreateFormProps) {
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");

  const filteredJobs = useMemo(
    () => (projectId ? jobs.filter((job) => job.projectId === projectId) : jobs),
    [jobs, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create daily log"
        description="Capture the minimum project-day context here, create the canonical daily log, and then finish execution notes in the full daily-log workspace."
        footer="This creates a real daily log and takes you straight into the full project-day workspace."
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
            <select
              name="projectId"
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
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
              Dominant job
            </span>
            <select
              name="jobId"
              defaultValue={defaultJobId ?? ""}
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
            >
              <option value="">Project-level day</option>
              {filteredJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.label} | {job.dispatchStatus.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <AuthField
            label="Log date"
            name="logDate"
            type="date"
            defaultValue={getDefaultLogDate()}
            required
          />
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating daily log..." className="w-full">
          <span>Create daily log</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
