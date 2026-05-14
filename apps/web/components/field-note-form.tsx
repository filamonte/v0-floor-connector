import type { FieldNote } from "@floorconnector/types";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

type JobOption = {
  id: string;
  label: string;
  dispatchStatus: string;
};

type PersonOption = {
  id: string;
  displayName: string;
  personType: string;
};

type TimeCardOption = {
  id: string;
  label: string;
  meta: string;
};

type FieldNoteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  dailyLogId: string;
  projectId: string;
  jobs: JobOption[];
  people: PersonOption[];
  timeCards: TimeCardOption[];
  fieldNote?: FieldNote | null;
  defaultJobId?: string | null;
};

function getValue(value: string | null | undefined) {
  return value ?? "";
}

export function FieldNoteForm({
  action,
  submitLabel,
  pendingLabel,
  dailyLogId,
  projectId,
  jobs,
  people,
  timeCards,
  fieldNote,
  defaultJobId
}: FieldNoteFormProps) {
  return (
    <SaveStateForm
      action={action}
      enabled={Boolean(fieldNote)}
      resetOnSuccess={!fieldNote}
      pendingLabel={pendingLabel}
      className="space-y-4"
    >
      <input type="hidden" name="dailyLogId" value={dailyLogId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="visibility" value="internal" />
      {fieldNote ? <input type="hidden" name="fieldNoteId" value={fieldNote.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Note type
          </span>
          <select
            name="noteType"
            defaultValue={fieldNote?.noteType ?? "general"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="general">General</option>
            <option value="labor">Labor</option>
            <option value="material">Material</option>
            <option value="equipment">Equipment</option>
            <option value="blocker">Blocker</option>
            <option value="issue">Issue</option>
            <option value="punch_list">Punch list</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Status
          </span>
          <select
            name="status"
            defaultValue={fieldNote?.status ?? "open"}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="open">Open</option>
            <option value="noted">Noted</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Job
          </span>
          <select
            name="jobId"
            defaultValue={fieldNote?.jobId ?? defaultJobId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Project-level note</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label} | {job.dispatchStatus.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Workforce person
          </span>
          <select
            name="personId"
            defaultValue={fieldNote?.personId ?? ""}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          >
            <option value="">No person linkage</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.displayName} |{" "}
                {person.personType === "subcontractor_worker" ? "Subcontractor" : "Employee"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Title
        </span>
        <input
          name="title"
          defaultValue={fieldNote?.title ?? ""}
          required
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Short execution observation"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Details
        </span>
        <textarea
          name="body"
          defaultValue={getValue(fieldNote?.body)}
          rows={4}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
          placeholder="Capture the execution detail, blocker, issue, or punch-list-ready note."
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Linked time card
        </span>
        <select
          name="timeCardId"
          defaultValue={fieldNote?.timeCardId ?? ""}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
        >
          <option value="">No time-card linkage</option>
          {timeCards.map((timeCard) => (
            <option key={timeCard.id} value={timeCard.id}>
              {timeCard.label} | {timeCard.meta}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <SaveStateSubmitButton
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          variant={fieldNote ? "secondary" : "primary"}
          className="sm:min-w-[180px]"
        />
        <p className="text-sm leading-6 text-slate-500">
          Notes stay inside the daily-log workflow and use shared `note_type` and `status` instead of separate execution subsystems.
        </p>
      </div>
    </SaveStateForm>
  );
}
