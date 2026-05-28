import Link from "next/link";

import type { ScheduleWarningSummary } from "@/lib/schedule/warnings";

const scheduleSecondaryActionToneClassName =
  "border-[var(--border-warm)] bg-white text-[var(--text-primary)] hover:bg-[var(--highlight)]";

export type ScheduleOperationalIndicator = {
  id: string;
  label: string;
  detail: string;
  href?: string | null;
  tone: "ready" | "warning" | "blocked" | "neutral";
};

function getIndicatorClassName(tone: ScheduleOperationalIndicator["tone"]) {
  switch (tone) {
    case "ready":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "blocked":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-[var(--border-warm)] bg-white text-[var(--text-secondary)]";
  }
}

export function ScheduleWarningBadges(input: {
  warnings: ScheduleWarningSummary[];
  limit?: number;
}) {
  const visibleWarnings = input.warnings.slice(0, input.limit ?? 2);
  const hiddenCount = Math.max(
    input.warnings.length - visibleWarnings.length,
    0
  );

  if (input.warnings.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visibleWarnings.map((warning) => (
        <span
          key={warning.id}
          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800"
          title={warning.detail}
        >
          {warning.label}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

export function ScheduleOperationalIndicators(input: {
  indicators: ScheduleOperationalIndicator[];
  limit?: number;
}) {
  const visibleIndicators = input.indicators.slice(0, input.limit ?? 4);
  const hiddenCount = Math.max(
    input.indicators.length - visibleIndicators.length,
    0
  );

  if (visibleIndicators.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visibleIndicators.map((indicator) => {
        const className = [
          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
          getIndicatorClassName(indicator.tone)
        ].join(" ");

        return indicator.href ? (
          <Link
            key={indicator.id}
            href={indicator.href}
            className={`${className} transition hover:opacity-80`}
            title={indicator.detail}
          >
            {indicator.label}
          </Link>
        ) : (
          <span
            key={indicator.id}
            className={className}
            title={indicator.detail}
          >
            {indicator.label}
          </span>
        );
      })}
      {hiddenCount > 0 ? (
        <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

export function ScheduleNotesPreview(input: { notes: string | null }) {
  const notes = input.notes?.trim();

  if (!notes) {
    return null;
  }

  return (
    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
      Schedule notes: {notes}
    </p>
  );
}

export function ScheduleJobActionLinks(input: {
  actionHref: string;
  actionLabel: string;
  actionToneClass: string;
  projectHref: string;
  projectLabel: string;
  projectVariant?: "plain" | "bordered";
  jobHref?: string;
  jobLabel?: string;
  jobVariant?: "plain" | "bordered";
  dailyLogHref?: string;
  size?: "compact" | "default";
  justifyEnd?: boolean;
}) {
  const actionPadding =
    input.size === "compact" ? "px-2.5 py-1.5" : "px-3 py-2";
  const secondaryPadding =
    input.size === "compact" ? "px-2.5 py-1.5" : "px-3 py-2";
  const secondaryText =
    input.size === "compact"
      ? "text-xs font-semibold uppercase tracking-[0.14em]"
      : "text-xs font-semibold uppercase tracking-[0.14em]";

  const projectClassName =
    input.projectVariant === "bordered"
      ? `inline-flex items-center justify-center rounded-[4px] border text-center leading-4 ${scheduleSecondaryActionToneClassName} ${secondaryPadding} ${secondaryText} transition`
      : `inline-flex items-center justify-center rounded-[4px] text-center leading-4 ${secondaryPadding} ${secondaryText} text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]`;

  const jobClassName =
    input.jobVariant === "bordered"
      ? `inline-flex items-center justify-center rounded-[4px] border text-center leading-4 ${scheduleSecondaryActionToneClassName} ${secondaryPadding} ${secondaryText} transition`
      : `inline-flex items-center justify-center rounded-[4px] text-center leading-4 ${secondaryPadding} ${secondaryText} text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]`;

  return (
    <div
      className={`flex flex-wrap gap-2 ${input.justifyEnd ? "md:justify-end" : ""}`}
    >
      <Link
        href={input.actionHref}
        className={[
          `inline-flex items-center justify-center rounded-[4px] border ${actionPadding} text-center text-xs font-semibold uppercase leading-4 tracking-[0.14em] transition`,
          input.actionToneClass
        ].join(" ")}
      >
        {input.actionLabel}
      </Link>
      <Link href={input.projectHref} className={projectClassName}>
        {input.projectLabel}
      </Link>
      {input.jobHref && input.jobLabel ? (
        <Link href={input.jobHref} className={jobClassName}>
          {input.jobLabel}
        </Link>
      ) : null}
      {input.dailyLogHref ? (
        <Link href={input.dailyLogHref} className={jobClassName}>
          Daily Job Log
        </Link>
      ) : null}
    </div>
  );
}
