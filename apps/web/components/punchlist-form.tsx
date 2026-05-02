"use client";

import { useMemo, useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

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

type AssigneeOption = {
  id: string;
  displayName: string;
  isActive: boolean;
};

type PunchlistFormValue = {
  id: string;
  projectId: string;
  jobId: string | null;
  assigneePersonId: string | null;
  title: string;
  details: string | null;
  dueDate: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
};

type PunchlistFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  punchlistItem: PunchlistFormValue;
  projects: ProjectOption[];
  jobs: JobOption[];
  assignees: AssigneeOption[];
  redirectTo?: string;
};

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
] as const;

export function PunchlistForm({
  action,
  punchlistItem,
  projects,
  jobs,
  assignees,
  redirectTo
}: PunchlistFormProps) {
  const [projectId, setProjectId] = useState(punchlistItem.projectId);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.projectId === projectId),
    [jobs, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="punchlistItemId" value={punchlistItem.id} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Project</span>
          <select
            name="projectId"
            required
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
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
            defaultValue={punchlistItem.jobId ?? ""}
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
          defaultValue={punchlistItem.title}
          required
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
          <select
            name="status"
            defaultValue={punchlistItem.status}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">Assignee</span>
          <select
            name="assigneePersonId"
            defaultValue={punchlistItem.assigneePersonId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.displayName}
                {assignee.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Due date"
          name="dueDate"
          type="date"
          defaultValue={punchlistItem.dueDate ?? ""}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">Details</span>
        <textarea
          name="details"
          defaultValue={punchlistItem.details ?? ""}
          rows={8}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
          placeholder="Describe the corrective work, finish issue, open detail, or closeout note that still needs follow-through."
        />
      </label>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <AuthSubmitButton pendingLabel="Saving punchlist item...">
          <span>Save punchlist item</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
