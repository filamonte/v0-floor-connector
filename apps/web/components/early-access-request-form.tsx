"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  requestEarlyAccessAction,
  type EarlyAccessRequestFormState
} from "@/lib/early-access/actions";

const initialState: EarlyAccessRequestFormState = {
  status: "idle",
  message: ""
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#07080d] transition hover:bg-[#f2f5f9] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending..." : "Request Early Access"}
    </button>
  );
}

export function EarlyAccessRequestForm() {
  const [state, formAction] = useActionState(
    requestEarlyAccessAction,
    initialState
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-white/76">
          <span>Name</span>
          <input
            name="name"
            required
            maxLength={120}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-white/76">
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
            placeholder="you@company.com"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-white/76">
          <span>Company name</span>
          <input
            name="companyName"
            required
            maxLength={120}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
            placeholder="Company"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-white/76">
          <span>Trade / service type</span>
          <input
            name="trade"
            maxLength={120}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
            placeholder="Epoxy, polishing, coatings"
          />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-white/76">
        <span>Short note</span>
        <textarea
          name="note"
          maxLength={1500}
          rows={4}
          className="min-h-28 resize-y rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/36 focus:border-white/40"
          placeholder="Tell us what you want to try first."
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <SubmitButton />
        {state.message ? (
          <p
            className={[
              "text-sm font-medium",
              state.status === "success" ? "text-emerald-200" : "text-rose-200"
            ].join(" ")}
            aria-live="polite"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
