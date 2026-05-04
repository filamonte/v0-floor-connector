import type { Job, Project } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { jobStatusesList } from "@/lib/jobs/schemas";

type JobProjectOption = Pick<Project, "id" | "name" | "customerId"> & {
  customerName?: string | null;
};

type JobEstimateOption = {
  id: string;
  referenceNumber: string;
  projectId: string;
  projectName: string | null;
};

type JobFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  projects: JobProjectOption[];
  estimates: JobEstimateOption[];
  job?: Job | null;
  initialProjectId?: string | null;
  initialEstimateId?: string | null;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export function JobForm({
  action,
  submitLabel,
  pendingLabel,
  projects,
  estimates,
  job,
  initialProjectId,
  initialEstimateId
}: JobFormProps) {
  const selectedProjectId = job?.projectId ?? initialProjectId ?? "";

  return (
    <SaveStateForm
      action={action}
      enabled={Boolean(job)}
      pendingLabel={pendingLabel}
      className="space-y-5"
    >
      {job ? <input type="hidden" name="jobId" value={job.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            defaultValue={selectedProjectId}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Jobs always belong to a project and inherit the customer from that project.
          </span>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked approved estimate
          </span>
          <select
            name="estimateId"
            defaultValue={job?.estimateId ?? initialEstimateId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No linked estimate</option>
            {estimates.map((estimate) => (
              <option key={estimate.id} value={estimate.id}>
                {estimate.referenceNumber}
                {estimate.projectName ? ` - ${estimate.projectName}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Only approved estimates can be attached to a job. Leave this blank for
            project-driven work that was not created from an estimate.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Dispatch status
          </span>
          <select
            name="dispatchStatus"
            defaultValue={job?.dispatchStatus ?? "unscheduled"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            required
          >
            {jobStatusesList.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Scheduled date"
          name="scheduledDate"
          type="date"
          defaultValue={getValue(job?.scheduledDate)}
        />

        <AuthField
          label="Scheduled start"
          name="scheduledStartAt"
          type="datetime-local"
          defaultValue={getValue(job?.scheduledStartAt ? job.scheduledStartAt.slice(0, 16) : null)}
        />

        <AuthField
          label="Scheduled end"
          name="scheduledEndAt"
          type="datetime-local"
          defaultValue={getValue(job?.scheduledEndAt ? job.scheduledEndAt.slice(0, 16) : null)}
        />
      </div>

      <input type="hidden" name="crewVendorId" value={job?.crewVendorId ?? ""} />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Schedule notes
        </span>
        <textarea
          name="scheduleNotes"
          defaultValue={getValue(job?.scheduleNotes)}
          rows={3}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional notes for the current planned schedule"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          defaultValue={getValue(job?.notes)}
          rows={5}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional operational notes for this job or work order"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="sm:min-w-[200px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Crew assignment and calendar views can layer on top of this job foundation later.
        </p>
      </div>
    </SaveStateForm>
  );
}
