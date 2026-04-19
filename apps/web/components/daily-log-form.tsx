"use client";

import { useMemo, useState } from "react";
import type { DailyLog } from "@floorconnector/types";

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
  status: string;
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
    () => (projectId ? jobs.filter((job) => job.projectId === projectId) : jobs),
    [jobs, projectId]
  );

  return (
    <form action={action} className="space-y-5">
      {dailyLog ? <input type="hidden" name="dailyLogId" value={dailyLog.id} /> : null}

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
            Dominant job
          </span>
          <select
            name="jobId"
            defaultValue={dailyLog?.jobId ?? defaultJobId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Project-level day</option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label} | {job.status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Log date"
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

      <div className="grid gap-4 lg:grid-cols-2">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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

      <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-slate-950">Weather snapshot</p>
          <p className="text-sm leading-6 text-slate-600">
            Keep the weather lightweight and tied to the canonical project-day record. This is a snapshot, not a separate weather workflow.
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
              dailyLog?.temperatureHighF === null || dailyLog?.temperatureHighF === undefined
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
              dailyLog?.temperatureLowF === null || dailyLog?.temperatureLowF === undefined
                ? ""
                : String(dailyLog.temperatureLowF)
            }
            placeholder="58"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <AuthSubmitButton pendingLabel={pendingLabel} className="sm:min-w-[220px]">
          <span>{submitLabel}</span>
        </AuthSubmitButton>
        <p className="text-sm leading-6 text-slate-500">
          Daily logs stay project-centered, with optional dominant-job context when one job defines the day.
        </p>
      </div>
    </form>
  );
}
