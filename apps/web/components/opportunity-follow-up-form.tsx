"use client";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

type OpportunityFollowUpFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  opportunityId: string;
  nextFollowUpAt: string | null;
  nextFollowUpNote: string | null;
};

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

export function OpportunityFollowUpForm({
  action,
  opportunityId,
  nextFollowUpAt,
  nextFollowUpNote
}: OpportunityFollowUpFormProps) {
  return (
    <SaveStateForm action={action} pendingLabel="Saving..." className="space-y-4">
      <input type="hidden" name="opportunityId" value={opportunityId} />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Next follow-up
        </span>
        <input
          type="datetime-local"
          name="nextFollowUpAt"
          defaultValue={toDateTimeLocalValue(nextFollowUpAt)}
          className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Follow-up note
        </span>
        <textarea
          name="nextFollowUpNote"
          defaultValue={nextFollowUpNote ?? ""}
          rows={4}
          className="w-full border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
          placeholder="Internal reminder for the next contractor follow-up."
        />
      </label>

      <p className="text-xs leading-5 text-slate-500">
        Leave both fields blank and save to clear the follow-up.
      </p>

      <SaveStateSubmitButton
        submitLabel="Save follow-up"
        pendingLabel="Saving..."
      />
    </SaveStateForm>
  );
}
