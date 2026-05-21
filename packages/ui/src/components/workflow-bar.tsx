import type { ReactNode } from "react";

import {
  getStatusConnectorClassName,
  getStatusToneClassName,
  type StatusTone
} from "../status";

export type WorkflowStepState = "complete" | "current" | "next" | "blocked" | "upcoming";

export type WorkflowStep = {
  id: string;
  label: string;
  description?: ReactNode;
  state: WorkflowStepState;
};

export type WorkflowBarProps = {
  steps: WorkflowStep[];
  title?: string;
  className?: string;
};

const stepStateTones: Record<WorkflowStepState, StatusTone> = {
  complete: "success",
  current: "info",
  next: "warning",
  blocked: "danger",
  upcoming: "neutral"
};

export function WorkflowBar({
  steps,
  title = "Workflow",
  className
}: WorkflowBarProps) {
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
        <ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="min-w-0">
              <div className="flex items-start gap-2">
                <span
                  className={[
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold",
                    getStatusToneClassName(stepStateTones[step.state])
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-5 text-[var(--text-primary)]">
                    {step.label}
                  </p>
                  {step.description ? (
                    <div className="mt-0.5 text-[12px] leading-4 text-[var(--text-secondary)]">
                      {step.description}
                    </div>
                  ) : null}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={[
                    "ml-3.5 mt-2 hidden h-px md:block",
                    getStatusConnectorClassName(stepStateTones[step.state])
                  ].join(" ")}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
