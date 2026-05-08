"use client";

import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";

type OpportunityCommunicationLogFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  opportunityId: string;
};

const communicationKindOptions = [
  { value: "manual_call", label: "Call" },
  { value: "manual_email_note", label: "Email note" },
  { value: "manual_text_note", label: "Text note" },
  { value: "voicemail", label: "Voicemail" },
  { value: "internal_note", label: "Internal note" },
  { value: "appointment_note", label: "Appointment note" }
] as const;

export function OpportunityCommunicationLogForm({
  action,
  opportunityId
}: OpportunityCommunicationLogFormProps) {
  return (
    <SaveStateForm
      action={action}
      pendingLabel="Logging..."
      enabled={false}
      className="space-y-4"
    >
      <input type="hidden" name="opportunityId" value={opportunityId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Communication type
          </span>
          <select
            name="messageKind"
            defaultValue="manual_call"
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          >
            {communicationKindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-800">
            Visibility
          </span>
          <select
            name="visibility"
            defaultValue="internal"
            className="h-9 w-full border border-[#d6d6d6] bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#d8731f]"
          >
            <option value="internal">Internal</option>
            <option value="customer_visible">Customer-visible</option>
          </select>
        </label>
      </div>

      <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        Internal is the safe default. Customer-visible logs are stored for future portal display, but this pass does not expose portal messaging.
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-800">
          Note
        </span>
        <textarea
          name="body"
          rows={5}
          required
          className="w-full border border-[#d6d6d6] bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
          placeholder="Summarize the call, email, text, voicemail, or internal follow-up context."
        />
      </label>

      <SaveStateSubmitButton
        submitLabel="Log communication"
        pendingLabel="Logging..."
      />
    </SaveStateForm>
  );
}
