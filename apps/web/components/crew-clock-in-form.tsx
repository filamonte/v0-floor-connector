"use client";

import { useMemo, useState } from "react";

type PersonOption = {
  id: string;
  displayName: string;
  personType: string;
  currentPunchState: "not_clocked_in" | "clocked_in" | "on_break";
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

type ServiceTicketOption = {
  id: string;
  title: string;
  status: string;
  ticketType: string;
  projectId: string | null;
  jobId: string | null;
};

type CrewClockInFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  people: PersonOption[];
  projects: ProjectOption[];
  jobs: JobOption[];
  serviceTickets?: ServiceTicketOption[];
};

function getDefaultOccurredAtValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

function getPunchStateLabel(state: PersonOption["currentPunchState"]) {
  switch (state) {
    case "clocked_in":
      return "Clocked in";
    case "on_break":
      return "On break";
    default:
      return "Available";
  }
}

export function CrewClockInForm({
  action,
  people,
  projects,
  jobs,
  serviceTickets = []
}: CrewClockInFormProps) {
  const [projectId, setProjectId] = useState("");
  const [jobId, setJobId] = useState("");
  const [serviceTicketId, setServiceTicketId] = useState("");
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAtValue);
  const availablePeople = people.filter(
    (person) => person.currentPunchState === "not_clocked_in"
  );
  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.projectId === projectId),
    [jobs, projectId]
  );
  const filteredServiceTickets = useMemo(
    () =>
      serviceTickets.filter((ticket) => {
        if (jobId) {
          return !ticket.jobId || ticket.jobId === jobId;
        }

        if (projectId) {
          return !ticket.projectId || ticket.projectId === projectId;
        }

        return true;
      }),
    [jobId, projectId, serviceTickets]
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Project
          </span>
          <select
            name="projectId"
            required
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setJobId("");
              setServiceTicketId("");
            }}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
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
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            disabled={!projectId}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#ef7d32]"
          >
            <option value="">
              {projectId ? "Project-level crew time" : "Select project first"}
            </option>
            {filteredJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label} / {job.dispatchStatus.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Service/Warranty context
          </span>
          <select
            name="serviceTicketId"
            value={serviceTicketId}
            onChange={(event) => setServiceTicketId(event.target.value)}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No service/warranty ticket</option>
            {filteredServiceTickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {ticket.title} / {ticket.ticketType.replaceAll("_", " ")} /{" "}
                {ticket.status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Optional context is written to each worker's punch event and derived
            time card. It does not create separate service time entries.
          </p>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Clock-in time
          </span>
          <input
            type="datetime-local"
            name="occurredAt"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-900">Crew members</p>
        <div className="max-h-72 space-y-2 overflow-auto rounded-[4px] border border-[#e5e5e5] bg-white p-3">
          {people.map((person) => {
            const isAvailable = person.currentPunchState === "not_clocked_in";

            return (
              <label
                key={person.id}
                className={[
                  "flex items-start gap-3 rounded-[4px] border px-3 py-3 text-sm",
                  isAvailable
                    ? "border-[#e5e5e5] bg-white text-slate-800"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  name="personIds"
                  value={person.id}
                  disabled={!isAvailable}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#17120f]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {person.displayName}
                  </span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-slate-500">
                    {person.personType.replaceAll("_", " ")} /{" "}
                    {getPunchStateLabel(person.currentPunchState)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Crew note
        </span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          placeholder="Optional shared note for each crew clock-in event"
        />
      </label>

      <button
        type="submit"
        disabled={availablePeople.length === 0 || !projectId}
        className="inline-flex w-full items-center justify-center rounded-[4px] border border-[#17120f] bg-[#17120f] px-4 py-3 text-sm font-medium text-[#ffd7bb] transition hover:bg-[#2a1c13] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        Clock in selected crew
      </button>
    </form>
  );
}
