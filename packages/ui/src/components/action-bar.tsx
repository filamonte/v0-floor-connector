import type { ReactNode } from "react";

import {
  getStatusToneClassName,
  type StatusTone
} from "../status";

type ActionBarTone = Exclude<StatusTone, "info">;

export type ActionBarProps = {
  title: string;
  description?: ReactNode;
  statusLabel?: string;
  statusTone?: ActionBarTone;
  nextActionLabel?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function ActionBar({
  title,
  description,
  statusLabel,
  statusTone = "neutral",
  nextActionLabel,
  primaryAction,
  secondaryActions,
  meta,
  className
}: ActionBarProps) {
  return (
    <section
      aria-label="Current state and next action"
      className={[
        "rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 sm:px-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {statusLabel ? (
              <span
                className={[
                  "inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-[12px] font-semibold",
                  getStatusToneClassName(statusTone)
                ].join(" ")}
              >
                {statusLabel}
              </span>
            ) : null}
            {nextActionLabel ? (
              <span className="inline-flex min-h-7 items-center rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-2.5 py-1 text-[12px] font-semibold text-[var(--text-secondary)]">
                {nextActionLabel}
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[var(--text-primary)]">
              {title}
            </h2>
            {description ? (
              <div className="mt-1 max-w-3xl text-[13px] leading-5 text-[var(--text-secondary)]">
                {description}
              </div>
            ) : null}
          </div>
          {meta ? <div className="text-[12px] text-[var(--text-secondary)]">{meta}</div> : null}
        </div>

        {primaryAction || secondaryActions ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {secondaryActions}
            {primaryAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}
