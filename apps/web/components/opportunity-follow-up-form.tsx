"use client";

import { useMemo, useState } from "react";

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

function splitDateTimeLocalValue(value: string | null) {
  const dateTimeValue = toDateTimeLocalValue(value);

  if (!dateTimeValue) {
    return { date: "", time: "" };
  }

  const [date, time] = dateTimeValue.split("T");
  return { date: date ?? "", time: time ?? "" };
}

export function OpportunityFollowUpForm({
  action,
  opportunityId,
  nextFollowUpAt,
  nextFollowUpNote
}: OpportunityFollowUpFormProps) {
  const initialFollowUp = splitDateTimeLocalValue(nextFollowUpAt);
  const [followUpDate, setFollowUpDate] = useState(initialFollowUp.date);
  const [followUpTime, setFollowUpTime] = useState(initialFollowUp.time || "09:00");
  const followUpValue = useMemo(() => {
    if (!followUpDate) {
      return "";
    }

    return `${followUpDate}T${followUpTime || "09:00"}`;
  }, [followUpDate, followUpTime]);

  return (
    <SaveStateForm action={action} pendingLabel="Saving..." className="space-y-4">
      <input type="hidden" name="opportunityId" value={opportunityId} />
      <input type="hidden" name="nextFollowUpAt" value={followUpValue} />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Follow-up date
          </span>
          <input
            type="date"
            name="followUpDateInput"
            value={followUpDate}
            onChange={(event) => setFollowUpDate(event.target.value)}
            className="h-11 w-full border border-[#d6d6d6] bg-white px-3 text-base text-slate-900 outline-none transition focus:border-[#d8731f] sm:text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Time
          </span>
          <input
            type="time"
            name="followUpTimeInput"
            value={followUpTime}
            onChange={(event) => setFollowUpTime(event.target.value)}
            className="h-11 w-full border border-[#d6d6d6] bg-white px-3 text-base text-slate-900 outline-none transition focus:border-[#d8731f] sm:text-sm"
          />
        </label>
      </div>

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
        Leave the date blank and save to clear the follow-up.
      </p>

      <SaveStateSubmitButton
        submitLabel="Save follow-up"
        pendingLabel="Saving..."
      />
    </SaveStateForm>
  );
}
