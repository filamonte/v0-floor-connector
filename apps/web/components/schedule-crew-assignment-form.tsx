"use client";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ScheduleCrewAssignmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  jobId: string;
  projectId: string;
  estimateId?: string | null;
  redirectTo?: string | null;
  people: Array<{
    id: string;
    displayName: string;
  }>;
  vendors: Array<{
    id: string;
    name: string;
  }>;
};

export function ScheduleCrewAssignmentForm({
  action,
  jobId,
  projectId,
  estimateId,
  redirectTo,
  people,
  vendors
}: ScheduleCrewAssignmentFormProps) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="estimateId" value={estimateId ?? ""} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <QuickCreateFormShell
        eyebrow="Crew assignment"
        title="Assign crew"
        description="Keep assignment on the same canonical job record so schedule, labor, and downstream daily execution stay connected."
        footer="Select either one workforce person or one subcontractor vendor for each assignment."
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Crew member</span>
            <select
              name="personId"
              defaultValue=""
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
            >
              <option value="">No person selected</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Subcontractor vendor
            </span>
            <select
              name="vendorId"
              defaultValue=""
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
            >
              <option value="">No vendor selected</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Role</span>
            <select
              name="role"
              defaultValue="crew"
              className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
            >
              <option value="lead">Lead</option>
              <option value="crew">Crew</option>
              <option value="subcontractor">Subcontractor</option>
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Assigned start
              </span>
              <input
                type="datetime-local"
                name="assignedStartAt"
                className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Assigned end
              </span>
              <input
                type="datetime-local"
                name="assignedEndAt"
                className="w-full rounded-[4px] border border-[#d9dee8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#91a5c6]"
              />
            </label>
          </div>
        </div>
      </QuickCreateFormShell>

      <AuthSubmitButton pendingLabel="Assigning crew..." className="w-full">
        <span>Add assignment</span>
      </AuthSubmitButton>
    </form>
  );
}
