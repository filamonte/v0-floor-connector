"use client";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import type { WorkItemKind, WorkItemPriority } from "@floorconnector/types";

type AssignablePersonOption = {
  id: string;
  displayName: string;
};

type UniversalCaptureWorkItemFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
  defaultAssignedPersonId?: string | null;
  assignablePeople: AssignablePersonOption[];
};

const captureKindOptions: Array<{
  value: WorkItemKind;
  label: string;
}> = [
  { value: "manual", label: "Internal task" },
  { value: "human_handoff", label: "Human handoff" },
  { value: "lead_follow_up", label: "Lead follow-up" },
  { value: "appointment_follow_up", label: "Appointment follow-up" },
  { value: "estimate_follow_up", label: "Estimate follow-up" },
  { value: "invoice_follow_up", label: "Finance follow-up" }
];

const priorityOptions: Array<{
  value: WorkItemPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export function UniversalCaptureWorkItemForm({
  action,
  returnTo,
  defaultAssignedPersonId,
  assignablePeople
}: UniversalCaptureWorkItemFormProps) {
  return (
    <section
      id="universal-capture"
      aria-labelledby="universal-capture-title"
      className="rounded-lg border border-[var(--border-warm)] bg-white p-4 shadow-[0_18px_45px_-34px_rgba(17,24,39,0.32)]"
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
            Capture an internal follow-up
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--text-secondary)]">
            Creates an internal Work Item. Use the existing Quick-Create links
            for customer, project, appointment, estimate, invoice, or job
            creation.
          </p>
        </div>
        <a
          href="#dashboard-my-work-title"
          className="inline-flex h-9 shrink-0 items-center justify-center border border-[var(--border-warm)] bg-[var(--highlight)] px-3 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white"
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
        <input type="hidden" name="sourceType" value="" />
        <input type="hidden" name="sourceId" value="" />
        <input type="hidden" name="customerId" value="" />
        <input type="hidden" name="projectId" value="" />
        <input type="hidden" name="linkPath" value="" />
        <input type="hidden" name="visibility" value="internal" />
        <input type="hidden" name="dedupeKey" value="" />
        <input
          type="hidden"
          name="metadata"
          value={JSON.stringify({
            captureSource: "manual_universal_capture",
            captureDestination: "work_item",
            captureVersion: 1
          })}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.32fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Title
            </span>
            <input
              type="text"
              name="title"
              required
              maxLength={200}
              className="h-10 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
              placeholder="Call Sue Friday about garage coating"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Capture type
            </span>
            <select
              name="kind"
              defaultValue="manual"
              className="h-10 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
            >
              {captureKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Note
          </span>
          <textarea
            name="description"
            rows={3}
            className="w-full border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
            placeholder="Capture enough context to organize later. Keep customer-facing commitments out of this note."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Due / review date
            </span>
            <input
              type="datetime-local"
              name="dueAt"
              className="h-10 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              Assign to
            </span>
            <select
              name="assignedPersonId"
              defaultValue={defaultAssignedPersonId ?? ""}
              className="h-10 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
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
              Priority
            </span>
            <select
              name="priority"
              defaultValue="normal"
              className="h-10 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="rounded-[4px] border border-slate-200 bg-[var(--highlight)] px-3 py-2 text-xs leading-5 text-slate-600">
          Internal only. This does not create a customer-facing message,
          appointment, project, invoice, job, reminder, or portal record.
        </p>

        <SaveStateSubmitButton
          submitLabel="Capture work item"
          pendingLabel="Capturing..."
        />
      </SaveStateForm>
    </section>
  );
}
