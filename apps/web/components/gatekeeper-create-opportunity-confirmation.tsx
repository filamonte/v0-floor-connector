"use client";

import { useMemo, useState } from "react";

import {
  buildGateKeeperCreateOpportunityConfirmationModel,
  getGateKeeperCreateOpportunityConfirmationMissingFields,
  type GateKeeperCreateOpportunityConfirmationDraft
} from "@/lib/gatekeeper/create-opportunity-confirmation";
import {
  executeCreateOpportunityFromGateKeeperAction,
  requestCreateOpportunityExecutionAction,
  saveCreateOpportunityExecutionDraftAction
} from "@/lib/gatekeeper/actions";
import { getGateKeeperCreateOpportunityExecutionRequestEligibility } from "@/lib/gatekeeper/create-opportunity-execution-request";
import { getGateKeeperCreateOpportunityExecutionEligibility } from "@/lib/gatekeeper/create-opportunity-execution";
import type { GateKeeperCreateOpportunityDuplicatePreview } from "@/lib/gatekeeper/create-opportunity-duplicates";
import type { GateKeeperCreateOpportunityPreflight } from "@/lib/gatekeeper/create-opportunity-preflight";
import type { GateKeeperActionSuggestion } from "@floorconnector/types";

type GateKeeperCreateOpportunityConfirmationProps = {
  duplicatePreview: GateKeeperCreateOpportunityDuplicatePreview | null;
  preflight: GateKeeperCreateOpportunityPreflight | null;
  proposedPayload: GateKeeperActionSuggestion["proposedPayload"];
  returnTo: string;
  suggestionId: string;
  suggestionStatus: GateKeeperActionSuggestion["status"];
};

type DraftFieldProps = {
  label: string;
  name: keyof GateKeeperCreateOpportunityConfirmationDraft;
  onChange: (
    name: keyof GateKeeperCreateOpportunityConfirmationDraft,
    value: string
  ) => void;
  value: string;
  multiline?: boolean;
};

function DraftField({
  label,
  multiline = false,
  name,
  onChange,
  value
}: DraftFieldProps) {
  const baseClass =
    "mt-1 w-full rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#8f5b32] focus:ring-2 focus:ring-[#e4d7ca]";

  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          rows={4}
          className={baseClass}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={baseClass}
        />
      )}
    </label>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatLedgerStatus(value: string) {
  switch (value) {
    case "confirmation_started":
      return "confirmation draft saved";
    case "execution_requested":
      return "execution requested";
    default:
      return formatStatus(value);
  }
}

function SavedDraftPreflightSection({
  preflight,
  returnTo,
  suggestionStatus
}: {
  preflight: GateKeeperCreateOpportunityPreflight;
  returnTo: string;
  suggestionStatus: GateKeeperActionSuggestion["status"];
}) {
  const requestEligibility =
    getGateKeeperCreateOpportunityExecutionRequestEligibility({
      preflight,
      suggestionStatus
    });
  const executionEligibility =
    getGateKeeperCreateOpportunityExecutionEligibility({
      preflight,
      suggestionStatus
    });

  return (
    <div className="mt-4 space-y-3 border border-[#d8c7b8] bg-white px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Saved confirmation draft
          </p>
          <h4 className="mt-2 text-base font-semibold tracking-tight text-slate-950">
            Preflight summary
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Status: {formatLedgerStatus(preflight.savedDraft.status)}. Saved{" "}
            {formatDateTime(preflight.savedDraft.updatedAt)}.
          </p>
        </div>
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          {formatStatus(preflight.currentEligibility)}
        </span>
      </div>

      <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
        {preflight.safetyCopy.map((item) => (
          <p key={item}>{item}</p>
        ))}
        {preflight.savedDraft.requestedAt &&
        !preflight.savedDraft.resultSubjectId ? (
          <p className="mt-1 font-semibold">
            Future execution requested{" "}
            {formatDateTime(preflight.savedDraft.requestedAt)}. No opportunity
            has been created.
          </p>
        ) : null}
        {preflight.savedDraft.resultSubjectType === "opportunity" &&
        preflight.savedDraft.resultSubjectId ? (
          <p className="mt-1 font-semibold">
            Created by GateKeeper controlled execution:{" "}
            <a
              href={`/leads/${preflight.savedDraft.resultSubjectId}`}
              className="text-[#8f5b32] underline-offset-2 hover:underline"
            >
              Opportunity {preflight.savedDraft.resultSubjectId.slice(0, 8)}
            </a>
            .
          </p>
        ) : null}
        {preflight.savedDraft.status === "failed" &&
        preflight.savedDraft.executionError ? (
          <p className="mt-1 font-semibold">
            Last execution error: {preflight.savedDraft.executionError}
          </p>
        ) : null}
        <p className="mt-1 font-semibold">
          canExecuteNow: {String(preflight.canExecuteNow)}
        </p>
      </div>

      {preflight.executionResult ? (
        <div
          className={[
            "rounded-[4px] border px-3 py-3 text-xs leading-5",
            preflight.executionResult.status === "executed"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          ].join(" ")}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            Execution result
          </p>
          <p className="mt-1 font-semibold">
            {preflight.executionResult.message}
          </p>
          {preflight.executionResult.occurredAt ? (
            <p className="mt-1">
              Recorded {formatDateTime(preflight.executionResult.occurredAt)}.
            </p>
          ) : null}
          {preflight.executionResult.href ? (
            <a
              href={preflight.executionResult.href}
              className="mt-2 inline-flex font-semibold text-[#8f5b32] underline-offset-2 hover:underline"
            >
              Open {preflight.executionResult.label}
            </a>
          ) : null}
          {preflight.executionResult.status === "failed" ? (
            <p className="mt-2 font-semibold">
              No retry action is available in this pass.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Saved draft fields
          </p>
          <dl className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            <div>
              <dt className="font-semibold">Contact</dt>
              <dd>{preflight.savedDraft.draft.contactName || "Missing"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Phone / email</dt>
              <dd>
                {[
                  preflight.savedDraft.draft.phone,
                  preflight.savedDraft.draft.email
                ]
                  .filter(Boolean)
                  .join(" / ") || "Missing"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Service</dt>
              <dd>
                {preflight.savedDraft.draft.requestedService || "Missing"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Location</dt>
              <dd>{preflight.savedDraft.draft.locationText || "Missing"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Future readiness
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Future readiness:{" "}
            <span className="font-semibold">
              {formatStatus(preflight.readiness)}
            </span>
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Future owner:{" "}
            <span className="font-semibold">{preflight.futureOwner}</span>
          </p>
          {preflight.missingRecommendedFields.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
              {preflight.missingRecommendedFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Required draft fields are present. Canonical validation is still
              required later.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Duplicate state
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {preflight.duplicatePreview.warningSummary}
          </p>
          {preflight.duplicatePreview.matches.length > 0 ? (
            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
              {preflight.duplicatePreview.matches.map((match) => (
                <li key={`${match.matchType}:${match.id}`}>
                  <span className="font-semibold">{match.displayLabel}</span> (
                  {match.confidence} confidence)
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Blockers
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {preflight.blockers.map((blocker) => (
              <li key={blocker.code}>
                <span className="font-semibold">
                  {formatStatus(blocker.code)}:
                </span>{" "}
                {blocker.message}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-[4px] border border-[#d8c7b8] bg-white px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Execution request
            </p>
            <div className="mt-1 space-y-1 text-xs leading-5 text-slate-600">
              {requestEligibility.safetyCopy.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          {requestEligibility.canRequestExecution ? (
            <form action={requestCreateOpportunityExecutionAction}>
              <input
                type="hidden"
                name="executionAttemptId"
                value={preflight.savedDraft.id}
              />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a]"
              >
                Request future execution
              </button>
            </form>
          ) : (
            <div className="max-w-sm rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              <p className="font-semibold">Request blocked</p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {requestEligibility.blockers.map((blocker) => (
                  <li key={blocker.code}>{blocker.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[4px] border border-[#d8c7b8] bg-white px-3 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
              Controlled execution
            </p>
            <div className="mt-1 space-y-1 text-xs leading-5 text-slate-600">
              {executionEligibility.safetyCopy.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          {executionEligibility.canExecute ? (
            <form action={executeCreateOpportunityFromGateKeeperAction}>
              <input
                type="hidden"
                name="executionAttemptId"
                value={preflight.savedDraft.id}
              />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a]"
              >
                Create opportunity
              </button>
            </form>
          ) : (
            <div className="max-w-sm rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              <p className="font-semibold">
                {preflight.savedDraft.status === "executed"
                  ? "Execution complete"
                  : preflight.savedDraft.status === "failed"
                    ? "Execution failed"
                    : "Execution blocked"}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {executionEligibility.blockers.map((blocker) => (
                  <li key={blocker.code}>{blocker.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GateKeeperCreateOpportunityConfirmation({
  duplicatePreview,
  preflight,
  proposedPayload,
  returnTo,
  suggestionId,
  suggestionStatus
}: GateKeeperCreateOpportunityConfirmationProps) {
  const model = useMemo(
    () => buildGateKeeperCreateOpportunityConfirmationModel(proposedPayload),
    [proposedPayload]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(model.draft);

  const missingFields =
    getGateKeeperCreateOpportunityConfirmationMissingFields(draft);

  function updateDraft(
    name: keyof GateKeeperCreateOpportunityConfirmationDraft,
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      [name]: value
    }));
  }

  function resetDraft() {
    setDraft(model.draft);
  }

  return (
    <section className="border border-[#d8c7b8] bg-[#fffaf5] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
            Confirmation preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Prepare opportunity draft
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Inspect and edit the future opportunity draft. This does not execute
            or create a lead.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-[4px] border border-[#8f5b32] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8f5b32] transition hover:bg-[#fbf5ee]"
        >
          {isOpen ? "Hide confirmation preview" : "Open confirmation preview"}
        </button>
      </div>

      {preflight ? (
        <SavedDraftPreflightSection
          preflight={preflight}
          returnTo={returnTo}
          suggestionStatus={suggestionStatus}
        />
      ) : null}

      {isOpen ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
            <p className="font-semibold">
              This local draft does not create an opportunity.
            </p>
            <p className="mt-1">
              canExecuteNow: {String(model.canExecuteNow)}. Save the draft,
              request execution, then use the controlled execution step. This
              editor itself creates no opportunity, contact, customer, project,
              estimate, appointment, task, message, invoice, contract, payment,
              or portal record.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <DraftField
              label="Contact / customer name"
              name="contactName"
              value={draft.contactName}
              onChange={updateDraft}
            />
            <DraftField
              label="Phone"
              name="phone"
              value={draft.phone}
              onChange={updateDraft}
            />
            <DraftField
              label="Email"
              name="email"
              value={draft.email}
              onChange={updateDraft}
            />
            <DraftField
              label="Requested service"
              name="requestedService"
              value={draft.requestedService}
              onChange={updateDraft}
            />
            <DraftField
              label="Location / address text"
              name="locationText"
              value={draft.locationText}
              onChange={updateDraft}
            />
            <DraftField
              label="Requested appointment text"
              name="requestedAppointmentText"
              value={draft.requestedAppointmentText}
              onChange={updateDraft}
            />
            <DraftField
              label="Source label"
              name="sourceLabel"
              value={draft.sourceLabel}
              onChange={updateDraft}
            />
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetDraft}
                className="inline-flex items-center justify-center rounded-[4px] border border-[#d6d6d6] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3f3f3f] transition hover:bg-slate-50"
              >
                Reset draft
              </button>
            </div>
            <div className="lg:col-span-2">
              <DraftField
                label="Notes"
                name="notes"
                value={draft.notes}
                onChange={updateDraft}
                multiline
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Missing before future execution
              </p>
              {missingFields.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Preview fields are present. Canonical validation and duplicate
                  checks are still required later.
                </p>
              )}
            </div>

            <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Possible duplicates
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Read-only tenant check. This does not merge, link, block, or
                create anything. High-confidence matches can block request or
                execution until reviewed.
              </p>
              {duplicatePreview ? (
                <div className="mt-2 space-y-3">
                  <p className="text-xs leading-5 text-slate-600">
                    {duplicatePreview.warningSummary}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {duplicatePreview.checkedSignals.map((signal) => (
                      <span
                        key={signal}
                        className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                  {duplicatePreview.matches.length > 0 ? (
                    <ul className="space-y-2 text-xs leading-5 text-slate-600">
                      {duplicatePreview.matches.map((match) => (
                        <li
                          key={`${match.matchType}:${match.id}`}
                          className="rounded-[4px] border border-[#e5e5e5] bg-[#f8f8f8] px-2.5 py-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {match.href ? (
                              <a
                                href={match.href}
                                className="font-semibold text-[#8f5b32] hover:text-[#6c4324]"
                              >
                                {match.displayLabel}
                              </a>
                            ) : (
                              <span className="font-semibold text-slate-800">
                                {match.displayLabel}
                              </span>
                            )}
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                              {match.matchType.replaceAll("_", " ")}
                            </span>
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
                              {match.confidence} confidence
                            </span>
                          </div>
                          {match.status ? (
                            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                              Status: {match.status.replaceAll("_", " ")}
                            </p>
                          ) : null}
                          <ul className="mt-1 list-disc space-y-0.5 pl-4">
                            {match.reasonLabels.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs leading-5 text-slate-600">
                      No possible matches were found in this bounded preview.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
                  {model.duplicatePlaceholders.map((placeholder) => (
                    <li key={placeholder.label}>
                      <span className="font-semibold">
                        {placeholder.label}:
                      </span>{" "}
                      {placeholder.message}
                      <span className="ml-1 font-semibold uppercase text-amber-800">
                        {placeholder.status.replaceAll("_", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <form
            action={saveCreateOpportunityExecutionDraftAction}
            className="rounded-[4px] border border-[#d8c7b8] bg-white px-3 py-3"
          >
            <input type="hidden" name="suggestionId" value={suggestionId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="contactName" value={draft.contactName} />
            <input type="hidden" name="phone" value={draft.phone} />
            <input type="hidden" name="email" value={draft.email} />
            <input
              type="hidden"
              name="requestedService"
              value={draft.requestedService}
            />
            <input
              type="hidden"
              name="locationText"
              value={draft.locationText}
            />
            <input type="hidden" name="notes" value={draft.notes} />
            <input
              type="hidden"
              name="requestedAppointmentText"
              value={draft.requestedAppointmentText}
            />
            <input type="hidden" name="sourceLabel" value={draft.sourceLabel} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                  Ledger draft
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  This only saves a GateKeeper execution draft. It does not
                  create a lead, contact, customer, project, estimate, schedule,
                  message, invoice, contract, payment, or portal record.
                </p>
                <p className="mt-1 text-xs leading-5 font-semibold text-amber-800">
                  This save step is ledger-only. It does not execute the
                  opportunity create workflow.
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a]"
              >
                Save confirmation draft
              </button>
            </div>
          </form>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Future validation
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                {model.futureValidationRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Safety checklist
              </p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                {model.safetyChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-3 text-xs leading-5 text-slate-600">
            <p>
              Future owner:{" "}
              <span className="font-semibold">{model.executionOwner}</span>
            </p>
            {model.blockers.map((blocker) => (
              <p key={blocker.code} className="mt-1">
                <span className="font-semibold">
                  {blocker.code.replaceAll("_", " ")}:
                </span>{" "}
                {blocker.message}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
