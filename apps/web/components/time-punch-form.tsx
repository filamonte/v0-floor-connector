"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getAllowedTimePunchEventTypes,
  type ClockingSessionState
} from "@/lib/time/transitions";

type TimePunchEventType =
  | "punch_in"
  | "punch_out"
  | "break_start"
  | "break_end";

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

type ServiceTicketOption = {
  id: string;
  title: string;
  status: string;
  ticketType: string;
  projectId: string | null;
  jobId: string | null;
};

type TimePunchFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  people: PersonOption[];
  projects: ProjectOption[];
  jobs: JobOption[];
  serviceTickets?: ServiceTicketOption[];
  defaultPersonId?: string;
  defaultProjectId?: string;
  defaultJobId?: string;
  defaultServiceTicketId?: string;
  personPunchStates?: PersonPunchState[];
  recommendedEventType?: TimePunchEventType;
};

type PersonPunchState = {
  personId: string;
  currentPunchState: "punched_in" | "on_break";
  projectId: string | null;
  jobId: string | null;
  serviceTicketId: string | null;
};

function getDefaultOccurredAtValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 16);
}

function getEventButtonClassName(isRecommended: boolean, isAllowed: boolean) {
  if (!isAllowed) {
    return "inline-flex w-full cursor-not-allowed items-center justify-center rounded-[4px] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400";
  }

  return isRecommended
    ? "inline-flex w-full items-center justify-center rounded-[4px] border border-[#17120f] bg-[#17120f] px-4 py-3 text-sm font-medium text-[#ffd7bb] transition hover:border-[#17120f] hover:bg-[#2a1c13]"
    : "inline-flex w-full items-center justify-center rounded-[4px] border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#ef7d32] hover:bg-slate-50 hover:text-[#221a14]";
}

function getClockingStateLabel(state: ClockingSessionState) {
  switch (state) {
    case "clocked_in":
      return "Clocked in";
    case "on_break":
      return "On break";
    default:
      return "Not clocked in";
  }
}

function getEventLabel(eventType: TimePunchEventType) {
  switch (eventType) {
    case "punch_in":
      return "Clock in";
    case "break_start":
      return "Start break";
    case "break_end":
      return "End break";
    case "punch_out":
      return "Clock out";
    default:
      return eventType;
  }
}

export function TimePunchForm({
  action,
  people,
  projects,
  jobs,
  serviceTickets = [],
  defaultPersonId = "",
  defaultProjectId = "",
  defaultJobId = "",
  defaultServiceTicketId = "",
  personPunchStates = [],
  recommendedEventType = "punch_in"
}: TimePunchFormProps) {
  const [personId, setPersonId] = useState(defaultPersonId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [serviceTicketId, setServiceTicketId] = useState(
    defaultServiceTicketId
  );
  const [occurredAt, setOccurredAt] = useState(getDefaultOccurredAtValue);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => job.projectId === projectId),
    [jobs, projectId]
  );

  const selectedPerson =
    people.find((person) => person.id === personId) ?? null;
  const selectedProject =
    projects.find((project) => project.id === projectId) ?? null;
  const selectedJob = filteredJobs.find((job) => job.id === jobId) ?? null;
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
  const selectedServiceTicket =
    filteredServiceTickets.find((ticket) => ticket.id === serviceTicketId) ??
    null;
  const selectedPersonPunchState =
    personPunchStates.find((state) => state.personId === personId) ?? null;
  const hasClockInAttribution = Boolean(projectId || jobId);
  const clockingState: ClockingSessionState = selectedPersonPunchState
    ? selectedPersonPunchState.currentPunchState === "on_break"
      ? "on_break"
      : "clocked_in"
    : "not_clocked_in";
  const allowedEventTypes = getAllowedTimePunchEventTypes(clockingState);

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

  useEffect(() => {
    if (
      serviceTicketId &&
      !filteredServiceTickets.some((ticket) => ticket.id === serviceTicketId)
    ) {
      setServiceTicketId("");
    }
  }, [filteredServiceTickets, serviceTicketId]);

  useEffect(() => {
    if (!selectedPersonPunchState) {
      return;
    }

    setProjectId(selectedPersonPunchState.projectId ?? "");
    setJobId(selectedPersonPunchState.jobId ?? "");
    setServiceTicketId(selectedPersonPunchState.serviceTicketId ?? "");
  }, [selectedPersonPunchState]);

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-[1.4rem] border border-[#e3d6c7] bg-[linear-gradient(180deg,#fff8ef,#ffffff)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#efcfb2] bg-[#fff3e4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9b5b27]">
            Recommended
          </span>
          <span className="text-sm font-medium text-[#2b2118]">
            {getEventLabel(recommendedEventType)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#665446]">
          Keep the next punch explicit. Choose the worker, confirm project
          attribution, then select a job only when that work is happening on a
          specific execution record.
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
                {person.personType === "subcontractor_worker"
                  ? "Subcontractor"
                  : "Employee"}
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

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Service/Warranty context
          </span>
          <select
            name="serviceTicketId"
            value={serviceTicketId}
            onChange={(event) => setServiceTicketId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
            Optional service/warranty context uses the same punch-event audit
            trail. It does not create a separate service timesheet.
          </p>
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
            {selectedJob
              ? `Job ${selectedJob.id.slice(0, 8)}`
              : "No job selected"}
          </p>
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Service/Warranty context
        </p>
        <p className="mt-2 font-medium text-slate-950">
          {selectedServiceTicket
            ? selectedServiceTicket.title
            : "No service/warranty ticket selected"}
        </p>
      </div>

      <div className="rounded-[1.2rem] border border-[#e3d6c7] bg-[#fffaf4] px-4 py-3 text-sm leading-6 text-[#665446]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b5b27]">
          Current session state
        </p>
        <p className="mt-2 font-medium text-[#2b2118]">
          {selectedPerson
            ? `${selectedPerson.displayName}: ${getClockingStateLabel(clockingState)}`
            : "Choose a workforce person to see available actions."}
        </p>
        <p className="mt-1">
          Available now:{" "}
          {selectedPerson
            ? allowedEventTypes
                .map((eventType) =>
                  eventType === "punch_in" && !hasClockInAttribution
                    ? "Clock in after choosing a project or job"
                    : getEventLabel(eventType)
                )
                .join(", ")
            : "select a person first"}
        </p>
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
        {(["punch_in", "break_start", "break_end", "punch_out"] as const).map(
          (eventType) => {
            const isAllowed =
              Boolean(personId) &&
              allowedEventTypes.includes(eventType) &&
              (eventType !== "punch_in" || hasClockInAttribution);

            return (
              <button
                key={eventType}
                type="submit"
                name="eventType"
                value={eventType}
                disabled={!isAllowed}
                className={getEventButtonClassName(
                  recommendedEventType === eventType,
                  isAllowed
                )}
              >
                {getEventLabel(eventType)}
              </button>
            );
          }
        )}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        Time cards are derived from canonical punch events. Project attribution
        is explicit, job attribution is narrowed by the selected project, and
        open-session continuity still flows through the same punch-event history
        underneath.
      </p>
    </form>
  );
}
