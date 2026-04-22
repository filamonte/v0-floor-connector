"use client";

import { useEffect, useMemo, useState } from "react";

type PersonOption = {
  id: string;
  displayName: string;
  personType: string;
};

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

type TimePunchFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  people: PersonOption[];
  projects: ProjectOption[];
  jobs: JobOption[];
  defaultPersonId?: string;
  defaultProjectId?: string;
  defaultJobId?: string;
  recommendedEventType?: "punch_in" | "punch_out" | "break_start" | "break_end";
};

function getDefaultOccurredAtValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

function getEventButtonClassName(isRecommended: boolean) {
  return isRecommended
    ? "inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-900"
    : "inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50";
}

export function TimePunchForm({
  action,
  people,
  projects,
  jobs,
  defaultPersonId = "",
  defaultProjectId = "",
  defaultJobId = "",
  recommendedEventType = "punch_in"
}: TimePunchFormProps) {
  const [personId, setPersonId] = useState(defaultPersonId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAtValue);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.projectId === projectId),
    [jobs, projectId]
  );

  const selectedPerson = people.find((person) => person.id === personId) ?? null;
  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const selectedJob = filteredJobs.find((job) => job.id === jobId) ?? null;

  useEffect(() => {
    setOccurredAt(getDefaultOccurredAtValue());
  }, []);

  useEffect(() => {
    if (!projectId) {
      setJobId("");
      return;
    }

    if (jobId && !filteredJobs.some((job) => job.id === jobId)) {
      setJobId("");
    }
  }, [filteredJobs, jobId, projectId]);

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-[1.4rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fff8ef,#ffffff)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#efcfb2] bg-[#fff3e4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9b5b27]">
            Recommended
          </span>
          <span className="text-sm font-medium text-[#2b2118]">
            {recommendedEventType.replaceAll("_", " ")}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#665446]">
          Keep the next punch explicit. Choose the worker, confirm project attribution,
          then select a job only when that work is happening on a specific execution record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Person
          </span>
          <select
            name="personId"
            required
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Select workforce person</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.displayName} /{" "}
                {person.personType === "subcontractor_worker" ? "Subcontractor" : "Employee"}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Occurred at
          </span>
          <input
            type="datetime-local"
            name="occurredAt"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No project attribution</option>
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
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            disabled={!projectId}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">
              {projectId ? "No job attribution" : "Select project first"}
            </option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label} / {job.dispatchStatus.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Worker
          </p>
          <p className="mt-2 font-medium text-slate-950">
            {selectedPerson?.displayName ?? "Choose a workforce person"}
          </p>
        </div>
        <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Project attribution
          </p>
          <p className="mt-2 font-medium text-slate-950">
            {selectedProject?.name ?? "Project-level unknown"}
          </p>
        </div>
        <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Job attribution
          </p>
          <p className="mt-2 font-medium text-slate-950">
            {selectedJob ? `Job ${selectedJob.id.slice(0, 8)}` : "No job selected"}
          </p>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Notes
        </span>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Optional note for this punch event"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-4">
        <button
          type="submit"
          name="eventType"
          value="punch_in"
          className={getEventButtonClassName(recommendedEventType === "punch_in")}
        >
          Punch in
        </button>
        <button
          type="submit"
          name="eventType"
          value="punch_out"
          className={getEventButtonClassName(recommendedEventType === "punch_out")}
        >
          Punch out
        </button>
        <button
          type="submit"
          name="eventType"
          value="break_start"
          className={getEventButtonClassName(recommendedEventType === "break_start")}
        >
          Break start
        </button>
        <button
          type="submit"
          name="eventType"
          value="break_end"
          className={getEventButtonClassName(recommendedEventType === "break_end")}
        >
          Break end
        </button>
      </div>

      <p className="text-sm leading-6 text-slate-500">
        Time cards are derived from canonical punch events. Project attribution is explicit,
        job attribution is narrowed by the selected project, and open-session continuity still
        flows through the same punch-event history underneath.
      </p>
    </form>
  );
}
