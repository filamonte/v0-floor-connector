"use client";

import { useMemo, useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";

type OpportunityOption = {
  id: string;
  title: string;
};

type CustomerOption = {
  id: string;
  name: string;
};

type ProjectOption = {
  id: string;
  name: string;
  customerId: string;
};

type PersonOption = {
  id: string;
  displayName: string;
};

type AppointmentFormValue = {
  id: string;
  opportunityId: string | null;
  customerId: string | null;
  projectId: string | null;
  assignedPersonId: string | null;
  title: string;
  appointmentType:
    | "site_visit"
    | "customer_meeting"
    | "estimate_appointment"
    | "follow_up"
    | "internal";
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "canceled" | "no_show";
};

type AppointmentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  appointment: AppointmentFormValue;
  opportunities: OpportunityOption[];
  customers: CustomerOption[];
  projects: ProjectOption[];
  people: PersonOption[];
  redirectTo?: string;
};

const appointmentTypeOptions = [
  { value: "site_visit", label: "Site visit" },
  { value: "customer_meeting", label: "Customer meeting" },
  { value: "estimate_appointment", label: "Estimate appointment" },
  { value: "follow_up", label: "Follow-up visit" },
  { value: "internal", label: "Internal" }
] as const;

const appointmentStatusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "no_show", label: "No-show" }
] as const;

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AppointmentForm({
  action,
  appointment,
  opportunities,
  customers,
  projects,
  people,
  redirectTo
}: AppointmentFormProps) {
  const [customerId, setCustomerId] = useState(appointment.customerId ?? "");

  const filteredProjects = useMemo(
    () =>
      customerId
        ? projects.filter((project) => project.customerId === customerId)
        : projects,
    [customerId, projects]
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="appointmentId" value={appointment.id} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <AuthField
          label="Title"
          name="title"
          defaultValue={appointment.title}
          required
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Appointment type
          </span>
          <select
            name="appointmentType"
            defaultValue={appointment.appointmentType}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {appointmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Start time"
          name="startsAt"
          type="datetime-local"
          defaultValue={toDateTimeLocalValue(appointment.startsAt)}
          required
        />

        <AuthField
          label="End time"
          name="endsAt"
          type="datetime-local"
          defaultValue={toDateTimeLocalValue(appointment.endsAt)}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={appointment.status}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            {appointmentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Assigned person
          </span>
          <select
            name="assignedPersonId"
            defaultValue={appointment.assignedPersonId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">Unassigned</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.displayName}
              </option>
            ))}
          </select>
        </label>

        <AuthField
          label="Location"
          name="location"
          defaultValue={appointment.location ?? ""}
          placeholder="Jobsite, showroom, office, or call details"
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked lead
          </span>
          <select
            name="opportunityId"
            defaultValue={appointment.opportunityId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No linked lead</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.id} value={opportunity.id}>
                {opportunity.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked customer
          </span>
          <select
            name="customerId"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No linked customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Linked project
          </span>
          <select
            name="projectId"
            defaultValue={appointment.projectId ?? ""}
            className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#ef7d32]"
          >
            <option value="">No linked project</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">Notes</span>
        <textarea
          name="notes"
          defaultValue={appointment.notes ?? ""}
          rows={8}
          className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
          placeholder="Capture meeting context, prep notes, site observations, or follow-up items that should stay with the appointment."
        />
      </label>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <AuthSubmitButton pendingLabel="Saving appointment...">
          <span>Save appointment</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
