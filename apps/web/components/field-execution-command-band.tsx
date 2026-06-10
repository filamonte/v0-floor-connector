import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@floorconnector/ui";

type FieldExecutionCommandItem = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
};

type FieldExecutionCommandBandProps = {
  eyebrow?: string;
  title: string;
  description: string;
  statusLabel: string;
  projectHref: string;
  projectLabel?: string;
  jobHref?: string;
  jobLabel?: string;
  items: FieldExecutionCommandItem[];
};

export const fieldExecutionHeaderShellClassName =
  "overflow-hidden rounded-lg border border-[var(--border-warm)] bg-white shadow-[0_18px_44px_-38px_rgba(31,41,55,0.48)]";

export function FieldExecutionCommandBand({
  eyebrow = "Field execution",
  title,
  description,
  statusLabel,
  projectHref,
  projectLabel = "Project Workspace",
  jobHref,
  jobLabel = "Job Workspace",
  items
}: FieldExecutionCommandBandProps) {
  return (
    <section
      aria-labelledby="field-execution-command-title"
      className="mt-4 overflow-hidden rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] shadow-[0_14px_36px_-34px_rgba(31,41,55,0.42)]"
    >
      <div className="flex flex-col gap-4 px-4 py-3 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--copper)]">
            {eyebrow}
          </p>
          <h2
            id="field-execution-command-title"
            className="mt-1 text-base font-semibold tracking-tight text-[var(--text-primary)]"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <StatusBadge status={statusLabel}>{statusLabel}</StatusBadge>
          <Link
            href={projectHref}
            className="inline-flex items-center rounded-md border border-[var(--copper)] bg-[var(--copper)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--copper-light)]"
          >
            {projectLabel}
          </Link>
          {jobHref ? (
            <Link
              href={jobHref}
              className="inline-flex items-center rounded-md border border-[var(--border-warm)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--text-primary)]"
            >
              {jobLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-px border-t border-[var(--border-warm)] bg-[var(--border-warm)] md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--copper)]">
              {item.label}
            </p>
            <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {item.value}
            </div>
            {item.detail ? (
              <div className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">
                {item.detail}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
