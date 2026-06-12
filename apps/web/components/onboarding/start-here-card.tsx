"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type StartHereStep = {
  key: string;
  label: string;
  description: string;
  href: string;
  actionLabel: string;
  complete: boolean;
};

const storageKey = "floorconnector.startHere.dismissed";

export function StartHereCard({
  steps,
  forceVisible = false
}: {
  steps: StartHereStep[];
  forceVisible?: boolean;
}) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(window.localStorage.getItem(storageKey) === "true");
  }, []);

  const incompleteSteps = steps.filter((step) => !step.complete);
  const nextStep = incompleteSteps[0] ?? (forceVisible ? steps[0] : null);

  if ((!forceVisible && hidden) || !nextStep) {
    return null;
  }

  const shouldEmphasizeFirstStep = forceVisible && nextStep.key === "project";

  return (
    <section
      className={[
        "rounded-[4px] bg-white",
        shouldEmphasizeFirstStep
          ? "border-2 border-[#005eb8] shadow-none"
          : "border border-[#d1d5db]"
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 border-b border-[#27272a] bg-[#09090b] px-4 py-4 text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fc7ff]">
            Start here
          </p>
          <h3 className="mt-1 text-[17px] font-semibold tracking-tight">
            {shouldEmphasizeFirstStep
              ? "Create your first project"
              : nextStep.key === "estimate"
                ? "Create your first estimate"
                : "Start with the connected workflow"}
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/68">
            {forceVisible && incompleteSteps.length === 0
              ? "Fresh QA view is showing the onboarding prompts without changing tenant data."
              : nextStep.key === "estimate"
                ? "You have a project. Build the first estimate next so the workflow can move toward a contract."
                : "Create a project, build an estimate, and generate a contract from the same record chain."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={nextStep.href}
            className="inline-flex items-center justify-center rounded-[4px] border border-[#005eb8] bg-[#005eb8] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#004f9e] hover:bg-[#004f9e]"
          >
            {nextStep.actionLabel}
          </Link>
          {!forceVisible ? (
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(storageKey, "true");
                setHidden(true);
              }}
              className="inline-flex items-center justify-center rounded-[4px] border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Hide this
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-px bg-[#e2e5e9] md:grid-cols-4">
        {steps.map((step, index) => (
          <Link
            key={step.key}
            href={step.href}
            className="bg-white px-4 py-3 transition hover:bg-[#f8fafc]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#171717]">
                {index + 1}. {step.label}
              </p>
              <span
                className={[
                  "shrink-0 rounded-[3px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  step.complete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#c7d2e2] bg-[#eef6ff] text-[#003d7c]"
                ].join(" ")}
              >
                {step.complete ? "Done" : "Next"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {step.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
