"use client";

import { useActionState } from "react";

import {
  issueTemporaryPortalCredentialAction,
  type TemporaryPortalCredentialActionState
} from "@/lib/portal-access/actions";

type TemporaryPortalCredentialFormProps = {
  customerId: string;
  portalAccessGrantId: string;
  returnTo: string;
  hasPortalUser: boolean;
};

const initialState: TemporaryPortalCredentialActionState = {
  status: "idle",
  message: null,
  email: null,
  temporaryPassword: null,
  createdAuthUser: false
};

export function TemporaryPortalCredentialForm({
  customerId,
  portalAccessGrantId,
  returnTo,
  hasPortalUser
}: TemporaryPortalCredentialFormProps) {
  const [state, formAction, pending] = useActionState(
    issueTemporaryPortalCredentialAction,
    initialState
  );

  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-amber-950">
            Temporary portal login
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Support fallback only. Generates a temporary password, shows it once,
            and marks the customer contact to change it after login.
          </p>
        </div>
        <form action={formAction}>
          <input type="hidden" name="portalAccessGrantId" value={portalAccessGrantId} />
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-[4px] border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "Preparing..."
              : hasPortalUser
                ? "Set temporary password"
                : "Create temporary login"}
          </button>
        </form>
      </div>

      {state.status === "error" && state.message ? (
        <p className="mt-3 text-sm font-medium text-red-700">{state.message}</p>
      ) : null}

      {state.status === "success" && state.temporaryPassword ? (
        <div className="mt-4 border border-amber-300 bg-white px-3 py-3">
          <p className="text-sm font-medium text-slate-950">{state.message}</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-[auto_minmax(0,1fr)]">
            <dt className="font-medium text-slate-950">Email</dt>
            <dd className="break-all">{state.email}</dd>
            <dt className="font-medium text-slate-950">Temporary password</dt>
            <dd className="break-all font-mono text-slate-950">
              {state.temporaryPassword}
            </dd>
          </dl>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Shown once. FloorConnector does not store this password value.
          </p>
        </div>
      ) : null}
    </div>
  );
}
