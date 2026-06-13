"use client";

import { useMemo, useState } from "react";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import {
  formatCaptureDateTimeForInput,
  parseUniversalCaptureIntent
} from "@/lib/universal-capture/intent-parser";
import type { WorkItemKind, WorkItemPriority } from "@floorconnector/types";

type AssignablePersonOption = {
  id: string;
  displayName: string;
};

type OpportunityOption = {
  id: string;
  title: string;
  customerId?: string | null;
  projectId?: string | null;
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

type UniversalCaptureWorkItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
  defaultAssignedPersonId?: string | null;
  assignablePeople: AssignablePersonOption[];
  opportunities: OpportunityOption[];
  customers: CustomerOption[];
  projects: ProjectOption[];
};

const priorityOptions: Array<{
  value: WorkItemPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

function buildAppointmentHref(input: {
  appointmentType: "site_visit";
  customerId: string;
  internalNotes: string;
  opportunityId: string;
  projectId: string;
  startsAt: string;
  title: string;
}) {
  const searchParams = new URLSearchParams();

  searchParams.set("compose", "1");
  searchParams.set("appointmentType", input.appointmentType);

  if (input.opportunityId) {
    searchParams.set("opportunityId", input.opportunityId);
  }

  if (input.customerId) {
    searchParams.set("customerId", input.customerId);
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.startsAt) {
    searchParams.set("startsAt", input.startsAt);
  }

  if (input.title) {
    searchParams.set("title", input.title);
  }

  if (input.internalNotes) {
    searchParams.set("internalNotes", input.internalNotes);
  }

  return `/appointments?${searchParams.toString()}#appointment-create`;
}

function getWorkItemTitle(input: string, label: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "Universal Capture follow-up";
  }

  return trimmed.length <= 180 ? trimmed : `${label}: ${trimmed.slice(0, 160)}`;
}

export function UniversalCaptureWorkItemForm({
  action,
  returnTo,
  defaultAssignedPersonId,
  assignablePeople,
  opportunities,
  customers,
  projects
}: UniversalCaptureWorkItemFormProps) {
  const [intentText, setIntentText] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [manualDueAt, setManualDueAt] = useState("");
  const selectedOpportunity = opportunities.find(
    (opportunity) => opportunity.id === selectedOpportunityId
  );
  const resolvedCustomerId =
    selectedCustomerId || selectedOpportunity?.customerId || "";
  const resolvedProjectId =
    selectedProjectId || selectedOpportunity?.projectId || "";
  const hasSelectedContext = Boolean(
    selectedOpportunityId || resolvedCustomerId || resolvedProjectId
  );
  const parsedIntent = useMemo(
    () =>
      parseUniversalCaptureIntent(intentText, {
        hasContext: hasSelectedContext
      }),
    [hasSelectedContext, intentText]
  );
  const appointmentStartsAt = formatCaptureDateTimeForInput(
    parsedIntent.dateTime
  );
  const parsedWorkItemDueAt = parsedIntent.dateTime?.localDate
    ? `${parsedIntent.dateTime.localDate}T${
        parsedIntent.dateTime.localTime ?? "17:00"
      }`
    : "";
  const appointmentTitle = selectedOpportunity
    ? `Site Visit / Inspection - ${selectedOpportunity.title}`
    : "Site Visit / Inspection";
  const appointmentHref =
    parsedIntent.intentType === "site_visit" &&
    appointmentStartsAt &&
    hasSelectedContext
      ? buildAppointmentHref({
          appointmentType: "site_visit",
          opportunityId: selectedOpportunityId,
          customerId: resolvedCustomerId,
          projectId: resolvedProjectId,
          startsAt: appointmentStartsAt,
          title: appointmentTitle,
          internalNotes: intentText
        })
      : null;
  const workItemKind: WorkItemKind =
    parsedIntent.intentType === "follow_up"
      ? "lead_follow_up"
      : parsedIntent.intentType === "site_visit"
        ? "appointment_follow_up"
        : "manual";
  const workItemTitle = getWorkItemTitle(intentText, parsedIntent.label);
  const metadata = {
    captureSource: "manual_universal_capture",
    captureDestination:
      parsedIntent.intentType === "site_visit"
        ? "appointment_prefill_or_work_item"
        : "work_item",
    captureVersion: 2,
    intentType: parsedIntent.intentType,
    intentConfidence: parsedIntent.confidence,
    intentMatchReason: parsedIntent.matchReason,
    recommendedDestination: parsedIntent.recommendedDestination
  };
  const filteredProjects = resolvedCustomerId
    ? projects.filter((project) => project.customerId === resolvedCustomerId)
    : projects;

  return (
    <section
      id="universal-capture"
      aria-labelledby="universal-capture-title"
      className="rounded-[4px] border border-[#d1d5db] bg-white p-4 shadow-[0_1px_0_rgba(9,9,11,0.035)]"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Universal Capture
          </p>
          <h2
            id="universal-capture-title"
            className="mt-1 text-[17px] font-semibold tracking-tight text-[var(--text-primary)]"
          >
            What do you need to do?
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--text-secondary)]">
            Type the intent in plain language. FloorConnector will identify a
            safe next step and either prepare the right canonical quick-create
            flow or create an internal Work Item after you submit.
          </p>
        </div>
        <a
          href="#dashboard-my-work-title"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-[4px] border border-[#c7d2e2] bg-white px-3 text-xs font-semibold text-[#0f172a] transition hover:border-[#005eb8] hover:bg-[#eef6ff]"
        >
          View queues
        </a>
      </div>

      <SaveStateForm
        action={action}
        pendingLabel="Capturing..."
        enabled={false}
        className="mt-4 space-y-4"
      >
        <input type="hidden" name="returnTo" value={returnTo} />
        <input
          type="hidden"
          name="sourceType"
          value={selectedOpportunityId ? "opportunity" : ""}
        />
        <input type="hidden" name="sourceId" value={selectedOpportunityId} />
        <input type="hidden" name="customerId" value={resolvedCustomerId} />
        <input type="hidden" name="projectId" value={resolvedProjectId} />
        <input
          type="hidden"
          name="linkPath"
          value={
            selectedOpportunityId
              ? `/leads/${selectedOpportunityId}`
              : resolvedProjectId
                ? `/projects/${resolvedProjectId}`
                : resolvedCustomerId
                  ? `/customers/${resolvedCustomerId}`
                  : ""
          }
        />
        <input type="hidden" name="visibility" value="internal" />
        <input type="hidden" name="dedupeKey" value="" />
        <input type="hidden" name="title" value={workItemTitle} />
        <input type="hidden" name="kind" value={workItemKind} />
        <input type="hidden" name="metadata" value={JSON.stringify(metadata)} />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.38fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Capture intent
            </span>
            <textarea
              name="description"
              required
              rows={4}
              value={intentText}
              onChange={(event) => setIntentText(event.target.value)}
              className="w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005eb8]"
              placeholder="Example: Schedule a site visit for ABC Manufacturing on 4/10 at 5 PM."
            />
          </label>

          <div className="rounded-[4px] border border-[#cbd5e1] bg-[#f9fafb] p-3 text-xs leading-5 text-slate-600">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
              Intent preview
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {parsedIntent.label}
            </p>
            <p className="mt-1">{parsedIntent.matchReason}</p>
            {parsedIntent.dateTime ? (
              <p className="mt-2">
                Parsed timing:{" "}
                <span className="font-semibold text-slate-800">
                  {parsedIntent.dateTime.localDate ?? "date needed"}{" "}
                  {parsedIntent.dateTime.localTime ?? "time needed"}
                </span>
                {parsedIntent.dateTime.needsConfirmation
                  ? " (confirm before creating)"
                  : ""}
              </p>
            ) : (
              <p className="mt-2">No reliable date or time found yet.</p>
            )}
            {parsedIntent.requiredMissingFields.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {parsedIntent.requiredMissingFields.map((field) => (
                  <li key={field}>Needs: {field}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Sales Opportunity
            </span>
            <select
              value={selectedOpportunityId}
              onChange={(event) => setSelectedOpportunityId(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
            >
              <option value="">No linked Sales Opportunity</option>
              {opportunities.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Customer
            </span>
            <select
              value={resolvedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
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
              Project
            </span>
            <select
              value={resolvedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
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

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Due / review date
            </span>
            <input
              type="datetime-local"
              name="dueAt"
              value={manualDueAt || parsedWorkItemDueAt}
              onChange={(event) => setManualDueAt(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Assign to
            </span>
            <select
              name="assignedPersonId"
              defaultValue={defaultAssignedPersonId ?? ""}
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
            >
              <option value="">Unassigned</option>
              {assignablePeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Fallback Work Item priority
            </span>
            <select
              name="priority"
              defaultValue="normal"
              className="h-10 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#005eb8]"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {appointmentHref ? (
          <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-900">
            <p className="font-semibold">Ready to prepare a site visit.</p>
            <p className="mt-1">
              This opens the existing Appointment Quick-Create with the parsed
              date, time, and selected context. It will not create the
              appointment until you review and submit that form.
            </p>
            <a
              href={appointmentHref}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-[4px] bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800"
            >
              Review site visit quick-create
            </a>
          </div>
        ) : (
          <p className="rounded-[4px] border border-slate-200 bg-[var(--highlight)] px-3 py-2 text-xs leading-5 text-slate-600">
            Internal only. If the intent cannot be safely routed, this creates
            an internal Work Item on the selected context. It does not create a
            customer-facing message, appointment, project, invoice, job,
            reminder, or portal record.
          </p>
        )}

        <SaveStateSubmitButton
          submitLabel="Create internal Work Item"
          pendingLabel="Capturing..."
        />
      </SaveStateForm>
    </section>
  );
}
