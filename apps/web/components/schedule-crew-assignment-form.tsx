"use client";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ScheduleCrewAssignmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  unassignAction: (formData: FormData) => void | Promise<void>;
  jobId: string;
  projectId: string;
  estimateId?: string | null;
  redirectTo?: string | null;
  assignments: Array<{
    id: string;
    role: string;
    assignedStartAt: string | null;
    assignedEndAt: string | null;
    person: {
      id: string;
      displayName: string;
    } | null;
    vendor: {
      id: string;
      name: string;
    } | null;
  }>;
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
  unassignAction,
  jobId,
  projectId,
  estimateId,
  redirectTo,
  assignments,
  people,
  vendors
}: ScheduleCrewAssignmentFormProps) {
  const formatAssignmentDateTime = (value: string | null) =>
    value
      ? new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        })
      : null;

  const formatRoleLabel = (value: string) => value.replaceAll("_", " ");

  return (
    <div className="space-y-5">
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
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
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
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
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
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
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
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Assigned end
                </span>
                <input
                  type="datetime-local"
                  name="assignedEndAt"
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
            </div>
          </div>
        </QuickCreateFormShell>

        <AuthSubmitButton pendingLabel="Assigning crew..." className="w-full">
          <span>Add assignment</span>
        </AuthSubmitButton>
      </form>

      <div className="rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8]">
        <div className="border-b border-[#e5e5e5] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Current crew
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review or remove current assignment rows here without leaving the shared schedule surface.
          </p>
        </div>

        <div className="divide-y divide-[#e5e5e5]">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {assignment.person?.displayName ??
                      assignment.vendor?.name ??
                      "Unknown assignment"}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {formatRoleLabel(assignment.role)}
                  </p>
                  {assignment.assignedStartAt || assignment.assignedEndAt ? (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {formatAssignmentDateTime(assignment.assignedStartAt) ?? "Start not set"}
                      {assignment.assignedEndAt
                        ? ` to ${formatAssignmentDateTime(assignment.assignedEndAt)}`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      No assignment window has been set.
                    </p>
                  )}
                </div>

                <form action={unassignAction}>
                  <input type="hidden" name="jobId" value={jobId} />
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="estimateId" value={estimateId ?? ""} />
                  {redirectTo ? (
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                  ) : null}
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
                  >
                    Unassign
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-sm leading-6 text-slate-500">
              No crew assignments are attached yet. Add people or labor-provider vendors here once the schedule commitment is set.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
