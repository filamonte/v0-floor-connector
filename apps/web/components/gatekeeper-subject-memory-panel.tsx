import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { DetailPanel } from "@/components/detail-panel";
import { createGateKeeperInternalNoteAction } from "@/lib/gatekeeper/actions";
import { gateKeeperInternalNoteTypeOptions } from "@/lib/gatekeeper/internal-note-adapter";
import type { GateKeeperSubjectMemory } from "@/lib/gatekeeper/memory";

type GateKeeperSubjectMemoryPanelProps = {
  memory: GateKeeperSubjectMemory;
  actionClassName?: string;
  returnTo?: string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function getArtifactStatusClassName(status: string) {
  switch (status) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rejected":
    case "dismissed":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function getSuggestionStatusClassName(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "rejected":
    case "dismissed":
    case "superseded":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function StatusBadge({
  label,
  className
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {label}
    </span>
  );
}

export function GateKeeperSubjectMemoryPanel({
  memory,
  actionClassName = "inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50",
  returnTo
}: GateKeeperSubjectMemoryPanelProps) {
  const hasMemory =
    memory.artifacts.length > 0 ||
    memory.suggestions.length > 0 ||
    memory.executionResults.length > 0 ||
    memory.communicationMessages.length > 0 ||
    memory.communicationThreads.length > 0;

  return (
    <DetailPanel
      title="GateKeeper Operational Memory"
      description="Read-only GateKeeper memory linked to this canonical record. Suggestions are review items only; nothing shown here was executed automatically."
    >
      <div className="space-y-5 text-sm leading-6 text-slate-600">
        <form
          action={createGateKeeperInternalNoteAction}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
        >
          <input type="hidden" name="subjectType" value={memory.subjectType} />
          <input type="hidden" name="subjectId" value={memory.subjectId} />
          <input
            type="hidden"
            name="returnTo"
            value={
              returnTo ??
              (memory.subjectType === "opportunity"
                ? `/leads/${memory.subjectId}`
                : `/${memory.subjectType}s/${memory.subjectId}`)
            }
          />
          <div className="space-y-2">
            <label
              htmlFor={`gatekeeper-note-${memory.subjectType}-${memory.subjectId}`}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"
            >
              Internal GateKeeper note
            </label>
            <p className="text-xs leading-5 text-slate-500">
              Add contractor-only operational memory. This creates reviewable
              GateKeeper memory only and does not execute actions or contact the
              customer.
            </p>
            <textarea
              id={`gatekeeper-note-${memory.subjectType}-${memory.subjectId}`}
              name="noteText"
              rows={3}
              required
              minLength={2}
              placeholder="Add an internal observation, concern, or follow-up note."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <label
                htmlFor={`gatekeeper-note-type-${memory.subjectType}-${memory.subjectId}`}
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Note type
              </label>
              <select
                id={`gatekeeper-note-type-${memory.subjectType}-${memory.subjectId}`}
                name="noteType"
                defaultValue="general"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                {gateKeeperInternalNoteTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add memory note
            </button>
          </div>
        </form>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Artifacts
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {memory.artifacts.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Suggestions
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {memory.suggestions.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Results
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {memory.executionResults.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Evidence
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {memory.communicationMessages.length}
            </p>
          </div>
        </div>

        {hasMemory ? (
          <>
            {memory.artifacts.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Memory artifacts
                  </h3>
                  <Link
                    href="/gatekeeper?view=memory&status=all"
                    className="text-xs font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Review queue
                  </Link>
                </div>
                {memory.artifacts.map((artifact) => (
                  <article
                    key={artifact.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-950">
                        {formatLabel(artifact.artifactType)}
                      </span>
                      <StatusBadge
                        label={formatLabel(artifact.reviewStatus)}
                        className={getArtifactStatusClassName(
                          artifact.reviewStatus
                        )}
                      />
                    </div>
                    <p className="mt-2 text-slate-600">
                      {artifact.contentText ?? "Structured memory artifact."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Created {formatDateTime(artifact.createdAt)}
                      {artifact.confidence
                        ? ` - Confidence ${artifact.confidence}`
                        : ""}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}

            {memory.suggestions.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Action suggestions
                </h3>
                {memory.suggestions.map((suggestion) => (
                  <article
                    key={suggestion.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-950">
                        {suggestion.title}
                      </span>
                      <StatusBadge
                        label={formatLabel(suggestion.status)}
                        className={getSuggestionStatusClassName(
                          suggestion.status
                        )}
                      />
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                      {formatLabel(suggestion.suggestionType)}
                    </p>
                    <p className="mt-2 text-slate-600">
                      {suggestion.rationale ??
                        "Review this suggestion in GateKeeper before deciding whether any canonical action is needed."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Suggested {formatDateTime(suggestion.createdAt)}. Approval
                      is review state only.
                    </p>
                  </article>
                ))}
              </section>
            ) : null}

            {memory.executionResults.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Execution results
                </h3>
                {memory.executionResults.map((result) => (
                  <article
                    key={result.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-950">
                        {formatLabel(result.actionType)}
                      </span>
                      <StatusBadge
                        label={formatLabel(result.status)}
                        className={
                          result.status === "executed"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-rose-200 bg-rose-50 text-rose-900"
                        }
                      />
                    </div>
                    <p className="mt-2 text-slate-600">
                      {result.status === "executed"
                        ? "Created by GateKeeper controlled execution."
                        : (result.executionError ??
                          "GateKeeper controlled execution failed.")}
                    </p>
                    {result.resultHref ? (
                      <Link
                        href={result.resultHref}
                        className="mt-2 inline-flex text-xs font-semibold text-brand-700 transition hover:text-brand-900"
                      >
                        Open created opportunity
                      </Link>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      Recorded{" "}
                      {formatDateTime(result.executedAt ?? result.updatedAt)}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}

            {memory.communicationMessages.length > 0 ? (
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Communication evidence
                </h3>
                {memory.communicationMessages.map((message) => (
                  <article
                    key={message.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-950">
                        {formatLabel(message.messageKind)}
                      </span>
                      <StatusBadge
                        label={formatLabel(message.channelKind)}
                        className="border-slate-200 bg-slate-50 text-slate-700"
                      />
                      <StatusBadge
                        label={formatLabel(message.direction)}
                        className="border-slate-200 bg-white text-slate-700"
                      />
                    </div>
                    <p className="mt-2 text-slate-600">
                      {message.bodyPreview ||
                        "No communication preview stored."}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Occurred {formatDateTime(message.occurredAt)}
                    </p>
                  </article>
                ))}
              </section>
            ) : null}
          </>
        ) : (
          <AppEmptyState
            eyebrow="No GateKeeper memory yet"
            title="Operational memory will attach here"
            description="Future calls, chats, voicemails, internal notes, and assistant observations linked to this record will appear here after they enter the canonical GateKeeper review flow."
          />
        )}

        <div className="border-t border-slate-200 pt-4">
          <p className="mb-3 text-xs leading-5 text-slate-500">
            This panel is read-only. Review decisions stay in GateKeeper, and
            reviewed suggestions are not proof that downstream work was done.
          </p>
          <Link href="/gatekeeper" className={actionClassName}>
            Open GateKeeper review queue
          </Link>
        </div>
      </div>
    </DetailPanel>
  );
}
