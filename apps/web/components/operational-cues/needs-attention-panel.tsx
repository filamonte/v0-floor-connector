import Link from "next/link";

import type { OperationalCue } from "@/lib/operational-cues/types";

function getUrgencyClassName(urgency: OperationalCue["urgency"]) {
  switch (urgency) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-950";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function formatUrgency(urgency: OperationalCue["urgency"]) {
  return urgency.replaceAll("_", " ");
}

function formatThresholdLabel(label: string | null) {
  return label?.replace(/^Rule threshold:/, "Threshold:") ?? null;
}

function buildSourceText(cue: OperationalCue) {
  return cue.sourceValue
    ? `${cue.sourceLabel}: ${cue.sourceValue}`
    : `${cue.sourceLabel}: Current record state`;
}

function buildResponsibilityText(cue: OperationalCue) {
  if (
    cue.responsibility.resolutionStatus === "person_resolved" ||
    cue.responsibility.resolutionStatus === "user_resolved"
  ) {
    return [
      `Responsible: ${cue.responsibility.displayLabel}`,
      `Role: ${cue.responsibility.strategyLabel}`
    ];
  }

  return [`Responsible: ${cue.responsibility.displayLabel}`];
}

export function NeedsAttentionPanel({
  cues,
  description = "Derived from canonical records and enabled organization cue rules.",
  emptyLabel = "No current attention items",
  getWorkItemAction
}: {
  cues: OperationalCue[];
  description?: string;
  emptyLabel?: string;
  getWorkItemAction?: (cue: OperationalCue) => { href: string; label: string } | null;
}) {
  return (
    <section
      aria-labelledby="needs-attention-title"
      className="rounded-lg border border-slate-200 bg-white px-4 py-4 sm:px-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Operational intelligence
          </p>
          <h3 id="needs-attention-title" className="mt-1 text-base font-semibold text-slate-950">
            Needs Attention
          </h3>
          <p className="mt-1 max-w-[68ch] text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {cues.length > 0
            ? `${cues.length} item${cues.length === 1 ? "" : "s"}`
            : "Current"}
        </span>
      </div>

      {cues.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {cues.map((cue) => {
            const secondaryMeta = [
              ...buildResponsibilityText(cue),
              buildSourceText(cue),
              formatThresholdLabel(cue.thresholdLabel),
              cue.triggeredAtLabel
            ].filter(Boolean);
            const workItemAction = getWorkItemAction?.(cue) ?? null;

            return (
            <article
              key={`${cue.cueKey}-${cue.subjectId}`}
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        getUrgencyClassName(cue.urgency)
                      ].join(" ")}
                    >
                      <span className="sr-only">Urgency: </span>
                      {formatUrgency(cue.urgency)}
                    </span>
                    {cue.ageDays > 0 ? (
                      <span className="text-xs font-medium text-slate-500">
                        <span className="sr-only">Cue age: </span>
                        {cue.ageDays} day{cue.ageDays === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-slate-950">
                    {cue.title}
                  </h4>
                  <p className="mt-1 text-sm leading-5 text-slate-700">
                    {cue.explanation}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-600">{cue.reason}</p>
                  <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-xs leading-5 text-slate-600">
                    {secondaryMeta.map((meta) => (
                      <div key={meta} className="min-w-0">
                        <dt className="sr-only">Cue detail</dt>
                        <dd className="break-words">{meta}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                  <Link
                    href={cue.actionHref}
                    aria-label={`${cue.actionLabel}: ${cue.title}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
                  >
                    {cue.actionLabel}
                  </Link>
                  {workItemAction ? (
                    <Link
                      href={workItemAction.href}
                      aria-label={`${workItemAction.label}: ${cue.title}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
                    >
                      {workItemAction.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
