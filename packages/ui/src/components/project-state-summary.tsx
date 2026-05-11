import type { ReactNode } from "react";

import {
  getStatusToneClassName,
  type StatusTone
} from "../status";

type ProjectStateTone = "complete" | "active" | "needsAction" | "blocked" | "pending";

export type ProjectStateItem = {
  id: string;
  label: string;
  value: ReactNode;
  tone?: ProjectStateTone;
  detail?: ReactNode;
};

export type ProjectStateSummaryProps = {
  title?: string;
  items: ProjectStateItem[];
  className?: string;
};

const projectStateToneMap: Record<ProjectStateTone, StatusTone> = {
  complete: "success",
  active: "info",
  needsAction: "warning",
  blocked: "danger",
  pending: "neutral"
};

export function ProjectStateSummary({
  title = "Project state",
  items,
  className
}: ProjectStateSummaryProps) {
  return (
    <section
      aria-label={title}
      className={[
        "rounded-lg border border-[var(--border-warm)] bg-white px-4 py-3 sm:px-5",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">{title}</h2>
        <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={[
                "min-w-0 rounded-lg border px-3 py-2",
                getStatusToneClassName(projectStateToneMap[item.tone ?? "pending"])
              ].join(" ")}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                {item.label}
              </dt>
              <dd className="mt-1 text-[14px] font-semibold leading-5">
                {item.value}
              </dd>
              {item.detail ? (
                <dd className="mt-1 text-[12px] leading-4 opacity-90">{item.detail}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
