import { AuthSubmitButton } from "@/components/auth-submit-button";
import { createRecordLinkedCommunicationMessageAction } from "@/lib/communications/actions";

type RecordLinkedCommunicationComposerProps = {
  subjectType: "customer" | "project";
  subjectId: string;
  returnTo: string;
  title?: string;
  description?: string;
};

export function RecordLinkedCommunicationComposer({
  subjectType,
  subjectId,
  returnTo,
  title = "Add communication history",
  description = "Create or reuse the canonical thread for this record and save one message to FloorConnector history."
}: RecordLinkedCommunicationComposerProps) {
  return (
    <form
      action={createRecordLinkedCommunicationMessageAction}
      className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-4 py-4"
    >
      <input type="hidden" name="subjectType" value={subjectType} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Record-linked composer
          </p>
          <h4 className="mt-2 text-base font-semibold text-slate-950">
            {title}
          </h4>
          <p className="mt-1 max-w-[70ch] text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <div className="rounded-[4px] border border-[#ead9c7] bg-[#fff8f2] px-3 py-2 text-xs font-medium leading-5 text-[#8f5b32]">
          Saved in FloorConnector. Not emailed or texted.
        </div>
      </div>

      <fieldset className="mt-4 grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Message visibility</legend>
        <label className="flex cursor-pointer gap-3 rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-3 text-sm leading-5 text-slate-700">
          <input
            type="radio"
            name="visibility"
            value="internal"
            defaultChecked
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-slate-950">
              Add internal note
            </span>
            <span className="text-xs text-slate-500">
              Contractor-only context. Never visible in the portal.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-3 text-sm leading-5 text-slate-700">
          <input
            type="radio"
            name="visibility"
            value="customer_visible"
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-slate-950">
              Add customer-visible message
            </span>
            <span className="text-xs text-slate-500">
              Visible only through scoped customer-safe communication access.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="mt-4 space-y-2">
        <label
          htmlFor={`record-linked-communication-${subjectType}-${subjectId}`}
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]"
        >
          Message
        </label>
        <textarea
          id={`record-linked-communication-${subjectType}-${subjectId}`}
          name="body"
          rows={4}
          maxLength={5000}
          required
          placeholder="Add the message or note that should stay attached to this record."
          className="min-h-[112px] w-full rounded-[4px] border border-[#d6d6d6] bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#ef7d32]"
        />
        <p className="text-xs leading-5 text-slate-500">
          Customer-visible messages are portal-safe history only in this slice.
          They do not create provider delivery proof, email, SMS, reminders, or
          automation.
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <AuthSubmitButton pendingLabel="Saving message..." className="px-4">
          Post reply
        </AuthSubmitButton>
      </div>
    </form>
  );
}
