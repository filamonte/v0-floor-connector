"use client";

import { useMemo, useState } from "react";
import type { DailyLog } from "@floorconnector/types";

import { AuthField } from "@/components/auth-field";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

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

type DailyLogFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  projects: ProjectOption[];
  jobs: JobOption[];
  dailyLog?: DailyLog | null;
  defaultProjectId?: string;
  defaultJobId?: string;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

function getDefaultLogDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLogForm({
  action,
  submitLabel,
  pendingLabel,
  projects,
  jobs,
  dailyLog,
  defaultProjectId,
  defaultJobId
}: DailyLogFormProps) {
  const [projectId, setProjectId] = useState(
    dailyLog?.projectId ?? defaultProjectId ?? ""
  );

  const filteredJobs = useMemo(
    () =>
      projectId ? jobs.filter((job) => job.projectId === projectId) : jobs,
    [jobs, projectId]
  );

  return (
    <SaveStateForm
      action={action}
      enabled={Boolean(dailyLog)}
      pendingLabel={pendingLabel}
      className="space-y-5"
    >
      {dailyLog ? (
        <input type="hidden" name="dailyLogId" value={dailyLog.id} />
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            1. Project / job / day
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Confirm the field context before adding the day narrative.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Project
            </span>
            <select
              name="projectId"
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
              defaultValue={dailyLog?.jobId ?? defaultJobId ?? ""}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
            defaultValue={dailyLog?.logDate ?? getDefaultLogDate()}
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Status
            </span>
            <select
              name="status"
              defaultValue={dailyLog?.status ?? "draft"}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            >
              <option value="draft">Draft</option>
              <option value="finalized">Finalized</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            2. Work completed
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Keep this short enough to finish from the field, then add Job Notes
            below for blockers or details that need tracking.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Daily summary
          </span>
          <textarea
            name="summary"
            defaultValue={getValue(dailyLog?.summary)}
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="High-level view of what happened on site today"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Work completed
          </span>
          <textarea
            name="workCompleted"
            defaultValue={getValue(dailyLog?.workCompleted)}
            rows={6}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            placeholder="Capture completed execution work for the project day"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            3. Next work / blockers / safety
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Capture tomorrow's field handoff and anything that could slow the
            job down.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Work planned next
            </span>
            <textarea
              name="workPlannedNext"
              defaultValue={getValue(dailyLog?.workPlannedNext)}
              rows={6}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              placeholder="Describe the next practical field step"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Delays or blockers
            </span>
            <textarea
              name="delaysOrBlockers"
              defaultValue={getValue(dailyLog?.delaysOrBlockers)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              placeholder="Weather delays, access issues, scope blockers, punch-list-ready concerns, or other execution friction"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Safety notes
            </span>
            <textarea
              name="safetyNotes"
              defaultValue={getValue(dailyLog?.safetyNotes)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              placeholder="Short internal safety observations for the day"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            4. Weather
          </p>
          <p className="text-base font-semibold text-slate-950">
            Weather snapshot
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Keep the weather lightweight and tied to the Daily Job Log. This is
            a snapshot, not a separate weather workflow.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <AuthField
            label="Weather summary"
            name="weatherSummary"
            defaultValue={getValue(dailyLog?.weatherSummary)}
            placeholder="Clear and dry"
          />
          <AuthField
            label="Conditions"
            name="weatherConditions"
            defaultValue={getValue(dailyLog?.weatherConditions)}
            placeholder="Sunny, windy, damp, etc."
          />
          <AuthField
            label="High (F)"
            name="temperatureHighF"
            type="number"
            defaultValue={
              dailyLog?.temperatureHighF === null ||
              dailyLog?.temperatureHighF === undefined
                ? ""
                : String(dailyLog.temperatureHighF)
            }
            placeholder="76"
          />
          <AuthField
            label="Low (F)"
            name="temperatureLowF"
            type="number"
            defaultValue={
              dailyLog?.temperatureLowF === null ||
              dailyLog?.temperatureLowF === undefined
                ? ""
                : String(dailyLog.temperatureLowF)
            }
            placeholder="58"
          />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-18px_40px_-34px_rgba(15,23,42,0.5)] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-2 sm:shadow-none sm:backdrop-blur-0">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="w-full sm:w-auto sm:min-w-[220px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Daily logs stay project-centered, with optional dominant-job context
          when one job defines the day.
        </p>
      </div>
    </SaveStateForm>
  );
}
