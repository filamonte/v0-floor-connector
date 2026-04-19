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
  status: string;
};

type TimePunchFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  people: PersonOption[];
  projects: ProjectOption[];
  jobs: JobOption[];
};

function getDefaultOccurredAtValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

export function TimePunchForm({
  action,
  people,
  projects,
  jobs
}: TimePunchFormProps) {
  const [projectId, setProjectId] = useState("");
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAtValue);

  const filteredJobs = useMemo(
    () => (projectId ? jobs.filter((job) => job.projectId === projectId) : jobs),
    [jobs, projectId]
  );

  useEffect(() => {
    setOccurredAt(getDefaultOccurredAtValue());
  }, []);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Person
          </span>
          <select
            name="personId"
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Select workforce person</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.displayName} · {person.personType === "subcontractor_worker" ? "Subcontractor" : "Employee"}
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
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No job attribution</option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label} · {job.status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
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
          className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-900"
        >
          Punch in
        </button>
        <button
          type="submit"
          name="eventType"
          value="punch_out"
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Punch out
        </button>
        <button
          type="submit"
          name="eventType"
          value="break_start"
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Break start
        </button>
        <button
          type="submit"
          name="eventType"
          value="break_end"
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Break end
        </button>
      </div>

      <p className="text-sm leading-6 text-slate-500">
        Time cards are derived from canonical punch events. Project and job attribution is optional but should be supplied when known for better operational continuity.
      </p>
    </form>
  );
}
