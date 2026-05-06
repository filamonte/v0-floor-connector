"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";

import {
  sendEarlyAccessFeedbackAction,
  type EarlyAccessFeedbackFormState
} from "@/lib/early-access/feedback-actions";

const initialState: EarlyAccessFeedbackFormState = {
  status: "idle",
  message: ""
};

function FeedbackSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-[4px] bg-[#171412] px-3 text-sm font-semibold text-white transition hover:bg-[#2b241f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending..." : "Send feedback"}
    </button>
  );
}

export function EarlyAccessHelpButton() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(
    sendEarlyAccessFeedbackAction,
    initialState
  );

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = window.setTimeout(() => setIsOpen(false), 1200);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [state.status]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ml-auto inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#171412] bg-[#171412] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition hover:bg-[#2b241f]"
        >
          Send Feedback
        </button>
      </div>
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        className="w-[min(460px,calc(100vw-2rem))] rounded-xl border border-[#d8d1c9] bg-white p-0 text-[#211b16] shadow-[0_28px_90px_-46px_rgba(0,0,0,0.85)] backdrop:bg-black/30"
      >
        <form action={formAction} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold">Send feedback</p>
              <p className="mt-1 text-sm leading-6 text-[#63594f]">
                Tell us what felt confusing, missing, or useful during early access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-[#d8d1c9] px-2.5 py-1 text-sm font-semibold text-[#63594f] transition hover:border-[#171412] hover:text-[#171412]"
              aria-label="Close feedback"
            >
              Close
            </button>
          </div>
          <input type="hidden" name="path" value={pathname} />
          <label className="grid gap-1.5 text-sm font-medium text-[#4e473f]">
            <span>Message</span>
            <textarea
              name="message"
              required
              maxLength={2000}
              rows={5}
              className="min-h-32 resize-y rounded-lg border border-[#d8d1c9] bg-white px-3 py-2 text-sm leading-6 outline-none transition focus:border-[#171412]"
              placeholder="What should we fix, clarify, or keep?"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#4e473f]">
            <span>Optional email</span>
            <input
              name="email"
              type="email"
              maxLength={255}
              className="h-10 rounded-lg border border-[#d8d1c9] bg-white px-3 text-sm outline-none transition focus:border-[#171412]"
              placeholder="you@company.com"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <FeedbackSubmitButton />
            <a
              href="mailto:support@floorconnector.com?subject=FloorConnector%20early%20access%20help"
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-[#d8d1c9] bg-white px-3 text-sm font-semibold text-[#4e473f] transition hover:border-[#171412] hover:text-[#171412]"
            >
              Email support
            </a>
            {state.message ? (
              <p
                className={[
                  "text-sm font-medium",
                  state.status === "success" ? "text-emerald-700" : "text-rose-700"
                ].join(" ")}
                aria-live="polite"
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </form>
      </dialog>
    </>
  );
}
