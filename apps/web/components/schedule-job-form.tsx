"use client";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type ScheduleJobFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  unscheduleAction: (formData: FormData) => void | Promise<void>;
  job: {
    id: string;
    dispatchStatus: string;
    scheduledDate: string | null;
    scheduledStartAt: string | null;
    scheduledEndAt: string | null;
    scheduleNotes: string | null;
  };
  redirectTo?: string | null;
};

export function ScheduleJobForm({
  action,
  unscheduleAction,
  job,
  redirectTo
}: ScheduleJobFormProps) {
  const canUnschedule =
    job.dispatchStatus !== "in_progress" && job.dispatchStatus !== "completed";

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-5">
        <input type="hidden" name="jobId" value={job.id} />
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

        <QuickCreateFormShell
          eyebrow="Schedule"
          title="Update schedule"
          description="Keep timing, day-of-work notes, and dispatch state directly on the canonical job record."
          footer="This updates the same shared job used by project continuity, time tracking, daily logs, and billing follow-through."
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Scheduled date
              </span>
              <input
                type="date"
                name="scheduledDate"
                defaultValue={job.scheduledDate ?? ""}
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Scheduled start
                </span>
                <input
                  type="datetime-local"
                  name="scheduledStartAt"
                  defaultValue={job.scheduledStartAt ? job.scheduledStartAt.slice(0, 16) : ""}
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Scheduled end
                </span>
                <input
                  type="datetime-local"
                  name="scheduledEndAt"
                  defaultValue={job.scheduledEndAt ? job.scheduledEndAt.slice(0, 16) : ""}
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Schedule notes
              </span>
              <textarea
                name="scheduleNotes"
                defaultValue={job.scheduleNotes ?? ""}
                rows={4}
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
                placeholder="Access reminders, sequencing notes, or day-of-work details"
              />
            </label>
          </div>
        </QuickCreateFormShell>

        <AuthSubmitButton pendingLabel="Saving schedule..." className="w-full">
          <span>Save schedule</span>
        </AuthSubmitButton>
      </form>

      {canUnschedule ? (
        <form action={unscheduleAction}>
          <input type="hidden" name="jobId" value={job.id} />
          {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Move back to unscheduled
          </button>
        </form>
      ) : null}
    </div>
  );
}
