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
        "rounded-lg border border-[#e2e5e9] bg-white px-4 py-3 sm:px-5",
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
              <span className="inline-flex min-h-7 items-center rounded-md border border-[#d1d5db] bg-[#f8fafc] px-2.5 py-1 text-[12px] font-semibold text-[#4b5563]">
                {nextActionLabel}
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[#171717]">
              {title}
            </h2>
            {description ? (
              <div className="mt-1 max-w-3xl text-[13px] leading-5 text-[#4b5563]">
                {description}
              </div>
            ) : null}
          </div>
          {meta ? <div className="text-[12px] text-[#6b7280]">{meta}</div> : null}
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
