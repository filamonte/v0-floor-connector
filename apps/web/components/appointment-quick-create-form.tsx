"use client";

import { useMemo, useState } from "react";

import { AuthField } from "@/components/auth-field";
import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";

type OpportunityOption = {
  id: string;
  title: string;
  defaultAppointmentTitle?: string;
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

type AppointmentQuickCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  opportunities: OpportunityOption[];
  customers: CustomerOption[];
  projects: ProjectOption[];
  people: PersonOption[];
  defaultOpportunityId?: string;
  defaultCustomerId?: string;
  defaultProjectId?: string;
  defaultTitle?: string;
};

const appointmentTypeOptions = [
  { value: "site_visit", label: "Site visit" },
  { value: "customer_meeting", label: "Customer meeting" },
  { value: "estimate_appointment", label: "Estimate appointment" },
  { value: "follow_up", label: "Follow-up visit" },
  { value: "internal", label: "Internal" }
] as const;

function formatForDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitialStartsAt() {
  const date = new Date();
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);

  return formatForDateTimeLocal(date);
}

export function AppointmentQuickCreateForm({
  action,
  opportunities,
  customers,
  projects,
  people,
  defaultOpportunityId,
  defaultCustomerId,
  defaultProjectId,
  defaultTitle
}: AppointmentQuickCreateFormProps) {
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [opportunityId, setOpportunityId] = useState(defaultOpportunityId ?? "");
  const selectedOpportunityDefaultTitle = opportunities.find(
    (opportunity) => opportunity.id === opportunityId
  )?.defaultAppointmentTitle;

  const filteredProjects = useMemo(
    () =>
      customerId
        ? projects.filter((project) => project.customerId === customerId)
        : projects,
    [customerId, projects]
  );

  return (
    <form action={action} className="space-y-5">
      <QuickCreateFormShell
        eyebrow="Quick create"
        title="Create appointment"
        description="Capture the visit or meeting block here, create the canonical appointment first, and then finish the fuller continuity details in the workspace."
        footer="Appointments stay distinct from jobs: use this for visits, meetings, and planning blocks, then keep execution work on canonical jobs."
      >
        <div className="grid gap-4">
          <AuthField
            key={`${opportunityId || "none"}-${defaultTitle ?? selectedOpportunityDefaultTitle ?? "site-visit"}`}
            label="Title"
            name="title"
            placeholder="Example: Final site visit with owner"
            defaultValue={
              defaultTitle ?? selectedOpportunityDefaultTitle ?? "Site Visit / Inspection"
            }
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Appointment type
            </span>
            <select
              name="appointmentType"
              defaultValue="site_visit"
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
            defaultValue={getInitialStartsAt()}
            required
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Linked lead
            </span>
            <select
              name="opportunityId"
              value={opportunityId}
              onChange={(event) => setOpportunityId(event.target.value)}
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
              defaultValue={defaultProjectId ?? ""}
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

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Assigned person
            </span>
            <select
              name="assignedPersonId"
              defaultValue=""
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

          <div className="rounded-[4px] border border-[#d6d6d6] bg-[#f8f8f8] px-4 py-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="customerVisible"
                className="mt-1 h-4 w-4 rounded border-[#d6d6d6] text-[#d8731f] focus:ring-[#d8731f]"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Mark appointment customer-visible
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Defaults off. Portal appointment display remains future work.
                </span>
              </span>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Internal appointment notes
            </span>
            <textarea
              name="internalNotes"
              rows={4}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
              placeholder="Internal prep notes, access details, or team follow-up context."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Customer-visible appointment notes
            </span>
            <textarea
              name="customerNotes"
              rows={4}
              className="w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
              placeholder="Only include notes that would be safe to show the customer later."
            />
          </label>
        </div>
      </QuickCreateFormShell>

      <div className="flex flex-col gap-3 pt-1">
        <AuthSubmitButton pendingLabel="Creating appointment..." className="w-full">
          <span>Create appointment</span>
        </AuthSubmitButton>
      </div>
    </form>
  );
}
