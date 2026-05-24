"use client";

import { useMemo, useState } from "react";

import { QuickCreateFormShell } from "@/components/quick-create-form-shell";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import {
  buildScheduleMoveSummary,
  formatScheduleMoveEndpoint
} from "@/lib/schedule/move";
import type { CrewBoardMoveProposal } from "@/lib/schedule/proposed-move";

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
  preparedProposal?: CrewBoardMoveProposal | null;
};

export function ScheduleJobForm({
  action,
  unscheduleAction,
  job,
  redirectTo,
  preparedProposal
}: ScheduleJobFormProps) {
  const canUnschedule =
    job.dispatchStatus !== "in_progress" && job.dispatchStatus !== "completed";
  const currentSchedule = useMemo(
    () => ({
      scheduledDate: job.scheduledDate,
      scheduledStartAt: job.scheduledStartAt
        ? job.scheduledStartAt.slice(0, 16)
        : null,
      scheduledEndAt: job.scheduledEndAt
        ? job.scheduledEndAt.slice(0, 16)
        : null
    }),
    [job.scheduledDate, job.scheduledStartAt, job.scheduledEndAt]
  );
  const initialSchedule = useMemo(
    () => preparedProposal?.payload ?? currentSchedule,
    [currentSchedule, preparedProposal]
  );
  const [proposedSchedule, setProposedSchedule] = useState(initialSchedule);
  const moveSummary = buildScheduleMoveSummary({
    current: currentSchedule,
    proposed: proposedSchedule
  });

  return (
    <div className="space-y-4">
      <SaveStateForm
        action={action}
        pendingLabel="Saving..."
        className="space-y-5"
      >
        <input type="hidden" name="jobId" value={job.id} />
        {redirectTo ? (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        ) : null}

        <QuickCreateFormShell
          eyebrow="Move schedule"
          title="Review schedule move"
          description="Choose the new date or time, review the move, then save it on this job."
          footer="CrewBoard uses the existing schedule action, so Ready Check and GateKeeper behavior stay in force."
        >
          <div className="grid gap-4">
            <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3 text-sm leading-6 text-slate-600">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Current schedule
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {formatScheduleMoveEndpoint(currentSchedule)}
              </p>
            </div>

            {preparedProposal ? (
              <div
                className={[
                  "rounded-[4px] border px-4 py-3 text-sm leading-6",
                  preparedProposal.warnings.length > 0
                    ? "border-amber-200 bg-amber-50 text-amber-950"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900"
                ].join(" ")}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Prepared move
                </p>
                <p className="mt-1 font-medium">
                  {preparedProposal.targetLabel}
                </p>
                <p className="mt-1">{preparedProposal.summary}</p>
                {preparedProposal.warnings.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {preparedProposal.warnings.map((warning) => (
                      <li key={warning}>- {warning}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                New scheduled date
              </span>
              <input
                type="date"
                name="scheduledDate"
                defaultValue={initialSchedule.scheduledDate ?? ""}
                onChange={(event) =>
                  setProposedSchedule((current) => ({
                    ...current,
                    scheduledDate: event.target.value || null
                  }))
                }
                className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  New scheduled start
                </span>
                <input
                  type="datetime-local"
                  name="scheduledStartAt"
                  defaultValue={initialSchedule.scheduledStartAt ?? ""}
                  onChange={(event) =>
                    setProposedSchedule((current) => ({
                      ...current,
                      scheduledStartAt: event.target.value || null
                    }))
                  }
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  New scheduled end
                </span>
                <input
                  type="datetime-local"
                  name="scheduledEndAt"
                  defaultValue={initialSchedule.scheduledEndAt ?? ""}
                  onChange={(event) =>
                    setProposedSchedule((current) => ({
                      ...current,
                      scheduledEndAt: event.target.value || null
                    }))
                  }
                  className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
                />
              </label>
            </div>

            <div
              className={[
                "rounded-[4px] border px-4 py-3 text-sm leading-6",
                moveSummary.isNoOp
                  ? "border-[#e5e5e5] bg-white text-slate-600"
                  : "border-amber-200 bg-amber-50 text-amber-950"
              ].join(" ")}
              aria-live="polite"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Move summary
              </p>
              <p className="mt-1 font-medium">{moveSummary.summary}</p>
              <p className="mt-1">{moveSummary.detail}</p>
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

        <SaveStateSubmitButton
          submitLabel="Move schedule"
          pendingLabel="Saving..."
          className="w-full"
        />
      </SaveStateForm>

      {canUnschedule ? (
        <form action={unscheduleAction}>
          <input type="hidden" name="jobId" value={job.id} />
          {redirectTo ? (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          ) : null}
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
