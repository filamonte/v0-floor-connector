import Link from "next/link";
import type { ReactNode } from "react";

import type { ScheduleFieldHandoffSummary } from "@/lib/schedule/field-handoff-read-model";
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

export type ScheduleDispatchBoardLayoutOption = {
  key: string;
  label: string;
  href: string;
  active: boolean;
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

export function ScheduleDispatchBoardShell(input: {
  eyebrow: string;
  title: string;
  description: string;
  layoutOptions: ScheduleDispatchBoardLayoutOption[];
  primaryCount: number;
  primaryLabel: string;
  crewAttentionCount: number;
  rangeLabel: string;
  previousHref: string;
  previousLabel: string;
  todayHref: string;
  nextHref: string;
  nextLabel: string;
  boardModeDescription?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-[var(--border-warm)] bg-white shadow-sm">
      <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {input.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {input.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              {input.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {input.layoutOptions.map((option) => (
              <Link
                key={option.key}
                href={option.href}
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition",
                  option.active
                    ? "bg-[var(--graphite)] text-white"
                    : `border ${scheduleSecondaryActionToneClassName}`
                ].join(" ")}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border-warm)] pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[var(--border-warm)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
              {input.primaryCount} {input.primaryLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
              {input.crewAttentionCount} need crew
            </span>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {input.rangeLabel}
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={input.previousHref}
                className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
              >
                {input.previousLabel}
              </Link>
              <Link
                href={input.todayHref}
                className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
              >
                Today
              </Link>
              <Link
                href={input.nextHref}
                className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
              >
                {input.nextLabel}
              </Link>
            </div>
            {input.boardModeDescription ? (
              <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)] lg:text-right">
                {input.boardModeDescription}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {input.children}
    </section>
  );
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

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatFieldActivityDate(value: string | null) {
  if (!value) {
    return "No field activity yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ScheduleFieldHandoffPanel(input: {
  handoff: ScheduleFieldHandoffSummary;
  compact?: boolean;
}) {
  const statClassName =
    "rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2";
  const actionClassName =
    "inline-flex items-center rounded-[4px] border px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition";

  return (
    <div
      className={[
        "rounded-[6px] border px-3 py-3 text-sm leading-6",
        getIndicatorClassName(input.handoff.tone)
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Field handoff
          </p>
          <p className="mt-1 font-semibold">{input.handoff.label}</p>
          <p className="mt-1">{input.handoff.detail}</p>
        </div>
        <Link
          href={input.handoff.dailyLogHref}
          className={`${actionClassName} ${scheduleSecondaryActionToneClassName}`}
        >
          {input.handoff.dailyLog ? "Open Daily Log" : "Start Daily Log"}
        </Link>
      </div>

      <div
        className={[
          "mt-3 grid gap-2",
          input.compact ? "sm:grid-cols-2" : "sm:grid-cols-4"
        ].join(" ")}
      >
        <div className={statClassName}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            Crew
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {input.handoff.hasCrewAssigned ? "Assigned" : "Missing"}
          </p>
        </div>
        <div className={statClassName}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            Daily Log
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {input.handoff.dailyLog
              ? formatStatusLabel(input.handoff.dailyLog.status)
              : "Not started"}
          </p>
        </div>
        <div className={statClassName}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            Blockers
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {input.handoff.openBlockerCount} open
          </p>
        </div>
        <div className={statClassName}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
            Time
          </p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">
            {input.handoff.targetDateTimeCardCount} card
            {input.handoff.targetDateTimeCardCount === 1 ? "" : "s"}
            {input.handoff.openTimeCardCount > 0
              ? ` / ${input.handoff.openTimeCardCount} open`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          Latest activity:{" "}
          {formatFieldActivityDate(input.handoff.latestFieldActivityAt)}
        </span>
        <Link href={input.handoff.jobHref} className={actionClassName}>
          Job
        </Link>
        <Link href={input.handoff.projectHref} className={actionClassName}>
          Project
        </Link>
        <Link href={input.handoff.fieldWorkHref} className={actionClassName}>
          Field queue
        </Link>
        {input.handoff.openBlockerCount > 0 ? (
          <Link href={input.handoff.blockerHref} className={actionClassName}>
            Blockers
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function ScheduleSelectedJobPanelSummary(input: {
  title: string;
  customerName: string;
  dispatchStatusLabel: string;
  serviceTicket?: { id: string; title: string } | null;
  assignmentSummary: string;
  indicators: ScheduleOperationalIndicator[];
  projectHref: string;
  jobHref: string;
  dailyLogHref: string;
}) {
  return (
    <>
      <div className="rounded-[6px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
        <p className="font-semibold text-[var(--text-primary)]">
          {input.title}
        </p>
        <p className="mt-1">
          {input.customerName} ·{" "}
          <span className="capitalize">{input.dispatchStatusLabel}</span>
        </p>
        {input.serviceTicket ? (
          <p className="mt-1">
            Service ticket:{" "}
            <Link
              href={`/service-tickets/${input.serviceTicket.id}`}
              className="font-medium text-[var(--copper)] transition hover:text-[var(--copper-light)]"
            >
              {input.serviceTicket.title}
            </Link>
          </p>
        ) : null}
        <p className="mt-1">{input.assignmentSummary}</p>
        <ScheduleOperationalIndicators indicators={input.indicators} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={input.projectHref}
          className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
        >
          Open Project Workspace
        </Link>
        <Link
          href={input.jobHref}
          className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
        >
          Open job
        </Link>
        <Link
          href={input.dailyLogHref}
          className={`inline-flex items-center rounded-[4px] border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${scheduleSecondaryActionToneClassName}`}
        >
          Start Daily Job Log
        </Link>
      </div>
    </>
  );
}

export function ScheduleWarningDetails(input: {
  warnings: ScheduleWarningSummary[];
}) {
  if (input.warnings.length === 0) {
    return (
      <div className="rounded-[6px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
        No schedule warnings found for this job.
      </div>
    );
  }

  return (
    <div className="rounded-[6px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
        Schedule warnings
      </p>
      <ul className="mt-2 space-y-2">
        {input.warnings.map((warning) => (
          <li key={warning.id}>
            <span className="font-semibold">{warning.label}:</span>{" "}
            {warning.detail}
          </li>
        ))}
      </ul>
    </div>
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
