"use client";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import type {
  WorkItemKind,
  WorkItemPriority,
  WorkItemSourceType
} from "@floorconnector/types";

type AssignablePersonOption = {
  id: string;
  displayName: string;
};

type WorkItemCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
  sourceType: Extract<WorkItemSourceType, "opportunity" | "appointment">;
  sourceId: string;
  linkPath: string;
  customerId?: string | null;
  projectId?: string | null;
  defaultKind?: Extract<
    WorkItemKind,
    "manual" | "lead_follow_up" | "appointment_confirmation_prep" | "appointment_follow_up"
  >;
  kindOptions?: Array<{
    value: Extract<
      WorkItemKind,
      | "manual"
      | "lead_follow_up"
      | "appointment_confirmation_prep"
      | "appointment_follow_up"
    >;
    label: string;
  }>;
  defaultAssignedPersonId?: string | null;
  defaultTitle?: string | null;
  defaultDescription?: string | null;
  defaultDueAt?: string | null;
  defaultPriority?: WorkItemPriority;
  dedupeKey?: string | null;
  metadata?: Record<string, unknown> | null;
  boundaryCopy?: string;
  assignablePeople: AssignablePersonOption[];
};

const defaultKindOptions: NonNullable<WorkItemCreateFormProps["kindOptions"]> = [
  { value: "lead_follow_up", label: "Lead follow-up" },
  { value: "appointment_confirmation_prep", label: "Appointment confirmation prep" },
  { value: "appointment_follow_up", label: "Appointment follow-up" },
  { value: "manual", label: "Manual" }
];

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 16);
}

export function WorkItemCreateForm({
  action,
  returnTo,
  sourceType,
  sourceId,
  linkPath,
  customerId,
  projectId,
  defaultKind = "lead_follow_up",
  kindOptions = defaultKindOptions,
  defaultAssignedPersonId,
  defaultTitle,
  defaultDescription,
  defaultDueAt,
  defaultPriority = "normal",
  dedupeKey,
  metadata,
  boundaryCopy = "Work items are internal-only. Creating this item does not change the lead follow-up date, lead status, customer-visible communication, or appointment schedule.",
  assignablePeople
}: WorkItemCreateFormProps) {
  return (
    <SaveStateForm
      action={action}
      pendingLabel="Creating..."
      enabled={false}
      className="space-y-4"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="sourceType" value={sourceType} />
      <input type="hidden" name="sourceId" value={sourceId} />
      <input type="hidden" name="linkPath" value={linkPath} />
      <input type="hidden" name="customerId" value={customerId ?? ""} />
      <input type="hidden" name="projectId" value={projectId ?? ""} />
      <input type="hidden" name="visibility" value="internal" />
      <input type="hidden" name="dedupeKey" value={dedupeKey ?? ""} />
      <input
        type="hidden"
        name="metadata"
        value={metadata ? JSON.stringify(metadata) : ""}
      />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Work item title
        </span>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          defaultValue={defaultTitle ?? ""}
          className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
          placeholder="Call back about site visit timing"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Description
        </span>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultDescription ?? ""}
          className="w-full border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
          placeholder="Internal context for the contractor team."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Due date
          </span>
          <input
            type="datetime-local"
            name="dueAt"
            defaultValue={toDateTimeLocalValue(defaultDueAt)}
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Assign to
          </span>
          <select
            name="assignedPersonId"
            defaultValue={defaultAssignedPersonId ?? ""}
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          >
            <option value="">Unassigned</option>
            {assignablePeople.map((person) => (
              <option key={person.id} value={person.id}>
                {person.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Priority
          </span>
          <select
            name="priority"
            defaultValue={defaultPriority}
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Kind
          </span>
          <select
            name="kind"
            defaultValue={defaultKind}
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          >
            {kindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="rounded-[4px] border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
        {boundaryCopy}
      </p>

      <SaveStateSubmitButton
        submitLabel="Create work item"
        pendingLabel="Creating..."
      />
    </SaveStateForm>
  );
}
