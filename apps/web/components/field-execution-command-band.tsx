import Link from "next/link";
import type { ReactNode } from "react";

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
      className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[var(--graphite-dark)] text-white"
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--copper-light)]">
            {eyebrow}
          </p>
          <h2
            id="field-execution-command-title"
            className="mt-1 text-lg font-semibold tracking-tight text-white"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/72">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className="inline-flex items-center rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/82">
            {statusLabel}
          </span>
          <Link
            href={projectHref}
            className="inline-flex items-center rounded-md border border-[var(--copper)] bg-[var(--copper)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--copper-light)]"
          >
            {projectLabel}
          </Link>
          {jobHref ? (
            <Link
              href={jobHref}
              className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/78 transition hover:border-[var(--copper)] hover:text-white"
            >
              {jobLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
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
